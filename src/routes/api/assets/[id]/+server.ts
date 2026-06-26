import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteAssetForUser } from '$lib/server/jobs/service';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });

	const deleted = await deleteAssetForUser(params.id, locals.user.id);
	if (!deleted) return json({ message: '素材不存在' }, { status: 404 });

	return json({ success: true });
};
