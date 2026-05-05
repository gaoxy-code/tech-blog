import { describe, it, expect } from 'vitest';
import { getAllPosts, getPopularPosts, getAllTags } from './posts';

describe('getAllPosts', () => {
	it('1件以上の記事を返す', async () => {
		const posts = await getAllPosts();
		expect(posts.length).toBeGreaterThan(0);
	});

	it('draft の記事は含まない', async () => {
		const posts = await getAllPosts();
		expect(posts.every((p) => p.draft !== true)).toBe(true);
	});

	it('日付の降順でソートされている', async () => {
		const posts = await getAllPosts();
		for (let i = 1; i < posts.length; i++) {
			expect(+new Date(posts[i - 1].date)).toBeGreaterThanOrEqual(+new Date(posts[i].date));
		}
	});

	it('全件に slug と必須メタが付与される', async () => {
		const posts = await getAllPosts();
		for (const p of posts) {
			expect(typeof p.slug).toBe('string');
			expect(p.slug.length).toBeGreaterThan(0);
			expect(typeof p.title).toBe('string');
			expect(typeof p.date).toBe('string');
		}
	});

	it('views フィールドが number として付与される', async () => {
		const posts = await getAllPosts();
		for (const p of posts) {
			expect(typeof p.views).toBe('number');
			expect(p.views).toBeGreaterThanOrEqual(0);
		}
	});
});

describe('getPopularPosts', () => {
	it('limit 件数を超えない', async () => {
		const popular = await getPopularPosts(3);
		expect(popular.length).toBeLessThanOrEqual(3);
	});

	it('views を持つ記事は views の降順で返す', async () => {
		const popular = await getPopularPosts(10);
		const withViews = popular.filter((p) => (p.views ?? 0) > 0);
		for (let i = 1; i < withViews.length; i++) {
			expect(withViews[i - 1].views ?? 0).toBeGreaterThanOrEqual(withViews[i].views ?? 0);
		}
	});

	it('views > 0 の記事が無い場合は先頭から limit 件返すフォールバック', async () => {
		const all = await getAllPosts();
		const popular = await getPopularPosts(5);
		const allHaveZeroViews = all.every((p) => (p.views ?? 0) === 0);
		if (allHaveZeroViews) {
			expect(popular.length).toBe(Math.min(5, all.length));
			expect(popular.map((p) => p.slug)).toEqual(all.slice(0, 5).map((p) => p.slug));
		} else {
			expect(popular.every((p) => (p.views ?? 0) > 0)).toBe(true);
		}
	});

	it('デフォルト limit は 5', async () => {
		const popular = await getPopularPosts();
		expect(popular.length).toBeLessThanOrEqual(5);
	});
});

describe('getAllTags', () => {
	it('Map<string, number> を返す', async () => {
		const tags = await getAllTags();
		expect(tags).toBeInstanceOf(Map);
	});

	it('集計件数の合計は全記事のタグ総数と一致する', async () => {
		const posts = await getAllPosts();
		const tags = await getAllTags();
		const expected = posts.reduce((sum, p) => sum + (p.tags?.length ?? 0), 0);
		const actual = [...tags.values()].reduce((sum, c) => sum + c, 0);
		expect(actual).toBe(expected);
	});

	it('各タグのカウントは 1 以上', async () => {
		const tags = await getAllTags();
		for (const [, count] of tags) {
			expect(count).toBeGreaterThanOrEqual(1);
		}
	});
});
