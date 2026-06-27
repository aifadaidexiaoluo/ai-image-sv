<script lang="ts">
	import { resolve } from '$app/paths';
	import LogoMark from '$lib/components/brand/logo-mark.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { title, description, children } = $props<{
		title: string;
		description: string;
		children: import('svelte').Snippet;
	}>();
</script>

<div class="grid min-h-screen bg-[#f5f3ff] lg:grid-cols-[1.08fr_0.92fr]">
	<section class="relative hidden overflow-hidden bg-[#3420b8] p-12 text-white lg:flex lg:flex-col">
		<img
			src="/images/auth/login-hero.png"
			alt=""
			aria-hidden="true"
			class="absolute inset-0 size-full object-cover"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-br from-[#25118d]/88 via-[#4b2de2]/60 to-[#7b67ff]/40"
		></div>
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.22),transparent_32%),linear-gradient(90deg,rgba(22,12,84,0.38),transparent_62%)]"
		></div>
		<div class="relative z-10 flex items-center gap-3 text-xl font-bold">
			<LogoMark class="size-9 drop-shadow-[0_8px_20px_rgba(20,14,82,0.25)]" /> DesignAI
		</div>
		<div class="relative z-10 my-auto max-w-xl">
			<p class="text-sm font-semibold tracking-[0.2em] text-white/70">AI E-COMMERCE STUDIO</p>
			<h2 class="mt-5 text-5xl leading-tight font-bold text-balance xl:text-6xl">
				{m.auth_hero_title()}
			</h2>
			<p class="mt-6 text-lg leading-8 text-white/75">{m.auth_hero_description()}</p>
		</div>
		<p class="relative z-10 text-sm text-white/60">© 2026 DesignAI</p>
	</section>
	<main class="flex min-h-screen items-center justify-center p-6 sm:p-10">
		<div class="w-full max-w-md">
			<a
				href={resolve('/')}
				class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
			>
				<ArrowLeft class="size-4" />
				{m.auth_back_home()}
			</a>
			<Card.Root class="gap-0 rounded-2xl bg-white p-0 shadow-[0_24px_80px_rgba(75,55,170,.12)]">
				<Card.Header class="px-7 pt-8 pb-0 sm:px-9 sm:pt-9">
					<Card.Title class="text-3xl font-bold tracking-tight">{title}</Card.Title>
					<Card.Description class="mt-2 text-sm leading-6">{description}</Card.Description>
				</Card.Header>
				<Card.Content class="px-7 pt-7 pb-8 sm:px-9 sm:pb-9">{@render children()}</Card.Content>
			</Card.Root>
		</div>
	</main>
</div>
