/* =========================================================
   HR QUERIES · 考勤 / 绩效 / 活动 / 培训 的派生查询
   ========================================================= */

/* ---------- 考勤 ---------- */
function attRecord(eid, ds) {
  var day = S.attendanceDays[ds || todayStr()];
  return day ? (day[eid] || null) : null;
}
function attMonthRecords(eid, month) {
  var out = [];
  Object.keys(S.attendanceDays).sort().forEach(function (ds) {
    if (ds.indexOf(month) !== 0) return;
    var r = S.attendanceDays[ds][eid];
    if (r) out.push({ ds: ds, rec: r });
  });
  return out;
}
function attMonthSummary(eid, month) {
  var list = attMonthRecords(eid, month), r = { days: list.length, normal: 0, late: 0, early: 0, leave: 0, business: 0, field: 0, absent: 0, missing: 0, present: 0, rate: null };
  list.forEach(function (x) { var s = x.rec.status; if (r[s] !== undefined) r[s]++; });
  r.present = r.normal + r.late + r.early;
  r.rate = r.days ? r.present / r.days : null;
  return r;
}
function attMonthStats(month) {
  var list = activeEmployees(), r = { total: list.length, days: 0, normal: 0, late: 0, early: 0, leave: 0, business: 0, field: 0, absent: 0, missing: 0, present: 0, rate: null };
  list.forEach(function (e) {
    var s = attMonthSummary(e.id, month);
    r.days += s.days; r.normal += s.normal; r.late += s.late; r.early += s.early; r.leave += s.leave;
    r.business += s.business; r.field += s.field; r.absent += s.absent; r.missing += s.missing; r.present += s.present;
  });
  r.rate = r.days ? r.present / r.days : null;
  return r;
}
function attExceptionsToday() {
  var out = [];
  activeEmployees().forEach(function (e) {
    var s = statusOf(e);
    if (s && ['late', 'early', 'missing', 'absent'].indexOf(s) >= 0) out.push({ e: e, s: s, rec: attRecord(e.id) });
  });
  return out;
}
function leaveDays(start, end) {
  var a = parseDate(start), b = parseDate(end);
  if (!a || !b || b < a) return 0;
  return daysBetween(a, b) + 1;
}
function leaveTypeName(id) {
  var t = (S.settings.attendance.leaveTypes || []).filter(function (x) { return x.id === id; })[0];
  return t ? t.name : (id || '请假');
}
function pendingLeaves() { return S.leaveRequests.filter(function (x) { return x.status === 'pending'; }); }
function attTrend(months) {
  var labels = [], rates = [], late = [];
  for (var i = months - 1; i >= 0; i--) {
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    var key = d.getFullYear() + '-' + pad2(d.getMonth() + 1);
    var st = attMonthStats(key);
    labels.push((d.getMonth() + 1) + '月');
    rates.push(st.rate === null ? null : round1(st.rate * 100));
    late.push(st.late);
  }
  return { labels: labels, rates: rates, late: late };
}

/* ---------- 绩效 ---------- */
function perfCycles() {
  return S.performanceCycles.slice().sort(function (a, b) { return a.start < b.start ? 1 : -1; });
}
function perfCycleById(id) { for (var i = 0; i < S.performanceCycles.length; i++) if (S.performanceCycles[i].id === id) return S.performanceCycles[i]; return null; }
function perfCurrentCycle() {
  var list = perfCycles(), cur = list.filter(function (c) { return c.status !== 'done'; })[0];
  return cur || list[0] || null;
}
function perfRecord(cycleId, eid) {
  for (var i = 0; i < S.performanceRecords.length; i++) if (S.performanceRecords[i].cycleId === cycleId && S.performanceRecords[i].eid === eid) return S.performanceRecords[i];
  return null;
}
function perfGoalsScore(rec) {
  if (!rec || !Array.isArray(rec.goals) || !rec.goals.length) return null;
  var sum = 0, w = 0;
  rec.goals.forEach(function (g) { if (typeof g.score === 'number') { sum += g.score * (g.weight || 0); w += g.weight || 0; } });
  return w ? round1(sum / w) : null;
}
function perfRecordScore(rec, cycle) {
  if (!rec || !rec.manager) return null;
  var w = (cycle || perfCycleById(rec.cycleId) || S.settings.performance).weights;
  var goal = typeof rec.manager.goalScore === 'number' ? rec.manager.goalScore : perfGoalsScore(rec);
  var comp = typeof rec.manager.competencyScore === 'number' ? rec.manager.competencyScore : null;
  var val = typeof rec.manager.valuesScore === 'number' ? rec.manager.valuesScore : null;
  if (goal === null || comp === null || val === null) return null;
  return round1(goal * w.goal / 100 + comp * w.competency / 100 + val * w.values / 100);
}
function perfGradeOf(score, cycle) {
  if (score === null || score === undefined) return null;
  var lines = (cycle || S.settings.performance).gradeLines || { S: 90, A: 80, B: 70, C: 60 };
  if (score >= lines.S) return 'S';
  if (score >= lines.A) return 'A';
  if (score >= lines.B) return 'B';
  if (score >= lines.C) return 'C';
  return 'D';
}
function perfRecordGrade(rec, cycle) {
  if (!rec) return null;
  if (rec.final && rec.final.grade) return rec.final.grade;
  return perfGradeOf(perfRecordScore(rec, cycle), cycle);
}
function perfRecordStatus(rec) {
  if (!rec) return 'pending';
  if (rec.final && rec.final.score !== undefined) return 'done';
  if (rec.manager) return 'manager';
  if (rec.self) return 'self';
  return 'pending';
}
function perfStats(cycle) {
  var records = S.performanceRecords.filter(function (r) { return r.cycleId === cycle.id; });
  var r = { total: records.length, goalSet: 0, selfDone: 0, managerDone: 0, done: 0, avg: null, dist: { S: 0, A: 0, B: 0, C: 0, D: 0 }, dept: {} };
  var scores = [];
  records.forEach(function (rec) {
    if (rec.goals && rec.goals.length) r.goalSet++;
    if (rec.self) r.selfDone++;
    if (rec.manager) r.managerDone++;
    if (rec.final && rec.final.score !== undefined) r.done++;
    var s = rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle);
    var g = rec.final && rec.final.grade ? rec.final.grade : perfGradeOf(s, cycle);
    if (s !== null) { scores.push(s); if (g) r.dist[g]++; }
    var e = empById(rec.eid); if (e) {
      var d = deptName(e.deptId);
      r.dept[d] = r.dept[d] || { n: 0, sum: 0, done: 0 };
      r.dept[d].n++; if (s !== null) r.dept[d].sum += s; if (rec.final && rec.final.score !== undefined) r.dept[d].done++;
    }
  });
  r.avg = scores.length ? round1(avg(scores)) : null;
  return r;
}
function perfPendingCounts(cycle) {
  var r = { self: 0, manager: 0, calibration: 0 };
  S.performanceRecords.filter(function (x) { return x.cycleId === cycle.id; }).forEach(function (rec) {
    if (!rec.self) r.self++;
    else if (!rec.manager) r.manager++;
    else if (!rec.final || rec.final.score === undefined) r.calibration++;
  });
  return r;
}
function perfHistory(eid) {
  return S.performanceRecords.filter(function (r) { return r.eid === eid; }).map(function (rec) {
    var cycle = perfCycleById(rec.cycleId);
    return { rec: rec, cycle: cycle, score: rec.final && rec.final.score !== undefined ? rec.final.score : perfRecordScore(rec, cycle), grade: perfRecordGrade(rec, cycle), status: perfRecordStatus(rec) };
  }).sort(function (a, b) { return a.cycle && b.cycle ? (a.cycle.start < b.cycle.start ? 1 : -1) : 0; });
}
function perfPendingTotal() {
  var c = perfCurrentCycle(); if (!c) return 0;
  var p = perfPendingCounts(c); return p.self + p.manager + p.calibration;
}
function perfGradeTone(g) { return g === 'S' ? 'green' : g === 'A' ? 'blue' : g === 'B' ? 'violet' : g === 'C' ? 'amber' : 'red'; }

/* ---------- 活动 ---------- */
var ACT_COLORS = { '团建': '#2f7ff0', '生日会': '#e2569a', '节日': '#f2a71b', '分享会': '#7a5af5', '公益': '#14b0a6', '年会': '#e5483b', '其他': '#8a8a87' };
function activityTypeColor(t) { return ACT_COLORS[t] || '#2f7ff0'; }
function activityList() { return S.activities.slice().sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? 1 : -1; }); }
function activityUpcoming(n) {
  var t = todayStr();
  return S.activities.filter(function (a) { return a.date >= t && a.status !== 'cancelled' && a.status !== 'done'; }).sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? -1 : 1; }).slice(0, n || 99);
}
function activityPast(n) {
  var t = todayStr();
  return S.activities.filter(function (a) { return a.date < t || a.status === 'done'; }).sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? 1 : -1; }).slice(0, n || 99);
}
function activitySignupCount(a) { return (a.signups || []).filter(function (s) { return s.status !== 'absent'; }).length; }
function activityStats() {
  var month = todayStr().slice(0, 7), list = S.activities;
  var r = { month: 0, upcoming: 0, participants: 0, budget: 0, actual: 0 };
  list.forEach(function (a) {
    if ((a.date || '').indexOf(month) === 0) r.month++;
    if (a.date >= todayStr() && a.status !== 'done' && a.status !== 'cancelled') r.upcoming++;
    r.participants += activitySignupCount(a);
    r.budget += +a.budget || 0;
    r.actual += +a.actualCost || 0;
  });
  return r;
}
function activityEmpList(eid) { return S.activities.filter(function (a) { return (a.signups || []).some(function (s) { return s.eid === eid; }); }); }

/* ---------- 培训 ---------- */
var TRAIN_COLORS = { '新员工': '#14b0a6', '专业技能': '#2f7ff0', '管理': '#7a5af5', '合规': '#e5483b', '产品': '#f2a71b', '通用': '#8a8a87' };
function trainingTypeColor(t) { return TRAIN_COLORS[t] || '#2f7ff0'; }
function trainingList() { return S.trainings.slice().sort(function (a, b) { return (a.start + (a.startTime || '')) < (b.start + (b.startTime || '')) ? 1 : -1; }); }
function trainingUpcoming(n) {
  return S.trainings.filter(function (t) { return t.start >= todayStr() && t.status !== 'cancelled'; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; }).slice(0, n || 99);
}
function trainingPast(n) {
  return S.trainings.filter(function (t) { return t.start < todayStr() || t.status === 'done'; }).sort(function (a, b) { return a.start < b.start ? 1 : -1; }).slice(0, n || 99);
}
function trainingEnrollCount(t) { return (t.enrollments || []).filter(function (s) { return s.status !== 'absent'; }).length; }
function trainingStats() {
  var month = todayStr().slice(0, 7), r = { month: 0, upcoming: 0, participants: 0, completed: 0, rate: null, avg: null, hours: 0 };
  var scores = [];
  S.trainings.forEach(function (t) {
    if ((t.start || '').indexOf(month) === 0) r.month++;
    if (t.start >= todayStr() && t.status !== 'cancelled') r.upcoming++;
    r.participants += trainingEnrollCount(t);
    var done = (t.enrollments || []).filter(function (s) { return s.status === 'completed'; }).length;
    r.completed += done;
    if (t.status === 'done') r.hours += +t.duration || 0;
    (t.enrollments || []).forEach(function (s) { if (typeof s.score === 'number') scores.push(s.score); });
  });
  r.avg = scores.length ? round1(avg(scores)) : null;
  r.rate = r.participants ? r.completed / r.participants : null;
  return r;
}
function trainingEmpList(eid) { return S.trainings.filter(function (t) { return (t.enrollments || []).some(function (s) { return s.eid === eid; }); }); }

/* ---------- 近期安排（活动 + 培训） ---------- */
function upcomingSchedule(n) {
  var out = [];
  activityUpcoming(20).forEach(function (a) { out.push({ kind: 'activity', date: a.date, time: a.start || '', title: a.title, id: a.id, type: a.type, color: activityTypeColor(a.type) }); });
  trainingUpcoming(20).forEach(function (t) { out.push({ kind: 'training', date: t.start, time: t.startTime || '', title: t.title, id: t.id, type: t.type, color: trainingTypeColor(t.type) }); });
  out.sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
  return out.slice(0, n || 99);
}
