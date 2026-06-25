import { and, asc, count, desc, eq, ilike, inArray, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { assets, generationJobs, generationOutputs, jobEvents } from '$lib/server/db/schema';
import { ensureWallet, reserveCredits } from '$lib/server/credits';
import { publishJobEvent } from './events';
import { storageProvider } from '$lib/server/storage';
import type { GenerationProviderId, GenerationTool } from '$lib/server/providers';
import { creditsPerOutput, reservedCredits as calculateReservedCredits } from '$lib/jobs/policy';

export interface CreateJobInput {
	tool: GenerationTool;
	provider: GenerationProviderId;
	prompt?: string;
	count: number;
	aspectRatio: string;
	sourceAssetId?: string;
	templateId?: string;
	parameters?: Record<string, unknown>;
}

export interface ListJobsForUserInput {
	tool?: GenerationTool;
	keyword?: string;
	page?: number;
	pageSize?: number;
	sort?: 'latest' | 'oldest';
}

export async function createJob(userId: string, input: CreateJobInput) {
	await ensureWallet(userId);
	if (input.sourceAssetId) {
		const source = await db.query.assets.findFirst({
			where: and(
				eq(assets.id, input.sourceAssetId),
				eq(assets.userId, userId),
				isNull(assets.deletedAt)
			)
		});
		if (!source) throw new Error('SOURCE_ASSET_NOT_FOUND');
	}
	const { count: totalCount, credits: reservedCredits } = calculateReservedCredits(
		input.tool,
		input.count
	);
	const [job] = await db
		.insert(generationJobs)
		.values({
			userId,
			tool: input.tool,
			provider: input.provider,
			prompt: input.prompt,
			totalCount,
			sourceAssetId: input.sourceAssetId,
			reservedCredits,
			parameters: {
				aspectRatio: input.aspectRatio,
				templateId: input.templateId,
				...input.parameters
			}
		})
		.returning();

	try {
		await reserveCredits(userId, reservedCredits, `${job.id}:0`);
	} catch (error) {
		await db.delete(generationJobs).where(eq(generationJobs.id, job.id));
		throw error;
	}

	await publishJobEvent(job.id, 'job.status', {
		status: 'queued',
		stage: 'queued',
		progress: 0,
		message: '任务已进入队列',
		completedCount: 0,
		totalCount
	});
	return job;
}

export { creditsPerOutput };

export async function getJobForUser(jobId: string, userId: string, isAdmin = false) {
	const job = await db.query.generationJobs.findFirst({
		where: isAdmin
			? eq(generationJobs.id, jobId)
			: and(eq(generationJobs.id, jobId), eq(generationJobs.userId, userId))
	});
	if (!job) return null;
	const outputRows = await db
		.select({ output: generationOutputs, asset: assets })
		.from(generationOutputs)
		.innerJoin(assets, eq(generationOutputs.assetId, assets.id))
		.where(eq(generationOutputs.jobId, jobId));
	const outputs = await Promise.all(
		outputRows.map(async ({ output, asset }) => ({
			id: output.id,
			position: output.position,
			assetId: asset.id,
			mimeType: asset.mimeType,
			url: await storageProvider.presignDownload(asset.objectKey)
		}))
	);
	return { ...job, outputs };
}

export async function listJobsForUser(userId: string, input: number | ListJobsForUserInput = 30) {
	const options = typeof input === 'number' ? { pageSize: input } : input;
	const page = Math.max(1, options.page ?? 1);
	const pageSize = Math.max(1, Math.min(options.pageSize ?? 30, 100));
	const filters = [
		eq(generationJobs.userId, userId),
		options.tool ? eq(generationJobs.tool, options.tool) : undefined,
		options.keyword ? ilike(generationJobs.prompt, `%${options.keyword}%`) : undefined
	].filter(Boolean);
	const where = and(...filters);
	const [{ total }] = await db.select({ total: count() }).from(generationJobs).where(where);
	const jobs = await db
		.select()
		.from(generationJobs)
		.where(where)
		.orderBy(
			options.sort === 'oldest' ? asc(generationJobs.createdAt) : desc(generationJobs.createdAt)
		)
		.limit(pageSize)
		.offset((page - 1) * pageSize);
	const items = await Promise.all(jobs.map((job) => getJobForUser(job.id, userId)));
	return Object.assign(items, { total, page, pageSize });
}

export async function retryJob(jobId: string, userId: string, isAdmin = false) {
	const job = await getJobForUser(jobId, userId, isAdmin);
	if (!job || !['failed', 'partial'].includes(job.status)) return null;
	const nextRetryCount = job.retryCount + 1;
	const remainingCredits = (job.totalCount - job.completedCount) * creditsPerOutput(job.tool);
	await reserveCredits(job.userId, remainingCredits, `${jobId}:${nextRetryCount}`);
	const [updated] = await db
		.update(generationJobs)
		.set({
			status: 'queued',
			stage: 'queued',
			progress: 0,
			errorCode: null,
			errorMessage: null,
			reservedCredits: remainingCredits,
			retryCount: nextRetryCount,
			finishedAt: null,
			updatedAt: new Date()
		})
		.where(eq(generationJobs.id, jobId))
		.returning();
	await publishJobEvent(jobId, 'job.status', {
		status: 'queued',
		stage: 'queued',
		progress: 0,
		message: '任务已重新进入队列'
	});
	return updated;
}

export async function deleteAssetForUser(assetId: string, userId: string) {
	const asset = await db.query.assets.findFirst({
		where: and(eq(assets.id, assetId), eq(assets.userId, userId))
	});
	if (!asset) return false;
	await storageProvider.deleteObject(asset.objectKey);
	await db.update(assets).set({ deletedAt: new Date() }).where(eq(assets.id, asset.id));
	return true;
}

export async function removeOldJobEvents(jobIds: string[]) {
	if (!jobIds.length) return;
	await db.delete(jobEvents).where(inArray(jobEvents.jobId, jobIds));
}
