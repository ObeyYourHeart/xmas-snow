// 巨型 44 米实景可步入星雪摩天轮 & 平安夜许愿天灯台 (js/ferris.js)
// - 彻底重制圣诞集市旁的摩天轮：半径 R = 19.5m（轴心高 22.8m，顶峰超 42m！），比旧版壮观 2.4 倍！
// - 12 座宽敞实景 3D 观景座舱（2.7m × 2.7m 可自由走动木甲板 + 鎏金护栏 + 暖灯 + 彩顶拱框），全部接入动态 world.platforms 与三维随行携带物理！
// - 支持直接从直升机 / 幻翼星云飞猫在任意高度悬停按 E「空降进入摩天轮座舱」，也支持在座舱高空呼叫坐骑飞来接驳、或在底部观景台无缝步入座舱！
// - 附带「平安夜极光许愿天灯放飞台」：按 E 放飞暖金/樱粉孔明许愿天灯，缓缓飘升掠过 42 米巨型摩天轮与夜空极光！

const CABIN_COLORS = [
  0xc8262b, 0x1e7a48, 0xe29e28, 0x2a5cb8, 0xd85aa8, 0x1ca6c8,
  0xc8262b, 0x1e7a48, 0xe29e28, 0x2a5cb8, 0xd85aa8, 0x1ca6c8
];

const WISH_LINES = [
  "许愿天灯带着暖光升空啦：愿今年圣诞雪境永远温暖璀璨喵～",
  "一盏樱粉星愿天灯飘过巨型摩天轮，在极光里闪烁着！",
  "五盏平安夜天灯同时起飞！快飞上天或坐进摩天轮座舱和它们同行吧～",
  "暖融融的天灯映亮了整个集市夜空，祝主人天天极其极其开心！"
];

export class GrandFerrisWheel {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.Ie = helpers.Ie;
    this.THREE = game.THREE;

    this.cx = this.Ie.x;   // 20
    this.cz = this.Ie.z;   // 125
    this.rot = this.Ie.rot; // 2.68
    this.baseY = this.qt(this.cx, this.cz);

    this.R = 19.5;          // Massive 19.5m wheel radius!
    this.hubH = 22.8;       // Hub height -> summit reaches ~42.5m!
    this.numCabins = 12;
    this.angle = 0;
    this.angSpeed = (Math.PI * 2) / 92; // Smooth ~92s scenic rotation

    this.root = null;
    this.wheelGroup = null;
    this.hubStar = null;
    this.cabins = [];
    this.rimBulbs = [];
    this.lights = [];

    // Live in-world rider tracking
    this.activeCabin = null;
    this.nearHeliCabin = null;
    this.reachedTop = false;
    this.helipadPos = new this.THREE.Vector3();

    // Floating Christmas Wish Sky-Lanterns!
    this.skyLanterns = [];
    this.wishIdx = 0;
    this.lanternStandPos = new this.THREE.Vector3();
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  localToWorld(lx, ly, lz, out = new this.THREE.Vector3()) {
    const c = Math.cos(this.rot), s = Math.sin(this.rot);
    // Three.js rotation.y = rot: x' = x*cos + z*sin, z' = -x*sin + z*cos
    return out.set(
      this.cx + lx * c + lz * s,
      this.baseY + ly,
      this.cz - lx * s + lz * c
    );
  }

  worldToLocalXZ(wx, wz) {
    const dx = wx - this.cx, dz = wz - this.cz;
    const c = Math.cos(this.rot), s = Math.sin(this.rot);
    return [dx * c - dz * s, dx * s + dz * c];
  }

  makeSignTex(title, sub) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 640; cv.height = 160;
    const c = cv.getContext("2d");
    const gr = c.createLinearGradient(0, 0, 640, 0);
    gr.addColorStop(0, "#1c1f4a");
    gr.addColorStop(0.5, "#36266b");
    gr.addColorStop(1, "#1c1f4a");
    c.fillStyle = gr;
    c.fillRect(0, 0, 640, 160);
    c.strokeStyle = "#ffd966";
    c.lineWidth = 8;
    c.strokeRect(8, 8, 624, 144);
    c.fillStyle = "#fff9e0";
    c.font = "900 54px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(title, 320, 62);
    c.fillStyle = "#8ef6ff";
    c.font = "700 26px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.fillText(sub, 320, 118);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  build() {
    const T = this.THREE;
    const { scene, world, explore } = this.game;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.36, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    this.m = {
      ivory: std(0xf2efe8, 0.34, { metalness: 0.25 }),
      steel: std(0xcfd8e8, 0.28, { metalness: 0.65 }),
      gold: std(0xffd254, 0.18, { metalness: 0.88 }),
      deck: std(0x9a623c, 0.68),
      stone: std(0x525c78, 0.62),
      snow: std(0xf5f8ff, 0.74),
      velvet: std(0xa82438, 0.72),
      glass: plain(new T.MeshStandardMaterial({
        color: 0xdaf6ff, roughness: 0.08, metalness: 0.12, transparent: true, opacity: 0.36
      })),
      warmBulb: plain(new T.MeshStandardMaterial({
        color: 0xfff0b2, emissive: new T.Color(1.0, 0.78, 0.30), emissiveIntensity: 1.4, roughness: 0.15
      })),
      cyanGlow: plain(new T.MeshStandardMaterial({
        color: 0x7ef6ff, emissive: new T.Color(0.24, 0.88, 1.0), emissiveIntensity: 1.4, roughness: 0.15
      })),
      pinkGlow: plain(new T.MeshStandardMaterial({
        color: 0xff8ce0, emissive: new T.Color(0.96, 0.34, 0.84), emissiveIntensity: 1.4, roughness: 0.15
      })),
      lanternGold: plain(new T.MeshStandardMaterial({
        color: 0xffdf88, emissive: new T.Color(1.0, 0.66, 0.16), emissiveIntensity: 1.7, roughness: 0.25, side: T.DoubleSide
      })),
      lanternPink: plain(new T.MeshStandardMaterial({
        color: 0xffa6de, emissive: new T.Color(1.0, 0.42, 0.76), emissiveIntensity: 1.6, roughness: 0.25, side: T.DoubleSide
      }))
    };

    const root = new T.Group();
    root.position.set(this.cx, this.baseY, this.cz);
    root.rotation.y = this.rot;
    scene.add(root);
    this.root = root;

    // -----------------------------------------------------------------------
    // 1. GRAND A-FRAME SUPPORT TOWERS & BOARDING TERRACE
    //    Wheel lies in the local Y-Z plane (rotating around local X axis!)
    //    Twin support legs stand on local X = ±3.4m, splaying along Z = ±9.2m!
    // -----------------------------------------------------------------------
    const legSpanZ = 9.2;
    const legHalfX = 3.35;
    const hubY = this.hubH;

    const addStrut = (p1, p2, rTop, rBot, mat) => {
      const dir = new T.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const cyl = new T.Mesh(new T.CylinderGeometry(rTop, rBot, len, 12), mat);
      cyl.position.copy(p1).add(p2).multiplyScalar(0.5);
      cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      cyl.receiveShadow = true;
      root.add(cyl);
      return cyl;
    };

    for (const side of [-1, 1]) {
      const hx = side * legHalfX;
      const topPt = new T.Vector3(hx, hubY, 0);
      const footF = new T.Vector3(hx * 1.18, 0, legSpanZ);
      const footB = new T.Vector3(hx * 1.18, 0, -legSpanZ);
      addStrut(footF, topPt, 0.34, 0.56, this.m.ivory);
      addStrut(footB, topPt, 0.34, 0.56, this.m.ivory);
      // Mid-height horizontal tie beam & gilded brace
      addStrut(new T.Vector3(hx * 1.09, hubY * 0.48, legSpanZ * 0.52), new T.Vector3(hx * 1.09, hubY * 0.48, -legSpanZ * 0.52), 0.18, 0.18, this.m.gold);
      // Stone foundation plinths + colliders
      for (const fz of [legSpanZ, -legSpanZ]) {
        const fx = hx * 1.18;
        root.add(
          this.mesh(new T.CylinderGeometry(0.92, 1.18, 0.85, 10), this.m.stone, fx, 0.425, fz),
          this.mesh(new T.TorusGeometry(0.95, 0.08, 6, 18).rotateX(Math.PI / 2), this.m.gold, fx, 0.86, fz)
        );
        const wp = this.localToWorld(fx, 0, fz);
        world.circles.push({ x: wp.x, z: wp.z, r: 1.05 });
      }
      // Hub bearing housing
      root.add(
        this.mesh(new T.CylinderGeometry(0.95, 0.95, 0.85, 18).rotateZ(Math.PI / 2), this.m.gold, hx, hubY, 0)
      );
    }
    // Central main axle shaft spanning ±3.8m
    root.add(this.mesh(new T.CylinderGeometry(0.55, 0.55, legHalfX * 2 + 1.2, 18).rotateZ(Math.PI / 2), this.m.steel, 0, hubY, 0));

    // Elevated Boarding Deck Platform beside the lowest cabin (local X: +2.4..+6.8, Z: -3.2..+3.2, H = 1.15m)
    const deckH = 1.15;
    root.add(
      this.mesh(new T.BoxGeometry(4.4, deckH, 6.4), this.m.stone, 4.6, deckH / 2, 0),
      this.mesh(new T.BoxGeometry(4.5, 0.10, 6.5), this.m.deck, 4.6, deckH, 0),
      this.mesh(new T.BoxGeometry(4.58, 0.06, 6.58), this.m.gold, 4.6, deckH + 0.04, 0),
      // Wide gentle entry ramp on +X side (X: 6.8..9.6, Z: -2.0..+2.0)
      this.mesh(new T.BoxGeometry(2.9, 0.16, 4.0), this.m.deck, 8.2, deckH / 2, 0)
    );
    root.children[root.children.length - 1].rotation.z = -Math.atan2(deckH, 2.8);

    // Grand Illuminated Signboard Arch atop boarding ramp!
    const signG = new T.Group();
    signG.position.set(6.75, deckH, 0);
    signG.add(
      this.mesh(new T.CylinderGeometry(0.10, 0.12, 3.2, 10), this.m.ivory, 0, 1.6, -2.1),
      this.mesh(new T.CylinderGeometry(0.10, 0.12, 3.2, 10), this.m.ivory, 0, 1.6, 2.1),
      this.mesh(new T.SphereGeometry(0.18, 10, 8), this.m.gold, 0, 3.28, -2.1),
      this.mesh(new T.SphereGeometry(0.18, 10, 8), this.m.gold, 0, 3.28, 2.1)
    );
    const sTex = this.makeSignTex("✦ 巨型星雪摩天轮 ✦", "42米全景 · 可步入座舱 · 支持飞猫/直升机空降！");
    const sBoard = this.mesh(new T.BoxGeometry(0.14, 1.05, 4.25), [
      plain(new T.MeshStandardMaterial({ map: sTex, roughness: 0.25 })),
      plain(new T.MeshStandardMaterial({ map: sTex, roughness: 0.25 })),
      this.m.snow, this.m.gold, this.m.gold, this.m.gold
    ], 0, 2.85, 0);
    signG.add(sBoard);
    root.add(signG);

    // Register Boarding Deck & Entry Ramp as walkable platforms!
    world.platforms.push(
      {
        test: (px, pz) => {
          const [lx, lz] = this.worldToLocalXZ(px, pz);
          return lx >= 2.2 && lx <= 6.85 && Math.abs(lz) <= 3.25;
        },
        y: () => this.baseY + deckH + 0.05
      },
      {
        test: (px, pz) => {
          const [lx, lz] = this.worldToLocalXZ(px, pz);
          return lx > 6.85 && lx <= 9.8 && Math.abs(lz) <= 2.1;
        },
        y: (px, pz) => {
          const [lx] = this.worldToLocalXZ(px, pz);
          const t = Math.max(0, Math.min(1, (9.8 - lx) / 2.95));
          return this.baseY + t * (deckH + 0.05);
        }
      }
    );

    // Dedicated Scenic Sky-Helipad in open snow clearing beside the Giant Ferris Wheel (local -9.5, -10.5 -> ~24, 139)!
    this.localToWorld(-9.5, 0, -10.5, this.helipadPos);
    this.helipadPos.y = this.qt(this.helipadPos.x, this.helipadPos.z);
    const padG = new T.Group();
    padG.position.set(-9.5, this.helipadPos.y - this.baseY + 0.04, -10.5);
    padG.add(
      this.mesh(new T.TorusGeometry(2.6, 0.075, 8, 36).rotateX(Math.PI / 2), this.m.gold),
      this.mesh(new T.TorusGeometry(2.25, 0.045, 6, 36).rotateX(Math.PI / 2), this.m.cyanGlow, 0, 0.01, 0),
      this.mesh(new T.BoxGeometry(0.24, 0.03, 1.5), this.m.gold, -0.52, 0.01, 0),
      this.mesh(new T.BoxGeometry(0.24, 0.03, 1.5), this.m.gold, 0.52, 0.01, 0),
      this.mesh(new T.BoxGeometry(1.04, 0.03, 0.24), this.m.gold, 0, 0.01, 0)
    );
    root.add(padG);

    // -----------------------------------------------------------------------
    // 2. ROTATING GIANT 19.5M WHEEL RIM, SPOKES, SNOWFLAKE HUB & 48 FAIRY BULBS
    // -----------------------------------------------------------------------
    const wheelG = new T.Group();
    wheelG.position.set(0, hubY, 0);
    root.add(wheelG);
    this.wheelGroup = wheelG;

    const rimOffsetX = 1.62; // Twin rims sit ±1.62m apart, framing the 2.7m wide walkable cabins!
    for (const side of [-1, 1]) {
      const rx = side * rimOffsetX;
      // Outer gilded steel rim (R = 19.5m) + Inner truss rim (R = 17.5m)
      wheelG.add(
        this.mesh(new T.TorusGeometry(this.R, 0.24, 10, 64).rotateY(Math.PI / 2), this.m.ivory, rx, 0, 0),
        this.mesh(new T.TorusGeometry(this.R - 1.9, 0.16, 8, 48).rotateY(Math.PI / 2), this.m.gold, rx, 0, 0),
        this.mesh(new T.TorusGeometry(this.R * 0.45, 0.14, 8, 36).rotateY(Math.PI / 2), this.m.gold, rx, 0, 0)
      );
    }

    // 12 Main Structural Spokes + Crossbars + 48 Luminous Rim Fairy Bulbs!
    const bulbMats = [this.m.warmBulb, this.m.cyanGlow, this.m.pinkGlow];
    for (let i = 0; i < this.numCabins; i++) {
      const a = (i / this.numCabins) * Math.PI * 2;
      const cy = Math.sin(a) * this.R;
      const cz = Math.cos(a) * this.R;
      // Twin spokes from hub out to rim
      for (const side of [-1, 1]) {
        const rx = side * rimOffsetX;
        const sp = this.mesh(new T.CylinderGeometry(0.11, 0.14, this.R, 8), this.m.steel, rx, cy * 0.5, cz * 0.5);
        sp.rotation.x = Math.atan2(cz, cy);
        wheelG.add(sp);
      }
      // Horizontal gondola suspension axle spanning between both rims!
      wheelG.add(
        this.mesh(new T.CylinderGeometry(0.12, 0.12, rimOffsetX * 2 + 0.35, 10).rotateZ(Math.PI / 2), this.m.gold, 0, cy, cz)
      );
      // 4 Festive glowing bulbs per sector around outer rim!
      for (let b = 0; b < 4; b++) {
        const ba = a + (b / 4) * ((Math.PI * 2) / this.numCabins);
        const by = Math.sin(ba) * (this.R + 0.30);
        const bz = Math.cos(ba) * (this.R + 0.30);
        const mat = bulbMats[(i * 4 + b) % bulbMats.length];
        for (const side of [-1, 1]) {
          const bm = this.mesh(new T.SphereGeometry(0.22, 8, 6), mat, side * rimOffsetX, by, bz);
          wheelG.add(bm);
          this.rimBulbs.push(bm);
        }
      }
    }

    // Giant Glowing 12-Spoke Snowflake Medallion at the Center Hub!
    const hubStar = new T.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      const bar = this.mesh(new T.BoxGeometry(0.24, 6.8, 0.34), this.m.gold, 0, 0, 0);
      bar.rotation.x = a;
      hubStar.add(bar);
    }
    hubStar.add(
      this.mesh(new T.TorusGeometry(2.6, 0.14, 8, 32).rotateY(Math.PI / 2), this.m.cyanGlow, 0, 0, 0),
      this.mesh(new T.OctahedronGeometry(1.15, 0), this.m.warmBulb, 0, 0, 0)
    );
    wheelG.add(hubStar);
    this.hubStar = hubStar;

    // -----------------------------------------------------------------------
    // 3. 12 FULL-SIZE WALKABLE 3D PANORAMIC GONDOLA CABINS!
    //    Each cabin hangs from its pivot pin: floor sits 2.35m below the axle pin!
    //    Open entry on +X side + open sky view above for helicopter drop-in!
    // -----------------------------------------------------------------------
    const cabW = 2.72, cabD = 2.65, hangDrop = 2.35;
    for (let i = 0; i < this.numCabins; i++) {
      const cabMat = std(CABIN_COLORS[i], 0.38, { metalness: 0.15 });
      const cg = new T.Group();
      cg.rotation.y = this.rot;

      // Twin side hanger arms from axle pin (y=0) down to floor deck (y=-hangDrop)
      for (const sz of [-cabD / 2, cabD / 2]) {
        cg.add(
          this.mesh(new T.CylinderGeometry(0.065, 0.065, hangDrop, 8), this.m.gold, 0, -hangDrop / 2, sz)
        );
      }
      // Solid Walkable Wooden Floor Deck (y = -hangDrop) + Gilded Trim!
      cg.add(
        this.mesh(new T.BoxGeometry(cabW, 0.22, cabD), this.m.deck, 0, -hangDrop - 0.11, 0),
        this.mesh(new T.BoxGeometry(cabW + 0.12, 0.10, cabD + 0.12), cabMat, 0, -hangDrop - 0.18, 0),
        this.mesh(new T.BoxGeometry(cabW + 0.14, 0.055, cabD + 0.14), this.m.gold, 0, -hangDrop - 0.02, 0)
      );
      // Lower Colored Skirt Panels + Panoramic Glass Balustrades on 3 sides (-X, -Z, +Z)
      // (+X side has wide open entry doorway facing the boarding terrace!)
      const railH = 0.88;
      // Back wall (-X)
      cg.add(
        this.mesh(new T.BoxGeometry(0.10, 0.42, cabD), cabMat, -cabW / 2 + 0.05, -hangDrop + 0.21, 0),
        this.mesh(new T.BoxGeometry(0.05, 0.44, cabD - 0.16), this.m.glass, -cabW / 2 + 0.05, -hangDrop + 0.64, 0),
        this.mesh(new T.BoxGeometry(0.12, 0.07, cabD + 0.08), this.m.gold, -cabW / 2 + 0.05, -hangDrop + railH, 0)
      );
      // Side walls (±Z)
      for (const sz of [-1, 1]) {
        const zp = sz * (cabD / 2 - 0.05);
        cg.add(
          this.mesh(new T.BoxGeometry(cabW, 0.42, 0.10), cabMat, 0, -hangDrop + 0.21, zp),
          this.mesh(new T.BoxGeometry(cabW - 0.16, 0.44, 0.05), this.m.glass, 0, -hangDrop + 0.64, zp),
          this.mesh(new T.BoxGeometry(cabW + 0.08, 0.07, 0.12), this.m.gold, 0, -hangDrop + railH, zp)
        );
      }
      // Corner slender brass canopy posts + decorative open-sky star crown (leaves open top for heli drop-in!)
      for (const sx of [-cabW / 2 + 0.08, cabW / 2 - 0.08]) {
        for (const sz of [-cabD / 2 + 0.08, cabD / 2 - 0.08]) {
          cg.add(this.mesh(new T.CylinderGeometry(0.045, 0.045, hangDrop, 8), this.m.gold, sx, -hangDrop / 2, sz));
        }
      }
      // Cozy Velvet Bench tucked along the back (-X) wall + Warm Overhead Cabin Lantern!
      cg.add(
        this.mesh(new T.BoxGeometry(0.56, 0.38, cabD - 0.45), this.m.velvet, -cabW / 2 + 0.40, -hangDrop + 0.19, 0),
        this.mesh(new T.SphereGeometry(0.16, 10, 8), this.m.warmBulb, 0, -0.28, 0)
      );

      scene.add(cg);

      const cab = {
        idx: i,
        group: cg,
        ang0: (i / this.numCabins) * Math.PI * 2,
        wx: this.cx, wy: this.baseY + this.hubH, wz: this.cz,
        floorY: this.baseY + this.hubH - hangDrop,
        dx: 0, dy: 0, dz: 0,
        halfW: cabW / 2 + 0.16,
        halfD: cabD / 2 + 0.16,
        hangDrop
      };
      this.cabins.push(cab);

      // ALTITUDE-AWARE DYNAMIC 3D PLATFORM!
      // Only activates if cabin floor is at or below (player/heli footY + 1.45m), so stacked top/bottom cabins NEVER conflict!
      world.platforms.push({
        test: (px, pz) => {
          const pl = this.game.player;
          if (!pl) return false;
          const isHeli = pl.riding && pl.ride && pl.ride.kind === "heli";
          const refY = isHeli && this.game.heli ? this.game.heli.y : (pl.y - pl.eye + pl.air);
          if (cab.floorY > refY + 1.45) return false;
          const dx = px - cab.wx, dz = pz - cab.wz;
          const c = Math.cos(this.rot), s = Math.sin(this.rot);
          const lx = dx * c - dz * s;
          const lz = dx * s + dz * c;
          return Math.abs(lx) <= cab.halfW && Math.abs(lz) <= cab.halfD;
        },
        y: () => cab.floorY
      });
    }

    this.updateCabins(0);

    // -----------------------------------------------------------------------
    // 4. BONUS CAT-CRAFTED MAGIC: CHRISTMAS EVE FLOATING SKY-LANTERN TERRACE!
    //    Right beside the Giant Ferris Wheel (local +11.5, +8.5)
    // -----------------------------------------------------------------------
    this.buildSkyLanternTerrace();

    // -----------------------------------------------------------------------
    // 5. WARM FERRIS WHEEL LIGHTS & INTERACTIVE SPOTS!
    // -----------------------------------------------------------------------
    const addL = (lx, ly, lz, col, pwr, dist = 28) => {
      const wp = this.localToWorld(lx, ly, lz);
      const l = new T.PointLight(col, 0, dist, 1.35);
      l.position.copy(wp);
      scene.add(l);
      this.lights.push({ l, pwr });
    };
    addL(4.6, 4.2, 0, 0xffe49e, 16, 22);
    addL(0, hubY, 0, 0x8ef2ff, 22, 42);

    // Ground Boarding Spot: physically steps you straight into the nearest lowest cabin in live 3D!
    const boardPos = this.localToWorld(4.6, deckH + 1.0, 0);
    world.spots.push({
      id: "wheel",
      pos: boardPos,
      r: 3.4,
      label: "步入 42 米巨型摩天轮座舱（实景自由观光！）",
      can: () => !this.game.player.seat && !this.game.player.riding && !this.game.player.skiing && !this.activeCabin,
      act: () => this.boardLowestCabin()
    });

    // Dynamic In-Cabin Sky Action Spot (moves smoothly with the rider's active cabin!)
    this.cabinExitPos = new T.Vector3(0, -999, 0);
    world.spots.push({
      id: "ferris_cabin_action",
      pos: this.cabinExitPos,
      r: 2.8,
      label: () => {
        const alt = this.activeCabin ? Math.round(this.activeCabin.floorY - this.baseY) : 0;
        return alt > 6
          ? `在 ${alt} 米高空召唤坐骑接驳 / 返回摩天轮观景台`
          : "安全走出摩天轮座舱，回到观景台";
      },
      can: () => !!this.activeCabin && !this.game.player.riding && !this.game.player.seat,
      act: () => this.exitOrSummonFromCabin()
    });

    // HOOK HELICOPTER / WINGED SKY-CAT MID-AIR DROP-OFF DIRECTLY INTO ANY FERRIS WHEEL CABIN!
    this.installMountDropIn();

    // Update M-map explore site & golden bell compatibility!
    if (explore) {
      if (explore.wheel) {
        explore.wheel.hub = this.localToWorld(0, hubY, 0);
      }
      const site = explore.sites && explore.sites.find((s) => s.id === "wheel");
      if (site) site.name = "巨型星雪摩天轮";
    }

    return this;
  }

  // =========================================================================
  // CHRISTMAS EVE SKY-LANTERN RELEASE TERRACE (平安夜许愿天灯放飞台!)
  // =========================================================================
  buildSkyLanternTerrace() {
    const T = this.THREE;
    const { world } = this.game;
    const lx = 8.4, lz = 6.2;
    const wp = this.localToWorld(lx, 0, lz);
    const wy = this.qt(wp.x, wp.z);
    this.lanternStandPos.set(wp.x, wy, wp.z);

    const tg = new T.Group();
    tg.position.set(lx, wy - this.baseY, lz);
    tg.add(
      // Octagonal warm stone-and-gold wishing plinth + carved cedar lantern rack
      this.mesh(new T.CylinderGeometry(1.85, 2.05, 0.24, 8), this.m.stone, 0, 0.12, 0),
      this.mesh(new T.TorusGeometry(1.88, 0.05, 6, 24).rotateX(Math.PI / 2), this.m.gold, 0, 0.24, 0),
      this.mesh(new T.BoxGeometry(1.65, 0.88, 0.72), this.m.deck, 0, 0.66, 0),
      this.mesh(new T.BoxGeometry(1.74, 0.08, 0.80), this.m.gold, 0, 1.12, 0)
    );
    // 3 Ready-to-launch glowing paper Wish Lanterns perched on the table!
    for (let i = -1; i <= 1; i++) {
      const mat = i === 0 ? this.m.lanternPink : this.m.lanternGold;
      tg.add(
        this.mesh(new T.CylinderGeometry(0.22, 0.15, 0.42, 10, 1, true), mat, i * 0.48, 1.38, 0),
        this.mesh(new T.TorusGeometry(0.15, 0.018, 6, 12).rotateX(Math.PI / 2), this.m.gold, i * 0.48, 1.18, 0)
      );
    }
    this.root.add(tg);
    world.circles.push({ x: wp.x, z: wp.z, r: 1.0 });

    world.spots.push({
      id: "ferris_wish_lantern",
      pos: new T.Vector3(wp.x, wy + 1.25, wp.z),
      r: 3.0,
      label: () => (this.wishIdx % 3 === 2
        ? "放飞五盏「极光许愿天灯群」飘过摩天轮！"
        : "点亮并放飞一盏「平安夜许愿天灯」"),
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => this.releaseSkyLanterns()
    });
  }

  releaseSkyLanterns() {
    const T = this.THREE;
    const g = this.game;
    const isFlock = this.wishIdx % 3 === 2;
    const count = isFlock ? 5 : 1;
    const line = WISH_LINES[this.wishIdx++ % WISH_LINES.length];

    // Gentle magical harp arpeggio
    if (g.audio && g.audio.ctx && !g.audio.muted) {
      const ctx = g.audio.ctx, t0 = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].slice(0, isFlock ? 5 : 3).forEach((f, idx) => {
        const o = ctx.createOscillator(), gn = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(f, t0 + idx * 0.08);
        gn.gain.setValueAtTime(1e-4, t0 + idx * 0.08);
        gn.gain.linearRampToValueAtTime(0.065, t0 + idx * 0.08 + 0.015);
        gn.gain.exponentialRampToValueAtTime(1e-4, t0 + idx * 0.08 + 0.45);
        o.connect(gn).connect(g.audio.master);
        o.start(t0 + idx * 0.08); o.stop(t0 + idx * 0.08 + 0.5);
      });
    }

    for (let k = 0; k < count; k++) {
      // Cap total active sky lanterns cleanly at 28 for crisp 60fps performance
      if (this.skyLanterns.length >= 28) {
        const old = this.skyLanterns.shift();
        g.scene.remove(old.grp);
      }
      const lg = new T.Group();
      const pink = (this.wishIdx + k) % 2 === 1;
      lg.add(
        this.mesh(new T.CylinderGeometry(0.32, 0.21, 0.62, 10, 1, true), pink ? this.m.lanternPink : this.m.lanternGold, 0, 0.31, 0),
        this.mesh(new T.CircleGeometry(0.32, 10).rotateX(-Math.PI / 2), pink ? this.m.lanternPink : this.m.lanternGold, 0, 0.62, 0),
        this.mesh(new T.TorusGeometry(0.21, 0.022, 6, 12).rotateX(Math.PI / 2), this.m.gold, 0, 0.02, 0),
        this.mesh(new T.SphereGeometry(0.075, 8, 6), this.m.warmBulb, 0, 0.14, 0)
      );
      const a = (k / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.6;
      const rr = isFlock ? 0.9 + Math.random() * 1.4 : 0.3;
      const sx = this.lanternStandPos.x + Math.cos(a) * rr;
      const sz = this.lanternStandPos.z + Math.sin(a) * rr;
      const sy = this.lanternStandPos.y + 1.55 + k * 0.22;
      lg.position.set(sx, sy, sz);
      g.scene.add(lg);
      this.skyLanterns.push({
        grp: lg,
        vx: (this.cx - sx) * 0.025 + (Math.random() - 0.5) * 0.25,
        vy: 0.92 + Math.random() * 0.35,
        vz: (this.cz - sz) * 0.025 + (Math.random() - 0.5) * 0.25,
        ph: Math.random() * Math.PI * 2,
        life: 62
      });
    }
    g.character && g.character.play && g.character.play("happy");
    g.cold && g.cold.warm(15);
    g.ui.toast(`🏮 ${line}`, 4.8);
  }

  // =========================================================================
  // WALK-IN BOARDING & HELICOPTER / WINGED SKY-CAT DROP-IN INTEGRATION!
  // =========================================================================
  boardLowestCabin() {
    const g = this.game, pl = g.player;
    let best = this.cabins[0];
    for (const c of this.cabins) {
      if (c.floorY < best.floorY) best = c;
    }
    this.activeCabin = best;
    pl.pos.x = best.wx;
    pl.pos.z = best.wz;
    pl.y = best.floorY + pl.eye;
    pl.air = 0;
    pl.vy = 0;
    pl.vel.set(0, 0);
    g.audio.ding && g.audio.ding(0.75);
    g.ui.toast(`已步入巨型摩天轮 #${best.idx + 1} 号观景座舱！你可以在舱内自由走动拍照，慢慢升到 42 米高空喵～`, 6.0);
  }

  exitOrSummonFromCabin() {
    const g = this.game, pl = g.player, c = this.activeCabin;
    if (!c) return;
    const alt = c.floorY - this.baseY;
    if (alt > 6 && g.heli && !g.heli.driven) {
      // High in the sky -> Summon your Winged Sky-Cat / Helicopter right beside your cabin and hop aboard!
      const h = g.heli;
      this.activeCabin = null;
      const exitX = c.wx + Math.cos(this.rot) * 2.2;
      const exitZ = c.wz - Math.sin(this.rot) * 2.2;
      h.x = exitX;
      h.z = exitZ;
      h.y = c.floorY + 0.35;
      h.landed = false;
      h.rotor = 1;
      h.vy = 0.2;
      h.yaw = this.rot + Math.PI / 2;
      h.place();
      h.mount();
      h.landed = false;
      h.rotor = 1;
      pl.pos.x = h.x;
      pl.pos.z = h.z;
      g.ui.toast(g.avatar === "gemini"
        ? "幻翼星云飞猫振翅飞到摩天轮高空座舱旁接你啦！按空格继续翱翔～"
        : "橙花小直升机已飞抵摩天轮高空座舱旁接驳起飞！", 5.0);
    } else {
      // Near bottom -> step cleanly out onto the boarding terrace!
      this.activeCabin = null;
      const out = this.localToWorld(5.0, 1.22, 0);
      pl.teleport(out.x, out.z, this.rot - Math.PI / 2, -0.08);
      g.audio.pick && g.audio.pick();
      g.ui.toast("已安全走回巨型摩天轮观景台！", 3.5);
    }
  }

  installMountDropIn() {
    const g = this.game, h = g.heli;
    if (!h) return;

    // Upgrade helicopter offSpot label dynamically when hovering right over a Ferris Wheel cabin!
    if (h.offSpot) {
      const origLabel = h.offSpot.label;
      h.offSpot.label = () => {
        if (this.nearHeliCabin) {
          return `空降进入巨型摩天轮 #${this.nearHeliCabin.idx + 1} 号座舱！`;
        }
        return typeof origLabel === "function" ? origLabel() : origLabel;
      };
    }

    // Wrap h.dismount(): if hovering near ANY moving Ferris Wheel cabin, drop straight inside it!
    const origDismount = h.dismount.bind(h);
    h.dismount = () => {
      if (this.nearHeliCabin) {
        const cab = this.nearHeliCabin;
        const pl = g.player;
        // Release player cleanly into the moving 3D cabin!
        pl.riding = false;
        pl.ride = null;
        pl.fly = 0;
        pl.camWant = 0;
        pl.camH = 0;
        pl.camDist = 0;
        pl.pos.x = cab.wx;
        pl.pos.z = cab.wz;
        pl.y = cab.floorY + pl.eye;
        pl.air = 0.25;
        pl.vy = -0.8;
        pl.vel.set(0, 0);
        this.activeCabin = cab;

        // Auto-park the helicopter / Winged Sky-Cat safely onto the Ferris Wheel ground Sky-Helipad!
        h.v = 0;
        h.turn = 0;
        h.x = this.helipadPos.x;
        h.z = this.helipadPos.z;
        h.y = this.qt(h.x, h.z);
        h.landed = true;
        h.vy = 0;
        h.place();

        g.audio.ding && g.audio.ding(0.9);
        g.ui.toast(
          `✦ 成功从空中降落进入 42 米巨型摩天轮 #${cab.idx + 1} 号观景座舱！（坐骑已自动停靠下方摩天轮停机坪，高空按 E 可随时召回接你喵～）`,
          6.5
        );
        return;
      }
      origDismount();
    };
  }

  updateCabins(dt) {
    const T = this.THREE;
    const prevAngle = this.angle;
    this.angle = (this.angle + dt * this.angSpeed) % (Math.PI * 2);
    if (this.wheelGroup) this.wheelGroup.rotation.x = this.angle;
    if (this.hubStar) this.hubStar.rotation.x = -this.angle * 1.5;

    const cR = Math.cos(this.rot), sR = Math.sin(this.rot);
    for (const cab of this.cabins) {
      const prevX = cab.wx, prevY = cab.floorY, prevZ = cab.wz;
      // Three.js rotation.x = +angle rotates (0, sin(a0), cos(a0)) -> (0, sin(a0 - angle), cos(a0 - angle))!
      const a = cab.ang0 - this.angle;
      const ly = this.hubH + Math.sin(a) * this.R;
      const lz = Math.cos(a) * this.R;
      const wx = this.cx + lz * sR;
      const wz = this.cz + lz * cR;
      const wy = this.baseY + ly;

      cab.group.position.set(wx, wy, wz);
      cab.wx = wx;
      cab.wy = wy;
      cab.wz = wz;
      cab.floorY = wy - cab.hangDrop;
      cab.dx = prevAngle === 0 && dt === 0 ? 0 : wx - prevX;
      cab.dy = prevAngle === 0 && dt === 0 ? 0 : cab.floorY - prevY;
      cab.dz = prevAngle === 0 && dt === 0 ? 0 : wz - prevZ;
    }
  }

  update(dt, time) {
    if (!this.root) return;
    const g = this.game, pl = g.player;
    const inside = !!(g.cabin && g.cabin.inside);

    // 1) Rotate giant 44m wheel & move all 12 walkable cabins!
    this.updateCabins(dt);

    // 2) Detect & carry in-world player riding inside ANY cabin!
    this.nearHeliCabin = null;
    if (pl && pl.enabled && !inside) {
      const isHeli = pl.riding && pl.ride && pl.ride.kind === "heli" && g.heli;
      if (isHeli) {
        this.activeCabin = null;
        // Check if flying mount is hovering cleanly near any of the 12 giant cabins!
        const hx = g.heli.x, hy = g.heli.y, hz = g.heli.z;
        let best = null, bestD = 99;
        for (const cab of this.cabins) {
          const hd = Math.hypot(hx - cab.wx, hz - cab.wz);
          const vd = hy - cab.floorY;
          if (hd < 4.2 && vd > -1.0 && vd < 5.5 && hd < bestD) {
            bestD = hd;
            best = cab;
          }
        }
        this.nearHeliCabin = best;
      } else if (!pl.riding && !pl.seat && !pl.skiing) {
        const footY = pl.y - pl.eye + pl.air;
        // Carry active cabin rider smoothly in 3D!
        if (this.activeCabin) {
          const c = this.activeCabin;
          pl.pos.x += c.dx;
          pl.pos.z += c.dz;
          pl.y += c.dy;
          // Check if rider walked/jumped out of cabin bounds
          const dx = pl.pos.x - c.wx, dz = pl.pos.z - c.wz;
          const cr = Math.cos(this.rot), sr = Math.sin(this.rot);
          const lx = dx * cr - dz * sr;
          const lz = dx * sr + dz * cr;
          const inXZ = Math.abs(lx) <= c.halfW + 0.15 && Math.abs(lz) <= c.halfD + 0.15;
          if (!inXZ || Math.abs((pl.y - pl.eye) - c.floorY) > 1.8) {
            this.activeCabin = null;
          }
        }
        // Auto-detect stepping onto any cabin floor directly from boarding terrace or jumping in!
        if (!this.activeCabin) {
          for (const c of this.cabins) {
            if (Math.abs(footY - c.floorY) < 0.45) {
              const dx = pl.pos.x - c.wx, dz = pl.pos.z - c.wz;
              const cr = Math.cos(this.rot), sr = Math.sin(this.rot);
              const lx = dx * cr - dz * sr;
              const lz = dx * sr + dz * cr;
              if (Math.abs(lx) <= c.halfW && Math.abs(lz) <= c.halfD) {
                this.activeCabin = c;
                break;
              }
            }
          }
        }

        // Update dynamic in-cabin exit/summon spot + check 40m Apex Task completion!
        if (this.activeCabin) {
          const c = this.activeCabin;
          this.cabinExitPos.set(c.wx, c.floorY + 1.1, c.wz);
          if (!this.reachedTop && c.floorY - this.baseY >= 36.5) {
            this.reachedTop = true;
            g.ui.toast("✨ 抵达 42 米巨型星雪摩天轮最高点！整片圣诞雪境与极光都在脚下喵～", 6.0);
            if (g.logic && g.logic.task && !g.logic.task("wheel").done) {
              g.logic.complete("wheel");
            }
          }
        } else {
          this.cabinExitPos.set(0, -999, 0);
        }
      }
    }

    // 3) Animate glowing Christmas Eve Sky-Lanterns drifting gracefully upward into the aurora sky!
    for (let i = this.skyLanterns.length - 1; i >= 0; i--) {
      const lt = this.skyLanterns[i];
      lt.life -= dt;
      if (lt.life <= 0) {
        g.scene.remove(lt.grp);
        this.skyLanterns.splice(i, 1);
        continue;
      }
      lt.grp.position.x += (lt.vx + Math.sin(time * 0.65 + lt.ph) * 0.22) * dt;
      lt.grp.position.y += lt.vy * dt;
      lt.grp.position.z += (lt.vz + Math.cos(time * 0.55 + lt.ph) * 0.22) * dt;
      lt.grp.rotation.y = time * 0.4 + lt.ph;
      lt.grp.rotation.z = Math.sin(time * 1.1 + lt.ph) * 0.06;
      if (lt.life < 6) lt.grp.scale.setScalar(Math.max(0.01, lt.life / 6));
    }

    // 4) Pulse festive lights & bulbs at dusk/night!
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;
    const pulse = 0.85 + 0.22 * Math.sin(time * 3.0);
    this.m.warmBulb.emissiveIntensity = (0.75 + 1.65 * lamps) * pulse;
    this.m.cyanGlow.emissiveIntensity = (0.70 + 1.75 * lamps) * (0.85 + 0.22 * Math.cos(time * 2.7));
    this.m.pinkGlow.emissiveIntensity = (0.70 + 1.75 * lamps) * (0.85 + 0.22 * Math.sin(time * 3.3 + 1.5));
    for (const lt of this.lights) {
      lt.l.intensity = lt.pwr * (0.35 + 0.65 * lamps);
    }
  }
}
