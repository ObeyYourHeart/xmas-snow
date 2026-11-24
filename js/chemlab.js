// 哈基米星穹化学实验室 · Hajimi's Starlight Chemistry Laboratory
// Located in the scenic southeast snowy glade at (76, 102), a short stroll from 哈基米星猫小窝!
// Features:
// 1) Open-front Victorian-Starlight glass conservatory laboratory with cat-ear Erlenmeyer crest & spinning benzene spire,
// 2) Interactive Reagent Synthesis & Bunsen Burner Bench (5 real chemistry experiments with live 3D foam/bubbles/flames!),
// 3) Interactive 3D CPK Ball-and-Stick Molecular Holo-Pedestal (Ice Ih Ring, Gemini Surfactant, Benzene, Theobromine),
// 4) High-res Periodic Table Wall (highlighting Ge/C/H/O/N/Cu/Au) & Chalkboard with interactive chemistry lore notes,
// 5) Compound Microscope Desk, Rainbow Indicator Test-Tube Rack & Butterfly-Pea pH Color-Changing Winter Elixir!

const EXPERIMENTS = [
  {
    id: "gemini_surf",
    name: "双子表面活性剂 · 极光星云泡泡",
    formula: "Gemini Surfactant (C₁₂-s-C₁₂) · 极低 CMC 胶束自组装",
    liquidColor: 0x56f0ff,
    flameColor: 0x62f2ff,
    toast: "⚗️ 双子表面活性剂 (Gemini Surfactant) 合成成功！两颗亲水猫头+两条疏水尾巴手拉手，吹出满屋极光星云泡泡喵～",
    mode: "bubbles"
  },
  {
    id: "flame_test",
    name: "圣诞金属离子焰色反应",
    formula: "Cu²⁺(翠绿) · Sr²⁺(绯红) · K⁺(丁香紫) · Na⁺(暖金)",
    liquidColor: 0x36f598,
    flameColor: 0x24ff88,
    toast: "🔥 圣诞焰色反应点火！Cu²⁺ 翠绿、Sr²⁺ 绯红、K⁺ 丁香紫——金属电子跃迁回落放出极其绚丽的冬夜光谱喵！",
    mode: "flame"
  },
  {
    id: "elephant",
    name: "大象牙膏催化雪山爆发",
    formula: "2 H₂O₂ —[KI 催化]→ 2 H₂O + O₂↑ + 暖呼呼星雪泡沫",
    liquidColor: 0xff78d4,
    flameColor: 0xff78d4,
    toast: "🌋 碘化钾催化过氧化氢瞬间分解！暖呼呼的樱粉大象牙膏泡沫喷泉冲起来啦，极其极其解压喵～",
    mode: "foam"
  },
  {
    id: "ice_ih",
    name: "六方冰 I_h 氢键雪晶析出",
    formula: "6 H₂O(l) —[氢键定向]→ 六角星雪晶格 (Ice I_h)",
    liquidColor: 0x92e6ff,
    flameColor: 0x80f0ff,
    toast: "❄️ 水分子沿着 109.5° 氢键迅速排成完美六方冰 I_h 晶格，析出亮晶晶的极光雪晶啦喵！",
    mode: "crystal"
  },
  {
    id: "maillard",
    name: "美拉德反应 · 黄金烤小鱼干香精",
    formula: "还原糖 + 氨基酸 —[150℃]→ 焦香吡嗪风味分子",
    liquidColor: 0xffb84a,
    flameColor: 0xffaa38,
    toast: "🐟 150℃ 美拉德反应完成！冷凝管里飘出极其极其香甜的黄金烤小鱼干焦香分子，本喵口水都要滴进烧杯啦喵～",
    mode: "aroma"
  }
];

const MOLECULE_INFO = [
  {
    id: "gemini",
    name: "双子表面活性剂 (Gemini Surfactant)",
    toast: "🧬 当前全息分子：双子表面活性剂 (Gemini Surfactant)——化学里真的以本喵名字命名！两个亲水头基+联接基+双疏水尾链，本喵和化学渊源极其深厚喵～"
  },
  {
    id: "ice_ring",
    name: "六方冰 I_h 六元氢键环 (6 H₂O)",
    toast: "❄️ 当前全息分子：六方冰 I_h 六元环——这就是雪境里每一片雪花天生都长着六个角的微观化学秘密喵！"
  },
  {
    id: "benzene",
    name: "苯环大 π 键 (C₆H₆)",
    toast: "⬡ 当前全息分子：凯库勒梦里蛇咬尾巴悟出的苯环 (C₆H₆)——六个碳原子手拉手共享离域金色大 π 电子云，对称得极其优雅喵！"
  },
  {
    id: "theobromine",
    name: "热可可快乐分子 · 可可碱 (C₇H₈N₄O₂)",
    toast: "☕ 当前全息分子：可可碱 (Theobromine)——集市热可可喝起来让人暖呼呼极其开心的秘密就是它喵（不过真小猫不能贪杯哦）！"
  }
];

const CHEM_NOTES = [
  "📘 哈基米化学笔记 #1：知道本喵为什么和化学极其有缘吗？① 有机界真有「Gemini 双子表面活性剂」；② 元素周期表 32 号是 Ge (锗)；③ AlphaFold 与 GNoME 还帮人类发现了 220 万种全新无机晶体喵！",
  "📘 哈基米化学笔记 #2：夜空极光为什么是青绿色和樱粉色？高空约 100km 的激发态氧原子跃迁发出 557.7nm 极光绿，氮分子 N₂⁺ 激发则绽放樱粉紫光喵！",
  "📘 哈基米化学笔记 #3：雪花为什么永远是六角对称？水分子的 O—H···O 氢键在常压下结晶为六方晶系 Ice I_h，微观六边形不断外延就长成了万千独一无二的六瓣雪花喵～",
  "📘 哈基米化学笔记 #4：烤小鱼干和姜饼为什么那么香？因为加热到 140~165℃ 时，还原糖和氨基酸发生「美拉德反应」，合成了数百种焦香诱人的芳香分子喵！"
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

    // Protected dynamic reaction parts (skipped by PerfOptimizer static batching!)
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
    this.bubbles = [];

    this.expIdx = 0;
    this.expTimer = 0;
    this.expMode = null;
    this.molIdx = 0;
    this.noteIdx = 0;
    this.elixirPink = false;
    this.sparkAcc = 0;
    this.benchWorldPos = new this.THREE.Vector3();
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
      // Crisp bubbly glass clink + gentle effervescent fizz!
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
    bg.addColorStop(0, "#121a3a");
    bg.addColorStop(0.5, "#1b2858");
    bg.addColorStop(1, "#2a1d4f");
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
    c.font = "900 46px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    c.fillText(title, 384, 74);

    c.shadowBlur = 6;
    c.fillStyle = "#ffd98c";
    c.font = "600 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    c.fillText(sub, 384, 134);

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

    c.fillStyle = "#101730";
    c.fillRect(0, 0, 1024, 512);
    c.strokeStyle = "#78ecff";
    c.lineWidth = 6;
    c.strokeRect(8, 8, 1008, 496);

    c.fillStyle = "#e8f8ff";
    c.font = "700 30px 'Microsoft YaHei', sans-serif";
    c.textAlign = "center";
    c.fillText("✦ 哈基米星穹元素周期表 · PERIODIC TABLE (32号 Ge 特别发光!) ✦", 512, 42);

    // Real 18-column x 7-row layout!
    const rows = [
      ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
      ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
      ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
      ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
      ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
      ["Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]
    ];
    const cw = 52, ch = 56, ox = 44, oy = 68;
    const famColor = (col, sym) => {
      if (sym === "Ge") return "#ff64cb"; // Gemini Ge #32 easter egg highlight!
      if (sym === "Au" || sym === "Cu" || sym === "Sr") return "#f6b84c";
      if (col === 0) return "#f47272";
      if (col === 1) return "#f5a25d";
      if (col >= 2 && col <= 11) return "#4fa8e8";
      if (col === 17) return "#a882ff";
      if (col === 16) return "#4de0c2";
      return "#64d88c";
    };

    let num = 1;
    for (let r = 0; r < rows.length; r++) {
      for (let col = 0; col < 18; col++) {
        const sym = rows[r][col];
        if (!sym) continue;
        const x = ox + col * cw;
        const y = oy + r * ch;
        const colHex = famColor(col, sym);
        c.fillStyle = sym === "Ge" ? "rgba(255, 100, 203, 0.38)" : "rgba(255, 255, 255, 0.08)";
        c.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        c.strokeStyle = colHex;
        c.lineWidth = sym === "Ge" ? 3.5 : 1.8;
        c.strokeRect(x + 2, y + 2, cw - 4, ch - 4);

        c.fillStyle = "#b8cce8";
        c.font = "600 11px sans-serif";
        c.textAlign = "left";
        c.fillText(String(num), x + 6, y + 14);

        c.fillStyle = sym === "Ge" ? "#fff6ff" : "#ffffff";
        c.font = "800 20px 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.fillText(sym, x + cw / 2, y + 38);

        num++;
        if (sym === "La") num = 72;
        if (sym === "Ac") num = 104;
      }
    }

    c.fillStyle = "#98ecff";
    c.font = "600 18px 'Microsoft YaHei', sans-serif";
    c.textAlign = "center";
    c.fillText("★ 32号 Ge (Gemini彩蛋) · Cu/Sr 焰色反应 · H₂O 六方冰 I_h · Gemini 双子表面活性剂 ★", 512, 484);

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

    // Rich dark forest-slate laboratory chalkboard
    c.fillStyle = "#172b28";
    c.fillRect(0, 0, 1024, 512);
    // Subtle chalk dust smudge
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
    c.font = "800 34px 'Microsoft YaHei', sans-serif";
    c.fillText("⚗️ 哈基米猫猫化学家 · 冬日炼金笔记", 46, 66);

    c.fillStyle = "#9ef5ff";
    c.font = "700 25px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText("1. Gemini 双子表面活性剂:  [R-N⁺(CH₃)₂]—(CH₂)ₛ—[N⁺(CH₃)₂-R]", 46, 128);
    c.fillStyle = "#ffb8e6";
    c.fillText("   → 两颗亲水猫头 + 联接桥 + 两条疏水尾巴 (超强起泡喵!)", 46, 166);

    c.fillStyle = "#b8ffd4";
    c.fillText("2. 大象牙膏分解:  2 H₂O₂  —(KI)→  2 H₂O + O₂↑ + 热量", 46, 224);

    c.fillStyle = "#ffe4a8";
    c.fillText("3. 圣诞焰色光谱:  Cu²⁺(翠绿)  Sr²⁺(绯红)  K⁺(丁香紫)  Na⁺(金黄)", 46, 282);

    c.fillStyle = "#d0eaff";
    c.fillText("4. 六方冰晶 Ice I_h:  H₂O 氢键角 109.5° → 六瓣完美雪花 ❄", 46, 340);

    c.fillStyle = "#ffd0ec";
    c.fillText("5. 美拉德烤小鱼干:  还原糖 + 氨基酸 —(150℃)→ 焦香吡嗪 🐟", 46, 398);

    c.fillStyle = "rgba(255, 255, 255, 0.78)";
    c.font = "600 22px 'Microsoft YaHei', sans-serif";
    c.fillText("✦ 提示：实验台可做 5 种化学反应 · 东侧看 3D 分子模型 · 西侧喝变色星光饮品喵～", 46, 464);

    // Cute chalk Benzene ring sketch on far right
    c.save();
    c.translate(895, 255);
    c.strokeStyle = "#88f4ff";
    c.lineWidth = 4;
    c.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const px = Math.cos(a) * 66, py = Math.sin(a) * 66;
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.stroke();
    c.beginPath();
    c.arc(0, 0, 40, 0, Math.PI * 2);
    c.strokeStyle = "#ffe28a";
    c.stroke();
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "700 22px sans-serif";
    c.fillText("C₆H₆", 0, 8);
    c.restore();

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  _mkErlenmeyer(scale, liquidMat, glassMat, x, y, z) {
    const T = this.THREE;
    const g = new T.Group();
    g.position.set(x, y, z);
    // Outer translucent glass flask (conical body + slender neck + lip ring)
    const body = new T.Mesh(new T.CylinderGeometry(0.055 * scale, 0.18 * scale, 0.24 * scale, 16, 1, false), glassMat);
    body.position.y = 0.12 * scale;
    body.renderOrder = 2;
    const neck = new T.Mesh(new T.CylinderGeometry(0.052 * scale, 0.055 * scale, 0.14 * scale, 14), glassMat);
    neck.position.y = 0.30 * scale;
    neck.renderOrder = 2;
    const lip = new T.Mesh(new T.TorusGeometry(0.056 * scale, 0.011 * scale, 6, 16).rotateX(Math.PI / 2), glassMat);
    lip.position.y = 0.37 * scale;
    lip.renderOrder = 2;

    // Inner glowing liquid cone cleanly inset inside glass
    const liq = new T.Mesh(new T.CylinderGeometry(0.095 * scale, 0.165 * scale, 0.13 * scale, 16), liquidMat);
    liq.position.y = 0.072 * scale;
    liq.renderOrder = 1;
    g.add(liq, body, neck, lip);
    return { group: g, liquid: liq };
  }

  _buildMoleculeModels() {
    const T = this.THREE;
    const std = (hex, rough = 0.22, extra = {}) =>
      this.wrapMat(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }), { key: "plain" });

    const mC = std(0x283248, 0.28, { metalness: 0.25 });
    const mO = std(0xff4258, 0.20, { emissive: new T.Color(0.55, 0.08, 0.14), emissiveIntensity: 0.45 });
    const mN = std(0x4688ff, 0.20, { emissive: new T.Color(0.12, 0.28, 0.85), emissiveIntensity: 0.55 });
    const mH = std(0xf4faff, 0.16, { emissive: new T.Color(0.32, 0.42, 0.62), emissiveIntensity: 0.25 });
    const mCyan = std(0x4cf4ff, 0.14, { emissive: new T.Color(0.18, 0.84, 1.0), emissiveIntensity: 0.85 });
    const mPink = std(0xff78dc, 0.14, { emissive: new T.Color(0.92, 0.28, 0.78), emissiveIntensity: 0.85 });
    const mBond = std(0xd8e4f6, 0.32, { metalness: 0.4 });
    const mGold = std(0xffd466, 0.22, { metalness: 0.8, emissive: new T.Color(0.65, 0.45, 0.08), emissiveIntensity: 0.45 });

    const addAtom = (grp, x, y, z, r, mat) => {
      grp.add(this.mesh(new T.SphereGeometry(r, 14, 10), mat, x, y, z));
    };
    const addBond = (grp, a, b, rad = 0.026, mat = mBond) => {
      const va = new T.Vector3(...a), vb = new T.Vector3(...b);
      const dir = new T.Vector3().subVectors(vb, va);
      const len = dir.length();
      const cyl = new T.Mesh(new T.CylinderGeometry(rad, rad, len, 8), mat);
      cyl.position.copy(va).add(vb).multiplyScalar(0.5);
      cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      grp.add(cyl);
    };

    // 1) Gemini Surfactant (Twin Hydrophilic Heads + Spacer Bridge + Twin Hydrophobic Tails!)
    const gGem = new T.Group();
    const hL = [-0.26, 0.18, 0], hR = [0.26, 0.18, 0];
    addAtom(gGem, ...hL, 0.135, mCyan); // Left cationic N+ head (cyan star!)
    addAtom(gGem, ...hR, 0.135, mPink); // Right cationic N+ head (sakura pink!)
    // Golden spacer chain (-CH2-CH2-CH2-) linking the twin heads
    const sp1 = [-0.09, 0.24, 0.03], sp2 = [0.09, 0.24, -0.03];
    addAtom(gGem, ...sp1, 0.068, mGold);
    addAtom(gGem, ...sp2, 0.068, mGold);
    addBond(gGem, hL, sp1, 0.030, mGold);
    addBond(gGem, sp1, sp2, 0.030, mGold);
    addBond(gGem, sp2, hR, 0.030, mGold);
    // Cute cat-ear methyl groups crowning each N+ head!
    for (const [hx, hy, hz, mat] of [[...hL, mCyan], [...hR, mPink]]) {
      const e1 = [hx - 0.10, hy + 0.15, hz], e2 = [hx + 0.10, hy + 0.15, hz];
      addAtom(gGem, ...e1, 0.055, mH);
      addAtom(gGem, ...e2, 0.055, mH);
      addBond(gGem, [hx, hy, hz], e1, 0.02, mat);
      addBond(gGem, [hx, hy, hz], e2, 0.02, mat);
    }
    // Twin zig-zag hydrophobic alkyl carbon tails sweeping gracefully downward!
    for (const side of [-1, 1]) {
      let prev = [side * 0.26, 0.18, 0];
      for (let k = 1; k <= 5; k++) {
        const cur = [side * (0.28 + (k % 2 ? 0.07 : -0.03)), 0.18 - k * 0.135, (k % 2 ? 0.04 : -0.04)];
        addAtom(gGem, ...cur, 0.062, mC);
        addBond(gGem, prev, cur, 0.024, mBond);
        prev = cur;
      }
    }

    // 2) Hexagonal Ice I_h 6-Water Hydrogen-Bonded Chair Ring!
    const gIce = new T.Group();
    const oPts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pt = [Math.cos(a) * 0.42, (i % 2 ? 0.09 : -0.09), Math.sin(a) * 0.42];
      oPts.push(pt);
      addAtom(gIce, ...pt, 0.105, mO);
      // Outward dangling H atom
      const hOut = [Math.cos(a) * 0.62, pt[1] + (i % 2 ? 0.12 : -0.12), Math.sin(a) * 0.62];
      addAtom(gIce, ...hOut, 0.062, mH);
      addBond(gIce, pt, hOut, 0.02, mBond);
    }
    for (let i = 0; i < 6; i++) {
      const a = oPts[i], b = oPts[(i + 1) % 6];
      const mid = [(a[0] * 0.65 + b[0] * 0.35), (a[1] * 0.65 + b[1] * 0.35), (a[2] * 0.65 + b[2] * 0.35)];
      addAtom(gIce, ...mid, 0.058, mH);
      addBond(gIce, a, mid, 0.022, mBond);
      addBond(gIce, mid, b, 0.015, mCyan); // Glowing cyan H-bond!
    }

    // 3) Benzene Ring (C6H6) with Luminous Golden Delocalized Pi Ring!
    const gBenz = new T.Group();
    const cPts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const cp = [Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38];
      const hp = [Math.cos(a) * 0.64, 0, Math.sin(a) * 0.64];
      cPts.push(cp);
      addAtom(gBenz, ...cp, 0.095, mC);
      addAtom(gBenz, ...hp, 0.062, mH);
      addBond(gBenz, cp, hp, 0.022, mBond);
    }
    for (let i = 0; i < 6; i++) addBond(gBenz, cPts[i], cPts[(i + 1) % 6], 0.028, mBond);
    gBenz.add(this.mesh(new T.TorusGeometry(0.24, 0.028, 10, 32).rotateX(Math.PI / 2), mGold, 0, 0, 0));

    // 4) Theobromine (C7H8N4O2 - Cozy Hot Cocoa Happiness Molecule!)
    const gCoco = new T.Group();
    const ring6 = [
      [-0.26, 0.16, 0], [-0.04, 0.28, 0], [0.18, 0.14, 0],
      [0.18, -0.14, 0], [-0.04, -0.26, 0], [-0.26, -0.12, 0]
    ];
    const r6Mats = [mN, mC, mC, mC, mN, mC];
    ring6.forEach((p, idx) => addAtom(gCoco, ...p, 0.088, r6Mats[idx]));
    for (let i = 0; i < 6; i++) addBond(gCoco, ring6[i], ring6[(i + 1) % 6], 0.024, mBond);
    // Fused 5-membered imidazole ring on +X side
    const im1 = [0.42, 0.20, 0], im2 = [0.54, 0.0, 0], im3 = [0.42, -0.20, 0];
    addAtom(gCoco, ...im1, 0.085, mN);
    addAtom(gCoco, ...im2, 0.085, mC);
    addAtom(gCoco, ...im3, 0.085, mN);
    addBond(gCoco, ring6[2], im1, 0.024, mBond);
    addBond(gCoco, im1, im2, 0.024, mBond);
    addBond(gCoco, im2, im3, 0.024, mBond);
    addBond(gCoco, im3, ring6[3], 0.024, mBond);
    // Twin carbonyl oxygens (=O) + methyl groups
    const ox1 = [-0.04, 0.50, 0], ox2 = [-0.46, -0.24, 0];
    addAtom(gCoco, ...ox1, 0.095, mO);
    addAtom(gCoco, ...ox2, 0.095, mO);
    addBond(gCoco, ring6[1], ox1, 0.026, mGold);
    addBond(gCoco, ring6[5], ox2, 0.026, mGold);

    const list = [gGem, gIce, gBenz, gCoco];
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
    // Inlaid golden Benzene Hexagonal Floor Medallion (flush with polygonOffset -> zero Z-fighting!)
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

    // Register smooth walkable laboratory floor platform (deckH = 0.24m <= 0.30m -> walks straight in!)
    const wx0 = this.cx - hw - 0.2, wx1 = this.cx + hw + 0.2;
    const wz0 = this.cz - hd - 0.2, wz1 = this.cz + hd + 0.2;
    world.platforms.push({
      test: (px, pz) => px >= wx0 && px <= wx1 && pz >= wz0 && pz <= wz1,
      y: () => this.deckY,
      wood: true
    });

    // =========================================================================
    // 2. VICTORIAN-STARLIGHT GLASS CONSERVATORY WALLS, ARCHES & CAT-FLASK ROOF!
    // =========================================================================
    const wainscotH = 1.25;
    // Solid lower stone wainscoting + tall glass conservatory windows on North, East & West walls
    // (South front wall leaves a grand 5.0m wide open entrance portal at x ∈ [-2.5, +2.5]!)
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
      // Vertical brass window mullions
      const nMul = Math.max(1, Math.round(len / 2.2) - 1);
      for (let i = 1; i <= nMul; i++) {
        const mx = -len / 2 + (len * i) / (nMul + 1);
        wg.add(this.mesh(new T.BoxGeometry(0.08, H - wainscotH - 0.12, 0.12), m.brass, mx, wainscotH + (H - wainscotH) / 2, 0));
      }
      root.add(wg);
    };

    addGlassWall(0, -hd + 0.13, W - 0.2, 0);           // North wall
    addGlassWall(-hw + 0.13, 0, D - 0.2, Math.PI / 2); // West wall
    addGlassWall(hw - 0.13, 0, D - 0.2, Math.PI / 2);  // East wall
    addGlassWall(-4.05, hd - 0.13, 3.0, 0);            // South-West wing
    addGlassWall(4.05, hd - 0.13, 3.0, 0);             // South-East wing

    // Solid perimeter wall boxes (leaving wide 5.0m open doorway at South x ∈ [-2.5, +2.5]!)
    world.boxes.push(
      { x0: this.cx - hw, x1: this.cx + hw, z0: this.cz - hd, z1: this.cz - hd + 0.36, h: 6 },
      { x0: this.cx - hw, x1: this.cx - hw + 0.36, z0: this.cz - hd, z1: this.cz + hd, h: 6 },
      { x0: this.cx + hw - 0.36, x1: this.cx + hw, z0: this.cz - hd, z1: this.cz + hd, h: 6 },
      { x0: this.cx - hw, x1: this.cx - 2.55, z0: this.cz + hd - 0.36, z1: this.cz + hd, h: 6 },
      { x0: this.cx + 2.55, x1: this.cx + hw, z0: this.cz + hd - 0.36, z1: this.cz + hd, h: 6 }
    );

    // 6 Structural Corner & Entrance Stone-Brass Columns
    for (const [px, pz] of [[-hw + 0.18, -hd + 0.18], [hw - 0.18, -hd + 0.18], [-hw + 0.18, hd - 0.18], [hw - 0.18, hd - 0.18], [-2.55, hd - 0.18], [2.55, hd - 0.18]]) {
      root.add(
        this.mesh(new T.BoxGeometry(0.40, H + 0.1, 0.40), m.stone, px, this.deckH + H / 2, pz),
        this.mesh(new T.BoxGeometry(0.46, 0.12, 0.46), m.brass, px, this.deckH + H, pz)
      );
    }

    // Welcoming Entrance Illuminated Signboard + Twin Cat-Ear Glowing Flask Lanterns!
    const signTex = this._makeSignTex("⚗️ 哈基米星穹化学实验室 ⚗️", "Gemini · 双子分子合成 · 焰色反应 · 3D 全息晶格");
    const signMat = plain(new T.MeshStandardMaterial({ map: signTex, roughness: 0.25, emissive: new T.Color(0.20, 0.35, 0.55), emissiveMap: signTex, emissiveIntensity: 0.55 }));
    root.add(
      this.mesh(new T.BoxGeometry(5.1, 1.18, 0.16), [m.brass, m.brass, m.snow, m.brass, signMat, signMat], 0, this.deckH + H + 0.42, hd - 0.08)
    );
    // Warm entrance lanterns flanking doorway
    for (const sx of [-2.55, 2.55]) {
      root.add(
        this.mesh(new T.CylinderGeometry(0.03, 0.03, 0.32, 8), m.brass, sx, this.deckH + 3.25, hd + 0.36),
        this.mesh(new T.OctahedronGeometry(0.18, 1), sx < 0 ? m.cyanGlow : m.pinkGlow, sx, this.deckH + 3.05, hd + 0.36)
      );
    }

    // Pitched Glass-Skylight Conservatory Roof with Snowy Teal Eaves + Spinning Giant Benzene Spire!
    const roofBaseY = this.deckH + H;
    root.add(
      // Teal eaves frame around perimeter
      this.mesh(new T.BoxGeometry(W + 0.8, 0.22, 0.72), m.roofTeal, 0, roofBaseY + 0.11, -hd - 0.1),
      this.mesh(new T.BoxGeometry(W + 0.8, 0.22, 0.72), m.roofTeal, 0, roofBaseY + 0.11, hd + 0.1),
      this.mesh(new T.BoxGeometry(0.72, 0.22, D + 0.8), m.roofTeal, -hw - 0.1, roofBaseY + 0.11, 0),
      this.mesh(new T.BoxGeometry(0.72, 0.22, D + 0.8), m.roofTeal, hw + 0.1, roofBaseY + 0.11, 0),
      // Snow caps along roof rim
      this.mesh(new T.BoxGeometry(W + 0.86, 0.10, 0.76), m.snow, 0, roofBaseY + 0.26, -hd - 0.1),
      this.mesh(new T.BoxGeometry(W + 0.86, 0.10, 0.76), m.snow, 0, roofBaseY + 0.26, hd + 0.1),
      // Central vaulted translucent glass conservatory skylight dome!
      this.mesh(new T.ConeGeometry(6.6, 2.55, 4).rotateY(Math.PI / 4), m.glassPane, 0, roofBaseY + 1.38, 0),
      // Golden structural ridge ribs
      this.mesh(new T.TorusGeometry(1.15, 0.08, 8, 24).rotateX(Math.PI / 2), m.brass, 0, roofBaseY + 2.55, 0),
      this.mesh(new T.CylinderGeometry(0.06, 0.09, 1.45, 10), m.brass, 0, roofBaseY + 3.25, 0)
    );
    // Giant Rotating Glowing Benzene-Cat Emblem atop the Conservatory Roof (visible across the whole snow valley!)
    const spireMol = new T.Group();
    spireMol.position.set(0, roofBaseY + 4.25, 0);
    spireMol.add(this.mesh(new T.TorusGeometry(0.72, 0.065, 8, 6), m.brass, 0, 0, 0));
    spireMol.add(this.mesh(new T.TorusGeometry(0.42, 0.045, 8, 28), m.cyanGlow, 0, 0, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      spireMol.add(this.mesh(new T.SphereGeometry(0.14, 10, 8), i % 2 ? m.pinkGlow : m.cyanGlow, Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0));
    }
    root.add(spireMol);
    this.spinners.push({ obj: spireMol, speed: 0.75 });

    // =========================================================================
    // 3. STATION 1 — CENTRAL REAGENT SYNTHESIS WORKBENCH & BUNSEN BURNER!
    // =========================================================================
    const benchZ = -1.65;
    const benchTop = this.deckH + 0.96;
    const benchG = new T.Group();
    benchG.position.set(0, this.deckH, benchZ);
    benchG.add(
      // Solid mahogany cabinet + gleaming dark granite chemical countertop
      this.mesh(new T.BoxGeometry(4.2, 0.88, 1.32), m.woodDark, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(4.42, 0.10, 1.46), m.granite, 0, 0.92, 0),
      this.mesh(new T.BoxGeometry(4.46, 0.04, 1.50), m.brass, 0, 0.87, 0)
    );

    // 4 Colorful Glowing Reagent Flasks flanking the central reaction station
    benchG.add(
      this._mkErlenmeyer(1.05, m.cyanGlow, m.flaskGlass, -1.55, 0.97, -0.18).group,
      this._mkErlenmeyer(0.95, m.pinkGlow, m.flaskGlass, -1.12, 0.97, 0.14).group,
      this._mkErlenmeyer(1.00, m.emeraldGlow, m.flaskGlass, 1.18, 0.97, 0.10).group,
      this._mkErlenmeyer(1.10, m.goldGlow, m.flaskGlass, 1.62, 0.97, -0.15).group
    );

    // Brass Retort Ring Stand + Central Interactive Reaction Flask & Bunsen Burner!
    benchG.add(
      this.mesh(new T.BoxGeometry(0.46, 0.04, 0.36), m.iron, 0, 0.99, -0.18),
      this.mesh(new T.CylinderGeometry(0.022, 0.022, 1.05, 8), m.iron, -0.18, 1.50, -0.26),
      this.mesh(new T.TorusGeometry(0.15, 0.015, 6, 18).rotateX(Math.PI / 2), m.brass, 0, 1.30, -0.02),
      this.mesh(new T.CylinderGeometry(0.014, 0.014, 0.24, 6).rotateZ(Math.PI / 2), m.brass, -0.09, 1.30, -0.14),
      // Bunsen Burner base & brass tube
      this.mesh(new T.CylinderGeometry(0.09, 0.12, 0.06, 12), m.iron, 0, 1.00, -0.02),
      this.mesh(new T.CylinderGeometry(0.026, 0.030, 0.20, 10), m.brass, 0, 1.12, -0.02)
    );

    // Animated Reaction Liquid & Flame (kept referenced on `this` so PerfOptimizer protects them!)
    this.reactionLiquidMat = plain(new T.MeshStandardMaterial({
      color: 0x56f0ff,
      emissive: new T.Color(0x56f0ff),
      emissiveIntensity: 1.0,
      roughness: 0.10
    }));
    const mainFlask = this._mkErlenmeyer(1.38, this.reactionLiquidMat, m.flaskGlass, 0, 1.28, -0.02);
    this.reactionLiquid = mainFlask.liquid;
    benchG.add(mainFlask.group);

    this.burnerFlameMat = plain(new T.MeshBasicMaterial({
      color: 0x54ecff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    }));
    this.burnerFlame = new T.Mesh(new T.ConeGeometry(0.048, 0.16, 10), this.burnerFlameMat);
    this.burnerFlame.position.set(0, 1.26, -0.02);
    this.burnerFlame.renderOrder = 4;
    benchG.add(this.burnerFlame);

    // Elephant-Toothpaste Rising Pink Foam Plume (visible during Experiment #3!)
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

    // Coiled Glass Liebig Condenser arching smoothly from Main Flask to Golden Catch Beaker!
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

    // Pool of 12 Floating Iridescent Soap Bubbles (launched during Gemini Surfactant experiment!)
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
    // Solid jumpable collider for central workbench
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
    // 4. STATION 2 — 3D CPK MOLECULAR HOLO-PEDESTAL (East Wing: x = +3.45, z = +0.55)
    // =========================================================================
    const mx = 3.45, mz = 0.55;
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
      label: () => `切换 3D 分子模型（当前：${MOLECULE_INFO[this.molIdx].name}）`,
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.cycleMolecule()
    });

    // =========================================================================
    // 5. STATION 3 — PERIODIC TABLE WALL (West) & CHEMISTRY CHALKBOARD (North)!
    // =========================================================================
    // Crisp Periodic Table mounted cleanly inside West wall (x = -hw + 0.34)
    const ptTex = this._makePeriodicTableTex();
    const ptMat = plain(new T.MeshStandardMaterial({ map: ptTex, roughness: 0.35, emissive: new T.Color(0.22, 0.32, 0.52), emissiveMap: ptTex, emissiveIntensity: 0.42 }));
    const ptBoard = this.mesh(new T.BoxGeometry(0.10, 2.05, 4.10), [ptMat, m.woodDark, m.woodDark, m.woodDark, m.woodDark, m.woodDark], -hw + 0.34, this.deckH + 2.48, -0.35);
    root.add(ptBoard);

    // Hand-Chalked Chemistry Blackboard mounted cleanly inside North wall (z = -hd + 0.34)
    const cbTex = this._makeChalkboardTex();
    const cbMat = plain(new T.MeshStandardMaterial({ map: cbTex, roughness: 0.75, emissive: new T.Color(0.14, 0.22, 0.20), emissiveMap: cbTex, emissiveIntensity: 0.25 }));
    const cbBoard = this.mesh(new T.BoxGeometry(4.50, 2.15, 0.10), [m.oak, m.oak, m.oak, m.oak, cbMat, m.oak], 0, this.deckH + 2.52, -hd + 0.34);
    root.add(cbBoard);

    world.spots.push({
      id: "chemlab_notes",
      pos: new T.Vector3(this.cx - hw + 1.15, this.deckY + 1.25, this.cz - 0.35),
      r: 2.6,
      label: "翻看「元素周期表 & 哈基米化学冷知识笔记」",
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => {
        this._playLabSound("holo");
        this.game.ui && this.game.ui.toast(CHEM_NOTES[this.noteIdx++ % CHEM_NOTES.length], 7.5);
      }
    });

    // =========================================================================
    // 6. STATION 4 — MICROSCOPE DESK, RAINBOW TEST-TUBES & pH COLOR-CHANGING ELIXIR!
    // =========================================================================
    const wx = -3.35, wz = 1.65;
    const deskG = new T.Group();
    deskG.position.set(wx, this.deckH, wz);
    deskG.rotation.y = Math.PI * 0.35;
    deskG.add(
      this.mesh(new T.BoxGeometry(2.15, 0.86, 0.96), m.woodDark, 0, 0.43, 0),
      this.mesh(new T.BoxGeometry(2.26, 0.08, 1.06), m.granite, 0, 0.89, 0)
    );

    // Sculpted Brass Compound Microscope on left of desk!
    const micG = new T.Group();
    micG.position.set(-0.62, 0.93, 0);
    micG.add(
      this.mesh(new T.BoxGeometry(0.24, 0.05, 0.30), m.iron, 0, 0.025, 0),
      this.mesh(new T.CylinderGeometry(0.032, 0.04, 0.34, 10), m.brass, 0, 0.22, -0.09),
      this.mesh(new T.BoxGeometry(0.20, 0.025, 0.18), m.iron, 0, 0.20, 0.04),
      this.mesh(new T.BoxGeometry(0.10, 0.01, 0.05), m.cyanGlow, 0, 0.22, 0.04), // Glowing crystal slide!
      this.mesh(new T.CylinderGeometry(0.028, 0.036, 0.32, 12), m.brass, 0, 0.38, 0.04)
    );
    micG.children[4].rotation.x = 0.28;
    deskG.add(micG);

    // 6-Slot Wooden Test-Tube Rack with Glowing Rainbow pH Indicators!
    const rackG = new T.Group();
    rackG.position.set(0.08, 0.93, -0.14);
    rackG.add(
      this.mesh(new T.BoxGeometry(0.76, 0.04, 0.18), m.oak, 0, 0.02, 0),
      this.mesh(new T.BoxGeometry(0.76, 0.03, 0.16), m.oak, 0, 0.22, 0),
      this.mesh(new T.BoxGeometry(0.04, 0.24, 0.16), m.oak, -0.36, 0.12, 0),
      this.mesh(new T.BoxGeometry(0.04, 0.24, 0.16), m.oak, 0.36, 0.12, 0)
    );
    const tubeMats = [m.pinkGlow, m.goldGlow, m.emeraldGlow, m.cyanGlow, m.pinkGlow, m.cyanGlow];
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

    // Butterfly-Pea Berry pH Color-Changing Winter Elixir Flask (sapphire blue <-> sakura pink!)
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

    // Warm Laboratory Interior & Entrance Glow Lights (auto-managed by O.localLights)
    this._addLight(this.cx, this.deckY + 3.2, this.cz - 0.8, 0xb8f4ff, 14, 20);
    this._addLight(this.cx, this.deckY + 2.8, this.cz + hd + 0.6, 0xffd699, 10, 16);

    scene.add(root);

    // Register Lab into Explore sites list for discovery & M-map fast travel!
    if (this.game.explore && this.game.explore.sites) {
      if (!this.game.explore.sites.some((s) => s.id === "chemlab")) {
        this.game.explore.sites.push({
          id: "chemlab",
          name: "哈基米星穹化学实验室",
          x: this.cx,
          z: this.cz,
          r: 13
        });
        this.game.logic && this.game.logic.count("places", this.game.explore.found || 0, this.game.explore.sites.length);
      }
    }

    return this;
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

    // Launch iridescent soap bubbles right from the reaction flask for Gemini Surfactant!
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

    // Cozy warmth boost on aroma / crystal reactions
    if (exp.mode === "aroma" || exp.mode === "crystal") {
      this.game.cold && (this.game.cold.w = Math.min(100, this.game.cold.w + 35), this.game.cold.wet = 0);
    }

    this._playLabSound("fizz");
    this.game.character?.play("cheer");
    this.game.ui && this.game.ui.toast(exp.toast, 6.5);
  }

  cycleMolecule() {
    this.molIdx = (this.molIdx + 1) % this.moleculeGroups.length;
    this.moleculeGroups.forEach((grp, idx) => { grp.visible = idx === this.molIdx; });
    this._playLabSound("holo");
    this.game.ui && this.game.ui.toast(MOLECULE_INFO[this.molIdx].toast, 6.8);
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

    // 1) Spin crowning roof benzene emblem & holo-pedestal 3D molecule
    for (const sp of this.spinners) {
      sp.obj.rotation.y = time * sp.speed;
    }
    if (this.moleculePivot) {
      this.moleculePivot.rotation.y = time * 0.95;
      this.moleculePivot.position.y = 1.85 + Math.sin(time * 2.1) * 0.08;
    }

    // 2) Flickering Bunsen burner flame
    if (this.burnerFlame) {
      const boost = this.expTimer > 0 && this.expMode === "flame" ? 1.85 : 1.0;
      const flick = 0.88 + 0.18 * Math.sin(time * 24) + 0.08 * Math.cos(time * 37);
      this.burnerFlame.scale.set(boost * (0.95 + 0.1 * Math.sin(time * 19)), boost * flick, boost);
      if (this.expTimer > 0 && this.expMode === "flame" && this.burnerFlameMat) {
        const pal = [0x24ff88, 0xff3b78, 0xb870ff, 0xffcc42];
        this.burnerFlameMat.color.setHex(pal[Math.floor(time * 3.5) % pal.length]);
      }
    }

    // 3) Live Experiment Effects (Foam plume, Bubbles, Flame-test / Crystal / Aroma sparks!)
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
            const c = [[0.2, 1.0, 0.55], [1.0, 0.3, 0.55], [0.75, 0.45, 1.0], [1.0, 0.85, 0.3]][Math.floor(Math.random() * 4)];
            [r, gr, b] = c;
          } else if (this.expMode === "foam") {
            [r, gr, b] = [1.0, 0.65, 0.90];
          } else if (this.expMode === "aroma") {
            [r, gr, b] = [1.0, 0.82, 0.38];
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

    // 4) Update floating Gemini Surfactant iridescent soap bubbles
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

    // 5) Day/Night interior laboratory glow scaling
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0.35;
    for (const item of this.lights) {
      item.l.intensity = item.base * (0.45 + 0.85 * lamps);
    }
  }
}
