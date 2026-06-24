import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const token = String(data.get('token') ?? '');
		const password = String(data.get('password') ?? '');
		const confirm = String(data.get('confirm') ?? '');
		if (!token) return fail(400, { message: '重置链接无效或已过期' });
		if (password.length < 12) return fail(400, { message: '密码至少需要 12 个字符', token });
		if (password !== confirm) return fail(400, { message: '两次输入的密码不一致', token });
		try {
			await auth.api.resetPassword({ body: { newPassword: password, token } });
		} catch {
			return fail(400, { message: '重置链接无效或已过期', token });
		}
		redirect(303, '/login?reset=success');
	}
};
