export function copyCodeButtons(node: HTMLElement) {
	const buttons: HTMLButtonElement[] = [];

	function buildButton(pre: HTMLPreElement) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'code-copy-btn';
		button.setAttribute('aria-label', 'コードをコピー');
		button.innerHTML = copyIcon();

		button.addEventListener('click', async () => {
			const code = pre.querySelector('code');
			const text = code?.innerText ?? pre.innerText;
			try {
				await navigator.clipboard.writeText(text);
				button.innerHTML = checkIcon();
				button.classList.add('copied');
				setTimeout(() => {
					button.innerHTML = copyIcon();
					button.classList.remove('copied');
				}, 2000);
			} catch {
				// clipboard API 失敗時は何もしない
			}
		});

		return button;
	}

	function attach() {
		const pres = node.querySelectorAll<HTMLPreElement>('pre');
		pres.forEach((pre) => {
			if (pre.dataset.copyAttached === 'true') return;
			pre.dataset.copyAttached = 'true';

			// pre の外側にラッパーを作り、ボタンはラッパーに配置する
			// こうすることで pre の横スクロール時にボタンが動かなくなる
			const wrapper = document.createElement('div');
			wrapper.className = 'code-copy-wrapper';
			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);

			const button = buildButton(pre);
			wrapper.appendChild(button);
			buttons.push(button);
		});
	}

	attach();

	const observer = new MutationObserver(() => attach());
	observer.observe(node, { childList: true, subtree: true });

	return {
		destroy() {
			observer.disconnect();
			buttons.forEach((b) => b.remove());
		}
	};
}

function copyIcon() {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
}

function checkIcon() {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
}
