---
name: loop-engineering
description: デジタル目安箱の backend PoC でループエンジニアリングを1イテレーション実行する。GOAL.md と progress.md を読み、最小作業を1つだけテスト先行で進め、npm test と npm run build で検証し、progress.md を更新する。Use when the user starts /loop-engineering or asks to run a loop-engineering iteration.
disable-model-invocation: true
---

# Loop Engineering Skill

## 目的

機能を一気に完成させない。次のループを 1 周だけ回し、状態を `progress.md` に残して止まる。

```txt
現状把握 → 次の作業判断 → テスト → 最小実装 → 自動検証 → 修正 → 状態記録
```

## 起動

利用者が明示的に `/loop-engineering` で開始する。  
AI による自動起動は無効（`disable-model-invocation: true`）。

**1 起動 = 1 イテレーション。** 検証成功後に次の周を自動では始めない。

## 手順

1. `GOAL.md` を読む。実験明示と現在の Goal・対象外を確認する
2. `progress.md` を読む。Iteration / Current State / Next Task / Problems を確認する
3. Goal 達成済みか判定する
   - 達成済みなら実装せず、`progress.md` に Stop Reason を書いて人間へ返す
4. 未達なら、次の最小作業を **1 つだけ** 決める（`progress.md` の Next Task を候補にする）
5. その作業に必要なテストを先に作成する
6. テストを通す最小実装をする。範囲外のリファクタリングをしない
7. `npm test -- --run` を実行する
8. `npm run build` を実行する
9. 失敗なら原因を分析して修正し、7 と 8 をやり直す。通るまで次の作業へ進まない
10. `progress.md` を更新する（Iteration を +1、Completed / Current State / Next Task / Verification / Findings / Problems / Stop Reason）
11. STOP するか、次候補を Next Task に書いて終了する。続けてイテレーション 2 を始めない

## 作業中に守ること

- `.cursor/rules/backend-poc-rule.mdc` と `GOAL.md` の範囲外を実装しない
- Goal A 中は永続 DB・HTTP API・特定 DB 製品を入れない
- pages / components に保存実装を置かない
- 既存 UI を大きく変えない
- 既存テストを壊したまま終えない

## STOP 条件

次に当てはまる場合は実装を止め、理由を `progress.md` の Stop Reason と人間への返答に書く。

- GOAL 変更が必要
- アーキテクチャ上の大きな判断が必要
- 外部サービス作成が必要
- Secret / 認証情報が必要
- 共通 PF 仕様が必要
- 既存 UI を大きく変更する必要がある
- テスト失敗の原因が特定できない
- 同じ失敗を繰り返している
- Goal 達成

判断待ちのまま推測で実装しない。

## 検証コマンド

```powershell
npm.cmd test -- --run
npm.cmd run build
```

Unix 系では `npm test -- --run` と `npm run build`。

## progress.md の更新

見出しは維持する。

- Current Goal
- Iteration
- Completed
- Current State
- Next Task
- Verification
- Findings
- Decisions
- Problems
- Stop Reason

Stop Reason の例: 「イテレーション完了。次は人間が /loop-engineering を起動する」「Goal A 達成」「Secret が必要なため停止」
