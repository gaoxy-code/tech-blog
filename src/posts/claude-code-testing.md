---
title: Claude Code でテストを書く — AI と TDD を実践する
description: Claude Code を活用したテスト駆動開発（TDD）のワークフロー。テストの生成、実行、修正の流れを紹介します。
date: 2026-04-26
tags:
  - claude-code
  - ai
  - testing
---

テストを書くのは重要だけど面倒 — そんなときこそ Claude Code の出番です。AI にテストの生成を任せつつ、テスト駆動開発（TDD）のサイクルを回す方法を紹介します。

## 前提

- Claude Code がインストール済みであること
- プロジェクトにテストランナー（Vitest / Jest など）が導入されていること
- 本記事のサンプルコードは Vitest + `vitest-browser-svelte` を使った SvelteKit プロジェクトを想定

## Claude Code とテスト

Claude Code はテストに関して以下のことができます:

- テストコードの生成
- テストの実行と結果の確認
- 失敗したテストの原因分析と修正
- テストカバレッジの確認

## 基本的なワークフロー

### 1. テストを書いてもらう

```text
src/lib/utils/posts.ts の getAllPosts 関数のテストを書いて
```

Claude Code はソースコードを読み、適切なテストを生成します。

```ts
// src/lib/utils/posts.test.ts
import { describe, expect, it } from 'vitest';
import { getAllPosts } from './posts';

describe('getAllPosts', () => {
	it('記事が日付の降順で返される', async () => {
		const posts = await getAllPosts();
		for (let i = 1; i < posts.length; i++) {
			expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
				new Date(posts[i].date).getTime()
			);
		}
	});

	it('下書き記事が含まれない', async () => {
		const posts = await getAllPosts();
		expect(posts.every((p) => !p.draft)).toBe(true);
	});

	it('すべての記事に必須フィールドがある', async () => {
		const posts = await getAllPosts();
		for (const post of posts) {
			expect(post.slug).toBeTruthy();
			expect(post.title).toBeTruthy();
			expect(post.date).toBeTruthy();
		}
	});
});
```

### 2. テストを実行する

```text
テストを実行して
```

Claude Code が `pnpm test` を実行し、結果を確認します。

### 3. 失敗したテストを修正

```text
失敗しているテストを確認して修正して
```

失敗の原因を分析し、テストコードまたは実装コードを修正します。

## TDD のサイクル

Claude Code で TDD（Red → Green → Refactor）を回すことができます。

### Red: まずテストを書く

```text
記事をタグでフィルタリングする関数のテストを先に書いて。
関数はまだ実装しなくていい。
```

```ts
describe('getPostsByTag', () => {
	it('指定したタグの記事だけ返される', async () => {
		const posts = await getPostsByTag('svelte');
		expect(posts.length).toBeGreaterThan(0);
		expect(posts.every((p) => p.tags.includes('svelte'))).toBe(true);
	});

	it('存在しないタグは空配列を返す', async () => {
		const posts = await getPostsByTag('nonexistent-tag');
		expect(posts).toEqual([]);
	});
});
```

### Green: テストを通す実装を書く

```text
テストが通るように getPostsByTag 関数を実装して
```

### Refactor: リファクタリング

```text
テストが通ったまま、コードをリファクタリングして
```

## コンポーネントテストの生成

```text
PostCard コンポーネントのテストを書いて
```

```ts
// src/lib/components/blog/PostCard.svelte.test.ts
import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import PostCard from './PostCard.svelte';

test('記事タイトルが表示される', async () => {
	const screen = render(PostCard, {
		slug: 'test',
		title: 'テスト記事',
		description: '説明文',
		date: '2026-03-28',
		tags: ['svelte']
	});

	await expect.element(screen.getByText('テスト記事')).toBeVisible();
});

test('タグがバッジとして表示される', async () => {
	const screen = render(PostCard, {
		slug: 'test',
		title: 'テスト記事',
		description: '説明文',
		date: '2026-03-28',
		tags: ['svelte', 'typescript']
	});

	await expect.element(screen.getByText('svelte')).toBeVisible();
	await expect.element(screen.getByText('typescript')).toBeVisible();
});
```

## 効果的な指示のコツ

### エッジケースを意識させる

```text
getAllPosts のテストを書いて。
特に以下のケースを含めて:
- 記事が0件の場合
- draft: true の記事がある場合
- 日付が同じ記事が複数ある場合
```

### テストの種類を指定する

```text
ユニットテストだけ書いて（外部依存なし）
インテグレーションテストを書いて（実際のファイルシステムを使う）
```

### 既存のテストのスタイルに合わせる

```text
既存のテストファイルのスタイルに合わせて書いて
```

Claude Code は既存のテストコードを読み、同じスタイル（describe/it の構造、アサーションの書き方）に合わせます。

## テスト実行の自動化

```text
テストを実行して、失敗があればすべて修正して。
全部通るまで繰り返して。
```

Claude Code はテスト → 修正のサイクルを自動で回してくれます。

## まとめ

- Claude Code にテスト生成を任せると、基本的なケースからエッジケースまでカバーできる
- TDD のサイクル（Red → Green → Refactor）を AI と一緒に回せる
- 失敗したテストの原因分析と修正も自動化できる
- 既存のテストスタイルに合わせたコード生成が可能

## 参照

- [Claude Code ドキュメント](https://docs.anthropic.com/en/docs/claude-code/overview)
