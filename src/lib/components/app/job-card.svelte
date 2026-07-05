<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		CheckCircle2,
		CircleAlert,
		Clock3,
		Download,
		LoaderCircle,
		RotateCcw
	} from '@lucide/svelte';
	import { refreshAccountData } from '$lib/account-refresh';
	import type {
		GenerationJob,
		GenerationJobStage,
		GenerationJobStatus,
		GenerationOutput
	} from '$lib/types/jobs';

	const jobStatuses = new Set<GenerationJobStatus>([
		'queued',
		'running',
		'succeeded',
		'partial',
		'failed',
		'canceled'
	]);
	const jobStages = new Set<GenerationJobStage>([
		'queued',
		'validating',
		'preparing',
		'submitting',
		'generating',
		'downloading',
		'postprocessing',
		'uploading',
		'completed'
	]);

	const stageLabels: Record<GenerationJobStage, string> = {
		queued: '等待执行',
		validating: '正在校验任务',
		preparing: '正在准备素材',
		submitting: '正在提交图片服务',
		generating: 'AI 正在处理图片',
		downloading: '正在获取结果',
		postprocessing: '正在优化图片',
		uploading: '正在保存结果',
		completed: '处理完成'
	};
	let { initialJob, compact = false }: { initialJob: GenerationJob; compact?: boolean } = $props();
	let job = $state<GenerationJob>(
		untrack(() => ({ ...initialJob, outputs: [...(initialJob.outputs ?? [])] }))
	);
	let message = $state(untrack(() => stageLabels[job.stage] ?? '正在处理'));
	let retrying = $state(false);

	const terminal = $derived(['succeeded', 'partial', 'failed', 'canceled'].includes(job.status));
	const title = $derived(
		job.tool === 'product' ? '商品图生成' : job.tool === 'scene' ? '场景图编辑' : '智能抠图'
	);

	function isJobStatus(value: unknown): value is GenerationJobStatus {
		return typeof value === 'string' && jobStatuses.has(value as GenerationJobStatus);
	}

	function isJobStage(value: unknown): value is GenerationJobStage {
		return typeof value === 'string' && jobStages.has(value as GenerationJobStage);
	}

	function mergeEvent(payload: Record<string, unknown>) {
		if (isJobStatus(payload.status)) job.status = payload.status;
		if (isJobStage(payload.stage)) job.stage = payload.stage;
		if (typeof payload.progress === 'number' || payload.progress === null)
			job.progress = payload.progress as number | null;
		if (typeof payload.completedCount === 'number') job.completedCount = payload.completedCount;
		if (typeof payload.totalCount === 'number') job.totalCount = payload.totalCount;
		if (typeof payload.message === 'string') message = payload.message;
		if (payload.output) {
			const output = payload.output as GenerationOutput;
			if (!job.outputs?.some((item) => item.position === output.position))
				job.outputs = [...(job.outputs ?? []), output];
		}
	}

	function isTerminalStatus(status: GenerationJobStatus) {
		return ['succeeded', 'partial', 'failed', 'canceled'].includes(status);
	}

	async function refresh() {
		const response = await fetch(`/api/jobs/${job.id}`);
		if (response.ok) {
			const payload = await response.json();
			job = payload.job;
			if (isTerminalStatus(job.status)) await refreshAccountData();
		}
	}

	async function retry() {
		retrying = true;
		const response = await fetch(`/api/jobs/${job.id}/retry`, { method: 'POST' });
		if (response.ok) {
			const payload = await response.json();
			job = { ...job, ...payload.job };
			await refreshAccountData();
		}
		retrying = false;
	}

	onMount(() => {
		if (terminal) return;
		let eventSource: EventSource | undefined;
		let pollTimer: ReturnType<typeof setTimeout> | undefined;
		const connect = () => {
			eventSource = new EventSource(`/api/jobs/${job.id}/events`);
			for (const type of [
				'job.status',
				'job.progress',
				'job.output',
				'job.completed',
				'job.failed'
			]) {
				eventSource.addEventListener(type, (event) => {
					mergeEvent(JSON.parse((event as MessageEvent).data));
					if (type === 'job.completed' || type === 'job.failed') {
						eventSource?.close();
						void refreshAccountData();
					}
				});
			}
			eventSource.onerror = () => {
				eventSource?.close();
				pollTimer = setTimeout(
					async () => {
						await refresh();
						if (!terminal) connect();
					},
					document.hidden ? 10_000 : 3_000
				);
			};
		};
		connect();
		return () => {
			eventSource?.close();
			if (pollTimer) clearTimeout(pollTimer);
		};
	});
</script>

<article
	class="overflow-hidden rounded-[18px] border border-[#e1e5f2] bg-white shadow-[0_14px_36px_rgba(61,72,120,0.05)]"
>
	<div class="flex items-start justify-between gap-3 border-b border-[#edf1f8] p-4">
		<div class="flex min-w-0 items-center gap-3">
			<div class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
				{#if job.status === 'succeeded'}<CheckCircle2
						class="size-5"
					/>{:else if job.status === 'failed'}<CircleAlert
						class="size-5 text-red-500"
					/>{:else if job.status === 'queued'}<Clock3 class="size-5" />{:else}<LoaderCircle
						class="size-5 animate-spin"
					/>{/if}
			</div>
			<div class="min-w-0">
				<h3 class="truncate text-[15px] font-black text-[#121826]">{title}</h3>
				<p class="mt-1 line-clamp-2 text-xs font-medium leading-5 text-[#65708a]">{message}</p>
			</div>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-2 text-sm">
			<span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
				{job.completedCount}/{job.totalCount}
			</span>
			{#if ['failed', 'partial'].includes(job.status)}<button
					onclick={retry}
					disabled={retrying}
					class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-muted"
					><RotateCcw class="size-3.5" />重试</button
				>{/if}
		</div>
	</div>
	{#if !terminal}
		<div class="px-4 py-4">
			<div class="h-2 overflow-hidden rounded-full bg-[#eef2f8]">
				<div
					class:animate-pulse={job.progress === null}
					class="h-full rounded-full bg-primary transition-all duration-500"
					style:width={job.progress === null ? '45%' : `${job.progress ?? 0}%`}
				></div>
			</div>
		</div>
	{/if}
	{#if job.outputs?.length}
		<div class={`grid gap-3 p-4 sm:p-5 ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
			{#each job.outputs.sort((a, b) => a.position - b.position) as output (output.position)}
				<div class="group relative aspect-square overflow-hidden rounded-xl bg-muted">
					<img
						src={output.url}
						alt={`生成结果 ${output.position + 1}`}
						class="size-full object-cover"
					/>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={output.url}
						target="_blank"
						class="absolute right-2 bottom-2 grid size-8 place-items-center rounded-lg bg-white/90 text-primary opacity-0 shadow transition group-hover:opacity-100"
						aria-label="下载图片"><Download class="size-4" /></a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/each}
		</div>
	{:else if terminal}
		<p class="p-5 text-sm text-muted-foreground">
			{job.errorMessage ?? '本次任务没有生成可用结果。'}
		</p>
	{/if}
</article>
