import { describe, it, expect } from 'vitest';
import { escapeXml, stripFrontmatter, absolutizeUrls } from './rss';

describe('escapeXml', () => {
	it('XML 特殊文字 5 つをすべてエスケープする', () => {
		expect(escapeXml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;');
	});

	it('& を最初に置換するため &lt; が二重エスケープされない', () => {
		expect(escapeXml('<')).toBe('&lt;');
		// "&" → "&amp;" の後に "<" → "&lt;" が走っても "&lt;" 内の "&" はそのまま
		expect(escapeXml('&<')).toBe('&amp;&lt;');
	});

	it('特殊文字を含まない文字列はそのまま返す', () => {
		expect(escapeXml('hello world 日本語')).toBe('hello world 日本語');
	});

	it('空文字列を許容する', () => {
		expect(escapeXml('')).toBe('');
	});
});

describe('stripFrontmatter', () => {
	it('--- で始まらない場合はそのまま返す', () => {
		expect(stripFrontmatter('# Hello')).toBe('# Hello');
	});

	it('frontmatter ブロックを取り除く', () => {
		const input = `---
title: foo
date: 2026-01-01
---

# Hello`;
		expect(stripFrontmatter(input)).toBe('# Hello');
	});

	it('閉じる --- が無い場合はそのまま返す', () => {
		expect(stripFrontmatter('---\ntitle: foo')).toBe('---\ntitle: foo');
	});

	it('frontmatter 後の本文中の --- は影響しない', () => {
		const input = `---
title: foo
---
本文1
---
本文2`;
		expect(stripFrontmatter(input)).toBe('本文1\n---\n本文2');
	});
});

describe('absolutizeUrls', () => {
	const base = 'https://example.com';

	it('href のルート相対パスを絶対 URL に変換する', () => {
		expect(absolutizeUrls('<a href="/posts/foo">x</a>', base)).toBe(
			'<a href="https://example.com/posts/foo">x</a>'
		);
	});

	it('src のルート相対パスを絶対 URL に変換する', () => {
		expect(absolutizeUrls('<img src="/images/a.png">', base)).toBe(
			'<img src="https://example.com/images/a.png">'
		);
	});

	it('シングルクオートも変換対象', () => {
		expect(absolutizeUrls(`<a href='/posts/foo'>x</a>`, base)).toBe(
			'<a href="https://example.com/posts/foo">x</a>'
		);
	});

	it('絶対 URL は変更しない', () => {
		const html = '<a href="https://other.example/x">x</a>';
		expect(absolutizeUrls(html, base)).toBe(html);
	});

	it('スラッシュで始まらない相対 URL は変更しない', () => {
		const html = '<a href="posts/foo">x</a>';
		expect(absolutizeUrls(html, base)).toBe(html);
	});

	it('複数箇所をまとめて変換する', () => {
		const html = '<img src="/a.png"><a href="/b">B</a>';
		expect(absolutizeUrls(html, base)).toBe(
			'<img src="https://example.com/a.png"><a href="https://example.com/b">B</a>'
		);
	});
});
