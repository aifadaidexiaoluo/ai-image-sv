<script lang="ts">
	import { ArrowRight, CheckCircle2, LoaderCircle, Search } from '@lucide/svelte';
	import { dashboardTools, inspirationTemplates, toolTypeLabels } from '$lib/app-catalog';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function jobPreview(job: any) {
		return job.outputs?.[0]?.url ?? '/images/app/products/perfume-main.png';
	}
</script>

<svelte:head><title>工作台 - DesignAI</title></svelte:head>
<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
	<div>
		<h1 class="text-2xl font-black tracking-normal text-[#121826]">你好，创意家 👋</h1>
		<p class="mt-2 text-sm text-[#65708a]">今天想要创作什么呢？DesignAI 帮你轻松搞定视觉设计！</p>
	</div>
	<label
		class="flex h-11 w-full items-center gap-2 rounded-full border border-[#dde2f2] bg-white px-4 text-sm text-[#8a94ad] shadow-sm lg:w-96"
	>
		<Search class="size-4" />
		<input class="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索我的文件或模板" />
		<span class="rounded-md bg-[#f6f7fb] px-2 py-0.5 text-[#65708a]">/</span>
	</label>
</div>

<section class="mt-10">
	<h2 class="text-lg font-black text-[#121826]">开始创作</h2>
	<div class="mt-4 grid gap-4 xl:grid-cols-3">
		{#each dashboardTools as tool}<a
				href={tool.href}
				class={`group relative min-h-52 overflow-hidden rounded-2xl border border-[#dfe3f2] bg-gradient-to-br ${tool.tone} p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10`}
				><div class="relative z-10 max-w-[62%]">
					<div
						class="grid size-12 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25"
					>
						<tool.icon class="size-6" />
					</div>
					<h3 class="mt-4 text-xl font-black text-[#121826]">
						{tool.title}
						{#if tool.badge}<span
								class="ml-2 rounded-md bg-primary/10 px-2 py-1 align-middle text-xs font-bold text-primary"
								>{tool.badge}</span
							>{/if}
					</h3>
					<p class="mt-3 text-sm font-medium text-[#65708a]">{tool.description}</p>
					<span
						class="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20"
					>
						立即创建 <ArrowRight class="size-4 transition group-hover:translate-x-1" />
					</span>
				</div>
				<img
					src={tool.image}
					alt=""
					class="absolute right-0 bottom-0 h-40 w-44 object-contain transition group-hover:scale-105"
				/>
			</a>{/each}
	</div>
</section>

<section class="mt-10">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-black text-[#121826]">最近任务</h2>
		<a href="/app/history" class="text-sm font-bold text-primary">查看全部</a>
	</div>
	<div class="mt-4 overflow-hidden rounded-2xl border border-[#e1e5f2] bg-white shadow-sm">
		{#if data.jobs.length}
			{#each data.jobs as job (job!.id)}
				{#if job}<div
						class="grid items-center gap-4 border-b border-[#eef1f7] p-4 last:border-b-0 md:grid-cols-[72px_1fr_45%_72px_72px]"
					>
						<img
							src={jobPreview(job)}
							alt=""
							class="size-14 rounded-xl object-cover ring-1 ring-[#edf0f7]"
						/>
						<div class="min-w-0">
							<p class="truncate text-sm font-black text-[#121826]">{toolTypeLabels[job.tool]}</p>
							<p class="mt-1 truncate text-xs text-[#65708a]">
								{job.status === 'succeeded' ? '已完成' : '正在处理'} · {new Date(
									job.createdAt
								).toLocaleString('zh-CN')}
							</p>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-[#edf0f7]">
							<div
								class="h-full rounded-full bg-primary"
								style:width={`${job.progress ?? (job.status === 'succeeded' ? 100 : 45)}%`}
							></div>
						</div>
						<span class="text-sm font-bold text-[#65708a]"
							>{job.completedCount}/{job.totalCount}</span
						>
						<a
							href="/app/history"
							class="flex h-9 items-center justify-center rounded-xl border border-[#dde2f2] text-sm font-bold text-primary"
							>查看</a
						>
					</div>{/if}
			{/each}
		{:else}
			<div class="grid min-h-40 place-items-center text-center text-sm text-[#65708a]">
				<div>
					<LoaderCircle
						class="mx-auto mb-3 size-8 text-primary/40"
					/>还没有生成记录，从上方选择一个工具开始吧。
				</div>
			</div>
		{/if}
	</div>
</section>

<section class="mt-10">
	<h2 class="text-lg font-black text-[#121826]">灵感模板</h2>
	<div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
		{#each inspirationTemplates as template}
			<article
				class="relative h-32 overflow-hidden rounded-xl border border-[#e1e5f2] bg-white shadow-sm"
			>
				<img
					src={template.image}
					alt=""
					class="absolute inset-0 size-full object-cover opacity-70"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent"
				></div>
				<div class="relative p-5">
					<CheckCircle2 class="mb-4 size-5 text-primary" />
					<h3 class="font-black text-[#121826]">{template.name}</h3>
					<p class="mt-1 text-xs font-medium text-[#65708a]">{template.description}</p>
				</div>
			</article>
		{/each}
	</div>
</section>
