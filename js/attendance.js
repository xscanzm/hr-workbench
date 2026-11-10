/* =========================================================
   考勤管理 · 今日考勤、月度统计、请假与异常
   ========================================================= */
var Att = { tab: 'today', date: todayStr(), month: todayStr().slice(0, 7), dept: 'all', status: 'all', q: '' };
var ATT_ORDER = ['normal', 'late', 'early', 'leave', 'business', 'field', 'absent', 'missing'];
function attTone(s) { var x = DAY_STATUS[s]; return x ? x.tone : 'gray'; }
function attLabel(s) { var x = DAY_STATUS[s]; return x ? x.t : '—'; }
function attHours(rec) {
  if (!rec || !rec.in || !rec.out) return null;
  var a = timeMin(rec.in), b = timeMin(rec.out);
  if (!a || !b || b < a) return null;
  return round1((b - a) / 60 - 1); // 午休 1 小时
}
function attMonthDays(month) {
  var d = parseDate(month + '-01'); if (!d) return 0;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function attTodayRows() {
  var q = Att.q.trim();
  return activeEmployees().filter(function (e) {
    if (Att.dept !== 'all' && e.deptId !== Att.dept) return false;
    var s = statusOf(e);
    if (Att.status !== 'all' && s !== Att.status) return false;
    if (q && (e.name + ' ' + e.no + ' ' + e.title).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    return true;
  }).sort(function (a, b) { return deptName(a.deptId).localeCompare(deptName(b.deptId), 'zh') || String(a.no).localeCompare(String(b.no), 'zh', { numeric: true }); });
}
UI.register('attendance', {
  render: function (main, opts) {
    if (opts && opts.month) Att.month = opts.month;
    if (opts && opts.emp) { Att.q = opts.emp; Att.tab = 'month'; }
    var ts = todayStatusStats(), ms = attMonthStats(Att.month);
    var h = '<div class="page scroll attendance-page"><div class="page-head"><div><h1 class="page-title">考勤管理</h1><div class="page-desc">今日应到 <b>' + ts.total + '</b> · 已打卡 <b>' + ts.present + '</b> · 异常 <b>' + (ts.late + ts.early + ts.absent + ts.missing) + '</b> · ' + esc(Att.month) + ' 出勤率 <b>' + pct(ms.rate) + '</b></div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="att-export">' + ICON.down + '导出月报</button>' +
      '<button class="btn btn-light" data-act="att-save-doc">' + ICON.doc + '存为月报</button>' +
      '<button class="btn btn-light" data-act="go" data-page="settings" data-sec="attendance">' + ICON.gear + '考勤规则</button>' +
      '<button class="btn btn-dark" data-act="att-edit" data-eid="">' + ICON.plus + '登记考勤</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">应到</div><div class="v">' + ts.total + '<small>人</small></div><div class="d">在职员工</div></div>' +
      '<div class="stat-card"><div class="k">已打卡</div><div class="v">' + ts.present + '<small>人</small></div><div class="d">正常 ' + ts.normal + ' · 迟到 ' + ts.late + ' · 早退 ' + ts.early + '</div></div>' +
      '<div class="stat-card"><div class="k">请假 / 出差 / 外勤</div><div class="v">' + (ts.leave + ts.business + ts.field) + '<small>人</small></div><div class="d">请假 ' + ts.leave + ' · 出差 ' + ts.business + ' · 外勤 ' + ts.field + '</div></div>' +
      '<div class="stat-card"><div class="k">缺勤 / 未打卡</div><div class="v">' + (ts.absent + ts.missing) + '<small>人</small></div><div class="d">缺勤 ' + ts.absent + ' · 未打卡 ' + ts.missing + '</div></div></div>';
    h += '<div class="tabs att-tabs">' + [['today', '今日考勤'], ['month', '月度统计'], ['leave', '请假与异常']].map(function (t) { return '<button class="' + (Att.tab === t[0] ? 'on' : '') + '" data-act="att-tab" data-v="' + t[0] + '">' + t[1] + (t[0] === 'leave' ? '<span class="cnt">' + pendingLeaves().length + '</span>' : '') + '</button>'; }).join('') + '</div>';
    h += '<div id="attBody"></div></div>';
    main.innerHTML = h;
    renderAttBody();
  }
});
function renderAttBody() {
  var el = $('#attBody'); if (!el) return;
  if (Att.tab === 'today') el.innerHTML = attTodayHTML();
  else if (Att.tab === 'month') el.innerHTML = attMonthHTML();
  else el.innerHTML = attLeaveHTML();
  if (Att.tab === 'month') UI.drawCharts();
}
function attFilterHTML() {
  return '<div class="filterbar"><input class="inp" placeholder="搜索姓名、工号、职位" value="' + esc(Att.q) + '" data-inp="att-q" style="width:240px">' +
    '<select class="sel" style="width:150px;height:34px" data-chg="att-dept"><option value="all">全部部门</option>' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (Att.dept === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select>' +
    '<div class="chips"><button class="' + (Att.status === 'all' ? 'on' : '') + '" data-act="att-status" data-v="all">全部</button>' + ATT_ORDER.map(function (s) { return '<button class="' + (Att.status === s ? 'on' : '') + '" data-act="att-status" data-v="' + s + '">' + attLabel(s) + '</button>'; }).join('') + '</div>' +
    '<span class="grow"></span><button class="btn btn-light btn-sm" data-act="att-remind">' + ICON.bell + '提醒未打卡</button></div>';
}
function attTodayHTML() {
  var list = attTodayRows(), ts = todayStatusStats();
  var h = attFilterHTML();
  h += '<div class="tbl-wrap"><table class="tbl att-tbl"><thead><tr><th>员工</th><th>部门</th><th>上班打卡</th><th>下班打卡</th><th class="r">工时</th><th>状态</th><th>备注</th><th class="r">操作</th></tr></thead><tbody>';
  if (!list.length) h += '<tr><td colspan="8"><div class="empty">没有符合条件的员工</div></td></tr>';
  list.forEach(function (e) {
    var rec = attRecord(e.id) || {}, s = statusOf(e), hrs = attHours(rec);
    h += '<tr class="click" data-act="att-edit" data-eid="' + e.id + '"><td><div class="nm">' + empAva(e, 28) + esc(e.name) + (isDeptLead(e) ? '<span class="tag amber" style="height:18px;font-size:10.5px;margin-left:4px">负责人</span>' : '') + '</div></td>' +
      '<td><span class="dept-cell"><i class="dot" style="background:' + deptColor(e.deptId) + '"></i>' + esc(deptName(e.deptId)) + '</span></td>' +
      '<td class="num">' + (rec.in || '<span class="muted">—</span>') + '</td><td class="num">' + (rec.out || '<span class="muted">—</span>') + '</td>' +
      '<td class="r num">' + (hrs === null ? '—' : hrs + ' h') + '</td>' +
      '<td><span class="tag ' + attTone(s) + '">' + attLabel(s) + '</span></td>' +
      '<td class="sub">' + esc(rec.note || (rec.leaveType ? leaveTypeName(rec.leaveType) : '') || '') + '</td>' +
      '<td class="r"><span class="ops"><button class="btn btn-xs btn-ghost" data-act="att-edit" data-eid="' + e.id + '">编辑</button></span></td></tr>';
  });
  h += '</tbody></table></div><div class="muted" style="font-size:12px;margin-top:8px">今日：正常 ' + ts.normal + ' · 迟到 ' + ts.late + ' · 早退 ' + ts.early + ' · 请假 ' + ts.leave + ' · 出差 ' + ts.business + ' · 外勤 ' + ts.field + ' · 缺勤 ' + ts.absent + ' · 未打卡 ' + ts.missing + '</div>';
  return h;
}
function attMonthHTML() {
  var list = activeEmployees().filter(function (e) { return Att.dept === 'all' || e.deptId === Att.dept; });
  var q = Att.q.trim(); if (q) list = list.filter(function (e) { return (e.name + ' ' + e.no + ' ' + e.title).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
  var ms = attMonthStats(Att.month), days = attMonthDays(Att.month);
  var h = '<div class="filterbar"><input class="inp" type="month" value="' + esc(Att.month) + '" data-chg="att-month" style="width:160px"><select class="sel" style="width:150px;height:34px" data-chg="att-dept"><option value="all">全部部门</option>' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (Att.dept === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select>' +
    '<input class="inp" placeholder="搜索员工" value="' + esc(Att.q) + '" data-inp="att-q" style="width:180px"><span class="grow"></span><span class="muted" style="font-size:12.5px">平均出勤率 <b style="color:var(--ink)">' + pct(ms.rate) + '</b> · 迟到 ' + ms.late + ' 人次 · 请假 ' + ms.leave + ' 天</span></div>';
  h += '<div class="att-month-grid"><div class="panel"><div class="panel-title">出勤率趋势</div><div class="panel-sub">最近 6 个月</div>' + UI.chart(function (w) {
    var tr = attTrend(6);
    return CH.lines([{ name: '出勤率', color: CH.C.s3, values: tr.rates, area: true }], tr.labels, w, { h: 190, min: 70, max: 100, fmt: function (v) { return Math.round(v) + '%'; } });
  }) + '</div><div class="panel"><div class="panel-title">月度概览</div><div class="panel-sub">' + esc(Att.month) + '</div><div class="att-kv"><span>记录人次</span><b>' + ms.days + '</b></div><div class="att-kv"><span>正常</span><b>' + ms.normal + '</b></div><div class="att-kv"><span>迟到 / 早退</span><b>' + ms.late + ' / ' + ms.early + '</b></div><div class="att-kv"><span>请假 / 出差 / 外勤</span><b>' + ms.leave + ' / ' + ms.business + ' / ' + ms.field + '</b></div><div class="att-kv"><span>缺勤 / 未打卡</span><b>' + ms.absent + ' / ' + ms.missing + '</b></div></div></div>';
  h += '<div class="tbl-wrap att-sum-wrap"><table class="tbl"><thead><tr><th>员工</th><th>部门</th><th class="r">记录天数</th><th class="r">正常</th><th class="r">迟到</th><th class="r">早退</th><th class="r">请假</th><th class="r">缺勤</th><th class="r">未打卡</th><th class="r">出勤率</th></tr></thead><tbody>';
  list.forEach(function (e) {
    var s = attMonthSummary(e.id, Att.month);
    h += '<tr class="click" data-act="att-emp" data-eid="' + e.id + '"><td><div class="nm">' + empAva(e, 26) + esc(e.name) + '</div></td><td class="sub">' + esc(deptName(e.deptId)) + '</td><td class="r num">' + s.days + '</td><td class="r num">' + s.normal + '</td><td class="r num' + (s.late ? ' dn' : '') + '">' + s.late + '</td><td class="r num">' + s.early + '</td><td class="r num">' + s.leave + '</td><td class="r num' + (s.absent ? ' dn' : '') + '">' + s.absent + '</td><td class="r num">' + s.missing + '</td><td class="r num"><b>' + pct(s.rate) + '</b></td></tr>';
  });
  h += '</tbody></table></div>';
  h += '<div class="panel att-heat-panel"><div class="panel-title">每日考勤</div><div class="panel-sub">' + esc(Att.month) + ' · 颜色越深表示异常</div><div class="att-legend">' + ATT_ORDER.map(function (s) { return '<span><i class="att-dot s-' + s + '"></i>' + attLabel(s) + '</span>'; }).join('') + '</div><div class="att-heat-wrap"><table class="att-heat"><thead><tr><th></th>' + Array.apply(null, { length: days }).map(function (_, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '</tr></thead><tbody>';
  list.slice(0, 60).forEach(function (e) {
    h += '<tr><td class="att-heat-name">' + esc(e.name) + '</td>';
    for (var day = 1; day <= days; day++) {
      var ds = Att.month + '-' + pad2(day), rec = attRecord(e.id, ds), st = rec ? rec.status : '';
      h += '<td><span class="att-cell s-' + (st || 'none') + '" title="' + esc(e.name + ' · ' + ds + (st ? ' · ' + attLabel(st) : '')) + '" data-act="att-edit" data-eid="' + e.id + '" data-ds="' + ds + '"></span></td>';
    }
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}
function attLeaveHTML() {
  var pending = S.leaveRequests.filter(function (x) { return x.status === 'pending'; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; });
  var all = S.leaveRequests.slice().sort(function (a, b) { return a.appliedAt < b.appliedAt ? 1 : -1; });
  var ex = attExceptionsToday();
  var h = '<div class="att-leave-grid"><div class="panel"><div style="display:flex;align-items:center;gap:10px"><div class="panel-title">待审批请假</div><span class="tag amber">' + pending.length + '</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="att-leave-add">' + ICON.plus + '登记请假</button></div><div class="panel-sub">同意后会写入对应日期的考勤</div>';
  if (!pending.length) h += '<div class="empty">没有待审批的请假</div>';
  pending.forEach(function (lv) {
    var e = empById(lv.eid); if (!e) return;
    h += '<div class="leave-card"><div class="leave-head">' + empAva(e, 30) + '<div><b>' + esc(e.name) + '</b><div class="muted">' + esc(deptName(e.deptId) + ' · ' + e.title) + '</div></div><span class="grow"></span><span class="tag amber">' + esc(leaveTypeName(lv.type)) + '</span></div>' +
      '<div class="leave-meta"><span>' + esc(lv.start) + ' → ' + esc(lv.end) + ' · ' + lv.days + ' 天</span><span>' + esc(lv.reason) + '</span></div>' +
      '<div class="leave-actions"><button class="btn btn-xs btn-light" data-act="att-leave-no" data-id="' + lv.id + '">驳回</button><button class="btn btn-xs btn-dark" data-act="att-leave-ok" data-id="' + lv.id + '">同意</button></div></div>';
  });
  h += '</div><div class="panel"><div class="panel-title">今日异常</div><div class="panel-sub">迟到、早退、缺勤、未打卡</div>';
  if (!ex.length) h += '<div class="empty">今天没有异常</div>';
  ex.forEach(function (x) {
    var rec = x.rec || {};
    h += '<div class="att-ex-row" data-act="att-edit" data-eid="' + x.e.id + '">' + empAva(x.e, 28) + '<div class="grow"><b>' + esc(x.e.name) + '</b><div class="muted">' + esc(deptName(x.e.deptId) + ' · ' + (rec.in || '未打卡') + (rec.out ? ' – ' + rec.out : '')) + '</div></div><span class="tag ' + attTone(x.s) + '">' + attLabel(x.s) + '</span></div>';
  });
  h += '</div></div>';
  h += '<div class="panel" style="margin-top:14px"><div class="panel-title">全部请假记录</div><div class="panel-sub">最近申请在前</div><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>员工</th><th>类型</th><th>开始</th><th>结束</th><th class="r">天数</th><th>原因</th><th>状态</th><th>审批备注</th></tr></thead><tbody>';
  all.forEach(function (lv) {
    var e = empById(lv.eid); if (!e) return;
    h += '<tr><td><div class="nm">' + empAva(e, 24) + esc(e.name) + '</div></td><td>' + esc(leaveTypeName(lv.type)) + '</td><td class="num">' + esc(lv.start) + '</td><td class="num">' + esc(lv.end) + '</td><td class="r num">' + lv.days + '</td><td class="sub">' + esc(lv.reason) + '</td><td>' + (lv.status === 'approved' ? '<span class="tag green">已批准</span>' : lv.status === 'rejected' ? '<span class="tag red">已驳回</span>' : '<span class="tag amber">待审批</span>') + '</td><td class="sub">' + esc(lv.note || '') + '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

/* ---------- 交互 ---------- */
UI.act['att-tab'] = function (el) { Att.tab = el.getAttribute('data-v'); UI.rerender(); };
UI.inp['att-q'] = function (el) { Att.q = el.value.trim(); renderAttBody(); };
UI.chg['att-dept'] = function (el) { Att.dept = el.value; renderAttBody(); };
UI.chg['att-month'] = function (el) { Att.month = el.value || todayStr().slice(0, 7); renderAttBody(); };
UI.act['att-status'] = function (el) { Att.status = el.getAttribute('data-v'); renderAttBody(); };
UI.act['att-remind'] = function () { UI.toast('已提醒未打卡员工（示例）'); };
UI.act['att-emp'] = function (el) { openEmployee(el.getAttribute('data-eid'), 'attendance'); };
UI.act['att-edit'] = function (el, e) { if (e) e.stopPropagation(); openAttEdit(el.getAttribute('data-eid') || '', el.getAttribute('data-ds') || todayStr()); };
UI.act['att-leave-add'] = function () { openLeaveForm(); };
UI.act['att-leave-ok'] = function (el) {
  var lv = S.leaveRequests.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!lv) return;
  lv.status = 'approved'; lv.note = '已批准';
  for (var d = lv.start; d <= lv.end; d = addDays(d, 1)) {
    if (!S.attendanceDays[d]) S.attendanceDays[d] = {};
    S.attendanceDays[d][lv.eid] = { in: '', out: '', status: 'leave', leaveType: lv.type, note: '请假' };
  }
  save(); UI.toast('已批准请假'); UI.rerender(); UI.refreshSide();
};
UI.act['att-leave-no'] = function (el) {
  var lv = S.leaveRequests.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!lv) return;
  lv.status = 'rejected'; lv.note = '已驳回'; save(); UI.toast('已驳回'); UI.rerender(); UI.refreshSide();
};
UI.act['att-save-doc'] = function () {
  var ms = attMonthStats(Att.month), lines = ['考勤月报 · ' + Att.month, '公司：' + S.settings.company, '记录人次：' + ms.days, '正常：' + ms.normal, '迟到：' + ms.late, '早退：' + ms.early, '请假：' + ms.leave, '出差：' + ms.business, '外勤：' + ms.field, '缺勤：' + ms.absent, '未打卡：' + ms.missing, '出勤率：' + pct(ms.rate), '', '员工明细：'];
  activeEmployees().forEach(function (e) { var s = attMonthSummary(e.id, Att.month); lines.push(e.name + '（' + deptName(e.deptId) + '）：记录 ' + s.days + ' 天，正常 ' + s.normal + '，迟到 ' + s.late + '，早退 ' + s.early + '，请假 ' + s.leave + '，缺勤 ' + s.absent + '，出勤率 ' + pct(s.rate)); });
  saveGeneratedDoc('考勤月报-' + Att.month + '.txt', lines.join('\n'));
};
UI.act['att-export'] = function () {
  var rows = [['员工', '部门', '记录天数', '正常', '迟到', '早退', '请假', '出差', '外勤', '缺勤', '未打卡', '出勤率']];
  activeEmployees().forEach(function (e) {
    var s = attMonthSummary(e.id, Att.month);
    rows.push([e.name, deptName(e.deptId), s.days, s.normal, s.late, s.early, s.leave, s.business, s.field, s.absent, s.missing, s.rate === null ? '' : Math.round(s.rate * 100) + '%']);
  });
  downloadFile('考勤月报-' + Att.month + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};

function openAttEdit(eid, ds) {
  var e0 = eid ? empById(eid) : null;
  var date = ds || todayStr(), rec = (e0 && attRecord(e0.id, date)) || { in: '', out: '', status: 'normal', leaveType: '', note: '' };
  var pool = activeEmployees();
  UI.modal({
    title: '登记考勤' + (e0 ? ' · ' + e0.name : ''), wide: true,
    body: '<div class="row3"><div class="field"><label>员工</label><select class="sel" id="aeEmp">' + pool.map(function (e) { return '<option value="' + e.id + '"' + (e0 && e0.id === e.id ? ' selected' : '') + '>' + esc(e.name + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select></div><div class="field"><label>日期</label><input class="inp" type="date" id="aeDate" value="' + esc(date) + '"></div><div class="field"><label>状态</label><select class="sel" id="aeStatus">' + ATT_ORDER.map(function (s) { return '<option value="' + s + '"' + (rec.status === s ? ' selected' : '') + '>' + attLabel(s) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row3"><div class="field"><label>上班打卡</label><input class="inp" type="time" id="aeIn" value="' + esc(rec.in || '') + '"></div><div class="field"><label>下班打卡</label><input class="inp" type="time" id="aeOut" value="' + esc(rec.out || '') + '"></div><div class="field"><label>请假类型</label><select class="sel" id="aeLeaveType">' + (S.settings.attendance.leaveTypes || []).map(function (t) { return '<option value="' + t.id + '"' + (rec.leaveType === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field"><label>备注</label><input class="inp" id="aeNote" value="' + esc(rec.note || '') + '" placeholder="补卡原因、异常说明等"></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ae-save">保存</button>'
  });
  UI.modalCtx.att = { rec: rec };
}
UI.act['ae-save'] = function () {
  var eid = $('#aeEmp').value, ds = $('#aeDate').value || todayStr(), st = $('#aeStatus').value;
  var rec = { in: $('#aeIn').value, out: $('#aeOut').value, status: st, leaveType: $('#aeLeaveType').value, note: $('#aeNote').value.trim() };
  if (!S.attendanceDays[ds]) S.attendanceDays[ds] = {};
  S.attendanceDays[ds][eid] = rec;
  if (ds === todayStr()) {
    if (!S.status[ds]) S.status[ds] = {};
    if (st === 'normal') delete S.status[ds][eid]; else S.status[ds][eid] = st;
  }
  save(); UI.closeModal(); UI.toast('考勤已保存'); UI.rerender(); UI.refreshSide();
  if (UI.drawerSid === eid) openEmployee(eid, 'attendance');
};
function openLeaveForm() {
  var pool = activeEmployees();
  UI.modal({
    title: '登记请假', wide: true,
    body: '<div class="row2"><div class="field"><label>员工</label><select class="sel" id="alEmp">' + pool.map(function (e) { return '<option value="' + e.id + '">' + esc(e.name + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select></div><div class="field"><label>请假类型</label><select class="sel" id="alType">' + (S.settings.attendance.leaveTypes || []).map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row2"><div class="field"><label>开始日期</label><input class="inp" type="date" id="alStart" value="' + todayStr() + '"></div><div class="field"><label>结束日期</label><input class="inp" type="date" id="alEnd" value="' + todayStr() + '"></div></div>' +
      '<div class="field"><label>原因</label><textarea class="ta" id="alReason" placeholder="请假原因"></textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="al-save">提交</button>'
  });
}
UI.act['al-save'] = function () {
  var eid = $('#alEmp').value, start = $('#alStart').value, end = $('#alEnd').value || start;
  var days = leaveDays(start, end);
  if (!days) { UI.toast('请选择正确的日期范围'); return; }
  S.leaveRequests.push({ id: uid('lv'), eid: eid, type: $('#alType').value, start: start, end: end, days: days, reason: $('#alReason').value.trim(), status: 'pending', appliedAt: todayStr(), note: '' });
  save(); UI.closeModal(); UI.toast('请假申请已提交'); UI.rerender(); UI.refreshSide();
};

/* ---------- 员工档案里的考勤页签 ---------- */
function attendanceEmpHTML(e) {
  var month = todayStr().slice(0, 7), s = attMonthSummary(e.id, month), recs = attMonthRecords(e.id, month).slice(-16).reverse();
  var h = '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">本月出勤率</div><div class="v">' + pct(s.rate) + '</div><div class="d">记录 ' + s.days + ' 天</div></div>' +
    '<div class="kpi"><div class="k">迟到 / 早退</div><div class="v">' + s.late + '<small>/ ' + s.early + '</small></div><div class="d">本月</div></div>' +
    '<div class="kpi"><div class="k">请假</div><div class="v">' + s.leave + '<small>天</small></div><div class="d">出差 ' + s.business + ' · 外勤 ' + s.field + '</div></div>' +
    '<div class="kpi"><div class="k">缺勤 / 未打卡</div><div class="v">' + s.absent + '<small>/ ' + s.missing + '</small></div><div class="d">本月</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>最近考勤</h3><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>日期</th><th>上班</th><th>下班</th><th>状态</th><th>备注</th></tr></thead><tbody>' + (recs.length ? recs.map(function (x) { return '<tr><td class="num">' + esc(x.ds) + '</td><td class="num">' + (x.rec.in || '—') + '</td><td class="num">' + (x.rec.out || '—') + '</td><td><span class="tag ' + attTone(x.rec.status) + '">' + attLabel(x.rec.status) + '</span></td><td class="sub">' + esc(x.rec.note || (x.rec.leaveType ? leaveTypeName(x.rec.leaveType) : '')) + '</td></tr>'; }).join('') : '<tr><td colspan="5"><div class="empty">本月还没有考勤记录</div></td></tr>') + '</tbody></table></div></div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-light btn-sm" data-act="att-emp-open" data-eid="' + e.id + '">' + ICON.clock + '查看完整考勤</button><button class="btn btn-light btn-sm" data-act="att-edit" data-eid="' + e.id + '">登记考勤</button></div>';
  return h;
}
UI.act['att-emp-open'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.closeDrawer(); Att.q = e.name; Att.month = todayStr().slice(0, 7); Att.tab = 'month'; UI.go('attendance');
};
