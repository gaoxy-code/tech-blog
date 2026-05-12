<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { Calendar, Clock, ArrowLeft } from '@lucide/svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import Separator from '@/components/ui/separator/separator.svelte';
	import AuthorCard from '$lib/components/blog/AuthorCard.svelte';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import PostActionBar from '$lib/components/blog/PostActionBar.svelte';
	import PostNavigation from '$lib/components/blog/PostNavigation.svelte';
	import TableOfContents, { type TocItem } from '$lib/components/blog/TableOfContents.svelte';
	import type { PostMeta } from '$lib/utils/posts';
	import { copyCodeButtons } from '$lib/actions/copyCodeButtons';

	interface Props {
		title?: string;
		date?: string;
		description?: string;
		tags?: string[];
		cover?: string;
		children: Snippet;
	}

	let { title, date, description, tags = [], cover, children }: Props = $props();

	const readingMinutes = $derived(($page.data.meta as PostMeta | undefined)?.readingTime ?? null);
	const relatedPosts = $derived(($page.data.relatedPosts as PostMeta[]) ?? []);
	const rawMarkdown = $derived(($page.data.rawMarkdown as string) ?? '');
	const prevPost = $derived(($page.data.prevPost as PostMeta | null) ?? null);
	const nextPost = $derived(($page.data.nextPost as PostMeta | null) ?? null);
	// prerender 時は searchParams にアクセスできないため、クライアント側でのみ読む
	let fromParam = $state<string | null>(null);
	$effect(() => {
		fromParam = $page.url.searchParams.get('from');
	});
	const tagFrom = $derived(fromParam?.startsWith('tag-') ? fromParam.slice(4) : null);

	const formattedDate = $derived(
		date
			? new Date(date).toLocaleDateString('ja-JP', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);

	let articleEl = $state<HTMLElement | null>(null);
	let toc = $state<TocItem[]>([]);
	let activeId = $state('');
</script>

{#if cover}
	<div class="aspect-3/1 w-full overflow-hidden">
		<img
			src={cover}
			alt={title}
			class="h-full w-full object-cover"
			style="view-transition-name: post-cover"
		/>
	</div>
{/if}

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
	<!-- Breadcrumb -->
	<nav class="mb-6 text-sm text-muted-foreground">
		{#if tagFrom}
			<a href="/tags" class="transition-colors hover:text-foreground">Tags</a>
			<span class="mx-2">›</span>
			<a href="/tags/{tagFrom}" class="transition-colors hover:text-foreground">{tagFrom}</a>
		{:else}
			<a href="/posts" class="transition-colors hover:text-foreground">Posts</a>
		{/if}
		<span class="mx-2">›</span>
		<span class="text-foreground">{title}</span>
	</nav>

	<div class="flex gap-8 xl:gap-12">
		<!-- Article -->
		<article
			data-pagefind-body
			data-pagefind-meta="date:{date}"
			class="prose max-w-none min-w-0 flex-1 prose-neutral dark:prose-invert"
			bind:this={articleEl}
			use:copyCodeButtons
		>
			<header class="not-prose mb-8">
				<h1
					class="mb-3 text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl"
					style="view-transition-name: post-title"
				>
					{title}
				</h1>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
					{#if formattedDate}
						<div class="flex items-center gap-2">
							<Calendar size={16} />
							<time datetime={date}>{formattedDate}</time>
						</div>
					{/if}
					{#if readingMinutes}
						<div class="flex items-center gap-2">
							<Clock size={16} />
							<span>約 {readingMinutes} 分</span>
						</div>
					{/if}
				</div>
				{#if tags.length > 0}
					<div class="mt-4 flex flex-wrap gap-2" data-pagefind-ignore>
						{#each tags as tag (tag)}
							<a
								href="/tags/{tag}"
								class="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
							>
								{tag}
							</a>
						{/each}
					</div>
				{/if}
				{#if description}
					<p class="mt-3 text-muted-foreground">{description}</p>
				{/if}

				<!-- Mobile ToC -->
				{#if toc.length > 0}
					<div class="mt-6 rounded-xl border border-border xl:hidden">
						<Accordion.Root type="single">
							<Accordion.Item value="toc" class="border-none">
								<Accordion.Trigger
									class="px-5 py-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase"
								>
									目次（{toc.length}）
								</Accordion.Trigger>
								<Accordion.Content class="px-5 pb-3">
									<nav class="space-y-0.5" aria-label="Table of contents">
										{#each toc as item, i (item.id || i)}
											{@const isH3 = item.level === 3}
											{@const isActive = activeId === item.id}
											<a
												href="#{item.id}"
												class="block border-l-2 py-1 text-sm transition-colors
													{isH3 ? 'pl-5' : 'pl-3'}
													{isActive
													? 'border-primary font-medium text-foreground'
													: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
											>
												{item.text}
											</a>
										{/each}
									</nav>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				{/if}

				<Separator class="mt-8" />
			</header>

			{@render children()}
		</article>

		<!-- Desktop ToC + 著者カード Sidebar -->
		<aside class="hidden w-60 shrink-0 xl:block">
			<div class="sticky top-20 flex flex-col gap-3">
				<TableOfContents {articleEl} bind:toc bind:activeId />
				<AuthorCard variant="sidebar" />
			</div>
		</aside>
	</div>

	<!-- 記事末尾ブロック -->
	<Separator class="mt-12" />

	<!-- 著者情報カード (mobile only) -->
	<div class="mt-8 xl:hidden">
		<AuthorCard variant="inline" />
	</div>

	<!-- アクションバー -->
	<PostActionBar {rawMarkdown} title={title ?? ''} />

	<!-- 前後の記事ナビゲーション -->
	{#if prevPost || nextPost}
		<Separator class="mt-12" />
		<PostNavigation {prevPost} {nextPost} />
	{/if}

	<!-- 関連記事 -->
	{#if relatedPosts.length > 0}
		<Separator class="mt-12" />
		<section class="mt-10">
			<h2 class="mb-6 text-2xl font-bold">関連記事</h2>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each relatedPosts as post (post.slug)}
					<PostCard {post} />
				{/each}
			</div>
		</section>
	{/if}

	<!-- 記事一覧に戻る -->
	<div class="mt-12 flex justify-center">
		<a
			href="/posts"
			class="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
		>
			<ArrowLeft size={16} />
			記事一覧に戻る
		</a>
	</div>
</div>
