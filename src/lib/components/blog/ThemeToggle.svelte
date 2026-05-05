<script lang="ts">
	import { Sun, Moon, Monitor, Check } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	type Theme = 'light' | 'dark' | 'system';
	type Variant = 'dropdown' | 'inline';

	interface Props {
		variant?: Variant;
	}

	let { variant = 'dropdown' }: Props = $props();

	const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	let theme = $state<Theme>('system');
	let isDark = $state(false);

	$effect(() => {
		const saved = localStorage.getItem('theme');
		if (saved === 'light' || saved === 'dark') {
			theme = saved;
		} else {
			theme = 'system';
		}
	});

	$effect(() => {
		if (theme === 'system') {
			const mql = window.matchMedia('(prefers-color-scheme: dark)');
			const update = () => {
				isDark = mql.matches;
				document.documentElement.classList.toggle('dark', isDark);
			};
			update();
			mql.addEventListener('change', update);
			return () => mql.removeEventListener('change', update);
		} else {
			isDark = theme === 'dark';
			document.documentElement.classList.toggle('dark', isDark);
		}
	});

	function setTheme(value: Theme) {
		theme = value;
		if (value === 'system') {
			localStorage.removeItem('theme');
		} else {
			localStorage.setItem('theme', value);
		}
	}
</script>

{#if variant === 'inline'}
	<div class="flex w-full rounded-md border border-border p-0.5">
		{#each themeOptions as option (option.value)}
			<button
				type="button"
				onclick={() => setTheme(option.value)}
				aria-pressed={theme === option.value}
				aria-label={`${option.label}テーマ`}
				class="flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm transition-colors {theme ===
				option.value
					? 'bg-muted font-medium text-foreground'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				<option.icon size={16} strokeWidth={1.5} />
				<!-- <span>{option.label}</span> -->
			</button>
		{/each}
	</div>
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
			aria-label="テーマ切り替え"
		>
			{#if theme === 'light'}
				<Sun size={18} strokeWidth={1} />
			{:else if theme === 'dark'}
				<Moon size={18} strokeWidth={1} />
			{:else}
				<Monitor size={18} strokeWidth={1} />
			{/if}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-36">
			{#each themeOptions as option (option.value)}
				<DropdownMenu.Item
					onclick={() => setTheme(option.value)}
					class="flex items-center justify-between"
				>
					<span class="flex items-center gap-2">
						<option.icon size={14} strokeWidth={1.5} />
						{option.label}
					</span>
					{#if theme === option.value}
						<Check size={14} strokeWidth={2} />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
