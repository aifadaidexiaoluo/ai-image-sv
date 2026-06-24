import { count, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { auditLogs, generationJobs, orders, templates, user } from '$lib/server/db/schema';
import { adjustCredits } from '$lib/server/credits';
import { retryJob } from '$lib/server/jobs/service';

export const load: PageServerLoad = async () => {
	const [[usersCount], [jobsCount], [ordersCount], [templatesCount], users, jobs, recentOrders] =
		await Promise.all([
			db.select({ value: count() }).from(user),
			db.select({ value: count() }).from(generationJobs),
			db.select({ value: count() }).from(orders),
			db.select({ value: count() }).from(templates),
			db.select().from(user).orderBy(desc(user.createdAt)).limit(10),
			db.select().from(generationJobs).orderBy(desc(generationJobs.createdAt)).limit(10),
			db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10)
		]);
	return {
		counts: {
			users: usersCount.value,
			jobs: jobsCount.value,
			orders: ordersCount.value,
			templates: templatesCount.value
		},
		users,
		jobs,
		orders: recentOrders
	};
};

export const actions: Actions = {
	adjustCredits: async ({ locals, request }) => {
		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const amount = Number(form.get('amount') ?? 0);
		if (!userId || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10000) {
			return fail(400, { message: '积分调整参数无效' });
		}
		await adjustCredits(userId, amount, `${locals.user!.id}:${crypto.randomUUID()}`);
		await db.insert(auditLogs).values({
			actorId: locals.user!.id,
			action: 'credits.adjust',
			targetType: 'user',
			targetId: userId,
			metadata: { amount }
		});
		return { success: true };
	},
	retryJob: async ({ locals, request }) => {
		const form = await request.formData();
		const jobId = String(form.get('jobId') ?? '');
		const retried = await retryJob(jobId, locals.user!.id, true);
		if (!retried) return fail(409, { message: '任务不可重试' });
		await db.insert(auditLogs).values({
			actorId: locals.user!.id,
			action: 'job.retry',
			targetType: 'job',
			targetId: jobId
		});
		return { success: true };
	}
};
