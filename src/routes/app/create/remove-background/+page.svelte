<script lang="ts">
	import GenerationForm from '$lib/components/app/generation-form.svelte';
</script>

<GenerationForm
	tool="remove-background"
	title="智能抠图"
	description="自动识别商品边缘并输出透明背景 PNG"
	requireSource
/>
