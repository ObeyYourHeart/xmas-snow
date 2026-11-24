// 高精度程序化建筑材质与清晰雕花窗构件库 (js/archcraft.js)
// - 为极其猫实验室、极其猫乐园、滑雪木屋、姜饼钟楼等建筑提供 512x512 / 512x768 清晰矢量贴图
//   （精雕石砖墙、鱼鳞瓦片屋顶、木纹墙板、八角拼花地砖、清晰高对比彩绘/木棂亮窗、猫咪玫瑰花窗）
// - 提供真实 3D 凹陷窗框、凸起窗棂、覆雪窗台、雕花牛腿、百叶窗板与精致木门构建函数，彻底告别模糊贴片与纯色方块！

function setCrisp(tex, T, renderer, rx = 1, ry = 1) {
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);
  if (rx !== 1 || ry !== 1) {
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(rx, ry);
  }
  return tex;
}

// 1. Carved Winter Ashlar Stone Masonry (512x512)
export function makeStoneMasonryTex(T, renderer, baseHex = "#ebe7df", rx = 2.4, ry = 1.6) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  c.fillStyle = baseHex;
  c.fillRect(0, 0, 512, 512);

  const rows = 8, rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * 64;
    for (let col = -1; col < 5; col++) {
      const x = col * 128 + off, y = r * rh;
      const d = ((r * 29 + col * 43) % 15) - 7;
      c.fillStyle = `rgb(${232 + d},${228 + d},${222 + Math.round(d * 0.8)})`;
      c.fillRect(x + 2, y + 2, 124, rh - 4);
      // Top bevel highlight & bottom mortar shadow
      c.fillStyle = "rgba(255,255,255,0.42)";
      c.fillRect(x + 2, y + 2, 124, 3);
      c.fillRect(x + 2, y + 2, 3, rh - 4);
      c.fillStyle = "rgba(96,104,126,0.28)";
      c.fillRect(x + 2, y + rh - 4, 124, 3);
      c.fillRect(x + 123, y + 2, 3, rh - 4);
    }
  }
  return setCrisp(new T.CanvasTexture(cv), T, renderer, rx, ry);
}

// 2. Scalloped Fish-Scale Winter Roof Shingles (512x512, indigo-teal or alpine-red!)
export function makeShingleRoofTex(T, renderer, theme = "indigo", rx = 3, ry = 2.2) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  const isRed = theme === "red";
  const isCopper = theme === "copper";

  c.fillStyle = isRed ? "#7c261c" : isCopper ? "#1c5a68" : "#18244a";
  c.fillRect(0, 0, 512, 512);

  const rows = 10, rh = 512 / rows, cw = 64;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (cw / 2);
    for (let col = -1; col <= 8; col++) {
      const cx = col * cw + off + cw / 2;
      const cy = r * rh;
      const sh = ((r * 19 + col * 31) % 15) - 7;
      if (isRed) {
        c.fillStyle = `rgb(${156 + sh * 2},${52 + sh},${42 + sh})`;
      } else if (isCopper) {
        c.fillStyle = `rgb(${38 + sh},${124 + sh * 2},${138 + sh * 2})`;
      } else {
        c.fillStyle = `rgb(${36 + sh},${54 + sh * 2},${108 + sh * 2})`;
      }
      c.beginPath();
      c.arc(cx, cy + rh * 0.44, cw * 0.50, 0, Math.PI, false);
      c.lineTo(cx - cw * 0.50, cy);
      c.lineTo(cx + cw * 0.50, cy);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(10,14,28,0.52)";
      c.lineWidth = 2.6;
      c.stroke();

      // Delicate winter frost highlight along curved lower edge
      if ((r + col) % 2 === 0) {
        c.strokeStyle = "rgba(236,246,255,0.42)";
        c.lineWidth = 2.8;
        c.beginPath();
        c.arc(cx, cy + rh * 0.44, cw * 0.43, 0.24 * Math.PI, 0.76 * Math.PI, false);
        c.stroke();
      }
    }
  }
  return setCrisp(new T.CanvasTexture(cv), T, renderer, rx, ry);
}

// 3. Warm Alpine Cedar Timber Plank Wall (512x512)
export function makeTimberWallTex(T, renderer, dark = false, rx = 2.2, ry = 1.6) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  const planks = 8, ph = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * ph;
    const d = ((i * 37) % 17) - 8;
    c.fillStyle = dark
      ? `rgb(${78 + d},${54 + Math.round(d * 0.7)},${38 + Math.round(d * 0.5)})`
      : `rgb(${156 + d},${106 + Math.round(d * 0.8)},${64 + Math.round(d * 0.6)})`;
    c.fillRect(0, y, 512, ph);
    // Subtle wood grain lines
    c.strokeStyle = dark ? "rgba(28,16,8,0.22)" : "rgba(72,40,16,0.18)";
    c.lineWidth = 2;
    for (let g = 0; g < 4; g++) {
      const gy = y + 10 + g * 13 + ((i * 7 + g * 11) % 6);
      c.beginPath();
      c.moveTo(0, gy);
      c.bezierCurveTo(170, gy + ((i + g) % 2 ? 4 : -4), 340, gy + ((i + g) % 2 ? -4 : 4), 512, gy);
      c.stroke();
    }
    // Deep bevel seam between planks
    c.fillStyle = "rgba(24,12,6,0.45)";
    c.fillRect(0, y + ph - 3, 512, 3);
    c.fillStyle = "rgba(255,232,196,0.16)";
    c.fillRect(0, y, 512, 2);
  }
  return setCrisp(new T.CanvasTexture(cv), T, renderer, rx, ry);
}

// 4. Spiced Gingerbread & Piped Sugar-Icing Wall (512x512)
export function makeGingerbreadTex(T, renderer, rx = 2, ry = 2) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  c.fillStyle = "#b87338";
  c.fillRect(0, 0, 512, 512);
  const rows = 8, rh = 64;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * 64;
    for (let col = -1; col < 5; col++) {
      const x = col * 128 + off, y = r * rh;
      const d = ((r * 17 + col * 29) % 13) - 6;
      c.fillStyle = `rgb(${182 + d},${114 + d},${56 + Math.round(d * 0.6)})`;
      c.fillRect(x + 3, y + 3, 122, rh - 6);
      // Warm piped-icing mortar lines
      c.strokeStyle = "rgba(255,244,228,0.48)";
      c.lineWidth = 3;
      c.strokeRect(x + 2, y + 2, 124, rh - 4);
    }
  }
  return setCrisp(new T.CanvasTexture(cv), T, renderer, rx, ry);
}

// 5. Laboratory Octagonal Slate & Inlaid Brass Tile Floor (512x512)
export function makeLabFloorTex(T, renderer, rx = 6, ry = 5) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  c.fillStyle = "#162038";
  c.fillRect(0, 0, 512, 512);
  const n = 4, s = 512 / n;
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const x = col * s, y = r * s;
      const alt = (r + col) % 2 === 0;
      c.fillStyle = alt ? "#1d2948" : "#18223d";
      c.fillRect(x + 3, y + 3, s - 6, s - 6);
      c.strokeStyle = "rgba(232,190,104,0.34)";
      c.lineWidth = 2.5;
      c.strokeRect(x + 4, y + 4, s - 8, s - 8);
      // Tiny brass diamond inlay at corners
      c.fillStyle = "rgba(242,204,112,0.52)";
      c.beginPath();
      c.moveTo(x, y - 9); c.lineTo(x + 9, y); c.lineTo(x, y + 9); c.lineTo(x - 9, y);
      c.closePath();
      c.fill();
    }
  }
  return setCrisp(new T.CanvasTexture(cv), T, renderer, rx, ry);
}

// 6. ULTRA-CRISP 512x768 HIGH-CONTRAST ILLUMINATED WINDOW GLASS TEXTURES (ZERO BLUR!)
//    theme: "alchemy" (glowing starlight potion bay), "cozy" (warm hearth curtains), "nightsky" (cathedral pine/aurora view)
export function makeCrispWindowTex(T, renderer, theme = "alchemy") {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 768;
  const c = cv.getContext("2d");

  if (theme === "alchemy") {
    // Rich starlight-amber-cyan alchemical interior depth gradient
    const bg = c.createLinearGradient(0, 0, 0, 768);
    bg.addColorStop(0.0, "#1c3364");
    bg.addColorStop(0.32, "#2f6b9e");
    bg.addColorStop(0.68, "#72d4e8");
    bg.addColorStop(1.0, "#ffcf82");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 768);

    // Subtle crisp interior silhouettes: arched bookshelf & glowing potion bottles inside!
    c.fillStyle = "rgba(18, 28, 58, 0.42)";
    c.fillRect(0, 520, 512, 24);
    c.fillRect(0, 680, 512, 24);
    // Silhouetted Erlenmeyer flasks & glowing liquid cores visible behind glass!
    const flasks = [
      [96, 520, "#4ef4ff"], [182, 520, "#ff78dc"], [328, 520, "#ff884c"], [418, 520, "#b284ff"],
      [130, 680, "#ffd866"], [256, 680, "#52f4ff"], [386, 680, "#ff84d4"]
    ];
    for (const [fx, fy, col] of flasks) {
      c.fillStyle = "rgba(16, 26, 52, 0.58)";
      c.beginPath();
      c.moveTo(fx - 12, fy - 76); c.lineTo(fx + 12, fy - 76);
      c.lineTo(fx + 36, fy); c.lineTo(fx - 36, fy);
      c.closePath();
      c.fill();
      c.fillStyle = col;
      c.globalAlpha = 0.78;
      c.beginPath();
      c.moveTo(fx - 20, fy - 34); c.lineTo(fx + 20, fy - 34);
      c.lineTo(fx + 31, fy - 4); c.lineTo(fx - 31, fy - 4);
      c.closePath();
      c.fill();
      c.globalAlpha = 1;
    }
    // Glowing hanging interior starlight pendant lamp near top center!
    const lp = c.createRadialGradient(256, 178, 8, 256, 178, 128);
    lp.addColorStop(0, "rgba(255,250,220,0.95)");
    lp.addColorStop(0.35, "rgba(130,240,255,0.45)");
    lp.addColorStop(1, "rgba(130,240,255,0)");
    c.fillStyle = lp;
    c.fillRect(100, 30, 312, 300);

    // Crisp diamond leaded-glass lattice lines (sharp 4px dark lead!)
    c.strokeStyle = "rgba(18, 24, 46, 0.72)";
    c.lineWidth = 5;
    for (let k = -768; k < 1280; k += 96) {
      c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 512, 768); c.stroke();
      c.beginPath(); c.moveTo(k + 512, 0); c.lineTo(k, 768); c.stroke();
    }
    // Crisp specular diagonal glass glint
    c.fillStyle = "rgba(255,255,255,0.18)";
    c.beginPath(); c.moveTo(40, 0); c.lineTo(135, 0); c.lineTo(0, 210); c.lineTo(0, 85); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(190, 0); c.lineTo(235, 0); c.lineTo(0, 370); c.lineTo(0, 310); c.closePath(); c.fill();
  } else if (theme === "nightsky") {
    // Crisp cathedral winter-night pine & emerald-violet aurora view for indoor lab windows!
    const bg = c.createLinearGradient(0, 0, 0, 768);
    bg.addColorStop(0.0, "#0b1432");
    bg.addColorStop(0.42, "#142a58");
    bg.addColorStop(0.78, "#1b456e");
    bg.addColorStop(1.0, "#325b86");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 768);

    // Aurora ribbons
    const aur = c.createLinearGradient(0, 120, 512, 360);
    aur.addColorStop(0, "rgba(72,255,212,0.52)");
    aur.addColorStop(0.5, "rgba(110,180,255,0.42)");
    aur.addColorStop(1, "rgba(255,112,218,0.44)");
    c.fillStyle = aur;
    c.beginPath();
    c.moveTo(0, 260);
    c.bezierCurveTo(150, 140, 340, 310, 512, 165);
    c.lineTo(512, 320);
    c.bezierCurveTo(340, 420, 160, 260, 0, 380);
    c.closePath();
    c.fill();

    // Crisp twinkling stars & crescent moon
    c.fillStyle = "#fff8dc";
    for (let i = 0; i < 36; i++) {
      const sx = (i * 139 + 47) % 480 + 16;
      const sy = (i * 97 + 23) % 420 + 24;
      c.beginPath(); c.arc(sx, sy, (i % 3 === 0) ? 3.5 : 2.0, 0, Math.PI * 2); c.fill();
    }
    // Sharp snow-tipped pine silhouettes along bottom sill
    const trees = [[64, 520, 90], [180, 480, 110], [320, 500, 105], [442, 530, 88]];
    for (const [tx, ty, tw] of trees) {
      c.fillStyle = "#0e1d36";
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + tw, 768); c.lineTo(tx - tw, 768); c.closePath(); c.fill();
      c.fillStyle = "rgba(220,240,255,0.68)";
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + tw * 0.36, ty + 76); c.lineTo(tx - tw * 0.36, ty + 76); c.closePath(); c.fill();
    }
    // Crisp dark wrought-iron diamond leaded lattice
    c.strokeStyle = "rgba(12, 16, 30, 0.85)";
    c.lineWidth = 6;
    for (let k = -768; k < 1280; k += 112) {
      c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 512, 768); c.stroke();
      c.beginPath(); c.moveTo(k + 512, 0); c.lineTo(k, 768); c.stroke();
    }
  } else {
    // "cozy": Crisp golden alpine hearth-lit window with drawn cream curtains & warm interior silhouette!
    const bg = c.createRadialGradient(256, 360, 28, 256, 384, 420);
    bg.addColorStop(0.0, "#fff4c6");
    bg.addColorStop(0.45, "#ffc468");
    bg.addColorStop(0.82, "#d87a32");
    bg.addColorStop(1.0, "#8c4218");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 768);

    // Subtle interior warm hanging chandelier & shelf silhouette
    c.fillStyle = "rgba(110, 46, 14, 0.34)";
    c.fillRect(250, 0, 12, 170);
    c.beginPath(); c.arc(256, 195, 42, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff8dc";
    c.beginPath(); c.arc(256, 195, 22, 0, Math.PI * 2); c.fill();

    // Drawn lace curtains framing left & right edges with crisp pleated folds & ribbon tie-backs!
    c.fillStyle = "rgba(255, 246, 232, 0.82)";
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(156, 0);
    c.quadraticCurveTo(132, 260, 56, 460);
    c.quadraticCurveTo(110, 610, 124, 768);
    c.lineTo(0, 768); c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(512, 0); c.lineTo(356, 0);
    c.quadraticCurveTo(380, 260, 456, 460);
    c.quadraticCurveTo(402, 610, 388, 768);
    c.lineTo(512, 768); c.closePath(); c.fill();

    // Crisp vertical pleat shadows inside curtains
    c.strokeStyle = "rgba(182, 132, 92, 0.36)";
    c.lineWidth = 4;
    for (const px of [34, 74, 112]) {
      c.beginPath(); c.moveTo(px, 0); c.quadraticCurveTo(px * 0.65, 320, px * 0.52, 460); c.quadraticCurveTo(px * 0.82, 610, px * 0.9, 768); c.stroke();
      c.beginPath(); c.moveTo(512 - px, 0); c.quadraticCurveTo(512 - px * 0.65, 320, 512 - px * 0.52, 460); c.quadraticCurveTo(512 - px * 0.82, 610, 512 - px * 0.9, 768); c.stroke();
    }

    // Crisp silhouette of a tiny festive evergreen & warm hearth glow on the bottom shelf inside
    c.fillStyle = "rgba(42, 78, 44, 0.52)";
    c.beginPath(); c.moveTo(192, 536); c.lineTo(244, 690); c.lineTo(140, 690); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(192, 476); c.lineTo(234, 600); c.lineTo(150, 600); c.closePath(); c.fill();
    c.fillStyle = "#fff2a8";
    for (const [ox, oy] of [[192, 472], [174, 548], [210, 574], [166, 636], [212, 650]]) {
      c.beginPath(); c.arc(ox, oy, 5.5, 0, Math.PI * 2); c.fill();
    }
    // Glowing brass windowsill candle on right side
    c.fillStyle = "#fff8dc";
    c.fillRect(324, 646, 20, 96);
    c.fillStyle = "#ffd054";
    c.beginPath(); c.ellipse(334, 634, 10, 18, 0, 0, Math.PI * 2); c.fill();

    // Ribbon tie-backs
    c.fillStyle = "#b8362a";
    c.fillRect(0, 448, 72, 20);
    c.fillRect(440, 448, 72, 20);
    c.fillStyle = "#f4cb66";
    c.fillRect(62, 446, 12, 24);
    c.fillRect(438, 446, 12, 24);

    // Crisp diagonal glass highlight
    c.fillStyle = "rgba(255,255,255,0.22)";
    c.beginPath(); c.moveTo(155, 0); c.lineTo(225, 0); c.lineTo(40, 290); c.lineTo(0, 220); c.closePath(); c.fill();
  }

  // Crisp dark outer glazing bead & 6-pane cross muntins baked razor-sharp right inside the glass!
  c.strokeStyle = "#1d2236";
  c.lineWidth = 14;
  c.strokeRect(7, 7, 498, 754);
  c.lineWidth = 10;
  c.beginPath();
  c.moveTo(256, 0); c.lineTo(256, 768);
  c.moveTo(0, 256); c.lineTo(512, 256);
  c.moveTo(0, 512); c.lineTo(512, 512);
  c.stroke();

  // Crisp frost crystal rime in the bottom corners
  c.fillStyle = "rgba(235, 248, 255, 0.36)";
  c.beginPath(); c.moveTo(14, 754); c.lineTo(118, 754); c.quadraticCurveTo(46, 726, 14, 650); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(498, 754); c.lineTo(394, 754); c.quadraticCurveTo(466, 726, 498, 650); c.closePath(); c.fill();

  return setCrisp(new T.CanvasTexture(cv), T, renderer, 1, 1);
}

// 7. Cat-Silhouette Stained-Glass Rose Window (512x512 — signature centerpiece of 极其猫实验室!)
export function makeCatRoseWindowTex(T, renderer) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const c = cv.getContext("2d");
  const cx = 256, cy = 256;

  c.fillStyle = "#161d3a";
  c.fillRect(0, 0, 512, 512);

  // Outer starry stained-glass wheel
  const bg = c.createRadialGradient(cx, cy, 24, cx, cy, 240);
  bg.addColorStop(0.0, "#fff8d8");
  bg.addColorStop(0.45, "#74e8ff");
  bg.addColorStop(0.78, "#6a5ef0");
  bg.addColorStop(1.0, "#1c244c");
  c.fillStyle = bg;
  c.beginPath(); c.arc(cx, cy, 242, 0, Math.PI * 2); c.fill();

  // 12 Radiant stained-glass segments (alternating cyan / gold / neon-coral / argon-violet!)
  const segCols = ["#4ef4ff", "#ffd85a", "#ff7248", "#a876ff"];
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = ((i + 1) / 12) * Math.PI * 2;
    c.fillStyle = segCols[i % 4];
    c.globalAlpha = 0.72;
    c.beginPath();
    c.moveTo(cx, cy);
    c.arc(cx, cy, 232, a0, a1);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = "#141a30";
    c.lineWidth = 7;
    c.stroke();
  }

  // Central adorable stylized Stained-Glass Cat Head Silhouette with glowing eyes & whiskers!
  c.fillStyle = "#fff6e2";
  c.strokeStyle = "#161d38";
  c.lineWidth = 10;
  // Left & Right pointed cat ears
  c.beginPath();
  c.moveTo(158, 224); c.lineTo(136, 118); c.lineTo(226, 178); c.closePath();
  c.fill(); c.stroke();
  c.beginPath();
  c.moveTo(354, 224); c.lineTo(376, 118); c.lineTo(286, 178); c.closePath();
  c.fill(); c.stroke();
  // Inner sakura-pink ear stained glass
  c.fillStyle = "#ff8cd6";
  c.beginPath(); c.moveTo(164, 204); c.lineTo(152, 140); c.lineTo(208, 182); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(348, 204); c.lineTo(360, 140); c.lineTo(304, 182); c.closePath(); c.fill();
  // Round cat face medallion
  c.fillStyle = "#fff8e8";
  c.beginPath(); c.arc(cx, 274, 108, 0, Math.PI * 2); c.fill(); c.stroke();
  // Heterochromia Gemini eyes (left cyan-blue, right coral-gold!)
  c.fillStyle = "#3ad8ff";
  c.beginPath(); c.ellipse(214, 266, 20, 24, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#ff78b8";
  c.beginPath(); c.ellipse(298, 266, 20, 24, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#ffffff";
  c.beginPath(); c.arc(208, 258, 6, 0, Math.PI * 2); c.arc(292, 258, 6, 0, Math.PI * 2); c.fill();
  // Cute kitty ":3" mouth & pink nose
  c.fillStyle = "#ff7ab6";
  c.beginPath(); c.moveTo(256, 294); c.lineTo(246, 282); c.lineTo(266, 282); c.closePath(); c.fill();
  c.strokeStyle = "#222848";
  c.lineWidth = 6;
  c.beginPath();
  c.arc(242, 302, 14, 0.1 * Math.PI, 0.9 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(270, 302, 14, 0.1 * Math.PI, 0.9 * Math.PI);
  c.stroke();

  // Outer bronze & dark lead rings
  c.strokeStyle = "#141a30";
  c.lineWidth = 14;
  c.beginPath(); c.arc(cx, cy, 238, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = "#f4cb66";
  c.lineWidth = 8;
  c.beginPath(); c.arc(cx, cy, 224, 0, Math.PI * 2); c.stroke();

  return setCrisp(new T.CanvasTexture(cv), T, renderer, 1, 1);
}

// 8. CLEAN, SIMPLE, RAZOR-SHARP ARCHITECTURAL SIGNBOARD (e.g. "极其猫实验室", "极其猫乐园"!)
export function makeCleanSignTex(T, renderer, title, sub = "", opts = {}) {
  const cv = document.createElement("canvas");
  cv.width = 640;
  cv.height = sub ? 192 : 144;
  const c = cv.getContext("2d");

  const bg0 = opts.bg0 || "#131c3f";
  const bg1 = opts.bg1 || "#242c62";
  const border = opts.border || "#f2ca66";
  const glow = opts.glow || "#72f0ff";

  const g = c.createLinearGradient(0, 0, cv.width, cv.height);
  g.addColorStop(0, bg0);
  g.addColorStop(0.5, bg1);
  g.addColorStop(1, bg0);
  c.fillStyle = g;
  c.fillRect(0, 0, cv.width, cv.height);

  c.strokeStyle = border;
  c.lineWidth = 8;
  c.strokeRect(10, 10, cv.width - 20, cv.height - 20);
  c.strokeStyle = "rgba(255,255,255,0.28)";
  c.lineWidth = 2;
  c.strokeRect(22, 22, cv.width - 44, cv.height - 44);

  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#ffffff";
  c.shadowColor = glow;
  c.shadowBlur = 12;
  c.font = sub
    ? "900 54px 'Microsoft YaHei', 'PingFang SC', sans-serif"
    : "900 56px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  c.fillText(title, cv.width / 2, sub ? 74 : cv.height / 2 + 2);

  if (sub) {
    c.shadowBlur = 4;
    c.fillStyle = "#ffe296";
    c.font = "700 24px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText(sub, cv.width / 2, 140);
  }

  return setCrisp(new T.CanvasTexture(cv), T, renderer, 1, 1);
}

// 9. REAL 3D RECESSED ARCHITECTURAL WINDOW BUILDER (Frame + Crisp Pane + 3D Mullions + Snow Sill + Shutters/Box!)
export function buildCrispWindow(T, mats, opts = {}) {
  const w = opts.w || 1.15;
  const h = opts.h || 1.55;
  const g = new T.Group();

  const mk = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };

  const frameM = opts.frameMat || mats.frame;
  const accentM = opts.accentMat || mats.brass;
  const snowM = opts.snowMat || mats.snow;
  const paneM = opts.paneMat || mats.pane;

  // Recessed glass pane (razor-sharp 512x768 canvas texture!)
  g.add(mk(new T.PlaneGeometry(w, h), paneM, 0, 0, 0.015));

  // Deep 3D outer casing (left, right, top lintel, bottom frame)
  const ft = 0.085, fd = 0.14;
  g.add(
    mk(new T.BoxGeometry(ft, h + ft * 2, fd), frameM, -w / 2 - ft / 2, 0, fd * 0.35),
    mk(new T.BoxGeometry(ft, h + ft * 2, fd), frameM, w / 2 + ft / 2, 0, fd * 0.35),
    mk(new T.BoxGeometry(w + ft * 2 + 0.12, ft * 1.25, fd + 0.05), frameM, 0, h / 2 + ft * 0.6, fd * 0.42),
    // Projecting carved stone/wood windowsill + corbels + fresh snow pillow on sill!
    mk(new T.BoxGeometry(w + ft * 2 + 0.18, 0.10, fd + 0.14), frameM, 0, -h / 2 - 0.05, fd * 0.55),
    mk(new T.BoxGeometry(w + 0.16, 0.055, 0.16), snowM, 0, -h / 2 + 0.025, fd * 0.72),
    mk(new T.BoxGeometry(0.10, 0.16, 0.14), accentM, -w * 0.38, -h / 2 - 0.17, fd * 0.45),
    mk(new T.BoxGeometry(0.10, 0.16, 0.14), accentM, w * 0.38, -h / 2 - 0.17, fd * 0.45)
  );

  // Real 3D protruding cross-mullions cleanly in front of glass (zero Z-fighting!)
  g.add(
    mk(new T.BoxGeometry(0.042, h, 0.042), frameM, 0, 0, 0.040),
    mk(new T.BoxGeometry(w, 0.042, 0.042), frameM, 0, h * 0.16, 0.040),
    mk(new T.BoxGeometry(w, 0.042, 0.042), frameM, 0, -h * 0.18, 0.040)
  );

  // Optional Gothic Arched Brass Hood Molding over top!
  if (opts.arch) {
    g.add(mk(new T.TorusGeometry(w * 0.52, 0.052, 8, 22, Math.PI), accentM, 0, h / 2 + 0.04, 0.08));
  }

  // Optional Hinged 3D Wooden Shutters flanking left & right!
  if (opts.shutters && mats.shutter) {
    const sw = Math.min(0.42, w * 0.40);
    for (const side of [-1, 1]) {
      const sx = side * (w / 2 + ft + sw / 2 + 0.02);
      g.add(
        mk(new T.BoxGeometry(sw, h + 0.06, 0.055), mats.shutter, sx, 0, 0.06),
        mk(new T.BoxGeometry(sw * 0.76, h * 0.36, 0.02), frameM, sx, h * 0.22, 0.09),
        mk(new T.BoxGeometry(sw * 0.76, h * 0.36, 0.02), frameM, sx, -h * 0.22, 0.09),
        mk(new T.BoxGeometry(0.12, 0.03, 0.02), accentM, side * (w / 2 + ft + 0.04), h * 0.34, 0.095),
        mk(new T.BoxGeometry(0.12, 0.03, 0.02), accentM, side * (w / 2 + ft + 0.04), -h * 0.34, 0.095)
      );
    }
  }

  // Optional Window Box with miniature glowing potion bottles / winter boughs!
  if (opts.flowerBox && opts.boxFillMats && opts.boxFillMats.length) {
    g.add(mk(new T.BoxGeometry(w * 0.88, 0.16, 0.18), frameM, 0, -h / 2 - 0.14, 0.16));
    const n = opts.boxFillMats.length;
    for (let i = 0; i < n; i++) {
      const fx = -w * 0.30 + (w * 0.60 * i) / Math.max(1, n - 1);
      g.add(mk(new T.CylinderGeometry(0.042, 0.055, 0.18, 10), opts.boxFillMats[i], fx, -h / 2 + 0.01, 0.16));
    }
  }

  return g;
}

// 10. REAL 3D RECESSED ARCHITECTURAL DOOR BUILDER (Carved Panels + Brass Handles + Glowing Transom + Arch!)
export function buildCrispDoor(T, mats, opts = {}) {
  const w = opts.w || 1.45;
  const h = opts.h || 2.30;
  const dbl = opts.double !== false;
  const g = new T.Group();
  const mk = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };
  const frameM = opts.frameMat || mats.frame;
  const doorM = opts.doorMat || mats.door;
  const accentM = opts.accentMat || mats.brass;
  const paneM = opts.paneMat || mats.pane;
  const snowM = opts.snowMat || mats.snow;

  // Recessed door slab + outer stone/timber surround & threshold step
  const ft = 0.11, fd = 0.18;
  g.add(
    mk(new T.BoxGeometry(w, h, 0.08), doorM, 0, h / 2, 0.02),
    mk(new T.BoxGeometry(ft, h + ft, fd), frameM, -w / 2 - ft / 2, (h + ft) / 2, fd * 0.38),
    mk(new T.BoxGeometry(ft, h + ft, fd), frameM, w / 2 + ft / 2, (h + ft) / 2, fd * 0.38),
    mk(new T.BoxGeometry(w + ft * 2 + 0.14, ft * 1.3, fd + 0.06), frameM, 0, h + ft * 0.65, fd * 0.44),
    mk(new T.BoxGeometry(w + ft * 2 + 0.24, 0.12, 0.42), frameM, 0, 0.06, 0.18)
  );
  if (snowM) {
    g.add(mk(new T.BoxGeometry(w + ft * 2 + 0.06, 0.055, 0.14), snowM, 0, h + ft * 1.45, fd * 0.56));
  }
  if (opts.arch) {
    g.add(mk(new T.TorusGeometry(w * 0.54, 0.065, 8, 22, Math.PI), accentM, 0, h + 0.02, 0.09));
  }

  // Carved door leaves, raised molding panels, upper glazed windows & brass ring handles!
  const leaves = dbl ? [-w * 0.25, w * 0.25] : [0];
  const lw = dbl ? w * 0.44 : w * 0.82;
  if (dbl) g.add(mk(new T.BoxGeometry(0.055, h - 0.06, 0.06), accentM, 0, h / 2, 0.06));
  for (const lx of leaves) {
    // Lower raised wood panel
    g.add(
      mk(new T.BoxGeometry(lw * 0.78, h * 0.34, 0.04), frameM, lx, h * 0.26, 0.065),
      mk(new T.BoxGeometry(lw * 0.64, h * 0.26, 0.03), doorM, lx, h * 0.26, 0.085)
    );
    // Upper glowing glazed inset window with cross-mullion
    if (paneM) {
      g.add(
        mk(new T.PlaneGeometry(lw * 0.68, h * 0.34), paneM, lx, h * 0.70, 0.070),
        mk(new T.BoxGeometry(lw * 0.76, 0.04, 0.04), accentM, lx, h * 0.87, 0.075),
        mk(new T.BoxGeometry(lw * 0.76, 0.04, 0.04), accentM, lx, h * 0.53, 0.075),
        mk(new T.BoxGeometry(0.032, h * 0.34, 0.04), accentM, lx, h * 0.70, 0.078),
        mk(new T.BoxGeometry(lw * 0.68, 0.032, 0.04), accentM, lx, h * 0.70, 0.078)
      );
    }
    // Brass handle / knocker
    const hx = dbl ? (lx < 0 ? lx + lw * 0.32 : lx - lw * 0.32) : lw * 0.34;
    g.add(
      mk(new T.SphereGeometry(0.045, 10, 8), accentM, hx, h * 0.47, 0.10),
      mk(new T.TorusGeometry(0.055, 0.014, 6, 14), accentM, hx, h * 0.42, 0.105)
    );
  }
  return g;
}
