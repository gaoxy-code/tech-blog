---
title: mdsvex で Markdown ブログを作る — Svelte コンポーネントを記事に埋め込む
description: mdsvex を使って Markdown 内で Svelte コンポーネントを利用する方法。設定からカスタムレイアウト、rehype プラグインまで解説します。
date: 2026-03-21
tags:
  - mdsvex
  - svelte-kit
  - svelte
---

mdsvex は「Markdown for Svelte」の略で、Markdown ファイルを Svelte コンポーネントとして扱えるプリプロセッサです。MDX（React 向け）の Svelte 版と考えると分かりやすいでしょう。

## 前提

- SvelteKit プロジェクト（Svelte 5 を想定）
- Node.js v22 以上
- 既に `svelte.config.js` が存在し、`vitePreprocess()` などの preprocess を設定できる状態

## セットアップ

```bash
pnpm add -D mdsvex
```

`svelte.config.js` に設定を追加します。

```js
import { mdsvex } from 'mdsvex';

const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx', '.md']
		})
	]
};
```

`.md` ファイルを `extensions` に追加することで、Markdown ファイルが Svelte コンポーネントとして処理されます。

## フロントマター

Markdown ファイルの先頭に YAML 形式でメタデータを記述できます。

```markdown
---
title: 記事のタイトル
description: 記事の説明
date: 2026-03-06
tags:
  - svelte
  - markdown
---

本文がここから始まります。
```

フロントマターの値は `metadata` として export されるので、`import` で取得できます。

```ts
const post = await import('./my-post.md');
console.log(post.metadata.title); // "記事のタイトル"
```

## カスタムレイアウト

すべての記事に共通のレイアウトを適用するには、`layout` オプションを使います。

```js
mdsvex({
	extensions: ['.svx', '.md'],
	layout: {
		_: './src/lib/layouts/post.svelte'
	}
});
```

`_` はデフォルトレイアウトを意味します。レイアウトコンポーネントではフロントマターの値が Props として渡されます。

```svelte
<!-- src/lib/layouts/post.svelte -->
<script lang="ts">
	let { title, date, tags = [], children } = $props();
</script>

<article class="prose dark:prose-invert">
	<h1>{title}</h1>
	<time>{new Date(date).toLocaleDateString('ja-JP')}</time>
	{@render children()}
</article>
```

## Markdown 内で Svelte コンポーネントを使う

mdsvex の強力な機能の一つが、Markdown 内での Svelte コンポーネントの利用です。

```markdown
---
title: インタラクティブな記事
---

<script>
  import Counter from '$lib/components/Counter.svelte';
</script>

普通の Markdown テキストです。

<Counter />

↑ ボタンをクリックしてみてください。
```

これにより、静的な Markdown に動的なインタラクションを追加できます。

## rehype / remark プラグイン

mdsvex は rehype（HTML 処理）と remark（Markdown 処理）のプラグインに対応しています。

### rehype-slug — 見出しに ID を自動付与

```bash
pnpm add -D rehype-slug
```

```js
import rehypeSlug from 'rehype-slug';

mdsvex({
	rehypePlugins: [rehypeSlug]
});
```

これにより `## セットアップ` が `<h2 id="セットアップ">` になり、見出しへの直接リンクが可能になります。

## コードブロックのシンタックスハイライト

mdsvex はデフォルトで PrismJS によるシンタックスハイライトをサポートしています。Markdown のコードブロックに言語を指定するだけです。

````markdown
```ts
const message: string = 'Hello, mdsvex!';
```
````

Shiki を使いたい場合は、rehype プラグインとして組み込むことも可能です。

## import.meta.glob で記事を一括取得

SvelteKit の `import.meta.glob` と組み合わせて、すべての記事のメタデータを取得できます。

```ts
export async function getAllPosts() {
	const modules = import.meta.glob('/src/posts/*.md', { eager: true });
	const posts = [];

	for (const [path, mod] of Object.entries(modules)) {
		const slug = path.split('/').pop()!.replace('.md', '');
		const { metadata } = mod as { metadata: PostMeta };
		if (!metadata.draft) {
			posts.push({ slug, ...metadata });
		}
	}

	return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
```

## まとめ

mdsvex を使うことで、Markdown の手軽さと Svelte の表現力を両立できます。ブログや技術ドキュメントの構築に最適です。

- Markdown ファイルを Svelte コンポーネントとして処理
- フロントマターでメタデータを管理
- カスタムレイアウトで統一的なデザイン
- Svelte コンポーネントを記事に埋め込み可能
- rehype / remark プラグインで拡張できる

## 参照

- [mdsvex 公式サイト](https://mdsvex.pngwn.io/)
- [mdsvex GitHub](https://github.com/pngwn/MDsveX)
