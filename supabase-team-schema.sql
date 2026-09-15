-- ============================================================
-- 團隊工作量監控（team）
-- 在 Supabase 專案的「SQL Editor」貼上這整份，按 Run 執行即可。
--
-- 設計重點：Master 只看得到「數字」（底下顧問各狀態有幾位客戶），
-- 完全看不到客戶姓名、筆記、問卷內容這些實際資料——
-- 這是透過下面那個 get_team_workload 函式做到的：它會先確認呼叫者
-- 真的是這個團隊的主管，才回傳「已彙總好的數字」，從頭到尾不會把
-- client_records 的原始資料列傳出去。
-- ============================================================

-- 團隊本身：一個 Master 帳號可以建立一個團隊，有專屬邀請碼
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '我的團隊',
  invite_code text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz default now()
);

-- 團隊成員：記錄哪個顧問加入了哪個團隊
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  advisor_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(team_id, advisor_id)
);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- 團隊主管（owner）可以管理、查看自己的團隊
create policy "owner管理自己的團隊"
  on public.teams for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 任何登入者都可以查詢團隊基本資訊（用來輸入邀請碼加入），
-- 這張表本身只有團隊名稱和邀請碼，不含任何客戶資料，公開查詢沒有隱私疑慮
create policy "登入者可查詢團隊基本資訊"
  on public.teams for select
  using (true);

-- 顧問可以自己加入某個團隊（自助加入，不需要主管代為操作）
create policy "顧問可以自己加入團隊"
  on public.team_members for insert
  with check (auth.uid() = advisor_id);

-- 顧問看得到自己加入了哪些團隊
create policy "顧問看到自己的成員紀錄"
  on public.team_members for select
  using (auth.uid() = advisor_id);

-- 團隊主管看得到自己團隊裡有哪些成員
create policy "owner看到自己團隊的成員名單"
  on public.team_members for select
  using (exists (select 1 from public.teams t where t.id = team_members.team_id and t.owner_id = auth.uid()));

-- 團隊主管可以移除成員；顧問也可以自己退出
create policy "owner可以移除成員_或成員自己退出"
  on public.team_members for delete
  using (
    auth.uid() = advisor_id
    or exists (select 1 from public.teams t where t.id = team_members.team_id and t.owner_id = auth.uid())
  );


-- ============================================================
-- 核心：只回傳統計數字的安全函式
-- ============================================================
create or replace function public.get_team_workload(p_team_id uuid)
returns table(
  advisor_id uuid,
  display_name text,
  tracking_count bigint,
  proposal_count bigint,
  closed_count bigint,
  lost_count bigint,
  overdue_count bigint,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 先確認呼叫的人真的是這個團隊的主管，不是的話直接回傳空結果，什麼都不會洩漏
  if not exists (select 1 from teams where id = p_team_id and owner_id = auth.uid()) then
    return;
  end if;

  return query
  select
    tm.advisor_id,
    coalesce(p.display_name, '（未命名顧問）') as display_name,
    count(*) filter (where cr.status = 'tracking' and cr.deleted_at is null)::bigint as tracking_count,
    count(*) filter (where cr.status = 'proposal' and cr.deleted_at is null)::bigint as proposal_count,
    count(*) filter (where cr.status = 'closed' and cr.deleted_at is null)::bigint as closed_count,
    count(*) filter (where cr.status = 'lost' and cr.deleted_at is null)::bigint as lost_count,
    count(*) filter (where cr.follow_up_date <= current_date and cr.follow_up_date is not null and cr.deleted_at is null)::bigint as overdue_count,
    count(*) filter (where cr.deleted_at is null)::bigint as total_count
  from team_members tm
  left join profiles p on p.id = tm.advisor_id
  left join client_records cr on cr.advisor_id = tm.advisor_id
  where tm.team_id = p_team_id
  group by tm.advisor_id, p.display_name;
end;
$$;
