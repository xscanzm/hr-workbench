/* =========================================================
   ART · 高质感等距矢量办公室、拟人化职业白领形象与空间设施
   视觉：方案 A 高质感等距矢量扁平风，纯 SVG 零依赖
   ========================================================= */
var ART = (function () {
  var INK = '#1e2024';

  function r1(v) { return Math.round(v * 10) / 10; }
  function at(o) {
    var s = '';
    for (var k in o) {
      if (o[k] === undefined || o[k] === null || o[k] === false) continue;
      s += ' ' + k + '="' + o[k] + '"';
    }
    return s;
  }
  function T(name, o, inner) {
    return '<' + name + at(o) + (inner === undefined ? '/>' : '>' + inner + '</' + name + '>');
  }
  function rect(x, y, w, h, rx, fill, extra) {
    var o = { x: r1(x), y: r1(y), width: r1(w), height: r1(h) };
    if (rx) o.rx = rx;
    if (fill) o.fill = fill;
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('rect', o);
  }
  function circ(cx, cy, r, fill, extra) {
    var o = { cx: r1(cx), cy: r1(cy), r: r1(r) };
    if (fill) o.fill = fill;
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('circle', o);
  }
  function ell(cx, cy, rx, ry, fill, extra) {
    var o = { cx: r1(cx), cy: r1(cy), rx: r1(rx), ry: r1(ry) };
    if (fill) o.fill = fill;
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('ellipse', o);
  }
  function path(d, fill, extra) {
    var o = { d: d };
    if (fill) o.fill = fill;
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('path', o);
  }
  function poly(pts, fill, extra) {
    var o = { points: pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') };
    if (fill) o.fill = fill;
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('polygon', o);
  }
  function txt(x, y, s, extra) {
    var o = { x: r1(x), y: r1(y) };
    if (extra) for (var k in extra) o[k] = extra[k];
    return T('text', o, s);
  }
  function escx(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hash(str) {
    var h = 2166136261; str = String(str || '');
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var GROUPS = ['#2f7ff0', '#7a5af5', '#14b0a6', '#f2a71b', '#e5483b', '#3ea35c'];
  function groupColor(i) {
    return GROUPS[((i % GROUPS.length) + GROUPS.length) % GROUPS.length];
  }

  /* ---------- 色彩体系 ---------- */
  var SKINS = ['#fce3cf', '#f8d5bb', '#f0cca8', '#dfb692'];
  var SKIN_SHADOWS = ['#ebb799', '#e4a884', '#d59d74', '#c58b63'];
  var HAIR_COLORS = ['#232120', '#3b2b22', '#583f2e', '#2c2d30', '#6e4f3a', '#443831'];
  var OUTFIT_COLORS = [
    '#2f4858', '#33658a', '#2f7ff0', '#4a6fa5', '#588157',
    '#3a5a40', '#415a77', '#6d597a', '#b56576', '#e56b6f',
    '#355070', '#e07a5f', '#4f5d75', '#2d3142', '#264653'
  ];
  var DEPT_CARPETS = {
    tech: '#e8edf5',
    product: '#f5eee8',
    marketing: '#e4f3ee',
    sales: '#f8f2e3',
    finance: '#e9f1eb',
    hr: '#f9eceb'
  };

  /* ---------- SVG 滤镜、渐变与纹理预设 ---------- */
  function defs() {
    return '<defs>' +
      '<filter id="oShadow" x="-20%" y="-20%" width="150%" height="150%"><feGaussianBlur stdDeviation="8"/><feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0"/></filter>' +
      '<filter id="oShadowS" x="-25%" y="-25%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/><feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.07 0"/></filter>' +
      '<filter id="oShadowHard" x="-20%" y="-20%" width="150%" height="150%"><feGaussianBlur stdDeviation="1.5"/><feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.12 0"/></filter>' +
      '<filter id="oLight" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>' +
      '<filter id="oGlowCyan" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>' +
      // 地面与材质
      '<linearGradient id="oFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f2"/><stop offset="1" stop-color="#f8f8f6"/></linearGradient>' +
      '<linearGradient id="oWalkway" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#edeae3"/><stop offset="1" stop-color="#e7e3da"/></linearGradient>' +
      '<linearGradient id="oWoodFloor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6dcce"/><stop offset="1" stop-color="#ded2c1"/></linearGradient>' +
      '<linearGradient id="oTerrazzo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0eee9"/><stop offset="1" stop-color="#eae6df"/></linearGradient>' +
      // 桌面
      '<linearGradient id="oDeskTop" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f7f7f6"/></linearGradient>' +
      '<linearGradient id="oDeskFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e9e7"/><stop offset="1" stop-color="#dcddde"/></linearGradient>' +
      '<linearGradient id="oDeskWalnut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3728"/><stop offset="1" stop-color="#3c2b1e"/></linearGradient>' +
      '<linearGradient id="oDeskWalnutFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#322216"/><stop offset="1" stop-color="#24170d"/></linearGradient>' +
      // 人体工学椅
      '<linearGradient id="oChairMesh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3e44"/><stop offset="1" stop-color="#222428"/></linearGradient>' +
      '<linearGradient id="oChairCushion" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4d55"/><stop offset="1" stop-color="#2d3036"/></linearGradient>' +
      // 玻璃与屏幕
      '<linearGradient id="oGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f2fc" stop-opacity="0.85"/><stop offset="1" stop-color="#d4e8fa" stop-opacity="0.45"/></linearGradient>' +
      '<linearGradient id="oScreenCode" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e222b"/><stop offset="1" stop-color="#14171d"/></linearGradient>' +
      '<linearGradient id="oScreenWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf5"/><stop offset="1" stop-color="#d9e1ee"/></linearGradient>' +
      // 网格底纹
      '<pattern id="oTiles" width="96" height="96" patternUnits="userSpaceOnUse"><path d="M96 0H0V96" fill="none" stroke="#000" stroke-opacity=".025"/></pattern>' +
      '<pattern id="oCarpetDots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="0.75" fill="#000" fill-opacity="0.04"/></pattern>' +
      '</defs>';
  }

  /* =========================================================
     人物模型系统：拟人化现代白领（支持姓名哈希特征绑定）
     ========================================================= */

  function personTraits(p) {
    p = p || {};
    var seed = hash(p.id || p.name || 'person');
    var isFemale = p.gender === 'F';
    var skinIdx = seed % SKINS.length;
    var hairColor = HAIR_COLORS[(seed >> 3) % HAIR_COLORS.length];
    var hairStyle = (seed >> 5) % 6; // 0..5
    var outfitColor = OUTFIT_COLORS[(seed >> 8) % OUTFIT_COLORS.length];
    var outfitType = (seed >> 11) % 4; // 0:卫衣/衬衫, 1:针织/西装, 2:简约T恤, 3:工装开衫
    var hasGlasses = ((seed >> 14) % 4) === 0; // 25% 戴眼镜
    var glassesType = ((seed >> 16) % 2) === 0 ? 'round-gold' : 'dark-rect';
    var hasHeadphones = !hasGlasses && ((seed >> 18) % 5) === 0; // 20% 戴耳机
    var hasEarrings = isFemale && ((seed >> 20) % 3) !== 0; // 66% 女士戴耳钉
    var hasLanyard = ((seed >> 22) % 3) !== 0; // 66% 挂工牌
    return {
      seed: seed,
      isFemale: isFemale,
      skin: SKINS[skinIdx],
      skinShadow: SKIN_SHADOWS[skinIdx],
      hairColor: hairColor,
      hairStyle: hairStyle,
      outfitColor: outfitColor,
      outfitType: outfitType,
      hasGlasses: hasGlasses,
      glassesType: glassesType,
      hasHeadphones: hasHeadphones,
      hasEarrings: hasEarrings,
      hasLanyard: hasLanyard
    };
  }

  /* ---------- 正面头发组件 ---------- */
  function renderFrontHair(t, c) {
    var s = '';
    var col = t.hairColor;
    if (t.isFemale) {
      if (t.hairStyle === 0) {
        // 0: 短发波波头 (Bob)
        s += path('M-18 -10 C-22 6 -19 18 -13 22 L-10 22 C-14 16 -15 2 -13 -6 C-7 -14 7 -14 13 -6 C15 2 14 16 10 22 L13 22 C19 18 22 6 18 -10 C16 -28 -16 -28 -18 -10 Z', col);
        s += path('M-13 -8 C-6 -17 4 -17 12 -9 C6 -13 -4 -13 -13 -8 Z', col);
      } else if (t.hairStyle === 1) {
        // 1: 高马尾 (Ponytail)
        s += circ(15, -23, 8.5, col); // 马尾发团
        s += path('M12 -21 C18 -15 20 -4 17 8 C15 14 12 18 10 22 C13 16 15 8 13 -4 C11 -12 7 -17 4 -19 Z', col);
        s += circ(11, -19, 3.2, c); // 发圈
        s += path('M-17 -10 C-18 -26 18 -26 17 -10 C12 -17 3 -19 -5 -16 C-11 -14 -15 -10 -17 -10 Z', col);
        s += path('M-16 -5 C-17 5 -15 14 -13 18 L-11 17 C-13 12 -14 4 -13 -5 Z', col);
      } else if (t.hairStyle === 2) {
        // 2: 齐肩披发 (Medium Straight)
        s += path('M-18 -8 C-21 8 -20 28 -14 36 L-10 35 C-15 26 -16 6 -13 -6 C-7 -15 7 -15 13 -6 C16 6 15 26 10 35 L14 36 C20 28 21 8 18 -8 C17 -27 -17 -27 -18 -8 Z', col);
        s += path('M-14 -6 C-5 -16 5 -16 13 -7 C5 -13 -5 -13 -14 -6 Z', col);
      } else if (t.hairStyle === 3) {
        // 3: 职场高丸子头 (Top Bun)
        s += circ(0, -27, 9.5, col);
        s += rect(-6, -20, 12, 3, 1.5, c); // 发簪/发带
        s += path('M-17 -8 C-18 -26 18 -26 17 -8 C13 -16 4 -18 -4 -16 C-10 -14 -15 -10 -17 -8 Z', col);
        s += path('M-16 -4 C-17 6 -15 15 -13 18 L-11 17 C-13 12 -14 4 -13 -4 Z', col);
        s += path('M16 -4 C17 6 15 15 13 18 L11 17 C13 12 14 4 13 -4 Z', col);
      } else if (t.hairStyle === 4) {
        // 4: 优雅法式大波浪卷发 (Long Wavy)
        s += path('M-18 -8 C-23 6 -24 22 -18 30 C-14 36 -10 38 -7 38 C-12 34 -15 22 -13 12 C-11 3 -12 -5 -14 -8 Z', col);
        s += path('M18 -8 C23 6 24 22 18 30 C14 36 10 38 7 38 C12 34 15 22 13 12 C11 3 12 -5 14 -8 Z', col);
        s += path('M-17 -10 C-18 -27 18 -27 17 -10 C12 -18 4 -19 -4 -17 C-10 -15 -15 -11 -17 -10 Z', col);
        s += path('M-13 -6 C-5 -15 6 -15 13 -7 C5 -12 -5 -12 -13 -6 Z', col);
      } else {
        // 5: 干练超短发 (Pixie)
        s += path('M-18 -8 C-19 -28 19 -28 18 -8 C15 -4 14 6 10 12 L8 10 C11 4 12 -3 11 -8 C5 -13 -3 -15 -11 -10 C-15 -6 -16 2 -14 10 L-16 11 C-19 6 -18 -3 -18 -8 Z', col);
        s += path('M-14 -10 L-9 -18 L-3 -11 L2 -19 L7 -11 L12 -17 L14 -9 Z', col);
      }
    } else {
      // 男士发型
      if (t.hairStyle === 0) {
        // 0: 商务侧分短发 (Side Part)
        s += path('M-18 -4 C-19 -25 12 -30 18 -12 C18 -2 17 6 14 10 L12 9 C14 5 15 0 14 -7 C10 -18 -8 -17 -14 -6 C-16 -1 -16 4 -14 9 L-16 10 C-18 6 -18 1 -18 -4 Z', col);
        s += path('M-15 -10 C-7 -22 8 -20 16 -12 C8 -16 -4 -16 -15 -10 Z', col);
      } else if (t.hairStyle === 1) {
        // 1: 纹理短碎发 (Textured Crop)
        s += path('M-18 -4 C-19 -26 19 -26 18 -4 C16 4 15 9 12 11 L10 10 C12 6 13 2 13 -4 C10 -12 4 -14 -3 -12 C-9 -10 -13 -6 -14 2 L-16 1 C-18 -2 -18 -4 -18 -4 Z', col);
        s += path('M-14 -12 L-10 -20 L-6 -14 L-1 -22 L4 -14 L9 -20 L13 -13 Z', col);
      } else if (t.hairStyle === 2) {
        // 2: 蓬松微卷发 (Curly)
        s += circ(-10, -20, 6, col) + circ(-2, -23, 7, col) + circ(7, -21, 6.5, col) + circ(13, -15, 5, col) + circ(-13, -14, 5, col);
        s += path('M-17 -6 C-18 -22 18 -22 17 -6 C12 -12 2 -14 -4 -11 C-9 -9 -14 -5 -17 -6 Z', col);
      } else if (t.hairStyle === 3) {
        // 3: 大背头油头 (Slicked Back)
        s += path('M-17 -6 C-18 -28 18 -28 17 -6 C14 -1 14 6 11 9 L9 8 C11 4 12 0 12 -6 C9 -16 -9 -16 -12 -6 C-12 0 -11 4 -9 8 L-11 9 C-14 6 -14 -1 -17 -6 Z', col);
        s += path('M-8 -18 C-3 -23 3 -23 8 -18 C4 -20 -4 -20 -8 -18 Z', col);
      } else if (t.hairStyle === 4) {
        // 4: 清爽寸头 (Clean Crew Cut)
        s += path('M-17 -4 C-18 -22 18 -22 17 -4 C15 3 14 8 11 10 L10 9 C12 5 13 1 13 -4 C9 -10 -9 -10 -13 -4 C-13 1 -12 5 -10 9 L-11 10 C-14 8 -15 3 -17 -4 Z', col);
        s += path('M-13 -8 C-8 -15 8 -15 13 -8 C8 -11 -8 -11 -13 -8 Z', col, { opacity: '0.45' });
      } else {
        // 5: 中分刘海 (Curtain Bangs)
        s += path('M-18 -5 C-19 -25 19 -25 18 -5 C16 4 15 9 12 11 L10 10 C13 4 13 -2 12 -7 C8 -14 2 -14 0 -8 C-2 -14 -8 -14 -12 -7 C-13 -2 -13 4 -10 10 L-12 11 C-15 9 -16 4 -18 -5 Z', col);
      }
    }
    return s;
  }

  /* ---------- 头像渲染 (avatar) ---------- */
  function avatar(p, size, opts) {
    opts = opts || {};
    var t = personTraits(p);
    var color = opts.color || t.outfitColor;
    var s = '';

    // 1. 底衬圆形
    var bg = opts.bg === false ? '' : circ(0, 8, 46, opts.bg || '#f4f4f2') + circ(0, 8, 45.5, 'none', { stroke: '#e4e4e2', 'stroke-width': 1 });

    // 2. 长发后层 (如果头发披肩)
    if (t.isFemale && (t.hairStyle === 2 || t.hairStyle === 4)) {
      s += path('M-18 6 C-24 18 -24 38 -15 46 C-10 49 -4 50 0 50 C4 50 10 49 15 46 C24 38 24 18 18 6 Z', t.hairColor);
    }

    // 3. 躯干与服装
    var body = '';
    // 肩膀与身体底座
    body += path('M-34 50 C-35 32 -22 22 0 22 C22 22 35 32 34 50 Z', t.outfitColor);

    // 服装领口与分层细节
    if (t.outfitType === 0) {
      // 连帽卫衣 (Hoodie)
      body += path('M-16 22 C-14 36 14 36 16 22 L11 22 C8 32 -8 32 -11 22 Z', '#1e2229');
      // 卫衣抽绳
      body += path('M-6 32 L-6 44', 'none', { stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
      body += path('M6 32 L6 44', 'none', { stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    } else if (t.outfitType === 1) {
      // 商务西装 / 衬衫领带
      body += path('M-12 22 L0 36 L12 22 Z', '#ffffff');
      body += path('M-3 30 L3 30 L4 48 L0 51 L-4 48 Z', color); // 细领带/丝巾
      body += path('M-15 22 L-3 38 L-15 48 Z', '#1c1f24') + path('M15 22 L3 38 L15 48 Z', '#1c1f24'); // 西装驳领
    } else if (t.outfitType === 2) {
      // 圆领针织衫 (Crewneck)
      body += path('M-14 22 Q0 30 14 22 L15 25 Q0 33 -15 25 Z', '#ffffff');
    } else {
      // 优雅 V 领 / 飘带开衫
      body += path('M-13 22 L0 34 L13 22 Z', t.skin);
      body += path('M-15 22 L0 37 L15 22 L12 21 L0 32 L-12 21 Z', '#ffffff');
    }

    // 工牌挂绳 (Lanyard)
    if (t.hasLanyard) {
      body += path('M-13 22 L-3 48 L0 48 L-9 22 Z', color);
      body += path('M13 22 L3 48 L0 48 L9 22 Z', color);
      body += rect(-4.5, 45, 9, 11, 1.5, '#ffffff', { stroke: '#cfd2d6', 'stroke-width': 0.8 });
      body += rect(-3.5, 47, 7, 2.5, 0.5, color);
    }
    s += body;

    // 4. 颈部与下巴阴影
    s += rect(-6.5, 12, 13, 14, 2, t.skin);
    s += path('M-8 12 Q0 18 8 12 L8 15 Q0 21 -8 15 Z', t.skinShadow);

    // 5. 脸部轮廓
    s += path('M-16 -16 C-17 -26 17 -26 16 -16 C16 4 15 14 0 17.5 C-15 14 -16 4 -16 -16 Z', t.skin);

    // 6. 耳朵与耳钉
    s += ell(-16.8, -2, 2.8, 4.8, t.skin);
    s += ell(16.8, -2, 2.8, 4.8, t.skin);
    if (t.hasEarrings) {
      s += circ(-17, 2, 1.4, '#f59e0b') + circ(17, 2, 1.4, '#f59e0b');
    }

    // 7. 五官表情
    var face = '';
    // 眉毛
    face += path('M-12 -9.5 Q-7 -12.5 -2 -9.5', 'none', { stroke: t.hairColor, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    face += path('M2 -9.5 Q7 -12.5 12 -9.5', 'none', { stroke: t.hairColor, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    // 双眼 (眼白 + 瞳孔 + 高光)
    face += ell(-7, -2.5, 4.2, 4.6, '#ffffff');
    face += circ(-6.2, -2.2, 2.7, '#1f2937');
    face += circ(-5.3, -3.2, 1.1, '#ffffff');

    face += ell(7, -2.5, 4.2, 4.6, '#ffffff');
    face += circ(7.8, -2.2, 2.7, '#1f2937');
    face += circ(8.7, -3.2, 1.1, '#ffffff');

    if (t.isFemale) {
      // 睫毛微翘
      face += path('M-11 -3 Q-7 -7 -3 -3', 'none', { stroke: '#1f2937', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
      face += path('M3 -3 Q7 -7 11 -3', 'none', { stroke: '#1f2937', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
    }
    // 腮红
    face += ell(-11, 4, 3.8, 2, '#ff8a80', { opacity: '0.45' });
    face += ell(11, 4, 3.8, 2, '#ff8a80', { opacity: '0.45' });
    // 鼻影点
    face += path('M-1 2.2 Q0 3.8 1 2.2', 'none', { stroke: t.skinShadow, 'stroke-width': 1.3, 'stroke-linecap': 'round' });
    // 亲和微笑
    face += path('M-4.5 7.2 Q0 11.8 4.5 7.2', 'none', { stroke: '#be123c', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    s += face;

    // 8. 正面头发
    s += renderFrontHair(t, color);

    // 9. 眼镜或耳机配饰
    if (t.hasGlasses) {
      if (t.glassesType === 'round-gold') {
        s += circ(-7, -2.5, 6.2, 'none', { stroke: '#d97706', 'stroke-width': 1.3 });
        s += circ(7, -2.5, 6.2, 'none', { stroke: '#d97706', 'stroke-width': 1.3 });
        s += path('M-0.8 -3.5 Q0 -5 0.8 -3.5', 'none', { stroke: '#d97706', 'stroke-width': 1.3 });
        s += path('M-13.2 -2.5 L-17 -1', 'none', { stroke: '#d97706', 'stroke-width': 1.3 });
        s += path('M13.2 -2.5 L17 -1', 'none', { stroke: '#d97706', 'stroke-width': 1.3 });
      } else {
        s += rect(-13, -8, 12, 10, 2.5, 'none', { stroke: '#1f2937', 'stroke-width': 1.4 });
        s += rect(1, -8, 12, 10, 2.5, 'none', { stroke: '#1f2937', 'stroke-width': 1.4 });
        s += path('M-1 -3 L1 -3', 'none', { stroke: '#1f2937', 'stroke-width': 1.4 });
      }
    } else if (t.hasHeadphones) {
      s += path('M-18 -4 C-19 -28 19 -28 18 -4', 'none', { stroke: '#374151', 'stroke-width': 3.4, 'stroke-linecap': 'round' });
      s += rect(-21, -8, 4.5, 12, 2.2, '#111827');
      s += rect(16.5, -8, 4.5, 12, 2.2, '#111827');
    }

    return '<svg class="ava" viewBox="-46 -38 92 92" width="' + size + '" height="' + size + '" aria-hidden="true">' + bg + '<g transform="translate(0,4)">' + s + '</g></svg>';
  }

  /* ---------- 工位坐姿模型 (figure - 背面坐姿 + 悬停回头) ---------- */
  function figure(p, color) {
    var t = personTraits(p);
    color = color || t.outfitColor;
    var s = '';

    // 1. 身体躯干 (背对屏幕视角)
    s += path('M-24 44 C-25 24 -15 12 0 12 C15 12 25 24 24 44 Z', t.outfitColor, { 'class': 'body' });
    // 服装背部细节线 (领口线、缝线)
    if (t.outfitType === 0) {
      // 卫衣兜帽背折
      s += path('M-12 14 C-10 24 10 24 12 14 Z', '#1e2229');
    } else {
      // 衬衫/西装背中缝
      s += path('M0 16 L0 44', 'none', { stroke: '#000000', 'stroke-width': 1, 'stroke-opacity': '.15' });
    }

    // 2. 双臂自然前伸打字 (搭在桌面上)
    s += path('M-22 28 C-30 36 -32 46 -26 53', 'none', { stroke: t.outfitColor, 'stroke-width': 7.5, 'stroke-linecap': 'round' });
    s += path('M22 28 C30 36 32 46 26 53', 'none', { stroke: t.outfitColor, 'stroke-width': 7.5, 'stroke-linecap': 'round' });
    // 双手 (手腕与手掌贴近键盘鼠标)
    s += circ(-26, 53, 4, t.skin) + circ(26, 53, 4, t.skin);

    // 3. 头部外壳
    s += '<g class="head">';

    // A. 背面头发状态 (常态)
    var backHair = '<g class="back-hair">';
    // 后颈
    backHair += rect(-7, 8, 14, 8, 2, t.skin);
    // 后脑勺基础圆弧
    backHair += circ(0, 0, 16.5, t.skin);
    // 后发丝
    backHair += path('M-17 -2 C-18 -22 18 -22 17 -2 C17 12 -17 12 -17 -2 Z', t.hairColor);
    if (t.isFemale) {
      if (t.hairStyle === 1) {
        // 马尾向后垂挂
        backHair += circ(0, -18, 5, color); // 发带
        backHair += path('M-5 -16 C-8 6 -6 20 0 28 C6 20 8 6 5 -16 Z', t.hairColor);
      } else if (t.hairStyle === 3) {
        // 顶丸子
        backHair += circ(0, -22, 8, t.hairColor);
      } else if (t.hairStyle === 2 || t.hairStyle === 4) {
        // 披肩长发
        backHair += path('M-17 4 C-20 20 -18 36 -12 42 L12 42 C18 36 20 20 17 4 Z', t.hairColor);
      }
    } else {
      // 男士后脑发脚渐变线
      backHair += path('M-9 12 L9 12 L6 16 L-6 16 Z', t.hairColor);
    }
    backHair += '</g>';
    s += backHair;

    // B. 回头面孔状态 (悬停时显现 .face)
    var face = '<g class="face">';
    face += path('M-16 -16 C-17 -26 17 -26 16 -16 C16 4 15 14 0 17.5 C-15 14 -16 4 -16 -16 Z', t.skin);
    // 回头笑眼 (两弯月牙笑眼)
    face += path('M-10 -3 Q-6.5 -7.5 -3 -3', 'none', { stroke: '#1f2937', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    face += path('M3 -3 Q6.5 -7.5 10 -3', 'none', { stroke: '#1f2937', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    face += ell(-9, 3, 3.2, 1.8, '#ff8a80', { opacity: '0.6' });
    face += ell(9, 3, 3.2, 1.8, '#ff8a80', { opacity: '0.6' });
    face += path('M-4 6 Q0 9.8 4 6', 'none', { stroke: '#be123c', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    // 正面刘海顶层
    face += renderFrontHair(t, color);
    if (t.hasGlasses) {
      face += circ(-6.5, -3, 5.2, 'none', { stroke: '#d97706', 'stroke-width': 1.2 });
      face += circ(6.5, -3, 5.2, 'none', { stroke: '#d97706', 'stroke-width': 1.2 });
      face += path('M-1.3 -3.5 L1.3 -3.5', 'none', { stroke: '#d97706', 'stroke-width': 1.2 });
    }
    face += '</g>';
    s += face;

    s += '</g>'; // end head
    return s;
  }

  /* ---------- Boss 形象模型 (高管正装站姿/坐姿) ---------- */
  function bossFigure(b) {
    b = b || {};
    var isFemale = b.gender === 'F';
    var skin = SKINS[0];
    var skinShadow = SKIN_SHADOWS[0];
    var hairColor = '#242324';
    var s = '';

    // 双臂与手表
    s += path('M-42 38 C-50 54 -52 74 -48 88', 'none', { stroke: '#1c1f24', 'stroke-width': 12, 'stroke-linecap': 'round' });
    s += path('M42 38 C50 54 52 74 48 88', 'none', { stroke: '#1c1f24', 'stroke-width': 12, 'stroke-linecap': 'round' });
    s += circ(-48, 89, 5.8, skin) + circ(48, 89, 5.8, skin);
    // 金表
    s += rect(-51, 82, 6, 3, 1, '#f59e0b');

    // 高级定制西装
    s += path('M-44 92 C-46 50 -30 24 0 24 C30 24 46 50 44 92 Z', '#1c1f24');
    if (isFemale) {
      s += path('M-13 24 L0 42 L13 24 Z', '#ffffff');
      s += circ(0, 36, 2.6, '#f59e0b'); // 珍珠挂坠
      s += path('M-18 24 L-4 46 L-18 60 Z', '#2c3138') + path('M18 24 L4 46 L18 60 Z', '#2c3138');
    } else {
      s += path('M-12 24 L0 42 L12 24 Z', '#ffffff');
      s += path('M-4 32 L4 32 L5.5 62 L0 69 L-5.5 62 Z', '#be123c'); // 丝质红领带
      s += path('M-15 24 L-3 46 L-15 58 Z', '#2c3138') + path('M15 24 L3 46 L15 58 Z', '#2c3138');
      // 口袋方巾
      s += rect(-32, 48, 14, 11, 1.5, '#ffffff', { transform: 'rotate(-8 -25 54)' });
    }

    // 头部
    var head = '';
    head += rect(-7, 14, 14, 14, 2, skin);
    head += path('M-9 14 Q0 21 9 14 L9 17 Q0 24 -9 17 Z', skinShadow);
    head += path('M-18 -16 C-19 -28 19 -28 18 -16 C18 6 16 16 0 19 C-16 16 -18 6 -18 -16 Z', skin);

    // 耳朵
    head += ell(-18.5, -2, 3, 5, skin) + ell(18.5, -2, 3, 5, skin);
    if (isFemale) head += circ(-18.5, 3, 1.6, '#f59e0b') + circ(18.5, 3, 1.6, '#f59e0b');

    // 五官 (干练果敢神态)
    head += path('M-13 -9.5 Q-7 -13 -2 -10', 'none', { stroke: hairColor, 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    head += path('M2 -10 Q7 -13 13 -9.5', 'none', { stroke: hairColor, 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    head += ell(-7.5, -2.5, 4.4, 4.8, '#ffffff') + circ(-6.6, -2.2, 2.8, '#1e2024') + circ(-5.8, -3.2, 1.2, '#ffffff');
    head += ell(7.5, -2.5, 4.4, 4.8, '#ffffff') + circ(8.4, -2.2, 2.8, '#1e2024') + circ(9.2, -3.2, 1.2, '#ffffff');
    head += path('M-1 2.5 Q0 4.2 1 2.5', 'none', { stroke: skinShadow, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
    head += path('M-4.5 7.5 Q0 11.5 4.5 7.5', 'none', { stroke: '#be123c', 'stroke-width': 2, 'stroke-linecap': 'round' });

    // 发型
    if (isFemale) {
      head += circ(0, -28, 10, hairColor);
      head += path('M-19 -8 C-20 -28 20 -28 19 -8 C14 -16 4 -18 -4 -16 C-11 -14 -16 -10 -19 -8 Z', hairColor);
    } else {
      // 成功人士背头
      head += path('M-19 -8 C-20 -30 20 -30 19 -8 C14 -2 14 5 11 8 L9 7 C11 3 12 -1 12 -7 C9 -18 -9 -18 -12 -7 C-12 -1 -11 3 -9 7 L-11 8 C-14 5 -14 -2 -19 -8 Z', hairColor);
    }

    s += '<g class="boss-head">' + head + '</g>';
    return s;
  }

  /* =========================================================
     家具与工位细节组件（Ergonomic Furniture & Desktop Gears）
     ========================================================= */

  /* ---------- 现代办公桌 ---------- */
  function desk(x, y, w, d, deptId) {
    var W = w || 92, D = d || 44, F = 10, G = 16, s = '';
    // 桌底柔和地毯阴影
    s += rect(x + 4, y + D + F - 2, W - 8, G - 2, 3, '#000000', { 'fill-opacity': '.05', filter: 'url(#oShadowS)' });
    // 桌腿 (细哑光金属柱)
    s += rect(x + 5, y + D + F - 3, 3.5, G, 1.5, '#c5c7cb') + rect(x + W - 8.5, y + D + F - 3, 3.5, G, 1.5, '#c5c7cb');
    // 桌面侧厚沿与倒角
    s += rect(x + 0.5, y + D - 2, W - 1, F + 2, 2, 'url(#oDeskFace)');
    s += rect(x + 4, y + D + 1, W - 8, F - 4, 1, '#d8d9dc');
    // 桌面主平面 (现代暖白防刮台面)
    s += rect(x, y, W, D, 3.5, 'url(#oDeskTop)', { stroke: '#e1e3e6', 'stroke-width': 0.8 });
    // 走线孔 (Grommet)
    s += circ(x + W - 14, y + 8, 3.5, '#d1d5db', { stroke: '#9ca3af', 'stroke-width': 0.8 });

    // 部门专属工位桌面陈列
    deptId = deptId || 'tech';
    if (deptId === 'tech') {
      // 💻 研发：双显示屏 (主宽屏 + 副竖屏，带微光代码行)
      // 主屏 (正面稍偏左)
      s += rect(x + W / 2 - 24, y + 4, 30, 20, 2, 'url(#oScreenCode)', { stroke: '#2e3440', 'stroke-width': 0.8 });
      // 屏幕上闪烁的代码流
      s += path('M' + (x + W / 2 - 21) + ' ' + (y + 8) + 'h12M' + (x + W / 2 - 21) + ' ' + (y + 11) + 'h16M' + (x + W / 2 - 17) + ' ' + (y + 14) + 'h10M' + (x + W / 2 - 21) + ' ' + (y + 17) + 'h8', 'none', { stroke: '#38bdf8', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: '0.85' });
      // 副竖屏 (右侧)
      s += rect(x + W / 2 + 9, y + 2, 14, 23, 1.5, 'url(#oScreenCode)', { stroke: '#2e3440', 'stroke-width': 0.8 });
      s += path('M' + (x + W / 2 + 11) + ' ' + (y + 6) + 'h10M' + (x + W / 2 + 11) + ' ' + (y + 9) + 'h8M' + (x + W / 2 + 11) + ' ' + (y + 12) + 'h10M' + (x + W / 2 + 11) + ' ' + (y + 15) + 'h7M' + (x + W / 2 + 11) + ' ' + (y + 18) + 'h9', 'none', { stroke: '#4ade80', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: '0.8' });
      // 机械键盘 (75% 配色键帽)
      s += rect(x + W / 2 - 16, y + 28, 22, 9, 1.5, '#334155');
      s += rect(x + W / 2 - 15, y + 29, 4, 3, 0.5, '#38bdf8') + rect(x + W / 2 + 1, y + 29, 4, 3, 0.5, '#f43f5e');
      // 鼠标与大鼠标垫
      s += rect(x + W / 2 - 20, y + 26, 38, 14, 2, '#1e293b', { opacity: '0.2' });
      s += ell(x + W / 2 + 11, y + 33, 2.5, 4, '#475569');
      // 程序员保温杯
      s += circ(x + 12, y + 22, 4.2, '#0f172a', { stroke: '#334155', 'stroke-width': 0.8 }) + circ(x + 12, y + 22, 2.2, '#0284c7');
    } else if (deptId === 'product') {
      // 🎨 产品设计：超薄视网膜屏 + 数位板 + 多彩便利贴
      // 显示屏 (中置简洁铝合金支架)
      s += rect(x + W / 2 - 18, y + 4, 36, 21, 2.5, '#f8fafc', { stroke: '#cbd5e1', 'stroke-width': 1 });
      s += rect(x + W / 2 - 16, y + 6, 32, 17, 1.5, '#3b82f6', { opacity: '0.15' });
      s += rect(x + W / 2 - 2, y + 25, 4, 5, 1, '#94a3b8');
      // 数位板 (Wacom tablet)
      s += rect(x + 8, y + 20, 16, 12, 1.5, '#1e293b');
      s += rect(x + 10, y + 22, 12, 8, 1, '#334155');
      // 压感笔
      s += path('M' + (x + 26) + ' ' + (y + 20) + ' L' + (x + 28) + ' ' + (y + 32), 'none', { stroke: '#0f172a', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
      // 亮黄 & 桃粉便利贴叠放
      s += rect(x + W - 22, y + 16, 11, 11, 1, '#fde047', { transform: 'rotate(-5 ' + (x + W - 16) + ' ' + (y + 21) + ')' });
      s += rect(x + W - 20, y + 18, 11, 11, 1, '#f472b6', { transform: 'rotate(8 ' + (x + W - 15) + ' ' + (y + 23) + ')' });
    } else if (deptId === 'sales') {
      // 🎯 销售：单屏 + 业绩报表 + 电话耳机支架
      s += rect(x + W / 2 - 17, y + 4, 34, 21, 2.5, '#f8fafc', { stroke: '#cbd5e1', 'stroke-width': 1 });
      // 报表柱状折线
      s += path('M' + (x + W / 2 - 12) + ' ' + (y + 20) + 'l4 -6 l4 2 l5 -8 l6 4 l5 -7', 'none', { stroke: '#f59e0b', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
      // 电话耳麦
      s += circ(x + 12, y + 16, 5, 'none', { stroke: '#334155', 'stroke-width': 1.6 });
      s += path('M' + (x + 12) + ' ' + (y + 21) + 'l-2 4', 'none', { stroke: '#334155', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
      // 目标冲刺台历
      s += rect(x + W - 20, y + 14, 12, 10, 1.5, '#ef4444', { stroke: '#b91c1c', 'stroke-width': 0.6 });
      s += txt(x + W - 14, y + 21, 'GOAL', { 'font-size': '4.5', fill: '#ffffff', 'font-weight': '800', 'text-anchor': 'middle' });
    } else if (deptId === 'marketing') {
      // 📈 市场：视频时间轴屏 + 小型摄影三脚架 + 冷饮杯带吸管
      s += rect(x + W / 2 - 18, y + 4, 36, 21, 2.5, '#1e293b', { stroke: '#475569', 'stroke-width': 0.8 });
      s += path('M' + (x + W / 2 - 14) + ' ' + (y + 18) + 'h28', 'none', { stroke: '#a855f7', 'stroke-width': 2 });
      // 桌面迷你三脚架
      s += path('M' + (x + 12) + ' ' + (y + 14) + 'l-4 10 M' + (x + 12) + ' ' + (y + 14) + 'l4 10 M' + (x + 12) + ' ' + (y + 14) + 'v10', 'none', { stroke: '#334155', 'stroke-width': 1 });
      s += rect(x + 10, y + 10, 5, 4, 1, '#0f172a');
      // 带吸管冷饮杯
      s += circ(x + W - 14, y + 20, 3.8, '#fbcfe8', { stroke: '#f472b6', 'stroke-width': 0.8 }) + circ(x + W - 14, y + 20, 1.8, '#db2777');
      s += path('M' + (x + W - 14) + ' ' + (y + 20) + 'l-2 -5', 'none', { stroke: '#0284c7', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
    } else if (deptId === 'finance') {
      // 💰 财务：报表网格屏 + 算盘/十键计算器 + 档案盒
      s += rect(x + W / 2 - 17, y + 4, 34, 21, 2.5, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
      // 财务 Excel 绿色表头
      s += rect(x + W / 2 - 15, y + 6, 30, 4, 0.5, '#16a34a');
      // 10 键桌面计算器
      s += rect(x + 10, y + 18, 12, 15, 2, '#e2e8f0', { stroke: '#94a3b8', 'stroke-width': 0.8 });
      s += rect(x + 12, y + 20, 8, 3, 0.5, '#64748b'); // 液晶屏
      // 蓝色凭证盒
      s += rect(x + W - 22, y + 12, 14, 18, 2, '#0284c7', { stroke: '#0369a1', 'stroke-width': 0.8 });
      s += rect(x + W - 20, y + 14, 10, 4, 0.5, '#ffffff');
    } else {
      // 💼 人事行政：候选人画片 + 档案收纳槽 + 多肉小绿植
      s += rect(x + W / 2 - 17, y + 4, 34, 21, 2.5, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
      s += circ(x + W / 2 - 10, y + 13, 3, '#ec4899');
      s += path('M' + (x + W / 2 - 4) + ' ' + (y + 11) + 'h12M' + (x + W / 2 - 4) + ' ' + (y + 15) + 'h8', 'none', { stroke: '#94a3b8', 'stroke-width': 1.2 });
      // 档案文件夹槽
      s += rect(x + 8, y + 14, 10, 15, 1.5, '#fde68a', { stroke: '#d97706', 'stroke-width': 0.8 });
      // 桌面小多肉
      s += circ(x + W - 14, y + 18, 3.8, '#fed7aa', { stroke: '#ea580c', 'stroke-width': 0.8 }) + circ(x + W - 14, y + 18, 2.4, '#10b981');
    }

    return s;
  }

  /* ---------- 人体工学网布椅 ---------- */
  function chair(cx, cy) {
    var s = '';
    // 5 轮星形脚架投影
    s += ell(cx, cy + 50, 16, 6, '#000000', { 'fill-opacity': '.1' });
    // 五星脚架与金属轮
    s += path('M' + cx + ' ' + (cy + 48) + 'l-14 3 M' + cx + ' ' + (cy + 48) + 'l14 3 M' + cx + ' ' + (cy + 48) + 'l-7 5 M' + cx + ' ' + (cy + 48) + 'l7 5 M' + cx + ' ' + (cy + 48) + 'v-8', 'none', { stroke: '#94a3b8', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    // 气压升降柱
    s += rect(cx - 2, cy + 38, 4, 10, 1, '#475569');
    // 人体工学椅座垫 (透气鞍形曲面)
    s += rect(cx - 22, cy + 24, 44, 16, 5, 'url(#oChairCushion)', { stroke: '#1e2024', 'stroke-width': 0.8 });
    // 两侧扶手 (T 型铝合金加PU软面)
    s += rect(cx - 25, cy + 18, 4.5, 14, 2, '#0f172a') + rect(cx + 20.5, cy + 18, 4.5, 14, 2, '#0f172a');
    // 弧形透气网布靠背
    s += rect(cx - 20, cy + 6, 40, 20, 6, 'url(#oChairMesh)', { stroke: '#1e2024', 'stroke-width': 0.8 });
    s += rect(cx - 15, cy + 9, 30, 2.5, 1, '#64748b', { opacity: '.6' }); // 腰托支撑弧线
    // 可调头枕
    s += rect(cx - 11, cy - 2, 22, 7, 3.5, '#1e2024');
    return s;
  }

  /* ---------- 阴影层 ---------- */
  function deskShadow(x, y, w) {
    var W = w || 92, D = 44;
    return poly([[x + W - 2, y + 4], [x + W - 2, y + D], [x + 2, y + D], [x - 28, y + D + 42], [x + W - 34, y + D + 42], [x + W - 20, y + 26]], '#000000', { 'fill-opacity': '.07', filter: 'url(#oShadow)' });
  }
  function seatShadow(cx, cy) {
    return poly([[cx + 22, cy + 30], [cx - 22, cy + 30], [cx - 44, cy + 64], [cx - 8, cy + 64]], '#000000', { 'fill-opacity': '.06', filter: 'url(#oShadowS)' }) +
      ell(cx - 6, cy + 22, 20, 8, '#000000', { 'fill-opacity': '.05' });
  }

  /* ---------- 丰富绿植库 (龟背竹、琴叶榕、工位多肉) ---------- */
  function plant(cx, cy, r, type) {
    r = r || 18;
    type = type || 'monstera';
    var s = '';
    // 花盆底阴影
    s += ell(cx - 6, cy + r * 0.45, r * 1.1, r * 0.48, '#000000', { 'fill-opacity': '.1', filter: 'url(#oShadowS)' });
    // 陶瓷花盆 (现代高光陶瓷底座)
    s += rect(cx - r * 0.5, cy - r * 0.2, r, r * 0.7, r * 0.2, '#f8fafc', { stroke: '#cbd5e1', 'stroke-width': 1.2 });
    s += ell(cx, cy - r * 0.2, r * 0.5, r * 0.22, '#475569');

    if (type === 'fig') {
      // 琴叶榕 (大片提琴状阔叶)
      s += ell(cx - r * 0.5, cy - r * 0.6, r * 0.6, r * 0.35, '#15803d', { transform: 'rotate(-35 ' + (cx - r * 0.5) + ' ' + (cy - r * 0.6) + ')' });
      s += ell(cx + r * 0.55, cy - r * 0.5, r * 0.65, r * 0.38, '#166534', { transform: 'rotate(25 ' + (cx + r * 0.55) + ' ' + (cy - r * 0.5) + ')' });
      s += ell(cx - r * 0.2, cy - r * 1.1, r * 0.7, r * 0.4, '#22c55e', { transform: 'rotate(-10 ' + (cx - r * 0.2) + ' ' + (cy - r * 1.1) + ')' });
      s += ell(cx + r * 0.25, cy - r * 1.0, r * 0.65, r * 0.38, '#16a34a', { transform: 'rotate(30 ' + (cx + r * 0.25) + ' ' + (cy - r * 1.0) + ')' });
    } else {
      // 龟背竹 / 散尾葵
      s += ell(cx - r * 0.45, cy - r * 0.35, r * 0.6, r * 0.32, '#15803d', { transform: 'rotate(-40 ' + (cx - r * 0.45) + ' ' + (cy - r * 0.35) + ')' });
      s += ell(cx + r * 0.45, cy - r * 0.3, r * 0.6, r * 0.3, '#16a34a', { transform: 'rotate(30 ' + (cx + r * 0.45) + ' ' + (cy - r * 0.3) + ')' });
      s += ell(cx, cy - r * 0.7, r * 0.65, r * 0.32, '#22c55e', { transform: 'rotate(85 ' + cx + ' ' + (cy - r * 0.7) + ')' });
      s += ell(cx - r * 0.15, cy - r * 0.9, r * 0.55, r * 0.28, '#4ade80', { transform: 'rotate(60 ' + (cx - r * 0.15) + ' ' + (cy - r * 0.9) + ')' });
    }
    return s;
  }

  /* =========================================================
     部门工位分区与排版 (Department Zone)
     ========================================================= */
  function zone(z, data) {
    var s = '', d = z.dept, emps = z.employees || [];
    var carpetColor = DEPT_CARPETS[d.id] || '#f0f2f5';

    // 1. 部门外轮廓与阴影
    s += rect(z.x, z.y, z.w, z.h, 18, '#ffffff', { stroke: '#e2e4e8', 'stroke-width': 1.2, filter: 'url(#oShadowS)' });
    // 2. 部门专属降噪地毯
    s += rect(z.x + 8, z.y + 44, z.w - 16, z.h - 52, 12, carpetColor);
    s += rect(z.x + 8, z.y + 44, z.w - 16, z.h - 52, 12, 'url(#oCarpetDots)');
    // 3. 部门主题色彩带
    s += rect(z.x + 1, z.y + 1, z.w - 2, 4, 2, d.color);

    // 4. 部门头部标识区
    s += '<g class="zone-head" data-act="office-dept" data-dept="' + d.id + '" style="cursor:pointer">';
    s += rect(z.x + 14, z.y + 12, 24, 24, 8, d.color, { opacity: '0.14' });
    s += rect(z.x + 19, z.y + 17, 14, 14, 4, d.color);
    s += txt(z.x + 46, z.y + 29, escx(d.name), { 'font-size': 15, 'font-weight': 800, fill: '#1f2937' });
    s += txt(z.x + 46 + d.name.length * 15 + 8, z.y + 29, emps.length + ' 人在职', { 'font-size': 12, fill: '#94a3b8' });

    if (z.lead) {
      var lb = '👑 负责人 ' + z.lead.name, lbw = Math.max(88, lb.length * 10.5 + 24), lbx = z.x + z.w - 14 - lbw, lby = z.y + 12;
      s += '<g class="lead-badge">' +
        rect(lbx, lby, lbw, 22, 11, '#fef3c7', { stroke: '#f59e0b', 'stroke-width': 1 }) +
        txt(lbx + 10, lby + 15, escx(lb), { 'font-size': 11, fill: '#92400e', 'font-weight': 700 }) +
        '</g>';
    }
    s += '</g>';

    // 5. 工位排列布局
    var cols = z.cols || 3, rows = z.rows || Math.ceil((emps.length + (z.hiring || 0)) / cols);
    var cw = 108, ch = 96;
    if (cols * cw + 28 > z.w) { cw = (z.w - 28) / cols; }
    if (rows * ch + 70 > z.h) { ch = Math.max(76, (z.h - 70) / rows); }
    var gx = z.x + (z.w - cols * cw) / 2 + 4, gy = z.y + 54;
    var total = cols * rows, idx = 0;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var e = emps[idx], x = gx + c * cw + (cw - 92) / 2, y = gy + r * ch;
        s += seatCell(e, x, y, data, z, d.id);
        idx++;
      }
    }
    if (z.hiring) {
      for (var h = 0; h < z.hiring && idx < total; h++, idx++) {
        var rr = Math.floor(idx / cols), cc = idx % cols;
        s += emptyCell(gx + cc * cw + (cw - 92) / 2, gy + rr * ch, z);
      }
    }
    return s;
  }

  function seatCell(e, x, y, data, z, deptId) {
    var s = '', cx = x + 46, cy = y + 50;
    s += '<g class="office-seat' + (e ? ' has' : ' empty') + '"' + (e ? ' data-act="open-emp" data-eid="' + e.id + '"' : '') + ' style="cursor:' + (e ? 'pointer' : 'default') + '">';
    s += deskShadow(x, y) + seatShadow(cx, cy);
    s += desk(x, y, 92, 44, deptId);
    s += chair(cx, cy);

    if (e) {
      var v = (data.views && data.views[e.id]) || {};
      var color = data.deptColor || '#2f7ff0';
      // 员工姓名标识 (带微光阴影)
      s += txt(cx, y + 12.5, escx(e.name), { 'class': 'lbl', 'text-anchor': 'middle' });
      if (z.lead && e.id === z.lead.id) {
        var nw = Math.max(26, e.name.length * 13);
        s += path('M' + r1(cx - nw / 2 - 11) + ' ' + r1(y + 12.5) + 'l1.6 -5.2 l2.1 3.2 l2.1 -3.2 l1.6 5.2 z', '#f59e0b');
      }
      // 人物模型 (坐姿 + 交互回头)
      s += '<g class="office-person' + (v.dim ? ' dim' : '') + '" transform="translate(' + r1(cx) + ',' + r1(cy) + ')"><g class="stu-in">' + figure(e, color) + '</g></g>';

      // 状态气泡 Chip
      if (v.chip) {
        var w = Math.max(30, v.chip.length * 12 + 14);
        s += '<g class="seat-chip ' + (v.chipTone || '') + '" transform="translate(' + r1(cx) + ',' + r1(cy - 4) + ')">' +
          rect(-w / 2, -9.5, w, 19, 9.5, null, { 'class': 'chip-bg' }) +
          txt(0, 3.8, escx(v.chip), { 'text-anchor': 'middle', 'class': 'chip-tx' }) + '</g>';
      }
      // 状态角标 Badge
      if (v.badge) {
        var bw = Math.max(36, v.badge.length * 7.5 + 14);
        s += '<g class="seat-badge ' + (v.badgeTone || '') + '" transform="translate(' + r1(x + 92 - bw - 2) + ',' + r1(y - 16) + ')">' +
          rect(0, 0, bw, 18, 9, null, { 'class': 'badge-bg' }) +
          txt(bw / 2, 13, escx(v.badge), { 'text-anchor': 'middle', 'class': 'badge-tx' }) + '</g>';
      }
    } else {
      s += '<g class="office-add" transform="translate(' + r1(cx) + ',' + r1(cy) + ')">' +
        circ(0, 0, 16, '#ffffff', { stroke: '#94a3b8', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }) +
        path('M-5 0H5M0 -5V5', 'none', { stroke: '#64748b', 'stroke-width': 1.6, 'stroke-linecap': 'round' }) + '</g>';
    }
    return s + '</g>';
  }

  function emptyCell(x, y, z) {
    var cx = x + 46, cy = y + 50, s = '';
    s += '<g class="office-seat empty hiring" style="cursor:pointer" data-act="office-hiring" data-dept="' + z.dept.id + '">';
    s += deskShadow(x, y) + seatShadow(cx, cy);
    s += desk(x, y, 92, 44, z.dept.id);
    s += chair(cx, cy);
    s += '<g class="office-add" transform="translate(' + r1(cx) + ',' + r1(cy) + ')">' +
      circ(0, 0, 16, '#ffffff', { stroke: '#94a3b8', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }) +
      path('M-5 0H5M0 -5V5', 'none', { stroke: '#64748b', 'stroke-width': 1.6, 'stroke-linecap': 'round' }) + '</g>';
    s += txt(cx, y + 12.5, '在招职位', { 'class': 'lbl hiring-lbl', 'text-anchor': 'middle' });
    return s + '</g>';
  }

  /* =========================================================
     核心专属空间升级：Boss 室、会议室、休闲水吧台、档案室
     ========================================================= */

  /* ---------- 1. Boss 总裁套间 (bossRoom) ---------- */
  function bossRoom(x, y, w, h, boss) {
    boss = boss || {};
    var s = '', cx = x + w / 2;
    // 空间底板与长投影
    s += rect(x + 2, y + 4, w, h, 18, '#000000', { 'fill-opacity': '.04', filter: 'url(#oShadow)' });
    s += rect(x, y, w, h, 18, '#ffffff', { stroke: '#e2e8f0', 'stroke-width': 1.2 });
    // 高级胡桃木人字拼花木地板
    s += rect(x + 8, y + 34, w - 16, h - 42, 14, 'url(#oWoodFloor)');
    // 落地全景玻璃隔断带百叶窗条纹
    s += rect(x, y, w, 4, 2, '#1e293b');
    for (var bi = 0; bi < 8; bi++) {
      s += rect(x + 10 + bi * (w - 20) / 8, y + 6, (w - 20) / 10, 14, 1, '#ffffff', { opacity: '0.45' });
    }
    s += txt(x + 18, y + 24, 'CHIEF EXECUTIVE', { 'font-size': 11, 'font-weight': 800, fill: '#64748b', 'letter-spacing': '1.2' });
    s += txt(x + 140, y + 24, '总经理办公室', { 'font-size': 14, 'font-weight': 800, fill: '#0f172a' });

    // 背景墙装饰书柜 (含精装书架与金色荣誉奖杯)
    var bx = x + 30, by = y + 40, bw = w - 60;
    s += rect(bx, by, bw, 22, 4, '#3e2723', { stroke: '#2e1c18', 'stroke-width': 1 });
    // 书架上的书本与金杯
    for (var k = 0; k < 6; k++) {
      s += rect(bx + 16 + k * 28, by + 4, 18, 14, 1.5, ['#0284c7', '#b91c1c', '#d97706', '#059669', '#475569', '#7c3aed'][k % 6]);
    }
    s += txt(bx + bw - 38, by + 16, '🏆', { 'font-size': '14' });

    // 大板胡桃木总裁班台
    var dw = 260, dx = cx - dw / 2, dy = y + 68, dd = 42, df = 22;
    var has = !!(boss && boss.id);
    s += '<g class="office-boss" data-act="' + (has ? 'open-emp' : 'boss-select') + '"' + (has ? ' data-eid="' + boss.id + '"' : '') + ' style="cursor:pointer">';
    s += rect(x, y, w, h, 18, 'transparent');

    // Boss 人物站在班台后
    if (has) s += '<g transform="translate(' + r1(cx) + ',' + r1(y + 24) + ') scale(.82)">' + bossFigure(boss) + '</g>';
    else s += '<g transform="translate(' + r1(cx) + ',' + r1(y + 40) + ')">' + circ(0, 0, 18, '#ffffff', { stroke: '#94a3b8', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }) + path('M-6 0H6M0 -6V6', 'none', { stroke: '#64748b', 'stroke-width': 1.8, 'stroke-linecap': 'round' }) + '</g>';

    // 总裁桌投影与立体台面
    s += poly([[dx + dw, dy + 6], [dx + dw, dy + dd + df], [dx, dy + dd + df], [dx - 28, dy + dd + df + 14], [dx + dw - 28, dy + dd + df + 14], [dx + dw - 18, dy + 32]], '#000000', { 'fill-opacity': '.12', filter: 'url(#oShadow)' });
    s += rect(dx, dy + dd - 2, dw, df + 2, 3, 'url(#oDeskWalnutFace)', { stroke: '#2e1c18', 'stroke-width': 0.8 });
    s += rect(dx, dy, dw, dd, 4, 'url(#oDeskWalnut)', { stroke: '#5c4033', 'stroke-width': 0.8 });

    // 桌面配件：真皮写字垫、超薄笔记本、金笔架、红木名牌
    s += rect(cx - 36, dy + 6, 72, 30, 2, '#1a1816');
    s += rect(cx - 18, dy + 10, 36, 22, 1.5, '#e2e8f0', { stroke: '#94a3b8', 'stroke-width': 0.8 }); // 苹果笔记本
    s += rect(dx + dw - 48, dy + 8, 28, 14, 2, '#78350f', { stroke: '#92400e', 'stroke-width': 0.8 }); // 红木金字名牌
    s += txt(dx + dw - 34, dy + 18, 'CEO', { 'font-size': '8', fill: '#fbbf24', 'font-weight': '800', 'text-anchor': 'middle' });
    s += circ(dx + 26, dy + 20, 6, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 }) + circ(dx + 26, dy + 20, 4, '#78350f'); // 功夫茶杯

    // 左右两株大型琴叶榕
    s += plant(x + 28, y + h - 22, 19, 'fig') + plant(x + w - 28, y + h - 22, 19, 'fig');
    s += '</g>';
    return s;
  }

  /* ---------- 2. 面试与视频会议室 (meetingRoom) ---------- */
  function meetingRoom(x, y, w, h, interviews) {
    var s = '';
    // 底板
    s += rect(x + 2, y + 4, w, h, 18, '#000000', { 'fill-opacity': '.04', filter: 'url(#oShadow)' });
    s += rect(x, y, w, h, 18, '#ffffff', { stroke: '#e2e8f0', 'stroke-width': 1.2 });
    // 会议室天蓝色地毯
    s += rect(x + 8, y + 40, w - 16, h - 48, 14, '#eaf3fc');
    // 双层磨砂隔断玻璃条纹
    s += rect(x, y, w, 4, 2, '#2563eb');
    s += txt(x + 16, y + 26, 'MEETING ROOM', { 'font-size': 11, 'font-weight': 800, fill: '#60a5fa', 'letter-spacing': '1' });
    s += txt(x + 130, y + 26, '面试会议室', { 'font-size': 14, 'font-weight': 800, fill: '#1e293b' });
    s += txt(x + w - 16, y + 26, '今日 ' + interviews.length + ' 场面试', { 'font-size': 12, fill: '#3b82f6', 'text-anchor': 'end', 'font-weight': '600' });

    // 会议长桌 (圆角船形现代会议桌)
    var tx = x + 34, ty = y + 54, tw = w - 68, th = 68;
    s += rect(tx + 4, ty + 6, tw, th, 16, '#000000', { 'fill-opacity': '.08', filter: 'url(#oShadowS)' });
    s += rect(tx, ty, tw, th, 16, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
    // 桌中央金属翻盖插座盒
    s += rect(tx + tw / 2 - 24, ty + th / 2 - 5, 48, 10, 2, '#e2e8f0', { stroke: '#94a3b8', 'stroke-width': 0.8 });

    // 围绕会议桌的 6 张人体工学椅
    for (var i = 0; i < 3; i++) {
      var ix = tx + 30 + i * (tw - 60) / 2;
      s += circ(ix, ty - 8, 8, '#334155', { stroke: '#1e293b', 'stroke-width': 1 });
      s += circ(ix, ty + th + 8, 8, '#334155', { stroke: '#1e293b', 'stroke-width': 1 });
    }

    // 墙上 75 寸超薄投屏电视 (显示当前面试进行状态)
    s += rect(x + 36, y + 136, w - 72, 18, 3, '#0f172a');
    s += rect(x + 40, y + 138, w - 80, 14, 2, '#1e293b');
    s += circ(x + 48, y + 145, 2.8, '#22c55e', { filter: 'url(#oGlowCyan)' }); // 绿灯表示活跃
    s += txt(x + 58, y + 149, 'INTERVIEW SCREEN · 投屏中', { 'font-size': '8.5', fill: '#94a3b8', 'letter-spacing': '.8' });

    // 面试日程卡片排列
    var cy = y + h - 74;
    interviews.slice(0, 2).forEach(function (it, idx) {
      var c = it.c, yy = cy + idx * 32;
      s += '<g class="iv-card" data-act="open-interview" data-id="' + it.id + '" style="cursor:pointer">';
      s += rect(x + 14, yy, w - 28, 27, 8, '#ffffff', { stroke: '#e2e8f0', 'stroke-width': 1, filter: 'url(#oShadowHard)' });
      s += rect(x + 14, yy, 4, 27, 2, idx === 0 ? '#ef4444' : '#3b82f6');
      s += txt(x + 24, yy + 18, it.time, { 'font-size': 11.5, fill: '#2563eb', 'font-weight': 800 });
      s += txt(x + 72, yy + 18, c ? c.name : '候选人', { 'font-size': 12, 'font-weight': 700, fill: '#0f172a' });
      s += txt(x + w - 22, yy + 18, it.round + ' · ' + (it.status === 'done' ? '已完成' : '待面试'), { 'font-size': 10.5, fill: '#64748b', 'text-anchor': 'end' });
      s += '</g>';
    });

    return s;
  }

  /* ---------- 3. 休闲水吧台与茶水间 (lounge) ---------- */
  function lounge(x, y, w, h) {
    var s = '';
    // 底板
    s += rect(x + 2, y + 4, w, h, 18, '#000000', { 'fill-opacity': '.04', filter: 'url(#oShadow)' });
    s += rect(x, y, w, h, 18, '#ffffff', { stroke: '#e2e8f0', 'stroke-width': 1.2 });
    // 现代水磨石地板
    s += rect(x + 8, y + 36, w - 16, h - 44, 14, 'url(#oTerrazzo)');
    s += rect(x, y, w, 4, 2, '#10b981');
    s += txt(x + 16, y + 24, 'PANTRY & LOUNGE', { 'font-size': 11, 'font-weight': 800, fill: '#34d399', 'letter-spacing': '1' });
    s += txt(x + 155, y + 24, '茶水与休闲吧台', { 'font-size': 14, 'font-weight': 800, fill: '#0f172a' });

    // 咖啡吧台 (高光石英石台面 + 意式双头咖啡机)
    var bx = x + 24, by = y + 48, bw = 170, bh = 46;
    s += rect(bx, by, bw, bh, 6, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
    s += rect(bx + 4, by + 4, bw - 8, bh - 8, 4, '#f8fafc');
    // 双头意式商用咖啡机
    s += rect(bx + 14, by + 8, 38, 28, 4, '#334155', { stroke: '#0f172a', 'stroke-width': 1 });
    s += rect(bx + 18, by + 12, 12, 6, 1, '#38bdf8'); // 液晶压力表
    s += circ(bx + 24, by + 28, 3, '#78350f') + circ(bx + 34, by + 28, 3, '#78350f'); // 出液口
    // 咖啡香气微波线
    s += path('M' + (bx + 24) + ' ' + (by + 4) + ' Q' + (bx + 22) + ' ' + (by - 2) + ' ' + (bx + 26) + ' ' + (by - 6), 'none', { stroke: '#cbd5e1', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
    s += path('M' + (bx + 34) + ' ' + (by + 4) + ' Q' + (bx + 32) + ' ' + (by - 2) + ' ' + (bx + 36) + ' ' + (by - 6), 'none', { stroke: '#cbd5e1', 'stroke-width': 1.2, 'stroke-linecap': 'round' });
    // 吧台高脚凳
    s += circ(bx + 85, by + bh + 14, 9, '#78350f', { stroke: '#451a03', 'stroke-width': 1.2 });
    s += circ(bx + 130, by + bh + 14, 9, '#78350f', { stroke: '#451a03', 'stroke-width': 1.2 });

    // 休息区模块化沙发 + 抱枕
    var sx = x + 220, sy = y + 52, sw = w - 240;
    s += rect(sx, sy, sw - 28, 40, 8, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
    s += rect(sx + 6, sy + 6, (sw - 44) / 2, 28, 5, '#e2e8f0');
    s += rect(sx + 10 + (sw - 44) / 2, sy + 6, (sw - 44) / 2, 28, 5, '#e2e8f0');
    // 两个暖黄 & 墨绿抱枕
    s += rect(sx + 8, sy + 8, 12, 12, 3, '#f59e0b');
    s += rect(sx + sw - 46, sy + 8, 12, 12, 3, '#059669');

    // 圆茶几
    s += circ(sx + sw / 2 - 14, sy + 62, 16, '#ffffff', { stroke: '#cbd5e1', 'stroke-width': 1 });
    s += circ(sx + sw / 2 - 14, sy + 62, 11, '#f1f5f9');
    s += circ(sx + sw / 2 - 14, sy + 62, 3.5, '#b45309'); // 咖啡杯

    // 吧台旁龟背竹绿植
    s += plant(x + w - 26, y + h - 22, 18, 'monstera');
    return s;
  }

  /* ---------- 4. 人事档案室 (archiveRoom) ---------- */
  function archiveRoom(x, y, w, h, count, expiring) {
    var s = '';
    // 底板
    s += rect(x + 2, y + 4, w, h, 16, '#000000', { 'fill-opacity': '.04', filter: 'url(#oShadow)' });
    s += rect(x, y, w, h, 16, '#ffffff', { stroke: '#e2e8f0', 'stroke-width': 1.2 });
    // 地板与主题线条
    s += rect(x + 8, y + 36, w - 16, h - 44, 12, '#f8fafc');
    s += rect(x, y, w, 4, 2, '#f59e0b');
    s += txt(x + 14, y + 24, 'CONFIDENTIAL ARCHIVES', { 'font-size': 11, 'font-weight': 800, fill: '#fbbf24', 'letter-spacing': '1' });
    s += txt(x + 190, y + 24, '人事档案室', { 'font-size': 14, 'font-weight': 800, fill: '#0f172a' });
    s += txt(x + w - 14, y + 24, count + ' 份文件归档', { 'font-size': 12, fill: '#b45309', 'text-anchor': 'end', 'font-weight': '600' });

    // 密集档案柜 (High-density Mobile Shelving with Chrome Steering Handles)
    var sx = x + 18, sy = y + 44, sw = w - 36, sh = h - 94;
    s += rect(sx, sy, sw, sh, 6, '#334155', { stroke: '#0f172a', 'stroke-width': 1 });

    var bays = 4;
    var bayW = (sw - 10) / bays;
    for (var b = 0; b < bays; b++) {
      var bx = sx + 5 + b * bayW;
      s += rect(bx, sy + 4, bayW - 4, sh - 8, 3, '#1e293b');
      // 密集架摇把手轮
      s += circ(bx + (bayW - 4) / 2, sy + sh / 2, 7, '#94a3b8', { stroke: '#f8fafc', 'stroke-width': 1.5 });
      s += circ(bx + (bayW - 4) / 2, sy + sh / 2, 2.5, '#0f172a');
      // 3 排带标彩色档案盒
      for (var r = 0; r < 3; r++) {
        var ry = sy + 8 + r * (sh - 24) / 3;
        s += rect(bx + 4, ry, bayW - 12, 6, 1, ['#38bdf8', '#fbbf24', '#f43f5e', '#34d399'][(b + r) % 4]);
      }
    }

    // 门禁指纹锁与到期提醒
    s += txt(x + 16, y + h - 14, '即将到期：' + expiring + ' 项合同材料', { 'font-size': 11.5, fill: expiring ? '#ef4444' : '#64748b', 'font-weight': expiring ? '700' : '400' });
    return s;
  }

  /* =========================================================
     整个办公室全景画布 (office)
     ========================================================= */
  function office(data) {
    var W = data.W || 1320, H = data.H || 1140;
    var out = '<svg class="office-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg">' + defs();

    // 1. 底层大厅环氧地坪与自然漫反射
    out += rect(0, 0, W, H, 0, 'url(#oFloor)');
    out += rect(0, 0, W, H, 0, 'url(#oTiles)');

    // 2. 办公室走廊主动线通道 (连接各大部门与公共空间)
    // 纵向主动线 (x: 400 ~ 420 走道 & x: 880 ~ 900 走道)
    out += rect(398, 20, 24, H - 40, 6, 'url(#oWalkway)', { opacity: '.75' });
    out += rect(878, 20, 24, H - 40, 6, 'url(#oWalkway)', { opacity: '.75' });
    // 横向动线 (y: 170 ~ 180 走道 & y: 560 ~ 580 走道)
    out += rect(20, 168, W - 40, 14, 4, 'url(#oWalkway)', { opacity: '.65' });
    out += rect(20, 568, W - 40, 14, 4, 'url(#oWalkway)', { opacity: '.65' });

    // 3. 窗外自然采光与柔和天光 (4道斜切光影)
    var lights = '';
    for (var i = 0; i < 4; i++) {
      var ly = 80 + i * 260;
      lights += poly([[W, ly], [W, ly + 100], [W - 460, ly + 230], [W - 460, ly + 130]], '#ffffff', { 'fill-opacity': '.38' });
    }
    out += '<g filter="url(#oLight)">' + lights + '</g>';

    // 4. 部门工位区
    data.zones.forEach(function (z) { out += zone(z, data); });

    // 5. 核心四大功能空间
    if (data.boss) out += bossRoom(data.boss.x, data.boss.y, data.boss.w, data.boss.h, data.boss.person);
    if (data.meeting) out += meetingRoom(data.meeting.x, data.meeting.y, data.meeting.w, data.meeting.h, data.meeting.interviews || []);
    if (data.archive) out += archiveRoom(data.archive.x, data.archive.y, data.archive.w, data.archive.h, data.archive.count || 0, data.archive.expiring || 0);
    if (data.lounge) out += lounge(data.lounge.x, data.lounge.y, data.lounge.w, data.lounge.h);

    // 6. 场景多层次绿植点缀
    out += plant(405, 575, 20, 'monstera') + plant(885, 575, 20, 'fig');
    out += plant(410, 1100, 22, 'monstera') + plant(890, 1100, 22, 'fig');
    out += plant(30, 440, 18, 'fig') + plant(1300, 715, 20, 'monstera');

    // 7. 楼层与公司水印
    out += txt(32, H - 24, escx(data.companyShort || '皮皮未来') + ' · 智能数字化办公空间 3F · 全景', { 'font-size': 12, fill: '#94a3b8', 'font-weight': '600', 'letter-spacing': '0.8' });
    out += '</svg>';
    return { svg: out, W: W, H: H };
  }

  return {
    INK: INK,
    avatar: avatar,
    figure: figure,
    bossFigure: bossFigure,
    office: office,
    hash: hash,
    rng: rng,
    groupColor: groupColor
  };
})();
