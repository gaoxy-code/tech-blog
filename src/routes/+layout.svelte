<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/blog/Navbar.svelte';
	import Footer from '$lib/components/blog/Footer.svelte';
	import { onNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
	{#if env.PUBLIC_CF_BEACON_TOKEN}
		<!-- Cloudflare Web Analytics -->
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={`{"token":"${env.PUBLIC_CF_BEACON_TOKEN}"}`}
		></script>
	{/if}
	<!-- ダークモード初期化（フラッシュ防止） -->
	<script>
		const theme = localStorage.getItem('theme');
		if (
			theme === 'dark' ||
			(theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		}
	</script>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1" style="padding-top: var(--navbar-height)">
		{@render children()}
	</main>
	<Footer />
</div>
