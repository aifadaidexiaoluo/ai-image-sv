import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (locals.user.role !== 'admin') redirect(302, '/app');
	return { user: locals.user };
};
