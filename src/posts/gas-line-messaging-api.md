---
title: GAS と LINE Messaging API で日々のリマインド Bot を作る
description: Google Apps Script と LINE Messaging API を組み合わせて、毎日や毎月のリマインドを LINE に自動送信する Bot の作り方をサンプルコード付きで解説します。
date: 2026-04-29
draft: true
tags:
  - gas
  - google-apps-script
  - line
  - line-messaging-api
  - clasp
---

毎日のゴミ出しや、毎月の支払日など、忘れがちな定期イベントを LINE に自動通知できると便利です。

本記事では Google Apps Script (GAS) と LINE Messaging API を組み合わせて、以下のようなリマインド Bot を作る手順をサンプルコード付きで紹介します。

- **曜日ベースの通知**（例: 今日のゴミ収集の種別）
- **月次の繰り返しイベント通知**（例: 毎月の支払日）
- **N 日前のリマインド**（例: 支払日の 1 週間前に振込設定リマインド）

通知種別ごとに送信先メンバーを分けられる設計にしているので、家族全員に流したい通知と特定メンバーだけに送りたい通知を使い分けられます。

## 前提

- Google アカウント（GAS プロジェクトの作成・実行に使用）
- LINE アカウント（Messaging API チャンネルの作成と Bot の友だち追加に必要）
- Node.js v22 以上（[clasp](https://github.com/google/clasp) でのローカル開発用）

> ⚠️ **LINE Notify は 2025 年 3 月 31 日でサービス終了済み**です（[公式アナウンス](https://notify-bot.line.me/closing-announce)）。検索でよく出てくる古いサンプルは動かないので、本記事では現役の Messaging API を使います。

## システム構成

```text
ローカル (clasp)
    └── src/*.js
          ↓ clasp push
GAS プロジェクト
    ├── 時間ベーストリガー（毎朝 7:00）
    └── LINE Messaging API (multicast)
          ↓
LINE アプリ（各メンバー）
```

### 使用サービス・ツール

| サービス                                                                          | 用途                            | 費用                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| [Google Apps Script](https://developers.google.com/apps-script)                   | 定期実行・ロジック              | 無料                                                                                       |
| [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/overview/) | LINE 通知送信                   | [無料プランで月 200 通まで](https://www.lycbiz.com/jp/service/line-official-account/plan/) |
| [clasp](https://github.com/google/clasp)                                          | ローカルで GAS を開発・デプロイ | 無料 (OSS)                                                                                 |

## 事前準備: LINE Messaging API チャンネル作成

詳細な手順は[公式ドキュメント](https://developers.line.biz/ja/docs/messaging-api/getting-started/)を参照してください。本記事ではポイントだけ押さえます。

<!-- スクショ: LINE Developers Console のトップ画面 -->

> 📸 **スクショ① LINE Developers Console トップ**（プロバイダー一覧が見える画面）

1. [LINE Developers Console](https://developers.line.biz/console/) にログインしてプロバイダーを作成
1. 「新規チャンネル作成」 → 「Messaging API」を選択
1. 必要事項を入力してチャンネルを作成

<!-- スクショ: チャンネル作成フォーム or チャンネル種別選択画面 -->

> 📸 **スクショ② Messaging API チャンネル種別の選択画面**

### チャンネルアクセストークンの発行

「Messaging API 設定」タブ → 「チャンネルアクセストークン（長期）」の「発行」ボタン。詳細は[アクセストークンの発行ドキュメント](https://developers.line.biz/ja/docs/basics/channel-access-token/)を参照。

<!-- スクショ: チャンネルアクセストークンの発行ボタン付近 -->

> 📸 **スクショ③ チャンネルアクセストークン発行後の画面**（トークン文字列部分はマスク推奨）

### Bot を友だち追加

「Messaging API 設定」タブに QR コードがあるので、通知先となる全員に友だち追加してもらいます。

<!-- スクショ: Bot の QR コード表示画面 -->

> 📸 **スクショ④ Bot の QR コードが表示されている画面**

### userId の取得

LINE Messaging API は LINE ID（`@xxxx` 形式）ではなく、**システムが発行する `U` で始まる 33 文字の userId** を使って送信先を指定します（[ユーザー ID リファレンス](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)）。

- **自分の userId**: 「Messaging API 設定」タブ最下部の「Your user ID」
- **他メンバーの userId**: Webhook を一時的に有効にし、Bot にメッセージを送ってもらうと取得可能（[Webhook イベントリファレンス](https://developers.line.biz/ja/reference/messaging-api/#webhook-event-objects)）

<!-- スクショ: Your user ID が表示されている箇所 -->

> 📸 **スクショ⑤ 「Your user ID」が表示されている箇所**（値はマスク推奨）

## 開発環境: clasp のセットアップ

[clasp](https://github.com/google/clasp) を使うと、ローカルのエディタで GAS のコードを書いてコマンド 1 つでデプロイできます。

```bash
# インストール
npm install -g @google/clasp

# Google アカウントでログイン（初回のみ）
clasp login
```

<!-- スクショ: ブラウザで Google アカウントの認証が完了した画面 -->

> 📸 **スクショ⑥ clasp login 後の「ログイン成功」画面**

```bash
# GAS プロジェクトを新規作成して紐付け
clasp create --type standalone --title "リマインド Bot" --rootDir .
```

`.clasp.json` が生成され、scriptId が記録されます。詳しいコマンドは [clasp の README](https://github.com/google/clasp#commands) を参照してください。

## ファイル構成

```text
remind-bot/
├── appsscript.json      # GAS マニフェスト
├── src/
│   ├── main.js          # エントリポイント
│   ├── garbage.js       # 曜日ベース通知のサンプル
│   ├── monthly.js       # 月次イベント通知のサンプル
│   └── line.js          # LINE API クライアント
├── .env.example         # シークレット保管テンプレート
├── .clasp.json          # GAS プロジェクト紐付け（gitignore 対象）
├── .claspignore
└── .gitignore
```

### appsscript.json

タイムゾーンは [`appsscript.json` のマニフェスト仕様](https://developers.google.com/apps-script/manifest)で設定します。

```json
{
	"timeZone": "Asia/Tokyo",
	"dependencies": {},
	"exceptionLogging": "STACKDRIVER",
	"runtimeVersion": "V8",
	"oauthScopes": [
		"https://www.googleapis.com/auth/script.external_request",
		"https://www.googleapis.com/auth/script.scriptapp"
	]
}
```

`Asia/Tokyo` を指定することで GAS 内の `new Date()` が JST 扱いになります。OAuth スコープは LINE API 呼び出し用の `external_request` とトリガー登録用の `scriptapp` だけで足ります（[OAuth スコープ一覧](https://developers.google.com/identity/protocols/oauth2/scopes#script)）。

## 実装

### シークレット管理

トークンや userId はコードに直書きせず、GAS の **Script Properties** に保存します（[PropertiesService リファレンス](https://developers.google.com/apps-script/reference/properties/properties-service)）。

| キー                        | 値                                  |
| --------------------------- | ----------------------------------- |
| `LINE_CHANNEL_ACCESS_TOKEN` | チャンネルアクセストークン          |
| `LINE_USER_IDS_GROUP_A`     | 通知種別 A の送信先（カンマ区切り） |
| `LINE_USER_IDS_GROUP_B`     | 通知種別 B の送信先                 |

ローカルには `.env` を作成して手元バックアップとして使うとリカバリしやすくなります。

```bash
# .env.example
LINE_CHANNEL_ACCESS_TOKEN=
LINE_USER_IDS_GROUP_A=
LINE_USER_IDS_GROUP_B=
```

<!-- スクショ: GAS エディタのスクリプト プロパティ設定画面 -->

> 📸 **スクショ⑦ GAS「プロジェクトの設定」→「スクリプト プロパティ」に値を入力している画面**（値はマスク推奨）

### サンプル①: 曜日ベース通知

`Date#getDay()` の返り値（0=日〜6=土）をキーにしたマッピングを定数で持つ、最もシンプルなパターンです。

```javascript
// src/garbage.js
const SCHEDULE = {
	0: [], // 日
	1: ['プラスチック'],
	2: ['燃やすゴミ'],
	3: ['缶・ビン'],
	4: [],
	5: ['資源回収'],
	6: ['燃やすゴミ']
};

function getTodayItems(date) {
	return SCHEDULE[date.getDay()] || [];
}
```

### サンプル②: 月次イベント通知

「毎月 N 日に発生するイベント」を、開始日と総回数から計算で導く方式です。カレンダー連携が不要なのでシンプルかつ依存が少なくなります。

```javascript
// src/monthly.js
const START_YEAR = 2026;
const START_MONTH = 1; // 1-12
const DAY_OF_MONTH = 1; // 毎月の発生日
const TOTAL_COUNT = 12; // 全何回か

function getMonthlyEvent(date) {
	if (date.getDate() !== DAY_OF_MONTH) return null;

	const monthsDiff = (date.getFullYear() - START_YEAR) * 12 + (date.getMonth() + 1 - START_MONTH);
	const count = monthsDiff + 1;

	if (count < 1 || count > TOTAL_COUNT) return null;
	return { count, remaining: TOTAL_COUNT - count };
}
```

- `count` が範囲外なら `null` を返す → 全 N 回完了後は通知されない
- `remaining === 0` を判定すれば「最終回」だけ特別なメッセージにできる

カレンダー連携が必要な場合は [`CalendarApp`](https://developers.google.com/apps-script/reference/calendar/calendar-app) を使う方法もあります。

### サンプル③: N 日前のリマインド

当日通知と同じ関数を使い回し、`今日 + N 日` を渡すだけで実現できます。

```javascript
// src/main.js
const REMINDER_DAYS_AHEAD = 7;

function notifyReminder(today) {
	const target = new Date(today);
	target.setDate(target.getDate() + REMINDER_DAYS_AHEAD);
	const event = getMonthlyEvent(target);
	if (!event) return;

	const text = `📌 ${formatDate(target)} はイベント実施日です（残り ${event.remaining} 回）`;
	sendLineMulticast(text, getRecipients('LINE_USER_IDS_GROUP_B'));
}
```

### LINE API クライアント

[`UrlFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) で multicast エンドポイントを叩くだけのシンプルなラッパーです。multicast の詳細は[公式リファレンス](https://developers.line.biz/ja/reference/messaging-api/#send-multicast-message)を参照。

```javascript
// src/line.js
const LINE_MULTICAST_URL = 'https://api.line.me/v2/bot/message/multicast';

function sendLineMulticast(text, userIds) {
	if (!userIds || userIds.length === 0) return;

	const token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

	UrlFetchApp.fetch(LINE_MULTICAST_URL, {
		method: 'post',
		headers: {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/json'
		},
		payload: JSON.stringify({
			to: userIds,
			messages: [{ type: 'text', text }]
		}),
		muteHttpExceptions: true
	});
}

function getRecipients(propertyKey) {
	const raw = PropertiesService.getScriptProperties().getProperty(propertyKey);
	if (!raw) return [];
	return raw
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}
```

メッセージタイプを変えればスタンプや画像も送れます（[メッセージタイプ一覧](https://developers.line.biz/ja/docs/messaging-api/message-types/)）。

### エントリポイントとトリガー登録

`dailyNotify()` がトリガーから呼ばれるメイン関数です。種別ごとに別の Script Property から送信先を取得して、それぞれ独立した 1 通として送信しています。

トリガー登録は [`ScriptApp` のクロックトリガー](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers)を使います。

```javascript
// src/main.js
function dailyNotify() {
	const today = new Date();
	notifyDaily(today);
	notifyMonthly(today);
	notifyReminder(today);
}

function setupTrigger() {
	// 既存トリガーを削除して冪等化
	ScriptApp.getProjectTriggers().forEach((t) => {
		if (t.getHandlerFunction() === 'dailyNotify') {
			ScriptApp.deleteTrigger(t);
		}
	});
	ScriptApp.newTrigger('dailyNotify').timeBased().everyDays(1).atHour(7).create();
}
```

`setupTrigger()` を 1 回手動実行すると、毎朝 7:00 に `dailyNotify` が走るようになります。

## デプロイとトリガー設定

```bash
# GAS にコードを反映
clasp push
```

GAS エディタを開いて (`clasp open`)、`setupTrigger()` を 1 回手動実行します。初回は権限承認ダイアログが出るので承認します。

<!-- スクショ: GAS の権限承認ダイアログ -->

> 📸 **スクショ⑧ GAS の権限承認ダイアログ**（「このアプリは Google で確認されていません」画面含む）

<!-- スクショ: GAS トリガー一覧で dailyNotify のトリガーが登録されている画面 -->

> 📸 **スクショ⑨ GAS「トリガー」画面で `dailyNotify` の毎日 7:00 トリガーが登録されている画面**

## 動作確認

`dryRun()` のような関数を用意して、LINE に送信せずメッセージ内容と送信先を実行ログに出力できるようにしておくと便利です（[Logger / console.log の使い方](https://developers.google.com/apps-script/guides/logging)）。

<!-- スクショ: GAS エディタの実行ログで dryRun の出力が表示されている画面 -->

> 📸 **スクショ⑩ GAS エディタの「実行ログ」に dryRun の出力が表示されている画面**

任意の日付を引数で渡せるようにしておけば、境界値の確認も簡単です。

```javascript
dryRun('2026-01-01'); // 第1回
dryRun('2026-12-25'); // 7日後が翌月初 → リマインドのみ
dryRun('2026-12-01'); // 最終回
dryRun('2027-01-01'); // 範囲外 → 通知なし
```

<!-- スクショ: LINE アプリで通知が届いている画面 -->

> 📸 **スクショ⑪ LINE アプリで通知が届いているスクショ**

## ハマったポイント

### LINE Notify は終了している

LINE Notify は 2025 年 3 月 31 日にサービス終了済みです（[公式アナウンス](https://notify-bot.line.me/closing-announce)）。古いブログ記事のサンプルをそのまま動かそうとすると 404 になるので、必ず Messaging API を使いましょう。

### LINE ID と userId は別物

LINE アプリ内で設定する `@xxxx` 形式の「LINE ID」とは別に、Messaging API 用のシステム ID（`U` で始まる 33 文字）が **userId** です。送信先の指定には userId が必要で、LINE アプリの画面からは確認できません。詳しくは[ユーザー ID リファレンス](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)を参照。

### タイムゾーンは `appsscript.json` で設定

`appsscript.json` の `timeZone` を `Asia/Tokyo` にしないと、GAS 内の `new Date()` が UTC 基準になり日付判定がズレます。マニフェストで指定するのが最も確実です。

### 無料プランの送信通数

LINE 公式アカウントの無料プランは月 200 通までで、`multicast` は「**宛先人数 × 送信回数**」で消費されます。複数メンバー × 毎日通知 × 複数種別だとすぐ上限に達するので、事前に試算しておくと安心です（[料金プラン](https://www.lycbiz.com/jp/service/line-official-account/plan/)）。

## まとめ

GAS と LINE Messaging API の組み合わせで、無料の範囲内で生活系の自動通知 Bot を作れます。

- 通知種別ごとに送信先メンバーを変えられる設計にすると使い勝手が良い
- 月次イベントは固定スケジュール定数の計算で十分（カレンダー連携不要）
- clasp でローカル開発できるのでエディタの補完が使えて快適

ロジックを差し替えるだけで「天気予報の通知」「ToDo リマインド」「在庫アラート」など、いろいろな用途に応用できます。

## 参照

### LINE Messaging API

- [Messaging API 概要](https://developers.line.biz/ja/docs/messaging-api/overview/)
- [Messaging API リファレンス（multicast）](https://developers.line.biz/ja/reference/messaging-api/#send-multicast-message)
- [メッセージタイプ一覧](https://developers.line.biz/ja/docs/messaging-api/message-types/)
- [チャンネルアクセストークン](https://developers.line.biz/ja/docs/basics/channel-access-token/)
- [ユーザー ID の取得方法](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)
- [LINE 公式アカウント 料金プラン](https://www.lycbiz.com/jp/service/line-official-account/plan/)

### Google Apps Script

- [Apps Script ドキュメント](https://developers.google.com/apps-script)
- [マニフェスト (`appsscript.json`)](https://developers.google.com/apps-script/manifest)
- [クロックトリガー](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers)
- [`UrlFetchApp` リファレンス](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)
- [`PropertiesService` リファレンス](https://developers.google.com/apps-script/reference/properties/properties-service)
- [`ScriptApp` リファレンス](https://developers.google.com/apps-script/reference/script/script-app)

### clasp

- [clasp GitHub リポジトリ](https://github.com/google/clasp)
- [clasp コマンド一覧](https://github.com/google/clasp#commands)
