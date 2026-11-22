// 哈基米双子星猫耳飞艇 (Gemini's Exclusive Twin-Star Kitty Sky-Cruiser)
// Attaches cleanly to O.heli alongside Claude's orange flower helicopter (heli.glb)
// with matching anchors (A_seat, A_lamp, rotor_main, rotor_tail, nose_spin, yoke).

export class CatMount {
  constructor(game, helpers) {
    this.game = game;
    this.wrapMat = helpers.mat;
    this.THREE = game.THREE;

    this.root = null;
    this.rotorG = null;
    this.tailG = null;
    this.noseG = null;
    this.yoke = null;
    this.yokeQ = null;
    this.disc = null;
    this.tdisc = null;
    this.wingL = null;
    this.wingR = null;
    this.emissives = [];
    this.trailAcc = 0;

    this._wL = new this.THREE.Vector3();
    this._wR = new this.THREE.Vector3();
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  makeRotorBlurTex(isTail = false) {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d");
    const cx = 128, cy = 128;
    c.translate(cx, cy);

    // Soft translucent cyan-pink cosmic halo
    const grad = c.createRadialGradient(0, 0, 12, 0, 0, 124);
    grad.addColorStop(0, "rgba(255, 245, 255, 0.22)");
    grad.addColorStop(0.55, isTail ? "rgba(255, 128, 224, 0.14)" : "rgba(92, 232, 255, 0.12)");
    grad.addColorStop(0.88, "rgba(255, 130, 225, 0.20)");
    grad.addColorStop(1, "rgba(120, 220, 255, 0)");
    c.fillStyle = grad;
    c.beginPath(); c.arc(0, 0, 124, 0, Math.PI * 2); c.fill();

    // Glowing twin-star outer rim ring
    c.strokeStyle = isTail ? "rgba(255, 145, 232, 0.42)" : "rgba(110, 238, 255, 0.36)";
    c.lineWidth = 10;
    c.beginPath(); c.arc(0, 0, 108, 0, Math.PI * 2); c.stroke();

    // 6 alternating cyan & sakura-pink motion-blurred star blades
    const blades = isTail ? 4 : 6;
    for (let n = 0; n < blades; n++) {
      const col = n % 2 === 0 ? "90, 236, 255" : "255, 132, 224";
      for (let s = 0; s < 32; s++) {
        const a = s / 31 - 0.5;
        const w = 1 - Math.abs(a) * 2;
        c.save();
        c.rotate((n * Math.PI * 2) / blades + a * 0.65);
        c.fillStyle = `rgba(${col}, ${(0.065 * w).toFixed(3)})`;
        c.beginPath();
        c.ellipse(64, 0, 52, 11, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  mkStarGeo(rx, ry, inner = 0.32, depth = 0.04) {
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

  mkCatEar(scale, outerMat, innerMat) {
    const T = this.THREE;
    const eo = new T.Shape();
    eo.moveTo(-0.22, 0);
    eo.quadraticCurveTo(-0.24, 0.30, 0, 0.52);
    eo.quadraticCurveTo(0.24, 0.30, 0.22, 0);
    eo.closePath();
    const gOut = new T.ExtrudeGeometry(eo, {
      depth: 0.09, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.028, bevelSegments: 2, curveSegments: 8
    });
    gOut.translate(0, 0, -0.045);

    const ei = new T.Shape();
    ei.moveTo(-0.125, 0.065);
    ei.quadraticCurveTo(-0.135, 0.25, 0, 0.38);
    ei.quadraticCurveTo(0.135, 0.25, 0.125, 0.065);
    ei.closePath();
    const gIn = new T.ExtrudeGeometry(ei, {
      depth: 0.028, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 6
    });
    gIn.translate(0, 0, -0.014);

    const grp = new T.Group();
    grp.add(
      this.mesh(gOut, outerMat),
      this.mesh(gIn, innerMat, 0, 0, 0.062),
      this.mesh(gIn, innerMat, 0, 0, -0.062)
    );
    grp.scale.setScalar(scale);
    return grp;
  }

  mkCatBell(scale, goldMat, indigoMat) {
    const T = this.THREE;
    const g = new T.Group();
    g.add(
      this.mesh(new T.SphereGeometry(0.11, 12, 10), goldMat),
      this.mesh(new T.TorusGeometry(0.115, 0.018, 6, 18).rotateX(Math.PI / 2), goldMat, 0, -0.01, 0),
      this.mesh(new T.BoxGeometry(0.15, 0.026, 0.045), indigoMat, 0, -0.055, 0.095),
      this.mesh(new T.BoxGeometry(0.15, 0.026, 0.045), indigoMat, 0, -0.055, -0.095)
    );
    g.scale.setScalar(scale);
    return g;
  }

  mkSidePaw(dir, mainMat, beanMat) {
    const T = this.THREE;
    const g = new T.Group();
    const main = this.mesh(new T.SphereGeometry(0.085, 12, 8), mainMat, 0, -0.03, 0);
    main.scale.set(0.32, 0.88, 1.15);
    g.add(main);
    for (const [pz, py, pr] of [[-0.095, 0.035, 0.034], [-0.035, 0.082, 0.036], [0.035, 0.082, 0.036], [0.095, 0.035, 0.034]]) {
      const b = this.mesh(new T.SphereGeometry(pr, 8, 6), beanMat, 0, py, pz);
      b.scale.set(0.36, 1.12, 0.86);
      g.add(b);
    }
    g.position.x = dir * 0.63;
    return g;
  }

  build() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (r, g, b, rough = 0.36, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: new T.Color(r, g, b), roughness: rough, ...extra }));

    const indigo = std(0.09, 0.11, 0.27, 0.32, { metalness: 0.44 });
    const peri = std(0.35, 0.41, 0.94, 0.30, { metalness: 0.26, emissive: new T.Color(0.12, 0.14, 0.42), emissiveIntensity: 0.22 });
    const pearl = std(0.95, 0.96, 1.0, 0.28, { metalness: 0.14, emissive: new T.Color(0.22, 0.28, 0.48), emissiveIntensity: 0.08 });
    const lavender = std(0.70, 0.64, 0.96, 0.62, { metalness: 0.05 });
    const sakura = std(0.98, 0.60, 0.85, 0.34, { metalness: 0.08, emissive: new T.Color(0.75, 0.22, 0.54), emissiveIntensity: 0.32 });
    const gold = std(0.98, 0.82, 0.46, 0.18, { metalness: 0.90 });

    const cyanGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.45, 0.94, 1.0),
      emissive: new T.Color(0.24, 0.88, 1.0),
      emissiveIntensity: 1.4,
      roughness: 0.10,
      metalness: 0.15
    }));
    const pinkGlow = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.56, 0.90),
      emissive: new T.Color(0.96, 0.34, 0.84),
      emissiveIntensity: 1.4,
      roughness: 0.10,
      metalness: 0.15
    }));
    const amberEye = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.78, 0.26),
      emissive: new T.Color(1.0, 0.62, 0.12),
      emissiveIntensity: 1.35,
      roughness: 0.12
    }));
    const roseEye = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.34, 0.68),
      emissive: new T.Color(1.0, 0.20, 0.56),
      emissiveIntensity: 1.35,
      roughness: 0.12
    }));
    this.emissives.push(
      { mat: cyanGlow, base: 1.15, active: 2.15 },
      { mat: pinkGlow, base: 1.15, active: 2.15 },
      { mat: amberEye, base: 0.85, active: 2.30 },
      { mat: roseEye, base: 0.85, active: 2.30 }
    );

    const glass = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.74, 0.88, 1.0),
      emissive: new T.Color(0.28, 0.22, 0.64),
      emissiveIntensity: 0.22,
      roughness: 0.06,
      transparent: true,
      opacity: 0.30,
      side: T.DoubleSide,
      depthWrite: false
    }));

    const g = new T.Group();

    // 1. Sleek Starry Indigo & Pearl-White Kitty Fuselage (forward = -Z, tail = +Z!)
    // Lower hull belly + rounded nose + rear engine cowling (leaves open cockpit at z = -0.60..+0.15!)
    const belly = this.mesh(new T.SphereGeometry(0.66, 22, 14), pearl, 0, 0.56, -0.18);
    belly.scale.set(0.98, 0.60, 1.95);
    const noseCap = this.mesh(new T.SphereGeometry(0.60, 20, 14), indigo, 0, 0.64, -0.78);
    noseCap.scale.set(1.02, 0.66, 1.18);
    const rearPod = this.mesh(new T.SphereGeometry(0.62, 20, 14), indigo, 0, 0.78, 0.52);
    rearPod.scale.set(0.98, 0.78, 1.08);
    const goldBelt = new T.TorusGeometry(0.64, 0.028, 8, 32);
    goldBelt.rotateX(Math.PI / 2);
    const beltMesh = this.mesh(goldBelt, gold, 0, 0.62, -0.18);
    beltMesh.scale.set(1.0, 1.96, 1.0);
    g.add(belly, noseCap, rearPod, beltMesh);

    // Side glowing cyan/pink neon rails & adorable 3D glowing cat-paw badges!
    for (const side of [-1, 1]) {
      g.add(
        this.mesh(new T.BoxGeometry(0.035, 0.032, 1.18), side < 0 ? cyanGlow : pinkGlow, side * 0.635, 0.70, -0.18),
        this.mesh(new T.BoxGeometry(0.028, 0.024, 0.96), side < 0 ? pinkGlow : cyanGlow, side * 0.632, 0.56, -0.14)
      );
      const sp = this.mkSidePaw(side, sakura, side < 0 ? cyanGlow : pinkGlow);
      sp.position.set(side * 0.625, 0.72, 0.42);
      g.add(sp);
    }

    // 2. Adorable Kitty Face Nose: Heterochromia Headlight Eyes + Whiskers + Spinning Twin-Star Nose!
    // Left eye (viewer's right from front = -X): Rose-Pink; Right eye (+X): Golden-Amber!
    const eyeL = this.mesh(new T.SphereGeometry(0.115, 14, 10), roseEye, -0.25, 0.72, -1.35);
    eyeL.scale.set(1.08, 0.92, 0.52);
    const eyeR = this.mesh(new T.SphereGeometry(0.115, 14, 10), amberEye, 0.25, 0.72, -1.35);
    eyeR.scale.set(1.08, 0.92, 0.52);
    const eyeRingL = this.mesh(new T.TorusGeometry(0.12, 0.020, 6, 20), gold, -0.25, 0.72, -1.38);
    eyeRingL.rotation.y = 0.22;
    const eyeRingR = this.mesh(new T.TorusGeometry(0.12, 0.020, 6, 20), gold, 0.25, 0.72, -1.38);
    eyeRingR.rotation.y = -0.22;
    // Lower chin landing spotlight at A_lamp line (0, 0.40, -1.36)
    const chinLamp = this.mesh(new T.SphereGeometry(0.11, 12, 10), cyanGlow, 0, 0.42, -1.34);
    chinLamp.scale.set(1.0, 0.85, 0.55);
    const chinRing = this.mesh(new T.TorusGeometry(0.115, 0.02, 6, 18), gold, 0, 0.42, -1.36);
    g.add(eyeL, eyeR, eyeRingL, eyeRingR, chinLamp, chinRing);

    // 3 Delicate Golden Kitty Whiskers on each cheek!
    for (const side of [-1, 1]) {
      for (let w = 0; w < 3; w++) {
        const wh = this.mesh(new T.CylinderGeometry(0.008, 0.004, 0.34, 6).rotateZ(Math.PI / 2), gold, side * 0.54, 0.62 - w * 0.055, -1.16 + w * 0.03);
        wh.rotation.y = side * (-0.38 - w * 0.06);
        wh.rotation.z = side * (0.12 - w * 0.12);
        g.add(wh);
      }
    }

    // Spinning Nose Twin-Star Crystal Spinner (exact heli.glb nose_spin = 0, 0.64, -1.485!)
    const noseG = new T.Group();
    noseG.position.set(0, 0.64, -1.485);
    const noseStar = this.mkStarGeo(0.145, 0.145, 0.32, 0.035);
    const nS2 = this.mesh(noseStar, pinkGlow, 0, 0, -0.01);
    nS2.rotation.z = Math.PI / 4;
    noseG.add(
      this.mesh(noseStar, cyanGlow, 0, 0, 0.012),
      nS2,
      this.mesh(new T.SphereGeometry(0.055, 10, 8), gold, 0, 0, 0.025)
    );
    this.noseG = noseG;
    g.add(noseG);

    // 3. Iridescent Bubble Windshield & Giant Sculpted Cat Ears on Cockpit Cowl!
    const ws = this.mesh(
      new T.CylinderGeometry(0.46, 0.56, 0.34, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76),
      glass, 0, 0.96, -0.35
    );
    ws.renderOrder = 2;
    const wsRimTop = this.mesh(new T.TorusGeometry(0.47, 0.022, 6, 20, Math.PI * 0.76).rotateX(Math.PI / 2).rotateY(Math.PI * 0.12), gold, 0, 1.13, -0.35);
    const wsRimBot = this.mesh(new T.TorusGeometry(0.56, 0.026, 6, 20, Math.PI * 0.76).rotateX(Math.PI / 2).rotateY(Math.PI * 0.12), gold, 0, 0.80, -0.35);
    g.add(ws, wsRimTop, wsRimBot);

    const earL = this.mkCatEar(0.95, peri, sakura);
    earL.position.set(-0.42, 1.00, -0.78);
    earL.rotation.set(-0.18, 0.24, 0.32);
    const earR = this.mkCatEar(0.95, peri, sakura);
    earR.position.set(0.42, 1.00, -0.78);
    earR.rotation.set(-0.18, -0.24, -0.32);
    g.add(earL, earR);

    // 4. Open Plush Kitty Cockpit: Velvet Seat + Cat-Ear Headrest + Glowing Star Dashboard + Star Yoke!
    const seatCush = this.mesh(new T.BoxGeometry(0.56, 0.12, 0.52), sakura, 0, 0.60, -0.28);
    const seatBack = this.mesh(new T.BoxGeometry(0.54, 0.54, 0.11), lavender, 0, 0.90, 0.06);
    const sbEarL = this.mkCatEar(0.38, peri, sakura);
    sbEarL.position.set(-0.18, 1.15, 0.06); sbEarL.rotation.z = 0.22;
    const sbEarR = this.mkCatEar(0.38, peri, sakura);
    sbEarR.position.set(0.18, 1.15, 0.06); sbEarR.rotation.z = -0.22;
    // Dashboard & 3 glowing crystal flight dials
    g.add(
      seatCush, seatBack, sbEarL, sbEarR,
      this.mesh(new T.BoxGeometry(0.62, 0.18, 0.14), indigo, 0, 0.80, -0.68),
      this.mesh(new T.CylinderGeometry(0.055, 0.055, 0.02, 12).rotateX(Math.PI / 2), cyanGlow, -0.16, 0.81, -0.605),
      this.mesh(new T.CylinderGeometry(0.060, 0.060, 0.02, 12).rotateX(Math.PI / 2), gold, 0, 0.82, -0.605),
      this.mesh(new T.CylinderGeometry(0.055, 0.055, 0.02, 12).rotateX(Math.PI / 2), pinkGlow, 0.16, 0.81, -0.605)
    );

    // Steering Yoke at exact heli.glb yoke position (0, 0.945, -0.612)!
    const yoke = new T.Group();
    yoke.position.set(0, 0.945, -0.612);
    yoke.rotation.x = -0.30;
    yoke.add(
      this.mesh(new T.TorusGeometry(0.135, 0.022, 8, 22), gold),
      this.mesh(this.mkStarGeo(0.055, 0.055, 0.34, 0.02), cyanGlow, 0, 0, 0.01),
      this.mesh(new T.CylinderGeometry(0.018, 0.018, 0.13, 6), gold, 0, -0.065, 0)
    );
    const yEarL = this.mkCatEar(0.18, peri, sakura); yEarL.position.set(-0.085, 0.115, 0); yEarL.rotation.z = 0.35;
    const yEarR = this.mkCatEar(0.18, peri, sakura); yEarR.position.set(0.085, 0.115, 0); yEarR.rotation.z = -0.35;
    yoke.add(yEarL, yEarR);
    this.yoke = yoke;
    this.yokeQ = yoke.quaternion.clone();
    g.add(yoke);

    // 5. Swept Starlight Fairy-Cat Wings & Glowing Cyan/Pink Wingtip Star-Thrusters!
    const wingShape = new T.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(0.45, 0.12, 0.98, 0.36);
    wingShape.quadraticCurveTo(0.78, -0.06, 0.42, -0.18);
    wingShape.lineTo(0, -0.22);
    wingShape.closePath();
    const wingGeo = new T.ExtrudeGeometry(wingShape, {
      depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1
    });
    wingGeo.rotateX(Math.PI / 2);

    const wStar = this.mkStarGeo(0.12, 0.12, 0.32, 0.03);
    for (const side of [-1, 1]) {
      const wg = new T.Group();
      wg.position.set(side * 0.56, 0.72, 0.24);
      const wm = this.mesh(wingGeo, peri);
      if (side < 0) wm.scale.x = -1;
      const tipMat = side < 0 ? cyanGlow : pinkGlow;
      // Glowing crystal thruster pod at the wingtip (emits flight stardust trail!)
      const pod = new T.Group();
      pod.position.set(side * 0.92, 0.04, 0.22);
      pod.add(
        this.mesh(new T.CapsuleGeometry(0.075, 0.24, 8, 12).rotateX(Math.PI / 2), indigo),
        this.mesh(new T.TorusGeometry(0.082, 0.018, 6, 16), gold, 0, 0, -0.10),
        this.mesh(new T.TorusGeometry(0.082, 0.018, 6, 16), gold, 0, 0, 0.12),
        this.mesh(new T.SphereGeometry(0.072, 10, 8), tipMat, 0, 0, 0.16),
        this.mesh(wStar, tipMat, 0, 0.12, 0)
      );
      wg.add(wm, pod);
      g.add(wg);
      if (side < 0) this.wingL = pod;
      else this.wingR = pod;
    }

    // 6. Twin Arched Golden Mast & 6-Blade Cyan/Pink Crystal Star-Rotor (exact rotor_main = 0, 2.15, +0.30!)
    for (const side of [-1, 1]) {
      const mCurve = new T.CatmullRomCurve3([
        new T.Vector3(side * 0.44, 0.94, 0.44),
        new T.Vector3(side * 0.36, 1.56, 0.38),
        new T.Vector3(side * 0.08, 2.06, 0.30)
      ]);
      g.add(this.mesh(new T.TubeGeometry(mCurve, 14, 0.042, 8, false), gold));
    }
    g.add(
      this.mesh(new T.CylinderGeometry(0.11, 0.14, 0.18, 14), indigo, 0, 2.04, 0.30),
      this.mesh(new T.TorusGeometry(0.14, 0.025, 6, 18).rotateX(Math.PI / 2), gold, 0, 2.08, 0.30)
    );

    const rotorG = new T.Group();
    rotorG.position.set(0, 2.15, 0.30);
    // Star-blade ExtrudeGeometry
    const bladeShape = new T.Shape();
    bladeShape.moveTo(0, -0.045);
    bladeShape.quadraticCurveTo(0.85, -0.14, 1.72, -0.06);
    bladeShape.quadraticCurveTo(1.90, 0, 1.72, 0.06);
    bladeShape.quadraticCurveTo(0.85, 0.14, 0, 0.045);
    bladeShape.closePath();
    const bladeGeo = new T.ExtrudeGeometry(bladeShape, {
      depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1
    });
    bladeGeo.rotateX(Math.PI / 2);

    rotorG.add(
      this.mesh(new T.SphereGeometry(0.15, 14, 10), gold, 0, 0.04, 0),
      this.mesh(this.mkStarGeo(0.22, 0.22, 0.34, 0.04).rotateX(Math.PI / 2), cyanGlow, 0, 0.13, 0)
    );
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const bm = this.mesh(bladeGeo, i % 2 === 0 ? cyanGlow : pinkGlow, 0, 0.02, 0);
      bm.rotation.y = a;
      rotorG.add(bm);
    }
    this.rotorG = rotorG;
    g.add(rotorG);

    // Holographic Cyan-Pink Twin-Star Main Rotor Blur Disc
    const discMat = plain(new T.MeshLambertMaterial({
      map: this.makeRotorBlurTex(false),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: T.DoubleSide
    }));
    const disc = new T.Mesh(new T.CircleGeometry(1.92, 40).rotateX(-Math.PI / 2), discMat);
    disc.position.set(0, 2.17, 0.30);
    disc.renderOrder = 3;
    disc.visible = false;
    this.disc = disc;
    g.add(disc);

    // 7. Curved Kitty-Tail Boom, Sakura Ribbon Bow, Star Bulbs, Hanging Cat Bell & Star Tail Rotor!
    const tailCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, 0.78, 0.88),
      new T.Vector3(0, 0.86, 1.55),
      new T.Vector3(0, 1.02, 2.25),
      new T.Vector3(0, 1.24, 2.74)
    ]);
    g.add(
      this.mesh(new T.TubeGeometry(tailCurve, 22, 0.105, 12, false), peri),
      this.mesh(new T.TorusGeometry(0.14, 0.024, 6, 18), gold, 0, 0.80, 1.02),
      // Cute sakura ribbon bow at the base of the kitty tail!
      this.mesh(new T.SphereGeometry(0.11, 10, 8), sakura, -0.15, 0.94, 1.05),
      this.mesh(new T.SphereGeometry(0.11, 10, 8), sakura, 0.15, 0.94, 1.05),
      this.mesh(new T.SphereGeometry(0.065, 8, 8), gold, 0, 0.92, 1.06)
    );
    g.children[g.children.length - 3].scale.set(1.3, 0.72, 0.55);
    g.children[g.children.length - 2].scale.set(1.3, 0.72, 0.55);

    // 3 glowing alternating cyan/pink/gold star bulbs along the tail spine
    const tailBulbs = [[1.42, 0.98, cyanGlow], [1.78, 1.05, pinkGlow], [2.14, 1.15, gold]];
    for (const [tz, ty, mat] of tailBulbs) {
      g.add(this.mesh(new T.SphereGeometry(0.055, 10, 8), mat, 0, ty, tz));
    }

    // Crescent tail fin + golden cat bell dangling beneath the tail!
    const fin = this.mesh(new T.BoxGeometry(0.06, 0.58, 0.34), indigo, 0, 1.38, 2.70);
    fin.rotation.x = -0.22;
    const stab = this.mesh(new T.BoxGeometry(0.92, 0.045, 0.24), peri, 0, 1.05, 2.38);
    const finStar = this.mesh(this.mkStarGeo(0.13, 0.16, 0.32, 0.03), cyanGlow, 0, 1.72, 2.74);
    const tailBell = this.mkCatBell(0.92, gold, indigo);
    tailBell.position.set(0, 0.98, 2.76);
    g.add(fin, stab, finStar, tailBell);

    // Spinning Tail Star Rotor (exact rotor_tail = 0.09, 1.12, +2.66!)
    const tailG = new T.Group();
    tailG.position.set(0.12, 1.16, 2.66);
    const tStar = this.mkStarGeo(0.30, 0.30, 0.24, 0.025);
    tStar.rotateY(Math.PI / 2);
    tailG.add(
      this.mesh(tStar, pinkGlow),
      this.mesh(new T.SphereGeometry(0.055, 8, 8), gold)
    );
    this.tailG = tailG;
    g.add(tailG);

    const tdiscMat = plain(new T.MeshLambertMaterial({
      map: this.makeRotorBlurTex(true),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: T.DoubleSide
    }));
    const tdisc = new T.Mesh(new T.CircleGeometry(0.34, 24).rotateY(Math.PI / 2), tdiscMat);
    tdisc.position.set(0.14, 1.16, 2.66);
    tdisc.renderOrder = 3;
    tdisc.visible = false;
    this.tdisc = tdisc;
    g.add(tdisc);

    // 8. Golden Star-Runner Landing Skids with Glowing Hover-Crystal Pads (x = ±0.52, y = 0..0.38!)
    for (const side of [-1, 1]) {
      const sx = side * 0.52;
      const skidCurve = new T.CatmullRomCurve3([
        new T.Vector3(sx, 0.24, -1.28),
        new T.Vector3(sx, 0.055, -0.95),
        new T.Vector3(sx, 0.055, 0.85),
        new T.Vector3(sx, 0.14, 1.08)
      ]);
      g.add(
        this.mesh(new T.TubeGeometry(skidCurve, 18, 0.036, 8, false), gold),
        // Twin angled struts connecting fuselage to skids
        this.mesh(new T.CylinderGeometry(0.028, 0.028, 0.44, 8), indigo, side * 0.44, 0.26, -0.52),
        this.mesh(new T.CylinderGeometry(0.028, 0.028, 0.44, 8), indigo, side * 0.44, 0.26, 0.42),
        // Glowing hover crystal strips along the runners
        this.mesh(new T.BoxGeometry(0.045, 0.028, 0.92), side < 0 ? cyanGlow : pinkGlow, sx, 0.028, -0.05),
        this.mesh(new T.SphereGeometry(0.055, 8, 8), side < 0 ? cyanGlow : pinkGlow, sx, 0.25, -1.30)
      );
      g.children[g.children.length - 4].rotation.z = side * 0.34;
      g.children[g.children.length - 3].rotation.z = side * 0.34;
    }

    g.visible = false;
    this.root = g;
    return this;
  }

  update(dt, time, heli) {
    if (!this.root || !this.root.visible) return;
    const g = this.game;
    const driven = heli.driven;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;

    // Sync rotor, tail star, nose crystal & steering yoke!
    this.rotorG.rotation.y = heli.ang;
    this.tailG.rotation.x = heli.ang * 1.9;
    this.noseG.rotation.z = heli.spin || 0;

    const h = Math.max(0, Math.min(1, (heli.rotor - 0.45) / 0.35));
    const hs = h * h * (3 - 2 * h);
    this.disc.visible = this.tdisc.visible = hs > 0.01;
    this.disc.material.opacity = 0.88 * hs;
    this.tdisc.material.opacity = 0.82 * hs;
    this.disc.rotation.y = time * 2.6;
    this.tdisc.rotation.x = time * 4.2;

    if (this.yoke && this.yokeQ) {
      this.yoke.quaternion.copy(this.yokeQ).multiply(
        heli._q.setFromAxisAngle(heli._v.set(0, 0, 1), heli.wheel || 0)
      );
    }

    // Emissive glow breathes & intensifies when flying or at night
    const power = driven ? 1.0 : 0.45 + 0.55 * lamps;
    const pulse = 0.92 + 0.08 * Math.sin(time * 4.2);
    for (const em of this.emissives) {
      em.mat.emissiveIntensity = (em.base + (em.active - em.base) * power) * pulse;
    }

    // Twin-star cyan & sakura-pink wingtip stardust trails while airborne or spooling up!
    if (dt > 0 && heli.rotor > 0.45 && (driven || !heli.landed)) {
      const rate = !heli.landed ? 22 + Math.abs(heli.v) * 2.2 : 8;
      this.trailAcc += dt * rate;
      while (this.trailAcc >= 1) {
        this.trailAcc -= 1;
        this.wingL.getWorldPosition(this._wL);
        this.wingR.getWorldPosition(this._wR);
        // Left wingtip -> Gemini Cyan stardust
        g.puffs.spawn(
          this._wL.x, this._wL.y, this._wL.z,
          (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4,
          0.09 + Math.random() * 0.05, 0.88, 0.48 + Math.random() * 0.25,
          0.24, 0.90, 1.0, 0.3, 1.2
        );
        // Right wingtip -> Gemini Sakura-Pink stardust
        g.puffs.spawn(
          this._wR.x, this._wR.y, this._wR.z,
          (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4,
          0.09 + Math.random() * 0.05, 0.88, 0.48 + Math.random() * 0.25,
          1.0, 0.46, 0.90, 0.3, 1.2
        );
      }
    }
  }
}
