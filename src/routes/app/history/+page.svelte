<script lang="ts">
	import { untrack } from 'svelte';
	import { Download, Eye, MoreHorizontal, Pencil, Search, SlidersHorizontal } from '@lucide/svelte';
	import { toolLabels, toolTypeLabels } from '$lib/app-catalog';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let selectedId = $state(untrack(() => data.jobs[0]?.id ?? ''));
	const tabs = [
		{ id: 'all', label: '全部记录' },
		{ id: 'product', label: '商品图' },
		{ id: 'scene', label: '场景图' },
		{ id: 'remove-background', label: '智能抠图' }
	];
	const selected = $derived(data.jobs.find((job) => job?.id === selectedId) ?? data.jobs[0]);

	function thumbnail(job: any) {
		return job?.outputs?.[0]?.url ?? '/images/app/products/perfume-main.png';
	}

	function hrefFor(params: Record<string, string | number | undefined>) {
		const search = new URLSearchParams();
		if (data.filters.tool && data.filters.tool !== 'all') search.set('tool', data.filters.tool);
		if (data.filters.keyword) search.set('keyword', data.filters.keyword);
		if (data.filters.sort && data.filters.sort !== 'latest') search.set('sort', data.filters.sort);
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined || value === '' || value === 'all') search.delete(key);
			else search.set(key, String(value));
		}
		const text = search.toString();
		return text ? `/app/history?${text}` : '/app/history';
	}
</script>

<svelte:head><title>历史记录 - DesignAI</title></svelte:head>
<div class="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">历史记录</h1>
		<p class="mt-2 text-sm text-[#65708a]">查看和管理您所有的创作记录</p>
	</div>
	<form class="flex flex-wrap gap-3">
		<label
			class="flex h-11 w-72 items-center gap-2 rounded-xl border border-[#dde2f2] bg-white px-3 text-sm text-[#8a94ad] shadow-sm"
		>
			<Search class="size-4" />
			<input
				name="keyword"
				value={data.filters.keyword}
				class="min-w-0 flex-1 bg-transparent outline-none"
				placeholder="搜索关键词"
			/>
		</label>
		<input type="hidden" name="tool" value={data.filters.tool === 'all' ? '' : data.filters.tool} />
		<button
			class="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dde2f2] bg-white px-4 text-sm font-bold text-[#65708a]"
			><SlidersHorizontal class="size-4" />筛选</button
		>
	</form>
</div>

<div class="grid gap-5 xl:grid-cols-[1fr_320px]">
	<section>
		<div class="mb-4 flex flex-wrap gap-2">
			{#each tabs as tab}
				<a
					href={hrefFor({ tool: tab.id, page: 1 })}
					class={`h-10 rounded-lg px-5 py-2 text-sm font-bold ${data.filters.tool === tab.id || (!data.filters.tool && tab.id === 'all') ? 'bg-primary text-white' : 'border border-[#dde2f2] bg-white text-[#65708a]'}`}
					>{tab.label}</a
				>
			{/each}
		</div>
		<div class="overflow-hidden rounded-2xl border border-[#e1e5f2] bg-white shadow-sm">
			<div
				class="hidden grid-cols-[90px_1.4fr_1fr_120px_160px_150px] border-b border-[#eef1f7] px-5 py-4 text-sm font-bold text-[#65708a] lg:grid"
			>
				<span>类型</span><span>作品名称</span><span>生成信息</span><span>尺寸</span><span
					>创建时间</span
				><span>操作</span>
			</div>
			{#if data.jobs.length}
				{#each data.jobs as job (job!.id)}
					{#if job}<button
							onclick={() => (selectedId = job.id)}
							class={`grid w-full gap-4 border-b border-[#eef1f7] p-5 text-left last:border-b-0 lg:grid-cols-[90px_1.4fr_1fr_120px_160px_150px] ${selectedId === job.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'bg-white hover:bg-[#fafbff]'}`}
						>
							<div class="text-sm font-bold text-[#65708a]">
								<span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"
									>{toolLabels[job.tool]?.slice(0, 1)}</span
								><span class="mt-2 block">{toolLabels[job.tool]}</span>
							</div>
							<div class="flex min-w-0 items-center gap-3">
								<img
									src={thumbnail(job)}
									alt=""
									class="size-16 rounded-lg object-cover ring-1 ring-[#edf0f7]"
								/>
								<div class="min-w-0">
									<p class="truncate font-black text-[#121826]">
										{job.prompt || toolTypeLabels[job.tool]}
									</p>
									<p class="mt-1 truncate text-sm text-[#65708a]">
										{job.status === 'succeeded' ? '已完成' : job.stage}
									</p>
								</div>
							</div>
							<span
								class="self-center rounded-lg bg-[#f1f3f9] px-3 py-1 text-sm font-bold text-[#65708a]"
								>{job.parameters?.generationMode === 'reference'
									? '参考图生成'
									: toolTypeLabels[job.tool]}</span
							>
							<span class="self-center text-sm font-medium text-[#65708a]"
								>{String(job.parameters?.size ?? '1024 x 1024').replace('x', ' × ')}</span
							>
							<span class="self-center text-sm font-medium text-[#65708a]"
								>{new Date(job.createdAt).toLocaleString('zh-CN')}</span
							>
							<span class="flex items-center gap-2 self-center">
								<a
									href={`/api/jobs/${job.id}`}
									class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
									><Eye class="size-4" /></a
								>
								{#if job.outputs?.[0]}<a
										href={job.outputs[0].url}
										target="_blank"
										class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
										><Download class="size-4" /></a
									>{/if}
								<span
									class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
									><MoreHorizontal class="size-4" /></span
								>
							</span>
						</button>{/if}
				{/each}
			{:else}
				<div class="grid min-h-64 place-items-center text-center text-sm text-[#65708a]">
					暂无历史任务
				</div>
			{/if}
		</div>
		<div class="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#65708a]">
			<span>共 {data.total} 条</span>
			<a
				class="rounded-lg border border-[#dde2f2] bg-white px-3 py-2"
				href={hrefFor({ page: Math.max(1, data.page - 1) })}>上一页</a
			>
			<span class="rounded-lg border border-primary bg-white px-3 py-2 text-primary"
				>{data.page}</span
			>
			<a
				class="rounded-lg border border-[#dde2f2] bg-white px-3 py-2"
				href={hrefFor({ page: data.page + 1 })}>下一页</a
			>
		</div>
	</section>

	<aside class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
		<h2 class="font-black text-[#121826]">作品预览</h2>
		{#if selected}
			<img
				src={thumbnail(selected)}
				alt=""
				class="mt-4 aspect-square w-full rounded-xl object-cover"
			/>
			<h3 class="mt-5 flex items-center gap-2 text-xl font-black text-[#121826]">
				{selected.prompt || toolTypeLabels[selected.tool]}<Pencil class="size-4 text-primary" />
			</h3>
			<div class="mt-5 space-y-4 text-sm">
				<div class="flex justify-between">
					<span class="text-[#65708a]">创建时间</span><span
						>{new Date(selected.createdAt).toLocaleString('zh-CN')}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">类型</span><span>{toolLabels[selected.tool]}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">尺寸</span><span
						>{String(selected.parameters?.size ?? '1024 x 1024').replace('x', ' × ')}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">使用积分</span><strong
						>消耗 {selected.consumedCredits} 积分</strong
					>
				</div>
			</div>
			<a
				href="/app/create/product"
				class="mt-6 flex h-11 items-center justify-center rounded-xl bg-primary font-black text-white"
				>再次生成</a
			>
			<a
				href="/app/create/product"
				class="mt-3 flex h-11 items-center justify-center rounded-xl border border-primary font-black text-primary"
				>编辑并重新生成</a
			>
		{:else}
			<p class="mt-8 text-sm text-[#65708a]">选择一条记录后查看详情。</p>
		{/if}
	</aside>
</div>
