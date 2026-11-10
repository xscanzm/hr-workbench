#!/usr/bin/env node
/*
  生成 dist/：复制入口与资源，压缩 CSS、混淆 JS，交给 Cloudflare Workers 部署。
  用法：npm run build（或 node build.js）
*/
var fs = require('fs');
var path = require('path');

var root = __dirname;
var out = path.join(root, 'dist');
var BANNER = '/*! HR 工作台 · © 2026 皮皮未来 · 周一 · 保留所有权利 · 未经书面许可不得复制、分发或商用 */\n';
var AGENT_BANNER = '/*! AGENT HQ · © 2026 皮皮未来 · 周一 · 保留所有权利 · 未经书面许可不得复制、分发或商用 */\n';

try {
  require.resolve('esbuild');
  require.resolve('javascript-obfuscator');
} catch (e) {
  console.error('缺少构建依赖，请先运行：npm install');
  process.exit(1);
}

var esbuild = require('esbuild');
var JavaScriptObfuscator = require('javascript-obfuscator');

function filesIn(dir, ext) {
  return fs.readdirSync(dir).filter(function (f) {
    return f.slice(-ext.length) === ext && fs.statSync(path.join(dir, f)).isFile();
  }).map(function (f) { return path.join(dir, f); });
}
function minify(inputs, outdir, banner) {
  if (!inputs.length) return;
  var opts = {
    entryPoints: inputs,
    outdir: outdir,
    minify: true,
    legalComments: 'inline',
    allowOverwrite: true,
    logLevel: 'warning'
  };
  if (banner) opts.banner = { js: banner, css: banner };
  esbuild.buildSync(opts);
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// 入口与静态资源
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, 'LICENSE'));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });

// 主站 CSS：压缩
minify(filesIn(path.join(root, 'css'), '.css'), path.join(out, 'css'), BANNER);

// 主站 JS：混淆（保留顶层全局名，多个脚本按顺序共享全局作用域）
var jsDir = path.join(root, 'js');
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
filesIn(jsDir, '.js').forEach(function (file) {
  var code = fs.readFileSync(file, 'utf8');
  var result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false,
    seed: 20261109
  });
  fs.writeFileSync(path.join(out, 'js', path.basename(file)), BANNER + result.getObfuscatedCode());
});

// 智能员工大屏（agent/）：CSS/JS 压缩，写入版权声明
fs.cpSync(path.join(root, 'agent'), path.join(out, 'agent'), { recursive: true });
minify(filesIn(path.join(root, 'agent/js'), '.js'), path.join(out, 'agent/js'), AGENT_BANNER);
minify(filesIn(path.join(root, 'agent/css'), '.css'), path.join(out, 'agent/css'), AGENT_BANNER);

// 部署示例站：跳过首次引导，打开就是示例公司
var distIndex = path.join(out, 'index.html');
var marker = '<script src="js/art.js';
var html = fs.readFileSync(distIndex, 'utf8');
if (html.indexOf('HR_DEMO_DIRECT') < 0) {
  if (html.indexOf(marker) < 0) throw new Error('dist/index.html 结构变化：找不到注入点');
  html = html.replace(marker, '<script>window.HR_DEMO_DIRECT = true;</script>\n' + marker);
  fs.writeFileSync(distIndex, html);
}

console.log('dist/ 已生成：index.html（示例站直开）+ css/（压缩）+ js/（混淆）+ assets/ + agent/（压缩）');
