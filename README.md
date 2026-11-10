# HR 工作台

一个零依赖、数据只存在本机浏览器里的 HR 工作台。包含办公室平面图、招聘看板、简历筛选、笔试与面试、综合成绩、员工花名册、离职管理、文件柜、人事分析、AI 人事助理，以及 AGENT HQ 智能员工大屏。

## 打开方式

- 直接双击 `index.html` 即可使用（推荐 Chrome / Edge）。
- 或者在本目录起一个静态服务：

```bash
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

首次打开可以选择：

- **先看看示例公司**：载入「皮皮未来科技有限公司」的 44 位员工、7 个部门、8 个在招职位、46 份简历，以及近 3 个月考勤、两个绩效周期、8 场活动和 6 场培训。
- **直接录入我的公司**：从空公司开始，自己添加部门、员工和职位。

首页左侧「智能 → 智能员工」会打开 AGENT HQ 智能总部大屏（新标签页）；大屏右上角的「← 工作台」可以回到 HR 工作台。

侧栏底部的「扫码咨询」、首次欢迎页的「微信咨询」和「关于」页里都有微信二维码，部署后有兴趣的人可以直接扫码添加「周一」咨询。

## 功能模块

| 模块 | 说明 |
| --- | --- |
| 办公室 | 等距办公区、部门分区、Boss 办公室（从员工花名册选择，可像员工一样加备注）、今日面试、本月寿星、入职周年、招聘需求；支持日常 / 在岗 / 转正 / 合同 / 司龄五种视图 |
| 招聘看板 | 在招职位、招聘漏斗、渠道效果、部门招聘进度 |
| 简历筛选 | 多维筛选、匹配度明细、简历原件、通过 / 待定 / 不通过、批量操作、发送通知 |
| 笔试管理 | 安排笔试、录入成绩、发送笔试邀请 |
| 面试安排 | 今日 / 接下来的面试、填写评价、改期、面试官负载 |
| 综合成绩 | 简历 20% + 笔试 30% + 面试 50% 加权，A/B/C/D 等级、职位内排名、Offer、录用通知 |
| 员工花名册 | 搜索筛选、员工档案抽屉、转正 / 调岗调薪 / 离职 / 开证明、档案材料 |
| 考勤管理 | 今日考勤、月度统计、请假审批、迟到早退异常、出勤率趋势 |
| 绩效管理 | 周期、目标、自评、主管评价、校准、等级分布、办公室绩效视图 |
| 员工活动 | 活动日历、报名、签到、预算、反馈 |
| 培训管理 | 培训计划、报名、签到、完成、成绩与反馈 |
| 离职管理 | 离职申请 → 工作交接 → 薪资结算 → 离职证明 四步流程 |
| 文件柜 | 档案齐全度矩阵、缺失材料上传、文件预览 / 下载、文书生成 |
| 人事分析 | 人员 / 招聘 / 考勤 / 绩效 / 活动 / 培训六个分析页签 |
| AI 助手 | 支持 DeepSeek / 通义千问 / Kimi / 智谱 / 豆包 / OpenAI / Claude / Ollama 等 OpenAI 兼容接口，可带公司数据、姓名脱敏 |
| 智能员工 | AGENT HQ 智能总部大屏：3D 回字形总部沙盘、8 个部门、Agent / 真人督办、任务派发、项目流水与人员管理；标题自动同步工作台的公司名称 |
| 设置 | 公司信息、Boss、部门、招聘规则、人事规则、通知模板、AI 接口、数据备份 |

## 数据与隐私

- 所有数据保存在浏览器 `localStorage`（键名 `hr-workbench-v1`），不会上传服务器。
- 示例公司的人事数据为空或跨天时，工作台会自动补齐考勤、绩效、活动和培训；也可以在「设置 → 数据与备份 → 重建人事演示数据」手动重建。
- 换电脑或清理浏览器前，请到「设置 → 数据与备份」导出 JSON 备份。
- 文件柜里的文件只保存元数据；上传的小图片会以 Data URL 保存在本机浏览器，大文件只记录名称和大小。
- 使用 AI 时可以在「设置 → AI 接口」开启姓名脱敏，员工和候选人姓名会替换成占位符再发送。

## 目录结构

```
index.html            入口
css/
  base.css            设计变量、外壳、按钮、表单
  components.css      弹窗、抽屉、表格、图表、AI 样式
  pages.css           各业务页面样式
  office.css          办公室场景与右侧栏样式
  hr-modules.css      考勤 / 绩效 / 活动 / 培训样式
js/
  art.js              办公室 SVG 场景、头像
  core.js             工具、存储、数据模型、查询
  demo.js             示例公司（部门、员工、职位）
  demo-candidates.js  示例候选人、匹配度
  demo-flow.js        示例面试、Offer、通知、离职
  demo-hr.js          示例考勤、绩效、活动、培训
  hr-queries.js       考勤 / 绩效 / 活动 / 培训查询
  ui.js               外壳、路由、弹窗、抽屉、搜索
  charts.js           轻量 SVG 图表
  office.js           办公室页面
  board.js            招聘看板
  resume.js           简历筛选
  resume-forms.js     简历表单、匹配规则、发送通知
  written.js          笔试管理
  interview.js        面试安排
  score.js            综合成绩
  attendance.js       考勤管理
  performance.js      绩效管理
  activities.js       员工活动
  training.js         培训管理
  files.js            文件柜
  employees.js        员工花名册与档案抽屉
  employee-forms.js   员工表单、调岗、离职、开证明
  offboard.js         离职管理
  analytics.js        人事分析（六个页签）
  ai.js               AI 助手
  settings.js         设置
  welcome.js          首次引导
  about.js            关于
  consult.js          微信咨询二维码
  app.js              启动
assets/               微信咨询二维码与头像（部署时随 dist/ 一起发布）
agent/                智能员工 · AGENT HQ 大屏（原单文件拆分，只保留 HQ 主题）
  index.html          页面外壳 + HQ 模板
  css/shell.css       页面外壳样式
  css/hq.css          HQ 主题样式
  js/hq.js            HQ 3D 场景与交互
  js/app.js           挂载入口
build.js              生成 dist/（Cloudflare Workers 静态资源）
ai-proxy.js           可选的本地 AI 中转
```

## 构建

```bash
npm install
npm run build
```

会重新生成 `dist/`，只包含运行需要的 `index.html`、`css/`、`js/`、`assets/` 和 `agent/`。

构建时会用 esbuild 压缩 CSS、用 javascript-obfuscator 混淆主站 JS（保留跨文件使用的顶层全局名），并在每个压缩文件顶部写入版权声明。仓库里的 `js/`、`css/` 源码保持可读，只有 `dist/` 里的发布版本会被压缩混淆。

`dist/` 是给访客看的示例站：构建时会给 `dist/index.html` 注入 `HR_DEMO_DIRECT`，打开后跳过首次引导（不用填称呼、职位、公司），直接进入主页面并载入「皮皮未来」示例数据；根目录的 `index.html` 仍保留首次引导，方便本地正常使用。

## 部署

线上地址：<https://hr.hrskill.online>

```bash
npm run build
npm run deploy
```

`wrangler.jsonc` 已配置 Worker 名称 `hr-workbench`、`dist/` 静态资源目录和 `hr.hrskill.online` 自定义域名。部署前需要在本机设置 Cloudflare API Token（不要把令牌写进项目文件）：

```bash
export CLOUDFLARE_API_TOKEN=你的令牌
```

## 版权与许可

- 主站代码、界面、文案和示例数据：© 2026 皮皮未来 · 周一，保留所有权利，未经书面许可不得复制、分发或商用。
- `agent/` 目录（AGENT HQ 智能总部）：© 2026 皮皮未来 · 周一，与主站同一授权。
- 完整许可见 [LICENSE](LICENSE)。发布版 `dist/` 的 JS/CSS 顶部也带有版权声明。

## 说明

- 示例数据、姓名、公司、电话、邮箱均为虚拟数据，仅用于演示。
- 更新维护：周一 · 微信 & 小红书 · xscanzm；出品：皮皮未来。
