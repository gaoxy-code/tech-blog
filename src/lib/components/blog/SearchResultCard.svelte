<script lang="ts">
	import { cleanSearchUrl } from '$lib/utils/search';

	interface Props {
		url: string;
		title: string;
		excerpt: string;
		date?: string;
	}

	let { url, title, excerpt, date }: Props = $props();

	let coverEl: HTMLElement | undefined = $state();
	let titleEl: HTMLElement | undefined = $state();

	const formattedDate = $derived(
		date
			? new Date(date).toLocaleDateString('ja-JP', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);

	function handleClick() {
		if (coverEl) coverEl.style.viewTransitionName = 'post-cover';
		if (titleEl) titleEl.style.viewTransitionName = 'post-title';
	}
</script>

<div
	class="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
>
	<div bind:this={coverEl} class="aspect-video overflow-hidden bg-muted">
		<div
			class="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50"
		>
			<span class="text-4xl opacity-20">🔍</span>
		</div>
	</div>

	<div class="flex flex-1 flex-col gap-2 p-4">
		{#if formattedDate}
			<time class="text-xs text-muted-foreground">{formattedDate}</time>
		{/if}
		<h3
			bind:this={titleEl}
			class="line-clamp-2 leading-snug font-semibold transition-colors group-hover:text-primary"
		>
			<a href={cleanSearchUrl(url)} onclick={handleClick} class="after:absolute after:inset-0">
				{title}
			</a>
		</h3>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p class="line-clamp-2 flex-1 text-sm text-muted-foreground">{@html excerpt}</p>
	</div>
</div>
