import type { Actions, PageServerLoad } from './$types';
import {
	listAdminTemplates,
	toggleAdminTemplate,
	upsertAdminTemplate
} from '$lib/server/admin/templates';

export const load: PageServerLoad = async ({ url }) =>
	listAdminTemplates({
		keyword: url.searchParams.get('keyword') ?? undefined,
		tool: url.searchParams.get('tool') ?? undefined,
		published: url.searchParams.get('published') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});

export const actions: Actions = {
	saveTemplate: async ({ locals, request }) =>
		upsertAdminTemplate(locals.user!.id, await request.formData()),
	publishTemplate: async ({ locals, request }) => {
		const form = await request.formData();
		return toggleAdminTemplate(locals.user!.id, String(form.get('id') ?? ''), true);
	},
	unpublishTemplate: async ({ locals, request }) => {
		const form = await request.formData();
		return toggleAdminTemplate(locals.user!.id, String(form.get('id') ?? ''), false);
	}
};
