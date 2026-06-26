<script lang="ts">
	import { assetTypeLabels } from '$lib/app-catalog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Download, Pencil } from '@lucide/svelte';
	import type { AssetItem } from './types';

	let {
		asset = $bindable<AssetItem | undefined>(),
		styleLabel,
		colorLabel,
		sizeLabel,
		onEdit
	}: {
		asset?: AssetItem;
		styleLabel: (value: string | null) => string;
		colorLabel: (value: string | null) => string;
		sizeLabel: (asset: AssetItem) => string;
		onEdit: (asset: AssetItem) => void;
	} = $props();

	function editCurrent() {
		if (asset) onEdit(asset);
	}
</script>

<Dialog.Root open={Boolean(asset)} onOpenChange={(open) => !open && (asset = undefined)}>
	<Dialog.Content class="sm:max-w-3xl">
		{#if asset}
			<Dialog.Header>
				<Dialog.Title>{asset.displayName}</Dialog.Title>
				<Dialog.Description>{asset.format} · {sizeLabel(asset)}</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-5 lg:grid-cols-[1fr_240px]">
				<div class="grid min-h-80 place-items-center rounded-xl bg-[#f6f7fb]">
					<img
						src={asset.url}
						alt={asset.displayName}
						class="max-h-[60vh] rounded-lg object-contain"
					/>
				</div>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between gap-4">
						<span class="text-[#65708a]">类型</span><span>{assetTypeLabels[asset.kind]}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-[#65708a]">风格</span><span>{styleLabel(asset.style)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-[#65708a]">颜色</span><span>{colorLabel(asset.color)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-[#65708a]">创建时间</span><span class="text-right"
							>{new Date(asset.createdAt).toLocaleString('zh-CN')}</span
						>
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#each asset.tags as tag (tag)}<Badge variant="secondary">#{tag}</Badge>{/each}
					</div>
					<div class="flex gap-2 pt-2">
						<Button href={asset.url} target="_blank" rel="noreferrer" class="flex-1">
							<Download class="size-4" />下载
						</Button>
						<Button type="button" variant="outline" onclick={editCurrent}>
							<Pencil class="size-4" />编辑
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
