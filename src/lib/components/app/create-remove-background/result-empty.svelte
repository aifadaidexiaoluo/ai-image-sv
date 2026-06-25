<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { ImagePlus } from '@lucide/svelte';
</script>

<Card.Root class="rounded-[18px] border border-dashed border-[#d6ddec] bg-white py-0 ring-0">
	<Card.Content class="grid gap-5 px-5 py-6 md:grid-cols-[220px_1fr] md:items-center">
		<div class="overflow-hidden rounded-[14px] bg-[#f7f8fc]">
			<img
				src="/images/app/create-remove-background/example-workflow.png"
				alt="抠图流程示例"
				class="aspect-square size-full object-cover"
			/>
		</div>
		<div>
			<Badge variant="secondary" class="rounded-full px-3 py-1">
				<ImagePlus class="size-3.5" />等待任务
			</Badge>
			<h2 class="mt-4 text-[18px] font-black text-[#121826]">结果会在这里实时更新</h2>
			<p class="mt-2 max-w-xl text-[14px] font-medium leading-6 text-[#65708a]">
				提交抠图任务后，处理进度和透明 PNG
				结果会通过任务卡片展示。下载入口以生成结果为准，不会下载本地源图。
			</p>
		</div>
	</Card.Content>
</Card.Root>
