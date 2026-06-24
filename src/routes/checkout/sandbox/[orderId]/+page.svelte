<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>沙箱支付 - DesignAI</title></svelte:head>
<main class="grid min-h-screen place-items-center bg-[#f7f6ff] p-6">
	<div class="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
		<span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
			>SANDBOX</span
		>
		<h1 class="mt-5 text-2xl font-bold">确认沙箱订单</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			此页面不会处理真实资金，仅用于验证订单、订阅和积分流程。
		</p>
		<div class="mt-6 rounded-xl bg-muted p-4">
			<p class="font-semibold">{data.product.name}</p>
			<p class="mt-2 text-2xl font-bold">
				{data.price.currency === 'CNY' ? '¥' : '$'}{(data.price.amount / 100).toFixed(2)}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">到账 {data.product.credits} 积分</p>
		</div>
		<div class="mt-6 grid grid-cols-2 gap-3">
			<form method="POST" action="?/cancel">
				<button class="h-11 w-full rounded-xl border">取消</button>
			</form>
			<form method="POST" action="?/confirm">
				<button class="h-11 w-full rounded-xl bg-primary font-semibold text-white"
					>模拟支付成功</button
				>
			</form>
		</div>
	</div>
</main>
