import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	assetUploadAllowedTypes,
	assetUploadMaxBytes,
	normalizeAssetColor,
	normalizeAssetName,
	normalizeAssetStyle,
	normalizeAssetTags,
	normalizePositiveDimension
} from '$lib/server/assets/metadata';
import { db } from '$lib/server/db';
import { assets, assetTags } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });

	const input = (await request.json()) as {
		fileName?: string;
		displayName?: string;
		contentType?: string;
		size?: number;
		width?: number;
		height?: number;
		style?: string;
		color?: string;
		tags?: string | string[];
	};

	if (!input.fileName || !input.contentType || !assetUploadAllowedTypes.has(input.contentType)) {
		return json({ message: '仅支持 JPG、PNG 和 WebP 图片' }, { status: 400 });
	}
	if (!input.size || input.size <= 0 || input.size > assetUploadMaxBytes) {
		return json({ message: '图片大小不能超过 10 MB' }, { status: 400 });
	}

	const extension = input.contentType === 'image/jpeg' ? 'jpg' : input.contentType.split('/')[1];
	const id = crypto.randomUUID();
	const objectKey = `users/${locals.user.id}/assets/${id}.${extension}`;
	const fileName = input.fileName.slice(0, 180);
	const tags = normalizeAssetTags(input.tags);

	const asset = await db.transaction(async (tx) => {
		const [created] = await tx
			.insert(assets)
			.values({
				id,
				userId: locals.user!.id,
				kind: 'source',
				objectKey,
				fileName,
				displayName: normalizeAssetName(input.displayName, fileName),
				mimeType: input.contentType!,
				sizeBytes: input.size!,
				width: normalizePositiveDimension(input.width),
				height: normalizePositiveDimension(input.height),
				style: normalizeAssetStyle(input.style),
				color: normalizeAssetColor(input.color)
			})
			.returning();

		if (tags.length) {
			await tx.insert(assetTags).values(
				tags.map((tag) => ({
					assetId: created.id,
					userId: locals.user!.id,
					tag
				}))
			);
		}

		return created;
	});

	return json(
		{
			assetId: asset.id,
			method: 'PUT',
			url: await storageProvider.presignUpload({ objectKey, contentType: input.contentType }),
			headers: { 'content-type': input.contentType },
			expiresIn: 900
		},
		{ status: 201 }
	);
};
