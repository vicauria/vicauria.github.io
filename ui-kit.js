/* =========================================================
   Vicauria UI Kit（每個功能頁共用）
   1. 精簡頁首：把各功能最上方的大標題區縮小，說明文字收進「?」按鈕
   2. 品牌風格的對話框：vcConfirm（確認）、vcAlert（提示），取代瀏覽器內建的灰色跳窗
   3. 右下角小提示：vcToast
   ========================================================= */
(function(){
  if(window.__vcUiKit) return; window.__vcUiKit = true;

  const css = `
  /* ---- 統一頁首：每個功能的標題背景一樣高，內容與標題背景之間留固定空隙 ---- */
  /* 只套用在螢幕上：列印／存 PDF 時交給各頁自己的列印設定（例如報告要隱藏頁首） */
  @media screen{
  body:not(.vc-no-compact) header.hero, header.greet{
    min-height:128px !important; padding:20px 0 !important; box-sizing:border-box !important;
    display:flex !important; align-items:center !important;}
  body:not(.vc-no-compact) header.hero > .wrap, header.greet > .wrap{width:100%;}
  body:not(.vc-no-compact) header.hero h1{font-size:clamp(20px,2.6vw,24px) !important; line-height:1.4 !important; margin-bottom:0 !important;}
  body:not(.vc-no-compact) header.hero .eyebrow{margin-bottom:6px !important;}
  body:not(.vc-no-compact) header.hero p:not(.vc-help-text){margin:6px 0 0 !important;}
  body:not(.vc-no-compact) header.hero ~ main, header.greet ~ main{margin-top:20px !important;}
  }
  /* ---- 統一內容寬度：標題與內容同一條左邊線、同樣最大寬度 ---- */
  @media screen{
    body:not(.vc-no-compact) .wrap, body:not(.vc-no-compact) main.vc-wrap{
      max-width:1080px !important; margin-left:auto !important; margin-right:auto !important;
      padding-left:24px !important; padding-right:24px !important; box-sizing:border-box !important;}
  }
  @media screen and (max-width:640px){
    body:not(.vc-no-compact) .wrap, body:not(.vc-no-compact) main.vc-wrap{padding-left:16px !important; padding-right:16px !important;}
  }
  header.hero .vc-help-text{display:none !important;}
  header.hero.vc-help-open .vc-help-text{display:block !important; margin-top:10px !important;}
  .vc-help-btn{width:24px; height:24px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.55); background:rgba(255,255,255,0.08);
    color:#fff; font-size:13px; font-weight:700; line-height:1; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
    font-family:"Noto Sans TC",sans-serif; flex-shrink:0; padding:0; transition:background .15s; vertical-align:middle; margin-left:10px; position:relative; top:-2px;}
  .vc-help-btn::after{content:""; position:absolute; inset:-8px;}
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
  /* ---- 好懂的錯誤訊息 ---- */
  .vc-err-title{font-size:15px; font-weight:700; color:#16323F; margin:4px 0 6px;}
  .vc-err-msg{font-size:13.5px; color:#4F5F64; line-height:1.8;}
  .vc-err-details{margin:14px auto 0; max-width:480px; text-align:left; font-size:12px; color:#7A8A8F;}
  .vc-err-details summary{cursor:pointer; text-align:center; list-style:none; text-decoration:underline; text-underline-offset:3px;}
  .vc-err-details summary::-webkit-details-marker{display:none;}
  .vc-err-details pre{white-space:pre-wrap; word-break:break-word; font-family:"Roboto Mono",monospace; font-size:11.5px; color:#B3492F;
    background:#F5F7F6; padding:10px 14px; border-radius:8px; margin:8px 0 0;}
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

  /* ---------------- 好懂的錯誤訊息 ----------------
     把「Failed to fetch」這類技術訊息換成一般人看得懂的說明，技術細節收在可展開的區塊（回報問題時用） */
  window.vcFriendlyError = function(err, what){
    const raw = String((err && (err.message || err)) || '');
    const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let title, msg;
    if(typeof navigator !== 'undefined' && navigator.onLine === false){
      title = '網路好像斷線了';
      msg = '請確認 Wi-Fi 或行動網路有連上，再按上方「重新整理」。';
    }else if(/timeout|timed out|abort|逾時/i.test(raw)){
      title = '資料來源回應太慢';
      msg = '對方網站這次比較慢，等幾秒後按上方「重新整理」再試一次。';
    }else{
      title = (what || '資料') + '暫時抓不到';
      msg = '可能是網路不穩，或資料來源暫時沒有回應，通常過一下就會恢復。<br>請按上方「重新整理」再試一次；若一直失敗，可以展開下面的技術細節截圖，到「意見箱」告訴我們。';
    }
    return '<div class="icon">⚠️</div><div class="vc-err-title">' + title + '</div><div class="vc-err-msg">' + msg + '</div>'
      + (raw ? '<details class="vc-err-details"><summary>技術細節（回報問題時用）</summary><pre>' + esc(raw) + '</pre></details>' : '');
  };

  /* ---------------- 企業顯示設定（沒有加入企業的人完全不受影響，永遠是 Vicauria 預設） ---------------- */
  window.vcOrgBrand = function(){
    try{
      const b = JSON.parse(sessionStorage.getItem('vc_org_brand') || 'null');
      return (b && typeof b === 'object') ? b : null;
    }catch(e){ return null; }
  };
  // 報告最後的署名：固定是 Vicauria（企業版也一樣，不隨企業設定改變）
  window.vcSignHTML = function(prefix){
    prefix = prefix || '../';
    return '<div class="vc-sign"><img src="' + prefix + 'icons/vicauria-mark.png" alt=""><div><div class="t1">本報告由 Vicauria 財務顧問工作台產出</div><div class="t2"><b>vicauria.github.io</b>　｜　專為財務顧問打造的財務健檢與規劃工具</div></div></div>';
  };
  // 企業 Logo 網址（路徑只接受網站內 images/orgs/；沒有設定就回傳空字串）
  window.vcOrgLogoURL = function(prefix){
    const b = window.vcOrgBrand() || {};
    return /^images\/orgs\/[a-z0-9_-]{1,40}\.(png|jpg|jpeg|svg|webp)$/.test(b.logo_path || '') ? (prefix || '../') + b.logo_path : '';
  };
  // 企業品牌色與浮水印：只套用在工作台裡的各功能頁（iframe）；沒有設定就完全維持 Vicauria 預設
  (function applyOrgTheme(){
    try{
      if(window.self === window.top) return;
      const b = window.vcOrgBrand();
      if(!b) return;
      const root = document.documentElement;
      const hex = /^#[0-9a-fA-F]{6}$/.test(b.color || '') ? b.color : '';
      if(hex){
        const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
        const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
        if(lum <= 0.6){   // 太淺的顏色在白底與白字上會看不清楚，直接忽略
          const mix = (t, k) => '#' + c.map(v => Math.round(v * k + t * (1 - k)).toString(16).padStart(2, '0')).join('');
          root.style.setProperty('--teal', hex);
          root.style.setProperty('--teal-deep', mix(0, 0.78));
          root.style.setProperty('--navy', mix(0, 0.42));
          root.style.setProperty('--teal-tint', mix(255, 0.1));
          root.style.setProperty('--teal-light-text', mix(255, 0.35));
        }
      }
      const wm = String(b.watermark_text || '').trim().slice(0, 12);
      if(wm){
        const w = Array.from(wm).reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 26 : 15), 40);
        const x = wm.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='83'><text x='0' y='53' font-size='25' font-family='sans-serif' fill='rgba(22,50,63,0.055)' transform='rotate(-28 " + (w / 2) + " 41)'>" + x + "</text></svg>";
        root.style.setProperty('--vc-wm', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
      }
    }catch(e){}
  })();

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
