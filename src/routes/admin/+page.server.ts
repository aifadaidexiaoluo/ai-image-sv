import type { PageServerLoad } from './$types';
import { getAdminDashboardMetrics } from '$lib/server/admin/dashboard';

export const load: PageServerLoad = async () => getAdminDashboardMetrics();
