<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		interactive = false,
		href = undefined,
		children,
		...rest
	}: {
		class?: string;
		interactive?: boolean;
		href?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const base =
		'inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground transition-colors';
	let classes = $derived(
		cn(
			base,
			(interactive || href) && 'cursor-pointer hover:border-primary/60 hover:text-foreground',
			className
		)
	);
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children?.()}
	</a>
{:else if interactive}
	<button class={classes} {...rest}>
		{@render children?.()}
	</button>
{:else}
	<span class={classes} {...rest}>
		{@render children?.()}
	</span>
{/if}
