/* =========================================================
   Vicauria UI Kit（每個功能頁共用）
   1. 精簡頁首：把各功能最上方的大標題區縮小，說明文字收進「?」按鈕
   2. 品牌風格的對話框：vcConfirm（確認）、vcAlert（提示），取代瀏覽器內建的灰色跳窗
   3. 右下角小提示：vcToast
   ========================================================= */
(function(){
  if(window.__vcUiKit) return; window.__vcUiKit = true;

  const css = `
  /* ---- 精簡頁首 ---- */
  body:not(.vc-no-compact) header.hero{padding-top:22px !important; padding-bottom:40px !important; min-height:0 !important;}
  body:not(.vc-no-compact) header.hero h1{font-size:clamp(20px,2.6vw,24px) !important; line-height:1.4 !important; margin-bottom:0 !important;}
  body:not(.vc-no-compact) header.hero .eyebrow{margin-bottom:6px !important;}
  header.hero .vc-help-text{display:none !important;}
  header.hero.vc-help-open .vc-help-text{display:block !important; margin-top:10px !important;}
  .vc-help-btn{width:24px; height:24px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.55); background:rgba(255,255,255,0.08);
    color:#fff; font-size:13px; font-weight:700; line-height:1; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
    font-family:"Noto Sans TC",sans-serif; flex-shrink:0; padding:0; transition:background .15s; vertical-align:middle; margin-left:10px; position:relative; top:-2px;}
  .vc-help-btn:hover, header.hero.vc-help-open .vc-help-btn{background:rgba(255,255,255,0.25);}

  /* ---- 對話框 ---- */
  .vc-modal-mask{position:fixed; inset:0; background:rgba(15,30,38,0.45); display:flex; align-items:center; justify-content:center;
    z-index:10000; padding:20px; opacity:0; transition:opacity .15s ease;}
  .vc-modal-mask.show{opacity:1;}
  .vc-modal{background:#fff; border-radius:16px; width:100%; max-width:420px; box-shadow:0 30px 70px rgba(15,30,38,0.35);
    transform:translateY(8px) scale(.98); transition:transform .15s ease; overflow:hidden; font-family:"Noto Sans TC",sans-serif;}
  .vc-modal-mask.show .vc-modal{transform:none;}
  .vc-modal-body{padding:24px 24px 8px; display:flex; gap:14px; align-items:flex-start;}
  .vc-modal-icon{width:40px; height:40px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:19px;
    background:#E6F0F2; color:#1F5C73;}
  .vc-modal.danger .vc-modal-icon{background:rgba(179,73,47,0.1); color:#B3492F;}
  .vc-modal-title{font-size:16.5px; font-weight:700; color:#16323F; margin:6px 0 6px;}
  .vc-modal-msg{font-size:14px; color:#4F5F64; line-height:1.75; white-space:pre-line; word-break:break-word;}
  .vc-modal-actions{display:flex; justify-content:flex-end; gap:10px; padding:18px 24px 22px;}
  .vc-modal-actions button{border-radius:22px; padding:10px 20px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; border:1px solid transparent;}
  .vc-btn-cancel{background:#fff; border-color:#D5DDDC !important; color:#4F5F64;}
  .vc-btn-cancel:hover{background:#F5F7F6;}
  .vc-btn-ok{background:#16323F; color:#fff;}
  .vc-btn-ok:hover{background:#1F5C73;}
  .vc-modal.danger .vc-btn-ok{background:#B3492F;}
  .vc-modal.danger .vc-btn-ok:hover{background:#963B25;}
  .vc-modal-actions button:focus-visible{outline:3px solid rgba(46,115,145,0.45); outline-offset:2px;}

  /* ---- 小提示 ---- */
  .vc-toast-wrap{position:fixed; left:50%; bottom:28px; transform:translateX(-50%); z-index:10001; display:flex; flex-direction:column; gap:8px; align-items:center; pointer-events:none; width:calc(100% - 32px); max-width:440px;}
  .vc-toast{background:#16323F; color:#fff; font-size:14px; padding:12px 18px; border-radius:12px; box-shadow:0 12px 30px rgba(15,30,38,0.3);
    font-family:"Noto Sans TC",sans-serif; opacity:0; transform:translateY(10px); transition:opacity .2s, transform .2s; line-height:1.6; text-align:center;}
  .vc-toast.show{opacity:1; transform:none;}
  .vc-toast.ok{background:#2E7D5B;} .vc-toast.err{background:#B3492F;}
  /* ---- 骨架畫面（資料讀取中） ---- */
  .vc-sk-card{background:#fff; border:1px solid #E1E7E7; border-radius:14px; padding:18px 20px; margin-bottom:12px;}
  .vc-sk{display:block; height:13px; border-radius:7px; margin:10px 0;
    background:linear-gradient(90deg,#EDF1F0 25%,#F7F9F8 50%,#EDF1F0 75%); background-size:200% 100%; animation:vcSk 1.2s infinite;}
  .vc-sk.w30{width:30%; height:16px;} .vc-sk.w50{width:50%;} .vc-sk.w70{width:70%;} .vc-sk.w90{width:90%;}
  @keyframes vcSk{0%{background-position:200% 0;} 100%{background-position:-200% 0;}}
  @media (prefers-reduced-motion: reduce){ .vc-sk{animation:none;} }
  @media print{ .vc-modal-mask, .vc-toast-wrap, .vc-help-btn{display:none !important;} }
  `;
  const style = document.createElement('style'); style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  /* ---------------- 對話框 ---------------- */
  function modal(opts){
    return new Promise(resolve=>{
      const mask = document.createElement('div');
      mask.className = 'vc-modal-mask';
      const danger = !!opts.danger;
      mask.innerHTML = `
        <div class="vc-modal${danger ? ' danger' : ''}" role="dialog" aria-modal="true">
          <div class="vc-modal-body">
            <div class="vc-modal-icon">${danger ? '!' : (opts.kind === 'alert' ? 'i' : '?')}</div>
            <div><div class="vc-modal-title"></div><div class="vc-modal-msg"></div></div>
          </div>
          <div class="vc-modal-actions">
            ${opts.kind === 'confirm' ? '<button type="button" class="vc-btn-cancel"></button>' : ''}
            <button type="button" class="vc-btn-ok"></button>
          </div>
        </div>`;
      mask.querySelector('.vc-modal-title').textContent = opts.title || (opts.kind === 'confirm' ? '請確認' : '提醒');
      mask.querySelector('.vc-modal-msg').textContent = opts.message || '';
      const ok = mask.querySelector('.vc-btn-ok');
      ok.textContent = opts.okText || (danger ? '確定刪除' : '確定');
      const cancel = mask.querySelector('.vc-btn-cancel');
      if(cancel) cancel.textContent = opts.cancelText || '取消';
      const prevFocus = document.activeElement;
      function close(v){
        mask.classList.remove('show');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(()=> mask.remove(), 160);
        try{ prevFocus && prevFocus.focus && prevFocus.focus(); }catch(e){}
        resolve(v);
      }
      function onKey(e){
        if(e.key === 'Escape'){ e.preventDefault(); close(opts.kind === 'confirm' ? false : true); }
        if(e.key === 'Enter'){ e.preventDefault(); close(true); }
      }
      ok.addEventListener('click', ()=> close(true));
      if(cancel) cancel.addEventListener('click', ()=> close(false));
      mask.addEventListener('click', e=>{ if(e.target === mask) close(opts.kind === 'confirm' ? false : true); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(mask);
      requestAnimationFrame(()=> mask.classList.add('show'));
      setTimeout(()=> (danger && cancel ? cancel : ok).focus(), 30);
    });
  }
  // 刪除／移除類的訊息自動用紅色「危險」樣式
  const looksDanger = msg => /刪除|移除|收回|退出|清除|永久/.test(String(msg || ''));
  window.vcConfirm = function(message, o){
    o = o || {};
    return modal(Object.assign({ kind:'confirm', message, danger: o.danger !== undefined ? o.danger : looksDanger(message) }, o));
  };
  window.vcAlert = function(message, o){ return modal(Object.assign({ kind:'alert', message, okText:'知道了' }, o || {})); };
  // 舊程式裡的 alert() 一律改成品牌風格的提示框（不會擋住程式執行）
  window.alert = function(message){ window.vcAlert(message); };

  // 骨架佔位：讀取資料時先顯示灰色的卡片輪廓，避免誤以為「沒有資料」
  window.vcSkeleton = function(n){
    let h = '';
    for(let i = 0; i < (n || 3); i++) h += '<div class="vc-sk-card"><span class="vc-sk w30"></span><span class="vc-sk w90"></span><span class="vc-sk w50"></span></div>';
    return h;
  };

  /* ---------------- 小提示 ---------------- */
  let wrap = null;
  window.vcToast = function(message, type){
    if(!wrap){ wrap = document.createElement('div'); wrap.className = 'vc-toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'vc-toast' + (type ? ' ' + type : '');
    t.textContent = message;
    wrap.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 250); }, type === 'err' ? 4200 : 2600);
  };

  /* ---------------- 精簡頁首：說明文字收進「?」 ---------------- */
  function setupHeaders(){
    if(document.body.classList.contains('vc-no-compact')) return;
    document.querySelectorAll('header.hero').forEach(h=>{
      const h1 = h.querySelector('h1');
      if(!h1 || h.querySelector('.vc-help-btn')) return;
      const ps = Array.from(h.querySelectorAll('p')).filter(p=> !p.id && (p.textContent || '').trim().length > 24);
      if(!ps.length) return;
      ps.forEach(p=> p.classList.add('vc-help-text'));
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'vc-help-btn'; btn.textContent = '?';
      btn.setAttribute('aria-label', '這頁是做什麼的？'); btn.title = '這頁是做什麼的？';
      btn.addEventListener('click', ()=> h.classList.toggle('vc-help-open'));
      h1.appendChild(btn);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupHeaders);
  else setupHeaders();
})();
