import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { PostMeta } from '$lib/utils/posts';
import { getAllPosts } from '$lib/utils/posts';

export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	return posts.map((p) => ({ slug: p.slug }));
}

export async function load({ params }) {
	const modules = import.meta.glob('/src/posts/*.md');
	const rawModules = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default' });
	const path = `/src/posts/${params.slug}.md`;
	const module = modules[path];
	if (!module) throw error(404, 'Post not found');
	const post = (await module()) as { default: Component; metadata?: PostMeta };
	if (!post.metadata) throw error(404, 'Post not found');

	// 生Markdownを取得
	const rawContent = rawModules[path] ? ((await rawModules[path]()) as string) : '';

	// 読了時間（分）を計算（約200語/分で換算）
	const wordCount = rawContent.trim().split(/\s+/).length;
	const readingMinutes = Math.max(1, Math.round(wordCount / 200));

	// 関連記事を取得（同じタグを持つ記事、最大3件）
	const allPosts = await getAllPosts();
	const currentTags = new Set(post.metadata.tags ?? []);
	const relatedPosts = allPosts
		.filter((p) => p.slug !== params.slug && p.tags?.some((t) => currentTags.has(t)))
		.slice(0, 3);

	// 前後の記事を取得（allPostsは日付降順）
	const currentIndex = allPosts.findIndex((p) => p.slug === params.slug);
	const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
	const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

	return {
		content: post.default,
		meta: { ...post.metadata, readingTime: readingMinutes },
		rawMarkdown: rawContent,
		relatedPosts,
		prevPost,
		nextPost
	};
}
