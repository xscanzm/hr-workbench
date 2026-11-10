/* =========================================================
   员工活动 · 日历、列表、报名、签到、预算与反馈
   ========================================================= */
var Act = { month: todayStr().slice(0, 7), type: 'all' };
function actStatusText(a) { return a.status === 'done' ? '已结束' : a.status === 'cancelled' ? '已取消' : a.date === todayStr() ? '进行中' : '报名中'; }
function actStatusTone(a) { return a.status === 'done' ? 'gray' : a.status === 'cancelled' ? 'red' : a.date === todayStr() ? 'green' : 'blue'; }
function actMonthActs(month) {
  return S.activities.filter(function (a) { return (a.date || '').indexOf(month) === 0 && (Act.type === 'all' || a.type === Act.type); }).sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? -1 : 1; });
}
UI.register('activities', {
  render: function (main) {
    var st = activityStats(), upcoming = activityUpcoming(6);
    var h = '<div class="page scroll activities-page"><div class="page-head"><div><h1 class="page-title">员工活动</h1><div class="page-desc">本月 <b>' + st.month + '</b> 场 · 待举办 <b>' + st.upcoming + '</b> 场 · 参与 <b>' + st.participants + '</b> 人次 · 预算使用 <b>' + Math.round(st.actual / Math.max(1, st.budget) * 100) + '%</b></div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="act-export">' + ICON.down + '导出活动</button><button class="btn btn-dark" data-act="act-add">' + ICON.plus + '发起活动</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">本月活动</div><div class="v">' + st.month + '<small>场</small></div><div class="d">全部 ' + S.activities.length + ' 场</div></div>' +
      '<div class="stat-card"><div class="k">待举办</div><div class="v">' + st.upcoming + '<small>场</small></div><div class="d">含报名中</div></div>' +
      '<div class="stat-card"><div class="k">参与人次</div><div class="v">' + st.participants + '</div><div class="d">累计报名 / 签到</div></div>' +
      '<div class="stat-card"><div class="k">预算使用</div><div class="v">' + Math.round(st.actual / 1000) + '<small>K</small></div><div class="d">预算 ' + Math.round(st.budget / 1000) + 'K · 实际 ' + Math.round(st.actual / 1000) + 'K</div></div></div>';
    h += '<div class="act-layout"><div class="panel act-cal-panel">' + actCalendarHTML() + '</div><div class="panel"><div style="display:flex;align-items:center;gap:8px"><div class="panel-title">即将开始</div><span class="tag blue">' + upcoming.length + '</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="act-add">' + ICON.plus + '发起</button></div><div class="panel-sub">按时间排序</div>' + (upcoming.length ? upcoming.map(actCardHTML).join('') : '<div class="empty">近期没有活动</div>') + '</div></div>';
    h += '<div class="panel" style="margin-top:14px"><div class="panel-title">活动记录</div><div class="panel-sub">已结束的活动</div><div class="tbl-wrap" style="box-shadow:none"><table class="tbl"><thead><tr><th>活动</th><th>类型</th><th>日期</th><th class="r">参与</th><th class="r">预算</th><th class="r">实际</th><th>评分</th><th class="r"></th></tr></thead><tbody>';
    var past = activityPast(99);
    if (!past.length) h += '<tr><td colspan="8"><div class="empty">还没有已结束的活动</div></td></tr>';
    past.forEach(function (a) {
      h += '<tr class="click" data-act="act-open" data-id="' + a.id + '"><td><b>' + esc(a.title) + '</b><div class="muted" style="font-size:11.5px">' + esc(a.location || '') + '</div></td><td><span class="tag" style="background:' + activityTypeColor(a.type) + '1a;color:' + activityTypeColor(a.type) + '">' + esc(a.type) + '</span></td><td class="num">' + esc(a.date) + '</td><td class="r num">' + activitySignupCount(a) + '</td><td class="r num">' + (a.budget ? (a.budget / 1000) + 'K' : '—') + '</td><td class="r num">' + (a.actualCost ? (a.actualCost / 1000) + 'K' : '—') + '</td><td>' + (a.feedback ? '<span class="tag amber">' + a.feedback.rating + ' 星</span>' : '<span class="muted">—</span>') + '</td><td class="r"><span class="ops"><button class="btn btn-xs btn-ghost" data-act="act-open" data-id="' + a.id + '">详情</button></span></td></tr>';
    });
    h += '</tbody></table></div></div></div>';
    main.innerHTML = h;
  }
});
function actCalendarHTML() {
  var d = parseDate(Act.month + '-01'); if (!d) return '';
  var y = d.getFullYear(), m = d.getMonth(), days = new Date(y, m + 1, 0).getDate(), offset = (new Date(y, m, 1).getDay() + 6) % 7;
  var acts = actMonthActs(Act.month);
  var h = '<div class="act-cal-head"><div><div class="panel-title">' + y + ' 年 ' + (m + 1) + ' 月</div><div class="panel-sub">活动日历</div></div><span class="grow"></span><button class="btn btn-icon btn-light btn-sm" data-act="act-month" data-d="-1">' + ICON.back + '</button><button class="btn btn-icon btn-light btn-sm" data-act="act-month" data-d="1">' + ICON.fwd + '</button></div>' +
    '<div class="act-type-filter"><button class="' + (Act.type === 'all' ? 'on' : '') + '" data-act="act-type" data-v="all">全部</button>' + (S.settings.activity.types || []).map(function (t) { return '<button class="' + (Act.type === t ? 'on' : '') + '" data-act="act-type" data-v="' + t + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
    '<div class="act-cal-week">' + ['一', '二', '三', '四', '五', '六', '日'].map(function (x) { return '<span>周' + x + '</span>'; }).join('') + '</div><div class="act-cal-grid">';
  for (var i = 0; i < offset; i++) h += '<div class="act-day empty"></div>';
  for (var day = 1; day <= days; day++) {
    var ds = Act.month + '-' + pad2(day), list = acts.filter(function (a) { return a.date === ds; });
    h += '<div class="act-day' + (ds === todayStr() ? ' today' : '') + '"><div class="act-day-num">' + day + '</div>' + list.slice(0, 2).map(function (a) { return '<button class="act-chip" style="background:' + activityTypeColor(a.type) + '1a;color:' + activityTypeColor(a.type) + '" data-act="act-open" data-id="' + a.id + '" title="' + esc(a.title) + '">' + esc(a.title) + '</button>'; }).join('') + (list.length > 2 ? '<div class="act-more">+' + (list.length - 2) + '</div>' : '') + '</div>';
  }
  h += '</div>';
  return h;
}
function actCardHTML(a) {
  var d = parseDate(a.date);
  return '<div class="act-card" data-act="act-open" data-id="' + a.id + '"><div class="act-date" style="color:' + activityTypeColor(a.type) + '"><b>' + (d ? d.getDate() : '') + '</b><span>' + (d ? (d.getMonth() + 1) + '月' : '') + '</span></div><div class="act-main"><div class="act-title">' + esc(a.title) + '<span class="tag" style="height:18px;font-size:10.5px;background:' + activityTypeColor(a.type) + '1a;color:' + activityTypeColor(a.type) + '">' + esc(a.type) + '</span></div><div class="act-meta">' + esc((a.start || '') + ' · ' + (a.location || '') + ' · ' + (a.organizerId ? empName(a.organizerId) : '')) + '</div><div class="act-progress"><span class="bar"><i style="width:' + Math.min(100, Math.round(activitySignupCount(a) / Math.max(1, a.capacity) * 100)) + '%;background:' + activityTypeColor(a.type) + '"></i></span><span>' + activitySignupCount(a) + ' / ' + a.capacity + ' 人</span></div></div><span class="tag ' + actStatusTone(a) + '">' + actStatusText(a) + '</span></div>';
}
UI.act['act-month'] = function (el) { var d = parseDate(Act.month + '-01'); d.setMonth(d.getMonth() + (+el.getAttribute('data-d'))); Act.month = d.getFullYear() + '-' + pad2(d.getMonth() + 1); UI.rerender(); };
UI.act['act-type'] = function (el) { Act.type = el.getAttribute('data-v'); UI.rerender(); };
UI.act['act-add'] = function () { openActForm(null); };
UI.act['act-open'] = function (el) { openAct(el.getAttribute('data-id')); };
UI.act['act-export'] = function () {
  var rows = [['活动', '类型', '日期', '开始', '地点', '报名人数', '容量', '预算', '实际', '状态', '评分']];
  S.activities.forEach(function (a) { rows.push([a.title, a.type, a.date, a.start, a.location, activitySignupCount(a), a.capacity, a.budget || 0, a.actualCost || 0, actStatusText(a), a.feedback ? a.feedback.rating : '']); });
  downloadFile('员工活动-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
function openAct(id) {
  var a = S.activities.filter(function (x) { return x.id === id; })[0]; if (!a) return;
  var signups = a.signups || [];
  var h = '<div class="dr-hero"><div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:' + activityTypeColor(a.type) + '1a;color:' + activityTypeColor(a.type) + ';font-weight:800;font-size:16px">' + esc(a.type.slice(0, 1)) + '</div><div><div class="dr-name">' + esc(a.title) + '<span class="tag ' + actStatusTone(a) + '">' + actStatusText(a) + '</span></div><div class="dr-meta">' + esc(a.type + ' · ' + a.date + ' ' + (a.start || '') + '–' + (a.end || '') + ' · ' + (a.location || '')) + '</div></div><div class="dr-tools"><button class="btn btn-sm btn-light" data-act="act-edit" data-id="' + a.id + '">' + ICON.edit + '编辑</button><button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="tabs"><button class="on">活动详情</button></div><div class="drawer-body">';
  h += '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">报名 / 容量</div><div class="v">' + activitySignupCount(a) + '<small>/' + a.capacity + '</small></div><div class="d">签到 ' + signups.filter(function (s) { return s.status === 'checked'; }).length + ' 人</div></div><div class="kpi"><div class="k">预算</div><div class="v">' + (a.budget ? (a.budget / 1000) + 'K' : '—') + '</div><div class="d">实际 ' + (a.actualCost ? (a.actualCost / 1000) + 'K' : '—') + '</div></div><div class="kpi"><div class="k">组织者</div><div class="v" style="font-size:17px">' + esc(empName(a.organizerId) || '—') + '</div><div class="d">' + esc(a.type) + '</div></div><div class="kpi"><div class="k">评分</div><div class="v">' + (a.feedback ? a.feedback.rating : '—') + '</div><div class="d">' + (a.feedback ? '活动反馈' : '暂无反馈') + '</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>活动信息</h3><div class="info-grid"><div class="k">时间</div><div>' + esc(a.date + ' ' + (a.start || '') + '–' + (a.end || '')) + '</div><div class="k">地点</div><div>' + esc(a.location || '—') + '</div><div class="k">报名截止</div><div>' + esc(a.deadline || '活动开始前') + '</div><div class="k">说明</div><div>' + esc(a.desc || '—') + '</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0">报名名单</h3><span class="muted" style="font-size:12px">' + signups.length + ' 人</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="act-sign-add" data-id="' + a.id + '">' + ICON.plus + '添加报名</button></div><div class="tbl-wrap" style="box-shadow:none;margin-top:10px"><table class="tbl"><thead><tr><th>员工</th><th>部门</th><th>状态</th><th>备注</th></tr></thead><tbody>' + (signups.length ? signups.map(function (s) { var e = empById(s.eid); if (!e) return ''; return '<tr><td><div class="nm">' + empAva(e, 24) + esc(e.name) + '</div></td><td class="sub">' + esc(deptName(e.deptId)) + '</td><td><select class="sel perf-grade-sel" data-chg="act-sign-status" data-id="' + a.id + '" data-eid="' + e.id + '"><option value="signed"' + (s.status === 'signed' ? ' selected' : '') + '>已报名</option><option value="checked"' + (s.status === 'checked' ? ' selected' : '') + '>已签到</option><option value="absent"' + (s.status === 'absent' ? ' selected' : '') + '>未参加</option></select></td><td class="sub">' + esc(s.note || '') + '</td></tr>'; }).join('') : '<tr><td colspan="4"><div class="empty">还没有人报名</div></td></tr>') + '</tbody></table></div></div>';
  if (a.feedback) h += '<div class="emp-panel" style="margin:0 0 14px"><h3>活动反馈</h3><div class="emp-note">' + a.feedback.rating + ' 星 · ' + esc(a.feedback.summary || '') + '</div></div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-light" data-act="act-sign-doc" data-id="' + a.id + '">' + ICON.doc + '签到表</button><button class="btn btn-light" data-act="act-done" data-id="' + a.id + '">标记已结束</button><button class="btn btn-light" data-act="act-cancel" data-id="' + a.id + '">取消活动</button><button class="btn btn-dark" data-act="act-edit" data-id="' + a.id + '">编辑活动</button></div>';
  h += '</div>';
  UI.drawer(h, true);
}
UI.act['act-sign-doc'] = function (el) {
  var a = S.activities.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!a) return;
  var lines = ['活动签到表', '活动：' + a.title, '时间：' + a.date + ' ' + (a.start || '') + '–' + (a.end || ''), '地点：' + (a.location || ''), '组织者：' + empName(a.organizerId), '', '签到名单：'];
  (a.signups || []).forEach(function (s) { var e = empById(s.eid); if (e) lines.push(e.name + '（' + deptName(e.deptId) + '）· ' + ({ signed: '已报名', checked: '已签到', absent: '未参加' }[s.status] || '—')); });
  saveGeneratedDoc('活动签到表-' + a.title + '.txt', lines.join('\n'));
};
UI.chg['act-sign-status'] = function (el) {
  var a = S.activities.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!a) return;
  var s = (a.signups || []).filter(function (x) { return x.eid === el.getAttribute('data-eid'); })[0]; if (!s) return;
  s.status = el.value; save(); UI.toast('报名状态已更新');
};
UI.act['act-done'] = function (el) { var a = S.activities.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!a) return; a.status = 'done'; save(); UI.closeDrawer(); UI.rerender(); UI.toast('活动已结束'); };
UI.act['act-cancel'] = function (el) { var a = S.activities.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!a) return; a.status = 'cancelled'; save(); UI.closeDrawer(); UI.rerender(); UI.toast('活动已取消'); };
function openActForm(a) {
  var isNew = !a;
  var d = a ? deepClone(a) : { id: uid('act'), title: '', type: S.settings.activity.types[0], date: addDays(todayStr(), 7), start: '14:00', end: '16:00', location: '', organizerId: S.employees.filter(function (e) { return e.name === S.settings.hr.name; })[0] ? S.employees.filter(function (e) { return e.name === S.settings.hr.name; })[0].id : '', capacity: S.settings.activity.defaultCapacity, budget: 2000, actualCost: 0, status: 'signup', desc: '', deadline: '', signups: [], feedback: null };
  UI.modal({
    title: isNew ? '发起活动' : '编辑活动', wide: true,
    body: '<div class="row2"><div class="field"><label>活动名称<span class="req">*</span></label><input class="inp" id="afTitle" value="' + esc(d.title) + '" autofocus></div><div class="field"><label>类型</label><select class="sel" id="afType">' + S.settings.activity.types.map(function (t) { return '<option' + (d.type === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row3"><div class="field"><label>日期</label><input class="inp" type="date" id="afDate" value="' + esc(d.date) + '"></div><div class="field"><label>开始</label><input class="inp" type="time" id="afStart" value="' + esc(d.start) + '"></div><div class="field"><label>结束</label><input class="inp" type="time" id="afEnd" value="' + esc(d.end) + '"></div></div>' +
      '<div class="row2"><div class="field"><label>地点</label><input class="inp" id="afLocation" value="' + esc(d.location) + '"></div><div class="field"><label>组织者</label><select class="sel" id="afOrganizer">' + activeEmployees().map(function (e) { return '<option value="' + e.id + '"' + (d.organizerId === e.id ? ' selected' : '') + '>' + esc(e.name + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row3"><div class="field"><label>容量</label><input class="inp num" id="afCapacity" type="number" value="' + d.capacity + '"></div><div class="field"><label>预算（元）</label><input class="inp num" id="afBudget" type="number" value="' + (d.budget || 0) + '"></div><div class="field"><label>报名截止</label><input class="inp" type="date" id="afDeadline" value="' + esc(d.deadline || '') + '"></div></div>' +
      '<div class="field"><label>活动说明</label><textarea class="ta" id="afDesc">' + esc(d.desc || '') + '</textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="af-save" data-new="' + (isNew ? 1 : 0) + '" data-id="' + d.id + '">保存</button>'
  });
  UI.modalCtx.act = d;
}
UI.act['af-save'] = function (el) {
  var d = UI.modalCtx.act, isNew = el.getAttribute('data-new') === '1';
  d.title = $('#afTitle').value.trim(); if (!d.title) { UI.toast('请填写活动名称'); return; }
  d.type = $('#afType').value; d.date = $('#afDate').value || todayStr(); d.start = $('#afStart').value; d.end = $('#afEnd').value;
  d.location = $('#afLocation').value.trim(); d.organizerId = $('#afOrganizer').value;
  d.capacity = Math.max(1, +$('#afCapacity').value || 1); d.budget = +$('#afBudget').value || 0; d.deadline = $('#afDeadline').value; d.desc = $('#afDesc').value.trim();
  if (isNew) S.activities.push(d); else Object.assign(S.activities.filter(function (x) { return x.id === d.id; })[0], d);
  save(); UI.closeModal(); UI.closeDrawer(); UI.rerender(); UI.toast(isNew ? '活动已创建' : '活动已保存');
};
function openActSignup(id) {
  var a = S.activities.filter(function (x) { return x.id === id; })[0]; if (!a) return;
  var signed = {}; (a.signups || []).forEach(function (s) { signed[s.eid] = 1; });
  UI.modal({
    title: '添加报名 · ' + a.title, wide: true,
    body: '<div class="field"><label>选择员工</label><div class="pick-grid" id="asPick">' + activeEmployees().map(function (e) { return '<label><input type="checkbox" value="' + e.id + '"' + (signed[e.id] ? ' checked disabled' : '') + '> ' + esc(e.name) + '</label>'; }).join('') + '</div></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="as-save" data-id="' + a.id + '">添加</button>'
  });
}
UI.act['act-sign-add'] = function (el) { openActSignup(el.getAttribute('data-id')); };
UI.act['as-save'] = function (el) {
  var a = S.activities.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!a) return;
  var ids = $$('#asPick input:checked').map(function (x) { return x.value; });
  ids.forEach(function (eid) { if (!(a.signups || []).some(function (s) { return s.eid === eid; })) a.signups.push({ eid: eid, status: 'signed', note: '', signedAt: todayStr() }); });
  save(); UI.closeModal(); UI.toast('已添加 ' + ids.length + ' 人'); openAct(a.id); UI.rerender();
};
