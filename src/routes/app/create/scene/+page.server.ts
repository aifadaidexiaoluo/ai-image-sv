import { and, desc, eq, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets, userSceneTemplates } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db
		.select({ template: userSceneTemplates, asset: assets })
		.from(userSceneTemplates)
		.innerJoin(assets, eq(userSceneTemplates.assetId, assets.id))
		.where(
			and(
				eq(userSceneTemplates.userId, locals.user!.id),
				eq(assets.userId, locals.user!.id),
				isNull(assets.deletedAt)
			)
		)
		.orderBy(desc(userSceneTemplates.createdAt))
		.limit(100);

	return {
		userSceneTemplates: await Promise.all(
			rows.map(async ({ template, asset }) => ({
				id: template.id,
				title: template.title,
				category: template.category,
				assetId: asset.id,
				image: await storageProvider.presignDownload(asset.objectKey),
				createdAt: template.createdAt.toISOString(),
				owner: 'user' as const
			}))
		)
	};
};
