<script lang="ts">
	import ChartContainer from '$lib/components/ui/chart/chart-container.svelte';
	import type { ChartConfig } from '$lib/components/ui/chart/chart-utils';

	type Point = { label: string } & Record<string, number | string>;
	type DashboardCharts = {
		users: { label: string; users: number }[];
		jobs: { label: string; created: number; succeeded: number; failed: number }[];
		tools: { tool: string; label: string; value: number }[];
		orders: { label: string; amount: number }[];
		credits: { label: string; grant: number; consume: number }[];
	};

	let { charts }: { charts: DashboardCharts } = $props();

	const usersConfig = { users: { label: '新增用户', color: '#5b3df5' } } satisfies ChartConfig;
	const jobsConfig = {
		created: { label: '创建', color: '#5b3df5' },
		succeeded: { label: '成功', color: '#2db69b' },
		failed: { label: '失败', color: '#ef4444' }
	} satisfies ChartConfig;
	const toolsConfig = {
		product: { label: '商品图', color: '#5b3df5' },
		scene: { label: '场景图', color: '#2f80ed' },
		'remove-background': { label: '智能抠图', color: '#2db69b' }
	} satisfies ChartConfig;
	const ordersConfig = { amount: { label: '收入', color: '#f59e0b' } } satisfies ChartConfig;
	const creditsConfig = {
		grant: { label: '发放', color: '#2db69b' },
		consume: { label: '消耗', color: '#ef4444' }
	} satisfies ChartConfig;

	function maxValue(rows: Point[], keys: string[]) {
		return Math.max(1, ...rows.flatMap((row) => keys.map((key) => Number(row[key] ?? 0))));
	}

	function linePath(rows: Point[], key: string, max: number) {
		if (!rows.length) return '';
		return rows
			.map((row, index) => {
				const x = rows.length === 1 ? 24 : 24 + (index / (rows.length - 1)) * 552;
				const y = 188 - (Number(row[key] ?? 0) / max) * 156;
				return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
			})
			.join(' ');
	}

	function arcPath(start: number, end: number, radius = 70) {
		const largeArc = end - start > Math.PI ? 1 : 0;
		const sx = 100 + Math.cos(start) * radius;
		const sy = 90 + Math.sin(start) * radius;
		const ex = 100 + Math.cos(end) * radius;
		const ey = 90 + Math.sin(end) * radius;
		return `M 100 90 L ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} Z`;
	}

	function pieAngles(index: number, total: number) {
		const values = charts.tools.map((item) => item.value);
		const startValue = values.slice(0, index).reduce((sum, value) => sum + value, 0);
		const start = (startValue / total) * Math.PI * 2 - Math.PI / 2;
		const end = start + ((values[index] ?? 0) / total) * Math.PI * 2;
		return { start, end };
	}
</script>

{#snippet LineChart({ rows, keys, colors }: { rows: Point[]; keys: string[]; colors: string[] })}
	{@const max = maxValue(rows, keys)}
	<svg viewBox="0 0 600 220" class="size-full" role="img">
		{#each [0, 1, 2, 3] as tick (tick)}
			<line x1="24" x2="576" y1={32 + tick * 52} y2={32 + tick * 52} stroke="#eef1f7" />
		{/each}
		{#each keys as key, index (key)}
			<path d={linePath(rows, key, max)} fill="none" stroke={colors[index]} stroke-width="3" />
		{/each}
		{#each rows as row, index (row.label)}
			{#if index === 0 || index === rows.length - 1 || index % 4 === 0}
				<text
					x={rows.length === 1 ? 24 : 24 + (index / (rows.length - 1)) * 552}
					y="214"
					text-anchor="middle"
					class="fill-[#8a94ad] text-[11px]">{row.label}</text
				>
			{/if}
		{/each}
	</svg>
{/snippet}

{#snippet BarChart({ rows, keys, colors }: { rows: Point[]; keys: string[]; colors: string[] })}
	{@const max = maxValue(rows, keys)}
	<svg viewBox="0 0 600 220" class="size-full" role="img">
		{#each [0, 1, 2, 3] as tick (tick)}
			<line x1="24" x2="576" y1={32 + tick * 52} y2={32 + tick * 52} stroke="#eef1f7" />
		{/each}
		{#each rows as row, index (row.label)}
			{@const groupWidth = 552 / rows.length}
			{@const startX = 24 + index * groupWidth}
			{#each keys as key, keyIndex (key)}
				{@const height = (Number(row[key] ?? 0) / max) * 156}
				<rect
					x={startX + 5 + keyIndex * ((groupWidth - 10) / keys.length)}
					y={188 - height}
					width={Math.max(3, (groupWidth - 12) / keys.length)}
					{height}
					rx="4"
					fill={colors[keyIndex]}
				/>
			{/each}
		{/each}
	</svg>
{/snippet}

<div class="grid gap-5 xl:grid-cols-2">
	<section class="rounded-xl border border-[#e5e8f3] bg-white p-5 shadow-sm">
		<h2 class="text-base font-black text-[#121826]">近 14 天新增用户</h2>
		<ChartContainer config={usersConfig} class="mt-4 h-64 w-full">
			{@render LineChart({ rows: charts.users, keys: ['users'], colors: ['#5b3df5'] })}
		</ChartContainer>
	</section>

	<section class="rounded-xl border border-[#e5e8f3] bg-white p-5 shadow-sm">
		<h2 class="text-base font-black text-[#121826]">任务趋势</h2>
		<ChartContainer config={jobsConfig} class="mt-4 h-64 w-full">
			{@render LineChart({
				rows: charts.jobs,
				keys: ['created', 'succeeded', 'failed'],
				colors: ['#5b3df5', '#2db69b', '#ef4444']
			})}
		</ChartContainer>
	</section>

	<section class="rounded-xl border border-[#e5e8f3] bg-white p-5 shadow-sm">
		<h2 class="text-base font-black text-[#121826]">任务类型分布</h2>
		<ChartContainer config={toolsConfig} class="mt-4 h-64 w-full">
			{@const total = Math.max(
				1,
				charts.tools.reduce((sum, item) => sum + item.value, 0)
			)}
			{@const colors = ['#5b3df5', '#2f80ed', '#2db69b']}
			<svg viewBox="0 0 360 220" class="size-full" role="img">
				{#each charts.tools as item, index (item.tool)}
					{@const angles = pieAngles(index, total)}
					<path data-tool={item.tool} d={arcPath(angles.start, angles.end)} fill={colors[index]} />
				{/each}
				<circle cx="100" cy="90" r="42" fill="white" />
				<text x="100" y="96" text-anchor="middle" class="fill-[#121826] text-xl font-bold"
					>{total}</text
				>
				{#each charts.tools as item, index (item.tool)}
					<g transform={`translate(210 ${48 + index * 34})`}>
						<rect width="10" height="10" rx="2" fill={colors[index]} />
						<text x="18" y="10" class="fill-[#475467] text-xs">{item.label} · {item.value}</text>
					</g>
				{/each}
			</svg>
		</ChartContainer>
	</section>

	<section class="rounded-xl border border-[#e5e8f3] bg-white p-5 shadow-sm">
		<h2 class="text-base font-black text-[#121826]">收入趋势</h2>
		<ChartContainer config={ordersConfig} class="mt-4 h-64 w-full">
			{@render BarChart({ rows: charts.orders, keys: ['amount'], colors: ['#f59e0b'] })}
		</ChartContainer>
	</section>

	<section class="rounded-xl border border-[#e5e8f3] bg-white p-5 shadow-sm xl:col-span-2">
		<h2 class="text-base font-black text-[#121826]">积分发放 / 消耗</h2>
		<ChartContainer config={creditsConfig} class="mt-4 h-64 w-full">
			{@render BarChart({
				rows: charts.credits,
				keys: ['grant', 'consume'],
				colors: ['#2db69b', '#ef4444']
			})}
		</ChartContainer>
	</section>
</div>
