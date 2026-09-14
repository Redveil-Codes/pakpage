<script lang="ts">
	import { Avatar, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className = '', ...rest }: WithoutChild<Avatar.ImageProps> = $props();
</script>

<Avatar.Image class={cn('h-full w-full object-cover', className)} {...rest} />
