import { asc, eq } from 'drizzle-orm';
import { client, db } from '$lib/server/db';
import { generationJobs, jobEvents } from '$lib/server/db/schema';

export interface JobEventPayload {
	stage?: string;
	status?: string;
	progress?: number | null;
	message?: string;
	completedCount?: number;
	totalCount?: number;
	output?: Record<string, unknown>;
	error?: { code: string; message: string; retryable: boolean };
}

export async function publishJobEvent(jobId: string, type: string, payload: JobEventPayload) {
	if (type === 'job.failed') {
		console.error('[jobs:event] Job failed event published', {
			jobId,
			status: payload.status,
			stage: payload.stage,
			completedCount: payload.completedCount,
			totalCount: payload.totalCount,
			message: payload.message,
			error: payload.error
		});
	}
	const [event] = await db
		.insert(jobEvents)
		.values({ jobId, type, payload: { ...payload } })
		.returning();
	await client.notify('designai_job_events', JSON.stringify({ jobId, eventId: event.id }));
	return event;
}

export async function updateJobProgress(
	jobId: string,
	input: {
		stage: typeof generationJobs.$inferInsert.stage;
		status?: typeof generationJobs.$inferInsert.status;
		progress?: number | null;
		message: string;
		completedCount?: number;
	}
) {
	const [job] = await db
		.update(generationJobs)
		.set({
			stage: input.stage,
			status: input.status ?? 'running',
			progress: input.progress,
			completedCount: input.completedCount,
			heartbeatAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(generationJobs.id, jobId))
		.returning();
	await publishJobEvent(jobId, 'job.progress', {
		stage: job.stage,
		status: job.status,
		progress: job.progress,
		message: input.message,
		completedCount: job.completedCount,
		totalCount: job.totalCount
	});
	return job;
}

export function listJobEvents(jobId: string, afterId = 0) {
	return db
		.select()
		.from(jobEvents)
		.where(eq(jobEvents.jobId, jobId))
		.orderBy(asc(jobEvents.id))
		.then((events) => events.filter((event) => event.id > afterId));
}
