import type { PageServerLoad } from './$types';
import { getCatalog } from '$lib/server/billing/catalog';
export const load: PageServerLoad = async () => ({ catalog: await getCatalog() });
