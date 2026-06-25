<script lang="ts">
	const steps = [
		{ title: '选择场景', description: '挑选营销场景' },
		{ title: '添加商品', description: '上传商品并定位' },
		{ title: '生成结果', description: '调整融合效果' }
	];
</script>

<section
	class="rounded-[18px] border border-[#e2e6f4] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
>
	<div class="grid gap-4 md:grid-cols-3">
		{#each steps as step, index (step.title)}
			<div class="flex min-w-0 items-center gap-4">
				<span
					class="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[15px] font-black text-white shadow-[0_10px_20px_rgba(91,61,245,0.28)]"
					>{index + 1}</span
				>
				<span class="min-w-0">
					<strong class="block truncate text-[15px] font-black text-[#172033]">{step.title}</strong>
					<small class="mt-1 block truncate text-[12px] font-semibold text-[#8a94ad]"
						>{step.description}</small
					>
				</span>
				{#if index < steps.length - 1}
					<span class="ml-auto hidden h-px min-w-12 flex-1 bg-[#e4e8f4] lg:block"></span>
				{/if}
			</div>
		{/each}
	</div>
</section>
