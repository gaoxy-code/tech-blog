<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import SocialLinks from '$lib/components/blog/SocialLinks.svelte';

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
					<div class="mb-3.5 size-20 overflow-hidden rounded-full border-2 border-border">
						<img
							src="/avatar.jpg"
							alt="toishi"
							width="80"
							height="80"
							class="size-full object-cover"
						/>
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
				<div class="px-6 py-3.5">
					<SocialLinks variant="with-label" />
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
