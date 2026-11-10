/* =========================================================
   办公室 · 等距办公区、顶部浮卡、视图切换、右侧今日概况
   ========================================================= */
var Office = {
  mode: 'daily', view: { s: 1, x: 0, y: 0, fit: true }, L: null,
  drag: null, W: 1320, H: 1140, stage: null, inner: null,
  hoverSeat: null, hoverT: null, hcBound: false, cardHover: false, switchT: null, pendingSeat: null
};
var OFFICE_MODES = [
  ['daily', '日常'], ['att', '在岗'], ['probation', '转正'], ['contract', '合同'], ['tenure', '司龄'], ['perf', '绩效']
];
var OFFICE_ZONES = [
  { deptId: 'tech', x: 420, y: 180, w: 460, h: 380, cols: 4 },
  { deptId: 'product', x: 900, y: 180, w: 400, h: 320, cols: 3 },
  { deptId: 'marketing', x: 20, y: 460, w: 380, h: 340, cols: 3 },
  { deptId: 'sales', x: 420, y: 590, w: 460, h: 400, cols: 3 },
  { deptId: 'finance', x: 900, y: 730, w: 400, h: 300, cols: 2 },
  { deptId: 'hr', x: 20, y: 820, w: 380, h: 300, cols: 2 }
];

UI.register('office', {
  render: function (main) {
    document.body.classList.add('office-page');
    Office.mode = S.settings.officeMode || 'daily';
    main.innerHTML = officeHTML();
    drawOffice();
    requestAnimationFrame(function () { fitOffice(true); });
  },
  rail: function (rail) { rail.innerHTML = officeRailHTML(); },
  mount: function () { bindOfficeStage(); },
  unmount: function () { document.body.classList.remove('office-page'); Office.drag = null; },
  resize: function () { if (Office.view.fit) fitOffice(true); else applyOfficeView(); }
});

function officeHTML() {
  return '<div class="office-page">' +
    '<div class="office-topbar">' +
    '<div class="demo-pill">' + (S.demo ? '正在查看示例公司' : '我的公司') + '<button data-act="' + (S.demo ? 'demo-clear' : 'go') + '"' + (S.demo ? '' : ' data-page="settings" data-sec="profile"') + '>' + (S.demo ? '开始录入我的公司' : '公司设置') + '</button></div>' +
    '<div class="office-title"><b class="ot-name">' + esc(S.settings.short || S.settings.company) + '</b><span>' + esc(S.settings.city) + ' · ' + activeEmployees().length + ' 人 · ' + S.departments.length + ' 个部门</span></div>' +
    '<div class="top-actions">' +
    '<button class="top-pill dark" data-act="office-lottery">年会抽奖</button>' +
    '<div class="zoom-mini"><button data-act="office-zoom" data-d="-1">−</button><span id="officeZoomTxt">100%</span><button data-act="office-zoom" data-d="1">＋</button></div>' +
    '<button class="top-icon" data-act="go" data-page="employees" title="员工花名册">' + ICON.users + '</button>' +
    '<button class="top-icon" data-act="fullscreen" title="全屏">' + ICON.fit + '</button>' +
    '</div></div>' +
    '<div class="office-cards">' + officeCardsHTML() + '</div>' +
    '<div class="office-stage" id="officeStage"><div class="office-inner" id="officeInner"></div></div>' +
    '<div class="office-dock">' + OFFICE_MODES.map(function (m) { return '<button class="' + (Office.mode === m[0] ? 'on' : '') + '" data-act="office-mode" data-m="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
    '<div class="office-zoom"><button data-act="office-zoom" data-d="1">＋</button><button data-act="office-zoom" data-d="-1">−</button><button data-act="office-fit" title="适应窗口">' + ICON.fit + '</button></div>' +
    '</div>';
}
function officeCardsHTML() {
  var h = '';
  var bdays = monthBirthdayList().slice(0, 3);
  h += '<div class="oc-card" data-act="office-go" data-page="employees"><h4>' + ICON.cake + '本月寿星<span class="muted">' + (new Date().getMonth() + 1) + ' 月</span></h4>' +
    (bdays.length ? bdays.map(function (x) { return '<div class="oc-row" data-act="open-emp" data-eid="' + x.e.id + '">' + empAva(x.e, 20) + '<span class="grow">' + esc(x.e.name) + '</span><span class="oc-date">' + (new Date().getMonth() + 1) + '月' + x.day + '日</span></div>'; }).join('') : '<div class="oc-row muted" style="font-size:11.5px">本月暂无寿星</div>') +
    '</div>';
  var ivs = todayInterviews().slice(0, 3);
  h += '<div class="oc-card" data-act="office-go" data-page="interview"><h4>' + ICON.cal + '今日面试<span class="muted">' + ivs.length + ' 场</span></h4>' +
    (ivs.length ? ivs.map(function (i) { var c = candById(i.cid); return '<div class="oc-row" data-act="open-interview" data-id="' + i.id + '"><span class="oc-date" style="margin-left:0;width:36px">' + i.time + '</span><span class="grow">' + esc(c ? c.name : '') + '</span><span class="oc-tag">' + esc(INTERVIEW_ROUNDS[i.round] || '面试') + '</span></div>'; }).join('') : '<div class="oc-row muted" style="font-size:11.5px">今天没有面试</div>') +
    '</div>';
  var hc = headcountStats();
  var d = new Date();
  h += '<div class="oc-card blue" data-act="office-go" data-page="employees"><h4>' + esc(S.settings.short) + ' · ' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + WEEK[d.getDay()] + '</h4>' +
    '<div class="big">' + hc.total + '<small>在职</small></div>' +
    '<div class="sub">本月入职 ' + hc.joinedThisMonth + ' · 试用期 ' + hc.probation + ' · 本月离职 ' + hc.leftThisMonth + '</div></div>';
  var jobs = jobsWithStats().slice(0, 4);
  h += '<div class="oc-card" data-act="office-go" data-page="board"><h4>' + ICON.board + '招聘需求<span class="muted">' + S.jobs.length + ' 个职位</span></h4>' +
    (jobs.length ? jobs.map(function (x) { var pctv = x.j.headcount ? Math.min(100, Math.round(x.st.hired / x.j.headcount * 100)) : 0; return '<div class="oc-job"><span class="grow">' + esc(x.j.title) + '</span><span class="bar"><i style="width:' + pctv + '%"></i></span><span class="num">' + x.st.hired + '/' + x.j.headcount + '</span></div>'; }).join('') : '<div class="oc-row muted" style="font-size:11.5px">还没有在招职位</div>') +
    '</div>';
  var anns = monthAnniversaryList().slice(0, 3);
  h += '<div class="oc-card" data-act="office-go" data-page="employees"><h4>' + ICON.flag + '入职周年<span class="muted">' + (new Date().getMonth() + 1) + ' 月</span></h4>' +
    (anns.length ? anns.map(function (x) { return '<div class="oc-row" data-act="open-emp" data-eid="' + x.e.id + '">' + empAva(x.e, 20) + '<span class="grow">' + esc(x.e.name) + '</span><span class="oc-date">' + x.years + ' 周年</span></div>'; }).join('') : '<div class="oc-row muted" style="font-size:11.5px">本月暂无入职周年</div>') +
    '</div>';
  return h;
}

function bossEmployee() {
  var e = S.settings.bossId ? empById(S.settings.bossId) : null;
  return e && e.empStatus !== 'left' ? e : null;
}
function officeZoneData() {
  return OFFICE_ZONES.map(function (z) {
    var d = deptById(z.deptId), list = employeesOfDept(z.deptId).filter(function (e) { return e.id !== S.settings.bossId; });
    var jobs = S.jobs.filter(function (j) { return j.deptId === z.deptId && j.status === 'open'; });
    var hiring = Math.min(3, sum(jobs.map(function (j) { return Math.max(0, (j.headcount || 0) - jobStats(j).hired); })));
    var rows = Math.ceil((list.length + hiring) / z.cols) || 1;
    return { dept: d, employees: list, lead: deptLead(z.deptId), hiring: hiring, x: z.x, y: z.y, w: z.w, h: z.h, cols: z.cols, rows: rows };
  });
}
function officeViews() {
  var v = {}, mode = Office.mode;
  activeEmployees().forEach(function (e) {
    var o = {}, cls = [];
    if (mode === 'att') {
      var st = statusOf(e);
      if (st) { o.chip = DAY_STATUS[st].t; o.chipTone = DAY_STATUS[st].tone; if (st !== 'business' && st !== 'field') o.dim = true; }
    } else if (mode === 'probation') {
      if (e.empStatus === 'probation') { var left = probationLeft(e); o.badge = '转正 ' + (left === null ? '—' : left + '天'); o.badgeTone = left !== null && left <= 15 ? 'amber' : 'blue'; }
      else o.dim = true;
    } else if (mode === 'contract') {
      var cl = contractLeft(e);
      if (cl !== null && cl <= 180) { o.badge = '合同 ' + cl + '天'; o.badgeTone = cl <= 60 ? 'red' : 'amber'; }
      else o.dim = true;
    } else if (mode === 'tenure') {
      var m = tenureMonths(e.hireDate), y = Math.floor(m / 12);
      o.badge = y >= 1 ? y + '年' : m + '个月';
      o.badgeTone = y >= 5 ? 'green' : y >= 3 ? 'blue' : y >= 1 ? 'light' : 'amber';
    } else if (mode === 'perf') {
      var pc0 = perfCurrentCycle(), pr = pc0 ? perfRecord(pc0.id, e.id) : null, pg = pr ? perfRecordGrade(pr, pc0) : null;
      if (pg) { o.badge = pg; o.badgeTone = pg === 'S' ? 'green' : pg === 'A' ? 'blue' : pg === 'B' ? 'violet' : pg === 'C' ? 'amber' : 'red'; }
      else { o.badge = '待评'; o.badgeTone = 'light'; }
    }
    o.color = deptColor(e.deptId);
    v[e.id] = o;
  });
  return v;
}
function drawOffice() {
  var inner = $('#officeInner'); if (!inner) return;
  clearOfficeHover();
  var zones = officeZoneData();
  var archiveCount = docCounts().all;
  var expiring = S.documents.filter(function (d) { var l = daysTo(d.expireAt); return d.expireAt && l !== null && l >= 0 && l <= 30; }).length;
  var ivs = todayInterviews().map(function (i) { return { id: i.id, time: i.time, round: INTERVIEW_ROUNDS[i.round] || '面试', status: i.status, c: candById(i.cid) }; });
  var res = ART.office({
    W: 1320, H: 1140, zones: zones, views: officeViews(), companyShort: S.settings.short,
    meeting: { x: 20, y: 180, w: 380, h: 240, interviews: ivs },
    archive: { x: 900, y: 520, w: 400, h: 190, count: archiveCount, expiring: expiring },
    boss: { x: 420, y: 20, w: 460, h: 155, person: bossEmployee() },
    lounge: { x: 900, y: 20, w: 400, h: 145 }
  });
  inner.innerHTML = res.svg;
  Office.W = res.W; Office.H = res.H;
  var zt = $('#officeZoomTxt'); if (zt) zt.textContent = Math.round(Office.view.s * 100) + '%';
}
function clearOfficeHover() {
  clearTimeout(Office.hoverT); clearTimeout(Office.switchT);
  Office.hoverSeat = null; Office.pendingSeat = null; Office.cardHover = false;
  UI.hideCard();
}
function showOfficeCard(seat) {
  clearTimeout(Office.switchT); Office.pendingSeat = null;
  Office.hoverSeat = seat;
  var boss = seat.classList.contains('office-boss');
  var eid = seat.getAttribute('data-eid'); if (!eid) { if (boss) UI.showCard(officeBossEmptyCard(), seat); return; }
  var emp = empById(eid); if (!emp) return;
  UI.showCard(officeHoverCard(emp, boss), seat);
}
function officeHoverTarget(e) {
  if (!e.target.closest) return null;
  return e.target.closest('.office-boss') || e.target.closest('.office-seat.has');
}
function bindOfficeStage() {
  Office.stage = $('#officeStage');
  Office.inner = $('#officeInner');
  if (!Office.stage) return;
  Office.stage.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || e.target.closest('[data-act]')) return;
    clearOfficeHover();
    Office.drag = { x: e.clientX, y: e.clientY, ox: Office.view.x, oy: Office.view.y };
    Office.stage.classList.add('grabbing');
  });
  Office.stage.addEventListener('mouseover', function (e) {
    var seat = officeHoverTarget(e);
    if (!seat) return;
    if (!seat.classList.contains('office-boss')) {
      var eid = seat.getAttribute('data-eid'); if (!eid) return;
    }
    clearTimeout(Office.hoverT);
    if (Office.hoverSeat === seat) return;
    if (Office.cardHover) return;                 // 正在卡片上操作，不要切走
    if (Office.hoverSeat) {
      // 已经有一张卡：给用户 700ms 去点卡片，路过别人时不立即切换
      Office.pendingSeat = seat;
      clearTimeout(Office.switchT);
      Office.switchT = setTimeout(function () {
        if (Office.cardHover) return;
        showOfficeCard(seat);
      }, 900);
      return;
    }
    showOfficeCard(seat);
  });
  Office.stage.addEventListener('mouseout', function (e) {
    var seat = officeHoverTarget(e);
    if (!seat) return;
    var to = e.relatedTarget;
    if (to && to.closest && (to.closest('.office-seat.has') || to.closest('.office-boss') || to.closest('#hcard'))) return;
    if (Office.pendingSeat === seat) { clearTimeout(Office.switchT); Office.pendingSeat = null; }
    if (Office.cardHover) return;
    clearTimeout(Office.hoverT);
    Office.hoverT = setTimeout(function () {
      if (Office.cardHover) return;
      UI.hideCard(); Office.hoverSeat = null; Office.pendingSeat = null;
    }, 400);
  });
  var hc = $('#hcard');
  if (hc && !Office.hcBound) {
    Office.hcBound = true;
    hc.addEventListener('mouseenter', function () {
      Office.cardHover = true;
      clearTimeout(Office.hoverT); clearTimeout(Office.switchT);
    });
    hc.addEventListener('mouseleave', function () {
      Office.cardHover = false;
      clearTimeout(Office.hoverT);
      Office.hoverT = setTimeout(function () {
        if (Office.cardHover) return;
        UI.hideCard(); Office.hoverSeat = null; Office.pendingSeat = null;
      }, 400);
    });
  }
  if (!Office.windowBound) {
    Office.windowBound = true;
    window.addEventListener('mousemove', function (e) {
      if (!Office.drag) return;
      Office.view.x = Office.drag.ox + (e.clientX - Office.drag.x);
      Office.view.y = Office.drag.oy + (e.clientY - Office.drag.y);
      Office.view.fit = false;
      applyOfficeView();
    });
    window.addEventListener('mouseup', function () {
      if (Office.drag) { Office.drag = null; Office.stage && Office.stage.classList.remove('grabbing'); }
    });
  }
  Office.stage.addEventListener('wheel', function (e) {
    if (e.target.closest('[data-act]') && !e.ctrlKey) return;
    e.preventDefault();
    var r = Office.stage.getBoundingClientRect();
    zoomOffice(e.deltaY < 0 ? 1.08 : 0.92, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}
function fitOffice(reset) {
  clearOfficeHover();
  var st = Office.stage || $('#officeStage'); if (!st || !Office.W) return;
  var W = st.clientWidth, H = st.clientHeight;
  if (!W || !H) return;
  var padT = 60, padB = 64;   // 顶部浮卡 / 底部视图切换条都不挡住 Boss 办公室
  var cards = $('.office-cards');
  if (cards) {
    var cr = cards.getBoundingClientRect(), sr = st.getBoundingClientRect();
    if (cr.height) padT = Math.max(60, cr.bottom - sr.top + 8);
  }
  var s = Math.min(W / Office.W, (H - padT - padB) / Office.H);
  s = clamp(s, 0.45, 1.3);
  Office.view = { s: s, x: (W - Office.W * s) / 2, y: padT + Math.max(0, (H - padT - padB - Office.H * s) / 2), fit: true };
  applyOfficeView();
}
function applyOfficeView() {
  var inner = Office.inner || $('#officeInner'); if (!inner) return;
  inner.style.transform = 'translate(' + Math.round(Office.view.x) + 'px,' + Math.round(Office.view.y) + 'px) scale(' + Office.view.s + ')';
  var zt = $('#officeZoomTxt'); if (zt) zt.textContent = Math.round(Office.view.s * 100) + '%';
}
function zoomOffice(f, cx, cy) {
  clearOfficeHover();
  var v = Office.view, ns = clamp(v.s * f, 0.45, 2.2);
  v.x = cx - (cx - v.x) * (ns / v.s); v.y = cy - (cy - v.y) * (ns / v.s); v.s = ns; v.fit = false;
  applyOfficeView();
}
UI.act['office-mode'] = function (el) {
  Office.mode = el.getAttribute('data-m');
  clearOfficeHover();
  S.settings.officeMode = Office.mode; save();
  $$('.office-dock button').forEach(function (b) { b.classList.toggle('on', b === el); });
  drawOffice();
  var zt = $('#officeZoomTxt'); if (zt) zt.textContent = Math.round(Office.view.s * 100) + '%';
};
UI.act['office-zoom'] = function (el) {
  var st = Office.stage; if (!st) return;
  zoomOffice(+el.getAttribute('data-d') > 0 ? 1.15 : 0.87, st.clientWidth / 2, st.clientHeight / 2);
};
UI.act['office-fit'] = function () { fitOffice(true); };
UI.act['office-go'] = function (el) { UI.go(el.getAttribute('data-page')); };
UI.act['office-schedule'] = function (el) { var kind = el.getAttribute('data-kind'), id = el.getAttribute('data-id'); if (kind === 'activity') openAct(id); else openTrain(id); };
UI.act['office-dept'] = function (el) { UI.go('employees', { dept: el.getAttribute('data-dept') }); };
UI.act['office-hiring'] = function () { UI.go('board'); UI.toast('在招聘看板里新增职位，或在员工花名册里添加员工'); };
UI.act['office-lottery'] = function () {
  var list = activeEmployees();
  if (!list.length) { UI.toast('还没有员工'); return; }
  var n = 0, timer = setInterval(function () {
    n++;
    var e = list[Math.floor(Math.random() * list.length)];
    UI.toast('🎉 ' + e.name + ' · ' + deptName(e.deptId), 600);
    if (n >= 12) { clearInterval(timer); var win = list[Math.floor(Math.random() * list.length)]; UI.toast('恭喜 ' + win.name + ' 中奖！', 2600); }
  }, 80);
};

/* ---------- 右侧今日概况 ---------- */
function officeRailHTML() {
  var d = new Date(), st = todayStatusStats(), list = statusListToday();
  var h = '<div class="rail-head"><div class="rh-top"><span class="rh-date">' + (d.getMonth() + 1) + '月' + d.getDate() + '日</span><span class="rh-week">星期' + WEEK[d.getDay()] + '</span></div><div class="rh-company">' + esc(S.settings.company) + '</div></div>';
  h += '<div class="rail-stats"><div class="rail-stat"><b>' + st.total + '</b><span>在职</span></div><div class="rail-stat"><b>' + probationEmployees().length + '</b><span>试用期</span></div><div class="rail-stat"><b>' + headcountStats().joinedThisMonth + '</b><span>本月入职</span></div></div>';
  h += bossRailHTML();
  var presentPct = st.total ? st.present / st.total * 100 : 0;
  var leavePct = st.total ? st.leave / st.total * 100 : 0, bizPct = st.total ? st.business / st.total * 100 : 0, fieldPct = st.total ? st.field / st.total * 100 : 0, absPct = st.total ? st.absent / st.total * 100 : 0, missPct = st.total ? st.missing / st.total * 100 : 0;
  h += '<div class="rail-sec"><div class="rail-title">今日在岗<button data-act="go" data-page="attendance">去登记</button></div>' +
    '<div class="att-num"><b>' + st.present + '</b><small>/ ' + st.total + '</small></div>' +
    '<div class="att-bar"><i style="width:' + presentPct + '%;background:#2fb36d"></i><i style="width:' + leavePct + '%;background:#f2a71b"></i><i style="width:' + bizPct + '%;background:#2f7ff0"></i><i style="width:' + fieldPct + '%;background:#7a5af5"></i><i style="width:' + absPct + '%;background:#e5483b"></i><i style="width:' + missPct + '%;background:#a8a8a5"></i></div>' +
    '<div class="att-legend"><span><i style="background:#2fb36d"></i>在岗 ' + st.present + '</span><span><i style="background:#f2a71b"></i>请假 ' + st.leave + '</span><span><i style="background:#2f7ff0"></i>出差 ' + st.business + '</span><span><i style="background:#7a5af5"></i>外勤 ' + st.field + '</span><span><i style="background:#e5483b"></i>缺勤 ' + st.absent + '</span>' + (st.missing ? '<span><i style="background:#a8a8a5"></i>未打卡 ' + st.missing + '</span>' : '') + '</div>' +
    '<div class="status-list">' + (list.length ? list.map(function (x) { return '<div class="status-row" data-act="open-emp" data-eid="' + x.e.id + '">' + empAva(x.e, 26) + '<div><div class="sn">' + esc(x.e.name) + '</div><div class="sd">' + esc(deptName(x.e.deptId)) + '</div></div><span class="st">' + statusTag(x.s) + '</span></div>'; }).join('') : '<div class="muted" style="font-size:12px;padding:6px">今天全员在岗</div>') + '</div></div>';
  var rem = reminders();
  h += '<div class="rail-sec"><div class="rail-title">提醒<span class="tag red" style="height:18px;font-size:10.5px">' + reminderCount() + '</span><button data-act="go" data-page="board">全部</button></div><div class="remind-list">' +
    (rem.length ? rem.map(function (r) { return '<button class="remind-row" data-act="office-remind" data-kind="' + r.kind + '" data-id="' + (r.id || '') + '"><span class="ri">' + (r.kind === 'interview' ? ICON.cal : r.kind === 'resume' ? ICON.resume : r.kind === 'offer' ? ICON.doc : r.kind === 'doc' ? ICON.folder : ICON.bell) + '</span><span class="rt">' + esc(r.title) + '<small>' + esc(r.tag) + '</small></span><span class="tag ' + r.tone + '">' + esc(r.tag) + '</span></button>'; }).join('') : '<div class="muted" style="font-size:12px;padding:6px">没有待办提醒</div>') + '</div></div>';
  var ivs = todayInterviews();
  h += '<div class="rail-sec"><div class="rail-title">今日面试<button data-act="go" data-page="interview">日程</button></div><div class="iv-mini-list">' +
    (ivs.length ? ivs.map(function (i) { var c = candById(i.cid), job = c ? jobById(c.jobId) : null; return '<div class="iv-mini-row" data-act="open-interview" data-id="' + i.id + '"><span class="tm">' + i.time + '</span><div class="ivn">' + esc(c ? c.name : '') + '<small>' + esc((INTERVIEW_ROUNDS[i.round] || '面试') + ' · ' + (job ? job.title : '')) + '</small></div><span class="tag ' + (i.status === 'done' ? 'green' : 'blue') + '">' + (i.status === 'done' ? '已完成' : '待面试') + '</span></div>'; }).join('') : '<div class="muted" style="font-size:12px;padding:6px">今天没有面试安排</div>') + '</div></div>';
  var sched = upcomingSchedule(4);
  h += '<div class="rail-sec"><div class="rail-title">近期安排<button data-act="go" data-page="activities">全部</button></div><div class="iv-mini-list">' + (sched.length ? sched.map(function (x) { return '<div class="iv-mini-row" data-act="office-schedule" data-kind="' + x.kind + '" data-id="' + x.id + '"><span class="tm">' + esc(fmtShort(x.date)) + '</span><div class="ivn">' + esc(x.title) + '<small>' + esc((x.kind === 'activity' ? '活动' : '培训') + ' · ' + (x.type || '') + ' · ' + (x.time || '')) + '</small></div><span class="tag" style="height:19px;font-size:10.5px;background:' + x.color + '1a;color:' + x.color + '">' + esc(x.kind === 'activity' ? '活动' : '培训') + '</span></div>'; }).join('') : '<div class="muted" style="font-size:12px;padding:6px">近期没有安排</div>') + '</div></div>';
  h += '<div class="rail-foot-note">数据只保存在本机浏览器</div>';
  return h;
}
UI.act['office-remind'] = function (el) {
  var kind = el.getAttribute('data-kind'), id = el.getAttribute('data-id');
  if (kind === 'interview' && id) { var iv = S.interviews.filter(function (x) { return x.id === id; })[0]; if (iv) openInterviewFeedback(iv.id); else UI.go('interview'); return; }
  if (kind === 'resume') { UI.go('resume'); return; }
  if (kind === 'notify') { UI.go('resume'); setTimeout(function () { openNotifyBatch(); }, 120); return; }
  if (kind === 'offer') { UI.go('score'); return; }
  if (kind === 'memo') { openEmployee(id); return; }
  if (kind === 'attendance') { UI.go('attendance'); return; }
  if (kind === 'performance') { UI.go('performance'); return; }
  if (kind === 'activity') { openAct(id); return; }
  if (kind === 'training') { openTrain(id); return; }
  if (kind === 'doc') { UI.go('files'); return; }
  UI.go('board');
};
function refreshOffice() {
  if (UI.page === 'office') { drawOffice(); var rail = $('#rail'); if (rail) rail.innerHTML = officeRailHTML(); UI.refreshSide(); }
}


/* ---------- 员工悬停卡 ---------- */
function officeHoverCard(e, boss) {
  var st = statusOf(e), mat = materialsOf(e), lead = isDeptLead(e);
  var statusText = st ? DAY_STATUS[st].t : (e.empStatus === 'probation' ? '试用期' : '在职');
  var dotColor = st ? ({ leave: '#f2a71b', business: '#2f7ff0', field: '#7a5af5', absent: '#e5483b' }[st] || '#1d9a57') : (e.empStatus === 'probation' ? '#2f7ff0' : '#1d9a57');
  var left = e.empStatus === 'probation' ? probationLeft(e) : contractLeft(e);
  var stat3 = left === null ? '—' : left + ' 天';
  var tags = (e.tags || []).slice(0, 3).map(function (t) { return '<span class="tag gray">' + esc(t) + '</span>'; }).join('');
  var pcy = perfCurrentCycle(), prec = pcy ? perfRecord(pcy.id, e.id) : null, pgr = prec ? perfRecordGrade(prec, pcy) : null;
  if (pgr) tags = '<span class="tag ' + perfGradeTone(pgr) + '">绩效 ' + pgr + '</span>' + tags;
  var ar = attRecord(e.id);
  if (ar && ar.in) tags += '<span class="tag gray">' + esc(ar.in) + ' 打卡</span>';
  if (!tags) tags = '<span class="tag gray">暂无标签</span>';
  var memos = S.events.filter(function (x) { return x.eid === e.id && x.type === '备忘'; }).sort(function (a, b) {
    var ka = a.date + ' ' + (a.time || '') + ' ' + String(a.at || 0).padStart(13, '0'), kb = b.date + ' ' + (b.time || '') + ' ' + String(b.at || 0).padStart(13, '0');
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  });
  return '<div class="hc-head">' + empAva(e, 46) + '<div><div class="hc-name">' + esc(e.name) + (boss ? '<span class="tag" style="height:17px;font-size:10px;background:#171717;color:#fff">Boss</span>' : '') + (lead && !boss ? '<span class="tag amber" style="height:17px;font-size:10px">负责人</span>' : '') + '</div>' +
    '<div class="hc-role">' + esc(e.no + ' · ' + (e.gender === 'F' ? '女' : '男') + ' · ' + deptName(e.deptId)) + '</div>' +
    '<div class="hc-status"><i style="background:' + dotColor + '"></i>' + esc(statusText) + ' · ' + esc(e.title + ' ' + e.level) + '</div></div></div>' +
    '<div class="hc-stats"><div><b>' + esc(tenureText(e.hireDate)) + '</b><span>司龄</span></div><div><b>' + Math.round(mat.rate * 100) + '%</b><span>档案齐全度</span></div><div><b>' + stat3 + '</b><span>' + (e.empStatus === 'probation' ? '试用期剩余' : '合同剩余') + '</span></div></div>' +
    '<div class="hc-tags">' + tags + '</div>' +
    (memos.length ? '<div class="hc-memos"><div class="hc-memos-h">备注 ' + memos.length + ' 条</div>' + memos.map(function (m) { var when = (m.date === todayStr() ? '' : fmtShort(m.date) + ' ') + (m.time || ''); return '<div class="hc-memo">' + ICON.doc + '<span>' + (when ? '<b>' + esc(when) + '</b> ' : '') + esc(m.text) + '</span></div>'; }).join('') + '</div>' : '') +
    '<div class="hc-actions"><button class="btn btn-sm btn-light" data-act="office-memo" data-eid="' + e.id + '">' + ICON.edit + '添加备忘</button><button class="btn btn-sm btn-dark" data-act="open-emp" data-eid="' + e.id + '">查看详情</button></div>';
}
/* ---------- Boss 办公室 ---------- */
function officeBossEmptyCard() {
  return '<div class="hc-head">' + ART.avatar({ id: 'boss-empty', name: 'Boss', gender: 'M' }, 46, { color: '#171717' }) + '<div><div class="hc-name">Boss</div>' +
    '<div class="hc-role">还没有选择 Boss</div>' +
    '<div class="hc-status"><i style="background:#a8a8a5"></i>从员工花名册里选一位</div></div></div>' +
    '<div class="muted" style="font-size:12px;line-height:1.7;margin-top:10px">Boss 的资料、备注和档案都来自花名册，和普通员工一样可以添加备注。</div>' +
    '<div class="hc-actions" style="margin-top:12px"><button class="btn btn-sm btn-dark" data-act="boss-select">去设置里选择</button></div>';
}
UI.act['boss-select'] = function () { UI.go('settings', { sec: 'profile' }); };
function bossRailHTML() {
  var b = bossEmployee(); if (!b) return '';
  var memos = S.events.filter(function (x) { return x.eid === b.id && x.type === '备忘'; }).sort(function (a, c) {
    var ka = a.date + ' ' + (a.time || '') + ' ' + String(a.at || 0).padStart(13, '0'), kb = c.date + ' ' + (c.time || '') + ' ' + String(c.at || 0).padStart(13, '0');
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  }).slice(0, 3);
  var h = '<div class="rail-sec"><div class="rail-title">Boss<span class="muted">' + esc(b.title) + '</span><button data-act="open-emp" data-eid="' + b.id + '">档案</button></div>' +
    '<div class="status-row" data-act="open-emp" data-eid="' + b.id + '" style="padding-left:0">' + empAva(b, 30) + '<div><div class="sn">' + esc(b.name) + '</div><div class="sd">' + esc(deptName(b.deptId)) + '</div></div><span class="tag" style="background:#171717;color:#fff;margin-left:auto">Boss</span></div>';
  if (memos.length) h += '<div class="remind-list" style="margin-top:2px">' + memos.map(function (m) {
    var when = (m.date === todayStr() ? '' : fmtShort(m.date) + ' ') + (m.time || '');
    return '<div class="remind-row" data-act="open-emp" data-eid="' + b.id + '"><span class="ri">' + ICON.doc + '</span><span class="rt">' + esc(m.text) + (when ? '<small>' + esc(when) + '</small>' : '') + '</span></div>';
  }).join('') + '</div>';
  else h += '<div class="muted" style="font-size:12px;padding:6px 0 2px">还没有备注，可以记要求、工作安排、行程</div>';
  h += '<button class="btn btn-sm btn-light" style="width:100%;margin-top:6px" data-act="office-memo" data-eid="' + b.id + '">' + ICON.plus + '添加备注</button></div>';
  return h;
}
UI.act['office-memo'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var now = new Date(Date.now() + 3600000);
  var t = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
  UI.modal({
    title: '添加备忘 · ' + e.name, wide: false,
    body: '<div class="memo-emp">' + empAva(e, 38) + '<div><b>' + esc(e.name) + '</b><div class="muted">' + esc(deptName(e.deptId) + ' · ' + e.title) + '</div></div><span class="grow"></span><span class="tag gray">' + esc(e.no) + '</span></div>' +
      '<div class="field"><label>备忘内容</label><textarea class="ta" id="omText" autofocus placeholder="例如：下周一确认转正材料；下周出差行程" style="min-height:90px"></textarea></div>' +
      '<div class="row2"><div class="field"><label>日期</label><input class="inp" type="date" id="omDate" value="' + todayStr() + '"></div><div class="field"><label>时间</label><input class="inp" type="time" id="omTime" value="' + t + '"></div></div>' +
      '<div class="muted" style="font-size:12px;line-height:1.7">备忘会记到员工档案的「记录」里；日期在今天的未来备忘也会出现在办公室右侧提醒中。</div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="om-save" data-eid="' + e.id + '">保存备忘</button>'
  });
};
UI.act['om-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var text = $('#omText').value.trim(); if (!text) { $('#omText').focus(); UI.toast('请填写备忘内容'); return; }
  var date = $('#omDate').value || todayStr(), time = $('#omTime').value;
  var ev = { id: uid('ev'), eid: e.id, type: '备忘', text: text, date: date, time: time, at: Date.now() };
  S.events.push(ev);
  save(); UI.closeModal(); clearOfficeHover();
  if (UI.page === 'office') refreshOffice();
  UI.toast('备忘已添加：' + text, 2400);
  setTimeout(function () { openEmployee(e.id, 'records'); }, 120);
};
