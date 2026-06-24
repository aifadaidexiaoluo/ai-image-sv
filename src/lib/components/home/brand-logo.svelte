<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { compact = false }: { compact?: boolean } = $props();
</script>

<a href="/" class="inline-flex items-center gap-2.5" aria-label={m.home_brand()}>
	<span
		class="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#7759ff] to-[#4d2bea] shadow-[0_7px_18px_rgba(91,61,245,0.28)]"
	>
		<span class="absolute -left-2 size-7 rounded-full border-[7px] border-white/90"></span>
		<span class="absolute left-[15px] h-5 w-2.5 rounded-r-full bg-white/95"></span>
	</span>
	{#if !compact}
		<span class="text-[21px] font-bold tracking-[-0.04em] text-[#111827]">{m.home_brand()}</span>
	{/if}
</a>
