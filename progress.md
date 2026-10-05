# progress.md — ループ状態

ループは毎回このファイルを更新する。次のイテレーションはここから現状を読む。

---

## Current Goal

Goal D（未達）

本線は **別リポジトリのまま共通 PF API へ HTTP 接続**（方式 A）。  
加えて、将来フロントを共通 PF リポジトリへ統合（方式 B）しても、機能単位で移植できる境界を維持する。

いま共通 PF リポジトリへは移さない。共通 PF の仕様は推測して実装しない。

---

## Iteration

12（Goal C 達成周。Goal D の実装イテレーションはまだ始めていない）

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
| Goal D | **未達**（方針のみ。接続実装なし） |
| 共通 PF 仕様 | 未確定のため接続コードは未着手 |

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

---

## Problems

なし。Goal D は仕様待ち。

---

## Stop Reason

人間が Goal D 方針を `GOAL.md` に書いた。共通 PF 仕様が無いため接続実装はしない。次周は自動で開始しない。
