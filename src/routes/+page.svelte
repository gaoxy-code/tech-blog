<script lang="ts">
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import PopularPostItem from '$lib/components/blog/PopularPostItem.svelte';
	import HeroTerminal from '$lib/components/blog/HeroTerminal.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { buildWebsiteLd } from '$lib/utils/jsonld';
	import { MoveRight } from '@lucide/svelte';

	let { data } = $props();

	const websiteLd = buildWebsiteLd();
</script>

<Seo />

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify(websiteLd)}</` + `script>`}
</svelte:head>

<!-- Hero -->
<section class="border-b border-border from-background to-muted/30">
	<div
		class="mx-auto flex max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:gap-12 lg:py-20"
	>
		<div class="flex-1 space-y-4 sm:space-y-6">
			<span
				class="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
			>
				Frontend Engineer
			</span>
			<h1 class="text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
				フロントエンドと<br />学びをシェア。
			</h1>
			<p class="max-w-md text-sm text-muted-foreground sm:text-base">
				React / Next.js / Svelte を中心に個人開発・学習ログを発信しています。
			</p>
			<div class="flex gap-3">
				<a
					href="/posts"
					class="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					最新記事を読む
				</a>
				<a
					href="/about"
					class="rounded-md border-2 border-primary px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
				>
					<div class="flex items-center gap-1">
						About
						<MoveRight size={16} strokeWidth={1} />
					</div>
				</a>
			</div>
		</div>

		<div class="hidden shrink-0 md:block md:w-80 lg:w-120">
			<HeroTerminal />
		</div>
	</div>
</section>

<!-- Latest Posts -->
<section class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
	<div class="mb-8 flex items-center justify-between">
		<h2 class="text-xl font-bold sm:text-2xl">最新の記事</h2>
		<a href="/posts" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
			<div class="flex items-center gap-1">
				すべて見る
				<MoveRight size={16} strokeWidth={1} />
			</div>
		</a>
	</div>
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.latest as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>
</section>

<!-- Popular Posts -->
<section class="border-t border-border bg-muted/20">
	<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
		<div class="mb-8 flex items-center justify-between">
			<h2 class="text-xl font-bold sm:text-2xl">人気の記事</h2>
			<a
				href="/posts"
				class="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<div class="flex items-center gap-1">
					すべて見る
					<MoveRight size={16} strokeWidth={1} />
				</div>
			</a>
		</div>
		<ol class="space-y-4">
			{#each data.popular as post, i (post.slug)}
				<PopularPostItem {post} rank={i + 1} />
			{/each}
		</ol>
	</div>
</section>
