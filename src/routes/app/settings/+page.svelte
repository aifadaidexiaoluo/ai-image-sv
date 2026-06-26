<script lang="ts">
	import { resolve } from '$app/paths';
	import { Download } from '@lucide/svelte';
	import ApiSettingsCard from '$lib/components/app/settings/api-settings-card.svelte';
	import BillingSettingsCard from '$lib/components/app/settings/billing-settings-card.svelte';
	import NotificationSettingsCard from '$lib/components/app/settings/notification-settings-card.svelte';
	import PreferenceSettingsCard from '$lib/components/app/settings/preference-settings-card.svelte';
	import ProfileSettingsCard from '$lib/components/app/settings/profile-settings-card.svelte';
	import SecuritySettingsCard from '$lib/components/app/settings/security-settings-card.svelte';
	import SettingsSidebar from '$lib/components/app/settings/settings-sidebar.svelte';
	import TeamSettingsCard from '$lib/components/app/settings/team-settings-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let activeTab = $state('profile');

	const tabs = [
		['profile', '基本信息'],
		['security', '安全设置'],
		['notice', '通知设置'],
		['preference', '偏好设置'],
		['team', '团队管理'],
		['api', 'API 管理'],
		['billing', '账号与账单']
	];
</script>

<svelte:head><title>账户设置 - DesignAI</title></svelte:head>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div>
		<h1 class="text-3xl font-black text-[#121826]">账户设置</h1>
		<p class="mt-2 text-sm text-[#65708a]">管理您的账户信息、偏好设置与安全</p>
	</div>
	<Button href={resolve('/app/settings/export')} variant="outline" size="lg">
		<Download class="size-4" />导出我的数据
	</Button>
</div>

{#if form?.message}
	<div
		class="mt-5 rounded-lg border border-[#dfe3f2] bg-white px-4 py-3 text-sm font-medium text-[#172033]"
	>
		{form.message}
	</div>
{/if}

<div class="mt-8 grid gap-5 xl:grid-cols-[1fr_380px]">
	<section class="min-w-0">
		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List
				variant="line"
				class="w-full justify-start overflow-x-auto border-b border-[#dfe3f2] bg-transparent p-0"
			>
				{#each tabs as [id, label] (id)}
					<Tabs.Trigger value={id} class="h-11 flex-none px-3 font-black">{label}</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<Tabs.Content value="profile" class="mt-5">
				<ProfileSettingsCard {data} {form} />
			</Tabs.Content>
			<Tabs.Content value="security" class="mt-5">
				<SecuritySettingsCard {data} />
			</Tabs.Content>
			<Tabs.Content value="notice" class="mt-5">
				<NotificationSettingsCard {data} />
			</Tabs.Content>
			<Tabs.Content value="preference" class="mt-5">
				<PreferenceSettingsCard {data} />
			</Tabs.Content>
			<Tabs.Content value="team" class="mt-5">
				<TeamSettingsCard {data} />
			</Tabs.Content>
			<Tabs.Content value="api" class="mt-5">
				<ApiSettingsCard {data} {form} />
			</Tabs.Content>
			<Tabs.Content value="billing" class="mt-5">
				<BillingSettingsCard {data} />
			</Tabs.Content>
		</Tabs.Root>
	</section>

	<SettingsSidebar {data} onSelectTab={(tab) => (activeTab = tab)} />
</div>
