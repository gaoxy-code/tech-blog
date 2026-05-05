---
title: CLAUDE.md 活用術 — プロジェクト固有のルールを AI に伝える
description: CLAUDE.md ファイルを使って Claude Code にプロジェクトのコンテキストを伝える方法。効果的な書き方と実例を紹介します。
date: 2026-04-20
tags:
  - claude-code
  - ai
---

Claude Code を使うとき、毎回プロジェクトの説明をするのは非効率です。`CLAUDE.md` ファイルにプロジェクトの情報を書いておけば、Claude Code が自動で読み込んで理解してくれます。

## 前提

- Claude Code がインストール済みで、ターミナルから `claude` コマンドを実行できること
- 設定対象のプロジェクトがあるか、グローバル設定の場合 `~/.claude/` ディレクトリが存在すること

## CLAUDE.md とは

プロジェクトのルートに配置する Markdown ファイルで、Claude Code が会話開始時に自動で読み込みます。プロジェクト固有のルール、コマンド、アーキテクチャなどを記述します。

## 配置場所

| パス                           | スコープ                         |
| ------------------------------ | -------------------------------- |
| `~/.claude/CLAUDE.md`          | グローバル（全プロジェクト共通） |
| `プロジェクトルート/CLAUDE.md` | プロジェクト固有                 |

グローバル設定には言語設定や共通ルールを、プロジェクト設定にはプロジェクト固有の情報を書きます。

## 書くべき内容

### 1. よく使うコマンド

```markdown
## コマンド

- `pnpm dev` — 開発サーバー起動
- `pnpm build` — 本番ビルド
- `pnpm check` — 型チェック
- `pnpm lint` — リント実行
- `pnpm test` — テスト実行
```

Claude Code がビルドやテストを実行するとき、正しいコマンドを使ってくれます。

### 2. アーキテクチャの概要

```markdown
## アーキテクチャ

- デプロイ先: Cloudflare Pages
- 記事は `src/posts/*.md` に Markdown で配置
- すべてのルートは `prerender = true`（静的生成）
- UI コンポーネントは shadcn-svelte ベース
```

### 3. コーディング規約

```markdown
## 規約

- Svelte 5 Runes を使用（$state, $derived, $effect）
- `.md` ファイル以外は runes モード強制
- 日本語でコメント・ドキュメントを記述
```

### 4. 注意事項

```markdown
## 注意

- 開発サーバーでは Pagefind（全文検索）が動作しない
- 検索機能のテストは `pnpm build && pnpm preview` で確認
```

## このブログの CLAUDE.md

実際にこのプロジェクトで使っている CLAUDE.md の抜粋です:

```markdown
# CLAUDE.md

## General

このプロジェクトのドキュメントやCLAUDE.mdは日本語で記述すること。

## コマンド

pnpm dev # 開発サーバー起動
pnpm build # 本番ビルド
pnpm check # 型チェック
pnpm test # 全テスト実行

## アーキテクチャ

**デプロイ先**: Cloudflare Pages
**記事管理**: src/posts/\*.md に Markdown ファイルを置く
**UI コンポーネント**: shadcn-svelte / bits-ui ベース
**Svelte**: Svelte 5 Runes モード強制
```

## 効果的な書き方のコツ

### 簡潔に書く

CLAUDE.md が長すぎると、重要な情報が埋もれます。箇条書きや表を使って簡潔にまとめましょう。

### 「なぜ」を書く

ルールだけでなく理由も書くと、Claude Code が意図を理解してエッジケースでも適切な判断をしてくれます。

```markdown
# ❌ ルールだけ

- `adapter-static` を使わない

# ✅ 理由も書く

- `adapter-cloudflare` を使用（将来の SSR 対応を見据えて）
```

### 変更があったら更新する

プロジェクトの構成が変わったら CLAUDE.md も更新しましょう。古い情報があると、Claude Code が間違った前提で作業する可能性があります。

## グローバル CLAUDE.md

`~/.claude/CLAUDE.md` にはプロジェクト横断の設定を書きます。

```markdown
# グローバル設定

## 言語

- 常に日本語で回答する
- コード・コマンド・技術用語はそのまま英語

## 行動指針

- 破壊的な操作は事前に確認する
- 結論を先に伝える
```

## まとめ

CLAUDE.md は Claude Code との「共有ドキュメント」です。プロジェクトのコンテキストを事前に伝えておくことで、毎回の説明が不要になり、より的確なアウトプットが得られます。Git にコミットしておけば、チームメンバーも同じコンテキストで Claude Code を使えます。

## 参照

- [Claude Code 公式サイト](https://claude.ai/code)
- [Claude Code — CLAUDE.md ドキュメント](https://docs.anthropic.com/en/docs/claude-code/memory)
