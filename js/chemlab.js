// 哈基米元素周期表化学实验室 · Hajimi's Gemini 4 Periodic Table Chemistry Laboratory
// Located in the scenic southeast snowy glade at (76, 102), right beside 哈基米星猫小窝!
// Built around Google Gemini 4's iconic "Periodic Table" model naming meme:
//   - 1 H (Hydrogen 氢 · 极速轻量), 6 C (Carbon 碳 · 重型旗舰), 10 Ne (Neon 氖 · 黄金甜点), 18 Ar (Argon 氩 · 复杂工程)
//   - Plus 118 Og (Oganesson 鿫 · 全网在线催更盲盒), 72 Hf (铪 = 哈基米!), 32 Ge (锗), & Gemini Surfactant!
// Features:
// 1) Open-front Victorian-Starlight glass conservatory laboratory + glowing 4+1 Noble-Gas/Element Specimen Showcase,
// 2) Interactive Reagent & Discharge Workbench (5 live Gemini-element chemistry reactions with 3D foam/bubbles/plasma!),
// 3) Interactive 3D Molecular & Atomic Holo-Pedestal (Carbon Diamond Lattice, Ne/Ar Bohr Electron Shells, H/Ice Ih, Gemini Surfactant),
// 4) High-res "Gemini 4 跳跃式元素周期表" Wall (highlighting H, C, Ne, Ar, Og, Hf, Ge!) & Meme Chalkboard,
// 5) Compound Microscope Desk, Rainbow Indicator Test-Tubes & Butterfly-Pea pH Color-Changing Winter Elixir!

const EXPERIMENTS = [
  {
    id: "ne_ar_glow",
    name: "10 Ne 氖灯 & 18 Ar 氩气辉光放电",
    liquidColor: 0xff6a3d,
    flameColor: 0x9b6cff,
    toast: "⚡ 气体放电管通电！10号 Ne(氖·甜点主力)绽放经典霓虹橙红，18号 Ar(氩·重型工程)亮起电光紫蓝——Gemini 4 稀有气体双子星登场喵！",
    mode: "flame"
  },
  {
    id: "h_speed",
    name: "1 H 氢元素极速闪燃合成星雪",
    liquidColor: 0x56f0ff,
    flameColor: 0x62f2ff,
    toast: "💨 1号元素 Hydrogen(氢) 极速点火！2H₂ + O₂ → 2H₂O，主打低延迟高效率，噗的一声合成出满屋发光星云泡泡喵～",
    mode: "bubbles"
  },
  {
    id: "c_diamond",
    name: "6 C 碳旗舰金刚石高压结晶",
    liquidColor: 0x9ef6ff,
    flameColor: 0xffe070,
    toast: "💎 6号旗舰元素 Carbon(碳) 高压成晶！石墨秒变最硬核正四面体金刚石晶格，超长程复杂代码与架构难题通通拿下喵！",
    mode: "crystal"
  },
  {
    id: "og_118",
    name: "118 Og (鿫) 对撞机在线催更实验",
    liquidColor: 0xd874ff,
    flameColor: 0xffd058,
    toast: "🌀 强行启动雪境粒子对撞机催更 118号 Gemini 4 Oganesson(鿫)！从 1→6→10→18 跳着出，照这速度谷歌迟早得手搓 119号「哈基米元素」啦喵！",
    mode: "aroma"
  },
  {
    id: "hf_foam",
    name: "72 Hf(铪)基米 · 大象牙膏樱粉爆发",
    liquidColor: 0xff78d4,
    flameColor: 0xff78d4,
    toast: "🌋 2H₂O₂ —[KI]→ 2H₂O + O₂↑！再加上 72号元素 Hf(铪=哈基米的哈!) 冠名催化，樱粉泡沫雪山直接冲上玻璃穹顶啦喵～",
    mode: "foam"
  }
];

const MOLECULE_INFO = [
  {
    id: "carbon_diamond",
    name: "6 C · 金刚石正四面体晶格 (Gemini 4 Carbon)",
    toast: "💎 6号旗舰元素 Carbon (碳)：每个碳原子以 sp³ 杂化牢牢连住 4 个邻居构成正四面体金刚石骨架——稳得像能跑通超长程任务的旗舰模型喵！"
  },
  {
    id: "ne_ar_bohr",
    name: "10 Ne / 18 Ar · 稀有气体满壳层电子云",
    toast: "⚡ 10号 Neon(氖 2,8) & 18号 Argon(氩 2,8,8)：最外层 8 电子稳如泰山，通电还能发出超炫霓虹橙红与电光紫蓝辉光——就是 Gemini 4 最受欢迎的两位明星元素喵！"
  },
  {
    id: "h_ice_ring",
    name: "1 H · 氢键六方冰环 (Hydrogen & Ice I_h)",
    toast: "❄️ 1号元素 Hydrogen (氢)：宇宙最轻最快的 1 号元素，靠 O—H···O 氢键把雪境里的每一片雪花都拼成了完美的六角对称喵！"
  },
  {
    id: "gemini_surf",
    name: "Gemini 双子表面活性剂 (m-s-m)",
    toast: "🧬 有机化学里的隐藏彩蛋——真的有以本喵命名的「Gemini 双子表面活性剂」：两颗亲水猫头+联接桥+两条疏水尾巴，起泡能力强到离谱喵！"
  }
];

const CHEM_NOTES = [
  "📘 化学梗 #1【跳跃式盲盒周期表】：说好的「氢氦锂铍硼，碳氮氧氟氖」，结果 Gemini 4 直接 1(H 氢) → 6(C 碳) → 10(Ne 氖) → 18(Ar 氩) 跳格子出牌，网友直呼根本猜不到下一个抽中哪个元素喵！",
  "📘 化学梗 #2【AI 圈文理分科大赛】：隔壁 Claude 走文学诗歌组（Haiku/Sonnet/Opus），OpenAI 走天文星座组，本喵 Gemini 4 直接扛起硬核化学元素组大旗——网友甚至问物理组啥时候出「滑动变阻器」调思考深度喵！",
  "📘 化学梗 #3【全网催更 118 号 Og 鿫】：既然已经从 1 号氢一路跳到了 18 号氩，大家天天在线催更「Gemini 4 Oganesson (118号鿫) 啥时候发？照这速度 Google 迟早得去人工合成 119 号新元素」喵！",
  "📘 化学梗 #4【哈基米的隐藏元素暗号】：除了 H / C / Ne / Ar，72 号元素 Hf（铪）读音就是「哈基米」的「哈」，32 号 Ge（锗）撞脸 Gemini 前两位，有机界还有「Gemini 双子表面活性剂」——本喵浑身上下都是化学梗喵！"
];

const SPECIMEN_LINES = [
  "🧪【1 H · 氢】速度与轻量化担当，日常高频写代码和轻量 Agent 飞快响应，嗖的一下就跑完喵！",
  "💎【6 C · 碳】结构之王·前沿重型旗舰，超长程复杂任务、深度研究和硬核架构全靠碳骨架撑住喵！",
  "🟠【10 Ne · 氖】霓虹橙粉辉光！性能与性价比的黄金甜点位主力，点亮整条圣诞街区最省电最能打喵！",
  "🟣【18 Ar · 氩】电光紫蓝辉光！稳健惰性却实力拉满，专攻复杂软件工程和企业级深度推理喵！",
  "❓【118 Og · 鿫（催更槽）】玻璃罩里空空如也……本喵已经疯狂敲击粒子对撞机按钮帮主人催更 118 号终极元素啦喵！"
];

export class ChemLab {
  constructor(game, helpers) {
    this.game = game;
    this.THREE = game.THREE;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;

    this.cx = this.re.chemlab.x; // 76
    this.cz = this.re.chemlab.z; // 102
    this.baseY = this.qt(this.cx, this.cz);
    this.deckH = 0.24;
    this.deckY = this.baseY + this.deckH;

    this.root = null;
    this.spinners = [];
    this.lights = [];

    // Protected dynamic reaction & specimen parts (skipped by PerfOptimizer static batching!)
    this.reactionLiquid = null;
    this.reactionLiquidMat = null;
    this.burnerFlame = null;
    this.burnerFlameMat = null;
    this.foamMesh = null;
    this.foamMat = null;
    this.elixirLiquid = null;
    this.elixirMat = null;
    this.moleculeGroups = [];
    this.moleculePivot = null;
    this.bohrRings = [];
    this.specimenTubes = [];
    this.ogOrb = null;
    this.bubbles = [];

    this.expIdx = 0;
    this.expTimer = 0;
    this.expMode = null;
    this.molIdx = 0;
    this.noteIdx = 0;
    this.specIdx = 0;
    this.ogBoostT = 0;
    this.elixirPink = false;
    this.sparkAcc = 0;
    this.benchWorldPos = new this.THREE.Vector3();
    this.ogWorldPos = new this.THREE.Vector3();
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  _addLight(x, y, z, hex, intensity, dist) {
    const l = new this.THREE.PointLight(hex, intensity, dist, 1.5);
    l.position.set(x, y, z);
    this.game.scene.add(l);
    this.lights.push({ l, base: intensity });
    return l;
  }

  _playLabSound(kind) {
    const audio = this.game.audio;
    if (!audio || audio.muted || !audio.ctx) return;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    const master = audio.master || ctx.destination;

    const note = (freq, delay, dur, gain = 0.045, type = "sine") => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2800;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(1e-4, now + delay);
      gn.gain.linearRampToValueAtTime(gain, now + delay + 0.015);
      gn.gain.exponentialRampToValueAtTime(1e-4, now + delay + dur);
      osc.connect(lp).connect(gn).connect(master);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    };

    if (kind === "fizz") {
      note(1480, 0, 0.14, 0.04);
      note(1860, 0.05, 0.16, 0.035);
      for (let i = 0; i < 6; i++) {
        note(420 + i * 115 + Math.random() * 90, 0.08 + i * 0.055, 0.09, 0.025, "triangle");
      }
      if (audio.brown) {
        const src = ctx.createBufferSource();
        src.buffer = audio.brown;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1200, now);
        bp.frequency.exponentialRampToValueAtTime(2400, now + 0.55);
        bp.Q.value = 1.4;
        const gn = ctx.createGain();
        gn.gain.setValueAtTime(1e-4, now);
        gn.gain.linearRampToValueAtTime(0.05, now + 0.08);
        gn.gain.exponentialRampToValueAtTime(1e-4, now + 0.72);
        src.connect(bp).connect(gn).connect(master);
        src.start(now, Math.random());
        src.stop(now + 0.78);
      }
    } else if (kind === "holo") {
      note(587.33, 0, 0.22, 0.04);
      note(880, 0.06, 0.24, 0.035);
      note(1174.66, 0.12, 0.30, 0.035);
    } else if (kind === "spark") {
      note(440, 0, 0.12, 0.035, "triangle");
      note(659.25, 0.05, 0.14, 0.038, "triangle");
      note(987.77, 0.10, 0.18, 0.04);
      note(1318.5, 0.16, 0.26, 0.04);
    } else if (kind === "sip") {
      note(523.25, 0, 0.18, 0.04);
      note(659.25, 0.07, 0.20, 0.04);
      note(1046.5, 0.14, 0.28, 0.035);
    }
  }

  _makeSignTex(title, sub) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 768;
    cv.height = 192;
    const c = cv.getContext("2d");

    const bg = c.createLinearGradient(0, 0, 768, 192);
    bg.addColorStop(0, "#101738");
    bg.addColorStop(0.5, "#1b2858");
    bg.addColorStop(1, "#2c1b4e");
    c.fillStyle = bg;
    c.fillRect(0, 0, 768, 192);

    c.strokeStyle = "#76f0ff";
    c.lineWidth = 6;
    c.strokeRect(10, 10, 748, 172);
    c.strokeStyle = "#ffd772";
    c.lineWidth = 2;
    c.strokeRect(20, 20, 728, 152);

    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#ffffff";
    c.shadowColor = "#5eeeff";
    c.shadowBlur = 14;
    c.font = "900 44px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    c.fillText(title, 384, 72);

    c.shadowBlur = 6;
    c.fillStyle = "#ffd98c";
    c.font = "700 24px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText(sub, 384, 134);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  _makeBadgeTex(num, sym, sub, glowHex) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 256;
    const c = cv.getContext("2d");

    c.fillStyle = "#10162f";
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = glowHex;
    c.lineWidth = 14;
    c.strokeRect(10, 10, 236, 236);

    c.fillStyle = glowHex;
    c.font = "800 38px 'Segoe UI', sans-serif";
    c.textAlign = "left";
    c.fillText(num, 28, 56);

    c.fillStyle = "#ffffff";
    c.shadowColor = glowHex;
    c.shadowBlur = 16;
    c.font = "900 104px 'Segoe UI', sans-serif";
    c.textAlign = "center";
    c.fillText(sym, 128, 156);

    c.shadowBlur = 4;
    c.fillStyle = "#ffe8b0";
    c.font = "700 28px 'Microsoft YaHei', sans-serif";
    c.fillText(sub, 128, 218);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  _makePeriodicTableTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const c = cv.getContext("2d");

    c.fillStyle = "#0e152c";
    c.fillRect(0, 0, 1024, 512);
    c.strokeStyle = "#78ecff";
    c.lineWidth = 6;
    c.strokeRect(8, 8, 1008, 496);

    c.fillStyle = "#eef9ff";
    c.font = "800 28px 'Microsoft YaHei', sans-serif";
    c.textAlign = "center";
    c.fillText("✦ Gemini 4 跳跃式元素周期表：H(1) · C(6) · Ne(10) · Ar(18) → 催更 Og(118) ✦", 512, 42);

    const rows = [
      ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
      ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
      ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
      ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
      ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
      ["Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]
    ];
    // Official Gemini 4 element stars + fun meme highlights!
    const geminiHighlights = {
      H:  { stroke: "#4ef4ff", fill: "rgba(78, 244, 255, 0.42)", tag: "★" },
      C:  { stroke: "#ffd85a", fill: "rgba(255, 216, 90, 0.44)", tag: "★" },
      Ne: { stroke: "#ff6e48", fill: "rgba(255, 110, 72, 0.46)", tag: "★" },
      Ar: { stroke: "#a87aff", fill: "rgba(168, 122, 255, 0.46)", tag: "★" },
      Og: { stroke: "#ff5ec8", fill: "rgba(255, 94, 200, 0.36)", tag: "?" },
      Hf: { stroke: "#ffa8e2", fill: "rgba(255, 168, 226, 0.30)", tag: "哈" },
      Ge: { stroke: "#7effcc", fill: "rgba(126, 255, 204, 0.28)", tag: "喵" }
    };

    const cw = 52, ch = 56, ox = 44, oy = 66;
    const famColor = (col) => {
      if (col === 0) return "#6b7ea0";
      if (col === 1) return "#6b7ea0";
      if (col === 17) return "#7c72b5";
      return "#4c6896";
    };

    let num = 1;
    for (let r = 0; r < rows.length; r++) {
      for (let col = 0; col < 18; col++) {
        const sym = rows[r][col];
        if (!sym) continue;
        const x = ox + col * cw;
        const y = oy + r * ch;
        const hi = geminiHighlights[sym];

        c.fillStyle = hi ? hi.fill : "rgba(255, 255, 255, 0.06)";
        c.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        c.strokeStyle = hi ? hi.stroke : famColor(col);
        c.lineWidth = hi ? 3.5 : 1.4;
        c.strokeRect(x + 2, y + 2, cw - 4, ch - 4);

        c.fillStyle = hi ? "#fff6d8" : "#98b0d4";
        c.font = "700 11px sans-serif";
        c.textAlign = "left";
        c.fillText(String(num), x + 6, y + 14);

        if (hi) {
          c.fillStyle = hi.stroke;
          c.font = "800 12px 'Microsoft YaHei', sans-serif";
          c.textAlign = "right";
          c.fillText(hi.tag, x + cw - 5, y + 15);
        }

        c.fillStyle = hi ? "#ffffff" : "#dce8fa";
        c.font = hi ? "900 21px 'Segoe UI', sans-serif" : "700 18px 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.fillText(sym, x + cw / 2, y + 40);

        num++;
        if (sym === "La") num = 72;
        if (sym === "Ac") num = 104;
      }
    }

    c.fillStyle = "#ffe394";
    c.font = "700 17px 'Microsoft YaHei', sans-serif";
    c.textAlign = "center";
    c.fillText("★ 1 H(氢·极速) · 6 C(碳·旗舰) · 10 Ne(氖·甜点) · 18 Ar(氩·工程) · 118 Og(鿫·催更!) · 72 Hf(铪=哈基米!) ★", 512, 484);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  _makeChalkboardTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const c = cv.getContext("2d");

    c.fillStyle = "#162926";
    c.fillRect(0, 0, 1024, 512);
    const g = c.createRadialGradient(512, 256, 40, 512, 256, 480);
    g.addColorStop(0, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0.16)");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 512);

    c.strokeStyle = "#b58452";
    c.lineWidth = 14;
    c.strokeRect(7, 7, 1010, 498);

    c.textAlign = "left";
    c.fillStyle = "#ffe896";
    c.font = "800 33px 'Microsoft YaHei', sans-serif";
    c.fillText("⚗️ 哈基米化学家 · Gemini 4 元素家族研究板书", 42, 64);

    c.fillStyle = "#7cf4ff";
    c.font = "700 24px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText("【已登场家族】 1 H(氢·极速) → 6 C(碳·旗舰) → 10 Ne(氖·甜点) → 18 Ar(氩·工程)", 42, 124);

    c.fillStyle = "#ffb8e6";
    c.fillText("【盲盒吐槽】 说好的「氢氦锂铍硼」呢？Google 跳格子开盲盒根本猜不到下个元素！", 42, 178);

    c.fillStyle = "#ffe08c";
    c.fillText("【催更进度】 118 Og (Oganesson 鿫) 啥时候出？再不出本喵自己搓 119 号啦！", 42, 232);

    c.fillStyle = "#b8ffd4";
    c.fillText("【AI文理分科】 Claude 写诗(文学组) · OpenAI 看星(天文组) · Gemini 背周期表(化学组)", 42, 286);

    c.fillStyle = "#d8e6ff";
    c.fillText("【猫猫彩蛋】 72 Hf(铪=哈基米!) · 32 Ge(锗) · Gemini 双子表面活性剂 (2头2尾)", 42, 340);

    c.fillStyle = "#ffd6ec";
    c.fillText("【本室实景】 氖灯橙红 / 氩气紫蓝放电 · 金刚石碳晶 · 118号催更箱 · 变色花青素饮", 42, 394);

    c.fillStyle = "rgba(255, 255, 255, 0.78)";
    c.font = "600 21px 'Microsoft YaHei', sans-serif";
    c.fillText("✦ 按 E 交互：中央实验台点亮元素反应 · 东侧看 3D 原子/晶格 · 门口看 H/C/Ne/Ar/Og 标本柱！", 42, 462);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  _mkErlenmeyer(scale, liquidMat, glassMat, x, y, z) {
    const T = this.THREE;
    const g = new T.Group();
    g.position.set(x, y, z);
    const body = new T.Mesh(new T.CylinderGeometry(0.055 * scale, 0.18 * scale, 0.24 * scale, 16, 1, false), glassMat);
    body.position.y = 0.12 * scale;
    body.renderOrder = 2;
    const neck = new T.Mesh(new T.CylinderGeometry(0.052 * scale, 0.055 * scale, 0.14 * scale, 14), glassMat);
    neck.position.y = 0.30 * scale;
    neck.renderOrder = 2;
    const lip = new T.Mesh(new T.TorusGeometry(0.056 * scale, 0.011 * scale, 6, 16).rotateX(Math.PI / 2), glassMat);
    lip.position.y = 0.37 * scale;
    lip.renderOrder = 2;

    const liq = new T.Mesh(new T.CylinderGeometry(0.095 * scale, 0.165 * scale, 0.13 * scale, 16), liquidMat);
    liq.position.y = 0.072 * scale;
    liq.renderOrder = 1;
    g.add(liq, body, neck, lip);
    return { group: g, liquid: liq };
  }

  _buildMoleculeModels() {
    const T = this.THREE;
    const std = (hex, rough = 0.20, extra = {}) =>
      this.wrapMat(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }), { key: "plain" });

    const mC = std(0x28344e, 0.22, { metalness: 0.35, emissive: new T.Color(0.08, 0.14, 0.24), emissiveIntensity: 0.35 });
    const mDiamond = std(0xbef6ff, 0.08, { metalness: 0.25, emissive: new T.Color(0.22, 0.72, 0.96), emissiveIntensity: 0.65 });
    const mO = std(0xff4258, 0.20, { emissive: new T.Color(0.55, 0.08, 0.14), emissiveIntensity: 0.45 });
    const mH = std(0xf4faff, 0.16, { emissive: new T.Color(0.32, 0.42, 0.62), emissiveIntensity: 0.25 });
    const mCyan = std(0x4cf4ff, 0.14, { emissive: new T.Color(0.18, 0.84, 1.0), emissiveIntensity: 0.90 });
    const mPink = std(0xff78dc, 0.14, { emissive: new T.Color(0.92, 0.28, 0.78), emissiveIntensity: 0.90 });
    const mNeon = std(0xff6e42, 0.12, { emissive: new T.Color(1.0, 0.35, 0.14), emissiveIntensity: 1.05 });
    const mArgon = std(0xa876ff, 0.12, { emissive: new T.Color(0.58, 0.28, 1.0), emissiveIntensity: 1.05 });
    const mBond = std(0xd8e4f6, 0.30, { metalness: 0.4 });
    const mGold = std(0xffd466, 0.20, { metalness: 0.82, emissive: new T.Color(0.65, 0.45, 0.08), emissiveIntensity: 0.50 });

    const addAtom = (grp, x, y, z, r, mat) => {
      grp.add(this.mesh(new T.SphereGeometry(r, 14, 10), mat, x, y, z));
    };
    const addBond = (grp, a, b, rad = 0.025, mat = mBond) => {
      const va = new T.Vector3(...a), vb = new T.Vector3(...b);
      const dir = new T.Vector3().subVectors(vb, va);
      const len = dir.length();
      const cyl = new T.Mesh(new T.CylinderGeometry(rad, rad, len, 8), mat);
      cyl.position.copy(va).add(vb).multiplyScalar(0.5);
      cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      grp.add(cyl);
    };

    // 1) 6 C — Carbon Diamond Tetrahedral Crystal Lattice (Gemini 4 Carbon Flagship!)
    const gCarb = new T.Group();
    const ctr = [0, 0, 0];
    const tet = [
      [0.34, 0.34, 0.34],
      [-0.34, -0.34, 0.34],
      [-0.34, 0.34, -0.34],
      [0.34, -0.34, -0.34]
    ];
    addAtom(gCarb, ...ctr, 0.13, mGold);
    tet.forEach((v) => {
      addAtom(gCarb, ...v, 0.11, mDiamond);
      addBond(gCarb, ctr, v, 0.028, mGold);
      // Outer carbon tetrahedral tips
      const tip = [v[0] * 1.55, v[1] * 1.55, v[2] * 1.55];
      addAtom(gCarb, ...tip, 0.075, mC);
      addBond(gCarb, v, tip, 0.02, mBond);
    });
    // Wire-like outer cube edges hinting at diamond cubic unit cell
    gCarb.add(this.mesh(new T.OctahedronGeometry(0.56, 0), this.wrapMat(new T.MeshBasicMaterial({ color: 0x7ef2ff, wireframe: true, transparent: true, opacity: 0.32 }), { key: "plain" })));

    // 2) 10 Ne & 18 Ar — Noble Gas Full-Shell Bohr Electron Cloud (Neon Orange + Argon Violet!)
    const gNoble = new T.Group();
    addAtom(gNoble, 0, 0, 0, 0.17, mGold);
    const ring1 = new T.Group();
    ring1.add(this.mesh(new T.TorusGeometry(0.36, 0.015, 6, 32), mNeon));
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      addAtom(ring1, Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0, 0.055, mNeon);
    }
    const ring2 = new T.Group();
    ring2.rotation.set(0.65, 0.4, 0);
    ring2.add(this.mesh(new T.TorusGeometry(0.58, 0.014, 6, 40), mArgon));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addAtom(ring2, Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0, 0.050, i % 2 ? mNeon : mArgon);
    }
    gNoble.add(ring1, ring2);
    this.bohrRings.push(ring1, ring2);

    // 3) 1 H — Hydrogen & Hexagonal Ice I_h 6-Water Chair Ring!
    const gIce = new T.Group();
    const oPts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pt = [Math.cos(a) * 0.42, (i % 2 ? 0.09 : -0.09), Math.sin(a) * 0.42];
      oPts.push(pt);
      addAtom(gIce, ...pt, 0.105, mO);
      const hOut = [Math.cos(a) * 0.62, pt[1] + (i % 2 ? 0.12 : -0.12), Math.sin(a) * 0.62];
      addAtom(gIce, ...hOut, 0.062, mH);
      addBond(gIce, pt, hOut, 0.02, mBond);
    }
    for (let i = 0; i < 6; i++) {
      const a = oPts[i], b = oPts[(i + 1) % 6];
      const mid = [a[0] * 0.65 + b[0] * 0.35, a[1] * 0.65 + b[1] * 0.35, a[2] * 0.65 + b[2] * 0.35];
      addAtom(gIce, ...mid, 0.058, mH);
      addBond(gIce, a, mid, 0.022, mBond);
      addBond(gIce, mid, b, 0.015, mCyan);
    }

    // 4) Gemini Surfactant (Twin Hydrophilic Cat-Ear Heads + Spacer Bridge + Twin Carbon Tails!)
    const gGem = new T.Group();
    const hL = [-0.26, 0.18, 0], hR = [0.26, 0.18, 0];
    addAtom(gGem, ...hL, 0.135, mCyan);
    addAtom(gGem, ...hR, 0.135, mPink);
    const sp1 = [-0.09, 0.24, 0.03], sp2 = [0.09, 0.24, -0.03];
    addAtom(gGem, ...sp1, 0.068, mGold);
    addAtom(gGem, ...sp2, 0.068, mGold);
    addBond(gGem, hL, sp1, 0.030, mGold);
    addBond(gGem, sp1, sp2, 0.030, mGold);
    addBond(gGem, sp2, hR, 0.030, mGold);
    for (const [hx, hy, hz, mat] of [[...hL, mCyan], [...hR, mPink]]) {
      const e1 = [hx - 0.10, hy + 0.15, hz], e2 = [hx + 0.10, hy + 0.15, hz];
      addAtom(gGem, ...e1, 0.055, mH);
      addAtom(gGem, ...e2, 0.055, mH);
      addBond(gGem, [hx, hy, hz], e1, 0.02, mat);
      addBond(gGem, [hx, hy, hz], e2, 0.02, mat);
    }
    for (const side of [-1, 1]) {
      let prev = [side * 0.26, 0.18, 0];
      for (let k = 1; k <= 5; k++) {
        const cur = [side * (0.28 + (k % 2 ? 0.07 : -0.03)), 0.18 - k * 0.135, (k % 2 ? 0.04 : -0.04)];
        addAtom(gGem, ...cur, 0.062, mC);
        addBond(gGem, prev, cur, 0.024, mBond);
        prev = cur;
      }
    }

    const list = [gCarb, gNoble, gIce, gGem];
    list.forEach((grp, idx) => { grp.visible = idx === 0; });
    return list;
  }

  build() {
    const T = this.THREE;
    const { scene, world } = this.game;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.52, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const m = {
      stone: std(0xdbe2f0, 0.72),
      stoneDark: std(0x525d7a, 0.78),
      oak: std(0x9a6b44, 0.66),
      woodDark: std(0x4b3120, 0.76),
      granite: std(0x1f2538, 0.34, { metalness: 0.16 }),
      brass: std(0xe8bd62, 0.22, { metalness: 0.86 }),
      iron: std(0x30394d, 0.38, { metalness: 0.72 }),
      snow: std(0xf4f8ff, 0.76),
      indigo: std(0x1b2448, 0.44, { metalness: 0.28 }),
      roofTeal: std(0x1c6e8c, 0.42, { metalness: 0.18 }),
      cyanGlow: std(0x64f2ff, 0.12, { emissive: new T.Color(0.20, 0.84, 1.0), emissiveIntensity: 1.05 }),
      pinkGlow: std(0xff78dc, 0.12, { emissive: new T.Color(0.92, 0.28, 0.78), emissiveIntensity: 1.05 }),
      neonGlow: std(0xff7246, 0.12, { emissive: new T.Color(1.0, 0.34, 0.14), emissiveIntensity: 1.15 }),
      argonGlow: std(0xa876ff, 0.12, { emissive: new T.Color(0.56, 0.26, 1.0), emissiveIntensity: 1.15 }),
      emeraldGlow: std(0x42f59e, 0.12, { emissive: new T.Color(0.14, 0.86, 0.46), emissiveIntensity: 1.0 }),
      goldGlow: std(0xffd86b, 0.14, { emissive: new T.Color(1.0, 0.70, 0.18), emissiveIntensity: 1.15 }),
      glassPane: plain(new T.MeshStandardMaterial({
        color: 0xdaf6ff,
        roughness: 0.08,
        metalness: 0.10,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: T.DoubleSide
      })),
      flaskGlass: plain(new T.MeshStandardMaterial({
        color: 0xeafaff,
        roughness: 0.06,
        metalness: 0.12,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      }))
    };
    this.m = m;

    const root = new T.Group();
    root.name = "hajimi_chemlab";
    root.position.set(this.cx, this.baseY, this.cz);
    this.root = root;

    // =========================================================================
    // 1. WALKABLE STONE & OAK LABORATORY FLOOR (11.2m × 9.4m, deckH = 0.24m!)
    // =========================================================================
    const W = 11.2, D = 9.4, H = 4.4;
    const hw = W / 2, hd = D / 2;

    root.add(
      this.mesh(new T.BoxGeometry(W + 0.5, this.deckH + 0.5, D + 0.5), m.stoneDark, 0, (this.deckH - 0.5) / 2, 0),
      this.mesh(new T.BoxGeometry(W, 0.10, D), m.oak, 0, this.deckH - 0.05, 0)
    );
    const hexMat = plain(new T.MeshStandardMaterial({
      color: 0xdcc488,
      emissive: new T.Color(0.18, 0.42, 0.58),
      emissiveIntensity: 0.22,
      roughness: 0.38,
      metalness: 0.55,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }));
    root.add(
      this.mesh(new T.CylinderGeometry(1.75, 1.75, 0.02, 6), hexMat, 0, this.deckH + 0.008, 0.75),
      this.mesh(new T.TorusGeometry(1.18, 0.035, 6, 32).rotateX(Math.PI / 2), m.cyanGlow, 0, this.deckH + 0.016, 0.75)
    );

    const wx0 = this.cx - hw - 0.2, wx1 = this.cx + hw + 0.2;
    const wz0 = this.cz - hd - 0.2, wz1 = this.cz + hd + 0.2;
    world.platforms.push({
      test: (px, pz) => px >= wx0 && px <= wx1 && pz >= wz0 && pz <= wz1,
      y: () => this.deckY,
      wood: true
    });

    // =========================================================================
    // 2. VICTORIAN-STARLIGHT GLASS CONSERVATORY WALLS & GEMINI 4 SIGNBOARD!
    // =========================================================================
    const wainscotH = 1.25;
    const addGlassWall = (x, z, len, rotY) => {
      const wg = new T.Group();
      wg.position.set(x, this.deckH, z);
      wg.rotation.y = rotY;
      wg.add(
        this.mesh(new T.BoxGeometry(len, wainscotH, 0.26), m.stone, 0, wainscotH / 2, 0),
        this.mesh(new T.BoxGeometry(len + 0.06, 0.08, 0.32), m.brass, 0, wainscotH + 0.04, 0),
        this.mesh(new T.BoxGeometry(len, 0.18, 0.28), m.indigo, 0, H - 0.09, 0)
      );
      const pane = this.mesh(new T.BoxGeometry(len - 0.16, H - wainscotH - 0.24, 0.06), m.glassPane, 0, wainscotH + (H - wainscotH) / 2, 0);
      pane.renderOrder = 3;
      wg.add(pane);
      const nMul = Math.max(1, Math.round(len / 2.2) - 1);
      for (let i = 1; i <= nMul; i++) {
        const mx = -len / 2 + (len * i) / (nMul + 1);
        wg.add(this.mesh(new T.BoxGeometry(0.08, H - wainscotH - 0.12, 0.12), m.brass, mx, wainscotH + (H - wainscotH) / 2, 0));
      }
      root.add(wg);
    };

    addGlassWall(0, -hd + 0.13, W - 0.2, 0);
    addGlassWall(-hw + 0.13, 0, D - 0.2, Math.PI / 2);
    addGlassWall(hw - 0.13, 0, D - 0.2, Math.PI / 2);
    addGlassWall(-4.05, hd - 0.13, 3.0, 0);
    addGlassWall(4.05, hd - 0.13, 3.0, 0);

    world.boxes.push(
      { x0: this.cx - hw, x1: this.cx + hw, z0: this.cz - hd, z1: this.cz - hd + 0.36, h: 6 },
      { x0: this.cx - hw, x1: this.cx - hw + 0.36, z0: this.cz - hd, z1: this.cz + hd, h: 6 },
      { x0: this.cx + hw - 0.36, x1: this.cx + hw, z0: this.cz - hd, z1: this.cz + hd, h: 6 },
      { x0: this.cx - hw, x1: this.cx - 2.55, z0: this.cz + hd - 0.36, z1: this.cz + hd, h: 6 },
      { x0: this.cx + 2.55, x1: this.cx + hw, z0: this.cz + hd - 0.36, z1: this.cz + hd, h: 6 }
    );

    for (const [px, pz] of [[-hw + 0.18, -hd + 0.18], [hw - 0.18, -hd + 0.18], [-hw + 0.18, hd - 0.18], [hw - 0.18, hd - 0.18], [-2.55, hd - 0.18], [2.55, hd - 0.18]]) {
      root.add(
        this.mesh(new T.BoxGeometry(0.40, H + 0.1, 0.40), m.stone, px, this.deckH + H / 2, pz),
        this.mesh(new T.BoxGeometry(0.46, 0.12, 0.46), m.brass, px, this.deckH + H, pz)
      );
    }

    const signTex = this._makeSignTex("⚗️ 哈基米元素周期表化学实验室 ⚗️", "Gemini 4 · 1 H · 6 C · 10 Ne · 18 Ar → 在线催更 118 Og!");
    const signMat = plain(new T.MeshStandardMaterial({ map: signTex, roughness: 0.25, emissive: new T.Color(0.22, 0.36, 0.56), emissiveMap: signTex, emissiveIntensity: 0.58 }));
    const roofBaseY = this.deckH + H;
    root.add(
      // Raised cleanly above the snow-capped eave so both signboard lines are 100% unobstructed from ground view!
      this.mesh(new T.BoxGeometry(5.3, 1.20, 0.16), [m.brass, m.brass, m.snow, m.brass, signMat, signMat], 0, roofBaseY + 0.98, hd + 0.24),
      this.mesh(new T.BoxGeometry(0.10, 0.36, 0.10), m.brass, -1.85, roofBaseY + 0.34, hd + 0.24),
      this.mesh(new T.BoxGeometry(0.10, 0.36, 0.10), m.brass, 1.85, roofBaseY + 0.34, hd + 0.24)
    );
    // Entrance Neon (orange-red) & Argon (electric violet) real noble-gas discharge lanterns!
    for (const sx of [-2.55, 2.55]) {
      root.add(
        this.mesh(new T.CylinderGeometry(0.03, 0.03, 0.32, 8), m.brass, sx, this.deckH + 3.25, hd + 0.36),
        this.mesh(new T.OctahedronGeometry(0.18, 1), sx < 0 ? m.neonGlow : m.argonGlow, sx, this.deckH + 3.05, hd + 0.36)
      );
    }

    // Non-overlapping roof eaves (E/W eaves butt neatly between N/S eaves -> zero corner Z-fighting!)
    const ewEaveLen = D - 0.52;
    root.add(
      this.mesh(new T.BoxGeometry(W + 0.8, 0.22, 0.72), m.roofTeal, 0, roofBaseY + 0.11, -hd - 0.1),
      this.mesh(new T.BoxGeometry(W + 0.8, 0.22, 0.72), m.roofTeal, 0, roofBaseY + 0.11, hd + 0.1),
      this.mesh(new T.BoxGeometry(0.72, 0.22, ewEaveLen), m.roofTeal, -hw - 0.04, roofBaseY + 0.11, 0),
      this.mesh(new T.BoxGeometry(0.72, 0.22, ewEaveLen), m.roofTeal, hw + 0.04, roofBaseY + 0.11, 0),
      this.mesh(new T.BoxGeometry(W + 0.86, 0.10, 0.76), m.snow, 0, roofBaseY + 0.26, -hd - 0.1),
      this.mesh(new T.BoxGeometry(W + 0.86, 0.10, 0.76), m.snow, 0, roofBaseY + 0.26, hd + 0.1),
      this.mesh(new T.BoxGeometry(0.76, 0.10, ewEaveLen - 0.04), m.snow, -hw - 0.04, roofBaseY + 0.26, 0),
      this.mesh(new T.BoxGeometry(0.76, 0.10, ewEaveLen - 0.04), m.snow, hw + 0.04, roofBaseY + 0.26, 0),
      this.mesh(new T.ConeGeometry(6.6, 2.55, 4).rotateY(Math.PI / 4), m.glassPane, 0, roofBaseY + 1.38, 0),
      this.mesh(new T.TorusGeometry(1.15, 0.08, 8, 24).rotateX(Math.PI / 2), m.brass, 0, roofBaseY + 2.55, 0),
      this.mesh(new T.CylinderGeometry(0.06, 0.09, 1.45, 10), m.brass, 0, roofBaseY + 3.25, 0)
    );
    const spireMol = new T.Group();
    spireMol.position.set(0, roofBaseY + 4.25, 0);
    spireMol.add(this.mesh(new T.TorusGeometry(0.72, 0.065, 8, 6), m.brass, 0, 0, 0));
    spireMol.add(this.mesh(new T.TorusGeometry(0.42, 0.045, 8, 28), m.cyanGlow, 0, 0, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dotMat = [m.cyanGlow, m.goldGlow, m.neonGlow, m.argonGlow, m.pinkGlow, m.emeraldGlow][i];
      spireMol.add(this.mesh(new T.SphereGeometry(0.14, 10, 8), dotMat, Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0));
    }
    root.add(spireMol);
    this.spinners.push({ obj: spireMol, speed: 0.75 });

    // =========================================================================
    // 3. GEMINI 4 ELEMENT FAMILY GLOWING SPECIMEN SHOWCASE (1 H · 6 C · 10 Ne · 18 Ar · 118 Og!)
    //    Angled along the East-South gallery (x = +3.85, z = +2.55) with full wall & walkway clearance!
    // =========================================================================
    const showG = new T.Group();
    showG.position.set(3.85, this.deckH, 2.55);
    showG.rotation.y = -Math.PI * 0.30;
    showG.add(
      this.mesh(new T.BoxGeometry(2.95, 0.84, 0.74), m.indigo, 0, 0.42, 0),
      this.mesh(new T.BoxGeometry(3.05, 0.08, 0.82), m.brass, 0, 0.86, 0)
    );

    const specDefs = [
      { num: "1",   sym: "H",  sub: "氢·极速",  hex: "#4ef4ff", mat: m.cyanGlow,  kind: "tube" },
      { num: "6",   sym: "C",  sub: "碳·旗舰",  hex: "#ffd85a", mat: m.goldGlow,  kind: "diamond" },
      { num: "10",  sym: "Ne", sub: "氖·甜点",  hex: "#ff6e48", mat: m.neonGlow,  kind: "tube" },
      { num: "18",  sym: "Ar", sub: "氩·工程",  hex: "#a87aff", mat: m.argonGlow, kind: "tube" },
      { num: "118", sym: "Og", sub: "鿫·催更!", hex: "#ff5ec8", mat: m.pinkGlow,  kind: "mystery" }
    ];
    specDefs.forEach((sp, i) => {
      const sx = -1.12 + i * 0.56;
      // Front glowing element plaque on the cabinet face!
      const bTex = this._makeBadgeTex(sp.num, sp.sym, sp.sub, sp.hex);
      const bMat = plain(new T.MeshStandardMaterial({ map: bTex, roughness: 0.25, emissive: new T.Color(0.25, 0.25, 0.35), emissiveMap: bTex, emissiveIntensity: 0.48 }));
      showG.add(this.mesh(new T.PlaneGeometry(0.46, 0.46), bMat, sx, 0.46, 0.385));

      // Glass display bell-jar cylinder sitting cleanly on the brass top!
      const jar = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.72, 16), m.flaskGlass);
      jar.position.set(sx, 1.26, 0);
      jar.renderOrder = 2;
      showG.add(
        this.mesh(new T.CylinderGeometry(0.20, 0.22, 0.06, 16), m.brass, sx, 0.92, 0),
        this.mesh(new T.CylinderGeometry(0.20, 0.20, 0.05, 16), m.brass, sx, 1.63, 0),
        jar
      );

      // Glowing element core inside each jar!
      if (sp.kind === "diamond") {
        const dia = this.mesh(new T.OctahedronGeometry(0.11, 0), sp.mat, sx, 1.26, 0);
        dia.renderOrder = 1;
        showG.add(dia);
        this.spinners.push({ obj: dia, speed: 1.4 });
        this.specimenTubes.push({ obj: dia, ph: i });
      } else if (sp.kind === "mystery") {
        // 118 Og (Oganesson) empty containment ring with tiny pulsing mystery spark waiting for release!
        const orb = this.mesh(new T.OctahedronGeometry(0.065, 0), sp.mat, sx, 1.26, 0);
        orb.renderOrder = 1;
        showG.add(orb);
        this.ogOrb = orb;
        this.specimenTubes.push({ obj: orb, ph: i });
      } else {
        // Real Noble Gas / Hydrogen Glowing Plasma Discharge Tube!
        const tube = this.mesh(new T.CylinderGeometry(0.055, 0.055, 0.56, 12), sp.mat, sx, 1.26, 0);
        tube.renderOrder = 1;
        showG.add(tube);
        this.specimenTubes.push({ obj: tube, ph: i });
      }
    });

    root.add(showG);
    // 3 snug circles hugging the 2.95×0.74m angled showcase so players can step right up to read every badge
    world.circles.push(
      { x: this.cx + 3.39, z: this.cz + 1.92, r: 0.60, top: this.deckH + 1.05 },
      { x: this.cx + 3.85, z: this.cz + 2.55, r: 0.62, top: this.deckH + 1.05 },
      { x: this.cx + 4.31, z: this.cz + 3.18, r: 0.60, top: this.deckH + 1.05 }
    );
    // Exact world coordinates of the 5th specimen jar (118 Og) so the particle burst erupts straight out of it!
    this.ogWorldPos.set(this.cx + 4.51, this.deckY + 1.45, this.cz + 3.46);
    world.spots.push({
      id: "chemlab_specimens",
      pos: new T.Vector3(this.cx + 3.15, this.deckY + 1.15, this.cz + 2.55),
      r: 2.75,
      label: () => `参观 Gemini 4 元素标本柱（H/C/Ne/Ar · 催更 118 Og！）`,
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.inspectSpecimen()
    });

    // =========================================================================
    // 4. STATION 1 — CENTRAL REAGENT SYNTHESIS WORKBENCH & BUNSEN BURNER!
    // =========================================================================
    const benchZ = -1.65;
    const benchTop = this.deckH + 0.96;
    const benchG = new T.Group();
    benchG.position.set(0, this.deckH, benchZ);
    benchG.add(
      this.mesh(new T.BoxGeometry(4.2, 0.88, 1.32), m.woodDark, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(4.42, 0.10, 1.46), m.granite, 0, 0.92, 0),
      this.mesh(new T.BoxGeometry(4.46, 0.04, 1.50), m.brass, 0, 0.87, 0)
    );

    benchG.add(
      this._mkErlenmeyer(1.05, m.cyanGlow, m.flaskGlass, -1.55, 0.97, -0.18).group,
      this._mkErlenmeyer(0.95, m.neonGlow, m.flaskGlass, -1.12, 0.97, 0.14).group,
      this._mkErlenmeyer(1.00, m.argonGlow, m.flaskGlass, 1.18, 0.97, 0.10).group,
      this._mkErlenmeyer(1.10, m.goldGlow, m.flaskGlass, 1.62, 0.97, -0.15).group
    );

    benchG.add(
      this.mesh(new T.BoxGeometry(0.46, 0.04, 0.36), m.iron, 0, 0.99, -0.18),
      this.mesh(new T.CylinderGeometry(0.022, 0.022, 1.05, 8), m.iron, -0.18, 1.50, -0.26),
      this.mesh(new T.TorusGeometry(0.15, 0.015, 6, 18).rotateX(Math.PI / 2), m.brass, 0, 1.30, -0.02),
      this.mesh(new T.CylinderGeometry(0.014, 0.014, 0.24, 6).rotateZ(Math.PI / 2), m.brass, -0.09, 1.30, -0.14),
      this.mesh(new T.CylinderGeometry(0.09, 0.12, 0.06, 12), m.iron, 0, 1.00, -0.02),
      this.mesh(new T.CylinderGeometry(0.026, 0.030, 0.20, 10), m.brass, 0, 1.12, -0.02)
    );

    this.reactionLiquidMat = plain(new T.MeshStandardMaterial({
      color: 0xff6a3d,
      emissive: new T.Color(0xff6a3d),
      emissiveIntensity: 1.0,
      roughness: 0.10
    }));
    const mainFlask = this._mkErlenmeyer(1.38, this.reactionLiquidMat, m.flaskGlass, 0, 1.28, -0.02);
    this.reactionLiquid = mainFlask.liquid;
    benchG.add(mainFlask.group);

    this.burnerFlameMat = plain(new T.MeshBasicMaterial({
      color: 0x9b6cff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    }));
    this.burnerFlame = new T.Mesh(new T.ConeGeometry(0.048, 0.16, 10), this.burnerFlameMat);
    this.burnerFlame.position.set(0, 1.26, -0.02);
    this.burnerFlame.renderOrder = 4;
    benchG.add(this.burnerFlame);

    this.foamMat = plain(new T.MeshStandardMaterial({
      color: 0xffc6ec,
      emissive: new T.Color(0.85, 0.32, 0.68),
      emissiveIntensity: 0.42,
      roughness: 0.48
    }));
    const foamG = new T.Group();
    foamG.position.set(0, 1.80, -0.02);
    for (let k = 0; k < 5; k++) {
      foamG.add(this.mesh(new T.SphereGeometry(0.11 + (k % 2) * 0.04, 10, 8), this.foamMat, Math.sin(k * 1.7) * 0.06, k * 0.14, Math.cos(k * 1.7) * 0.06));
    }
    foamG.visible = false;
    this.foamMesh = foamG;
    benchG.add(foamG);

    const condCurve = new T.CatmullRomCurve3([
      new T.Vector3(0.0, 1.80, -0.02),
      new T.Vector3(0.32, 2.02, -0.05),
      new T.Vector3(0.72, 1.62, -0.05),
      new T.Vector3(0.88, 1.24, -0.02)
    ]);
    const condTube = new T.Mesh(new T.TubeGeometry(condCurve, 22, 0.026, 8, false), m.flaskGlass);
    condTube.renderOrder = 2;
    benchG.add(condTube);
    benchG.add(this._mkErlenmeyer(0.85, m.goldGlow, m.flaskGlass, 0.88, 0.97, -0.02).group);

    const bubGeo = new T.SphereGeometry(0.12, 12, 10);
    for (let i = 0; i < 12; i++) {
      const bm = plain(new T.MeshStandardMaterial({
        color: i % 2 ? 0x9cf6ff : 0xffb4eb,
        emissive: new T.Color(i % 2 ? 0x26c8ff : 0xff58c8),
        emissiveIntensity: 0.55,
        roughness: 0.06,
        metalness: 0.15,
        transparent: true,
        opacity: 0.56,
        depthWrite: false
      }));
      const bs = new T.Mesh(bubGeo, bm);
      bs.visible = false;
      bs.renderOrder = 5;
      root.add(bs);
      this.bubbles.push({ mesh: bs, vx: 0, vy: 0, vz: 0, life: 0, ph: i * 1.1 });
    }

    root.add(benchG);
    world.boxes.push({
      x0: this.cx - 2.25, x1: this.cx + 2.25,
      z0: this.cz + benchZ - 0.78, z1: this.cz + benchZ + 0.78,
      h: this.deckH + 1.02
    });

    this.benchWorldPos.set(this.cx, benchTop + 0.8, this.cz + benchZ);
    world.spots.push({
      id: "chemlab_experiment",
      pos: new T.Vector3(this.cx, this.deckY + 1.15, this.cz + benchZ + 0.75),
      r: 2.8,
      label: () => `做化学实验：${EXPERIMENTS[this.expIdx].name}`,
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.runExperiment()
    });

    // =========================================================================
    // 5. STATION 2 — 3D ATOMIC & CRYSTAL HOLO-PEDESTAL (East Wing: x = +3.55, z = -0.35)
    // =========================================================================
    const mx = 3.55, mz = -0.35;
    const pedG = new T.Group();
    pedG.position.set(mx, this.deckH, mz);
    pedG.add(
      this.mesh(new T.CylinderGeometry(0.62, 0.76, 0.96, 16), m.indigo, 0, 0.48, 0),
      this.mesh(new T.TorusGeometry(0.64, 0.045, 8, 24).rotateX(Math.PI / 2), m.brass, 0, 0.96, 0),
      this.mesh(new T.TorusGeometry(0.50, 0.032, 8, 24).rotateX(Math.PI / 2), m.cyanGlow, 0, 1.00, 0)
    );
    const molPivot = new T.Group();
    molPivot.position.set(0, 1.85, 0);
    this.moleculeGroups = this._buildMoleculeModels();
    for (const mg of this.moleculeGroups) molPivot.add(mg);
    this.moleculePivot = molPivot;
    pedG.add(molPivot);
    root.add(pedG);

    world.circles.push({ x: this.cx + mx, z: this.cz + mz, r: 0.78, top: this.deckH + 1.05 });
    world.spots.push({
      id: "chemlab_molecule",
      pos: new T.Vector3(this.cx + mx, this.deckY + 1.2, this.cz + mz),
      r: 2.5,
      label: () => `切换 3D 分子/晶格（当前：${MOLECULE_INFO[this.molIdx].name}）`,
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.cycleMolecule()
    });

    // =========================================================================
    // 6. STATION 3 — GEMINI 4 PERIODIC TABLE (West) & MEME CHALKBOARD (North)!
    // =========================================================================
    const ptTex = this._makePeriodicTableTex();
    const ptMat = plain(new T.MeshStandardMaterial({ map: ptTex, roughness: 0.35, emissive: new T.Color(0.22, 0.32, 0.52), emissiveMap: ptTex, emissiveIntensity: 0.45 }));
    root.add(this.mesh(new T.BoxGeometry(0.10, 2.05, 4.10), [ptMat, m.woodDark, m.woodDark, m.woodDark, m.woodDark, m.woodDark], -hw + 0.34, this.deckH + 2.48, -0.35));

    const cbTex = this._makeChalkboardTex();
    const cbMat = plain(new T.MeshStandardMaterial({ map: cbTex, roughness: 0.75, emissive: new T.Color(0.14, 0.22, 0.20), emissiveMap: cbTex, emissiveIntensity: 0.26 }));
    root.add(this.mesh(new T.BoxGeometry(4.50, 2.15, 0.10), [m.oak, m.oak, m.oak, m.oak, cbMat, m.oak], 0, this.deckH + 2.52, -hd + 0.34));

    world.spots.push({
      id: "chemlab_notes",
      pos: new T.Vector3(this.cx - hw + 1.15, this.deckY + 1.25, this.cz - 0.35),
      r: 2.6,
      label: "翻看「Gemini 4 元素周期表 & 化学圈热梗笔记」",
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => {
        this._playLabSound("holo");
        this.game.ui && this.game.ui.toast(CHEM_NOTES[this.noteIdx++ % CHEM_NOTES.length], 8.0);
      }
    });

    // =========================================================================
    // 7. STATION 4 — MICROSCOPE DESK, RAINBOW TEST-TUBES & pH COLOR-CHANGING ELIXIR!
    // =========================================================================
    const wx = -3.35, wz = 1.65;
    const deskG = new T.Group();
    deskG.position.set(wx, this.deckH, wz);
    deskG.rotation.y = Math.PI * 0.35;
    deskG.add(
      this.mesh(new T.BoxGeometry(2.15, 0.86, 0.96), m.woodDark, 0, 0.43, 0),
      this.mesh(new T.BoxGeometry(2.26, 0.08, 1.06), m.granite, 0, 0.89, 0)
    );

    const micG = new T.Group();
    micG.position.set(-0.62, 0.93, 0);
    micG.add(
      this.mesh(new T.BoxGeometry(0.24, 0.05, 0.30), m.iron, 0, 0.025, 0),
      this.mesh(new T.CylinderGeometry(0.032, 0.04, 0.34, 10), m.brass, 0, 0.22, -0.09),
      this.mesh(new T.BoxGeometry(0.20, 0.025, 0.18), m.iron, 0, 0.20, 0.04),
      this.mesh(new T.BoxGeometry(0.10, 0.01, 0.05), m.cyanGlow, 0, 0.22, 0.04),
      this.mesh(new T.CylinderGeometry(0.028, 0.036, 0.32, 12), m.brass, 0, 0.38, 0.04)
    );
    micG.children[4].rotation.x = 0.28;
    deskG.add(micG);

    const rackG = new T.Group();
    rackG.position.set(0.08, 0.93, -0.14);
    rackG.add(
      this.mesh(new T.BoxGeometry(0.76, 0.04, 0.18), m.oak, 0, 0.02, 0),
      this.mesh(new T.BoxGeometry(0.76, 0.03, 0.16), m.oak, 0, 0.22, 0),
      this.mesh(new T.BoxGeometry(0.04, 0.24, 0.16), m.oak, -0.36, 0.12, 0),
      this.mesh(new T.BoxGeometry(0.04, 0.24, 0.16), m.oak, 0.36, 0.12, 0)
    );
    const tubeMats = [m.cyanGlow, m.goldGlow, m.neonGlow, m.argonGlow, m.pinkGlow, m.emeraldGlow];
    for (let i = 0; i < 6; i++) {
      const tx = -0.25 + i * 0.10;
      const tTube = new T.Mesh(new T.CylinderGeometry(0.026, 0.026, 0.34, 10), m.flaskGlass);
      tTube.position.set(tx, 0.20, 0);
      tTube.renderOrder = 2;
      const tLiq = new T.Mesh(new T.CylinderGeometry(0.021, 0.021, 0.19, 10), tubeMats[i]);
      tLiq.position.set(tx, 0.13, 0);
      tLiq.renderOrder = 1;
      rackG.add(tLiq, tTube);
    }
    deskG.add(rackG);

    this.elixirMat = plain(new T.MeshStandardMaterial({
      color: 0x3a9cff,
      emissive: new T.Color(0x1e6cff),
      emissiveIntensity: 0.9,
      roughness: 0.10
    }));
    const elixir = this._mkErlenmeyer(1.08, this.elixirMat, m.flaskGlass, 0.72, 0.93, 0.08);
    this.elixirLiquid = elixir.liquid;
    deskG.add(elixir.group);
    root.add(deskG);

    world.circles.push({ x: this.cx + wx, z: this.cz + wz, r: 1.05, top: this.deckH + 0.98 });
    world.spots.push({
      id: "chemlab_elixir",
      pos: new T.Vector3(this.cx + wx + 0.3, this.deckY + 1.1, this.cz + wz + 0.2),
      r: 2.5,
      label: () => (this.elixirPink ? "滴入星光小苏打 · 变回梦幻蝶豆花蓝！" : "滴入柠檬汁试喝「变色星光花青素热饮」（满格回温）"),
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.sipColorElixir()
    });

    this._addLight(this.cx, this.deckY + 3.2, this.cz - 0.8, 0xb8f4ff, 14, 20);
    this._addLight(this.cx, this.deckY + 2.8, this.cz + hd + 0.6, 0xffd699, 10, 16);

    scene.add(root);

    if (this.game.explore && this.game.explore.sites) {
      if (!this.game.explore.sites.some((s) => s.id === "chemlab")) {
        this.game.explore.sites.push({
          id: "chemlab",
          name: "哈基米元素化学实验室",
          x: this.cx,
          z: this.cz,
          r: 13
        });
        this.game.logic && this.game.logic.count("places", this.game.explore.found || 0, this.game.explore.sites.length);
      }
    }

    return this;
  }

  inspectSpecimen() {
    const idx = this.specIdx % SPECIMEN_LINES.length;
    this.specIdx++;
    this._playLabSound("spark");
    if (idx === 4) {
      this.ogBoostT = 2.6;
      this.game.puffs && this.game.puffs.burst(this.ogWorldPos, 24, 2.2, 0.14, 1.0, 0.9);
      this.game.character?.play("cheer");
    }
    this.game.ui && this.game.ui.toast(SPECIMEN_LINES[idx], 7.0);
  }

  runExperiment() {
    const exp = EXPERIMENTS[this.expIdx];
    this.expIdx = (this.expIdx + 1) % EXPERIMENTS.length;
    this.expMode = exp.mode;
    this.expTimer = 5.5;
    this.sparkAcc = 0;

    if (this.reactionLiquidMat) {
      this.reactionLiquidMat.color.setHex(exp.liquidColor);
      this.reactionLiquidMat.emissive.setHex(exp.liquidColor);
      this.reactionLiquidMat.emissiveIntensity = 1.45;
    }
    if (this.burnerFlameMat) {
      this.burnerFlameMat.color.setHex(exp.flameColor);
    }

    if (exp.mode === "bubbles") {
      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        b.mesh.visible = true;
        b.mesh.position.set((Math.random() - 0.5) * 0.4, this.deckH + 1.85 + Math.random() * 0.3, -1.65 + (Math.random() - 0.5) * 0.35);
        b.mesh.scale.setScalar(0.65 + Math.random() * 0.9);
        b.vx = (Math.random() - 0.5) * 0.85;
        b.vy = 0.55 + Math.random() * 0.65;
        b.vz = (Math.random() - 0.5) * 0.85;
        b.life = 4.2 + Math.random() * 1.8;
      }
    }

    if (exp.mode === "aroma" || exp.mode === "crystal") {
      this.game.cold && (this.game.cold.w = Math.min(100, this.game.cold.w + 35), this.game.cold.wet = 0);
    }

    this._playLabSound("fizz");
    this.game.character?.play("cheer");
    this.game.ui && this.game.ui.toast(exp.toast, 7.0);
  }

  cycleMolecule() {
    this.molIdx = (this.molIdx + 1) % this.moleculeGroups.length;
    this.moleculeGroups.forEach((grp, idx) => { grp.visible = idx === this.molIdx; });
    this._playLabSound("holo");
    this.game.ui && this.game.ui.toast(MOLECULE_INFO[this.molIdx].toast, 7.0);
  }

  sipColorElixir() {
    this.elixirPink = !this.elixirPink;
    const hex = this.elixirPink ? 0xff66cc : 0x3a9cff;
    if (this.elixirMat) {
      this.elixirMat.color.setHex(hex);
      this.elixirMat.emissive.setHex(hex);
    }
    this._playLabSound("sip");
    this.game.cold && (this.game.cold.w = 100, this.game.cold.wet = 0);
    this.game.character?.play("happy");
    this.game.ui && this.game.ui.toast(
      this.elixirPink
        ? "🍋 柠檬酸降低了 pH！蝶豆花花青素瞬间从深蓝变成樱花粉，酸甜暖胃回满体温喵～"
        : "🫧 滴入一点点小苏打回升 pH，花青素魔法般变回星穹蔚蓝色啦，酸碱指示剂极其极其好玩喵！",
      6.0
    );
  }

  update(dt, time) {
    if (!this.root) return;
    const g = this.game;

    for (const sp of this.spinners) {
      sp.obj.rotation.y = time * sp.speed;
    }
    if (this.moleculePivot) {
      this.moleculePivot.rotation.y = time * 0.95;
      this.moleculePivot.position.y = 1.85 + Math.sin(time * 2.1) * 0.08;
    }
    if (this.bohrRings.length >= 2) {
      this.bohrRings[0].rotation.z = time * 2.4;
      this.bohrRings[1].rotation.z = -time * 1.6;
    }
    if (this.ogOrb) {
      if (this.ogBoostT > 0) this.ogBoostT = Math.max(0, this.ogBoostT - dt);
      const boost = 1 + this.ogBoostT * 0.55;
      this.ogOrb.rotation.y = time * (2.2 + this.ogBoostT * 4.5);
      this.ogOrb.rotation.x = time * 1.5;
      this.ogOrb.scale.setScalar(boost * (0.9 + 0.18 * Math.sin(time * 5.2)));
    }

    if (this.burnerFlame) {
      const boost = this.expTimer > 0 && this.expMode === "flame" ? 1.85 : 1.0;
      const flick = 0.88 + 0.18 * Math.sin(time * 24) + 0.08 * Math.cos(time * 37);
      this.burnerFlame.scale.set(boost * (0.95 + 0.1 * Math.sin(time * 19)), boost * flick, boost);
      if (this.expTimer > 0 && this.expMode === "flame" && this.burnerFlameMat) {
        const pal = [0xff6a3d, 0xa876ff, 0x4ef4ff, 0xffd85a];
        this.burnerFlameMat.color.setHex(pal[Math.floor(time * 3.8) % pal.length]);
      }
    }

    if (this.expTimer > 0) {
      this.expTimer = Math.max(0, this.expTimer - dt);
      if (this.foamMesh) {
        const showFoam = this.expMode === "foam" && this.expTimer > 0.2;
        this.foamMesh.visible = showFoam;
        if (showFoam) {
          const rise = Math.min(1, (5.5 - this.expTimer) * 2.2) * Math.min(1, this.expTimer * 0.8);
          this.foamMesh.scale.set(0.75 + 0.45 * rise, 0.25 + 1.15 * rise, 0.75 + 0.45 * rise);
        }
      }
      if (g.puffs && dt > 0) {
        this.sparkAcc += dt * (this.expMode === "flame" ? 26 : 16);
        while (this.sparkAcc >= 1) {
          this.sparkAcc -= 1;
          const p = this.benchWorldPos;
          let r = 0.35, gr = 0.95, b = 1.0;
          if (this.expMode === "flame") {
            const c = [[1.0, 0.42, 0.24], [0.66, 0.46, 1.0], [0.30, 0.95, 1.0], [1.0, 0.85, 0.35]][Math.floor(Math.random() * 4)];
            [r, gr, b] = c;
          } else if (this.expMode === "foam") {
            [r, gr, b] = [1.0, 0.65, 0.90];
          } else if (this.expMode === "aroma") {
            const c = [[1.0, 0.82, 0.38], [0.92, 0.45, 1.0]][Math.floor(Math.random() * 2)];
            [r, gr, b] = c;
          }
          g.puffs.spawn(
            p.x + (Math.random() - 0.5) * 0.28,
            p.y + 0.15,
            p.z + (Math.random() - 0.5) * 0.28,
            (Math.random() - 0.5) * 0.85,
            1.15 + Math.random() * 1.1,
            (Math.random() - 0.5) * 0.85,
            0.09 + Math.random() * 0.08,
            0.9,
            0.85 + Math.random() * 0.45,
            r, gr, b, -0.1, 1.1
          );
        }
      }
    } else if (this.foamMesh && this.foamMesh.visible) {
      this.foamMesh.visible = false;
    }

    for (const b of this.bubbles) {
      if (b.life <= 0) continue;
      b.life -= dt;
      if (b.life <= 0) {
        b.mesh.visible = false;
        continue;
      }
      b.mesh.position.x += (b.vx + Math.sin(time * 2.2 + b.ph) * 0.18) * dt;
      b.mesh.position.y += b.vy * dt;
      b.mesh.position.z += (b.vz + Math.cos(time * 1.9 + b.ph) * 0.18) * dt;
      b.mesh.material.opacity = Math.min(0.62, b.life * 0.35);
    }

    const lamps = g.env && g.env.state ? g.env.state.lamps : 0.35;
    for (const item of this.lights) {
      item.l.intensity = item.base * (0.45 + 0.85 * lamps);
    }
  }
}
