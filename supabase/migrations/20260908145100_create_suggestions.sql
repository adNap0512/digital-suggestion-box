-- Goal C: 投稿の list / create 用最小テーブル。
-- UI の Suggestion 型をコピーしない。is_mine / 共感 / ステータス / 回答は列にしない。

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  is_anonymous boolean not null,
  author_name text,
  created_at timestamptz not null default now()
);

-- RLS と GRANT はセット。Policy だけでは default GRANT の UPDATE/DELETE が残ることがある。
alter table public.suggestions enable row level security;

revoke all on table public.suggestions from anon, authenticated;

-- Goal C は未ログインの publishable / anon のみ。authenticated には付与しない。
grant select, insert on table public.suggestions to anon;

create policy "anon can select suggestions"
on public.suggestions
for select
to anon
using (true);

create policy "anon can insert suggestions"
on public.suggestions
for insert
to anon
with check (true);

-- UPDATE / DELETE の Policy は作らない（禁止を明示するため GRANT も付けない）。
