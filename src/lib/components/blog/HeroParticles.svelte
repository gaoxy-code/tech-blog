<script lang="ts">
	import { onMount } from 'svelte';
	import { cssVarToRgb } from '$lib/utils/css-color';

	let container: HTMLDivElement;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let cleanup: (() => void) | undefined;

		(async () => {
			const THREE = await import('three');
			if (cancelled || !container) return;
			cleanup = init(THREE);
		})();

		return () => {
			cancelled = true;
			cleanup?.();
		};
	});

	function init(THREE: typeof import('three')) {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			60,
			container.clientWidth / container.clientHeight,
			0.1,
			100
		);
		camera.position.z = 8;

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		// canvas マウント専用の空 div への追加なので Svelte の DOM と衝突しない
		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(renderer.domElement);

		// パーティクル
		const COUNT = 350;
		const positions = new Float32Array(COUNT * 3);
		for (let i = 0; i < COUNT; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 16;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const material = new THREE.PointsMaterial({
			size: 0.05,
			transparent: true,
			opacity: 0.6,
			sizeAttenuation: true
		});
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		const applyThemeColor = () => {
			const [r, g, b] = cssVarToRgb('--primary');
			material.color.setRGB(r, g, b, THREE.SRGBColorSpace);
		};
		applyThemeColor();

		// テーマ切替（html.dark の付け外し）に追従
		const themeObserver = new MutationObserver(applyThemeColor);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		// マウス視差
		let targetX = 0;
		let targetY = 0;
		const onPointerMove = (e: PointerEvent) => {
			targetX = (e.clientX / window.innerWidth - 0.5) * 0.8;
			targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
		};
		window.addEventListener('pointermove', onPointerMove, { passive: true });

		const clock = new THREE.Clock();
		const tick = () => {
			const t = clock.getElapsedTime();
			points.rotation.y = t * 0.02;
			camera.position.x += (targetX - camera.position.x) * 0.04;
			camera.position.y += (-targetY - camera.position.y) * 0.04;
			camera.lookAt(0, 0, 0);
			renderer.render(scene, camera);
		};

		// 画面内にあるときだけ描画ループを回す
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
			window.removeEventListener('pointermove', onPointerMove);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}
</script>

<div bind:this={container} class="pointer-events-none absolute inset-0" aria-hidden="true"></div>
