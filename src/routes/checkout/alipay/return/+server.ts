import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	redirect(303, '/app/billing?payment=alipay_return');
};
