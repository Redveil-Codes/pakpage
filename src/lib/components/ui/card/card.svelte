<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div
	class={cn(
		'relative rounded-xl border border-border bg-card text-card-foreground transition-colors',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
