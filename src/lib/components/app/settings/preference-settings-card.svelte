<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { createForm } from '@tanstack/svelte-form';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import type { SettingsPageData } from './types';

	let { data }: { data: SettingsPageData } = $props();
	let message = $state('');

	const preferenceForm = createForm(() => ({
		defaultValues: {
			language: data.settings.language,
			defaultTool: data.settings.defaultTool,
			defaultImageCount: data.settings.defaultImageCount,
			defaultOutputFormat: data.settings.defaultOutputFormat
		},
		onSubmit: async ({ value }) => {
			const body = new FormData();
			for (const [key, item] of Object.entries(value)) body.set(key, String(item));
			const response = await fetch('?/preferences', { method: 'POST', body });
			message = response.ok ? '偏好设置已保存' : '保存失败，请稍后重试';
			if (response.ok) await invalidateAll();
		}
	}));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>偏好设置</Card.Title>
		<Card.Description>设置默认语言、生成工具和输出参数。</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				preferenceForm.handleSubmit();
			}}
			class="grid gap-5 md:grid-cols-2"
		>
			<preferenceForm.Field name="language">
				{#snippet children(field)}
					<label class="grid gap-2">
						<span class="text-sm font-bold">界面语言</span>
						<NativeSelect.Root
							value={field.state.value}
							onchange={(event) =>
								field.handleChange((event.currentTarget as HTMLSelectElement).value)}
							class="w-full"
						>
							<option value="zh-CN">简体中文</option>
							<option value="en-US">English</option>
						</NativeSelect.Root>
					</label>
				{/snippet}
			</preferenceForm.Field>
			<preferenceForm.Field name="defaultTool">
				{#snippet children(field)}
					<label class="grid gap-2">
						<span class="text-sm font-bold">默认工具</span>
						<NativeSelect.Root
							value={field.state.value}
							onchange={(event) =>
								field.handleChange((event.currentTarget as HTMLSelectElement).value)}
							class="w-full"
						>
							<option value="product">商品图生成</option>
							<option value="scene">场景图生成</option>
							<option value="remove-background">智能抠图</option>
						</NativeSelect.Root>
					</label>
				{/snippet}
			</preferenceForm.Field>
			<preferenceForm.Field name="defaultImageCount">
				{#snippet children(field)}
					<label class="grid gap-2">
						<span class="text-sm font-bold">默认生成数量</span>
						<Input
							type="number"
							min={1}
							max={8}
							value={field.state.value}
							oninput={(event) =>
								field.handleChange(Number((event.currentTarget as HTMLInputElement).value))}
						/>
					</label>
				{/snippet}
			</preferenceForm.Field>
			<preferenceForm.Field name="defaultOutputFormat">
				{#snippet children(field)}
					<label class="grid gap-2">
						<span class="text-sm font-bold">默认输出格式</span>
						<NativeSelect.Root
							value={field.state.value}
							onchange={(event) =>
								field.handleChange((event.currentTarget as HTMLSelectElement).value)}
							class="w-full"
						>
							<option value="png">PNG</option>
							<option value="jpg">JPG</option>
							<option value="webp">WebP</option>
						</NativeSelect.Root>
					</label>
				{/snippet}
			</preferenceForm.Field>
			<div class="flex items-center gap-3 md:col-span-2">
				<Button type="submit" class="w-fit">保存偏好设置</Button>
				{#if message}<p class="text-sm text-[#65708a]">{message}</p>{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>
