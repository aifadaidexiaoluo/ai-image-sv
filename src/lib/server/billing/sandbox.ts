import { createHmac, timingSafeEqual } from 'node:crypto';

export interface PaymentProvider {
	createCheckout(orderId: string): Promise<{ url: string }>;
	verifyWebhook(body: string, signature: string): boolean;
}

class SandboxPaymentProvider implements PaymentProvider {
	async createCheckout(orderId: string) {
		return { url: `/checkout/sandbox/${orderId}` };
	}

	verifyWebhook(body: string, signature: string) {
		const expected = createHmac(
			'sha256',
			process.env.PAYMENT_WEBHOOK_SECRET ?? 'development-secret'
		)
			.update(body)
			.digest('hex');
		return (
			signature.length === expected.length &&
			timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
		);
	}
}

export const paymentProvider: PaymentProvider = new SandboxPaymentProvider();
