-- ============================================================
-- 免費試用期機制
-- 在 Supabase 的「SQL Editor」貼上這整份，按 Run 執行即可。
--
-- 邏輯：多加一個「試用到期日」欄位。只要這個日期還沒到，
-- 不管這個帳號原本 plan 欄位寫的是什麼，都會被當作 pro 等級對待
-- （客戶容量、主題色系都比照 pro）；試用期一過，就會照 plan 欄位
-- 原本的等級（預設是 free）運作。之後真的接上金流，只要把
-- plan 欄位改成付費對應的等級，就會自動接續下去，不用再管試用期欄位。
-- ============================================================

alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

-- 更新註冊觸發器：新註冊的帳號，自動獲得 60 天的試用期
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, trial_ends_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    now() + interval '60 days'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 幫「現在已經存在」的帳號（例如你自己之前建的測試帳號）也補上 60 天試用期，
-- 只補給還沒有設定過試用期、而且不是 master 的帳號（master 本來就已經全開了，不需要試用期這層）
update public.profiles
set trial_ends_at = now() + interval '60 days'
where trial_ends_at is null and plan != 'master';
