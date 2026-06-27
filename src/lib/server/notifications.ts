import { and, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { creditTransactions, generationJobs, products, subscriptions } from '$lib/server/db/schema';
import type { AppNotification, NotificationTone } from '$lib/types/notifications';
import type { GenerationJobStatus, GenerationToolId } from '$lib/types/jobs';

const toolLabels: Record<GenerationToolId, string> = {
	product: '商品图生成',
	scene: '场景图编辑',
	'remove-background': '智能抠图'
};

const jobTone: Record<GenerationJobStatus, NotificationTone> = {
	queued: 'info',
	running: 'info',
	succeeded: 'success',
	partial: 'warning',
	failed: 'danger',
	canceled: 'warning'
};

const jobTitle: Record<GenerationJobStatus, string> = {
	queued: '任务已进入队列',
	running: '任务正在处理',
	succeeded: '任务已完成',
	partial: '任务部分完成',
	failed: '任务处理失败',
	canceled: '任务已取消'
};

function jobDescription(job: {
	tool: GenerationToolId;
	status: GenerationJobStatus;
	completedCount: number;
	totalCount: number;
	errorMessage: string | null;
}) {
	const label = toolLabels[job.tool];
	if (job.status === 'failed') return job.errorMessage ?? `${label}未能完成，请稍后重试。`;
	if (job.status === 'partial')
		return `${label}已完成 ${job.completedCount}/${job.totalCount} 张，可查看已生成结果。`;
	if (job.status === 'succeeded')
		return `${label}已生成 ${job.completedCount}/${job.totalCount} 张，作品已保存到历史记录。`;
	if (job.status === 'running') return `${label}正在生成中，完成后会出现在历史记录。`;
	if (job.status === 'queued') return `${label}正在排队，请稍候。`;
	return `${label}已取消，未完成部分不会继续处理。`;
}

export async function listAppNotifications(
	userId: string,
	wallet: { balance: number; updatedAt?: Date | null },
	planName: string
): Promise<AppNotification[]> {
	const [jobs, transactions, activeSubscription] = await Promise.all([
		db
			.select({
				id: generationJobs.id,
				tool: generationJobs.tool,
				status: generationJobs.status,
				completedCount: generationJobs.completedCount,
				totalCount: generationJobs.totalCount,
				errorMessage: generationJobs.errorMessage,
				createdAt: generationJobs.createdAt,
				updatedAt: generationJobs.updatedAt,
				finishedAt: generationJobs.finishedAt
			})
			.from(generationJobs)
			.where(and(eq(generationJobs.userId, userId), isNull(generationJobs.deletedAt)))
			.orderBy(desc(generationJobs.updatedAt))
			.limit(5),
		db
			.select({
				id: creditTransactions.id,
				type: creditTransactions.type,
				amount: creditTransactions.amount,
				description: creditTransactions.description,
				createdAt: creditTransactions.createdAt
			})
			.from(creditTransactions)
			.where(
				and(
					eq(creditTransactions.userId, userId),
					inArray(creditTransactions.type, [
						'grant',
						'purchase',
						'subscription',
						'refund',
						'adjustment'
					])
				)
			)
			.orderBy(desc(creditTransactions.createdAt))
			.limit(3),
		db
			.select({
				name: products.name,
				currentPeriodEnd: subscriptions.currentPeriodEnd,
				cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd
			})
			.from(subscriptions)
			.innerJoin(products, eq(subscriptions.productId, products.id))
			.where(
				and(
					eq(subscriptions.userId, userId),
					eq(subscriptions.status, 'active'),
					gt(subscriptions.currentPeriodEnd, new Date())
				)
			)
			.orderBy(desc(subscriptions.currentPeriodEnd))
			.limit(1)
			.then((rows) => rows[0])
	]);

	const notifications: AppNotification[] = jobs.map((job) => ({
		id: `job:${job.id}:${job.status}:${job.updatedAt.toISOString()}`,
		title: jobTitle[job.status],
		description: jobDescription(job),
		category: toolLabels[job.tool],
		tone: jobTone[job.status],
		createdAt: job.finishedAt ?? job.updatedAt ?? job.createdAt,
		href: '/app/history'
	}));

	for (const transaction of transactions) {
		if (transaction.amount === 0) continue;
		notifications.push({
			id: `credit:${transaction.id}`,
			title: transaction.amount > 0 ? '积分已到账' : '积分已变动',
			description: `${transaction.description}，当前记录 ${transaction.amount > 0 ? '+' : ''}${transaction.amount} 积分。`,
			category: '积分',
			tone: transaction.amount > 0 ? 'success' : 'info',
			createdAt: transaction.createdAt,
			href: '/app/billing'
		});
	}

	if (wallet.balance <= 5) {
		notifications.push({
			id: `wallet-low:${wallet.balance}`,
			title: '积分余额偏低',
			description: `当前剩余 ${wallet.balance} 积分，建议及时充值或升级套餐，避免生成任务中断。`,
			category: '积分',
			tone: 'warning',
			createdAt: wallet.updatedAt ?? new Date(),
			href: '/app/billing'
		});
	}

	if (activeSubscription?.cancelAtPeriodEnd) {
		notifications.push({
			id: `subscription-cancel:${activeSubscription.currentPeriodEnd.toISOString()}`,
			title: '套餐将在周期结束后停用',
			description: `${activeSubscription.name} 将在 ${activeSubscription.currentPeriodEnd.toLocaleDateString('zh-CN')} 到期后停用。`,
			category: '套餐',
			tone: 'warning',
			createdAt: activeSubscription.currentPeriodEnd,
			href: '/app/billing'
		});
	} else if (planName === '免费版') {
		notifications.push({
			id: 'plan:free',
			title: '免费版权益提醒',
			description: '升级套餐可获得更多积分、更高并发和高清导出权益。',
			category: '套餐',
			tone: 'info',
			createdAt: wallet.updatedAt ?? new Date(),
			href: '/app/billing'
		});
	}

	return notifications
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 8);
}
