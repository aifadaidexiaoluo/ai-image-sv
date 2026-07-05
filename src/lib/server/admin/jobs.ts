import { and, asc, count, desc, eq, ilike, isNull, or, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { settleCredits } from '$lib/server/credits';
import { db } from '$lib/server/db';
import { assets, generationJobs, generationOutputs, jobEvents, user } from '$lib/server/db/schema';
import { retryJob } from '$lib/server/jobs/service';
import { publishJobEvent } from '$lib/server/jobs/events';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

const statuses = new Set(['queued', 'running', 'succeeded', 'partial', 'failed', 'canceled']);
const tools = new Set(['product', 'scene', 'remove-background']);

export async function listAdminJobs(
	input: AdminListInput & { status?: string; tool?: string; userId?: string; sort?: string }
) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		isNull(generationJobs.deletedAt),
		input.status && statuses.has(input.status)
			? eq(generationJobs.status, input.status as never)
			: undefined,
		input.tool && tools.has(input.tool) ? eq(generationJobs.tool, input.tool as never) : undefined,
		input.userId ? eq(generationJobs.userId, input.userId) : undefined,
		keyword
			? or(
					ilike(generationJobs.prompt, `%${keyword}%`),
					ilike(generationJobs.errorMessage, `%${keyword}%`)
				)
			: undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const order =
		input.sort === 'oldest' ? asc(generationJobs.createdAt) : desc(generationJobs.createdAt);
	const [{ total }] = await db.select({ total: count() }).from(generationJobs).where(where);
	const rows = await db
		.select({ job: generationJobs, user })
		.from(generationJobs)
		.innerJoin(user, eq(generationJobs.userId, user.id))
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
			status: input.status ?? 'all',
			tool: input.tool ?? 'all',
			userId: input.userId ?? '',
			sort: input.sort ?? 'latest'
		}
	};
}

export async function getAdminJobDetail(jobId: string) {
	const [item] = await db
		.select({ job: generationJobs, user })
		.from(generationJobs)
		.innerJoin(user, eq(generationJobs.userId, user.id))
		.where(eq(generationJobs.id, jobId))
		.limit(1);
	if (!item) return null;
	const [outputs, events] = await Promise.all([
		db
			.select({ output: generationOutputs, asset: assets })
			.from(generationOutputs)
			.innerJoin(assets, eq(generationOutputs.assetId, assets.id))
			.where(eq(generationOutputs.jobId, jobId))
			.orderBy(asc(generationOutputs.position)),
		db
			.select()
			.from(jobEvents)
			.where(eq(jobEvents.jobId, jobId))
			.orderBy(desc(jobEvents.id))
			.limit(50)
	]);
	return { ...item, outputs, events };
}

export async function retryAdminJob(actorId: string, jobId: string) {
	const retried = await retryJob(jobId, actorId, true);
	if (!retried) return fail(409, { message: '任务不可重试' });
	await writeAuditLog(actorId, 'job.retry', 'job', jobId);
	return { success: true };
}

export async function cancelAdminJob(actorId: string, jobId: string) {
	const job = await db.query.generationJobs.findFirst({ where: eq(generationJobs.id, jobId) });
	if (!job) return fail(404, { message: '任务不存在' });
	if (!['queued', 'running'].includes(job.status)) return fail(409, { message: '任务不可取消' });
	await db
		.update(generationJobs)
		.set({
			status: 'canceled',
			stage: 'completed',
			progress: 100,
			errorCode: null,
			errorMessage: '管理员取消任务',
			finishedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(generationJobs.id, jobId));
	if (job.reservedCredits > 0) {
		await settleCredits(job.userId, `${jobId}:admin-cancel`, job.reservedCredits, 0);
	}
	await publishJobEvent(jobId, 'job.status', {
		status: 'canceled',
		stage: 'completed',
		progress: 100,
		message: '管理员取消任务'
	});
	await writeAuditLog(actorId, 'job.cancel', 'job', jobId, {
		userId: job.userId,
		reservedCredits: job.reservedCredits
	});
	return { success: true };
}

export async function softDeleteAdminJob(actorId: string, jobId: string) {
	const [updated] = await db
		.update(generationJobs)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(and(eq(generationJobs.id, jobId), isNull(generationJobs.deletedAt)))
		.returning({ id: generationJobs.id });
	if (!updated) return fail(404, { message: '任务不存在或已删除' });
	await writeAuditLog(actorId, 'job.delete', 'job', jobId);
	return { success: true };
}

export const adminJobStatuses = ['all', ...statuses];
export const adminJobTools = ['all', ...tools];
