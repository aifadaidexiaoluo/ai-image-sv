<script lang="ts">
	import { page } from '$app/state';
	import {
		Coins,
		CreditCard,
		History,
		Home,
		Image,
		LogOut,
		Settings,
		Sparkles,
		WandSparkles
	} from '@lucide/svelte';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
	const navigation = [
		{ href: '/app', label: '工作台', icon: Home },
		{ href: '/app/create/product', label: '商品图', icon: Sparkles },
		{ href: '/app/create/scene', label: '场景图', icon: WandSparkles },
		{ href: '/app/create/remove-background', label: '智能抠图', icon: Image },
		{ href: '/app/history', label: '历史记录', icon: History },
		{ href: '/app/assets', label: '素材库', icon: Image },
		{ href: '/app/billing', label: '套餐积分', icon: CreditCard },
		{ href: '/app/settings', label: '账户设置', icon: Settings }
	];
</script>

<div class="min-h-screen bg-[#f7f7fc] lg:grid lg:grid-cols-[240px_1fr]">
	<aside class="hidden border-r bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-4">
		<a href="/" class="flex items-center gap-2 px-3 py-3 text-xl font-bold text-primary"
			><span class="grid size-9 place-items-center rounded-xl bg-primary text-white"
				><Sparkles class="size-5" /></span
			>DesignAI</a
		>
		<nav class="mt-6 space-y-1">
			{#each navigation as item}<a
					href={item.href}
					class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${page.url.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
					><item.icon class="size-4" />{item.label}</a
				>{/each}
		</nav>
		<div class="mt-auto rounded-xl bg-primary/5 p-3">
			<div class="flex items-center gap-2 text-sm font-semibold text-primary">
				<Coins class="size-4" />{data.wallet.balance} 可用积分
			</div>
			<a href="/app/billing" class="mt-2 block text-xs text-muted-foreground hover:text-primary"
				>购买积分或升级套餐</a
			>
		</div>
	</aside>
	<div class="min-w-0">
		<header
			class="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8"
		>
			<a href="/" class="font-bold text-primary lg:hidden">DesignAI</a>
			<div class="ml-auto flex items-center gap-3">
				<span class="hidden text-sm text-muted-foreground sm:inline">{data.user.name}</span>
				<form method="POST" action="/logout">
					<button
						class="grid size-9 place-items-center rounded-lg border hover:bg-muted"
						aria-label="退出登录"><LogOut class="size-4" /></button
					>
				</form>
			</div>
		</header>
		<nav class="flex gap-1 overflow-x-auto border-b bg-white px-3 py-2 lg:hidden">
			{#each navigation.slice(0, 6) as item}<a
					href={item.href}
					class="shrink-0 rounded-lg px-3 py-2 text-xs font-medium"
					class:bg-primary={page.url.pathname === item.href}
					class:text-white={page.url.pathname === item.href}>{item.label}</a
				>{/each}
		</nav>
		<main class="p-4 sm:p-6 lg:p-8">{@render children()}</main>
	</div>
</div>
