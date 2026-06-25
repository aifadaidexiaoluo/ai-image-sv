type CatalogRow = {
	product: { id: string };
	price: { currency: string } | null;
};

export type CatalogProductWithPrices<Row extends CatalogRow> = Row['product'] & {
	prices: NonNullable<Row['price']>[];
};

export function groupCatalogByProduct<Row extends CatalogRow>(
	catalog: readonly Row[]
): CatalogProductWithPrices<Row>[] {
	const grouped = new Map<string, CatalogProductWithPrices<Row>>();

	for (const row of catalog) {
		const product = grouped.get(row.product.id);
		if (product) {
			if (row.price) product.prices.push(row.price);
			continue;
		}

		const nextProduct = {
			...row.product,
			prices: row.price ? [row.price] : []
		} as CatalogProductWithPrices<Row>;
		grouped.set(row.product.id, nextProduct);
	}

	return [...grouped.values()];
}

export function findPriceByCurrency<Price extends { currency: string }>(
	prices: readonly Price[],
	currency = 'CNY'
) {
	return prices.find((price) => price.currency === currency);
}
