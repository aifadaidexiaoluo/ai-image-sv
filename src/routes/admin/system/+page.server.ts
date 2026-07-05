import type { PageServerLoad } from './$types';
import { getAdminSystemHealth } from '$lib/server/admin/system';

export const load: PageServerLoad = async () => getAdminSystemHealth();
