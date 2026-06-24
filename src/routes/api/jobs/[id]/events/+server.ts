import type { RequestHandler } from './$types';
import { getJobForUser } from '$lib/server/jobs/service';
import { listJobEvents } from '$lib/server/jobs/events';

const encoder = new TextEncoder();

export const GET: RequestHandler = async ({ locals, params, request, url }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const initialJob = await getJobForUser(params.id, locals.user.id, locals.user.role === 'admin');
	if (!initialJob) return new Response('Not found', { status: 404 });
	let lastEventId = Number(
		request.headers.get('last-event-id') ?? url.searchParams.get('after') ?? 0
	);
	let canceled = false;

	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(encoder.encode('retry: 2000\n\n'));
			let heartbeatAt = Date.now();
			while (!canceled) {
				const events = await listJobEvents(params.id, lastEventId);
				for (const event of events) {
					lastEventId = event.id;
					controller.enqueue(
						encoder.encode(
							`id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`
						)
					);
				}
				if (Date.now() - heartbeatAt >= 15_000) {
					controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
					heartbeatAt = Date.now();
				}
				const latest = await getJobForUser(
					params.id,
					locals.user!.id,
					locals.user!.role === 'admin'
				);
				if (
					latest &&
					['succeeded', 'partial', 'failed', 'canceled'].includes(latest.status) &&
					!events.length
				) {
					controller.close();
					return;
				}
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		},
		cancel() {
			canceled = true;
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache, no-transform',
			connection: 'keep-alive',
			'x-accel-buffering': 'no'
		}
	});
};
