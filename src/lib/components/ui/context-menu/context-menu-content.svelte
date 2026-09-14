<script lang="ts">
	import { ContextMenu, type WithoutChild } from 'bits-ui';
	import { scale } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: WithoutChild<ContextMenu.ContentProps> & { children?: Snippet } = $props();
</script>

<ContextMenu.Portal>
	<ContextMenu.Content forceMount {...rest}>
		{#snippet child({ props, wrapperProps, open })}
			{#if open}
				<div {...wrapperProps}>
					<div
						{...props}
						class={cn(
							'z-50 min-w-[180px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg',
							className
						)}
						transition:scale={{ duration: 120, start: 0.95 }}
					>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</ContextMenu.Content>
</ContextMenu.Portal>
