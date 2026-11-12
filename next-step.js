/* Vicauria 公開健檢／評估報告的「下一步」區塊：
   初步 vs 完整的比較、為什麼需要有人陪、30 分鐘會得到什麼、意願選擇（高／中／低意願，顧問依此優先聯絡）。
   財務健檢（quick-check.html）與房產活化評估（property-check.html）共用。 */
(function(){
  'use strict';
  function el(tag, cls, text){ var e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
  var SVG = {
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="16" cy="16" r="3"/><path d="M16 14.5V16l1 1"/>',
    bank:'<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z"/>',
    home:'<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  function icon(name){
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.innerHTML = SVG[name] || SVG.home; return s;
  }
  var CSS = '' +
    '.ns-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:12px;align-items:stretch;margin-top:24px;}' +
    '.ns-row > .cta{margin-top:0;}' +
    '.ns-guide{background:#fff;border:1.5px solid var(--line);border-radius:18px;padding:20px 18px;display:flex;flex-direction:column;justify-content:center;gap:10px;text-align:left;}' +
    '.ns-guide .eb{font-family:"Roboto Mono",monospace;font-size:11.5px;letter-spacing:.16em;color:var(--teal-deep);font-weight:700;}' +
    '.ns-guide b{font-family:"Noto Serif TC",serif;font-size:18px;color:var(--navy);line-height:1.45;}' +
    '.ns-guide p{margin:0;font-size:14px;color:var(--ink-soft);line-height:1.7;}' +
    '.ns-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:none;border-radius:14px;background:var(--warm);color:#fff;font:inherit;font-weight:700;font-size:16px;padding:14px 16px;min-height:52px;cursor:pointer;text-align:center;}' +
    '.ns-btn:hover{background:var(--warm-deep);}' +
    '.ns-btn.dark{background:var(--navy);} .ns-btn.dark:hover{background:#0E2430;}' +
    '.ns-btn:disabled{opacity:.6;cursor:default;}' +
    '.ns-arrow{display:inline-block;animation:nsBob 1.6s ease-in-out infinite;}' +
    '@keyframes nsBob{0%,100%{transform:translateY(0);}50%{transform:translateY(3px);}}' +
    '@media (prefers-reduced-motion:reduce){.ns-arrow{animation:none;}}' +
    '.ns-box{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px 18px;margin-top:22px;}' +
    '.ns-chip{display:table;margin:0 auto 10px;background:var(--paper);border-radius:14px;padding:3px 12px;font-size:13px;color:var(--ink-soft);font-weight:700;}' +
    '.ns-h{font-family:"Noto Serif TC",serif;font-size:20px;color:var(--navy);text-align:center;line-height:1.5;margin:0;}' +
    '.ns-lead{text-align:center;color:var(--ink-soft);font-size:14.5px;margin:8px 0 0;line-height:1.7;}' +
    '.ns-cmp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}' +
    '.ns-cmp > div{border-radius:14px;padding:14px;background:var(--paper);}' +
    '.ns-cmp > div.next{background:#F1F8F4;border:1.5px solid #9CCBB2;}' +
    '.ns-cmp .tg{display:inline-block;font-size:12px;font-weight:700;border-radius:10px;padding:1px 9px;background:#E7ECEC;color:var(--ink-soft);}' +
    '.ns-cmp .next .tg{background:#DDF0E5;color:#2E7D5B;}' +
    '.ns-cmp b{display:block;font-size:16px;color:var(--navy);margin:8px 0 6px;}' +
    '.ns-cmp ul{list-style:none;margin:0;padding:0;font-size:13.5px;color:var(--ink-soft);line-height:1.9;}' +
    '.ns-cmp .next ul{color:var(--ink);}' +
    '.ns-sub{font-family:"Noto Serif TC",serif;font-size:18px;color:var(--navy);margin:22px 0 10px;padding-top:18px;border-top:1px solid var(--line);}' +
    '.ns-why{display:grid;grid-template-columns:42px 1fr;gap:4px 12px;margin-bottom:14px;}' +
    '.ns-why .ic{grid-row:1/3;width:42px;height:42px;border-radius:12px;background:var(--paper);display:flex;align-items:center;justify-content:center;color:var(--navy);}' +
    '.ns-why .ic svg{width:22px;height:22px;}' +
    '.ns-why b{font-size:15.5px;color:var(--navy);line-height:1.5;}' +
    '.ns-why span{font-size:13.5px;color:var(--ink-soft);line-height:1.7;}' +
    '.ns-dark{background:var(--navy);color:#fff;border-radius:16px;padding:18px;margin-top:6px;}' +
    '.ns-dark b{display:block;font-family:"Noto Serif TC",serif;font-size:19px;line-height:1.5;}' +
    '.ns-dark p{margin:6px 0 0;color:#CFE2E8;font-size:14px;line-height:1.75;}' +
    '.ns-steps{list-style:none;margin:6px 0 0;padding:0;}' +
    '.ns-steps li{display:grid;grid-template-columns:28px 1fr;gap:2px 12px;position:relative;padding-bottom:14px;}' +
    '.ns-steps li:not(:last-child)::after{content:"";position:absolute;left:13px;top:30px;bottom:2px;width:2px;background:var(--line);}' +
    '.ns-steps .n{grid-row:1/3;width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;}' +
    '.ns-steps b{font-size:15px;color:var(--navy);}' +
    '.ns-steps b em{font-style:normal;color:var(--warm-deep);margin-right:6px;}' +
    '.ns-steps span{font-size:13.5px;color:var(--ink-soft);line-height:1.7;}' +
    '.ns-note{font-size:12.5px;color:var(--ink-soft);background:var(--paper);border-radius:10px;padding:9px 12px;line-height:1.7;}' +
    '.ns-quote{border-left:4px solid var(--warm);background:var(--warm-tint);border-radius:0 14px 14px 0;padding:14px 16px;margin-top:22px;}' +
    '.ns-quote b{display:block;font-family:"Noto Serif TC",serif;font-size:17px;color:var(--navy);line-height:1.6;}' +
    '.ns-quote p{margin:6px 0 0;font-size:14px;color:var(--ink);line-height:1.8;}' +
    '.ns-q{font-size:16px;font-weight:700;color:var(--navy);margin:18px 0 8px;}' +
    '.ns-q:first-of-type{margin-top:4px;}' +
    '.ns-q small{font-weight:500;color:var(--ink-soft);font-size:12.5px;margin-left:6px;}' +
    '.ns-opts{display:flex;flex-direction:column;gap:8px;}' +
    '.ns-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:1.5px solid #E1E7E7;border-radius:12px;padding:11px 14px;font:inherit;font-size:15px;color:var(--ink);cursor:pointer;min-height:48px;}' +
    '.ns-opt .dot{flex-shrink:0;width:22px;height:22px;border-radius:50%;border:2px solid #C3CDCE;display:flex;align-items:center;justify-content:center;}' +
    '.ns-opt[aria-pressed="true"]{border-color:var(--navy);background:#F3F7F8;}' +
    '.ns-opt[aria-pressed="true"] .dot{border-color:var(--navy);}' +
    '.ns-opt[aria-pressed="true"] .dot::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--navy);}' +
    '.ns-err{color:#B3492F;font-size:13.5px;min-height:1.4em;margin:8px 0 4px;font-weight:700;}' +
    '.ns-done{text-align:center;padding:6px 0;}' +
    '.ns-done .ok{width:52px;height:52px;border-radius:50%;background:#E3F2EA;color:#2E7D5B;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:26px;font-weight:700;}' +
    '.ns-done > b{display:block;font-family:"Noto Serif TC",serif;font-size:19px;color:var(--navy);}' +
    '.ns-done p{margin:8px 0 0;color:var(--ink-soft);font-size:14px;line-height:1.75;}' +
    '.ns-done .sum b{font-weight:700;color:var(--navy);}' +
    '.ns-done .sum{display:inline-block;text-align:left;background:var(--paper);border-radius:12px;padding:10px 14px;margin-top:12px;font-size:13.5px;line-height:1.9;}' +
    '.ns-link{background:none;border:none;color:var(--teal-deep);text-decoration:underline;text-underline-offset:3px;font:inherit;font-size:13.5px;cursor:pointer;margin-top:10px;}' +
    '@media (max-width:620px){.ns-row{grid-template-columns:1fr;} .ns-cmp{grid-template-columns:1fr;}}';
  function injectCSS(){
    if(document.getElementById('nsCSS')) return;
    var s = document.createElement('style'); s.id = 'nsCSS'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* cfg：{ kind, cta(元素), host(放內容的元素), advName, token, c:{文案…} } */
  function mount(cfg){
    injectCSS();
    var c = cfg.c, host = cfg.host, adv = cfg.advName || '顧問';
    host.textContent = '';

    // 1) 深色卡右邊的引導（原本空著的地方）
    if(cfg.cta && !cfg.cta.parentNode.classList.contains('ns-row')){
      var row = el('div', 'ns-row'); cfg.cta.parentNode.insertBefore(row, cfg.cta); row.appendChild(cfg.cta);
      var g = el('div', 'ns-guide');
      g.appendChild(el('div', 'eb', '只要 1 分鐘'));
      g.appendChild(el('b', '', c.guideTitle));
      g.appendChild(el('p', '', c.guideText.replace('{adv}', adv)));
      var gb = el('button', 'ns-btn'); gb.type = 'button';
      gb.appendChild(document.createTextNode(c.btn)); gb.appendChild(el('span', 'ns-arrow', '↓'));
      gb.addEventListener('click', function(){ var t = document.getElementById('nsIntent'); if(t) t.scrollIntoView({ behavior:'smooth', block:'start' }); });
      g.appendChild(gb);
      row.appendChild(g);
    }

    // 2) 初步 vs 完整
    var box = el('div', 'ns-box');
    box.appendChild(el('div', 'ns-chip', c.doneChip));
    var h = el('h2', 'ns-h'); c.title.forEach(function(t, i){ if(i) h.appendChild(document.createElement('br')); h.appendChild(document.createTextNode(t)); }); box.appendChild(h);
    box.appendChild(el('p', 'ns-lead', c.lead));
    var cmp = el('div', 'ns-cmp');
    [[c.left, ''], [c.right, 'next']].forEach(function(x){
      var d = el('div', x[1]); d.appendChild(el('span', 'tg', x[0].tag)); d.appendChild(el('b', '', x[0].name));
      var ul = el('ul'); x[0].items.forEach(function(t){ ul.appendChild(el('li', '', t)); }); d.appendChild(ul); cmp.appendChild(d);
    });
    box.appendChild(cmp);

    // 3) 為什麼需要有人陪
    box.appendChild(el('div', 'ns-sub', '為什麼需要有人陪你整理？'));
    c.why.forEach(function(w){
      var r = el('div', 'ns-why'); var ic = el('div', 'ic'); ic.appendChild(icon(w.icon)); r.appendChild(ic);
      r.appendChild(el('b', '', w.q)); r.appendChild(el('span', '', w.a)); box.appendChild(r);
    });
    var dk = el('div', 'ns-dark'); dk.appendChild(el('b', '', c.darkTitle)); dk.appendChild(el('p', '', c.darkText)); box.appendChild(dk);

    // 4) 30 分鐘會得到什麼
    box.appendChild(el('div', 'ns-sub', c.stepsTitle));
    var ol = el('ol', 'ns-steps');
    c.steps.forEach(function(s, i){
      var li = el('li'); li.appendChild(el('span', 'n', String(i + 1)));
      var b = el('b'); b.appendChild(el('em', '', s.t)); b.appendChild(document.createTextNode(s.h)); li.appendChild(b);
      li.appendChild(el('span', '', s.d)); ol.appendChild(li);
    });
    box.appendChild(ol);
    box.appendChild(el('div', 'ns-note', c.stepsNote));
    host.appendChild(box);

    // 5) 一句話
    var qt = el('div', 'ns-quote'); qt.appendChild(el('b', '', c.quoteTitle)); qt.appendChild(el('p', '', c.quoteText.replace('{adv}', adv))); host.appendChild(qt);

    // 6) 意願選擇
    var intentBox = el('div', 'ns-box'); intentBox.id = 'nsIntent'; intentBox.style.scrollMarginTop = '16px';
    host.appendChild(intentBox);
    var sel = { level:'', focus:'', time:'' };
    function group(key, title, opts, hint){
      intentBox.appendChild((function(){ var q = el('div', 'ns-q', title); if(hint) q.appendChild(el('small', '', hint)); return q; })());
      var wrap = el('div', 'ns-opts'); wrap.setAttribute('role', 'radiogroup'); wrap.setAttribute('aria-label', title);
      opts.forEach(function(o){
        var b = el('button', 'ns-opt'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.dataset.v = o.v || o;
        b.appendChild(el('span', 'dot')); b.appendChild(el('span', '', o.l || o));
        b.addEventListener('click', function(){
          sel[key] = b.dataset.v;
          wrap.querySelectorAll('.ns-opt').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
          err.textContent = '';
          if(key === 'level') syncReq();
        });
        wrap.appendChild(b);
      });
      intentBox.appendChild(wrap);
      return wrap;
    }
    var hTitle = el('h2', 'ns-h', c.intentTitle); hTitle.style.textAlign = 'left'; intentBox.appendChild(hTitle);
    intentBox.appendChild(el('p', 'ns-lead', c.intentLead)).style.textAlign = 'left';
    group('level', c.levelQ, c.levels);
    var focusWrap = group('focus', c.focusQ, c.focus);
    var timeWrap = c.times ? group('time', '你比較方便的聯繫時段？', c.times) : null;
    var err = el('div', 'ns-err'); err.setAttribute('role', 'alert'); intentBox.appendChild(err);
    var go = el('button', 'ns-btn dark', '確認我的預約意願'); go.type = 'button'; intentBox.appendChild(go);
    function syncReq(){
      var low = sel.level === 'low';
      [focusWrap, timeWrap].forEach(function(w){ if(w) w.previousSibling.querySelector('small') || w.previousSibling.appendChild(el('small', '')); });
      [focusWrap, timeWrap].forEach(function(w){ if(w) w.previousSibling.querySelector('small').textContent = low ? '（選填）' : ''; });
    }
    go.addEventListener('click', async function(){
      if(!sel.level){ err.textContent = '請先選擇你想怎麼繼續。'; return; }
      if(sel.level !== 'low' && (!sel.focus || (timeWrap && !sel.time))){ err.textContent = '請回答「' + c.focusQ.replace('？', '') + '」' + (timeWrap ? '和方便的聯繫時段' : '') + '。'; return; }
      go.disabled = true; go.textContent = '送出中…';
      // 沒有拿到 token（例如資料庫還沒更新）就不能假裝送出成功，否則顧問那邊會一直顯示「未表態」
      var ok = !!cfg.token && typeof supabaseClient !== 'undefined';
      if(ok){
        try{
          var res = await supabaseClient.rpc('vc_set_check_intent', { p_kind: cfg.kind, p_token: cfg.token, p_level: sel.level, p_focus: sel.focus || null, p_time: sel.time || null });
          if(res.error) ok = false;
        }catch(e){ ok = false; }
      }
      if(!ok){ go.disabled = false; go.textContent = '確認我的預約意願'; err.textContent = '送出失敗，請檢查網路後再試一次。'; return; }
      if(cfg.onIntent) try{ cfg.onIntent(sel.level); }catch(e){}
      done();
    });
    function done(){
      intentBox.textContent = '';
      var d = el('div', 'ns-done'); d.appendChild(el('div', 'ok', '✓'));
      var lv = c.levels.find(function(x){ return x.v === sel.level; });
      d.appendChild(el('b', '', sel.level === 'low' ? '收到，報告先留給你慢慢看' : '收到你的意願了'));
      d.appendChild(el('p', '', (sel.level === 'high' ? c.doneHigh : sel.level === 'mid' ? c.doneMid : c.doneLow).replace('{adv}', adv)));
      var sum = el('div', 'sum');
      [['你的選擇', lv ? lv.l : ''], ['最想整理', sel.focus], ['方便時段', sel.time]].forEach(function(x){ if(x[1]){ var r = el('div'); r.appendChild(el('b', '', x[0] + '：')); r.appendChild(document.createTextNode(x[1])); sum.appendChild(r); } });
      d.appendChild(sum);
      var again = el('button', 'ns-link', '改選'); again.type = 'button';
      again.addEventListener('click', function(){ mount(Object.assign({}, cfg, { cta:null })); document.getElementById('nsIntent').scrollIntoView({ block:'start' }); });
      d.appendChild(document.createElement('br')); d.appendChild(again);
      intentBox.appendChild(d);
    }
  }

  /* ---------- 兩份報告的文案 ---------- */
  var COPY = {
    quick: {
      guideTitle:'想把財務真正整理清楚？',
      guideText:'告訴 {adv} 你想怎麼繼續，顧問會依你的意願優先安排，不會強迫預約。',
      btn:'我要完成我的完整財務報表',
      doneChip:'你的免費初步健檢已完成',
      title:['你已經知道自己的財務分數。','但你真的算清楚自己的財務了嗎？'],
      lead:'剛剛的 15 題，只是初步了解你的收支與財務體質。真正完整的財務全貌，還有許多容易忽略的細節。',
      left:{ tag:'你剛完成的', name:'15 題初步快篩', items:['財務分數','每月收支概況','財務續航力','簡易三年推演'] },
      right:{ tag:'下一階段', name:'30 分鐘顧問引導', items:['完整現金流量表','完整資產負債表','逐項確認遺漏資料','釐清真正財務現況'] },
      why:[
        { icon:'calendar', q:'你有算進一年才繳一次的費用嗎？', a:'保費、稅金、旅遊、年度支出，常常不在每月帳單裡。' },
        { icon:'bank', q:'你的房貸，有分清本金跟利息嗎？', a:'每月還款不等於全部都是費用，也同時影響負債餘額。' },
        { icon:'home', q:'你知道自己真正的淨資產是多少嗎？', a:'房屋市值、投資、現金與剩餘負債，要放在一起看。' }
      ],
      darkTitle:'給自己 30 分鐘，把財務真正整理清楚。',
      darkText:'由顧問一對一免費引導，協助你完成現金流量表與資產負債表的主要項目，建立可以持續更新的個人財務基礎。',
      stepsTitle:'你的 30 分鐘，會得到什麼？',
      steps:[
        { t:'前 5 分鐘', h:'確認目前的初步報告', d:'先確認收入、支出、財務目標，以及初步填答是否有遺漏。' },
        { t:'第 5–15 分鐘', h:'建立現金流量表', d:'由顧問引導補齊固定與變動支出、年度費用、貸款本金利息、保費等項目。' },
        { t:'第 15–25 分鐘', h:'建立資產負債表', d:'整理現金、投資、不動產、貸款及其他負債，初步計算淨資產。' },
        { t:'最後 5 分鐘', h:'核對與說明', d:'確認資料是否完整，說明兩張報表的意義與後續需要補充的項目。' }
      ],
      stepsNote:'30 分鐘是服務目標，不是保證完成的時間。如果財務項目比較多或資料還沒備齊，可以之後補件、再一起完成，不會為了趕時間只把欄位填滿。',
      quoteTitle:'15 題讓你看見財務的輪廓，30 分鐘讓你真正建立自己的財務全貌。',
      quoteText:'很多人不是不會理財，而是從來沒有人帶他把自己的財務整理清楚。{adv} 會一對一引導，陪你完成個人現金流量表與資產負債表，讓每一筆收入、支出、資產與負債都有清楚的位置。',
      intentTitle:'你想進一步完成自己的財務全貌嗎？',
      intentLead:'選好之後按「確認」，顧問會依你的意願安排；30 分鐘的引導是免費的。',
      levelQ:'你想怎麼繼續？',
      levels:[ { v:'high', l:'我想預約 30 分鐘，完成兩大財務報表' }, { v:'mid', l:'我有興趣，但想先了解服務內容' }, { v:'low', l:'目前先看免費報告就好' } ],
      focusQ:'你目前最想整理的是？',
      focus:['想完整掌握自己的資產與現金流','想知道錢到底花去哪裡','想釐清房貸、負債與資產狀況','想為退休與未來目標做準備'],
      times:['平日白天','平日晚上','週末'],
      doneHigh:'{adv} 會優先和你聯繫，約一個你方便的時間，一起完成兩大財務報表。',
      doneMid:'{adv} 會先跟你說明 30 分鐘引導的內容，你了解之後再決定要不要預約。',
      doneLow:'沒問題，不會強迫預約。之後想整理的時候，回到這份報告按「改選」就可以。'
    },
    property: {
      guideTitle:'想知道你的房子還能怎麼用？',
      guideText:'告訴 {adv} 你想怎麼繼續，顧問會依你的意願優先安排，不會強迫預約。',
      btn:'我要完成我的房產效率診斷',
      doneChip:'你的免費初步評估已完成',
      title:['你已經大概知道房產的淨值。','但你真的算清楚它還能怎麼用了嗎？'],
      lead:'剛剛的 9 題，只是用區間粗估房產狀況。房產能不能活化、活化後每月壓力多少，還有許多要一起算的細節。',
      left:{ tag:'你剛完成的', name:'9 題初步評估', items:['房產淨值粗估','房產狀況重點','可以一起看的方向','初步活化潛力'] },
      right:{ tag:'下一階段', name:'30 分鐘房產效率診斷', items:['確認房產與貸款條件','比較不同活化方式','試算每月現金流與還款','放進退休與家庭規劃'] },
      why:[
        { icon:'home', q:'你知道房子現在真正的淨值嗎？', a:'市價、剩餘貸款、持有成本，要放在一起才算得出來。' },
        { icon:'cash', q:'活化之後，每月要多付多少？', a:'利息、還款年限和可運用資金，要和每月現金流一起看。' },
        { icon:'users', q:'家人和傳承有一起想進去嗎？', a:'房產常常牽動家人居住與未來傳承，不只是一筆數字。' }
      ],
      darkTitle:'給自己 30 分鐘，把房產這筆資產看清楚。',
      darkText:'由顧問一對一免費引導，整理房產淨值、貸款條件與每月現金流，看看在不賣房的前提下有哪些方向可以評估。',
      stepsTitle:'你的 30 分鐘，會得到什麼？',
      steps:[
        { t:'前 5 分鐘', h:'確認房產資料', d:'確認地區、用途、價值與貸款區間，以及你最在意的目標。' },
        { t:'第 5–15 分鐘', h:'整理淨值與可運用資金', d:'依房產與貸款條件，粗估淨值和可能可以運用的範圍。' },
        { t:'第 15–25 分鐘', h:'比較活化方向與每月現金流', d:'把不同做法的每月還款、現金流與風險放在一起比較。' },
        { t:'最後 5 分鐘', h:'核對與說明', d:'確認資料是否完整，說明下一步需要準備的文件與要注意的地方。' }
      ],
      stepsNote:'30 分鐘是服務目標，不是保證完成的時間；評估與諮詢也不保證貸款額度、投資收益或特定財務成果，實際條件依銀行與個人狀況而定。',
      quoteTitle:'9 題讓你看見房產的輪廓，30 分鐘讓你知道它還能怎麼用。',
      quoteText:'很多人的資產都在房子裡，卻從來沒有人陪他把房產、貸款和每月現金流一起算清楚。{adv} 會一對一引導，讓你在做任何決定之前，先看懂自己的選擇。',
      intentTitle:'你想進一步了解房產還能怎麼用嗎？',
      intentLead:'選好之後按「確認」，顧問會依你的意願安排；30 分鐘的診斷是免費的。',
      levelQ:'你想怎麼繼續？',
      levels:[ { v:'high', l:'我想預約 30 分鐘，做房產效率診斷' }, { v:'mid', l:'我有興趣，但想先了解服務內容' }, { v:'low', l:'目前先看評估結果就好' } ],
      focusQ:'你目前最想了解的是？',
      focus:['不賣房，多一筆可運用資金','創造每月現金流','降低房貸壓力','提前規劃退休或傳承'],
      times:null,
      doneHigh:'{adv} 會用你選的聯絡方式優先和你聯繫，約一個方便的時間做房產效率診斷。',
      doneMid:'{adv} 會先跟你說明 30 分鐘診斷的內容，你了解之後再決定要不要預約。',
      doneLow:'沒問題，不會強迫預約。之後想了解的時候，回到這個頁面按「改選」就可以。'
    }
  };

  window.VCNextStep = { mount: function(cfg){ cfg.c = cfg.c || COPY[cfg.kind]; mount(cfg); }, COPY: COPY };
})();
