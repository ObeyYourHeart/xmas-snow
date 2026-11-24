// 极光星雪歌舞厅 · 冬日舞会水晶宫 (js/ballroom.js)
// - 华丽可步入水晶圆顶歌舞厅（24 块随节拍律动发光舞池灯砖、头顶旋转水晶迪斯科球 + 四色旋转舞台光束、
//   戴耳机的雪人 DJ 与 7 根实时跳动音频柱、天鹅绒卡座与冬日热饮吧！）
// - 内置 3 首程序化冬日舞曲（空间距离衰减，靠近自动响起，支持在 DJ 台随时切歌！）
// - 偶尔自动聚集开舞会（定时召集 5-6 位 AI 伙伴来到舞池围圈同步蹦跳摇摆/跳街舞，结束后优雅散场，
//   也可随时在 DJ 台按 E 一键开趴、在舞池中央按 E 加入一起跳！）

const TRACKS = [
  {
    name: "冬日星雪圆舞曲",
    bpm: 116,
    melody: [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33, 659.25, 783.99, 880, 1046.5, 987.77, 880, 783.99, 659.25],
    bass: [130.81, 130.81, 196.0, 196.0, 146.83, 146.83, 196.0, 196.0, 174.61, 174.61, 220.0, 220.0, 196.0, 196.0, 130.81, 130.81]
  },
  {
    name: "双子星霓虹节拍",
    bpm: 124,
    melody: [587.33, 880, 783.99, 1174.66, 1046.5, 880, 783.99, 659.25, 783.99, 987.77, 1174.66, 1318.5, 1174.66, 987.77, 880, 783.99],
    bass: [146.83, 146.83, 220.0, 146.83, 164.81, 164.81, 246.94, 164.81, 196.0, 196.0, 293.66, 196.0, 220.0, 220.0, 164.81, 146.83]
  },
  {
    name: "平安夜八音盒爵士",
    bpm: 108,
    melody: [659.25, 783.99, 987.77, 1174.66, 1046.5, 880, 783.99, 659.25, 587.33, 739.99, 880, 1046.5, 987.77, 783.99, 659.25, 523.25],
    bass: [164.81, 196.0, 246.94, 196.0, 130.81, 164.81, 196.0, 164.81, 146.83, 185.0, 220.0, 185.0, 196.0, 164.81, 146.81, 130.81]
  }
];

const DANCE_LINES = [
  "♪ 这首冬日舞曲超好听，大家一起来跳呀！",
  "踩着极光灯砖的节拍转圈圈～",
  "雪人 DJ 打碟太带感啦！",
  "今晚的星雪歌舞厅气氛满分！",
  "快进舞池，咱们一起合跳一段！"
];

export class WinterBallroom {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;
    this.THREE = game.THREE;

    this.group = null;
    this.cx = this.re.ballroom.x;
    this.cz = this.re.ballroom.z;
    this.cy = 0;
    this.deckY = 0;

    this.tiles = [];
    this.eqBars = [];
    this.discoBall = null;
    this.spotRig = null;
    this.djSnowman = null;
    this.lights = [];

    // Live beat & spatial music sequencer state
    this.trackIdx = 0;
    this.stepIdx = 0;
    this.beatAcc = 0;
    this.beatPulse = 0;

    // Periodic AI Friend Dance Party state
    this.partyActive = false;
    this.partyTimer = 0;
    this.nextPartyIn = 26; // First spontaneous gathering ~26s after start, then every ~82s!
    this.dancers = [];     // [{ friend, slotAng, slotR, prevX, prevZ, prevYaw, ph, talkCd }]
    this.sparkAcc = 0;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  makeMarqueeSign(text) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 128;
    const c = cv.getContext("2d");
    const grd = c.createLinearGradient(0, 0, 640, 0);
    grd.addColorStop(0, "#1c1742");
    grd.addColorStop(0.5, "#341e66");
    grd.addColorStop(1, "#1c1742");
    c.fillStyle = grd;
    c.fillRect(0, 0, 640, 128);
    c.strokeStyle = "#ffd966";
    c.lineWidth = 8;
    c.strokeRect(8, 8, 624, 112);
    c.fillStyle = "#fff6dc";
    c.font = '700 48px "Microsoft YaHei", "PingFang SC", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 320, 66);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    const mat = this.wrapMat(new T.MeshStandardMaterial({
      map: tex,
      emissive: new T.Color(0.45, 0.36, 0.72),
      emissiveIntensity: 0.65,
      roughness: 0.35
    }), { key: "plain" });
    return this.mesh(new T.BoxGeometry(4.4, 0.86, 0.14), mat);
  }

  build() {
    const T = this.THREE;
    const { scene, world, explore } = this.game;
    const x0 = this.cx, z0 = this.cz, y0 = this.qt(x0, z0);
    this.cy = y0;
    const deckH = 0.24;
    this.deckY = y0 + deckH;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.45, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const darkMarble = std(0x181c36, 0.18, { metalness: 0.32 });
    const whiteMarble = std(0xf0f4fb, 0.28, { metalness: 0.10 });
    const gold = std(0xffd25a, 0.18, { metalness: 0.90 });
    const velvet = std(0x9e2452, 0.65);
    const snow = std(0xf6f9ff, 0.55);
    const glassDome = plain(new T.MeshPhysicalMaterial({
      color: 0xbcecff,
      emissive: new T.Color(0.14, 0.18, 0.42),
      emissiveIntensity: 0.22,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.24,
      side: T.DoubleSide,
      depthWrite: false
    }));

    const g = this.group = new T.Group();
    g.name = "winter_ballroom";
    g.position.set(x0, y0, z0);
    scene.add(g);

    // =========================================================================
    // 1. RAISED MARBLE DANCE DECK + 24 BEAT-REACTIVE GLOWING MOSAIC FLOOR TILES!
    // =========================================================================
    g.add(
      this.mesh(new T.CylinderGeometry(8.5, 9.0, deckH, 32), darkMarble, 0, deckH / 2, 0),
      this.mesh(new T.TorusGeometry(8.48, 0.13, 8, 48).rotateX(Math.PI / 2), gold, 0, deckH + 0.02, 0),
      this.mesh(new T.TorusGeometry(5.6, 0.06, 6, 40).rotateX(Math.PI / 2), gold, 0, deckH + 0.015, 0)
    );
    world.platforms.push({
      test: (x, z) => Math.hypot(x - x0, z - z0) < 8.7,
      y: () => this.deckY
    });

    const tilePalette = [0x46f0ff, 0xff70d8, 0xffd95a, 0x62ffba, 0x9b82ff];
    const tileGeo = new T.BoxGeometry(1.18, 0.04, 1.18);
    // Inner ring (8 tiles) + outer ring (16 tiles)
    for (const [ringR, count, offset] of [[2.1, 8, 0], [4.25, 16, 0.2]]) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + offset;
        const hex = tilePalette[(i + (count === 16 ? 2 : 0)) % tilePalette.length];
        const mat = plain(new T.MeshStandardMaterial({
          color: hex,
          emissive: new T.Color(hex),
          emissiveIntensity: 0.65,
          roughness: 0.16,
          metalness: 0.25
        }));
        const m = this.mesh(tileGeo, mat, Math.cos(a) * ringR, deckH + 0.015, Math.sin(a) * ringR);
        m.rotation.y = -a;
        g.add(m);
        this.tiles.push({ mat, ph: i * 0.55 + ringR, baseCol: new T.Color(hex) });
      }
    }
    // Center twin-star dance floor emblem
    const centerMat = plain(new T.MeshStandardMaterial({
      color: 0xffffff, emissive: new T.Color(0.55, 0.85, 1.0), emissiveIntensity: 1.0, roughness: 0.12
    }));
    g.add(this.mesh(new T.CylinderGeometry(1.05, 1.05, 0.04, 16), centerMat, 0, deckH + 0.018, 0));
    this.tiles.push({ mat: centerMat, ph: 0, baseCol: new T.Color(0x88f4ff) });

    // =========================================================================
    // 2. 8 GRAND MARBLE COLUMNS, CRYSTAL STARLIGHT DOME & MARQUEE ENTRANCE!
    // =========================================================================
    const colR = 7.9, colH = 4.6;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(a) * colR, pz = Math.sin(a) * colR;
      g.add(
        this.mesh(new T.CylinderGeometry(0.24, 0.30, colH, 12), whiteMarble, px, deckH + colH / 2, pz),
        this.mesh(new T.TorusGeometry(0.32, 0.06, 6, 16).rotateX(Math.PI / 2), gold, px, deckH + 0.14, pz),
        this.mesh(new T.TorusGeometry(0.30, 0.06, 6, 16).rotateX(Math.PI / 2), gold, px, deckH + colH - 0.10, pz)
      );
      world.circles.push({ x: x0 + px, z: z0 + pz, r: 0.38 });

      // Curved golden dome rib sweeping up to zenith!
      const ribPts = [];
      for (let k = 0; k <= 8; k++) {
        const phi = (k / 8) * (Math.PI * 0.48);
        const rr = Math.cos(phi) * colR;
        const yy = deckH + colH + Math.sin(phi) * 3.2;
        ribPts.push(new T.Vector3(Math.cos(a) * rr, yy, Math.sin(a) * rr));
      }
      g.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ribPts), 14, 0.085, 6, false), gold));
    }

    // Ring cornice + translucent Crystal Dome Canopy + Crown Star Finial + Front Marquee Sign!
    const eaveY = deckH + colH;
    g.add(
      this.mesh(new T.TorusGeometry(colR, 0.16, 8, 48).rotateX(Math.PI / 2), gold, 0, eaveY, 0),
      this.mesh(new T.SphereGeometry(colR, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48), glassDome, 0, eaveY, 0)
    );
    g.children[g.children.length - 1].scale.set(1, 0.41, 1);

    const crownStar = this.mesh(new T.OctahedronGeometry(0.68, 0), gold, 0, eaveY + 3.65, 0);
    g.add(crownStar);
    this.crownStar = crownStar;

    // Glowing Marquee Sign over the south-east main entrance!
    const sign = this.makeMarqueeSign("✦ 极光星雪歌舞厅 ✦");
    sign.position.set(0, eaveY + 0.55, colR + 0.12);
    g.add(sign);

    // =========================================================================
    // 3. OVERHEAD SPINNING CRYSTAL DISCO BALL + 4 ROTATING STAGE SPOTLIGHT BEAMS!
    // =========================================================================
    const discoG = new T.Group();
    discoG.position.set(0, eaveY + 0.72, 0);
    const ballMat = plain(new T.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new T.Color(0.55, 0.75, 1.0),
      emissiveIntensity: 0.9,
      roughness: 0.06,
      metalness: 0.96,
      flatShading: true
    }));
    discoG.add(
      this.mesh(new T.CylinderGeometry(0.03, 0.03, 2.2, 6), gold, 0, 1.1, 0),
      this.mesh(new T.IcosahedronGeometry(0.76, 1), ballMat),
      this.mesh(new T.TorusGeometry(1.05, 0.04, 6, 28).rotateX(Math.PI / 3), gold)
    );
    g.add(discoG);
    this.discoBall = discoG;

    // 4 Translucent Colored Stage Spotlight Cones sweeping gracefully across the floor!
    const spotRig = new T.Group();
    spotRig.position.set(0, eaveY + 0.4, 0);
    const coneGeo = new T.ConeGeometry(1.85, 5.4, 16, 1, true);
    coneGeo.translate(0, -2.7, 0);
    const spotColors = [0x48f0ff, 0xff6ad8, 0xffd858, 0x5effb8];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const sm = new T.MeshBasicMaterial({
        color: spotColors[i],
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        side: T.DoubleSide,
        blending: T.AdditiveBlending
      });
      const cm = new T.Mesh(coneGeo, sm);
      cm.rotation.set(0.42, a, 0.25);
      cm.renderOrder = 5;
      spotRig.add(cm);
    }
    g.add(spotRig);
    this.spotRig = spotRig;

    // =========================================================================
    // 4. BACKSTAGE DJ CONSOLE, 7 REAL-TIME EQUALIZER BARS & HEADPHONE SNOWMAN DJ!
    // =========================================================================
    const stage = new T.Group();
    stage.position.set(0, deckH, -5.6);
    stage.add(
      this.mesh(new T.BoxGeometry(3.8, 0.36, 1.8), whiteMarble, 0, 0.18, 0),
      this.mesh(new T.BoxGeometry(2.6, 1.02, 0.85), darkMarble, 0, 0.87, 0.22),
      this.mesh(new T.BoxGeometry(2.7, 0.08, 0.92), gold, 0, 1.40, 0.22),
      // Dual Spinning DJ Turntable Discs!
      this.mesh(new T.CylinderGeometry(0.34, 0.34, 0.05, 18), std(0x111524, 0.2, { metalness: 0.7 }), -0.58, 1.46, 0.22),
      this.mesh(new T.CylinderGeometry(0.34, 0.34, 0.05, 18), std(0x111524, 0.2, { metalness: 0.7 }), 0.58, 1.46, 0.22),
      this.mesh(new T.TorusGeometry(0.35, 0.025, 6, 18).rotateX(Math.PI / 2), plain(new T.MeshStandardMaterial({ color: 0x52f2ff, emissive: new T.Color(0.2, 0.9, 1.0), emissiveIntensity: 1.5 })), -0.58, 1.47, 0.22),
      this.mesh(new T.TorusGeometry(0.35, 0.025, 6, 18).rotateX(Math.PI / 2), plain(new T.MeshStandardMaterial({ color: 0xff70d8, emissive: new T.Color(1.0, 0.3, 0.85), emissiveIntensity: 1.5 })), 0.58, 1.47, 0.22)
    );

    // 7 Animated Glowing Audio Equalizer Bars behind DJ!
    for (let i = 0; i < 7; i++) {
      const col = tilePalette[i % tilePalette.length];
      const em = plain(new T.MeshStandardMaterial({
        color: col, emissive: new T.Color(col), emissiveIntensity: 1.5, roughness: 0.15
      }));
      const barGeo = new T.BoxGeometry(0.28, 1.0, 0.14);
      barGeo.translate(0, 0.5, 0);
      const bar = this.mesh(barGeo, em, (i - 3) * 0.42, 0.55, -0.78);
      stage.add(bar);
      this.eqBars.push({ m: bar, ph: i * 0.7 });
    }

    // Adorable Headphone-Wearing Snowman DJ grooving behind the turntable!
    const dj = new T.Group();
    dj.position.set(0, 0.36, -0.35);
    const hpMat = plain(new T.MeshStandardMaterial({ color: 0xff62d2, emissive: new T.Color(0.8, 0.2, 0.6), emissiveIntensity: 0.8, roughness: 0.25 }));
    dj.add(
      this.mesh(new T.SphereGeometry(0.46, 14, 12), snow, 0, 0.44, 0),
      this.mesh(new T.SphereGeometry(0.34, 14, 12), snow, 0, 1.02, 0),
      this.mesh(new T.SphereGeometry(0.24, 14, 12), snow, 0, 1.50, 0),
      // Carrot nose & bright eyes
      this.mesh(new T.ConeGeometry(0.042, 0.16, 8).rotateX(Math.PI / 2), std(0xff7824, 0.4), 0, 1.48, 0.26),
      this.mesh(new T.SphereGeometry(0.032, 8, 6), darkMarble, -0.085, 1.55, 0.21),
      this.mesh(new T.SphereGeometry(0.032, 8, 6), darkMarble, 0.085, 1.55, 0.21),
      // Glowing Pink/Cyan DJ Headphones!
      this.mesh(new T.TorusGeometry(0.26, 0.032, 8, 20, Math.PI), hpMat, 0, 1.52, 0),
      this.mesh(new T.CylinderGeometry(0.09, 0.09, 0.07, 12).rotateZ(Math.PI / 2), hpMat, -0.26, 1.52, 0),
      this.mesh(new T.CylinderGeometry(0.09, 0.09, 0.07, 12).rotateZ(Math.PI / 2), hpMat, 0.26, 1.52, 0)
    );
    stage.add(dj);
    this.djSnowman = dj;
    g.add(stage);
    world.boxes.push({ x0: x0 - 2.0, x1: x0 + 2.0, z0: z0 - 6.6, z1: z0 - 4.5, h: 2.2 });

    // Two Cozy Velvet Lounge Sofas framing the left & right ballroom edges!
    for (const side of [-1, 1]) {
      const sf = new T.Group();
      sf.position.set(side * 6.2, deckH, 0.4);
      sf.rotation.y = side * -Math.PI / 2;
      sf.add(
        this.mesh(new T.BoxGeometry(2.4, 0.45, 0.92), velvet, 0, 0.225, 0),
        this.mesh(new T.BoxGeometry(2.4, 0.65, 0.22), velvet, 0, 0.68, -0.36),
        this.mesh(new T.BoxGeometry(2.48, 0.08, 0.26), gold, 0, 1.02, -0.36)
      );
      g.add(sf);
      world.circles.push({ x: x0 + side * 6.2, z: z0 + 0.4, r: 0.95, top: deckH + 0.85 });
    }

    // Warm Colorful Ballroom PointLights (auto-managed by O.localLights!)
    const addL = (lx, ly, lz, col, pwr) => {
      const l = new T.PointLight(col, 0, 22, 1.4);
      l.position.set(x0 + lx, y0 + ly, z0 + lz);
      scene.add(l);
      this.lights.push({ l, pwr });
    };
    addL(0, 4.2, 0, 0x8ef4ff, 15);
    addL(0, 3.0, -4.6, 0xff8ce2, 12);

    // =========================================================================
    // 5. INTERACTIVE SPOTS & M-MAP REGISTRATION!
    // =========================================================================
    world.spots.push({
      id: "ballroom_dj",
      pos: new T.Vector3(x0, this.deckY + 1.2, z0 - 4.2),
      r: 2.8,
      label: () => (this.partyActive ? `切换舞曲（当前：${TRACKS[this.trackIdx].name}）` : "开启星雪舞会 · 召集伙伴来跳舞！"),
      can: () => !this.game.player.riding && !this.game.player.skiing,
      act: () => {
        if (!this.partyActive) {
          this.startParty(true);
        } else {
          this.trackIdx = (this.trackIdx + 1) % TRACKS.length;
          this.stepIdx = 0;
          this.game.audio.pick && this.game.audio.pick();
          this.game.ui.toast(`♪ 雪人 DJ 已切换舞曲：「${TRACKS[this.trackIdx].name}」！`, 4);
        }
      }
    });

    world.spots.push({
      id: "ballroom_dance",
      pos: new T.Vector3(x0, this.deckY + 0.9, z0 + 0.5),
      r: 3.4,
      label: "加入舞池 · 跟着节拍一起跳舞！",
      can: () => !this.game.player.riding && !this.game.player.skiing && !this.game.player.seat,
      act: () => {
        const gm = this.game;
        if (!this.partyActive) this.startParty(false);
        if (gm.character && gm.character.play) {
          gm.character.play(gm.character.acts && gm.character.acts.dance ? "dance" : "victory");
        }
        gm.cold && gm.cold.warm(35);
        for (let k = 0; k < 20; k++) {
          const a = (k / 20) * Math.PI * 2;
          gm.sparks.spawn(
            x0 + Math.cos(a) * 1.4, this.deckY + 0.4, z0 + Math.sin(a) * 1.4,
            Math.cos(a) * 1.6, 1.5 + Math.random() * 1.5, Math.sin(a) * 1.6,
            0.14, 0.92, 0.85, k % 2 ? 3.2 : 0.8, k % 2 ? 1.2 : 2.9, k % 2 ? 2.8 : 3.6, 0.4, 1.2
          );
        }
        gm.ui.toast(`♪ 随着「${TRACKS[this.trackIdx].name}」在极光舞池里尽情起舞吧喵～`, 4.2);
      }
    });

    if (explore && explore.sites && !explore.sites.some((s) => s.id === "ballroom")) {
      explore.sites.push({ id: "ballroom", name: "极光星雪歌舞厅", x: x0, z: z0, r: 12, found: false });
      if (this.game.logic && this.game.logic.count) {
        this.game.logic.count("places", explore.found || 0, explore.sites.length);
      }
    }

    return this;
  }

  // =========================================================================
  // PERIODIC & ON-DEMAND AI DANCE PARTY CHOREOGRAPHY!
  // =========================================================================
  startParty(manual = false) {
    const g = this.game;
    if (!g.friends || !g.friends.list || !g.friends.list.length) return;
    if (this.partyActive) return;

    this.partyActive = true;
    this.partyTimer = 46; // 46 seconds of joyful dancing!
    this.dancers.length = 0;

    // Pick 6 available AI friends (never hijack friends following player, riding train, or hosting indoors!)
    const candidates = g.friends.list.filter(
      (f) => f && f.id !== "clawd" && f.mode !== "follow" && f.mode !== "train" && f.mode !== "castleIndoor"
    );
    // Shuffle deterministically-ish with Math.random so different groups gather each time!
    candidates.sort(() => Math.random() - 0.5);
    const chosen = candidates.slice(0, Math.min(6, candidates.length));

    chosen.forEach((f, idx) => {
      const ang = (idx / chosen.length) * Math.PI * 2 + 0.35;
      const rad = 2.6 + (idx % 2) * 0.9;
      const sx = this.cx + Math.cos(ang) * rad;
      const sz = this.cz + Math.sin(ang) * rad;
      this.dancers.push({
        f,
        slotX: sx,
        slotZ: sz,
        prevX: f.x,
        prevZ: f.z,
        prevY: f.y,
        prevYaw: f.yaw,
        prevYaw0: f.yaw0,
        ph: idx * 1.15,
        talkCd: 3 + idx * 3.5
      });
      // Place smoothly ON TOP of the raised marble dance floor & update collider/spot!
      f.x = sx;
      f.z = sz;
      f.y = this.deckY;
      f.yaw = Math.atan2(-(this.cx - f.x), -(this.cz - f.z));
      f.yaw0 = f.yaw;
      f.mode = "danceParty";
      if (f.col) { f.col.x = f.x; f.col.z = f.z; }
      if (f.spot && f.spot.pos) f.spot.pos.set(f.x, f.y + 0.9, f.z);
      if (f.obj) f.obj.position.set(f.x, f.y, f.z);
      if (f.rigged && g.friends.playRigged && f.acts && f.acts.dance) {
        g.friends.playRigged(f, "dance", { loop: true, fade: 0.25 });
      }
    });

    if (manual) {
      g.audio.done && g.audio.done();
      g.ui.toast(`♪ 极光星雪舞会开场啦！${chosen.map((c) => c.name).join("、")} 已经聚到舞池里一起跳舞喵～`, 5.5);
    } else if (g.started) {
      const dist = g.player ? Math.hypot(g.player.pos.x - this.cx, g.player.pos.z - this.cz) : 99;
      if (dist < 140) {
        g.ui.toast(`♪ 极光星雪歌舞厅的音乐响起来啦，${chosen.length} 位伙伴正聚在一起跳舞（按 M 可直接传送）`, 5.5);
      }
    }
  }

  endParty() {
    const g = this.game;
    this.partyActive = false;
    this.nextPartyIn = 78 + Math.random() * 28;
    for (const d of this.dancers) {
      const f = d.f;
      if (!f || f.mode !== "danceParty") continue;
      f.mode = null;
      f.x = d.prevX;
      f.z = d.prevZ;
      f.y = g.world && g.world.groundAt ? g.world.groundAt(f.x, f.z) : d.prevY;
      f.yaw = d.prevYaw;
      f.yaw0 = d.prevYaw0 ?? d.prevYaw;
      if (f.col) { f.col.x = f.x; f.col.z = f.z; }
      if (f.spot && f.spot.pos) f.spot.pos.set(f.x, f.y + 0.9, f.z);
      if (f.obj) f.obj.position.set(f.x, f.y, f.z);
      if (f.rigged && f.rig && f.rig.act && f.rig.act.name === "dance") {
        f.rig.act.target = 0;
      }
    }
    this.dancers.length = 0;
  }

  // =========================================================================
  // SPATIAL PROCEDURAL WINTER DANCE MUSIC SEQUENCER
  // =========================================================================
  playBeatNote(vol) {
    const audio = this.game.audio;
    if (!audio || !audio.ctx || audio.muted || vol < 0.015) return;
    const ctx = audio.ctx;
    const t0 = ctx.currentTime;
    const tr = TRACKS[this.trackIdx];
    const idx = this.stepIdx % tr.melody.length;
    const mel = tr.melody[idx];
    const bas = tr.bass[idx];

    const playTone = (freq, type, dur, gainVal, revVal = 0.25) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(1e-4, t0);
      gn.gain.linearRampToValueAtTime(gainVal * vol, t0 + 0.008);
      gn.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
      o.connect(gn).connect(audio.master);
      if (revVal > 0 && audio.rev) {
        const rg = ctx.createGain();
        rg.gain.value = revVal;
        gn.connect(rg).connect(audio.rev);
      }
      o.start(t0);
      o.stop(t0 + dur + 0.06);
    };

    // Sparkling winter celesta lead + soft octave shimmer
    playTone(mel, "sine", 0.30, 0.036, 0.38);
    playTone(mel * 2, "sine", 0.16, 0.011, 0.30);
    // Warm cozy bass groove on even beats
    if (idx % 2 === 0) {
      playTone(bas, "triangle", 0.38, 0.048, 0.10);
      // Soft punchy dance kick drum
      const ko = ctx.createOscillator();
      ko.type = "sine";
      ko.frequency.setValueAtTime(118, t0);
      ko.frequency.exponentialRampToValueAtTime(42, t0 + 0.11);
      const kg = ctx.createGain();
      kg.gain.setValueAtTime(1e-4, t0);
      kg.gain.linearRampToValueAtTime(0.068 * vol, t0 + 0.005);
      kg.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.14);
      ko.connect(kg).connect(audio.master);
      ko.start(t0);
      ko.stop(t0 + 0.18);
    } else if (audio.white) {
      // Crisp tiny winter shaker / sleigh-bell offbeat tick
      const ns = ctx.createBufferSource();
      ns.buffer = audio.white;
      ns.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 5200;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(1e-4, t0);
      ng.gain.linearRampToValueAtTime(0.014 * vol, t0 + 0.004);
      ng.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.065);
      ns.connect(hp).connect(ng).connect(audio.master);
      ns.start(t0, Math.random());
      ns.stop(t0 + 0.09);
    }
  }

  update(dt, time) {
    if (!this.group) return;
    const g = this.game;
    const pl = g.player;
    const inside = !!(g.cabin && g.cabin.inside);
    const dist = pl && !inside ? Math.hypot(pl.pos.x - this.cx, pl.pos.z - this.cz) : 999;

    // 1) Beat clock & spatial dance music!
    const tr = TRACKS[this.trackIdx];
    const stepDur = 60 / tr.bpm / 2; // eighth-note groove
    this.beatAcc += dt;
    this.beatPulse = Math.max(0, this.beatPulse - dt * 3.8);
    if (this.beatAcc >= stepDur) {
      this.beatAcc -= stepDur;
      this.stepIdx++;
      this.beatPulse = 1.0;
      const spatialVol = dist < 38 ? Math.pow(Math.max(0, 1 - dist / 38), 1.6) * (this.partyActive ? 1.0 : 0.62) : 0;
      if (g.started && spatialVol > 0.02) {
        this.playBeatNote(spatialVol);
      }
    }

    // 2) Animate glowing mosaic tiles, spinning disco ball, stage spotlights, EQ bars & DJ Snowman!
    const pulse = this.beatPulse;
    const partyBoost = this.partyActive ? 1.45 : 0.90;
    for (let i = 0; i < this.tiles.length; i++) {
      const tl = this.tiles[i];
      const wave = 0.45 + 0.55 * Math.sin(time * 3.6 + tl.ph);
      tl.mat.emissiveIntensity = (0.45 + 0.95 * wave + 0.55 * pulse) * partyBoost;
    }
    if (this.discoBall) {
      this.discoBall.rotation.y = time * (this.partyActive ? 1.15 : 0.55);
    }
    if (this.spotRig) {
      this.spotRig.rotation.y = -time * (this.partyActive ? 0.95 : 0.42);
      this.spotRig.visible = this.partyActive || (g.env && g.env.night > 0.2) || dist < 24;
    }
    if (this.crownStar) {
      this.crownStar.rotation.y = time * 1.1;
    }
    for (let i = 0; i < this.eqBars.length; i++) {
      const eb = this.eqBars[i];
      const h = 0.35 + (0.65 + 0.95 * pulse) * (0.4 + 0.6 * Math.abs(Math.sin(time * 6.5 + eb.ph)));
      eb.m.scale.y = h * (this.partyActive ? 1.35 : 0.85);
    }
    if (this.djSnowman) {
      this.djSnowman.position.y = 0.36 + pulse * 0.09;
      this.djSnowman.rotation.z = Math.sin(time * 5.8) * 0.09;
    }
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;
    for (const lt of this.lights) {
      lt.l.intensity = lt.pwr * (this.partyActive ? 0.95 + 0.25 * pulse : 0.35 + 0.65 * lamps);
    }

    // 3) Spontaneous Periodic Dance Party Scheduler & Live Dancer Choreography!
    if (g.started && g.friends && g.friends.list && g.friends.list.length > 3) {
      if (!this.partyActive) {
        this.nextPartyIn -= dt;
        // Also start a welcoming party sooner if player walks right onto the dance floor!
        if (this.nextPartyIn <= 0 || (dist < 7.5 && this.nextPartyIn < 55)) {
          this.startParty(false);
        }
      } else {
        this.partyTimer -= dt;
        if (this.partyTimer <= 0) {
          this.endParty();
        } else {
          // Choreograph every dancing friend smoothly to the beat!
          for (const d of this.dancers) {
            const f = d.f;
            if (!f || f.mode !== "danceParty") continue;
            // Gentle rhythmic bounce + swaying dance circle right on top of the ballroom deck!
            f.x = d.slotX + Math.sin(time * 2.2 + d.ph) * 0.26;
            f.z = d.slotZ + Math.cos(time * 2.2 + d.ph) * 0.26;
            f.y = this.deckY;
            f.yaw0 = Math.atan2(-(this.cx - f.x), -(this.cz - f.z)) + Math.sin(time * 3.1 + d.ph) * 0.45;
            if (f.col) { f.col.x = f.x; f.col.z = f.z; }
            if (f.spot && f.spot.pos) f.spot.pos.set(f.x, f.y + 0.9, f.z);
            if (f.gait) {
              f.walk = 1.35;
              if (f.gait.gest) f.gait.wave = Math.max(f.gait.wave || 0, 0.45);
            }
            if (pulse > 0.85 && !f.rigged && f.hop <= 0 && Math.random() < 0.55) {
              g.friends.hopNow(f, 0.22, 0.36);
            }
            if (f.rigged && g.friends.playRigged && f.acts && f.acts.dance && (!f.rig || !f.rig.act)) {
              g.friends.playRigged(f, "dance", { loop: true, fade: 0.25 });
            }
            // Occasional festive dance bubble when player is nearby!
            d.talkCd -= dt;
            if (dist < 18 && d.talkCd <= 0 && g.friends.sayT <= 0) {
              d.talkCd = 11 + Math.random() * 8;
              g.friends.say(f, DANCE_LINES[Math.floor(Math.random() * DANCE_LINES.length)], 3.6);
            }
          }

          // Floating colorful disco-note sparkles rising from the dance floor during parties!
          if (dist < 42) {
            this.sparkAcc += dt * 7.5;
            while (this.sparkAcc >= 1) {
              this.sparkAcc -= 1;
              const a = Math.random() * Math.PI * 2;
              const r = Math.random() * 4.8;
              const c = [[0.4, 2.8, 3.6], [3.4, 1.1, 2.8], [3.5, 2.7, 0.6], [0.5, 3.2, 2.0]][Math.floor(Math.random() * 4)];
              g.sparks.spawn(
                this.cx + Math.cos(a) * r, this.deckY + 0.6 + Math.random() * 1.4, this.cz + Math.sin(a) * r,
                (Math.random() - 0.5) * 0.4, 0.8 + Math.random() * 1.1, (Math.random() - 0.5) * 0.4,
                0.11, 0.9, 1.0, c[0], c[1], c[2], -0.1, 1.0
              );
            }
          }
        }
      }
    }
  }
}
