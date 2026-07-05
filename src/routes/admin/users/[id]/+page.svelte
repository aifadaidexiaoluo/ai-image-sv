<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function date(value: string | Date | null) {
		return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-';
	}
</script>

<svelte:head><title>{data.user.name} - 用户详情</title></svelte:head>

<a href={resolve('/admin/users')} class="text-sm font-bold text-primary">← 返回用户列表</a>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<section class="mt-5 rounded-xl border bg-white p-5 shadow-sm">
	<div class="flex flex-wrap items-start justify-between gap-5">
		<div>
			<h1 class="text-2xl font-black text-[#121826]">{data.user.name}</h1>
			<p class="mt-2 text-sm text-[#667085]">{data.user.email}</p>
			<div class="mt-3 flex gap-2">
				<StatusBadge value={data.user.role} />
				<StatusBadge value={data.user.banned ? 'banned' : 'active'} />
			</div>
		</div>
		<div class="grid gap-2 sm:grid-cols-3">
			<div class="rounded-lg bg-[#f8f9fc] p-3">
				<p class="text-xs text-[#667085]">余额</p>
				<strong>{data.wallet.balance}</strong>
			</div>
			<div class="rounded-lg bg-[#f8f9fc] p-3">
				<p class="text-xs text-[#667085]">预占</p>
				<strong>{data.wallet.reserved}</strong>
			</div>
			<div class="rounded-lg bg-[#f8f9fc] p-3">
				<p class="text-xs text-[#667085]">注册</p>
				<strong class="text-xs">{date(data.user.createdAt)}</strong>
			</div>
		</div>
	</div>
</section>

<section class="mt-5 grid gap-5 xl:grid-cols-3">
	<form
		method="POST"
		action="?/adjustCredits"
		use:enhance
		class="rounded-xl border bg-white p-4 shadow-sm"
	>
		<h2 class="font-black">调整积分</h2>
		<input
			name="amount"
			type="number"
			value="20"
			class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
		/>
		<ConfirmButton
			label="确认调整"
			message="确定调整该用户积分？"
			class="mt-3 h-10 w-full rounded-lg bg-primary text-sm font-bold text-white"
		/>
	</form>
	<form
		method="POST"
		action="?/updateRole"
		use:enhance
		class="rounded-xl border bg-white p-4 shadow-sm"
	>
		<h2 class="font-black">角色</h2>
		<select
			name="role"
			class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
			value={data.user.role}
		>
			<option value="user">user</option>
			<option value="admin">admin</option>
		</select>
		<ConfirmButton
			label="保存角色"
			message="确定更新该用户角色？"
			class="mt-3 h-10 w-full rounded-lg border text-sm font-bold text-primary"
		/>
	</form>
	{#if data.user.banned}
		<form
			method="POST"
			action="?/unbanUser"
			use:enhance
			class="rounded-xl border bg-white p-4 shadow-sm"
		>
			<h2 class="font-black">封禁状态</h2>
			<p class="mt-3 text-sm text-[#667085]">{data.user.banReason ?? '已封禁'}</p>
			<ConfirmButton
				label="解封用户"
				message="确定解封该用户？"
				class="mt-3 h-10 w-full rounded-lg border text-sm font-bold text-primary"
			/>
		</form>
	{:else}
		<form
			method="POST"
			action="?/banUser"
			use:enhance
			class="rounded-xl border bg-white p-4 shadow-sm"
		>
			<h2 class="font-black">封禁用户</h2>
			<input
				name="reason"
				value="管理员操作"
				class="mt-3 h-10 w-full rounded-lg border px-3 text-sm"
			/>
			<ConfirmButton
				label="封禁用户"
				message="确定封禁该用户？"
				class="mt-3 h-10 w-full rounded-lg border text-sm font-bold text-red-600"
			/>
		</form>
	{/if}
</section>

<section class="mt-5 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近积分流水</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.transactions as item (item.id)}
				<div class="flex justify-between gap-4 py-2">
					<span>{item.description}</span>
					<strong>{item.amount}</strong>
				</div>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近任务</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.jobs as job (job.id)}
				<a href={resolve(`/admin/jobs/${job.id}`)} class="flex justify-between gap-4 py-2">
					<span>{job.tool}</span>
					<StatusBadge value={job.status} />
				</a>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">最近素材</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.assets as asset (asset.id)}
				<a href={resolve(`/admin/assets/${asset.id}`)} class="flex justify-between gap-4 py-2">
					<span class="truncate">{asset.displayName}</span>
					<span class="text-[#667085]">{asset.kind}</span>
				</a>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">组织关系</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.memberships as item (item.member.id)}
				<div class="flex justify-between gap-4 py-2">
					<span>{item.organization.name}</span>
					<span class="text-[#667085]">{item.member.role}</span>
				</div>
			{:else}
				<p class="py-4 text-[#667085]">暂无组织</p>
			{/each}
		</div>
	</div>
</section>
