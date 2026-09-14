<script lang="ts">
	import { Tabs, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<Tabs.ContentProps> & { children?: Snippet } = $props();
</script>

<Tabs.Content class={cn('pt-3', className)} {...rest}>
	{@render children?.()}
</Tabs.Content>
