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
| 一般 | 投稿フォーム | `/post` | カテゴリ、投稿者名（任意）、タイトル、本文、投稿 |
| 一般 | 投稿一覧・詳細 | `/list` | フィルタ、カード一覧、同一画面の詳細パネル、共感 |
| 管理者 | 管理者ログイン | `/admin/login` | Supabase Auth（未接続時は開発用仮ログイン） |
| 管理者 | 投稿管理 | `/admin` | 投稿一覧、ステータス変更、回答、削除。未ログイン時はログインへ |

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

> **注意:** 公開環境の管理者ログインは Supabase Auth と `suggestion_admins` による権限確認です。パスワードはソースにも公開JSにも置きません。手順は [docs/ADMIN_AUTH_SETUP.md](docs/ADMIN_AUTH_SETUP.md)。担当者の確認では、2026-11-19 時点で本番へ管理者認証用 SQL を適用済みです。公開URLでのログイン操作は、この文書の時点では未確認です。

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
/admin/login  Supabase Auth（ヘッダー右端。未接続時は開発用仮ログイン）
/admin        投稿管理（未ログインはログインへ）
              ├─ ステータス変更（画面内のみ）
              ├─ 管理者回答（画面内のみ）
              └─ 投稿削除（RLS で管理者のみ）
```

一般ユーザー用 `/list` には管理者操作を出さず、管理操作は `/admin` に集約しています。トップの「管理者画面」ボタンは置かず、導線はヘッダーに集めます。

### 管理者機能の制約

- 公開環境では Supabase Auth のセッションでログイン状態を持つ
- 管理者IDは `VITE_ADMIN_LOGIN_ID`、実際のサインインは対応メール（`VITE_ADMIN_AUTH_EMAIL`）
- パスワードは Auth 側で照合し、ソースへ埋め込まない
- 画面ガードに加えて、投稿 DELETE は RLS で管理者のみ
- 開発時に Supabase 未設定なら、従来の仮ログイン（`VITE_ADMIN_ID` / `VITE_ADMIN_PASSWORD`、DEV のみ）
- ステータス・回答・共感はまだ DB 永続化しない
- アカウント払い出し画面は作らない。Auth ユーザー作成はダッシュボードで行う

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

ローカルでは `.env.local` に次を設定します。値は Git に含めません。

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ADMIN_ID=...
VITE_ADMIN_PASSWORD=...
VITE_ADMIN_LOGIN_ID=...
VITE_ADMIN_AUTH_EMAIL=...
```

`VITE_ADMIN_ID` / `VITE_ADMIN_PASSWORD` は開発用仮ログインです。公開ビルドでは使いません。  
`VITE_ADMIN_LOGIN_ID` / `VITE_ADMIN_AUTH_EMAIL` は公開ビルドに含めてよい非秘密情報です。パスワードは入れません。

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

2026-11-19 の確認では **23ファイル / 128テスト成功**、`npm run build` 成功です。テストは偽物のクライアントを使い、本番 Supabase へのログイン確認は含みません。

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
| 管理者ログイン | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin/login |
| 管理者画面 | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin |

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
| `VITE_SUPABASE_URL` | 公開ビルドの Supabase URL（非秘密） |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 公開ビルドの publishable key（非秘密） |
| `VITE_ADMIN_LOGIN_ID` | 画面に出す管理者ID（非秘密） |
| `VITE_ADMIN_AUTH_EMAIL` | Auth サインイン用メール（非秘密。パスワードは置かない） |

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
├─ 20261005190000_allow_anon_delete_suggestions.sql
└─ 20261021130000_secure_admin_suggestions.sql
```

- `20260908145100_create_suggestions.sql`
  - `suggestions` テーブル作成
  - RLS 有効化
  - anon の SELECT / INSERT
- `20261005190000_allow_anon_delete_suggestions.sql`
  - 認証なし PoC の途中で、anon に DELETE を許可した記録
- `20261021130000_secure_admin_suggestions.sql`
  - anon の DELETE を撤回
  - 管理者名簿と、管理者だけ削除できるポリシーを追加

### RLS / セキュリティ

担当者が 2026-11-19 に確認した本番の状態は次のとおりです。この README の更新時に、データベースへ再接続してはいません。

```txt
anon
├─ SELECT
├─ INSERT
└─ DELETE は撤回済み

authenticated
└─ 削除は suggestion_admins に登録された管理者だけ
```

画面の `/admin` 制御はブラウザ上の案内です。実際に消せるかは、データベースの RLS（行単位のアクセスルール）で判定します。詳細は [docs/ADMIN_AUTH_SETUP.md](docs/ADMIN_AUTH_SETUP.md)。

### Supabase で現在永続化していないもの

- 共感
- ステータス変更
- 管理者回答
- 添付
- 「自分の投稿」の判定（`isMine`）。再読み込み後の Supabase 一覧では自分の投稿として戻らない
- 一般利用者ごとのログイン

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

- 投稿の作成、一覧、選択したカード近くの詳細表示
- 名前が空なら匿名、入力があれば記名
- URL の `mine=1` による「みんなの投稿 / 自分の投稿」の切り替え
- 一般画面と管理者画面の分離
- Repository 境界（Memory / Web Storage / Supabase）
- Supabase への投稿の取得・作成・削除
- 管理者ログイン（Supabase Auth。未接続の開発時だけ仮ログイン）
- 未ログインは `/admin` を開けない画面制御
- 管理者だけが削除できるデータベース権限（担当者が本番適用を確認）
- Cloudflare Workers への自動配信の仕組み
- 自動 test / build

現在まだ PoC / 未完成なこと:

- 一般利用者ごとのログイン
- 共感、ステータス、管理者回答の DB 永続化
- 添付の保存
- 再読み込み後も「自分の投稿」を復元すること
- 共通 PF の API 接続（方針はリンク掲載。接続コードは無い）
- 管理者認証を含む最新版を、公開 URL で人が操作して確認すること

---

## 8. 関連資料

| 資料 | 用途 |
|---|---|
| `README.md` | 現在の実装仕様・環境・公開構成 |
| `DESIGN.md` | UI / デザイン方針 |
| `docs/SCREEN_FLOW.md` | 画面一覧と遷移 |
| `GOAL.md` | Loop Engineering の Goal / Acceptance Criteria |
| `progress.md` | ループの現在状態 |
| `Report.md` | 発表・実施経緯 |
| `docs/directory-structure.md` | ディレクトリ構成 |
| `docs/learning/` | ループエンジニアリング等の学習資料 |
| `docs/デジタル目安箱_操作マニュアル.docx` | 利用者向け操作マニュアル |
| `docs/HANDOVER.md` | 育休中の引き継ぎ |
| `docs/ADMIN_AUTH_SETUP.md` | 管理者ログインの本番設定手順 |
