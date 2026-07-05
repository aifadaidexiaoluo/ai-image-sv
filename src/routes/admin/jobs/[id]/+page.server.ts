import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	cancelAdminJob,
	getAdminJobDetail,
	retryAdminJob,
	softDeleteAdminJob
} from '$lib/server/admin/jobs';

export const load: PageServerLoad = async ({ params }) => {
	const detail = await getAdminJobDetail(params.id);
	if (!detail) error(404, '任务不存在');
	return detail;
};

export const actions: Actions = {
	retryJob: async ({ locals, params }) => retryAdminJob(locals.user!.id, params.id),
	cancelJob: async ({ locals, params }) => cancelAdminJob(locals.user!.id, params.id),
	deleteJob: async ({ locals, params }) => softDeleteAdminJob(locals.user!.id, params.id)
};
