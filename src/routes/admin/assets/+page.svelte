<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import PaginationBar from '$lib/components/admin/pagination-bar.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	function size(value: number) {
		return value > 1024 * 1024
			? `${(value / 1024 / 1024).toFixed(1)} MB`
			: `${Math.round(value / 1024)} KB`;
	}
</script>

<svelte:head><title>素材管理 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">素材管理</h1>
<p class="mt-2 text-sm text-[#667085]">查看素材元数据、软删除或恢复素材。</p>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<form
	class="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_150px_150px_120px]"
	method="GET"
>
	<input
		name="keyword"
		value={data.filters.keyword}
		placeholder="搜索名称或 object key"
		class="h-10 rounded-lg border px-3 text-sm"
	/>
	<select name="kind" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.kind}>
		<option value="all">全部类型</option>
		<option value="source">source</option>
		<option value="output">output</option>
		<option value="thumbnail">thumbnail</option>
		<option value="template">template</option>
	</select>
	<select name="deleted" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.deleted}>
		<option value="false">未删除</option>
		<option value="true">已删除</option>
		<option value="all">全部</option>
	</select>
	<button class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">筛选</button>
</form>

<section class="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
	<div class="overflow-x-auto">
		<table class="w-full min-w-[980px] text-sm">
			<thead class="bg-[#f8f9fc] text-left text-xs text-[#667085]">
				<tr>
					<th class="px-4 py-3">素材</th>
					<th class="px-4 py-3">用户</th>
					<th class="px-4 py-3">类型</th>
					<th class="px-4 py-3">尺寸</th>
					<th class="px-4 py-3">大小</th>
					<th class="px-4 py-3">状态</th>
					<th class="px-4 py-3 text-right">操作</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each data.items as row (row.asset.id)}
					<tr>
						<td class="px-4 py-3">
							<a href={resolve(`/admin/assets/${row.asset.id}`)} class="font-bold text-primary"
								>{row.asset.displayName}</a
							>
							<p class="mt-1 max-w-xs truncate text-xs text-[#667085]">{row.asset.objectKey}</p>
						</td>
						<td class="px-4 py-3">{row.user?.email ?? '系统素材'}</td>
						<td class="px-4 py-3">{row.asset.kind}</td>
						<td class="px-4 py-3">{row.asset.width ?? '-'} × {row.asset.height ?? '-'}</td>
						<td class="px-4 py-3">{size(row.asset.sizeBytes)}</td>
						<td class="px-4 py-3"
							><StatusBadge value={row.asset.deletedAt ? 'deleted' : 'active'} /></td
						>
						<td class="px-4 py-3">
							<div class="flex justify-end">
								{#if row.asset.deletedAt}
									<form method="POST" action="?/restoreAsset" use:enhance>
										<input type="hidden" name="assetId" value={row.asset.id} />
										<ConfirmButton
											label="恢复"
											message="确定恢复该素材？"
											class="h-8 rounded-lg border px-2 text-xs font-bold text-primary"
										/>
									</form>
								{:else}
									<form method="POST" action="?/deleteAsset" use:enhance>
										<input type="hidden" name="assetId" value={row.asset.id} />
										<ConfirmButton
											label="软删除"
											message="确定软删除该素材？"
											class="h-8 rounded-lg border px-2 text-xs font-bold text-red-600"
										/>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<PaginationBar page={data.page} totalPages={data.totalPages} total={data.total} />
</section>
