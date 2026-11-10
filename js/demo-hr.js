/* =========================================================
   DEMO · 人事模块示例数据：考勤、绩效、员工活动、培训
   ========================================================= */
function demoHRModules(s, R, empIdByName) {
  var today = todayStr();
  var emps = s.employees.filter(function (e) { return e.empStatus !== 'left'; });
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function clampScore(v) { return clamp(Math.round(v), 45, 99); }
  function clock(min, spread) { var m = Math.round(min + R() * spread); return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); }
  var thisYear = new Date().getFullYear();
  var leaveTypes = s.settings.attendance.leaveTypes;

  /* ---------- 考勤：近 90 天 ---------- */
  s.attendanceDays = {};
  var start = addDays(today, -90);
  for (var ds = start; ds <= today; ds = addDays(ds, 1)) {
    var d = parseDate(ds);
    if (!d) continue;
    if (d.getDay() === 0 || d.getDay() === 6) { if (ds !== today) continue; }
    var day = {};
    emps.forEach(function (e, i) {
      var st;
      if (ds === today) {
        st = (s.status[today] || {})[e.id] || 'normal';
      } else {
        var r = R();
        if (r < 0.012) st = 'leave';
        else if (r < 0.024) st = 'business';
        else if (r < 0.034) st = 'field';
        else if (r < 0.038) st = 'absent';
        else if (r < 0.082) st = 'late';
        else if (r < 0.102) st = 'early';
        else st = 'normal';
      }
      var rec = { in: '', out: '', status: st, leaveType: '', note: '' };
      if (st === 'normal') { rec.in = clock(8 * 60 + 42, 22); rec.out = clock(18 * 60 + 25, 55); }
      else if (st === 'late') { rec.in = clock(9 * 60 + 7, 28); rec.out = clock(18 * 60 + 30, 50); }
      else if (st === 'early') { rec.in = clock(8 * 60 + 43, 18); rec.out = clock(17 * 60 + 2, 65); }
      else if (st === 'leave') rec.leaveType = pick(leaveTypes).id;
      day[e.id] = rec;
    });
    // 今天保留一个迟到，演示在岗视图
    if (ds === today) {
      var lateEmp = emps[1];
      if (lateEmp && (!day[lateEmp.id] || day[lateEmp.id].status === 'normal')) {
        day[lateEmp.id] = { in: '09:12', out: '18:36', status: 'late', leaveType: '', note: '' };
      }
    }
    s.attendanceDays[ds] = day;
  }

  /* ---------- 请假申请 ---------- */
  s.leaveRequests = [];
  var pendingSpecs = [
    [emps[5], 'annual', addDays(today, 2), addDays(today, 3), '回老家处理事情'],
    [emps[12], 'sick', addDays(today, 4), addDays(today, 4), '感冒发烧，需要休息一天'],
    [emps[20], 'personal', addDays(today, 7), addDays(today, 8), '办理证件'],
    [emps[30], 'comp', addDays(today, 10), addDays(today, 10), '上周加班调休']
  ];
  pendingSpecs.forEach(function (x, i) {
    if (!x[0]) return;
    s.leaveRequests.push({ id: 'lv' + (i + 1), eid: x[0].id, type: x[1], start: x[2], end: x[3], days: leaveDays(x[2], x[3]), reason: x[4], status: 'pending', appliedAt: addDays(today, -1), note: '' });
  });
  var approvedSpecs = [
    [emps[8], 'annual', addDays(today, -18), addDays(today, -17), '年假出行'],
    [emps[15], 'sick', addDays(today, -9), addDays(today, -9), '身体不适']
  ];
  approvedSpecs.forEach(function (x, i) {
    if (!x[0]) return;
    var lv = { id: 'lvA' + i, eid: x[0].id, type: x[1], start: x[2], end: x[3], days: leaveDays(x[2], x[3]), reason: x[4], status: 'approved', appliedAt: addDays(today, -22), note: '已批准' };
    s.leaveRequests.push(lv);
    for (var d0 = x[2]; d0 <= x[3]; d0 = addDays(d0, 1)) {
      if (!s.attendanceDays[d0]) s.attendanceDays[d0] = {};
      s.attendanceDays[d0][x[0].id] = { in: '', out: '', status: 'leave', leaveType: x[1], note: '请假' };
    }
  });
  if (emps[25]) s.leaveRequests.push({ id: 'lvR1', eid: emps[25].id, type: 'personal', start: addDays(today, -4), end: addDays(today, -4), days: 1, reason: '临时私事', status: 'rejected', appliedAt: addDays(today, -6), note: '当天有重要会议，建议改期' });

  /* ---------- 绩效 ---------- */
  var pw = s.settings.performance;
  var q3 = { id: 'perf-' + thisYear + 'q3', name: thisYear + ' Q3', type: '季度', start: thisYear + '-07-01', end: thisYear + '-09-30', status: 'done', weights: Object.assign({}, pw.weights), gradeLines: Object.assign({}, pw.gradeLines), distribution: Object.assign({}, pw.distribution) };
  var q4 = { id: 'perf-' + thisYear + 'q4', name: thisYear + ' Q4', type: '季度', start: thisYear + '-10-01', end: thisYear + '-12-31', status: 'review', weights: Object.assign({}, pw.weights), gradeLines: Object.assign({}, pw.gradeLines), distribution: Object.assign({}, pw.distribution) };
  s.performanceCycles = [q3, q4];
  s.performanceRecords = [];
  var goalPool = ['核心项目交付质量', '关键指标达成', '跨团队协作与推动', '技术 / 专业能力提升', '流程优化与效率', '人才培养与分享', '客户满意度提升', '成本与预算控制'];
  function makeGoals(base) {
    var a = pick(goalPool), b = pick(goalPool.filter(function (x) { return x !== a; })), c = pick(goalPool.filter(function (x) { return x !== a && x !== b; }));
    return [
      { id: uid('g'), title: a, weight: 40, target: '按计划完成，质量达标', result: '已完成', score: clampScore(base + (R() - 0.5) * 14), note: '' },
      { id: uid('g'), title: b, weight: 30, target: '达到季度目标', result: '基本完成', score: clampScore(base + (R() - 0.5) * 16), note: '' },
      { id: uid('g'), title: c, weight: 30, target: '有明确产出', result: '部分完成', score: clampScore(base + (R() - 0.5) * 18), note: '' }
    ];
  }
  emps.forEach(function (e) {
    var base = 64 + R() * 30;
    // Q3 已完成
    var goals3 = makeGoals(base);
    var goalScore3 = round1(avg(goals3.map(function (g) { return g.score; })));
    var comp3 = clampScore(base + (R() - 0.5) * 12), val3 = clampScore(base + 4 + (R() - 0.5) * 10);
    var total3 = round1(goalScore3 * q3.weights.goal / 100 + comp3 * q3.weights.competency / 100 + val3 * q3.weights.values / 100);
    var grade3 = perfGradeOf(total3, q3);
    s.performanceRecords.push({
      id: uid('pr'), cycleId: q3.id, eid: e.id, goals: goals3,
      self: { summary: '本季度围绕既定目标推进，核心项目按计划交付，个人在跨团队协作上也有提升。', submittedAt: q3.end },
      manager: { summary: '目标完成情况符合预期，专业能力稳定，建议下季度加强主动推动和复盘。', goalScore: goalScore3, competencyScore: comp3, valuesScore: val3, submittedAt: q3.end, reviewer: e.managerName || '李经理' },
      final: { score: total3, grade: grade3, calibrated: true, note: '' },
      status: 'done'
    });
    // Q4 进行中
    var goals4 = makeGoals(base + 2);
    var selfDone = R() < 0.7;
    var managerDone = selfDone && R() < 0.5;
    var finalDone = managerDone && R() < 0.3;
    var comp4 = managerDone ? clampScore(base + (R() - 0.5) * 12) : null;
    var val4 = managerDone ? clampScore(base + 4 + (R() - 0.5) * 10) : null;
    var goalScore4 = managerDone ? round1(avg(goals4.map(function (g) { return g.score; }))) : null;
    var total4 = managerDone ? round1(goalScore4 * q4.weights.goal / 100 + comp4 * q4.weights.competency / 100 + val4 * q4.weights.values / 100) : null;
    var rec4 = {
      id: uid('pr'), cycleId: q4.id, eid: e.id, goals: goals4,
      self: selfDone ? { summary: '本季度重点推进手头项目，目标按计划进行，希望在协作和复盘上继续提升。', submittedAt: addDays(today, -2) } : null,
      manager: managerDone ? { summary: '整体符合预期，项目推进比较稳，建议在跨部门沟通上更主动。', goalScore: goalScore4, competencyScore: comp4, valuesScore: val4, submittedAt: addDays(today, -1), reviewer: e.managerName || '李经理' } : null,
      final: finalDone ? { score: total4, grade: perfGradeOf(total4, q4), calibrated: true, note: '' } : null,
      status: finalDone ? 'done' : managerDone ? 'manager' : selfDone ? 'self' : 'pending'
    };
    s.performanceRecords.push(rec4);
  });

  /* ---------- 员工活动 ---------- */
  var activitySpecs = [
    { title: '11 月生日会', type: '生日会', date: addDays(today, 3), start: '16:00', end: '17:30', location: '公司休闲区', capacity: 50, budget: 3000, status: 'signup', desc: '为本月寿星准备蛋糕和小礼物，欢迎大家一起参加。' },
    { title: '技术分享会：AI 工程化', type: '分享会', date: addDays(today, 5), start: '15:00', end: '16:30', location: '3 楼大会议室', capacity: 35, budget: 800, status: 'signup', desc: '方伟分享 AI 工程化落地经验，含现场答疑。' },
    { title: '秋季团建 · 莫干山', type: '团建', date: addDays(today, 12), start: '08:30', end: '18:00', location: '莫干山', capacity: 43, budget: 26000, status: 'signup', desc: '徒步、烧烤和团队游戏，当天往返。' },
    { title: '公益徒步', type: '公益', date: addDays(today, 20), start: '09:00', end: '12:00', location: '海珠湿地', capacity: 30, budget: 2000, status: 'signup', desc: '公益徒步活动，报名费将捐赠给山区学校。' },
    { title: '部门聚餐', type: '团建', date: addDays(today, -6), start: '18:30', end: '21:00', location: '公司附近餐厅', capacity: 20, budget: 4800, actualCost: 4520, status: 'done', desc: '销售部季度聚餐。' },
    { title: '新员工欢迎会', type: '其他', date: addDays(today, -18), start: '16:00', end: '17:00', location: '公司休闲区', capacity: 25, budget: 1200, actualCost: 1080, status: 'done', desc: '欢迎近期入职的新同事。' },
    { title: '年度体检', type: '其他', date: addDays(today, -3), start: '08:00', end: '11:30', location: '美年大健康', capacity: 43, budget: 21500, actualCost: 21500, status: 'done', desc: '年度员工体检，分批前往。' },
    { title: '年会筹备启动会', type: '年会', date: addDays(today, 28), start: '14:00', end: '15:30', location: '3 楼大会议室', capacity: 15, budget: 0, status: 'signup', desc: '讨论年会主题、节目和预算。' }
  ];
  s.activities = activitySpecs.map(function (a, i) {
    var signups = [];
    emps.forEach(function (e, idx) {
      if (signups.length >= a.capacity) return;
      var r = R();
      if (r > (a.status === 'done' ? 0.45 : 0.6)) return;
      var st = a.status === 'done' ? (R() < 0.9 ? 'checked' : 'absent') : 'signed';
      signups.push({ eid: e.id, status: st, note: '', signedAt: addDays(a.date, -5) });
    });
    return Object.assign({
      id: 'act' + (i + 1), organizerId: i % 3 === 0 ? empIdByName['李经理'] : (i % 3 === 1 ? empIdByName['姚佳轩'] : empIdByName['傅静']),
      tags: [a.type], signups: signups, feedback: a.status === 'done' ? { rating: 4 + Math.round(R()), summary: '整体不错，期待下次活动。' } : null
    }, a);
  });

  /* ---------- 培训 ---------- */
  var trainingSpecs = [
    { title: '新员工入职培训', type: '新员工', mode: '线下', start: addDays(today, -16), startTime: '09:30', endTime: '12:00', duration: 2.5, location: '3 楼大会议室', trainer: '李经理', capacity: 20, budget: 0, status: 'done', desc: '公司介绍、制度流程和团队认识。' },
    { title: '管理者训练营', type: '管理', mode: '线下', start: addDays(today, -28), startTime: '09:00', endTime: '17:00', duration: 6, location: '外部培训中心', trainer: '外部讲师', capacity: 12, budget: 18000, status: 'done', desc: '面向 M1/M2 管理者的团队管理与绩效面谈训练。' },
    { title: '信息安全与合规', type: '合规', mode: '线上', start: addDays(today, -7), startTime: '14:00', endTime: '16:00', duration: 2, location: '线上直播', trainer: '何思远', capacity: 43, budget: 0, status: 'done', desc: '数据安全、保密协议和合规红线。' },
    { title: '数据产品方法论', type: '产品', mode: '线下', start: addDays(today, 4), startTime: '14:00', endTime: '17:00', duration: 3, location: '3 楼大会议室', trainer: '傅静', capacity: 25, budget: 2000, status: 'signup', desc: '从需求分析到指标设计的完整方法论。' },
    { title: '高效沟通与协作', type: '通用', mode: '线上', start: addDays(today, 12), startTime: '10:00', endTime: '12:00', duration: 2, location: '线上直播', trainer: '外部讲师', capacity: 40, budget: 3000, status: 'signup', desc: '跨部门沟通、反馈和冲突处理。' },
    { title: 'AI 工具实战', type: '专业技能', mode: '线下', start: addDays(today, 22), startTime: '14:00', endTime: '17:00', duration: 3, location: '3 楼大会议室', trainer: '方伟', capacity: 30, budget: 1500, status: 'signup', desc: '把 AI 工具用进日常研发和办公流程。' }
  ];
  s.trainings = trainingSpecs.map(function (t, i) {
    var enrollments = [];
    emps.forEach(function (e) {
      if (enrollments.length >= t.capacity) return;
      var r = R();
      if (r > (t.status === 'done' ? 0.5 : 0.7)) return;
      var st = t.status === 'done' ? (R() < 0.85 ? 'completed' : R() < 0.5 ? 'attended' : 'absent') : 'signed';
      enrollments.push({ eid: e.id, status: st, score: t.status === 'done' && st === 'completed' ? clampScore(75 + R() * 23) : null, feedback: t.status === 'done' ? '内容实用，讲师讲解清晰。' : '', note: '' });
    });
    return Object.assign({
      id: 'tr' + (i + 1), organizerId: empIdByName['李经理'], tags: [t.type], enrollments: enrollments
    }, t);
  });
  s.meta = s.meta || {};
  s.meta.demoHRDate = todayStr();
}

/* 演示数据为空或跨天时自动补齐；设置里也可以手动重建 */
function ensureDemoHRData(force) {
  if (!S || !Array.isArray(S.employees) || !S.employees.length) return false;
  var hasToday = !!(S.attendanceDays && S.attendanceDays[todayStr()] && Object.keys(S.attendanceDays[todayStr()]).length);
  var empty = !Object.keys(S.attendanceDays || {}).length || !hasToday || !(S.performanceCycles || []).length || !(S.activities || []).length || !(S.trainings || []).length;
  if (!S.demo) {
    if (force) UI.toast('当前不是示例公司，无法生成人事演示数据');
    return false;
  }
  if (!empty && !force) return false;
  var map = {};
  S.employees.forEach(function (e) { map[e.name] = e.id; });
  var seed = parseInt(todayStr().replace(/-/g, ''), 10) + (force ? 97 : 0);
  demoHRModules(S, demoRng(seed), map);
  save(true);
  return true;
}
