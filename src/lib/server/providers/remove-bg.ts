import type { BackgroundRemovalProvider } from './types';

export class RemoveBgProvider implements BackgroundRemovalProvider {
	id = 'remove-bg';

	async removeBackground(source: { bytes: Uint8Array; mimeType: string }) {
		if (!process.env.REMOVE_BG_API_KEY) throw new Error('REMOVE_BG_NOT_CONFIGURED');
		const form = new FormData();
		form.set('size', 'auto');
		const bytes = source.bytes.buffer.slice(
			source.bytes.byteOffset,
			source.bytes.byteOffset + source.bytes.byteLength
		) as ArrayBuffer;
		form.set('image_file', new Blob([bytes], { type: source.mimeType }), 'source.png');
		const response = await fetch('https://api.remove.bg/v1.0/removebg', {
			method: 'POST',
			headers: { 'X-Api-Key': process.env.REMOVE_BG_API_KEY },
			body: form
		});
		if (!response.ok) throw new Error(`REMOVE_BG_${response.status}`);
		return { bytes: new Uint8Array(await response.arrayBuffer()), mimeType: 'image/png' };
	}
}
