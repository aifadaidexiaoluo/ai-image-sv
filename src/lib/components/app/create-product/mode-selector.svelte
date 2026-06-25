<script lang="ts">
	import { ImagePlus, Sparkles, Check } from '@lucide/svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { cn } from '$lib/utils';

	export type GenerationMode = 'prompt' | 'reference';

	const generationModes = [
		{
			id: 'prompt',
			title: 'AI 描述生成',
			description: '输入商品描述，AI 自动生成商品图',
			icon: Sparkles
		},
		{
			id: 'reference',
			title: '参考图生成',
			description: '上传参考图，AI 生成相似风格商品图',
			icon: ImagePlus
		}
	] satisfies {
		id: GenerationMode;
		title: string;
		description: string;
		icon: typeof Sparkles;
	}[];

	let {
		value,
		onSelect
	}: {
		value: GenerationMode;
		onSelect: (mode: GenerationMode) => void;
	} = $props();
</script>

<RadioGroup.Root
	{value}
	onValueChange={(nextValue) => onSelect(nextValue as GenerationMode)}
	class="mt-6 grid gap-5 md:grid-cols-2"
>
	{#each generationModes as mode (mode.id)}
		{@const Icon = mode.icon}
		<div
			role="button"
			tabindex="0"
			onclick={() => onSelect(mode.id)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect(mode.id);
				}
			}}
			class={cn(
				'relative flex min-h-[106px] cursor-pointer items-center gap-5 rounded-[10px] border bg-white px-6 text-left transition',
				value === mode.id
					? 'border-primary ring-1 ring-primary'
					: 'border-[#e0e5f4] hover:border-primary/50'
			)}
		>
			<span
				class="grid size-14 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary"
			>
				<Icon class="size-7" />
			</span>
			<span>
				<strong class="block text-[16px] font-black text-[#121826]">{mode.title}</strong>
				<small class="mt-2 block text-[14px] font-medium text-[#65708a]">{mode.description}</small>
			</span>
			{#if value === mode.id}
				<span
					class="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-white"
				>
					<Check class="size-4 stroke-[3]" />
				</span>
			{/if}
		</div>
	{/each}
</RadioGroup.Root>
