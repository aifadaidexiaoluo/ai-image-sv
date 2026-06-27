<script lang="ts">
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
	import { FolderOpen, Minus, Plus, RotateCcw, Trash2, UploadCloud } from '@lucide/svelte';
	import AssetPickerDialog from '$lib/components/app/assets/asset-picker-dialog.svelte';
	import type { AssetItem } from '$lib/components/app/assets/types';
	import type { PreviewBackground, PreviewBackgroundId } from './types';

	type WorkspaceValues = {
		previewBackground: PreviewBackgroundId;
		showOriginal: boolean;
		zoom: number;
	};

	let {
		values,
		background,
		file,
		preview,
		sourceName,
		selectedAssetId,
		onFileSelected,
		onAssetSelected,
		onClearFile,
		onBackgroundChange,
		onShowOriginalChange,
		onZoomChange
	}: {
		values: WorkspaceValues;
		background: PreviewBackground;
		file?: File;
		preview: string;
		sourceName?: string;
		selectedAssetId?: string;
		onFileSelected: (file: File) => void;
		onAssetSelected: (asset: AssetItem) => void;
		onClearFile: () => void;
		onBackgroundChange: (background: PreviewBackgroundId) => void;
		onShowOriginalChange: (checked: boolean) => void;
		onZoomChange: (zoom: number) => void;
	} = $props();

	let fileInput = $state<HTMLInputElement>();
	let isDragging = $state(false);
	let pickerOpen = $state(false);
	const quickBackgrounds = [
		{ id: 'transparent', label: '透明棋盘', className: 'checkerboard-bg' },
		{ id: 'white', label: '白色', className: 'bg-white' },
		{ id: 'light-gray', label: '浅灰', className: 'bg-[#eef1f7]' },
		{ id: 'dark', label: '深色', className: 'bg-[#182033]' },
		{ id: 'soft', label: '柔彩', className: 'bg-[linear-gradient(135deg,#f5efff,#e8fff8)]' }
	] satisfies { id: PreviewBackgroundId; label: string; className: string }[];

	function openFilePicker() {
		fileInput?.click();
	}

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (selected) onFileSelected(selected);
	}

	function clearFile() {
		onClearFile();
		if (fileInput) fileInput.value = '';
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const selected = event.dataTransfer?.files?.[0];
		if (selected) onFileSelected(selected);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		const current = event.currentTarget as HTMLElement;
		const related = event.relatedTarget;
		if (related instanceof Node && current.contains(related)) return;
		isDragging = false;
	}

	function stepZoom(delta: number) {
		onZoomChange(Math.max(50, Math.min(180, values.zoom + delta)));
	}
</script>

<Card.Root
	class="overflow-hidden rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
>
	<Card.Header class="border-b border-[#edf1f8] px-5 py-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<Card.Title class="text-[17px] font-black text-[#121826]">上传与预览</Card.Title>
				<Card.Description class="mt-1 text-[13px] font-medium text-[#7a859e]">
					背景仅用于检查边缘，最终任务输出透明 PNG。
				</Card.Description>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center gap-2 rounded-[8px] border border-[#dde3f2] px-3 py-2">
					<span class="text-[13px] font-bold text-[#65708a]">原图</span>
					<Switch
						checked={values.showOriginal}
						onCheckedChange={onShowOriginalChange}
						aria-label="切换原图查看"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={openFilePicker}
					class="h-9 rounded-[7px] border-primary/35 text-primary hover:bg-primary/5 hover:text-primary"
				>
					<UploadCloud class="size-4" />{file ? '替换图片' : '上传图片'}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (pickerOpen = true)}
					class="h-9 rounded-[7px] border-primary/35 text-primary hover:bg-primary/5 hover:text-primary"
				>
					<FolderOpen class="size-4" />素材库
				</Button>
			</div>
		</div>
	</Card.Header>

	<Card.Content class="px-5 py-5">
		<div class="grid gap-5 lg:grid-cols-[1fr_240px]">
			<div>
				<div
					role="button"
					tabindex="0"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					onclick={() => {
						if (!preview) openFilePicker();
					}}
					onkeydown={(event) => {
						if ((event.key === 'Enter' || event.key === ' ') && !preview) {
							event.preventDefault();
							openFilePicker();
						}
					}}
					class={cn(
						'grid min-h-[520px] place-items-center overflow-hidden rounded-[12px] border transition',
						preview
							? values.showOriginal
								? 'border-[#dfe5f2] bg-[#f7f8fc]'
								: `border-[#dfe5f2] ${background.className}`
							: 'border-dashed border-primary/40 bg-[#fbfaff]',
						isDragging && 'border-primary bg-primary/5'
					)}
				>
					{#if preview}
						<div class="relative flex size-full min-h-[520px] items-center justify-center p-8">
							<Badge
								variant="secondary"
								class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[#26324a]"
							>
								{values.showOriginal ? '原图查看' : `${background.name}预览`}
							</Badge>
							<img
								src={preview}
								alt="抠图源图预览"
								class="max-h-[460px] max-w-[86%] object-contain drop-shadow-[0_18px_32px_rgba(20,27,45,0.18)] transition duration-200"
								style:transform={`scale(${values.zoom / 100})`}
							/>
						</div>
					{:else}
						<div class="mx-auto max-w-md px-8 text-center">
							<img
								src="/images/app/create-remove-background/upload-empty.png"
								alt="上传图片示意"
								class="mx-auto mb-5 size-40 rounded-[18px] object-cover shadow-[0_16px_30px_rgba(91,61,245,0.12)]"
							/>
							<p class="text-[16px] font-black text-[#26324a]">
								{isDragging ? '松开鼠标上传图片' : '点击上传或拖拽图片到这里'}
							</p>
							<p class="mt-2 text-[13px] font-medium leading-6 text-[#7a859e]">
								支持 JPG、PNG、WebP，也可以从素材库选择。
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={(event) => {
									event.stopPropagation();
									pickerOpen = true;
								}}
								class="mt-4 border-primary/35 text-primary hover:bg-primary/5 hover:text-primary"
							>
								<FolderOpen class="size-4" />从素材库选择
							</Button>
						</div>
					{/if}
				</div>
				<input
					bind:this={fileInput}
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/>

				<div class="mt-4 flex flex-wrap items-center justify-between gap-3">
					<div class="min-w-0">
						<p class="truncate text-[13px] font-black text-[#26324a]">
							{file ? file.name : sourceName || '尚未上传图片'}
						</p>
						<p class="mt-1 text-[12px] font-medium text-[#8c96ac]">
							任务完成后，请在结果卡片中下载透明 PNG。
						</p>
					</div>
					{#if file || sourceName}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={clearFile}
							class="text-red-500 hover:text-red-600"
						>
							<Trash2 class="size-4" />移除图片
						</Button>
					{/if}
				</div>
			</div>

			<div class="space-y-5">
				<div class="rounded-[14px] border border-[#e2e7f4] p-4">
					<div class="mb-4 flex items-center justify-between">
						<span class="text-[14px] font-black text-[#26324a]">缩放</span>
						<span class="text-[13px] font-bold text-[#65708a]">{values.zoom}%</span>
					</div>
					<Slider
						type="single"
						value={values.zoom}
						min={50}
						max={180}
						step={5}
						onValueChange={onZoomChange}
					/>
					<div class="mt-4 grid grid-cols-3 gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onclick={() => stepZoom(-10)}
							aria-label="缩小预览"
						>
							<Minus class="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onclick={() => onZoomChange(100)}
							aria-label="重置缩放"
						>
							<RotateCcw class="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onclick={() => stepZoom(10)}
							aria-label="放大预览"
						>
							<Plus class="size-4" />
						</Button>
					</div>
				</div>

				<div class="rounded-[14px] border border-[#e2e7f4] p-4">
					<p class="text-[14px] font-black text-[#26324a]">快速预览背景</p>
					<div class="mt-4 grid grid-cols-5 gap-2">
						{#each quickBackgrounds as item (item.id)}
							<button
								type="button"
								aria-label={`选择${item.label}预览背景`}
								onclick={() => onBackgroundChange(item.id)}
								class={cn(
									'size-9 rounded-[8px] border transition',
									item.id === values.previewBackground
										? 'border-primary ring-2 ring-primary/20'
										: 'border-[#dce2f0]',
									item.className
								)}
							></button>
						{/each}
					</div>
				</div>

				<AspectRatio ratio={1} class="overflow-hidden rounded-[14px] bg-[#f7f8fc]">
					<img
						src="/images/app/create-remove-background/example-before.png"
						alt="抠图示例"
						class="size-full object-cover"
					/>
				</AspectRatio>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<AssetPickerDialog
	bind:open={pickerOpen}
	{selectedAssetId}
	title="选择抠图素材"
	description="从素材库中选择一张图片作为智能抠图的输入素材。"
	onSelect={onAssetSelected}
/>

<style>
	.checkerboard-bg {
		background-color: #fff;
		background-image:
			linear-gradient(45deg, #e8edf6 25%, transparent 25%),
			linear-gradient(-45deg, #e8edf6 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #e8edf6 75%),
			linear-gradient(-45deg, transparent 75%, #e8edf6 75%);
		background-position:
			0 0,
			0 10px,
			10px -10px,
			-10px 0;
		background-size: 20px 20px;
	}
</style>
