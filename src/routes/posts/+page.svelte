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
		const url = p === 1 ? '/posts' : `/posts?page=${p}`;
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<Seo title="All Posts" description="これまでに公開したすべての記事の一覧ページ。" />

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<div class="mb-8 flex items-baseline gap-3">
		<h1 class="text-2xl font-bold sm:text-3xl">All Posts</h1>
		<span class="text-sm text-muted-foreground">{data.posts.length} articles</span>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each paged as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>

	<Pagination {currentPage} {totalPages} onPageChange={goTo} />
</div>
