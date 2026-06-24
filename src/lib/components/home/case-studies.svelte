<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { caseStudies } from './home-content';
</script>

<section id="cases" class="bg-[#f8f7ff] py-8">
	<div class="home-container">
		<h2 class="text-[24px] font-bold tracking-[-0.025em] text-[#171c2b]">{m.home_cases_title()}</h2>
		<p class="mt-2 text-sm text-[#858c9d]">{m.home_cases_subtitle()}</p>
		<div class="mt-6 grid grid-cols-4 gap-5">
			{#each caseStudies as item (item.id)}
				<article
					class="group overflow-hidden rounded-2xl border border-[#eae8f3] bg-white shadow-[0_12px_36px_rgba(69,53,140,.07)] transition hover:-translate-y-1"
				>
					<div class="relative aspect-[1/1.02] overflow-hidden">
						<img
							src={item.image}
							alt={item.title}
							class="size-full object-cover transition duration-500 group-hover:scale-105"
						/>
						<span
							class="absolute top-3 left-3 rounded-lg bg-[#4b5265]/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur"
							>原图</span
						>
						<span
							class="absolute top-3 right-3 rounded-lg bg-[#4b5265]/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur"
							>AI 生成图</span
						>
					</div>
					<div class="p-5">
						<h3 class="font-semibold text-[#202638]">{item.title}</h3>
						<p class="mt-1.5 text-xs text-[#858c9d]">{item.scene}</p>
						<div class="mt-5 flex items-end justify-between">
							<div>
								<p class="text-[11px] font-medium text-primary">{m.home_conversion_short()}</p>
								<strong class="mt-1 block text-2xl">+{item.lift}%</strong>
							</div>
							<div class="flex items-end gap-1 text-primary">
								<svg aria-hidden="true" viewBox="0 0 68 30" class="h-8 w-16"
									><path
										d="M2 27 15 17l10 6 12-14 10 8L66 2"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg
								><ArrowUpRight class="size-5" />
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
