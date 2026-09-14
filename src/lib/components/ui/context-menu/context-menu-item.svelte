<script lang="ts">
	import { ContextMenu, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		href = undefined,
		target = undefined,
		rel = undefined,
		children,
		...rest
	}: WithoutChild<ContextMenu.ItemProps> & {
		href?: string;
		target?: string;
		rel?: string;
	} = $props();

	let itemClass = $derived(
		cn(
			'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground data-[highlighted]:bg-accent data-[highlighted]:text-foreground',
			className
		)
	);
</script>

<ContextMenu.Item {...rest}>
	{#snippet child({ props })}
		{#if href}
			<a {href} {target} {rel} {...props} class={itemClass}>
				{@render children?.()}
			</a>
		{:else}
			<div {...props} class={itemClass}>
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</ContextMenu.Item>
