<script lang="ts">
	import { resolve } from '$app/paths';
	import { ChevronDown, Coins, Crown, Gift, Menu, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import UserMenu from '$lib/components/account/user-menu.svelte';
	import type { AccountSummary } from '$lib/types/account';
	import BrandLogo from './brand-logo.svelte';
	import { navItems } from './home-content';

	let openMenu = $state<string | null>(null);
	let mobileOpen = $state(false);
	let navigation: HTMLElement;
	let { account = null }: { account?: AccountSummary | null } = $props();

	function handleWindowClick(event: MouseEvent) {
		if (!navigation?.contains(event.target as Node)) openMenu = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') openMenu = null;
	}

	function resolveNavHref(href: string) {
		return href.startsWith('#') ? resolve(`/${href}` as '/') : resolve(href as '/');
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<header class="relative z-50 h-[76px] border-b border-white/70 bg-white/75 backdrop-blur-xl">
	<div class="home-container flex h-full items-center justify-between">
		<BrandLogo />

		<nav
			bind:this={navigation}
			aria-label="主导航"
			class="ml-10 hidden h-full items-center gap-1 lg:flex"
		>
			{#each navItems as item (item.label)}
				<div class="relative flex h-full items-center">
					{#if item.children}
						<button
							type="button"
							class="flex h-10 items-center gap-1 rounded-lg px-3 text-[14px] font-medium text-[#2e3548] transition hover:bg-[#f3f0ff] hover:text-primary"
							aria-expanded={openMenu === item.label}
							onclick={() => (openMenu = openMenu === item.label ? null : item.label)}
						>
							{item.label}<ChevronDown
								class={`size-3.5 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`}
							/>
						</button>
						{#if openMenu === item.label}
							<div
								class="absolute top-[61px] left-1/2 w-48 -translate-x-1/2 rounded-2xl border border-[#ebe8f8] bg-white p-2 shadow-[0_18px_50px_rgba(42,30,104,0.14)]"
							>
								{#each item.children as child (child.label)}
									<a
										class="block rounded-xl px-3 py-2.5 text-sm text-[#3d465d] transition hover:bg-[#f2efff] hover:text-primary"
										href={resolveNavHref(child.href)}>{child.label}</a
									>
								{/each}
							</div>
						{/if}
					{:else}
						<a
							href={resolveNavHref(item.href)}
							class="relative flex h-10 items-center rounded-lg px-3 text-[14px] font-medium text-[#2e3548] transition hover:text-primary"
							class:text-primary={item.href === '/'}
						>
							{item.label}
							{#if item.href === '/'}<span
									class="absolute inset-x-3 -bottom-[18px] h-0.5 rounded-full bg-primary"
								></span>{/if}
						</a>
					{/if}
				</div>
			{/each}
		</nav>

		<div class="ml-auto hidden items-center gap-3 sm:flex">
			{#if account}
				<a
					href={resolve('/app/billing')}
					class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#3c455a] hover:bg-primary/5 hover:text-primary"
				>
					<Coins class="size-4 text-[#ff9e37]" />{account.balance} 积分
				</a>
				<span
					class="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
				>
					<Crown class="size-3.5" />{account.planName}
				</span>
				<UserMenu user={account.user} />
			{:else}
				<a
					href={resolve('/app/billing')}
					class="flex items-center gap-1.5 px-2 text-sm font-medium text-[#3c455a] hover:text-primary"
				>
					<Gift class="size-4 text-[#ff9e37]" />
					{m.home_points()}
				</a>
				<a
					href={resolve('/login')}
					class="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#283149] shadow-sm hover:text-primary"
					>{m.home_login()}</a
				>
				<a
					href={resolve('/app/create/product')}
					class="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_9px_24px_rgba(91,61,245,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4e30df]"
					>{m.home_trial()}</a
				>
			{/if}
		</div>
		<button
			type="button"
			class="ml-auto grid size-10 place-items-center rounded-xl border sm:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="打开导航"
			>{#if mobileOpen}<X class="size-5" />{:else}<Menu class="size-5" />{/if}</button
		>
	</div>
	{#if mobileOpen}<div
			class="absolute inset-x-0 top-[76px] border-b bg-white p-4 shadow-lg sm:hidden"
		>
			<nav class="space-y-1">
				{#each navItems as item (item.label)}<a
						href={resolveNavHref(item.href)}
						class="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-primary/5"
						>{item.label}</a
					>{/each}
				{#if account}
					<div class="mt-3 flex items-center justify-between rounded-xl bg-primary/5 p-3">
						<div class="text-sm">
							<p class="font-semibold text-primary">{account.balance} 积分 · {account.planName}</p>
							<p class="mt-0.5 max-w-48 truncate text-xs text-muted-foreground">
								{account.user.name}
							</p>
						</div>
						<UserMenu user={account.user} />
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-2 pt-3">
						<a href={resolve('/login')} class="rounded-xl border px-4 py-3 text-center text-sm"
							>{m.home_login()}</a
						><a
							href={resolve('/app/create/product')}
							class="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
							>{m.home_trial()}</a
						>
					</div>
				{/if}
			</nav>
		</div>{/if}
</header>
