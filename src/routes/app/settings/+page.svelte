<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ChevronRight,
		Copy,
		KeyRound,
		Lock,
		Monitor,
		ShieldCheck,
		Trash2,
		Upload
	} from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let previewUrl = $state<string | null>(null);
	let activeTab = $state('profile');
	const tabs = [
		['profile', '基本信息'],
		['security', '安全设置'],
		['notice', '通知设置'],
		['preference', '偏好设置'],
		['team', '团队管理'],
		['api', 'API 管理'],
		['billing', '账号与账单']
	];
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
<h1 class="text-3xl font-black text-[#121826]">账户设置</h1>
<p class="mt-2 text-sm text-[#65708a]">管理您的账户信息、偏好设置与安全</p>

<div class="mt-8 flex flex-wrap gap-8 border-b border-[#dfe3f2]">
	{#each tabs as [id, label]}
		<button
			onclick={() => (activeTab = id)}
			class={`border-b-2 pb-4 text-sm font-black ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-[#65708a]'}`}
			>{label}</button
		>
	{/each}
</div>

<div class="mt-6 grid gap-5 xl:grid-cols-[1fr_420px]">
	<section class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
		{#if activeTab === 'profile'}
			<form method="POST" action="?/profile" enctype="multipart/form-data" use:enhance>
				<h2 class="text-xl font-black text-[#121826]">基本信息</h2>
				<div class="mt-7 grid gap-5">
					<div class="grid gap-4 md:grid-cols-[120px_1fr] md:items-center">
						<span class="text-sm font-black text-[#172033]">头像</span>
						<div class="flex flex-wrap items-center gap-5">
							<Avatar.Root class="size-20">
								<Avatar.Image
									src={previewUrl ?? data.user.image ?? undefined}
									alt={data.user.name}
								/>
								<Avatar.Fallback class="text-base font-black">{initials}</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<label
									class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#dde2f2] px-4 text-sm font-bold text-[#65708a] hover:bg-[#f7f8fc]"
									><Upload class="size-4" />更换头像<input
										class="sr-only"
										type="file"
										name="avatar"
										accept="image/jpeg,image/png,image/webp"
										onchange={previewAvatar}
									/></label
								>
								<p class="mt-2 text-xs text-[#65708a]">支持 JPG、PNG 格式，大小不超过 2MB</p>
							</div>
						</div>
					</div>
					<label class="grid gap-3 md:grid-cols-[120px_1fr] md:items-center"
						><span class="text-sm font-black text-[#172033]">用户名</span><input
							name="name"
							value={form?.name ?? data.user.name}
							minlength="2"
							maxlength="60"
							required
							class="h-12 rounded-xl border border-[#cfd6ea] px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
						/></label
					>
					<div class="grid gap-3 md:grid-cols-[120px_1fr] md:items-center">
						<span class="text-sm font-black text-[#172033]">邮箱</span><span
							class="flex h-12 items-center justify-between rounded-xl border border-[#cfd6ea] px-4 text-sm text-[#172033]"
							>{data.user.email}<em
								class="rounded-lg bg-emerald-50 px-3 py-1 not-italic text-emerald-600">已验证</em
							></span
						>
					</div>
					<div class="grid gap-3 md:grid-cols-[120px_1fr] md:items-center">
						<span class="text-sm font-black text-[#172033]">手机号码</span><span
							class="flex h-12 items-center justify-between rounded-xl border border-[#cfd6ea] px-4 text-sm text-[#172033]"
							>138 **** 5678<em
								class="rounded-lg bg-emerald-50 px-3 py-1 not-italic text-emerald-600">已验证</em
							></span
						>
					</div>
					<label class="grid gap-3 md:grid-cols-[120px_1fr]"
						><span class="pt-3 text-sm font-black text-[#172033]">个人简介</span><textarea
							name="bio"
							maxlength="200"
							rows="5"
							class="resize-none rounded-xl border border-[#cfd6ea] px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
							>{form?.bio ?? data.user.bio ?? ''}</textarea
						></label
					>
					<label class="grid gap-3 md:grid-cols-[120px_1fr] md:items-center"
						><span class="text-sm font-black text-[#172033]">所在时区</span><select
							class="h-12 rounded-xl border border-[#cfd6ea] px-4"
							><option>(GMT+08:00) 北京，重庆，香港，乌鲁木齐</option></select
						></label
					>
				</div>
				{#if form?.message}<p class="mt-4 text-sm font-medium text-red-600">{form.message}</p>{/if}
				{#if form?.success}<p class="mt-4 text-sm font-medium text-emerald-600">资料已更新</p>{/if}
				<div class="mt-7 flex flex-wrap gap-3">
					<button
						class="h-11 rounded-xl bg-primary px-7 font-black text-white shadow-lg shadow-primary/20"
						>保存更改</button
					>
					{#if data.user.image}<button
							type="submit"
							formaction="?/removeAvatar"
							formenctype="application/x-www-form-urlencoded"
							class="h-11 rounded-xl border border-red-200 px-5 font-bold text-red-600 hover:bg-red-50"
							>删除头像</button
						>{/if}
				</div>
			</form>
		{:else if activeTab === 'security'}
			<form method="POST" action="?/password" use:enhance>
				<h2 class="text-xl font-black text-[#121826]">安全设置</h2>
				<p class="mt-2 text-sm text-[#65708a]">
					发送密码重置邮件。修改成功后，其他设备上的会话会被撤销。
				</p>
				{#if form?.passwordSent}<p class="mt-4 text-sm font-medium text-emerald-600">
						重置邮件已发送
					</p>{/if}
				<button
					class="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-black text-white"
					><KeyRound class="size-4" />发送重置邮件</button
				>
			</form>
		{:else}
			<div class="grid min-h-96 place-items-center text-center">
				<div>
					<Lock class="mx-auto mb-4 size-10 text-primary/45" />
					<h2 class="text-xl font-black text-[#121826]">功能建设中</h2>
					<p class="mt-2 text-sm text-[#65708a]">该模块入口已预留，第一版暂不提供可操作功能。</p>
				</div>
			</div>
		{/if}
	</section>

	<aside class="space-y-5">
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
			<h2 class="text-xl font-black text-[#121826]">账户信息</h2>
			<div class="mt-5 space-y-4 text-sm">
				<div class="flex justify-between">
					<span class="text-[#65708a]">注册时间</span><span
						>{new Date(data.user.createdAt).toLocaleString('zh-CN')}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">账户 ID</span><span class="inline-flex items-center gap-2"
						>dsgn_{data.user.id.slice(0, 12)}<Copy class="size-4 text-primary" /></span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">账户类型</span><span
						class="rounded-lg bg-primary/10 px-2 py-1 text-primary">专业版</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-[#65708a]">当前套餐</span><span>专业版（按月付费）</span>
				</div>
			</div>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
			<h2 class="text-xl font-black text-[#121826]">账户安全评分</h2>
			<div class="mt-5 flex items-center gap-6">
				<div
					class="grid size-24 place-items-center rounded-full border-8 border-emerald-500 text-3xl font-black text-[#121826]"
				>
					92
				</div>
				<div>
					<p class="font-black text-emerald-600">安全等级：优秀</p>
					<p class="mt-2 text-sm text-[#65708a]">继续保持良好的安全习惯，保障账户安全。</p>
					<button
						onclick={() => (activeTab = 'security')}
						class="mt-3 text-sm font-black text-primary">前往安全设置 →</button
					>
				</div>
			</div>
		</section>
		<section class="rounded-2xl border border-[#e1e5f2] bg-white p-6 shadow-sm">
			<h2 class="text-xl font-black text-[#121826]">快捷操作</h2>
			<div class="mt-4 divide-y divide-[#eef1f7]">
				<button
					onclick={() => (activeTab = 'security')}
					class="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-[#172033]"
					><span class="inline-flex items-center gap-3"
						><KeyRound class="size-5 text-primary" />修改密码</span
					><ChevronRight class="size-4" /></button
				>
				<button
					class="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-[#172033]"
					><span class="inline-flex items-center gap-3"
						><Monitor class="size-5 text-primary" />管理登录设备</span
					><ChevronRight class="size-4" /></button
				>
				<button
					class="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-[#172033]"
					><span class="inline-flex items-center gap-3"
						><ShieldCheck class="size-5 text-primary" />导出我的数据</span
					><ChevronRight class="size-4" /></button
				>
				<button
					class="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-red-600"
					><span class="inline-flex items-center gap-3"><Trash2 class="size-5" />注销账户</span
					><ChevronRight class="size-4" /></button
				>
			</div>
		</section>
	</aside>
</div>
