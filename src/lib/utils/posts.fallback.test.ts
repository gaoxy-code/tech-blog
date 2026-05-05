import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/data/views.json', () => ({ default: {} }));

import { getAllPosts, getPopularPosts } from './posts';

describe('getPopularPosts (views.json が空のとき)', () => {
	it('views > 0 が 1 件も無い場合は先頭から limit 件をフォールバックで返す', async () => {
		const all = await getAllPosts();
		const popular = await getPopularPosts(3);

		expect(all.every((p) => p.views === 0)).toBe(true);
		expect(popular.length).toBe(Math.min(3, all.length));
		expect(popular.map((p) => p.slug)).toEqual(all.slice(0, 3).map((p) => p.slug));
	});

	it('limit が記事数より大きい場合は全件返す', async () => {
		const all = await getAllPosts();
		const popular = await getPopularPosts(all.length + 10);

		expect(popular.length).toBe(all.length);
	});
});
