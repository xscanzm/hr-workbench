/* =========================================================
   AI 人事助理 · 多家接口、流式输出、HR 上下文、模板、隐私脱敏
   ========================================================= */
var AI_PRESETS = [
  { id: 'deepseek', name: 'DeepSeek', base: 'https://api.deepseek.com', model: 'deepseek-flash', site: 'platform.deepseek.com', hint: '需要更强的推理可以把模型改成 deepseek-v4-pro' },
  { id: 'qwen', name: '通义千问（阿里云百炼）', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', site: 'bailian.console.aliyun.com' },
  { id: 'kimi', name: 'Kimi（月之暗面）', base: 'https://api.moonshot.cn/v1', model: 'kimi-k3', site: 'platform.moonshot.cn' },
  { id: 'glm', name: '智谱 GLM', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', site: 'open.bigmodel.cn', hint: 'glm-4-flash 是免费模型，也可以换成控制台里的其他模型' },
  { id: 'doubao', name: '豆包（火山方舟）', base: 'https://ark.cn-beijing.volces.com/api/v3', model: '', site: 'console.volcengine.com/ark', hint: '模型名填方舟控制台里的模型 ID 或推理接入点 ID' },
  { id: 'silicon', name: '硅基流动', base: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3', site: 'cloud.siliconflow.cn' },
  { id: 'openai', name: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', site: 'platform.openai.com' },
  { id: 'claude', name: 'Claude（Anthropic）', base: 'https://api.anthropic.com/v1', model: 'claude-sonnet-5-5', site: 'console.anthropic.com' },
  { id: 'ollama', name: 'Ollama 本地模型', base: 'http://localhost:11434/v1', model: 'qwen2.5:7b', site: 'ollama.com', hint: '本地运行无需 Key；需设置环境变量 OLLAMA_ORIGINS=* 允许网页访问' },
  { id: 'custom', name: '自定义（OpenAI 兼容接口）', base: '', model: '', site: '', hint: '任何兼容 /chat/completions 的服务都可以，比如 one-api、new-api 中转' }
];
function presetOf(id) { for (var i = 0; i < AI_PRESETS.length; i++) if (AI_PRESETS[i].id === id) return AI_PRESETS[i]; return AI_PRESETS[AI_PRESETS.length - 1]; }
function tempOf(a) { var t = parseFloat(a.temp); return isNaN(t) ? 0.7 : Math.max(0, Math.min(1.5, t)); }
var AIC = {
  ready: function () { var a = S.settings.ai; return !!(a.base && a.model && (a.key || /localhost|127\.0\.0\.1/.test(a.base))); },
  isClaude: function () { var a = S.settings.ai; return a.provider === 'claude' || /anthropic\.com/.test(a.base); },
  label: function () { var a = S.settings.ai; return presetOf(a.provider).name.replace(/（.*）/, '') + ' · ' + (a.model || '未填模型'); },
  stream: function (messages, onDelta, signal, maxTokens) {
    var a = S.settings.ai, base = String(a.base || '').replace(/\/+$/, '');
    var req, url;
    if (AIC.isClaude()) {
      var sys = messages.filter(function (m) { return m.role === 'system'; }).map(function (m) { return m.content; }).join('\n\n');
      url = base + '/messages';
      req = { method: 'POST', signal: signal, headers: { 'content-type': 'application/json', 'x-api-key': a.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: a.model, max_tokens: maxTokens || 4096, system: sys, stream: true, temperature: Math.min(1, tempOf(a)), messages: messages.filter(function (m) { return m.role !== 'system'; }) }) };
    } else {
      url = base + '/chat/completions';
      var hd = { 'Content-Type': 'application/json' }; if (a.key) hd.Authorization = 'Bearer ' + a.key;
      var body = { model: a.model, messages: messages, stream: true, temperature: tempOf(a) };
      if (maxTokens) body.max_tokens = maxTokens;
      req = { method: 'POST', signal: signal, headers: hd, body: JSON.stringify(body) };
    }
    var full = '';
    function push(t) { if (t) { full += t; onDelta(t, full); } }
    return fetch(url, req).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw AIC.httpErr(res.status, t); });
      var ct = res.headers.get('content-type') || '';
      if (ct.indexOf('application/json') >= 0) {
        return res.json().then(function (j) {
          var t = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : (j.content && j.content[0] ? j.content[0].text : '');
          push(t || ''); return full;
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder('utf-8'), buf = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return full;
          buf += dec.decode(r.value, { stream: true });
          var lines = buf.split('\n'); buf = lines.pop();
          lines.forEach(function (ln) {
            ln = ln.trim(); if (ln.indexOf('data:') !== 0) return;
            var p = ln.slice(5).trim(); if (!p || p === '[DONE]') return;
            try {
              var j = JSON.parse(p);
              if (j.error) throw AIC.httpErr(400, JSON.stringify(j.error));
              if (j.type === 'content_block_delta' && j.delta) push(j.delta.text || '');
              else if (j.choices && j.choices[0] && j.choices[0].delta) push(j.choices[0].delta.content || '');
            } catch (e) { if (e && e.isAI) throw e; }
          });
          return pump();
        });
      }
      return pump();
    }).catch(function (e) {
      if (e && e.isAI) throw e;
      if (e && e.name === 'AbortError') { var ab = new Error('已停止生成'); ab.isAI = true; ab.abort = true; throw ab; }
      var ne = new Error('连不上 AI 服务。常见原因：① 网络不通或地址填错；② 这家服务不允许网页直接调用（跨域限制）。可以换 DeepSeek、Kimi 等试试，或运行开源包里的 ai-proxy.js 做本地中转。');
      ne.isAI = true; throw ne;
    });
  },
  httpErr: function (status, text) {
    var msg = '', detail = '';
    try { var j = JSON.parse(text); detail = (j.error && (j.error.message || j.error.msg)) || j.message || ''; } catch (e) { detail = String(text || '').slice(0, 160); }
    if (status === 401 || status === 403) msg = 'API Key 无效或没有权限，请到「设置 → AI 接口」检查。';
    else if (status === 404) msg = '接口地址或模型名不对，请检查 Base URL 和模型名称。';
    else if (status === 429) msg = '请求太频繁或额度用完了，稍后再试，或到服务商后台看看余额。';
    else if (status === 402) msg = '账户余额不足，请到服务商后台充值。';
    else if (status >= 500) msg = 'AI 服务暂时出错（' + status + '），稍后再试。';
    else msg = '请求被拒绝（' + status + '）。';
    var e = new Error(msg + (detail ? '\n服务返回：' + detail : '')); e.isAI = true; e.status = status; return e;
  }
};

/* ---------- 脱敏：员工 / 候选人姓名替换为占位符 ---------- */
var Mask = {
  build: function () {
    var fwd = [], back = {}, seq = 0;
    S.employees.forEach(function (e) { seq++; var code = '【员工' + pad2(seq) + '】'; fwd.push([e.name, code]); back['员' + pad2(seq)] = e.name; });
    var cs = 0;
    S.candidates.forEach(function (c) { cs++; var code = '【候选人' + pad2(cs) + '】'; fwd.push([c.name, code]); back['候' + pad2(cs)] = c.name; });
    fwd.sort(function (a, b) { return b[0].length - a[0].length; });
    return { fwd: fwd, back: back };
  },
  apply: function (t) {
    if (!S.settings.ai.mask || !t) return t;
    var m = Mask.build();
    m.fwd.forEach(function (p) { if (p[0]) t = t.split(p[0]).join(p[1]); });
    return t;
  },
  restore: function (t) {
    if (!t) return t;
    var b = Mask.build().back;
    return t.replace(/[【\[]((?:员工|候选人)\d{1,3})[】\]]/g, function (all, n) {
      var key = n.indexOf('员工') === 0 ? '员' + n.slice(2) : '候' + n.slice(3);
      return b[key] || all;
    });
  }
};

/* ---------- HR 上下文 ---------- */
function sysPrompt() {
  return '你是一名经验丰富、务实专业的中国 HR 人事助理，服务对象是 ' + S.settings.company + ' 的人事经理。你熟悉招聘、面试评估、员工关系、入转调离、档案管理、组织与人才盘点、劳动法常识和 HR 数据分析。\n' +
    '写作要求：\n1. 使用简体中文，具体、专业、能直接落地，避免空话套话；\n2. 用 Markdown 组织内容（标题、列表、必要时用表格），可以直接复制使用；\n3. 只依据提供的数据，不编造具体事实、人名、数字；信息不够时用「（可补充：……）」提示；\n4. 涉及员工评价时客观、克制，不贴标签，不传播隐私；\n5. 资料里「【员工07】」「【候选人12】」这样的占位符代表某位员工或候选人，请原样保留，不要改写。\n' +
    '当前 HR：' + S.settings.hr.name + '，' + S.settings.hr.title + '；公司：' + S.settings.company + '（' + S.settings.city + '，' + S.settings.industry + '）。';
}
function hrContext() {
  var hc = headcountStats(), h = '';
  h += '【公司概况】' + S.settings.company + '，' + S.settings.city + '，' + S.settings.industry + '，成立于 ' + S.settings.founded + '；在职 ' + hc.total + ' 人（男 ' + hc.male + '，女 ' + hc.female + '），试用期 ' + hc.probation + ' 人，平均司龄 ' + hc.avgTenure + ' 年；本月入职 ' + hc.joinedThisMonth + ' 人，本月离职 ' + hc.leftThisMonth + ' 人。\n';
  h += '【部门】' + deptHeadcount().map(function (x) { return x.d.name + ' ' + x.n + ' 人' + (x.lead ? '（负责人 ' + x.lead.name + '）' : ''); }).join('；') + '\n';
  h += '【在招职位】' + jobsWithStats().map(function (x) { return x.j.title + '（' + deptName(x.j.deptId) + '，需求 ' + x.j.headcount + ' 人，已入职 ' + x.st.hired + ' 人，' + x.j.urgency + '紧急）'; }).join('；') + '\n';
  var funnel = recruitFunnel();
  h += '【招聘漏斗】' + funnel.map(function (x) { return x.label + ' ' + x.value; }).join(' → ') + '；在流程候选人 ' + activeCandidates().length + ' 人，待筛选 ' + screeningList().length + ' 份。\n';
  var active = scoreScope().slice(0, 25);
  h += '【重点候选人】' + active.map(function (c) { var co = compositeOf(c), g = gradeOf(co.score); return c.name + '（' + candidateJobTitle(c) + '，' + STAGE[c.stage].t + (co.score !== null ? '，综合 ' + co.score + ' ' + g : '') + '）'; }).join('；') + '\n';
  h += '【员工概况】' + activeEmployees().slice(0, 40).map(function (e) { return e.name + '（' + deptName(e.deptId) + ' · ' + e.title + ' · ' + (e.empStatus === 'probation' ? '试用期' : '在职') + ' · ' + tenureText(e.hireDate) + '）'; }).join('；') + '\n';
  var rem = reminders();
  if (rem.length) h += '【待办提醒】' + rem.map(function (r) { return r.title; }).join('；') + '\n';
  h += '【档案】整体齐全度 ' + pct(overallMaterials().rate) + '，' + overallMaterials().people + ' 人存在材料缺失；文件柜共 ' + S.documents.length + ' 份文件。\n';
  return h;
}
function aiMessages(chat, ctxOn) {
  var msgs = [{ role: 'system', content: sysPrompt() + (ctxOn ? '\n\n【当前数据】\n' + hrContext() : '') }];
  var hist = (chat.msgs || []).filter(function (m) { return !m.streaming && !m.err; }).slice(-10);
  hist.forEach(function (m) { msgs.push({ role: m.role, content: m.role === 'user' ? Mask.apply(m.content) : m.content }); });
  return msgs;
}

/* ---------- 页面 ---------- */
var AIP = { chat: null, ctrl: null, busy: false, ctx: true, cat: 'rec' };
var AI_TPLS = [
  { cat: 'rec', color: '#2f7ff0', ico: '招', title: '写一份 JD', desc: '根据职位信息生成岗位职责、任职要求和面试考察点', prompt: '请根据当前在招职位，为「高级前端工程师」写一份完整的 JD，包括岗位职责、任职要求、加分项、团队介绍和面试考察点。语言简洁专业，适合发布在 Boss 直聘。' },
  { cat: 'rec', color: '#2f7ff0', ico: '筛', title: '简历筛选建议', desc: '按岗位要求梳理候选人匹配点和风险点', prompt: '请根据当前待筛选的候选人，按岗位分组给出筛选建议：优先面谁、暂缓谁、原因是什么，并列出每个岗位最需要重点考察的 2-3 个问题。' },
  { cat: 'rec', color: '#2f7ff0', ico: '面', title: '面试问题设计', desc: '按岗位和轮次设计结构化面试题与评分标准', prompt: '请为「Java 后端工程师」的复试设计一套结构化面试题，覆盖项目深度、技术基础、协作与稳定性，每道题给出考察点和评分参考（1-5 分）。' },
  { cat: 'rec', color: '#2f7ff0', ico: '报', title: '招聘周报', desc: '汇总本周招聘进展、卡点和下周计划', prompt: '请根据当前招聘数据写一份招聘周报，包括：本周关键进展、各职位漏斗、候选人卡点、需要业务配合的事项、下周计划。用表格呈现数据。' },
  { cat: 'staff', color: '#7a5af5', ico: '转', title: '转正沟通提纲', desc: '为试用期员工准备转正面谈提纲和评价问题', prompt: '请为一位即将转正的前端工程师准备转正沟通提纲：试用期目标回顾、做得好的地方、需要提升的地方、下一阶段目标、沟通话术示例。' },
  { cat: 'staff', color: '#7a5af5', ico: '谈', title: '离职面谈提纲', desc: '设计离职原因追问、交接和风险提示', prompt: '请设计一份离职面谈提纲，包括：开场、离职原因追问、对团队和公司的反馈、交接安排、风险提示和挽留话术。注意保护员工隐私，语气尊重。' },
  { cat: 'staff', color: '#7a5af5', ico: '档', title: '档案补齐计划', desc: '汇总缺失材料，生成按人按项补齐清单', prompt: '请根据员工档案材料缺失情况，生成一份补齐计划：按部门分组、列出每个人缺什么、建议的补齐方式和截止时间，用表格呈现。' },
  { cat: 'staff', color: '#7a5af5', ico: '规', title: '人事制度草稿', desc: '起草考勤、休假、试用期等制度条款', prompt: '请起草一份《试用期管理办法》，包括试用期期限、目标设定、考核方式、转正流程、延长试用期和解除劳动合同的合规注意事项。语言严谨，便于内部讨论。' },
  { cat: 'hr', color: '#14b0a6', ico: '勤', title: '考勤分析', desc: '分析本月出勤率、迟到早退和请假情况', prompt: '请根据当前考勤数据，写一份本月考勤分析：整体出勤率、迟到/早退/请假/缺勤分布、异常集中的部门和可能原因，并给出 3 条可执行的改进建议。用表格呈现数据。' },
  { cat: 'hr', color: '#7a5af5', ico: '绩', title: '绩效评语', desc: '根据目标完成和评价分数生成主管评语', prompt: '请根据当前绩效周期中一位员工的得分和等级，写一段主管评语：先肯定具体表现，再指出 1-2 个改进方向，最后给出下季度建议。语气客观、具体，不出现排名和分数。' },
  { cat: 'hr', color: '#e2569a', ico: '活', title: '活动策划', desc: '生成活动方案、流程、预算和通知文案', prompt: '请帮我策划一场员工活动，主题围绕团队凝聚和放松，预算 2 万元、参与人数 40 人左右。请给出活动形式、流程时间表、预算明细、物料清单、风险预案和一条发在群里的通知文案。' },
  { cat: 'hr', color: '#f2a71b', ico: '训', title: '培训计划', desc: '根据团队情况设计培训主题和课程安排', prompt: '请根据当前公司的人员结构和培训记录，设计下一季度的培训计划：主题、目标人群、课时、形式、讲师安排和效果评估方式。用表格呈现，并说明优先级。' },
  { cat: 'data', color: '#14b0a6', ico: '析', title: '人事月报', desc: '基于当月数据生成人事月报', prompt: '请根据当前数据写一份人事月报，包括：人员概况、入离职分析、招聘进展、档案与合规、风险与建议、下月计划。数据用表格呈现，结论要具体。' },
  { cat: 'data', color: '#14b0a6', ico: '漏', title: '招聘漏斗诊断', desc: '找出转化率最低的环节并给出改进建议', prompt: '请分析当前招聘漏斗，指出转化率最低的环节、可能的原因和 3 条可执行的改进建议。不要编造数据，只基于已有数据推断。' },
  { cat: 'data', color: '#14b0a6', ico: '本', title: '人力成本测算', desc: '按部门 / 职级测算人力成本与招聘预算', prompt: '请根据在职员工的部门、职级和薪资数据，做一份人力成本结构分析：按部门、职级汇总，指出成本集中点，并给出下季度招聘预算建议。' },
  { cat: 'data', color: '#14b0a6', ico: '盘', title: '人才盘点提纲', desc: '设计九宫格盘点维度和会议流程', prompt: '请设计一份人才盘点方案：盘点维度（业绩 / 潜力）、九宫格定义、会议流程、材料准备和盘点后的行动建议。结合公司当前的部门和职级结构。' }
];
var AI_CATS = [['rec', '招聘'], ['staff', '员工'], ['hr', '人事'], ['data', '分析']];
UI.register('ai', {
  render: function (main, opts) {
    if (opts && opts.chat) AIP.chat = opts.chat;
    else if (!AIP.busy) AIP.chat = null;
    if (AIP.chat && !chatById(AIP.chat)) AIP.chat = null;
    if (AIP.chat) renderAIThread(main); else renderAIHome(main);
  }
});
function chatById(id) { for (var i = 0; i < S.chats.length; i++) if (S.chats[i].id === id) return S.chats[i]; return null; }
function apiPill() {
  var ok = AIC.ready();
  return '<button class="api-pill' + (ok ? ' ok' : '') + '" data-act="go" data-page="settings" data-sec="ai" title="AI 接口设置"><i></i>' + (ok ? esc(AIC.label()) : '未配置 AI 接口 · 生成时可复制提示词') + '</button>';
}
function aiComposer(id, val) {
  return '<div class="composer"><textarea id="' + id + '" placeholder="问点什么，比如：帮我分析一下这个月的招聘漏斗，哪里卡住了？" data-key="ai-send">' + esc(val || '') + '</textarea><div class="composer-bar"><button class="ctx-chip' + (AIP.ctx ? ' on' : '') + '" data-act="ai-ctx">' + ICON.spark + '带上公司数据</button><span class="grow"></span>' + apiPill() + '<button class="send" data-act="ai-send" title="发送（Enter）">' + ICON.send + '</button></div></div>';
}
function renderAIHome(main) {
  main.innerHTML = '<div class="ai-page"><div class="ai-home"><div class="ai-wrap">' +
    '<div class="ai-hello">' + aiAvatar(54) + '<div><h1>你好，' + esc(S.settings.hr.name) + '</h1><p>' + esc(S.settings.company) + ' · ' + activeEmployees().length + ' 位员工 · ' + activeCandidates().length + ' 位候选人在流程中</p></div></div>' +
    aiComposer('aiInput') +
    '<div class="tpl-tabs">' + AI_CATS.map(function (c) { return '<button class="' + (AIP.cat === c[0] ? 'on' : '') + '" data-act="ai-cat" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
    '<div class="tpl-grid">' + AI_TPLS.filter(function (t) { return t.cat === AIP.cat; }).map(function (t) { return '<button class="tpl" data-act="ai-tpl" data-p="' + esc(t.prompt) + '"><div class="t"><i style="background:' + t.color + '1a;color:' + t.color + '">' + t.ico + '</i>' + t.title + '</div><div class="d">' + esc(t.desc) + '</div></button>'; }).join('') + '</div>' +
    '<div class="ai-note">' + ICON.lock + ' 数据只保存在本机；开启脱敏后，姓名会替换成占位符再发给 AI</div>' +
    '</div></div></div>';
  setTimeout(function () { var el = $('#aiInput'); if (el) el.focus(); }, 30);
}
function renderAIThread(main) {
  var chat = chatById(AIP.chat);
  if (!chat) { AIP.chat = null; renderAIHome(main); return; }
  main.innerHTML = '<div class="ai-page"><div class="thread-head"><button class="btn btn-ghost btn-sm" data-act="ai-back">' + ICON.back + '返回</button><div class="t">' + esc(chat.title) + '</div><button class="btn btn-ghost btn-sm" data-act="ai-del" data-id="' + chat.id + '">' + ICON.trash + '删除</button></div>' +
    '<div class="ai-thread" id="aiThread"><div class="ai-wrap" id="aiMsgs"></div></div>' +
    '<div class="ai-foot"><div class="ai-wrap">' + aiComposer('aiInput', '') + '</div></div></div>';
  renderMsgs();
  var th = $('#aiThread'); if (th) th.scrollTop = th.scrollHeight;
  setTimeout(function () { var el = $('#aiInput'); if (el) el.focus(); }, 30);
}
function renderMsgs() {
  var chat = chatById(AIP.chat), el = $('#aiMsgs'); if (!chat || !el) return;
  el.innerHTML = chat.msgs.map(function (m, i) {
    if (m.role === 'user') return '<div class="msg user"><div class="bubble">' + esc(m.content) + '</div></div>';
    return '<div class="msg bot">' + aiAvatar(30) + '<div class="body"><div class="who">AI 人事助理' + (m.streaming ? ' · 正在生成…' : '') + '</div>' + (m.err ? '<div class="msg-err">' + esc(m.err) + '</div>' : '<div class="md">' + mdHTML(m.content || '') + (m.streaming ? '<span class="cursor"></span>' : '') + '</div>') + '</div></div>';
  }).join('');
}
function aiAvatar(size) {
  return '<svg class="ava" viewBox="-24 -24 48 48" width="' + size + '" height="' + size + '" aria-hidden="true"><circle r="24" fill="#171717"/>' +
    '<circle cx="0" cy="-1" r="11" fill="#fff"/><path d="M-5 -10 L-3 -15 L0 -11 L3 -16 L5 -10 Z" fill="#fff"/>' +
    '<ellipse cx="-4" cy="-1" rx="2.6" ry="3.1" fill="#171717"/><ellipse cx="4" cy="-1" rx="2.6" ry="3.1" fill="#171717"/>' +
    '<path d="M-10 10 Q0 15 10 10 L11 15 Q0 20 -11 15 Z" fill="#2f7ff0"/></svg>';
}
function mdHTML(t) {
  if (!t) return '';
  var s = esc(t);
  s = s.replace(/```([\s\S]*?)```/g, function (all, code) { return '<pre style="background:var(--fill);border-radius:8px;padding:10px 12px;overflow:auto;font-size:12.5px"><code>' + code.replace(/^\n/, '') + '</code></pre>'; });
  s = s.replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>');
  s = s.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
  s = s.replace(/\n{2,}/g, '</p><p>');
  s = '<p>' + s + '</p>';
  s = s.replace(/<p><(h[123]|ul|pre)/g, '<$1').replace(/<\/(h[123]|ul|pre)><\/p>/g, '</$1>');
  return s;
}
function sendAI(text) {
  text = String(text || '').trim();
  if (!text) return;
  if (!AIC.ready()) { UI.toast('先到「设置 → AI 接口」配置模型和 Key'); UI.go('settings', { sec: 'ai' }); return; }
  if (AIP.busy) { UI.toast('正在生成，请稍候'); return; }
  var chat = AIP.chat ? chatById(AIP.chat) : null;
  if (!chat) {
    chat = { id: uid('chat'), title: text.slice(0, 24) + (text.length > 24 ? '…' : ''), msgs: [], createdAt: Date.now() };
    S.chats.unshift(chat); AIP.chat = chat.id;
  }
  chat.msgs.push({ role: 'user', content: text });
  var bot = { role: 'assistant', content: '', streaming: true };
  chat.msgs.push(bot);
  save(); UI.refreshSide();
  if (UI.page !== 'ai') UI.go('ai', { chat: chat.id }); else renderAIThread($('#main'));
  AIP.busy = true;
  AIP.ctrl = window.AbortController ? new AbortController() : null;
  var msgs = aiMessages(chat, AIP.ctx);
  var input = $('#aiInput'); if (input) input.value = '';
  AIC.stream(msgs, function (delta, full) {
    bot.content = Mask.restore(full);
    var el = $('#aiMsgs');
    if (el) { var last = el.querySelector('.msg.bot:last-child .md'); if (last) { last.innerHTML = mdHTML(bot.content) + '<span class="cursor"></span>'; } }
  }, AIP.ctrl ? AIP.ctrl.signal : undefined).then(function () {
    bot.streaming = false; AIP.busy = false; AIP.ctrl = null; save(); renderMsgs(); UI.refreshSide();
    var th = $('#aiThread'); if (th) th.scrollTop = th.scrollHeight;
  }).catch(function (e) {
    bot.streaming = false; AIP.busy = false; AIP.ctrl = null;
    if (e && e.abort) { if (!bot.content) bot.err = '已停止生成'; else bot.content += '\n\n（已停止）'; }
    else bot.err = (e && e.message) || '生成失败';
    save(); renderMsgs();
  });
}
UI.act['ai-send'] = function () { var el = $('#aiInput'); sendAI(el ? el.value : ''); };
UI.key['ai-send'] = function (el, e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendAI(el.value); } };
UI.act['ai-stop'] = function () { if (AIP.ctrl) AIP.ctrl.abort(); };
UI.act['ai-back'] = function () { if (AIP.busy && AIP.ctrl) AIP.ctrl.abort(); AIP.chat = null; UI.go('ai'); };
UI.act['ai-new'] = function () { AIP.chat = null; UI.go('ai'); };
UI.act['ai-cat'] = function (el) { AIP.cat = el.getAttribute('data-v'); UI.rerender(); };
UI.act['ai-tpl'] = function (el) { var p = el.getAttribute('data-p'); var input = $('#aiInput'); if (input) { input.value = p; input.focus(); } };
UI.act['ai-ctx'] = function (el) { AIP.ctx = !AIP.ctx; el.classList.toggle('on', AIP.ctx); };
UI.act['ai-del'] = function (el) {
  var id = el.getAttribute('data-id');
  UI.confirm('删除对话', '确定删除这条对话吗？', '删除', function () {
    S.chats = S.chats.filter(function (c) { return c.id !== id; }); AIP.chat = null; save(); UI.go('ai'); UI.refreshSide(); UI.toast('已删除');
  }, true);
};
UI.act['open-chat'] = function (el) { AIP.chat = el.getAttribute('data-id'); UI.closeDrawer(); UI.go('ai', { chat: AIP.chat }); };
