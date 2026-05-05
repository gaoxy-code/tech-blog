---
title: Claude Code の Hooks 機能 — イベント駆動で自動化する
description: Claude Code の Hooks を使って、ツール呼び出しやファイル変更時に自動でコマンドを実行する方法を解説します。
date: 2026-04-28
tags:
  - claude-code
  - ai
---

Claude Code の **Hooks** は、特定のイベント（ファイル変更、コマンド実行など）が発生したときに、自動でシェルコマンドを実行する機能です。開発ワークフローの自動化に活用できます。

## 前提

- Claude Code がインストール済みであること
- `~/.claude/settings.json` または `.claude/settings.json` を編集できること
- Hook 内で実行するコマンド（Prettier・型チェッカー等）がプロジェクトに導入されていること

## Hooks とは

Hooks は「Claude Code がツールを呼び出すとき」や「ファイルを変更したとき」などのイベントに反応して、指定したコマンドを自動実行する仕組みです。

Git の pre-commit hook に似ていますが、Claude Code 固有のイベントに対応しています。

## 設定方法

`~/.claude/settings.json` または `.claude/settings.json` に Hooks を定義します。

```json
{
	"hooks": {
		"PreToolUse": [
			{
				"matcher": "Edit|Write",
				"hook": "echo 'ファイルを変更します'"
			}
		],
		"PostToolUse": [
			{
				"matcher": "Edit|Write",
				"hook": "pnpm lint --fix"
			}
		]
	}
}
```

## イベントの種類

| イベント       | タイミング               |
| -------------- | ------------------------ |
| `PreToolUse`   | ツール実行の前           |
| `PostToolUse`  | ツール実行の後           |
| `Notification` | 通知発生時               |
| `Stop`         | Claude Code の応答完了時 |

## 実用的な Hook の例

### 1. ファイル変更時に自動フォーマット

```json
{
	"hooks": {
		"PostToolUse": [
			{
				"matcher": "Edit|Write",
				"hook": "prettier --write $CLAUDE_FILE_PATH"
			}
		]
	}
}
```

Claude Code がファイルを編集・作成するたびに、Prettier で自動フォーマットされます。

### 2. ファイル変更時に型チェック

```json
{
	"hooks": {
		"PostToolUse": [
			{
				"matcher": "Edit|Write",
				"hook": "pnpm check 2>&1 | head -20"
			}
		]
	}
}
```

### 3. 特定のファイルの変更をブロック

```json
{
	"hooks": {
		"PreToolUse": [
			{
				"matcher": "Edit|Write",
				"hook": "if echo $CLAUDE_FILE_PATH | grep -q '.env'; then echo 'BLOCK: .env ファイルの変更は許可されていません' && exit 1; fi"
			}
		]
	}
}
```

`.env` ファイルの変更を防止します。Hook が非ゼロで終了すると、ツールの実行がブロックされます。

### 4. 応答完了時に通知

```json
{
	"hooks": {
		"Stop": [
			{
				"hook": "osascript -e 'display notification \"Claude Code の作業が完了しました\" with title \"Claude Code\"'"
			}
		]
	}
}
```

長いタスクの完了をデスクトップ通知で知らせます（macOS の場合）。

## matcher パターン

`matcher` にはツール名の正規表現を指定します。

```json
// Edit または Write ツールにマッチ
"matcher": "Edit|Write"

// Bash ツールにマッチ
"matcher": "Bash"

// すべてのツールにマッチ
"matcher": ".*"
```

## 環境変数

Hook のコマンド内では、以下の環境変数が使えます:

| 変数               | 説明                   |
| ------------------ | ---------------------- |
| `CLAUDE_FILE_PATH` | 操作対象のファイルパス |
| `CLAUDE_TOOL_NAME` | 実行されるツール名     |

## ブロックの仕組み

`PreToolUse` の Hook が以下の条件を満たすと、ツールの実行がブロックされます:

1. 終了コードが非ゼロ
2. stdout に `BLOCK:` で始まるメッセージがある

```bash
# ブロックする場合
echo "BLOCK: この操作は許可されていません" && exit 1

# ブロックしない場合（情報表示のみ）
echo "INFO: ファイルを変更します"
```

## 設定のスコープ

| ファイル                  | スコープ                     |
| ------------------------- | ---------------------------- |
| `~/.claude/settings.json` | グローバル（全プロジェクト） |
| `.claude/settings.json`   | プロジェクト固有             |

プロジェクト固有の Hook は、チームで共有できます（Git にコミット可能）。

## 注意点

- Hook のコマンドが長時間実行されると、Claude Code の応答が遅くなる
- エラーが発生した場合、Claude Code のフィードバックとして表示される
- Hook は同期的に実行される

## まとめ

- Hooks はイベント駆動で自動コマンドを実行する機能
- `PreToolUse` でツール実行前のチェック、`PostToolUse` で後処理
- ファイルの自動フォーマット、型チェック、変更のブロックなどに活用
- `settings.json` で設定し、プロジェクト単位で管理できる

## 参照

- [Claude Code Hooks ドキュメント](https://docs.anthropic.com/en/docs/claude-code/hooks)
