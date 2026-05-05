import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { highlighter } from './src/lib/shiki-highlighter.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries and mdsvex files. Can be removed in svelte 6.
		runes: ({ filename }) => {
			const parts = filename.split(/[/\\]/);
			if (parts.includes('node_modules')) return undefined;
			if (filename.endsWith('.md') || filename.endsWith('.svx')) return undefined;
			return true;
		}
	},
	extensions: ['.svelte', '.svx', '.md'],
	kit: {
		adapter: adapter({
			routes: {
				exclude: ['<build>', '<prerendered>', '<files>', '/pagefind/*']
			}
		}),
		alias: {
			'@/*': './src/lib/*'
		},
		prerender: {
			handleHttpError: 'warn'
		}
	},
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx', '.md'],
			rehypePlugins: [rehypeSlug],
			highlight: {
				highlighter
			},
			layout: {
				_: resolve(__dirname, 'src/lib/layouts/post.svelte')
			}
		})
	]
};

export default config;
