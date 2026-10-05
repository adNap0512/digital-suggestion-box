# デジタル目安箱（PoC）仕様書

社内の困りごと・改善アイデア・相談を気軽に投稿し、対応状況を確認できる「デジタル目安箱」の PoC です。  
本 README は操作マニュアルではなく、**現在の実装仕様・構成・環境・公開方式・データ保存方式を整理する仕様書**として扱います。

---

## 1. 概要

### 目的

- 社内の困りごと・改善アイデア・相談を投稿できること
- 投稿一覧から内容や対応状況を確認できること
- 一般ユーザー画面と管理者画面を分離すること
- 保存先を UI から分離し、Repository 差し替えで永続化方式を変更できること
- AI 駆動開発の題材として、Goal / Rules / Skills / Test / STOP 条件を用いたループエンジニアリングを検証すること

### 現在の画面

| 区分 | 画面 | パス | 主な機能 |
|---|---|---|---|
| 一般 | トップ | `/` | サマリー、最近の投稿、各画面への導線 |
| 一般 | 投稿フォーム | `/post` | カテゴリ、匿名/記名、タイトル、本文、投稿 |
| 一般 | 投稿一覧・詳細 | `/list` | フィルタ、カード一覧、詳細、共感 |
| 管理者 | 投稿管理 | `/admin` | 投稿一覧、ステータス変更、回答、削除 |

### 現在の保存対象

| データ | 保存方式 | 状態 |
|---|---|---|
| 投稿作成 | Supabase / Web Storage | 永続化 |
| 投稿一覧取得 | Supabase / Web Storage | 永続化 |
| 投稿削除 | Supabase / Web Storage | 永続化 |
| 共感 | React Context のメモリ | リロードで消える |
| ステータス変更 | React Context のメモリ | リロードで消える |
| 管理者回答 | React Context のメモリ | リロードで消える |
| 下書き | localStorage の別キー | 保存のみ。自動復元は未実装 |
| 添付 | UI のみ | 保存未実装 |

> **注意:** `/admin` は画面上の導線を分けているだけで、管理者認証は未実装です。

---

## 2. 実装方針

### 基本方針

UI から保存先を直接参照せず、`SuggestionRepository` を境界としてデータアクセスを分離します。

```txt
React UI
  ↓
SuggestionsContext
  ↓
SuggestionRepository
  ├─ PersistentSuggestionRepository → Web Storage
  └─ SupabaseSuggestionRepository
       ↓
     SuggestionsRemoteClient
       ↓
     SupabaseSuggestionsRemoteClient
       ↓
     Supabase
```

### Repository 契約

現在の主な契約は次の3つです。

```ts
interface SuggestionRepository {
  list(): Promise<Suggestion[]>
  create(input: DraftForm): Promise<Suggestion>
  delete(id: string): Promise<void>
}
```

### 依存方向

- pages / components は Supabase SDK を直接呼ばない
- `SuggestionsContext` は Supabase SDK に依存しない
- Supabase 固有処理は Repository / RemoteClient 側へ閉じ込める
- 環境変数が揃った場合だけ Supabase を利用し、それ以外は Persistent / Web Storage にフォールバックする
- 管理者画面の削除も Repository 経由とし、UI から DB を直接操作しない

### 一般画面と管理者画面

```txt
一般ユーザー
/        トップ
/post    投稿
/list    投稿一覧・詳細・共感

管理者
/admin   投稿管理
         ├─ ステータス変更
         ├─ 管理者回答
         └─ 投稿削除
```

一般ユーザー用 `/list` には管理者操作を出さず、管理操作は `/admin` に集約しています。

### 管理者機能の制約

- 管理者認証は未実装
- `/admin` の URL を知っている利用者は画面を開ける
- Supabase では PoC として `anon` に DELETE を許可
- 公開 URL を知る人は技術的に投稿削除が可能
- 本番利用時は認証・認可・管理者権限の実装が必須

---

## 3. 環境

### フロントエンド

| 項目 | 内容 |
|---|---|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Test | Vitest |
| Router | React Router / HashRouter |
| Package Manager | npm |
| Node 実行 | ローカル開発・GitHub Actions |

### 主な開発コマンド

PowerShell:

```powershell
cd C:\Users\kyuu0\OneDrive\Desktop\Cursor\EFU_GW\EFUPF\digital-suggestion-box

npm.cmd install
npm.cmd run dev
npm.cmd test -- --run
npm.cmd run test:coverage
npm.cmd run build
```

### 環境変数

ローカル Supabase 接続では `.env.local` に次の2つだけ設定します。

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

フロントでは以下を使用しません。

- `service_role`
- Secret Key
- DB password

`.env.local` は Git 管理しません。

テストでは `.env.test` を利用し、単体テストが実 Supabase DB に接続しない構成にしています。

### テスト / 品質ゲート

- `npm test -- --run`
- `npm run build`
- カバレッジ閾値: 80%

管理者画面・削除機能追加後の確認時点では **17ファイル / 81テスト成功**、build 成功です。

---

## 4. Cloudflare Workers

Cloudflare Workers を**公開の本線**として利用しています。  
Workers は API サーバとしてではなく、Vite の `dist` を配信する静的ホスティング用途です。

### 公開 URL

| 画面 | URL |
|---|---|
| トップ | https://digital-suggestion-box.kyuu0512.workers.dev/#/ |
| 投稿フォーム | https://digital-suggestion-box.kyuu0512.workers.dev/#/post |
| 投稿一覧 | https://digital-suggestion-box.kyuu0512.workers.dev/#/list |
| 管理者画面（認証なし） | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin |

### デプロイ構成

```txt
GitHub main
  ↓ push
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

使用ファイル:

- `wrangler.toml`
- `.github/workflows/deploy.yml`

### Cloudflare Workers の役割

- Vite で生成した `dist` を静的配信
- SPA fallback
- `HashRouter` を利用して `/#/...` 形式で画面遷移
- API Worker としてのバックエンド処理は実装していない

### GitHub Secrets

| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers デプロイ権限 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |

### GitHub Pages

GitHub Pages は確認用として残しています。

https://adnap0512.github.io/digital-suggestion-box/#/

Workers が本線、Pages は補助的な確認用途です。

---

## 5. Supabase

Supabase Free を外部 DB として利用しています。

### 用途

- 投稿一覧取得
- 投稿作成
- 投稿削除

### 接続構成

```txt
React UI
  ↓
SuggestionsContext
  ↓
createDefaultSuggestionRepository()
  ↓
SupabaseSuggestionRepository
  ↓
SuggestionsRemoteClient
  ↓
SupabaseSuggestionsRemoteClient
  ↓
@supabase/supabase-js
  ↓
Supabase Free
```

### Project

| 項目 | 内容 |
|---|---|
| Project | `digital-suggestion-box-goal-c` |
| Region | Northeast Asia (Tokyo) |
| Plan | Free |
| 接続方式 | Project URL + Publishable Key |
| フロントで使用しないもの | service_role / Secret / DB password |

Project ID・Key・DB password などの実値は README に記載しません。

### `suggestions` テーブル

Goal C で作成した最小テーブルを使用します。

主な列:

| 列 | 用途 |
|---|---|
| `id` | 投稿 ID |
| `title` | タイトル |
| `body` | 本文 |
| `category` | カテゴリ |
| `is_anonymous` | 匿名フラグ |
| `author_name` | 投稿者名 |
| `created_at` | 作成日時 |

UI 用の `status` / `empathyCount` / `hasResponse` / `response` / `isMine` は、現在すべてを DB 永続化しているわけではありません。

### Migration

主な migration:

```txt
supabase/migrations/
├─ 20260908145100_create_suggestions.sql
└─ 20261005190000_allow_anon_delete_suggestions.sql
```

- `20260908145100_create_suggestions.sql`
  - `suggestions` テーブル作成
  - RLS 有効化
  - anon の SELECT / INSERT

- `20261005190000_allow_anon_delete_suggestions.sql`
  - 管理者画面 PoC 用に anon DELETE を許可

### RLS / セキュリティ

現在は PoC のため、

```txt
anon
├─ SELECT
├─ INSERT
└─ DELETE
```

を許可しています。

管理者認証は未実装なので、公開 URL の利用者は技術的に DELETE を実行できます。  
**本番環境ではこの構成を使用せず、認証・認可・管理者ロールに基づく RLS へ変更する必要があります。**

### Supabase で現在永続化していないもの

- 共感
- ステータス変更
- 管理者回答
- 添付
- 本格ユーザー認証 / 管理者権限

---

## 6. 開発・AI駆動開発の構成

このプロジェクトでは、AI にコードを書かせるだけでなく、Goal / Rules / Skills / Test / STOP 条件を使って開発手順を制御しています。

主なファイル:

```txt
GOAL.md
progress.md
DESIGN.md
.cursor/rules/
.claude/skills/
docs/learning/
```

ループエンジニアリングでは、1回の起動を1イテレーションとして、

```txt
現状把握
  ↓
次の最小作業を判断
  ↓
テスト
  ↓
実装
  ↓
test / build
  ↓
progress.md 更新
  ↓
STOP
```

の流れで進めています。

---

## 7. 現在の位置づけ

このシステムは PoC です。

現在できていること:

- 4画面の公開
- 一般ユーザー / 管理者画面の分離
- Repository 境界
- Web Storage 永続化
- Supabase 実 DB への list / create / delete
- Cloudflare Workers 公開
- 自動 test / build / deploy
- 管理者画面からの投稿削除

現在まだ PoC / 未完成なこと:

- 本格認証
- 管理者権限
- 共感の DB 永続化
- ステータス変更の DB 永続化
- 管理者回答の DB 永続化
- 添付保存
- 共通 PF API 連携

---

## 8. 関連資料

| 資料 | 用途 |
|---|---|
| `README.md` | 現在の実装仕様・環境・公開構成 |
| `DESIGN.md` | UI / デザイン方針 |
| `GOAL.md` | Loop Engineering の Goal / Acceptance Criteria |
| `progress.md` | ループの現在状態 |
| `Report.md` | 発表・実施経緯 |
| `docs/directory-structure.md` | ディレクトリ構成 |
| `docs/learning/` | ループエンジニアリング等の学習資料 |
| `docs/デジタル目安箱_操作マニュアル.docx` | 利用者向け操作マニュアル |
