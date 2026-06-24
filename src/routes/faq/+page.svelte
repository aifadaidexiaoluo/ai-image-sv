<script lang="ts">
	import InfoPage from '$lib/components/marketing/info-page.svelte';
	const questions = [
		['支持哪些图片格式？', '支持 JPG、PNG 和 WebP，单张最大 10 MB，最大尺寸 4096×4096。'],
		['失败会扣积分吗？', '任务创建时会预占积分，只按成功输出结算，失败或未完成部分自动退回。'],
		['生成时可以离开页面吗？', '可以。任务由独立 Worker 处理，返回历史记录后会继续显示实时进度。'],
		['原图会保留多久？', '上传原图默认保留 30 天，生成结果保留到你主动删除或注销账户。']
	];
</script>

<svelte:head><title>常见问题 - DesignAI</title></svelte:head>
<InfoPage
	eyebrow="帮助中心"
	title="常见问题"
	description="关于图片生成、积分、存储和账户安全的说明。"
	><div class="mx-auto max-w-3xl space-y-3">
		{#each questions as item}<details class="rounded-2xl border bg-white p-5">
				<summary class="cursor-pointer font-semibold">{item[0]}</summary>
				<p class="mt-3 text-sm leading-6 text-muted-foreground">{item[1]}</p>
			</details>{/each}
	</div></InfoPage
>
