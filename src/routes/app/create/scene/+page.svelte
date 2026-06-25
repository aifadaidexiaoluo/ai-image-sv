<script lang="ts">
	import { sceneCategories, sceneTemplates } from '$lib/app-catalog';
	import JobCard from '$lib/components/app/job-card.svelte';
	import type { GenerationJob } from '$lib/types/jobs';
	import {
		CloudUpload,
		Eye,
		ImagePlus,
		Plus,
		RefreshCw,
		Sparkles,
		UploadCloud,
		X
	} from '@lucide/svelte';

	type SceneCategoryId = (typeof sceneCategories)[number]['id'];
	type ProductPosition =
		| 'top-left'
		| 'top'
		| 'top-right'
		| 'left'
		| 'center'
		| 'right'
		| 'bottom-left'
		| 'bottom'
		| 'bottom-right';

	let category = $state<SceneCategoryId>('all');
	let selectedSceneId = $state('living-room');
	let productPosition = $state<ProductPosition>('center');
	let productScale = $state(60);
	let lightingMatch = $state(true);
	let colorBlend = $state(true);
	let detailEnhance = $state(true);
	let file = $state<File>();
	let preview = $state('');
	let loading = $state(false);
	let error = $state('');
	let activeJob = $state<GenerationJob>();

	const filteredScenes = $derived(
		category === 'all'
			? sceneTemplates
			: sceneTemplates.filter((item) => item.category === category)
	);
	const selectedScene = $derived(
		sceneTemplates.find((item) => item.id === selectedSceneId) ?? sceneTemplates[0]
	);
	const steps = [
		{ title: '选择场景', description: '挑选或上传场景' },
		{ title: '添加商品', description: '上传商品并调整位置' },
		{ title: '调整与生成', description: '调整细节并生成场景图' }
	];
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
	] satisfies ProductPosition[];

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!selected) return;
		if (preview) URL.revokeObjectURL(preview);
		file = selected;
		preview = URL.createObjectURL(selected);
	}

	function clearFile() {
		if (preview) URL.revokeObjectURL(preview);
		file = undefined;
		preview = '';
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

<div class="mx-auto max-w-[1600px] pb-8">
	<div class="mb-7">
		<h1 class="text-[30px] font-black leading-tight text-[#121826]">场景图编辑</h1>
		<p class="mt-2 text-[15px] text-[#65708a]">将商品融入真实场景，打造更具吸引力的营销视觉</p>
	</div>

	<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
		<div class="space-y-5">
			<section
				class="rounded-[14px] border border-[#e2e6f4] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
			>
				<div class="grid grid-cols-[1fr_1fr_1fr] items-center">
					{#each steps as step, index (step.title)}
						<div class="flex items-center gap-4">
							<span
								class={`grid size-8 shrink-0 place-items-center rounded-full text-[15px] font-black ${index === 0 ? 'bg-primary text-white shadow-[0_10px_20px_rgba(91,61,245,0.28)]' : 'bg-[#d8ddeb] text-[#73809a]'}`}
							>
								{index + 1}
							</span>
							<span>
								<strong class="block text-[15px] font-black text-[#172033]">{step.title}</strong>
								<small class="mt-1 block text-[12px] font-semibold text-[#8a94ad]"
									>{step.description}</small
								>
							</span>
							{#if index < steps.length - 1}
								<span class="ml-auto mr-6 h-px min-w-[110px] flex-1 bg-[#e4e8f4]"></span>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<section
				class="rounded-[14px] border border-[#e2e6f4] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
			>
				<div class="flex items-center gap-4">
					<div class="flex flex-wrap gap-3">
						{#each sceneCategories as item (item.id)}
							<button
								type="button"
								onclick={() => (category = item.id)}
								class={`h-9 rounded-[7px] px-4 text-[14px] font-black transition ${category === item.id ? 'bg-primary text-white shadow-[0_10px_20px_rgba(91,61,245,0.22)]' : 'border border-[#dfe4f2] bg-white text-[#5f6b85] hover:border-primary/50 hover:text-primary'}`}
							>
								{item.name}
							</button>
						{/each}
					</div>
					<button
						type="button"
						class="ml-auto inline-flex h-9 items-center gap-2 rounded-[7px] border border-[#dfe4f2] bg-white px-4 text-[14px] font-black text-[#5f6b85]"
					>
						更多
						<RefreshCw class="size-3.5" />
					</button>
				</div>

				<h2 class="mt-8 text-[17px] font-black text-[#121826]">选择场景模板</h2>
				<div class="mt-5 grid grid-cols-4 gap-x-6 gap-y-6">
					{#each filteredScenes as scene (scene.id)}
						<button
							type="button"
							onclick={() => (selectedSceneId = scene.id)}
							class="group text-left"
						>
							<span
								class={`block h-[154px] overflow-hidden rounded-[8px] border bg-[#f7f8fc] transition ${selectedSceneId === scene.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent group-hover:border-primary/40'}`}
							>
								<img
									src={scene.image}
									alt={scene.name}
									class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
								/>
							</span>
							<span class="mt-3 block text-[14px] font-semibold text-[#26324a]">{scene.name}</span>
						</button>
					{/each}

					<label
						class="grid h-38.5 cursor-pointer place-items-center rounded-[8px] border border-dashed border-primary/35 bg-[#fbfaff] text-center text-primary transition hover:border-primary"
					>
						<span class="px-4 text-[14px] font-black">
							<UploadCloud class="mx-auto mb-3 size-8" />
							上传自定义场景
							<small class="mt-2 block text-[12px] font-medium leading-5 text-[#8792aa]"
								>支持 JPG、PNG 格式，大小不超过 20MB</small
							>
						</span>
						<input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" />
					</label>
				</div>

				{#if error}
					<p class="mt-5 rounded-[9px] bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600">
						{error}
					</p>
				{/if}

				<div
					class="mt-6 grid h-[72px] grid-cols-[1fr_440px_280px] items-center gap-5 rounded-[10px] border border-[#e7ebf6] bg-[#fbfcff] px-5"
				>
					<span class="inline-flex items-center gap-2 text-[14px] font-bold text-[#65708a]">
						<Sparkles class="size-4 text-amber-500" />消耗 2 积分
					</span>
					<button
						type="button"
						onclick={submit}
						disabled={loading}
						class="h-12 rounded-[7px] bg-primary text-[16px] font-black text-white shadow-[0_18px_32px_rgba(91,61,245,0.24)] transition hover:bg-[#4d30e7] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loading ? '正在创建任务...' : '立即生成场景图'}
					</button>
					<button
						type="button"
						class="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-[#dfe4f2] bg-white text-[15px] font-black text-[#65708a] transition hover:border-primary/60 hover:text-primary"
					>
						<Eye class="size-4" />预览效果
					</button>
				</div>
			</section>

			{#if activeJob}
				<JobCard initialJob={activeJob} />
			{/if}
		</div>

		<aside
			class="space-y-0 rounded-[14px] border border-[#e2e6f4] bg-white px-5 py-6 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
		>
			<section class="border-b border-[#e5e9f4] pb-6">
				<div class="flex items-center justify-between">
					<h2 class="text-[17px] font-black text-[#121826]">已选场景</h2>
					<button
						type="button"
						class="inline-flex items-center gap-1.5 text-[13px] font-black text-primary"
					>
						更换场景
						<RefreshCw class="size-3.5" />
					</button>
				</div>
				<div class="mt-4 h-[166px] overflow-hidden rounded-[8px] bg-[#f7f8fc]">
					<img src={selectedScene.image} alt={selectedScene.name} class="size-full object-cover" />
				</div>
			</section>

			<section class="border-b border-[#e5e9f4] py-6">
				<h2 class="text-[17px] font-black text-[#121826]">商品设置</h2>
				<label
					class="relative mt-4 flex h-[122px] cursor-pointer items-center gap-5 rounded-[10px] border border-dashed border-primary/40 bg-[#fbfaff] p-3 transition hover:border-primary"
				>
					{#if preview}
						<img
							src={preview}
							alt="商品预览"
							class="size-[94px] rounded-[8px] bg-white object-contain ring-1 ring-[#eceefa]"
						/>
						<button
							type="button"
							onclick={(event) => {
								event.preventDefault();
								clearFile();
							}}
							class="absolute left-[96px] top-3 grid size-5 place-items-center rounded-full bg-[#eff2fb] text-[#8b95aa] transition hover:bg-primary hover:text-white"
							aria-label="移除商品图"
						>
							<X class="size-3.5" />
						</button>
					{:else}
						<span
							class="grid size-[94px] place-items-center rounded-[8px] bg-white text-primary ring-1 ring-[#eceefa]"
						>
							<ImagePlus class="size-8" />
						</span>
					{/if}
					<span class="min-w-0 text-[14px] font-semibold text-[#65708a]">
						<span class="block truncate text-[#5f6b85]"
							>{file ? `已上传：${file.name}` : '上传商品图'}</span
						>
						{#if !file}
							<small class="mt-2 block text-[12px] font-medium text-[#8c96ac]"
								>点击选择商品图片</small
							>
						{/if}
					</span>
					<input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectFile}
					/>
				</label>
				<label
					class="mt-4 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-primary/55 bg-white text-[14px] font-black text-primary transition hover:bg-primary/5"
				>
					<Plus class="size-4" />
					上传商品图
					<input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectFile}
					/>
				</label>
				<p class="mt-3 text-center text-[12px] font-medium text-[#8c96ac]">
					支持 JPG、PNG 格式，建议商品主体清晰、背景简洁
				</p>
			</section>

			<section class="border-b border-[#e5e9f4] py-6">
				<h2 class="text-[17px] font-black text-[#121826]">商品位置与大小</h2>
				<div class="mt-5 grid grid-cols-[116px_1fr] gap-8">
					<div>
						<p class="mb-3 text-[14px] font-bold text-[#65708a]">位置</p>
						<div class="grid w-[80px] grid-cols-3 gap-1">
							{#each positions as position (position)}
								<button
									type="button"
									aria-label={position}
									onclick={() => (productPosition = position)}
									class={`size-[24px] rounded-[5px] border transition ${productPosition === position ? 'border-primary bg-primary shadow-[0_8px_14px_rgba(91,61,245,0.22)]' : 'border-[#dce2f1] bg-white hover:border-primary/50'}`}
								></button>
							{/each}
						</div>
					</div>
					<label class="block">
						<span class="flex items-center justify-between text-[14px] font-bold text-[#65708a]">
							大小 <span>{productScale}%</span>
						</span>
						<input
							value={productScale}
							oninput={(event) => (productScale = Number(event.currentTarget.value))}
							class="mt-5 w-full accent-primary"
							type="range"
							min="30"
							max="100"
						/>
					</label>
				</div>
			</section>

			<section class="pt-6">
				<h2 class="text-[17px] font-black text-[#121826]">高级设置</h2>
				<div class="mt-5 space-y-5">
					<label class="flex items-center justify-between gap-4">
						<span class="flex items-start gap-3">
							<CloudUpload class="mt-0.5 size-5 text-[#121826]" />
							<span>
								<strong class="block text-[14px] font-black text-[#26324a]">光影匹配</strong>
								<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
									>智能匹配场景光源与商品光影</small
								>
							</span>
						</span>
						<input
							type="checkbox"
							class="size-5 accent-primary"
							checked={lightingMatch}
							onchange={(event) => (lightingMatch = event.currentTarget.checked)}
						/>
					</label>
					<label class="flex items-center justify-between gap-4">
						<span class="flex items-start gap-3">
							<Sparkles class="mt-0.5 size-5 text-[#121826]" />
							<span>
								<strong class="block text-[14px] font-black text-[#26324a]">色彩融合</strong>
								<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
									>智能调整色彩使商品更自然</small
								>
							</span>
						</span>
						<input
							type="checkbox"
							class="size-5 accent-primary"
							checked={colorBlend}
							onchange={(event) => (colorBlend = event.currentTarget.checked)}
						/>
					</label>
					<label class="flex items-center justify-between gap-4">
						<span class="flex items-start gap-3">
							<ImagePlus class="mt-0.5 size-5 text-[#121826]" />
							<span>
								<strong class="block text-[14px] font-black text-[#26324a]">细节增强</strong>
								<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
									>增强商品与场景融合的真实感</small
								>
							</span>
						</span>
						<input
							type="checkbox"
							class="size-5 accent-primary"
							checked={detailEnhance}
							onchange={(event) => (detailEnhance = event.currentTarget.checked)}
						/>
					</label>
				</div>
			</section>
		</aside>
	</div>
</div>
