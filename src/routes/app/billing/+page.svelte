<script lang="ts">
	import { resolve } from '$app/paths';
	import { Check, Coins, FileText, Receipt, ShieldCheck, TimerReset } from '@lucide/svelte';
	import { findPriceByCurrency, groupCatalogByProduct } from '$lib/billing/catalog';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let billing = $state<'month' | 'year'>('month');
	let tab = $state<'plans' | 'credits'>('plans');
	let loading = $state('');
	let grouped = $derived(groupCatalogByProduct(data.catalog));
	const subscriptions = $derived(grouped.filter((item) => item.type === 'subscription'));
	const creditPacks = $derived(grouped.filter((item) => item.type === 'credit_pack'));
	const displayPlans = $derived([
		{
			name: '免费版',
			slug: 'free',
			price: 0,
			credits: 20,
			subtitle: '基础功能免费体验',
			features: [
				'每月 20 积分',
				'商品图生成 4 张/月',
				'智能抠图 20 张/月',
				'场景图生成 2 张/月',
				'基础素材库'
			]
		},
		{
			name: '个人版',
			slug: 'pro',
			price: 39,
			credits: 200,
			subtitle: '适合个人用户',
			features: [
				'每月 200 积分',
				'商品图生成 200 张/月',
				'智能抠图 200 张/月',
				'场景图生成 100 张/月',
				'高清导出',
				'去除水印'
			]
		},
		{
			name: '专业版',
			slug: 'business',
			price: 99,
			credits: 800,
			subtitle: '适合专业创作者',
			popular: true,
			features: [
				'每月 800 积分',
				'商品图生成 800 张/月',
				'智能抠图 800 张/月',
				'场景图生成 400 张/月',
				'4K 高清导出',
				'批量处理',
				'历史记录无限保存'
			]
		},
		{
			name: '团队版',
			slug: 'team',
			price: 299,
			credits: 3000,
			subtitle: '适合团队协作',
			features: [
				'每月 3000 积分',
				'商品图生成 3000 张/月',
				'智能抠图 3000 张/月',
				'场景图生成 1500 张/月',
				'多人协作',
				'优先客服支持'
			]
		}
	]);

	function priceFor(slug: string) {
		const product = subscriptions.find((item) => item.slug === slug);
		return product ? findPriceByCurrency(product.prices) : undefined;
	}

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
<h1 class="text-3xl font-black text-[#121826]">套餐与积分</h1>
<p class="mt-2 text-sm text-[#65708a]">选择最适合的套餐，解锁更多高级功能和积分</p>

<div class="mt-8 border-b border-[#dfe3f2]">
	<button
		onclick={() => (tab = 'plans')}
		class={`border-b-2 px-6 py-4 text-sm font-black ${tab === 'plans' ? 'border-primary text-primary' : 'border-transparent text-[#65708a]'}`}
		>套餐订阅</button
	>
	<button
		onclick={() => (tab = 'credits')}
		class={`border-b-2 px-6 py-4 text-sm font-black ${tab === 'credits' ? 'border-primary text-primary' : 'border-transparent text-[#65708a]'}`}
		>积分充值</button
	>
</div>

<div class="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
	<section>
		{#if tab === 'plans'}
			<div class="mb-5 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 class="text-xl font-black text-[#121826]">选择套餐</h2>
					<p class="mt-1 text-sm text-[#65708a]">不同套餐满足不同阶段的创作需求</p>
				</div>
				<div class="flex items-center gap-3 text-sm font-bold text-[#65708a]">
					按月付费
					<button
						aria-label="切换月付或年付"
						onclick={() => (billing = billing === 'month' ? 'year' : 'month')}
						class="relative h-7 w-12 rounded-full bg-primary"
						><span
							class={`absolute top-1 size-5 rounded-full bg-white transition ${billing === 'year' ? 'left-6' : 'left-1'}`}
						></span></button
					>
					按年付费
					<span class="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">省 20%</span>
				</div>
			</div>
			<div class="grid gap-4 lg:grid-cols-4">
				{#each displayPlans as plan (plan.slug)}
					{@const price = priceFor(plan.slug)}
					<article
						class={`relative rounded-2xl border bg-white p-5 shadow-sm ${plan.popular ? 'border-primary ring-2 ring-primary/10' : 'border-[#e1e5f2]'}`}
					>
						{#if plan.popular}<span
								class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-black text-white"
								>最受欢迎</span
							>{/if}
						<h3 class="text-lg font-black text-[#121826]">{plan.name}</h3>
						<p class="mt-1 text-xs font-medium text-[#65708a]">{plan.subtitle}</p>
						<p class="mt-8 text-4xl font-black text-primary">
							¥{billing === 'year' ? Math.round(plan.price * 0.8) : plan.price}<small
								class="text-sm font-medium text-[#65708a]"
							>
								/ 月</small
							>
						</p>
						{#if billing === 'year' && plan.price}<p class="mt-1 text-sm font-bold text-[#65708a]">
								¥{plan.price * 12} / 年
							</p>{/if}
						<ul class="mt-8 space-y-3">
							{#each plan.features as feature (feature)}<li
									class="flex gap-2 text-sm font-medium text-[#65708a]"
								>
									<Check class="mt-0.5 size-4 text-primary" />{feature}
								</li>{/each}
						</ul>
						{#if price}
							<button
								onclick={() => checkout(price.id)}
								disabled={loading === price.id}
								class={`mt-8 h-11 w-full rounded-xl font-black ${plan.popular ? 'bg-primary text-white' : 'border border-primary text-primary'} disabled:opacity-50`}
								>{loading === price.id ? '处理中...' : '选择套餐'}</button
							>
						{:else}
							<button
								disabled
								class="mt-8 h-11 w-full rounded-xl border border-[#dde2f2] font-black text-[#65708a]"
								>当前套餐</button
							>
						{/if}
					</article>
				{/each}
			</div>
			<div class="mt-8 grid gap-4 rounded-2xl border border-[#e1e5f2] bg-white p-5 md:grid-cols-4">
				{#each [{ icon: TimerReset, title: '积分有效期', desc: '积分按自然月发放' }, { icon: Coins, title: '套餐自动续费', desc: '到期前 3 天提醒' }, { icon: Receipt, title: '发票服务', desc: '支持开具增值税电子发票' }, { icon: ShieldCheck, title: '安全保障', desc: '数据加密存储保障隐私' }] as item (item.title)}
					<div class="flex gap-3">
						<span class="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"
							><item.icon class="size-5" /></span
						>
						<div>
							<p class="font-black text-[#121826]">{item.title}</p>
							<p class="mt-1 text-sm text-[#65708a]">{item.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-3">
				{#each creditPacks as pack (pack.id)}
					{@const price = findPriceByCurrency(pack.prices)}
					<article class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
						<h3 class="text-lg font-black text-[#121826]">{pack.name}</h3>
						<p class="mt-6 text-4xl font-black text-primary">
							{pack.credits}<small class="text-sm text-[#65708a]"> 积分</small>
						</p>
						<p class="mt-2 text-sm font-bold text-[#65708a]">
							¥{price ? (price.amount / 100).toFixed(0) : '--'}
						</p>
						<button
							disabled={!price || loading === price.id}
							onclick={() => price && checkout(price.id)}
							class="mt-8 h-11 w-full rounded-xl bg-primary font-black text-white disabled:opacity-50"
							>{loading === price?.id ? '处理中...' : '充值积分'}</button
						>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	<aside class="space-y-5">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-black text-[#121826]">积分余额</h2>
				<a href={resolve('/app/billing')} class="text-sm font-bold text-primary">积分明细</a>
			</div>
			<div class="mt-5 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-100 p-5">
				<div class="flex items-center gap-4">
					<Coins class="size-12 text-amber-500" />
					<div>
						<p class="text-5xl font-black text-primary">{data.wallet.balance}</p>
						<p class="text-sm font-bold text-[#65708a]">可用积分</p>
					</div>
				</div>
				<div
					class="mt-5 grid grid-cols-2 rounded-xl bg-white/70 text-center text-sm font-bold text-[#65708a]"
				>
					<span class="p-3">本月获取 12</span><span class="p-3">本月消耗 0</span>
				</div>
			</div>
			<button
				onclick={() => (tab = 'credits')}
				class="mt-5 h-11 w-full rounded-xl bg-primary font-black text-white">充值积分</button
			>
			<p class="mt-4 rounded-xl bg-primary/5 p-3 text-sm text-[#65708a]">
				积分可用于生成商品图、场景图、智能抠图等功能。
			</p>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-black text-[#121826]">积分使用记录</h2>
				<a href={resolve('/app/history')} class="text-sm font-bold text-primary">查看全部</a>
			</div>
			<div class="mt-4 divide-y divide-[#eef1f7]">
				{#each data.transactions.slice(0, 5) as transaction (transaction.id)}
					<div class="flex items-center justify-between py-3 text-sm">
						<div class="flex gap-3">
							<span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"
								><FileText class="size-4" /></span
							>
							<div>
								<p class="font-bold text-[#121826]">{transaction.description}</p>
								<p class="mt-1 text-xs text-[#65708a]">
									{new Date(transaction.createdAt).toLocaleString('zh-CN')}
								</p>
							</div>
						</div>
						<strong class={transaction.amount > 0 ? 'text-emerald-600' : 'text-red-500'}
							>{transaction.amount > 0 ? '+' : ''}{transaction.amount} 积分</strong
						>
					</div>
				{:else}
					<p class="py-8 text-center text-sm text-[#65708a]">暂无流水</p>
				{/each}
			</div>
		</section>
	</aside>
</div>
