import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { assets, assetTags, generationJobs, generationOutputs, user } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

const kinds = new Set(['source', 'output', 'thumbnail', 'template']);

export async function listAdminAssets(
	input: AdminListInput & { kind?: string; deleted?: string; userId?: string; sort?: string }
) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		input.deleted === 'true'
			? isNotNull(assets.deletedAt)
			: input.deleted === 'all'
				? undefined
				: isNull(assets.deletedAt),
		input.kind && kinds.has(input.kind) ? eq(assets.kind, input.kind as never) : undefined,
		input.userId ? eq(assets.userId, input.userId) : undefined,
		keyword
			? or(
					ilike(assets.displayName, `%${keyword}%`),
					ilike(assets.fileName, `%${keyword}%`),
					ilike(assets.objectKey, `%${keyword}%`)
				)
			: undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const order = input.sort === 'oldest' ? asc(assets.createdAt) : desc(assets.createdAt);
	const [{ total }] = await db.select({ total: count() }).from(assets).where(where);
	const rows = await db
		.select({ asset: assets, user })
		.from(assets)
		.leftJoin(user, eq(assets.userId, user.id))
		.where(where)
		.orderBy(order)
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
		filters: {
			keyword: keyword ?? '',
			kind: input.kind ?? 'all',
			deleted: input.deleted ?? 'false',
			userId: input.userId ?? '',
			sort: input.sort ?? 'latest'
		}
	};
}

export async function getAdminAssetDetail(assetId: string) {
	const [item] = await db
		.select({ asset: assets, user })
		.from(assets)
		.leftJoin(user, eq(assets.userId, user.id))
		.where(eq(assets.id, assetId))
		.limit(1);
	if (!item) return null;
	const [tags, jobs] = await Promise.all([
		db.select().from(assetTags).where(eq(assetTags.assetId, assetId)).orderBy(asc(assetTags.tag)),
		db
			.select({ job: generationJobs, output: generationOutputs })
			.from(generationOutputs)
			.innerJoin(generationJobs, eq(generationOutputs.jobId, generationJobs.id))
			.where(eq(generationOutputs.assetId, assetId))
			.orderBy(desc(generationJobs.createdAt))
			.limit(20)
	]);
	return {
		...item,
		url: await storageProvider.presignDownload(item.asset.objectKey),
		tags,
		jobs
	};
}

export async function softDeleteAdminAsset(actorId: string, assetId: string) {
	const [updated] = await db
		.update(assets)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(assets.id, assetId))
		.returning({ id: assets.id, userId: assets.userId });
	if (!updated) return fail(404, { message: '素材不存在' });
	await writeAuditLog(actorId, 'asset.delete', 'asset', assetId, { userId: updated.userId });
	return { success: true };
}

export async function restoreAdminAsset(actorId: string, assetId: string) {
	const [updated] = await db
		.update(assets)
		.set({ deletedAt: null, updatedAt: new Date() })
		.where(eq(assets.id, assetId))
		.returning({ id: assets.id, userId: assets.userId });
	if (!updated) return fail(404, { message: '素材不存在' });
	await writeAuditLog(actorId, 'asset.restore', 'asset', assetId, { userId: updated.userId });
	return { success: true };
}

export const adminAssetKinds = ['all', ...kinds];
