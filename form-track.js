/* Vicauria 公開表單填寫進度回報（預約諮詢表單、15 題財務健檢共用）
   只回報「填到第幾題、最後動到哪一題、走到哪個步驟」，不送出任何答案內容或個資。
   每次打開頁面產生一個亂數代號，不對應任何人；統計只有管理者看得到。 */
(function(){
  'use strict';
  function uuid(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function(x){ return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0,8) + '-' + h.slice(8,12) + '-' + h.slice(12,16) + '-' + h.slice(16,20) + '-' + h.slice(20);
  }

  window.VCFormTrack = function(form){
    var st = { id: uuid(), stage: 'open', answered: 0, last: null, internal: false };
    var device = (window.innerWidth || 1024) < 760 ? 'm' : 'd';
    var timer = null, dirty = false;
    var RANK = { open:0, questions:1, contact:2, submitted:3 };

    // 有登入工作台的瀏覽器（顧問自己測試）標記為內部，統計時可以排除
    try{
      if(typeof supabaseClient !== 'undefined') supabaseClient.auth.getSession().then(function(r){
        if(r && r.data && r.data.session){ st.internal = true; dirty = true; schedule(); }
      }).catch(function(){});
    }catch(e){}

    function params(){
      return { p_id: st.id, p_form: form, p_stage: st.stage, p_answered: st.answered, p_last: st.last, p_device: device, p_internal: st.internal };
    }
    function send(){
      timer = null; dirty = false;
      try{ if(typeof supabaseClient !== 'undefined') supabaseClient.rpc('vc_track_form', params()).then(function(){}, function(){}); }catch(e){}
    }
    function schedule(delay){ if(timer) clearTimeout(timer); timer = setTimeout(send, delay == null ? 1500 : delay); }
    // 離開頁面時把還沒送出的進度補送（keepalive 讓瀏覽器關掉分頁後仍會送出）
    function flush(){
      if(!dirty) return;
      if(timer){ clearTimeout(timer); timer = null; }
      dirty = false;
      try{
        fetch(SUPABASE_URL + '/rest/v1/rpc/vc_track_form', {
          method:'POST', keepalive:true,
          headers:{ 'Content-Type':'application/json', 'apikey':SUPABASE_ANON_KEY },
          body: JSON.stringify(params())
        }).catch(function(){});
      }catch(e){}
    }
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') flush(); });
    window.addEventListener('pagehide', flush);

    return {
      open: function(){ st.stage = 'open'; send(); },
      step: function(answered, lastKey){
        if(answered > st.answered) st.answered = answered;
        if(lastKey && /^[a-z0-9_]{1,20}$/.test(lastKey)) st.last = lastKey;
        if(st.stage === 'open') st.stage = 'questions';
        dirty = true; schedule();
      },
      stage: function(s){
        if(RANK[s] == null || RANK[s] < RANK[st.stage]) return;
        st.stage = s; dirty = true; schedule(s === 'submitted' ? 0 : 300);
      }
    };
  };
})();
