import { error } from '@sveltejs/kit';
import { getAllPosts } from '$lib/utils/posts';

export async function load({ params }) {
	const all = await getAllPosts();
	const posts = all.filter((p) => p.tags?.includes(params.tag));
	if (posts.length === 0) {
		error(404, `Tag "${params.tag}" was not found.`);
	}
	return { tag: params.tag, posts };
}
