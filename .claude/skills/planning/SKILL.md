---
name: planning
description: デジタル目安箱の実装前に、画面・コンポーネント・データ・テスト・手順の計画を作成する
disable-model-invocation: true
---

# Planning Skill

## 目的

実装を始める前に、計画だけを整理する。まだコードは書かない。

## 出力する順番

1. 画面構成案
2. コンポーネント構成案
3. データ構造案
4. テスト観点
5. 実装手順

## 制約

- まだ実装しない
- DESIGN.md を参照する
- `.cursor/rules` の内容を守る
- バックエンドは作らない（今回のモック範囲）
- ダミーデータで成立するモックにする
- TDD を意識した手順にする

## 起動について

利用者が明示的に `/planning` で開始する想定。
AI による自動起動は無効（`disable-model-invocation: true`）。
