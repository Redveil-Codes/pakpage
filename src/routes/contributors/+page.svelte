<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const PAGE_SIZE = 15;

	let page = $state(1);
	let totalPages = $derived(Math.max(1, Math.ceil(data.contributors.length / PAGE_SIZE)));
	let pageClamped = $derived(Math.min(page, totalPages));
	let pageItems = $derived(
		data.contributors.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE)
	);
</script>

<svelte:head>
	<title>contributors — PakPage</title>
	<link rel="stylesheet" href="/css/contributors.css" />
</svelte:head>

<section class="intro">
	<h1>contributors</h1>
	<p>the people behind Pak.</p>
</section>

<ul class="contrib-grid">
	{#each pageItems as c, i (c.slug)}
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

{#if totalPages > 1}
	<div class="pager">
		<button disabled={pageClamped <= 1} onclick={() => (page = pageClamped - 1)}>&larr; prev</button>
		<span class="pos">page {pageClamped} / {totalPages}</span>
		<button disabled={pageClamped >= totalPages} onclick={() => (page = pageClamped + 1)}
			>next &rarr;</button
		>
	</div>
{/if}
