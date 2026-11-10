/* =========================================================
   DEMO · 示例公司：皮皮未来科技有限公司（44 人、7 个部门、8 个在招职位）
   数据全部是虚拟的，用来演示工作台；换公司时可一键清空
   ========================================================= */
function demoRng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var DEMO_SCHOOLS = ['浙江大学', '广东工业大学', '浙江工业大学', '浙江理工大学', '南京大学', '东南大学', '复旦大学', '上海交通大学', '同济大学', '武汉大学', '华中科技大学', '中山大学', '华南理工大学', '四川大学', '西安电子科技大学', '北京邮电大学', '湖南大学', '苏州大学', '郑州大学', '浙江工商大学', '华南师范大学', '宁波大学', '中国计量大学', '浙江财经大学'];
var DEMO_MAJORS = ['计算机科学与技术', '软件工程', '信息管理与信息系统', '数字媒体技术', '电子信息工程', '通信工程', '市场营销', '新闻传播学', '广告学', '视觉传达设计', '工商管理', '会计学', '财务管理', '人力资源管理', '应用心理学', '统计学', '汉语言文学', '电子商务'];
var DEMO_DEGREES = ['本科', '硕士', '本科', '本科', '硕士', '本科', '大专', '本科', '硕士', '本科'];

/* 部门：顺序与花名册、办公室一致 */
var DEMO_DEPTS = [
  { id: 'boss', name: '总经办', color: '#171717' },
  { id: 'tech', name: '技术研发部', color: '#2f7ff0' },
  { id: 'product', name: '产品设计部', color: '#7a5af5' },
  { id: 'marketing', name: '市场运营部', color: '#14b0a6' },
  { id: 'sales', name: '销售部', color: '#f2a71b' },
  { id: 'hr', name: '人力行政部', color: '#e5483b' },
  { id: 'finance', name: '财务部', color: '#3ea35c' }
];

/* 员工：工号按入职先后编排；gender M/F；level 职级 */
var DEMO_EMPS = [
  ['tech', '梁晨阳', 'M', '技术总监', 'M2', 'active', 'lead', '2019-03-11', '1988-06-18', '硕士', '浙江大学', '计算机科学与技术', 48000, '统筹技术架构与研发团队'],
  ['tech', '龙俊熙', 'M', '后端工程师', 'P5', 'active', 'member', '2021-07-05', '1994-02-26', '本科', '广东工业大学', '软件工程', 28000, '负责数据平台后端与微服务'],
  ['tech', '康浩宇', 'M', '后端工程师', 'P5', 'active', 'member', '2022-03-14', '1993-11-09', '硕士', '浙江工业大学', '计算机科学与技术', 27000, '负责权限、计费与开放平台'],
  ['tech', '傅芳', 'F', '后端工程师', 'P5', 'active', 'member', '2023-05-22', '1995-08-17', '本科', '南京大学', '软件工程', 26000, '负责实时计算与数据同步'],
  ['tech', '黎明哲', 'M', '前端工程师', 'P4', 'probation', 'member', '2026-08-15', '2000-09-11', '本科', '苏州大学', '电子信息工程', 19000, '负责数据看板与可视化组件'],
  ['tech', '林子涵', 'F', '前端工程师', 'P4', 'active', 'member', '2024-02-19', '1998-11-03', '本科', '浙江理工大学', '数字媒体技术', 20000, '负责管理后台与组件库'],
  ['tech', '夏婷婷', 'F', '前端工程师', 'P4', 'active', 'member', '2024-09-02', '1997-04-12', '硕士', '同济大学', '软件工程', 22000, '负责移动端与小程序'],
  ['tech', '胡皓轩', 'M', '测试工程师', 'P4', 'active', 'member', '2023-11-27', '1996-01-30', '本科', '武汉大学', '计算机科学与技术', 18000, '负责自动化测试与质量体系'],
  ['tech', '赵军', 'M', '测试工程师', 'P4', 'active', 'member', '2023-11-06', '1992-07-21', '本科', '郑州大学', '软件工程', 17500, '负责接口测试与性能测试'],
  ['tech', '方伟', 'M', '算法工程师', 'P6', 'active', 'member', '2022-08-08', '1991-03-05', '硕士', '上海交通大学', '计算机科学与技术', 36000, '负责推荐与知识图谱算法'],
  ['tech', '唐慧敏', 'F', '运维工程师', 'P4', 'active', 'member', '2023-04-17', '1994-10-23', '本科', '华中科技大学', '通信工程', 20000, '负责云资源与发布运维'],
  ['tech', '黎伟', 'M', '开发实习生', 'P1', 'active', 'member', '2026-07-01', '2003-05-14', '本科', '广东工业大学', '软件工程', 6000, '实习：后端开发与文档维护'],
  ['product', '傅静', 'F', '产品总监', 'M1', 'active', 'lead', '2020-04-20', '1987-12-02', '硕士', '复旦大学', '信息管理与信息系统', 45000, '负责产品规划与设计团队'],
  ['product', '孔泽宇', 'M', '产品经理', 'P5', 'active', 'member', '2022-06-13', '1992-09-19', '本科', '中山大学', '工商管理', 25000, '负责数据平台产品'],
  ['product', '闫婷婷', 'F', '产品经理', 'P4', 'active', 'member', '2023-09-25', '1995-03-28', '硕士', '华南理工大学', '信息管理与信息系统', 21000, '负责增长与会员产品'],
  ['product', '谢晓燕', 'F', 'UI 设计师', 'P4', 'active', 'member', '2024-03-11', '1996-06-07', '本科', '四川大学', '视觉传达设计', 18000, '负责 B 端设计系统'],
  ['product', '范凯', 'M', '交互设计师', 'P4', 'active', 'member', '2023-12-04', '1994-01-16', '本科', '西安电子科技大学', '数字媒体技术', 19000, '负责交互原型与可用性测试'],
  ['product', '杜皓轩', 'M', '产品助理', 'P2', 'active', 'member', '2025-08-18', '1999-11-07', '本科', '北京邮电大学', '电子商务', 11000, '协助需求整理与数据分析'],
  ['marketing', '姚佳轩', 'M', '市场总监', 'M1', 'active', 'lead', '2024-11-02', '1986-05-12', '硕士', '浙江大学', '市场营销', 42000, '负责品牌与增长'],
  ['marketing', '姜馨', 'F', '品牌经理', 'P5', 'active', 'member', '2024-11-04', '1990-08-08', '本科', '湖南大学', '新闻传播学', 24000, '负责品牌内容与公关'],
  ['marketing', '焦佳怡', 'F', '内容运营', 'P3', 'active', 'member', '2024-06-24', '1997-02-18', '本科', '苏州大学', '汉语言文学', 14000, '负责公众号与案例内容'],
  ['marketing', '傅予安', 'M', '活动策划', 'P3', 'active', 'member', '2025-01-13', '1996-12-05', '本科', '郑州大学', '广告学', 14000, '负责行业活动与直播'],
  ['marketing', '丁雪', 'F', '新媒体运营', 'P3', 'active', 'member', '2024-10-08', '1998-11-05', '本科', '浙江工商大学', '新闻传播学', 13000, '负责小红书与短视频账号'],
  ['marketing', '刘诗语', 'F', '社群运营', 'P2', 'active', 'member', '2025-04-21', '1999-07-14', '本科', '华南师范大学', '市场营销', 11000, '负责客户社群与线索培育'],
  ['marketing', '杨舒窈', 'F', '视觉设计', 'P3', 'active', 'member', '2024-12-02', '1996-04-26', '本科', '宁波大学', '视觉传达设计', 15000, '负责市场物料与品牌视觉'],
  ['marketing', '赵可欣', 'F', '市场专员', 'P2', 'active', 'member', '2025-09-15', '2000-03-09', '本科', '浙江财经大学', '市场营销', 10000, '负责渠道投放与数据跟踪'],
  ['sales', '许亦宇', 'M', '销售总监', 'M1', 'active', 'lead', '2020-09-07', '1985-10-11', '本科', '浙江大学', '工商管理', 40000, '负责大客户与销售团队'],
  ['sales', '贾佳怡', 'F', '大客户经理', 'P5', 'active', 'member', '2022-11-21', '1992-06-23', '本科', '浙江工业大学', '市场营销', 22000, '负责华东区大客户'],
  ['sales', '贾毅', 'M', '大客户经理', 'P5', 'active', 'member', '2021-05-10', '1990-02-14', '本科', '南京大学', '工商管理', 23000, '负责金融行业客户'],
  ['sales', '原毅', 'M', '销售经理', 'P4', 'active', 'member', '2023-02-27', '1993-09-30', '本科', '浙江理工大学', '电子商务', 18000, '负责制造业客户'],
  ['sales', '潘子豪', 'M', '销售经理', 'P4', 'active', 'member', '2023-08-14', '1994-05-06', '本科', '中国计量大学', '市场营销', 17500, '负责零售行业客户'],
  ['sales', '王一诺', 'F', '销售专员', 'P2', 'probation', 'member', '2026-09-03', '2000-01-21', '本科', '华南师范大学', '市场营销', 9000, '负责线索跟进与商机整理'],
  ['sales', '唐嘉懿', 'F', '销售专员', 'P2', 'active', 'member', '2025-03-10', '1998-08-15', '本科', '浙江工商大学', '电子商务', 10000, '负责中小客户销售'],
  ['sales', '贾若彤', 'F', '销售助理', 'P1', 'probation', 'member', '2026-09-20', '2001-04-03', '本科', '浙江财经大学', '市场营销', 7500, '协助合同、回款与客户资料'],
  ['sales', '顾言', 'M', '售前顾问', 'P4', 'active', 'member', '2024-05-06', '1993-12-25', '硕士', '武汉大学', '信息管理与信息系统', 21000, '负责解决方案与投标支持'],
  ['hr', '李经理', 'F', '人事经理', 'M1', 'active', 'lead', '2021-04-12', '1989-07-08', '本科', '浙江大学', '人力资源管理', 26000, '负责招聘、员工关系与人事运营'],
  ['hr', '杜雨桐', 'F', '招聘专员', 'P3', 'active', 'member', '2024-07-15', '1997-10-19', '本科', '浙江工商大学', '人力资源管理', 13000, '负责技术岗位招聘'],
  ['hr', '苏晚晴', 'F', '行政专员', 'P2', 'probation', 'member', '2026-10-08', '1999-02-11', '本科', '华南师范大学', '工商管理', 8500, '负责行政、采购与员工活动'],
  ['hr', '何思远', 'M', 'HRBP', 'P4', 'active', 'member', '2023-06-19', '1994-03-22', '硕士', '华东师范大学', '应用心理学', 18000, '支持技术与产品团队'],
  ['finance', '彭军', 'M', '财务总监', 'M1', 'active', 'lead', '2020-01-06', '1984-11-28', '硕士', '浙江财经大学', '财务管理', 38000, '负责财务、税务与资金'],
  ['finance', '戴子轩', 'M', '会计', 'P4', 'active', 'member', '2022-10-17', '1992-04-09', '本科', '浙江工商大学', '会计学', 16000, '负责总账与月度结账'],
  ['finance', '谢煜城', 'M', '出纳', 'P3', 'active', 'member', '2023-07-03', '1995-12-16', '本科', '浙江财经大学', '财务管理', 12000, '负责收付款与银行对接'],
  ['finance', '段芳', 'F', '财务助理', 'P2', 'probation', 'member', '2026-09-22', '1998-05-27', '本科', '浙江工商大学', '会计学', 9000, '协助报销、发票与凭证整理'],
  ['boss', '陈远', 'M', '总经理', 'M3', 'active', 'lead', '2018-05-08', '1985-03-16', '硕士', '浙江大学', '工商管理', 60000, '负责公司整体经营与管理']
];

/* 档案材料缺失清单：13 人、共 26 项，整体齐全度 93.3% */
var DEMO_MISSING = {
  '梁晨阳': ['idcard'],
  '谢煜城': ['medical'],
  '段芳': ['bank', 'nda', 'handbook'],
  '谢晓燕': ['degree', 'bank', 'nda', 'handbook'],
  '黎明哲': ['medical', 'bank', 'nda', 'handbook'],
  '赵军': ['idcard'],
  '黎伟': ['degree', 'medical'],
  '杜皓轩': ['resign', 'photo'],
  '刘诗语': ['bank', 'handbook'],
  '贾若彤': ['degree', 'resign'],
  '何思远': ['medical', 'photo'],
  '苏晚晴': ['photo'],
  '杨舒窈': ['nda']
};

/* 在招职位 */
var DEMO_JOBS = [
  { id: 'j-frontend', title: '高级前端工程师', deptId: 'tech', headcount: 2, urgency: '高', salary: '25-40K', level: 'P6', owner: '梁晨阳', eduReq: '本科', expMin: 3, expMax: 5, skills: ['React', 'TypeScript', '前端工程化', '数据可视化'], desc: '负责数据平台前端架构、核心模块开发与性能优化。', requirements: '5 年以上前端经验，精通 React / TypeScript，有复杂中后台或数据可视化项目经验，有组件库建设经验优先。' },
  { id: 'j-java', title: 'Java 后端工程师', deptId: 'tech', headcount: 1, urgency: '中', salary: '20-35K', level: 'P5', owner: '龙俊熙', eduReq: '本科', expMin: 3, expMax: 5, skills: ['Java', 'Spring Boot', 'MySQL', '微服务'], desc: '负责数据平台后端服务、接口设计与稳定性建设。', requirements: '3 年以上 Java 开发经验，熟悉 Spring Boot / Spring Cloud、MySQL、Redis，有高并发或微服务经验优先。' },
  { id: 'j-qa', title: '测试工程师', deptId: 'tech', headcount: 1, urgency: '中', salary: '15-25K', level: 'P4', owner: '胡皓轩', eduReq: '本科', expMin: 1, expMax: 3, skills: ['功能测试', '自动化测试', '接口测试', '性能测试'], desc: '负责产品质量保障、自动化测试与测试平台建设。', requirements: '1-3 年测试经验，熟悉接口测试与自动化测试，有性能测试或测试平台经验优先。' },
  { id: 'j-pm', title: '产品经理（B 端）', deptId: 'product', headcount: 1, urgency: '高', salary: '20-35K', level: 'P5', owner: '傅静', eduReq: '本科', expMin: 3, expMax: 5, skills: ['B 端产品', '需求分析', '原型设计', 'PRD'], desc: '负责企业数据产品的需求分析、方案设计与落地。', requirements: '3 年以上 B 端产品经验，能独立完成需求调研、原型与 PRD，有数据产品或 SaaS 经验优先。' },
  { id: 'j-media', title: '新媒体运营', deptId: 'marketing', headcount: 1, urgency: '中', salary: '8-12K', level: 'P3', owner: '姜馨', eduReq: '本科', expMin: 1, expMax: 3, skills: ['短视频', '文案', '小红书', '数据分析'], desc: '负责小红书、视频号等平台的内容策划与账号增长。', requirements: '1-3 年新媒体运营经验，有从 0 到 1 账号经验，能独立完成选题、脚本、拍摄与数据复盘。' },
  { id: 'j-kam', title: '大客户经理', deptId: 'sales', headcount: 3, urgency: '高', salary: '15-25K', level: 'P5', owner: '许亦宇', eduReq: '本科', expMin: 3, expMax: 5, skills: ['大客户销售', '商务谈判', '客户关系', '招投标'], desc: '负责重点行业客户开拓、商务谈判与回款。', requirements: '3 年以上 To B 大客户销售经验，有企业服务或数据产品经验，能独立完成从线索到签约的全流程。' },
  { id: 'j-recruit', title: '招聘专员', deptId: 'hr', headcount: 1, urgency: '中', salary: '8-12K', level: 'P3', owner: '李经理', eduReq: '本科', expMin: 1, expMax: 3, skills: ['招聘', '人才寻访', '面试评估', '渠道运营'], desc: '负责技术、产品岗位的招聘交付与雇主品牌运营。', requirements: '1-3 年招聘经验，熟悉互联网岗位画像，能独立完成寻访、面试安排与 Offer 跟进。' },
  { id: 'j-cashier', title: '出纳', deptId: 'finance', headcount: 1, urgency: '低', salary: '7-10K', level: 'P2', owner: '彭军', eduReq: '本科', expMin: 1, expMax: 3, skills: ['出纳', '资金管理', '银行结算', '报销'], desc: '负责日常收付款、银行结算与报销审核。', requirements: '1-3 年出纳或财务助理经验，熟悉网银、报销流程与财务软件，细致耐心。' }
];

function demoEmployeeNo(i) { return 'XH' + (1001 + i); }
function demoPhone(i) { return '1390000' + pad2(10 + i % 90) + pad2(20 + (i * 7) % 80); }

function demoState() {
  var R = demoRng(20261108);
  var s = defaultState();
  S = s;                 // 生成过程中会用到 deptName / jobById 等查询
  s.demo = true;
  var st = s.settings;
  st.onboarded = true;
  var now = new Date();
  var thisYear = now.getFullYear(), thisMonth = now.getMonth() + 1;
  var today = todayStr(now);

  s.departments = DEMO_DEPTS.map(function (d) { return { id: d.id, name: d.name, color: d.color, leadId: '' }; });
  reindex();

  /* ---------- 员工 ---------- */
  var empIdByName = {};
  DEMO_EMPS.forEach(function (row, i) {
    var id = 'e' + (1001 + i), no = row[1] === '陈远' ? 'XH1000' : demoEmployeeNo(i), hire = row[7];
    var empStatus = row[5];
    var birthday = row[8];
    // 入职周年：赵军 3 年、姚佳轩 / 姜馨 2 年，都在本月
    if (row[1] === '赵军') hire = thisYear - 3 + '-' + pad2(thisMonth) + '-06';
    if (row[1] === '姚佳轩') hire = thisYear - 2 + '-' + pad2(thisMonth) + '-02';
    if (row[1] === '姜馨') hire = thisYear - 2 + '-' + pad2(thisMonth) + '-04';
    // 本月寿星
    if (row[1] === '林子涵') birthday = '1998-' + pad2(thisMonth) + '-03';
    if (row[1] === '丁雪') birthday = '1998-' + pad2(thisMonth) + '-05';
    if (row[1] === '杜皓轩') birthday = '1999-' + pad2(thisMonth) + '-07';
    // 试用期：黎明哲 8 月 15 日入职，试用期 11 月 15 日到期
    if (row[1] === '黎明哲') hire = thisYear + '-08-15';
    if (row[1] === '段芳') hire = addDays(today, -47);
    var probationEnd = row[5] === 'probation' ? (row[1] === '黎明哲' ? thisYear + '-11-15' : addMonths(hire, st.probationMonths)) : addMonths(hire, st.probationMonths);
    var contractEnd = addDays(addMonths(hire, 36), -1);
    while (daysTo(contractEnd) < 60) contractEnd = addDays(addMonths(contractEnd, 36), -1);
    var manager = row[6] === 'member' ? (DEMO_EMPS.filter(function (x) { return x[0] === row[0] && x[6] === 'lead'; })[0] || [])[1] : '';
    var materials = {};
    DOC_TYPES.forEach(function (d) { materials[d.id] = true; });
    (DEMO_MISSING[row[1]] || []).forEach(function (k) { materials[k] = false; });
    var tags = [];
    if (row[6] === 'lead') tags.push('管理层');
    if (row[1] === '黎明哲') tags.push('新人');
    if (row[1] === '黎伟') tags.push('实习生');
    if (['方伟', '孔泽宇', '贾毅', '梁晨阳'].indexOf(row[1]) >= 0) tags.push('核心骨干');
    if (row[5] === 'probation' && row[1] !== '黎明哲') tags.push('新人');
    var edu = row[9], school = row[10], major = row[11];
    var emp = {
      id: id, no: no, name: row[1], gender: row[2], deptId: row[0], title: row[3], level: row[4],
      managerName: manager, empStatus: empStatus, hireDate: hire, probationEnd: probationEnd, contractEnd: contractEnd,
      birthday: birthday, phone: demoPhone(i), email: 'xh' + (1001 + i) + '@pipi-future.cn',
      education: edu, school: school, major: major, city: '广州', salary: row[12],
      materials: materials, tags: tags, note: row[13],
      emergency: { name: '', rel: '父母', phone: '' },
      address: '广州市' + ['天河区', '海珠区', '番禺区', '越秀区', '黄埔区'][i % 5] + '科韵路 ' + (100 + i * 7) + ' 号',
      bank: '招商银行 ' + (6225 + i) + ' **** ' + pad2(10 + i % 80),
      leftDate: ''
    };
    if (empStatus === 'probation' && row[1] !== '黎明哲') emp.tags.push('新人');
    s.employees.push(emp);
    empIdByName[emp.name] = id;
    addEvent(id, '入职', '入职' + deptName(row[0]) + ' · ' + row[3], hire);
    if (empStatus === 'active' && row[6] === 'member' && tenureMonths(hire) > 6) {
      addEvent(id, '转正', '试用期通过，转正为' + row[3], addMonths(hire, st.probationMonths));
    }
    if (row[1] === '方伟') addEvent(id, '晋升', '晋升为算法工程师 P6', addMonths(today, -8));
    if (row[1] === '傅静') addEvent(id, '晋升', '晋升为产品总监 M1', addMonths(today, -14));
    if (row[1] === '孔泽宇') addEvent(id, '调岗', '由产品运营调岗至产品经理', addMonths(today, -10));
  });
  // 部门负责人
  s.departments.forEach(function (d) {
    var lead = DEMO_EMPS.filter(function (x) { return x[0] === d.id && x[6] === 'lead'; })[0];
    d.leadId = lead ? empIdByName[lead[1]] : '';
  });
  st.bossId = empIdByName['陈远'] || '';
  if (st.bossId) S.events.push({ id: uid('ev'), eid: st.bossId, type: '备忘', text: '管理层例会；确认 Q4 招聘编制', date: addDays(today, 3), time: '10:00', at: Date.now() });

  /* ---------- 今日状态：请假 2、出差 1、外勤 1 ---------- */
  var byName = {};
  s.employees.forEach(function (e) { byName[e.name] = e; });
  s.status[today] = {};
  if (byName['赵军']) s.status[today][byName['赵军'].id] = 'leave';
  if (byName['丁雪']) s.status[today][byName['丁雪'].id] = 'leave';
  if (byName['贾毅']) s.status[today][byName['贾毅'].id] = 'business';
  if (byName['贾佳怡']) s.status[today][byName['贾佳怡'].id] = 'field';
  // 过去 30 天的出勤记录，用于人事分析
  for (var d = 1; d <= 30; d++) {
    var ds = addDays(today, -d), dt = parseDate(ds);
    if (!dt || dt.getDay() === 0 || dt.getDay() === 6) continue;
    var day = {};
    if (R() < 0.16) day[s.employees[Math.floor(R() * s.employees.length)].id] = R() < 0.55 ? 'leave' : R() < 0.7 ? 'business' : 'field';
    if (Object.keys(day).length) s.status[ds] = day;
  }

  /* ---------- 职位 ---------- */
  s.jobs = DEMO_JOBS.map(function (j) {
    return Object.assign({}, j, { ownerId: empIdByName[j.owner] || '', status: 'open', createdAt: addDays(today, -40 - Math.round(R() * 60)), city: '广州' });
  });
  reindex();

  /* ---------- 候选人、面试、Offer、通知 ---------- */
  demoCandidates(s, R, empIdByName);

  /* ---------- 文件柜：282 份员工档案 + 80 份合同协议 + 6 制度 + 2 证照 = 370，简历附件 20 份由候选人生成 ---------- */
  var docs = [];
  var mat = 0;
  s.employees.forEach(function (e) {
    var types = (s.settings.docTypes || []);
    types.forEach(function (dt) {
      if (!e.materials[dt.id]) return;
      if (mat >= 282) return;
      var meta = DOC_TYPES.filter(function (x) { return x.id === dt.id; })[0] || { ext: 'pdf' };
      docs.push({
        id: uid('doc'), cat: 'material', name: e.name + '-' + dt.name + '.' + meta.ext, eid: e.id, docType: dt.id,
        size: 60000 + Math.round(R() * 2200000), at: addDays(e.hireDate, Math.round(R() * 20)), expireAt: ''
      });
      mat++;
    });
  });
  var contractCount = 0;
  s.employees.forEach(function (e) {
    if (contractCount < 80) { docs.push({ id: uid('doc'), cat: 'contract', name: e.name + '-劳动合同.pdf', eid: e.id, docType: 'contract', size: 180000 + Math.round(R() * 400000), at: e.hireDate, expireAt: '' }); contractCount++; }
    if (e.materials.nda && contractCount < 80) { docs.push({ id: uid('doc'), cat: 'contract', name: e.name + '-保密协议.pdf', eid: e.id, docType: 'nda', size: 90000 + Math.round(R() * 160000), at: e.hireDate, expireAt: '' }); contractCount++; }
  });
  ['员工手册（2026 版）.pdf', '考勤与休假制度.pdf', '报销管理制度.pdf', '信息安全规范.pdf', '招聘管理制度.pdf', '绩效管理办法.pdf'].forEach(function (n, i) {
    docs.push({ id: uid('doc'), cat: 'policy', name: n, size: 120000 + i * 45000, at: addDays(today, -200 + i * 12), expireAt: '' });
  });
  docs.push({ id: uid('doc'), cat: 'license', name: '营业执照（副本）.pdf', size: 480000, at: '2019-03-18', expireAt: '' });
  docs.push({ id: uid('doc'), cat: 'license', name: '人力资源服务许可证.pdf', size: 320000, at: '2024-06-30', expireAt: addDays(today, 12) });
  // 三份即将到期：一份资质、两份体检报告
  var med = docs.filter(function (x) { return x.cat === 'material' && x.docType === 'medical'; }).slice(0, 2);
  med.forEach(function (x, i) { x.expireAt = addDays(today, 7 + i * 8); });
  s.documents = docs.concat(s.documents.filter(function (d) { return d.cat === 'resume'; }));

  /* ---------- 待办 ---------- */
  s.todos = [
    { id: uid('t'), text: '确认本周五新员工入职准备（工位、电脑、门禁）', done: false },
    { id: uid('t'), text: '把高级前端工程师的 JD 更新到招聘渠道', done: false },
    { id: uid('t'), text: '整理 10 月人事月报', done: true }
  ];

  demoHRModules(s, R, empIdByName);

  s.meta.createdAt = Date.now();
  return s;
}
