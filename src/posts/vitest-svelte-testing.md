---
title: Vitest + Playwright で Svelte コンポーネントをテストする
description: Vitest を使ったSvelte コンポーネントのユニットテスト方法。ブラウザモードでの実行と、テストの書き方を解説します。
date: 2026-04-05
tags:
  - vitest
  - svelte
  - testing
---

Vitest は Vite ベースのテストフレームワークで、SvelteKit プロジェクトとの相性が抜群です。このブログでは Vitest + Playwright のブラウザモードを使って、Svelte コンポーネントを実際のブラウザ上でテストしています。

## 前提

- SvelteKit プロジェクト（Svelte 5 を想定）
- Node.js v22 以上
- Playwright のブラウザバイナリをダウンロードできるネットワーク環境（初回 `npx playwright install` でセットアップ）

## セットアップ

```bash
pnpm add -D vitest @vitest/browser-playwright playwright vitest-browser-svelte
```

`vite.config.ts` にテスト設定を追加:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }]
		}
	}
});
```

## テストの種類

このプロジェクトでは 2 種類のテスト環境を使い分けています:

| パターン           | 環境                   | 用途                     |
| ------------------ | ---------------------- | ------------------------ |
| `*.svelte.test.ts` | ブラウザ（Playwright） | コンポーネントテスト     |
| `*.test.ts`        | Node.js                | ユーティリティ関数テスト |

## コンポーネントテストの書き方

`vitest-browser-svelte` の `render` を使ってコンポーネントをレンダリングします。

```ts
// src/lib/components/Counter.svelte.test.ts
import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import Counter from './Counter.svelte';

test('初期値が表示される', async () => {
	const screen = render(Counter, { count: 0 });
	await expect.element(screen.getByText('0')).toBeVisible();
});

test('クリックでカウントが増える', async () => {
	const screen = render(Counter, { count: 0 });
	const button = screen.getByRole('button');
	await button.click();
	await expect.element(screen.getByText('1')).toBeVisible();
});
```

### Props の渡し方

```ts
render(PostCard, {
	title: 'テスト記事',
	description: '説明文',
	date: '2026-03-15',
	slug: 'test-post',
	tags: ['svelte', 'test']
});
```

### イベントのテスト

```ts
test('ボタンクリックでイベントが発火する', async () => {
	let clicked = false;
	const screen = render(Button, {
		onclick: () => {
			clicked = true;
		}
	});

	await screen.getByRole('button').click();
	expect(clicked).toBe(true);
});
```

## ユーティリティ関数のテスト

```ts
// src/lib/utils/posts.test.ts
import { describe, expect, it } from 'vitest';
import { getAllPosts, getAllTags } from './posts';

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
});

describe('getAllTags', () => {
	it('タグとカウントのマップが返される', async () => {
		const tags = await getAllTags();
		expect(tags).toBeInstanceOf(Map);
		for (const [, count] of tags) {
			expect(count).toBeGreaterThan(0);
		}
	});
});
```

## テストの実行

```bash
pnpm test          # 全テスト実行（単発）
pnpm test:unit     # ウォッチモード（開発中に便利）
```

## テストのコツ

### 1. アクセシビリティロールで要素を探す

```ts
// ❌ テスト ID やクラス名に依存
screen.getByTestId('submit-btn');

// ✅ アクセシビリティロールを使う
screen.getByRole('button', { name: '送信' });
```

### 2. 非同期の変更を待つ

Svelte のリアクティビティは非同期で反映されるため、`await` を使います。

```ts
await button.click();
await expect.element(screen.getByText('更新後のテキスト')).toBeVisible();
```

### 3. テストごとにクリーンアップ

`render` は各テスト後に自動でクリーンアップされるので、手動での cleanup は不要です。

## まとめ

- Vitest + Playwright でブラウザ上のコンポーネントテストが可能
- `.svelte.test.ts` はブラウザ環境、`.test.ts` は Node.js 環境
- `vitest-browser-svelte` の `render` でコンポーネントをレンダリング
- アクセシビリティロールでの要素取得を推奨

## 参照

- [Vitest 公式サイト](https://vitest.dev/)
- [Vitest ブラウザモード ドキュメント](https://vitest.dev/guide/browser/)
- [vitest-browser-svelte GitHub](https://github.com/vitest-dev/vitest-browser-svelte)
