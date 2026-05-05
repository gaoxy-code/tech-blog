<script lang="ts">
	import { page } from '$app/stores';
	import { Dialog } from 'bits-ui';
	import { Menu, ExternalLink, Rss } from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import GithubIcon from '$lib/components/icons/GithubIcon.svelte';

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/posts', label: 'Posts' },
		{ href: '/tags', label: 'Tags' },
		{ href: '/about', label: 'About' }
	];

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex h-10 w-10 items-center justify-center rounded-md border border-border text-sm hover:bg-muted md:hidden"
		aria-label="メニューを開く"
	>
		<Menu size={20} strokeWidth={1.5} />
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
		/>
		<Dialog.Content
			class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-border bg-background shadow-lg data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left"
		>
			<div class="flex items-center justify-between border-b border-border px-5 py-3">
				<span class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
					メニュー
				</span>
			</div>

			<nav class="px-3 py-2">
				<ul>
					{#each navLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								onclick={() => (open = false)}
								class="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted {$page
									.url.pathname === link.href
									? 'font-bold text-foreground'
									: 'text-muted-foreground'}"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="mt-auto space-y-3 border-t border-border px-5 py-4">
				<ThemeToggle variant="inline" />

				<a
					href="https://github.com/gaoxy-code"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
				>
					<span class="flex items-center gap-3">
						<GithubIcon size={18} />
						<span>GitHub</span>
					</span>
					<ExternalLink size={14} strokeWidth={1.5} class="text-muted-foreground" />
				</a>
				<a
					href="/rss.xml"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
				>
					<span class="flex items-center gap-3">
						<Rss size={18} />
						<span>RSS Feed</span>
					</span>
					<ExternalLink size={14} strokeWidth={1.5} class="text-muted-foreground" />
				</a>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
