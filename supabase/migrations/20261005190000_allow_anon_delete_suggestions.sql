-- PoC: 管理者認証は未実装。
-- anon に DELETE を許すと、公開 URL を知る誰でも投稿を消せる。
-- UI の /admin は隠し場所であり、権限ではない。

grant delete on table public.suggestions to anon;

create policy "anon can delete suggestions"
on public.suggestions
for delete
to anon
using (true);
