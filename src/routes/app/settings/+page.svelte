<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>账户设置 - DesignAI</title></svelte:head>
<h1 class="text-2xl font-bold">账户设置</h1>
<p class="mt-1 text-sm text-muted-foreground">管理资料、密码和登录安全。</p>
<div class="mt-6 grid max-w-3xl gap-6">
	<form method="POST" action="?/profile" use:enhance class="rounded-2xl border bg-white p-6">
		<h2 class="font-semibold">个人资料</h2>
		<label class="mt-5 block text-sm font-medium"
			>名称<input
				name="name"
				value={data.user.name}
				class="mt-2 h-11 w-full rounded-xl border px-3"
			/></label
		><label class="mt-4 block text-sm font-medium"
			>邮箱<input
				value={data.user.email}
				disabled
				class="mt-2 h-11 w-full rounded-xl border bg-muted px-3"
			/></label
		>{#if form?.success}<p class="mt-3 text-sm text-emerald-600">资料已更新</p>{/if}<button
			class="mt-5 h-11 rounded-xl bg-primary px-5 font-semibold text-white">保存修改</button
		>
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
