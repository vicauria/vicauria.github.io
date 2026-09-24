// Vicauria 資產配置工作台 — 方案判斷共用邏輯
//
// =====================================================================
//  全面免費開放開關
//  true  ＝ 所有人所有功能全開：不分級、不顯示方案、沒有容量限制、看不到升級入口
//  false ＝ 恢復 Free／Pro／Master 分層收費機制（下面原本的試用期＋plan 欄位邏輯全部照舊運作）
//  之後要開始分級收費時，只要把這裡改成 false，再把首頁／條款頁的「方案與價格」連結加回來即可。
// =====================================================================
const FREE_FOR_ALL = true;

// 只要試用期還沒到，不管 profiles.plan 欄位寫什麼，都當作 pro 等級對待；
// 試用期一過，就照 plan 欄位原本的等級運作。
const TRIAL_EFFECTIVE_PLAN = 'pro'; // 試用期間比照哪個等級

async function fetchEffectivePlan(){
  // 全面免費開放期間：每個人都拿到最高權限（功能面等同 master），但畫面上不會顯示任何方案名稱
  if(FREE_FOR_ALL) return { plan: 'master', inTrial: false, trialEndsAt: null, freeForAll: true };

  try{
    const { data: { session } } = await supabaseClient.auth.getSession();
    if(!session) return { plan: 'free', inTrial: false, trialEndsAt: null };

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('plan, trial_ends_at')
      .eq('id', session.user.id)
      .single();
    if(error || !data) return { plan: 'free', inTrial: false, trialEndsAt: null };

    const rawPlan = data.plan || 'free';
    const trialEndsAt = data.trial_ends_at;
    const inTrial = !!trialEndsAt && new Date(trialEndsAt) > new Date();

    return {
      plan: inTrial ? TRIAL_EFFECTIVE_PLAN : rawPlan,
      inTrial,
      trialEndsAt
    };
  }catch(e){
    return { plan: 'free', inTrial: false, trialEndsAt: null };
  }
}

function daysLeft(dateStr){
  if(!dateStr) return 0;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (24*60*60*1000)));
}
