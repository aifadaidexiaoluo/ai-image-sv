import { and, eq, isNotNull, isNull, lt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { assets, jobEvents } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

export async function cleanupExpiredAssets() {
	await db.delete(jobEvents).where(lt(jobEvents.createdAt, new Date(Date.now() - 7 * 86400000)));
	const expired = await db
		.select()
		.from(assets)
		.where(
			and(isNotNull(assets.expiresAt), lt(assets.expiresAt, new Date()), isNull(assets.deletedAt))
		)
		.limit(100);
	for (const asset of expired) {
		try {
			await storageProvider.deleteObject(asset.objectKey);
			await db.update(assets).set({ deletedAt: new Date() }).where(eq(assets.id, asset.id));
		} catch (error) {
			console.error('[cleanup:asset]', asset.id, error);
		}
	}
}
