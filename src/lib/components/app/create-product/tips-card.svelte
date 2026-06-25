<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Info, RefreshCw } from '@lucide/svelte';

	type Example = {
		text: string;
		tag: string;
	};

	let {
		examples,
		onSelectExample,
		onNextExamples
	}: {
		examples: Example[];
		onSelectExample: (text: string) => void;
		onNextExamples: () => void;
	} = $props();
</script>

<Card.Root
	class="rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
>
	<Card.Content class="px-6 py-6">
		<h2 class="text-[17px] font-black text-[#121826]">生成建议</h2>
		<ul
			class="mt-5 space-y-4 border-b border-[#e5e9f4] pb-7 text-[14px] font-medium text-[#65708a]"
		>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
					<Info class="size-3.5" />
				</span>
				描述越详细，生成效果越贴近需求
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
					<Info class="size-3.5" />
				</span>
				建议包含商品材质、颜色、风格等关键信息
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
					<Info class="size-3.5" />
				</span>
				参考图生成效果更稳定
			</li>
		</ul>

		<div class="mt-7 flex items-center justify-between gap-3">
			<h2 class="text-[17px] font-black text-[#121826]">示例描述</h2>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={onNextExamples}
				class="h-8 gap-2 font-black text-primary hover:bg-primary/5 hover:text-primary"
			>
				换一换 <RefreshCw class="size-4" />
			</Button>
		</div>
		<div class="mt-5 space-y-3">
			{#each examples as item (item.tag)}
				<Button
					type="button"
					variant="outline"
					onclick={() => onSelectExample(item.text)}
					class="h-auto w-full justify-start whitespace-normal rounded-[8px] border-[#e1e5f2] bg-white px-4 py-4 text-left text-[14px] font-semibold leading-6 text-[#34405a] hover:border-primary/60 hover:bg-primary/5"
				>
					<span class="min-w-0 break-words">
						{item.text}
						<span class="mt-2 block text-[13px] font-black text-primary">{item.tag}</span>
					</span>
				</Button>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
