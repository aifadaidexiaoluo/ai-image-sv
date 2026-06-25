<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';
	import type { PreviewBackground, PreviewBackgroundId } from './types';

	let {
		backgrounds,
		selectedBackground,
		preview,
		onSelect
	}: {
		backgrounds: PreviewBackground[];
		selectedBackground: PreviewBackgroundId;
		preview: string;
		onSelect: (background: PreviewBackgroundId) => void;
	} = $props();
</script>

<Card.Root
	class="rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
>
	<Card.Header class="px-5 pt-5">
		<Card.Title class="text-[17px] font-black text-[#121826]">背景预览</Card.Title>
		<Card.Description class="text-[13px] font-medium text-[#7a859e]">
			用于检查边缘，不会改变最终透明 PNG。
		</Card.Description>
	</Card.Header>
	<Card.Content class="px-5 pb-5">
		<div class="grid gap-3">
			{#each backgrounds as item (item.id)}
				<button
					type="button"
					onclick={() => onSelect(item.id)}
					class={cn(
						'grid grid-cols-[76px_1fr] items-center gap-3 rounded-[12px] border p-2 text-left transition',
						selectedBackground === item.id
							? 'border-primary bg-primary/5 ring-2 ring-primary/10'
							: 'border-[#e2e7f4] hover:border-primary/45'
					)}
				>
					<div
						class={cn('grid h-16 place-items-center overflow-hidden rounded-[9px]', item.className)}
					>
						{#if preview}
							<img src={preview} alt="" class="max-h-14 max-w-16 object-contain" />
						{:else}
							<img
								src="/images/app/create-remove-background/example-workflow.png"
								alt=""
								class="size-full object-cover opacity-80"
							/>
						{/if}
					</div>
					<span>
						<span class="flex items-center gap-2">
							<strong class="text-[14px] font-black text-[#26324a]">{item.name}</strong>
							{#if selectedBackground === item.id}
								<Badge class="h-5 rounded-full px-2 text-[11px]">已选</Badge>
							{/if}
						</span>
						<small class="mt-1 block text-[12px] font-medium leading-5 text-[#7a859e]">
							{item.description}
						</small>
					</span>
				</button>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

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
