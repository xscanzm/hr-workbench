/* =========================================================
   CORE · 工具函数、存储、HR 数据模型、常量与基础查询
   HR 工作台 · 皮皮未来（数据只保存在本机浏览器）
   ========================================================= */
var VERSION = '1.0.0';
var STORE_KEY = 'hr-workbench-v1';

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function uid(p) { return (p || 'id') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function round1(v) { return Math.round(v * 10) / 10; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function parseDate(s) { if (!s) return null; var p = String(s).split(/[-\/.]/); if (p.length < 3) return null; return new Date(+p[0], +p[1] - 1, +p[2]); }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function fmtMD(s) { var d = parseDate(s); return d ? (d.getMonth() + 1) + '月' + d.getDate() + '日' : ''; }
function fmtShort(s) { var d = parseDate(s); return d ? pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) : ''; }
function fmtTime(ts) { var d = new Date(ts); return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
function avg(a) { return a.length ? sum(a) / a.length : 0; }
function fmtNum(v, d) { if (v === null || v === undefined || isNaN(v)) return '—'; d = d === undefined ? 1 : d; var m = Math.pow(10, d); return String(Math.round(v * m) / m); }
function pct(v) { if (v === null || v === undefined || isNaN(v)) return '—'; return Math.round(v * 1000) / 10 + '%'; }
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
function addDays(ds, n) { var d = parseDate(ds); if (!d) return ''; d.setDate(d.getDate() + n); return todayStr(d); }
function addMonths(ds, n) { var d = parseDate(ds); if (!d) return ''; var day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return todayStr(d); }
function dow7(d) { var x = d.getDay(); return x === 0 ? 7 : x; }
function dayLabel(ds) {
  var t = todayStr();
  if (ds === t) return '今天'; if (ds === addDays(t, 1)) return '明天'; if (ds === addDays(t, -1)) return '昨天';
  var d = parseDate(ds); if (!d) return '';
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + WEEK[d.getDay()];
}
function ageOf(birthday) {
  var b = parseDate(birthday); if (!b) return null;
  var n = new Date(), a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}
function daysTo(ds) { var d = parseDate(ds); if (!d) return null; var n = new Date(); n = new Date(n.getFullYear(), n.getMonth(), n.getDate()); return daysBetween(n, d); }
function daysToBirthday(birthday) {
  var b = parseDate(birthday); if (!b) return null;
  var n = new Date(); n = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  var next = new Date(n.getFullYear(), b.getMonth(), b.getDate());
  if (next < n) next = new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
  return daysBetween(n, next);
}
function tenureMonths(hireDate) {
  var h = parseDate(hireDate); if (!h) return 0;
  var n = new Date(), m = (n.getFullYear() - h.getFullYear()) * 12 + n.getMonth() - h.getMonth();
  if (n.getDate() < h.getDate()) m--;
  return Math.max(0, m);
}
function tenureText(hireDate) {
  var m = tenureMonths(hireDate), y = Math.floor(m / 12), mo = m % 12;
  if (y && mo) return y + '年' + mo + '个月';
  if (y) return y + '年';
  if (mo) return mo + '个月';
  var d = daysTo(hireDate); return d !== null && d <= 0 ? Math.max(1, -d) + '天' : '—';
}
function shortMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string' && /[Kk千万]/.test(v)) return v;
  var n = +v; if (isNaN(n)) return String(v);
  if (n >= 10000) return (Math.round(n / 1000) / 10) + 'K';
  return String(n);
}
function monthKey(ds) { return String(ds || todayStr()).slice(0, 7); }
function timeMin(t) { var p = String(t || '').split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); }

/* ---------- 存储（禁用 localStorage 时自动降级为内存） ---------- */
var Store = (function () {
  var mem = {}, ok = true;
  try { localStorage.setItem('__hr_t', '1'); localStorage.removeItem('__hr_t'); } catch (e) { ok = false; }
  return {
    ok: function () { return ok; },
    get: function (k) { try { return ok ? localStorage.getItem(k) : (mem[k] || null); } catch (e) { return mem[k] || null; } },
    set: function (k, v) { try { if (ok) localStorage.setItem(k, v); else mem[k] = v; return true; } catch (e) { mem[k] = v; return false; } },
    del: function (k) { try { if (ok) localStorage.removeItem(k); } catch (e) { } delete mem[k]; },
    used: function () {
      try { var n = 0; if (ok) for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('hr-workbench') === 0) n += (localStorage.getItem(k) || '').length * 2; } return n; } catch (e) { return 0; }
    }
  };
})();

var S = null; // 全局状态
var saveTimer = null;
var IDX = null, CACHE = {};
function reindex() { IDX = null; CACHE = {}; }
function save(now) {
  if (!S) return;
  reindex();
  clearTimeout(saveTimer);
  var run = function () {
    var ok = Store.set(STORE_KEY, JSON.stringify(S));
    if (!ok && window.UI) UI.toast('存储空间不足，请到设置里导出备份');
  };
  if (now) run(); else saveTimer = setTimeout(run, 250);
}
function load() {
  var raw = Store.get(STORE_KEY);
  if (!raw) return null;
  try { return migrate(JSON.parse(raw)); } catch (e) { return null; }
}

/* ---------- 常量 ---------- */
var DEPT_COLORS = ['#2f7ff0', '#7a5af5', '#14b0a6', '#f2a71b', '#e5483b', '#3ea35c', '#e2569a', '#8a6d3b'];
var EMP_STATUS = {
  active: { t: '在职', tone: 'green' },
  probation: { t: '试用期', tone: 'blue' },
  left: { t: '已离职', tone: 'gray' }
};
var DAY_STATUS = {
  normal: { t: '正常', tone: 'green' },
  late: { t: '迟到', tone: 'amber' },
  early: { t: '早退', tone: 'amber' },
  leave: { t: '请假', tone: 'amber' },
  business: { t: '出差', tone: 'blue' },
  field: { t: '外勤', tone: 'violet' },
  absent: { t: '缺勤', tone: 'red' },
  missing: { t: '未打卡', tone: 'gray' }
};
var SCREEN = {
  new: { t: '待筛选', tone: 'blue' },
  pending: { t: '待定', tone: 'amber' },
  passed: { t: '已通过', tone: 'green' },
  rejected: { t: '未通过', tone: 'red' }
};
var STAGE = {
  written: { t: '笔试', tone: 'blue' },
  interview1: { t: '初试', tone: 'blue' },
  interview2: { t: '复试', tone: 'violet' },
  offer: { t: 'Offer', tone: 'amber' },
  hired: { t: '已入职', tone: 'green' },
  rejected: { t: '已淘汰', tone: 'gray' }
};
var GRADES = {
  A: { t: 'A 优先录用', short: 'A 优先录用', tone: 'green' },
  B: { t: 'B 可以录用', short: 'B 可以录用', tone: 'blue' },
  C: { t: 'C 备选', short: 'C 备选', tone: 'amber' },
  D: { t: 'D 不建议', short: 'D 不建议', tone: 'red' }
};
var STAGE_ORDER = ['written', 'interview1', 'interview2', 'offer', 'hired', 'rejected'];
var DOC_TYPES = [
  { id: 'idcard', name: '身份证', short: '身份证', ext: 'jpg' },
  { id: 'degree', name: '学历学位证书', short: '学历学位', ext: 'pdf' },
  { id: 'resign', name: '上家离职证明', short: '离职证明', ext: 'pdf' },
  { id: 'medical', name: '入职体检报告', short: '体检报告', ext: 'pdf' },
  { id: 'photo', name: '一寸照片', short: '一寸照片', ext: 'jpg' },
  { id: 'bank', name: '银行卡', short: '银行卡', ext: 'jpg' },
  { id: 'contract', name: '劳动合同', short: '劳动合同', ext: 'pdf' },
  { id: 'nda', name: '保密协议', short: '保密协议', ext: 'pdf' },
  { id: 'handbook', name: '员工手册签收', short: '手册签收', ext: 'pdf' }
];
var DOC_NAMES = {};
DOC_TYPES.forEach(function (d) { DOC_NAMES[d.id] = d.name; });
var SOURCES = ['Boss直聘', '猎头', '内推', '拉勾', '官网投递', '校园招聘'];
var INTERVIEW_ROUNDS = { 1: '初试', 2: '复试', 3: '终试' };
var OFFBOARD_STEPS = [
  ['apply', '离职申请'],
  ['handover', '工作交接'],
  ['settle', '薪资结算'],
  ['cert', '离职证明']
];
var OFFBOARD_REASONS = ['个人发展', '家庭原因', '薪资待遇', '工作强度', '团队调整', '合同到期', '协商解除'];

/* ---------- 默认设置 ---------- */
function defaultDocTypes() { return DOC_TYPES.map(function (d) { return { id: d.id, name: d.name, required: true }; }); }
function defaultTemplates() {
  return {
    screeningPass: {
      sms: '{{姓名}}您好，您投递的「{{职位}}」岗位简历已通过初筛，我们会尽快联系您安排{{下一环节}}，请留意来电。',
      subject: '「{{公司简称}}」{{职位}} 简历初筛结果',
      body: '{{姓名}}您好：\n\n感谢您投递{{公司名称}}「{{职位}}」岗位。很高兴通知您，您的简历已通过初步筛选。\n\n接下来我们会安排{{下一环节}}，具体时间会另行通知，请留意短信和邮件，并保持电话畅通。'
    },
    screeningReject: {
      sms: '{{姓名}}您好，感谢您投递「{{职位}}」岗位。综合评估后，本次暂不匹配，您的简历会保留在人才库，期待未来有机会合作。',
      subject: '「{{公司简称}}」{{职位}} 简历筛选结果',
      body: '{{姓名}}您好：\n\n感谢您对{{公司名称}}的关注与信任。综合评估您与「{{职位}}」岗位的匹配情况，本次暂不进入下一环节。\n\n您的简历已存入我们的人才库，后续有合适机会会再与您联系。祝求职顺利！'
    },
    writtenInvite: {
      sms: '{{姓名}}您好，请于{{笔试时间}}参加「{{职位}}」线上笔试，笔试时长{{笔试时长}}，链接：{{笔试地点}}。请提前 10 分钟进入。',
      subject: '「{{公司简称}}」{{职位}} 笔试邀请',
      body: '{{姓名}}您好：\n\n恭喜您通过简历初筛，现邀请您参加「{{职位}}」岗位笔试。\n\n时间：{{笔试时间}}\n时长：{{笔试时长}}\n方式：{{笔试方式}}\n地点 / 链接：{{笔试地点}}\n\n请提前 10 分钟准备，预祝顺利。'
    },
    interviewInvite: {
      sms: '{{姓名}}您好，邀请您于{{面试时间}}参加「{{职位}}」{{面试轮次}}，地点：{{面试地点}}，面试官：{{面试官}}。请提前 10 分钟到场。',
      subject: '「{{公司简称}}」{{职位}} 面试邀请',
      body: '{{姓名}}您好：\n\n邀请您参加{{公司名称}}「{{职位}}」岗位{{面试轮次}}。\n\n时间：{{面试时间}}\n地点：{{面试地点}}\n面试官：{{面试官}}\n\n请提前 10 分钟到达，如时间不便请提前告知。'
    },
    offer: {
      sms: '{{姓名}}您好，{{公司简称}}「{{职位}}」Offer 已发送至您的邮箱，请查收并于 3 个工作日内回复，期待您的加入。',
      subject: '「{{公司简称}}」{{职位}} Offer 确认',
      body: '{{姓名}}您好：\n\n很高兴通知您，{{公司名称}}决定录用您为「{{职位}}」，入职时间：{{到岗日期}}。\n\nOffer 详情已发送至您的邮箱，请查收并确认。如有疑问，随时联系我。'
    },
    reject: {
      sms: '{{姓名}}您好，感谢您参加「{{职位}}」面试。综合评估后本次暂不匹配，感谢您的时间，祝一切顺利。',
      subject: '「{{公司简称}}」{{职位}} 面试结果',
      body: '{{姓名}}您好：\n\n感谢您参加{{公司名称}}「{{职位}}」岗位面试。综合评估后，本次暂不进入后续环节。\n\n感谢您的时间与信任，祝您求职顺利。'
    }
  };
}
function defaultState() {
  return {
    v: 1,
    demo: false,
    settings: {
      company: '皮皮未来科技有限公司', short: '皮皮未来', city: '广州',
      industry: '企业服务 · AI 数据平台', founded: '2019-03',
      hr: { name: '李经理', gender: 'F', title: '人事经理' },
      bossId: '',
      workTime: { start: '09:00', end: '18:30' },
      weights: { resume: 20, written: 30, interview: 50 },
      match: { edu: 20, exp: 25, skill: 30, salary: 15, school: 10 },
      grade: { a: 85, b: 70, c: 60 },
      probationMonths: 3, contractYears: 3,
      attendance: {
        start: '09:00', end: '18:30', lateGrace: 5, earlyGrace: 5, workdays: [1, 2, 3, 4, 5],
        leaveTypes: [{ id: 'annual', name: '年假' }, { id: 'sick', name: '病假' }, { id: 'personal', name: '事假' }, { id: 'comp', name: '调休' }, { id: 'marriage', name: '婚假' }, { id: 'maternity', name: '产假' }]
      },
      performance: {
        weights: { goal: 70, competency: 20, values: 10 },
        gradeLines: { S: 90, A: 80, B: 70, C: 60 },
        distribution: { S: 10, A: 25, B: 45, C: 15, D: 5 },
        cycleMonths: 3
      },
      activity: { types: ['团建', '生日会', '节日', '分享会', '公益', '年会', '其他'], defaultCapacity: 30, budgetLimit: 50000 },
      training: { types: ['新员工', '专业技能', '管理', '合规', '产品', '通用'], defaultDuration: 2, defaultCapacity: 30 },
      docTypes: defaultDocTypes(),
      templates: defaultTemplates(),
      ai: { provider: 'deepseek', base: 'https://api.deepseek.com', key: '', model: 'deepseek-flash', mask: true, temp: 0.7 },
      lastBackup: 0, onboarded: false, maskSeq: 0,
      officeZoom: 1, officeMode: 'daily'
    },
    departments: [], employees: [], jobs: [], candidates: [], interviews: [], offers: [],
    notifications: [], documents: [], events: [], status: {}, offboarding: [],
    attendanceDays: {}, leaveRequests: [], performanceCycles: [], performanceRecords: [],
    activities: [], trainings: [],
    chats: [], todos: [], meta: { createdAt: Date.now() }
  };
}
function migrate(s) {
  var d = defaultState();
  s.settings = Object.assign({}, d.settings, s.settings || {});
  // 旧版示例公司名迁移到新品牌
  if (s.settings.company === '星河智能科技有限公司' && s.settings.short === '星河科技') {
    s.settings.company = '皮皮未来科技有限公司';
    s.settings.short = '皮皮未来';
  }
  if (s.demo && Array.isArray(s.employees)) {
    if (s.settings.city === '杭州') s.settings.city = '广州';
    s.employees.forEach(function (e) {
      if (e.email && /@xinghe-tech\.cn$/.test(e.email)) e.email = e.email.replace('@xinghe-tech.cn', '@pipi-future.cn');
      if (e.city === '杭州') e.city = '广州';
      if (e.address) e.address = e.address.replace('杭州市', '广州市').replace('西湖区', '天河区').replace('滨江区', '海珠区').replace('余杭区', '番禺区').replace('拱墅区', '越秀区').replace('上城区', '黄埔区').replace('文一西路', '科韵路');
      if (e.school === '杭州电子科技大学') e.school = '广东工业大学';
      if (e.school === '杭州师范大学') e.school = '华南师范大学';
    });
    (s.jobs || []).forEach(function (j) { if (j.city === '杭州') j.city = '广州'; });
    (s.candidates || []).forEach(function (c) {
      if (c.resume && c.resume.city === '杭州') c.resume.city = '广州';
      if (c.resume && c.resume.school === '杭州电子科技大学') c.resume.school = '广东工业大学';
      if (c.resume && c.resume.school === '杭州师范大学') c.resume.school = '华南师范大学';
    });
    // 老员工的合同自动续到未来，避免出现负的合同剩余天数
    s.employees.forEach(function (e) {
      if (e.empStatus !== 'left' && e.contractEnd) {
        var guard = 0;
        while (daysTo(e.contractEnd) < 60 && guard++ < 20) e.contractEnd = addDays(addMonths(e.contractEnd, 36), -1);
      }
    });
    var emap = {};
    s.employees.forEach(function (e) { emap[e.id] = e; });
    (s.documents || []).forEach(function (d) { if (d.cat === 'contract' && emap[d.eid]) d.expireAt = emap[d.eid].contractEnd; });
  }
  ['ai', 'hr', 'workTime', 'weights', 'match', 'grade', 'attendance', 'performance', 'activity', 'training'].forEach(function (k) { s.settings[k] = Object.assign({}, d.settings[k], s.settings[k] || {}); });
  // 旧版把 Boss 单独存在设置里，现在从花名册选：按名字找回对应的员工
  if (!s.settings.bossId && s.settings.boss && s.settings.boss.name && Array.isArray(s.employees)) {
    var be = s.employees.filter(function (e) { return e.name === s.settings.boss.name; })[0];
    if (be) s.settings.bossId = be.id;
  }
  delete s.settings.boss;
  if (typeof s.settings.bossId !== 'string') s.settings.bossId = '';
  if (!Array.isArray(s.settings.docTypes) || !s.settings.docTypes.length) s.settings.docTypes = defaultDocTypes();
  s.settings.templates = Object.assign({}, defaultTemplates(), s.settings.templates || {});
  ['departments', 'employees', 'jobs', 'candidates', 'interviews', 'offers', 'notifications', 'documents', 'events', 'offboarding', 'chats', 'todos', 'leaveRequests', 'performanceCycles', 'performanceRecords', 'activities', 'trainings'].forEach(function (k) { if (!Array.isArray(s[k])) s[k] = []; });
  ['status', 'attendanceDays'].forEach(function (k) { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; });
  s.employees.forEach(function (e) {
    if (!e.materials || typeof e.materials !== 'object') e.materials = {};
    if (!Array.isArray(e.tags)) e.tags = [];
    if (!e.empStatus) e.empStatus = 'active';
    if (!e.no) e.no = '';
  });
  s.candidates.forEach(function (c) {
    if (!c.resume) c.resume = {};
    if (!c.scores) c.scores = {};
    if (!c.scores.rounds) c.scores.rounds = [];
    if (!Array.isArray(c.tags)) c.tags = [];
    if (!c.screen) c.screen = 'new';
    if (!c.stage) c.stage = 'written';
  });
  s.interviews.forEach(function (i) { if (!Array.isArray(i.interviewers)) i.interviewers = []; });
  Object.keys(s.status || {}).forEach(function (ds) {
    if (!s.attendanceDays[ds]) s.attendanceDays[ds] = {};
    Object.keys(s.status[ds] || {}).forEach(function (eid) {
      if (!s.attendanceDays[ds][eid]) s.attendanceDays[ds][eid] = { in: '', out: '', status: s.status[ds][eid], leaveType: '', note: '' };
    });
  });
  if (!s.meta || typeof s.meta !== 'object') s.meta = { createdAt: Date.now() };
  return s;
}

/* ---------- 基础查询 ---------- */
function idx() {
  if (IDX) return IDX;
  var emp = {}, cand = {}, job = {}, dept = {}, byName = {};
  S.departments.forEach(function (d) { dept[d.id] = d; });
  S.employees.forEach(function (e) { emp[e.id] = e; (byName[e.name] || (byName[e.name] = [])).push(e); });
  S.candidates.forEach(function (c) { cand[c.id] = c; });
  S.jobs.forEach(function (j) { job[j.id] = j; });
  IDX = { emp: emp, cand: cand, job: job, dept: dept, byName: byName };
  return IDX;
}
function empById(id) { return idx().emp[id] || null; }
function candById(id) { return idx().cand[id] || null; }
function jobById(id) { return idx().job[id] || null; }
function deptById(id) { return idx().dept[id] || null; }
function deptName(id) { var d = deptById(id); return d ? d.name : '未分配'; }
function deptColor(id) { var d = deptById(id); if (d) return d.color || '#9a9a97'; var i = S.departments.map(function (x) { return x.id; }).indexOf(id); return DEPT_COLORS[(i + DEPT_COLORS.length) % DEPT_COLORS.length]; }
function deptOfEmp(e) { return deptById(e && e.deptId); }
function activeEmployees() { return S.employees.filter(function (e) { return e.empStatus !== 'left'; }); }
function probationEmployees() { return S.employees.filter(function (e) { return e.empStatus === 'probation'; }); }
function employeesOfDept(id) { return S.employees.filter(function (e) { return e.deptId === id && e.empStatus !== 'left'; }); }
function deptLead(id) { var d = deptById(id); return d && d.leadId ? empById(d.leadId) : null; }
function isDeptLead(e) { if (!e) return false; var d = deptById(e.deptId); return !!(d && d.leadId === e.id); }
function empName(id) { var e = empById(id); return e ? e.name : ''; }
function empNo(id) { var e = empById(id); return e ? e.no : ''; }
function isNewEmp(e) { var h = parseDate(e.hireDate); return h && daysBetween(h, new Date()) <= 90; }

function statusOf(e, ds) {
  ds = ds || todayStr();
  var day = (S.attendanceDays && S.attendanceDays[ds]) || null;
  if (day && day[e.id] && day[e.id].status) return day[e.id].status;
  var legacy = S.status[ds] || {};
  return legacy[e.id] || null;
}
function todayStatusStats() {
  var list = activeEmployees(), n = { total: list.length, normal: 0, late: 0, early: 0, leave: 0, business: 0, field: 0, absent: 0, missing: 0, present: 0 };
  list.forEach(function (e) { var s = statusOf(e); if (s && n[s] !== undefined) n[s]++; });
  n.present = n.normal + n.late + n.early;
  return n;
}
function statusListToday() {
  var out = [];
  activeEmployees().forEach(function (e) { var s = statusOf(e); if (s && s !== 'normal') out.push({ e: e, s: s }); });
  return out;
}
function monthBirthdayList() {
  var mo = new Date().getMonth() + 1;
  return activeEmployees().map(function (e) { var b = parseDate(e.birthday); return b && b.getMonth() + 1 === mo ? { e: e, day: b.getDate() } : null; })
    .filter(Boolean).sort(function (a, b) { return a.day - b.day; });
}
function monthAnniversaryList() {
  var mo = new Date().getMonth() + 1;
  return activeEmployees().map(function (e) {
    var h = parseDate(e.hireDate); if (!h || h.getMonth() + 1 !== mo) return null;
    var y = new Date().getFullYear() - h.getFullYear(); if (y < 1) return null;
    return { e: e, years: y, day: h.getDate() };
  }).filter(Boolean).sort(function (a, b) { return b.years - a.years || a.day - b.day; });
}
function probationLeft(e) { if (e.empStatus !== 'probation') return null; return daysTo(e.probationEnd); }
function contractLeft(e) { if (!e.contractEnd) return null; return daysTo(e.contractEnd); }
function materialsOf(e) {
  var req = (S.settings.docTypes || []).filter(function (d) { return d.required !== false; }), done = 0, missing = [];
  req.forEach(function (d) { if (e.materials[d.id]) done++; else missing.push(d); });
  return { done: done, total: req.length, missing: missing, rate: req.length ? done / req.length : 0 };
}
function overallMaterials() {
  var list = activeEmployees(), done = 0, total = 0, people = 0;
  list.forEach(function (e) { var m = materialsOf(e); done += m.done; total += m.total; if (m.missing.length) people++; });
  return { done: done, total: total, people: people, rate: total ? done / total : 0 };
}
function recentEvents(eid, n) {
  return S.events.filter(function (x) { return x.eid === eid; }).sort(function (a, b) {
    var ka = a.date + ' ' + (a.time || ''), kb = b.date + ' ' + (b.time || '');
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  }).slice(0, n || 99);
}
function addEvent(eid, type, text, date) {
  S.events.push({ id: uid('ev'), eid: eid, type: type, text: text, date: date || todayStr() });
}
function nextEmpNo() {
  var max = 1000;
  S.employees.forEach(function (e) { var m = /XH(\d+)/.exec(e.no || ''); if (m && +m[1] > max) max = +m[1]; });
  return 'XH' + (max + 1);
}
function empByNo(no) { for (var i = 0; i < S.employees.length; i++) if (S.employees[i].no === no) return S.employees[i]; return null; }
function candidateByEmail(email) { for (var i = 0; i < S.candidates.length; i++) if (S.candidates[i].email === email) return S.candidates[i]; return null; }

/* ---------- 招聘查询 ---------- */
function jobSalaryRange(job) {
  var m = /(\d+)\s*-\s*(\d+)/.exec(String(job && job.salary || ''));
  if (m) return [+m[1], +m[2]];
  var one = /(\d+)/.exec(String(job && job.salary || ''));
  var v = one ? +one[1] : 10;
  return [v, v];
}
function candidatesOfJob(jid) { return S.candidates.filter(function (c) { return c.jobId === jid; }); }
function activeCandidates() { return S.candidates.filter(function (c) { return c.screen !== 'rejected' && c.stage !== 'hired' && c.stage !== 'rejected'; }); }
function screeningList() { return S.candidates.filter(function (c) { return c.screen === 'new' || c.screen === 'pending'; }); }
function passedCandidates() { return S.candidates.filter(function (c) { return c.screen === 'passed' && c.stage !== 'rejected'; }); }
function scoreScope() { return S.candidates.filter(function (c) { return c.screen === 'passed' && c.stage !== 'rejected'; }); }
function interviewAvg(c) {
  var rounds = (c.scores && c.scores.rounds) || [];
  var vals = rounds.map(function (r) { return r.score; }).filter(function (v) { return typeof v === 'number' && !isNaN(v); });
  return vals.length ? round1(avg(vals)) : null;
}
function compositeOf(c) {
  var w = S.settings.weights, resume = c.scores && typeof c.scores.resume === 'number' ? c.scores.resume : null;
  var written = c.scores && typeof c.scores.written === 'number' ? c.scores.written : null;
  var interview = interviewAvg(c);
  var parts = [], totalW = 0, total = 0;
  if (resume !== null) { parts.push({ k: 'resume', w: w.resume, v: resume }); totalW += w.resume; }
  if (written !== null) { parts.push({ k: 'written', w: w.written, v: written }); totalW += w.written; }
  if (interview !== null) { parts.push({ k: 'interview', w: w.interview, v: interview }); totalW += w.interview; }
  if (!totalW) return { score: null, parts: parts, estimated: true, missing: ['resume', 'written', 'interview'] };
  parts.forEach(function (p) { total += p.v * p.w / totalW; });
  var adj = +(c.scores && c.scores.adjust) || 0;
  return { score: round1(total + adj), parts: parts, estimated: !!(resume === null || written === null || interview === null), missing: [resume === null ? 'resume' : '', written === null ? 'written' : '', interview === null ? 'interview' : ''].filter(Boolean) };
}
function gradeOf(score) {
  if (score === null || score === undefined) return null;
  var g = S.settings.grade;
  if (score >= g.a) return 'A';
  if (score >= g.b) return 'B';
  if (score >= g.c) return 'C';
  return 'D';
}
function scoreRows() {
  return scoreScope().map(function (c) {
    var co = compositeOf(c), job = jobById(c.jobId);
    return { c: c, job: job, score: co.score, grade: gradeOf(co.score), co: co };
  }).sort(function (a, b) { return (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score); });
}
function rankInJob(c) {
  var rows = scoreScope().filter(function (x) { return x.jobId === c.jobId && compositeOf(x).score !== null; }).map(function (x) { return { c: x, s: compositeOf(x).score }; }).sort(function (a, b) { return b.s - a.s; });
  var i = rows.map(function (r) { return r.c.id; }).indexOf(c.id);
  return { r: i >= 0 ? i + 1 : null, n: rows.length };
}
function jobStats(j) {
  var list = S.candidates.filter(function (c) { return c.jobId === j.id; }), st = {};
  STAGE_ORDER.forEach(function (k) { st[k] = 0; });
  list.forEach(function (c) { if (st[c.stage] !== undefined) st[c.stage]++; });
  var hired = st.hired || 0;
  return { total: list.length, stages: st, hired: hired, left: Math.max(0, (j.headcount || 0) - hired) };
}
function jobsWithStats() {
  return S.jobs.map(function (j) { return { j: j, st: jobStats(j), dept: deptById(j.deptId) }; }).sort(function (a, b) {
    var ua = a.j.urgency === '高' ? 0 : a.j.urgency === '中' ? 1 : 2, ub = b.j.urgency === '高' ? 0 : b.j.urgency === '中' ? 1 : 2;
    return ua - ub || (a.st.left - b.st.left);
  });
}
function todayInterviews() {
  var t = todayStr();
  return S.interviews.filter(function (i) { return i.date === t && i.status !== 'cancelled'; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
}
function upcomingInterviews(n) {
  var t = todayStr();
  return S.interviews.filter(function (i) { return i.date > t && i.status !== 'cancelled'; }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }).slice(0, n || 8);
}
function interviewByCandidate(cid) { return S.interviews.filter(function (i) { return i.cid === cid; }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }); }
function feedbackPending() {
  return S.interviews.filter(function (i) { return i.status === 'done' && (!i.feedback || i.feedback.result === 'pending' || i.feedback.result === undefined); });
}
function offerOf(cid) { for (var i = 0; i < S.offers.length; i++) if (S.offers[i].cid === cid) return S.offers[i]; return null; }
function pendingOffers() { return S.offers.filter(function (o) { return o.status === 'sent'; }); }
function notifyQueue(type) {
  return S.notifications.filter(function (n) { return n.status === 'pending' && (!type || n.type === type); });
}
function reminders() {
  var out = [];
  var fb = feedbackPending();
  fb.slice(0, 2).forEach(function (i) {
    var c = candById(i.cid); if (c) out.push({ kind: 'interview', tone: 'red', title: c.name + '的' + (INTERVIEW_ROUNDS[i.round] || '面试') + '还没填写评价', tag: '面试', act: 'open-feedback', id: i.id });
  });
  var memos = S.events.filter(function (m) { return m.type === '备忘' && m.date >= todayStr(); }).sort(function (a, b) {
    var ka = a.date + ' ' + (a.time || ''), kb = b.date + ' ' + (b.time || '');
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  memos.slice(0, 3).forEach(function (m) {
    var e = empById(m.eid);
    if (e) out.push({ kind: 'memo', tone: 'amber', title: e.name + '：' + (m.time ? m.time + ' ' : '') + m.text, tag: '备忘', act: 'open-emp', id: e.id });
  });
  var pendLv = pendingLeaves();
  if (pendLv.length) out.push({ kind: 'attendance', tone: 'amber', title: pendLv.length + ' 条请假申请待审批', tag: '考勤', act: 'go-attendance' });
  var attEx = attExceptionsToday();
  if (attEx.length) out.push({ kind: 'attendance', tone: 'red', title: '今日 ' + attEx.length + ' 人考勤异常（迟到 / 早退 / 缺勤）', tag: '考勤', act: 'go-attendance' });
  var pc = perfCurrentCycle(), pn = pc ? perfPendingTotal() : 0;
  if (pn) out.push({ kind: 'performance', tone: 'violet', title: pc.name + ' 还有 ' + pn + ' 人待评价 / 校准', tag: '绩效', act: 'go-performance' });
  var ua = activityUpcoming(1)[0];
  if (ua) out.push({ kind: 'activity', tone: 'amber', title: '活动：' + ua.title + ' · ' + ua.date, tag: '活动', act: 'open-activity', id: ua.id });
  var ut = trainingUpcoming(1)[0];
  if (ut) out.push({ kind: 'training', tone: 'blue', title: '培训：' + ut.title + ' · ' + ut.start, tag: '培训', act: 'open-training', id: ut.id });
  var wait = S.candidates.filter(function (c) { return c.screen === 'new'; });
  if (wait.length) out.push({ kind: 'resume', tone: 'amber', title: wait.length + ' 份简历待筛选，最早的已等 ' + Math.max.apply(null, wait.map(function (c) { return Math.max(1, -daysTo(c.appliedAt)); })) + ' 天', tag: '简历', act: 'go-resume' });
  var nq = notifyQueue();
  if (nq.length) out.push({ kind: 'notify', tone: 'blue', title: nq.length + ' 条通知待发送：初筛通过 ' + nq.filter(function (n) { return n.type === 'screeningPass'; }).length + '、初筛未通过 ' + nq.filter(function (n) { return n.type === 'screeningReject'; }).length + ' 等', tag: '通知', act: 'notify-all' });
  var po = pendingOffers();
  po.slice(0, 1).forEach(function (o) { var c = candById(o.cid); if (c) out.push({ kind: 'offer', tone: 'amber', title: c.name + '的 Offer 等待回复（' + Math.max(1, -daysTo(o.sentAt)) + ' 天前发出）', tag: 'Offer', act: 'open-offer', id: o.id }); });
  var exp = S.documents.filter(function (d) { var left = daysTo(d.expireAt); return d.expireAt && left !== null && left >= 0 && left <= 30; });
  if (exp.length) out.push({ kind: 'doc', tone: 'red', title: exp.length + ' 份档案 / 合同即将到期，记得提前续签', tag: '档案', act: 'go-files' });
  return out;
}
function reminderCount() {
  var waiting = S.candidates.filter(function (c) { return c.screen === 'new'; }).length;
  var memos = S.events.filter(function (x) { return x.type === '备忘' && x.date >= todayStr(); }).length;
  var hrPending = (pendingLeaves().length ? 1 : 0) + (attExceptionsToday().length ? 1 : 0) + (perfPendingTotal() ? 1 : 0) + (activityUpcoming(1).length ? 1 : 0) + (trainingUpcoming(1).length ? 1 : 0);
  var other = feedbackPending().length + notifyQueue().length + pendingOffers().length + memos + hrPending + S.documents.filter(function (d) { var l = daysTo(d.expireAt); return d.expireAt && l !== null && l >= 0 && l <= 30; }).length;
  return Math.max(waiting, other);
}

/* ---------- 文件柜 ---------- */
function docCategories() {
  return [
    { id: 'material', name: '员工档案材料' },
    { id: 'contract', name: '劳动合同与协议' },
    { id: 'resume', name: '简历附件' },
    { id: 'policy', name: '公司制度' },
    { id: 'license', name: '证照资质' },
    { id: 'generated', name: '生成的文书' },
    { id: 'other', name: '其他' }
  ];
}
function docsOf(cat) { return S.documents.filter(function (d) { return !cat || d.cat === cat; }); }
function docCounts() {
  var m = { all: S.documents.length };
  docCategories().forEach(function (c) { m[c.id] = docsOf(c.id).length; });
  return m;
}
function docStatsOfEmp(e) { return materialsOf(e); }
function docFileSize(n) { if (n < 1024) return n + ' B'; if (n < 1048576) return round1(n / 1024) + ' KB'; return round1(n / 1048576) + ' MB'; }

/* ---------- 统计 ---------- */
function deptHeadcount() {
  return S.departments.map(function (d) { var list = employeesOfDept(d.id); return { d: d, n: list.length, lead: deptLead(d.id) }; });
}
function headcountStats() {
  var list = activeEmployees(), male = list.filter(function (e) { return e.gender !== 'F'; }).length;
  var avgTenure = list.length ? avg(list.map(function (e) { return tenureMonths(e.hireDate) / 12; })) : 0;
  var month = monthKey();
  return {
    total: list.length, male: male, female: list.length - male,
    probation: list.filter(function (e) { return e.empStatus === 'probation'; }).length,
    joinedThisMonth: list.filter(function (e) { return monthKey(e.hireDate) === month; }).length,
    leftThisMonth: S.employees.filter(function (e) { return e.empStatus === 'left' && monthKey(e.leftDate || e.lastDay) === month; }).length,
    avgTenure: round1(avgTenure)
  };
}
function recruitFunnel() {
  var all = S.candidates.length;
  var screened = S.candidates.filter(function (c) { return c.screen === 'passed'; }).length;
  var written = S.candidates.filter(function (c) { return c.scores && typeof c.scores.written === 'number'; }).length;
  var interviewed = S.candidates.filter(function (c) { return (c.scores.rounds || []).length > 0; }).length;
  var offer = S.candidates.filter(function (c) { return c.stage === 'offer' || c.stage === 'hired'; }).length;
  var hired = S.candidates.filter(function (c) { return c.stage === 'hired'; }).length;
  return [
    { label: '简历', value: all }, { label: '初筛通过', value: screened }, { label: '笔试', value: written }, { label: '面试', value: interviewed }, { label: 'Offer', value: offer }, { label: '入职', value: hired }
  ];
}
function sourceStats() {
  var m = {};
  S.candidates.forEach(function (c) { var s = c.source || '其他'; m[s] = m[s] || { n: 0, hired: 0 }; m[s].n++; if (c.stage === 'hired') m[s].hired++; });
  return Object.keys(m).map(function (k) { return { name: k, n: m[k].n, hired: m[k].hired }; }).sort(function (a, b) { return b.n - a.n; });
}
function deptRecruitStats() {
  return S.departments.map(function (d) {
    var jobs = S.jobs.filter(function (j) { return j.deptId === d.id; });
    var need = sum(jobs.map(function (j) { return j.headcount || 0; }));
    var hired = S.candidates.filter(function (c) { return c.stage === 'hired' && jobById(c.jobId) && jobById(c.jobId).deptId === d.id; }).length;
    return { d: d, jobs: jobs.length, need: need, hired: hired };
  });
}

/* ---------- 通知模板渲染 ---------- */
function renderTpl(t, vars) {
  return String(t || '').replace(/\{\{(\w+)\}\}/g, function (all, k) { return vars[k] !== undefined ? vars[k] : all; });
}
function notifyVars(c, extra) {
  var job = jobById(c.jobId), d = deptById(c.deptId);
  var v = {
    姓名: c.name, 职位: job ? job.title : '', 部门: d ? d.name : '', 公司名称: S.settings.company, 公司简称: S.settings.short,
    城市: S.settings.city, 下一环节: '笔试', 环节: '简历初筛', 签名: S.settings.hr.name,
    HR: S.settings.hr.name, 电话: '', 邮箱: c.email,
    笔试时间: '', 笔试时长: '60 分钟', 笔试方式: '线上', 笔试地点: '',
    面试时间: '', 面试轮次: '初试', 面试地点: '公司 3 楼面试间', 面试官: '',
    到岗日期: '', 回复截止: '', 薪资: ''
  };
  if (extra) Object.keys(extra).forEach(function (k) { v[k] = extra[k]; });
  return v;
}
