<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import JsonPreview from '$lib/components/admin/json-preview.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	function date(value: string | Date | null) {
		return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-';
	}
</script>

<svelte:head><title>任务详情 - DesignAI</title></svelte:head>

<a href={resolve('/admin/jobs')} class="text-sm font-bold text-primary">← 返回任务列表</a>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<section class="mt-5 rounded-xl border bg-white p-5 shadow-sm">
	<div class="flex flex-wrap items-start justify-between gap-5">
		<div>
			<h1 class="text-2xl font-black text-[#121826]">{data.job.tool}</h1>
			<p class="mt-2 break-all text-sm text-[#667085]">{data.job.id}</p>
			<div class="mt-3 flex gap-2">
				<StatusBadge value={data.job.status} />
				<StatusBadge value={data.job.stage} />
			</div>
		</div>
		<div class="flex gap-2">
			{#if ['failed', 'partial'].includes(data.job.status)}
				<form method="POST" action="?/retryJob" use:enhance>
					<ConfirmButton
						label="重试任务"
						message="确定重试该任务？"
						class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white"
					/>
				</form>
			{/if}
			{#if ['queued', 'running'].includes(data.job.status)}
				<form method="POST" action="?/cancelJob" use:enhance>
					<ConfirmButton
						label="取消任务"
						message="确定取消该任务？"
						class="h-10 rounded-lg border px-4 text-sm font-bold text-red-600"
					/>
				</form>
			{/if}
			<form method="POST" action="?/deleteJob" use:enhance>
				<ConfirmButton
					label="软删除"
					message="确定软删除该任务？"
					class="h-10 rounded-lg border px-4 text-sm font-bold text-[#667085]"
				/>
			</form>
		</div>
	</div>
	<div class="mt-5 grid gap-4 md:grid-cols-4">
		<div class="rounded-lg bg-[#f8f9fc] p-3">
			<p class="text-xs text-[#667085]">用户</p>
			<a href={resolve(`/admin/users/${data.user.id}`)} class="font-bold text-primary"
				>{data.user.email}</a
			>
		</div>
		<div class="rounded-lg bg-[#f8f9fc] p-3">
			<p class="text-xs text-[#667085]">进度</p>
			<strong>{data.job.completedCount}/{data.job.totalCount} · {data.job.progress ?? 0}%</strong>
		</div>
		<div class="rounded-lg bg-[#f8f9fc] p-3">
			<p class="text-xs text-[#667085]">积分</p>
			<strong>{data.job.consumedCredits}/{data.job.reservedCredits}</strong>
		</div>
		<div class="rounded-lg bg-[#f8f9fc] p-3">
			<p class="text-xs text-[#667085]">创建</p>
			<strong class="text-xs">{date(data.job.createdAt)}</strong>
		</div>
	</div>
</section>

<section class="mt-5 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">Prompt / 错误</h2>
		<p class="mt-3 whitespace-pre-wrap rounded-lg bg-[#f8f9fc] p-3 text-sm">
			{data.job.prompt ?? '无 prompt'}
		</p>
		{#if data.job.errorMessage}
			<p class="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
				{data.job.errorCode}: {data.job.errorMessage}
			</p>
		{/if}
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">参数</h2>
		<div class="mt-3"><JsonPreview value={data.job.parameters} /></div>
	</div>
</section>

<section class="mt-5 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">输出素材</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.outputs as item (item.output.id)}
				<a href={resolve(`/admin/assets/${item.asset.id}`)} class="flex justify-between gap-4 py-2">
					<span>{item.asset.displayName}</span>
					<span class="text-[#667085]">#{item.output.position}</span>
				</a>
			{:else}
				<p class="py-4 text-[#667085]">暂无输出</p>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">事件流</h2>
		<div class="mt-3 space-y-3">
			{#each data.events as event (event.id)}
				<div class="rounded-lg border p-3">
					<div class="flex justify-between gap-3 text-sm">
						<strong>{event.type}</strong>
						<span class="text-xs text-[#667085]">{date(event.createdAt)}</span>
					</div>
					<div class="mt-2"><JsonPreview value={event.payload} /></div>
				</div>
			{:else}
				<p class="py-4 text-[#667085]">暂无事件</p>
			{/each}
		</div>
	</div>
</section>
