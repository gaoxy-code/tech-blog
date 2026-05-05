<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import Pagination from '$lib/components/blog/Pagination.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();

	const PER_PAGE = 9;
	const currentPage = $derived(Math.max(1, Number(page.url.searchParams.get('page')) || 1));

	const totalPages = $derived(Math.ceil(data.posts.length / PER_PAGE));
	const paged = $derived(data.posts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE));

	function goTo(p: number) {
		const base = `/tags/${data.tag}`;
		goto(p === 1 ? base : `${base}?page=${p}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<Seo title="Tag: {data.tag}" description="#{data.tag} の記事一覧（{data.posts.length} 件）" />

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<div class="mb-2">
		<a href="/tags" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
			← Tags
		</a>
	</div>

	<div class="mb-8 flex items-center gap-3">
		<span class="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
			{data.tag}
		</span>
	</div>

	<div class="mb-6 flex items-baseline gap-3">
		<h1 class="text-2xl font-bold sm:text-3xl">Tag: {data.tag}</h1>
		<span class="text-sm text-muted-foreground"
			>{data.posts.length} articles tagged with #{data.tag}</span
		>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each paged as post (post.slug)}
			<PostCard {post} from="tag-{data.tag}" />
		{/each}
	</div>

	<Pagination {currentPage} {totalPages} onPageChange={goTo} />
</div>
