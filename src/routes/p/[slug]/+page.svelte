<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';
	import { getPackageBySlug, quoteIfNeeded } from '$lib/search';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as ScrollArea from '$lib/components/ui/scroll-area';

	let { data }: PageProps = $props();
	let pkg = $derived(data.pkg);
	let repo = $derived(data.repo);

	let copied = $state(false);
	let activeFile = $state('package.yml');

	const MAX_BODY_HEIGHT = 420;
	let bodyHeight = $state(MAX_BODY_HEIGHT);
	let measureEl = $state<HTMLDivElement>();

	$effect(() => {
		activeFile;
		tick().then(() => {
			if (measureEl) bodyHeight = Math.min(measureEl.scrollHeight, MAX_BODY_HEIGHT);
		});
	});

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function copyInstall() {
		await navigator.clipboard.writeText(`pak + ${pkg.slug}`);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

	let githubUrl = $derived(`${repo.httpsUrl}/tree/main/packages/${pkg.dir}`);
</script>

<svelte:head>
	<title>{pkg.name} — PakPage</title>
	<meta name="description" content={pkg.description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="{pkg.name} — PakPage" />
	<meta property="og:description" content={pkg.description} />
	<meta name="twitter:card" content="summary" />
	<link rel="stylesheet" href="/css/package.css" />
</svelte:head>

<div in:fade={{ duration: 160 }}>
	<a class="back" href="/">&larr; all packages</a>

	<h1>{pkg.name} <span class="version">{pkg.version}</span></h1>
	<p class="desc">{pkg.description}</p>

	<button class="install" onclick={copyInstall}>
		<code>pak + {pkg.slug}</code>
		<span class="copy-flag" class:copied>{copied ? 'copied' : 'copy'}</span>
	</button>

	<section class="panel" in:fly={{ y: 8, duration: 220, delay: 40 }}>
		<h2>details</h2>
		<dl>
			{#if pkg.homepage}
				<dt>upstream url</dt>
				<dd><a href={pkg.homepage} target="_blank" rel="noreferrer">{pkg.homepage}</a></dd>
			{/if}
			{#if pkg.license}
				<dt>license</dt>
				<dd><a href="/?q=l:{pkg.license}">{pkg.license}</a></dd>
			{/if}
			<dt>dependencies</dt>
			<dd>
				{#if pkg.dependencies.length}
					{#each pkg.dependencies as dep, i (dep)}
						{#if i > 0},&nbsp;{/if}{#if getPackageBySlug(data.packages, dep)}<a href="/p/{dep}"
								>{dep}</a
							>{:else}{dep}{/if}
					{/each}
				{:else}
					none
				{/if}
			</dd>
			{#if pkg.maintainer}
				<dt>maintainer</dt>
				<dd><a href="/?q=m:{quoteIfNeeded(pkg.maintainer)}">{pkg.maintainer}</a></dd>
			{/if}
			{#if pkg.firstCommit}
				<dt>submitter</dt>
				<dd>{pkg.firstCommit.authorName}</dd>
				<dt>first submitted</dt>
				<dd>{fmtDate(pkg.firstCommit.date)}</dd>
			{/if}
			{#if pkg.lastCommit}
				<dt>last packager</dt>
				<dd>{pkg.lastCommit.authorName}</dd>
				<dt>last updated</dt>
				<dd>
					{fmtDate(pkg.lastCommit.date)}
					<span class="msg">— {pkg.lastCommit.message}</span>
				</dd>
			{/if}
		</dl>
	</section>

	{#if pkg.pakRaw}
		<Tabs.Root bind:value={activeFile}>
			<div class="term" in:fly={{ y: 8, duration: 220, delay: 80 }}>
				<div class="term-bar">
					<span class="d red"></span><span class="d yellow"></span><span class="d green"></span>
					<Tabs.List class="term-tab-list">
						<Tabs.Trigger value="package.yml" class="term-tab-trigger">package.yml</Tabs.Trigger>
						<Tabs.Trigger value="package.pak" class="term-tab-trigger">package.pak</Tabs.Trigger>
						<Tabs.Trigger value="history" class="term-tab-trigger">history</Tabs.Trigger>
					</Tabs.List>
					<Button href={githubUrl} target="_blank" rel="noreferrer" variant="ghost" size="sm" class="term-github">
						<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
							<path
								d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.96.68 1.94 0 1.4-.01 2.53-.01 2.87 0 .28.18.6.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
							/>
						</svg>
						View on GitHub
					</Button>
				</div>
				<div class="term-body" style="height: {bodyHeight}px">
					<ScrollArea.Root class="h-full" viewportClass="px-1">
						<div bind:this={measureEl}>
							<Tabs.Content value="package.yml"><pre>{pkg.yamlRaw}</pre></Tabs.Content>
							<Tabs.Content value="package.pak"><pre>{pkg.pakRaw}</pre></Tabs.Content>
							<Tabs.Content value="history">
								<ul class="divide-y divide-border">
									{#each pkg.commits as commit (commit.hash)}
										<li class="flex flex-col gap-0.5 px-3 py-2.5 text-sm">
											<div class="flex items-baseline justify-between gap-3">
												<span class="truncate text-foreground">{commit.message}</span>
												<span class="shrink-0 font-mono text-xs text-primary"
													>{commit.hash.slice(0, 7)}</span
												>
											</div>
											<div class="text-xs text-muted-foreground">
												{commit.authorName} — {fmtDate(commit.date)}
											</div>
										</li>
									{:else}
										<li class="px-3 py-2.5 text-sm text-muted-foreground">no history</li>
									{/each}
								</ul>
							</Tabs.Content>
						</div>
					</ScrollArea.Root>
				</div>
			</div>
		</Tabs.Root>
	{/if}
</div>
