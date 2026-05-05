import { createHighlighter } from 'shiki';

const highlighterPromise = createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: [
		'javascript',
		'typescript',
		'html',
		'css',
		'json',
		'jsonc',
		'markdown',
		'bash',
		'shell',
		'yaml',
		'svelte',
		'jsx',
		'tsx',
		'python',
		'go',
		'rust',
		'sql',
		'diff',
		'toml'
	]
});

export async function highlighter(code: string, lang: string | undefined) {
	const shiki = await highlighterPromise;

	const html = shiki.codeToHtml(code, {
		lang: lang || 'text',
		themes: {
			light: 'github-light',
			dark: 'github-dark'
		},
		defaultColor: false
	});

	return html
		.replace(/ tabindex="0"/, '')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');
}
