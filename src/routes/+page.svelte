<script lang="ts">
	import { browser } from '$app/environment';
	import { searchPackages } from '$lib/search';
	import { fly, scale } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

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
			<a class="card-link" href="/p/{pkg.slug}" aria-label={pkg.name}></a>
			<div class="card-body">
				<div class="row">
					<span class="name">{pkg.name}</span>
					<span class="version">{pkg.version}</span>
				</div>
				<p>{pkg.description}</p>
				<div class="tags">
					{#if pkg.license}
						<button class="tag" onclick={() => addFilter(`l:${pkg.license}`)}>{pkg.license}</button>
					{/if}
					{#if pkg.dependencies.length === 1}
						<button class="tag" onclick={() => addFilter(`d:${pkg.dependencies[0]}`)}
							>{pkg.dependencies[0]}</button
						>
					{:else if pkg.dependencies.length > 1}
						<div class="dep-wrap">
							<button class="tag" onclick={(e) => toggleDeps(e, pkg.slug)}>
								{pkg.dependencies.length} deps
							</button>
							{#if openDepsFor === pkg.slug}
								<div class="dep-menu" transition:scale={{ duration: 140, start: 0.9 }}>
									{#each pkg.dependencies as dep (dep)}
										<button onclick={(e) => pickDep(e, dep)}>{dep}</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</li>
	{:else}
		<li class="empty">no packages match "{query}"</li>
	{/each}
</ul>

{#if totalPages > 1}
	<div class="pager">
		<button disabled={pageClamped <= 1} onclick={() => (page = pageClamped - 1)}>&larr; prev</button>
		<span class="pos">page {pageClamped} / {totalPages}</span>
		<button disabled={pageClamped >= totalPages} onclick={() => (page = pageClamped + 1)}
			>next &rarr;</button
		>
	</div>
{/if}
