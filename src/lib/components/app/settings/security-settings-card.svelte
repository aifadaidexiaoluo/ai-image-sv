<script lang="ts">
	import { enhance } from '$app/forms';
	import { KeyRound } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import type { SettingsPageData } from './types';
	import { deviceName, formatDate } from './types';

	let { data }: { data: SettingsPageData } = $props();
</script>

<div class="grid gap-5">
	<Card.Root>
		<Card.Header>
			<Card.Title>密码与会话</Card.Title>
			<Card.Description>修改密码会撤销其他设备上的登录状态。</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/changePassword" use:enhance class="grid gap-4 md:grid-cols-2">
				<label class="grid gap-2">
					<span class="text-sm font-bold">当前密码</span>
					<Input type="password" name="currentPassword" autocomplete="current-password" required />
				</label>
				<label class="grid gap-2">
					<span class="text-sm font-bold">新密码</span>
					<Input
						type="password"
						name="newPassword"
						autocomplete="new-password"
						minlength={12}
						required
					/>
				</label>
				<div class="flex flex-wrap gap-3 md:col-span-2">
					<Button type="submit"><KeyRound class="size-4" />修改密码</Button>
					<Button type="submit" formaction="?/sendPasswordReset" variant="outline"
						>发送重置邮件</Button
					>
					<Button type="submit" formaction="?/revokeOtherSessions" variant="outline"
						>退出其他设备</Button
					>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>登录设备</Card.Title>
			<Card.Description>查看并撤销当前账户的活跃会话。</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>设备</Table.Head>
						<Table.Head>IP</Table.Head>
						<Table.Head>过期时间</Table.Head>
						<Table.Head class="text-right">操作</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sessions as session (session.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{deviceName(session.userAgent)}</Table.Cell>
							<Table.Cell>{session.ipAddress ?? '未知'}</Table.Cell>
							<Table.Cell>{formatDate(session.expiresAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<form method="POST" action="?/revokeSession" use:enhance>
									<input type="hidden" name="token" value={session.token} />
									<Button type="submit" variant="outline" size="sm">撤销</Button>
								</form>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
