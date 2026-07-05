<script lang="ts">
	import { page } from '$app/state';
	import { refreshAccountData } from '$lib/account-refresh';
	import { sceneCategories, sceneTemplates } from '$lib/app-catalog';
	import ResultEmpty from '$lib/components/app/create-product/result-empty.svelte';
	import type { ProductPosition } from '$lib/components/app/create-scene/position-grid.svelte';
	import SceneSidePanel from '$lib/components/app/create-scene/scene-side-panel.svelte';
	import SceneStepper from '$lib/components/app/create-scene/scene-stepper.svelte';
	import SceneTemplatePicker, {
		type SceneCategoryId,
		type UserSceneTemplate
	} from '$lib/components/app/create-scene/scene-template-picker.svelte';
	import JobCard from '$lib/components/app/job-card.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { validateUploadImageFile } from '$lib/image-upload';
	import type { GenerationJob } from '$lib/types/jobs';
	import { CircleAlert, Coins, WandSparkles } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { onDestroy, onMount } from 'svelte';
	import type { AssetItem } from '$lib/components/app/assets/types';
	import type { PageData } from './$types';

	type SceneFormValues = {
		selectedSceneId: string;
		productPosition: ProductPosition;
		productScale: number;
		lightingMatch: boolean;
		colorBlend: boolean;
		detailEnhance: boolean;
	};
	type SceneTemplateUploadResponse = {
		template?: UserSceneTemplate;
		upload?: {
			method?: string;
			url?: string;
			headers?: Record<string, string>;
		};
		message?: string;
	};
	type SceneTemplateGenerateResponse = {
		template?: UserSceneTemplate;
		message?: string;
	};

	let { data }: { data: PageData } = $props();

	const form = createForm(() => ({
		defaultValues: {
			selectedSceneId: 'living-room',
			productPosition: 'center',
			productScale: 60,
			lightingMatch: true,
			colorBlend: true,
			detailEnhance: true
		} as SceneFormValues,
		onSubmit: async ({ value }) => {
			await submit(value);
		}
	}));

	let category = $state<SceneCategoryId>('all');
	let file = $state<File>();
	let preview = $state('');
	let selectedAsset = $state<AssetItem>();
	let error = $state('');
	let activeJobs = $state<GenerationJob[]>([]);
	let uploadedSceneTemplates = $state<UserSceneTemplate[]>([]);
	let prefillNotice = $state('');
	const userSceneTemplates = $derived([...uploadedSceneTemplates, ...data.userSceneTemplates]);
	const productPositions = new Set<ProductPosition>([
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	]);
	const sceneCategoryIds = new Set<SceneCategoryId>(sceneCategories.map((item) => item.id));

	onDestroy(() => {
		revokePreview();
	});

	onMount(() => {
		void prefillFromHistory();
	});

	function revokePreview() {
		if (preview) URL.revokeObjectURL(preview);
	}

	function selectedScene(sceneId: string) {
		if (sceneId.startsWith('user:')) {
			const template = userSceneTemplates.find((item) => item.id === sceneId.slice(5));
			if (template) {
				return {
					id: template.id,
					key: sceneId,
					name: template.title,
					category: template.category,
					image: template.image,
					owner: 'user' as const,
					assetId: template.assetId
				};
			}
		}
		const scene = sceneTemplates.find((item) => item.id === sceneId) ?? sceneTemplates[0];
		return {
			id: scene.id,
			key: scene.id,
			name: scene.name,
			category: scene.category,
			image: scene.image,
			owner: 'public' as const
		};
	}

	function scenesForCategory(nextCategory: SceneCategoryId) {
		const publicScenes = sceneTemplates.map((scene) => ({
			id: scene.id,
			key: scene.id,
			name: scene.name,
			category: scene.category,
			image: scene.image,
			owner: 'public' as const
		}));
		const privateScenes = userSceneTemplates.map((scene) => ({
			id: scene.id,
			key: `user:${scene.id}`,
			name: scene.title,
			category: scene.category,
			image: scene.image,
			owner: 'user' as const,
			assetId: scene.assetId
		}));
		const allScenes = [...publicScenes, ...privateScenes];
		return nextCategory === 'all'
			? allScenes
			: allScenes.filter((item) => item.category === nextCategory);
	}

	function validateFile(selected: File) {
		return validateUploadImageFile(selected).message ?? '';
	}

	function setSourceFile(selected: File) {
		const message = validateFile(selected);
		if (message) {
			error = message;
			return;
		}
		revokePreview();
		file = selected;
		preview = URL.createObjectURL(selected);
		selectedAsset = undefined;
		error = '';
	}

	function selectSourceAsset(asset: AssetItem) {
		revokePreview();
		file = undefined;
		preview = '';
		selectedAsset = asset;
		error = '';
	}

	function clearFile() {
		revokePreview();
		file = undefined;
		preview = '';
		selectedAsset = undefined;
	}

	function selectScene(sceneId: string) {
		form.setFieldValue('selectedSceneId', sceneId);
		error = '';
	}

	function selectCategory(nextCategory: SceneCategoryId) {
		category = nextCategory;
		const firstScene = scenesForCategory(nextCategory)[0];
		if (firstScene) form.setFieldValue('selectedSceneId', firstScene.key);
	}

	function setPosition(position: ProductPosition) {
		form.setFieldValue('productPosition', position);
	}

	function setScale(scale: number) {
		form.setFieldValue('productScale', scale);
	}

	function setToggle(key: 'lightingMatch' | 'colorBlend' | 'detailEnhance', checked: boolean) {
		form.setFieldValue(key, checked);
	}

	function isSceneCategoryId(value: unknown): value is SceneCategoryId {
		return typeof value === 'string' && sceneCategoryIds.has(value as SceneCategoryId);
	}

	async function prefillFromHistory() {
		const jobId = page.url.searchParams.get('fromJob');
		if (!jobId) return;

		const response = await fetch(`/api/jobs/${jobId}`);
		if (!response.ok) return;
		const payload = (await response.json()) as { job?: GenerationJob };
		const job = payload.job;
		if (!job || job.tool !== 'scene') return;

		const parameters = job.parameters ?? {};
		if (isSceneCategoryId(parameters.sceneCategory)) {
			category = parameters.sceneCategory;
		}
		if (typeof parameters.sceneId === 'string') {
			form.setFieldValue('selectedSceneId', parameters.sceneId);
		}
		if (
			typeof parameters.productPosition === 'string' &&
			productPositions.has(parameters.productPosition as ProductPosition)
		) {
			form.setFieldValue('productPosition', parameters.productPosition as ProductPosition);
		}
		if (typeof parameters.productScale === 'number') {
			form.setFieldValue('productScale', Math.max(30, Math.min(100, parameters.productScale)));
		}
		for (const key of ['lightingMatch', 'colorBlend', 'detailEnhance'] as const) {
			if (typeof parameters[key] === 'boolean') form.setFieldValue(key, parameters[key]);
		}
		prefillNotice = '已加载历史任务参数；生成场景图前请重新上传商品图。';
	}

	function validateSubmission() {
		if (!file && !selectedAsset) return '请先上传或选择商品图';
		return '';
	}

	async function uploadSource() {
		if (selectedAsset) return selectedAsset.id;
		if (!file) return undefined;
		const fileValidation = validateUploadImageFile(file);
		if (!fileValidation.contentType) throw new Error(fileValidation.message);
		const presign = await fetch('/api/uploads/presign', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				fileName: file.name,
				contentType: fileValidation.contentType,
				size: file.size
			})
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

	async function createSceneTemplate(input: { title: string; category: string; file: File }) {
		const message = validateFile(input.file);
		if (message) throw new Error(message);
		const fileValidation = validateUploadImageFile(input.file);
		if (!fileValidation.contentType) throw new Error(fileValidation.message);
		const response = await fetch('/api/scene-templates', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				title: input.title,
				category: input.category,
				fileName: input.file.name,
				contentType: fileValidation.contentType,
				size: input.file.size
			})
		});
		const payload = (await response.json()) as SceneTemplateUploadResponse;
		if (!response.ok || !payload.template || !payload.upload?.url) {
			throw new Error(payload.message ?? '模板保存失败');
		}
		const uploaded = await fetch(payload.upload.url, {
			method: payload.upload.method ?? 'PUT',
			headers: payload.upload.headers,
			body: input.file
		});
		if (!uploaded.ok) throw new Error('模板图片上传失败，请检查存储配置');
		uploadedSceneTemplates = [payload.template, ...uploadedSceneTemplates];
		category = payload.template.category as SceneCategoryId;
		form.setFieldValue('selectedSceneId', `user:${payload.template.id}`);
		error = '';
		await refreshAccountData();
	}

	async function generateSceneTemplate(input: { title: string; category: string; prompt: string }) {
		const response = await fetch('/api/scene-templates/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(input)
		});
		const payload = (await response.json()) as SceneTemplateGenerateResponse;
		if (!response.ok || !payload.template) {
			throw new Error(payload.message ?? '模板生成失败');
		}
		uploadedSceneTemplates = [payload.template, ...uploadedSceneTemplates];
		category = payload.template.category as SceneCategoryId;
		form.setFieldValue('selectedSceneId', `user:${payload.template.id}`);
		error = '';
	}

	async function submit(value: SceneFormValues) {
		error = '';
		const validationError = validateSubmission();
		if (validationError) {
			error = validationError;
			return;
		}

		try {
			const scene = selectedScene(value.selectedSceneId);
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					tool: 'scene',
					provider: 'auto',
					prompt: `${scene.name}，商品自然融入场景`,
					count: 1,
					aspectRatio: '16:9',
					sourceAssetId,
					parameters: {
						sceneId: value.selectedSceneId,
						sceneCategory: scene.category,
						sceneTemplateOwner: scene.owner,
						sceneTemplateAssetId: scene.assetId,
						customSceneTitle: scene.owner === 'user' ? scene.name : undefined,
						productPosition: value.productPosition,
						productScale: value.productScale,
						lightingMatch: value.lightingMatch,
						colorBlend: value.colorBlend,
						detailEnhance: value.detailEnhance
					}
				})
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.message);
			activeJobs = [{ ...payload.job, outputs: [] }, ...activeJobs];
			await refreshAccountData();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '创建任务失败';
		}
	}
</script>

<svelte:head><title>场景图编辑 - DesignAI</title></svelte:head>

<div class="mx-auto max-w-[1600px] pb-8">
	<div class="mb-7">
		<h1 class="text-[30px] font-black leading-tight text-[#121826]">场景图编辑</h1>
		<p class="mt-2 text-[15px] text-[#65708a]">将商品融入真实场景，打造更具吸引力的营销视觉</p>
	</div>

	<form
		onsubmit={(event) => {
			event.preventDefault();
			event.stopPropagation();
			void form.handleSubmit();
		}}
		class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]"
	>
		<div class="space-y-5">
			<SceneStepper />

			<form.Subscribe selector={(state) => state.values.selectedSceneId}>
				{#snippet children(selectedSceneId)}
					<SceneTemplatePicker
						{category}
						{selectedSceneId}
						userTemplates={userSceneTemplates}
						onCategoryChange={selectCategory}
						onSceneSelect={selectScene}
						onTemplateCreate={createSceneTemplate}
						onTemplateGenerate={generateSceneTemplate}
					/>
				{/snippet}
			</form.Subscribe>

			<Card.Root
				class="rounded-[18px] border border-[#e2e6f4] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
			>
				<Card.Content class="px-6 py-5">
					{#if error}
						<Alert variant="destructive" class="mb-5">
							<CircleAlert class="size-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					{/if}

					{#if prefillNotice}
						<Alert class="mb-5 border-primary/20 bg-primary/5 text-[#4f3de0]">
							<AlertDescription>{prefillNotice}</AlertDescription>
						</Alert>
					{/if}

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{#snippet children(isSubmitting)}
							<div class="grid items-center gap-4 md:grid-cols-[1fr_360px]">
								<span class="inline-flex items-center gap-2 text-[14px] font-bold text-[#65708a]">
									<Coins class="size-4 text-amber-500" />消耗 3 积分
								</span>
								<Button
									type="submit"
									disabled={isSubmitting}
									class="h-12 rounded-[8px] text-[16px] font-black text-white shadow-[0_18px_32px_rgba(91,61,245,0.24)] hover:bg-[#4d30e7]"
								>
									<WandSparkles class="size-4" />
									{isSubmitting ? '正在创建任务...' : '立即生成场景图'}
								</Button>
							</div>
						{/snippet}
					</form.Subscribe>
				</Card.Content>
			</Card.Root>
		</div>

		<form.Subscribe selector={(state) => state.values}>
			{#snippet children(values)}
				<div class="space-y-5">
					<SceneSidePanel
						{values}
						selectedScene={selectedScene(values.selectedSceneId)}
						{file}
						preview={selectedAsset?.url ?? preview}
						sourceName={selectedAsset?.displayName}
						selectedAssetId={selectedAsset?.id}
						onFileSelected={setSourceFile}
						onAssetSelected={selectSourceAsset}
						onClearFile={clearFile}
						onPositionChange={setPosition}
						onScaleChange={setScale}
						onToggle={setToggle}
					/>

					{#if activeJobs.length}
						<div class="space-y-4">
							{#each activeJobs as job (job.id)}
								<JobCard initialJob={job} />
							{/each}
						</div>
					{:else}
						<ResultEmpty />
					{/if}
				</div>
			{/snippet}
		</form.Subscribe>
	</form>
</div>
