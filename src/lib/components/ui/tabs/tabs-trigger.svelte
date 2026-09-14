<script lang="ts">
	import { Tabs, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<Tabs.TriggerProps> & { children?: Snippet } = $props();
</script>

<Tabs.Trigger
	class={cn(
		'cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground',
		className
	)}
	{...rest}
>
	{@render children?.()}
</Tabs.Trigger>
