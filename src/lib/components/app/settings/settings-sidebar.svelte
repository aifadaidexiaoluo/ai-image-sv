<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import {
		AlertTriangle,
		Bell,
		ChevronRight,
		Copy,
		Download,
		KeyRound,
		Monitor,
		ShieldCheck,
		Trash2,
		Users
	} from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import type { SettingsPageData } from './types';
	import { formatDate } from './types';

	let {
		data,
		onSelectTab
	}: {
		data: SettingsPageData;
		onSelectTab: (tab: string) => void;
	} = $props();
</script>

<aside class="space-y-5">
	<Card.Root>
		<Card.Header>
			<Card.Title>账户信息</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4 text-sm">
			<div class="flex justify-between gap-4">
				<span class="text-[#65708a]">注册时间</span><span>{formatDate(data.user.createdAt)}</span>
			</div>
			<div class="flex justify-between gap-4">
				<span class="text-[#65708a]">账户 ID</span><span class="inline-flex items-center gap-2"
					>dsgn_{data.user.id.slice(0, 12)}<Copy class="size-4 text-primary" /></span
				>
			</div>
			<div class="flex justify-between gap-4">
				<span class="text-[#65708a]">账户类型</span><Badge>{data.account.planName}</Badge>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>安全评分</Card.Title>
		</Card.Header>
		<Card.Content class="flex items-center gap-5">
			<div
				class="grid size-20 place-items-center rounded-full border-8 border-emerald-500 text-2xl font-black"
			>
				92
			</div>
			<div>
				<p class="font-black text-emerald-600">安全等级：优秀</p>
				<p class="mt-1 text-sm text-[#65708a]">已启用邮箱验证和会话管理。</p>
				<Button variant="link" class="mt-2 px-0" onclick={() => onSelectTab('security')}
					>前往安全设置</Button
				>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>快捷操作</Card.Title>
		</Card.Header>
		<Card.Content class="divide-y divide-[#eef1f7] p-0">
			<button
				onclick={() => onSelectTab('security')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><KeyRound class="size-5 text-primary" />修改密码</span
				><ChevronRight class="size-4" />
			</button>
			<button
				onclick={() => onSelectTab('security')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><Monitor class="size-5 text-primary" />管理登录设备</span
				><ChevronRight class="size-4" />
			</button>
			<button
				onclick={() => onSelectTab('notice')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><Bell class="size-5 text-primary" />通知设置</span
				><ChevronRight class="size-4" />
			</button>
			<button
				onclick={() => onSelectTab('team')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><Users class="size-5 text-primary" />团队管理</span
				><ChevronRight class="size-4" />
			</button>
			<button
				onclick={() => onSelectTab('api')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><ShieldCheck class="size-5 text-primary" />API Key</span
				><ChevronRight class="size-4" />
			</button>
			<a
				href={resolve('/app/settings/export')}
				class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-[#172033]"
			>
				<span class="inline-flex items-center gap-3"
					><Download class="size-5 text-primary" />导出我的数据</span
				><ChevronRight class="size-4" />
			</a>
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-red-200">
		<Card.Header>
			<Card.Title class="text-red-600">危险操作</Card.Title>
			<Card.Description>注销账户会删除登录身份和相关账户数据。</Card.Description>
		</Card.Header>
		<Card.Content>
			<AlertDialog.Root>
				<AlertDialog.Trigger>
					<Button variant="destructive"><Trash2 class="size-4" />注销账户</Button>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>确认注销账户</AlertDialog.Title>
						<AlertDialog.Description
							>此操作不可撤销。请输入当前邮箱和密码完成确认。</AlertDialog.Description
						>
					</AlertDialog.Header>
					<form method="POST" action="?/deleteAccount" use:enhance class="grid gap-3">
						<Input name="confirmation" placeholder={data.user.email} required />
						<Input
							name="password"
							type="password"
							autocomplete="current-password"
							placeholder="当前密码"
							required
						/>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>取消</AlertDialog.Cancel>
							<Button type="submit" variant="destructive"
								><AlertTriangle class="size-4" />确认注销</Button
							>
						</AlertDialog.Footer>
					</form>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Card.Content>
	</Card.Root>
</aside>
