/* =========================================================
   人事分析 · 人员 / 招聘 / 考勤 / 绩效 / 活动 / 培训
   ========================================================= */
var An = { tab: 'staff' };
var AN_TABS = [['staff', '人员'], ['recruit', '招聘'], ['attendance', '考勤'], ['performance', '绩效'], ['activities', '活动'], ['training', '培训']];
UI.register('analytics', {
  render: function (main) {
    var h = '<div class="page scroll analytics-page"><div class="page-head"><div><h1 class="page-title">人事分析</h1><div class="page-desc">' + esc(S.settings.company) + ' · 数据截至 ' + todayStr() + '</div></div><div class="grow"></div><div class="actions"><button class="btn btn-light" data-act="an-export">' + ICON.down + '导出分析数据</button></div></div>';
    h += '<div class="tabs" style="margin-bottom:16px">' + AN_TABS.map(function (t) { return '<button class="' + (An.tab === t[0] ? 'on' : '') + '" data-act="an-tab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="anBody"></div></div>';
    main.innerHTML = h;
    renderAnBody();
  }
});
function renderAnBody() {
  var el = $('#anBody'); if (!el) return;
  UI.charts = [];
  el.innerHTML = An.tab === 'staff' ? anStaffHTML() : An.tab === 'recruit' ? anRecruitHTML() : An.tab === 'attendance' ? anAttendanceHTML() : An.tab === 'performance' ? anPerformanceHTML() : An.tab === 'activities' ? anActivitiesHTML() : anTrainingHTML();
  UI.drawCharts();
}
UI.act['an-tab'] = function (el) { An.tab = el.getAttribute('data-v'); $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b === el); }); renderAnBody(); };

function anStats(cards) {
  return '<div class="stat-cards" style="grid-template-columns:repeat(' + cards.length + ',1fr)">' + cards.map(function (x) { return '<div class="stat-card"><div class="k">' + x[0] + '</div><div class="v">' + x[1] + '</div><div class="d">' + x[2] + '</div></div>'; }).join('') + '</div>';
}
function anPanel(title, sub, body) { return '<div class="an-panel"><div class="panel-title">' + title + '</div><div class="panel-sub">' + sub + '</div>' + body + '</div>'; }

function anStaffHTML() {
  var list = activeEmployees(), hc = headcountStats();
  var h = anStats([['在职人数', hc.total + '<small>人</small>', '男 ' + hc.male + ' · 女 ' + hc.female], ['平均司龄', hc.avgTenure + '<small>年</small>', '试用期 ' + hc.probation + ' 人'], ['本月入职', hc.joinedThisMonth + '<small>人</small>', '本月离职 ' + hc.leftThisMonth + ' 人'], ['部门数', S.departments.length + '<small>个</small>', '负责人已设置 ' + S.departments.filter(function (d) { return d.leadId; }).length + ' 个'], ['档案齐全度', pct(overallMaterials().rate), overallMaterials().people + ' 人材料不齐']]);
  h += '<div class="an-grid2"><div>' + anPanel('部门人数分布', '在职员工按部门', UI.chart(function (w) {
    return CH.bars(deptHeadcount().map(function (x) { return { label: x.d.name.replace('部', ''), value: x.n, color: x.d.color, tip: x.d.name + '：' + x.n + ' 人' }; }), w, { h: 230, valueLabels: true });
  })) + anPanel('入离职趋势', '最近 6 个月', UI.chart(function (w) {
    var labels = [], hires = [], lefts = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      var key = d.getFullYear() + '-' + pad2(d.getMonth() + 1);
      labels.push((d.getMonth() + 1) + '月');
      hires.push(S.employees.filter(function (e) { return monthKey(e.hireDate) === key; }).length);
      lefts.push(S.employees.filter(function (e) { return e.empStatus === 'left' && monthKey(e.leftDate) === key; }).length);
    }
    return CH.lines([{ name: '入职', color: CH.C.s1, values: hires, area: true }, { name: '离职', color: CH.C.s2, values: lefts }], labels, w, { h: 230, min: 0, fmt: function (v) { return Math.round(v) + ' 人'; } });
  }) + '<div class="an-legend"><span><i style="background:' + CH.C.s1 + '"></i>入职</span><span><i style="background:' + CH.C.s2 + '"></i>离职</span></div>') + '</div>';
  h += '<div>' + anPanel('司龄结构', '在职员工按司龄分组', UI.chart(function (w) {
    var buckets = [['1 年内', 0, 1], ['1-3 年', 1, 3], ['3-5 年', 3, 5], ['5 年以上', 5, 99]];
    return CH.bars(buckets.map(function (b) { var n = list.filter(function (e) { var y = tenureMonths(e.hireDate) / 12; return y >= b[1] && y < b[2]; }).length; return { label: b[0], value: n, color: '#7a5af5', tip: b[0] + '：' + n + ' 人' }; }), w, { h: 200 });
  })) + anPanel('年龄结构', '在职员工按年龄段', UI.chart(function (w) {
    var buckets = [['22-25', 22, 26], ['26-30', 26, 31], ['31-35', 31, 36], ['36-40', 36, 41], ['40+', 41, 99]];
    return CH.bars(buckets.map(function (b) { var n = list.filter(function (e) { var a = ageOf(e.birthday); return a !== null && a >= b[1] && a < b[2]; }).length; return { label: b[0], value: n, color: '#14b0a6', tip: b[0] + ' 岁：' + n + ' 人' }; }), w, { h: 200 });
  })) + '</div></div>';
  return h;
}
function anRecruitHTML() {
  var jobs = jobsWithStats(), need = sum(S.jobs.map(function (j) { return j.headcount || 0; }));
  var hired = S.candidates.filter(function (c) { return c.stage === 'hired'; }).length, offers = S.candidates.filter(function (c) { return c.stage === 'offer'; }).length;
  var funnel = recruitFunnel();
  var h = anStats([['在招职位', S.jobs.filter(function (j) { return j.status !== 'closed'; }).length + '<small>个</small>', '需求 ' + need + ' 人'], ['已入职', hired + '<small>人</small>', '招聘完成率 ' + (need ? Math.round(hired / need * 100) : 0) + '%'], ['Offer', offers + '<small>人</small>', '等待回复 ' + pendingOffers().length + ' 人'], ['在流程候选人', activeCandidates().length + '<small>人</small>', '待筛选 ' + screeningList().length + ' 份'], ['平均匹配度', Math.round(avg(S.candidates.map(function (c) { return c.match.score; }))) + '<small>分</small>', '全部简历']]);
  h += '<div class="an-grid2">' + anPanel('招聘漏斗', '从简历到入职', UI.chart(function (w) { return CH.bars(funnel.map(function (x, i) { return { label: x.label, value: x.value, color: ['#2f7ff0', '#5b8def', '#7a5af5', '#14b0a6', '#f2a71b', '#1d9a57'][i], tip: x.label + '：' + x.value + ' 人' }; }), w, { h: 230 }); })) + anPanel('招聘渠道效果', '投递 / 入职', UI.chart(function (w) { var st = sourceStats(); return CH.groupBars(st.map(function (s) { return s.name; }), [{ name: '投递', color: '#2f7ff0', values: st.map(function (s) { return s.n; }) }, { name: '入职', color: '#1d9a57', values: st.map(function (s) { return s.hired; }) }], w, { h: 230 }); }) + '<div class="an-legend"><span><i class="sq" style="background:#2f7ff0"></i>投递</span><span><i class="sq" style="background:#1d9a57"></i>入职</span></div>') + '</div>';
  h += '<div class="an-grid2">' + anPanel('面试轮次通过率', '已填写评价的面试', '<div class="an-list">' + [1, 2, 3].map(function (r) {
    var list2 = S.interviews.filter(function (i) { return i.round === r && i.status === 'done' && i.feedback; });
    var pass = list2.filter(function (i) { return i.feedback.result === 'pass'; }).length, rate = list2.length ? Math.round(pass / list2.length * 100) : 0;
    return '<div class="an-list-row"><span>' + (INTERVIEW_ROUNDS[r] || ('第' + r + '轮')) + '</span><span class="ab"><i style="width:' + rate + '%;background:#7a5af5"></i></span><span class="av">' + rate + '%</span></div>';
  }).join('') + '</div>') + anPanel('部门招聘进度', '已入职 / 需求', '<div class="an-list">' + deptRecruitStats().map(function (x) { var p = x.need ? Math.min(100, Math.round(x.hired / x.need * 100)) : 0; return '<div class="an-list-row"><span>' + esc(x.d.name) + '</span><span class="ab"><i style="width:' + p + '%;background:' + x.d.color + '"></i></span><span class="av">' + x.hired + '/' + x.need + '</span></div>'; }).join('') + '</div>') + '</div>';
  return h;
}
function anAttendanceHTML() {
  var ts = todayStatusStats(), ms = attMonthStats(todayStr().slice(0, 7));
  var h = anStats([['今日在岗', ts.present + '<small>/' + ts.total + '</small>', '迟到 ' + ts.late + ' · 早退 ' + ts.early], ['本月出勤率', pct(ms.rate), '记录 ' + ms.days + ' 人次'], ['本月迟到', ms.late + '<small>人次</small>', '早退 ' + ms.early + ' 人次'], ['本月请假', ms.leave + '<small>天</small>', '出差 ' + ms.business + ' · 外勤 ' + ms.field], ['缺勤 / 未打卡', (ms.absent + ms.missing) + '<small>人次</small>', '缺勤 ' + ms.absent + ' · 未打卡 ' + ms.missing]]);
  var tr = attTrend(6);
  h += '<div class="an-grid2">' + anPanel('出勤率趋势', '最近 6 个月', UI.chart(function (w) { return CH.lines([{ name: '出勤率', color: CH.C.s3, values: tr.rates, area: true }], tr.labels, w, { h: 230, min: 70, max: 100, fmt: function (v) { return Math.round(v) + '%'; } }); })) + anPanel('部门出勤率', '本月', '<div class="an-list">' + deptHeadcount().map(function (x) {
    var rates = employeesOfDept(x.d.id).map(function (e) { return attMonthSummary(e.id, todayStr().slice(0, 7)).rate; }).filter(function (v) { return v !== null; });
    var r = rates.length ? Math.round(avg(rates) * 100) : 0;
    return '<div class="an-list-row"><span>' + esc(x.d.name) + '</span><span class="ab"><i style="width:' + r + '%;background:' + x.d.color + '"></i></span><span class="av">' + r + '%</span></div>';
  }).join('') + '</div>') + '</div>';
  var leaveByType = {};
  Object.keys(S.attendanceDays).forEach(function (ds) { Object.keys(S.attendanceDays[ds]).forEach(function (eid) { var r = S.attendanceDays[ds][eid]; if (r.status === 'leave') { var n = leaveTypeName(r.leaveType); leaveByType[n] = (leaveByType[n] || 0) + 1; } }); });
  h += '<div class="an-grid2">' + anPanel('请假类型分布', '按考勤记录统计', UI.chart(function (w) { return CH.bars(Object.keys(leaveByType).map(function (k) { return { label: k, value: leaveByType[k], color: '#f2a71b', tip: k + '：' + leaveByType[k] + ' 天' }; }), w, { h: 210 }); })) + anPanel('今日异常', '迟到 / 早退 / 缺勤', '<div class="an-list">' + (attExceptionsToday().length ? attExceptionsToday().map(function (x) { return '<div class="an-kv"><span>' + esc(x.e.name + ' · ' + deptName(x.e.deptId)) + '</span><b>' + attLabel(x.s) + '</b></div>'; }).join('') : '<div class="muted" style="font-size:12.5px">今天没有异常</div>') + '</div>') + '</div>';
  return h;
}
function anPerformanceHTML() {
  var cycle = perfCurrentCycle(); if (!cycle) return '<div class="panel"><div class="empty">还没有绩效周期</div></div>';
  var st = perfStats(cycle), pend = perfPendingCounts(cycle);
  var h = anStats([['当前周期', esc(cycle.name), cycle.status === 'done' ? '已完成' : '进行中'], ['参评人数', st.total + '<small>人</small>', '目标已设 ' + st.goalSet + ' 人'], ['主管评价', st.managerDone + '<small>/' + st.total + '</small>', '待评价 ' + pend.manager + ' 人'], ['平均分', st.avg === null ? '—' : st.avg, '已完成 ' + st.done + ' 人'], ['待校准', pend.calibration + '<small>人</small>', '待自评 ' + pend.self + ' 人']]);
  h += '<div class="an-grid2">' + anPanel('等级分布', '当前实际', UI.chart(function (w) { return CH.bars(['S', 'A', 'B', 'C', 'D'].map(function (g, i) { return { label: g, value: st.dist[g] || 0, color: ['#1d9a57', '#2f7ff0', '#7a5af5', '#f2a71b', '#e5483b'][i], tip: g + '：' + (st.dist[g] || 0) + ' 人' }; }), w, { h: 220 }); })) + anPanel('部门平均分', '已完成主管评价', '<div class="an-list">' + Object.keys(st.dept).map(function (d) { var x = st.dept[d], avg0 = x.done ? round1(x.sum / x.done) : 0; return '<div class="an-list-row"><span>' + esc(d) + '</span><span class="ab"><i style="width:' + Math.min(100, avg0) + '%;background:#7a5af5"></i></span><span class="av">' + (x.done ? avg0 : '—') + '</span></div>'; }).join('') + '</div>') + '</div>';
  var top = S.performanceRecords.filter(function (r) { return r.cycleId === cycle.id; }).map(function (r) { var sc = r.final && r.final.score !== undefined ? r.final.score : perfRecordScore(r, cycle); return { r: r, score: sc, grade: perfRecordGrade(r, cycle) }; }).filter(function (x) { return x.score !== null; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 6);
  h += anPanel('高绩效名单', '当前周期得分前 6', '<div class="an-list">' + top.map(function (x) { var e = empById(x.r.eid); return '<div class="an-kv"><span>' + esc(e ? e.name + ' · ' + deptName(e.deptId) : '') + '</span><b>' + x.score + ' · ' + (x.grade || '—') + '</b></div>'; }).join('') + '</div>');
  return h;
}
function anActivitiesHTML() {
  var st = activityStats();
  var h = anStats([['本月活动', st.month + '<small>场</small>', '全部 ' + S.activities.length + ' 场'], ['待举办', st.upcoming + '<small>场</small>', '报名中'], ['参与人次', st.participants, '累计报名 / 签到'], ['预算', Math.round(st.budget / 1000) + '<small>K</small>', '实际 ' + Math.round(st.actual / 1000) + 'K'], ['预算使用率', Math.round(st.actual / Math.max(1, st.budget) * 100) + '<small>%</small>', '含已结束活动']]);
  var types = {};
  S.activities.forEach(function (a) { types[a.type] = (types[a.type] || 0) + 1; });
  h += '<div class="an-grid2">' + anPanel('活动类型分布', '全部活动', UI.chart(function (w) { return CH.bars(Object.keys(types).map(function (k) { return { label: k, value: types[k], color: activityTypeColor(k), tip: k + '：' + types[k] + ' 场' }; }), w, { h: 220 }); })) + anPanel('预算 vs 实际', '按活动', UI.chart(function (w) { var list = S.activities.slice(0, 8); return CH.groupBars(list.map(function (a) { return a.title.length > 6 ? a.title.slice(0, 6) + '…' : a.title; }), [{ name: '预算', color: '#2f7ff0', values: list.map(function (a) { return Math.round((a.budget || 0) / 1000); }) }, { name: '实际', color: '#14b0a6', values: list.map(function (a) { return Math.round((a.actualCost || 0) / 1000); }) }], w, { h: 220, fmt: function (v) { return Math.round(v) + 'K'; } }); }) + '<div class="an-legend"><span><i class="sq" style="background:#2f7ff0"></i>预算</span><span><i class="sq" style="background:#14b0a6"></i>实际</span></div>') + '</div>';
  h += anPanel('活动参与度', '报名人数 / 容量', '<div class="an-list">' + S.activities.slice().sort(function (a, b) { return activitySignupCount(b) - activitySignupCount(a); }).slice(0, 6).map(function (a) { var p = Math.min(100, Math.round(activitySignupCount(a) / Math.max(1, a.capacity) * 100)); return '<div class="an-list-row"><span>' + esc(a.title) + '</span><span class="ab"><i style="width:' + p + '%;background:' + activityTypeColor(a.type) + '"></i></span><span class="av">' + p + '%</span></div>'; }).join('') + '</div>');
  return h;
}
function anTrainingHTML() {
  var st = trainingStats();
  var h = anStats([['本月培训', st.month + '<small>场</small>', '全部 ' + S.trainings.length + ' 场'], ['待开始', st.upcoming + '<small>场</small>', '报名中'], ['参与人次', st.participants, '累计报名'], ['完成率', pct(st.rate), '完成 ' + st.completed + ' 人次'], ['平均评分', st.avg === null ? '—' : st.avg, '培训考核']]);
  var types = {};
  S.trainings.forEach(function (t) { types[t.type] = (types[t.type] || 0) + 1; });
  h += '<div class="an-grid2">' + anPanel('培训类型分布', '全部培训', UI.chart(function (w) { return CH.bars(Object.keys(types).map(function (k) { return { label: k, value: types[k], color: trainingTypeColor(k), tip: k + '：' + types[k] + ' 场' }; }), w, { h: 220 }); })) + anPanel('完成率', '已结束培训', '<div class="an-list">' + S.trainings.filter(function (t) { return t.status === 'done'; }).map(function (t) { var en = t.enrollments || [], done = en.filter(function (x) { return x.status === 'completed'; }).length, p = en.length ? Math.round(done / en.length * 100) : 0; return '<div class="an-list-row"><span>' + esc(t.title) + '</span><span class="ab"><i style="width:' + p + '%;background:' + trainingTypeColor(t.type) + '"></i></span><span class="av">' + p + '%</span></div>'; }).join('') + '</div>') + '</div>';
  h += anPanel('近期培训', '按开始时间', '<div class="an-list">' + trainingUpcoming(6).map(function (t) { return '<div class="an-kv"><span>' + esc(t.title + ' · ' + t.start) + '</span><b>' + trainingEnrollCount(t) + '/' + t.capacity + '</b></div>'; }).join('') + '</div>');
  return h;
}

UI.act['an-export'] = function () {
  var rows = [['部门', '在职人数', '负责人']];
  deptHeadcount().forEach(function (x) { rows.push([x.d.name, x.n, x.lead ? x.lead.name : '']); });
  rows.push([]); rows.push(['指标', '数值']);
  var hc = headcountStats();
  rows.push(['在职人数', hc.total]); rows.push(['试用期', hc.probation]); rows.push(['平均司龄', hc.avgTenure]); rows.push(['档案齐全度', pct(overallMaterials().rate)]);
  rows.push(['本月考勤率', pct(attMonthStats(todayStr().slice(0, 7)).rate)]);
  var pc = perfCurrentCycle(); if (pc) { var ps = perfStats(pc); rows.push(['绩效周期', pc.name]); rows.push(['绩效平均分', ps.avg === null ? '' : ps.avg]); }
  rows.push(['活动数量', S.activities.length]); rows.push(['培训数量', S.trainings.length]);
  downloadFile('人事分析-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
