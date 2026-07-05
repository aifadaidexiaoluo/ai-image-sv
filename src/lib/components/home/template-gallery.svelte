<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import * as Carousel from '$lib/components/ui/carousel';
	import { categories, templates, type TemplateCategory } from './home-content';

	let activeCategory = $state<TemplateCategory>('all');
	let filteredItems = $derived(
		templates.filter((item) => activeCategory === 'all' || item.category === activeCategory)
	);

	function selectCategory(category: TemplateCategory) {
		activeCategory = category;
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
				href={resolve('/templates')}
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
			{#key activeCategory}
				<Carousel.Root opts={{ align: 'start', loop: true }} class="px-0 sm:px-6">
					<Carousel.Content class="-ms-4 min-h-80">
						{#each filteredItems as item (item.id)}
							<Carousel.Item class="basis-1/2 md:basis-1/3 lg:basis-1/5">
								<article
									class="group h-full overflow-hidden rounded-2xl border border-[#ebe9f4] bg-white shadow-[0_10px_35px_rgba(69,53,140,.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(69,53,140,.12)]"
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
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<Carousel.Previous
						aria-label="上一个模板"
						class="-left-5 border-[#e7e3f7] size-10 bg-white text-[#60687c] shadow-lg transition hover:text-primary disabled:opacity-40 sm:left-0"
					/>
					<Carousel.Next
						aria-label="下一个模板"
						class="-right-5 border-[#e7e3f7] size-10 bg-white text-[#60687c] shadow-lg transition hover:text-primary disabled:opacity-40 sm:right-0"
					/>
				</Carousel.Root>
			{/key}
		</div>
	</div>
</section>
