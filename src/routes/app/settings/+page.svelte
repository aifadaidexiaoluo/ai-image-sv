<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Avatar from '$lib/components/ui/avatar';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let previewUrl = $state<string | null>(null);
	const initials = $derived(
		data.user.name
			.trim()
			.split(/\s+/)
			.map((part) => part[0])
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

<svelte:head><title>账户设置 - DesignAI</title></svelte:head>
<h1 class="text-2xl font-bold">账户设置</h1>
<p class="mt-1 text-sm text-muted-foreground">管理资料、密码和登录安全。</p>
<div class="mt-6 grid max-w-3xl gap-6">
	<form
		method="POST"
		action="?/profile"
		enctype="multipart/form-data"
		use:enhance
		class="rounded-2xl border bg-white p-6"
	>
		<h2 class="font-semibold">个人资料</h2>
		<div class="mt-5 flex flex-wrap items-center gap-4">
			<Avatar.Root class="size-16">
				<Avatar.Image src={previewUrl ?? data.user.image ?? undefined} alt={data.user.name} />
				<Avatar.Fallback class="text-base font-semibold">{initials}</Avatar.Fallback>
			</Avatar.Root>
			<div>
				<label
					class="inline-flex h-10 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium hover:bg-muted"
				>
					选择头像
					<input
						class="sr-only"
						type="file"
						name="avatar"
						accept="image/jpeg,image/png,image/webp"
						onchange={previewAvatar}
					/>
				</label>
				<p class="mt-1.5 text-xs text-muted-foreground">JPG、PNG 或 WebP，最大 2 MB</p>
			</div>
		</div>
		<label class="mt-5 block text-sm font-medium"
			>名称<input
				name="name"
				value={form?.name ?? data.user.name}
				minlength="2"
				maxlength="60"
				required
				class="mt-2 h-11 w-full rounded-xl border px-3"
			/></label
		><label class="mt-4 block text-sm font-medium"
			>个人简介<textarea
				name="bio"
				maxlength="200"
				rows="4"
				placeholder="简单介绍一下自己"
				class="mt-2 w-full resize-none rounded-xl border px-3 py-2.5"
				>{form?.bio ?? data.user.bio ?? ''}</textarea
			></label
		><label class="mt-4 block text-sm font-medium"
			>邮箱<input
				value={data.user.email}
				disabled
				class="mt-2 h-11 w-full rounded-xl border bg-muted px-3"
			/></label
		>{#if form?.message}<p class="mt-3 text-sm text-destructive">
				{form.message}
			</p>{/if}{#if form?.success}<p class="mt-3 text-sm text-emerald-600">资料已更新</p>{/if}
		<div class="mt-5 flex flex-wrap gap-3">
			<button class="h-11 rounded-xl bg-primary px-5 font-semibold text-white">保存修改</button
			>{#if data.user.image}<button
					type="submit"
					formaction="?/removeAvatar"
					formenctype="application/x-www-form-urlencoded"
					class="h-11 rounded-xl border px-5 font-medium text-destructive hover:bg-destructive/5"
					>删除头像</button
				>{/if}
		</div>
	</form>
	<form method="POST" action="?/password" use:enhance class="rounded-2xl border bg-white p-6">
		<h2 class="font-semibold">密码安全</h2>
		<p class="mt-2 text-sm text-muted-foreground">
			发送密码重置邮件。修改成功后，其他设备上的会话会被撤销。
		</p>
		{#if form?.passwordSent}<p class="mt-3 text-sm text-emerald-600">重置邮件已发送</p>{/if}<button
			class="mt-5 h-11 rounded-xl border px-5 font-medium">发送重置邮件</button
		>
	</form>
</div>
