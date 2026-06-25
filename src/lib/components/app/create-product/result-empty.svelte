<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { ImagePlus } from '@lucide/svelte';
</script>

<Card.Root class="rounded-[18px] border border-dashed border-[#d6ddec] bg-white py-0 ring-0">
	<Card.Content class="grid min-h-48 place-items-center px-6 py-8 text-center text-[#65708a]">
		<div>
			<ImagePlus class="mx-auto size-10 text-primary/40" />
			<p class="mt-3 text-sm font-medium">提交任务后，处理阶段和结果会在这里实时更新。</p>
		</div>
	</Card.Content>
</Card.Root>
