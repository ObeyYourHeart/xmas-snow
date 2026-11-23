// Gemini 全新原创猫猫专属五件套武器 (100% 独立猫猫设计，零照抄 Claude)
// Slot 1 (net)     -> 星月逗猫棒 (Starlight Feather-Teaser Wand with swinging luminous feather-bell lure)
// Slot 2 (cane)    -> 星霜大鱼干 (Giant Sculpted Shimmering Dried-Fish with ribboned tail grip)
// Slot 3 (blaster) -> 星弦猫耳光弓 (Celestial Crescent Cat-Ear Harp-Bow with glowing strings & floating star-gem ammo)
// Slot 4 (hammer)  -> 巨型星光大猫爪 (Oversized Fluffy Glowing Plush Cat-Paw Gauntlet with sakura toe beans)
// Slot 5 (sword)   -> 双子星月猫镰 (Twin-Star Crescent Kitty-Scythe with orbiting star shards & cat-bell tassel)

export const GEMINI_WEAPON_DEFS = {
  net: {
    id: "net",
    name: "星月逗猫棒",
    verb: "逗一逗",
    tip: "发光羽毛与金铃铛逗猫棒！轻轻一甩撒出星光捕猫环，把面前的 Clawd 逗进图鉴"
  },
  cane: {
    id: "cane",
    name: "星霜大鱼干",
    verb: "鱼甩",
    tip: "闪着星霜的大咸鱼干！一记咸鱼拍甩出星鳞雪花，把面前的目标啪叽打飞"
  },
  blaster: {
    id: "blaster",
    name: "星弦猫耳光弓",
    verb: "星弦",
    tip: "双翼弯月星光竖琴弓，拨动光弦连发青粉星矢，猫耳星晶准星指哪打哪",
    how: "单击画面或按 J 拨弦射出星矢（按住 J 连发）；按住鼠标右键或 F 举弓瞄准"
  },
  hammer: {
    id: "hammer",
    name: "巨型星光大猫爪",
    verb: "大猫拍",
    tip: "毛茸茸的超大发光猫肉球拳套！一记如来神猫掌拍出青粉星环雪浪，周围的都会跳起来"
  },
  sword: {
    id: "sword",
    name: "双子星月猫镰",
    verb: "月斩",
    tip: "猫耳弯月星晶长镰！连按三连星月斩，第三斩挥出飞旋双子星轮；蓄力松开 360° 旋镰，跳斩星陨下劈",
    how: "连按 J（或单击、鼠标右键）是三连星月斩；斩完接着按住 J 蓄力，蓄满松开是星镰回旋斩；跳起来按 J 是星陨下劈"
  }
};

// Custom Gemini carry poses so every unique cat weapon frames cleanly without clipping
export const GEMINI_CARRY_POSES = {
  net: [0.24, 0.22, 0.96, -0.14, 0, 0, 0.44],
  cane: [0.22, 0.22, 0.88, 0.08, 0, 0, 0.44],
  blaster: [0.20, 0.44, 0.85, 0, 0, 0, 0.45],
  hammer: [0.24, 0.22, 0.96, -0.20, 0, 0, 0.48]
};

// Thumbnail framing for each Gemini weapon in toolbar 3D snapshot renderer
export const GEMINI_PIC_CAM = {
  net: [[0.95, 0.45, 1.85], [0, 0.44, 0.06]],
  cane: [[0.92, 0.34, 1.12], [0, 0.30, 0.02]],
  blaster: [[0.82, 0.36, 0.88], [0, 0.08, 0.06]],
  hammer: [[0.85, 0.32, 1.15], [0, 0.24, 0.02]],
  sword: [[1.08, 0.44, 1.38], [0.06, 0.34, 0.08]]
};

function makeFishScaleTex(T) {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const c = cv.getContext("2d");

  // Gradient from starry twilight-blue dorsal back to glistening pearl-silver belly
  const grd = c.createLinearGradient(0, 0, 128, 0);
  grd.addColorStop(0.0, "#eef6ff");
  grd.addColorStop(0.28, "#bfe4ff");
  grd.addColorStop(0.50, "#5c7ae8");
  grd.addColorStop(0.72, "#bfe4ff");
  grd.addColorStop(1.0, "#eef6ff");
  c.fillStyle = grd;
  c.fillRect(0, 0, 128, 128);

  // Shimmering overlapping diamond/arc crystal scales
  c.lineWidth = 1.6;
  for (let row = 0; row < 10; row++) {
    const y = row * 14;
    const ox = (row % 2) * 8;
    for (let col = -1; col < 10; col++) {
      const x = col * 16 + ox;
      c.strokeStyle = row % 2 === 0 ? "rgba(255, 255, 255, 0.52)" : "rgba(255, 214, 145, 0.45)";
      c.beginPath();
      c.arc(x, y, 8, 0.12 * Math.PI, 0.88 * Math.PI);
      c.stroke();
    }
  }

  // Tiny twinkling frost-star flecks
  for (let i = 0; i < 18; i++) {
    const sx = ((i * 37) % 116) + 6;
    const sy = ((i * 53) % 116) + 6;
    c.fillStyle = i % 2 ? "rgba(255, 180, 238, 0.82)" : "rgba(130, 245, 255, 0.85)";
    c.fillRect(sx - 1.5, sy - 1.5, 3, 3);
  }

  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function buildGeminiWeapons(tools, helpers) {
  const T = tools.game.THREE;
  const wrap = (m) => helpers.mat(m, { key: "plain" });
  const std = (r, g, b, rough = 0.4, extra = {}) =>
    wrap(new T.MeshStandardMaterial({ color: new T.Color(r, g, b), roughness: rough, ...extra }));
  const mkMesh = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.frustumCulled = false;
    return m;
  };

  // Cohesive Gemini Starlight Cat Palette
  const gIndigo = std(0.09, 0.11, 0.27, 0.34, { metalness: 0.48 });
  const gPeri = std(0.35, 0.42, 0.94, 0.28, { metalness: 0.26, emissive: new T.Color(0.12, 0.15, 0.44), emissiveIntensity: 0.24 });
  const gGold = wrap(new T.MeshStandardMaterial({ color: new T.Color(0.99, 0.84, 0.48), roughness: 0.18, metalness: 0.92 }));
  const gPearl = std(0.90, 0.94, 1.0, 0.16, { metalness: 0.42, emissive: new T.Color(0.36, 0.62, 1.0), emissiveIntensity: 0.18 });
  const gFur = std(0.97, 0.97, 1.0, 0.48, { metalness: 0.04, emissive: new T.Color(0.20, 0.24, 0.40), emissiveIntensity: 0.08 });
  const gSakura = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.62, 0.86),
    emissive: new T.Color(0.82, 0.24, 0.60),
    emissiveIntensity: 0.42,
    roughness: 0.26,
    metalness: 0.08
  }));
  const gCyan = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.45, 0.95, 1.0),
    emissive: new T.Color(0.24, 0.88, 1.0),
    emissiveIntensity: 1.55,
    roughness: 0.10,
    metalness: 0.15
  }));
  const gPink = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.56, 0.90),
    emissive: new T.Color(0.96, 0.36, 0.84),
    emissiveIntensity: 1.55,
    roughness: 0.10,
    metalness: 0.15
  }));
  const gCrystalCore = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.88, 0.97, 1.0),
    emissive: new T.Color(0.30, 0.86, 1.0),
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0.18
  }));
  const gTranslucentCyan = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.55, 0.94, 1.0),
    emissive: new T.Color(0.24, 0.84, 1.0),
    emissiveIntensity: 0.95,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
    side: T.DoubleSide
  }));
  const gTranslucentPink = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.62, 0.92),
    emissive: new T.Color(0.92, 0.34, 0.80),
    emissiveIntensity: 0.95,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
    side: T.DoubleSide
  }));

  // Geometry builders: 4-point star, cat ear, golden cat bell
  const mkStar = (rx, ry, inner = 0.32, depth = 0.012) => {
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
  };

  const earOutShape = new T.Shape();
  earOutShape.moveTo(-0.032, 0);
  earOutShape.quadraticCurveTo(-0.034, 0.042, 0, 0.074);
  earOutShape.quadraticCurveTo(0.034, 0.042, 0.032, 0);
  earOutShape.closePath();
  const earOutGeo = new T.ExtrudeGeometry(earOutShape, {
    depth: 0.014, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 8
  });
  earOutGeo.translate(0, 0, -0.007);

  const earInShape = new T.Shape();
  earInShape.moveTo(-0.018, 0.01);
  earInShape.quadraticCurveTo(-0.019, 0.036, 0, 0.056);
  earInShape.quadraticCurveTo(0.019, 0.036, 0.018, 0.01);
  earInShape.closePath();
  const earInGeo = new T.ExtrudeGeometry(earInShape, {
    depth: 0.004, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 1, curveSegments: 6
  });
  earInGeo.translate(0, 0, -0.002);

  const mkEar = (sc = 1, outerMat = gPeri) => {
    const grp = new T.Group();
    grp.add(
      mkMesh(earOutGeo, outerMat),
      mkMesh(earInGeo, gSakura, 0, 0, 0.0095),
      mkMesh(earInGeo, gSakura, 0, 0, -0.0095)
    );
    grp.scale.setScalar(sc);
    return grp;
  };

  const bellGeo = new T.SphereGeometry(0.022, 12, 10);
  const bellRingGeo = new T.TorusGeometry(0.0225, 0.0032, 6, 18).rotateX(Math.PI / 2);
  const bellSlitGeo = new T.BoxGeometry(0.030, 0.005, 0.009);
  const mkBell = (sc = 1) => {
    const grp = new T.Group();
    grp.add(
      mkMesh(bellGeo, gGold),
      mkMesh(bellRingGeo, gGold, 0, -0.002, 0),
      mkMesh(bellSlitGeo, gIndigo, 0, -0.011, 0.019),
      mkMesh(bellSlitGeo, gIndigo, 0, -0.011, -0.019)
    );
    grp.scale.setScalar(sc);
    return grp;
  };

  const gripRingGeo = new T.TorusGeometry(0.022, 0.004, 6, 18).rotateX(Math.PI / 2);

  // =========================================================================
  // 1. SLOT "net": 「星月逗猫棒」 (Starlight Feather-Teaser Wand!)
  // =========================================================================
  {
    const grp = new T.Group();
    // Sleek arched cat-teaser fishing wand curving gracefully forward along +Z
    const rodCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, -0.10, 0),
      new T.Vector3(0, 0.16, 0),
      new T.Vector3(0, 0.48, 0.025),
      new T.Vector3(0, 0.74, 0.09),
      new T.Vector3(0, 0.92, 0.21)
    ]);
    grp.add(
      mkMesh(new T.TubeGeometry(rodCurve, 26, 0.0105, 10, false), gIndigo),
      // Velvet sakura-periwinkle handle wrap + gold grip rings + pommel star
      mkMesh(new T.CylinderGeometry(0.019, 0.021, 0.18, 12), gPeri, 0, -0.02, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.095, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.02, 0),
      mkMesh(gripRingGeo, gGold, 0, 0.055, 0),
      mkMesh(new T.TorusGeometry(0.025, 0.0045, 6, 20), gGold, 0, -0.132, 0),
      mkMesh(mkStar(0.021, 0.027, 0.32, 0.011), gCyan, 0, -0.132, 0)
    );

    // Cute golden cat-ear & crescent collar ornament midway up the teaser wand
    const collarY = 0.56, collarZ = 0.042;
    const eL = mkEar(0.75, gGold), eR = mkEar(0.75, gGold);
    eL.position.set(-0.030, collarY + 0.025, collarZ);
    eL.rotation.z = 0.42;
    eR.position.set(0.030, collarY + 0.025, collarZ);
    eR.rotation.z = -0.42;
    const bowL = mkMesh(new T.SphereGeometry(0.026, 10, 8), gSakura, -0.028, collarY - 0.015, collarZ + 0.018);
    const bowR = mkMesh(new T.SphereGeometry(0.026, 10, 8), gSakura, 0.028, collarY - 0.015, collarZ + 0.018);
    bowL.scale.set(1.25, 0.62, 0.42);
    bowL.rotation.z = 0.25;
    bowR.scale.set(1.25, 0.62, 0.42);
    bowR.rotation.z = -0.25;
    grp.add(
      mkMesh(new T.TorusGeometry(0.022, 0.0055, 6, 18).rotateX(Math.PI / 2), gGold, 0, collarY, collarZ),
      eL, eR, bowL, bowR,
      mkMesh(mkStar(0.022, 0.028, 0.32, 0.010), gPink, 0, collarY + 0.005, collarZ + 0.018),
      // Wand tip golden eyelet + glowing tip crystal
      mkMesh(new T.TorusGeometry(0.018, 0.004, 6, 16), gGold, 0, 0.92, 0.215),
      mkMesh(new T.SphereGeometry(0.016, 10, 8), gCyan, 0, 0.92, 0.215)
    );

    // Dynamically swinging Feather-Bell Lure (bag uses local -Z as the downward hanging axis!)
    const lure = new T.Group();
    lure.matrixAutoUpdate = false;
    // Luminous silk string (z = 0 down to z = -0.17)
    const cord = mkMesh(new T.CylinderGeometry(0.0038, 0.0038, 0.17, 6).rotateX(Math.PI / 2), gGold, 0, 0, -0.085);
    // Golden cat-bell + plush fluffy pom-pom core at z = -0.18
    const lureBell = mkBell(1.32);
    lureBell.position.set(0, 0, -0.175);
    const pom = mkMesh(new T.SphereGeometry(0.044, 14, 10), gFur, 0, 0, -0.22);
    // Floating holographic starlight capture ring orbiting the feather tassel
    const haloRing = mkMesh(new T.TorusGeometry(0.105, 0.006, 8, 30), gCyan, 0, 0, -0.27);
    const haloRing2 = mkMesh(new T.TorusGeometry(0.086, 0.0045, 6, 26), gPink, 0, 0, -0.27);
    haloRing2.rotation.x = 0.22;

    // 6 layered sculpted iridescent feather plumes fanning out from z = -0.21 to z = -0.43!
    const fShape = new T.Shape();
    fShape.moveTo(0, 0);
    fShape.quadraticCurveTo(-0.028, 0.08, -0.020, 0.17);
    fShape.quadraticCurveTo(0, 0.23, 0.020, 0.17);
    fShape.quadraticCurveTo(0.028, 0.08, 0, 0);
    const featherGeo = new T.ExtrudeGeometry(fShape, {
      depth: 0.003, bevelEnabled: false, curveSegments: 8
    });
    featherGeo.rotateX(-Math.PI / 2); // now extends along -Z!
    lure.add(cord, lureBell, pom, haloRing, haloRing2);

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const fMat = i % 3 === 0 ? gTranslucentCyan : i % 3 === 1 ? gTranslucentPink : gPearl;
      const f = mkMesh(featherGeo, fMat, Math.cos(ang) * 0.018, Math.sin(ang) * 0.018, -0.21);
      f.rotation.z = ang;
      f.rotation.x = 0.22 + (i % 2) * 0.08;
      f.scale.set(0.95, 1, 0.92 + (i % 2) * 0.16);
      lure.add(f);
    }
    // Twinkling central hanging star charm at very bottom of the tassel
    const tipStar = mkMesh(mkStar(0.036, 0.044, 0.34, 0.010), gGold, 0, 0, -0.41);
    lure.add(tipStar);
    grp.add(lure);
    grp.visible = false;

    const item = tools.items.net;
    item.claudeHoop = item.hoop.clone();
    item.geminiHoop = new T.Vector3(0, 0.92, 0.215);
    item.claudeBag = item.bag;
    item.geminiBag = lure;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.net;
    item.root.add(grp);
  }

  // =========================================================================
  // 2. SLOT "cane": 「星霜大鱼干」 (Giant Shimmering Starlight Dried-Fish!)
  // =========================================================================
  {
    const grp = new T.Group();
    const scaleTex = makeFishScaleTex(T);
    const fishMat = wrap(new T.MeshStandardMaterial({
      map: scaleTex,
      roughness: 0.26,
      metalness: 0.34,
      emissive: new T.Color(0.14, 0.24, 0.46),
      emissiveIntensity: 0.20
    }));
    const finMat = wrap(new T.MeshStandardMaterial({
      color: new T.Color(0.68, 0.92, 1.0),
      emissive: new T.Color(0.24, 0.72, 1.0),
      emissiveIntensity: 0.45,
      roughness: 0.16,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88,
      side: T.DoubleSide
    }));

    // Sculpted plump fish body via LatheGeometry (y = 0.04 to y = 0.72), slightly flattened along X!
    const profile = [
      [0.018, 0.00],
      [0.022, 0.06],
      [0.046, 0.14],
      [0.088, 0.26],
      [0.108, 0.39],
      [0.104, 0.52],
      [0.078, 0.63],
      [0.036, 0.70],
      [0.002, 0.73]
    ].map(([r, y]) => new T.Vector2(r, y));
    const bodyGeo = new T.LatheGeometry(profile, 22);
    const body = mkMesh(bodyGeo, fishMat, 0, 0.02, 0);
    body.scale.set(0.64, 1.0, 1.18); // plump wide silhouette along Z!
    grp.add(body);

    // Fanned forked caudal tail fin at bottom grip (y = -0.15 to +0.02)
    const tailShape = new T.Shape();
    tailShape.moveTo(0, 0.02);
    tailShape.quadraticCurveTo(0.055, -0.05, 0.105, -0.145);
    tailShape.quadraticCurveTo(0.035, -0.11, 0, -0.082);
    tailShape.quadraticCurveTo(-0.035, -0.11, -0.105, -0.145);
    tailShape.quadraticCurveTo(-0.055, -0.05, 0, 0.02);
    tailShape.closePath();
    const tailGeo = new T.ExtrudeGeometry(tailShape, {
      depth: 0.014, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 8
    });
    tailGeo.translate(0, 0, -0.007);
    tailGeo.rotateY(Math.PI / 2); // fans along ±Z!
    grp.add(mkMesh(tailGeo, finMat, 0, 0.01, 0));

    // Cute sakura-gold satin ribbon bow & bell tied around the tail handle (grip area y = -0.02..+0.07)
    const ribL = mkMesh(new T.SphereGeometry(0.030, 10, 8), gSakura, 0, 0.055, 0.042);
    const ribR = mkMesh(new T.SphereGeometry(0.030, 10, 8), gSakura, 0, 0.055, -0.042);
    ribL.scale.set(0.45, 0.72, 1.35);
    ribR.scale.set(0.45, 0.72, 1.35);
    const tailBell = mkBell(0.95);
    tailBell.position.set(0.032, 0.038, 0);
    grp.add(
      mkMesh(new T.CylinderGeometry(0.026, 0.024, 0.095, 12), gSakura, 0, 0.025, 0),
      mkMesh(new T.TorusGeometry(0.028, 0.0048, 6, 18).rotateX(Math.PI / 2), gGold, 0, 0.068, 0),
      mkMesh(new T.TorusGeometry(0.026, 0.0045, 6, 18).rotateX(Math.PI / 2), gGold, 0, -0.018, 0),
      ribL, ribR, tailBell
    );

    // Gleaming crystal dorsal fin (+Z side) & ventral fin (-Z side)
    const dorsalShape = new T.Shape();
    dorsalShape.moveTo(0, 0.20);
    dorsalShape.quadraticCurveTo(0.09, 0.30, 0.08, 0.44);
    dorsalShape.quadraticCurveTo(0.05, 0.54, 0, 0.57);
    dorsalShape.closePath();
    const dorsalGeo = new T.ExtrudeGeometry(dorsalShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 1 });
    dorsalGeo.translate(0, 0, -0.004);
    dorsalGeo.rotateY(-Math.PI / 2); // extends along +Z!
    grp.add(mkMesh(dorsalGeo, finMat, 0, 0.02, 0.095));

    const ventralShape = new T.Shape();
    ventralShape.moveTo(0, 0.16);
    ventralShape.quadraticCurveTo(0.06, 0.24, 0.045, 0.34);
    ventralShape.lineTo(0, 0.36);
    ventralShape.closePath();
    const ventralGeo = new T.ExtrudeGeometry(ventralShape, { depth: 0.007, bevelEnabled: false });
    ventralGeo.translate(0, 0, -0.0035);
    ventralGeo.rotateY(Math.PI / 2); // extends along -Z!
    grp.add(mkMesh(ventralGeo, gTranslucentPink, 0, 0.02, -0.088));

    // Pectoral side fins, adorable rosy gill curves & bright big cartoon fish eyes on ±X!
    const pecGeo = new T.SphereGeometry(0.044, 10, 8);
    const eyeWhiteMat = std(0.99, 0.99, 1.0, 0.14);
    const eyePupilMat = std(0.06, 0.07, 0.15, 0.10);
    for (const side of [-1, 1]) {
      const pec = mkMesh(pecGeo, finMat, side * 0.068, 0.42, -0.01);
      pec.scale.set(0.30, 1.15, 0.65);
      pec.rotation.z = side * -0.45;
      // Cute bulging anime fish eye + sparkling cyan glint
      const ew = mkMesh(new T.SphereGeometry(0.022, 12, 10), eyeWhiteMat, side * 0.048, 0.60, 0.028);
      ew.scale.set(0.55, 1.0, 1.0);
      const ep = mkMesh(new T.SphereGeometry(0.013, 10, 8), eyePupilMat, side * 0.056, 0.602, 0.032);
      ep.scale.set(0.45, 1.0, 1.0);
      const eg = mkMesh(new T.SphereGeometry(0.005, 8, 6), gCyan, side * 0.060, 0.610, 0.037);
      // Rosy cute fish cheek blush
      const blush = mkMesh(new T.SphereGeometry(0.016, 10, 8), gSakura, side * 0.053, 0.56, -0.006);
      blush.scale.set(0.35, 0.65, 1.1);
      // Golden gill curve accent
      const gill = mkMesh(new T.TorusGeometry(0.042, 0.004, 6, 14, Math.PI * 0.72), gGold, side * 0.060, 0.51, 0.005);
      gill.rotation.y = side * (Math.PI / 2);
      gill.rotation.z = -0.35;
      grp.add(pec, ew, ep, eg, blush, gill);
    }

    // Little golden lip ring at snout & orbiting frost-star halo charm
    const lips = mkMesh(new T.TorusGeometry(0.017, 0.006, 8, 16).rotateX(Math.PI / 2), gSakura, 0, 0.742, 0.004);
    const fishCharm = new T.Group();
    fishCharm.position.set(0, 0.76, 0);
    const s1 = mkMesh(mkStar(0.024, 0.030, 0.34, 0.009), gCyan, 0.055, 0.02, 0);
    const s2 = mkMesh(mkStar(0.020, 0.026, 0.34, 0.009), gPink, -0.055, -0.02, 0);
    fishCharm.add(s1, s2);
    grp.add(lips, fishCharm);
    grp.visible = false;

    const item = tools.items.cane;
    item.charm = fishCharm;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.cane;
    item.root.add(grp);
  }

  // =========================================================================
  // 3. SLOT "blaster": 「星弦猫耳光弓」 (Celestial Crescent Cat-Ear Harp-Bow!)
  // =========================================================================
  {
    const grp = new T.Group();
    // Vertical star-indigo ergonomic bow riser grip (y = -0.10..+0.09, z = 0)
    grp.add(
      mkMesh(new T.CylinderGeometry(0.020, 0.023, 0.19, 12), gIndigo, 0, -0.01, -0.01),
      mkMesh(new T.CylinderGeometry(0.024, 0.024, 0.09, 12), gPeri, 0, -0.02, -0.01),
      mkMesh(gripRingGeo, gGold, 0, -0.075, -0.01),
      mkMesh(gripRingGeo, gGold, 0, 0.035, -0.01),
      mkMesh(new T.TorusGeometry(0.024, 0.0045, 6, 18), gGold, 0, -0.125, -0.01),
      mkMesh(mkStar(0.019, 0.025, 0.32, 0.010), gPink, 0, -0.125, -0.01)
    );

    // Central sculpted crescent bridge & glowing cat-ear crystal iron sight (perfect in FP ADS!)
    const bridge = mkMesh(new T.SphereGeometry(0.048, 14, 10), gGold, 0, 0.105, 0.055);
    bridge.scale.set(1.35, 0.68, 1.30);
    const sightRing = mkMesh(new T.TorusGeometry(0.044, 0.0055, 8, 24), gGold, 0, 0.145, 0.075);
    const sightGem = mkMesh(mkStar(0.015, 0.019, 0.36, 0.006), gCyan, 0, 0.145, 0.075);
    const sEarL = mkEar(0.76, gGold), sEarR = mkEar(0.76, gGold);
    sEarL.position.set(-0.038, 0.175, 0.075);
    sEarL.rotation.z = 0.44;
    sEarR.position.set(0.038, 0.175, 0.075);
    sEarR.rotation.z = -0.44;
    grp.add(bridge, sightRing, sightGem, sEarL, sEarR);

    // Twin graceful sweeping celestial crescent bow limbs extending left (-X) & right (+X)!
    for (const side of [-1, 1]) {
      const limbCurve = new T.CatmullRomCurve3([
        new T.Vector3(side * 0.04, 0.105, 0.07),
        new T.Vector3(side * 0.15, 0.115, 0.17),
        new T.Vector3(side * 0.28, 0.125, 0.11),
        new T.Vector3(side * 0.36, 0.132, -0.05)
      ]);
      const innerArcCurve = new T.CatmullRomCurve3([
        new T.Vector3(side * 0.06, 0.095, 0.09),
        new T.Vector3(side * 0.16, 0.102, 0.15),
        new T.Vector3(side * 0.27, 0.112, 0.08),
        new T.Vector3(side * 0.34, 0.120, -0.04)
      ]);
      grp.add(
        mkMesh(new T.TubeGeometry(limbCurve, 22, 0.016, 10, false), gPearl),
        mkMesh(new T.TubeGeometry(innerArcCurve, 18, 0.007, 8, false), side < 0 ? gCyan : gPink),
        // Gilded limb collars & star-wing tips
        mkMesh(new T.SphereGeometry(0.025, 10, 8), gGold, side * 0.17, 0.116, 0.165),
        mkMesh(new T.SphereGeometry(0.022, 10, 8), gGold, side * 0.36, 0.132, -0.055),
        mkMesh(mkStar(0.032, 0.042, 0.34, 0.012), side < 0 ? gCyan : gPink, side * 0.375, 0.135, -0.07)
      );
      // Translucent crystal feather fin on outer bow shoulder
      const wingFin = mkMesh(new T.ConeGeometry(0.026, 0.13, 6), side < 0 ? gTranslucentCyan : gTranslucentPink, side * 0.25, 0.125, 0.145);
      wingFin.rotation.z = side * -1.2;
      wingFin.rotation.x = -0.35;
      grp.add(wingFin);
    }

    // Glowing harp bowstrings stretched taut across the bow limbs (vibrate/pull on shot!)
    const stringG = new T.Group();
    const sMat1 = gCyan, sMat2 = gPink;
    const makeChord = (x0, y0, z0, x1, y1, z1, mat, r = 0.0036) => {
      const a = new T.Vector3(x0, y0, z0);
      const b = new T.Vector3(x1, y1, z1);
      const len = a.distanceTo(b);
      const m = mkMesh(new T.CylinderGeometry(r, r, len, 6), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return m;
    };
    // Main V-bowstring meeting at glowing nock point + 4 decorative celestial harp strings
    stringG.add(
      makeChord(-0.355, 0.132, -0.05, 0, 0.115, -0.085, sMat1, 0.0042),
      makeChord(0.355, 0.132, -0.05, 0, 0.115, -0.085, sMat2, 0.0042),
      makeChord(-0.27, 0.124, 0.10, 0.27, 0.124, 0.10, sMat1, 0.0024),
      makeChord(-0.21, 0.118, 0.14, 0.21, 0.118, 0.14, sMat2, 0.0024),
      mkMesh(mkStar(0.018, 0.022, 0.35, 0.008), gGold, 0, 0.115, -0.085)
    );
    grp.add(stringG);

    // Floating holographic starlight focus ring ahead of the bow (z = +0.26, spins dynamically!)
    const muzzleRing = new T.Group();
    muzzleRing.position.set(0, 0.11, 0.245);
    const mStar = mkMesh(mkStar(0.058, 0.058, 0.44, 0.006), gTranslucentCyan);
    const mRim = mkMesh(new T.TorusGeometry(0.052, 0.0042, 6, 24), gPink);
    muzzleRing.add(mStar, mRim);
    grp.add(muzzleRing);

    // 5 levitating glowing star-crystal arrow gems arranged in an arc above the bow (live ammo indicator!)
    const gBalls = [];
    const gemGeo = new T.OctahedronGeometry(0.022, 0);
    for (let k = 0; k < 5; k++) {
      const u = (k - 2) / 2; // -1 .. +1
      const orb = mkMesh(gemGeo, k % 2 ? gPink : gCyan, u * 0.16, 0.215 - u * u * 0.032, 0.12 - Math.abs(u) * 0.04);
      orb.scale.set(0.75, 0.75, 1.55); // sleek crystalline star-arrow bolt shape!
      grp.add(orb);
      gBalls.push(orb);
    }

    grp.visible = false;

    const item = tools.items.blaster;
    item.geminiGroup = grp;
    item.geminiBalls = gBalls;
    item.starMuzzle = muzzleRing;
    item.bowString = stringG;
    item.geminiDef = GEMINI_WEAPON_DEFS.blaster;
    item.root.add(grp);
  }

  // =========================================================================
  // 4. SLOT "hammer": 「巨型星光大猫爪」 (Giant Fluffy Plush Cat-Paw Gauntlet!)
  // =========================================================================
  {
    const grp = new T.Group();

    // Fluffy plush wrist cuff sitting right over Gemini's wrist/forearm (y = -0.08..+0.12)
    const cuffRim = mkMesh(new T.TorusGeometry(0.072, 0.032, 10, 22).rotateX(Math.PI / 2), gFur, 0, 0.01, 0);
    const cuffSleeve = mkMesh(new T.CylinderGeometry(0.082, 0.068, 0.14, 16), gFur, 0, 0.08, 0);
    const collarBand = mkMesh(new T.TorusGeometry(0.076, 0.011, 8, 22).rotateX(Math.PI / 2), gPeri, 0, 0.035, 0);
    const goldBand = mkMesh(new T.TorusGeometry(0.078, 0.0055, 6, 22).rotateX(Math.PI / 2), gGold, 0, 0.052, 0);
    // Dangling giant golden cat-bell & sakura bow on the cuff!
    const cuffBell = mkBell(1.45);
    cuffBell.position.set(0, 0.015, 0.095);
    const cBowL = mkMesh(new T.SphereGeometry(0.032, 10, 8), gSakura, -0.036, 0.045, 0.082);
    const cBowR = mkMesh(new T.SphereGeometry(0.032, 10, 8), gSakura, 0.036, 0.045, 0.082);
    cBowL.scale.set(1.25, 0.65, 0.45);
    cBowL.rotation.z = 0.25;
    cBowR.scale.set(1.25, 0.65, 0.45);
    cBowR.rotation.z = -0.25;
    grp.add(cuffRim, cuffSleeve, collarBand, goldBand, cuffBell, cBowL, cBowR);

    // Massive oversized ultra-fluffy plush Cat-Paw Mitt (y = +0.16..+0.54)!
    const palm = mkMesh(new T.SphereGeometry(0.165, 22, 16), gFur, 0, 0.30, 0);
    palm.scale.set(1.12, 1.06, 0.68);
    grp.add(palm);

    // 4 chubby rounded plush cat-toe knuckles fanning across the top of the paw!
    const toes = [
      [-0.145, 0.43, 0.01, 0.056, 0.38],
      [-0.052, 0.485, 0.015, 0.062, 0.12],
      [0.052, 0.485, 0.015, 0.062, -0.12],
      [0.145, 0.43, 0.01, 0.056, -0.38]
    ];
    for (let i = 0; i < toes.length; i++) {
      const [tx, ty, tz, tr, rz] = toes[i];
      const toe = mkMesh(new T.SphereGeometry(tr, 16, 12), gFur, tx, ty, tz);
      toe.scale.set(0.95, 1.18, 0.88);
      toe.rotation.z = rz;
      // Glowing sakura/cyan plump toe bean on the palm (+Z side)!
      const bean = mkMesh(new T.SphereGeometry(tr * 0.64, 12, 10), i % 2 === 0 ? gPink : gSakura, tx * 0.96, ty - 0.005, tz + tr * 0.62);
      bean.scale.set(0.86, 1.12, 0.42);
      bean.rotation.z = rz;
      // Sleek semi-translucent glowing cyan crystal cat-claw peeking from each fingertip!
      const claw = mkMesh(new T.ConeGeometry(0.014, 0.055, 8), i % 2 === 0 ? gCyan : gPink, tx * 1.04, ty + tr * 1.15, tz + 0.015);
      claw.rotation.z = rz * 0.9;
      claw.rotation.x = 0.28;
      grp.add(toe, bean, claw);
    }

    // Plump heart-shaped glowing sakura main paw pad on the palm (+Z side)!
    const padCenter = mkMesh(new T.SphereGeometry(0.072, 16, 12), gSakura, 0, 0.275, 0.105);
    padCenter.scale.set(1.22, 0.88, 0.36);
    const padLobeL = mkMesh(new T.SphereGeometry(0.040, 12, 10), gSakura, -0.036, 0.31, 0.105);
    const padLobeR = mkMesh(new T.SphereGeometry(0.040, 12, 10), gSakura, 0.036, 0.31, 0.105);
    padLobeL.scale.set(1.0, 0.95, 0.38);
    padLobeR.scale.set(1.0, 0.95, 0.38);
    const padStar = mkMesh(mkStar(0.028, 0.034, 0.34, 0.008), gCyan, 0, 0.285, 0.128);
    grp.add(padCenter, padLobeL, padLobeR, padStar);

    // Back of the plush paw (-Z side): starry twilight constellation medallion + golden star emblem!
    const backMedallion = mkMesh(new T.CylinderGeometry(0.082, 0.082, 0.016, 22).rotateX(Math.PI / 2), gIndigo, 0, 0.30, -0.106);
    const backRim = mkMesh(new T.TorusGeometry(0.084, 0.007, 8, 24), gGold, 0, 0.30, -0.110);
    const backStar = mkMesh(mkStar(0.056, 0.068, 0.32, 0.012), gCyan, 0, 0.30, -0.116);
    const backSubStar = mkMesh(mkStar(0.030, 0.036, 0.34, 0.012), gPink, 0, 0.30, -0.122);
    grp.add(backMedallion, backRim, backStar, backSubStar);
    grp.visible = false;

    const item = tools.items.hammer;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.hammer;
    item.root.add(grp);
  }

  // =========================================================================
  // 5. SLOT "sword": 「双子星月猫镰」 (Twin-Star Crescent Kitty-Scythe!)
  // =========================================================================
  {
    const grp = new T.Group();
    const rotY90 = new T.Matrix4().makeRotationY(Math.PI / 2);

    // Star-indigo & gold sleek scythe staff (y = -0.16..+0.64)
    const staffRing = new T.TorusGeometry(0.019, 0.0042, 6, 18).rotateX(Math.PI / 2);
    grp.add(
      mkMesh(new T.CylinderGeometry(0.014, 0.0165, 0.80, 12), gIndigo, 0, 0.24, 0),
      mkMesh(new T.CylinderGeometry(0.019, 0.020, 0.16, 12), gPeri, 0, -0.04, 0),
      mkMesh(staffRing, gGold, 0, -0.105, 0),
      mkMesh(staffRing, gGold, 0, -0.04, 0),
      mkMesh(staffRing, gGold, 0, 0.025, 0),
      mkMesh(staffRing, gGold, 0, 0.32, 0),
      mkMesh(staffRing, gGold, 0, 0.56, 0),
      // Pommel twin-star ring
      mkMesh(new T.TorusGeometry(0.027, 0.0045, 6, 20).rotateY(Math.PI / 2), gGold, 0, -0.175, 0),
      mkMesh(mkStar(0.022, 0.028, 0.32, 0.010).rotateY(Math.PI / 2), gCyan, 0, -0.175, 0)
    );

    // Crown clasp at top of staff (y = 0.62) with golden cat ears + dangling cat bell & twin ribbons!
    const crownHub = mkMesh(new T.SphereGeometry(0.036, 14, 10), gGold, 0, 0.62, 0);
    const coreStarL = mkMesh(mkStar(0.038, 0.048, 0.32, 0.014), gCyan, 0.028, 0.62, 0.01);
    const coreStarR = mkMesh(mkStar(0.038, 0.048, 0.32, 0.014), gPink, -0.028, 0.62, 0.01);
    coreStarL.rotation.y = Math.PI / 2;
    coreStarR.rotation.y = -Math.PI / 2;
    const scEarL = mkEar(0.95, gGold), scEarR = mkEar(0.95, gGold);
    scEarL.position.set(-0.026, 0.665, -0.025);
    scEarL.rotation.set(0, Math.PI / 2, 0.35);
    scEarR.position.set(0.026, 0.665, -0.025);
    scEarR.rotation.set(0, Math.PI / 2, -0.35);

    const scBell = mkBell(1.05);
    scBell.position.set(0, 0.545, -0.042);
    const ribA = mkMesh(new T.BoxGeometry(0.006, 0.13, 0.024), gTranslucentCyan, 0.014, 0.48, -0.058);
    const ribB = mkMesh(new T.BoxGeometry(0.006, 0.15, 0.024), gTranslucentPink, -0.014, 0.47, -0.064);
    ribA.rotation.x = 0.25;
    ribB.rotation.x = 0.32;
    grp.add(crownHub, coreStarL, coreStarR, scEarL, scEarR, scBell, ribA, ribB);

    // Sweeping Luminous Crescent Moon Scythe Blade extending forward along +Z (cutting edge!)
    // Drawn in 2D (x -> +Z after rotateY(-PI/2), y -> Y)
    const bladeShape = new T.Shape();
    bladeShape.moveTo(-0.12, 0.66);
    bladeShape.quadraticCurveTo(0.04, 0.83, 0.24, 0.72);
    bladeShape.quadraticCurveTo(0.36, 0.62, 0.38, 0.42); // razor crescent tip at z = +0.38, y = 0.42!
    bladeShape.quadraticCurveTo(0.30, 0.56, 0.18, 0.63);
    bladeShape.quadraticCurveTo(0.05, 0.69, -0.08, 0.61);
    bladeShape.closePath();
    const bladeGeo = new T.ExtrudeGeometry(bladeShape, {
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: 0.0065,
      bevelSize: 0.009,
      bevelSegments: 2,
      curveSegments: 14
    });
    bladeGeo.translate(0, 0, -0.003);
    bladeGeo.applyMatrix4(new T.Matrix4().makeRotationY(-Math.PI / 2)); // +X becomes +Z!
    bladeGeo.computeVertexNormals();

    // Glowing inner crescent energy edge (reacts to sword charge glow via geminiCore!)
    const edgeShape = new T.Shape();
    edgeShape.moveTo(-0.07, 0.62);
    edgeShape.quadraticCurveTo(0.06, 0.72, 0.20, 0.64);
    edgeShape.quadraticCurveTo(0.31, 0.56, 0.37, 0.43);
    edgeShape.quadraticCurveTo(0.28, 0.58, 0.16, 0.67);
    edgeShape.quadraticCurveTo(0.04, 0.75, -0.07, 0.62);
    const edgeGeo = new T.ExtrudeGeometry(edgeShape, {
      depth: 0.011,
      bevelEnabled: false,
      curveSegments: 12
    });
    edgeGeo.translate(0, 0, -0.0055);
    edgeGeo.applyMatrix4(new T.Matrix4().makeRotationY(-Math.PI / 2));

    // Golden decorative filigree spine along the upper crescent back
    const spineCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, 0.65, -0.10),
      new T.Vector3(0, 0.75, 0.06),
      new T.Vector3(0, 0.73, 0.21),
      new T.Vector3(0, 0.60, 0.32)
    ]);

    // Orbiting twin-star crystal shards hovering gracefully inside the crescent arc!
    const shards = new T.Group();
    shards.position.set(0, 0.56, 0.16);
    const sh1 = mkMesh(mkStar(0.022, 0.032, 0.34, 0.010), gCyan, 0.04, 0.03, 0.04);
    const sh2 = mkMesh(mkStar(0.020, 0.028, 0.34, 0.010), gPink, -0.04, -0.025, -0.035);
    sh1.rotation.y = 0.5;
    sh2.rotation.y = -0.5;
    shards.add(sh1, sh2);

    grp.add(
      mkMesh(bladeGeo, gPearl),
      mkMesh(edgeGeo, gCrystalCore),
      mkMesh(new T.TubeGeometry(spineCurve, 20, 0.011, 8, false), gGold),
      shards
    );
    grp.visible = false;

    const item = tools.items.sword;
    // Replace previous Gemini sword model cleanly if one was already mounted
    if (item.geminiGroup && item.geminiGroup.parent) {
      item.geminiGroup.parent.remove(item.geminiGroup);
    }
    item.geminiGroup = grp;
    item.geminiCore = gCrystalCore;
    item.shards = shards;
    item.geminiDef = GEMINI_WEAPON_DEFS.sword;
    item.root.add(grp);
  }

  // Also replace previous Gemini meshes for net/cane/blaster/hammer cleanly if needed
  for (const id of ["net", "cane", "blaster", "hammer"]) {
    const it = tools.items[id];
    if (!it) continue;
    // Remove any older hidden gemini meshes except claudeGroup and our newly built geminiGroup
    const keep = new Set([it.claudeGroup, it.geminiGroup]);
    for (const ch of it.root.children.slice()) {
      if (!keep.has(ch)) it.root.remove(ch);
    }
  }

  // Reset cached gemini thumbnails so shotPics() captures the brand-new original weapons!
  for (const id in tools.items) {
    tools.items[id].geminiPic = null;
  }

  // Helper called every frame by Ed.update() for lively Gemini weapon animations
  tools._updateCatWeapons = function (time) {
    if (!this.isGemini) return;
    if (this.held === "cane" && this.items.cane.charm) {
      this.items.cane.charm.rotation.y = time * 2.5;
    }
    if (this.held === "blaster") {
      const bl = this.items.blaster;
      if (bl.starMuzzle) {
        bl.starMuzzle.rotation.z = time * 2.6;
        const sc = 1 + this.kick * 0.28;
        bl.starMuzzle.scale.setScalar(sc);
      }
      if (bl.bowString) {
        // Subtle glowing bowstring twang vibration after firing!
        bl.bowString.position.z = -this.kick * 0.032 * Math.cos(time * 65);
      }
      if (bl.geminiBalls) {
        for (let k = 0; k < bl.geminiBalls.length; k++) {
          const b = bl.geminiBalls[k];
          b.rotation.z = time * 2.4 + k * 0.9;
        }
      }
    }
  };
}
