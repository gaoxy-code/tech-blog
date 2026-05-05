---
title: Cloudflare Pages のプレビュー環境を活用する — PR ごとの自動デプロイ
description: Cloudflare Pages のプレビューデプロイ機能を使って、PR ごとに確認環境を自動生成する方法を紹介します。
date: 2026-04-15
tags:
  - cloudflare
---

Cloudflare Pages には**プレビューデプロイ**という機能があります。プルリクエストやブランチごとに固有の URL が自動生成され、マージ前にサイトの動作確認ができます。

## 前提

- Cloudflare Pages にデプロイ済みのプロジェクトがあること
- GitHub または GitLab とのリポジトリ連携が設定済みであること（プレビューは Git 連携プロジェクトでのみ有効）

## プレビューデプロイの仕組み

Git 連携を設定している場合、以下のタイミングで自動デプロイされます:

| イベント                  | デプロイ先                                      |
| ------------------------- | ----------------------------------------------- |
| main ブランチへの push    | プロダクション（`project.pages.dev`）           |
| その他のブランチへの push | プレビュー（`<commit-hash>.project.pages.dev`） |
| PR の作成・更新           | プレビュー（PR にコメントで URL が通知される）  |

## PR へのコメント通知

PR を作成すると、Cloudflare Pages のボットが自動でコメントを投稿します。

```text
Deploying with Cloudflare Pages

Latest commit: abc1234
Status: ✅ Deploy successful!
Preview URL: https://abc1234.blog-app.pages.dev
```

レビュアーはこの URL にアクセスするだけで、変更後のサイトを確認できます。

## ブランチごとの URL

プレビューデプロイの URL はいくつかのパターンがあります:

- `<commit-hash>.project.pages.dev` — コミットハッシュベース
- `<branch-name>.project.pages.dev` — ブランチ名ベース

ブランチ名ベースの URL は、同じブランチの最新コミットを常に反映します。

## プレビューブランチの制御

デフォルトではすべてのブランチがプレビュー対象ですが、設定で制御できます。

1. ダッシュボードでプロジェクトを開く
2. **Settings** → **Builds & deployments**
3. **Configure preview deployments** で設定:
   - **All non-production branches** — すべてのブランチ（デフォルト）
   - **Custom branches** — 特定のブランチパターンのみ
   - **None** — プレビュー無効

ビルド回数を節約したい場合は、特定のブランチパターン（例: `feature/*`）だけに限定できます。

## プレビュー環境の環境変数

プレビュー環境用の環境変数を個別に設定できます。

1. **Settings** → **Environment variables**
2. **Preview** タブで変数を設定

```text
# プレビュー環境専用の設定例
PUBLIC_SITE_URL=https://preview.blog-app.pages.dev
ENABLE_DRAFT_POSTS=true
```

これを利用して、プレビュー環境では下書き記事を表示するといった使い方もできます。

## 活用シーン

### 記事のレビュー

ブログ記事を書いたら、PR を作成してプレビュー URL を共有。実際の見た目を確認してからマージできます。

### デザイン変更の確認

レイアウトやスタイルの変更時に、本番環境に影響を与えずに確認。スマートフォンでの表示もプレビュー URL で確認できます。

### 複数の変更を並行して確認

ブランチごとに別の URL が生成されるので、複数の変更を同時に確認・比較できます。

## ローカルプレビューとの使い分け

```bash
pnpm preview  # ローカルで確認（自分だけ見える）
```

ローカルプレビュー（`pnpm preview`）は即座に確認できますが、他の人には共有できません。Cloudflare Pages のプレビューデプロイは URL を共有するだけでチームメンバーに確認してもらえます。

## まとめ

- PR ごとにプレビュー URL が自動生成される
- 環境変数をプレビュー専用に設定できる
- ビルド対象ブランチを制限してビルド回数を節約できる
- 記事レビューやデザイン確認に活用できる

## 参照

- [Cloudflare Pages プレビューデプロイ ドキュメント](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Cloudflare Pages 公式サイト](https://pages.cloudflare.com/)
