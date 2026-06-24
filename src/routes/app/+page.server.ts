import type { PageServerLoad } from './$types';
import { listJobsForUser } from '$lib/server/jobs/service';

export const load: PageServerLoad = async ({ locals }) => ({
	jobs: await listJobsForUser(locals.user!.id, 4)
});
