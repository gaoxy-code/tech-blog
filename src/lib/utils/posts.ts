import viewCounts from '$lib/data/views.json';

export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	draft?: boolean;
	cover?: string;
	views?: number;
	readingTime?: number;
};

export async function getAllPosts(): Promise<PostMeta[]> {
	const modules = import.meta.glob('/src/posts/*.md', { eager: true });
	const posts: PostMeta[] = [];

	for (const [path, mod] of Object.entries(modules)) {
		const m = mod as { metadata?: Omit<PostMeta, 'slug' | 'views'> };
		if (!m.metadata) continue;
		const slug = path.split('/').pop()!.replace('.md', '');
		if (m.metadata.draft) continue;
		const counts = viewCounts as Record<string, number>;
		posts.push({ slug, ...m.metadata, views: counts[slug] ?? 0 });
	}

	return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPopularPosts(limit = 5): Promise<PostMeta[]> {
	const posts = await getAllPosts();
	const withViews = posts.filter((p) => (p.views ?? 0) > 0);
	if (withViews.length === 0) return posts.slice(0, limit);
	return [...withViews].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, limit);
}

export async function getAllTags(): Promise<Map<string, number>> {
	const posts = await getAllPosts();
	const tagMap = new Map<string, number>();
	for (const p of posts) {
		for (const t of p.tags ?? []) {
			tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
		}
	}
	return tagMap;
}
