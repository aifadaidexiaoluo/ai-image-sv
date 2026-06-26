<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, SlidersHorizontal, Upload } from '@lucide/svelte';
	import AssetSelect from './asset-select.svelte';
	import type { AssetOption } from './types';

	let {
		keyword = $bindable(''),
		sort = $bindable('latest'),
		sortOptions,
		onApply,
		onUpload
	}: {
		keyword: string;
		sort: string;
		sortOptions: AssetOption[];
		onApply: () => void;
		onUpload: () => void;
	} = $props();
</script>

<div class="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">素材库</h1>
		<p class="mt-2 text-sm text-[#65708a]">管理上传素材、生成结果和私有场景模板</p>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				onApply();
			}}
			class="flex flex-wrap items-center gap-2"
		>
			<label class="relative block w-72">
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a94ad]"
				/>
				<Input
					bind:value={keyword}
					class="h-10 border-[#dde2f2] bg-white pr-3 pl-9 text-sm font-medium text-[#30405f] shadow-sm placeholder:text-[#a8b1c5]"
					placeholder="搜索名称或标签"
				/>
			</label>
			<AssetSelect
				bind:value={sort}
				options={sortOptions}
				placeholder="按最新"
				class="h-10 w-28 rounded-xl border-[#dde2f2] bg-white font-bold text-[#65708a]"
				onChange={onApply}
			/>
			<Button type="submit" variant="outline" class="h-10 border-[#dde2f2] bg-white">
				<SlidersHorizontal class="size-4" />筛选
			</Button>
		</form>
		<Button class="h-10 px-4 font-bold" onclick={onUpload}>
			<Upload class="size-4" />上传素材
		</Button>
	</div>
</div>
