---
title: ESLint + Prettier を SvelteKit プロジェクトに設定する
description: SvelteKit プロジェクトでの ESLint と Prettier の設定方法。Svelte ファイルの対応と、競合を避ける設定を解説します。
date: 2026-04-03
tags:
  - eslint
  - prettier
  - svelte-kit
---

コードの品質と一貫性を保つために、ESLint（静的解析）と Prettier（フォーマッター）を併用するのが一般的です。SvelteKit プロジェクトでは `.svelte` ファイルの対応が必要で、いくつか注意点があります。

## 前提

- Node.js v22 以上
- ESLint v9 以上（Flat Config 前提）
- Prettier v3 以上
- 本記事は SvelteKit プロジェクトを対象としているが、Node.js プロジェクト全般に応用可能

## パッケージのインストール

SvelteKit のプロジェクト作成時に ESLint と Prettier を選択すると自動でインストールされますが、手動で追加する場合:

```bash
pnpm add -D eslint prettier \
  eslint-plugin-svelte \
  eslint-config-prettier \
  prettier-plugin-svelte \
  prettier-plugin-tailwindcss \
  typescript-eslint \
  globals
```

## ESLint の設定（Flat Config）

ESLint v9 以降は Flat Config（`eslint.config.js`）が標準です。

```js
// eslint.config.js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', '.wrangler/', '.vercel/']
	}
);
```

### ポイント

- `eslint-config-prettier` で Prettier と競合するルールを無効化
- `eslint-plugin-svelte` で `.svelte` ファイルを解析
- `svelte.configs.prettier` で Svelte 固有の Prettier 競合ルールも無効化
- `ignores` でビルド出力を除外

## Prettier の設定

```json
// .prettierrc
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	"overrides": [
		{
			"files": "*.svelte",
			"options": {
				"parser": "svelte"
			}
		}
	]
}
```

### プラグインの役割

- **prettier-plugin-svelte** — `.svelte` ファイルのフォーマット対応
- **prettier-plugin-tailwindcss** — Tailwind CSS のクラス名を推奨順序に自動ソート

## .prettierignore

```text
# .prettierignore
build/
.svelte-kit/
dist/
.wrangler/
pnpm-lock.yaml
```

## npm スクリプト

```json
{
	"scripts": {
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write ."
	}
}
```

`lint` はチェックのみ（CI 用）、`format` は自動修正です。

## エディタ連携

### VS Code

`.vscode/settings.json`:

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"[svelte]": {
		"editor.defaultFormatter": "svelte.svelte-vscode"
	},
	"eslint.validate": ["javascript", "typescript", "svelte"]
}
```

### 推奨拡張機能

- **Svelte for VS Code** — Svelte 言語サポート
- **ESLint** — リアルタイム ESLint チェック
- **Prettier** — 保存時自動フォーマット

## Tailwind CSS クラスの自動ソート

`prettier-plugin-tailwindcss` により、クラス名が Tailwind の推奨順序に自動ソートされます。

```svelte
<!-- Before -->
<div class="p-4 flex bg-white rounded-lg shadow-md items-center">

<!-- After（自動ソート） -->
<div class="flex items-center rounded-lg bg-white p-4 shadow-md">
```

## CI での実行

GitHub Actions で lint を自動実行する例:

```yaml
- name: Lint
  run: pnpm lint

- name: Type check
  run: pnpm check
```

`pnpm lint` が失敗すると PR のマージをブロックできます。

## まとめ

- ESLint で静的解析、Prettier でフォーマット
- `eslint-config-prettier` で競合を解消
- `.svelte` ファイルは専用プラグインで対応
- `prettier-plugin-tailwindcss` でクラス名を自動ソート
- 保存時の自動フォーマットでストレスフリーに

## 参照

- [ESLint 公式サイト](https://eslint.org/)
- [Prettier 公式サイト](https://prettier.io/)
- [eslint-plugin-svelte GitHub](https://github.com/sveltejs/eslint-plugin-svelte)
- [prettier-plugin-tailwindcss GitHub](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
