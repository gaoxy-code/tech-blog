<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import type { PostMeta } from '$lib/utils/posts';

	interface Props {
		prevPost: PostMeta | null;
		nextPost: PostMeta | null;
	}

	let { prevPost, nextPost }: Props = $props();
</script>

{#if prevPost || nextPost}
	<nav class="mt-8 grid grid-cols-2 gap-4">
		{#if prevPost}
			<a
				href="/posts/{prevPost.slug}"
				class="group flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
			>
				<ArrowLeft
					size={20}
					class="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1"
				/>
				<div class="min-w-0">
					<div class="text-xs text-muted-foreground">前の記事</div>
					<div class="mt-1 line-clamp-2 text-sm font-medium">{prevPost.title}</div>
				</div>
			</a>
		{:else}
			<div></div>
		{/if}
		{#if nextPost}
			<a
				href="/posts/{nextPost.slug}"
				class="group flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
			>
				<div class="min-w-0 flex-1">
					<div class="text-xs text-muted-foreground">次の記事</div>
					<div class="mt-1 line-clamp-2 text-sm font-medium">{nextPost.title}</div>
				</div>
				<ArrowRight
					size={20}
					class="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
				/>
			</a>
		{/if}
	</nav>
{/if}
