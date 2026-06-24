import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { paymentEvents } from '$lib/server/db/schema';
import { paymentProvider } from '$lib/server/billing/sandbox';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('x-designai-signature') ?? '';
	if (!paymentProvider.verifyWebhook(body, signature))
		return json({ message: '签名无效' }, { status: 401 });
	const payload = JSON.parse(body) as {
		id?: string;
		type?: string;
		data?: Record<string, unknown>;
	};
	if (!payload.id || !payload.type) return json({ message: '事件格式无效' }, { status: 400 });
	await db
		.insert(paymentEvents)
		.values({
			provider: 'sandbox',
			providerEventId: payload.id,
			type: payload.type,
			payload: payload.data ?? {},
			processedAt: new Date()
		})
		.onConflictDoNothing();
	return json({ received: true });
};
