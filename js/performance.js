/* =========================================================
   绩效管理 · 周期、目标、自评、主管评价、校准
   ========================================================= */
var Perf = { cycleId: null, tab: 'overview', dept: 'all', status: 'all', q: '' };
function perfCur() { return (Perf.cycleId && perfCycleById(Perf.cycleId)) || perfCurrentCycle(); }
function perfStatusText(rec) {
  var s = perfRecordStatus(rec);
  return { pending: '待自评', self: '待主管评价', manager: '待校准', done: '已完成' }[s] || '—';
}
function perfStatusTone(rec) {
  var s = perfRecordStatus(rec);
  return s === 'done' ? 'green' : s === 'manager' ? 'violet' : s === 'self' ? 'blue' : 'amber';
}
function perfRows(cycle) {
  var list = S.performanceRecords.filter(function (r) { return r.cycleId === cycle.id; });
  if (Perf.dept !== 'all') list = list.filter(function (r) { var e = empById(r.eid); return e && e.deptId === Perf.dept; });
  if (Perf.status !== 'all') list = list.filter(function (r) { return perfRecordStatus(r) === Perf.status; });
  if (Perf.q) { var q = Perf.q.toLowerCase(); list = list.filter(function (r) { var e = empById(r.eid); return e && (e.name + ' ' + e.no + ' ' + e.title).toLowerCase().indexOf(q) >= 0; }); }
  return list.sort(function (a, b) {
    var ea = empById(a.eid), eb = empById(b.eid);
    return (ea ? deptName(ea.deptId) : '').localeCompare(eb ? deptName(eb.deptId) : '', 'zh') || (ea ? ea.name : '').localeCompare(eb ? eb.name : '', 'zh');
  });
}
UI.register('performance', {
  render: function (main, opts) {
    if (opts && opts.cycle) Perf.cycleId = opts.cycle;
    var cycle = perfCur();
    if (!cycle) {
      main.innerHTML = '<div class="page"><div class="page-head"><div><h1 class="page-title">绩效管理</h1><div class="page-desc">还没有绩效周期</div></div></div><div class="panel"><div class="empty">先发起一个绩效周期</div><button class="btn btn-dark btn-sm" data-act="perf-new">发起周期</button></div></div>';
      return;
    }
    Perf.cycleId = cycle.id;
    var st = perfStats(cycle), pending = perfPendingCounts(cycle);
    var h = '<div class="page scroll performance-page"><div class="page-head"><div><h1 class="page-title">绩效管理</h1><div class="page-desc">' + esc(cycle.name) + ' · ' + esc(cycle.start) + ' → ' + esc(cycle.end) + ' · 权重 目标 ' + cycle.weights.goal + '% / 能力 ' + cycle.weights.competency + '% / 价值观 ' + cycle.weights.values + '%</div></div><div class="grow"></div><div class="actions">' +
      '<select class="sel" style="width:150px;height:34px" data-chg="perf-cycle">' + perfCycles().map(function (c) { return '<option value="' + c.id + '"' + (c.id === cycle.id ? ' selected' : '') + '>' + esc(c.name) + (c.status === 'done' ? ' · 已完成' : '') + '</option>'; }).join('') + '</select>' +
      '<button class="btn btn-light" data-act="perf-export">' + ICON.down + '导出</button>' +
      '<button class="btn btn-light" data-act="perf-save-doc">' + ICON.doc + '存为评估表</button>' +
      '<button class="btn btn-light" data-act="go" data-page="settings" data-sec="performance">' + ICON.gear + '绩效规则</button>' +
      '<button class="btn btn-dark" data-act="perf-new">' + ICON.plus + '发起周期</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">参评人数</div><div class="v">' + st.total + '<small>人</small></div><div class="d">目标已设 ' + st.goalSet + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">自评完成</div><div class="v">' + st.selfDone + '<small>/ ' + st.total + '</small></div><div class="d">待自评 ' + pending.self + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">主管评价</div><div class="v">' + st.managerDone + '<small>/ ' + st.total + '</small></div><div class="d">待评价 ' + pending.manager + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">平均分</div><div class="v">' + (st.avg === null ? '—' : st.avg) + '</div><div class="d">已完成 ' + st.done + ' 人 · 待校准 ' + pending.calibration + ' 人</div></div></div>';
    h += '<div class="tabs"><button class="' + (Perf.tab === 'overview' ? 'on' : '') + '" data-act="perf-tab" data-v="overview">概览</button><button class="' + (Perf.tab === 'table' ? 'on' : '') + '" data-act="perf-tab" data-v="table">目标与评价</button><button class="' + (Perf.tab === 'calibration' ? 'on' : '') + '" data-act="perf-tab" data-v="calibration">校准</button></div><div id="perfBody"></div></div>';
    main.innerHTML = h;
    renderPerfBody();
  }
});
function renderPerfBody() {
  var el = $('#perfBody'), cycle = perfCur(); if (!el || !cycle) return;
  if (Perf.tab === 'overview') el.innerHTML = perfOverviewHTML(cycle);
  else if (Perf.tab === 'table') el.innerHTML = perfTableHTML(cycle);
  else el.innerHTML = perfCalibrationHTML(cycle);
}
function perfOverviewHTML(cycle) {
  var st = perfStats(cycle), pend = perfPendingCounts(cycle), total = st.total || 1;
  var h = '<div class="perf-overview-grid"><div class="panel"><div class="panel-title">流程进度</div><div class="panel-sub">目标设定 → 自评 → 主管评价 → 校准</div>' +
    [['目标设定', st.goalSet, 'blue'], ['自评', st.selfDone, 'violet'], ['主管评价', st.managerDone, 'amber'], ['已完成', st.done, 'green']].map(function (x) {
      var p = Math.round(x[1] / total * 100);
      return '<div class="perf-progress"><div class="perf-progress-top"><span>' + x[0] + '</span><b>' + x[1] + ' / ' + st.total + '</b></div><div class="perf-bar"><i style="width:' + p + '%;background:' + ({ blue: '#2f7ff0', violet: '#7a5af5', amber: '#f2a71b', green: '#1d9a57' })[x[2]] + '"></i></div></div>';
    }).join('') + '<div class="muted" style="font-size:12px;margin-top:8px">当前阶段：' + (cycle.status === 'done' ? '已完成' : pend.self ? '自评阶段' : pend.manager ? '主管评价阶段' : '校准阶段') + '</div></div>';
  h += '<div class="panel"><div class="panel-title">等级分布</div><div class="panel-sub">目标比例 vs 当前实际</div><div class="perf-dist">' + ['S', 'A', 'B', 'C', 'D'].map(function (g) {
    var actual = st.dist[g] || 0, pctActual = st.managerDone ? Math.round(actual / Math.max(1, st.managerDone) * 100) : 0, target = cycle.distribution[g] || 0;
    return '<div class="perf-dist-row"><span class="grade-pill g-' + g + '">' + g + '</span><div class="perf-dist-bar"><i style="width:' + pctActual + '%;background:' + ({ S: '#1d9a57', A: '#2f7ff0', B: '#7a5af5', C: '#f2a71b', D: '#e5483b' })[g] + '"></i></div><span class="num">' + actual + ' 人</span><span class="muted">目标 ' + target + '%</span></div>';
  }).join('') + '</div></div></div>';
  var dept = st.dept;
  h += '<div class="panel" style="margin-top:14px"><div class="panel-title">部门完成情况</div><div class="panel-sub">主管评价完成 / 参评人数</div><div class="an-list">' + Object.keys(dept).map(function (d) {
    var x = dept[d], p = x.n ? Math.round(x.done / x.n * 100) : 0;
    return '<div class="an-list-row"><span>' + esc(d) + '</span><span class="ab"><i style="width:' + p + '%;background:#7a5af5"></i></span><span class="av">' + x.done + '/' + x.n + '</span></div>';
  }).join('') + '</div></div>';
  h += '<div class="panel" style="margin-top:14px"><div class="panel-title">周期信息</div><div class="info-grid" style="grid-template-columns:96px 1fr"><div class="k">周期</div><div>' + esc(cycle.name) + ' · ' + esc(cycle.type) + '</div><div class="k">起止</div><div>' + esc(cycle.start) + ' → ' + esc(cycle.end) + '</div><div class="k">状态</div><div>' + (cycle.status === 'done' ? '<span class="tag green">已完成</span>' : '<span class="tag blue">进行中</span>') + '</div><div class="k">评分权重</div><div>目标 ' + cycle.weights.goal + '% · 能力 ' + cycle.weights.competency + '% · 价值观 ' + cycle.weights.values + '%</div></div></div>';
  return h;
}
function perfTableHTML(cycle) {
  var list = perfRows(cycle), pending = perfPendingCounts(cycle);
  var h = '<div class="filterbar"><input class="inp" placeholder="搜索姓名、工号、职位" value="' + esc(Perf.q) + '" data-inp="perf-q" style="width:240px"><select class="sel" style="width:150px;height:34px" data-chg="perf-dept"><option value="all">全部部门</option>' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (Perf.dept === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select>' +
    '<div class="chips"><button class="' + (Perf.status === 'all' ? 'on' : '') + '" data-act="perf-status" data-v="all">全部</button><button class="' + (Perf.status === 'pending' ? 'on' : '') + '" data-act="perf-status" data-v="pending">待自评 ' + pending.self + '</button><button class="' + (Perf.status === 'self' ? 'on' : '') + '" data-act="perf-status" data-v="self">待主管评价 ' + pending.manager + '</button><button class="' + (Perf.status === 'manager' ? 'on' : '') + '" data-act="perf-status" data-v="manager">待校准 ' + pending.calibration + '</button><button class="' + (Perf.status === 'done' ? 'on' : '') + '" data-act="perf-status" data-v="done">已完成</button></div></div>';
  h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>员工</th><th>部门</th><th class="c">目标</th><th class="c">自评</th><th class="c">主管评价</th><th class="r">总分</th><th class="c">等级</th><th>状态</th><th class="r">操作</th></tr></thead><tbody>';
  if (!list.length) h += '<tr><td colspan="9"><div class="empty">没有符合条件的员工</div></td></tr>';
  list.forEach(function (rec) {
    var e = empById(rec.eid); if (!e) return;
    var score = rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle), grade = perfRecordGrade(rec, cycle);
    h += '<tr class="click" data-act="perf-open" data-eid="' + e.id + '"><td><div class="nm">' + empAva(e, 28) + esc(e.name) + '</div></td><td class="sub">' + esc(deptName(e.deptId)) + '</td>' +
      '<td class="c num">' + (rec.goals || []).length + '</td><td class="c">' + (rec.self ? '<span class="tag green">已提交</span>' : '<span class="tag amber">待提交</span>') + '</td>' +
      '<td class="c">' + (rec.manager ? '<span class="tag green">已评价</span>' : '<span class="tag amber">待评价</span>') + '</td>' +
      '<td class="r num">' + (score === null ? '—' : score) + '</td><td class="c">' + (grade ? '<span class="tag ' + perfGradeTone(grade) + '">' + grade + '</span>' : '<span class="muted">—</span>') + '</td>' +
      '<td><span class="tag ' + perfStatusTone(rec) + '">' + perfStatusText(rec) + '</span></td>' +
      '<td class="r"><span class="ops">' + (rec.self && !rec.manager ? '<button class="btn btn-xs btn-dark" data-act="perf-review" data-eid="' + e.id + '">填写评价</button>' : rec.manager && (!rec.final || rec.final.score === undefined) ? '<button class="btn btn-xs btn-light" data-act="perf-open" data-eid="' + e.id + '">去校准</button>' : '<button class="btn btn-xs btn-ghost" data-act="perf-open" data-eid="' + e.id + '">查看</button>') + '</span></td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}
function perfCalibrationHTML(cycle) {
  var list = perfRows(cycle).filter(function (r) { return r.manager; });
  var h = '<div class="panel" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:10px"><div class="panel-title">等级校准</div><span class="muted" style="font-size:12px">主管评分后，在这里做最终等级校准</span><span class="grow"></span><button class="btn btn-dark btn-sm" data-act="perf-finish">完成校准</button></div><div class="panel-sub">调整后的等级会作为最终绩效结果</div></div>';
  h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>员工</th><th>部门</th><th class="r">目标得分</th><th class="r">能力</th><th class="r">价值观</th><th class="r">总分</th><th class="c">主管等级</th><th class="c">校准等级</th><th>说明</th></tr></thead><tbody>';
  if (!list.length) h += '<tr><td colspan="9"><div class="empty">还没有主管完成评价</div></td></tr>';
  list.forEach(function (rec) {
    var e = empById(rec.eid); if (!e) return;
    var score = perfRecordScore(rec, cycle), grade = perfGradeOf(score, cycle), finalG = rec.final && rec.final.grade ? rec.final.grade : grade;
    h += '<tr><td><div class="nm">' + empAva(e, 26) + esc(e.name) + '</div></td><td class="sub">' + esc(deptName(e.deptId)) + '</td>' +
      '<td class="r num">' + (rec.manager.goalScore || '—') + '</td><td class="r num">' + (rec.manager.competencyScore || '—') + '</td><td class="r num">' + (rec.manager.valuesScore || '—') + '</td><td class="r num"><b>' + (score === null ? '—' : score) + '</b></td>' +
      '<td class="c">' + (grade ? '<span class="tag ' + perfGradeTone(grade) + '">' + grade + '</span>' : '—') + '</td>' +
      '<td class="c"><select class="sel perf-grade-sel" data-chg="perf-grade" data-eid="' + e.id + '">' + ['S', 'A', 'B', 'C', 'D'].map(function (g) { return '<option value="' + g + '"' + (finalG === g ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></td>' +
      '<td><input class="inp perf-note" style="height:30px;font-size:12px" data-chg="perf-note" data-eid="' + e.id + '" value="' + esc(rec.final && rec.final.note || '') + '" placeholder="校准说明"></td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}
UI.act['perf-tab'] = function (el) { Perf.tab = el.getAttribute('data-v'); UI.rerender(); };
UI.chg['perf-cycle'] = function (el) { Perf.cycleId = el.value; Perf.tab = 'overview'; UI.rerender(); };
UI.inp['perf-q'] = function (el) { Perf.q = el.value.trim(); renderPerfBody(); };
UI.chg['perf-dept'] = function (el) { Perf.dept = el.value; renderPerfBody(); };
UI.act['perf-status'] = function (el) { Perf.status = el.getAttribute('data-v'); renderPerfBody(); };
UI.act['perf-open'] = function (el) { openPerfDrawer(el.getAttribute('data-eid')); };
UI.act['perf-review'] = function (el) { openPerfReview(el.getAttribute('data-eid')); };
UI.chg['perf-grade'] = function (el) {
  var cycle = perfCur(), rec = perfRecord(cycle.id, el.getAttribute('data-eid')); if (!rec) return;
  if (!rec.final) rec.final = { score: perfRecordScore(rec, cycle), grade: el.value, calibrated: true, note: '' };
  rec.final.grade = el.value; rec.final.calibrated = true; save(); UI.toast('已调整等级'); UI.rerender();
};
UI.chg['perf-note'] = function (el) {
  var cycle = perfCur(), rec = perfRecord(cycle.id, el.getAttribute('data-eid')); if (!rec) return;
  if (!rec.final) rec.final = { score: perfRecordScore(rec, cycle), grade: perfRecordGrade(rec, cycle), calibrated: true, note: '' };
  rec.final.note = el.value; save();
};
UI.act['perf-finish'] = function () {
  var cycle = perfCur(); if (!cycle) return;
  UI.confirm('完成校准', '确认完成 ' + cycle.name + ' 的绩效校准？完成后会归档为最终结果。', '完成校准', function () {
    cycle.status = 'done';
    S.performanceRecords.filter(function (r) { return r.cycleId === cycle.id; }).forEach(function (rec) {
      var score = perfRecordScore(rec, cycle);
      if (score === null) return;
      if (!rec.final) rec.final = { score: score, grade: perfGradeOf(score, cycle), calibrated: true, note: '' };
      if (!rec.final.grade) rec.final.grade = perfGradeOf(score, cycle);
      rec.final.calibrated = true;
      rec.status = 'done';
    });
    save(); UI.rerender(); UI.refreshSide(); UI.toast('绩效周期已完成');
  });
};
UI.act['perf-save-doc'] = function () {
  var cycle = perfCur(); if (!cycle) return;
  var st = perfStats(cycle), lines = ['绩效评估表 · ' + cycle.name, '公司：' + S.settings.company, '周期：' + cycle.start + ' → ' + cycle.end, '参评：' + st.total + ' 人', '自评完成：' + st.selfDone + ' 人', '主管评价完成：' + st.managerDone + ' 人', '平均分：' + (st.avg === null ? '—' : st.avg), '', '员工明细：'];
  perfRows(cycle).forEach(function (rec) { var e = empById(rec.eid); if (!e) return; var score = rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle); lines.push(e.name + '（' + deptName(e.deptId) + '）：' + (score === null ? '—' : score) + ' 分 · ' + (perfRecordGrade(rec, cycle) || '—') + ' · ' + perfStatusText(rec)); });
  saveGeneratedDoc('绩效评估表-' + cycle.name + '.txt', lines.join('\n'));
};
UI.act['perf-export'] = function () {
  var cycle = perfCur(); if (!cycle) return;
  var rows = [['员工', '部门', '目标数', '自评', '主管评价', '总分', '等级', '状态']];
  perfRows(cycle).forEach(function (rec) {
    var e = empById(rec.eid); if (!e) return;
    var score = rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle), grade = perfRecordGrade(rec, cycle);
    rows.push([e.name, deptName(e.deptId), (rec.goals || []).length, rec.self ? '已提交' : '待提交', rec.manager ? '已评价' : '待评价', score === null ? '' : score, grade || '', perfStatusText(rec)]);
  });
  downloadFile('绩效-' + cycle.name + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['perf-new'] = function () {
  UI.modal({
    title: '发起绩效周期', wide: true,
    body: '<div class="row2"><div class="field"><label>周期名称</label><input class="inp" id="pnName" value="' + new Date().getFullYear() + ' Q1" autofocus></div><div class="field"><label>类型</label><select class="sel" id="pnType"><option>季度</option><option>半年度</option><option>年度</option></select></div></div>' +
      '<div class="row2"><div class="field"><label>开始日期</label><input class="inp" type="date" id="pnStart" value="' + todayStr() + '"></div><div class="field"><label>结束日期</label><input class="inp" type="date" id="pnEnd" value="' + addDays(todayStr(), 90) + '"></div></div>' +
      '<div class="muted" style="font-size:12.5px;line-height:1.7">会为所有在职员工创建待自评记录；目标可以在员工详情里补充。</div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="pn-save">创建周期</button>'
  });
};
UI.act['pn-save'] = function () {
  var name = $('#pnName').value.trim(); if (!name) { UI.toast('请填写周期名称'); return; }
  var cycle = { id: uid('perf'), name: name, type: $('#pnType').value, start: $('#pnStart').value || todayStr(), end: $('#pnEnd').value || addDays(todayStr(), 90), status: 'review', weights: Object.assign({}, S.settings.performance.weights), gradeLines: Object.assign({}, S.settings.performance.gradeLines), distribution: Object.assign({}, S.settings.performance.distribution) };
  S.performanceCycles.push(cycle);
  activeEmployees().forEach(function (e) { S.performanceRecords.push({ id: uid('pr'), cycleId: cycle.id, eid: e.id, goals: [], self: null, manager: null, final: null, status: 'pending' }); });
  Perf.cycleId = cycle.id; save(); UI.closeModal(); UI.rerender(); UI.refreshSide(); UI.toast('绩效周期已创建');
};

function openPerfDrawer(eid) {
  var e = empById(eid); if (!e) return;
  var cycle = perfCur(); if (!cycle) return;
  var rec = perfRecord(cycle.id, eid);
  var score = rec ? (rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle)) : null;
  var grade = rec ? perfRecordGrade(rec, cycle) : null;
  var history = perfHistory(eid);
  var h = '<div class="dr-hero">' + empAva(e, 72) + '<div><div class="dr-name">' + esc(e.name) + (grade ? '<span class="tag ' + perfGradeTone(grade) + '">' + grade + '</span>' : '') + '</div><div class="dr-meta">' + esc(e.no + ' · ' + deptName(e.deptId) + ' · ' + e.title + ' · ' + cycle.name) + '</div><div class="tags" style="margin-top:8px"><span class="tag ' + (rec ? perfStatusTone(rec) : 'gray') + '">' + (rec ? perfStatusText(rec) : '无记录') + '</span><span class="tag gray">目标 ' + (rec ? (rec.goals || []).length : 0) + ' 项</span></div></div>' +
    '<div class="dr-tools"><button class="btn btn-sm btn-light" data-act="perf-review" data-eid="' + e.id + '">' + ICON.edit + '填写评价</button><button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="tabs"><button class="on">' + esc(cycle.name) + ' · 绩效</button></div><div class="drawer-body">';
  h += '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(3,1fr)"><div class="kpi"><div class="k">总分</div><div class="v">' + (score === null ? '—' : score) + '</div><div class="d">' + (rec && rec.final ? '最终结果' : '当前评分') + '</div></div><div class="kpi"><div class="k">等级</div><div class="v">' + (grade || '—') + '</div><div class="d">' + (cycle.status === 'done' ? '已归档' : '待校准') + '</div></div><div class="kpi"><div class="k">目标得分</div><div class="v">' + (rec && rec.manager ? (rec.manager.goalScore || '—') : '—') + '</div><div class="d">权重 ' + cycle.weights.goal + '%</div></div></div>';
  if (rec && rec.goals && rec.goals.length) {
    h += '<div class="emp-panel" style="margin:0 0 14px"><h3>目标与结果</h3><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>目标</th><th class="c">权重</th><th>结果</th><th class="r">得分</th></tr></thead><tbody>' + rec.goals.map(function (g) { return '<tr><td><b>' + esc(g.title) + '</b><div class="muted" style="font-size:11.5px">' + esc(g.target || '') + '</div></td><td class="c num">' + g.weight + '%</td><td class="sub">' + esc(g.result || '—') + '</td><td class="r num"><b>' + (g.score === undefined || g.score === null ? '—' : g.score) + '</b></td></tr>'; }).join('') + '</tbody></table></div></div>';
  } else h += '<div class="emp-panel" style="margin:0 0 14px"><h3>目标与结果</h3><div class="empty">还没有设置目标</div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>自评</h3><div class="emp-note">' + (rec && rec.self ? esc(rec.self.summary) : '<span class="muted">还没有提交自评</span>') + '</div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>主管评价</h3>' + (rec && rec.manager ? '<div class="info-grid" style="grid-template-columns:96px 1fr"><div class="k">目标得分</div><div>' + (rec.manager.goalScore || '—') + '</div><div class="k">能力</div><div>' + (rec.manager.competencyScore || '—') + '</div><div class="k">价值观</div><div>' + (rec.manager.valuesScore || '—') + '</div><div class="k">评语</div><div>' + esc(rec.manager.summary || '—') + '</div></div>' : '<div class="empty">还没有主管评价</div>') + '</div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>历史绩效</h3><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>周期</th><th class="r">总分</th><th class="c">等级</th><th>状态</th></tr></thead><tbody>' + history.map(function (x) { return '<tr><td>' + esc(x.cycle ? x.cycle.name : '—') + '</td><td class="r num">' + (x.score === null ? '—' : x.score) + '</td><td class="c">' + (x.grade ? '<span class="tag ' + perfGradeTone(x.grade) + '">' + x.grade + '</span>' : '—') + '</td><td><span class="tag gray">' + ({ pending: '待自评', self: '待主管评价', manager: '待校准', done: '已完成' })[x.status] + '</span></td></tr>'; }).join('') + '</tbody></table></div></div>';
  h += '</div>';
  UI.drawer(h, true);
}
function openPerfReview(eid) {
  var cycle = perfCur(); if (!cycle) return;
  var rec = perfRecord(cycle.id, eid); if (!rec) { UI.toast('这个周期还没有该员工的绩效记录'); return; }
  var e = empById(eid);
  var m = rec.manager || { goalScore: perfGoalsScore(rec) || 80, competencyScore: 80, valuesScore: 80, summary: '' };
  UI.modal({
    title: '填写主管评价 · ' + e.name, wide: true,
    body: '<div class="row3"><div class="field"><label>目标得分</label><input class="inp num" id="prGoal" type="number" min="0" max="100" value="' + (m.goalScore || 80) + '"></div><div class="field"><label>能力得分</label><input class="inp num" id="prComp" type="number" min="0" max="100" value="' + (m.competencyScore || 80) + '"></div><div class="field"><label>价值观得分</label><input class="inp num" id="prVal" type="number" min="0" max="100" value="' + (m.valuesScore || 80) + '"></div></div>' +
      '<div class="field"><label>评价总结</label><textarea class="ta" id="prSummary" style="min-height:110px">' + esc(m.summary || '') + '</textarea></div>' +
      '<div class="muted" style="font-size:12px;line-height:1.7">目标得分可以由目标明细自动计算；这里填写的是主管最终确认的分数。</div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="pr-save" data-eid="' + eid + '">保存评价</button>'
  });
}
UI.act['pr-save'] = function (el) {
  var eid = el.getAttribute('data-eid'), cycle = perfCur(), rec = perfRecord(cycle.id, eid); if (!rec) return;
  rec.manager = { goalScore: clamp(+$('#prGoal').value || 0, 0, 100), competencyScore: clamp(+$('#prComp').value || 0, 0, 100), valuesScore: clamp(+$('#prVal').value || 0, 0, 100), summary: $('#prSummary').value.trim(), submittedAt: todayStr(), reviewer: S.settings.hr.name };
  rec.status = 'manager'; save(); UI.closeModal(); UI.toast('主管评价已保存'); UI.rerender(); UI.refreshSide();
  if (UI.drawerSid === eid) openPerfDrawer(eid);
};
function performanceEmpHTML(e) {
  var cycle = perfCurrentCycle(), rec = cycle ? perfRecord(cycle.id, e.id) : null;
  var score = rec ? (rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle)) : null, grade = rec ? perfRecordGrade(rec, cycle) : null;
  var history = perfHistory(e.id);
  var h = '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(3,1fr)"><div class="kpi"><div class="k">当前周期</div><div class="v" style="font-size:17px">' + esc(cycle ? cycle.name : '—') + '</div><div class="d">' + (rec ? perfStatusText(rec) : '无记录') + '</div></div><div class="kpi"><div class="k">总分</div><div class="v">' + (score === null ? '—' : score) + '</div><div class="d">' + (rec && rec.final ? '最终结果' : '当前评分') + '</div></div><div class="kpi"><div class="k">等级</div><div class="v">' + (grade || '—') + '</div><div class="d">' + (cycle && cycle.status === 'done' ? '已归档' : '待校准') + '</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>历史绩效</h3><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>周期</th><th class="r">总分</th><th class="c">等级</th><th>状态</th></tr></thead><tbody>' + history.map(function (x) { return '<tr><td>' + esc(x.cycle ? x.cycle.name : '—') + '</td><td class="r num">' + (x.score === null ? '—' : x.score) + '</td><td class="c">' + (x.grade ? '<span class="tag ' + perfGradeTone(x.grade) + '">' + x.grade + '</span>' : '—') + '</td><td><span class="tag gray">' + ({ pending: '待自评', self: '待主管评价', manager: '待校准', done: '已完成' })[x.status] + '</span></td></tr>'; }).join('') + '</tbody></table></div></div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-light btn-sm" data-act="perf-emp-open" data-eid="' + e.id + '">' + ICON.target + '进入绩效管理</button></div>';
  return h;
}
UI.act['perf-emp-open'] = function (el) { var e = empById(el.getAttribute('data-eid')); if (!e) return; UI.closeDrawer(); Perf.q = e.name; Perf.tab = 'table'; UI.go('performance'); };
