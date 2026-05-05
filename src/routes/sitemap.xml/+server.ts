import { siteConfig } from '$lib/config';
import { getAllPosts, getAllTags } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getAllPosts();
	const tags = await getAllTags();
	const today = new Date().toISOString().split('T')[0];

	const staticPaths = [
		{ loc: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
		{ loc: '/posts', priority: '0.9', changefreq: 'daily', lastmod: today },
		{ loc: '/tags', priority: '0.7', changefreq: 'weekly', lastmod: today },
		{ loc: '/about', priority: '0.5', changefreq: 'monthly', lastmod: today }
	];

	const postPaths = posts.map((p) => ({
		loc: `/posts/${p.slug}`,
		priority: '0.8',
		changefreq: 'monthly',
		lastmod: new Date(p.date).toISOString().split('T')[0]
	}));

	const tagPaths = Array.from(tags.keys()).map((tag) => ({
		loc: `/tags/${encodeURIComponent(tag)}`,
		priority: '0.6',
		changefreq: 'weekly',
		lastmod: today
	}));

	const urls = [...staticPaths, ...postPaths, ...tagPaths]
		.map(
			(u) => `
	<url>
		<loc>${siteConfig.url}${u.loc}</loc>
		<lastmod>${u.lastmod}</lastmod>
		<changefreq>${u.changefreq}</changefreq>
		<priority>${u.priority}</priority>
	</url>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
