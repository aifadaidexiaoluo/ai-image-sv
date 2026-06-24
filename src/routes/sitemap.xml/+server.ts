import type { RequestHandler } from './$types';

const routes = ['/', '/templates', '/pricing', '/cases', '/guide', '/faq', '/terms', '/privacy'];

export const GET: RequestHandler = ({ url }) => {
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${new URL(route, url.origin)}</loc></url>`).join('')}</urlset>`;
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
