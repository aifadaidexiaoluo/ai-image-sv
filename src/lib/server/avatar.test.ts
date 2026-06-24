import { describe, expect, test } from 'bun:test';
import { MAX_AVATAR_BYTES, validateAvatar } from './avatar';

describe('avatar validation', () => {
	test('accepts supported image signatures', () => {
		const cases: Array<[string, Uint8Array, string]> = [
			['image/jpeg', new Uint8Array([0xff, 0xd8, 0xff]), 'jpg'],
			['image/png', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'png'],
			[
				'image/webp',
				new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
				'webp'
			]
		];
		for (const [declaredType, bytes, extension] of cases) {
			expect(validateAvatar({ declaredType, size: bytes.length, bytes })?.extension).toBe(
				extension
			);
		}
	});

	test('rejects a MIME type that does not match the file signature', () => {
		expect(
			validateAvatar({
				declaredType: 'image/png',
				size: 3,
				bytes: new Uint8Array([0xff, 0xd8, 0xff])
			})
		).toBe(null);
	});

	test('rejects empty and oversized files', () => {
		const jpeg = new Uint8Array([0xff, 0xd8, 0xff]);
		expect(validateAvatar({ declaredType: 'image/jpeg', size: 0, bytes: jpeg })).toBe(null);
		expect(
			validateAvatar({ declaredType: 'image/jpeg', size: MAX_AVATAR_BYTES + 1, bytes: jpeg })
		).toBe(null);
	});
});
