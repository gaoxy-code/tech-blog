<script lang="ts">
	import { page } from '$app/stores';
	import { Share2, Link as LinkIcon } from '@lucide/svelte';

	interface Props {
		title: string;
	}

	let { title }: Props = $props();

	let urlCopied = $state(false);
	let shareOpen = $state(false);

	async function copyUrl() {
		await navigator.clipboard.writeText($page.url.href);
		urlCopied = true;
		shareOpen = false;
		setTimeout(() => (urlCopied = false), 2000);
	}

	function shareToX() {
		const url = encodeURIComponent($page.url.href);
		const text = encodeURIComponent(title);
		window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank');
		shareOpen = false;
	}

	function shareToHatena() {
		window.open(`https://b.hatena.ne.jp/entry/s/${$page.url.host}${$page.url.pathname}`, '_blank');
		shareOpen = false;
	}

	function toggleShare() {
		shareOpen = !shareOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		if (shareOpen) {
			const target = event.target as HTMLElement;
			if (!target.closest('[data-share-menu]')) {
				shareOpen = false;
			}
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative" data-share-menu>
	<button
		onclick={toggleShare}
		class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
	>
		<Share2 size={16} />
		<span>Share</span>
	</button>
	{#if shareOpen}
		<div
			class="absolute right-0 bottom-full z-10 mb-2 w-48 rounded-lg border border-border bg-popover p-1 shadow-md"
		>
			<button
				onclick={copyUrl}
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
			>
				<LinkIcon size={16} />
				<span>{urlCopied ? 'コピーしました' : 'URLをコピー'}</span>
			</button>
			<button
				onclick={shareToX}
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
			>
				<svg viewBox="0 0 24 24" class="size-4 fill-current"
					><path
						d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
					/></svg
				>
				<span>Xでシェア</span>
			</button>
			<button
				onclick={shareToHatena}
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
			>
				<svg viewBox="0 0 24 24" class="size-4 fill-current"
					><path
						d="M20.47 2H3.53A1.45 1.45 0 0 0 2 3.47v17.06A1.45 1.45 0 0 0 3.47 22h16.94c.82 0 1.53-.64 1.53-1.47V3.47C22 2.64 21.33 2 20.47 2zM8.09 17.6c0 .55-.46 1-1.02 1H5.63c-.56 0-1.02-.45-1.02-1v-1.4c0-.56.46-1.02 1.02-1.02h1.44c.56 0 1.02.46 1.02 1.02v1.4zm0-5.17c0 .56-.46 1.02-1.02 1.02H5.63c-.56 0-1.02-.46-1.02-1.02V6.4c0-.56.46-1.02 1.02-1.02h1.44c.56 0 1.02.46 1.02 1.02v6.03zm11.27 5.17c0 .55-.46 1-1.02 1h-6.63c-.57 0-1.03-.45-1.03-1v-1.4c0-.56.46-1.02 1.03-1.02h6.63c.56 0 1.02.46 1.02 1.02v1.4zm0-5.17c0 .56-.46 1.02-1.02 1.02h-6.63c-.57 0-1.03-.46-1.03-1.02v-1.41c0-.56.46-1.02 1.03-1.02h6.63c.56 0 1.02.46 1.02 1.02v1.41zm0-5.17c0 .56-.46 1.02-1.02 1.02h-6.63c-.57 0-1.03-.46-1.03-1.02V6.4c0-.56.46-1.02 1.03-1.02h6.63c.56 0 1.02.46 1.02 1.02v.86z"
					/></svg
				>
				<span>はてなブックマーク</span>
			</button>
		</div>
	{/if}
</div>
