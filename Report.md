# デジタル目安箱 PoC 実施内容レポート（最終版）

グループ会発表用（約15分）  
テーマ: **AI駆動開発を学ぶ**  
本資料は全文読み上げ用ではない。画面を見せながら話す発表者用メモとする。

---

## 15分の時間配分

| 時間 | 内容 | 見せるもの |
|------|------|------------|
| 0:00〜1:00 | 目的・テーマ | 本資料のストーリーだけ |
| 1:00〜5:00 | PoC画面デモ | Cloudflare Workers（またはローカル） |
| 5:00〜8:00 | 最初に試した Rules / Skills / TDD | リポジトリのフォルダ |
| 8:00〜12:30 | **ループエンジニアリング（中心）** Iteration 1〜5 と学び | GOAL.md / progress.md |
| 12:30〜14:00 | 永続化PoCと共通PFへの今後（時間があれば Goal C まで） | 構成図。完成したバックエンドではない |
| 14:00〜15:00 | まとめ | 公開URL |

今回いちばん伝えたいこと:

> 人間が細かい実装手順を指示するのではなく、Goal・制約・テスト・STOP条件を設計し、AIに次の作業を判断させる開発を試した。

---

## 0:00〜1:00 目的・テーマ

**話す内容**

今回のグループワークの目的は、アプリを量産することより **AI駆動開発の進め方を学ぶこと**。

取り組んだことは2段ある。

1. 社内の困りごと・改善アイデアを投稿し、対応状況まで見える「デジタル目安箱」の PoC を作った
2. そのうえで、AI にコードを書かせるだけでなく、**同じ品質で、次の作業まで判断させる方法** を検証した

後半ではバックエンド完成ではなく、**Repository 境界と永続化 PoC** を題材にループエンジニアリングを回した。

**口頭補足**

- 「完成した社内システム」ではない
- 「AI が完全に自律開発した」でもない
- 人間が Goal と止まり方を設計し、AI が1周ずつ実装・検証した、が正確

**強調する学び**

人間の役割が「書き方を指示する」から「AI が判断できる環境を設計する」へ寄った。

---

## 1:00〜5:00 PoC画面デモ

> **ここでPoCを表示**  
> メイン: https://digital-suggestion-box.kyuu0512.workers.dev/#/

ルーティングは `HashRouter`（`src/App.tsx`）。

| 画面 | パス | Workers |
|------|------|---------|
| トップ | `/` | https://digital-suggestion-box.kyuu0512.workers.dev/#/ |
| 投稿 | `/post` | https://digital-suggestion-box.kyuu0512.workers.dev/#/post |
| 一覧・詳細 | `/list` | https://digital-suggestion-box.kyuu0512.workers.dev/#/list |

確認用 GitHub Pages: https://adnap0512.github.io/digital-suggestion-box/#/

管理画面（`dash.cloudflare.com`）は共有しない。

**デモ前の注意（必ず言う）**

ループ実験のコードは、この資料作成時点では **ローカル変更が origin/main に未反映**。  
Cloudflare / Pages の公開版は、まだ「リロードすると追加投稿が消える」フロントモックの可能性がある。

- リロード永続化を見せるなら、**ローカル起動**（`npm run dev`）か、**push 後の公開URL** で確認してから行う
- 公開版で残らなくても、ローカルとテストでは Goal B を確認済み、と説明する

### トップ `/#/`

**何が出るか:** タイトル、説明、「投稿する」「みんなの投稿を見る」「自分の投稿を見る」、サマリー（投稿数 / 対応済み / 検討中）、最近の投稿3件。

**次へ:** 投稿する → `/#/post`。みんなの投稿 → `/#/list`。自分の投稿 → `/#/list?mine=1`（実ログインではなく、ダミーの `isMine`）。

### 投稿 `/#/post`

カテゴリ、匿名 / 記名、タイトル、本文、添付（UIのみ）、下書き保存、送信。送信後は一覧へ。

下書きは別キーで `localStorage` に書くが、**画面を開き直したときの自動復元は未実装**。

### 一覧・詳細 `/#/list`

カード（カテゴリ・ステータス・共感・回答有無）、フィルタ、詳細、共感ボタン、管理者モード（チェック。認証ではない）でステータス変更・回答入力。

### デモ操作の推奨順（ローカルまたは最新デプロイ確認後）

1. トップのサマリーと最近の投稿を指す
2. 投稿する → タイトルと本文を入れて送信
3. 一覧でその投稿を確認
4. **リロード** → 追加投稿が残れば Goal B のデモ
5. 共感や管理者回答を触ったあとリロードすると、それらは消える（メモリのまま）

**口頭補足**

以前はリロードすると初期8件に戻っていた。今回の検証で、投稿の作成と一覧だけ Repository 経由の永続化 PoC を足した。

---

## 5:00〜8:00 最初に試したAI駆動開発

**見せるタイミング:** `.cursor/rules/` と `.claude/skills/`、`DESIGN.md`

最初の PoC では、単に「AI にコードを書かせる」のではなく、**一定のルールと品質で書いてもらうために何が要るか** を試した。

```txt
DESIGN.md          … 見た目・UXの基準
.cursor/rules      … 常に守る制約（3画面、モック方針、TDD）
.claude/skills     … 作業ごとの手順
.claude/commands   … 学習用に残した旧形式
.cursor/hooks      … 自動実行はサンプルのみ。本番では無効
Tests / Actions    … 結果を機械的に検証してから公開
```

| 種類 | 実体 | 役割 |
|------|------|------|
| DESIGN.md | プロジェクト直下 | 配色、カード、文言。「問い合わせ」ではなく「投稿」 |
| Rules | `project-rule` / `design-rule` / `test-rule` | 常時適用。小さく作る、テスト必須 |
| Skills | `planning` `tdd`（手動） / `review` `design-mock`（自動可） | 計画・TDD・レビュー・デザインモック |
| Commands | `plan` `tdd` `review` | Skills と同じ用途の旧形式。削除せず学習用 |
| Hooks | `hooks.json.sample` のみ | 編集のたびにテストを回す案。安全性と負荷で無効 |
| テスト | Vitest。開始時38件 | 画面・純関数を固定 |
| CI | `.github/workflows/deploy.yml` | `main` push で test → build → Workers |

技術（`package.json`）: React 19、TypeScript、Vite 6、Vitest 3、react-router-dom 7。Workers は `wrangler.toml` で `dist` を静的配信。API Worker ではない。

**口頭補足**

毎回チャットに「バックエンドを作らないで」と書かなくても、Rules 側で止められるようにした。これが次のループ実験の土台。

**強調する学び**

知識はプロンプトに置かず、プロジェクトに置く。

---

## 8:00〜12:30 ループエンジニアリング（発表の中心）

### なぜバックエンド検討を始めたか

当初は完全なフロントモック。

```txt
React UI → SuggestionsContext → useState → mockSuggestions
```

API / DB / Repository なし。リロードすると追加投稿が消える。

将来は共通プラットフォーム上の1機能にしたい。だから React から特定 DB（例: Supabase）へ直結せず、境界を置く方向を検討した。

```txt
React UI → SuggestionsContext → Repository →（将来）共通PF API → DB / 認証
```

**題材は永続化だが、目的は開発方法の検証。**

### 何が違うか

従来: 人間が「このファイルを作って」「Supabase を繋いで」と手順を指示する。

今回: 人間は Goal・制約・受け入れ条件・Rules・Skill・test/build・STOP を定義する。  
AI は1起動につき1周だけ、次を自分で判断する。

```txt
現状把握 → 次の最小作業を判断 → テスト → 実装
  → npm test / npm run build → 失敗なら修正 → progress.md に記録 → STOP
```

無制限に実装し続けない。`loop-engineering` Skill は `disable-model-invocation: true`（人間が `/loop-engineering` で明示起動）。

---

### ループ環境（人間が先に置いたもの）

> **ここでファイルを短く見せる:** `GOAL.md` → `progress.md` → `.cursor/rules/backend-poc-rule.mdc`

**GOAL.md**  
実験目的、Goal A / B / C、受け入れ条件、対象外。ループ中に AI が Goal を勝手に変えない。変える必要があれば STOP。

**progress.md**  
状態をチャットに残さない。Current Goal、Iteration、Completed、Current State、Next Task、Verification、Findings、Decisions、Problems、Stop Reason。

**backend-poc-rule.mdc と既存 Rule の関係**  
`backend-poc-rule` が「バックエンド禁止」を上書きするわけではない。

- 通常: `project-rule.mdc` どおりバックエンドも DB も追加しない
- 例外: `GOAL.md` に実験明示があり、作業が現在 Goal の範囲内で、`progress.md` と矛盾しないときだけ許可

実験明示を外せば、また禁止に戻る。

**loop-engineering Skill**  
1起動 = 1イテレーション。検証後に次周を自動では始めない。

STOP の例: Goal 変更が必要、大きな設計判断、外部サービス、Secret、共通PF仕様、大きな UI 変更、原因不明のテスト失敗、Goal 達成。

---

### Iteration 0（実装の前）

環境だけ作った。Repository はまだ無い。  
`GOAL.md` / `progress.md` / Rule / Skill を置き、Iteration を 0 とした。

---

### Iteration 1 … 境界だけ先に作る

**AIが判断した作業（人間はファイル名を指定していない）**  
list / create の契約と Memory 実装、契約テスト。Context にはつながない。

実施: `SuggestionRepository`、`MemorySuggestionRepository`、契約テスト5件。

```txt
38件 → 43件 PASS　／　npm run build PASS
```

Goal A 未達として停止。

**口頭:** DB の前に、UI と保存の境界が要ると判断した。

---

### Iteration 2 … Context をつなぐ → Goal A

**AIが判断した作業**  
一覧取得と投稿作成を Memory Repository 経由にする。UI は変えない。

実施: mount 時 `list()`、投稿時 `create()`、Repository 注入、Context テスト2件、画面テストは非同期 list 完了待ち。ローディング画面は足していない。

```txt
45件 PASS　／　build PASS
```

**Goal A 達成** と自分で判定して停止。次の Goal には進まない。

この時点の形:

```txt
Page → SuggestionsContext → SuggestionRepository → MemorySuggestionRepository
```

pages は保存実装を import しない。Context も特定 DB に依存しない。

---

### Iteration 3 … 実装せず STOP（重要な学び）

Goal B: Repository を差し替えて、再生成後も list できること。**保存技術は人間が指定しなかった。**

AI は永続化コードを書かず、自ら止まった。

理由（STOP 条件）:

- 方式選択は大きな設計判断
- Cloudflare のリソース作成が必要になる可能性
- Supabase では外部サービスと Secret
- 共通 PF 仕様が未確定

比較して返したもの: Web Storage / CF KV・D1 + Worker API / Supabase 等 / Worker 内メモリ。

推奨は **Web Storage を PoC の保存口にする**（本番最適だからではなく、静的 SPA のまま差し替えを最小コストで証明できるから）。

**強調する学び**

自律性は「勝手に実装を続けること」ではない。**人間判断が必要な場所で止まること** も設計する。

---

### Iteration 4 … 契約だけ先に証明する

人間が Web Storage 方式を承認。

**AIが判断した作業**  
Context の前に、Repository 単体で永続化契約を証明する。

実施: `KeyValueStorage` と `PersistentSuggestionRepository`（同一ファイル `persistentSuggestionRepository.ts`）。テスト用の保存口は Map。

重要なテスト: create → **新しいインスタンス** → list で取れる。別の保存口では見えない。

```txt
49件 PASS　／　build PASS
```

この周も Context 未接続。Goal B 未達で停止。

---

### Iteration 5 … 差し替え → Goal B

**AIが判断した作業**  
Context のデフォルトを Persistent 実装へ差し替える。

実施: `createPersistentSuggestionRepository()`（既定の保存口は Web Storage）。Context は `localStorage` を直接触らない。再マウント後も投稿が残るテスト。テスト間で Storage をクリア。UI 変更なし。

```txt
50件 PASS　／　build PASS
```

**Goal B 達成** と判定して停止。次の Goal へは勝手に進まない。

---

### Goal C の目的（Iteration 6 以降）

Goal B のあと、人間が Goal C を開始した。目的は Supabase を「使えること」だけではない。

> 既存の `SuggestionRepository`（`list` / `create`）を維持したまま、外部 DB を Repository 差し替えで接続できるか。

UI / pages / `SuggestionsContext` は Supabase 固有 API（`createClient` / `supabase.from`）へ直接依存させない。将来は共通 PF API 用 Repository へ差し替える前提。

Goal C は **未達**。実 DB の list / create はまだ確認していない。migration もリモート未適用。

---

### Iteration 6 … 実装せず STOP

Goal C 開始。外部 DB として Supabase Free を使う方針は確認した。ただし次は人間判断が必要だったため、コードを足さず止まった。

- 外部サービス作成・アカウント操作
- URL / Key
- テーブル作成の承認
- RLS / anonymous access

**学び:** AI を自走させることは「何でも勝手に進めること」ではない。外部サービス・認証・セキュリティでは、人間へ制御を返すこともループの一部。

---

### Iteration 7 … 公式手段と最小スキーマ

Supabase を AI 側から操作する公式手段を調査した。画面操作の自動化はしない。

- `npx supabase` が利用可能（この環境では未ログイン）
- 公式 MCP はこの Cursor セッションでは未接続
- CLI を採用候補とした
- 実 Project / Key / 通信はまだ行わない

追加（秘密値なし）:

- `supabase/migrations/20260908145100_create_suggestions.sql`
- `.env.example`（`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` の空欄のみ）

`suggestions` の最小列: `id`, `title`, `body`, `category`, `is_anonymous`, `author_name`, `created_at`。

Goal C では DB に置かない: `isMine`（UI 判定）、`empathyCount`、`status`、`hasResponse`、`response`。list では Repository が既定値を埋める。

RLS は ON。anon に SELECT / INSERT のみ。UPDATE / DELETE の Policy / GRANT は付けない。authenticated には付与しない。

---

### Iteration 8 … 実 DB なしで Repository を先に作る

実 Project や実 Key に依存せず、`SupabaseSuggestionRepository` をテスト先行で追加。Context / UI は未接続。

```txt
SuggestionRepository
  ↓
SupabaseSuggestionRepository
  ↓
SuggestionsRemoteClient（テストは Fake）
```

確認したこと: DB 行 → `Suggestion`、`DraftForm` → INSERT（`id` / `created_at` は送らない）、匿名 / 記名、list / create、クライアントエラーを成功扱いにしない。

```txt
57件 PASS（14ファイル）　／　build PASS
```

**学び:** 外部 DB がまだ無くても、境界と Fake クライアントがあればアプリ側の実装とテストを先に進められる。

---

### Iteration 9 … 公式 SDK をアダプタに閉じる

`@supabase/supabase-js` を追加。SDK 固有処理は `SupabaseSuggestionsRemoteClient` に閉じた。Repository は SDK 型に強く依存しない。

```txt
SuggestionRepository
  ↓
SupabaseSuggestionRepository
  ↓
SuggestionsRemoteClient
  ↓
SupabaseSuggestionsRemoteClient
  ↓
注入された SDK Client
```

実通信なし。SELECT（Goal C 列のみ、`created_at DESC`）、INSERT、error、env 未設定時 factory が null、をテスト。

```txt
62件 PASS（15ファイル）　／　build PASS
```

通常起動では env が無くても落ちない（この時点では Context 未配線）。

---

### Iteration 10 … 実行時の差し替え

`createDefaultSuggestionRepository()` を Context の外に置いた。

- URL と publishable key が両方ある → `SupabaseSuggestionRepository`
- 無い / 片方だけ → `PersistentSuggestionRepository`（起動を落とさない）
- `SuggestionsProvider` の `repository` prop は最優先

Context には `createClient` / `supabase.from` / `@supabase/supabase-js` を置いていない。

```txt
65件 PASS（16ファイル）　／　build PASS
```

factory 経由で SDK がアプリバンドルに入る。env 未設定でも Web Storage で起動する。

**学び:** DB 製品を Context に埋め込まず、Repository の生成場所だけ差し替えると、既存 UI を変えずに保存方式を切り替えられる。

---

### Iteration 11 … 実疎通は環境未準備で STOP

実 DB の list / create を確認する周。次が揃っていなかったため、ダミー Key では進めず実通信しなかった。

- Free Project 未作成
- migration 未適用
- `.env.local` 未設定
- Project URL / publishable key 未取得

test / build は 65 件のまま成功。**Goal C は未達** と判定して停止。

---

### ループ外: Supabase Free 環境の準備（人間承認）

Iteration 11 のあと、ループ外で CLI 接続を進めた。`/loop-engineering` の自動継続ではない。Project 作成は人間が条件を承認したあとだけ実行した。

PowerShell の ExecutionPolicy の影響で、人間側ターミナルでは `npx supabase ...` が通らず、`npx.cmd supabase ...` を使った。エージェントシェルは非 TTY のため `supabase login` の自動ブラウザ認証ができず、TTY でのログインが必要だった。

実施済み（値は本資料に書かない）:

- CLI ログイン
- Organization `digital-suggestion-box`（Free、$0/month）を新規作成
- Project `digital-suggestion-box-goal-c`（Region `ap-northeast-1` / Tokyo、状態 `ACTIVE_HEALTHY`）
- 有料 Compute / HA / Add-on / Pro Upgrade なし。既存 Project は変更していない
- DB password はローカルのみ。Git / チャット / 本資料に保存しない

**未実施:** リモートへの migration 適用、`.env.local`、実 DB の list / create / 再 list。

---

## 学び（ここを厚く話す）

### 1. 細かい実装プロンプトがなくても進んだ

人間は「この関数を書いて」と順序を指定しなかった。Goal と制約とテストがあったので、AI が契約 → Memory → Context → Persistent → 接続、と判断した。

### 2. Goal を小さく分ける

最初から「DB に永久保存」にせず、A（境界）と B（差し替えによる永続化）に分けた。1周の成否が判定しやすい。

### 3. テストが判断基準になる

「ちゃんと実装して」ではなく `npm test -- --run` と `npm run build`。

| 時点 | 件数 |
|------|------|
| 開始（フロントモック） | 38 |
| Iteration 1 | 43 |
| Iteration 2 | 45 |
| Iteration 4 | 49 |
| Iteration 5（Goal B） | 50（13ファイル） |
| Iteration 8 | 57（14ファイル） |
| Iteration 9 | 62（15ファイル） |
| Iteration 10〜11（現在） | **65（16ファイル、すべて成功）** |

Iteration 3 / 6 / 11 は実コードを足さず STOP（または環境確認のみ）。Iteration 7 は migration 案と `.env.example`。

### 4. 状態をチャットの外に置く

`progress.md` があるので、次周で長い説明をやり直さなくてよい。

### 5. STOP 条件が効く

Iteration 3 は失敗ではなく、人間へ制御を戻した事例。

### 6. 人間の役割が変わる（いちばん伝えたい）

```txt
従来: 人間 → 詳細プロンプト → AI → コード

今回: 人間 → Goal / 制約 / 受け入れ条件
            → Rules / Skills / テスト / STOP
            → AI が把握・判断・テスト・実装・検証・記録
            → 必要な場所だけ人間判断
```

**コードの書き方を指示する人から、AI が正しく判断できる環境を設計する人へ。**

### Goal C で追加で分かったこと

1. 完成手順を細かく指示しなくても、GOAL / Rules / Skill / `progress.md` から次の最小作業を判断させられた  
2. 外部サービス未準備でも、Fake / Client 境界でアプリ側を先に検証できた  
3. Secret・RLS・課金・アカウント操作では STOP し、人間へ返せた  
4. Goal A の境界があったので、Web Storage から Supabase へ進んでも UI / Context への影響を最小化できた  
5. 「AI に何を書かせるか」だけでなく、「どこまで任せ、どこで人間が承認するか」という環境設計が本体だった  
6. ループは単純な自動繰り返しではなく、把握 → 判断 → 実装 → test/build → 記録 → 必要なら STOP、という判断ループとして機能した  

---

## 12:30〜14:00 いまの永続化PoCと今後

> **ここで構成図を指す。** 「バックエンド完成」とは言わない。

### 現在（ローカルの実装）

```txt
React UI（pages / components）
  ↓
SuggestionsContext
  ↓ list / create
SuggestionRepository（契約）
  ↓ createPersistentSuggestionRepository()
PersistentSuggestionRepository
  ↓ KeyValueStorage
Web Storage（ブラウザ。PoC の保存口）
```

`MemorySuggestionRepository` は残っている（契約テスト用）。画面のデフォルトではない。

これは **本番バックエンドではない。** 共通 PF にも未接続。Goal B 時点では DB も未実装だった。

### Goal C 以降の構成（実疎通は未完了）

実行時は env が揃ったときだけ Supabase 側を選ぶ。未設定（現状のローカル既定）は Web Storage のまま。

```txt
React UI（pages / components）
  ↓
SuggestionsContext（SDK 非依存。repository prop 優先）
  ↓
createDefaultSuggestionRepository()
  ├─ Supabase設定なし / 不完全 → Persistent → Web Storage
  └─ URL + publishable key あり
       ↓
     SupabaseSuggestionRepository
       ↓
     SuggestionsRemoteClient
       ↓
     SupabaseSuggestionsRemoteClient
       ↓
     @supabase/supabase-js
       ↓
     Supabase Free（Project 作成済み。migration 未適用）
```

Goal C で完了しているもの: Repository 境界、Web Storage 永続化、Supabase Repository、RemoteClient、公式 SDK アダプタ、env による切り替え、migration / RLS 案、Free Organization、Free Project。

まだ完了していないもの: リモートへの migration、`.env.local`、実 DB の list / create / 再 list。**Goal C は未達。**

次の予定: Goal C 専用 Project へ migration を適用し、Repository 経由で list → create → 再 list を確認したうえで、Goal C の達成判定を行う。

接続情報（Project URL / publishable key / secret / service_role / DB password）は本資料に書かない。フロントでは publishable key のみを想定し、secret / service_role は使わない。

将来の差し替え想定:

```txt
同じ SuggestionRepository 契約
  ↓
HTTP / 共通PF 用 Repository
  ↓
共通PF → DB / 認証
```

### 何が残るか / 残らないか（コードどおり）

| 残る（同一ブラウザ） | 残らない（リロードで消える） | 対象外 |
|----------------------|------------------------------|--------|
| 投稿作成 | 共感 | 本格認証 |
| 投稿一覧取得 | ステータス変更 | 添付の保存 |
| | 管理者回答 | 管理者権限 |
| | | 共通PF API / 本番DB |

下書きは投稿とは別キーで書くだけ。自動復元はない。添付はファイル選択 UI のみ。

Web Storage にした理由は、本番として最適だからではない。**Repository 差し替えを、静的配信のまま最小コストで見るため。**

共通 PF の仕様と役割分担が決まってから、接続・認証・共感や回答の永続化などを検討する。「次に全部作る」ではない。

---

## 14:00〜15:00 まとめ

1. デジタル目安箱の3画面 PoC を、ダミーデータから始めた  
2. DESIGN.md / Rules / Skills / テストで、AI に同じ品質で書いてもらう土台を置いた  
3. ループエンジニアリングでは、人間が Goal と STOP を設計し、AI が1周ずつ次を判断した  
4. Goal A で境界、Goal B で差し替え永続化 PoC。技術選定では人間へ戻した  
5. Goal C では同じ境界のまま Supabase 差し替えを検証中。Project 作成まで。実 DB 疎通と Goal C 達成はこれから  
6. いま公開前提として話せるのは Web Storage の PoC。共通 PF 接続や本番 DB ではない  

公開（構成はある。最新コードは push 後）:

```txt
Cloudflare Workers（本線）
https://digital-suggestion-box.kyuu0512.workers.dev/#/

GitHub Pages（確認用）
https://adnap0512.github.io/digital-suggestion-box/#/
```

デプロイの流れ（`deploy.yml`）: GitHub の `main` push → Actions → test → build → Workers。Pages は手動ワークフロー。

---

## 発表チェックリスト

- [ ] 目的は「AI駆動開発を学ぶ」と先に言う
- [ ] 公開版でリロードデモするか、ローカルにするか、事前に確認する
- [ ] トップ → 投稿 → 一覧 を短く操作する
- [ ] Rules / Skills をフォルダで10秒見せる
- [ ] GOAL.md と progress.md を見せ、1起動=1周を言う
- [ ] Iteration 3 の STOP を「学び」として話す
- [ ] 「バックエンド完成」「DB実装」「共通PF接続済」「Goal C達成」と言わない
- [ ] 共感・ステータス・回答はメモリ、と一言入れる
- [ ] Goal C に触れるなら、Project 作成済み・migration 未適用・実疎通未確認、と正確に言う
- [ ] まとめは「環境を設計する人間」に戻す

---

## リポジトリ確認メモ

発表本文ではない。更新時の一次情報。

### 確認した主要ファイル

`README.md`、`Report.md`（旧）、`DESIGN.md`、`GOAL.md`、`progress.md`、`docs/directory-structure.md`、`src/App.tsx`、`src/context/SuggestionsContext.tsx`、`src/data/`、`src/services/`、`src/utils/`、`src/tests/`、`.cursor/rules/`（project / design / test / backend-poc）、`.cursor/hooks/`、`.claude/skills/`（planning / tdd / review / design-mock / loop-engineering）、`.claude/commands/`、`.github/workflows/`、`package.json`、`vite.config.ts`、`wrangler.toml`、`supabase/migrations/`、`.env.example`

追加分: `suggestionRepository.ts`、`memorySuggestionRepository.ts`、`persistentSuggestionRepository.ts`（ここに `KeyValueStorage` と `createPersistentSuggestionRepository`）、`supabaseSuggestionRepository.ts`、`supabaseSuggestionsRemoteClient.ts`、`createDefaultSuggestionRepository.ts`、`src/tests/services/*`、`src/tests/context/SuggestionsContext.test.tsx`

### 現在のテスト

`npm test -- --run` … **16ファイル / 65件、すべて成功**（Goal C Iteration 11 時点）。カバレッジ閾値は `vite.config.ts` で 80%。Goal B 完了時は 13ファイル / 50件だった。

### Goal

- Goal A: 達成（Iteration 2）
- Goal B: 達成（Iteration 5）
- Goal C: **未達**（Iteration 11 で実疎通 STOP。その後 Free Project 作成まで。migration 未適用、実 list/create 未確認）

### 永続化されるデータ

投稿の作成と一覧（`PersistentSuggestionRepository` → Web Storage、キー `digital-suggestion-box:suggestions`）。同一ブラウザのリロードが対象。

### 永続化されないデータ

共感、ステータス変更、管理者回答（Context の `useState` のみ）。下書きは別キーへ書くが復元なし。添付は未保存。

### この指示文の想定と、実際のコードで異なっていた点

- `KeyValueStorage` は独立ファイルではなく `persistentSuggestionRepository.ts` 内の interface
- 実装ループの前に **Iteration 0**（環境構築）がある。指示文の 1〜5 は実装周
- 指示文のテスト件数推移は、ローカル実行結果と一致（38→43→45→49→50）。Iteration 3 は件数変化なし
- ループ／永続化の変更は **未コミット**。`main` の最新コミットは Workers CI 追加まで。公開 URL が Goal B 済みとは言えない
- `wrangler.toml` は静的 `dist` 配信のまま。KV / D1 / API ルートは無い
- GitHub Pages は `workflow_dispatch`（手動）。Workers が `main` push の本線
- pages は `src/services` を import していない。Context は `createDefaultSuggestionRepository` 経由（env なしなら Persistent）。SDK は Context に無い
- Goal C の Supabase Project は作成済み。migration はリモート未適用。`.env.local` 未設定
- 接続情報（URL / Key / Secret / DB password）は本資料・Git に書かない
- 下書きの `localStorage` は投稿永続化とは別（`suggestion-box-draft`）
- 「Service 層」というディレクトリ名は無く、契約名は `SuggestionRepository`
