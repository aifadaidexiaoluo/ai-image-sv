<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { createForm } from '@tanstack/svelte-form';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import NotificationRow from './notification-row.svelte';
	import type { SettingsPageData } from './types';

	let { data }: { data: SettingsPageData } = $props();
	let message = $state('');

	const notificationForm = createForm(() => ({
		defaultValues: {
			emailProductUpdates: data.settings.emailProductUpdates,
			emailBillingReminders: data.settings.emailBillingReminders,
			emailMarketing: data.settings.emailMarketing,
			inAppJobUpdates: data.settings.inAppJobUpdates,
			inAppCreditAlerts: data.settings.inAppCreditAlerts
		},
		onSubmit: async ({ value }) => {
			const body = new FormData();
			for (const [key, enabled] of Object.entries(value)) body.set(key, String(enabled));
			const response = await fetch('?/notifications', { method: 'POST', body });
			message = response.ok ? '通知设置已保存' : '保存失败，请稍后重试';
			if (response.ok) await invalidateAll();
		}
	}));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>通知设置</Card.Title>
		<Card.Description>控制邮件和站内提醒的接收范围。</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				notificationForm.handleSubmit();
			}}
			class="grid gap-4"
		>
			<notificationForm.Field name="emailProductUpdates">
				{#snippet children(field)}
					<NotificationRow
						title="产品更新邮件"
						description="重要功能上线、模板更新与工作流改进"
						checked={field.state.value}
						onchange={(checked: boolean) => field.handleChange(checked)}
					/>
				{/snippet}
			</notificationForm.Field>
			<notificationForm.Field name="emailBillingReminders">
				{#snippet children(field)}
					<NotificationRow
						title="账单提醒邮件"
						description="订阅、订单和积分余额相关通知"
						checked={field.state.value}
						onchange={(checked: boolean) => field.handleChange(checked)}
					/>
				{/snippet}
			</notificationForm.Field>
			<notificationForm.Field name="emailMarketing">
				{#snippet children(field)}
					<NotificationRow
						title="营销活动邮件"
						description="优惠活动、案例精选和增长建议"
						checked={field.state.value}
						onchange={(checked: boolean) => field.handleChange(checked)}
					/>
				{/snippet}
			</notificationForm.Field>
			<notificationForm.Field name="inAppJobUpdates">
				{#snippet children(field)}
					<NotificationRow
						title="任务状态提醒"
						description="生成完成、失败和重试结果"
						checked={field.state.value}
						onchange={(checked: boolean) => field.handleChange(checked)}
					/>
				{/snippet}
			</notificationForm.Field>
			<notificationForm.Field name="inAppCreditAlerts">
				{#snippet children(field)}
					<NotificationRow
						title="积分余额提醒"
						description="积分不足或套餐权益即将变化"
						checked={field.state.value}
						onchange={(checked: boolean) => field.handleChange(checked)}
					/>
				{/snippet}
			</notificationForm.Field>
			<div class="flex items-center gap-3">
				<Button type="submit" class="w-fit">保存通知设置</Button>
				{#if message}<p class="text-sm text-[#65708a]">{message}</p>{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>
