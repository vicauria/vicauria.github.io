/* Vicauria 進程推進回報：共用常數、週次計算、回報卡片（顧問的「進程回報」頁與團隊主管週報共用） */
(function(){
  'use strict';
  var PURPOSES = ['暖場：搜集資料','引發興趣-開門','問卷開發','拓展人脈','增員','提案、建議書說明','其他'];
  var DOW = ['日','一','二','三','四','五','六'];
  var NO_SUPPORT = /^(無|沒有|不需要|目前不需要|暫無|no|none|n\/a|-|—)$/i;

  function pad(n){ return String(n).padStart(2, '0'); }
  function ymd(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s){ var p = String(s || '').split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
  function addDays(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function today(){ var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  // 一週＝週一到週日
  function weekStart(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; }
  function md(s){ var d = parse(s); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + DOW[d.getDay()] + '）'; }
  function weekLabel(ws){ var we = addDays(ws, 6); return md(ymd(ws)) + ' ～ ' + md(ymd(we)); }
  function daysFromToday(s){ return Math.round((parse(s) - today()) / 86400000); }
  function needsSupport(t){ t = String(t || '').trim(); return !!t && !NO_SUPPORT.test(t); }

  function el(tag, cls, text){ var e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }

  // 下一次接觸的標籤
  function nextBadge(s){
    var n = daysFromToday(s);
    if(n < 0) return { cls:'late', text:'已過 ' + (-n) + ' 天' };
    if(n === 0) return { cls:'today', text:'今天' };
    if(n === 1) return { cls:'soon', text:'明天' };
    return { cls: n <= 3 ? 'soon' : '', text: n + ' 天後' };
  }

  /* 一筆回報的卡片。opts.actions = [{label, cls, onClick}]；opts.showAdvisor = 顧問名稱 */
  function card(r, opts){
    opts = opts || {};
    var c = el('div', 'pr-card');
    var head = el('div', 'pr-head');
    var who = el('div', 'pr-who');
    who.appendChild(el('b', '', r.contact_name));
    who.appendChild(el('span', 'pr-no', '第 ' + r.meet_no + ' 次會面'));
    head.appendChild(who);
    head.appendChild(el('span', 'pr-date', md(r.meet_date) + (opts.showAdvisor ? '・' + opts.showAdvisor : '')));
    c.appendChild(head);
    c.appendChild(el('div', 'pr-meta', [r.relation, r.age ? r.age + ' 歲' : '', r.job].filter(Boolean).join('・')));

    var chips = el('div', 'pr-chips');
    (r.purposes || []).forEach(function(p){
      chips.appendChild(el('span', p === '提案、建議書說明' ? 'hot' : p === '增員' ? 'rec' : '', p === '其他' && r.purpose_other ? '其他：' + r.purpose_other : p));
    });
    c.appendChild(chips);

    var trust = el('div', 'pr-trust');
    trust.appendChild(el('span', 'k', '信任度'));
    var bar = el('div', 'bar'), fill = el('i');
    fill.style.width = (r.trust * 10) + '%';
    fill.className = r.trust >= 7 ? 'hi' : r.trust >= 4 ? 'mid' : 'lo';
    bar.appendChild(fill); trust.appendChild(bar);
    trust.appendChild(el('b', '', r.trust + ' / 10'));
    c.appendChild(trust);

    var rows = el('div', 'pr-rows');
    function row(k, v, cls){ var d = el('div', 'pr-row' + (cls ? ' ' + cls : '')); d.appendChild(el('span', 'k', k)); d.appendChild(el('span', 'v', v)); rows.appendChild(d); return d; }
    row('案件進程總結', r.summary);
    row('下一步推進計畫', r.next_plan);
    var nb = nextBadge(r.next_contact);
    var nr = row('預計下次接觸', md(r.next_contact));
    nr.querySelector('.v').appendChild(el('em', 'pr-badge ' + nb.cls, nb.text));
    row('需要支援', r.need_support, needsSupport(r.need_support) ? 'support' : '');
    if(r.tomorrow_plan) row('明日排訪及安排', r.tomorrow_plan);
    c.appendChild(rows);

    if(opts.actions && opts.actions.length){
      var act = el('div', 'pr-actions');
      opts.actions.forEach(function(a){
        var b = el('button', 'pr-btn' + (a.cls ? ' ' + a.cls : ''), a.label); b.type = 'button';
        b.addEventListener('click', function(){ a.onClick(r); });
        act.appendChild(b);
      });
      c.appendChild(act);
    }
    return c;
  }

  var CSS = '' +
    '.pr-card{background:#fff;border:1px solid #E1E7E7;border-radius:14px;padding:16px 18px;margin-bottom:10px;}' +
    '.pr-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;}' +
    '.pr-who{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}' +
    '.pr-who b{font-size:16px;color:#16323F;}' +
    '.pr-no{font-size:12px;font-weight:700;color:#1F5C73;background:#E6F0F2;border-radius:10px;padding:1px 9px;}' +
    '.pr-date{font-size:12.5px;color:#5B6B70;font-family:"Roboto Mono",monospace;}' +
    '.pr-meta{font-size:13px;color:#5B6B70;margin-top:2px;}' +
    '.pr-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 6px;}' +
    '.pr-chips span{font-size:12.5px;font-weight:700;border-radius:12px;padding:2px 10px;background:#F1F4F4;color:#16323F;}' +
    '.pr-chips span.hot{background:#FBEFE2;color:#A85F27;}' +
    '.pr-chips span.rec{background:#E3F2EA;color:#2E7D5B;}' +
    '.pr-trust{display:grid;grid-template-columns:4em 1fr 4em;gap:8px;align-items:center;font-size:12.5px;color:#5B6B70;margin:4px 0 8px;}' +
    '.pr-trust .bar{height:8px;border-radius:4px;background:#EEF2F2;overflow:hidden;}' +
    '.pr-trust .bar i{display:block;height:100%;}' +
    '.pr-trust .bar i.hi{background:#2E7D5B;}.pr-trust .bar i.mid{background:#2E7391;}.pr-trust .bar i.lo{background:#C97B3D;}' +
    '.pr-trust b{font-family:"Roboto Mono",monospace;color:#16323F;text-align:right;}' +
    '.pr-rows{display:flex;flex-direction:column;gap:6px;}' +
    '.pr-row{display:grid;grid-template-columns:8.5em 1fr;gap:10px;font-size:13.5px;}' +
    '.pr-row .k{color:#5B6B70;font-size:12.5px;padding-top:1px;}' +
    '.pr-row .v{color:#182226;white-space:pre-wrap;overflow-wrap:anywhere;}' +
    '.pr-row.support .v{color:#A85F27;font-weight:700;}' +
    '.pr-badge{font-style:normal;font-size:11.5px;font-weight:700;border-radius:10px;padding:1px 8px;margin-left:8px;background:#F1F4F4;color:#5B6B70;white-space:nowrap;}' +
    '.pr-badge.late{background:#FBE7E2;color:#B3492F;}.pr-badge.today{background:#FBEFE2;color:#A85F27;}.pr-badge.soon{background:#E6F0F2;color:#1F5C73;}' +
    '.pr-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px dashed #E1E7E7;}' +
    '.pr-btn{border:1.5px solid #E1E7E7;background:#fff;color:#16323F;border-radius:16px;padding:6px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:36px;}' +
    '.pr-btn.primary{background:#16323F;border-color:#16323F;color:#fff;}' +
    '.pr-btn.danger{color:#B3492F;border-color:rgba(179,73,47,.4);}' +
    '@media (max-width:560px){.pr-row{grid-template-columns:1fr;gap:0;}}';
  function injectCSS(){
    if(document.getElementById('vcProgressCSS')) return;
    var s = document.createElement('style'); s.id = 'vcProgressCSS'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------- 每日 KPI／案件推進 ---------- */
  var METRICS = [
    { k:'leads', l:'新增名單' }, { k:'invites', l:'邀約' }, { k:'appts', l:'約訪成功' },
    { k:'meetings', l:'面談（需求分析）', s:'面談' }, { k:'proposals', l:'提案／規劃書', s:'提案' },
    { k:'deals', l:'成交' }, { k:'referrals', l:'轉介紹' }
  ];
  var STAGES = ['名單','接觸','約訪','需求分析','提案','成交','售後／轉介','暫停／流失'];
  var ACTIVE = STAGES.slice(0, 5);
  var SOURCES = ['人脈','轉介紹','自媒體','活動','其他'];
  var DEFAULT_KPI = { targets:{ leads:3, invites:10, appts:2, meetings:1, proposals:0, deals:0, referrals:0 }, reward_days:4, penalty_days:2 };
  // 所有有目標（>0）的項目都達到才算當日達標
  function dayMet(rec, targets){
    targets = targets || {};
    var keys = METRICS.filter(function(m){ return (targets[m.k] || 0) > 0; });
    if(!rec || !keys.length) return false;
    return keys.every(function(m){ return (rec[m.k] || 0) >= targets[m.k]; });
  }
  // 進行中案件的警示：沒有下一步、已逾期、14 天以上沒更新
  function caseFlags(c){
    if(ACTIVE.indexOf(c.stage) < 0) return [];
    var f = [], t = ymd(today());
    if(!c.next_date || !c.next_action) f.push(['bad', '沒有下一步']);
    else if(c.next_date < t) f.push(['bad', '逾期 ' + (-daysFromToday(c.next_date)) + ' 天']);
    if(c.updated_on){ var n = -daysFromToday(c.updated_on); if(n >= 14) f.push(['warn', n + ' 天沒更新']); }
    return f;
  }
  function isWon(c){ return c.stage === '成交' || c.stage === '售後／轉介'; }

  window.VCProgress = { PURPOSES: PURPOSES, ymd: ymd, parse: parse, addDays: addDays, today: today, weekStart: weekStart,
    md: md, weekLabel: weekLabel, daysFromToday: daysFromToday, needsSupport: needsSupport, nextBadge: nextBadge, card: card, injectCSS: injectCSS, DOW: DOW,
    METRICS: METRICS, STAGES: STAGES, ACTIVE: ACTIVE, SOURCES: SOURCES, DEFAULT_KPI: DEFAULT_KPI, dayMet: dayMet, caseFlags: caseFlags, isWon: isWon };
})();
