<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header>
		<a class="brand" href="/">
			<svg class="logo" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
				<rect width="32" height="32" rx="8" fill="var(--ctp-base)" />
				<path
					d="M9 11l6 5-6 5"
					stroke="var(--accent)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
				/>
				<rect x="17" y="19" width="8" height="3" rx="1.5" fill="var(--accent)" />
			</svg>
			<span class="wordmark">Pak<span class="accent">Page</span></span>
		</a>
		<nav>
			<a href="/contributors">contributors</a>
			<a href="https://github.com/Redveil-Codes/pakar" target="_blank" rel="noreferrer">source</a>
		</nav>
	</header>

	<main>
		{#key page.url.pathname}
			<div in:fade={{ duration: 180, delay: 60 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<footer>
		<span>pak — build from source</span>
	</footer>
</div>
