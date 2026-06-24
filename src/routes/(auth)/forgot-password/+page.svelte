<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<AuthShell title={m.auth_forgot_title()} description={m.auth_forgot_description()}>
	{#if form?.success}
		<div class="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{m.auth_reset_sent()}</div>
	{:else}
		<form method="POST" use:enhance class="space-y-5">
			<label class="block text-sm font-medium"
				>{m.auth_email()}<input
					class="mt-2 h-12 w-full rounded-xl border px-4"
					type="email"
					name="email"
					required
				/></label
			>
			{#if form?.message}<p class="text-sm text-red-600">{form.message}</p>{/if}
			<button class="h-12 w-full rounded-xl bg-primary font-semibold text-white"
				>{m.auth_send_reset()}</button
			>
		</form>
	{/if}
</AuthShell>
