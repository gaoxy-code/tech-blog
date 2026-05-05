import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
	it('複数のクラス名を結合する', () => {
		expect(cn('a', 'b', 'c')).toBe('a b c');
	});

	it('falsy な値を除外する', () => {
		expect(cn('a', false, undefined, null, '', 'b')).toBe('a b');
	});

	it('オブジェクト形式の条件付きクラスを評価する', () => {
		expect(cn('base', { active: true, hidden: false })).toBe('base active');
	});

	it('競合する Tailwind クラスは後勝ちでマージする', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4');
		expect(cn('text-sm text-lg')).toBe('text-lg');
	});

	it('配列入力を許容する', () => {
		expect(cn(['a', 'b'], 'c')).toBe('a b c');
	});
});
