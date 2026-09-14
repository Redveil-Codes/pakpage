<script lang="ts">
	import { Tooltip, type WithoutChild } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		sideOffset = 6,
		children,
		...rest
	}: WithoutChild<Tooltip.ContentProps> & { children?: Snippet } = $props();
</script>

<Tooltip.Portal>
	<Tooltip.Content forceMount {sideOffset} {...rest}>
		{#snippet child({ props, wrapperProps, open })}
			{#if open}
				<div {...wrapperProps}>
					<div
						{...props}
						class={cn(
							'z-50 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg',
							className
						)}
						transition:fade={{ duration: 100 }}
					>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</Tooltip.Content>
</Tooltip.Portal>
