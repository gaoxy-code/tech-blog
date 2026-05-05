import { siteConfig } from '$lib/config';
import { getAllPosts } from '$lib/utils/posts';
import { escapeXml, stripFrontmatter, absolutizeUrls } from '$lib/utils/rss';
import type { RequestHandler } from './$types';
import { marked } from 'marked';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getAllPosts();
	const rawModules = import.meta.glob('/src/posts/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	const items = await Promise.all(
		posts.map(async (post) => {
			const raw = rawModules[`/src/posts/${post.slug}.md`] ?? '';
			const md = stripFrontmatter(raw);
			const html = absolutizeUrls(await marked.parse(md), siteConfig.url);
			const url = `${siteConfig.url}/posts/${post.slug}`;
			return `
		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>
			<description>${escapeXml(post.description)}</description>
			${post.tags?.map((t) => `<category>${escapeXml(t)}</category>`).join('') ?? ''}
			<content:encoded><![CDATA[${html}]]></content:encoded>
		</item>`;
		})
	);

	const lastBuildDate =
		posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(siteConfig.title)}</title>
		<link>${siteConfig.url}</link>
		<description>${escapeXml(siteConfig.description)}</description>
		<language>ja</language>
		<lastBuildDate>${lastBuildDate}</lastBuildDate>
		<atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
		${items.join('')}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
