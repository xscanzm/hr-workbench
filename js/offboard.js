/* =========================================================
   离职管理 · 离职办理进度、交接、结算、离职证明、历史记录
   ========================================================= */
UI.register('offboard', {
  render: function (main) {
    var list = S.offboarding, left = S.employees.filter(function (e) { return e.empStatus === 'left'; });
    var doneSteps = 0, totalSteps = list.length * OFFBOARD_STEPS.length;
    list.forEach(function (o) { OFFBOARD_STEPS.forEach(function (s) { if (o.steps[s[0]]) doneSteps++; }); });
    var avgTenure = left.length ? round1(avg(left.map(function (e) { return tenureMonths(e.hireDate) / 12; }))) : 0;
    var h = '<div class="page scroll"><div class="page-head"><div><h1 class="page-title">离职管理</h1><div class="page-desc">办理中 <b>' + list.length + '</b> 人 · 本月离职 <b>' + headcountStats().leftThisMonth + '</b> 人 · 历史离职 <b>' + left.length + '</b> 人</div></div><div class="grow"></div><div class="actions"><button class="btn btn-light" data-act="ob-export">' + ICON.down + '导出记录</button><button class="btn btn-dark" data-act="ob-add">' + ICON.exit + '发起离职</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">办理中</div><div class="v">' + list.length + '<small>人</small></div><div class="d">四步流程</div></div>' +
      '<div class="stat-card"><div class="k">流程完成度</div><div class="v">' + (totalSteps ? Math.round(doneSteps / totalSteps * 100) : 0) + '<small>%</small></div><div class="d">' + doneSteps + ' / ' + totalSteps + ' 步</div></div>' +
      '<div class="stat-card"><div class="k">历史离职</div><div class="v">' + left.length + '<small>人</small></div><div class="d">平均在职 ' + avgTenure + ' 年</div></div>' +
      '<div class="stat-card"><div class="k">本月离职</div><div class="v">' + headcountStats().leftThisMonth + '<small>人</small></div><div class="d">主动 / 协商 / 合同到期</div></div></div>';
    h += '<div class="ob-grid">' + (list.length ? list.map(function (o) {
      var e = empById(o.eid); if (!e) return '';
      return '<div class="ob-card"><div class="ob-head">' + empAva(e, 44) + '<div><div class="on">' + esc(e.name) + '</div><div class="om">' + esc(deptName(e.deptId) + ' · ' + e.title + ' · ' + e.no) + '</div></div><div class="od">最后工作日<b>' + esc(o.lastDay) + '</b></div></div>' +
        '<div class="ob-meta"><div><span>离职类型</span>' + esc(o.type) + '</div><div><span>离职原因</span>' + esc(o.reason) + '</div><div><span>申请日期</span>' + esc(o.applyDate) + '</div><div><span>交接说明</span>' + (esc(o.note) || '—') + '</div></div>' +
        '<div class="steps">' + OFFBOARD_STEPS.map(function (s, i) { return '<div class="step' + (o.steps[s[0]] ? ' on' : '') + '"><i>' + (o.steps[s[0]] ? '✓' : (i + 1)) + '</i>' + s[1] + '</div>'; }).join('') + '</div>' +
        '<div class="ob-foot"><button class="btn btn-sm btn-light" data-act="ob-open" data-eid="' + e.id + '">查看档案</button><span class="grow"></span><button class="btn btn-sm btn-ghost" data-act="ob-cancel" data-id="' + o.id + '">撤销</button>' + (nextStep(o) ? '<button class="btn btn-sm btn-dark" data-act="ob-next" data-id="' + o.id + '">推进：' + nextStep(o)[1] + '</button>' : '<button class="btn btn-sm btn-dark" data-act="ob-finish" data-id="' + o.id + '">完成离职</button>') + '</div></div>';
    }).join('') : '<div class="panel" style="grid-column:1/-1"><div class="empty">没有正在办理的离职</div></div>') + '</div>';
    h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>员工</th><th>部门 / 职位</th><th>入职日期</th><th>离职日期</th><th>在职时长</th><th>离职原因</th><th>状态</th><th></th></tr></thead><tbody>';
    if (!left.length) h += '<tr><td colspan="8"><div class="empty">还没有已完成离职的员工</div></td></tr>';
    left.forEach(function (e) {
      h += '<tr class="click" data-act="ob-open" data-eid="' + e.id + '"><td><div class="nm">' + empAva(e, 28) + esc(e.name) + '</div></td><td><i class="dot" style="background:' + deptColor(e.deptId) + ';margin-right:6px"></i>' + esc(deptName(e.deptId) + ' · ' + e.title) + '</td><td class="num">' + esc(e.hireDate) + '</td><td class="num">' + esc(e.leftDate || '—') + '</td><td>' + tenureText(e.hireDate) + '</td><td class="sub">' + esc(e.leftReason || '—') + '</td><td><span class="tag gray">已离职</span></td><td class="r"><button class="btn btn-xs btn-ghost" data-act="ob-open" data-eid="' + e.id + '">档案</button></td></tr>';
    });
    h += '</tbody></table></div></div>';
    main.innerHTML = h;
  }
});
function nextStep(o) {
  for (var i = 0; i < OFFBOARD_STEPS.length; i++) { var s = OFFBOARD_STEPS[i]; if (!o.steps[s[0]]) return s; }
  return null;
}
UI.act['ob-next'] = function (el) {
  var o = S.offboarding.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!o) return;
  var s = nextStep(o); if (!s) return;
  o.steps[s[0]] = true;
  var e = empById(o.eid);
  if (e) addEvent(e.id, '离职办理', '完成「' + s[1] + '」', todayStr());
  save(); UI.rerender(); UI.toast('已完成：' + s[1]);
};
UI.act['ob-finish'] = function (el) {
  var o = S.offboarding.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!o) return;
  var e = empById(o.eid); if (!e) return;
  UI.confirm('完成离职', '确认「' + esc(e.name) + '」已完成全部离职手续？完成后员工状态会变为「已离职」。', '完成离职', function () {
    OFFBOARD_STEPS.forEach(function (s) { o.steps[s[0]] = true; });
    e.empStatus = 'left'; e.leftDate = o.lastDay || todayStr(); e.leftReason = o.reason;
    addEvent(e.id, '离职', '离职生效，原因：' + o.reason, e.leftDate);
    S.offboarding = S.offboarding.filter(function (x) { return x.id !== o.id; });
    save(); UI.rerender(); UI.refreshSide(); UI.toast(e.name + ' 已离职');
  });
};
UI.act['ob-cancel'] = function (el) {
  var o = S.offboarding.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!o) return;
  var e = empById(o.eid);
  UI.confirm('撤销离职', '确认撤销「' + esc(e ? e.name : '') + '」的离职申请？', '撤销', function () {
    S.offboarding = S.offboarding.filter(function (x) { return x.id !== o.id; });
    if (e) addEvent(e.id, '离职撤销', '撤销离职申请', todayStr());
    save(); UI.rerender(); UI.refreshSide(); UI.toast('已撤销');
  });
};
UI.act['ob-open'] = function (el) { openEmployee(el.getAttribute('data-eid')); };
UI.act['ob-add'] = function () {
  var pool = activeEmployees();
  if (!pool.length) { UI.toast('没有在职员工'); return; }
  UI.modal({
    title: '发起离职', wide: true,
    body: '<div class="row2"><div class="field"><label>员工</label><select class="sel" id="obEmp">' + pool.map(function (e) { return '<option value="' + e.id + '">' + esc(e.name + ' · ' + deptName(e.deptId) + ' · ' + e.title) + '</option>'; }).join('') + '</select></div><div class="field"><label>最后工作日</label><input class="inp" type="date" id="obLast" value="' + addDays(todayStr(), 30) + '"></div></div>' +
      '<div class="row2"><div class="field"><label>离职类型</label><select class="sel" id="obType"><option>主动离职</option><option>协商解除</option><option>合同到期</option><option>辞退</option></select></div><div class="field"><label>离职原因</label><select class="sel" id="obReason">' + OFFBOARD_REASONS.map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field"><label>交接说明</label><textarea class="ta" id="obNote"></textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ob-add-save">发起离职</button>'
  });
};
UI.act['ob-add-save'] = function () {
  var e = empById($('#obEmp').value); if (!e) return;
  if (S.offboarding.some(function (x) { return x.eid === e.id; })) { UI.toast('该员工已在离职办理中'); return; }
  S.offboarding.push({ id: uid('ob'), eid: e.id, applyDate: todayStr(), lastDay: $('#obLast').value || addDays(todayStr(), 30), reason: $('#obReason').value, type: $('#obType').value, steps: { apply: true, handover: false, settle: false, cert: false }, note: $('#obNote').value.trim() });
  addEvent(e.id, '离职申请', '提交离职申请，最后工作日 ' + ($('#obLast').value || addDays(todayStr(), 30)), todayStr());
  save(); UI.closeModal(); UI.rerender(); UI.refreshSide(); UI.toast('已发起离职办理');
};
UI.act['ob-export'] = function () {
  var rows = [['姓名', '工号', '部门', '职位', '入职日期', '离职日期', '在职时长', '离职原因', '类型']];
  S.employees.filter(function (e) { return e.empStatus === 'left'; }).forEach(function (e) { rows.push([e.name, e.no, deptName(e.deptId), e.title, e.hireDate, e.leftDate || '', tenureText(e.hireDate), e.leftReason || '', '']); });
  downloadFile('离职记录-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
