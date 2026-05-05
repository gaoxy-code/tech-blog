import { describe, it, expect } from 'vitest';
import { highlighter } from './shiki-highlighter.js';

describe('highlighter', () => {
	it('shiki が生成する pre/code を返す', async () => {
		const html = await highlighter('const a = 1;', 'typescript');
		expect(html).toMatch(/<pre[^>]*class="[^"]*shiki[^"]*"/);
		expect(html).toContain('<code');
	});

	it('tabindex="0" を取り除く', async () => {
		const html = await highlighter('const a = 1;', 'typescript');
		expect(html).not.toContain('tabindex="0"');
	});

	it('波括弧を HTML エンティティにエスケープする (mdsvex の {} 評価対策)', async () => {
		const html = await highlighter('const a = { b: 1 };', 'typescript');
		expect(html).not.toMatch(/[{}]/);
		expect(html).toContain('&#123;');
		expect(html).toContain('&#125;');
	});

	it('lang が未指定の場合は text としてレンダリングする', async () => {
		const html = await highlighter('hello world', undefined);
		expect(html).toContain('hello world');
		expect(html).toMatch(/<pre/);
	});

	it('未対応言語は shiki がエラーになるが、登録済み言語は正常処理', async () => {
		const html = await highlighter('print("hi")', 'python');
		expect(html).toContain('print');
	});
});
