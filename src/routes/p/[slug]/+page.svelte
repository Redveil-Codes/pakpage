<script lang="ts">
	import type { PageProps } from './$types';
	import { getPackageBySlug, repo } from '$lib/data';

	let { data }: PageProps = $props();
	let pkg = $derived(data.pkg);

	let copiedInstall = $state(false);
	let copiedClone = $state(false);

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function copy(text: string, flag: 'install' | 'clone') {
		await navigator.clipboard.writeText(text);
		if (flag === 'install') {
			copiedInstall = true;
			setTimeout(() => (copiedInstall = false), 1200);
		} else {
			copiedClone = true;
			setTimeout(() => (copiedClone = false), 1200);
		}
	}

	let blobBase = $derived(`${repo.httpsUrl}/blob/main/packages/${pkg.dir}`);
	let commitsUrl = $derived(`${repo.httpsUrl}/commits/main/packages/${pkg.dir}`);
	let snapshotUrl = $derived(`${repo.httpsUrl}/archive/refs/heads/main.zip`);
</script>

<svelte:head>
	<title>{pkg.name} — pakdatabase</title>
</svelte:head>

<a class="back" href="/">&larr; all packages</a>

<h1>{pkg.name} <span class="version">{pkg.version}</span></h1>
<p class="desc">{pkg.description}</p>

<button class="install" onclick={() => copy(`pak + ${pkg.slug}`, 'install')}>
	<code>pak + {pkg.slug}</code>
	<span>{copiedInstall ? 'copied' : 'copy'}</span>
</button>

<div class="grid">
	<section class="panel">
		<h2>details</h2>
		<dl>
			{#if pkg.homepage}
				<dt>upstream url</dt>
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
			{#if pkg.maintainer}
				<dt>maintainer</dt>
				<dd>{pkg.maintainer}</dd>
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

	<section class="panel">
		<h2>package actions</h2>
		<ul class="actions">
			<li><a href="{blobBase}/package.yml" target="_blank" rel="noreferrer">view package.yml</a></li>
			<li><a href="{blobBase}/package.pak" target="_blank" rel="noreferrer">view package.pak</a></li>
			<li><a href={commitsUrl} target="_blank" rel="noreferrer">view changes</a></li>
			<li><a href={snapshotUrl} target="_blank" rel="noreferrer">download repo snapshot (.zip)</a></li>
		</ul>

		<h2>git clone url</h2>
		<button class="clone" onclick={() => copy(repo.cloneUrl, 'clone')}>
			<code>{repo.cloneUrl}</code>
			<span>{copiedClone ? 'copied' : 'copy'}</span>
		</button>
	</section>
</div>

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
		font-size: clamp(1.4rem, 3.5vw, 1.75rem);
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

	.install,
	.clone {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-family: inherit;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		cursor: pointer;
		color: var(--text);
		transition:
			border-color 0.18s var(--ease),
			transform 0.12s var(--ease);
	}

	.install {
		margin-bottom: 2rem;
	}

	.install:hover,
	.clone:hover {
		border-color: var(--accent-dim);
	}

	.install:active,
	.clone:active {
		transform: scale(0.995);
	}

	.install code,
	.clone code {
		color: var(--accent);
		overflow-x: auto;
	}

	.install span,
	.clone span {
		color: var(--text-dim);
		font-size: 0.8rem;
		flex-shrink: 0;
		margin-left: 0.75rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.panel {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 1rem 1.15rem;
		background: var(--bg-card);
	}

	.panel h2 {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-dimmer);
		margin: 0 0 0.75rem;
	}

	.panel h2:not(:first-child) {
		margin-top: 1.25rem;
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.4rem 1.25rem;
		margin: 0;
	}

	dt {
		color: var(--text-dim);
		font-size: 0.85rem;
	}

	dd {
		margin: 0;
		word-break: break-word;
	}

	.msg {
		color: var(--text-dimmer);
	}

	.actions {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.actions a {
		font-size: 0.9rem;
	}

	h2 {
		font-size: 1rem;
		margin-bottom: 0.6rem;
	}
</style>
