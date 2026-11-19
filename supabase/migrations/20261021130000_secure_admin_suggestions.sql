-- 管理者認証用。投稿行は削除しない。
-- 既存の anon SELECT / INSERT ポリシーは drop しない。
-- SQL Editor で再実行しても失敗しにくいように、新規ポリシーは IF EXISTS で作り直す。

create table if not exists public.suggestion_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.suggestion_admins enable row level security;

-- クライアントからは管理者名簿を読めない・書けない。
revoke all on table public.suggestion_admins from public, anon, authenticated;

-- SECURITY DEFINER: 実行者は authenticated、表参照は関数所有者（SQL Editor では postgres）。
-- search_path を空にして、スキーマ修飾のみで参照する。
create or replace function public.is_suggestion_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.suggestion_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_suggestion_admin() from public, anon, authenticated;
grant execute on function public.is_suggestion_admin() to authenticated;

-- 匿名 DELETE は撤回（ポリシーが既に無い場合も IF EXISTS で安全）。
revoke delete on table public.suggestions from anon;
drop policy if exists "anon can delete suggestions" on public.suggestions;

-- 一般ユーザー向け SELECT / INSERT は維持・再確認。ポリシーは作り直さない。
grant select, insert on table public.suggestions to anon;

-- ログイン中の管理者も一覧・投稿できる。DELETE の実可否は RLS で判定する。
grant select, insert, delete on table public.suggestions to authenticated;
revoke update on table public.suggestions from public, anon, authenticated;

drop policy if exists "authenticated can select suggestions" on public.suggestions;
drop policy if exists "authenticated can insert suggestions" on public.suggestions;
drop policy if exists "admin can delete suggestions" on public.suggestions;

create policy "authenticated can select suggestions"
on public.suggestions
for select
to authenticated
using (true);

create policy "authenticated can insert suggestions"
on public.suggestions
for insert
to authenticated
with check (true);

create policy "admin can delete suggestions"
on public.suggestions
for delete
to authenticated
using ((select public.is_suggestion_admin()));
