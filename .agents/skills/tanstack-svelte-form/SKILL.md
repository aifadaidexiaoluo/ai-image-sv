---
name: tanstack-svelte-form
description: Implement and modify SvelteKit/Svelte 5 forms with @tanstack/svelte-form. Use when adding login, sign-up, settings, profile, checkout, admin, or any other client-side form in this repository; when converting existing forms to TanStack Form; or when adding validation, async validation, conditional fields, submit handling, reset behavior, or field error display in Svelte components.
---

# TanStack Svelte Form

Use `@tanstack/svelte-form` for form state, validation, and submission flows in this SvelteKit 2 / Svelte 5 repository.

## Required Pattern

- Import `createForm` from `@tanstack/svelte-form`.
- Create the form with `createForm(() => ({ defaultValues, onSubmit }))`.
- Keep `defaultValues` concrete and typed by inference; do not leave fields undefined.
- Handle native form submission with Svelte 5 event attributes: `onsubmit`, `oninput`, `onblur`, `onclick`.
- In `onsubmit`, call `preventDefault()`, `stopPropagation()`, then `form.handleSubmit()`.
- Render inputs through `<form.Field name="...">` and `{#snippet children(field)}`.
- Read values from `field.state.value`.
- Update text-like fields with `field.handleChange(target.value)`.
- Update checkboxes with `field.handleChange(target.checked)` unless the field is intentionally toggled from its previous state.
- Call `field.handleBlur()` on blur.
- Show field validation state with the local `FieldInfo` component when available.
- Use `<form.Subscribe>` with a selector for submit button state, especially `canSubmit` and `isSubmitting`.
- Reset forms with `form.reset()`.

## Validation

- Put field-level validators in the relevant `<form.Field validators={{ ... }}>`.
- Return a string for validation errors and `undefined` or `null` for no error.
- Use `onChange` for synchronous validation.
- Use `onChangeAsyncDebounceMs` plus `onChangeAsync` for debounced async validation.
- Keep async validators race-safe and side-effect-light; they should return validation state, not submit data.
- For conditional fields, render the dependent `<form.Field>` inside the controlling field snippet so it reacts to `field.state.value`.

## Standard Skeleton

```svelte
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import FieldInfo from './FieldInfo.svelte';

	const form = createForm(() => ({
		defaultValues: {
			firstName: '',
			lastName: '',
			employed: false,
			jobTitle: ''
		},
		onSubmit: async ({ value }) => {
			// Submit value to the route action/API or local handler.
			console.log(value);
		}
	}));
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		e.stopPropagation();
		form.handleSubmit();
	}}
>
	<form.Field
		name="firstName"
		validators={{
			onChange: ({ value }) => (value.length < 3 ? 'Not long enough' : undefined),
			onChangeAsyncDebounceMs: 500,
			onChangeAsync: async ({ value }) => {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				return value.includes('error') ? 'No "error" allowed in first name' : undefined;
			}
		}}
	>
		{#snippet children(field)}
			<label for={field.name}>First Name</label>
			<input
				id={field.name}
				type="text"
				value={field.state.value}
				onblur={() => field.handleBlur()}
				oninput={(e: Event) => {
					const target = e.target as HTMLInputElement;
					field.handleChange(target.value);
				}}
			/>
			<FieldInfo {field} />
		{/snippet}
	</form.Field>

	<form.Field name="employed">
		{#snippet children(field)}
			<label for={field.name}>Employed?</label>
			<input
				id={field.name}
				type="checkbox"
				checked={field.state.value}
				onblur={() => field.handleBlur()}
				oninput={(e: Event) => {
					const target = e.target as HTMLInputElement;
					field.handleChange(target.checked);
				}}
			/>

			{#if field.state.value}
				<form.Field
					name="jobTitle"
					validators={{
						onChange: ({ value }) =>
							value.length === 0 ? 'If you have a job, you need a title' : undefined
					}}
				>
					{#snippet children(field)}
						<label for={field.name}>Job Title</label>
						<input
							id={field.name}
							type="text"
							value={field.state.value}
							onblur={() => field.handleBlur()}
							oninput={(e: Event) => {
								const target = e.target as HTMLInputElement;
								field.handleChange(target.value);
							}}
						/>
						<FieldInfo {field} />
					{/snippet}
				</form.Field>
			{/if}
		{/snippet}
	</form.Field>

	<form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
		{#snippet children({ canSubmit, isSubmitting })}
			<button type="submit" disabled={!canSubmit}>
				{isSubmitting ? 'Submitting' : 'Submit'}
			</button>
		{/snippet}
	</form.Subscribe>

	<button type="button" onclick={() => form.reset()}>Reset</button>
</form>
```

## Repository Conventions

- Prefer existing UI primitives from `src/lib/components/ui` for real screens; the skeleton shows native inputs only to document TanStack Form wiring.
- Use the shared `cn` helper for conditional classes.
- Keep form code in the route/component that owns the workflow unless reuse is clearly needed.
- Keep server secrets, database writes, and privileged logic in `src/lib/server` or SvelteKit server actions/endpoints.
- Run `bun run check`, `bun run lint`, and `bun run build` after nontrivial form changes.
