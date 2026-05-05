<script lang="ts">
	import { onMount } from 'svelte';

	// --- フェーズ1: import + コメント（行ごとフェードイン） ---
	const phase1Lines = [
		`<span class="tk-kw">import</span> { coffee } <span class="tk-kw">from</span> <span class="tk-str">"life"</span>`,
		`<span class="tk-kw">import</span> { camera } <span class="tk-kw">from</span> <span class="tk-str">"hobbies"</span>`,
		``,
		`<span class="tk-cmt">// learning in public</span>`
	];

	// --- フェーズ2: type 定義（行ごと表示） ---
	const phase2Lines = [
		``,
		``,
		`<span class="tk-kw">type</span> <span class="tk-type">Engineer</span> = {`,
		`  name: <span class="tk-type">string</span>`,
		`  role: <span class="tk-type">string</span>`,
		`  location: <span class="tk-type">string</span>`,
		`  stack: <span class="tk-type">string</span>[]`,
		`  interests: <span class="tk-type">string</span>[]`,
		`  hobbies: <span class="tk-type">string</span>[]`,
		`  currently: <span class="tk-type">string</span>`,
		`}`,
		``
	];

	// --- フェーズ3: const me + 実行結果（1文字ずつタイピング） ---
	const phase3Html = `
<span class="tk-kw">const</span> <span class="tk-var">me</span>: <span class="tk-type">Engineer</span> = {
  name: <span class="tk-str">"toishi"</span>,
  role: <span class="tk-str">"Frontend Engineer"</span>,
  location: <span class="tk-str">"Yokohama, Japan"</span>,
  stack: [<span class="tk-str">"React"</span>, <span class="tk-str">"Next.js"</span>, <span class="tk-str">"TypeScript"</span>, <span class="tk-str">"Node.js"</span>],
  interests: [<span class="tk-str">"Svelte"</span>],
  hobbies: [<span class="tk-str">"Coffee"</span>, <span class="tk-str">"Photography"</span>, <span class="tk-str">"Parenting"</span>],
  currently: <span class="tk-str">"Building SaaS &amp; writing tech blog"</span>
}

<span class="tk-gt">&gt;</span> pnpm run life
<span class="tk-gt">&gt;</span> Building, learning, and enjoying the journey...`;

	// 高さ確保用: 全コンテンツの完成形
	const fullCodeHtml = phase1Lines.join('\n') + '\n' + phase2Lines.join('\n') + phase3Html;

	// プレーンテキストの先頭 n 文字分だけ表示する HTML を生成
	function sliceHtmlByPlainText(html: string, maxChars: number): string {
		let plainCount = 0;
		let result = '';
		let i = 0;
		const openTags: string[] = [];

		while (i < html.length && plainCount < maxChars) {
			if (html[i] === '<') {
				const tagEnd = html.indexOf('>', i);
				if (tagEnd === -1) break;
				const tag = html.slice(i, tagEnd + 1);
				if (tag.startsWith('</')) {
					openTags.pop();
				} else if (!tag.endsWith('/>')) {
					const match = tag.match(/^<(\w+)/);
					if (match) openTags.push(match[1]);
				}
				result += tag;
				i = tagEnd + 1;
			} else {
				result += html[i];
				plainCount++;
				i++;
			}
		}

		while (openTags.length > 0) {
			result += `</${openTags.pop()}>`;
		}

		return result;
	}

	const phase3TotalChars = phase3Html.replace(/<[^>]*>/g, '').length;

	// ステート
	let phase1Visible = $state([false, false, false, false]);
	let phase2Count = $state(0);
	let currentPhase = $state(0);
	let phase3Chars = $state(0);
	let typingDone = $state(false);

	let phase3DisplayedCode = $derived(sliceHtmlByPlainText(phase3Html, phase3Chars));

	let activeHtml = $derived.by(() => {
		let html = '';
		phase1Lines.forEach((line, i) => {
			const cls = phase1Visible[i] ? 'phase1-line phase1-visible' : 'phase1-line';
			html += `<span class="${cls}">${line}</span>`;
			if (i < phase1Lines.length - 1) html += '\n';
		});
		if (currentPhase >= 2) {
			for (let i = 0; i < phase2Count; i++) {
				html += phase2Lines[i];
				if (i < phase2Lines.length - 1) html += '\n';
			}
		}
		if (currentPhase >= 3) {
			html += phase3DisplayedCode;
		}
		const cursorCls = typingDone ? 'cursor-blink opacity-0' : 'cursor-blink';
		html += `<span class="${cursorCls} inline-block h-[1em] w-[0.5em] translate-y-[1px] align-text-bottom">&nbsp;</span>`;
		return html;
	});

	onMount(() => {
		let timer: number;

		const startPhase1 = () => {
			currentPhase = 1;
			let idx = 0;
			const step = () => {
				if (idx < phase1Lines.length) {
					phase1Visible[idx] = true;
					idx++;
					timer = window.setTimeout(step, 100);
				} else {
					timer = window.setTimeout(startPhase2, 150);
				}
			};
			step();
		};

		const startPhase2 = () => {
			currentPhase = 2;
			const step = () => {
				if (phase2Count < phase2Lines.length) {
					phase2Count++;
					timer = window.setTimeout(step, 60);
				} else {
					timer = window.setTimeout(startPhase3, 100);
				}
			};
			step();
		};

		const startPhase3 = () => {
			currentPhase = 3;
			const tick = () => {
				phase3Chars = Math.min(phase3Chars + 2, phase3TotalChars);
				if (phase3Chars >= phase3TotalChars) {
					typingDone = true;
					return;
				}
				timer = window.setTimeout(tick, 20);
			};
			tick();
		};

		timer = window.setTimeout(startPhase1, 400);

		return () => clearTimeout(timer);
	});
</script>

<div class="hero-terminal animate-float rounded-xl border p-4 font-mono text-xs shadow-lg">
	<div class="mb-3 flex">
		<div class="flex items-center gap-1.5">
			<span class="h-3 w-3 rounded-full bg-red-400"></span>
			<span class="h-3 w-3 rounded-full bg-yellow-400"></span>
			<span class="h-3 w-3 rounded-full bg-green-400"></span>
		</div>
		<span class="terminal-title ml-3">~/toishi/blog - zsh</span>
	</div>
	<div class="terminal-code relative leading-relaxed">
		<!-- eslint-disable svelte/no-at-html-tags -->
		<code class="invisible" aria-hidden="true">{@html fullCodeHtml}</code>
		<code class="absolute inset-0">{@html activeHtml}</code>
	</div>
</div>

<style>
	/* ターミナル — ライト時はダーク背景、ダーク時はライト背景 */
	.hero-terminal {
		background-color: oklch(0.17 0 0);
		border-color: oklch(0.3 0 0);
		color: oklch(0.85 0 0);
	}

	:global(.dark) .hero-terminal {
		background-color: oklch(0.98 0 0);
		border-color: oklch(0.88 0 0);
		color: oklch(0.25 0 0);
	}

	.terminal-code code {
		white-space: pre;
	}

	.terminal-title {
		color: oklch(0.6 0 0);
	}

	:global(.dark) .terminal-title {
		color: oklch(0.5 0 0);
	}

	/* トークンカラー — ライト時（ダーク背景向け） */
	.terminal-code :global(.tk-kw) {
		color: oklch(0.7 0.15 250);
	}
	.terminal-code :global(.tk-str) {
		color: oklch(0.75 0.15 150);
	}
	.terminal-code :global(.tk-type) {
		color: oklch(0.8 0.12 80);
	}
	.terminal-code :global(.tk-var) {
		color: oklch(0.8 0.12 80);
	}
	.terminal-code :global(.tk-cmt) {
		color: oklch(0.5 0 0);
	}
	.terminal-code :global(.tk-gt) {
		color: oklch(0.6 0.1 150);
	}

	/* トークンカラー — ダーク時（ライト背景向け） */
	:global(.dark) .terminal-code :global(.tk-kw) {
		color: oklch(0.45 0.2 260);
	}
	:global(.dark) .terminal-code :global(.tk-str) {
		color: oklch(0.45 0.15 150);
	}
	:global(.dark) .terminal-code :global(.tk-type) {
		color: oklch(0.5 0.15 50);
	}
	:global(.dark) .terminal-code :global(.tk-var) {
		color: oklch(0.5 0.15 50);
	}
	:global(.dark) .terminal-code :global(.tk-cmt) {
		color: oklch(0.6 0 0);
	}
	:global(.dark) .terminal-code :global(.tk-gt) {
		color: oklch(0.4 0.1 150);
	}

	/* フェーズ1: フェードイン */
	.terminal-code :global(.phase1-line) {
		opacity: 0;
		transition: opacity 300ms ease;
	}

	.terminal-code :global(.phase1-visible) {
		opacity: 1;
	}

	/* カーソル点滅 */
	.terminal-code :global(.cursor-blink) {
		background-color: oklch(0.85 0 0);
		animation: blink 1s step-end infinite;
	}

	:global(.dark) .terminal-code :global(.cursor-blink) {
		background-color: oklch(0.25 0 0);
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* 浮遊アニメーション */
	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}
</style>
