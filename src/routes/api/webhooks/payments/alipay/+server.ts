import { text } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orders, paymentEvents } from '$lib/server/db/schema';
import {
	alipayAmountToCents,
	getAlipayConfig,
	isSuccessfulAlipayTradeStatus,
	verifyAlipayNotify,
	type AlipayNotifyPayload
} from '$lib/server/billing/alipay';
import { PaymentSettlementError, settlePaidOrder } from '$lib/server/billing/orders';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function toPayload(formData: FormData) {
	const payload: AlipayNotifyPayload = {};
	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string') payload[key] = value;
	}
	return payload;
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = toPayload(await request.formData());
	const { appId } = getAlipayConfig();

	if (!verifyAlipayNotify(payload)) {
		console.warn('Rejected Alipay notify with invalid signature');
		return text('fail', { status: 400 });
	}

	if (payload.app_id !== appId || !payload.out_trade_no || !payload.trade_no) {
		return text('fail', { status: 400 });
	}

	const tradeStatus = payload.trade_status;
	const eventId = payload.notify_id ?? `${payload.trade_no}:${tradeStatus}`;

	await db
		.insert(paymentEvents)
		.values({
			provider: 'alipay',
			providerEventId: eventId,
			type: tradeStatus ?? 'unknown',
			payload,
			processedAt: new Date()
		})
		.onConflictDoNothing();

	if (!isSuccessfulAlipayTradeStatus(tradeStatus)) {
		return text('success');
	}

	const order = await db.query.orders.findFirst({
		where: eq(orders.id, payload.out_trade_no)
	});

	if (!order || order.provider !== 'alipay') {
		return text('fail', { status: 404 });
	}

	if (
		order.amount !== alipayAmountToCents(payload.total_amount ?? '') ||
		order.currency !== 'CNY'
	) {
		console.warn('Rejected Alipay notify with mismatched amount', {
			orderId: order.id,
			orderAmount: order.amount,
			notifyAmount: payload.total_amount
		});
		return text('fail', { status: 400 });
	}

	try {
		await settlePaidOrder(order.id, payload.trade_no);
		return text('success');
	} catch (cause) {
		if (cause instanceof PaymentSettlementError) {
			return text('fail', { status: cause.status });
		}
		console.error('Failed to settle Alipay order', cause);
		return text('fail', { status: 500 });
	}
};
