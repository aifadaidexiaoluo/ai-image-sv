<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import JsonPreview from '$lib/components/admin/json-preview.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	function money(value: number, currency = 'CNY') {
		return `${currency} ${(value / 100).toFixed(2)}`;
	}
</script>

<svelte:head><title>账单管理 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">账单管理</h1>
<p class="mt-2 text-sm text-[#667085]">查看订单、订阅、支付事件，并维护产品与价格。</p>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<section class="mt-6 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">产品 / 价格</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.products as row, index (`${row.product.id}-${row.price?.id ?? index}`)}
				<div class="flex justify-between gap-4 py-2">
					<div>
						<p class="font-bold">
							{row.product.name}
							<StatusBadge value={row.product.active ? 'active' : 'inactive'} />
						</p>
						<p class="text-xs text-[#667085]">{row.product.slug} · {row.product.credits} 积分</p>
					</div>
					<span>{row.price ? money(row.price.amount, row.price.currency) : '暂无价格'}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="grid gap-5">
		<form
			method="POST"
			action="?/saveProduct"
			use:enhance
			class="rounded-xl border bg-white p-4 shadow-sm"
		>
			<h2 class="font-black">保存产品</h2>
			<input
				name="id"
				placeholder="产品 ID（更新时填写）"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
			/>
			<input
				name="slug"
				placeholder="slug"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="name"
				placeholder="名称"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="type"
				placeholder="类型 purchase/subscription"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="credits"
				type="number"
				placeholder="积分"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<label class="mt-3 flex items-center gap-2 text-sm font-bold"
				><input type="checkbox" name="active" checked /> 启用</label
			>
			<ConfirmButton
				label="保存产品"
				message="确定保存产品？"
				class="mt-3 h-10 w-full rounded-lg bg-primary text-sm font-bold text-white"
			/>
		</form>
		<form
			method="POST"
			action="?/savePrice"
			use:enhance
			class="rounded-xl border bg-white p-4 shadow-sm"
		>
			<h2 class="font-black">保存价格</h2>
			<input
				name="id"
				placeholder="价格 ID（更新时填写）"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
			/>
			<input
				name="productId"
				placeholder="产品 ID"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="currency"
				value="CNY"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="amount"
				type="number"
				placeholder="金额（分）"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
				required
			/>
			<input
				name="interval"
				placeholder="interval（月付可填 month）"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
			/>
			<label class="mt-3 flex items-center gap-2 text-sm font-bold"
				><input type="checkbox" name="active" checked /> 启用</label
			>
			<ConfirmButton
				label="保存价格"
				message="确定保存价格？"
				class="mt-3 h-10 w-full rounded-lg border text-sm font-bold text-primary"
			/>
		</form>
	</div>
</section>

<section class="mt-6 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近订单</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.orders.items as row (row.order.id)}
				<div class="flex justify-between gap-4 py-2">
					<div>
						<p class="font-bold">{row.user.email}</p>
						<p class="text-xs text-[#667085]">{row.product.name}</p>
					</div>
					<div class="text-right">
						<p>{money(row.order.amount, row.order.currency)}</p>
						<StatusBadge value={row.order.status} />
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近订阅</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.subscriptions.items as row (row.subscription.id)}
				<div class="flex justify-between gap-4 py-2">
					<div>
						<p class="font-bold">{row.user.email}</p>
						<p class="text-xs text-[#667085]">{row.product.name}</p>
					</div>
					<StatusBadge value={row.subscription.status} />
				</div>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">支付事件</h2>
		<div class="mt-3 space-y-3">
			{#each data.paymentEvents.items as event (event.id)}
				<div class="rounded-lg border p-3 text-sm">
					<p class="font-bold">{event.type}</p>
					<p class="text-xs text-[#667085]">{event.provider} · {event.providerEventId}</p>
					<div class="mt-2"><JsonPreview value={event.payload} /></div>
				</div>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">积分流水</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.creditTransactions.items as row (row.transaction.id)}
				<div class="flex justify-between gap-4 py-2">
					<div>
						<p class="font-bold">{row.user.email}</p>
						<p class="text-xs text-[#667085]">{row.transaction.description}</p>
					</div>
					<strong>{row.transaction.amount}</strong>
				</div>
			{/each}
		</div>
	</div>
</section>
