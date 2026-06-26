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
	version?: string;
}

const runtimeKey = '__designaiGenerationQueueRuntime';
const runtimeVersion = import.meta.env.DEV ? `dev:${Date.now()}` : 'production';
const globalRuntime = globalThis as typeof globalThis & {
	__designaiGenerationQueueRuntime?: GenerationQueueRuntime;
};

function getRuntime() {
	globalRuntime[runtimeKey] ??= { started: false };
	return globalRuntime[runtimeKey];
}

export function startGenerationQueueRuntime() {
	const runtime = getRuntime();
	if (runtime.started && runtime.version === runtimeVersion) return runtime.worker;
	if (runtime.started && runtime.worker) {
		console.info('[jobs:queue] Restarting BullMQ generation worker for updated runtime');
		void runtime.worker.close().catch((error) => {
			console.error('[jobs:queue] Failed to close previous worker', error);
		});
		runtime.started = false;
		runtime.worker = undefined;
	}

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
	runtime.version = runtimeVersion;
	console.info('[jobs:queue] BullMQ generation worker started');
	return worker;
}
