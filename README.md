# デジタル目安箱（PoC）

社内の困りごと・改善アイデア・相談を気軽に投稿でき、対応状況も見える UI の PoC です。

▶ [公開デモ（Cloudflare Workers）](https://digital-suggestion-box.kyuu0512.workers.dev/#/)  
▶ [確認用（GitHub Pages）](https://adnap0512.github.io/digital-suggestion-box/#/)

## 概要

- 3 画面: トップ / 投稿フォーム / 投稿一覧・詳細
- 技術スタック: React + Vite + TypeScript + Vitest
- **本番バックエンド / DB / 共通 PF API は未実装**
- Repository 境界を追加済み（UI は保存実装を直接知らない）
- Web Storage を使った **永続化 PoC** を実装済み（Web Storage はバックエンドではない）
- 永続化対象: 投稿作成・投稿一覧取得（同一ブラウザならリロード後も残る）
- まだメモリ上: 共感・ステータス変更・管理者回答

詳細なディレクトリ構成は [docs/directory-structure.md](./docs/directory-structure.md) を参照してください。  
発表用の経緯は [Report.md](./Report.md)、ループの状態は [progress.md](./progress.md) / [GOAL.md](./GOAL.md) を参照してください。

## 現在の構成（永続化 PoC）

本番構成ではありません。Repository 差し替えの検証用です。

```txt
React UI
   ↓
SuggestionsContext
   ↓
SuggestionRepository
   ↓
PersistentSuggestionRepository
   ↓
KeyValueStorage
   ↓
Web Storage
```

将来は、同じ契約のまま差し替える想定です。

```txt
React UI
   ↓
SuggestionsContext
   ↓
SuggestionRepository
   ↓
HTTP / 共通PF API Repository
   ↓
共通PF
   ↓
DB / 認証
```

### データの扱い

| 状態 | 内容 |
|------|------|
| 永続化済み（Web Storage） | 投稿作成、投稿一覧取得 |
| メモリ上のみ | 共感、ステータス変更、管理者回答 |
| 未実装 | 本格認証、添付保存、管理者権限、共通 PF API、本番 DB |

下書き保存は投稿とは別キーで `localStorage` に書きます。画面を開き直したときの自動復元は未実装です。添付は UI のみです。

## 公開URL

会社の人へ送るのは **公開画面の URL** です。`dash.cloudflare.com` から始まる管理画面 URL は送りません。

公開サイトは `main` への push（Workers）または手動ワークフロー（Pages）で更新されます。ローカルの未 push 変更は公開 URL に出ません。

### 報告用（この3つをセットで）

```md
■ Cloudflare公開画面
https://digital-suggestion-box.kyuu0512.workers.dev/#/

■ GitHub Pages公開画面
https://adnap0512.github.io/digital-suggestion-box/#/

■ ソースコード・構成資料
https://github.com/adNap0512/digital-suggestion-box
```

### Cloudflare Workers（本線）

`main` への push でデプロイします（`wrangler.toml` + `.github/workflows/deploy.yml`）。

| 画面 | URL |
|------|-----|
| トップ | https://digital-suggestion-box.kyuu0512.workers.dev/#/ |
| 投稿フォーム | https://digital-suggestion-box.kyuu0512.workers.dev/#/post |
| 投稿一覧 | https://digital-suggestion-box.kyuu0512.workers.dev/#/list |

GitHub リポジトリの Secrets:

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン（Workers デプロイ権限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

### GitHub Pages（確認用）

- [トップ](https://adnap0512.github.io/digital-suggestion-box/#/)
- [投稿フォーム](https://adnap0512.github.io/digital-suggestion-box/#/post)
- [投稿一覧](https://adnap0512.github.io/digital-suggestion-box/#/list)

## 起動方法

PowerShell で実行する場合、環境によっては `npm` が実行ポリシーでブロックされることがあります。  
その場合は `npm.cmd` を使って実行します。

```powershell
cd C:\Users\kyuu0\OneDrive\Desktop\Cursor\EFU_GW\EFUPF\digital-suggestion-box

npm.cmd install
npm.cmd run dev
```

起動後、以下を開きます。

```txt
http://localhost:5173
```

## テスト実行

現在 **テストファイル 13、テスト 50 件**（`npm test` ですべて成功することを確認）。カバレッジ閾値は 80%（`vite.config.ts`）。

```powershell
npm.cmd test
npm.cmd run test:coverage
npm.cmd run build
```

通常のターミナルや Git Bash などでは、以下でも実行できます。

```bash
npm install
npm run dev
npm test
npm run test:coverage
npm run build
```

## 画面

| 画面 | パス | 内容 |
|------|------|------|
| トップ | `/` | サマリー、最近の投稿、各画面への導線 |
| 投稿フォーム | `/post` | カテゴリ、匿名/記名、タイトル、本文、送信 |
| 投稿一覧 | `/list` | フィルタ、カード一覧、詳細、共感、管理者操作 |

ルーティングは `HashRouter` のため、公開 URL では `/#/` `/#/post` `/#/list` になります。

## 公開（デプロイ）の技術メモ

### Cloudflare Workers（本線: `deploy.yml`）

- `wrangler.toml` … Worker 名、`dist` を静的アセット配信、SPA フォールバック（API Worker ではない）
- `.github/workflows/deploy.yml` … テスト → ビルド → `wrangler deploy`
- Vite の `base` はデフォルト `/`（Workers ルート配信向け）
- ルーティングは `HashRouter`（直接パスアクセス時の 404 回避）

ローカルからデプロイする場合:

```powershell
npm.cmd run deploy
```

### GitHub Pages（任意: `deploy-github-pages.yml`）

- 手動実行（`workflow_dispatch`）または Actions から起動
- ビルド時に `GITHUB_PAGES=true` で `base: /digital-suggestion-box/` を適用
- 初回は Settings → Pages → Source を **GitHub Actions** に設定

公開前のローカル確認:

```powershell
npm.cmd test -- --run
npm.cmd run build
npm.cmd run preview
```

## AI 開発ルール

### 用語の整理

| 種類 | 役割 |
|------|------|
| rules | 常に守るプロジェクト共通の制約や判断基準 |
| skills | 特定作業の知識・手順・テンプレート。AI の自動起動と `/skill-name` による手動起動の両方を持てる |
| commands | 従来の手動起動用定型プロンプト。現在は Skills で同様の用途を実現できるため、学習用として残し、今後は Skills へ寄せる |

重要: 「commands＝手動 / skills＝手順書」と分けすぎず、**Skills の起動方式（自動 / 手動）を使い分ける**理解に更新しています。

### DESIGN.md

[DESIGN.md](./DESIGN.md) にデザイン仕様を記載。
awesome-design-md-jp の 9 セクション形式を参考に、デジタル目安箱用に内容を置き換えています。

### Cursor Rules（`.cursor/rules/`）

| ファイル | 役割 |
|----------|------|
| `project-rule.mdc` | 3 画面要件・モック方針。通常はバックエンド禁止 |
| `design-rule.mdc` | DESIGN.md 準拠・日本語 UI |
| `test-rule.mdc` | TDD・テスト対象 |
| `backend-poc-rule.mdc` | ループ実験中の許可範囲。無条件にバックエンド禁止を解除しない |

通常はバックエンドも DB も追加しません。例外は次をすべて満たすときだけです。

1. [GOAL.md](./GOAL.md) に backend PoC / loop-engineering 実験が明示されている
2. 作業が GOAL.md の現在 Goal の範囲内である
3. [progress.md](./progress.md) と矛盾しない

### Skills（`.claude/skills/`）

| Skill | 起動 | 用途 |
|-------|------|------|
| `planning` | 手動（`disable-model-invocation: true`） | 実装前の 5 項目計画 |
| `tdd` | 手動（`disable-model-invocation: true`） | テスト先行の実装手順 |
| `review` | 自動 + 手動 | 実装レビュー観点 |
| `design-mock` | 自動 + 手動 | デザインモック作成・改善 |
| `loop-engineering` | 手動（`disable-model-invocation: true`） | Goal に向けた 1 イテレーション |

フロントマターの使い分け:

- `disable-model-invocation: true` … AI の自動起動を止め、利用者が明示的に開始する
- 未設定（デフォルト） … 必要時に AI が自動利用でき、`/skill-name` でも手動起動できる
- `user-invocable: false` … スラッシュメニュー非表示（自動起動そのものを禁止する設定ではない）

### ループエンジニアリング

人間がファイル名や実装手順を細かく指示するのではなく、次をプロジェクト側に置いて検証しました。

- Goal / 制約 / Acceptance Criteria（[GOAL.md](./GOAL.md)）
- Rules / Skill
- `npm test` / `npm run build`
- STOP 条件

AI は `/loop-engineering` で **1 起動 = 1 イテレーション** とし、次を自分で判断します。

```txt
現状把握
  → 次の最小作業を判断
  → テスト
  → 実装
  → test / build
  → progress.md 更新
  → STOP
```

状態はチャットではなく [progress.md](./progress.md) に残します。無制限に実装し続けません。詳細な履歴は [Report.md](./Report.md) を参照してください。

#### Goal A / Goal B（結果）

| Goal | 内容 | 結果 |
|------|------|------|
| A | UI と保存処理の境界を Repository として分離（Memory 実装） | 達成（Iteration 2） |
| B | Repository 実装を差し替え、Web Storage による永続化 PoC | 達成（Iteration 5） |

実装ループは 5 周で Goal B まで到達。技術選定が必要な周では、AI は実装せず人間へ判断を返しています。

### Custom Commands（`.claude/commands/`）※学習用

| コマンド | 用途 |
|----------|------|
| `plan.md` | 実装前の 5 項目計画（旧形式） |
| `tdd.md` | テスト先行の実装手順（旧形式） |
| `review.md` | 実装レビュー観点（旧形式） |

既存の commands は削除せず、**学習目的で残しています**。実務の作業フローは上記 Skills を優先してください。

### Hooks（`.cursor/hooks/`）

ファイル編集後に自動テストを走らせるサンプル設定を `hooks.json.sample` に配置。自動実行のセキュリティリスクと負荷を考慮し、**本番では無効**（サンプルのみ）。

## バックエンドについて

当初はバックエンド対象外のフロントモックでした。

今回、AI 駆動開発の検証として Repository 境界と Web Storage による永続化 PoC まで実施しています。Web Storage は本番バックエンドではありません。

共通 PF 側の API / DB / 認証仕様が決まったあと、`SuggestionRepository` の実装を HTTP / 共通 PF 用に差し替える想定です。共感・ステータス・回答の永続化や認証・添付も、そのときに役割分担を確認して進めます。
