<script lang="ts">
	import { productStyles, promptSuggestions } from '$lib/app-catalog';
	import JobCard from '$lib/components/app/job-card.svelte';
	import { ImagePlus, Info, RefreshCw, Sparkles, UploadCloud } from '@lucide/svelte';

	let generationMode = $state<'prompt' | 'reference'>('prompt');
	let prompt = $state('');
	let provider = $state<'auto' | 'openai' | 'tongyi'>('auto');
	let count = $state(4);
	let aspectRatio = $state('1:1');
	let size = $state('1024x1024');
	let styleIds = $state<string[]>(['commerce-white']);
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

	function toggleStyle(id: string) {
		styleIds = styleIds.includes(id) ? styleIds.filter((item) => item !== id) : [...styleIds, id];
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
		if (!uploaded.ok) throw new Error('图片上传失败，请检查存储配置');
		return descriptor.assetId as string;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		if (generationMode === 'reference' && !file) {
			error = '参考图生成需要先上传一张商品图片';
			return;
		}
		loading = true;
		try {
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					tool: 'product',
					provider,
					prompt,
					count,
					aspectRatio,
					sourceAssetId,
					parameters: { generationMode, styleIds, size }
				})
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

<svelte:head><title>商品图生成 - DesignAI</title></svelte:head>
<div class="mb-6">
	<h1 class="mt-8 text-3xl font-black text-[#121826]">商品图生成</h1>
	<p class="mt-2 text-sm text-[#65708a]">从描述或参考图生成电商级商品图，让商品更出彩</p>
</div>

<div class="grid gap-5 xl:grid-cols-[1fr_360px]">
	<form onsubmit={submit} class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
		<section>
			<h2 class="flex items-center gap-3 text-lg font-black text-[#121826]">
				<span class="grid size-7 place-items-center rounded-full bg-primary text-sm text-white"
					>1</span
				>选择生成方式
			</h2>
			<div class="mt-5 grid gap-4 md:grid-cols-2">
				<button
					type="button"
					onclick={() => (generationMode = 'prompt')}
					class={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${generationMode === 'prompt' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-[#e1e5f2]'}`}
				>
					<span class="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"
						><Sparkles class="size-6" /></span
					>
					<span
						><strong class="block text-[#121826]">AI 描述生成</strong><small
							class="mt-1 block text-[#65708a]">输入商品描述，AI 自动生成商品图</small
						></span
					>
				</button>
				<button
					type="button"
					onclick={() => (generationMode = 'reference')}
					class={`flex items-center gap-4 rounded-xl border p-5 text-left transition ${generationMode === 'reference' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-[#e1e5f2]'}`}
				>
					<span class="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"
						><ImagePlus class="size-6" /></span
					>
					<span
						><strong class="block text-[#121826]">参考图生成</strong><small
							class="mt-1 block text-[#65708a]">上传参考图，生成相似风格商品图</small
						></span
					>
				</button>
			</div>
		</section>

		<section class="mt-7">
			<h2 class="flex items-center gap-3 text-lg font-black text-[#121826]">
				<span class="grid size-7 place-items-center rounded-full bg-primary text-sm text-white"
					>2</span
				>输入商品描述
			</h2>
			<label class="mt-4 block">
				<textarea
					bind:value={prompt}
					maxlength="300"
					rows="4"
					class="w-full resize-none rounded-xl border border-[#cfd6ea] p-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					placeholder="请输入商品名称、材质、颜色、风格、使用场景等描述"></textarea>
				<span class="mt-1 block text-right text-xs text-[#9aa3b8]">{prompt.length} / 300</span>
			</label>
			<div class="mt-2 flex flex-wrap items-center gap-3 text-sm">
				<span class="text-[#65708a]">智能推荐：</span>
				{#each promptSuggestions as item}
					<button
						type="button"
						onclick={() => (prompt = item)}
						class="rounded-lg border border-[#dde2f2] px-3 py-1.5 text-[#65708a] hover:border-primary hover:text-primary"
						>{item}</button
					>
				{/each}
				<button type="button" class="inline-flex items-center gap-1 text-primary"
					><RefreshCw class="size-4" />换一批</button
				>
			</div>
		</section>

		<section class="mt-7">
			<h2 class="flex items-center gap-3 text-lg font-black text-[#121826]">
				<span class="grid size-7 place-items-center rounded-full bg-primary text-sm text-white"
					>3</span
				>选择风格 <small class="font-medium text-[#65708a]">可多选</small>
			</h2>
			<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
				{#each productStyles as style}
					<button
						type="button"
						onclick={() => toggleStyle(style.id)}
						class={`overflow-hidden rounded-xl border bg-white text-center transition ${styleIds.includes(style.id) ? 'border-primary ring-2 ring-primary/15' : 'border-[#e1e5f2]'}`}
					>
						<img src={style.image} alt="" class="h-28 w-full bg-[#f7f8fc] object-contain" />
						<span class="block px-2 py-3 text-sm font-bold text-[#172033]">{style.name}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="mt-7">
			<h2 class="flex items-center gap-3 text-lg font-black text-[#121826]">
				<span class="grid size-7 place-items-center rounded-full bg-primary text-sm text-white"
					>4</span
				>图片设置
			</h2>
			<div class="mt-4 grid gap-4 md:grid-cols-4">
				<label class="rounded-xl border border-[#e1e5f2] p-3 text-sm font-bold text-[#172033]"
					>图片比例<select
						bind:value={aspectRatio}
						class="mt-2 h-10 w-full rounded-lg border border-[#dfe3f2] bg-white px-3 font-medium"
						><option>1:1</option><option>4:5</option><option>16:9</option></select
					></label
				>
				<label class="rounded-xl border border-[#e1e5f2] p-3 text-sm font-bold text-[#172033]"
					>图片尺寸<select
						bind:value={size}
						class="mt-2 h-10 w-full rounded-lg border border-[#dfe3f2] bg-white px-3 font-medium"
						><option value="1024x1024">1024 x 1024</option><option value="1024x1536"
							>1024 x 1536</option
						><option value="1536x1024">1536 x 1024</option></select
					></label
				>
				<label class="rounded-xl border border-[#e1e5f2] p-3 text-sm font-bold text-[#172033]"
					>生成数量<select
						bind:value={count}
						class="mt-2 h-10 w-full rounded-lg border border-[#dfe3f2] bg-white px-3 font-medium"
						><option value={1}>1 张</option><option value={2}>2 张</option><option value={4}
							>4 张</option
						></select
					></label
				>
				<label class="rounded-xl border border-[#e1e5f2] p-3 text-sm font-bold text-[#172033]"
					>生成引擎<select
						bind:value={provider}
						class="mt-2 h-10 w-full rounded-lg border border-[#dfe3f2] bg-white px-3 font-medium"
						><option value="auto">自动选择</option><option value="openai">OpenAI</option><option
							value="tongyi">通义万相</option
						></select
					></label
				>
			</div>
		</section>

		{#if error}<p class="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
				{error}
			</p>{/if}
		<div class="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<button
				disabled={loading}
				class="h-12 w-full rounded-xl bg-primary px-10 font-black text-white shadow-lg shadow-primary/20 disabled:opacity-60 sm:w-96"
				>{loading ? '正在创建任务...' : '立即生成'}</button
			>
			<span class="text-sm font-bold text-[#65708a]">消耗 {count * 2} 积分</span>
		</div>
	</form>

	<aside class="space-y-4">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">
				上传参考图 <span class="text-sm font-medium text-[#8a94ad]">可选</span>
			</h2>
			<label
				class="mt-4 grid min-h-40 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-primary/35 bg-primary/5 text-center"
			>
				{#if preview}<img
						src={preview}
						alt="上传预览"
						class="max-h-48 w-full object-contain"
					/>{:else}<span class="p-6 text-sm text-[#65708a]"
						><UploadCloud class="mx-auto mb-2 size-8 text-primary" />点击上传或拖拽图片到这里<br
						/><small>支持 JPG、PNG，大小不超过 10MB</small></span
					>{/if}
				<input
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/>
			</label>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">生成建议</h2>
			<ul class="mt-4 space-y-3 text-sm text-[#65708a]">
				<li class="flex gap-2">
					<Info class="mt-0.5 size-4 text-primary" />描述越详细，生成效果越贴近需求
				</li>
				<li class="flex gap-2">
					<Info class="mt-0.5 size-4 text-primary" />建议包含商品材质、颜色、风格等关键信息
				</li>
				<li class="flex gap-2"><Info class="mt-0.5 size-4 text-primary" />参考图生成效果更稳定</li>
			</ul>
		</section>
		{#if activeJob}<JobCard initialJob={activeJob} />{/if}
	</aside>
</div>
