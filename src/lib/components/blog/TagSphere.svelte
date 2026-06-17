<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cssVarToColorString } from '$lib/utils/css-color';

	let { tags }: { tags: { tag: string; count: number }[] } = $props();

	let container: HTMLDivElement;
	// WebGL 初期化前・reduced-motion 時はフォールバックのタグリンク一覧を表示する
	let active = $state(false);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (tags.length === 0) return;

		let cancelled = false;
		let cleanup: (() => void) | undefined;

		(async () => {
			const THREE = await import('three');
			if (cancelled || !container) return;
			cleanup = init(THREE);
			active = true;
		})();

		return () => {
			cancelled = true;
			cleanup?.();
		};
	});

	function makeTexture(THREE: typeof import('three'), label: string, count: number) {
		const fontSize = 26 + Math.min(count, 8) * 3;
		const dpr = 2;
		const font = `600 ${fontSize}px Geist Variable, ui-sans-serif, sans-serif`;
		const measure = document.createElement('canvas').getContext('2d')!;
		measure.font = font;
		const textWidth = Math.ceil(measure.measureText(label).width);

		const canvas = document.createElement('canvas');
		canvas.width = (textWidth + 24) * dpr;
		canvas.height = (fontSize + 20) * dpr;
		const ctx = canvas.getContext('2d')!;
		ctx.scale(dpr, dpr);
		ctx.font = font;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = cssVarToColorString('--foreground');
		ctx.fillText(label, canvas.width / dpr / 2, canvas.height / dpr / 2);

		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		return { texture, aspect: canvas.width / canvas.height, fontSize };
	}

	function init(THREE: typeof import('three')) {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			50,
			container.clientWidth / container.clientHeight,
			0.1,
			100
		);
		camera.position.z = 5.6;

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		// canvas マウント専用の空 div への追加なので Svelte の DOM と衝突しない
		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(renderer.domElement);

		const group = new THREE.Group();
		scene.add(group);

		// フィボナッチ球面にタグを配置
		const RADIUS = 2.1;
		const sprites: import('three').Sprite[] = [];
		const buildSprites = () => {
			for (const s of sprites) {
				(s.material.map as import('three').Texture).dispose();
				s.material.dispose();
				group.remove(s);
			}
			sprites.length = 0;
			const n = tags.length;
			tags.forEach(({ tag, count }, i) => {
				const { texture, aspect, fontSize } = makeTexture(THREE, tag, count);
				const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
				const sprite = new THREE.Sprite(material);
				const y = n === 1 ? 0 : 1 - (2 * i) / (n - 1);
				const r = Math.sqrt(Math.max(0, 1 - y * y));
				const phi = i * Math.PI * (3 - Math.sqrt(5));
				sprite.position.set(Math.cos(phi) * r * RADIUS, y * RADIUS, Math.sin(phi) * r * RADIUS);
				const scale = fontSize / 55;
				sprite.scale.set(scale * aspect, scale, 1);
				sprite.userData = { tag, baseScale: scale, aspect };
				group.add(sprite);
				sprites.push(sprite);
			});
		};
		buildSprites();

		// テーマ切替で文字色を引き直す
		const themeObserver = new MutationObserver(buildSprites);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		// 操作: ドラッグで回転 / ホバーで強調 / クリックでタグページへ
		const raycaster = new THREE.Raycaster();
		const pointer = new THREE.Vector2();
		let dragging = false;
		let dragMoved = 0;
		let lastX = 0;
		let lastY = 0;
		let velX = 0.0035;
		let velY = 0;
		let hovered: import('three').Sprite | null = null;

		const pick = (e: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			return raycaster.intersectObjects(sprites)[0]?.object as import('three').Sprite | undefined;
		};

		const onPointerDown = (e: PointerEvent) => {
			dragging = true;
			dragMoved = 0;
			lastX = e.clientX;
			lastY = e.clientY;
		};
		const onPointerMove = (e: PointerEvent) => {
			if (dragging) {
				const dx = e.clientX - lastX;
				const dy = e.clientY - lastY;
				dragMoved += Math.abs(dx) + Math.abs(dy);
				velX = dx * 0.0025;
				velY = dy * 0.0025;
				lastX = e.clientX;
				lastY = e.clientY;
			}
			const hit = pick(e) ?? null;
			if (hovered !== hit) {
				if (hovered) {
					const { baseScale, aspect } = hovered.userData;
					hovered.scale.set(baseScale * aspect, baseScale, 1);
				}
				if (hit) {
					const { baseScale, aspect } = hit.userData;
					hit.scale.set(baseScale * aspect * 1.2, baseScale * 1.2, 1);
				}
				hovered = hit;
				container.style.cursor = hit ? 'pointer' : 'grab';
			}
		};
		const onPointerUp = (e: PointerEvent) => {
			dragging = false;
			if (dragMoved < 6) {
				const hit = pick(e);
				if (hit) goto(`/tags/${encodeURIComponent(hit.userData.tag)}`);
			}
		};
		container.addEventListener('pointerdown', onPointerDown);
		container.addEventListener('pointermove', onPointerMove);
		container.addEventListener('pointerup', onPointerUp);
		container.addEventListener('pointerleave', () => (dragging = false));

		const tick = () => {
			group.rotation.y += dragging ? 0 : velX;
			group.rotation.x += dragging ? 0 : velY;
			if (dragging) {
				group.rotation.y += velX;
				group.rotation.x += velY;
			} else {
				// 慣性を減衰させつつ、最低限の自動回転を維持する
				velX += (0.0035 - velX) * 0.02;
				velY += (0 - velY) * 0.02;
			}
			renderer.render(scene, camera);
		};

		const visibilityObserver = new IntersectionObserver(([entry]) => {
			renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
		});
		visibilityObserver.observe(container);

		const resizeObserver = new ResizeObserver(() => {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		});
		resizeObserver.observe(container);

		return () => {
			renderer.setAnimationLoop(null);
			visibilityObserver.disconnect();
			resizeObserver.disconnect();
			themeObserver.disconnect();
			container.removeEventListener('pointerdown', onPointerDown);
			container.removeEventListener('pointermove', onPointerMove);
			container.removeEventListener('pointerup', onPointerUp);
			for (const s of sprites) {
				(s.material.map as import('three').Texture).dispose();
				s.material.dispose();
			}
			renderer.dispose();
			renderer.domElement.remove();
		};
	}
</script>

<div
	bind:this={container}
	class="h-80 w-full cursor-grab touch-none select-none sm:h-96 {active ? '' : 'hidden'}"
	aria-hidden="true"
></div>

{#if !active}
	<!-- JS 無効・reduced-motion 時のフォールバック -->
	<ul class="flex flex-wrap gap-2">
		{#each tags as { tag, count } (tag)}
			<li>
				<a
					href="/tags/{encodeURIComponent(tag)}"
					class="inline-block rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
				>
					{tag} <span class="text-xs">({count})</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}
