<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page, navigating } from '$app/state';
	import { fade } from 'svelte/transition';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import '../app.css';

	let { children } = $props();
	let menuOpen = $state(false);
	let forceSkeleton = $derived(page.url.searchParams.has('force-skeleton'));

	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Tooltip.Provider>
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
		<div class="flex items-center gap-2">
			<Button href="/why-netlify" variant="outline" size="sm">Why Netlify?</Button>
			<DropdownMenu.Root bind:open={menuOpen}>
				<DropdownMenu.Trigger
					class="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
					aria-label="menu"
				>
					<span class="relative block h-3.5 w-4">
						<span
							class="absolute left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-200"
							class:top-0={!menuOpen}
							class:top-[6px]={menuOpen}
							class:rotate-45={menuOpen}
						></span>
						<span
							class="absolute left-0 top-[6px] h-0.5 w-4 rounded-full bg-current transition-opacity duration-150"
							class:opacity-0={menuOpen}
						></span>
						<span
							class="absolute bottom-0 left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-200"
							class:bottom-0={!menuOpen}
							class:bottom-[6px]={menuOpen}
							class:-rotate-45={menuOpen}
						></span>
					</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item href="/">home</DropdownMenu.Item>
					<DropdownMenu.Item href="/contributors">contributors</DropdownMenu.Item>
					<DropdownMenu.Item href="https://github.com/Redveil-Codes/pakar" target="_blank" rel="noreferrer"
						>source</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</header>

	<div class="mb-2 h-[2px] w-full">
		{#if navigating.to || forceSkeleton}
			<Skeleton class="h-full w-full rounded-none" />
		{/if}
	</div>

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
</Tooltip.Provider>
