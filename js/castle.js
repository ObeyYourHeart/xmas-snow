// Claude 的太阳花白雪城堡 (Claude's Ivory, Gold & Terracotta Sunflower Château)
// Replaces the rustic log cabin exterior & interior while preserving 100% of anchors,
// colliders, platforms, chimney smoke, swinging doorbell, decor crate, roof Clawd perch,
// window lights, and all interior interactions.

import { makeCrispWindowTex } from "./archcraft.js?v=11251205";

export class ClaudeCastle {
  constructor(game, helpers) {
    this.game = game;
    this.wrapMat = helpers.mat;
    this.THREE = game.THREE;

    this.ext = null;
    this.bell = null;
    this.interior = null;

    this.flags = [];
    this.beacon = null;
    this.roseMat = null;
    this.lanternGlows = [];
    this.recordMesh = null;
    this.hearthEmbers = null;
    this.chandelier = null;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  // === Procedural Château Textures ===
  makeIvoryStoneTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    c.fillStyle = "#efeae0";
    c.fillRect(0, 0, 512, 512);
    const rows = 8, rh = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * 64;
      for (let col = -1; col < 5; col++) {
        const x = col * 128 + off, y = r * rh;
        const v = 240 + ((r * 19 + col * 37) % 13) - 6;
        c.fillStyle = `rgb(${v},${v - 4},${v - 11})`;
        c.fillRect(x + 2, y + 2, 124, rh - 4);
        c.fillStyle = "rgba(255,255,255,0.28)";
        c.fillRect(x + 2, y + 2, 124, 3);
        c.fillStyle = "rgba(145,130,110,0.22)";
        c.fillRect(x + 2, y + rh - 4, 124, 2);
      }
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(2.4, 1.5);
    tex.anisotropy = 8;
    return tex;
  }

  makeRoofTileTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    c.fillStyle = "#b54816";
    c.fillRect(0, 0, 512, 512);
    const rows = 10, rh = 512 / rows, cw = 64;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (cw / 2);
      for (let col = -1; col <= 8; col++) {
        const cx = col * cw + off + cw / 2;
        const cy = r * rh;
        const shade = ((r * 23 + col * 17) & 7) * 3 - 10;
        c.fillStyle = `rgb(${212 + shade},${94 + Math.round(shade * 0.6)},${38 + Math.round(shade * 0.3)})`;
        c.beginPath();
        c.arc(cx, cy + rh * 0.45, cw * 0.50, 0, Math.PI, false);
        c.lineTo(cx - cw * 0.50, cy);
        c.lineTo(cx + cw * 0.50, cy);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(92,30,8,0.42)";
        c.lineWidth = 2.5;
        c.stroke();
        // Delicate winter frost dust along bottom curve
        if ((r + col) % 3 === 0) {
          c.strokeStyle = "rgba(248,246,242,0.34)";
          c.lineWidth = 3;
          c.beginPath();
          c.arc(cx, cy + rh * 0.45, cw * 0.44, 0.25 * Math.PI, 0.75 * Math.PI, false);
          c.stroke();
        }
      }
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(3, 2);
    tex.anisotropy = 8;
    return tex;
  }

  makeRoseWindowTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    const cx = 256, cy = 256;
    c.fillStyle = "#2b1912";
    c.fillRect(0, 0, 512, 512);

    const bg = c.createRadialGradient(cx, cy, 20, cx, cy, 240);
    bg.addColorStop(0, "#fff8d6");
    bg.addColorStop(0.42, "#ffb34a");
    bg.addColorStop(0.76, "#e06422");
    bg.addColorStop(1, "#5c2410");
    c.fillStyle = bg;
    c.beginPath(); c.arc(cx, cy, 242, 0, Math.PI * 2); c.fill();

    // 12 Claude Sunflower Stained-Glass Petals
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.save();
      c.translate(cx, cy);
      c.rotate(a);
      c.fillStyle = i % 2 === 0 ? "#ff9838" : "#ffbc52";
      c.strokeStyle = "#261a16";
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(0, -68);
      c.quadraticCurveTo(36, -135, 0, -222);
      c.quadraticCurveTo(-36, -135, 0, -68);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }
    // Center warm ivory-gold medallion & dark lead rings
    c.fillStyle = "#fff5cc";
    c.strokeStyle = "#261a16";
    c.lineWidth = 8;
    c.beginPath(); c.arc(cx, cy, 72, 0, Math.PI * 2); c.fill(); c.stroke();
    c.lineWidth = 10;
    c.beginPath(); c.arc(cx, cy, 236, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "#f4cb64";
    c.lineWidth = 6;
    c.beginPath(); c.arc(cx, cy, 224, 0, Math.PI * 2); c.stroke();

    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  makeBannerTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = "#c94f1c";
    c.fillRect(0, 0, 128, 256);
    c.strokeStyle = "#f5cb62";
    c.lineWidth = 8;
    c.strokeRect(10, 10, 108, 236);
    // Golden Claude Sunflower Crest in center
    const cx = 64, cy = 112;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.save(); c.translate(cx, cy); c.rotate(a);
      c.fillStyle = "#f9d678";
      c.beginPath();
      c.ellipse(0, -28, 6, 15, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.fillStyle = "#fff4dc";
    c.beginPath(); c.arc(cx, cy, 14, 0, Math.PI * 2); c.fill();
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  makeCarpetTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    const cx = 256, cy = 256;
    c.fillStyle = "#c8521e";
    c.fillRect(0, 0, 512, 512);
    c.fillStyle = "#f4ecdf";
    c.beginPath(); c.arc(cx, cy, 236, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#d96428";
    c.beginPath(); c.arc(cx, cy, 212, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#f6ce68";
    c.lineWidth = 10;
    c.beginPath(); c.arc(cx, cy, 198, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, 165, 0, Math.PI * 2); c.stroke();
    // Sunflower motif in center of rug
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.save(); c.translate(cx, cy); c.rotate(a);
      c.fillStyle = i % 2 === 0 ? "#fde7b0" : "#f5c55a";
      c.beginPath();
      c.moveTo(0, -45);
      c.quadraticCurveTo(22, -98, 0, -148);
      c.quadraticCurveTo(-22, -98, 0, -45);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.fillStyle = "#fff6e6";
    c.beginPath(); c.arc(cx, cy, 52, 0, Math.PI * 2); c.fill();
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  makeParquetTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    c.fillStyle = "#b88450";
    c.fillRect(0, 0, 512, 512);
    const cols = 8, rows = 16, cw = 512 / cols, rh = 512 / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const v = ((r * 13 + col * 29) % 19) - 9;
        c.fillStyle = `rgb(${182 + v},${132 + Math.round(v * 0.7)},${82 + Math.round(v * 0.5)})`;
        c.fillRect(col * cw + 1, r * rh + 1, cw - 2, rh - 2);
      }
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(3, 2.5);
    tex.anisotropy = 8;
    return tex;
  }

  makeMats() {
    const T = this.THREE;
    const gm = this.game.mats;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (r, g, b, rough = 0.5, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: new T.Color(r, g, b), roughness: rough, ...extra }));

    const stoneTex = this.makeIvoryStoneTex();
    const roofTex = this.makeRoofTileTex();
    const roseTex = this.makeRoseWindowTex();
    const bannerTex = this.makeBannerTex();

    // Upgrade global M_window from blurry window_c.jpg to razor-sharp 512x768 leaded-glass cozy window!
    const crispCozyTex = makeCrispWindowTex(T, this.game.renderer, "cozy");
    const crispNightTex = makeCrispWindowTex(T, this.game.renderer, "nightsky");
    if (gm && gm.M_window) {
      gm.M_window.map = crispCozyTex;
      gm.M_window.emissiveMap = crispCozyTex;
      gm.M_window.color && gm.M_window.color.setHex(0xffffff);
      gm.M_window.emissive && gm.M_window.emissive.setRGB(0.58, 0.50, 0.38);
      gm.M_window.roughness = 0.16;
      gm.M_window.needsUpdate = true;
    }
    const nightPaneMat = plain(new T.MeshStandardMaterial({
      map: crispNightTex,
      emissiveMap: crispNightTex,
      emissive: new T.Color(0.85, 0.94, 1.0),
      emissiveIntensity: 0.78,
      roughness: 0.14,
      metalness: 0.06
    }));

    this.roseMat = plain(new T.MeshStandardMaterial({
      map: roseTex,
      emissive: new T.Color(1.0, 0.62, 0.20),
      emissiveMap: roseTex,
      emissiveIntensity: 0.72,
      roughness: 0.25
    }));

    const warmLantern = plain(new T.MeshStandardMaterial({
      color: new T.Color(1.0, 0.88, 0.64),
      emissive: new T.Color(1.0, 0.60, 0.20),
      emissiveIntensity: 1.25,
      roughness: 0.22
    }));
    this.lanternGlows.push(warmLantern);

    const hearthEmbers = plain(new T.MeshStandardMaterial({
      color: new T.Color(0.95, 0.45, 0.12),
      emissive: new T.Color(0.92, 0.26, 0.04),
      emissiveIntensity: 1.35,
      roughness: 0.42
    }));
    this.hearthEmbers = hearthEmbers;

    this.m = {
      stone: plain(new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.74, metalness: 0.04 })),
      marble: std(0.96, 0.94, 0.90, 0.34, { metalness: 0.06 }),
      intMarble: std(0.76, 0.72, 0.66, 0.56, { metalness: 0.04 }),
      creamWall: std(0.74, 0.67, 0.58, 0.86, { metalness: 0.0 }),
      plinth: std(0.84, 0.81, 0.77, 0.82, { metalness: 0.04 }),
      roof: plain(new T.MeshStandardMaterial({ map: roofTex, roughness: 0.48, metalness: 0.12 })),
      terracotta: std(0.76, 0.25, 0.06, 0.42, { metalness: 0.08 }),
      velvet: std(0.68, 0.20, 0.06, 0.84, { metalness: 0.02 }),
      apricot: std(0.84, 0.48, 0.20, 0.62, { metalness: 0.02 }),
      obsidian: std(0.11, 0.12, 0.16, 0.42, { metalness: 0.42 }),
      walnut: std(0.24, 0.14, 0.08, 0.56, { metalness: 0.06 }),
      gold: std(0.92, 0.74, 0.36, 0.26, { metalness: 0.84 }),
      snow: std(0.97, 0.98, 1.0, 0.76, { metalness: 0.0 }),
      intSnow: std(0.82, 0.80, 0.78, 0.82, { metalness: 0.0 }),
      pine: std(0.08, 0.34, 0.15, 0.74, { metalness: 0.0 }),
      hollyRed: std(0.78, 0.08, 0.09, 0.35, { metalness: 0.06 }),
      window: gm && gm.M_window ? gm.M_window : warmLantern,
      nightPane: nightPaneMat,
      lantern: warmLantern,
      embers: hearthEmbers,
      rose: this.roseMat,
      banner: plain(new T.MeshStandardMaterial({ map: bannerTex, roughness: 0.65, side: T.DoubleSide })),
      carpet: plain(new T.MeshStandardMaterial({ map: this.makeCarpetTex(), roughness: 0.88 })),
      parquet: plain(new T.MeshStandardMaterial({ map: this.makeParquetTex(), roughness: 0.60, metalness: 0.04 }))
    };
  }

  // Sculpted 12-petal Claude Sunflower Emblem (matching Claude 之剑's sunflower motif!)
  mkSunflower(scale = 1, glowCenter = false) {
    const T = this.THREE;
    const g = new T.Group();
    const petalShape = new T.Shape();
    petalShape.moveTo(-0.07, 0);
    petalShape.quadraticCurveTo(-0.18, 0.32, -0.08, 0.54);
    petalShape.quadraticCurveTo(0, 0.66, 0.08, 0.54);
    petalShape.quadraticCurveTo(0.18, 0.32, 0.07, 0);
    petalShape.closePath();
    const pGeo = new T.ExtrudeGeometry(petalShape, {
      depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 6
    });
    pGeo.translate(0, 0, -0.02);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pm = this.mesh(pGeo, i % 2 === 0 ? this.m.terracotta : this.m.gold);
      pm.rotation.z = a;
      pm.position.set(-Math.sin(a) * 0.14, Math.cos(a) * 0.14, 0);
      g.add(pm);
    }
    const core = this.mesh(new T.SphereGeometry(0.22, 14, 10), glowCenter ? this.m.lantern : this.m.gold);
    core.scale.set(1, 1, 0.55);
    const ring = new T.TorusGeometry(0.23, 0.032, 8, 22);
    g.add(core, this.mesh(ring, this.m.gold));
    g.scale.setScalar(scale);
    return g;
  }

  // Ornate Gothic Arched Castle Window (crisp 512x768 leaded-glass pane + deep recessed stone/brass trim!)
  mkGothicWindow(w = 1.05, h = 1.38) {
    const T = this.THREE;
    const g = new T.Group();
    // Single planar arched glass Shape with clean 0..1 UVs (eliminates curved-cylinder UV blur!)
    const rectH = h * 0.72;
    const r = w * 0.5;
    const sh = new T.Shape();
    sh.moveTo(-r, -h * 0.5);
    sh.lineTo(r, -h * 0.5);
    sh.lineTo(r, -h * 0.5 + rectH);
    sh.absarc(0, -h * 0.5 + rectH, r, 0, Math.PI, false);
    sh.closePath();
    const paneGeo = new T.ShapeGeometry(sh, 18);
    const uv = paneGeo.attributes.uv;
    const pos = paneGeo.attributes.position;
    const totalH = rectH + r;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) + r) / w, (pos.getY(i) + h * 0.5) / totalH);
    }
    uv.needsUpdate = true;

    const archY = -h * 0.5 + rectH;
    g.add(
      // Recessed dark backing box + crisp planar arched window glass cleanly seated at z = +0.025
      this.mesh(new T.BoxGeometry(w + 0.04, rectH + 0.04, 0.04), this.m.obsidian, 0, -h * 0.5 + rectH * 0.5, 0),
      this.mesh(paneGeo, this.m.window, 0, 0, 0.032),
      // Carved ivory outer pilasters, sill corbels & stone sill
      this.mesh(new T.BoxGeometry(0.14, rectH + 0.06, 0.16), this.m.marble, -w / 2 - 0.06, -h * 0.5 + rectH * 0.5, 0.04),
      this.mesh(new T.BoxGeometry(0.14, rectH + 0.06, 0.16), this.m.marble, w / 2 + 0.06, -h * 0.5 + rectH * 0.5, 0.04),
      this.mesh(new T.BoxGeometry(w + 0.36, 0.13, 0.24), this.m.marble, 0, -h * 0.54, 0.07),
      this.mesh(new T.BoxGeometry(0.11, 0.16, 0.16), this.m.gold, -w * 0.36, -h * 0.66, 0.06),
      this.mesh(new T.BoxGeometry(0.11, 0.16, 0.16), this.m.gold, w * 0.36, -h * 0.66, 0.06),
      // Snow cap on window sill
      this.mesh(new T.BoxGeometry(w + 0.30, 0.06, 0.20), this.m.snow, 0, -h * 0.455, 0.09),
      // Golden Gothic arch hood molding
      this.mesh(new T.TorusGeometry(w * 0.54, 0.065, 8, 22, Math.PI), this.m.gold, 0, archY, 0.055),
      // Protruding 3D dark obsidian iron mullions cleanly in front of crisp glass
      this.mesh(new T.BoxGeometry(0.042, totalH * 0.96, 0.05), this.m.obsidian, 0, -h * 0.5 + totalH * 0.48, 0.055),
      this.mesh(new T.BoxGeometry(w * 0.96, 0.042, 0.05), this.m.obsidian, 0, -h * 0.12, 0.055),
      this.mesh(new T.BoxGeometry(w * 0.94, 0.042, 0.05), this.m.obsidian, 0, archY, 0.055)
    );
    return g;
  }

  // Fairy-Tale Corner Turret with Steep Terracotta Spire & Fluttering Pennant Flag!
  mkTurret(r, shaftH, spireH, phase) {
    const T = this.THREE;
    const g = new T.Group();
    // Base plinth + ivory stone cylindrical tower + gilded corbel balcony
    g.add(
      this.mesh(new T.CylinderGeometry(r * 1.07, r * 1.12, 0.45, 20), this.m.plinth, 0, 0.225, 0),
      this.mesh(new T.CylinderGeometry(r, r * 1.03, shaftH, 20), this.m.stone, 0, 0.45 + shaftH / 2, 0),
      this.mesh(new T.TorusGeometry(r * 1.03, 0.06, 8, 24).rotateX(Math.PI / 2), this.m.gold, 0, 0.45 + shaftH * 0.52, 0),
      // Corbelled upper turret crown
      this.mesh(new T.CylinderGeometry(r * 1.14, r * 1.02, 0.34, 20), this.m.marble, 0, 0.45 + shaftH + 0.17, 0),
      this.mesh(new T.TorusGeometry(r * 1.15, 0.065, 8, 24).rotateX(Math.PI / 2), this.m.gold, 0, 0.45 + shaftH + 0.34, 0)
    );
    const roofY = 0.45 + shaftH + 0.34;
    // Steep conical terracotta-orange château spire + snow frost collar + golden finial spire!
    g.add(
      this.mesh(new T.ConeGeometry(r * 1.24, spireH, 20), this.m.roof, 0, roofY + spireH / 2, 0),
      this.mesh(new T.TorusGeometry(r * 1.20, 0.08, 8, 24).rotateX(Math.PI / 2), this.m.snow, 0, roofY + 0.08, 0),
      this.mesh(new T.ConeGeometry(r * 0.34, spireH * 0.28, 16), this.m.snow, 0, roofY + spireH * 0.86, 0),
      this.mesh(new T.CylinderGeometry(0.032, 0.038, 0.85, 8), this.m.gold, 0, roofY + spireH + 0.40, 0),
      this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.gold, 0, roofY + spireH + 0.16, 0)
    );

    // Swallowtail pennant flag that waves in the winter breeze!
    const flagShape = new T.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(0.82, 0.14);
    flagShape.lineTo(0.64, 0);
    flagShape.lineTo(0.82, -0.14);
    flagShape.closePath();
    const flagGeo = new T.ShapeGeometry(flagShape);
    const flag = new T.Mesh(flagGeo, this.m.terracotta);
    flag.material = this.wrapMat(new T.MeshStandardMaterial({
      color: new T.Color(0.84, 0.28, 0.06),
      roughness: 0.5,
      side: T.DoubleSide
    }), { key: "plain" });
    flag.position.set(0.03, roofY + spireH + 0.62, 0);
    flag.castShadow = false;
    g.add(flag);
    this.flags.push({ obj: flag, phase });

    // 3 glowing tall lancet turret windows around the upper shaft
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const wg = new T.Group();
      wg.position.set(Math.sin(a) * (r + 0.01), 0.45 + shaftH * 0.72, Math.cos(a) * (r + 0.01));
      wg.rotation.y = a;
      wg.add(
        this.mesh(new T.BoxGeometry(0.28, 0.62, 0.06), this.m.window, 0, 0, 0),
        this.mesh(new T.TorusGeometry(0.15, 0.035, 6, 12, Math.PI), this.m.gold, 0, 0.30, 0.02),
        this.mesh(new T.BoxGeometry(0.38, 0.06, 0.10), this.m.marble, 0, -0.32, 0.03)
      );
      g.add(wg);
    }
    return g;
  }

  // === PART A: CASTLE EXTERIOR ===
  buildExterior(wx, wy, wz) {
    const T = this.THREE;
    this.makeMats();

    const g = new T.Group();
    g.position.set(wx, wy, wz);

    // 1. Main Ivory-Marble Keep Body (x: ±3.8, z: ±3.0, y: 0..4.25)
    g.add(
      this.mesh(new T.BoxGeometry(7.72, 0.44, 6.12), this.m.plinth, 0, 0.22, 0),
      this.mesh(new T.BoxGeometry(7.60, 3.80, 6.00), this.m.stone, 0, 2.34, 0),
      // Champagne-gold horizontal château belt courses
      this.mesh(new T.BoxGeometry(7.76, 0.11, 6.16), this.m.gold, 0, 2.48, 0),
      this.mesh(new T.BoxGeometry(7.82, 0.14, 6.22), this.m.gold, 0, 4.22, 0)
    );

    // Crenellated Castle Parapet Merlons along front & back eaves (leave rear i=+2 open for the rooftop staircase gateway!)
    for (let i = -3; i <= 3; i++) {
      g.add(this.mesh(new T.BoxGeometry(0.54, 0.30, 0.22), this.m.marble, i * 1.04, 4.40, 2.98));
      if (i !== 2) {
        g.add(this.mesh(new T.BoxGeometry(0.54, 0.30, 0.22), this.m.marble, i * 1.04, 4.40, -2.98));
      }
    }

    // 2. Steep French-Château Terracotta Roof (y: 4.24..6.45) + Snow Blanket + Golden Crest!
    // Sloped trapezoidal/hipped palace roof (also gives clean perch at local (+1.6, +1.3) for roof Clawd!)
    const roofShape = new T.Shape();
    roofShape.moveTo(-3.25, 0);
    roofShape.lineTo(3.25, 0);
    roofShape.lineTo(1.15, 2.25);
    roofShape.lineTo(-1.15, 2.25);
    roofShape.closePath();
    const mainRoofGeo = new T.ExtrudeGeometry(roofShape, { depth: 7.72, bevelEnabled: false });
    mainRoofGeo.rotateY(Math.PI / 2);
    mainRoofGeo.translate(-3.86, 4.22, 0);
    g.add(this.mesh(mainRoofGeo, this.m.roof));

    // Fluffy winter snow blanket hugging the upper terracotta roof slope & ridge seamlessly
    const snowShape = new T.Shape();
    snowShape.moveTo(-2.15, 1.18);
    snowShape.lineTo(2.15, 1.18);
    snowShape.lineTo(1.18, 2.31);
    snowShape.lineTo(-1.18, 2.31);
    snowShape.closePath();
    const snowCapGeo = new T.ExtrudeGeometry(snowShape, { depth: 7.56, bevelEnabled: false });
    snowCapGeo.rotateY(Math.PI / 2);
    snowCapGeo.translate(-3.78, 4.22, 0);
    g.add(
      this.mesh(snowCapGeo, this.m.snow),
      // Gilded French Château Roof Ridge Cresting
      this.mesh(new T.BoxGeometry(7.2, 0.14, 0.12), this.m.gold, 0, 6.56, 0)
    );
    for (let i = -3; i <= 3; i++) {
      g.add(this.mesh(new T.SphereGeometry(0.09, 8, 8), this.m.gold, i * 1.05, 6.72, 0));
    }

    // 3. Soaring Central Sunflower Belfry Lantern Spire (y: 6.45..9.65)!
    const belfry = new T.Group();
    belfry.position.set(0, 6.42, 0);
    belfry.add(
      this.mesh(new T.CylinderGeometry(0.86, 0.96, 0.34, 8), this.m.marble, 0, 0.17, 0),
      this.mesh(new T.TorusGeometry(0.92, 0.055, 8, 20).rotateX(Math.PI / 2), this.m.gold, 0, 0.35, 0),
      // Warm glowing lantern core inside open golden columns
      this.mesh(new T.CylinderGeometry(0.46, 0.46, 0.92, 12), this.m.lantern, 0, 0.82, 0),
      this.mesh(new T.CylinderGeometry(0.92, 0.88, 0.22, 8), this.m.marble, 0, 1.38, 0),
      this.mesh(new T.ConeGeometry(0.98, 1.48, 8), this.m.roof, 0, 2.22, 0),
      this.mesh(new T.ConeGeometry(0.32, 0.46, 8), this.m.snow, 0, 2.72, 0),
      this.mesh(new T.CylinderGeometry(0.035, 0.045, 0.65, 8), this.m.gold, 0, 3.05, 0)
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      belfry.add(this.mesh(new T.CylinderGeometry(0.05, 0.05, 0.96, 6), this.m.gold, Math.cos(a) * 0.72, 0.84, Math.sin(a) * 0.72));
    }
    // Radiant Rotating Claude Sunflower Crown Beacon at the summit!
    const beacon = this.mkSunflower(1.05, true);
    beacon.position.set(0, 3.52, 0);
    this.beacon = beacon;
    belfry.add(beacon);
    g.add(belfry);

    // 4. Grand Front Pediment Dormer & Stained-Glass Claude Sunflower Rose Window!
    const dormer = new T.Group();
    dormer.position.set(0, 3.55, 3.06);
    const pedShape = new T.Shape();
    pedShape.moveTo(-1.42, 0);
    pedShape.lineTo(1.42, 0);
    pedShape.lineTo(0, 1.55);
    pedShape.closePath();
    const pedGeo = new T.ExtrudeGeometry(pedShape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
    pedGeo.translate(0, 0, -0.45);
    dormer.add(
      this.mesh(pedGeo, this.m.marble, 0, 0.62, 0),
      // Terracotta gable roof cap & snow trim
      this.mesh(new T.BoxGeometry(2.15, 0.14, 0.72), this.m.terracotta, -0.78, 1.48, -0.15),
      this.mesh(new T.BoxGeometry(2.15, 0.14, 0.72), this.m.terracotta, 0.78, 1.48, -0.15),
      // Stained-Glass Claude Sunflower Rose Window!
      this.mesh(new T.CylinderGeometry(0.76, 0.76, 0.12, 28).rotateX(Math.PI / 2), this.m.rose, 0, 0.68, 0.14),
      this.mesh(new T.TorusGeometry(0.78, 0.075, 10, 32), this.m.gold, 0, 0.68, 0.18)
    );
    dormer.children[1].rotation.z = 0.80;
    dormer.children[2].rotation.z = -0.80;
    const pedFinial = this.mkSunflower(0.55, true);
    pedFinial.position.set(0, 2.38, 0.08);
    dormer.add(pedFinial);
    g.add(dormer);

    // Twin Royal Sunflower Tapestry Banners draping along upper front facade
    for (const bx of [-2.45, 2.45]) {
      g.add(
        this.mesh(new T.CylinderGeometry(0.035, 0.035, 0.92, 8).rotateZ(Math.PI / 2), this.m.gold, bx, 3.92, 3.12),
        this.mesh(new T.PlaneGeometry(0.76, 1.38), this.m.banner, bx, 3.20, 3.12)
      );
    }

    // 5. Four Fairy-Tale Corner Turrets (clear of woodpile at +4.28, +1.70!) + solid turret colliders (zero clipping!)
    const tFL = this.mkTurret(0.86, 4.95, 2.85, 0.0); tFL.position.set(-3.78, 0, 2.98);
    const tFR = this.mkTurret(0.84, 4.70, 2.70, 1.4); tFR.position.set(3.78, 0, 2.98);
    const tBL = this.mkTurret(0.82, 4.45, 2.55, 2.8); tBL.position.set(-3.78, 0, -2.98);
    const tBR = this.mkTurret(0.82, 4.45, 2.55, 4.1); tBR.position.set(3.78, 0, -2.98);
    g.add(tFL, tFR, tBL, tBR);
    if (this.game && this.game.world && this.game.world.circles) {
      this.game.world.circles.push(
        { x: wx - 3.78, z: wz + 2.98, r: 0.90, top: 8.6 },
        { x: wx + 3.78, z: wz + 2.98, r: 0.88, top: 8.3 },
        { x: wx - 3.78, z: wz - 2.98, r: 0.86, top: 7.9 },
        { x: wx + 3.78, z: wz - 2.98, r: 0.86, top: 7.9 }
      );
    }

    // 6. Royal Stone Chimney Tower (exact A_smoke at +4.045, 6.80, -0.55!)
    g.add(
      this.mesh(new T.BoxGeometry(0.92, 6.72, 1.15), this.m.stone, 4.045, 3.36, -0.55),
      this.mesh(new T.BoxGeometry(1.06, 0.22, 1.30), this.m.marble, 4.045, 6.68, -0.55),
      this.mesh(new T.BoxGeometry(1.12, 0.08, 1.36), this.m.gold, 4.045, 6.80, -0.55),
      this.mesh(new T.BoxGeometry(0.68, 0.14, 0.88), this.m.obsidian, 4.045, 6.82, -0.55)
    );

    // 7. Four Glowing Gothic Arched Castle Windows aligned with A_win0..3!
    const w0 = this.mkGothicWindow(1.18, 1.44); w0.position.set(1.55, 1.84, 3.02);
    const w1 = this.mkGothicWindow(1.24, 1.46); w1.position.set(0, 1.84, -3.02); w1.rotation.y = Math.PI;
    const w2 = this.mkGothicWindow(1.18, 1.44); w2.position.set(-3.82, 1.85, 0); w2.rotation.y = -Math.PI / 2;
    const w3 = this.mkGothicWindow(1.04, 1.38); w3.position.set(3.82, 1.85, 1.52); w3.rotation.y = Math.PI / 2;
    // Extra upper rear balcony window for 360° polish
    const w1Top = this.mkGothicWindow(0.92, 1.05); w1Top.position.set(0, 3.42, -3.02); w1Top.rotation.y = Math.PI;
    g.add(w0, w1, w2, w3, w1Top);

    // 8. Grand Castle Entrance Porch Terrace (y = 0.38, z = 2.8..4.97) & Steps (x = -1.9..-0.5, z = 4.97..5.66)
    g.add(
      this.mesh(new T.BoxGeometry(7.44, 0.38, 2.20), this.m.marble, 0, 0.19, 3.92),
      // Gold edge molding recessed 5mm below marble top (zero Z-fighting with porch slab or carpet!)
      this.mesh(new T.BoxGeometry(7.56, 0.07, 2.30), this.m.gold, 0, 0.34, 3.92),
      // Wide stone entrance steps matching exact platform ramp
      this.mesh(new T.BoxGeometry(1.52, 0.25, 0.38), this.m.marble, -1.20, 0.125, 5.14),
      this.mesh(new T.BoxGeometry(1.56, 0.13, 0.36), this.m.marble, -1.20, 0.065, 5.48),
      // Royal Terracotta-Gold Carpet Runner cleanly layered above marble slab!
      this.mesh(new T.BoxGeometry(1.14, 0.016, 2.06), this.m.gold, -1.20, 0.390, 4.02),
      this.mesh(new T.BoxGeometry(1.04, 0.022, 2.00), this.m.terracotta, -1.20, 0.402, 4.02)
    );

    // Front Porch Arcade Columns aligned with A_swag0..4 (x = -3.5, -1.95, -0.45, +1.55, +3.5, z = 4.94)
    const swagX = [-3.5, -1.95, -0.45, 1.55, 3.5];
    for (const sx of swagX) {
      g.add(
        this.mesh(new T.BoxGeometry(0.28, 0.16, 0.28), this.m.marble, sx, 0.46, 4.90),
        this.mesh(new T.CylinderGeometry(0.105, 0.125, 1.84, 14), this.m.marble, sx, 1.44, 4.90),
        this.mesh(new T.TorusGeometry(0.135, 0.032, 6, 16).rotateX(Math.PI / 2), this.m.gold, sx, 2.30, 4.90)
      );
    }
    // Side porch pilasters
    for (const sx of [-3.52, 3.52]) {
      g.add(this.mesh(new T.CylinderGeometry(0.10, 0.12, 1.84, 12), this.m.marble, sx, 1.44, 3.92));
    }

    // Porch Roof Canopy & Gilded Entablature aligned with eaveBulbs (y = 2.345..2.52, z = 5.215)!
    g.add(
      this.mesh(new T.BoxGeometry(8.16, 0.16, 2.38), this.m.marble, 0, 2.40, 4.08),
      this.mesh(new T.BoxGeometry(8.22, 0.07, 0.10), this.m.gold, 0, 2.38, 5.24),
      // Sloped terracotta porch roof + winter snow layer
      this.mesh(new T.BoxGeometry(8.26, 0.14, 2.52), this.m.roof, 0, 2.74, 4.10),
      this.mesh(new T.BoxGeometry(8.10, 0.08, 2.32), this.m.snow, 0, 2.83, 4.10)
    );
    g.children[g.children.length - 2].rotation.x = 0.22;
    g.children[g.children.length - 1].rotation.x = 0.22;

    // Rear gilded eave cornice aligned with rear eaveBulbs (y = 2.52, z = -3.44)
    g.add(
      this.mesh(new T.BoxGeometry(8.24, 0.14, 0.56), this.m.marble, 0, 2.54, -3.22),
      this.mesh(new T.BoxGeometry(8.28, 0.06, 0.08), this.m.gold, 0, 2.52, -3.48)
    );

    // Ornate Marble Balustrade Railings (matching exact collider boxes!)
    const addRail = (x0, x1, z0, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const rot = Math.atan2(x1 - x0, z1 - z0);
      const rg = new T.Group();
      rg.position.set(mx, 0.38, mz);
      rg.rotation.y = rot;
      rg.add(
        this.mesh(new T.BoxGeometry(0.12, 0.09, len), this.m.marble, 0, 0.72, 0),
        this.mesh(new T.BoxGeometry(0.14, 0.04, len), this.m.gold, 0, 0.78, 0),
        this.mesh(new T.BoxGeometry(0.12, 0.08, len), this.m.marble, 0, 0.06, 0)
      );
      const cnt = Math.max(2, Math.round(len / 0.28));
      for (let i = 1; i < cnt; i++) {
        const tz = -len / 2 + (len * i) / cnt;
        rg.add(this.mesh(new T.CylinderGeometry(0.032, 0.042, 0.62, 8), this.m.marble, 0, 0.38, tz));
      }
      g.add(rg);
    };
    addRail(-3.52, -1.95, 4.86, 4.86);
    addRail(-0.45, 3.52, 4.86, 4.86);
    addRail(-3.52, -3.52, 3.05, 4.86);
    addRail(3.52, 3.52, 3.05, 4.86);

    // Golden orbs on staircase newel posts + twin petite courtyard entrance lanterns!
    for (const nx of [-1.95, -0.45]) {
      g.add(this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.gold, nx, 1.24, 4.90));
    }
    for (const lx of [-2.32, -0.08]) {
      g.add(
        this.mesh(new T.CylinderGeometry(0.14, 0.18, 0.24, 8), this.m.plinth, lx, 0.12, 5.72),
        this.mesh(new T.CylinderGeometry(0.045, 0.055, 1.48, 8), this.m.obsidian, lx, 0.96, 5.72),
        this.mesh(new T.CylinderGeometry(0.12, 0.09, 0.24, 6), this.m.lantern, lx, 1.78, 5.72),
        this.mesh(new T.ConeGeometry(0.17, 0.18, 6), this.m.gold, lx, 1.98, 5.72)
      );
    }

    // 9. Grand Gothic Arched Double Castle Front Door at A_door (-1.20, 0.38, +3.02)!
    const doorG = new T.Group();
    doorG.position.set(-1.20, 0.38, 3.03);
    doorG.add(
      // Carved stone portal frame & golden arch
      this.mesh(new T.BoxGeometry(1.52, 2.04, 0.18), this.m.marble, 0, 1.02, 0),
      this.mesh(new T.TorusGeometry(0.68, 0.09, 8, 22, Math.PI), this.m.gold, 0, 1.62, 0.06),
      // Rich dark walnut double doors + gold trim & sunflower knocker
      this.mesh(new T.BoxGeometry(1.18, 1.88, 0.10), this.m.walnut, 0, 0.94, 0.06),
      this.mesh(new T.BoxGeometry(0.04, 1.86, 0.12), this.m.gold, 0, 0.94, 0.08),
      this.mesh(new T.BoxGeometry(0.46, 0.72, 0.03), this.m.gold, -0.30, 1.24, 0.12),
      this.mesh(new T.BoxGeometry(0.46, 0.72, 0.03), this.m.gold, 0.30, 1.24, 0.12),
      this.mesh(new T.BoxGeometry(0.42, 0.68, 0.04), this.m.walnut, -0.30, 1.24, 0.125),
      this.mesh(new T.BoxGeometry(0.42, 0.68, 0.04), this.m.walnut, 0.30, 1.24, 0.125),
      // Festive evergreen & gold holiday wreath right on the castle door!
      this.mesh(new T.TorusGeometry(0.24, 0.065, 8, 20), this.m.pine, 0, 1.38, 0.15),
      this.mesh(new T.SphereGeometry(0.05, 8, 6), this.m.hollyRed, 0, 1.15, 0.19),
      this.mesh(new T.SphereGeometry(0.04, 8, 6), this.m.gold, -0.18, 1.48, 0.19),
      this.mesh(new T.SphereGeometry(0.04, 8, 6), this.m.gold, 0.18, 1.48, 0.19)
    );
    const doorSun = this.mkSunflower(0.28, false);
    doorSun.position.set(0, 1.38, 0.17);
    doorG.add(doorSun);
    g.add(doorG);

    // Wall lantern beside door at exact A_lantern (-0.35, 2.30, 3.22)
    g.add(
      this.mesh(new T.BoxGeometry(0.06, 0.06, 0.26), this.m.obsidian, -0.35, 2.34, 3.12),
      this.mesh(new T.CylinderGeometry(0.11, 0.08, 0.22, 6), this.m.lantern, -0.35, 2.22, 3.22),
      this.mesh(new T.ConeGeometry(0.15, 0.14, 6), this.m.gold, -0.35, 2.38, 3.22)
    );

    // 10. Royal Golden-Cushioned Porch Bench at exact A_bench (+1.55, 0.85, +3.22)!
    // Seat top sits at exact y = 0.85 so the Christmas decor crate rests flush on top!
    const bench = new T.Group();
    bench.position.set(1.55, 0.38, 3.22);
    bench.add(
      this.mesh(new T.BoxGeometry(1.52, 0.08, 0.56), this.m.marble, 0, 0.36, 0),
      this.mesh(new T.BoxGeometry(1.46, 0.08, 0.52), this.m.velvet, 0, 0.43, 0), // top = 0.38 + 0.47 = 0.85!
      this.mesh(new T.BoxGeometry(1.54, 0.46, 0.08), this.m.marble, 0, 0.68, -0.24),
      this.mesh(new T.BoxGeometry(1.56, 0.05, 0.10), this.m.gold, 0, 0.92, -0.24),
      this.mesh(new T.BoxGeometry(0.10, 0.48, 0.54), this.m.gold, -0.72, 0.24, 0),
      this.mesh(new T.BoxGeometry(0.10, 0.48, 0.54), this.m.gold, 0.72, 0.24, 0)
    );
    g.add(bench);

    // Mini festive pine urn beside bench (matching collider box x0: -3.35..-2.2, z0: 3..3.55!)
    const urn = new T.Group();
    urn.position.set(-2.78, 0.38, 3.26);
    urn.add(
      this.mesh(new T.CylinderGeometry(0.28, 0.20, 0.44, 12), this.m.marble, 0, 0.22, 0),
      this.mesh(new T.TorusGeometry(0.28, 0.04, 8, 18).rotateX(Math.PI / 2), this.m.gold, 0, 0.44, 0),
      this.mesh(new T.ConeGeometry(0.36, 0.82, 10), this.m.pine, 0, 0.84, 0),
      this.mesh(new T.ConeGeometry(0.26, 0.62, 10), this.m.pine, 0, 1.24, 0),
      this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, 0, 1.58, 0)
    );
    g.add(urn);

    // 11. Hanging Sculpted Golden Sunflower Porch Bell at exact A_bell (-0.45, 2.22, +5.16)!
    const bellPivot = new T.Group();
    bellPivot.position.set(-0.45, 2.22, 5.16);
    bellPivot.add(
      this.mesh(new T.CylinderGeometry(0.015, 0.015, 0.16, 6), this.m.gold, 0, -0.08, 0),
      this.mesh(new T.CylinderGeometry(0.07, 0.145, 0.20, 14), this.m.gold, 0, -0.24, 0),
      this.mesh(new T.TorusGeometry(0.145, 0.022, 6, 16).rotateX(Math.PI / 2), this.m.gold, 0, -0.34, 0),
      this.mesh(new T.SphereGeometry(0.042, 8, 8), this.m.terracotta, 0, -0.35, 0)
    );
    this.bell = bellPivot;
    g.add(bellPivot);

    // 12. Royal Rear Snow-Viewing Staircase & Walkable Rooftop Platforms (zero turret/roof clipping + solid colliders!)
    // Rear wall is at z = -3.00, terracotta roof eave starts at z = -3.25 (y = 4.22),
    // rear turrets tBL/tBR sit at x = ±3.78, z = -2.98 (r = 0.82..1.02), merlon i=+2 is open at x ∈ [1.31, 2.85].
    const stairG = new T.Group();
    const stX0 = -2.75, stX1 = 1.45, stTopY = 4.24, stZ = -4.22, stW = 1.08;
    const steps = 18;
    const stepDx = (stX1 - stX0) / steps;
    const stepDy = stTopY / steps;
    for (let i = 0; i < steps; i++) {
      const sx = stX0 + (i + 0.5) * stepDx;
      const sy = (i + 1) * stepDy;
      // Solid interlocking marble riser + recessed walnut tread (cleanly inside side stringers, zero floating gaps!)
      stairG.add(
        this.mesh(new T.BoxGeometry(stepDx + 0.03, stepDy + 0.06, stW - 0.10), this.m.marble, sx, sy - (stepDy + 0.06) * 0.5, stZ),
        this.mesh(new T.BoxGeometry(stepDx - 0.02, 0.032, stW - 0.16), this.m.walnut, sx, sy + 0.014, stZ)
      );
    }
    // Sturdy marble support columns seated cleanly UNDER the staircase stringers (never poking through treads!)
    for (const colFrac of [1 / 3, 2 / 3, 1.0]) {
      const cx = stX0 + (stX1 - stX0) * colFrac;
      const sy = stTopY * colFrac;
      const colH = Math.max(0.4, sy - 0.26);
      for (const dz of [-stW * 0.42, stW * 0.42]) {
        stairG.add(
          this.mesh(new T.CylinderGeometry(0.07, 0.085, colH, 10), this.m.marble, cx, colH * 0.5, stZ + dz),
          this.mesh(new T.BoxGeometry(0.20, 0.07, 0.20), this.m.plinth, cx, 0.035, stZ + dz),
          this.mesh(new T.BoxGeometry(0.20, 0.06, 0.20), this.m.gold, cx, colH, stZ + dz)
        );
      }
    }
    // Sloped marble side stringers, golden handrails & tidy vertical balusters terminating cleanly at stX1 = +1.45!
    const railLen = Math.hypot(stX1 - stX0, stTopY);
    const railAng = Math.atan2(stTopY, stX1 - stX0);
    for (const dz of [-stW * 0.48, stW * 0.48]) {
      const hr = this.mesh(new T.BoxGeometry(railLen, 0.065, 0.065), this.m.gold, (stX0 + stX1) * 0.5, stTopY * 0.5 + 0.74, stZ + dz);
      hr.rotation.z = railAng;
      const str = this.mesh(new T.BoxGeometry(railLen, 0.22, 0.08), this.m.marble, (stX0 + stX1) * 0.5, stTopY * 0.5 - 0.10, stZ + dz);
      str.rotation.z = railAng;
      stairG.add(hr, str);
      for (let k = 0; k <= 5; k++) {
        const px = stX0 + (stX1 - stX0) * (k / 5);
        const py = stTopY * (k / 5);
        stairG.add(this.mesh(new T.CylinderGeometry(0.028, 0.034, 0.68, 8), this.m.marble, px, py + 0.38, stZ + dz));
      }
      // Golden newel finial orbs at stair foot
      stairG.add(this.mesh(new T.SphereGeometry(0.065, 8, 8), this.m.gold, stX0, 0.80, stZ + dz));
    }
    // Warm golden beacon lantern beside the staircase foot so players spot the roof stairs right away!
    stairG.add(
      this.mesh(new T.CylinderGeometry(0.055, 0.075, 1.35, 8), this.m.obsidian, stX0 - 0.28, 0.68, stZ - 0.62),
      this.mesh(new T.CylinderGeometry(0.12, 0.09, 0.24, 6), this.m.lantern, stX0 - 0.28, 1.44, stZ - 0.62),
      this.mesh(new T.ConeGeometry(0.17, 0.18, 6), this.m.gold, stX0 - 0.28, 1.62, stZ - 0.62)
    );
    // Top Rooftop Balcony Landing: x ∈ [1.45, 2.65] (0.31m clear of rear-east turret!), z ∈ [-4.76, -3.26] (flush with roof eave at -3.25 — ZERO clipping!)
    const landX = 2.05, landW = 1.20, landZ = -4.01, landD = 1.50;
    const landColH = stTopY - 0.16;
    stairG.add(
      this.mesh(new T.BoxGeometry(landW, 0.16, landD), this.m.marble, landX, stTopY - 0.08, landZ),
      this.mesh(new T.BoxGeometry(landW + 0.04, 0.05, landD + 0.04), this.m.gold, landX, stTopY - 0.035, landZ),
      // Clean walnut threshold lip bridging onto the roof eave gateway (merlon i=+2 omitted!)
      this.mesh(new T.BoxGeometry(landW - 0.14, 0.032, 0.16), this.m.walnut, landX, stTopY + 0.016, -3.26),
      // Twin east support columns seated cleanly under the balcony slab
      this.mesh(new T.CylinderGeometry(0.075, 0.095, landColH, 10), this.m.marble, 2.57, landColH * 0.5, -4.68),
      this.mesh(new T.BoxGeometry(0.22, 0.08, 0.22), this.m.plinth, 2.57, 0.04, -4.68),
      this.mesh(new T.CylinderGeometry(0.075, 0.095, landColH, 10), this.m.marble, 2.57, landColH * 0.5, -3.36),
      this.mesh(new T.BoxGeometry(0.22, 0.08, 0.22), this.m.plinth, 2.57, 0.04, -3.36),
      // Exposed-edge balcony golden handrails (North outer edge & East edge only — roof gateway stays 100% open!)
      this.mesh(new T.BoxGeometry(landW + 0.04, 0.065, 0.065), this.m.gold, landX, stTopY + 0.74, -4.74),
      this.mesh(new T.BoxGeometry(0.065, 0.065, landD - 0.04), this.m.gold, 2.62, stTopY + 0.74, -4.02),
      // Neat vertical balcony balusters & golden corner finials (all terminating at z = -3.30, clear of terracotta roof!)
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.70, 8), this.m.marble, 2.05, stTopY + 0.37, -4.74),
      this.mesh(new T.CylinderGeometry(0.034, 0.04, 0.72, 8), this.m.marble, 2.62, stTopY + 0.37, -4.74),
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.70, 8), this.m.marble, 2.62, stTopY + 0.37, -4.02),
      this.mesh(new T.CylinderGeometry(0.034, 0.04, 0.72, 8), this.m.marble, 2.62, stTopY + 0.37, -3.30),
      this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, 1.45, stTopY + 0.80, -3.70),
      this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, 2.62, stTopY + 0.80, -4.74),
      this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, 2.62, stTopY + 0.80, -3.30)
    );
    g.add(stairG);

    // Real physical colliders for staircase underside, outer railings & lantern post (blocks walking underneath/through!)
    if (this.game && this.game.world) {
      if (this.game.world.boxes) {
        this.game.world.boxes.push(
          // Stepped underside masonry blockers (ground player blocked; stair walker clears h cleanly!)
          { x0: wx - 1.90, x1: wx - 0.85, z0: wz - 4.78, z1: wz - 3.66, h: 0.72 },
          { x0: wx - 0.85, x1: wx + 0.30, z0: wz - 4.78, z1: wz - 3.66, h: 1.72 },
          { x0: wx + 0.30, x1: wx + 1.45, z0: wz - 4.78, z1: wz - 3.66, h: 2.92 },
          { x0: wx + 1.45, x1: wx + 2.68, z0: wz - 4.78, z1: wz - 3.24, h: 3.92 },
          // Outer North & East railing guard strips outside the walkable tread
          { x0: wx - 2.75, x1: wx + 2.74, z0: wz - 4.98, z1: wz - 4.80, h: 5.2 },
          { x0: wx + 2.68, x1: wx + 2.86, z0: wz - 4.86, z1: wz - 3.28, h: 5.2 }
        );
      }
      if (this.game.world.circles) {
        this.game.world.circles.push({ x: wx + stX0 - 0.28, z: wz + stZ - 0.62, r: 0.22, top: 1.8 });
      }
    }

    // Register smooth walkable platforms for Rear Staircase, Top Balcony Landing, Porch Canopy & Main Castle Roof!
    if (this.game && this.game.world && this.game.world.platforms) {
      const footY = () => {
        const pl = this.game.player;
        return pl ? pl.y - pl.eye + pl.air : wy;
      };
      this.game.world.platforms.push(
        // (a) Rear Roof Staircase ramp (walkable smoothly from ground up to y = 4.24!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            if (lx < stX0 - 0.25 || lx > stX1 + 0.16 || lz < stZ - 0.60 || lz > stZ + 0.60) return false;
            const sy = wy + stTopY * Math.max(0, Math.min(1, (lx - stX0) / (stX1 - stX0)));
            return footY() >= sy - 0.80;
          },
          y: (px) => wy + stTopY * Math.max(0, Math.min(1, (px - wx - stX0) / (stX1 - stX0))),
          wood: true
        },
        // (b) Top Rooftop Balcony Landing (flush onto roof eave gateway!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            return lx >= 1.40 && lx <= 2.70 && lz >= -4.80 && lz <= -3.18 && footY() >= wy + stTopY - 0.85;
          },
          y: () => wy + stTopY,
          wood: true
        },
        // (c) Front Porch Canopy Roof (jumpable from porch bench/railing or drop down from main roof!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            if (lx < -4.08 || lx > 4.08 || lz < 2.85 || lz > 5.30) return false;
            const cy = wy + 2.86 - (lz - 4.10) * 0.22;
            return footY() >= cy - 0.65;
          },
          y: (px, pz) => wy + 2.86 - (pz - wz - 4.10) * 0.22,
          wood: false
        },
        // (d) Entire Walkable Main Castle Terracotta & Snow Roof (y = 4.24 at eaves -> 6.52 along snowy ridge!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            if (lx < -3.86 || lx > 3.86 || lz < -3.26 || lz > 3.26) return false;
            const ry = wy + 4.24 + 2.28 * Math.max(0, Math.min(1, (3.25 - Math.abs(lz)) / 2.10));
            return footY() >= ry - 0.90;
          },
          y: (px, pz) => {
            const lz = pz - wz;
            return wy + 4.24 + 2.28 * Math.max(0, Math.min(1, (3.25 - Math.abs(lz)) / 2.10));
          },
          wood: false
        }
      );
    }

    g.updateMatrixWorld(true);
    this.ext = g;
    return g;
  }

  // === PART B: ROYAL CHÂTEAU GRAND SALON INTERIOR ===
  // Exact match to _i = (0, 1500, 1500), nn = 3.6, ls = 2.8, and every interactive anchor!
  buildInterior(origin, paneMat, bulbMats) {
    const T = this.THREE;
    if (!this.m) this.makeMats();

    const g = new T.Group();
    g.position.set(origin.x, origin.y, origin.z);
    const W = 7.2, D = 5.6, H = 3.35; // nn=3.6 -> W=7.2; ls=2.8 -> D=5.6

    // 1. Honey-Oak Herringbone Parquet Floor + Warm Travertine Border
    const im = this.m.intMarble, isnow = this.m.intSnow;
    g.add(
      this.mesh(new T.BoxGeometry(W + 0.4, 0.12, D + 0.4), this.m.parquet, 0, -0.06, 0),
      this.mesh(new T.BoxGeometry(W + 0.1, 0.015, 0.34), im, 0, 0.008, -D / 2 + 0.17),
      this.mesh(new T.BoxGeometry(W + 0.1, 0.015, 0.34), im, 0, 0.008, D / 2 - 0.17)
    );

    // 2. Warm Travertine & Antique-Cream Wainscoted Castle Walls + Gilded Pilasters & Crown Cornice
    const wallSide = (w, h, d, x, y, z) => this.mesh(new T.BoxGeometry(w, h, d), this.m.creamWall, x, y, z);
    g.add(
      wallSide(W + 0.2, H, 0.14, 0, H / 2, -D / 2 - 0.06), // North wall
      wallSide(W + 0.2, H, 0.14, 0, H / 2, D / 2 + 0.06),  // South wall
      wallSide(0.14, H, D + 0.2, -W / 2 - 0.06, H / 2, 0), // West wall
      wallSide(0.14, H, D + 0.2, W / 2 + 0.06, H / 2, 0),  // East wall
      // Lower travertine wainscoting dado rail around all 4 walls
      this.mesh(new T.BoxGeometry(W, 0.92, 0.06), im, 0, 0.46, -D / 2 + 0.03),
      this.mesh(new T.BoxGeometry(W, 0.92, 0.06), im, 0, 0.46, D / 2 - 0.03),
      this.mesh(new T.BoxGeometry(0.06, 0.92, D), im, -W / 2 + 0.03, 0.46, 0),
      this.mesh(new T.BoxGeometry(0.06, 0.92, D), im, W / 2 - 0.03, 0.46, 0),
      // Gold dado & ceiling crown moldings
      this.mesh(new T.BoxGeometry(W, 0.06, 0.09), this.m.gold, 0, 0.94, -D / 2 + 0.04),
      this.mesh(new T.BoxGeometry(W, 0.06, 0.09), this.m.gold, 0, 0.94, D / 2 - 0.04),
      this.mesh(new T.BoxGeometry(0.09, 0.06, D), this.m.gold, -W / 2 + 0.04, 0.94, 0),
      this.mesh(new T.BoxGeometry(0.09, 0.06, D), this.m.gold, W / 2 - 0.04, 0.94, 0),
      this.mesh(new T.BoxGeometry(W, 0.12, 0.14), this.m.gold, 0, H - 0.08, -D / 2 + 0.06),
      this.mesh(new T.BoxGeometry(W, 0.12, 0.14), this.m.gold, 0, H - 0.08, D / 2 - 0.06),
      this.mesh(new T.BoxGeometry(0.14, 0.12, D), this.m.gold, -W / 2 + 0.06, H - 0.08, 0),
      this.mesh(new T.BoxGeometry(0.14, 0.12, D), this.m.gold, W / 2 - 0.06, H - 0.08, 0)
    );

    // Fluted gilded wall pilasters
    for (const px of [-3.48, -0.75, 0.95, 3.48]) {
      g.add(
        this.mesh(new T.BoxGeometry(0.18, H, 0.10), im, px, H / 2, -D / 2 + 0.05),
        this.mesh(new T.BoxGeometry(0.18, H, 0.10), im, px, H / 2, D / 2 - 0.05)
      );
    }

    // 3. Vaulted Coffered Château Ceiling with Golden Ribs
    g.add(this.mesh(new T.BoxGeometry(W + 0.4, 0.14, D + 0.4), im, 0, H + 0.06, 0));
    for (const rx of [-2.2, 0.3, 2.2]) {
      g.add(this.mesh(new T.BoxGeometry(0.16, 0.16, D), this.m.gold, rx, H - 0.04, 0));
    }
    for (const rz of [-1.2, 1.2]) {
      g.add(this.mesh(new T.BoxGeometry(W, 0.14, 0.14), this.m.gold, 0, H - 0.04, rz));
    }

    // 4. Three Tall Arched Gothic Castle Windows on North Wall (crisp winter aurora leaded-glass!)
    for (const wx of [-2.15, 0.10, 2.25]) {
      const wg = new T.Group();
      wg.position.set(wx, 1.88, -D / 2 + 0.07);
      const pane = this.mesh(new T.PlaneGeometry(1.12, 1.34), this.m.nightPane || paneMat, 0, 0, 0.025);
      pane.castShadow = false;
      wg.add(
        pane,
        this.mesh(new T.BoxGeometry(1.26, 0.10, 0.16), im, 0, -0.70, 0.06),
        this.mesh(new T.TorusGeometry(0.58, 0.06, 8, 22, Math.PI), this.m.gold, 0, 0.56, 0.04),
        this.mesh(new T.BoxGeometry(0.038, 1.34, 0.06), this.m.obsidian, 0, 0, 0.045),
        this.mesh(new T.BoxGeometry(1.12, 0.038, 0.06), this.m.obsidian, 0, 0.14, 0.045),
        this.mesh(new T.BoxGeometry(1.12, 0.038, 0.06), this.m.obsidian, 0, -0.18, 0.045),
        // Draped Terracotta-Orange Velvet Curtains with Golden Tie-Backs!
        this.mesh(new T.CylinderGeometry(0.10, 0.14, 1.62, 10), this.m.velvet, -0.66, 0.04, 0.09),
        this.mesh(new T.CylinderGeometry(0.10, 0.14, 1.62, 10), this.m.velvet, 0.66, 0.04, 0.09),
        this.mesh(new T.TorusGeometry(0.125, 0.022, 6, 14).rotateX(Math.PI / 2), this.m.gold, -0.66, -0.22, 0.09),
        this.mesh(new T.TorusGeometry(0.125, 0.022, 6, 14).rotateX(Math.PI / 2), this.m.gold, 0.66, -0.22, 0.09)
      );
      g.add(wg);
    }

    // 5. Grand Carved Marble Royal Fireplace (West wall, exact A_fire = -3.27, 0.30, 0)
    const fp = new T.Group();
    fp.position.set(-3.26, 0, 0);
    fp.add(
      // Hearth slab & carved surround + chimney breast to ceiling
      this.mesh(new T.BoxGeometry(0.86, 0.14, 2.28), this.m.plinth, 0.12, 0.07, 0),
      this.mesh(new T.BoxGeometry(0.72, 1.48, 0.42), im, 0, 0.74, -0.84),
      this.mesh(new T.BoxGeometry(0.72, 1.48, 0.42), im, 0, 0.74, 0.84),
      this.mesh(new T.BoxGeometry(0.68, 1.88, 1.92), im, -0.02, 2.40, 0),
      // Gilded mantelpiece shelf
      this.mesh(new T.BoxGeometry(0.84, 0.14, 2.24), im, 0.06, 1.50, 0),
      this.mesh(new T.BoxGeometry(0.88, 0.05, 2.28), this.m.gold, 0.07, 1.58, 0),
      // Dark recessed firebox + stacked logs + glowing embers!
      this.mesh(new T.BoxGeometry(0.42, 1.24, 1.28), this.m.obsidian, -0.14, 0.74, 0),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 0.78, 8).rotateX(Math.PI / 2), this.m.walnut, 0.06, 0.24, 0),
      this.mesh(new T.CylinderGeometry(0.07, 0.08, 0.72, 8).rotateX(Math.PI / 2), this.m.walnut, 0.14, 0.34, 0.06),
      this.mesh(new T.SphereGeometry(0.24, 10, 8), this.m.embers, 0.08, 0.28, 0)
    );
    fp.children[fp.children.length - 1].scale.set(0.8, 0.55, 1.4);

    // Sculpted Golden-Terracotta Sunflower Crest above the mantelpiece!
    const crest = this.mkSunflower(0.62, false);
    crest.position.set(0.35, 2.38, 0);
    crest.rotation.y = Math.PI / 2;
    fp.add(crest);

    // Festive mantel garland, colorful bulbs, candles & 3 cozy stockings!
    fp.add(this.mesh(new T.BoxGeometry(0.14, 0.12, 2.02), this.m.pine, 0.44, 1.52, 0));
    const stockCols = [this.m.terracotta, this.m.pine, this.m.apricot];
    for (let i = 0; i < 3; i++) {
      const sz = -0.58 + i * 0.58;
      fp.add(
        this.mesh(new T.BoxGeometry(0.07, 0.28, 0.14), stockCols[i], 0.49, 1.32, sz),
        this.mesh(new T.BoxGeometry(0.08, 0.07, 0.16), isnow, 0.49, 1.46, sz),
        this.mesh(new T.CylinderGeometry(0.035, 0.035, 0.18, 8), this.m.creamWall, 0.32, 1.69, sz * 1.4),
        this.mesh(new T.SphereGeometry(0.04, 8, 6), this.m.lantern, 0.32, 1.81, sz * 1.4)
      );
    }
    if (bulbMats && bulbMats.length) {
      for (let i = 0; i < 7; i++) {
        const b = this.mesh(new T.SphereGeometry(0.038, 8, 6), bulbMats[i % bulbMats.length], 0.51, 1.52, -0.84 + i * 0.28);
        b.castShadow = false;
        fp.add(b);
      }
    }
    g.add(fp);

    // 6. Plush Circular Sunflower Tapestry Rug + Two Royal Armchairs + Hot Cocoa Table!
    g.add(this.mesh(new T.CylinderGeometry(1.68, 1.70, 0.025, 36), this.m.carpet, -1.62, 0.014, 0));

    // Two Royal Wingback Armchairs at exact (-1.35, 0, ±0.95)
    for (const side of [-1, 1]) {
      const ch = new T.Group();
      ch.position.set(-1.35, 0, side * 0.95);
      ch.rotation.y = side > 0 ? -Math.PI * 0.72 : -Math.PI * 0.28;
      ch.add(
        this.mesh(new T.BoxGeometry(0.76, 0.38, 0.72), this.m.velvet, 0, 0.24, 0),
        this.mesh(new T.BoxGeometry(0.68, 0.14, 0.66), this.m.apricot, 0, 0.46, 0.02),
        this.mesh(new T.BoxGeometry(0.76, 0.92, 0.16), this.m.velvet, 0, 0.68, -0.30),
        this.mesh(new T.BoxGeometry(0.80, 0.06, 0.18), this.m.gold, 0, 1.15, -0.30),
        this.mesh(new T.BoxGeometry(0.14, 0.52, 0.72), this.m.velvet, -0.36, 0.42, 0),
        this.mesh(new T.BoxGeometry(0.14, 0.52, 0.72), this.m.velvet, 0.36, 0.42, 0)
      );
      g.add(ch);
    }

    // Gilded Marble Cocoa Tea Table at exact A_cocoa (-1.85, 0.60, 0)
    const cocoaT = new T.Group();
    cocoaT.position.set(-1.85, 0, 0);
    cocoaT.add(
      this.mesh(new T.CylinderGeometry(0.36, 0.36, 0.05, 20), this.m.marble, 0, 0.58, 0),
      this.mesh(new T.TorusGeometry(0.36, 0.02, 6, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.58, 0),
      this.mesh(new T.CylinderGeometry(0.05, 0.14, 0.56, 10), this.m.gold, 0, 0.28, 0),
      // Porcelain cocoa mugs & teapot
      this.mesh(new T.CylinderGeometry(0.055, 0.048, 0.11, 10), this.m.terracotta, -0.10, 0.66, 0.07),
      this.mesh(new T.CylinderGeometry(0.050, 0.050, 0.02, 10), this.m.snow, -0.10, 0.71, 0.07),
      this.mesh(new T.CylinderGeometry(0.055, 0.048, 0.11, 10), this.m.marble, 0.11, 0.66, -0.06),
      this.mesh(new T.SphereGeometry(0.085, 10, 8), this.m.gold, 0.02, 0.68, -0.16)
    );
    g.add(cocoaT);

    // 7. Radiant Golden Sunflower Crystal Chandelier at A_lamp (+0.30, 2.45, 0)!
    const chand = new T.Group();
    chand.position.set(0.30, 2.48, 0);
    chand.add(
      this.mesh(new T.CylinderGeometry(0.02, 0.02, 0.88, 8), this.m.gold, 0, 0.44, 0),
      this.mesh(new T.TorusGeometry(0.56, 0.032, 8, 28).rotateX(Math.PI / 2), this.m.gold, 0, 0, 0),
      this.mesh(new T.SphereGeometry(0.12, 10, 8), this.m.gold, 0, -0.06, 0)
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cx = Math.cos(a) * 0.56, cz = Math.sin(a) * 0.56;
      chand.add(
        this.mesh(new T.CylinderGeometry(0.015, 0.015, 0.56, 6).rotateZ(Math.PI / 2), this.m.gold, cx / 2, 0, cz / 2),
        this.mesh(new T.CylinderGeometry(0.026, 0.026, 0.16, 8), this.m.creamWall, cx, 0.10, cz),
        this.mesh(new T.SphereGeometry(0.042, 8, 6), this.m.lantern, cx, 0.21, cz)
      );
      chand.children[chand.children.length - 3].rotation.y = -a;
    }
    this.chandelier = chand;
    g.add(chand);

    // 8. Princess Four-Poster Canopy Bed (NE corner: x 1.25..3.52, z -2.55..-1.35, exact A_bed!)
    const bed = new T.Group();
    bed.position.set(2.38, 0, -1.96);
    bed.add(
      // Ivory & gold carved bedstead
      this.mesh(new T.BoxGeometry(2.22, 0.36, 1.22), this.m.marble, 0, 0.22, 0),
      this.mesh(new T.BoxGeometry(2.14, 0.24, 1.14), this.m.snow, 0, 0.48, 0),
      // Fluffy terracotta-orange royal velvet blanket fold
      this.mesh(new T.BoxGeometry(1.42, 0.26, 1.18), this.m.velvet, -0.36, 0.50, 0),
      this.mesh(new T.BoxGeometry(0.10, 0.27, 1.19), this.m.gold, 0.35, 0.50, 0),
      // Plush pillows + golden sunflower cushion!
      this.mesh(new T.BoxGeometry(0.42, 0.18, 0.92), this.m.creamWall, 0.80, 0.66, 0),
      // Carved ornate headboard on East side (+X)
      this.mesh(new T.BoxGeometry(0.12, 1.45, 1.26), this.m.marble, 1.08, 0.74, 0),
      this.mesh(new T.BoxGeometry(0.14, 0.07, 1.30), this.m.gold, 1.08, 1.48, 0)
    );
    // Four golden-capped canopy posts + canopy cornice + velvet corner drapes!
    for (const [px, pz] of [[-1.08, -0.58], [1.08, -0.58], [-1.08, 0.58], [1.08, 0.58]]) {
      bed.add(
        this.mesh(new T.CylinderGeometry(0.045, 0.055, 2.42, 10), this.m.marble, px, 1.21, pz),
        this.mesh(new T.SphereGeometry(0.08, 8, 8), this.m.gold, px, 2.46, pz),
        this.mesh(new T.CylinderGeometry(0.08, 0.13, 1.75, 8), this.m.velvet, px * 0.94, 1.45, pz * 0.92)
      );
    }
    bed.add(
      this.mesh(new T.BoxGeometry(2.26, 0.09, 1.28), this.m.gold, 0, 2.38, 0),
      this.mesh(new T.BoxGeometry(2.14, 0.04, 1.16), this.m.creamWall, 0, 2.42, 0)
    );
    const bedSun = this.mkSunflower(0.32, false);
    bedSun.position.set(0.56, 0.72, 0);
    bedSun.rotation.y = -Math.PI / 2;
    bed.add(bedSun);
    g.add(bed);

    // 9. Hollow-Fronted Royal Library Bookshelf (East wall: x 3.22..3.56, z 0.55..2.15) — zero Z-fighting!
    const shelf = new T.Group();
    shelf.position.set(3.40, 0, 1.35);
    shelf.add(
      // Recessed back panel (+X), two side walls (±Z), base plinth & gilded crown top
      this.mesh(new T.BoxGeometry(0.06, 2.15, 1.56), this.m.walnut, 0.14, 1.075, 0),
      this.mesh(new T.BoxGeometry(0.34, 2.15, 0.07), this.m.walnut, 0, 1.075, -0.755),
      this.mesh(new T.BoxGeometry(0.34, 2.15, 0.07), this.m.walnut, 0, 1.075, 0.755),
      this.mesh(new T.BoxGeometry(0.36, 0.16, 1.58), this.m.walnut, 0, 0.08, 0),
      this.mesh(new T.BoxGeometry(0.38, 0.08, 1.62), this.m.gold, 0, 2.18, 0)
    );
    const bkCols = [this.m.terracotta, this.m.pine, this.m.gold, this.m.obsidian, this.m.apricot];
    for (let row = 0; row < 4; row++) {
      const sy = 0.36 + row * 0.45;
      shelf.add(this.mesh(new T.BoxGeometry(0.31, 0.04, 1.44), this.m.gold, -0.01, sy - 0.15, 0));
      for (let b = 0; b < 9; b++) {
        const bh = 0.24 + ((row * 7 + b * 11) % 5) * 0.025;
        shelf.add(this.mesh(new T.BoxGeometry(0.20, bh, 0.105), bkCols[(row + b) % bkCols.length], -0.02, sy - 0.13 + bh / 2, -0.58 + b * 0.145));
      }
    }
    g.add(shelf);

    // 10. Gilded Indoor Christmas Tree at exact A_tree (+2.60, 0, +1.95)
    const tree = new T.Group();
    tree.position.set(2.60, 0, 1.95);
    tree.add(
      this.mesh(new T.CylinderGeometry(0.24, 0.18, 0.36, 12), this.m.gold, 0, 0.18, 0),
      this.mesh(new T.ConeGeometry(0.76, 1.05, 12), this.m.pine, 0, 0.85, 0),
      this.mesh(new T.ConeGeometry(0.58, 0.88, 12), this.m.pine, 0, 1.40, 0),
      this.mesh(new T.ConeGeometry(0.38, 0.68, 12), this.m.pine, 0, 1.90, 0)
    );
    const treeTop = this.mkSunflower(0.26, true);
    treeTop.position.set(0, 2.34, 0);
    tree.add(treeTop);
    if (bulbMats && bulbMats.length) {
      for (let i = 0; i < 12; i++) {
        const a = i * 1.15, h = 0.62 + i * 0.12, rr = 0.62 - i * 0.04;
        const b = this.mesh(new T.SphereGeometry(0.038, 8, 6), bulbMats[i % bulbMats.length], Math.cos(a) * rr, h, Math.sin(a) * rr);
        b.castShadow = false;
        tree.add(b);
      }
    }
    g.add(tree);

    // 11. Antique Golden-Horn Gramophone (South wall: x +1.0, z +2.42, exact A_music!)
    const gram = new T.Group();
    gram.position.set(1.0, 0, 2.42);
    gram.rotation.y = Math.PI;
    gram.add(
      this.mesh(new T.BoxGeometry(0.72, 0.78, 0.56), this.m.walnut, 0, 0.39, 0),
      this.mesh(new T.BoxGeometry(0.76, 0.05, 0.60), this.m.gold, 0, 0.80, 0),
      this.mesh(new T.BoxGeometry(0.34, 0.12, 0.34), this.m.walnut, 0, 0.88, 0)
    );
    const rec = this.mesh(new T.CylinderGeometry(0.14, 0.14, 0.015, 18), this.m.obsidian, 0, 0.955, 0);
    this.recordMesh = rec;
    const hornCurve = new T.CatmullRomCurve3([
      new T.Vector3(0.08, 0.96, -0.06),
      new T.Vector3(0.12, 1.12, -0.10),
      new T.Vector3(0.04, 1.28, 0.04)
    ]);
    gram.add(
      rec,
      this.mesh(new T.TubeGeometry(hornCurve, 12, 0.025, 8, false), this.m.gold),
      this.mesh(new T.ConeGeometry(0.19, 0.24, 14, 1, true).rotateX(-Math.PI * 0.42), this.m.gold, 0.02, 1.32, 0.14)
    );
    g.add(gram);

    // 12. Royal Guestbook Podium (SW corner: -2.75, 0, +2.38, exact A_book!)
    const pod = new T.Group();
    pod.position.set(-2.75, 0, 2.38);
    pod.rotation.y = Math.PI * 0.78;
    pod.add(
      this.mesh(new T.CylinderGeometry(0.08, 0.16, 0.88, 10), this.m.marble, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(0.46, 0.05, 0.34), this.m.gold, 0, 0.90, 0),
      this.mesh(new T.BoxGeometry(0.36, 0.04, 0.24), this.m.creamWall, 0, 0.94, 0),
      this.mesh(new T.CylinderGeometry(0.012, 0.005, 0.22, 6).rotateZ(-0.35), this.m.gold, 0.16, 1.04, 0)
    );
    g.add(pod);

    // 13. Carved Royal Double Castle Exit Door (South wall: -1.0, 0, +2.74, exact A_door!)
    const inDoor = new T.Group();
    inDoor.position.set(-1.0, 0, D / 2 - 0.05);
    inDoor.add(
      this.mesh(new T.BoxGeometry(1.48, 2.20, 0.10), this.m.marble, 0, 1.10, 0),
      this.mesh(new T.BoxGeometry(1.18, 2.02, 0.08), this.m.walnut, 0, 1.01, -0.03),
      this.mesh(new T.TorusGeometry(0.64, 0.07, 8, 20, Math.PI), this.m.gold, 0, 1.72, -0.05),
      this.mesh(new T.BoxGeometry(0.04, 2.0, 0.10), this.m.gold, 0, 1.0, -0.04),
      this.mesh(new T.TorusGeometry(0.22, 0.055, 8, 18), this.m.pine, 0, 1.42, -0.08)
    );
    g.add(inDoor);

    g.updateMatrixWorld(true);
    this.interior = g;
    return g;
  }

  update(dt, time) {
    const night = this.game.env ? this.game.env.night || 0 : 0;
    const lamps = this.game.env && this.game.env.state ? this.game.env.state.lamps : 0;

    // Gentle fluttering terracotta castle pennants in the winter wind!
    for (const f of this.flags) {
      f.obj.rotation.y = Math.sin(time * 2.8 + f.phase) * 0.28 + Math.sin(time * 5.1 + f.phase) * 0.09;
    }
    // Slowly rotating Sunflower Beacon Crown atop the central spire
    if (this.beacon) {
      this.beacon.rotation.y = time * 0.65;
    }
    // Rose window & warm lanterns brighten at dusk/night
    if (this.roseMat) {
      this.roseMat.emissiveIntensity = 0.55 + 1.55 * night;
    }
    for (const l of this.lanternGlows) {
      l.emissiveIntensity = (0.95 + 1.45 * lamps) * (0.95 + 0.05 * Math.sin(time * 6.5));
    }
    // Inside fireplace embers & spinning gramophone vinyl
    if (this.hearthEmbers) {
      this.hearthEmbers.emissiveIntensity = 1.25 + 0.35 * Math.sin(time * 8.4);
    }
    if (this.recordMesh && this.game.cabin && this.game.cabin.inside) {
      this.recordMesh.rotation.y = time * 2.8;
    }
  }
}
