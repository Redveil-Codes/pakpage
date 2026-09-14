<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		sideOffset = 8,
		children,
		...rest
	}: WithoutChild<DropdownMenu.ContentProps> & { children?: Snippet } = $props();
</script>

<DropdownMenu.Portal>
	<DropdownMenu.Content forceMount {sideOffset} {...rest}>
		{#snippet child({ props, wrapperProps, open })}
			{#if open}
				<div {...wrapperProps}>
					<div
						{...props}
						class={cn(
							'z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg',
							className
						)}
						transition:fly={{ y: -6, duration: 140 }}
					>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</DropdownMenu.Content>
</DropdownMenu.Portal>
