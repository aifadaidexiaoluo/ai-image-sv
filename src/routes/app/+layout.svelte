<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import UserMenu from '$lib/components/account/user-menu.svelte';
	import NotificationsPopover from '$lib/components/app/notifications-popover.svelte';
	import LogoMark from '$lib/components/brand/logo-mark.svelte';
	import {
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
	class="grid min-h-screen grid-cols-[256px_1fr] bg-[radial-gradient(circle_at_top_right,#f3efff_0,#f8fbff_34%,#ffffff_76%)] text-[#172033]"
>
	<aside
		class="sticky top-0 flex h-screen flex-col border-r border-[#e8eaf6] bg-white/90 px-8 py-9 shadow-[14px_0_40px_rgba(91,61,245,0.045)] backdrop-blur"
	>
		<a href={resolve('/')} class="flex items-center gap-3 text-[21px] font-black text-primary"
			><LogoMark class="size-10 drop-shadow-[0_8px_16px_rgba(91,61,245,0.25)]" />DesignAI</a
		>
		<nav class="mt-8 space-y-3">
			{#each navigation as item (item.href)}<a
					href={resolve(item.href as '/app')}
					class={`flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-bold transition ${isActive(item.href) ? 'bg-primary/10 text-primary shadow-[0_10px_24px_rgba(91,61,245,0.1)]' : 'text-[#68738d] hover:bg-[#f5f2ff] hover:text-primary'}`}
					><item.icon class="size-5 stroke-[1.9]" />{item.label}</a
				>{/each}
		</nav>
		<div
			class="mt-auto rounded-2xl bg-linear-to-br from-primary/10 to-violet-50 p-4 shadow-[0_16px_36px_rgba(91,61,245,0.08)]"
		>
			<div class="flex items-center gap-2 text-sm font-bold text-primary">
				<Coins class="size-4" />{data.wallet.balance} 可用积分
			</div>
			<p class="mt-2 text-xs leading-5 text-[#69738c]">升级套餐享更多积分和高清导出权益</p>
			<a
				href={resolve('/app/billing')}
				class="mt-3 flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20"
				>升级套餐</a
			>
		</div>
	</aside>
	<div class="min-w-0">
		<header
			class="sticky top-0 z-40 flex h-16 items-center justify-end bg-white/45 px-10 backdrop-blur-xl"
		>
			<div class="ml-auto flex items-center gap-4">
				<a
					href={resolve('/app/billing')}
					class="flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-[#25304a] shadow-sm ring-1 ring-[#eceefa]"
				>
					<Coins class="size-4 text-amber-500" />{data.account.balance} 积分
				</a>
				<span
					class="flex h-9 items-center gap-1.5 rounded-full bg-primary/10 px-4 text-sm font-bold text-primary"
				>
					<Crown class="size-4" />{data.account.planName}
				</span>
				<NotificationsPopover notifications={data.notifications} userId={data.account.user.id} />
				<UserMenu user={data.account.user} />
			</div>
		</header>
		<main class="px-10 pb-6">{@render children()}</main>
	</div>
</div>
