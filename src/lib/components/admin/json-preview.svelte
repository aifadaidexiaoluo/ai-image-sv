<script lang="ts">
	let { value }: { value: unknown } = $props();
	const formatted = $derived(JSON.stringify(value ?? {}, null, 2));
</script>

<pre
	class="max-h-96 overflow-auto rounded-xl bg-[#111827] p-4 text-xs leading-5 text-white">{formatted}</pre>
