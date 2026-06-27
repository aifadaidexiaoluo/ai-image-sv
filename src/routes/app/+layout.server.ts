import { redirect } from '@sveltejs/kit';
import { getAccountSummary } from '$lib/server/account';
import { ensureWallet, grantSignupCredits } from '$lib/server/credits';
import { listAppNotifications } from '$lib/server/notifications';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	await grantSignupCredits(locals.user.id);
	const wallet = await ensureWallet(locals.user.id);
	const account = await getAccountSummary(locals.user);
	return {
		user: locals.user,
		wallet,
		account,
		notifications: await listAppNotifications(locals.user.id, wallet, account.planName)
	};
};
