---
name: design-mock
description: デジタル目安箱のデザインモックを、DESIGN.md に沿って作成・改善する
---

# Design Mock Skill

## 目的

デジタル目安箱のローカルモックを、DESIGN.md に沿って作成・改善する。

## 参照するもの

- DESIGN.md
- README.md
- .cursor/rules/project-rule.mdc
- .cursor/rules/design-rule.mdc
- .cursor/rules/test-rule.mdc

## 作業手順

1. 対象画面を確認する
2. 必要なコンポーネントを確認する
3. ダミーデータ構造を確認する
4. テスト観点を先に整理する
5. 小さく実装する
6. テストを追加する
7. 表示崩れや文言を確認する
8. README / DESIGN.md に不足があれば追記する

## 品質基準

- 3 画面が確認できる
- 主要 UI が表示される
- フォーム入力ができる
- フィルタ切り替えができる
- 共感ボタンが動く
- 管理者向けのステータス変更 UI が見える
- テストカバレッジ 80% 以上を目指す

## 起動について

デザインモックの作成・改善が話題になったとき、AI が自動利用してもよい。
利用者が `/design-mock` で手動起動することもできる。
