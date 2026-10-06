# デジタル目安箱 PoC 実施内容レポート

グループ会発表用（約10分）。  
全文読み上げ用ではなく、画面を見せながら話す発表者用メモ。

---

## 1. 今回の到達点

今回の到達点は、デジタル目安箱を独立して利用できる PoC として完成度を上げ、共通 PF からリンクすれば利用できる状態まで持っていったこと。

主な成果:

- Supabase 実 DB との接続を完了
- Repository 経由で list → create → 再 list を確認
- Goal C を達成
- 一般ユーザー画面と管理者画面を分離
- 管理者画面から投稿削除を追加
- `SuggestionRepository` を list / create / delete に拡張
- Memory / Web Storage / Supabase の各実装で delete を実装
- Supabase 側に DELETE 用 migration を追加
- テストは 17ファイル / 81件すべて成功
- `npm run build` 成功
- 共通 PF は「各フロントをリンクで取りまとめる」方針を確認

現在は、共通 PF に公開 URL を載せれば利用できる手前まで来ている。

---

## 2. 現在の画面構成

```txt
一般ユーザー
/#/        トップ
/#/post    投稿
/#/list    投稿一覧・詳細・共感

管理者
/#/admin   投稿管理
```

管理者画面でできること:

- 投稿一覧
- ステータス変更
- 管理者回答
- 投稿削除

### 公開 URL

| 画面 | URL |
|------|-----|
| トップ | https://digital-suggestion-box.kyuu0512.workers.dev/#/ |
| 投稿フォーム | https://digital-suggestion-box.kyuu0512.workers.dev/#/post |
| 投稿一覧 | https://digital-suggestion-box.kyuu0512.workers.dev/#/list |
| 管理者画面 | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin |

管理者認証は未実装の PoC。URL を知っている利用者は管理者画面を開ける。

---

## 3. Supabase 実 DB との接続

Goal C では、既存の `SuggestionRepository` を維持したまま、保存先だけを Supabase に差し替えられるかを確認した。

実際に次を実施した。

```txt
Supabase Project
  ↓
migration 適用
  ↓
.env.local
  ├─ VITE_SUPABASE_URL
  └─ VITE_SUPABASE_PUBLISHABLE_KEY
  ↓
Repository 経由
  list
   ↓
  create
   ↓
  再 list
```

実疎通結果:

```txt
list       成功
create     成功
再 list    成功
```

大事なのは、UI から Supabase を直接呼んでいないこと。

```txt
React UI
  ↓
SuggestionsContext
  ↓
SuggestionRepository
  ↓
SupabaseSuggestionRepository
  ↓
SuggestionsRemoteClient
  ↓
SupabaseSuggestionsRemoteClient
  ↓
Supabase
```

pages / Context は Supabase SDK に依存していない。

---

## 4. Repository の拡張

現在の契約:

```ts
interface SuggestionRepository {
  list(): Promise<Suggestion[]>
  create(input: DraftForm): Promise<Suggestion>
  delete(id: string): Promise<void>
}
```

`delete()` は以下すべてで実装している。

- Memory
- Web Storage
- Supabase

そのため、管理者画面からの削除も UI から DB を直接操作せず、Repository 経由で処理する。

```txt
AdminListPage
  ↓
SuggestionsContext
  ↓
SuggestionRepository.delete(id)
  ↓
各保存実装
```

---

## 5. 管理者画面の分離

管理操作を `/admin` に分けた。

```txt
一般ユーザー
  /list
    ├─ 一覧
    ├─ 詳細
    └─ 共感

管理者
  /admin
    ├─ 投稿一覧
    ├─ ステータス変更
    ├─ 管理者回答
    └─ 投稿削除
```

削除時は確認ダイアログを出し、成功した場合だけ一覧から除外する。

### 現在の制約

- 管理者認証は未実装
- ステータス変更はメモリ上
- 管理者回答はメモリ上
- 共感もメモリ上
- 投稿削除は Repository 経由で保存先に反映

---

## 6. Supabase の RLS / DELETE

追加 migration:

```txt
supabase/migrations/
├─ 20260908145100_create_suggestions.sql
└─ 20261005190000_allow_anon_delete_suggestions.sql
```

現在の PoC では、匿名利用者 anon に以下を許可している。

```txt
anon
├─ SELECT
├─ INSERT
└─ DELETE
```

これは本番向けの権限設計ではない。

管理者認証が無いため、公開 URL を知っている利用者は技術的には投稿を削除できる。  
本番化する場合は、認証・認可・管理者ロールに基づく RLS が必要。

---

## 7. Cloudflare Workers

公開の本線は Cloudflare Workers。

役割は API サーバではなく、Vite で生成した `dist` の静的配信。

```txt
GitHub main
  ↓
GitHub Actions
  ↓
npm test -- --run
  ↓
npm run build
  ↓
wrangler deploy
  ↓
Cloudflare Workers
```

ルーティングは HashRouter を使用。

```txt
/#/
/#/post
/#/list
/#/admin
```

---

## 8. テスト

管理者画面・削除・`Repository.delete` を追加したうえで、

```txt
17ファイル
81テスト
すべて成功
```

`npm run build` も成功。

品質判定は引き続き、

```txt
npm test -- --run
npm run build
```

を機械的なゲートとしている。

---

## 9. AI 駆動開発で今回確認できたこと

今回も、AI に全部任せたわけではない。

Supabase 接続では、

```txt
Project Resume
  ↓
CLI login / link
  ↓
migration dry-run
  ↓
人間確認
  ↓
migration push
  ↓
実 DB 疎通
```

のように、外部サービス・認証・DB変更では人間が判断してから進めた。

### 今回の学び

- Repository 境界を先に作っていたため、Supabase への差し替えでも UI / Context を大きく変えずに済んだ
- 外部サービスや認証は、AI が勝手に進めず人間へ戻す方が安全
- dry-run → 人間確認 → 実行 の流れがクラウド操作でも有効だった
- 機能追加後もテスト件数を増やしながら品質ゲートを維持できた
- 要求が変わったときは、不要な実装を止めることも重要

---

## 10. 共通 PF との関係

現在確認できているグループ方針:

> フロントは各自で作成し、共通 PF ではリンクで取りまとめる。  
> バックエンドと DB も各自で作ってよい。

そのため、現在の構成で十分。

```txt
共通 PF
  ↓ リンク
デジタル目安箱
  ↓
Cloudflare Workers
  ↓
Supabase
```

当初検討していた「共通 PF API へ接続する Adapter」は、現時点では不要。

作れるから作るのではなく、最新の要求を確認して不要な実装を止めた。

現在は、共通 PF にこのアプリの公開 URL を掲載すれば利用できる状態。

---

## 11. 現在地

```txt
Goal A   Repository 境界           達成
Goal B   Web Storage               達成
Goal C   Supabase 実 DB            達成

追加対応
  一般 / 管理者画面分離            達成
  投稿削除                         達成
  Repository.delete                達成
  Supabase DELETE                  達成
  17ファイル / 81テスト            成功
  build                            成功

共通 PF
  リンク連携方針                   確認済み
  URL掲載                          実装手前
```

---

## 12. デモの流れ

発表では機能を全部触らず、次の順で短く見せる。

1. トップ
2. 投稿フォームから1件投稿
3. 一覧で投稿を確認
4. `/admin` を開く
5. 管理者画面の注意書き、ステータス、回答、削除ボタンを見せる
6. Repository / Supabase の構成図を見せる
7. テスト 81 件成功を見せる
8. 共通 PF はリンク連携方針になったことを説明

削除デモをする場合は、消してよいテスト投稿だけを使う。

---

## 13. まとめ

今回の成果は、単に Supabase を使ったことではない。

UI / Context を DB 製品へ直結せず、Repository 境界を維持したまま、実 DB との接続・投稿作成・一覧取得・削除まで通せた。

さらに、一般ユーザーと管理者の画面を分離し、管理者操作を `/admin` にまとめた。

AI 駆動開発では、Goal・制約・テスト・STOP 条件を置き、

- AI が判断して進むところ
- 人間が承認するところ
- 不要なら作らないところ

を分けて進めた。

現在は、共通 PF からリンクすれば利用できる独立 PoC として、掲載直前の状態。

---

## 14. 発表チェックリスト

- [ ] Cloudflare Workers の公開版が最新か確認
- [ ] `/#/admin` が公開版で表示されることを確認
- [ ] 投稿作成 → 一覧反映を確認
- [ ] 削除デモ用のテスト投稿を用意
- [ ] 「管理者認証は未実装」と必ず言う
- [ ] 共感・ステータス・回答はまだメモリ上と説明
- [ ] Secret / Key / DB password の実値を見せない
- [ ] 共通 PF は API 接続ではなくリンク連携方針と説明
- [ ] 「本番システム完成」とは言わない
