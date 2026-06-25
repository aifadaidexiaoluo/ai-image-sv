<script lang="ts">
	import { sceneTemplates } from '$lib/app-catalog';
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
	import type { GenerationJob } from '$lib/types/jobs';
	import { CircleAlert, Coins, WandSparkles } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { onDestroy } from 'svelte';
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

	let { data }: { data: PageData } = $props();

	const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
	const maxFileBytes = 10 * 1024 * 1024;

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
	let error = $state('');
	let activeJob = $state<GenerationJob>();
	let uploadedSceneTemplates = $state<UserSceneTemplate[]>([]);
	const userSceneTemplates = $derived([...uploadedSceneTemplates, ...data.userSceneTemplates]);

	onDestroy(() => {
		revokePreview();
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
		if (!allowedTypes.has(selected.type)) return '仅支持 JPG、PNG 和 WebP 图片';
		if (selected.size <= 0 || selected.size > maxFileBytes) return '图片大小不能超过 10 MB';
		return '';
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
		error = '';
	}

	function clearFile() {
		revokePreview();
		file = undefined;
		preview = '';
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

	function validateSubmission() {
		if (!file) return '请先上传商品图';
		return '';
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

	async function createSceneTemplate(input: { title: string; category: string; file: File }) {
		const message = validateFile(input.file);
		if (message) throw new Error(message);
		const response = await fetch('/api/scene-templates', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				title: input.title,
				category: input.category,
				fileName: input.file.name,
				contentType: input.file.type,
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
			activeJob = { ...payload.job, outputs: [] };
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

			{#if activeJob}
				<JobCard initialJob={activeJob} />
			{:else}
				<ResultEmpty />
			{/if}
		</div>

		<form.Subscribe selector={(state) => state.values}>
			{#snippet children(values)}
				<SceneSidePanel
					{values}
					selectedScene={selectedScene(values.selectedSceneId)}
					{file}
					{preview}
					onFileSelected={setSourceFile}
					onClearFile={clearFile}
					onPositionChange={setPosition}
					onScaleChange={setScale}
					onToggle={setToggle}
				/>
			{/snippet}
		</form.Subscribe>
	</form>
</div>
