<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CreditCard, LayoutDashboard, LogOut, Settings, ShieldCheck } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { AccountUser } from '$lib/types/account';

	let { user }: { user: AccountUser } = $props();
	const initials = $derived(
		user.name
			.trim()
			.split(/\s+/)
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	function navigate(href: '/app' | '/app/settings' | '/app/billing' | '/admin') {
		void goto(resolve(href));
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
		aria-label="打开用户菜单"
	>
		<Avatar.Root size="lg">
			<Avatar.Image src={user.image ?? undefined} alt={user.name} />
			<Avatar.Fallback class="font-semibold">{initials}</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" sideOffset={8} class="w-64 p-2">
		<div class="px-2 py-2">
			<p class="truncate text-sm font-semibold">{user.name}</p>
			<p class="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
			{#if user.bio}<p class="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
					{user.bio}
				</p>{/if}
		</div>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => navigate('/app')} class="py-2">
			<LayoutDashboard />进入工作台
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => navigate('/app/settings')} class="py-2">
			<Settings />账户设置
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => navigate('/app/billing')} class="py-2">
			<CreditCard />套餐与积分
		</DropdownMenu.Item>
		{#if user.role === 'admin'}
			<DropdownMenu.Item onclick={() => navigate('/admin')} class="py-2">
				<ShieldCheck />管理后台
			</DropdownMenu.Item>
		{/if}
		<DropdownMenu.Separator />
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="flex w-full items-center gap-1.5 rounded-md px-1.5 py-2 text-left text-sm text-destructive outline-none hover:bg-destructive/10"
			>
				<LogOut class="size-4" />退出登录
			</button>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root>
