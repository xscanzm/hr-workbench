/* =========================================================
   文件柜 · 档案材料齐全度矩阵、文件列表、上传、预览、生成文书
   ========================================================= */
var Files = { cat: 'all', dept: 'all', missingOnly: false, q: '', sel: null };
var DOC_TEMPLATES = [
  { id: 'zz', name: '在职证明', desc: '用于签证、贷款、租房等场景' },
  { id: 'sr', name: '收入证明', desc: '用于贷款、信用卡等场景' },
  { id: 'lz', name: '离职证明', desc: '离职员工开具' },
  { id: 'sx', name: '实习证明', desc: '实习生开具' },
  { id: 'lq', name: '录用通知书', desc: 'Offer 附件' },
  { id: 'zz2', name: '转正通知书', desc: '试用期通过后发送' },
  { id: 'dg', name: '调岗通知书', desc: '调岗调薪时发送' },
  { id: 'jj', name: '离职交接单', desc: '离职交接清单' },
  { id: 'sc', name: '员工手册签收单', desc: '入职时签署' },
  { id: 'ht', name: '劳动合同模板', desc: '标准劳动合同模板' }
];
function saveGeneratedDoc(name, content) {
  S.documents.push({ id: uid('doc'), cat: 'generated', name: name, docType: 'generated', size: content.length * 2, at: todayStr(), expireAt: '', content: content });
  save(); UI.toast('已保存到文件柜');
}
function docCatName(id) { var c = docCategories().filter(function (x) { return x.id === id; })[0]; return c ? c.name : '其他'; }
UI.register('files', {
  render: function (main) {
    var counts = docCounts(), mat = overallMaterials();
    var used = Store.used(), avail = Math.max(0, 2048 - used / 1024);
    var h = '<div class="files-page"><div class="page-head"><div><h1 class="page-title">文件柜</h1><div class="page-desc">' + counts.all + ' 份文件 · 文件只存在这台电脑的浏览器里 · 已用 ' + docFileSize(used) + '，可用约 ' + round1(avail / 1024) + ' MB</div></div><div class="grow"></div><div class="actions">' +
      '<button class="btn btn-light" data-act="file-generate">' + ICON.doc + '开证明 / 生成文书</button><button class="btn btn-dark" data-act="file-upload">' + ICON.upload + '上传文件</button></div></div>';
    h += '<div class="files-layout"><div class="file-tree">' + fileTreeHTML() + '</div><div class="file-main" id="fileMain">' + fileMainHTML() + '</div></div></div>';
    main.innerHTML = h;
  }
});
function fileTreeHTML() {
  var c = docCounts(), mat = overallMaterials();
  var expiring = S.documents.filter(function (d) { var l = daysTo(d.expireAt); return d.expireAt && l !== null && l >= 0 && l <= 30; }).length;
  function item(id, name, n, icon) {
    return '<button class="tree-item' + (Files.cat === id ? ' on' : '') + '" data-act="file-cat" data-v="' + id + '"><span class="ti">' + (icon || ICON.doc) + '</span>' + esc(name) + (n !== undefined ? '<span class="tc">' + n + '</span>' : '') + '</button>';
  }
  var h = item('all', '全部文件', c.all, ICON.folder);
  docCategories().forEach(function (cat) { h += item(cat.id, cat.name, c[cat.id] || 0, cat.id === 'material' ? ICON.idcard : cat.id === 'contract' ? ICON.contract : cat.id === 'resume' ? ICON.resume : cat.id === 'generated' ? ICON.edit : ICON.doc); });
  h += '<div class="tree-sep"></div>' + item('expiring', '即将到期', expiring, ICON.timer);
  h += item('missing', '档案齐全度', mat.people + ' 人缺', ICON.check);
  h += item('templates', '文书模板', DOC_TEMPLATES.length, ICON.copy);
  return h;
}
function fileMainHTML() {
  if (Files.cat === 'all' || Files.cat === 'material' || Files.cat === 'missing') return docMatrixHTML();
  if (Files.cat === 'templates') return templateListHTML();
  return fileListHTML();
}
function docMatrixHTML() {
  var list = activeEmployees().filter(function (e) {
    if (Files.dept !== 'all' && e.deptId !== Files.dept) return false;
    if (Files.missingOnly || Files.cat === 'missing') return materialsOf(e).missing.length > 0;
    return true;
  }).sort(function (a, b) { return deptName(a.deptId).localeCompare(deptName(b.deptId), 'zh') || String(a.no).localeCompare(String(b.no), 'zh', { numeric: true }); });
  var mat = overallMaterials();
  var h = '<div class="file-toolbar"><select class="sel" data-chg="file-dept"><option value="all">全部部门</option>' + S.departments.map(function (d) { return '<option value="' + d.id + '"' + (Files.dept === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select>' +
    '<label class="chk"><input type="checkbox" data-chg="file-missing"' + (Files.missingOnly || Files.cat === 'missing' ? ' checked' : '') + '> 只看材料不齐的人</label>' +
    '<span class="grow"></span><span class="muted" style="font-size:12.5px">整体齐全度 <b style="color:var(--ink)">' + pct(mat.rate) + '</b></span>' +
    '<button class="btn btn-light btn-sm" data-act="file-export-missing">' + ICON.down + '导出缺失清单</button><button class="btn btn-ghost btn-sm" data-act="go" data-page="settings" data-sec="hr">改材料清单</button></div>' +
    '<div class="file-hint">' + ICON.check + '<span>点红色的「缺」可以直接给这个人上传这份材料；点绿色的勾可以预览。材料清单在「设置 → 人事规则」里改。</span></div>' +
    '<div class="file-scroll"><table class="doc-matrix"><thead><tr><th style="text-align:left;padding-left:8px">员工</th>' + S.settings.docTypes.map(function (d) { return '<th><span class="th-in">' + esc(d.name) + '</span></th>'; }).join('') + '<th>齐全度</th></tr></thead><tbody>';
  if (!list.length) h += '<tr><td colspan="' + (S.settings.docTypes.length + 2) + '"><div class="empty">没有符合条件的员工</div></td></tr>';
  list.forEach(function (e) {
    var m = materialsOf(e);
    h += '<tr><td class="emp-cell"><div class="nm" data-act="open-emp" data-eid="' + e.id + '" style="cursor:pointer">' + empAva(e, 26) + esc(e.name) + '<small>' + esc(deptName(e.deptId)) + '</small></div></td>' + S.settings.docTypes.map(function (d) {
      var ok = !!e.materials[d.id], doc = S.documents.filter(function (x) { return x.eid === e.id && x.docType === d.id; })[0];
      return '<td>' + (ok ? '<button class="doc-cell ok" data-act="file-preview" data-id="' + (doc ? doc.id : '') + '" data-eid="' + e.id + '" data-doc="' + d.id + '" title="预览">' + ICON.check + '</button>' : '<button class="doc-cell miss" data-act="file-upload-one" data-eid="' + e.id + '" data-doc="' + d.id + '" title="上传">缺</button>') + '</td>';
    }).join('') + '<td class="rate-cell' + (m.rate < 0.8 ? ' low' : '') + '">' + m.done + '/' + m.total + '</td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}
function fileListHTML() {
  var list = S.documents.filter(function (d) {
    if (Files.cat === 'expiring') { var l = daysTo(d.expireAt); return d.expireAt && l !== null && l >= 0 && l <= 30; }
    if (Files.cat !== 'all' && d.cat !== Files.cat) return false;
    if (Files.q && d.name.indexOf(Files.q) < 0) return false;
    return true;
  }).sort(function (a, b) { return (a.at || '') < (b.at || '') ? 1 : -1; });
  var h = '<div class="file-toolbar"><input class="inp" placeholder="搜索文件名" value="' + esc(Files.q) + '" data-inp="file-q"><span class="muted" style="font-size:12.5px">' + list.length + ' 份</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="file-upload">' + ICON.upload + '上传文件</button></div><div class="file-scroll">';
  if (!list.length) h += '<div class="empty">这个分类下还没有文件</div>';
  else {
    h += '<table class="file-table"><thead><tr><th>文件</th><th>分类</th><th>关联员工</th><th>大小</th><th>上传日期</th><th>到期日</th><th></th></tr></thead><tbody>';
    list.slice(0, 300).forEach(function (d) {
      var e = d.eid ? empById(d.eid) : null, c = d.cid ? candById(d.cid) : null;
      h += '<tr><td><div class="fn"><span class="fi">' + (d.cat === 'resume' ? ICON.resume : d.cat === 'contract' ? ICON.contract : ICON.doc) + '</span>' + esc(d.name) + '</div></td>' +
        '<td class="sub">' + esc(docCatName(d.cat)) + '</td><td>' + (e ? esc(e.name) : c ? esc(c.name) : '—') + '</td><td class="num muted">' + docFileSize(d.size) + '</td><td class="num muted">' + esc(d.at || '—') + '</td><td class="num muted">' + (d.expireAt ? '<span class="' + (daysTo(d.expireAt) <= 30 ? 'dn' : '') + '">' + esc(d.expireAt) + '</span>' : '—') + '</td>' +
        '<td class="r"><span class="file-ops"><button class="btn btn-xs btn-ghost" data-act="file-preview" data-id="' + d.id + '">预览</button><button class="btn btn-xs btn-ghost" data-act="file-download" data-id="' + d.id + '">下载</button><button class="btn btn-xs btn-ghost" data-act="file-del" data-id="' + d.id + '">删除</button></span></td></tr>';
    });
    h += '</tbody></table>';
  }
  return h + '</div>';
}
function templateListHTML() {
  return '<div class="file-toolbar"><span class="muted" style="font-size:12.5px">选择模板生成文书，生成后会自动保存到「生成的文书」</span><span class="grow"></span><button class="btn btn-light btn-sm" data-act="file-generate">' + ICON.doc + '开证明 / 生成文书</button></div><div class="file-scroll"><div class="job-grid" style="grid-template-columns:repeat(3,1fr)">' + DOC_TEMPLATES.map(function (t) {
    return '<div class="job-card" data-act="file-template" data-id="' + t.id + '" style="cursor:pointer"><div class="jt" style="font-size:14px">' + esc(t.name) + '</div><div class="jm" style="font-size:12px;color:var(--ink3);margin-top:4px">' + esc(t.desc) + '</div><div style="margin-top:12px"><span class="tag gray">模板</span></div></div>';
  }).join('') + '</div></div>';
}
UI.act['file-cat'] = function (el) {
  Files.cat = el.getAttribute('data-v'); Files.q = '';
  var tree = $('.file-tree'); if (tree) tree.innerHTML = fileTreeHTML();
  var main = $('#fileMain'); if (main) main.innerHTML = fileMainHTML();
};
UI.chg['file-dept'] = function (el) { Files.dept = el.value; var main = $('#fileMain'); if (main) main.innerHTML = fileMainHTML(); };
UI.chg['file-missing'] = function (el) { Files.missingOnly = el.checked; var main = $('#fileMain'); if (main) main.innerHTML = fileMainHTML(); };
UI.inp['file-q'] = function (el) { Files.q = el.value.trim(); var main = $('#fileMain'); if (main) main.innerHTML = fileMainHTML(); };
UI.act['file-upload-one'] = function (el) { openFileUpload('material', el.getAttribute('data-eid'), el.getAttribute('data-doc')); };
UI.act['file-upload'] = function () { openFileUpload(Files.cat === 'all' ? 'other' : Files.cat); };
UI.act['file-export-missing'] = function () {
  var rows = [['员工', '工号', '部门', '齐全度', '缺失材料']];
  activeEmployees().forEach(function (e) { var m = materialsOf(e); if (m.missing.length) rows.push([e.name, e.no, deptName(e.deptId), m.done + '/' + m.total, m.missing.map(function (x) { return x.name; }).join('、')]); });
  downloadFile('档案缺失清单-' + todayStr() + '.csv', toCSV(rows), 'text/csv;charset=utf-8');
};
UI.act['file-preview'] = function (el) {
  var id = el.getAttribute('data-id');
  if (id) { var doc = S.documents.filter(function (x) { return x.id === id; })[0]; if (doc) { openDocPreview(doc); return; } }
  var e = empById(el.getAttribute('data-eid')), docId = el.getAttribute('data-doc');
  if (e && docId) openDocPreview({ id: '', name: e.name + '-' + (DOC_NAMES[docId] || '材料'), cat: 'material', eid: e.id, docType: docId, size: 0, at: '' });
};
UI.act['file-download'] = function (el) {
  var id = el.getAttribute('data-id');
  var doc = S.documents.filter(function (x) { return x.id === id; })[0];
  if (!doc && UI.modalCtx && UI.modalCtx.previewDoc) doc = UI.modalCtx.previewDoc;
  if (!doc) return;
  downloadDoc(doc);
};
UI.act['open-doc'] = function (el) {
  var sp = $('#gsearchPop'); if (sp) sp.innerHTML = '';
  var doc = S.documents.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
  if (doc) openDocPreview(doc);
};
UI.act['file-del'] = function (el) {
  var doc = S.documents.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!doc) return;
  UI.confirm('删除文件', '确定删除「' + esc(doc.name) + '」吗？', '删除', function () {
    S.documents = S.documents.filter(function (x) { return x.id !== doc.id; });
    if (doc.cat === 'material' && doc.eid && doc.docType) {
      var e = empById(doc.eid);
      if (e && !S.documents.some(function (x) { return x.eid === e.id && x.docType === doc.docType; })) e.materials[doc.docType] = false;
    }
    save(); UI.rerender(); UI.refreshSide(); UI.toast('已删除');
  }, true);
};
UI.act['file-generate'] = function () { openGenerateDoc(); };
UI.act['file-template'] = function (el) { openGenerateDoc(el.getAttribute('data-id')); };

/* ---------- 预览 ---------- */
function openDocPreview(doc) {
  var content = docPreviewContent(doc);
  var e = doc.eid ? empById(doc.eid) : null;
  UI.modal({
    title: esc(doc.name), wide: true, noFocus: true,
    body: '<div class="doc-preview" style="background:#f7f7f5;border-radius:14px;padding:18px;max-height:66vh;overflow:auto">' +
      (doc.data && /^data:image\//.test(doc.data) ? '<img src="' + doc.data + '" style="max-width:100%;border-radius:8px;display:block;margin:0 auto">' :
        '<div style="background:#fff;border-radius:10px;box-shadow:0 0 0 1px var(--line);padding:28px 32px;max-width:720px;margin:0 auto;white-space:pre-wrap;line-height:1.9;font-size:13px;color:#2a2a29">' + esc(content) + '</div>') +
      '</div>' + (e ? '<div class="muted" style="font-size:12px;margin-top:8px">关联员工：' + esc(e.name + ' · ' + deptName(e.deptId)) + '</div>' : ''),
    foot: '<button class="btn btn-ghost" data-act="file-copy-content" data-id="' + doc.id + '" style="margin-right:auto">复制内容</button><button class="btn btn-light" data-act="modal-close">关闭</button><button class="btn btn-dark" data-act="file-download" data-id="' + doc.id + '">' + ICON.down + '下载</button>'
  });
  UI.modalCtx.previewText = content;
  UI.modalCtx.previewDoc = doc;
}
function docPreviewContent(doc) {
  if (doc.content) return doc.content;
  if (doc.data && /^data:text/.test(doc.data)) { try { return atob(doc.data.split(',')[1] || ''); } catch (e) { } }
  var e = doc.eid ? empById(doc.eid) : null, c = doc.cid ? candById(doc.cid) : null;
  var type = doc.docType;
  if (type === 'resume' && c) return '【简历预览】\n\n' + c.name + ' · ' + c.resume.degree + ' · ' + c.resume.school + ' · ' + c.resume.years + ' 年\n\n' + c.resume.summary + '\n\n技能：' + (c.resume.skills || []).join('、') + '\n\n工作经历：\n' + (c.resume.workList || []).map(function (w) { return w.company + ' · ' + w.title + '（' + (w.start || '') + ' – ' + (w.end || '至今') + '）\n' + w.desc; }).join('\n\n');
  if (type === 'policy') return '【' + doc.name.replace(/\.pdf$/, '') + '】\n\n' + S.settings.company + '\n\n本制度适用于公司全体员工，自发布之日起执行。具体条款以公司正式发布的文件为准。\n\n（示例文件，用于演示文件柜的预览效果。）';
  if (type === 'license') return '【' + doc.name.replace(/\.pdf$/, '') + '】\n\n名称：' + S.settings.company + '\n统一社会信用代码：91330100MA2*******\n住所：' + S.settings.city + '\n法定代表人：________\n成立日期：' + S.settings.founded + '\n\n（示例文件，用于演示文件柜的预览效果。）';
  if (e && type === 'contract') return '劳动合同\n\n甲方（用人单位）：' + S.settings.company + '\n乙方（劳动者）：' + e.name + '（工号 ' + e.no + '）\n\n一、合同期限\n本合同为固定期限劳动合同，自 ' + e.hireDate + ' 起至 ' + e.contractEnd + ' 止。\n\n二、工作内容\n乙方在' + deptName(e.deptId) + '担任' + e.title + '，职级 ' + e.level + '。\n\n三、劳动报酬\n乙方税前月薪为人民币 ' + (e.salary || 0) + ' 元，按公司薪酬制度发放。\n\n（示例合同，仅用于演示。）';
  if (e && type === 'idcard') return '中华人民共和国居民身份证\n\n姓名：' + e.name + '\n性别：' + (e.gender === 'F' ? '女' : '男') + '\n出生：' + (e.birthday || '—') + '\n住址：' + (e.address || S.settings.city) + '\n公民身份号码：3301**********' + pad2(10 + S.employees.indexOf(e) % 80) + '\n\n（示例证件，已做脱敏处理。）';
  if (e && type === 'degree') return '普通高等学校毕业证书\n\n学生 ' + e.name + ' 于 ' + (e.school || '—') + ' ' + (e.major || '') + ' 专业学习，修完教学计划规定的全部课程，成绩合格，准予毕业。\n\n学历：' + e.education + '\n\n（示例证书，仅用于演示。）';
  if (e && type === 'medical') return '入职体检报告\n\n姓名：' + e.name + '\n性别：' + (e.gender === 'F' ? '女' : '男') + '\n体检日期：' + (doc.at || e.hireDate) + '\n\n一般检查：未见明显异常\n内科：未见明显异常\n血常规：未见明显异常\n\n体检结论：合格\n\n（示例报告，仅用于演示。）';
  if (e && type === 'photo') return '一寸照片\n\n姓名：' + e.name + '\n（示例图片占位）';
  if (e && type === 'bank') return '银行卡信息\n\n姓名：' + e.name + '\n开户行：招商银行 ' + S.settings.city + '分行\n卡号：6225 **** **** ' + pad2(10 + S.employees.indexOf(e) % 80) + '\n\n（示例信息，已做脱敏处理。）';
  if (e && type === 'nda') return '保密协议\n\n甲方：' + S.settings.company + '\n乙方：' + e.name + '\n\n乙方承诺对在职期间接触的公司商业秘密、客户信息、技术资料等严格保密。\n\n（示例协议，仅用于演示。）';
  if (e && type === 'handbook') return '员工手册签收单\n\n本人 ' + e.name + '（工号 ' + e.no + '）已收到并阅读《员工手册》，理解并同意遵守公司各项规章制度。\n\n签字：________\n日期：' + (doc.at || e.hireDate) + '\n\n（示例签收单，仅用于演示。）';
  return doc.name + '\n\n这是一份示例文件，用于演示文件柜的预览效果。\n\n文件大小：' + docFileSize(doc.size) + '\n上传日期：' + (doc.at || '—');
}
function downloadDoc(doc) {
  if (doc.data) {
    var a = document.createElement('a'); a.href = doc.data; a.download = doc.name;
    document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 400); return;
  }
  var content = docPreviewContent(doc);
  downloadFile(doc.name.replace(/\.[^.]+$/, '') + '.txt', content, 'text/plain;charset=utf-8');
}
UI.act['file-copy-content'] = function () { if (UI.modalCtx && UI.modalCtx.previewText) copyText(UI.modalCtx.previewText); };

/* ---------- 上传 ---------- */
function openFileUpload(cat, eid, docId) {
  var cats = docCategories();
  var body = '<div class="row2"><div class="field"><label>分类</label><select class="sel" id="fuCat">' + cats.map(function (c) { return '<option value="' + c.id + '"' + ((cat || 'other') === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></div><div class="field"><label>关联员工</label><select class="sel" id="fuEmp"><option value="">不关联</option>' + S.employees.map(function (e) { return '<option value="' + e.id + '"' + (eid === e.id ? ' selected' : '') + '>' + esc(e.name + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select></div></div>' +
    (docId ? '<input type="hidden" id="fuDocType" value="' + docId + '">' : '') +
    '<label class="btn btn-light" style="cursor:pointer;width:100%">' + ICON.upload + '选择文件<input type="file" id="fuFile" hidden data-chg="fu-file"></label>' +
    '<div class="muted" id="fuName" style="font-size:12px;margin-top:8px">支持图片、PDF、Word；文件只保存在本机浏览器里</div>' +
    '<div class="field" style="margin-top:14px"><label>文件名称</label><input class="inp" id="fuTitle" placeholder="选填，默认使用文件名"></div>';
  UI.modal({ title: '上传文件', body: body, foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="fu-save" data-doc="' + (docId || '') + '">保存</button>' });
  UI.modalCtx.uploadFile = null;
}
UI.chg['fu-file'] = function (el) {
  var f = el.files[0]; if (!f) return;
  UI.modalCtx.uploadFile = f;
  $('#fuName').textContent = f.name + ' · ' + docFileSize(f.size);
  if (!$('#fuTitle').value) $('#fuTitle').value = f.name;
};
UI.act['fu-save'] = function (el) {
  var f = UI.modalCtx.uploadFile, cat = $('#fuCat').value, eid = $('#fuEmp').value, docId = el.getAttribute('data-doc') || '';
  var title = $('#fuTitle').value.trim() || (f ? f.name : '未命名文件');
  var doc = { id: uid('doc'), cat: cat, name: title, eid: eid || '', docType: docId || '', size: f ? f.size : 100000, at: todayStr(), expireAt: '' };
  function finish() {
    S.documents.push(doc);
    if (eid && docId) { var e = empById(eid); if (e) { e.materials[docId] = true; addEvent(e.id, '档案', '补齐材料：' + (DOC_NAMES[docId] || title), todayStr()); } }
    save(); UI.closeModal(); UI.rerender(); UI.refreshSide(); UI.toast('文件已保存');
    if (UI.drawerSid && eid === UI.drawerSid) openEmployee(eid, 'docs');
  }
  if (f && f.size <= 250000) { var rd = new FileReader(); rd.onload = function () { doc.data = rd.result; finish(); }; rd.readAsDataURL(f); }
  else finish();
};

/* ---------- 生成文书 ---------- */
function openGenerateDoc(tplId) {
  var tpl = DOC_TEMPLATES.filter(function (t) { return t.id === tplId; })[0] || DOC_TEMPLATES[0];
  var pool = activeEmployees();
  if (!pool.length) { UI.toast('还没有员工'); return; }
  UI.modal({
    title: '生成文书', wide: true,
    body: '<div class="row3"><div class="field"><label>模板</label><select class="sel" id="gdTpl">' + DOC_TEMPLATES.map(function (t) { return '<option value="' + t.id + '"' + (t.id === tpl.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></div><div class="field"><label>员工</label><select class="sel" id="gdEmp">' + pool.map(function (e) { return '<option value="' + e.id + '">' + esc(e.name + ' · ' + deptName(e.deptId)) + '</option>'; }).join('') + '</select></div><div class="field"><label>用途</label><input class="inp" id="gdUse" value="办理相关事务"></div></div>' +
      '<div class="field"><label>文书内容（可修改）</label><textarea class="ta" id="gdText" style="min-height:240px;line-height:1.9"></textarea></div>',
    foot: '<button class="btn btn-light" data-act="modal-close">取消</button><button class="btn btn-dark" data-act="gd-save">保存到文件柜</button>'
  });
  function refresh() {
    var t = $('#gdTpl').value, e = empById($('#gdEmp').value);
    var typeMap = { zz: '在职证明', zz2: '在职证明', sr: '收入证明', lz: '离职证明', sx: '实习证明' };
    var type = typeMap[t] || '在职证明';
    $('#gdText').value = e ? proofText(e, type, $('#gdUse').value || '办理相关事务', todayStr()) : '';
  }
  UI.modalCtx.gdRefresh = refresh;
  $('#gdTpl').onchange = refresh; $('#gdEmp').onchange = refresh;
  refresh();
}
UI.act['gd-save'] = function () {
  var tpl = DOC_TEMPLATES.filter(function (t) { return t.id === $('#gdTpl').value; })[0];
  var e = empById($('#gdEmp').value);
  var text = $('#gdText').value;
  S.documents.push({ id: uid('doc'), cat: 'generated', name: (e ? e.name + '-' : '') + tpl.name + '-' + todayStr() + '.txt', eid: e ? e.id : '', docType: 'generated', size: text.length * 2, at: todayStr(), expireAt: '', content: text });
  save(); UI.closeModal(); UI.toast('已保存到「生成的文书」'); UI.rerender(); UI.refreshSide();
};
