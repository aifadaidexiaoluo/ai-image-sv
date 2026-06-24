<script lang="ts">
	import { ArrowRight, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { categories, templates, type TemplateCategory } from './home-content';

	let activeCategory = $state<TemplateCategory>('all');
	let offset = $state(0);
	let filteredItems = $derived(
		templates.filter((item) => activeCategory === 'all' || item.category === activeCategory)
	);
	let visibleItems = $derived.by(() => {
		const count = Math.min(5, filteredItems.length);
		return Array.from(
			{ length: count },
			(_, index) => filteredItems[(offset + index) % filteredItems.length]
		);
	});

	function selectCategory(category: TemplateCategory) {
		activeCategory = category;
		offset = 0;
	}

	function move(direction: number) {
		if (!filteredItems.length) return;
		offset = (offset + direction + filteredItems.length) % filteredItems.length;
	}
</script>

<section id="templates" class="bg-[#f8f7ff] py-8">
	<div class="home-container">
		<div class="flex items-end justify-between">
			<div>
				<h2 class="text-[24px] font-bold tracking-[-0.025em] text-[#171c2b]">
					{m.home_templates_title()}
				</h2>
			</div>
			<a
				href="/templates"
				class="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
				>{m.home_view_all()} <ArrowRight class="size-4" /></a
			>
		</div>
		<div class="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
			{#each categories as category (category.id)}
				<button
					type="button"
					onclick={() => selectCategory(category.id)}
					aria-pressed={activeCategory === category.id}
					class="rounded-full px-4 py-2 text-sm font-medium transition"
					class:bg-primary={activeCategory === category.id}
					class:text-white={activeCategory === category.id}
					class:text-[#5f6678]={activeCategory !== category.id}
					class:hover:bg-[#ece8ff]={activeCategory !== category.id}>{category.label}</button
				>
			{/each}
		</div>

		<div class="relative mt-5">
			<div class="grid min-h-[320px] grid-cols-2 gap-4 lg:grid-cols-5">
				{#each visibleItems as item (item.id)}
					<article
						class="group overflow-hidden rounded-2xl border border-[#ebe9f4] bg-white shadow-[0_10px_35px_rgba(69,53,140,.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(69,53,140,.12)]"
					>
						<div class="aspect-[1/1.05] overflow-hidden">
							<img
								src={item.image}
								alt={item.title}
								class="size-full object-cover transition duration-500 group-hover:scale-105"
							/>
						</div>
						<div class="p-4">
							<h3 class="text-[15px] font-semibold text-[#202638]">{item.title}</h3>
							<p class="mt-1.5 text-xs text-[#858c9d]">{item.description}</p>
						</div>
					</article>
				{/each}
			</div>
			<button
				type="button"
				aria-label="上一个模板"
				onclick={() => move(-1)}
				class="absolute top-1/2 -left-5 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#e7e3f7] bg-white text-[#60687c] shadow-lg transition hover:text-primary"
				><ChevronLeft class="size-5" /></button
			>
			<button
				type="button"
				aria-label="下一个模板"
				onclick={() => move(1)}
				class="absolute top-1/2 -right-5 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#e7e3f7] bg-white text-[#60687c] shadow-lg transition hover:text-primary"
				><ChevronRight class="size-5" /></button
			>
		</div>
	</div>
</section>
