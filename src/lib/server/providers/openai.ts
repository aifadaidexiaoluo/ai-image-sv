import { env } from '$env/dynamic/private';
import { createProviderResponseError } from './errors';
import type { GeneratedImage, GenerationRequest, ImageGenerationProvider } from './types';

const GPTSAPI_BASE_URL = 'https://api.gptsapi.net/api/v3';
const GPTSAPI_POLL_INTERVAL_MS = 2000;
const GPTSAPI_POLL_TIMEOUT_MS = 180000;

type GptsApiPredictionPayload = {
	code?: number;
	message?: string;
	data?: {
		id?: string;
		outputs?: string[];
		status?: string;
		error?: string | null;
		urls?: { get?: string };
	};
	urls?: { get?: string };
};

export class OpenAIImageProvider implements ImageGenerationProvider {
	id = 'openai' as const;

	async generate(request: GenerationRequest): Promise<GeneratedImage[]> {
		return this.generateWithGptsApi(request);
	}

	private async generateWithGptsApi(request: GenerationRequest): Promise<GeneratedImage[]> {
		if (!env.OPENAI_API_KEY) throw new Error('OPENAI_NOT_CONFIGURED');
		const jobs = Array.from({ length: request.count }, () => this.submitGptsApiJob(request));
		const imageUrls = (await Promise.all(jobs)).flat();
		return Promise.all(imageUrls.map((url) => this.downloadImage(url)));
	}

	private async submitGptsApiJob(request: GenerationRequest): Promise<string[]> {
		const sources = request.sources?.length
			? request.sources
			: request.source
				? [request.source]
				: [];
		if (sources.some((source) => !source.url)) throw new Error('OPENAI_SOURCE_URL_REQUIRED');
		const response = await fetch(
			`${GPTSAPI_BASE_URL}/openai/gpt-image-2/${sources.length ? 'image-edit' : 'text-to-image'}`,
			{
				method: 'POST',
				headers: {
					authorization: `Bearer ${env.OPENAI_API_KEY}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					prompt: request.prompt,
					aspect_ratio: this.toGptsApiAspectRatio(request.aspectRatio),
					resolution: this.toGptsApiResolution(request),
					...(sources.length
						? {
								input_urls: sources.map((source) => source.url)
							}
						: {})
				})
			}
		);
		if (!response.ok) throw await createProviderResponseError('OPENAI', response);
		const payload = (await response.json()) as GptsApiPredictionPayload;
		const resultUrl = payload.urls?.get ?? payload.data?.urls?.get;
		const resultId = payload.data?.id;
		if (!resultUrl && !resultId) throw new Error('OPENAI_EMPTY_PREDICTION');
		return this.pollGptsApiResult(
			resultUrl ?? `${GPTSAPI_BASE_URL}/predictions/${resultId}/result`
		);
	}

	private async pollGptsApiResult(resultUrl: string): Promise<string[]> {
		const deadline = Date.now() + GPTSAPI_POLL_TIMEOUT_MS;
		while (Date.now() < deadline) {
			const response = await fetch(resultUrl, {
				headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` }
			});
			if (!response.ok) throw await createProviderResponseError('OPENAI', response);
			const payload = (await response.json()) as GptsApiPredictionPayload;
			const status = payload.data?.status;
			if (status === 'completed') {
				const outputs = payload.data?.outputs ?? [];
				if (!outputs.length) throw new Error('OPENAI_EMPTY_OUTPUT');
				return outputs;
			}
			if (status === 'failed' || status === 'canceled') {
				throw new Error(payload.data?.error ?? `OPENAI_${status.toUpperCase()}`);
			}
			await new Promise((resolve) => setTimeout(resolve, GPTSAPI_POLL_INTERVAL_MS));
		}
		throw new Error('OPENAI_POLL_TIMEOUT');
	}

	private async downloadImage(url: string): Promise<GeneratedImage> {
		const image = await fetch(url);
		if (!image.ok) throw await createProviderResponseError('OPENAI_IMAGE', image);
		return {
			bytes: new Uint8Array(await image.arrayBuffer()),
			mimeType: image.headers.get('content-type') ?? 'image/png'
		};
	}

	private toGptsApiAspectRatio(aspectRatio: string) {
		if (['auto', '1:1', '9:16', '16:9', '4:3', '3:4'].includes(aspectRatio)) {
			return aspectRatio;
		}
		if (aspectRatio === '4:5') return '3:4';
		return '1:1';
	}

	private toGptsApiResolution(request: GenerationRequest) {
		const resolution = env.OPENAI_IMAGE_RESOLUTION;
		const normalized = resolution === '2K' || resolution === '4K' ? resolution : '1K';
		if (!request.source && !request.sources?.length) return normalized;
		const aspectRatio = this.toGptsApiAspectRatio(request.aspectRatio);
		if (aspectRatio === 'auto') return '1K';
		if (aspectRatio === '1:1' && normalized === '4K') return '2K';
		return normalized;
	}

	private async generateWithOpenAI(request: GenerationRequest): Promise<GeneratedImage[]> {
		if (!env.OPENAI_API_KEY) throw new Error('OPENAI_NOT_CONFIGURED');
		const baseUrl = env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
		const size =
			request.aspectRatio === '16:9'
				? '1536x1024'
				: request.aspectRatio === '4:5'
					? '1024x1536'
					: '1024x1024';
		let response: Response;
		if (request.source) {
			const form = new FormData();
			const sourceBytes = request.source.bytes.buffer.slice(
				request.source.bytes.byteOffset,
				request.source.bytes.byteOffset + request.source.bytes.byteLength
			) as ArrayBuffer;
			form.set('model', env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1');
			form.set('prompt', request.prompt);
			form.set('n', String(request.count));
			form.set('size', size);
			form.set('image', new Blob([sourceBytes], { type: request.source.mimeType }), 'source.png');
			response = await fetch(`${baseUrl}/images/edits`, {
				method: 'POST',
				headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
				body: form
			});
		} else {
			response = await fetch(`${baseUrl}/images/generations`, {
				method: 'POST',
				headers: {
					authorization: `Bearer ${env.OPENAI_API_KEY}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					model: env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
					prompt: request.prompt,
					n: request.count,
					size,
					output_format: 'png'
				})
			});
		}
		if (!response.ok) throw await createProviderResponseError('OPENAI', response);
		const payload = (await response.json()) as {
			data?: Array<{ b64_json?: string; url?: string }>;
		};
		return Promise.all(
			(payload.data ?? []).map(async (item) => {
				if (item.b64_json) {
					return {
						bytes: Uint8Array.from(Buffer.from(item.b64_json, 'base64')),
						mimeType: 'image/png'
					};
				}
				if (!item.url) throw new Error('OPENAI_EMPTY_OUTPUT');
				const image = await fetch(item.url);
				return { bytes: new Uint8Array(await image.arrayBuffer()), mimeType: 'image/png' };
			})
		);
	}
}
