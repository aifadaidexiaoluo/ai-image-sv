<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import PaginationBar from '$lib/components/admin/pagination-bar.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import * as Table from '$lib/components/ui/table';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const defaultParameters = '{"aspectRatio":"1:1"}';
</script>

<svelte:head><title>模板管理 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">模板管理</h1>
<p class="mt-2 text-sm text-[#667085]">管理公共模板的发布状态、排序和 prompt preset。</p>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<section class="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
	<Card.Root class="p-0 shadow-sm">
		<Card.Content class="p-0">
			<form class="grid gap-3 border-b p-4 md:grid-cols-[1fr_160px_150px_120px]" method="GET">
				<Input name="keyword" value={data.filters.keyword} placeholder="搜索模板名" />
				<NativeSelect.Root name="tool" value={data.filters.tool} class="w-full">
					<NativeSelect.Option value="all">全部工具</NativeSelect.Option>
					<NativeSelect.Option value="product">商品图</NativeSelect.Option>
					<NativeSelect.Option value="scene">场景图</NativeSelect.Option>
					<NativeSelect.Option value="remove-background">智能抠图</NativeSelect.Option>
				</NativeSelect.Root>
				<NativeSelect.Root name="published" value={data.filters.published} class="w-full">
					<NativeSelect.Option value="all">全部状态</NativeSelect.Option>
					<NativeSelect.Option value="true">已发布</NativeSelect.Option>
					<NativeSelect.Option value="false">未发布</NativeSelect.Option>
				</NativeSelect.Root>
				<Button type="submit" size="lg">筛选</Button>
			</form>
			<div class="overflow-x-auto">
				<Table.Root class="min-w-[900px]">
					<Table.Header>
						<Table.Row>
							<Table.Head>模板</Table.Head>
							<Table.Head>工具</Table.Head>
							<Table.Head>分类</Table.Head>
							<Table.Head>排序</Table.Head>
							<Table.Head>状态</Table.Head>
							<Table.Head class="text-right">操作</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.items as row (row.template.id)}
							<Table.Row>
								<Table.Cell>
									<p class="font-bold">{row.template.name}</p>
									<p class="mt-1 text-xs text-[#667085]">{row.template.slug}</p>
								</Table.Cell>
								<Table.Cell>{row.template.tool}</Table.Cell>
								<Table.Cell>{row.template.category}</Table.Cell>
								<Table.Cell>{row.template.sortOrder}</Table.Cell>
								<Table.Cell>
									<StatusBadge value={row.template.published ? 'published' : 'draft'} />
								</Table.Cell>
								<Table.Cell>
									<div class="flex justify-end">
										{#if row.template.published}
											<form method="POST" action="?/unpublishTemplate" use:enhance>
												<input type="hidden" name="id" value={row.template.id} />
												<ConfirmButton
													label="下架"
													message="确定下架该模板？"
													variant="destructive"
													size="sm"
												/>
											</form>
										{:else}
											<form method="POST" action="?/publishTemplate" use:enhance>
												<input type="hidden" name="id" value={row.template.id} />
												<ConfirmButton
													label="发布"
													message="确定发布该模板？"
													variant="outline"
													size="sm"
												/>
											</form>
										{/if}
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<PaginationBar page={data.page} totalPages={data.totalPages} total={data.total} />
		</Card.Content>
	</Card.Root>

	<Card.Root class="shadow-sm">
		<Card.Header>
			<Card.Title>新增 / 更新模板</Card.Title>
			<Card.Description>填写 ID 时更新已有模板；留空则创建新模板。</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/saveTemplate" use:enhance>
				<Field.Group>
					<Field.Field>
						<Field.Label for="template-id">模板 ID</Field.Label>
						<Input id="template-id" name="id" placeholder="更新时填写" />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-slug">Slug</Field.Label>
						<Input id="template-slug" name="slug" placeholder="slug" required />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-name">模板名称</Field.Label>
						<Input id="template-name" name="name" placeholder="模板名称" required />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-description">描述</Field.Label>
						<Textarea id="template-description" name="description" placeholder="描述" required />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-tool">工具</Field.Label>
						<NativeSelect.Root id="template-tool" name="tool" class="w-full">
							<NativeSelect.Option value="product">商品图</NativeSelect.Option>
							<NativeSelect.Option value="scene">场景图</NativeSelect.Option>
							<NativeSelect.Option value="remove-background">智能抠图</NativeSelect.Option>
						</NativeSelect.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-category">分类</Field.Label>
						<Input id="template-category" name="category" placeholder="分类" required />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-preview">预览素材 ID</Field.Label>
						<Input id="template-preview" name="previewAssetId" placeholder="可选" />
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-prompt">Prompt preset</Field.Label>
						<Textarea
							id="template-prompt"
							name="promptPreset"
							placeholder="Prompt preset"
							required
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-parameters">Parameters JSON</Field.Label>
						<Textarea
							id="template-parameters"
							name="parameters"
							value={defaultParameters}
							class="font-mono text-xs"
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label for="template-sort">排序</Field.Label>
						<Input id="template-sort" name="sortOrder" type="number" value="0" />
					</Field.Field>
					<label class="flex items-center gap-2 text-sm font-bold">
						<input type="checkbox" name="published" /> 发布
					</label>
					<ConfirmButton label="保存模板" message="确定保存模板？" class="w-full" size="lg" />
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</section>
