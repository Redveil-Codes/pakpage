<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header>
		<a class="brand" href="/">
			<span class="dot"></span>
			pak<span class="accent">database</span>
		</a>
		<nav>
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

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);
		animation: pulse 2.4s var(--ease) infinite;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent);
		}
		70% {
			box-shadow: 0 0 0 7px color-mix(in srgb, var(--accent) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent);
		}
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
