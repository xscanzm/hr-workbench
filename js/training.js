/* =========================================================
   培训管理 · 培训计划、报名、签到、完成与反馈
   ========================================================= */
var Train = { tab: 'plan', type: 'all', q: '' };
function trainStatusText(t) { return t.status === 'done' ? '已结束' : t.status === 'cancelled' ? '已取消' : t.start === todayStr() ? '进行中' : '报名中'; }
function trainStatusTone(t) { return t.status === 'done' ? 'gray' : t.status === 'cancelled' ? 'red' : t.start === todayStr() ? 'green' : 'blue'; }
function trainFiltered() {
  var q = Train.q.trim();
  return S.trainings.filter(function (t) {
    if (Train.type !== 'all' && t.type !== Train.type) return false;
    if (q && (t.title + ' ' + t.trainer + ' ' + t.type).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    return true;
  }).sort(function (a, b) { return (a.start + (a.startTime || '')) < (b.start + (b.startTime || '')) ? 1 : -1; });
}
UI.register('training', {
  render: function (main) {
    var st = trainingStats();
    var h = '<div class="page scroll training-page"><div class="page-head"><div><h1 class="page-title">培训管理</h1><div class="page-desc">本月 <b>' + st.month + '</b> 场 · 待开始 <b>' + st.upcoming + '</b> 场 · 参与 <b>' + st.participants + '</b> 人次 · 平均评分 <b>' + (st.avg === null ? '—' : st.avg) + '</b></div></div><div class="grow"></div><div class="actions"><button class="btn btn-light" data-act="train-export">' + ICON.down + '导出培训</button><button class="btn btn-dark" data-act="train-add">' + ICON.plus + '新建培训</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">本月培训</div><div class="v">' + st.month + '<small>场</small></div><div class="d">全部 ' + S.trainings.length + ' 场</div></div>' +
      '<div class="stat-card"><div class="k">待开始</div><div class="v">' + st.upcoming + '<small>场</small></div><div class="d">含报名中</div></div>' +
      '<div class="stat-card"><div class="k">参与人次</div><div class="v">' + st.participants + '</div><div class="d">累计报名</div></div>' +
      '<div class="stat-card"><div class="k">完成率</div><div class="v">' + pct(st.rate) + '</div><div class="d">已完成 ' + st.completed + ' 人次 · 平均 ' + (st.avg === null ? '—' : st.avg) + ' 分</div></div></div>';
    h += '<div class="tabs"><button class="' + (Train.tab === 'plan' ? 'on' : '') + '" data-act="train-tab" data-v="plan">培训计划</button><button class="' + (Train.tab === 'record' ? 'on' : '') + '" data-act="train-tab" data-v="record">培训记录</button></div><div id="trainBody"></div></div>';
    main.innerHTML = h;
    renderTrainBody();
  }
});
function renderTrainBody() {
  var el = $('#trainBody'); if (!el) return;
  if (Train.tab === 'plan') el.innerHTML = trainPlanHTML();
  else el.innerHTML = trainRecordHTML();
}
function trainFilterHTML() {
  return '<div class="filterbar"><input class="inp" placeholder="搜索培训、讲师、类型" value="' + esc(Train.q) + '" data-inp="train-q" style="width:240px"><div class="chips"><button class="' + (Train.type === 'all' ? 'on' : '') + '" data-act="train-type" data-v="all">全部</button>' + (S.settings.training.types || []).map(function (t) { return '<button class="' + (Train.type === t ? 'on' : '') + '" data-act="train-type" data-v="' + t + '">' + esc(t) + '</button>'; }).join('') + '</div></div>';
}
function trainPlanHTML() {
  var list = trainFiltered();
  var h = trainFilterHTML() + '<div class="train-grid">';
  if (!list.length) h += '<div class="empty">没有符合条件的培训</div>';
  list.forEach(function (t) {
    var d = parseDate(t.start), enrolled = trainingEnrollCount(t);
    h += '<div class="train-card" data-act="train-open" data-id="' + t.id + '"><div class="train-cover" style="background:linear-gradient(135deg,' + trainingTypeColor(t.type) + '22,' + trainingTypeColor(t.type) + '08)"><span style="color:' + trainingTypeColor(t.type) + '">' + esc(t.type) + '</span><b>' + (d ? d.getDate() : '') + '</b><small>' + (d ? (d.getMonth() + 1) + ' 月' : '') + '</small></div><div class="train-main"><div class="train-title">' + esc(t.title) + '<span class="tag ' + trainStatusTone(t) + '">' + trainStatusText(t) + '</span></div><div class="train-meta">' + esc((t.startTime || '') + '–' + (t.endTime || '') + ' · ' + (t.mode || '') + ' · ' + (t.location || '')) + '</div><div class="train-meta">讲师 ' + esc(t.trainer || '—') + ' · ' + (t.duration || 0) + ' 小时</div><div class="train-progress"><span class="bar"><i style="width:' + Math.min(100, Math.round(enrolled / Math.max(1, t.capacity) * 100)) + '%;background:' + trainingTypeColor(t.type) + '"></i></span><span>' + enrolled + ' / ' + t.capacity + ' 人</span></div></div></div>';
  });
  h += '</div>';
  return h;
}
function trainRecordHTML() {
  var list = trainFiltered().filter(function (t) { return t.status === 'done'; });
  var h = trainFilterHTML() + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>培训</th><th>类型</th><th>日期</th><th>讲师</th><th class="r">参与</th><th class="r">完成</th><th class="r">平均分</th><th class="r"></th></tr></thead><tbody>';
  if (!list.length) h += '<tr><td colspan="8"><div class="empty">还没有已完成的培训</div></td></tr>';
  list.forEach(function (t) {
    var en = t.enrollments || [], done = en.filter(function (x) { return x.status === 'completed'; }), scores = en.filter(function (x) { return typeof x.score === 'number'; }).map(function (x) { return x.score; });
    h += '<tr class="click" data-act="train-open" data-id="' + t.id + '"><td><b>' + esc(t.title) + '</b></td><td><span class="tag" style="background:' + trainingTypeColor(t.type) + '1a;color:' + trainingTypeColor(t.type) + '">' + esc(t.type) + '</span></td><td class="num">' + esc(t.start) + '</td><td>' + esc(t.trainer || '—') + '</td><td class="r num">' + en.length + '</td><td class="r num">' + done.length + '</td><td class="r num">' + (scores.length ? round1(avg(scores)) : '—') + '</td><td class="r"><span class="ops"><button class="btn btn-xs btn-ghost" data-act="train-open" data-id="' + t.id + '">详情</button></span></td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}
UI.act['train-tab'] = function (el) { Train.tab = el.getAttribute('data-v'); UI.rerender(); };
UI.inp['train-q'] = function (el) { Train.q = el.value.trim(); renderTrainBody(); };
UI.act['train-type'] = function (el) { Train.type = el.getAttribute('data-v'); renderTrainBody(); };
UI.act['train-add'] = function () { openTrainForm(null); };
UI.act['train-open'] = function (el) { openTrain(el.getAttribute('data-id')); };
UI.act['train-export'] = function () {
  var rows = [['培训', '类型', '开始日期', '讲师', '参与', '完成', '平均分']];
  S.trainings.forEach(function (t) { var en = t.enrollments || [], scores = en.filter(function (x) { return typeof x.score === 'number'; }).map(function (x) { return x.score; }); rows.push([t.title, t.type, t.start, t.trainer, en.length, en.filter(function (x) { return x.status === 'completed'; }).length, scores.length ? round1(avg(scores)) : '']); });
  downloadFile('培训记录-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
function openTrain(id) {
  var t = S.trainings.filter(function (x) { return x.id === id; })[0]; if (!t) return;
  var en = t.enrollments || [];
  var h = '<div class="dr-hero"><div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:' + trainingTypeColor(t.type) + '1a;color:' + trainingTypeColor(t.type) + ';font-weight:800;font-size:16px">' + esc(t.type.slice(0, 1)) + '</div><div><div class="dr-name">' + esc(t.title) + '<span class="tag ' + trainStatusTone(t) + '">' + trainStatusText(t) + '</span></div><div class="dr-meta">' + esc(t.type + ' · ' + t.start + ' ' + (t.startTime || '') + ' · ' + (t.mode || '') + ' · 讲师 ' + (t.trainer || '—')) + '</div></div><div class="dr-tools"><button class="btn btn-sm btn-light" data-act="train-edit" data-id="' + t.id + '">' + ICON.edit + '编辑</button><button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="tabs"><button class="on">培训详情</button></div><div class="drawer-body">';
  h += '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">报名</div><div class="v">' + en.length + '<small>人</small></div><div class="d">容量 ' + t.capacity + '</div></div><div class="kpi"><div class="k">完成</div><div class="v">' + en.filter(function (x) { return x.status === 'completed'; }).length + '<small>人</small></div><div class="d">签到 ' + en.filter(function (x) { return x.status === 'attended' || x.status === 'completed'; }).length + ' 人</div></div><div class="kpi"><div class="k">平均分</div><div class="v">' + (en.filter(function (x) { return typeof x.score === 'number'; }).length ? round1(avg(en.filter(function (x) { return typeof x.score === 'number'; }).map(function (x) { return x.score; }))) : '—') + '</div><div class="d">培训考核</div></div><div class="kpi"><div class="k">课时</div><div class="v">' + (t.duration || 0) + '<small>h</small></div><div class="d">' + esc(t.mode || '') + '</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>培训信息</h3><div class="info-grid"><div class="k">时间</div><div>' + esc(t.start + ' ' + (t.startTime || '') + '–' + (t.endTime || '')) + '</div><div class="k">地点</div><div>' + esc(t.location || '—') + '</div><div class="k">讲师</div><div>' + esc(t.trainer || '—') + '</div><div class="k">说明</div><div>' + esc(t.desc || '—') + '</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0">学员名单</h3><span class="muted" style="font-size:12px">' + en.length + ' 人</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="train-enroll" data-id="' + t.id + '">' + ICON.plus + '添加学员</button></div><div class="tbl-wrap" style="box-shadow:none;margin-top:10px"><table class="tbl"><thead><tr><th>员工</th><th>部门</th><th>状态</th><th class="r">成绩</th><th>反馈</th></tr></thead><tbody>' + (en.length ? en.map(function (s) { var e = empById(s.eid); if (!e) return ''; return '<tr><td><div class="nm">' + empAva(e, 24) + esc(e.name) + '</div></td><td class="sub">' + esc(deptName(e.deptId)) + '</td><td><select class="sel perf-grade-sel" data-chg="train-status" data-id="' + t.id + '" data-eid="' + e.id + '"><option value="signed"' + (s.status === 'signed' ? ' selected' : '') + '>已报名</option><option value="attended"' + (s.status === 'attended' ? ' selected' : '') + '>已参加</option><option value="completed"' + (s.status === 'completed' ? ' selected' : '') + '>已完成</option><option value="absent"' + (s.status === 'absent' ? ' selected' : '') + '>缺席</option></select></td><td class="r num"><input class="adj-inp" type="number" value="' + (typeof s.score === 'number' ? s.score : '') + '" data-chg="train-score" data-id="' + t.id + '" data-eid="' + e.id + '"></td><td class="sub" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">' + esc(s.feedback || '') + '</td></tr>'; }).join('') : '<tr><td colspan="5"><div class="empty">还没有学员</div></td></tr>') + '</tbody></table></div></div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-light" data-act="train-sign-doc" data-id="' + t.id + '">' + ICON.doc + '签到表</button><button class="btn btn-light" data-act="train-done" data-id="' + t.id + '">标记已完成</button><button class="btn btn-dark" data-act="train-edit" data-id="' + t.id + '">编辑培训</button></div></div>';
  UI.drawer(h, true);
}
UI.act['train-sign-doc'] = function (el) {
  var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return;
  var lines = ['培训签到表', '培训：' + t.title, '时间：' + t.start + ' ' + (t.startTime || '') + '–' + (t.endTime || ''), '地点：' + (t.location || ''), '讲师：' + (t.trainer || ''), '', '学员名单：'];
  (t.enrollments || []).forEach(function (s) { var e = empById(s.eid); if (e) lines.push(e.name + '（' + deptName(e.deptId) + '）· ' + ({ signed: '已报名', attended: '已参加', completed: '已完成', absent: '缺席' }[s.status] || '—') + (typeof s.score === 'number' ? ' · ' + s.score + ' 分' : '')); });
  saveGeneratedDoc('培训签到表-' + t.title + '.txt', lines.join('\n'));
};
UI.chg['train-status'] = function (el) {
  var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return;
  var s = (t.enrollments || []).filter(function (x) { return x.eid === el.getAttribute('data-eid'); })[0]; if (!s) return;
  s.status = el.value; save(); UI.toast('培训状态已更新');
};
UI.chg['train-score'] = function (el) {
  var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return;
  var s = (t.enrollments || []).filter(function (x) { return x.eid === el.getAttribute('data-eid'); })[0]; if (!s) return;
  var v = el.value.trim(); s.score = v === '' ? null : clamp(parseFloat(v), 0, 100); save(); UI.toast('成绩已保存');
};
UI.act['train-done'] = function (el) { var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return; t.status = 'done'; save(); UI.closeDrawer(); UI.rerender(); UI.toast('培训已完成'); };
function openTrainForm(t) {
  var isNew = !t;
  var d = t ? deepClone(t) : { id: uid('tr'), title: '', type: S.settings.training.types[0], mode: '线下', start: addDays(todayStr(), 7), startTime: '14:00', endTime: '16:00', duration: S.settings.training.defaultDuration, location: '3 楼大会议室', trainer: '', capacity: S.settings.training.defaultCapacity, budget: 0, status: 'signup', desc: '', enrollments: [] };
  UI.modal({
    title: isNew ? '新建培训' : '编辑培训', wide: true,
    body: '<div class="row2"><div class="field"><label>培训名称<span class="req">*</span></label><input class="inp" id="tfTitle" value="' + esc(d.title) + '" autofocus></div><div class="field"><label>类型</label><select class="sel" id="tfType">' + S.settings.training.types.map(function (x) { return '<option' + (d.type === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row3"><div class="field"><label>日期</label><input class="inp" type="date" id="tfDate" value="' + esc(d.start) + '"></div><div class="field"><label>开始</label><input class="inp" type="time" id="tfStart" value="' + esc(d.startTime) + '"></div><div class="field"><label>结束</label><input class="inp" type="time" id="tfEnd" value="' + esc(d.endTime) + '"></div></div>' +
      '<div class="row3"><div class="field"><label>方式</label><select class="sel" id="tfMode"><option' + (d.mode === '线下' ? ' selected' : '') + '>线下</option><option' + (d.mode === '线上' ? ' selected' : '') + '>线上</option><option' + (d.mode === '混合' ? ' selected' : '') + '>混合</option></select></div><div class="field"><label>讲师</label><input class="inp" id="tfTrainer" value="' + esc(d.trainer) + '"></div><div class="field"><label>课时</label><input class="inp num" id="tfDuration" type="number" step="0.5" value="' + d.duration + '"></div></div>' +
      '<div class="row3"><div class="field"><label>地点 / 链接</label><input class="inp" id="tfLocation" value="' + esc(d.location) + '"></div><div class="field"><label>容量</label><input class="inp num" id="tfCapacity" type="number" value="' + d.capacity + '"></div><div class="field"><label>预算（元）</label><input class="inp num" id="tfBudget" type="number" value="' + (d.budget || 0) + '"></div></div>' +
      '<div class="field"><label>培训说明</label><textarea class="ta" id="tfDesc">' + esc(d.desc || '') + '</textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="tf-save" data-new="' + (isNew ? 1 : 0) + '" data-id="' + d.id + '">保存</button>'
  });
  UI.modalCtx.train = d;
}
UI.act['tf-save'] = function (el) {
  var d = UI.modalCtx.train, isNew = el.getAttribute('data-new') === '1';
  d.title = $('#tfTitle').value.trim(); if (!d.title) { UI.toast('请填写培训名称'); return; }
  d.type = $('#tfType').value; d.start = $('#tfDate').value || todayStr(); d.startTime = $('#tfStart').value; d.endTime = $('#tfEnd').value;
  d.mode = $('#tfMode').value; d.trainer = $('#tfTrainer').value.trim(); d.duration = +$('#tfDuration').value || 0;
  d.location = $('#tfLocation').value.trim(); d.capacity = Math.max(1, +$('#tfCapacity').value || 1); d.budget = +$('#tfBudget').value || 0; d.desc = $('#tfDesc').value.trim();
  if (isNew) S.trainings.push(d); else Object.assign(S.trainings.filter(function (x) { return x.id === d.id; })[0], d);
  save(); UI.closeModal(); UI.closeDrawer(); UI.rerender(); UI.toast(isNew ? '培训已创建' : '培训已保存');
};
UI.act['train-enroll'] = function (el) {
  var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return;
  var enrolled = {}; (t.enrollments || []).forEach(function (s) { enrolled[s.eid] = 1; });
  UI.modal({
    title: '添加学员 · ' + t.title, wide: true,
    body: '<div class="field"><label>选择员工</label><div class="pick-grid" id="tePick">' + activeEmployees().map(function (e) { return '<label><input type="checkbox" value="' + e.id + '"' + (enrolled[e.id] ? ' checked disabled' : '') + '> ' + esc(e.name) + '</label>'; }).join('') + '</div></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="te-save" data-id="' + t.id + '">添加</button>'
  });
};
UI.act['te-save'] = function (el) {
  var t = S.trainings.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!t) return;
  var ids = $$('#tePick input:checked').map(function (x) { return x.value; });
  ids.forEach(function (eid) { if (!(t.enrollments || []).some(function (s) { return s.eid === eid; })) t.enrollments.push({ eid: eid, status: 'signed', score: null, feedback: '', note: '' }); });
  save(); UI.closeModal(); UI.toast('已添加 ' + ids.length + ' 人'); openTrain(t.id); UI.rerender();
};
function trainingEmpHTML(e) {
  var list = trainingEmpList(e.id).sort(function (a, b) { return a.start < b.start ? 1 : -1; });
  var h = '<div class="emp-panel" style="margin:18px 0 14px"><h3>培训记录</h3><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>培训</th><th>类型</th><th>日期</th><th>状态</th><th class="r">成绩</th></tr></thead><tbody>' + (list.length ? list.map(function (t) { var s = (t.enrollments || []).filter(function (x) { return x.eid === e.id; })[0] || {}; return '<tr><td><b>' + esc(t.title) + '</b><div class="muted" style="font-size:11.5px">' + esc(t.trainer || '') + '</div></td><td><span class="tag" style="background:' + trainingTypeColor(t.type) + '1a;color:' + trainingTypeColor(t.type) + '">' + esc(t.type) + '</span></td><td class="num">' + esc(t.start) + '</td><td>' + ({ signed: '已报名', attended: '已参加', completed: '已完成', absent: '缺席' }[s.status] || '—') + '</td><td class="r num">' + (typeof s.score === 'number' ? s.score : '—') + '</td></tr>'; }).join('') : '<tr><td colspan="5"><div class="empty">还没有培训记录</div></td></tr>') + '</tbody></table></div></div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-light btn-sm" data-act="train-emp-open" data-eid="' + e.id + '">' + ICON.book + '进入培训管理</button></div>';
  return h;
}
UI.act['train-emp-open'] = function (el) { var e = empById(el.getAttribute('data-eid')); if (!e) return; UI.closeDrawer(); Train.q = e.name; Train.tab = 'record'; UI.go('training'); };
