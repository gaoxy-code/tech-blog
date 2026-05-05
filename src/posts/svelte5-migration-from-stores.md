---
title: Svelte 4 の Store から Svelte 5 Runes への移行ガイド
description: Svelte 4 の Store（writable / readable / derived）を Svelte 5 の Runes に書き換える方法を、具体例とともに解説します。
date: 2026-03-25
tags:
  - svelte
  - svelte5
---

Svelte 5 では Runes の登場により、Store を使わなくてもリアクティブな状態管理が可能になりました。既存の Store ベースのコードをどう移行するか、パターン別に見ていきます。

## 前提

- 移行元の Svelte 4 プロジェクト（`writable` / `derived` / `readable` を使ったコードがあること）
- Svelte 5 にバージョンアップ済み、または並行で動作確認できる環境
- Svelte 5 は Svelte 4 の Store と後方互換性があるため、段階的な移行が可能

## writable → $state

最も基本的な移行パターンです。

### Before（Svelte 4）

```ts
// stores.ts
import { writable } from 'svelte/store';
export const count = writable(0);
```

```svelte
<!-- Component.svelte -->
<script>
	import { count } from './stores';
</script>

<button on:click={() => $count++}>{$count}</button>
```

### After（Svelte 5）

コンポーネント内で完結する状態なら、そのまま `$state` に置き換えます。

```svelte
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>
```

## コンポーネント間で共有する状態

複数コンポーネントで状態を共有していた場合、`.svelte.ts` ファイルで Runes を使えます。

```ts
// counter.svelte.ts
let count = $state(0);

export function getCount() {
	return count;
}

export function increment() {
	count++;
}

export function reset() {
	count = 0;
}
```

```svelte
<script lang="ts">
	import { getCount, increment } from './counter.svelte.ts';
</script>

<button onclick={increment}>{getCount()}</button>
```

ポイントは **ファイル拡張子が `.svelte.ts`** であること。これにより、ファイルのトップレベルで `$state` などの Runes が使えます。

## derived → $derived

### Before

```ts
import { writable, derived } from 'svelte/store';

const items = writable([1, 2, 3]);
const total = derived(items, ($items) => $items.reduce((a, b) => a + b, 0));
```

### After

```ts
// cart.svelte.ts
let items = $state([1, 2, 3]);
let total = $derived(items.reduce((a, b) => a + b, 0));
```

`$derived` は依存関係を自動追跡するので、明示的に依存元を指定する必要がありません。

## readable → $state（読み取り専用の公開）

外部に読み取り専用で公開したい場合は、getter 関数を使います。

### Before

```ts
import { readable } from 'svelte/store';

export const time = readable(new Date(), (set) => {
	const interval = setInterval(() => set(new Date()), 1000);
	return () => clearInterval(interval);
});
```

### After

```ts
// time.svelte.ts
let time = $state(new Date());

const interval = setInterval(() => {
	time = new Date();
}, 1000);

// getter で読み取り専用として公開
export function getTime() {
	return time;
}
```

## クラスベースのアプローチ

より構造化したい場合は、クラスで状態をカプセル化できます。

```ts
// todo-store.svelte.ts
export class TodoStore {
	items = $state<{ text: string; done: boolean }[]>([]);

	get remaining() {
		return this.items.filter((item) => !item.done).length;
	}

	get completed() {
		return this.items.filter((item) => item.done).length;
	}

	add(text: string) {
		this.items.push({ text, done: false });
	}

	toggle(index: number) {
		this.items[index].done = !this.items[index].done;
	}

	remove(index: number) {
		this.items.splice(index, 1);
	}
}
```

```svelte
<script lang="ts">
	import { TodoStore } from './todo-store.svelte.ts';

	const todos = new TodoStore();
</script>

<p>残り {todos.remaining} 件</p>
{#each todos.items as todo, i}
	<label>
		<input type="checkbox" checked={todo.done} onchange={() => todos.toggle(i)} />
		{todo.text}
	</label>
{/each}
```

## まとめ

1. **段階的に移行できる** — Svelte 5 は Store との後方互換性を持っています。一気に書き換える必要はありません
2. **`.svelte.ts` を忘れずに** — Runes をモジュールのトップレベルで使うには `.svelte.ts` 拡張子が必要です
3. **`$:` ラベルは `$derived` / `$effect` に** — 値の計算は `$derived`、副作用は `$effect` に分離しましょう
4. **`on:click` → `onclick`** — イベントハンドラの書き方も変わっています

Store はまだ使えますが、新しいコードでは Runes を使うことで、よりシンプルで直感的な状態管理ができます。

## 参照

- [Svelte 5 移行ガイド](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte Runes とは](https://svelte.dev/docs/svelte/what-are-runes)
