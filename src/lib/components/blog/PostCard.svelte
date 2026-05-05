<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';

	interface Props {
		post: PostMeta;
		from?: string;
	}

	let { post, from }: Props = $props();

	let coverEl: HTMLElement | undefined = $state();
	let titleEl: HTMLElement | undefined = $state();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	function handleClick() {
		if (coverEl) coverEl.style.viewTransitionName = 'post-cover';
		if (titleEl) titleEl.style.viewTransitionName = 'post-title';
	}
</script>

<div
	class="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
>
	<div class="aspect-video overflow-hidden bg-muted">
		<img
			bind:this={coverEl}
			src={post.cover || `/posts/${post.slug}/og.png`}
			alt={post.title}
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
		/>
	</div>

	<div class="flex flex-1 flex-col gap-2 p-4">
		<time class="text-xs text-muted-foreground">{formattedDate}</time>
		<h3
			bind:this={titleEl}
			class="line-clamp-2 leading-snug font-semibold transition-colors group-hover:text-primary"
		>
			<a
				href="/posts/{post.slug}{from ? `?from=${encodeURIComponent(from)}` : ''}"
				onclick={handleClick}
				class="after:absolute after:inset-0"
			>
				{post.title}
			</a>
		</h3>
		<p class="line-clamp-2 flex-1 text-sm text-muted-foreground">{post.description}</p>
		{#if post.tags?.length}
			<div class="relative z-10 mt-1 flex flex-wrap gap-1">
				{#each post.tags.slice(0, 3) as tag (tag)}
					<a
						href="/tags/{tag}"
						class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
					>
						{tag}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
