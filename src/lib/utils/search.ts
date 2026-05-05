export function cleanSearchUrl(url: string): string {
	return url.replace(/\.html$/, '').replace(/\/index$/, '');
}
