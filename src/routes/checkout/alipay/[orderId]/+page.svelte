<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>跳转支付宝 - DesignAI</title></svelte:head>

<main class="grid min-h-screen place-items-center bg-[#f7f6ff] p-6">
	<div class="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl">
		<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">ALIPAY</span
		>
		<h1 class="mt-5 text-2xl font-bold">正在跳转支付宝</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			订单 {data.product.name}，金额
			{data.price.currency === 'CNY' ? '¥' : '$'}{(data.price.amount / 100).toFixed(2)}。
		</p>
		<div class="mt-6 text-sm text-muted-foreground">如果页面没有自动跳转，请点击下方按钮。</div>
		<div class="alipay-form mt-6">
			{@html data.formHtml}
		</div>
	</div>
</main>

<style>
	:global(.alipay-form form) {
		display: inline-block;
	}

	:global(.alipay-form input[type='submit']),
	:global(.alipay-form button) {
		min-height: 2.75rem;
		border-radius: 0.75rem;
		background: var(--primary);
		padding: 0 1.25rem;
		font-weight: 600;
		color: var(--primary-foreground);
	}
</style>
