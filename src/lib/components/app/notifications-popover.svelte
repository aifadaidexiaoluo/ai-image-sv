<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { Bell, CheckCheck, CircleAlert, CircleCheck, Clock3, Info } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import type { AppNotification, NotificationTone } from '$lib/types/notifications';

	let { notifications, userId }: { notifications: AppNotification[]; userId: string } = $props();
	let readAt = $state(0);
	const storageKey = $derived(`designai:notifications-read-at:${userId}`);
	const unreadCount = $derived(
		notifications.filter((item) => new Date(item.createdAt).getTime() > readAt).length
	);

	const toneClass: Record<NotificationTone, string> = {
		info: 'bg-primary/10 text-primary',
		success: 'bg-emerald-50 text-emerald-600',
		warning: 'bg-amber-50 text-amber-600',
		danger: 'bg-red-50 text-red-600'
	};

	const iconByTone = {
		info: Info,
		success: CircleCheck,
		warning: CircleAlert,
		danger: CircleAlert
	};

	onMount(() => {
		const stored = localStorage.getItem(storageKey);
		readAt = stored ? Number(stored) : 0;
	});

	function markAllRead() {
		readAt = Date.now();
		if (browser) localStorage.setItem(storageKey, String(readAt));
	}

	function formatTime(value: string | Date) {
		const date = new Date(value);
		const diff = Date.now() - date.getTime();
		const minute = 60 * 1000;
		const hour = 60 * minute;
		const day = 24 * hour;
		if (diff < minute) return '刚刚';
		if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
		if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
		return date.toLocaleString('zh-CN', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Popover.Root>
	<Popover.Trigger
		class="relative grid size-10 place-items-center rounded-full text-[#121826] outline-none transition hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30"
		aria-label={unreadCount > 0 ? `通知，${unreadCount} 条未读` : '通知'}
	>
		<Bell class="size-5" />
		{#if unreadCount > 0}
			<span
				class="absolute right-2 top-2 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-black leading-4 text-white ring-2 ring-white"
				>{unreadCount > 9 ? '9+' : unreadCount}</span
			>
		{/if}
	</Popover.Trigger>
	<Popover.Content align="end" sideOffset={10} class="w-[380px] gap-0 overflow-hidden p-0">
		<div class="flex items-start justify-between gap-4 px-4 py-4">
			<div>
				<div class="flex items-center gap-2">
					<h2 class="font-black text-[#121826]">通知中心</h2>
					{#if unreadCount > 0}
						<Badge class="bg-primary/10 text-primary">{unreadCount} 未读</Badge>
					{/if}
				</div>
				<p class="mt-1 text-xs text-[#65708a]">任务进度、积分和套餐动态都会出现在这里</p>
			</div>
			<Button variant="ghost" size="sm" onclick={markAllRead} disabled={unreadCount === 0}>
				<CheckCheck class="size-4" />全部已读
			</Button>
		</div>
		<Separator />
		{#if notifications.length > 0}
			<div class="max-h-[420px] overflow-y-auto p-2">
				{#each notifications as item (item.id)}
					{@const unread = new Date(item.createdAt).getTime() > readAt}
					{@const Icon = iconByTone[item.tone]}
					<svelte:element
						this={item.href ? 'a' : 'div'}
						href={item.href ? resolve(item.href as '/app') : undefined}
						class="group flex gap-3 rounded-lg px-3 py-3 transition hover:bg-[#f7f5ff]"
					>
						<span
							class={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${toneClass[item.tone]}`}
						>
							<Icon class="size-4" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="flex items-start justify-between gap-3">
								<strong class="text-sm font-black text-[#121826]">{item.title}</strong>
								<span class="shrink-0 text-xs text-[#8a94aa]">{formatTime(item.createdAt)}</span>
							</span>
							<span class="mt-1 line-clamp-2 text-xs leading-5 text-[#65708a]"
								>{item.description}</span
							>
							<span class="mt-2 flex items-center gap-2">
								<Badge variant="outline" class="border-[#e6e9f5] text-[#65708a]"
									>{item.category}</Badge
								>
								{#if unread}<span class="size-2 rounded-full bg-primary"></span>{/if}
							</span>
						</span>
					</svelte:element>
				{/each}
			</div>
		{:else}
			<div class="grid place-items-center px-6 py-10 text-center">
				<span class="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
					<Clock3 class="size-5" />
				</span>
				<p class="mt-3 font-bold text-[#121826]">暂无通知</p>
				<p class="mt-1 text-xs text-[#65708a]">有新的任务或积分动态时，会第一时间提醒你。</p>
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
