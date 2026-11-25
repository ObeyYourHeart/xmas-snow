// 极其猫实验室（雕花猫猫炼金屋外观 + 独立室内粒子对撞密室 + 可穿戴化学装备 + 118 Og 神秘武器！）
// - Exterior Cat-House Alchemy Mansion at (76, 102): Carved ashlar masonry, scalloped slate roof with twin giant
//   architectural Cat-Ear Turret Dormers, Cat-Head Stained-Glass Rose Window, projecting East/West octagonal copper
//   bay windows with crisp 512x768 leaded-glass alchemy panes & potion boxes, and steampunk copper chimney!
// - Dedicated Indoor Grand Collider Lab at LAB_ORIGIN = (1500, 1500, 1500) (16m × 14m × 5.6m):
//   Octagonal brass-inlaid tile floor, 6 recessed arched cathedral aurora windows, apothecary reagent shelves,
//   SW 极其猫装备柜, 4 Gemini 4 Element Laser Reactors, Center 118 Og Secret Weapon Vault, Workbench, Periodic Table & Holo-Pedestal!

import { buildChemGunMesh } from "./labweapon.js?v=11251445";
import {
  makeStoneMasonryTex,
  makeShingleRoofTex,
  makeTimberWallTex,
  makeLabFloorTex,
  makeCrispWindowTex,
  makeCatRoseWindowTex,
  makeCleanSignTex,
  buildCrispWindow
} from "./archcraft.js?v=11251205";

export const LAB_ORIGIN = { x: 1500, y: 1500, z: 1500 };

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

const REACTOR_DEFS = [
  {
    id: "H", num: "1", sym: "H", sub: "氢·极速", hex: "#4ef4ff", color: 0x4ef4ff, rgb: [0.30, 0.96, 1.0],
    x: -3.55, z: -2.45, rotY: Math.PI * 0.22, kind: "tube",
    toast: "⚡【1/4 核心充能 · 1 H 氢】极速轻量等离子光束已接入中央 118 Og 核心舱！嗖的一下就完成点火喵！"
  },
  {
    id: "C", num: "6", sym: "C", sub: "碳·旗舰", hex: "#ffd85a", color: 0xffd85a, rgb: [1.0, 0.85, 0.35],
    x: 3.55, z: -2.45, rotY: -Math.PI * 0.22, kind: "diamond",
    toast: "💎【核心充能 · 6 C 碳旗舰】正四面体金刚石稳压光束锁定中央核心！硬核架构稳如泰山喵！"
  },
  {
    id: "Ne", num: "10", sym: "Ne", sub: "氖·甜点", hex: "#ff6e48", color: 0xff6e48, rgb: [1.0, 0.43, 0.26],
    x: -3.55, z: 1.55, rotY: Math.PI * 0.32, kind: "tube",
    toast: "🟠【核心充能 · 10 Ne 氖】黄金甜点主力绽放经典霓虹橙红放电束，直冲中央 118 Og 封存舱喵！"
  },
  {
    id: "Ar", num: "18", sym: "Ar", sub: "氩·工程", hex: "#a87aff", color: 0xa87aff, rgb: [0.66, 0.48, 1.0],
    x: 3.55, z: 1.55, rotY: -Math.PI * 0.32, kind: "tube",
    toast: "🟣【核心充能 · 18 Ar 氩】重型工程电光紫蓝光束接入完毕！离人工手搓 118 号神秘武器更近一步喵！"
  }
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
    this.deckH = 0.36;
    this.out = { x: this.cx, z: this.cz + 7.4 };

    // Indoor state (strictly separate from Claude's Castle cabin.inside!)
    this.inside = false;
    this.seenInside = false;
    this.snowWas = 1.2;

    this.ext = null;
    this.intGroup = null;
    this.extLights = [];
    this.intLights = [];

    // Protected dynamic objects (PerfOptimizer skips static batching on all of these!)
    this.spinners = [];
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
    this.bubbles = [];

    // Secret 118 Og Reactor & Containment Vault puzzle state!
    this.charged = new Set();
    this.reactorBeams = {};     // id -> beam mesh
    this.reactorCores = {};     // id -> core mesh
    this.vaultLeds = {};        // id -> led mesh
    this.vaultGyro = [];        // 3 spinning golden containment rings
    this.vaultGlass = null;     // laser-shielded glass cylinder that lifts open on unlock!
    this.vaultGlassMat = null;
    this.vaultWeaponPreview = null;
    this.lockerPreview = null;
    this.synthAnimT = 0;        // > 0 during the dramatic 3s unlock sequence
    this.synthTriggered = false;
    this.vaultOpenK = 0;        // 0 = sealed, 1 = opened

    this.expIdx = 0;
    this.expTimer = 0;
    this.expMode = null;
    this.molIdx = 0;
    this.noteIdx = 0;
    this.elixirPink = false;
    this.sparkAcc = 0;
    this.benchWorldPos = new this.THREE.Vector3(LAB_ORIGIN.x, LAB_ORIGIN.y + 1.85, LAB_ORIGIN.z - 5.35);
    this.vaultWorldPos = new this.THREE.Vector3(LAB_ORIGIN.x, LAB_ORIGIN.y + 1.95, LAB_ORIGIN.z - 0.5);
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  _playLabSound(kind) {
    const audio = this.game.audio;
    if (!audio || audio.muted || !audio.ctx) return;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    const master = audio.master || ctx.destination;

    const note = (freq, delay, dur, gain = 0.045, type = "sine", rev = 0.34) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2800;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(1e-4, now + delay);
      gn.gain.linearRampToValueAtTime(gain, now + delay + 0.014);
      gn.gain.exponentialRampToValueAtTime(1e-4, now + delay + dur);
      osc.connect(lp).connect(gn).connect(master);
      if (rev > 0 && audio.rev) {
        const rg = ctx.createGain();
        rg.gain.value = rev;
        gn.connect(rg).connect(audio.rev);
      }
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.06);
    };

    if (kind === "door") {
      // Soft pneumatic conservatory airlock sigh + warm glass chime
      note(523.25, 0, 0.18, 0.036, "sine", 0.42);
      note(783.99, 0.055, 0.22, 0.036, "sine", 0.45);
      note(1046.5, 0.12, 0.30, 0.030, "triangle", 0.48);
    } else if (kind === "charge") {
      const step = this.charged.size;
      const base = 440 * Math.pow(1.12246, step * 2);
      note(base, 0, 0.22, 0.038, "triangle", 0.40);
      note(base * 1.25, 0.065, 0.26, 0.038, "sine", 0.44);
      note(base * 1.5, 0.13, 0.38, 0.042, "sine", 0.50);
      note(base * 2.0, 0.19, 0.42, 0.024, "sine", 0.52);
    } else if (kind === "synth") {
      // Dramatic ascending collider celesta arpeggio with spacious hall bloom!
      const seq = [392, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98];
      seq.forEach((f, i) => note(f, i * 0.135, 0.52, 0.042, i % 2 ? "triangle" : "sine", 0.52));
    } else if (kind === "locked") {
      note(340, 0, 0.12, 0.032, "triangle", 0.20);
      note(270, 0.10, 0.18, 0.032, "triangle", 0.22);
    } else if (kind === "fizz") {
      // Authentic borosilicate glass-flask clink + effervescent bubbling fizz!
      note(1760, 0, 0.11, 0.030, "sine", 0.45);
      note(2637, 0.01, 0.09, 0.018, "sine", 0.45);
      note(1975.5, 0.055, 0.13, 0.026, "sine", 0.42);
      for (let i = 0; i < 6; i++) {
        note(440 + i * 115 + Math.random() * 90, 0.08 + i * 0.055, 0.095, 0.022, "sine", 0.36);
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

  _makeSignTex(title, sub, borderHex = "#76f0ff") {
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

    c.strokeStyle = borderHex;
    c.lineWidth = 6;
    c.strokeRect(10, 10, 748, 172);
    c.strokeStyle = "#ffd772";
    c.lineWidth = 2;
    c.strokeRect(20, 20, 728, 152);

    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#ffffff";
    c.shadowColor = borderHex;
    c.shadowBlur = 14;
    c.font = "900 42px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    c.fillText(title, 384, 72);

    c.shadowBlur = 6;
    c.fillStyle = "#ffd98c";
    c.font = "700 24px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText(sub, 384, 134);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, this.game.renderer?.capabilities?.getMaxAnisotropy?.() || 4);
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
    tex.anisotropy = Math.min(8, this.game.renderer?.capabilities?.getMaxAnisotropy?.() || 4);
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
    c.fillText("✦ Gemini 4 跳跃式元素周期表：H(1) · C(6) · Ne(10) · Ar(18) → 合成 Og(118) ✦", 512, 42);

    const rows = [
      ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
      ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
      ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
      ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
      ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
      ["Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]
    ];
    const geminiHighlights = {
      H:  { stroke: "#4ef4ff", fill: "rgba(78, 244, 255, 0.42)", tag: "★" },
      C:  { stroke: "#ffd85a", fill: "rgba(255, 216, 90, 0.44)", tag: "★" },
      Ne: { stroke: "#ff6e48", fill: "rgba(255, 110, 72, 0.46)", tag: "★" },
      Ar: { stroke: "#a87aff", fill: "rgba(168, 122, 255, 0.46)", tag: "★" },
      Og: { stroke: "#ff5ec8", fill: "rgba(255, 94, 200, 0.40)", tag: "⚡" },
      Hf: { stroke: "#ffa8e2", fill: "rgba(255, 168, 226, 0.30)", tag: "哈" },
      Ge: { stroke: "#7effcc", fill: "rgba(126, 255, 204, 0.28)", tag: "喵" }
    };

    const cw = 52, ch = 56, ox = 44, oy = 66;
    const famColor = (col) => (col <= 1 ? "#6b7ea0" : col === 17 ? "#7c72b5" : "#4c6896");

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
    c.fillText("★ 1 H(氢·极速) · 6 C(碳·旗舰) · 10 Ne(氖·甜点) · 18 Ar(氩·工程) · 118 Og(鿫·隐藏武器!) · 72 Hf(铪=哈!) ★", 512, 484);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, this.game.renderer?.capabilities?.getMaxAnisotropy?.() || 4);
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
    c.font = "800 32px 'Microsoft YaHei', sans-serif";
    c.fillText("⚗️ 极其猫实验室 · Gemini 4 元素与 118 Og 指南", 38, 62);

    c.fillStyle = "#7cf4ff";
    c.font = "700 23px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    c.fillText("【秘技 #1 防护装备】 先到西南角「更衣柜」穿戴霓虹护目镜 + 悬浮双子气体罐！", 38, 122);

    c.fillStyle = "#ffe08c";
    c.fillText("【秘技 #2 四柱充能】 依次点亮室内 4 根元素柱：1 H(氢) · 6 C(碳) · 10 Ne(氖) · 18 Ar(氩)", 38, 176);

    c.fillStyle = "#ffb8e6";
    c.fillText("【秘技 #3 隐藏武器】 四道光束汇入中央封存舱 → 按 E 合成「118 Og · 周期表元素炮」！", 38, 230);

    c.fillStyle = "#b8ffd4";
    c.fillText("【AI文理分科】 Claude 写诗(文学组) · OpenAI 看星(天文组) · Gemini 背周期表(化学组)", 38, 290);

    c.fillStyle = "#d8e6ff";
    c.fillText("【猫猫彩蛋】 72 Hf(铪=哈基米!) · 32 Ge(锗) · Gemini 双子表面活性剂 (2头2尾)", 38, 344);

    c.fillStyle = "#ffd6ec";
    c.fillText("【盲盒吐槽】 说好的氢氦锂铍硼呢？Google 跳格子出牌，逼得本喵自己手搓 118 号啦！", 38, 398);

    c.fillStyle = "rgba(255, 255, 255, 0.80)";
    c.font = "600 21px 'Microsoft YaHei', sans-serif";
    c.fillText("✦ 解锁后的「118 Og 元素炮」可带出雪境，每发循环 1 H → 6 C → 10 Ne → 18 Ar → 118 Og 彩虹超新星！", 38, 462);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, this.game.renderer?.capabilities?.getMaxAnisotropy?.() || 4);
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

    const addAtom = (grp, x, y, z, r, mat) => grp.add(this.mesh(new T.SphereGeometry(r, 14, 10), mat, x, y, z));
    const addBond = (grp, a, b, rad = 0.025, mat = mBond) => {
      const va = new T.Vector3(...a), vb = new T.Vector3(...b);
      const dir = new T.Vector3().subVectors(vb, va);
      const cyl = new T.Mesh(new T.CylinderGeometry(rad, rad, dir.length(), 8), mat);
      cyl.position.copy(va).add(vb).multiplyScalar(0.5);
      cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      grp.add(cyl);
    };

    // 1) 6 C Carbon Diamond Tetrahedral Lattice
    const gCarb = new T.Group();
    const ctr = [0, 0, 0];
    const tet = [[0.34, 0.34, 0.34], [-0.34, -0.34, 0.34], [-0.34, 0.34, -0.34], [0.34, -0.34, -0.34]];
    addAtom(gCarb, ...ctr, 0.13, mGold);
    tet.forEach((v) => {
      addAtom(gCarb, ...v, 0.11, mDiamond);
      addBond(gCarb, ctr, v, 0.028, mGold);
      const tip = [v[0] * 1.55, v[1] * 1.55, v[2] * 1.55];
      addAtom(gCarb, ...tip, 0.075, mC);
      addBond(gCarb, v, tip, 0.02, mBond);
    });
    gCarb.add(this.mesh(new T.OctahedronGeometry(0.56, 0), this.wrapMat(new T.MeshBasicMaterial({ color: 0x7ef2ff, wireframe: true, transparent: true, opacity: 0.32 }), { key: "plain" })));

    // 2) 10 Ne & 18 Ar Noble Gas Bohr Electron Shells
    const gNoble = new T.Group();
    addAtom(gNoble, 0, 0, 0, 0.17, mGold);
    const ring1 = new T.Group();
    ring1.add(this.mesh(new T.TorusGeometry(0.36, 0.015, 6, 32), mNeon));
    for (let i = 0; i < 2; i++) addAtom(ring1, Math.cos(i * Math.PI) * 0.36, Math.sin(i * Math.PI) * 0.36, 0, 0.055, mNeon);
    const ring2 = new T.Group();
    ring2.rotation.set(0.65, 0.4, 0);
    ring2.add(this.mesh(new T.TorusGeometry(0.58, 0.014, 6, 40), mArgon));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addAtom(ring2, Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0, 0.050, i % 2 ? mNeon : mArgon);
    }
    gNoble.add(ring1, ring2);
    this.bohrRings.push(ring1, ring2);

    // 3) 1 H Hexagonal Ice I_h Ring
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

    // 4) Gemini Surfactant
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

  _makePalette() {
    const T = this.THREE;
    const rend = this.game.renderer;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.50, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const stoneTex = makeStoneMasonryTex(T, rend, "#ece8e0", 2.8, 1.8);
    const roofIndigoTex = makeShingleRoofTex(T, rend, "indigo", 3.6, 2.4);
    const roofCopperTex = makeShingleRoofTex(T, rend, "copper", 2.4, 2.0);
    const timberTex = makeTimberWallTex(T, rend, true, 2.0, 1.5);
    const floorTex = makeLabFloorTex(T, rend, 6.0, 5.2);
    const winAlchTex = makeCrispWindowTex(T, rend, "alchemy");
    const winNightTex = makeCrispWindowTex(T, rend, "nightsky");
    const catRoseTex = makeCatRoseWindowTex(T, rend);

    return {
      plain,
      std,
      stone: plain(new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.72 })),
      stonePlain: std(0xe4e0d8, 0.74),
      stoneDark: std(0x4a5572, 0.76),
      labFloor: plain(new T.MeshStandardMaterial({ map: floorTex, roughness: 0.36, metalness: 0.24 })),
      labWall: std(0x1b2646, 0.56, { metalness: 0.14 }),
      oak: std(0x9a6b44, 0.66),
      woodDark: plain(new T.MeshStandardMaterial({ map: timberTex, roughness: 0.68 })),
      shutter: std(0x223664, 0.56, { metalness: 0.12 }),
      granite: std(0x1f2538, 0.32, { metalness: 0.18 }),
      brass: std(0xf2c868, 0.20, { metalness: 0.88 }),
      iron: std(0x283042, 0.38, { metalness: 0.72 }),
      snow: std(0xf6f9ff, 0.74),
      indigo: std(0x192344, 0.42, { metalness: 0.28 }),
      roofIndigo: plain(new T.MeshStandardMaterial({ map: roofIndigoTex, roughness: 0.54, metalness: 0.16 })),
      roofCopper: plain(new T.MeshStandardMaterial({ map: roofCopperTex, roughness: 0.40, metalness: 0.32 })),
      whiteCoat: std(0xf7faff, 0.34, { emissive: new T.Color(0.14, 0.22, 0.36), emissiveIntensity: 0.22 }),
      winAlch: plain(new T.MeshStandardMaterial({
        map: winAlchTex, emissive: new T.Color(0.55, 0.78, 0.96), emissiveMap: winAlchTex, emissiveIntensity: 0.78, roughness: 0.14
      })),
      winNight: plain(new T.MeshStandardMaterial({
        map: winNightTex, emissive: new T.Color(0.45, 0.72, 0.92), emissiveMap: winNightTex, emissiveIntensity: 0.75, roughness: 0.14
      })),
      catRose: plain(new T.MeshStandardMaterial({
        map: catRoseTex, emissive: new T.Color(0.75, 0.85, 1.0), emissiveMap: catRoseTex, emissiveIntensity: 0.78, roughness: 0.16
      })),
      winGlow: std(0x88e6ff, 0.18, { emissive: new T.Color(0.24, 0.62, 0.92), emissiveIntensity: 0.72 }),
      earGlass: std(0xff9ee0, 0.16, { emissive: new T.Color(0.95, 0.45, 0.78), emissiveIntensity: 0.82 }),
      cyanGlow: std(0x52f2ff, 0.12, { emissive: new T.Color(0.20, 0.86, 1.0), emissiveIntensity: 1.15 }),
      pinkGlow: std(0xff72da, 0.12, { emissive: new T.Color(0.95, 0.28, 0.80), emissiveIntensity: 1.15 }),
      neonGlow: std(0xff6e42, 0.12, { emissive: new T.Color(1.0, 0.36, 0.14), emissiveIntensity: 1.25 }),
      argonGlow: std(0xa876ff, 0.12, { emissive: new T.Color(0.58, 0.28, 1.0), emissiveIntensity: 1.25 }),
      emeraldGlow: std(0x42f59e, 0.12, { emissive: new T.Color(0.14, 0.88, 0.46), emissiveIntensity: 1.05 }),
      goldGlow: std(0xffdc66, 0.14, { emissive: new T.Color(1.0, 0.72, 0.18), emissiveIntensity: 1.20 }),
      glassPane: plain(new T.MeshStandardMaterial({
        color: 0xdaf6ff, roughness: 0.08, metalness: 0.10, transparent: true, opacity: 0.26, depthWrite: false, side: T.DoubleSide
      })),
      flaskGlass: plain(new T.MeshStandardMaterial({
        color: 0xeafaff, roughness: 0.06, metalness: 0.12, transparent: true, opacity: 0.38, depthWrite: false
      }))
    };
  }

  build() {
    this.m = this._makePalette();
    this._buildExterior();
    this._buildInterior();

    if (this.game.explore && this.game.explore.sites) {
      if (!this.game.explore.sites.some((s) => s.id === "chemlab")) {
        this.game.explore.sites.push({
          id: "chemlab",
          name: "极其猫实验室",
          x: this.cx,
          z: this.cz,
          r: 13
        });
        this.game.logic && this.game.logic.count("places", this.game.explore.found || 0, this.game.explore.sites.length);
      }
    }

    return this;
  }

  // ===========================================================================
  // PART A: SCULPTED CAT-HOUSE ALCHEMY MANSION AT (76, 102) — 「极其猫实验室」!
  //   Multi-tiered pitched roof + Giant Twin Cat-Ear Turret Dormers + Cat Rose Window
  //   + East/West Octagonal Copper Bay Windows + Crisp Shuttered Leaded-Glass Windows!
  // ===========================================================================
  _buildExterior() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const m = this.m;

    const ext = new T.Group();
    ext.name = "jiqimao_chemlab_ext";
    ext.position.set(this.cx, this.baseY, this.cz);
    this.ext = ext;

    const W = 9.6, D = 7.6, H = 4.2;
    const hw = W / 2, hd = D / 2;
    const wallTopY = this.deckH + H; // 4.56
    const roofH = 2.65;
    const ridgeY = wallTopY + roofH; // 7.21
    const winMats = { frame: m.woodDark, brass: m.brass, snow: m.snow, pane: m.winAlch, shutter: m.shutter };

    // 1. Stepped Carved-Stone Foundation + Tiled Balustrade Porch & Stairs
    ext.add(
      this.mesh(new T.BoxGeometry(W + 0.7, this.deckH + 0.55, D + 0.7), m.stoneDark, 0, (this.deckH - 0.55) / 2, 0),
      this.mesh(new T.BoxGeometry(W + 0.26, 0.14, D + 0.26), m.stonePlain, 0, this.deckH + 0.04, 0),
      // Projecting South Porch Deck & 2 Wide Stone Entrance Steps
      this.mesh(new T.BoxGeometry(4.8, this.deckH + 0.35, 2.3), m.stoneDark, 0, (this.deckH - 0.35) / 2, hd + 1.15),
      this.mesh(new T.BoxGeometry(4.65, 0.08, 2.15), m.oak, 0, this.deckH - 0.02, hd + 1.12),
      this.mesh(new T.BoxGeometry(2.6, 0.20, 0.55), m.stonePlain, 0, 0.10, hd + 2.48),
      this.mesh(new T.BoxGeometry(2.8, 0.10, 0.45), m.stonePlain, 0, 0.05, hd + 2.92)
    );
    // Porch Balustrades & Golden Cat-Ear Newel Posts!
    for (const side of [-1, 1]) {
      const nx = side * 1.48;
      ext.add(
        this.mesh(new T.BoxGeometry(0.92, 0.09, 0.14), m.stonePlain, side * 1.92, this.deckH + 0.74, hd + 2.14),
        this.mesh(new T.BoxGeometry(0.14, 0.09, 2.10), m.stonePlain, side * 2.32, this.deckH + 0.74, hd + 1.12),
        this.mesh(new T.BoxGeometry(0.24, 0.94, 0.24), m.stonePlain, nx, this.deckH + 0.47, hd + 2.14),
        this.mesh(new T.SphereGeometry(0.14, 12, 10), m.brass, nx, this.deckH + 1.02, hd + 2.14),
        this.mesh(new T.ConeGeometry(0.065, 0.16, 4), m.brass, nx - 0.08, this.deckH + 1.16, hd + 2.14),
        this.mesh(new T.ConeGeometry(0.065, 0.16, 4), m.brass, nx + 0.08, this.deckH + 1.16, hd + 2.14)
      );
      for (let b = 0; b < 5; b++) {
        ext.add(this.mesh(new T.CylinderGeometry(0.036, 0.044, 0.68, 8), m.stonePlain, side * 2.32, this.deckH + 0.36, hd + 0.35 + b * 0.42));
      }
    }
    world.platforms.push({
      test: (px, pz) => Math.abs(px - this.cx) <= 2.45 && pz >= this.cz + hd - 0.1 && pz <= this.cz + hd + 3.1,
      y: (px, pz) => {
        const dz = pz - (this.cz + hd);
        if (dz > 2.68) return this.baseY + 0.10;
        if (dz > 2.25) return this.baseY + 0.22;
        return this.baseY + this.deckH + 0.02;
      },
      wood: true
    });

    // 2. Half-Timbered Carved Ivory Ashlar Masonry Main Body + Corner Quoins + Timber Framing
    ext.add(
      this.mesh(new T.BoxGeometry(W, H, D), m.stone, 0, this.deckH + H / 2, 0),
      // Decorative mid-wall carved belt rail & upper eaves cornice
      this.mesh(new T.BoxGeometry(W + 0.18, 0.14, D + 0.18), m.woodDark, 0, this.deckH + 1.25, 0),
      this.mesh(new T.BoxGeometry(W + 0.24, 0.16, D + 0.24), m.woodDark, 0, wallTopY - 0.08, 0),
      this.mesh(new T.BoxGeometry(W + 0.28, 0.06, D + 0.28), m.brass, 0, wallTopY + 0.02, 0)
    );
    // Corner carved stone & timber pilasters + Tudor beams
    for (const [cx, cz] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]]) {
      ext.add(
        this.mesh(new T.BoxGeometry(0.42, H + 0.08, 0.42), m.woodDark, cx, this.deckH + H / 2, cz),
        this.mesh(new T.BoxGeometry(0.48, 0.12, 0.48), m.brass, cx, this.deckH + 1.25, cz)
      );
      for (let q = 0; q < 5; q++) {
        ext.add(this.mesh(new T.BoxGeometry(0.50, 0.24, 0.50), m.stonePlain, cx, this.deckH + 0.26 + q * 0.84, cz));
      }
    }
    // East & West Triangular Ashlar Gable Pediments closing the pitched roof ends cleanly!
    const gableShape = new T.Shape();
    gableShape.moveTo(-hd, 0);
    gableShape.lineTo(hd, 0);
    gableShape.lineTo(0, roofH);
    gableShape.closePath();
    const gableGeo = new T.ExtrudeGeometry(gableShape, { depth: 0.24, bevelEnabled: false });
    gableGeo.rotateY(Math.PI / 2);
    ext.add(
      this.mesh(gableGeo, m.stone, -hw, wallTopY, 0),
      this.mesh(gableGeo, m.stone, hw - 0.24, wallTopY, 0)
    );

    // 3. EAST & WEST PROJECTING OCTAGONAL COPPER BAY-WINDOW ALCOVES (Breaks the square box!)
    for (const side of [-1, 1]) {
      const bay = new T.Group();
      bay.position.set(side * (hw + 0.35), this.deckH, -0.15);
      bay.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      const bayH = 3.75, bayR = 1.68;
      bay.add(
        this.mesh(new T.CylinderGeometry(bayR, bayR + 0.12, 0.45, 6), m.stoneDark, 0, 0.15, 0),
        this.mesh(new T.CylinderGeometry(bayR, bayR, bayH, 6), m.stone, 0, bayH / 2, 0),
        this.mesh(new T.TorusGeometry(bayR + 0.02, 0.07, 6, 6).rotateX(Math.PI / 2), m.brass, 0, bayH + 0.02, 0),
        // Steep Scalloped Copper Conical Turret Roof + Snow Cap + Brass Finial!
        this.mesh(new T.ConeGeometry(bayR + 0.48, 2.35, 6), m.roofCopper, 0, bayH + 1.18, 0),
        this.mesh(new T.ConeGeometry(bayR + 0.38, 0.85, 6), m.snow, 0, bayH + 2.02, 0),
        this.mesh(new T.CylinderGeometry(0.035, 0.055, 0.52, 8), m.brass, 0, bayH + 2.58, 0),
        this.mesh(new T.SphereGeometry(0.12, 10, 8), m.goldGlow, 0, bayH + 2.86, 0)
      );
      // 3 Crisp Recessed Alchemy Windows around the projecting bay faces + mini potion boxes!
      for (const ang of [-Math.PI / 3, 0, Math.PI / 3]) {
        const wObj = buildCrispWindow(T, winMats, {
          w: 0.96, h: 1.72, arch: true, flowerBox: true,
          boxFillMats: [m.cyanGlow, m.neonGlow, m.argonGlow]
        });
        const dist = bayR * Math.cos(Math.PI / 6) + 0.02;
        wObj.position.set(Math.sin(ang) * dist, 2.18, Math.cos(ang) * dist);
        wObj.rotation.y = ang;
        bay.add(wObj);
      }
      ext.add(bay);
    }

    // 4. CRISP SHUTTERED ALCHEMY WINDOWS ON FRONT & BACK FACADES (ZERO BLUR!)
    for (const wx of [-3.35, 3.35]) {
      const wf = buildCrispWindow(T, winMats, {
        w: 1.22, h: 1.75, arch: true, shutters: true, flowerBox: true,
        boxFillMats: [m.cyanGlow, m.goldGlow, m.neonGlow, m.argonGlow]
      });
      wf.position.set(wx, this.deckH + 2.32, hd + 0.02);
      ext.add(wf);
    }
    for (const wx of [-2.85, 0, 2.85]) {
      const wb = buildCrispWindow(T, winMats, { w: 1.24, h: 1.72, arch: true, shutters: wx !== 0 });
      wb.position.set(wx, this.deckH + 2.32, -hd - 0.02);
      wb.rotation.y = Math.PI;
      ext.add(wb);
    }

    // 5. PROJECTING GABLED CAT-ENTRANCE PORTICO + CAT ROSE WINDOW + CLEAN "极其猫实验室" SIGN!
    const port = new T.Group();
    port.position.set(0, this.deckH, hd);
    const pW = 4.15, pD = 1.45, pH = 3.85;
    port.add(
      // Portico side walls & stone columns
      this.mesh(new T.BoxGeometry(0.42, pH, pD), m.stone, -pW / 2 + 0.21, pH / 2, pD / 2),
      this.mesh(new T.BoxGeometry(0.42, pH, pD), m.stone, pW / 2 - 0.21, pH / 2, pD / 2),
      this.mesh(new T.BoxGeometry(pW + 0.16, 0.28, pD + 0.18), m.woodDark, 0, pH + 0.08, pD / 2),
      // Recessed Arched Oak & Brass Double Entrance Doors!
      this.mesh(new T.BoxGeometry(3.25, 3.15, 0.20), m.woodDark, 0, 1.58, 0.85),
      this.mesh(new T.BoxGeometry(0.09, 3.10, 0.26), m.brass, 0, 1.56, 0.88),
      this.mesh(new T.TorusGeometry(1.56, 0.11, 8, 26, Math.PI), m.brass, 0, 2.02, 0.94),
      // Glowing 10 Ne & 18 Ar Beveled Leaded-Glass Door Inserts + Lower Carved Panels + Golden Handles
      this.mesh(new T.BoxGeometry(0.78, 1.14, 0.06), m.brass, -0.78, 1.92, 0.95),
      this.mesh(new T.BoxGeometry(0.78, 1.14, 0.06), m.brass, 0.78, 1.92, 0.95),
      this.mesh(new T.BoxGeometry(0.66, 1.02, 0.08), m.neonGlow, -0.78, 1.92, 0.96),
      this.mesh(new T.BoxGeometry(0.66, 1.02, 0.08), m.argonGlow, 0.78, 1.92, 0.96),
      // Crisp 3D brass cross-mullions over the door glass panes
      this.mesh(new T.BoxGeometry(0.036, 1.04, 0.04), m.brass, -0.78, 1.92, 1.005),
      this.mesh(new T.BoxGeometry(0.68, 0.036, 0.04), m.brass, -0.78, 1.92, 1.005),
      this.mesh(new T.BoxGeometry(0.036, 1.04, 0.04), m.brass, 0.78, 1.92, 1.005),
      this.mesh(new T.BoxGeometry(0.68, 0.036, 0.04), m.brass, 0.78, 1.92, 1.005),
      // Lower carved oak wainscot door panels with brass molding
      this.mesh(new T.BoxGeometry(0.84, 0.88, 0.05), m.brass, -0.78, 0.68, 0.95),
      this.mesh(new T.BoxGeometry(0.72, 0.76, 0.06), m.woodWarm, -0.78, 0.68, 0.96),
      this.mesh(new T.BoxGeometry(0.84, 0.88, 0.05), m.brass, 0.78, 0.68, 0.95),
      this.mesh(new T.BoxGeometry(0.72, 0.76, 0.06), m.woodWarm, 0.78, 0.68, 0.96),
      this.mesh(new T.CylinderGeometry(0.036, 0.036, 0.44, 10), m.brass, -0.22, 1.32, 1.02),
      this.mesh(new T.CylinderGeometry(0.036, 0.036, 0.44, 10), m.brass, 0.22, 1.32, 1.02)
    );
    // Steep Pitched Gable Roof crowning the Front Portico!
    const pgH = 1.95, pgHalf = pW / 2 + 0.42;
    const pgLen = Math.hypot(pgH, pgHalf);
    const pgAng = Math.atan2(pgH, pgHalf);
    const pgTri = new T.Shape();
    pgTri.moveTo(-pW / 2, 0); pgTri.lineTo(pW / 2, 0); pgTri.lineTo(0, pgH - 0.12); pgTri.closePath();
    const pgTriGeo = new T.ExtrudeGeometry(pgTri, { depth: pD + 0.15, bevelEnabled: false });
    port.add(this.mesh(pgTriGeo, m.stone, 0, pH + 0.16, 0));
    for (const side of [-1, 1]) {
      const slope = this.mesh(new T.BoxGeometry(pgLen + 0.2, 0.18, pD + 0.75), m.roofIndigo, side * (pgHalf / 2), pH + 0.18 + pgH / 2, pD / 2 + 0.15);
      slope.rotation.z = -side * pgAng;
      const snowSl = this.mesh(new T.BoxGeometry(pgLen + 0.24, 0.10, pD + 0.80), m.snow, side * (pgHalf / 2), pH + 0.30 + pgH / 2, pD / 2 + 0.15);
      snowSl.rotation.z = -side * pgAng;
      port.add(slope, snowSl);
    }
    port.add(this.mesh(new T.CylinderGeometry(0.09, 0.09, pD + 0.85, 8).rotateX(Math.PI / 2), m.brass, 0, pH + pgH + 0.22, pD / 2 + 0.15));

    // GLOWING UPRIGHT CAT-HEAD STAINED-GLASS ROSE WINDOW (CircleGeometry guarantees upright 0..1 UVs!)
    port.add(
      this.mesh(new T.CylinderGeometry(0.70, 0.70, 0.08, 28).rotateX(Math.PI / 2), m.woodDark, 0, pH + 0.94, pD + 0.16),
      this.mesh(new T.CircleGeometry(0.68, 32), m.catRose, 0, pH + 0.94, pD + 0.215),
      this.mesh(new T.TorusGeometry(0.70, 0.065, 8, 28), m.brass, 0, pH + 0.94, pD + 0.22)
    );

    // CLEAN, SIMPLE, BOLD SIGNBOARD: 「极其猫实验室」 (with cute mini brass cat ears!)
    const signTex = makeCleanSignTex(T, this.game.renderer, "极其猫实验室", "", { bg0: "#141e44", bg1: "#25346e", border: "#f4cb66", glow: "#6ef0ff" });
    const signMat = m.plain(new T.MeshStandardMaterial({ map: signTex, roughness: 0.24, emissive: new T.Color(0.24, 0.36, 0.56), emissiveMap: signTex, emissiveIntensity: 0.56 }));
    port.add(
      this.mesh(new T.BoxGeometry(3.35, 0.80, 0.14), [m.brass, m.brass, m.snow, m.brass, signMat, signMat], 0, 3.55, pD + 0.14),
      this.mesh(new T.ConeGeometry(0.16, 0.34, 4), m.brass, -1.25, 4.10, pD + 0.14),
      this.mesh(new T.ConeGeometry(0.16, 0.34, 4), m.brass, 1.25, 4.10, pD + 0.14)
    );
    // Hanging 10 Ne (orange-red) & 18 Ar (violet-blue) Brass Porch Sconces
    for (const side of [-1, 1]) {
      const sx = side * 1.92;
      port.add(
        this.mesh(new T.BoxGeometry(0.08, 0.08, 0.36), m.iron, sx, 2.95, pD + 0.14),
        this.mesh(new T.CylinderGeometry(0.03, 0.03, 0.22, 8), m.brass, sx, 2.82, pD + 0.28),
        this.mesh(new T.OctahedronGeometry(0.17, 1), side < 0 ? m.neonGlow : m.argonGlow, sx, 2.64, pD + 0.28),
        this.mesh(new T.ConeGeometry(0.20, 0.16, 6), m.brass, sx, 2.80, pD + 0.28)
      );
    }
    ext.add(port);

    // 6. STEEP SCALLOPED PITCHED ROOF + GIANT SCULPTED ARCHITECTURAL CAT-EAR DORMER TURRETS!!
    const halfSpanZ = hd + 0.58;
    const slopeLen = Math.hypot(roofH, halfSpanZ);
    const slopeAng = Math.atan2(roofH, halfSpanZ);
    for (const side of [-1, 1]) {
      const rPane = this.mesh(new T.BoxGeometry(W + 1.05, 0.24, slopeLen + 0.22), m.roofIndigo, 0, wallTopY + roofH / 2 - 0.04, side * (halfSpanZ / 2));
      rPane.rotation.x = side * slopeAng;
      const sPane = this.mesh(new T.BoxGeometry(W + 1.12, 0.12, slopeLen + 0.26), m.snow, 0, wallTopY + roofH / 2 + 0.12, side * (halfSpanZ / 2));
      sPane.rotation.x = side * slopeAng;
      ext.add(rPane, sPane);
    }
    // Golden ridge crest beam
    ext.add(this.mesh(new T.CylinderGeometry(0.14, 0.14, W + 1.25, 10).rotateZ(Math.PI / 2), m.brass, 0, ridgeY + 0.08, 0));

    // MONUMENTAL TWIN ARCHITECTURAL CAT-EAR DORMER TURRETS crowning left & right roof slopes!
    const earShape = new T.Shape();
    earShape.moveTo(-1.26, 0);
    earShape.lineTo(1.26, 0);
    earShape.lineTo(0, 2.82);
    earShape.closePath();
    const earGeo = new T.ExtrudeGeometry(earShape, { depth: 1.75, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 2 });
    earGeo.translate(0, 0, -0.875);

    const innerEarShape = new T.Shape();
    innerEarShape.moveTo(-0.70, 0.28);
    innerEarShape.lineTo(0.70, 0.28);
    innerEarShape.lineTo(0, 2.08);
    innerEarShape.closePath();
    const innerEarGeo = new T.ShapeGeometry(innerEarShape);

    for (const side of [-1, 1]) {
      const ear = new T.Group();
      ear.position.set(side * 2.95, ridgeY - 0.88, 1.05);
      ear.rotation.z = -side * 0.14;
      ear.rotation.y = side * 0.06;
      ear.add(
        this.mesh(earGeo, m.roofIndigo, 0, 0, 0),
        // Glowing pink-gold inner-ear gothic stained glass + crisp iron mullions!
        this.mesh(innerEarGeo, m.earGlass, 0, 0, 0.955),
        this.mesh(new T.BoxGeometry(0.06, 1.66, 0.045), m.iron, 0, 1.14, 0.985),
        this.mesh(new T.BoxGeometry(1.06, 0.06, 0.045), m.iron, 0, 0.88, 0.985),
        // Sculpted snow piping along both pitched ear edges & golden tip star finial!
        (() => { const b = this.mesh(new T.BoxGeometry(0.18, 3.08, 1.92), m.snow, -0.68, 1.44, 0); b.rotation.z = -0.42; return b; })(),
        (() => { const b = this.mesh(new T.BoxGeometry(0.18, 3.08, 1.92), m.snow, 0.68, 1.44, 0); b.rotation.z = 0.42; return b; })(),
        this.mesh(new T.OctahedronGeometry(0.26, 0), m.goldGlow, 0, 3.04, 0)
      );
      ext.add(ear);
    }

    // 7. STEAMPUNK STONE & COPPER ALCHEMY CHIMNEY STACK (Right-rear roof!)
    const chim = new T.Group();
    chim.position.set(3.55, wallTopY + 1.2, -2.05);
    chim.add(
      this.mesh(new T.BoxGeometry(0.88, 2.6, 0.88), m.stone, 0, 1.3, 0),
      this.mesh(new T.BoxGeometry(1.04, 0.18, 1.04), m.brass, 0, 2.55, 0),
      this.mesh(new T.CylinderGeometry(0.30, 0.34, 1.05, 14), m.roofCopper, 0, 3.12, 0),
      this.mesh(new T.TorusGeometry(0.38, 0.045, 8, 20).rotateX(Math.PI / 2), m.brass, 0, 2.88, 0),
      this.mesh(new T.TorusGeometry(0.38, 0.045, 8, 20).rotateX(Math.PI / 2), m.brass, 0, 3.22, 0),
      this.mesh(new T.ConeGeometry(0.48, 0.38, 8), m.brass, 0, 3.88, 0)
    );
    ext.add(chim);

    // 8. SPINNING 6-ELEMENT MOLECULAR WEATHERVANE SPIRE AT ROOF PEAK!
    ext.add(
      this.mesh(new T.CylinderGeometry(0.06, 0.11, 1.35, 10), m.brass, 0, ridgeY + 0.72, 0),
      this.mesh(new T.SphereGeometry(0.16, 10, 8), m.brass, 0, ridgeY + 0.25, 0)
    );
    const spireMol = new T.Group();
    spireMol.position.set(0, ridgeY + 1.72, 0);
    spireMol.add(
      this.mesh(new T.TorusGeometry(0.72, 0.065, 8, 6), m.brass),
      this.mesh(new T.TorusGeometry(0.42, 0.045, 8, 28), m.cyanGlow)
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dotMat = [m.cyanGlow, m.goldGlow, m.neonGlow, m.argonGlow, m.pinkGlow, m.emeraldGlow][i];
      spireMol.add(this.mesh(new T.SphereGeometry(0.14, 10, 8), dotMat, Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0));
    }
    ext.add(spireMol);
    this.spinners.push({ obj: spireMol, speed: 0.75 });

    // Solid exterior building colliders (main body + East/West bay alcoves + portico side piers + porch stone balustrades!)
    world.boxes.push(
      { x0: this.cx - hw - 0.15, x1: this.cx + hw + 0.15, z0: this.cz - hd - 0.15, z1: this.cz + hd + 0.95, h: 9.5 },
      { x0: this.cx - hw - 1.95, x1: this.cx - hw + 0.1, z0: this.cz - 1.85, z1: this.cz + 1.55, h: 6.5 },
      { x0: this.cx + hw - 0.1, x1: this.cx + hw + 1.95, z0: this.cz - 1.85, z1: this.cz + 1.55, h: 6.5 },
      // Projecting front portico side piers (central 3.24m doorway remains 100% wide open!)
      { x0: this.cx - 2.12, x1: this.cx - 1.62, z0: this.cz + hd + 0.85, z1: this.cz + hd + 1.50, h: 6.0 },
      { x0: this.cx + 1.62, x1: this.cx + 2.12, z0: this.cz + hd + 0.85, z1: this.cz + hd + 1.50, h: 6.0 },
      // Front porch stone balustrades & golden cat-ear newel posts (central 2.68m stairs remain 100% open!)
      { x0: this.cx - 2.46, x1: this.cx - 2.18, z0: this.cz + hd + 0.15, z1: this.cz + hd + 2.26, h: 1.42 },
      { x0: this.cx + 2.18, x1: this.cx + 2.46, z0: this.cz + hd + 0.15, z1: this.cz + hd + 2.26, h: 1.42 },
      { x0: this.cx - 2.46, x1: this.cx - 1.34, z0: this.cz + hd + 2.00, z1: this.cz + hd + 2.28, h: 1.52 },
      { x0: this.cx + 1.34, x1: this.cx + 2.46, z0: this.cz + hd + 2.00, z1: this.cz + hd + 2.28, h: 1.52 }
    );

    // Warm outdoor entrance glow
    const el = new T.PointLight(0xffdfb8, 12, 18, 1.5);
    el.position.set(this.cx, this.baseY + 3.4, this.cz + hd + 2.2);
    scene.add(el);
    this.extLights.push({ l: el, base: 12 });

    // Exterior Door Enter Spot!
    world.spots.push({
      id: "chemlab_enter",
      pos: new T.Vector3(this.cx, this.baseY + 1.45, this.cz + hd + 1.55),
      r: 2.9,
      label: "推门进入「极其猫实验室」",
      can: () => !this.inside && !(this.game.cabin && this.game.cabin.inside) && !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.enter()
    });

    scene.add(ext);
  }

  // ===========================================================================
  // PART B: DEDICATED INDOOR GRAND COLLIDER LAB AT (1500, 1500, 1500)!
  // ===========================================================================
  _buildInterior() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const m = this.m;

    const O = LAB_ORIGIN;
    const IW = 16.0, ID = 14.0, IH = 5.6;
    const hw = IW / 2, hd = ID / 2;

    const g = new T.Group();
    g.name = "jiqimao_chemlab_int";
    g.position.set(O.x, O.y, O.z);
    g.visible = false; // Toggled ON only while player is inside!
    this.intGroup = g;

    const isIn = () => this.inside && !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat;

    // -------------------------------------------------------------------------
    // 1. GRAND ENCLOSED HALL SHELL (Mosaic Tile Floor, Stone Wainscot, Cathedral Aurora Windows!)
    // -------------------------------------------------------------------------
    g.add(
      // Crisp 512x512 Octagonal Slate & Brass Inlay Mosaic Floor
      this.mesh(new T.BoxGeometry(IW + 0.6, 0.24, ID + 0.6), m.labFloor, 0, -0.12, 0),
      // 4 Solid enclosing walls + textured carved ashlar stone lower wainscot + brass dado & crown trim
      this.mesh(new T.BoxGeometry(IW + 0.4, IH, 0.24), m.labWall, 0, IH / 2, -hd - 0.10),
      this.mesh(new T.BoxGeometry(IW + 0.4, IH, 0.24), m.labWall, 0, IH / 2, hd + 0.10),
      this.mesh(new T.BoxGeometry(0.24, IH, ID + 0.4), m.labWall, -hw - 0.10, IH / 2, 0),
      this.mesh(new T.BoxGeometry(0.24, IH, ID + 0.4), m.labWall, hw + 0.10, IH / 2, 0),
      this.mesh(new T.BoxGeometry(IW, 1.18, 0.08), m.stone, 0, 0.59, -hd + 0.04),
      this.mesh(new T.BoxGeometry(IW, 1.18, 0.08), m.stone, 0, 0.59, hd - 0.04),
      this.mesh(new T.BoxGeometry(0.08, 1.18, ID), m.stone, -hw + 0.04, 0.59, 0),
      this.mesh(new T.BoxGeometry(0.08, 1.18, ID), m.stone, hw - 0.04, 0.59, 0),
      this.mesh(new T.BoxGeometry(IW, 0.08, 0.12), m.brass, 0, 1.20, -hd + 0.06),
      this.mesh(new T.BoxGeometry(IW, 0.08, 0.12), m.brass, 0, 1.20, hd - 0.06),
      this.mesh(new T.BoxGeometry(0.12, 0.08, ID), m.brass, -hw + 0.06, 1.20, 0),
      this.mesh(new T.BoxGeometry(0.12, 0.08, ID), m.brass, hw - 0.06, 1.20, 0),
      this.mesh(new T.BoxGeometry(IW, 0.14, 0.16), m.brass, 0, IH - 0.07, -hd + 0.08),
      this.mesh(new T.BoxGeometry(IW, 0.14, 0.16), m.brass, 0, IH - 0.07, hd - 0.08),
      this.mesh(new T.BoxGeometry(0.16, 0.14, ID), m.brass, -hw + 0.08, IH - 0.07, 0),
      this.mesh(new T.BoxGeometry(0.16, 0.14, ID), m.brass, hw - 0.08, IH - 0.07, 0),
      // Coffered Starlight Laboratory Ceiling with Illuminated Skylight Panels
      this.mesh(new T.BoxGeometry(IW + 0.4, 0.22, ID + 0.4), m.indigo, 0, IH + 0.11, 0),
      this.mesh(new T.BoxGeometry(9.6, 0.05, 7.6), m.winGlow, 0, IH - 0.01, -0.5)
    );

    // Architectural carved timber-and-brass ceiling trusses & wall pilasters
    for (const rx of [-4.8, 0, 4.8]) {
      g.add(this.mesh(new T.BoxGeometry(0.20, 0.22, ID), m.woodDark, rx, IH - 0.11, 0));
      g.add(this.mesh(new T.BoxGeometry(0.24, 0.05, ID), m.brass, rx, IH - 0.23, 0));
    }
    for (const rz of [-4.2, -0.5, 3.2]) {
      g.add(this.mesh(new T.BoxGeometry(IW, 0.20, 0.20), m.woodDark, 0, IH - 0.10, rz));
      g.add(this.mesh(new T.BoxGeometry(IW, 0.05, 0.24), m.brass, 0, IH - 0.21, rz));
    }
    for (const [px, pz] of [[-hw + 0.2, -hd + 0.2], [hw - 0.2, -hd + 0.2], [-hw + 0.2, hd - 0.2], [hw - 0.2, hd - 0.2], [-4.8, -hd + 0.14], [4.8, -hd + 0.14], [hw - 0.14, -3.6], [hw - 0.14, 2.4]]) {
      g.add(
        this.mesh(new T.BoxGeometry(0.36, IH, 0.36), m.stonePlain, px, IH / 2, pz),
        this.mesh(new T.BoxGeometry(0.42, 0.12, 0.42), m.brass, px, 1.24, pz),
        this.mesh(new T.BoxGeometry(0.42, 0.14, 0.42), m.brass, px, IH - 0.20, pz)
      );
    }

    // 6 CRISP RECESSED CATHEDRAL STAINED-GLASS AURORA WINDOWS (ZERO BLUR!)
    const inWinMats = { frame: m.woodDark, brass: m.brass, snow: m.stonePlain, pane: m.winNight };
    for (const [wx, wz, ry] of [
      [-6.2, -hd + 0.12, 0],
      [6.2, -hd + 0.12, 0],
      [hw - 0.12, -5.0, -Math.PI / 2],
      [hw - 0.12, 4.2, -Math.PI / 2],
      [-4.6, hd - 0.12, Math.PI],
      [4.6, hd - 0.12, Math.PI]
    ]) {
      const iw = buildCrispWindow(T, inWinMats, { w: 1.55, h: 2.35, arch: true });
      iw.position.set(wx, 2.95, wz);
      iw.rotation.y = ry;
      g.add(iw);
    }

    // Built-in Carved Oak Apothecary Potion Bookshelf in SE Alcove (x = +6.55, z = +4.45)!
    const apoth = new T.Group();
    apoth.position.set(6.55, 0, 4.45);
    apoth.rotation.y = -Math.PI * 0.28;
    apoth.add(
      this.mesh(new T.BoxGeometry(2.15, 2.55, 0.56), m.woodDark, 0, 1.28, 0),
      this.mesh(new T.BoxGeometry(2.26, 0.12, 0.64), m.brass, 0, 2.58, 0)
    );
    const botCols = [m.cyanGlow, m.neonGlow, m.argonGlow, m.goldGlow, m.pinkGlow, m.emeraldGlow];
    for (let sh = 0; sh < 3; sh++) {
      const sy = 0.72 + sh * 0.64;
      apoth.add(this.mesh(new T.BoxGeometry(1.98, 0.05, 0.46), m.oak, 0, sy, 0.06));
      for (let b = 0; b < 6; b++) {
        apoth.add(this.mesh(new T.CylinderGeometry(0.055, 0.065, 0.24, 10), botCols[(sh * 2 + b) % botCols.length], -0.75 + b * 0.30, sy + 0.15, 0.12));
      }
    }
    g.add(apoth);
    world.circles.push({ x: O.x + 6.55, z: O.z + 4.45, r: 1.15 });

    // Glowing Circular Particle-Collider Floor Emblem (with polygonOffset -> 0 Z-fighting!)
    const ringMat = m.plain(new T.MeshStandardMaterial({
      color: 0x385888, emissive: new T.Color(0.14, 0.36, 0.56), emissiveIntensity: 0.42,
      roughness: 0.30, metalness: 0.65, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
    }));
    g.add(
      this.mesh(new T.CylinderGeometry(3.45, 3.45, 0.016, 36), ringMat, 0, 0.008, -0.5),
      this.mesh(new T.TorusGeometry(3.45, 0.055, 8, 48).rotateX(Math.PI / 2), m.brass, 0, 0.022, -0.5),
      this.mesh(new T.TorusGeometry(2.35, 0.032, 6, 40).rotateX(Math.PI / 2), m.cyanGlow, 0, 0.024, -0.5),
      // Overhead collider collector ring suspended from skylight!
      this.mesh(new T.TorusGeometry(2.2, 0.08, 8, 36).rotateX(Math.PI / 2), m.brass, 0, IH - 0.42, -0.5),
      this.mesh(new T.TorusGeometry(1.7, 0.04, 8, 32).rotateX(Math.PI / 2), m.cyanGlow, 0, IH - 0.45, -0.5)
    );

    // Indoor walkable floor platform + solid full-height 4-wall boundaries (omit h at y=1500 so resolve() never vaults over indoor walls!)
    world.platforms.push({
      test: (px, pz) => Math.abs(px - O.x) < hw + 0.6 && Math.abs(pz - O.z) < hd + 0.6,
      y: () => O.y,
      wood: true
    });
    const addBox = (x0, x1, z0, z1) => world.boxes.push({ x0: O.x + x0, x1: O.x + x1, z0: O.z + z0, z1: O.z + z1 });
    addBox(-hw - 1.2, hw + 1.2, -hd - 1.2, -hd + 0.22);
    addBox(-hw - 1.2, hw + 1.2, hd - 0.22, hd + 1.2);
    addBox(-hw - 1.2, -hw + 0.22, -hd - 1.2, hd + 1.2);
    addBox(hw - 0.22, hw + 1.2, -hd - 1.2, hd + 1.2);

    // -------------------------------------------------------------------------
    // 2. SOUTH WALL EXIT AIRLOCK DOUBLE DOORS (z = +hd - 0.12)
    // -------------------------------------------------------------------------
    const exitG = new T.Group();
    exitG.position.set(0, 0, hd - 0.14);
    const exitTex = makeCleanSignTex(T, this.game.renderer, "返回雪境 · EXIT", "", { border: "#f2ca66", glow: "#ffe088" });
    const exitMat = m.plain(new T.MeshStandardMaterial({ map: exitTex, roughness: 0.25, emissive: new T.Color(0.22, 0.30, 0.42), emissiveMap: exitTex, emissiveIntensity: 0.55 }));
    exitG.add(
      this.mesh(new T.BoxGeometry(3.2, 3.1, 0.16), m.woodDark, 0, 1.55, 0),
      this.mesh(new T.BoxGeometry(3.4, 0.14, 0.24), m.brass, 0, 3.15, -0.04),
      this.mesh(new T.BoxGeometry(0.08, 3.05, 0.20), m.brass, 0, 1.54, -0.04),
      this.mesh(new T.CylinderGeometry(0.032, 0.032, 0.40, 10), m.brass, -0.22, 1.35, -0.14),
      this.mesh(new T.CylinderGeometry(0.032, 0.032, 0.40, 10), m.brass, 0.22, 1.35, -0.14),
      this.mesh(new T.PlaneGeometry(2.4, 0.54), exitMat, 0, 3.65, -0.04).rotateY(Math.PI)
    );
    g.add(exitG);
    world.spots.push({
      id: "chemlab_exit",
      pos: new T.Vector3(O.x, O.y + 1.25, O.z + hd - 0.65),
      r: 2.3,
      label: "走出「极其猫实验室」（回到雪境）",
      can: isIn,
      act: () => this.leave()
    });

    // -------------------------------------------------------------------------
    // 3. SOUTH-WEST: 🥼 极其猫装备柜 (Lab Gear Wardrobe, x = -5.4, z = +4.65)
    // -------------------------------------------------------------------------
    const lockG = new T.Group();
    lockG.position.set(-5.4, 0, 4.65);
    lockG.rotation.y = Math.PI * 0.20;

    const lockSignTex = makeCleanSignTex(T, this.game.renderer, "极其猫装备柜", "", { border: "#52f2ff", glow: "#6ef0ff" });
    const lockSignMat = m.plain(new T.MeshStandardMaterial({ map: lockSignTex, roughness: 0.25, emissive: new T.Color(0.20, 0.40, 0.56), emissiveMap: lockSignTex, emissiveIntensity: 0.62 }));

    lockG.add(
      this.mesh(new T.BoxGeometry(2.10, 0.42, 0.92), m.indigo, 0, 0.21, 0),
      this.mesh(new T.BoxGeometry(2.18, 0.07, 0.98), m.brass, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(2.10, 2.25, 0.14), m.indigo, 0, 1.55, -0.40),
      this.mesh(new T.BoxGeometry(0.12, 2.25, 0.88), m.brass, -1.00, 1.55, 0),
      this.mesh(new T.BoxGeometry(0.12, 2.25, 0.88), m.brass, 1.00, 1.55, 0),
      this.mesh(new T.BoxGeometry(2.20, 0.16, 0.98), m.brass, 0, 2.68, 0),
      this.mesh(new T.PlaneGeometry(2.05, 0.48), lockSignMat, 0, 3.04, 0.42),
      (() => { const p = this.mesh(new T.BoxGeometry(1.88, 2.12, 0.04), m.glassPane, 0, 1.54, 0.42); p.renderOrder = 3; return p; })()
    );

    // Floating 3D Scientist Gear Display Mannequin Preview inside the glass wardrobe!
    const lPrev = new T.Group();
    lPrev.position.set(0, 1.48, 0.04);
    // Display white lab collar + twin glowing Ne/Ar pods + neon goggles perched on top!
    lPrev.add(
      this.mesh(new T.CylinderGeometry(0.16, 0.34, 0.52, 16), m.whiteCoat, 0, -0.18, 0),
      this.mesh(new T.TorusGeometry(0.34, 0.022, 8, 24).rotateX(Math.PI / 2), m.brass, 0, -0.44, 0),
      this.mesh(new T.OctahedronGeometry(0.06, 0), m.cyanGlow, 0.16, -0.12, 0.22),
      // Twin preview Ne / Ar pods
      this.mesh(new T.CylinderGeometry(0.065, 0.065, 0.42, 12), m.neonGlow, -0.52, -0.05, -0.05),
      this.mesh(new T.CylinderGeometry(0.065, 0.065, 0.42, 12), m.argonGlow, 0.52, -0.05, -0.05),
      // Goggles display perched at head level
      this.mesh(new T.TorusGeometry(0.11, 0.025, 8, 20), m.brass, -0.14, 0.38, 0.08),
      this.mesh(new T.TorusGeometry(0.11, 0.025, 8, 20), m.brass, 0.14, 0.38, 0.08),
      this.mesh(new T.CylinderGeometry(0.095, 0.095, 0.03, 16).rotateX(Math.PI / 2), m.neonGlow, -0.14, 0.38, 0.08),
      this.mesh(new T.CylinderGeometry(0.095, 0.095, 0.03, 16).rotateX(Math.PI / 2), m.argonGlow, 0.14, 0.38, 0.08),
      // Orbiting halo preview ring
      this.mesh(new T.TorusGeometry(0.38, 0.014, 8, 28).rotateX(Math.PI * 0.45), m.goldGlow, 0, 0.68, 0)
    );
    this.lockerPreview = lPrev;
    lockG.add(lPrev);
    g.add(lockG);

    world.circles.push({ x: O.x - 5.4, z: O.z + 4.65, r: 1.15 });
    world.spots.push({
      id: "chemlab_locker",
      pos: new T.Vector3(O.x - 4.55, O.y + 1.25, O.z + 3.95),
      r: 2.75,
      label: () => {
        const tier = this.game.labGear ? this.game.labGear.tier : 0;
        if (tier === 0) return "穿戴「极其猫化学装备」（护目镜·白大褂·双子反应罐）";
        if (tier === 1) return "升级「118 号炼金大师模式」（悬浮四元素光环！）";
        return "脱下化学装备 · 换回日常装束";
      },
      can: isIn,
      act: () => {
        this.game.labGear && this.game.labGear.cycle();
      }
    });

    // -------------------------------------------------------------------------
    // 4. FOUR INTERACTIVE GEMINI 4 ELEMENT REACTOR PILLARS + 3D ENERGY LASER BEAMS!
    //    (1 H, 6 C, 10 Ne, 18 Ar -> shooting glowing beams into the Center 118 Og Vault!)
    // -------------------------------------------------------------------------
    const vaultTarget = new T.Vector3(0, 2.35, -0.5);
    const matMap = { H: m.cyanGlow, C: m.goldGlow, Ne: m.neonGlow, Ar: m.argonGlow };

    for (const rd of REACTOR_DEFS) {
      const pg = new T.Group();
      pg.position.set(rd.x, 0, rd.z);
      pg.rotation.y = rd.rotY;

      const coreMat = matMap[rd.id];
      const bTex = this._makeBadgeTex(rd.num, rd.sym, rd.sub, rd.hex);
      const bMat = m.plain(new T.MeshStandardMaterial({ map: bTex, roughness: 0.24, emissive: new T.Color(0.24, 0.24, 0.34), emissiveMap: bTex, emissiveIntensity: 0.55 }));

      // Pedestal cabinet + glowing element badge + tall glass reactor cylinder!
      const jar = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 1.12, 18), m.flaskGlass);
      jar.position.set(0, 1.56, 0);
      jar.renderOrder = 2;

      pg.add(
        this.mesh(new T.BoxGeometry(0.86, 0.92, 0.86), m.indigo, 0, 0.46, 0),
        this.mesh(new T.BoxGeometry(0.94, 0.08, 0.94), m.brass, 0, 0.95, 0),
        this.mesh(new T.PlaneGeometry(0.62, 0.62), bMat, 0, 0.48, 0.445),
        this.mesh(new T.CylinderGeometry(0.32, 0.35, 0.08, 18), m.brass, 0, 1.02, 0),
        this.mesh(new T.CylinderGeometry(0.32, 0.32, 0.08, 18), m.brass, 0, 2.15, 0),
        this.mesh(new T.SphereGeometry(0.11, 12, 8), coreMat, 0, 2.32, 0),
        jar
      );

      let core;
      if (rd.kind === "diamond") {
        core = this.mesh(new T.OctahedronGeometry(0.20, 0), coreMat, 0, 1.56, 0);
        this.spinners.push({ obj: core, speed: 1.6 });
      } else {
        core = this.mesh(new T.CylinderGeometry(0.085, 0.085, 0.92, 14), coreMat, 0, 1.56, 0);
      }
      core.renderOrder = 1;
      pg.add(core);
      this.reactorCores[rd.id] = core;
      g.add(pg);

      // 3D Energy Conduit Laser Beam connecting this pillar emitter -> Central 118 Og Vault!
      const pStart = new T.Vector3(rd.x, 2.32, rd.z);
      const dir = new T.Vector3().subVectors(vaultTarget, pStart);
      const beamMat = m.plain(new T.MeshBasicMaterial({
        color: rd.color, transparent: true, opacity: 0.86, depthWrite: false
      }));
      const beam = new T.Mesh(new T.CylinderGeometry(0.042, 0.042, dir.length(), 10), beamMat);
      beam.position.copy(pStart).add(vaultTarget).multiplyScalar(0.5);
      beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      beam.visible = false; // Lights up dramatically when player charges this element!
      beam.renderOrder = 4;
      g.add(beam);
      this.reactorBeams[rd.id] = beam;

      world.circles.push({ x: O.x + rd.x, z: O.z + rd.z, r: 0.62 });
      world.spots.push({
        id: `chemlab_reactor_${rd.id}`,
        pos: new T.Vector3(O.x + rd.x, O.y + 1.15, O.z + rd.z),
        r: 2.35,
        label: () =>
          this.charged.has(rd.id)
            ? `✓ ${rd.num} ${rd.sym}（${rd.sub}）光束已接入！（按 E 重温元素梗）`
            : `⚡ 激活「${rd.num} ${rd.sym} · ${rd.sub}」元素反应柱（${this.charged.size}/4）`,
        can: isIn,
        act: () => this.activateReactor(rd)
      });
    }

    // -------------------------------------------------------------------------
    // 5. CENTER: 🔒 118 Og 神秘武器封存核心舱 (Secret Weapon Containment Vault!)
    // -------------------------------------------------------------------------
    const vg = new T.Group();
    vg.position.set(0, 0, -0.5);

    const vSignTex = this._makeBadgeTex("118", "Og", "神秘武器舱", "#ff5ec8");
    const vSignMat = m.plain(new T.MeshStandardMaterial({ map: vSignTex, roughness: 0.22, emissive: new T.Color(0.32, 0.18, 0.44), emissiveMap: vSignTex, emissiveIntensity: 0.62 }));

    vg.add(
      // Raised stepped circular Particle-Collider base pedestal
      this.mesh(new T.CylinderGeometry(1.42, 1.62, 0.24, 24), m.stoneDark, 0, 0.12, 0),
      this.mesh(new T.CylinderGeometry(1.12, 1.28, 0.72, 24), m.indigo, 0, 0.60, 0),
      this.mesh(new T.TorusGeometry(1.14, 0.055, 8, 32).rotateX(Math.PI / 2), m.brass, 0, 0.96, 0),
      this.mesh(new T.TorusGeometry(0.92, 0.036, 8, 32).rotateX(Math.PI / 2), m.pinkGlow, 0, 1.00, 0),
      this.mesh(new T.PlaneGeometry(0.58, 0.58), vSignMat, 0, 0.58, 1.24),
      // Upper overhead beam-receiver crown
      this.mesh(new T.CylinderGeometry(0.65, 0.85, 0.18, 20), m.brass, 0, 2.86, 0),
      this.mesh(new T.TorusGeometry(0.76, 0.04, 8, 28).rotateX(Math.PI / 2), m.pinkGlow, 0, 2.76, 0),
      this.mesh(new T.CylinderGeometry(0.08, 0.08, 2.55, 12), m.brass, 0, 4.18, 0)
    );

    // 4 Status Indicator Jewels on the Vault front collar (H, C, Ne, Ar)
    REACTOR_DEFS.forEach((rd, idx) => {
      const ang = -0.54 + idx * 0.36;
      const ledMat = m.plain(new T.MeshStandardMaterial({
        color: 0x33405c, emissive: new T.Color(0x111828), emissiveIntensity: 0.3, roughness: 0.2
      }));
      const led = this.mesh(new T.SphereGeometry(0.075, 10, 8), ledMat, Math.sin(ang) * 1.18, 1.02, Math.cos(ang) * 1.18);
      vg.add(led);
      this.vaultLeds[rd.id] = { mesh: led, mat: ledMat, color: rd.color };
    });

    // 3 Counter-Rotating Golden Gyroscope Containment Rings around the secret weapon!
    for (let i = 0; i < 3; i++) {
      const r = 0.72 + i * 0.12;
      const ring = this.mesh(new T.TorusGeometry(r, 0.022, 8, 36), i === 1 ? m.cyanGlow : m.brass, 0, 1.88, 0);
      ring.rotation.set(i * 0.9, i * 1.1, 0);
      vg.add(ring);
      this.vaultGyro.push(ring);
    }

    // Floating 3D Preview of the Secret Weapon「118 Og · 周期表元素炮」inside the vault!
    const previewBuilt = buildChemGunMesh(T, this.wrapMat);
    const previewG = new T.Group();
    previewG.position.set(0, 1.88, 0);
    previewBuilt.root.position.set(0, -0.06, -0.18);
    previewBuilt.root.scale.setScalar(1.55);
    previewG.add(previewBuilt.root);
    vg.add(previewG);
    this.vaultWeaponPreview = previewG;

    // Translucent Laser-Shielded Containment Glass Cylinder (slides UP & fades on unlock!)
    this.vaultGlassMat = m.plain(new T.MeshStandardMaterial({
      color: 0xb6ecff, emissive: new T.Color(0.26, 0.56, 0.92), emissiveIntensity: 0.42,
      roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.34, depthWrite: false, side: T.DoubleSide
    }));
    const vGlass = new T.Mesh(new T.CylinderGeometry(0.82, 0.82, 1.76, 24, 1, true), this.vaultGlassMat);
    vGlass.position.set(0, 1.88, 0);
    vGlass.renderOrder = 3;
    vg.add(vGlass);
    this.vaultGlass = vGlass;

    g.add(vg);
    world.circles.push({ x: O.x, z: O.z - 0.5, r: 1.52 });
    world.spots.push({
      id: "chemlab_vault",
      pos: new T.Vector3(O.x, O.y + 1.25, O.z + 0.95),
      r: 2.85,
      label: () => {
        const unlocked = !!(this.game.tools && this.game.tools.chemGunUnlocked);
        const hasGear = !!(this.game.labGear && this.game.labGear.tier > 0);
        if (unlocked) return "⚡ 再次启动 118 Og 对撞烟花秀 / 装备「周期表元素炮」";
        if (!hasGear) return "🔒 118 Og 神秘武器舱（请先去西南角更衣柜穿戴化学装备！）";
        if (this.charged.size < 4) return `🔒 118 Og 神秘武器舱（还需激活 ${4 - this.charged.size} 根元素反应柱）`;
        return "⚡ 四元素光束已齐聚！按 E 启动 118 Og 合成并解锁神秘武器！！";
      },
      can: isIn,
      act: () => this.interactVault()
    });

    // If secret weapon was already unlocked in a previous session, pre-light the collider cleanly!
    this.syncUnlockedState();

    // -------------------------------------------------------------------------
    // 6. NORTH WALL: ⚗️ 中央化学反应实验台 (5 Live Experiments) + Gemini 4 热梗黑板
    // -------------------------------------------------------------------------
    const benchZ = -5.35;
    const benchG = new T.Group();
    benchG.position.set(0, 0, benchZ);
    benchG.add(
      this.mesh(new T.BoxGeometry(4.4, 0.88, 1.32), m.woodDark, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(4.62, 0.10, 1.46), m.granite, 0, 0.92, 0),
      this.mesh(new T.BoxGeometry(4.66, 0.04, 1.50), m.brass, 0, 0.87, 0),
      this._mkErlenmeyer(1.05, m.cyanGlow, m.flaskGlass, -1.62, 0.97, -0.18).group,
      this._mkErlenmeyer(0.95, m.neonGlow, m.flaskGlass, -1.18, 0.97, 0.14).group,
      this._mkErlenmeyer(1.00, m.argonGlow, m.flaskGlass, 1.22, 0.97, 0.10).group,
      this._mkErlenmeyer(1.10, m.goldGlow, m.flaskGlass, 1.68, 0.97, -0.15).group,
      this.mesh(new T.BoxGeometry(0.46, 0.04, 0.36), m.iron, 0, 0.99, -0.18),
      this.mesh(new T.CylinderGeometry(0.022, 0.022, 1.05, 8), m.iron, -0.18, 1.50, -0.26),
      this.mesh(new T.TorusGeometry(0.15, 0.015, 6, 18).rotateX(Math.PI / 2), m.brass, 0, 1.30, -0.02),
      this.mesh(new T.CylinderGeometry(0.014, 0.014, 0.24, 6).rotateZ(Math.PI / 2), m.brass, -0.09, 1.30, -0.14),
      this.mesh(new T.CylinderGeometry(0.09, 0.12, 0.06, 12), m.iron, 0, 1.00, -0.02),
      this.mesh(new T.CylinderGeometry(0.026, 0.030, 0.20, 10), m.brass, 0, 1.12, -0.02)
    );

    this.reactionLiquidMat = m.plain(new T.MeshStandardMaterial({
      color: 0xff6a3d, emissive: new T.Color(0xff6a3d), emissiveIntensity: 1.05, roughness: 0.10
    }));
    const mainFlask = this._mkErlenmeyer(1.38, this.reactionLiquidMat, m.flaskGlass, 0, 1.28, -0.02);
    this.reactionLiquid = mainFlask.liquid;
    benchG.add(mainFlask.group);

    this.burnerFlameMat = m.plain(new T.MeshBasicMaterial({ color: 0x9b6cff, transparent: true, opacity: 0.88, depthWrite: false }));
    this.burnerFlame = new T.Mesh(new T.ConeGeometry(0.048, 0.16, 10), this.burnerFlameMat);
    this.burnerFlame.position.set(0, 1.26, -0.02);
    this.burnerFlame.renderOrder = 4;
    benchG.add(this.burnerFlame);

    this.foamMat = m.plain(new T.MeshStandardMaterial({
      color: 0xffc6ec, emissive: new T.Color(0.85, 0.32, 0.68), emissiveIntensity: 0.45, roughness: 0.46
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
      new T.Vector3(0.0, 1.80, -0.02), new T.Vector3(0.32, 2.02, -0.05),
      new T.Vector3(0.72, 1.62, -0.05), new T.Vector3(0.88, 1.24, -0.02)
    ]);
    const condTube = new T.Mesh(new T.TubeGeometry(condCurve, 22, 0.026, 8, false), m.flaskGlass);
    condTube.renderOrder = 2;
    benchG.add(condTube, this._mkErlenmeyer(0.85, m.goldGlow, m.flaskGlass, 0.88, 0.97, -0.02).group);

    const bubGeo = new T.SphereGeometry(0.13, 12, 10);
    for (let i = 0; i < 12; i++) {
      const bm = m.plain(new T.MeshStandardMaterial({
        color: i % 2 ? 0x9cf6ff : 0xffb4eb, emissive: new T.Color(i % 2 ? 0x26c8ff : 0xff58c8),
        emissiveIntensity: 0.60, roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.58, depthWrite: false
      }));
      const bs = new T.Mesh(bubGeo, bm);
      bs.visible = false;
      bs.renderOrder = 5;
      g.add(bs);
      this.bubbles.push({ mesh: bs, vx: 0, vy: 0, vz: 0, life: 0, ph: i * 1.1 });
    }
    g.add(benchG);
    addBox(-2.35, 2.35, benchZ - 0.78, benchZ + 0.78, 1.2);

    // North Wall Gemini 4 Meme Chalkboard!
    const cbTex = this._makeChalkboardTex();
    const cbMat = m.plain(new T.MeshStandardMaterial({ map: cbTex, roughness: 0.72, emissive: new T.Color(0.16, 0.24, 0.22), emissiveMap: cbTex, emissiveIntensity: 0.34 }));
    g.add(this.mesh(new T.BoxGeometry(5.6, 2.65, 0.10), [m.oak, m.oak, m.oak, m.oak, cbMat, m.oak], 0, 2.88, -hd + 0.22));

    world.spots.push({
      id: "chemlab_experiment",
      pos: new T.Vector3(O.x, O.y + 1.15, O.z + benchZ + 0.95),
      r: 2.8,
      label: () => `做化学实验：${EXPERIMENTS[this.expIdx].name}`,
      can: isIn,
      act: () => this.runExperiment()
    });

    // -------------------------------------------------------------------------
    // 7. WEST WALL: 🧬 Giant Gemini 4 Periodic Table + Microscope & pH Elixir Desk!
    // -------------------------------------------------------------------------
    const ptTex = this._makePeriodicTableTex();
    const ptMat = m.plain(new T.MeshStandardMaterial({ map: ptTex, roughness: 0.32, emissive: new T.Color(0.24, 0.36, 0.56), emissiveMap: ptTex, emissiveIntensity: 0.52 }));
    g.add(this.mesh(new T.BoxGeometry(0.10, 2.60, 5.20), [ptMat, m.woodDark, m.woodDark, m.woodDark, m.woodDark, m.woodDark], -hw + 0.22, 2.82, -1.6));

    world.spots.push({
      id: "chemlab_notes",
      pos: new T.Vector3(O.x - hw + 1.35, O.y + 1.25, O.z - 2.6),
      r: 2.5,
      label: "翻看「Gemini 4 元素周期表 & 化学圈热梗笔记」",
      can: isIn,
      act: () => {
        this._playLabSound("holo");
        this.game.ui && this.game.ui.toast(CHEM_NOTES[this.noteIdx++ % CHEM_NOTES.length], 8.0);
      }
    });

    const deskG = new T.Group();
    deskG.position.set(-6.6, 0, 0.45);
    deskG.rotation.y = Math.PI * 0.5;
    deskG.add(
      this.mesh(new T.BoxGeometry(2.3, 0.86, 0.98), m.woodDark, 0, 0.43, 0),
      this.mesh(new T.BoxGeometry(2.42, 0.08, 1.08), m.granite, 0, 0.89, 0)
    );
    const micG = new T.Group();
    micG.position.set(-0.68, 0.93, 0);
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
    rackG.position.set(0.06, 0.93, -0.14);
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

    this.elixirMat = m.plain(new T.MeshStandardMaterial({
      color: 0x3a9cff, emissive: new T.Color(0x1e6cff), emissiveIntensity: 0.95, roughness: 0.10
    }));
    const elixir = this._mkErlenmeyer(1.12, this.elixirMat, m.flaskGlass, 0.76, 0.93, 0.06);
    this.elixirLiquid = elixir.liquid;
    deskG.add(elixir.group);
    g.add(deskG);
    addBox(-7.2, -6.0, -0.8, 1.7, 1.15);

    world.spots.push({
      id: "chemlab_elixir",
      pos: new T.Vector3(O.x - 5.9, O.y + 1.1, O.z + 0.5),
      r: 2.4,
      label: () => (this.elixirPink ? "滴入星光小苏打 · 变回梦幻蝶豆花蓝！" : "滴入柠檬汁试喝「变色星光花青素热饮」（满格回温）"),
      can: isIn,
      act: () => this.sipColorElixir()
    });

    // -------------------------------------------------------------------------
    // 8. EAST WING: 💎 3D ATOMIC & CRYSTAL HOLO-PEDESTAL (x = +6.1, z = -0.6)
    // -------------------------------------------------------------------------
    const pedG = new T.Group();
    pedG.position.set(6.1, 0, -0.6);
    pedG.add(
      this.mesh(new T.CylinderGeometry(0.72, 0.88, 0.98, 18), m.indigo, 0, 0.49, 0),
      this.mesh(new T.TorusGeometry(0.74, 0.048, 8, 28).rotateX(Math.PI / 2), m.brass, 0, 0.98, 0),
      this.mesh(new T.TorusGeometry(0.58, 0.035, 8, 28).rotateX(Math.PI / 2), m.cyanGlow, 0, 1.02, 0)
    );
    const molPivot = new T.Group();
    molPivot.position.set(0, 1.98, 0);
    molPivot.scale.setScalar(1.18);
    this.moleculeGroups = this._buildMoleculeModels();
    for (const mg of this.moleculeGroups) molPivot.add(mg);
    this.moleculePivot = molPivot;
    pedG.add(molPivot);
    g.add(pedG);

    world.circles.push({ x: O.x + 6.1, z: O.z - 0.6, r: 0.92 });
    world.spots.push({
      id: "chemlab_molecule",
      pos: new T.Vector3(O.x + 5.5, O.y + 1.2, O.z - 0.6),
      r: 2.6,
      label: () => `切换 3D 分子/晶格（当前：${MOLECULE_INFO[this.molIdx].name}）`,
      can: isIn,
      act: () => this.cycleMolecule()
    });

    // Balanced, rich indoor laboratory lighting (OFF outdoors -> 0 GPU cost outside!)
    const addIntLight = (lx, ly, lz, hex, intensity, dist) => {
      const l = new T.PointLight(hex, 0, dist, 1.35);
      l.position.set(O.x + lx, O.y + ly, O.z + lz);
      scene.add(l);
      this.intLights.push({ l, base: intensity });
    };
    addIntLight(0, 4.6, -0.5, 0xc2f2ff, 26, 24);
    addIntLight(0, 3.8, -4.6, 0xffe6bd, 18, 18);
    addIntLight(-5.2, 3.8, 0.8, 0xa8e8ff, 18, 18);
    addIntLight(5.2, 3.8, 0.4, 0xe8d0ff, 18, 18);
    addIntLight(0, 3.6, 4.8, 0xffdfb0, 15, 16);

    scene.add(g);
  }

  syncUnlockedState() {
    if (!(this.game.tools && this.game.tools.chemGunUnlocked)) return;
    for (const rd of REACTOR_DEFS) {
      this.charged.add(rd.id);
      if (this.reactorBeams[rd.id]) this.reactorBeams[rd.id].visible = true;
      const ld = this.vaultLeds[rd.id];
      if (ld) {
        ld.mat.color.setHex(ld.color);
        ld.mat.emissive.setHex(ld.color);
        ld.mat.emissiveIntensity = 1.4;
      }
    }
    this.vaultOpenK = 1;
    if (this.vaultGlass) this.vaultGlass.visible = false;
  }

  // ===========================================================================
  // INDOOR / OUTDOOR TRANSITIONS (Matching Claude's Castle fade & friend seating!)
  // ===========================================================================
  enter() {
    const t = this.game;
    const p = t.player;
    this._playLabSound("door");
    t.ui.fade(() => {
      this.inside = true;
      if (this.intGroup) this.intGroup.visible = true;
      this.snowWas = t.snowAmount;
      t.snowAmount = 0;
      p.teleport(LAB_ORIGIN.x, LAB_ORIGIN.z + 5.2, 0, -0.05);
      this._seatFriends();
      if (t.perf) t.perf._updateCulling();
      t.localLights && t.localLights.update();
    }, () => {
      if (!this.seenInside) {
        this.seenInside = true;
        t.ui.toast("⚗️ 欢迎来到「极其猫实验室」！先去左下角「极其猫装备柜」穿戴防护装备，再点亮 4 根元素柱解锁中央 118 Og 神秘武器喵！", 9.5);
      }
    });
  }

  leave() {
    const t = this.game;
    const p = t.player;
    this._playLabSound("door");
    t.ui.fade(() => {
      this.inside = false;
      if (this.intGroup) this.intGroup.visible = false;
      t.snowAmount = this.snowWas ?? 1.2;
      p.teleport(this.out.x, this.out.z, Math.PI, -0.08);
      t.friends && t.friends.regroup && t.friends.regroup();
      if (t.perf) t.perf._updateCulling();
      t.localLights && t.localLights.update();
    }, () => {});
  }

  _seatFriends() {
    const fr = this.game.friends;
    if (!fr || !fr.party || !fr.party.length) return;
    fr.trail && (fr.trail.length = 0);
    const slots = [
      [-2.1, 4.0], [2.2, 4.1], [4.9, 3.2], [-4.6, -3.5], [4.6, -3.5],
      [-2.4, -3.8], [2.5, -3.8], [5.2, 1.5], [-4.8, 2.2]
    ];
    fr.party.forEach((f, i) => {
      const [sx, sz] = slots[i % slots.length];
      f.x = LAB_ORIGIN.x + sx;
      f.z = LAB_ORIGIN.z + sz;
      f.y = LAB_ORIGIN.y;
      f.lift = 0;
      f.yaw = Math.atan2(-(LAB_ORIGIN.x - f.x), -(LAB_ORIGIN.z - 0.5 - f.z));
    });
  }

  // ===========================================================================
  // INTERACTIONS: ELEMENT REACTORS, 118 Og VAULT SYNTHESIS, WORKBENCH & ELIXIR!
  // ===========================================================================
  activateReactor(rd) {
    const first = !this.charged.has(rd.id);
    this.charged.add(rd.id);
    if (this.reactorBeams[rd.id]) this.reactorBeams[rd.id].visible = true;
    const ld = this.vaultLeds[rd.id];
    if (ld) {
      ld.mat.color.setHex(ld.color);
      ld.mat.emissive.setHex(ld.color);
      ld.mat.emissiveIntensity = 1.45;
    }

    this._playLabSound("charge");
    const pos = new this.THREE.Vector3(LAB_ORIGIN.x + rd.x, LAB_ORIGIN.y + 2.25, LAB_ORIGIN.z + rd.z);
    if (this.game.puffs) {
      for (let k = 0; k < 18; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.2 + Math.random() * 2.4;
        this.game.puffs.spawn(
          pos.x, pos.y, pos.z, Math.cos(a) * sp, 0.7 + Math.random() * 1.4, Math.sin(a) * sp,
          0.08, 0.88, 0.55, rd.rgb[0], rd.rgb[1], rd.rgb[2], 1.2, 1.4
        );
      }
    }

    if (first && this.charged.size >= 4) {
      this.game.character?.play("cheer");
      const hasGear = !!(this.game.labGear && this.game.labGear.tier > 0);
      this.game.ui && this.game.ui.toast(
        hasGear
          ? "🌟 4/4 四大 Gemini 4 元素光束全部接入！快去中央「118 Og 封存舱」按 E 合成神秘隐藏武器喵！！"
          : "🌟 4/4 四大元素光束已全部接入！去西南角更衣柜穿好化学防护装备，就能去中央解锁神秘武器啦喵！",
        8.5
      );
    } else {
      this.game.ui && this.game.ui.toast(rd.toast + `（进度 ${this.charged.size}/4）`, 6.5);
    }
  }

  interactVault() {
    const unlocked = !!(this.game.tools && this.game.tools.chemGunUnlocked);
    if (unlocked) {
      // Replay celebration collider fireworks & equip the secret cannon!
      this.synthAnimT = 2.2;
      this.synthTriggered = true;
      this._playLabSound("synth");
      this.game.tools.unlockChemGun(true, true);
      this.game.character?.play("cheer");
      this.game.ui && this.game.ui.toast("✨ 118 Og 对撞机庆祝光效重演！已为你装备神秘武器「118 Og · 周期表元素炮」，快出去雪地试试 5 元素循环连发喵！", 7.0);
      return;
    }

    const hasGear = !!(this.game.labGear && this.game.labGear.tier > 0);
    if (!hasGear) {
      this._playLabSound("locked");
      this.game.ui && this.game.ui.toast("🔒 安全协议拦截：启动 118 Og 粒子对撞机前，请先去西南角「更衣装备柜」穿戴护目镜与气体背包喵！", 6.5);
      return;
    }

    if (this.charged.size < 4) {
      this._playLabSound("locked");
      const missing = REACTOR_DEFS.filter((r) => !this.charged.has(r.id)).map((r) => `${r.num} ${r.sym}`).join(" / ");
      this.game.ui && this.game.ui.toast(`🔒 对撞能量不足（${this.charged.size}/4）！还需点亮周围的元素反应柱：${missing}`, 6.5);
      return;
    }

    if (this.synthAnimT > 0) return;

    // LAUNCH THE GRAND 3.0-SECOND 118 Og SYNTHESIS & WEAPON UNLOCK SEQUENCE!!
    this.synthAnimT = 3.0;
    this.synthTriggered = false;
    this._playLabSound("synth");
    this.game.character?.play("cheer");
    this.game.ui && this.game.ui.toast("🌀 1 H + 6 C + 10 Ne + 18 Ar 四束光能汇聚！正在手搓 118 号 Oganesson 神秘武器……", 4.0);
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
    if (this.burnerFlameMat) this.burnerFlameMat.color.setHex(exp.flameColor);

    if (exp.mode === "bubbles") {
      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        b.mesh.visible = true;
        b.mesh.position.set((Math.random() - 0.5) * 0.5, 1.85 + Math.random() * 0.3, -5.35 + (Math.random() - 0.5) * 0.4);
        b.mesh.scale.setScalar(0.65 + Math.random() * 0.9);
        b.vx = (Math.random() - 0.5) * 0.9;
        b.vy = 0.55 + Math.random() * 0.65;
        b.vz = (Math.random() - 0.5) * 0.9;
        b.life = 4.2 + Math.random() * 1.8;
      }
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
    const g = this.game;

    // Spinners (rooftop spire outdoors + diamond reactor core indoors)
    for (const sp of this.spinners) sp.obj.rotation.y = time * sp.speed;

    // Exterior light modulation
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0.35;
    for (const item of this.extLights) {
      item.l.intensity = this.inside ? 0 : item.base * (0.45 + 0.85 * lamps);
    }

    // Interior lights: strictly 0 outdoors, rich glow indoors!
    const synthBoost = this.synthAnimT > 0 ? 1.45 + 0.35 * Math.sin(time * 24) : 1.0;
    for (const item of this.intLights) {
      item.l.intensity = this.inside ? item.base * synthBoost : 0;
    }
    if (!this.inside) {
      // Gentle rising alchemical starlight steam from the copper rooftop chimney!
      if (g.puffs && dt > 0) {
        this._chimneyAcc = (this._chimneyAcc || 0) + dt * 2.6;
        if (this._chimneyAcc >= 1) {
          this._chimneyAcc -= 1;
          const dist = Math.hypot(g.player.pos.x - this.cx, g.player.pos.z - this.cz);
          if (dist < 48) {
            const pk = Math.random() > 0.5;
            g.puffs.spawn(
              this.cx + 3.55 + (Math.random() - 0.5) * 0.22,
              this.cy + 9.85,
              this.cz - 2.05 + (Math.random() - 0.5) * 0.22,
              (Math.random() - 0.5) * 0.28 + 0.16,
              0.72 + Math.random() * 0.35,
              (Math.random() - 0.5) * 0.28,
              0.20 + Math.random() * 0.12,
              0.42,
              2.4 + Math.random() * 0.8,
              pk ? 0.72 : 0.86, pk ? 0.94 : 0.78, 1.0,
              -0.06, 0.7
            );
          }
        }
      }
      return;
    }

    // Animate Wardrobe Gear Preview & Holo-Pedestal Molecules
    if (this.lockerPreview) {
      this.lockerPreview.rotation.y = Math.sin(time * 1.1) * 0.38;
      this.lockerPreview.position.y = 1.48 + Math.sin(time * 2.4) * 0.04;
    }
    if (this.moleculePivot) {
      this.moleculePivot.rotation.y = time * 0.95;
      this.moleculePivot.position.y = 1.98 + Math.sin(time * 2.1) * 0.08;
    }
    if (this.bohrRings.length >= 2) {
      this.bohrRings[0].rotation.z = time * 2.4;
      this.bohrRings[1].rotation.z = -time * 1.6;
    }

    // Animate Central 118 Og Secret Weapon Containment Vault & Dramatic Synthesis Sequence!
    const speedMul = this.synthAnimT > 0 ? 7.5 : (this.charged.size >= 4 ? 2.4 : 1.0);
    for (let i = 0; i < this.vaultGyro.length; i++) {
      const r = this.vaultGyro[i];
      r.rotation.x += dt * (0.7 + i * 0.45) * speedMul;
      r.rotation.y += dt * (0.9 - i * 0.25) * speedMul;
    }
    if (this.vaultWeaponPreview) {
      this.vaultWeaponPreview.rotation.y += dt * (this.synthAnimT > 0 ? 6.5 : 1.15);
      this.vaultWeaponPreview.position.y = 1.88 + Math.sin(time * 2.4) * 0.09 + (this.synthAnimT > 0 ? 0.22 * (1 - this.synthAnimT / 3.0) : 0);
    }

    if (this.synthAnimT > 0) {
      this.synthAnimT = Math.max(0, this.synthAnimT - dt);
      // Swirling rainbow collider sparks during synthesis!
      if (g.puffs && Math.random() < dt * 26) {
        const a = Math.random() * Math.PI * 2;
        const p = this.vaultWorldPos;
        const pal = [[0.28, 0.94, 1.0], [1.0, 0.85, 0.34], [1.0, 0.42, 0.22], [0.66, 0.46, 1.0], [1.0, 0.42, 0.88]];
        const c = pal[Math.floor(Math.random() * pal.length)];
        g.puffs.spawn(
          p.x + Math.cos(a) * 0.75, p.y + (Math.random() - 0.5) * 0.8, p.z + Math.sin(a) * 0.75,
          Math.cos(a) * 2.2, 1.2 + Math.random() * 1.8, Math.sin(a) * 2.2,
          0.11, 0.90, 0.65, c[0], c[1], c[2], 1.5, 1.5
        );
      }

      // Slide the laser-shielded glass cylinder upward and dissolve it!
      if (this.vaultGlass && this.vaultGlass.visible) {
        const k = Math.min(1, (3.0 - this.synthAnimT) / 1.8);
        this.vaultGlass.position.y = 1.88 + k * 1.65;
        this.vaultGlassMat.opacity = Math.max(0, 0.34 * (1 - k));
        if (k >= 1) this.vaultGlass.visible = false;
      }

      // Climax: Unlock & Auto-Equip「118 Og · 周期表元素炮」!
      if (!this.synthTriggered && this.synthAnimT <= 0.85) {
        this.synthTriggered = true;
        this.vaultOpenK = 1;
        if (g.tools && g.tools.unlockChemGun) {
          g.tools.unlockChemGun(true, false);
        }
        // Automatically upgrade LabGear to Tier-2 Element Master Halo as a surprise bonus!
        if (g.labGear && g.labGear.tier === 1) {
          g.labGear.setTier(2, true);
        }
        g.sparks && g.sparks.spawn(this.vaultWorldPos.x, this.vaultWorldPos.y, this.vaultWorldPos.z, 0, 0, 0, 1.4, 0.96, 0.26, 3.8, 2.8, 3.8, 0, 0);
        g.ui && g.ui.toast("🎉 传奇隐藏武器解锁：「118 Og · 周期表元素炮」已入列武器栏并自动装备（同时觉醒头顶四元素光环！）快按 J 试射喵！！", 9.5);
      }
    }

    // Workbench burner, foam & bubbles
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
            p.x + (Math.random() - 0.5) * 0.28, p.y + 0.15, p.z + (Math.random() - 0.5) * 0.28,
            (Math.random() - 0.5) * 0.85, 1.15 + Math.random() * 1.1, (Math.random() - 0.5) * 0.85,
            0.09 + Math.random() * 0.08, 0.9, 0.85 + Math.random() * 0.45, r, gr, b, -0.1, 1.1
          );
        }
      }
    } else if (this.foamMesh && this.foamMesh.visible) {
      this.foamMesh.visible = false;
    }

    for (const b of this.bubbles) {
      if (b.life <= 0) continue;
      b.life -= dt;
      if (b.life <= 0) { b.mesh.visible = false; continue; }
      b.mesh.position.x += (b.vx + Math.sin(time * 2.2 + b.ph) * 0.18) * dt;
      b.mesh.position.y += b.vy * dt;
      b.mesh.position.z += (b.vz + Math.cos(time * 1.9 + b.ph) * 0.18) * dt;
      b.mesh.material.opacity = Math.min(0.62, b.life * 0.35);
    }
  }
}
