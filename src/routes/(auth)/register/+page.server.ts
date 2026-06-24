import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/app');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const name = String(data.get('name') ?? '').trim();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');
		const confirm = String(data.get('confirm') ?? '');
		if (name.length < 2) return fail(400, { message: '请输入至少 2 个字符的名称', name, email });
		if (password.length < 12) return fail(400, { message: '密码至少需要 12 个字符', name, email });
		if (password !== confirm) return fail(400, { message: '两次输入的密码不一致', name, email });
		try {
			await auth.api.signUpEmail({
				body: { name, email, password, callbackURL: `${event.url.origin}/app` },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || '注册失败', name, email });
			return fail(500, { message: '注册失败，请稍后重试', name, email });
		}
		redirect(303, `/verify-email?email=${encodeURIComponent(email)}`);
	}
};
