import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontRegular = readFileSync(resolve('src/lib/server/fonts/NotoSansJP-Regular.ttf'));
const fontBold = readFileSync(resolve('src/lib/server/fonts/NotoSansJP-Bold.ttf'));

// --- ヘルパー関数 ---

function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
	let state = seed | 0 || 1;
	return () => {
		state ^= state << 13;
		state ^= state >> 17;
		state ^= state << 5;
		return ((state >>> 0) % 10000) / 10000;
	};
}

// --- カラーパレット ---

const palettes = [
	{ base: ['#0f0f23', '#1a1a3e'], accents: ['#8b5cf6', '#6366f1', '#a78bfa'] },
	{ base: ['#0d1f0f', '#1a3a1e'], accents: ['#34d399', '#10b981', '#6ee7b7'] },
	{ base: ['#1f0d0d', '#3a1a1a'], accents: ['#f97316', '#ef4444', '#fb923c'] },
	{ base: ['#0d1a2e', '#0d2a3e'], accents: ['#22d3ee', '#06b6d4', '#67e8f9'] },
	{ base: ['#1f1a0d', '#3a2e1a'], accents: ['#fbbf24', '#f59e0b', '#fcd34d'] },
	{ base: ['#1f0d1a', '#3a1a2e'], accents: ['#f472b6', '#c084fc', '#f9a8d4'] }
];

// --- ボケ風シェイプ生成 ---

function generateShapes(seed: string) {
	const hash = hashString(seed);
	const rand = seededRandom(hash);
	const palette = palettes[hash % palettes.length];

	const shapes: Array<{
		type: 'div';
		props: { style: Record<string, string | number> };
	}> = [];

	const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
	const range = (min: number, max: number) => min + rand() * (max - min);

	// 大きい円 2〜3個
	const largeCount = 2 + Math.floor(rand() * 2);
	for (let i = 0; i < largeCount; i++) {
		const size = Math.round(range(200, 400));
		shapes.push({
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					width: `${size}px`,
					height: `${size}px`,
					borderRadius: '50%',
					background: pick(palette.accents),
					opacity: range(0.08, 0.2),
					left: `${Math.round(range(-100, 1100))}px`,
					top: `${Math.round(range(-100, 530))}px`
				}
			}
		});
	}

	// 中くらいの円 3〜4個
	const medCount = 3 + Math.floor(rand() * 2);
	for (let i = 0; i < medCount; i++) {
		const size = Math.round(range(80, 200));
		shapes.push({
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					width: `${size}px`,
					height: `${size}px`,
					borderRadius: '50%',
					background: pick(palette.accents),
					opacity: range(0.06, 0.15),
					left: `${Math.round(range(-50, 1150))}px`,
					top: `${Math.round(range(-50, 580))}px`
				}
			}
		});
	}

	// 小さい円 2〜3個
	const smallCount = 2 + Math.floor(rand() * 2);
	for (let i = 0; i < smallCount; i++) {
		const size = Math.round(range(30, 80));
		shapes.push({
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					width: `${size}px`,
					height: `${size}px`,
					borderRadius: '50%',
					background: pick(palette.accents),
					opacity: range(0.1, 0.25),
					left: `${Math.round(range(0, 1150))}px`,
					top: `${Math.round(range(0, 580))}px`
				}
			}
		});
	}

	return { shapes, palette };
}

// --- OGP画像生成 ---

export async function generateOgImage(options: {
	title: string;
	date?: string;
	slug?: string;
}): Promise<ArrayBuffer> {
	const { title, date, slug } = options;
	const seed = slug ?? title;
	const { shapes, palette } = generateShapes(seed);

	const formattedDate = date
		? new Date(date).toLocaleDateString('ja-JP', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
		: '';

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					fontFamily: 'Noto Sans JP'
				},
				children: [
					// 背景グラデーション
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								background: `linear-gradient(135deg, ${palette.base[0]} 0%, ${palette.base[1]} 100%)`
							}
						}
					},
					// ボケ風シェイプ
					...shapes,
					// 半透明オーバーレイ（テキスト可読性確保）
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								background: 'rgba(0, 0, 0, 0.4)'
							}
						}
					},
					// コンテンツ
					{
						type: 'div',
						props: {
							style: {
								position: 'relative',
								width: '100%',
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								padding: '60px 72px'
							},
							children: [
								// 上部: 装飾ライン
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											alignItems: 'center',
											gap: '16px'
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														width: '48px',
														height: '4px',
														background: `linear-gradient(90deg, ${palette.accents[0]}, ${palette.accents[1]})`,
														borderRadius: '2px'
													}
												}
											},
											{
												type: 'div',
												props: {
													style: {
														width: '12px',
														height: '4px',
														background: palette.accents[0],
														borderRadius: '2px',
														opacity: '0.5'
													}
												}
											}
										]
									}
								},
								// 中央: タイトル
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											flexDirection: 'column',
											gap: '24px',
											flex: '1',
											justifyContent: 'center'
										},
										children: [
											{
												type: 'h1',
												props: {
													style: {
														fontSize: title.length > 30 ? '44px' : '52px',
														fontWeight: 700,
														color: '#f1f5f9',
														lineHeight: 1.3,
														letterSpacing: '-0.02em',
														margin: 0,
														overflow: 'hidden',
														textOverflow: 'ellipsis'
													},
													children: title
												}
											}
										]
									}
								},
								// 下部: 日付 + タグ + サイト名
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'flex-end'
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														flexDirection: 'column',
														gap: '12px'
													},
													children: [
														// 日付
														formattedDate
															? {
																	type: 'span',
																	props: {
																		style: {
																			fontSize: '16px',
																			color: '#94a3b8'
																		},
																		children: formattedDate
																	}
																}
															: null
													].filter(Boolean)
												}
											},
											// サイト名
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														alignItems: 'center',
														gap: '10px'
													},
													children: [
														{
															type: 'div',
															props: {
																style: {
																	width: '8px',
																	height: '8px',
																	borderRadius: '50%',
																	background: palette.accents[0]
																}
															}
														},
														{
															type: 'span',
															props: {
																style: {
																	fontSize: '18px',
																	color: '#64748b',
																	fontWeight: 600
																},
																children: "toishi's blog"
															}
														}
													]
												}
											}
										]
									}
								}
							]
						}
					}
				]
			}
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Noto Sans JP',
					data: fontRegular,
					weight: 400,
					style: 'normal'
				},
				{
					name: 'Noto Sans JP',
					data: fontBold,
					weight: 700,
					style: 'normal'
				}
			]
		}
	);

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: 1200 }
	});
	const pngData = resvg.render();
	const png = pngData.asPng();
	const ab = new ArrayBuffer(png.byteLength);
	new Uint8Array(ab).set(png);
	return ab;
}
