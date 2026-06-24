import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { creditWallets, products, subscriptions } from '$lib/server/db/schema';
import type { AccountSummary, AccountUser } from '$lib/types/account';

export async function getAccountSummary(user: AccountUser): Promise<AccountSummary> {
	const [wallet, activeSubscription] = await Promise.all([
		db.query.creditWallets.findFirst({ where: eq(creditWallets.userId, user.id) }),
		db
			.select({ name: products.name })
			.from(subscriptions)
			.innerJoin(products, eq(subscriptions.productId, products.id))
			.where(
				and(
					eq(subscriptions.userId, user.id),
					eq(subscriptions.status, 'active'),
					gt(subscriptions.currentPeriodEnd, new Date())
				)
			)
			.orderBy(desc(subscriptions.currentPeriodEnd))
			.limit(1)
			.then((rows) => rows[0])
	]);

	return {
		user,
		balance: wallet?.balance ?? 0,
		planName: activeSubscription?.name ?? '免费版'
	};
}
