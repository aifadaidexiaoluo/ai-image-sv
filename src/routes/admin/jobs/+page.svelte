<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import PaginationBar from '$lib/components/admin/pagination-bar.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	function date(value: string | Date) {
		return new Date(value).toLocaleString('zh-CN', { hour12: false });
	}
</script>

<svelte:head><title>任务管理 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">任务管理</h1>
<p class="mt-2 text-sm text-[#667085]">排查生成任务、重试失败任务，或取消仍在队列中的任务。</p>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<form
	class="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_150px_160px_120px]"
	method="GET"
>
	<input
		name="keyword"
		value={data.filters.keyword}
		placeholder="搜索 prompt 或错误"
		class="h-10 rounded-lg border px-3 text-sm"
	/>
	<select name="status" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.status}>
		<option value="all">全部状态</option>
		<option value="queued">queued</option>
		<option value="running">running</option>
		<option value="succeeded">succeeded</option>
		<option value="partial">partial</option>
		<option value="failed">failed</option>
		<option value="canceled">canceled</option>
	</select>
	<select name="tool" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.tool}>
		<option value="all">全部工具</option>
		<option value="product">商品图</option>
		<option value="scene">场景图</option>
		<option value="remove-background">智能抠图</option>
	</select>
	<button class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">筛选</button>
</form>

<section class="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
	<div class="overflow-x-auto">
		<table class="w-full min-w-[1080px] text-sm">
			<thead class="bg-[#f8f9fc] text-left text-xs text-[#667085]">
				<tr>
					<th class="px-4 py-3">任务</th>
					<th class="px-4 py-3">用户</th>
					<th class="px-4 py-3">状态</th>
					<th class="px-4 py-3">进度</th>
					<th class="px-4 py-3">积分</th>
					<th class="px-4 py-3">创建时间</th>
					<th class="px-4 py-3 text-right">操作</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each data.items as row (row.job.id)}
					<tr>
						<td class="px-4 py-3">
							<a href={resolve(`/admin/jobs/${row.job.id}`)} class="font-bold text-primary"
								>{row.job.tool}</a
							>
							<p class="mt-1 max-w-xs truncate text-xs text-[#667085]">
								{row.job.prompt ?? row.job.id}
							</p>
						</td>
						<td class="px-4 py-3">
							<a href={resolve(`/admin/users/${row.user.id}`)} class="font-bold">{row.user.email}</a
							>
						</td>
						<td class="px-4 py-3"><StatusBadge value={row.job.status} /></td>
						<td class="px-4 py-3"
							>{row.job.completedCount}/{row.job.totalCount} · {row.job.progress ?? 0}%</td
						>
						<td class="px-4 py-3">{row.job.consumedCredits}/{row.job.reservedCredits}</td>
						<td class="px-4 py-3 text-[#667085]">{date(row.job.createdAt)}</td>
						<td class="px-4 py-3">
							<div class="flex justify-end gap-2">
								{#if ['failed', 'partial'].includes(row.job.status)}
									<form method="POST" action="?/retryJob" use:enhance>
										<input type="hidden" name="jobId" value={row.job.id} />
										<ConfirmButton
											label="重试"
											message="确定重试该任务？"
											class="h-8 rounded-lg border px-2 text-xs font-bold text-primary"
										/>
									</form>
								{/if}
								{#if ['queued', 'running'].includes(row.job.status)}
									<form method="POST" action="?/cancelJob" use:enhance>
										<input type="hidden" name="jobId" value={row.job.id} />
										<ConfirmButton
											label="取消"
											message="确定取消该任务？"
											class="h-8 rounded-lg border px-2 text-xs font-bold text-red-600"
										/>
									</form>
								{/if}
								<form method="POST" action="?/deleteJob" use:enhance>
									<input type="hidden" name="jobId" value={row.job.id} />
									<ConfirmButton
										label="删除"
										message="确定软删除该任务？"
										class="h-8 rounded-lg border px-2 text-xs font-bold text-[#667085]"
									/>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<PaginationBar page={data.page} totalPages={data.totalPages} total={data.total} />
</section>
