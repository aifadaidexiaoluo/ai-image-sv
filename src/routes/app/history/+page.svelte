<script lang="ts">
	import JobCard from '$lib/components/app/job-card.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>历史记录 - DesignAI</title></svelte:head>
<h1 class="text-2xl font-bold">历史记录</h1>
<p class="mt-1 text-sm text-muted-foreground">查看所有生成任务、实时状态和输出结果。</p>
<div class="mt-6 space-y-4">
	{#if data.jobs.length}{#each data.jobs as job (job!.id)}{#if job}<JobCard
					initialJob={job}
				/>{/if}{/each}{:else}<div
			class="rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-muted-foreground"
		>
			暂无历史任务
		</div>{/if}
</div>
