---
title: Vite の import.meta.glob を使ったファイルの動的インポート
description: import.meta.glob の使い方と活用パターン。ブログ記事の一括取得や、コンポーネントの動的ロードなどの実例を紹介します。
date: 2026-03-23
tags:
  - vite
  - svelte-kit
---

`import.meta.glob` は Vite が提供するファイルの動的インポート機能です。glob パターンでファイルを一括で取得でき、ブログの記事一覧取得などに活用できます。

## 前提

- Vite ベースのプロジェクト（SvelteKit / Vue / 素の Vite アプリなど）
- 本記事のサンプルは SvelteKit + mdsvex を使った構成を想定

## 基本の使い方

### 遅延インポート（デフォルト）

```ts
const modules = import.meta.glob('/src/posts/*.md');
```

返り値は、ファイルパスをキー、動的 import 関数を値とするオブジェクトです:

```ts
{
  '/src/posts/hello-world.md': () => import('/src/posts/hello-world.md'),
  '/src/posts/blog-setup.md': () => import('/src/posts/blog-setup.md'),
}
```

各モジュールは関数を呼び出したときに初めて読み込まれます（遅延ロード）。

### 即時インポート（eager）

```ts
const modules = import.meta.glob('/src/posts/*.md', { eager: true });
```

`eager: true` を指定すると、ビルド時にすべてのモジュールが即座に読み込まれます:

```ts
{
  '/src/posts/hello-world.md': { metadata: {...}, default: Component },
  '/src/posts/blog-setup.md': { metadata: {...}, default: Component },
}
```

## ブログでの活用 — 記事一覧の取得

このブログで実際に使っているパターンです。

```ts
// src/lib/utils/posts.ts
export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	draft?: boolean;
};

export async function getAllPosts(): Promise<PostMeta[]> {
	const modules = import.meta.glob('/src/posts/*.md', { eager: true });
	const posts: PostMeta[] = [];

	for (const [path, mod] of Object.entries(modules)) {
		const m = mod as { metadata: Omit<PostMeta, 'slug'> };
		const slug = path.split('/').pop()!.replace('.md', '');
		if (m.metadata.draft) continue;
		posts.push({ slug, ...m.metadata });
	}

	return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
```

### ポイント

- `eager: true` — SSG ではビルド時にすべて読み込むので eager が適切
- `mod.metadata` — mdsvex が Markdown のフロントマターを `metadata` として export
- `mod.default` — Svelte コンポーネントとしてレンダリング可能

## glob パターン

`import.meta.glob` は glob パターンを受け付けます。

```ts
// 特定のディレクトリ
import.meta.glob('/src/posts/*.md');

// ネストしたディレクトリも含む
import.meta.glob('/src/posts/**/*.md');

// 複数パターン
import.meta.glob(['/src/posts/*.md', '/src/drafts/*.md']);

// 除外パターン
import.meta.glob('/src/posts/*.md', {
	// _で始まるファイルを除外
});
```

## import オプション

### as: 'raw' — 生のテキストとして取得

```ts
const files = import.meta.glob('/src/data/*.json', {
	eager: true,
	import: 'default',
	query: '?raw'
});
```

### import — 特定の export だけ取得

```ts
// metadata だけ取得（コンポーネント本体は不要な場合）
const metas = import.meta.glob('/src/posts/*.md', {
	eager: true,
	import: 'metadata'
});
```

## 動的ルートとの組み合わせ

SvelteKit の動的ルートで、プリレンダリング対象のパスを列挙するのに使えます。

```ts
// src/routes/posts/[slug]/+page.ts
export async function entries() {
	const modules = import.meta.glob('/src/posts/*.md');
	return Object.keys(modules).map((path) => ({
		slug: path.split('/').pop()!.replace('.md', '')
	}));
}

export async function load({ params }) {
	const post = await import(`/src/posts/${params.slug}.md`);
	return {
		content: post.default,
		meta: post.metadata
	};
}
```

## タグ一覧の生成

記事のメタデータから全タグを収集する例:

```ts
export async function getAllTags(): Promise<Map<string, number>> {
	const posts = await getAllPosts();
	const tagMap = new Map<string, number>();

	for (const post of posts) {
		for (const tag of post.tags ?? []) {
			tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
		}
	}

	return tagMap;
}
```

## 注意点

1. **glob パターンは静的でなければならない** — 変数を使ったパターンは不可
2. **ビルド時に解決される** — ファイルの追加・削除は再ビルドが必要
3. **パスは `/src/` から始まる** — プロジェクトルートからの絶対パス

```ts
// ❌ 変数は使えない
const dir = 'posts';
import.meta.glob(`/src/${dir}/*.md`);

// ✅ リテラルで指定
import.meta.glob('/src/posts/*.md');
```

## まとめ

`import.meta.glob` は Vite の強力な機能で、ファイルシステムベースのコンテンツ管理に最適です。ブログの記事一覧、タグ一覧、動的ルートの生成など、SvelteKit の静的サイト構築で欠かせないツールです。

## 参照

- [Vite Glob Import ドキュメント](https://vite.dev/guide/features.html#glob-import)
