import { describe, expect, test } from 'bun:test';
import { alipayAmountToCents, getAlipayCheckoutUrl, isSuccessfulAlipayTradeStatus } from './alipay';

describe('alipay billing helpers', () => {
	test('converts Alipay yuan amounts to cents', () => {
		expect(alipayAmountToCents('0.01')).toBe(1);
		expect(alipayAmountToCents('19.90')).toBe(1990);
		expect(alipayAmountToCents('129')).toBe(12900);
		expect(alipayAmountToCents('not-a-number')).toBe(null);
	});

	test('recognizes successful trade statuses', () => {
		expect(isSuccessfulAlipayTradeStatus('TRADE_SUCCESS')).toBe(true);
		expect(isSuccessfulAlipayTradeStatus('TRADE_FINISHED')).toBe(true);
		expect(isSuccessfulAlipayTradeStatus('WAIT_BUYER_PAY')).toBe(false);
		expect(isSuccessfulAlipayTradeStatus(undefined)).toBe(false);
	});

	test('uses the local checkout handoff route', () => {
		expect(getAlipayCheckoutUrl('order-1')).toBe('/checkout/alipay/order-1');
	});
});
