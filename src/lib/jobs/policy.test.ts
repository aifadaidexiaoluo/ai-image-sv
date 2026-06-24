import { describe, expect, test } from 'bun:test';
import { creditsPerOutput, isTerminalStatus, reservedCredits } from './policy';

describe('job policy', () => {
	test('charges per successful output', () => {
		expect(creditsPerOutput('product')).toBe(2);
		expect(creditsPerOutput('scene')).toBe(3);
		expect(creditsPerOutput('remove-background')).toBe(1);
	});

	test('clamps image counts and forces one background output', () => {
		expect(reservedCredits('product', 10)).toEqual({ count: 4, credits: 8 });
		expect(reservedCredits('scene', 0)).toEqual({ count: 1, credits: 3 });
		expect(reservedCredits('remove-background', 4)).toEqual({ count: 1, credits: 1 });
	});

	test('recognizes terminal states', () => {
		expect(isTerminalStatus('succeeded')).toBe(true);
		expect(isTerminalStatus('running')).toBe(false);
	});
});
