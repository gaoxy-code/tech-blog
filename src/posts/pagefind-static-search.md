---
title: Pagefind で静的サイトに全文検索を追加する
description: Pagefind を使って静的サイトに高速な全文検索機能を実装する方法。SvelteKit との統合方法も解説します。
date: 2026-04-09
tags:
  - pagefind
  - svelte-kit
---

静的サイトに検索機能を付けたいとき、外部サービス（Algolia など）を使うのが一般的でした。Pagefind はビルド時に検索インデックスを生成し、クライアントサイドで動作する軽量な全文検索ライブラリです。外部サービス不要で、無料で使えます。

## 前提

- 静的 HTML を出力するサイト（SvelteKit + `prerender = true` を想定）
- Node.js v22 以上
- ビルド出力ディレクトリにアクセスして Pagefind CLI を実行できる環境

## Pagefind の仕組み

1. **ビルド時**: HTML ファイルをスキャンしてインデックスを生成
2. **実行時**: ブラウザで JavaScript を使ってインデックスを検索

インデックスは分割されて必要な部分だけ遅延読み込みされるため、数千ページのサイトでも高速に動作します。

## セットアップ

```bash
pnpm add -D pagefind
```

`package.json` の build スクリプトに pagefind を追加します。

```json
{
	"scripts": {
		"build": "vite build && pagefind --site .svelte-kit/cloudflare"
	}
}
```

`--site` にビルド出力先ディレクトリを指定します。SvelteKit + adapter-cloudflare の場合は `.svelte-kit/cloudflare` です。

## 検索対象の指定

デフォルトでは `<body>` 全体がインデックス対象ですが、`data-pagefind-body` 属性でスコープを絞れます。

```svelte
<!-- src/lib/layouts/post.svelte -->
<article class="prose">
	<h1>{title}</h1>
	<div data-pagefind-body>
		{@render children()}
	</div>
</article>
```

ナビゲーションやフッターを除外し、記事本文だけを検索対象にできます。

### 除外したい要素

```html
<div data-pagefind-body>
	<p>この段落は検索対象</p>
	<nav data-pagefind-ignore>
		<!-- ここは検索対象外 -->
	</nav>
</div>
```

## SvelteKit での検索コンポーネント

Pagefind は動的に JavaScript を読み込むため、SvelteKit では `onMount` 内でインポートします。

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let pagefind: any = $state(null);
	let query = $state('');
	let results = $state<any[]>([]);

	onMount(async () => {
		try {
			pagefind = await import(/* @vite-ignore */ '/pagefind/pagefind.js');
			await pagefind.init();
		} catch {
			console.warn('Pagefind not available');
		}
	});

	async function search() {
		if (!pagefind || !query) {
			results = [];
			return;
		}
		const response = await pagefind.debouncedSearch(query);
		if (!response) return;
		results = await Promise.all(response.results.map((r: any) => r.data()));
	}

	$effect(() => {
		query;
		search();
	});
</script>

<input type="text" bind:value={query} placeholder="記事を検索..." />

<ul>
	{#each results as result}
		<li>
			<a href={result.url}>
				<strong>{result.meta.title}</strong>
				<p>{@html result.excerpt}</p>
			</a>
		</li>
	{/each}
</ul>
```

### ポイント

- `/* @vite-ignore */` で Vite の静的解析を回避
- `debouncedSearch` で入力中の無駄なリクエストを抑制
- `result.data()` は遅延評価 — 表示する結果だけデータを取得
- `result.excerpt` には検索語がハイライトされた HTML が含まれる

## 開発時の注意

Pagefind のインデックスはビルド時に生成されるため、**開発サーバー（`pnpm dev`）では検索が動作しません**。検索機能を確認するには:

```bash
pnpm build    # ビルド + インデックス生成
pnpm preview  # ビルド結果をローカルプレビュー
```

## メタデータの活用

Pagefind はページのメタデータも自動で収集します。

```html
<!-- title タグが meta.title になる -->
<title>記事のタイトル</title>

<!-- meta description が meta.description になる -->
<meta name="description" content="記事の説明" />
```

カスタムメタデータも追加できます。

```html
<div data-pagefind-meta="category:技術">
	<!-- この要素のテキストが category メタデータに -->
</div>
```

## フィルタリング

タグやカテゴリでフィルタリングすることも可能です。

```html
<div data-pagefind-filter="tag:svelte">Svelte の記事</div>
```

```ts
const results = await pagefind.search('query', {
	filters: { tag: 'svelte' }
});
```

## Cloudflare Pages との相性

Pagefind はクライアントサイドで完結するため、Cloudflare Pages のような静的ホスティングと相性が抜群です。サーバーサイドの処理が不要なので、追加コストなしで検索機能を提供できます。

## まとめ

- Pagefind はビルド時にインデックスを生成するクライアントサイド検索
- 外部サービス不要、無料で使える
- `data-pagefind-body` で検索範囲を制御
- 開発サーバーでは動かない（ビルド後に確認）
- 静的ホスティングとの相性が良い

## 参照

- [Pagefind 公式サイト](https://pagefind.app/)
- [Pagefind GitHub](https://github.com/CloudCannon/pagefind)
