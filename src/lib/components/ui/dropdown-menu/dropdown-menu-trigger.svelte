<script lang="ts">
	import { DropdownMenu, type WithoutChildren } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChildren<DropdownMenu.TriggerProps> & { children?: Snippet } = $props();
</script>

<DropdownMenu.Trigger class={cn('outline-none', className)} {...rest}>
	{@render children?.()}
</DropdownMenu.Trigger>
