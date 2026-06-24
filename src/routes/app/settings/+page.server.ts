import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { MAX_AVATAR_BYTES, validateAvatar } from '$lib/server/avatar';
import { storageProvider } from '$lib/server/storage';
import type { Actions } from './$types';

export const actions: Actions = {
	profile: async ({ locals, request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const bio = String(form.get('bio') ?? '').trim();
		const avatar = form.get('avatar');
		if (name.length < 2 || name.length > 60) {
			return fail(400, { message: '名称需要 2–60 个字符', name, bio });
		}
		if (bio.length > 200) return fail(400, { message: '个人简介不能超过 200 个字符', name, bio });
		if (avatar instanceof File && avatar.size > MAX_AVATAR_BYTES) {
			return fail(400, { message: '头像大小不能超过 2 MB', name, bio });
		}

		const currentUser = await db.query.user.findFirst({
			where: eq(user.id, locals.user!.id),
			columns: { avatarObjectKey: true }
		});
		let newObjectKey: string | null = null;
		let newImage: string | undefined;

		try {
			if (avatar instanceof File && avatar.size > 0) {
				const bytes = new Uint8Array(await avatar.arrayBuffer());
				const detected = validateAvatar({
					declaredType: avatar.type,
					size: avatar.size,
					bytes
				});
				if (!detected || avatar.type !== detected.contentType) {
					return fail(400, { message: '头像仅支持 JPG、PNG 和 WebP 图片', name, bio });
				}
				const version = crypto.randomUUID();
				newObjectKey = `users/${locals.user!.id}/avatars/${version}.${detected.extension}`;
				newImage = `/api/account/avatar?v=${version}`;
				await storageProvider.putObject(newObjectKey, bytes, detected.contentType);
			}

			await db
				.update(user)
				.set({
					name,
					bio: bio || null,
					...(newObjectKey ? { avatarObjectKey: newObjectKey, image: newImage } : {}),
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user!.id));
		} catch (error) {
			if (newObjectKey) await storageProvider.deleteObject(newObjectKey).catch(() => undefined);
			console.error('PROFILE_UPDATE_FAILED', error);
			return fail(500, { message: '资料更新失败，请稍后重试', name, bio });
		}

		if (newObjectKey && currentUser?.avatarObjectKey) {
			await storageProvider.deleteObject(currentUser.avatarObjectKey).catch((error) => {
				console.error('OLD_AVATAR_DELETE_FAILED', error);
			});
		}
		return { success: true };
	},
	removeAvatar: async ({ locals }) => {
		const currentUser = await db.query.user.findFirst({
			where: eq(user.id, locals.user!.id),
			columns: { avatarObjectKey: true }
		});
		await db
			.update(user)
			.set({ avatarObjectKey: null, image: null, updatedAt: new Date() })
			.where(eq(user.id, locals.user!.id));
		if (currentUser?.avatarObjectKey) {
			await storageProvider.deleteObject(currentUser.avatarObjectKey).catch((error) => {
				console.error('AVATAR_DELETE_FAILED', error);
			});
		}
		return { avatarRemoved: true };
	},
	password: async ({ locals, url }) => {
		await auth.api.requestPasswordReset({
			body: { email: locals.user!.email, redirectTo: `${url.origin}/reset-password` }
		});
		return { passwordSent: true };
	}
};
