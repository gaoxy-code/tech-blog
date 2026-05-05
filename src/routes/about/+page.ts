import { getAllPosts, getAllTags } from '$lib/utils/posts';
import viewCounts from '$lib/data/views.json';

export const prerender = true;

export async function load() {
	const posts = await getAllPosts();
	const tags = await getAllTags();
	const totalViews = Object.values(viewCounts as Record<string, number>).reduce(
		(sum, v) => sum + v,
		0
	);
	return {
		postCount: posts.length,
		tagCount: tags.size,
		totalViews
	};
}
