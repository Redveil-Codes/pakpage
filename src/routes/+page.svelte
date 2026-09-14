<script lang="ts">
	import { browser } from '$app/environment';
	import { searchPackages } from '$lib/data';
	import { fly, scale } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let query = $state(browser ? (new URLSearchParams(location.search).get('q') ?? '') : '');
	let inputEl: HTMLInputElement;
	let openDepsFor = $state<string | null>(null);

	let results = $derived(query.trim() ? searchPackages(query) : data.packages);

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
	{#each results as pkg, i (pkg.slug)}
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
		position: relative;
		border: 1px solid var(--border);
		border-radius: 10px;
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
		padding: 0.95rem 1.1rem;
	}

	.card-link {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.card-body {
		position: relative;
		z-index: 2;
		padding: 0.95rem 1.1rem;
		pointer-events: none;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		font-weight: 600;
	}

	.results li:hover .name {
		color: var(--accent);
	}

	.name {
		color: var(--text);
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
		position: relative;
		z-index: 3;
		pointer-events: auto;
		font-family: inherit;
		font-size: 0.72rem;
		color: var(--text-dim);
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.15rem 0.45rem;
		cursor: pointer;
		transition:
			border-color 0.15s var(--ease),
			color 0.15s var(--ease);
	}

	.tag:hover {
		border-color: var(--accent-dim);
		color: var(--accent);
	}

	.dep-wrap {
		position: relative;
		z-index: 3;
		pointer-events: auto;
	}

	.dep-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 4;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 140px;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.35rem;
		box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--ctp-crust) 90%, transparent);
		transform-origin: top left;
	}

	.dep-menu button {
		font-family: inherit;
		text-align: left;
		font-size: 0.78rem;
		color: var(--text-dim);
		background: none;
		border: none;
		border-radius: 5px;
		padding: 0.3rem 0.5rem;
		cursor: pointer;
		transition:
			background 0.12s var(--ease),
			color 0.12s var(--ease);
	}

	.dep-menu button:hover {
		background: var(--bg-card);
		color: var(--accent);
	}
</style>
