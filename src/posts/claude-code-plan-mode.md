---
title: Claude Code の Plan モードで設計してから実装する
description: Claude Code の Plan モードを使って、実装前に設計を固めるワークフロー。コードの変更なしに調査・計画ができます。
date: 2026-04-23
tags:
  - claude-code
  - ai
---

大きな変更を加えるとき、いきなりコードを書き始めると方向性を見失うことがあります。Claude Code の **Plan モード** を使えば、コードを一切変更せずに調査と設計を行えます。

## 前提

- Claude Code がインストール済みで、ターミナルから `claude` を起動できること
- 調査対象のコードベースが手元にあること（Plan モードはファイルを読んで設計するため）

## Plan モードとは

Plan モードは、Claude Code に「読み取り専用」の制約を課すモードです。ファイルの読み込みや検索はできますが、ファイルの編集やコマンドの実行は行いません。

## Plan モードの起動

```text
/plan タグフィルタリング機能を追加したい
```

または、会話の途中で:

```text
Plan モードに切り替えて
```

## ワークフロー

Plan モードは以下のフェーズで進みます。

### Phase 1: 調査

Claude Code がコードベースを探索して、現状を理解します。

- 関連するファイルの特定
- 既存の実装パターンの把握
- 再利用できる関数やコンポーネントの発見

```text
Claude: 以下のファイルを確認しました:
- src/lib/utils/posts.ts — getAllPosts() でタグ情報を取得済み
- src/routes/tags/[tag]/+page.ts — タグ別一覧は既に実装済み
- src/lib/components/blog/PostCard.svelte — タグの表示なし
```

### Phase 2: 設計

調査結果に基づいて、実装計画を立てます。

```markdown
## 実装計画

### 変更するファイル

1. src/lib/components/blog/PostCard.svelte
   - tags props を追加
   - Badge コンポーネントでタグを表示

2. src/routes/+page.svelte
   - PostCard に tags を渡す

### 再利用する既存コード

- Badge コンポーネント（src/lib/components/ui/badge）
- getAllTags()（src/lib/utils/posts.ts）
```

### Phase 3: 確認

ユーザーに計画の確認を求めます。

```text
Claude: この計画で進めてよろしいですか？
修正したい点があればお知らせください。
```

### Phase 4: 実行

Plan モードを終了して実装に移ります。計画ファイルに基づいて、効率的にコードを修正します。

## Plan モードが有効な場面

### 大きなリファクタリング

影響範囲を事前に把握してから作業できます。

```text
/plan コンポーネントの状態管理を Store から Runes に移行したい
```

### 新機能の追加

既存コードとの整合性を確認してから設計できます。

```text
/plan RSS フィード生成機能を追加したい
```

### アーキテクチャの検討

コードを読んで現状を把握し、改善案を提案してもらえます。

```text
/plan パフォーマンス改善のためにできることを調査して
```

## Plan モードの利点

### 1. 安全にコードを探索できる

ファイルが変更されないので、安心してコードベースを調査できます。

### 2. 実装の方向性を事前に合意できる

計画を確認してから実装に入るので、手戻りが減ります。

### 3. 見落としを防げる

Claude Code が関連するファイルを網羅的に調査してくれるので、影響範囲の見落としが減ります。

## 計画ファイル

Plan モード中に作成された計画は、ファイルとして保存されます。実装フェーズではこのファイルを参照しながら作業が進みます。

```text
~/.claude/plans/
└── golden-popping-star.md  ← 計画ファイル
```

## まとめ

- Plan モードはコード変更なしに調査・設計ができる
- 調査 → 設計 → 確認 → 実行のフェーズで進む
- 大きな変更やリファクタリングの前に使うと効果的
- 計画を事前に合意することで手戻りを減らせる

## 参照

- [Claude Code ドキュメント](https://docs.anthropic.com/en/docs/claude-code/overview)
