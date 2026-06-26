<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Empty from '$lib/components/ui/empty';
	import { Button } from '$lib/components/ui/button';
	import { FileImage, Upload } from '@lucide/svelte';
	import AssetCard from './asset-card.svelte';
	import type { AssetItem } from './types';

	let {
		items,
		selectedIds,
		hasFilters,
		styleLabel,
		colorLabel,
		sizeLabel,
		assetsHref,
		onSelectChange,
		onPreview,
		onEdit,
		onDelete,
		onUpload
	}: {
		items: AssetItem[];
		selectedIds: string[];
		hasFilters: boolean;
		styleLabel: (value: string | null) => string;
		colorLabel: (value: string | null) => string;
		sizeLabel: (asset: AssetItem) => string;
		assetsHref: (params: Record<string, string | number | boolean | undefined>) => string;
		onSelectChange: (assetId: string, checked: boolean) => void;
		onPreview: (asset: AssetItem) => void;
		onEdit: (asset: AssetItem) => void;
		onDelete: (asset: AssetItem) => void;
		onUpload: () => void;
	} = $props();
</script>

{#if items.length}
	<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
		{#each items as asset (asset.id)}
			<AssetCard
				{asset}
				selected={selectedIds.includes(asset.id)}
				{styleLabel}
				{colorLabel}
				{sizeLabel}
				{assetsHref}
				{onSelectChange}
				{onPreview}
				{onEdit}
				{onDelete}
			/>
		{/each}
	</div>
{:else}
	<Empty.Root class="min-h-80 border border-dashed border-[#d9deed] bg-[#fbfcff]">
		<Empty.Media><FileImage class="size-10 text-[#9aa5bb]" /></Empty.Media>
		<Empty.Header>
			<Empty.Title>{hasFilters ? '没有匹配的素材' : '还没有素材'}</Empty.Title>
			<Empty.Description>
				{hasFilters ? '调整筛选条件后再试试。' : '上传商品图、背景图或装饰元素后会显示在这里。'}
			</Empty.Description>
		</Empty.Header>
		<Empty.Content class="flex gap-2">
			{#if hasFilters}
				<Button href={resolve('/app/assets')} variant="outline">清除筛选</Button>
			{/if}
			<Button onclick={onUpload}><Upload class="size-4" />上传素材</Button>
		</Empty.Content>
	</Empty.Root>
{/if}
