import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { prices, products, orders } from '$lib/server/db/schema';
import { paymentProvider } from '$lib/server/billing/sandbox';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const { priceId, idempotencyKey } = (await request.json()) as {
		priceId?: string;
		idempotencyKey?: string;
	};
	if (!priceId || !idempotencyKey) return json({ message: '缺少商品参数' }, { status: 400 });
	const [item] = await db
		.select({ price: prices, product: products })
		.from(prices)
		.innerJoin(products, eq(prices.productId, products.id))
		.where(and(eq(prices.id, priceId), eq(prices.active, true), eq(products.active, true)))
		.limit(1);
	if (!item) return json({ message: '商品不存在或已下架' }, { status: 404 });
	const existing = await db.query.orders.findFirst({
		where: eq(orders.idempotencyKey, idempotencyKey)
	});
	const order =
		existing ??
		(
			await db
				.insert(orders)
				.values({
					userId: locals.user.id,
					priceId,
					amount: item.price.amount,
					currency: item.price.currency,
					idempotencyKey
				})
				.returning()
		)[0];
	return json({ order, ...(await paymentProvider.createCheckout(order.id)) });
};
