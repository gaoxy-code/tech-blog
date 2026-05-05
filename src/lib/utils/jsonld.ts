import { siteConfig } from '$lib/config';
import type { PostMeta } from './posts';

export function buildWebsiteLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteConfig.title,
		description: siteConfig.description,
		url: siteConfig.url,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};
}

export function buildArticleLd(meta: PostMeta, imageUrl: string) {
	const url = `${siteConfig.url}/posts/${meta.slug}`;
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: meta.title,
		description: meta.description,
		image: imageUrl,
		datePublished: meta.date,
		dateModified: meta.date,
		author: {
			'@type': 'Person',
			name: 'toishi'
		},
		publisher: {
			'@type': 'Organization',
			name: siteConfig.title,
			url: siteConfig.url
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url
		},
		url,
		keywords: meta.tags?.join(', ')
	};
}

export function buildBreadcrumbLd(items: Array<{ name: string; url: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: item.url
		}))
	};
}
