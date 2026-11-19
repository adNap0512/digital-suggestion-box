# progress.md — ループ状態

ループは毎回このファイルを更新する。次のイテレーションはここから現状を読む。

---

## Current Goal

Goal A / B / C は達成。Goal D の API 接続は未実装のまま残す。

2026-11-19 のグループ方針では、共通 PF は各自のフロントをリンクでまとめる。API 接続は作っていない。10/9 時点の「HTTP 接続を本線にする」という Goal D の本文は `GOAL.md` に残し、このファイルでは書き換えない。いま共通 PF リポジトリへは移さない。仕様の無い API は実装しない。

ループ外の現状（2026-11-19）:

- 管理者ログイン、未ログイン時の `/admin` 制御、詳細を選んだカードの近くに出す変更を実装済み
- 担当者確認として、本番 Supabase へ `20261021130000_secure_admin_suggestions.sql` を適用済み。管理者 1 人を名簿へ登録済み。`anon` の DELETE は撤回済み
- 公開 URL での管理者ログイン操作は、この更新時点では未確認

---

## Iteration

12（Goal C 達成周。Goal D の実装イテレーションはまだ始めていない）

2026-11-19 の管理者認証と詳細UIは、ループの次周ではなく、ループ外の整理として記録する。

---

## Completed

- Iteration 0: 調査とループ環境構築
- Iteration 1–2: Goal A
- Iteration 3–5: Goal B（Web Storage PoC）
- Iteration 6–7: Goal C 開始、STOP、migration 案、`.env.example`
- Iteration 8–10: Supabase Repository、SDK アダプタ、default factory
- Iteration 11: 実環境未準備のため実通信せず STOP
- ループ外: Free Organization / Project 作成、Resume、link、migration 適用（人間）
- Iteration 12: `.env.local`（URL / publishable key のみ）、Repository 経由の list / create / 再 list、test / build、Goal C 達成判定
- ループ外: 人間が Goal D 方針を確定（方式 A 本線 + 機能単位の移植余地）。`GOAL.md` に反映
- ループ外（2026-11-19）: 一覧切り替えは `f09d4d0`。詳細UI、管理者認証、本番SQL、引き継ぎ文書を追加。共通PFはリンク方針へ更新（Goal D 本文は残置）

---

## Current State

```txt
React UI
  ↓
SuggestionsContext（製品非依存。repository prop 優先 = 将来の注入口）
  ↓
createDefaultSuggestionRepository
  ├─ URL + publishable key あり → SupabaseSuggestionRepository → RemoteClient → SDK → Supabase
  └─ 未設定 / テスト（.env.test） → PersistentSuggestionRepository → Web Storage
```

Goal D で目指す依存（未実装。仕様が揃うまで Client の中身は足さない）:

```txt
App（このリポジトリを維持。機能内部から App / main を import しない）
  ↓
Suggestions feature
  ↓
SuggestionRepository（外部注入可能）
  ↓
CommonPF Client / Adapter
  ↓
共通PF API（方式 A の本線）
```

- Goal C の実疎通は完了。`.env.local` の値は本ファイルに書かない
- pages / Context は Supabase SDK を import しない
- 共通 PF の API / Auth / Router 仕様は未確定

---

## Next Task

Goal D の API 実装ループは始めない。グループ方針がリンク掲載のため、API Adapter は作らない。

残る確認は、公開URLでの管理者ログイン、ログアウト、削除、未ログイン時の拒否。共感・ステータス・回答の永続化は、要件が決まってから。

Goal D の実装ループは、人間が `/loop-engineering` 等で開始するまで始めない。

仕様が無いあいだの最小候補（やるなら 1 つだけ）:

- 機能単位の置き場所を確認し、`App` / `main` への新規依存を増やさないことだけ守る
- CommonPF Repository / Client の空の置き場は、仕様確定後

やらない: エンドポイント推測、共通 PF リポジトリへの移動、移植のためだけの大規模フォルダ移動

---

## Verification

| 項目 | 結果 |
|------|------|
| Goal A / B / C | 達成 |
| Goal D | **未達**（API 接続なし。現方針はリンク掲載） |
| 共通 PF 仕様 | API は未確定。接続コードは未着手 |
| 自動テスト（2026-11-19） | 23ファイル / 128件成功。本番ログインの確認は含まない |
| ビルド（2026-11-19） | `npm run build` 成功 |
| 本番 SQL | 担当者が適用済みと確認。この更新時の再接続はしていない |
| 公開環境 | 以前の Workers URL はある。認証を含む最新版の配信と、公開URLでの操作確認は未了 |

---

## Findings

- 既存の `repository` prop は方式 A / B の両方で注入口になる
- フォルダを今すぐ `src/features/suggestions/` へ全部移すのは「移植のためだけの大規模リファクタ」に当たりうる。Goal D では禁止に近い

---

## Decisions

- 本線は方式 A（独立リポ → HTTP → 共通 PF API）
- 方式 B の余地は残すが、今はフロント統合しない
- `SuggestionsContext` / `SuggestionRepository` 境界を維持する
- 共通 PF 接続は Client / Repository に閉じる
- API URL / 認証 / Router ベースパス / ユーザー情報は後から外部注入
- 仕様未確定のまま実装しない
- 2026-11-19: グループ方針は共通 PF からのリンク掲載。方式 A の HTTP 接続は未実装のまま残し、今は作らない

---

## Problems

- Goal D の API 接続は仕様待ちのまま未着手
- 共感、ステータス、回答、「自分の投稿」の再訪はデータベースに残らない
- 公開URLでの管理者操作は未確認

---

## Stop Reason

人間が Goal D 方針を `GOAL.md` に書いた。共通 PF 仕様が無いため接続実装はしない。次周は自動で開始しない。

2026-11-19 の追記: 連携方針はリンク掲載に更新済み。API 実装は始めない。育休前の残作業は、公開環境での管理者ログイン確認である。
