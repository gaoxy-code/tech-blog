<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config';

	interface Props {
		title?: string;
		description?: string;
		url?: string;
		image?: string;
		type?: 'website' | 'article';
		publishedTime?: string;
		tags?: string[];
		noindex?: boolean;
	}

	let {
		title,
		description = siteConfig.description,
		url,
		image,
		type = 'website',
		publishedTime,
		tags = [],
		noindex = false
	}: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${siteConfig.title}` : siteConfig.title);
	const canonical = $derived(url ?? `${siteConfig.url}${$page.url.pathname}`);
	const ogImage = $derived(image ?? `${siteConfig.url}/og.png`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<meta property="og:site_name" content={siteConfig.title} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title ?? siteConfig.title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content="ja_JP" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title ?? siteConfig.title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
		{#each tags as tag (tag)}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
</svelte:head>
