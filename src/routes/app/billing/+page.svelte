<script lang="ts">
	import { page } from '$app/state';
	import { Check, Coins } from '@lucide/svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let currency = $state<'CNY' | 'USD'>('CNY');
	let loading = $state('');
	let grouped = $derived(
		Object.values(
			data.catalog.reduce(
				(result, row) => {
					const id = row.product.id;
					result[id] ??= { ...row.product, prices: [] as NonNullable<typeof row.price>[] };
					if (row.price) result[id].prices.push(row.price);
					return result;
				},
				{} as Record<string, any>
			)
		) as any[]
	);
	async function checkout(priceId: string) {
		loading = priceId;
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ priceId, idempotencyKey: crypto.randomUUID() })
		});
		const payload = await response.json();
		if (response.ok) location.href = payload.url;
		else alert(payload.message);
		loading = '';
	}
</script>

<svelte:head><title>套餐与积分 - DesignAI</title></svelte:head>
<div class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold">套餐与积分</h1>
		<p class="mt-1 text-sm text-muted-foreground">选择订阅套餐或购买永久有效的积分包。</p>
	</div>
	<div class="flex rounded-xl border bg-white p-1">
		<button
			onclick={() => (currency = 'CNY')}
			class="rounded-lg px-3 py-1.5 text-sm"
			class:bg-primary={currency === 'CNY'}
			class:text-white={currency === 'CNY'}>人民币</button
		><button
			onclick={() => (currency = 'USD')}
			class="rounded-lg px-3 py-1.5 text-sm"
			class:bg-primary={currency === 'USD'}
			class:text-white={currency === 'USD'}>美元</button
		>
	</div>
</div>
{#if page.url.searchParams.get('paid')}<p
		class="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
	>
		沙箱支付成功，积分已经到账。
	</p>{/if}
<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
	{#each grouped.filter((item) => item.slug !== 'free') as item (item.id)}{@const price =
			item.prices.find((candidate: any) => candidate.currency === currency)}
		<article class="rounded-2xl border bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-semibold">{item.name}</h2>
				<span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
					>{item.credits} 积分</span
				>
			</div>
			<p class="mt-4 text-3xl font-bold">
				{currency === 'CNY' ? '¥' : '$'}{price ? (price.amount / 100).toFixed(0) : '--'}<small
					class="text-sm font-normal text-muted-foreground"
					>{item.type === 'subscription' ? '/月' : ''}</small
				>
			</p>
			<ul class="mt-4 space-y-2">
				{#each item.features as feature}<li
						class="flex items-center gap-2 text-sm text-muted-foreground"
					>
						<Check class="size-4 text-primary" />{feature}
					</li>{/each}
			</ul>
			<button
				disabled={!price || loading === price?.id}
				onclick={() => price && checkout(price.id)}
				class="mt-5 h-11 w-full rounded-xl bg-primary font-semibold text-white disabled:opacity-50"
				>{loading === price?.id ? '处理中…' : '沙箱购买'}</button
			>
		</article>{/each}
</div>
<div class="mt-10 grid gap-6 xl:grid-cols-2">
	<section class="rounded-2xl border bg-white p-5">
		<h2 class="flex items-center gap-2 font-semibold">
			<Coins class="size-4 text-primary" />积分流水
		</h2>
		<div class="mt-4 divide-y">
			{#each data.transactions as transaction}<div
					class="flex items-center justify-between py-3 text-sm"
				>
					<div>
						<p>{transaction.description}</p>
						<p class="mt-1 text-xs text-muted-foreground">
							{new Date(transaction.createdAt).toLocaleString('zh-CN')}
						</p>
					</div>
					<strong class:text-emerald-600={transaction.amount > 0}
						>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</strong
					>
				</div>{:else}<p class="py-8 text-center text-sm text-muted-foreground">暂无流水</p>{/each}
		</div>
	</section>
	<section class="rounded-2xl border bg-white p-5">
		<h2 class="font-semibold">订单记录</h2>
		<div class="mt-4 divide-y">
			{#each data.orders as order}<div class="flex items-center justify-between py-3 text-sm">
					<div>
						<p>{order.currency} {(order.amount / 100).toFixed(2)}</p>
						<p class="mt-1 text-xs text-muted-foreground">
							{new Date(order.createdAt).toLocaleString('zh-CN')}
						</p>
					</div>
					<span class="rounded-full bg-muted px-2 py-1 text-xs">{order.status}</span>
				</div>{:else}<p class="py-8 text-center text-sm text-muted-foreground">暂无订单</p>{/each}
		</div>
	</section>
</div>
