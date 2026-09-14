<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'outline' | 'ghost';
	type Size = 'default' | 'sm' | 'icon';

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		href = undefined,
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		class?: string;
		href?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const base =
		'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:pointer-events-none disabled:opacity-50';

	const variants: Record<Variant, string> = {
		default: 'bg-primary text-primary-foreground hover:opacity-90',
		outline:
			'border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-primary/60',
		ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
	};

	const sizes: Record<Size, string> = {
		default: 'h-9 px-4 py-2',
		sm: 'h-8 px-3 text-xs',
		icon: 'h-9 w-9 p-0'
	};

	let classes = $derived(cn(base, variants[variant], sizes[size], className));
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} {...rest}>
		{@render children?.()}
	</button>
{/if}
