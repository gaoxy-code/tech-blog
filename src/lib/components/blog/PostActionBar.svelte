<script lang="ts">
	import { Check, ClipboardCopy } from '@lucide/svelte';
	import ShareMenu from './ShareMenu.svelte';

	interface Props {
		rawMarkdown: string;
		title: string;
	}

	let { rawMarkdown, title }: Props = $props();

	let markdownCopied = $state(false);

	async function copyMarkdown() {
		await navigator.clipboard.writeText(rawMarkdown);
		markdownCopied = true;
		setTimeout(() => (markdownCopied = false), 2000);
	}
</script>

<div class="mt-6 flex justify-center gap-3 sm:justify-end">
	<button
		onclick={copyMarkdown}
		class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
	>
		{#if markdownCopied}
			<Check size={16} />
			<span>コピーしました</span>
		{:else}
			<ClipboardCopy size={16} />
			<span>Markdownをコピー</span>
		{/if}
	</button>
	<ShareMenu {title} />
</div>
