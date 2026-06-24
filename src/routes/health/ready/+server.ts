import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { client } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		await client`select 1`;
		return json({ status: 'ready', database: 'ok' });
	} catch {
		return json({ status: 'unavailable', database: 'error' }, { status: 503 });
	}
};
