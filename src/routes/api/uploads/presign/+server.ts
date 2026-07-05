import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	allowedImageContentTypes,
	extensionForImageContentType,
	maxUploadImageBytes,
	normalizeImageContentType
} from '$lib/image-upload';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const input = (await request.json()) as {
		fileName?: string;
		contentType?: string;
		size?: number;
	};
	const contentType = normalizeImageContentType(input.fileName, input.contentType);
	if (!input.fileName || !contentType || !allowedImageContentTypes.has(contentType)) {
		return json({ message: '仅支持 JPG、PNG 和 WebP 图片' }, { status: 400 });
	}
	if (!input.size || input.size <= 0 || input.size > maxUploadImageBytes) {
		return json({ message: '图片大小不能超过 10 MB' }, { status: 400 });
	}
	const extension = extensionForImageContentType(contentType);
	const id = crypto.randomUUID();
	const objectKey = `users/${locals.user.id}/sources/${id}.${extension}`;
	const fileName = input.fileName.slice(0, 180);
	const [asset] = await db
		.insert(assets)
		.values({
			id,
			userId: locals.user.id,
			kind: 'source',
			objectKey,
			fileName,
			displayName: fileName,
			mimeType: contentType,
			sizeBytes: input.size,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		})
		.returning();
	return json({
		assetId: asset.id,
		method: 'PUT',
		url: await storageProvider.presignUpload({ objectKey, contentType }),
		headers: { 'content-type': contentType },
		expiresIn: 900
	});
};
