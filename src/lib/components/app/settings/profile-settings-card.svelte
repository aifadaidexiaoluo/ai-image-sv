<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { SettingsActionData, SettingsPageData } from './types';

	let { data, form }: { data: SettingsPageData; form: SettingsActionData } = $props();
	let previewUrl = $state<string | null>(null);
	const initials = $derived(
		data.user.name
			.trim()
			.split(/\s+/)
			.map((part: string) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	function previewAvatar(event: Event) {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		previewUrl = file ? URL.createObjectURL(file) : null;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>基本信息</Card.Title>
		<Card.Description>头像、显示名称和公开简介会用于工作台与团队协作。</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="POST"
			action="?/profile"
			enctype="multipart/form-data"
			use:enhance
			class="grid gap-5"
		>
			<div class="grid gap-4 md:grid-cols-[120px_1fr] md:items-center">
				<span class="text-sm font-black text-[#172033]">头像</span>
				<div class="flex flex-wrap items-center gap-5">
					<Avatar.Root class="size-20">
						<Avatar.Image src={previewUrl ?? data.user.image ?? undefined} alt={data.user.name} />
						<Avatar.Fallback class="text-base font-black">{initials}</Avatar.Fallback>
					</Avatar.Root>
					<div class="space-y-2">
						<Input
							type="file"
							name="avatar"
							accept="image/jpeg,image/png,image/webp"
							onchange={previewAvatar}
						/>
						<p class="text-xs text-[#65708a]">支持 JPG、PNG、WebP，大小不超过 2MB</p>
					</div>
				</div>
			</div>
			<label class="grid gap-2 md:grid-cols-[120px_1fr] md:items-center">
				<span class="text-sm font-black text-[#172033]">用户名</span>
				<Input
					name="name"
					value={form?.name ?? data.user.name}
					minlength={2}
					maxlength={60}
					required
				/>
			</label>
			<div class="grid gap-2 md:grid-cols-[120px_1fr] md:items-center">
				<span class="text-sm font-black text-[#172033]">邮箱</span>
				<div
					class="flex h-9 items-center justify-between rounded-lg border border-[#dfe3f2] px-3 text-sm"
				>
					{data.user.email}<Badge variant="secondary">已验证</Badge>
				</div>
			</div>
			<label class="grid gap-2 md:grid-cols-[120px_1fr]">
				<span class="pt-2 text-sm font-black text-[#172033]">个人简介</span>
				<Textarea name="bio" maxlength={200} rows={5} value={form?.bio ?? data.user.bio ?? ''} />
			</label>
			<label class="grid gap-2 md:grid-cols-[120px_1fr] md:items-center">
				<span class="text-sm font-black text-[#172033]">所在时区</span>
				<NativeSelect.Root name="timezone" value={data.settings.timezone} class="w-full">
					<option value="Asia/Shanghai">GMT+08:00 北京，上海，香港</option>
					<option value="Asia/Hong_Kong">GMT+08:00 香港</option>
					<option value="Asia/Tokyo">GMT+09:00 东京</option>
					<option value="UTC">UTC</option>
				</NativeSelect.Root>
			</label>
			<div class="flex flex-wrap gap-3 pt-2">
				<Button type="submit" size="lg">保存更改</Button>
				{#if data.user.image}
					<Button
						type="submit"
						formaction="?/removeAvatar"
						formenctype="application/x-www-form-urlencoded"
						variant="destructive"
						size="lg"
					>
						删除头像
					</Button>
				{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>
