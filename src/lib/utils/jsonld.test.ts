import { describe, it, expect } from 'vitest';
import { buildWebsiteLd, buildArticleLd, buildBreadcrumbLd } from './jsonld';
import { siteConfig } from '$lib/config';
import type { PostMeta } from './posts';

describe('buildWebsiteLd', () => {
	it('schema.org の WebSite 構造を返す', () => {
		const ld = buildWebsiteLd();
		expect(ld['@context']).toBe('https://schema.org');
		expect(ld['@type']).toBe('WebSite');
		expect(ld.name).toBe(siteConfig.title);
		expect(ld.url).toBe(siteConfig.url);
	});

	it('SearchAction の urlTemplate に検索 URL を含める', () => {
		const ld = buildWebsiteLd();
		expect(ld.potentialAction['@type']).toBe('SearchAction');
		expect(ld.potentialAction.target.urlTemplate).toBe(
			`${siteConfig.url}/search?q={search_term_string}`
		);
		expect(ld.potentialAction['query-input']).toBe('required name=search_term_string');
	});
});

describe('buildArticleLd', () => {
	const meta: PostMeta = {
		slug: 'hello-world',
		title: 'Hello World',
		description: '最初の記事',
		date: '2026-01-01',
		tags: ['svelte', 'web']
	};

	it('schema.org の BlogPosting 構造を返す', () => {
		const ld = buildArticleLd(meta, 'https://example.com/og.png');
		expect(ld['@context']).toBe('https://schema.org');
		expect(ld['@type']).toBe('BlogPosting');
		expect(ld.headline).toBe(meta.title);
		expect(ld.description).toBe(meta.description);
		expect(ld.image).toBe('https://example.com/og.png');
		expect(ld.datePublished).toBe(meta.date);
		expect(ld.dateModified).toBe(meta.date);
	});

	it('url と mainEntityOfPage を slug から構築する', () => {
		const ld = buildArticleLd(meta, 'https://example.com/og.png');
		const expected = `${siteConfig.url}/posts/${meta.slug}`;
		expect(ld.url).toBe(expected);
		expect(ld.mainEntityOfPage['@id']).toBe(expected);
	});

	it('tags をカンマ区切りで keywords にする', () => {
		const ld = buildArticleLd(meta, 'https://example.com/og.png');
		expect(ld.keywords).toBe('svelte, web');
	});

	it('tags が無い場合 keywords は undefined になる', () => {
		const noTags: PostMeta = { ...meta, tags: [] };
		const ld = buildArticleLd(noTags, 'https://example.com/og.png');
		expect(ld.keywords).toBe('');
	});
});

describe('buildBreadcrumbLd', () => {
	it('itemListElement を 1-indexed で生成する', () => {
		const ld = buildBreadcrumbLd([
			{ name: 'Home', url: 'https://example.com/' },
			{ name: 'Posts', url: 'https://example.com/posts' },
			{ name: 'Hello', url: 'https://example.com/posts/hello' }
		]);
		expect(ld['@type']).toBe('BreadcrumbList');
		expect(ld.itemListElement).toHaveLength(3);
		expect(ld.itemListElement[0].position).toBe(1);
		expect(ld.itemListElement[2].position).toBe(3);
		expect(ld.itemListElement[1]).toMatchObject({
			'@type': 'ListItem',
			name: 'Posts',
			item: 'https://example.com/posts'
		});
	});

	it('空配列の場合は空の itemListElement を返す', () => {
		const ld = buildBreadcrumbLd([]);
		expect(ld.itemListElement).toEqual([]);
	});
});
