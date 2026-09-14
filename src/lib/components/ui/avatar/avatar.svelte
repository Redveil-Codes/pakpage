<script lang="ts">
	import { Avatar, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		loadingStatus = $bindable('loading'),
		children,
		...rest
	}: WithoutChild<Avatar.RootProps> & { children?: Snippet } = $props();
</script>

<Avatar.Root
	bind:loadingStatus
	class={cn(
		'relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border',
		className
	)}
	{...rest}
>
	{@render children?.()}
</Avatar.Root>
