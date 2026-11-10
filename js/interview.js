/* =========================================================
   面试安排 · 今日 / 接下来、填写评价、改期、安排面试
   ========================================================= */
var Iv = { filter: 'upcoming', round: 'all', q: '' };
function ivList() {
  return S.interviews.filter(function (i) {
    if (Iv.round !== 'all' && String(i.round) !== Iv.round) return false;
    if (Iv.q) { var c = candById(i.cid); if (!c || (c.name + ' ' + candidateJobTitle(c)).indexOf(Iv.q) < 0) return false; }
    if (Iv.filter === 'today') return i.date === todayStr();
    if (Iv.filter === 'upcoming') return i.date >= todayStr() && i.status !== 'cancelled';
    if (Iv.filter === 'done') return i.status === 'done';
    if (Iv.filter === 'pending') return i.status === 'done' && (!i.feedback || i.feedback.result === 'pending');
    return i.status !== 'cancelled';
  }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
}
function ivScoreOf(i) {
  if (typeof i.score === 'number') return i.score;
  if (i.feedback) return Math.round(avg([i.feedback.professional, i.feedback.communication, i.feedback.culture, i.feedback.potential].filter(function (x) { return typeof x === 'number'; })));
  return null;
}
UI.register('interview', {
  render: function (main) {
    var today = todayInterviews(), pending = feedbackPending(), week = S.interviews.filter(function (i) { var d = daysTo(i.date); return d !== null && d >= 0 && d <= 7 && i.status !== 'cancelled'; });
    var done = S.interviews.filter(function (i) { return i.status === 'done' && ivScoreOf(i) !== null; });
    var h = '<div class="page scroll"><div class="page-head"><div><h1 class="page-title">面试安排</h1><div class="page-desc">今日 <b>' + today.length + '</b> 场 · 待评价 <b>' + pending.length + '</b> 场 · 本周 <b>' + week.length + '</b> 场</div></div><div class="grow"></div><div class="actions"><button class="btn btn-light" data-act="iv-export">' + ICON.down + '导出日程</button><button class="btn btn-dark" data-act="iv-add">' + ICON.plus + '安排面试</button></div></div>';
    h += '<div class="stat-cards"><div class="stat-card"><div class="k">今日面试</div><div class="v">' + today.length + '<small>场</small></div><div class="d">' + today.filter(function (i) { return i.status === 'done'; }).length + ' 场已完成</div></div>' +
      '<div class="stat-card"><div class="k">待填写评价</div><div class="v">' + pending.length + '<small>场</small></div><div class="d">面完记得当天反馈</div></div>' +
      '<div class="stat-card"><div class="k">本周面试</div><div class="v">' + week.length + '<small>场</small></div><div class="d">含今日</div></div>' +
      '<div class="stat-card"><div class="k">平均面试分</div><div class="v">' + (done.length ? round1(avg(done.map(ivScoreOf))) : '—') + '</div><div class="d">已评价 ' + done.length + ' 场</div></div></div>';
    h += '<div class="filterbar"><input class="inp" placeholder="搜索候选人、职位" value="' + esc(Iv.q) + '" data-inp="iv-q"><div class="chips">' +
      [['all', '全部'], ['today', '今天'], ['upcoming', '接下来'], ['pending', '待评价'], ['done', '已完成']].map(function (f) { return '<button class="' + (Iv.filter === f[0] ? 'on' : '') + '" data-act="iv-filter" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<select class="sel" style="width:130px;height:34px;margin-left:auto" data-chg="iv-round"><option value="all">全部轮次</option><option value="1"' + (Iv.round === '1' ? ' selected' : '') + '>初试</option><option value="2"' + (Iv.round === '2' ? ' selected' : '') + '>复试</option><option value="3"' + (Iv.round === '3' ? ' selected' : '') + '>终试</option></select></div>';
    h += '<div class="iv-layout"><div>' + ivDayHTML() + '</div><div class="iv-rail">' + ivRailHTML() + '</div></div></div>';
    main.innerHTML = h;
  }
});
function ivDayHTML() {
  var list = ivList();
  if (!list.length) return '<div class="iv-day"><div class="iv-empty">没有符合条件的面试安排</div></div>';
  var groups = {};
  list.forEach(function (i) { (groups[i.date] = groups[i.date] || []).push(i); });
  var dates = Object.keys(groups).sort();
  return dates.map(function (date) {
    var arr = groups[date], d = parseDate(date);
    var title = date === todayStr() ? '今天' : date === addDays(todayStr(), 1) ? '明天' : (d.getMonth() + 1) + '月' + d.getDate() + '日';
    return '<div class="iv-day"><div class="iv-day-head"><b>' + title + '</b><span class="muted">星期' + WEEK[d.getDay()] + ' · ' + arr.length + ' 场</span></div>' +
      arr.map(function (i) {
        var c = candById(i.cid), job = c ? jobById(c.jobId) : null;
        var stTag = i.status === 'done' ? (i.feedback ? (i.feedback.result === 'pass' ? '<span class="tag green">通过</span>' : i.feedback.result === 'fail' ? '<span class="tag red">未通过</span>' : '<span class="tag amber">待定</span>') : '<span class="tag amber">待评价</span>') : '<span class="tag blue">待面试</span>';
        return '<div class="iv-item"><div class="iv-time">' + esc(i.time) + '<small>' + esc(i.duration || 45) + ' 分钟</small></div>' +
          '<div class="iv-main"><div class="iv-name">' + (c ? candAva(c, 24) : '') + esc(c ? c.name : '') + ' ' + (INTERVIEW_ROUNDS[i.round] || '面试') + '<span class="muted" style="font-weight:400;font-size:11.5px">' + esc(job ? job.title : '') + '</span></div>' +
          '<div class="iv-meta">' + esc((i.mode || '现场') + ' · ' + (i.place || '') + ' · 面试官：' + (i.interviewers || []).join('、')) + '</div></div>' +
          '<div class="iv-side">' + stTag + (i.status === 'done' ? '<button class="btn btn-xs btn-light" data-act="iv-feedback" data-id="' + i.id + '">' + (i.feedback ? '修改评价' : '填写评价') + '</button>' : '<button class="btn btn-xs btn-light" data-act="iv-reschedule" data-id="' + i.id + '">改期</button><button class="btn btn-xs btn-ghost" data-act="iv-cancel" data-id="' + i.id + '">取消</button>') + '</div></div>';
      }).join('') + '</div>';
  }).join('');
}
function ivRailHTML() {
  var pending = feedbackPending();
  var load = {};
  S.interviews.filter(function (i) { return i.status !== 'cancelled'; }).forEach(function (i) { (i.interviewers || []).forEach(function (n) { load[n] = (load[n] || 0) + 1; }); });
  var loadList = Object.keys(load).sort(function (a, b) { return load[b] - load[a]; }).slice(0, 6);
  var h = '<div class="panel"><div class="panel-title">待填写评价</div><div class="panel-sub">面完当天反馈，避免遗忘</div>';
  h += pending.length ? pending.slice(0, 5).map(function (i) { var c = candById(i.cid); return '<div class="iv-mini" data-act="iv-feedback" data-id="' + i.id + '" style="cursor:pointer"><span class="tm">' + esc(fmtShort(i.date)) + '</span><div style="flex:1"><b style="font-weight:600">' + esc(c ? c.name : '') + '</b><div class="muted" style="font-size:11px">' + esc(INTERVIEW_ROUNDS[i.round] || '面试') + '</div></div><span class="tag red">待评价</span></div>'; }).join('') : '<div class="muted" style="font-size:12px">暂无待评价的面试</div>';
  h += '</div><div class="panel"><div class="panel-title">面试官负载</div><div class="panel-sub">全部未取消的面试</div><div class="an-list">' + loadList.map(function (n) {
    var max = Math.max.apply(null, loadList.map(function (k) { return load[k]; }).concat([1]));
    return '<div class="an-list-row"><span>' + esc(n) + '</span><span class="ab"><i style="width:' + (load[n] / max * 100) + '%;background:#7a5af5"></i></span><span class="av">' + load[n] + '</span></div>';
  }).join('') + '</div></div>';
  h += '<div class="panel"><div class="panel-title">面试小贴士</div><div class="muted" style="font-size:12.5px;line-height:1.8">初试重点看基础与动机，复试重点看项目深度与协作。评价时先记录事实，再给结论；建议当天完成，避免印象衰减。</div></div>';
  return h;
}
UI.inp['iv-q'] = function (el) { Iv.q = el.value.trim(); UI.rerender(); };
UI.act['iv-filter'] = function (el) { Iv.filter = el.getAttribute('data-v'); UI.rerender(); };
UI.chg['iv-round'] = function (el) { Iv.round = el.value; UI.rerender(); };
UI.act['iv-export'] = function () {
  var rows = [['日期', '时间', '候选人', '职位', '轮次', '方式', '地点', '面试官', '状态', '评分']];
  ivList().forEach(function (i) { var c = candById(i.cid); rows.push([i.date, i.time, c ? c.name : '', c ? candidateJobTitle(c) : '', INTERVIEW_ROUNDS[i.round] || '', i.mode || '', i.place || '', (i.interviewers || []).join('、'), i.status, ivScoreOf(i) === null ? '' : ivScoreOf(i)]); });
  downloadFile('面试安排-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['iv-add'] = function () { openInterviewSchedule(null); };
UI.act['iv-reschedule'] = function (el) { openInterviewSchedule(el.getAttribute('data-id')); };
UI.act['iv-cancel'] = function (el) {
  var i = S.interviews.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!i) return;
  UI.confirm('取消面试', '确定取消这场面试吗？候选人会收到改期通知。', '取消面试', function () { i.status = 'cancelled'; save(); UI.rerender(); UI.refreshSide(); }, true);
};
UI.act['iv-feedback'] = function (el) { openInterviewFeedback(el.getAttribute('data-id')); };
UI.act['open-interview'] = function (el) {
  var i = S.interviews.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
  if (!i) return;
  if (i.status === 'done') openInterviewFeedback(i.id);
  else UI.go('interview');
};

function openInterviewSchedule(id) {
  var iv = id ? S.interviews.filter(function (x) { return x.id === id; })[0] : null;
  var pool = S.candidates.filter(function (c) { return c.screen === 'passed' && c.stage !== 'rejected' && c.stage !== 'hired'; });
  if (!pool.length) { UI.toast('没有可安排面试的候选人'); return; }
  var c0 = iv ? candById(iv.cid) : pool[0];
  var body = '<div class="row2"><div class="field"><label>候选人</label><select class="sel" id="ivCand">' + pool.map(function (c) { return '<option value="' + c.id + '"' + (c0 && c0.id === c.id ? ' selected' : '') + '>' + esc(c.name + ' · ' + candidateJobTitle(c)) + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label>轮次</label><select class="sel" id="ivRound">' + [1, 2, 3].map(function (r) { return '<option value="' + r + '"' + (iv && iv.round === r ? ' selected' : '') + '>' + INTERVIEW_ROUNDS[r] + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="row3"><div class="field"><label>日期</label><input class="inp" type="date" id="ivDate" value="' + (iv ? iv.date : addDays(todayStr(), 1)) + '"></div><div class="field"><label>时间</label><input class="inp" type="time" id="ivTime" value="' + (iv ? iv.time : '10:00') + '"></div><div class="field"><label>时长</label><select class="sel" id="ivDur"><option>45 分钟</option><option>30 分钟</option><option>60 分钟</option></select></div></div>' +
    '<div class="row2"><div class="field"><label>方式</label><select class="sel" id="ivMode"><option' + (iv && iv.mode === '现场' ? ' selected' : '') + '>现场</option><option' + (iv && iv.mode === '视频' ? ' selected' : '') + '>视频</option><option' + (iv && iv.mode === '电话' ? ' selected' : '') + '>电话</option></select></div><div class="field"><label>地点 / 链接</label><input class="inp" id="ivPlace" value="' + esc(iv ? iv.place : '公司 3 楼面试间') + '"></div></div>' +
    '<div class="field"><label>面试官</label><input class="inp" id="ivInterviewers" value="' + esc(iv ? (iv.interviewers || []).join('、') : '') + '" placeholder="多位面试官用顿号分隔"></div>' +
    '<label class="chk"><input type="checkbox" id="ivNotify" checked> 保存后生成面试邀请通知</label>';
  UI.modal({
    title: iv ? '修改面试安排' : '安排面试', body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="iv-save" data-id="' + (iv ? iv.id : '') + '">保存</button>'
  });
}
UI.act['iv-save'] = function (el) {
  var id = el.getAttribute('data-id'), c = candById($('#ivCand').value);
  if (!c) { UI.toast('请选择候选人'); return; }
  var date = $('#ivDate').value, time = $('#ivTime').value;
  if (!date || !time) { UI.toast('请选择日期和时间'); return; }
  var data = {
    cid: c.id, round: +$('#ivRound').value, date: date, time: time, duration: parseInt($('#ivDur').value, 10) || 45,
    mode: $('#ivMode').value, place: $('#ivPlace').value.trim(), interviewers: $('#ivInterviewers').value.split(/[、,，;；\s]+/).filter(Boolean)
  };
  var iv;
  if (id) { iv = S.interviews.filter(function (x) { return x.id === id; })[0]; Object.assign(iv, data); }
  else { iv = Object.assign({ id: uid('iv'), status: 'scheduled', score: null, feedback: null, note: '' }, data); S.interviews.push(iv); }
  if ($('#ivNotify') && $('#ivNotify').checked) addCandidateNotification(c, 'interviewInvite', { 面试时间: date + ' ' + time, 面试轮次: INTERVIEW_ROUNDS[data.round], 面试地点: data.place, 面试官: data.interviewers.join('、') });
  save(); UI.closeModal(); UI.toast(id ? '面试已改期' : '已安排面试'); UI.rerender(); UI.refreshSide();
};

function openInterviewFeedback(id) {
  var iv = S.interviews.filter(function (x) { return x.id === id; })[0];
  if (!iv) return;
  var c = candById(iv.cid), job = c ? jobById(c.jobId) : null;
  var f = iv.feedback || { professional: 80, communication: 80, culture: 80, potential: 80, result: 'pass', note: '' };
  var dims = [['professional', '专业能力'], ['communication', '沟通表达'], ['culture', '文化匹配'], ['potential', '成长潜力']];
  var body = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' + (c ? candAva(c, 40) : '') + '<div><b style="font-size:15px">' + esc(c ? c.name : '') + '</b><div class="muted" style="font-size:12px">' + esc((job ? job.title : '') + ' · ' + (INTERVIEW_ROUNDS[iv.round] || '面试') + ' · ' + iv.date + ' ' + iv.time) + '</div></div></div>' +
    dims.map(function (d) { return '<div class="field"><label style="display:flex;justify-content:space-between">' + d[1] + '<span class="num" id="fbv-' + d[0] + '">' + f[d[0]] + '</span></label><input type="range" min="0" max="100" step="1" value="' + f[d[0]] + '" data-inp="fb-range" data-k="' + d[0] + '" style="width:100%;accent-color:#171717"></div>'; }).join('') +
    '<div class="field"><label>结论</label><div class="seg light" id="fbResult">' + [['pass', '通过'], ['pending', '待定'], ['fail', '不通过']].map(function (r) { return '<button type="button" class="' + (f.result === r[0] ? 'on' : '') + '" data-act="fb-result" data-v="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div></div>' +
    '<div class="field"><label>评价记录</label><textarea class="ta" id="fbNote" placeholder="记录事实：项目细节、回答质量、风险点……">' + esc(f.note || '') + '</textarea></div>';
  UI.modal({
    title: '填写面试评价', body: body, wide: true,
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="fb-save" data-id="' + iv.id + '">保存评价</button>'
  });
  UI.modalCtx.fb = { professional: f.professional, communication: f.communication, culture: f.culture, potential: f.potential, result: f.result };
}
UI.inp['fb-range'] = function (el) {
  var k = el.getAttribute('data-k'); UI.modalCtx.fb[k] = +el.value;
  var lab = $('#fbv-' + k); if (lab) lab.textContent = el.value;
};
UI.act['fb-result'] = function (el) { UI.modalCtx.fb.result = el.getAttribute('data-v'); $$('#fbResult button').forEach(function (b) { b.classList.toggle('on', b === el); }); };
UI.act['fb-save'] = function (el) {
  var iv = S.interviews.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!iv) return;
  var f = UI.modalCtx.fb; f.note = $('#fbNote').value.trim();
  iv.feedback = f; iv.status = 'done'; iv.score = Math.round((f.professional + f.communication + f.culture + f.potential) / 4);
  var c = candById(iv.cid);
  if (c) {
    var rounds = c.scores.rounds || (c.scores.rounds = []);
    var r = rounds.filter(function (x) { return x.round === iv.round; })[0];
    if (r) { r.score = iv.score; r.date = iv.date; r.interviewer = (iv.interviewers || [])[0] || ''; }
    else rounds.push({ round: iv.round, score: iv.score, date: iv.date, interviewer: (iv.interviewers || [])[0] || '', note: '' });
    if (f.result === 'pass') {
      if (iv.round === 1) c.stage = 'interview2';
      else if (iv.round === 2) c.stage = 'offer';
      else c.stage = 'offer';
      if (c.stage === 'offer' && !offerOf(c.id)) S.offers.push({ id: uid('of'), cid: c.id, status: 'draft', salary: jobById(c.jobId) ? jobById(c.jobId).salary : '', sentAt: null, onboardDate: '', note: '' });
    } else if (f.result === 'fail') c.stage = 'rejected';
  }
  save(); UI.closeModal(); UI.toast('面试评价已保存'); UI.rerender(); UI.refreshSide();
  if (UI.page === 'office') refreshOffice();
};
