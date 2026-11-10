/* =========================================================
   员工 · 添加 / 编辑 / 导入、调岗调薪、离职、开证明、材料上传
   ========================================================= */
function openEmployeeForm(e) {
  var isNew = !e;
  var d = e ? deepClone(e) : {
    id: uid('e'), no: nextEmpNo(), name: '', gender: 'M', deptId: S.departments[0] ? S.departments[0].id : '', title: '', level: 'P3',
    managerName: '', empStatus: 'probation', hireDate: todayStr(), probationEnd: addMonths(todayStr(), S.settings.probationMonths),
    contractEnd: addDays(addMonths(todayStr(), 36), -1), birthday: '', phone: '', email: '', education: '本科', school: '', major: '',
    city: S.settings.city, salary: 10000, materials: {}, tags: ['新人'], note: '', emergency: { name: '', rel: '父母', phone: '' }, address: '', bank: ''
  };
  if (isNew) S.settings.docTypes.forEach(function (x) { d.materials[x.id] = false; });
  var body = '<div class="row3"><div class="field"><label>姓名<span class="req">*</span></label><input class="inp" id="efName" value="' + esc(d.name) + '" autofocus></div><div class="field"><label>工号</label><input class="inp num" id="efNo" value="' + esc(d.no) + '"></div><div class="field"><label>性别</label><div class="seg light" id="efGender"><button type="button" class="' + (d.gender !== 'F' ? 'on' : '') + '" data-act="ef-gender" data-g="M">男</button><button type="button" class="' + (d.gender === 'F' ? 'on' : '') + '" data-act="ef-gender" data-g="F">女</button></div></div></div>' +
    '<div class="row3"><div class="field"><label>部门</label><select class="sel" id="efDept">' + S.departments.map(function (x) { return '<option value="' + x.id + '"' + (d.deptId === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div><div class="field"><label>职位</label><input class="inp" id="efTitle" value="' + esc(d.title) + '"></div><div class="field"><label>职级</label><input class="inp" id="efLevel" value="' + esc(d.level) + '"></div></div>' +
    '<div class="row3"><div class="field"><label>直属上级</label><input class="inp" id="efManager" value="' + esc(d.managerName || '') + '"></div><div class="field"><label>员工状态</label><select class="sel" id="efStatus"><option value="probation"' + (d.empStatus === 'probation' ? ' selected' : '') + '>试用期</option><option value="active"' + (d.empStatus === 'active' ? ' selected' : '') + '>在职</option><option value="left"' + (d.empStatus === 'left' ? ' selected' : '') + '>已离职</option></select></div><div class="field"><label>月薪（元）</label><input class="inp num" id="efSalary" type="number" value="' + (d.salary || '') + '"></div></div>' +
    '<div class="row3"><div class="field"><label>入职日期</label><input class="inp" type="date" id="efHire" value="' + esc(d.hireDate) + '"></div><div class="field"><label>试用期到期</label><input class="inp" type="date" id="efProbation" value="' + esc(d.probationEnd) + '"></div><div class="field"><label>合同到期</label><input class="inp" type="date" id="efContract" value="' + esc(d.contractEnd) + '"></div></div>' +
    '<div class="row3"><div class="field"><label>生日</label><input class="inp" type="date" id="efBirthday" value="' + esc(d.birthday) + '"></div><div class="field"><label>手机号</label><input class="inp num" id="efPhone" value="' + esc(d.phone) + '"></div><div class="field"><label>邮箱</label><input class="inp" id="efEmail" value="' + esc(d.email) + '"></div></div>' +
    '<div class="row3"><div class="field"><label>学历</label><select class="sel" id="efEdu">' + ['博士', '硕士', '本科', '大专', '高中'].map(function (x) { return '<option' + (d.education === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="field"><label>学校</label><input class="inp" id="efSchool" value="' + esc(d.school) + '"></div><div class="field"><label>专业</label><input class="inp" id="efMajor" value="' + esc(d.major) + '"></div></div>' +
    '<div class="row2"><div class="field"><label>现居城市</label><input class="inp" id="efCity" value="' + esc(d.city) + '"></div><div class="field"><label>标签</label><input class="inp" id="efTags" value="' + esc((d.tags || []).join('、')) + '" placeholder="用顿号分隔"></div></div>' +
    '<div class="field"><label>备注</label><textarea class="ta" id="efNote" style="min-height:70px">' + esc(d.note) + '</textarea></div>';
  UI.modal({
    title: isNew ? '添加员工' : '编辑员工 · ' + esc(e.name), body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ef-save" data-new="' + (isNew ? 1 : 0) + '">保存</button>'
  });
  UI.modalCtx.emp = d;
}
UI.act['ef-gender'] = function (el) { UI.modalCtx.emp.gender = el.getAttribute('data-g'); $$('#efGender button').forEach(function (b) { b.classList.toggle('on', b === el); }); };
UI.act['ef-save'] = function (el) {
  var d = UI.modalCtx.emp, isNew = el.getAttribute('data-new') === '1';
  d.name = $('#efName').value.trim(); if (!d.name) { $('#efName').focus(); UI.toast('请填写姓名'); return; }
  d.no = $('#efNo').value.trim() || nextEmpNo();
  d.deptId = $('#efDept').value; d.title = $('#efTitle').value.trim(); d.level = $('#efLevel').value.trim(); d.managerName = $('#efManager').value.trim();
  d.empStatus = $('#efStatus').value; d.salary = +$('#efSalary').value || 0;
  d.hireDate = $('#efHire').value || todayStr(); d.probationEnd = $('#efProbation').value; d.contractEnd = $('#efContract').value;
  d.birthday = $('#efBirthday').value; d.phone = $('#efPhone').value.trim(); d.email = $('#efEmail').value.trim();
  d.education = $('#efEdu').value; d.school = $('#efSchool').value.trim(); d.major = $('#efMajor').value.trim();
  d.city = $('#efCity').value.trim(); d.tags = $('#efTags').value.split(/[、,，;；\s]+/).filter(Boolean); d.note = $('#efNote').value.trim();
  if (isNew) { S.employees.push(d); addEvent(d.id, '入职', '入职' + deptName(d.deptId) + ' · ' + d.title, d.hireDate); }
  else {
    var old = empById(d.id); Object.assign(old, d);
    if (old.empStatus === 'left' && !old.leftDate) old.leftDate = todayStr();
  }
  save(); UI.closeModal(); UI.refreshSide(); UI.toast(isNew ? '已添加 ' + d.name : '已保存');
  if (UI.page === 'employees') UI.rerender();
  if (UI.drawerSid === d.id) openEmployee(d.id, Emp.tab);
};

/* ---------- 批量导入 ---------- */
var EMP_COLS = [
  ['no', ['工号', '编号']], ['name', ['姓名', '名字']], ['gender', ['性别']], ['dept', ['部门', '所属部门']],
  ['title', ['职位', '岗位']], ['level', ['职级']], ['status', ['状态', '员工状态']], ['hire', ['入职日期', '入职时间', '入职']],
  ['phone', ['手机号', '电话', '手机']], ['email', ['邮箱', '邮件']], ['edu', ['学历']], ['school', ['学校', '院校']],
  ['major', ['专业']], ['salary', ['月薪', '薪资']], ['birthday', ['生日', '出生日期']], ['manager', ['上级', '直属上级']]
];
function openEmployeeImport() {
  UI.modal({
    title: '批量导入员工', wide: true,
    body: '<p style="margin:0 0 10px;color:var(--ink2);line-height:1.7;font-size:13px">从 Excel 复制员工名单（第一行是表头）粘贴到下面，或选择 CSV 文件。能识别：工号、姓名、性别、部门、职位、职级、状态、入职日期、手机号、邮箱、学历、学校、专业、月薪、生日、直属上级。只有「姓名」是必需的。</p>' +
      '<textarea class="ta" id="eiText" style="min-height:170px;font-family:var(--num);font-size:12.5px" placeholder="工号	姓名	性别	部门	职位	入职日期&#10;XH1044	张三	男	技术研发部	前端工程师	2026-11-10" data-inp="ei-preview"></textarea>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-top:10px"><label class="btn btn-light btn-sm" style="cursor:pointer">' + ICON.up + '选择 CSV 文件<input type="file" accept=".csv,.txt" hidden data-chg="ei-file"></label><button class="btn btn-ghost btn-sm" data-act="ei-template">下载模板</button><span class="muted" id="eiInfo" style="font-size:12.5px;margin-left:auto"></span></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ei-go">导入</button>'
  });
}
function eiParse() {
  var rows = parseTable($('#eiText').value);
  if (rows.length < 2) return { rows: [], map: {} };
  var head = rows[0].map(function (h) { return h.replace(/[（(][^）)]*[）)]/g, '').replace(/[\s*：:]/g, ''); }), map = {}, used = {};
  [0, 1].forEach(function (pass) {
    head.forEach(function (hd, i) {
      if (used[i] || !hd) return;
      EMP_COLS.forEach(function (col) {
        if (used[i] || map[col[0]] !== undefined) return;
        if (col[1].some(function (al) { return pass === 0 ? hd === al : hd.indexOf(al) >= 0; })) { map[col[0]] = i; used[i] = 1; }
      });
    });
  });
  return { rows: rows.slice(1), map: map };
}
UI.inp['ei-preview'] = function () {
  var r = eiParse(), info = $('#eiInfo');
  if (!r.rows.length) { info.textContent = ''; return; }
  if (r.map.name === undefined) { info.innerHTML = '<span class="dn">没找到「姓名」列</span>'; return; }
  info.textContent = '识别到 ' + r.rows.length + ' 名员工，' + Object.keys(r.map).length + ' 列信息';
};
UI.chg['ei-file'] = function (el) { var f = el.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { $('#eiText').value = rd.result; UI.inp['ei-preview'](); }; rd.readAsText(f, 'utf-8'); };
UI.act['ei-template'] = function () {
  downloadFile('员工导入模板.csv', toCSV([['工号', '姓名', '性别', '部门', '职位', '职级', '状态', '入职日期', '手机号', '邮箱', '学历', '学校', '专业', '月薪', '生日', '直属上级'], ['XH1044', '张三', '男', '技术研发部', '前端工程师', 'P4', '试用期', '2026-11-10', '13900000000', 'zhangsan@example.com', '本科', '浙江大学', '软件工程', '18000', '1998-01-01', '梁晨阳']]), 'text/csv;charset=utf-8');
};
UI.act['ei-go'] = function () {
  var r = eiParse(); if (r.map.name === undefined) { UI.toast('没有识别到「姓名」列'); return; }
  var depts = {}; S.departments.forEach(function (d) { depts[d.name] = d; });
  var added = 0;
  r.rows.forEach(function (row) {
    function g(k) { return r.map[k] !== undefined ? (row[r.map[k]] || '').trim() : ''; }
    var name = g('name').slice(0, 20); if (!name) return;
    var dept = depts[g('dept')] || S.departments[0];
    var hire = g('hire') || todayStr();
    var status = /试用/.test(g('status')) ? 'probation' : /离职/.test(g('status')) ? 'left' : 'active';
    var e = {
      id: uid('e'), no: g('no') || nextEmpNo(), name: name, gender: /女|f/i.test(g('gender')) ? 'F' : 'M', deptId: dept.id,
      title: g('title') || '员工', level: g('level') || 'P3', managerName: g('manager') || '', empStatus: status,
      hireDate: hire, probationEnd: addMonths(hire, S.settings.probationMonths), contractEnd: addDays(addMonths(hire, 36), -1),
      birthday: g('birthday'), phone: g('phone'), email: g('email'), education: g('edu') || '本科', school: g('school'), major: g('major'),
      city: S.settings.city, salary: +g('salary') || 0, materials: {}, tags: status === 'probation' ? ['新人'] : [], note: '',
      emergency: { name: '', rel: '父母', phone: '' }, address: '', bank: ''
    };
    S.settings.docTypes.forEach(function (d) { e.materials[d.id] = false; });
    S.employees.push(e); addEvent(e.id, '入职', '入职' + dept.name + ' · ' + e.title, hire); added++;
  });
  save(); UI.closeModal(); UI.rerender(); UI.refreshSide(); UI.toast('已导入 ' + added + ' 名员工');
};

/* ---------- 调岗调薪 ---------- */
UI.act['emp-transfer'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.modal({
    title: '调岗调薪 · ' + esc(e.name), wide: true,
    body: '<div class="row3"><div class="field"><label>类型</label><select class="sel" id="etType"><option>调岗</option><option>调薪</option><option>晋升</option></select></div><div class="field"><label>生效日期</label><input class="inp" type="date" id="etDate" value="' + todayStr() + '"></div><div class="field"><label>新部门</label><select class="sel" id="etDept">' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (e.deptId === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row3"><div class="field"><label>新职位</label><input class="inp" id="etTitle" value="' + esc(e.title) + '"></div><div class="field"><label>新职级</label><input class="inp" id="etLevel" value="' + esc(e.level) + '"></div><div class="field"><label>新月薪（元）</label><input class="inp num" id="etSalary" type="number" value="' + (e.salary || '') + '"></div></div>' +
      '<div class="field"><label>直属上级</label><input class="inp" id="etManager" value="' + esc(e.managerName || '') + '"></div>' +
      '<div class="field"><label>调整说明</label><textarea class="ta" id="etNote" placeholder="写清楚调整原因、新的职责范围"></textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="et-save" data-eid="' + e.id + '">保存调整</button>'
  });
};
UI.act['et-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var type = $('#etType').value, oldDept = deptName(e.deptId), oldTitle = e.title, oldLevel = e.level, oldSalary = e.salary;
  e.deptId = $('#etDept').value; e.title = $('#etTitle').value.trim(); e.level = $('#etLevel').value.trim(); e.managerName = $('#etManager').value.trim();
  e.salary = +$('#etSalary').value || e.salary;
  var text = type + '：' + oldDept + ' · ' + oldTitle + ' ' + oldLevel + ' → ' + deptName(e.deptId) + ' · ' + e.title + ' ' + e.level + (oldSalary !== e.salary ? '，月薪 ' + (oldSalary / 1000) + 'K → ' + (e.salary / 1000) + 'K' : '') + ($('#etNote').value.trim() ? '；' + $('#etNote').value.trim() : '');
  addEvent(e.id, type, text, $('#etDate').value || todayStr());
  save(); UI.closeModal(); openEmployee(e.id, 'contract'); UI.refreshSide(); UI.toast('已保存调整');
};

/* ---------- 办理离职 ---------- */
UI.act['emp-offboard'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var exists = S.offboarding.filter(function (x) { return x.eid === e.id; })[0];
  if (exists) { UI.closeDrawer(); UI.go('offboard'); return; }
  UI.modal({
    title: '办理离职 · ' + esc(e.name), wide: true,
    body: '<div class="row2"><div class="field"><label>最后工作日</label><input class="inp" type="date" id="eoLast" value="' + addDays(todayStr(), 30) + '"></div><div class="field"><label>离职类型</label><select class="sel" id="eoType"><option>主动离职</option><option>协商解除</option><option>合同到期</option><option>辞退</option></select></div></div>' +
      '<div class="field"><label>离职原因</label><select class="sel" id="eoReason">' + OFFBOARD_REASONS.map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>交接说明</label><textarea class="ta" id="eoNote" placeholder="交接人、未完成事项、资产归还等"></textarea></div>' +
      '<div class="muted" style="font-size:12.5px;line-height:1.7">保存后会进入「离职管理」，按 离职申请 → 工作交接 → 薪资结算 → 离职证明 四步办理；全部完成后员工状态才会变为已离职。</div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="eo-save" data-eid="' + e.id + '">发起离职</button>'
  });
};
UI.act['eo-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var ob = { id: uid('ob'), eid: e.id, applyDate: todayStr(), lastDay: $('#eoLast').value || addDays(todayStr(), 30), reason: $('#eoReason').value, type: $('#eoType').value, steps: { apply: true, handover: false, settle: false, cert: false }, note: $('#eoNote').value.trim() };
  S.offboarding.push(ob); addEvent(e.id, '离职申请', '提交离职申请，最后工作日 ' + ob.lastDay, todayStr());
  save(); UI.closeModal(); UI.closeDrawer(); UI.refreshSide(); UI.go('offboard'); UI.toast('已发起离职办理');
};

/* ---------- 开证明 ---------- */
var PROOF_TYPES = ['在职证明', '收入证明', '离职证明', '实习证明'];
UI.act['emp-proof'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  UI.modal({
    title: '开证明 · ' + esc(e.name), wide: true,
    body: '<div class="row3"><div class="field"><label>证明类型</label><select class="sel" id="epType" data-chg="ep-type">' + PROOF_TYPES.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div><div class="field"><label>用途</label><input class="inp" id="epUse" value="办理签证"></div><div class="field"><label>日期</label><input class="inp" type="date" id="epDate" value="' + todayStr() + '"></div></div>' +
      '<div class="field"><label>证明内容（可修改）</label><textarea class="ta" id="epText" style="min-height:220px;font-size:13px;line-height:1.9"></textarea></div>',
    foot: '<button class="btn btn-ghost" data-act="ep-copy" style="margin-right:auto">复制</button><button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ep-save" data-eid="' + e.id + '">保存到文件柜</button>'
  });
  UI.modalCtx.proof = e;
  $('#epText').value = proofText(e, '在职证明', '办理签证', todayStr());
};
function proofText(e, type, use, date) {
  var d = parseDate(date) || new Date(), ds = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  var head = S.settings.company + '\n\n';
  if (type === '收入证明') return head + '收入证明\n\n兹证明 ' + e.name + '（身份证号：________）系我公司员工，' + ds + ' 至今在我公司' + deptName(e.deptId) + '担任' + e.title + '，税前月收入约为人民币 ' + (e.salary || 0) + ' 元。\n\n本证明仅用于' + use + '，不作其他用途。\n\n特此证明。\n\n' + S.settings.company + '（盖章）\n' + ds;
  if (type === '离职证明') return head + '离职证明\n\n兹证明 ' + e.name + '（工号 ' + e.no + '）原系我公司' + deptName(e.deptId) + '员工，担任' + e.title + '，于 ' + e.hireDate + ' 入职，最后工作日为 ________。\n\n双方劳动关系自最后工作日起解除，工作交接及薪资结算已按公司规定办理。\n\n特此证明。\n\n' + S.settings.company + '（盖章）\n' + ds;
  if (type === '实习证明') return head + '实习证明\n\n兹证明 ' + e.name + ' 于 ' + e.hireDate + ' 起在我公司' + deptName(e.deptId) + '实习，担任' + e.title + '，实习期间表现良好。\n\n特此证明。\n\n' + S.settings.company + '（盖章）\n' + ds;
  return head + '在职证明\n\n兹证明 ' + e.name + '（工号 ' + e.no + '）系我公司正式员工，于 ' + e.hireDate + ' 入职，目前在' + deptName(e.deptId) + '担任' + e.title + '。\n\n本证明仅用于' + use + '，不作其他用途。\n\n特此证明。\n\n' + S.settings.company + '（盖章）\n' + ds;
}
UI.chg['ep-type'] = function (el) { var e = UI.modalCtx.proof; if (e) $('#epText').value = proofText(e, el.value, $('#epUse').value || '办理相关事务', $('#epDate').value || todayStr()); };
UI.act['ep-copy'] = function () { copyText($('#epText').value); };
UI.act['ep-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')); if (!e) return;
  var type = $('#epType').value, text = $('#epText').value;
  S.documents.push({ id: uid('doc'), cat: 'generated', name: e.name + '-' + type + '-' + todayStr() + '.txt', eid: e.id, docType: 'generated', size: text.length * 2, at: todayStr(), expireAt: '', content: text });
  save(); UI.closeModal(); UI.toast(type + '已保存到文件柜'); UI.refreshSide();
};

/* ---------- 档案材料上传 ---------- */
UI.act['emp-doc-upload'] = function (el) {
  var e = empById(el.getAttribute('data-eid')), docId = el.getAttribute('data-doc');
  var dt = S.settings.docTypes.filter(function (x) { return x.id === docId; })[0];
  if (!e || !dt) return;
  UI.modal({
    title: '上传材料 · ' + esc(dt.name), wide: false,
    body: '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--fill);margin-bottom:14px">' + empAva(e, 36) + '<div><b>' + esc(e.name) + '</b><div class="muted" style="font-size:12px">' + esc(deptName(e.deptId) + ' · ' + e.title) + '</div></div><span class="grow"></span><span class="tag red">缺 ' + esc(dt.name) + '</span></div>' +
      '<label class="btn btn-light" style="cursor:pointer;width:100%">' + ICON.upload + '选择文件<input type="file" id="edFile" hidden data-chg="ed-file"></label>' +
      '<div class="muted" id="edName" style="font-size:12px;margin-top:8px">支持图片、PDF、Word；文件只保存在本机浏览器里</div>' +
      '<div class="field" style="margin-top:14px"><label>材料名称</label><input class="inp" id="edTitle" value="' + esc(e.name + '-' + dt.name) + '"></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ed-save" data-eid="' + e.id + '" data-doc="' + dt.id + '">保存</button>'
  });
  UI.modalCtx.docFile = null;
};
UI.chg['ed-file'] = function (el) {
  var f = el.files[0]; if (!f) return;
  UI.modalCtx.docFile = f;
  var name = $('#edName'); if (name) name.textContent = f.name + ' · ' + docFileSize(f.size);
  var title = $('#edTitle'); if (title) title.value = f.name;
};
UI.act['ed-save'] = function (el) {
  var e = empById(el.getAttribute('data-eid')), docId = el.getAttribute('data-doc');
  var f = UI.modalCtx.docFile, title = $('#edTitle').value.trim() || (e.name + '-' + (DOC_NAMES[docId] || '材料'));
  var doc = { id: uid('doc'), cat: 'material', name: title, eid: e.id, docType: docId, size: f ? f.size : 120000, at: todayStr(), expireAt: '' };
  if (f && f.size <= 250000) {
    var rd = new FileReader();
    rd.onload = function () { doc.data = rd.result; finish(); };
    rd.readAsDataURL(f);
    return;
  }
  finish();
  function finish() {
    e.materials[docId] = true;
    S.documents.push(doc);
    addEvent(e.id, '档案', '补齐材料：' + (DOC_NAMES[docId] || ''), todayStr());
    save(); UI.closeModal(); openEmployee(e.id, 'docs'); UI.refreshSide(); UI.toast('材料已上传');
  }
};
UI.act['emp-doc-preview'] = function (el) {
  var doc = S.documents.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
  if (!doc) { UI.toast('这份材料没有附件，已核验'); return; }
  openDocPreview(doc);
};
