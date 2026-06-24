<script lang="ts">
	import { untrack } from 'svelte';
	import { ImagePlus, Sparkles, UploadCloud } from '@lucide/svelte';
	import JobCard from './job-card.svelte';

	let {
		tool,
		title,
		description,
		requireSource = false
	} = $props<{
		tool: 'product' | 'scene' | 'remove-background';
		title: string;
		description: string;
		requireSource?: boolean;
	}>();
	let prompt = $state('');
	let provider = $state<'auto' | 'openai' | 'tongyi'>('auto');
	let count = $state(untrack(() => (tool === 'remove-background' ? 1 : 4)));
	let aspectRatio = $state('1:1');
	let file = $state<File>();
	let preview = $state('');
	let loading = $state(false);
	let error = $state('');
	let activeJob = $state<any>();

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!selected) return;
		file = selected;
		preview = URL.createObjectURL(selected);
	}

	async function uploadSource() {
		if (!file) return undefined;
		const presign = await fetch('/api/uploads/presign', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size })
		});
		const descriptor = await presign.json();
		if (!presign.ok) throw new Error(descriptor.message);
		const uploaded = await fetch(descriptor.url, {
			method: 'PUT',
			headers: descriptor.headers,
			body: file
		});
		if (!uploaded.ok) throw new Error('图片上传失败，请检查 MinIO 配置');
		return descriptor.assetId as string;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		if (requireSource && !file) {
			error = '请先上传一张商品图片';
			return;
		}
		loading = true;
		try {
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ tool, provider, prompt, count, aspectRatio, sourceAssetId })
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.message);
			activeJob = { ...payload.job, outputs: [] };
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '创建任务失败';
		} finally {
			loading = false;
		}
	}
</script>

<div class="grid gap-6 xl:grid-cols-[420px_1fr]">
	<form onsubmit={submit} class="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
		<div class="flex items-center gap-3">
			<div class="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
				<Sparkles class="size-5" />
			</div>
			<div>
				<h1 class="text-xl font-bold">{title}</h1>
				<p class="mt-1 text-xs text-muted-foreground">{description}</p>
			</div>
		</div>
		<label class="mt-6 block text-sm font-medium"
			>商品图片 {requireSource ? '*' : '（可选）'}
			<span
				class="mt-2 grid min-h-40 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/30 text-center hover:border-primary/40"
			>
				{#if preview}<img
						src={preview}
						alt="上传预览"
						class="max-h-64 w-full object-contain"
					/>{:else}<span class="p-6 text-sm text-muted-foreground"
						><UploadCloud class="mx-auto mb-2 size-7 text-primary" />点击上传 JPG、PNG 或 WebP<br
						/><small>最大 10 MB</small></span
					>{/if}
				<input
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/>
			</span>
		</label>
		{#if tool !== 'remove-background'}
			<label class="mt-5 block text-sm font-medium"
				>创意描述<textarea
					bind:value={prompt}
					rows="4"
					maxlength="2000"
					class="mt-2 w-full resize-none rounded-xl border p-3 outline-none focus:ring-2 focus:ring-primary/20"
					placeholder="描述商品、场景、光线、风格和期望效果"></textarea></label
			>
			<div class="mt-5 grid grid-cols-2 gap-4">
				<label class="text-sm font-medium"
					>生成引擎<select
						bind:value={provider}
						class="mt-2 h-11 w-full rounded-xl border bg-white px-3"
						><option value="auto">自动选择</option><option value="openai">OpenAI</option><option
							value="tongyi">通义万相</option
						></select
					></label
				><label class="text-sm font-medium"
					>图片比例<select
						bind:value={aspectRatio}
						class="mt-2 h-11 w-full rounded-xl border bg-white px-3"
						><option>1:1</option><option>4:5</option><option>16:9</option></select
					></label
				>
			</div>
			<label class="mt-5 block text-sm font-medium"
				>输出数量：{count}<input
					class="mt-3 w-full accent-primary"
					type="range"
					min="1"
					max="4"
					bind:value={count}
				/></label
			>
		{/if}
		{#if error}<p class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>{/if}
		<button
			disabled={loading}
			class="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white disabled:opacity-60"
			><ImagePlus class="size-4" />{loading
				? '正在创建任务…'
				: tool === 'remove-background'
					? '开始抠图 · 1 积分'
					: `开始生成 · 最多 ${count * (tool === 'scene' ? 3 : 2)} 积分`}</button
		>
	</form>
	<section>
		{#if activeJob}<JobCard initialJob={activeJob} />{:else}<div
				class="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center text-muted-foreground"
			>
				<div>
					<ImagePlus class="mx-auto size-10 text-primary/40" />
					<p class="mt-3 text-sm">提交任务后，处理阶段和结果会在这里实时更新。</p>
				</div>
			</div>{/if}
	</section>
</div>
