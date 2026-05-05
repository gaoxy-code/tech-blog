---
title: Cloudflare Pages に SvelteKit をデプロイする手順と Tips
description: SvelteKit プロジェクトを Cloudflare Pages にデプロイする方法。adapter-cloudflare の設定からカスタムドメインまで解説します。
date: 2026-04-13
tags:
  - cloudflare
  - svelte-kit
---

Cloudflare Pages は静的サイトとサーバーレスファンクションの両方をホスティングできるプラットフォームです。SvelteKit の `adapter-cloudflare` を使えば、シームレスにデプロイできます。

## 前提

- Cloudflare のアカウント（無料プラン可）
- デプロイ対象の SvelteKit プロジェクト
- GitHub または GitLab のリポジトリ（Git 連携を使う場合）
- Node.js v22 以上（v24 を推奨。本記事のビルド設定例で `NODE_VERSION=24` を使用）

## adapter-cloudflare のセットアップ

```bash
pnpm add -D @sveltejs/adapter-cloudflare
```

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

const config = {
	kit: {
		adapter: adapter({
			routes: {
				exclude: ['<build>', '<prerendered>', '<files>', '/pagefind/*']
			}
		})
	}
};
```

`routes.exclude` で静的ファイルや Pagefind のインデックスを Functions の処理対象から除外しています。

## Cloudflare ダッシュボードからデプロイ

1. GitHub にリポジトリを push
2. Cloudflare ダッシュボード → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. ビルド設定を入力:

| 項目                   | 値                       |
| ---------------------- | ------------------------ |
| Framework preset       | SvelteKit                |
| Build command          | `pnpm build`             |
| Build output directory | `.svelte-kit/cloudflare` |

4. 環境変数を追加:

| 変数           | 値   |
| -------------- | ---- |
| `NODE_VERSION` | `24` |

5. **Save and Deploy** をクリック

初回ビルドには数分かかります。完了すると `https://<project-name>.pages.dev` でサイトが公開されます。

## wrangler CLI でのデプロイ

ダッシュボードを使わず、CLI からもデプロイできます。

```bash
pnpm build
pnpm wrangler pages deploy .svelte-kit/cloudflare
```

初回は対話的にプロジェクト名を聞かれます。2 回目以降はプロジェクト名を指定できます。

## カスタムドメインの設定

1. Cloudflare ダッシュボードでプロジェクトを開く
2. **Custom domains** → **Set up a custom domain**
3. ドメイン名を入力（例: `blog.example.com`）
4. DNS レコードが自動で追加される

Cloudflare で DNS を管理している場合は、SSL 証明書も自動で発行されます。

## 環境変数とシークレット

ビルド時に必要な環境変数は、ダッシュボードの **Settings** → **Environment variables** で設定します。

```text
# ビルド時に使う環境変数
PUBLIC_SITE_URL=https://blog.example.com
```

SvelteKit では `$env/static/public` や `$env/static/private` でアクセスできます。

```ts
import { PUBLIC_SITE_URL } from '$env/static/public';
```

## ビルドキャッシュ

Cloudflare Pages はデフォルトで `node_modules` をキャッシュします。依存関係が変わらない限りインストールがスキップされ、ビルドが高速化されます。

## Web Analytics

Cloudflare Pages には無料の Web Analytics が付属しています。

1. ダッシュボードでプロジェクトを開く
2. **Web Analytics** → **Enable**

JavaScript のスニペットが自動挿入され、ページビューやリファラーなどの基本的なアナリティクスが取得できます。プライバシーに配慮した設計で、Cookie を使用しません。

## \_headers と \_redirects

静的ファイルで HTTP ヘッダーやリダイレクトを設定できます。

```text
# static/_headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

```text
# static/_redirects
/old-path /new-path 301
/blog/* /posts/:splat 301
```

## 料金

Cloudflare Pages の無料プラン:

- ビルド: 500 回/月
- 帯域: 無制限
- サイト数: 無制限
- カスタムドメイン: 無制限

個人ブログには十分すぎるスペックです。

## まとめ

Cloudflare Pages は SvelteKit との相性が良く、無料で高速なデプロイ環境を提供してくれます。Git 連携による自動デプロイ、プレビュー環境、Web Analytics など、ブログ運営に必要な機能が揃っています。

## 参照

- [Cloudflare Pages 公式サイト](https://pages.cloudflare.com/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [@sveltejs/adapter-cloudflare GitHub](https://github.com/sveltejs/kit/tree/main/packages/adapter-cloudflare)
