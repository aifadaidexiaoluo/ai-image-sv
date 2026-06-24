import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return new Response('请先登录', { status: 401 });

	const account = await db.query.user.findFirst({
		where: eq(user.id, locals.user.id),
		columns: { avatarObjectKey: true }
	});
	if (!account?.avatarObjectKey) return new Response(null, { status: 404 });

	try {
		const object = await storageProvider.readObject(account.avatarObjectKey);
		const body = object.bytes.buffer.slice(
			object.bytes.byteOffset,
			object.bytes.byteOffset + object.bytes.byteLength
		) as ArrayBuffer;
		return new Response(body, {
			headers: {
				'content-type': object.contentType,
				'content-length': String(object.bytes.byteLength),
				'cache-control': 'private, max-age=3600'
			}
		});
	} catch (error) {
		console.error('AVATAR_READ_FAILED', error);
		return new Response(null, { status: 404 });
	}
};
