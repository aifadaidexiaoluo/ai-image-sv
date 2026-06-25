<script lang="ts">
	import InfoPage from '$lib/components/marketing/info-page.svelte';
	const steps = [
		['准备素材', '使用清晰、主体完整的商品原图，避免严重遮挡和过度压缩。'],
		['选择工具', '商品图适合从创意开始，场景编辑用于保留商品主体，抠图输出透明 PNG。'],
		['描述效果', '写清楚场景、光线、构图、材质和目标平台，结果会更稳定。'],
		['生成与下载', '处理进度实时更新，完成的图片可以逐张预览和下载。']
	];
</script>

<svelte:head><title>新手指南 - DesignAI</title></svelte:head>
<InfoPage
	eyebrow="新手指南"
	title="四步完成第一组商品图"
	description="无需设计经验，从一张商品原图开始即可。"
	><div class="mx-auto grid max-w-4xl gap-4">
		{#each steps as step, index (step[0])}<article
				class="flex gap-5 rounded-2xl border bg-white p-6"
			>
				<span
					class="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-white"
					>{index + 1}</span
				>
				<div>
					<h2 class="font-semibold">{step[0]}</h2>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{step[1]}</p>
				</div>
			</article>{/each}
	</div></InfoPage
>
