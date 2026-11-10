/* =========================================================
   关于 · 版本、功能、隐私说明
   ========================================================= */
var About = {
  open: function () {
    UI.modal({
      title: '关于 HR 工作台',
      wide: true,
      body: '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">' + brandMark().replace('class="brand-mark"', 'class="brand-mark" style="width:54px;height:54px"') +
        '<div><div style="font-size:18px;font-weight:800">HR 工作台 <span class="muted" style="font-size:12px;font-weight:400">v' + VERSION + '</span></div><div class="muted" style="font-size:12.5px">办公室 · 招聘 · 员工 · 文件柜 · 人事分析 · AI 助手</div></div></div>' +
        '<div class="info-grid" style="grid-template-columns:88px 1fr;font-size:13px"><div class="k">出品</div><div>皮皮未来 · 个人工作台系列</div><div class="k">更新维护</div><div>周一</div><div class="k">联系</div><div>微信 &amp; 小红书：xscanzm</div><div class="k">版权</div><div>© 2026 皮皮未来 · 周一 · 保留所有权利</div><div class="k">数据</div><div>只保存在本机浏览器 localStorage，不上传服务器</div><div class="k">技术</div><div>原生 HTML / CSS / JavaScript，无第三方依赖</div><div class="k">AI</div><div>支持 DeepSeek、通义千问、Kimi、智谱、豆包、OpenAI、Claude、Ollama 等 OpenAI 兼容接口</div></div>' +
        '<div class="about-consult"><img src="assets/wechat-qr.png" alt="周一微信二维码"><div><b>微信扫码，聊聊落地</b><div class="muted">周一 · 广东广州 · 皮皮未来</div><div class="muted">HR 工作台部署 / 定制、企业 AI 落地咨询</div></div><button class="btn btn-dark btn-sm" style="margin-left:auto" data-act="consult-open">查看大图</button></div>' +
        '<div style="margin-top:16px;padding:12px 14px;border-radius:12px;background:var(--fill);font-size:12.5px;line-height:1.8;color:var(--ink2)">' + ICON.lock + ' 隐私说明：员工姓名、电话、薪资、简历等信息只存在本机。使用 AI 时，可以在设置里开启姓名脱敏，姓名会替换成占位符后再发送；AI 生成的内容仍建议人工复核。</div>',
      foot: '<button class="btn btn-light" data-act="modal-close">关闭</button>'
    });
  }
};
