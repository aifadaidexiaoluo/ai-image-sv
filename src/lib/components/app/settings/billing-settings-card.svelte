<script lang="ts">
	import { resolve } from '$app/paths';
	import { CreditCard } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { SettingsPageData } from './types';

	let { data }: { data: SettingsPageData } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>账号与账单</Card.Title>
		<Card.Description>查看当前套餐、积分余额和最近账单记录。</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-5">
		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-lg border border-[#e1e5f2] p-4">
				<p class="text-sm text-[#65708a]">可用积分</p>
				<p class="mt-2 text-3xl font-black text-primary">{data.billingSummary.wallet.balance}</p>
			</div>
			<div class="rounded-lg border border-[#e1e5f2] p-4">
				<p class="text-sm text-[#65708a]">保留积分</p>
				<p class="mt-2 text-3xl font-black text-[#121826]">{data.billingSummary.wallet.reserved}</p>
			</div>
			<div class="rounded-lg border border-[#e1e5f2] p-4">
				<p class="text-sm text-[#65708a]">当前套餐</p>
				<p class="mt-2 text-2xl font-black text-[#121826]">{data.account.planName}</p>
			</div>
		</div>
		<Button href={resolve('/app/billing')} class="w-fit"
			><CreditCard class="size-4" />前往套餐积分</Button
		>
	</Card.Content>
</Card.Root>
