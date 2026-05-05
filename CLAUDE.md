# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General

このプロジェクトのドキュメントやCLAUDE.mdは日本語で記述すること。

## コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # 本番ビルド（wrangler types → vite build → pagefind インデックス生成）
pnpm preview      # 本番ビルドをローカルプレビュー（wrangler pages dev）
pnpm check        # 型チェック（svelte-check）
pnpm lint         # prettier + eslint チェック
pnpm format       # prettier 自動修正
pnpm test         # 全テスト実行（単発）
pnpm test:unit    # vitest ウォッチモード
pnpm gen          # wrangler types 生成
```

テストは `src/**/*.svelte.{test,spec}.{js,ts}` がブラウザ（Playwright/Chromium）、それ以外が Node 環境で実行される。

## アーキテクチャ

**デプロイ先**: Cloudflare Pages（`@sveltejs/adapter-cloudflare`）。全ルートは `prerender = true` で静的に出力される。

**記事管理**: `src/posts/*.md` に Markdown ファイルを置く。フロントマターに以下を記述する：

```yaml
---
title: タイトル
description: 説明
date: 2026-04-15
tags:
  - tag1
draft: true # 省略可。true にすると一覧・検索から除外される
---
```

`mdsvex` により `.md` ファイルは Svelte コンポーネントとして処理される。すべての記事は自動的に `src/lib/layouts/post.svelte` をレイアウトとして使用する（`svelte.config.js` の `layout._` で設定）。

**記事取得**: `src/lib/utils/posts.ts` の `getAllPosts()` / `getAllTags()` が `import.meta.glob` で `src/posts/*.md` を収集する。`draft: true` は除外され、日付降順でソートされる。

**ルート構成**:

- `/` — 記事一覧（`+page.ts` で `getAllPosts()` を呼び出す）
- `/posts/[slug]` — 記事詳細（mdsvex がレンダリング）
- `/tags/[tag]` — タグ別一覧
- `/search` — Pagefind による全文検索

**全文検索**: `pnpm build` 実行時に `pagefind --site .svelte-kit/cloudflare` でインデックスを生成。`Search.svelte` は `/pagefind/pagefind.js` を動的インポートするため、**開発サーバーでは検索が機能しない**（ビルド後の `pnpm preview` で確認する）。

**UI コンポーネント**: `shadcn-svelte` / `bits-ui` ベース。`src/lib/components/ui/` 以下に配置。`@/*` エイリアスは `./src/lib/*` を指す。

**Svelte**: プロジェクト全体で Svelte 5 Runes モード強制（`.md` / `.svx` ファイルを除く）。

## 記事作成のルール

### 参照リンク

記事の末尾には必ず `## 参照` セクションを設け、関連する公式サイト・ドキュメント・GitHub リポジトリのリンクを列挙すること。

```markdown
## 参照

- [ライブラリ名 公式サイト](https://example.com)
- [ライブラリ名 ドキュメント](https://example.com/docs)
- [ライブラリ名 GitHub](https://github.com/org/repo)
```

**ガイドライン**:

- 必須: 記事の主題となるライブラリ・ツールの**公式サイト**または**公式ドキュメント**
- 推奨: GitHub リポジトリ、仕様・RFC、関連する公式ガイドページ
- リンクテキストはサイト名と種別（公式サイト / ドキュメント / GitHub など）を明記する
- 個人ブログや非公式サイトは原則含めない（一次情報を優先する）
