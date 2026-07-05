<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import LogoMark from '$lib/components/brand/logo-mark.svelte';
	import {
		Activity,
		Building2,
		CreditCard,
		FileClock,
		Gauge,
		Image,
		Users,
		WandSparkles
	} from '@lucide/svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const navigation = [
		{ href: '/admin', label: '仪表盘', icon: Gauge },
		{ href: '/admin/users', label: '用户', icon: Users },
		{ href: '/admin/jobs', label: '任务', icon: WandSparkles },
		{ href: '/admin/assets', label: '素材', icon: Image },
		{ href: '/admin/billing', label: '账单', icon: CreditCard },
		{ href: '/admin/organizations', label: '组织', icon: Building2 },
		{ href: '/admin/audit', label: '审计', icon: FileClock },
		{ href: '/admin/system', label: '系统', icon: Activity }
	];

	function isActive(href: string) {
		return href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

<div class="grid min-h-screen bg-[#f7f8fc] text-[#172033] lg:grid-cols-[248px_1fr]">
	<aside
		class="sticky top-0 hidden h-screen overflow-y-auto border-r border-[#e8eaf6] bg-white/95 px-5 py-6 shadow-sm lg:block"
	>
		<a href={resolve('/admin')} class="flex items-center gap-3 text-lg font-black text-primary">
			<LogoMark class="size-9" />DesignAI 后台
		</a>
		<nav class="mt-8 space-y-1.5">
			{#each navigation as item (item.href)}
				<a
					href={resolve(item.href as '/admin')}
					class={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-[#667085] hover:bg-[#f4f2ff] hover:text-primary'}`}
				>
					<item.icon class="size-4" />{item.label}
				</a>
			{/each}
		</nav>
	</aside>

	<div class="min-w-0">
		<header
			class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8eaf6] bg-white/85 px-4 backdrop-blur lg:px-8"
		>
			<div>
				<p class="text-sm font-black text-[#121826]">管理控制台</p>
				<p class="text-xs text-[#8a94ad]">{data.user.email}</p>
			</div>
			<div class="flex items-center gap-3">
				<a
					href={resolve('/app')}
					class="rounded-lg border border-[#dde2f2] px-3 py-2 text-sm font-bold text-primary"
				>
					返回工作台
				</a>
			</div>
		</header>

		<div class="border-b border-[#e8eaf6] bg-white px-3 py-2 lg:hidden">
			<div class="flex gap-2 overflow-x-auto">
				{#each navigation as item (item.href)}
					<a
						href={resolve(item.href as '/admin')}
						class={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-[#667085]'}`}
					>
						{item.label}
					</a>
				{/each}
			</div>
		</div>

		<main class="px-4 py-6 lg:px-8">{@render children()}</main>
	</div>
</div>
