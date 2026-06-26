import { assetColorOptions, assetStyleOptions } from '$lib/app-catalog';

const allowedStyles = new Set<string>(assetStyleOptions.map((item) => item.value));
const allowedColors = new Set<string>(assetColorOptions.map((item) => item.value));

export const assetUploadAllowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const assetUploadMaxBytes = 10 * 1024 * 1024;
export const assetMaxTags = 10;

export function normalizeAssetName(input: unknown, fallback: string) {
	const value = String(input ?? '').trim();
	const name = value || fallback.trim() || '未命名素材';
	return name.slice(0, 120);
}

export function normalizeAssetStyle(input: unknown) {
	const value = String(input ?? '').trim();
	return allowedStyles.has(value) ? value : null;
}

export function normalizeAssetColor(input: unknown) {
	const value = String(input ?? '')
		.trim()
		.toLowerCase();
	return allowedColors.has(value) ? value : null;
}

export function normalizeAssetTags(input: unknown) {
	const source = Array.isArray(input) ? input.join(',') : String(input ?? '');
	const seen = new Set<string>();
	const tags: string[] = [];

	for (const item of source.split(/[,，\n]/)) {
		const tag = item.trim().replace(/^#/, '').slice(0, 24);
		const key = tag.toLowerCase();
		if (!tag || seen.has(key)) continue;
		seen.add(key);
		tags.push(tag);
		if (tags.length >= assetMaxTags) break;
	}

	return tags;
}

export function normalizePositiveDimension(input: unknown) {
	const value = Number(input);
	return Number.isFinite(value) && value > 0 && value <= 20000 ? Math.round(value) : null;
}
