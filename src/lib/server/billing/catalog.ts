import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { prices, products } from '$lib/server/db/schema';

const catalog = [
	{
		slug: 'free',
		name: 'Free',
		type: 'subscription',
		credits: 20,
		features: ['注册赠送 20 积分', '单任务并发 1 个']
	},
	{
		slug: 'pro',
		name: 'Pro',
		type: 'subscription',
		credits: 300,
		features: ['每月 300 积分', '单任务并发 2 个'],
		prices: { CNY: 3900, USD: 600 }
	},
	{
		slug: 'business',
		name: 'Business',
		type: 'subscription',
		credits: 1200,
		features: ['每月 1200 积分', '单任务并发 5 个'],
		prices: { CNY: 12900, USD: 1900 }
	},
	{
		slug: 'credits-100',
		name: '100 积分包',
		type: 'credit_pack',
		credits: 100,
		features: ['永久有效'],
		prices: { CNY: 1900, USD: 300 }
	},
	{
		slug: 'credits-500',
		name: '500 积分包',
		type: 'credit_pack',
		credits: 500,
		features: ['永久有效'],
		prices: { CNY: 7900, USD: 1200 }
	},
	{
		slug: 'credits-2000',
		name: '2000 积分包',
		type: 'credit_pack',
		credits: 2000,
		features: ['永久有效'],
		prices: { CNY: 25900, USD: 3900 }
	}
] as const;

export async function ensureCatalog() {
	for (const item of catalog) {
		await db
			.insert(products)
			.values({
				slug: item.slug,
				name: item.name,
				type: item.type,
				credits: item.credits,
				features: [...item.features]
			})
			.onConflictDoNothing();
		const product = await db.query.products.findFirst({ where: eq(products.slug, item.slug) });
		if (!product || !('prices' in item)) continue;
		for (const [currency, amount] of Object.entries(item.prices)) {
			await db
				.insert(prices)
				.values({
					productId: product.id,
					currency,
					amount,
					interval: item.type === 'subscription' ? 'month' : null
				})
				.onConflictDoNothing();
		}
	}
}

export async function getCatalog() {
	await ensureCatalog();
	return db
		.select({ product: products, price: prices })
		.from(products)
		.leftJoin(prices, eq(prices.productId, products.id))
		.orderBy(asc(products.createdAt));
}
