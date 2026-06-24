<script lang="ts">
	import { ArrowRight, Bot, Download, Images, Layers3, ScanSearch, Sparkles } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from './brand-logo.svelte';
	import { productImages } from './home-content';

	const capabilities = [
		{
			icon: ScanSearch,
			title: m.home_capability_recognition(),
			description: m.home_capability_recognition_desc()
		},
		{
			icon: Images,
			title: m.home_capability_scenes(),
			description: m.home_capability_scenes_desc()
		},
		{
			icon: Sparkles,
			title: m.home_capability_styles(),
			description: m.home_capability_styles_desc()
		},
		{ icon: Layers3, title: m.home_capability_batch(), description: m.home_capability_batch_desc() }
	];

	const mockSteps = [
		m.home_mock_upload(),
		m.home_mock_choose(),
		m.home_mock_generate(),
		m.home_mock_download()
	];
</script>

<section id="capabilities" class="bg-[#f8f7ff] py-16">
	<div class="home-container grid items-center gap-12 lg:grid-cols-[43%_57%]">
		<div>
			<h2 class="text-[36px] leading-[1.2] font-extrabold tracking-[-0.04em] text-[#151a29]">
				{m.home_capabilities_title_line1()}<br />{m.home_capabilities_title_line2()}
			</h2>
			<a
				href="/app/create/product"
				class="mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,61,245,.25)] transition hover:-translate-y-0.5"
				>{m.home_start_design()} <ArrowRight class="size-4" /></a
			>
			<div class="mt-10 grid grid-cols-2 gap-x-7 gap-y-6">
				{#each capabilities as item (item.title)}
					<div class="flex gap-3">
						<div
							class="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ede9ff] text-primary"
						>
							<item.icon class="size-5" />
						</div>
						<div>
							<h3 class="text-sm font-semibold text-[#252c40]">{item.title}</h3>
							<p class="mt-1 text-xs leading-5 text-[#858c9d]">{item.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div
			class="relative rounded-[26px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(74,55,160,.13)]"
		>
			<div class="flex items-center justify-between border-b border-[#efedf6] pb-5">
				<BrandLogo /><span
					class="rounded-full bg-[#f0edff] px-3 py-1 text-xs font-medium text-primary"
					>AI Studio</span
				>
			</div>
			<div class="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
				<div class="space-y-2">
					{#each mockSteps as step, index (step)}
						<div
							class="flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-medium"
							class:bg-[#efecff]={index === 2}
							class:text-primary={index === 2}
							class:text-[#687084]={index !== 2}
						>
							{#if index === 2}<Bot class="size-4" />{:else if index === 3}<Download
									class="size-4"
								/>{:else}<Images class="size-4" />{/if}{step}
						</div>
					{/each}
				</div>
				<div class="grid grid-cols-3 gap-2.5">
					{#each productImages as image, index (image)}
						<div class="aspect-[1.12/1] overflow-hidden rounded-xl bg-[#f2f0f8]">
							<img
								src={image}
								alt={`AI 生成商品方案 ${index + 1}`}
								class="size-full object-cover transition hover:scale-105"
							/>
						</div>
					{/each}
				</div>
			</div>
			<div
				class="absolute right-[-20px] bottom-[-22px] flex items-center gap-3 rounded-2xl border border-[#eeeafc] bg-white p-4 shadow-[0_16px_42px_rgba(60,42,140,.16)]"
			>
				<div class="grid size-10 place-items-center rounded-xl bg-primary text-white">
					<Sparkles class="size-5" />
				</div>
				<div>
					<strong class="text-sm text-[#23293c]">{m.home_success()}</strong>
					<p class="mt-1 text-[11px] text-primary">{m.home_success_desc()}</p>
				</div>
			</div>
		</div>
	</div>
</section>
