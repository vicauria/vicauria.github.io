/* Vicauria 簡易財務健診：計分與報告內容（公開頁 quick-check.html 與後台「諮詢申請」共用）
   只用網友填的 7 個數字＋目標，在瀏覽器裡算，不需要登入。
   這是導流用的「簡易版」，完整分析請顧問用財富地圖。 */
(function(){
  'use strict';

  var GOALS = ['退休規劃', '存第一桶金', '被動收入', '買房', '子女教育', '還清負債', '還不確定'];

  function n(v){ v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  function money(v){ var x = Math.round(v || 0); return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('zh-TW'); }
  function wan(v){
    var x = Math.round(v || 0), a = Math.abs(x), s = x < 0 ? '-' : '';
    if(a >= 1e8) return s + (a / 1e8).toFixed(a >= 1e9 ? 0 : 1).replace(/\.0$/, '') + ' 億';
    if(a >= 1e4) return s + Math.round(a / 1e4).toLocaleString('zh-TW') + ' 萬';
    return s + a.toLocaleString('zh-TW') + ' 元';
  }
  function pct(v){ return (v * 100).toFixed(0) + '%'; }
  // 每月固定投入 m 元、年化 r，y 年後的累積（月複利）
  function fvMonthly(m, r, y){
    var i = r / 12, k = y * 12;
    return i > 0 ? m * ((Math.pow(1 + i, k) - 1) / i) : m * k;
  }

  function compute(a){
    a = a || {};
    var age = Math.round(Number(a.age) || 0);
    var income = n(a.income), expense = n(a.expense), saving = n(a.saving);
    var cash = n(a.cash), invest = n(a.invest), debt = n(a.debt);
    var goal = GOALS.indexOf(a.goal) > -1 ? a.goal : '還不確定';

    var surplus = income - expense;                         // 每月結餘（收入 − 生活支出）
    var savingRate = income > 0 ? surplus / income : 0;     // 儲蓄率
    var plannedSaving = Math.min(saving, Math.max(surplus, 0));
    var unplanned = Math.max(0, surplus - saving);          // 有結餘但沒有安排去處的錢
    var emergencyMonths = expense > 0 ? cash / expense : (cash > 0 ? 99 : 0);
    var debtRatio = income > 0 ? debt / (income * 12) : (debt > 0 ? 9 : 0);
    var investShare = (cash + invest) > 0 ? invest / (cash + invest) : 0;
    var savingShare = income > 0 ? plannedSaving / income : 0;

    /* ---------- 分數（滿分 100） ---------- */
    var sCash = surplus < 0 ? 0 : savingRate >= 0.3 ? 30 : savingRate >= 0.2 ? 25 : savingRate >= 0.1 ? 18 : savingRate > 0 ? 8 : 4;
    var sEmer = expense <= 0 ? 15 : emergencyMonths >= 6 ? 25 : emergencyMonths >= 3 ? 17 : emergencyMonths >= 1 ? 9 : 3;
    var sDebt = debt <= 0 ? 20 : debtRatio < 0.3 ? 15 : debtRatio < 1 ? 8 : 2;
    var sGrow = (savingShare >= 0.2 ? 12 : savingShare >= 0.1 ? 8 : savingShare > 0 ? 4 : 0)
              + (investShare >= 0.3 && investShare <= 0.8 ? 13 : (investShare >= 0.1 ? 8 : investShare > 0 ? 4 : 0));
    if(emergencyMonths < 3 && investShare > 0.8) sGrow = Math.min(sGrow, 10); // 大多押在投資、卻沒有預備金
    var score = Math.max(0, Math.min(100, sCash + sEmer + sDebt + sGrow));

    var grade = score >= 80 ? { key:'a', label:'財務體質穩健', text:'基本功很扎實，接下來的重點是讓資產更有效率地為你工作。' }
              : score >= 65 ? { key:'b', label:'基礎不錯，有幾個缺口', text:'大方向是對的，補上下面幾個缺口，會走得更穩、更快。' }
              : score >= 45 ? { key:'c', label:'有不少可以調整的地方', text:'現在調整正是時候，越早開始，需要的力氣越小。' }
              : { key:'d', label:'建議盡快開始規劃', text:'先別擔心，很多人都是從這裡開始的，先把最急的一兩件事處理好。' };

    /* ---------- 四個指標 ---------- */
    var metrics = [
      { key:'cashflow', label:'每月結餘', value: money(surplus), sub: income > 0 ? '儲蓄率 ' + pct(Math.max(savingRate, -9.99)) : '尚未填收入',
        status: surplus < 0 ? 'bad' : savingRate >= 0.2 ? 'good' : 'warn', target:'建議儲蓄率 20% 以上' },
      { key:'emergency', label:'緊急預備金', value: expense > 0 ? (emergencyMonths >= 24 ? '24 個月以上' : emergencyMonths.toFixed(1) + ' 個月') : '—',
        sub: '活存 ' + wan(cash), status: emergencyMonths >= 6 ? 'good' : emergencyMonths >= 3 ? 'warn' : 'bad', target:'建議 6 個月生活費' },
      { key:'debt', label:'負債壓力', value: debt > 0 ? '年收入的 ' + pct(Math.min(debtRatio, 9.99)) : '沒有負債',
        sub: debt > 0 ? '負債 ' + wan(debt) : '不含房貸', status: debt <= 0 || debtRatio < 0.3 ? 'good' : debtRatio < 1 ? 'warn' : 'bad', target:'建議低於年收入 30%' },
      { key:'invest', label:'資產配置', value: (cash + invest) > 0 ? '投資佔 ' + pct(investShare) : '尚無資產',
        sub: '投資 ' + wan(invest), status: investShare >= 0.3 && investShare <= 0.8 && emergencyMonths >= 3 ? 'good' : investShare > 0 ? 'warn' : 'bad', target:'先有預備金，再讓資產成長' }
    ];

    /* ---------- 建議（挑最需要注意的三個） ---------- */
    var cands = [];
    if(surplus < 0){
      cands.push({ w: 100, title:'每個月入不敷出', body:'目前每月支出比收入多 ' + money(-surplus) + '，長期會一直消耗存款或增加負債。第一步不是投資，而是先找出每月可以省下來的地方，讓收支至少打平。' });
    } else if(savingRate < 0.2 && income > 0){
      cands.push({ w: 70 - savingRate * 100, title:'儲蓄率偏低', body:'每月結餘約 ' + money(surplus) + '，儲蓄率 ' + pct(savingRate) + '，低於一般建議的 20%。可以先從「先存再花」開始：發薪日就把要存的錢自動轉走，剩下的才是生活費。' });
    }
    if(unplanned >= 5000 && unplanned > plannedSaving * 0.5){
      cands.push({ w: 65, title:'有一筆錢沒有被安排', body:'每月結餘中約有 ' + money(unplanned) + ' 沒有固定存起來或投資，這筆錢最容易在不知不覺中花掉。一年下來就是 ' + wan(unplanned * 12) + '，替它安排好去處，效果往往比多賺一點還明顯。' });
    }
    if(expense > 0 && emergencyMonths < 6){
      var need = expense * 6 - cash;
      cands.push({ w: 90 - emergencyMonths * 10, title:'緊急預備金不足', body:'現在的活存大約只夠撐 ' + emergencyMonths.toFixed(1) + ' 個月的生活費。建議至少準備 6 個月（約 ' + wan(expense * 6) + '），還差約 ' + wan(need) + '。遇到換工作、生病等突發狀況時，才不會被迫賣掉投資或借錢。' });
    }
    if(debt > 0 && debtRatio >= 0.3){
      cands.push({ w: 60 + Math.min(debtRatio, 2) * 15, title:'負債壓力偏高', body:'負債約是年收入的 ' + pct(debtRatio) + '。建議先整理每筆負債的利率，利率高的（例如信用卡循環、信貸）優先處理，避免利息吃掉你的結餘。' });
    }
    if((cash + invest) > 0 && investShare < 0.1 && emergencyMonths >= 3){
      cands.push({ w: 55, title:'存款大多放著沒有成長', body:'目前資產幾乎都是活存。以每年 2% 通膨計算，100 萬放 10 年，購買力只剩大約 82 萬。在預備金足夠之後，可以讓一部分的錢開始長期累積。' });
    }
    if(investShare > 0.8 && emergencyMonths < 3){
      cands.push({ w: 75, title:'投資比重高、但預備金不夠', body:'大部分資產都在投資裡，但活存不到 3 個月生活費。市場下跌時剛好需要用錢，就可能被迫在低點賣出。建議先把預備金補足，投資才能放得安心。' });
    }
    // 目標相關的一句
    var g = null, yearsTo65 = age > 0 ? Math.max(0, 65 - age) : 0;
    if(goal === '退休規劃' && age > 0){
      g = { w: 50, title:'離退休還有 ' + yearsTo65 + ' 年', body:'照現在每月固定存 ' + money(plannedSaving) + '，用年化 4% 試算，' + yearsTo65 + ' 年後大約累積 ' + wan(fvMonthly(plannedSaving, 0.04, yearsTo65) + (cash + invest) * Math.pow(1.04, yearsTo65)) + '。夠不夠用，要看你想要的退休生活每月花多少，這部分可以一起算清楚。' };
    } else if(goal === '存第一桶金'){
      var gap = Math.max(0, 1000000 - cash - invest);
      g = { w: 50, title:'第一桶金（100 萬）', body: gap <= 0 ? '你已經累積超過 100 萬了！下一步可以思考怎麼讓這筆錢穩定地長大。'
          : (plannedSaving > 0 ? '還差約 ' + wan(gap) + '，照現在每月存 ' + money(plannedSaving) + '，大約需要 ' + Math.ceil(gap / plannedSaving / 12 * 10) / 10 + ' 年。把沒有安排的結餘也存下來，可以更快達成。' : '還差約 ' + wan(gap) + '。目前每月沒有固定存錢，先從每月固定存一筆開始，時間就會幫你累積。') };
    } else if(goal === '被動收入'){
      g = { w: 50, title:'被動收入要準備多少？', body:'如果希望每月有 3 萬的被動收入，以年化 4% 的現金流估算，大約需要 900 萬的資產。目前資產約 ' + wan(cash + invest) + '，可以一起討論適合你的累積路徑與工具。' };
    } else if(goal === '買房'){
      g = { w: 50, title:'買房的頭期款', body:'頭期款通常是房價的 2～3 成，另外還要準備裝潢、稅費和至少 6 個月的房貸預備金。以 1,000 萬的房子來說，手上大約要有 250～350 萬。' };
    } else if(goal === '子女教育'){
      g = { w: 50, title:'子女教育金', body:'教育費用通常是長期、確定要花的錢，越早開始，每月需要準備的金額越低。可以依孩子的年齡，一起算出每月該存多少。' };
    } else if(goal === '還清負債' && debt > 0){
      g = { w: 50, title:'還清負債的時間', body: plannedSaving > 0 ? '把每月固定存下的 ' + money(plannedSaving) + ' 全部拿來還債，大約 ' + Math.ceil(debt / plannedSaving) + ' 個月可以還清（未計利息）。調整還款順序，通常可以省下不少利息。' : '先找出每月可以固定拿來還款的金額，從利率最高的那筆開始還。' };
    }
    // 最需要注意的兩件事＋一則跟目標有關的（沒有目標相關內容時取前三件）
    cands.sort(function(x, y){ return y.w - x.w; });
    var picked = g ? cands.slice(0, 2).concat([g]) : cands.slice(0, 3);
    if(!picked.length){
      picked.push({ title:'下一步：讓資產更有效率', body:'基本面都很健康！接下來可以檢視資產配置是否符合你的目標與風險承受度，讓每一塊錢都有清楚的任務。' });
    }
    var insights = picked.map(function(c){ return { title: c.title, body: c.body }; });

    /* ---------- 20 年試算（教育示意） ---------- */
    var projection = {
      years: 20,
      planned: fvMonthly(plannedSaving, 0.04, 20),
      withUnplanned: fvMonthly(plannedSaving + unplanned, 0.04, 20)
    };

    /* ---------- 顧問用的切入點（只顯示在後台） ---------- */
    var talk = [];
    if(surplus < 0) talk.push('入不敷出，每月短少 ' + money(-surplus));
    if(expense > 0 && emergencyMonths < 6) talk.push('緊急預備金只有 ' + emergencyMonths.toFixed(1) + ' 個月');
    if(debt > 0 && debtRatio >= 0.3) talk.push('負債約年收入 ' + pct(debtRatio));
    if(unplanned >= 5000) talk.push('每月約 ' + money(unplanned) + ' 結餘沒有安排');
    if((cash + invest) > 0 && investShare < 0.1) talk.push('資產幾乎都是活存');
    if(investShare > 0.8 && emergencyMonths < 3) talk.push('重押投資、預備金不足');
    talk.push('目標：' + goal);

    return {
      score: score, grade: grade, metrics: metrics, insights: insights, projection: projection, talk: talk,
      values: { age: age, income: income, expense: expense, saving: saving, cash: cash, invest: invest, debt: debt, goal: goal,
                surplus: surplus, savingRate: savingRate, unplanned: unplanned, emergencyMonths: emergencyMonths, debtRatio: debtRatio, investShare: investShare }
    };
  }

  window.VCQuick = { GOALS: GOALS, compute: compute, money: money, wan: wan };
})();
