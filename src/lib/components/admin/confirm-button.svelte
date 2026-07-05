<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';

	let {
		label,
		message,
		class: className = '',
		variant = 'default',
		size = 'default'
	}: {
		label: string;
		message: string;
		class?: string;
		variant?: ButtonProps['variant'];
		size?: ButtonProps['size'];
	} = $props();

	function confirmSubmit(event: MouseEvent) {
		if (!confirm(message)) event.preventDefault();
	}
</script>

<Button class={className} type="submit" onclick={confirmSubmit} {variant} {size}>
	{label}
</Button>
