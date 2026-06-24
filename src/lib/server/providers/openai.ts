import type { GeneratedImage, GenerationRequest, ImageGenerationProvider } from './types';

export class OpenAIImageProvider implements ImageGenerationProvider {
	id = 'openai' as const;

	async generate(request: GenerationRequest): Promise<GeneratedImage[]> {
		if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_NOT_CONFIGURED');
		const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
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
			form.set('model', process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1');
			form.set('prompt', request.prompt);
			form.set('n', String(request.count));
			form.set('size', size);
			form.set('image', new Blob([sourceBytes], { type: request.source.mimeType }), 'source.png');
			response = await fetch(`${baseUrl}/images/edits`, {
				method: 'POST',
				headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
				body: form
			});
		} else {
			response = await fetch(`${baseUrl}/images/generations`, {
				method: 'POST',
				headers: {
					authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
					prompt: request.prompt,
					n: request.count,
					size,
					output_format: 'png'
				})
			});
		}
		if (!response.ok) throw new Error(`OPENAI_${response.status}`);
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
