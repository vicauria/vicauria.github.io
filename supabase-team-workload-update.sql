-- ============================================================
-- 更新 get_team_workload：加入「今日新增/更新客戶紀錄數」
-- 這份只是取代原本的函式，不會動到 teams / team_members 資料表本身，
-- 在 Supabase 的「SQL Editor」貼上這份、按 Run 執行即可，會直接覆蓋掉舊版本。
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
  total_count bigint,
  today_count bigint
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
    count(*) filter (where cr.deleted_at is null)::bigint as total_count,
    -- 用台北時區判斷「今天」，避免資料庫預設UTC時區跟台灣時間差8小時，半夜前後算錯天
    count(*) filter (
      where cr.deleted_at is null
      and (cr.saved_at at time zone 'Asia/Taipei')::date = (now() at time zone 'Asia/Taipei')::date
    )::bigint as today_count
  from team_members tm
  left join profiles p on p.id = tm.advisor_id
  left join client_records cr on cr.advisor_id = tm.advisor_id
  where tm.team_id = p_team_id
  group by tm.advisor_id, p.display_name;
end;
$$;
