import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJobForUser } from '$lib/server/jobs/service';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const job = await getJobForUser(params.id, locals.user.id, locals.user.role === 'admin');
	if (job && ['failed', 'partial'].includes(job.status)) {
		console.error('[jobs:api] Returning failed job', {
			jobId: job.id,
			userId: job.userId,
			tool: job.tool,
			provider: job.provider,
			status: job.status,
			stage: job.stage,
			completedCount: job.completedCount,
			totalCount: job.totalCount,
			errorCode: job.errorCode,
			errorMessage: job.errorMessage
		});
	}
	return job ? json({ job }) : json({ message: '任务不存在' }, { status: 404 });
};
