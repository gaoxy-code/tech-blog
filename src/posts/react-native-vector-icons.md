---
title: React Native でアイコンを使う — Vector Icons の選び方とビジュアル検索
description: react-native-vector-icons と @expo/vector-icons の基本的な使い方、そして公式ドキュメントだけでは見つけづらい「どんなアイコンが使えるか」を icons.expo.fyi などで直感的に探す方法を紹介します。
date: 2026-05-23
tags:
  - react-native
  - expo
---

React Native でアイコンを使う定番ライブラリ `react-native-vector-icons` (Expo 環境なら `@expo/vector-icons`) は、FontAwesome / Material Icons / Ionicons など主要なアイコンセットをまとめて提供してくれます。インストール自体は簡単ですが、いざ使い始めると **「どんなアイコンがあるのか、何という名前で呼び出せるのか」が公式ドキュメントからは追いづらい** という問題に直面します。

この記事では、Vector Icons の基本的な使い方と、アイコンをビジュアルに検索する方法をまとめます。

## react-native-vector-icons とは

`react-native-vector-icons` は、複数のアイコンフォントを React Native コンポーネントとして使えるようにするライブラリです。一般的に含まれる主要セットは次のとおりです。

| アイコンセット            | 特徴                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `MaterialIcons`           | Google の Material Design 標準アイコン。汎用性が高い       |
| `MaterialCommunityIcons`  | コミュニティ拡張版。アイコン数が圧倒的に多い (7000+)       |
| `Ionicons`                | iOS / Android で見た目が分かれる Ionic 製。OS ネイティブ風 |
| `FontAwesome` / `5` / `6` | Web でも定番。バージョンごとに別パッケージ                 |
| `Feather`                 | 線が細くミニマルなアイコン                                 |
| `AntDesign`               | Ant Design 由来。中華系 UI に馴染む                        |
| `Entypo` / `Octicons` 他  | 補助的なアイコンセット                                     |

Expo を使っている場合は `@expo/vector-icons` という薄いラッパーが同梱されていて、こちらも上記とほぼ同じセットを扱えます。

## インストールと基本的な使い方

### Expo の場合

新規プロジェクトでは `@expo/vector-icons` が最初から入っているため、追加インストールは不要です。

```tsx
import { MaterialIcons } from '@expo/vector-icons';

export function HomeButton() {
	return <MaterialIcons name="home" size={24} color="black" />;
}
```

セット名を `import` の名前で指定し、`name` プロパティでアイコン名を指定するのが基本形です。

### bare React Native の場合

`react-native-vector-icons` を直接インストールします。

```bash
npm install react-native-vector-icons
# iOS の場合は追加で
cd ios && pod install
```

使い方はセットごとの個別エントリポイントから import します。

```tsx
import Icon from 'react-native-vector-icons/MaterialIcons';

export function HomeButton() {
	return <Icon name="home" size={24} color="black" />;
}
```

`Icon` という名前は任意ですが、複数セットを混在させるときは `MaterialIcon` / `IoniconsIcon` のように区別できる名前にしておくと安全です。

## アイコンをビジュアルに探す

ここがこの記事の本題です。`name="home"` のような文字列を渡す API になっている都合で、**どんな名前のアイコンが存在するか覚えていないと使えません**。公式 README にはセット一覧しか載っておらず、各セットの中身は外部の検索サイトで探すのが現実的です。

### icons.expo.fyi — 横断検索の決定版

[icons.expo.fyi](https://icons.expo.fyi/) は Expo 公式が提供しているアイコンブラウザで、`@expo/vector-icons` に含まれる全セットを **1 つの検索ボックスから横断検索** できます。

- 検索バーに `arrow` などと入れると、各アイコンセットでヒットしたものが並ぶ
- アイコンをクリックすると `import` 文と JSX スニペットがコピーできる
- セット名でフィルタリングも可能

Expo 環境でない場合でも、`react-native-vector-icons` と `@expo/vector-icons` のアイコン名はほぼ揃っているため、検索ツールとして使えます。

### 各アイコンセットの公式カタログ

特定のセットに絞って探したい場合は、各ベンダーの公式カタログを直接見るのも有効です。

| セット                   | 公式カタログ                                            |
| ------------------------ | ------------------------------------------------------- |
| Material Icons           | [Google Fonts Icons](https://fonts.google.com/icons)    |
| Material Community Icons | [Pictogrammers](https://pictogrammers.com/library/mdi/) |
| FontAwesome              | [FontAwesome Icons](https://fontawesome.com/icons)      |
| Ionicons                 | [Ionicons](https://ionic.io/ionicons)                   |
| Feather                  | [Feather Icons](https://feathericons.com/)              |

Material Icons や FontAwesome は無償版と有償版で使えるアイコンが分かれるため、`react-native-vector-icons` に含まれるのは無償版相当のみという点には注意してください。

## どのセットを選ぶか

アイコン名の名前空間はセットごとに独立しているので、**プロジェクトで使うセットは 1〜2 個に絞る** のが鉄則です。混在しすぎるとデザインのトーンが揃わず、バンドルサイズも膨らみます。

- **iOS 寄りのデザイン**: `Ionicons` (iOS / Android で自動的に見た目が変わるバリエーションがある)
- **Material Design に寄せたい**: `MaterialIcons` + 不足分を `MaterialCommunityIcons` で補完
- **線が細いモダンな UI**: `Feather`
- **Web と統一したい**: 既に FontAwesome を使っているなら `FontAwesome6`

迷うなら `MaterialCommunityIcons` を選んでおくと、欲しいアイコンが見つからないという事態には陥りにくいです。

## まとめ

| やりたいこと                 | 取るべきアクション                                                       |
| ---------------------------- | ------------------------------------------------------------------------ |
| とりあえず使い始める         | Expo なら `@expo/vector-icons`、bare RN なら `react-native-vector-icons` |
| 使えるアイコンを横断検索する | [icons.expo.fyi](https://icons.expo.fyi/) で `name` を確定させる         |
| デザインを統一する           | 使用セットを 1〜2 個に絞る                                               |
| 細かい意匠を確認する         | 各セットの公式カタログ (Material Icons / FontAwesome / Ionicons など)    |

公式ドキュメントは「使い方の API リファレンス」、icons.expo.fyi は「アイコン名のカタログ」と役割を分けて使うと、Vector Icons との付き合いがぐっと楽になります。

## 参照

- [react-native-vector-icons GitHub](https://github.com/oblador/react-native-vector-icons)
- [react-native-vector-icons ドキュメント](https://oblador.github.io/react-native-vector-icons/)
- [@expo/vector-icons ドキュメント (Expo Icons ガイド)](https://docs.expo.dev/guides/icons/)
- [icons.expo.fyi (Expo 公式アイコンブラウザ)](https://icons.expo.fyi/)
- [Google Fonts Icons (Material Icons 公式カタログ)](https://fonts.google.com/icons)
- [Material Design Icons (Pictogrammers)](https://pictogrammers.com/library/mdi/)
- [FontAwesome 公式カタログ](https://fontawesome.com/icons)
- [Ionicons 公式カタログ](https://ionic.io/ionicons)
- [Feather Icons 公式サイト](https://feathericons.com/)
