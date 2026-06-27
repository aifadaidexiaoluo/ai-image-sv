import { env } from '$env/dynamic/private';
import type { GeneratedImage, GenerationRequest, ImageGenerationProvider } from './types';
import { createProviderResponseError } from './errors';

export class TongyiImageProvider implements ImageGenerationProvider {
	id = 'tongyi' as const;

	async generate(request: GenerationRequest): Promise<GeneratedImage[]> {
		if (!env.DASHSCOPE_API_KEY) throw new Error('TONGYI_NOT_CONFIGURED');
		const response = await fetch(
			env.DASHSCOPE_IMAGE_ENDPOINT ??
				'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
			{
				method: 'POST',
				headers: {
					authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
					'content-type': 'application/json',
					'X-DashScope-Async': 'disable'
				},
				body: JSON.stringify({
					model: env.DASHSCOPE_IMAGE_MODEL ?? 'wanx-v1',
					input: { prompt: request.prompt },
					parameters: { n: request.count, size: '1024*1024' }
				})
			}
		);
		if (!response.ok) throw await createProviderResponseError('TONGYI', response);
		const payload = (await response.json()) as {
			output?: { results?: Array<{ url: string }> };
		};
		return Promise.all(
			(payload.output?.results ?? []).map(async ({ url }) => {
				const image = await fetch(url);
				return {
					bytes: new Uint8Array(await image.arrayBuffer()),
					mimeType: image.headers.get('content-type') ?? 'image/png'
				} satisfies GeneratedImage;
			})
		);
	}
}
