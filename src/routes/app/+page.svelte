<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		dashboardFallbackImages,
		dashboardTools,
		inspirationTemplates,
		toolTypeLabels
	} from '$lib/app-catalog';
	import { cn } from '$lib/utils';
	import { ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, Search } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	type DashboardJob = NonNullable<PageData['jobs'][number]>;

	function jobPreview(job: DashboardJob) {
		return (
			job.outputs?.[0]?.url ??
			dashboardFallbackImages[job.tool] ??
			'/images/app/dashboard/product-perfume.png'
		);
	}

	function jobProgress(job: DashboardJob) {
		const fallback = job.status === 'succeeded' ? 100 : 45;
		return Math.min(100, Math.max(0, job.progress ?? fallback));
	}

	function jobMeta(job: DashboardJob) {
		const status = job.status === 'succeeded' ? '已完成' : '正在处理';
		const date = new Date(job.createdAt).toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		return `${status} · ${date}`;
	}
</script>

<svelte:head><title>工作台 - DesignAI</title></svelte:head>

<div class="flex items-start justify-between">
	<div>
		<h1 class="text-[25px] font-black leading-none tracking-normal text-[#121826]">
			你好，创意家 👋
		</h1>
		<p class="mt-4 text-[13px] font-medium text-[#65708a]">
			今天想要创作什么呢？DesignAI 帮你轻松搞定视觉设计！
		</p>
	</div>
	<label
		class="mt-8 flex h-9 w-92.5 items-center gap-2 rounded-full border border-[#dde2f2] bg-white/78 px-4 text-xs text-[#8a94ad] shadow-sm"
	>
		<Search class="size-4" />
		<input class="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索我的文件或模板" />
		<span class="rounded-md bg-[#f6f7fb] px-2 py-0.5 text-[#65708a]">/</span>
	</label>
</div>

<section class="mt-12">
	<h2 class="text-[18px] font-black text-[#121826]">开始创作</h2>
	<div class="mt-4 grid grid-cols-3 gap-4">
		{#each dashboardTools as tool (tool.href)}
			<a
				href={resolve(tool.href)}
				class={`group relative h-61.5 overflow-hidden rounded-2xl border border-[#dfe3f2] bg-linear-to-br ${tool.tone} p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10`}
			>
				{#if tool.title === '智能抠图'}
					<div
						class="absolute top-0 right-0 bottom-0 w-[43%]"
						style="background-color: #fff; background-image: linear-gradient(45deg, #eef1f7 25%, transparent 25%), linear-gradient(-45deg, #eef1f7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eef1f7 75%), linear-gradient(-45deg, transparent 75%, #eef1f7 75%); background-position: 0 0, 0 12px, 12px -12px, -12px 0; background-size: 24px 24px;"
					></div>
				{/if}
				<div class="relative z-10 max-w-[64%]">
					<div
						class={`grid size-12 place-items-center rounded-xl text-white shadow-lg ${tool.title === '智能抠图' ? 'bg-[#2eb99d] shadow-emerald-500/20' : 'bg-primary shadow-primary/25'}`}
					>
						<tool.icon class="size-6" />
					</div>
					<h3 class="mt-5 text-[21px] font-black leading-none text-[#121826]">
						{tool.title}
						{#if tool.badge}<span
								class="ml-3 rounded-md bg-primary/10 px-2 py-1 align-middle text-xs font-bold text-primary"
								>{tool.badge}</span
							>{/if}
					</h3>
					<p class="mt-6 text-sm font-semibold text-[#65708a]">{tool.description}</p>
					<span
						class={cn(
							'mt-8 inline-flex h-9 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-lg',
							{
								'border border-emerald-200 bg-white text-[#25a98f] shadow-emerald-500/10':
									tool.title === '智能抠图',
								'bg-primary text-white shadow-primary/20': tool.title === 'AI 商品图',
								'border border-blue-300 bg-white text-[#507f8b] shadow-emerald-500/10':
									tool.title === '场景图编辑'
							}
						)}
					>
						立即创建 <ArrowRight class="size-4 transition group-hover:translate-x-1" />
					</span>
				</div>
				<img
					src={tool.image}
					alt=""
					class={cn(
						'absolute right-0 bottom-0 top-0 object-contain transition group-hover:scale-105',
						{
							'h-43.5 w-47.5 -translate-x-2 translate-y-1': tool.title === '智能抠图'
						}
					)}
				/>
			</a>
		{/each}
	</div>
</section>

<section class="mt-10">
	<div class="flex items-center justify-between">
		<h2 class="text-[18px] font-black text-[#121826]">最近任务</h2>
		<a href={resolve('/app/history')} class="flex items-center gap-1 text-sm font-bold text-primary"
			>查看全部 <ChevronRight class="size-4" /></a
		>
	</div>
	<div class="mt-4 overflow-hidden rounded-xl border border-[#e1e5f2] bg-white shadow-sm">
		{#if data.jobs.length}
			{#each data.jobs as job (job!.id)}
				{#if job}<div
						class="grid min-h-17 grid-cols-[64px_260px_1fr_74px_72px] items-center gap-4 border-b border-[#eef1f7] px-5 last:border-b-0"
					>
						<img
							src={jobPreview(job)}
							alt=""
							class="size-12 rounded-lg object-cover ring-1 ring-[#edf0f7]"
						/>
						<div class="min-w-0">
							<p class="truncate text-sm font-black text-[#121826]">
								{toolTypeLabels[job.tool] ?? '生成任务'}
							</p>
							<p class="mt-1 truncate text-xs font-medium text-[#65708a]">{jobMeta(job)}</p>
						</div>
						<div class="h-1.5 overflow-hidden rounded-full bg-[#edf0f7]">
							<div
								class={`h-full rounded-full ${job.status === 'succeeded' ? 'bg-[#2db69b]' : 'bg-primary'}`}
								style:width={`${jobProgress(job)}%`}
							></div>
						</div>
						<span class="text-sm font-bold text-[#65708a]"
							>{job.status === 'succeeded'
								? `${job.completedCount}/${job.totalCount}`
								: `${jobProgress(job)}%`}</span
						>
						<a
							href={resolve('/app/history')}
							class="flex h-9 items-center justify-center rounded-lg border border-[#dde2f2] text-sm font-bold text-primary"
							>查看</a
						>
					</div>{/if}
			{/each}
		{:else}
			<div class="grid min-h-51 place-items-center text-center text-sm text-[#65708a]">
				<div>
					<LoaderCircle class="mx-auto mb-3 size-8 text-primary/40" />
					还没有生成记录，从上方选择一个工具开始吧。
				</div>
			</div>
		{/if}
	</div>
</section>
<section class="mt-9">
	<div class="flex items-center justify-between">
		<h2 class="text-[18px] font-black text-[#121826]">灵感模板</h2>
		<div class="flex items-center gap-2">
			<button
				class="grid size-9 place-items-center rounded-full border border-[#e1e5f2] bg-white text-[#b8c0d4]"
				aria-label="上一组模板"
			>
				<ChevronLeft class="size-4" />
			</button>
			<button
				class="grid size-9 place-items-center rounded-full border border-[#e1e5f2] bg-white text-[#121826]"
				aria-label="下一组模板"
			>
				<ChevronRight class="size-4" />
			</button>
		</div>
	</div>
	<div class="mt-4 grid grid-cols-5 gap-5">
		{#each inspirationTemplates as template (template.name)}
			<article
				class="relative h-32.5 overflow-hidden rounded-lg border border-[#e1e5f2] bg-white shadow-sm"
			>
				<img src={template.image} alt="" class="absolute inset-0 size-full object-cover" />
				<div
					class="absolute inset-0 bg-linear-to-r from-white/90 via-white/44 to-transparent"
				></div>
				<div class="relative p-6">
					<h3 class="text-[17px] font-black leading-none text-[#121826]">{template.name}</h3>
					<p class="mt-3 text-xs font-semibold text-[#3f4b66]">{template.description}</p>
				</div>
			</article>
		{/each}
	</div>
</section>
