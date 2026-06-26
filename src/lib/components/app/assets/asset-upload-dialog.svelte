<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { ImagePlus, LoaderCircle } from '@lucide/svelte';
	import AssetSelect from './asset-select.svelte';
	import type { AssetOption, MetadataValues } from './types';

	let {
		open = $bindable(false),
		styleOptions,
		colorOptions,
		onUploaded
	}: {
		open: boolean;
		styleOptions: AssetOption[];
		colorOptions: AssetOption[];
		onUploaded: () => Promise<void>;
	} = $props();

	const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
	const maxFileBytes = 10 * 1024 * 1024;
	const form = createForm(() => ({
		defaultValues: {
			displayName: '',
			style: 'all',
			color: 'all',
			tags: ''
		} as MetadataValues,
		onSubmit: async ({ value }) => {
			await uploadAsset(value);
		}
	}));

	let uploadFile = $state<File>();
	let uploadPreview = $state('');
	let uploadError = $state('');
	let uploadBusy = $state(false);
	let fileInput = $state<HTMLInputElement>();

	function clearUploadFile() {
		if (uploadPreview) URL.revokeObjectURL(uploadPreview);
		uploadFile = undefined;
		uploadPreview = '';
		if (fileInput) fileInput.value = '';
	}

	function validateFile(file: File) {
		if (!allowedTypes.has(file.type)) return '仅支持 JPG、PNG 和 WebP 图片';
		if (file.size <= 0 || file.size > maxFileBytes) return '图片大小不能超过 10 MB';
		return '';
	}

	function chooseFile(file: File) {
		const error = validateFile(file);
		if (error) {
			uploadError = error;
			return;
		}
		clearUploadFile();
		uploadFile = file;
		uploadPreview = URL.createObjectURL(file);
		uploadError = '';
		form.setFieldValue('displayName', file.name.replace(/\.[^.]+$/, ''));
	}

	function onFileInput(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (file) chooseFile(file);
	}

	function dropFile(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files?.[0];
		if (file) chooseFile(file);
	}

	function imageDimensions(file: File) {
		return new Promise<{ width: number; height: number }>((resolve) => {
			const url = URL.createObjectURL(file);
			const image = new Image();
			image.onload = () => {
				URL.revokeObjectURL(url);
				resolve({ width: image.naturalWidth, height: image.naturalHeight });
			};
			image.onerror = () => {
				URL.revokeObjectURL(url);
				resolve({ width: 0, height: 0 });
			};
			image.src = url;
		});
	}

	async function uploadAsset(value: MetadataValues) {
		uploadError = '';
		if (!uploadFile) {
			uploadError = '请先选择素材图片';
			return;
		}

		uploadBusy = true;
		let assetId = '';
		try {
			const dimensions = await imageDimensions(uploadFile);
			const response = await fetch('/api/assets/presign', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					fileName: uploadFile.name,
					displayName: value.displayName,
					contentType: uploadFile.type,
					size: uploadFile.size,
					width: dimensions.width || undefined,
					height: dimensions.height || undefined,
					style: value.style === 'all' ? '' : value.style,
					color: value.color === 'all' ? '' : value.color,
					tags: value.tags
				})
			});
			const descriptor = await response.json();
			if (!response.ok) throw new Error(descriptor.message ?? '上传准备失败');
			assetId = descriptor.assetId;

			const uploadResponse = await fetch(descriptor.url, {
				method: descriptor.method,
				headers: descriptor.headers,
				body: uploadFile
			});
			if (!uploadResponse.ok) throw new Error('素材上传失败');

			clearUploadFile();
			form.reset();
			open = false;
			await onUploaded();
		} catch (cause) {
			if (assetId) await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
			uploadError = cause instanceof Error ? cause.message : '素材上传失败';
		} finally {
			uploadBusy = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>上传素材</Dialog.Title>
			<Dialog.Description>支持 JPG、PNG、WebP，单张不超过 10 MB。</Dialog.Description>
		</Dialog.Header>
		{#if uploadError}
			<Alert variant="destructive"><AlertDescription>{uploadError}</AlertDescription></Alert>
		{/if}
		<form
			onsubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			class="space-y-4"
		>
			<button
				type="button"
				class="grid min-h-56 w-full place-items-center rounded-xl border border-dashed border-primary/30 bg-[#fbfaff] p-4 text-center"
				ondragover={(event) => event.preventDefault()}
				ondrop={dropFile}
				onclick={() => fileInput?.click()}
			>
				{#if uploadPreview}
					<img src={uploadPreview} alt="" class="max-h-72 rounded-lg object-contain" />
				{:else}
					<div>
						<ImagePlus class="mx-auto mb-3 size-10 text-primary" />
						<p class="font-black text-[#121826]">点击或拖拽上传图片</p>
						<p class="mt-1 text-sm text-[#65708a]">素材库上传会长期保存</p>
					</div>
				{/if}
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept="image/png,image/jpeg,image/webp"
				class="hidden"
				onchange={onFileInput}
			/>
			<form.Field
				name="displayName"
				validators={{ onChange: ({ value }) => (!value.trim() ? '请输入素材名称' : undefined) }}
			>
				{#snippet children(field)}
					<label class="space-y-1.5">
						<span class="text-sm font-bold text-[#65708a]">名称</span>
						<Input
							value={field.state.value}
							onblur={() => field.handleBlur()}
							oninput={(event) => field.handleChange((event.target as HTMLInputElement).value)}
						/>
						{#if field.state.meta.errors.length}
							<span class="text-xs text-red-500">{field.state.meta.errors[0]}</span>
						{/if}
					</label>
				{/snippet}
			</form.Field>
			<div class="grid gap-3 sm:grid-cols-3">
				<form.Field name="style">
					{#snippet children(field)}
						<label class="space-y-1.5">
							<span class="text-sm font-bold text-[#65708a]">风格</span>
							<AssetSelect
								value={field.state.value}
								options={styleOptions}
								placeholder="未设置"
								class="h-10 w-full rounded-lg border-[#dde2f2] bg-white"
								onChange={(value) => field.handleChange(value)}
							/>
						</label>
					{/snippet}
				</form.Field>
				<form.Field name="color">
					{#snippet children(field)}
						<label class="space-y-1.5">
							<span class="text-sm font-bold text-[#65708a]">颜色</span>
							<AssetSelect
								value={field.state.value}
								options={colorOptions}
								placeholder="未设置"
								class="h-10 w-full rounded-lg border-[#dde2f2] bg-white"
								onChange={(value) => field.handleChange(value)}
							/>
						</label>
					{/snippet}
				</form.Field>
				<form.Field name="tags">
					{#snippet children(field)}
						<label class="space-y-1.5">
							<span class="text-sm font-bold text-[#65708a]">标签</span>
							<Input
								value={field.state.value}
								placeholder="电商, 主图"
								oninput={(event) => field.handleChange((event.target as HTMLInputElement).value)}
							/>
						</label>
					{/snippet}
				</form.Field>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>取消</Button>
				<Button type="submit" disabled={uploadBusy}>
					{#if uploadBusy}<LoaderCircle class="size-4 animate-spin" />{/if}
					上传
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
