/* =========================================================
   启动 · 首次欢迎页（公司信息、形象、示例数据 / 空白公司）
   ========================================================= */
var Welcome = { g: 'F', mode: 'demo' };
function showWelcome() {
  var el = document.createElement('div');
  el.className = 'welcome'; el.id = 'welcome';
  el.innerHTML = '<div class="welcome-in">' +
    '<div style="display:flex;justify-content:center;margin-bottom:18px">' + brandMark().replace('class="brand-mark"', 'class="brand-mark" style="width:48px;height:48px"') + '</div>' +
    '<h1>HR 工作台</h1><p class="lead">把招聘、员工、档案和人事分析放进一个工作台</p>' +
    '<div class="w-avatars">' + ['F', 'M'].map(function (g) { return '<button class="' + (Welcome.g === g ? 'on' : '') + '" data-act="w-g" data-g="' + g + '"><span class="circle">' + ART.avatar({ id: 'welcome-' + g, name: 'HR', gender: g }, 80, { color: '#e5483b' }) + '</span>' + (g === 'F' ? '女 HR' : '男 HR') + '</button>'; }).join('') + '</div>' +
    '<div class="w-form"><div class="field"><label>怎么称呼你</label><input class="inp" id="wName" placeholder="如：李经理" value="' + (Welcome.g === 'F' ? '李经理' : '王经理') + '"></div><div class="field"><label>职位</label><input class="inp" id="wTitle" value="人事经理"></div>' +
    '<div class="field"><label>公司全称</label><input class="inp" id="wCompany" placeholder="如：皮皮未来科技有限公司" value="皮皮未来科技有限公司"></div><div class="field"><label>公司简称</label><input class="inp" id="wShort" placeholder="如：皮皮未来" value="皮皮未来"></div><div class="field"><label>城市</label><input class="inp" id="wCity" value="广州"></div></div>' +
    '<div class="w-mode"><button class="' + (Welcome.mode === 'demo' ? 'on' : '') + '" data-act="w-mode" data-m="demo"><b>先看看示例公司</b>皮皮未来 44 人、7 个部门、8 个在招职位，随时可以清空</button><button class="' + (Welcome.mode === 'blank' ? 'on' : '') + '" data-act="w-mode" data-m="blank"><b>直接录入我的公司</b>从空公司开始，自己添加部门和员工</button></div>' +
    '<button class="btn btn-dark w-go" data-act="w-go">开启工作台</button>' +
    '<div class="w-restore">已经用过、换了电脑？<label>' + ICON.up + '从备份恢复<input type="file" accept=".json" hidden data-chg="restore"></label>，选之前导出的备份文件</div>' +
    '<div class="muted" style="font-size:12px;margin-top:16px">' + ICON.lock + ' 所有数据只保存在这台电脑的浏览器里</div>' +
    '<div class="w-links"><button class="w-about" data-act="consult-open">微信咨询</button><span class="w-dot">·</span><button class="w-about" data-act="about-open">关于</button></div>' +
    '<div class="muted" style="font-size:11px;margin-top:12px">© 2026 皮皮未来 · 周一 · 保留所有权利</div></div>';
  document.body.appendChild(el);
}
UI.act['w-g'] = function (el) {
  Welcome.g = el.getAttribute('data-g');
  $$('.w-avatars button').forEach(function (b) { b.classList.toggle('on', b === el); });
  var n = $('#wName'); if (n && (n.value === '李经理' || n.value === '王经理')) n.value = Welcome.g === 'F' ? '李经理' : '王经理';
};
UI.act['w-mode'] = function (el) {
  Welcome.mode = el.getAttribute('data-m');
  $$('.w-mode button').forEach(function (b) { b.classList.toggle('on', b === el); });
};
UI.act['w-go'] = function () {
  var company = ($('#wCompany').value || '').trim() || '我的公司';
  var city = ($('#wCity').value || '').trim() || '广州';
  var name = ($('#wName').value || '').trim() || 'HR';
  var title = ($('#wTitle').value || '').trim() || '人事经理';
  var s;
  if (Welcome.mode === 'demo') {
    s = demoState();
  } else {
    s = defaultState();
    s.departments = [
      { id: 'tech', name: '技术研发部', color: '#2f7ff0', leadId: '' },
      { id: 'product', name: '产品设计部', color: '#7a5af5', leadId: '' },
      { id: 'marketing', name: '市场运营部', color: '#14b0a6', leadId: '' },
      { id: 'sales', name: '销售部', color: '#f2a71b', leadId: '' },
      { id: 'hr', name: '人力行政部', color: '#e5483b', leadId: '' },
      { id: 'finance', name: '财务部', color: '#3ea35c', leadId: '' }
    ];
    s.settings.onboarded = true;
  }
  var shortName = ($('#wShort').value || '').trim() || company.replace(/(股份有限公司|有限公司|集团|公司)$/g, '') || company;
  s.settings.company = company;
  s.settings.short = shortName;
  s.settings.city = city;
  s.settings.hr = { name: name, gender: Welcome.g, title: title };
  s.settings.onboarded = true;
  S = s; save(true); reindex();
  var w = $('#welcome'); if (w) w.remove();
  UI.shell();
  UI.go('office');
  UI.toast(Welcome.mode === 'demo' ? '已载入示例公司，点右上角可以开始录入自己的公司' : '工作台已开启，先到「设置 → 部门」添加部门');
};
UI.chg['restore'] = function (el) {
  var f = el.files[0]; if (!f) return;
  var rd = new FileReader();
  rd.onload = function () {
    try {
      var o = JSON.parse(rd.result);
      if (!o || !o.settings || !Array.isArray(o.employees)) throw new Error('bad');
      S = migrate(o); save(true); reindex();
      var w = $('#welcome'); if (w) w.remove();
      UI.shell(); UI.go('office'); UI.toast('备份已恢复');
    } catch (e) { UI.toast('这个文件不是有效的 HR 工作台备份'); }
  };
  rd.readAsText(f, 'utf-8');
};
