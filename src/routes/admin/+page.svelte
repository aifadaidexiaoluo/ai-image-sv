<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let metrics = $derived([
		['用户', data.counts.users],
		['任务', data.counts.jobs],
		['订单', data.counts.orders],
		['模板', data.counts.templates]
	]);
</script>

<svelte:head><title>运营后台 - DesignAI</title></svelte:head>
<h1 class="text-2xl font-bold">运营概览</h1>
<div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
	{#each metrics as metric (metric[0])}<div class="rounded-2xl border bg-white p-5">
			<p class="text-sm text-muted-foreground">{metric[0]}</p>
			<strong class="mt-2 block text-3xl">{metric[1]}</strong>
		</div>{/each}
</div>
{#if form?.message}<p class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
		{form.message}
	</p>{/if}
<div class="mt-6 grid gap-6 xl:grid-cols-2">
	<section class="overflow-hidden rounded-2xl border bg-white">
		<h2 class="border-b p-4 font-semibold">最新用户</h2>
		<div class="divide-y">
			{#each data.users as item (item.id)}<div
					class="flex items-center justify-between gap-3 p-4 text-sm"
				>
					<div class="min-w-0">
						<p class="truncate font-medium">{item.name}</p>
						<p class="truncate text-muted-foreground">{item.email}</p>
					</div>
					<form method="POST" action="?/adjustCredits" use:enhance class="flex gap-2">
						<input type="hidden" name="userId" value={item.id} /><input
							name="amount"
							type="number"
							value="20"
							class="h-9 w-20 rounded-lg border px-2"
						/><button class="h-9 rounded-lg border px-3 text-xs">调积分</button>
					</form>
				</div>{/each}
		</div>
	</section>
	<section class="overflow-hidden rounded-2xl border bg-white">
		<h2 class="border-b p-4 font-semibold">最新任务</h2>
		<div class="divide-y">
			{#each data.jobs as job (job.id)}<div
					class="flex items-center justify-between gap-3 p-4 text-sm"
				>
					<div class="min-w-0">
						<p class="font-medium">{job.tool}</p>
						<p class="truncate text-xs text-muted-foreground">{job.id}</p>
					</div>
					<div class="flex items-center gap-2">
						<span class="rounded-full bg-muted px-2 py-1 text-xs">{job.status}</span
						>{#if ['failed', 'partial'].includes(job.status)}<form
								method="POST"
								action="?/retryJob"
								use:enhance
							>
								<input type="hidden" name="jobId" value={job.id} /><button
									class="rounded-lg border px-2 py-1 text-xs">重试</button
								>
							</form>{/if}
					</div>
				</div>{/each}
		</div>
	</section>
</div>
