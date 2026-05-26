import { getAllPosts, getPopularPosts } from '$lib/utils/posts';

export const prerender = true;

export async function load() {
	const [posts, popular] = await Promise.all([getAllPosts(), getPopularPosts(3)]);
	return {
		latest: posts.slice(0, 3),
		popular
	};
}
