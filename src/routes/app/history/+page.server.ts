import type { PageServerLoad } from './$types';
import { listJobsForUser } from '$lib/server/jobs/service';
import type { GenerationTool } from '$lib/server/providers';

const tools = new Set<GenerationTool>(['product', 'scene', 'remove-background']);

export const load: PageServerLoad = async ({ locals, url }) => {
	const tool = url.searchParams.get('tool');
	const page = Number(url.searchParams.get('page') ?? 1);
	const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
	const jobs = await listJobsForUser(locals.user!.id, {
		tool: tool && tools.has(tool as GenerationTool) ? (tool as GenerationTool) : undefined,
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
		filters: {
			tool: tool ?? 'all',
			keyword: url.searchParams.get('keyword') ?? '',
			sort: url.searchParams.get('sort') ?? 'latest'
		}
	};
};
