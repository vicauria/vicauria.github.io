// Vicauria 資產配置工作台 — 方案判斷共用邏輯
// 只要試用期還沒到，不管 profiles.plan 欄位寫什麼，都當作 pro 等級對待；
// 試用期一過，就照 plan 欄位原本的等級運作。
// 之後接上金流，只要把 plan 欄位改成付費對應等級，會自動接續，不用再管這裡。

const TRIAL_EFFECTIVE_PLAN = 'pro'; // 試用期間比照哪個等級

async function fetchEffectivePlan(){
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
