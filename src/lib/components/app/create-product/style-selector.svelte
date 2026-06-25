<script lang="ts">
	import { productStyles } from '$lib/app-catalog';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { cn } from '$lib/utils';
	import { Check } from '@lucide/svelte';

	export type ProductStyleId = (typeof productStyles)[number]['id'];

	let {
		selectedStyleIds,
		onToggle,
		onToggleAll
	}: {
		selectedStyleIds: ProductStyleId[];
		onToggle: (id: ProductStyleId) => void;
		onToggleAll: () => void;
	} = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
		<span
			class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
			>3</span
		>
		选择风格 <small class="text-[14px] font-semibold text-[#65708a]">（可多选）</small>
	</h2>
	<Button
		type="button"
		variant="ghost"
		size="sm"
		onclick={onToggleAll}
		class="h-8 gap-1 font-bold text-primary hover:bg-primary/5 hover:text-primary"
	>
		全部风格 <Check class="size-4" />
	</Button>
</div>

<div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
	{#each productStyles as style (style.id)}
		<div
			role="button"
			tabindex="0"
			onclick={() => onToggle(style.id)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onToggle(style.id);
				}
			}}
			class="group cursor-pointer text-center"
		>
			<AspectRatio
				ratio={1}
				class={cn(
					'relative overflow-hidden rounded-[8px] border bg-[#f7f8fc] transition',
					selectedStyleIds.includes(style.id)
						? 'border-primary ring-1 ring-primary'
						: 'border-transparent group-hover:border-primary/40'
				)}
			>
				<img
					src={style.image}
					alt={style.name}
					class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
				/>
				<span class="absolute left-2 top-2">
					<Checkbox
						checked={selectedStyleIds.includes(style.id)}
						class="pointer-events-none bg-white/90 shadow-sm"
						aria-hidden="true"
					/>
				</span>
				{#if selectedStyleIds.includes(style.id)}
					<Badge class="absolute bottom-2 right-2 h-6 rounded-full px-2">已选</Badge>
				{/if}
			</AspectRatio>
			<span class="mt-3 block text-[14px] font-semibold text-[#172033]">{style.name}</span>
			<span class="mt-1 block text-[12px] font-medium text-[#7a8499]">{style.description}</span>
		</div>
	{/each}
</div>
