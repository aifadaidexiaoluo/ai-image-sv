<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { assetColorOptions, assetStyleOptions } from '$lib/app-catalog';
	import AssetBulkActions from '$lib/components/app/assets/asset-bulk-actions.svelte';
	import AssetDeleteDialogs from '$lib/components/app/assets/asset-delete-dialogs.svelte';
	import AssetEditDialog from '$lib/components/app/assets/asset-edit-dialog.svelte';
	import AssetFilterPanel from '$lib/components/app/assets/asset-filter-panel.svelte';
	import AssetGrid from '$lib/components/app/assets/asset-grid.svelte';
	import AssetPreviewDialog from '$lib/components/app/assets/asset-preview-dialog.svelte';
	import AssetToolbar from '$lib/components/app/assets/asset-toolbar.svelte';
	import AssetUploadDialog from '$lib/components/app/assets/asset-upload-dialog.svelte';
	import type { AssetItem, AssetOption } from '$lib/components/app/assets/types';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Pagination from '$lib/components/ui/pagination';
	import { untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const formatOptions: AssetOption[] = [
		{ value: 'all', label: '全部格式' },
		{ value: 'png', label: 'PNG' },
		{ value: 'jpg', label: 'JPG' },
		{ value: 'webp', label: 'WEBP' }
	];
	const ratioOptions: AssetOption[] = [
		{ value: 'all', label: '全部比例' },
		{ value: 'square', label: '方图' },
		{ value: 'portrait', label: '竖图' },
		{ value: 'landscape', label: '横图' },
		{ value: 'unknown', label: '未知比例' }
	];
	const sortOptions: AssetOption[] = [
		{ value: 'latest', label: '按最新' },
		{ value: 'oldest', label: '按最早' },
		{ value: 'name', label: '按名称' }
	];
	const filterStyleOptions: AssetOption[] = [
		{ value: 'all', label: '全部风格' },
		...assetStyleOptions
	];
	const filterColorOptions: AssetOption[] = [
		{ value: 'all', label: '全部颜色' },
		...assetColorOptions
	];
	const formStyleOptions: AssetOption[] = [{ value: 'all', label: '未设置' }, ...assetStyleOptions];
	const formColorOptions: AssetOption[] = [{ value: 'all', label: '未设置' }, ...assetColorOptions];
	const pageSizeOptions: AssetOption[] = [12, 24, 48].map((value) => ({
		value: String(value),
		label: `${value} 条/页`
	}));

	let keyword = $state(untrack(() => data.filters.keyword));
	let filterFormat = $state(untrack(() => data.filters.format));
	let filterRatio = $state(untrack(() => data.filters.ratio));
	let filterStyle = $state(untrack(() => data.filters.style));
	let filterColor = $state(untrack(() => data.filters.color));
	let filterFavorite = $state(untrack(() => data.filters.favorite));
	let filterSort = $state(untrack(() => data.filters.sort));
	let filterPageSize = $state(untrack(() => String(data.pageSize)));
	let selectedIds = $state<string[]>([]);
	let previewAsset = $state<AssetItem>();
	let editingAsset = $state<AssetItem>();
	let deleteTarget = $state<AssetItem>();
	let bulkDeleteOpen = $state(false);
	let uploadOpen = $state(false);

	const allVisibleSelected = $derived(
		data.items.length > 0 && data.items.every((asset) => selectedIds.includes(asset.id))
	);
	const hasFilters = $derived(
		Boolean(data.filters.keyword) ||
			data.filters.kind !== 'all' ||
			data.filters.favorite ||
			data.filters.format !== 'all' ||
			data.filters.ratio !== 'all' ||
			data.filters.style !== 'all' ||
			data.filters.color !== 'all' ||
			Boolean(data.filters.tag) ||
			data.filters.sort !== 'latest' ||
			data.pageSize !== 12
	);

	$effect(() => {
		keyword = data.filters.keyword;
		filterFormat = data.filters.format;
		filterRatio = data.filters.ratio;
		filterStyle = data.filters.style;
		filterColor = data.filters.color;
		filterFavorite = data.filters.favorite;
		filterSort = data.filters.sort;
		filterPageSize = String(data.pageSize);

		const visibleIds = new Set(data.items.map((asset) => asset.id));
		const currentSelectedIds = untrack(() => selectedIds);
		const nextSelectedIds = currentSelectedIds.filter((id) => visibleIds.has(id));
		if (
			nextSelectedIds.length !== currentSelectedIds.length ||
			nextSelectedIds.some((id, index) => id !== currentSelectedIds[index])
		) {
			selectedIds = nextSelectedIds;
		}
	});

	function searchFor(params: Record<string, string | number | boolean | undefined>) {
		const search = new SvelteURLSearchParams();
		if (data.filters.kind !== 'all') search.set('kind', data.filters.kind);
		if (data.filters.keyword) search.set('keyword', data.filters.keyword);
		if (data.filters.favorite) search.set('favorite', 'true');
		if (data.filters.format !== 'all') search.set('format', data.filters.format);
		if (data.filters.ratio !== 'all') search.set('ratio', data.filters.ratio);
		if (data.filters.style !== 'all') search.set('style', data.filters.style);
		if (data.filters.color !== 'all') search.set('color', data.filters.color);
		if (data.filters.tag) search.set('tag', data.filters.tag);
		if (data.filters.sort !== 'latest') search.set('sort', data.filters.sort);
		if (data.pageSize !== 12) search.set('pageSize', String(data.pageSize));
		if (data.page > 1) search.set('page', String(data.page));

		for (const [key, value] of Object.entries(params)) {
			if (
				value === undefined ||
				value === '' ||
				value === false ||
				value === 'all' ||
				(key === 'page' && Number(value) <= 1) ||
				(key === 'pageSize' && Number(value) === 12) ||
				(key === 'sort' && value === 'latest')
			) {
				search.delete(key);
			} else {
				search.set(key, String(value));
			}
		}

		const text = search.toString();
		return text ? `?${text}` : '';
	}

	function assetsHref(params: Record<string, string | number | boolean | undefined>) {
		return `/app/assets${searchFor(params)}`;
	}

	function applyFilters() {
		const href = assetsHref({
			keyword: keyword.trim(),
			format: filterFormat,
			ratio: filterRatio,
			style: filterStyle,
			color: filterColor,
			favorite: filterFavorite,
			sort: filterSort,
			pageSize: Number(filterPageSize),
			page: 1
		});
		void goto(resolve(href as '/app/assets'));
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

	function selectAllVisible(checked: boolean) {
		const visibleIds = data.items.map((asset) => asset.id);
		selectedIds = checked
			? Array.from(new Set([...selectedIds, ...visibleIds]))
			: selectedIds.filter((id) => !visibleIds.includes(id));
	}

	function toggleSelected(id: string, checked: boolean) {
		selectedIds = checked
			? Array.from(new Set([...selectedIds, id]))
			: selectedIds.filter((item) => item !== id);
	}

	function openEdit(asset: AssetItem) {
		previewAsset = undefined;
		editingAsset = asset;
	}
</script>

<svelte:head><title>素材库 - DesignAI</title></svelte:head>

<AssetToolbar
	bind:keyword
	bind:sort={filterSort}
	{sortOptions}
	onApply={applyFilters}
	onUpload={() => (uploadOpen = true)}
/>

<AssetBulkActions
	{selectedIds}
	onClear={() => (selectedIds = [])}
	onDelete={() => (bulkDeleteOpen = true)}
/>

<AssetFilterPanel
	activeKind={data.filters.kind}
	counts={data.counts}
	bind:format={filterFormat}
	bind:ratio={filterRatio}
	bind:style={filterStyle}
	bind:color={filterColor}
	bind:pageSize={filterPageSize}
	bind:favorite={filterFavorite}
	{formatOptions}
	{ratioOptions}
	styleOptions={filterStyleOptions}
	colorOptions={filterColorOptions}
	{pageSizeOptions}
	availableTags={data.availableTags}
	selectedTag={data.filters.tag}
	{hasFilters}
	{assetsHref}
	onApply={applyFilters}
>
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-[17px] font-black text-[#121826]">素材列表</h2>
			<p class="mt-1 text-sm font-medium text-[#65708a]">共 {data.total} 条素材</p>
		</div>
		<label class="flex items-center gap-2 text-sm font-bold text-[#65708a]">
			<Checkbox
				checked={allVisibleSelected}
				onCheckedChange={(checked) => selectAllVisible(Boolean(checked))}
			/>
			选择当前页
		</label>
	</div>
	<AssetGrid
		items={data.items}
		{selectedIds}
		{hasFilters}
		{styleLabel}
		{colorLabel}
		{sizeLabel}
		{assetsHref}
		onSelectChange={toggleSelected}
		onPreview={(asset) => (previewAsset = asset)}
		onEdit={openEdit}
		onDelete={(asset) => (deleteTarget = asset)}
		onUpload={() => (uploadOpen = true)}
	/>

	{#if data.totalPages > 1}
		<Pagination.Root count={data.total} perPage={data.pageSize} page={data.page} class="mt-5">
			<Pagination.Content class="justify-center">
				<Pagination.Item>
					<Button
						href={assetsHref({ page: data.page - 1 })}
						variant="outline"
						disabled={data.page <= 1}
					>
						上一页
					</Button>
				</Pagination.Item>
				{#each Array.from({ length: data.totalPages }, (_, index) => index + 1).slice(0, 7) as page (page)}
					<Pagination.Item>
						<Button
							href={assetsHref({ page })}
							variant={page === data.page ? 'default' : 'outline'}
							size="icon"
						>
							{page}
						</Button>
					</Pagination.Item>
				{/each}
				<Pagination.Item>
					<Button
						href={assetsHref({ page: data.page + 1 })}
						variant="outline"
						disabled={data.page >= data.totalPages}
					>
						下一页
					</Button>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	{/if}
</AssetFilterPanel>

<AssetUploadDialog
	bind:open={uploadOpen}
	styleOptions={formStyleOptions}
	colorOptions={formColorOptions}
	onUploaded={invalidateAll}
/>
<AssetPreviewDialog
	bind:asset={previewAsset}
	{styleLabel}
	{colorLabel}
	{sizeLabel}
	onEdit={openEdit}
/>
<AssetEditDialog
	bind:asset={editingAsset}
	styleOptions={formStyleOptions}
	colorOptions={formColorOptions}
	onSaved={invalidateAll}
/>
<AssetDeleteDialogs bind:deleteTarget bind:bulkOpen={bulkDeleteOpen} {selectedIds} />
