// Vicauria 資產配置工作台 — Supabase 連線設定
// 這裡的 Publishable key 本來就是設計給前端網頁直接使用的，公開在程式碼裡是安全的，
// 真正的資料保護是靠 Supabase 資料庫裡的 RLS（Row Level Security）規則在把關。

const SUPABASE_URL = 'https://inmtoymzpkprpmympaek.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sdZZ8VkCmNWb8j1GxcL2QQ_5dBuHS9p';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
