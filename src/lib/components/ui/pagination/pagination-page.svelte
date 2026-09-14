<script lang="ts">
	import { Pagination, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<Pagination.PageProps> & { children?: Snippet } = $props();
</script>

<Pagination.Page
	class={cn(
		'flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary',
		className
	)}
	{...rest}
>
	{@render children?.()}
</Pagination.Page>
