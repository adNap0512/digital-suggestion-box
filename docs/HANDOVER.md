# デジタル目安箱 引き継ぎ

育休中に、ほかのメンバーが現状を把握するための資料です。操作の細かい説明は操作マニュアル、仕様の詳細は `README.md` を見てください。

パスワード、秘密鍵、管理者メールアドレス、ユーザーUUIDは書きません。

---

## プロジェクト概要

社内の困りごと、改善アイデア、相談を投稿する試作アプリです。一般の人は投稿と一覧を使い、管理者はログインして投稿を削除できます。

保存の窓口は Repository です。画面は Supabase を直接呼びません。

```txt
画面
  ↓
SuggestionsContext
  ↓
SuggestionRepository（list / create / delete）
  ↓
Memory / Web Storage / Supabase のいずれか
```

通常の起動で Supabase の URL と公開キーがあるときは Supabase、無いときはブラウザの Web Storage です。Memory は主にテストと初期の試作で使います。

## 現在の完成状況

Goal A（Repository とメモリ保存）、Goal B（Web Storage）、Goal C（Supabase への一覧と作成）は達成しています。

その後に入っているもの:

- みんなの投稿と自分の投稿の切り替え（コミット `f09d4d0`）
- 詳細を、選んだカードの近くに表示
- 管理者ログインと、未ログイン時は管理画面へ入れない制御
- 管理者だけが削除できるデータベース権限

共通PFのAPI接続は作っていません。方針は、共通PFからこのアプリの公開URLをリンクすることです。

## 公開URL

本線は Cloudflare Workers です。Workers は計算用のサーバではなく、ビルドした画面ファイルの置き場所です。

| 画面 | URL |
|---|---|
| トップ | https://digital-suggestion-box.kyuu0512.workers.dev/#/ |
| 投稿 | https://digital-suggestion-box.kyuu0512.workers.dev/#/post |
| 一覧 | https://digital-suggestion-box.kyuu0512.workers.dev/#/list |
| 管理者ログイン | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin/login |
| 管理者画面 | https://digital-suggestion-box.kyuu0512.workers.dev/#/admin |

補助の GitHub Pages:

https://adnap0512.github.io/digital-suggestion-box/#/

パスの先頭が `/#/` なのは、HashRouter（URLの `#` より後ろで画面を切り替える方式）のためです。

## GitHubリポジトリ

https://github.com/adNap0512/digital-suggestion-box

ブランチは `main` です。`main` へ push すると、Workers 向けの GitHub Actions が動きます。

## ローカル環境の起動方法

```powershell
cd C:\Users\kyuu0\OneDrive\Desktop\Cursor\EFU_GW\EFUPF\digital-suggestion-box
npm.cmd install
npm.cmd run dev
```

接続先は `.env.local` に書きます。このファイルは Git に含まれません。名前の見本は `.env.example` です。

## テスト・ビルド方法

```powershell
npm.cmd test -- --run
npm.cmd run build
```

2026-11-19 の結果は、23ファイル / 128テスト成功、ビルド成功です。テストは本番の Supabase にはつながりません。`.env.test` が URL と公開キーを空にして、開発用の `.env.local` を上書きします。

## デプロイ方法

`main` へ push すると、`.github/workflows/deploy.yml` がテスト、ビルド、Cloudflare Workers への配信を順に行います。手元から本番データベースを変更する操作は不要です。

GitHub の Repository secrets に、次の6項目が登録済みです。

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ADMIN_LOGIN_ID`
- `VITE_ADMIN_AUTH_EMAIL`

値の確認や再発行は、GitHub の Settings と、Supabase の管理画面で行います。

## 管理者認証の仕組み

1. ログイン画面で管理者IDとパスワードを入れる。
2. Supabase がある環境では、管理者IDを対応するメールアドレスに読み替え、Supabase Auth がパスワードを照合する。
3. 照合のあと、データベース関数 `is_suggestion_admin()` が真の人だけ管理者になる。
4. 未ログインで `/admin` を開くと `/admin/login` へ戻る。これは画面上の制御。
5. 投稿を消せるかは、画面ではなく RLS（行ごとのアクセスルール）で決まる。名簿 `suggestion_admins` にいるログイン済みユーザーだけが削除できる。

Supabase の URL が無い開発時だけ、`VITE_ADMIN_ID` と `VITE_ADMIN_PASSWORD` の仮ログインを使います。本番のビルドでは、この仮ログインは成功しません。仮パスワードを GitHub Secrets に入れないでください。

## Supabaseの設定状況

プロジェクト名は `digital-suggestion-box-goal-c`、リージョンは東京、プランは Free です。

担当者が 2026-11-19 に確認した内容:

- `suggestions` の RLS は有効
- 管理者認証用 SQL `supabase/migrations/20261021130000_secure_admin_suggestions.sql` を本番に適用済み
- `suggestion_admins` に管理者を1人登録済み
- `anon` の DELETE 権限は撤回済み
- 管理者限定の DELETE ポリシーを確認済み

この引き継ぎを書いた作業では、本番データベースへ接続していません。再現手順は `docs/ADMIN_AUTH_SETUP.md` です。

投稿として残る列は、タイトル、本文、カテゴリ、匿名フラグ、記名なら名前、作成日時です。

## 必要な環境変数の名前

| 名前 | 役割 | 秘密か |
|---|---|---|
| `VITE_SUPABASE_URL` | 接続先 | 公開ビルドに含まれる |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ブラウザ用の公開キー | 公開ビルドに含まれる |
| `VITE_ADMIN_LOGIN_ID` | 画面に入力する管理者ID | 公開ビルドに含まれる |
| `VITE_ADMIN_AUTH_EMAIL` | 上のIDに対応する Auth のメール | 公開ビルドに含まれる |
| `VITE_ADMIN_ID` | 開発時だけの仮ID | 公開ビルドでは使わない |
| `VITE_ADMIN_PASSWORD` | 開発時だけの仮パスワード | Git にも公開ビルドにも入れない |

`service_role`、Secret Key、データベースのパスワードは、フロントにも GitHub Actions のこのビルドにも置いていません。

## 未実装機能

- 一般利用者のアカウント
- 添付ファイルの保存
- 共感、ステータス、管理者回答のデータベース保存
- 再読み込み後の「自分の投稿」復元
- 下書きの自動復元
- 共通PFのAPI接続

## 既知の問題・制約

- Supabase から一覧を取り直すと、`isMine`（自分の投稿か）はすべて偽になる。作成した直後の画面にだけ、自分の投稿として残る。
- 共感、ステータス、回答を変えても、再読み込みで初期状態に戻る。削除だけがデータベースに残る。
- 画面で `/admin` を塞いでも、データベースが削除を許可していれば、画面を経由しない削除は可能。現在の本番は、担当者確認では管理者以外の削除を拒否する状態。
- `supabase/.temp/` はローカル作業用のため Git に入れない。`supabase/config.toml` も今回の反映には含めていない。

## 今後の対応候補

- 公開URLで、管理者ログイン、ログアウト、削除、未ログイン時の拒否を人が1回ずつ確認する
- 共感、ステータス、回答をデータベースに残すか、画面だけと決める
- 共通PFへ載せる場合は、公開URLのリンクでよいかを確認する
- 詳細なAI活用の知見資料を別に作る

## 関連ドキュメント

| ファイル | 内容 |
|---|---|
| `README.md` | 現在の仕様、環境、公開方法 |
| `Report.md` | 発表時の記録と、2026-11-19 の追記 |
| `GOAL.md` | 実験の Goal。末尾にリンク方針の追記 |
| `progress.md` | ループの進捗。過去の Iteration も残してある |
| `DESIGN.md` | 見た目と画面の中身 |
| `docs/SCREEN_FLOW.md` | 画面の行き来 |
| `docs/ADMIN_AUTH_SETUP.md` | 管理者ログインの設定手順 |
| `docs/directory-structure.md` | フォルダの役割 |
| `docs/デジタル目安箱_操作マニュアル.docx` | 利用者向けの操作 |
| `docs/learning/` | ループエンジニアリングの学習資料 |

## 公開環境でまだ確認できていない項目

次は、自動テストが通ったこととは別です。

- 今回のコミットを push したあとの GitHub Actions が成功し、Workers に最新版が載ったか
- 公開URLで、未ログインの `/admin` がログイン画面へ戻るか
- 登録済み管理者でログインし、投稿を削除できるか
- ログアウト後に管理画面へ入れないか
- 一般の投稿と一覧が、最新の公開版でも引き続きできるか
- GitHub Pages 側は本線ではないため、Workers と同じ最新版とは限らない
