<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{m.auth_register_title()} - DesignAI</title></svelte:head>

<AuthShell title={m.auth_register_title()} description={m.auth_register_description()}>
	<form method="POST" use:enhance class="space-y-4">
		<label class="block text-sm font-medium"
			>{m.auth_name()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-primary/30"
				name="name"
				required
				value={form?.name ?? ''}
			/></label
		>
		<label class="block text-sm font-medium"
			>{m.auth_email()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-primary/30"
				type="email"
				name="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
			/></label
		>
		<label class="block text-sm font-medium"
			>{m.auth_password()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-primary/30"
				type="password"
				name="password"
				autocomplete="new-password"
				minlength="12"
				required
			/><span class="mt-1 block text-xs text-muted-foreground">{m.auth_password_hint()}</span
			></label
		>
		<label class="block text-sm font-medium"
			>{m.auth_confirm_password()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-primary/30"
				type="password"
				name="confirm"
				autocomplete="new-password"
				minlength="12"
				required
			/></label
		>
		{#if form?.message}<p class="rounded-xl bg-red-50 p-3 text-sm text-red-600">
				{form.message}
			</p>{/if}
		<button class="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary/90"
			>{m.auth_register_submit()}</button
		>
		<p class="text-center text-sm text-muted-foreground">
			{m.auth_have_account()}
			<a href={resolve('/login')} class="font-medium text-primary hover:underline"
				>{m.auth_login_now()}</a
			>
		</p>
	</form>
</AuthShell>
