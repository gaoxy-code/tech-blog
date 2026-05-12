<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import SocialLinks from './SocialLinks.svelte';

	interface Props {
		variant?: 'sidebar' | 'inline';
	}

	let { variant = 'sidebar' }: Props = $props();
</script>

{#if variant === 'sidebar'}
	<div>
		<div class="rounded-t-xl border border-border px-4 pt-4">
			<div class="flex items-center gap-3">
				<div class="size-16">
					<img
						src="/avatar.jpg"
						alt="toishi"
						width="80"
						height="80"
						class="size-full object-cover"
					/>
				</div>
				<div class="flex flex-col py-1">
					<div class="text-[16px] font-bold tracking-tight text-foreground">toishi</div>
					<div class="font-mono text-[10px] font-medium text-primary">Frontend Engineer</div>
				</div>
			</div>
			<div class="py-3.5">
				<SocialLinks variant="compact-full" />
			</div>
		</div>
		<a
			href="/about"
			class="group flex w-full items-center justify-between rounded-b-xl border border-border px-4 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
		>
			<span>プロフィール詳細</span>
			<ArrowRight size={16} class="shrink-0 transition-transform group-hover:translate-x-1" />
		</a>
	</div>
{:else}
	<div class="rounded-xl border border-border">
		<div class="flex items-center gap-3 p-4">
			<div class="size-12 shrink-0">
				<img src="/avatar.jpg" alt="toishi" width="48" height="48" class="size-full object-cover" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col">
				<div class="text-[16px] font-bold tracking-tight text-foreground">toishi</div>
				<div class="font-mono text-[10px] font-medium text-primary">Frontend Engineer</div>
			</div>
			<SocialLinks variant="icon-only" />
		</div>
		<a
			href="/about"
			class="group flex w-full items-center justify-between rounded-b-xl border-t border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
		>
			<span>プロフィール詳細</span>
			<ArrowRight size={16} class="shrink-0 transition-transform group-hover:translate-x-1" />
		</a>
	</div>
{/if}
