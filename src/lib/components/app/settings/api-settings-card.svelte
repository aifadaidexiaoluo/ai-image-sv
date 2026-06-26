<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import type { SettingsActionData, SettingsPageData } from './types';
	import { formatDate } from './types';

	let { data, form }: { data: SettingsPageData; form: SettingsActionData } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>API 管理</Card.Title>
		<Card.Description>创建用于外部工作流的用户级 API Key。明文只会显示一次。</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-5">
		{#if form?.createdApiKey}
			<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
				<p class="font-black">请立即复制 API Key</p>
				<code class="mt-2 block break-all rounded bg-white p-3">{form.createdApiKey.key}</code>
			</div>
		{/if}
		<form
			method="POST"
			action="?/createApiKey"
			use:enhance
			class="grid gap-3 md:grid-cols-[1fr_180px_auto]"
		>
			<Input name="name" placeholder="密钥名称，例如 Zapier 工作流" required />
			<Input name="rateLimitMax" type="number" min={1} max={10000} value="120" />
			<Button type="submit"><Plus class="size-4" />创建 API Key</Button>
		</form>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>名称</Table.Head>
					<Table.Head>前缀</Table.Head>
					<Table.Head>请求数</Table.Head>
					<Table.Head>状态</Table.Head>
					<Table.Head class="text-right">操作</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.apiKeys as key (key.id)}
					<Table.Row>
						<Table.Cell class="font-medium"
							>{key.name ?? '未命名密钥'}
							<p class="text-xs text-[#65708a]">{formatDate(key.createdAt)}</p></Table.Cell
						>
						<Table.Cell>{key.prefix ?? 'dai'}...{key.start ?? ''}</Table.Cell>
						<Table.Cell>{key.requestCount}</Table.Cell>
						<Table.Cell
							><Badge variant={key.enabled ? 'secondary' : 'outline'}
								>{key.enabled ? '启用' : '停用'}</Badge
							></Table.Cell
						>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<form method="POST" action="?/toggleApiKey" use:enhance>
									<input type="hidden" name="keyId" value={key.id} />
									<input type="hidden" name="enabled" value={String(!key.enabled)} />
									<Button type="submit" size="sm" variant="outline"
										>{key.enabled ? '停用' : '启用'}</Button
									>
								</form>
								<form method="POST" action="?/deleteApiKey" use:enhance>
									<input type="hidden" name="keyId" value={key.id} />
									<Button type="submit" size="sm" variant="destructive">删除</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
