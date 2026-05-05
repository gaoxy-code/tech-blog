---
title: Tailwind CSS v4 の変更点まとめ — v3 からの移行で知っておくこと
description: Tailwind CSS v4 で変わったこと。CSS ベースの設定、新しいカラーシステム、パフォーマンス改善などを解説します。
date: 2026-03-27
tags:
  - tailwindcss
---

Tailwind CSS v4 は、設定の仕組みが大きく変わったメジャーアップデートです。v3 から移行する際に押さえておくべきポイントをまとめます。

## 前提

- Vite ベースのプロジェクト（PostCSS 経由でも使えるが本記事は `@tailwindcss/vite` を推奨構成として扱う）
- Node.js v22 以上
- v3 から移行する場合は、既存の `tailwind.config.js` の内容を CSS に書き換える準備があること

## 最大の変更: CSS ベースの設定

v3 までは `tailwind.config.js`（JavaScript）で設定していましたが、v4 では **CSS ファイル内で設定** します。

### Before（v3）

```js
// tailwind.config.js
module.exports = {
	theme: {
		extend: {
			colors: {
				brand: '#3b82f6'
			}
		}
	}
};
```

### After（v4）

```css
/* app.css */
@import 'tailwindcss';

@theme {
	--color-brand: #3b82f6;
}
```

`tailwind.config.js` は不要になり、`@theme` ディレクティブで CSS 変数としてテーマを定義します。

## Vite プラグインとして動作

v4 は PostCSS プラグインではなく、**Vite プラグイン**として動作します（PostCSS 経由でも使えますが、Vite プラグインが推奨）。

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss()]
});
```

これにより、ビルドパフォーマンスが大幅に向上しています。

## @import による取り込み

v3 では `@tailwind base; @tailwind components; @tailwind utilities;` の 3 行が必要でしたが、v4 では 1 行です。

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import 'tailwindcss';
```

## 新しいカラーパレット

v4 ではカラーパレットが OKLCH ベースに更新されました。より広い色域をサポートし、色の知覚的な均一性が向上しています。

```css
@theme {
	--color-primary: oklch(0.6 0.2 250);
}
```

## コンテナクエリのネイティブサポート

v3 では `@tailwindcss/container-queries` プラグインが必要でしたが、v4 ではビルトインです。

```html
<div class="@container">
	<div class="grid grid-cols-1 @lg:grid-cols-2">
		<!-- コンテナ幅に応じてレイアウト変更 -->
	</div>
</div>
```

## 移行のポイント

### 1. tailwind.config.js → @theme

設定を CSS に移行します。多くのプロジェクトでは `@theme` ブロックに移すだけで済みます。

### 2. content の設定が不要に

v4 は自動でソースファイルを検出するため、`content` の設定が不要になりました。

### 3. プラグインの互換性

v3 のプラグインがそのまま動かない場合があります。`@tailwindcss/typography` は v4 対応版を使いましょう。

```bash
pnpm add -D @tailwindcss/typography@latest
```

### 4. 一部のクラス名の変更

| v3              | v4                                   |
| --------------- | ------------------------------------ |
| `bg-opacity-50` | `bg-black/50` （既に v3 でも使えた） |
| `ring-offset-2` | 統合された ring ユーティリティ       |

## SvelteKit での設定例

このブログで実際に使っている設定を抜粋します。`vite.config.ts` 側はプラグインを並べるだけです。

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

CSS 側がやや複雑になります。ポイントは 4 つです。

```css
/* src/routes/layout.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn-svelte/tailwind.css';
@import '@fontsource-variable/geist';

@custom-variant dark (&:is(.dark *));
@plugin '@tailwindcss/typography';

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--primary: oklch(0.45 0.16 155);
	--muted: oklch(0.97 0 0);
	/* ... */
}

.dark {
	--background: oklch(0.145 0 0);
	--foreground: oklch(0.985 0 0);
	--primary: oklch(0.65 0.18 155);
	/* ... */
}

@theme inline {
	--font-sans: 'Geist Variable', sans-serif;
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	/* ... */
}
```

### ポイント

1. **`@import 'tailwindcss'` を先頭に置く** — その後にプラグインや shadcn-svelte の追加 CSS を読み込む
2. **`@custom-variant dark` でクラスベースのダークモードを定義** — v3 の `darkMode: 'class'` 相当
3. **`:root` と `.dark` で CSS 変数を上書き** — JavaScript で `<html class="dark">` をトグルすれば配色が一斉に切り替わる
4. **`@theme inline` で CSS 変数を Tailwind ユーティリティへ橋渡し** — `bg-background` や `text-primary` などのクラスが、上で定義した `--background` / `--primary` を参照するようになる

`@theme inline` の `inline` は、変数の値を埋め込まずに `var()` 参照のまま展開する指定です。これにより `.dark` での再定義が遅延評価され、同じ `bg-background` クラスがライト/ダークで適切に切り替わります。

## まとめ

Tailwind CSS v4 は設定方法が大きく変わりましたが、「CSS の中で完結する」というシンプルな方向への進化です。パフォーマンスも向上しているので、新規プロジェクトでは v4 を選択するのが良いでしょう。

## 参照

- [Tailwind CSS 公式サイト](https://tailwindcss.com/)
- [Tailwind CSS v4 アップグレードガイド](https://tailwindcss.com/docs/upgrade-guide)
