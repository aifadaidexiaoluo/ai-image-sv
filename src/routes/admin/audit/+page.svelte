<script lang="ts">
	import JsonPreview from '$lib/components/admin/json-preview.svelte';
	import PaginationBar from '$lib/components/admin/pagination-bar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	function date(value: string | Date) {
		return new Date(value).toLocaleString('zh-CN', { hour12: false });
	}
</script>

<svelte:head><title>审计日志 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">审计日志</h1>
<p class="mt-2 text-sm text-[#667085]">追踪后台管理员操作和关键变更。</p>

<form
	class="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_180px_160px_120px]"
	method="GET"
>
	<input name="keyword" placeholder="targetId" class="h-10 rounded-lg border px-3 text-sm" />
	<input name="action" placeholder="action" class="h-10 rounded-lg border px-3 text-sm" />
	<input name="targetType" placeholder="targetType" class="h-10 rounded-lg border px-3 text-sm" />
	<button class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">筛选</button>
</form>

<section class="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
	<div class="divide-y">
		{#each data.items as row (row.log.id)}
			<article class="p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-black text-[#121826]">{row.log.action}</p>
						<p class="mt-1 text-xs text-[#667085]">{row.log.targetType} · {row.log.targetId}</p>
					</div>
					<div class="text-right text-xs text-[#667085]">
						<p>{row.actor?.email ?? '系统'}</p>
						<p>{date(row.log.createdAt)}</p>
					</div>
				</div>
				<div class="mt-3"><JsonPreview value={row.log.metadata} /></div>
			</article>
		{/each}
	</div>
	<PaginationBar page={data.page} totalPages={data.totalPages} total={data.total} />
</section>
