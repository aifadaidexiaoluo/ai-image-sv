<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Pathname } from '$app/types';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div>
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
<Button>Click me</Button>
