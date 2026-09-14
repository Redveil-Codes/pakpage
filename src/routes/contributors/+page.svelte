<script lang="ts">
	import { fly } from 'svelte/transition';
	import * as Pagination from '$lib/components/ui/pagination';
	import { Badge } from '$lib/components/ui/badge';
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
	<meta name="description" content="the people behind Pak." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="contributors — PakPage" />
	<meta property="og:description" content="the people behind Pak." />
	<meta name="twitter:card" content="summary" />
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
				{#if c.badges.length}
					<div class="contrib-badges">
						{#each c.badges as badge (badge.label)}
							{#if badge.href}
								<Badge href={badge.href} target="_blank" rel="noreferrer">{badge.label}</Badge>
							{:else}
								<Badge>{badge.label}</Badge>
							{/if}
						{/each}
					</div>
				{/if}
				<div class="contrib-bio">{@html c.bioHtml}</div>
			</div>
		</li>
	{:else}
		<li class="empty">no contributors yet</li>
	{/each}
</ul>

{#if totalPages > 1}
	<Pagination.Root count={data.contributors.length} perPage={PAGE_SIZE} bind:page class="mt-7 flex justify-center">
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
