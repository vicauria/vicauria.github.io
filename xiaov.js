/* =========================================================
   小V 小幫手（工作台浮動泡泡）
   - 題庫在 xiaov-kb.js，要新增問題改那個檔案就好
   - 比對方式：顧問輸入的問題 ↔ 每一題的關鍵字與標題，分數最高的就回答那一題
   - 對不到的題目 → 回覆「資料庫建置中」，顧問可以一鍵把問題送到意見箱，方便之後補進題庫
   ========================================================= */
(function(){
  if(window.__xiaovLoaded) return; window.__xiaovLoaded = true;
  const KB = window.XIAOV_KB || [];
  const CONTEXT = window.XIAOV_CONTEXT || {};
  const POS_KEY = 'vc_xiaov_pos';
  const HIDDEN_KEY = 'vc_xiaov_hidden';
  const CAT_LABEL = { op:'平台操作', case:'談 case', mind:'心態與習慣' };

  /* ---------------- 樣式 ---------------- */
  const css = `
  .xv-bubble{position:fixed; right:20px; bottom:24px; width:54px; height:54px; border-radius:50%;
    background:radial-gradient(circle at 30% 25%, #2E7391 0%, #16323F 75%); color:#fff;
    display:flex; align-items:center; justify-content:center; flex-direction:column;
    box-shadow:0 8px 24px rgba(20,50,60,0.35); cursor:grab; z-index:501; user-select:none; touch-action:none;
    border:2px solid rgba(255,255,255,0.9);}
  .xv-bubble:active{cursor:grabbing;}
  .xv-bubble .xv-v{font-family:"Noto Serif TC",Georgia,serif; font-weight:700; font-size:22px; line-height:1; pointer-events:none;}
  .xv-bubble .xv-lab{font-size:9px; letter-spacing:1px; opacity:.85; margin-top:1px; pointer-events:none; font-family:"Noto Sans TC",sans-serif;}
  .xv-bubble .xv-dot{position:absolute; top:2px; right:2px; width:11px; height:11px; border-radius:50%; background:#C97B3D; border:2px solid #fff; pointer-events:none;}
  .xv-panel{position:fixed; right:20px; bottom:90px; width:360px; height:520px; max-height:calc(100vh - 32px);
    background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(20,50,60,0.3); z-index:501;
    display:flex; flex-direction:column; overflow:hidden; font-family:"Noto Sans TC",sans-serif;
    opacity:0; pointer-events:none; visibility:hidden; transform:translateY(8px); transition:opacity .15s ease, transform .15s ease;}
  .xv-panel.open{opacity:1; pointer-events:auto; visibility:visible; transform:none;}
  .xv-head{background:var(--navy,#16323F); color:#fff; padding:12px 14px; display:flex; align-items:center; gap:10px; flex-shrink:0;}
  .xv-head .xv-ava{width:32px; height:32px; border-radius:50%; background:#fff; color:var(--navy,#16323F); display:flex; align-items:center; justify-content:center; font-family:"Noto Serif TC",Georgia,serif; font-weight:700; font-size:17px; flex-shrink:0;}
  .xv-head .xv-ttl{flex:1; min-width:0;}
  .xv-head .xv-ttl b{display:block; font-size:14px;}
  .xv-head .xv-ttl span{display:block; font-size:11px; opacity:.7;}
  .xv-head button{background:none; border:none; color:#fff; font-size:15px; cursor:pointer; opacity:.8; padding:4px 6px;}
  .xv-head button:hover{opacity:1;}
  .xv-body{flex:1; overflow-y:auto; padding:14px 12px; background:var(--paper,#F5F7F6);}
  .xv-msg{display:flex; margin-bottom:10px;}
  .xv-msg.me{justify-content:flex-end;}
  .xv-say{max-width:88%; padding:10px 12px; border-radius:14px; font-size:13px; line-height:1.75; color:var(--ink,#182226); word-break:break-word;}
  .xv-msg.bot .xv-say{background:#fff; border:1px solid var(--line-card,rgba(22,50,63,0.12)); border-top-left-radius:4px;}
  .xv-msg.me .xv-say{background:var(--teal,#2E7391); color:#fff; border-top-right-radius:4px;}
  .xv-say ul{margin:6px 0 2px; padding-left:18px;}
  .xv-say li{margin:3px 0;}
  .xv-say .xv-q{font-weight:700; color:var(--navy,#16323F); margin-bottom:4px;}
  .xv-say .xv-tag{display:inline-block; font-size:10.5px; font-weight:700; color:var(--warm-deep,#A85F27); background:var(--warm-tint,#FBEFE2); border-radius:6px; padding:1px 7px; margin-bottom:6px;}
  .xv-go, .xv-send-fb{display:block; width:fit-content; margin-top:8px; padding:6px 12px; border-radius:999px; border:1.5px solid var(--teal,#2E7391); background:#fff; color:var(--teal,#2E7391); font-size:12px; font-weight:700; cursor:pointer; font-family:inherit;}
  .xv-go:hover, .xv-send-fb:hover{background:var(--teal,#2E7391); color:#fff;}
  .xv-send-fb[disabled]{opacity:.5; cursor:default; background:#fff; color:var(--teal,#2E7391);}
  .xv-chips{display:flex; flex-wrap:wrap; gap:6px; margin:4px 0 12px;}
  .xv-chip{border:1px solid var(--line-card,rgba(22,50,63,0.15)); background:#fff; color:var(--navy,#16323F); border-radius:999px; padding:6px 11px; font-size:12px; cursor:pointer; text-align:left; line-height:1.5; font-family:inherit;}
  .xv-chip:hover{border-color:var(--teal,#2E7391); color:var(--teal,#2E7391);}
  .xv-chip.cat{background:var(--teal-tint,#E6F0F2); border-color:transparent; font-weight:700;}
  .xv-sub{font-size:11px; color:var(--ink-soft,#5B6B70); margin:2px 2px 6px; font-weight:700;}
  .xv-typing .xv-say{color:var(--ink-soft,#5B6B70); letter-spacing:3px;}
  .xv-foot{display:flex; gap:8px; padding:10px; border-top:1px solid var(--line-card,rgba(22,50,63,0.12)); background:#fff; flex-shrink:0;}
  .xv-foot input{flex:1; min-width:0; border:1px solid var(--line-card,rgba(22,50,63,0.2)); border-radius:10px; padding:9px 12px; font-size:13.5px; font-family:inherit; outline:none;}
  .xv-foot input:focus{border-color:var(--teal,#2E7391);}
  .xv-foot button{border:none; background:var(--navy,#16323F); color:#fff; border-radius:10px; padding:0 14px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;}
  .xv-note{font-size:10.5px; color:var(--ink-soft,#5B6B70); text-align:center; padding:0 10px 8px; background:#fff; flex-shrink:0;}
  @media (max-width:480px){
    .xv-panel{width:calc(100vw - 24px); height:72vh; right:12px !important; left:12px !important; top:auto !important; bottom:80px !important;}
    .xv-bubble{bottom:16px;}
  }
  @media print{ .xv-bubble, .xv-panel{display:none !important;} }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  /* ---------------- 畫面 ---------------- */
  const bubble = document.createElement('div');
  bubble.className = 'xv-bubble'; bubble.title = '小V 小幫手：有問題問我';
  bubble.innerHTML = '<span class="xv-v">V</span><span class="xv-lab">小V</span><span class="xv-dot"></span>';
  const panel = document.createElement('div');
  panel.className = 'xv-panel';
  panel.innerHTML = `
    <div class="xv-head">
      <div class="xv-ava">V</div>
      <div class="xv-ttl"><b>小V</b><span>你的工作台小幫手</span></div>
      <button class="xv-restart" title="重新開始">↺</button>
      <button class="xv-close" title="關閉">✕</button>
    </div>
    <div class="xv-body"></div>
    <form class="xv-foot"><input type="text" placeholder="輸入問題，例如：客戶說要考慮" maxlength="200"><button type="submit">送出</button></form>
    <div class="xv-note">小V 的建議僅供參考，實際作業請依公司規範</div>`;
  document.body.appendChild(bubble); document.body.appendChild(panel);
  const body = panel.querySelector('.xv-body');
  const input = panel.querySelector('.xv-foot input');

  /* ---------------- 工具 ---------------- */
  const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s||'').toLowerCase().replace(/[\s，。、？?！!,.；;：:「」『』（）()【】\-—~～…"'／/]/g,'');
  const byId = id => KB.find(e=>e.id===id);
  function myName(){
    try{ const t = document.getElementById('userName'); return t ? t.textContent.trim() : ''; }catch(e){ return ''; }
  }
  function currentFrame(){
    const f = document.querySelector('.content iframe.active, main iframe.active, iframe.active');
    return f ? f.id : 'frame-home';
  }
  function scrollDown(){ body.scrollTop = body.scrollHeight; }

  function bigrams(s){ const out = new Set(); for(let i=0;i<s.length-1;i++) out.add(s.slice(i,i+2)); return out; }

  // 分數：命中的關鍵字越長越多分；再加上跟題目標題的字詞重疊度
  function scoreEntry(q, e){
    let s = 0;
    (e.k||[]).forEach(k=>{ const nk = norm(k); if(nk && q.includes(nk)) s += Math.min(nk.length, 4) + 1; });
    const qb = bigrams(q), tb = bigrams(norm(e.t));
    if(qb.size && tb.size){
      let hit = 0; qb.forEach(b=>{ if(tb.has(b)) hit++; });
      s += (hit / Math.min(qb.size, tb.size)) * 4;
    }
    return s;
  }
  function search(text){
    const q = norm(text);
    if(!q) return [];
    return KB.map(e=>({ e, s: scoreEntry(q, e) }))
      .filter(x=>x.s > 0).sort((a,b)=> b.s - a.s);
  }

  /* ---------------- 訊息 ---------------- */
  function addMe(text){
    const d = document.createElement('div'); d.className = 'xv-msg me';
    d.innerHTML = `<div class="xv-say">${esc(text)}</div>`;
    body.appendChild(d); scrollDown();
  }
  function addBot(html){
    const d = document.createElement('div'); d.className = 'xv-msg bot';
    d.innerHTML = `<div class="xv-say">${html}</div>`;
    body.appendChild(d); scrollDown();
    return d;
  }
  function addChips(ids, label){
    const list = ids.map(byId).filter(Boolean);
    if(!list.length) return;
    const wrap = document.createElement('div');
    if(label) wrap.innerHTML = `<div class="xv-sub">${esc(label)}</div>`;
    const box = document.createElement('div'); box.className = 'xv-chips';
    list.forEach(e=>{
      const b = document.createElement('button'); b.type = 'button'; b.className = 'xv-chip'; b.textContent = e.t;
      b.addEventListener('click', ()=> ask(e.t, e.id));
      box.appendChild(b);
    });
    wrap.appendChild(box); body.appendChild(wrap); scrollDown();
  }
  function addCategoryChips(){
    const box = document.createElement('div'); box.className = 'xv-chips';
    Object.keys(CAT_LABEL).forEach(cat=>{
      const b = document.createElement('button'); b.type = 'button'; b.className = 'xv-chip cat';
      b.textContent = '看全部「' + CAT_LABEL[cat] + '」';
      b.addEventListener('click', ()=>{
        addMe('看全部「' + CAT_LABEL[cat] + '」的問題');
        addChips(KB.filter(e=>e.cat===cat).map(e=>e.id));
      });
      box.appendChild(b);
    });
    body.appendChild(box); scrollDown();
  }

  function renderAnswer(e){
    let html = `<span class="xv-tag">${CAT_LABEL[e.cat]||''}</span><div class="xv-q">${esc(e.t)}</div>${e.a}`;
    const d = addBot(html);
    if(e.go && typeof window.goToModule === 'function'){
      const b = document.createElement('button'); b.type = 'button'; b.className = 'xv-go';
      b.textContent = (e.goLabel || '前往') + ' →';
      b.addEventListener('click', ()=>{
        window.goToModule(e.go);
        if(window.innerWidth <= 480) closePanel();
      });
      d.querySelector('.xv-say').appendChild(b);
    }
  }

  function renderNotFound(text, near){
    const d = addBot('這題小V的資料庫還在建置中 🛠️<br>可以換個說法再問一次，或把這題送給開發團隊，之後小V就會學會。');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'xv-send-fb';
    b.textContent = '把這題送給開發團隊';
    b.addEventListener('click', async ()=>{
      b.disabled = true; b.textContent = '送出中…';
      const ok = await sendToFeedback(text);
      b.textContent = ok ? '✓ 已送出，謝謝你！' : '送出失敗，請改到意見箱留言';
      if(!ok) b.disabled = false;
    });
    d.querySelector('.xv-say').appendChild(b);
    if(near && near.length) addChips(near, '還是你想問的是：');
  }

  async function sendToFeedback(text){
    try{
      if(typeof supabaseClient === 'undefined') return false;
      const { data: { session } } = await supabaseClient.auth.getSession();
      if(!session) return false;
      const { error } = await supabaseClient.from('feedback').insert({
        advisor_id: session.user.id, advisor_email: session.user.email,
        category: 'other', message: '【小V 答不出來的問題】' + text
      });
      return !error;
    }catch(e){ return false; }
  }

  function smallTalk(q){
    if(/^(hi|hello|hey|嗨|哈囉|哈啰|你好|您好|安安|早安|午安|晚安|在嗎)/.test(q) && q.length <= 8)
      return `嗨${myName() ? ' ' + esc(myName()) : ''}！我是小V 👋 平台怎麼操作、談 case 遇到什麼狀況，直接打字問我就好。`;
    if(/^(謝謝|感謝|謝啦|thank|3q|好的|了解|ok|收到)/.test(q) && q.length <= 8)
      return '不客氣！還有其他問題隨時叫我 🙌';
    if(/(你是誰|你叫什麼|小v是誰|你會什麼|你能做什麼)/.test(q))
      return '我是小V，Vicauria 工作台的小幫手。我可以回答：<ul><li><b>平台操作</b>：功能在哪、怎麼用</li><li><b>談 case</b>：客戶說要考慮、沒預算、要問家人…怎麼回</li><li><b>心態與習慣</b>：被拒絕、名單用完、每天該做什麼</li></ul>';
    return null;
  }

  let busy = false;
  function ask(text, forceId){
    if(busy) return;
    text = String(text||'').trim(); if(!text) return;
    addMe(text);
    busy = true;
    const t = document.createElement('div'); t.className = 'xv-msg bot xv-typing';
    t.innerHTML = '<div class="xv-say">•••</div>'; body.appendChild(t); scrollDown();
    setTimeout(()=>{
      t.remove(); busy = false;
      if(forceId){ const e = byId(forceId); if(e){ renderAnswer(e); return; } }
      const talk = smallTalk(norm(text));
      if(talk){ addBot(talk); return; }
      const res = search(text);
      const best = res[0];
      if(best && best.s >= 3){
        renderAnswer(best.e);
        const more = res.slice(1, 4).filter(x=> x.s >= 3 && x.s >= best.s * 0.5).map(x=>x.e.id);
        if(more.length) addChips(more, '相關問題：');
      } else {
        renderNotFound(text, res.slice(0, 3).filter(x=>x.s >= 1.5).map(x=>x.e.id));
      }
    }, 420);
  }

  function welcome(){
    body.innerHTML = '';
    const n = myName();
    addBot(`嗨${n ? ' ' + esc(n) : ''}，我是小V 👋<br>平台不會用、談 case 卡關，都可以直接打字問我。`);
    addChips(CONTEXT[currentFrame()] || CONTEXT['frame-home'] || [], '你現在這頁常見的問題：');
    addCategoryChips();
  }

  /* ---------------- 開關與位置 ---------------- */
  let started = false;
  function positionPanel(){
    if(window.innerWidth <= 480) return; // 手機版用 CSS 固定在畫面下方
    const r = bubble.getBoundingClientRect();
    const w = panel.offsetWidth || 360, h = panel.offsetHeight || 520;
    let left = side === 'left' ? r.left : r.right - w, top = r.top - h - 12;
    if(top < 8) top = Math.min(r.bottom + 12, window.innerHeight - h - 8);
    left = Math.max(8, Math.min(window.innerWidth - w - 8, left));
    top = Math.max(8, top);
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
    panel.style.left = left + 'px'; panel.style.top = top + 'px';
  }
  function openPanel(){
    if(!started){ welcome(); started = true; }
    positionPanel(); panel.classList.add('open');
    const dot = bubble.querySelector('.xv-dot'); if(dot) dot.style.display = 'none';
    try{ localStorage.setItem('vc_xiaov_seen', '1'); }catch(e){}
    if(window.innerWidth > 480) setTimeout(()=> input.focus(), 50);
  }
  function closePanel(){ panel.classList.remove('open'); }
  try{ if(localStorage.getItem('vc_xiaov_seen') === '1') bubble.querySelector('.xv-dot').style.display = 'none'; }catch(e){}

  panel.querySelector('.xv-close').addEventListener('click', closePanel);
  panel.querySelector('.xv-restart').addEventListener('click', ()=>{ welcome(); input.focus(); });
  panel.querySelector('.xv-foot').addEventListener('submit', ev=>{
    ev.preventDefault(); const v = input.value; input.value = ''; ask(v);
  });
  window.xiaovAsk = (q)=>{ openPanel(); ask(q); }; // 之後其他頁面也可以直接呼叫小V

  // ---- 泡泡位置：只會貼在畫面左邊或右邊，拖曳放開後自動靠向比較近的那一邊（上下位置保留） ----
  const EDGE = window.innerWidth <= 480 ? 12 : 20;
  const SIZE = 54;
  let side = 'right', topPos = null; // topPos = null → 用預設的右下角
  function clampTop(t){ return Math.max(8, Math.min(window.innerHeight - SIZE - 8, t)); }
  function placeBubble(animate){
    bubble.style.transition = animate ? 'left .22s ease, right .22s ease, top .22s ease' : 'none';
    bubble.style.bottom = topPos === null ? '' : 'auto';
    bubble.style.top = topPos === null ? '' : clampTop(topPos) + 'px';
    if(side === 'left'){ bubble.style.left = EDGE + 'px'; bubble.style.right = 'auto'; }
    else { bubble.style.right = EDGE + 'px'; bubble.style.left = 'auto'; }
  }
  try{
    const p = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    if(p && (p.side === 'left' || p.side === 'right')){ side = p.side; topPos = typeof p.top === 'number' ? p.top : null; }
  }catch(e){}
  placeBubble(false);
  window.addEventListener('resize', ()=>{ placeBubble(false); if(panel.classList.contains('open')) positionPanel(); });

  // 拖曳：移動超過一點點才算拖曳，否則當作點擊
  let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
  bubble.addEventListener('pointerdown', e=>{
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY;
    const r = bubble.getBoundingClientRect(); ox = r.left; oy = r.top;
    try{ bubble.setPointerCapture(e.pointerId); }catch(err){}
  });
  bubble.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if(Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    if(!moved) return;
    const nl = Math.max(4, Math.min(window.innerWidth - SIZE - 4, ox + dx));
    const nt = clampTop(oy + dy);
    bubble.style.transition = 'none';
    bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
    bubble.style.left = nl + 'px'; bubble.style.top = nt + 'px';
  });
  bubble.addEventListener('pointerup', ()=>{
    if(!dragging) return; dragging = false;
    if(moved){
      const r = bubble.getBoundingClientRect();
      side = (r.left + SIZE / 2) < window.innerWidth / 2 ? 'left' : 'right';
      topPos = r.top;
      // 先用目前的 left 當起點，下一個畫格再換成貼邊，才會有滑過去的動畫
      if(side === 'right'){ bubble.style.left = 'auto'; bubble.style.right = (window.innerWidth - r.right) + 'px'; }
      requestAnimationFrame(()=>{ placeBubble(true); if(panel.classList.contains('open')) setTimeout(positionPanel, 230); });
      try{ localStorage.setItem(POS_KEY, JSON.stringify({ side, top: topPos })); }catch(e){}
      return;
    }
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  bubble.addEventListener('pointercancel', ()=>{ dragging = false; });

  // 頭像選單裡的「小V 小幫手：顯示／隱藏」
  function applyHidden(h){
    bubble.style.display = h ? 'none' : '';
    if(h) closePanel();
    document.querySelectorAll('#xiaovPills .chat-pill').forEach(p=>{
      p.classList.toggle('active', (p.dataset.xv === 'hide') === h);
    });
    try{ localStorage.setItem(HIDDEN_KEY, h ? '1' : '0'); }catch(e){}
  }
  let hidden = false; try{ hidden = localStorage.getItem(HIDDEN_KEY) === '1'; }catch(e){}
  applyHidden(hidden);
  document.querySelectorAll('#xiaovPills .chat-pill').forEach(p=>{
    p.addEventListener('click', ()=> applyHidden(p.dataset.xv === 'hide'));
  });
})();
