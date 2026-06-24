import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		if (!email) return fail(400, { message: '请输入邮箱' });
		await auth.api.requestPasswordReset({
			body: { email, redirectTo: `${event.url.origin}/reset-password` }
		});
		return { success: true };
	}
};
