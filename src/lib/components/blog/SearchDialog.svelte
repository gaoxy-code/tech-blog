<script lang="ts">
	import { goto } from '$app/navigation';
	import { Dialog } from 'bits-ui';
	import { cleanSearchUrl } from '$lib/utils/search';
	import { Search, ArrowRight, FileText, Command } from '@lucide/svelte';

	const MAX_PREVIEW = 5;

	let open = $state(false);
	let query = $state('');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = $state(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let results = $state<any[]>([]);
	let totalCount = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let selectedIndex = $state(-1);

	async function initPagefind() {
		if (pagefind) return;
		try {
			const dynamicImport = new Function('url', 'return import(url)');
			pagefind = await dynamicImport('/pagefind/pagefind.js');
			await pagefind.init();
		} catch {
			console.warn('Pagefind not available (run `pnpm build` first)');
		}
	}

	async function doSearch() {
		if (!pagefind || !query.trim()) {
			results = [];
			totalCount = 0;
			return;
		}
		const res = await pagefind.debouncedSearch(query);
		if (!res) return;
		totalCount = res.results.length;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		results = await Promise.all(res.results.slice(0, MAX_PREVIEW).map((r: any) => r.data()));
	}

	$effect(() => {
		void query;
		doSearch();
		selectedIndex = -1;
	});

	$effect(() => {
		if (open) {
			initPagefind();
			// reset on open
			query = '';
			results = [];
			totalCount = 0;
		}
	});

	// Focus input when dialog opens
	$effect(() => {
		if (open && inputEl) {
			// Wait for next tick so the element is visible
			requestAnimationFrame(() => inputEl?.focus());
		}
	});

	// CMD+K / Ctrl+K shortcut
	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
		}
	}

	function navigateToResult(url: string) {
		open = false;
		goto(cleanSearchUrl(url));
	}

	function viewAllResults() {
		open = false;
		goto(`/search?q=${encodeURIComponent(query.trim())}`);
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (selectedIndex >= 0 && selectedIndex < results.length) {
			navigateToResult(results[selectedIndex].url);
		} else if (selectedIndex === results.length && totalCount > MAX_PREVIEW) {
			viewAllResults();
		} else if (query.trim()) {
			viewAllResults();
		}
	}

	function handleInputKeydown(e: KeyboardEvent) {
		const itemCount = results.length + (totalCount > MAX_PREVIEW ? 1 : 0);
		if (itemCount === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0;
			scrollSelectedIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1;
			scrollSelectedIntoView();
		}
	}

	function scrollSelectedIntoView() {
		requestAnimationFrame(() => {
			const el = document.querySelector('[data-search-selected="true"]');
			el?.scrollIntoView({ block: 'nearest' });
		});
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm text-muted-foreground transition-colors hover:bg-muted md:w-56 md:justify-start md:gap-2 md:px-3"
		aria-label="検索"
	>
		<Search size={16} strokeWidth={1.5} />
		<span class="hidden flex-1 text-left md:inline">検索...</span>
		<kbd
			class="pointer-events-none hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[12px] font-medium text-muted-foreground md:inline-flex"
		>
			<Command size={12} strokeWidth={1} />
			<span class="h-4">K</span>
		</kbd>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
		/>
		<Dialog.Content
			class="fixed top-[20%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background shadow-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
		>
			<form onsubmit={handleFormSubmit} class="flex items-center border-b border-border px-4">
				<Search size={16} strokeWidth={1.5} class="shrink-0 text-muted-foreground" />
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handleInputKeydown}
					type="text"
					placeholder="記事を検索..."
					class="h-12 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
				/>
				{#if query}
					<button
						type="button"
						onclick={() => {
							query = '';
							inputEl?.focus();
						}}
						class="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						クリア
					</button>
				{/if}
			</form>

			<div class="max-h-80 overflow-y-auto">
				{#if results.length > 0}
					<div class="p-2">
						{#each results as r, i (r.url)}
							<button
								type="button"
								data-search-selected={selectedIndex === i}
								class="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
								class:bg-muted={selectedIndex === i}
								onclick={() => navigateToResult(r.url)}
								onmouseenter={() => (selectedIndex = i)}
							>
								<FileText
									size={16}
									strokeWidth={1.5}
									class="mt-0.5 shrink-0 text-muted-foreground"
								/>
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline gap-2">
										<div class="truncate text-sm font-medium">{r.meta.title}</div>
										{#if r.meta.date}
											<span class="shrink-0 text-[11px] text-muted-foreground/70"
												>{new Date(r.meta.date).toLocaleDateString('ja-JP', {
													year: 'numeric',
													month: 'short',
													day: 'numeric'
												})}</span
											>
										{/if}
									</div>
									<div class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html r.excerpt}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{:else if query.trim() && pagefind}
					<div class="px-4 py-8 text-center text-sm text-muted-foreground">
						「{query}」に一致する記事が見つかりませんでした
					</div>
				{:else if !query.trim()}
					<div class="px-4 py-8 text-center text-sm text-muted-foreground">
						キーワードを入力して検索
					</div>
				{:else if !pagefind}
					<div class="px-4 py-8 text-center text-sm text-muted-foreground">
						検索機能は <code class="rounded bg-muted px-1">pnpm build</code> 後に利用できます
					</div>
				{/if}
			</div>

			{#if results.length > 0 && totalCount > MAX_PREVIEW}
				<div class="border-t border-border p-2">
					<button
						type="button"
						data-search-selected={selectedIndex === results.length}
						class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						class:bg-muted={selectedIndex === results.length}
						class:text-foreground={selectedIndex === results.length}
						onclick={viewAllResults}
						onmouseenter={() => (selectedIndex = results.length)}
					>
						すべての結果を見る（{totalCount}件）
						<ArrowRight size={14} strokeWidth={1.5} />
					</button>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
