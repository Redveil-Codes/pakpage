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

<style>
	.shell {
		max-width: 860px;
		margin: 0 auto;
		padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 1.5rem) 4rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: clamp(1.75rem, 5vw, 2.75rem);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--text);
	}

	.brand .accent {
		color: var(--accent);
	}

	.brand:hover {
		text-decoration: none;
		color: var(--text);
	}

	.logo {
		border-radius: 8px;
		transition: transform 0.2s var(--ease);
	}

	.brand:hover .logo {
		transform: rotate(-4deg) scale(1.05);
	}

	nav {
		display: flex;
		gap: 1.1rem;
	}

	nav a {
		color: var(--text-dim);
		font-size: 0.9rem;
	}

	nav a:hover {
		color: var(--accent);
	}

	main {
		flex: 1;
	}

	footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		color: var(--text-dimmer);
		font-size: 0.8rem;
	}
</style>
