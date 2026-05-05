---
title: SvelteKit で静的サイトを作る — prerender の仕組みと設定
description: SvelteKit のプリレンダリング機能を使って静的サイトを生成する方法。設定のコツと注意点を解説します。
date: 2026-03-19
tags:
  - svelte-kit
  - cloudflare
---

SvelteKit はサーバーサイドレンダリング（SSR）がデフォルトですが、`prerender` オプションを使うことで静的サイトジェネレーター（SSG）としても利用できます。このブログも全ページをプリレンダリングして Cloudflare Pages にデプロイしています。

## 前提

- SvelteKit プロジェクト（Svelte 5 を想定）
- Node.js v22 以上
- 全ページ静的化を想定する場合は、ユーザー固有データやクエリパラメータに依存するページを含まないこと

## prerender の基本

ページごとに `+page.ts` で `prerender` を `true` に設定します。

```ts
// src/routes/+page.ts
export const prerender = true;
```

レイアウトに設定すると、配下のすべてのページに適用されます。

```ts
// src/routes/+layout.ts
export const prerender = true;
```

## 動的ルートのプリレンダリング

`[slug]` のような動的ルートは、ビルド時にどのパスを生成するか知る必要があります。`entries` 関数でパスの一覧を返します。

```ts
// src/routes/posts/[slug]/+page.ts
export const prerender = true;

export async function entries() {
	const modules = import.meta.glob('/src/posts/*.md');
	return Object.keys(modules).map((path) => ({
		slug: path.split('/').pop()!.replace('.md', '')
	}));
}
```

SvelteKit はページ内のリンクを辿って自動的にプリレンダリング対象を発見する **クローリング** も行います。トップページからリンクされているページは `entries` なしでもプリレンダリングされることがあります。ただし、確実に生成するためには `entries` を明示するのが安全です。

## adapter-static vs adapter-cloudflare

全ページを静的にするなら `adapter-static` も選択肢ですが、このブログでは `adapter-cloudflare` を使っています。

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

const config = {
	kit: {
		adapter: adapter()
	}
};
```

`adapter-cloudflare` でも `prerender = true` のページは静的ファイルとして出力されるので、実質的に SSG と同じ動作になります。将来的にサーバーサイドの処理（API ルート、フォーム処理など）を追加したくなったときに柔軟に対応できるメリットがあります。

## prerender できないケース

以下のようなページはプリレンダリングできません。

- **ユーザー固有のデータを表示するページ** — ログイン状態に依存する場合は SSR が必要
- **動的な検索結果** — クエリパラメータに基づく結果は静的に生成できない
- **フォーム送信を処理するページ** — `+page.server.ts` の `actions` を使う場合

```ts
// これは prerender できない
export async function load({ url }) {
	const q = url.searchParams.get('q'); // 無限のパターンがある
	return { results: await search(q) };
}
```

## handleHttpError の設定

プリレンダリング中にリンク切れがあるとビルドが失敗します。開発中は `warn` に設定しておくと便利です。

```js
// svelte.config.js
const config = {
	kit: {
		prerender: {
			handleHttpError: 'warn'
		}
	}
};
```

本番環境では `fail`（デフォルト）にしてリンク切れを検知するのがおすすめです。

## ビルドと確認

```bash
pnpm build    # プリレンダリング実行
pnpm preview  # ビルド結果をローカルで確認
```

`.svelte-kit/cloudflare/` に生成された HTML ファイルを確認すると、各ページが静的ファイルとして出力されていることが分かります。

## まとめ

- `prerender = true` でページを静的に出力できる
- 動的ルートは `entries` でパスを列挙する
- `adapter-cloudflare` でも prerender は使える — 静的と動的のハイブリッド構成が可能
- 全ページ prerender にすれば実質 SSG として運用できる

## 参照

- [SvelteKit プリレンダリング ドキュメント](https://svelte.dev/docs/kit/page-options#prerender)
- [SvelteKit ドキュメント](https://svelte.dev/docs/kit/)
