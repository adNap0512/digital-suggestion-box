# GOAL.md — ループエンジニアリング実験

このファイルはループの完成条件である。実験中は原則として変更しない。  
GOAL の変更が必要になった場合は実装を止め、人間へ判断を返す。

---

## 実験目的

バックエンド機能を多く完成させることではない。

AI が次のループを自分で回せるかを検証する。

```txt
現状把握
  → 次の作業判断
  → テスト
  → 最小実装
  → 自動検証
  → 修正
  → 状態記録
```

1 起動は 1 イテレーションとする。Skill が無制限に周を続けない。

本ファイルに **backend PoC / loop-engineering 実験** を明示している。  
この明示があるあいだだけ、`.cursor/rules/backend-poc-rule.mdc` に従い、**本ファイルで定義した範囲** のバックエンド関連実装を許可する。  
通常時（本実験の記載が無い、または実験終了後）は、従来どおりバックエンド禁止である。

---

## 依存方向（固定）

```txt
React UI（pages / components）
  ↓
SuggestionsContext（画面用の状態。保存方式は知らない）
  ↓
SuggestionRepository / SuggestionService（契約）
  ↓
保存アダプタ（Goal A: Memory / Goal B: Web Storage / Goal C: Supabase Repository）
  ↓
将来は HTTP / 共通PF API → DB / 認証（React から直接触らない）
```

- pages / components は保存実装を import しない
- SuggestionsContext は特定 DB 製品に依存しない
- React に DB クライアントを置かない
- 保存方式の追加は Repository 実装の差し替えで行う

---

## Goal A（達成済み）

最初のゴール。永続 DB は導入しない。Iteration 2 で達成。

### 受け入れ条件

- [x] 投稿一覧取得（list）が Repository 境界を経由する
- [x] 投稿作成（create）が Repository 境界を経由する
- [x] pages / components は保存実装を import しない
- [x] SuggestionsContext は特定 DB 製品に依存しない
- [x] Memory 実装を使い、既存 UI 動作を維持する
- [x] 既存テストを壊さない
- [x] 必要な Repository 契約テストを追加する
- [x] `npm test -- --run` が成功する
- [x] `npm run build` が成功する

### Goal A でやること

- Repository（または同等の Service）契約の導入
- Memory 実装
- Context から list / create を境界経由にする
- 契約テストの追加

### Goal A でやらないこと

- 永続 DB の導入
- HTTP API サーバの新規作成
- 特定 DB 製品（Supabase 等）の採用
- 共感・ステータス・回答の API 化

---

## Goal B（達成済み）

既存の UI / SuggestionsContext / Repository 契約（`list` / `create`）を維持したまま、Repository 実装の差し替えで投稿を永続化できることを検証する。

保存技術は Goal に固定しない。PoC の保存口は Web Storage。将来は共通 PF API へ差し替える。Iteration 5 で達成。

### 受け入れ条件

- [x] Repository 実装を永続化可能なものへ差し替える
- [x] create した投稿を、再生成した Repository インスタンスから list できる
- [x] 特定 DB 製品名を Goal に固定しない
- [x] 共通 PF への差し替え可能性を維持する（React から DB 直結しない）
- [x] `npm test -- --run` が成功する
- [x] `npm run build` が成功する

### Goal B でやること

- 永続化できる Repository 実装を追加する（保存先は人間が承認したもの）
- Context のデフォルト（または注入）をその実装へ差し替える
- 「インスタンスを再生成しても list できる」契約テストを追加する

### Goal B でやらないこと

- 認証・添付・共感 API・ステータス API・回答 API
- UI の大幅変更
- React から特定 DB クライアントへの直結
- 共通 PF 本体の構築
- 保存製品を Goal 文面に固定すること

---

## Goal C（現在のゴール）

Supabase Free を外部 DB として使い、既存の `SuggestionRepository`（`list` / `create`）を維持したまま、投稿の一覧取得と新規作成を Supabase へ保存・取得できることを検証する。

確認したいのは「Supabase を使えること」だけではない。  
**外部 DB を入れても、UI / Context を製品へ直結せず、Repository 差し替えで接続できるか** を見る。

Goal C は共通 PF 構成ではない。将来は HTTP / 共通 PF API 用 Repository へ差し替える。

```txt
React UI
  ↓
SuggestionsContext（Supabase を import しない）
  ↓
SuggestionRepository（既存契約）
  ↓
SupabaseSuggestionRepository
  ↓
Supabase（Free。人間が用意したプロジェクト）
```

### 受け入れ条件

- [ ] Supabase Free のプロジェクトを利用する（人間が作成。AI はアカウント作成しない）
- [ ] 投稿用の最小テーブルを用意する
- [ ] `SuggestionRepository` の既存契約（`list` / `create`）を維持する
- [ ] Supabase 用 Repository 実装を追加する
- [ ] `list()` で Supabase から投稿一覧を取得できる
- [ ] `create()` で Supabase へ投稿を保存できる
- [ ] pages / components は Supabase を import しない
- [ ] `SuggestionsContext` は Supabase を import しない
- [ ] UI の大幅変更をしない
- [ ] 既存テストを壊さない
- [ ] Supabase Repository に必要なテストを追加する
- [ ] `npm test -- --run` が成功する
- [ ] `npm run build` が成功する

### Goal C でやること

- 最小テーブルと、list / create に必要な列の整理
- `SupabaseSuggestionRepository`（契約は既存のまま）
- 接続設定（環境変数）。Secret はコミットしない
- Context へは Repository 注入または工場関数で差し替え（Context は製品 API を知らない）
- 契約テスト（実 Key なしで通る形を優先。結合が必要なら人間の環境に依存することを明示して STOP）

### Goal C でやらないこと

- 本格認証
- 添付ファイル
- 共感・ステータス・管理者回答の DB 永続化
- 管理者権限
- Realtime
- 共通 PF API 本体
- 大規模リファクタリング / UI リニューアル
- 有料プラン前提の機能
- React UI / pages / Context から `supabase.from(...)` すること

### TypeScript 型と DB（1対1にコピーしない）

`Suggestion` は UI 用。列に全部載せる必要はない。

| 値 | Goal C の扱い |
|----|----------------|
| title, body, category | DB に保存する |
| isAnonymous, authorName | DB に保存する（匿名時は名前を空） |
| id, createdAt | DB 側で持つのが自然。契約の `string` に写す |
| status, empathyCount, hasResponse, response | 今回の create 対象外。list で返すならアダプタが初期値を埋めるか、列は最小のデフォルトのみ。更新 API は作らない |
| **isMine** | **DB に保存しない。** UI 判定。認証後はユーザー比較で算出する。Goal C は認証しないので list では `false` などで埋めてよい |

### Goal C 固有の STOP（実装せず人間へ返す）

- Supabase プロジェクト / アカウント操作が必要
- URL / API Key / Secret の発行・入力が必要
- RLS や anonymous access の方針が未決
- 本番へ影響する操作、課金の可能性がある操作
- 共通 PF 仕様が必要
- pages / Context を製品依存にしないと進まない、と判断した場合

Secret をリポジトリに置かない。公開 DB へ無制限アクセスする設計にはしない。RLS の決め方が必要なら実装を止める。

---

## 対象外（Goal A / B / C 共通）

- 本格認証
- 添付ファイル
- 管理者権限の完成
- 共感 API 化
- ステータス API 化
- 回答 API 化
- UI の大幅変更
- 大規模リファクタリング

---

## 機械的な成功判定

毎イテレーションの必須ゲート:

1. `npm test -- --run`
2. `npm run build`

追加判定:

- Goal A: 既存画面テストが維持され、list / create の Repository 契約テストがある
- Goal B: 契約テストで「Repository 再生成後も list できる」こと。ブラウザリロードは手動デモであり、ループの pass/fail にはしない
- Goal C: pages / Context が Supabase を import せず、list / create が Repository 経由で外部 DB とやり取りできること。実プロジェクトが無い周は結合を無理に通さず STOP

カバレッジ閾値（`vite.config.ts` の 80%）を下げる変更はしない。

---

## 実験の終了

- Goal A / B は達成済み
- Goal C の受け入れ条件をすべて満たしたら、Goal C は達成とする
- 実験を終えたら、本ファイルの実験明示を外し、通常のバックエンド禁止へ戻す
