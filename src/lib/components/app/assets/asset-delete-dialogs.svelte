<script lang="ts">
	import { enhance } from '$app/forms';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { AssetItem } from './types';

	let {
		deleteTarget = $bindable<AssetItem | undefined>(),
		bulkOpen = $bindable(false),
		selectedIds
	}: {
		deleteTarget?: AssetItem;
		bulkOpen: boolean;
		selectedIds: string[];
	} = $props();

	const selectedIdText = $derived(selectedIds.join(','));
</script>

<AlertDialog.Root
	open={Boolean(deleteTarget)}
	onOpenChange={(open) => !open && (deleteTarget = undefined)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>删除素材</AlertDialog.Title>
			<AlertDialog.Description>
				删除后该素材将从素材库隐藏，并从存储中移除。
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>取消</AlertDialog.Cancel>
			{#if deleteTarget}
				<form
					method="POST"
					action="?/deleteAsset"
					use:enhance={() =>
						({ update }) =>
							update()}
				>
					<input type="hidden" name="id" value={deleteTarget.id} />
					<AlertDialog.Action type="submit" onclick={() => (deleteTarget = undefined)}
						>删除</AlertDialog.Action
					>
				</form>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={bulkOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>批量删除素材</AlertDialog.Title>
			<AlertDialog.Description>
				将删除已选择的 {selectedIds.length} 个素材，并从存储中移除对应文件。
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>取消</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/bulkDelete"
				use:enhance={() =>
					({ update }) =>
						update()}
			>
				<input type="hidden" name="ids" value={selectedIdText} />
				<AlertDialog.Action type="submit" onclick={() => (bulkOpen = false)}
					>删除</AlertDialog.Action
				>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
