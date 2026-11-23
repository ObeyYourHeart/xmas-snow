// 幻翼星云飞猫 · 星穹白猫大坐骑 (Gemini's Original Non-Helicopter Magical Winged Sky-Cat Mount!)
// Zero rotors, zero cockpit, zero skids — Gemini rides directly on the starlight velvet saddle
// of a majestic, fluffy, aurora-winged celestial white cat soaring across the winter sky.

export class CatMount {
  constructor(game, helpers) {
    this.game = game;
    this.wrapMat = helpers.mat;
    this.THREE = game.THREE;

    this.root = null;
    this.seat = new this.THREE.Vector3(0, 0.85, 0.06);
    this.lampAt = new this.THREE.Vector3(0, 1.54, -1.72);

    this.headG = null;
    this.earL = null;
    this.earR = null;
    this.wingL = null;
    this.wingR = null;
    this.wingOuterL = null;
    this.wingOuterR = null;
    this.wingTipL = null;
    this.wingTipR = null;
    this.tailSegs = [];
    this.tailOrb = null;
    this.paws = {};
    this.hoverHalo = null;
    this.bellG = null;
    this.emissives = [];

    this.flapPhase = 0;
    this.flightBlend = 0;
    this.trailAcc = 0;

    this._wL = new this.THREE.Vector3();
    this._wR = new this.THREE.Vector3();
    this._tTip = new this.THREE.Vector3();
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  mkStarGeo(rx, ry, inner = 0.34, depth = 0.04) {
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

  mkFeatherGeo(len, width) {
    const T = this.THREE;
    const s = new T.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(-width * 0.62, len * 0.34, -width * 0.44, len * 0.78);
    s.quadraticCurveTo(0, len * 1.04, width * 0.44, len * 0.78);
    s.quadraticCurveTo(width * 0.62, len * 0.34, 0, 0);
    const g = new T.ExtrudeGeometry(s, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 1,
      curveSegments: 8
    });
    g.translate(0, 0, -0.008);
    return g;
  }

  mkCatEar(scale, furMat, innerMat, goldMat) {
    const T = this.THREE;
    const eo = new T.Shape();
    eo.moveTo(-0.20, 0);
    eo.quadraticCurveTo(-0.22, 0.28, 0, 0.48);
    eo.quadraticCurveTo(0.22, 0.28, 0.20, 0);
    eo.closePath();
    const gOut = new T.ExtrudeGeometry(eo, {
      depth: 0.08, bevelEnabled: true, bevelThickness: 0.032, bevelSize: 0.024, bevelSegments: 2, curveSegments: 8
    });
    gOut.translate(0, 0, -0.04);

    const ei = new T.Shape();
    ei.moveTo(-0.115, 0.06);
    ei.quadraticCurveTo(-0.125, 0.23, 0, 0.35);
    ei.quadraticCurveTo(0.125, 0.23, 0.115, 0.06);
    ei.closePath();
    const gIn = new T.ExtrudeGeometry(ei, {
      depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 6
    });
    gIn.translate(0, 0, -0.011);

    const grp = new T.Group();
    // Ear faces forward (-Z)!
    grp.add(
      this.mesh(gOut, furMat),
      this.mesh(gIn, innerMat, 0, 0, -0.056),
      // Fluffy inner ear tuft + dainty golden ear cuff ring
      this.mesh(new T.SphereGeometry(0.065, 8, 6), furMat, 0, 0.09, -0.052),
      this.mesh(new T.TorusGeometry(0.048, 0.011, 6, 14), goldMat, 0.155, 0.14, 0)
    );
    grp.scale.setScalar(scale);
    return grp;
  }

  mkCatBell(scale, goldMat, indigoMat) {
    const T = this.THREE;
    const g = new T.Group();
    g.add(
      this.mesh(new T.SphereGeometry(0.12, 14, 12), goldMat),
      this.mesh(new T.TorusGeometry(0.125, 0.018, 6, 18).rotateX(Math.PI / 2), goldMat, 0, -0.01, 0),
      this.mesh(new T.BoxGeometry(0.16, 0.028, 0.045), indigoMat, 0, -0.06, -0.105),
      this.mesh(new T.BoxGeometry(0.16, 0.028, 0.045), indigoMat, 0, -0.06, 0.105)
    );
    g.scale.setScalar(scale);
    return g;
  }

  build() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (r, g, b, rough = 0.42, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: new T.Color(r, g, b), roughness: rough, ...extra }));

    // Soft Snowy-White Celestial Fur & Starlight Palette
    const snowFur = std(0.96, 0.97, 1.0, 0.56, {
      metalness: 0.04,
      emissive: new T.Color(0.18, 0.22, 0.36),
      emissiveIntensity: 0.10
    });
    const creamFur = std(0.99, 0.96, 0.98, 0.52, {
      metalness: 0.03,
      emissive: new T.Color(0.24, 0.18, 0.32),
      emissiveIntensity: 0.08
    });
    const lavenderFur = std(0.76, 0.72, 0.98, 0.46, {
      metalness: 0.08,
      emissive: new T.Color(0.22, 0.18, 0.50),
      emissiveIntensity: 0.18
    });
    const velvetIndigo = std(0.13, 0.15, 0.36, 0.54, {
      metalness: 0.22,
      emissive: new T.Color(0.08, 0.10, 0.28),
      emissiveIntensity: 0.22
    });
    const royalPeri = std(0.36, 0.44, 0.96, 0.36, {
      metalness: 0.24,
      emissive: new T.Color(0.14, 0.18, 0.48),
      emissiveIntensity: 0.24
    });
    const sakuraPink = std(1.0, 0.62, 0.86, 0.34, {
      metalness: 0.06,
      emissive: new T.Color(0.76, 0.24, 0.56),
      emissiveIntensity: 0.34
    });
    const gold = std(0.99, 0.84, 0.46, 0.18, { metalness: 0.90 });
    const pupilDark = std(0.05, 0.05, 0.12, 0.08, { metalness: 0.15 });
    const pureWhite = plain(new T.MeshBasicMaterial({ color: 0xffffff }));

    const cyanGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.46, 0.95, 1.0),
      emissive: new T.Color(0.24, 0.88, 1.0),
      emissiveIntensity: 1.3,
      roughness: 0.10,
      metalness: 0.12
    }));
    const pinkGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.56, 0.90),
      emissive: new T.Color(0.96, 0.34, 0.84),
      emissiveIntensity: 1.3,
      roughness: 0.10,
      metalness: 0.12
    }));
    const eyeCyan = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.28, 0.88, 1.0),
      emissive: new T.Color(0.14, 0.72, 1.0),
      emissiveIntensity: 1.15,
      roughness: 0.08
    }));
    const eyeRose = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.46, 0.78),
      emissive: new T.Color(0.96, 0.26, 0.66),
      emissiveIntensity: 1.15,
      roughness: 0.08
    }));

    // Iridescent translucent feathered aurora wing materials!
    const wingFeatherCyan = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.74, 0.97, 1.0),
      emissive: new T.Color(0.22, 0.80, 1.0),
      emissiveIntensity: 0.68,
      roughness: 0.14,
      metalness: 0.12,
      transparent: true,
      opacity: 0.86,
      side: T.DoubleSide
    }));
    const wingFeatherPink = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.78, 0.96),
      emissive: new T.Color(0.92, 0.34, 0.82),
      emissiveIntensity: 0.64,
      roughness: 0.14,
      metalness: 0.12,
      transparent: true,
      opacity: 0.84,
      side: T.DoubleSide
    }));
    const wingCovertSnow = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.97, 0.98, 1.0),
      emissive: new T.Color(0.32, 0.38, 0.66),
      emissiveIntensity: 0.26,
      roughness: 0.30,
      side: T.DoubleSide
    }));

    this.emissives.push(
      { mat: cyanGlow, base: 1.1, active: 2.1 },
      { mat: pinkGlow, base: 1.1, active: 2.1 },
      { mat: eyeCyan, base: 0.85, active: 1.75 },
      { mat: eyeRose, base: 0.85, active: 1.75 },
      { mat: wingFeatherCyan, base: 0.48, active: 1.15 },
      { mat: wingFeatherPink, base: 0.45, active: 1.10 }
    );

    const g = new T.Group();

    // =========================================================================
    // 1. FLUFFY CELESTIAL CAT TORSO, CHEST RUFF & HAUNCHES (forward = -Z!)
    // =========================================================================
    const torso = this.mesh(new T.SphereGeometry(0.62, 24, 18), snowFur, 0, 0.78, 0.04);
    torso.scale.set(0.90, 0.78, 1.68);
    const chest = this.mesh(new T.SphereGeometry(0.56, 20, 16), snowFur, 0, 0.88, -0.68);
    chest.scale.set(0.94, 0.90, 1.02);
    const rump = this.mesh(new T.SphereGeometry(0.56, 20, 16), snowFur, 0, 0.76, 0.76);
    rump.scale.set(0.94, 0.84, 0.96);
    const neck = this.mesh(new T.CylinderGeometry(0.34, 0.44, 0.48, 18), snowFur, 0, 1.12, -0.88);
    neck.rotation.x = 0.46;
    g.add(torso, chest, rump, neck);

    // Extra-fluffy cloudlike mane/chest ruff around the cat's chest!
    for (const [rx, ry, rz, rr] of [
      [0, 0.86, -1.12, 0.30],
      [-0.24, 0.94, -1.04, 0.25],
      [0.24, 0.94, -1.04, 0.25],
      [-0.36, 1.06, -0.86, 0.22],
      [0.36, 1.06, -0.86, 0.22],
      [0, 0.70, -1.06, 0.23]
    ]) {
      const tuft = this.mesh(new T.SphereGeometry(rr, 14, 10), creamFur, rx, ry, rz);
      tuft.scale.set(1.05, 0.92, 0.88);
      g.add(tuft);
    }

    // Starlight constellation flank markings (glowing twin-star patterns on both flanks!)
    const flankStarGeo = this.mkStarGeo(0.11, 0.14, 0.34, 0.025);
    const flankDotGeo = new T.SphereGeometry(0.032, 8, 6);
    for (const side of [-1, 1]) {
      const fs = this.mesh(flankStarGeo, side < 0 ? cyanGlow : pinkGlow, side * 0.54, 0.80, 0.66);
      fs.rotation.y = side * (Math.PI / 2);
      g.add(
        fs,
        this.mesh(flankDotGeo, side < 0 ? pinkGlow : cyanGlow, side * 0.55, 0.92, 0.52),
        this.mesh(flankDotGeo, gold, side * 0.54, 0.68, 0.82)
      );
    }

    // =========================================================================
    // 2. ROYAL STARLIGHT VELVET SADDLE & LUMINOUS REINS (Rider sits at y = 1.24!)
    // =========================================================================
    // Draped starry twilight-indigo saddle blanket hugging the cat's back (+Y!)
    const blanket = this.mesh(new T.CylinderGeometry(0.575, 0.59, 0.96, 24, 1, false, -Math.PI * 0.38, Math.PI * 0.76), velvetIndigo, 0, 0.78, 0.04);
    blanket.rotation.x = -Math.PI / 2;
    blanket.scale.set(0.95, 1.0, 0.84);
    // Gold trim border on saddle blanket
    for (const side of [-1, 1]) {
      g.add(
        this.mesh(new T.BoxGeometry(0.035, 0.04, 0.98), gold, side * 0.545, 0.66, 0.04),
        this.mesh(new T.SphereGeometry(0.045, 8, 6), side < 0 ? cyanGlow : pinkGlow, side * 0.555, 0.66, -0.34),
        this.mesh(new T.SphereGeometry(0.045, 8, 6), side < 0 ? pinkGlow : cyanGlow, side * 0.555, 0.66, 0.42)
      );
    }
    // Plush velvet cushion seat (top sits at y ≈ 1.24 so Gemini sits snugly on it!)
    const cushion = this.mesh(new T.SphereGeometry(0.42, 18, 12), royalPeri, 0, 1.15, 0.06);
    cushion.scale.set(1.06, 0.34, 1.18);
    // Curved golden crescent backrest behind rider + starlight pommel horn ahead of rider
    const backrest = this.mesh(new T.TorusGeometry(0.30, 0.048, 10, 22, Math.PI), gold, 0, 1.22, 0.44);
    backrest.rotation.x = -0.25;
    const backGem = this.mesh(this.mkStarGeo(0.095, 0.12, 0.34, 0.025), pinkGlow, 0, 1.50, 0.47);
    const pommel = this.mesh(new T.TorusGeometry(0.16, 0.032, 8, 18, Math.PI), gold, 0, 1.24, -0.34);
    pommel.rotation.x = 0.22;
    const pomGem = this.mesh(this.mkStarGeo(0.075, 0.095, 0.34, 0.022), cyanGlow, 0, 1.40, -0.36);
    g.add(blanket, cushion, backrest, backGem, pommel, pomGem);

    // Royal Collar around the neck + giant golden cat bell + glowing starlight reins!
    const collar = this.mesh(new T.TorusGeometry(0.37, 0.055, 10, 26), royalPeri, 0, 1.10, -0.96);
    collar.rotation.x = Math.PI / 2 + 0.42;
    const collarTrim = this.mesh(new T.TorusGeometry(0.385, 0.018, 8, 26), gold, 0, 1.10, -0.96);
    collarTrim.rotation.x = Math.PI / 2 + 0.42;
    const bellG = this.mkCatBell(1.55, gold, velvetIndigo);
    bellG.position.set(0, 0.90, -1.32);
    this.bellG = bellG;
    g.add(collar, collarTrim, bellG);

    // Luminous starlight reins running from the collar to the saddle pommel
    for (const side of [-1, 1]) {
      const reinCurve = new T.CatmullRomCurve3([
        new T.Vector3(side * 0.34, 1.14, -1.04),
        new T.Vector3(side * 0.40, 1.24, -0.70),
        new T.Vector3(side * 0.16, 1.36, -0.34)
      ]);
      g.add(this.mesh(new T.TubeGeometry(reinCurve, 14, 0.016, 6, false), side < 0 ? cyanGlow : pinkGlow));
    }

    // =========================================================================
    // 3. EXPRESSIVE ADORABLE GIANT CAT HEAD (Pivoted at (0, 1.38, -1.12))
    // =========================================================================
    const headG = new T.Group();
    headG.position.set(0, 1.38, -1.12);
    this.headG = headG;

    const skull = this.mesh(new T.SphereGeometry(0.46, 24, 18), snowFur, 0, 0.04, -0.04);
    skull.scale.set(1.12, 0.96, 1.02);
    // Cute fluffy cheek puffs + soft muzzle
    const cheekL = this.mesh(new T.SphereGeometry(0.24, 14, 10), snowFur, -0.34, -0.08, -0.14);
    cheekL.scale.set(1.15, 0.85, 0.92);
    const cheekR = this.mesh(new T.SphereGeometry(0.24, 14, 10), snowFur, 0.34, -0.08, -0.14);
    cheekR.scale.set(1.15, 0.85, 0.92);
    const muzzleL = this.mesh(new T.SphereGeometry(0.125, 12, 10), creamFur, -0.085, -0.11, -0.43);
    const muzzleR = this.mesh(new T.SphereGeometry(0.125, 12, 10), creamFur, 0.085, -0.11, -0.43);
    const nose = this.mesh(new T.SphereGeometry(0.052, 10, 8), sakuraPink, 0, -0.055, -0.52);
    nose.scale.set(1.22, 0.82, 0.72);
    // Sweet ':3' smile curves + rosy cheek blush
    const smL = this.mesh(new T.TorusGeometry(0.058, 0.012, 6, 14, Math.PI), velvetIndigo, -0.058, -0.12, -0.525);
    smL.rotation.z = Math.PI;
    const smR = this.mesh(new T.TorusGeometry(0.058, 0.012, 6, 14, Math.PI), velvetIndigo, 0.058, -0.12, -0.525);
    smR.rotation.z = Math.PI;
    const blL = this.mesh(new T.SphereGeometry(0.075, 10, 8), sakuraPink, -0.31, -0.09, -0.37);
    blL.scale.set(1.15, 0.58, 0.35);
    const blR = this.mesh(new T.SphereGeometry(0.075, 10, 8), sakuraPink, 0.31, -0.09, -0.37);
    blR.scale.set(1.15, 0.58, 0.35);
    headG.add(skull, cheekL, cheekR, muzzleL, muzzleR, nose, smL, smR, blL, blR);

    // Big Expressive Heterochromia Anime Cat Eyes (Left = Starry Cyan, Right = Dreamy Sakura-Rose!)
    for (const [side, irisMat] of [[-1, eyeCyan], [1, eyeRose]]) {
      const eyeOuter = this.mesh(new T.SphereGeometry(0.125, 16, 12), irisMat, side * 0.21, 0.05, -0.42);
      eyeOuter.scale.set(1.06, 1.18, 0.45);
      const pupil = this.mesh(new T.SphereGeometry(0.072, 12, 10), pupilDark, side * 0.21, 0.055, -0.465);
      pupil.scale.set(0.68, 1.15, 0.32);
      const glint1 = this.mesh(new T.SphereGeometry(0.032, 8, 6), pureWhite, side * 0.21 - 0.032, 0.095, -0.488);
      const glint2 = this.mesh(new T.SphereGeometry(0.016, 8, 6), pureWhite, side * 0.21 + 0.034, 0.020, -0.488);
      // Cute twilight-lavender upper eyelash brow arc
      const lash = this.mesh(new T.TorusGeometry(0.115, 0.016, 6, 16, Math.PI * 0.85), velvetIndigo, side * 0.21, 0.08, -0.44);
      lash.rotation.z = 0.08 * Math.PI - side * 0.14;
      headG.add(eyeOuter, pupil, glint1, glint2, lash);
    }

    // 6 Delicate Shimmering Golden Whiskers sweeping gracefully from cheeks
    for (const side of [-1, 1]) {
      for (const [wy, wz, rx, ry, len] of [
        [-0.04, -0.36, 0.06, -0.22, 0.40],
        [-0.10, -0.37, 0.0, -0.14, 0.44],
        [-0.16, -0.35, -0.07, -0.06, 0.36]
      ]) {
        const w = this.mesh(new T.CylinderGeometry(0.006, 0.003, len, 6), gold, side * (0.34 + len * 0.42), wy, wz);
        w.rotation.z = side * (Math.PI / 2 - rx);
        w.rotation.y = side * ry;
        headG.add(w);
      }
    }

    // Forehead Glowing Golden Crescent Moon & Twin-Star Tiara!
    const tiaraArc = this.mesh(new T.TorusGeometry(0.115, 0.022, 8, 20, Math.PI * 1.35), gold, 0, 0.23, -0.45);
    tiaraArc.rotation.z = Math.PI * 0.82;
    const tiaraGem = this.mesh(this.mkStarGeo(0.068, 0.085, 0.34, 0.024), cyanGlow, 0, 0.24, -0.47);
    headG.add(tiaraArc, tiaraGem);

    // Two Large Articulated Fluffy Cat Ears!
    const earL = this.mkCatEar(1.08, snowFur, sakuraPink, gold);
    earL.position.set(-0.29, 0.34, -0.04);
    earL.rotation.set(0.14, 0.16, 0.34);
    const earR = this.mkCatEar(1.08, snowFur, sakuraPink, gold);
    earR.position.set(0.29, 0.34, -0.04);
    earR.rotation.set(0.14, -0.16, -0.34);
    this.earL = earL;
    this.earR = earR;
    headG.add(earL, earR);
    g.add(headG);

    // =========================================================================
    // 4. GIANT ARTICULATED FEATHERED AURORA WINGS (5.8m Majestic Wingspan!)
    // =========================================================================
    const primaryGeo = this.mkFeatherGeo(1.08, 0.26);
    const secondaryGeo = this.mkFeatherGeo(0.76, 0.24);
    const covertGeo = this.mkFeatherGeo(0.46, 0.22);

    const buildWing = (side) => {
      const rootW = new T.Group();
      rootW.position.set(side * 0.46, 1.14, -0.34);

      // Sculpted golden-pearl shoulder crest & inner wing-arm bone
      const crest = this.mesh(new T.SphereGeometry(0.16, 12, 10), gold, side * 0.08, 0.04, 0);
      crest.scale.set(1.2, 0.72, 1.3);
      const crestStar = this.mesh(this.mkStarGeo(0.10, 0.13, 0.34, 0.025), side < 0 ? cyanGlow : pinkGlow, side * 0.14, 0.10, -0.06);
      const armCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(side * 0.62, 0.24, -0.12),
        new T.Vector3(side * 1.18, 0.36, -0.02)
      ]);
      rootW.add(
        crest,
        crestStar,
        this.mesh(new T.TubeGeometry(armCurve, 14, 0.055, 8, false), snowFur),
        this.mesh(new T.TubeGeometry(armCurve, 14, 0.026, 8, false), gold, 0, 0.038, -0.03)
      );

      // Inner secondary feathers + fluffy snow covert row fanning backward (+Z) & outward (±X)!
      for (let i = 0; i < 6; i++) {
        const u = i / 5;
        const fx = side * (0.20 + u * 0.94);
        const fy = 0.06 + u * 0.28;
        const fz = -0.04 - Math.sin(u * Math.PI) * 0.08;
        const fMat = i % 2 === 0 ? wingFeatherCyan : wingFeatherPink;
        const sec = this.mesh(secondaryGeo, fMat, fx, fy, fz);
        sec.rotation.set(Math.PI / 2 - 0.10, side * (0.14 + u * 0.28), 0);
        sec.scale.set(1.0, 0.85 + u * 0.28, 1.0);
        const cov = this.mesh(covertGeo, wingCovertSnow, fx, fy + 0.045, fz - 0.02);
        cov.rotation.set(Math.PI / 2 - 0.14, side * (0.10 + u * 0.24), 0);
        rootW.add(sec, cov);
      }

      // Articulated outer wing-tip segment (pivoted at wrist for organic feathered flex!)
      const outerW = new T.Group();
      outerW.position.set(side * 1.18, 0.36, -0.02);

      const outerCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(side * 0.56, 0.06, 0.08),
        new T.Vector3(side * 1.10, -0.06, 0.26)
      ]);
      outerW.add(
        this.mesh(new T.TubeGeometry(outerCurve, 12, 0.034, 8, false), gold),
        this.mesh(new T.SphereGeometry(0.085, 10, 8), side < 0 ? cyanGlow : pinkGlow, 0, 0.02, -0.03)
      );

      // 8 sweeping long primary translucent aurora flight feathers fanning out to majestic tips!
      for (let i = 0; i < 8; i++) {
        const u = i / 7;
        const fx = side * (0.06 + u * 1.04);
        const fy = 0.04 - u * 0.10;
        const fz = u * 0.24;
        const fMat = i % 2 === 0 ? (side < 0 ? wingFeatherCyan : wingFeatherPink) : (side < 0 ? wingFeatherPink : wingFeatherCyan);
        const pri = this.mesh(primaryGeo, fMat, fx, fy, fz);
        pri.rotation.set(Math.PI / 2 - 0.06, side * (0.36 + u * 0.68), 0);
        pri.scale.set(0.95 + (1 - u) * 0.22, 0.90 + Math.sin(u * Math.PI * 0.82) * 0.45, 1.0);
        outerW.add(pri);
      }

      // Wingtip stardust emitter anchor
      const tip = new T.Object3D();
      tip.position.set(side * 1.38, -0.08, 0.55);
      outerW.add(tip);

      rootW.add(outerW);
      g.add(rootW);
      return { rootW, outerW, tip };
    };

    const wL = buildWing(-1);
    const wR = buildWing(1);
    this.wingL = wL.rootW;
    this.wingOuterL = wL.outerW;
    this.wingTipL = wL.tip;
    this.wingR = wR.rootW;
    this.wingOuterR = wR.outerW;
    this.wingTipR = wR.tip;

    // =========================================================================
    // 5. FOUR ARTICULATED FLUFFY CAT PAWS WITH GLOWING SAKURA TOE BEANS!
    // =========================================================================
    const buildLeg = (x, y, z, isFront) => {
      const leg = new T.Group();
      leg.position.set(x, y, z);

      // Upper thigh + lower forearm + fluffy ankle cuff with golden anklet ring!
      const thigh = this.mesh(new T.SphereGeometry(isFront ? 0.22 : 0.26, 14, 10), snowFur, 0, -0.12, 0);
      thigh.scale.set(0.92, 1.35, 1.05);
      const shin = this.mesh(new T.CylinderGeometry(0.145, 0.165, 0.44, 14), snowFur, 0, -0.40, isFront ? -0.04 : 0.02);
      const anklet = this.mesh(new T.TorusGeometry(0.16, 0.022, 6, 18).rotateX(Math.PI / 2), gold, 0, -0.48, isFront ? -0.04 : 0.02);
      // Plump rounded paw + glowing pink toe beans underneath (visible when soaring!)
      const paw = this.mesh(new T.SphereGeometry(0.20, 14, 10), creamFur, 0, -0.58, isFront ? -0.10 : -0.06);
      paw.scale.set(1.04, 0.64, 1.24);
      // Main bean + 3 toe beans on the sole (y = -0.68)
      const mainBean = this.mesh(new T.SphereGeometry(0.085, 10, 8), sakuraPink, 0, -0.665, isFront ? -0.08 : -0.04);
      mainBean.scale.set(1.15, 0.40, 1.0);
      leg.add(thigh, shin, anklet, paw, mainBean);
      for (const bx of [-0.085, 0, 0.085]) {
        const tb = this.mesh(new T.SphereGeometry(0.042, 8, 6), pinkGlow, bx, -0.665, (isFront ? -0.10 : -0.06) - 0.11);
        tb.scale.set(0.9, 0.42, 1.1);
        leg.add(tb);
      }
      g.add(leg);
      return leg;
    };

    // Pivoted at y = 0.69 so the paw bottom sits cleanly at y = 0.0 when landed!
    this.paws.fl = buildLeg(-0.36, 0.69, -0.72, true);
    this.paws.fr = buildLeg(0.36, 0.69, -0.72, true);
    this.paws.bl = buildLeg(-0.38, 0.69, 0.72, false);
    this.paws.br = buildLeg(0.38, 0.69, 0.72, false);

    // =========================================================================
    // 6. MULTI-SEGMENT FLOWING STARRY CAT TAIL + SAKURA BOW + CRESCENT RING!
    // =========================================================================
    // Giant sakura satin bow tied neatly at tail base!
    const bowBase = new T.Group();
    bowBase.position.set(0, 1.00, 1.10);
    const tBowL = this.mesh(new T.SphereGeometry(0.17, 12, 10), sakuraPink, -0.18, 0.03, 0.04);
    tBowL.scale.set(1.35, 0.74, 0.48);
    tBowL.rotation.z = 0.24;
    const tBowR = this.mesh(new T.SphereGeometry(0.17, 12, 10), sakuraPink, 0.18, 0.03, 0.04);
    tBowR.scale.set(1.35, 0.74, 0.48);
    tBowR.rotation.z = -0.24;
    const tBowKnot = this.mesh(new T.SphereGeometry(0.085, 10, 8), gold, 0, 0.01, 0.07);
    bowBase.add(tBowL, tBowR, tBowKnot);
    g.add(bowBase);

    // 6 articulated cascading fluffy tail segments curving upward and waving fluidly!
    let parentTail = g;
    const tailMats = [snowFur, snowFur, lavenderFur, lavenderFur, royalPeri, cyanGlow];
    const tailRadii = [0.16, 0.155, 0.15, 0.145, 0.14, 0.125];
    for (let i = 0; i < 6; i++) {
      const seg = new T.Group();
      if (i === 0) {
        seg.position.set(0, 0.96, 1.10);
      } else {
        seg.position.set(0, 0.08, 0.28);
      }
      const fluff = this.mesh(new T.SphereGeometry(tailRadii[i], 14, 10), tailMats[i], 0, 0.04, 0.14);
      fluff.scale.set(0.95, 0.95, 1.48);
      seg.add(fluff);
      if (i === 5) {
        // Orbiting golden crescent + twinkling twin-star halo at the tail tip!
        const tipOrb = new T.Group();
        tipOrb.position.set(0, 0.06, 0.30);
        tipOrb.add(
          this.mesh(new T.TorusGeometry(0.22, 0.022, 8, 22), gold),
          this.mesh(this.mkStarGeo(0.11, 0.14, 0.34, 0.028), pinkGlow, 0, 0, 0)
        );
        seg.add(tipOrb);
        this.tailOrb = tipOrb;
      }
      parentTail.add(seg);
      this.tailSegs.push(seg);
      parentTail = seg;
    }

    // =========================================================================
    // 7. FLOATING CELESTIAL STARLIGHT HOVER HALO (Visible when lifting off!)
    // =========================================================================
    const hoverHalo = new T.Group();
    hoverHalo.position.set(0, 0.16, 0.0);
    const outerRing = this.mesh(new T.TorusGeometry(1.08, 0.022, 8, 42).rotateX(Math.PI / 2), cyanGlow);
    const innerRing = this.mesh(new T.TorusGeometry(0.82, 0.016, 8, 36).rotateX(Math.PI / 2), pinkGlow);
    hoverHalo.add(outerRing, innerRing);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const st = this.mesh(this.mkStarGeo(0.085, 0.085, 0.38, 0.018).rotateX(Math.PI / 2), k % 2 ? pinkGlow : cyanGlow, Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95);
      hoverHalo.add(st);
    }
    hoverHalo.visible = false;
    this.hoverHalo = hoverHalo;
    g.add(hoverHalo);

    g.visible = false;
    this.root = g;
    return this;
  }

  update(dt, time, heli) {
    if (!this.root || !this.root.visible) return;
    const g = this.game;
    const driven = heli.driven;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;
    const airborne = !heli.landed;
    const speedRatio = Math.min(1, Math.abs(heli.v) / 14);
    const climbRatio = Math.max(0, Math.min(1, heli.vy / 6));
    const liftPower = Math.max(heli.rotor, airborne ? 1 : 0);

    // Smooth transition between landed idle pose (0) and soaring flight pose (1)
    const targetFly = airborne ? 1 : Math.min(1, heli.rotor * 0.85);
    this.flightBlend += (targetFly - this.flightBlend) * (1 - Math.exp(-7 * Math.max(dt, 0.001)));
    const fb = this.flightBlend;

    // 1) Dynamic organic feathered wingbeat animation!
    const flapFreq = airborne ? 4.4 + climbRatio * 3.8 + speedRatio * 1.4 : 1.6 + heli.rotor * 3.8;
    this.flapPhase += Math.max(dt, 0) * flapFreq;
    const flapWave = Math.sin(this.flapPhase);
    const flapLag = Math.sin(this.flapPhase - 0.65);

    const baseSweepY = (1 - fb) * 0.56 + fb * (0.10 + speedRatio * 0.22);
    const flapAmp = (1 - fb) * 0.055 + fb * (0.32 + climbRatio * 0.22 - speedRatio * 0.06);
    const baseUpZ = (1 - fb) * 0.30 + fb * 0.06;

    // Positive Y on left (-X) and negative Y on right (+X) sweeps wings gracefully BACKWARD (+Z)!
    this.wingL.rotation.set(
      (1 - fb) * 0.14 + fb * (0.06 + speedRatio * 0.08),
      baseSweepY,
      -baseUpZ - flapWave * flapAmp
    );
    this.wingR.rotation.set(
      (1 - fb) * 0.14 + fb * (0.06 + speedRatio * 0.08),
      -baseSweepY,
      baseUpZ + flapWave * flapAmp
    );
    // Secondary outer wing feather flex (lags smoothly behind main beat!)
    const outerFlex = (1 - fb) * 0.16 + fb * (0.12 + flapLag * 0.28);
    this.wingOuterL.rotation.z = -outerFlex;
    this.wingOuterR.rotation.z = outerFlex;

    // 2) Expressive cat head looks gently into turns & climbs + cute ear twitches!
    const steer = driven ? (heli.turn || 0) : 0;
    const idleLook = driven ? 0 : Math.sin(time * 0.7) * 0.14;
    this.headG.rotation.y = Math.max(-0.42, Math.min(0.42, -steer * 0.24 + idleLook));
    this.headG.rotation.x = Math.max(-0.24, Math.min(0.28, (heli.vy || 0) * 0.032 + Math.sin(time * 1.9) * 0.035));

    const earTwitch = Math.pow(Math.max(0, Math.sin(time * 2.1 + 1.3)), 18) * 0.22;
    const earSweep = speedRatio * 0.26;
    this.earL.rotation.x = 0.14 - earSweep;
    this.earL.rotation.z = 0.34 + earTwitch;
    this.earR.rotation.x = 0.14 - earSweep;
    this.earR.rotation.z = -0.34 - earTwitch * 0.4;

    // Collar golden bell swings subtly with speed & hover bob
    if (this.bellG) {
      this.bellG.rotation.x = 0.18 + speedRatio * 0.42 + Math.sin(time * 5.2) * 0.08 * liftPower;
      this.bellG.rotation.z = steer * 0.22;
    }

    // 3) Four cat paws smoothly tuck into soaring sky-kitty pose when airborne!
    const pawBob = Math.sin(this.flapPhase - 0.3) * 0.08 * fb;
    this.paws.fl.rotation.x = fb * (-0.72 - speedRatio * 0.22) + pawBob;
    this.paws.fr.rotation.x = fb * (-0.72 - speedRatio * 0.22) - pawBob;
    this.paws.bl.rotation.x = fb * (0.86 + speedRatio * 0.28) - pawBob;
    this.paws.br.rotation.x = fb * (0.86 + speedRatio * 0.28) + pawBob;

    // 4) Flowing sinusoidal starlight cat tail wave!
    const tailFreq = 2.6 + speedRatio * 2.4;
    const tailAmp = 0.11 + speedRatio * 0.06;
    for (let i = 0; i < this.tailSegs.length; i++) {
      const seg = this.tailSegs[i];
      const baseArc = i === 0 ? (0.28 - fb * 0.22) : (0.14 - i * 0.025) * (1 - fb * 0.45);
      seg.rotation.x = baseArc + Math.sin(time * tailFreq - i * 0.72) * 0.08;
      seg.rotation.y = Math.sin(time * (tailFreq * 0.85) - i * 0.68) * tailAmp + steer * 0.08;
    }
    if (this.tailOrb) {
      this.tailOrb.rotation.z = time * 2.4;
      this.tailOrb.rotation.y = time * 1.6;
    }

    // 5) Floating celestial constellation halo under paws when lifting off / hovering!
    if (this.hoverHalo) {
      this.hoverHalo.visible = liftPower > 0.06;
      const sc = 0.75 + 0.30 * liftPower + Math.sin(time * 3.8) * 0.03;
      this.hoverHalo.scale.setScalar(sc);
      this.hoverHalo.rotation.y = time * 1.25;
    }

    // 6) Emissive crystal & eye glow intensifies during flight and aurora night
    const power = driven ? 1.0 : 0.45 + 0.55 * lamps;
    const pulse = 0.92 + 0.08 * Math.sin(time * 3.6);
    for (const em of this.emissives) {
      em.mat.emissiveIntensity = (em.base + (em.active - em.base) * power) * pulse;
    }

    // 7) Shimmering cyan & sakura-pink stardust feather trails from wingtips & tail tip!
    if (dt > 0 && liftPower > 0.35 && (driven || airborne)) {
      const rate = airborne ? 24 + Math.abs(heli.v) * 2.4 : 9;
      this.trailAcc += dt * rate;
      while (this.trailAcc >= 1) {
        this.trailAcc -= 1;
        this.wingTipL.getWorldPosition(this._wL);
        this.wingTipR.getWorldPosition(this._wR);
        // Left aurora wingtip -> Starlight Cyan stardust
        g.puffs.spawn(
          this._wL.x, this._wL.y, this._wL.z,
          (Math.random() - 0.5) * 0.45, (Math.random() - 0.3) * 0.35, (Math.random() - 0.5) * 0.45,
          0.10 + Math.random() * 0.06, 0.88, 0.52 + Math.random() * 0.28,
          0.26, 0.92, 1.0, 0.3, 1.2
        );
        // Right aurora wingtip -> Sakura-Pink stardust
        g.puffs.spawn(
          this._wR.x, this._wR.y, this._wR.z,
          (Math.random() - 0.5) * 0.45, (Math.random() - 0.3) * 0.35, (Math.random() - 0.5) * 0.45,
          0.10 + Math.random() * 0.06, 0.88, 0.52 + Math.random() * 0.28,
          1.0, 0.48, 0.90, 0.3, 1.2
        );
        // Occasional golden star-sparkle from the swaying tail halo
        if (this.tailOrb && Math.random() < 0.42) {
          this.tailOrb.getWorldPosition(this._tTip);
          g.sparks.spawn(
            this._tTip.x, this._tTip.y, this._tTip.z,
            (Math.random() - 0.5) * 0.6, 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6,
            0.12 + Math.random() * 0.08, 0.9, 0.35 + Math.random() * 0.25,
            1.6, 1.35, 0.75, 0.3, 1.0
          );
        }
      }
    }
  }
}
