/* Vicauria 房產活化潛力評估：題目選項＋結果計算（公開頁與顧問後台共用）
   只依填寫的「區間」粗估，不計算、不承諾任何貸款額度或收益。 */
(function(){
  'use strict';
  var Q = {
    goals: ['不賣房，多一筆可運用資金','創造每月現金流，增加第二份收入','提前準備退休現金流','分散資產配置，降低集中風險','多間房產，提升整體資產效率','保留房產，提前規劃資產傳承'],
    usage: ['自住','出租中','閒置','空屋','家人居住','其他'],
    value: ['1,000 萬以下','1,000～2,000 萬','2,000～3,000 萬','3,000～5,000 萬','5,000 萬以上','不確定'],
    loan:  ['無貸款','500 萬以下','500～1,000 萬','1,000～2,000 萬','2,000 萬以上','不確定'],
    count: ['1 間','2 間','3 間以上','家人名下','共同持有','目前沒有房產'],
    timeline: ['近期 1 個月內','1～3 個月內','半年內','先了解可能性，暫時不急'],
    method: ['線上 30 分鐘｜專屬房產資產效率診斷','實體一對一｜房產活化規劃諮詢','目前先完成評估，之後有需要再安排'],
    times: ['平日上午（09:00–12:00）','平日下午（12:00–18:00）','平日晚上（18:00–21:00）','週末白天','週末晚上','時間彈性，皆可聯繫'],
    pref: ['IG','Line','手機']
  };
  var METHOD_LATER = Q.method[2];
  var CITIES = ['台北市','新北市','桃園市','台中市','台南市','高雄市','基隆市','新竹市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣','連江縣'];

  // 區間 → [下限, 上限, 粗估代表值]（萬元）
  var V_RANGE = { '1,000 萬以下':[0,1000,800], '1,000～2,000 萬':[1000,2000,1500], '2,000～3,000 萬':[2000,3000,2500], '3,000～5,000 萬':[3000,5000,4000], '5,000 萬以上':[5000,Infinity,6000] };
  var L_RANGE = { '無貸款':[0,0,0], '500 萬以下':[0,500,300], '500～1,000 萬':[500,1000,750], '1,000～2,000 萬':[1000,2000,1500], '2,000 萬以上':[2000,Infinity,2500] };

  var DIMS = [
    { key:'fund',    label:'資金潛力',   q:'不賣房，是否還有可運用的資金空間？', goals:[0], body:'看房產淨值、貸款條件與每月還款能力，評估在不賣房的前提下，有沒有資金運用的空間，以及對現金流的影響。' },
    { key:'income',  label:'第二份收入', q:'房產是否有機會協助創造額外現金流？', goals:[1], body:'看出租、空間運用或資金重新配置，是否有機會帶來穩定的每月現金流，同時評估成本與風險。' },
    { key:'retire',  label:'退休規劃',   q:'現有房產如何成為退休生活的後盾？', goals:[2], body:'把房產放進退休時間軸，一起看退休後的居住安排、生活費來源與現金流缺口。' },
    { key:'eff',     label:'資產效率',   q:'目前的房產配置，有沒有更有效率的運用方式？', goals:[3,4], body:'看房產在總資產中的比重、是否過度集中在單一資產，以及多間房產之間的整體配置。' },
    { key:'legacy',  label:'資產傳承',   q:'保留房產，怎麼提前安排傳承？', goals:[5], body:'提前整理持有方式與傳承安排的順序，讓未來的家人少一點負擔與不確定。', optional:true }
  ];

  function wan(n){ return n.toLocaleString('en-US') + ' 萬'; }
  function rangeText(lo, hi){
    lo = Math.max(0, lo);
    if(hi !== Infinity && hi <= 0) return '接近 0（貸款可能接近或高於房價）';
    if(hi === Infinity) return wan(lo) + '以上';
    if(lo <= 0) return wan(hi) + '以下';
    if(lo === hi) return '約 ' + wan(lo);
    return wan(lo).replace(' 萬', '') + '～' + wan(hi);
  }

  function normalize(a){
    a = a || {};
    var arr = function(x){ return Array.isArray(x) ? x.filter(function(v){ return typeof v === 'string'; }) : []; };
    return {
      goals: arr(a.goals), city: String(a.city || ''), usage: arr(a.usage),
      value: String(a.value || ''), loan: String(a.loan || ''), count: String(a.count || ''),
      timeline: String(a.timeline || ''), method: arr(a.method), times: arr(a.times)
    };
  }

  function compute(raw){
    var a = normalize(raw);
    var v = V_RANGE[a.value], l = L_RANGE[a.loan];
    var equity = null;
    if(v && l){
      var eLo = Math.max(0, v[0] - (l[1] === Infinity ? v[1] : l[1])), eHi = v[1] === Infinity ? Infinity : Math.max(0, v[1] - l[0]);
      if(l[1] === Infinity && v[1] !== Infinity) eLo = 0;
      var ratio = v[2] > 0 ? Math.min(1, l[2] / v[2]) : 0;
      equity = { text: rangeText(eLo, eHi), ratio: ratio, ratioText: Math.round(ratio * 100) + '%',
        level: ratio <= 0.3 ? 'good' : ratio <= 0.6 ? 'warn' : 'bad' };
    }

    // 你的房產狀況重點（給網友看的，只描述、不判斷適不適合）
    var points = [];
    if(equity){
      points.push(equity.level === 'good' ? { t:'淨值空間相對充足', d:'貸款占房價比例不高，評估資金運用時彈性較大。' }
        : equity.level === 'warn' ? { t:'有部分淨值空間', d:'仍有貸款在身，評估時要一起看每月還款與現金流的承受度。' }
        : { t:'貸款比重較高', d:'建議先把還款壓力與現金流穩住，再評估其他運用方式。' });
    } else {
      points.push({ t:'房產價值或貸款還不確定', d:'沒關係，顧問可以協助你用實價登錄等公開資料先抓出大概的範圍。' });
    }
    var u = a.usage;
    if(u.indexOf('閒置') > -1 || u.indexOf('空屋') > -1) points.push({ t:'有閒置的空間', d:'閒置或空屋代表有一部分資產暫時沒有發揮作用，可以評估是否有運用的方式。' });
    else if(u.indexOf('出租中') > -1) points.push({ t:'已經有租金收入', d:'可以進一步看租金報酬、貸款成本與整體效率是否還有調整空間。' });
    else if(u.indexOf('自住') > -1) points.push({ t:'以自住為主', d:'評估任何運用方式時，都要先確保居住安排與生活品質不受影響。' });
    if(a.count === '2 間' || a.count === '3 間以上') points.push({ t:'持有多間房產', d:'適合把幾間房產放在一起，看整體配置、集中度與現金流。' });
    if(a.count === '家人名下' || a.count === '共同持有') points.push({ t:'房產涉及家人或共同持有', d:'任何規劃都需要先和相關的家人取得共識，顧問可以協助你整理要討論的重點。' });

    var dims = DIMS.filter(function(d){
      var on = d.goals.some(function(i){ return a.goals.indexOf(Q.goals[i]) > -1; });
      return !d.optional || on;
    }).map(function(d){
      return { key:d.key, label:d.label, q:d.q, body:d.body, on: d.goals.some(function(i){ return a.goals.indexOf(Q.goals[i]) > -1; }) };
    });

    var wantsMeet = a.method.some(function(m){ return m !== METHOD_LATER; });

    // ---- 顧問後台用：熱度與聊天切入點 ----
    var tp = { '近期 1 個月內':3, '1～3 個月內':2, '半年內':1 }[a.timeline] || 0;
    var n = tp + (wantsMeet ? 2 : 0);
    if(v && v[0] >= 3000) n += 1;
    if(u.indexOf('閒置') > -1 || u.indexOf('空屋') > -1) n += 1;
    if(a.count === '2 間' || a.count === '3 間以上') n += 1;
    var lv = n >= 5 ? 'h' : n >= 3 ? 'm' : 'l';
    var why = [];
    if(tp >= 2) why.push(a.timeline.replace('近期 ', '') + '想開始');
    if(wantsMeet) why.push('想預約診斷');
    if(v && v[0] >= 3000) why.push('房產 ' + a.value);
    if(u.indexOf('閒置') > -1 || u.indexOf('空屋') > -1) why.push('有閒置／空屋');
    if(a.count === '2 間' || a.count === '3 間以上') why.push('持有 ' + a.count);
    var talk = [];
    var TALK = ['淨值與資金運用空間','現金流與租金報酬','退休時間軸與居住安排','資產集中度','多間房產整體配置','傳承順序與持有方式'];
    a.goals.forEach(function(g){ var i = Q.goals.indexOf(g); if(i > -1) talk.push(TALK[i]); });
    if(equity && equity.level === 'bad') talk.push('先看還款壓力');
    if(!equity) talk.push('協助估算房價／貸款');
    if(a.count === '家人名下' || a.count === '共同持有') talk.push('家人共識');

    return {
      answers: a, equity: equity, points: points, dims: dims, wantsMeet: wantsMeet,
      heat: { n:n, lv:lv, label:{ h:'高', m:'中', l:'低' }[lv], why:why,
        next:{ h:'建議盡快聯絡，約房產資產效率診斷', m:'先聊目標與房產狀況，再約診斷', l:'先分享資訊，之後再追蹤' }[lv] },
      talk: talk.filter(function(x, i){ return talk.indexOf(x) === i; }).slice(0, 5)
    };
  }

  window.VCProp = { Q: Q, CITIES: CITIES, METHOD_LATER: METHOD_LATER, compute: compute, normalize: normalize };
})();
