<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	export interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	interface Props {
		articleEl: HTMLElement | null;
		toc?: TocItem[];
		activeId?: string;
	}

	let { articleEl, toc = $bindable([]), activeId = $bindable('') }: Props = $props();

	let activeSectionId = $state('');
	let tocNavEl = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!activeId) return;
		const item = toc.find((t) => t.id === activeId);
		if (!item) return;
		if (item.level === 2) {
			activeSectionId = item.id;
		} else {
			const idx = toc.indexOf(item);
			for (let i = idx - 1; i >= 0; i--) {
				if (toc[i].level === 2) {
					activeSectionId = toc[i].id;
					break;
				}
			}
		}
	});

	$effect(() => {
		if (!activeId || !tocNavEl) return;
		tick().then(() => {
			const activeEl = tocNavEl?.querySelector(`[data-toc-id="${activeId}"]`);
			activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		});
	});

	function getParentH2Id(item: TocItem): string {
		const idx = toc.indexOf(item);
		for (let i = idx - 1; i >= 0; i--) {
			if (toc[i].level === 2) return toc[i].id;
		}
		return '';
	}

	onMount(() => {
		if (!articleEl) return;
		const headings = articleEl.querySelectorAll('h2, h3');
		toc = Array.from(headings).map((h) => ({
			id: h.id,
			text: h.textContent ?? '',
			level: h.tagName === 'H2' ? 2 : 3
		}));

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-80px 0px -60% 0px' }
		);
		headings.forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	});
</script>

<!-- Desktop sidebar only – mobile version is rendered in post.svelte header -->
{#if toc.length > 0}
	<aside class="hidden w-60 shrink-0 xl:block">
		<div class="sticky top-20 rounded-xl border border-border">
			<Accordion.Root type="single" value="toc">
				<Accordion.Item value="toc" class="border-none">
					<Accordion.Trigger
						class="px-6 py-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase"
					>
						目次
					</Accordion.Trigger>
					<Accordion.Content class="px-6">
						<nav
							class="max-h-[calc(100vh-12rem)] space-y-0.5 overflow-y-auto"
							aria-label="Table of contents"
							bind:this={tocNavEl}
						>
							{#each toc as item, i (item.id || i)}
								{@const isH3 = item.level === 3}
								{@const parentId = isH3 ? getParentH2Id(item) : ''}
								{@const isVisible = !isH3 || parentId === activeSectionId}
								{@const isActive = activeId === item.id}
								{#if isVisible}
									<a
										href="#{item.id}"
										data-toc-id={item.id}
										aria-current={isActive ? 'true' : undefined}
										class="block border-l-2 py-0.5 text-sm transition-colors
											{isH3 ? 'pl-5' : 'pl-3'}
											{isActive
											? 'border-primary font-medium text-foreground'
											: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
									>
										{item.text}
									</a>
								{/if}
							{/each}
						</nav>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</aside>
{/if}
