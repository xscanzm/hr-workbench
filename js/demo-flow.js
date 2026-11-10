/* =========================================================
   DEMO · 面试、Offer、待发送通知、离职办理、简历附件
   ========================================================= */
function demoFlow(s, R, empIdByName) {
  var byName = {};
  s.candidates.forEach(function (c) { byName[c.name] = c; });
  var today = todayStr();
  var interviewers = {
    tech: ['梁晨阳', '方伟', '龙俊熙'],
    product: ['傅静', '孔泽宇'],
    sales: ['许亦宇', '顾言'],
    hr: ['李经理', '何思远'],
    finance: ['彭军', '戴子轩'],
    marketing: ['姚佳轩', '姜馨']
  };
  function ivsFor(c) {
    var d = s.departments.filter(function (x) { return x.id === c.deptId; })[0];
    return (interviewers[c.deptId] || ['李经理']).slice();
  }
  function feedbackFor(score, result) {
    var base = score || 78;
    return {
      professional: clamp(Math.round(base + (R() - 0.5) * 6), 40, 100),
      communication: clamp(Math.round(base + (R() - 0.5) * 8), 40, 100),
      culture: clamp(Math.round(base + (R() - 0.5) * 7), 40, 100),
      potential: clamp(Math.round(base + (R() - 0.5) * 9), 40, 100),
      result: result || 'pass',
      note: result === 'fail' ? '专业深度与岗位要求有差距，暂不建议进入下一轮。' : result === 'pending' ? '整体不错，建议下一轮重点考察项目深度。' : '表达清晰，项目经验匹配，建议进入下一轮。'
    };
  }

  /* ---------- 已完成的面试 ---------- */
  s.candidates.forEach(function (c) {
    (c.scores.rounds || []).forEach(function (r, ri) {
      var pendingFeedback = (c.name === '钟斌' && r.round === 2) || (c.name === '秦子轩' && r.round === 1);
      var it = {
        id: uid('iv'), cid: c.id, round: r.round, date: r.date || addDays(today, -6 + ri), time: ['10:00', '14:00', '16:00'][ri % 3],
        duration: 45, mode: '现场', place: '公司 3 楼面试间', interviewers: ivsFor(c).slice(0, 2),
        status: 'done', score: r.score, feedback: pendingFeedback ? null : feedbackFor(r.score, r.score >= 80 ? 'pass' : r.score >= 70 ? 'pending' : 'fail'),
        note: ''
      };
      s.interviews.push(it);
    });
  });

  /* ---------- 今日 / 接下来的面试 ---------- */
  function addIv(name, round, date, time, status, score, feedback, mode) {
    var c = byName[name]; if (!c) return;
    s.interviews.push({
      id: uid('iv'), cid: c.id, round: round, date: date, time: time, duration: 45,
      mode: mode || '现场', place: mode === '视频' ? '飞书会议（链接已发送）' : '公司 3 楼面试间',
      interviewers: ivsFor(c).slice(0, 2), status: status || 'scheduled',
      score: score === undefined ? null : score, feedback: feedback || null, note: ''
    });
  }
  // 今日 3 场
  addIv('唐毅', 1, today, '10:00', 'done', 83, feedbackFor(83, 'pass'));
  addIv('孙晓燕', 1, today, '14:00', 'scheduled', null, null);
  addIv('黄佳怡', 2, today, '16:30', 'scheduled', null, null);
  // 接下来
  addIv('龚子轩', 2, addDays(today, 1), '11:00', 'scheduled');
  addIv('韩雨桐', 2, addDays(today, 1), '15:00', 'scheduled');
  addIv('苏念', 1, addDays(today, 1), '10:00', 'scheduled', null, null, '视频');
  addIv('许安然', 1, addDays(today, 1), '16:00', 'scheduled');
  addIv('程一诺', 2, addDays(today, 2), '14:00', 'scheduled');
  // 待补评价
  addIv('钟斌', 2, addDays(today, -1), '16:00', 'done', 77, null);
  addIv('秦子轩', 1, addDays(today, -1), '15:00', 'done', 85, null);

  /* ---------- Offer ---------- */
  var zhu = byName['朱斌'], hu = byName['胡军'], duan = byName['段芳'];
  if (zhu) s.offers.push({ id: uid('of'), cid: zhu.id, status: 'sent', salary: '32K', sentAt: addDays(today, -2), onboardDate: addDays(today, 20), note: '已电话沟通，等待书面回复' });
  if (hu) s.offers.push({ id: uid('of'), cid: hu.id, status: 'accepted', salary: '22K', sentAt: addDays(today, -7), onboardDate: addDays(today, 15), note: '已接受 Offer' });
  if (duan) s.offers.push({ id: uid('of'), cid: duan.id, status: 'accepted', salary: '9K', sentAt: addDays(today, -50), onboardDate: duan.appliedAt ? addDays(today, -47) : today, note: '已入职' });

  /* ---------- 待发送通知 ---------- */
  function addNotify(name, type, extra) {
    var c = byName[name]; if (!c) return;
    var tpl = s.settings.templates[type], vars = notifyVars(c, extra);
    s.notifications.push({
      id: uid('nt'), cid: c.id, type: type, channels: ['sms', 'email'], status: 'pending',
      createdAt: Date.now(), title: { screeningPass: '初筛通过通知', screeningReject: '初筛未通过通知', offer: '录用通知', reject: '未录用通知' }[type],
      sms: renderTpl(tpl.sms, vars), subject: renderTpl(tpl.subject, vars), body: renderTpl(tpl.body, vars)
    });
  }
  addNotify('范思琪', 'screeningPass', { 下一环节: '笔试' });
  addNotify('陈奕辰', 'screeningReject');
  addNotify('杨雨桐', 'screeningReject');
  addNotify('胡军', 'offer', { 到岗日期: addDays(today, 15) });
  addNotify('梁思远', 'reject');

  /* ---------- 离职办理 ---------- */
  var yuanyi = byName['原毅'] ? null : null;
  var e1 = s.employees.filter(function (e) { return e.name === '原毅'; })[0];
  var e2 = s.employees.filter(function (e) { return e.name === '赵可欣'; })[0];
  if (e1) s.offboarding.push({ id: uid('ob'), eid: e1.id, applyDate: addDays(today, -10), lastDay: addDays(today, 15), reason: '个人发展', type: '主动离职', steps: { apply: true, handover: true, settle: false, cert: false }, note: '已找到交接人潘子豪' });
  if (e2) s.offboarding.push({ id: uid('ob'), eid: e2.id, applyDate: addDays(today, -3), lastDay: addDays(today, 30), reason: '家庭原因', type: '主动离职', steps: { apply: true, handover: false, settle: false, cert: false }, note: '' });

  /* ---------- 简历附件：最近 20 位候选人 ---------- */
  var withResume = s.candidates.slice().sort(function (a, b) { return a.appliedAt < b.appliedAt ? 1 : -1; }).slice(0, 20);
  withResume.forEach(function (c) {
    s.documents.push({ id: uid('doc'), cat: 'resume', name: c.name + '-简历.pdf', cid: c.id, size: 90000 + Math.round(R() * 600000), at: c.appliedAt, expireAt: '' });
  });
}
