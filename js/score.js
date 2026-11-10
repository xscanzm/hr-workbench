/* =========================================================
   综合成绩 · 简历 / 笔试 / 面试加权、等级、Offer、录用通知
   ========================================================= */
var Score = { q: '', job: 'all', grade: 'all', stage: 'all', complete: 'all', more: false, sort: 'score', checked: {} };
function completenessOf(c) {
  var hasResume = typeof c.scores.resume === 'number';
  var hasWritten = typeof c.scores.written === 'number';
  var hasInterview = (c.scores.rounds || []).length > 0;
  var n = (hasResume ? 1 : 0) + (hasWritten ? 1 : 0) + (hasInterview ? 1 : 0);
  return { n: n, full: n === 3, hasResume: hasResume, hasWritten: hasWritten, hasInterview: hasInterview, missing: [!hasResume ? '简历' : '', !hasWritten ? '笔试' : '', !hasInterview ? '面试' : ''].filter(Boolean) };
}
function scoreFiltered() {
  var list = scoreScope().filter(function (c) {
    if (Score.job !== 'all' && c.jobId !== Score.job) return false;
    var co = compositeOf(c), g = gradeOf(co.score);
    if (Score.grade !== 'all' && g !== Score.grade) return false;
    if (Score.stage !== 'all' && c.stage !== Score.stage) return false;
    var cp = completenessOf(c);
    if (Score.complete === 'full' && !cp.full) return false;
    if (Score.complete === 'written' && cp.hasWritten) return false;
    if (Score.complete === 'interview' && cp.hasInterview) return false;
    if (Score.q) { var q = Score.q.toLowerCase(); if ((c.name + ' ' + candidateJobTitle(c) + ' ' + c.resume.school).toLowerCase().indexOf(q) < 0) return false; }
    return true;
  });
  list.sort(function (a, b) {
    var sa = compositeOf(a).score, sb = compositeOf(b).score;
    if (Score.sort === 'name') return a.name.localeCompare(b.name, 'zh');
    return (sb === null ? -1 : sb) - (sa === null ? -1 : sa);
  });
  return list;
}
function gradeCounts(list) {
  var m = { A: 0, B: 0, C: 0, D: 0 };
  list.forEach(function (c) { var g = gradeOf(compositeOf(c).score); if (g) m[g]++; });
  return m;
}
UI.register('score', {
  render: function (main) {
    var scope = scoreScope(), list = scoreFiltered(), gc = gradeCounts(scope);
    var scored = scope.filter(function (c) { return compositeOf(c).score !== null; });
    var full = scope.filter(function (c) { return completenessOf(c).full; });
    var avgScore = scored.length ? round1(avg(scored.map(function (c) { return compositeOf(c).score; }))) : null;
    var w = S.settings.weights, nq = notifyQueue();
    var h = '<div class="page scroll score-page"><div class="page-head"><div><h1 class="page-title">综合成绩</h1><div class="page-desc">评分权重：简历 <b>' + w.resume + '%</b> · 笔试 <b>' + w.written + '%</b> · 面试 <b>' + w.interview + '%</b></div></div><div class="grow"></div><div class="actions"><button class="btn btn-light" data-act="score-export">' + ICON.down + '导出成绩单</button><button class="btn btn-dark" data-act="score-rules">' + ICON.score + '评分规则</button></div></div>';
    var offerN = nq.filter(function (n) { return n.type === 'offer'; }).length, rejectN = nq.filter(function (n) { return n.type === 'reject'; }).length;
    if (offerN || rejectN) h += '<div class="notice-bar"><span class="nb-title">' + ICON.bell + '待发送的通知：</span>' + (offerN ? '<button class="nb-chip" data-act="notify-open" data-type="offer"><i class="dot" style="background:#1d9a57"></i>录用通知 <b>' + offerN + '</b></button>' : '') + (rejectN ? '<button class="nb-chip" data-act="notify-open" data-type="reject"><i class="dot" style="background:#e5483b"></i>未录用通知 <b>' + rejectN + '</b></button>' : '') + '</div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">参评人数</div><div class="v">' + scored.length + '<small>人</small></div><div class="d">全部 ' + scope.length + ' 人</div></div>' +
      '<div class="stat-card"><div class="k">环节齐全</div><div class="v">' + full.length + '<small>人</small></div><div class="d">其余为暂估</div></div>' +
      '<div class="stat-card"><div class="k">平均综合分</div><div class="v">' + (avgScore === null ? '—' : avgScore) + '</div><div class="d">满分 100</div></div>' +
      '<div class="stat-card"><div class="k">等级分布</div><div class="grade-dist"><div class="grade-bar">' + ['A', 'B', 'C', 'D'].map(function (g, i) { var p = scope.length ? gc[g] / scope.length * 100 : 0; return '<i style="width:' + p + '%;background:' + ['#1d9a57', '#2f7ff0', '#f2a71b', '#e5483b'][i] + '"></i>'; }).join('') + '</div><div class="grade-legend">' + ['A', 'B', 'C', 'D'].map(function (g, i) { return '<span><i style="background:' + ['#1d9a57', '#2f7ff0', '#f2a71b', '#e5483b'][i] + '"></i>' + g + ' ' + gc[g] + '</span>'; }).join('') + '</div></div></div></div>';
    // 筛选
    var jobCount = {}, gradeCount = gc, stageCount = {};
    scope.forEach(function (c) { jobCount[c.jobId] = (jobCount[c.jobId] || 0) + 1; stageCount[c.stage] = (stageCount[c.stage] || 0) + 1; });
    h += '<div class="filter-panel"><div class="f-top"><input class="inp" placeholder="搜索姓名、学校、公司" value="' + esc(Score.q) + '" data-inp="score-q"><span class="f-count">筛出 <b>' + list.length + '</b> / ' + scope.length + ' 人</span><div class="grow"></div><select class="sel" data-chg="score-sort"><option value="score"' + (Score.sort === 'score' ? ' selected' : '') + '>综合分从高到低</option><option value="name"' + (Score.sort === 'name' ? ' selected' : '') + '>姓名排序</option></select></div>';
    function chip(label, on, act, v, n) { return '<button class="f-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-v="' + v + '">' + label + (n !== undefined ? ' <b>' + n + '</b>' : '') + '</button>'; }
    h += '<div class="f-row"><div class="f-label">应聘职位</div><div class="f-chips">' + chip('不限', Score.job === 'all', 'score-job', 'all') + S.jobs.map(function (j) { return chip(j.title, Score.job === j.id, 'score-job', j.id, jobCount[j.id] || 0); }).join('') + '</div></div>';
    h += '<div class="f-row"><div class="f-label">综合等级</div><div class="f-chips">' + chip('不限', Score.grade === 'all', 'score-grade', 'all') + ['A', 'B', 'C', 'D'].map(function (g) { return chip(GRADES[g].t, Score.grade === g, 'score-grade', g, gradeCount[g] || 0); }).join('') + '</div></div>';
    h += '<div class="f-row"><div class="f-label">当前阶段</div><div class="f-chips">' + chip('不限', Score.stage === 'all', 'score-stage', 'all') + ['written', 'interview1', 'interview2', 'offer', 'hired', 'rejected'].map(function (s) { return chip(STAGE[s].t, Score.stage === s, 'score-stage', s, stageCount[s] || 0); }).join('') + '</div></div>';
    h += '<div class="f-row"><div class="f-label">完成情况</div><div class="f-chips">' + chip('不限', Score.complete === 'all', 'score-complete', 'all') + chip('环节齐全', Score.complete === 'full', 'score-complete', 'full', full.length) + chip('缺笔试成绩', Score.complete === 'written', 'score-complete', 'written', scope.filter(function (c) { return !completenessOf(c).hasWritten; }).length) + chip('缺面试评价', Score.complete === 'interview', 'score-complete', 'interview', scope.filter(function (c) { return !completenessOf(c).hasInterview; }).length) + '</div></div>';
    h += '<div class="f-row" style="align-items:center"><button class="f-more" data-act="score-more">' + (Score.more ? '收起筛选' : '更多筛选（3）') + ' <span style="font-size:10px">' + (Score.more ? '▴' : '▾') + '</span></button>';
    var sel = [];
    if (Score.job !== 'all') sel.push('职位：' + (jobById(Score.job) || {}).title);
    if (Score.grade !== 'all') sel.push('等级：' + Score.grade);
    if (Score.stage !== 'all') sel.push('阶段：' + STAGE[Score.stage].t);
    if (Score.complete !== 'all') sel.push('完成：' + ({ full: '环节齐全', written: '缺笔试成绩', interview: '缺面试评价' })[Score.complete]);
    if (sel.length) h += '<div class="f-selected"><span>已选：</span>' + sel.map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('') + '<button class="clear" data-act="score-clear">清空筛选</button></div>';
    h += '</div></div>';
    // 表格
    h += '<div class="tbl-wrap"><table class="tbl score-tbl"><thead><tr><th style="width:34px"><label class="chk"><input type="checkbox" data-chg="score-all"' + (list.length && list.every(function (c) { return Score.checked[c.id]; }) ? ' checked' : '') + '></label></th><th>职位内排名</th><th>候选人</th><th>应聘职位</th><th class="c">简历</th><th class="c">笔试</th><th class="c">面试</th><th class="c">调整</th><th>综合分</th><th>等级</th><th>当前阶段</th><th class="r">录用通知</th></tr></thead><tbody>';
    if (!list.length) h += '<tr><td colspan="12"><div class="empty">没有符合条件的候选人</div></td></tr>';
    list.forEach(function (c) {
      var co = compositeOf(c), g = gradeOf(co.score), job = jobById(c.jobId), rk = rankInJob(c), offer = offerOf(c.id);
      var col = g === 'A' ? '#1d9a57' : g === 'B' ? '#2f7ff0' : g === 'C' ? '#f2a71b' : '#e5483b';
      h += '<tr class="click" data-act="score-open" data-cid="' + c.id + '"><td onclick="event.stopPropagation()"><label class="chk"><input type="checkbox" data-chg="score-check" data-cid="' + c.id + '"' + (Score.checked[c.id] ? ' checked' : '') + '></label></td>' +
        '<td><span class="rank-cell"><b>' + (rk.r || '—') + '</b><small>/' + rk.n + '</small></span></td>' +
        '<td><div class="cand-cell">' + candAva(c, 28) + esc(c.name) + '</div></td>' +
        '<td><span class="dept-cell"><i class="dot" style="background:' + deptColor(c.deptId) + '"></i>' + esc(job ? job.title : '') + '</span></td>' +
        '<td class="c num">' + (typeof c.scores.resume === 'number' ? c.scores.resume : '<span class="score-miss">—</span>') + '</td>' +
        '<td class="c num">' + (typeof c.scores.written === 'number' ? c.scores.written : '<span class="score-miss">—</span>') + '</td>' +
        '<td class="c num">' + (interviewAvg(c) === null ? '<span class="score-miss">—</span>' : interviewAvg(c) + '<span class="muted" style="font-size:11px"> ' + (c.scores.rounds || []).length + '轮</span>') + '</td>' +
        '<td class="c"><input class="adj-inp" type="number" value="' + (c.scores.adjust || 0) + '" data-chg="score-adjust" data-cid="' + c.id + '" onclick="event.stopPropagation()"></td>' +
        '<td><span class="score-bar"><i style="width:' + (co.score === null ? 0 : co.score) + '%;background:' + col + '"></i></span><span class="score-num">' + (co.score === null ? '—' : co.score) + '</span>' + (co.estimated ? '<span class="muted" style="font-size:10.5px;margin-left:3px">暂估</span>' : '') + '</td>' +
        '<td>' + gradeTag(g) + '</td>' +
        '<td>' + stageTag(c.stage) + '</td>' +
        '<td class="r"><div class="offer-cell">' + offerCellHTML(c, offer) + '</div></td></tr>';
    });
    h += '</tbody></table></div>';
    if (Object.keys(Score.checked).length) h += '<div style="position:sticky;bottom:0;background:#fff;border-radius:12px;box-shadow:0 -4px 20px rgba(0,0,0,.08);padding:10px 14px;display:flex;align-items:center;gap:8px;margin-top:10px"><b style="font-size:13px">已选 ' + Object.keys(Score.checked).length + ' 人</b><span class="grow"></span><button class="btn btn-light btn-sm" data-act="score-batch-offer">发录用通知</button><button class="btn btn-light btn-sm" data-act="score-batch-reject">发未录用通知</button></div>';
    h += '</div>';
    main.innerHTML = h;
  }
});
function offerCellHTML(c, offer) {
  if (c.stage === 'hired') return '<span class="offer-sent">' + ICON.check + '已入职 ' + esc(fmtShort(c.hiredAt || (offer && offer.onboardDate) || todayStr())) + '</span>';
  if (c.stage === 'rejected') return '<span class="muted">—</span>';
  if (offer && offer.status === 'sent') return '<span class="offer-sent">' + ICON.check + '已发送 ' + esc(fmtShort(offer.sentAt)) + '</span>';
  if (offer && offer.status === 'accepted') return '<span class="offer-sent">' + ICON.check + '已接受</span>';
  return '<button class="btn btn-xs btn-light" data-act="score-offer" data-cid="' + c.id + '">' + ICON.send + '录用通知</button>';
}
UI.inp['score-q'] = function (el) { Score.q = el.value.trim(); UI.rerender(); };
UI.chg['score-sort'] = function (el) { Score.sort = el.value; UI.rerender(); };
UI.act['score-job'] = function (el) { Score.job = el.getAttribute('data-v'); UI.rerender(); };
UI.act['score-grade'] = function (el) { Score.grade = el.getAttribute('data-v'); UI.rerender(); };
UI.act['score-stage'] = function (el) { Score.stage = el.getAttribute('data-v'); UI.rerender(); };
UI.act['score-complete'] = function (el) { Score.complete = el.getAttribute('data-v'); UI.rerender(); };
UI.act['score-more'] = function () { Score.more = !Score.more; UI.toast('更多筛选：性别、来源、投递时间'); };
UI.act['score-clear'] = function () { Score.q = ''; Score.job = 'all'; Score.grade = 'all'; Score.stage = 'all'; Score.complete = 'all'; UI.rerender(); };
UI.chg['score-adjust'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  c.scores.adjust = clamp(parseFloat(el.value) || 0, -30, 30); save(); UI.rerender(); UI.toast('已调整综合分');
};
UI.chg['score-check'] = function (el) { var cid = el.getAttribute('data-cid'); if (el.checked) Score.checked[cid] = true; else delete Score.checked[cid]; UI.rerender(); };
UI.chg['score-all'] = function (el) { var list = scoreFiltered(); list.forEach(function (c) { if (el.checked) Score.checked[c.id] = true; else delete Score.checked[c.id]; }); UI.rerender(); };
UI.act['score-open'] = function (el) { openScoreCandidate(el.getAttribute('data-cid')); };
UI.act['score-export'] = function () {
  var rows = [['候选人', '应聘职位', '简历', '笔试', '面试', '面试轮次', '调整', '综合分', '等级', '当前阶段', 'Offer状态']];
  scoreFiltered().forEach(function (c) {
    var co = compositeOf(c), offer = offerOf(c.id);
    rows.push([c.name, candidateJobTitle(c), c.scores.resume === null ? '' : c.scores.resume, typeof c.scores.written === 'number' ? c.scores.written : '', interviewAvg(c) === null ? '' : interviewAvg(c), (c.scores.rounds || []).length, c.scores.adjust || 0, co.score === null ? '' : co.score, gradeOf(co.score) || '', STAGE[c.stage].t, offer ? offer.status : '']);
  });
  downloadFile('综合成绩-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['score-rules'] = function () {
  var w = S.settings.weights, g = S.settings.grade;
  UI.modal({
    title: '评分规则', body: '<p style="margin:0 0 14px;color:var(--ink2);line-height:1.7;font-size:13px">综合分 = 简历 × 权重 + 笔试 × 权重 + 面试 × 权重。某个环节还没有成绩时，按已有环节重新分配权重，表格里会标「暂估」；调整分可以直接加减。</p>' +
      '<div class="row3"><div class="field"><label>简历权重</label><input class="inp num" id="srResume" type="number" value="' + w.resume + '"></div><div class="field"><label>笔试权重</label><input class="inp num" id="srWritten" type="number" value="' + w.written + '"></div><div class="field"><label>面试权重</label><input class="inp num" id="srInterview" type="number" value="' + w.interview + '"></div></div>' +
      '<div class="row3"><div class="field"><label>A 级分数线</label><input class="inp num" id="srA" type="number" value="' + g.a + '"></div><div class="field"><label>B 级分数线</label><input class="inp num" id="srB" type="number" value="' + g.b + '"></div><div class="field"><label>C 级分数线</label><input class="inp num" id="srC" type="number" value="' + g.c + '"></div></div>', wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="sr-save">保存</button>'
  });
};
UI.act['sr-save'] = function () {
  var r = +$('#srResume').value || 0, w = +$('#srWritten').value || 0, i = +$('#srInterview').value || 0;
  if (r + w + i !== 100) { UI.toast('三项权重合计需要等于 100'); return; }
  S.settings.weights = { resume: r, written: w, interview: i };
  S.settings.grade = { a: +$('#srA').value || 80, b: +$('#srB').value || 70, c: +$('#srC').value || 60 };
  save(); UI.closeModal(); UI.rerender(); UI.toast('评分规则已保存');
};
UI.act['score-offer'] = function (el, e) {
  if (e) e.stopPropagation();
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  var offer = offerOf(c.id);
  if (!offer) { offer = { id: uid('of'), cid: c.id, status: 'draft', salary: (jobById(c.jobId) || {}).salary || '', sentAt: null, onboardDate: addDays(todayStr(), 15), note: '' }; S.offers.push(offer); }
  addCandidateNotification(c, 'offer', { 到岗日期: offer.onboardDate, 薪资: offer.salary });
  save(); openNotifyBatch([c.id], 'offer');
};
UI.act['score-batch-offer'] = function () {
  var ids = Object.keys(Score.checked);
  ids.forEach(function (id) { var c = candById(id); if (!c) return; if (!offerOf(id)) S.offers.push({ id: uid('of'), cid: id, status: 'draft', salary: (jobById(c.jobId) || {}).salary || '', sentAt: null, onboardDate: addDays(todayStr(), 15), note: '' }); addCandidateNotification(c, 'offer', { 到岗日期: addDays(todayStr(), 15) }); });
  save(); openNotifyBatch(ids, 'offer');
};
UI.act['score-batch-reject'] = function () {
  var ids = Object.keys(Score.checked);
  ids.forEach(function (id) { var c = candById(id); if (c) addCandidateNotification(c, 'reject'); });
  save(); openNotifyBatch(ids, 'reject');
};

function openScoreCandidate(cid) {
  var c = candById(cid); if (!c) return;
  var co = compositeOf(c), g = gradeOf(co.score), job = jobById(c.jobId), offer = offerOf(c.id);
  var h = '<div class="dr-hero">' + candAva(c, 72) + '<div><div class="dr-name">' + esc(c.name) + '<span class="tag ' + (g ? GRADES[g].tone : 'gray') + '">' + (g ? GRADES[g].short : '未评分') + '</span></div><div class="dr-meta">' + esc((job ? job.title : '') + ' · ' + deptName(c.deptId) + ' · ' + c.resume.degree + ' · ' + c.resume.school + ' · ' + c.resume.years + ' 年') + '</div><div class="tags" style="margin-top:8px">' + stageTag(c.stage) + screenTag(c.screen) + (co.estimated ? '<span class="tag amber">暂估</span>' : '<span class="tag green">环节齐全</span>') + '</div></div>' +
    '<div class="dr-tools"><button class="btn btn-sm btn-light" data-act="open-cand" data-cid="' + c.id + '">' + ICON.resume + '查看简历</button>' + (c.stage !== 'rejected' ? '<button class="btn btn-sm btn-dark" data-act="score-offer" data-cid="' + c.id + '">' + ICON.send + '录用通知</button>' : '') + '<button class="modal-x" data-act="drawer-close">' + ICON.x + '</button></div></div>';
  h += '<div class="tabs"><button class="on">综合成绩</button></div><div class="drawer-body">';
  h += '<div class="emp-kpis" style="margin:18px 0 14px;grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">综合分</div><div class="v" style="color:' + (g === 'A' ? '#167a45' : g === 'B' ? '#1f63c7' : g === 'C' ? '#a86c00' : '#c23a2e') + '">' + (co.score === null ? '—' : co.score) + '</div><div class="d">' + (g ? GRADES[g].t : '暂无') + '</div></div>' +
    '<div class="kpi"><div class="k">简历</div><div class="v">' + (typeof c.scores.resume === 'number' ? c.scores.resume : '—') + '<small>分</small></div><div class="d">权重 ' + S.settings.weights.resume + '%</div></div>' +
    '<div class="kpi"><div class="k">笔试</div><div class="v">' + (typeof c.scores.written === 'number' ? c.scores.written : '—') + '<small>分</small></div><div class="d">权重 ' + S.settings.weights.written + '%</div></div>' +
    '<div class="kpi"><div class="k">面试</div><div class="v">' + (interviewAvg(c) === null ? '—' : interviewAvg(c)) + '<small>分</small></div><div class="d">' + (c.scores.rounds || []).length + ' 轮 · 权重 ' + S.settings.weights.interview + '%</div></div></div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>评分明细</h3><div class="info-grid">' + co.parts.map(function (p) { return '<div class="k">' + ({ resume: '简历', written: '笔试', interview: '面试' })[p.k] + '</div><div><b class="num">' + p.v + '</b> × ' + p.w + '%</div>'; }).join('') + '<div class="k">调整分</div><div><input class="adj-inp" type="number" value="' + (c.scores.adjust || 0) + '" data-chg="score-adjust" data-cid="' + c.id + '"> 分</div><div class="k">计算说明</div><div class="muted">' + (co.estimated ? '有环节还没有成绩，按已有环节重新分配权重，当前为暂估分。' : '三个环节齐全，按 ' + S.settings.weights.resume + ' / ' + S.settings.weights.written + ' / ' + S.settings.weights.interview + ' 加权。') + '</div></div></div>';
  var rounds = (c.scores.rounds || []);
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>面试记录</h3>' + (rounds.length ? rounds.map(function (r) {
    var iv = S.interviews.filter(function (x) { return x.cid === c.id && x.round === r.round; })[0];
    return '<div class="iv-mini"><span class="tm">' + (INTERVIEW_ROUNDS[r.round] || '面试') + '</span><div style="flex:1"><b style="font-weight:600">' + r.score + ' 分</b><div class="muted" style="font-size:11.5px">' + esc((r.date || '') + ' · ' + (r.interviewer || '')) + '</div></div>' + (iv && iv.feedback ? '<span class="tag green">已评价</span>' : '<button class="btn btn-xs btn-light" data-act="iv-feedback" data-id="' + (iv ? iv.id : '') + '">填写评价</button>') + '</div>';
  }).join('') : '<div class="muted" style="font-size:12.5px">还没有面试记录</div>') + '</div>';
  h += '<div class="emp-panel" style="margin:0 0 14px"><h3>Offer</h3>' + (offer ? '<div class="info-grid"><div class="k">状态</div><div>' + ({ draft: '待发送', sent: '已发送，等待回复', accepted: '已接受', declined: '已拒绝', expired: '已过期' }[offer.status] || offer.status) + '</div><div class="k">薪资</div><div>' + esc(offer.salary || '—') + '</div><div class="k">到岗日期</div><div>' + esc(offer.onboardDate || '—') + '</div><div class="k">发出时间</div><div>' + (offer.sentAt ? esc(fmtTime(offer.sentAt)) : '—') + '</div></div>' : '<div class="muted" style="font-size:12.5px">还没有 Offer，点右上角「录用通知」发送。</div>') + '</div>';
  h += '<div style="display:flex;gap:8px;padding:4px 0 10px"><button class="btn btn-dark" data-act="score-offer" data-cid="' + c.id + '">' + ICON.send + '发送录用通知</button><button class="btn btn-light" data-act="score-reject-one" data-cid="' + c.id + '">发送未录用通知</button><button class="btn btn-light" data-act="score-hire" data-cid="' + c.id + '">办理入职</button></div></div>';
  UI.drawer(h, true);
}
UI.act['score-reject-one'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  addCandidateNotification(c, 'reject'); save(); openNotifyBatch([c.id], 'reject');
};
UI.act['score-hire'] = function (el) {
  var c = candById(el.getAttribute('data-cid')); if (!c) return;
  UI.confirm('办理入职', '确认「' + esc(c.name) + '」已入职？会创建员工档案并进入试用期。', '确认入职', function () {
    c.stage = 'hired'; c.hiredAt = todayStr();
    var job = jobById(c.jobId), dept = deptById(c.deptId);
    var e = {
      id: uid('e'), no: nextEmpNo(), name: c.name, gender: c.gender, deptId: c.deptId, title: job ? job.title : '', level: job ? job.level : 'P3',
      managerName: deptLead(c.deptId) ? deptLead(c.deptId).name : '', empStatus: 'probation', hireDate: todayStr(),
      probationEnd: addMonths(todayStr(), S.settings.probationMonths), contractEnd: addDays(addMonths(todayStr(), 36), -1),
      birthday: '', phone: c.phone, email: c.email, education: c.resume.degree, school: c.resume.school, major: c.resume.major, city: c.resume.city,
      salary: c.resume.expectedNum * 1000, materials: {}, tags: ['新人'], note: '', emergency: { name: '', rel: '父母', phone: '' }, address: '', bank: ''
    };
    S.settings.docTypes.forEach(function (d) { e.materials[d.id] = false; });
    S.employees.push(e); addEvent(e.id, '入职', '入职' + deptName(e.deptId) + ' · ' + e.title, todayStr());
    var offer = offerOf(c.id); if (offer) { offer.status = 'accepted'; offer.onboardDate = todayStr(); }
    save(); UI.closeDrawer(); UI.rerender(); UI.refreshSide(); UI.toast(c.name + ' 已办理入职');
  });
};
