<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { Download, Eye, MoreHorizontal, Pencil, Star, Trash2 } from '@lucide/svelte';
	import type { AssetItem } from './types';

	let {
		asset,
		selected,
		styleLabel,
		colorLabel,
		sizeLabel,
		assetsHref,
		onSelectChange,
		onPreview,
		onEdit,
		onDelete
	}: {
		asset: AssetItem;
		selected: boolean;
		styleLabel: (value: string | null) => string;
		colorLabel: (value: string | null) => string;
		sizeLabel: (asset: AssetItem) => string;
		assetsHref: (params: Record<string, string | number | boolean | undefined>) => string;
		onSelectChange: (assetId: string, checked: boolean) => void;
		onPreview: (asset: AssetItem) => void;
		onEdit: (asset: AssetItem) => void;
		onDelete: (asset: AssetItem) => void;
	} = $props();
</script>

<article class="group overflow-hidden rounded-xl border border-[#e1e5f2] bg-white shadow-sm">
	<div class="relative aspect-square bg-[#f7f8fc]">
		<img src={asset.url} alt={asset.displayName} class="size-full object-cover" />
		<label
			class="absolute top-3 left-3 grid size-8 place-items-center rounded-full bg-white/90 shadow"
		>
			<Checkbox
				checked={selected}
				onCheckedChange={(checked) => onSelectChange(asset.id, Boolean(checked))}
				aria-label={`选择 ${asset.displayName}`}
			/>
		</label>
		<form
			method="POST"
			action="?/toggleFavorite"
			use:enhance={() =>
				({ update }) =>
					update()}
		>
			<input type="hidden" name="id" value={asset.id} />
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-[#65708a] shadow"
							aria-label={asset.favorite ? '取消收藏' : '收藏素材'}
						>
							<Star class={cn('size-4', asset.favorite && 'fill-primary text-primary')} />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>{asset.favorite ? '取消收藏' : '收藏素材'}</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</form>
		<Badge class="absolute bottom-3 left-3 bg-white/90 text-[#65708a]">{asset.format}</Badge>
		<div class="absolute right-3 bottom-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="grid size-9 place-items-center rounded-full bg-white/90 text-primary shadow"
							aria-label="预览素材"
							onclick={() => onPreview(asset)}
						>
							<Eye class="size-4" />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>预览</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={asset.url}
							target="_blank"
							rel="noreferrer"
							class="grid size-9 place-items-center rounded-full bg-white/90 text-primary shadow"
							aria-label="下载素材"
						>
							<Download class="size-4" />
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</Tooltip.Trigger>
					<Tooltip.Content>下载</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	</div>
	<div class="p-3">
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0">
				<p class="truncate text-sm font-black text-[#121826]">{asset.displayName}</p>
				<p class="mt-1 truncate text-xs font-medium text-[#65708a]">
					{asset.format} · {sizeLabel(asset)}
				</p>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="grid size-8 place-items-center rounded-lg text-[#65708a]"
					aria-label="更多操作"
				>
					<MoreHorizontal class="size-4" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" sideOffset={8} class="w-44 p-1.5">
					<DropdownMenu.Item onclick={() => onPreview(asset)} class="gap-2 py-2">
						<Eye class="size-4" />预览
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onEdit(asset)} class="gap-2 py-2">
						<Pencil class="size-4" />编辑信息
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onDelete(asset)} class="gap-2 py-2 text-red-500">
						<Trash2 class="size-4" />删除
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#if asset.style}<Badge variant="secondary">{styleLabel(asset.style)}</Badge>{/if}
			{#if asset.color}
				<Badge variant="secondary" class="gap-1">
					<span class="size-2 rounded-full" style:background={asset.color}></span>
					{colorLabel(asset.color)}
				</Badge>
			{/if}
			{#each asset.tags.slice(0, 3) as tag (tag)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a href={assetsHref({ tag, page: 1 })}><Badge variant="secondary">#{tag}</Badge></a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/each}
		</div>
	</div>
</article>
