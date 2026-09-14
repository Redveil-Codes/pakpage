<script lang="ts">
	import { ScrollArea, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import Scrollbar from './scroll-area-scrollbar.svelte';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		viewportClass = '',
		children,
		...rest
	}: WithoutChild<ScrollArea.RootProps> & { viewportClass?: string; children?: Snippet } = $props();
</script>

<ScrollArea.Root class={cn('relative overflow-hidden', className)} {...rest}>
	<ScrollArea.Viewport class={cn('h-full w-full', viewportClass)}>
		{@render children?.()}
	</ScrollArea.Viewport>
	<Scrollbar orientation="vertical" />
	<Scrollbar orientation="horizontal" />
	<ScrollArea.Corner />
</ScrollArea.Root>
