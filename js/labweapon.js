// 极其猫化学装备 (LabGear) + 隐藏神秘武器「118 Og · 周期表元素炮」 (ChemGun)
// - LabGear: Bone-tracked 3D Forehead Neon/Argon Safety Goggles, Starlight White Alchemist Lab Mantle & Pin,
//   Twin Floating Magnetic 10 Ne / 18 Ar Plasma Canister Pods (0% hair clipping!), and Tier-2 Orbiting Element Halo!
// - ChemGun: Unlocked inside the Indoor Chemistry Lab after charging 1 H / 6 C / 10 Ne / 18 Ar & opening the 118 Og Vault!
//   Cycles 5 authentic Gemini 4 elements on every shot: 1 H (Triple Bubble Bolts) -> 6 C (Diamond Prism) ->
//   10 Ne (Neon Flame Orb) -> 18 Ar (Electric Violet Arc) -> 118 Og (Rainbow Oganesson Periodic-Table Supernova!).

export const CHEM_GUN_DEF = {
  id: "chemgun",
  name: "118 Og 元素炮",
  verb: "元素发射",
  tip: "全自动准星瞄准 · 按住右键/F 开镜聚焦 · 按 X 或 1~5 切换元素（自动循环 / 1 H 氢三连 / 6 C 碳金刚 / 10 Ne 氖火环 / 18 Ar 氩连锁雷 / 118 Og 鿫超新星！）",
  how: "左键/J 射击（支持长按连发），右键/F 开镜精准瞄准，按 X 或点右下元素条切弹种！"
};

export const CHEM_GUN_POSE = [0.22, 0.44, 0.88, 0, 0, 0, 0.45];

const GEAR_KEY = "xmas_hajimi_labgear_v1";
const GUN_KEY = "xmas_hajimi_chemgun_v1";

const ELEMENT_SHOTS = [
  {
    id: "H",
    short: "1 H 氢",
    label: "1 H · 氢脉冲三连",
    css: "#4cf4ff",
    hex: 0x4cf4ff,
    rgb: [0.28, 0.94, 1.0],
    speed: 46,
    range: 58,
    spread: 3,
    cool: 0.21,
    recoil: 0.013,
    kind: "h_triple"
  },
  {
    id: "C",
    short: "6 C 碳",
    label: "6 C · 碳金刚穿甲",
    css: "#ffda5c",
    hex: 0xffda5c,
    rgb: [1.0, 0.86, 0.34],
    speed: 58,
    range: 68,
    spread: 1,
    cool: 0.24,
    recoil: 0.022,
    kind: "c_diamond"
  },
  {
    id: "Ne",
    short: "10 Ne 氖",
    label: "10 Ne · 氖等离子环",
    css: "#ff7242",
    hex: 0xff683b,
    rgb: [1.0, 0.42, 0.22],
    speed: 44,
    range: 62,
    spread: 1,
    cool: 0.25,
    recoil: 0.020,
    kind: "ne_ring"
  },
  {
    id: "Ar",
    short: "18 Ar 氩",
    label: "18 Ar · 氩雷电连锁",
    css: "#b482ff",
    hex: 0xa674ff,
    rgb: [0.68, 0.46, 1.0],
    speed: 68,
    range: 74,
    spread: 1,
    cool: 0.26,
    recoil: 0.024,
    kind: "ar_bolt"
  },
  {
    id: "Og",
    short: "118 Og ✦",
    label: "118 Og · 鿫超新星",
    css: "#ff66dc",
    hex: 0xff62d8,
    rgb: [1.0, 0.42, 0.88],
    speed: 38,
    range: 64,
    spread: 1,
    cool: 0.48,
    recoil: 0.036,
    kind: "og_nova"
  }
];

function playElementSynth(audio, kind, extra = 1.0) {
  if (!audio || audio.muted || !audio.ctx) return;
  // Route through our 44.1 kHz studio physical-modeling DSP bank in sfx.js!
  if (kind === "og_boom") {
    if (audio.chemImpact) { audio.chemImpact("og_boom", typeof extra === "number" ? extra : 1.0); return; }
  } else if (kind === "impact") {
    if (audio.chemImpact) { audio.chemImpact(typeof extra === "string" ? extra : "h_triple", 1.0); return; }
  } else if (kind === "switch") {
    if (audio.chemSwitch) { audio.chemSwitch(typeof extra === "number" ? extra : 0); return; }
  } else if (kind === "h_triple" || kind === "c_diamond" || kind === "ne_ring" || kind === "ar_bolt" || kind === "og_nova") {
    if (audio.chemShot) { audio.chemShot(kind, !!extra); return; }
  }
  // Gentle fallback for gear wardrobe chime (or if sfx.js isn't attached)
  const ctx = audio.ctx;
  const now = ctx.currentTime;
  const master = audio.master || ctx.destination;
  const tone = (f0, f1, delay, dur, gain = 0.036, type = "sine", rev = 0.36) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now + delay);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), now + delay + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, now + delay);
    g.gain.linearRampToValueAtTime(gain, now + delay + 0.012);
    g.gain.exponentialRampToValueAtTime(1e-4, now + delay + dur);
    osc.connect(lp).connect(g).connect(master);
    if (rev > 0 && audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = rev;
      g.connect(rg).connect(audio.rev);
    }
    osc.start(now + delay);
    osc.stop(now + delay + dur + 0.05);
  };
  tone(587.33, 587.33, 0, 0.14, 0.032, "sine", 0.38);
  tone(880, 880, 0.06, 0.16, 0.032, "sine", 0.40);
  tone(1174.66, 1318.5, 0.12, 0.24, 0.034, "triangle", 0.44);
}

// =============================================================================
// 1. WEARABLE 3D CAT-SCIENTIST LAB GEAR (Tracks character Head & Spine2 bones!)
// =============================================================================
export class LabGear {
  constructor(game, helpers) {
    this.game = game;
    this.THREE = game.THREE;
    this.wrapMat = helpers.mat;

    this.tier = 0; // 0 = off, 1 = standard scientist gear, 2 = 118 Og Element Master (+ orbiting Bohr halo)
    this.headGroup = null;
    this.torsoGroup = null;
    this.haloGroup = null;
    this.haloRing1 = null;
    this.haloRing2 = null;
    this.podL = null;
    this.podR = null;
    this.podRingL = null;
    this.podRingR = null;

    this._pos = new this.THREE.Vector3();
    this._quat = new this.THREE.Quaternion();
    this._off = new this.THREE.Vector3();
    this._euler = new this.THREE.Euler();
    this._sparkAcc = 0;
  }

  build() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.28, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));
    const mk = (geo, mat, x = 0, y = 0, z = 0) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = false;
      m.receiveShadow = false;
      m.frustumCulled = false;
      return m;
    };

    const mBrass = std(0xf2c868, 0.18, { metalness: 0.90 });
    const mWhite = std(0xf7faff, 0.34, { metalness: 0.06, emissive: new T.Color(0.14, 0.20, 0.32), emissiveIntensity: 0.20 });
    const mIndigo = std(0x1b2548, 0.42, { metalness: 0.28 });
    const mCyan = std(0x52f2ff, 0.12, { emissive: new T.Color(0.20, 0.88, 1.0), emissiveIntensity: 1.25 });
    const mGoldGlow = std(0xffe066, 0.14, { emissive: new T.Color(1.0, 0.72, 0.18), emissiveIntensity: 1.25 });
    const mNeon = std(0xff6c40, 0.12, { emissive: new T.Color(1.0, 0.36, 0.14), emissiveIntensity: 1.35 });
    const mArgon = std(0xa874ff, 0.12, { emissive: new T.Color(0.58, 0.28, 1.0), emissiveIntensity: 1.35 });
    const mGlass = plain(new T.MeshStandardMaterial({
      color: 0xe6faff, roughness: 0.06, metalness: 0.12, transparent: true, opacity: 0.38, depthWrite: false
    }));
    const mLensNe = plain(new T.MeshStandardMaterial({
      color: 0xff925c, emissive: new T.Color(1.0, 0.42, 0.16), emissiveIntensity: 0.85,
      roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.72
    }));
    const mLensAr = plain(new T.MeshStandardMaterial({
      color: 0xb892ff, emissive: new T.Color(0.56, 0.32, 1.0), emissiveIntensity: 0.85,
      roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.72
    }));

    // -------------------------------------------------------------------------
    // A. HEAD ASSEMBLY: Forehead Neon/Argon Alchemy Safety Goggles + Tier-2 Bohr Halo!
    //    Local bone coordinates: +Y = up, +Z = face forward, +X = character left.
    // -------------------------------------------------------------------------
    const headG = new T.Group();
    headG.name = "hajimi_lab_headgear";
    headG.visible = false;

    const goggles = new T.Group();
    // Perched stylishly on the upper forehead right under the cat ears (0% eye clipping!)
    goggles.position.set(0, 0.215, 0.145);
    goggles.rotation.x = -0.34;

    for (const side of [-1, 1]) {
      const cup = new T.Group();
      cup.position.set(side * 0.064, 0, -0.012);
      cup.rotation.y = side * 0.22;
      // Brass goggle bezel & side rivet
      cup.add(
        mk(new T.TorusGeometry(0.048, 0.011, 10, 22), mBrass, 0, 0, 0.012),
        mk(new T.CylinderGeometry(0.050, 0.052, 0.032, 18).rotateX(Math.PI / 2), mIndigo, 0, 0, -0.004),
        mk(new T.CylinderGeometry(0.044, 0.044, 0.010, 18).rotateX(Math.PI / 2), side < 0 ? mLensNe : mLensAr, 0, 0, 0.010),
        mk(new T.SphereGeometry(0.011, 8, 6), mBrass, side * 0.056, 0, -0.002)
      );
      goggles.add(cup);
    }
    // Central brass nose-bridge & top cyan indicator gem
    goggles.add(
      mk(new T.BoxGeometry(0.046, 0.016, 0.018), mBrass, 0, 0.006, 0.008),
      mk(new T.OctahedronGeometry(0.014, 0), mCyan, 0, 0.022, 0.018)
    );
    // Elastic dark-indigo & gold strap arching horizontally around the upper forehead temples (0% eye overlap!)
    const strap = mk(new T.TorusGeometry(0.146, 0.011, 8, 28, Math.PI * 1.28).rotateX(Math.PI / 2), mIndigo, 0, -0.004, -0.142);
    strap.rotation.y = -Math.PI * 0.14;
    goggles.add(strap);
    headG.add(goggles);

    // Tier-2 Orbiting Gemini 4 Atomic Bohr Halo floating gracefully above her cat ears!
    const haloG = new T.Group();
    haloG.position.set(0, 0.435, -0.01);
    haloG.visible = false;

    const r1 = new T.Group();
    r1.rotation.set(Math.PI * 0.44, 0.22, 0);
    r1.add(
      mk(new T.TorusGeometry(0.20, 0.0075, 6, 36), mGoldGlow),
      mk(new T.SphereGeometry(0.028, 10, 8), mCyan, 0.20, 0, 0),    // 1 H
      mk(new T.OctahedronGeometry(0.032, 0), mGoldGlow, -0.20, 0, 0) // 6 C Diamond
    );

    const r2 = new T.Group();
    r2.rotation.set(Math.PI * 0.54, -0.30, 0);
    r2.add(
      mk(new T.TorusGeometry(0.245, 0.007, 6, 40), mCyan),
      mk(new T.SphereGeometry(0.028, 10, 8), mNeon, 0, 0.245, 0),   // 10 Ne
      mk(new T.SphereGeometry(0.028, 10, 8), mArgon, 0, -0.245, 0)  // 18 Ar
    );

    haloG.add(r1, r2);
    headG.add(haloG);
    this.haloGroup = haloG;
    this.haloRing1 = r1;
    this.haloRing2 = r2;
    this.headGroup = headG;

    // -------------------------------------------------------------------------
    // B. TORSO ASSEMBLY: Starlight White Alchemist Collar-Cape + Element Badge
    //    + Twin Floating Magnetic 10 Ne / 18 Ar Plasma Canister Pods (0% hair clipping!)
    // -------------------------------------------------------------------------
    const torsoG = new T.Group();
    torsoG.name = "hajimi_lab_torsogear";
    torsoG.visible = false;

    // Structured White Alchemist High-Tech Shoulder Collar / Cropped Lab Mantle (above dress ruffles!)
    const mantle = new T.Group();
    mantle.position.set(0, 0.085, 0.005);
    // Open-front flared shoulder collar wrap (leaves front cleavage/ribbon & hair clear!)
    const collarArc = mk(new T.CylinderGeometry(0.088, 0.158, 0.135, 18, 1, true, Math.PI * 0.22, Math.PI * 1.56), mWhite, 0, 0, 0);
    collarArc.material = plain(new T.MeshStandardMaterial({
      color: 0xf7faff, roughness: 0.34, metalness: 0.06,
      emissive: new T.Color(0.14, 0.20, 0.32), emissiveIntensity: 0.22, side: T.DoubleSide
    }));
    const hemTrim = mk(new T.TorusGeometry(0.156, 0.010, 8, 28, Math.PI * 1.56).rotateX(Math.PI / 2), mBrass, 0, -0.066, 0);
    hemTrim.rotation.y = -Math.PI * 0.28;
    const neckTrim = mk(new T.TorusGeometry(0.090, 0.011, 8, 24, Math.PI * 1.56).rotateX(Math.PI / 2), mCyan, 0, 0.066, 0);
    neckTrim.rotation.y = -Math.PI * 0.28;
    // Left & right crisp white scientist lapel triangles + glowing cyan-gold chemist pin!
    const lapelL = mk(new T.BoxGeometry(0.052, 0.10, 0.016), mWhite, 0.065, -0.005, 0.098);
    lapelL.rotation.set(-0.18, 0.42, -0.22);
    const lapelR = mk(new T.BoxGeometry(0.052, 0.10, 0.016), mWhite, -0.065, -0.005, 0.098);
    lapelR.rotation.set(-0.18, -0.42, 0.22);
    // Glowing Element Brooch on left lapel + golden clasp at throat
    const pin = mk(new T.OctahedronGeometry(0.022, 0), mCyan, 0.072, -0.008, 0.116);
    const clasp = mk(new T.SphereGeometry(0.020, 10, 8), mGoldGlow, 0, 0.050, 0.098);
    mantle.add(collarArc, hemTrim, neckTrim, lapelL, lapelR, pin, clasp);
    torsoG.add(mantle);

    // Twin Floating Magnetic 10 Ne (Orange-Red) & 18 Ar (Violet-Blue) Plasma Canister Pods!
    // Positioned cleanly outboard of her twin-gradient flowing hair so 0% clipping ever happens!
    const mkPod = (coreMat, side) => {
      const p = new T.Group();
      p.position.set(side * 0.265, 0.07, -0.145);
      p.rotation.z = -side * 0.14;
      const core = mk(new T.CylinderGeometry(0.026, 0.026, 0.19, 12), coreMat, 0, 0, 0);
      core.renderOrder = 1;
      const jar = mk(new T.CylinderGeometry(0.044, 0.044, 0.22, 14), mGlass, 0, 0, 0);
      jar.renderOrder = 2;
      const ring = mk(new T.TorusGeometry(0.058, 0.007, 6, 20).rotateX(Math.PI / 2), mBrass, 0, 0, 0);
      p.add(
        core, jar, ring,
        mk(new T.CylinderGeometry(0.048, 0.050, 0.032, 14), mBrass, 0, 0.122, 0),
        mk(new T.CylinderGeometry(0.050, 0.046, 0.032, 14), mBrass, 0, -0.122, 0),
        mk(new T.ConeGeometry(0.028, 0.045, 10), mIndigo, 0, 0.158, 0),
        mk(new T.SphereGeometry(0.015, 8, 6), coreMat, 0, -0.150, 0)
      );
      return { pod: p, ring };
    };
    const pL = mkPod(mNeon, -1);  // Right-side on back: 10 Ne Neon Orange!
    const pR = mkPod(mArgon, 1);  // Left-side on back: 18 Ar Argon Violet!
    this.podL = pL.pod;
    this.podR = pR.pod;
    this.podRingL = pL.ring;
    this.podRingR = pR.ring;
    torsoG.add(pL.pod, pR.pod);
    this.torsoGroup = torsoG;

    this.game.scene.add(headG, torsoG);

    // Restore saved lab outfit preference cleanly
    try {
      const saved = parseInt(localStorage.getItem(GEAR_KEY) || "0", 10);
      if (saved === 1 || saved === 2) this.setTier(saved, true);
    } catch {}

    return this;
  }

  setTier(tier, silent = false) {
    this.tier = Math.max(0, Math.min(2, tier | 0));
    try { localStorage.setItem(GEAR_KEY, String(this.tier)); } catch {}
    if (this.haloGroup) this.haloGroup.visible = this.tier >= 2;
    if (!silent) {
      playElementSynth(this.game.audio, "gear");
      const p = this.game.player.pos;
      if (this.game.puffs) {
        const col = this.tier === 2 ? [1.0, 0.78, 0.32] : [0.35, 0.94, 1.0];
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          this.game.puffs.spawn(
            p.x + Math.cos(a) * 0.35, this.game.player.y - this.game.player.eye + 0.85, p.z + Math.sin(a) * 0.35,
            Math.cos(a) * 1.4, 0.8 + Math.random() * 1.1, Math.sin(a) * 1.4,
            0.07, 0.88, 0.55, col[0], col[1], col[2], 1.2, 1.4
          );
        }
      }
      if (this.tier > 0) this.game.character?.play("cheer");
    }
    return this.tier;
  }

  cycle() {
    const next = (this.tier + 1) % 3;
    this.setTier(next, false);
    const msgs = [
      "👗 已换回日常星光服装，化学装备已经整齐收进储物柜啦喵～",
      "🥼 已穿戴「极其猫化学装备」！霓虹/氩气双色护目镜 + 星光白大褂披肩 + 悬浮双子气体反应罐，安全协议通过喵！",
      "✨ 升级「118 号炼金大师超频模式」！头顶悬浮 1 H · 6 C · 10 Ne · 18 Ar 四元素电子轨道光环，整片雪境最酷的化学家喵！"
    ];
    this.game.ui && this.game.ui.toast(msgs[next], 6.0);
    return next;
  }

  update(dt, time) {
    if (!this.headGroup || !this.torsoGroup) return;
    const g = this.game;
    const ch = g.character;
    const show = this.tier > 0 && ch && ch.ready && ch.root && ch.root.visible && g.player.view === "tp";

    this.headGroup.visible = show;
    this.torsoGroup.visible = show;
    if (!show) return;

    // Track Head bone directly in world space (immune to GLB internal 100x Mixamo cm bone scale!)
    const headBone = ch.bone("Head");
    if (headBone) {
      headBone.getWorldPosition(this._pos);
      headBone.getWorldQuaternion(this._quat);
      this.headGroup.position.copy(this._pos);
      this.headGroup.quaternion.copy(this._quat);
      // Slight scale adaptation if playing Claude vs Gemini (same DT=1.3m height, subtle head size tweak)
      const isGem = g.avatar === "gemini";
      this.headGroup.scale.setScalar(isGem ? 1.0 : 0.90);
    }

    // Track Spine2 (or Spine1 fallback) for collar-mantle & floating twin gas pods
    const spineBone = ch.bone("Spine2") || ch.bone("Spine1") || ch.bone("Spine");
    if (spineBone) {
      spineBone.getWorldPosition(this._pos);
      spineBone.getWorldQuaternion(this._quat);
      this.torsoGroup.position.copy(this._pos);
      this.torsoGroup.quaternion.copy(this._quat);
    }

    // Gentle sci-fi magnetic hover bobbing on the twin 10 Ne / 18 Ar pods (tucked away cleanly when sleeping in CatHome bed!)
    if (this.podL && this.podR) {
      const sleeping = !!(g.cathome && g.cathome.denBed && g.cathome.denBed.riding);
      this.podL.visible = !sleeping;
      this.podR.visible = !sleeping;
      if (!sleeping) {
        this.podL.position.y = 0.075 + Math.sin(time * 3.2) * 0.026;
        this.podR.position.y = 0.075 + Math.sin(time * 3.2 + Math.PI) * 0.026;
        this.podRingL.rotation.z = time * 2.8;
        this.podRingR.rotation.z = -time * 2.8;
      }
    }

    // Tier-2 Orbiting Element Bohr Halo rotation
    if (this.tier >= 2 && this.haloGroup) {
      this.haloGroup.visible = true;
      this.haloGroup.position.y = 0.44 + Math.sin(time * 2.6) * 0.018;
      this.haloRing1.rotation.z = time * 2.2;
      this.haloRing2.rotation.z = -time * 1.7;

      // Subtle trailing lab-master stardust while walking/running!
      if (g.player.speed > 1.2 && g.puffs) {
        this._sparkAcc += dt * 7;
        while (this._sparkAcc >= 1) {
          this._sparkAcc -= 1;
          const isNe = Math.random() < 0.5;
          const p = this.headGroup.position;
          g.puffs.spawn(
            p.x + (Math.random() - 0.5) * 0.4, p.y + 0.25, p.z + (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.5,
            0.045, 0.86, 0.45, isNe ? 1.0 : 0.62, isNe ? 0.42 : 0.46, isNe ? 0.22 : 1.0, 0.4, 1.1
          );
        }
      }
    }
  }
}

// =============================================================================
// 2. SECRET WEAPON: 118 Og · 周期表元素炮 (ChemGun Model + 5-Element Projectile Engine!)
// =============================================================================
export function buildChemGunMesh(T, wrapMat) {
  const plain = (m) => wrapMat(m, { key: "plain" });
  const std = (hex, rough = 0.24, extra = {}) =>
    plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));
  const mk = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.frustumCulled = false;
    return m;
  };

  const mBrass = std(0xf2c868, 0.18, { metalness: 0.90 });
  const mPearl = std(0xf2f7ff, 0.22, { metalness: 0.30, emissive: new T.Color(0.22, 0.36, 0.62), emissiveIntensity: 0.22 });
  const mIndigo = std(0x162042, 0.34, { metalness: 0.48 });
  const mNeon = std(0xff6a3c, 0.12, { emissive: new T.Color(1.0, 0.36, 0.14), emissiveIntensity: 1.35 });
  const mArgon = std(0xa876ff, 0.12, { emissive: new T.Color(0.58, 0.28, 1.0), emissiveIntensity: 1.35 });
  const mGlass = plain(new T.MeshStandardMaterial({
    color: 0xeafaff, roughness: 0.06, metalness: 0.12, transparent: true, opacity: 0.42, depthWrite: false
  }));

  const coreMat = plain(new T.MeshStandardMaterial({
    color: 0x4cf4ff,
    emissive: new T.Color(0x4cf4ff),
    emissiveIntensity: 1.45,
    roughness: 0.10
  }));

  const root = new T.Group();
  root.name = "weapon_chemgun_118og";

  // Ergonomic Grip & Brass Pommel (centered at hand origin 0,0,0; barrel points along +Z!)
  const grip = mk(new T.CylinderGeometry(0.022, 0.026, 0.16, 10), mIndigo, 0, -0.05, -0.01);
  grip.rotation.x = 0.24;
  root.add(
    grip,
    mk(new T.SphereGeometry(0.028, 10, 8), mBrass, 0, -0.125, -0.03),
    mk(new T.TorusGeometry(0.036, 0.008, 6, 16, Math.PI * 1.1).rotateY(Math.PI / 2), mBrass, 0, 0.01, 0.055)
  );

  // Main Starlight-Alchemy Receiver Body
  root.add(
    mk(new T.BoxGeometry(0.088, 0.095, 0.32), mIndigo, 0, 0.065, 0.11),
    mk(new T.BoxGeometry(0.098, 0.032, 0.30), mPearl, 0, 0.115, 0.11),
    mk(new T.BoxGeometry(0.096, 0.022, 0.34), mBrass, 0, 0.022, 0.12),
    // Cute twin cat-ear iron-sight fins on top rear!
    mk(new T.ConeGeometry(0.022, 0.055, 4), mBrass, -0.032, 0.155, -0.01),
    mk(new T.ConeGeometry(0.022, 0.055, 4), mBrass, 0.032, 0.155, -0.01)
  );

  // Twin side micro-vials: Left = 10 Ne (orange-red), Right = 18 Ar (violet-blue)!
  for (const [sx, mat] of [[-0.062, mNeon], [0.062, mArgon]]) {
    root.add(
      mk(new T.CylinderGeometry(0.014, 0.014, 0.17, 10).rotateX(Math.PI / 2), mat, sx, 0.072, 0.10),
      mk(new T.CylinderGeometry(0.020, 0.020, 0.19, 12).rotateX(Math.PI / 2), mGlass, sx, 0.072, 0.10),
      mk(new T.CylinderGeometry(0.022, 0.022, 0.018, 12).rotateX(Math.PI / 2), mBrass, sx, 0.072, 0.00),
      mk(new T.CylinderGeometry(0.022, 0.022, 0.018, 12).rotateX(Math.PI / 2), mBrass, sx, 0.072, 0.20)
    );
  }

  // Central Glowing Element Core Chamber (changes color dynamically to the NEXT loaded element!)
  const coreOrb = mk(new T.OctahedronGeometry(0.044, 0), coreMat, 0, 0.138, 0.14);
  const chamberGlass = mk(new T.SphereGeometry(0.062, 14, 10), mGlass, 0, 0.138, 0.14);
  chamberGlass.renderOrder = 2;
  root.add(coreOrb, chamberGlass);

  // Twin Brass Accelerator Barrel Rails + Spinning Dual-Ring Bohr Atom Muzzle!
  root.add(
    mk(new T.CylinderGeometry(0.014, 0.016, 0.30, 10).rotateX(Math.PI / 2), mBrass, 0, 0.098, 0.35),
    mk(new T.CylinderGeometry(0.014, 0.016, 0.30, 10).rotateX(Math.PI / 2), mBrass, 0, 0.042, 0.35),
    mk(new T.CylinderGeometry(0.032, 0.038, 0.12, 14).rotateX(Math.PI / 2), mPearl, 0, 0.070, 0.31)
  );

  const muzzleSpin = new T.Group();
  muzzleSpin.position.set(0, 0.070, 0.45);
  const ringA = mk(new T.TorusGeometry(0.072, 0.008, 8, 24), coreMat, 0, 0, 0);
  const ringB = mk(new T.TorusGeometry(0.052, 0.007, 8, 22), mBrass, 0, 0, 0);
  ringB.rotation.x = Math.PI * 0.38;
  muzzleSpin.add(
    ringA, ringB,
    mk(new T.OctahedronGeometry(0.028, 0), coreMat, 0, 0, 0),
    mk(new T.SphereGeometry(0.014, 8, 6), mNeon, 0.072, 0, 0),
    mk(new T.SphereGeometry(0.014, 8, 6), mArgon, -0.072, 0, 0)
  );
  root.add(muzzleSpin);

  return { root, coreMat, coreOrb, muzzleSpin, ringA, ringB };
}

export function installChemGun(tools, game, helpers, ymRef) {
  const T = game.THREE;
  const wrapMat = helpers.mat;
  const plain = (m) => wrapMat(m, { key: "plain" });

  const built = buildChemGunMesh(T, wrapMat);
  built.root.visible = false;
  game.scene.add(built.root);

  const item = {
    root: built.root,
    def: CHEM_GUN_DEF,
    claudeDef: CHEM_GUN_DEF,
    geminiDef: CHEM_GUN_DEF,
    coreMat: built.coreMat,
    coreOrb: built.coreOrb,
    muzzleSpin: built.muzzleSpin,
    ringA: built.ringA,
    ringB: built.ringB,
    pic: null,
    claudePic: null,
    geminiPic: null
  };
  tools.items.chemgun = item;
  tools.chemGunUnlocked = false;

  // Projectile, Shockwave Ring, 3D Argon Chain-Lightning Arc & Floating Element Bubble Pools
  const shots = [];
  const rings = [];
  const bubbles = [];
  const arcs = [];

  for (let i = 0; i < 20; i++) {
    const g = new T.Group();
    const mat = plain(new T.MeshStandardMaterial({
      color: 0x4cf4ff, emissive: new T.Color(0x4cf4ff), emissiveIntensity: 1.75, roughness: 0.08
    }));
    const core = new T.Mesh(new T.OctahedronGeometry(0.14, 1), mat);
    const spear = new T.Mesh(new T.CylinderGeometry(0.035, 0.085, 0.85, 8).rotateX(Math.PI / 2), mat);
    spear.position.z = -0.22;
    const halo = new T.Mesh(new T.TorusGeometry(0.24, 0.028, 8, 22), mat);
    g.add(core, spear, halo);
    g.visible = false;
    g.frustumCulled = false;
    game.scene.add(g);
    shots.push({
      on: false, g, orb: core, spear, halo, mat,
      pos: new T.Vector3(), dir: new T.Vector3(),
      el: ELEMENT_SHOTS[0], speed: 46, dist: 0, maxDist: 60, t: 0, trail: 0, free: 0, seen: new Set()
    });
  }

  // 3D Jagged Electric Lightning Arc Pool (for 18 Ar Argon Chain-Lightning!)
  for (let i = 0; i < 8; i++) {
    const posArr = new Float32Array(7 * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(posArr, 3));
    const mat = new T.LineBasicMaterial({ color: 0xd0a8ff, transparent: true, opacity: 0, fog: false });
    const line = new T.Line(geo, mat);
    line.visible = false;
    line.frustumCulled = false;
    line.renderOrder = 7;
    game.scene.add(line);
    arcs.push({ on: false, line, geo, mat, t: 0, dur: 0.24 });
  }

  function spawnLightningArc(p0, p1) {
    const a = arcs.find((x) => !x.on) || arcs[0];
    a.on = true; a.t = 0; a.dur = 0.24;
    const attr = a.geo.attributes.position;
    for (let k = 0; k < 7; k++) {
      const f = k / 6;
      const jit = (k === 0 || k === 6) ? 0 : 0.36;
      attr.setXYZ(
        k,
        p0.x + (p1.x - p0.x) * f + (Math.random() - 0.5) * jit,
        p0.y + (p1.y - p0.y) * f + (Math.random() - 0.5) * jit + Math.sin(f * Math.PI) * 0.22,
        p0.z + (p1.z - p0.z) * f + (Math.random() - 0.5) * jit
      );
    }
    attr.needsUpdate = true;
    a.mat.opacity = 1.0;
    a.line.visible = true;
  }

  const ringGeo = new T.RingGeometry(0.68, 1.0, 28);
  ringGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < 14; i++) {
    const m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({
      color: 0x56f0ff, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, fog: false
    }));
    m.visible = false;
    m.renderOrder = 6;
    m.frustumCulled = false;
    game.scene.add(m);
    rings.push({ on: false, m, t: 0, dur: 0.55, r0: 0.2, r1: 2.2 });
  }

  const bubGeo = new T.SphereGeometry(0.15, 12, 10);
  for (let i = 0; i < 22; i++) {
    const bm = plain(new T.MeshStandardMaterial({
      color: i % 2 ? 0x7ef6ff : 0xff94e6,
      emissive: new T.Color(i % 2 ? 0x26d8ff : 0xff54cc),
      emissiveIntensity: 0.72, roughness: 0.06, metalness: 0.16,
      transparent: true, opacity: 0.60, depthWrite: false
    }));
    const bmMesh = new T.Mesh(bubGeo, bm);
    bmMesh.visible = false;
    bmMesh.renderOrder = 5;
    bmMesh.frustumCulled = false;
    game.scene.add(bmMesh);
    bubbles.push({ on: false, mesh: bmMesh, vx: 0, vy: 0, vz: 0, life: 0, ph: i * 0.9 });
  }

  function spawnRing(x, y, z, r0, r1, dur, hex) {
    const s = rings.find((r) => !r.on) || rings[0];
    s.on = true; s.t = 0; s.dur = dur; s.r0 = r0; s.r1 = r1;
    s.m.position.set(x, y, z);
    s.m.scale.setScalar(r0);
    s.m.material.color.setHex(hex);
    s.m.material.opacity = 0.92;
    s.m.visible = true;
  }

  function spawnBubble(x, y, z, hex) {
    const b = bubbles.find((it) => !it.on) || bubbles[0];
    b.on = true;
    b.mesh.visible = true;
    b.mesh.position.set(x, y, z);
    b.mesh.scale.setScalar(0.55 + Math.random() * 0.85);
    b.mesh.material.color.setHex(hex);
    b.mesh.material.emissive.setHex(hex);
    b.vx = (Math.random() - 0.5) * 1.4;
    b.vy = 0.65 + Math.random() * 0.95;
    b.vz = (Math.random() - 0.5) * 1.4;
    b.life = 2.6 + Math.random() * 1.6;
  }

  let shotCycle = 0;
  let lockedMode = -1; // -1 = Auto-Cycle (1H->6C->10Ne->18Ar->118Og), 0..4 = Locked Element!
  let cool = 0;
  const _fwd = new T.Vector3();
  const _mz = new T.Vector3();
  const _toAim = new T.Vector3();
  const _u = new T.Vector3();
  const _w = new T.Vector3();
  const _tmpP = new T.Vector3();
  const UP = new T.Vector3(0, 1, 0);
  const FWD = new T.Vector3(0, 0, 1);

  function getActiveElement() {
    const idx = lockedMode >= 0 ? lockedMode : (shotCycle % ELEMENT_SHOTS.length);
    return ELEMENT_SHOTS[idx];
  }

  // Sleek Compact Bottom-Right Element Mode Bar (#chemBar) + X / 1-5 Hotkeys!
  let chemBar = document.getElementById("chemBar");
  if (!chemBar) {
    chemBar = document.createElement("div");
    chemBar.id = "chemBar";
    chemBar.innerHTML = `
      <div class="cb-hd"><span>⚗️ 元素弹仓</span><span>按 X 切换 · 右键开镜</span></div>
      <div class="cb-row">
        <button type="button" data-mode="-1" style="--bcol:#7ef6ff" class="on">自动</button>
        <button type="button" data-mode="0" style="--bcol:#4cf4ff">1 H</button>
        <button type="button" data-mode="1" style="--bcol:#ffda5c">6 C</button>
        <button type="button" data-mode="2" style="--bcol:#ff7242">10 Ne</button>
        <button type="button" data-mode="3" style="--bcol:#b482ff">18 Ar</button>
        <button type="button" data-mode="4" style="--bcol:#ff66dc">118 Og</button>
      </div>`;
    (document.getElementById("hud") || document.body).appendChild(chemBar);
    chemBar.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-mode]");
      if (!btn) return;
      ev.stopPropagation();
      setElementMode(parseInt(btn.dataset.mode, 10));
    });
  }

  function syncBarUI() {
    if (!chemBar) return;
    chemBar.querySelectorAll("button[data-mode]").forEach((b) => {
      b.classList.toggle("on", parseInt(b.dataset.mode, 10) === lockedMode);
    });
  }

  function setElementMode(mode, announce = true) {
    lockedMode = mode;
    syncChamberColor();
    syncBarUI();
    playElementSynth(game.audio, "switch", mode + 2);
    if (announce && game.ui) {
      const name = mode < 0 ? "自动五元素循环（第 5 发必出 118 Og 超新星！）" : `${ELEMENT_SHOTS[mode].label}（锁定模式）`;
      game.ui.toast(`⚗️ 元素炮已切换：${name}`, 2.6);
    }
  }

  addEventListener("keydown", (ev) => {
    if (ev.repeat || !game.started || !game.player || !game.player.enabled) return;
    if (game.player.seat || game.player.riding) return;
    if (tools.held !== "chemgun") return;
    if (ev.code === "KeyX") {
      const next = lockedMode >= 4 ? -1 : lockedMode + 1;
      setElementMode(next, true);
    } else if (/^Digit[1-5]$/.test(ev.code)) {
      setElementMode(parseInt(ev.code.slice(5), 10) - 1, true);
    } else if (ev.code === "Digit0") {
      setElementMode(-1, true);
    }
  });

  function syncChamberColor() {
    const nextEl = getActiveElement();
    item.coreMat.color.setHex(nextEl.hex);
    item.coreMat.emissive.setHex(nextEl.hex);
  }
  syncChamberColor();

  tools._getChemSightState = function () {
    const el = getActiveElement();
    const isAuto = lockedMode < 0;
    const step = isAuto ? (shotCycle % ELEMENT_SHOTS.length) : lockedMode;
    const ogReady = el.kind === "og_nova";
    return {
      css: el.css,
      label: isAuto ? `${el.short}` : `🔒${el.short}`,
      chargeFrac: ogReady ? 1.0 : Math.max(0.2, (step + 1) / ELEMENT_SHOTS.length),
      ogReady
    };
  };

  function detonate(s, hitObj = false, hitKind = "", hitRef = null) {
    const p = s.pos;
    const el = s.el;
    const isLab = !!(game.chemlab && game.chemlab.inside);
    const floorY = isLab ? 1500.06 : Math.max(game.world.groundAt(p.x, p.z) + 0.08, p.y - 0.35);
    const camPos = game.camera ? game.camera.position : p;
    const distScale = Math.min(1, 20 / (4 + p.distanceTo(camPos)));
    const gun = tools.gun;

    // 1. Trigger unified target hit logic!
    let hitLabel = "";
    let hitCrit = false;
    if (hitKind === "balloon" && hitRef && !hitRef.got) {
      hitRef.got = true;
      hitRef.pop = 0;
      game.heli.popped++;
      const l = game.heli.popped, c = game.heli.balloons.length;
      game.logic.count("balloons", l, c);
      if (l >= c) { game.logic.complete("balloons"); game.ui.toast("八个礼物气球全被元素炮轰落啦！化学神枪猫！", 6); }
      else game.ui.toast(`元素炮精准击落礼物气球！（${l} / ${c}）`, 3.2);
      hitLabel = "🎈 击落气球";
      hitCrit = true;
    } else if (hitKind === "shootTarget" && hitRef) {
      const res = hitRef.onHit({
        pos: p.clone(),
        dir: s.dir.clone(),
        weapon: "chemgun",
        element: el.id,
        heavy: el.kind === "og_nova" || el.kind === "c_diamond"
      });
      hitLabel = (res && res.label) || `⚗️ ${el.short} 命中`;
      hitCrit = !!(res && res.crit) || el.kind === "og_nova";
    } else if (hitKind === "thing") {
      game.explore && game.explore.ballHit(p);
      hitLabel = hitRef && hitRef.target ? "🎯 靶心命中" : "✦ 命中";
      hitCrit = !!(hitRef && hitRef.target);
    } else if (hitKind === "folk" && hitRef) {
      game.folk && game.folk.hit(hitRef, el.kind === "c_diamond" || el.kind === "og_nova" ? "kick" : "ball", s.dir.x, s.dir.z);
      hitLabel = `⚗️ ${el.short} 命中`;
    } else if (hitKind === "pet") {
      game.pets && game.pets.strike(p.x, p.z, 1.0, "cane", s.dir.x, s.dir.z);
      hitLabel = "✨ 击飞小龙虾";
    } else if (hitKind === "friend" && hitRef) {
      game.friends && game.friends.hopNow(hitRef, 0.55, 0.6);
      if (hitRef.cool <= 0) {
        game.friends.say(hitRef, `哇！是 ${el.id} 号元素光弹，超炫酷的！`, 3.2);
        hitRef.cool = 2.8;
      }
      hitLabel = `✨ ${el.short} 彩蛋`;
    }

    // 2. Unique 18 Ar Argon CHAIN-LIGHTNING ARC to up to 2 nearby targets within 7.5m!
    if (el.kind === "ar_bolt" && !isLab) {
      let chained = 0;
      if (game.shootTargets && game.shootTargets.length) {
        for (const tg of game.shootTargets) {
          if (chained >= 2) break;
          if (tg === hitRef || (tg.alive && !tg.alive())) continue;
          if (p.distanceTo(tg.pos) < 7.5) {
            spawnLightningArc(p, tg.pos);
            tg.onHit({ pos: tg.pos.clone(), dir: s.dir.clone(), weapon: "chemgun", element: "Ar", heavy: true });
            chained++;
          }
        }
      }
      if (chained < 2 && game.folk) {
        for (const fk of game.folk.around(p.x, p.z, 6.5)) {
          if (chained >= 2 || fk === hitRef) continue;
          const m = fk.clawd || fk.snowman;
          if (m) {
            const tp = _tmpP.set(m.x, game.world.groundAt(m.x, m.z) + 0.7, m.z);
            spawnLightningArc(p, tp);
            game.folk.hit(fk, "kick", m.x - p.x, m.z - p.z);
            chained++;
          }
        }
      }
      if (chained > 0) {
        hitLabel = `⚡ 氩雷连锁 ×${chained + 1}`;
        hitCrit = true;
      }
    }

    if (hitLabel && gun && gun.registerHit) {
      gun.registerHit(hitCrit, hitLabel);
    }

    // 3. Visual & Studio DSP Detonation FX by Element!
    if (el.kind === "og_nova") {
      // 118 Og GRAND RAINBOW PERIODIC-TABLE SUPERNOVA!
      spawnRing(p.x, floorY, p.z, 0.35, 5.2, 0.74, 0x4cf4ff);
      spawnRing(p.x, floorY + 0.16, p.z, 0.25, 4.2, 0.66, 0xffd85a);
      spawnRing(p.x, floorY + 0.32, p.z, 0.20, 3.3, 0.58, 0xff62d8);
      const pals = [[0.28, 0.94, 1.0], [1.0, 0.86, 0.34], [1.0, 0.40, 0.22], [0.64, 0.44, 1.0], [1.0, 0.42, 0.88]];
      for (let k = 0; k < 44; k++) {
        const a = Math.random() * Math.PI * 2;
        const elev = (Math.random() - 0.15) * 4.8;
        const sp = 2.0 + Math.random() * 5.0;
        const c = pals[k % pals.length];
        game.puffs.spawn(
          p.x, p.y, p.z,
          Math.cos(a) * sp, 1.4 + elev, Math.sin(a) * sp,
          0.11 + Math.random() * 0.09, 0.90, 0.65 + Math.random() * 0.45,
          c[0], c[1], c[2], 3.4, 1.5
        );
      }
      for (let b = 0; b < 7; b++) {
        spawnBubble(p.x + (Math.random() - 0.5) * 0.9, p.y + 0.15, p.z + (Math.random() - 0.5) * 0.9, ELEMENT_SHOTS[b % 5].hex);
      }
      game.sparks && game.sparks.spawn(p.x, p.y, p.z, 0, 0, 0, 1.3, 0.96, 0.24, 3.8, 2.6, 3.6, 0, 0);
      playElementSynth(game.audio, "og_boom", distScale);

      // AoE trigger for nearby shootable targets & joyful bounce!
      if (!isLab && game.shootTargets) {
        for (const tg of game.shootTargets) {
          if (tg !== hitRef && (!tg.alive || tg.alive()) && p.distanceTo(tg.pos) < 5.2) {
            tg.onHit({ pos: tg.pos.clone(), dir: s.dir.clone(), weapon: "chemgun", element: "Og", heavy: true });
          }
        }
      }
      if (game.friends && game.friends.list) {
        for (const fr of game.friends.list) {
          if (Math.hypot(fr.x - p.x, fr.z - p.z) < 5.2) {
            game.friends.hopNow(fr, 0.58, 0.68);
            if (fr.cool <= 0) {
              game.friends.say(fr, "哇！！118 号 Og 元素超新星烟花太炫啦！！", 3.8);
              fr.cool = 3.5;
            }
          }
        }
      }
      if (!isLab && game.pets) game.pets.shock(p.x, p.z, 4.8);
      if (!isLab && game.folk) {
        for (const fk of game.folk.around(p.x, p.z, 4.6)) {
          const m = fk.clawd || fk.snowman;
          if (m) game.folk.hit(fk, "punch", m.x - p.x, m.z - p.z);
        }
      }
    } else {
      spawnRing(p.x, floorY, p.z, 0.22, el.kind === "c_diamond" ? 2.7 : 2.0, 0.44, el.hex);
      if (el.kind === "ar_bolt") {
        spawnRing(p.x, floorY + 0.14, p.z, 0.16, 2.9, 0.50, 0x52f2ff);
      }
      const cnt = el.kind === "c_diamond" ? 24 : 16;
      for (let k = 0; k < cnt; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.6 + Math.random() * 3.4;
        game.puffs.spawn(
          p.x, p.y, p.z,
          Math.cos(a) * sp, 0.9 + Math.random() * 2.4, Math.sin(a) * sp,
          0.075 + Math.random() * 0.06, 0.88, 0.36 + Math.random() * 0.28,
          el.rgb[0], el.rgb[1], el.rgb[2], 3.8, 1.4
        );
      }
      if (el.kind === "h_triple") {
        spawnBubble(p.x, p.y + 0.1, p.z, 0x52f4ff);
        spawnBubble(p.x + 0.15, p.y + 0.2, p.z - 0.1, 0xff8ce8);
      }
      if (el.kind === "ne_ring") {
        game.cold && (game.cold.w = Math.min(100, game.cold.w + 8));
      }
      game.sparks && game.sparks.spawn(p.x, p.y, p.z, 0, 0, 0, 0.65, 0.95, 0.14, el.rgb[0] * 3.2, el.rgb[1] * 3.2, el.rgb[2] * 3.2, 0, 0);
      if (hitObj) playElementSynth(game.audio, "impact", el.kind);
    }

    s.on = false;
    s.g.visible = false;
  }

  tools._useChemGun = function () {
    if (cool > 0) return true;
    const pl = game.player;
    const ch = game.character;
    const gun = this.gun;
    if (!pl.enabled || !ch) return false;

    const el = getActiveElement();
    const isAuto = lockedMode < 0;
    if (isAuto) shotCycle++;
    const odScale = gun && gun.overdriveT > 0 ? 0.65 : 1.0;
    cool = ((el.kind === "og_nova" && !isAuto) ? 1.15 : el.cool) * odScale;

    this.aimT = 1.25;
    this.aimView = true;
    this.kick = Math.min(1.5, (this.kick || 0) + (el.kind === "og_nova" ? 1.35 : 0.78));
    if (ch.emote) ch.stop(0.08);

    // 1. Compute EXACT 3D barrel muzzle world position!
    item.root.updateMatrixWorld(true);
    if (item.root.visible && (pl.view !== "tp" || this.k > 0.7)) {
      item.muzzleSpin.getWorldPosition(_mz);
    } else {
      const r = pl.yaw;
      const baseY = pl.y - pl.eye + pl.air - pl.wade + 0.92 + Math.sin(pl.pitch) * 0.45;
      _mz.set(pl.pos.x + Math.cos(r) * 0.18 - Math.sin(r) * 0.62, baseY, pl.pos.z - Math.sin(r) * 0.18 - Math.cos(r) * 0.62);
    }

    // 2. Compute EXACT 3D target aim direction via unified gun.sightLine()!
    if (pl.frontLock && ch) {
      const cy = ch.yaw;
      _toAim.set(-Math.sin(cy), 0.04, -Math.cos(cy)).normalize();
    } else if (gun) {
      gun.sightLine();
      game.camera.getWorldDirection(_fwd);
      _toAim.copy(gun.aim).sub(_mz);
      const dist = _toAim.length();
      if (dist < 1.5 || _toAim.dot(_fwd) < dist * 0.25) {
        _toAim.copy(_fwd).normalize();
      } else {
        _toAim.multiplyScalar(1 / dist);
      }
    } else {
      game.camera.getWorldDirection(_toAim).normalize();
    }

    // Slight ADS-tightened accuracy spread
    const spRad = gun ? gun.spread * 0.75 : 0.005;
    if (spRad > 0.001) {
      const ra = Math.random() * Math.PI * 2;
      const rr = Math.tan(spRad) * Math.sqrt(Math.random());
      _u.crossVectors(_toAim, UP);
      if (_u.lengthSq() < 1e-4) _u.set(1, 0, 0);
      _u.normalize();
      _w.crossVectors(_u, _toAim);
      _toAim.addScaledVector(_u, Math.cos(ra) * rr).addScaledVector(_w, Math.sin(ra) * rr).normalize();
    }

    const nShots = el.spread || 1;
    const fanHalf = (gun && gun.ads > 0.5) ? 0.038 : 0.068;
    _u.crossVectors(_toAim, UP);
    if (_u.lengthSq() < 1e-4) _u.set(1, 0, 0);
    _u.normalize();

    for (let k = 0; k < nShots; k++) {
      const slot = shots.find((s) => !s.on) || shots[0];
      const off = nShots > 1 ? (k - 1) * fanHalf : 0;

      slot.on = true;
      slot.t = 0;
      slot.dist = 0;
      slot.trail = 0;
      slot.free = 0;
      slot.seen.clear();
      slot.el = el;
      slot.speed = el.speed * (gun && gun.ads > 0.5 ? 1.12 : 1.0);
      slot.maxDist = el.range;
      slot.pos.copy(_mz);
      slot.dir.copy(_toAim).addScaledVector(_u, off).normalize();
      slot.mat.color.setHex(el.hex);
      slot.mat.emissive.setHex(el.hex);

      // Avoid immediate wall clipping right next to muzzle
      if (gun && !(game.chemlab && game.chemlab.inside)) {
        for (let m = 0.25; m < 1.9; m += 0.25) {
          const h = gun.probe(_tmpP.copy(_mz).addScaledVector(slot.dir, m));
          if (h) { if (h.kind === "wall") slot.free = 2.1; break; }
        }
      }

      const sc = el.kind === "og_nova" ? 1.65 : el.kind === "c_diamond" ? 1.30 : el.kind === "h_triple" ? 0.78 : 1.08;
      slot.g.scale.setScalar(sc);
      slot.spear.visible = el.kind === "c_diamond" || el.kind === "ar_bolt" || el.kind === "h_triple";
      slot.halo.visible = el.kind === "ne_ring" || el.kind === "og_nova" || el.kind === "ar_bolt";
      slot.g.position.copy(slot.pos);
      slot.g.quaternion.setFromUnitVectors(FWD, slot.dir);
      slot.g.visible = true;
    }

    // Crisp Muzzle Flash Burst + Dynamic Light + Spring Camera Recoil + Studio Physical DSP Audio!
    game.sparks && game.sparks.spawn(_mz.x, _mz.y, _mz.z, 0, 0, 0, 0.52, 0.95, 0.11, el.rgb[0] * 3.6, el.rgb[1] * 3.6, el.rgb[2] * 3.6, 0, 0);
    for (let m = 0; m < 6; m++) {
      const sp = 4 + Math.random() * 7;
      game.puffs && game.puffs.spawn(
        _mz.x, _mz.y, _mz.z,
        _toAim.x * sp + (Math.random() - 0.5) * 1.1,
        _toAim.y * sp + (Math.random() - 0.5) * 1.1,
        _toAim.z * sp + (Math.random() - 0.5) * 1.1,
        0.055 + Math.random() * 0.04, 0.72, 0.18, el.rgb[0], el.rgb[1], el.rgb[2], 0.4, 5
      );
    }
    if (gun && gun.kickCamera) {
      const adsDamp = 1 - (gun.ads || 0) * 0.35;
      gun.kickCamera(el.recoil * adsDamp, el.recoil * 0.38 * adsDamp, el.recoil * 1.15, el.hex, _mz);
    }
    playElementSynth(game.audio, el.kind, !!(gun && (gun.ads > 0.5 || gun.overdriveT > 0)));
    syncChamberColor();
    return true;
  };

  tools._updateChemGun = function (dt, time) {
    if (cool > 0) cool = Math.max(0, cool - dt);
    if (this.kick > 0 && this.held === "chemgun") {
      this.kick = Math.max(0, this.kick - dt * 5.2);
    }

    const active = !!(this.gun && this.gun.chemActive);
    if (chemBar) chemBar.classList.toggle("show", active);

    // Animate held 118 Og Element Cannon muzzle & core orb (spins faster when ADS / overdrive!)
    if (this.held === "chemgun" && item.root.visible) {
      const adsBoost = this.gun ? (this.gun.ads || 0) * 6.5 : 0;
      const spinSpd = 2.8 + adsBoost + (this.kick || 0) * 16.0;
      item.muzzleSpin.rotation.z += dt * spinSpd;
      item.ringB.rotation.y += dt * (spinSpd * 0.85);
      item.coreOrb.rotation.y = time * 3.6;
      item.coreOrb.rotation.x = time * 2.1;
      // Rainbow pulse when 118 Og Supernova is chambered next!
      if (getActiveElement().kind === "og_nova") {
        const hue = (time * 0.95) % 1;
        item.coreMat.color.setHSL(hue, 0.95, 0.65);
        item.coreMat.emissive.setHSL(hue, 0.95, 0.55);
      }
    }

    const isLab = !!(game.chemlab && game.chemlab.inside);
    const gun = this.gun;

    // Simulate active high-velocity elemental projectiles with crisp sub-stepped collision!
    for (const s of shots) {
      if (!s.on) continue;
      s.t += dt;
      let left = s.speed * dt;
      let hit = null;

      while (left > 1e-4 && !hit) {
        const seg = Math.min(0.35, left);
        s.pos.addScaledVector(s.dir, seg);
        left -= seg;
        s.dist += seg;
        s.trail += seg;

        if (s.trail > (s.el.kind === "og_nova" ? 0.45 : 0.65)) {
          s.trail = 0;
          const c = s.el.rgb;
          game.puffs && game.puffs.spawn(
            s.pos.x, s.pos.y, s.pos.z,
            (Math.random() - 0.5) * 0.4, 0.15 + Math.random() * 0.3, (Math.random() - 0.5) * 0.4,
            s.el.kind === "og_nova" ? 0.11 : 0.068, 0.84, 0.28, c[0], c[1], c[2], 0.9, 1.8
          );
        }

        if (isLab) {
          if (Math.abs(s.pos.x - 1500) > 7.4 || Math.abs(s.pos.z - 1500) > 6.4 || s.pos.y < 1500.12 || s.pos.y > 1505.2) {
            hit = { kind: "wall", ref: null };
          }
        } else if (gun) {
          const h = gun.probe(s.pos);
          if (h && !(h.kind === "wall" && s.dist < s.free)) {
            hit = h;
          }
        }
      }

      if (hit) {
        if (hit.kind === "tree" || hit.kind === "trunk") {
          if (hit.ref && game.time - (hit.ref.shotT || 0) > 0.5) {
            hit.ref.shotT = game.time;
            game.player.dumpSnow(hit.ref, s.pos.x, s.pos.y + 0.5, s.pos.z, 85);
          }
        }
        detonate(s, true, hit.kind, hit.ref);
        continue;
      }

      if (!isLab && game.player.allowed && !game.player.allowed(s.pos.x, s.pos.z)) {
        detonate(s, false, "", null);
        continue;
      }
      if (s.dist >= s.maxDist) {
        detonate(s, true, "", null);
        continue;
      }

      s.g.position.copy(s.pos);
      s.g.quaternion.setFromUnitVectors(FWD, s.dir);
      s.orb.rotation.z = s.t * 14;
      s.halo.rotation.z = -s.t * 10;
      if (s.el.kind === "og_nova") {
        const hue = (time * 1.9 + s.t * 2.2) % 1;
        s.mat.color.setHSL(hue, 0.95, 0.66);
        s.mat.emissive.setHSL(hue, 0.95, 0.56);
      }
    }

    // Fade 3D Argon Chain-Lightning Arcs
    for (const a of arcs) {
      if (!a.on) continue;
      a.t += dt;
      if (a.t >= a.dur) { a.on = false; a.line.visible = false; continue; }
      a.mat.opacity = 1 - a.t / a.dur;
    }

    // Expand shockwave rings
    for (const r of rings) {
      if (!r.on) continue;
      r.t += dt;
      const u = r.t / r.dur;
      if (u >= 1) { r.on = false; r.m.visible = false; continue; }
      const ease = 1 - (1 - u) * (1 - u);
      r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * ease);
      r.m.material.opacity = 0.92 * (1 - u);
    }

    // Float soap/element bubbles
    for (const b of bubbles) {
      if (!b.on) continue;
      b.life -= dt;
      if (b.life <= 0) { b.on = false; b.mesh.visible = false; continue; }
      b.mesh.position.x += (b.vx + Math.sin(time * 2.5 + b.ph) * 0.25) * dt;
      b.mesh.position.y += b.vy * dt;
      b.mesh.position.z += (b.vz + Math.cos(time * 2.1 + b.ph) * 0.25) * dt;
      b.mesh.material.opacity = Math.min(0.64, b.life * 0.35);
    }
  };

  // Capture crisp 3D thumbnail for the secret toolbar button
  function captureThumb() {
    if (item.pic) return item.pic;
    const thumbs = game.pets && game.pets.thumbs;
    if (!thumbs || !thumbs.ok) return null;
    const wasIn = item.root.parent;
    const wasVis = item.root.visible;
    const pPos = item.root.position.clone();
    const pRot = item.root.rotation.clone();
    const pScl = item.root.scale.clone();
    wasIn && wasIn.remove(item.root);
    item.root.position.set(0, 0, 0);
    item.root.scale.set(1, 1, 1);
    item.root.rotation.set(-0.18, -0.82, 0.08);
    item.root.visible = true;
    const pic = thumbs.shot(item.root, { from: [0.76, 0.30, 0.82], look: [0, 0.08, 0.16], px: 120 });
    item.root.position.copy(pPos);
    item.root.rotation.copy(pRot);
    item.root.scale.copy(pScl);
    item.root.visible = wasVis;
    wasIn ? wasIn.add(item.root) : game.scene.add(item.root);
    item.pic = item.claudePic = item.geminiPic = pic;
    return pic;
  }

  tools.unlockChemGun = function (autoEquip = true, silent = false) {
    tools.chemGunUnlocked = true;
    try { localStorage.setItem(GUN_KEY, "1"); } catch {}

    // Ensure chemgun is in the cycling tool list `ym`
    if (ymRef && !ymRef.some((d) => d.id === "chemgun")) {
      ymRef.push(CHEM_GUN_DEF);
    }

    const pic = captureThumb();

    // Inject the shimmering secret toolbar button right before #btnPets!
    if (tools.bar && !tools.bar.querySelector('[data-tool="chemgun"]')) {
      const btn = document.createElement("button");
      btn.dataset.tool = "chemgun";
      btn.className = "secret-tool";
      btn.title = `${CHEM_GUN_DEF.name}：${CHEM_GUN_DEF.tip}`;
      btn.innerHTML = pic ? `<img src="${pic}" alt="${CHEM_GUN_DEF.name}">` : `<u>Og</u>`;
      btn.onclick = () => {
        btn.blur();
        game.player.enabled && tools.equip("chemgun");
      };
      const petsBtn = document.getElementById("btnPets");
      if (petsBtn && petsBtn.parentElement === tools.bar) {
        tools.bar.insertBefore(btn, petsBtn);
      } else {
        tools.bar.appendChild(btn);
      }
    }

    if (autoEquip && tools.usable) {
      tools.equip("chemgun");
    } else {
      tools.syncBar();
    }

    if (!silent) {
      playElementSynth(game.audio, "og_boom");
    }
    return true;
  };

  // Pre-capture 3D studio thumbnail right at init so tools.shotPics() NEVER touches an untyped entry when switching avatars!
  captureThumb();

  // Restore previously unlocked secret weapon on page reload (after thumbnails are ready)
  try {
    if (localStorage.getItem(GUN_KEY) === "1") {
      tools.unlockChemGun(false, true);
    }
  } catch {}

  return item;
}
