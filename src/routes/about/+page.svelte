<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();

	const techStack = {
		Frontend: [
			'React',
			'Next.js',
			'TypeScript',
			'Redux',
			'Jotai',
			'Zustand',
			'Tanstack Query',
			'Recoil',
			'Tailwind CSS',
			'Svelte',
			'SvelteKit'
		],
		Backend: ['Node.js', 'Express', 'MongoDB'],
		'Deploy / Infra': ['Cloudflare Pages', 'Wrangler', 'Vercel'],
		Tooling: [
			'Vite',
			'Git',
			'pnpm',
			'ESLint',
			'Prettier',
			'Playwright',
			'Storybook',
			'Figma',
			'Notion',
			'Miro',
			'Jest',
			'Vitest',
			'Testing Library',
			'Jira',
			'Confluence'
		],
		AI: ['Claude', 'GitHub Copilot', 'ChatGPT', 'Gemini'],
		OS: ['macOS', 'Windows', 'Linux(WSL)']
	};

	const timeline = [
		{
			year: '2026',
			active: true,
			title: '個人ブログ開発・運営',
			desc: 'SvelteKit + Cloudflare Pages でテックブログを構築。'
		},
		{
			year: '2021',
			active: false,
			title: 'フロントエンドエンジニア',
			desc: 'React / Next.js を中心としたプロダクト開発に従事。'
		},
		{
			year: '2019',
			active: false,
			title: 'Web エンジニアとしてキャリアスタート',
			desc: '静岡から神奈川へ。フロントエンドを中心に、複数プロジェクトに携わる。'
		}
	];

	function formatViews(n: number): string {
		if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
		return String(n);
	}
</script>

<Seo title="About" description="toishi — Frontend Engineer" />

<div class="mx-auto w-full max-w-[960px] px-6 pt-16 pb-20">
	<!-- Page header -->
	<div class="mb-12">
		<h1 class="text-4xl leading-[1.1] font-bold tracking-tight text-primary">ABOUT</h1>
	</div>

	<div class="grid grid-cols-1 items-start gap-6 md:grid-cols-[280px_1fr]">
		<!-- LEFT: Profile card -->
		<aside>
			<div class="sticky top-[72px] overflow-hidden rounded-xl border border-border bg-card">
				<!-- Avatar + name -->
				<div class="flex flex-col items-center border-b border-border px-6 pt-7 pb-5 text-center">
					<div
						class="mb-3.5 flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-gradient-to-br from-[oklch(0.93_0_0)] to-[oklch(0.86_0_0)] text-[oklch(0.65_0_0)]"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-[42px]">
							<path
								d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
							/>
						</svg>
					</div>
					<div class="mb-1 text-[17px] font-bold tracking-tight text-foreground">toishi</div>
					<div class="font-mono text-[11px] font-medium text-primary">Frontend Engineer</div>
				</div>

				<!-- Attributes -->
				<div class="flex flex-col border-b border-border px-6 py-4">
					<div
						class="flex items-center justify-between border-b border-border py-[9px] last:border-b-0"
					>
						<span class="font-mono text-[11px] text-muted-foreground">location</span>
						<span class="font-mono text-[11px] font-semibold text-muted-foreground"
							>Yokohama, Japan</span
						>
					</div>
					<div
						class="flex items-center justify-between border-b border-border py-[9px] last:border-b-0"
					>
						<span class="font-mono text-[11px] text-muted-foreground">favorite</span>
						<span class="font-mono text-[11px] font-semibold text-muted-foreground"
							>React/TypeScript</span
						>
					</div>
					<div
						class="flex items-center justify-between border-b border-border py-[9px] last:border-b-0"
					>
						<span class="font-mono text-[11px] text-muted-foreground">learning</span>
						<span class="font-mono text-[11px] font-semibold text-primary">public</span>
					</div>
					<div
						class="flex items-center justify-between border-b border-border py-[9px] last:border-b-0"
					>
						<span class="font-mono text-[11px] text-muted-foreground">coffee</span>
						<span class="font-mono text-[11px] font-semibold text-primary">enabled</span>
					</div>
					<div
						class="flex items-center justify-between border-b border-border py-[9px] last:border-b-0"
					>
						<span class="font-mono text-[11px] text-muted-foreground">status</span>
						<span class="font-mono text-[11px] font-semibold text-muted-foreground"
							>open to work</span
						>
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 border-b border-border py-4">
					<div class="flex flex-col items-center gap-0.5 p-2">
						<span class="font-mono text-lg font-bold tracking-tight text-foreground"
							>{data.postCount}</span
						>
						<span class="text-[10px] tracking-[0.04em] text-muted-foreground">記事</span>
					</div>
					<div class="flex flex-col items-center gap-0.5 border-l border-border p-2">
						<span class="font-mono text-lg font-bold tracking-tight text-foreground"
							>{data.tagCount}</span
						>
						<span class="text-[10px] tracking-[0.04em] text-muted-foreground">タグ</span>
					</div>
					<div class="flex flex-col items-center gap-0.5 border-l border-border p-2">
						<span class="font-mono text-lg font-bold tracking-tight text-primary"
							>{formatViews(data.totalViews)}</span
						>
						<span class="text-[10px] tracking-[0.04em] text-muted-foreground">ビュー</span>
					</div>
				</div>

				<!-- Social -->
				<div class="flex justify-center gap-2 px-6 py-3.5">
					<a
						href="https://x.com/_____gaoxy/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="X (Twitter)"
						class="flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-[7px] text-xs font-medium text-muted-foreground no-underline transition-colors hover:border-foreground hover:bg-muted hover:text-foreground"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-3.5">
							<path
								d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
							/>
						</svg>
						X
					</a>
					<a
						href="https://github.com/gaoxy-code"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub"
						class="flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-[7px] text-xs font-medium text-muted-foreground no-underline transition-colors hover:border-foreground hover:bg-muted hover:text-foreground"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-3.5">
							<path
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							/>
						</svg>
						GitHub
					</a>
				</div>
			</div>
		</aside>

		<!-- RIGHT: Content -->
		<div class="flex flex-col gap-5">
			<!-- README card -->
			<div class="overflow-hidden rounded-xl border border-border bg-card">
				<div
					class="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5 text-muted-foreground"
				>
					<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
						/>
					</svg>
					<span class="font-mono text-xs text-muted-foreground">README.md</span>
				</div>
				<div class="flex flex-col gap-3 px-7 pt-6 pb-5">
					<h2
						class="border-b-2 border-border pb-2.5 text-lg font-bold tracking-tight text-foreground"
					>
						Hi, I'm toishi 👋
					</h2>
					<p class="text-[13.5px] leading-[1.8] text-muted-foreground">
						フロントエンドエンジニアとして、シンプルで高品質なコードを追求しています。<br />
						React・Next.js・SvelteKit を中心に、個人開発と学習ログを発信中。
					</p>

					<h3 class="mt-1 text-[13px] font-semibold text-foreground">Currently working on</h3>
					<ul
						class="flex list-none flex-col gap-1 pl-1 text-[13px] leading-[1.7] text-muted-foreground [&_li]:flex [&_li]:items-baseline [&_li]:gap-2 [&_li]:before:shrink-0 [&_li]:before:font-mono [&_li]:before:text-border [&_li]:before:content-['–']"
					>
						<li>SvelteKit + Cloudflare Pages でのブログ基盤構築</li>
						<li>Claude での AI プログラミング</li>
					</ul>

					<h3 class="mt-1 text-[13px] font-semibold text-foreground">Learning</h3>
					<ul
						class="flex list-none flex-col gap-1 pl-1 text-[13px] leading-[1.7] text-muted-foreground [&_li]:flex [&_li]:items-baseline [&_li]:gap-2 [&_li]:before:shrink-0 [&_li]:before:font-mono [&_li]:before:text-border [&_li]:before:content-['–']"
					>
						<li>Svelte/SvelteKit</li>
						<li>AI Engineering</li>
					</ul>

					<blockquote
						class="mt-2 rounded-r-sm border-l-2 border-primary bg-muted px-4 py-3 text-[13px] text-muted-foreground italic"
					>
						"目の前の課題を解決し、知見をシェアする。"
					</blockquote>
				</div>
			</div>

			<!-- Tech Stack card -->
			<div class="overflow-hidden rounded-xl border border-border bg-card">
				<div class="flex items-center border-b border-border px-5 pt-4 pb-3.5">
					<span
						class="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
					>
						Tech Stack
					</span>
				</div>
				<div class="p-5">
					<div class="flex flex-col gap-4">
						{#each Object.entries(techStack) as [category, items] (category)}
							<div class="flex flex-col gap-2">
								<span
									class="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
								>
									{category}
								</span>
								<div class="flex flex-wrap gap-1.5">
									{#each items as item (item)}
										<span
											class="group inline-flex cursor-default items-center gap-[5px] rounded-sm border border-border bg-muted px-[11px] py-[5px] font-mono text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary"
										>
											<span
												class="size-1.5 shrink-0 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
												aria-hidden="true"
											></span>
											{item}
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Timeline card -->
			<div class="overflow-hidden rounded-xl border border-border bg-card">
				<div class="flex items-center border-b border-border px-5 pt-4 pb-3.5">
					<span
						class="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
					>
						Timeline
					</span>
				</div>
				<div class="p-5">
					<div class="flex flex-col">
						{#each timeline as item (item.year)}
							<div
								class="flex items-start gap-4 border-b border-border py-3.5 first:pt-0 last:border-b-0 last:pb-0"
							>
								<span
									class="min-w-10 pt-0.5 font-mono text-[11px] font-medium text-muted-foreground"
									>{item.year}</span
								>
								<div class="flex flex-col items-center pt-1.5">
									<div
										class="size-[7px] shrink-0 rounded-full border-2 {item.active
											? 'border-primary bg-primary'
											: 'border-border bg-border'}"
									></div>
								</div>
								<div class="flex-1">
									<div class="mb-[3px] text-[13px] font-semibold text-foreground">
										{item.title}
									</div>
									<div class="text-xs leading-[1.6] text-muted-foreground">{item.desc}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
