<script lang="ts">
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';

	let { value }: { value: string | boolean | null | undefined } = $props();
	const text = $derived(
		typeof value === 'boolean'
			? value
				? '是'
				: '否'
			: value === null || value === undefined
				? '-'
				: value
	);
	const tone = $derived.by(() => {
		if (['succeeded', 'paid', 'active', 'published', 'true', true].includes(value as never))
			return 'success';
		if (['failed', 'partial', 'canceled', 'banned', 'false'].includes(value as never))
			return 'danger';
		if (['queued', 'running', 'pending'].includes(value as never)) return 'warning';
		return 'neutral';
	});
	const variant = $derived.by<BadgeVariant>(() => {
		if (tone === 'danger') return 'destructive';
		if (tone === 'neutral') return 'secondary';
		return 'outline';
	});
</script>

<Badge {variant} class="font-bold" data-tone={tone}>{text}</Badge>
