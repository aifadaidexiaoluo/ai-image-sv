<script lang="ts">
	import { assetColorOptions, assetStyleOptions } from '$lib/app-catalog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Empty from '$lib/components/ui/empty';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import { Check, FileImage, Search, SlidersHorizontal } from '@lucide/svelte';
	import { onMount, untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import AssetSelect from './asset-select.svelte';
	import type { AssetCounts, AssetItem, AssetOption, AssetTagSummary } from './types';

	type AssetPickerResponse = {
		items: AssetItem[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
		counts: AssetCounts;
		availableTags: AssetTagSummary[];
		filters: {
			kind: string;
			keyword: string;
			favorite: boolean;
			format: string;
			ratio: string;
			style: string;
			color: string;
			tag: string;
			sort: string;
		};
	};

	let {
		open = $bindable(false),
		selectedAssetId = '',
		title = '选择素材',
		description = '从素材库中选择一张图片作为本次任务的输入素材。',
		onSelect
	}: {
		open: boolean;
		selectedAssetId?: string;
		title?: string;
		description?: string;
		onSelect: (asset: AssetItem) => void;
	} = $props();

	const kindOptions = [
		{ value: 'all', label: '全部素材' },
		{ value: 'source', label: '产品素材' },
		{ value: 'output', label: '生成结果' },
		{ value: 'template', label: '模板素材' },
		{ value: 'thumbnail', label: '缩略图' }
	] satisfies AssetOption[];
	const formatOptions = [
		{ value: 'all', label: '全部格式' },
		{ value: 'png', label: 'PNG' },
		{ value: 'jpg', label: 'JPG' },
		{ value: 'webp', label: 'WEBP' }
	] satisfies AssetOption[];
	const ratioOptions = [
		{ value: 'all', label: '全部比例' },
		{ value: 'square', label: '方图' },
		{ value: 'portrait', label: '竖图' },
		{ value: 'landscape', label: '横图' },
		{ value: 'unknown', label: '未知比例' }
	] satisfies AssetOption[];
	const sortOptions = [
		{ value: 'latest', label: '按最新' },
		{ value: 'oldest', label: '按最早' },
		{ value: 'name', label: '按名称' }
	] satisfies AssetOption[];
	const styleOptions: AssetOption[] = [{ value: 'all', label: '全部风格' }, ...assetStyleOptions];
	const colorOptions: AssetOption[] = [{ value: 'all', label: '全部颜色' }, ...assetColorOptions];
	const pageSizeOptions: AssetOption[] = [12, 24, 48].map((value) => ({
		value: String(value),
		label: `${value} 条/页`
	}));
	const emptyCounts: AssetCounts = {
		all: 0,
		source: 0,
		output: 0,
		thumbnail: 0,
		template: 0,
		favorite: 0,
		png: 0,
		jpg: 0,
		webp: 0
	};

	let items = $state<AssetItem[]>([]);
	let total = $state(0);
	let page = $state(1);
	let pageSize = $state('12');
	let totalPages = $state(1);
	let counts = $state<AssetCounts>(emptyCounts);
	let availableTags = $state<AssetTagSummary[]>([]);
	let keyword = $state('');
	let kind = $state('all');
	let format = $state('all');
	let ratio = $state('all');
	let style = $state('all');
	let color = $state('all');
	let favorite = $state(false);
	let tag = $state('');
	let sort = $state('latest');
	let loading = $state(false);
	let error = $state('');
	let wasOpen = false;

	const hasFilters = $derived(
		Boolean(keyword.trim()) ||
			kind !== 'all' ||
			favorite ||
			format !== 'all' ||
			ratio !== 'all' ||
			style !== 'all' ||
			color !== 'all' ||
			Boolean(tag) ||
			sort !== 'latest' ||
			pageSize !== '12'
	);

	onMount(() => {
		if (open) void loadAssets();
	});

	$effect(() => {
		if (open && !wasOpen) untrack(() => void loadAssets(1));
		wasOpen = open;
	});

	function queryFor(nextPage = page) {
		const search = new SvelteURLSearchParams();
		if (kind !== 'all') search.set('kind', kind);
		if (keyword.trim()) search.set('keyword', keyword.trim());
		if (favorite) search.set('favorite', 'true');
		if (format !== 'all') search.set('format', format);
		if (ratio !== 'all') search.set('ratio', ratio);
		if (style !== 'all') search.set('style', style);
		if (color !== 'all') search.set('color', color);
		if (tag) search.set('tag', tag);
		if (sort !== 'latest') search.set('sort', sort);
		if (pageSize !== '12') search.set('pageSize', pageSize);
		if (nextPage > 1) search.set('page', String(nextPage));
		const text = search.toString();
		return text ? `?${text}` : '';
	}

	async function loadAssets(nextPage = page) {
		loading = true;
		error = '';
		try {
			const response = await fetch(`/api/assets${queryFor(nextPage)}`);
			const payload = (await response.json()) as AssetPickerResponse | { message?: string };
			if (!response.ok) throw new Error('message' in payload ? payload.message : '素材加载失败');
			const data = payload as AssetPickerResponse;
			items = data.items;
			total = data.total;
			page = data.page;
			pageSize = String(data.pageSize);
			totalPages = data.totalPages;
			counts = data.counts;
			availableTags = data.availableTags;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '素材加载失败';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		void loadAssets(1);
	}

	function resetFilters() {
		keyword = '';
		kind = 'all';
		format = 'all';
		ratio = 'all';
		style = 'all';
		color = 'all';
		favorite = false;
		tag = '';
		sort = 'latest';
		pageSize = '12';
		void loadAssets(1);
	}

	function selectTag(nextTag: string) {
		tag = tag === nextTag ? '' : nextTag;
		void loadAssets(1);
	}

	function selectAsset(asset: AssetItem) {
		onSelect(asset);
		open = false;
	}

	function styleLabel(value: string | null) {
		return assetStyleOptions.find((item) => item.value === value)?.label ?? '未设置';
	}

	function colorLabel(value: string | null) {
		return assetColorOptions.find((item) => item.value === value)?.label ?? '未设置';
	}

	function sizeLabel(asset: AssetItem) {
		if (asset.width && asset.height) return `${asset.width} x ${asset.height}`;
		return `${Math.max(1, Math.round(asset.sizeBytes / 1024))} KB`;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] sm:max-w-6xl overflow-hidden p-0">
		<Dialog.Header class="border-b border-[#eef1f7] px-5 py-4">
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>

		<div class="grid max-h-[calc(90vh-92px)] overflow-hidden lg:grid-cols-[220px_1fr]">
			<aside class="hidden overflow-y-auto border-r border-[#eef1f7] p-5 lg:block">
				<h3 class="font-black text-[#121826]">素材分类</h3>
				<div class="mt-4 space-y-2">
					{#each kindOptions as option (option.value)}
						<button
							type="button"
							onclick={() => {
								kind = option.value;
								void loadAssets(1);
							}}
							class={cn(
								'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold',
								kind === option.value ? 'bg-primary/10 text-primary' : 'text-[#65708a]'
							)}
						>
							<span>{option.label}</span><span>{counts[option.value as keyof AssetCounts]}</span>
						</button>
					{/each}
				</div>

				<h3 class="mt-8 font-black text-[#121826]">热门标签</h3>
				<div class="mt-4 flex flex-wrap gap-2">
					{#if availableTags.length}
						{#each availableTags as item (item.tag)}
							<button type="button" onclick={() => selectTag(item.tag)}>
								<Badge
									variant={tag === item.tag ? 'default' : 'secondary'}
									class="rounded-lg px-3 py-1.5"
								>
									{item.tag}
								</Badge>
							</button>
						{/each}
					{:else}
						<span class="text-xs font-bold text-[#8a94ad]">暂无标签</span>
					{/if}
				</div>
			</aside>

			<div class="min-w-0 overflow-y-auto p-5">
				<div class="flex flex-wrap items-center gap-2">
					<label class="relative block min-w-60 flex-1">
						<Search
							class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a94ad]"
						/>
						<Input
							bind:value={keyword}
							class="h-10 border-[#dde2f2] bg-white pr-3 pl-9 text-sm font-medium text-[#30405f] placeholder:text-[#a8b1c5]"
							placeholder="搜索名称或标签"
							onkeydown={(event) => {
								if (event.key === 'Enter') applyFilters();
							}}
						/>
					</label>
					<AssetSelect
						bind:value={sort}
						options={sortOptions}
						placeholder="按最新"
						onChange={applyFilters}
					/>
					<AssetSelect
						bind:value={kind}
						options={kindOptions}
						placeholder="全部素材"
						onChange={applyFilters}
					/>
					<Button
						type="button"
						variant="outline"
						class="h-10 border-[#dde2f2]"
						onclick={applyFilters}
					>
						<SlidersHorizontal class="size-4" />筛选
					</Button>
				</div>

				<div class="mt-3 flex flex-wrap items-center gap-3 border-b border-[#eef1f7] pb-4 text-sm">
					<AssetSelect bind:value={format} options={formatOptions} placeholder="全部格式" />
					<AssetSelect bind:value={ratio} options={ratioOptions} placeholder="全部比例" />
					<AssetSelect bind:value={style} options={styleOptions} placeholder="全部风格" />
					<AssetSelect bind:value={color} options={colorOptions} placeholder="全部颜色" />
					<label
						class="flex h-10 items-center gap-2 rounded-lg border border-[#dde2f2] px-3 font-bold text-[#65708a]"
					>
						<Checkbox bind:checked={favorite} />
						收藏
					</label>
					<AssetSelect bind:value={pageSize} options={pageSizeOptions} placeholder="12 条/页" />
					{#if hasFilters}
						<Button
							type="button"
							variant="outline"
							class="h-10 border-[#dde2f2]"
							onclick={resetFilters}
						>
							重置
						</Button>
					{/if}
				</div>

				<div class="mt-4 flex items-center justify-between gap-3">
					<div>
						<h3 class="text-[17px] font-black text-[#121826]">素材列表</h3>
						<p class="mt-1 text-sm font-medium text-[#65708a]">共 {total} 条素材</p>
					</div>
					{#if error}
						<p class="text-sm font-bold text-red-500">{error}</p>
					{/if}
				</div>

				{#if loading}
					<div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{#each [0, 1, 2, 3, 4, 5] as index (index)}
							<Skeleton class="aspect-square rounded-xl" />
						{/each}
					</div>
				{:else if items.length}
					<div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{#each items as asset (asset.id)}
							<button
								type="button"
								onclick={() => selectAsset(asset)}
								class={cn(
									'group overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:border-primary/40 hover:shadow-md',
									selectedAssetId === asset.id
										? 'border-primary ring-2 ring-primary/15'
										: 'border-[#e1e5f2]'
								)}
							>
								<div class="relative aspect-square bg-[#f7f8fc]">
									<img src={asset.url} alt={asset.displayName} class="size-full object-cover" />
									<Badge class="absolute bottom-3 left-3 bg-white/90 text-[#65708a]">
										{asset.format}
									</Badge>
									{#if selectedAssetId === asset.id}
										<span
											class="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-primary text-white shadow"
										>
											<Check class="size-4" />
										</span>
									{/if}
								</div>
								<div class="p-3">
									<p class="truncate text-sm font-black text-[#121826]">{asset.displayName}</p>
									<p class="mt-1 truncate text-xs font-medium text-[#65708a]">
										{asset.format} · {sizeLabel(asset)}
									</p>
									<div class="mt-3 flex flex-wrap gap-1.5">
										{#if asset.style}<Badge variant="secondary">{styleLabel(asset.style)}</Badge
											>{/if}
										{#if asset.color}
											<Badge variant="secondary" class="gap-1">
												<span class="size-2 rounded-full" style:background={asset.color}></span>
												{colorLabel(asset.color)}
											</Badge>
										{/if}
										{#each asset.tags.slice(0, 2) as item (item)}
											<Badge variant="secondary">#{item}</Badge>
										{/each}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<Empty.Root class="mt-4 min-h-72 border border-dashed border-[#d9deed] bg-[#fbfcff]">
						<Empty.Media><FileImage class="size-10 text-[#9aa5bb]" /></Empty.Media>
						<Empty.Header>
							<Empty.Title>{hasFilters ? '没有匹配的素材' : '还没有素材'}</Empty.Title>
							<Empty.Description>
								{hasFilters ? '调整筛选条件后再试试。' : '请先到素材库页面上传素材。'}
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}

				{#if totalPages > 1}
					<div
						class="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-[#65708a]"
					>
						<Button
							type="button"
							variant="outline"
							disabled={page <= 1 || loading}
							onclick={() => loadAssets(page - 1)}
						>
							上一页
						</Button>
						<span class="rounded-lg border border-primary px-3 py-2 text-primary">
							{page} / {totalPages}
						</span>
						<Button
							type="button"
							variant="outline"
							disabled={page >= totalPages || loading}
							onclick={() => loadAssets(page + 1)}
						>
							下一页
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
