---
title: SvelteKit で OGP 画像を自動生成する — satori + resvg-js でプリレンダリング
description: satori と resvg-js を使って、SvelteKit のビルド時に記事ごとの OGP 画像を静的生成する方法を解説します。
date: 2026-04-11
tags:
  - svelte-kit
  - satori
  - cloudflare
---

SNS でシェアされたときに表示される OGP 画像（`og:image`）は、クリック率に影響する重要な要素です。記事ごとに専用の画像を用意するのが理想ですが、手作業では限界があります。

SvelteKit のプリレンダリングと [satori](https://github.com/vercel/satori) を組み合わせると、ビルド時に各記事の OGP 画像を自動生成できます。

## 前提

- SvelteKit プロジェクト（本記事は `adapter-cloudflare` を使った構成を想定）
- `prerender = true` で静的出力する設計になっていること
- Node.js v22 以上（`@resvg/resvg-js` のネイティブモジュールが必要）
- 日本語を表示する場合は Noto Sans JP などの TTF フォントファイルを用意

## 使うパッケージ

- **satori**: HTML/CSS（Flexbox）の記述から SVG を生成するライブラリ（Vercel 製）
- **@resvg/resvg-js**: SVG → PNG 変換

```bash
pnpm add -D satori @resvg/resvg-js
```

日本語テキストをレンダリングするには、フォントファイルが必要です。[Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+JP) から Noto Sans JP の TTF をダウンロードして `src/lib/server/fonts/` に置きます。

## 画像生成関数

`src/lib/server/og.ts` に生成ロジックをまとめます。

```ts
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontRegular = readFileSync(resolve('src/lib/server/fonts/NotoSansJP-Regular.ttf'));
const fontBold = readFileSync(resolve('src/lib/server/fonts/NotoSansJP-Bold.ttf'));

export async function generateOgImage(options: {
	title: string;
	date?: string;
	slug?: string;
}): Promise<Buffer> {
	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: '#0f0f23',
					padding: '60px 72px',
					fontFamily: 'Noto Sans JP'
				},
				children: [
					{
						type: 'h1',
						props: {
							style: {
								fontSize: '52px',
								fontWeight: 700,
								color: '#f1f5f9',
								margin: 0
							},
							children: options.title
						}
					}
				]
			}
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{ name: 'Noto Sans JP', data: fontRegular, weight: 400, style: 'normal' },
				{ name: 'Noto Sans JP', data: fontBold, weight: 700, style: 'normal' }
			]
		}
	);

	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
	return resvg.render().asPng();
}
```

### satori のレイアウトルール

satori は **Flexbox のみ** をサポートします。`display: grid` は使えません。また、`children` に文字列を直接渡す代わりに、テキストノードはプリミティブ値（文字列）で渡します。

```ts
// ✅ 正しい書き方
{ type: 'span', props: { children: 'テキスト' } }

// ❌ 動かない
{ type: 'span', props: { children: <span>テキスト</span> } }
```

## ルートを作る

### 記事ごとの OGP 画像

`src/routes/posts/[slug]/og.png/+server.ts` を作成します。

```ts
import { generateOgImage } from '$lib/server/og';
import { getAllPosts } from '$lib/utils/posts';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	return posts.map((p) => ({ slug: p.slug }));
}

export const GET: RequestHandler = async ({ params }) => {
	const posts = await getAllPosts();
	const post = posts.find((p) => p.slug === params.slug);
	if (!post) throw error(404);

	const png = await generateOgImage({
		title: post.title,
		date: post.date,
		slug: post.slug
	});

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
```

`entries()` を定義することで、`prerender = true` のときにすべての記事スラッグに対して静的ファイルが生成されます。

### サイト共通の OGP 画像

`src/routes/og.png/+server.ts` でトップページ用の画像も生成できます。

```ts
import { generateOgImage } from '$lib/server/og';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const png = await generateOgImage({ title: "toishi's blog" });
	return new Response(png, {
		headers: { 'Content-Type': 'image/png' }
	});
};
```

## `<meta>` タグを設定する

生成した画像を `og:image` として使うには、各ページの `<svelte:head>` に記述します。

`src/lib/layouts/post.svelte`（記事レイアウト）の場合:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config';
	let { title, date, slug, children } = $props();
	const ogImageUrl = `${siteConfig.url}/posts/${slug}/og.png`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:image" content={ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
```

## 動作確認

OGP 画像は開発サーバーでは生成されません。`pnpm build` → `pnpm preview` で確認します。

```bash
pnpm build
pnpm preview
# http://localhost:4173/posts/your-slug/og.png でアクセスできる
```

## 注意点

### ファイルパスの解決

`readFileSync(resolve('src/lib/server/fonts/...'))` は、**Node.js の実行ディレクトリ（プロジェクトルート）からの相対パス** で解決されます。Cloudflare Pages のビルド環境でも動作しますが、実行コンテキストが変わる場合は `import.meta.url` を使った方が確実です。

### フォントサイズとテキストの折り返し

satori はデフォルトではテキストの折り返しが起きません。長いタイトルに対応するには、`fontSize` を文字数で動的に調整するか、`maxWidth` と `flexWrap: 'wrap'` を設定します。

```ts
fontSize: title.length > 30 ? '44px' : '52px';
```

### Cloudflare Pages での Node.js 互換性

`readFileSync` など Node.js の API を使うには、`wrangler.jsonc` に以下が必要です。

```jsonc
{
	"compatibility_flags": ["nodejs_als"]
}
```

## まとめ

- satori で HTML/CSS（Flexbox）から SVG を生成し、resvg-js で PNG に変換
- `+server.ts` + `prerender = true` + `entries()` でビルド時に全記事分を静的生成
- 日本語を含む場合は TTF フォントの明示的な指定が必要
- 確認は `pnpm build` + `pnpm preview` で行う

## 参照

- [satori GitHub](https://github.com/vercel/satori)
- [resvg-js GitHub](https://github.com/yisibl/resvg-js)
- [SvelteKit +server.ts ドキュメント](https://svelte.dev/docs/kit/routing#server)
