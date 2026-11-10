/* =========================================================
   启动 · 读取本地数据 → 渲染外壳 → 打开页面
   ========================================================= */
function bootApp() {
  S = load();
  if (!S || !S.settings.onboarded) {
    // 部署示例站（dist/）跳过首次引导，直接进入示例公司
    if (window.HR_DEMO_DIRECT) {
      S = demoState(); save(true); reindex(); UI.shell(); UI.go('office');
      return;
    }
    S = S || null;
    showWelcome();
    return;
  }
  ensureDemoHRData();
  reindex();
  UI.shell();
  var page = String(location.hash || '').replace(/^#\//, '') || 'office';
  if (!UI.pages[page]) page = 'office';
  UI.go(page);
}
window.addEventListener('hashchange', function () {
  var page = String(location.hash || '').replace(/^#\//, '') || 'office';
  if (UI.pages[page] && page !== UI.page) UI.go(page);
});
bootApp();
