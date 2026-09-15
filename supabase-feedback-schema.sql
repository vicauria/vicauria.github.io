-- ============================================================
-- 意見箱（feedback）資料表
-- 在 Supabase 專案的「SQL Editor」貼上這整份，按 Run 執行即可。
-- ============================================================

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references auth.users(id) on delete set null,
  advisor_email text,
  category text default '',
  message text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- 任何已登入的使用者都可以新增一筆意見
create policy "登入者可以新增意見"
  on public.feedback for insert
  with check (auth.uid() = advisor_id);

-- 注意：這裡刻意不開放一般使用者「讀取」意見箱的內容——
-- 你自己要看所有人寫的意見，直接到 Supabase 後台「Table Editor」→ feedback 這張表看就好，
-- 那邊是用你自己的管理權限進去，不受這裡的規則限制。
