<script lang="ts">
	import { resolve } from '$app/paths';
	import { Check } from '@lucide/svelte';
	import InfoPage from '$lib/components/marketing/info-page.svelte';
	import { findPriceByCurrency, groupCatalogByProduct } from '$lib/billing/catalog';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let grouped = $derived(groupCatalogByProduct(data.catalog));
</script>

<svelte:head
	><title>价格 - DesignAI</title><meta
		name="description"
		content="DesignAI 免费版、Pro 和 Business 套餐价格。"
	/></svelte:head
>
<InfoPage
	eyebrow="简单透明的价格"
	title="按需要选择积分与套餐"
	description="商品图按成功输出计费，失败或未完成部分自动退回积分。"
	><div class="grid gap-5 md:grid-cols-3">
		{#each grouped.filter( (item) => ['free', 'pro', 'business'].includes(item.slug) ) as item (item.id)}{@const price =
				findPriceByCurrency(item.prices)}
			<article
				class="rounded-2xl border bg-white p-6 shadow-sm"
				class:ring-2={item.slug === 'pro'}
				class:ring-primary={item.slug === 'pro'}
			>
				<h2 class="text-xl font-bold">{item.name}</h2>
				<p class="mt-4 text-4xl font-bold">
					{price ? `¥${price.amount / 100}` : '免费'}<small
						class="text-sm font-normal text-muted-foreground">{price ? '/月' : ''}</small
					>
				</p>
				<p class="mt-2 text-sm text-primary">{item.credits} 积分</p>
				<ul class="mt-6 space-y-3">
					{#each item.features as feature (feature)}<li class="flex items-center gap-2 text-sm">
							<Check class="size-4 text-primary" />{feature}
						</li>{/each}
				</ul>
				<a
					href={resolve(item.slug === 'free' ? '/register' : '/app/billing')}
					class="mt-7 flex h-11 items-center justify-center rounded-xl bg-primary font-semibold text-white"
					>{item.slug === 'free' ? '免费开始' : '选择套餐'}</a
				>
			</article>{/each}
	</div>
	<p class="mt-8 text-center text-sm text-muted-foreground">
		商品图 2 积分/张 · 场景编辑 3 积分/张 · 智能抠图 1 积分/张
	</p></InfoPage
>
