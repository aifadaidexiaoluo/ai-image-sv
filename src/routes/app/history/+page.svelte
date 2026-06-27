<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { dashboardFallbackImages, toolLabels, toolTypeLabels } from '$lib/app-catalog';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import {
		Copy,
		Download,
		Eye,
		ImageOff,
		LoaderCircle,
		MoreHorizontal,
		Pencil,
		RotateCcw,
		Search,
		SlidersHorizontal,
		Trash2,
		X
	} from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageData } from './$types';

	type HistoryJob = NonNullable<PageData['jobs'][number]>;
	type HistoryOutput = NonNullable<HistoryJob['outputs']>[number];

	let { data }: { data: PageData } = $props();
	let selectedId = $state(untrack(() => data.jobs[0]?.id ?? ''));
	let selectedOutputIndex = $state(0);
	let previewOpen = $state(false);
	let retryingId = $state('');
	let copiedId = $state('');
	let deletingId = $state('');
	let filterKeyword = $state(untrack(() => data.filters.keyword));
	let filterSort = $state(untrack(() => data.filters.sort));
	let filterPageSize = $state(untrack(() => String(data.pageSize)));

	const tabs = [
		{ id: 'all', label: '全部记录' },
		{ id: 'product', label: '商品图' },
		{ id: 'scene', label: '场景图' },
		{ id: 'remove-background', label: '智能抠图' }
	];

	const sortOptions = [
		{ value: 'latest', label: '按最新' },
		{ value: 'oldest', label: '按最早' }
	];

	const pageSizeOptions = [10, 20, 50];
	const filterControlClass =
		'h-10 rounded-lg border-[#dde2f2] bg-white text-sm font-bold text-[#65708a] shadow-sm transition hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/10';

	const selected = $derived(
		(data.jobs.find((job) => job?.id === selectedId) ?? data.jobs[0]) as HistoryJob | undefined
	);
	const selectedOutputs = $derived(selected?.outputs ?? []);
	const selectedOutput = $derived(selectedOutputs[selectedOutputIndex] ?? selectedOutputs[0]);
	const hasActiveFilters = $derived(
		Boolean(data.filters.keyword) ||
			data.filters.tool !== 'all' ||
			data.filters.sort !== 'latest' ||
			data.pageSize !== 10
	);

	$effect(() => {
		const ids = data.jobs.map((job) => job?.id).filter(Boolean);
		const currentSelectedId = untrack(() => selectedId);
		if (!ids.includes(currentSelectedId)) {
			const nextSelectedId = ids[0] ?? '';
			if (currentSelectedId !== nextSelectedId) selectedId = nextSelectedId;
			if (untrack(() => selectedOutputIndex) !== 0) selectedOutputIndex = 0;
		}
	});

	$effect(() => {
		const currentOutputIndex = untrack(() => selectedOutputIndex);
		if (
			(selectedOutputs.length === 0 && currentOutputIndex !== 0) ||
			(selectedOutputs.length > 0 && currentOutputIndex >= selectedOutputs.length)
		) {
			selectedOutputIndex = 0;
		}
	});

	$effect(() => {
		filterKeyword = data.filters.keyword;
		filterSort = data.filters.sort;
		filterPageSize = String(data.pageSize);
	});

	function selectJob(job: HistoryJob) {
		selectedId = job.id;
		selectedOutputIndex = 0;
	}

	function thumbnail(job: PageData['jobs'][number] | undefined) {
		return (
			job?.outputs?.[0]?.url ??
			(job?.tool ? dashboardFallbackImages[job.tool] : undefined) ??
			'/images/app/products/perfume-main.png'
		);
	}

	function jobTitle(job: HistoryJob) {
		return job.prompt || toolTypeLabels[job.tool] || '生成任务';
	}

	function statusLabel(job: HistoryJob) {
		if (job.status === 'succeeded') return '已完成';
		if (job.status === 'partial') return '部分完成';
		if (job.status === 'failed') return '生成失败';
		if (job.status === 'canceled') return '已取消';
		return job.stage;
	}

	function jobTerminal(job: HistoryJob) {
		return ['succeeded', 'partial', 'failed', 'canceled'].includes(job.status);
	}

	function sizeLabel(job: HistoryJob) {
		return String(job.parameters?.size ?? '1024 x 1024').replace('x', ' × ');
	}

	function generationLabel(job: HistoryJob) {
		return job.parameters?.generationMode === 'reference' ? '参考图生成' : toolTypeLabels[job.tool];
	}

	function createHref(job: HistoryJob) {
		const path =
			job.tool === 'scene'
				? '/app/create/scene'
				: job.tool === 'remove-background'
					? '/app/create/remove-background'
					: '/app/create/product';
		return resolve(`${path}?fromJob=${job.id}&mode=edit` as '/app/create/product');
	}

	function searchFor(params: Record<string, string | number | undefined>) {
		const search = new SvelteURLSearchParams();
		if (data.filters.tool && data.filters.tool !== 'all') search.set('tool', data.filters.tool);
		if (data.filters.keyword) search.set('keyword', data.filters.keyword);
		if (data.filters.sort && data.filters.sort !== 'latest') search.set('sort', data.filters.sort);
		if (data.pageSize !== 10) search.set('pageSize', String(data.pageSize));

		for (const [key, value] of Object.entries(params)) {
			const text = String(value ?? '');
			if (!value || value === 'all' || (key === 'page' && Number(value) <= 1)) {
				search.delete(key);
			} else if (key === 'pageSize' && Number(value) === 10) {
				search.delete(key);
			} else if (key === 'sort' && value === 'latest') {
				search.delete(key);
			} else {
				search.set(key, text);
			}
		}

		const text = search.toString();
		return text ? `?${text}` : '';
	}

	function historyHref(params: Record<string, string | number | undefined>) {
		return resolve(`/app/history${searchFor(params)}` as '/app/history');
	}

	function applyFilters() {
		void goto(
			historyHref({
				keyword: filterKeyword.trim(),
				sort: filterSort,
				pageSize: Number(filterPageSize),
				page: 1
			})
		);
	}

	function openPreview(index = selectedOutputIndex) {
		selectedOutputIndex = index;
		previewOpen = true;
	}

	async function retry(job: HistoryJob) {
		retryingId = job.id;
		try {
			const response = await fetch(`/api/jobs/${job.id}/retry`, { method: 'POST' });
			if (response.ok) await invalidateAll();
		} finally {
			retryingId = '';
		}
	}

	async function copyPrompt(job: HistoryJob) {
		await navigator.clipboard.writeText(job.prompt || toolTypeLabels[job.tool] || '');
		copiedId = job.id;
		setTimeout(() => {
			if (copiedId === job.id) copiedId = '';
		}, 1600);
	}

	function outputLabel(output: HistoryOutput, index: number) {
		return `生成结果 ${output.position + 1 || index + 1}`;
	}

	function trackDelete(job: HistoryJob) {
		deletingId = job.id;
	}
</script>

<svelte:head><title>历史记录 - DesignAI</title></svelte:head>

<div class="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">历史记录</h1>
		<p class="mt-2 text-sm text-[#65708a]">查看和管理您所有的创作记录</p>
	</div>
	<form
		onsubmit={(event) => {
			event.preventDefault();
			applyFilters();
		}}
		class="flex flex-wrap items-center justify-end gap-2"
	>
		<label class="relative block w-72">
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a94ad]"
			/>
			<Input
				bind:value={filterKeyword}
				class={cn(
					filterControlClass,
					'w-full pr-3 pl-9 font-medium text-[#30405f] placeholder:text-[#a8b1c5]'
				)}
				placeholder="搜索关键词"
			/>
		</label>
		<Select.Root type="single" value={filterSort} onValueChange={(value) => (filterSort = value)}>
			<Select.Trigger class={cn(filterControlClass, 'w-28')}>
				{sortOptions.find((option) => option.value === filterSort)?.label ?? '按最新'}
			</Select.Trigger>
			<Select.Content>
				{#each sortOptions as option (option.value)}
					<Select.Item value={option.value}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Select.Root
			type="single"
			value={filterPageSize}
			onValueChange={(value) => (filterPageSize = value)}
		>
			<Select.Trigger class={cn(filterControlClass, 'w-29')}>
				{filterPageSize} 条/页
			</Select.Trigger>
			<Select.Content>
				{#each pageSizeOptions as pageSize (pageSize)}
					<Select.Item value={String(pageSize)}>{pageSize} 条/页</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Button type="submit" variant="outline" class={cn(filterControlClass, 'px-4')}
			><SlidersHorizontal class="size-4" />筛选</Button
		>
		{#if hasActiveFilters}
			<Button
				href={resolve('/app/history')}
				variant="outline"
				class={cn(filterControlClass, 'px-3 text-[#8a94ad]')}><X class="size-4" />清除筛选</Button
			>
		{/if}
	</form>
</div>

<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
	<section>
		<div class="mb-4 flex flex-wrap gap-2">
			{#each tabs as tab (tab.id)}
				<a
					href={historyHref({ tool: tab.id, page: 1 })}
					class={cn(
						'h-10 rounded-lg px-5 py-2 text-sm font-bold',
						data.filters.tool === tab.id || (!data.filters.tool && tab.id === 'all')
							? 'bg-primary text-white'
							: 'border border-[#dde2f2] bg-white text-[#65708a]'
					)}>{tab.label}</a
				>
			{/each}
		</div>
		<div class="overflow-hidden rounded-2xl border border-[#e1e5f2] bg-white shadow-sm">
			<div
				class="hidden grid-cols-[90px_1.3fr_1fr_110px_150px_170px] border-b border-[#eef1f7] px-5 py-4 text-sm font-bold text-[#65708a] lg:grid"
			>
				<span>类型</span><span>作品名称</span><span>生成信息</span><span>尺寸</span><span
					>创建时间</span
				><span>操作</span>
			</div>
			{#if data.jobs.length}
				{#each data.jobs as job (job!.id)}
					{#if job}
						<div
							class={cn(
								'grid w-full gap-4 border-b border-[#eef1f7] p-5 text-left last:border-b-0 lg:grid-cols-[90px_1.3fr_1fr_110px_150px_170px]',
								selectedId === job.id
									? 'bg-primary/5 ring-1 ring-inset ring-primary/20'
									: 'bg-white hover:bg-[#fafbff]'
							)}
						>
							<button
								onclick={() => selectJob(job)}
								class="text-left text-sm font-bold text-[#65708a]"
							>
								<span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"
									>{toolLabels[job.tool]?.slice(0, 1)}</span
								>
								<span class="mt-2 block">{toolLabels[job.tool]}</span>
							</button>
							<button
								onclick={() => selectJob(job)}
								class="flex min-w-0 items-center gap-3 text-left"
							>
								{#if job.outputs?.[0]}
									<img
										src={thumbnail(job)}
										alt=""
										class="size-16 rounded-lg object-cover ring-1 ring-[#edf0f7]"
									/>
								{:else if !jobTerminal(job)}
									<Skeleton class="size-16 shrink-0 rounded-lg" />
								{:else}
									<div
										class="grid size-16 shrink-0 place-items-center rounded-lg bg-[#f6f7fb] text-[#a8b1c5] ring-1 ring-[#edf0f7]"
									>
										<ImageOff class="size-5" />
									</div>
								{/if}
								<div class="min-w-0">
									<p class="truncate font-black text-[#121826]">{jobTitle(job)}</p>
									<p class="mt-1 truncate text-sm text-[#65708a]">
										{statusLabel(job)} · {job.outputs?.length ?? 0}/{job.totalCount} 张
									</p>
								</div>
							</button>
							<button onclick={() => selectJob(job)} class="self-center text-left">
								<span class="rounded-lg bg-[#f1f3f9] px-3 py-1 text-sm font-bold text-[#65708a]"
									>{generationLabel(job)}</span
								>
							</button>
							<button
								onclick={() => selectJob(job)}
								class="self-center text-left text-sm font-medium text-[#65708a]"
								>{sizeLabel(job)}</button
							>
							<button
								onclick={() => selectJob(job)}
								class="self-center text-left text-sm font-medium text-[#65708a]"
								>{new Date(job.createdAt).toLocaleString('zh-CN')}</button
							>
							<div class="flex items-center gap-2 self-center">
								<button
									onclick={() => {
										selectJob(job);
										openPreview(0);
									}}
									class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
									aria-label="查看作品"><Eye class="size-4" /></button
								>
								{#if job.outputs?.[0]}
									<!-- eslint-disable svelte/no-navigation-without-resolve -->
									<a
										href={job.outputs[0].url}
										target="_blank"
										rel="noreferrer"
										class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
										aria-label="下载首张图片"><Download class="size-4" /></a
									>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{/if}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="grid size-9 place-items-center rounded-lg border border-[#dde2f2] text-primary"
										aria-label="更多操作"
									>
										<MoreHorizontal class="size-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end" sideOffset={8} class="w-48 p-1.5">
										<DropdownMenu.Item onclick={() => copyPrompt(job)} class="gap-2 py-2">
											<Copy class="size-4" />{copiedId === job.id ? '已复制' : '复制提示词'}
										</DropdownMenu.Item>
										{#if ['failed', 'partial'].includes(job.status)}
											<DropdownMenu.Item onclick={() => retry(job)} class="gap-2 py-2">
												{#if retryingId === job.id}
													<LoaderCircle class="size-4 animate-spin" />
												{:else}
													<RotateCcw class="size-4" />
												{/if}
												重试任务
											</DropdownMenu.Item>
										{/if}
										<DropdownMenu.Item class="p-0">
											<a href={createHref(job)} class="flex w-full items-center gap-2 px-1.5 py-2">
												<Pencil class="size-4" />编辑并重新生成
											</a>
										</DropdownMenu.Item>
										<DropdownMenu.Item class="p-0 text-red-500 focus:text-red-500">
											<form
												method="POST"
												action="?/deleteJob"
												use:enhance={() => {
													return async ({ update }) => {
														await update();
														deletingId = '';
													};
												}}
												class="w-full"
											>
												<input type="hidden" name="jobId" value={job.id} />
												<button
													type="submit"
													onclick={() => trackDelete(job)}
													disabled={deletingId === job.id}
													class="flex w-full items-center gap-2 px-1.5 py-2 text-left disabled:opacity-60"
												>
													{#if deletingId === job.id}
														<LoaderCircle class="size-4 animate-spin" />
													{:else}
														<Trash2 class="size-4" />
													{/if}
													删除任务
												</button>
											</form>
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					{/if}
				{/each}
			{:else}
				<div class="grid min-h-64 place-items-center text-center text-sm text-[#65708a]">
					暂无历史任务
				</div>
			{/if}
		</div>
		<div
			class="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-[#65708a]"
		>
			<span>共 {data.total} 条</span>
			{#if data.hasPreviousPage}
				<a
					class="rounded-lg border border-[#dde2f2] bg-white px-3 py-2"
					href={historyHref({ page: data.page - 1 })}>上一页</a
				>
			{:else}
				<span class="rounded-lg border border-[#dde2f2] bg-[#f5f7fb] px-3 py-2 text-[#a3acc1]"
					>上一页</span
				>
			{/if}
			<span class="rounded-lg border border-primary bg-white px-3 py-2 text-primary">
				{data.page} / {data.totalPages}
			</span>
			{#if data.hasNextPage}
				<a
					class="rounded-lg border border-[#dde2f2] bg-white px-3 py-2"
					href={historyHref({ page: data.page + 1 })}>下一页</a
				>
			{:else}
				<span class="rounded-lg border border-[#dde2f2] bg-[#f5f7fb] px-3 py-2 text-[#a3acc1]"
					>下一页</span
				>
			{/if}
		</div>
	</section>

	<aside class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
		<h2 class="font-black text-[#121826]">作品预览</h2>
		{#if selected}
			{#if selectedOutput}
				<button onclick={() => openPreview()} class="mt-4 block w-full text-left">
					<img
						src={selectedOutput.url}
						alt={outputLabel(selectedOutput, selectedOutputIndex)}
						class="aspect-square w-full rounded-xl object-cover"
					/>
				</button>
				{#if selectedOutputs.length > 1}
					<div class="mt-3 grid grid-cols-4 gap-2">
						{#each selectedOutputs as output, index (output.position)}
							<button
								onclick={() => (selectedOutputIndex = index)}
								class={cn(
									'aspect-square overflow-hidden rounded-lg ring-2',
									selectedOutputIndex === index ? 'ring-primary' : 'ring-transparent'
								)}
								aria-label={outputLabel(output, index)}
							>
								<img src={output.url} alt="" class="size-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
				<div class="mt-3 flex gap-2">
					<button
						onclick={() => openPreview()}
						class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dde2f2] text-sm font-bold text-primary"
						><Eye class="size-4" />查看</button
					>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={selectedOutput.url}
						target="_blank"
						rel="noreferrer"
						class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dde2f2] text-sm font-bold text-primary"
						><Download class="size-4" />下载</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{#if selectedOutput.assetId}
						<form method="POST" action="?/deleteOutput" use:enhance>
							<input type="hidden" name="jobId" value={selected.id} />
							<input type="hidden" name="assetId" value={selectedOutput.assetId} />
							<button
								class="grid h-10 w-11 place-items-center rounded-lg border border-red-200 text-red-500"
								aria-label="删除当前输出"><Trash2 class="size-4" /></button
							>
						</form>
					{/if}
				</div>
			{:else if !jobTerminal(selected)}
				<div class="mt-4">
					<Skeleton class="aspect-square w-full rounded-xl" />
					<div class="mt-3 grid grid-cols-4 gap-2">
						{#each [0, 1, 2, 3].slice(0, Math.min(selected.totalCount, 4)) as index (index)}
							<Skeleton class="aspect-square rounded-lg" />
						{/each}
					</div>
				</div>
			{:else}
				<div
					class="mt-4 grid aspect-square w-full place-items-center rounded-xl bg-[#f6f7fb] text-center text-sm text-[#65708a]"
				>
					<div>
						<ImageOff class="mx-auto mb-3 size-8 text-[#a8b1c5]" />
						无可用结果
					</div>
				</div>
			{/if}
			<h3 class="mt-5 flex items-center gap-2 text-xl font-black text-[#121826]">
				{jobTitle(selected)}<Pencil class="size-4 text-primary" />
			</h3>
			<div class="mt-5 space-y-4 text-sm">
				<div class="flex justify-between gap-4">
					<span class="text-[#65708a]">创建时间</span><span class="text-right"
						>{new Date(selected.createdAt).toLocaleString('zh-CN')}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">类型</span><span>{toolLabels[selected.tool]}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">尺寸</span><span>{sizeLabel(selected)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">输出</span><span
						>{selectedOutputs.length}/{selected.totalCount} 张</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">使用积分</span><strong
						>消耗 {selected.consumedCredits} 积分</strong
					>
				</div>
			</div>
			<a
				href={createHref(selected)}
				class="mt-6 flex h-11 items-center justify-center rounded-xl bg-primary font-black text-white"
				>再次生成</a
			>
			<a
				href={createHref(selected)}
				class="mt-3 flex h-11 items-center justify-center rounded-xl border border-primary font-black text-primary"
				>编辑并重新生成</a
			>
		{:else}
			<p class="mt-8 text-sm text-[#65708a]">选择一条记录后查看详情。</p>
		{/if}
	</aside>
</div>

<Dialog.Root bind:open={previewOpen}>
	<Dialog.Content class="max-w-4xl overflow-hidden p-0">
		<Dialog.Header class="border-b border-[#eef1f7] p-5">
			<Dialog.Title>{selected ? jobTitle(selected) : '作品预览'}</Dialog.Title>
			<Dialog.Description>
				{selectedOutput ? outputLabel(selectedOutput, selectedOutputIndex) : '无可用结果'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="bg-[#f6f7fb] p-5">
			{#if selectedOutput}
				<img
					src={selectedOutput.url}
					alt={selected ? jobTitle(selected) : ''}
					class="mx-auto max-h-[70vh] rounded-xl object-contain"
				/>
			{:else if selected && !jobTerminal(selected)}
				<Skeleton class="mx-auto h-[60vh] max-h-155 w-full max-w-3xl rounded-xl" />
			{:else}
				<div class="grid min-h-72 place-items-center text-sm text-[#65708a]">无可用结果</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
