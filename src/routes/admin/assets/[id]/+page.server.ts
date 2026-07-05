import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getAdminAssetDetail,
	restoreAdminAsset,
	softDeleteAdminAsset
} from '$lib/server/admin/assets';

export const load: PageServerLoad = async ({ params }) => {
	const detail = await getAdminAssetDetail(params.id);
	if (!detail) error(404, '素材不存在');
	return detail;
};

export const actions: Actions = {
	deleteAsset: async ({ locals, params }) => softDeleteAdminAsset(locals.user!.id, params.id),
	restoreAsset: async ({ locals, params }) => restoreAdminAsset(locals.user!.id, params.id)
};
