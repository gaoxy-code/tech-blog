<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo title="Tags" description="記事に付けられているタグの一覧。" />

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<h1 class="mb-8 text-2xl font-bold sm:text-3xl">Tags</h1>

	<div class="flex flex-wrap gap-3">
		{#each data.tags as { name, count } (name)}
			<a
				href="/tags/{name}"
				class="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted"
			>
				<span>{name}</span>
				<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
			</a>
		{/each}
	</div>
</div>
