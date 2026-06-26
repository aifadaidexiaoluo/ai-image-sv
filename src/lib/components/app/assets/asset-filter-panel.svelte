<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import AssetSelect from './asset-select.svelte';
	import type { AssetCounts, AssetOption, AssetTagSummary } from './types';

	let {
		activeKind,
		counts,
		format = $bindable('all'),
		ratio = $bindable('all'),
		style = $bindable('all'),
		color = $bindable('all'),
		pageSize = $bindable('12'),
		favorite = $bindable(false),
		formatOptions,
		ratioOptions,
		styleOptions,
		colorOptions,
		pageSizeOptions,
		availableTags,
		selectedTag,
		hasFilters,
		assetsHref,
		onApply,
		children
	}: {
		activeKind: string;
		counts: AssetCounts;
		format: string;
		ratio: string;
		style: string;
		color: string;
		pageSize: string;
		favorite: boolean;
		formatOptions: AssetOption[];
		ratioOptions: AssetOption[];
		styleOptions: AssetOption[];
		colorOptions: AssetOption[];
		pageSizeOptions: AssetOption[];
		availableTags: AssetTagSummary[];
		selectedTag: string;
		hasFilters: boolean;
		assetsHref: (params: Record<string, string | number | boolean | undefined>) => string;
		onApply: () => void;
		children: Snippet;
	} = $props();

	const tabs = [
		['all', '全部素材'],
		['source', '产品素材'],
		['output', '生成结果'],
		['template', '模板素材'],
		['thumbnail', '缩略图']
	] as const;
</script>

<section class="overflow-hidden rounded-2xl border border-[#e1e5f2] bg-white shadow-sm">
	<form
		onsubmit={(event) => {
			event.preventDefault();
			onApply();
		}}
		class="flex flex-wrap items-center gap-5 border-b border-[#eef1f7] p-5 text-sm"
	>
		<label class="flex items-center gap-3 font-bold text-[#65708a]">
			类型
			<AssetSelect bind:value={format} options={formatOptions} placeholder="全部格式" />
		</label>
		<label class="flex items-center gap-3 font-bold text-[#65708a]">
			比例
			<AssetSelect bind:value={ratio} options={ratioOptions} placeholder="全部比例" />
		</label>
		<label class="flex items-center gap-3 font-bold text-[#65708a]">
			风格
			<AssetSelect bind:value={style} options={styleOptions} placeholder="全部风格" />
		</label>
		<label class="flex items-center gap-3 font-bold text-[#65708a]">
			颜色
			<AssetSelect bind:value={color} options={colorOptions} placeholder="全部颜色" />
		</label>
		<label
			class="flex h-10 items-center gap-2 rounded-lg border border-[#dde2f2] px-3 font-bold text-[#65708a]"
		>
			<Checkbox bind:checked={favorite} />
			收藏
		</label>
		<AssetSelect
			bind:value={pageSize}
			options={pageSizeOptions}
			placeholder="12 条/页"
			class="h-10 w-30 rounded-lg border-[#dde2f2] bg-white font-bold text-[#65708a]"
		/>
		<Button
			type="submit"
			variant="outline"
			class="ml-auto h-10 border-[#dde2f2] bg-white font-bold text-[#65708a]"
		>
			应用筛选
		</Button>
		{#if hasFilters}
			<Button
				href={resolve('/app/assets')}
				variant="outline"
				class="h-10 border-[#dde2f2] text-[#65708a]"
			>
				<X class="size-4" />重置
			</Button>
		{/if}
	</form>

	<div class="grid gap-0 lg:grid-cols-[210px_1fr]">
		<aside class="border-r border-[#eef1f7] p-5">
			<h2 class="font-black text-[#121826]">素材分类</h2>
			<div class="mt-4 space-y-2">
				{#each tabs as [id, label] (id)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={assetsHref({ kind: id, page: 1 })}
						class={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold ${activeKind === id ? 'bg-primary/10 text-primary' : 'text-[#65708a]'}`}
					>
						<span>{label}</span><span>{counts[id]}</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/each}
			</div>
			<h2 class="mt-8 font-black text-[#121826]">热门标签</h2>
			<div class="mt-4 flex flex-wrap gap-2">
				{#if availableTags.length}
					{#each availableTags as item (item.tag)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a href={assetsHref({ tag: item.tag, page: 1 })}>
							<Badge
								variant={selectedTag === item.tag ? 'default' : 'secondary'}
								class="rounded-lg px-3 py-1.5"
							>
								{item.tag}
							</Badge>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				{:else}
					<span class="text-xs font-bold text-[#8a94ad]">暂无标签</span>
				{/if}
			</div>
		</aside>

		<div class="min-w-0 p-5">
			{@render children()}
		</div>
	</div>
</section>
