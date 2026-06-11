/**
 * CSS 変数（oklch 等）をブラウザに解決させて 0-1 の RGB タプルとして返す。
 * Three.js の Color は oklch 文字列を解釈できないため、
 * canvas 2D のピクセル読み出しで実際の色値に変換する。
 */
export function cssVarToRgb(varName: string): [number, number, number] {
	const probe = document.createElement('span');
	probe.style.color = `var(${varName})`;
	document.body.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
	if (!ctx) return [0.5, 0.5, 0.5];
	ctx.fillStyle = resolved;
	ctx.fillRect(0, 0, 1, 1);
	const d = ctx.getImageData(0, 0, 1, 1).data;
	return [d[0] / 255, d[1] / 255, d[2] / 255];
}

/** CSS 変数を canvas の fillStyle 等にそのまま使える色文字列として返す。 */
export function cssVarToColorString(varName: string): string {
	const probe = document.createElement('span');
	probe.style.color = `var(${varName})`;
	document.body.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();
	return resolved;
}
