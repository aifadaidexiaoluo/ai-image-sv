<script lang="ts">
	import AuthShell from '$lib/components/auth/auth-shell.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<AuthShell title={m.auth_verify_title()} description={m.auth_verify_description()}>
	<div class="rounded-xl bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
		{m.auth_verify_hint()}
	</div>
	<a
		href="/login"
		class="mt-5 flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white"
		>{m.auth_back_login()}</a
	>
</AuthShell>
