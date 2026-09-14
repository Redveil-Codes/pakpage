<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div class={cn('min-w-0 font-semibold text-foreground', className)} {...rest}>
	{@render children?.()}
</div>
