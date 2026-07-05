import { error, redirect } from '@sveltejs/kit';
import { createAlipayCheckoutForm } from '$lib/server/billing/alipay';
import { loadOrderWithProduct } from '$lib/server/billing/orders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/login');

	const item = await loadOrderWithProduct(params.orderId);
	if (!item || item.order.userId !== locals.user.id) error(404, '订单不存在');
	if (item.order.status === 'paid') redirect(303, '/app/billing?paid=1');
	if (item.order.status === 'canceled') redirect(303, '/app/billing?canceled=1');
	if (item.order.status !== 'pending') error(409, '订单状态不可支付');

	try {
		return {
			order: item.order,
			price: item.price,
			product: item.product,
			formHtml: createAlipayCheckoutForm(item.order, item.product)
		};
	} catch (cause) {
		console.error('Failed to create Alipay checkout form', cause);
		error(500, '支付宝支付配置不可用');
	}
};
