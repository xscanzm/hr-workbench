/* =========================================================
   招聘看板 · 在招职位、招聘漏斗、渠道效果、职位详情
   ========================================================= */
UI.register('board', {
  render: function (main) {
    var jobs = jobsWithStats(), hc = headcountStats();
    var need = sum(S.jobs.map(function (j) { return j.headcount || 0; }));
    var hired = S.candidates.filter(function (c) { return c.stage === 'hired'; }).length;
    var offers = S.candidates.filter(function (c) { return c.stage === 'offer'; }).length;
    var h = '<div class="page scroll board-page"><div class="page-head"><div><h1 class="page-title">招聘看板</h1><div class="page-desc">' + S.jobs.length + ' 个在招职位 · 需求 ' + need + ' 人 · 已入职 ' + hired + ' 人 · ' + activeCandidates().length + ' 位候选人在流程中</div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="board-export">' + ICON.down + '导出职位</button><button class="btn btn-dark" data-act="board-add">' + ICON.plus + '新增职位</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">在招职位</div><div class="v">' + S.jobs.filter(function (j) { return j.status !== 'closed'; }).length + '<small>个</small></div><div class="d">需求 ' + need + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">流程中候选人</div><div class="v">' + activeCandidates().length + '<small>人</small></div><div class="d">待筛选 ' + screeningList().length + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">Offer</div><div class="v">' + offers + '<small>人</small></div><div class="d">等待回复 ' + pendingOffers().length + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">已入职</div><div class="v">' + hired + '<small>人</small></div><div class="d">本月入职 ' + hc.joinedThisMonth + ' 人</div></div></div>';
    h += '<div class="job-grid">' + jobs.map(function (x) {
      var j = x.j, st = x.st, pctv = j.headcount ? Math.min(100, Math.round(st.hired / j.headcount * 100)) : 0;
      var stages = [['written', '笔试'], ['interview1', '初试'], ['interview2', '复试'], ['offer', 'Offer'], ['hired', '入职']];
      return '<div class="job-card" data-act="board-job" data-jid="' + j.id + '"><div class="jh"><div><div class="jt">' + esc(j.title) + '<span class="urgency ' + j.urgency + '">' + j.urgency + '</span></div><div class="jm"><i class="dot" style="background:' + deptColor(j.deptId) + ';margin-right:5px"></i>' + esc(deptName(j.deptId)) + ' · ' + esc(j.salary) + ' · ' + esc(j.level || '') + '</div></div><div class="jr"><b>' + st.hired + '<small>/' + j.headcount + '</small></b><div class="jm">已招 / 需求</div></div></div>' +
        '<div class="jbar"><i style="width:' + pctv + '%;background:' + deptColor(j.deptId) + '"></i></div>' +
        '<div class="jstages">' + stages.map(function (s) { return '<span class="jstage">' + s[1] + ' <b>' + (st.stages[s[0]] || 0) + '</b></span>'; }).join('') + '<span class="jstage">候选 <b>' + st.total + '</b></span></div>' +
        '<div class="jfoot"><span>' + ICON.users + ' 负责人 ' + esc(j.owner) + '</span><span class="grow"></span><span>' + (j.status === 'closed' ? '<span class="tag gray">已关闭</span>' : '<span class="tag green">招聘中</span>') + '</span></div></div>';
    }).join('') + '</div>';
    var funnel = recruitFunnel(), maxF = Math.max.apply(null, funnel.map(function (x) { return x.value; }).concat([1]));
    h += '<div class="funnel-card"><div style="display:flex;align-items:center;gap:10px"><div class="panel-title">招聘漏斗</div><span class="muted" style="font-size:12px">全部职位 · 从简历到入职</span></div><div class="funnel">' + funnel.map(function (x, i) {
      var rate = i === 0 ? 100 : Math.round(x.value / Math.max(1, funnel[0].value) * 100);
      return '<div class="funnel-row"><span>' + x.label + '</span><span class="fb"><i style="width:' + Math.max(3, x.value / maxF * 100) + '%;background:' + ['#2f7ff0', '#5b8def', '#7a5af5', '#14b0a6', '#f2a71b', '#1d9a57'][i] + '"></i></span><span class="fv">' + x.value + '</span></div>';
    }).join('') + '</div></div>';
    h += '<div class="an-grid2" style="margin-top:14px"><div class="an-panel"><div class="panel-title">渠道效果</div><div class="panel-sub">各渠道投递与入职人数</div><div class="an-list">' + sourceStats().map(function (s) {
      var max = Math.max.apply(null, sourceStats().map(function (x) { return x.n; }).concat([1]));
      return '<div class="an-list-row"><span>' + esc(s.name) + '</span><span class="ab"><i style="width:' + (s.n / max * 100) + '%;background:#2f7ff0"></i></span><span class="av">' + s.n + ' / ' + s.hired + '</span></div>';
    }).join('') + '</div></div><div class="an-panel"><div class="panel-title">部门招聘进度</div><div class="panel-sub">需求与已入职</div><div class="an-list">' + deptRecruitStats().map(function (x) {
      var p = x.need ? Math.min(100, Math.round(x.hired / x.need * 100)) : 0;
      return '<div class="an-list-row"><span>' + esc(x.d.name) + '</span><span class="ab"><i style="width:' + p + '%;background:' + x.d.color + '"></i></span><span class="av">' + x.hired + '/' + x.need + '</span></div>';
    }).join('') + '</div></div></div></div>';
    main.innerHTML = h;
  }
});

UI.act['board-add'] = function () { openJobForm(null); };
UI.act['board-edit'] = function (el, e) { if (e) e.stopPropagation(); openJobForm(jobById(el.getAttribute('data-jid'))); };
UI.act['board-job'] = function (el) { openJob(jobById(el.getAttribute('data-jid'))); };
UI.act['board-toggle'] = function (el, e) {
  if (e) e.stopPropagation();
  var j = jobById(el.getAttribute('data-jid')); if (!j) return;
  j.status = j.status === 'closed' ? 'open' : 'closed'; save(); UI.rerender(); UI.toast(j.status === 'closed' ? '已关闭职位' : '已重新开放');
};
UI.act['board-export'] = function () {
  var rows = [['职位', '部门', '需求人数', '已入职', '候选人数', '状态', '负责人', '薪资', '职级', '紧急度']];
  jobsWithStats().forEach(function (x) { rows.push([x.j.title, deptName(x.j.deptId), x.j.headcount, x.st.hired, x.st.total, x.j.status === 'closed' ? '已关闭' : '招聘中', x.j.owner, x.j.salary, x.j.level, x.j.urgency]); });
  downloadFile('招聘职位-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['board-go-resume'] = function (el) {
  var jid = el.getAttribute('data-jid');
  Resume.job = jid || 'all'; Resume.status = []; Resume.q = '';
  UI.closeDrawer(); UI.go('resume');
};

function openJob(j) {
  if (!j) return;
  var st = jobStats(j), list = candidatesOfJob(j.id);
  var stages = [['written', '笔试'], ['interview1', '初试'], ['interview2', '复试'], ['offer', 'Offer'], ['hired', '已入职'], ['rejected', '已淘汰']];
  var h = '<div class="dr-hero">' + '<div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:' + deptColor(j.deptId) + '22;color:' + deptColor(j.deptId) + ';font-weight:800;font-size:18px">' + esc(j.title.slice(0, 1)) + '</div>' +
    '<div><div class="dr-name">' + esc(j.title) + '<span class="urgency ' + j.urgency + '">' + j.urgency + '</span></div><div class="dr-meta">' + esc(deptName(j.deptId) + ' · ' + j.salary + ' · ' + (j.level || '') + ' · 负责人 ' + j.owner) + '</div></div>' +
    '<div class="dr-tools"><button class="btn btn-sm btn-light" data-act="board-edit" data-jid="' + j.id + '">' + ICON.edit + '编辑</button><button class="btn btn-sm btn-light" data-act="board-toggle" data-jid="' + j.id + '">' + (j.status === 'closed' ? '重新开放' : '关闭职位') + '</button><button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="tabs"><button class="on">职位详情</button></div><div class="drawer-body">';
  h += '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">需求 / 已入职</div><div class="v">' + st.hired + '<small>/' + j.headcount + '</small></div><div class="d">在流程 ' + (st.total - st.hired - (st.stages.rejected || 0)) + ' 人</div></div>' +
    '<div class="kpi"><div class="k">收到简历</div><div class="v">' + st.total + '<small>份</small></div><div class="d">待筛选 ' + list.filter(function (c) { return c.screen === 'new'; }).length + ' 份</div></div>' +
    '<div class="kpi"><div class="k">Offer</div><div class="v">' + (st.stages.offer || 0) + '<small>人</small></div><div class="d">已入职 ' + st.hired + ' 人</div></div>' +
    '<div class="kpi"><div class="k">已淘汰</div><div class="v">' + (st.stages.rejected || 0) + '<small>人</small></div><div class="d">含简历未通过</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>职位要求</h3><div class="emp-note">' + esc(j.desc) + '</div><div class="emp-note" style="margin-top:8px;color:var(--ink3)">' + esc(j.requirements) + '</div><div class="tags" style="margin-top:10px">' + (j.skills || []).map(function (s) { return '<span class="tag gray">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>候选人</h3>';
  stages.forEach(function (s) {
    var group = list.filter(function (c) { return c.stage === s[0]; });
    if (!group.length) return;
    h += '<div style="font-size:12.5px;color:var(--ink3);margin:10px 0 4px">' + s[1] + ' · ' + group.length + ' 人</div>' + group.map(function (c) { return '<div class="iv-mini" data-act="open-cand" data-cid="' + c.id + '" style="cursor:pointer"><span class="tm">' + matchRing(c.match.score, 30) + '</span><div style="flex:1"><div style="font-size:13px;font-weight:600">' + esc(c.name) + '</div><div class="muted" style="font-size:11.5px">' + esc(c.resume.degree + ' · ' + c.resume.school + ' · ' + c.resume.years + ' 年') + '</div></div>' + screenTag(c.screen) + '</div>'; }).join('');
  });
  if (!list.length) h += '<div class="empty">还没有候选人，去「简历筛选」添加或导入</div>';
  h += '</div><div style="display:flex;gap:8px;margin:4px 0 10px"><button class="btn btn-dark btn-sm" data-act="board-go-resume" data-jid="' + j.id + '">' + ICON.resume + '查看该职位简历</button><button class="btn btn-light btn-sm" data-act="resume-add">' + ICON.userplus + '添加候选人</button></div></div>';
  UI.drawer(h, true);
}

function openJobForm(j) {
  var isNew = !j;
  var d = j ? deepClone(j) : {
    id: uid('j'), title: '', deptId: S.departments[0] ? S.departments[0].id : '', headcount: 1, urgency: '中', salary: '10-20K', level: 'P4',
    owner: S.settings.hr.name, eduReq: '本科', expMin: 1, expMax: 3, skills: [], desc: '', requirements: '', status: 'open', city: S.settings.city, createdAt: todayStr()
  };
  var body = '<div class="row2"><div class="field"><label>职位名称<span class="req">*</span></label><input class="inp" id="jfTitle" value="' + esc(d.title) + '" autofocus></div><div class="field"><label>所属部门</label><select class="sel" id="jfDept">' + S.departments.map(function (x) { return '<option value="' + x.id + '"' + (d.deptId === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="row3"><div class="field"><label>招聘人数</label><input class="inp num" id="jfCount" type="number" min="1" value="' + d.headcount + '"></div><div class="field"><label>紧急度</label><select class="sel" id="jfUrgency">' + ['高', '中', '低'].map(function (x) { return '<option' + (d.urgency === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="field"><label>职级</label><input class="inp" id="jfLevel" value="' + esc(d.level) + '"></div></div>' +
    '<div class="row3"><div class="field"><label>薪资范围</label><input class="inp" id="jfSalary" value="' + esc(d.salary) + '" placeholder="如 20-35K"></div><div class="field"><label>学历要求</label><select class="sel" id="jfEdu">' + ['本科', '硕士', '大专', '不限'].map(function (x) { return '<option' + (d.eduReq === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="field"><label>负责人</label><input class="inp" id="jfOwner" value="' + esc(d.owner) + '"></div></div>' +
    '<div class="row2"><div class="field"><label>经验要求（年）</label><div style="display:flex;gap:8px;align-items:center"><input class="inp num" id="jfExpMin" type="number" min="0" value="' + d.expMin + '"><span class="muted">—</span><input class="inp num" id="jfExpMax" type="number" min="0" value="' + d.expMax + '"></div></div><div class="field"><label>技能关键词（用于匹配度）</label><input class="inp" id="jfSkills" value="' + esc((d.skills || []).join('、')) + '" placeholder="用顿号分隔"></div></div>' +
    '<div class="field"><label>职位描述</label><textarea class="ta" id="jfDesc" style="min-height:70px">' + esc(d.desc) + '</textarea></div>' +
    '<div class="field"><label>任职要求</label><textarea class="ta" id="jfReq" style="min-height:90px">' + esc(d.requirements) + '</textarea></div>';
  UI.modal({
    title: isNew ? '新增职位' : '编辑职位', body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="jf-save" data-new="' + (isNew ? 1 : 0) + '">保存</button>'
  });
  UI.modalCtx.job = d;
}
UI.act['jf-save'] = function (el) {
  var d = UI.modalCtx.job, isNew = el.getAttribute('data-new') === '1';
  d.title = $('#jfTitle').value.trim();
  if (!d.title) { $('#jfTitle').focus(); UI.toast('请填写职位名称'); return; }
  d.deptId = $('#jfDept').value; d.headcount = Math.max(1, +$('#jfCount').value || 1); d.urgency = $('#jfUrgency').value;
  d.level = $('#jfLevel').value.trim(); d.salary = $('#jfSalary').value.trim(); d.eduReq = $('#jfEdu').value; d.owner = $('#jfOwner').value.trim();
  d.expMin = Math.max(0, +$('#jfExpMin').value || 0); d.expMax = Math.max(d.expMin, +$('#jfExpMax').value || d.expMin);
  d.skills = $('#jfSkills').value.split(/[、,，;；\s]+/).filter(Boolean);
  d.desc = $('#jfDesc').value.trim(); d.requirements = $('#jfReq').value.trim();
  if (isNew) S.jobs.push(d); else Object.assign(jobById(d.id), d);
  save(); UI.closeModal(); UI.closeDrawer(); UI.rerender(); UI.toast(isNew ? '已创建职位' : '已保存');
};
