---
title: SvelteKit でダークモードを実装する — Tailwind CSS + システム設定連携
description: SvelteKit + Tailwind CSS でダークモード切り替えを実装する方法。システム設定との連携やフラッシュ防止のテクニックも紹介します。
date: 2026-04-01
tags:
  - svelte-kit
  - tailwindcss
---

ダークモードは今や Web サイトの標準的な機能です。SvelteKit + Tailwind CSS で、ユーザーの好みに応じたテーマ切り替えを実装する方法を解説します。

## 前提

- SvelteKit プロジェクト（Svelte 5 Runes モードを想定）
- Tailwind CSS v4 が導入済みで、`@custom-variant dark (&:is(.dark *))` のようなクラスベースのダークモード設定が可能なこと
- shadcn-svelte を使う場合は CSS 変数（`--background` 等）が `:root` と `.dark` の両方で定義されていること

## Tailwind CSS のダークモード

Tailwind CSS は `dark:` プレフィックスでダークモード用のスタイルを記述できます。

```html
<div class="bg-white text-black dark:bg-gray-900 dark:text-white">
	ライトモードでは白背景、ダークモードでは暗い背景
</div>
```

## テーマの管理方法

テーマの管理には 3 つのアプローチがあります。

### 1. システム設定に従う（prefers-color-scheme）

```css
@media (prefers-color-scheme: dark) {
	:root {
		color-scheme: dark;
	}
}
```

OS やブラウザの設定に自動で追従します。最もシンプルですが、ユーザーが手動で切り替えられません。

### 2. クラスベース（手動切り替え）

`<html>` 要素にクラスを付与してテーマを制御します。

```html
<html class="dark">
	<!-- dark: プレフィックスが有効になる -->
</html>
```

### 3. ハイブリッド（推奨）

システム設定をデフォルトにしつつ、ユーザーが手動でも切り替えられるアプローチです。

## 実装

### テーマの状態管理

```ts
// theme.svelte.ts
type Theme = 'light' | 'dark' | 'system';

let theme = $state<Theme>('system');

export function getTheme() {
	return theme;
}

export function setTheme(newTheme: Theme) {
	theme = newTheme;
	localStorage.setItem('theme', newTheme);
	applyTheme(newTheme);
}

function applyTheme(t: Theme) {
	const isDark =
		t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

	document.documentElement.classList.toggle('dark', isDark);
}

export function initTheme() {
	const saved = localStorage.getItem('theme') as Theme | null;
	theme = saved ?? 'system';
	applyTheme(theme);

	// システム設定の変更を監視
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (theme === 'system') {
			applyTheme('system');
		}
	});
}
```

### テーマ切り替えボタン

```svelte
<script lang="ts">
	import { getTheme, setTheme } from './theme.svelte.ts';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Monitor from '@lucide/svelte/icons/monitor';

	const themes = [
		{ value: 'light', icon: Sun, label: 'ライト' },
		{ value: 'dark', icon: Moon, label: 'ダーク' },
		{ value: 'system', icon: Monitor, label: 'システム' }
	] as const;
</script>

<div class="flex gap-1">
	{#each themes as t}
		<button
			onclick={() => setTheme(t.value)}
			class="rounded-md p-2"
			class:bg-muted={getTheme() === t.value}
			aria-label={t.label}
		>
			<t.icon size={16} />
		</button>
	{/each}
</div>
```

### フラッシュ防止

SSG（静的サイト生成）では、HTML が読み込まれてから JavaScript が実行されるまでの間にデフォルトテーマが表示されてしまう「フラッシュ」が発生します。

これを防ぐために、`<head>` にインラインスクリプトを追加します。

```html
<!-- src/app.html -->
<head>
	<script>
		(function () {
			const theme = localStorage.getItem('theme') ?? 'system';
			const isDark =
				theme === 'dark' ||
				(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
			if (isDark) document.documentElement.classList.add('dark');
		})();
	</script>
</head>
```

このスクリプトは HTML パース時に同期的に実行されるため、ページが表示される前にテーマが適用されます。

## shadcn-svelte のダークモード対応

shadcn-svelte のコンポーネントは CSS 変数でテーマカラーを管理しているため、ダークモードに自動対応しています。

```css
:root {
	--background: 0 0% 100%;
	--foreground: 222.2 84% 4.9%;
}

.dark {
	--background: 222.2 84% 4.9%;
	--foreground: 210 40% 98%;
}
```

`dark` クラスの有無で CSS 変数が切り替わり、すべてのコンポーネントの色が連動して変わります。

## @tailwindcss/typography のダークモード

```html
<article class="prose dark:prose-invert">
	<!-- Markdown コンテンツ -->
</article>
```

`dark:prose-invert` を追加するだけで、記事のテキスト色が反転します。

## まとめ

- Tailwind CSS の `dark:` プレフィックスでスタイルを切り替え
- `localStorage` + システム設定のハイブリッドが実用的
- `app.html` のインラインスクリプトでフラッシュを防止
- shadcn-svelte は CSS 変数で自動対応

## 参照

- [Tailwind CSS ダークモード ドキュメント](https://tailwindcss.com/docs/dark-mode)
- [Svelte 公式サイト](https://svelte.dev/)
