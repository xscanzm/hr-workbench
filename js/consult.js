/* =========================================================
   咨询 · 微信二维码（周一 · 皮皮未来）
   ========================================================= */
var Consult = {
  open: function () {
    UI.modal({
      title: '微信咨询',
      body: '<div class="consult">' +
        '<div class="consult-who"><img class="consult-ava" src="assets/zhouyi-avatar.png" alt="周一">' +
        '<div><div class="consult-name">周一 <span class="consult-tag">皮皮未来</span></div><div class="consult-meta">广东广州 · HR 工作台出品</div></div></div>' +
        '<div class="consult-qr"><img src="assets/wechat-qr.png" alt="周一微信二维码"></div>' +
        '<div class="consult-scan">微信扫一扫，添加我为朋友</div>' +
        '<div class="consult-id">微信号 <b>xscanzm</b><button class="btn btn-light btn-sm" data-act="copy-txt" data-t="xscanzm">' + ICON.copy + '复制</button></div>' +
        '<div class="consult-note">HR 工作台部署 / 定制、企业 AI 落地咨询，欢迎扫码聊聊。</div>' +
        '</div>',
      foot: '<button class="btn btn-light" data-act="modal-close">关闭</button>'
    });
  }
};
UI.act['consult-open'] = function () { Consult.open(); };
