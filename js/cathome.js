// 哈基米星猫小窝乐园 (Gemini's Starlight Kitty Sanctuary)
// Located in the scenic southeast snowy pine glade at (52, 64), connected via starlight trail from (4, 66).

const CAT_SNACKS = [
  "烤得外酥里嫩的黄金小鱼干配热乎乎的草莓星奶，本喵极其极其幸福喵～",
  "喵呜～一口焦香小鱼干配冰蓝星辉特调，寒气瞬间跑光光啦！",
  "刚出炉的猫爪鲷鱼烧冒着甜丝丝的热气，主人快和本喵一起尝一口喵～",
  "热乎乎的樱粉双子星奶喝下去，连猫耳朵都暖洋洋地竖起来啦！",
  "今日份限量「哈基米特供鱼干拼盘」端上桌！补充了极其极其满满的能量喵～"
];

const POOL_LINES = [
  "咕噜咕噜～暖融融的星喵牛奶温泉泡着极其极其舒服，冻僵的小爪子一下子全化开啦喵！",
  "雪花落在热腾腾的星光泉水上化作点点微光，听着小猫呼噜声都不想走啦～",
  "暖呼呼的泉水带着淡淡的草莓奶香，浑身都被星光和暖意包住啦喵～"
];

const DEN_LINES = [
  "钻进极其极其软乎乎的哈基米猫窝软垫里打个盹儿，透过猫耳玻璃顶看雪飘下来，简直太幸福啦喵～",
  "暖炉劈啪作响，猫窝里暖烘烘的，本喵要在这里赖着陪主人看极光喵～"
];

const SLEEP_DREAMS = [
  {
    id: "fish",
    title: "✦ 正在做梦：黄金小鱼干云山",
    img: "assets/dreams/dream_fish.jpg",
    lines: [
      "「唔嗯……焦香脆脆的黄金鲷鱼烧山……这条最大的留一半给主人……呼噜……」",
      "「喵呜……云朵软得像棉花糖，整座山都是香喷喷的小鱼干……极其极其幸福……」"
    ]
  },
  {
    id: "aurora",
    title: "✦ 正在做梦：骑飞猫追极光",
    img: "assets/dreams/dream_aurora.jpg",
    lines: [
      "「嘿嘿……抓到一片青粉色的极光啦……给主人织一条会发光的围巾……呼……」",
      "「飞猫飞高一点喵……星星海里掉下来好多甜丝丝的糖霜雪花……」"
    ]
  },
  {
    id: "cocoa",
    title: "✦ 正在做梦：壁炉与草莓星奶",
    img: "assets/dreams/dream_cocoa.jpg",
    lines: [
      "「棉花糖融进热乎乎的草莓星奶里啦……小猫也来喝一口……咕噜噜……」",
      "「壁炉噼啪响着，窗外在下雪……和主人窝在一起极其极其暖和喵……」"
    ]
  },
  {
    id: "ferris",
    title: "✦ 正在做梦：摩天轮与许愿天灯",
    img: "assets/dreams/dream_ferris.jpg",
    lines: [
      "「坐到雪花摩天轮最高点啦……放飞暖金色天灯……愿主人每天都极其开心喵……」",
      "「满天都是飘起来的小灯笼……本喵偷偷许了个极其极其甜的愿望……」"
    ]
  }
];

const TUCK_LINES = [
  "「唔嗯……软软的星光小被子好暖和……极其极其喜欢主人帮本喵盖被子喵……呼噜……」",
  "「蹭蹭被角……被主人掖好被子之后，连脚趾头都暖呼呼的啦……zzZ……」",
  "「香香软软的被子盖上来啦……本喵要在暖烘烘的被窝里多赖一会儿喵……」"
];

const UNTUCK_LINES = [
  "「呼～被窝里暖呼呼的，探出小爪子透透气喵……」",
  "「翻个小身……露出亮晶晶的星光小裙子吹吹暖炉风喵～」"
];

const PET_LINES = [
  "「呼噜噜噜……主人的手心极其极其暖和，挠耳朵根好舒服……别停下来喵……」",
  "「喵呜～（睡梦里开心地拿毛茸茸的脑袋蹭了蹭主人的手心）极其喜欢主人……」",
  "「唔嘿嘿……耳朵抖了一下……梦到主人一直在摸摸本喵的猫猫头……呼噜……」"
];

// Gentle twinkling winter celesta lullaby melody (Hz, soft pentatonic cradle song)
const LULLABY_NOTES = [
  523.25, 659.25, 783.99, 659.25,
  880.00, 783.99, 659.25, 0,
  587.33, 659.25, 783.99, 1046.50,
  880.00, 783.99, 659.25, 523.25
];

const FW_PALETTE = [
  [0.24, 0.92, 1.45], // Gemini Cyan
  [1.35, 0.42, 1.05], // Sakura Pink
  [0.62, 0.56, 1.48], // Galaxy Periwinkle
  [1.45, 1.15, 0.42]  // Starlight Gold
];

export class CatHome {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.makeLampGlass = helpers.lampGlass;
    this.makeCandle = helpers.candle;
    this.THREE = game.THREE;

    this.center = { x: 52, z: 64 };
    this.poolPos = { x: 44.2, z: 57.2, r: 2.75 };
    this.denPos = { x: 58.5, z: 61.0, r: 4.3 };
    this.trampPos = { x: 52.2, z: 72.5, r: 1.9 };

    this.ready = false;
    this.lights = [];
    this.emissives = [];
    this.spinners = [];
    this.fwQueue = [];
    this.fwRockets = [];

    this.snackIdx = 0;
    this.poolIdx = 0;
    this.denIdx = 0;

    // Animated facility states
    this.swing = {
      pivot: null,
      seatAnchor: null,
      eye: new this.THREE.Vector3(),
      angle: 0,
      vel: 0,
      riding: false,
      spot: null,
      exitPos: new this.THREE.Vector3(),
      exitYaw: 0,
      chimeSide: 0,
      sparkT: 0
    };
    this.denBed = {
      riding: false,
      eye: new this.THREE.Vector3(),
      bedPos: new this.THREE.Vector3(),
      focus: new this.THREE.Vector3(),
      bedYaw: 0,
      zzz: [],
      zzzOrigin: new this.THREE.Vector3(),
      quilt: null,
      quiltK: 0,
      tucked: false,
      petPulse: 0,
      dreamIdx: 0,
      dreamSub: 0,
      dreamTimer: 0,
      dreamSprite: null,
      dreamTextures: [],
      dreamOrigin: new this.THREE.Vector3(),
      lullabyOn: false,
      lullabyT: 0,
      lullabyStep: 0,
      hudEl: null,
      barEl: null,
      spot: null,
      exitPos: new this.THREE.Vector3(),
      exitYaw: 0,
      sparkT: 0
    };
    this.tramp = {
      pad: null,
      baseY: 0,
      squash: 0,
      cool: 0
    };
    this.catTree = {
      yarnPivot: null,
      yarnAng: 0,
      yarnVel: 0,
      kitty: null,
      kittyBaseY: 0
    };
    this.plazaStar = null;
    this.hearthPos = new this.THREE.Vector3();
    this.grillPos = new this.THREE.Vector3();
    this.fountainPos = new this.THREE.Vector3();
    this.steamT = 0;
    this.emberT = 0;
    this.ambientT = 0;

    this._v = new this.THREE.Vector3();
    this._v2 = new this.THREE.Vector3();
  }

  chime(notes, step = 0.08, vol = 0.15) {
    const audio = this.game.audio;
    if (!audio || audio.muted) return;
    if (audio.ctx) {
      const t0 = audio.ctx.currentTime + 0.02;
      notes.forEach((freq, i) => audio.partial(freq, t0 + i * step, vol, 0.92, 0.45, "sine"));
    } else if (audio.pick) {
      audio.pick();
    }
  }

  makeMats() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (r, g, b, rough = 0.45, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: new T.Color(r, g, b), roughness: rough, ...extra }));

    const cyanGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.45, 0.94, 1.0),
      emissive: new T.Color(0.24, 0.88, 1.0),
      emissiveIntensity: 1.4,
      roughness: 0.12,
      metalness: 0.15
    }));
    const pinkGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.56, 0.9),
      emissive: new T.Color(0.96, 0.34, 0.84),
      emissiveIntensity: 1.4,
      roughness: 0.12,
      metalness: 0.15
    }));
    const warmGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.82, 0.58),
      emissive: new T.Color(1.0, 0.52, 0.22),
      emissiveIntensity: 1.6,
      roughness: 0.2
    }));
    this.emissives.push(
      { mat: cyanGlow, base: 1.35, night: 2.15, phase: 0.0 },
      { mat: pinkGlow, base: 1.35, night: 2.15, phase: 1.6 },
      { mat: warmGlow, base: 1.5, night: 2.3, phase: 0.7 }
    );

    const domeGlass = this.wrapMat(new T.MeshPhysicalMaterial({
      color: new T.Color(0.76, 0.88, 1.0),
      roughness: 0.06,
      metalness: 0.04,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      emissive: new T.Color(0.26, 0.22, 0.62),
      emissiveIntensity: 0.22,
      envMapIntensity: 1.6,
      side: T.DoubleSide
    }), { key: "wglass" });

    const poolWater = plain(new T.MeshPhysicalMaterial({
      color: new T.Color(0.74, 0.86, 1.0),
      emissive: new T.Color(0.32, 0.52, 0.88),
      emissiveIntensity: 0.42,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }));

    this.m = {
      indigo: std(0.09, 0.11, 0.26, 0.38, { metalness: 0.36 }),
      indigoWood: std(0.14, 0.16, 0.31, 0.62, { metalness: 0.08 }),
      peri: std(0.34, 0.40, 0.92, 0.34, { metalness: 0.22, emissive: new T.Color(0.11, 0.13, 0.40), emissiveIntensity: 0.22 }),
      lavender: std(0.72, 0.68, 0.96, 0.76, { metalness: 0.02 }),
      sakura: std(0.98, 0.62, 0.85, 0.40, { metalness: 0.04, emissive: new T.Color(0.72, 0.22, 0.54), emissiveIntensity: 0.28 }),
      cream: std(0.95, 0.95, 0.98, 0.64, { metalness: 0.02 }),
      sisal: std(0.84, 0.76, 0.62, 0.88, { metalness: 0.0 }),
      gold: std(0.98, 0.82, 0.46, 0.20, { metalness: 0.86 }),
      stone: std(0.68, 0.72, 0.80, 0.84, { metalness: 0.04 }),
      darkWood: std(0.24, 0.17, 0.13, 0.76, { metalness: 0.02 }),
      taiyaki: std(0.82, 0.50, 0.18, 0.55, { metalness: 0.05 }),
      cyan: cyanGlow,
      pink: pinkGlow,
      warm: warmGlow,
      glass: domeGlass,
      water: poolWater,
      amberEye: std(0.98, 0.68, 0.18, 0.18, { emissive: new T.Color(0.85, 0.48, 0.08), emissiveIntensity: 0.45 }),
      roseEye: std(0.94, 0.26, 0.58, 0.18, { emissive: new T.Color(0.82, 0.18, 0.48), emissiveIntensity: 0.45 }),
      plaza: plain(new T.MeshStandardMaterial({ map: this.makeStarPlazaTex(), roughness: 0.46, metalness: 0.16, emissive: new T.Color(0.16, 0.18, 0.36), emissiveIntensity: 0.26 })),
      deck: plain(new T.MeshStandardMaterial({ map: this.makeDeckTex(), roughness: 0.58, metalness: 0.08 })),
      awning: plain(new T.MeshStandardMaterial({ map: this.makeAwningTex(), roughness: 0.62, side: T.DoubleSide }))
    };
  }

  makeStarPlazaTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    const cx = 256, cy = 256;

    const bg = c.createRadialGradient(cx, cy, 18, cx, cy, 250);
    bg.addColorStop(0, "#242964");
    bg.addColorStop(0.65, "#191d46");
    bg.addColorStop(1, "#2a3166");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 512);

    // Concentric golden star rings
    c.strokeStyle = "#f4cb66";
    c.lineWidth = 6;
    c.beginPath(); c.arc(cx, cy, 236, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, 212, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "rgba(116, 235, 255, 0.55)";
    c.beginPath(); c.arc(cx, cy, 152, 0, Math.PI * 2); c.stroke();

    // 8-point Gemini twin-star compass
    const drawStar = (x, y, rOut, rIn, pts, fill) => {
      c.fillStyle = fill;
      c.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const a = (i * Math.PI) / pts - Math.PI / 2;
        const r = i % 2 === 0 ? rOut : rIn;
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
    };
    drawStar(cx, cy, 185, 36, 4, "rgba(88, 224, 255, 0.85)");
    c.save();
    c.translate(cx, cy);
    c.rotate(Math.PI / 4);
    drawStar(0, 0, 140, 28, 4, "rgba(255, 134, 218, 0.85)");
    c.restore();
    drawStar(cx, cy, 52, 22, 8, "#fff4d2");

    // 4 cute cat paws in the diagonal quadrants
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const px = cx + Math.cos(a) * 184, py = cy + Math.sin(a) * 184;
      c.save();
      c.translate(px, py);
      c.rotate(a + Math.PI / 2);
      c.fillStyle = i % 2 === 0 ? "#ff9ce0" : "#80ecff";
      c.beginPath(); c.ellipse(0, 5, 13, 10, 0, 0, Math.PI * 2); c.fill();
      for (const [bx, by] of [[-14, -6], [-5, -13], [5, -13], [14, -6]]) {
        c.beginPath(); c.arc(bx, by, 4.5, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  makeDeckTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = "#2b2f5c";
    c.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      c.fillStyle = (y / 32) % 2 ? "#31366a" : "#282c56";
      c.fillRect(0, y, 256, 30);
      c.fillStyle = "rgba(18, 20, 42, 0.55)";
      c.fillRect(0, y + 30, 256, 2);
    }
    // Delicate starlight speckles on deck planks
    for (let i = 0; i < 36; i++) {
      const sx = (i * 73 + 19) % 256, sy = (i * 47 + 11) % 256;
      c.fillStyle = i % 2 ? "rgba(130,238,255,0.45)" : "rgba(255,168,230,0.45)";
      c.beginPath(); c.arc(sx, sy, 1.5, 0, Math.PI * 2); c.fill();
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.anisotropy = 8;
    return tex;
  }

  makeAwningTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    const cols = ["#f4f6ff", "#6372f2", "#f4f6ff", "#f682d6"];
    for (let i = 0; i < 8; i++) {
      c.fillStyle = cols[i % 4];
      c.fillRect(i * 32, 0, 32, 256);
    }
    c.fillStyle = "#f4cb66";
    c.fillRect(0, 236, 256, 20);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.anisotropy = 8;
    return tex;
  }

  makeSignPlaque(title, w, h, opts = {}) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = Math.max(128, Math.round(512 * (h / w)));
    const c = cv.getContext("2d");

    const bg = c.createLinearGradient(0, 0, cv.width, cv.height);
    bg.addColorStop(0, "#1d2252");
    bg.addColorStop(0.5, "#2c2b6b");
    bg.addColorStop(1, "#3d2766");
    c.fillStyle = bg;
    c.beginPath();
    c.roundRect(6, 6, cv.width - 12, cv.height - 12, 24);
    c.fill();

    c.strokeStyle = "#f6cf68";
    c.lineWidth = 7;
    c.stroke();

    c.strokeStyle = "rgba(130, 238, 255, 0.5)";
    c.lineWidth = 2.5;
    c.beginPath();
    c.roundRect(16, 16, cv.width - 32, cv.height - 32, 16);
    c.stroke();

    c.fillStyle = opts.color || "#fff8ee";
    c.font = `700 ${Math.round(cv.height * 0.44)}px "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = "rgba(120, 230, 255, 0.55)";
    c.shadowBlur = 10;
    c.fillText(title, cv.width / 2, cv.height / 2 + 2, cv.width - 48);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    const mat = this.wrapMat(new T.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      emissive: new T.Color(0.32, 0.36, 0.68),
      emissiveMap: tex,
      emissiveIntensity: 0.48
    }), { key: "plain" });
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, 0.08), [
      this.m.gold, this.m.gold, this.m.gold, this.m.gold, mat, mat
    ]);
    mesh.castShadow = false;
    return mesh;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  mkStarGeo(rx, ry, inner = 0.32, depth = 0.08) {
    const T = this.THREE;
    const s = new T.Shape();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const px = Math.cos(a) * (i % 2 ? rx * inner : rx);
      const py = Math.sin(a) * (i % 2 ? ry * inner : ry);
      i === 0 ? s.moveTo(px, py) : s.lineTo(px, py);
    }
    s.closePath();
    const g = new T.ExtrudeGeometry(s, {
      depth: depth * 0.5,
      bevelEnabled: true,
      bevelThickness: depth * 0.25,
      bevelSize: Math.min(rx, ry) * 0.08,
      bevelSegments: 1
    });
    g.translate(0, 0, -depth * 0.25);
    return g;
  }

  initSharedGeos() {
    const T = this.THREE;
    const eo = new T.Shape();
    eo.moveTo(-0.34, 0);
    eo.quadraticCurveTo(-0.36, 0.44, 0, 0.78);
    eo.quadraticCurveTo(0.36, 0.44, 0.34, 0);
    eo.closePath();
    this.earOutGeo = new T.ExtrudeGeometry(eo, {
      depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 8
    });
    this.earOutGeo.translate(0, 0, -0.07);

    const ei = new T.Shape();
    ei.moveTo(-0.19, 0.10);
    ei.quadraticCurveTo(-0.20, 0.38, 0, 0.58);
    ei.quadraticCurveTo(0.20, 0.38, 0.19, 0.10);
    ei.closePath();
    this.earInGeo = new T.ExtrudeGeometry(ei, {
      depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 6
    });
    this.earInGeo.translate(0, 0, -0.02);

    this.starSm = this.mkStarGeo(0.11, 0.15, 0.32, 0.05);
    this.starMd = this.mkStarGeo(0.20, 0.27, 0.32, 0.08);
    this.starLg = this.mkStarGeo(0.36, 0.48, 0.30, 0.12);
  }

  mkCatEar(scale = 1, outerMat = this.m.peri, innerMat = this.m.sakura) {
    const g = new this.THREE.Group();
    g.add(
      this.mesh(this.earOutGeo, outerMat),
      this.mesh(this.earInGeo, innerMat, 0, 0, 0.095),
      this.mesh(this.earInGeo, innerMat, 0, 0, -0.095)
    );
    g.scale.setScalar(scale);
    return g;
  }

  mkCatBell(scale = 1) {
    const T = this.THREE;
    const g = new T.Group();
    const ring = new T.TorusGeometry(0.165, 0.024, 6, 18);
    ring.rotateX(Math.PI / 2);
    g.add(
      this.mesh(new T.SphereGeometry(0.16, 12, 10), this.m.gold),
      this.mesh(ring, this.m.gold, 0, -0.015, 0),
      this.mesh(new T.BoxGeometry(0.22, 0.036, 0.06), this.m.indigo, 0, -0.075, 0.135),
      this.mesh(new T.BoxGeometry(0.22, 0.036, 0.06), this.m.indigo, 0, -0.075, -0.135)
    );
    g.scale.setScalar(scale);
    return g;
  }

  // Flat horizontal 3D cat paw (in XZ plane, +Y up) for trampoline / platforms / steps
  mkFlatCatPaw(scale = 1, mainMat = this.m.sakura, beanMat = this.m.pink) {
    const T = this.THREE;
    const g = new T.Group();
    const main = this.mesh(new T.SphereGeometry(0.36, 16, 10), mainMat, 0, 0, 0.18);
    main.scale.set(1.18, 0.28, 0.88);
    const lobeL = this.mesh(new T.SphereGeometry(0.19, 12, 8), mainMat, -0.15, 0, 0.02);
    lobeL.scale.set(1.0, 0.30, 0.92);
    const lobeR = this.mesh(new T.SphereGeometry(0.19, 12, 8), mainMat, 0.15, 0, 0.02);
    lobeR.scale.set(1.0, 0.30, 0.92);
    g.add(main, lobeL, lobeR);
    for (const [bx, bz, br, ry] of [
      [-0.48, -0.16, 0.155, 0.42],
      [-0.18, -0.40, 0.168, 0.14],
      [0.18, -0.40, 0.168, -0.14],
      [0.48, -0.16, 0.155, -0.42]
    ]) {
      const tb = this.mesh(new T.SphereGeometry(br, 12, 8), beanMat, bx, 0.01, bz);
      tb.scale.set(0.85, 0.34, 1.15);
      tb.rotation.y = ry;
      g.add(tb);
    }
    g.scale.setScalar(scale);
    return g;
  }

  // Cute sculpted mini snow-kitty figurine (heterochromia pink + amber eyes like Gemini!)
  mkSnowKitty(scale = 1) {
    const T = this.THREE;
    const g = new T.Group();
    const body = this.mesh(new T.SphereGeometry(0.24, 14, 10), this.m.cream, 0, 0.19, 0);
    body.scale.set(1.05, 0.85, 1.2);
    const head = this.mesh(new T.SphereGeometry(0.20, 14, 10), this.m.cream, 0, 0.44, 0.12);
    head.scale.set(1.08, 0.96, 1.0);
    const eL = this.mkCatEar(0.22, this.m.peri, this.m.sakura);
    eL.position.set(-0.11, 0.56, 0.11); eL.rotation.z = 0.28;
    const eR = this.mkCatEar(0.22, this.m.peri, this.m.sakura);
    eR.position.set(0.11, 0.56, 0.11); eR.rotation.z = -0.28;
    // Heterochromia eyes (left rose-pink, right amber-gold)
    const eyeL = this.mesh(new T.SphereGeometry(0.032, 8, 8), this.m.roseEye, -0.075, 0.46, 0.295);
    const eyeR = this.mesh(new T.SphereGeometry(0.032, 8, 8), this.m.amberEye, 0.075, 0.46, 0.295);
    const nose = this.mesh(new T.SphereGeometry(0.018, 6, 6), this.m.sakura, 0, 0.425, 0.315);
    const scarf = new T.TorusGeometry(0.155, 0.036, 8, 20);
    scarf.rotateX(Math.PI / 2);
    const bell = this.mkCatBell(0.25);
    bell.position.set(0, 0.28, 0.25);
    // Curled tail
    const tailCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, 0.14, -0.22),
      new T.Vector3(0.18, 0.24, -0.32),
      new T.Vector3(0.26, 0.42, -0.20),
      new T.Vector3(0.18, 0.50, -0.10)
    ]);
    const tail = this.mesh(new T.TubeGeometry(tailCurve, 14, 0.042, 8, false), this.m.peri);
    g.add(body, head, eL, eR, eyeL, eyeR, nose, this.mesh(scarf, this.m.peri, 0, 0.30, 0.08), bell, tail);
    g.scale.setScalar(scale);
    return g;
  }

  addLight(x, y, z, color, power, dist = 13, always = false) {
    const l = new this.THREE.PointLight(color, always ? power : 0, dist, 1.5);
    l.position.set(x, y, z);
    this.game.scene.add(l);
    this.lights.push({ light: l, power, always, phase: x * 0.3 + z * 0.2 });
    return l;
  }

  spawnStarBurst(x, y, z, count = 14, spd = 2.4) {
    const g = this.game;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.25;
      const pk = i % 2 === 1;
      const s = spd * (0.65 + Math.random() * 0.65);
      g.puffs.spawn(
        x + Math.cos(a) * 0.2, y + 0.1, z + Math.sin(a) * 0.2,
        Math.cos(a) * s, 0.9 + Math.random() * 1.5, Math.sin(a) * s,
        0.07 + Math.random() * 0.05, 0.9, 0.45 + Math.random() * 0.28,
        pk ? 1 : 0.24, pk ? 0.44 : 0.9, pk ? 0.9 : 1, 2.2, 1.5
      );
    }
    g.sparks.spawn(x, y + 0.25, z, 0, 0.1, 0, 0.7, 1, 0.18, 1.1, 2.5, 3.4, 0, 0);
  }

  build() {
    this.makeMats();
    this.initSharedGeos();

    this.buildTrailAndSign();
    this.buildEntranceArch();
    this.buildCenterPlaza();
    this.buildDomeDen();
    this.buildCatTree();
    this.buildTrampoline();
    this.buildMoonSwing();
    this.buildSnackBar();
    this.buildKittyPool();
    this.buildSummonPad();

    this.ready = true;
    return this;
  }

  // 1. Roadside Signpost + Guiding Cat-Ear Star Lanterns along trail from (4,66) -> (39.4,64)
  buildTrailAndSign() {
    const T = this.THREE;
    const { scene, world } = this.game;

    // Cute starry signpost near main road fork (7.5, 63.2), arrows pointing East (+X) from both directions!
    const sx = 7.5, sz = 63.2, sy = this.qt(sx, sz);
    const signG = new T.Group();
    signG.position.set(sx, sy, sz);
    const post = this.mesh(new T.CylinderGeometry(0.065, 0.08, 2.25, 10), this.m.indigo, 0, 1.12, 0);
    const cap = this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.gold, 0, 2.28, 0);
    const eL = this.mkCatEar(0.24); eL.position.set(-0.09, 2.34, 0); eL.rotation.z = 0.28;
    const eR = this.mkCatEar(0.24); eR.position.set(0.09, 2.34, 0); eR.rotation.z = -0.28;
    const plaqueS = this.makeSignPlaque("✦ 哈基米星猫小窝 →", 1.65, 0.42);
    const plaqueN = this.makeSignPlaque("← 哈基米星猫小窝 ✦", 1.65, 0.42);
    // Combine South-facing (+Z -> right is +X East) and North-facing (-Z -> left is +X East) onto one board!
    const board = new T.Mesh(new T.BoxGeometry(1.65, 0.42, 0.08), [
      this.m.gold, this.m.gold, this.m.gold, this.m.gold, plaqueS.material[4], plaqueN.material[4]
    ]);
    board.position.set(0.55, 1.75, 0);
    const st = this.mesh(this.starSm, this.m.cyan, 1.54, 1.75, 0);
    signG.add(post, cap, eL, eR, board, st);
    scene.add(signG);
    world.circles.push({ x: sx, z: sz, r: 0.22 });

    // 3 Cat-Ear Crystal Snow Lanterns lining the path
    const lanternPts = [
      [16.5, 62.4, true],
      [27.5, 60.4, false],
      [35.5, 61.2, true]
    ];
    for (const [lx, lz, isCyan] of lanternPts) {
      const ly = this.qt(lx, lz);
      const lg = new T.Group();
      lg.position.set(lx, ly, lz);
      const armCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(0, 2.2, 0),
        new T.Vector3(0.22, 2.55, 0),
        new T.Vector3(0.48, 2.42, 0)
      ]);
      lg.add(
        this.mesh(new T.CylinderGeometry(0.14, 0.22, 0.22, 10), this.m.stone, 0, 0.11, 0),
        this.mesh(new T.TubeGeometry(armCurve, 18, 0.045, 8, false), this.m.indigo),
        this.mesh(new T.CylinderGeometry(0.07, 0.07, 0.08, 10), this.m.gold, 0.48, 2.36, 0),
        this.mesh(new T.SphereGeometry(0.18, 14, 10), isCyan ? this.m.cyan : this.m.pink, 0.48, 2.15, 0)
      );
      const le1 = this.mkCatEar(0.22); le1.position.set(0.39, 2.29, 0); le1.rotation.z = 0.35;
      const le2 = this.mkCatEar(0.22); le2.position.set(0.57, 2.29, 0); le2.rotation.z = -0.35;
      const halo = new T.TorusGeometry(0.22, 0.018, 6, 20);
      halo.rotateX(Math.PI / 2);
      lg.add(le1, le2, this.mesh(halo, this.m.gold, 0.48, 2.15, 0));
      scene.add(lg);
      world.circles.push({ x: lx, z: lz, r: 0.24 });
    }
  }

  // 2. Entrance Starlight Cat-Ear Arch at (39.4, 64.0)
  buildEntranceArch() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const ax = 39.4, az = 64.0, ay = this.qt(ax, az);
    const g = new T.Group();
    g.position.set(ax, ay, az);
    g.rotation.y = -Math.PI / 2; // Front faces West (-X) toward arriving players

    // Pillars at local x = ±2.1 (world z = 64 ± 2.1)
    for (const side of [-1, 1]) {
      const px = side * 2.1;
      g.add(
        this.mesh(new T.CylinderGeometry(0.30, 0.36, 0.35, 12), this.m.stone, px, 0.175, 0),
        this.mesh(new T.CylinderGeometry(0.18, 0.21, 3.25, 12), this.m.indigo, px, 1.80, 0),
        this.mesh(new T.TorusGeometry(0.23, 0.04, 8, 20).rotateX(Math.PI / 2), this.m.gold, px, 0.40, 0),
        this.mesh(new T.TorusGeometry(0.22, 0.04, 8, 20).rotateX(Math.PI / 2), this.m.gold, px, 3.35, 0),
        this.mesh(new T.SphereGeometry(0.22, 12, 10), this.m.gold, px, 3.55, 0)
      );
      const bell = this.mkCatBell(0.75);
      bell.position.set(side * 1.75, 3.12, 0);
      g.add(bell);
      world.circles.push({ x: ax, z: az - side * 2.1, r: 0.36 });
    }

    // Sweeping golden crescent arch
    const archCurve = new T.CatmullRomCurve3([
      new T.Vector3(-2.1, 3.4, 0),
      new T.Vector3(-1.45, 4.35, 0),
      new T.Vector3(0, 4.75, 0),
      new T.Vector3(1.45, 4.35, 0),
      new T.Vector3(2.1, 3.4, 0)
    ]);
    g.add(this.mesh(new T.TubeGeometry(archCurve, 28, 0.11, 10, false), this.m.gold));
    const innerArch = new T.CatmullRomCurve3([
      new T.Vector3(-1.95, 3.3, 0),
      new T.Vector3(-1.3, 4.12, 0),
      new T.Vector3(0, 4.46, 0),
      new T.Vector3(1.3, 4.12, 0),
      new T.Vector3(1.95, 3.3, 0)
    ]);
    g.add(this.mesh(new T.TubeGeometry(innerArch, 24, 0.055, 8, false), this.m.peri));

    // Giant sculpted cat ears crowning the entrance arch!
    const earL = this.mkCatEar(1.35);
    earL.position.set(-1.05, 4.42, 0); earL.rotation.z = 0.34;
    const earR = this.mkCatEar(1.35);
    earR.position.set(1.05, 4.42, 0); earR.rotation.z = -0.34;
    const topStar = new T.Group();
    topStar.position.set(0, 5.18, 0);
    topStar.add(
      this.mesh(this.starLg, this.m.cyan, 0, 0, 0.03),
      this.mesh(this.starLg, this.m.pink, 0, 0, -0.03),
      this.mesh(new T.TorusGeometry(0.46, 0.03, 6, 24), this.m.gold)
    );
    this.spinners.push({ obj: topStar, speed: 1.35, bobY: 5.18, bobAmp: 0.06 });

    // Glowing nameplate
    const plaque = this.makeSignPlaque("✦ 哈基米星猫小窝 ✦", 2.9, 0.64);
    plaque.position.set(0, 3.88, 0);

    // Fairy star accents along the arch
    for (let i = -3; i <= 3; i++) {
      const fx = i * 0.52;
      const fy = 4.45 - Math.abs(i) * 0.14;
      g.add(this.mesh(this.starSm, i % 2 === 0 ? this.m.cyan : this.m.pink, fx, fy, 0.10));
    }

    g.add(earL, earR, topStar, plaque);
    scene.add(g);
  }

  // 3. Center Courtyard Star Mosaic Plaza & Twin-Star Kitty Firework Pedestal at (50.5, 64.0)
  buildCenterPlaza() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const px = 50.5, pz = 64.0, py = this.qt(px, pz);
    const g = new T.Group();
    g.position.set(px, py, pz);

    // Walkable circular mosaic plaza
    const disc = this.mesh(new T.CylinderGeometry(2.75, 2.95, 0.08, 40), this.m.plaza, 0, 0.04, 0);
    const rim = new T.TorusGeometry(2.85, 0.06, 8, 44);
    rim.rotateX(Math.PI / 2);
    g.add(disc, this.mesh(rim, this.m.gold, 0, 0.06, 0));

    // Central Kitty Firework Pedestal
    const ped = new T.Group();
    ped.add(
      this.mesh(new T.CylinderGeometry(0.42, 0.56, 0.62, 16), this.m.indigo, 0, 0.35, 0),
      this.mesh(new T.TorusGeometry(0.46, 0.045, 8, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.66, 0),
      this.mesh(new T.CylinderGeometry(0.18, 0.22, 0.38, 12), this.m.peri, 0, 0.85, 0),
      this.mesh(new T.TorusGeometry(0.20, 0.03, 8, 18).rotateX(Math.PI / 2), this.m.gold, 0, 1.04, 0)
    );
    const pe1 = this.mkCatEar(0.32); pe1.position.set(-0.26, 0.82, 0); pe1.rotation.z = 0.36;
    const pe2 = this.mkCatEar(0.32); pe2.position.set(0.26, 0.82, 0); pe2.rotation.z = -0.36;
    const orb = new T.Group();
    orb.position.set(0, 1.38, 0);
    orb.add(
      this.mesh(this.starMd, this.m.cyan, 0, 0, 0.03),
      this.mesh(this.starMd, this.m.pink, 0, 0, -0.03)
    );
    this.plazaStar = orb;
    this.spinners.push({ obj: orb, speed: 1.9, bobY: 1.38, bobAmp: 0.07 });
    ped.add(pe1, pe2, orb);
    g.add(ped);
    scene.add(g);

    world.circles.push({ x: px, z: pz, r: 0.62, top: 0.92 });
    world.spots.push({
      id: "cathome_fireworks",
      pos: new T.Vector3(px, py + 1.1, pz),
      r: 2.8,
      label: "燃放哈基米双子星猫猫烟花",
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat,
      act: () => this.triggerFireworks(px, py + 1.2, pz)
    });
  }

  triggerFireworks(x, y, z) {
    const g = this.game;
    this.chime([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.065, 0.16);
    g.character?.play("cheer");
    g.friends?.cheer("cheer");
    this.spawnStarBurst(x, y, z, 14, 2.2);
    for (let i = 0; i < 6; i++) {
      this.fwQueue.push({
        t: 0.15 + i * 0.45,
        x, y, z,
        big: i === 5,
        col: FW_PALETTE[i % FW_PALETTE.length]
      });
    }
    g.ui.toast("咻——砰！哈基米双子星猫猫烟花在星猫小窝上空绽放啦喵～", 4.5);
  }

  launchCatRocket(item) {
    const T = this.THREE;
    const a = Math.random() * Math.PI * 2;
    const spread = 2.0 + Math.random() * 4.5;
    this.fwRockets.push({
      p: new T.Vector3(item.x, item.y, item.z),
      v: new T.Vector3(Math.cos(a) * spread, 23 + Math.random() * 5 + (item.big ? 3 : 0), Math.sin(a) * spread),
      life: 1.05 + Math.random() * 0.25 + (item.big ? 0.15 : 0),
      col: item.col,
      big: item.big
    });
    this.game.audio?.rocket && this.game.audio.rocket();
  }

  burstCatRocket(rk) {
    const g = this.game;
    const pool = (g.places && g.places.fwPool) || g.sparks;
    const n = rk.p;
    const count = rk.big ? 240 : 140;
    const spd = rk.big ? 16 : 11.5;
    const altCol = FW_PALETTE[(FW_PALETTE.indexOf(rk.col) + 1) % FW_PALETTE.length];

    // Spherical twin-star burst + subtle cat-ear silhouette crown on the finale!
    for (let i = 0; i < count; i++) {
      const cz = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const sr = Math.sqrt(Math.max(0, 1 - cz * cz));
      const d = spd * (0.78 + Math.random() * 0.28);
      const c = i % 3 === 0 ? altCol : rk.col;
      pool.spawn(
        n.x, n.y, n.z,
        Math.cos(phi) * sr * d, cz * d, Math.sin(phi) * sr * d,
        0.44 + Math.random() * 0.24, 1.0, 1.55 + Math.random() * 0.9,
        c[0], c[1], c[2], 2.5, 1.4
      );
    }
    // Bright starlight flash core
    g.sparks.spawn(n.x, n.y, n.z, 0, 0, 0, 0.9, 1, 0.55, rk.col[0] * 1.4, rk.col[1] * 1.4, rk.col[2] * 1.4, 0, 0);
    g.audio?.boom && g.audio.boom(rk.big ? 1.0 : 0.72);
  }

  // 4. Centerpiece: Starlight Cat-Ear Crystal Dome Den at (58.5, 61.0)
  buildDomeDen() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const dx = this.denPos.x, dz = this.denPos.z, dy = this.qt(dx, dz);
    const yaw = Math.atan2(50.5 - dx, 64.0 - dz); // Open front faces courtyard (50.5, 64.0)
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

    const g = new T.Group();
    g.position.set(dx, dy, dz);
    g.rotation.y = yaw;

    // Raised circular starlight wooden deck (h = 0.34m, r = 4.4m)
    const deckH = 0.34, deckR = 4.4;
    g.add(
      this.mesh(new T.CylinderGeometry(deckR, deckR + 0.16, deckH, 40), this.m.deck, 0, deckH / 2, 0),
      this.mesh(new T.TorusGeometry(deckR, 0.075, 8, 44).rotateX(Math.PI / 2), this.m.gold, 0, deckH + 0.01, 0)
    );

    // Wide welcoming front steps along local +Z (z = 4.35..5.15)
    for (let i = 0; i < 2; i++) {
      const sh = deckH * (1 - (i + 0.5) / 2.2);
      const sz = 4.52 + i * 0.38;
      g.add(
        this.mesh(new T.BoxGeometry(2.65 - i * 0.15, sh, 0.42), this.m.indigoWood, 0, sh / 2, sz),
        this.mesh(new T.BoxGeometry(2.65 - i * 0.15, 0.035, 0.05), this.m.gold, 0, sh + 0.01, sz + 0.19)
      );
    }
    const stepPaw = this.mkFlatCatPaw(0.32, this.m.sakura, this.m.pink);
    stepPaw.position.set(0, deckH + 0.015, 3.85);
    g.add(stepPaw);

    // Walkable deck & smooth front steps ramp in world.platforms!
    const toLocal = (wx, wz) => {
      const rx = wx - dx, rz = wz - dz;
      return [rx * cosY - rz * sinY, rx * sinY + rz * cosY];
    };
    world.platforms.push(
      {
        test: (wx, wz) => (wx - dx) ** 2 + (wz - dz) ** 2 < (deckR + 0.05) ** 2,
        y: () => dy + deckH,
        wood: true
      },
      {
        test: (wx, wz) => {
          const [lx, lz] = toLocal(wx, wz);
          return Math.abs(lx) < 1.38 && lz >= deckR - 0.1 && lz <= deckR + 0.92;
        },
        y: (wx, wz) => {
          const [, lz] = toLocal(wx, wz);
          const t = Math.max(0, Math.min(1, (lz - (deckR - 0.1)) / 1.02));
          return dy + deckH * (1 - t);
        },
        wood: true
      }
    );

    // Open-front curved lower starry walls (rear 256°, leaving wide 104° doorway around local +Z!)
    const domeR = 3.85;
    const openHalf = 0.92; // ±52.7° open front entrance (doorway width ~6.1m chord!)
    const wallSpan = Math.PI * 2 - openHalf * 2;
    const wallH = 1.48;
    // CylinderGeometry theta=0 is at +Z, increasing toward +X -> start at +openHalf, sweep wallSpan
    const wallGeo = new T.CylinderGeometry(domeR, domeR, wallH, 32, 1, true, openHalf, wallSpan);
    const wallMat = this.wrapMat(new T.MeshStandardMaterial({
      color: new T.Color(0.11, 0.13, 0.30),
      roughness: 0.42,
      metalness: 0.32,
      side: T.DoubleSide
    }), { key: "plain" });
    g.add(this.mesh(wallGeo, wallMat, 0, deckH + wallH / 2, 0));

    // Gold circular eave trim ring (around solid wall span) & dome zenith ring
    const eaveY = deckH + wallH;
    const eavePts = [];
    for (let i = 0; i <= 28; i++) {
      const a = openHalf + (wallSpan * i) / 28;
      eavePts.push(new T.Vector3(Math.sin(a) * domeR, eaveY, Math.cos(a) * domeR));
    }
    g.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(eavePts), 32, 0.085, 8, false), this.m.gold));

    // Translucent starry crystal glass dome roof seated flush on the golden eave ring!
    const glassDome = this.mesh(
      new T.SphereGeometry(domeR - 0.04, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.50),
      this.m.glass, 0, eaveY, 0
    );
    glassDome.scale.y = 0.90;
    glassDome.renderOrder = 3;
    glassDome.castShadow = false;
    g.add(glassDome);

    // 8 Arched golden ribs rising from deck / eave to zenith crown
    const zenithY = eaveY + domeR * 0.90;
    const ribAngles = [];
    for (let i = 0; i < 8; i++) ribAngles.push(openHalf + (wallSpan * i) / 7);
    for (const a of ribAngles) {
      const ca = Math.cos(a), sa = Math.sin(a);
      // Lower vertical column from deck to eave
      g.add(this.mesh(new T.CylinderGeometry(0.08, 0.095, wallH, 8), this.m.gold, sa * domeR, deckH + wallH / 2, ca * domeR));
      // Curved golden dome rib up to zenith
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const phi = (k / 10) * (Math.PI * 0.50);
        const rr = Math.cos(phi) * domeR;
        const yy = eaveY + Math.sin(phi) * domeR * 0.90;
        pts.push(new T.Vector3(sa * rr, yy, ca * rr));
      }
      g.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 14, 0.06, 8, false), this.m.gold));
    }

    // Wall colliders ONLY along the solid rear/side arc (front doorway stays 100% open!)
    for (let i = 0; i <= 12; i++) {
      const a = openHalf + (wallSpan * i) / 12;
      const lx = Math.sin(a) * domeR, lz = Math.cos(a) * domeR;
      const wx = dx + lx * cosY + lz * sinY;
      const wz = dz - lx * sinY + lz * cosY;
      world.circles.push({ x: wx, z: wz, r: 0.42 });
    }

    // Grand Arched Doorway Frame & Cat Bells at the open front!
    const doorPts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const a = -openHalf + t * openHalf * 2;
      const lift = Math.sin(t * Math.PI) * 1.15;
      doorPts.push(new T.Vector3(Math.sin(a) * (domeR + 0.04), eaveY + lift, Math.cos(a) * (domeR + 0.04)));
    }
    g.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(doorPts), 22, 0.095, 8, false), this.m.gold));

    // Glowing header plaque above the doorway
    const denSign = this.makeSignPlaque("✦ 哈基米小窝 ✦", 2.35, 0.50);
    denSign.position.set(0, eaveY + 1.38, domeR + 0.14);
    g.add(denSign);

    // Twin hanging golden cat bells flanking the entrance arch
    for (const side of [-1, 1]) {
      const ba = side * (openHalf - 0.14);
      const bell = this.mkCatBell(0.72);
      bell.position.set(Math.sin(ba) * domeR, eaveY - 0.12, Math.cos(ba) * domeR);
      g.add(bell);
    }

    // Fairy star lights ringing the eaves
    for (let i = 0; i < 14; i++) {
      const a = openHalf + (wallSpan * (i + 0.5)) / 14;
      g.add(this.mesh(this.starSm, i % 2 === 0 ? this.m.cyan : this.m.pink, Math.sin(a) * (domeR + 0.06), eaveY + 0.02, Math.cos(a) * (domeR + 0.06)));
    }

    // MONUMENTAL SCULPTED CAT EARS crowning the dome roof + spinning twin-star finial!
    const crownRing = new T.TorusGeometry(0.68, 0.075, 8, 28);
    crownRing.rotateX(Math.PI / 2);
    g.add(this.mesh(crownRing, this.m.gold, 0, zenithY + 0.02, 0));

    const roofEarL = this.mkCatEar(2.05);
    roofEarL.position.set(-1.38, zenithY - 0.36, 0.25);
    roofEarL.rotation.set(0.12, 0.18, 0.42);
    const roofEarR = this.mkCatEar(2.05);
    roofEarR.position.set(1.38, zenithY - 0.36, 0.25);
    roofEarR.rotation.set(0.12, -0.18, -0.42);
    g.add(roofEarL, roofEarR);

    const crownStar = new T.Group();
    crownStar.position.set(0, zenithY + 0.72, 0);
    crownStar.add(
      this.mesh(this.starLg, this.m.cyan, 0, 0, 0.04),
      this.mesh(this.starLg, this.m.pink, 0, 0, -0.04),
      this.mesh(new T.TorusGeometry(0.56, 0.036, 6, 26), this.m.gold)
    );
    this.spinners.push({ obj: crownStar, speed: 1.15, bobY: zenithY + 0.72, bobAmp: 0.09 });
    g.add(crownStar);

    // === COZY WALK-IN INTERIOR FURNISHINGS ===
    // (a) Giant Plush Cat-Ear Bed Cushion at back-center (local 0, deckH, -1.35)
    const bedG = new T.Group();
    bedG.position.set(0, deckH, -1.35);
    const bedBase = this.mesh(new T.CylinderGeometry(1.42, 1.52, 0.22, 28), this.m.lavender, 0, 0.11, 0);
    const bedInner = this.mesh(new T.CylinderGeometry(1.12, 1.16, 0.24, 24), this.m.cream, 0, 0.12, 0);
    const bedRim = new T.TorusGeometry(1.26, 0.24, 12, 32);
    bedRim.rotateX(Math.PI / 2);
    const bedRimMesh = this.mesh(bedRim, this.m.sakura, 0, 0.24, 0);
    bedRimMesh.scale.set(1, 0.78, 1);
    const blanket = this.mesh(new T.BoxGeometry(1.18, 0.06, 0.94), this.m.peri, 0.0, 0.25, 0.06);
    blanket.rotation.y = 0.08;
    const bEarL = this.mkCatEar(0.52, this.m.lavender, this.m.sakura);
    bEarL.position.set(-0.52, 0.34, -1.16); bEarL.rotation.z = 0.28;
    const bEarR = this.mkCatEar(0.52, this.m.lavender, this.m.sakura);
    bEarR.position.set(0.52, 0.34, -1.16); bEarR.rotation.z = -0.28;
    // Star pillow neatly positioned right under the sleeping cat's head (+X side of plush cushion!)
    const starPillow = this.mesh(this.starMd, this.m.cyan, 0.50, 0.275, -0.05);
    starPillow.rotation.set(Math.PI / 2 - 0.14, 0.15, 0.25);
    // Cozy snow-kitty plushie tucked on the opposite back-left corner so sleeping character has zero clipping!
    const bedKitty = this.mkSnowKitty(0.68);
    bedKitty.position.set(-0.74, 0.24, -0.52);
    bedKitty.rotation.y = 0.65;
    bedG.add(bedBase, bedInner, bedRimMesh, blanket, bEarL, bEarR, starPillow, bedKitty);

    // Sculpted 3D Plush Starlight Tuck-In Quilt (drapes snugly over her curled torso/legs when tucked!)
    const quiltG = this._buildSleepQuilt();
    quiltG.position.set(-0.18, 0.27, 0.06);
    quiltG.visible = false;
    bedG.add(quiltG);
    this.denBed.quilt = quiltG;

    g.add(bedG);

    // (b) Cozy Warm Mini Kitty Hearth & Strawberry-Milk Snack Table on inner-right
    const hearthG = new T.Group();
    hearthG.position.set(1.95, deckH, -0.15);
    hearthG.rotation.y = -1.1;
    hearthG.add(
      this.mesh(new T.CylinderGeometry(0.46, 0.54, 0.52, 16), this.m.stone, 0, 0.26, 0),
      this.mesh(new T.TorusGeometry(0.46, 0.05, 8, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.52, 0),
      this.mesh(new T.SphereGeometry(0.32, 12, 8), this.m.warm, 0, 0.52, 0)
    );
    const he1 = this.mkCatEar(0.28); he1.position.set(-0.28, 0.52, -0.18); he1.rotation.z = 0.28;
    const he2 = this.mkCatEar(0.28); he2.position.set(0.28, 0.52, -0.18); he2.rotation.z = -0.28;
    hearthG.add(he1, he2);
    g.add(hearthG);

    // Low kitty snack table beside bed
    const tbl = new T.Group();
    tbl.position.set(1.45, deckH, 1.15);
    tbl.add(
      this.mesh(new T.CylinderGeometry(0.55, 0.55, 0.07, 20), this.m.cream, 0, 0.42, 0),
      this.mesh(new T.TorusGeometry(0.55, 0.025, 6, 24).rotateX(Math.PI / 2), this.m.gold, 0, 0.42, 0),
      this.mesh(new T.CylinderGeometry(0.06, 0.14, 0.40, 10), this.m.indigo, 0, 0.20, 0),
      // Strawberry milk mug + golden fish plate
      this.mesh(new T.CylinderGeometry(0.075, 0.065, 0.16, 12), this.m.sakura, -0.18, 0.53, 0.08),
      this.mesh(new T.CylinderGeometry(0.068, 0.068, 0.02, 12), this.m.cream, -0.18, 0.60, 0.08),
      this.mesh(new T.CylinderGeometry(0.18, 0.14, 0.03, 14), this.m.cream, 0.16, 0.47, -0.05),
      this.mesh(new T.SphereGeometry(0.09, 10, 8), this.m.taiyaki, 0.16, 0.51, -0.05)
    );
    tbl.children[tbl.children.length - 1].scale.set(1.4, 0.55, 0.85);
    g.add(tbl);

    // (c) Starry Bookshelf & Glowing Wish Star Jars on inner-left
    const shelf = new T.Group();
    shelf.position.set(-2.15, deckH, -0.35);
    shelf.rotation.y = 1.25;
    shelf.add(
      this.mesh(new T.BoxGeometry(1.15, 1.35, 0.36), this.m.indigoWood, 0, 0.68, 0),
      this.mesh(new T.BoxGeometry(1.22, 0.06, 0.40), this.m.gold, 0, 1.37, 0)
    );
    const jarCols = [this.m.cyan, this.m.pink, this.m.warm, this.m.cyan];
    for (let i = 0; i < 4; i++) {
      shelf.add(this.mesh(new T.CylinderGeometry(0.065, 0.065, 0.18, 10), jarCols[i], -0.36 + i * 0.24, 1.49, 0));
    }
    g.add(shelf);

    scene.add(g);
    g.updateMatrixWorld(true);

    // Register hearth ember world pos + warm interior PointLight
    this.hearthPos.set(1.95, deckH + 0.65, -0.15).applyMatrix4(g.matrixWorld);
    this.addLight(dx, dy + 2.35, dz, 0xffd2a8, 11, 15, true);

    // Interior furniture colliders (prevent walking straight through hearth, snack table & bookshelf!)
    const addDenCol = (lx, lz, r, top) => {
      const wp = new T.Vector3(lx, 0, lz).applyMatrix4(g.matrixWorld);
      world.circles.push({ x: wp.x, z: wp.z, r, top });
    };
    addDenCol(1.95, -0.15, 0.54, deckH + 0.78);  // Mini Kitty Hearth
    addDenCol(1.45, 1.15, 0.56, deckH + 0.52);   // Strawberry-Milk Snack Table
    addDenCol(-2.15, -0.35, 0.62, deckH + 1.45); // Starry Bookshelf

    // Cozy Visible 3rd-Person Cat-Bed Nap Seat Interaction (watch Gemini curled up sleeping on the bed!)
    this.denBed.eye.set(0, deckH + 1.05, -1.25).applyMatrix4(g.matrixWorld);
    this.denBed.bedPos.set(-0.56, deckH + 0.44, -1.30).applyMatrix4(g.matrixWorld);
    this.denBed.focus.set(0.05, deckH + 0.60, -1.28).applyMatrix4(g.matrixWorld);
    this.denBed.zzzOrigin.set(0.48, deckH + 0.85, -1.32).applyMatrix4(g.matrixWorld);
    this.denBed.bedYaw = yaw + Math.PI;
    this.denBed.exitPos.set(0, 0, 1.55).applyMatrix4(g.matrixWorld);
    this.denBed.exitYaw = yaw;
    this.denBed.spot = {
      id: "cathome_bed_exit",
      label: "叫醒猫猫 · 从猫窝里起身",
      can: () => true,
      act: () => this.leaveDenBed()
    };

    // Floating adorable pastel "Z / z / ✦" dream sprites hovering over the sleeping kitty!
    const mkDreamSprite = (glyph, colorHex, scale) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = "900 84px 'Segoe UI', 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 10;
      ctx.strokeStyle = "rgba(18, 22, 52, 0.75)";
      ctx.strokeText(glyph, 64, 66);
      ctx.fillStyle = colorHex;
      ctx.fillText(glyph, 64, 66);
      const tex = new T.CanvasTexture(cv);
      tex.colorSpace = T.SRGBColorSpace;
      const mat = new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false });
      const sp = new T.Sprite(mat);
      sp.scale.setScalar(scale);
      sp.visible = false;
      sp.renderOrder = 7;
      scene.add(sp);
      return sp;
    };
    this.denBed.zzz = [
      { sp: mkDreamSprite("Z", "#88f2ff", 0.34), ph: 0.0 },
      { sp: mkDreamSprite("z", "#ff9ce0", 0.27), ph: 0.33 },
      { sp: mkDreamSprite("✦", "#ffe680", 0.23), ph: 0.66 }
    ];

    // Floating 3D Storybook Dream-Cloud Picture Sprite hovering gracefully over her sleeping head!
    this.denBed.dreamOrigin.set(0.30, deckH + 1.32, -1.46).applyMatrix4(g.matrixWorld);
    this._initDreamCloudTextures();
    const dreamMat = new T.SpriteMaterial({
      map: this.denBed.dreamTextures[0] || null,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false
    });
    const dreamSp = new T.Sprite(dreamMat);
    dreamSp.scale.set(1.12, 1.12, 1);
    dreamSp.visible = false;
    dreamSp.renderOrder = 8;
    scene.add(dreamSp);
    this.denBed.dreamSprite = dreamSp;
    this._ensureSleepUI();

    const bedWorld = new T.Vector3(0, deckH + 0.55, -1.25).applyMatrix4(g.matrixWorld);
    world.spots.push({
      id: "cathome_bed",
      pos: bedWorld,
      r: 2.6,
      label: "蜷进哈基米星梦猫窝睡觉觉（可盖被子·摸猫头·看美梦喵～）",
      can: () => !this.game.player.seat && !this.game.player.riding && !this.game.player.skiing,
      act: () => this.enterDenBed(yaw)
    });
  }

  _makeQuiltTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");

    // Dreamy twilight-lavender to starry-periwinkle quilted velvet gradient
    const bg = c.createLinearGradient(0, 0, 512, 512);
    bg.addColorStop(0, "#7b86e8");
    bg.addColorStop(0.5, "#9c7ee8");
    bg.addColorStop(1, "#e288cf");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 512);

    // Subtle quilted diamond stitch lines
    c.strokeStyle = "rgba(255, 245, 255, 0.28)";
    c.lineWidth = 2.5;
    for (let i = -512; i <= 1024; i += 64) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 512, 512); c.stroke();
      c.beginPath(); c.moveTo(i, 512); c.lineTo(i + 512, 0); c.stroke();
    }

    // Embroidered golden four-point stars & adorable pastel sakura cat paws!
    const drawStar = (x, y, r, col) => {
      c.fillStyle = col;
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const rr = i % 2 ? r * 0.36 : r;
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath(); c.fill();
    };
    const drawPaw = (x, y, s) => {
      c.fillStyle = "rgba(255, 224, 244, 0.82)";
      c.beginPath(); c.ellipse(x, y + s * 0.16, s * 0.42, s * 0.34, 0, 0, Math.PI * 2); c.fill();
      for (const [dx, dy] of [[-0.36, -0.22], [-0.12, -0.38], [0.14, -0.38], [0.36, -0.22]]) {
        c.beginPath(); c.arc(x + dx * s, y + dy * s, s * 0.14, 0, Math.PI * 2); c.fill();
      }
    };
    for (let gx = 48; gx < 512; gx += 96) {
      for (let gy = 48; gy < 512; gy += 96) {
        if (((gx + gy) / 96) % 2 === 0) drawPaw(gx, gy, 24);
        else drawStar(gx, gy, 18, "#ffe992");
      }
    }

    // Plush cream-pink scalloped lace border along top neck fold (+X edge = right side of UV!)
    c.fillStyle = "#ffe5f4";
    c.fillRect(450, 0, 62, 512);
    c.fillStyle = "#ffd37a";
    c.fillRect(444, 0, 8, 512);

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  _buildSleepQuilt() {
    const T = this.THREE;
    const qg = new T.Group();

    // Sculpted pillowy curved duvet draping smoothly over her curled sleeping torso & legs (zero clipping!)
    const w = 1.00, d = 0.90;
    const geo = new T.PlaneGeometry(w, d, 20, 18);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); // -w/2 .. +w/2
      const z = pos.getZ(i); // -d/2 .. +d/2
      const u = (x + w / 2) / w; // 0 (feet) -> 1 (shoulders/chin)
      const v = (z + d / 2) / d; // 0 (back) -> 1 (front knees)
      const archX = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 0.56);
      const archZ = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.52);
      // Soft pillowy loft cleanly clearing curled hips/knees (~0.40m above blanket base = 0.67m deckY)
      const puff = 0.37 * archX * archZ + 0.045 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
      const ripple = 0.012 * Math.sin(u * 14) * Math.sin(v * 10) * archX * archZ;
      pos.setY(i, Math.max(0.005, puff + ripple));
    }
    geo.computeVertexNormals();

    const quiltMat = this.wrapMat(new T.MeshStandardMaterial({
      map: this._makeQuiltTex(),
      roughness: 0.72,
      metalness: 0.04,
      emissive: new T.Color(0.24, 0.18, 0.42),
      emissiveIntensity: 0.18,
      side: T.DoubleSide
    }), { key: "plain" });
    const duvet = new T.Mesh(geo, quiltMat);
    duvet.receiveShadow = true;
    qg.add(duvet);

    // Plush rolled sakura-pink folded duvet collar along the neck edge (+X = +0.46) with tiny golden stars!
    const collarPts = [];
    for (let k = 0; k <= 12; k++) {
      const v = k / 12;
      const z = (v - 0.5) * (d * 0.86);
      const arch = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.55);
      collarPts.push(new T.Vector3(w * 0.44, 0.03 + 0.25 * arch, z));
    }
    const collarMesh = this.mesh(
      new T.TubeGeometry(new T.CatmullRomCurve3(collarPts), 18, 0.055, 10, false),
      this.m.sakura
    );
    qg.add(collarMesh);
    return qg;
  }

  _initDreamCloudTextures() {
    const T = this.THREE;
    this.denBed.dreamTextures = SLEEP_DREAMS.map((dream) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 512;
      const tex = new T.CanvasTexture(cv);
      tex.colorSpace = T.SRGBColorSpace;

      const drawCloudFrame = (img) => {
        const c = cv.getContext("2d");
        c.clearRect(0, 0, 512, 512);

        // Soft scalloped thought-cloud clip path centered at (256, 224)
        const traceCloud = (scale = 1) => {
          c.beginPath();
          const puffs = [
            [256, 118, 108], [156, 152, 92], [356, 152, 92],
            [118, 240, 88], [394, 240, 88],
            [168, 326, 86], [344, 326, 86], [256, 344, 96]
          ];
          for (const [px, py, pr] of puffs) {
            c.moveTo(256 + (px - 256) * scale + pr * scale, 226 + (py - 226) * scale);
            c.arc(256 + (px - 256) * scale, 226 + (py - 226) * scale, pr * scale, 0, Math.PI * 2);
          }
        };

        // Dreamy glowing white-lavender outer cloud halo
        c.save();
        c.shadowColor = "rgba(148, 224, 255, 0.85)";
        c.shadowBlur = 24;
        c.fillStyle = "rgba(255, 250, 255, 0.96)";
        traceCloud(1.03);
        c.fill();
        c.restore();

        // Clipped storybook dream illustration inside the cloud!
        if (img) {
          c.save();
          traceCloud(0.92);
          c.clip();
          c.drawImage(img, 46, 22, 420, 420);
          // Delicate pastel inner vignette blending illustration smoothly into cloud border
          const vig = c.createRadialGradient(256, 226, 130, 256, 226, 225);
          vig.addColorStop(0, "rgba(255,255,255,0)");
          vig.addColorStop(0.82, "rgba(255,244,255,0.12)");
          vig.addColorStop(1, "rgba(255,248,255,0.72)");
          c.fillStyle = vig;
          c.fillRect(0, 0, 512, 512);
          c.restore();
        }

        // Cute trailing thought-cloud bubbles floating down toward Gemini's sleeping head!
        for (const [bx, by, br] of [[248, 444, 22], [232, 480, 13], [220, 502, 7]]) {
          c.fillStyle = "rgba(255, 250, 255, 0.94)";
          c.beginPath(); c.arc(bx, by, br, 0, Math.PI * 2); c.fill();
          c.strokeStyle = "rgba(182, 168, 240, 0.55)";
          c.lineWidth = 2;
          c.stroke();
        }
        tex.needsUpdate = true;
      };

      drawCloudFrame(null);
      const im = new Image();
      im.onload = () => drawCloudFrame(im);
      im.src = dream.img + "?v=11241135";
      return tex;
    });
  }

  _ensureSleepUI() {
    if (this.denBed.barEl) return;
    const hud = document.getElementById("hud") || document.body;

    const dreamHud = document.createElement("div");
    dreamHud.id = "dreamHud";
    dreamHud.innerHTML = `<img class="d-thumb" alt="梦境画面"><div class="d-body"><div class="d-title"></div><div class="d-text"></div></div>`;

    const bar = document.createElement("div");
    bar.id = "sleepBar";
    bar.innerHTML = `
      <button type="button" data-act="tuck"><kbd>1</kbd><span>🛏 盖被子</span></button>
      <button type="button" data-act="pet"><kbd>2</kbd><span>🐾 摸摸猫头</span></button>
      <button type="button" data-act="dream"><kbd>3</kbd><span>💭 换个美梦</span></button>
      <button type="button" data-act="lullaby"><kbd>4</kbd><span>🎵 摇篮曲</span></button>
      <button type="button" class="wake" data-act="wake"><kbd>E</kbd><span>叫醒起床</span></button>
    `;
    bar.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-act]");
      if (!btn) return;
      ev.stopPropagation();
      const act = btn.dataset.act;
      if (act === "tuck") this.toggleDenQuilt();
      else if (act === "pet") this.petSleepingCat();
      else if (act === "dream") this.nextDream(true);
      else if (act === "lullaby") this.toggleLullaby();
      else if (act === "wake") this.leaveDenBed();
    });

    hud.appendChild(dreamHud);
    hud.appendChild(bar);
    this.denBed.hudEl = dreamHud;
    this.denBed.barEl = bar;
  }

  _updateSleepUI(customTitle, customText) {
    const db = this.denBed;
    const dream = SLEEP_DREAMS[db.dreamIdx % SLEEP_DREAMS.length];
    if (db.hudEl) {
      const imgEl = db.hudEl.querySelector(".d-thumb");
      const titleEl = db.hudEl.querySelector(".d-title");
      const textEl = db.hudEl.querySelector(".d-text");
      if (imgEl && imgEl.dataset.src !== dream.img) {
        imgEl.dataset.src = dream.img;
        imgEl.src = dream.img + "?v=11241135";
      }
      if (titleEl) titleEl.textContent = customTitle || dream.title;
      if (textEl) textEl.textContent = customText || dream.lines[db.dreamSub % dream.lines.length];
    }
    if (db.barEl) {
      const btnTuck = db.barEl.querySelector('button[data-act="tuck"]');
      if (btnTuck) {
        btnTuck.classList.toggle("on", db.tucked);
        btnTuck.querySelector("span").textContent = db.tucked ? "🛏 掀开被子" : "🛏 盖被子";
      }
      const btnLul = db.barEl.querySelector('button[data-act="lullaby"]');
      if (btnLul) {
        btnLul.classList.toggle("on", db.lullabyOn);
        btnLul.querySelector("span").textContent = db.lullabyOn ? "🎵 停摇篮曲" : "🎵 摇篮曲";
      }
    }
    if (db.dreamSprite && db.dreamTextures[db.dreamIdx % db.dreamTextures.length]) {
      db.dreamSprite.material.map = db.dreamTextures[db.dreamIdx % db.dreamTextures.length];
      db.dreamSprite.material.needsUpdate = true;
    }
  }

  _playClothRustle() {
    const audio = this.game.audio;
    if (!audio || audio.muted || !audio.ctx || !audio.brown) return;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = audio.brown;
    const flt = ctx.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.setValueAtTime(340, now);
    flt.frequency.exponentialRampToValueAtTime(760, now + 0.16);
    flt.frequency.exponentialRampToValueAtTime(260, now + 0.34);
    flt.Q.value = 0.7;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(1e-4, now);
    gn.gain.linearRampToValueAtTime(0.075, now + 0.08);
    gn.gain.exponentialRampToValueAtTime(1e-4, now + 0.36);
    src.connect(flt).connect(gn).connect(audio.master || ctx.destination);
    src.start(now, Math.random());
    src.stop(now + 0.4);
  }

  _playSoftPurr() {
    const audio = this.game.audio;
    if (!audio || audio.muted || !audio.ctx) return;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(610, now + 0.22);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(1e-4, now);
    gn.gain.linearRampToValueAtTime(0.032, now + 0.04);
    gn.gain.exponentialRampToValueAtTime(1e-4, now + 0.26);
    osc.connect(lp).connect(gn).connect(audio.master || ctx.destination);
    if (audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = 0.28;
      gn.connect(rg).connect(audio.rev);
    }
    osc.start(now);
    osc.stop(now + 0.3);
  }

  toggleDenQuilt() {
    const db = this.denBed;
    if (!db.riding) return;
    db.tucked = !db.tucked;
    db.petPulse = Math.max(db.petPulse, 0.75);
    db.dreamTimer = 0;
    this._playClothRustle();
    if (db.tucked) {
      this.chime([523.25, 659.25, 783.99], 0.09, 0.09);
      this.game.cold && (this.game.cold.w = 100, this.game.cold.wet = 0);
      const line = TUCK_LINES[Math.floor(Math.random() * TUCK_LINES.length)];
      this._updateSleepUI("✦ 盖好星光软被 · 暖呼呼", line);
      this.spawnStarBurst(db.focus.x, db.focus.y + 0.25, db.focus.z, 12, 1.4);
    } else {
      this.chime([783.99, 659.25], 0.08, 0.07);
      const line = UNTUCK_LINES[Math.floor(Math.random() * UNTUCK_LINES.length)];
      this._updateSleepUI("✦ 掀开星光软被", line);
    }
    if (this.game.player && this.game.player.seat) {
      this.game.player.seat.tucked = db.tucked;
      this.game.player.seat.petPulse = db.petPulse;
    }
  }

  petSleepingCat() {
    const db = this.denBed;
    if (!db.riding) return;
    db.petPulse = 1.0;
    db.dreamTimer = 0;
    this._playSoftPurr();
    this.chime([659.25, 880, 1046.5], 0.07, 0.075);
    const line = PET_LINES[Math.floor(Math.random() * PET_LINES.length)];
    this._updateSleepUI("✦ 摸摸熟睡猫猫头 · 呼噜噜", line);
    this.spawnStarBurst(db.zzzOrigin.x, db.zzzOrigin.y + 0.05, db.zzzOrigin.z, 16, 1.5);
    if (this.game.player && this.game.player.seat) {
      this.game.player.seat.petPulse = 1.0;
    }
  }

  nextDream(manual = false) {
    const db = this.denBed;
    if (!db.riding) return;
    db.dreamIdx = (db.dreamIdx + 1) % SLEEP_DREAMS.length;
    db.dreamSub = (db.dreamSub + 1) % 2;
    db.dreamTimer = 0;
    this._updateSleepUI();
    if (manual) {
      this.chime([587.33, 783.99, 1174.66], 0.08, 0.075);
      this.spawnStarBurst(db.dreamOrigin.x, db.dreamOrigin.y, db.dreamOrigin.z, 10, 1.2);
    }
  }

  toggleLullaby() {
    const db = this.denBed;
    if (!db.riding) return;
    db.lullabyOn = !db.lullabyOn;
    db.lullabyT = 0.05;
    db.lullabyStep = 0;
    this._updateSleepUI();
    if (db.lullabyOn) {
      this.game.ui && this.game.ui.toast("🎵 已开启星光八音盒摇篮曲，伴猫猫做个甜甜的梦喵～", 3.5);
    }
  }

  enterDenBed(viewYaw) {
    const g = this.game, p = g.player, db = this.denBed;
    db.riding = true;
    db.sparkT = 0;
    db.tucked = false;
    db.quiltK = 0;
    db.petPulse = 0;
    db.dreamTimer = 0;
    db.dreamIdx = this.denIdx % SLEEP_DREAMS.length;
    db.dreamSub = this.denIdx % 2;
    this.denIdx++;
    this.chime([523.25, 659.25, 783.99, 987.77], 0.11, 0.11);
    g.cold && (g.cold.w = Math.min(100, g.cold.w + 45), g.cold.wet = 0);

    p.seat = {
      pos: db.eye,
      tp: true,
      sleep: true,
      tucked: false,
      petPulse: 0,
      focus: db.focus,
      dist: 2.65,
      bedPos: db.bedPos,
      bedYaw: db.bedYaw,
      spot: db.spot,
      onKey: (code) => {
        if (code === "Digit1" || code === "Numpad1") this.toggleDenQuilt();
        else if (code === "Digit2" || code === "Numpad2") this.petSleepingCat();
        else if (code === "Digit3" || code === "Numpad3") this.nextDream(true);
        else if (code === "Digit4" || code === "Numpad4") this.toggleLullaby();
      },
      exit: () => this.leaveDenBed()
    };

    // Position cozy 3rd-person camera right inside the open dome doorway showing both the sleeping cat & floating dream cloud!
    p.yaw = viewYaw + 0.20;
    p.pitch = -0.24;
    g.character?.stop(0.1);

    document.body.classList.add("sleeping");
    this._updateSleepUI();
    db.hudEl && db.hudEl.classList.add("show");
    db.barEl && db.barEl.classList.add("show");
  }

  leaveDenBed() {
    const db = this.denBed;
    if (!db.riding) return;
    const g = this.game, p = g.player;
    db.riding = false;
    db.tucked = false;
    db.lullabyOn = false;
    db.petPulse = 0;
    if (db.quilt) db.quilt.visible = false;
    if (db.dreamSprite) {
      db.dreamSprite.visible = false;
      db.dreamSprite.material.opacity = 0;
    }
    for (const z of db.zzz) {
      z.sp.visible = false;
      z.sp.material.opacity = 0;
    }
    document.body.classList.remove("sleeping");
    db.hudEl && db.hudEl.classList.remove("show");
    db.barEl && db.barEl.classList.remove("show");

    p.seat = null;
    p.pos.set(db.exitPos.x, 0, db.exitPos.z);
    p.vel.set(0, 0);
    p.yaw = db.exitYaw + Math.PI;
    p.pitch = -0.08;
    g.audio?.pick && g.audio.pick();
    g.character?.play("happy");
  }

  // 5. Sky-High Starlight Cat Tree at (58.8, 70.2)
  buildCatTree() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const cx = 58.8, cz = 70.2, cy = this.qt(cx, cz);
    const g = new T.Group();
    g.position.set(cx, cy, cz);

    // Base plinth + cozy cat condo box
    g.add(
      this.mesh(new T.CylinderGeometry(1.38, 1.52, 0.18, 24), this.m.indigoWood, 0, 0.09, 0),
      this.mesh(new T.TorusGeometry(1.42, 0.045, 6, 28).rotateX(Math.PI / 2), this.m.gold, 0, 0.18, 0),
      this.mesh(new T.CylinderGeometry(0.76, 0.80, 1.02, 20), this.m.lavender, 0, 0.68, 0),
      this.mesh(new T.TorusGeometry(0.78, 0.04, 8, 24).rotateX(Math.PI / 2), this.m.gold, 0, 1.18, 0),
      // Cute dark cat-head entrance decal on the condo facing courtyard (-X, -Z)
      this.mesh(new T.SphereGeometry(0.32, 12, 10), this.m.indigo, -0.58, 0.56, -0.45),
      // Main tall wrapped sisal scratching trunk
      this.mesh(new T.CylinderGeometry(0.22, 0.26, 3.35, 14), this.m.sisal, 0, 2.72, 0)
    );

    // 3 Spiral Plush Cat-Paw Climbing Ledges (one-way jump-through walkable platforms!)
    const ledges = [
      { lx: -0.92, ly: 0.98, lz: -0.45, r: 0.86, pawRot: -1.1 },
      { lx: 0.85,  ly: 1.92, lz: -0.55, r: 0.90, pawRot: 0.9 },
      { lx: -0.05, ly: 2.95, lz: 0.08,  r: 1.18, pawRot: -0.3 }
    ];
    for (const lg of ledges) {
      g.add(
        this.mesh(new T.CylinderGeometry(lg.r, lg.r * 0.94, 0.14, 22), this.m.cream, lg.lx, lg.ly, lg.lz),
        this.mesh(new T.TorusGeometry(lg.r, 0.04, 8, 26).rotateX(Math.PI / 2), this.m.gold, lg.lx, lg.ly + 0.04, lg.lz)
      );
      const paw = this.mkFlatCatPaw(lg.r * 0.58, this.m.sakura, this.m.pink);
      paw.position.set(lg.lx, lg.ly + 0.075, lg.lz);
      paw.rotation.y = lg.pawRot;
      g.add(paw);

      // Register one-way jump-through platform so players can jump or trampoline onto every tier!
      const wx = cx + lg.lx, wz = cz + lg.lz, topY = cy + lg.ly + 0.08, rr = lg.r + 0.12;
      world.platforms.push({
        test: (px, pz) => {
          const p = this.game.player;
          if (!p) return false;
          const footY = p.y - p.eye + p.air;
          return footY >= topY - 0.55 && (px - wx) ** 2 + (pz - wz) ** 2 < rr * rr;
        },
        y: () => topY,
        wood: true
      });
    }

    // Sleeping snow-kitty plushie curled on Tier 2!
    const treeKitty = this.mkSnowKitty(0.76);
    treeKitty.position.set(0.88, 2.00, -0.52);
    treeKitty.rotation.y = -2.1;
    this.catTree.kitty = treeKitty;
    this.catTree.kittyBaseY = 2.00;
    g.add(treeKitty);

    // Top Giant Golden Crescent Moon Lookout Arch crowning Tier 3!
    const moonPts = [];
    for (let i = 0; i <= 18; i++) {
      const a = -0.65 + (i / 18) * (Math.PI * 1.38);
      moonPts.push(new T.Vector3(Math.cos(a) * 1.05, 4.02 + Math.sin(a) * 1.05, 0));
    }
    const moonArch = this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(moonPts), 24, 0.11, 10, false), this.m.gold);
    moonArch.rotation.y = 0.65;
    g.add(moonArch);

    const moonStar = this.mesh(this.starMd, this.m.cyan, 0, 4.78, 0);
    this.spinners.push({ obj: moonStar, speed: 1.7, bobY: 4.78, bobAmp: 0.06 });
    g.add(moonStar);

    // Hanging glowing sakura-pink yarn ball on a swinging arm!
    const arm = this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.05, 8).rotateZ(Math.PI / 2), this.m.gold, -0.68, 2.86, 0.68);
    arm.rotation.y = 0.72;
    const yPivot = new T.Group();
    yPivot.position.set(-1.05, 2.84, 0.98);
    yPivot.add(
      this.mesh(new T.CylinderGeometry(0.012, 0.012, 0.92, 6), this.m.gold, 0, -0.46, 0),
      this.mesh(new T.SphereGeometry(0.24, 14, 10), this.m.pink, 0, -0.96, 0),
      this.mesh(new T.TorusGeometry(0.245, 0.018, 6, 20), this.m.gold, 0, -0.96, 0),
      this.mesh(new T.TorusGeometry(0.245, 0.018, 6, 20).rotateY(Math.PI / 2), this.m.cyan, 0, -0.96, 0)
    );
    this.catTree.yarnPivot = yPivot;
    g.add(arm, yPivot);

    scene.add(g);
    // Split base condo (h = 1.22m) & slim upper sisal trunk (r = 0.24, h = 2.95m) so players can cleanly
    // climb & jump onto all 3 cat-tree tiers including the top Tier 3 crescent-moon lookout!
    world.circles.push(
      { x: cx, z: cz, r: 0.82, top: 1.22 },
      { x: cx, z: cz, r: 0.24, top: 2.95 }
    );
    world.spots.push({
      id: "cathome_cattree",
      pos: new T.Vector3(cx - 1.05, cy + 1.5, cz + 0.98),
      r: 2.8,
      label: "拍拍星光毛线球 · 挠猫爬架",
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat,
      act: () => {
        this.catTree.yarnVel = (this.catTree.yarnVel >= 0 ? -1 : 1) * 5.8;
        this.chime([659.25, 783.99, 1046.5, 1318.5], 0.06, 0.14);
        this.game.character?.play("punch");
        this.spawnStarBurst(cx - 1.05, cy + 1.85, cz + 0.98, 12, 2.0);
        this.game.ui.toast("喵呜！狠狠拍飞了发光星光毛线球，猫爬架上的小雪猫也跟着开心蹦起来啦～（踩旁边猫肉球弹跳垫可以跳上猫爬架哦！）", 4.8);
      }
    });
  }

  // 6. Interactive Cat-Paw Starlight Trampoline at (52.2, 72.5)
  buildTrampoline() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const tx = this.trampPos.x, tz = this.trampPos.z, ty = this.qt(tx, tz);
    const g = new T.Group();
    g.position.set(tx, ty, tz);

    // Outer starry gold spring frame
    const frameRim = new T.TorusGeometry(2.05, 0.14, 10, 36);
    frameRim.rotateX(Math.PI / 2);
    g.add(
      this.mesh(new T.CylinderGeometry(2.05, 2.18, 0.22, 32), this.m.indigo, 0, 0.11, 0),
      this.mesh(frameRim, this.m.gold, 0, 0.24, 0)
    );
    // 8 glowing cyan/pink spring coils around perimeter
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.add(this.mesh(
        new T.CylinderGeometry(0.08, 0.08, 0.26, 8),
        i % 2 === 0 ? this.m.cyan : this.m.pink,
        Math.cos(a) * 1.98, 0.14, Math.sin(a) * 1.98
      ));
    }

    // Bouncing pad group with GIANT 3D GLOWING SAKURA-PINK CAT PAW!
    const pad = new T.Group();
    pad.position.y = 0.24;
    pad.add(
      this.mesh(new T.CylinderGeometry(1.88, 1.88, 0.10, 32), this.m.cream, 0, 0, 0),
      this.mesh(new T.TorusGeometry(1.75, 0.04, 8, 32).rotateX(Math.PI / 2), this.m.cyan, 0, 0.05, 0)
    );
    const bigPaw = this.mkFlatCatPaw(2.15, this.m.sakura, this.m.pink);
    bigPaw.position.y = 0.06;
    bigPaw.rotation.y = Math.PI; // Paw toes point North toward courtyard!
    pad.add(bigPaw);
    this.tramp.pad = pad;
    this.tramp.baseY = 0.24;
    g.add(pad);
    scene.add(g);

    // Subtle platform lift for the trampoline surface
    world.platforms.push({
      test: (px, pz) => (px - tx) ** 2 + (pz - tz) ** 2 < 2.02 ** 2,
      y: () => ty + 0.30,
      wood: true
    });

    world.spots.push({
      id: "cathome_trampoline",
      pos: new T.Vector3(tx, ty + 0.8, tz),
      r: 2.7,
      label: "踩猫肉球星光弹跳垫 · 超级大跳！",
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat,
      act: () => this.launchBounce(12.6)
    });
  }

  launchBounce(vy = 11.2) {
    const g = this.game, p = g.player;
    this.tramp.squash = 1.0;
    this.tramp.cool = 0.55;
    p.air = Math.max(p.air, 0.08);
    p.vy = vy;
    p.jumps = 1; // Still allows 1 mid-air double jump!
    this.chime([523.25, 659.25, 783.99, 1046.5], 0.045, 0.16);
    g.character?.play("cheer");
    this.spawnStarBurst(this.trampPos.x, this.qt(this.trampPos.x, this.trampPos.z) + 0.35, this.trampPos.z, 18, 3.2);
  }

  // 7. Interactive Rideable Crescent-Moon Starlight Swing at (45.5, 70.8)
  buildMoonSwing() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const sx = 45.5, sz = 70.8, sy = this.qt(sx, sz);
    const yaw = Math.atan2(50.5 - sx, 64.0 - sz); // Faces NE toward courtyard & dome
    const g = new T.Group();
    g.position.set(sx, sy, sz);
    g.rotation.y = yaw;

    // Twin starry-indigo & gold A-frame swing supports (local x = ±1.65)
    for (const side of [-1, 1]) {
      const px = side * 1.65;
      const legF = this.mesh(new T.CylinderGeometry(0.08, 0.10, 3.95, 10), this.m.indigo, px, 1.90, 0.52);
      legF.rotation.x = -0.26;
      const legB = this.mesh(new T.CylinderGeometry(0.08, 0.10, 3.95, 10), this.m.indigo, px, 1.90, -0.52);
      legB.rotation.x = 0.26;
      g.add(
        legF, legB,
        this.mesh(new T.SphereGeometry(0.16, 12, 10), this.m.gold, px, 3.76, 0),
        this.mesh(this.starSm, side < 0 ? this.m.cyan : this.m.pink, px, 3.98, 0)
      );
      // Colliders for leg bases
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      for (const lz of [-0.95, 0.95]) {
        world.circles.push({ x: sx + px * cosY + lz * sinY, z: sz - px * sinY + lz * cosY, r: 0.22 });
      }
    }

    // Crossbar + giant cute cat ears crowning the swing frame!
    g.add(
      this.mesh(new T.CylinderGeometry(0.085, 0.085, 3.55, 12).rotateZ(Math.PI / 2), this.m.gold, 0, 3.76, 0)
    );
    const seL = this.mkCatEar(0.78); seL.position.set(-0.62, 3.80, 0); seL.rotation.z = 0.26;
    const seR = this.mkCatEar(0.78); seR.position.set(0.62, 3.80, 0); seR.rotation.z = -0.26;
    g.add(seL, seR, this.mesh(this.starMd, this.m.cyan, 0, 4.02, 0));

    // Pendulum swing group (pivots around local X at y = 3.72!)
    const pivot = new T.Group();
    pivot.position.set(0, 3.72, 0);

    // Twin golden suspension chains
    for (const cx of [-0.62, 0.62]) {
      pivot.add(this.mesh(new T.CylinderGeometry(0.022, 0.022, 2.72, 8), this.m.gold, cx, -1.36, 0));
    }

    // Sculpted luminous Crescent Moon Seat!
    const moonPts = [];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * 0.14 + (i / 16) * (Math.PI * 0.72);
      moonPts.push(new T.Vector3(Math.cos(a) * 1.15, -2.18 - Math.sin(a) * 0.72, 0));
    }
    const moonSeat = this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(moonPts), 22, 0.14, 12, false), this.m.gold);
    const cushion = this.mesh(new T.BoxGeometry(1.12, 0.14, 0.56), this.m.sakura, 0, -2.76, 0);
    const seatAnchor = new T.Group();
    seatAnchor.position.set(0, -1.78, 0.18); // Eye height while seated on crescent swing!
    pivot.add(
      moonSeat, cushion, seatAnchor,
      this.mesh(this.starSm, this.m.cyan, -0.92, -2.36, 0.08),
      this.mesh(this.starSm, this.m.pink, 0.92, -2.36, 0.08)
    );
    g.add(pivot);
    scene.add(g);
    g.updateMatrixWorld(true);

    this.swing.pivot = pivot;
    this.swing.seatAnchor = seatAnchor;
    this.swing.exitPos.set(0, 0, 2.15).applyMatrix4(g.matrixWorld);
    this.swing.exitYaw = yaw;
    this.swing.spot = {
      id: "cathome_swing_exit",
      label: "从星月秋千下来",
      can: () => true,
      act: () => this.leaveSwing()
    };

    world.spots.push({
      id: "cathome_swing",
      pos: new T.Vector3(sx, sy + 1.1, sz),
      r: 2.7,
      label: "坐上星月猫耳秋千荡一荡",
      can: () => !this.game.player.seat && !this.game.player.riding && !this.game.player.skiing,
      act: () => this.enterSwing(yaw)
    });
  }

  enterSwing(viewYaw) {
    const g = this.game, p = g.player;
    this.swing.riding = true;
    this.swing.vel = 1.15;
    this.swing.sparkT = 0;
    this.swing.seatAnchor.getWorldPosition(this.swing.eye);
    this.chime([587.33, 739.99, 880, 1174.66], 0.075, 0.14);
    p.seat = {
      pos: this.swing.eye,
      spot: this.swing.spot,
      exit: () => this.leaveSwing()
    };
    p.yaw = viewYaw + Math.PI;
    p.pitch = 0.04;
    g.character?.stop(0.1);
    g.ui.toast("荡起星月猫耳秋千啦！雪花迎面飘过来，按 E 随时下来喵～", 4.5);
  }

  leaveSwing() {
    if (!this.swing.riding) return;
    const g = this.game, p = g.player;
    this.swing.riding = false;
    p.seat = null;
    p.pos.set(this.swing.exitPos.x, 0, this.swing.exitPos.z);
    p.vel.set(0, 0);
    p.yaw = this.swing.exitYaw + Math.PI;
    g.audio?.pick && g.audio.pick();
  }

  // 8. Interactive Kitty Fish-Snack & Star-Milk Bar at (51.2, 54.0)
  buildSnackBar() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const bx = 51.2, bz = 54.0, by = this.qt(bx, bz);
    const yaw = 0.12; // Faces South (+Z) toward courtyard!
    const g = new T.Group();
    g.position.set(bx, by, bz);
    g.rotation.y = yaw;

    // Stall body & glowing gold-trimmed counter
    g.add(
      this.mesh(new T.BoxGeometry(3.1, 1.05, 1.35), this.m.indigoWood, 0, 0.525, 0),
      this.mesh(new T.BoxGeometry(3.26, 0.10, 1.56), this.m.cream, 0, 1.08, 0.06),
      this.mesh(new T.BoxGeometry(3.28, 0.04, 0.06), this.m.gold, 0, 1.08, 0.84)
    );
    // 4 Corner posts + slanted striped awning
    for (const [px, pz] of [[-1.44, -0.58], [1.44, -0.58], [-1.44, 0.58], [1.44, 0.58]]) {
      g.add(this.mesh(new T.CylinderGeometry(0.065, 0.075, 2.55, 8), this.m.indigo, px, 1.32, pz));
    }
    const roof = this.mesh(new T.BoxGeometry(3.55, 0.10, 2.05), this.m.awning, 0, 2.66, 0.10);
    roof.rotation.x = 0.18;
    g.add(roof);

    // Rooftop Cat-Ear Signboard
    const sign = this.makeSignPlaque("✦ 小鱼干星奶吧 ✦", 2.35, 0.48);
    sign.position.set(0, 3.04, 0.65);
    const beL = this.mkCatEar(0.55); beL.position.set(-0.92, 3.24, 0.65); beL.rotation.z = 0.24;
    const beR = this.mkCatEar(0.55); beR.position.set(0.92, 3.24, 0.65); beR.rotation.z = -0.24;
    g.add(sign, beL, beR);

    // Counter props: glowing cyan & pink star-milk bottles + sizzling taiyaki fish grill + warm hanging lamp!
    for (let i = 0; i < 4; i++) {
      const mx = -1.08 + i * 0.24;
      g.add(
        this.mesh(new T.CylinderGeometry(0.06, 0.07, 0.24, 10), i % 2 === 0 ? this.m.cyan : this.m.pink, mx, 1.25, 0.16),
        this.mesh(new T.CylinderGeometry(0.035, 0.045, 0.07, 8), this.m.gold, mx, 1.40, 0.16)
      );
    }
    // Taiyaki grill on right half of counter
    g.add(
      this.mesh(new T.BoxGeometry(0.86, 0.12, 0.56), this.m.stone, 0.68, 1.19, 0.05),
      this.mesh(new T.BoxGeometry(0.76, 0.04, 0.46), this.m.warm, 0.68, 1.26, 0.05)
    );
    for (const fx of [0.46, 0.68, 0.90]) {
      const fish = this.mesh(new T.SphereGeometry(0.09, 10, 8), this.m.taiyaki, fx, 1.32, 0.05);
      fish.scale.set(0.75, 0.45, 1.45);
      g.add(fish);
    }
    // Hanging warm counter lantern
    g.add(
      this.mesh(new T.CylinderGeometry(0.015, 0.015, 0.34, 6), this.m.gold, 0, 2.38, 0.58),
      this.mesh(new T.SphereGeometry(0.14, 12, 10), this.m.warm, 0, 2.18, 0.58)
    );

    // 2 Adorable Cat-Ear Barstools out front
    for (const sx of [-0.78, 0.78]) {
      g.add(
        this.mesh(new T.CylinderGeometry(0.05, 0.07, 0.56, 8), this.m.gold, sx, 0.28, 1.22),
        this.mesh(new T.CylinderGeometry(0.26, 0.24, 0.10, 14), this.m.sakura, sx, 0.58, 1.22)
      );
      const stL = this.mkCatEar(0.18); stL.position.set(sx - 0.15, 0.62, 1.38); stL.rotation.z = 0.25;
      const stR = this.mkCatEar(0.18); stR.position.set(sx + 0.15, 0.62, 1.38); stR.rotation.z = -0.25;
      g.add(stL, stR);
    }

    scene.add(g);
    g.updateMatrixWorld(true);
    this.grillPos.set(0.68, 1.42, 0.05).applyMatrix4(g.matrixWorld);
    this.addLight(bx, by + 2.25, bz + 0.75, 0xffc88a, 8.5, 12, false);

    world.circles.push(
      { x: bx - 0.85, z: bz, r: 0.95 },
      { x: bx + 0.85, z: bz, r: 0.95 },
      // Jumpable colliders for the 2 cute cat-ear barstools out front (prevent clipping!)
      { x: bx - 0.78, z: bz + 1.22, r: 0.30, top: 0.64 },
      { x: bx + 0.78, z: bz + 1.22, r: 0.30, top: 0.64 }
    );
    world.spots.push({
      id: "cathome_snackbar",
      pos: new T.Vector3(bx, by + 1.15, bz + 1.1),
      r: 2.9,
      label: "来一份烤小鱼干和热星奶（满格回温）",
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const gm = this.game;
        this.chime([587.33, 659.25, 783.99, 1046.5], 0.07, 0.15);
        gm.cold && (gm.cold.w = 100, gm.cold.wet = 0);
        gm.character?.play("happy");
        gm.friends?.cheer("happy");
        this.spawnStarBurst(this.grillPos.x, this.grillPos.y, this.grillPos.z, 14, 1.8);
        gm.ui.toast(CAT_SNACKS[this.snackIdx++ % CAT_SNACKS.length], 4.8);
      }
    });
  }

  // 9. Cozy Starlight Kitty Hot-Spring Footbath at (44.2, 57.2)
  buildKittyPool() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const px = this.poolPos.x, pz = this.poolPos.z, py = this.qt(px, pz);
    const g = new T.Group();
    g.position.set(px, py, pz);

    const rim = new T.TorusGeometry(2.38, 0.26, 10, 36);
    rim.rotateX(Math.PI / 2);
    const goldRim = new T.TorusGeometry(2.38, 0.05, 8, 36);
    goldRim.rotateX(Math.PI / 2);
    g.add(
      this.mesh(rim, this.m.stone, 0, 0.22, 0),
      this.mesh(goldRim, this.m.gold, 0, 0.44, 0),
      this.mesh(new T.CylinderGeometry(2.26, 2.26, 0.28, 32), this.m.water, 0, 0.18, 0)
    );
    // Decorative perimeter star pebbles
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.add(this.mesh(this.starSm, i % 2 === 0 ? this.m.cyan : this.m.pink, Math.cos(a) * 2.38, 0.48, Math.sin(a) * 2.38));
    }

    // Adorable Sculpted Snow-Kitty Fountain Head on the NW rim!
    const fBase = new T.Group();
    fBase.position.set(-1.62, 0.36, -1.62);
    fBase.rotation.y = Math.PI * 0.25; // Looks straight into the pool center!
    fBase.add(
      this.mesh(new T.CylinderGeometry(0.55, 0.68, 0.65, 14), this.m.stone, 0, 0.32, 0),
      this.mesh(new T.TorusGeometry(0.56, 0.04, 6, 20).rotateX(Math.PI / 2), this.m.gold, 0, 0.65, 0)
    );
    const fKitty = this.mkSnowKitty(1.38);
    fKitty.position.set(0, 0.66, 0);
    // Sparkling water spout arc pouring into the pool!
    const spoutCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, 0.92, 0.46),
      new T.Vector3(0, 0.85, 0.85),
      new T.Vector3(0, 0.32, 1.24),
      new T.Vector3(0, -0.04, 1.38)
    ]);
    const spout = this.mesh(new T.TubeGeometry(spoutCurve, 14, 0.055, 8, false), this.m.cyan);
    fBase.add(fKitty, spout);
    g.add(fBase);

    scene.add(g);
    g.updateMatrixWorld(true);
    this.fountainPos.set(-0.65, 0.40, -0.65).applyMatrix4(g.matrixWorld);
    this.addLight(px, py + 1.4, pz, 0x8be6ff, 7.5, 11, false);

    // Collider only on the fountain pedestal (players can freely wade into the warm kitty footbath or jump over!)
    world.circles.push({ x: px - 1.62, z: pz - 1.62, r: 0.72, top: 1.15 });
    world.spots.push({
      id: "cathome_pool",
      pos: new T.Vector3(px, py + 0.9, pz),
      r: 3.1,
      label: "泡泡星喵牛奶暖泉 · 听猫猫呼噜声",
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const gm = this.game;
        this.chime([440, 554.37, 659.25, 880], 0.09, 0.14);
        gm.cold && (gm.cold.w = Math.min(100, gm.cold.w + 40), gm.cold.wet = 0);
        gm.character?.play("happy");
        this.spawnStarBurst(px, py + 0.45, pz, 16, 2.0);
        gm.ui.toast(POOL_LINES[this.poolIdx++ % POOL_LINES.length], 4.8);
      }
    });
  }

  // 10. Starlight Mount Summon Pad right beside the sanctuary entrance at (40.2, 70.8)
  buildSummonPad() {
    const T = this.THREE;
    const { scene, world } = this.game;
    const px = 40.2, pz = 70.8, py = this.qt(px, pz);
    const g = new T.Group();
    g.position.set(px, py, pz);

    // Flush glowing star-ring landing circle (no collider so mount lands cleanly right on it!)
    g.add(
      this.mesh(new T.TorusGeometry(2.15, 0.055, 8, 36).rotateX(Math.PI / 2), this.m.gold, 0, 0.04, 0),
      this.mesh(new T.TorusGeometry(1.92, 0.035, 6, 36).rotateX(Math.PI / 2), this.m.cyan, 0, 0.045, 0),
      this.mesh(new T.TorusGeometry(1.68, 0.025, 6, 32).rotateX(Math.PI / 2), this.m.pink, 0, 0.045, 0)
    );
    // Petite Star-Summon Beacon Post at the edge of the landing pad
    const bx = -2.35, bz = -0.35;
    const post = new T.Group();
    post.position.set(bx, 0, bz);
    post.add(
      this.mesh(new T.CylinderGeometry(0.08, 0.12, 1.35, 10), this.m.indigo, 0, 0.675, 0),
      this.mesh(new T.TorusGeometry(0.14, 0.025, 6, 16).rotateX(Math.PI / 2), this.m.gold, 0, 1.35, 0)
    );
    const st = new T.Group();
    st.position.set(0, 1.62, 0);
    st.add(this.mesh(this.starMd, this.m.cyan, 0, 0, 0.02), this.mesh(this.starMd, this.m.pink, 0, 0, -0.02));
    this.spinners.push({ obj: st, speed: 2.2, bobY: 1.62, bobAmp: 0.05 });
    const pe1 = this.mkCatEar(0.24); pe1.position.set(-0.11, 1.38, 0); pe1.rotation.z = 0.30;
    const pe2 = this.mkCatEar(0.24); pe2.position.set(0.11, 1.38, 0); pe2.rotation.z = -0.30;
    post.add(st, pe1, pe2);
    g.add(post);
    scene.add(g);

    world.circles.push({ x: px + bx, z: pz + bz, r: 0.22, top: 1.10 });
    world.spots.push({
      id: "cathome_summon",
      pos: new T.Vector3(px + bx, py + 1.1, pz + bz),
      r: 2.6,
      label: () => (this.game.avatar === "gemini" ? "召唤幻翼星云飞猫" : "召唤 Claude 橙花直升机"),
      can: () => !this.game.player.skiing && !this.game.player.riding && !this.game.player.seat && !!this.game.heli,
      act: () => {
        const gm = this.game, h = gm.heli;
        if (!h || !h.summonTo(px, pz, -Math.PI * 0.25)) {
          gm.ui.toast("坐骑还在半空中呢，等它落稳再召唤喵～", 3.5);
          return;
        }
        this.chime([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.06, 0.16);
        this.spawnStarBurst(px, py + 0.8, pz, 22, 3.4);
        gm.character?.play("cheer");
        gm.ui.toast(gm.avatar === "gemini"
          ? "喵呜～幻翼星云飞猫已经振翅飞落到星猫小窝召唤台啦，快骑上去兜风喵～"
          : "Claude 的橙花小直升机已经召到停机坪啦！", 4.8);
      }
    });
  }

  // Warmth hook called by O.cold.update()
  warmthAt(x, z) {
    if (this.denBed.riding) return 28;
    if ((x - this.poolPos.x) ** 2 + (z - this.poolPos.z) ** 2 < (this.poolPos.r + 0.8) ** 2) return 22;
    if ((x - this.denPos.x) ** 2 + (z - this.denPos.z) ** 2 < this.denPos.r ** 2) return 18;
    return 0;
  }

  update(dt, time) {
    if (!this.ready) return;
    const g = this.game, p = g.player;
    const night = g.env.night || 0;
    const lamps = g.env.state ? g.env.state.lamps : 0;

    // 1. Gentle dynamic lights & star emissive breathing
    for (const l of this.lights) {
      const flick = 0.93 + 0.07 * Math.sin(time * 5.2 + l.phase);
      l.light.intensity = l.power * (l.always ? 0.65 + 0.35 * lamps : lamps) * flick;
    }
    for (const em of this.emissives) {
      const target = em.base + (em.night - em.base) * night;
      em.mat.emissiveIntensity = target * (0.9 + 0.1 * Math.sin(time * 2.4 + em.phase));
    }

    // 2. Floating rotating star finials
    for (const sp of this.spinners) {
      sp.obj.rotation.y = time * sp.speed;
      if (sp.bobAmp) sp.obj.position.y = sp.bobY + Math.sin(time * 2.1) * sp.bobAmp;
    }

    // 3. Cat Tree yarn ball pendulum & sleeping kitty gentle breathing
    if (this.catTree.yarnPivot) {
      const acc = -14.0 * this.catTree.yarnAng - 1.35 * this.catTree.yarnVel;
      this.catTree.yarnVel += acc * dt;
      this.catTree.yarnAng += this.catTree.yarnVel * dt;
      this.catTree.yarnPivot.rotation.z = this.catTree.yarnAng + Math.sin(time * 1.6) * 0.05;
      this.catTree.yarnPivot.rotation.x = Math.cos(time * 1.3) * 0.035;
    }
    if (this.catTree.kitty) {
      const breathe = 1 + Math.sin(time * 2.8) * 0.035;
      this.catTree.kitty.scale.set(0.76 * breathe, 0.76 * (2 - breathe), 0.76 * breathe);
    }

    // 4. Cat-Paw Trampoline auto-bounce & spring animation
    if (this.tramp.cool > 0) this.tramp.cool -= dt;
    if (this.tramp.squash > 0) {
      this.tramp.squash = Math.max(0, this.tramp.squash - dt * 2.6);
      const s = this.tramp.squash;
      const bounce = Math.sin(s * Math.PI * 2.5) * s;
      this.tramp.pad.position.y = this.tramp.baseY - 0.12 * bounce;
      this.tramp.pad.scale.set(1 + 0.09 * bounce, 1 - 0.25 * bounce, 1 + 0.09 * bounce);
    } else if (this.tramp.pad) {
      this.tramp.pad.position.y = this.tramp.baseY;
      this.tramp.pad.scale.set(1, 1, 1);
    }
    if (p && p.enabled && !p.riding && !p.seat && !p.skiing && this.tramp.cool <= 0 && p.air < 0.22 && p.vy <= 0.4) {
      const d2 = (p.pos.x - this.trampPos.x) ** 2 + (p.pos.z - this.trampPos.z) ** 2;
      if (d2 < 1.68 * 1.68) this.launchBounce(11.2);
    }

    // 5. Crescent-Moon Swing physics & rideable camera seat
    if (this.swing.pivot) {
      if (this.swing.riding) {
        // Gentle self-sustaining magical moon swing!
        const targetAmp = 0.42;
        const energy = 0.5 * this.swing.vel * this.swing.vel + 2.4 * (1 - Math.cos(this.swing.angle));
        const wantE = 2.4 * (1 - Math.cos(targetAmp));
        const drive = (energy < wantE ? 0.55 : -0.15) * (this.swing.vel >= 0 ? 1 : -1);
        this.swing.vel += (-4.8 * Math.sin(this.swing.angle) + drive) * dt;
        this.swing.angle += this.swing.vel * dt;
        this.swing.pivot.rotation.x = this.swing.angle;
        this.swing.pivot.updateMatrixWorld(true);
        this.swing.seatAnchor.getWorldPosition(this.swing.eye);

        // Chime softly at swing apex + trail cyan/pink stardust!
        const side = this.swing.angle > 0.30 ? 1 : this.swing.angle < -0.30 ? -1 : 0;
        if (side && side !== this.swing.chimeSide) {
          this.swing.chimeSide = side;
          this.chime(side > 0 ? [783.99, 1046.5] : [659.25, 880], 0.08, 0.07);
        }
        if ((this.swing.sparkT -= dt) <= 0) {
          this.swing.sparkT = 0.14;
          const pk = Math.random() > 0.5;
          g.puffs.spawn(
            this.swing.eye.x + (Math.random() - 0.5) * 0.6,
            this.swing.eye.y - 0.8,
            this.swing.eye.z + (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.4, 0.25, (Math.random() - 0.5) * 0.4,
            0.055, 0.85, 0.5, pk ? 1 : 0.24, pk ? 0.45 : 0.9, pk ? 0.9 : 1, 0.4, 0.9
          );
        }
      } else {
        this.swing.vel += (-4.8 * Math.sin(this.swing.angle) - 1.1 * this.swing.vel) * dt;
        this.swing.angle += this.swing.vel * dt;
        this.swing.pivot.rotation.x = this.swing.angle + Math.sin(time * 1.15) * 0.035;
      }
    }

    // 6. Den bed cozy lounging sparkles, 3D quilt animation, dream-cloud picture & music-box lullaby!
    const db = this.denBed;
    if (db.riding) {
      // Smoothly unfold / fold 3D starlight quilt over her curled body with gentle breathing rise!
      db.quiltK += ((db.tucked ? 1 : 0) - db.quiltK) * (1 - Math.exp(-7 * dt));
      if (db.quilt) {
        const qk = db.quiltK;
        db.quilt.visible = qk > 0.02;
        if (db.quilt.visible) {
          const breathe = 1 + 0.024 * Math.sin(time * 2.3);
          db.quilt.scale.set(0.24 + 0.76 * qk, (0.28 + 0.72 * qk) * breathe, 0.80 + 0.20 * qk);
          db.quilt.position.x = -0.52 + 0.34 * qk;
        }
      }

      // Decay happy pet/tuck reaction smoothly & sync to player.seat for character.update!
      if (db.petPulse > 0) {
        db.petPulse = Math.max(0, db.petPulse - dt * 0.45);
        if (p && p.seat) p.seat.petPulse = db.petPulse;
      }

      // Auto-drift into a new dream scene & murmur every ~10 seconds!
      db.dreamTimer += dt;
      if (db.dreamTimer >= 10.5) {
        this.nextDream(false);
      }

      // Floating 3D Storybook Dream-Cloud Picture Sprite bobbing above her sleeping head!
      if (db.dreamSprite) {
        const dO = db.dreamOrigin;
        db.dreamSprite.visible = true;
        db.dreamSprite.position.set(
          dO.x + Math.sin(time * 0.85) * 0.05,
          dO.y + Math.sin(time * 1.45) * 0.06,
          dO.z
        );
        const targetOp = 0.96;
        db.dreamSprite.material.opacity += (targetOp - db.dreamSprite.material.opacity) * (1 - Math.exp(-5 * dt));
        const sc = 0.94 + 0.025 * Math.sin(time * 1.8);
        db.dreamSprite.scale.set(sc, sc, 1);
      }

      // Gentle winter celesta music-box lullaby while toggled on!
      if (db.lullabyOn) {
        db.lullabyT -= dt;
        if (db.lullabyT <= 0) {
          db.lullabyT = 0.62;
          const note = LULLABY_NOTES[db.lullabyStep % LULLABY_NOTES.length];
          db.lullabyStep++;
          if (note > 0) this.chime([note], 0, 0.055);
        }
      }

      // Floating glowing "Z / z / ✦" dream sprites
      const o = db.zzzOrigin;
      for (const item of db.zzz) {
        const u = (time * 0.36 + item.ph) % 1;
        item.sp.visible = true;
        item.sp.position.set(
          o.x + Math.sin(u * Math.PI * 2 + item.ph * 6) * 0.16,
          o.y + u * 0.68,
          o.z + Math.cos(u * Math.PI * 2 + item.ph * 6) * 0.10
        );
        const fade = Math.sin(u * Math.PI);
        item.sp.material.opacity = fade * 0.92;
      }
      if ((db.sparkT -= dt) <= 0) {
        db.sparkT = 0.55;
        const pk = Math.random() > 0.5;
        g.puffs.spawn(
          db.focus.x + (Math.random() - 0.5) * 1.4,
          db.focus.y + 0.15,
          db.focus.z + (Math.random() - 0.5) * 1.4,
          0, 0.42, 0, 0.05, 0.85, 0.8, pk ? 1 : 0.3, pk ? 0.55 : 0.9, pk ? 0.9 : 1, -0.1, 0.8
        );
      }
    } else {
      if (db.quilt && db.quilt.visible) db.quilt.visible = false;
      if (db.dreamSprite && db.dreamSprite.visible) {
        db.dreamSprite.visible = false;
        db.dreamSprite.material.opacity = 0;
      }
      if (db.zzz.length && db.zzz[0].sp.visible) {
        for (const item of db.zzz) {
          item.sp.visible = false;
          item.sp.material.opacity = 0;
        }
      }
    }

    // 7. Kitty Fireworks queue & rockets
    for (let i = this.fwQueue.length - 1; i >= 0; i--) {
      if ((this.fwQueue[i].t -= dt) <= 0) {
        this.launchCatRocket(this.fwQueue.splice(i, 1)[0]);
      }
    }
    for (let i = this.fwRockets.length - 1; i >= 0; i--) {
      const rk = this.fwRockets[i];
      rk.v.y -= 5.2 * dt;
      rk.p.addScaledVector(rk.v, dt);
      rk.life -= dt;
      g.sparks.spawn(
        rk.p.x, rk.p.y, rk.p.z,
        (Math.random() - 0.5) * 0.6, -1.2, (Math.random() - 0.5) * 0.6,
        0.10, 0.95, 0.32, rk.col[0], rk.col[1], rk.col[2], 1.5, 0.8
      );
      if (rk.life <= 0) {
        this.burstCatRocket(rk);
        this.fwRockets.splice(i, 1);
      }
    }

    // 8. Distance-culled ambient steam, hearth embers & starry fireflies (only when player is within 45m)
    const cam = g.camera;
    if (!cam) return;
    const distSq = (cam.position.x - this.center.x) ** 2 + (cam.position.z - this.center.z) ** 2;
    if (distSq > 48 * 48) return;

    if ((this.steamT -= dt) <= 0) {
      this.steamT = 0.22;
      // Warm milk-spring steam
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.85;
      g.puffs.spawn(
        this.poolPos.x + Math.cos(a) * r,
        this.qt(this.poolPos.x, this.poolPos.z) + 0.35,
        this.poolPos.z + Math.sin(a) * r,
        (Math.random() - 0.5) * 0.25, 0.55 + Math.random() * 0.4, (Math.random() - 0.5) * 0.25,
        0.24 + Math.random() * 0.16, 0.24, 1.4 + Math.random() * 0.6,
        0.92, 0.92, 1.0, -0.15, 0.7
      );
      // Taiyaki grill warm aroma steam
      g.puffs.spawn(
        this.grillPos.x + (Math.random() - 0.5) * 0.45,
        this.grillPos.y,
        this.grillPos.z + (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.15, 0.55, (Math.random() - 0.5) * 0.15,
        0.10 + Math.random() * 0.06, 0.28, 0.9, 1.0, 0.94, 0.88, -0.1, 0.8
      );
    }

    if ((this.emberT -= dt) <= 0) {
      this.emberT = 0.26;
      g.sparks.spawn(
        this.hearthPos.x + (Math.random() - 0.5) * 0.24,
        this.hearthPos.y,
        this.hearthPos.z + (Math.random() - 0.5) * 0.24,
        (Math.random() - 0.5) * 0.2, 0.75 + Math.random() * 0.5, (Math.random() - 0.5) * 0.2,
        0.045, 0.95, 0.75, 2.8, 1.2, 0.45, -0.2, 0.5
      );
    }

    if ((this.ambientT -= dt) <= 0) {
      this.ambientT = 0.38;
      // Gentle cyan/pink floating starlight motes over the sanctuary
      const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 11;
      const pk = Math.random() > 0.5;
      const mx = this.center.x + Math.cos(a) * r, mz = this.center.z + Math.sin(a) * r;
      g.sparks.spawn(
        mx, this.qt(mx, mz) + 0.8 + Math.random() * 3.4, mz,
        (Math.random() - 0.5) * 0.3, 0.22 + Math.random() * 0.25, (Math.random() - 0.5) * 0.3,
        0.055, 0.9, 1.4, pk ? 2.6 : 0.7, pk ? 1.0 : 2.3, pk ? 2.3 : 3.2, -0.05, 0.4
      );
    }
  }
}
