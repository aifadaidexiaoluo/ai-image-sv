<script lang="ts">
	import { page } from '$app/state';
	import { refreshAccountData } from '$lib/account-refresh';
	import { onDestroy, onMount } from 'svelte';
	import BackgroundPreviewPanel from '$lib/components/app/create-remove-background/background-preview-panel.svelte';
	import ResultEmpty from '$lib/components/app/create-remove-background/result-empty.svelte';
	import {
		previewBackgrounds,
		type PreviewBackgroundId
	} from '$lib/components/app/create-remove-background/types';
	import UploadWorkspace from '$lib/components/app/create-remove-background/upload-workspace.svelte';
	import JobCard from '$lib/components/app/job-card.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { validateUploadImageFile } from '$lib/image-upload';
	import { CircleAlert, Coins, LoaderCircle, Sparkles } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import type { GenerationJob } from '$lib/types/jobs';
	import type { AssetItem } from '$lib/components/app/assets/types';

	type RemoveBackgroundFormValues = {
		previewBackground: PreviewBackgroundId;
		showOriginal: boolean;
		zoom: number;
	};

	const form = createForm(() => ({
		defaultValues: {
			previewBackground: 'transparent',
			showOriginal: false,
			zoom: 100
		} as RemoveBackgroundFormValues,
		onSubmit: async ({ value }) => {
			await submit(value);
		}
	}));

	let file = $state<File>();
	let preview = $state('');
	let selectedAsset = $state<AssetItem>();
	let error = $state('');
	let activeJobs = $state<GenerationJob[]>([]);
	let prefillNotice = $state('');

	onDestroy(() => {
		revokePreview();
	});

	onMount(() => {
		void prefillFromHistory();
	});

	function revokePreview() {
		if (preview) URL.revokeObjectURL(preview);
	}

	function selectedBackground(id: PreviewBackgroundId) {
		return previewBackgrounds.find((item) => item.id === id) ?? previewBackgrounds[0];
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
		error = '';
	}

	function setBackground(background: PreviewBackgroundId) {
		form.setFieldValue('previewBackground', background);
		error = '';
	}

	function setShowOriginal(checked: boolean) {
		form.setFieldValue('showOriginal', checked);
	}

	function setZoom(zoom: number) {
		form.setFieldValue('zoom', Math.max(50, Math.min(180, zoom)));
	}

	async function prefillFromHistory() {
		const jobId = page.url.searchParams.get('fromJob');
		if (!jobId) return;

		const response = await fetch(`/api/jobs/${jobId}`);
		if (!response.ok) return;
		const payload = (await response.json()) as { job?: GenerationJob };
		const job = payload.job;
		if (!job || job.tool !== 'remove-background') return;

		const parameters = job.parameters ?? {};
		if (
			typeof parameters.previewBackground === 'string' &&
			previewBackgrounds.some((background) => background.id === parameters.previewBackground)
		) {
			form.setFieldValue('previewBackground', parameters.previewBackground as PreviewBackgroundId);
		}
		prefillNotice = '已加载历史任务参数；开始抠图前请重新上传需要处理的图片。';
	}

	function validateSubmission() {
		if (!file && !selectedAsset) return '请先上传或选择一张需要抠图的图片';
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

	async function submit(value: RemoveBackgroundFormValues) {
		error = '';
		const validationError = validateSubmission();
		if (validationError) {
			error = validationError;
			return;
		}

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
					parameters: { previewBackground: value.previewBackground }
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

<svelte:head><title>智能抠图 - DesignAI</title></svelte:head>

<div class="mx-auto max-w-[1600px] pb-8">
	<div class="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h1 class="text-[30px] font-black leading-tight text-[#121826]">智能抠图</h1>
			<p class="mt-2 text-[15px] text-[#65708a]">一键识别商品主体，输出可下载的透明 PNG 素材</p>
		</div>
		<div
			class="flex items-center gap-2 rounded-full border border-[#dde3f2] bg-white px-4 py-2 text-[13px] font-bold text-[#65708a] shadow-sm"
		>
			<Sparkles class="size-4 text-primary" />
			结果下载入口会在任务卡片中出现
		</div>
	</div>

	<form
		onsubmit={(event) => {
			event.preventDefault();
			event.stopPropagation();
			void form.handleSubmit();
		}}
		class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
	>
		<div class="space-y-5">
			<form.Subscribe selector={(state) => state.values}>
				{#snippet children(values)}
					<UploadWorkspace
						{values}
						background={selectedBackground(values.previewBackground)}
						{file}
						preview={selectedAsset?.url ?? preview}
						sourceName={selectedAsset?.displayName}
						selectedAssetId={selectedAsset?.id}
						onFileSelected={setSourceFile}
						onAssetSelected={selectSourceAsset}
						onClearFile={clearFile}
						onBackgroundChange={setBackground}
						onShowOriginalChange={setShowOriginal}
						onZoomChange={setZoom}
					/>
				{/snippet}
			</form.Subscribe>

			<Card.Root
				class="rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
			>
				<Card.Content class="px-5 py-5">
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
							<div class="grid items-center gap-4 md:grid-cols-[1fr_320px]">
								<div>
									<span class="inline-flex items-center gap-2 text-[14px] font-bold text-[#65708a]">
										<Coins class="size-4 text-amber-500" />消耗 1 积分
									</span>
									<p class="mt-1 text-[12px] font-medium text-[#8c96ac]">
										背景预览不影响最终输出，任务会生成透明 PNG。
									</p>
								</div>
								<Button
									type="submit"
									disabled={isSubmitting}
									class="h-12 rounded-[8px] text-[16px] font-black text-white shadow-[0_18px_32px_rgba(91,61,245,0.24)] hover:bg-[#4d30e7]"
								>
									{#if isSubmitting}
										<LoaderCircle class="size-4 animate-spin" />正在创建任务...
									{:else}
										<Sparkles class="size-4" />开始抠图
									{/if}
								</Button>
							</div>
						{/snippet}
					</form.Subscribe>
				</Card.Content>
			</Card.Root>
		</div>

		<form.Subscribe selector={(state) => state.values.previewBackground}>
			{#snippet children(previewBackground)}
				<aside class="space-y-5">
					<BackgroundPreviewPanel
						backgrounds={previewBackgrounds}
						selectedBackground={previewBackground}
						preview={selectedAsset?.url ?? preview}
						onSelect={setBackground}
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
				</aside>
			{/snippet}
		</form.Subscribe>
	</form>
</div>
