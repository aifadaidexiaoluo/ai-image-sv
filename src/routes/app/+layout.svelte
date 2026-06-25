<script lang="ts">
	import { page } from '$app/state';
	import {
		Bell,
		Coins,
		CreditCard,
		Crown,
		History,
		Home,
		Image,
		Settings,
		Sparkles,
		WandSparkles
	} from '@lucide/svelte';
	import UserMenu from '$lib/components/account/user-menu.svelte';
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

	function isActive(href: string) {
		return href === '/app' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

<div
	class="min-h-screen bg-[radial-gradient(circle_at_top_right,#f2edff_0,#f8fbff_30%,#ffffff_72%)] text-[#172033] lg:grid lg:grid-cols-[240px_1fr]"
>
	<aside
		class="hidden border-r border-[#e8eaf6] bg-white/88 shadow-[12px_0_34px_rgba(90,76,180,0.05)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5"
	>
		<a href="/" class="flex items-center gap-3 px-2 py-2 text-xl font-bold text-primary"
			><span
				class="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25"
				><Sparkles class="size-5" /></span
			>DesignAI</a
		>
		<nav class="mt-8 space-y-2">
			{#each navigation as item}<a
					href={item.href}
					class={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive(item.href) ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' : 'text-[#65708a] hover:bg-[#f5f2ff] hover:text-primary'}`}
					><item.icon class="size-4" />{item.label}</a
				>{/each}
		</nav>
		<div class="mt-auto rounded-2xl bg-gradient-to-br from-primary/10 to-violet-50 p-4">
			<div class="flex items-center gap-2 text-sm font-semibold text-primary">
				<Coins class="size-4" />{data.wallet.balance} 可用积分
			</div>
			<p class="mt-2 text-xs leading-5 text-[#69738c]">升级套餐享更多积分和高清导出权益</p>
			<a
				href="/app/billing"
				class="mt-3 flex h-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/20"
				>升级套餐</a
			>
		</div>
	</aside>
	<div class="min-w-0">
		<header
			class="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-[#e8eaf6] bg-white/76 px-4 backdrop-blur-xl sm:px-6 lg:px-8"
		>
			<a href="/" class="font-bold text-primary lg:hidden">DesignAI</a>
			<div class="ml-auto flex items-center gap-3">
				<a
					href="/app/billing"
					class="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#172033] shadow-sm ring-1 ring-[#eceefa]"
				>
					<Coins class="size-4 text-amber-500" />{data.account.balance}<span
						class="hidden sm:inline"
					>
						积分</span
					>
				</a>
				<span
					class="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary sm:flex"
				>
					<Crown class="size-3.5" />{data.account.planName}
				</span>
				<button
					class="grid size-10 place-items-center rounded-full bg-white text-[#172033] shadow-sm ring-1 ring-[#eceefa]"
					aria-label="通知"
				>
					<Bell class="size-5" />
				</button>
				<UserMenu user={data.account.user} />
			</div>
		</header>
		<nav
			class="flex gap-1 overflow-x-auto border-b border-[#e8eaf6] bg-white/80 px-3 py-2 lg:hidden"
		>
			{#each navigation.slice(0, 6) as item}<a
					href={item.href}
					class="shrink-0 rounded-lg px-3 py-2 text-xs font-medium"
					class:bg-primary={isActive(item.href)}
					class:text-white={isActive(item.href)}>{item.label}</a
				>{/each}
		</nav>
		<main class="p-4 sm:p-6 lg:p-8">{@render children()}</main>
	</div>
</div>
