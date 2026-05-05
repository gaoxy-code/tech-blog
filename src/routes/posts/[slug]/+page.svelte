<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';
	import { buildArticleLd, buildBreadcrumbLd } from '$lib/utils/jsonld';

	let { data } = $props();
	const Content = $derived(data.content);
	const ogImageUrl = $derived(`${siteConfig.url}/posts/${$page.params.slug}/og.png`);

	const slug = $derived($page.params.slug as string);
	const articleLd = $derived(buildArticleLd({ ...data.meta, slug }, ogImageUrl));
	const breadcrumbLd = $derived(
		buildBreadcrumbLd([
			{ name: 'Home', url: siteConfig.url },
			{ name: 'Posts', url: `${siteConfig.url}/posts` },
			{ name: data.meta.title, url: `${siteConfig.url}/posts/${slug}` }
		])
	);
</script>

<Seo
	title={data.meta.title}
	description={data.meta.description}
	image={ogImageUrl}
	type="article"
	publishedTime={data.meta.date}
	tags={data.meta.tags}
/>

<svelte:head>
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify(articleLd)}</` + `script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</` + `script>`}
</svelte:head>

<Content />
