<script lang="ts">
	import { page } from '$app/stores';
	import SearchDialog from './SearchDialog.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import MobileMenu from './MobileMenu.svelte';
	import GithubIcon from '$lib/components/icons/GithubIcon.svelte';
	import { Rss } from '@lucide/svelte';

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/posts', label: 'Posts' },
		{ href: '/tags', label: 'Tags' },
		{ href: '/about', label: 'About' }
	];
</script>

<header class="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
		<MobileMenu />
		<a href="/" class="text-lg font-bold">toishi.dev</a>

		<nav class="hidden items-center gap-4 text-sm md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="transition-colors hover:text-foreground {$page.url.pathname === link.href
						? 'font-bold text-foreground'
						: 'text-muted-foreground'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2 sm:gap-3">
			<SearchDialog />

			<div class="hidden items-center gap-3 md:flex">
				<ThemeToggle />

				<a
					href="https://github.com/gaoxy-code"
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
					aria-label="GitHub"
				>
					<GithubIcon size={18} />
				</a>
				<a
					href="/rss.xml"
					target="_blank"
					class="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
					aria-label="RSS Feed"
				>
					<Rss size={14} />
				</a>
			</div>
		</div>
	</div>
</header>
