<script lang="ts">
	import { Pagination, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<Pagination.NextButtonProps> & { children?: Snippet } = $props();
</script>

<Pagination.NextButton
	class={cn(
		'flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
			<path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{/if}
</Pagination.NextButton>
