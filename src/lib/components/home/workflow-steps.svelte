<script lang="ts">
	import { ArrowRight, Cpu, Download, Palette, UploadCloud } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	const steps = [
		{ icon: UploadCloud, title: m.home_step_upload(), description: m.home_step_upload_desc() },
		{ icon: Palette, title: m.home_step_scene(), description: m.home_step_scene_desc() },
		{ icon: Cpu, title: m.home_step_generate(), description: m.home_step_generate_desc() },
		{ icon: Download, title: m.home_step_download(), description: m.home_step_download_desc() }
	];
</script>

<section id="workflow" class="bg-[#f8f7ff] py-9">
	<div
		class="home-container home-card-shadow rounded-[24px] border border-white bg-white px-9 py-8"
	>
		<h2 class="text-[23px] font-bold tracking-[-0.02em] text-[#171c2b]">
			{m.home_workflow_title()}
		</h2>
		<div class="mt-7 grid grid-cols-4 gap-7">
			{#each steps as step, index (step.title)}
				<div class="relative flex items-center gap-4">
					<div
						class="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-[#f0edff] text-primary"
					>
						<span
							class="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white"
							>{index + 1}</span
						>
						<step.icon class="size-8" />
					</div>
					<div>
						<h3 class="text-sm font-semibold text-[#202638]">{step.title}</h3>
						<p class="mt-1.5 text-xs text-[#858c9d]">{step.description}</p>
					</div>
					{#if index < steps.length - 1}<ArrowRight
							class="absolute -right-5 size-5 text-[#c8bfff]"
						/>{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
