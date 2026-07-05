<script lang="ts">
	import PaginationBar from '$lib/components/admin/pagination-bar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>组织管理 - DesignAI</title></svelte:head>

<h1 class="text-2xl font-black text-[#121826]">组织管理</h1>
<p class="mt-2 text-sm text-[#667085]">查看组织、成员、团队和邀请规模。</p>

<form class="mt-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_120px]" method="GET">
	<input
		name="keyword"
		value={data.filters.keyword}
		placeholder="搜索组织名称"
		class="h-10 rounded-lg border px-3 text-sm"
	/>
	<button class="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">筛选</button>
</form>

<section class="mt-5 overflow-hidden rounded-xl border bg-white shadow-sm">
	<table class="w-full text-sm">
		<thead class="bg-[#f8f9fc] text-left text-xs text-[#667085]">
			<tr>
				<th class="px-4 py-3">组织</th>
				<th class="px-4 py-3">Slug</th>
				<th class="px-4 py-3">成员</th>
				<th class="px-4 py-3">团队</th>
				<th class="px-4 py-3">邀请</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each data.items as row (row.organization.id)}
				<tr>
					<td class="px-4 py-3 font-bold">{row.organization.name}</td>
					<td class="px-4 py-3 text-[#667085]">{row.organization.slug}</td>
					<td class="px-4 py-3">{row.members}</td>
					<td class="px-4 py-3">{row.teams}</td>
					<td class="px-4 py-3">{row.invitations}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<PaginationBar page={data.page} totalPages={data.totalPages} total={data.total} />
</section>
