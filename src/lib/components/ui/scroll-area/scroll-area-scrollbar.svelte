<script lang="ts">
	import { ScrollArea, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		orientation = 'vertical',
		...rest
	}: WithoutChild<ScrollArea.ScrollbarProps> = $props();
</script>

<ScrollArea.Scrollbar
	{orientation}
	class={cn(
		'flex touch-none select-none p-0.5 transition-colors',
		orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
		orientation === 'horizontal' && 'h-2.5 w-full flex-col border-t border-t-transparent',
		className
	)}
	{...rest}
>
	<ScrollArea.Thumb class="relative flex-1 rounded-full bg-border hover:bg-muted-foreground" />
</ScrollArea.Scrollbar>
