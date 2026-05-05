---
description: 新しいブログ記事を src/posts/ 配下に作成する
argument-hint: <テーマや要件をフリーテキストで>
---

`.claude/skills/blog-writing/SKILL.md` のルールに従って `src/posts/<slug>.md` を新規作成する。

入力テーマ: $ARGUMENTS

手順:

1. SKILL.md を読み込み、規約・テンプレ・チェックリストを把握する
2. テーマから「解説型」と「手順記事型」のどちらが適切かを判定して 1 文で宣言する
3. 該当テンプレ (`.claude/skills/blog-writing/templates/concept.md` または `tutorial.md`) を読み込む
4. ファイル名 slug を決める。SKILL.md の「ファイル名 slug の決め方」に従い、既存記事 (`src/posts/*.md`) のプレフィックスと揃える
5. 既存記事のタグ語彙を `src/posts/*.md` のフロントマターから走査し、近いものを再利用する。新規語彙が必要なら理由をコメントで添える
6. テンプレを骨格に本文を書く。frontmatter は 4 項目固定、`date` は今日、初稿時点では `draft: true` を入れる
7. `## まとめ` と `## 参照` を必ず書く。`## 参照` には公式サイト・公式ドキュメント・公式 GitHub を中心に最低 3 件
8. 書き終えたら SKILL.md の「添削チェックリスト」を自分で 1 周してから出力する
