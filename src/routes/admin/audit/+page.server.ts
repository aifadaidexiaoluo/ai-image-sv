import type { PageServerLoad } from './$types';
import { listAuditLogs } from '$lib/server/admin/audit';

export const load: PageServerLoad = async ({ url }) =>
	listAuditLogs({
		keyword: url.searchParams.get('keyword') ?? undefined,
		action: url.searchParams.get('action') ?? undefined,
		targetType: url.searchParams.get('targetType') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1)
	});
