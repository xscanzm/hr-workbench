/* =========================================================
   简历筛选 · 添加 / 编辑 / 批量导入 / 匹配规则 / 发送通知
   ========================================================= */
function openCandidateForm(c) {
  if (!S.jobs.length) { UI.toast('先在「招聘看板」里创建一个职位'); return; }
  var isNew = !c;
  var d = c ? deepClone(c) : {
    id: uid('c'), name: '', gender: 'M', phone: '', email: '', jobId: S.jobs[0].id,
    deptId: S.jobs[0].deptId, source: 'Boss直聘', appliedAt: todayStr(), screen: 'new', stage: 'written',
    resume: { degree: '本科', school: '', major: '', years: 1, currentCompany: '', currentTitle: '', expected: '10K', expectedNum: 10, city: '广州', availability: '在职·一个月内', skills: [], summary: '', workList: [], eduList: [] },
    match: { score: 0, parts: { edu: { v: 0, max: 20, note: '' }, exp: { v: 0, max: 25, note: '' }, skill: { v: 0, max: 30, note: '' }, salary: { v: 0, max: 15, note: '' }, school: { v: 0, max: 10, note: '' } } },
    scores: { resume: null, written: null, rounds: [], adjust: 0 }, tags: [], note: '', star: 0
  };
  var body = '<div class="row3"><div class="field"><label>姓名<span class="req">*</span></label><input class="inp" id="cfName" value="' + esc(d.name) + '" autofocus></div>' +
    '<div class="field"><label>性别</label><div class="seg light" id="cfGender"><button type="button" class="' + (d.gender !== 'F' ? 'on' : '') + '" data-act="cf-gender" data-g="M">男</button><button type="button" class="' + (d.gender === 'F' ? 'on' : '') + '" data-act="cf-gender" data-g="F">女</button></div></div>' +
    '<div class="field"><label>应聘职位</label><select class="sel" id="cfJob">' + S.jobs.map(function (j) { return '<option value="' + j.id + '"' + (d.jobId === j.id ? ' selected' : '') + '>' + esc(j.title) + ' · ' + esc(deptName(j.deptId)) + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="row3"><div class="field"><label>电话</label><input class="inp num" id="cfPhone" value="' + esc(d.phone) + '"></div><div class="field"><label>邮箱</label><input class="inp" id="cfEmail" value="' + esc(d.email) + '"></div><div class="field"><label>来源</label><select class="sel" id="cfSource">' + SOURCES.map(function (s) { return '<option' + (d.source === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="row3"><div class="field"><label>学历</label><select class="sel" id="cfDegree">' + ['博士', '硕士', '本科', '大专', '高中'].map(function (x) { return '<option' + (d.resume.degree === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="field"><label>学校</label><input class="inp" id="cfSchool" value="' + esc(d.resume.school) + '"></div><div class="field"><label>专业</label><input class="inp" id="cfMajor" value="' + esc(d.resume.major) + '"></div></div>' +
    '<div class="row3"><div class="field"><label>工作年限</label><input class="inp num" id="cfYears" type="number" min="0" max="40" value="' + d.resume.years + '"></div><div class="field"><label>期望薪资</label><input class="inp" id="cfExpected" value="' + esc(d.resume.expected) + '" placeholder="如 10K"></div><div class="field"><label>求职状态</label><input class="inp" id="cfAvail" value="' + esc(d.resume.availability) + '"></div></div>' +
    '<div class="field"><label>技能标签</label><input class="inp" id="cfSkills" value="' + esc((d.resume.skills || []).join('、')) + '" placeholder="用顿号或逗号分隔"></div>' +
    '<div class="field"><label>简历摘要</label><textarea class="ta" id="cfSummary" style="min-height:90px">' + esc(d.resume.summary) + '</textarea></div>' +
    '<div class="field"><label>备注</label><input class="inp" id="cfNote" value="' + esc(d.note || '') + '" placeholder="内推人、沟通情况等"></div>';
  UI.modal({
    title: isNew ? '添加简历' : '编辑简历 · ' + esc(c.name), body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="cf-save" data-new="' + (isNew ? 1 : 0) + '">保存</button>'
  });
  UI.modalCtx.cand = d;
}
UI.act['cf-gender'] = function (el) { UI.modalCtx.cand.gender = el.getAttribute('data-g'); $$('#cfGender button').forEach(function (b) { b.classList.toggle('on', b === el); }); };
UI.act['cf-save'] = function (el) {
  var d = UI.modalCtx.cand, isNew = el.getAttribute('data-new') === '1';
  d.name = $('#cfName').value.trim();
  if (!d.name) { $('#cfName').focus(); UI.toast('请填写姓名'); return; }
  d.phone = $('#cfPhone').value.trim(); d.email = $('#cfEmail').value.trim();
  d.jobId = $('#cfJob').value; d.deptId = (jobById(d.jobId) || {}).deptId || d.deptId;
  d.source = $('#cfSource').value;
  d.resume.degree = $('#cfDegree').value; d.resume.school = $('#cfSchool').value.trim(); d.resume.major = $('#cfMajor').value.trim();
  d.resume.years = Math.max(0, +$('#cfYears').value || 0);
  d.resume.expected = $('#cfExpected').value.trim();
  var num = parseFloat(String(d.resume.expected).replace(/[^\d.]/g, '')) || 10;
  d.resume.expectedNum = num;
  d.resume.availability = $('#cfAvail').value.trim();
  d.resume.skills = $('#cfSkills').value.split(/[、,，;；\s]+/).filter(Boolean);
  d.resume.summary = $('#cfSummary').value.trim();
  d.note = $('#cfNote').value.trim();
  d.tags = d.resume.skills.slice(0, 4);
  var job = jobById(d.jobId);
  if (job) {
    d.match = demoMatch(d, job);
    if (!d.scores.resume) d.scores.resume = clamp(Math.round(d.match.score * 0.82 + 8), 50, 98);
  }
  if (!d.resume.eduList || !d.resume.eduList.length) d.resume.eduList = [{ school: d.resume.school, major: d.resume.major, degree: d.resume.degree, start: '', end: '' }];
  if (!d.resume.workList || !d.resume.workList.length) d.resume.workList = [];
  if (isNew) S.candidates.push(d); else { var old = candById(d.id); Object.assign(old, d); }
  save(); UI.closeModal(); Resume.sel = d.id; Resume.status = isNew ? ['new'] : Resume.status; UI.go('resume'); UI.toast(isNew ? '已添加 ' + d.name : '已保存');
};

/* ---------- 批量导入 ---------- */
var RESUME_COLS = [
  ['name', ['姓名', '名字']], ['gender', ['性别']], ['phone', ['电话', '手机', '联系电话']], ['email', ['邮箱', '邮件']],
  ['job', ['应聘职位', '职位', '岗位']], ['source', ['来源', '渠道']], ['degree', ['学历']], ['school', ['学校', '院校']],
  ['major', ['专业']], ['years', ['年限', '工作年限', '经验']], ['expected', ['期望薪资', '期望']], ['skills', ['技能', '标签']], ['note', ['备注']]
];
function openResumeImport() {
  UI.modal({
    title: '批量导入简历', wide: true,
    body: '<p style="margin:0 0 10px;color:var(--ink2);line-height:1.7;font-size:13px">在 Excel 里选中简历表（第一行是表头），复制后粘贴到下面，也可以选择 CSV 文件。能识别：姓名、性别、电话、邮箱、应聘职位、来源、学历、学校、专业、年限、期望薪资、技能、备注，只有「姓名」和「应聘职位」是必需的。</p>' +
      '<textarea class="ta" id="riText" style="min-height:180px;font-family:var(--num);font-size:12.5px" placeholder="姓名	应聘职位	学历	学校	年限	期望薪资&#10;张三	高级前端工程师	本科	浙江大学	4	30K" data-inp="ri-preview"></textarea>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-top:10px"><label class="btn btn-light btn-sm" style="cursor:pointer">' + ICON.up + '选择 CSV 文件<input type="file" accept=".csv,.txt" hidden data-chg="ri-file"></label><button class="btn btn-ghost btn-sm" data-act="ri-template">下载模板</button><span class="muted" id="riInfo" style="font-size:12.5px;margin-left:auto"></span></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="ri-go">导入</button>'
  });
}
function riParse() {
  var rows = parseTable($('#riText').value);
  if (rows.length < 2) return { rows: [], map: {} };
  var head = rows[0].map(function (h) { return h.replace(/[（(][^）)]*[）)]/g, '').replace(/[\s*：:]/g, ''); }), map = {}, used = {};
  [0, 1].forEach(function (pass) {
    head.forEach(function (hd, i) {
      if (used[i] || !hd) return;
      RESUME_COLS.forEach(function (col) {
        if (used[i] || map[col[0]] !== undefined) return;
        if (col[1].some(function (al) { return pass === 0 ? hd === al : hd.indexOf(al) >= 0; })) { map[col[0]] = i; used[i] = 1; }
      });
    });
  });
  return { rows: rows.slice(1), map: map };
}
UI.inp['ri-preview'] = function () {
  var r = riParse(), info = $('#riInfo');
  if (!r.rows.length) { info.textContent = ''; return; }
  if (r.map.name === undefined) { info.innerHTML = '<span class="dn">没找到「姓名」列</span>'; return; }
  info.textContent = '识别到 ' + r.rows.length + ' 份简历，' + Object.keys(r.map).length + ' 列信息';
};
UI.chg['ri-file'] = function (el) { var f = el.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { $('#riText').value = rd.result; UI.inp['ri-preview'](); }; rd.readAsText(f, 'utf-8'); };
UI.act['ri-template'] = function () {
  downloadFile('简历导入模板.csv', toCSV([['姓名', '性别', '电话', '邮箱', '应聘职位', '来源', '学历', '学校', '专业', '年限', '期望薪资', '技能', '备注'], ['张三', '男', '13900000000', 'zhangsan@example.com', '高级前端工程师', 'Boss直聘', '本科', '浙江大学', '软件工程', '4', '30K', 'React、TypeScript', '']]), 'text/csv;charset=utf-8');
};
UI.act['ri-go'] = function () {
  var r = riParse();
  if (r.map.name === undefined) { UI.toast('没有识别到「姓名」列'); return; }
  var jobs = {};
  S.jobs.forEach(function (j) { jobs[j.title] = j; });
  var added = 0, skipped = 0;
  r.rows.forEach(function (row) {
    function g(k) { return r.map[k] !== undefined ? (row[r.map[k]] || '').trim() : ''; }
    var name = g('name').slice(0, 20); if (!name) return;
    var job = jobs[g('job')] || S.jobs.filter(function (j) { return g('job') && j.title.indexOf(g('job')) >= 0; })[0];
    if (!job) { skipped++; return; }
    var d = {
      id: uid('c'), name: name, gender: /女|f/i.test(g('gender')) ? 'F' : 'M',
      phone: g('phone'), email: g('email'), jobId: job.id, deptId: job.deptId, source: g('source') || 'Boss直聘',
      appliedAt: todayStr(), screen: 'new', stage: 'written',
      resume: {
        degree: g('degree') || '本科', school: g('school'), major: g('major'), years: Math.max(0, +g('years') || 0),
        currentCompany: '', currentTitle: '', expected: g('expected') || '面议', expectedNum: parseFloat(g('expected')) || 10,
        city: '广州', availability: '在职·一个月内', skills: g('skills').split(/[、,，;；\s]+/).filter(Boolean), summary: '', workList: [], eduList: []
      },
      match: null, scores: { resume: null, written: null, rounds: [], adjust: 0 }, tags: [], note: g('note'), star: 0
    };
    d.resume.eduList = [{ school: d.resume.school, major: d.resume.major, degree: d.resume.degree, start: '', end: '' }];
    d.match = demoMatch(d, job);
    d.tags = d.resume.skills.slice(0, 4);
    S.candidates.push(d); added++;
  });
  save(); UI.closeModal(); Resume.status = ['new']; UI.go('resume');
  UI.toast('导入 ' + added + ' 份简历' + (skipped ? '，' + skipped + ' 份没有匹配到职位已跳过' : ''));
};

/* ---------- 匹配规则 ---------- */
function openMatchRules() {
  var m = S.settings.match, g = S.settings.grade;
  var body = '<p style="margin:0 0 14px;color:var(--ink2);line-height:1.7;font-size:13px">匹配度 = 学历 + 经验 + 技能 + 薪资 + 院校，五项权重加起来建议为 100。修改后，新导入或新添加的简历会按新规则计算；已有简历可以点「重新计算」。</p>' +
    '<div class="row3"><div class="field"><label>学历</label><input class="inp num" id="mrEdu" type="number" value="' + m.edu + '"></div><div class="field"><label>经验</label><input class="inp num" id="mrExp" type="number" value="' + m.exp + '"></div><div class="field"><label>技能</label><input class="inp num" id="mrSkill" type="number" value="' + m.skill + '"></div></div>' +
    '<div class="row3"><div class="field"><label>薪资</label><input class="inp num" id="mrSalary" type="number" value="' + m.salary + '"></div><div class="field"><label>院校</label><input class="inp num" id="mrSchool" type="number" value="' + m.school + '"></div><div class="field"><label>合计</label><div class="inp num" id="mrSum" style="display:flex;align-items:center;background:var(--fill)">' + (m.edu + m.exp + m.skill + m.salary + m.school) + '</div></div></div>' +
    '<div class="hr"></div><div class="row3"><div class="field"><label>A 级分数线</label><input class="inp num" id="mrA" type="number" value="' + g.a + '"></div><div class="field"><label>B 级分数线</label><input class="inp num" id="mrB" type="number" value="' + g.b + '"></div><div class="field"><label>C 级分数线</label><input class="inp num" id="mrC" type="number" value="' + g.c + '"></div></div>' +
    '<div class="muted" style="font-size:12px">等级用于「综合成绩」：A 优先录用、B 可以录用、C 备选、D 不建议。</div>';
  UI.modal({
    title: '匹配规则', body: body, wide: true,
    foot: '<button class="btn btn-ghost" data-act="mr-recalc" style="margin-right:auto">按新规则重新计算</button><button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="mr-save">保存</button>'
  });
}
UI.act['mr-save'] = function () {
  var m = { edu: +$('#mrEdu').value || 0, exp: +$('#mrExp').value || 0, skill: +$('#mrSkill').value || 0, salary: +$('#mrSalary').value || 0, school: +$('#mrSchool').value || 0 };
  if (m.edu + m.exp + m.skill + m.salary + m.school !== 100) { UI.toast('五项权重合计需要等于 100'); return; }
  S.settings.match = m;
  S.settings.grade = { a: +$('#mrA').value || 80, b: +$('#mrB').value || 70, c: +$('#mrC').value || 60 };
  save(); UI.closeModal(); UI.toast('匹配规则已保存'); if (UI.page === 'resume') { Resume.renderFilters(); Resume.renderList(); } else UI.rerender();
};
UI.act['mr-recalc'] = function () {
  S.candidates.forEach(function (c) { var j = jobById(c.jobId); if (j) { c.match = demoMatch(c, j); if (c.scores.resume !== null) c.scores.resume = clamp(Math.round(c.match.score * 0.82 + 8), 50, 98); } });
  save(); UI.toast('已按新规则重新计算');
};

/* ---------- 发送通知 ---------- */
var Notify = { ids: [], type: 'screeningPass', channels: { sms: true, email: true }, sms: '', subject: '', body: '', saveDefault: false, preview: null, custom: {} };
var NOTIFY_LABEL = { screeningPass: '初筛通过', screeningReject: '初筛未通过', writtenInvite: '笔试邀请', interviewInvite: '面试邀请', offer: '录用通知', reject: '未录用通知' };
function notifyCandidates(ids, type) {
  var list = [];
  if (ids && ids.length) list = ids.map(candById).filter(Boolean);
  else list = S.notifications.filter(function (n) { return n.status === 'pending' && (!type || n.type === type); }).map(function (n) { return candById(n.cid); }).filter(Boolean);
  if (!list.length && type) list = S.candidates.filter(function (c) { return c.screen === 'passed' && c.stage !== 'rejected'; }).slice(0, 3);
  return list;
}
function openNotifyBatch(ids, type) {
  var list = notifyCandidates(ids, type);
  if (!list.length) { UI.toast('没有待发送的通知'); return; }
  if (!type) {
    var pend = S.notifications.filter(function (n) { return n.status === 'pending' && list.some(function (c) { return c.id === n.cid; }); });
    type = pend.length ? pend[0].type : (list[0].screen === 'rejected' ? 'screeningReject' : list[0].screen === 'passed' ? 'offer' : 'screeningPass');
  }
  Notify.ids = list.map(function (c) { return c.id; });
  Notify.type = type; Notify.preview = Notify.ids[0]; Notify.custom = {};
  Notify.ids.forEach(function (id) { var c = candById(id); if (c) addCandidateNotification(c, type, { 下一环节: '笔试' }); });
  var tpl = S.settings.templates[type] || S.settings.templates.screeningPass;
  Notify.sms = tpl.sms; Notify.subject = tpl.subject; Notify.body = tpl.body;
  Notify.channels = { sms: true, email: true };
  renderNotifyModal();
}
function renderNotifyModal() {
  var list = Notify.ids.map(candById).filter(Boolean), c = candById(Notify.preview) || list[0];
  var vars = notifyVars(c || {}, { 下一环节: Notify.type === 'screeningPass' ? '笔试' : '下一环节' });
  var sms = renderTpl(Notify.sms, vars), subject = renderTpl(Notify.subject, vars), body = renderTpl(Notify.body, vars);
  var custom = Notify.custom[c.id];
  if (custom) { sms = custom.sms; subject = custom.subject; body = custom.body; }
  var varList = ['姓名', '职位', '部门', '公司名称', '公司简称', '下一环节', '笔试时间', '笔试时长', '笔试方式', '笔试地点', '面试时间', '面试轮次', '面试地点', '面试官', '到岗日期', '回复截止', '薪资', '签名', 'HR'];
  var bodyHTML = '<div class="notify-modal"><div class="notify-form">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12.5px;color:var(--ink2)"><b style="color:var(--ink)">' + list.length + '</b> 位候选人 · <span>' + (Notify.channels.sms ? '1 条短信' : '') + (Notify.channels.sms && Notify.channels.email ? '、' : '') + (Notify.channels.email ? '1 封邮件' : '') + '</span><span class="grow"></span><span>发送渠道</span>' +
    '<button class="f-chip' + (Notify.channels.sms ? ' on' : '') + '" data-act="notify-channel" data-ch="sms">短信</button><button class="f-chip' + (Notify.channels.email ? ' on' : '') + '" data-act="notify-channel" data-ch="email">邮件</button></div>' +
    '<div class="field"><label>短信模板</label><textarea class="ta" id="ntSms" data-inp="notify-field" data-f="sms">' + esc(Notify.sms) + '</textarea><div class="hint">当前预览 ' + sms.length + ' 字 · 按 1 条计费</div></div>' +
    '<div class="field"><label>邮件主题</label><input class="inp" id="ntSubject" value="' + esc(Notify.subject) + '" data-inp="notify-field" data-f="subject"></div>' +
    '<div class="field"><label>邮件正文</label><textarea class="ta" id="ntBody" data-inp="notify-field" data-f="body" style="min-height:110px">' + esc(Notify.body) + '</textarea></div>' +
    '<div class="field"><label style="font-size:12.5px;font-weight:400;color:var(--ink3)">点一下插入到光标处</label><div class="var-chips">' + varList.map(function (v) { return '<button data-act="notify-var" data-v="' + v + '">{{' + v + '}}</button>'; }).join('') + '</div></div>' +
    '<label class="chk" style="font-size:12.5px"><input type="checkbox" id="ntSave"' + (Notify.saveDefault ? ' checked' : '') + ' data-chg="notify-save"> 改动保存为「' + NOTIFY_LABEL[Notify.type] + '」的默认模板</label>' +
    '</div><div class="notify-preview"><div class="np-phone"><div class="np-head">' + candAva(c, 30) + '<div>' + esc(c.name) + '<small>' + esc(c.phone + ' · ' + c.email) + '</small></div><span class="grow"></span><span class="tag gray">短信</span></div>' +
    '<div class="np-bubble">' + esc(sms) + '</div><div class="np-meta"><span>短信 ' + sms.length + ' 字 · 按 1 条计费</span><span style="margin-left:auto">' + esc(S.settings.short) + '</span></div>' +
    '<div class="np-actions"><button data-act="notify-copy">' + ICON.copy + '复制短信</button><button data-act="notify-smsapp">' + ICON.phone + '短信 App</button><button data-act="notify-mailapp">' + ICON.mail + '用邮件软件发</button><button data-act="notify-custom">' + ICON.edit + '单独修改</button></div></div>' +
    '<div class="np-mail"><div class="subj">' + esc(subject) + '</div><div class="body">' + esc(body) + '</div></div>' +
    (list.length > 1 ? '<div style="margin-top:10px;font-size:11.5px;color:var(--ink3);display:flex;gap:5px;flex-wrap:wrap">' + list.map(function (x) { return '<button class="f-chip' + (x.id === c.id ? ' on' : '') + '" data-act="notify-preview" data-cid="' + x.id + '" style="height:22px;font-size:11px">' + esc(x.name) + '</button>'; }).join('') + '</div>' : '') +
    '</div></div>';
  UI.modal({
    title: '发送通知 · ' + NOTIFY_LABEL[Notify.type], body: bodyHTML, wide: true, xwide: true, noFocus: true,
    foot: '<button class="btn btn-ghost" data-act="notify-copy">复制短信</button><button class="btn btn-light" data-act="notify-sent">全部标记为已通知</button><button class="btn btn-dark" data-act="notify-done">完成</button>'
  });
}
UI.inp['notify-field'] = function (el) {
  var f = el.getAttribute('data-f');
  Notify[f] = el.value;
  var c = candById(Notify.preview);
  if (c && Notify.custom[c.id]) { Notify.custom[c.id][f] = el.value; }
  // 只更新预览，避免输入时重建弹窗丢焦点
  var vars = notifyVars(c || {}, { 下一环节: '笔试' });
  var sms = renderTpl(Notify.sms, vars), subject = renderTpl(Notify.subject, vars), body = renderTpl(Notify.body, vars);
  var custom = c ? Notify.custom[c.id] : null;
  if (custom) { sms = custom.sms; subject = custom.subject; body = custom.body; }
  var bubble = $('.np-bubble'); if (bubble) bubble.textContent = sms;
  var subj = $('.np-mail .subj'); if (subj) subj.textContent = subject;
  var mailBody = $('.np-mail .body'); if (mailBody) mailBody.textContent = body;
  var meta = $('.np-meta span'); if (meta) meta.textContent = '短信 ' + sms.length + ' 字 · 按 1 条计费';
};
UI.act['notify-channel'] = function (el) {
  var ch = el.getAttribute('data-ch');
  Notify.channels[ch] = !Notify.channels[ch];
  el.classList.toggle('on', Notify.channels[ch]);
};
UI.act['notify-preview'] = function (el) { Notify.preview = el.getAttribute('data-cid'); renderNotifyModal(); };
UI.act['notify-var'] = function (el) {
  var v = '{{' + el.getAttribute('data-v') + '}}';
  var active = document.activeElement;
  if (!active || !/^(INPUT|TEXTAREA)$/.test(active.tagName)) active = $('#ntSms');
  if (!active) return;
  var start = active.selectionStart || 0, end = active.selectionEnd || 0, val = active.value;
  active.value = val.slice(0, start) + v + val.slice(end);
  active.selectionStart = active.selectionEnd = start + v.length;
  active.focus();
  Notify[active.getAttribute('data-f')] = active.value;
  UI.inp['notify-field'](active);
};
UI.act['notify-copy'] = function () {
  var c = candById(Notify.preview) || {};
  var vars = notifyVars(c, { 下一环节: '笔试' });
  var custom = c.id ? Notify.custom[c.id] : null;
  copyText(custom ? custom.sms : renderTpl(Notify.sms, vars));
};
UI.act['notify-smsapp'] = function () {
  var c = candById(Notify.preview); if (!c) return;
  copyText(renderTpl(Notify.sms, notifyVars(c, { 下一环节: '笔试' })));
  try { location.href = 'sms:' + c.phone; } catch (e) { }
};
UI.act['notify-mailapp'] = function () {
  var c = candById(Notify.preview); if (!c) return;
  var vars = notifyVars(c, { 下一环节: '笔试' });
  try { location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent(renderTpl(Notify.subject, vars)) + '&body=' + encodeURIComponent(renderTpl(Notify.body, vars)); } catch (e) { }
};
UI.act['notify-custom'] = function () {
  var c = candById(Notify.preview); if (!c) return;
  if (!Notify.custom[c.id]) {
    var vars = notifyVars(c, { 下一环节: '笔试' });
    Notify.custom[c.id] = { sms: renderTpl(Notify.sms, vars), subject: renderTpl(Notify.subject, vars), body: renderTpl(Notify.body, vars) };
    UI.toast('已切换为单独修改，左侧内容只影响这位候选人');
  } else { delete Notify.custom[c.id]; UI.toast('已恢复使用统一模板'); }
  renderNotifyModal();
};
UI.chg['notify-save'] = function (el) { Notify.saveDefault = el.checked; };
function markNotified() {
  var t = S.settings.templates[Notify.type];
  if (Notify.saveDefault && t) { t.sms = Notify.sms; t.subject = Notify.subject; t.body = Notify.body; }
  S.notifications.forEach(function (n) {
    if (n.status !== 'pending') return;
    if (Notify.ids.indexOf(n.cid) < 0 || n.type !== Notify.type) return;
    var c = candById(n.cid), vars = notifyVars(c || {}, { 下一环节: '笔试' });
    var custom = c ? Notify.custom[c.id] : null;
    n.sms = custom ? custom.sms : renderTpl(Notify.sms, vars);
    n.subject = custom ? custom.subject : renderTpl(Notify.subject, vars);
    n.body = custom ? custom.body : renderTpl(Notify.body, vars);
    n.status = 'sent'; n.sentAt = Date.now();
  });
  if (Notify.type === 'offer') {
    Notify.ids.forEach(function (id) { var o = offerOf(id); if (o) { o.status = 'sent'; o.sentAt = Date.now(); } });
  }
  if (Notify.type === 'reject') {
    Notify.ids.forEach(function (id) { var c = candById(id); if (c && c.stage !== 'hired') c.stage = 'rejected'; });
  }
  save();
}
UI.act['notify-sent'] = function () { markNotified(); UI.closeModal(); UI.toast('已标记为已通知'); refreshAfterNotify(); };
UI.act['notify-done'] = function () { markNotified(); UI.closeModal(); UI.toast('通知已处理'); refreshAfterNotify(); };
function refreshAfterNotify() {
  UI.refreshSide();
  if (UI.page === 'resume') { Resume.renderFilters(); Resume.renderList(); }
  else if (UI.page === 'office') refreshOffice();
  else UI.rerender();
}
UI.act['notify-open'] = function (el) { openNotifyBatch(null, el.getAttribute('data-type')); };
UI.act['notify-all'] = function () { openNotifyBatch(); };
