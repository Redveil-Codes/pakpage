<script lang="ts">
	import { browser } from '$app/environment';
	import { page as pageState } from '$app/state';
	import { searchPackages } from '$lib/search';
	import { fly, scale } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { Package } from '$lib/types';
	import type { PageProps } from './$types';

	function initials(name: string) {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? '')
			.join('');
	}

	function avatarUrl(maintainer: string) {
		return /^[A-Za-z0-9-]+$/.test(maintainer) ? `https://github.com/${maintainer}.png` : undefined;
	}

	let { data }: PageProps = $props();

	let copiedSlug = $state<string | null>(null);

	async function copyInstall(e: Event, pkg: Package) {
		e.stopPropagation();
		await navigator.clipboard.writeText(`pak + ${pkg.slug}`);
		copiedSlug = pkg.slug;
		setTimeout(() => (copiedSlug = null), 1200);
	}

	function githubUrl(pkg: Package) {
		return `${data.repo.httpsUrl}/tree/main/packages/${pkg.dir}`;
	}

	let forceSkeleton = $derived(pageState.url.searchParams.has('force-skeleton'));

	const PAGE_SIZE = 12;

	let query = $state(browser ? (new URLSearchParams(location.search).get('q') ?? '') : '');
	let inputEl: HTMLInputElement;
	let openDepsFor = $state<string | null>(null);
	let page = $state(1);

	let results = $derived(query.trim() ? searchPackages(data.packages, query) : data.packages);
	let totalPages = $derived(Math.max(1, Math.ceil(results.length / PAGE_SIZE)));
	let pageClamped = $derived(Math.min(page, totalPages));
	let pageItems = $derived(
		results.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE)
	);

	$effect(() => {
		results;
		page = 1;
	});

	function onInput() {
		const url = new URL(location.href);
		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');
		history.replaceState(history.state, '', url);
	}

	function addFilter(token: string) {
		const tokens = query.trim().split(/\s+/).filter(Boolean);
		if (!tokens.includes(token)) tokens.push(token);
		query = tokens.join(' ');
		onInput();
		inputEl.focus();
		openDepsFor = null;
	}

	function toggleDeps(e: MouseEvent, slug: string) {
		e.stopPropagation();
		openDepsFor = openDepsFor === slug ? null : slug;
	}

	function onKeydown(e: KeyboardEvent) {
		const typing = document.activeElement instanceof HTMLInputElement;
		if (e.key === '/' && !typing) {
			e.preventDefault();
			inputEl.focus();
		} else if (e.key === 'Escape') {
			if (openDepsFor) {
				openDepsFor = null;
			} else if (document.activeElement === inputEl) {
				query = '';
				inputEl.blur();
				onInput();
			}
		}
	}

	function onWindowClick() {
		openDepsFor = null;
	}

	function pickDep(e: MouseEvent, dep: string) {
		e.stopPropagation();
		addFilter(`d:${dep}`);
	}
</script>

<svelte:head>
	<title>PakPage</title>
	<meta name="description" content="build from source, no binaries, no bullshit." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="PakPage" />
	<meta property="og:description" content="build from source, no binaries, no bullshit." />
	<meta name="twitter:card" content="summary" />
	<link rel="stylesheet" href="/css/home.css" />
</svelte:head>

<svelte:window onkeydown={onKeydown} onclick={onWindowClick} />

<section class="intro">
	<h1>pak</h1>
	<p>build from source, no binaries, no bullshit.</p>
	<pre>pak ! = help
pak ? = search / query
pak + = add package
pak - = remove package
pak = = show installed packages</pre>
</section>

<div class="search">
	<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
		<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
		<path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
	</svg>
	<input
		bind:this={inputEl}
		type="search"
		placeholder="search packages…"
		bind:value={query}
		oninput={onInput}
		aria-label="Search packages"
	/>
	<kbd>/</kbd>
</div>

<div class="hints">
	<span><kbd>d:</kbd>dependency</span>
	<span><kbd>l:</kbd>license</span>
	<span><kbd>m:</kbd>maintainer</span>
</div>

<div class="count">{results.length} package{results.length === 1 ? '' : 's'}</div>

<ul class="results">
	{#each pageItems as pkg, i (pkg.slug)}
		<li in:fly={{ y: 6, duration: 180, delay: Math.min(i * 20, 180) }}>
			<ContextMenu.Root>
			<ContextMenu.Trigger class="contents">
			<Card.Root class="h-full transition-transform hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
				<a class="absolute inset-0 z-[1]" href="/p/{pkg.slug}" aria-label={pkg.name}></a>
				<div class="pointer-events-none relative z-[2]">
					<Card.Header class="flex-row items-center justify-between gap-2 space-y-0">
						<div class="flex min-w-0 items-center gap-2">
							{#if pkg.maintainer}
								<Tooltip.Root>
									<Tooltip.Trigger class="pointer-events-auto">
										<Avatar.Root class="h-6 w-6">
											{#if avatarUrl(pkg.maintainer) && !forceSkeleton}
												<Avatar.Image src={avatarUrl(pkg.maintainer)} alt={pkg.maintainer} />
											{/if}
											<Avatar.Fallback class="text-[10px]" loading={forceSkeleton}
												>{initials(pkg.maintainer)}</Avatar.Fallback
											>
										</Avatar.Root>
									</Tooltip.Trigger>
									<Tooltip.Content>maintainer: {pkg.maintainer}</Tooltip.Content>
								</Tooltip.Root>
							{/if}
							<Card.Title class="truncate">{pkg.name}</Card.Title>
						</div>
						<span class="shrink-0 text-xs text-primary">{pkg.version}</span>
					</Card.Header>
					<Card.Content>
						<Card.Description>{pkg.description}</Card.Description>
						<div class="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
							{#if pkg.license}
								<Badge interactive onclick={() => addFilter(`l:${pkg.license}`)}>{pkg.license}</Badge>
							{/if}
							{#if pkg.dependencies.length === 1}
								<Badge interactive onclick={() => addFilter(`d:${pkg.dependencies[0]}`)}
									>{pkg.dependencies[0]}</Badge
								>
							{:else if pkg.dependencies.length > 1}
								<div class="relative">
									<Badge interactive onclick={(e: MouseEvent) => toggleDeps(e, pkg.slug)}>
										{pkg.dependencies.length} deps
									</Badge>
									{#if openDepsFor === pkg.slug}
										<div
											class="absolute left-0 top-[calc(100%+6px)] z-10 flex min-w-[140px] flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
											transition:scale={{ duration: 140, start: 0.9 }}
										>
											{#each pkg.dependencies as dep (dep)}
												<button
													class="cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													onclick={(e) => pickDep(e, dep)}>{dep}</button
												>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</Card.Content>
				</div>
			</Card.Root>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item href="/p/{pkg.slug}">open package</ContextMenu.Item>
				<ContextMenu.Item onSelect={(e) => copyInstall(e, pkg)}>
					{copiedSlug === pkg.slug ? 'copied!' : `copy "pak + ${pkg.slug}"`}
				</ContextMenu.Item>
				{#if pkg.license}
					<ContextMenu.Item onSelect={() => addFilter(`l:${pkg.license}`)}
						>filter by license: {pkg.license}</ContextMenu.Item
					>
				{/if}
				{#if pkg.maintainer}
					<ContextMenu.Item onSelect={() => addFilter(`m:${pkg.maintainer}`)}
						>filter by maintainer: {pkg.maintainer}</ContextMenu.Item
					>
				{/if}
				<ContextMenu.Item href={githubUrl(pkg)} target="_blank" rel="noreferrer"
					>view on GitHub</ContextMenu.Item
				>
			</ContextMenu.Content>
			</ContextMenu.Root>
		</li>
	{:else}
		<li class="empty">no packages match "{query}"</li>
	{/each}
</ul>

{#if totalPages > 1}
	<Pagination.Root count={results.length} perPage={PAGE_SIZE} bind:page class="mt-7 flex justify-center">
		{#snippet children({ pages })}
			<div class="flex items-center gap-1.5">
				<Pagination.PrevButton />
				{#each pages as p (p.key)}
					{#if p.type === 'ellipsis'}
						<span class="px-1 text-sm text-muted-foreground">…</span>
					{:else}
						<Pagination.Page page={p}>{p.value}</Pagination.Page>
					{/if}
				{/each}
				<Pagination.NextButton />
			</div>
		{/snippet}
	</Pagination.Root>
{/if}
