import { json } from '@sveltejs/kit';
import { desc, eq, isNull, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	assets,
	creditTransactions,
	creditWallets,
	generationJobs,
	orders,
	subscriptions,
	userSettings
} from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const userId = locals.user!.id;
	const [settings, wallet, orderRows, subscriptionRows, transactionRows, assetRows, jobRows] =
		await Promise.all([
			db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) }),
			db.query.creditWallets.findFirst({ where: eq(creditWallets.userId, userId) }),
			db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)),
			db
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.userId, userId))
				.orderBy(desc(subscriptions.createdAt)),
			db
				.select()
				.from(creditTransactions)
				.where(eq(creditTransactions.userId, userId))
				.orderBy(desc(creditTransactions.createdAt)),
			db
				.select({
					id: assets.id,
					kind: assets.kind,
					fileName: assets.fileName,
					displayName: assets.displayName,
					mimeType: assets.mimeType,
					sizeBytes: assets.sizeBytes,
					width: assets.width,
					height: assets.height,
					style: assets.style,
					color: assets.color,
					favorite: assets.favorite,
					createdAt: assets.createdAt,
					updatedAt: assets.updatedAt
				})
				.from(assets)
				.where(and(eq(assets.userId, userId), isNull(assets.deletedAt)))
				.orderBy(desc(assets.createdAt)),
			db
				.select({
					id: generationJobs.id,
					tool: generationJobs.tool,
					status: generationJobs.status,
					stage: generationJobs.stage,
					progress: generationJobs.progress,
					completedCount: generationJobs.completedCount,
					totalCount: generationJobs.totalCount,
					prompt: generationJobs.prompt,
					parameters: generationJobs.parameters,
					consumedCredits: generationJobs.consumedCredits,
					errorCode: generationJobs.errorCode,
					errorMessage: generationJobs.errorMessage,
					createdAt: generationJobs.createdAt,
					updatedAt: generationJobs.updatedAt,
					finishedAt: generationJobs.finishedAt
				})
				.from(generationJobs)
				.where(eq(generationJobs.userId, userId))
				.orderBy(desc(generationJobs.createdAt))
		]);

	return json(
		{
			exportedAt: new Date().toISOString(),
			profile: {
				id: locals.user!.id,
				name: locals.user!.name,
				email: locals.user!.email,
				image: locals.user!.image,
				role: locals.user!.role
			},
			settings,
			wallet,
			orders: orderRows,
			subscriptions: subscriptionRows,
			creditTransactions: transactionRows,
			assets: assetRows,
			jobs: jobRows
		},
		{
			headers: {
				'content-disposition': `attachment; filename="designai-account-${userId}.json"`
			}
		}
	);
};
