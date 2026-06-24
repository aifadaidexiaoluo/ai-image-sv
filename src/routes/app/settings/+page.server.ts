import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	profile: async ({ locals, request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (name.length < 2 || name.length > 60) return fail(400, { message: '名称需要 2–60 个字符' });
		await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, locals.user!.id));
		return { success: true };
	},
	password: async ({ locals, url }) => {
		await auth.api.requestPasswordReset({
			body: { email: locals.user!.email, redirectTo: `${url.origin}/reset-password` }
		});
		return { passwordSent: true };
	}
};
