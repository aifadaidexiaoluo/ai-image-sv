<script lang="ts">
	import InfoPage from '$lib/components/marketing/info-page.svelte';
	import { caseStudies } from '$lib/components/home/home-content';
</script>

<svelte:head><title>客户案例 - DesignAI</title></svelte:head>
<InfoPage
	eyebrow="精选案例"
	title="看看 AI 如何改善商品表达"
	description="从 3C 数码到美妆个护，使用一致的工作流生成适合投放的电商视觉。"
	><div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each caseStudies as item (item.id)}<article
				class="overflow-hidden rounded-2xl border bg-white"
			>
				<img src={item.image} alt={item.title} class="aspect-square w-full object-cover" />
				<div class="p-5">
					<h2 class="font-semibold">{item.title}</h2>
					<p class="mt-1 text-sm text-muted-foreground">{item.scene}</p>
					<strong class="mt-4 block text-2xl text-primary">+{item.lift}%</strong><span
						class="text-xs text-muted-foreground">示例转化提升</span
					>
				</div>
			</article>{/each}
	</div></InfoPage
>
