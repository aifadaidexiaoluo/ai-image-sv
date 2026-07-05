<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ConfirmButton from '$lib/components/admin/confirm-button.svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>{data.asset.displayName} - 素材详情</title></svelte:head>

<a href={resolve('/admin/assets')} class="text-sm font-bold text-primary">← 返回素材列表</a>

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{form.message}</p>
{/if}

<section class="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<img
			src={data.url}
			alt={data.asset.displayName}
			class="aspect-square w-full rounded-xl object-contain ring-1 ring-[#eef1f7]"
		/>
		<div class="mt-4 flex gap-2">
			{#if data.asset.deletedAt}
				<form method="POST" action="?/restoreAsset" use:enhance>
					<ConfirmButton
						label="恢复素材"
						message="确定恢复该素材？"
						class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white"
					/>
				</form>
			{:else}
				<form method="POST" action="?/deleteAsset" use:enhance>
					<ConfirmButton
						label="软删除素材"
						message="确定软删除该素材？"
						class="h-10 rounded-lg border px-4 text-sm font-bold text-red-600"
					/>
				</form>
			{/if}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-5 shadow-sm">
		<h1 class="text-2xl font-black text-[#121826]">{data.asset.displayName}</h1>
		<p class="mt-2 break-all text-sm text-[#667085]">{data.asset.objectKey}</p>
		<div class="mt-4 flex flex-wrap gap-2">
			<StatusBadge value={data.asset.kind} />
			<StatusBadge value={data.asset.deletedAt ? 'deleted' : 'active'} />
			{#if data.asset.favorite}<StatusBadge value="favorite" />{/if}
		</div>
		<dl class="mt-6 grid gap-3 text-sm sm:grid-cols-2">
			<div>
				<dt class="text-[#667085]">用户</dt>
				<dd>{data.user?.email ?? '系统素材'}</dd>
			</div>
			<div>
				<dt class="text-[#667085]">文件名</dt>
				<dd>{data.asset.fileName}</dd>
			</div>
			<div>
				<dt class="text-[#667085]">MIME</dt>
				<dd>{data.asset.mimeType}</dd>
			</div>
			<div>
				<dt class="text-[#667085]">尺寸</dt>
				<dd>{data.asset.width ?? '-'} × {data.asset.height ?? '-'}</dd>
			</div>
			<div>
				<dt class="text-[#667085]">风格</dt>
				<dd>{data.asset.style ?? '-'}</dd>
			</div>
			<div>
				<dt class="text-[#667085]">颜色</dt>
				<dd>{data.asset.color ?? '-'}</dd>
			</div>
		</dl>
	</div>
</section>

<section class="mt-5 grid gap-5 xl:grid-cols-2">
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">标签</h2>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each data.tags as tag (tag.id)}
				<span class="rounded-full bg-[#f4f2ff] px-3 py-1 text-xs font-bold text-primary"
					>{tag.tag}</span
				>
			{:else}
				<p class="text-sm text-[#667085]">暂无标签</p>
			{/each}
		</div>
	</div>
	<div class="rounded-xl border bg-white p-4 shadow-sm">
		<h2 class="font-black">关联任务</h2>
		<div class="mt-3 divide-y text-sm">
			{#each data.jobs as item (item.output.id)}
				<a href={resolve(`/admin/jobs/${item.job.id}`)} class="flex justify-between gap-4 py-2">
					<span>{item.job.tool}</span>
					<StatusBadge value={item.job.status} />
				</a>
			{:else}
				<p class="py-4 text-[#667085]">暂无关联任务</p>
			{/each}
		</div>
	</div>
</section>
