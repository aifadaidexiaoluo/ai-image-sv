<script lang="ts">
	let { step, children }: { step: number; children: import('svelte').Snippet } = $props();
</script>

<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
	<span
		class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
		>{step}</span
	>
	{@render children()}
</h2>
