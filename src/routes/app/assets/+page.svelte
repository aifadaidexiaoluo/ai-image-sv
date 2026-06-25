<script lang="ts">
	import { Download, Heart, MoreHorizontal, Search, SlidersHorizontal, Star } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { assetShowcase, assetTypeLabels, colorSwatches } from '$lib/app-catalog';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let activeType = $state('all');
	let keyword = $state('');
	const categoryCounts = $derived({
		all: data.assets.length,
		source: data.assets.filter((asset) => asset.kind === 'source').length,
		output: data.assets.filter((asset) => asset.kind === 'output').length,
		template: data.assets.filter((asset) => asset.kind === 'template').length,
		thumbnail: data.assets.filter((asset) => asset.kind === 'thumbnail').length
	});
	const filteredAssets = $derived(
		data.assets.filter((asset) => {
			const matchesType = activeType === 'all' || asset.kind === activeType;
			const matchesKeyword =
				!keyword || asset.fileName.toLowerCase().includes(keyword.toLowerCase());
			return matchesType && matchesKeyword;
		})
	);
	const displayAssets = $derived(filteredAssets.length ? filteredAssets : []);
	const tabs = [
		['all', '全部素材'],
		['source', '产品素材'],
		['output', '场景背景'],
		['template', '装饰元素'],
		['thumbnail', '贴纸图标'],
		['texture', '背景纹理'],
		['font', '字体素材']
	];
	const tags = ['简约', '自然', '科技', '电商', '节日', '促销', '高级感', '国风', '3D'];
</script>

<svelte:head><title>素材库 - DesignAI</title></svelte:head>
<div class="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">素材库</h1>
		<p class="mt-2 text-sm text-[#65708a]">海量优质素材，满足各类商用设计需求</p>
	</div>
	<div class="flex flex-wrap gap-3">
		<label
			class="flex h-11 w-80 items-center gap-2 rounded-xl border border-[#dde2f2] bg-white px-3 text-sm text-[#8a94ad] shadow-sm"
		>
			<Search class="size-4" />
			<input
				bind:value={keyword}
				class="min-w-0 flex-1 bg-transparent outline-none"
				placeholder="搜索素材关键词"
			/>
		</label>
		<button
			class="h-11 rounded-xl border border-[#dde2f2] bg-white px-5 text-sm font-bold text-[#65708a]"
			>按最新</button
		>
	</div>
</div>

<section class="overflow-hidden rounded-2xl border border-[#e1e5f2] bg-white shadow-sm">
	<div class="flex overflow-x-auto border-b border-[#eef1f7]">
		{#each tabs as [id, label] (id)}
			<button
				onclick={() => (activeType = id)}
				class={`h-14 shrink-0 border-b-2 px-6 text-sm font-black ${activeType === id ? 'border-primary text-primary' : 'border-transparent text-[#65708a]'}`}
				>{label}</button
			>
		{/each}
	</div>
	<div class="flex flex-wrap items-center gap-5 border-b border-[#eef1f7] p-5 text-sm">
		<label class="font-bold text-[#65708a]"
			>类型 <select class="ml-3 h-10 rounded-lg border border-[#dde2f2] px-4"
				><option>全部</option></select
			></label
		>
		<label class="font-bold text-[#65708a]"
			>风格 <select class="ml-3 h-10 rounded-lg border border-[#dde2f2] px-4"
				><option>全部</option></select
			></label
		>
		<label class="font-bold text-[#65708a]"
			>颜色 <select class="ml-3 h-10 rounded-lg border border-[#dde2f2] px-4"
				><option>全部</option></select
			></label
		>
		<label class="font-bold text-[#65708a]"
			>比例 <select class="ml-3 h-10 rounded-lg border border-[#dde2f2] px-4"
				><option>全部</option></select
			></label
		>
		<div class="flex items-center gap-2">
			<span class="font-bold text-[#65708a]">颜色</span>
			{#each colorSwatches as color (color)}<span
					class="size-4 rounded-full ring-1 ring-black/5"
					style:background={color}
				></span>{/each}
		</div>
		<button
			class="ml-auto inline-flex h-10 items-center gap-2 rounded-lg border border-[#dde2f2] px-4 font-bold text-[#65708a]"
			><SlidersHorizontal class="size-4" />更多筛选</button
		>
		<button class="h-10 rounded-lg border border-[#dde2f2] px-4 font-bold text-[#65708a]"
			>重置</button
		>
	</div>

	<div class="grid gap-0 lg:grid-cols-[210px_1fr]">
		<aside class="border-r border-[#eef1f7] p-5">
			<h2 class="font-black text-[#121826]">素材分类</h2>
			<div class="mt-4 space-y-2">
				{#each Object.entries(assetTypeLabels) as [id, label] (id)}
					<button
						onclick={() => (activeType = id)}
						class={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold ${activeType === id ? 'bg-primary/10 text-primary' : 'text-[#65708a]'}`}
					>
						<span>{label}</span><span>{categoryCounts[id as keyof typeof categoryCounts] ?? 0}</span
						>
					</button>
				{/each}
			</div>
			<h2 class="mt-8 font-black text-[#121826]">热门标签</h2>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each tags as tag (tag)}<span
						class="rounded-lg bg-[#f3f5fb] px-3 py-1.5 text-xs font-bold text-[#65708a]">{tag}</span
					>{/each}
			</div>
		</aside>

		<div class="p-5">
			<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
				{#if displayAssets.length}
					{#each displayAssets as asset (asset.id)}
						<article
							class="group overflow-hidden rounded-xl border border-[#e1e5f2] bg-white shadow-sm"
						>
							<div class="relative aspect-square bg-[#f7f8fc]">
								<img src={asset.url} alt={asset.fileName} class="size-full object-cover" />
								<form method="POST" action="?/toggleFavorite" use:enhance>
									<input type="hidden" name="id" value={asset.id} />
									<button
										class="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-[#65708a] shadow"
										><Star
											class={`size-4 ${asset.favorite ? 'fill-primary text-primary' : ''}`}
										/></button
									>
								</form>
								<!-- eslint-disable svelte/no-navigation-without-resolve -->
								<a
									href={asset.url}
									target="_blank"
									class="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-primary opacity-0 shadow transition group-hover:opacity-100"
									><Download class="size-4" /></a
								>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
								<span
									class="absolute bottom-3 left-3 rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-[#8a94ad]"
									>{asset.mimeType.includes('png') ? 'PNG' : 'JPG'}</span
								>
							</div>
							<div class="p-3">
								<p class="truncate text-sm font-black text-[#121826]">{asset.fileName}</p>
								<p class="mt-1 text-xs font-medium text-[#65708a]">
									{asset.mimeType.split('/')[1]?.toUpperCase()} · {asset.width && asset.height
										? `${asset.width} x ${asset.height}`
										: `${Math.round(asset.sizeBytes / 1024)} KB`}
								</p>
							</div>
						</article>
					{/each}
				{:else}
					{#each assetShowcase as asset (asset.name)}
						<article
							class="group overflow-hidden rounded-xl border border-[#e1e5f2] bg-white opacity-80 shadow-sm"
						>
							<div class="relative aspect-square bg-[#f7f8fc]">
								<img src={asset.image} alt="" class="size-full object-cover" />
								<Heart
									class="absolute top-3 right-3 size-8 rounded-full bg-white/90 p-2 text-[#65708a] shadow"
								/>
								<span
									class="absolute bottom-3 left-3 rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-[#8a94ad]"
									>{asset.kind}</span
								>
							</div>
							<div class="p-3">
								<p class="truncate text-sm font-black text-[#121826]">{asset.name}</p>
								<p class="mt-1 text-xs font-medium text-[#65708a]">{asset.kind} · {asset.size}</p>
							</div>
						</article>
					{/each}
				{/if}
			</div>
			<div class="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#65708a]">
				<span>共 {data.assets.length || assetShowcase.length} 条</span>
				<button class="rounded-lg border border-[#dde2f2] px-3 py-2">1</button>
				<button class="rounded-lg border border-[#dde2f2] px-3 py-2">2</button>
				<button class="rounded-lg border border-[#dde2f2] px-3 py-2">3</button>
				<button class="rounded-lg border border-[#dde2f2] px-3 py-2"
					><MoreHorizontal class="size-4" /></button
				>
			</div>
		</div>
	</div>
</section>
