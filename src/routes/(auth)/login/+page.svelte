<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{m.auth_login_title()} - DesignAI</title></svelte:head>

<AuthShell title={m.auth_login_title()} description={m.auth_login_description()}>
	<form method="POST" use:enhance class="space-y-5">
		<label class="block text-sm font-medium"
			>{m.auth_email()}
			<input
				class="mt-2 h-12 w-full rounded-xl border bg-white px-4 outline-none focus:ring-2 focus:ring-primary/30"
				type="email"
				name="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
			/>
		</label>
		<label class="block text-sm font-medium"
			>{m.auth_password()}
			<input
				class="mt-2 h-12 w-full rounded-xl border bg-white px-4 outline-none focus:ring-2 focus:ring-primary/30"
				type="password"
				name="password"
				autocomplete="current-password"
				required
				minlength="12"
			/>
		</label>
		<div class="flex justify-end">
			<a class="text-sm text-primary hover:underline" href="/forgot-password"
				>{m.auth_forgot_password()}</a
			>
		</div>
		{#if form?.message}<p class="rounded-xl bg-red-50 p-3 text-sm text-red-600">
				{form.message}
			</p>{/if}
		<button class="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary/90"
			>{m.auth_login_submit()}</button
		>
		<p class="text-center text-sm text-muted-foreground">
			{m.auth_no_account()}
			<a href="/register" class="font-medium text-primary hover:underline"
				>{m.auth_register_now()}</a
			>
		</p>
	</form>
</AuthShell>
