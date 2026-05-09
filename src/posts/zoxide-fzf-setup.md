---
title: zoxide と fzf でターミナルのディレクトリ移動を高速化する
description: zoxide と fzf を組み合わせると、cd を打たなくてもよく使うディレクトリへ瞬時に移動できる。インストールから zsh への組み込み、日常的な使い方までを解説します。
date: 2026-05-09
tags:
  - zoxide
  - fzf
  - shell
---

ターミナルで `cd ../../foo/bar` のようなパスを毎日打つのは地味に消耗します。`zoxide` は履歴ベースで「よく使うディレクトリ」を学習し、`z foo` のような短い入力で目的地へジャンプできる `cd` の置き換えツールです。さらに `fzf` を組み合わせると、候補が複数あるときに対話的に絞り込めます。

ここでは macOS の zsh 環境を前提に、`zoxide` と `fzf` をインストールしてシェルに組み込み、実際の使い方を整理します。

## zoxide とは

`zoxide` は Rust 製の "smarter cd" コマンドです。`cd` で訪れたディレクトリの履歴とアクセス頻度を記録し、`frecency` (frequency + recency) スコアの高いパスを優先して候補に出します。

主に使うコマンドは 2 つだけです。

```bash
z foo      # foo を含むディレクトリのうち、もっとも frecency が高い場所へ移動
zi         # インタラクティブモードで候補から選択 (fzf が必要)
```

たとえばこれまでに `~/works/dev/tech-blog` に頻繁にアクセスしていれば、どこからでも `z tech` だけでそこへ飛べます。フルパスを覚える必要がありません。

![zoxide の z コマンドで tech に絞って検索している画面](/posts/zoxide-fzf-setup/02-zoxide-zi-tech.png)

## fzf とは

`fzf` は汎用のあいまい検索フィルタです。標準入力で渡された候補から、対話的にインクリメンタル検索できます。

`zoxide` の `zi` コマンドや、後述の `Ctrl+R` (履歴検索)・`Ctrl+T` (ファイル選択) のように、他のツールから「候補を選ばせる UI」として呼び出されるのが典型的な使い方です。単独で使うこともできます。

```bash
ls | fzf            # ls の出力から 1 つ選ぶ
cat $(fzf)          # カレント以下のファイルを選んで cat
```

## インストール

macOS では Homebrew で両方とも入ります。

```bash
brew install zoxide fzf
```

`fzf` は標準ではキーバインドや補完を有効にしないので、付属のインストーラを 1 度だけ実行します。

```bash
$(brew --prefix)/opt/fzf/install
```

実行すると、`Ctrl+R` / `Ctrl+T` / `Alt+C` のキーバインドと、シェル補完を `~/.zshrc` に追記するか聞かれます。すべて `y` で問題ありません。

## zsh への組み込み

`zoxide` はシェル統合スクリプトを `init` サブコマンドで吐き出すので、`~/.zshrc` の末尾に評価式を追加します。

```bash
# ~/.zshrc
eval "$(zoxide init zsh)"
```

これで `z` と `zi` コマンドが使えるようになります。`cd` 自体を `zoxide` に置き換えたい場合は `--cmd cd` を付けて初期化します。

```bash
# cd を完全に zoxide に置き換える場合
eval "$(zoxide init --cmd cd zsh)"
```

`fzf` 側は前述のインストーラが `~/.fzf.zsh` を作り、`source ~/.fzf.zsh` を `~/.zshrc` に追記してくれます。手動で書く場合は次の通りです。

```bash
# ~/.zshrc
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
```

設定を反映するには新しいシェルを開くか `source ~/.zshrc` を実行します。

## 実際の使い方

### `z` でジャンプ

引数の部分一致で frecency 上位のディレクトリへ移動します。

```bash
z tech-blog        # ~/works/dev/tech-blog へ
z dev neta         # 複数キーワードで AND 絞り込み (~/works/dev/neta-trend)
z -                # 直前のディレクトリへ戻る (cd - 相当)
```

学習データは `zoxide query --list` で確認できます。

```bash
zoxide query --list --score
```

### `zi` で対話選択

候補が曖昧なときや、登録済みディレクトリ全体から選びたいときに使います。`fzf` の絞り込み UI が立ち上がります。

![zoxide の zi コマンドで fzf を使ってディレクトリを対話的に選択している画面](/posts/zoxide-fzf-setup/01-zoxide-zi-interactive.png)

左側にスコア付きの候補一覧、下にプレビュー (現在のディレクトリ配下) が出ます。タイプして絞り込み、`Enter` で確定します。

## 注意点

- `zoxide` はアクセス履歴を `~/Library/Application Support/zoxide/db.zo` (macOS のデフォルト保存先) に保存します。マシンを移行するときはこのファイルを持っていけば履歴を引き継げます
- 一度も `cd` で訪れていないディレクトリには `z` でジャンプできません。最初の 1 回は通常通り移動する必要があります
- `fzf` の `Ctrl+R` は zsh 標準の `Ctrl+R` (incremental-search) を上書きします。元の動作に戻したい場合は、`~/.zshrc` で `~/.fzf.zsh` を `source` した**あと**に `bindkey '^R' history-incremental-search-backward` を追記してキーバインドを上書きし直します
- `zoxide init --cmd cd` で `cd` を置き換えると、`cd /absolute/path` のように完全パスを渡したときの挙動も `zoxide` 経由になります。スクリプト内では普通の `cd` のほうが安全なので、対話シェル限定で有効にするのが無難です

## まとめ

| ツール / コマンド | 役割                                   | きっかけ                 |
| ----------------- | -------------------------------------- | ------------------------ |
| `z <keyword>`     | 履歴 frecency 上位のディレクトリへ移動 | `cd` の代わりに使う      |
| `zi`              | 候補から対話的に選択 (`fzf` 連携)      | 候補が複数ありそうなとき |

`cd` を全部置き換えるかどうかは好みですが、少なくとも `z` と `Ctrl+R` を入れておくだけでターミナルでの体感速度がはっきり変わります。両方とも依存が軽く、`~/.zshrc` を数行いじるだけで導入できるので、まだ入れていなければ試してみる価値があります。

## 参照

### zoxide

- [zoxide GitHub リポジトリ](https://github.com/ajeetdsouza/zoxide)
- [zoxide 設定ドキュメント (wiki)](https://github.com/ajeetdsouza/zoxide/wiki/Configuration)

### fzf

- [fzf 公式サイト](https://junegunn.github.io/fzf/)
- [fzf GitHub リポジトリ](https://github.com/junegunn/fzf)
- [fzf キーバインド・補完ドキュメント](https://github.com/junegunn/fzf/blob/master/README.md#key-bindings-for-command-line)
