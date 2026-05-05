<script lang="ts">
	import { page } from '$app/state';
	import { goto, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import SearchResultCard from '$lib/components/blog/SearchResultCard.svelte';
	import Pagination from '$lib/components/blog/Pagination.svelte';
	import Seo from '$lib/components/Seo.svelte';

	const PER_PAGE = 9;

	const initialQuery = page.url.searchParams.get('q') ?? '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = $state(null);
	let query = $state(initialQuery);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let results = $state<any[]>([]);
	let inputEl = $state<HTMLInputElement | null>(null);
	let searchToken = 0;
	let lastQuery = initialQuery;

	const currentPage = $derived(Math.max(1, Number(page.url.searchParams.get('page')) || 1));
	const totalPages = $derived(Math.ceil(results.length / PER_PAGE));
	const paged = $derived(results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE));

	function buildUrl(q: string, p: number): string {
		const trimmed = q.trim();
		const parts: string[] = [];
		if (trimmed) parts.push(`q=${encodeURIComponent(trimmed)}`);
		if (p > 1) parts.push(`page=${p}`);
		return `/search${parts.length ? `?${parts.join('&')}` : ''}`;
	}

	onMount(async () => {
		try {
			const dynamicImport = new Function('url', 'return import(url)');
			pagefind = await dynamicImport('/pagefind/pagefind.js');
			await pagefind.init();
			if (query.trim()) search();
		} catch {
			console.warn('Pagefind not available (run `pnpm build` first)');
		}
	});

	async function search() {
		const token = ++searchToken;
		const q = query.trim();
		if (!pagefind || !q) {
			results = [];
			return;
		}
		const res = await pagefind.debouncedSearch(q);
		if (token !== searchToken || !res) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = await Promise.all(res.results.map((r: any) => r.data()));
		if (token !== searchToken) return;
		results = data;
	}

	$effect(() => {
		const q = query;
		if (q === lastQuery) return;
		lastQuery = q;
		// query が変わったらページを 1 に戻し、URL を同期（View Transition は走らせない）
		const url = buildUrl(q, 1);
		if (page.url.pathname + page.url.search !== url) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			replaceState(url, {});
		}
		search();
	});

	function goTo(p: number) {
		// goto で URL を更新することで onNavigate (+layout の View Transition) が発火する
		goto(buildUrl(query, p), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<Seo title="Search" description="サイト内検索" noindex />

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<div class="mb-8 flex items-baseline gap-3">
		<h1 class="text-2xl font-bold sm:text-3xl">Search</h1>
		{#if results.length > 0}
			<span class="text-sm text-muted-foreground">{results.length} results for "{query}"</span>
		{/if}
	</div>

	<div class="mb-8">
		<div
			class="flex h-11 w-full max-w-lg items-center rounded-lg border border-input bg-background px-4"
		>
			<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				placeholder="キーワードを入力..."
				class="min-w-0 flex-1 bg-transparent text-sm outline-none"
			/>
			{#if query}
				<button
					type="button"
					onclick={() => {
						query = '';
						inputEl?.focus();
					}}
					class="ml-2 shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					クリア
				</button>
			{/if}
		</div>
	</div>

	{#if results.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each paged as r (r.url)}
				<SearchResultCard url={r.url} title={r.meta.title} excerpt={r.excerpt} date={r.meta.date} />
			{/each}
		</div>

		<Pagination {currentPage} {totalPages} onPageChange={goTo} />
	{:else if query.trim() && pagefind}
		<p class="text-muted-foreground">「{query}」に一致する記事が見つかりませんでした。</p>
	{:else if !pagefind}
		<p class="text-sm text-muted-foreground">
			検索機能は <code class="rounded bg-muted px-1">pnpm build</code> 後に利用できます。
		</p>
	{/if}
</div>
