import type { PageServerLoad } from './$types';
import { listAdminOrganizations } from '$lib/server/admin/organizations';

export const load: PageServerLoad = async ({ url }) =>
	listAdminOrganizations({
		keyword: url.searchParams.get('keyword') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});
