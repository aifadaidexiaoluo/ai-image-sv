import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { assetColorOptions, assetStyleOptions } from '$lib/app-catalog';
import { db } from '$lib/server/db';
import { assets, assetTags } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

const assetKinds = new Set<string>(['source', 'output', 'thumbnail', 'template']);
const formats = new Set(['png', 'jpg', 'webp']);
const ratios = new Set(['square', 'portrait', 'landscape', 'unknown']);
const sortOptions = new Set(['latest', 'oldest', 'name']);
const pageSizes = new Set([12, 24, 48]);
const allowedStyles = new Set<string>(assetStyleOptions.map((item) => item.value));
const allowedColors = new Set<string>(assetColorOptions.map((item) => item.value));

export function positiveInteger(value: string | number | null | undefined, fallback: number) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function pageSize(value: string | null) {
	const requested = positiveInteger(value, 12);
	return pageSizes.has(requested) ? requested : 12;
}

function ratioLabel(width: number | null, height: number | null) {
	if (!width || !height) return 'unknown';
	if (Math.abs(width / height - 1) <= 0.02) return 'square';
	return width > height ? 'landscape' : 'portrait';
}

function formatLabel(mimeType: string) {
	if (mimeType.includes('png')) return 'PNG';
	if (mimeType.includes('webp')) return 'WEBP';
	return 'JPG';
}

function formatFilter(format: string | null) {
	if (format === 'png') return eq(assets.mimeType, 'image/png');
	if (format === 'webp') return eq(assets.mimeType, 'image/webp');
	if (format === 'jpg') return inArray(assets.mimeType, ['image/jpeg', 'image/jpg']);
	return undefined;
}

function ratioFilter(ratio: string | null) {
	if (ratio === 'square') {
		return sql`${assets.width} is not null and ${assets.height} is not null and abs((${assets.width})::numeric / nullif(${assets.height}, 0) - 1) <= 0.02`;
	}
	if (ratio === 'portrait') {
		return sql`${assets.width} is not null and ${assets.height} is not null and ${assets.width} < ${assets.height}`;
	}
	if (ratio === 'landscape') {
		return sql`${assets.width} is not null and ${assets.height} is not null and ${assets.width} > ${assets.height}`;
	}
	if (ratio === 'unknown') return or(isNull(assets.width), isNull(assets.height));
	return undefined;
}

function tagExists(userId: string, tag: string) {
	return sql`exists (
		select 1 from ${assetTags}
		where ${assetTags.assetId} = ${assets.id}
		and ${assetTags.userId} = ${userId}
		and lower(${assetTags.tag}) = lower(${tag})
	)`;
}

function keywordExists(userId: string, keyword: string) {
	return sql`exists (
		select 1 from ${assetTags}
		where ${assetTags.assetId} = ${assets.id}
		and ${assetTags.userId} = ${userId}
		and ${assetTags.tag} ilike ${`%${keyword}%`}
	)`;
}

export async function listAssetsForUser(userId: string, searchParams: URLSearchParams) {
	const kind = searchParams.get('kind');
	const favorite = searchParams.get('favorite') === 'true';
	const format = searchParams.get('format');
	const ratio = searchParams.get('ratio');
	const style = searchParams.get('style');
	const color = searchParams.get('color')?.toLowerCase() ?? '';
	const tag = searchParams.get('tag')?.trim() ?? '';
	const keyword = searchParams.get('keyword')?.trim() ?? '';
	const sort = sortOptions.has(searchParams.get('sort') ?? '')
		? (searchParams.get('sort') as 'latest' | 'oldest' | 'name')
		: 'latest';
	const size = pageSize(searchParams.get('pageSize'));
	const requestedPage = positiveInteger(searchParams.get('page'), 1);

	const filters = [
		eq(assets.userId, userId),
		isNull(assets.deletedAt),
		kind && assetKinds.has(kind)
			? eq(assets.kind, kind as 'source' | 'output' | 'thumbnail' | 'template')
			: undefined,
		favorite ? eq(assets.favorite, true) : undefined,
		format && formats.has(format) ? formatFilter(format) : undefined,
		ratio && ratios.has(ratio) ? ratioFilter(ratio) : undefined,
		style && allowedStyles.has(style) ? eq(assets.style, style) : undefined,
		color && allowedColors.has(color) ? eq(assets.color, color) : undefined,
		tag ? tagExists(userId, tag) : undefined,
		keyword
			? or(
					ilike(assets.displayName, `%${keyword}%`),
					ilike(assets.fileName, `%${keyword}%`),
					keywordExists(userId, keyword)
				)
			: undefined
	].filter(Boolean);
	const where = and(...filters);

	const [{ total }] = await db.select({ total: count() }).from(assets).where(where);
	const totalPages = Math.max(1, Math.ceil(total / size));
	const page = Math.min(requestedPage, totalPages);
	const order =
		sort === 'oldest'
			? asc(assets.createdAt)
			: sort === 'name'
				? asc(assets.displayName)
				: desc(assets.createdAt);
	const rows = await db
		.select()
		.from(assets)
		.where(where)
		.orderBy(order)
		.limit(size)
		.offset((page - 1) * size);

	const ids = rows.map((asset) => asset.id);
	const tagRows = ids.length
		? await db
				.select()
				.from(assetTags)
				.where(and(eq(assetTags.userId, userId), inArray(assetTags.assetId, ids)))
				.orderBy(asc(assetTags.tag))
		: [];
	const tagsByAsset = new Map<string, string[]>();
	for (const item of tagRows) {
		tagsByAsset.set(item.assetId, [...(tagsByAsset.get(item.assetId) ?? []), item.tag]);
	}

	const allRows = await db
		.select({
			kind: assets.kind,
			favorite: assets.favorite,
			mimeType: assets.mimeType
		})
		.from(assets)
		.where(and(eq(assets.userId, userId), isNull(assets.deletedAt)));
	const counts = {
		all: allRows.length,
		source: allRows.filter((asset) => asset.kind === 'source').length,
		output: allRows.filter((asset) => asset.kind === 'output').length,
		thumbnail: allRows.filter((asset) => asset.kind === 'thumbnail').length,
		template: allRows.filter((asset) => asset.kind === 'template').length,
		favorite: allRows.filter((asset) => asset.favorite).length,
		png: allRows.filter((asset) => asset.mimeType.includes('png')).length,
		jpg: allRows.filter(
			(asset) => asset.mimeType.includes('jpeg') || asset.mimeType.includes('jpg')
		).length,
		webp: allRows.filter((asset) => asset.mimeType.includes('webp')).length
	};
	const availableTags = await db
		.select({ tag: assetTags.tag, total: count() })
		.from(assetTags)
		.innerJoin(assets, eq(assetTags.assetId, assets.id))
		.where(and(eq(assetTags.userId, userId), eq(assets.userId, userId), isNull(assets.deletedAt)))
		.groupBy(assetTags.tag)
		.orderBy(desc(count()))
		.limit(30);

	return {
		items: await Promise.all(
			rows.map(async (asset) => ({
				...asset,
				url: await storageProvider.presignDownload(asset.objectKey),
				tags: tagsByAsset.get(asset.id) ?? [],
				format: formatLabel(asset.mimeType),
				ratio: ratioLabel(asset.width, asset.height)
			}))
		),
		total,
		page,
		pageSize: size,
		totalPages,
		counts,
		availableTags,
		filters: {
			kind: kind && assetKinds.has(kind) ? kind : 'all',
			keyword,
			favorite,
			format: format && formats.has(format) ? format : 'all',
			ratio: ratio && ratios.has(ratio) ? ratio : 'all',
			style: style && allowedStyles.has(style) ? style : 'all',
			color: color && allowedColors.has(color) ? color : 'all',
			tag,
			sort
		}
	};
}
