<script lang="ts">
	import { resolve } from '$app/paths';
	import DashboardCharts from '$lib/components/admin/dashboard-charts.svelte';
	import MetricCard from '$lib/components/admin/metric-card.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import {
		CircleDollarSign,
		Coins,
		Image,
		ReceiptText,
		ShieldAlert,
		Sparkles,
		UserPlus,
		Users
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function date(value: string | Date | null) {
		if (!value) return '-';
		return new Date(value).toLocaleString('zh-CN', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	function money(value: number) {
		return `¥${(value / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
	}
</script>

<svelte:head><title>管理仪表盘 - DesignAI</title></svelte:head>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-black text-[#121826]">管理仪表盘</h1>
		<p class="mt-2 text-sm font-medium text-[#667085]">用户、生成任务、收入和积分的运营总览。</p>
	</div>
</div>

<section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<MetricCard
		label="用户总数"
		value={data.cards.users}
		helper={`封禁 ${data.cards.bannedUsers} 人`}
		icon={Users}
	/>
	<MetricCard
		label="今日新增"
		value={data.cards.todayUsers}
		helper="按本地数据库日期统计"
		icon={UserPlus}
	/>
	<MetricCard
		label="任务总量"
		value={data.cards.jobs}
		helper={`失败/部分失败 ${data.cards.failedJobs}`}
		icon={Sparkles}
	/>
	<MetricCard label="素材总量" value={data.cards.assets} helper="未删除素材" icon={Image} />
	<MetricCard
		label="付费收入"
		value={money(data.cards.paidRevenue)}
		helper="已支付订单金额"
		icon={CircleDollarSign}
	/>
	<MetricCard
		label="活跃订阅"
		value={data.cards.activeSubscriptions}
		helper="status=active"
		icon={ReceiptText}
	/>
	<MetricCard
		label="积分余额"
		value={data.cards.walletBalance}
		helper={`预占 ${data.cards.walletReserved}`}
		icon={Coins}
	/>
	<MetricCard
		label="异常任务"
		value={data.cards.failedJobs}
		helper="failed + partial"
		icon={ShieldAlert}
	/>
</section>

<section class="mt-6">
	<DashboardCharts charts={data.charts} />
</section>

<section class="mt-6 grid gap-5 xl:grid-cols-2">
	<div class="overflow-hidden rounded-xl border border-[#e5e8f3] bg-white shadow-sm">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="font-black text-[#121826]">最近用户</h2>
			<a href={resolve('/admin/users')} class="text-sm font-bold text-primary">查看全部</a>
		</div>
		<div class="divide-y">
			{#each data.recent.users as item (item.id)}
				<a
					href={resolve(`/admin/users/${item.id}`)}
					class="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-[#fafbff]"
				>
					<div class="min-w-0">
						<p class="truncate font-bold text-[#121826]">{item.name}</p>
						<p class="truncate text-xs text-[#667085]">{item.email}</p>
					</div>
					<span class="text-xs text-[#8a94ad]">{date(item.createdAt)}</span>
				</a>
			{/each}
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-[#e5e8f3] bg-white shadow-sm">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="font-black text-[#121826]">最近异常任务</h2>
			<a href={resolve('/admin/jobs?status=failed')} class="text-sm font-bold text-primary"
				>查看全部</a
			>
		</div>
		<div class="divide-y">
			{#each data.recent.failedJobs as job (job.id)}
				<a
					href={resolve(`/admin/jobs/${job.id}`)}
					class="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-[#fafbff]"
				>
					<div class="min-w-0">
						<p class="truncate font-bold text-[#121826]">{job.tool}</p>
						<p class="truncate text-xs text-[#667085]">{job.errorMessage ?? job.id}</p>
					</div>
					<StatusBadge value={job.status} />
				</a>
			{:else}
				<p class="px-4 py-8 text-center text-sm text-[#667085]">暂无异常任务</p>
			{/each}
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-[#e5e8f3] bg-white shadow-sm">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="font-black text-[#121826]">最近订单</h2>
			<a href={resolve('/admin/billing')} class="text-sm font-bold text-primary">查看全部</a>
		</div>
		<div class="divide-y">
			{#each data.recent.orders as order (order.id)}
				<div class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
					<div class="min-w-0">
						<p class="truncate font-bold text-[#121826]">{money(order.amount)}</p>
						<p class="truncate text-xs text-[#667085]">
							{order.provider} · {date(order.createdAt)}
						</p>
					</div>
					<StatusBadge value={order.status} />
				</div>
			{/each}
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-[#e5e8f3] bg-white shadow-sm">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<h2 class="font-black text-[#121826]">最近审计</h2>
			<a href={resolve('/admin/audit')} class="text-sm font-bold text-primary">查看全部</a>
		</div>
		<div class="divide-y">
			{#each data.recent.auditLogs as log (log.id)}
				<div class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
					<div class="min-w-0">
						<p class="truncate font-bold text-[#121826]">{log.action}</p>
						<p class="truncate text-xs text-[#667085]">{log.targetType} · {log.targetId}</p>
					</div>
					<span class="text-xs text-[#8a94ad]">{date(log.createdAt)}</span>
				</div>
			{:else}
				<p class="px-4 py-8 text-center text-sm text-[#667085]">暂无审计记录</p>
			{/each}
		</div>
	</div>
</section>
