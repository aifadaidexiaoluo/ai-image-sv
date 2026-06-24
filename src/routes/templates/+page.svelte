<script lang="ts">
	import { categories, templates, type TemplateCategory } from '$lib/components/home/home-content';
	import InfoPage from '$lib/components/marketing/info-page.svelte';
	let active = $state<TemplateCategory>('all');
	let filtered = $derived(templates.filter((item) => active === 'all' || item.category === active));
</script>

<svelte:head
	><title>模板中心 - DesignAI</title><meta
		name="description"
		content="浏览 DesignAI 商品图、场景图、营销海报和详情页模板。"
	/></svelte:head
>
<InfoPage
	eyebrow="模板中心"
	title="从好模板开始，更快完成设计"
	description="选择适合商品和营销场景的模板，直接进入 AI 工作台继续编辑。"
	><div class="flex gap-2 overflow-x-auto pb-4">
		{#each categories as category}<button
				onclick={() => (active = category.id)}
				class="shrink-0 rounded-full px-4 py-2 text-sm"
				class:bg-primary={active === category.id}
				class:text-white={active === category.id}>{category.label}</button
			>{/each}
	</div>
	<div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
		{#each filtered as item}<a
				href={`/app/create/${item.category === 'scene' ? 'scene' : 'product'}?template=${item.id}`}
				class="group overflow-hidden rounded-2xl border bg-white shadow-sm"
				><div class="aspect-square overflow-hidden">
					<img
						src={item.image}
						alt={item.title}
						class="size-full object-cover transition group-hover:scale-105"
					/>
				</div>
				<div class="p-4">
					<h2 class="font-semibold">{item.title}</h2>
					<p class="mt-1 text-sm text-muted-foreground">{item.description}</p>
				</div></a
			>{/each}
	</div>
</InfoPage>
