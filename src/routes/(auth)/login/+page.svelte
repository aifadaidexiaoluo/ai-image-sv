<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{m.auth_login_title()} - DesignAI</title></svelte:head>

<AuthShell title={m.auth_login_title()} description={m.auth_login_description()}>
	<form method="POST" use:enhance class="space-y-5">
		<div class="space-y-2">
			<Label for="email">{m.auth_email()}</Label>
			<Input
				id="email"
				class="h-12 rounded-xl bg-white px-4"
				type="email"
				name="email"
				autocomplete="email"
				placeholder="you@example.com"
				required
				value={form?.email ?? ''}
			/>
		</div>
		<div class="space-y-2">
			<Label for="password">{m.auth_password()}</Label>
			<Input
				id="password"
				class="h-12 rounded-xl bg-white px-4"
				type="password"
				name="password"
				autocomplete="current-password"
				required
				minlength={12}
			/>
		</div>
		<div class="flex justify-end">
			<a class="text-sm text-primary hover:underline" href={resolve('/forgot-password')}
				>{m.auth_forgot_password()}</a
			>
		</div>
		{#if form?.message}
			<Alert variant="destructive" class="rounded-xl border-destructive/20 bg-destructive/5">
				<AlertDescription>{form.message}</AlertDescription>
			</Alert>
		{/if}
		<Button type="submit" size="lg" class="h-12 w-full rounded-xl text-base font-semibold">
			{m.auth_login_submit()}
		</Button>
		<p class="text-center text-sm text-muted-foreground">
			{m.auth_no_account()}
			<a href={resolve('/register')} class="font-medium text-primary hover:underline"
				>{m.auth_register_now()}</a
			>
		</p>
	</form>
</AuthShell>
