<script lang="ts">
	import { cn } from '$lib/utils';

	export type ProductPosition =
		| 'top-left'
		| 'top'
		| 'top-right'
		| 'left'
		| 'center'
		| 'right'
		| 'bottom-left'
		| 'bottom'
		| 'bottom-right';

	const positions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	] satisfies ProductPosition[];

	let {
		value,
		onChange
	}: {
		value: ProductPosition;
		onChange: (position: ProductPosition) => void;
	} = $props();
</script>

<div class="grid w-[92px] grid-cols-3 gap-1.5">
	{#each positions as position (position)}
		<button
			type="button"
			aria-label={position}
			onclick={() => onChange(position)}
			class={cn(
				'size-[26px] rounded-[7px] border transition',
				value === position
					? 'border-primary bg-primary shadow-[0_8px_14px_rgba(91,61,245,0.22)]'
					: 'border-[#dce2f1] bg-white hover:border-primary/50'
			)}
		></button>
	{/each}
</div>
