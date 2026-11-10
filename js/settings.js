/* =========================================================
   设置 · 公司、部门、招聘规则、人事规则、通知模板、AI 接口、数据备份
   ========================================================= */
var SetP = { sec: 'profile', tpl: 'screeningPass' };
var SET_SECS = [['profile', '公司信息'], ['departments', '部门与负责人'], ['recruit', '招聘规则'], ['hr', '人事规则'], ['attendance', '考勤规则'], ['performance', '绩效规则'], ['activity', '活动与培训'], ['templates', '通知模板'], ['ai', 'AI 接口'], ['data', '数据与备份'], ['about', '关于']];
UI.register('settings', {
  render: function (main, opts) {
    if (opts && opts.sec) SetP.sec = opts.sec;
    main.innerHTML = '<div class="page scroll"><div class="page-head"><div><h1 class="page-title">设置</h1><div class="page-desc">修改后自动保存</div></div></div>' +
      '<div class="set-layout"><nav class="set-nav">' + SET_SECS.map(function (s) { return '<button class="' + (SetP.sec === s[0] ? 'on' : '') + '" data-act="set-sec" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</nav><div id="setBody"></div></div></div>';
    renderSetBody();
  }
});
UI.act['set-sec'] = function (el) { SetP.sec = el.getAttribute('data-s'); $$('.set-nav button').forEach(function (b) { b.classList.toggle('on', b === el); }); renderSetBody(); };
function sInp(path, val, ph, type, extra) { return '<input class="inp' + (type === 'number' ? ' num' : '') + '" ' + (type ? 'type="' + type + '" ' : '') + 'value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(ph || '') + '" data-inp="set" data-path="' + path + '"' + (extra || '') + '>'; }
function setPath(path, v) { var p = path.split('.'), o = S.settings; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; }
UI.inp['set'] = function (el) {
  var path = el.getAttribute('data-path'), v = el.type === 'number' ? parseFloat(el.value) : el.value;
  if (el.type === 'number' && isNaN(v)) return;
  setPath(path, v); save();
  if (/hr\.name|hr\.title|company|short/.test(path)) UI.refreshSide();
};
function renderSetBody() {
  var st = S.settings, h = '', el = $('#setBody'); if (!el) return;
  if (SetP.sec === 'profile') {
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:14px">公司信息</div>' +
      '<div class="set-grid2"><div class="field"><label>公司全称</label>' + sInp('company', st.company, '如：皮皮未来科技有限公司') + '</div><div class="field"><label>公司简称</label>' + sInp('short', st.short, '如：皮皮未来') + '</div></div>' +
      '<div class="set-grid3"><div class="field"><label>城市</label>' + sInp('city', st.city, '如：广州') + '</div><div class="field"><label>行业</label>' + sInp('industry', st.industry, '如：企业服务 · AI 数据平台') + '</div><div class="field"><label>成立时间</label>' + sInp('founded', st.founded, '', 'date') + '</div></div>' +
      '<div class="set-grid2"><div class="field"><label>上班时间</label>' + sInp('workTime.start', st.workTime.start, '', 'time') + '</div><div class="field"><label>下班时间</label>' + sInp('workTime.end', st.workTime.end, '', 'time') + '</div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:14px">我的信息</div><div class="gender-pick" style="margin-bottom:14px">' + ['F', 'M'].map(function (g) { return '<button class="' + (st.hr.gender === g ? 'on' : '') + '" data-act="set-hr-gender" data-g="' + g + '">' + ART.avatar({ id: 'hr-' + g, name: st.hr.name, gender: g }, 72, { color: '#e5483b' }) + (g === 'F' ? '女' : '男') + '</button>'; }).join('') + '</div>' +
      '<div class="set-grid2"><div class="field"><label>称呼</label>' + sInp('hr.name', st.hr.name, '如：李经理') + '</div><div class="field"><label>职位</label>' + sInp('hr.title', st.hr.title, '如：人事经理') + '</div></div></div>';
    var bossEmp = S.settings.bossId ? empById(S.settings.bossId) : null;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:6px">Boss</div><div class="muted" style="font-size:12.5px;margin-bottom:12px">Boss 从员工花名册里选，资料、备注和档案都跟员工一样；选好后会出现在办公室顶部的 Boss 办公室</div>' +
      '<div class="field"><label>Boss</label><select class="sel" data-chg="set-boss"><option value="">暂不设置</option>' + activeEmployees().map(function (e) { return '<option value="' + e.id + '"' + (S.settings.bossId === e.id ? ' selected' : '') + '>' + esc(e.name + ' · ' + e.title + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select><div class="hint">先到「员工花名册」添加或编辑员工资料；Boss 的备注可以记要求、工作安排、行程</div></div>' +
      (bossEmp ? '<div class="status-row" style="padding:10px 0 0;cursor:default">' + empAva(bossEmp, 34) + '<div><div class="sn">' + esc(bossEmp.name) + '</div><div class="sd">' + esc(bossEmp.title + ' · ' + deptName(bossEmp.deptId)) + '</div></div><span class="grow"></span><button class="btn btn-xs btn-light" data-act="open-emp" data-eid="' + bossEmp.id + '">查看档案</button><button class="btn btn-xs btn-light" data-act="office-memo" data-eid="' + bossEmp.id + '">添加备注</button></div>' : '') + '</div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:6px">工作台显示</div><div class="muted" style="font-size:12.5px;margin-bottom:12px">办公室默认视图、全屏等显示设置</div>' +
      '<div class="set-grid2"><div class="field"><label>办公室默认视图</label><select class="sel" data-chg="set-office-mode">' + [['daily', '日常'], ['att', '在岗'], ['probation', '转正'], ['contract', '合同'], ['tenure', '司龄']].map(function (x) { return '<option value="' + x[0] + '"' + (st.officeMode === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div></div></div>';
  } else if (SetP.sec === 'departments') {
    h += '<div class="panel set-sec"><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><div class="panel-title" style="margin:0">部门</div><span class="grow"></span><button class="btn btn-light btn-sm" data-act="dept-add">' + ICON.plus + '添加部门</button></div><div class="dept-list">' + S.departments.map(function (d) {
      var n = employeesOfDept(d.id).length, lead = deptLead(d.id);
      return '<div class="dept-row"><span class="dc" style="background:' + d.color + '"></span><div class="grow"><b>' + esc(d.name) + '</b><div><small>' + n + ' 人 · 负责人 ' + esc(lead ? lead.name : '未设置') + '</small></div></div><button class="btn btn-xs btn-ghost" data-act="dept-edit" data-id="' + d.id + '">编辑</button><button class="btn btn-xs btn-ghost" data-act="dept-del" data-id="' + d.id + '">删除</button></div>';
    }).join('') + '</div></div>';
    h += '<div class="panel set-sec"><div class="panel-title">部门说明</div><div class="muted" style="font-size:12.5px;line-height:1.8;margin-top:8px">部门会显示在办公室平面图、员工花名册和招聘看板里。删除部门前需要先把该部门员工调到其他部门。</div></div>';
  } else if (SetP.sec === 'recruit') {
    var w = st.weights, m = st.match, g = st.grade;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">综合成绩权重</div><div class="panel-sub">简历 + 笔试 + 面试，合计 100%</div><div class="set-grid3"><div class="field"><label>简历</label>' + sInp('weights.resume', w.resume, '', 'number') + '</div><div class="field"><label>笔试</label>' + sInp('weights.written', w.written, '', 'number') + '</div><div class="field"><label>面试</label>' + sInp('weights.interview', w.interview, '', 'number') + '</div></div>' +
      '<div class="set-grid3"><div class="field"><label>A 级分数线</label>' + sInp('grade.a', g.a, '', 'number') + '</div><div class="field"><label>B 级分数线</label>' + sInp('grade.b', g.b, '', 'number') + '</div><div class="field"><label>C 级分数线</label>' + sInp('grade.c', g.c, '', 'number') + '</div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">简历匹配度权重</div><div class="panel-sub">学历 + 经验 + 技能 + 薪资 + 院校，合计 100</div><div class="set-grid3"><div class="field"><label>学历</label>' + sInp('match.edu', m.edu, '', 'number') + '</div><div class="field"><label>经验</label>' + sInp('match.exp', m.exp, '', 'number') + '</div><div class="field"><label>技能</label>' + sInp('match.skill', m.skill, '', 'number') + '</div></div><div class="set-grid3"><div class="field"><label>薪资</label>' + sInp('match.salary', m.salary, '', 'number') + '</div><div class="field"><label>院校</label>' + sInp('match.school', m.school, '', 'number') + '</div><div class="field"><label>合计</label><div class="inp num" style="display:flex;align-items:center;background:var(--fill)">' + (m.edu + m.exp + m.skill + m.salary + m.school) + '</div></div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">招聘流程</div><div class="panel-sub">当前流程：简历筛选 → 笔试 → 初试 → 复试 → Offer → 入职</div><div class="muted" style="font-size:12.5px;line-height:1.8">候选人通过初筛后进入笔试，笔试成绩 ≥ 60 分可以进入初试；面试通过后进入 Offer 阶段。评分规则可以在「综合成绩 → 评分规则」里调整。</div></div>';
  } else if (SetP.sec === 'hr') {
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:14px">用工规则</div><div class="set-grid3"><div class="field"><label>试用期（月）</label>' + sInp('probationMonths', st.probationMonths, '', 'number') + '</div><div class="field"><label>合同期限（年）</label>' + sInp('contractYears', st.contractYears, '', 'number') + '</div><div class="field"><label>默认城市</label>' + sInp('city', st.city, '') + '</div></div></div>';
    h += '<div class="panel set-sec"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><div class="panel-title" style="margin:0">档案材料清单</div><span class="muted" style="font-size:12px">用于文件柜的齐全度统计</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="doc-add">' + ICON.plus + '添加材料</button></div><div class="doc-config">' + st.docTypes.map(function (d) {
      return '<div class="doc-config-row"><span class="grow"><b>' + esc(d.name) + '</b><div><small>' + (d.required === false ? '非必填' : '必填') + '</small></div></span><button class="switch' + (d.required !== false ? ' on' : '') + '" data-act="doc-req" data-id="' + d.id + '" title="是否必填"><i></i></button><button class="btn btn-xs btn-ghost" data-act="doc-edit" data-id="' + d.id + '">改名</button><button class="btn btn-xs btn-ghost" data-act="doc-del" data-id="' + d.id + '">删除</button></div>';
    }).join('') + '</div></div>';
  } else if (SetP.sec === 'attendance') {
    var at = st.attendance;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">工作时间</div><div class="panel-sub">用于判断迟到、早退和工时</div><div class="set-grid3"><div class="field"><label>上班时间</label>' + sInp('attendance.start', at.start, '', 'time') + '</div><div class="field"><label>下班时间</label>' + sInp('attendance.end', at.end, '', 'time') + '</div><div class="field"><label>迟到宽限（分钟）</label>' + sInp('attendance.lateGrace', at.lateGrace, '', 'number') + '</div></div><div class="set-grid3"><div class="field"><label>早退宽限（分钟）</label>' + sInp('attendance.earlyGrace', at.earlyGrace, '', 'number') + '</div><div class="field"><label>工作日</label><div class="chips" style="margin-top:6px">' + [1,2,3,4,5,6,7].map(function (d) { return '<button class="' + (at.workdays.indexOf(d) >= 0 ? 'on' : '') + '" data-act="set-workday" data-v="' + d + '">周' + WEEK[d % 7] + '</button>'; }).join('') + '</div></div></div></div>';
    h += '<div class="panel set-sec"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><div class="panel-title" style="margin:0">请假类型</div><span class="grow"></span><button class="btn btn-light btn-sm" data-act="leave-type-add">' + ICON.plus + '添加类型</button></div><div class="doc-config">' + at.leaveTypes.map(function (t) { return '<div class="doc-config-row"><span class="grow"><b>' + esc(t.name) + '</b></span><button class="btn btn-xs btn-ghost" data-act="leave-type-del" data-id="' + t.id + '">删除</button></div>'; }).join('') + '</div></div>';
  } else if (SetP.sec === 'performance') {
    var pf = st.performance;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">评分权重</div><div class="panel-sub">目标 + 能力 + 价值观，合计 100%</div><div class="set-grid3"><div class="field"><label>目标完成</label>' + sInp('performance.weights.goal', pf.weights.goal, '', 'number') + '</div><div class="field"><label>能力</label>' + sInp('performance.weights.competency', pf.weights.competency, '', 'number') + '</div><div class="field"><label>价值观</label>' + sInp('performance.weights.values', pf.weights.values, '', 'number') + '</div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">等级分数线</div><div class="panel-sub">按综合得分划分等级</div><div class="set-grid3"><div class="field"><label>S 级</label>' + sInp('performance.gradeLines.S', pf.gradeLines.S, '', 'number') + '</div><div class="field"><label>A 级</label>' + sInp('performance.gradeLines.A', pf.gradeLines.A, '', 'number') + '</div><div class="field"><label>B 级</label>' + sInp('performance.gradeLines.B', pf.gradeLines.B, '', 'number') + '</div></div><div class="set-grid3"><div class="field"><label>C 级</label>' + sInp('performance.gradeLines.C', pf.gradeLines.C, '', 'number') + '</div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">等级分布目标</div><div class="panel-sub">用于校准参考，合计 100%</div><div class="set-grid3"><div class="field"><label>S</label>' + sInp('performance.distribution.S', pf.distribution.S, '', 'number') + '</div><div class="field"><label>A</label>' + sInp('performance.distribution.A', pf.distribution.A, '', 'number') + '</div><div class="field"><label>B</label>' + sInp('performance.distribution.B', pf.distribution.B, '', 'number') + '</div></div><div class="set-grid3"><div class="field"><label>C</label>' + sInp('performance.distribution.C', pf.distribution.C, '', 'number') + '</div><div class="field"><label>D</label>' + sInp('performance.distribution.D', pf.distribution.D, '', 'number') + '</div><div class="field"><label>周期长度（月）</label>' + sInp('performance.cycleMonths', pf.cycleMonths, '', 'number') + '</div></div></div>';
  } else if (SetP.sec === 'activity') {
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:12px">活动设置</div><div class="set-grid2"><div class="field"><label>默认容量</label>' + sInp('activity.defaultCapacity', st.activity.defaultCapacity, '', 'number') + '</div><div class="field"><label>预算上限（元）</label>' + sInp('activity.budgetLimit', st.activity.budgetLimit, '', 'number') + '</div></div><div style="display:flex;align-items:center;gap:10px;margin:6px 0 10px"><b style="font-size:13px">活动类型</b><span class="grow"></span><button class="btn btn-light btn-sm" data-act="act-type-add">' + ICON.plus + '添加类型</button></div><div class="doc-config">' + st.activity.types.map(function (t) { return '<div class="doc-config-row"><span class="grow"><b>' + esc(t) + '</b></span><button class="btn btn-xs btn-ghost" data-act="act-type-del" data-v="' + esc(t) + '">删除</button></div>'; }).join('') + '</div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:12px">培训设置</div><div class="set-grid2"><div class="field"><label>默认课时</label>' + sInp('training.defaultDuration', st.training.defaultDuration, '', 'number') + '</div><div class="field"><label>默认容量</label>' + sInp('training.defaultCapacity', st.training.defaultCapacity, '', 'number') + '</div></div><div style="display:flex;align-items:center;gap:10px;margin:6px 0 10px"><b style="font-size:13px">培训类型</b><span class="grow"></span><button class="btn btn-light btn-sm" data-act="train-type-add">' + ICON.plus + '添加类型</button></div><div class="doc-config">' + st.training.types.map(function (t) { return '<div class="doc-config-row"><span class="grow"><b>' + esc(t) + '</b></span><button class="btn btn-xs btn-ghost" data-act="train-type-del" data-v="' + esc(t) + '">删除</button></div>'; }).join('') + '</div></div>';
  } else if (SetP.sec === 'templates') {
    var types = [['screeningPass', '初筛通过'], ['screeningReject', '初筛未通过'], ['writtenInvite', '笔试邀请'], ['interviewInvite', '面试邀请'], ['offer', '录用通知'], ['reject', '未录用通知']];
    var tpl = st.templates[SetP.tpl] || st.templates.screeningPass;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:10px">通知模板</div><div class="chips" style="margin-bottom:14px">' + types.map(function (t) { return '<button class="' + (SetP.tpl === t[0] ? 'on' : '') + '" data-act="tpl-sec" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="tpl-editor"><label>短信</label><textarea class="ta" data-inp="set-tpl" data-k="sms">' + esc(tpl.sms) + '</textarea><label>邮件主题</label><input class="inp" data-inp="set-tpl" data-k="subject" value="' + esc(tpl.subject) + '"><label>邮件正文</label><textarea class="ta" data-inp="set-tpl" data-k="body" style="min-height:120px">' + esc(tpl.body) + '</textarea></div>' +
      '<div class="muted" style="font-size:12px;margin-top:8px">可用变量：{{姓名}} {{职位}} {{部门}} {{公司名称}} {{公司简称}} {{下一环节}} {{笔试时间}} {{面试时间}} {{面试轮次}} {{面试地点}} {{面试官}} {{到岗日期}} {{薪资}} {{签名}}</div></div>';
  } else if (SetP.sec === 'ai') {
    var a = st.ai;
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">AI 接口</div><div class="panel-sub">支持 OpenAI 兼容接口、Claude、Ollama 本地模型</div>' +
      '<div class="set-grid2"><div class="field"><label>服务商</label><select class="sel" data-chg="set-ai-provider">' + AI_PRESETS.map(function (p) { return '<option value="' + p.id + '"' + (a.provider === p.id ? ' selected' : '') + '>' + p.name + '</option>'; }).join('') + '</select></div><div class="field"><label>模型</label><input class="inp" value="' + esc(a.model) + '" data-inp="set" data-path="ai.model" placeholder="如 deepseek-flash"></div></div>' +
      '<div class="field"><label>Base URL</label><input class="inp" value="' + esc(a.base) + '" data-inp="set" data-path="ai.base" placeholder="https://api.deepseek.com"></div>' +
      '<div class="field"><label>API Key</label><input class="inp" type="password" value="' + esc(a.key) + '" data-inp="set" data-path="ai.key" placeholder="sk-..."><div class="hint">只保存在本机浏览器；如果服务商不允许网页直连，可以运行项目里的 ai-proxy.js</div></div>' +
      '<div class="set-grid2"><div class="field"><label>温度</label><input class="inp num" type="number" step="0.1" min="0" max="1.5" value="' + a.temp + '" data-inp="set" data-path="ai.temp"></div><div class="field"><label>隐私脱敏</label><div class="seg light" id="aiMask"><button type="button" class="' + (a.mask ? 'on' : '') + '" data-act="set-ai-mask" data-v="1">开启</button><button type="button" class="' + (!a.mask ? 'on' : '') + '" data-act="set-ai-mask" data-v="0">关闭</button></div><div class="hint">开启后，员工和候选人姓名会替换成占位符再发给 AI</div></div></div>' +
      '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-light btn-sm" data-act="ai-test">测试连接</button><span class="muted" id="aiTestMsg" style="font-size:12px;display:flex;align-items:center"></span></div></div>';
  } else if (SetP.sec === 'data') {
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:4px">数据与备份</div><div class="panel-sub">所有数据只保存在这台电脑的浏览器里，换电脑前记得导出备份</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-dark btn-sm" data-act="data-export">' + ICON.down + '导出备份</button><button class="btn btn-light btn-sm" data-act="data-import">' + ICON.up + '导入备份</button><button class="btn btn-light btn-sm" data-act="data-demo">载入示例公司</button><button class="btn btn-light btn-sm" data-act="data-hr-demo">重建人事演示数据</button></div><div class="muted" style="font-size:12px;margin-top:10px">上次备份：' + (st.lastBackup ? fmtTime(st.lastBackup) : '还没有备份') + '</div></div>';
    h += '<div class="panel set-sec"><div class="panel-title">数据统计</div><div class="info-grid" style="margin-top:10px"><div class="k">员工</div><div>' + S.employees.length + ' 人（在职 ' + activeEmployees().length + '）</div><div class="k">候选人</div><div>' + S.candidates.length + ' 份简历</div><div class="k">面试</div><div>' + S.interviews.length + ' 场</div><div class="k">文件</div><div>' + S.documents.length + ' 份 · 已用 ' + docFileSize(Store.used()) + '</div></div></div>';
    h += '<div class="panel set-sec"><div class="panel-title" style="margin-bottom:6px">危险操作</div><div class="set-danger"><b>清空所有数据</b><div class="muted" style="font-size:12.5px;line-height:1.7;margin:6px 0 10px">会删除员工、候选人、面试、文件柜和所有设置，回到首次打开的状态。建议先导出备份。</div><button class="btn btn-sm" style="background:var(--red);color:#fff" data-act="data-clear">清空并重新开始</button></div></div>';
  } else if (SetP.sec === 'about') {
    h += '<div class="panel set-sec"><div class="panel-title">关于 HR 工作台</div><div class="muted" style="font-size:13px;line-height:1.9;margin-top:10px">HR 工作台 v' + VERSION + ' · 个人工作台系列<br>办公室、招聘、员工、文件柜、人事分析和 AI 助手，数据只保存在本机浏览器。<br><br>出品：皮皮未来 · 更新维护：周一<br>微信 &amp; 小红书：xscanzm<br>© 2026 皮皮未来 · 周一 · 保留所有权利</div><div style="margin-top:14px;display:flex;gap:8px"><button class="btn btn-light btn-sm" data-act="about-open">打开关于页</button><button class="btn btn-dark btn-sm" data-act="consult-open">微信咨询</button></div></div>';
  }
  el.innerHTML = h;
}
UI.act['set-hr-gender'] = function (el) { S.settings.hr.gender = el.getAttribute('data-g'); save(); renderSetBody(); UI.refreshSide(); };
UI.chg['set-boss'] = function (el) { S.settings.bossId = el.value; save(); renderSetBody(); };
UI.chg['set-office-mode'] = function (el) { S.settings.officeMode = el.value; save(); };
UI.chg['set-ai-provider'] = function (el) {
  var p = presetOf(el.value); S.settings.ai.provider = p.id;
  if (p.base) S.settings.ai.base = p.base;
  if (p.model) S.settings.ai.model = p.model;
  save(); renderSetBody();
};
UI.act['set-ai-mask'] = function (el) { S.settings.ai.mask = el.getAttribute('data-v') === '1'; save(); renderSetBody(); };
UI.inp['set-tpl'] = function (el) { var t = S.settings.templates[SetP.tpl]; if (!t) return; t[el.getAttribute('data-k')] = el.value; save(); };
UI.act['tpl-sec'] = function (el) { SetP.tpl = el.getAttribute('data-v'); renderSetBody(); };
UI.act['ai-test'] = function () {
  var msg = $('#aiTestMsg'); if (!msg) return;
  if (!AIC.ready()) { msg.innerHTML = '<span class="dn">还没有填完整 Base URL、模型或 Key</span>'; return; }
  msg.textContent = '正在测试…';
  AIC.stream([{ role: 'user', content: '请回复「连接成功」四个字。' }], function () { }, null, 20).then(function () { msg.innerHTML = '<span class="up">连接成功</span>'; }).catch(function (e) { msg.innerHTML = '<span class="dn">' + esc(e.message || '连接失败') + '</span>'; });
};

/* ---------- 部门管理 ---------- */
UI.act['dept-add'] = function () { openDeptForm(null); };
UI.act['dept-edit'] = function (el) { openDeptForm(deptById(el.getAttribute('data-id'))); };
UI.act['dept-del'] = function (el) {
  var d = deptById(el.getAttribute('data-id')); if (!d) return;
  if (employeesOfDept(d.id).length) { UI.toast('该部门还有员工，先把员工调到其他部门'); return; }
  UI.confirm('删除部门', '确定删除「' + esc(d.name) + '」吗？', '删除', function () { S.departments = S.departments.filter(function (x) { return x.id !== d.id; }); save(); renderSetBody(); UI.refreshSide(); }, true);
};
function openDeptForm(d) {
  var isNew = !d, x = d || { id: uid('dept'), name: '', color: DEPT_COLORS[S.departments.length % DEPT_COLORS.length], leadId: '' };
  UI.modal({
    title: isNew ? '添加部门' : '编辑部门', body: '<div class="field"><label>部门名称</label><input class="inp" id="dfName" value="' + esc(x.name) + '" autofocus></div>' +
      '<div class="field"><label>负责人</label><select class="sel" id="dfLead"><option value="">暂不设置</option>' + S.employees.map(function (e) { return '<option value="' + e.id + '"' + (x.leadId === e.id ? ' selected' : '') + '>' + esc(e.name + ' · ' + e.title) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>颜色</label><div class="chips" id="dfColors">' + DEPT_COLORS.map(function (c) { return '<button type="button" class="' + (x.color === c ? 'on' : '') + '" data-act="df-color" data-c="' + c + '" style="width:30px;height:30px;border-radius:9px;background:' + c + ';padding:0"></button>'; }).join('') + '</div></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="df-save" data-new="' + (isNew ? 1 : 0) + '">保存</button>'
  });
  UI.modalCtx.dept = x;
}
UI.act['df-color'] = function (el) { UI.modalCtx.dept.color = el.getAttribute('data-c'); $$('#dfColors button').forEach(function (b) { b.classList.toggle('on', b === el); }); };
UI.act['df-save'] = function (el) {
  var d = UI.modalCtx.dept, isNew = el.getAttribute('data-new') === '1';
  d.name = $('#dfName').value.trim(); if (!d.name) { UI.toast('请填写部门名称'); return; }
  d.leadId = $('#dfLead').value;
  if (isNew) S.departments.push(d); else Object.assign(deptById(d.id), d);
  save(); UI.closeModal(); renderSetBody(); UI.refreshSide(); UI.toast('已保存');
};

/* ---------- 材料清单 ---------- */
UI.act['doc-add'] = function () {
  UI.modal({ title: '添加材料', body: '<div class="field"><label>材料名称</label><input class="inp" id="dcName" placeholder="如：社保缴纳证明" autofocus></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="dc-save">保存</button>' });
};
UI.act['dc-save'] = function () {
  var n = $('#dcName').value.trim(); if (!n) { UI.toast('请填写名称'); return; }
  S.settings.docTypes.push({ id: uid('dt'), name: n, required: true });
  save(); UI.closeModal(); renderSetBody(); UI.toast('已添加');
};
UI.act['doc-edit'] = function (el) {
  var d = S.settings.docTypes.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!d) return;
  UI.modal({ title: '修改材料名称', body: '<div class="field"><label>名称</label><input class="inp" id="dcName" value="' + esc(d.name) + '" autofocus></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="dc-edit-save" data-id="' + d.id + '">保存</button>' });
};
UI.act['dc-edit-save'] = function (el) { var d = S.settings.docTypes.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (d) { d.name = $('#dcName').value.trim() || d.name; save(); } UI.closeModal(); renderSetBody(); };
UI.act['doc-del'] = function (el) {
  var id = el.getAttribute('data-id');
  UI.confirm('删除材料', '删除后，这项材料不再计入档案齐全度。', '删除', function () { S.settings.docTypes = S.settings.docTypes.filter(function (x) { return x.id !== id; }); save(); renderSetBody(); }, true);
};
UI.act['doc-req'] = function (el) {
  var d = S.settings.docTypes.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!d) return;
  d.required = d.required === false; save(); renderSetBody();
};

/* ---------- 考勤 / 绩效 / 活动 / 培训规则 ---------- */
UI.act['set-workday'] = function (el) {
  var d = +el.getAttribute('data-v'), a = S.settings.attendance.workdays;
  var i = a.indexOf(d); if (i >= 0) a.splice(i, 1); else a.push(d);
  a.sort(); save(); renderSetBody();
};
UI.act['leave-type-add'] = function () {
  UI.modal({ title: '添加请假类型', body: '<div class="field"><label>名称</label><input class="inp" id="ltName" placeholder="如：婚假" autofocus></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="lt-save">保存</button>' });
};
UI.act['lt-save'] = function () {
  var n = $('#ltName').value.trim(); if (!n) { UI.toast('请填写名称'); return; }
  S.settings.attendance.leaveTypes.push({ id: uid('lt'), name: n }); save(); UI.closeModal(); renderSetBody(); UI.toast('已添加');
};
UI.act['leave-type-del'] = function (el) { var id = el.getAttribute('data-id'); S.settings.attendance.leaveTypes = S.settings.attendance.leaveTypes.filter(function (x) { return x.id !== id; }); save(); renderSetBody(); };
UI.act['act-type-add'] = function () {
  UI.modal({ title: '添加活动类型', body: '<div class="field"><label>名称</label><input class="inp" id="atName" placeholder="如：运动" autofocus></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="at-save">保存</button>' });
};
UI.act['at-save'] = function () { var n = $('#atName').value.trim(); if (!n) { UI.toast('请填写名称'); return; } S.settings.activity.types.push(n); save(); UI.closeModal(); renderSetBody(); };
UI.act['act-type-del'] = function (el) { var v = el.getAttribute('data-v'); S.settings.activity.types = S.settings.activity.types.filter(function (x) { return x !== v; }); save(); renderSetBody(); };
UI.act['train-type-add'] = function () {
  UI.modal({ title: '添加培训类型', body: '<div class="field"><label>名称</label><input class="inp" id="ttName" placeholder="如：领导力" autofocus></div>', foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="tt-save">保存</button>' });
};
UI.act['tt-save'] = function () { var n = $('#ttName').value.trim(); if (!n) { UI.toast('请填写名称'); return; } S.settings.training.types.push(n); save(); UI.closeModal(); renderSetBody(); };
UI.act['train-type-del'] = function (el) { var v = el.getAttribute('data-v'); S.settings.training.types = S.settings.training.types.filter(function (x) { return x !== v; }); save(); renderSetBody(); };

/* ---------- 数据 ---------- */
UI.act['data-export'] = function () {
  S.settings.lastBackup = Date.now(); save(true);
  downloadFile('HR工作台备份-' + todayStr() + '.json', JSON.stringify(S, null, 2), 'application/json');
  UI.toast('备份已导出');
};
UI.act['data-import'] = function () {
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function () {
    var f = inp.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var o = JSON.parse(rd.result);
        if (!o || !o.settings || !Array.isArray(o.employees)) throw new Error('格式不对');
        UI.confirm('导入备份', '导入会覆盖当前所有数据，确定继续？', '导入', function () {
          S = migrate(o); save(true); reindex(); UI.shell(); UI.go('office'); UI.toast('备份已导入');
        });
      } catch (e) { UI.toast('这个文件不是有效的 HR 工作台备份'); }
    };
    rd.readAsText(f, 'utf-8');
  };
  inp.click();
};
UI.act['data-hr-demo'] = function () {
  UI.confirm('重建人事演示数据', '会重新生成考勤、绩效、员工活动和培训的示例数据，并覆盖当前人事模块数据。确定继续？', '重建', function () {
    if (!ensureDemoHRData(true)) return;
    UI.shell(); UI.go('attendance'); UI.toast('人事演示数据已重建');
  }, true);
};
UI.act['data-demo'] = function () {
  UI.confirm('载入示例公司', '会覆盖当前数据，载入皮皮未来的示例数据。确定继续？', '载入示例', function () {
    S = demoState(); save(true); reindex(); UI.shell(); UI.go('office'); UI.toast('已载入示例公司');
  });
};
UI.act['data-clear'] = function () {
  UI.confirm('清空所有数据', '会删除所有员工、候选人、面试、文件和设置，无法恢复。确定继续？', '清空', function () {
    Store.del(STORE_KEY);
    // 部署示例站（dist/）不回到首次引导，重置为示例公司
    if (window.HR_DEMO_DIRECT) {
      S = demoState(); save(true); reindex(); UI.shell(); UI.go('office'); UI.toast('已重置为示例数据');
      return;
    }
    S = defaultState(); save(true); reindex();
    document.body.innerHTML = '<div id="app" class="app"></div><div id="drawerHost"></div><div id="modalHost"></div><div id="hcard" class="hcard"></div><div id="tip" class="tip"></div>';
    showWelcome();
  }, true);
};
