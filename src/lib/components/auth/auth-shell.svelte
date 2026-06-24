<script lang="ts">
	import { ArrowLeft, Sparkles } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { title, description, children } = $props<{
		title: string;
		description: string;
		children: import('svelte').Snippet;
	}>();
</script>

<div class="grid min-h-screen bg-[#f7f6ff] lg:grid-cols-[1fr_0.9fr]">
	<section
		class="relative hidden overflow-hidden bg-gradient-to-br from-[#4f2ddf] to-[#8d77ff] p-12 text-white lg:flex lg:flex-col"
	>
		<div class="flex items-center gap-3 text-xl font-bold">
			<Sparkles class="size-7" /> DesignAI
		</div>
		<div class="my-auto max-w-lg">
			<p class="text-sm font-semibold tracking-[0.2em] text-white/70">AI E-COMMERCE STUDIO</p>
			<h2 class="mt-5 text-5xl leading-tight font-bold">{m.auth_hero_title()}</h2>
			<p class="mt-6 text-lg leading-8 text-white/75">{m.auth_hero_description()}</p>
		</div>
		<p class="text-sm text-white/60">© 2026 DesignAI</p>
	</section>
	<main class="flex min-h-screen items-center justify-center p-6 sm:p-10">
		<div class="w-full max-w-md">
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
			>
				<ArrowLeft class="size-4" />
				{m.auth_back_home()}
			</a>
			<div class="rounded-3xl border bg-white p-7 shadow-[0_24px_80px_rgba(75,55,170,.12)] sm:p-9">
				<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
				<div class="mt-7">{@render children()}</div>
			</div>
		</div>
	</main>
</div>
