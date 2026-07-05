import { AlipaySdk } from 'alipay-sdk';

type KeyType = 'PKCS1' | 'PKCS8';

export type AlipayCheckoutOrder = {
	id: string;
	amount: number;
	currency: string;
};

export type AlipayCheckoutProduct = {
	name: string;
	credits: number;
	type: string;
};

export type AlipayNotifyPayload = Record<string, string>;

export function alipayAmountToCents(value: string) {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return null;
	return Math.round(amount * 100);
}

export function isSuccessfulAlipayTradeStatus(status: string | undefined) {
	return status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED';
}

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is required for Alipay payments`);
	return value;
}

function normalizePem(value: string) {
	return value.replace(/\\n/g, '\n');
}

function getOrigin() {
	return process.env.ORIGIN ?? 'http://localhost:5173';
}

function getAlipaySdk() {
	const appId = requiredEnv('ALIPAY_APP_ID');
	const privateKey = normalizePem(requiredEnv('ALIPAY_PRIVATE_KEY'));
	const alipayPublicKey = normalizePem(requiredEnv('ALIPAY_PUBLIC_KEY'));
	const keyType = (process.env.ALIPAY_KEY_TYPE ?? 'PKCS8') as KeyType;

	return new AlipaySdk({
		appId,
		privateKey,
		alipayPublicKey,
		signType: 'RSA2',
		keyType,
		gateway: process.env.ALIPAY_GATEWAY || undefined
	});
}

export function getAlipayConfig() {
	const origin = getOrigin();
	return {
		appId: requiredEnv('ALIPAY_APP_ID'),
		notifyUrl: process.env.ALIPAY_NOTIFY_URL ?? `${origin}/api/webhooks/payments/alipay`,
		returnUrl: process.env.ALIPAY_RETURN_URL ?? `${origin}/checkout/alipay/return`
	};
}

export function createAlipayCheckoutForm(
	order: AlipayCheckoutOrder,
	product: AlipayCheckoutProduct
) {
	if (order.currency !== 'CNY') {
		throw new Error('ALIPAY_ONLY_SUPPORTS_CNY');
	}

	const { notifyUrl, returnUrl } = getAlipayConfig();

	return getAlipaySdk().pageExec('alipay.trade.page.pay', 'POST', {
		notifyUrl,
		returnUrl,
		bizContent: {
			outTradeNo: order.id,
			productCode: 'FAST_INSTANT_TRADE_PAY',
			subject: product.name,
			body: `${product.name} - ${product.credits} credits`,
			totalAmount: (order.amount / 100).toFixed(2)
		}
	});
}

export function verifyAlipayNotify(payload: AlipayNotifyPayload) {
	return getAlipaySdk().checkNotifySignV2(payload);
}

export function getAlipayCheckoutUrl(orderId: string) {
	return `/checkout/alipay/${orderId}`;
}
