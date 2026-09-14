<script lang="ts">
	import { browser } from '$app/environment';
	import { searchPackages } from '$lib/data';
	import { fly } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let query = $state(browser ? (new URLSearchParams(location.search).get('q') ?? '') : '');
	let inputEl: HTMLInputElement;

	let results = $derived(query.trim() ? searchPackages(query) : data.packages);

	function onInput() {
		const url = new URL(location.href);
		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');
		history.replaceState(history.state, '', url);
	}

	function onKeydown(e: KeyboardEvent) {
		const typing = document.activeElement instanceof HTMLInputElement;
		if (e.key === '/' && !typing) {
			e.preventDefault();
			inputEl.focus();
		} else if (e.key === 'Escape' && document.activeElement === inputEl) {
			query = '';
			inputEl.blur();
			onInput();
		}
	}
</script>

<svelte:head>
	<title>pakdatabase</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

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
	{#each results as pkg, i (pkg.slug)}
		<li in:fly={{ y: 6, duration: 220, delay: i * 25 }}>
			<a href="/p/{pkg.slug}">
				<span class="name">{pkg.name}</span>
				<span class="version">{pkg.version}</span>
			</a>
			<p>{pkg.description}</p>
			<div class="tags">
				{#if pkg.license}<span class="tag">{pkg.license}</span>{/if}
				{#if pkg.dependencies.length}
					<span class="tag">{pkg.dependencies.length} dep{pkg.dependencies.length === 1 ? '' : 's'}</span
					>
				{/if}
			</div>
		</li>
	{:else}
		<li class="empty">no packages match "{query}"</li>
	{/each}
</ul>

<style>
	.intro {
		margin-bottom: clamp(1.5rem, 4vw, 2.25rem);
	}

	h1 {
		font-size: clamp(1.6rem, 4vw, 2.1rem);
		margin: 0 0 0.75rem;
	}

	.intro p {
		color: var(--text-dim);
		max-width: 60ch;
	}

	.search {
		position: relative;
		margin-bottom: 0.6rem;
	}

	.search .icon {
		position: absolute;
		left: 0.85rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-dimmer);
		pointer-events: none;
	}

	.search input {
		width: 100%;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
	}

	.search kbd {
		position: absolute;
		right: 0.7rem;
		top: 50%;
		transform: translateY(-50%);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
		color: var(--text-dim);
		pointer-events: none;
	}

	.hints {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.1rem;
		font-size: 0.78rem;
		color: var(--text-dimmer);
	}

	.hints kbd {
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.05rem 0.35rem;
		margin-right: 0.3rem;
		color: var(--text-dim);
	}

	.count {
		color: var(--text-dimmer);
		font-size: 0.8rem;
		margin-bottom: 1.25rem;
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
		gap: 0.75rem;
	}

	.results li {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.95rem 1.1rem;
		background: var(--bg-card);
		transition:
			border-color 0.18s var(--ease),
			transform 0.18s var(--ease),
			box-shadow 0.18s var(--ease);
	}

	.results li:not(.empty):hover {
		border-color: var(--border-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px -12px color-mix(in srgb, var(--ctp-crust) 80%, transparent);
	}

	.results li.empty {
		color: var(--text-dim);
		background: none;
		border-style: dashed;
		grid-column: 1 / -1;
	}

	.results a {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		color: var(--text);
		font-weight: 600;
	}

	.results a:hover {
		text-decoration: none;
		color: var(--text);
	}

	.results a:hover .name {
		color: var(--accent);
	}

	.name {
		transition: color 0.15s var(--ease);
	}

	.version {
		color: var(--accent);
		font-weight: 400;
		font-size: 0.85rem;
		white-space: nowrap;
	}

	.results p {
		margin: 0.4rem 0 0;
		color: var(--text-dim);
		font-size: 0.9rem;
	}

	.tags {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.6rem;
		flex-wrap: wrap;
	}

	.tag {
		font-size: 0.72rem;
		color: var(--text-dim);
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
	}
</style>
