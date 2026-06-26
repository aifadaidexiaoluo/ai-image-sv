<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Star, Trash2 } from '@lucide/svelte';

	let {
		selectedIds,
		onClear,
		onDelete
	}: {
		selectedIds: string[];
		onClear: () => void;
		onDelete: () => void;
	} = $props();

	const selectedIdText = $derived(selectedIds.join(','));
</script>

{#if selectedIds.length}
	<div
		class="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-bold text-primary"
	>
		<span>已选择 {selectedIds.length} 个素材</span>
		<form
			method="POST"
			action="?/bulkFavorite"
			use:enhance={() =>
				({ update }) =>
					update()}
		>
			<input type="hidden" name="ids" value={selectedIdText} />
			<Button
				type="submit"
				size="sm"
				variant="outline"
				class="border-primary/30 bg-white text-primary"
			>
				<Star class="size-4" />批量收藏
			</Button>
		</form>
		<Button type="button" size="sm" variant="destructive" onclick={onDelete}>
			<Trash2 class="size-4" />批量删除
		</Button>
		<Button type="button" size="sm" variant="ghost" onclick={onClear}>取消选择</Button>
	</div>
{/if}
