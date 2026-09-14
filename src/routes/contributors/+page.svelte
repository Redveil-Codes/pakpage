<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>contributors — PakPage</title>
	<link rel="stylesheet" href="/css/contributors.css" />
</svelte:head>

<section class="intro">
	<h1>contributors</h1>
	<p>the people behind pak. add yourself: <code>contributors/&lt;slug&gt;/bio.md</code>.</p>
</section>

<ul class="contrib-grid">
	{#each data.contributors as c, i (c.slug)}
		<li class="contrib-card" in:fly={{ y: 6, duration: 180, delay: Math.min(i * 25, 180) }}>
			<a class="contrib-link" href={c.githubUrl} target="_blank" rel="noreferrer" aria-label={c.name}
			></a>
			<div class="contrib-body">
				<div class="contrib-head">
					<img class="contrib-avatar" src={c.avatarUrl} alt="" width="42" height="42" loading="lazy" />
					<div>
						<div class="contrib-name">{c.name}</div>
						<span class="contrib-username">@{c.username}</span>
					</div>
				</div>
				<div class="contrib-bio">{@html c.bioHtml}</div>
			</div>
		</li>
	{:else}
		<li class="empty">no contributors yet</li>
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

	.empty {
		color: var(--text-dim);
		border: 1px dashed var(--border);
		border-radius: 10px;
		padding: 0.95rem 1.1rem;
		grid-column: 1 / -1;
		list-style: none;
	}
</style>
