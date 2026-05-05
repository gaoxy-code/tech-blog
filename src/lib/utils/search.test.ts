import { describe, it, expect } from 'vitest';
import { cleanSearchUrl } from './search';

describe('cleanSearchUrl', () => {
	it('末尾の .html を取り除く', () => {
		expect(cleanSearchUrl('/posts/foo.html')).toBe('/posts/foo');
	});

	it('末尾の /index を取り除く', () => {
		expect(cleanSearchUrl('/posts/index')).toBe('/posts');
	});

	it('.html と /index の両方を末尾から取り除く', () => {
		expect(cleanSearchUrl('/posts/index.html')).toBe('/posts');
	});

	it('該当しない URL はそのまま返す', () => {
		expect(cleanSearchUrl('/posts/foo')).toBe('/posts/foo');
		expect(cleanSearchUrl('/')).toBe('/');
	});

	it('途中に index を含む場合は末尾でないので変更しない', () => {
		expect(cleanSearchUrl('/index/foo')).toBe('/index/foo');
	});
});
