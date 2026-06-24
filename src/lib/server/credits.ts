import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { creditTransactions, creditWallets } from '$lib/server/db/schema';

export async function ensureWallet(userId: string) {
	await db.insert(creditWallets).values({ userId }).onConflictDoNothing();
	return getWallet(userId);
}

export async function grantSignupCredits(userId: string) {
	await db.transaction(async (tx) => {
		await tx.insert(creditWallets).values({ userId }).onConflictDoNothing();
		const existing = await tx.query.creditTransactions.findFirst({
			where: and(
				eq(creditTransactions.userId, userId),
				eq(creditTransactions.referenceType, 'signup'),
				eq(creditTransactions.referenceId, userId)
			)
		});
		if (existing) return;

		const [wallet] = await tx
			.update(creditWallets)
			.set({ balance: sql`${creditWallets.balance} + 20`, updatedAt: new Date() })
			.where(eq(creditWallets.userId, userId))
			.returning();
		await tx.insert(creditTransactions).values({
			userId,
			type: 'grant',
			amount: 20,
			balanceAfter: wallet.balance,
			referenceType: 'signup',
			referenceId: userId,
			description: '注册赠送积分',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		});
	});
}

export async function getWallet(userId: string) {
	const wallet = await db.query.creditWallets.findFirst({
		where: eq(creditWallets.userId, userId)
	});
	return wallet ?? { userId, balance: 0, reserved: 0, updatedAt: new Date() };
}

export async function reserveCredits(userId: string, amount: number, jobId: string) {
	return db.transaction(async (tx) => {
		const [wallet] = await tx
			.update(creditWallets)
			.set({
				balance: sql`${creditWallets.balance} - ${amount}`,
				reserved: sql`${creditWallets.reserved} + ${amount}`,
				updatedAt: new Date()
			})
			.where(and(eq(creditWallets.userId, userId), sql`${creditWallets.balance} >= ${amount}`))
			.returning();
		if (!wallet) throw new Error('INSUFFICIENT_CREDITS');

		await tx.insert(creditTransactions).values({
			userId,
			type: 'reserve',
			amount: -amount,
			balanceAfter: wallet.balance,
			referenceType: 'job',
			referenceId: jobId,
			description: '生成任务预占积分'
		});
		return wallet;
	});
}

export async function settleCredits(
	userId: string,
	jobId: string,
	reserved: number,
	consumed: number
) {
	const refund = Math.max(0, reserved - consumed);
	await db.transaction(async (tx) => {
		const [wallet] = await tx
			.update(creditWallets)
			.set({
				balance: sql`${creditWallets.balance} + ${refund}`,
				reserved: sql`greatest(0, ${creditWallets.reserved} - ${reserved})`,
				updatedAt: new Date()
			})
			.where(eq(creditWallets.userId, userId))
			.returning();
		if (!wallet) return;

		await tx.insert(creditTransactions).values({
			userId,
			type: consumed > 0 ? 'consume' : 'refund',
			amount: refund,
			balanceAfter: wallet.balance,
			referenceType: 'job-settlement',
			referenceId: jobId,
			description: refund ? `任务结算，退回 ${refund} 积分` : '任务结算'
		});
	});
}

export async function adjustCredits(userId: string, amount: number, actorReference: string) {
	await ensureWallet(userId);
	return db.transaction(async (tx) => {
		const [wallet] = await tx
			.update(creditWallets)
			.set({
				balance: sql`greatest(0, ${creditWallets.balance} + ${amount})`,
				updatedAt: new Date()
			})
			.where(eq(creditWallets.userId, userId))
			.returning();
		await tx.insert(creditTransactions).values({
			userId,
			type: 'adjustment',
			amount,
			balanceAfter: wallet.balance,
			referenceType: 'admin',
			referenceId: actorReference,
			description: '管理员调整积分'
		});
		return wallet;
	});
}

export async function grantCredits(
	userId: string,
	amount: number,
	input: {
		type: 'purchase' | 'subscription';
		referenceId: string;
		description: string;
		expiresAt?: Date;
	}
) {
	await ensureWallet(userId);
	return db.transaction(async (tx) => {
		const existing = await tx.query.creditTransactions.findFirst({
			where: and(
				eq(creditTransactions.userId, userId),
				eq(creditTransactions.type, input.type),
				eq(creditTransactions.referenceId, input.referenceId)
			)
		});
		if (existing) return getWallet(userId);
		const [wallet] = await tx
			.update(creditWallets)
			.set({ balance: sql`${creditWallets.balance} + ${amount}`, updatedAt: new Date() })
			.where(eq(creditWallets.userId, userId))
			.returning();
		await tx.insert(creditTransactions).values({
			userId,
			type: input.type,
			amount,
			balanceAfter: wallet.balance,
			referenceType: input.type,
			referenceId: input.referenceId,
			description: input.description,
			expiresAt: input.expiresAt
		});
		return wallet;
	});
}
