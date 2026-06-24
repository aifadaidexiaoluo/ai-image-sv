import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { getCatalog } from '$lib/server/billing/catalog';
import { db } from '$lib/server/db';
import { creditTransactions, orders, subscriptions } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => ({
	catalog: await getCatalog(),
	transactions: await db
		.select()
		.from(creditTransactions)
		.where(eq(creditTransactions.userId, locals.user!.id))
		.orderBy(desc(creditTransactions.createdAt))
		.limit(30),
	orders: await db
		.select()
		.from(orders)
		.where(eq(orders.userId, locals.user!.id))
		.orderBy(desc(orders.createdAt))
		.limit(20),
	subscriptions: await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.userId, locals.user!.id))
		.orderBy(desc(subscriptions.createdAt))
		.limit(5)
});
