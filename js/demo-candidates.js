/* =========================================================
   DEMO · 候选人：46 份简历、8 个在招职位、匹配度与各轮成绩
   ========================================================= */
var DEMO_CAND_NAMES = {
  frontend: ['龚子轩', '孙晓燕', '沈亦舟', '梁思远', '李沐阳', '王梓萱', '张一鸣', '刘思琪', '陈奕辰', '杨雨桐'],
  java: ['朱斌', '钟斌', '唐毅', '周子墨', '赵子涵', '周雨欣', '吴昊然', '徐若曦'],
  qa: ['韩雨桐', '陆嘉铭', '吴思远', '孙浩然', '马嘉怡'],
  pm: ['程一诺', '黄佳怡', '许清越', '乔立新', '唐若曦'],
  media: ['范思琪', '林悦', '苏念', '陈嘉禾', '郭子轩', '何雨萱', '高铭泽', '罗欣怡'],
  kam: ['胡军', '郑凯文', '郑文博', '蒋子豪', '邓雨欣'],
  recruit: ['林婷婷', '许安然', '高子涵'],
  cashier: ['段芳', '秦子轩']
};
var DEMO_CAND_PLAN = {
  frontend: [
    { stage: 'interview2', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }, { stage: 'rejected', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }, { screen: 'new' }, { screen: 'pending' }, { screen: 'rejected' }, { screen: 'rejected' }
  ],
  java: [
    { stage: 'offer', screen: 'passed' }, { stage: 'interview2', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }, { stage: 'written', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }, { screen: 'new' }, { screen: 'rejected' }
  ],
  qa: [
    { stage: 'interview2', screen: 'passed' }, { stage: 'written', screen: 'passed' }, { stage: 'rejected', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }
  ],
  pm: [
    { stage: 'interview2', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }, { stage: 'rejected', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }
  ],
  media: [
    { screen: 'new' }, { stage: 'written', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }, { stage: 'rejected', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }, { screen: 'new' }, { screen: 'pending' }
  ],
  kam: [
    { stage: 'offer', screen: 'passed' }, { stage: 'written', screen: 'passed' },
    { screen: 'new' }, { screen: 'new' }, { screen: 'new' }
  ],
  recruit: [
    { screen: 'new' }, { stage: 'interview1', screen: 'passed' }, { stage: 'written', screen: 'passed' }
  ],
  cashier: [
    { stage: 'hired', screen: 'passed' }, { stage: 'interview1', screen: 'passed' }
  ]
};
var DEMO_JOB_KEYS = { 'j-frontend': 'frontend', 'j-java': 'java', 'j-qa': 'qa', 'j-pm': 'pm', 'j-media': 'media', 'j-kam': 'kam', 'j-recruit': 'recruit', 'j-cashier': 'cashier' };

var DEMO_CAND_OVERRIDE = {
  '范思琪': { gender: 'F', degree: '硕士', school: '浙江大学', major: '新闻传播学', years: 4, expected: '10K', expectedNum: 10, currentCompany: '小红书', currentTitle: '内容运营', source: 'Boss直聘', applied: -5, phone: '13900000704', email: 'cand118@example.com', match: 95, skills: ['短视频', '文案', '数据分析', '直播'], availability: '离职·随时到岗', tags: ['短视频', '小红书', '文案', '数据分析'] },
  '林婷婷': { gender: 'F', degree: '本科', school: '广东工业大学', major: '人力资源管理', years: 2, expected: '11K', expectedNum: 11, currentCompany: '有赞', currentTitle: '招聘专员', source: 'Boss直聘', applied: -13, match: 94, skills: ['招聘', '人才寻访', '面试评估', '渠道运营'], availability: '在职·一个月内', tags: ['招聘', '人才寻访', '面试'] },
  '乔立新': { gender: 'M', degree: '硕士', school: '湖南大学', major: '信息管理与信息系统', years: 5, expected: '18K', expectedNum: 18, currentCompany: '同花顺', currentTitle: '高级产品经理', source: '猎头', applied: -1, match: 93, skills: ['B 端产品', '原型设计', 'PRD', '需求分析'], availability: '在职·一个月内', tags: ['原型设计', 'B 端产品', 'PRD'] },
  '唐若曦': { gender: 'F', degree: '本科', school: '浙江工业大学', major: '工商管理', years: 3, expected: '15K', expectedNum: 15, currentCompany: '兑吧', currentTitle: '产品经理', source: '内推', applied: -2, match: 91, skills: ['B 端产品', '需求分析', '项目管理', 'SQL'], availability: '离职·随时到岗', tags: ['B 端产品', '需求分析', '项目管理'] },
  '朱斌': { gender: 'M', degree: '本科', school: '华中科技大学', major: '计算机科学与技术', years: 5, expected: '32K', expectedNum: 32, currentCompany: '蚂蚁集团', currentTitle: 'Java 工程师', source: '猎头', applied: -22, match: 88, resumeScore: 80, written: null, rounds: [88, 88, 88], tags: ['Java', '微服务', '高并发'] },
  '段芳': { gender: 'F', degree: '本科', school: '浙江工商大学', major: '会计学', years: 4, expected: '9K', expectedNum: 9, currentCompany: '税友软件', currentTitle: '财务助理', source: 'Boss直聘', applied: -51, match: 86, resumeScore: 80, written: null, rounds: [85, 85], tags: ['出纳', '资金管理', '报销'] },
  '龚子轩': { gender: 'M', degree: '本科', school: '西安电子科技大学', major: '软件工程', years: 4, expected: '30K', expectedNum: 30, currentCompany: '海康威视', currentTitle: '前端工程师', source: 'Boss直聘', applied: -18, match: 82, resumeScore: 60, written: 91, rounds: [80], tags: ['React', 'TypeScript', '数据可视化'] },
  '胡军': { gender: 'M', degree: '本科', school: '浙江理工大学', major: '市场营销', years: 6, expected: '22K', expectedNum: 22, currentCompany: '涂鸦智能', currentTitle: '大客户经理', source: '内推', applied: -25, match: 80, resumeScore: 60, written: null, rounds: [85, 85], tags: ['大客户销售', '商务谈判'] },
  '钟斌': { gender: 'M', degree: '本科', school: '广东工业大学', major: '软件工程', years: 4, expected: '28K', expectedNum: 28, currentCompany: '恒生电子', currentTitle: 'Java 工程师', source: '拉勾', applied: -17, match: 78, resumeScore: 80, written: null, rounds: [77], tags: ['Java', 'Spring Boot', 'MySQL'] },
  '程一诺': { gender: 'F', degree: '硕士', school: '浙江大学', major: '信息管理与信息系统', years: 4, expected: '25K', expectedNum: 25, currentCompany: '数云', currentTitle: '产品经理', source: 'Boss直聘', applied: -15, match: 81, resumeScore: 80, written: null, rounds: [77], tags: ['B 端产品', '数据分析'] },
  '唐毅': { gender: 'M', degree: '本科', school: '浙江工业大学', major: '计算机科学与技术', years: 3, expected: '22K', expectedNum: 22, currentCompany: '创业慧康', currentTitle: 'Java 工程师', source: 'Boss直聘', applied: -14, match: 76, resumeScore: 60, written: null, rounds: [83], tags: ['Java', 'Spring Boot'] },
  '孙晓燕': { gender: 'F', degree: '硕士', school: '浙江大学', major: '计算机科学与技术', years: 5, expected: '35K', expectedNum: 35, currentCompany: '阿里云', currentTitle: '前端工程师', source: '猎头', applied: -12, match: 90, resumeScore: 85, written: 88, rounds: [90], tags: ['React', 'TypeScript', '数据可视化'] },
  '黄佳怡': { gender: 'F', degree: '本科', school: '南京大学', major: '信息管理与信息系统', years: 4, expected: '28K', expectedNum: 28, currentCompany: '有赞', currentTitle: '产品经理', source: '内推', applied: -11, match: 85, resumeScore: 82, written: 86, rounds: [86], tags: ['B 端产品', 'PRD'] },
  '秦子轩': { gender: 'M', degree: '本科', school: '浙江财经大学', major: '财务管理', years: 3, expected: '9K', expectedNum: 9, currentCompany: '税友软件', currentTitle: '出纳', source: 'Boss直聘', applied: -10, match: 84, resumeScore: 82, written: null, rounds: [87], tags: ['出纳', '资金管理'] },
  '沈亦舟': { gender: 'M', degree: '硕士', school: '上海交通大学', major: '软件工程', years: 6, expected: '36K', expectedNum: 36, currentCompany: '字节跳动', currentTitle: '高级前端工程师', source: '猎头', applied: -20, match: 89, resumeScore: 85, written: 88, rounds: [90], tags: ['React', 'TypeScript', '前端工程化'] },
  '韩雨桐': { gender: 'F', degree: '本科', school: '武汉大学', major: '软件工程', years: 3, expected: '20K', expectedNum: 20, currentCompany: '大华股份', currentTitle: '测试工程师', source: 'Boss直聘', applied: -16, match: 79, resumeScore: 72, written: 80, rounds: [78, 78], tags: ['自动化测试', '接口测试'] },
  '许安然': { gender: 'F', degree: '本科', school: '浙江工商大学', major: '人力资源管理', years: 2, expected: '10K', expectedNum: 10, currentCompany: '微医', currentTitle: '招聘专员', source: '拉勾', applied: -9, match: 77, resumeScore: 76, written: 55, rounds: [74], tags: ['招聘', '面试评估'] },
  '高子涵': { gender: 'F', degree: '本科', school: '华南师范大学', major: '人力资源管理', years: 1, expected: '8K', expectedNum: 8, currentCompany: '兑吧', currentTitle: '招聘助理', source: 'Boss直聘', applied: -8, match: 70, resumeScore: 64, written: 60, tags: ['招聘', '渠道运营'] },
  '陆嘉铭': { gender: 'M', degree: '本科', school: '浙江理工大学', major: '计算机科学与技术', years: 2, expected: '16K', expectedNum: 16, currentCompany: '迪普科技', currentTitle: '测试工程师', source: 'Boss直聘', applied: -13, match: 68, resumeScore: 65, written: 62, tags: ['功能测试', '接口测试'] },
  '林悦': { gender: 'F', degree: '本科', school: '浙江传媒学院', major: '新闻传播学', years: 2, expected: '10K', expectedNum: 10, currentCompany: '蓝色光标', currentTitle: '新媒体运营', source: 'Boss直聘', applied: -12, match: 72, resumeScore: 68, written: 70, tags: ['文案', '小红书'] },
  '郑凯文': { gender: 'M', degree: '本科', school: '宁波大学', major: '市场营销', years: 4, expected: '20K', expectedNum: 20, currentCompany: '分众传媒', currentTitle: '销售经理', source: '猎头', applied: -15, match: 71, resumeScore: 70, written: 66, tags: ['大客户销售', '客户关系'] },
  '周子墨': { gender: 'M', degree: '本科', school: '中国计量大学', major: '软件工程', years: 4, expected: '26K', expectedNum: 26, currentCompany: '新华三', currentTitle: 'Java 工程师', source: 'Boss直聘', applied: -19, match: 74, resumeScore: 75, written: 68, tags: ['Java', '微服务'] },
  '苏念': { gender: 'F', degree: '本科', school: '浙江工业大学', major: '广告学', years: 3, expected: '11K', expectedNum: 11, currentCompany: '有赞', currentTitle: '内容运营', source: '内推', applied: -10, match: 75, resumeScore: 74, rounds: [70], tags: ['短视频', '文案'] },
  '梁思远': { gender: 'M', degree: '本科', school: '广东工业大学', major: '软件工程', years: 3, expected: '28K', expectedNum: 28, currentCompany: '创业慧康', currentTitle: '前端工程师', source: 'Boss直聘', applied: -24, match: 66, resumeScore: 62, tags: ['Vue', '前端工程化'] },
  '吴思远': { gender: 'M', degree: '本科', school: '浙江工业大学', major: '软件工程', years: 2, expected: '17K', expectedNum: 17, currentCompany: '博彦科技', currentTitle: '测试工程师', source: '拉勾', applied: -21, match: 64, resumeScore: 58, tags: ['功能测试', '性能测试'] },
  '许清越': { gender: 'F', degree: '本科', school: '浙江工商大学', major: '工商管理', years: 3, expected: '20K', expectedNum: 20, currentCompany: '每日互动', currentTitle: '产品经理', source: 'Boss直聘', applied: -23, match: 67, resumeScore: 65, tags: ['B 端产品', '需求分析'] },
  '陈嘉禾': { gender: 'F', degree: '本科', school: '浙江理工大学', major: '数字媒体技术', years: 2, expected: '10K', expectedNum: 10, currentCompany: '华扬联众', currentTitle: '新媒体运营', source: 'Boss直聘', applied: -22, match: 63, resumeScore: 60, tags: ['小红书', '短视频'] }
};

function demoCandidateNameList() {
  var out = [];
  Object.keys(DEMO_CAND_NAMES).forEach(function (k) { DEMO_CAND_NAMES[k].forEach(function (n) { out.push(n); }); });
  return out;
}
function demoMatch(c, job) {
  var m = S.settings.match;
  var rank = { '博士': 5, '硕士': 4, '本科': 3, '大专': 2, '高中': 1 };
  var need = rank[job.eduReq] || 3, got = rank[c.resume.degree] || 3;
  var edu = got >= need ? m.edu : Math.max(6, Math.round(m.edu * got / need));
  var y = c.resume.years, exp;
  if (y >= job.expMin && y <= job.expMax) exp = m.exp;
  else if (y > job.expMax) exp = Math.max(14, m.exp - (y - job.expMax) * 4);
  else exp = Math.max(8, Math.round(m.exp * Math.max(0.35, (y + 0.5) / job.expMin)));
  var hits = job.skills.filter(function (s) { return c.resume.skills.indexOf(s) >= 0; }).length;
  var skill = Math.round(m.skill * hits / job.skills.length);
  var range = jobSalaryRange(job);
  var sal = c.resume.expectedNum <= range[1] ? m.salary : Math.max(4, Math.round(m.salary - (c.resume.expectedNum - range[1]) * 1.2));
  var top = ['浙江大学', '复旦大学', '上海交通大学', '南京大学', '同济大学', '武汉大学', '华中科技大学', '中山大学', '华南理工大学', '四川大学', '西安电子科技大学', '北京邮电大学', '湖南大学', '苏州大学', '东南大学'];
  var school = top.indexOf(c.resume.school) >= 0 ? m.school : 7;
  var total = edu + exp + skill + sal + school;
  return {
    score: total,
    parts: {
      edu: { v: edu, max: m.edu, note: c.resume.degree + '，要求' + job.eduReq + '及以上' },
      exp: { v: exp, max: m.exp, note: y + ' 年，要求' + job.expMin + '-' + job.expMax + ' 年' },
      skill: { v: skill, max: m.skill, note: '关键词命中 ' + hits + '/' + job.skills.length },
      salary: { v: sal, max: m.salary, note: '期望 ' + c.resume.expected + '，预算 ' + job.salary },
      school: { v: school, max: m.school, note: c.resume.school + (top.indexOf(c.resume.school) >= 0 ? '（目标院校）' : '') }
    }
  };
}
function demoResumeText(c) {
  var job = jobById(c.jobId);
  return c.name + '，' + c.resume.degree + '，' + c.resume.school + c.resume.major + '，' + c.resume.years + ' 年经验。最近在' + c.resume.currentCompany + '担任' + c.resume.currentTitle + '，负责' + (job ? job.title : '相关') + '方向工作，熟悉 ' + c.resume.skills.join('、') + '。求职期望：' + c.resume.expected + '，' + c.resume.city + '，' + c.resume.availability + '。';
}
function demoCandidates(s, R, empIdByName) {
  var cidSeq = 101, i = 0;
  var allJobs = ['j-frontend', 'j-java', 'j-qa', 'j-pm', 'j-media', 'j-kam', 'j-recruit', 'j-cashier'];
  allJobs.forEach(function (jid) {
    var job = jobById(jid), key = DEMO_JOB_KEYS[jid], names = DEMO_CAND_NAMES[key], plan = DEMO_CAND_PLAN[key];
    names.forEach(function (name, idx) {
      var p = plan[idx], ov = DEMO_CAND_OVERRIDE[name] || {};
      var gender = ov.gender || (R() < 0.5 ? 'M' : 'F');
      var degree = ov.degree || (R() < 0.24 ? '硕士' : R() < 0.94 ? '本科' : '大专');
      var school = ov.school || DEMO_SCHOOLS[Math.floor(R() * DEMO_SCHOOLS.length)];
      var major = ov.major || DEMO_MAJORS[Math.floor(R() * DEMO_MAJORS.length)];
      var years = ov.years !== undefined ? ov.years : Math.max(1, Math.round(job.expMin + R() * (job.expMax - job.expMin + 2)));
      var range = jobSalaryRange(job);
      var expectedNum = ov.expectedNum || Math.round(range[0] + R() * Math.max(1, range[1] - range[0]));
      var expected = ov.expected || (expectedNum + 'K');
      var skills = ov.skills ? ov.skills.slice() : job.skills.filter(function (_, k) { return k === 0 || R() < 0.72; });
      if (!skills.length) skills = [job.skills[0]];
      var appliedAt = addDays(todayStr(), ov.applied !== undefined ? ov.applied : (p.screen === 'new' ? -Math.floor(R() * 4) : -Math.floor(5 + R() * 20)));
      var c = {
        id: 'c' + (cidSeq++), name: name, gender: gender,
        phone: ov.phone || ('1390000' + pad2(20 + i % 70) + pad2(10 + (i * 13) % 90)),
        email: ov.email || ('cand' + (100 + i) + '@example.com'),
        jobId: jid, deptId: job.deptId, source: ov.source || SOURCES[Math.floor(R() * SOURCES.length)],
        appliedAt: appliedAt, screen: p.screen, stage: p.stage || 'written',
        resume: {
          degree: degree, school: school, major: major, years: years,
          currentCompany: ov.currentCompany || ['阿里巴巴', '网易', '海康威视', '同花顺', '有赞', '数云', '涂鸦智能', '恒生电子', '大华股份', '税友软件', '微医', '创业慧康'][Math.floor(R() * 12)],
          currentTitle: ov.currentTitle || (job.title + ' / 相关岗位'),
          expected: expected, expectedNum: expectedNum, city: '广州',
          availability: ov.availability || (R() < 0.5 ? '在职·一个月内' : '离职·随时到岗'),
          skills: skills, summary: '',
          workList: [
            { company: ov.currentCompany || '某互联网公司', title: ov.currentTitle || job.title, start: addMonths(appliedAt, -(years * 12)), end: '', desc: '负责' + job.title + '相关工作，参与核心项目从 0 到 1 的建设。' },
            { company: '某科技有限公司', title: job.title, start: addMonths(appliedAt, -(years * 12 + 30)), end: addMonths(appliedAt, -(years * 12)), desc: '负责业务模块开发与跨团队协作，积累了完整的项目经验。' }
          ],
          eduList: [{ school: school, major: major, degree: degree, start: (2008 + (gender === 'F' ? 2 : 0)) + '-' + pad2(1 + Math.floor(R() * 8)) + '-01', end: (2012 + (gender === 'F' ? 2 : 0)) + '-06-30' }]
        },
        match: null,
        scores: {
          resume: ov.resumeScore !== undefined ? ov.resumeScore : null,
          written: ov.written !== undefined ? ov.written : null,
          rounds: [],
          adjust: 0
        },
        tags: ov.tags ? ov.tags.slice() : skills.slice(0, 3),
        note: '', star: 0, isNew: p.screen === 'new'
      };
      c.resume.summary = demoResumeText(c);
      // 匹配度
      var mm = demoMatch(c, job);
      if (ov.match !== undefined) {
        var diff = ov.match - mm.score;
        mm.score = ov.match;
        // 把差值落到技能/经验上，保证明细加起来等于总分
        var parts = ['edu', 'exp', 'skill', 'salary', 'school'];
        var guard = 0;
        while (diff !== 0 && guard++ < 100) {
          var k = parts[guard % parts.length], part = mm.parts[k];
          if (diff > 0 && part.v < part.max) { part.v++; diff--; }
          else if (diff < 0 && part.v > 0) { part.v--; diff++; }
        }
        mm.parts.skill.note = '关键词命中 ' + Math.min(job.skills.length, Math.max(1, Math.round(mm.parts.skill.v / S.settings.match.skill * job.skills.length))) + '/' + job.skills.length;
      }
      if (ov.match === undefined && (p.screen === 'new' || p.screen === 'pending')) {
        var pen = 8 + Math.floor(R() * 8), order = ['skill', 'exp', 'salary', 'edu', 'school'], guard2 = 0;
        while (pen > 0 && guard2++ < 200) {
          var pk = order[guard2 % order.length], pp = mm.parts[pk];
          if (pp.v > 0) { pp.v--; pen--; }
        }
        mm.score = mm.parts.edu.v + mm.parts.exp.v + mm.parts.skill.v + mm.parts.salary.v + mm.parts.school.v;
      }
      c.match = mm;
      // 简历评分：进入笔试及之后的候选人都有
      if (c.scores.resume === null && p.screen === 'passed') c.scores.resume = clamp(Math.round(mm.score * 0.82 + 8 + R() * 8), 50, 98);
      // 各轮面试成绩
      if (ov.rounds) {
        ov.rounds.forEach(function (score, ri) {
          c.scores.rounds.push({ round: ri + 1, score: score, date: addDays(appliedAt, 4 + ri * 4), interviewer: ['梁晨阳', '傅静', '许亦宇', '李经理'][ri % 4], note: '' });
        });
      }
      s.candidates.push(c);
      i++;
    });
  });
  // 面试、Offer、通知、离职、简历附件
  demoFlow(s, R, empIdByName);
}
