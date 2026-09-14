<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>why netlify — PakPage</title>
	<meta name="description" content="why PakPage runs on Netlify." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="why netlify — PakPage" />
	<meta property="og:description" content="why PakPage runs on Netlify." />
	<meta name="twitter:card" content="summary" />
	<link rel="stylesheet" href="/css/content.css" />
</svelte:head>

<a class="back" href="/">&larr; all packages</a>

<div class="content">
	{@html data.html}
</div>
