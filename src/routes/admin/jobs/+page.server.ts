import type { Actions, PageServerLoad } from './$types';
import {
	cancelAdminJob,
	listAdminJobs,
	retryAdminJob,
	softDeleteAdminJob
} from '$lib/server/admin/jobs';

export const load: PageServerLoad = async ({ url }) =>
	listAdminJobs({
		keyword: url.searchParams.get('keyword') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		tool: url.searchParams.get('tool') ?? undefined,
		userId: url.searchParams.get('userId') ?? undefined,
		sort: url.searchParams.get('sort') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});

export const actions: Actions = {
	retryJob: async ({ locals, request }) => {
		const form = await request.formData();
		return retryAdminJob(locals.user!.id, String(form.get('jobId') ?? ''));
	},
	cancelJob: async ({ locals, request }) => {
		const form = await request.formData();
		return cancelAdminJob(locals.user!.id, String(form.get('jobId') ?? ''));
	},
	deleteJob: async ({ locals, request }) => {
		const form = await request.formData();
		return softDeleteAdminJob(locals.user!.id, String(form.get('jobId') ?? ''));
	}
};
