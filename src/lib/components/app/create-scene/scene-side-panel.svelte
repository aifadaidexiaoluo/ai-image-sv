<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
	import { CloudUpload, FolderOpen, ImagePlus, Plus, Sparkles, Trash2 } from '@lucide/svelte';
	import AssetPickerDialog from '$lib/components/app/assets/asset-picker-dialog.svelte';
	import type { AssetItem } from '$lib/components/app/assets/types';
	import PositionGrid, { type ProductPosition } from './position-grid.svelte';

	type SceneSettings = {
		productPosition: ProductPosition;
		productScale: number;
		lightingMatch: boolean;
		colorBlend: boolean;
		detailEnhance: boolean;
	};
	type ScenePreview = {
		name: string;
		image: string;
	};

	let {
		values,
		selectedScene,
		file,
		preview,
		sourceName,
		selectedAssetId,
		onFileSelected,
		onAssetSelected,
		onClearFile,
		onPositionChange,
		onScaleChange,
		onToggle
	}: {
		values: SceneSettings;
		selectedScene: ScenePreview;
		file?: File;
		preview: string;
		sourceName?: string;
		selectedAssetId?: string;
		onFileSelected: (file: File) => void;
		onAssetSelected: (asset: AssetItem) => void;
		onClearFile: () => void;
		onPositionChange: (position: ProductPosition) => void;
		onScaleChange: (scale: number) => void;
		onToggle: (key: 'lightingMatch' | 'colorBlend' | 'detailEnhance', checked: boolean) => void;
	} = $props();

	let fileInput = $state<HTMLInputElement>();
	let pickerOpen = $state(false);

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (selected) onFileSelected(selected);
	}

	function openPicker() {
		fileInput?.click();
	}

	function clearFile() {
		onClearFile();
		if (fileInput) fileInput.value = '';
	}
</script>

<aside class="space-y-5">
	<Card.Root
		class="rounded-[18px] border border-[#e2e6f4] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
	>
		<Card.Content class="px-5 py-5">
			<div class="flex items-center justify-between">
				<h2 class="text-[17px] font-black text-[#121826]">预览与商品</h2>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={openPicker}
					class="border-primary/45 text-primary hover:bg-primary/5 hover:text-primary"
				>
					<Plus class="size-4" />上传商品
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (pickerOpen = true)}
					class="border-primary/45 text-primary hover:bg-primary/5 hover:text-primary"
				>
					<FolderOpen class="size-4" />素材库
				</Button>
			</div>

			<div class="relative mt-4 aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f7f8fc]">
				<img src={selectedScene.image} alt={selectedScene.name} class="size-full object-cover" />
				{#if preview}
					<div
						class={cn(
							'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center',
							values.productPosition.includes('top') && 'top-[24%]',
							values.productPosition.includes('bottom') && 'top-[76%]',
							!values.productPosition.includes('top') &&
								!values.productPosition.includes('bottom') &&
								'top-1/2',
							values.productPosition.includes('left') && 'left-[24%]',
							values.productPosition.includes('right') && 'left-[76%]',
							!values.productPosition.includes('left') &&
								!values.productPosition.includes('right') &&
								'left-1/2'
						)}
						style:width={`${values.productScale}%`}
					>
						<img
							src={preview}
							alt="商品预览"
							class="max-h-40 w-full object-contain drop-shadow-[0_16px_24px_rgba(20,27,45,0.28)]"
						/>
					</div>
				{:else}
					<button
						type="button"
						onclick={openPicker}
						class="absolute inset-6 grid place-items-center rounded-[12px] border border-dashed border-white/70 bg-white/50 text-center text-[14px] font-black text-primary backdrop-blur-sm"
					>
						<span>
							<ImagePlus class="mx-auto mb-2 size-8" />
							上传商品图
						</span>
					</button>
				{/if}
			</div>

			<div
				class="mt-4 flex items-center gap-3 rounded-[12px] border border-dashed border-primary/35 bg-[#fbfaff] p-3"
			>
				<div
					class="grid size-14 shrink-0 place-items-center rounded-[10px] bg-white text-primary ring-1 ring-[#eceefa]"
				>
					{#if preview}
						<img src={preview} alt="商品缩略图" class="size-full rounded-[10px] object-contain" />
					{:else}
						<ImagePlus class="size-6" />
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-[13px] font-black text-[#26324a]">
						{file ? file.name : sourceName || '未上传商品图'}
					</p>
					<p class="mt-1 text-[12px] font-medium text-[#8c96ac]">
						支持 JPG、PNG、WebP，或从素材库选择
					</p>
				</div>
				{#if file || sourceName}
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						onclick={clearFile}
						aria-label="移除商品图"
						class="text-red-500 hover:text-red-600"
					>
						<Trash2 class="size-4" />
					</Button>
				{/if}
				<input
					bind:this={fileInput}
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={selectFile}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root
		class="rounded-[18px] border border-[#e2e6f4] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
	>
		<Card.Content class="px-5 py-5">
			<h2 class="text-[17px] font-black text-[#121826]">商品位置与融合</h2>
			<div class="mt-5 grid grid-cols-[104px_1fr] gap-6">
				<div>
					<p class="mb-3 text-[14px] font-bold text-[#65708a]">位置</p>
					<PositionGrid value={values.productPosition} onChange={onPositionChange} />
				</div>
				<div>
					<div class="mb-4 flex items-center justify-between text-[14px] font-bold text-[#65708a]">
						<span>大小</span>
						<span>{values.productScale}%</span>
					</div>
					<Slider
						type="single"
						value={values.productScale}
						min={30}
						max={100}
						step={5}
						onValueChange={onScaleChange}
						class="mt-6"
					/>
				</div>
			</div>

			<div class="mt-7 space-y-5 border-t border-[#e5e9f4] pt-5">
				<div class="flex items-center justify-between gap-4">
					<span class="flex items-start gap-3">
						<CloudUpload class="mt-0.5 size-5 text-[#121826]" />
						<span>
							<strong class="block text-[14px] font-black text-[#26324a]">光影匹配</strong>
							<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
								>匹配场景光源与商品阴影</small
							>
						</span>
					</span>
					<Switch
						checked={values.lightingMatch}
						onCheckedChange={(checked) => onToggle('lightingMatch', checked)}
					/>
				</div>
				<div class="flex items-center justify-between gap-4">
					<span class="flex items-start gap-3">
						<Sparkles class="mt-0.5 size-5 text-[#121826]" />
						<span>
							<strong class="block text-[14px] font-black text-[#26324a]">色彩融合</strong>
							<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
								>调整色彩使商品更自然</small
							>
						</span>
					</span>
					<Switch
						checked={values.colorBlend}
						onCheckedChange={(checked) => onToggle('colorBlend', checked)}
					/>
				</div>
				<div class="flex items-center justify-between gap-4">
					<span class="flex items-start gap-3">
						<ImagePlus class="mt-0.5 size-5 text-[#121826]" />
						<span>
							<strong class="block text-[14px] font-black text-[#26324a]">细节增强</strong>
							<small class="mt-1 block text-[12px] font-medium text-[#8c96ac]"
								>增强商品与场景融合真实感</small
							>
						</span>
					</span>
					<Switch
						checked={values.detailEnhance}
						onCheckedChange={(checked) => onToggle('detailEnhance', checked)}
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</aside>

<AssetPickerDialog
	bind:open={pickerOpen}
	{selectedAssetId}
	title="选择商品图素材"
	description="从素材库中选择一张商品图作为场景图编辑的输入素材。"
	onSelect={onAssetSelected}
/>
