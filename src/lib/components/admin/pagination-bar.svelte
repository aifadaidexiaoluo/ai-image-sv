<script lang="ts">
	import { resolve } from '$app/paths';
	import { page as pageState } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	let {
		page,
		totalPages,
		total
	}: {
		page: number;
		totalPages: number;
		total: number;
	} = $props();

	function href(nextPage: number) {
		const params = [...pageState.url.searchParams.entries()].filter(([key]) => key !== 'page');
		params.push(['page', String(nextPage)]);
		const query = params
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');
		return resolve(`${pageState.url.pathname}?${query}` as '/admin');
	}
</script>

<div class="flex items-center justify-between gap-3 border-t border-[#eef1f7] px-4 py-3 text-sm">
	<p class="text-[#667085]">共 {total} 条，第 {page} / {totalPages} 页</p>
	<div class="flex items-center gap-2">
		<Button
			variant="outline"
			size="sm"
			href={page > 1 ? href(page - 1) : undefined}
			disabled={page <= 1}>上一页</Button
		>
		<Button
			variant="outline"
			size="sm"
			href={page < totalPages ? href(page + 1) : undefined}
			disabled={page >= totalPages}>下一页</Button
		>
	</div>
</div>
