import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	creditTransactions,
	creditWallets,
	orders,
	prices,
	products,
	subscriptions
} from '$lib/server/db/schema';

export class PaymentSettlementError extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
		this.name = 'PaymentSettlementError';
	}
}

export async function loadOrderWithProduct(orderId: string) {
	const [item] = await db
		.select({ order: orders, price: prices, product: products })
		.from(orders)
		.innerJoin(prices, eq(orders.priceId, prices.id))
		.innerJoin(products, eq(prices.productId, products.id))
		.where(eq(orders.id, orderId))
		.limit(1);

	return item ?? null;
}

export async function settlePaidOrder(orderId: string, providerTradeId: string) {
	return db.transaction(async (tx) => {
		const [item] = await tx
			.select({ order: orders, price: prices, product: products })
			.from(orders)
			.innerJoin(prices, eq(orders.priceId, prices.id))
			.innerJoin(products, eq(prices.productId, products.id))
			.where(eq(orders.id, orderId))
			.limit(1);

		if (!item) throw new PaymentSettlementError('ORDER_NOT_FOUND', 404);
		if (item.order.status === 'paid') return { order: item.order, settled: false };
		if (item.order.status !== 'pending') {
			throw new PaymentSettlementError('ORDER_NOT_SETTLEABLE', 409);
		}

		const [updatedOrder] = await tx
			.update(orders)
			.set({
				status: 'paid',
				providerOrderId: providerTradeId,
				updatedAt: new Date()
			})
			.where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
			.returning();

		if (!updatedOrder) return { order: item.order, settled: false };

		await tx.insert(creditWallets).values({ userId: item.order.userId }).onConflictDoNothing();

		const creditType = item.product.type === 'subscription' ? 'subscription' : 'purchase';
		const existingCredit = await tx.query.creditTransactions.findFirst({
			where: and(
				eq(creditTransactions.userId, item.order.userId),
				eq(creditTransactions.type, creditType),
				eq(creditTransactions.referenceId, item.order.id)
			)
		});

		const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		if (!existingCredit) {
			const [wallet] = await tx
				.update(creditWallets)
				.set({
					balance: sql`${creditWallets.balance} + ${item.product.credits}`,
					updatedAt: new Date()
				})
				.where(eq(creditWallets.userId, item.order.userId))
				.returning();

			await tx.insert(creditTransactions).values({
				userId: item.order.userId,
				type: creditType,
				amount: item.product.credits,
				balanceAfter: wallet.balance,
				referenceType: creditType,
				referenceId: item.order.id,
				description: `支付宝购买 ${item.product.name}`,
				expiresAt: item.product.type === 'subscription' ? periodEnd : undefined
			});
		}

		if (item.product.type === 'subscription') {
			const existingSubscription = await tx.query.subscriptions.findFirst({
				where: eq(subscriptions.providerSubscriptionId, item.order.id)
			});

			if (!existingSubscription) {
				await tx.insert(subscriptions).values({
					userId: item.order.userId,
					productId: item.product.id,
					currentPeriodStart: new Date(),
					currentPeriodEnd: periodEnd,
					providerSubscriptionId: item.order.id
				});
			}
		}

		return { order: updatedOrder, settled: true };
	});
}
