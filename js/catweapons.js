// Gemini 全新专属五件套武器 + 独立魔法效果引擎 (彻底告别照搬 Claude！)
// Slot 1 (net)     -> 星月逗猫棒 (升级版流光羽毛猫铃逗猫棒 + 3D 星光捕猫环 + 6.5m 野生 Clawd 诱捕吸引魔法)
// Slot 2 (cane)    -> 星喵香蕉魔法杖 (猫耳黄金香蕉水晶法杖 + 发射飞旋黄金魔导香蕉波与滑稽香蕉星雨爆裂！)
// Slot 3 (blaster) -> 星弦猫耳光弓 (真实拉弓弓弦形变 + 搭箭实体星矢 + 蓄力星晶刻度，配合 shoot.js 真实抛物线弓箭系统)
// Slot 4 (hammer)  -> 猫爪星光锤 (经典回归精修发光猫肉球星光锤 + 双层3D星环冲击波 + 超大范围弹跳震波)
// Slot 5 (sword)   -> 双子星芒刃 (经典星芒圣剑精修回归 + 三连双子交叉剑气 + 蓄力星璇光环 + 跳劈星陨光柱)

export const GEMINI_WEAPON_DEFS = {
  net: {
    id: "net",
    name: "星月逗猫棒",
    verb: "逗一逗",
    tip: "流光羽翼与双金铃逗猫棒！一甩展开星光捕猫环，还能把附近的野生 Clawd 逗得蹦蹦跳跳凑过来"
  },
  cane: {
    id: "cane",
    name: "星喵香蕉魔法杖",
    verb: "香蕉魔法",
    tip: "猫耳黄金香蕉法杖！一挥放出飞旋的黄金魔导香蕉魔法，远近目标都能打中并炸出香蕉星雨",
    how: "按 J、鼠标右键或单击画面施放飞旋香蕉魔法！"
  },
  blaster: {
    id: "blaster",
    name: "星弦猫耳光弓",
    verb: "拉弓",
    tip: "真正的拉弓蓄力星光弓！轻点速射弧线星矢，按住蓄力至满弦射出高速贯星穿云箭，还能把箭插在雪地树干上",
    how: "按住 J 或左键拉弓蓄力、松手放箭（轻点可速射）；按住鼠标右键或 F 举弓瞄准"
  },
  hammer: {
    id: "hammer",
    name: "猫爪星光锤",
    verb: "星震",
    tip: "超萌发光猫肉球星光锤！一锤砸出青粉双层星环大震波，把周围雪人、朋友和树雪统统震跳起来"
  },
  sword: {
    id: "sword",
    name: "双子星芒刃",
    verb: "星斩",
    tip: "双子星晶护手与猫耳金铃剑柄。三连斩第三剑劈出双子交叉星芒波；蓄力放星璇环，跳斩召星陨光柱",
    how: "连按 J（或单击、鼠标右键）三连星斩；斩完按住 J 蓄力松开释放星璇斩；跳起按 J 释放星陨下劈"
  }
};

export const GEMINI_CARRY_POSES = {
  net: [0.24, 0.22, 0.96, -0.14, 0, 0, 0.44],
  cane: [0.20, 0.20, 0.88, 0.06, 0, 0, 0.44],
  blaster: [0.20, 0.44, 0.85, 0, 0, 0, 0.45],
  hammer: [0.26, 0.20, 1.00, -0.22, 0, 0, 0.46]
};

export const GEMINI_PIC_CAM = {
  net: [[0.94, 0.46, 1.85], [0, 0.44, 0.06]],
  cane: [[1.02, 0.38, 1.24], [0, 0.34, 0.02]],
  blaster: [[0.84, 0.36, 0.90], [0, 0.10, 0.06]],
  hammer: [[1.00, 0.44, 1.32], [0, 0.28, 0.0]],
  sword: [[1.02, 0.42, 1.32], [0.06, 0.28, 0.02]]
};

function makeBananaTex(T) {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0.0, "#7c5a18");
  g.addColorStop(0.12, "#ffe855");
  g.addColorStop(0.55, "#ffd428");
  g.addColorStop(0.88, "#fff278");
  g.addColorStop(1.0, "#8c651c");
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  c.fillStyle = "rgba(255,255,255,0.45)";
  c.fillRect(10, 8, 8, 48);
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

export function buildGeminiWeapons(tools, helpers) {
  const game = tools.game;
  const T = game.THREE;
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
  const gGold = wrap(new T.MeshStandardMaterial({ color: new T.Color(0.99, 0.84, 0.46), roughness: 0.18, metalness: 0.92 }));
  const gPearl = std(0.89, 0.94, 1.0, 0.16, { metalness: 0.44, emissive: new T.Color(0.38, 0.66, 1.0), emissiveIntensity: 0.18 });
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
  const gBanana = wrap(new T.MeshStandardMaterial({
    map: makeBananaTex(T),
    color: new T.Color(1.0, 0.92, 0.42),
    emissive: new T.Color(0.88, 0.66, 0.08),
    emissiveIntensity: 0.42,
    roughness: 0.24,
    metalness: 0.18
  }));
  const gBananaGlow = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.92, 0.38),
    emissive: new T.Color(1.0, 0.78, 0.12),
    emissiveIntensity: 1.45,
    roughness: 0.14
  }));
  const gCrystalCore = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.88, 0.97, 1.0),
    emissive: new T.Color(0.32, 0.88, 1.0),
    emissiveIntensity: 0.30,
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

  // Sculpted plump curved 3D Golden Banana geometry!
  function mkBananaGeo(scale = 1) {
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(-0.085 * scale, -0.025 * scale, 0),
      new T.Vector3(-0.040 * scale, 0.065 * scale, 0),
      new T.Vector3(0.045 * scale, 0.095 * scale, 0),
      new T.Vector3(0.115 * scale, 0.045 * scale, 0),
      new T.Vector3(0.140 * scale, -0.015 * scale, 0)
    ]);
    const geo = new T.TubeGeometry(curve, 18, 0.032 * scale, 10, false);
    // Taper both tips realistically into banana points!
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i); // 0..1 along length
      const pt = curve.getPointAt(Math.max(0, Math.min(1, u)));
      const taper = Math.pow(Math.sin(Math.max(0.04, Math.min(0.96, u)) * Math.PI), 0.58);
      const rx = pos.getX(i) - pt.x;
      const ry = pos.getY(i) - pt.y;
      const rz = pos.getZ(i) - pt.z;
      pos.setXYZ(i, pt.x + rx * taper, pt.y + ry * taper, pt.z + rz * taper);
    }
    geo.computeVertexNormals();
    return geo;
  }

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
  // 1. SLOT "net": 「星月逗猫棒」 (Upgraded Luxurious Starlight Cat-Teaser Wand!)
  // =========================================================================
  {
    const grp = new T.Group();
    // Graceful arched translucent crystal-gold cat-teaser wand curving gently forward
    const rodCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, -0.10, 0),
      new T.Vector3(0, 0.16, 0),
      new T.Vector3(0, 0.50, 0.028),
      new T.Vector3(0, 0.78, 0.11),
      new T.Vector3(0, 0.95, 0.25)
    ]);
    grp.add(
      mkMesh(new T.TubeGeometry(rodCurve, 28, 0.0095, 10, false), gPearl),
      // Gold spiral wrap grip + pommel crescent star
      mkMesh(new T.CylinderGeometry(0.019, 0.021, 0.18, 12), gPeri, 0, -0.02, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.095, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.02, 0),
      mkMesh(gripRingGeo, gGold, 0, 0.055, 0),
      mkMesh(new T.TorusGeometry(0.026, 0.0045, 6, 20), gGold, 0, -0.135, 0),
      mkMesh(mkStar(0.022, 0.028, 0.32, 0.011), gCyan, 0, -0.135, 0)
    );

    // Golden crescent-moon & cat-ear topper at the tip of the teaser rod!
    const tipX = 0, tipY = 0.95, tipZ = 0.255;
    const tipMoon = mkMesh(new T.TorusGeometry(0.044, 0.008, 8, 22, Math.PI * 1.38), gGold, tipX, tipY + 0.015, tipZ);
    tipMoon.rotation.z = Math.PI * 0.78;
    const teL = mkEar(0.62, gGold), teR = mkEar(0.62, gGold);
    teL.position.set(-0.028, tipY + 0.045, tipZ); teL.rotation.z = 0.42;
    teR.position.set(0.028, tipY + 0.045, tipZ); teR.rotation.z = -0.42;
    const midBowL = mkMesh(new T.SphereGeometry(0.026, 10, 8), gSakura, -0.028, 0.56, 0.055);
    const midBowR = mkMesh(new T.SphereGeometry(0.026, 10, 8), gSakura, 0.028, 0.56, 0.055);
    midBowL.scale.set(1.25, 0.62, 0.42); midBowL.rotation.z = 0.25;
    midBowR.scale.set(1.25, 0.62, 0.42); midBowR.rotation.z = -0.25;
    grp.add(
      tipMoon, teL, teR,
      mkMesh(mkStar(0.024, 0.030, 0.32, 0.010), gPink, tipX, tipY + 0.012, tipZ + 0.008),
      midBowL, midBowR,
      mkMesh(new T.TorusGeometry(0.020, 0.005, 6, 18).rotateX(Math.PI / 2), gGold, 0, 0.56, 0.038)
    );

    // Upgraded Swinging Feather-Bell Lure (local -Z hangs downward via Ed.hang physics!)
    const lure = new T.Group();
    lure.matrixAutoUpdate = false;
    const cord = mkMesh(new T.CylinderGeometry(0.0036, 0.0036, 0.19, 6).rotateX(Math.PI / 2), gGold, 0, 0, -0.095);
    // Twin golden jingle bells + fluffy glowing pom core!
    const bell1 = mkBell(1.25); bell1.position.set(-0.020, 0, -0.185);
    const bell2 = mkBell(1.05); bell2.position.set(0.022, 0.008, -0.205);
    const pom = mkMesh(new T.SphereGeometry(0.046, 14, 10), gFur, 0, 0, -0.235);
    // Double holographic orbiting starlight rings around the feather plume
    const hRing1 = mkMesh(new T.TorusGeometry(0.118, 0.0065, 8, 32), gCyan, 0, 0, -0.295);
    const hRing2 = mkMesh(new T.TorusGeometry(0.094, 0.005, 6, 28), gPink, 0, 0, -0.295);
    hRing2.rotation.x = 0.28;
    hRing2.rotation.y = 0.22;

    // 8 lush iridescent peacock-aurora feathers + 2 long flowing silk ribbon streamers!
    const fShape = new T.Shape();
    fShape.moveTo(0, 0);
    fShape.quadraticCurveTo(-0.032, 0.09, -0.022, 0.20);
    fShape.quadraticCurveTo(0, 0.27, 0.022, 0.20);
    fShape.quadraticCurveTo(0.032, 0.09, 0, 0);
    const featherGeo = new T.ExtrudeGeometry(fShape, { depth: 0.003, bevelEnabled: false, curveSegments: 8 });
    featherGeo.rotateX(-Math.PI / 2); // extends along -Z!
    lure.add(cord, bell1, bell2, pom, hRing1, hRing2);

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const fMat = i % 3 === 0 ? gTranslucentCyan : i % 3 === 1 ? gTranslucentPink : gPearl;
      const f = mkMesh(featherGeo, fMat, Math.cos(ang) * 0.020, Math.sin(ang) * 0.020, -0.225);
      f.rotation.z = ang;
      f.rotation.x = 0.24 + (i % 2) * 0.10;
      f.scale.set(0.95, 1, 0.90 + (i % 2) * 0.22);
      lure.add(f);
    }
    // Dual flowing translucent star-ribbons streaming below the feathers
    const ribA = mkMesh(new T.BoxGeometry(0.016, 0.003, 0.34), gTranslucentCyan, -0.024, 0.012, -0.40);
    const ribB = mkMesh(new T.BoxGeometry(0.016, 0.003, 0.38), gTranslucentPink, 0.024, -0.012, -0.42);
    ribA.rotation.y = 0.14;
    ribB.rotation.y = -0.14;
    const tipStar = mkMesh(mkStar(0.040, 0.048, 0.34, 0.012), gGold, 0, 0, -0.46);
    lure.add(ribA, ribB, tipStar);
    grp.add(lure);
    grp.visible = false;

    const item = tools.items.net;
    item.claudeHoop = item.claudeHoop || item.hoop.clone();
    item.geminiHoop = new T.Vector3(tipX, tipY, tipZ);
    item.claudeBag = item.claudeBag || item.bag;
    item.geminiBag = lure;
    item.lureHalo = hRing1;
    item.lureHalo2 = hRing2;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.net;
    item.root.add(grp);
  }

  // =========================================================================
  // 2. SLOT "cane": 「星喵香蕉魔法杖」 (Starlight Banana Magic Wand!)
  // =========================================================================
  const bananaGeoMed = mkBananaGeo(1.0);
  const bananaGeoMini = mkBananaGeo(0.45);
  {
    const grp = new T.Group();
    // Slender royal golden-indigo magical scepter shaft (y = -0.14..+0.58)
    grp.add(
      mkMesh(new T.CylinderGeometry(0.013, 0.016, 0.72, 12), gIndigo, 0, 0.22, 0),
      mkMesh(new T.CylinderGeometry(0.020, 0.021, 0.16, 12), gPeri, 0, -0.03, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.095, 0),
      mkMesh(gripRingGeo, gGold, 0, -0.03, 0),
      mkMesh(gripRingGeo, gGold, 0, 0.035, 0),
      mkMesh(new T.TorusGeometry(0.024, 0.0045, 6, 18), gGold, 0, -0.14, 0),
      mkMesh(mkStar(0.022, 0.028, 0.34, 0.010), gBananaGlow, 0, -0.14, 0)
    );
    // Golden spiral ribbon climbing up the magic wand shaft!
    const spiralPts = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const a = u * Math.PI * 5;
      spiralPts.push(new T.Vector3(Math.cos(a) * 0.019, 0.06 + u * 0.48, Math.sin(a) * 0.019));
    }
    grp.add(mkMesh(new T.TubeGeometry(new T.CatmullRomCurve3(spiralPts), 28, 0.0042, 6, false), gGold));

    // Collar ribbon bow + dangling golden cat-bell below the magical banana crown (y = 0.56)
    const bowL = mkMesh(new T.SphereGeometry(0.030, 10, 8), gSakura, -0.034, 0.555, 0.018);
    const bowR = mkMesh(new T.SphereGeometry(0.030, 10, 8), gSakura, 0.034, 0.555, 0.018);
    bowL.scale.set(1.25, 0.62, 0.44); bowL.rotation.z = 0.26;
    bowR.scale.set(1.25, 0.62, 0.44); bowR.rotation.z = -0.26;
    const wandBell = mkBell(1.05);
    wandBell.position.set(0, 0.525, 0.036);
    const crownCup = mkMesh(new T.CylinderGeometry(0.044, 0.018, 0.055, 14), gGold, 0, 0.59, 0);
    // Cute golden cat-ear prongs framing the glowing crystal banana!
    const cEarL = mkEar(0.92, gGold), cEarR = mkEar(0.92, gGold);
    cEarL.position.set(-0.072, 0.65, 0); cEarL.rotation.z = 0.56;
    cEarR.position.set(0.072, 0.65, 0); cEarR.rotation.z = -0.56;
    // Translucent golden star-ring halo surrounding the banana crystal
    const crownHalo = mkMesh(new T.TorusGeometry(0.118, 0.008, 8, 28), gGold, 0, 0.72, 0);
    const crownHalo2 = mkMesh(new T.TorusGeometry(0.105, 0.005, 6, 26), gCyan, 0, 0.72, 0);
    // Sculpted radiant Golden Magic Banana floating at the center of the wand crown!
    const mainBanana = mkMesh(bananaGeoMed, gBanana, -0.025, 0.69, 0);
    mainBanana.scale.setScalar(1.02);
    mainBanana.rotation.z = -0.32;

    // Orbiting mini star-bananas & twin stars charm!
    const charm = new T.Group();
    charm.position.set(0, 0.72, 0);
    const mb1 = mkMesh(bananaGeoMini, gBananaGlow, 0.135, 0.02, 0.02);
    mb1.rotation.z = 0.5;
    const ms1 = mkMesh(mkStar(0.024, 0.030, 0.34, 0.009), gCyan, -0.13, 0.03, -0.02);
    const ms2 = mkMesh(mkStar(0.022, 0.028, 0.34, 0.009), gPink, 0, 0.14, 0.02);
    charm.add(mb1, ms1, ms2);

    grp.add(bowL, bowR, wandBell, crownCup, cEarL, cEarR, crownHalo, crownHalo2, mainBanana, charm);
    grp.visible = false;

    const item = tools.items.cane;
    item.charm = charm;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.cane;
    item.root.add(grp);
  }

  // =========================================================================
  // 3. SLOT "blaster": 「星弦猫耳光弓」 (True Flexing Bowstring + Nocked 3D Arrow!)
  // =========================================================================
  {
    const grp = new T.Group();
    grp.add(
      mkMesh(new T.CylinderGeometry(0.020, 0.023, 0.19, 12), gIndigo, 0, -0.01, -0.01),
      mkMesh(new T.CylinderGeometry(0.024, 0.024, 0.09, 12), gPeri, 0, -0.02, -0.01),
      mkMesh(gripRingGeo, gGold, 0, -0.075, -0.01),
      mkMesh(gripRingGeo, gGold, 0, 0.035, -0.01),
      mkMesh(new T.TorusGeometry(0.024, 0.0045, 6, 18), gGold, 0, -0.125, -0.01),
      mkMesh(mkStar(0.019, 0.025, 0.32, 0.010), gPink, 0, -0.125, -0.01)
    );

    const bridge = mkMesh(new T.SphereGeometry(0.048, 14, 10), gGold, 0, 0.105, 0.055);
    bridge.scale.set(1.35, 0.68, 1.30);
    const sightRing = mkMesh(new T.TorusGeometry(0.045, 0.0055, 8, 24), gGold, 0, 0.145, 0.078);
    const sightGem = mkMesh(mkStar(0.015, 0.019, 0.36, 0.006), gCyan, 0, 0.145, 0.078);
    const sEarL = mkEar(0.76, gGold), sEarR = mkEar(0.76, gGold);
    sEarL.position.set(-0.038, 0.175, 0.078); sEarL.rotation.z = 0.44;
    sEarR.position.set(0.038, 0.175, 0.078); sEarR.rotation.z = -0.44;
    grp.add(bridge, sightRing, sightGem, sEarL, sEarR);

    // Sweeping celestial crescent bow limbs (-X & +X)
    const tipL = new T.Vector3(-0.36, 0.132, -0.05);
    const tipR = new T.Vector3(0.36, 0.132, -0.05);
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
        mkMesh(new T.SphereGeometry(0.025, 10, 8), gGold, side * 0.17, 0.116, 0.165),
        mkMesh(new T.SphereGeometry(0.022, 10, 8), gGold, side * 0.36, 0.132, -0.055),
        mkMesh(mkStar(0.032, 0.042, 0.34, 0.012), side < 0 ? gCyan : gPink, side * 0.375, 0.135, -0.07)
      );
      const wingFin = mkMesh(new T.ConeGeometry(0.026, 0.13, 6), side < 0 ? gTranslucentCyan : gTranslucentPink, side * 0.25, 0.125, 0.145);
      wingFin.rotation.z = side * -1.2;
      wingFin.rotation.x = -0.35;
      grp.add(wingFin);
    }

    // Dynamic 2-segment flexing glowing bowstrings (`strL`, `strR`) that physically pull back on draw!
    const unitCyl = new T.CylinderGeometry(0.0040, 0.0040, 1, 6);
    const strL = mkMesh(unitCyl, gCyan);
    const strR = mkMesh(unitCyl, gPink);
    const nockStar = mkMesh(mkStar(0.018, 0.022, 0.35, 0.008), gGold, 0, 0.125, -0.055);
    {
      const up_ = new T.Vector3(0, 1, 0), tmp_ = new T.Vector3();
      for (const [seg, tip] of [[strL, tipL], [strR, tipR]]) {
        const len = tip.distanceTo(nockStar.position);
        seg.position.copy(tip).add(nockStar.position).multiplyScalar(0.5);
        seg.scale.set(1, len, 1);
        seg.quaternion.setFromUnitVectors(up_, tmp_.copy(nockStar.position).sub(tip).normalize());
      }
    }
    grp.add(strL, strR, nockStar);

    // Real sculpted 3D Nocked Starlight Arrow sitting on the bowstring (slides back & flares on draw!)
    const nockedArrow = new T.Group();
    nockedArrow.position.set(0, 0.125, 0.12);
    const naShaft = mkMesh(new T.CylinderGeometry(0.0075, 0.0075, 0.44, 8).rotateX(Math.PI / 2), gPearl, 0, 0, 0);
    const naHead = mkMesh(new T.ConeGeometry(0.026, 0.10, 4).rotateX(Math.PI / 2), gCyan, 0, 0, 0.25);
    const naGlow = mkMesh(mkStar(0.048, 0.048, 0.38, 0.010), gBananaGlow, 0, 0, 0.25);
    naGlow.visible = false;
    const naFletch = mkMesh(new T.ConeGeometry(0.022, 0.08, 3).rotateX(-Math.PI / 2), gPink, 0, 0, -0.19);
    nockedArrow.add(naShaft, naHead, naGlow, naFletch);
    grp.add(nockedArrow);

    // Floating holographic starlight focus ring ahead of bow
    const muzzleRing = new T.Group();
    muzzleRing.position.set(0, 0.125, 0.245);
    muzzleRing.add(
      mkMesh(mkStar(0.056, 0.056, 0.44, 0.006), gTranslucentCyan),
      mkMesh(new T.TorusGeometry(0.050, 0.0042, 6, 24), gPink)
    );
    grp.add(muzzleRing);

    // 5 hovering draw-tension star-gems above bow limbs (light up sequentially as you draw!)
    const gBalls = [];
    const gemGeo = new T.OctahedronGeometry(0.020, 0);
    for (let k = 0; k < 5; k++) {
      const u = (k - 2) / 2;
      const orb = mkMesh(gemGeo, k % 2 ? gPink : gCyan, u * 0.16, 0.22 - u * u * 0.032, 0.12 - Math.abs(u) * 0.04);
      orb.scale.set(0.75, 0.75, 1.45);
      grp.add(orb);
      gBalls.push(orb);
    }

    grp.visible = false;

    const item = tools.items.blaster;
    item.geminiGroup = grp;
    item.geminiBalls = gBalls;
    item.starMuzzle = muzzleRing;
    item.bowRig = { strL, strR, tipL, tipR, nockStar, nockedArrow, naGlow, _a: new T.Vector3(), _b: new T.Vector3(), _up: new T.Vector3(0, 1, 0) };
    item.geminiDef = GEMINI_WEAPON_DEFS.blaster;
    item.root.add(grp);
  }

  // =========================================================================
  // 4. SLOT "hammer": 「猫爪星光锤」 (Beloved Upgraded Starlight Cat-Paw Hammer!)
  // =========================================================================
  {
    const grp = new T.Group();
    const headCore = new T.CylinderGeometry(0.108, 0.108, 0.205, 24).rotateX(Math.PI / 2);
    const headCapF = new T.CylinderGeometry(0.095, 0.108, 0.048, 24).rotateX(Math.PI / 2);
    const headCapB = headCapF.clone().rotateY(Math.PI);
    const headRim = new T.TorusGeometry(0.110, 0.012, 8, 28);
    const furCollar = new T.TorusGeometry(0.036, 0.015, 8, 20).rotateX(Math.PI / 2);
    const hGripR = new T.TorusGeometry(0.026, 0.0045, 6, 18).rotateX(Math.PI / 2);

    const eL = mkEar(1.24, gPeri), eR = mkEar(1.24, gPeri);
    eL.position.set(-0.068, 0.665, 0); eL.rotation.z = 0.42;
    eR.position.set(0.068, 0.665, 0); eR.rotation.z = -0.42;
    const bell = mkBell(1.12);
    bell.position.set(0, 0.42, 0.044);

    // Side glowing twin stars + golden rings on left & right of hammerhead
    const sideRingGeo = new T.TorusGeometry(0.048, 0.005, 6, 20);
    const sR = mkMesh(mkStar(0.042, 0.052, 0.32, 0.012), gCyan, 0.112, 0.56, 0); sR.rotation.y = Math.PI / 2;
    const sL = mkMesh(mkStar(0.042, 0.052, 0.32, 0.012), gPink, -0.112, 0.56, 0); sL.rotation.y = -Math.PI / 2;
    const sFR = mkMesh(sideRingGeo, gGold, 0.110, 0.56, 0); sFR.rotation.y = Math.PI / 2;
    const sFL = mkMesh(sideRingGeo, gGold, -0.110, 0.56, 0); sFL.rotation.y = -Math.PI / 2;

    // 3D Glowing Sakura Cat-Paw Toe Beans on BOTH Hammer Strike Faces!
    const mkPawFace = (dir) => {
      const pg = new T.Group();
      const pz = dir * 0.148;
      const mn = mkMesh(new T.SphereGeometry(0.038, 14, 10), gSakura, 0, 0.538, pz);
      const l1 = mkMesh(new T.SphereGeometry(0.020, 10, 8), gSakura, -0.016, 0.556, pz);
      const l2 = mkMesh(new T.SphereGeometry(0.020, 10, 8), gSakura, 0.016, 0.556, pz);
      mn.scale.set(1.16, 0.86, 0.36);
      l1.scale.set(1.0, 0.92, 0.38);
      l2.scale.set(1.0, 0.92, 0.38);
      pg.add(mn, l1, l2);
      for (const [px, py, pr, rz] of [[-0.052, 0.573, 0.016, 0.42], [-0.020, 0.598, 0.0175, 0.14], [0.020, 0.598, 0.0175, -0.14], [0.052, 0.573, 0.016, -0.42]]) {
        const tb = mkMesh(new T.SphereGeometry(pr, 10, 8), gPink, px, py, pz);
        tb.scale.set(0.86, 1.16, 0.42);
        tb.rotation.z = rz;
        pg.add(tb);
      }
      return pg;
    };

    grp.add(
      mkMesh(new T.CylinderGeometry(0.017, 0.020, 0.66, 12), gIndigo, 0, 0.20, 0),
      mkMesh(new T.CylinderGeometry(0.0245, 0.0255, 0.16, 12), gPeri, 0, -0.04, 0),
      mkMesh(hGripR, gGold, 0, -0.10, 0),
      mkMesh(hGripR, gGold, 0, -0.04, 0),
      mkMesh(hGripR, gGold, 0, 0.02, 0),
      mkMesh(new T.TorusGeometry(0.028, 0.005, 6, 20), gGold, 0, -0.146, 0),
      mkMesh(mkStar(0.024, 0.030, 0.32, 0.012), gPink, 0, -0.146, 0),
      mkMesh(furCollar, gFur, 0, 0.438, 0),
      bell,
      mkMesh(headCore, gIndigo, 0, 0.56, 0),
      mkMesh(headCapF, gFur, 0, 0.56, 0.122),
      mkMesh(headCapB, gFur, 0, 0.56, -0.122),
      mkMesh(headRim, gGold, 0, 0.56, 0.098),
      mkMesh(headRim, gGold, 0, 0.56, -0.098),
      mkMesh(new T.TorusGeometry(0.112, 0.006, 6, 28), gCyan, 0, 0.56, 0),
      sR, sL, sFR, sFL, eL, eR,
      mkMesh(mkStar(0.026, 0.034, 0.32, 0.012), gGold, 0, 0.688, 0),
      mkPawFace(1),
      mkPawFace(-1)
    );
    grp.visible = false;

    const item = tools.items.hammer;
    item.geminiGroup = grp;
    item.geminiDef = GEMINI_WEAPON_DEFS.hammer;
    item.root.add(grp);
  }

  // =========================================================================
  // 5. SLOT "sword": 「双子星芒刃」 (Radiant Twin-Star Longsword — NO Scythe!)
  // =========================================================================
  {
    const grp = new T.Group();
    const rotY90 = new T.Matrix4().makeRotationY(Math.PI / 2);
    const guardY = 0.035;
    const pomY = -0.158;

    // Sleek sculpted crystalline twin-star longsword blade (edge along ±Z!)
    const bladePts = [
      [-0.028, 0.055], [-0.048, 0.140], [-0.030, 0.25],
      [-0.037, 0.52], [-0.022, 0.67], [0, 0.80],
      [0.022, 0.67], [0.037, 0.52], [0.030, 0.25],
      [0.048, 0.140], [0.028, 0.055]
    ];
    const bShape = new T.Shape();
    bShape.moveTo(bladePts[0][0], bladePts[0][1]);
    for (const [bx, by] of bladePts.slice(1)) bShape.lineTo(bx, by);
    bShape.closePath();
    const bladeGeo = new T.ExtrudeGeometry(bShape, {
      depth: 0.0045, bevelEnabled: true, bevelThickness: 0.0065, bevelSize: 0.011, bevelSegments: 2
    });
    bladeGeo.translate(0, 0, -0.00225);
    bladeGeo.applyMatrix4(rotY90);
    bladeGeo.computeVertexNormals();

    // Swept golden celestial wing crossguard!
    const wShape = new T.Shape();
    wShape.moveTo(0.018, -0.018);
    wShape.quadraticCurveTo(0.090, -0.012, 0.142, 0.074);
    wShape.quadraticCurveTo(0.100, 0.048, 0.055, 0.030);
    wShape.quadraticCurveTo(0.034, 0.024, 0.018, 0.018);
    wShape.closePath();
    const wingGeo = new T.ExtrudeGeometry(wShape, {
      depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1
    });
    wingGeo.translate(0, 0, -0.006);
    wingGeo.applyMatrix4(rotY90);
    const wingMirror = wingGeo.clone().applyMatrix4(new T.Matrix4().makeRotationY(Math.PI));

    // Twin-star glowing hilt crystals (Cyan front-angled + Sakura-Pink back-angled)
    const starBig = mkStar(0.036, 0.050, 0.30, 0.016);
    const starMed = mkStar(0.030, 0.044, 0.30, 0.016);
    const starPom = mkStar(0.024, 0.030, 0.32, 0.012);
    const starShard = mkStar(0.017, 0.028, 0.34, 0.010);

    const hiltGems = new T.Group();
    const h1 = mkMesh(starBig, gCyan, 0.008, guardY + 0.008, 0.020); h1.rotation.set(0.10, 0.25, -0.14);
    const h2 = mkMesh(starBig, gCyan, -0.008, guardY + 0.008, 0.020); h2.rotation.set(0.10, -0.25, 0.14);
    const h3 = mkMesh(starMed, gPink, 0.008, guardY + 0.002, -0.020); h3.rotation.set(-0.10, -0.25, 0.14);
    const h4 = mkMesh(starMed, gPink, -0.008, guardY + 0.002, -0.020); h4.rotation.set(-0.10, 0.25, -0.14);
    hiltGems.add(h1, h2, h3, h4);

    // Orbiting twin-star crystal shards gliding along the blade!
    const shards = new T.Group();
    shards.position.set(0, 0.30, 0);
    const sh1 = mkMesh(starShard, gCyan, 0.036, 0.04, 0.046); sh1.rotation.y = 0.5;
    const sh2 = mkMesh(starShard, gPink, -0.036, -0.03, -0.046); sh2.rotation.y = -0.5;
    shards.add(sh1, sh2);

    // Subtle cute cat-ear golden pommel ornament & tiny cat bell at base of hilt!
    const swRing = new T.TorusGeometry(0.0175, 0.0038, 6, 18).rotateX(Math.PI / 2);
    const pomHalo = mkMesh(new T.TorusGeometry(0.026, 0.0042, 6, 20).rotateY(Math.PI / 2), gGold, 0, pomY - 0.010, 0);
    const pomStar = mkMesh(starPom, gCyan, 0, pomY - 0.010, 0); pomStar.rotation.y = Math.PI / 2;
    const pomBell = mkBell(0.75); pomBell.position.set(0, pomY - 0.042, 0);

    grp.add(
      mkMesh(wingGeo, gGold, 0, guardY, 0),
      mkMesh(wingMirror, gGold, 0, guardY, 0),
      mkMesh(new T.CylinderGeometry(0.022, 0.024, 0.044, 12), gIndigo, 0, guardY, 0),
      mkMesh(new T.TorusGeometry(0.033, 0.005, 8, 22), gGold, 0, guardY + 0.006, 0),
      hiltGems,
      mkMesh(bladeGeo, gPearl),
      mkMesh(new T.BoxGeometry(0.020, 0.49, 0.007), gCrystalCore, 0, 0.38, 0),
      mkMesh(new T.BoxGeometry(0.023, 0.19, 0.0055), gGold, 0, 0.23, 0),
      shards,
      mkMesh(new T.CylinderGeometry(0.015, 0.017, 0.14, 12), gIndigo, 0, -0.06, 0),
      mkMesh(swRing, gGold, 0, -0.015, 0),
      mkMesh(swRing, gGold, 0, -0.06, 0),
      mkMesh(swRing, gGold, 0, -0.105, 0),
      pomHalo, pomStar, pomBell
    );
    grp.visible = false;

    const item = tools.items.sword;
    if (item.geminiGroup && item.geminiGroup.parent) {
      item.geminiGroup.parent.remove(item.geminiGroup);
    }
    item.geminiGroup = grp;
    item.geminiCore = gCrystalCore;
    item.shards = shards;
    item.geminiDef = GEMINI_WEAPON_DEFS.sword;
    item.root.add(grp);
  }

  // Prune any superseded Gemini groups cleanly
  for (const id of ["net", "cane", "blaster", "hammer", "sword"]) {
    const it = tools.items[id];
    if (!it) continue;
    const keep = new Set([it.claudeGroup, it.geminiGroup]);
    for (const ch of it.root.children.slice()) {
      if (!keep.has(ch)) it.root.remove(ch);
    }
    it.geminiPic = null;
  }

  // =========================================================================
  // 6. UNIQUE 3D MAGIC SPELL & VFX POOL FOR GEMINI'S WEAPONS!
  //    - Spinning 3D Golden Banana Magic Boomerangs (星喵香蕉魔法杖)
  //    - Expanding 3D Holographic Lure & Hammer Starlight Shockwave Rings
  //    - Rising 3D Starfall Light Pillar (双子星芒刃 跳劈星陨)
  // =========================================================================
  const bananas = [];
  const bananaProjGeo = mkBananaGeo(3.25);
  for (let i = 0; i < 6; i++) {
    const bg = new T.Group();
    const bm = mkMesh(bananaProjGeo, gBanana);
    const bRing = mkMesh(new T.TorusGeometry(0.42, 0.022, 6, 20).rotateX(Math.PI / 2), gBananaGlow);
    const bStar = mkMesh(mkStar(0.14, 0.14, 0.36, 0.024), gCyan, 0, 0.12, 0);
    bg.add(bm, bRing, bStar);
    bg.visible = false;
    game.scene.add(bg);
    bananas.push({
      g: bg,
      pos: new T.Vector3(),
      dir: new T.Vector3(),
      t: 0,
      dist: 0,
      maxDist: 12.5,
      on: false,
      trail: 0,
      seen: new Set()
    });
  }

  // Expanding 3D luminous rings (used by Cat-Teaser Lure, Hammer Double-Wave, Sword Spin Nova!)
  const fxRings = [];
  const fxRingGeo = new T.TorusGeometry(1.0, 0.055, 8, 36).rotateX(Math.PI / 2);
  for (let i = 0; i < 10; i++) {
    const mat = new T.MeshBasicMaterial({
      color: 0x62f2ff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      fog: false
    });
    const m = new T.Mesh(fxRingGeo, mat);
    m.visible = false;
    m.renderOrder = 6;
    m.frustumCulled = false;
    game.scene.add(m);
    fxRings.push({ m, on: false, t: 0, dur: 0.5, r0: 0.2, r1: 2.0 });
  }

  function spawnFxRing(x, y, z, r0, r1, dur, hexColor) {
    const slot = fxRings.find((r) => !r.on) || fxRings[0];
    slot.on = true;
    slot.t = 0;
    slot.dur = dur;
    slot.r0 = r0;
    slot.r1 = r1;
    slot.m.position.set(x, y, z);
    slot.m.scale.setScalar(r0);
    slot.m.material.color.setHex(hexColor);
    slot.m.material.opacity = 0.92;
    slot.m.visible = true;
  }

  // Towering translucent Starfall Plunge Light Pillar for 双子星芒刃!
  const pillarMat = new T.MeshBasicMaterial({
    color: 0x76f4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
    side: T.DoubleSide
  });
  const pillarMesh = new T.Mesh(new T.CylinderGeometry(0.32, 0.72, 6.2, 18, 1, true), pillarMat);
  pillarMesh.visible = false;
  pillarMesh.renderOrder = 6;
  pillarMesh.frustumCulled = false;
  game.scene.add(pillarMesh);
  const pillarState = { on: false, t: 0, dur: 0.55 };

  // --- UNIQUE EFFECT 1: 星月逗猫棒 Lure & Holographic Capture Ring ---
  tools._onGeminiNet = function (cx, cz, gy, ax, az) {
    spawnFxRing(cx, gy + 0.08, cz, 0.25, 1.38, 0.46, 0x5ef2ff);
    spawnFxRing(cx, gy + 0.14, cz, 0.18, 1.12, 0.52, 0xff80de);

    // Generous capture sweep + Playful Cat-Lure Magic attracting nearby wild Clawds!
    const caught = game.pets && game.pets.net(cx, cz, 1.15);
    let lured = 0;
    if (game.pets && game.pets.all) {
      for (const a of game.pets.all) {
        if (!a.root.visible || a.tame || !game.pets.catchable(a)) continue;
        const dx = cx - a.x, dz = cz - a.z;
        const d = Math.hypot(dx, dz);
        if (d > 1.0 && d < 6.8) {
          // Lure the curious Clawd playfully toward Gemini's sparkling feather-bell!
          const pull = Math.min(1.35, d * 0.45);
          const nx = a.x + (dx / d) * pull;
          const nz = a.z + (dz / d) * pull;
          if (!game.player.allowed || game.player.allowed(nx, nz)) {
            a.x = nx;
            a.z = nz;
          }
          a.hopV = Math.max(a.hopV || 0, 2.5);
          a.yaw = Math.atan2(dx, dz);
          game.puffs.spawn(a.x, game.world.groundAt(a.x, a.z) + 0.5, a.z, 0, 1.2, 0, 0.09, 0.85, 0.45, 1, 0.55, 0.92, 0.5, 1.2);
          if (a.cool <= 0 && game.pets.say) {
            game.pets.say(a, "（被发光逗猫棒吸引过来了！）", 2.4);
            a.cool = 2.6;
          }
          lured++;
        }
      }
    }
    if (lured > 0 && game.audio.lureChime) game.audio.lureChime();

    // Tame pets & nearby friends hop playfully when teased!
    if (!caught && game.friends && game.friends.list) {
      for (const fr of game.friends.list) {
        if (Math.hypot(fr.x - cx, fr.z - cz) < 2.2) {
          game.friends.hopNow(fr, 0.24, 0.45);
        }
      }
    }
    return !!caught;
  };

  // --- UNIQUE EFFECT 2: 星喵香蕉魔法杖 Spinning Golden Banana Magic Spell! ---
  tools._onGeminiBanana = function (px, py, pz, ax, az) {
    const slot = bananas.find((b) => !b.on) || bananas[0];
    slot.on = true;
    slot.t = 0;
    slot.dist = 0;
    slot.trail = 0;
    slot.seen.clear();
    slot.pos.set(px + ax * 0.75, py + 0.92, pz + az * 0.75);
    slot.dir.set(ax, 0, az).normalize();
    slot.g.position.copy(slot.pos);
    slot.g.scale.setScalar(0.95);
    slot.g.visible = true;

    // Casting golden-star sparkle burst right at the wand tip!
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const sp = 1.6 + Math.random() * 2.2;
      game.puffs.spawn(
        slot.pos.x, slot.pos.y, slot.pos.z,
        Math.cos(a) * sp, 0.7 + Math.random() * 1.4, Math.sin(a) * sp,
        0.06 + Math.random() * 0.05, 0.88, 0.30 + Math.random() * 0.25,
        1.0, k % 2 ? 0.88 : 0.65, k % 2 ? 0.16 : 0.95, 3.2, 1.3
      );
    }
    game.sparks.spawn(slot.pos.x, slot.pos.y, slot.pos.z, 0, 0, 0, 0.48, 0.95, 0.11, 3.4, 2.8, 0.5, 0, 0);
    if (game.audio.bananaCast) game.audio.bananaCast();
  };

  function burstBanana(b, hitSomething = false) {
    const p = b.pos;
    spawnFxRing(p.x, Math.max(game.world.groundAt(p.x, p.z) + 0.08, p.y - 0.3), p.z, 0.18, 1.55, 0.40, 0xffe24a);
    for (let k = 0; k < 16; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.6 + Math.random() * 3.2;
      const isGold = k % 3 !== 0;
      game.puffs.spawn(
        p.x, p.y, p.z,
        Math.cos(a) * sp, 1.0 + Math.random() * 2.6, Math.sin(a) * sp,
        0.08 + Math.random() * 0.07, 0.88, 0.42 + Math.random() * 0.30,
        isGold ? 1.0 : 0.32, isGold ? 0.86 : 0.92, isGold ? 0.14 : 1.0, 4.8, 1.6
      );
    }
    game.sparks.spawn(p.x, p.y, p.z, 0, 0, 0, 0.62, 0.95, 0.14, 3.6, 2.9, 0.55, 0, 0);
    if (hitSomething && game.audio.bananaHit) game.audio.bananaHit();
    b.on = false;
    b.g.visible = false;
  }

  // --- UNIQUE EFFECT 4: 猫爪星光锤 Double Starlight Shockwave Bounce! ---
  tools._onGeminiHammer = function (cx, cz, gy) {
    const wideR = 3.4;
    spawnFxRing(cx, gy + 0.08, cz, 0.35, wideR, 0.54, 0x52f0ff);
    spawnFxRing(cx, gy + 0.16, cz, 0.25, wideR * 0.72, 0.44, 0xff74dc);
    // Also give nearby friends a joyful bounce!
    if (game.friends && game.friends.list) {
      for (const fr of game.friends.list) {
        const d = Math.hypot(fr.x - cx, fr.z - cz);
        if (d < wideR) {
          game.friends.hopNow(fr, 0.42, 0.55);
        }
      }
    }
    if (game.pets) game.pets.shock(cx, cz, wideR);
    if (game.folk) {
      for (const f of game.folk.around(cx, cz, wideR - 0.3)) {
        const m = f.clawd || f.snowman;
        if (m) game.folk.hit(f, "punch", m.x - cx, m.z - cz);
      }
    }
  };

  // --- UNIQUE EFFECT 5: 双子星芒刃 Twin Cross-Waves, Spin Nova & Starfall Pillar! ---
  tools._onGeminiSwordSpin = function (px, gy, pz) {
    spawnFxRing(px, gy + 0.15, pz, 0.4, 2.6, 0.48, 0x52f0ff);
    spawnFxRing(px, gy + 0.25, pz, 0.3, 2.1, 0.42, 0xff74dc);
  };

  tools._onGeminiSwordPlunge = function (px, gy, pz) {
    spawnFxRing(px, gy + 0.08, pz, 0.45, 3.2, 0.56, 0x52f0ff);
    spawnFxRing(px, gy + 0.14, pz, 0.35, 2.5, 0.48, 0xff74dc);
    pillarState.on = true;
    pillarState.t = 0;
    pillarMesh.position.set(px, gy + 3.1, pz);
    pillarMesh.scale.set(0.6, 1, 0.6);
    pillarMat.opacity = 0.72;
    pillarMesh.visible = true;
  };

  // =========================================================================
  // 7. PER-FRAME ANIMATIONS & SPELL SIMULATION!
  // =========================================================================
  const _probeV = new T.Vector3();
  const _velV = new T.Vector3();
  const _prevT = { val: 0 };

  tools._updateCatWeapons = function (time) {
    const dt = _prevT.val ? Math.min(0.066, Math.max(0.001, time - _prevT.val)) : 0.016;
    _prevT.val = time;

    // 1) Animate held Gemini weapons
    if (this.isGemini) {
      if (this.held === "net" && this.items.net.lureHalo) {
        this.items.net.lureHalo.rotation.z = time * 2.2;
        this.items.net.lureHalo2.rotation.z = -time * 2.8;
      }
      if (this.held === "cane" && this.items.cane.charm) {
        this.items.cane.charm.rotation.y = time * 2.6;
        this.items.cane.charm.position.y = 0.72 + Math.sin(time * 4.0) * 0.014;
      }
      if (this.held === "blaster") {
        const bl = this.items.blaster;
        const bow = this.gun && this.gun.bow;
        const drawT = bow && bow.drawing ? bow.drawT : 0;
        const isFull = !!(bow && bow.full);

        if (bl.starMuzzle) {
          bl.starMuzzle.rotation.z = time * (2.4 + drawT * 7.0);
          bl.starMuzzle.scale.setScalar(1 + drawT * 0.25 + this.kick * 0.24);
        }
        // Physically pull back the 2 glowing bowstring segments & nocked 3D star-arrow!
        if (bl.bowRig) {
          const r = bl.bowRig;
          const pullZ = -0.055 - drawT * 0.28 - this.kick * 0.036 * Math.cos(time * 68);
          r.nockStar.position.set(0, 0.125, pullZ);
          r.nockStar.scale.setScalar(1.0 + drawT * 0.55 + (isFull ? 0.25 * Math.sin(time * 24) : 0));
          const nockP = r.nockStar.position;
          for (const [seg, tip] of [[r.strL, r.tipL], [r.strR, r.tipR]]) {
            const len = tip.distanceTo(nockP);
            seg.position.copy(tip).add(nockP).multiplyScalar(0.5);
            seg.scale.set(1, len, 1);
            seg.quaternion.setFromUnitVectors(r._up, r._a.copy(nockP).sub(tip).normalize());
          }
          // Show nocked arrow while ready or drawing (hide right after loosing during short cooldown!)
          const showArrow = !bow || bow.drawing || bow.cool <= 0.06;
          r.nockedArrow.visible = showArrow;
          r.nockedArrow.position.set(0, 0.125, pullZ + 0.195);
          r.naGlow.visible = isFull || drawT > 0.35;
          if (r.naGlow.visible) {
            r.naGlow.rotation.z = time * (isFull ? 9.0 : 4.5);
            r.naGlow.scale.setScalar(isFull ? 1.05 + 0.20 * Math.sin(time * 24) : 0.45 + drawT * 0.55);
          }
        }
        // Floating star-gems above bow act as live Draw Tension Crystals!
        if (bl.geminiBalls) {
          for (let k = 0; k < bl.geminiBalls.length; k++) {
            const b = bl.geminiBalls[k];
            b.visible = !bow || !bow.drawing || drawT >= (k + 0.5) / 5.2;
            b.rotation.z = time * (2.2 + drawT * 5.0) + k * 0.9;
            const sc = isFull ? 1.25 : (bow && bow.drawing ? 0.95 + drawT * 0.25 : 0.85);
            b.scale.set(0.75 * sc, 0.75 * sc, 1.45 * sc);
          }
        }
      }
    }

    // 2) Update flying 3D Golden Banana Magic Boomerangs!
    for (const b of bananas) {
      if (!b.on) continue;
      b.t += dt;
      const step = 14.5 * dt;
      b.dist += step;
      // Graceful subtle magic banana boomerang curve + floating wave!
      const curveAngle = 0.22 * dt;
      const cx = b.dir.x * Math.cos(curveAngle) - b.dir.z * Math.sin(curveAngle);
      const cz = b.dir.x * Math.sin(curveAngle) + b.dir.z * Math.cos(curveAngle);
      b.dir.set(cx, 0, cz).normalize();

      b.pos.x += b.dir.x * step;
      b.pos.z += b.dir.z * step;
      const gy = game.world.groundAt(b.pos.x, b.pos.z);
      b.pos.y = gy + 0.86 + Math.sin(b.t * 9.0) * 0.14;
      b.g.position.copy(b.pos);
      b.g.rotation.set(0.25, b.t * 15.0, b.t * 8.0);

      // Golden banana stardust trail!
      if ((b.trail += step) > 0.36) {
        b.trail = 0;
        game.puffs.spawn(
          b.pos.x, b.pos.y, b.pos.z,
          (Math.random() - 0.5) * 0.6, 0.3 + Math.random() * 0.5, (Math.random() - 0.5) * 0.6,
          0.075, 0.85, 0.36, 1.0, 0.88, 0.18, 1.2, 1.5
        );
      }

      // Check collisions along banana magic flight (friends, folk, pets, trees, explore targets, walls)!
      let hitEnd = false;
      const rHit = 0.82;
      if (game.pets && game.pets.strike(b.pos.x, b.pos.z, rHit, "cane", b.dir.x, b.dir.z)) {
        burstBanana(b, true);
        continue;
      }
      const fk = game.folk && game.folk.target(b.pos.x, b.pos.z, rHit);
      if (fk && !b.seen.has(fk)) {
        b.seen.add(fk);
        game.folk.hit(fk, "kick", b.dir.x, b.dir.z);
        burstBanana(b, true);
        continue;
      }
      const fr = game.friends && game.friends.near(b.pos.x, b.pos.z, rHit);
      if (fr && !b.seen.has(fr)) {
        b.seen.add(fr);
        game.friends.hit(fr, "punch", b.dir.x, b.dir.z);
        game.friends.hopNow(fr, 0.52, 0.6);
        if (fr.cool <= 0) {
          game.friends.say(fr, "哇呀！踩到发光魔法香蕉啦！", 3.2);
          fr.cool = 2.8;
        }
        burstBanana(b, true);
        continue;
      }
      if (game.explore && (game.explore.strike(b.pos.x, b.pos.z, rHit) || game.explore.ballHit(b.pos))) {
        burstBanana(b, true);
        continue;
      }
      for (const tr of game.forest.trees) {
        if (!tr.near || b.seen.has(tr)) continue;
        if (Math.hypot(b.pos.x - tr.x, b.pos.z - tr.z) < tr.r + 0.55) {
          b.seen.add(tr);
          game.player.dumpSnow(tr, b.pos.x, b.pos.y + 0.8, b.pos.z, 85);
          hitEnd = true;
          break;
        }
      }
      if (hitEnd) {
        burstBanana(b, true);
        continue;
      }
      if (game.player.allowed && !game.player.allowed(b.pos.x, b.pos.z)) {
        burstBanana(b, false);
        continue;
      }
      if (b.dist >= b.maxDist) {
        burstBanana(b, false);
      }
    }

    // 3) Update expanding 3D magic rings (Teaser Lure, Hammer Wave, Sword Nova)
    for (const r of fxRings) {
      if (!r.on) continue;
      r.t += dt;
      const u = r.t / r.dur;
      if (u >= 1) {
        r.on = false;
        r.m.visible = false;
        continue;
      }
      const ease = 1 - (1 - u) * (1 - u);
      r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * ease);
      r.m.material.opacity = 0.92 * (1 - u);
    }

    // 4) Update Starfall Plunge Light Pillar
    if (pillarState.on) {
      pillarState.t += dt;
      const u = pillarState.t / pillarState.dur;
      if (u >= 1) {
        pillarState.on = false;
        pillarMesh.visible = false;
      } else {
        const sc = 0.55 + u * 1.45;
        pillarMesh.scale.set(sc, 1.0 + u * 0.3, sc);
        pillarMat.opacity = 0.72 * (1 - u) * (1 - u);
        pillarMesh.rotation.y = time * 4.5;
      }
    }
  };
}
