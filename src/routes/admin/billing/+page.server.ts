import type { Actions, PageServerLoad } from './$types';
import {
	listAdminCreditTransactions,
	listAdminOrders,
	listAdminPaymentEvents,
	listAdminProducts,
	listAdminSubscriptions,
	upsertAdminPrice,
	upsertAdminProduct
} from '$lib/server/admin/billing';

export const load: PageServerLoad = async ({ url }) => ({
	products: await listAdminProducts(),
	orders: await listAdminOrders({
		status: url.searchParams.get('orderStatus') ?? undefined,
		keyword: url.searchParams.get('keyword') ?? undefined,
		page: Number(url.searchParams.get('page') ?? 1),
		pageSize: 10
	}),
	subscriptions: await listAdminSubscriptions({ pageSize: 10 }),
	paymentEvents: await listAdminPaymentEvents({ pageSize: 10 }),
	creditTransactions: await listAdminCreditTransactions({ pageSize: 10 })
});

export const actions: Actions = {
	saveProduct: async ({ locals, request }) => {
		const form = await request.formData();
		return upsertAdminProduct(locals.user!.id, {
			id: String(form.get('id') ?? '').trim() || undefined,
			slug: String(form.get('slug') ?? '').trim(),
			name: String(form.get('name') ?? '').trim(),
			type: String(form.get('type') ?? '').trim(),
			credits: Number(form.get('credits') ?? 0),
			active: form.get('active') === 'on'
		});
	},
	savePrice: async ({ locals, request }) => {
		const form = await request.formData();
		return upsertAdminPrice(locals.user!.id, {
			id: String(form.get('id') ?? '').trim() || undefined,
			productId: String(form.get('productId') ?? '').trim(),
			currency: String(form.get('currency') ?? 'CNY').trim(),
			amount: Number(form.get('amount') ?? 0),
			interval: String(form.get('interval') ?? '').trim() || null,
			active: form.get('active') === 'on'
		});
	}
};
