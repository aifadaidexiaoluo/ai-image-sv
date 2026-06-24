<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<div class="min-h-screen bg-[#f7f7fc]">
	<header class="flex h-16 items-center justify-between border-b bg-white px-6">
		<a href="/admin" class="font-bold text-primary">DesignAI 管理后台</a><a
			href="/app"
			class="text-sm text-muted-foreground">返回工作台</a
		>
	</header>
	<main class="p-5 sm:p-8">{@render children()}</main>
</div>
