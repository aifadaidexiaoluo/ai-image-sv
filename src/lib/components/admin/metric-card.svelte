<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Component } from 'svelte';

	let {
		label,
		value,
		helper,
		icon: Icon
	}: {
		label: string;
		value: string | number;
		helper?: string;
		icon?: Component;
	} = $props();
</script>

<Card.Root class="p-0 shadow-sm">
	<Card.Content class="p-4">
		<div class="flex items-start justify-between gap-3">
			<div>
				<Card.Description>{label}</Card.Description>
				<strong class="mt-2 block text-2xl font-black text-foreground">{value}</strong>
			</div>
			{#if Icon}
				<div class="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
					<Icon />
				</div>
			{/if}
		</div>
		{#if helper}
			<p class="mt-3 text-xs font-medium text-muted-foreground">{helper}</p>
		{/if}
	</Card.Content>
</Card.Root>
