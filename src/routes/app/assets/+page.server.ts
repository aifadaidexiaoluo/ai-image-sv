import { and, eq, inArray, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import {
	normalizeAssetColor,
	normalizeAssetName,
	normalizeAssetStyle,
	normalizeAssetTags
} from '$lib/server/assets/metadata';
import { listAssetsForUser } from '$lib/server/assets/list';
import { db } from '$lib/server/db';
import { assets, assetTags } from '$lib/server/db/schema';
import { deleteAssetForUser } from '$lib/server/jobs/service';
import type { Actions, PageServerLoad } from './$types';

function selectedIds(form: FormData) {
	const raw = String(form.get('ids') ?? '');
	return raw
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean)
		.slice(0, 100);
}

export const load: PageServerLoad = async ({ locals, url }) => {
	return listAssetsForUser(locals.user!.id, url.searchParams);
};

export const actions: Actions = {
	toggleFavorite: async ({ locals, request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const asset = await db.query.assets.findFirst({
			where: and(eq(assets.id, id), eq(assets.userId, locals.user!.id), isNull(assets.deletedAt))
		});
		if (!asset) return fail(404, { message: '素材不存在' });
		await db
			.update(assets)
			.set({ favorite: !asset.favorite, updatedAt: new Date() })
			.where(eq(assets.id, asset.id));
		return { success: true };
	},
	deleteAsset: async ({ locals, request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: '缺少素材信息' });
		const deleted = await deleteAssetForUser(id, locals.user!.id);
		if (!deleted) return fail(404, { message: '素材不存在' });
		return { success: true };
	},
	updateMetadata: async ({ locals, request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const asset = await db.query.assets.findFirst({
			where: and(eq(assets.id, id), eq(assets.userId, locals.user!.id), isNull(assets.deletedAt))
		});
		if (!asset) return fail(404, { message: '素材不存在' });

		const displayName = normalizeAssetName(form.get('displayName'), asset.fileName);
		const style = normalizeAssetStyle(form.get('style'));
		const color = normalizeAssetColor(form.get('color'));
		const tags = normalizeAssetTags(form.get('tags'));

		await db.transaction(async (tx) => {
			await tx
				.update(assets)
				.set({ displayName, style, color, updatedAt: new Date() })
				.where(eq(assets.id, asset.id));
			await tx.delete(assetTags).where(eq(assetTags.assetId, asset.id));
			if (tags.length) {
				await tx.insert(assetTags).values(
					tags.map((tag) => ({
						assetId: asset.id,
						userId: locals.user!.id,
						tag
					}))
				);
			}
		});

		return { success: true };
	},
	bulkFavorite: async ({ locals, request }) => {
		const form = await request.formData();
		const ids = selectedIds(form);
		if (!ids.length) return fail(400, { message: '请选择素材' });
		await db
			.update(assets)
			.set({ favorite: true, updatedAt: new Date() })
			.where(
				and(eq(assets.userId, locals.user!.id), isNull(assets.deletedAt), inArray(assets.id, ids))
			);
		return { success: true };
	},
	bulkDelete: async ({ locals, request }) => {
		const form = await request.formData();
		const ids = selectedIds(form);
		if (!ids.length) return fail(400, { message: '请选择素材' });

		let deleted = 0;
		for (const id of ids) {
			if (await deleteAssetForUser(id, locals.user!.id)) deleted += 1;
		}

		return { success: true, deleted };
	}
};
