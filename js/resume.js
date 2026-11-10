/* =========================================================
   简历筛选 · 多维筛选、简历列表、匹配度明细、通过 / 待定 / 不通过
   ========================================================= */
var Resume = {
  q: '', status: ['new', 'pending'], job: 'all', match: 'all', edu: 'all', years: 'all',
  source: 'all', gender: 'all', more: false, sort: 'match', sel: null, checked: {},
  tab: 'resume', notify: true, list: []
};
var MATCH_RANGES = [
  ['high', '85+ 高度匹配', function (s) { return s >= 85; }],
  ['mid', '70-84 较匹配', function (s) { return s >= 70 && s < 85; }],
  ['low', '55-69 一般', function (s) { return s >= 55 && s < 70; }],
  ['low0', '55 以下', function (s) { return s < 55; }]
];
var EDU_RANGES = [['博士', '博士'], ['硕士', '硕士'], ['本科', '本科'], ['大专', '大专'], ['高中', '高中/中专'], ['other', '其他']];
var YEAR_RANGES = [['0-1', '应届 / 1 年内', 0, 1], ['1-3', '1-3 年', 1, 3], ['3-5', '3-5 年', 3, 5], ['5-10', '5-10 年', 5, 10], ['10+', '10 年以上', 10, 99]];

function matchGrade(score) {
  if (score >= 85) return { t: '高度匹配', tone: 'green' };
  if (score >= 70) return { t: '较匹配', tone: 'blue' };
  if (score >= 55) return { t: '一般', tone: 'amber' };
  return { t: '低匹配', tone: 'red' };
}
function matchColor(score) { return score >= 85 ? '#1d9a57' : score >= 70 ? '#2f7ff0' : score >= 55 ? '#e89a0c' : '#e5483b'; }
function matchRing(score, size, showLabel) {
  size = size || 44;
  var r = size / 2 - 3, c = 2 * Math.PI * r, off = c * (1 - clamp(score, 0, 100) / 100), col = matchColor(score);
  return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px">' +
    '<svg width="' + size + '" height="' + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#f0f0ee" stroke-width="3.5"/>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '"/></svg>' +
    '<span class="ring-txt" style="font-size:' + Math.round(size * 0.28) + 'px;color:' + col + '">' + score + '</span></div>';
}
function screenPassed(c) { return c.screen === 'passed'; }
function candidateJobTitle(c) { var j = jobById(c.jobId); return j ? j.title : ''; }
function candidateStatusPool() {
  var q = Resume.q.trim();
  return S.candidates.filter(function (c) {
    if (Resume.status.length && Resume.status.indexOf(c.screen) < 0) return false;
    if (Resume.job !== 'all' && c.jobId !== Resume.job) return false;
    if (q) {
      var job = jobById(c.jobId);
      var hay = (c.name + ' ' + c.resume.school + ' ' + c.resume.major + ' ' + (c.resume.skills || []).join(' ') + ' ' + (job ? job.title : '') + ' ' + c.source).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  });
}
function resumeFiltered() {
  var list = candidateStatusPool().filter(function (c) {
    if (Resume.match !== 'all') { var r = MATCH_RANGES.filter(function (x) { return x[0] === Resume.match; })[0]; if (!r || !r[2](c.match.score)) return false; }
    if (Resume.edu !== 'all') {
      if (Resume.edu === 'other') { if (['博士', '硕士', '本科', '大专', '高中'].indexOf(c.resume.degree) >= 0) return false; }
      else if (c.resume.degree !== Resume.edu) return false;
    }
    if (Resume.years !== 'all') { var yr = YEAR_RANGES.filter(function (x) { return x[0] === Resume.years; })[0]; if (!yr || c.resume.years < yr[2] || c.resume.years >= yr[3]) return false; }
    if (Resume.source !== 'all' && c.source !== Resume.source) return false;
    if (Resume.gender !== 'all' && c.gender !== Resume.gender) return false;
    return true;
  });
  var sort = Resume.sort;
  list.sort(function (a, b) {
    if (sort === 'applied') return a.appliedAt < b.appliedAt ? 1 : -1;
    if (sort === 'name') return a.name.localeCompare(b.name, 'zh');
    return b.match.score - a.match.score;
  });
  return list;
}
function statusCounts() {
  var m = { new: 0, pending: 0, passed: 0, rejected: 0 };
  S.candidates.forEach(function (c) { if (m[c.screen] !== undefined) m[c.screen]++; });
  return m;
}
function jobCounts(pool) {
  var m = {};
  pool.forEach(function (c) { m[c.jobId] = (m[c.jobId] || 0) + 1; });
  return m;
}
function matchCounts(pool) {
  var m = {};
  MATCH_RANGES.forEach(function (r) { m[r[0]] = pool.filter(function (c) { return r[2](c.match.score); }).length; });
  return m;
}
function eduCounts(pool) {
  var m = {};
  EDU_RANGES.forEach(function (r) {
    m[r[0]] = pool.filter(function (c) {
      if (r[0] === 'other') return ['博士', '硕士', '本科', '大专', '高中'].indexOf(c.resume.degree) < 0;
      return c.resume.degree === r[0];
    }).length;
  });
  return m;
}
function yearCounts(pool) {
  var m = {};
  YEAR_RANGES.forEach(function (r) { m[r[0]] = pool.filter(function (c) { return c.resume.years >= r[2] && c.resume.years < r[3]; }).length; });
  return m;
}

UI.register('resume', {
  render: function (main) {
    main.innerHTML = '<div class="resume-page">' +
      '<div class="page-head"><div><h1 class="page-title">简历筛选</h1><div class="page-desc" id="resumeDesc"></div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="resume-rules">' + ICON.filter + '匹配规则</button>' +
      '<button class="btn btn-light" data-act="resume-import">' + ICON.up + '批量导入</button>' +
      '<button class="btn btn-dark" data-act="resume-add">' + ICON.userplus + '添加简历</button></div></div>' +
      '<div class="notice-bar" id="resumeNotice"></div>' +
      '<div class="filter-panel" id="resumeFilters"></div>' +
      '<div class="resume-body"><div class="cand-list"><div class="cand-list-head" id="resumeListHead"></div><div class="cand-scroll" id="resumeList"></div></div><div class="cand-detail" id="resumeDetail"></div></div>' +
      '</div>';
    Resume.renderFilters();
    Resume.renderList();
  }
});
Resume.renderFilters = function () {
  var pool = candidateStatusPool(), sc = statusCounts(), jc = jobCounts(pool), mc = matchCounts(pool), ec = eduCounts(pool), yc = yearCounts(pool);
  var desc = $('#resumeDesc');
  if (desc) {
    var wait = S.candidates.filter(function (c) { return c.screen === 'new'; });
    var avgMatch = wait.length ? Math.round(avg(wait.map(function (c) { return c.match.score; }))) : 0;
    desc.innerHTML = '待筛选 <b>' + wait.length + '</b> 份 · 今天新投递 <b>' + S.candidates.filter(function (c) { return c.appliedAt === todayStr(); }).length + '</b> 份 · 待筛简历平均匹配度 <b>' + avgMatch + '</b>';
  }
  var nq = notifyQueue();
  var notice = $('#resumeNotice');
  if (notice) {
    var passN = nq.filter(function (n) { return n.type === 'screeningPass'; }).length, rejN = nq.filter(function (n) { return n.type === 'screeningReject'; }).length;
    notice.innerHTML = '<span class="nb-title">' + ICON.bell + '待发送的通知：</span>' +
      '<button class="nb-chip" data-act="notify-open" data-type="screeningPass"><i class="dot" style="background:#1d9a57"></i>初筛通过 <b>' + passN + '</b></button>' +
      '<button class="nb-chip" data-act="notify-open" data-type="screeningReject"><i class="dot" style="background:#e5483b"></i>初筛未通过 <b>' + rejN + '</b></button>';
  }
  var f = $('#resumeFilters'); if (!f) return;
  function chip(label, on, act, val, count) {
    return '<button class="f-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-v="' + val + '">' + label + (count !== undefined ? ' <b>' + count + '</b>' : '') + '</button>';
  }
  var h = '<div class="f-top">' +
    '<input class="inp" id="resumeQ" placeholder="搜索姓名、学校、公司、技能、简历内容" value="' + esc(Resume.q) + '" data-inp="resume-q">' +
    '<span class="f-count">筛出 <b>' + Resume.list.length + '</b> / ' + S.candidates.length + ' 份简历</span>' +
    '<div class="grow"></div>' +
    '<select class="sel" data-chg="resume-sort"><option value="match"' + (Resume.sort === 'match' ? ' selected' : '') + '>匹配度从高到低</option><option value="applied"' + (Resume.sort === 'applied' ? ' selected' : '') + '>投递时间最新</option><option value="name"' + (Resume.sort === 'name' ? ' selected' : '') + '>姓名排序</option></select>' +
    '</div>';
  h += '<div class="f-row"><div class="f-label">筛选状态</div><div class="f-chips">' + chip('不限', !Resume.status.length, 'resume-status', 'all') + chip('待筛选', Resume.status.indexOf('new') >= 0, 'resume-status', 'new', sc.new) + chip('待定', Resume.status.indexOf('pending') >= 0, 'resume-status', 'pending', sc.pending) + chip('已通过', Resume.status.indexOf('passed') >= 0, 'resume-status', 'passed', sc.passed) + chip('未通过', Resume.status.indexOf('rejected') >= 0, 'resume-status', 'rejected', sc.rejected) + '</div></div>';
  h += '<div class="f-row"><div class="f-label">应聘职位</div><div class="f-chips">' + chip('不限', Resume.job === 'all', 'resume-job', 'all') + S.jobs.map(function (j) { return chip(j.title, Resume.job === j.id, 'resume-job', j.id, jc[j.id] || 0); }).join('') + '</div></div>';
  h += '<div class="f-row"><div class="f-label">匹配度</div><div class="f-chips">' + chip('不限', Resume.match === 'all', 'resume-match', 'all') + MATCH_RANGES.map(function (r) { return chip(r[1], Resume.match === r[0], 'resume-match', r[0], mc[r[0]] || 0); }).join('') + '</div></div>';
  h += '<div class="f-row"><div class="f-label">学历</div><div class="f-chips">' + chip('不限', Resume.edu === 'all', 'resume-edu', 'all') + EDU_RANGES.map(function (r) { return chip(r[1], Resume.edu === r[0], 'resume-edu', r[0], ec[r[0]] || 0); }).join('') + '</div></div>';
  h += '<div class="f-row"><div class="f-label">工作年限</div><div class="f-chips">' + chip('不限', Resume.years === 'all', 'resume-years', 'all') + YEAR_RANGES.map(function (r) { return chip(r[1], Resume.years === r[0], 'resume-years', r[0], yc[r[0]] || 0); }).join('') + '</div></div>';
  if (Resume.more) {
    h += '<div class="f-row"><div class="f-label">来源</div><div class="f-chips">' + chip('不限', Resume.source === 'all', 'resume-source', 'all') + SOURCES.map(function (s) { return chip(s, Resume.source === s, 'resume-source', s); }).join('') + '</div></div>';
    h += '<div class="f-row"><div class="f-label">性别</div><div class="f-chips">' + chip('不限', Resume.gender === 'all', 'resume-gender', 'all') + chip('男', Resume.gender === 'M', 'resume-gender', 'M') + chip('女', Resume.gender === 'F', 'resume-gender', 'F') + '</div></div>';
  }
  h += '<div class="f-row" style="align-items:center"><button class="f-more" data-act="resume-more">' + (Resume.more ? '收起筛选' : '更多筛选（6）') + ' <span style="font-size:10px">' + (Resume.more ? '▴' : '▾') + '</span></button>';
  var sel = [];
  if (Resume.status.length) sel.push('筛选状态：' + Resume.status.map(function (s) { return SCREEN[s].t; }).join('、'));
  if (Resume.job !== 'all') sel.push('职位：' + (jobById(Resume.job) || {}).title);
  if (Resume.match !== 'all') sel.push('匹配度：' + MATCH_RANGES.filter(function (x) { return x[0] === Resume.match; })[0][1]);
  if (Resume.edu !== 'all') sel.push('学历：' + Resume.edu);
  if (Resume.years !== 'all') sel.push('年限：' + YEAR_RANGES.filter(function (x) { return x[0] === Resume.years; })[0][1]);
  if (Resume.source !== 'all') sel.push('来源：' + Resume.source);
  if (sel.length) h += '<div class="f-selected"><span>已选：</span>' + sel.map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('') + '<button class="clear" data-act="resume-clear">清空筛选</button></div>';
  else h += '<div class="f-selected"><span class="muted">默认显示待筛选和待定的简历</span></div>';
  h += '</div>';
  f.innerHTML = h;
};
Resume.renderList = function () {
  Resume.list = resumeFiltered();
  if (!Resume.list.some(function (c) { return c.id === Resume.sel; })) Resume.sel = Resume.list.length ? Resume.list[0].id : null;
  var head = $('#resumeListHead');
  if (head) {
    var allChecked = Resume.list.length && Resume.list.every(function (c) { return Resume.checked[c.id]; });
    head.innerHTML = '<label class="chk"><input type="checkbox" id="resumeAll"' + (allChecked ? ' checked' : '') + ' data-chg="resume-all"> 全选当前结果</label>' +
      '<span class="muted" style="font-size:12px">' + Resume.list.length + ' 份</span>' +
      '<button class="sort-btn" data-act="resume-prev" title="上一份">' + ICON.back + '</button>' +
      '<button class="sort-btn" data-act="resume-next" title="下一份" style="margin-left:0">' + ICON.fwd + '</button>';
  }
  var el = $('#resumeList'); if (!el) return;
  if (!Resume.list.length) { el.innerHTML = '<div class="cand-empty">没有符合条件的简历<br><span style="font-size:12px">可以调整筛选条件，或点右上角「添加简历」</span></div>'; Resume.renderDetail(); return; }
  var checkedN = Object.keys(Resume.checked).length;
  var batch = checkedN ? '<div class="batch-bar"><b>已选 ' + checkedN + ' 人</b><span class="grow"></span><button class="btn btn-xs btn-dark" data-act="resume-batch" data-do="passed">通过</button><button class="btn btn-xs btn-light" data-act="resume-batch" data-do="pending">待定</button><button class="btn btn-xs btn-light" data-act="resume-batch" data-do="rejected">不通过</button><button class="btn btn-xs btn-light" data-act="resume-batch-notify">发通知</button><button class="btn btn-xs btn-ghost" data-act="resume-uncheck">取消</button></div>' : '';
  el.innerHTML = batch + Resume.list.map(function (c) {
    var job = jobById(c.jobId), dept = deptById(c.deptId);
    return '<div class="cand-item' + (Resume.sel === c.id ? ' on' : '') + '" data-act="resume-sel" data-cid="' + c.id + '">' +
      '<label class="chk" style="align-items:flex-start;padding-top:2px" onclick="event.stopPropagation()"><input type="checkbox" data-chg="resume-check" data-cid="' + c.id + '"' + (Resume.checked[c.id] ? ' checked' : '') + '></label>' +
      '<div class="c-main"><div class="c-top"><span class="c-name">' + esc(c.name) + '</span>' + (c.appliedAt >= addDays(todayStr(), -2) ? '<span class="tag blue" style="height:18px;font-size:10.5px">新</span>' : '') + '</div>' +
      '<div class="c-meta">' + esc(c.resume.degree + ' · ' + c.resume.school + ' · ' + c.resume.years + ' 年 · 期望 ' + c.resume.expected) + '</div>' +
      '<div class="c-src"><i class="dot" style="background:' + deptColor(c.deptId) + '"></i>' + esc((job ? job.title : '') + ' · ' + (dept ? dept.name : '') + ' · ' + c.source + ' · ' + fmtShort(c.appliedAt)) + '</div>' +
      '<div class="c-tags tags">' + (c.tags || []).slice(0, 4).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
      '<div class="c-score">' + matchRing(c.match.score, 44) + '</div></div>';
  }).join('');
  Resume.renderDetail();
};
Resume.renderDetail = function () {
  var el = $('#resumeDetail'); if (!el) return;
  var c = candById(Resume.sel);
  if (!c) { el.innerHTML = '<div class="resume-empty">从左侧选择一份简历查看详情</div>'; return; }
  var job = jobById(c.jobId), dept = deptById(c.deptId), mg = matchGrade(c.match.score);
  var tabs = [['resume', '简历'], ['original', '原件 1']];
  var h = '<div class="cand-hero">' + candAva(c, 64) + '<div class="ch-main"><div class="ch-name">' + esc(c.name) + ' <small>' + (c.gender === 'F' ? '女' : '男') + '</small></div>' +
    '<div class="ch-meta"><span class="tag ' + (c.screen === 'new' ? 'blue' : c.screen === 'pending' ? 'amber' : c.screen === 'passed' ? 'green' : 'red') + '">' + SCREEN[c.screen].t + '</span><span>' + esc((job ? job.title : '') + ' · ' + (dept ? dept.name : '') + ' · ' + c.source + ' · ' + c.appliedAt + ' 投递') + '</span></div>' +
    '<div class="ch-contact"><span>' + ICON.phone + esc(c.phone) + '</span><span>' + ICON.mail + esc(c.email) + '</span></div></div>' +
    '<div class="ch-tabs">' + tabs.map(function (t) { return '<button class="' + (Resume.tab === t[0] ? 'on' : '') + '" data-act="resume-tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
  h += '<div class="cand-action-bar"><div class="rating">' + [1, 2, 3, 4, 5].map(function (n) { return '<button class="' + (c.star >= n ? 'on' : '') + '" data-act="resume-star" data-n="' + n + '" title="' + n + ' 星">' + ICON.star + '</button>'; }).join('') + '</div>' +
    '<button class="btn btn-dark btn-sm" data-act="resume-pass" data-cid="' + c.id + '">' + ICON.check + '通过 → 笔试</button>' +
    '<button class="btn btn-light btn-sm" data-act="resume-pending" data-cid="' + c.id + '">待定</button>' +
    '<button class="btn btn-light btn-sm" data-act="resume-reject" data-cid="' + c.id + '">' + ICON.x + '不通过</button>' +
    '<span class="sep"></span><span class="muted" style="font-size:12px">当前阶段：' + (STAGE[c.stage] ? STAGE[c.stage].t : '—') + '</span></div>';
  h += '<label class="chk notify-chk"><input type="checkbox" id="resumeNotify"' + (Resume.notify ? ' checked' : '') + ' data-chg="resume-notify"> 做出决定后马上通知候选人（也可以筛完一批再统一通知）</label>';
  if (Resume.tab === 'original') {
    h += '<div class="cand-sec">' + resumeOriginalHTML(c) + '</div>';
    el.innerHTML = h; return;
  }
  h += '<div class="match-box"><div class="mb-left">' + matchRing(c.match.score, 96) + '<div class="mb-grade">' + mg.t + '</div></div><div class="match-rows">' +
    ['edu', 'exp', 'skill', 'salary', 'school'].map(function (k) {
      var p = c.match.parts[k], label = { edu: '学历', exp: '经验', skill: '技能', salary: '薪资', school: '院校' }[k];
      return '<div class="match-row"><span class="mk">' + label + '</span><span class="mv">' + esc(p.note) + '</span><span class="ms">' + p.v + '<small>/' + p.max + '</small></span></div>';
    }).join('') + '</div></div>';
  h += '<div class="cand-sec"><h3>求职意向</h3><div class="info-grid"><div class="k">期望职位</div><div>' + esc(job ? job.title : '—') + '</div><div class="k">期望薪资</div><div>' + esc(c.resume.expected) + '</div><div class="k">期望城市</div><div>' + esc(c.resume.city) + '</div><div class="k">求职状态</div><div>' + esc(c.resume.availability) + '</div></div></div>';
  h += '<div class="cand-sec"><h3>教育经历</h3>' + c.resume.eduList.map(function (e) { return '<div class="edu-line"><b>' + esc(e.school) + '</b><span class="muted">' + esc(e.major + ' · ' + e.degree) + '</span><span class="muted" style="margin-left:auto;font-family:var(--num)">' + esc(e.start + ' – ' + e.end) + '</span></div>'; }).join('') + '</div>';
  h += '<div class="cand-sec"><h3>工作经历</h3>' + c.resume.workList.map(function (w) { return '<div class="work-item"><b>' + esc(w.company) + '</b><div class="wm">' + esc(w.title + ' · ' + (w.start || '') + ' – ' + (w.end || '至今')) + '</div><p>' + esc(w.desc) + '</p></div>'; }).join('') + '</div>';
  h += '<div class="cand-sec"><h3>技能标签</h3><div class="tags">' + (c.resume.skills || []).map(function (s) { return '<span class="tag gray">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  h += '<div class="cand-sec"><h3>自我评价</h3><div class="resume-summary">' + esc(c.resume.summary) + '</div></div>';
  h += '<div class="cand-sec" style="display:flex;gap:8px;padding-bottom:24px"><button class="btn btn-light btn-sm" data-act="resume-edit" data-cid="' + c.id + '">' + ICON.edit + '编辑简历</button><button class="btn btn-ghost btn-sm" data-act="resume-del" data-cid="' + c.id + '" style="color:var(--red)">' + ICON.trash + '删除</button></div>';
  el.innerHTML = h;
};
function resumeOriginalHTML(c) {
  var job = jobById(c.jobId);
  return '<div class="resume-paper" style="background:#fff;border-radius:12px;box-shadow:0 0 0 1px var(--line);padding:28px 32px;max-width:720px;margin:0 auto;line-height:1.75;font-size:13px;color:#2a2a29">' +
    '<div style="display:flex;align-items:flex-start;gap:16px;border-bottom:2px solid #171717;padding-bottom:14px;margin-bottom:16px"><div style="flex:1"><div style="font-size:26px;font-weight:800">' + esc(c.name) + '</div><div style="color:#5c5c5a;margin-top:2px">' + esc(c.resume.degree + ' · ' + c.resume.years + ' 年经验 · ' + (job ? job.title : '')) + '</div><div style="color:#9a9a97;font-size:12px;margin-top:4px">' + esc(c.phone + ' · ' + c.email + ' · ' + c.resume.city) + '</div></div><div style="text-align:right;font-size:12px;color:#9a9a97">附件：' + esc(c.name + '-简历.pdf') + '</div></div>' +
    '<div style="font-weight:700;margin:12px 0 6px">求职意向</div><div style="color:#5c5c5a">' + esc((job ? job.title : '') + ' · ' + c.resume.expected + ' · ' + c.resume.city + ' · ' + c.resume.availability) + '</div>' +
    '<div style="font-weight:700;margin:14px 0 6px">教育经历</div>' + c.resume.eduList.map(function (e) { return '<div style="display:flex;gap:12px"><b>' + esc(e.school) + '</b><span style="color:#5c5c5a">' + esc(e.major + ' · ' + e.degree) + '</span><span style="margin-left:auto;color:#9a9a97;font-family:var(--num)">' + esc(e.start + ' – ' + e.end) + '</span></div>'; }).join('') +
    '<div style="font-weight:700;margin:14px 0 6px">工作经历</div>' + c.resume.workList.map(function (w) { return '<div style="margin-bottom:8px"><div style="display:flex;gap:12px"><b>' + esc(w.company) + '</b><span style="color:#5c5c5a">' + esc(w.title) + '</span><span style="margin-left:auto;color:#9a9a97;font-family:var(--num)">' + esc((w.start || '') + ' – ' + (w.end || '至今')) + '</span></div><div style="color:#5c5c5a;font-size:12.5px">' + esc(w.desc) + '</div></div>'; }).join('') +
    '<div style="font-weight:700;margin:14px 0 6px">技能</div><div class="tags">' + (c.resume.skills || []).map(function (s) { return '<span class="tag gray">' + esc(s) + '</span>'; }).join('') + '</div>' +
    '<div style="font-weight:700;margin:14px 0 6px">自我评价</div><div style="color:#5c5c5a">' + esc(c.resume.summary) + '</div>' +
    '<div style="margin-top:18px;text-align:right"><button class="btn btn-light btn-sm" data-act="resume-print">' + ICON.print + '打印 / 导出 PDF</button></div></div>';
}
UI.act['resume-print'] = function () { window.print(); };

/* ---------- 筛选交互 ---------- */
UI.act['resume-status'] = function (el) {
  var v = el.getAttribute('data-v');
  if (v === 'all') Resume.status = [];
  else {
    var i = Resume.status.indexOf(v);
    if (i >= 0) Resume.status.splice(i, 1); else Resume.status.push(v);
    if (!Resume.status.length) Resume.status = [];
  }
  Resume.renderFilters(); Resume.renderList();
};
UI.act['resume-job'] = function (el) { Resume.job = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-match'] = function (el) { Resume.match = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-edu'] = function (el) { Resume.edu = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-years'] = function (el) { Resume.years = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-source'] = function (el) { Resume.source = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-gender'] = function (el) { Resume.gender = el.getAttribute('data-v'); Resume.renderFilters(); Resume.renderList(); };
UI.act['resume-more'] = function () { Resume.more = !Resume.more; Resume.renderFilters(); };
UI.act['resume-clear'] = function () { Resume.q = ''; Resume.status = []; Resume.job = 'all'; Resume.match = 'all'; Resume.edu = 'all'; Resume.years = 'all'; Resume.source = 'all'; Resume.gender = 'all'; Resume.renderFilters(); Resume.renderList(); };
UI.inp['resume-q'] = function (el) { Resume.q = el.value; Resume.renderFilters(); Resume.renderList(); };
UI.chg['resume-sort'] = function (el) { Resume.sort = el.value; Resume.renderList(); };
UI.act['resume-sel'] = function (el) { Resume.sel = el.getAttribute('data-cid'); Resume.tab = 'resume'; Resume.renderList(); };
UI.act['resume-tab'] = function (el) { Resume.tab = el.getAttribute('data-tab'); Resume.renderDetail(); };
UI.act['resume-prev'] = function () { var i = Resume.list.map(function (c) { return c.id; }).indexOf(Resume.sel); if (i > 0) { Resume.sel = Resume.list[i - 1].id; Resume.renderList(); } };
UI.act['resume-next'] = function () { var i = Resume.list.map(function (c) { return c.id; }).indexOf(Resume.sel); if (i >= 0 && i < Resume.list.length - 1) { Resume.sel = Resume.list[i + 1].id; Resume.renderList(); } };
UI.act['resume-star'] = function (el) { var c = candById(Resume.sel); if (c) { c.star = +el.getAttribute('data-n'); save(); Resume.renderDetail(); } };
UI.chg['resume-notify'] = function (el) { Resume.notify = el.checked; };
UI.chg['resume-check'] = function (el) { var cid = el.getAttribute('data-cid'); if (el.checked) Resume.checked[cid] = true; else delete Resume.checked[cid]; Resume.renderList(); };
UI.chg['resume-all'] = function (el) { Resume.list.forEach(function (c) { if (el.checked) Resume.checked[c.id] = true; else delete Resume.checked[c.id]; }); Resume.renderList(); };
Resume.renderListHeadOnly = function () { var head = $('#resumeListHead'); if (!head) return; var allChecked = Resume.list.length && Resume.list.every(function (c) { return Resume.checked[c.id]; }); var cb = head.querySelector('#resumeAll'); if (cb) cb.checked = allChecked; };
UI.act['resume-uncheck'] = function () { Resume.checked = {}; Resume.renderList(); };

/* ---------- 通过 / 待定 / 不通过 ---------- */
function candidateNext(c) {
  var list = Resume.list, i = list.map(function (x) { return x.id; }).indexOf(c.id);
  return i >= 0 && i < list.length - 1 ? list[i + 1].id : (list.length > 1 ? list[0].id : null);
}
function setCandidateScreen(c, screen, notify) {
  c.screen = screen;
  if (screen === 'passed') { if (c.stage === 'rejected' || !c.stage) c.stage = 'written'; }
  if (screen === 'rejected') c.stage = 'rejected';
  if (notify) {
    var type = screen === 'passed' ? 'screeningPass' : screen === 'rejected' ? 'screeningReject' : null;
    if (type) addCandidateNotification(c, type, { 下一环节: '笔试' });
  }
  save();
}
function addCandidateNotification(c, type, extra) {
  var exists = S.notifications.some(function (n) { return n.cid === c.id && n.type === type && n.status === 'pending'; });
  if (exists) return;
  var tpl = S.settings.templates[type]; if (!tpl) return;
  var vars = notifyVars(c, extra);
  S.notifications.push({
    id: uid('nt'), cid: c.id, type: type, channels: ['sms', 'email'], status: 'pending', createdAt: Date.now(),
    title: { screeningPass: '初筛通过通知', screeningReject: '初筛未通过通知', offer: '录用通知', reject: '未录用通知', writtenInvite: '笔试邀请', interviewInvite: '面试邀请' }[type] || '通知',
    sms: renderTpl(tpl.sms, vars), subject: renderTpl(tpl.subject, vars), body: renderTpl(tpl.body, vars)
  });
}
function afterScreenChange(c, msg) {
  UI.toast(msg);
  Resume.renderFilters(); Resume.renderList();
  UI.refreshSide();
}
UI.act['resume-pass'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  var next = candidateNext(c);
  setCandidateScreen(c, 'passed', Resume.notify);
  afterScreenChange(c, c.name + ' 已通过初筛，进入笔试' + (Resume.notify ? '，通知已加入待发送' : ''));
  if (next) Resume.sel = next; Resume.renderList();
};
UI.act['resume-pending'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  setCandidateScreen(c, 'pending', false);
  afterScreenChange(c, c.name + ' 已标记为待定');
};
UI.act['resume-reject'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  var next = candidateNext(c);
  setCandidateScreen(c, 'rejected', Resume.notify);
  afterScreenChange(c, c.name + ' 已标记为未通过' + (Resume.notify ? '，通知已加入待发送' : ''));
  if (next) Resume.sel = next; Resume.renderList();
};
UI.act['resume-batch'] = function (el) {
  var ids = Object.keys(Resume.checked).filter(function (id) { return candById(id); });
  if (!ids.length) { UI.toast('先勾选候选人'); return; }
  var act = el.getAttribute('data-do');
  ids.forEach(function (id) { var c = candById(id); setCandidateScreen(c, act, Resume.notify); });
  Resume.checked = {};
  UI.toast('已处理 ' + ids.length + ' 位候选人' + (Resume.notify && act !== 'pending' ? '，通知已加入待发送' : ''));
  Resume.renderFilters(); Resume.renderList(); UI.refreshSide();
};
UI.act['resume-batch-notify'] = function () {
  var ids = Object.keys(Resume.checked).filter(function (id) { return candById(id); });
  openNotifyBatch(ids);
};
UI.act['resume-add'] = function () { openCandidateForm(null); };
UI.act['resume-edit'] = function (el) { openCandidateForm(candById(el.getAttribute('data-cid'))); };
UI.act['resume-del'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  UI.confirm('删除简历', '确定删除「' + esc(c.name) + '」的简历吗？相关的面试和通知也会一起删除。', '删除', function () {
    S.candidates = S.candidates.filter(function (x) { return x.id !== c.id; });
    S.interviews = S.interviews.filter(function (x) { return x.cid !== c.id; });
    S.notifications = S.notifications.filter(function (x) { return x.cid !== c.id; });
    save(); Resume.sel = null; Resume.renderFilters(); Resume.renderList(); UI.refreshSide(); UI.toast('已删除');
  }, true);
};
UI.act['resume-import'] = function () { openResumeImport(); };
UI.act['resume-rules'] = function () { openMatchRules(); };

/* 从其它页面打开候选人 */
function openCandidate(cid) {
  var c = candById(cid); if (!c) return;
  UI.closeDrawer(); UI.closeModal();
  if (UI.page !== 'resume') {
    Resume.sel = cid; Resume.tab = 'resume';
    if (c.screen === 'passed' || c.screen === 'rejected') Resume.status = [];
    else if (Resume.status.indexOf(c.screen) < 0) Resume.status = [c.screen];
    UI.go('resume');
  } else {
    Resume.sel = cid; Resume.renderFilters(); Resume.renderList();
  }
}
UI.act['open-cand'] = function (el) { var sp = $('#gsearchPop'); if (sp) sp.innerHTML = ''; openCandidate(el.getAttribute('data-cid')); };
