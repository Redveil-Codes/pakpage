<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { PageProps } from './$types';
	import { getPackageBySlug, repo } from '$lib/data';

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

	let blobBase = $derived(`${repo.httpsUrl}/blob/main/packages/${pkg.dir}`);
	let commitsUrl = $derived(`${repo.httpsUrl}/commits/main/packages/${pkg.dir}`);
	let snapshotUrl = $derived(`${repo.httpsUrl}/archive/refs/heads/main.zip`);
</script>

<svelte:head>
	<title>{pkg.name} — PakPage</title>
</svelte:head>

<div in:fade={{ duration: 160 }}>
	<a class="back" href="/">&larr; all packages</a>

	<h1>{pkg.name} <span class="version">{pkg.version}</span></h1>
	<p class="desc">{pkg.description}</p>

	<button class="install" onclick={copyInstall}>
		<code>pak + {pkg.slug}</code>
		<span class="copy-flag" class:copied>{copied ? 'copied' : 'copy'}</span>
	</button>

	<div class="grid">
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
							{#if i > 0},&nbsp;{/if}{#if getPackageBySlug(dep)}<a href="/p/{dep}">{dep}</a
								>{:else}{dep}{/if}
						{/each}
					{:else}
						none
					{/if}
				</dd>
				{#if pkg.maintainer}
					<dt>maintainer</dt>
					<dd><a href="/?q=m:{pkg.maintainer}">{pkg.maintainer}</a></dd>
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

		<section class="panel" in:fly={{ y: 8, duration: 220, delay: 80 }}>
			<h2>package actions</h2>
			<ul class="actions">
				<li>
					<a href="{blobBase}/package.yml" target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
							><path
								d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linejoin="round"
							/><path d="M14 3v5h5" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg
						>
						view package.yml
					</a>
				</li>
				<li>
					<a href="{blobBase}/package.pak" target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
							><path
								d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linejoin="round"
							/><path d="M14 3v5h5" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg
						>
						view package.pak
					</a>
				</li>
				<li>
					<a href={commitsUrl} target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
							><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" /><path
								d="M12 8v4l3 2"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/></svg
						>
						view changes
					</a>
				</li>
				<li>
					<a href={snapshotUrl} target="_blank" rel="noreferrer">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
							><path
								d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/></svg
						>
						download repo snapshot (.zip)
					</a>
				</li>
			</ul>
		</section>
	</div>

	{#if pkg.pak}
		<div class="term">
			<div class="term-bar"><span class="d red"></span><span class="d yellow"></span><span
					class="d green"
				></span><span class="term-title">package.pak</span></div>
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
		</div>
	{/if}
</div>

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

	.install {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-family: inherit;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		margin-bottom: 2rem;
		cursor: pointer;
		color: var(--text);
		transition:
			border-color 0.18s var(--ease),
			transform 0.12s var(--ease);
	}

	.install:hover {
		border-color: var(--accent-dim);
	}

	.install:active {
		transform: scale(0.995);
	}

	.install code {
		color: var(--accent);
		overflow-x: auto;
	}

	.copy-flag {
		color: var(--text-dim);
		font-size: 0.8rem;
		flex-shrink: 0;
		margin-left: 0.75rem;
		transition: color 0.15s var(--ease);
	}

	.copy-flag.copied {
		color: var(--accent);
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
		transition: border-color 0.18s var(--ease);
	}

	.panel:hover {
		border-color: var(--border-hover);
	}

	.panel h2 {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-dimmer);
		margin: 0 0 0.75rem;
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
		gap: 0.35rem;
	}

	.actions a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--text-dim);
	}

	.actions a:hover {
		color: var(--accent);
	}

	.actions svg {
		flex-shrink: 0;
		opacity: 0.8;
	}

	.term {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}

	.term-bar {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-raised);
		border-bottom: 1px solid var(--border);
	}

	.d {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}

	.d.red {
		background: var(--ctp-red);
	}

	.d.yellow {
		background: var(--ctp-yellow);
	}

	.d.green {
		background: var(--ctp-green);
	}

	.term-title {
		margin-left: 0.5rem;
		font-size: 0.78rem;
		color: var(--text-dimmer);
	}

	.term pre {
		border: none;
		border-radius: 0;
		margin: 0;
	}
</style>
