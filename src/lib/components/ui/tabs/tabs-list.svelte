<script lang="ts">
	import { Tabs, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<Tabs.ListProps> & { children?: Snippet } = $props();
</script>

<Tabs.List
	class={cn('inline-flex items-center gap-1 border-b border-border', className)}
	{...rest}
>
	{@render children?.()}
</Tabs.List>
