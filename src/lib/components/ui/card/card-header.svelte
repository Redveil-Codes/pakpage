<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div class={cn('flex flex-col gap-1 p-4 pb-2', className)} {...rest}>
	{@render children?.()}
</div>
