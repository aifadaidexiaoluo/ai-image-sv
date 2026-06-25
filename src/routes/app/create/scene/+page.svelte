<script lang="ts">
	import { Eye, ImagePlus, Plus, UploadCloud } from '@lucide/svelte';
	import JobCard from '$lib/components/app/job-card.svelte';
	import { sceneCategories, sceneTemplates } from '$lib/app-catalog';

	let category = $state('all');
	let selectedSceneId = $state('living-room');
	let productPosition = $state('center');
	let productScale = $state(60);
	let lightingMatch = $state(true);
	let colorBlend = $state(true);
	let detailEnhance = $state(true);
	let file = $state<File>();
	let preview = $state('');
	let loading = $state(false);
	let error = $state('');
	let activeJob = $state<any>();

	const filteredScenes = $derived(
		category === 'all'
			? sceneTemplates
			: sceneTemplates.filter((item) => item.category === category)
	);
	const selectedScene = $derived(
		sceneTemplates.find((item) => item.id === selectedSceneId) ?? sceneTemplates[0]
	);
	const positions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	];

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
		if (!uploaded.ok) throw new Error('图片上传失败，请检查存储配置');
		return descriptor.assetId as string;
	}

	async function submit() {
		error = '';
		if (!file) {
			error = '请先上传商品图';
			return;
		}
		loading = true;
		try {
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					tool: 'scene',
					provider: 'auto',
					prompt: `${selectedScene.name}，商品自然融入场景`,
					count: 1,
					aspectRatio: '16:9',
					sourceAssetId,
					parameters: {
						sceneId: selectedSceneId,
						sceneCategory: selectedScene.category,
						productPosition,
						productScale,
						lightingMatch,
						colorBlend,
						detailEnhance
					}
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

<svelte:head><title>场景图编辑 - DesignAI</title></svelte:head>
<div class="mb-6">
	<p class="text-sm font-medium text-[#65708a]">
		工作台 / <span class="text-[#121826]">场景图</span>
	</p>
	<h1 class="mt-8 text-3xl font-black text-[#121826]">场景图编辑</h1>
	<p class="mt-2 text-sm text-[#65708a]">将商品融入真实场景，打造更具吸引力的营销视觉</p>
</div>

<div class="grid gap-5 xl:grid-cols-[1fr_360px]">
	<div class="space-y-5">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<div class="grid gap-4 md:grid-cols-3">
				{#each ['选择场景', '添加商品', '调整与生成'] as step, index}
					<div class="flex items-center gap-3">
						<span
							class={`grid size-8 place-items-center rounded-full text-sm font-black ${index === 0 ? 'bg-primary text-white' : 'bg-[#e5e9f3] text-[#65708a]'}`}
							>{index + 1}</span
						>
						<div>
							<p class="font-black text-[#121826]">{step}</p>
							<p class="text-xs text-[#8a94ad]">
								{index === 0
									? '挑选或上传场景'
									: index === 1
										? '上传商品并调整位置'
										: '调整细节并生成'}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<div class="flex flex-wrap gap-3">
				{#each sceneCategories as item}
					<button
						onclick={() => (category = item.id)}
						class={`h-10 rounded-lg px-4 text-sm font-bold ${category === item.id ? 'bg-primary text-white' : 'border border-[#dde2f2] text-[#65708a]'}`}
						>{item.name}</button
					>
				{/each}
			</div>
			<h2 class="mt-8 font-black text-[#121826]">选择场景模板</h2>
			<div class="mt-5 grid gap-5 md:grid-cols-3 xl:grid-cols-4">
				{#each filteredScenes as scene}
					<button
						onclick={() => (selectedSceneId = scene.id)}
						class={`overflow-hidden rounded-xl border bg-white text-left transition ${selectedSceneId === scene.id ? 'border-primary ring-2 ring-primary/15' : 'border-[#e1e5f2]'}`}
					>
						<div class={`grid h-32 place-items-center bg-gradient-to-br ${scene.tone}`}>
							<img src={scene.image} alt="" class="h-28 w-full object-contain" />
						</div>
						<p class="px-3 py-3 text-sm font-black text-[#172033]">{scene.name}</p>
					</button>
				{/each}
				<label
					class="grid min-h-44 cursor-pointer place-items-center rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center text-primary"
				>
					<span
						><UploadCloud class="mx-auto mb-2 size-8" />上传自定义场景<br /><small
							class="text-[#65708a]">支持 JPG、PNG</small
						></span
					>
					<input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" />
				</label>
			</div>
			{#if error}<p class="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
					{error}
				</p>{/if}
			<div class="mt-6 grid gap-3 md:grid-cols-[1fr_280px]">
				<button
					onclick={submit}
					disabled={loading}
					class="h-12 rounded-xl bg-primary font-black text-white shadow-lg shadow-primary/20 disabled:opacity-60"
					>{loading ? '正在创建任务...' : '立即生成场景图'}</button
				>
				<button
					class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dde2f2] font-bold text-[#65708a]"
					><Eye class="size-4" />预览效果</button
				>
			</div>
		</section>
		{#if activeJob}<JobCard initialJob={activeJob} />{/if}
	</div>

	<aside class="space-y-5">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<h2 class="font-black text-[#121826]">已选场景</h2>
				<button class="text-sm font-bold text-primary">更换场景</button>
			</div>
			<div
				class={`mt-4 grid h-36 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${selectedScene.tone}`}
			>
				<img src={selectedScene.image} alt="" class="h-32 w-full object-contain" />
			</div>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">商品设置</h2>
			<label
				class="mt-4 flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-primary/35 bg-primary/5 p-3"
			>
				{#if preview}<img
						src={preview}
						alt="商品预览"
						class="size-24 rounded-lg object-contain"
					/>{:else}<span class="grid size-20 place-items-center rounded-lg bg-white text-primary"
						><ImagePlus class="size-8" /></span
					>{/if}
				<span class="text-sm text-[#65708a]">{file ? `已上传：${file.name}` : '上传商品图'}</span>
				<input
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/>
			</label>
			<label
				class="mt-4 block rounded-xl border border-[#dde2f2] py-3 text-center text-sm font-bold text-primary"
				><Plus class="mr-1 inline size-4" />上传商品图<input
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/></label
			>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">商品位置与大小</h2>
			<div class="mt-4 grid w-24 grid-cols-3 gap-1">
				{#each positions as position}
					<button
						aria-label={position}
						onclick={() => (productPosition = position)}
						class={`size-7 rounded-md border ${productPosition === position ? 'border-primary bg-primary' : 'border-[#dde2f2] bg-white'}`}
					></button>
				{/each}
			</div>
			<label class="mt-5 block text-sm font-bold text-[#65708a]"
				>大小 <span class="float-right">{productScale}%</span><input
					bind:value={productScale}
					class="mt-3 w-full accent-primary"
					type="range"
					min="30"
					max="100"
				/></label
			>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-5 shadow-sm">
			<h2 class="font-black text-[#121826]">高级设置</h2>
			{#each [{ label: '光影匹配', value: lightingMatch }, { label: '色彩融合', value: colorBlend }, { label: '细节增强', value: detailEnhance }] as option, index}
				<label class="mt-4 flex items-center justify-between text-sm font-bold text-[#172033]">
					{option.label}
					<input
						type="checkbox"
						class="size-5 accent-primary"
						checked={option.value}
						onchange={(event) => {
							if (index === 0) lightingMatch = event.currentTarget.checked;
							if (index === 1) colorBlend = event.currentTarget.checked;
							if (index === 2) detailEnhance = event.currentTarget.checked;
						}}
					/>
				</label>
			{/each}
		</section>
	</aside>
</div>
