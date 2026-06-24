<script lang="ts">
	import { Download, Image } from '@lucide/svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>素材库 - DesignAI</title></svelte:head>
<h1 class="text-2xl font-bold">素材库</h1>
<p class="mt-1 text-sm text-muted-foreground">集中管理上传原图和 AI 生成结果。</p>
{#if data.assets.length}<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
		{#each data.assets as asset (asset.id)}<article
				class="group overflow-hidden rounded-2xl border bg-white"
			>
				<div class="relative aspect-square bg-muted">
					<img src={asset.url} alt={asset.fileName} class="size-full object-cover" /><a
						href={asset.url}
						target="_blank"
						class="absolute right-2 bottom-2 grid size-9 place-items-center rounded-lg bg-white/90 text-primary opacity-0 shadow group-hover:opacity-100"
						><Download class="size-4" /></a
					>
				</div>
				<div class="p-3">
					<p class="truncate text-sm font-medium">{asset.fileName}</p>
					<p class="mt-1 text-xs text-muted-foreground">
						{asset.kind === 'source' ? '上传原图' : '生成结果'}
					</p>
				</div>
			</article>{/each}
	</div>{:else}<div
		class="mt-6 grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white text-center text-sm text-muted-foreground"
	>
		<div><Image class="mx-auto mb-3 size-9 text-primary/40" />还没有素材</div>
	</div>{/if}
