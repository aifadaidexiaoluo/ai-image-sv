<script lang="ts">
	import JobCard from '$lib/components/app/job-card.svelte';
	import type { GenerationJob } from '$lib/types/jobs';
	import { Crop, Download, Expand, Move, RefreshCw, RotateCcw, UploadCloud } from '@lucide/svelte';

	let file = $state<File>();
	let preview = $state('');
	let originalVisible = $state(false);
	let background = $state('transparent');
	let zoom = $state(100);
	let keepShadow = $state(true);
	let smoothEdge = $state(true);
	let hdMode = $state(false);
	let loading = $state(false);
	let error = $state('');
	let activeJob = $state<GenerationJob>();

	const backgrounds = [
		{ id: 'transparent', name: '无', class: 'checkerboard' },
		{ id: 'white', name: '白色', class: 'bg-white' },
		{ id: 'gray', name: '浅灰', class: 'bg-[#e5e5e5]' },
		{ id: 'pink', name: '粉色', class: 'bg-pink-100' },
		{ id: 'scene', name: '客厅场景', class: 'bg-gradient-to-br from-amber-50 to-white' }
	];
	const selectedBackground = $derived(
		backgrounds.find((item) => item.id === background) ?? backgrounds[0]
	);

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!selected) return;
		file = selected;
		preview = URL.createObjectURL(selected);
		activeJob = undefined;
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

	async function submit() {
		error = '';
		if (!file) {
			error = '请先上传一张需要抠图的图片';
			return;
		}
		loading = true;
		try {
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					tool: 'remove-background',
					provider: 'auto',
					count: 1,
					aspectRatio: '1:1',
					sourceAssetId,
					parameters: { background, keepShadow, smoothEdge, hdMode }
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

<svelte:head><title>智能抠图 - DesignAI</title></svelte:head>
<div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">智能抠图</h1>
		<p class="mt-2 text-sm text-[#65708a]">
			一键智能识别主体，精准去除背景，轻松获取高质量透明素材
		</p>
	</div>
	<div class="flex gap-3">
		<label
			class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#dde2f2] bg-white px-4 text-sm font-bold text-primary shadow-sm"
			><RefreshCw class="size-4" />重新上传<input
				class="sr-only"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={selectFile}
			/></label
		>
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			href={preview || undefined}
			download
			class="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20"
			><Download class="size-4" />下载</a
		>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
</div>

<div class="grid gap-5 xl:grid-cols-[1fr_360px]">
	<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
		<div class="mb-4 flex items-center justify-between">
			<label class="flex items-center gap-2 text-sm font-bold text-[#65708a]"
				>原图<input
					bind:checked={originalVisible}
					type="checkbox"
					class="size-5 accent-primary"
				/></label
			>
			<div
				class="flex items-center gap-2 rounded-xl border border-[#dde2f2] bg-white px-3 py-2 text-sm font-bold text-[#65708a]"
			>
				<button onclick={() => (zoom = Math.max(50, zoom - 10))}>-</button><span>{zoom}%</span
				><button onclick={() => (zoom = Math.min(160, zoom + 10))}>+</button>
				<button class="ml-2 border-l border-[#dde2f2] pl-2"><Expand class="size-4" /></button>
			</div>
		</div>
		<div
			class={`grid min-h-[560px] place-items-center overflow-hidden rounded-xl ${selectedBackground.class}`}
		>
			{#if preview}
				<img
					src={preview}
					alt="抠图预览"
					class="max-h-[520px] max-w-[82%] object-contain transition"
					style:transform={`scale(${zoom / 100})`}
				/>
			{:else}
				<label
					class="grid min-h-80 w-full max-w-lg cursor-pointer place-items-center rounded-2xl border border-dashed border-primary/35 bg-white/80 text-center"
				>
					<span class="p-8 text-sm text-[#65708a]"
						><UploadCloud class="mx-auto mb-3 size-10 text-primary" />点击上传需要抠图的商品图片<br
						/><small>支持 JPG、PNG、WebP，大小不超过 10MB</small></span
					>
					<input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectFile}
					/>
				</label>
			{/if}
		</div>
		<div
			class="mx-auto mt-4 flex w-max overflow-hidden rounded-xl border border-[#dde2f2] bg-white shadow-sm"
		>
			{#each [{ label: '撤销', icon: RotateCcw }, { label: '恢复', icon: RefreshCw }, { label: '移动', icon: Move }, { label: '裁剪', icon: Crop }] as tool (tool.label)}
				<button
					class="grid min-w-20 place-items-center gap-1 border-r border-[#eef1f7] px-4 py-3 text-xs font-bold text-[#65708a] last:border-r-0"
					><tool.icon class="size-5" />{tool.label}</button
				>
			{/each}
		</div>
		{#if error}<p class="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
				{error}
			</p>{/if}
		<button
			onclick={submit}
			disabled={loading}
			class="mt-5 h-12 w-full rounded-xl bg-primary font-black text-white shadow-lg shadow-primary/20 disabled:opacity-60"
			>{loading ? '正在创建任务...' : '开始抠图 · 1 积分'}</button
		>
	</section>

	<aside class="space-y-5">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">背景</h2>
			<div class="mt-4 grid grid-cols-3 gap-3">
				<button
					onclick={() => (background = 'transparent')}
					class={`h-10 rounded-lg border text-sm font-bold ${background === 'transparent' ? 'border-primary text-primary' : 'border-[#dde2f2] text-[#65708a]'}`}
					>透明背景</button
				>
				<button
					onclick={() => (background = 'white')}
					class={`h-10 rounded-lg border text-sm font-bold ${background === 'white' ? 'border-primary text-primary' : 'border-[#dde2f2] text-[#65708a]'}`}
					>纯色背景</button
				>
				<button
					onclick={() => (background = 'scene')}
					class={`h-10 rounded-lg border text-sm font-bold ${background === 'scene' ? 'border-primary text-primary' : 'border-[#dde2f2] text-[#65708a]'}`}
					>自定义背景</button
				>
			</div>
			<div class="mt-5 flex gap-3">
				{#each backgrounds.slice(0, 4) as item (item.id)}
					<button
						aria-label={item.name}
						onclick={() => (background = item.id)}
						class={`size-12 rounded-lg border ${item.class} ${background === item.id ? 'border-primary ring-2 ring-primary/15' : 'border-[#dde2f2]'}`}
					></button>
				{/each}
				<button
					class="grid size-12 place-items-center rounded-lg border border-[#dde2f2] text-primary"
					>+</button
				>
			</div>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">场景预览</h2>
			<div class="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-bold text-[#65708a]">
				{#each backgrounds as item (item.id)}
					<button onclick={() => (background = item.id)}>
						<div
							class={`grid h-20 place-items-center rounded-lg border ${item.class} ${background === item.id ? 'border-primary' : 'border-[#dde2f2]'}`}
						>
							{#if preview}<img src={preview} alt="" class="max-h-16 object-contain" />{/if}
						</div>
						<span class="mt-2 block">{item.name}</span>
					</button>
				{/each}
			</div>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">抠图优化</h2>
			{#each [{ label: '保留阴影', value: keepShadow }, { label: '边缘平滑', value: smoothEdge }, { label: '高清模式', value: hdMode }] as option, index (option.label)}
				<label class="mt-4 flex items-center justify-between text-sm font-bold text-[#172033]">
					{option.label}{#if index === 2}<span
							class="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">VIP</span
						>{/if}
					<input
						type="checkbox"
						class="size-5 accent-primary"
						checked={option.value}
						onchange={(event) => {
							if (index === 0) keepShadow = event.currentTarget.checked;
							if (index === 1) smoothEdge = event.currentTarget.checked;
							if (index === 2) hdMode = event.currentTarget.checked;
						}}
					/>
				</label>
			{/each}
		</section>
		{#if activeJob}<JobCard initialJob={activeJob} />{/if}
	</aside>
</div>

<style>
	.checkerboard {
		background-color: #fff;
		background-image:
			linear-gradient(45deg, #eef1f7 25%, transparent 25%),
			linear-gradient(-45deg, #eef1f7 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #eef1f7 75%),
			linear-gradient(-45deg, transparent 75%, #eef1f7 75%);
		background-position:
			0 0,
			0 10px,
			10px -10px,
			-10px 0;
		background-size: 20px 20px;
	}
</style>
