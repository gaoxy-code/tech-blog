<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = $state(null);
	let query = $state('');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let results = $state<any[]>([]);

	onMount(async () => {
		// dev では pagefind が存在しないので try/catch
		try {
			// Function コンストラクタで rolldown の静的解析を回避
			const dynamicImport = new Function('url', 'return import(url)');
			pagefind = await dynamicImport('/pagefind/pagefind.js');
			await pagefind.init();
		} catch {
			console.warn('Pagefind not available (run `pnpm build` first)');
		}
	});

	async function search() {
		if (!pagefind || !query) {
			results = [];
			return;
		}
		const res = await pagefind.debouncedSearch(query);
		if (!res) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		results = await Promise.all(res.results.map((r: any) => r.data()));
	}

	$effect(() => {
		void query;
		search();
	});
</script>

<Input bind:value={query} placeholder="記事を検索..." />

<ul class="mt-4 space-y-3">
	{#each results as r (r.url)}
		<li>
			<a href={r.url} class="block rounded border p-3 hover:bg-muted">
				<div class="font-semibold">{r.meta.title}</div>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="text-sm text-muted-foreground">{@html r.excerpt}</div>
			</a>
		</li>
	{/each}
</ul>
