// 新领地：「极其猫星港」 (Starlight Lighthouse Harbor & Alchemical Shooting Fairground at (134, 126))
// + 全雪境可互动/可射击精致小物件群 (风车、冰晶风铃、雪景水晶球、圣诞红铜邮筒、烤棉花糖小推车、可打碎再生药水瓶桶架！)

import {
  makeStoneMasonryTex,
  makeShingleRoofTex,
  makeTimberWallTex,
  makeCrispWindowTex,
  makeCleanSignTex,
  buildCrispWindow,
  buildCrispDoor
} from "./archcraft.js?v=11251205";

const POSTCARDS = [
  "📮 来自 Gemini 的明信片：「主人在雪地里逛累了记得来极其猫星港听听灯塔号角、打打药水瓶靶子喵！本喵给你留了热棉花糖！」",
  "📮 来自 Claude 的明信片：「城堡壁炉的火一直留着呢，新修的清晰彩窗晚上看极光超美，欢迎随时回来喝热可可～」",
  "📮 来自 DeepSeek 的明信片：「经过严密空气动力学测算，18 Ar 氩电光连锁打中移动星靶的得分效率提升 312%，建议一试！」",
  "📮 来自 Grok 的明信片：「这座 19 米星海灯塔太酷了，我出双倍小鱼干想在顶层租个看极光 VIP 雅座！」",
  "📮 来自 圣诞雪境邮局：「叮咚！本张贺卡附赠今日份好运加成——愿主人今晚抽签大吉、一枪一个大红心喵！」"
];

const MARSHMALLOW_LINES = [
  "🍢 滋啦滋啦～烤得外焦里糯的焦糖棉花糖串出炉啦！咬一口拉丝甜到心里，体温瞬间回满喵！",
  "🌰 刚出锅的糖炒栗子热乎乎剥开一颗，香气飘满整条星港雪街，极其极其幸福喵～",
  "🍢 烤棉花糖夹进热可可饼干里做成冬日 S'mores！暖呼呼的能量满格，继续探险吧喵～"
];

const HARBOR_BEST_KEY = "xmas_harbor_range_best_v1";

export class StarlightHarbor {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;
    this.THREE = game.THREE;

    const h = (helpers.re && helpers.re.harbor) || { x: 134, z: 126 };
    this.cx = h.x;
    this.cz = h.z;
    this.group = null;
    this.m = {};

    this.lights = [];
    this.beaconRot = null;
    this.pinwheels = [];
    this.chimes = [];
    this.snowGlobes = [];
    this.bottles = [];
    this.railTargets = [];
    this.tetherBalloons = [];
    this.gongPivot = null;
    this.gongSwing = 0;
    this.gongVel = 0;

    this.postcardIdx = 0;
    this.snackIdx = 0;
    this.beaconPulse = 0;

    // 30-second High-Score Elemental Shooting Challenge state
    this.challenge = {
      on: false,
      t: 0,
      score: 0,
      hits: 0,
      best: 0
    };
    try {
      this.challenge.best = parseInt(localStorage.getItem(HARBOR_BEST_KEY) || "0", 10) || 0;
    } catch {}
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  addLight(x, y, z, color, power, dist = 16, always = false) {
    const l = new this.THREE.PointLight(color, always ? power : 0, dist, 1.5);
    l.position.set(x, y, z);
    this.group.add(l);
    this.lights.push({ light: l, power, always, phase: x * 0.23 + z * 0.17 });
    return l;
  }

  registerTarget(tg) {
    if (!this.game.shootTargets) this.game.shootTargets = [];
    this.game.shootTargets.push(tg);
    return tg;
  }

  scorePoints(pts) {
    if (!this.challenge.on) return;
    this.challenge.score += pts;
    this.challenge.hits++;
  }

  spawnBurst(pos, hexRgb, count = 16, spd = 2.8) {
    const g = this.game;
    if (!g.puffs) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * spd;
      g.puffs.spawn(
        pos.x, pos.y, pos.z,
        Math.cos(a) * sp, 0.8 + Math.random() * 2.2, Math.sin(a) * sp,
        0.065 + Math.random() * 0.06, 0.86, 0.42 + Math.random() * 0.3,
        hexRgb[0], hexRgb[1], hexRgb[2], 3.2, 1.5
      );
    }
    g.sparks && g.sparks.spawn(pos.x, pos.y, pos.z, 0, 0, 0, 0.56, 0.95, 0.15, hexRgb[0] * 3.2, hexRgb[1] * 3.2, hexRgb[2] * 3.2, 0, 0);
  }

  makeSignPlaque(title, sub, w, h, opts = {}) {
    const T = this.THREE;
    const tex = makeCleanSignTex(T, this.game.renderer, title, sub, opts);
    const face = this.wrapMat(new T.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: new T.Color(0.32, 0.42, 0.62), emissiveIntensity: 0.52, roughness: 0.26
    }), { key: "plain" });
    return this.mesh(new T.BoxGeometry(w, h, 0.10), [this.m.gold, this.m.gold, this.m.snow, this.m.gold, face, face]);
  }

  buildMats() {
    const T = this.THREE;
    const rend = this.game.renderer;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.55, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const stoneTex = makeStoneMasonryTex(T, rend, 3, 2);
    const stoneTallTex = makeStoneMasonryTex(T, rend, 4, 4);
    const timberTex = makeTimberWallTex(T, rend, 3, 2);
    const roofCopperTex = makeShingleRoofTex(T, rend, "copper", 3, 2);
    const roofRedTex = makeShingleRoofTex(T, rend, "red", 3, 2);
    const roofIndigoTex = makeShingleRoofTex(T, rend, "indigo", 3, 2);
    const winCozyTex = makeCrispWindowTex(T, rend, "cozy");
    const winAlchTex = makeCrispWindowTex(T, rend, "alchemy");

    this.m = {
      stone: plain(new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.72, metalness: 0.04 })),
      stoneTall: plain(new T.MeshStandardMaterial({ map: stoneTallTex, roughness: 0.72, metalness: 0.04 })),
      cobalt: plain(new T.MeshStandardMaterial({ map: stoneTex, color: new T.Color(0.24, 0.34, 0.68), roughness: 0.60, metalness: 0.12 })),
      timber: plain(new T.MeshStandardMaterial({ map: timberTex, roughness: 0.72, metalness: 0.04 })),
      darkWood: std(0x3a2417, 0.76),
      warmWood: std(0x7c4c2a, 0.72),
      roofCopper: plain(new T.MeshStandardMaterial({ map: roofCopperTex, roughness: 0.42, metalness: 0.34, side: T.DoubleSide })),
      roofRed: plain(new T.MeshStandardMaterial({ map: roofRedTex, roughness: 0.50, metalness: 0.08, side: T.DoubleSide })),
      roofIndigo: plain(new T.MeshStandardMaterial({ map: roofIndigoTex, roughness: 0.48, metalness: 0.14, side: T.DoubleSide })),
      shutter: std(0x1f4e52, 0.54),
      gold: std(0xf4cc62, 0.20, { metalness: 0.88 }),
      iron: std(0x1c2336, 0.40, { metalness: 0.65 }),
      snow: std(0xf5f9ff, 0.76),
      scarlet: std(0xc82832, 0.38, { metalness: 0.12 }),
      cream: std(0xfaf4ea, 0.56),
      pine: std(0x1f643c, 0.74),
      winCozy: plain(new T.MeshStandardMaterial({
        map: winCozyTex, emissiveMap: winCozyTex, emissive: new T.Color(1.0, 0.88, 0.66), emissiveIntensity: 0.84, roughness: 0.16, metalness: 0.08
      })),
      winAlch: plain(new T.MeshStandardMaterial({
        map: winAlchTex, emissiveMap: winAlchTex, emissive: new T.Color(0.84, 0.94, 1.0), emissiveIntensity: 0.82, roughness: 0.16, metalness: 0.08
      })),
      glass: plain(new T.MeshPhysicalMaterial({
        color: 0xdff6ff, roughness: 0.06, metalness: 0.08, transparent: true, opacity: 0.34, depthWrite: false, side: T.DoubleSide
      })),
      beam: plain(new T.MeshBasicMaterial({
        color: 0x9cf6ff, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide
      })),
      cyanGlow: std(0x52f4ff, 0.14, { emissive: new T.Color(0.24, 0.90, 1.0), emissiveIntensity: 1.45 }),
      goldGlow: std(0xffe066, 0.14, { emissive: new T.Color(1.0, 0.74, 0.18), emissiveIntensity: 1.45 }),
      pinkGlow: std(0xff7ee0, 0.14, { emissive: new T.Color(0.96, 0.36, 0.86), emissiveIntensity: 1.45 }),
      coralGlow: std(0xff7442, 0.14, { emissive: new T.Color(1.0, 0.40, 0.16), emissiveIntensity: 1.45 }),
      violetGlow: std(0xb484ff, 0.14, { emissive: new T.Color(0.62, 0.34, 1.0), emissiveIntensity: 1.45 }),
      mintGlow: std(0x64ffc0, 0.14, { emissive: new T.Color(0.18, 0.90, 0.56), emissiveIntensity: 1.45 })
    };
  }

  build() {
    const T = this.THREE;
    this.buildMats();
    const root = this.group = new T.Group();
    root.name = "starlight_harbor";
    this.game.scene.add(root);

    // 1. Guiding Starlight Trail & Grand Entrance Arch linking 极其猫实验室 -> 极其猫星港
    this.buildTrailAndArch();
    // 2. Central Compass Plaza & 19m Sculpted Starlight Lighthouse (极其猫灯塔)
    this.buildPlazaAndLighthouse();
    // 3. Alchemical Gunsmith & Craft Cottage (极其猫工坊 + Overdrive Station!)
    this.buildCraftWorkshop();
    // 4. Crystal Winter Glass Conservatory (极其猫花房 + Snow-Globe Pedestal!)
    this.buildConservatory();
    // 5. Interactive Elemental Shooting Gallery (极其猫靶场 — 14 live shootable targets + 30s Challenge!)
    this.buildShootingGallery();
    // 6. Handcrafted Interactive Small Objects scattered across Harbor + Lab + CatHome + Castle Plaza!
    this.buildWorldSmallObjects();

    // Register 「极其猫星港」 on the M map for 1-click Starlight Fast-Travel!
    const explore = this.game.explore;
    if (explore && explore.sites && !explore.sites.some((s) => s.id === "harbor")) {
      explore.sites.push({ id: "harbor", name: "极其猫星港", x: this.cx, z: this.cz, r: 22, found: false });
    }
    return this;
  }

  // =========================================================================
  // 1. TRAIL LANTERNS & HARBOR ENTRANCE ARCH
  // =========================================================================
  buildTrailAndArch() {
    const T = this.THREE;
    const { world } = this.game;

    // 4 Glowing Maritime Star-Lantern Posts guiding from ChemLab (76,102) -> Harbor (134,126)
    const trailPts = [[92, 108], [104, 113], [115, 118], [122, 121]];
    trailPts.forEach(([px, pz], idx) => {
      const py = this.qt(px, pz);
      const lg = new T.Group();
      lg.position.set(px, py, pz);
      lg.add(
        this.mesh(new T.CylinderGeometry(0.16, 0.22, 0.30, 8), this.m.stone, 0, 0.15, 0),
        this.mesh(new T.CylinderGeometry(0.06, 0.08, 2.6, 8), this.m.iron, 0, 1.45, 0),
        this.mesh(new T.BoxGeometry(0.55, 0.07, 0.07), this.m.iron, 0.22, 2.68, 0),
        this.mesh(new T.OctahedronGeometry(0.18, 1), idx % 2 === 0 ? this.m.cyanGlow : this.m.goldGlow, 0.44, 2.46, 0),
        this.mesh(new T.ConeGeometry(0.22, 0.16, 6), this.m.gold, 0.44, 2.66, 0)
      );
      this.group.add(lg);
      world.circles.push({ x: px, z: pz, r: 0.24 });
    });

    // Grand Starlight Harbor Entrance Arch at (123.5, 121.5) facing NW toward Lab
    const ax = this.cx - 10.5, az = this.cz - 4.5, ay = this.qt(ax, az);
    const arch = new T.Group();
    arch.position.set(ax, ay, az);
    arch.rotation.y = -Math.PI * 0.36;
    for (const side of [-1, 1]) {
      const sx = side * 2.25;
      arch.add(
        this.mesh(new T.BoxGeometry(0.62, 0.46, 0.62), this.m.stone, sx, 0.23, 0),
        this.mesh(new T.CylinderGeometry(0.19, 0.22, 3.6, 12), this.m.cobalt, sx, 2.15, 0),
        this.mesh(new T.TorusGeometry(0.24, 0.045, 8, 18).rotateX(Math.PI / 2), this.m.gold, sx, 0.52, 0),
        this.mesh(new T.TorusGeometry(0.24, 0.045, 8, 18).rotateX(Math.PI / 2), this.m.gold, sx, 3.85, 0),
        this.mesh(new T.SphereGeometry(0.22, 12, 8), side < 0 ? this.m.cyanGlow : this.m.goldGlow, sx, 4.18, 0)
      );
    }
    const sign = this.makeSignPlaque("✦ 极其猫星港 ✦", "灯塔 · 炼金工坊 · 实弹靶场", 3.4, 0.82, { bg0: "#122146", bg1: "#213a6e", border: "#f4cc62", glow: "#6ef0ff" });
    sign.position.set(0, 4.18, 0);
    arch.add(
      this.mesh(new T.BoxGeometry(5.1, 0.20, 0.34), this.m.iron, 0, 3.75, 0),
      this.mesh(new T.TorusGeometry(2.28, 0.085, 8, 28, Math.PI), this.m.gold, 0, 3.72, 0),
      sign,
      // Sculpted golden cat ears crowning the Harbor Arch!
      this.mesh(new T.ConeGeometry(0.28, 0.62, 4), this.m.gold, -1.25, 4.82, 0),
      this.mesh(new T.ConeGeometry(0.28, 0.62, 4), this.m.gold, 1.25, 4.82, 0)
    );
    this.group.add(arch);
    arch.updateMatrixWorld(true);
    for (const side of [-1, 1]) {
      const wp = new T.Vector3(side * 2.25, 0, 0).applyMatrix4(arch.matrixWorld);
      world.circles.push({ x: wp.x, z: wp.z, r: 0.40 });
    }
  }

  // =========================================================================
  // 2. CENTRAL PLAZA & 19M SCULPTED STARLIGHT LIGHTHOUSE (极其猫灯塔)
  // =========================================================================
  buildPlazaAndLighthouse() {
    const T = this.THREE;
    const { world } = this.game;

    // Central Harbor Starlight Stone Plaza Deck at (cx, cz)
    const py = this.qt(this.cx, this.cz);
    const plaza = new T.Group();
    plaza.position.set(this.cx, py, this.cz);
    plaza.add(
      this.mesh(new T.CylinderGeometry(5.4, 5.7, 0.16, 32), this.m.stone, 0, 0.08, 0),
      this.mesh(new T.TorusGeometry(5.38, 0.09, 8, 40).rotateX(Math.PI / 2), this.m.gold, 0, 0.17, 0),
      this.mesh(new T.TorusGeometry(3.2, 0.05, 6, 36).rotateX(Math.PI / 2), this.m.cyanGlow, 0, 0.17, 0)
    );
    // 6 low maritime brass bollards around the plaza ring
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const bx = Math.cos(a) * 5.15, bz = Math.sin(a) * 5.15;
      plaza.add(
        this.mesh(new T.CylinderGeometry(0.13, 0.16, 0.65, 10), this.m.iron, bx, 0.42, bz),
        this.mesh(new T.SphereGeometry(0.11, 10, 8), i % 2 === 0 ? this.m.cyanGlow : this.m.goldGlow, bx, 0.80, bz)
      );
    }
    this.group.add(plaza);

    // 19m SCULPTED STARLIGHT LIGHTHOUSE at (cx - 8, cz - 12) = (126, 114)!
    const lx = this.cx - 8.2, lz = this.cz - 11.8, ly = this.qt(lx, lz);
    const lh = new T.Group();
    lh.position.set(lx, ly, lz);
    lh.rotation.y = 0.48; // Faces SE toward central plaza

    // Octagonal stepped ashlar base plinth + 3 alternating banded lighthouse stories!
    lh.add(
      this.mesh(new T.CylinderGeometry(3.15, 3.45, 0.65, 8), this.m.stone, 0, 0.325, 0),
      this.mesh(new T.CylinderGeometry(2.65, 2.95, 3.8, 16), this.m.stoneTall, 0, 2.55, 0),
      this.mesh(new T.TorusGeometry(2.70, 0.11, 8, 28).rotateX(Math.PI / 2), this.m.gold, 0, 4.45, 0),
      this.mesh(new T.CylinderGeometry(2.28, 2.62, 3.6, 16), this.m.cobalt, 0, 6.25, 0),
      this.mesh(new T.TorusGeometry(2.32, 0.10, 8, 28).rotateX(Math.PI / 2), this.m.gold, 0, 8.05, 0),
      this.mesh(new T.CylinderGeometry(1.96, 2.26, 3.4, 16), this.m.stoneTall, 0, 9.75, 0),
      // Corbelled Stone Observation Gallery Balcony Deck + Gold Railings!
      this.mesh(new T.CylinderGeometry(2.75, 2.02, 0.55, 16), this.m.stone, 0, 11.72, 0),
      this.mesh(new T.TorusGeometry(2.72, 0.08, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, 12.02, 0),
      this.mesh(new T.TorusGeometry(2.68, 0.06, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, 12.92, 0)
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      lh.add(this.mesh(new T.CylinderGeometry(0.045, 0.045, 0.92, 6), this.m.iron, Math.cos(a) * 2.66, 12.46, Math.sin(a) * 2.66));
    }

    // Arched Carved Lighthouse Door + Crisp 3D Arched Spiral Tower Windows!
    const lhMats = { frame: this.m.darkWood, door: this.m.warmWood, brass: this.m.gold, snow: this.m.snow, pane: this.m.winCozy, shutter: this.m.shutter };
    const door = buildCrispDoor(T, lhMats, { w: 1.38, h: 2.22, double: true, arch: true });
    door.position.set(0, 0.62, 2.86);
    lh.add(door);

    const lhSign = this.makeSignPlaque("✦ 极其猫灯塔 ✦", "", 2.35, 0.52, { bg0: "#14224a", bg1: "#253e78", border: "#f4cc62" });
    lhSign.position.set(0, 3.65, 2.96);
    lh.add(lhSign);

    const winSpecs = [
      { y: 2.55, r: 2.80, a: Math.PI * 0.5 },
      { y: 2.55, r: 2.80, a: -Math.PI * 0.5 },
      { y: 6.25, r: 2.46, a: 0.0 },
      { y: 6.25, r: 2.46, a: Math.PI * 0.65 },
      { y: 6.25, r: 2.46, a: -Math.PI * 0.65 },
      { y: 9.75, r: 2.12, a: 0.35 },
      { y: 9.75, r: 2.12, a: -2.15 }
    ];
    for (const ws of winSpecs) {
      const w = buildCrispWindow(T, { ...lhMats, pane: this.m.winAlch }, { w: 0.84, h: 1.18, arch: true, shutters: false });
      w.position.set(Math.sin(ws.a) * ws.r, ws.y, Math.cos(ws.a) * ws.r);
      w.rotation.y = ws.a;
      lh.add(w);
    }

    // Crystal Glass Lantern Room + Rotating Golden Fresnel Lens & Twin Volumetric Aurora Searchlight Beams!
    lh.add(
      this.mesh(new T.CylinderGeometry(1.75, 1.82, 2.35, 16), this.m.glass, 0, 13.18, 0),
      // Copper Dome Roof + Snow Frost Cap + Sculpted Golden Cat Ears Finial!
      this.mesh(new T.ConeGeometry(2.25, 2.45, 12), this.m.roofCopper, 0, 15.55, 0),
      this.mesh(new T.ConeGeometry(1.42, 0.95, 12), this.m.snow, 0, 16.40, 0),
      this.mesh(new T.ConeGeometry(0.42, 1.05, 4), this.m.gold, -0.78, 16.35, 0),
      this.mesh(new T.ConeGeometry(0.42, 1.05, 4), this.m.gold, 0.78, 16.35, 0),
      this.mesh(new T.OctahedronGeometry(0.38, 0), this.m.goldGlow, 0, 17.25, 0)
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lh.add(this.mesh(new T.CylinderGeometry(0.055, 0.055, 2.38, 6), this.m.gold, Math.cos(a) * 1.79, 13.18, Math.sin(a) * 1.79));
    }

    const beacon = new T.Group();
    beacon.position.set(0, 13.22, 0);
    beacon.add(
      this.mesh(new T.OctahedronGeometry(0.75, 1), this.m.goldGlow, 0, 0, 0),
      this.mesh(new T.TorusGeometry(0.95, 0.06, 8, 24), this.m.cyanGlow, 0, 0, 0)
    );
    // Twin 28m Sweeping Searchlight Cones!
    for (const side of [-1, 1]) {
      const cone = this.mesh(new T.ConeGeometry(3.8, 28, 16, 1, true), this.m.beam, 0, 0, side * 14.4);
      cone.rotation.x = side * (-Math.PI / 2);
      cone.renderOrder = 4;
      beacon.add(cone);
    }
    this.beaconRot = beacon;
    lh.add(beacon);

    this.group.add(lh);
    lh.updateMatrixWorld(true);
    world.circles.push({ x: lx, z: lz, r: 3.35 });
    this.addLight(lx, ly + 13.4, lz, 0x9cf6ff, 22, 34, true);
    this.addLight(lx + 2.2, ly + 3.2, lz + 3.0, 0xffd084, 10, 16, false);

    // Interactive Lighthouse Foghorn & Aurora Beacon Pulse Switch right in front of the arched door!
    const swPos = new T.Vector3(0, 1.2, 3.85).applyMatrix4(lh.matrixWorld);
    world.spots.push({
      id: "harbor_lighthouse",
      pos: swPos,
      r: 3.8,
      label: "鸣响「极其猫灯塔」星海号角 · 点亮极光灯束！",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        this.beaconPulse = 3.2;
        this.game.audio && this.game.audio.fogHorn && this.game.audio.fogHorn();
        this.game.character && this.game.character.play && this.game.character.play("cheer");
        this.spawnBurst(new T.Vector3(lx, ly + 13.4, lz), [0.35, 0.96, 1.0], 26, 4.8);
        this.game.ui && this.game.ui.toast("📯 呜——！极其猫星海灯塔鸣响暖铜号角，双道星光光束全速扫过整片圣诞雪境喵！", 5.5);
      }
    });
  }

  // =========================================================================
  // 3. ALCHEMICAL GUNSMITH & CRAFT WORKSHOP (极其猫工坊 + Overdrive Station!)
  // =========================================================================
  buildCraftWorkshop() {
    const T = this.THREE;
    const { world } = this.game;
    const wx = this.cx - 9.8, wz = this.cz + 8.6, wy = this.qt(wx, wz);
    const g = new T.Group();
    g.position.set(wx, wy, wz);
    g.rotation.y = Math.PI * 0.72; // Faces NE toward central harbor plaza

    const wMats = { frame: this.m.darkWood, door: this.m.warmWood, brass: this.m.gold, snow: this.m.snow, pane: this.m.winCozy, shutter: this.m.shutter };
    g.add(
      // Carved stone plinth + beveled cedar timber workshop walls + corner timber pilasters
      this.mesh(new T.BoxGeometry(6.2, 0.36, 4.6), this.m.stone, 0, 0.18, 0),
      this.mesh(new T.BoxGeometry(5.8, 3.0, 4.2), this.m.timber, 0, 1.86, 0),
      this.mesh(new T.BoxGeometry(0.26, 3.06, 0.26), this.m.darkWood, -2.86, 1.88, 2.06),
      this.mesh(new T.BoxGeometry(0.26, 3.06, 0.26), this.m.darkWood, 2.86, 1.88, 2.06),
      this.mesh(new T.BoxGeometry(0.26, 3.06, 0.26), this.m.darkWood, -2.86, 1.88, -2.06),
      this.mesh(new T.BoxGeometry(0.26, 3.06, 0.26), this.m.darkWood, 2.86, 1.88, -2.06),
      // Stone Forge Chimney on the left flank
      this.mesh(new T.BoxGeometry(0.88, 5.4, 0.88), this.m.stone, -3.05, 2.85, -0.6),
      this.mesh(new T.BoxGeometry(1.04, 0.20, 1.04), this.m.gold, -3.05, 5.58, -0.6),
      this.mesh(new T.BoxGeometry(0.92, 0.10, 0.92), this.m.snow, -3.05, 5.72, -0.6)
    );
    // Scalloped Copper-Shingle Steep Pitched Roof + Snow Blanket + Gable Triangles
    const pitch = 0.56, slope = 3.65, len = 6.95, ridgeY = 5.18;
    const drop = Math.sin(pitch) * (slope * 0.5), offZ = Math.cos(pitch) * (slope * 0.5);
    for (const side of [-1, 1]) {
      const rp = this.mesh(new T.BoxGeometry(len, 0.14, slope), this.m.roofCopper, 0, ridgeY - drop, side * offZ);
      rp.rotation.x = side * pitch;
      const sn = this.mesh(new T.BoxGeometry(len + 0.08, 0.10, slope + 0.08), this.m.snow, 0, ridgeY - drop + 0.095, side * offZ);
      sn.rotation.x = side * pitch;
      g.add(rp, sn);
    }
    const gTri = new T.Shape();
    gTri.moveTo(-2.15, 0); gTri.lineTo(2.15, 0); gTri.lineTo(0, 1.82); gTri.closePath();
    const gGeo = new T.ExtrudeGeometry(gTri, { depth: 0.18, bevelEnabled: false });
    gGeo.translate(0, 0, -0.09);
    for (const sx of [-2.88, 2.88]) {
      const gw = this.mesh(gGeo, this.m.timber, sx, 3.36, 0);
      gw.rotation.y = Math.PI / 2;
      g.add(gw);
    }
    g.add(this.mesh(new T.CylinderGeometry(0.08, 0.08, len + 0.24, 10).rotateZ(Math.PI / 2), this.m.gold, 0, ridgeY + 0.08, 0));

    // Sculpted Arched Cottage Door + Crisp Shuttered Windows on ALL sides + Signboard!
    const cDoor = buildCrispDoor(T, wMats, { w: 1.32, h: 2.20, double: true, arch: true });
    cDoor.position.set(0, 0.36, 2.11);
    g.add(cDoor);
    for (const side of [-1, 1]) {
      const fw = buildCrispWindow(T, { ...wMats, pane: this.m.winAlch }, {
        w: 1.04, h: 1.24, arch: true, shutters: true, flowerBox: true,
        boxFillMats: [this.m.cyanGlow, this.m.goldGlow, this.m.pinkGlow]
      });
      fw.position.set(side * 1.82, 1.88, 2.11);
      g.add(fw);
      const sw = buildCrispWindow(T, wMats, { w: 1.18, h: 1.28, arch: true, shutters: true });
      sw.position.set(side * 2.91, 1.88, 0.2);
      sw.rotation.y = side * (Math.PI / 2);
      g.add(sw);
    }
    const wSign = this.makeSignPlaque("✦ 极其猫工坊 ✦", "武器超频 · 炼金整备", 2.75, 0.62, { bg0: "#241d3c", bg1: "#3c2a5a", border: "#f4cc62" });
    wSign.position.set(0, 3.00, 2.34);
    g.add(wSign);

    // Outdoor Glowing Element Overcharge Pedestal right beside the door!
    const ped = new T.Group();
    ped.position.set(2.35, 0, 3.15);
    ped.add(
      this.mesh(new T.CylinderGeometry(0.48, 0.58, 0.92, 12), this.m.stone, 0, 0.46, 0),
      this.mesh(new T.TorusGeometry(0.50, 0.05, 8, 20).rotateX(Math.PI / 2), this.m.gold, 0, 0.94, 0),
      this.mesh(new T.OctahedronGeometry(0.28, 0), this.m.cyanGlow, 0, 1.42, 0),
      this.mesh(new T.TorusGeometry(0.42, 0.03, 6, 22), this.m.goldGlow, 0, 1.42, 0)
    );
    g.add(ped);
    this.pinwheels.push({ obj: ped.children[2], speed: 2.2, boost: 0, axis: "y" });

    this.group.add(g);
    g.updateMatrixWorld(true);
    world.circles.push({ x: wx, z: wz, r: 3.4 });
    this.addLight(wx, wy + 3.0, wz, 0xffcc80, 12, 18, false);

    const pedWorld = new T.Vector3(2.35, 1.2, 3.15).applyMatrix4(g.matrixWorld);
    world.spots.push({
      id: "harbor_overdrive",
      pos: pedWorld,
      r: 3.0,
      label: "启动「星光武器超频台」· 25秒极速连射 + 满格回温！",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const gm = this.game;
        if (gm.tools && gm.tools.gun) {
          gm.tools.gun.overdriveT = 25;
          gm.tools.gun.ammo = 16;
          gm.tools.gun.pack = 0;
        }
        gm.cold && (gm.cold.w = 100, gm.cold.wet = 0);
        gm.audio && gm.audio.chimeChord && gm.audio.chimeChord(1);
        gm.character && gm.character.play && gm.character.play("cheer");
        this.spawnBurst(pedWorld, [0.32, 0.95, 1.0], 24, 3.4);
        gm.ui && gm.ui.toast("⚡ 已开启 25 秒「星光武器超频」！化学元素炮与雪枪射速 +35%、弹匣瞬间补满喵！", 5.5);
      }
    });
  }

  // =========================================================================
  // 4. CRYSTAL WINTER GLASS CONSERVATORY (极其猫花房 + Interactive Snow-Globe!)
  // =========================================================================
  buildConservatory() {
    const T = this.THREE;
    const { world } = this.game;
    const gx = this.cx + 9.2, gz = this.cz + 8.8, gy = this.qt(gx, gz);
    const g = new T.Group();
    g.position.set(gx, gy, gz);
    g.rotation.y = -Math.PI * 0.72; // Open entry faces NW toward plaza

    const r = 3.2;
    g.add(
      this.mesh(new T.CylinderGeometry(r + 0.35, r + 0.50, 0.24, 24), this.m.stone, 0, 0.12, 0),
      // Rear 240° stone dwarf wall + crisp arched glass dome!
      this.mesh(new T.CylinderGeometry(r, r, 1.15, 24, 1, true, 1.05, Math.PI * 2 - 2.1), this.m.stone, 0, 0.80, 0),
      this.mesh(new T.SphereGeometry(r - 0.04, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), this.m.glass, 0, 1.38, 0),
      this.mesh(new T.TorusGeometry(r, 0.075, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, 1.38, 0),
      this.mesh(new T.OctahedronGeometry(0.32, 0), this.m.pinkGlow, 0, 1.38 + r + 0.32, 0)
    );
    // 6 gilded conservatory ribs
    for (let i = 0; i < 6; i++) {
      const a = 1.05 + ((Math.PI * 2 - 2.1) * i) / 5;
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const phi = (k / 10) * (Math.PI * 0.5);
        pts.push(new T.Vector3(Math.sin(a) * Math.cos(phi) * r, 1.38 + Math.sin(phi) * r, Math.cos(a) * Math.cos(phi) * r));
      }
      g.add(
        this.mesh(new T.CylinderGeometry(0.065, 0.08, 1.18, 8), this.m.gold, Math.sin(a) * r, 0.80, Math.cos(a) * r),
        this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 14, 0.055, 8, false), this.m.gold)
      );
    }
    const cSign = this.makeSignPlaque("✦ 极其猫花房 ✦", "", 2.2, 0.48, { bg0: "#201a44", bg1: "#44286a", border: "#ff9ce0" });
    cSign.position.set(0, 2.52, r + 0.08);
    g.add(cSign);

    // Glowing Crystalline Winter Roses blooming inside the conservatory!
    const roseCols = [this.m.pinkGlow, this.m.cyanGlow, this.m.goldGlow, this.m.violetGlow];
    for (let i = 0; i < 8; i++) {
      const a = 1.45 + (i / 7) * (Math.PI * 2 - 2.9);
      const bx = Math.sin(a) * 2.15, bz = Math.cos(a) * 2.15;
      g.add(
        this.mesh(new T.CylinderGeometry(0.24, 0.18, 0.32, 10), this.m.warmWood, bx, 0.40, bz),
        this.mesh(new T.CylinderGeometry(0.025, 0.03, 0.44, 6), this.m.pine, bx, 0.72, bz),
        this.mesh(new T.OctahedronGeometry(0.16, 1), roseCols[i % roseCols.length], bx, 0.98, bz)
      );
    }

    this.group.add(g);
    g.updateMatrixWorld(true);
    for (let i = 0; i <= 8; i++) {
      const a = 1.05 + ((Math.PI * 2 - 2.1) * i) / 8;
      const wp = new T.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r).applyMatrix4(g.matrixWorld);
      world.circles.push({ x: wp.x, z: wp.z, r: 0.42 });
    }
    this.addLight(gx, gy + 2.4, gz, 0xffb2eb, 11, 15, true);

    // Interactive Snow-Globe Pedestal right in the center of the Conservatory!
    this.addSnowGlobe(gx, gz, "conservatory_globe");
  }

  // =========================================================================
  // 5. INTERACTIVE ELEMENTAL SHOOTING GALLERY (极其猫靶场 — 14 LIVE TARGETS!)
  // =========================================================================
  buildShootingGallery() {
    const T = this.THREE;
    const { world } = this.game;

    // Shooting Booth Pavilion at (cx + 7, cz - 9) = (141, 117), facing East (+X) down a 20m clear snow lane!
    const bx = this.cx + 7.2, bz = this.cz - 9.0, by = this.qt(bx, bz);
    const booth = new T.Group();
    booth.position.set(bx, by, bz);

    booth.add(
      // Timber Shooting Counter + Stone Deck
      this.mesh(new T.BoxGeometry(2.2, 0.22, 6.2), this.m.stone, 0, 0.11, 0),
      this.mesh(new T.BoxGeometry(0.82, 0.98, 5.4), this.m.timber, 0.65, 0.70, 0),
      this.mesh(new T.BoxGeometry(1.02, 0.10, 5.65), this.m.cream, 0.65, 1.22, 0),
      // 4 Posts + Scalloped Red-Shingle Awning Roof
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 2.8, 8), this.m.darkWood, -0.82, 1.55, -2.65),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 2.8, 8), this.m.darkWood, -0.82, 1.55, 2.65),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 2.8, 8), this.m.darkWood, 0.82, 1.55, -2.65),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 2.8, 8), this.m.darkWood, 0.82, 1.55, 2.65)
    );
    const awning = this.mesh(new T.BoxGeometry(2.6, 0.12, 6.4), this.m.roofRed, 0, 3.05, 0);
    awning.rotation.z = -0.16;
    const snowCap = this.mesh(new T.BoxGeometry(2.66, 0.08, 6.46), this.m.snow, 0, 3.14, 0);
    snowCap.rotation.z = -0.16;
    const rSign = this.makeSignPlaque("✦ 极其猫靶场 ✦", "雪枪 · 星弓 · 118 Og 元素炮通用", 3.4, 0.76, { bg0: "#24163c", bg1: "#4a1f52", border: "#ffe066" });
    rSign.position.set(-0.98, 3.25, 0);
    rSign.rotation.y = -Math.PI / 2;
    booth.add(awning, snowCap, rSign);
    this.group.add(booth);
    world.boxes.push({ x0: bx + 0.1, x1: bx + 1.2, z0: bz - 2.8, z1: bz + 2.8, h: 1.25 });
    this.addLight(bx, by + 2.7, bz, 0xffd68a, 11, 16, false);

    // ROW 1 (7.5m East): 6 Breakable Glowing Alchemy Elixir Bottles on 2 Carved Oak Barrel Racks!
    const bottleCols = [
      { mat: this.m.cyanGlow, rgb: [0.32, 0.96, 1.0], name: "1 H 蓝瓶" },
      { mat: this.m.goldGlow, rgb: [1.0, 0.86, 0.34], name: "6 C 金瓶" },
      { mat: this.m.coralGlow, rgb: [1.0, 0.42, 0.22], name: "10 Ne 橙瓶" },
      { mat: this.m.violetGlow, rgb: [0.68, 0.44, 1.0], name: "18 Ar 紫瓶" },
      { mat: this.m.pinkGlow, rgb: [1.0, 0.46, 0.88], name: "118 Og 粉瓶" },
      { mat: this.m.mintGlow, rgb: [0.35, 1.0, 0.72], name: "薄荷魔药瓶" }
    ];
    for (const [rackIdx, rzOff] of [[0, -2.0], [1, 2.0]]) {
      const rx = bx + 7.4, rz = bz + rzOff, ry = this.qt(rx, rz);
      this.addBottleRack(rx, ry, rz, bottleCols.slice(rackIdx * 3, rackIdx * 3 + 3), `harbor_r1_${rackIdx}`);
    }

    // ROW 2 (12.5m East): 4 Moving Sliding Rail Star-Targets gliding along elevated brass tracks!
    const railX = bx + 12.2, railY = this.qt(railX, bz);
    const railG = new T.Group();
    railG.position.set(railX, railY, bz);
    railG.add(
      this.mesh(new T.CylinderGeometry(0.10, 0.12, 2.1, 8), this.m.darkWood, 0, 1.05, -4.6),
      this.mesh(new T.CylinderGeometry(0.10, 0.12, 2.1, 8), this.m.darkWood, 0, 1.05, 4.6),
      this.mesh(new T.CylinderGeometry(0.055, 0.055, 9.4, 8).rotateX(Math.PI / 2), this.m.gold, 0, 1.42, 0)
    );
    this.group.add(railG);

    for (let i = 0; i < 4; i++) {
      const tg = new T.Group();
      const disc = this.mesh(new T.CylinderGeometry(0.56, 0.56, 0.10, 20).rotateZ(Math.PI / 2), i % 2 ? this.m.scarlet : this.m.cobalt, 0, 0.65, 0);
      const ring = this.mesh(new T.TorusGeometry(0.36, 0.05, 8, 20).rotateY(Math.PI / 2), this.m.gold, -0.06, 0.65, 0);
      const bull = this.mesh(new T.SphereGeometry(0.14, 10, 8), this.m.goldGlow, -0.07, 0.65, 0);
      const stem = this.mesh(new T.CylinderGeometry(0.04, 0.04, 0.52, 6), this.m.gold, 0, 0.25, 0);
      tg.add(disc, ring, bull, stem);
      const baseZ = bz - 3.2 + i * 2.15;
      tg.position.set(railX, railY + 1.42, baseZ);
      this.group.add(tg);

      const state = {
        g: tg, baseX: railX, baseY: railY + 1.42, baseZ,
        phase: i * 1.45, amp: 1.05, spd: 1.15 + i * 0.18,
        downT: 0, flip: 0,
        pos: new T.Vector3(railX, railY + 2.05, baseZ)
      };
      this.railTargets.push(state);
      this.registerTarget({
        id: `harbor_rail_${i}`,
        pos: state.pos,
        r: 0.72,
        alive: () => state.downT <= 0,
        onHit: (info) => {
          state.downT = 2.6;
          this.scorePoints(info.element === "Ar" ? 25 : 20);
          this.spawnBurst(state.pos, info.element === "Ar" ? [0.7, 0.45, 1.0] : [1.0, 0.84, 0.32], 18, 3.0);
          return { crit: true, label: "🎯 移动星靶 +20" };
        }
      });
    }

    // ROW 3 (16.8m East): 3 Tethered Carnival Star-Balloons + Giant Golden Cat-Crest Bullseye Gong!
    const gongX = bx + 16.6, gongY = this.qt(gongX, bz);
    const gantry = new T.Group();
    gantry.position.set(gongX, gongY, bz);
    gantry.add(
      this.mesh(new T.CylinderGeometry(0.16, 0.20, 4.4, 10), this.m.darkWood, 0, 2.2, -2.0),
      this.mesh(new T.CylinderGeometry(0.16, 0.20, 4.4, 10), this.m.darkWood, 0, 2.2, 2.0),
      this.mesh(new T.BoxGeometry(0.32, 0.26, 4.7), this.m.darkWood, 0, 4.35, 0),
      this.mesh(new T.BoxGeometry(0.42, 0.12, 4.85), this.m.snow, 0, 4.54, 0),
      this.mesh(new T.ConeGeometry(0.32, 0.65, 4), this.m.gold, 0, 4.85, -1.65),
      this.mesh(new T.ConeGeometry(0.32, 0.65, 4), this.m.gold, 0, 4.85, 1.65)
    );
    const gongPiv = new T.Group();
    gongPiv.position.set(0, 4.25, 0);
    gongPiv.add(
      this.mesh(new T.CylinderGeometry(0.025, 0.025, 0.95, 6), this.m.gold, 0, -0.48, -0.75),
      this.mesh(new T.CylinderGeometry(0.025, 0.025, 0.95, 6), this.m.gold, 0, -0.48, 0.75),
      this.mesh(new T.CylinderGeometry(1.18, 1.18, 0.14, 28).rotateZ(Math.PI / 2), this.m.gold, 0, -1.75, 0),
      this.mesh(new T.TorusGeometry(0.95, 0.07, 8, 28).rotateY(Math.PI / 2), this.m.scarlet, -0.09, -1.75, 0),
      this.mesh(new T.SphereGeometry(0.32, 14, 10), this.m.goldGlow, -0.10, -1.75, 0),
      // Adorable cat ears stamped onto the Golden Bullseye Gong!
      this.mesh(new T.ConeGeometry(0.24, 0.52, 4), this.m.goldGlow, -0.05, -0.62, -0.58),
      this.mesh(new T.ConeGeometry(0.24, 0.52, 4), this.m.goldGlow, -0.05, -0.62, 0.58)
    );
    this.gongPivot = gongPiv;
    gantry.add(gongPiv);
    this.group.add(gantry);

    const gongPos = new T.Vector3(gongX, gongY + 2.50, bz);
    this.registerTarget({
      id: "harbor_boss_gong",
      pos: gongPos,
      r: 1.32,
      alive: () => true,
      onHit: (info) => {
        this.gongVel = Math.min(8.5, this.gongVel + (info.heavy ? 6.8 : 4.6));
        const pts = info.element === "Og" ? 50 : 30;
        this.scorePoints(pts);
        this.game.audio && this.game.audio.brassGong && this.game.audio.brassGong(1.0);
        this.spawnBurst(gongPos, [1.0, 0.85, 0.28], 28, 4.4);
        return { crit: true, label: `🔔 金锣正中红心 +${pts}` };
      }
    });

    // 3 Tethered Carnival Balloons bobbing behind the rail!
    const balSpecs = [
      { dz: -3.6, h: 3.8, mat: this.m.pinkGlow, rgb: [1.0, 0.48, 0.88] },
      { dz: 0.0, h: 5.5, mat: this.m.cyanGlow, rgb: [0.32, 0.96, 1.0] },
      { dz: 3.6, h: 3.8, mat: this.m.coralGlow, rgb: [1.0, 0.44, 0.22] }
    ];
    balSpecs.forEach((bs, idx) => {
      const rx = bx + 15.6, rz = bz + bs.dz, ry = this.qt(rx, rz);
      const bg = new T.Group();
      bg.position.set(rx, ry, rz);
      const orb = this.mesh(new T.SphereGeometry(0.55, 16, 12), bs.mat, 0, bs.h, 0);
      orb.scale.set(0.92, 1.12, 0.92);
      const cord = this.mesh(new T.CylinderGeometry(0.015, 0.015, bs.h, 6), this.m.gold, 0, bs.h * 0.5, 0);
      bg.add(orb, cord);
      this.group.add(bg);
      const bState = {
        orb, cord, baseH: bs.h, phase: idx * 2.1, popT: 0,
        pos: new T.Vector3(rx, ry + bs.h, rz)
      };
      this.tetherBalloons.push(bState);
      this.registerTarget({
        id: `harbor_balloon_${idx}`,
        pos: bState.pos,
        r: 0.78,
        alive: () => bState.popT <= 0,
        onHit: () => {
          bState.popT = 5.0;
          bState.orb.visible = false;
          bState.cord.visible = false;
          this.scorePoints(25);
          this.spawnBurst(bState.pos, bs.rgb, 24, 3.8);
          return { crit: true, label: "🎈 击爆星光气球 +25" };
        }
      });
    });

    // Interactive Shooting Challenge Trigger Spot right behind the timber counter!
    world.spots.push({
      id: "harbor_range_start",
      pos: new T.Vector3(bx - 1.2, by + 1.2, bz),
      r: 3.2,
      label: () => {
        if (this.challenge.on) return `靶场挑战进行中 · 当前 ${this.challenge.score} 分`;
        return this.challenge.best > 0
          ? `开启「极其猫靶场」30秒射击挑战（最高 ${this.challenge.best} 分）`
          : "开启「极其猫靶场」30秒元素射击挑战！";
      },
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => this.startChallenge()
    });
  }

  addBottleRack(rx, ry, rz, specs, prefix) {
    const T = this.THREE;
    const g = new T.Group();
    g.position.set(rx, ry, rz);
    // Two sturdy oak barrels + wooden plank shelf holding 3 shootable glowing elixir bottles!
    g.add(
      this.mesh(new T.CylinderGeometry(0.36, 0.34, 0.92, 12), this.m.warmWood, 0, 0.46, -0.82),
      this.mesh(new T.TorusGeometry(0.36, 0.03, 6, 16).rotateX(Math.PI / 2), this.m.iron, 0, 0.25, -0.82),
      this.mesh(new T.TorusGeometry(0.36, 0.03, 6, 16).rotateX(Math.PI / 2), this.m.iron, 0, 0.72, -0.82),
      this.mesh(new T.CylinderGeometry(0.36, 0.34, 0.92, 12), this.m.warmWood, 0, 0.46, 0.82),
      this.mesh(new T.TorusGeometry(0.36, 0.03, 6, 16).rotateX(Math.PI / 2), this.m.iron, 0, 0.25, 0.82),
      this.mesh(new T.TorusGeometry(0.36, 0.03, 6, 16).rotateX(Math.PI / 2), this.m.iron, 0, 0.72, 0.82),
      this.mesh(new T.BoxGeometry(0.56, 0.10, 2.35), this.m.darkWood, 0, 0.96, 0)
    );
    this.group.add(g);
    this.game.world.circles.push({ x: rx, z: rz - 0.82, r: 0.44, top: 1.02 }, { x: rx, z: rz + 0.82, r: 0.44, top: 1.02 });

    specs.forEach((sp, i) => {
      const dz = (i - 1) * 0.74;
      const bg = new T.Group();
      bg.position.set(rx, ry + 1.02, rz + dz);
      bg.add(
        this.mesh(new T.CylinderGeometry(0.11, 0.14, 0.36, 10), sp.mat, 0, 0.18, 0),
        this.mesh(new T.CylinderGeometry(0.055, 0.08, 0.14, 8), this.m.glass, 0, 0.42, 0),
        this.mesh(new T.CylinderGeometry(0.06, 0.06, 0.07, 8), this.m.gold, 0, 0.50, 0)
      );
      this.group.add(bg);
      const bState = { g: bg, brokenT: 0, pos: new T.Vector3(rx, ry + 1.24, rz + dz) };
      this.bottles.push(bState);
      this.registerTarget({
        id: `${prefix}_b${i}`,
        pos: bState.pos,
        r: 0.48,
        alive: () => bState.brokenT <= 0,
        onHit: () => {
          bState.brokenT = 4.2;
          bState.g.visible = false;
          this.scorePoints(15);
          this.game.audio && this.game.audio.glassBreak && this.game.audio.glassBreak(1.0);
          this.spawnBurst(bState.pos, sp.rgb, 20, 3.2);
          return { crit: false, label: `🍾 击碎${sp.name} +15` };
        }
      });
    });
  }

  startChallenge() {
    const ch = this.challenge;
    ch.on = true;
    ch.t = 30.0;
    ch.score = 0;
    ch.hits = 0;
    // Respawn every bottle, rail target & balloon immediately for a fresh round!
    for (const b of this.bottles) { b.brokenT = 0; b.g.visible = true; b.g.scale.setScalar(1); }
    for (const r of this.railTargets) { r.downT = 0; r.flip = 0; }
    for (const bl of this.tetherBalloons) { bl.popT = 0; bl.orb.visible = true; bl.cord.visible = true; }
    // Auto-equip ChemGun if unlocked, else Blaster!
    const t = this.game.tools;
    if (t && t.held !== "chemgun" && t.held !== "blaster") {
      t.equip(t.chemGunUnlocked ? "chemgun" : "blaster");
    }
    this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(2);
    this.game.ui && this.game.ui.toast("🎯 极其猫靶场 30 秒挑战开始！击碎药水瓶、移动星靶、气球与中央大金锣冲刺高分喵！", 4.5);
  }

  // =========================================================================
  // 6. RICH HANDCRAFTED INTERACTIVE SMALL OBJECTS (小物件群 — Harbor + World!)
  // =========================================================================
  addPinwheel(x, z, id) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.add(
      this.mesh(new T.CylinderGeometry(0.18, 0.24, 0.22, 8), this.m.stone, 0, 0.11, 0),
      this.mesh(new T.CylinderGeometry(0.045, 0.055, 2.25, 8), this.m.warmWood, 0, 1.24, 0),
      this.mesh(new T.SphereGeometry(0.08, 10, 8), this.m.gold, 0, 2.34, 0)
    );
    const blades = new T.Group();
    blades.position.set(0, 2.34, 0.12);
    const bMats = [this.m.cyanGlow, this.m.pinkGlow, this.m.goldGlow, this.m.violetGlow];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const vane = this.mesh(new T.BoxGeometry(0.18, 0.56, 0.03), bMats[i], Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0);
      vane.rotation.z = a + Math.PI / 2;
      vane.rotation.x = 0.28;
      blades.add(vane);
    }
    blades.add(this.mesh(new T.SphereGeometry(0.09, 10, 8), this.m.gold, 0, 0, 0.03));
    g.add(blades);
    this.group.add(g);
    this.game.world.circles.push({ x, z, r: 0.24 });

    const st = { obj: blades, speed: 1.6, boost: 0, axis: "z" };
    this.pinwheels.push(st);
    const pos = new T.Vector3(x, y + 2.34, z);
    this.registerTarget({
      id, pos, r: 0.72, alive: () => true,
      onHit: () => {
        st.boost = 22.0;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(0);
        this.spawnBurst(pos, [0.45, 0.94, 1.0], 16, 2.8);
        return { crit: false, label: "🌀 极光风车极速旋转！" };
      }
    });
    this.game.world.spots.push({
      id: `${id}_spot`, pos: new T.Vector3(x, y + 1.1, z), r: 2.3,
      label: "吹转「极光星风车」（也可直接开枪射转它！）",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        st.boost = 22.0;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(0);
        this.spawnBurst(pos, [1.0, 0.72, 0.92], 14, 2.4);
        this.game.ui && this.game.ui.toast("🌀 呼——极光星风车飞速转起来，洒下一圈星尘火花喵！", 2.8);
      }
    });
  }

  addWindChime(x, z, yaw, id) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.add(
      this.mesh(new T.CylinderGeometry(0.06, 0.075, 2.4, 8), this.m.darkWood, -0.78, 1.2, 0),
      this.mesh(new T.CylinderGeometry(0.06, 0.075, 2.4, 8), this.m.darkWood, 0.78, 1.2, 0),
      this.mesh(new T.BoxGeometry(1.9, 0.14, 0.22), this.m.darkWood, 0, 2.42, 0),
      this.mesh(new T.BoxGeometry(1.96, 0.08, 0.26), this.m.snow, 0, 2.52, 0)
    );
    const piv = new T.Group();
    piv.position.set(0, 2.32, 0);
    const mats = [this.m.cyanGlow, this.m.pinkGlow, this.m.goldGlow, this.m.mintGlow, this.m.violetGlow];
    for (let i = 0; i < 5; i++) {
      const cx = (i - 2) * 0.26;
      const len = 0.55 + (i % 3) * 0.18;
      piv.add(
        this.mesh(new T.CylinderGeometry(0.01, 0.01, 0.25, 6), this.m.gold, cx, -0.14, 0),
        this.mesh(new T.CylinderGeometry(0.036, 0.024, len, 8), mats[i], cx, -0.26 - len / 2, 0)
      );
    }
    g.add(piv);
    this.group.add(g);
    const st = { piv, sway: 0, vel: 0, seed: this.chimes.length };
    this.chimes.push(st);
    const pos = new T.Vector3(x, y + 1.85, z);
    this.registerTarget({
      id, pos, r: 0.85, alive: () => true,
      onHit: () => {
        st.vel = 6.2;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(st.seed);
        this.spawnBurst(pos, [0.52, 0.96, 1.0], 14, 2.2);
        return { crit: false, label: "🎐 冰晶风铃奏鸣！" };
      }
    });
    this.game.world.spots.push({
      id: `${id}_spot`, pos: new T.Vector3(x, y + 1.1, z), r: 2.4,
      label: "轻拨「冰晶风铃架」听冬日和弦",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        st.vel = 5.4;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(st.seed);
        this.spawnBurst(pos, [0.52, 0.96, 1.0], 12, 2.0);
        this.game.ui && this.game.ui.toast("🎐 叮铃铃～冰晶风铃在雪风里奏响清脆冬日和弦喵～", 2.8);
      }
    });
  }

  addSnowGlobe(x, z, id) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.add(
      this.mesh(new T.CylinderGeometry(0.46, 0.56, 0.82, 16), this.m.darkWood, 0, 0.41, 0),
      this.mesh(new T.TorusGeometry(0.48, 0.045, 8, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.84, 0),
      this.mesh(new T.SphereGeometry(0.44, 18, 14), this.m.glass, 0, 1.24, 0)
    );
    const inner = new T.Group();
    inner.position.set(0, 1.02, 0);
    inner.add(
      this.mesh(new T.CylinderGeometry(0.32, 0.34, 0.08, 16), this.m.snow, 0, 0.04, 0),
      this.mesh(new T.ConeGeometry(0.14, 0.34, 8), this.m.pine, -0.10, 0.24, -0.05),
      this.mesh(new T.BoxGeometry(0.16, 0.20, 0.16), this.m.cream, 0.10, 0.18, 0.05),
      this.mesh(new T.ConeGeometry(0.14, 0.14, 4).rotateY(Math.PI / 4), this.m.scarlet, 0.10, 0.35, 0.05),
      this.mesh(new T.OctahedronGeometry(0.06, 0), this.m.goldGlow, 0, 0.46, 0)
    );
    g.add(inner);
    this.group.add(g);
    this.game.world.circles.push({ x, z, r: 0.58, top: 1.48 });

    const st = { inner, spin: 0.7, swirlT: 0, pos: new T.Vector3(x, y + 1.24, z) };
    this.snowGlobes.push(st);
    this.registerTarget({
      id, pos: st.pos, r: 0.55, alive: () => true,
      onHit: () => {
        st.swirlT = 3.2;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(2);
        this.spawnBurst(st.pos, [0.85, 0.96, 1.0], 18, 2.2);
        return { crit: false, label: "🔮 摇响雪景水晶球！" };
      }
    });
    this.game.world.spots.push({
      id: `${id}_spot`, pos: st.pos, r: 2.3,
      label: "轻摇「雪景八音水晶球」",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        st.swirlT = 3.2;
        this.game.audio && this.game.audio.chimeChord && this.game.audio.chimeChord(2);
        this.spawnBurst(st.pos, [0.85, 0.96, 1.0], 16, 2.0);
        this.game.ui && this.game.ui.toast("🔮 叮叮咚～水晶球里的迷你雪花和星星旋转飘起来啦，极其极其治愈喵！", 3.5);
      }
    });
  }

  addMailbox(x, z, yaw, id) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.add(
      this.mesh(new T.CylinderGeometry(0.24, 0.30, 0.22, 12), this.m.stone, 0, 0.11, 0),
      this.mesh(new T.CylinderGeometry(0.21, 0.23, 1.05, 14), this.m.scarlet, 0, 0.74, 0),
      this.mesh(new T.SphereGeometry(0.215, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), this.m.scarlet, 0, 1.26, 0),
      this.mesh(new T.TorusGeometry(0.22, 0.032, 6, 18).rotateX(Math.PI / 2), this.m.gold, 0, 1.24, 0),
      this.mesh(new T.BoxGeometry(0.24, 0.06, 0.08), this.m.gold, 0, 1.08, 0.20),
      this.mesh(new T.SphereGeometry(0.06, 8, 6), this.m.gold, 0, 1.50, 0),
      this.mesh(new T.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), this.m.snow, 0, 1.32, 0)
    );
    this.group.add(g);
    this.game.world.circles.push({ x, z, r: 0.32, top: 1.48 });
    this.game.world.spots.push({
      id, pos: new T.Vector3(x, y + 1.0, z), r: 2.3,
      label: "打开「圣诞红铜邮筒」· 收取雪境明信片",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        this.game.audio && this.game.audio.pick && this.game.audio.pick();
        this.game.ui && this.game.ui.toast(POSTCARDS[this.postcardIdx++ % POSTCARDS.length], 6.0);
      }
    });
  }

  addMarshmallowCart(x, z, yaw, id) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.add(
      // Cart body + brass handles + spoked wooden wheels
      this.mesh(new T.BoxGeometry(1.75, 0.72, 0.96), this.m.warmWood, 0, 0.72, 0),
      this.mesh(new T.BoxGeometry(1.86, 0.08, 1.08), this.m.cream, 0, 1.12, 0),
      this.mesh(new T.TorusGeometry(0.36, 0.05, 8, 18), this.m.darkWood, -0.58, 0.38, 0.52),
      this.mesh(new T.TorusGeometry(0.36, 0.05, 8, 18), this.m.darkWood, -0.58, 0.38, -0.52),
      this.mesh(new T.CylinderGeometry(0.04, 0.04, 0.68, 6), this.m.darkWood, 0.72, 0.34, 0.36),
      this.mesh(new T.CylinderGeometry(0.04, 0.04, 0.68, 6), this.m.darkWood, 0.72, 0.34, -0.36),
      // Striped festive canopy posts & pitched mini roof
      this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.25, 6), this.m.gold, -0.82, 1.72, -0.42),
      this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.25, 6), this.m.gold, 0.82, 1.72, -0.42),
      this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.25, 6), this.m.gold, -0.82, 1.72, 0.42),
      this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.25, 6), this.m.gold, 0.82, 1.72, 0.42),
      this.mesh(new T.BoxGeometry(2.05, 0.10, 1.32), this.m.roofRed, 0, 2.38, 0),
      this.mesh(new T.BoxGeometry(2.10, 0.07, 1.36), this.m.snow, 0, 2.46, 0),
      // Glowing mini charcoal roaster & plump cream marshmallow skewers!
      this.mesh(new T.BoxGeometry(0.68, 0.14, 0.52), this.m.iron, -0.35, 1.22, 0),
      this.mesh(new T.BoxGeometry(0.56, 0.06, 0.40), this.m.coralGlow, -0.35, 1.30, 0),
      this.mesh(new T.CylinderGeometry(0.065, 0.065, 0.12, 10), this.m.cream, 0.38, 1.24, -0.14),
      this.mesh(new T.CylinderGeometry(0.065, 0.065, 0.12, 10), this.m.cream, 0.56, 1.24, 0.08),
      this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.goldGlow, 0.82, 2.15, 0.42)
    );
    this.group.add(g);
    this.game.world.circles.push({ x, z, r: 1.05, top: 1.35 });
    this.addLight(x, y + 2.0, z, 0xffbe74, 6.5, 10, false);

    this.game.world.spots.push({
      id, pos: new T.Vector3(x, y + 1.15, z), r: 2.7,
      label: "烤一串焦糖棉花糖与热板栗（满格回温！）",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const gm = this.game;
        gm.cold && (gm.cold.w = 100, gm.cold.wet = 0);
        gm.audio && gm.audio.chimeChord && gm.audio.chimeChord(1);
        gm.character && gm.character.play && gm.character.play("happy");
        this.spawnBurst(new T.Vector3(x, y + 1.45, z), [1.0, 0.78, 0.42], 14, 2.0);
        gm.ui && gm.ui.toast(MARSHMALLOW_LINES[this.snackIdx++ % MARSHMALLOW_LINES.length], 4.8);
      }
    });
  }

  addCozyPicnicSpot(x, z, yaw) {
    const T = this.THREE;
    const y = this.qt(x, z);
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.add(
      // Knit winter picnic blanket + woven basket + steaming cocoa thermos + mini snow-kitty!
      this.mesh(new T.BoxGeometry(2.1, 0.04, 1.65), this.m.scarlet, 0, 0.025, 0),
      this.mesh(new T.BoxGeometry(1.92, 0.045, 1.48), this.m.cream, 0, 0.03, 0),
      this.mesh(new T.BoxGeometry(0.56, 0.34, 0.38), this.m.warmWood, -0.48, 0.21, -0.28),
      this.mesh(new T.TorusGeometry(0.20, 0.025, 6, 14, Math.PI), this.m.gold, -0.48, 0.38, -0.28),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 0.28, 10), this.m.gold, 0.28, 0.18, 0.18),
      this.mesh(new T.CylinderGeometry(0.06, 0.05, 0.11, 8), this.m.pinkGlow, 0.48, 0.10, -0.10),
      // Mini Snow-Kitty figurine sitting on the blanket edge!
      this.mesh(new T.SphereGeometry(0.18, 12, 10), this.m.snow, 0.62, 0.20, -0.42),
      this.mesh(new T.SphereGeometry(0.14, 12, 10), this.m.snow, 0.62, 0.42, -0.42),
      this.mesh(new T.ConeGeometry(0.05, 0.11, 4), this.m.pinkGlow, 0.55, 0.55, -0.42),
      this.mesh(new T.ConeGeometry(0.05, 0.11, 4), this.m.cyanGlow, 0.69, 0.55, -0.42)
    );
    this.group.add(g);
  }

  buildWorldSmallObjects() {
    // A. Inside 「极其猫星港」 Territory
    this.addPinwheel(this.cx - 4.5, this.cz - 3.5, "pw_harbor_1");
    this.addPinwheel(this.cx + 3.5, this.cz + 4.8, "pw_harbor_2");
    this.addWindChime(this.cx + 1.8, this.cz - 5.6, 0.35, "chime_harbor_1");
    this.addMailbox(this.cx - 4.8, this.cz + 2.6, 0.85, "mail_harbor");
    this.addMarshmallowCart(this.cx + 2.2, this.cz + 6.8, -0.45, "cart_harbor");
    this.addCozyPicnicSpot(this.cx + 6.5, this.cz + 2.2, 0.4);

    // B. Right outside 「极其猫实验室」 Porch (so freshly unlocked ChemGun can IMMEDIATELY plink glowing bottles & spin pinwheels!)
    const lab = (this.re && this.re.chemlab) || { x: 76, z: 102 };
    const labBottleSpecs = [
      { mat: this.m.cyanGlow, rgb: [0.32, 0.96, 1.0], name: "1 H 蓝瓶" },
      { mat: this.m.coralGlow, rgb: [1.0, 0.42, 0.22], name: "10 Ne 橙瓶" },
      { mat: this.m.violetGlow, rgb: [0.68, 0.44, 1.0], name: "18 Ar 紫瓶" }
    ];
    this.addBottleRack(lab.x + 8.6, this.qt(lab.x + 8.6, lab.z + 3.5), lab.z + 3.5, labBottleSpecs, "lab_porch");
    this.addSnowGlobe(lab.x - 7.6, lab.z + 5.8, "lab_globe");
    this.addPinwheel(lab.x - 6.8, lab.z + 9.2, "pw_lab");

    // C. Charming Small Objects enriching 「极其猫乐园」 & Claude Castle Path!
    const cat = (this.re && this.re.cathome) || { x: 52, z: 64 };
    this.addMailbox(cat.x - 14.5, cat.z + 3.2, 1.1, "mail_cathome");
    this.addWindChime(cat.x - 9.2, cat.z + 9.5, -0.4, "chime_cathome");
    this.addCozyPicnicSpot(cat.x + 7.5, cat.z - 8.2, -0.6);

    // Claude's Castle / Start Clearing cozy touches (kept completely clear of roads & doors!)
    this.addMailbox(-2.4, 4.8, 0.35, "mail_castle");
    this.addMarshmallowCart(8.5, 9.8, -0.75, "cart_clearing");
    this.addPinwheel(-11.8, 14.5, "pw_clearing");
    this.addWindChime(-14.2, -2.5, 0.6, "chime_clearing");
  }

  // =========================================================================
  // FRAME UPDATE (Lighthouse Beam, Moving Targets, Respawns & Challenge HUD!)
  // =========================================================================
  update(dt, time) {
    const g = this.game;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;

    // 1. Dynamic Harbor Lights & Sweeping Lighthouse Searchlight!
    for (const l of this.lights) {
      const flick = 0.94 + 0.06 * Math.sin(time * 4.5 + l.phase);
      l.light.intensity = l.power * (l.always ? 0.65 + 0.35 * lamps : lamps) * flick;
    }
    if (this.beaconPulse > 0) this.beaconPulse = Math.max(0, this.beaconPulse - dt);
    if (this.beaconRot) {
      this.beaconRot.rotation.y += dt * (0.48 + this.beaconPulse * 0.95);
    }

    // 2. Spinning Starlight Pinwheels & Overdrive Core!
    for (const pw of this.pinwheels) {
      if (pw.boost > 0) pw.boost = Math.max(0, pw.boost - dt * 5.2);
      const spd = pw.speed + pw.boost;
      if (pw.axis === "y") pw.obj.rotation.y += dt * spd;
      else pw.obj.rotation.z += dt * spd;
    }

    // 3. Swaying Musical Frost Wind-Chimes!
    for (const ch of this.chimes) {
      ch.vel += (-28 * ch.sway - 3.6 * ch.vel) * dt;
      ch.sway += ch.vel * dt;
      ch.piv.rotation.x = ch.sway * 0.25 + Math.sin(time * 1.6 + ch.seed) * 0.04;
    }

    // 4. Swirling Snow-Globes!
    for (const sg of this.snowGlobes) {
      if (sg.swirlT > 0) sg.swirlT = Math.max(0, sg.swirlT - dt);
      sg.inner.rotation.y += dt * (sg.spin + sg.swirlT * 3.8);
    }

    // 5. Golden Cat-Crest Bullseye Gong Pendulum!
    if (this.gongPivot) {
      this.gongVel += (-26 * this.gongSwing - 3.0 * this.gongVel) * dt;
      this.gongSwing += this.gongVel * dt;
      this.gongPivot.rotation.z = this.gongSwing * 0.22;
    }

    // 6. Breakable Glowing Elixir Bottles Respawn Animation!
    for (const b of this.bottles) {
      if (b.brokenT > 0) {
        b.brokenT -= dt;
        if (b.brokenT <= 0) {
          b.g.visible = true;
          b.g.scale.setScalar(0.1);
        }
      } else if (b.g.visible && b.g.scale.x < 0.999) {
        const s = Math.min(1, b.g.scale.x + dt * 4.5);
        b.g.scale.setScalar(s);
      }
    }

    // 7. Moving Sliding Rail Star-Targets!
    for (const rt of this.railTargets) {
      const z = rt.baseZ + Math.sin(time * rt.spd + rt.phase) * rt.amp;
      rt.g.position.z = z;
      rt.pos.set(rt.baseX, rt.baseY + 0.65, z);
      if (rt.downT > 0) {
        rt.downT = Math.max(0, rt.downT - dt);
        rt.flip += (1 - rt.flip) * (1 - Math.exp(-12 * dt));
      } else {
        rt.flip += (0 - rt.flip) * (1 - Math.exp(-9 * dt));
      }
      rt.g.rotation.z = -rt.flip * 1.48;
    }

    // 8. Tethered Carnival Star-Balloons Bobbing & Reinflation!
    for (const bl of this.tetherBalloons) {
      if (bl.popT > 0) {
        bl.popT -= dt;
        if (bl.popT <= 0) {
          bl.orb.visible = true;
          bl.cord.visible = true;
        }
      } else {
        const bob = Math.sin(time * 2.1 + bl.phase) * 0.24;
        bl.orb.position.y = bl.baseH + bob;
        bl.pos.y = bl.orb.parent.position.y + bl.baseH + bob;
      }
    }

    // 9. 30-Second Shooting Challenge Timer & HUD!
    const ch = this.challenge;
    if (ch.on) {
      ch.t -= dt;
      g.ui && g.ui.skiHud && g.ui.skiHud(`🎯 极其猫靶场 <b>${Math.max(0, Math.ceil(ch.t))}</b> 秒 · 得分 <b>${ch.score}</b>（命中 ${ch.hits}）`);
      const dist = Math.hypot(g.player.pos.x - (this.cx + 7.2), g.player.pos.z - (this.cz - 9.0));
      if (ch.t <= 0 || dist > 26) {
        ch.on = false;
        g.ui && g.ui.skiHud && g.ui.skiHud("");
        if (dist > 26) {
          g.ui && g.ui.toast("离开了极其猫靶场，本轮计分结束喵～", 3.0);
        } else {
          const isRec = ch.score > ch.best;
          if (isRec) {
            ch.best = ch.score;
            try { localStorage.setItem(HARBOR_BEST_KEY, String(ch.best)); } catch {}
          }
          g.audio && g.audio.brassGong && g.audio.brassGong(0.9);
          g.character && g.character.play && g.character.play("cheer");
          g.ui && g.ui.toast(
            `🎯 极其猫靶场挑战结束！总分 ${ch.score} 分（命中 ${ch.hits} 次）${isRec ? " · 🏆 刷新最高纪录！！" : `（历史最高 ${ch.best} 分）`}`,
            6.5
          );
        }
      }
    }
  }
}
