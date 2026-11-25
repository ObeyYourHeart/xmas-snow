// 极其猫化学装备 (LabGear) + 隐藏神秘武器「118 Og · 周期表元素炮」 (ChemGun)
// - LabGear: Bone-tracked 3D Forehead Neon/Argon Safety Goggles, Starlight White Alchemist Lab Mantle & Pin,
//   Twin Floating Magnetic 10 Ne / 18 Ar Plasma Canister Pods (0% hair clipping!), and Tier-2 Orbiting Element Halo!
// - ChemGun: Unlocked inside the Indoor Chemistry Lab after charging 1 H / 6 C / 10 Ne / 18 Ar & opening the 118 Og Vault!
//   Cycles 5 authentic Gemini 4 elements on every shot: 1 H (Triple Bubble Bolts) -> 6 C (Diamond Prism) ->
//   10 Ne (Neon Flame Orb) -> 18 Ar (Electric Violet Arc) -> 118 Og (Rainbow Oganesson Periodic-Table Supernova!).

export const CHEM_GUN_DEF = {
  id: "chemgun",
  name: "118 Og 星芒猫耳枪",
  verb: "星芒发射",
  tip: "星芒猫耳魔法元素枪！平时走路自然垂手持枪，左键/J 开火或右键/F 开镜即刻举枪瞄准，按 X 或 1~5 切五元素！",
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
// 2. SECRET WEAPON: 极其猫 · 118 Og 星芒猫耳枪 (Sleek Anime Starlight Cat-Ear & Stars Element Gun!)
// =============================================================================
export function buildChemGunMesh(T, wrapMat) {
  const plain = (m) => wrapMat(m, { key: "plain" });
  const std = (hex, rough = 0.22, extra = {}) =>
    plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));
  const mk = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.frustumCulled = false;
    return m;
  };

  // Dreamy Starlight Cat-Ear & Stars Palette (Pearl White × Champagne Gold × Star Indigo × Sakura Pink × Lavender!)
  const mPearl = std(0xfbfcff, 0.18, { metalness: 0.18, emissive: new T.Color(0.20, 0.26, 0.44), emissiveIntensity: 0.22 });
  const mIndigo = std(0x182048, 0.28, { metalness: 0.48, emissive: new T.Color(0.06, 0.08, 0.22), emissiveIntensity: 0.15 });
  const mLavender = std(0x7c8aff, 0.20, { metalness: 0.28, emissive: new T.Color(0.26, 0.32, 0.78), emissiveIntensity: 0.38 });
  const mGold = std(0xfad672, 0.14, { metalness: 0.92 });
  const mRoseGold = std(0xf4a6c2, 0.18, { metalness: 0.84 });
  const mSakura = std(0xff78ce, 0.18, { emissive: new T.Color(0.95, 0.30, 0.72), emissiveIntensity: 0.62 });
  const mCyan = std(0x4cf4ff, 0.10, { emissive: new T.Color(0.24, 0.92, 1.0), emissiveIntensity: 1.55 });
  const mGoldGlow = std(0xffe066, 0.10, { emissive: new T.Color(1.0, 0.78, 0.22), emissiveIntensity: 1.55 });
  const mNeon = std(0xff6a3c, 0.10, { emissive: new T.Color(1.0, 0.36, 0.14), emissiveIntensity: 1.55 });
  const mArgon = std(0xae7cff, 0.10, { emissive: new T.Color(0.62, 0.32, 1.0), emissiveIntensity: 1.55 });
  const mOg = std(0xff64dc, 0.10, { emissive: new T.Color(1.0, 0.34, 0.84), emissiveIntensity: 1.55 });
  const mGlass = plain(new T.MeshStandardMaterial({
    color: 0xeafaff, roughness: 0.05, metalness: 0.12, transparent: true, opacity: 0.30, depthWrite: false
  }));
  const mSakuraGlass = plain(new T.MeshStandardMaterial({
    color: 0xff8ad8, emissive: new T.Color(0.96, 0.34, 0.76), emissiveIntensity: 0.75,
    roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.86
  }));

  const coreMat = plain(new T.MeshStandardMaterial({
    color: 0x4cf4ff,
    emissive: new T.Color(0x4cf4ff),
    emissiveIntensity: 1.70,
    roughness: 0.08
  }));

  // Sculpted 3D 4-Point Gemini Star (✦) & 5-Point Cute Shooting Star (★) builders!
  const mkStar4Geo = (rx, ry = rx, inner = 0.30, depth = 0.010) => {
    const s = new T.Shape();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const px = Math.cos(a) * (i % 2 ? rx * inner : rx);
      const py = Math.sin(a) * (i % 2 ? ry * inner : ry);
      i === 0 ? s.moveTo(px, py) : s.lineTo(px, py);
    }
    s.closePath();
    const g = new T.ExtrudeGeometry(s, {
      depth: depth * 0.5, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: Math.min(rx, ry) * 0.07, bevelSegments: 1
    });
    g.translate(0, 0, -depth * 0.25);
    return g;
  };
  const mkStar5Geo = (r, inner = 0.44, depth = 0.010) => {
    const s = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 + Math.PI / 2;
      const rad = i % 2 ? r * inner : r;
      const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
      i === 0 ? s.moveTo(px, py) : s.lineTo(px, py);
    }
    s.closePath();
    const g = new T.ExtrudeGeometry(s, {
      depth: depth * 0.5, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: r * 0.07, bevelSegments: 1
    });
    g.translate(0, 0, -depth * 0.25);
    return g;
  };

  const star4BigGeo = mkStar4Geo(0.036, 0.044, 0.28, 0.014);
  const star4MidGeo = mkStar4Geo(0.022, 0.026, 0.30, 0.008);
  const star4MiniGeo = mkStar4Geo(0.015, 0.018, 0.32, 0.007);
  const star5MidGeo = mkStar5Geo(0.026, 0.45, 0.010);
  const star5SmGeo = mkStar5Geo(0.017, 0.45, 0.008);

  const root = new T.Group();
  root.name = "weapon_chemgun_118og";

  // =========================================================================
  // 1. SLEEK ERGONOMIC PISTOL GRIP + GOLDEN CRESCENT-STAR STOCK (origin 0,0,0 sits squarely in right palm!)
  // =========================================================================
  const grip = mk(new T.CylinderGeometry(0.018, 0.023, 0.135, 12), mIndigo, 0, -0.045, -0.006);
  grip.rotation.x = 0.25;
  const foreGrip = mk(new T.CylinderGeometry(0.015, 0.018, 0.082, 10), mIndigo, 0, -0.012, 0.235);
  foreGrip.rotation.x = -0.32;

  // Sweeping contoured starlight stock curving back into a gleaming Golden Crescent Moon + Floating Star!
  const stockShape = new T.Shape();
  stockShape.moveTo(0.01, 0.085);
  stockShape.lineTo(-0.15, 0.092);
  stockShape.quadraticCurveTo(-0.21, 0.072, -0.20, 0.012);
  stockShape.lineTo(-0.165, 0.015);
  stockShape.quadraticCurveTo(-0.10, 0.042, -0.01, 0.026);
  stockShape.closePath();
  const stockGeo = new T.ExtrudeGeometry(stockShape, {
    depth: 0.032, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.006, bevelSegments: 1, curveSegments: 6
  });
  stockGeo.translate(0, 0, -0.016);
  stockGeo.rotateY(-Math.PI / 2);

  // Gleaming Golden Crescent Moon at the tail of the stock cradling a glowing 5-point Star!
  const stockMoon = mk(new T.TorusGeometry(0.056, 0.009, 10, 26, Math.PI * 1.25).rotateY(Math.PI / 2), mGold, 0, 0.058, -0.195);
  stockMoon.rotation.x = Math.PI * 0.38;
  const stockStar = mk(star5MidGeo, mSakura, 0, 0.062, -0.228);
  stockStar.rotation.y = Math.PI / 2;

  root.add(
    grip,
    mk(new T.TorusGeometry(0.022, 0.0045, 6, 18).rotateX(Math.PI / 2), mGold, 0, -0.010, 0.003),
    // Golden 5-point Star Pommel at the base of the grip!
    (() => { const p = mk(star5SmGeo, mGold, 0, -0.114, -0.024); p.rotation.y = Math.PI / 2; return p; })(),
    // Curved golden trigger guard & sakura trigger
    mk(new T.TorusGeometry(0.029, 0.0055, 8, 16, Math.PI * 1.15).rotateY(Math.PI / 2), mGold, 0, 0.007, 0.042),
    mk(new T.BoxGeometry(0.008, 0.025, 0.010), mSakura, 0, 0.015, 0.040),
    mk(stockGeo, mPearl, 0, 0, 0),
    mk(new T.BoxGeometry(0.048, 0.014, 0.14), mLavender, 0, 0.072, -0.088),
    stockMoon,
    stockStar,
    foreGrip,
    mk(new T.OctahedronGeometry(0.017, 0), mGoldGlow, 0, -0.048, 0.220)
  );

  // =========================================================================
  // 2. SLEEK CURVED STARLIGHT-PEARL RECEIVER + 5-ELEMENT CRYSTAL CORE CHAMBER!
  // =========================================================================
  const bodyShape = new T.Shape();
  bodyShape.moveTo(-0.03, 0.022);
  bodyShape.lineTo(0.28, 0.028);
  bodyShape.quadraticCurveTo(0.35, 0.050, 0.34, 0.112);
  bodyShape.quadraticCurveTo(0.26, 0.132, 0.14, 0.130);
  bodyShape.lineTo(-0.02, 0.118);
  bodyShape.quadraticCurveTo(-0.06, 0.082, -0.03, 0.022);
  bodyShape.closePath();
  const bodyGeo = new T.ExtrudeGeometry(bodyShape, {
    depth: 0.050, bevelEnabled: true, bevelThickness: 0.010, bevelSize: 0.009, bevelSegments: 1, curveSegments: 6
  });
  bodyGeo.translate(0, 0, -0.025);
  bodyGeo.rotateY(-Math.PI / 2);

  root.add(
    mk(bodyGeo, mPearl, 0, 0, 0),
    // Midnight-indigo underbelly chassis & champagne-gold lower accent rail
    mk(new T.BoxGeometry(0.054, 0.028, 0.32), mIndigo, 0, 0.034, 0.135),
    mk(new T.BoxGeometry(0.042, 0.012, 0.34), mGold, 0, 0.019, 0.145),
    // Iridescent lavender side trim & rose-gold sweeping accent fillets!
    mk(new T.BoxGeometry(0.074, 0.014, 0.24), mLavender, 0, 0.098, 0.095),
    mk(new T.BoxGeometry(0.072, 0.008, 0.26), mGold, 0, 0.056, 0.110)
  );

  // Embossed Golden 4-Point Stars & Glowing Lavender Gems on BOTH flanks of the receiver!
  for (const side of [-1, 1]) {
    const flankStarA = mk(star4MidGeo, mGold, side * 0.038, 0.084, 0.015);
    flankStarA.rotation.y = Math.PI / 2;
    const flankStarB = mk(star4MiniGeo, mSakura, side * 0.040, 0.084, 0.015);
    flankStarB.rotation.y = Math.PI / 2;
    const flankStarC = mk(star4MiniGeo, mGoldGlow, side * 0.038, 0.098, 0.275);
    flankStarC.rotation.y = Math.PI / 2;
    root.add(flankStarA, flankStarB, flankStarC);
  }

  // Visible Revolving 5-Element Alchemy Crystal Drum Chamber nestled right in the receiver waist!
  const drumWrap = new T.Group();
  drumWrap.position.set(0, 0.088, 0.155);
  const drumSpin = new T.Group();
  const vialMats = [mCyan, mGoldGlow, mNeon, mArgon, mOg];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const vx = Math.sin(a) * 0.038;
    const vy = Math.cos(a) * 0.038;
    drumSpin.add(
      mk(new T.CylinderGeometry(0.0115, 0.0115, 0.116, 10).rotateX(Math.PI / 2), vialMats[i], vx, vy, 0),
      mk(new T.CylinderGeometry(0.015, 0.015, 0.014, 10).rotateX(Math.PI / 2), mGold, vx, vy, -0.058),
      mk(new T.CylinderGeometry(0.015, 0.015, 0.014, 10).rotateX(Math.PI / 2), mGold, vx, vy, 0.058)
    );
  }
  drumSpin.add(
    mk(new T.CylinderGeometry(0.018, 0.018, 0.130, 12).rotateX(Math.PI / 2), mGold, 0, 0, 0),
    mk(new T.TorusGeometry(0.056, 0.007, 8, 24), mGold, 0, 0, -0.062),
    mk(new T.TorusGeometry(0.056, 0.007, 8, 24), mGold, 0, 0, 0.062)
  );
  const drumGlass = mk(new T.CylinderGeometry(0.058, 0.058, 0.122, 20).rotateX(Math.PI / 2), mGlass, 0, 0, 0);
  drumGlass.renderOrder = 2;
  drumWrap.add(drumSpin, drumGlass);
  root.add(drumWrap);

  // Cute Swaying Sakura Ribbon Bow + Dangling Golden 5-Point Star Charm beneath the front receiver!
  const bell = new T.Group();
  bell.position.set(0, 0.022, 0.140);
  const bowL = mk(new T.SphereGeometry(0.018, 10, 8), mSakura, -0.018, 0, 0);
  bowL.scale.set(1.25, 0.65, 0.45); bowL.rotation.z = 0.25;
  const bowR = mk(new T.SphereGeometry(0.018, 10, 8), mSakura, 0.018, 0, 0);
  bowR.scale.set(1.25, 0.65, 0.45); bowR.rotation.z = -0.25;
  const charmStar = mk(star5SmGeo, mGoldGlow, 0, -0.036, 0);
  bell.add(
    bowL, bowR,
    mk(new T.SphereGeometry(0.009, 8, 6), mGold, 0, 0, 0.004),
    mk(new T.CylinderGeometry(0.0024, 0.0024, 0.026, 6), mGold, 0, -0.016, 0),
    charmStar
  );
  root.add(bell);

  // =========================================================================
  // 3. HERO CROWN: GRACEFUL SCULPTED CAT EARS + FLOATING 4-POINT STAR HALO!
  //    (Stylish anime armor-crystal cat ears + glowing starlight crest — iconic from EVERY angle!)
  // =========================================================================
  const crownG = new T.Group();
  crownG.position.set(0, 0.128, 0.110);

  // Sleek arched golden tiara bridge mounting both cat ears onto the top rail
  crownG.add(
    mk(new T.BoxGeometry(0.072, 0.014, 0.115), mIndigo, 0, 0.004, 0),
    mk(new T.BoxGeometry(0.078, 0.008, 0.120), mGold, 0, 0.011, 0)
  );

  // Sculpted elegant curved anime cat-ear armor silhouette (wide base, sleek point, lush bevel!)
  const earOuterShape = new T.Shape();
  earOuterShape.moveTo(-0.048, 0);
  earOuterShape.quadraticCurveTo(-0.046, 0.062, -0.006, 0.118);
  earOuterShape.quadraticCurveTo(0, 0.126, 0.006, 0.118);
  earOuterShape.quadraticCurveTo(0.046, 0.062, 0.048, 0);
  earOuterShape.closePath();
  const earOuterGeo = new T.ExtrudeGeometry(earOuterShape, {
    depth: 0.020, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 1, curveSegments: 6
  });
  earOuterGeo.translate(0, 0, -0.010);

  const earInnerShape = new T.Shape();
  earInnerShape.moveTo(-0.030, 0.014);
  earInnerShape.quadraticCurveTo(-0.028, 0.056, 0, 0.094);
  earInnerShape.quadraticCurveTo(0.028, 0.056, 0.030, 0.014);
  earInnerShape.closePath();
  const earInnerGeo = new T.ExtrudeGeometry(earInnerShape, {
    depth: 0.009, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 1, curveSegments: 6
  });
  earInnerGeo.translate(0, 0, -0.0045);

  const buildStarCatEar = (side) => {
    const eg = new T.Group();
    eg.position.set(side * 0.048, 0.012, 0.008);
    eg.rotation.set(0.06, side * 0.12, -side * 0.34);
    // Pearl-white beveled outer cat ear + luminous sakura-crystal inner ear glowing on BOTH front & back!
    eg.add(
      mk(earOuterGeo, mPearl),
      mk(earInnerGeo, mSakuraGlass, 0, 0.002, 0.012),
      mk(earInnerGeo, mSakuraGlass, 0, 0.002, -0.012),
      // Sleek champagne-gold accent band at the ear base
      mk(new T.BoxGeometry(0.098, 0.011, 0.032), mGold, 0, 0.006, 0)
    );
    // Cute golden star-cuff & glowing 5-point star stud clipped onto the outer rim of the left ear!
    if (side > 0) {
      const cuff = mk(new T.TorusGeometry(0.016, 0.0045, 8, 18).rotateY(Math.PI / 2), mGold, 0.038, 0.052, 0);
      cuff.rotation.z = 0.35;
      const earStar = mk(star5SmGeo, mGoldGlow, 0.052, 0.032, 0.004);
      eg.add(cuff, earStar);
    } else {
      // Subtle cyan mini-star gem accent on the right ear for asymmetrical starlight elegance!
      const miniGem = mk(star4MiniGeo, mCyan, -0.034, 0.056, 0.014);
      eg.add(miniGem);
    }
    return eg;
  };
  const earL = buildStarCatEar(-1);
  const earR = buildStarCatEar(1);
  crownG.add(earL, earR);

  // Floating Radiant 4-Point Gemini Star (coreOrb) + Golden Crescent Halo hovering right between the Cat Ears!
  const haloMoon = mk(new T.TorusGeometry(0.034, 0.0055, 8, 24, Math.PI * 1.30), mGold, 0, 0.068, 0.008);
  haloMoon.rotation.z = Math.PI * 0.85;
  const coreOrb = mk(star4BigGeo, coreMat, 0, 0.072, 0.008);
  crownG.add(haloMoon, coreOrb);
  root.add(crownG);

  // =========================================================================
  // 4. FLOATING TWIN-WING STARLIGHT BARREL + ORBITING 4-POINT STAR HALO MUZZLE!
  // =========================================================================
  // Swept magical-girl wing-blades framing the glowing central elemental plasma crystal beam!
  const upperWingShape = new T.Shape();
  upperWingShape.moveTo(0, 0.018);
  upperWingShape.lineTo(0.22, 0.014);
  upperWingShape.quadraticCurveTo(0.26, 0.022, 0.23, 0.042);
  upperWingShape.lineTo(0.03, 0.048);
  upperWingShape.closePath();
  const upperWingGeo = new T.ExtrudeGeometry(upperWingShape, {
    depth: 0.024, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004, bevelSegments: 1, curveSegments: 6
  });
  upperWingGeo.translate(0, 0, -0.012);
  upperWingGeo.rotateY(-Math.PI / 2);

  const lowerWingShape = new T.Shape();
  lowerWingShape.moveTo(0, -0.016);
  lowerWingShape.lineTo(0.20, -0.012);
  lowerWingShape.quadraticCurveTo(0.23, -0.022, 0.19, -0.038);
  lowerWingShape.lineTo(0.02, -0.040);
  lowerWingShape.closePath();
  const lowerWingGeo = new T.ExtrudeGeometry(lowerWingShape, {
    depth: 0.022, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004, bevelSegments: 1, curveSegments: 6
  });
  lowerWingGeo.translate(0, 0, -0.011);
  lowerWingGeo.rotateY(-Math.PI / 2);

  root.add(
    // Glowing translucent elemental plasma conduit beam running down the open twin-wing barrel!
    mk(new T.CylinderGeometry(0.016, 0.019, 0.25, 14).rotateX(Math.PI / 2), coreMat, 0, 0.088, 0.375),
    mk(new T.CylinderGeometry(0.026, 0.030, 0.21, 16).rotateX(Math.PI / 2), mGlass, 0, 0.088, 0.370),
    // Sculpted upper & lower pearl-white starlight wing-blades
    mk(upperWingGeo, mPearl, 0, 0.096, 0.265),
    mk(lowerWingGeo, mPearl, 0, 0.080, 0.265),
    // Champagne-gold twin side rail rods & glowing lavender barrel collar
    mk(new T.CylinderGeometry(0.0065, 0.0075, 0.23, 8).rotateX(Math.PI / 2), mGold, -0.034, 0.088, 0.375),
    mk(new T.CylinderGeometry(0.0065, 0.0075, 0.23, 8).rotateX(Math.PI / 2), mGold, 0.034, 0.088, 0.375),
    mk(new T.TorusGeometry(0.042, 0.007, 8, 24), mRoseGold, 0, 0.088, 0.310),
    mk(new T.TorusGeometry(0.038, 0.006, 8, 24), mGold, 0, 0.088, 0.445)
  );
  // Graduated Golden 4-Point Stars embossed along BOTH barrel sides!
  for (const side of [-1, 1]) {
    const bs1 = mk(star4MidGeo, mGold, side * 0.040, 0.088, 0.345); bs1.rotation.y = Math.PI / 2;
    const bs2 = mk(star4MiniGeo, mCyan, side * 0.040, 0.088, 0.415); bs2.rotation.y = Math.PI / 2;
    root.add(bs1, bs2);
  }

  // Spinning Dual-Gyro Starlight Halo Muzzle at z = 0.520, y = 0.088 with 4 Orbiting 3D Stars!
  const muzzleSpin = new T.Group();
  muzzleSpin.position.set(0, 0.088, 0.520);
  const ringA = mk(new T.TorusGeometry(0.068, 0.0062, 8, 30), coreMat, 0, 0, 0);
  const ringB = mk(new T.TorusGeometry(0.048, 0.0055, 8, 24), mGold, 0, 0, 0);
  ringB.rotation.x = Math.PI * 0.38;
  muzzleSpin.add(
    ringA, ringB,
    mk(star4MidGeo, coreMat, 0, 0, 0),
    mk(star4MiniGeo, mCyan, 0.068, 0, 0),
    mk(star4MiniGeo, mSakura, -0.068, 0, 0),
    mk(star4MiniGeo, mGoldGlow, 0, 0.068, 0),
    mk(star4MiniGeo, mArgon, 0, -0.068, 0)
  );
  root.add(muzzleSpin);

  return { root, coreMat, coreOrb, drumSpin, muzzleSpin, ringA, ringB, catTail: stockStar, earL, earR, bell };
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
    drumSpin: built.drumSpin,
    muzzleSpin: built.muzzleSpin,
    ringA: built.ringA,
    ringB: built.ringB,
    catTail: built.catTail,
    earL: built.earL,
    earR: built.earR,
    bell: built.bell,
    pic: null,
    claudePic: null,
    geminiPic: null
  };
  tools.items.chemgun = item;
  tools.chemGunUnlocked = false;

  // 5 BESPOKE HANDCRAFTED 3D ELEMENT PROJECTILE RIGS + VOLUMETRIC 3D LIGHTNING + SUPERNOVA SPHERE POOL!
  const shots = [];
  const rings = [];
  const bubbles = [];
  const arcs = [];
  const novas = [];

  const whiteCoreMat = plain(new T.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  const hShellMat = plain(new T.MeshStandardMaterial({
    color: 0x7ef8ff, emissive: new T.Color(0x22d8ff), emissiveIntensity: 0.9,
    roughness: 0.05, metalness: 0.14, transparent: true, opacity: 0.56, depthWrite: false
  }));
  const hTailMat = plain(new T.MeshBasicMaterial({ color: 0x52f4ff, transparent: true, opacity: 0.52, depthWrite: false, fog: false }));
  const cCrystalMat = plain(new T.MeshStandardMaterial({
    color: 0xfff0a8, emissive: new T.Color(0xffc838), emissiveIntensity: 1.55,
    roughness: 0.08, metalness: 0.45, transparent: true, opacity: 0.88
  }));
  const cFinMat = plain(new T.MeshBasicMaterial({ color: 0xffe478, transparent: true, opacity: 0.65, side: T.DoubleSide, depthWrite: false, fog: false }));
  const neRingMat = plain(new T.MeshStandardMaterial({
    color: 0xff8244, emissive: new T.Color(0xff4c18), emissiveIntensity: 1.85, roughness: 0.12
  }));
  const neBladeMat = plain(new T.MeshBasicMaterial({ color: 0xffc662, transparent: true, opacity: 0.78, side: T.DoubleSide, depthWrite: false, fog: false }));
  const arCoreMat = plain(new T.MeshBasicMaterial({ color: 0xf4eaff, fog: false }));
  const arCoilMat = plain(new T.MeshStandardMaterial({
    color: 0xb682ff, emissive: new T.Color(0x7c44ff), emissiveIntensity: 2.0, roughness: 0.08
  }));
  const arCyanMat = plain(new T.MeshBasicMaterial({ color: 0x62f4ff, transparent: true, opacity: 0.78, depthWrite: false, fog: false }));

  const geoTailCone = new T.ConeGeometry(0.11, 1.35, 10).rotateX(-Math.PI / 2);
  const geoDiamondTip = new T.ConeGeometry(0.11, 0.46, 4).rotateX(Math.PI / 2);
  const geoDiamondBack = new T.ConeGeometry(0.11, 0.92, 4).rotateX(-Math.PI / 2);
  const geoBlade = new T.PlaneGeometry(0.18, 0.34);

  function buildShotRigs() {
    const g = new T.Group();

    // (1) 1 H: Luminous Star-Pearl Plasma Bubble + Orbiting Electrons + Silky Cyan Comet Tail!
    const rigH = new T.Group();
    const hOrbit = new T.Group();
    hOrbit.add(
      new T.Mesh(new T.TorusGeometry(0.18, 0.012, 6, 20), hTailMat),
      (() => { const m = new T.Mesh(new T.SphereGeometry(0.032, 8, 6), whiteCoreMat); m.position.set(0.18, 0, 0); return m; })(),
      (() => { const m = new T.Mesh(new T.SphereGeometry(0.032, 8, 6), whiteCoreMat); m.position.set(-0.18, 0, 0); return m; })()
    );
    const hTail = new T.Mesh(geoTailCone, hTailMat);
    hTail.position.z = -0.68;
    rigH.add(
      new T.Mesh(new T.SphereGeometry(0.082, 12, 10), whiteCoreMat),
      new T.Mesh(new T.SphereGeometry(0.145, 14, 12), hShellMat),
      hOrbit, hTail
    );

    // (2) 6 C: Faceted Golden Diamond Crystal Lance + Swept Crystal Wings + Prism Halo!
    const rigC = new T.Group();
    const cTip = new T.Mesh(geoDiamondTip, cCrystalMat); cTip.position.z = 0.24;
    const cBack = new T.Mesh(geoDiamondBack, cCrystalMat); cBack.position.z = -0.45;
    const cCore = new T.Mesh(new T.OctahedronGeometry(0.09, 0), whiteCoreMat);
    const cHalo = new T.Mesh(new T.TorusGeometry(0.19, 0.018, 4, 4), cFinMat); cHalo.position.z = -0.14;
    rigC.add(cTip, cBack, cCore, cHalo);
    for (let k = 0; k < 4; k++) {
      const fin = new T.Mesh(geoBlade, cFinMat);
      const a = (k / 4) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, -0.28);
      fin.rotation.set(Math.PI / 2, a, 0);
      rigC.add(fin);
    }

    // (3) 10 Ne: Counter-Rotating Fiery Neon-Coral Plasma Chakram + Swept Flame Petals!
    const rigNe = new T.Group();
    const neSpin = new T.Group();
    neSpin.add(
      new T.Mesh(new T.TorusGeometry(0.28, 0.042, 10, 26), neRingMat),
      new T.Mesh(new T.TorusGeometry(0.18, 0.022, 8, 22).rotateY(Math.PI / 2), neBladeMat)
    );
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const pet = new T.Mesh(geoBlade, neBladeMat);
      pet.position.set(Math.cos(a) * 0.30, Math.sin(a) * 0.30, 0);
      pet.rotation.z = a + 0.5;
      neSpin.add(pet);
    }
    const neTail = new T.Mesh(geoTailCone, neBladeMat); neTail.scale.set(1.3, 1.3, 1.1); neTail.position.z = -0.72;
    rigNe.add(new T.Mesh(new T.SphereGeometry(0.11, 12, 10), whiteCoreMat), neSpin, neTail);

    // (4) 18 Ar: Sleek Violet-Cyan Electromagnetic Rail-Bolt + Crackling Helical Energy Coils!
    const rigAr = new T.Group();
    const arNeedle = new T.Mesh(new T.CylinderGeometry(0.032, 0.065, 1.55, 10).rotateX(Math.PI / 2), arCoreMat);
    arNeedle.position.z = -0.35;
    const arCoilA = new T.Mesh(new T.TorusGeometry(0.15, 0.022, 6, 18), arCoilMat); arCoilA.rotation.x = 0.55;
    const arCoilB = new T.Mesh(new T.TorusGeometry(0.19, 0.016, 6, 18), arCyanMat); arCoilB.rotation.y = 0.55; arCoilB.position.z = -0.25;
    const arCoilC = new T.Mesh(new T.TorusGeometry(0.13, 0.018, 6, 18), arCoilMat); arCoilC.rotation.x = -0.55; arCoilC.position.z = -0.55;
    rigAr.add(arNeedle, arCoilA, arCoilB, arCoilC);

    // (5) 118 Og: Radiant Prismatic Mini-Galaxy Supernova Orb (3 Tilted Rings + Orbiting Element Gems!)
    const rigOg = new T.Group();
    const ogMat = plain(new T.MeshStandardMaterial({
      color: 0xff62d8, emissive: new T.Color(0xff62d8), emissiveIntensity: 2.0, roughness: 0.06
    }));
    const ogOrbitA = new T.Group();
    ogOrbitA.rotation.set(0.55, 0.3, 0);
    ogOrbitA.add(
      new T.Mesh(new T.TorusGeometry(0.36, 0.024, 8, 28), hTailMat),
      (() => { const m = new T.Mesh(new T.SphereGeometry(0.055, 10, 8), whiteCoreMat); m.position.set(0.36, 0, 0); return m; })()
    );
    const ogOrbitB = new T.Group();
    ogOrbitB.rotation.set(-0.62, 0.7, 0);
    ogOrbitB.add(
      new T.Mesh(new T.TorusGeometry(0.30, 0.022, 8, 26), cFinMat),
      (() => { const m = new T.Mesh(new T.OctahedronGeometry(0.058, 0), cCrystalMat); m.position.set(-0.30, 0, 0); return m; })()
    );
    const ogOrbitC = new T.Group();
    ogOrbitC.rotation.set(1.1, -0.4, 0);
    ogOrbitC.add(
      new T.Mesh(new T.TorusGeometry(0.42, 0.020, 8, 28), ogMat),
      (() => { const m = new T.Mesh(new T.SphereGeometry(0.052, 10, 8), arCoilMat); m.position.set(0, 0.42, 0); return m; })()
    );
    const ogTail = new T.Mesh(geoTailCone, ogMat); ogTail.scale.set(1.75, 1.75, 1.35); ogTail.position.z = -0.95;
    rigOg.add(
      new T.Mesh(new T.SphereGeometry(0.15, 14, 12), whiteCoreMat),
      new T.Mesh(new T.SphereGeometry(0.22, 16, 12), ogMat),
      ogOrbitA, ogOrbitB, ogOrbitC, ogTail
    );

    for (const rg of [rigH, rigC, rigNe, rigAr, rigOg]) {
      rg.visible = false;
      rg.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } });
      g.add(rg);
    }
    g.visible = false;
    g.frustumCulled = false;
    game.scene.add(g);
    return { g, rigH, hOrbit, rigC, cHalo, rigNe, neSpin, rigAr, arCoilA, arCoilB, arCoilC, rigOg, ogMat, ogOrbitA, ogOrbitB, ogOrbitC };
  }

  for (let i = 0; i < 20; i++) {
    const r = buildShotRigs();
    shots.push({
      on: false, ...r,
      pos: new T.Vector3(), dir: new T.Vector3(),
      el: ELEMENT_SHOTS[0], speed: 46, dist: 0, maxDist: 60, t: 0, trail: 0, free: 0, seen: new Set()
    });
  }

  // THICK GLOWING 3D VOLUMETRIC ZIG-ZAG LIGHTNING BOLT POOL (Cylinder segments — vivid on every GPU!)
  const boltUnitGeo = new T.CylinderGeometry(0.032, 0.032, 1.0, 6);
  const boltCoreGeo = new T.CylinderGeometry(0.015, 0.015, 1.0, 5);
  const _bMid = new T.Vector3();
  const _bDir = new T.Vector3();
  const _bPts = Array.from({ length: 7 }, () => new T.Vector3());
  for (let i = 0; i < 10; i++) {
    const grp = new T.Group();
    const outerMat = new T.MeshBasicMaterial({ color: 0xb682ff, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const innerMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const segs = [];
    for (let s = 0; s < 6; s++) {
      const mOut = new T.Mesh(boltUnitGeo, outerMat);
      const mIn = new T.Mesh(boltCoreGeo, innerMat);
      mOut.frustumCulled = mIn.frustumCulled = false;
      mOut.renderOrder = 7; mIn.renderOrder = 8;
      grp.add(mOut, mIn);
      segs.push({ mOut, mIn });
    }
    grp.visible = false;
    game.scene.add(grp);
    arcs.push({ on: false, grp, segs, outerMat, innerMat, t: 0, dur: 0.28 });
  }

  function spawnLightningArc(p0, p1) {
    const a = arcs.find((x) => !x.on) || arcs[0];
    a.on = true; a.t = 0; a.dur = 0.28;
    const dist = p0.distanceTo(p1);
    const amp = Math.min(0.65, Math.max(0.18, dist * 0.09));
    for (let k = 0; k < 7; k++) {
      const f = k / 6;
      const jit = (k === 0 || k === 6) ? 0 : amp;
      _bPts[k].set(
        p0.x + (p1.x - p0.x) * f + (Math.random() - 0.5) * jit,
        p0.y + (p1.y - p0.y) * f + (Math.random() - 0.5) * jit + Math.sin(f * Math.PI) * 0.24,
        p0.z + (p1.z - p0.z) * f + (Math.random() - 0.5) * jit
      );
    }
    for (let s = 0; s < 6; s++) {
      const A = _bPts[s], B = _bPts[s + 1];
      _bDir.subVectors(B, A);
      const len = Math.max(0.01, _bDir.length());
      _bMid.addVectors(A, B).multiplyScalar(0.5);
      _bDir.multiplyScalar(1 / len);
      const seg = a.segs[s];
      seg.mOut.position.copy(_bMid);
      seg.mOut.scale.set(1, len, 1);
      seg.mOut.quaternion.setFromUnitVectors(UP, _bDir);
      seg.mIn.position.copy(_bMid);
      seg.mIn.scale.set(1, len, 1);
      seg.mIn.quaternion.setFromUnitVectors(UP, _bDir);
    }
    a.outerMat.opacity = 0.92;
    a.innerMat.opacity = 1.0;
    a.grp.visible = true;
  }

  // 3D Translucent Additive Aurora Supernova Sphere Pool (for 118 Og impact climax!)
  const novaGeo = new T.SphereGeometry(1, 24, 16);
  for (let i = 0; i < 4; i++) {
    const mat = new T.MeshBasicMaterial({
      color: 0xff7ae8, transparent: true, opacity: 0, depthWrite: false,
      side: T.DoubleSide, blending: T.AdditiveBlending, fog: false
    });
    const m = new T.Mesh(novaGeo, mat);
    m.visible = false;
    m.renderOrder = 7;
    m.frustumCulled = false;
    game.scene.add(m);
    novas.push({ on: false, m, mat, t: 0, dur: 0.54 });
  }
  function spawnNovaSphere(x, y, z) {
    const n = novas.find((it) => !it.on) || novas[0];
    n.on = true; n.t = 0; n.dur = 0.54;
    n.m.position.set(x, y, z);
    n.m.scale.setScalar(0.3);
    n.mat.opacity = 0.36;
    n.m.visible = true;
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
  // Expose 1 prototype of each pooled VFX mesh so perf.js pre-compiles their shaders behind the loading card (0ms first-shot stall!)
  item._prewarmMeshes = [
    shots[0].g, shots[0].rigH, shots[0].rigC, shots[0].rigNe, shots[0].rigAr, shots[0].rigOg,
    arcs[0].grp, novas[0].m, rings[0].m, bubbles[0].mesh
  ];

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
      gun.registerHit(hitCrit, hitLabel, p);
    }

    // 3. Visual & Studio DSP Detonation FX by Element!
    if (el.kind === "og_nova") {
      // 118 Og GRAND RAINBOW PERIODIC-TABLE SUPERNOVA!
      spawnNovaSphere(p.x, p.y, p.z);
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

    this.aimT = 1.65;
    this.aimView = true;
    this.kick = Math.min(1.5, (this.kick || 0) + (el.kind === "og_nova" ? 1.35 : 0.78));
    if (ch.emote) ch.stop(0.08);

    // 1. Compute EXACT 3D barrel muzzle world position (use shoulder-height fallback if firing snap-shot from relaxed low-carry!)
    item.root.updateMatrixWorld(true);
    if (item.root.visible && (pl.view !== "tp" || (this.k > 0.7 && (this.level || 0) > 0.62))) {
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

      // Avoid immediate wall clipping right next to muzzle
      if (gun && !(game.chemlab && game.chemlab.inside)) {
        for (let m = 0.25; m < 1.9; m += 0.25) {
          const h = gun.probe(_tmpP.copy(_mz).addScaledVector(slot.dir, m));
          if (h) { if (h.kind === "wall") slot.free = 2.1; break; }
        }
      }

      // Activate ONLY the bespoke handcrafted 3D rig for this element!
      slot.rigH.visible = el.kind === "h_triple";
      slot.rigC.visible = el.kind === "c_diamond";
      slot.rigNe.visible = el.kind === "ne_ring";
      slot.rigAr.visible = el.kind === "ar_bolt";
      slot.rigOg.visible = el.kind === "og_nova";
      const sc = el.kind === "og_nova" ? 1.32 : el.kind === "c_diamond" ? 1.15 : el.kind === "h_triple" ? 0.88 : 1.08;
      slot.g.scale.setScalar(sc);
      slot.g.position.copy(slot.pos);
      slot.g.quaternion.setFromUnitVectors(FWD, slot.dir);
      slot.g.visible = true;
    }

    // For 18 Ar Argon Rail-Bolt: crackle a brief volumetric electric flash arc forward from barrel!
    if (el.kind === "ar_bolt") {
      spawnLightningArc(_mz, _tmpP.copy(_mz).addScaledVector(_toAim, 4.2));
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

  let chemBarShown = false;
  tools._updateChemGun = function (dt, time) {
    if (cool > 0) cool = Math.max(0, cool - dt);
    if (this.kick > 0 && this.held === "chemgun") {
      this.kick = Math.max(0, this.kick - dt * 5.2);
    }

    const active = !!(this.gun && this.gun.chemActive);
    if (chemBar && active !== chemBarShown) {
      chemBarShown = active;
      chemBar.classList.toggle("show", active);
    }

    // Animate held Starlight Cat-Ear & Stars Gun: floating 4-point star crown, gentle ear recoil, swaying star charm, stock star, muzzle halo & 5-element drum!
    if (this.held === "chemgun" && item.root.visible) {
      const adsBoost = this.gun ? (this.gun.ads || 0) * 6.5 : 0;
      const kick = this.kick || 0;
      const spinSpd = 2.8 + adsBoost + kick * 16.0;
      item.muzzleSpin.rotation.z += dt * spinSpd;
      item.ringB.rotation.y += dt * (spinSpd * 0.85);
      item.coreOrb.rotation.y = time * 3.2;
      item.coreOrb.position.y = 0.072 + Math.sin(time * 3.4) * 0.008;
      // Gently rotating star inside the golden crescent butt-stock!
      if (item.catTail) {
        item.catTail.rotation.x = time * 2.2;
      }
      // Subtle cat-ear recoil bounce & playful occasional ear perk!
      if (item.earL && item.earR) {
        const twitch = Math.pow(Math.max(0, Math.sin(time * 1.8 + 0.4)), 20) * 0.12;
        const earSpread = kick * 0.16;
        item.earL.rotation.z = 0.34 + earSpread;
        item.earR.rotation.z = -0.34 - earSpread - twitch;
        item.earL.rotation.x = 0.06 - kick * 0.18;
        item.earR.rotation.x = 0.06 - kick * 0.18;
      }
      // Gently swaying sakura ribbon & dangling golden 5-point star charm!
      if (item.bell) {
        item.bell.rotation.z = Math.sin(time * 4.4) * 0.12 + kick * 0.18;
        item.bell.rotation.x = -kick * 0.28;
      }
      // Smoothly revolve the 5-element crystal cylinder drum so the loaded element clicks into the top chamber!
      if (item.drumSpin) {
        const elIdx = lockedMode >= 0 ? lockedMode : (shotCycle % ELEMENT_SHOTS.length);
        const targetAng = -(elIdx / 5) * Math.PI * 2;
        const cur = item.drumSpin.rotation.z;
        const diff = Math.atan2(Math.sin(targetAng - cur), Math.cos(targetAng - cur));
        item.drumSpin.rotation.z += diff * (1 - Math.exp(-16 * dt));
      }
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
      // Bespoke lively animations per custom 3D element projectile!
      if (s.el.kind === "h_triple") {
        s.hOrbit.rotation.z = s.t * 16;
        s.hOrbit.rotation.x = s.t * 9;
      } else if (s.el.kind === "c_diamond") {
        s.rigC.rotation.z = s.t * 11;
        s.cHalo.rotation.z = -s.t * 18;
      } else if (s.el.kind === "ne_ring") {
        s.neSpin.rotation.z = s.t * 18;
        s.neSpin.rotation.x = Math.sin(s.t * 10) * 0.25;
      } else if (s.el.kind === "ar_bolt") {
        s.arCoilA.rotation.z = s.t * 22;
        s.arCoilB.rotation.z = -s.t * 18;
        s.arCoilC.rotation.z = s.t * 24;
      } else if (s.el.kind === "og_nova") {
        const hue = (time * 1.9 + s.t * 2.2) % 1;
        s.ogMat.color.setHSL(hue, 0.95, 0.66);
        s.ogMat.emissive.setHSL(hue, 0.95, 0.56);
        s.ogOrbitA.rotation.z = s.t * 11;
        s.ogOrbitB.rotation.z = -s.t * 14;
        s.ogOrbitC.rotation.z = s.t * 9;
      }
    }

    // Fade 3D Volumetric Argon Lightning Bolts
    for (const a of arcs) {
      if (!a.on) continue;
      a.t += dt;
      if (a.t >= a.dur) { a.on = false; a.grp.visible = false; continue; }
      const k = 1 - a.t / a.dur;
      a.outerMat.opacity = 0.92 * k;
      a.innerMat.opacity = 1.0 * k;
    }

    // Expand 3D Prismatic Supernova Spheres
    for (const n of novas) {
      if (!n.on) continue;
      n.t += dt;
      const u = n.t / n.dur;
      if (u >= 1) { n.on = false; n.m.visible = false; continue; }
      const ease = 1 - Math.pow(1 - u, 3);
      n.m.scale.setScalar(0.35 + 3.4 * ease);
      n.mat.color.setHSL((time * 2.4 + u * 0.6) % 1, 0.94, 0.62);
      n.mat.opacity = 0.36 * (1 - u);
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
    item.root.rotation.set(0, 0, 0);
    item.root.visible = true;
    const pic = thumbs.shot(item.root, { from: [0.80, 0.28, 0.66], look: [0, 0.10, 0.14], px: 128 });
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
