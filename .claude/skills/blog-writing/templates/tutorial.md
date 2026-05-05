---
title: 〇〇 で △△ を作る手順
description: 〇〇 と △△ を組み合わせて ×× を実現する手順をサンプルコード付きで解説します。
date: YYYY-MM-DD
draft: true
tags:
  - tag-a
  - tag-b
---

導入段落 1。何を作るか、なぜそれを作るかを 1〜2 文で。

導入段落 2 (任意)。完成イメージや想定読者。

## システム構成

```
コンポーネント A
    ↓
コンポーネント B
    ↓
コンポーネント C
```

### 使用サービス・ツール

| サービス                          | 用途 | 費用     |
| --------------------------------- | ---- | -------- |
| [サービス A](https://example.com) | 〜   | 無料     |
| [サービス B](https://example.com) | 〜   | 月 〜 円 |

## 事前準備

前提条件・アカウント作成・チャンネル作成などのセットアップ。

<!-- スクショ: 〇〇画面 -->

> 📸 **スクショ① 〇〇 の管理画面**

1. 手順 1
2. 手順 2
3. 手順 3

## 開発環境のセットアップ

```bash
# インストール
npm install -g <tool>

# ログイン
<tool> login
```

## ファイル構成

```
project-root/
├── src/
│   ├── main.js
│   └── lib.js
├── .env.example
└── package.json
```

## 実装

### シークレット管理

`.env` やプロパティストアにキーを置く方針を最初に決める。

| キー        | 値  |
| ----------- | --- |
| `API_TOKEN` | 〜  |

### サンプル①: 〇〇

```javascript
// src/sample.js
function example() {
	return 'A';
}
```

### サンプル②: △△

```javascript
function another() {
	return 'B';
}
```

## デプロイ / トリガー設定

```bash
<tool> push
```

<!-- スクショ: デプロイ完了画面 -->

> 📸 **スクショ② デプロイが成功した画面**

## 動作確認

dryRun のような関数を用意して、本番影響なく挙動を試す。

```javascript
dryRun('test-input');
```

## ハマったポイント

### よくある罠 1

原因と対処。古い情報源で混乱しがちな箇所をここに書く。

### よくある罠 2

原因と対処。

## まとめ

- 要点 1
- 要点 2
- 要点 3

応用先や次のステップ。

## 参照

### サービス A

- [サービス A 公式サイト](https://example.com)
- [サービス A API リファレンス](https://example.com/docs)

### サービス B

- [サービス B ドキュメント](https://example.com/docs)
- [サービス B GitHub](https://github.com/org/repo)
