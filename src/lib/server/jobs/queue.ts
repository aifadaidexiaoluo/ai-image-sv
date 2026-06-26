import { Queue, type RedisOptions } from 'bullmq';

export interface GenerationQueueData {
	jobId: string;
}

export const generationQueueName = 'designai-generation';

const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

export function createRedisConnectionOptions(options: RedisOptions = {}): RedisOptions {
	const url = new URL(redisUrl);
	return {
		host: url.hostname,
		port: Number(url.port || 6379),
		username: url.username ? decodeURIComponent(url.username) : undefined,
		password: url.password ? decodeURIComponent(url.password) : undefined,
		db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
		tls: url.protocol === 'rediss:' ? {} : undefined,
		...options
	};
}

let generationQueue: Queue<GenerationQueueData> | undefined;

export function getGenerationQueue() {
	generationQueue ??= new Queue<GenerationQueueData>(generationQueueName, {
		connection: createRedisConnectionOptions({
			maxRetriesPerRequest: 1
		}),
		defaultJobOptions: {
			attempts: 3,
			backoff: {
				type: 'fixed',
				delay: 5000
			},
			removeOnComplete: {
				age: 24 * 60 * 60,
				count: 1000
			},
			removeOnFail: {
				age: 7 * 24 * 60 * 60,
				count: 5000
			}
		}
	});
	return generationQueue!;
}

export async function enqueueGenerationJob(jobId: string, retryCount: number) {
	return getGenerationQueue().add(
		'generation',
		{ jobId },
		{
			jobId: `${jobId}-${retryCount}`
		}
	);
}
