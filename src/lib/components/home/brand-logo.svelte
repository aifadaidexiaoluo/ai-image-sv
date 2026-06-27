<script lang="ts">
	import { resolve } from '$app/paths';
	import LogoMark from '$lib/components/brand/logo-mark.svelte';
	import * as m from '$lib/paraglide/messages';

	let { compact = false }: { compact?: boolean } = $props();
</script>

<a href={resolve('/')} class="inline-flex items-center gap-2.5" aria-label={m.home_brand()}>
	<LogoMark class="size-9 drop-shadow-[0_7px_14px_rgba(91,61,245,0.28)]" />
	{#if !compact}
		<span class="text-[21px] font-bold tracking-[-0.04em] text-[#111827]">{m.home_brand()}</span>
	{/if}
</a>
