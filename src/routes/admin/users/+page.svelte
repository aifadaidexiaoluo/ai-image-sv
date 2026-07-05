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

<svelte:head><title>用户管理 - DesignAI</title></svelte:head>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-black text-[#121826]">用户管理</h1>
		<p class="mt-2 text-sm text-[#667085]">搜索用户、查看钱包，并执行角色、封禁和积分操作。</p>
	</div>
</div>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<form
	class="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_140px_140px_120px]"
	method="GET"
>
	<input
		name="keyword"
		value={data.filters.keyword}
		placeholder="搜索昵称或邮箱"
		class="h-10 rounded-lg border px-3 text-sm"
	/>
	<select name="role" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.role}>
		<option value="all">全部角色</option>
		<option value="user">user</option>
		<option value="admin">admin</option>
	</select>
	<select name="banned" class="h-10 rounded-lg border px-3 text-sm" value={data.filters.banned}>
		<option value="all">全部状态</option>
		<option value="false">正常</option>
		<option value="true">已封禁</option>
	</select>
	<button class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">筛选</button>
</form>

<section class="mt-5 overflow-hidden rounded-xl border border-[#e5e8f3] bg-white shadow-sm">
	<div class="overflow-x-auto">
		<table class="w-full min-w-[980px] text-sm">
			<thead class="bg-[#f8f9fc] text-left text-xs text-[#667085]">
				<tr>
					<th class="px-4 py-3">用户</th>
					<th class="px-4 py-3">角色</th>
					<th class="px-4 py-3">状态</th>
					<th class="px-4 py-3">积分</th>
					<th class="px-4 py-3">注册时间</th>
					<th class="px-4 py-3 text-right">操作</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each data.items as row (row.user.id)}
					<tr class="align-top">
						<td class="px-4 py-3">
							<a href={resolve(`/admin/users/${row.user.id}`)} class="font-bold text-primary"
								>{row.user.name}</a
							>
							<p class="mt-1 text-xs text-[#667085]">{row.user.email}</p>
						</td>
						<td class="px-4 py-3"><StatusBadge value={row.user.role} /></td>
						<td class="px-4 py-3"><StatusBadge value={row.user.banned ? 'banned' : 'active'} /></td>
						<td class="px-4 py-3">{row.wallet?.balance ?? 0} / 预占 {row.wallet?.reserved ?? 0}</td>
						<td class="px-4 py-3 text-[#667085]">{date(row.user.createdAt)}</td>
						<td class="px-4 py-3">
							<div class="flex justify-end gap-2">
								<form method="POST" action="?/adjustCredits" use:enhance class="flex gap-1">
									<input type="hidden" name="userId" value={row.user.id} />
									<input
										name="amount"
										type="number"
										value="20"
										class="h-8 w-20 rounded-lg border px-2 text-xs"
									/>
									<button class="h-8 rounded-lg border px-2 text-xs font-bold text-primary"
										>调积分</button
									>
								</form>
								{#if row.user.banned}
									<form method="POST" action="?/unbanUser" use:enhance>
										<input type="hidden" name="userId" value={row.user.id} />
										<ConfirmButton
											label="解封"
											message="确定解封该用户？"
											class="h-8 rounded-lg border px-2 text-xs font-bold text-primary"
										/>
									</form>
								{:else}
									<form method="POST" action="?/banUser" use:enhance>
										<input type="hidden" name="userId" value={row.user.id} />
										<input type="hidden" name="reason" value="管理员操作" />
										<ConfirmButton
											label="封禁"
											message="确定封禁该用户？"
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
