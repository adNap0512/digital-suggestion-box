# ディレクトリ構成

このドキュメントは、`digital-suggestion-box` のディレクトリ構成と各ファイルの役割を整理したものです。

---

## 1. 全体ディレクトリ構成

```txt
digital-suggestion-box/
├─ README.md
├─ DESIGN.md
├─ package.json
├─ package-lock.json
├─ vite.config.ts          # Vite + Vitest + カバレッジ設定
├─ tsconfig.json
├─ tsconfig.node.json
├─ index.html
├─ .gitignore
├─ docs/
│  └─ directory-structure.md
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ vite-env.d.ts
│  ├─ components/
│  │  ├─ Layout/
│  │  ├─ SummaryCard/
│  │  ├─ SuggestionCard/
│  │  ├─ StatusBadge/
│  │  ├─ CategoryBadge/
│  │  └─ FilterBar/
│  ├─ context/
│  │  └─ SuggestionsContext.tsx
│  ├─ data/
│  │  ├─ mockSuggestions.ts
│  │  └─ categories.ts
│  ├─ pages/
│  │  ├─ TopPage.tsx
│  │  ├─ PostFormPage.tsx
│  │  └─ ListDetailPage.tsx
│  ├─ styles/
│  │  └─ tokens.css
│  ├─ utils/
│  │  ├─ types.ts
│  │  ├─ filterSuggestions.ts
│  │  ├─ summaryStats.ts
│  │  └─ suggestionActions.ts
│  ├─ test/
│  │  └─ setup.ts           # Vitest セットアップ
│  └─ tests/
│     ├─ App.test.tsx
│     ├─ components/
│     ├─ pages/
│     └─ utils/
├─ .cursor/
│  ├─ rules/
│  │  ├─ project-rule.mdc
│  │  ├─ design-rule.mdc
│  │  └─ test-rule.mdc
│  └─ hooks/
│     ├─ hooks.json.sample
│     └─ README.md
└─ .claude/
   ├─ commands/                 # 学習用（旧形式）。今後は Skills を優先
   │  ├─ plan.md
   │  ├─ tdd.md
   │  └─ review.md
   └─ skills/
      ├─ planning/
      │  └─ SKILL.md
      ├─ tdd/
      │  └─ SKILL.md
      ├─ review/
      │  └─ SKILL.md
      └─ design-mock/
         └─ SKILL.md
```

ビルド・テスト実行時に生成されるディレクトリ（Git 管理外）:

```txt
node_modules/   # 依存パッケージ
dist/           # 本番ビルド出力
coverage/       # カバレッジレポート
```

---

## 2. 主要ファイルの役割

| ファイル | 役割 |
|----------|------|
| `README.md` | 起動方法、テスト方法、画面概要、AI 開発ルールの概要 |
| `DESIGN.md` | デジタル目安箱のデザイン仕様書（AI が参照する見た目・UX の定義） |
| `package.json` | npm scripts と依存関係 |
| `vite.config.ts` | Vite のビルド設定、Vitest・カバレッジ（80% 閾値）設定 |
| `tsconfig.json` | TypeScript コンパイラ設定 |
| `tsconfig.node.json` | Vite 設定ファイル用 TypeScript 設定 |
| `index.html` | アプリの HTML エントリポイント |

---

## 3. src 配下の構成

| ディレクトリ / ファイル | 役割 |
|------------------------|------|
| `src/main.tsx` | React アプリのエントリポイント |
| `src/App.tsx` | ルーティング定義（3 画面） |
| `src/components/` | 共通 UI コンポーネント |
| `src/pages/` | 画面単位のコンポーネント（Top / PostForm / ListDetail） |
| `src/context/` | 投稿データの状態管理（SuggestionsContext） |
| `src/data/` | ダミーデータ・カテゴリ定義 |
| `src/utils/` | 型定義、フィルタ、集計、共感・ステータス更新などの pure function |
| `src/styles/` | DESIGN.md に基づく CSS 変数（tokens.css） |
| `src/test/setup.ts` | Vitest 実行前のセットアップ（jest-dom 等） |
| `src/tests/` | テストコード本体 |

### components 一覧

| コンポーネント | 役割 |
|---------------|------|
| `Layout` | ヘッダー・ナビゲーション・`<Outlet />` |
| `SummaryCard` | トップ画面のサマリー数値カード |
| `SuggestionCard` | 投稿カード（カテゴリ・ステータス・共感・回答有無） |
| `StatusBadge` | ステータス色付きバッジ |
| `CategoryBadge` | カテゴリバッジ |
| `FilterBar` | 一覧画面のフィルタ UI |

### pages 一覧

| ページ | パス | 役割 |
|--------|------|------|
| `TopPage` | `/` | サマリー、最近の投稿、各画面への導線 |
| `PostFormPage` | `/post` | 投稿フォーム（匿名/記名、下書き保存） |
| `ListDetailPage` | `/list` | 一覧・詳細・共感・管理者操作 |

---

## 4. `.cursor/rules` の役割

Cursor が常時参照する開発ルール。`alwaysApply: true` で全セッションに適用。

| ファイル | 役割 |
|----------|------|
| `project-rule.mdc` | 3 画面要件、モック方針、バックエンド禁止、技術スタック |
| `design-rule.mdc` | DESIGN.md 準拠、日本語 UI、カード/バッジルール |
| `test-rule.mdc` | TDD、テスト対象一覧、pure function 分離 |

**関係:** `DESIGN.md` が「見た目」、`.cursor/rules` が「開発の約束事」。

---

## 5. `.claude/skills` の役割（推奨）

特定作業の知識・手順・テンプレートをまとめる単位。
Claude Code 公式では、独自コマンド追加は Skills 側へ整理されており、Skill は次の両方を持てます。

- 必要に応じた **AI 自動起動**
- `/skill-name` による **手動起動**

| Skill | 起動方式 | 用途 |
|-------|----------|------|
| `planning` | 手動のみ（`disable-model-invocation: true`） | 実装前の 5 項目計画 |
| `tdd` | 手動のみ（`disable-model-invocation: true`） | テスト先行の小さな実装サイクル |
| `review` | 自動 + 手動 | 実装レビュー観点 |
| `design-mock` | 自動 + 手動 | デザインモック作成・改善 |

### フロントマターによる起動制御

| 設定 | 意味 |
|------|------|
| （デフォルト） | ユーザーも AI も起動できる |
| `disable-model-invocation: true` | AI 自動起動を無効化。手動実行向け |
| `user-invocable: false` | `/` メニュー非表示。自動起動そのものを禁止する設定ではない |

### rules / skills の理解

| 種類 | 役割 |
|------|------|
| rules | 常に守るプロジェクト共通の制約や判断基準 |
| skills | 特定作業の知識・手順。起動方式（自動 / 手動）をフロントマターで使い分ける |

---

## 6. `.claude/commands` の役割（学習用）

従来の手動起動用定型プロンプト。現行も動作するが、同様の用途は Skills で実現できるため、**学習目的で残している**。

| コマンド | 用途 | 対応 Skill |
|----------|------|------------|
| `plan.md` | 実装前の 5 項目計画 | `planning` |
| `tdd.md` | テスト先行の実装手順 | `tdd` |
| `review.md` | 実装レビュー観点 | `review` |

実務では Skills を優先し、commands は「旧形式の理解用」として扱う。

---

## 7. `.cursor/hooks` の役割

Cursor Hooks のサンプル設定。**本番では無効**（説明・理解用）。

| ファイル | 役割 |
|----------|------|
| `hooks.json.sample` | ファイル編集後に `npm test` を自動実行する例 |
| `README.md` | セキュリティリスク・負荷の注意、有効化しない理由 |

---

## 8. テスト関連ファイルの役割

| ファイル / ディレクトリ | 役割 |
|------------------------|------|
| `vite.config.ts`（test セクション） | Vitest 環境（jsdom）、カバレッジ閾値 80% |
| `src/test/setup.ts` | `@testing-library/jest-dom` の読み込み |
| `src/tests/utils/` | pure function のユニットテスト |
| `src/tests/components/` | 共通コンポーネントのテスト |
| `src/tests/pages/` | 3 画面の表示・操作テスト |
| `src/tests/App.test.tsx` | アプリ全体の結合テスト |

**テスト方針:** utils を先にテスト → コンポーネント → ページ（TDD）。現在 38 件、カバレッジ 90% 超。

---

## 9. README.md / DESIGN.md との関係

```txt
README.md          … 人間向け：起動・テスト・概要・発表メモ
DESIGN.md          … AI向け：見た目・UX・配色・コンポーネント仕様
.cursor/rules      … AI向け：常時適用の制約
.claude/skills     … AI向け：特定作業の手順（自動/手動起動）
.claude/commands   … 学習用：旧形式の手動プロンプト
docs/              … 人間向け：構成メモ（本ファイル）
```

| ドキュメント | 読者 | 内容 |
|-------------|------|------|
| `README.md` | 開発者・発表者 | 何ができて、どう動かすか |
| `DESIGN.md` | AI エージェント | どう見せるか、どう書くか |
| `docs/directory-structure.md` | 開発者 | どこに何があるか |

---

## 10. 今後のバックエンド・デプロイ拡張候補

### 今回の範囲

**バックエンドは対象外。** ダミーデータで成立するローカルモックに留める。

### 次回以降でイメージしておく要件

実装方式はまだ決め切らない。グループ会で方式・役割分担が決まった後に固める。

- 投稿データの保存
- 投稿一覧・詳細の取得
- 共感数の更新
- 管理者回答とステータス変更
- 匿名投稿と記名投稿の扱い
- 認証・権限の必要性
- 添付ファイルの保存先

### Supabase 連携時の構成イメージ（候補）

```txt
src/
├─ lib/
│  └─ supabaseClient.ts      # Supabase クライアント初期化
├─ services/
│  └─ suggestionsApi.ts      # 投稿 CRUD、共感、ステータス更新
└─ features/
   └─ auth/
      └─ AuthProvider.tsx    # 認証（匿名/記名の実装）
```

- `src/data/mockSuggestions.ts` → API 取得に置き換え
- `SuggestionsContext` → services 層経由でデータ取得
- `.env.local` に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

### Cloudflare デプロイ時の構成イメージ（候補）

```txt
wrangler.toml                # Cloudflare Workers / Pages 設定
public/                      # 静的アセット（必要に応じて）
```

- `npm run build` の `dist/` を Cloudflare Pages にデプロイ
- API が必要な場合は Workers + Supabase の組み合わせ

### 拡張時に更新すべきドキュメント

| 追加機能 | 更新ファイル |
|----------|-------------|
| Supabase | `README.md`、`project-rule.mdc`（バックエンド禁止の解除）、本ファイル |
| Cloudflare | `README.md`（デプロイ手順）、本ファイル |
| 新画面 | `DESIGN.md`（付録）、`project-rule.mdc`、`test-rule.mdc` |

---

## 関連リンク

- [README.md](../README.md) — 起動・テスト方法
- [DESIGN.md](../DESIGN.md) — デザイン仕様
