<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let query = $state(browser ? (new URLSearchParams(location.search).get('q') ?? '') : '');

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.packages;
		return data.packages.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.slug.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q)
		);
	});

	function onInput() {
		const url = new URL(location.href);
		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');
		history.replaceState(history.state, '', url);
	}
</script>

<svelte:head>
	<title>pakdatabase</title>
</svelte:head>

<section class="intro">
	<h1>pak</h1>
	<p>build from source, no binaries, no bullshit. every package below is just a package.yml + package.pak.</p>
	<pre>pak ! = help
pak ? = search / query
pak + = add package
pak - = remove package
pak = = show installed packages</pre>
</section>

<input
	type="search"
	placeholder="search packages…"
	bind:value={query}
	oninput={onInput}
	aria-label="Search packages"
/>

<ul class="results">
	{#each filtered as pkg (pkg.slug)}
		<li>
			<a href="/p/{pkg.slug}">
				<span class="name">{pkg.name}</span>
				<span class="version">{pkg.version}</span>
			</a>
			<p>{pkg.description}</p>
		</li>
	{:else}
		<li class="empty">no packages match "{query}"</li>
	{/each}
</ul>

<style>
	.intro {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.75rem;
		margin: 0 0 0.75rem;
	}

	.intro p {
		color: var(--text-dim);
		max-width: 60ch;
	}

	input {
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.results li {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.9rem 1.1rem;
		background: var(--bg-raised);
	}

	.results li.empty {
		color: var(--text-dim);
		background: none;
		border-style: dashed;
	}

	.results a {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		color: var(--text);
		font-weight: 600;
	}

	.results a:hover {
		text-decoration: none;
	}

	.results a:hover .name {
		text-decoration: underline;
	}

	.version {
		color: var(--accent);
		font-weight: 400;
		font-size: 0.85rem;
	}

	.results p {
		margin: 0.35rem 0 0;
		color: var(--text-dim);
		font-size: 0.9rem;
	}
</style>
