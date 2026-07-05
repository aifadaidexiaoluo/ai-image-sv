import type { Actions, PageServerLoad } from './$types';
import {
	adjustAdminCredits,
	banAdminUser,
	listAdminUsers,
	updateAdminUserRole
} from '$lib/server/admin/users';

export const load: PageServerLoad = async ({ url }) =>
	listAdminUsers({
		keyword: url.searchParams.get('keyword') ?? undefined,
		role: url.searchParams.get('role') ?? undefined,
		banned: url.searchParams.get('banned') ?? undefined,
		sort: url.searchParams.get('sort') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});

export const actions: Actions = {
	adjustCredits: async ({ locals, request }) => {
		const form = await request.formData();
		return adjustAdminCredits(
			locals.user!.id,
			String(form.get('userId') ?? ''),
			Number(form.get('amount') ?? 0)
		);
	},
	updateRole: async ({ locals, request }) => {
		const form = await request.formData();
		return updateAdminUserRole(
			locals.user!.id,
			String(form.get('userId') ?? ''),
			String(form.get('role') ?? 'user')
		);
	},
	banUser: async ({ locals, request }) => {
		const form = await request.formData();
		return banAdminUser(locals.user!.id, String(form.get('userId') ?? ''), {
			banned: true,
			reason: String(form.get('reason') ?? '管理员操作')
		});
	},
	unbanUser: async ({ locals, request }) => {
		const form = await request.formData();
		return banAdminUser(locals.user!.id, String(form.get('userId') ?? ''), { banned: false });
	}
};
