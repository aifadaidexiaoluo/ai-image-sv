import { Worker } from 'bullmq';
import { claimQueuedJob, processJob } from './processor';
import {
	createRedisConnectionOptions,
	generationQueueName,
	type GenerationQueueData
} from './queue';

interface GenerationQueueRuntime {
	worker?: Worker<GenerationQueueData>;
	started: boolean;
}

const runtimeKey = '__designaiGenerationQueueRuntime';
const globalRuntime = globalThis as typeof globalThis & {
	__designaiGenerationQueueRuntime?: GenerationQueueRuntime;
};

function getRuntime() {
	globalRuntime[runtimeKey] ??= { started: false };
	return globalRuntime[runtimeKey];
}

export function startGenerationQueueRuntime() {
	const runtime = getRuntime();
	if (runtime.started) return runtime.worker;

	const concurrency = Math.max(1, Number(process.env.JOB_QUEUE_CONCURRENCY ?? 1));
	const worker = new Worker<GenerationQueueData>(
		generationQueueName,
		async (queueJob) => {
			const job = await claimQueuedJob(queueJob.data.jobId);
			if (!job) return;
			await processJob(job);
		},
		{
			connection: createRedisConnectionOptions({ maxRetriesPerRequest: null }),
			concurrency
		}
	);

	worker.on('failed', (job, error) => {
		console.error('[jobs:queue] BullMQ job failed', {
			id: job?.id,
			jobId: job?.data.jobId,
			error
		});
	});

	worker.on('error', (error) => {
		console.error('[jobs:queue] Worker error', error);
	});

	runtime.worker = worker;
	runtime.started = true;
	console.info('[jobs:queue] BullMQ generation worker started');
	return worker;
}
