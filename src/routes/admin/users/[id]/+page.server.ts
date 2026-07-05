import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	adjustAdminCredits,
	banAdminUser,
	getAdminUserDetail,
	updateAdminUserRole
} from '$lib/server/admin/users';

export const load: PageServerLoad = async ({ params }) => {
	const detail = await getAdminUserDetail(params.id);
	if (!detail) error(404, '用户不存在');
	return detail;
};

export const actions: Actions = {
	adjustCredits: async ({ locals, params, request }) => {
		const form = await request.formData();
		return adjustAdminCredits(locals.user!.id, params.id, Number(form.get('amount') ?? 0));
	},
	updateRole: async ({ locals, params, request }) => {
		const form = await request.formData();
		return updateAdminUserRole(locals.user!.id, params.id, String(form.get('role') ?? 'user'));
	},
	banUser: async ({ locals, params, request }) => {
		const form = await request.formData();
		return banAdminUser(locals.user!.id, params.id, {
			banned: true,
			reason: String(form.get('reason') ?? '管理员操作')
		});
	},
	unbanUser: async ({ locals, params }) =>
		banAdminUser(locals.user!.id, params.id, { banned: false })
};
