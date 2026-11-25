// 雪境极光跃动试炼场 (js/parkour.js)
// 将西北林间试炼空地 (re.maze: -74, -44, 半径 16.5m) 打造为贴合「圣诞雪境」美学的 5 阶段舒爽跑跳闯关试炼：
// - 地形精准贴合（外圈星光边界环、起点牌坊、回溯水晶门柱、铜钟与全部立柱严格贴合雪地坡度 qt(x,z)，零悬空零穿模）
// - 立体物理碰撞完善（顶塔石身、雪鼓底座、立柱带准确 top 高度圆柱碰撞；高空跳台 elev:true 高度分层，雪地穿行零空气墙零瞬移）
// - 友好流畅难度调优（宽敞 3.1m–4.2m 跳台、舒爽短步距、温柔慢速极光浮雪冰筏、自动弧线引导雪花铃鼓、3.2s 宽裕薄冰、
//   轻盈不坑人的冬青风车灯杆、中庭+HUD 一键传回存档台！）

const STORAGE_KEY = "xmas_snow_trial_best_v1";

export class WinterTrialCourse {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;
    this.THREE = game.THREE;

    const m = this.re.maze;
    this.cx = m.x; // -74
    this.cz = m.z; // -44
    this.baseY = this.qt(this.cx, this.cz);
    this.sumH = 5.40;

    this.group = null;
    this.staticPlats = [];
    this.movingPlats = [];
    this.crumblePlats = [];
    this.bellGifts = [];
    this.crystals = [];
    this.checkpoints = [];
    this.bounceDrums = [];
    this.windmill = null;
    this.summitBeacon = null;
    this.lights = [];
    this.spinners = [];

    // Run, Combo & Scoring state
    this.runActive = false;
    this.runCleared = false;
    this.runTime = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.crystalCount = 0;
    this.falls = 0;
    this.checkpointIdx = 0;
    this.wasElevated = false;
    this.spawnPts = [];
    this.bellCoords = [];

    // Skill-bonus dedupe timers
    this.drumBonusDone = false;
    this.drumGlide = null;
    this.iceVisited = new Set();
    this.iceBonusDone = false;
    this.windmillBonusCd = 0;
    this.windmillWarnT = 0;

    // Persistent best record
    this.best = this.loadBest();

    // Arena-only HUD & floating score popup
    this.hudEl = null;
    this.hudTextEl = null;
    this.hudWarpBtn = null;
    this.popEl = null;
    this.popTimer = 0;
    this.hudShown = false;
  }

  loadBest() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return {
          score: Number(d.score) || 0,
          time: Number(d.time) || 0,
          rank: String(d.rank || ""),
          clears: Number(d.clears) || 0
        };
      }
    } catch {}
    return { score: 0, time: 0, rank: "", clears: 0 };
  }

  saveBest() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.best));
    } catch {}
  }

  relGround(lx, lz) {
    return this.qt(this.cx + lx, this.cz + lz) - this.baseY;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  // =========================================================================
  // PROCEDURAL CHRISTMAS SNOW-WORLD TEXTURES
  // =========================================================================
  makeCedarTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = "#8d5836";
    c.fillRect(0, 0, 256, 256);
    const planks = 4, ph = 256 / planks;
    for (let i = 0; i < planks; i++) {
      const y = i * ph;
      const shade = ((i * 19) % 15) - 7;
      c.fillStyle = `rgb(${144 + shade}, ${90 + Math.round(shade * 0.6)}, ${56 + Math.round(shade * 0.4)})`;
      c.fillRect(0, y + 2, 256, ph - 4);
      c.strokeStyle = "rgba(62, 32, 16, 0.25)";
      c.lineWidth = 2;
      for (let g = 0; g < 3; g++) {
        c.beginPath();
        c.moveTo(0, y + 12 + g * 18);
        c.bezierCurveTo(85, y + 8 + g * 18, 170, y + 18 + g * 18, 256, y + 12 + g * 18);
        c.stroke();
      }
      c.fillStyle = "rgba(230, 245, 255, 0.22)";
      c.fillRect(0, y + 2, 256, 3);
      c.fillStyle = "rgba(48, 24, 12, 0.48)";
      c.fillRect(0, y + ph - 3, 256, 3);
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(1.5, 1);
    return tex;
  }

  makeGiftWrapTex(baseHex, stripeHex, ribbonHex) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = baseHex;
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = stripeHex;
    c.lineWidth = 10;
    for (let x = -256; x < 512; x += 36) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + 256, 256);
      c.stroke();
    }
    c.fillStyle = ribbonHex;
    c.fillRect(108, 0, 40, 256);
    c.fillRect(0, 108, 256, 40);
    c.strokeStyle = "rgba(255,255,255,0.45)";
    c.lineWidth = 3;
    c.strokeRect(110, 0, 36, 256);
    c.strokeRect(0, 110, 256, 36);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  makeDrumHeadTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    const cx = 128, cy = 128;
    const gr = c.createRadialGradient(cx, cy, 12, cx, cy, 124);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.55, "#c8f2ff");
    gr.addColorStop(0.85, "#64c6f4");
    gr.addColorStop(1, "#2a6ea8");
    c.fillStyle = gr;
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "#ffd966";
    c.lineWidth = 8;
    c.beginPath(); c.arc(cx, cy, 110, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 5;
    c.beginPath(); c.arc(cx, cy, 74, 0, Math.PI * 2); c.stroke();
    c.save();
    c.translate(cx, cy);
    c.strokeStyle = "#fff8dc";
    c.lineWidth = 7;
    c.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate((i * Math.PI) / 3);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -60);
      c.moveTo(0, -34); c.lineTo(-16, -46);
      c.moveTo(0, -34); c.lineTo(16, -46);
      c.stroke();
      c.restore();
    }
    c.restore();
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  makeBannerTex(title, subtitle) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 768; cv.height = 192;
    const c = cv.getContext("2d");
    const grad = c.createLinearGradient(0, 0, 768, 0);
    grad.addColorStop(0, "#19304d");
    grad.addColorStop(0.5, "#24476e");
    grad.addColorStop(1, "#19304d");
    c.fillStyle = grad;
    c.fillRect(0, 0, 768, 192);
    c.strokeStyle = "#f7d472";
    c.lineWidth = 9;
    c.strokeRect(10, 10, 748, 172);
    c.fillStyle = "#9ef5ff";
    c.font = "700 32px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("❄", 52, 62); c.fillText("❄", 716, 62);
    c.fillText("✦", 52, 144); c.fillText("✦", 716, 144);
    c.fillStyle = "#fff9e6";
    c.font = "900 60px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.textBaseline = "middle";
    c.fillText(title, 384, 76);
    c.fillStyle = "#9ef5ff";
    c.font = "700 30px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.fillText(subtitle, 384, 140);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  // =========================================================================
  // PROCEDURAL AUDIO
  // =========================================================================
  tone(freq, type, dur, vol, delay = 0, freqEnd = null, revAmt = 0.25) {
    const a = this.game.audio;
    if (!a || !a.ctx || a.muted) return;
    const ctx = a.ctx;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
    o.connect(g).connect(a.master);
    if (revAmt > 0 && a.rev) {
      const rg = ctx.createGain();
      rg.gain.value = revAmt;
      g.connect(rg).connect(a.rev);
    }
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  sfxCrystal(comboLevel = 1) {
    const pent = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
    const base = pent[Math.min(pent.length - 1, Math.max(0, comboLevel - 1))];
    this.tone(base, "sine", 0.26, 0.078, 0, null, 0.42);
    this.tone(base * 2, "sine", 0.22, 0.032, 0.035, null, 0.38);
    this.tone(base * 1.5, "triangle", 0.18, 0.025, 0.055, null, 0.28);
  }

  sfxBellGift() {
    this.tone(659.25, "sine", 0.16, 0.075, 0, null, 0.35);
    this.tone(880.00, "sine", 0.20, 0.085, 0.05, null, 0.40);
    this.tone(1318.51, "sine", 0.36, 0.09, 0.10, null, 0.48);
    this.tone(2637.02, "sine", 0.28, 0.032, 0.11, null, 0.40);
    this.game.audio && this.game.audio.jingle && this.game.audio.jingle(0.75);
  }

  sfxSnowDrum() {
    this.tone(165, "sine", 0.26, 0.13, 0, 560, 0.22);
    this.tone(330, "triangle", 0.24, 0.055, 0.02, 880, 0.32);
    this.game.audio && this.game.audio.jingle && this.game.audio.jingle(0.65);
  }

  sfxRecallPortal() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.tone(f, "sine", 0.22, 0.062, idx * 0.055, f * 1.12, 0.45);
    });
  }

  sfxLanternCheckpoint() {
    [587.33, 739.99, 880.0, 1174.66].forEach((f, idx) => {
      this.tone(f, "triangle", 0.28, 0.075, idx * 0.065, null, 0.38);
    });
  }

  sfxThinIceCrack() {
    this.tone(1680, "sine", 0.09, 0.042, 0, 920, 0.25);
    this.tone(1240, "triangle", 0.11, 0.036, 0.05, 620, 0.25);
  }

  sfxSummitChime() {
    const seq = [
      [523.25, 0.00, 0.22], [659.25, 0.10, 0.22], [783.99, 0.20, 0.22],
      [987.77, 0.30, 0.22], [1046.5, 0.42, 0.55], [1318.51, 0.52, 0.65]
    ];
    for (const [f, d, l] of seq) {
      this.tone(f, "sine", l, 0.088, d, null, 0.52);
      this.tone(f * 2, "sine", l * 0.85, 0.032, d, null, 0.45);
    }
    this.game.audio && this.game.audio.jingle && this.game.audio.jingle(1.0);
  }

  // =========================================================================
  // SCORE & COMBO SYSTEM
  // =========================================================================
  getComboMult() {
    if (this.combo <= 1) return 1.0;
    return Math.min(3.0, 1.0 + (this.combo - 1) * 0.25);
  }

  addScore(basePts, label = "", extendCombo = true) {
    if (!this.runActive && !this.runCleared) this.runActive = true;
    if (extendCombo) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.comboTimer = 5.5;
    }
    const mult = extendCombo ? this.getComboMult() : 1.0;
    const pts = Math.round(basePts * mult);
    this.score += pts;
    const multTxt = extendCombo && this.combo >= 2 ? ` (×${mult.toFixed(2).replace(/\.00$/, "")} 连击)` : "";
    this.showScorePop(label ? `${label} +${pts}${multTxt}` : `+${pts}${multTxt}`);
    return pts;
  }

  showScorePop(text) {
    if (!this.popEl) return;
    this.popEl.textContent = text;
    this.popEl.style.opacity = "1";
    this.popEl.style.transform = "translate(-50%, 0) scale(1.04)";
    this.popTimer = 1.9;
  }

  warpToCheckpoint() {
    if (this.checkpointIdx <= 0) {
      this.game.ui.toast("先顺着右侧圣诞礼盒台阶跑跳点亮一号雪灯存档台，就能一键传回啦喵～", 4.0);
      return;
    }
    const sp = this.spawnPts[this.checkpointIdx];
    this.sfxRecallPortal();
    this.game.player.teleport(sp.x, sp.z, sp.yaw, -0.10);
    this.game.ui.toast(`✦ 星光雪门已将你温柔送回「${sp.name}」！`, 3.4);
  }

  // Build terrain-conforming closed ring tube so arena borders NEVER float on sloped snow!
  makeTerrainRing(radius, tubeRadius, yOff, segs, radialSegs, mat) {
    const T = this.THREE;
    const pts = [];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const lx = Math.cos(a) * radius;
      const lz = Math.sin(a) * radius;
      pts.push(new T.Vector3(lx, this.relGround(lx, lz) + yOff, lz));
    }
    const curve = new T.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
    const geo = new T.TubeGeometry(curve, segs * 2, tubeRadius, radialSegs, true);
    const m = new T.Mesh(geo, mat);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  // =========================================================================
  // BUILD THE REBALANCED, BUG-FREE 5-STAGE CHRISTMAS SNOW-WORLD TRIAL
  // =========================================================================
  build() {
    const T = this.THREE;
    const { scene, world, explore } = this.game;
    const x0 = this.cx, z0 = this.cz, y0 = this.baseY;
    const sumH = this.sumH;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.42, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    this.m = {
      cedar: plain(new T.MeshStandardMaterial({ map: this.makeCedarTex(), roughness: 0.72 })),
      giftRed: plain(new T.MeshStandardMaterial({ map: this.makeGiftWrapTex("#a92632", "rgba(255,215,170,0.16)", "#f7cc5c"), roughness: 0.45 })),
      giftPine: plain(new T.MeshStandardMaterial({ map: this.makeGiftWrapTex("#1d6442", "rgba(180,255,215,0.14)", "#f7cc5c"), roughness: 0.45 })),
      giftBlue: plain(new T.MeshStandardMaterial({ map: this.makeGiftWrapTex("#244278", "rgba(170,230,255,0.18)", "#f7cc5c"), roughness: 0.42 })),
      bellGiftLit: plain(new T.MeshStandardMaterial({
        map: this.makeGiftWrapTex("#d99a28", "rgba(255,255,220,0.22)", "#fff4c2"),
        emissive: new T.Color(0.55, 0.34, 0.06),
        emissiveIntensity: 0.55,
        roughness: 0.25
      })),
      bellGiftOpened: plain(new T.MeshStandardMaterial({
        map: this.makeGiftWrapTex("#55667e", "rgba(200,225,255,0.10)", "#9aaac0"),
        roughness: 0.65
      })),
      drumHead: plain(new T.MeshStandardMaterial({
        map: this.makeDrumHeadTex(),
        emissive: new T.Color(0.14, 0.42, 0.58),
        emissiveIntensity: 0.42,
        roughness: 0.28
      })),
      snow: std(0xf4f8ff, 0.74),
      gold: std(0xf6ca54, 0.20, { metalness: 0.86 }),
      pine: std(0x1b5e39, 0.72),
      holly: std(0xd42636, 0.35),
      stone: std(0x4b5876, 0.58),
      ivory: std(0xeae6dc, 0.48),
      raftIce: plain(new T.MeshStandardMaterial({
        color: 0xbef2ff, emissive: new T.Color(0.16, 0.56, 0.82), emissiveIntensity: 0.45, roughness: 0.18, metalness: 0.12
      })),
      thinIce: plain(new T.MeshStandardMaterial({
        color: 0x90ecff, emissive: new T.Color(0.14, 0.64, 0.92), emissiveIntensity: 0.55,
        roughness: 0.10, transparent: true, opacity: 0.84
      })),
      lanternOff: plain(new T.MeshStandardMaterial({
        color: 0xff9e66, emissive: new T.Color(0.65, 0.24, 0.08), emissiveIntensity: 0.45, roughness: 0.25
      })),
      lanternLit: plain(new T.MeshStandardMaterial({
        color: 0x8ef8ff, emissive: new T.Color(0.24, 0.92, 1.0), emissiveIntensity: 1.55, roughness: 0.16
      })),
      crystal: plain(new T.MeshStandardMaterial({
        color: 0x9ef7ff, emissive: new T.Color(0.32, 0.86, 1.0), emissiveIntensity: 1.25, roughness: 0.12, metalness: 0.35
      })),
      starGold: plain(new T.MeshStandardMaterial({
        color: 0xffe678, emissive: new T.Color(0.95, 0.68, 0.14), emissiveIntensity: 1.35, roughness: 0.16, metalness: 0.82
      })),
      auroraPink: plain(new T.MeshStandardMaterial({
        color: 0xff8ce6, emissive: new T.Color(0.92, 0.32, 0.80), emissiveIntensity: 1.25, roughness: 0.18
      }))
    };

    const g = new T.Group();
    g.position.set(x0, y0, z0);
    scene.add(g);
    this.group = g;

    // -----------------------------------------------------------------------
    // 1. TERRAIN-CONFORMING SNOW-COURTYARD BORDER & NORDIC START ARCHWAY
    // -----------------------------------------------------------------------
    g.add(
      this.makeTerrainRing(14.8, 0.13, 0.03, 48, 8, this.m.gold),
      this.makeTerrainRing(14.42, 0.06, 0.06, 48, 6, this.m.crystal)
    );

    const arch = new T.Group();
    const archGround = Math.min(this.relGround(-2.65, 13.0), this.relGround(2.65, 13.0), this.relGround(0, 13.0));
    arch.position.set(0, archGround, 13.0);
    for (const side of [-1, 1]) {
      const px = side * 2.65;
      // Extend stone pedestal 0.35m below terrain so posts are firmly anchored on any slope
      arch.add(
        this.mesh(new T.CylinderGeometry(0.34, 0.44, 0.78, 10), this.m.stone, px, 0.04, 0),
        this.mesh(new T.CylinderGeometry(0.22, 0.25, 3.35, 12), this.m.cedar, px, 2.08, 0),
        this.mesh(new T.TorusGeometry(0.27, 0.045, 6, 18).rotateX(Math.PI / 2), this.m.gold, px, 3.68, 0),
        this.mesh(new T.TorusGeometry(0.32, 0.085, 8, 16).rotateX(Math.PI / 2), this.m.pine, px, 3.44, 0),
        this.mesh(new T.SphereGeometry(0.20, 12, 10), this.m.starGold, px, 3.98, 0),
        this.mesh(new T.CylinderGeometry(0.02, 0.02, 0.35, 6), this.m.gold, side * 1.95, 2.92, 0),
        this.mesh(new T.SphereGeometry(0.14, 10, 8), this.m.starGold, side * 1.95, 2.70, 0)
      );
      world.circles.push({ x: x0 + px, z: z0 + 13.0, r: 0.44 });
    }
    arch.add(
      this.mesh(new T.BoxGeometry(5.9, 0.18, 0.62), this.m.cedar, 0, 3.91, 0),
      this.mesh(new T.BoxGeometry(6.05, 0.14, 0.72), this.m.snow, 0, 4.07, 0)
    );
    const bannerTex = this.makeBannerTex("✦ 雪境极光跃动试炼 ✦", "轻松踏雪跑跳 · 集星晶连击 · 登顶鸣钟！");
    const banner = this.mesh(new T.BoxGeometry(4.95, 1.08, 0.14), [
      this.m.gold, this.m.gold, this.m.snow, this.m.gold,
      plain(new T.MeshStandardMaterial({ map: bannerTex, roughness: 0.28 })),
      plain(new T.MeshStandardMaterial({ map: bannerTex, roughness: 0.28 }))
    ], 0, 3.36, 0);
    arch.add(banner);
    // Start threshold deck: sits cleanly above highest terrain corner with plinth reaching deep into snow
    const deckMaxG = Math.max(this.relGround(-1.9, 13.0), this.relGround(0, 13.0), this.relGround(1.9, 13.0)) - archGround;
    arch.add(
      this.mesh(new T.BoxGeometry(3.8, 0.42, 1.6), this.m.gold, 0, deckMaxG - 0.14, 0),
      this.mesh(new T.BoxGeometry(3.48, 0.07, 1.32), this.m.cedar, 0, deckMaxG + 0.105, 0)
    );
    g.add(arch);

    this.spawnPts.push({ x: x0, z: z0 + 11.3, yaw: -0.78, name: "试炼起点大门" });

    // Helper: Nordic Cedar or Christmas Gift-Box Platform (zero Z-fighting, terrain-grounded slim post + solid collider!)
    const addStaticPlat = (lx, lz, topH, w, d, style = "cedar", support = true) => {
      const thick = 0.48;
      const pg = new T.Group();
      pg.position.set(lx, topH, lz);
      const bodyMat =
        style === "giftRed" ? this.m.giftRed :
        style === "giftPine" ? this.m.giftPine :
        style === "giftBlue" ? this.m.giftBlue :
        style === "check" ? this.m.ivory :
        this.m.cedar;
      // Non-overlapping vertical stack: snow [-0.10..0.00], body [-0.58..-0.10], gold trim wrapped strictly outside [-0.14..-0.09]
      pg.add(
        this.mesh(new T.BoxGeometry(w, thick, d), bodyMat, 0, -0.10 - thick / 2, 0),
        this.mesh(new T.BoxGeometry(w + 0.08, 0.10, d + 0.08), this.m.snow, 0, -0.05, 0),
        this.mesh(new T.BoxGeometry(w + 0.14, 0.05, d + 0.14), this.m.gold, 0, -0.125, 0)
      );
      const gRel = this.relGround(lx, lz);
      const bottomLocal = gRel - topH; // terrain surface relative to platform top
      if (support && topH > 0.65) {
        // Slim graceful Nordic timber support post extending 0.35m into terrain (never floats, never blocks sight!)
        const topCol = -0.58;
        const botCol = bottomLocal - 0.35;
        const colH = Math.max(0.25, topCol - botCol);
        const cr = Math.min(0.26, Math.min(w, d) * 0.085);
        pg.add(
          this.mesh(new T.CylinderGeometry(cr * 0.88, cr * 1.15, colH, 10), this.m.cedar, 0, botCol + colH / 2, 0),
          this.mesh(new T.TorusGeometry(cr * 1.18, 0.04, 6, 16).rotateX(Math.PI / 2), this.m.gold, 0, bottomLocal + 0.05, 0)
        );
        world.circles.push({ x: x0 + lx, z: z0 + lz, r: cr * 1.22, top: Math.max(0.2, topH - 0.62) });
      }
      g.add(pg);

      const wx = x0 + lx, wz = z0 + lz, wy = y0 + topH;
      const hw = w / 2 + 0.18, hd = d / 2 + 0.18;
      world.platforms.push({
        elev: true,
        test: (px, pz) => Math.abs(px - wx) <= hw && Math.abs(pz - wz) <= hd,
        y: () => wy
      });
      this.staticPlats.push({ lx, lz, wx, wz, wy, topH, w, d, group: pg });
    };

    // Helper: Hanging Festive Star-Bell Gift Box (jump up to ring for +300 combo bonus!)
    const addBellGift = (lx, lz, bottomH) => {
      const bg = new T.Group();
      bg.position.set(lx, bottomH + 0.38, lz);
      const box = this.mesh(new T.BoxGeometry(0.68, 0.68, 0.68), this.m.bellGiftLit, 0, 0, 0);
      const bowL = this.mesh(new T.TorusGeometry(0.14, 0.038, 6, 12), this.m.gold, -0.11, 0.40, 0);
      const bowR = this.mesh(new T.TorusGeometry(0.14, 0.038, 6, 12), this.m.gold, 0.11, 0.40, 0);
      bowL.rotation.z = 0.4; bowR.rotation.z = -0.4;
      const bell = this.mesh(new T.ConeGeometry(0.12, 0.18, 10), this.m.starGold, 0, -0.42, 0);
      bg.add(box, bowL, bowR, bell);
      g.add(bg);
      this.bellGifts.push({
        group: bg, box, bell,
        wx: x0 + lx, wz: z0 + lz,
        baseY: bottomH + 0.38,
        worldBottomY: y0 + bottomH,
        hit: false,
        bounceT: 0
      });
    };

    // Helper: Glowing Rotating Aurora Star-Crystal (collectible guiding jump arcs!)
    const addStarCrystal = (lx, lz, h) => {
      const cg = new T.Group();
      cg.position.set(lx, h, lz);
      const core = this.mesh(new T.OctahedronGeometry(0.24, 0), this.m.crystal, 0, 0, 0);
      const ring = this.mesh(new T.TorusGeometry(0.32, 0.028, 6, 16), this.m.starGold, 0, 0, 0);
      cg.add(core, ring);
      g.add(cg);
      this.crystals.push({
        group: cg,
        wx: x0 + lx, wz: z0 + lz,
        baseH: h,
        wy: y0 + h,
        got: false,
        ph: this.crystals.length * 0.55
      });
    };

    // Helper: Christmas Lantern Checkpoint Post (lights up glowing aurora cyan + warms player!)
    const addLanternCheckpoint = (idx, lx, lz, topH, spawnYaw, name) => {
      const lg = new T.Group();
      lg.position.set(lx + 1.15, topH, lz - 1.15);
      const orb = this.mesh(new T.OctahedronGeometry(0.22, 1), this.m.lanternOff, 0, 1.88, 0);
      lg.add(
        this.mesh(new T.CylinderGeometry(0.16, 0.22, 0.18, 10), this.m.stone, 0, 0.09, 0),
        this.mesh(new T.CylinderGeometry(0.055, 0.068, 1.72, 8), this.m.cedar, 0, 0.95, 0),
        this.mesh(new T.TorusGeometry(0.24, 0.032, 6, 16).rotateX(Math.PI / 2), this.m.gold, 0, 1.88, 0),
        this.mesh(new T.ConeGeometry(0.26, 0.22, 8), this.m.snow, 0, 2.18, 0),
        orb
      );
      g.add(lg);
      this.checkpoints.push({
        idx,
        wx: x0 + lx, wz: z0 + lz, wy: y0 + topH,
        orb,
        reached: false,
        name
      });
      this.spawnPts.push({ x: x0 + lx, z: z0 + lz, yaw: spawnYaw, name });
    };

    // -----------------------------------------------------------------------
    // STAGE 1: Breezy Gift-Box & Cedar Stairway (South -> East, comfy 0.3–0.55m edge gaps!)
    // -----------------------------------------------------------------------
    addStaticPlat(2.6, 10.7, 0.45, 3.2, 3.2, "giftRed", false);
    addStarCrystal(1.3, 11.0, 0.95);
    addStarCrystal(2.6, 10.7, 1.25);

    addStaticPlat(5.9, 9.2, 0.90, 3.2, 3.2, "giftPine");
    addStarCrystal(4.3, 10.0, 1.55);
    addBellGift(5.9, 9.2, 2.55);

    addStaticPlat(8.7, 6.7, 1.38, 3.2, 3.2, "giftBlue");
    addStarCrystal(7.3, 8.0, 2.02);

    addStaticPlat(10.5, 3.6, 1.72, 3.1, 3.1, "cedar");
    addStarCrystal(9.6, 5.2, 2.38);

    // Checkpoint Lantern #1
    addStaticPlat(11.0, 0.0, 1.95, 3.6, 3.6, "check");
    addStarCrystal(10.8, 1.8, 2.65);
    addLanternCheckpoint(1, 11.0, 0.0, 1.95, 0.22, "一号雪灯存档台（礼盒阶梯）");

    // -----------------------------------------------------------------------
    // STAGE 2: Wide Smooth Aurora Snow-Raft & Auto-Guided Snowflake Bounce Drum (East -> North)
    // -----------------------------------------------------------------------
    const r1 = new T.Group();
    r1.add(
      this.mesh(new T.BoxGeometry(3.3, 0.32, 3.3), this.m.raftIce, 0, -0.22, 0),
      this.mesh(new T.BoxGeometry(3.42, 0.06, 3.42), this.m.gold, 0, -0.03, 0),
      this.mesh(new T.TorusGeometry(1.38, 0.045, 6, 24).rotateX(Math.PI / 2), this.m.crystal, 0, -0.38, 0)
    );
    g.add(r1);
    const mp1 = {
      mesh: r1,
      ax: 10.2, az: -3.4, ay: 2.05,
      bx: 7.6, bz: -7.2, by: 2.15,
      hw: 1.82, hd: 1.82,
      speed: 0.46, ph: 0,
      wx: x0 + 10.2, wz: z0 - 3.4, wy: y0 + 2.05,
      dx: 0, dz: 0, dy: 0
    };
    this.movingPlats.push(mp1);
    world.platforms.push({
      elev: true,
      test: (px, pz) => Math.abs(px - mp1.wx) <= mp1.hw && Math.abs(pz - mp1.wz) <= mp1.hd,
      y: () => mp1.wy
    });
    addStarCrystal(8.9, -5.3, 2.95);

    // North-East Cedar Terrace P5 + 2nd Hanging Star-Bell Gift
    addStaticPlat(4.5, -9.6, 2.28, 3.4, 3.4, "cedar");
    addStarCrystal(6.0, -8.4, 3.05);
    addBellGift(4.5, -9.6, 3.95);

    // Giant Nordic Snowflake Trampoline Drum at (1.0, -10.6, topH = 2.28) — with auto-guided trajectory toward CP2!
    const drumG = new T.Group();
    const drumGround = this.relGround(1.0, -10.6);
    drumG.position.set(1.0, 0, -10.6);
    const pedTop = 1.98;
    const pedBot = drumGround - 0.35;
    const pedH = Math.max(0.4, pedTop - pedBot);
    drumG.add(
      this.mesh(new T.CylinderGeometry(0.64, 0.86, pedH, 12), this.m.cedar, 0, pedBot + pedH / 2, 0),
      this.mesh(new T.TorusGeometry(0.86, 0.055, 6, 18).rotateX(Math.PI / 2), this.m.gold, 0, drumGround + 0.06, 0)
    );
    const drumPad = new T.Group();
    drumPad.position.set(0, 2.04, 0);
    drumPad.add(
      this.mesh(new T.CylinderGeometry(1.62, 1.54, 0.32, 28), this.m.giftRed, 0, 0, 0),
      this.mesh(new T.CylinderGeometry(1.52, 1.52, 0.07, 28), this.m.drumHead, 0, 0.20, 0),
      this.mesh(new T.TorusGeometry(1.62, 0.065, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, 0.21, 0)
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      drumPad.add(this.mesh(new T.SphereGeometry(0.09, 8, 8), this.m.starGold, Math.cos(a) * 1.66, 0.04, Math.sin(a) * 1.66));
    }
    drumG.add(drumPad);
    g.add(drumG);
    // Solid pedestal collider under drum (stops walking through drum base while allowing standing on top!)
    world.circles.push({ x: x0 + 1.0, z: z0 - 10.6, r: 0.88, top: 1.90 });

    const drumObj = {
      wx: x0 + 1.0, wz: z0 - 10.6, wy: y0 + 2.28, r: 1.72,
      pad: drumPad, basePadY: 2.04, squash: 0, cool: 0, launchVy: 8.5,
      // Target center of Checkpoint #2 for smooth automatic forward glide!
      guideX: x0 - 3.2, guideZ: z0 - 9.8
    };
    this.bounceDrums.push(drumObj);
    world.platforms.push({
      elev: true,
      test: (px, pz) => (px - drumObj.wx) ** 2 + (pz - drumObj.wz) ** 2 <= drumObj.r * drumObj.r,
      y: () => drumObj.wy
    });
    // Arc of 3 glowing Star-Crystals tracing the guided Snowflake Drum leap!
    addStarCrystal(-0.2, -10.4, 3.85);
    addStarCrystal(-1.2, -10.2, 4.45);
    addStarCrystal(-2.2, -10.0, 4.10);

    // North Sky-Terrace P6 — Checkpoint Lantern #2! (Spacious 3.8×3.8 landing!)
    addStaticPlat(-3.2, -9.8, 3.20, 3.8, 3.8, "check");
    addLanternCheckpoint(2, -3.2, -9.8, 3.20, 1.15, "二号雪灯存档台（雪鼓飞跃台）");

    // -----------------------------------------------------------------------
    // STAGE 3: Forgiving Frost Panes (3.1m wide, 3.2s warning!) & Playful Windmill
    // -----------------------------------------------------------------------
    const addThinIce = (id, lx, lz, topH, sz = 3.1) => {
      const cg = new T.Group();
      cg.position.set(lx, topH, lz);
      const tileMat = this.m.thinIce.clone();
      // Non-overlapping stack: ice [-0.36..-0.04], snow cap [-0.04..0.00] (ZERO coplanar Z-fighting!)
      cg.add(
        this.mesh(new T.BoxGeometry(sz, 0.32, sz), tileMat, 0, -0.20, 0),
        this.mesh(new T.BoxGeometry(sz + 0.10, 0.04, sz + 0.10), this.m.snow, 0, -0.02, 0)
      );
      g.add(cg);
      const cr = {
        id, group: cg, mat: tileMat,
        lx, lz, topH,
        wx: x0 + lx, wz: z0 + lz, wy: y0 + topH,
        hw: sz / 2 + 0.18,
        state: "solid",
        timer: 0
      };
      this.crumblePlats.push(cr);
      world.platforms.push({
        elev: true,
        test: (px, pz) => cr.state !== "broken" && Math.abs(px - cr.wx) <= cr.hw && Math.abs(pz - cr.wz) <= cr.hw,
        y: () => cr.wy
      });
    };

    addThinIce("ice1", -6.6, -8.2, 3.35, 3.1);
    addStarCrystal(-5.0, -9.0, 4.00);

    addThinIce("ice2", -9.4, -5.6, 3.55, 3.1);
    addStarCrystal(-8.0, -6.9, 4.20);

    // Spacious Holly-Lantern Windmill Terrace P7 (-10.6, -1.6, y = +3.72, 4.2×4.2!)
    addStaticPlat(-10.6, -1.6, 3.72, 4.2, 4.2, "cedar");
    addStarCrystal(-10.1, -3.6, 4.38);

    const wmG = new T.Group();
    wmG.position.set(-10.6, 3.72, -1.6);
    wmG.add(
      this.mesh(new T.CylinderGeometry(0.24, 0.32, 0.72, 12), this.m.cedar, 0, 0.36, 0),
      this.mesh(new T.TorusGeometry(0.28, 0.045, 6, 16).rotateX(Math.PI / 2), this.m.gold, 0, 0.68, 0),
      this.mesh(new T.OctahedronGeometry(0.24, 0), this.m.auroraPink, 0, 0.92, 0)
    );
    const armPivot = new T.Group();
    armPivot.position.set(0, 0.42, 0);
    armPivot.add(
      this.mesh(new T.CylinderGeometry(0.08, 0.08, 1.85, 10).rotateZ(Math.PI / 2), this.m.pine, 0.96, 0, 0),
      this.mesh(new T.SphereGeometry(0.16, 10, 8), this.m.starGold, 1.94, 0, 0)
    );
    for (let b = 0; b < 4; b++) {
      armPivot.add(this.mesh(new T.TorusGeometry(0.10, 0.025, 6, 12).rotateY(Math.PI / 2), b % 2 ? this.m.gold : this.m.holly, 0.45 + b * 0.38, 0, 0));
    }
    wmG.add(armPivot);
    g.add(wmG);
    this.windmill = {
      pivot: armPivot,
      wx: x0 - 10.6, wz: z0 - 1.6, wy: y0 + 3.72,
      len: 1.94, ang: 0, speed: 0.85, cool: 0
    };
    addStarCrystal(-10.6, -1.6, 4.88);

    // -----------------------------------------------------------------------
    // STAGE 4: Smooth Crystal Lift, Checkpoint #3 & Wide Final Gift Steps
    // -----------------------------------------------------------------------
    const r2 = r1.clone(true);
    g.add(r2);
    const mp2 = {
      mesh: r2,
      ax: -9.8, az: 2.2, ay: 3.82,
      bx: -6.8, bz: 5.6, by: 4.30,
      hw: 1.82, hd: 1.82,
      speed: 0.45, ph: 1.6,
      wx: x0 - 9.8, wz: z0 + 2.2, wy: y0 + 3.82,
      dx: 0, dz: 0, dy: 0
    };
    this.movingPlats.push(mp2);
    world.platforms.push({
      elev: true,
      test: (px, pz) => Math.abs(px - mp2.wx) <= mp2.hw && Math.abs(pz - mp2.wz) <= mp2.hd,
      y: () => mp2.wy
    });
    addStarCrystal(-8.3, 3.9, 4.85);

    // West-South High Balcony P8 — Checkpoint Lantern #3 + 3rd Hanging Star-Bell Gift!
    addStaticPlat(-3.6, 7.0, 4.45, 3.6, 3.6, "check");
    addLanternCheckpoint(3, -3.6, 7.0, 4.45, -2.35, "三号雪灯存档台（云端观景台）");
    addBellGift(-3.6, 7.0, 6.12);

    // Wide Comfortable Gift-Box Stepping Piers straight to Summit!
    addStaticPlat(-1.2, 4.8, 4.82, 3.1, 3.1, "giftRed");
    addStarCrystal(-2.4, 5.9, 5.45);

    addStaticPlat(1.2, 2.8, 5.15, 3.1, 3.1, "giftPine");
    addStarCrystal(0.0, 3.8, 5.78);

    // -----------------------------------------------------------------------
    // STAGE 5: GRAND AURORA STAR-SPIRE SUMMIT PAVILION (Center: 0, 0, y = +5.40m!)
    // -----------------------------------------------------------------------
    const sumG = new T.Group();
    sumG.position.set(0, 0, 0);
    const towerBot = -0.35;
    const towerTop = sumH - 0.58;
    const towerH = towerTop - towerBot;
    const rTop = 1.82, rBot = 2.22;
    sumG.add(
      // Octagonal ivory tower shaft anchored firmly below snow surface
      this.mesh(new T.CylinderGeometry(rTop, rBot, towerH, 8), this.m.ivory, 0, towerBot + towerH / 2, 0),
      this.mesh(new T.TorusGeometry(rBot + 0.04, 0.13, 8, 24).rotateX(Math.PI / 2), this.m.gold, 0, 0.08, 0),
      // Non-overlapping Summit Deck: cedar [-0.58..-0.08], snow cap [-0.08..0.00], gold rim & inner crystal ring!
      this.mesh(new T.CylinderGeometry(3.48, 3.12, 0.50, 8), this.m.cedar, 0, sumH - 0.33, 0),
      this.mesh(new T.CylinderGeometry(3.58, 3.58, 0.08, 8), this.m.snow, 0, sumH - 0.04, 0),
      this.mesh(new T.TorusGeometry(3.52, 0.09, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, sumH - 0.01, 0),
      this.mesh(new T.TorusGeometry(2.68, 0.045, 6, 32).rotateX(Math.PI / 2), this.m.crystal, 0, sumH + 0.035, 0)
    );
    // 4 Framed Cathedral Windows flush & tilted to match the octagonal tower taper (ZERO wall clipping!)
    const winMidY = 2.45;
    const tFrac = (winMidY - towerBot) / towerH;
    const rAtWin = rBot + (rTop - rBot) * tFrac;
    const apothem = rAtWin * Math.cos(Math.PI / 8); // exact distance to flat octagonal face!
    const slopeTilt = Math.atan2(rBot - rTop, towerH);
    for (let i = 0; i < 4; i++) {
      // Three.js CylinderGeometry(8) vertices are at k*PI/4 starting from +Z; flat face normals are at (k + 0.5)*PI/4!
      const ang = (i * 2 + 0.5) * (Math.PI / 4);
      const wg = new T.Group();
      wg.position.set(Math.sin(ang) * (apothem + 0.06), winMidY, Math.cos(ang) * (apothem + 0.06));
      wg.rotation.y = ang;
      wg.rotation.x = -slopeTilt;
      wg.add(
        this.mesh(new T.BoxGeometry(0.76, 1.38, 0.08), this.m.cedar, 0, 0, 0),
        this.mesh(new T.BoxGeometry(0.60, 1.20, 0.06), this.m.starGold, 0, 0, 0.045),
        this.mesh(new T.BoxGeometry(0.84, 0.10, 0.14), this.m.gold, 0, -0.71, 0.02),
        this.mesh(new T.BoxGeometry(0.84, 0.10, 0.14), this.m.snow, 0, 0.72, 0.02)
      );
      sumG.add(wg);
    }

    // Solid ground-level collider on the central stone Summit Tower (blocks walking through stone shaft, free on top!)
    world.circles.push({ x: x0, z: z0, r: 2.26, top: sumH - 0.55 });

    // SUMMIT AURORA STAR-CHIME BEACON SPIRE
    const spireG = new T.Group();
    spireG.position.set(-1.55, sumH, -1.25);
    const beaconStar = this.mesh(new T.OctahedronGeometry(0.36, 0), this.m.starGold, 0, 3.45, 0);
    const beaconRing = this.mesh(new T.TorusGeometry(0.54, 0.045, 8, 24), this.m.crystal, 0, 3.45, 0);
    const beamMat = plain(new T.MeshBasicMaterial({
      color: 0x7ef8ff, transparent: true, opacity: 0.0, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending
    }));
    const skyBeam = this.mesh(new T.CylinderGeometry(0.18, 0.72, 16, 16, 1, true), beamMat, 0, 11.4, 0);
    spireG.add(
      this.mesh(new T.CylinderGeometry(0.28, 0.36, 0.28, 10), this.m.stone, 0, 0.14, 0),
      this.mesh(new T.CylinderGeometry(0.065, 0.085, 3.10, 10), this.m.gold, 0, 1.65, 0),
      this.mesh(new T.ConeGeometry(0.20, 0.28, 12), this.m.starGold, 0.42, 2.68, 0),
      this.mesh(new T.BoxGeometry(0.50, 0.06, 0.06), this.m.gold, 0.25, 2.86, 0),
      beaconStar, beaconRing, skyBeam
    );
    sumG.add(spireG);
    this.summitBeacon = { star: beaconStar, ring: beaconRing, beamMat, lit: false };
    this.spinners.push({ obj: beaconStar, spd: 1.9 }, { obj: beaconRing, spd: -1.4 });

    // Summit Starlight Return Portal Pillar (+1.85, -1.35, sumH)
    const retP = new T.Group();
    retP.position.set(1.85, sumH, -1.35);
    const retRing = this.mesh(new T.TorusGeometry(0.55, 0.055, 8, 24), this.m.crystal, 0, 0.95, 0);
    retP.add(
      this.mesh(new T.CylinderGeometry(0.42, 0.50, 0.22, 14), this.m.ivory, 0, 0.11, 0),
      this.mesh(new T.TorusGeometry(0.46, 0.04, 6, 20).rotateX(Math.PI / 2), this.m.gold, 0, 0.22, 0),
      retRing
    );
    this.spinners.push({ obj: retRing, spd: 1.6 });
    sumG.add(retP);
    g.add(sumG);

    world.platforms.push({
      elev: true,
      test: (px, pz) => (px - x0) ** 2 + (pz - z0) ** 2 <= 3.62 * 3.62,
      y: () => y0 + sumH
    });

    // 4 Crown Star-Crystals orbiting the Summit Pavilion!
    addStarCrystal(0.0, 1.65, sumH + 0.85);
    addStarCrystal(1.65, 0.0, sumH + 0.85);
    addStarCrystal(0.0, -1.65, sumH + 0.85);
    addStarCrystal(-1.65, 0.0, sumH + 0.85);

    // -----------------------------------------------------------------------
    // 2. ENTRANCE & COURTYARD FACILITIES (ALL TERRAIN-GROUNDED!)
    // -----------------------------------------------------------------------
    // Left (-4.8, +13.4): Shimmering Aurora Recall Crystal Portal
    const portalG = new T.Group();
    const portalGround = this.relGround(-4.8, 13.4);
    portalG.position.set(-4.8, portalGround, 13.4);
    const pRing = this.mesh(new T.TorusGeometry(0.68, 0.06, 8, 24), this.m.crystal, 0, 1.25, 0);
    const pCore = this.mesh(new T.OctahedronGeometry(0.26, 0), this.m.auroraPink, 0, 1.25, 0);
    portalG.add(
      this.mesh(new T.CylinderGeometry(0.58, 0.72, 0.64, 14), this.m.ivory, 0, 0.02, 0),
      this.mesh(new T.TorusGeometry(0.62, 0.045, 6, 20).rotateX(Math.PI / 2), this.m.gold, 0, 0.35, 0),
      pRing, pCore
    );
    this.spinners.push({ obj: pRing, spd: 1.5 }, { obj: pCore, spd: -2.4 });
    g.add(portalG);
    world.circles.push({ x: x0 - 4.8, z: z0 + 13.4, r: 0.70 });

    // Right (+4.8, +13.4): Snowy Nordic Trial Brass Bell
    const bellG = new T.Group();
    const bellGround = this.relGround(4.8, 13.4);
    bellG.position.set(4.8, bellGround, 13.4);
    bellG.add(
      this.mesh(new T.BoxGeometry(0.80, 0.62, 0.80), this.m.stone, 0, 0.01, 0),
      this.mesh(new T.CylinderGeometry(0.07, 0.08, 2.05, 10), this.m.cedar, -0.34, 1.18, 0),
      this.mesh(new T.CylinderGeometry(0.07, 0.08, 2.05, 10), this.m.cedar, 0.34, 1.18, 0),
      this.mesh(new T.BoxGeometry(1.06, 0.14, 0.34), this.m.cedar, 0, 2.22, 0),
      this.mesh(new T.BoxGeometry(1.12, 0.10, 0.40), this.m.snow, 0, 2.34, 0),
      this.mesh(new T.ConeGeometry(0.24, 0.34, 14), this.m.starGold, 0, 1.88, 0),
      this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, 0, 1.66, 0)
    );
    g.add(bellG);
    world.circles.push({ x: x0 + 4.8, z: z0 + 13.4, r: 0.56 });

    // Courtyard Quick-Recall Snow-Pad right near center tower base (-2.9, +2.9) so falling anywhere lets you warp right back!
    const midRecallG = new T.Group();
    const midGround = this.relGround(-3.6, 2.2);
    midRecallG.position.set(-3.6, midGround, 2.2);
    const midRing = this.mesh(new T.TorusGeometry(0.46, 0.045, 8, 20), this.m.crystal, 0, 0.92, 0);
    midRecallG.add(
      this.mesh(new T.CylinderGeometry(0.44, 0.54, 0.42, 12), this.m.ivory, 0, 0.01, 0),
      this.mesh(new T.TorusGeometry(0.48, 0.035, 6, 18).rotateX(Math.PI / 2), this.m.gold, 0, 0.22, 0),
      midRing
    );
    this.spinners.push({ obj: midRing, spd: 1.8 });
    g.add(midRecallG);
    world.circles.push({ x: x0 - 3.6, z: z0 + 2.2, r: 0.50 });

    // -----------------------------------------------------------------------
    // 3. WARM COURSE LIGHTS (Auto-managed by O.localLights)
    // -----------------------------------------------------------------------
    const addL = (lx, ly, lz, col, pwr) => {
      const l = new T.PointLight(col, 0, 24, 1.4);
      l.position.set(x0 + lx, y0 + ly, z0 + lz);
      scene.add(l);
      this.lights.push({ l, pwr });
    };
    addL(0, sumH + 3.2, 0, 0xffe488, 16);
    addL(0, 3.8, 12.6, 0x8ef5ff, 12);

    // -----------------------------------------------------------------------
    // 4. INTERACTIVE SPOTS, GIFT & BELL COMPATIBILITY
    // -----------------------------------------------------------------------
    world.spots.push({
      id: "parkour_warp_cp",
      pos: new T.Vector3(x0 - 4.8, y0 + portalGround + 1.2, z0 + 13.4),
      r: 2.9,
      label: () => (this.checkpointIdx > 0
        ? `触碰星光雪门 · 传回「${this.spawnPts[this.checkpointIdx].name}」`
        : "星光回溯雪门（点亮上方雪灯存档台后即可直达！）"),
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => this.warpToCheckpoint()
    });

    world.spots.push({
      id: "parkour_mid_warp",
      pos: new T.Vector3(x0 - 3.6, y0 + midGround + 1.0, z0 + 2.2),
      r: 3.0,
      label: () => `中庭回溯水晶 · 一键传回「${this.spawnPts[this.checkpointIdx].name}」`,
      can: () => !this.game.player.riding && !this.game.player.skiing && this.checkpointIdx > 0,
      act: () => this.warpToCheckpoint()
    });

    world.spots.push({
      id: "parkour_restart",
      pos: new T.Vector3(x0 + 4.8, y0 + bellGround + 1.2, z0 + 13.4),
      r: 2.8,
      label: () => (this.best.score > 0
        ? `敲响试炼铜钟 · 重新冲分（历史最高 ${this.best.score} 分 / ${this.best.rank}）`
        : "敲响试炼铜钟 · 开启极光跃动计时冲分！"),
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => this.resetRun(true)
    });

    world.spots.push({
      id: "parkour_summit_exit",
      pos: new T.Vector3(x0 + 1.85, y0 + sumH + 0.9, z0 - 1.35),
      r: 2.5,
      label: "星光雪门 · 优雅滑回起点广场",
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => {
        this.sfxRecallPortal();
        this.game.player.teleport(x0, z0 + 14.8, 0, -0.10);
        this.game.ui.toast("✦ 乘着极光雪风回到试炼大门前啦喵～", 3.5);
      }
    });

    if (explore) {
      explore.mazeGate = { x: x0, z: z0 + 14.2 };
      // Map original mazeEnds bells onto our new rebalanced P3, P5, and CP3 platform centers!
      this.bellRemap = [
        { oldX: x0 + 10.0, oldZ: z0 + 5.0, x: x0 + 8.7, y: y0 + 1.38 + 0.85, z: z0 + 6.7 },
        { oldX: x0 + 4.6,  oldZ: z0 - 9.8, x: x0 + 4.5, y: y0 + 2.28 + 0.85, z: z0 - 9.6 },
        { oldX: x0 - 3.6,  oldZ: z0 + 7.2, x: x0 - 3.6, y: y0 + 4.45 + 0.85, z: z0 + 7.0 }
      ];
      this.bellCoords = this.bellRemap.map((r) => [r.x, r.y, r.z]);
      explore.mazeEnds = this.bellCoords.map(([bx, , bz]) => [bx, bz, 10]);

      const giftObj = world.props.getObjectByName("gift_3").clone(true);
      giftObj.scale.setScalar(1.9);
      giftObj.position.set(x0, y0 + sumH - 0.02, z0);
      giftObj.rotation.y = 0.5;
      scene.add(giftObj);
      explore.mazeGift = giftObj;
      world.spots.push({
        id: "mazeGift",
        pos: new T.Vector3(x0, y0 + sumH + 0.65, z0),
        r: 2.5,
        label: "打开极光顶塔圣诞大礼物！",
        can: () => !this.game.logic.task("maze").done,
        act: () => explore.openGift()
      });

      if (explore.signpost) {
        explore.signpost(x0 + 3.4, z0 + 15.6, 0.1, [
          ["极光跃动试炼", x0, z0 + 13.0],
          ["冰晶琴", this.re.crystals.x, this.re.crystals.z]
        ]);
      }
      const site = explore.sites && explore.sites.find((s) => s.id === "maze");
      if (site) site.name = "极光跃动试炼场";
    }

    this.createHud();
    return this;
  }

  elevateBells() {
    const bells = this.game.explore && this.game.explore.bells;
    if (!bells || !this.bellRemap) return;
    for (const r of this.bellRemap) {
      const b = bells.find((it) => Math.hypot(it.x - r.oldX, it.z - r.oldZ) < 1.2);
      if (b) {
        b.x = r.x;
        b.y = r.y;
        b.z = r.z;
        b.m.position.set(r.x, r.y, r.z);
      }
    }
  }

  createHud() {
    const hud = document.getElementById("hud");
    if (!hud || document.getElementById("parkourHud")) return;
    const el = document.createElement("div");
    el.id = "parkourHud";
    el.className = "glass";
    el.style.cssText = [
      "position:fixed", "left:50%", "top:14px", "transform:translateX(-58%)",
      "padding:5px 12px", "border-radius:999px", "font-size:12.5px", "font-weight:700",
      "display:none", "gap:8px", "align-items:center", "z-index:24",
      "pointer-events:auto", "letter-spacing:0.1px", "white-space:nowrap",
      "box-shadow:0 6px 22px rgba(20,30,68,0.20)", "transition:top 0.2s ease"
    ].join(";");
    const txt = document.createElement("span");
    el.appendChild(txt);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "✦ 传回";
    btn.style.cssText = [
      "display:none", "padding:3px 10px", "border-radius:999px",
      "border:1px solid rgba(72,188,238,0.65)",
      "background:linear-gradient(135deg,#25558a,#3d7cc4)",
      "color:#fff", "font-size:12px", "font-weight:700", "cursor:pointer"
    ].join(";");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.warpToCheckpoint();
    });
    el.appendChild(btn);
    hud.appendChild(el);
    this.hudEl = el;
    this.hudTextEl = txt;
    this.hudWarpBtn = btn;

    const pop = document.createElement("div");
    pop.id = "parkourPop";
    pop.style.cssText = [
      "position:fixed", "left:50%", "bottom:142px", "transform:translate(-50%, 0)",
      "padding:5px 15px", "border-radius:999px", "font-size:13px", "font-weight:800",
      "color:#fffbe6", "background:linear-gradient(90deg, rgba(32,96,158,0.92), rgba(142,64,186,0.92))",
      "box-shadow:0 4px 16px rgba(40,120,220,0.35)", "z-index:25",
      "pointer-events:none", "opacity:0", "transition:opacity 0.25s ease, transform 0.25s ease",
      "white-space:nowrap"
    ].join(";");
    hud.appendChild(pop);
    this.popEl = pop;
  }

  resetRun(toast = false) {
    this.runActive = true;
    this.runCleared = false;
    this.runTime = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.crystalCount = 0;
    this.falls = 0;
    this.checkpointIdx = 0;
    this.wasElevated = false;
    this.drumBonusDone = false;
    this.drumGlide = null;
    this.iceVisited.clear();
    this.iceBonusDone = false;

    for (const c of this.crystals) {
      c.got = false;
      c.group.visible = true;
    }
    for (const bg of this.bellGifts) {
      bg.hit = false;
      bg.box.material = this.m.bellGiftLit;
    }
    for (const cp of this.checkpoints) {
      cp.reached = false;
      cp.orb.material = this.m.lanternOff;
    }
    if (this.summitBeacon) {
      this.summitBeacon.lit = false;
      this.summitBeacon.beamMat.opacity = 0;
    }
    if (toast) {
      this.sfxLanternCheckpoint();
      const sp = this.spawnPts[0];
      this.game.player.teleport(sp.x, sp.z, sp.yaw, -0.08);
      this.game.ui.toast("❄ 试炼铜钟已敲响！连续收集极光星雪晶可叠高连击倍率，轻松冲顶吧喵～", 4.5);
    }
  }

  triggerVictory() {
    if (this.runCleared) return;
    this.runCleared = true;
    this.runActive = false;

    const speedBonus = this.runTime > 0.5 ? Math.max(0, Math.round((80 - this.runTime) * 16)) : 200;
    const flawlessBonus = this.falls === 0 ? 800 : 0;
    this.score += speedBonus + flawlessBonus + 500;

    const rank =
      this.score >= 5200 ? "S+" :
      this.score >= 3800 ? "S" :
      this.score >= 2400 ? "A" : "B";

    let isNewBest = false;
    this.best.clears++;
    if (this.score > this.best.score) {
      this.best.score = this.score;
      this.best.rank = rank;
      isNewBest = true;
    }
    if (this.runTime > 0.5 && (!this.best.time || this.runTime < this.best.time)) {
      this.best.time = Number(this.runTime.toFixed(1));
    }
    this.saveBest();

    if (this.summitBeacon) {
      this.summitBeacon.lit = true;
      this.summitBeacon.beamMat.opacity = 0.42;
    }

    const g = this.game;
    this.sfxSummitChime();
    g.character && g.character.play && g.character.play("victory");
    g.cold && g.cold.warm(45);

    const cols = [[0.4, 2.9, 3.6], [3.5, 2.6, 0.5], [3.4, 1.0, 2.8], [0.6, 3.4, 2.0]];
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2;
      const c = cols[k % cols.length];
      g.sparks.spawn(
        this.cx + Math.cos(a) * 1.9, this.baseY + this.sumH + 0.55, this.cz + Math.sin(a) * 1.9,
        Math.cos(a) * (1.8 + Math.random() * 2.2), 2.5 + Math.random() * 2.8, Math.sin(a) * (1.8 + Math.random() * 2.2),
        0.14, 0.95, 1.3, c[0], c[1], c[2], 1.2, 1.2
      );
    }

    const tStr = this.runTime > 0.5 ? `${this.runTime.toFixed(1)}s` : "凌空登顶";
    const flawTxt = flawlessBonus ? " · 无失误 +800" : "";
    const recTxt = isNewBest ? "【新纪录！】" : "";
    this.showScorePop(`🏆 登顶结算 ${this.score} 分（${rank}）${recTxt}`);
    g.ui.toast(
      `🏆 通关「雪境极光跃动试炼」！总积分 ${this.score}（评级 ${rank}）${recTxt}｜用时 ${tStr} · 星晶 ${this.crystalCount}/${this.crystals.length} · 最高连击 ×${Math.max(1, this.maxCombo)}${flawTxt}，别忘了开顶塔大礼物喵～`,
      8.0
    );
  }

  update(dt, time) {
    if (!this.group) return;
    const g = this.game, pl = g.player;
    const inside = !!((g.cabin && g.cabin.inside) || (g.chemlab && g.chemlab.inside));
    const dist = pl && !inside ? Math.hypot(pl.pos.x - this.cx, pl.pos.z - this.cz) : 999;

    if (this.popTimer > 0) {
      this.popTimer -= dt;
      if (this.popTimer <= 0 && this.popEl) {
        this.popEl.style.opacity = "0";
        this.popEl.style.transform = "translate(-50%, 6px) scale(0.96)";
      }
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // 1) Wide Smooth Aurora Snow-Rafts with rock-solid XYZ player carry physics
    for (const mp of this.movingPlats) {
      const prevX = mp.wx, prevZ = mp.wz, prevY = mp.wy;
      const s = 0.5 - 0.5 * Math.cos(time * mp.speed + mp.ph);
      const lx = mp.ax + (mp.bx - mp.ax) * s;
      const lz = mp.az + (mp.bz - mp.az) * s;
      const ly = mp.ay + (mp.by - mp.ay) * s;
      mp.mesh.position.set(lx, ly, lz);
      mp.wx = this.cx + lx;
      mp.wz = this.cz + lz;
      mp.wy = this.baseY + ly;
      mp.dx = mp.wx - prevX;
      mp.dz = mp.wz - prevZ;
      mp.dy = mp.wy - prevY;

      if (pl && pl.enabled && !pl.riding && !pl.seat && !pl.skiing && pl.air <= 0.16 && dist < 24) {
        if (Math.abs(pl.pos.x - prevX) <= mp.hw && Math.abs(pl.pos.z - prevZ) <= mp.hd) {
          const footY = pl.y - pl.eye + pl.air;
          if (Math.abs(footY - prevY) < 0.60) {
            pl.pos.x += mp.dx;
            pl.pos.z += mp.dz;
            if (pl.air === 0) pl.y += mp.dy;
          }
        }
      }
    }

    // 2) Forgiving Thin-Ice Frost Panes (solid -> generous 3.2s golden-cyan warning -> 1.8s shatter -> refreeze!)
    for (const cr of this.crumblePlats) {
      if (cr.state === "solid") {
        if (pl && pl.enabled && !pl.riding && !pl.seat && pl.air <= 0.12 && dist < 22) {
          if (Math.abs(pl.pos.x - cr.wx) <= cr.hw && Math.abs(pl.pos.z - cr.wz) <= cr.hw) {
            const footY = pl.y - pl.eye + pl.air;
            if (Math.abs(footY - cr.wy) < 0.52) {
              cr.state = "shaking";
              cr.timer = 3.20;
              this.sfxThinIceCrack();
              this.iceVisited.add(cr.id);
              if (this.iceVisited.size >= 2 && !this.iceBonusDone) {
                this.iceBonusDone = true;
                this.addScore(200, "🧊 凌波踏冰连跳");
              }
            }
          }
        }
      } else if (cr.state === "shaking") {
        cr.timer -= dt;
        const p = 1 - Math.max(0, cr.timer) / 3.20;
        const j = 0.045 * p;
        cr.group.position.set(
          cr.lx + Math.sin(time * 42) * j,
          cr.topH + Math.cos(time * 38) * j * 0.4,
          cr.lz + Math.cos(time * 40) * j
        );
        cr.mat.emissiveIntensity = 0.75 + 0.65 * Math.sin(time * (12 + p * 18));
        if (cr.timer <= 0) {
          cr.state = "broken";
          cr.timer = 1.80;
          cr.group.visible = false;
          // If player was still standing on this tile, smoothly enter real fall with double-jump rescue available!
          if (pl && pl.enabled && !pl.riding && !pl.seat && pl.air === 0) {
            if (Math.abs(pl.pos.x - cr.wx) <= cr.hw && Math.abs(pl.pos.z - cr.wz) <= cr.hw) {
              const footY = pl.y - pl.eye;
              if (Math.abs(footY - cr.wy) < 0.55) {
                const gBelow = g.world.groundAt(pl.pos.x, pl.pos.z, footY - 0.1);
                const df = Math.max(0.05, footY - gBelow);
                pl.air = df;
                pl.y = gBelow + pl.eye;
                pl.vy = 0;
                pl.jumps = 1;
              }
            }
          }
          for (let k = 0; k < 14; k++) {
            const a = Math.random() * Math.PI * 2;
            g.puffs.spawn(
              cr.wx + Math.cos(a) * 0.7, cr.wy - 0.1, cr.wz + Math.sin(a) * 0.7,
              Math.cos(a) * 1.4, -0.6 - Math.random() * 1.2, Math.sin(a) * 1.4,
              0.12, 0.85, 0.55, 0.65, 0.94, 1.0, 2.0, 1.0
            );
          }
        }
      } else if (cr.state === "broken") {
        cr.timer -= dt;
        if (cr.timer <= 0) {
          cr.state = "solid";
          cr.group.visible = true;
          cr.group.position.set(cr.lx, cr.topH, cr.lz);
          cr.mat.emissiveIntensity = 0.55;
        }
      }
    }

    // 3) Giant Snowflake Trampoline Drum — with silky Auto-Guided Forward Arc toward CP2!
    for (const dr of this.bounceDrums) {
      if (dr.cool > 0) dr.cool -= dt;
      if (dr.squash > 0) {
        dr.squash = Math.max(0, dr.squash - dt * 3.0);
        const s = dr.squash;
        const b = Math.sin(s * Math.PI * 2.5) * s;
        dr.pad.position.y = dr.basePadY - 0.14 * b;
        dr.pad.scale.set(1 + 0.12 * b, 1 - 0.24 * b, 1 + 0.12 * b);
      } else {
        dr.pad.position.y = dr.basePadY;
        dr.pad.scale.set(1, 1, 1);
      }
      if (pl && pl.enabled && !pl.riding && !pl.seat && !pl.skiing && dr.cool <= 0 && dist < 24) {
        const d2 = (pl.pos.x - dr.wx) ** 2 + (pl.pos.z - dr.wz) ** 2;
        const footY = pl.y - pl.eye + pl.air;
        if (d2 < (dr.r - 0.05) ** 2 && Math.abs(footY - dr.wy) < 0.45 && pl.vy <= 0.8) {
          dr.cool = 0.55;
          dr.squash = 1.0;
          pl.air = Math.max(pl.air, 0.08);
          pl.vy = dr.launchVy;
          pl.jumps = 1; // Still keeps an extra air-jump in reserve!
          // Gently guide horizontal glide toward CP2 across the jump arc so landing feels silky & effortless!
          if (dr.guideX !== undefined) {
            const gx = dr.guideX - pl.pos.x;
            const gz = dr.guideZ - pl.pos.z;
            const flightT = 0.96;
            const vx = gx / flightT;
            const vz = gz / flightT;
            this.drumGlide = { t: flightT, vx, vz };
            pl.vel.x = vx;
            pl.vel.y = vz;
          }
          this.sfxSnowDrum();
          g.character && g.character.twirl && g.character.twirl();
          if (!this.drumBonusDone) {
            this.drumBonusDone = true;
            this.addScore(120, "❄ 雪花铃鼓腾跃");
          }
          for (let k = 0; k < 18; k++) {
            const a = (k / 18) * Math.PI * 2;
            g.sparks.spawn(
              dr.wx + Math.cos(a) * 0.9, dr.wy + 0.2, dr.wz + Math.sin(a) * 0.9,
              Math.cos(a) * 1.8, 1.8 + Math.random() * 1.4, Math.sin(a) * 1.8,
              0.12, 0.95, 0.72, 0.6, 3.0, 3.6, 1.2, 1.1
            );
          }
        }
      }
    }

    // Sustain guided Bounce-Drum forward arc through mid-air (cancels cleanly on landing!)
    if (this.drumGlide) {
      if (!pl || !pl.enabled || pl.riding || pl.seat || pl.air <= 0 || this.drumGlide.t <= 0) {
        this.drumGlide = null;
      } else {
        this.drumGlide.t -= dt;
        const moveInput = pl.keys && (pl.keys.has("KeyW") || pl.keys.has("KeyS") || pl.keys.has("KeyA") || pl.keys.has("KeyD") || pl.keys.has("ArrowUp") || pl.keys.has("ArrowDown"));
        const k = moveInput ? 0.45 : 1.0;
        pl.pos.x += this.drumGlide.vx * dt * k;
        pl.pos.z += this.drumGlide.vz * dt * k;
      }
    }

    // 4) Playful Spinning Holly-Lantern Windmill (slow, gentle upward hop-boop — NEVER flings you off!)
    if (this.windmill) {
      const wm = this.windmill;
      wm.ang = (wm.ang + dt * wm.speed) % (Math.PI * 2);
      wm.pivot.rotation.y = wm.ang;
      if (wm.cool > 0) wm.cool -= dt;
      if (this.windmillBonusCd > 0) this.windmillBonusCd -= dt;

      if (pl && pl.enabled && !pl.riding && !pl.seat && dist < 22) {
        const dx = pl.pos.x - wm.wx, dz = pl.pos.z - wm.wz;
        const r = Math.hypot(dx, dz);
        const footY = pl.y - pl.eye + pl.air;
        if (r > 0.30 && r < wm.len && footY > wm.wy - 0.2 && footY < wm.wy + 1.65) {
          const ax = Math.cos(wm.ang), az = -Math.sin(wm.ang);
          const proj = dx * ax + dz * az;
          const perp = Math.abs(dx * (-az) + dz * ax);
          if (proj > 0.15 && proj < wm.len && perp < 0.28) {
            if (footY >= wm.wy + 0.42 && this.windmillBonusCd <= 0) {
              this.windmillBonusCd = 1.6;
              this.sfxCrystal(this.combo + 2);
              this.addScore(150, "✨ 完美飞跃灯杆");
            } else if (footY < wm.wy + 0.40 && wm.cool <= 0) {
              wm.cool = 0.95;
              // Playful upward hop + gentle inward pull toward terrace center so you stay safely on the deck!
              const invR = 1 / Math.max(0.4, r);
              pl.vel.x = pl.vel.x * 0.35 - dx * invR * 0.85;
              pl.vel.y = pl.vel.y * 0.35 - dz * invR * 0.85;
              pl.air = Math.max(pl.air, 0.08);
              pl.vy = 3.6;
              pl.jumps = 1;
              this.sfxSnowDrum();
              if (time - this.windmillWarnT > 6) {
                this.windmillWarnT = time;
                g.ui.toast("叮咚～被冬青灯杆轻轻弹跳了一下！跳过去还能拿 +150 技巧分喵～", 3.4);
              }
            }
          }
        }
      }
    }

    // 5) Hanging Star-Bell Gift Boxes (Jump up to ring & pop from below!)
    for (const bg of this.bellGifts) {
      if (bg.bounceT > 0) {
        bg.bounceT = Math.max(0, bg.bounceT - dt * 4.5);
        bg.group.position.y = bg.baseY + Math.sin(bg.bounceT * Math.PI) * 0.30;
        bg.bell.rotation.z = Math.sin(bg.bounceT * Math.PI * 4) * 0.45;
      } else {
        bg.group.position.y = bg.baseY + (bg.hit ? 0 : Math.sin(time * 2.8 + bg.wx) * 0.045);
        bg.bell.rotation.z = Math.sin(time * 3.0 + bg.wx) * 0.08;
      }
      bg.group.rotation.y = Math.sin(time * 1.2 + bg.wx) * 0.18;

      if (!bg.hit && pl && pl.enabled && !pl.riding && pl.air > 0.12 && pl.vy > 0 && dist < 24) {
        const d = Math.hypot(pl.pos.x - bg.wx, pl.pos.z - bg.wz);
        const headY = pl.y - pl.eye + pl.air + 1.48;
        if (d < 0.95 && headY >= bg.worldBottomY - 0.25 && headY <= bg.worldBottomY + 0.90) {
          bg.hit = true;
          bg.bounceT = 1.0;
          bg.box.material = this.m.bellGiftOpened;
          pl.vy = Math.min(pl.vy, -0.8);
          this.sfxBellGift();
          const pts = this.addScore(300, "🎁 摇响星愿铃铛礼盒");
          for (let k = 0; k < 18; k++) {
            const a = (k / 18) * Math.PI * 2;
            g.sparks.spawn(
              bg.wx, bg.worldBottomY + 0.65, bg.wz,
              Math.cos(a) * 1.6, 2.1 + Math.random() * 1.6, Math.sin(a) * 1.6,
              0.13, 0.95, 0.88, 3.6, 2.8, 0.5, 2.4, 1.1
            );
          }
          g.ui.toast(`叮铃～跳起摇响星愿铃铛礼盒，获得 +${pts} 积分！`, 3.2);
        }
      }
    }

    // 6) Spin & Collect Glowing Aurora Star-Crystals!
    const pFootY = pl ? pl.y - pl.eye + pl.air : 0;
    for (const c of this.crystals) {
      if (c.got) continue;
      c.group.rotation.y = time * 2.4 + c.ph;
      c.group.position.y = c.baseH + Math.sin(time * 3.0 + c.ph) * 0.08;
      if (pl && pl.enabled && !pl.riding && dist < 24) {
        const d = Math.hypot(pl.pos.x - c.wx, pl.pos.z - c.wz);
        if (d < 1.12 && Math.abs((pFootY + 0.72) - c.wy) < 1.25) {
          c.got = true;
          c.group.visible = false;
          this.crystalCount++;
          this.addScore(100, "✦ 极光星雪晶");
          this.sfxCrystal(this.combo);
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * Math.PI * 2;
            g.sparks.spawn(
              c.wx, c.wy, c.wz,
              Math.cos(a) * 1.2, 1.2 + Math.random() * 0.9, Math.sin(a) * 1.2,
              0.10, 0.95, 0.55, 0.5, 3.0, 3.6, 1.4, 1.0
            );
          }
        }
      }
    }

    // 7) Course Timer, Fall Tracking, Lantern Checkpoints & Authentic On-Foot Summit Clear!
    if (pl && pl.enabled && !inside && !pl.riding && !pl.seat && !pl.skiing && dist < 22) {
      if (!this.runActive && !this.runCleared && dist < 13.8 && pl.pos.z > this.cz + 8.0) {
        this.runActive = true;
        this.runTime = 0;
      }
      if (this.runActive) {
        this.runTime += dt;
        const relY = pFootY - this.baseY;
        if (relY > 1.45) this.wasElevated = true;
        else if (this.wasElevated && relY < 0.25 && pl.air === 0) {
          this.wasElevated = false;
          this.falls++;
          this.combo = 0;
          this.comboTimer = 0;
        }
      }

      for (const cp of this.checkpoints) {
        if (!cp.reached && Math.hypot(pl.pos.x - cp.wx, pl.pos.z - cp.wz) < 2.15 && Math.abs(pFootY - cp.wy) < 0.85) {
          cp.reached = true;
          cp.orb.material = this.m.lanternLit;
          if (cp.idx > this.checkpointIdx) this.checkpointIdx = cp.idx;
          this.sfxLanternCheckpoint();
          this.addScore(250, `🏮 点亮${cp.name.slice(0, 4)}`);
          g.cold && g.cold.warm(25);
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2;
            g.sparks.spawn(
              cp.wx, cp.wy + 1.2, cp.wz,
              Math.cos(a) * 1.6, 1.5 + Math.random() * 1.2, Math.sin(a) * 1.6,
              0.12, 0.95, 0.8, 0.5, 3.0, 3.6, 1.0, 1.1
            );
          }
          g.ui.toast(`🏮 已点亮「${cp.name}」！掉落可点上方「传回存档台」或碰回溯水晶一键返回喵～`, 4.5);
        }
      }

      // Authentic on-foot Summit Pavilion Clear (never falsely triggered by helicopter flyover!)
      if (
        !this.runCleared &&
        pl.air < 0.65 &&
        Math.hypot(pl.pos.x - this.cx, pl.pos.z - this.cz) < 3.45 &&
        pFootY >= this.baseY + this.sumH - 0.35 &&
        pFootY <= this.baseY + this.sumH + 1.80
      ) {
        this.triggerVictory();
      }
    }

    // Animate summit beacon glow & decorative spinners
    if (this.summitBeacon && this.summitBeacon.lit) {
      this.summitBeacon.beamMat.opacity = 0.34 + 0.12 * Math.sin(time * 3.5);
    }
    for (const sp of this.spinners) sp.obj.rotation.y = time * sp.spd;

    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;
    for (const lt of this.lights) {
      lt.l.intensity = lt.pwr * (0.45 + 0.55 * lamps);
    }

    // 8) Non-Overlapping Arena-Only HUD + One-Click Checkpoint Recall Pill!
    if (this.hudEl) {
      const show = !!(g.started && !inside && !(pl && pl.riding) && dist < 20.5);
      if (show !== this.hudShown) {
        this.hudShown = show;
        this.hudEl.style.display = show ? "flex" : "none";
        if (!show && this.popEl) {
          this.popEl.style.opacity = "0";
          this.popTimer = 0;
        }
      }
      if (show) {
        const trackEl = document.getElementById("track");
        const trackOn = !!(trackEl && trackEl.classList.contains("show"));
        this.hudEl.style.top = trackOn ? "56px" : "14px";
        const secs = this.runTime.toFixed(1).padStart(4, "0");
        const comboStr = this.combo >= 2 ? ` · 🔥×${this.combo}` : "";
        const bestStr = this.best.score > 0 ? ` · 👑${this.best.score}` : "";
        const status = this.runCleared ? "🏆登顶" : `⏱${secs}s`;
        this.hudTextEl.textContent = `❄ 试炼 · ${this.score}分${comboStr} · ✦${this.crystalCount}/${this.crystals.length} · ${status} · 🏮${this.checkpointIdx}/3${bestStr}`;
        this.hudWarpBtn.style.display = this.checkpointIdx > 0 && !this.runCleared ? "inline-block" : "none";
      }
    }
  }
}
