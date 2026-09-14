<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header>
		<a class="brand" href="/">pak<span>database</span></a>
		<nav>
			<a href="https://github.com/Redveil-Codes/pakar" target="_blank" rel="noreferrer">source</a>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<span>pak — build from source</span>
	</footer>
</div>

<style>
	.shell {
		max-width: 860px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 2.5rem;
	}

	.brand {
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--text);
	}

	.brand span {
		color: var(--accent);
	}

	.brand:hover {
		text-decoration: none;
	}

	nav a {
		color: var(--text-dim);
		font-size: 0.9rem;
	}

	main {
		flex: 1;
	}

	footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		color: var(--text-dim);
		font-size: 0.8rem;
	}
</style>
