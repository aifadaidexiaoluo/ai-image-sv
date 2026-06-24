export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export interface AvatarFileType {
	contentType: 'image/jpeg' | 'image/png' | 'image/webp';
	extension: 'jpg' | 'png' | 'webp';
}

export function detectAvatarType(bytes: Uint8Array): AvatarFileType | null {
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return { contentType: 'image/jpeg', extension: 'jpg' };
	}
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return { contentType: 'image/png', extension: 'png' };
	}
	if (
		bytes.length >= 12 &&
		String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
		String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
	) {
		return { contentType: 'image/webp', extension: 'webp' };
	}
	return null;
}

export function validateAvatar(input: { declaredType: string; size: number; bytes: Uint8Array }) {
	if (input.size <= 0 || input.size > MAX_AVATAR_BYTES) return null;
	const detected = detectAvatarType(input.bytes);
	return detected?.contentType === input.declaredType ? detected : null;
}
