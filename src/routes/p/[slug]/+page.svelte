<script lang="ts">
	import type { PageProps } from './$types';
	import { getPackageBySlug } from '$lib/data';

	let { data }: PageProps = $props();
	let pkg = $derived(data.pkg);
	let copied = $state(false);

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
</script>

<svelte:head>
	<title>{pkg.name} — pakdatabase</title>
</svelte:head>

<a class="back" href="/">&larr; all packages</a>

<h1>{pkg.name} <span class="version">{pkg.version}</span></h1>
<p class="desc">{pkg.description}</p>

<button class="install" onclick={copyInstall}>
	<code>pak + {pkg.slug}</code>
	<span>{copied ? 'copied' : 'copy'}</span>
</button>

<dl>
	{#if pkg.homepage}
		<dt>homepage</dt>
		<dd><a href={pkg.homepage} target="_blank" rel="noreferrer">{pkg.homepage}</a></dd>
	{/if}
	{#if pkg.license}
		<dt>license</dt>
		<dd>{pkg.license}</dd>
	{/if}
	<dt>dependencies</dt>
	<dd>
		{#if pkg.dependencies.length}
			{#each pkg.dependencies as dep, i (dep)}
				{#if i > 0},&nbsp;{/if}{#if getPackageBySlug(dep)}<a href="/p/{dep}">{dep}</a
					>{:else}{dep}{/if}
			{/each}
		{:else}
			none
		{/if}
	</dd>
	{#if pkg.lastCommit}
		<dt>last updated</dt>
		<dd>
			{fmtDate(pkg.lastCommit.date)} by {pkg.lastCommit.authorName}
			<span class="msg">— {pkg.lastCommit.message}</span>
		</dd>
	{/if}
</dl>

{#if pkg.pak}
	<h2>package.pak</h2>
	<pre>{#if pkg.pak.CC}CC={pkg.pak.CC}
{/if}SRC={pkg.pak.SRC}
DEPENDENCIES={Array.isArray(pkg.pak.DEPENDENCIES) ? pkg.pak.DEPENDENCIES.join(' ') : pkg.pak.DEPENDENCIES}
BUILDDIR={pkg.pak.BUILDDIR}
BIN={pkg.pak.BIN}
LIB={pkg.pak.LIB}
INSTALL_BIN={pkg.pak.INSTALL_BIN}
INSTALL_LIB={pkg.pak.INSTALL_LIB}
BUILD_SCRIPT=(
{#each pkg.pak.BUILD_SCRIPT ?? [] as line}    {line}
{/each})</pre>
{/if}

<style>
	.back {
		display: inline-block;
		color: var(--text-dim);
		font-size: 0.85rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.6rem;
	}

	.version {
		color: var(--accent);
		font-weight: 400;
		font-size: 1rem;
	}

	.desc {
		color: var(--text-dim);
		max-width: 60ch;
		margin: 0 0 1.5rem;
	}

	.install {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-family: inherit;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.7rem 1rem;
		margin-bottom: 2rem;
		cursor: pointer;
		color: var(--text);
	}

	.install:hover {
		border-color: var(--accent-dim);
	}

	.install code {
		color: var(--accent);
	}

	.install span {
		color: var(--text-dim);
		font-size: 0.8rem;
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.4rem 1.5rem;
		margin: 0 0 2rem;
	}

	dt {
		color: var(--text-dim);
		font-size: 0.85rem;
	}

	dd {
		margin: 0;
	}

	.msg {
		color: var(--text-dim);
	}

	h2 {
		font-size: 1rem;
		margin-bottom: 0.6rem;
	}
</style>
