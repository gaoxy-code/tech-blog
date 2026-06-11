import { getAllPosts, getAllTags, getPopularPosts } from '$lib/utils/posts';

export const prerender = true;

export async function load() {
	const [posts, popular, tagMap] = await Promise.all([
		getAllPosts(),
		getPopularPosts(3),
		getAllTags()
	]);
	const tags = [...tagMap.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 40);
	return {
		latest: posts.slice(0, 3),
		popular,
		tags
	};
}
