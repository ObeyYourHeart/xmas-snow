// 雪境建筑细节升级 + 扩展地图三大全新奇观地标模块 (js/worldplus.js)
// 1. 升级已有建筑细节：林间温泉日式雪汤亭与石灯笼/浮柚子、热可可小摊露台餐桌、圣诞集市彩旗灯串广场、
//    篝火铁锅架与毛毯木凳、圣诞树礼盒花坛、冰湖栈道铜灯、冰晶琴符文法阵、瞭望塔与山顶观景台望远镜！
// 2. 新增三大扩图奇观地标：
//    - 极光观星坛 (-138, -118)：巨型旋转星仪与「极光许愿星钟」（敲响召唤满天流星雨！）
//    - 冬日姜饼钟楼 (-118, 134)：三层糖霜姜饼钟楼与实时走针大钟、旋转拐杖糖风车、报时糖果星雨！
//    - 幽蓝冰瀑秘境 (118, -124)：多层冰川蓝冻结冰瀑、半透明琉璃冰洞与「霜风祝福共鸣晶石」！

export class WorldPlus {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;
    this.j = helpers.j;
    this.THREE = game.THREE;

    this.group = null;
    this.m = {};
    this.spinners = [];
    this.floaters = [];
    this.clockHands = [];
    this.emissives = [];
    this.lights = [];
    this.meteors = [];
    this.frostBlessT = 0;
    this.blessSparkAcc = 0;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  addLight(x, y, z, color, power, dist = 14) {
    const l = new this.THREE.PointLight(color, 0, dist, 1.5);
    l.position.set(x, y, z);
    this.group.add(l);
    this.lights.push({ light: l, power });
    return l;
  }

  makeSign(text, w = 2.4, h = 0.50, bg = "#1c2444", border = "#f7cf6c") {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 112;
    const c = cv.getContext("2d");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 112);
    c.strokeStyle = border;
    c.lineWidth = 7;
    c.strokeRect(7, 7, 498, 98);
    c.fillStyle = "#fff8e8";
    c.font = '700 44px "Microsoft YaHei", "PingFang SC", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 58);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    const mat = this.wrapMat(new T.MeshStandardMaterial({
      map: tex,
      emissive: new T.Color(0.35, 0.30, 0.20),
      emissiveIntensity: 0.35,
      roughness: 0.45
    }), { key: "plain" });
    return this.mesh(new T.BoxGeometry(w, h, 0.08), mat);
  }

  makeClockFaceTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = "#fff5dc";
    c.beginPath(); c.arc(128, 128, 122, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#d99d30";
    c.lineWidth = 14;
    c.stroke();
    c.strokeStyle = "#6c3618";
    c.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.beginPath();
      c.moveTo(128 + Math.cos(a) * 86, 128 + Math.sin(a) * 86);
      c.lineTo(128 + Math.cos(a) * 106, 128 + Math.sin(a) * 106);
      c.stroke();
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  build() {
    const T = this.THREE;
    const { scene, explore } = this.game;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.55, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    this.m = {
      wood: std(0x6e4427, 0.80),
      darkWood: std(0x3f2414, 0.85),
      redWood: std(0xa62622, 0.62),
      ginger: std(0xb96c35, 0.72),
      icing: std(0xfaf7f2, 0.42),
      snow: std(0xf4f8ff, 0.60),
      marble: std(0xeaeff7, 0.34, { metalness: 0.08 }),
      stone: std(0x6f7a88, 0.82),
      gold: std(0xf7cc5c, 0.20, { metalness: 0.88 }),
      brass: std(0xd8a642, 0.26, { metalness: 0.82 }),
      plaid: std(0xb52b2b, 0.82),
      pine: std(0x1f5c39, 0.78),
      yuzu: std(0xffbf24, 0.32, { emissive: new T.Color(0.55, 0.32, 0.02), emissiveIntensity: 0.25 }),
      warmGlow: plain(new T.MeshStandardMaterial({
        color: 0xffe4a0, emissive: new T.Color(1.0, 0.74, 0.28), emissiveIntensity: 1.5, roughness: 0.2
      })),
      cyanIce: plain(new T.MeshPhysicalMaterial({
        color: 0x62e2ff, emissive: new T.Color(0.14, 0.58, 0.88), emissiveIntensity: 0.52,
        roughness: 0.10, metalness: 0.06, clearcoat: 1.0, transparent: true, opacity: 0.82
      })),
      deepIce: plain(new T.MeshPhysicalMaterial({
        color: 0x2278b8, emissive: new T.Color(0.06, 0.32, 0.62), emissiveIntensity: 0.42,
        roughness: 0.14, clearcoat: 0.9, transparent: true, opacity: 0.86
      })),
      pinkGlow: plain(new T.MeshStandardMaterial({
        color: 0xff8ce0, emissive: new T.Color(0.95, 0.36, 0.84), emissiveIntensity: 1.35, roughness: 0.15
      })),
      cyanGlow: plain(new T.MeshStandardMaterial({
        color: 0x68f4ff, emissive: new T.Color(0.22, 0.88, 1.0), emissiveIntensity: 1.35, roughness: 0.15
      })),
      mintGlow: plain(new T.MeshStandardMaterial({
        color: 0x6dffbe, emissive: new T.Color(0.18, 0.90, 0.58), emissiveIntensity: 1.25, roughness: 0.18
      })),
      ribbonRed: std(0xd42c34, 0.38),
      ribbonBlue: std(0x3a78e8, 0.38),
      ribbonGold: std(0xf2c249, 0.28, { metalness: 0.45 })
    };
    this.emissives.push(
      { mat: this.m.warmGlow, day: 0.75, night: 2.2 },
      { mat: this.m.cyanGlow, day: 0.95, night: 2.1 },
      { mat: this.m.pinkGlow, day: 0.95, night: 2.1 },
      { mat: this.m.mintGlow, day: 0.85, night: 1.95 }
    );

    const root = this.group = new T.Group();
    root.name = "world_plus";
    scene.add(root);

    // PART A: Upgrade details on existing landmarks & buildings!
    this.upgradeHotSpring();
    this.upgradeCocoaStall();
    this.upgradeMarket();
    this.upgradeCampfireAndTree();
    this.upgradeDockCrystalsAndLookouts();

    // PART B: Build 3 Brand-New Major Outer-Realm Expanded Landmarks!
    this.buildObservatory();
    this.buildGingerbreadClocktower();
    this.buildIcefallSanctuary();

    // Register the 3 brand-new expanded landmarks on O.explore.sites so they appear on the M map!
    if (explore && explore.sites) {
      const addSite = (id, name, x, z, r) => {
        if (!explore.sites.some((s) => s.id === id)) {
          explore.sites.push({ id, name, x, z, r, found: false });
        }
      };
      addSite("observatory", "极光观星坛", this.re.observatory.x, this.re.observatory.z, 14);
      addSite("clocktower", "姜饼钟楼广场", this.re.clocktower.x, this.re.clocktower.z, 14);
      addSite("icefall", "幽蓝冰瀑秘境", this.re.icefall.x, this.re.icefall.z, 14);
    }

    return this;
  }

  // =========================================================================
  // PART A: ARCHITECTURAL & COZY DETAIL UPGRADES TO EXISTING BUILDINGS
  // =========================================================================

  // A1. 林间温泉 (-34, 0): Snow-capped Torii/Pavilion Arch, Stone Tōrō Lanterns, Bamboo Spout & Floating Yuzu!
  upgradeHotSpring() {
    const T = this.THREE;
    const { world } = this.game;
    const sp = this.re.spring;
    const x0 = sp.x, z0 = sp.z, y0 = this.qt(x0, z0);
    const g = new T.Group();
    g.position.set(x0, y0, z0);

    // Classic red-cedar snow-capped Onsen Torii Arch framing the north entrance!
    const arch = new T.Group();
    arch.position.set(0, 0, -3.55);
    arch.add(
      this.mesh(new T.CylinderGeometry(0.14, 0.17, 3.1, 10), this.m.redWood, -1.45, 1.55, 0),
      this.mesh(new T.CylinderGeometry(0.14, 0.17, 3.1, 10), this.m.redWood, 1.45, 1.55, 0),
      this.mesh(new T.CylinderGeometry(0.22, 0.24, 0.34, 10), this.m.stone, -1.45, 0.17, 0),
      this.mesh(new T.CylinderGeometry(0.22, 0.24, 0.34, 10), this.m.stone, 1.45, 0.17, 0),
      this.mesh(new T.BoxGeometry(3.85, 0.20, 0.28), this.m.redWood, 0, 2.95, 0),
      this.mesh(new T.BoxGeometry(3.30, 0.14, 0.20), this.m.redWood, 0, 2.48, 0),
      this.mesh(new T.BoxGeometry(4.05, 0.14, 0.34), this.m.darkWood, 0, 3.12, 0),
      this.mesh(new T.BoxGeometry(4.02, 0.12, 0.32), this.m.snow, 0, 3.24, 0),
      this.makeSign("林 间 雪 汤", 1.55, 0.36, "#4a1c17", "#f5ce69")
    );
    arch.children[arch.children.length - 1].position.set(0, 2.72, 0.14);
    g.add(arch);
    world.circles.push({ x: x0 - 1.45, z: z0 - 3.55, r: 0.24 }, { x: x0 + 1.45, z: z0 - 3.55, r: 0.24 });

    // 4 Carved Stone Tōrō Lanterns around the steaming spring!
    for (const [lx, lz] of [[-3.15, -1.8], [3.15, -1.8], [-3.05, 2.1], [3.05, 2.1]]) {
      const lt = new T.Group();
      lt.position.set(lx, 0, lz);
      lt.add(
        this.mesh(new T.CylinderGeometry(0.20, 0.26, 0.72, 6), this.m.stone, 0, 0.36, 0),
        this.mesh(new T.BoxGeometry(0.46, 0.12, 0.46), this.m.stone, 0, 0.76, 0),
        this.mesh(new T.BoxGeometry(0.32, 0.34, 0.32), this.m.warmGlow, 0, 0.98, 0),
        this.mesh(new T.ConeGeometry(0.44, 0.30, 6), this.m.stone, 0, 1.30, 0),
        this.mesh(new T.ConeGeometry(0.40, 0.16, 6), this.m.snow, 0, 1.44, 0)
      );
      g.add(lt);
      world.circles.push({ x: x0 + lx, z: z0 + lz, r: 0.30 });
    }
    this.addLight(x0, y0 + 2.3, z0 - 3.4, 0xffb866, 9, 14);

    // Bamboo hot-water spout pouring shimmering stream into the east side of the pool!
    const spout = new T.Group();
    spout.position.set(2.55, 0.35, 0);
    const pipe = this.mesh(new T.CylinderGeometry(0.06, 0.065, 1.15, 8), this.m.pine, 0, 0.42, 0);
    pipe.rotation.z = 1.15;
    const stream = this.mesh(new T.CylinderGeometry(0.032, 0.045, 0.72, 8), this.m.cyanIce, -0.52, 0.05, 0);
    stream.rotation.z = 0.22;
    spout.add(
      this.mesh(new T.CylinderGeometry(0.05, 0.06, 0.9, 6), this.m.wood, 0.35, 0.22, 0),
      pipe, stream
    );
    g.add(spout);

    // 7 Bright Golden Winter Yuzu fruits & a floating wooden bath tray bobbing on the steaming pool!
    for (let i = 0; i < 7; i++) {
      const a = i * 0.92 + 0.4;
      const r = 0.55 + (i % 3) * 0.52;
      const yz = this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.yuzu, Math.cos(a) * r, 0.11, Math.sin(a) * r);
      yz.scale.set(1.05, 0.88, 1.05);
      g.add(yz);
      this.floaters.push({ obj: yz, baseY: 0.11, amp: 0.024, ph: i * 1.4 });
    }
    const tray = new T.Group();
    tray.position.set(-0.85, 0.13, 0.55);
    tray.add(
      this.mesh(new T.CylinderGeometry(0.32, 0.28, 0.05, 16), this.m.wood, 0, 0, 0),
      this.mesh(new T.CylinderGeometry(0.065, 0.055, 0.13, 10), this.m.icing, -0.10, 0.09, 0.03),
      this.mesh(new T.CylinderGeometry(0.055, 0.075, 0.18, 10), this.m.redWood, 0.11, 0.11, -0.04)
    );
    g.add(tray);
    this.floaters.push({ obj: tray, baseY: 0.13, amp: 0.018, ph: 2.2, spin: 0.22 });

    this.group.add(g);
  }

  // A2. 热可可小摊 (7.5, 15.5): Warm Bistro Seating Tables, Cocoa Mugs, Candle Lanterns & Garland!
  upgradeCocoaStall() {
    const T = this.THREE;
    const { world } = this.game;
    const st = this.re.stall;
    const g = new T.Group();
    for (const [dx, dz] of [[2.8, 1.5], [-2.5, 2.3]]) {
      const tx = st.x + dx, tz = st.z + dz, ty = this.qt(tx, tz);
      const tbl = new T.Group();
      tbl.position.set(tx, ty, tz);
      tbl.add(
        this.mesh(new T.CylinderGeometry(0.62, 0.62, 0.08, 18), this.m.wood, 0, 0.78, 0),
        this.mesh(new T.CylinderGeometry(0.10, 0.16, 0.78, 10), this.m.darkWood, 0, 0.39, 0),
        this.mesh(new T.CylinderGeometry(0.32, 0.36, 0.06, 14), this.m.darkWood, 0, 0.03, 0),
        // Two steaming mugs + glowing brass tabletop candle lantern + gingerbread plate!
        this.mesh(new T.CylinderGeometry(0.07, 0.06, 0.14, 10), this.m.redWood, -0.24, 0.89, 0.14),
        this.mesh(new T.CylinderGeometry(0.07, 0.06, 0.14, 10), this.m.icing, 0.22, 0.89, -0.16),
        this.mesh(new T.CylinderGeometry(0.16, 0.14, 0.03, 14), this.m.gold, 0.18, 0.835, 0.22),
        this.mesh(new T.CylinderGeometry(0.075, 0.085, 0.18, 8), this.m.warmGlow, 0, 0.91, 0),
        this.mesh(new T.ConeGeometry(0.11, 0.10, 8), this.m.brass, 0, 1.04, 0)
      );
      // Pair of cozy snow-dusted wooden stools beside each table
      for (const sa of [0.6, 3.7]) {
        const sx = Math.cos(sa) * 0.92, sz = Math.sin(sa) * 0.92;
        tbl.add(
          this.mesh(new T.CylinderGeometry(0.22, 0.20, 0.06, 12), this.m.wood, sx, 0.46, sz),
          this.mesh(new T.CylinderGeometry(0.06, 0.08, 0.46, 8), this.m.darkWood, sx, 0.23, sz)
        );
      }
      g.add(tbl);
      world.circles.push({ x: tx, z: tz, r: 0.70 });
    }
    this.group.add(g);
  }

  // A3. 圣诞集市 (9, 119): Overhead Fairy-Light Garlands, Festive Bunting, Central Gift Pedestal & Benches!
  upgradeMarket() {
    const T = this.THREE;
    const { world } = this.game;
    const mk = this.re.market;
    const cx = mk.x, cz = mk.z, cy = this.qt(cx, cz);
    const g = new T.Group();
    g.position.set(cx, cy, cz);

    // 4 Festive Corner Lantern Poles with overhead crisscrossing fairy-light strings & colorful bunting!
    const corners = [[-9.2, -7.8], [9.2, -7.8], [9.2, 8.2], [-9.2, 8.2]];
    for (const [px, pz] of corners) {
      g.add(
        this.mesh(new T.CylinderGeometry(0.09, 0.12, 4.4, 8), this.m.darkWood, px, 2.2, pz),
        this.mesh(new T.TorusGeometry(0.14, 0.03, 6, 14).rotateX(Math.PI / 2), this.m.gold, px, 4.35, pz),
        this.mesh(new T.SphereGeometry(0.20, 12, 10), this.m.warmGlow, px, 4.58, pz)
      );
      world.circles.push({ x: cx + px, z: cz + pz, r: 0.20 });
    }
    // Crisscrossing overhead fairy garlands!
    const pairs = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
    const bulbMats = [this.m.warmGlow, this.m.pinkGlow, this.m.cyanGlow, this.m.mintGlow];
    const flagMats = [this.m.ribbonRed, this.m.gold, this.m.ribbonBlue, this.m.icing];
    const flagGeo = new T.ConeGeometry(0.16, 0.34, 3);
    flagGeo.rotateX(Math.PI);
    for (let pi = 0; pi < pairs.length; pi++) {
      const [a, b] = pairs[pi];
      const [x1, z1] = corners[a], [x2, z2] = corners[b];
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12;
        const sag = Math.sin(u * Math.PI) * 0.92;
        pts.push(new T.Vector3(x1 + (x2 - x1) * u, 4.28 - sag, z1 + (z2 - z1) * u));
      }
      const curve = new T.CatmullRomCurve3(pts);
      g.add(this.mesh(new T.TubeGeometry(curve, 16, 0.018, 5, false), this.m.darkWood));
      for (let k = 1; k < 12; k++) {
        const pt = curve.getPointAt(k / 12);
        g.add(this.mesh(new T.SphereGeometry(0.085, 8, 6), bulbMats[(k + pi) % bulbMats.length], pt.x, pt.y - 0.09, pt.z));
        if (k % 2 === 0) {
          const fl = this.mesh(flagGeo, flagMats[(k + pi) % flagMats.length], pt.x, pt.y - 0.22, pt.z);
          g.add(fl);
        }
      }
    }
    this.addLight(cx, cy + 4.2, cz, 0xffcf7a, 14, 24);

    // Central Illuminated Holiday Market Gift-Tree Display Pedestal!
    const mid = new T.Group();
    mid.position.set(0, 0, -0.5);
    mid.add(
      this.mesh(new T.CylinderGeometry(1.45, 1.65, 0.42, 20), this.m.marble, 0, 0.21, 0),
      this.mesh(new T.TorusGeometry(1.46, 0.055, 8, 28).rotateX(Math.PI / 2), this.m.gold, 0, 0.43, 0),
      this.mesh(new T.ConeGeometry(0.88, 1.55, 12), this.m.pine, 0, 1.25, 0),
      this.mesh(new T.ConeGeometry(0.65, 1.25, 12), this.m.pine, 0, 2.05, 0),
      this.mesh(new T.OctahedronGeometry(0.26, 0), this.m.gold, 0, 2.86, 0)
    );
    const giftColors = [this.m.ribbonRed, this.m.ribbonBlue, this.m.gold, this.m.pinkGlow];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const gx = Math.cos(a) * 0.96, gz = Math.sin(a) * 0.96;
      mid.add(
        this.mesh(new T.BoxGeometry(0.42, 0.36, 0.42), giftColors[k % 4], gx, 0.60, gz),
        this.mesh(new T.BoxGeometry(0.45, 0.08, 0.10), this.m.gold, gx, 0.78, gz)
      );
    }
    this.spinners.push({ obj: mid.children[4], speed: 1.4 });
    g.add(mid);
    world.circles.push({ x: cx, z: cz - 0.5, r: 1.65 });

    this.group.add(g);
  }

  // A4. 中心篝火 (-17.5, 9) & 圣诞树 (14.5, 5): Campfire Kettle Tripod, Plaid Benches & Luxury Gift Clusters!
  upgradeCampfireAndTree() {
    const T = this.THREE;
    const { world } = this.game;
    // Campfire iron kettle tripod + cozy plaid log benches
    const fx = this.j.fire.x, fz = this.j.fire.z, fy = this.qt(fx, fz);
    const fg = new T.Group();
    fg.position.set(fx, fy, fz);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const leg = this.mesh(new T.CylinderGeometry(0.032, 0.042, 2.35, 6), this.m.darkWood, Math.cos(a) * 0.65, 1.05, Math.sin(a) * 0.65);
      leg.rotation.set(Math.sin(a) * 0.30, 0, -Math.cos(a) * 0.30);
      fg.add(leg);
    }
    // Hanging iron kettle simmering right over the campfire!
    fg.add(
      this.mesh(new T.CylinderGeometry(0.015, 0.015, 0.72, 6), this.m.brass, 0, 1.72, 0),
      this.mesh(new T.SphereGeometry(0.24, 14, 10), this.m.darkWood, 0, 1.24, 0),
      this.mesh(new T.TorusGeometry(0.24, 0.025, 6, 16), this.m.brass, 0, 1.38, 0)
    );
    // Two cozy plaid-draped log benches facing the warm fire
    for (const a of [0.85, 2.35]) {
      const bx = Math.cos(a) * 3.1, bz = Math.sin(a) * 3.1;
      const bench = new T.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = -a + Math.PI / 2;
      bench.add(
        this.mesh(new T.CylinderGeometry(0.22, 0.22, 1.9, 10).rotateZ(Math.PI / 2), this.m.wood, 0, 0.36, 0),
        this.mesh(new T.BoxGeometry(0.85, 0.08, 0.48), this.m.plaid, 0.22, 0.56, 0)
      );
      fg.add(bench);
      world.circles.push({ x: fx + bx, z: fz + bz, r: 0.72 });
    }
    this.group.add(fg);

    // Central Christmas Tree: gilded plinth ring & wrapped luxury gift boxes around base!
    const tx = this.j.xmas.x, tz = this.j.xmas.z, ty = this.qt(tx, tz);
    const tg = new T.Group();
    tg.position.set(tx, ty, tz);
    tg.add(this.mesh(new T.TorusGeometry(3.05, 0.14, 8, 36).rotateX(Math.PI / 2), this.m.gold, 0, 0.12, 0));
    const gMats = [this.m.ribbonRed, this.m.ribbonBlue, this.m.gold, this.m.pinkGlow, this.m.cyanGlow];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.2;
      const r = 2.25 + (i % 2) * 0.45;
      const w = 0.48 + (i % 3) * 0.14, h = 0.38 + ((i + 1) % 3) * 0.16;
      const box = new T.Group();
      box.position.set(Math.cos(a) * r, h / 2 + 0.04, Math.sin(a) * r);
      box.rotation.y = a + 0.4;
      box.add(
        this.mesh(new T.BoxGeometry(w, h, w), gMats[i % gMats.length]),
        this.mesh(new T.BoxGeometry(w + 0.03, h + 0.02, 0.09), this.m.gold),
        this.mesh(new T.BoxGeometry(0.09, h + 0.02, w + 0.03), this.m.gold)
      );
      tg.add(box);
    }
    this.group.add(tg);
  }

  // A5. 冰湖木栈道, 冰晶琴, 瞭望塔 & 山顶观景台细节升级
  upgradeDockCrystalsAndLookouts() {
    const T = this.THREE;
    const { world } = this.game;

    // 1) Ice Lake Wooden Dock: warm brass pier lantern posts & wooden fishing basket!
    if (world && world.dock) {
      const dk = world.dock;
      const px = -dk.uz, pz = dk.ux; // perpendicular across dock width
      for (const side of [-1, 1]) {
        const lx = dk.x + dk.ux * 1.65 + px * side * 0.92;
        const lz = dk.z + dk.uz * 1.65 + pz * side * 0.92;
        const post = new T.Group();
        post.position.set(lx, dk.y, lz);
        post.add(
          this.mesh(new T.CylinderGeometry(0.055, 0.07, 1.55, 8), this.m.darkWood, 0, 0.77, 0),
          this.mesh(new T.BoxGeometry(0.24, 0.32, 0.24), this.m.warmGlow, 0, 1.62, 0),
          this.mesh(new T.ConeGeometry(0.22, 0.18, 4), this.m.brass, 0, 1.86, 0)
        );
        this.group.add(post);
      }
      this.addLight(dk.x + dk.ux * 1.65, dk.y + 1.8, dk.z + dk.uz * 1.65, 0xffc874, 10, 16);
    }

    // 2) Singing Ice Crystals (冰晶琴): glowing frost-rune mosaic circle & hovering musical star orbs!
    if (this.re.crystals) {
      const cr = this.re.crystals;
      const cy = this.qt(cr.x, cr.z);
      const cg = new T.Group();
      cg.position.set(cr.x, cy + 0.04, cr.z);
      cg.add(
        this.mesh(new T.TorusGeometry(5.1, 0.08, 8, 48).rotateX(Math.PI / 2), this.m.cyanGlow),
        this.mesh(new T.TorusGeometry(3.5, 0.05, 6, 40).rotateX(Math.PI / 2), this.m.pinkGlow)
      );
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const orb = this.mesh(new T.OctahedronGeometry(0.20, 0), i % 2 ? this.m.cyanGlow : this.m.pinkGlow, Math.cos(a) * 4.4, 3.1, Math.sin(a) * 4.4);
        cg.add(orb);
        this.floaters.push({ obj: orb, baseY: 3.1, amp: 0.24, ph: i * 1.1, spin: 1.8 });
      }
      this.group.add(cg);
    }

    // 3) Summit Lookout (山顶观景台): brass panoramic telescope + golden night beacon!
    if (this.re.lookout) {
      const lk = this.re.lookout;
      const ly = this.qt(lk.x, lk.z) + 0.50;
      const tele = new T.Group();
      tele.position.set(lk.x - 1.35, ly, lk.z + 0.95);
      tele.rotation.y = 2.4;
      const barrel = this.mesh(new T.CylinderGeometry(0.075, 0.052, 0.92, 12).rotateX(Math.PI / 2), this.m.brass, 0, 1.12, 0.12);
      barrel.rotation.x = 0.12;
      tele.add(
        this.mesh(new T.CylinderGeometry(0.05, 0.09, 1.05, 10), this.m.darkWood, 0, 0.52, 0),
        barrel,
        this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.cyanGlow, 0, 1.06, 0.56)
      );
      this.group.add(tele);
      this.addLight(lk.x, ly + 2.4, lk.z, 0xffd27a, 12, 22);
    }

    // 4) Forest Watchtower (瞭望塔): glowing golden summit beacon star visible across the entire valley!
    if (this.re.tower) {
      const tw = this.re.tower;
      const ty = this.qt(tw.x, tw.z);
      const beacon = this.mesh(new T.OctahedronGeometry(0.42, 0), this.m.warmGlow, tw.x, ty + 11.4, tw.z);
      this.spinners.push({ obj: beacon, speed: 1.6 });
      this.group.add(beacon);
      this.addLight(tw.x, ty + 11.4, tw.z, 0xffcf76, 14, 26);
    }
  }

  // =========================================================================
  // PART B: 3 BRAND-NEW EXPANDED OUTER-REALM LANDMARKS!
  // =========================================================================

  // B1. 「极光观星坛」 (Aurora Starlight Observatory Plaza at (-138, -118))
  buildObservatory() {
    const T = this.THREE;
    const { world } = this.game;
    const ob = this.re.observatory;
    const x0 = ob.x, z0 = ob.z, y0 = this.qt(x0, z0);
    const g = new T.Group();
    g.position.set(x0, y0, z0);

    // Raised octagonal white-marble & ice-crystal starlight observatory terrace (walkable!)
    const deckH = 0.45;
    g.add(
      this.mesh(new T.CylinderGeometry(7.6, 8.3, deckH, 8), this.m.marble, 0, deckH / 2, 0),
      this.mesh(new T.TorusGeometry(7.55, 0.14, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, deckH + 0.04, 0),
      this.mesh(new T.TorusGeometry(4.6, 0.08, 8, 40).rotateX(Math.PI / 2), this.m.cyanGlow, 0, deckH + 0.03, 0),
      this.mesh(new T.TorusGeometry(2.6, 0.06, 6, 32).rotateX(Math.PI / 2), this.m.pinkGlow, 0, deckH + 0.03, 0)
    );
    world.platforms.push({
      test: (x, z) => Math.hypot(x - x0, z - z0) < 7.8,
      y: () => y0 + deckH
    });

    // Soaring Golden & Crystal Astrological Arch spanning the north side of the plaza!
    const archCurve = new T.CatmullRomCurve3([
      new T.Vector3(-4.8, deckH, -2.2),
      new T.Vector3(-3.8, 5.4, -2.2),
      new T.Vector3(0, 7.6, -2.2),
      new T.Vector3(3.8, 5.4, -2.2),
      new T.Vector3(4.8, deckH, -2.2)
    ]);
    g.add(
      this.mesh(new T.TubeGeometry(archCurve, 32, 0.24, 10, false), this.m.gold),
      this.mesh(new T.TubeGeometry(archCurve, 32, 0.11, 8, false), this.m.cyanGlow, 0, -0.34, 0)
    );

    // 4 Star-Lantern Marble Pillars ringing the observatory
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const px = Math.cos(a) * 6.4, pz = Math.sin(a) * 6.4;
      g.add(
        this.mesh(new T.CylinderGeometry(0.28, 0.36, 3.4, 8), this.m.marble, px, deckH + 1.7, pz),
        this.mesh(new T.TorusGeometry(0.36, 0.06, 6, 16).rotateX(Math.PI / 2), this.m.gold, px, deckH + 3.4, pz),
        this.mesh(new T.OctahedronGeometry(0.36, 0), i % 2 ? this.m.pinkGlow : this.m.cyanGlow, px, deckH + 3.95, pz)
      );
      world.circles.push({ x: x0 + px, z: z0 + pz, r: 0.42 });
    }

    // Giant Rotating Celestial Armillary Star-Sphere hovering at the center!
    const arm = new T.Group();
    arm.position.set(0, deckH + 3.6, 0);
    const r1 = this.mesh(new T.TorusGeometry(1.75, 0.065, 8, 42), this.m.gold);
    const r2 = this.mesh(new T.TorusGeometry(1.42, 0.055, 8, 36), this.m.cyanGlow);
    r2.rotation.x = Math.PI / 3;
    const r3 = this.mesh(new T.TorusGeometry(1.08, 0.05, 8, 32), this.m.pinkGlow);
    r3.rotation.y = Math.PI / 3;
    const core = this.mesh(new T.OctahedronGeometry(0.45, 0), this.m.warmGlow);
    arm.add(r1, r2, r3, core);
    this.spinners.push({ obj: r1, speed: 0.45, axis: "y" }, { obj: r2, speed: -0.72, axis: "x" }, { obj: r3, speed: 0.95, axis: "z" }, { obj: core, speed: 1.6, axis: "y" });
    g.add(arm);

    // Interactive 「极光许愿星钟」 pedestal at the front of the deck!
    const bellPed = new T.Group();
    bellPed.position.set(0, deckH, 3.6);
    bellPed.add(
      this.mesh(new T.CylinderGeometry(0.55, 0.72, 1.05, 8), this.m.marble, 0, 0.52, 0),
      this.mesh(new T.TorusGeometry(0.58, 0.05, 6, 20).rotateX(Math.PI / 2), this.m.gold, 0, 1.05, 0),
      this.mesh(new T.SphereGeometry(0.30, 14, 12), this.m.gold, 0, 1.48, 0),
      this.mesh(new T.OctahedronGeometry(0.18, 0), this.m.cyanGlow, 0, 1.98, 0)
    );
    const sign = this.makeSign("✦ 极光观星坛 ✦", 2.4, 0.48, "#161d3e", "#6cf4ff");
    sign.position.set(0, 2.55, 0);
    bellPed.add(sign);
    g.add(bellPed);
    world.circles.push({ x: x0, z: z0 + 3.6, r: 0.78 });
    this.addLight(x0, y0 + 4.4, z0, 0x72ecff, 16, 26);

    world.spots.push({
      id: "obs_wish_bell",
      pos: new T.Vector3(x0, y0 + deckH + 1.4, z0 + 3.6),
      r: 3.0,
      label: "敲响极光许愿星钟 · 召唤流星雨",
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => {
        const gm = this.game;
        if (gm.audio.wishBell) gm.audio.wishBell();
        else gm.audio.bell();
        gm.cold && gm.cold.warm(30);
        gm.character && gm.character.play("cheer");
        // Spawn a spectacular sky-wide Aurora Shooting-Star Meteor Shower!
        for (let k = 0; k < 14; k++) {
          this.meteors.push({
            delay: k * 0.18,
            x: x0 + (Math.random() - 0.5) * 46,
            y: y0 + 26 + Math.random() * 14,
            z: z0 + (Math.random() - 0.5) * 46,
            vx: (Math.random() - 0.5) * 14 + 10,
            vy: -11 - Math.random() * 6,
            vz: (Math.random() - 0.5) * 14 + 6,
            life: 1.5,
            pink: k % 2 === 1
          });
        }
        gm.ui.toast("铛——！极光许愿星钟响彻雪原，抬头看满天极光流星雨划过夜空喵～", 6);
      }
    });

    this.group.add(g);
  }

  // B2. 「冬日姜饼钟楼广场」 (Winter Gingerbread Clocktower Square at (-118, 134))
  buildGingerbreadClocktower() {
    const T = this.THREE;
    const { world } = this.game;
    const ct = this.re.clocktower;
    const x0 = ct.x, z0 = ct.z, y0 = this.qt(x0, z0);
    const g = new T.Group();
    g.position.set(x0, y0, z0);

    // Festive stone-and-icing cobblestone plaza ring
    g.add(
      this.mesh(new T.CylinderGeometry(8.5, 8.9, 0.20, 24), this.m.marble, 0, 0.10, 0),
      this.mesh(new T.TorusGeometry(8.45, 0.12, 8, 36).rotateX(Math.PI / 2), this.m.ribbonRed, 0, 0.22, 0)
    );

    // 3-Story Storybook Gingerbread Clocktower (12.5m tall!)
    const tw = new T.Group();
    tw.add(
      // Base gingerbread hall (4.4 x 4.6 x 4.4)
      this.mesh(new T.BoxGeometry(4.4, 4.6, 4.4), this.m.ginger, 0, 2.3, 0),
      // White sugar-icing roof cornice & corner pillars
      this.mesh(new T.BoxGeometry(4.85, 0.34, 4.85), this.m.icing, 0, 4.65, 0),
      // Middle belfry clock chamber (3.5 x 4.2 x 3.5)
      this.mesh(new T.BoxGeometry(3.5, 4.2, 3.5), this.m.ginger, 0, 6.8, 0),
      this.mesh(new T.BoxGeometry(3.95, 0.30, 3.95), this.m.icing, 0, 8.95, 0),
      // Steep festive red-and-icing pyramid spire crowned with golden star!
      this.mesh(new T.ConeGeometry(2.75, 4.0, 4).rotateY(Math.PI / 4), this.m.redWood, 0, 11.0, 0),
      this.mesh(new T.ConeGeometry(2.25, 1.4, 4).rotateY(Math.PI / 4), this.m.icing, 0, 12.3, 0),
      this.mesh(new T.OctahedronGeometry(0.45, 0), this.m.gold, 0, 13.45, 0)
    );
    this.spinners.push({ obj: tw.children[6], speed: 1.2 });

    // Striped red/white candy-cane corner columns + warm glowing bakery windows!
    for (const [cx, cz] of [[-2.18, -2.18], [2.18, -2.18], [-2.18, 2.18], [2.18, 2.18]]) {
      tw.add(this.mesh(new T.CylinderGeometry(0.22, 0.24, 4.6, 10), this.m.ribbonRed, cx, 2.3, cz));
      for (let r = 0; r < 6; r++) {
        tw.add(this.mesh(new T.TorusGeometry(0.235, 0.055, 6, 14).rotateX(Math.PI / 2), this.m.icing, cx, 0.6 + r * 0.72, cz));
      }
    }
    // Warm cozy glowing arched door & windows
    tw.add(
      this.mesh(new T.BoxGeometry(1.4, 2.3, 0.16), this.m.darkWood, 0, 1.15, 2.22),
      this.mesh(new T.BoxGeometry(1.0, 1.0, 0.12), this.m.warmGlow, -1.45, 2.8, 2.22),
      this.mesh(new T.BoxGeometry(1.0, 1.0, 0.12), this.m.warmGlow, 1.45, 2.8, 2.22)
    );

    // 4 Illuminated Golden Clock Faces with LIVE MOVING HANDS on all 4 sides!
    const clockTex = this.makeClockFaceTex();
    const clockFaceMat = this.wrapMat(new T.MeshStandardMaterial({
      map: clockTex, emissive: new T.Color(0.95, 0.76, 0.35), emissiveIntensity: 0.75, roughness: 0.25
    }), { key: "plain" });
    const faceGeo = new T.CylinderGeometry(1.18, 1.18, 0.12, 24).rotateX(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const cf = new T.Group();
      cf.position.set(Math.sin(a) * 1.78, 6.9, Math.cos(a) * 1.78);
      cf.rotation.y = a;
      const minH = this.mesh(new T.BoxGeometry(0.08, 0.85, 0.05), this.m.darkWood, 0, 0.32, 0.09);
      const hrH = this.mesh(new T.BoxGeometry(0.11, 0.56, 0.05), this.m.ribbonRed, 0, 0.20, 0.12);
      const minPiv = new T.Group(); minPiv.add(minH);
      const hrPiv = new T.Group(); hrPiv.add(hrH);
      cf.add(this.mesh(faceGeo, clockFaceMat), minPiv, hrPiv);
      tw.add(cf);
      this.clockHands.push({ minPiv, hrPiv });
    }

    // Giant Spinning Peppermint Candy Wheel on the front gable!
    const wheel = new T.Group();
    wheel.position.set(0, 4.1, 2.38);
    wheel.add(this.mesh(new T.TorusGeometry(0.68, 0.11, 8, 24), this.m.ribbonRed));
    for (let i = 0; i < 6; i++) {
      const spoke = this.mesh(new T.BoxGeometry(1.28, 0.12, 0.09), i % 2 ? this.m.icing : this.m.gold);
      spoke.rotation.z = (i / 6) * Math.PI;
      wheel.add(spoke);
    }
    this.spinners.push({ obj: wheel, speed: 0.9, axis: "z" });
    tw.add(wheel);

    const sign = this.makeSign("姜 饼 钟 楼", 2.4, 0.48, "#5e2b14", "#ffe394");
    sign.position.set(0, 2.75, 2.35);
    tw.add(sign);
    g.add(tw);
    world.boxes.push({ x0: x0 - 2.4, x1: x0 + 2.4, z0: z0 - 2.4, z1: z0 + 2.4, h: 12 });
    this.addLight(x0, y0 + 7.2, z0 + 3.2, 0xffcc6e, 16, 26);

    // Interactive Clocktower Carillon & Candy Star Fountain!
    world.spots.push({
      id: "clocktower_chime",
      pos: new T.Vector3(x0, y0 + 1.4, z0 + 3.2),
      r: 3.2,
      label: "敲响姜饼钟楼报时 · 撒糖果星雨",
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => {
        const gm = this.game;
        if (gm.audio.clocktowerChime) gm.audio.clocktowerChime();
        gm.character && gm.character.play("victory");
        for (let k = 0; k < 42; k++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 2.0 + Math.random() * 4.5;
          const cols = [[1, 0.3, 0.3], [1, 0.85, 0.2], [0.3, 0.95, 1], [1, 0.5, 0.9]];
          const c = cols[k % 4];
          gm.sparks.spawn(
            x0 + Math.cos(a) * 1.4, y0 + 5.2, z0 + Math.sin(a) * 1.4,
            Math.cos(a) * sp, 2.5 + Math.random() * 3.5, Math.sin(a) * sp,
            0.16 + Math.random() * 0.14, 0.95, 1.2 + Math.random() * 0.7,
            c[0] * 1.8, c[1] * 1.8, c[2] * 1.8, 3.2, 1.2
          );
        }
        gm.ui.toast("铛铛铛～姜饼钟楼响起了悠扬的冬日报时曲，满天撒下甜甜的糖果星雨喵！", 5.5);
      }
    });

    this.group.add(g);
  }

  // B3. 「幽蓝冰瀑秘境」 (Glacial Icefall Sanctuary & Crystal Grotto at (118, -124))
  buildIcefallSanctuary() {
    const T = this.THREE;
    const { world } = this.game;
    const ic = this.re.icefall;
    const x0 = ic.x, z0 = ic.z, y0 = this.qt(x0, z0);
    const g = new T.Group();
    g.position.set(x0, y0, z0);

    // Sculpted snowy rocky glacier cliff backdrop on the north side (z = -4.5)
    for (const [rx, ry, rz, sx, sy, sz] of [
      [0, 4.2, -5.2, 4.4, 4.8, 2.6],
      [-3.8, 3.1, -4.4, 2.8, 3.6, 2.3],
      [3.8, 3.2, -4.2, 2.9, 3.8, 2.3],
      [-5.6, 1.9, -2.0, 2.2, 2.4, 2.0],
      [5.6, 1.9, -2.0, 2.2, 2.4, 2.0]
    ]) {
      const rock = this.mesh(new T.DodecahedronGeometry(1.0, 1), this.m.stone, rx, ry, rz);
      rock.scale.set(sx, sy, sz);
      const cap = this.mesh(new T.SphereGeometry(0.92, 12, 8), this.m.snow, rx, ry + sy * 0.65, rz);
      cap.scale.set(sx * 0.92, sy * 0.25, sz * 0.88);
      g.add(rock, cap);
    }
    world.boxes.push({ x0: x0 - 5.5, x1: x0 + 5.5, z0: z0 - 6.8, z1: z0 - 3.2, h: 9 });

    // Towering Multi-Tier Frozen Turquoise Ice Waterfall cascading down the cliff!
    for (let i = 0; i < 7; i++) {
      const wx = (i - 3) * 0.88;
      const wh = 6.8 - Math.abs(i - 3) * 0.85;
      const col = this.mesh(
        new T.CylinderGeometry(0.32 + (i % 2) * 0.14, 0.56 + (i % 3) * 0.12, wh, 7),
        i % 2 ? this.m.cyanIce : this.m.deepIce,
        wx, wh / 2 + 0.1, -3.1 + Math.abs(i - 3) * 0.18
      );
      g.add(col);
    }

    // Luminous Translucent Ice-Crystal Grotto Arch framing the shimmering icefall pool!
    const grottoCurve = new T.CatmullRomCurve3([
      new T.Vector3(-4.4, 0, 1.8),
      new T.Vector3(-3.4, 4.0, 0.8),
      new T.Vector3(0, 5.5, 0.2),
      new T.Vector3(3.4, 4.0, 0.8),
      new T.Vector3(4.4, 0, 1.8)
    ]);
    g.add(
      this.mesh(new T.TubeGeometry(grottoCurve, 26, 0.42, 7, false), this.m.cyanIce),
      // Shimmering Frozen Pool at the base of the icefall!
      this.mesh(new T.CylinderGeometry(4.4, 4.6, 0.14, 28), this.m.deepIce, 0, 0.07, -0.4),
      this.mesh(new T.TorusGeometry(4.45, 0.16, 8, 36).rotateX(Math.PI / 2), this.m.cyanIce, 0, 0.14, -0.4)
    );

    // Floating Resonant Frost-Wind Crystal Pedestal in front of the icefall!
    const crys = new T.Group();
    crys.position.set(0, 1.85, 0.6);
    const mainGem = this.mesh(new T.OctahedronGeometry(0.62, 0), this.m.cyanGlow);
    mainGem.scale.set(0.75, 1.55, 0.75);
    const halo = this.mesh(new T.TorusGeometry(0.95, 0.045, 6, 26), this.m.mintGlow);
    halo.rotation.x = Math.PI / 3;
    crys.add(mainGem, halo);
    this.floaters.push({ obj: crys, baseY: 1.85, amp: 0.22, ph: 0.7, spin: 1.1 });
    g.add(crys);

    const sign = this.makeSign("幽 蓝 冰 瀑 秘 境", 2.6, 0.48, "#0f2a42", "#66f0ff");
    sign.position.set(4.4, 2.2, 2.2);
    sign.rotation.y = -0.35;
    g.add(sign);
    world.circles.push({ x: x0 + 4.4, z: z0 + 2.2, r: 0.55 }, { x: x0 - 4.4, z: z0 + 1.8, r: 0.55 });
    this.addLight(x0, y0 + 3.2, z0 - 1.2, 0x4ae8ff, 16, 26);

    world.spots.push({
      id: "icefall_crystal",
      pos: new T.Vector3(x0, y0 + 1.4, z0 + 0.8),
      r: 3.4,
      label: "触摸秘境冰晶 · 获得霜风疾行祝福",
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => {
        const gm = this.game;
        this.frostBlessT = 22;
        if (gm.audio.pickupStar) gm.audio.pickupStar(5);
        gm.character && gm.character.play("happy");
        for (let k = 0; k < 28; k++) {
          const a = (k / 28) * Math.PI * 2;
          const sp = 2.4 + Math.random() * 3.0;
          gm.puffs.spawn(x0, y0 + 1.5, z0 + 0.6, Math.cos(a) * sp, 1.2 + Math.random() * 2.2, Math.sin(a) * sp, 0.12, 0.88, 0.65, 0.3, 0.95, 1.0, 1.5, 1.4);
        }
        gm.ui.toast("叮——！冰瀑共鸣晶石为你附上了「霜风祝福」，22 秒内步履生风、移速大幅提升喵！", 5.5);
      }
    });

    this.group.add(g);
  }

  update(dt, time) {
    if (!this.group) return;
    const g = this.game;
    const night = g.env ? g.env.night || 0 : 0;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;

    for (const sp of this.spinners) {
      if (sp.axis === "x") sp.obj.rotation.x = time * sp.speed;
      else if (sp.axis === "z") sp.obj.rotation.z = time * sp.speed;
      else sp.obj.rotation.y = time * sp.speed;
    }
    for (const fl of this.floaters) {
      fl.obj.position.y = fl.baseY + Math.sin(time * 2.1 + fl.ph) * fl.amp;
      if (fl.spin) fl.obj.rotation.y = time * fl.spin;
    }
    // Live moving clocktower hands synced with game time!
    for (const ch of this.clockHands) {
      ch.minPiv.rotation.z = -time * 0.35;
      ch.hrPiv.rotation.z = -time * 0.03;
    }
    for (const em of this.emissives) {
      em.mat.emissiveIntensity = em.day + (em.night - em.day) * night;
    }
    for (const lt of this.lights) {
      lt.light.intensity = lt.power * (0.28 + 0.72 * lamps);
    }

    // Active Aurora Shooting-Star Meteor Shower from Observatory Wish Bell!
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      if (m.delay > 0) { m.delay -= dt; continue; }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.z += m.vz * dt;
      m.life -= dt;
      g.sparks.spawn(
        m.x, m.y, m.z, -m.vx * 0.15, -m.vy * 0.15, -m.vz * 0.15,
        0.34, 0.95, 0.55,
        m.pink ? 3.2 : 0.85, m.pink ? 1.2 : 2.8, m.pink ? 2.8 : 3.6, 0.2, 1.0
      );
      if (m.life <= 0) this.meteors.splice(i, 1);
    }

    // Frost-Wind Blessing speed boost & sparkle trail from Glacial Icefall!
    if (this.frostBlessT > 0) {
      this.frostBlessT = Math.max(0, this.frostBlessT - dt);
      const pl = g.player;
      if (pl && !pl.riding && !pl.seat && !pl.skiing && pl.speed > 0.3) {
        // Gentle extra frost-wind glide step
        const extra = 1.85 * dt;
        const spd = Math.hypot(pl.vel.x, pl.vel.y);
        if (spd > 0.2) {
          const nx = pl.pos.x + (pl.vel.x / spd) * extra;
          const nz = pl.pos.z + (pl.vel.y / spd) * extra;
          if (pl.allowed(nx, nz)) {
            pl.pos.x = nx;
            pl.pos.z = nz;
          }
        }
        this.blessSparkAcc += dt * 14;
        while (this.blessSparkAcc >= 1) {
          this.blessSparkAcc -= 1;
          g.puffs.spawn(pl.pos.x, pl.y - pl.eye + 0.45, pl.pos.z, (Math.random() - 0.5) * 0.8, 0.5, (Math.random() - 0.5) * 0.8, 0.08, 0.85, 0.45, 0.35, 0.95, 1.0, 0.4, 1.2);
        }
      }
    }
  }
}
