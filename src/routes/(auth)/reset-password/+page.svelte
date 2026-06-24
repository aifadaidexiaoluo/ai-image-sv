<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<AuthShell title={m.auth_reset_title()} description={m.auth_reset_description()}>
	<form method="POST" use:enhance class="space-y-5">
		<input type="hidden" name="token" value={page.url.searchParams.get('token') ?? ''} />
		<label class="block text-sm font-medium"
			>{m.auth_new_password()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4"
				type="password"
				name="password"
				minlength="12"
				required
			/></label
		>
		<label class="block text-sm font-medium"
			>{m.auth_confirm_password()}<input
				class="mt-2 h-12 w-full rounded-xl border px-4"
				type="password"
				name="confirm"
				minlength="12"
				required
			/></label
		>
		{#if form?.message}<p class="text-sm text-red-600">{form.message}</p>{/if}
		<button class="h-12 w-full rounded-xl bg-primary font-semibold text-white"
			>{m.auth_reset_submit()}</button
		>
	</form>
</AuthShell>
