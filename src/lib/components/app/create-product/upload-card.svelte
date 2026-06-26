<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { CircleHelp, ImagePlus, Trash2, UploadCloud, X } from '@lucide/svelte';

	let {
		file,
		preview,
		onFileSelected,
		onClear
	}: {
		file?: File;
		preview: string;
		onFileSelected: (file: File) => void;
		onClear: () => void;
	} = $props();

	let fileInput = $state<HTMLInputElement>();
	let isDragging = $state(false);

	function openFilePicker() {
		fileInput?.click();
	}

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (selected) onFileSelected(selected);
	}

	function clearFile() {
		onClear();
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
</script>

<Card.Root
	class="rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
>
	<Card.Header class="px-6 pt-6">
		<Card.Title class="flex items-center gap-2 text-[17px] font-black text-[#121826]">
			上传参考图 <span class="text-[14px] font-semibold text-[#65708a]">（可选）</span>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<button {...props} type="button" aria-label="参考图说明">
							<CircleHelp class="size-4 text-[#8b95aa]" />
						</button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>参考图生成模式下必填，描述生成模式下可作为额外参考。</Tooltip.Content>
			</Tooltip.Root>
		</Card.Title>
	</Card.Header>
	<Card.Content class="px-6 pb-6">
		<div
			role="button"
			tabindex="0"
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					openFilePicker();
				}
			}}
			onclick={() => {
				if (!preview) openFilePicker();
			}}
			class={cn(
				'mt-4 grid min-h-[184px] place-items-center overflow-hidden rounded-[10px] border border-dashed bg-[#fbfaff] text-center transition',
				isDragging ? 'border-primary bg-primary/5' : 'border-primary/45 hover:border-primary'
			)}
		>
			{#if preview}
				<div class="relative size-full min-h-[184px]">
					<img src={preview} alt="上传预览" class="size-full object-contain" />
					<div class="absolute right-3 top-3 flex gap-2">
						<Button
							type="button"
							size="icon-sm"
							variant="secondary"
							onclick={(event) => {
								event.stopPropagation();
								openFilePicker();
							}}
							aria-label="替换图片"
							class="bg-white/90 shadow-sm"
						>
							<UploadCloud class="size-4" />
						</Button>
						<Button
							type="button"
							size="icon-sm"
							variant="secondary"
							onclick={(event) => {
								event.stopPropagation();
								clearFile();
							}}
							aria-label="移除图片"
							class="bg-white/90 text-red-500 shadow-sm hover:text-red-600"
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</div>
			{:else}
				<span class="px-8 text-[14px] font-semibold text-[#26324a]">
					<ImagePlus class="mx-auto mb-7 size-8 text-primary" />
					{isDragging ? '松开鼠标上传图片' : '点击上传或拖拽图片到这里'}
					<small class="mt-3 block text-[12px] font-medium text-[#8994aa]"
						>支持 JPG、PNG、WebP，大小不超过 10MB</small
					>
				</span>
			{/if}
			<input
				bind:this={fileInput}
				class="sr-only"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={selectFile}
			/>
		</div>
		{#if file}
			<div
				class="mt-3 flex items-center justify-between gap-3 text-[12px] font-medium text-[#65708a]"
			>
				<span class="min-w-0 truncate">{file.name}</span>
				<Button
					type="button"
					variant="ghost"
					size="xs"
					onclick={clearFile}
					class="shrink-0 text-[#65708a] hover:text-red-600"
				>
					<X class="size-3" />移除
				</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
