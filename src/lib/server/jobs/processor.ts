import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { assets, generationJobs, generationOutputs } from '$lib/server/db/schema';
import { settleCredits } from '$lib/server/credits';
import { backgroundRemovalProvider, getImageProvider } from '$lib/server/providers';
import { storageProvider } from '$lib/server/storage';
import { creditsPerOutput } from './service';
import { publishJobEvent, updateJobProgress } from './events';
import { buildGenerationPrompt } from './prompt';

type Job = typeof generationJobs.$inferSelect;

function formatJobError(error: unknown) {
	if (!(error instanceof Error)) return { message: 'UNKNOWN_ERROR', raw: error };
	return {
		name: error.name,
		message: error.message,
		stack: error.stack,
		cause: error.cause
	};
}

async function loadSource(job: Job) {
	if (!job.sourceAssetId) return undefined;
	const asset = await db.query.assets.findFirst({ where: eq(assets.id, job.sourceAssetId) });
	if (!asset) throw new Error('SOURCE_ASSET_NOT_FOUND');
	const object = await storageProvider.readObject(asset.objectKey);
	const bytes = object.bytes;
	const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50;
	const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8;
	const isWebp =
		bytes.length > 12 &&
		new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
		new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
	if (!isPng && !isJpeg && !isWebp) throw new Error('UNSUPPORTED_SOURCE_IMAGE');
	return { bytes, mimeType: asset.mimeType };
}

async function saveOutput(
	job: Job,
	output: { bytes: Uint8Array; mimeType: string },
	position: number
) {
	const extension =
		output.mimeType === 'image/svg+xml' ? 'svg' : output.mimeType.includes('jpeg') ? 'jpg' : 'png';
	const objectKey = `users/${job.userId}/outputs/${job.id}/${position}.${extension}`;
	await storageProvider.putObject(objectKey, output.bytes, output.mimeType);
	const [asset] = await db
		.insert(assets)
		.values({
			userId: job.userId,
			kind: 'output',
			objectKey,
			fileName: `${job.tool}-${position + 1}.${extension}`,
			displayName: `${job.tool}-${position + 1}.${extension}`,
			mimeType: output.mimeType,
			sizeBytes: output.bytes.byteLength
		})
		.returning();
	await db.insert(generationOutputs).values({ jobId: job.id, assetId: asset.id, position });
	const url = await storageProvider.presignDownload(objectKey);
	await publishJobEvent(job.id, 'job.output', {
		completedCount: position + 1,
		totalCount: job.totalCount,
		message: `已完成 ${position + 1}/${job.totalCount}`,
		output: { id: asset.id, position, url, mimeType: output.mimeType }
	});
	return asset;
}

export async function claimQueuedJob(jobId: string) {
	const [job] = await db
		.update(generationJobs)
		.set({
			status: 'running',
			stage: 'validating',
			startedAt: new Date(),
			heartbeatAt: new Date(),
			updatedAt: new Date()
		})
		.where(and(eq(generationJobs.id, jobId), eq(generationJobs.status, 'queued')))
		.returning();
	return job ?? null;
}

export async function processJob(job: Job) {
	let completed = job.completedCount;
	const initiallyCompleted = completed;
	try {
		await updateJobProgress(job.id, {
			stage: 'validating',
			progress: 5,
			message: '正在校验任务参数'
		});
		const source = await loadSource(job);
		if ((job.tool === 'scene' || job.tool === 'remove-background') && !source) {
			throw new Error('SOURCE_IMAGE_REQUIRED');
		}
		await updateJobProgress(job.id, {
			stage: 'preparing',
			progress: 12,
			message: '正在准备图片和提示词'
		});
		await updateJobProgress(job.id, {
			stage: 'submitting',
			progress: 20,
			message: '正在提交图片服务'
		});
		await updateJobProgress(job.id, {
			stage: 'generating',
			progress: null,
			message: 'AI 正在处理图片'
		});

		const outputs =
			job.tool === 'remove-background'
				? [await backgroundRemovalProvider.removeBackground(source!)]
				: await getImageProvider(job.provider as 'auto' | 'openai' | 'tongyi').generate({
						tool: job.tool,
						prompt: buildGenerationPrompt({
							tool: job.tool,
							prompt: job.prompt,
							parameters: job.parameters
						}),
						count: job.totalCount,
						aspectRatio: String(job.parameters.aspectRatio ?? '1:1'),
						source
					});

		await updateJobProgress(job.id, {
			stage: 'downloading',
			progress: 82,
			message: '正在获取处理结果'
		});
		for (let index = completed; index < outputs.length; index += 1) {
			await updateJobProgress(job.id, {
				stage: 'postprocessing',
				progress: 88,
				completedCount: completed,
				message: `正在处理第 ${index + 1} 张图片`
			});
			await updateJobProgress(job.id, {
				stage: 'uploading',
				progress: 94,
				completedCount: completed,
				message: `正在保存第 ${index + 1} 张图片`
			});
			await saveOutput(job, outputs[index], index);
			completed += 1;
		}

		const status =
			completed === job.totalCount ? 'succeeded' : completed > 0 ? 'partial' : 'failed';
		const consumedCredits = completed * creditsPerOutput(job.tool);
		const cycleConsumedCredits = (completed - initiallyCompleted) * creditsPerOutput(job.tool);
		await settleCredits(
			job.userId,
			`${job.id}:${job.retryCount}`,
			job.reservedCredits,
			cycleConsumedCredits
		);
		await db
			.update(generationJobs)
			.set({
				status,
				stage: 'completed',
				progress: 100,
				completedCount: completed,
				consumedCredits,
				finishedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(generationJobs.id, job.id));
		await publishJobEvent(job.id, 'job.completed', {
			status,
			stage: 'completed',
			progress: 100,
			completedCount: completed,
			totalCount: job.totalCount,
			message: status === 'succeeded' ? '全部图片处理完成' : '部分图片处理完成'
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
		console.error('[jobs:processor] Job processing failed', {
			jobId: job.id,
			userId: job.userId,
			tool: job.tool,
			provider: job.provider,
			stage: job.stage,
			completedCount: completed,
			totalCount: job.totalCount,
			retryCount: job.retryCount,
			error: formatJobError(error)
		});
		const consumedCredits = completed * creditsPerOutput(job.tool);
		const cycleConsumedCredits = (completed - initiallyCompleted) * creditsPerOutput(job.tool);
		await settleCredits(
			job.userId,
			`${job.id}:${job.retryCount}`,
			job.reservedCredits,
			cycleConsumedCredits
		);
		await db
			.update(generationJobs)
			.set({
				status: completed > 0 ? 'partial' : 'failed',
				completedCount: completed,
				consumedCredits,
				errorCode: message.split(':')[0],
				errorMessage: message,
				finishedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(generationJobs.id, job.id));
		await publishJobEvent(job.id, 'job.failed', {
			status: completed > 0 ? 'partial' : 'failed',
			completedCount: completed,
			totalCount: job.totalCount,
			message: '图片处理失败，未完成部分已退回积分',
			error: { code: message.split(':')[0], message, retryable: true }
		});
	}
}
