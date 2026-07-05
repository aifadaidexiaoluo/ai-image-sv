export const allowedImageContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const maxUploadImageBytes = 10 * 1024 * 1024;

const contentTypeAliases: Record<string, string> = {
	'image/jpg': 'image/jpeg',
	'image/pjpeg': 'image/jpeg',
	'image/x-png': 'image/png',
	'image/x-webp': 'image/webp'
};

const extensionContentTypes: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp'
};

export function normalizeImageContentType(
	fileName: string | undefined,
	contentType: string | undefined
) {
	const normalized = String(contentType ?? '')
		.trim()
		.toLowerCase();
	const aliased = contentTypeAliases[normalized] ?? normalized;
	if (allowedImageContentTypes.has(aliased)) return aliased;

	const extension = String(fileName ?? '')
		.split('.')
		.pop()
		?.toLowerCase();
	return extension ? extensionContentTypes[extension] : undefined;
}

export function extensionForImageContentType(contentType: string) {
	if (contentType === 'image/jpeg') return 'jpg';
	return contentType.split('/')[1] ?? 'png';
}

export function validateUploadImageFile(file: File) {
	const contentType = normalizeImageContentType(file.name, file.type);
	if (!contentType) return { message: '仅支持 JPG、PNG 和 WebP 图片' };
	if (file.size <= 0 || file.size > maxUploadImageBytes) {
		return { message: '图片大小不能超过 10 MB' };
	}
	return { contentType };
}
