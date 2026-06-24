import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { grantCredits } from '$lib/server/credits';
import { orders, prices, products, subscriptions } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

async function loadOrder(orderId: string, userId: string) {
	const [item] = await db
		.select({ order: orders, price: prices, product: products })
		.from(orders)
		.innerJoin(prices, eq(orders.priceId, prices.id))
		.innerJoin(products, eq(prices.productId, products.id))
		.where(eq(orders.id, orderId))
		.limit(1);
	return item?.order.userId === userId ? item : null;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/login');
	const item = await loadOrder(params.orderId, locals.user.id);
	if (!item) error(404, '订单不存在');
	return item;
};

export const actions: Actions = {
	confirm: async ({ locals, params }) => {
		if (!locals.user) redirect(302, '/login');
		const item = await loadOrder(params.orderId, locals.user.id);
		if (!item) return fail(404, { message: '订单不存在' });
		if (item.order.status === 'paid') redirect(303, '/app/billing?paid=1');
		await db
			.update(orders)
			.set({ status: 'paid', updatedAt: new Date() })
			.where(eq(orders.id, item.order.id));
		const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		await grantCredits(locals.user.id, item.product.credits, {
			type: item.product.type === 'subscription' ? 'subscription' : 'purchase',
			referenceId: item.order.id,
			description: `沙箱购买 ${item.product.name}`,
			expiresAt: item.product.type === 'subscription' ? periodEnd : undefined
		});
		if (item.product.type === 'subscription') {
			await db.insert(subscriptions).values({
				userId: locals.user.id,
				productId: item.product.id,
				currentPeriodStart: new Date(),
				currentPeriodEnd: periodEnd
			});
		}
		redirect(303, '/app/billing?paid=1');
	},
	cancel: async ({ params }) => {
		await db
			.update(orders)
			.set({ status: 'canceled', updatedAt: new Date() })
			.where(eq(orders.id, params.orderId));
		redirect(303, '/app/billing?canceled=1');
	}
};
