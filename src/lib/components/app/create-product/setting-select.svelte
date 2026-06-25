<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';

	type Option = {
		value: string;
		label: string;
	};

	let {
		label,
		value,
		options,
		onChange
	}: {
		label: string;
		value: string;
		options: Option[];
		onChange: (value: string) => void;
	} = $props();

	const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? value);
</script>

<Label
	class="group block rounded-xl border border-[#dfe5f4] bg-white p-4 shadow-[0_10px_24px_rgba(31,42,84,0.04)] transition hover:border-primary/35"
>
	<span class="block text-[13px] font-black text-[#172033]">{label}</span>
	<Select.Root type="single" {value} onValueChange={onChange}>
		<Select.Trigger
			class="mt-3 h-10 w-full rounded-[9px] border-[#d3dbef] bg-[#fbfcff] px-3 text-[14px] font-bold text-[#30405f] group-hover:border-primary/40"
		>
			{selectedLabel}
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option.value)}
				<Select.Item value={option.value}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</Label>
