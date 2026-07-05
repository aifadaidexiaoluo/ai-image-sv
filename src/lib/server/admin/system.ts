import { count, desc, inArray, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { assets, generationJobs, paymentEvents, user } from '$lib/server/db/schema';
import { getGenerationQueue } from '$lib/server/jobs/queue';

export async function getAdminSystemHealth() {
	const checks = {
		database: { ok: false, message: '未检查' },
		queue: { ok: false, message: '未检查', counts: null as null | Record<string, number> },
		storage: {
			ok: Boolean(env.MINIO_ENDPOINT),
			message: env.MINIO_ENDPOINT ? '已配置' : '未配置 MINIO_ENDPOINT'
		}
	};

	try {
		await db.select({ value: count() }).from(user).limit(1);
		checks.database = { ok: true, message: '连接正常' };
	} catch (error) {
		checks.database = {
			ok: false,
			message: error instanceof Error ? error.message : '数据库连接失败'
		};
	}

	try {
		const queue = getGenerationQueue();
		const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
		checks.queue = { ok: true, message: '队列可访问', counts };
	} catch (error) {
		checks.queue = {
			ok: false,
			message: error instanceof Error ? error.message : '队列不可访问',
			counts: null
		};
	}

	const [recentFailedJobs, recentAssets, recentPaymentEvents] = await Promise.all([
		db
			.select()
			.from(generationJobs)
			.where(inArray(generationJobs.status, ['failed', 'partial']))
			.orderBy(desc(generationJobs.updatedAt))
			.limit(10),
		db
			.select()
			.from(assets)
			.where(isNull(assets.deletedAt))
			.orderBy(desc(assets.createdAt))
			.limit(10),
		db.select().from(paymentEvents).orderBy(desc(paymentEvents.createdAt)).limit(10)
	]);

	return {
		checks,
		config: {
			nodeEnv: env.NODE_ENV ?? 'development',
			origin: env.ORIGIN ?? '',
			hasBetterAuthSecret: Boolean(env.BETTER_AUTH_SECRET),
			hasDatabaseUrl: Boolean(env.DATABASE_URL),
			hasRedisUrl: Boolean(env.REDIS_URL),
			hasStorageEndpoint: Boolean(env.MINIO_ENDPOINT)
		},
		recentFailedJobs,
		recentAssets,
		recentPaymentEvents
	};
}
