import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 10 * 1024 * 1024;

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const input = (await request.json()) as {
		fileName?: string;
		contentType?: string;
		size?: number;
	};
	if (!input.fileName || !input.contentType || !allowedTypes.has(input.contentType)) {
		return json({ message: '仅支持 JPG、PNG 和 WebP 图片' }, { status: 400 });
	}
	if (!input.size || input.size <= 0 || input.size > maxBytes) {
		return json({ message: '图片大小不能超过 10 MB' }, { status: 400 });
	}
	const extension = input.contentType === 'image/jpeg' ? 'jpg' : input.contentType.split('/')[1];
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
			mimeType: input.contentType,
			sizeBytes: input.size,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		})
		.returning();
	return json({
		assetId: asset.id,
		method: 'PUT',
		url: await storageProvider.presignUpload({ objectKey, contentType: input.contentType }),
		headers: { 'content-type': input.contentType },
		expiresIn: 900
	});
};
