import { error } from '@sveltejs/kit';
import { generateOgImage } from '$lib/server/og';
import { getAllPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	return posts.map((p) => ({ slug: p.slug }));
}

export const GET: RequestHandler = async ({ params }) => {
	const posts = await getAllPosts();
	const post = posts.find((p) => p.slug === params.slug);
	if (!post) throw error(404, 'Post not found');

	const png = await generateOgImage({
		title: post.title,
		date: post.date,
		slug: post.slug
	});

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
