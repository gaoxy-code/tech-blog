<script lang="ts">
	import { ChevronRight, ChevronLeft } from '@lucide/svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, onPageChange }: Props = $props();
</script>

{#if totalPages > 1}
	<div class="mt-12 flex items-center justify-center gap-1 sm:gap-2">
		<button
			onclick={() => onPageChange(currentPage - 1)}
			disabled={currentPage === 1}
			aria-label="前のページ"
			class="rounded-md border border-border px-2 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
		>
			<div class="flex items-center gap-1">
				<ChevronLeft size={16} strokeWidth={1} />
				<span class="hidden sm:inline">Prev</span>
			</div>
		</button>

		{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
			<button
				onclick={() => onPageChange(page)}
				class="min-w-9 rounded-md border px-2 py-2 text-sm transition-colors sm:min-w-0 sm:px-4 {page ===
				currentPage
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border hover:bg-muted'}"
			>
				{page}
			</button>
		{/each}

		<button
			onclick={() => onPageChange(currentPage + 1)}
			disabled={currentPage === totalPages}
			aria-label="次のページ"
			class="rounded-md border border-border px-2 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
		>
			<div class="flex items-center gap-1">
				<span class="hidden sm:inline">Next</span>
				<ChevronRight size={16} strokeWidth={1} />
			</div>
		</button>
	</div>
{/if}
