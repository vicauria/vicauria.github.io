/* Vicauria 公開試算頁共用函式：數字解析／格式化／折線圖（純 SVG，無外部套件） */
(function(){
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function parseNum(str){
    if(str == null) return NaN;
    var s = String(str).replace(/[,\s，]/g,'').replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function(c){
      return c === '．' ? '.' : String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    });
    if(s === '' || s === '-' || s === '.') return NaN;
    return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }
  function trimNum(n, d){ return String(parseFloat(n.toFixed(d))); }
  function fmtShort(n){
    var a = Math.abs(n), sign = n < 0 ? '-' : '';
    if(a >= 1e8) return sign + trimNum(a/1e8, 2) + '億';
    if(a >= 1e4) return sign + trimNum(a/1e4, a >= 1e6 ? 0 : 1) + '萬';
    return sign + Math.round(a).toLocaleString('en-US');
  }
  function fmtNT(n){ return 'NT$ ' + Math.round(n).toLocaleString('en-US'); }

  function el(name, attrs, parent){
    var e = document.createElementNS(NS, name);
    for(var k in attrs) e.setAttribute(k, attrs[k]);
    if(parent) parent.appendChild(e);
    return e;
  }
  function niceStep(max, ticks){
    var raw = max / ticks, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }

  /*
   * drawChart(wrap, opt)
   *  opt.years   最大年數
   *  opt.series  [{name,color,dash,fill,values:[0..years]}]
   *  opt.label   無障礙說明
   */
  function drawChart(wrap, opt){
    wrap.textContent = '';
    var W = Math.max(wrap.clientWidth, 280), small = W < 520;
    var H = small ? 260 : 340;
    var m = {l: small ? 50 : 62, r: 14, t: 12, b: 36};
    var iw = W - m.l - m.r, ih = H - m.t - m.b, years = opt.years;
    var max = 0;
    opt.series.forEach(function(s){ s.values.forEach(function(v){ if(v > max) max = v; }); });
    if(!(max > 0)) max = 1;
    var step = niceStep(max, 4), top = Math.ceil(max / step) * step;
    var X = function(y){ return m.l + iw * (y / years); };
    var Y = function(v){ return m.t + ih * (1 - v / top); };

    var svg = el('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opt.label || '折線圖'}, wrap);
    for(var v = 0; v <= top + step / 2; v += step){
      el('line', {x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: '#E1E7E7', 'stroke-width': 1}, svg);
      var t = el('text', {x: m.l - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#5B6B70'}, svg);
      t.textContent = v === 0 ? '0' : fmtShort(v);
    }
    var major = years <= 10 ? 1 : years <= 30 ? 5 : 10;
    for(var y = 0; y <= years; y += major){
      el('line', {x1: X(y), x2: X(y), y1: m.t + ih, y2: m.t + ih + 5, stroke: '#9AA7AB'}, svg);
      var tx = el('text', {x: X(y), y: m.t + ih + 19, 'text-anchor': 'middle', 'font-size': 11, fill: '#5B6B70'}, svg);
      tx.textContent = y;
    }
    var ax = el('text', {x: m.l + iw / 2, y: H - 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#5B6B70'}, svg);
    ax.textContent = '經過年數（年）';
    el('line', {x1: m.l, x2: W - m.r, y1: m.t + ih, y2: m.t + ih, stroke: '#9AA7AB'}, svg);

    opt.series.forEach(function(s){
      var d = '';
      s.values.forEach(function(val, i){ d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(val).toFixed(1); });
      if(s.fill){
        el('path', {d: d + 'L' + X(years).toFixed(1) + ' ' + Y(0) + 'L' + X(0).toFixed(1) + ' ' + Y(0) + 'Z', fill: s.color, opacity: .12}, svg);
      }
      var a = {d: d, fill: 'none', stroke: s.color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'};
      if(s.dash) a['stroke-dasharray'] = s.dash;
      el('path', a, svg);
    });

    var cross = el('line', {y1: m.t, y2: m.t + ih, stroke: '#16323F', 'stroke-width': 1, opacity: 0}, svg);
    var dots = opt.series.map(function(s){ return el('circle', {r: 4.5, fill: '#fff', stroke: s.color, 'stroke-width': 2.5, opacity: 0}, svg); });
    var tip = document.createElement('div'); tip.className = 'tip'; wrap.appendChild(tip);

    function show(clientX){
      var r = svg.getBoundingClientRect(), px = (clientX - r.left) * (W / r.width);
      var y = Math.round(((px - m.l) / iw) * years);
      y = Math.max(0, Math.min(years, y));
      cross.setAttribute('x1', X(y)); cross.setAttribute('x2', X(y)); cross.setAttribute('opacity', .5);
      var html = '<b>第 ' + y + ' 年</b>';
      opt.series.forEach(function(s, i){
        dots[i].setAttribute('cx', X(y)); dots[i].setAttribute('cy', Y(s.values[y])); dots[i].setAttribute('opacity', 1);
        html += '<br><span style="color:' + s.color + '">●</span> ' + s.name + '：' + fmtShort(s.values[y]);
      });
      tip.innerHTML = html; /* 內容皆由本頁程式產生（數字與固定名稱），不含使用者輸入文字 */
      tip.style.display = 'block';
      var tw = tip.offsetWidth, left = X(y) * (r.width / W) + 12;
      if(left + tw > r.width) left = X(y) * (r.width / W) - tw - 12;
      tip.style.left = Math.max(0, left) + 'px'; tip.style.top = '8px';
    }
    function hide(){
      cross.setAttribute('opacity', 0); tip.style.display = 'none';
      dots.forEach(function(d){ d.setAttribute('opacity', 0); });
    }
    svg.addEventListener('pointermove', function(e){ show(e.clientX); });
    svg.addEventListener('pointerdown', function(e){ show(e.clientX); });
    svg.addEventListener('pointerleave', hide);
  }

  function onResize(fn){
    var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(fn, 120); });
  }

  window.VPub = {parseNum: parseNum, fmtShort: fmtShort, fmtNT: fmtNT, drawChart: drawChart, onResize: onResize, trimNum: trimNum};
})();
