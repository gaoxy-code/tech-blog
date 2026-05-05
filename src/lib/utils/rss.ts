export function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function stripFrontmatter(md: string): string {
	if (!md.startsWith('---')) return md;
	const end = md.indexOf('\n---', 3);
	if (end === -1) return md;
	return md.slice(end + 4).replace(/^\s*\n/, '');
}

export function absolutizeUrls(html: string, baseUrl: string): string {
	return html
		.replace(/(href|src)="\/([^"]*)"/g, (_m, attr, path) => `${attr}="${baseUrl}/${path}"`)
		.replace(/(href|src)='\/([^']*)'/g, (_m, attr, path) => `${attr}="${baseUrl}/${path}"`);
}
