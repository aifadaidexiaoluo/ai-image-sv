import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { adjustCredits } from '$lib/server/credits';
import { db } from '$lib/server/db';
import {
	assets,
	creditTransactions,
	creditWallets,
	generationJobs,
	member,
	orders,
	organization,
	subscriptions,
	user
} from '$lib/server/db/schema';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

export async function listAdminUsers(
	input: AdminListInput & { role?: string; banned?: string; sort?: string }
) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		keyword ? or(ilike(user.email, `%${keyword}%`), ilike(user.name, `%${keyword}%`)) : undefined,
		input.role && input.role !== 'all' ? eq(user.role, input.role) : undefined,
		input.banned === 'true' ? eq(user.banned, true) : undefined,
		input.banned === 'false' ? eq(user.banned, false) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const order = input.sort === 'oldest' ? asc(user.createdAt) : desc(user.createdAt);
	const [{ total }] = await db.select({ total: count() }).from(user).where(where);
	const rows = await db
		.select({
			user,
			wallet: creditWallets
		})
		.from(user)
		.leftJoin(creditWallets, eq(user.id, creditWallets.userId))
		.where(where)
		.orderBy(order)
		.limit(pageSize)
		.offset(offset);

	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
		filters: {
			keyword: keyword ?? '',
			role: input.role ?? 'all',
			banned: input.banned ?? 'all',
			sort: input.sort ?? 'latest'
		}
	};
}

export async function getAdminUserDetail(userId: string) {
	const item = await db.query.user.findFirst({ where: eq(user.id, userId) });
	if (!item) return null;
	const [wallet, transactions, jobs, userAssets, orderRows, subscriptionRows, memberships] =
		await Promise.all([
			db.query.creditWallets.findFirst({ where: eq(creditWallets.userId, userId) }),
			db
				.select()
				.from(creditTransactions)
				.where(eq(creditTransactions.userId, userId))
				.orderBy(desc(creditTransactions.createdAt))
				.limit(20),
			db
				.select()
				.from(generationJobs)
				.where(eq(generationJobs.userId, userId))
				.orderBy(desc(generationJobs.createdAt))
				.limit(20),
			db
				.select()
				.from(assets)
				.where(eq(assets.userId, userId))
				.orderBy(desc(assets.createdAt))
				.limit(20),
			db
				.select()
				.from(orders)
				.where(eq(orders.userId, userId))
				.orderBy(desc(orders.createdAt))
				.limit(20),
			db
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.userId, userId))
				.orderBy(desc(subscriptions.createdAt))
				.limit(10),
			db
				.select({ member, organization })
				.from(member)
				.innerJoin(organization, eq(member.organizationId, organization.id))
				.where(eq(member.userId, userId))
				.orderBy(desc(member.createdAt))
		]);

	return {
		user: item,
		wallet: wallet ?? { userId, balance: 0, reserved: 0, updatedAt: null },
		transactions,
		jobs,
		assets: userAssets,
		orders: orderRows,
		subscriptions: subscriptionRows,
		memberships
	};
}

export async function updateAdminUserRole(actorId: string, userId: string, role: string) {
	if (!['user', 'admin'].includes(role)) return fail(400, { message: '角色无效' });
	const existing = await db.query.user.findFirst({ where: eq(user.id, userId) });
	if (!existing) return fail(404, { message: '用户不存在' });
	await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));
	await writeAuditLog(actorId, 'user.role.update', 'user', userId, {
		before: existing.role,
		after: role
	});
	return { success: true };
}

export async function banAdminUser(
	actorId: string,
	userId: string,
	input: { banned: boolean; reason?: string; expires?: Date | null }
) {
	const existing = await db.query.user.findFirst({ where: eq(user.id, userId) });
	if (!existing) return fail(404, { message: '用户不存在' });
	await db
		.update(user)
		.set({
			banned: input.banned,
			banReason: input.banned ? (input.reason ?? '管理员操作') : null,
			banExpires: input.banned ? (input.expires ?? null) : null,
			updatedAt: new Date()
		})
		.where(eq(user.id, userId));
	await writeAuditLog(actorId, input.banned ? 'user.ban' : 'user.unban', 'user', userId, {
		reason: input.reason ?? null,
		expires: input.expires?.toISOString() ?? null
	});
	return { success: true };
}

export async function adjustAdminCredits(actorId: string, userId: string, amount: number) {
	if (!userId || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10000) {
		return fail(400, { message: '积分调整参数无效' });
	}
	await adjustCredits(userId, amount, `${actorId}:${crypto.randomUUID()}`);
	await writeAuditLog(actorId, 'credits.adjust', 'user', userId, { amount });
	return { success: true };
}

export const adminUserRoles = ['all', 'user', 'admin'];
export const adminBannedFilters = ['all', 'true', 'false'];
