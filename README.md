# デジタル目安箱（ローカルモック）

社内の困りごと・改善アイデア・相談を気軽に投稿でき、対応状況も見える UI のデザインモックです。

▶ [公開デモを見る](https://adnap0512.github.io/digital-suggestion-box/)

## 概要

- バックエンドなし、ダミーデータで動作
- 3 画面: トップ / 投稿フォーム / 投稿一覧・詳細
- 技術スタック: React + Vite + TypeScript + Vitest

詳細なディレクトリ構成は [docs/directory-structure.md](./docs/directory-structure.md) を参照してください。

## 公開URL

### GitHub Pages

- [デジタル目安箱を開く](https://adnap0512.github.io/digital-suggestion-box/)
- [投稿フォーム](https://adnap0512.github.io/digital-suggestion-box/#/post)
- [投稿一覧](https://adnap0512.github.io/digital-suggestion-box/#/list)

### Cloudflare Workers

`main` への push で Cloudflare Workers にデプロイします（`wrangler.toml` + `.github/workflows/deploy.yml`）。

公開後の URL 例:

```txt
https://digital-suggestion-box.<あなたのsubdomain>.workers.dev/
https://digital-suggestion-box.<あなたのsubdomain>.workers.dev/#/post
https://digital-suggestion-box.<あなたのsubdomain>.workers.dev/#/list
```

GitHub リポジトリの Secrets に次を登録してください。

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン（Workers デプロイ権限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

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

## 公開（デプロイ）の技術メモ

### Cloudflare Workers（本線: `deploy.yml`）

- `wrangler.toml` … Worker 名、`dist` を静的アセット配信、SPA フォールバック
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
| `project-rule.mdc` | 3 画面要件・モック方針 |
| `design-rule.mdc` | DESIGN.md 準拠・日本語 UI |
| `test-rule.mdc` | TDD・テスト対象 |

### Skills（`.claude/skills/`）

| Skill | 起動 | 用途 |
|-------|------|------|
| `planning` | 手動（`disable-model-invocation: true`） | 実装前の 5 項目計画 |
| `tdd` | 手動（`disable-model-invocation: true`） | テスト先行の実装手順 |
| `review` | 自動 + 手動 | 実装レビュー観点 |
| `design-mock` | 自動 + 手動 | デザインモック作成・改善 |

フロントマターの使い分け:

- `disable-model-invocation: true` … AI の自動起動を止め、利用者が明示的に開始する
- 未設定（デフォルト） … 必要時に AI が自動利用でき、`/skill-name` でも手動起動できる
- `user-invocable: false` … スラッシュメニュー非表示（自動起動そのものを禁止する設定ではない）

### Custom Commands（`.claude/commands/`）※学習用

| コマンド | 用途 |
|----------|------|
| `plan.md` | 実装前の 5 項目計画（旧形式） |
| `tdd.md` | テスト先行の実装手順（旧形式） |
| `review.md` | 実装レビュー観点（旧形式） |

既存の commands は削除せず、**学習目的で残しています**。実務の作業フローは上記 Skills を優先してください。

### Hooks（`.cursor/hooks/`）

ファイル編集後に自動テストを走らせるサンプル設定を `hooks.json.sample` に配置。自動実行のセキュリティリスクと負荷を考慮し、**本番では無効**（サンプルのみ）。

### バックエンドについて

今回のモックではバックエンドは対象外です。次回以降の候補として、投稿保存・一覧取得・共感更新・管理者回答・匿名/記名・認証・添付保存などの要件をイメージできる状態に留め、グループ会で方式が決まってから API / DB / 認証を固めます。