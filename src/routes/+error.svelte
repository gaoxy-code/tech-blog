<script lang="ts">
	import { page } from '$app/stores';
	import { Home, FileSearch } from '@lucide/svelte';
	import Seo from '$lib/components/Seo.svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? '不明なエラーが発生しました');
	const title = $derived(status === 404 ? 'ページが見つかりません' : `エラー ${status}`);
</script>

<Seo {title} noindex />

<div
	class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center"
>
	<div class="font-mono text-6xl font-bold text-muted-foreground/40 sm:text-8xl">
		{status}
	</div>
	<h1 class="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
	<p class="mt-3 text-muted-foreground">
		{#if status === 404}
			お探しのページは移動または削除された可能性があります。
		{:else}
			{message}
		{/if}
	</p>

	<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			<Home size={16} />
			トップへ戻る
		</a>
		<a
			href="/posts"
			class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
		>
			記事一覧
		</a>
		<a
			href="/search"
			class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
		>
			<FileSearch size={16} />
			検索する
		</a>
	</div>
</div>
