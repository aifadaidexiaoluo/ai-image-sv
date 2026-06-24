import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { retryJob } from '$lib/server/jobs/service';

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	try {
		const job = await retryJob(params.id, locals.user.id, locals.user.role === 'admin');
		return job ? json({ job }) : json({ message: '任务不可重试' }, { status: 409 });
	} catch (error) {
		if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
			return json({ message: '积分不足，无法重试任务' }, { status: 402 });
		}
		throw error;
	}
};
