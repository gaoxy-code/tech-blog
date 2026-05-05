<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';

	interface Props {
		post: PostMeta;
		rank: number;
	}

	let { post, rank }: Props = $props();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	const formattedViews = $derived(
		post.views ? post.views.toLocaleString('ja-JP') + ' views' : null
	);
</script>

<li>
	<a
		href="/posts/{post.slug}"
		class="flex items-center gap-5 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
	>
		<span class="shrink-0 text-3xl font-bold text-emerald-600/60">
			{String(rank).padStart(2, '0')}
		</span>
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex items-center gap-2">
				<p class="text-xs text-muted-foreground">{formattedDate}</p>
				{#if formattedViews}
					<p class="text-xs text-muted-foreground/60">{formattedViews}</p>
				{/if}
			</div>
			<p class="leading-snug font-semibold break-words">{post.title}</p>
		</div>
	</a>
</li>
