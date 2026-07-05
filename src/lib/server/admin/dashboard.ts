import { and, count, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	assets,
	auditLogs,
	creditTransactions,
	creditWallets,
	generationJobs,
	orders,
	subscriptions,
	user
} from '$lib/server/db/schema';

function startOfDay(date: Date) {
	const value = new Date(date);
	value.setHours(0, 0, 0, 0);
	return value;
}

function addDays(date: Date, days: number) {
	const value = new Date(date);
	value.setDate(value.getDate() + days);
	return value;
}

function dateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function seedSeries(days = 14) {
	const today = startOfDay(new Date());
	return Array.from({ length: days }, (_, index) => {
		const date = addDays(today, index - days + 1);
		return { date: dateKey(date), label: `${date.getMonth() + 1}/${date.getDate()}` };
	});
}

export async function getAdminDashboardMetrics() {
	const today = startOfDay(new Date());
	const since = addDays(today, -13);

	const [
		[usersCount],
		[todayUsers],
		[bannedUsers],
		[jobsCount],
		[failedJobs],
		[assetsCount],
		[ordersRevenue],
		[activeSubscriptions],
		[walletTotals],
		users,
		failedJobRows,
		orderRows,
		auditRows,
		userSeriesRows,
		jobSeriesRows,
		toolRows,
		orderSeriesRows,
		creditSeriesRows
	] = await Promise.all([
		db.select({ value: count() }).from(user),
		db.select({ value: count() }).from(user).where(gte(user.createdAt, today)),
		db.select({ value: count() }).from(user).where(eq(user.banned, true)),
		db.select({ value: count() }).from(generationJobs).where(isNull(generationJobs.deletedAt)),
		db
			.select({ value: count() })
			.from(generationJobs)
			.where(
				and(inArray(generationJobs.status, ['failed', 'partial']), isNull(generationJobs.deletedAt))
			),
		db.select({ value: count() }).from(assets).where(isNull(assets.deletedAt)),
		db
			.select({ value: sql<number>`coalesce(sum(${orders.amount}), 0)` })
			.from(orders)
			.where(eq(orders.status, 'paid')),
		db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, 'active')),
		db
			.select({
				balance: sql<number>`coalesce(sum(${creditWallets.balance}), 0)`,
				reserved: sql<number>`coalesce(sum(${creditWallets.reserved}), 0)`
			})
			.from(creditWallets),
		db.select().from(user).orderBy(desc(user.createdAt)).limit(6),
		db
			.select()
			.from(generationJobs)
			.where(
				and(inArray(generationJobs.status, ['failed', 'partial']), isNull(generationJobs.deletedAt))
			)
			.orderBy(desc(generationJobs.updatedAt))
			.limit(6),
		db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
		db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(6),
		db
			.select({
				date: sql<string>`to_char(${user.createdAt}, 'YYYY-MM-DD')`,
				total: count()
			})
			.from(user)
			.where(gte(user.createdAt, since))
			.groupBy(sql`to_char(${user.createdAt}, 'YYYY-MM-DD')`),
		db
			.select({
				date: sql<string>`to_char(${generationJobs.createdAt}, 'YYYY-MM-DD')`,
				status: generationJobs.status,
				total: count()
			})
			.from(generationJobs)
			.where(and(gte(generationJobs.createdAt, since), isNull(generationJobs.deletedAt)))
			.groupBy(sql`to_char(${generationJobs.createdAt}, 'YYYY-MM-DD')`, generationJobs.status),
		db
			.select({ tool: generationJobs.tool, total: count() })
			.from(generationJobs)
			.where(isNull(generationJobs.deletedAt))
			.groupBy(generationJobs.tool),
		db
			.select({
				date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
				amount: sql<number>`coalesce(sum(${orders.amount}), 0)`
			})
			.from(orders)
			.where(and(gte(orders.createdAt, since), eq(orders.status, 'paid')))
			.groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`),
		db
			.select({
				date: sql<string>`to_char(${creditTransactions.createdAt}, 'YYYY-MM-DD')`,
				type: creditTransactions.type,
				amount: sql<number>`coalesce(sum(abs(${creditTransactions.amount})), 0)`
			})
			.from(creditTransactions)
			.where(gte(creditTransactions.createdAt, since))
			.groupBy(sql`to_char(${creditTransactions.createdAt}, 'YYYY-MM-DD')`, creditTransactions.type)
	]);

	const userMap = new Map(userSeriesRows.map((item) => [item.date, Number(item.total)]));
	const jobMap = new Map<string, { created: number; succeeded: number; failed: number }>();
	const orderMap = new Map(orderSeriesRows.map((item) => [item.date, Number(item.amount)]));
	const creditMap = new Map<string, { grant: number; consume: number }>();

	for (const row of jobSeriesRows) {
		const item = jobMap.get(row.date) ?? { created: 0, succeeded: 0, failed: 0 };
		item.created += Number(row.total);
		if (row.status === 'succeeded') item.succeeded += Number(row.total);
		if (row.status === 'failed' || row.status === 'partial') item.failed += Number(row.total);
		jobMap.set(row.date, item);
	}

	for (const row of creditSeriesRows) {
		const item = creditMap.get(row.date) ?? { grant: 0, consume: 0 };
		if (['grant', 'purchase', 'subscription', 'refund', 'adjustment'].includes(row.type)) {
			item.grant += Number(row.amount);
		}
		if (['reserve', 'consume'].includes(row.type)) item.consume += Number(row.amount);
		creditMap.set(row.date, item);
	}

	const dates = seedSeries();

	return {
		cards: {
			users: usersCount.value,
			todayUsers: todayUsers.value,
			bannedUsers: bannedUsers.value,
			jobs: jobsCount.value,
			failedJobs: failedJobs.value,
			assets: assetsCount.value,
			paidRevenue: Number(ordersRevenue.value ?? 0),
			activeSubscriptions: activeSubscriptions.value,
			walletBalance: Number(walletTotals.balance ?? 0),
			walletReserved: Number(walletTotals.reserved ?? 0)
		},
		charts: {
			users: dates.map((item) => ({ ...item, users: userMap.get(item.date) ?? 0 })),
			jobs: dates.map((item) => ({
				...item,
				created: jobMap.get(item.date)?.created ?? 0,
				succeeded: jobMap.get(item.date)?.succeeded ?? 0,
				failed: jobMap.get(item.date)?.failed ?? 0
			})),
			tools: ['product', 'scene', 'remove-background'].map((tool) => ({
				tool,
				label: tool === 'product' ? '商品图' : tool === 'scene' ? '场景图' : '智能抠图',
				value: Number(toolRows.find((row) => row.tool === tool)?.total ?? 0)
			})),
			orders: dates.map((item) => ({ ...item, amount: orderMap.get(item.date) ?? 0 })),
			credits: dates.map((item) => ({
				...item,
				grant: creditMap.get(item.date)?.grant ?? 0,
				consume: creditMap.get(item.date)?.consume ?? 0
			}))
		},
		recent: {
			users,
			failedJobs: failedJobRows,
			orders: orderRows,
			auditLogs: auditRows
		}
	};
}
