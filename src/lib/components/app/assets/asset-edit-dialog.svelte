<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Check } from '@lucide/svelte';
	import AssetSelect from './asset-select.svelte';
	import type { AssetItem, AssetOption, MetadataValues } from './types';

	let {
		asset = $bindable<AssetItem | undefined>(),
		styleOptions,
		colorOptions,
		onSaved
	}: {
		asset?: AssetItem;
		styleOptions: AssetOption[];
		colorOptions: AssetOption[];
		onSaved: () => Promise<void>;
	} = $props();

	const form = createForm(() => ({
		defaultValues: {
			displayName: '',
			style: 'all',
			color: 'all',
			tags: ''
		} as MetadataValues,
		onSubmit: async ({ value }) => {
			await updateMetadata(value);
		}
	}));
	let editError = $state('');

	$effect(() => {
		if (!asset) return;
		editError = '';
		form.setFieldValue('displayName', asset.displayName || asset.fileName);
		form.setFieldValue('style', asset.style ?? 'all');
		form.setFieldValue('color', asset.color ?? 'all');
		form.setFieldValue('tags', asset.tags.join(', '));
	});

	async function updateMetadata(value: MetadataValues) {
		if (!asset) return;
		editError = '';
		const formData = new FormData();
		formData.set('id', asset.id);
		formData.set('displayName', value.displayName);
		formData.set('style', value.style === 'all' ? '' : value.style);
		formData.set('color', value.color === 'all' ? '' : value.color);
		formData.set('tags', value.tags);
		const response = await fetch('?/updateMetadata', { method: 'POST', body: formData });
		if (!response.ok) {
			editError = '素材信息保存失败';
			return;
		}
		asset = undefined;
		await onSaved();
	}
</script>

<Dialog.Root open={Boolean(asset)} onOpenChange={(open) => !open && (asset = undefined)}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>编辑素材信息</Dialog.Title>
			<Dialog.Description>名称、风格、颜色和标签会用于素材库筛选。</Dialog.Description>
		</Dialog.Header>
		{#if editError}
			<Alert variant="destructive"><AlertDescription>{editError}</AlertDescription></Alert>
		{/if}
		<form
			onsubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			class="space-y-4"
		>
			<form.Field
				name="displayName"
				validators={{ onChange: ({ value }) => (!value.trim() ? '请输入素材名称' : undefined) }}
			>
				{#snippet children(field)}
					<label class="space-y-1.5">
						<span class="text-sm font-bold text-[#65708a]">名称</span>
						<Input
							value={field.state.value}
							onblur={() => field.handleBlur()}
							oninput={(event) => field.handleChange((event.target as HTMLInputElement).value)}
						/>
					</label>
				{/snippet}
			</form.Field>
			<div class="grid gap-3 sm:grid-cols-2">
				<form.Field name="style">
					{#snippet children(field)}
						<label class="space-y-1.5">
							<span class="text-sm font-bold text-[#65708a]">风格</span>
							<AssetSelect
								value={field.state.value}
								options={styleOptions}
								placeholder="未设置"
								class="h-10 w-full rounded-lg border-[#dde2f2] bg-white"
								onChange={(value) => field.handleChange(value)}
							/>
						</label>
					{/snippet}
				</form.Field>
				<form.Field name="color">
					{#snippet children(field)}
						<label class="space-y-1.5">
							<span class="text-sm font-bold text-[#65708a]">颜色</span>
							<AssetSelect
								value={field.state.value}
								options={colorOptions}
								placeholder="未设置"
								class="h-10 w-full rounded-lg border-[#dde2f2] bg-white"
								onChange={(value) => field.handleChange(value)}
							/>
						</label>
					{/snippet}
				</form.Field>
			</div>
			<form.Field name="tags">
				{#snippet children(field)}
					<label class="space-y-1.5">
						<span class="text-sm font-bold text-[#65708a]">标签</span>
						<Input
							value={field.state.value}
							oninput={(event) => field.handleChange((event.target as HTMLInputElement).value)}
						/>
					</label>
				{/snippet}
			</form.Field>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (asset = undefined)}>取消</Button>
				<Button type="submit"><Check class="size-4" />保存</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
