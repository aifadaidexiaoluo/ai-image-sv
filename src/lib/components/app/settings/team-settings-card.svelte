<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import * as Table from '$lib/components/ui/table';
	import type { SettingsPageData } from './types';
	import { formatDate } from './types';

	let { data }: { data: SettingsPageData } = $props();
	const activeOrganization = $derived(data.activeOrganization);
	const activeOrganizationId = $derived(activeOrganization?.id ?? data.organizations[0]?.id ?? '');
	const activeMember = $derived(
		activeOrganization?.members?.find(
			(member: { userId: string }) => member.userId === data.user.id
		)
	);
	const canManageTeam = $derived(activeMember?.role === 'owner' || activeMember?.role === 'admin');
</script>

<div class="grid gap-5">
	<Card.Root>
		<Card.Header>
			<Card.Title>团队</Card.Title>
			<Card.Description>创建或切换团队，并管理成员邀请。</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<form method="POST" action="?/setActiveOrganization" use:enhance class="flex flex-wrap gap-3">
				<NativeSelect.Root name="organizationId" value={activeOrganizationId} class="min-w-64">
					{#each data.organizations as org (org.id)}
						<option value={org.id}>{org.name}</option>
					{/each}
				</NativeSelect.Root>
				<Button type="submit" variant="outline">切换团队</Button>
			</form>
			<form
				method="POST"
				action="?/createOrganization"
				use:enhance
				class="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
			>
				<Input name="name" placeholder="团队名称" required />
				<Input name="slug" placeholder="团队标识，例如 studio-a" />
				<Button type="submit"><Plus class="size-4" />创建团队</Button>
			</form>
		</Card.Content>
	</Card.Root>

	{#if activeOrganization}
		<Card.Root>
			<Card.Header>
				<Card.Title>{activeOrganization.name}</Card.Title>
				<Card.Description
					>{activeOrganization.slug} · {activeOrganization.members.length} 位成员</Card.Description
				>
			</Card.Header>
			<Card.Content class="grid gap-5">
				<form
					method="POST"
					action="?/inviteMember"
					use:enhance
					class="grid gap-3 md:grid-cols-[1fr_160px_auto]"
				>
					<input type="hidden" name="organizationId" value={activeOrganization.id} />
					<Input
						name="email"
						type="email"
						placeholder="成员邮箱"
						disabled={!canManageTeam}
						required
					/>
					<NativeSelect.Root name="role" value="member" class="w-full">
						<option value="member">成员</option>
						<option value="admin">管理员</option>
					</NativeSelect.Root>
					<Button type="submit" disabled={!canManageTeam}>发送邀请</Button>
				</form>

				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>成员</Table.Head>
							<Table.Head>角色</Table.Head>
							<Table.Head>加入时间</Table.Head>
							<Table.Head class="text-right">操作</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each activeOrganization.members as member (member.id)}
							<Table.Row>
								<Table.Cell
									>{member.user?.name ?? member.userId}
									<p class="text-xs text-[#65708a]">{member.user?.email}</p></Table.Cell
								>
								<Table.Cell>
									<form method="POST" action="?/updateMemberRole" use:enhance class="flex gap-2">
										<input type="hidden" name="memberId" value={member.id} />
										<input type="hidden" name="organizationId" value={activeOrganization.id} />
										<NativeSelect.Root name="role" value={member.role} class="w-32">
											<option value="member">成员</option>
											<option value="admin">管理员</option>
											{#if member.role === 'owner'}<option value="owner">所有者</option>{/if}
										</NativeSelect.Root>
										<Button
											type="submit"
											size="sm"
											variant="outline"
											disabled={!canManageTeam || member.role === 'owner'}>保存</Button
										>
									</form>
								</Table.Cell>
								<Table.Cell>{formatDate(member.createdAt)}</Table.Cell>
								<Table.Cell class="text-right">
									<form method="POST" action="?/removeMember" use:enhance>
										<input type="hidden" name="memberIdOrEmail" value={member.id} />
										<input type="hidden" name="organizationId" value={activeOrganization.id} />
										<Button
											type="submit"
											size="sm"
											variant="destructive"
											disabled={!canManageTeam || member.role === 'owner'}>移除</Button
										>
									</form>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
