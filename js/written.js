/* =========================================================
   笔试管理 · 安排笔试、录入成绩、发送笔试邀请
   ========================================================= */
var Written = { q: '', job: 'all', status: 'all' };
function writtenPool() {
  return S.candidates.filter(function (c) {
    if (c.screen !== 'passed' || c.stage === 'rejected') return false;
    return c.stage === 'written' || typeof c.scores.written === 'number';
  });
}
function writtenStatus(c) {
  if (typeof c.scores.written === 'number') return 'scored';
  if (c.scores.writtenAt) return 'scheduled';
  return 'pending';
}
UI.register('written', {
  render: function (main) {
    var pool = writtenPool();
    var scored = pool.filter(function (c) { return writtenStatus(c) === 'scored'; });
    var scheduled = pool.filter(function (c) { return writtenStatus(c) === 'scheduled'; });
    var pending = pool.filter(function (c) { return writtenStatus(c) === 'pending'; });
    var avgScore = scored.length ? round1(avg(scored.map(function (c) { return c.scores.written; }))) : null;
    var h = '<div class="page scroll written-page"><div class="page-head"><div><h1 class="page-title">笔试管理</h1><div class="page-desc">' + pending.length + ' 人待安排 · ' + scheduled.length + ' 人已安排 · ' + scored.length + ' 人已出分</div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="written-invite">' + ICON.send + '发送笔试邀请</button><button class="btn btn-light" data-act="written-export">' + ICON.down + '导出成绩</button><button class="btn btn-dark" data-act="written-schedule">' + ICON.cal + '安排笔试</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">待安排</div><div class="v">' + pending.length + '<small>人</small></div><div class="d">通过初筛、还没约笔试</div></div>' +
      '<div class="stat-card"><div class="k">已安排</div><div class="v">' + scheduled.length + '<small>人</small></div><div class="d">等待笔试</div></div>' +
      '<div class="stat-card"><div class="k">已出分</div><div class="v">' + scored.length + '<small>人</small></div><div class="d">平均分 ' + (avgScore === null ? '—' : avgScore) + '</div></div>' +
      '<div class="stat-card"><div class="k">通过线</div><div class="v">60<small>分</small></div><div class="d">低于 60 分建议淘汰</div></div></div>';
    h += '<div class="filterbar"><input class="inp" placeholder="搜索姓名、学校、职位" value="' + esc(Written.q) + '" data-inp="written-q"><select class="sel" style="width:180px;height:34px" data-chg="written-job"><option value="all">全部职位</option>' + S.jobs.map(function (j) { return '<option value="' + j.id + '"' + (Written.job === j.id ? ' selected' : '') + '>' + esc(j.title) + '</option>'; }).join('') + '</select>' +
      '<div class="chips"><button class="' + (Written.status === 'all' ? 'on' : '') + '" data-act="written-status" data-v="all">全部</button><button class="' + (Written.status === 'pending' ? 'on' : '') + '" data-act="written-status" data-v="pending">待安排</button><button class="' + (Written.status === 'scheduled' ? 'on' : '') + '" data-act="written-status" data-v="scheduled">已安排</button><button class="' + (Written.status === 'scored' ? 'on' : '') + '" data-act="written-status" data-v="scored">已出分</button></div></div>';
    var list = pool.filter(function (c) {
      if (Written.job !== 'all' && c.jobId !== Written.job) return false;
      if (Written.status !== 'all' && writtenStatus(c) !== Written.status) return false;
      if (Written.q) { var q = Written.q.toLowerCase(); if ((c.name + ' ' + c.resume.school + ' ' + candidateJobTitle(c)).toLowerCase().indexOf(q) < 0) return false; }
      return true;
    });
    h += '<div class="tbl-wrap"><table class="tbl written-tbl"><thead><tr><th>候选人</th><th>应聘职位</th><th class="c">简历分</th><th>笔试安排</th><th class="c">笔试成绩</th><th>状态</th><th class="r">操作</th></tr></thead><tbody>';
    if (!list.length) h += '<tr><td colspan="7"><div class="empty">没有符合条件的候选人</div></td></tr>';
    list.forEach(function (c) {
      var st = writtenStatus(c), job = jobById(c.jobId);
      h += '<tr class="click" data-act="open-cand" data-cid="' + c.id + '"><td><div class="nm">' + candAva(c, 28) + '<b>' + esc(c.name) + '</b><span class="muted" style="font-size:11.5px">' + esc(c.resume.degree + ' · ' + c.resume.school) + '</span></div></td>' +
        '<td><span class="dept-cell"><i class="dot" style="background:' + deptColor(c.deptId) + '"></i>' + esc(job ? job.title : '') + '</span></td>' +
        '<td class="c num">' + (c.scores.resume === null ? '—' : c.scores.resume) + '</td>' +
        '<td>' + (c.scores.writtenAt ? '<span class="num">' + esc(c.scores.writtenAt) + '</span> <span class="muted" style="font-size:11.5px">' + esc(c.scores.writtenMode || '线上') + '</span>' : '<span class="muted">未安排</span>') + '</td>' +
        '<td class="c"><input class="inp num" data-chg="written-score" data-cid="' + c.id + '" value="' + (typeof c.scores.written === 'number' ? c.scores.written : '') + '" placeholder="—" onclick="event.stopPropagation()"></td>' +
        '<td>' + (st === 'scored' ? '<span class="tag green">已出分</span>' : st === 'scheduled' ? '<span class="tag blue">已安排</span>' : '<span class="tag amber">待安排</span>') + '</td>' +
        '<td class="r"><span class="ops"><button class="btn btn-xs btn-ghost" data-act="written-schedule-one" data-cid="' + c.id + '">' + ICON.cal + '安排</button>' + (typeof c.scores.written === 'number' && c.scores.written >= 60 && c.stage === 'written' ? '<button class="btn btn-xs btn-dark" data-act="written-pass" data-cid="' + c.id + '">进入初试</button>' : '') + '</span></td></tr>';
    });
    h += '</tbody></table></div></div>';
    main.innerHTML = h;
  }
});
UI.inp['written-q'] = function (el) { Written.q = el.value.trim(); UI.rerender(); };
UI.chg['written-job'] = function (el) { Written.job = el.value; UI.rerender(); };
UI.act['written-status'] = function (el) { Written.status = el.getAttribute('data-v'); UI.rerender(); };
UI.chg['written-score'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  var v = el.value.trim(); if (v === '') { delete c.scores.written; } else { var n = clamp(parseFloat(v), 0, 100); if (isNaN(n)) return; c.scores.written = n; }
  save(); UI.toast('已保存笔试成绩'); UI.rerender(); UI.refreshSide();
};
UI.act['written-pass'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  c.stage = 'interview1'; save(); UI.toast(c.name + ' 已进入初试'); UI.rerender(); UI.refreshSide();
};
UI.act['written-schedule'] = function () { openWrittenSchedule(null); };
UI.act['written-schedule-one'] = function (el, e) { if (e) e.stopPropagation(); openWrittenSchedule(candById(el.getAttribute('data-cid'))); };
UI.act['written-invite'] = function () {
  var list = writtenPool().filter(function (c) { return c.scores.writtenAt; });
  if (!list.length) { UI.toast('还没有安排笔试的候选人'); return; }
  list.forEach(function (c) { addCandidateNotification(c, 'writtenInvite', { 笔试时间: c.scores.writtenAt, 笔试方式: c.scores.writtenMode || '线上', 笔试地点: c.scores.writtenPlace || '', 笔试时长: c.scores.writtenDuration || '60 分钟' }); });
  save(); openNotifyBatch(list.map(function (c) { return c.id; }), 'writtenInvite');
};
UI.act['written-export'] = function () {
  var rows = [['姓名', '应聘职位', '简历分', '笔试时间', '笔试成绩', '状态']];
  writtenPool().forEach(function (c) { rows.push([c.name, candidateJobTitle(c), c.scores.resume === null ? '' : c.scores.resume, c.scores.writtenAt || '', typeof c.scores.written === 'number' ? c.scores.written : '', writtenStatus(c)]); });
  downloadFile('笔试成绩-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
function openWrittenSchedule(one) {
  var list = writtenPool().filter(function (c) { return writtenStatus(c) !== 'scored'; });
  if (!list.length) { UI.toast('没有待安排的候选人'); return; }
  var selected = one ? [one.id] : list.slice(0, 3).map(function (c) { return c.id; });
  var body = '<div class="row3"><div class="field"><label>笔试日期</label><input class="inp" type="date" id="wsDate" value="' + addDays(todayStr(), 2) + '"></div><div class="field"><label>开始时间</label><input class="inp" type="time" id="wsTime" value="10:00"></div><div class="field"><label>时长</label><select class="sel" id="wsDur"><option>60 分钟</option><option>90 分钟</option><option>45 分钟</option><option>120 分钟</option></select></div></div>' +
    '<div class="row2"><div class="field"><label>方式</label><select class="sel" id="wsMode"><option>线上</option><option>现场</option></select></div><div class="field"><label>地点 / 链接</label><input class="inp" id="wsPlace" value="https://exam.example.com" placeholder="线上填链接，现场填会议室"></div></div>' +
    '<div class="field"><label>选择候选人（<span id="wsCount">' + selected.length + '</span> 人）</label><div class="pick-grid" id="wsPick">' + list.map(function (c) { return '<label><input type="checkbox" data-chg="ws-pick" data-cid="' + c.id + '"' + (selected.indexOf(c.id) >= 0 ? ' checked' : '') + '> ' + esc(c.name) + '</label>'; }).join('') + '</div></div>' +
    '<label class="chk"><input type="checkbox" id="wsNotify" checked> 安排后立即生成笔试邀请通知</label>';
  UI.modal({
    title: '安排笔试', body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ws-save">安排并生成邀请</button>'
  });
}
UI.chg['ws-pick'] = function () {
  var el = $('#wsCount'); if (el) el.textContent = $$('#wsPick input:checked').length;
};
UI.act['ws-save'] = function () {
  var date = $('#wsDate').value, time = $('#wsTime').value, dur = $('#wsDur').value, mode = $('#wsMode').value, place = $('#wsPlace').value.trim();
  var ids = $$('#wsPick input:checked').map(function (x) { return x.getAttribute('data-cid'); });
  if (!date || !time) { UI.toast('请选择日期和时间'); return; }
  if (!ids.length) { UI.toast('至少选择一位候选人'); return; }
  ids.forEach(function (id) {
    var c = candById(id); if (!c) return;
    c.scores.writtenAt = date + ' ' + time; c.scores.writtenMode = mode; c.scores.writtenPlace = place; c.scores.writtenDuration = dur;
    if ($('#wsNotify') && $('#wsNotify').checked) addCandidateNotification(c, 'writtenInvite', { 笔试时间: c.scores.writtenAt, 笔试方式: mode, 笔试地点: place, 笔试时长: dur });
  });
  save(); UI.closeModal(); UI.toast('已为 ' + ids.length + ' 人安排笔试'); UI.rerender(); UI.refreshSide();
};
