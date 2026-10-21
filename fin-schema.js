/* Vicauria 收支／資產負債 共用分類（財富地圖、收支現金流、資產負債表、報告比較 共用）
   ─────────────────────────────────────────────────────────────
   分類完全照顧問的表格範本：
   收入：工作收入／理財收入
   支出：必要支出（生活、貸款、撫育、保險、稅賦、雜費、工作支出）
         理財支出（非合約、合約制）
         浮動支出（可調整、不可調）
   資產：流動性資產／流動性投資／非流動性投資／其他資產／自用動產、不動產
   負債：短期負債／長期負債

   資料結構（跟舊版相容）：每一個「小分類」是一個 group
     收支 group = {key, cat, title, hint, rows:[{name, monthly, once}]}
     資產負債 group = {key, cat, title, hint, rows:[{name, amount}]}
   大分類的合計 = 同一個 cat 的 group 加總。
   舊版存檔（沒有 cat 欄位）用 normalize* 自動對應到新分類。 */
(function(){
  'use strict';

  function dual(names){ return names.map(function(n){ return {name:n, monthly:0, once:0}; }); }
  function single(names){ return names.map(function(n){ return {name:n, amount:0}; }); }

  /* ---------------- 大分類 ---------------- */
  var INCOME_CATS = [
    {cat:'work',    title:'工作收入', sub:'工作收入小計'},
    {cat:'finance', title:'理財收入', sub:'理財收入小計'}
  ];
  var EXPENSE_CATS = [
    {cat:'necessary', title:'必要支出', sub:'必要支出小計', ratio:'固定支出／所得比'},
    {cat:'wealth',    title:'理財支出', sub:'理財支出小計', ratio:'理財支出／所得比'},
    {cat:'flexible',  title:'浮動支出', sub:'浮動支出小計', ratio:'浮動支出／所得比'}
  ];
  var ASSET_CATS = [
    {cat:'liquid',   title:'流動性資產',      sub:'流動性資產小計'},
    {cat:'liqinv',   title:'流動性投資',      sub:'流動性投資小計'},
    {cat:'illiquid', title:'非流動性投資',    sub:'非流動性投資小計'},
    {cat:'other',    title:'其他資產',        sub:'其他資產小計'},
    {cat:'property', title:'自用動產／不動產', sub:'不動產小計'}
  ];
  var LIAB_CATS = [
    {cat:'short', title:'短期負債', sub:'短期負債小計'},
    {cat:'long',  title:'長期負債', sub:'長期負債小計'}
  ];

  /* ---------------- 預設範例（顧問可以改名、刪除、新增） ---------------- */
  function defaultIncome(){ return [
    {key:'work', cat:'work', title:'工作收入', hint:'薪資、獎金等靠工作賺來的收入',
     rows: dual(['主業收入','免稅收入','年終獎金','三節獎金','其他收入','勞保','勞退'])},
    {key:'finance', cat:'finance', title:'理財收入', hint:'股息、租金等資產幫你賺的收入',
     rows: dual(['股息收入','股利收入','基金收入','目標到期債','營業收入','盈餘分紅','租金收入','其他收入'])}
  ]; }
  function defaultExpense(){ return [
    {key:'nec_living',   cat:'necessary', title:'生活',     hint:'吃、住、行、日常開銷', rows: dual(['基本餐費','房租','交通+維修費','健身房','電信費用','日常雜支費用'])},
    {key:'nec_loan',     cat:'necessary', title:'貸款',     hint:'每月要繳的貸款月付金', rows: dual(['房貸','信用貸款','車貸'])},
    {key:'nec_raise',    cat:'necessary', title:'撫育',     hint:'子女、父母', rows: dual(['子女學雜費','父母孝親費'])},
    {key:'nec_ins',      cat:'necessary', title:'保險',     hint:'保障型保費（儲蓄險請填「理財支出」）', rows: dual(['勞、健保','人壽保險費','產物保險費'])},
    {key:'nec_tax',      cat:'necessary', title:'稅賦',     hint:'一年繳一次的稅可填在「年繳／單筆」', rows: dual(['所得稅','房屋、地價稅','燃料、牌照稅'])},
    {key:'nec_misc',     cat:'necessary', title:'雜費',     hint:'', rows: dual(['紅包','串流平台'])},
    {key:'nec_work',     cat:'necessary', title:'工作支出', hint:'', rows: dual(['公積金','網卡','廣告'])},
    {key:'wl_free',      cat:'wealth',    title:'非合約',   hint:'可以隨時調整、暫停的存錢／投資', rows: dual(['零存整付存款','證券戶提撥','定期定額'])},
    {key:'wl_contract',  cat:'wealth',    title:'合約制',   hint:'有合約、要繳滿年期的儲蓄', rows: dual(['儲蓄保險','境外儲蓄保險'])},
    {key:'fx_adj',       cat:'flexible',  title:'可調整',   hint:'想省的時候可以先砍的', rows: dual(['娛樂費','聚餐費','治裝費','旅遊費','禮物'])},
    {key:'fx_fixed',     cat:'flexible',  title:'不可調',   hint:'不固定但很難不花', rows: dual(['電子用品','電器與家具','其他','寵物'])}
  ]; }
  function defaultAssets(){ return [
    {key:'liquid',   cat:'liquid',   title:'流動性資產',      hint:'隨時可以動用的錢', rows: single(['活存','緊急預備金','儲蓄險','境外儲蓄'])},
    {key:'liqinv',   cat:'liqinv',   title:'流動性投資',      hint:'可以隨時賣出換現金的投資，以目前市值估算', rows: single(['美股證券戶','台股證券戶','債券','期貨與選擇權','美金存款'])},
    {key:'illiquid', cat:'illiquid', title:'非流動性投資',    hint:'不容易馬上變現的投資', rows: single(['事業股份','不動產投資'])},
    {key:'other',    cat:'other',    title:'其他資產',        hint:'', rows: single(['黃金/珠寶','博弈投資'])},
    {key:'property', cat:'property', title:'自用動產／不動產', hint:'以目前市值估算', rows: single(['汽車/機車','土地','房屋'])}
  ]; }
  function defaultLiabilities(){ return [
    {key:'short', cat:'short', title:'短期負債', hint:'尚未還清的本金餘額', rows: single(['信用貸款','紓困貸款','親友借貸','保單貸款','標會（死會）'])},
    {key:'long',  cat:'long',  title:'長期負債', hint:'尚未還清的本金餘額', rows: single(['房貸','裝潢貸款','車貸','私人借貸'])}
  ]; }

  /* ---------------- 舊版存檔 → 新分類 ---------------- */
  // 舊大類 → 新小分類（找不到對應名稱時放這裡，保留原本的項目名稱）
  var OLD_EXPENSE_GROUP = {necessary:'nec_living', flexible:'fx_adj', insurance:'nec_ins', wealth:'wl_free', dependent:'nec_raise', loan:'nec_loan', misc:'nec_misc'};
  var OLD_INCOME_GROUP = {active:'work', passive:'finance'};
  var OLD_ASSET_GROUP = {liquid:'liquid', invest:'liqinv', realestate:'property', other:'other'};
  var OLD_LIAB_GROUP = {mortgage:'long', otherloan:'short', shortterm:'short'};
  // 舊項目名稱 → [新小分類, 新名稱]
  var OLD_NAME = {
    '房租':['nec_living','房租'], '房貸／房租':['nec_living','房租'], '三餐飲食':['nec_living','基本餐費'], '交通費':['nec_living','交通+維修費'],
    '娛樂消費':['fx_adj','娛樂費'], '治裝／美容':['fx_adj','治裝費'], '旅遊基金':['fx_adj','旅遊費'],
    '壽險／醫療險':['nec_ins','人壽保險費'], '定期定額':['wl_free','定期定額'], '儲蓄險':['wl_contract','儲蓄保險'],
    '子女教育費':['nec_raise','子女學雜費'], '孝親費':['nec_raise','父母孝親費'],
    '房貸月付金':['nec_loan','房貸'], '信貸／車貸':['nec_loan','信用貸款'],
    '薪資所得':['work','主業收入'], '年終獎金／分紅':['work','年終獎金'], '房租收入':['finance','租金收入'], '股息／利息收入':['finance','股息收入'],
    '活期存款':['liquid','活存'], '保單價值準備金':['liquid','儲蓄險'], '自住不動產':['property','房屋'], '車輛':['property','汽車/機車'],
    '房貸餘額':['long','房貸'], '信貸餘額':['short','信用貸款']
  };

  function isNew(groups, defs){
    if(!Array.isArray(groups) || !groups.length) return false;
    var keys = {}; defs.forEach(function(g){ keys[g.key] = 1; });
    return groups.every(function(g){ return g && g.cat && keys[g.key]; });
  }
  function hasValue(r, isDual){ return isDual ? ((+r.monthly||0) !== 0 || (+r.once||0) !== 0) : (+r.amount||0) !== 0; }

  function migrate(oldGroups, defs, groupMap, isDual){
    var byKey = {}; defs.forEach(function(g){ byKey[g.key] = g; });
    (oldGroups || []).forEach(function(og){
      if(!og || !Array.isArray(og.rows)) return;
      var fallback = groupMap[og.key] || defs[0].key;
      og.rows.forEach(function(r){
        if(!r || !hasValue(r, isDual)) return;
        var name = String(r.name || '').trim();
        var hit = OLD_NAME[name];
        var tKey = hit && byKey[hit[0]] ? hit[0] : fallback;
        var tName = hit && byKey[hit[0]] ? hit[1] : name;
        var g = byKey[tKey] || defs[0];
        var row = null;
        for(var i=0;i<g.rows.length;i++){ if(g.rows[i].name === tName){ row = g.rows[i]; break; } }
        if(!row){ row = isDual ? {name:tName, monthly:0, once:0} : {name:tName, amount:0}; g.rows.push(row); }
        if(isDual){ row.monthly = (row.monthly||0) + (+r.monthly||0); row.once = (row.once||0) + (+r.once||0); }
        else { row.amount = (row.amount||0) + (+r.amount||0); }
      });
    });
    return defs;
  }
  // 新版存檔：保留顧問改過的項目；預設裡有、存檔裡沒有的小分類補回去（不動既有資料）
  function fillMissing(groups, defs){
    var out = groups.slice();
    defs.forEach(function(d, idx){
      if(!out.some(function(g){ return g.key === d.key; })) out.splice(Math.min(idx, out.length), 0, d);
    });
    return out;
  }
  // v3.26.0 的長期負債曾有「自用／投資型不動產抵押貸款」兩列，之後合併成「房貸」：
  // 空白的直接拿掉，有金額的併進「房貸」
  var MERGE_TO_MORTGAGE = /^(自用|投資型)不動產抵押貸款$/;
  function mergeMortgageRows(groups){
    groups.forEach(function(g){
      if(!g || !Array.isArray(g.rows) || g.cat !== 'long') return;
      var olds = g.rows.filter(function(r){ return MERGE_TO_MORTGAGE.test(String(r.name||'').trim()); });
      if(!olds.length) return;
      var total = olds.reduce(function(s,r){ return s + (+r.amount||0); }, 0);
      var idx = g.rows.indexOf(olds[0]);
      g.rows = g.rows.filter(function(r){ return olds.indexOf(r) < 0; });
      var m = g.rows.find(function(r){ return String(r.name||'').trim() === '房貸'; });
      if(m) m.amount = (+m.amount||0) + total;
      else g.rows.splice(Math.min(idx, g.rows.length), 0, {name:'房貸', amount: total});
    });
    return groups;
  }
  function normalize(groups, defsFn, groupMap, isDual){
    var defs = defsFn();
    if(isNew(groups, defs)) return mergeMortgageRows(fillMissing(groups, defs));
    if(!Array.isArray(groups) || !groups.length) return defs;
    return migrate(groups, defs, groupMap, isDual);
  }

  /* ---------------- 計算 ---------------- */
  function n0(v){ return Math.max(0, Number(v)||0); }
  function rowAnnual(r){ return n0(r.monthly)*12 + n0(r.once); }
  function rowMonthly(r){ return n0(r.monthly); }
  function rowAmount(r){ return n0(r.amount); }
  function sumGroups(groups, fn, cat){
    return (groups||[]).reduce(function(s,g){
      if(cat && g.cat !== cat) return s;
      return s + g.rows.reduce(function(t,r){ return t + fn(r); }, 0);
    }, 0);
  }
  function catAnnual(groups, cat){ return sumGroups(groups, rowAnnual, cat); }
  function catMonthly(groups, cat){ return sumGroups(groups, rowMonthly, cat); }
  function catAmount(groups, cat){ return sumGroups(groups, rowAmount, cat); }
  function rowsWhere(groups, re, fn){
    return (groups||[]).reduce(function(s,g){ return s + g.rows.reduce(function(t,r){ return t + (re.test(String(r.name||'')) ? fn(r) : 0); }, 0); }, 0);
  }
  function groupByKey(groups, key){ return (groups||[]).find(function(g){ return g.key === key; }) || {rows:[]}; }

  // 不動產淨值不算進可用資金：資產＝非流動性投資裡的不動產＋自用的土地、房屋；負債＝不動產抵押貸款
  var RE_ASSET = /不動產|土地|房屋|房產|房子|房地/;
  var RE_LOAN = /不動產抵押|房貸|房屋貸款/;
  var RE_VEHICLE = /車|機車|汽車|船/;
  function realEstateAssets(assets){
    return (assets||[]).reduce(function(s,g){
      return s + g.rows.reduce(function(t,r){
        var name = String(r.name||'');
        var isRE = g.cat === 'property' ? !RE_VEHICLE.test(name) : (g.cat === 'illiquid' && RE_ASSET.test(name));
        return t + (isRE ? rowAmount(r) : 0);
      }, 0);
    }, 0);
  }
  // 非流動性投資裡的不動產（例如不動產投資）
  function realEstateInvest(assets){
    return (assets||[]).filter(function(g){ return g.cat === 'illiquid'; }).reduce(function(s,g){
      return s + g.rows.reduce(function(t,r){ return t + (RE_ASSET.test(String(r.name||'')) ? rowAmount(r) : 0); }, 0);
    }, 0);
  }
  function realEstateLoans(liabs){ return rowsWhere(liabs, RE_LOAN, rowAmount); }

  /* 收支摘要（月結算／年結算）
     淨收入＝總收入－理財支出（先存起來的錢）；總支出＝必要＋浮動；結餘現金流＝淨收入－總支出 */
  function cashSummary(income, expense){
    function pack(fn){
      var inc = sumGroups(income, fn), wl = sumGroups(expense, fn, 'wealth');
      var nec = sumGroups(expense, fn, 'necessary'), fx = sumGroups(expense, fn, 'flexible');
      var work = sumGroups(income, fn, 'work');
      return {income:inc, netIncome:inc-wl, wealth:wl, necessary:nec, flexible:fx, spend:nec+fx, balance:inc-wl-nec-fx, work:work, finance:inc-work};
    }
    return {month: pack(rowMonthly), year: pack(rowAnnual)};
  }

  /* ---------------- 報告用表格（只列有填金額的項目） ---------------- */
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(n){ var v = Math.round(n||0); return (v<0?'-$':'$') + Math.abs(v).toLocaleString('zh-TW'); }
  function pct(a, b){ return b > 0 ? (a/b*100).toFixed(1) + '%' : '—'; }

  // 收入或支出表：月 / 年 兩欄
  function cashTableHTML(kind, groups, totalIncomeYear, totalIncomeMonth){
    var cats = kind === 'income' ? INCOME_CATS : EXPENSE_CATS;
    var label = kind === 'income' ? '收入' : '支出';
    var html = '<table class="vf-table vf-' + kind + '"><thead><tr><th>' + (kind==='income'?'收入項目':'支出項目') + '</th><th>月' + label + '</th><th>年' + label + '</th></tr></thead><tbody>';
    var any = false;
    cats.forEach(function(c){
      var gs = groups.filter(function(g){ return g.cat === c.cat; });
      var yr = sumGroups(gs, rowAnnual), mo = sumGroups(gs, rowMonthly);
      if(yr <= 0) return;
      any = true;
      html += '<tr class="vf-cat"><td colspan="3">' + esc(c.title) + '</td></tr>';
      gs.forEach(function(g){
        var filled = g.rows.filter(function(r){ return rowAnnual(r) > 0; });
        if(!filled.length) return;
        if(kind !== 'income') html += '<tr class="vf-sub"><td colspan="3">' + esc(g.title) + '</td></tr>';
        filled.forEach(function(r){
          html += '<tr><td class="vf-item">' + esc(r.name || '（未命名）') + '</td><td class="num">' + (rowMonthly(r) ? money(rowMonthly(r)) : '—') + '</td><td class="num">' + money(rowAnnual(r)) + '</td></tr>';
        });
      });
      html += '<tr class="vf-subtotal"><td>' + esc(c.sub) + '</td><td class="num">' + money(mo) + '</td><td class="num">' + money(yr) + '</td></tr>';
      if(c.ratio) html += '<tr class="vf-ratio"><td>' + esc(c.ratio) + '</td><td class="num">' + pct(mo, totalIncomeMonth) + '</td><td class="num">' + pct(yr, totalIncomeYear) + '</td></tr>';
    });
    if(kind === 'income'){
      var work = sumGroups(groups, rowAnnual, 'work'), workM = sumGroups(groups, rowMonthly, 'work');
      var tot = sumGroups(groups, rowAnnual), totM = sumGroups(groups, rowMonthly);
      if(tot > 0){
        html += '<tr class="vf-total"><td>總收入</td><td class="num">' + money(totM) + '</td><td class="num">' + money(tot) + '</td></tr>';
        html += '<tr class="vf-ratio"><td>主動收入所得占比</td><td class="num">' + pct(workM, totM) + '</td><td class="num">' + pct(work, tot) + '</td></tr>';
      }
    } else {
      var totE = sumGroups(groups, rowAnnual), totEM = sumGroups(groups, rowMonthly);
      if(totE > 0) html += '<tr class="vf-total"><td>支出合計（含理財支出）</td><td class="num">' + money(totEM) + '</td><td class="num">' + money(totE) + '</td></tr>';
    }
    if(!any) html += '<tr><td colspan="3" class="vf-empty">尚未填寫' + label + '項目</td></tr>';
    return html + '</tbody></table>';
  }

  // 摘要表：月結算／年結算
  function summaryTableHTML(s){
    var rows = [
      ['總收入','income'], ['淨收入','netIncome'], ['理財支出','wealth'], ['必要開支','necessary'],
      ['浮動開支','flexible'], ['總支出','spend'], ['結餘現金流','balance']
    ];
    var html = '<table class="vf-table vf-summary"><thead><tr><th>摘要</th><th>月結算</th><th>年結算</th></tr></thead><tbody>';
    rows.forEach(function(r){
      var cls = r[1] === 'balance' ? ' class="vf-total vf-balance"' : (r[1] === 'netIncome' || r[1] === 'spend' ? ' class="vf-subtotal"' : '');
      var m = s.month[r[1]], y = s.year[r[1]];
      var style = r[1] === 'balance' ? function(v){ return ' style="color:' + (v < 0 ? 'var(--negative,#B3412E)' : 'var(--positive,#2E7D5B)') + '"'; } : function(){ return ''; };
      html += '<tr' + cls + '><td>' + r[0] + '</td><td class="num"' + style(m) + '>' + money(m) + '</td><td class="num"' + style(y) + '>' + money(y) + '</td></tr>';
    });
    return html + '</tbody></table>';
  }

  // 支出佔比圖（以淨收入為 100%：必要支出(含稅)／浮動支出／現金流結餘）。超支時以總支出為 100%
  function donutSVG(s, size){
    var y = s.year, r = 80, C = 2*Math.PI*r, size2 = size || 200;
    var segs = [
      {label:'必要支出（含稅）', v:y.necessary, color:'#1F5C73'},
      {label:'浮動支出', v:y.flexible, color:'#5FA8C7'},
      {label:'現金流結餘', v:Math.max(0, y.balance), color:'#2E7D5B'}
    ];
    var base = y.balance >= 0 ? y.netIncome : y.spend;
    var svg = '<svg viewBox="0 0 200 200" width="' + size2 + '" height="' + size2 + '" role="img" aria-label="支出佔比圖"><circle cx="100" cy="100" r="80" fill="none" stroke="#E7ECEC" stroke-width="30"></circle><g transform="rotate(-90 100 100)">';
    var cum = 0, legend = '';
    if(base > 0) segs.forEach(function(sg){
      if(sg.v <= 0) return;
      var len = sg.v / base * C;
      svg += '<circle cx="100" cy="100" r="80" fill="none" stroke="' + sg.color + '" stroke-width="30" stroke-dasharray="' + len.toFixed(2) + ' ' + (C-len).toFixed(2) + '" stroke-dashoffset="' + (-cum).toFixed(2) + '"></circle>';
      cum += len;
      legend += '<div class="vf-leg"><span class="vf-dot" style="background:' + sg.color + '"></span><span class="vf-leg-l">' + sg.label + '</span><span class="vf-leg-p">' + (sg.v/base*100).toFixed(1) + '%</span><span class="vf-leg-a">' + money(sg.v) + '</span></div>';
    });
    svg += '</g></svg>';
    var center = base > 0 ? (y.balance >= 0 ? (y.balance / y.netIncome * 100).toFixed(1) + '%' : money(y.balance)) : '—';
    var centerLbl = y.balance >= 0 ? '結餘占淨收入' : '收支缺口';
    var note = y.balance < 0 ? '<div class="vf-note">支出超過淨收入，圖以總支出為 100% 顯示。</div>' : '<div class="vf-note">以淨收入（總收入－理財支出）為 100%。</div>';
    return '<div class="vf-donut"><div class="vf-donut-ring">' + svg + '<div class="vf-donut-c"><b' + (y.balance<0?' style="color:var(--negative,#B3412E)"':'') + '>' + center + '</b><small>' + centerLbl + '</small></div></div><div class="vf-legend">' + legend + note + '</div></div>';
  }

  // 資產負債表：左資產、右負債，只列有填的項目
  function balanceTableHTML(assets, liabs){
    function side(groups, cats, kind){
      var html = '<table class="vf-table vf-' + kind + '"><thead><tr><th>' + (kind==='asset'?'資產':'負債') + '</th><th>金額</th></tr></thead><tbody>';
      var any = false;
      cats.forEach(function(c){
        var gs = groups.filter(function(g){ return g.cat === c.cat; });
        var tot = sumGroups(gs, rowAmount);
        if(tot > 0){
          any = true;
          html += '<tr class="vf-cat"><td colspan="2">' + esc(c.title) + '</td></tr>';
          gs.forEach(function(g){ g.rows.forEach(function(r){ if(rowAmount(r) > 0) html += '<tr><td class="vf-item">' + esc(r.name || '（未命名）') + '</td><td class="num">' + money(rowAmount(r)) + '</td></tr>'; }); });
          html += '<tr class="vf-subtotal"><td>' + esc(c.sub) + '</td><td class="num">' + money(tot) + '</td></tr>';
        }
        if(kind === 'asset' && c.cat === 'liqinv'){
          var both = sumGroups(groups, rowAmount, 'liquid') + sumGroups(groups, rowAmount, 'liqinv');
          if(both > 0) html += '<tr class="vf-subtotal vf-strong"><td>流動性資產與投資</td><td class="num">' + money(both) + '</td></tr>';
        }
      });
      if(!any) html += '<tr><td colspan="2" class="vf-empty">尚未填寫' + (kind==='asset'?'資產':'負債') + '</td></tr>';
      return html;
    }
    var A = sumGroups(assets, rowAmount), L = sumGroups(liabs, rowAmount);
    var left = side(assets, ASSET_CATS, 'asset') + '<tr class="vf-total"><td>資產總計</td><td class="num">' + money(A) + '</td></tr></tbody></table>';
    var right = side(liabs, LIAB_CATS, 'liab') + '<tr class="vf-total"><td>負債總計</td><td class="num">' + money(L) + '</td></tr>' +
      '<tr class="vf-total vf-net"><td>資產淨額</td><td class="num" style="color:' + (A-L<0?'var(--negative,#B3412E)':'var(--positive,#2E7D5B)') + '">' + money(A-L) + '</td></tr></tbody></table>';
    return '<div class="vf-bs"><div>' + left + '</div><div>' + right + '</div></div>';
  }

  var CSS = '' +
    '.vf-table{width:100%;border-collapse:collapse;font-size:13.5px;font-variant-numeric:tabular-nums}' +
    '.vf-table th{background:#1F3A47;color:#fff;font-weight:600;padding:8px 10px;text-align:right;white-space:nowrap}' +
    '.vf-table th:first-child{text-align:left}' +
    '.vf-table td{padding:6px 10px;border-bottom:1px solid #E6ECEC}' +
    '.vf-table td.num{text-align:right;white-space:nowrap}' +
    '.vf-table .vf-cat td{background:#EAF2F4;font-weight:700;color:#1F3A47;padding-top:9px}' +
    '.vf-table .vf-sub td{color:#5B6B70;font-size:12.5px;font-weight:600;padding:5px 10px 3px 16px;border-bottom:none}' +
    '.vf-table td.vf-item{padding-left:24px}' +
    '.vf-table .vf-subtotal td{font-weight:700;background:#F6F8F8}' +
    '.vf-table .vf-subtotal td:first-child::before{content:"＊";color:#8A9AA0;margin-right:2px}' +
    '.vf-table.vf-summary .vf-subtotal td:first-child::before{content:none}' +
    '.vf-table .vf-ratio td{color:#5B6B70;font-size:12.5px}' +
    '.vf-table .vf-strong td{background:#DCE9EC}' +
    '.vf-table .vf-total td{font-weight:800;border-top:2px solid #1F3A47;background:#F1F5F6}' +
    '.vf-table.vf-summary .vf-balance td{font-size:22px;padding:14px 10px;background:#E8F4EE;border-top:2px solid #1F3A47;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.vf-table.vf-summary .vf-balance td:first-child{font-size:17px}' +
    '.vf-table .vf-strong td{font-size:15px}' +
    '.vf-table .vf-empty{color:#8A9AA0;text-align:center;padding:14px}' +
    '.vf-bs{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}' +
    '.vf-cash{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}' +
    '.vf-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:center;margin-bottom:18px}' +
    '.vf-donut{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center}' +
    '.vf-donut-ring{position:relative;width:200px;height:200px;flex:none}' +
    '.vf-donut-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}' +
    '.vf-donut-c b{font-size:22px;color:#1F3A47}.vf-donut-c small{font-size:11.5px;color:#5B6B70}' +
    '.vf-legend{min-width:200px;flex:1}' +
    '.vf-leg{display:grid;grid-template-columns:14px 1fr auto auto;gap:8px;align-items:center;font-size:13px;padding:4px 0}' +
    '.vf-dot{width:11px;height:11px;border-radius:3px}.vf-leg-p{font-weight:700}.vf-leg-a{color:#5B6B70;font-variant-numeric:tabular-nums}' +
    '.vf-note{font-size:11.5px;color:#8A9AA0;margin-top:6px}' +
    '.vf-h{font-size:15px;font-weight:700;color:#1F3A47;margin:0 0 8px}' +
    '@media (max-width:760px){.vf-table.vf-summary .vf-balance td{font-size:18px}.vf-table.vf-summary .vf-balance td:first-child{font-size:15px}.vf-bs,.vf-cash,.vf-top{grid-template-columns:1fr}.vf-table{font-size:13px}.vf-table td,.vf-table th{padding:6px 7px}.vf-table td.vf-item{padding-left:14px}}' +
    '@media print{.vf-table th{-webkit-print-color-adjust:exact;print-color-adjust:exact}.vf-table tr{break-inside:avoid}}';
  function injectCSS(){
    if(document.getElementById('vf-css')) return;
    var s = document.createElement('style'); s.id = 'vf-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  window.VCFin = {
    INCOME_CATS:INCOME_CATS, EXPENSE_CATS:EXPENSE_CATS, ASSET_CATS:ASSET_CATS, LIAB_CATS:LIAB_CATS,
    defaultIncome:defaultIncome, defaultExpense:defaultExpense, defaultAssets:defaultAssets, defaultLiabilities:defaultLiabilities,
    normalizeIncome:function(g){ return normalize(g, defaultIncome, OLD_INCOME_GROUP, true); },
    normalizeExpense:function(g){ return normalize(g, defaultExpense, OLD_EXPENSE_GROUP, true); },
    normalizeAssets:function(g){ return normalize(g, defaultAssets, OLD_ASSET_GROUP, false); },
    normalizeLiabilities:function(g){ return normalize(g, defaultLiabilities, OLD_LIAB_GROUP, false); },
    rowAnnual:rowAnnual, rowMonthly:rowMonthly, rowAmount:rowAmount, sumGroups:sumGroups,
    catAnnual:catAnnual, catMonthly:catMonthly, catAmount:catAmount, rowsWhere:rowsWhere, groupByKey:groupByKey,
    realEstateAssets:realEstateAssets, realEstateInvest:realEstateInvest, realEstateLoans:realEstateLoans,
    cashSummary:cashSummary, cashTableHTML:cashTableHTML, summaryTableHTML:summaryTableHTML, donutSVG:donutSVG, balanceTableHTML:balanceTableHTML,
    injectCSS:injectCSS
  };
})();
