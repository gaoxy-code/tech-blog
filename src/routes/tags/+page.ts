import { getAllTags } from '$lib/utils/posts';

export const prerender = true;

export async function load() {
	const tagMap = await getAllTags();
	const tags = Array.from(tagMap.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([name, count]) => ({ name, count }));
	return { tags };
}
