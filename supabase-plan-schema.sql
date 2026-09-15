-- ============================================================
-- 方案分級欄位（plan）
-- 在 Supabase 專案的「SQL Editor」貼上這整份，按 Run 執行即可。
-- ============================================================

-- 幫顧問個人資料表加一個「目前方案」欄位，預設是 free
alter table public.profiles
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'pro', 'master'));

-- ⚠️ 把「你自己」的帳號設成 master，這樣不管之後方案邏輯怎麼擋，你都看得到全部功能。
-- 下面這行的 Email 記得改成你自己註冊時用的那個信箱，改完再執行這一句：
update public.profiles
set plan = 'master'
where id = (select id from auth.users where email = '你的Email@example.com');

-- 確認一下有沒有改成功（跑完上面那句，再跑這句檢查結果）：
select u.email, p.display_name, p.plan
from public.profiles p
join auth.users u on u.id = p.id;
