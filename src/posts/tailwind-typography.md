---
title: '@tailwindcss/typography で Markdown を美しくスタイリングする'
description: Tailwind CSS の Typography プラグインを使って、Markdown コンテンツに読みやすいタイポグラフィを適用する方法を解説します。
date: 2026-03-29
tags:
  - tailwindcss
---

Markdown で書いた記事をそのまま表示すると、見出しや段落にスタイルが当たらず見づらくなります。`@tailwindcss/typography` プラグインの `prose` クラスを使えば、一行追加するだけで美しいタイポグラフィが手に入ります。

## 前提

- Tailwind CSS v4 が導入済みのプロジェクト（v3 でも動作するが本記事は v4 の `@plugin` 構文を使用）
- Markdown を HTML に変換する仕組みがあること（mdsvex / MDX / Markdown-it 等）

## セットアップ

```bash
pnpm add -D @tailwindcss/typography
```

Tailwind CSS v4 では、CSS ファイルでプラグインを読み込みます。

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

## 基本の使い方

`prose` クラスを親要素に付けるだけです。

```html
<article class="prose">
	<h1>記事タイトル</h1>
	<p>Markdown から生成された HTML に、自動的に適切なスタイルが当たります。</p>
	<ul>
		<li>リストアイテム 1</li>
		<li>リストアイテム 2</li>
	</ul>
	<pre><code>console.log('コードブロックも整形される');</code></pre>
</article>
```

`prose` が適用する主なスタイル:

- 見出し（h1〜h4）のサイズ・余白・太さ
- 段落の行間（line-height）と余白
- リスト（ul / ol）のマーカーとインデント
- コードブロックの背景色とパディング
- リンクの色と下線
- blockquote のボーダーとスタイル
- テーブルのボーダーとセルパディング

## ダークモード対応

`dark:prose-invert` を追加すると、ダークモードで配色が反転します。

```html
<article class="prose dark:prose-invert">
	<!-- コンテンツ -->
</article>
```

## サイズバリエーション

コンテンツの表示サイズを変更できます。

```html
<article class="prose prose-sm"><!-- 小さめ --></article>
<article class="prose"><!-- デフォルト --></article>
<article class="prose prose-lg"><!-- 大きめ --></article>
<article class="prose prose-xl"><!-- さらに大きめ --></article>
```

## カスタマイズ

### prose 内の要素を個別にスタイリング

`prose` クラスの中でも、Tailwind のユーティリティクラスで上書きできます。

```css
@layer components {
	.prose pre {
		@apply bg-muted text-foreground;
	}

	.prose code {
		@apply rounded bg-muted px-1 py-0.5 text-sm;
	}

	.prose a {
		@apply text-primary underline-offset-4;
	}
}
```

### not-prose で一部を除外

`prose` の中で、特定の要素にスタイルを当てたくない場合は `not-prose` を使います。

```html
<article class="prose">
	<p>ここは prose スタイルが当たる</p>

	<div class="not-prose">
		<!-- ここは prose の影響を受けない -->
		<div class="grid grid-cols-2 gap-4">
			<div class="rounded-lg bg-blue-100 p-4">カード 1</div>
			<div class="rounded-lg bg-blue-100 p-4">カード 2</div>
		</div>
	</div>

	<p>ここも prose スタイルが当たる</p>
</article>
```

このブログでは、タグのバッジ表示部分に `not-prose` を使って、prose のスタイルが干渉しないようにしています。

## 最大幅の制御

デフォルトでは `prose` に `max-width: 65ch` が設定されています。記事の読みやすさのためですが、全幅にしたい場合は `max-w-none` で解除できます。

```html
<article class="prose max-w-none">
	<!-- 全幅で表示 -->
</article>
```

## SvelteKit ブログでの実践例

mdsvex のレイアウトコンポーネントで `prose` を適用するのが一般的です。

```svelte
<!-- src/lib/layouts/post.svelte -->
<script lang="ts">
	let { title, date, children } = $props();
</script>

<article class="mx-auto prose px-4 py-12 dark:prose-invert">
	<h1>{title}</h1>
	<time class="text-muted-foreground">
		{new Date(date).toLocaleDateString('ja-JP')}
	</time>
	<div data-pagefind-body>
		{@render children()}
	</div>
</article>
```

## まとめ

`@tailwindcss/typography` は、Markdown コンテンツの見た目を劇的に改善する必須プラグインです。`prose` クラス一つで、見出し・段落・リスト・コード・テーブルすべてに適切なタイポグラフィが適用されます。ブログや技術ドキュメントを作るなら、まず入れておきたいプラグインです。

## 参照

- [@tailwindcss/typography ドキュメント](https://tailwindcss.com/docs/typography-plugin)
- [tailwindcss-typography GitHub](https://github.com/tailwindlabs/tailwindcss-typography)
