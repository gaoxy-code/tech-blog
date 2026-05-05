---
title: TypeScript の satisfies 演算子を活用する — 型安全と型推論の両立
description: TypeScript 4.9 で追加された satisfies 演算子の使い方と活用パターンを紹介。型アノテーションとの違いを理解します。
date: 2026-04-07
tags:
  - typescript
---

TypeScript 4.9 で導入された `satisfies` 演算子は、型の検証と型推論を両立させる強力な機能です。従来の型アノテーション（`: Type`）では失われていた型の詳細情報を保持できます。

## 前提

- TypeScript 4.9 以上が動作するプロジェクト
- `tsconfig.json` で `strict: true` を有効にしておくと、`satisfies` の効果がより分かりやすい

## 従来の問題

型アノテーションを使うと、リテラル型の情報が失われます。

```ts
type Route = {
	path: string;
	method: 'GET' | 'POST';
};

// 型アノテーション — method が 'GET' | 'POST' に広がる
const route: Route = {
	path: '/api/posts',
	method: 'GET'
};

// route.method は 'GET' | 'POST' 型
// 'GET' であることが失われている
```

## satisfies の登場

```ts
const route = {
	path: '/api/posts',
	method: 'GET'
} satisfies Route;

// route.method は 'GET' 型（リテラル型が保持される！）
// かつ Route 型の制約も検証済み
```

`satisfies` は「この値が型 `Route` を満たすことを検証するが、推論された型をそのまま使う」という意味です。

## 実践的な活用パターン

### 1. 設定オブジェクト

```ts
type Config = {
	theme: 'light' | 'dark';
	language: string;
	features: Record<string, boolean>;
};

const config = {
	theme: 'dark',
	language: 'ja',
	features: {
		search: true,
		comments: false,
		analytics: true
	}
} satisfies Config;

// config.theme は 'dark' 型（'light' | 'dark' ではない）
// config.features.search は boolean（Record の制約も満たす）
```

### 2. ルーティング定義

```ts
type Routes = Record<string, { path: string; prerender?: boolean }>;

const routes = {
	home: { path: '/', prerender: true },
	about: { path: '/about', prerender: true },
	search: { path: '/search', prerender: false }
} satisfies Routes;

// routes.home が存在することが型で保証される
// routes.notExist はコンパイルエラー
```

型アノテーション（`const routes: Routes = ...`）だと、キー名が `string` に広がって `routes.home` の補完が効きません。

### 3. カラーパレット

```ts
type Color = `#${string}` | `rgb(${string})`;
type Palette = Record<string, Color>;

const palette = {
	primary: '#3b82f6',
	secondary: '#64748b',
	accent: 'rgb(236, 72, 153)'
} satisfies Palette;

// palette.primary は '#3b82f6' 型
// palette.unknown はエラー
```

### 4. イベントハンドラのマップ

```ts
type EventHandlers = Record<string, (...args: any[]) => void>;

const handlers = {
	click: (e: MouseEvent) => console.log(e.clientX),
	keydown: (e: KeyboardEvent) => console.log(e.key),
	submit: (data: FormData) => console.log(data)
} satisfies EventHandlers;

// handlers.click の引数が MouseEvent として推論される
```

## satisfies vs 型アノテーション

| 特徴                   | `: Type`        | `satisfies Type` |
| ---------------------- | --------------- | ---------------- |
| 型の検証               | ✅              | ✅               |
| リテラル型の保持       | ❌              | ✅               |
| キー名の補完           | ❌（Record 時） | ✅               |
| 余剰プロパティチェック | ✅              | ✅               |

## as const satisfies

`as const` と組み合わせることで、さらに厳密な型推論が得られます。

```ts
const endpoints = {
	users: '/api/users',
	posts: '/api/posts',
	tags: '/api/tags'
} as const satisfies Record<string, `/${string}`>;

// endpoints.users は '/api/users' リテラル型（readonly）
// 値が '/api/' で始まることも検証済み
```

## このブログでの活用パターン

このブログでも、サイト設定や JSON-LD スキーマの組み立てなど、いくつかの場所で `satisfies` が活躍します。

### サイト設定の凍結

`siteConfig` は全ページから参照するため、キーや値の型が緩むと参照側で面倒です。`as const satisfies` で「キー名はリテラルのまま」「URL は `https://` で始まる文字列」を同時に保証できます。

```ts
// src/lib/config.ts
type SiteConfig = {
	title: string;
	description: string;
	url: `https://${string}`;
};

export const siteConfig = {
	title: "toishi's blog",
	description: 'SvelteKit で作った技術ブログ',
	url: 'https://toishi.dev'
} as const satisfies SiteConfig;

// siteConfig.url は 'https://toishi.dev' リテラル型のまま
// 'http://' で始めるとコンパイルエラー
```

### PostMeta のデフォルト値

下書き記事のテンプレートやテスト用のフィクスチャを書くとき、`PostMeta` 型を満たしつつフィールドの値を具体的に保持しておきたい場面があります。

```ts
// src/lib/utils/posts.ts
import type { PostMeta } from './posts';

const draftFixture = {
	slug: 'draft-post',
	title: '下書き記事',
	description: '',
	date: '2026-04-30',
	tags: ['svelte'],
	draft: true
} satisfies PostMeta;

// draftFixture.draft は true 型（boolean ではない）
// テストで draft 記事のみのケースを書くときに便利
```

### JSON-LD のスキーマ定義

構造化データのキー名を厳密に保ちたいときも、`as const satisfies` が効きます。`@type` 等のフィールドを文字列リテラル型のまま渡せるので、Google の構造化データテストツール側で定義された値とのミスマッチが起きにくくなります。

```ts
type JsonLd = Record<string, unknown> & { '@context': string; '@type': string };

const websiteLd = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: siteConfig.title,
	url: siteConfig.url
} as const satisfies JsonLd;
```

## まとめ

`satisfies` は「型チェックは厳密に、推論はリッチに」を実現する演算子です。設定オブジェクトやルーティング定義など、型の制約を守りつつリテラル型の情報を保持したい場面で活躍します。

## 参照

- [TypeScript 4.9 リリースノート（satisfies 演算子）](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TypeScript 公式サイト](https://www.typescriptlang.org/)
