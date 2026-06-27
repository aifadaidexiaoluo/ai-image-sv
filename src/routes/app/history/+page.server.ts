import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
	deleteJobForUser,
	deleteJobOutputAssetForUser,
	listJobsForUser
} from '$lib/server/jobs/service';
import type { GenerationTool } from '$lib/server/providers';
import type { Actions } from './$types';

const tools = new Set<GenerationTool>(['product', 'scene', 'remove-background']);

export const load: PageServerLoad = async ({ locals, url }) => {
	const tool = url.searchParams.get('tool');
	const normalizedTool =
		tool && tools.has(tool as GenerationTool) ? (tool as GenerationTool) : undefined;
	const page = Number(url.searchParams.get('page') ?? 1);
	const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
	const jobs = await listJobsForUser(locals.user!.id, {
		tool: normalizedTool,
		keyword: url.searchParams.get('keyword') ?? undefined,
		page,
		pageSize,
		sort: url.searchParams.get('sort') === 'oldest' ? 'oldest' : 'latest'
	});
	return {
		jobs: [...jobs],
		total: jobs.total,
		page: jobs.page,
		pageSize: jobs.pageSize,
		totalPages: jobs.totalPages,
		hasPreviousPage: jobs.hasPreviousPage,
		hasNextPage: jobs.hasNextPage,
		filters: {
			tool: normalizedTool ?? 'all',
			keyword: url.searchParams.get('keyword') ?? '',
			sort: url.searchParams.get('sort') ?? 'latest'
		}
	};
};

export const actions: Actions = {
	deleteJob: async ({ locals, request }) => {
		const form = await request.formData();
		const jobId = String(form.get('jobId') ?? '');

		if (!jobId) return fail(400, { message: '缺少任务信息' });

		const deleted = await deleteJobForUser(jobId, locals.user!.id);
		if (!deleted) return fail(404, { message: '任务不存在' });

		return { success: true };
	},
	deleteOutput: async ({ locals, request }) => {
		const form = await request.formData();
		const jobId = String(form.get('jobId') ?? '');
		const assetId = String(form.get('assetId') ?? '');

		if (!jobId || !assetId) return fail(400, { message: '缺少输出素材信息' });

		const deleted = await deleteJobOutputAssetForUser(jobId, assetId, locals.user!.id);
		if (!deleted) return fail(404, { message: '输出素材不存在' });

		return { success: true };
	}
};
