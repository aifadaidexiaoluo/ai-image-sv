<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';

	let {
		title,
		description,
		checked,
		onchange
	}: {
		title: string;
		description: string;
		checked: boolean;
		onchange: (checked: boolean) => void;
	} = $props();
</script>

<div class="flex items-center justify-between gap-4 rounded-lg border border-[#e1e5f2] p-4">
	<div>
		<p class="font-bold text-[#121826]">{title}</p>
		<p class="mt-1 text-sm text-[#65708a]">{description}</p>
	</div>
	<Switch {checked} onclick={() => onchange(!checked)} />
</div>
