/* =========================================================
   员工花名册 · 搜索筛选、员工档案抽屉、转正 / 调岗 / 离职 / 开证明
   ========================================================= */
var Emp = { q: '', dept: 'all', status: 'active', sort: 'dept', dir: 1, tab: 'overview' };
function empFiltered() {
  var list = S.employees.filter(function (e) {
    if (Emp.status === 'active' && e.empStatus === 'left') return false;
    if (Emp.status === 'probation' && e.empStatus !== 'probation') return false;
    if (Emp.status === 'left' && e.empStatus !== 'left') return false;
    if (Emp.dept !== 'all' && e.deptId !== Emp.dept) return false;
    if (Emp.q) {
      var q = Emp.q.toLowerCase();
      if ((e.name + ' ' + e.no + ' ' + e.title + ' ' + e.phone + ' ' + e.email + ' ' + deptName(e.deptId)).toLowerCase().indexOf(q) < 0) return false;
    }
    return true;
  });
  list.sort(function (a, b) {
    if (Emp.sort === 'no') return String(a.no).localeCompare(String(b.no), 'zh', { numeric: true }) * Emp.dir;
    if (Emp.sort === 'name') return a.name.localeCompare(b.name, 'zh') * Emp.dir;
    if (Emp.sort === 'hire') return (a.hireDate < b.hireDate ? -1 : 1) * Emp.dir;
    var da = deptName(a.deptId), db = deptName(b.deptId);
    return (da.localeCompare(db, 'zh') || String(a.no).localeCompare(String(b.no), 'zh', { numeric: true })) * Emp.dir;
  });
  return list;
}
UI.register('employees', {
  render: function (main, opts) {
    if (opts && opts.dept && deptById(opts.dept)) Emp.dept = opts.dept;
    var hc = headcountStats(), list = empFiltered();
    var h = '<div class="page scroll emp-page"><div class="page-head"><div><h1 class="page-title">员工花名册</h1><div class="page-desc">在职 <b>' + hc.total + '</b> 人 · 试用期 <b>' + hc.probation + '</b> · 男 <b>' + hc.male + '</b> 女 <b>' + hc.female + '</b> · 平均司龄 <b>' + hc.avgTenure + '</b> 年</div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="emp-export">' + ICON.down + '导出名册</button><button class="btn btn-light" data-act="emp-import">' + ICON.up + '批量导入</button><button class="btn btn-dark" data-act="emp-add">' + ICON.userplus + '添加员工</button></div></div>';
    h += '<div class="filterbar"><input class="inp" placeholder="搜索姓名、工号、职位、手机号" value="' + esc(Emp.q) + '" data-inp="emp-q" style="width:280px">' +
      '<select class="sel" style="width:150px;height:34px" data-chg="emp-dept"><option value="all">全部部门</option>' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (Emp.dept === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select>' +
      '<div class="chips"><button class="' + (Emp.status === 'active' ? 'on' : '') + '" data-act="emp-status" data-v="active">全部在职</button><button class="' + (Emp.status === 'probation' ? 'on' : '') + '" data-act="emp-status" data-v="probation">试用期</button><button class="' + (Emp.status === 'left' ? 'on' : '') + '" data-act="emp-status" data-v="left">已离职</button></div>' +
      '<span class="muted" style="margin-left:auto;font-size:12.5px">共 ' + list.length + ' 人</span></div>';
    h += '<div class="tbl-wrap"><table class="tbl emp-table"><thead><tr><th class="sortable" data-act="emp-sort" data-k="no">工号' + (Emp.sort === 'no' ? (Emp.dir > 0 ? ' ↑' : ' ↓') : '') + '</th><th class="sortable" data-act="emp-sort" data-k="name">姓名' + (Emp.sort === 'name' ? (Emp.dir > 0 ? ' ↑' : ' ↓') : '') + '</th><th class="sortable" data-act="emp-sort" data-k="dept">部门' + (Emp.sort === 'dept' ? (Emp.dir > 0 ? ' ↑' : ' ↓') : '') + '</th><th>职位</th><th>职级</th><th>状态</th><th class="sortable" data-act="emp-sort" data-k="hire">入职日期' + (Emp.sort === 'hire' ? (Emp.dir > 0 ? ' ↑' : ' ↓') : '') + '</th><th>司龄</th><th>联系方式</th><th class="r"></th></tr></thead><tbody>';
    if (!list.length) h += '<tr><td colspan="10"><div class="empty">没有符合条件的员工</div></td></tr>';
    list.forEach(function (e) {
      var left = contractLeft(e);
      h += '<tr class="click" data-act="open-emp" data-eid="' + e.id + '"><td class="num muted">' + esc(e.no) + '</td>' +
        '<td><div class="nm">' + empAva(e, 28) + esc(e.name) + (e.id === S.settings.bossId ? '<span class="tag" style="height:18px;font-size:10.5px;margin-left:4px;background:#171717;color:#fff">Boss</span>' : '') + (isDeptLead(e) ? '<span class="tag amber" style="height:18px;font-size:10.5px;margin-left:4px">负责人</span>' : '') + '</div></td>' +
        '<td><span class="dept-cell"><i class="dot" style="background:' + deptColor(e.deptId) + '"></i>' + esc(deptName(e.deptId)) + '</span></td>' +
        '<td>' + esc(e.title) + '</td><td class="muted">' + esc(e.level || '') + '</td>' +
        '<td>' + (e.empStatus === 'probation' ? '<span class="tag blue">试用期</span>' : e.empStatus === 'left' ? '<span class="tag gray">已离职</span>' : '<span class="tag green">在职</span>') + '</td>' +
        '<td class="num">' + esc(e.hireDate) + '</td><td class="sub">' + tenureText(e.hireDate) + '</td>' +
        '<td class="num muted">' + esc(e.phone) + '</td>' +
        '<td class="r"><span class="ops"><button class="btn btn-xs btn-ghost" data-act="emp-edit" data-eid="' + e.id + '">编辑</button></span></td></tr>';
    });
    h += '</tbody></table></div></div>';
    main.innerHTML = h;
  }
});
UI.inp['emp-q'] = function (el) { Emp.q = el.value.trim(); UI.rerender(); };
UI.chg['emp-dept'] = function (el) { Emp.dept = el.value; UI.rerender(); };
UI.act['emp-status'] = function (el) { Emp.status = el.getAttribute('data-v'); UI.rerender(); };
UI.act['emp-sort'] = function (el) { var k = el.getAttribute('data-k'); if (Emp.sort === k) Emp.dir = -Emp.dir; else { Emp.sort = k; Emp.dir = 1; } UI.rerender(); };
UI.act['emp-add'] = function () { openEmployeeForm(null); };
UI.act['emp-edit'] = function (el, e) { if (e) e.stopPropagation(); openEmployeeForm(empById(el.getAttribute('data-eid'))); };
UI.act['emp-export'] = function () {
  var rows = [['工号', '姓名', '性别', '部门', '职位', '职级', '状态', '入职日期', '司龄', '手机号', '邮箱', '学历', '学校', '专业', '合同到期', '档案齐全度']];
  empFiltered().forEach(function (e) { var m = materialsOf(e); rows.push([e.no, e.name, e.gender === 'F' ? '女' : '男', deptName(e.deptId), e.title, e.level, e.empStatus === 'probation' ? '试用期' : e.empStatus === 'left' ? '已离职' : '在职', e.hireDate, tenureText(e.hireDate), e.phone, e.email, e.education, e.school, e.major, e.contractEnd, m.done + '/' + m.total]); });
  downloadFile('员工花名册-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['emp-import'] = function () { openEmployeeImport(); };

/* ---------- 员工档案抽屉 ---------- */
function openEmployee(eid, tab) {
  var e = empById(eid); if (!e) return;
  UI.hideCard(); UI.closePop();
  Emp.tab = tab || (UI.drawerSid === eid ? Emp.tab : 'overview');
  UI.drawerSid = eid;
  var tabs = [['overview', '概览'], ['attendance', '考勤'], ['performance', '绩效'], ['training', '培训'], ['profile', '档案'], ['contract', '合同与异动'], ['docs', '档案材料'], ['records', '记录']];
  var mat = materialsOf(e);
  var h = '<div class="dr-hero emp-drawer"><div>' + empAva(e, 76) + '</div><div style="min-width:0"><div class="dr-name">' + esc(e.name) + ' ' + (e.empStatus === 'probation' ? '<span class="tag blue" style="font-size:11.5px">试用期</span>' : e.empStatus === 'left' ? '<span class="tag gray" style="font-size:11.5px">已离职</span>' : '<span class="tag green" style="font-size:11.5px">在职</span>') + '</div>' +
    '<div class="dr-meta">' + esc(e.no + ' · ' + deptName(e.deptId) + ' · ' + e.title + ' · ' + e.level + ' · ' + (e.gender === 'F' ? '女' : '男') + ' · ' + (ageOf(e.birthday) === null ? '年龄未填' : ageOf(e.birthday) + ' 岁')) + '</div>' +
    '<div class="tags" style="margin-top:8px">' + (e.id === S.settings.bossId ? '<span class="tag" style="background:#171717;color:#fff">Boss</span>' : '') + (isDeptLead(e) ? '<span class="tag amber">部门负责人</span>' : '') + (e.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + (isNewEmp(e) ? '<span class="tag blue">新人</span>' : '') + '</div></div>' +
    '<div class="dr-tools"><button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="emp-tools">' +
    (e.empStatus === 'probation' ? '<button class="btn btn-sm btn-dark" data-act="emp-regular" data-eid="' + e.id + '">' + ICON.check + '办理转正</button>' : '') +
    '<button class="btn btn-sm btn-light" data-act="emp-transfer" data-eid="' + e.id + '">' + ICON.refresh + '调岗调薪</button>' +
    '<button class="btn btn-sm btn-light" data-act="emp-offboard" data-eid="' + e.id + '">' + ICON.exit + '办理离职</button>' +
    '<button class="btn btn-sm btn-light" data-act="emp-proof" data-eid="' + e.id + '">' + ICON.doc + '开证明</button>' +
    (e.id === S.settings.bossId ? '<button class="btn btn-sm btn-light" data-act="emp-unset-boss" data-eid="' + e.id + '">Boss · 取消</button>' : '<button class="btn btn-sm btn-light" data-act="emp-set-boss" data-eid="' + e.id + '">' + ICON.star + '设为 Boss</button>') +
    '<button class="btn btn-sm btn-light" data-act="emp-edit" data-eid="' + e.id + '">' + ICON.edit + '编辑</button></div>';
  h += '<div class="tabs">' + tabs.map(function (t) { return '<button class="' + (Emp.tab === t[0] ? 'on' : '') + '" data-act="emp-tab" data-tab="' + t[0] + '" data-eid="' + e.id + '">' + t[1] + (t[0] === 'docs' ? '<span class="cnt">' + mat.done + '/' + mat.total + '</span>' : '') + '</button>'; }).join('') + '</div><div class="drawer-body" id="empBody"></div>';
  if (!$('#drawerHost .drawer')) UI.drawer(h, true); else $('#drawerHost .drawer').innerHTML = h;
  renderEmpBody(e);
}
UI.act['open-emp'] = function (el) { var sp = $('#gsearchPop'); if (sp) sp.innerHTML = ''; openEmployee(el.getAttribute('data-eid')); };
UI.act['emp-set-boss'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  S.settings.bossId = e.id; save();
  openEmployee(e.id);
  if (UI.page === 'office') refreshOffice();
  UI.toast(e.name + ' 已设为 Boss');
};
UI.act['emp-unset-boss'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  S.settings.bossId = ''; save();
  openEmployee(e.id);
  if (UI.page === 'office') refreshOffice();
  UI.toast('已取消 Boss');
};
UI.act['emp-tab'] = function (el) { Emp.tab = el.getAttribute('data-tab'); openEmployee(el.getAttribute('data-eid'), Emp.tab); };
function renderEmpBody(e) {
  var b = $('#empBody'); if (!b) return;
  var h = '', mat = materialsOf(e), tab = Emp.tab;
  if (tab === 'overview') {
    var pl = probationLeft(e), cl = contractLeft(e);
    h += '<div class="emp-kpis"><div class="kpi"><div class="k">司龄</div><div class="v">' + tenureText(e.hireDate) + '</div><div class="d">' + esc(e.hireDate) + ' 入职</div></div>' +
      '<div class="kpi"><div class="k">合同剩余</div><div class="v">' + (cl === null ? '—' : cl) + '<small>天</small></div><div class="d">' + esc(e.contractEnd) + ' 到期</div></div>' +
      '<div class="kpi"><div class="k">' + (e.empStatus === 'probation' ? '试用期剩余' : '试用期') + '</div><div class="v">' + (e.empStatus === 'probation' ? (pl === null ? '—' : pl) : '已转正') + (e.empStatus === 'probation' ? '<small>天</small>' : '') + '</div><div class="d">' + (e.empStatus === 'probation' ? esc(e.probationEnd) + ' 到期' : '—') + '</div></div>' +
      '<div class="kpi"><div class="k">档案材料</div><div class="v">' + mat.done + '<small>/' + mat.total + '</small></div><div class="d">' + (mat.missing.length ? '缺 ' + mat.missing.length + ' 项，去补' : '材料齐全') + '</div></div></div>';
    h += '<div class="emp-panel"><h3>基本信息</h3><div class="info-grid"><div class="k">部门 / 职位</div><div><i class="dot" style="background:' + deptColor(e.deptId) + ';margin-right:6px"></i>' + esc(deptName(e.deptId) + ' · ' + e.title + ' · ' + e.level) + '</div>' +
      '<div class="k">直属上级</div><div>' + esc(e.managerName || '—') + '</div>' +
      '<div class="k">学历</div><div>' + esc(e.education + ' · ' + e.school + ' · ' + e.major) + '</div>' +
      '<div class="k">联系方式</div><div><span class="num">' + esc(e.phone) + '</span> <span class="muted">' + esc(e.email) + '</span></div>' +
      '<div class="k">生日</div><div>' + (e.birthday ? esc(fmtMD(e.birthday)) + ' <span class="muted">' + (daysToBirthday(e.birthday) === 0 ? '就是今天' : daysToBirthday(e.birthday) + ' 天后') + '</span>' : '—') + '</div>' +
      '<div class="k">工作地点</div><div>' + esc(e.city || S.settings.city) + '</div></div></div>';
    var evs = recentEvents(e.id, 3);
    h += '<div class="emp-events"><h3 style="font-size:14px;margin:0 0 10px">最近异动</h3><div class="timeline">' + (evs.length ? evs.map(function (x) { return '<div class="tl-item"><div class="tl-top"><span class="num">' + esc(x.date) + (x.time ? ' ' + esc(x.time) : '') + '</span><span class="tag gray">' + esc(x.type) + '</span></div><div class="tl-txt">' + esc(x.text) + '</div></div>'; }).join('') : '<div class="muted" style="font-size:12.5px">暂无记录</div>') + '</div></div>';
    var myActs = activityEmpList(e.id).sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? 1 : -1; }).slice(0, 3);
    if (myActs.length) h += '<div class="emp-panel" style="margin:0 0 14px"><h3>最近活动</h3>' + myActs.map(function (a) { var s = (a.signups || []).filter(function (x) { return x.eid === e.id; })[0] || {}; return '<div class="att-ex-row" style="cursor:default"><span class="tag" style="background:' + activityTypeColor(a.type) + '1a;color:' + activityTypeColor(a.type) + '">' + esc(a.type) + '</span><div class="grow"><b>' + esc(a.title) + '</b><div class="muted">' + esc(a.date + ' · ' + (a.location || '')) + '</div></div><span class="tag ' + (s.status === 'checked' ? 'green' : s.status === 'absent' ? 'red' : 'blue') + '">' + ({ checked: '已签到', absent: '未参加', signed: '已报名' }[s.status] || '—') + '</span></div>'; }).join('') + '</div>';
    if (mat.missing.length) h += '<div class="emp-panel" style="margin-bottom:24px"><h3>待补材料</h3><div class="tags">' + mat.missing.map(function (d) { return '<span class="tag red">' + esc(d.name) + '</span>'; }).join('') + '</div><div style="margin-top:10px"><button class="btn btn-light btn-sm" data-act="emp-tab" data-tab="docs" data-eid="' + e.id + '">去补材料</button></div></div>';
  } else if (tab === 'attendance') {
    h = attendanceEmpHTML(e);
  } else if (tab === 'performance') {
    h = performanceEmpHTML(e);
  } else if (tab === 'training') {
    h = trainingEmpHTML(e);
  } else if (tab === 'profile') {
    h += '<div class="emp-panel" style="margin-top:18px"><h3>个人信息</h3><div class="info-grid"><div class="k">姓名</div><div>' + esc(e.name) + '</div><div class="k">工号</div><div class="num">' + esc(e.no) + '</div><div class="k">性别</div><div>' + (e.gender === 'F' ? '女' : '男') + '</div><div class="k">年龄</div><div>' + (ageOf(e.birthday) === null ? '—' : ageOf(e.birthday) + ' 岁') + '</div><div class="k">生日</div><div>' + (esc(e.birthday) || '—') + '</div><div class="k">手机号</div><div class="num">' + esc(e.phone) + '</div><div class="k">邮箱</div><div>' + esc(e.email) + '</div><div class="k">现居城市</div><div>' + esc(e.city || '—') + '</div><div class="k">住址</div><div>' + (esc(e.address) || '—') + '</div><div class="k">紧急联系人</div><div>' + (e.emergency && e.emergency.name ? esc(e.emergency.name + ' · ' + e.emergency.rel + ' · ' + e.emergency.phone) : '—') + '</div><div class="k">银行卡</div><div>' + (esc(e.bank) || '—') + '</div><div class="k">标签</div><div>' + ((e.tags || []).length ? e.tags.map(function (t) { return '<span class="tag" style="margin-right:4px">' + esc(t) + '</span>'; }).join('') : '—') + '</div><div class="k">备注</div><div>' + (esc(e.note) || '—') + '</div></div></div>';
    h += '<div class="emp-panel"><h3>教育背景</h3><div class="info-grid"><div class="k">最高学历</div><div>' + esc(e.education) + '</div><div class="k">学校</div><div>' + esc(e.school) + '</div><div class="k">专业</div><div>' + esc(e.major) + '</div></div></div>';
    h += '<div class="emp-panel"><h3>工作信息</h3><div class="info-grid"><div class="k">部门</div><div>' + esc(deptName(e.deptId)) + '</div><div class="k">职位 / 职级</div><div>' + esc(e.title + ' · ' + e.level) + '</div><div class="k">直属上级</div><div>' + esc(e.managerName || '—') + '</div><div class="k">入职日期</div><div class="num">' + esc(e.hireDate) + '</div><div class="k">试用期到期</div><div class="num">' + esc(e.probationEnd) + '</div><div class="k">合同到期</div><div class="num">' + esc(e.contractEnd) + '</div><div class="k">月薪</div><div class="num">' + (e.salary ? (e.salary / 1000) + 'K' : '—') + '</div></div></div>';
    h += '<div style="text-align:right;padding:4px 0 10px"><button class="btn btn-dark" data-act="emp-edit" data-eid="' + e.id + '">' + ICON.edit + '编辑档案</button></div>';
  } else if (tab === 'contract') {
    var cl = contractLeft(e);
    h += '<div class="emp-panel" style="margin-top:18px"><h3>劳动合同</h3><div class="info-grid"><div class="k">合同类型</div><div>固定期限劳动合同</div><div class="k">合同开始</div><div class="num">' + esc(e.hireDate) + '</div><div class="k">合同到期</div><div class="num">' + esc(e.contractEnd) + '</div><div class="k">剩余天数</div><div><b class="num">' + (cl === null ? '—' : cl) + '</b> 天 ' + (cl !== null && cl <= 30 ? '<span class="tag red">即将到期</span>' : '') + '</div><div class="k">试用期</div><div class="num">' + esc(e.probationEnd) + '</div></div><div style="margin-top:12px"><button class="btn btn-light btn-sm" data-act="emp-renew" data-eid="' + e.id + '">' + ICON.refresh + '续签合同</button></div></div>';
    var evs = recentEvents(e.id, 99);
    h += '<div class="emp-events"><h3 style="font-size:14px;margin:0 0 10px">异动记录</h3><div class="timeline">' + (evs.length ? evs.map(function (x) { return '<div class="tl-item"><div class="tl-top"><span class="num">' + esc(x.date) + (x.time ? ' ' + esc(x.time) : '') + '</span><span class="tag gray">' + esc(x.type) + '</span></div><div class="tl-txt">' + esc(x.text) + '</div></div>'; }).join('') : '<div class="muted" style="font-size:12.5px">暂无记录</div>') + '</div><div style="margin-top:10px"><button class="btn btn-light btn-sm" data-act="emp-event-add" data-eid="' + e.id + '">' + ICON.plus + '添加异动记录</button></div></div>';
  } else if (tab === 'docs') {
    h += '<div class="emp-panel" style="margin-top:18px"><h3>档案材料 <span class="muted" style="font-weight:400;font-size:12px">' + mat.done + '/' + mat.total + ' · 整体齐全度 ' + Math.round(mat.rate * 100) + '%</span></h3><div class="doc-grid">' + S.settings.docTypes.map(function (d) {
      var ok = !!e.materials[d.id], doc = S.documents.filter(function (x) { return x.eid === e.id && x.docType === d.id; })[0];
      return '<div class="doc-item' + (ok ? '' : ' miss') + '"><span class="di">' + (ok ? ICON.check : ICON.x) + '</span><div class="dn">' + esc(d.name) + '<small>' + (ok ? (doc ? doc.name : '已核验') : '待上传') + '</small></div>' + (ok ? '<button data-act="emp-doc-preview" data-id="' + (doc ? doc.id : '') + '">预览</button>' : '<button data-act="emp-doc-upload" data-eid="' + e.id + '" data-doc="' + d.id + '">上传</button>') + '</div>';
    }).join('') + '</div></div>';
    h += '<div class="emp-panel"><h3>材料说明</h3><div class="muted" style="font-size:12.5px;line-height:1.8">材料清单可以在「设置 → 人事规则」里调整。红色为缺失，补齐后会记入员工档案和文件柜。所有文件只保存在本机浏览器里。</div></div>';
  } else if (tab === 'records') {
    h += '<div class="emp-panel" style="margin-top:18px"><h3>新增记录</h3><div class="row3" style="grid-template-columns:120px 150px 1fr"><div class="field"><label>类型</label><select class="sel" id="erType"><option>沟通</option><option>表扬</option><option>提醒</option><option>调岗</option><option>其他</option></select></div><div class="field"><label>日期</label><input class="inp" type="date" id="erDate" value="' + todayStr() + '"></div><div class="field"><label>内容</label><input class="inp" id="erText" placeholder="例如：沟通了转正目标，确认下季度重点"></div></div><div style="text-align:right"><button class="btn btn-dark btn-sm" data-act="emp-record-add" data-eid="' + e.id + '">添加记录</button></div></div>';
    var evs2 = recentEvents(e.id, 99);
    h += '<div class="emp-events"><h3 style="font-size:14px;margin:0 0 10px">员工记录</h3><div class="timeline">' + (evs2.length ? evs2.map(function (x) { return '<div class="tl-item"><div class="tl-top"><span class="num">' + esc(x.date) + (x.time ? ' ' + esc(x.time) : '') + '</span><span class="tag gray">' + esc(x.type) + '</span><button class="del" data-act="emp-event-del" data-id="' + x.id + '" data-eid="' + e.id + '">删除</button></div><div class="tl-txt">' + esc(x.text) + '</div></div>'; }).join('') : '<div class="muted" style="font-size:12.5px">暂无记录</div>') + '</div></div>';
  }
  b.innerHTML = h;
}

/* ---------- 抽屉动作 ---------- */
UI.act['emp-regular'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.confirm('办理转正', '确认「' + esc(e.name) + '」通过试用期，转为正式员工？', '确认转正', function () {
    e.empStatus = 'active'; e.regularDate = todayStr(); addEvent(e.id, '转正', '试用期通过，转正为' + e.title, todayStr());
    save(); openEmployee(e.id, 'overview'); UI.refreshSide(); UI.toast(e.name + ' 已转正');
  });
};
UI.act['emp-renew'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.confirm('续签合同', '合同到期日将从 ' + esc(e.contractEnd) + ' 延长 3 年，确认续签？', '确认续签', function () {
    e.contractEnd = addDays(addMonths(e.contractEnd, 36), -1);
    addEvent(e.id, '续签合同', '劳动合同续签至 ' + e.contractEnd, todayStr());
    S.documents.push({ id: uid('doc'), cat: 'contract', name: e.name + '-劳动合同续签.pdf', eid: e.id, docType: 'contract', size: 220000, at: todayStr(), expireAt: e.contractEnd });
    save(); openEmployee(e.id, 'contract'); UI.toast('合同已续签');
  });
};
UI.act['emp-event-add'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.modal({ title: '添加异动记录', body: '<div class="row3"><div class="field"><label>类型</label><select class="sel" id="eeType"><option>调岗</option><option>调薪</option><option>晋升</option><option>续签合同</option><option>其他</option></select></div><div class="field"><label>日期</label><input class="inp" type="date" id="eeDate" value="' + todayStr() + '"></div><div class="field"><label>内容</label><input class="inp" id="eeText" placeholder="写清楚变化"></div></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ee-save" data-eid="' + e.id + '">保存</button>' });
};
UI.act['ee-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')), t = $('#eeText').value.trim(); if (!e || !t) { UI.toast('请填写内容'); return; }
  addEvent(e.id, $('#eeType').value, t, $('#eeDate').value || todayStr()); save(); UI.closeModal(); openEmployee(e.id, 'contract'); UI.toast('已添加');
};
UI.act['emp-event-del'] = function (el) { S.events = S.events.filter(function (x) { return x.id !== el.getAttribute('data-id'); }); save(); openEmployee(el.getAttribute('data-eid'), 'records'); };
UI.act['emp-record-add'] = function (el) {
  var e = empById(el.getAttribute('data-eid')), t = $('#erText').value.trim(); if (!e || !t) { $('#erText').focus(); return; }
  addEvent(e.id, $('#erType').value, t, $('#erDate').value || todayStr()); save(); openEmployee(e.id, 'records'); UI.toast('已记录');
};
