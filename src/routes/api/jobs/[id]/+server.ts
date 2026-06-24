import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJobForUser } from '$lib/server/jobs/service';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const job = await getJobForUser(params.id, locals.user.id, locals.user.role === 'admin');
	return job ? json({ job }) : json({ message: '任务不存在' }, { status: 404 });
};
