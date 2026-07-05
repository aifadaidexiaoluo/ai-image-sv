import { getAccountSummary } from '$lib/server/account';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, locals }) => {
	depends('app:account');

	return {
		account: locals.user ? await getAccountSummary(locals.user) : null
	};
};
