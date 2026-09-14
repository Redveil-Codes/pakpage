<script lang="ts">
	import { Avatar, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		loading = false,
		children,
		...rest
	}: WithoutChild<Avatar.FallbackProps> & { loading?: boolean; children?: Snippet } = $props();
</script>

<Avatar.Fallback
	class={cn(
		'flex h-full w-full items-center justify-center bg-secondary text-xs font-medium text-muted-foreground',
		className
	)}
	{...rest}
>
	{#if loading}
		<Skeleton class="h-full w-full rounded-full" />
	{:else}
		{@render children?.()}
	{/if}
</Avatar.Fallback>
