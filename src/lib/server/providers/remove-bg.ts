import { env } from '$env/dynamic/private';
import type { BackgroundRemovalProvider } from './types';
import { createProviderResponseError } from './errors';

export class RemoveBgProvider implements BackgroundRemovalProvider {
	id = 'remove-bg';

	async removeBackground(source: { bytes: Uint8Array; mimeType: string }) {
		if (!env.REMOVE_BG_API_KEY) throw new Error('REMOVE_BG_NOT_CONFIGURED');
		const imageBase64 = Buffer.from(source.bytes).toString('base64');
		const response = await fetch('https://api.zhuimengapi.com/api/v1/kotu', {
			method: 'POST',
			headers: {
				'X-API-Key': env.REMOVE_BG_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ image_base64: imageBase64 })
		});
		if (!response.ok) throw await createProviderResponseError('REMOVE_BG', response);
		const result = (await response.json()) as { success?: boolean; image_url?: string };
		if (!result.success || !result.image_url) throw new Error('REMOVE_BG_FAILED');

		const imageResponse = await fetch(result.image_url);
		if (!imageResponse.ok)
			throw await createProviderResponseError('REMOVE_BG_IMAGE', imageResponse);

		return {
			bytes: new Uint8Array(await imageResponse.arrayBuffer()),
			mimeType: imageResponse.headers.get('content-type') ?? 'image/png'
		};
	}
}
