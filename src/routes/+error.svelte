<script lang="ts">
	import { page } from '$app/state';

	let headline = $derived(page.status === 404 ? 'nothing here.' : 'something broke.');
</script>

<svelte:head>
	<title>{page.status} — PakPage</title>
	<link rel="stylesheet" href="/css/error.css" />
</svelte:head>

<div class="err">
	<p class="err-code">{page.status}</p>
	<p class="err-headline">{headline}</p>
	<p class="err-msg">{page.error?.message ?? 'no build from that source.'}</p>
	<a class="back" href="/">&larr; back to packages</a>
</div>
