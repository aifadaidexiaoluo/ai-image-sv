<script lang="ts">
	import JsonPreview from '$lib/components/admin/json-preview.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>系统健康 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">系统健康</h1>
<p class="mt-2 text-sm text-[#667085]">查看数据库、队列、存储配置和最近异常。</p>

<section class="mt-6 grid gap-4 md:grid-cols-3">
	{#each Object.entries(data.checks) as [key, check] (key)}
		<div class="rounded-xl border bg-white p-4 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-black capitalize">{key}</h2>
				<StatusBadge value={check.ok ? 'active' : 'failed'} />
			</div>
			<p class="mt-3 text-sm text-[#667085]">{check.message}</p>
			{#if 'counts' in check && check.counts}
				<div class="mt-3"><JsonPreview value={check.counts} /></div>
			{/if}
		</div>
	{/each}
</section>

<section class="mt-6 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">配置摘要</h2>
		<div class="mt-3"><JsonPreview value={data.config} /></div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近异常任务</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.recentFailedJobs as job (job.id)}
				<div class="flex justify-between gap-4 py-2">
					<span>{job.tool}</span>
					<StatusBadge value={job.status} />
				</div>
			{:else}
				<p class="py-4 text-[#667085]">暂无异常任务</p>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近素材</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.recentAssets as asset (asset.id)}
				<div class="flex justify-between gap-4 py-2">
					<span class="truncate">{asset.displayName}</span>
					<span class="text-[#667085]">{asset.kind}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近支付事件</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.recentPaymentEvents as event (event.id)}
				<div class="flex justify-between gap-4 py-2">
					<span>{event.type}</span>
					<span class="text-[#667085]">{event.provider}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
