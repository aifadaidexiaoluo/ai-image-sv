<script lang="ts">
	import HomeFooter from '$lib/components/home/home-footer.svelte';
	import HomeHeader from '$lib/components/home/home-header.svelte';
	let { eyebrow, title, description, children } = $props<{
		eyebrow: string;
		title: string;
		description: string;
		children: import('svelte').Snippet;
	}>();
</script>

<HomeHeader />
<main class="min-h-[70vh] bg-[#f8f7ff]">
	<section class="border-b bg-white py-16 sm:py-24">
		<div class="home-container text-center">
			<p class="text-sm font-semibold text-primary">{eyebrow}</p>
			<h1 class="mx-auto mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
				{title}
			</h1>
			<p class="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{description}</p>
		</div>
	</section>
	<div class="home-container py-12">{@render children()}</div>
</main>
<HomeFooter />
