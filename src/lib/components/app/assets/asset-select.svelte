<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { AssetOption } from './types';

	let {
		value = $bindable('all'),
		options,
		placeholder,
		class: className = 'h-10 w-32 rounded-lg border-[#dde2f2] bg-white font-bold text-[#65708a]',
		onChange
	}: {
		value: string;
		options: AssetOption[];
		placeholder: string;
		class?: string;
		onChange?: (value: string) => void;
	} = $props();

	const selectedLabel = $derived(
		options.find((option) => option.value === value)?.label ?? placeholder
	);
</script>

<Select.Root
	type="single"
	{value}
	onValueChange={(next) => {
		value = next;
		onChange?.(next);
	}}
>
	<Select.Trigger class={className}>
		{selectedLabel}
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value}>{option.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
