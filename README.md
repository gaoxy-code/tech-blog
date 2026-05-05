# toishi's blog

SvelteKit + Cloudflare Pages で動く静的技術ブログ。

## 技術スタック

| カテゴリ       | 技術                                       |
| -------------- | ------------------------------------------ |
| フレームワーク | SvelteKit (Svelte 5 Runes)                 |
| デプロイ       | Cloudflare Pages (`adapter-cloudflare`)    |
| スタイル       | Tailwind CSS v4 + shadcn-svelte            |
| 記事           | mdsvex（Markdown → Svelte コンポーネント） |
| 全文検索       | Pagefind                                   |
| OGP 画像       | satori + resvg-js（ビルド時に静的生成）    |
| RSS            | `/rss.xml`（ビルド時に静的生成）           |
| サイトマップ   | `/sitemap.xml`（ビルド時に静的生成）       |

## セットアップ

```bash
git clone https://github.com/gaoxy-code/tech-blog
cd tech-blog
pnpm install
pnpm dev        # http://localhost:5173
```

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # 本番ビルド（型チェック → vite build → pagefind インデックス生成）
pnpm preview      # 本番ビルドをローカルプレビュー（wrangler pages dev）
pnpm check        # 型チェック（svelte-check）
pnpm lint         # prettier + eslint チェック
pnpm format       # prettier 自動修正
pnpm test         # 全テスト実行
```

> 全文検索と OGP 画像は `pnpm build` 後の `pnpm preview` でのみ動作する。開発サーバーでは利用不可。

## 記事を書く

`src/posts/` に Markdown ファイルを作成する。ファイル名がそのまま URL のスラッグになる。

```markdown
---
title: 記事タイトル
description: 概要（OGP・RSS にも使われる）
date: 2026-04-15
tags:
  - svelte
  - sveltekit
draft: true # 省略可。true にすると一覧・検索から除外される
---

本文を書く。Svelte コンポーネントも import して使える。
```

## サイト設定

`src/lib/config.ts` でサイト全体のメタ情報を管理する。

```ts
export const siteConfig = {
	title: "toishi's blog",
	description: 'SvelteKit で作った技術ブログ',
	url: 'https://toishi.dev'
} as const;
```

## 環境変数

`.env.example` をコピーして `.env` を作成する。

```bash
cp .env.example .env
```

| 変数名                   | 説明                                        | 必須 |
| ------------------------ | ------------------------------------------- | ---- |
| `PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics のビーコントークン | 任意 |

## Cloudflare Pages へのデプロイ

1. GitHub にリポジトリを push
2. Cloudflare ダッシュボード → Workers & Pages → Create → Pages → Connect to Git
3. ビルド設定:
   - **Framework preset**: SvelteKit
   - **Build command**: `pnpm build`
   - **Build output directory**: `.svelte-kit/cloudflare`
   - **Environment variables**: `NODE_VERSION=24`
4. Deploy

## OGP 画像

記事ごとの OGP 画像（1200×630px）が `pnpm build` 時に自動生成される。

- `/og.png` — トップページ・一覧ページ用のデフォルト画像
- `/posts/[slug]/og.png` — 記事ごとの画像（タイトル・日付・タグ入り）

デザインは `src/lib/server/og.ts` の `generateOgImage()` 内で変更できる。satori は Flexbox ベースのレイアウトで、`type`（HTML 要素名）と `props.style`（CSS プロパティ）で記述する。

## ディレクトリ構成

```
src/
├─ routes/
│  ├─ +layout.svelte        # グローバルレイアウト
│  ├─ +page.svelte          # トップ（記事一覧）
│  ├─ posts/[slug]/         # 記事詳細
│  ├─ tags/[tag]/           # タグ別一覧
│  ├─ search/               # 全文検索
│  ├─ rss.xml/              # RSS フィード
│  ├─ sitemap.xml/          # サイトマップ
│  └─ og.png/               # デフォルト OGP 画像
├─ lib/
│  ├─ components/blog/      # ブログ固有のコンポーネント
│  ├─ components/ui/        # shadcn-svelte
│  ├─ layouts/post.svelte   # 記事レイアウト（mdsvex 用）
│  ├─ server/og.ts          # OGP 画像生成
│  ├─ utils/posts.ts        # 記事メタデータ取得
│  └─ config.ts             # サイト設定
└─ posts/                   # ★記事 Markdown ファイル
```
