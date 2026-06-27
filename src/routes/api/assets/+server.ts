import { json } from '@sveltejs/kit';
import { listAssetsForUser } from '$lib/server/assets/list';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	return json(await listAssetsForUser(locals.user.id, url.searchParams));
};
