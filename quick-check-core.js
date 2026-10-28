/* Vicauria 免費個人財務健檢（第一階段・15 題）：題目、計分與簡易報告內容
   公開頁 quick-check.html 與後台「諮詢申請 → 財務健檢」共用。
   只用網友填的答案在瀏覽器裡算，不需要登入；完整分析請顧問用財富地圖。 */
(function(){
  'use strict';

  /* ---------- 題目選項（改這裡，公開頁與後台會一起更新；記得同步 supabase-quick-check.sql 的白名單） ---------- */
  var Q = {
    status: ['收入不錯，但存不到什麼錢', '每個月收入幾乎都被支出吃掉', '有房產或資產，但手上的現金不多', '財務還算穩定，希望進一步累積資產', '不太清楚自己的財務狀況'],
    want: ['每個月可以留下更多錢', '降低房貸或其他貸款壓力', '讓現有資產更有效率', '提早準備退休現金流', '提高家庭財務安全感', '先搞清楚自己的財務全貌'],
    property: ['目前沒有不動產', '有一間自住房產', '有一間投資或出租房產', '持有兩間以上不動產', '有家庭共有或繼承取得的房產'],
    worry: ['日常生活費無法負擔', '房貸或其他貸款繳不出來', '家庭、孩子或父母的生活開銷', '退休或長期生活規劃受到影響', '目前有足夠準備，不太擔心', '不確定自己能撐多久'],
    goals: ['累積第一筆100萬存款', '降低房貸與負債壓力', '增加每月可支配現金', '讓現有資產更有效率', '建立退休現金流', '購屋或換屋', '做好家庭保障與傳承準備', '完整了解自己的財務狀況']
  };

  function n(v){ v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  function money(v){ var x = Math.round(v || 0); return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('zh-TW'); }
  function wan(v){
    var x = Math.round(v || 0), a = Math.abs(x), s = x < 0 ? '-' : '';
    if(a >= 1e8) return s + (a / 1e8).toFixed(a >= 1e9 ? 0 : 1).replace(/\.0$/, '') + ' 億';
    if(a >= 1e4) return s + Math.round(a / 1e4).toLocaleString('zh-TW') + ' 萬';
    return s + a.toLocaleString('zh-TW') + ' 元';
  }
  function pct(v){ return (v * 100).toFixed(0) + '%'; }
  function pick(list, v){ return list.indexOf(v) > -1 ? v : ''; }

  // 舊版（7 題）存的答案轉成新版欄位，讓後台的舊紀錄也能顯示
  function normalize(a){
    a = a || {};
    if(a.work_income == null && a.income != null){
      return { status:'', want:'', self:null, work_income:n(a.income), other_income:0, other_unknown:false,
        living:n(a.expense), insurance:0, mortgage:0, other_loan:0, fixed:0, variable:0, cash:n(a.cash),
        property:'', worry:'', goals: a.goal ? [a.goal] : [], legacy:true };
    }
    var self = Number(a.self);
    return {
      status: pick(Q.status, a.status), want: pick(Q.want, a.want),
      self: isFinite(self) && a.self !== null && a.self !== '' ? Math.max(0, Math.min(10, Math.round(self))) : null,
      work_income: n(a.work_income), other_income: a.other_unknown ? 0 : n(a.other_income), other_unknown: !!a.other_unknown,
      living: n(a.living), insurance: n(a.insurance), mortgage: n(a.mortgage), other_loan: n(a.other_loan),
      fixed: n(a.fixed), variable: n(a.variable), cash: n(a.cash),
      property: pick(Q.property, a.property), worry: pick(Q.worry, a.worry),
      goals: (Array.isArray(a.goals) ? a.goals : []).filter(function(g){ return Q.goals.indexOf(g) > -1; }).slice(0, 3)
    };
  }

  function compute(raw){
    var a = normalize(raw);
    var income = a.work_income + a.other_income;
    var loans = a.mortgage + a.other_loan;
    var expense = a.living + a.insurance + loans + a.fixed + a.variable;
    var surplus = income - expense;
    var savingRate = income > 0 ? surplus / income : 0;
    var runway = expense > 0 ? a.cash / expense : (a.cash > 0 ? 99 : 0);   // 財務續航力：沒有收入時能撐幾個月
    var loanRatio = income > 0 ? loans / income : (loans > 0 ? 9 : 0);      // 每月貸款佔收入
    var insRatio = income > 0 ? a.insurance / income : 0;                   // 保費佔收入
    var varRatio = income > 0 ? a.variable / income : 0;                    // 變動支出佔收入
    var hasProperty = !!a.property && a.property !== '目前沒有不動產';

    /* ---------- 分數（滿分 100） ---------- */
    var sCash = surplus < 0 ? 0 : savingRate >= 0.3 ? 30 : savingRate >= 0.2 ? 25 : savingRate >= 0.1 ? 18 : savingRate > 0 ? 8 : 4;
    var sRun  = expense <= 0 ? 15 : runway >= 6 ? 25 : runway >= 3 ? 17 : runway >= 1 ? 9 : 3;
    var sLoan = loans <= 0 ? 20 : loanRatio <= 0.2 ? 17 : loanRatio <= 0.3 ? 13 : loanRatio <= 0.4 ? 8 : 3;
    var sIns  = a.insurance <= 0 ? 3 : insRatio < 0.03 ? 6 : insRatio <= 0.15 ? 10 : insRatio <= 0.25 ? 5 : 2;
    var sVar  = varRatio <= 0.1 ? 15 : varRatio <= 0.2 ? 11 : varRatio <= 0.3 ? 6 : 2;
    var score = Math.max(0, Math.min(100, sCash + sRun + sLoan + sIns + sVar));
    var parts = [
      { label:'每月現金流', got:sCash, max:30 }, { label:'財務續航力', got:sRun, max:25 },
      { label:'貸款負擔', got:sLoan, max:20 }, { label:'保障支出', got:sIns, max:10 }, { label:'變動支出控制', got:sVar, max:15 }
    ];

    var grade = score >= 80 ? { key:'a', label:'財務體質穩健', text:'基本功很扎實，接下來的重點是讓資產更有效率地為你工作。' }
              : score >= 65 ? { key:'b', label:'基礎不錯，有幾個缺口', text:'大方向是對的，補上下面幾個缺口，會走得更穩、更快。' }
              : score >= 45 ? { key:'c', label:'有不少可以調整的地方', text:'現在調整正是時候，越早開始，需要的力氣越小。' }
              : { key:'d', label:'建議盡快開始規劃', text:'先別擔心，很多人都是從這裡開始的，先把最急的一兩件事處理好。' };

    /* ---------- 自評 vs 健檢 ---------- */
    var selfGap = null;
    if(a.self !== null){
      var sys = Math.round(score / 10);
      selfGap = { self: a.self, sys: sys,
        text: a.self - sys >= 2 ? '你對自己的財務比實際狀況樂觀一些，有幾個地方值得多留意。'
            : sys - a.self >= 2 ? '其實你的財務體質比你想像的好，只是還沒有被好好整理。'
            : '你對自己財務的感覺和實際狀況差不多，很有自覺。' };
    }

    /* ---------- 四個關鍵指標 ---------- */
    var metrics = [
      { key:'cashflow', label:'每月結餘', value: money(surplus), sub: income > 0 ? '儲蓄率 ' + pct(Math.max(savingRate, -9.99)) : '尚未填收入',
        status: surplus < 0 ? 'bad' : savingRate >= 0.2 ? 'good' : 'warn', target:'建議儲蓄率 20% 以上' },
      { key:'runway', label:'財務續航力', value: expense > 0 ? (runway >= 24 ? '24 個月以上' : runway.toFixed(1) + ' 個月') : '—',
        sub:'沒有收入時，存款可以撐多久', status: runway >= 6 ? 'good' : runway >= 3 ? 'warn' : 'bad', target:'建議 6 個月以上' },
      { key:'loan', label:'貸款負擔', value: loans > 0 ? '收入的 ' + pct(Math.min(loanRatio, 9.99)) : '沒有貸款',
        sub: loans > 0 ? '每月還款 ' + money(loans) : '每月不用還款', status: loans <= 0 || loanRatio <= 0.3 ? 'good' : loanRatio <= 0.4 ? 'warn' : 'bad', target:'建議不超過收入 30%～40%' },
      { key:'insurance', label:'保費支出', value: a.insurance > 0 ? '收入的 ' + pct(insRatio) : '沒有保費',
        sub: a.insurance > 0 ? '每月 ' + money(a.insurance) : '可能缺少基本保障', status: a.insurance > 0 && insRatio >= 0.03 && insRatio <= 0.15 ? 'good' : 'warn', target:'一般建議約收入 10%' }
    ];

    /* ---------- 支出結構（佔收入比例） ---------- */
    var structure = [
      { label:'基本生活', v:a.living, color:'#1F5C73' }, { label:'保險費', v:a.insurance, color:'#5FA8C7' },
      { label:'房貸', v:a.mortgage, color:'#C97B3D' }, { label:'其他貸款', v:a.other_loan, color:'#E3A66D' },
      { label:'其他固定支出', v:a.fixed, color:'#9FCBDB' }, { label:'變動支出', v:a.variable, color:'#B3402A' },
      { label:'每月結餘', v:Math.max(surplus, 0), color:'#2E7D5B' }
    ].filter(function(x){ return x.v > 0; }).map(function(x){
      x.share = Math.max(income, expense) > 0 ? x.v / Math.max(income, expense) : 0; return x;
    });

    /* ---------- 建議（最需要注意的兩件事＋一則回應他的擔心或目標） ---------- */
    var cands = [];
    if(surplus < 0){
      cands.push({ w:100, title:'每個月入不敷出', body:'目前每月支出比收入多 ' + money(-surplus) + '，長期會一直消耗存款或增加負債。第一步先把支出拆開來看，找出可以調整的地方，讓收支至少打平。' });
    } else if(savingRate < 0.2 && income > 0){
      cands.push({ w:70 - savingRate * 100, title:'每月能留下的錢偏少', body:'每月結餘約 ' + money(surplus) + '，儲蓄率 ' + pct(savingRate) + '，低於一般建議的 20%。可以試試「先存再花」：發薪日先把要存的錢轉走，剩下的才是生活費。' });
    }
    if(expense > 0 && runway < 6){
      cands.push({ w:90 - runway * 10, title:'財務續航力不足', body:'如果收入突然中斷，目前的存款大約只能撐 ' + runway.toFixed(1) + ' 個月。建議至少準備 6 個月的總支出（約 ' + wan(expense * 6) + '），還差約 ' + wan(Math.max(0, expense * 6 - a.cash)) + '。' });
    }
    if(loans > 0 && loanRatio > 0.3){
      cands.push({ w:60 + Math.min(loanRatio, 1) * 40, title:'貸款佔收入比例偏高', body:'每月貸款還款 ' + money(loans) + '，佔收入的 ' + pct(loanRatio) + '。超過 30%～40% 時，生活彈性會明顯變小。可以先檢視每筆貸款的利率與年限，看看有沒有調整空間。' });
    }
    if(income > 0 && varRatio > 0.2){
      cands.push({ w:55 + varRatio * 50, title:'變動支出佔比偏高', body:'娛樂、購物、旅遊等變動支出每月約 ' + money(a.variable) + '，佔收入 ' + pct(varRatio) + '。這是最容易調整的一塊，設定每月上限，結餘馬上就會變多。' });
    }
    if(a.insurance <= 0){
      cands.push({ w:50, title:'目前沒有保險支出', body:'沒有任何保費支出，代表生病或意外時可能要全部自己負擔。建議至少確認醫療與意外的基本保障。' });
    } else if(insRatio > 0.15){
      cands.push({ w:50 + insRatio * 50, title:'保費佔收入偏高', body:'每月保費 ' + money(a.insurance) + '，佔收入 ' + pct(insRatio) + '，高於一般建議的 10% 左右。可以檢視保單內容是否重複，或有儲蓄型保單佔用太多現金流。' });
    }
    if(hasProperty && runway < 3){
      cands.push({ w:58, title:'資產多、現金少', body:'你有不動產，但手上可隨時動用的現金偏少。房產無法馬上變現，遇到急用時容易周轉不靈，現金部位值得重新安排。' });
    }
    cands.sort(function(x, y){ return y.w - x.w; });

    // 回應他最擔心的事
    var worryMap = {
      '日常生活費無法負擔': '你最擔心的是生活費。以目前每月總支出 ' + money(expense) + ' 來看，存款可以撐 ' + (expense > 0 ? runway.toFixed(1) : '—') + ' 個月——這就是你的安全底線，補足它是第一步。',
      '房貸或其他貸款繳不出來': '你最擔心的是貸款。每月還款 ' + money(loans) + '，如果收入中斷，存款可以支付 ' + (loans > 0 ? (a.cash / loans).toFixed(1) + ' 個月' : '—') + '的還款。可以預先規劃「貸款預備金」。',
      '家庭、孩子或父母的生活開銷': '你最擔心的是家人。家庭的保障不只靠存款，也要確認收入中斷時，保險與預備金能不能接得住家裡的開銷。',
      '退休或長期生活規劃受到影響': '你最擔心的是長期規劃。退休準備最怕中斷，越早建立固定的累積機制，短期的波動越不會影響長期目標。',
      '目前有足夠準備，不太擔心': '你對目前的準備有信心，很好！下一步可以檢視資產是否有效率地運作，讓準備不只「夠用」，還能持續成長。',
      '不確定自己能撐多久': '你不確定能撐多久——依照你填的數字，答案是大約 ' + (expense > 0 ? runway.toFixed(1) + ' 個月' : '（需要更多資料）') + '。知道這個數字，就是掌握財務的第一步。'
    };
    var picked = cands.slice(0, 2);
    if(a.worry && worryMap[a.worry]) picked.push({ title:'關於你最擔心的事', body: worryMap[a.worry] });
    else if(cands[2]) picked.push(cands[2]);
    if(!picked.length) picked.push({ title:'下一步：讓資產更有效率', body:'基本面都很健康！接下來可以檢視資產配置是否符合你的目標與風險承受度，讓每一塊錢都有清楚的任務。' });
    var insights = picked.map(function(c){ return { title:c.title, body:c.body }; });

    /* ---------- 三年目標 ---------- */
    var goalNotes = {
      '累積第一筆100萬存款': function(){ var gap = Math.max(0, 1000000 - a.cash); return gap <= 0 ? '你的存款已超過 100 萬，可以思考下一個里程碑。' : (surplus > 0 ? '還差約 ' + wan(gap) + '，照目前每月結餘全部存下，大約 ' + (Math.ceil(gap / surplus / 12 * 10) / 10) + ' 年可以達成。' : '還差約 ' + wan(gap) + '，需要先讓每月有結餘。'); },
      '降低房貸與負債壓力': function(){ return loans > 0 ? '每月還款 ' + money(loans) + '（收入的 ' + pct(loanRatio) + '），可以從利率、年限與還款順序一起檢視。' : '目前沒有每月貸款支出，負債壓力不大。'; },
      '增加每月可支配現金': function(){ return '最快的兩個方向：調整變動支出（目前 ' + money(a.variable) + '／月），以及檢視固定支出與保費的結構。'; },
      '讓現有資產更有效率': function(){ return '存款 ' + wan(a.cash) + (hasProperty ? '，另有不動產' : '') + '。先留足預備金，其餘的資金可以依目標與時間安排去處。'; },
      '建立退休現金流': function(){ return '退休現金流要看你希望退休後每月有多少錢，越早開始，每月需要準備的金額越低。'; },
      '購屋或換屋': function(){ return '頭期款通常是房價 2～3 成，另外要預留裝潢、稅費與至少 6 個月的房貸預備金。'; },
      '做好家庭保障與傳承準備': function(){ return '先確認保障缺口（目前保費 ' + money(a.insurance) + '／月），再談資產傳承的安排。'; },
      '完整了解自己的財務狀況': function(){ return '這份是第一階段的簡易健檢；第二階段的完整健檢，會把資產、負債與目標一起整理成完整報告。'; }
    };
    var goals = a.goals.map(function(g){ return { goal:g, note: goalNotes[g] ? goalNotes[g]() : '' }; });

    /* ---------- 三年後的樣子（不計報酬） ---------- */
    var threeYear = surplus > 0 ? { saved: surplus * 36, total: a.cash + surplus * 36 } : null;

    /* ---------- 顧問用的切入點（只顯示在後台） ---------- */
    var talk = [];
    if(a.status) talk.push('自評：' + a.status);
    if(a.want) talk.push('最想改善：' + a.want);
    if(surplus < 0) talk.push('入不敷出，每月短少 ' + money(-surplus));
    if(expense > 0 && runway < 6) talk.push('續航力只有 ' + runway.toFixed(1) + ' 個月');
    if(loans > 0 && loanRatio > 0.3) talk.push('貸款佔收入 ' + pct(loanRatio));
    if(a.insurance <= 0) talk.push('沒有保費支出');
    else if(insRatio > 0.15) talk.push('保費佔收入 ' + pct(insRatio));
    if(varRatio > 0.2) talk.push('變動支出佔收入 ' + pct(varRatio));
    if(hasProperty) talk.push(a.property);
    if(a.worry) talk.push('最擔心：' + a.worry);
    if(selfGap && Math.abs(selfGap.self - selfGap.sys) >= 2) talk.push('自評 ' + selfGap.self + ' 分 vs 健檢 ' + selfGap.sys + ' 分');
    if(a.other_unknown) talk.push('其他收入無法估算');

    return {
      score: score, parts: parts, grade: grade, selfGap: selfGap, metrics: metrics, structure: structure,
      insights: insights, goals: goals, threeYear: threeYear, talk: talk, answers: a,
      values: { income: income, expense: expense, surplus: surplus, savingRate: savingRate, runway: runway, loans: loans,
                loanRatio: loanRatio, insRatio: insRatio, varRatio: varRatio }
    };
  }

  window.VCQuick = { Q: Q, compute: compute, normalize: normalize, money: money, wan: wan, pct: pct };
})();
