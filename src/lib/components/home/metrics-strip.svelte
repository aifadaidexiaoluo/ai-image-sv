<script lang="ts">
	import { Clock3, Images, Sparkles, Users } from '@lucide/svelte';
	import { metrics } from './home-content';

	const icons = [Users, Images, Sparkles, Clock3];
</script>

<section class="bg-[#f8f7ff] py-5">
	<div
		class="home-container overflow-hidden rounded-2xl bg-gradient-to-r from-[#6544f4] via-[#876df8] to-[#c5b7fb] px-8 py-6 text-white shadow-[0_18px_45px_rgba(99,68,244,.2)]"
	>
		<div class="grid grid-cols-4">
			{#each metrics as metric, index (metric.label)}
				{@const Icon = icons[index]}
				<div class="flex items-center justify-center gap-4 border-r border-white/20 last:border-0">
					<div class="grid size-12 place-items-center rounded-full bg-white/14">
						<Icon class="size-6" />
					</div>
					<div>
						<strong class="text-[22px]">{metric.value}</strong>
						<p class="mt-0.5 text-xs text-white/75">{metric.label}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
