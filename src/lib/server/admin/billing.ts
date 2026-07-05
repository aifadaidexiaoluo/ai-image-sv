import { and, asc, count, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	creditTransactions,
	orders,
	paymentEvents,
	prices,
	products,
	subscriptions,
	user
} from '$lib/server/db/schema';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

export async function listAdminOrders(input: AdminListInput & { status?: string }) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		input.status && input.status !== 'all' ? eq(orders.status, input.status as never) : undefined,
		keyword ? ilike(orders.idempotencyKey, `%${keyword}%`) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
	const rows = await db
		.select({ order: orders, user, price: prices, product: products })
		.from(orders)
		.innerJoin(user, eq(orders.userId, user.id))
		.innerJoin(prices, eq(orders.priceId, prices.id))
		.innerJoin(products, eq(prices.productId, products.id))
		.where(where)
		.orderBy(desc(orders.createdAt))
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize))
	};
}

export async function listAdminSubscriptions(input: AdminListInput & { status?: string }) {
	const { page, pageSize, offset } = pagination(input);
	const filters: (SQL | undefined)[] = [
		input.status && input.status !== 'all' ? eq(subscriptions.status, input.status) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(subscriptions).where(where);
	const rows = await db
		.select({ subscription: subscriptions, user, product: products })
		.from(subscriptions)
		.innerJoin(user, eq(subscriptions.userId, user.id))
		.innerJoin(products, eq(subscriptions.productId, products.id))
		.where(where)
		.orderBy(desc(subscriptions.createdAt))
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize))
	};
}

export async function listAdminPaymentEvents(input: AdminListInput & { type?: string }) {
	const { page, pageSize, offset } = pagination(input);
	const filters: (SQL | undefined)[] = [
		input.type ? ilike(paymentEvents.type, `%${input.type}%`) : undefined,
		input.keyword ? ilike(paymentEvents.providerEventId, `%${input.keyword.trim()}%`) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(paymentEvents).where(where);
	const rows = await db
		.select()
		.from(paymentEvents)
		.where(where)
		.orderBy(desc(paymentEvents.createdAt))
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize))
	};
}

export async function listAdminCreditTransactions(input: AdminListInput & { userId?: string }) {
	const { page, pageSize, offset } = pagination(input);
	const filters: (SQL | undefined)[] = [
		input.userId ? eq(creditTransactions.userId, input.userId) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(creditTransactions).where(where);
	const rows = await db
		.select({ transaction: creditTransactions, user })
		.from(creditTransactions)
		.innerJoin(user, eq(creditTransactions.userId, user.id))
		.where(where)
		.orderBy(desc(creditTransactions.createdAt))
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize))
	};
}

export async function listAdminProducts() {
	return db
		.select({ product: products, price: prices })
		.from(products)
		.leftJoin(prices, eq(products.id, prices.productId))
		.orderBy(asc(products.createdAt), asc(prices.amount));
}

export async function upsertAdminProduct(
	actorId: string,
	input: { id?: string; slug: string; name: string; type: string; credits: number; active: boolean }
) {
	if (!input.slug || !input.name || !input.type || !Number.isInteger(input.credits)) {
		return fail(400, { message: '商品参数无效' });
	}
	if (input.id) {
		await db
			.update(products)
			.set({
				slug: input.slug,
				name: input.name,
				type: input.type,
				credits: input.credits,
				active: input.active,
				updatedAt: new Date()
			})
			.where(eq(products.id, input.id));
		await writeAuditLog(actorId, 'product.update', 'product', input.id, input);
		return { success: true };
	}
	const [created] = await db.insert(products).values(input).returning({ id: products.id });
	await writeAuditLog(actorId, 'product.create', 'product', created.id, input);
	return { success: true };
}

export async function upsertAdminPrice(
	actorId: string,
	input: {
		id?: string;
		productId: string;
		currency: string;
		amount: number;
		interval?: string | null;
		active: boolean;
	}
) {
	if (!input.productId || !input.currency || !Number.isInteger(input.amount) || input.amount < 0) {
		return fail(400, { message: '价格参数无效' });
	}
	if (input.id) {
		await db
			.update(prices)
			.set({
				currency: input.currency,
				amount: input.amount,
				interval: input.interval || null,
				active: input.active
			})
			.where(eq(prices.id, input.id));
		await writeAuditLog(actorId, 'price.update', 'price', input.id, input);
		return { success: true };
	}
	const [created] = await db
		.insert(prices)
		.values({
			productId: input.productId,
			currency: input.currency,
			amount: input.amount,
			interval: input.interval || null,
			active: input.active
		})
		.returning({ id: prices.id });
	await writeAuditLog(actorId, 'price.create', 'price', created.id, input);
	return { success: true };
}
