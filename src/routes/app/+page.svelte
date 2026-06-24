<script lang="ts">
	import { ArrowRight, Image, Sparkles, WandSparkles } from '@lucide/svelte';
	import JobCard from '$lib/components/app/job-card.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const tools = [
		{
			href: '/app/create/product',
			title: 'AI 商品图',
			description: '从描述或参考图生成电商视觉',
			icon: Sparkles
		},
		{
			href: '/app/create/scene',
			title: '场景图编辑',
			description: '把商品自然融入营销场景',
			icon: WandSparkles
		},
		{
			href: '/app/create/remove-background',
			title: '智能抠图',
			description: '生成干净透明背景 PNG',
			icon: Image
		}
	];
</script>

<svelte:head><title>工作台 - DesignAI</title></svelte:head>
<div class="mb-7">
	<h1 class="text-2xl font-bold">开始创作</h1>
	<p class="mt-1 text-sm text-muted-foreground">选择一个工具，把商品素材变成可投放的视觉内容。</p>
</div>
<div class="grid gap-4 md:grid-cols-3">
	{#each tools as tool}<a
			href={tool.href}
			class="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30"
			><div class="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
				<tool.icon class="size-5" />
			</div>
			<h2 class="mt-4 font-semibold">{tool.title}</h2>
			<p class="mt-1 text-sm text-muted-foreground">{tool.description}</p>
			<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
				>立即使用 <ArrowRight class="size-4 transition group-hover:translate-x-1" /></span
			></a
		>{/each}
</div>
<div class="mt-9 flex items-center justify-between">
	<h2 class="text-lg font-semibold">最近任务</h2>
	<a href="/app/history" class="text-sm text-primary">查看全部</a>
</div>
<div class="mt-4 space-y-4">
	{#if data.jobs.length}{#each data.jobs as job (job!.id)}{#if job}<JobCard
					initialJob={job}
					compact
				/>{/if}{/each}{:else}<div
			class="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-muted-foreground"
		>
			还没有生成记录，从上方选择一个工具开始吧。
		</div>{/if}
</div>
