/* =========================================================
   启动 · 把 HQ 模板挂进 Shadow DOM，样式就绪后启动主题
   公司名称从 HR 工作台同步：优先读 localStorage，其次读 ?company=
   ========================================================= */
(function () {
  'use strict';
  var host = document.getElementById('host-hq');
  var tpl = document.getElementById('tpl-hq');
  if (!host || !tpl) return;

  var STORE_KEY = 'hr-workbench-v1';
  var FALLBACK = '我的公司';

  var SR = host.attachShadow({ mode: 'open' });
  SR.appendChild(tpl.content.cloneNode(true));

  function nameFromState(raw) {
    try {
      var s = JSON.parse(raw);
      var st = s && s.settings;
      if (st) return st.short || st.company || '';
    } catch (e) { /* 数据损坏或还没建过公司 */ }
    return '';
  }

  function readCompany() {
    try {
      var n = nameFromState(localStorage.getItem(STORE_KEY));
      if (n) return n;
    } catch (e) { /* file:// 或隐私模式可能不让读 */ }
    try {
      return new URLSearchParams(location.search).get('company') || '';
    } catch (e) {
      return '';
    }
  }

  function applyCompany(name) {
    name = String(name || '').trim() || FALLBACK;
    document.title = name + ' · 数字员工 · 智能总部';

    var co = SR.getElementById('hqCo');
    if (co) {
      co.textContent = name;
      co.style.fontSize = name.length > 10 ? '26px' : (name.length > 6 ? '34px' : '');
    }
    var mCo = SR.getElementById('mCo');
    if (mCo) mCo.textContent = name;
  }

  applyCompany(readCompany());

  // 工作台在另一个标签页改了公司名称时，这里实时跟着变
  window.addEventListener('storage', function (e) {
    if (e.key !== STORE_KEY || !e.newValue) return;
    var n = nameFromState(e.newValue);
    if (n) applyCompany(n);
  });

  var started = false;
  function start() {
    if (started) return;
    started = true;
    host.hidden = false;
    try {
      mountHQ(host, SR);
    } catch (e) {
      console.error('AGENT HQ 启动失败：', e);
    }
  }

  var link = SR.querySelector('link[rel="stylesheet"]');
  if (link && !link.sheet) {
    link.addEventListener('load', start);
    link.addEventListener('error', start);
    setTimeout(start, 800); // 兜底：样式没加载完也先把画面跑起来
  } else {
    start();
  }
})();
