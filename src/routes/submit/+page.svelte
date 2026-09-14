<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>submit a package — PakPage</title>
	<meta name="description" content="submit a new package to Pak." />
	<link rel="stylesheet" href="/css/home.css" />
</svelte:head>

<section class="intro">
	<h1>submit a package</h1>
	<p>fill this in, we open a PR for you — one package per submission.</p>
</section>

{#if !data.user}
	<Card.Root class="mt-6 max-w-lg">
		<Card.Content class="flex flex-col items-start gap-3 py-6">
			<p class="text-sm text-muted-foreground">log in with your pak.dpdns.org account to submit a package.</p>
			<Button variant="outline" href="/login?redirect=/submit">log in</Button>
		</Card.Content>
	</Card.Root>
{:else if form?.success}
	<div in:fade={{ duration: 160 }}>
	<Card.Root class="mt-6 max-w-lg">
		<Card.Content class="flex flex-col items-start gap-3 py-6">
			<p class="text-sm text-foreground">PR opened.</p>
			<Button variant="outline" href={form.prUrl} target="_blank" rel="noreferrer">view pull request</Button>
			<a class="text-xs text-muted-foreground underline" href="/submit">submit another</a>
		</Card.Content>
	</Card.Root>
	</div>
{:else}
	<div class="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
		<span>logged in as {data.user.login}</span>
		<a class="underline" href="/logout">log out</a>
	</div>

	<form
		method="POST"
		class="flex max-w-lg flex-col gap-5"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		{#if form?.message}
			<p class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
				{form.message}
			</p>
		{/if}

		<fieldset class="flex flex-col gap-3">
			<legend class="mb-1 text-sm font-semibold text-foreground">package.yml</legend>

			<label class="flex flex-col gap-1 text-sm">
				name <span class="text-destructive">*</span>
				<input name="name" required class="field" placeholder="cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				slug <span class="text-xs text-muted-foreground">(defaults to a slugified name)</span>
				<input name="slug" class="field" placeholder="cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				version <span class="text-destructive">*</span>
				<input name="version" required class="field" placeholder="2.0" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				description <span class="text-destructive">*</span>
				<input name="description" required class="field" placeholder="Terminal based Matrix rain animation" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				homepage <span class="text-destructive">*</span>
				<input name="homepage" type="url" required class="field" placeholder="https://github.com/abishekvashok/cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				license <span class="text-destructive">*</span>
				<input name="license" required class="field" placeholder="GPL-3.0" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				maintainer <span class="text-destructive">*</span>
				<span class="text-xs text-muted-foreground">the upstream project's maintainer, not you</span>
				<input name="maintainer" required class="field" placeholder="abishekvashok" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				dependencies <span class="text-xs text-muted-foreground">(space or comma separated slugs, include the build toolchain)</span>
				<input name="dependencies" class="field" placeholder="cmake gcc make ncurses" />
			</label>
		</fieldset>

		<fieldset class="flex flex-col gap-3">
			<legend class="mb-1 text-sm font-semibold text-foreground">package.pak</legend>

			<label class="flex flex-col gap-1 text-sm">
				CC <span class="text-xs text-muted-foreground">(compiler, blank if not applicable)</span>
				<input name="cc" class="field" placeholder="gcc" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				SRC <span class="text-destructive">*</span>
				<input name="src" type="url" required class="field" placeholder="https://github.com/abishekvashok/cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				BUILDDIR <span class="text-destructive">*</span>
				<input name="builddir" required class="field" placeholder="/tmp/pak/imports/cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				BIN <span class="text-destructive">*</span>
				<input name="bin" required class="field" placeholder="./build/cmatrix" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				LIB <span class="text-xs text-muted-foreground">(path, or 0 if none)</span>
				<input name="lib" class="field" placeholder="0" />
			</label>
			<div class="flex gap-6">
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" name="install_bin" value="y" checked class="accent-primary" />
					INSTALL_BIN
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" name="install_lib" value="y" class="accent-primary" />
					INSTALL_LIB
				</label>
			</div>
			<label class="flex flex-col gap-1 text-sm">
				BUILD_SCRIPT <span class="text-destructive">*</span>
				<span class="text-xs text-muted-foreground">one shell command per line</span>
				<textarea
					name="build_script"
					required
					rows="5"
					class="field font-mono"
					placeholder={`mkdir -p build\ncd build\ncmake ..\nmake -j16`}
				></textarea>
			</label>
		</fieldset>

		<Button type="submit" disabled={submitting}>{submitting ? 'opening PR…' : 'open pull request'}</Button>
	</form>
{/if}

<style>
	.field {
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-input);
		color: var(--color-foreground);
		padding: 0.5rem 0.65rem;
		font-size: 0.875rem;
	}
	.field:focus {
		outline: 2px solid var(--color-ring);
		outline-offset: 1px;
	}
</style>
