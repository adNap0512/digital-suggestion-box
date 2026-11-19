# 公開環境の管理者ログイン設定（Supabase Auth）

この変更は**コードだけでは完了しません**。Supabaseプロジェクト側の設定が必須です。

## 適用状況（2026-11-19）

担当者の確認では、本番へ `20261021130000_secure_admin_suggestions.sql` を適用済みです。`suggestion_admins` に管理者を1人登録し、`anon` の DELETE 権限は撤回済みです。以下は同じ状態を再現する手順として残します。パスワード、ユーザーUUID、メールアドレスの実値は書きません。

## デプロイ前に必須

1. Supabase SQL Editor / migrations で `20261021130000_secure_admin_suggestions.sql` を適用する。これにより匿名 DELETE 権限を撤回し、管理者以外の削除を拒否する。**先に適用するまで公開しない**。
2. Supabase Auth の管理者操作（Dashboard / 管理用サーバー）で管理者ユーザー1件を作成する。実在する管理用メールアドレスと**新しく設定した強いパスワード**を使用。チャットで共有済みの仮パスワードを本番で再利用しない。
3. Auth のユーザー UUID を確認し、SQL Editorから `insert into public.suggestion_admins(user_id) values ('<AuthユーザーUUID>');` を実行する。**このSQLをアプリ側へ置かない**。
4. デプロイ環境で `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ADMIN_LOGIN_ID`, `VITE_ADMIN_AUTH_EMAIL` を設定する。`VITE_ADMIN_LOGIN_ID` にはユーザーに示した管理者ID、`VITE_ADMIN_AUTH_EMAIL` には 2 のメールアドレスを設定する。いずれも公開JSに含まれる**非秘密情報**。パスワードや service_role は絶対に設定しない。
5. GitHub Pages と Workers のビルドパイプライン双方の env 設定を確認する。未設定の公開ビルドではログインできない。

## 検証

- 未ログインの `/admin` は `/admin/login` へ遷移。
- ID・PWが正しいだけでは管理者にならず、`suggestion_admins` に登録されたユーザーのみ成功。
- 管理者ログイン後 `/admin` へ進める。ログアウト後はアクセスできない。
- `anon` で投稿一覧・投稿作成できるが DELETE は拒否される。
- `authenticated` でも管理者以外の DELETE は拒否、管理者は DELETE 可。
- `suggestion_admins` テーブルに対する通常クライアントからの SELECT/INSERT は不可。

## 現行PoCの注意

- ステータス・回答・共感は現在メモリ上の画面状態だけでありDB永続化しない。
- `isMine` も DB には保存されない。Supabase から再取得した投稿は自分の投稿として復元されない。
- 開発環境で Supabase の URL/key が無い場合のみ、ローカル用 `VITE_ADMIN_ID` / `VITE_ADMIN_PASSWORD` 仮照合が使用される。これらは開発ブラウザに公開されるためローカル専用。
- 管理者ログイン後、Supabaseクライアントは認証済みロールになる。SELECT/INSERT の authenticated ポリシーも設けている。
- Authのユーザー作成・ロール登録は画面から実施しない。実際の管理者アカウント払い出しは手動で行う。
