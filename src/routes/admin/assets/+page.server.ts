import type { Actions, PageServerLoad } from './$types';
import { listAdminAssets, restoreAdminAsset, softDeleteAdminAsset } from '$lib/server/admin/assets';

export const load: PageServerLoad = async ({ url }) =>
	listAdminAssets({
		keyword: url.searchParams.get('keyword') ?? undefined,
		kind: url.searchParams.get('kind') ?? undefined,
		deleted: url.searchParams.get('deleted') ?? undefined,
		userId: url.searchParams.get('userId') ?? undefined,
		sort: url.searchParams.get('sort') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});

export const actions: Actions = {
	deleteAsset: async ({ locals, request }) => {
		const form = await request.formData();
		return softDeleteAdminAsset(locals.user!.id, String(form.get('assetId') ?? ''));
	},
	restoreAsset: async ({ locals, request }) => {
		const form = await request.formData();
		return restoreAdminAsset(locals.user!.id, String(form.get('assetId') ?? ''));
	}
};
