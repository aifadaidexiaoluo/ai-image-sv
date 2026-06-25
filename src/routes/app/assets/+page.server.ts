import { and, desc, eq, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db
		.select()
		.from(assets)
		.where(and(eq(assets.userId, locals.user!.id), isNull(assets.deletedAt)))
		.orderBy(desc(assets.createdAt))
		.limit(100);
	return {
		assets: await Promise.all(
			rows.map(async (asset) => ({
				...asset,
				url: await storageProvider.presignDownload(asset.objectKey)
			}))
		)
	};
};

export const actions: Actions = {
	toggleFavorite: async ({ locals, request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const asset = await db.query.assets.findFirst({
			where: and(eq(assets.id, id), eq(assets.userId, locals.user!.id), isNull(assets.deletedAt))
		});
		if (!asset) return fail(404, { message: '素材不存在' });
		await db.update(assets).set({ favorite: !asset.favorite }).where(eq(assets.id, asset.id));
		return { success: true };
	}
};
