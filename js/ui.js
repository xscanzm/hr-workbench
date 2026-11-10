/* =========================================================
   UI · 外壳、路由、弹窗、抽屉、提示、事件委托
   ========================================================= */
var ICON = (function () {
  function i(d, extra) { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>'; }
  return {
    office: i('<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/>'),
    board: i('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="14" rx="1.5"/>'),
    resume: i('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>'),
    exam: i('<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/>'),
    cal: i('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    score: i('<path d="M4 20V4M4 20h16"/><path d="M8 16l3.5-4 3 2.5L19 8"/>'),
    users: i('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17 14.6c2 .5 3.2 2 3.6 4.4"/>'),
    bot: i('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4.5M8.5 4.5h7"/><circle cx="9.2" cy="13" r="1.1" fill="currentColor"/><circle cx="14.8" cy="13" r="1.1" fill="currentColor"/><path d="M9.5 16h5"/>'),
    exit: i('<path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/>'),
    folder: i('<path d="M3.5 6.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
    chart: i('<path d="M4 20V4M4 20h16"/><path d="M8 16l3.5-4 3 2.5L19 8"/>'),
    spark: i('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
    gear: i('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
    search: i('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>', ' width="14" height="14" style="color:#9a9a97"'),
    plus: i('<path d="M12 5v14M5 12h14"/>'),
    x: i('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: i('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    down: i('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    up: i('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
    trash: i('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
    copy: i('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    doc: i('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
    cake: i('<path d="M4 20h16M5 20v-7h14v7"/><path d="M5 15.5c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0M12 13V9.5"/><path d="M12 6.5c.9-.6.9-1.8 0-2.6-.9.8-.9 2 0 2.6z"/>'),
    send: i('<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>'),
    side: i('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M15 4v16"/>'),
    print: i('<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>'),
    userplus: i('<circle cx="10" cy="8" r="3.4"/><path d="M3.5 19.5c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5M19 8v6M16 11h6"/>'),
    back: i('<path d="M15 5l-7 7 7 7"/>'),
    refresh: i('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>'),
    eye: i('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    star: i('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>'),
    flag: i('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    clip: i('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>'),
    timer: i('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2h5"/>'),
    target: i('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    book: i('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z"/><path d="M8 3v18M12 8h4M12 12h4"/>'),
    fwd: i('<path d="M9 5l7 7-7 7"/>'),
    link: i('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    filter: i('<path d="M3 5h18l-7 8v6l-4-2v-4z"/>'),
    more: i('<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>'),
    mail: i('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
    phone: i('<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    upload: i('<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>'),
    download: i('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    building: i('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>'),
    bell: i('<path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M10 20a2.2 2.2 0 0 0 4 0"/>'),
    idcard: i('<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M14 10h4M14 13h4M14 16h3"/>'),
    contract: i('<path d="M7 3h10v18H7z"/><path d="M10 8h4M10 12h4M10 16h2M16 15l2 2 3-4"/>'),
    edit: i('<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/>'),
    clock: i('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
    arrowup: i('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    arrowdown: i('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    briefcase: i('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>'),
    fit: i('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    unfull: i('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    qr: i('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M20 14v6h-3M14 20h1"/>'),
    lock: i('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', ' width="14" height="14"')
  };
})();

var UI = {
  page: 'office',
  pages: {},
  act: {},
  inp: {},
  chg: {},
  charts: [],
  opts: {},
  register: function (name, def) { this.pages[name] = def; },

  /* ---------- 外壳 ---------- */
  shell: function () {
    var h = '<aside class="side">' +
      '<div class="brand">' + brandMark() + '<div><div class="brand-name">HR 工作台</div><div class="brand-sub">' + esc(brandSub()) + '</div></div></div>' +
      '<div class="search">' + ICON.search + '<input id="gsearch" placeholder="搜索员工 / 候选人 / 文件" autocomplete="off" data-inp="gsearch" data-key="gsearch"><div id="gsearchPop"></div></div>' +
      '<div class="side-scroll">' +
      '<nav class="nav">' + navItem('office', ICON.office, '办公室') + '</nav>' +
      '<div class="nav-label">招聘</div><nav class="nav">' +
      navItem('board', ICON.board, '招聘看板', activeCandidates().length) +
      navItem('resume', ICON.resume, '简历筛选', S.candidates.filter(function (c) { return c.screen === 'new'; }).length ? '待筛 ' + S.candidates.filter(function (c) { return c.screen === 'new'; }).length : '') +
      navItem('written', ICON.exam, '笔试管理') +
      navItem('interview', ICON.cal, '面试安排', todayInterviews().length ? '今日 ' + todayInterviews().length : '') +
      navItem('score', ICON.score, '综合成绩', 'A 级 ' + scoreRows().filter(function (x) { return x.grade === 'A'; }).length) +
      '</nav>' +
      '<div class="nav-label">员工</div><nav class="nav">' +
      navItem('employees', ICON.users, '员工花名册', activeEmployees().length) +
      navItem('offboard', ICON.exit, '离职管理', S.offboarding.length ? S.offboarding.length + ' 办理中' : '') +
      navItem('files', ICON.folder, '文件柜', S.documents.length) +
      '</nav>' +
      '<div class="nav-label">人事</div><nav class="nav">' +
      navItem('attendance', ICON.clock, '考勤管理', '待处理 ' + (attExceptionsToday().length + pendingLeaves().length)) +
      navItem('performance', ICON.target, '绩效管理', perfPendingTotal() ? '待办 ' + perfPendingTotal() : '') +
      navItem('activities', ICON.star, '员工活动', activityUpcoming(99).length ? '即将 ' + activityUpcoming(99).length : '') +
      navItem('training', ICON.book, '培训管理', trainingUpcoming(99).length ? '待开始 ' + trainingUpcoming(99).length : '') +
      '</nav>' +
      '<div class="nav-label">智能</div><nav class="nav">' +
      navHQ() +
      '</nav>' +
      '<div class="nav-label">工具</div><nav class="nav">' +
      navItem('analytics', ICON.chart, '人事分析') +
      navItem('ai', ICON.spark, 'AI 助手') +
      '</nav>' +
      '<div class="nav-label">最近对话</div><div class="recent" id="recentChats"></div>' +
      '</div>' +
      '<div class="side-foot">' +
      '<nav class="nav">' + navItem('settings', ICON.gear, '设置') + '</nav>' +
      '<button class="me" data-act="go" data-page="settings" data-sec="profile">' + hrAvatar(32) + '<div><div class="me-name">' + esc(S.settings.hr.name) + '</div><div class="me-sub">' + esc(meSub()) + '</div></div></button>' +
      '<button class="consult-card" data-act="consult-open">' +
      '<span class="cc-ico">' + ICON.qr + '</span>' +
      '<span class="cc-txt"><b>扫码咨询</b><small>周一 · 皮皮未来</small></span>' +
      '<span class="cc-go" aria-hidden="true">›</span></button>' +
      '<button class="sign about-link" data-act="about-open">关于 HR 工作台 · © 2026</button></div>' +
      '</aside>' +
      '<main class="main" id="main"></main>' +
      '<aside class="rail" id="rail"></aside>' +
      '<button class="btn btn-light btn-sm fs-global" data-act="fullscreen" id="fsBtn"></button>';
    $('#app').innerHTML = h;
    document.title = 'HR 工作台 · ' + brandSub();
    updateFsBtn();
    UI.renderRecent();
  },
  renderRecent: function () {
    var el = $('#recentChats'); if (!el) return;
    var list = S.chats.slice(0, 5);
    el.innerHTML = list.length ? list.map(function (c) {
      return '<button class="nav-chat" data-act="open-chat" data-id="' + c.id + '" title="' + esc(c.title) + '">' + esc(c.title) + '</button>';
    }).join('') : '<div class="muted" style="font-size:12px;padding:2px 10px">还没有对话</div>';
  },
  refreshSide: function () {
    document.title = 'HR 工作台 · ' + brandSub();
    var bn = $('.brand-sub'); if (bn) bn.textContent = brandSub();
    var me = $('.me'); if (me) me.innerHTML = hrAvatar(32) + '<div><div class="me-name">' + esc(S.settings.hr.name) + '</div><div class="me-sub">' + esc(meSub()) + '</div></div>';
    var bm = $('.brand-mark'); if (bm) bm.outerHTML = brandMark();
    var hq = $('.nav a.nav-hq'); if (hq) hq.setAttribute('href', hqHref());
    UI.renderRecent();
    // 侧栏计数
    var map = {
      board: activeCandidates().length,
      resume: S.candidates.filter(function (c) { return c.screen === 'new'; }).length ? '待筛 ' + S.candidates.filter(function (c) { return c.screen === 'new'; }).length : '',
      interview: todayInterviews().length ? '今日 ' + todayInterviews().length : '',
      score: 'A 级 ' + scoreRows().filter(function (x) { return x.grade === 'A'; }).length,
      employees: activeEmployees().length,
      offboard: S.offboarding.length ? S.offboarding.length + ' 办理中' : '',
      files: S.documents.length,
      attendance: '待处理 ' + (attExceptionsToday().length + pendingLeaves().length),
      performance: perfPendingTotal() ? '待办 ' + perfPendingTotal() : '',
      activities: activityUpcoming(99).length ? '即将 ' + activityUpcoming(99).length : '',
      training: trainingUpcoming(99).length ? '待开始 ' + trainingUpcoming(99).length : ''
    };
    Object.keys(map).forEach(function (p) {
      var a = $('.nav a[data-page="' + p + '"]'); if (!a) return;
      var cnt = a.querySelector('.cnt');
      if (map[p] === '' || map[p] === 0) { if (cnt) cnt.remove(); }
      else if (cnt) cnt.textContent = map[p];
      else { var sp = document.createElement('span'); sp.className = 'cnt'; sp.textContent = map[p]; a.appendChild(sp); }
    });
  },
  go: function (page, opts) {
    var prev = UI.pages[UI.page];
    if (prev && prev.unmount) prev.unmount();
    UI.hideCard(); UI.closePop();
    UI.page = page; reindex();
    UI.opts = opts || {};
    $$('.nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-page') === page); });
    var def = UI.pages[page];
    if (!def) { UI.toast('页面不存在：' + page); return; }
    var app = $('#app');
    app.classList.toggle('with-rail', !!def.rail);
    app.classList.remove('rail-open');
    UI.charts = [];
    def.render($('#main'), UI.opts);
    if (def.rail) def.rail($('#rail')); else $('#rail').innerHTML = '';
    if (def.mount) def.mount(UI.opts);
    UI.drawCharts();
    try { if (location.hash !== '#/' + page) history.replaceState(null, '', '#/' + page); } catch (e) { }
  },
  rerender: function () { UI.go(UI.page, UI.opts); },

  /* ---------- 弹窗 ---------- */
  modal: function (o) {
    UI.closeModal();
    var host = $('#modalHost');
    host.innerHTML = '<div class="mask" data-act="modal-mask"></div><div class="modal' + (o.wide ? ' wide' : '') + (o.xwide ? ' xwide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div class="modal-title">' + o.title + '</div><button class="modal-x" data-act="modal-close" aria-label="关闭">' + ICON.x + '</button></div>' +
      '<div class="modal-body">' + o.body + '</div>' +
      (o.foot === false ? '' : '<div class="modal-foot">' + (o.foot || '<button class="btn btn-light" data-act="modal-close">取消</button>') + '</div>') +
      '</div>';
    UI.modalCtx = o;
    if (o.mount) o.mount(host);
    var f = host.querySelector('[autofocus]') || host.querySelector('.inp,.ta');
    if (f && !o.noFocus) setTimeout(function () { f.focus(); }, 30);
  },
  closeModal: function () { var h = $('#modalHost'); if (h) h.innerHTML = ''; var c = UI.modalCtx; UI.modalCtx = null; if (c && c.onClose) c.onClose(); },
  confirm: function (title, msg, okText, onOk, danger) {
    UI.modal({ title: title, body: '<p style="margin:4px 0 8px;color:var(--ink2);line-height:1.7">' + msg + '</p>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn ' + (danger ? 'btn-red' : 'btn-dark') + '" data-act="confirm-ok">' + (okText || '确定') + '</button>', noFocus: true });
    UI.modalCtx.onOk = onOk;
  },
  drawer: function (html, wide) {
    var host = $('#drawerHost');
    host.innerHTML = '<div class="mask" data-act="drawer-close"></div><div class="drawer' + (wide ? ' wide' : '') + '" role="dialog">' + html + '</div>';
  },
  closeDrawer: function () { var h = $('#drawerHost'); if (h) h.innerHTML = ''; UI.drawerSid = null; },
  toast: function (msg, ms) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    ms = ms || 1800;
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, ms);
    setTimeout(function () { t.remove(); }, ms + 400);
  },

  /* ---------- 悬浮卡 / 弹出层 ---------- */
  showCard: function (html, anchor) {
    var c = $('#hcard'); c.innerHTML = html; c.classList.remove('above', 'below');
    var r = anchor.getBoundingClientRect(), cw = 300, ch = c.offsetHeight || 260;
    var x = clamp(r.left + r.width / 2 - cw / 2, 12, window.innerWidth - cw - 12);
    var below = r.bottom + ch + 16 < window.innerHeight;
    var y = below ? r.bottom + 10 : r.top - ch - 10;
    if (!below && y < 8) y = 8;
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.setProperty('--ax', clamp(r.left + r.width / 2 - x, 20, cw - 20) + 'px');
    c.classList.add(below ? 'below' : 'above', 'on');
  },
  hideCard: function () { var c = $('#hcard'); if (c) c.classList.remove('on'); },
  pop: function (html, x, y) {
    UI.closePop();
    var p = document.createElement('div'); p.className = 'pop'; p.id = 'pop'; p.innerHTML = html;
    document.body.appendChild(p);
    var w = p.offsetWidth, h = p.offsetHeight;
    p.style.left = clamp(x - w / 2, 10, window.innerWidth - w - 10) + 'px';
    p.style.top = (y + h + 20 > window.innerHeight ? y - h - 14 : y + 14) + 'px';
  },
  closePop: function () { var p = $('#pop'); if (p) p.remove(); },

  /* ---------- 图表 ---------- */
  chart: function (fn) { var id = 'ch' + UI.charts.length; UI.charts.push({ id: id, fn: fn }); return '<div class="chart" id="' + id + '"></div>'; },
  drawCharts: function () {
    UI.charts.forEach(function (c) { var el = document.getElementById(c.id); if (el) el.innerHTML = c.fn(Math.max(240, el.clientWidth)); });
  }
};

function navItem(page, ico, label, cnt) {
  return '<a href="#/' + page + '" data-act="go" data-page="' + page + '"><span class="ico">' + ico + '</span><span class="t">' + label + '</span>' + (cnt !== undefined && cnt !== '' ? '<span class="cnt">' + cnt + '</span>' : '') + '</a>';
}
function hqHref() {
  var n = S.settings.short || S.settings.company || '';
  return 'agent/index.html' + (n ? '?company=' + encodeURIComponent(n) : '');
}
function navHQ() {
  return '<a class="nav-hq" href="' + hqHref() + '" target="_blank" rel="noopener" aria-label="打开智能员工 AGENT HQ 大屏">' +
    '<span class="hq-ico">' + ICON.bot + '</span>' +
    '<span class="hq-txt"><b>智能员工</b><small>AGENT HQ · 3D 总部</small></span>' +
    '<span class="hq-go" aria-hidden="true">' + ICON.fwd + '</span>' +
    '</a>';
}
function brandMark() {
  return '<svg class="brand-mark" viewBox="-24 -24 48 48" aria-hidden="true"><rect x="-24" y="-24" width="48" height="48" rx="13" fill="#171717"/>' +
    '<circle cx="0" cy="-8" r="6" fill="#fff"/><path d="M-13 12c0-7 5.8-11 13-11s13 4 13 11z" fill="#fff"/>' +
    '<circle cx="13.5" cy="-4" r="3.2" fill="#e5483b"/></svg>';
}
function hrAvatar(size) { return ART.avatar({ id: 'hr-' + S.settings.hr.name, name: S.settings.hr.name, gender: S.settings.hr.gender }, size, { color: '#e5483b' }); }
function empAva(e, size) { return ART.avatar(e, size, { color: deptColor(e.deptId) }); }
function candAva(c, size) { return ART.avatar(c, size, { color: jobById(c.jobId) ? deptColor(jobById(c.jobId).deptId) : '#2f7ff0' }); }
function brandSub() { return S.settings.short || S.settings.company || '我的公司'; }
function meSub() { return S.settings.hr.title + ' · ' + activeEmployees().length + ' 人'; }
function statusTag(key) { var s = DAY_STATUS[key]; return s ? '<span class="tag ' + s.tone + '">' + s.t + '</span>' : ''; }
function stageTag(key) { var s = STAGE[key]; return s ? '<span class="tag ' + s.tone + '">' + s.t + '</span>' : ''; }
function screenTag(key) { var s = SCREEN[key]; return s ? '<span class="tag ' + s.tone + '">' + s.t + '</span>' : ''; }
function gradeTag(g) { var x = GRADES[g]; return x ? '<span class="tag ' + x.tone + '">' + x.short + '</span>' : '<span class="muted">—</span>'; }
function empStatusTag(e) {
  var s = EMP_STATUS[e.empStatus] || EMP_STATUS.active;
  return '<span class="tag ' + s.tone + '">' + s.t + '</span>';
}

/* ---------- 事件委托 ---------- */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]');
  if (!el) {
    if (!e.target.closest('#pop')) UI.closePop();
    if (!e.target.closest('.search')) { var sp = $('#gsearchPop'); if (sp) sp.innerHTML = ''; }
    return;
  }
  var name = el.getAttribute('data-act');
  var fn = UI.act[name];
  if (fn) { if (el.tagName === 'A') e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', function (e) {
  var el = e.target.closest('[data-inp]'); if (!el) return;
  var fn = UI.inp[el.getAttribute('data-inp')]; if (fn) fn(el, e);
});
document.addEventListener('change', function (e) {
  var el = e.target.closest('[data-chg]'); if (!el) return;
  var fn = UI.chg[el.getAttribute('data-chg')]; if (fn) fn(el, e);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if ($('#pop')) { UI.closePop(); return; }
    if ($('#modalHost').innerHTML) { UI.closeModal(); return; }
    if ($('#drawerHost').innerHTML) { UI.closeDrawer(); return; }
  }
  var el = e.target.closest && e.target.closest('[data-key]'); if (!el) return;
  var fn = UI.key && UI.key[el.getAttribute('data-key')]; if (fn) fn(el, e);
});
UI.key = {};

/* 图表提示 */
document.addEventListener('mousemove', function (e) {
  var tip = $('#tip'); if (!tip) return;
  var el = e.target.closest && e.target.closest('[data-tip]');
  if (!el) { tip.classList.remove('on'); return; }
  tip.innerHTML = el.getAttribute('data-tip');
  var w = tip.offsetWidth, h = tip.offsetHeight;
  var x = e.clientX + 14, y = e.clientY - h - 12;
  if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
  if (y < 8) y = e.clientY + 18;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
  tip.classList.add('on');
});

var resizeT = null;
window.addEventListener('resize', function () {
  clearTimeout(resizeT);
  resizeT = setTimeout(function () { UI.drawCharts(); var def = UI.pages[UI.page]; if (def && def.resize) def.resize(); }, 120);
});

function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function updateFsBtn() {
  var b = $('#fsBtn'); if (!b) return;
  var on = isFull();
  b.innerHTML = on ? ICON.unfull + '退出全屏' : ICON.fit + '全屏';
  b.title = on ? '退出全屏（Esc）' : '全屏显示工作台';
}
UI.act['fullscreen'] = function () {
  var el = document.documentElement;
  try {
    if (isFull()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) { UI.toast('当前浏览器不支持网页全屏，可以按 F11'); return; }
    var p = req.call(el);
    if (p && p.catch) p.catch(function () { UI.toast('浏览器没有允许全屏，可以按 F11'); });
  } catch (e) { UI.toast('浏览器没有允许全屏，可以按 F11'); }
};
['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
  document.addEventListener(ev, function () { updateFsBtn(); UI.hideCard(); setTimeout(function () { var def = UI.pages[UI.page]; if (def && def.resize) def.resize(); }, 120); });
});

/* 通用动作 */
UI.act['go'] = function (el) {
  var p = el.getAttribute('data-page');
  UI.closeDrawer(); UI.closeModal();
  UI.go(p, { sec: el.getAttribute('data-sec') || null });
};
UI.act['modal-close'] = function () { UI.closeModal(); };
UI.act['modal-mask'] = function () { UI.closeModal(); };
UI.act['drawer-close'] = function () { UI.closeDrawer(); };
UI.act['confirm-ok'] = function () { var c = UI.modalCtx; UI.closeModal(); if (c && c.onOk) c.onOk(); };
UI.act['toggle-rail'] = function () { $('#app').classList.toggle('rail-open'); };
UI.act['copy-txt'] = function (el, e) { if (e) e.stopPropagation(); copyText(el.getAttribute('data-t')); };
UI.act['about-open'] = function () { if (window.About) About.open(); };
UI.act['demo-clear'] = function () {
  UI.confirm('开始录入我的公司', '会清空当前示例公司数据，回到首次打开的状态。如果已经录入过自己的数据，建议先到「设置 → 数据与备份」导出备份。', '开始录入', function () {
    Store.del(STORE_KEY);
    S = defaultState(); S.settings.onboarded = false; save(true); reindex();
    location.reload();
  }, true);
};

/* 全局搜索：员工、候选人、文件 */
UI.inp['gsearch'] = function (el) {
  var q = el.value.trim(), pop = $('#gsearchPop');
  if (!q) { pop.innerHTML = ''; return; }
  var emps = S.employees.filter(function (e) { return e.empStatus !== 'left' && (e.name.indexOf(q) >= 0 || String(e.no).indexOf(q) >= 0 || String(e.phone).indexOf(q) >= 0 || (e.title || '').indexOf(q) >= 0); }).slice(0, 5);
  var cands = S.candidates.filter(function (c) { return c.name.indexOf(q) >= 0 || String(c.phone).indexOf(q) >= 0 || String(c.email).indexOf(q) >= 0; }).slice(0, 5);
  var docs = S.documents.filter(function (d) { return d.name.indexOf(q) >= 0; }).slice(0, 4);
  var h = '';
  if (emps.length) h += '<div class="sp-label">员工</div>' + emps.map(function (e) { return '<button data-act="open-emp" data-eid="' + e.id + '">' + empAva(e, 24) + '<span>' + esc(e.name) + '</span><span class="muted" style="margin-left:auto;font-size:12px;white-space:nowrap">' + esc(e.no + ' · ' + deptName(e.deptId)) + '</span></button>'; }).join('');
  if (cands.length) h += '<div class="sp-label">候选人</div>' + cands.map(function (c) { return '<button data-act="open-cand" data-cid="' + c.id + '">' + candAva(c, 24) + '<span>' + esc(c.name) + '</span><span class="muted" style="margin-left:auto;font-size:12px;white-space:nowrap">' + esc(jobById(c.jobId) ? jobById(c.jobId).title : '') + '</span></button>'; }).join('');
  if (docs.length) h += '<div class="sp-label">文件</div>' + docs.map(function (d) { return '<button data-act="open-doc" data-id="' + d.id + '"><span class="sp-doc">' + ICON.doc + '</span><span>' + esc(d.name) + '</span><span class="muted" style="margin-left:auto;font-size:12px">' + docFileSize(d.size) + '</span></button>'; }).join('');
  pop.innerHTML = '<div class="search-pop">' + (h || '<div class="muted" style="padding:8px 10px;font-size:12.5px">没有找到「' + esc(q) + '」</div>') + '</div>';
};
UI.key['gsearch'] = function (el, e) {
  if (e.key === 'Enter') { var b = $('#gsearchPop .search-pop button'); if (b) b.click(); }
};

/* 下载 / 复制工具 */
function downloadFile(name, content, type) {
  var blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function copyText(t) {
  function fallback() {
    var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); UI.toast('已复制'); } catch (e) { UI.toast('复制失败，请手动选择复制'); }
    ta.remove();
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { UI.toast('已复制'); }, fallback);
  else fallback();
}
function csvCell(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function toCSV(rows) { return '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'); }
function parseTable(text, keepEmpty) {
  text = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  var d = text.indexOf('\t') >= 0 ? '\t' : ',', rows = [], row = [], cur = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; continue; }
    if (ch === '"' && cur.trim() === '') { q = true; cur = ''; continue; }
    if (ch === d) { row.push(cur.trim()); cur = ''; continue; }
    if (ch === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; continue; }
    cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur.trim()); rows.push(row); }
  function blank(r) { return r.every(function (c) { return c === ''; }); }
  while (rows.length && blank(rows[rows.length - 1])) rows.pop();
  return keepEmpty ? rows : rows.filter(function (r) { return !blank(r); });
}
