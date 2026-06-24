import { and, desc, eq, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
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
