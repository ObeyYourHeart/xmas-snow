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
    this.hearthFlames = [];
    this.chandelier = null;
    this.intBounds = null;
    this.pianoCooldown = 0;

    // 3rd-Person Visible Royal Princess Canopy Bed Sleep System!
    this.castleBed = {
      riding: false,
      tucked: false,
      quiltK: 0,
      quilt: null,
      petPulse: 0,
      lullabyOn: false,
      lullabyT: 0,
      lullabyStep: 0,
      sparkT: 0,
      murmurIdx: 0,
      eye: new this.THREE.Vector3(),
      focus: new this.THREE.Vector3(),
      bedPos: new this.THREE.Vector3(),
      zzzOrigin: new this.THREE.Vector3(),
      exitPos: new this.THREE.Vector3(),
      bedYaw: Math.PI,
      exitYaw: 0,
      zzz: [],
      spot: null,
      hudEl: null,
      barEl: null
    };
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

    const paintTex = this.makePaintingTex();
    this.m = {
      stone: plain(new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.74, metalness: 0.04 })),
      marble: std(0.95, 0.92, 0.87, 0.38, { metalness: 0.05 }),
      intMarble: std(0.84, 0.79, 0.72, 0.56, { metalness: 0.04 }),
      creamWall: std(0.82, 0.76, 0.67, 0.86, { metalness: 0.0 }),
      plinth: std(0.82, 0.78, 0.73, 0.80, { metalness: 0.04 }),
      roof: plain(new T.MeshStandardMaterial({ map: roofTex, roughness: 0.48, metalness: 0.12 })),
      terracotta: std(0.74, 0.24, 0.07, 0.44, { metalness: 0.06 }),
      velvet: std(0.56, 0.13, 0.07, 0.86, { metalness: 0.02 }),
      apricot: std(0.82, 0.44, 0.18, 0.64, { metalness: 0.02 }),
      obsidian: std(0.08, 0.09, 0.13, 0.24, { metalness: 0.36 }),
      walnut: std(0.18, 0.10, 0.05, 0.48, { metalness: 0.06 }),
      gold: std(0.92, 0.74, 0.34, 0.28, { metalness: 0.82 }),
      snow: std(0.96, 0.96, 0.98, 0.78, { metalness: 0.0 }),
      intSnow: std(0.84, 0.82, 0.80, 0.82, { metalness: 0.0 }),
      pine: std(0.07, 0.31, 0.14, 0.74, { metalness: 0.0 }),
      hollyRed: std(0.74, 0.07, 0.08, 0.36, { metalness: 0.05 }),
      window: gm && gm.M_window ? gm.M_window : warmLantern,
      nightPane: nightPaneMat,
      lantern: warmLantern,
      embers: hearthEmbers,
      rose: this.roseMat,
      banner: plain(new T.MeshStandardMaterial({ map: bannerTex, roughness: 0.65, side: T.DoubleSide })),
      carpet: plain(new T.MeshStandardMaterial({ map: this.makeCarpetTex(), roughness: 0.88 })),
      parquet: plain(new T.MeshStandardMaterial({ map: this.makeParquetTex(), roughness: 0.56, metalness: 0.05 })),
      wainscot: plain(new T.MeshStandardMaterial({ map: this.makeWainscotTex(), roughness: 0.68, metalness: 0.02 })),
      cofferBlue: std(0.08, 0.11, 0.25, 0.72, { metalness: 0.06 }),
      silkCream: std(0.94, 0.89, 0.79, 0.64, { metalness: 0.03 }),
      crystal: std(0.96, 0.98, 1.0, 0.08, {
        metalness: 0.16,
        emissive: new T.Color(0.55, 0.48, 0.38),
        emissiveIntensity: 0.42
      }),
      flameOuter: plain(new T.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.88 })),
      flameInner: plain(new T.MeshBasicMaterial({ color: 0xffe47a, transparent: true, opacity: 0.95 })),
      painting: plain(new T.MeshStandardMaterial({
        map: paintTex,
        roughness: 0.94,
        metalness: 0.0,
        emissive: new T.Color(0.16, 0.14, 0.12),
        emissiveMap: paintTex,
        emissiveIntensity: 0.10
      }))
    };
  }

  makeWainscotTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    // Warm cream-ivory French château plaster wall with embossed gilded molding panels!
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#f2eadc");
    g.addColorStop(1, "#e2d6c2");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    // Subtle silk damask vertical stripes
    c.fillStyle = "rgba(210, 185, 145, 0.14)";
    for (let x = 0; x < 512; x += 32) c.fillRect(x, 0, 12, 512);
    // Double carved rectangular boiserie molding panels with gold trim
    for (let col = 0; col < 2; col++) {
      const px = 22 + col * 248;
      c.strokeStyle = "#d4ad5c";
      c.lineWidth = 5;
      c.strokeRect(px, 28, 220, 456);
      c.strokeStyle = "rgba(255, 250, 240, 0.72)";
      c.lineWidth = 3;
      c.strokeRect(px + 10, 38, 200, 436);
      c.strokeStyle = "rgba(165, 140, 108, 0.38)";
      c.lineWidth = 2;
      c.strokeRect(px + 16, 44, 188, 424);
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(4, 1);
    tex.anisotropy = 4;
    return tex;
  }

  makePaintingTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 384;
    const c = cv.getContext("2d");
    // Romantic moonlit château winter oil painting
    const sky = c.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, "#101b3d");
    sky.addColorStop(0.55, "#283e6e");
    sky.addColorStop(1, "#e89f6e");
    c.fillStyle = sky;
    c.fillRect(0, 0, 512, 384);
    // Aurora ribbon
    const aur = c.createLinearGradient(40, 60, 460, 140);
    aur.addColorStop(0, "rgba(110, 240, 220, 0)");
    aur.addColorStop(0.4, "rgba(120, 245, 210, 0.36)");
    aur.addColorStop(0.75, "rgba(255, 175, 220, 0.32)");
    aur.addColorStop(1, "rgba(110, 240, 220, 0)");
    c.fillStyle = aur;
    c.beginPath();
    c.moveTo(20, 120); c.quadraticCurveTo(220, 25, 490, 95);
    c.lineTo(490, 155); c.quadraticCurveTo(220, 85, 20, 170);
    c.closePath(); c.fill();
    // Golden full moon + distant snowy alps
    c.fillStyle = "#fff1c4";
    c.beginPath(); c.arc(392, 82, 30, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#cfdcf0";
    c.beginPath(); c.moveTo(0, 255); c.lineTo(110, 148); c.lineTo(220, 225); c.lineTo(345, 130); c.lineTo(512, 245); c.lineTo(512, 384); c.lineTo(0, 384); c.closePath(); c.fill();
    // Snowy valley foreground + warm glowing château silhouette
    c.fillStyle = "#e8effa";
    c.fillRect(0, 248, 512, 136);
    c.fillStyle = "#f4e6d2";
    c.fillRect(200, 198, 112, 58);
    c.fillStyle = "#c85224";
    c.beginPath(); c.moveTo(192, 198); c.lineTo(256, 156); c.lineTo(320, 198); c.closePath(); c.fill();
    for (const tx of [194, 318]) {
      c.fillStyle = "#efe2ce"; c.fillRect(tx - 12, 184, 24, 72);
      c.fillStyle = "#c85224"; c.beginPath(); c.moveTo(tx - 16, 184); c.lineTo(tx, 146); c.lineTo(tx + 16, 184); c.closePath(); c.fill();
    }
    c.fillStyle = "#ffd980";
    for (const wx of [222, 248, 274]) c.fillRect(wx, 214, 14, 22);
    // Pine trees framing left & right
    c.fillStyle = "#173c2a";
    for (const [px, ph] of [[44, 135], [96, 110], [428, 115], [472, 142]]) {
      c.beginPath(); c.moveTo(px - 28, 315); c.lineTo(px, 315 - ph); c.lineTo(px + 28, 315); c.closePath(); c.fill();
    }
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  _makeRoyalQuiltTex() {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    // Plush royal terracotta-rose to warm apricot-gold quilted silk duvet!
    const bg = c.createLinearGradient(0, 0, 512, 512);
    bg.addColorStop(0, "#b83b1e");
    bg.addColorStop(0.5, "#d65a2a");
    bg.addColorStop(1, "#e58845");
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 512);
    // Quilted diamond stitch pattern
    c.strokeStyle = "rgba(255, 232, 185, 0.34)";
    c.lineWidth = 2.5;
    for (let i = -512; i <= 1024; i += 64) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 512, 512); c.stroke();
      c.beginPath(); c.moveTo(i, 512); c.lineTo(i + 512, 0); c.stroke();
    }
    // Embroidered golden sunflowers & tiny warm stars
    const drawSun = (x, y, r) => {
      c.fillStyle = "rgba(255, 219, 122, 0.85)";
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        c.beginPath();
        c.ellipse(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72, r * 0.34, r * 0.16, a, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "#fff0c2";
      c.beginPath(); c.arc(x, y, r * 0.32, 0, Math.PI * 2); c.fill();
    };
    for (let gx = 48; gx < 512; gx += 96) {
      for (let gy = 48; gy < 512; gy += 96) {
        if (((gx + gy) / 96) % 2 === 0) drawSun(gx, gy, 22);
        else {
          c.fillStyle = "rgba(255, 244, 200, 0.72)";
          c.beginPath(); c.arc(gx, gy, 5, 0, Math.PI * 2); c.fill();
        }
      }
    }
    // Scalloped ivory-cream & gold silk top fold along +X (neck edge)
    c.fillStyle = "#fbf2e3";
    c.fillRect(444, 0, 68, 512);
    c.fillStyle = "#e8bc58";
    c.fillRect(436, 0, 10, 512);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  _buildCastleSleepQuilt() {
    const T = this.THREE;
    const qg = new T.Group();
    // Generous plush royal dome sized to cover both Gemini & Claude's full princess gown with zero clipping!
    const w = 1.34, d = 1.24;
    const geo = new T.PlaneGeometry(w, d, 22, 20);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const u = (x + w / 2) / w, v = (z + d / 2) / d;
      const archX = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 0.48);
      const archZ = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.46);
      const puff = 0.52 * archX * archZ + 0.055 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
      const ripple = 0.014 * Math.sin(u * 14) * Math.sin(v * 10) * archX * archZ;
      pos.setY(i, Math.max(0.01, puff + ripple));
    }
    geo.computeVertexNormals();

    const quiltMat = this.wrapMat(new T.MeshStandardMaterial({
      map: this._makeRoyalQuiltTex(),
      roughness: 0.76,
      metalness: 0.03,
      emissive: new T.Color(0.26, 0.11, 0.05),
      emissiveIntensity: 0.12,
      side: T.DoubleSide
    }), { key: "plain" });
    const duvet = new T.Mesh(geo, quiltMat);
    duvet.receiveShadow = true;
    qg.add(duvet);

    // Rolled ivory-cream silk duvet fold + golden braided piping along the neck edge (+X)
    const collarPts = [];
    for (let k = 0; k <= 14; k++) {
      const v = k / 14;
      const z = (v - 0.5) * (d * 0.88);
      const arch = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.48);
      collarPts.push(new T.Vector3(w * 0.43, 0.04 + 0.36 * arch, z));
    }
    qg.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(collarPts), 20, 0.068, 10, false), this.m.silkCream));
    return qg;
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

    // 12. Royal Rear Grand Snow-Viewing Staircase & Walkable Rooftop Platforms
    // Carefully engineered clearances:
    //   Rear keep wall z = -3.00 | Rear cornice z = -3.50 (y = 2.54) | Rear turrets tBL/tBR max outer z = -4.00
    //   Terracotta roof eave starts at z = -3.25 (y = 4.22) | Open merlon gateway i=+2 spans x ∈ [1.31, 2.85]
    //   West gift sits at local (-5.8, -4.4) -> stair foot at stX0 = -4.25 leaves 1.55m clear snow margin!
    const stairG = new T.Group();
    const stX0 = -4.25, stX1 = 1.45, stTopY = 4.26, stZ = -4.65, stW = 1.24;
    const steps = 20;
    const stepDx = (stX1 - stX0) / steps;
    const stepDy = stTopY / steps;
    const riserDepth = stepDy + 0.22; // Deep solid interlocking risers (zero diagonal daylight slivers!)
    for (let i = 0; i < steps; i++) {
      const sx = stX0 + (i + 0.5) * stepDx;
      const sy = (i + 1) * stepDy;
      const hThis = Math.min(sy, riserDepth);
      stairG.add(
        this.mesh(new T.BoxGeometry(stepDx + 0.035, hThis, stW - 0.12), this.m.marble, sx, sy - hThis * 0.5, stZ),
        this.mesh(new T.BoxGeometry(stepDx - 0.015, 0.034, stW - 0.18), this.m.walnut, sx, sy + 0.015, stZ)
      );
    }
    // Continuous sloped marble carriage beams + sturdy grounded columns cleanly underneath (never poking through treads!)
    const railLen = Math.hypot(stX1 - stX0, stTopY);
    const railAng = Math.atan2(stTopY, stX1 - stX0);
    const railDz = stW * 0.50; // ±0.62 -> z = -5.27 (North) and -4.03 (South, clear of z = -4.00 turrets & -3.50 cornice!)
    for (const colFrac of [1 / 3, 2 / 3, 1.0]) {
      const cx = stX0 + (stX1 - stX0) * colFrac;
      const sy = stTopY * colFrac;
      const colH = Math.max(0.4, sy - 0.30);
      for (const dz of [-stW * 0.44, stW * 0.44]) {
        stairG.add(
          this.mesh(new T.CylinderGeometry(0.075, 0.09, colH, 10), this.m.marble, cx, colH * 0.5, stZ + dz),
          this.mesh(new T.BoxGeometry(0.22, 0.08, 0.22), this.m.plinth, cx, 0.04, stZ + dz),
          this.mesh(new T.BoxGeometry(0.22, 0.06, 0.22), this.m.gold, cx, colH, stZ + dz)
        );
      }
    }
    // Helper for clean square marble newel posts capped with golden finials (sloped & horizontal rails terminate INSIDE them — ZERO sharp protruding tips!)
    const addNewel = (nx, baseY, nz) => {
      stairG.add(
        this.mesh(new T.BoxGeometry(0.13, 0.84, 0.13), this.m.marble, nx, baseY + 0.42, nz),
        this.mesh(new T.BoxGeometry(0.155, 0.05, 0.155), this.m.gold, nx, baseY + 0.84, nz),
        this.mesh(new T.SphereGeometry(0.08, 10, 8), this.m.gold, nx, baseY + 0.93, nz)
      );
    };
    for (const dz of [-railDz, railDz]) {
      // Sloped side stringer & golden handrail cleanly spanning between bottom & top newel posts
      const str = this.mesh(new T.BoxGeometry(railLen, 0.28, 0.09), this.m.marble, (stX0 + stX1) * 0.5, stTopY * 0.5 - 0.12, stZ + dz);
      str.rotation.z = railAng;
      const hr = this.mesh(new T.BoxGeometry(railLen - 0.06, 0.065, 0.068), this.m.gold, (stX0 + stX1) * 0.5, stTopY * 0.5 + 0.78, stZ + dz);
      hr.rotation.z = railAng;
      stairG.add(str, hr);
      // Square newel posts at stair foot (stX0) and top transition (stX1)
      addNewel(stX0, 0.0, stZ + dz);
      addNewel(stX1, stTopY, stZ + dz);
      // Interior balusters cleanly between stringer top and handrail underside
      for (let k = 1; k <= 5; k++) {
        const px = stX0 + (stX1 - stX0) * (k / 6);
        const py = stTopY * (k / 6);
        stairG.add(this.mesh(new T.CylinderGeometry(0.028, 0.034, 0.72, 8), this.m.marble, px, py + 0.40, stZ + dz));
      }
    }
    // Warm golden beacon lantern beside the staircase foot so players spot the roof stairs right away!
    stairG.add(
      this.mesh(new T.CylinderGeometry(0.055, 0.075, 1.35, 8), this.m.obsidian, stX0 - 0.34, 0.68, stZ - 0.72),
      this.mesh(new T.CylinderGeometry(0.12, 0.09, 0.24, 6), this.m.lantern, stX0 - 0.34, 1.44, stZ - 0.72),
      this.mesh(new T.ConeGeometry(0.17, 0.18, 6), this.m.gold, stX0 - 0.34, 1.62, stZ - 0.72)
    );
    // Top Rooftop Balcony Landing: x ∈ [1.45, 2.65] (0.31m clear of tBR!), z ∈ [-5.27, -3.25] (flush with roof eave at -3.25 — ZERO clipping!)
    const landX = 2.05, landW = 1.20, landZ = -4.26, landD = 2.02;
    const landColH = stTopY - 0.16;
    stairG.add(
      this.mesh(new T.BoxGeometry(landW, 0.16, landD), this.m.marble, landX, stTopY - 0.08, landZ),
      this.mesh(new T.BoxGeometry(landW + 0.04, 0.05, landD + 0.04), this.m.gold, landX, stTopY - 0.035, landZ),
      // Clean walnut threshold lip bridging onto the roof eave gateway (merlon i=+2 omitted!)
      this.mesh(new T.BoxGeometry(landW - 0.16, 0.034, 0.18), this.m.walnut, landX, stTopY + 0.017, -3.26),
      // Twin east support columns seated cleanly under the balcony slab (inner-east at z = -3.66 is 16cm CLEAR of z = -3.50 rear cornice!)
      this.mesh(new T.CylinderGeometry(0.078, 0.095, landColH, 10), this.m.marble, 2.57, landColH * 0.5, -5.18),
      this.mesh(new T.BoxGeometry(0.22, 0.08, 0.22), this.m.plinth, 2.57, 0.04, -5.18),
      this.mesh(new T.BoxGeometry(0.22, 0.06, 0.22), this.m.gold, 2.57, landColH, -5.18),
      this.mesh(new T.CylinderGeometry(0.078, 0.095, landColH, 10), this.m.marble, 2.57, landColH * 0.5, -3.66),
      this.mesh(new T.BoxGeometry(0.22, 0.08, 0.22), this.m.plinth, 2.57, 0.04, -3.66),
      this.mesh(new T.BoxGeometry(0.22, 0.06, 0.22), this.m.gold, 2.57, landColH, -3.66),
      // Exposed-edge balcony golden handrails connecting cleanly into square newel posts!
      this.mesh(new T.BoxGeometry(landW - 0.04, 0.065, 0.068), this.m.gold, landX, stTopY + 0.78, -5.27),
      this.mesh(new T.BoxGeometry(0.068, 0.065, landD - 0.08), this.m.gold, 2.62, stTopY + 0.78, -4.28),
      // Short West balcony return rail connecting stair inner newel (1.45, -4.03) to roof eave post (1.45, -3.30)
      this.mesh(new T.BoxGeometry(0.068, 0.065, 0.73), this.m.gold, 1.45, stTopY + 0.78, -3.665),
      // Interior balcony balusters
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.72, 8), this.m.marble, 2.05, stTopY + 0.39, -5.27),
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.72, 8), this.m.marble, 2.62, stTopY + 0.39, -4.62),
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.72, 8), this.m.marble, 2.62, stTopY + 0.39, -3.96),
      this.mesh(new T.CylinderGeometry(0.03, 0.036, 0.72, 8), this.m.marble, 1.45, stTopY + 0.39, -3.66)
    );
    addNewel(2.62, stTopY, -5.27);
    addNewel(2.62, stTopY, -3.30);
    addNewel(1.45, stTopY, -3.30);
    g.add(stairG);

    // Real physical colliders:
    // Every underside box strictly obeys h <= sy(x0 - 0.50m), guaranteeing >= +0.43m clearance while walking/sprinting up
    // (ZERO snagging, ZERO forced jumping!) while solidly blocking ground-level walking underneath the stairs!
    if (this.game && this.game.world) {
      if (this.game.world.boxes) {
        this.game.world.boxes.push(
          // Stepped underside masonry blockers (ground blocked; stair walker clears h with +0.43m..+0.60m safety margin!)
          { x0: wx - 2.40, x1: wx - 1.10, z0: wz - 5.26, z1: wz - 4.04, h: 0.85 },
          { x0: wx - 1.10, x1: wx + 0.20, z0: wz - 5.26, z1: wz - 4.04, h: 1.75 },
          { x0: wx + 0.20, x1: wx + 1.45, z0: wz - 5.26, z1: wz - 4.04, h: 2.70 },
          { x0: wx + 1.45, x1: wx + 2.68, z0: wz - 5.26, z1: wz - 3.28, h: 3.55 },
          // Outer North & inner South stair guardrails strictly OUTSIDE the 1.24m walkable tread (smooth 0.66m lane!)
          { x0: wx - 4.00, x1: wx + 2.74, z0: wz - 5.50, z1: wz - 5.32, h: 5.2 },
          { x0: wx - 4.00, x1: wx + 1.35, z0: wz - 3.98, z1: wz - 3.80, h: 5.2 },
          // East & West-return balcony guardrails leaving central 1.32m rooftop gateway wide open!
          { x0: wx + 2.70, x1: wx + 2.86, z0: wz - 5.36, z1: wz - 3.28, h: 5.2 },
          { x0: wx + 1.22, x1: wx + 1.38, z0: wz - 3.98, z1: wz - 3.30, h: 5.2 }
        );
      }
      if (this.game.world.circles) {
        this.game.world.circles.push(
          { x: wx + stX0 - 0.34, z: wz + stZ - 0.72, r: 0.22, top: 1.8 },
          // Central Rooftop Belfry Spire collider (inside ground keep box, keeps rooftop walkers cleanly around spire!)
          { x: wx, z: wz, r: 0.94, top: 9.7 }
        );
      }
    }

    // Register smooth walkable platforms for Rear Staircase, Top Balcony Landing, Porch Canopy & Main Castle Roof!
    if (this.game && this.game.world && this.game.world.platforms) {
      const footY = () => {
        const pl = this.game.player;
        return pl ? pl.y - pl.eye + pl.air : wy;
      };
      const roofSurfaceY = (pz) => {
        const lz = pz - wz;
        // Exact outer envelope of mainRoofGeo (4.22..6.47) + snowCapGeo (up to 6.53 at |lz|<=1.18) + 3cm shoe clearance!
        return wy + 4.26 + 2.30 * Math.max(0, Math.min(1, (3.25 - Math.abs(lz)) / 2.07));
      };
      this.game.world.platforms.push(
        // (a) Rear Roof Grand Staircase ramp (walk/sprint smoothly from snow y = 0 up to y = 4.26 without jumping!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            if (lx < stX0 - 0.35 || lx > stX1 + 0.22 || lz < stZ - 0.68 || lz > stZ + 0.68) return false;
            const sy = wy + stTopY * Math.max(0, Math.min(1, (lx - stX0) / (stX1 - stX0)));
            return footY() >= sy - 1.10;
          },
          y: (px) => wy + stTopY * Math.max(0, Math.min(1, (px - wx - stX0) / (stX1 - stX0))),
          wood: true
        },
        // (b) Top Rooftop Balcony Landing (seamless 0.00m transition onto roof eave gateway!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            return lx >= 1.35 && lx <= 2.74 && lz >= -5.32 && lz <= -3.14 && footY() >= wy + stTopY - 1.15;
          },
          camTest: (px, pz, py) => {
            const lx = px - wx, lz = pz - wz;
            return lx >= 1.35 && lx <= 2.74 && lz >= -5.32 && lz <= -3.14 && py >= wy + 3.2;
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
            return footY() >= cy - 0.70;
          },
          y: (px, pz) => wy + 2.86 - (pz - wz - 4.10) * 0.22,
          wood: false
        },
        // (d) Entire Walkable Main Castle Terracotta & Snow Roof (4.26m at eaves -> 6.56m snowy terrace; solidRoof keeps 3rd-person cam cleanly above roof!)
        {
          test: (px, pz) => {
            const lx = px - wx, lz = pz - wz;
            if (lx < -3.88 || lx > 3.88 || lz < -3.30 || lz > 3.30) return false;
            return footY() >= roofSurfaceY(pz) - 1.25;
          },
          camTest: (px, pz, py) => {
            const lx = px - wx, lz = pz - wz;
            return lx >= -3.96 && lx <= 3.96 && lz >= -3.36 && lz <= 3.36 && py >= wy + 3.2;
          },
          y: (px, pz) => roofSurfaceY(pz),
          solidRoof: true,
          wood: false
        }
      );
    }

    g.updateMatrixWorld(true);
    this.ext = g;
    return g;
  }

  // === PART B: GRAND ROYAL CHÂTEAU PALACE SALON & PRINCESS SUITE INTERIOR ===
  // Spacious 14.0m × 11.6m × 6.2m cathedral-vaulted palace hall at _i = (0, 1500, 1500)
  // with thick zero-bleed walls, mezzanine gallery, 2-tier crystal chandelier, monumental fireplace,
  // concert piano, 3.8m Christmas tree, grand library & full 3rd-person visible Princess Canopy Bed sleeping!
  buildInterior(origin, paneMat, bulbMats) {
    const T = this.THREE;
    if (!this.m) this.makeMats();
    const { world, scene } = this.game;

    const g = new T.Group();
    g.name = "claude_castle_grand_interior";
    g.position.set(origin.x, origin.y, origin.z);
    const W = 14.0, D = 11.6, H = 6.2;
    const HW = W / 2, HD = D / 2; // 7.0, 5.8

    // Strict indoor camera bounds (0.42m inside all thick walls & ceiling -> ZERO seeing outside sky void!)
    this.intBounds = {
      x0: origin.x - HW + 0.42,
      x1: origin.x + HW - 0.42,
      y0: origin.y + 0.38,
      y1: origin.y + H - 0.42,
      z0: origin.z - HD + 0.42,
      z1: origin.z + HD - 0.42
    };

    const im = this.m.intMarble, isnow = this.m.intSnow;
    // Scale parquet UVs nicely across our grand 14m × 11.6m hall
    if (this.m.parquet && this.m.parquet.map) this.m.parquet.map.repeat.set(6, 5);

    // -------------------------------------------------------------------------
    // 1. HONEY-OAK PARQUET FLOOR, MARBLE PERIMETER INLAY & ROYAL CARPETS
    // -------------------------------------------------------------------------
    g.add(
      this.mesh(new T.BoxGeometry(W + 1.2, 0.24, D + 1.2), this.m.parquet, 0, -0.12, 0),
      // Wide cream-marble & gilded perimeter inlay border
      this.mesh(new T.BoxGeometry(W + 0.2, 0.014, 0.62), im, 0, 0.007, -HD + 0.31),
      this.mesh(new T.BoxGeometry(W + 0.2, 0.014, 0.62), im, 0, 0.007, HD - 0.31),
      this.mesh(new T.BoxGeometry(0.62, 0.014, D - 1.2), im, -HW + 0.31, 0.007, 0),
      this.mesh(new T.BoxGeometry(0.62, 0.014, D - 1.2), im, HW - 0.31, 0.007, 0),
      // Grand Center Circular Royal Sunflower Medallion Carpet (r = 2.45m)
      this.mesh(new T.CylinderGeometry(2.48, 2.52, 0.024, 44), this.m.carpet, -0.25, 0.012, 0.20),
      this.mesh(new T.TorusGeometry(2.50, 0.028, 6, 48).rotateX(Math.PI / 2), this.m.gold, -0.25, 0.022, 0.20),
      // Plush West Hearth Salon Velvet Rug + Gold Fringe
      this.mesh(new T.BoxGeometry(4.4, 0.022, 4.4), this.m.velvet, -3.95, 0.011, 0),
      this.mesh(new T.BoxGeometry(4.52, 0.016, 4.52), this.m.gold, -3.95, 0.008, 0),
      // Crimson-Gold Entrance Carpet Runner from South Double Doors toward Center Medallion
      this.mesh(new T.BoxGeometry(1.76, 0.020, 3.65), this.m.gold, -1.0, 0.010, 3.85),
      this.mesh(new T.BoxGeometry(1.56, 0.024, 3.60), this.m.terracotta, -1.0, 0.012, 3.85)
    );

    // -------------------------------------------------------------------------
    // 2. THICK DOUBLE-BACKED BOISERIE PALACE WALLS, 12 CORINTHIAN PILASTERS & MEZZANINE GALLERY!
    // -------------------------------------------------------------------------
    const wallSide = (w, h, d, x, y, z) => this.mesh(new T.BoxGeometry(w, h, d), this.m.wainscot, x, y, z);
    // 0.56m thick solid outer enclosure shells (zero light leaks, zero outside void bleed!)
    g.add(
      wallSide(W + 1.2, H + 0.6, 0.56, 0, H / 2, -HD - 0.28),
      wallSide(W + 1.2, H + 0.6, 0.56, 0, H / 2, HD + 0.28),
      wallSide(0.56, H + 0.6, D + 1.2, -HW - 0.28, H / 2, 0),
      wallSide(0.56, H + 0.6, D + 1.2, HW + 0.28, H / 2, 0),
      // Carved travertine lower wainscoting dado around all 4 walls (h = 1.18m)
      this.mesh(new T.BoxGeometry(W, 1.18, 0.10), im, 0, 0.59, -HD + 0.05),
      this.mesh(new T.BoxGeometry(W, 1.18, 0.10), im, 0, 0.59, HD - 0.05),
      this.mesh(new T.BoxGeometry(0.10, 1.18, D), im, -HW + 0.05, 0.59, 0),
      this.mesh(new T.BoxGeometry(0.10, 1.18, D), im, HW - 0.05, 0.59, 0),
      // Golden chair rail (y = 1.20), mezzanine entablature (y = 3.85), and grand crown cornice (y = 6.08)
      this.mesh(new T.BoxGeometry(W, 0.07, 0.14), this.m.gold, 0, 1.20, -HD + 0.07),
      this.mesh(new T.BoxGeometry(W, 0.07, 0.14), this.m.gold, 0, 1.20, HD - 0.07),
      this.mesh(new T.BoxGeometry(0.14, 0.07, D), this.m.gold, -HW + 0.07, 1.20, 0),
      this.mesh(new T.BoxGeometry(0.14, 0.07, D), this.m.gold, HW - 0.07, 1.20, 0),
      this.mesh(new T.BoxGeometry(W, 0.18, 0.22), this.m.gold, 0, H - 0.12, -HD + 0.11),
      this.mesh(new T.BoxGeometry(W, 0.18, 0.22), this.m.gold, 0, H - 0.12, HD - 0.11),
      this.mesh(new T.BoxGeometry(0.22, 0.18, D), this.m.gold, -HW + 0.11, H - 0.12, 0),
      this.mesh(new T.BoxGeometry(0.22, 0.18, D), this.m.gold, HW - 0.11, H - 0.12, 0)
    );

    // 14 Fluted Corinthian Marble Pilasters with Carved Plinths, Golden Capitals & Glowing Wall Sconces!
    const addPilaster = (x, z, rotY, hasSconce = true) => {
      const pg = new T.Group();
      pg.position.set(x, 0, z);
      pg.rotation.y = rotY;
      pg.add(
        this.mesh(new T.BoxGeometry(0.42, 0.42, 0.24), this.m.plinth, 0, 0.21, 0),
        this.mesh(new T.BoxGeometry(0.32, H - 0.65, 0.18), im, 0, H * 0.5, 0),
        this.mesh(new T.BoxGeometry(0.40, 0.24, 0.26), this.m.gold, 0, H - 0.24, 0),
        this.mesh(new T.BoxGeometry(0.38, 0.10, 0.24), this.m.gold, 0, 3.88, 0)
      );
      if (hasSconce) {
        pg.add(
          this.mesh(new T.BoxGeometry(0.12, 0.24, 0.06), this.m.gold, 0, 2.55, 0.12),
          this.mesh(new T.CylinderGeometry(0.018, 0.018, 0.18, 6).rotateX(Math.PI / 2), this.m.gold, 0, 2.52, 0.20),
          this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.lantern, 0, 2.66, 0.26),
          this.mesh(new T.TorusGeometry(0.11, 0.018, 6, 14).rotateX(Math.PI / 2), this.m.gold, 0, 2.56, 0.26)
        );
      }
      g.add(pg);
    };
    for (const px of [-5.8, -1.9, 1.9, 5.8]) {
      addPilaster(px, -HD + 0.09, 0, true);
      addPilaster(px, HD - 0.09, Math.PI, true);
    }
    for (const pz of [-3.6, 3.6]) {
      addPilaster(-HW + 0.09, pz, Math.PI / 2, true);
      addPilaster(HW - 0.09, pz, -Math.PI / 2, true);
    }

    // Decorative Upper Mezzanine Gallery Cornice & Gilded Balcony Railings at y = 3.92m (East & West flanks!)
    for (const side of [-1, 1]) {
      const mx = side * (HW - 0.45);
      g.add(
        this.mesh(new T.BoxGeometry(0.92, 0.16, D - 0.8), im, mx, 3.92, 0),
        this.mesh(new T.BoxGeometry(0.96, 0.06, D - 0.7), this.m.gold, mx, 4.02, 0),
        this.mesh(new T.BoxGeometry(0.08, 0.08, D - 1.2), this.m.gold, side * (HW - 0.86), 4.82, 0)
      );
      for (let b = -4; b <= 4; b++) {
        g.add(this.mesh(new T.CylinderGeometry(0.032, 0.04, 0.78, 8), im, side * (HW - 0.86), 4.42, b * 1.15));
      }
    }

    // -------------------------------------------------------------------------
    // 3. SOARING COFFERED TWILIGHT-BLUE & GOLD VAULTED PALACE CEILING (y = 6.2m)
    // -------------------------------------------------------------------------
    g.add(
      this.mesh(new T.BoxGeometry(W + 1.2, 0.30, D + 1.2), this.m.cofferBlue, 0, H + 0.14, 0),
      // Central sculpted marble & gold ceiling rose medallion
      this.mesh(new T.CylinderGeometry(1.45, 1.65, 0.16, 28), im, 0, H - 0.08, -0.25),
      this.mesh(new T.TorusGeometry(1.52, 0.06, 8, 32).rotateX(Math.PI / 2), this.m.gold, 0, H - 0.12, -0.25)
    );
    for (const rx of [-5.8, -1.9, 1.9, 5.8]) {
      g.add(
        this.mesh(new T.BoxGeometry(0.28, 0.24, D), im, rx, H - 0.10, 0),
        this.mesh(new T.BoxGeometry(0.32, 0.07, D), this.m.gold, rx, H - 0.22, 0)
      );
    }
    for (const rz of [-3.6, 0, 3.6]) {
      g.add(
        this.mesh(new T.BoxGeometry(W, 0.24, 0.26), im, 0, H - 0.10, rz),
        this.mesh(new T.BoxGeometry(W, 0.07, 0.30), this.m.gold, 0, H - 0.22, rz)
      );
    }

    // -------------------------------------------------------------------------
    // 4. THREE SOARING CATHEDRAL GOTHIC WINDOWS ON NORTH WALL + CUSHIONED WINDOW SEATS!
    // -------------------------------------------------------------------------
    for (const wx of [-3.85, 0.0, 3.85]) {
      const wg = new T.Group();
      wg.position.set(wx, 3.15, -HD + 0.12);
      const pane = this.mesh(new T.PlaneGeometry(1.92, 3.30), this.m.nightPane || paneMat, 0, 0, 0.03);
      pane.castShadow = false;
      wg.add(
        pane,
        // Deep carved Gothic stone jambs, sill & golden arch hood + rose tracery
        this.mesh(new T.BoxGeometry(0.18, 3.40, 0.26), im, -1.04, 0, 0.08),
        this.mesh(new T.BoxGeometry(0.18, 3.40, 0.26), im, 1.04, 0, 0.08),
        this.mesh(new T.BoxGeometry(2.36, 0.16, 0.34), im, 0, -1.72, 0.12),
        this.mesh(new T.TorusGeometry(1.02, 0.09, 8, 28, Math.PI), this.m.gold, 0, 1.38, 0.08),
        this.mesh(new T.TorusGeometry(0.36, 0.04, 6, 20), this.m.gold, 0, 1.78, 0.09),
        // Crisp wrought-iron cathedral mullions
        this.mesh(new T.BoxGeometry(0.05, 3.32, 0.08), this.m.obsidian, 0, 0, 0.07),
        this.mesh(new T.BoxGeometry(0.04, 3.32, 0.07), this.m.obsidian, -0.52, 0, 0.07),
        this.mesh(new T.BoxGeometry(0.04, 3.32, 0.07), this.m.obsidian, 0.52, 0, 0.07),
        this.mesh(new T.BoxGeometry(1.94, 0.05, 0.08), this.m.obsidian, 0, 0.55, 0.07),
        this.mesh(new T.BoxGeometry(1.94, 0.05, 0.08), this.m.obsidian, 0, -0.55, 0.07),
        // Tailored French Hourglass Velvet Palace Drapes + Gilded Cornice Rod & Tiebacks!
        this.mesh(new T.CylinderGeometry(0.036, 0.036, 2.76, 10).rotateZ(Math.PI / 2), this.m.gold, 0, 2.18, 0.20),
        this.mesh(new T.SphereGeometry(0.068, 8, 6), this.m.gold, -1.40, 2.18, 0.20),
        this.mesh(new T.SphereGeometry(0.068, 8, 6), this.m.gold, 1.40, 2.18, 0.20),
        // Left gathered hourglass drape (upper taper into golden tieback + lower graceful flare)
        this.mesh(new T.CylinderGeometry(0.14, 0.065, 2.45, 10), this.m.velvet, -1.24, 0.90, 0.19),
        this.mesh(new T.CylinderGeometry(0.065, 0.16, 1.95, 10), this.m.velvet, -1.24, -1.30, 0.19),
        this.mesh(new T.TorusGeometry(0.088, 0.024, 6, 14).rotateX(Math.PI / 2), this.m.gold, -1.24, -0.32, 0.19),
        // Right gathered hourglass drape
        this.mesh(new T.CylinderGeometry(0.14, 0.065, 2.45, 10), this.m.velvet, 1.24, 0.90, 0.19),
        this.mesh(new T.CylinderGeometry(0.065, 0.16, 1.95, 10), this.m.velvet, 1.24, -1.30, 0.19),
        this.mesh(new T.TorusGeometry(0.088, 0.024, 6, 14).rotateX(Math.PI / 2), this.m.gold, 1.24, -0.32, 0.19)
      );
      // Plush Cushioned Marble Window Seat under the center cathedral window (keeps NW corner spacious for Grand Piano!)
      if (Math.abs(wx) < 0.1) {
        wg.add(
          this.mesh(new T.BoxGeometry(2.18, 0.50, 0.62), im, 0, -2.90, 0.24),
          this.mesh(new T.BoxGeometry(2.06, 0.10, 0.54), this.m.velvet, 0, -2.61, 0.24),
          this.mesh(new T.BoxGeometry(2.22, 0.04, 0.66), this.m.gold, 0, -2.65, 0.24)
        );
      }
      g.add(wg);
    }

    // -------------------------------------------------------------------------
    // 5. MONUMENTAL 2-TIER GOLDEN CRYSTAL SUNFLOWER CHANDELIER (Center, y = 4.35m)
    // -------------------------------------------------------------------------
    const chand = new T.Group();
    chand.position.set(0, 4.35, -0.25);
    chand.add(
      this.mesh(new T.CylinderGeometry(0.035, 0.035, 1.85, 10), this.m.gold, 0, 0.92, 0),
      // Lower grand ring (r = 1.62m) & upper crown ring (r = 0.94m)
      this.mesh(new T.TorusGeometry(1.62, 0.048, 10, 40).rotateX(Math.PI / 2), this.m.gold, 0, 0, 0),
      this.mesh(new T.TorusGeometry(0.94, 0.038, 10, 32).rotateX(Math.PI / 2), this.m.gold, 0, 0.68, 0),
      this.mesh(new T.OctahedronGeometry(0.24, 1), this.m.crystal, 0, -0.34, 0)
    );
    const chandSun = this.mkSunflower(0.42, true);
    chandSun.rotation.x = Math.PI / 2;
    chandSun.position.set(0, -0.10, 0);
    chand.add(chandSun);
    // 12 Lower-tier candles + crystal drops + curved arms
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const cx = Math.cos(a) * 1.62, cz = Math.sin(a) * 1.62;
      const arm = this.mesh(new T.CylinderGeometry(0.02, 0.02, 1.62, 6).rotateZ(Math.PI / 2), this.m.gold, cx * 0.5, 0, cz * 0.5);
      arm.rotation.y = -a;
      chand.add(
        arm,
        this.mesh(new T.CylinderGeometry(0.034, 0.036, 0.24, 8), this.m.silkCream, cx, 0.14, cz),
        this.mesh(new T.SphereGeometry(0.055, 8, 6), this.m.lantern, cx, 0.30, cz),
        this.mesh(new T.OctahedronGeometry(0.068, 0), this.m.crystal, cx * 0.96, -0.16, cz * 0.96)
      );
    }
    // 6 Upper-tier candles + crystal swags
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const cx = Math.cos(a) * 0.94, cz = Math.sin(a) * 0.94;
      const arm = this.mesh(new T.CylinderGeometry(0.018, 0.018, 0.94, 6).rotateZ(Math.PI / 2), this.m.gold, cx * 0.5, 0.68, cz * 0.5);
      arm.rotation.y = -a;
      chand.add(
        arm,
        this.mesh(new T.CylinderGeometry(0.028, 0.030, 0.20, 8), this.m.silkCream, cx, 0.80, cz),
        this.mesh(new T.SphereGeometry(0.048, 8, 6), this.m.lantern, cx, 0.94, cz),
        this.mesh(new T.OctahedronGeometry(0.058, 0), this.m.crystal, cx, 0.52, cz)
      );
    }
    this.chandelier = chand;
    g.add(chand);

    // -------------------------------------------------------------------------
    // 6. MONUMENTAL WEST ROYAL MARBLE FIREPLACE & FIRESIDE COCOA SALON (-6.38, 0)
    // -------------------------------------------------------------------------
    const fp = new T.Group();
    fp.position.set(-6.38, 0, 0);
    fp.add(
      // Raised marble hearth apron & monumental carved piers + chimney breast soaring to ceiling
      this.mesh(new T.BoxGeometry(1.25, 0.16, 4.10), this.m.plinth, 0.18, 0.08, 0),
      this.mesh(new T.BoxGeometry(0.95, 2.05, 0.72), im, 0.02, 1.04, -1.52),
      this.mesh(new T.BoxGeometry(0.95, 2.05, 0.72), im, 0.02, 1.04, 1.52),
      this.mesh(new T.BoxGeometry(0.86, 3.95, 3.45), im, -0.04, 4.15, 0),
      // Fluted golden fireplace side colonnettes
      this.mesh(new T.CylinderGeometry(0.11, 0.13, 1.95, 12), this.m.marble, 0.44, 1.05, -1.48),
      this.mesh(new T.CylinderGeometry(0.11, 0.13, 1.95, 12), this.m.marble, 0.44, 1.05, 1.48),
      // Sculpted overhanging mantelpiece shelf
      this.mesh(new T.BoxGeometry(1.18, 0.20, 4.05), im, 0.12, 2.12, 0),
      this.mesh(new T.BoxGeometry(1.24, 0.07, 4.12), this.m.gold, 0.14, 2.24, 0),
      // Deep obsidian firebox + wrought-iron grate + stacked birch logs + glowing ember bed!
      this.mesh(new T.BoxGeometry(0.56, 1.72, 2.25), this.m.obsidian, -0.14, 0.96, 0),
      this.mesh(new T.CylinderGeometry(0.10, 0.11, 1.28, 8).rotateX(Math.PI / 2), this.m.walnut, 0.14, 0.28, 0),
      this.mesh(new T.CylinderGeometry(0.09, 0.10, 1.15, 8).rotateX(Math.PI / 2), this.m.walnut, 0.24, 0.42, 0.08),
      this.mesh(new T.CylinderGeometry(0.08, 0.09, 1.08, 8).rotateX(Math.PI / 2), this.m.walnut, 0.04, 0.40, -0.10),
      this.mesh(new T.SphereGeometry(0.36, 12, 8), this.m.embers, 0.15, 0.36, 0),
      // Ornamental wrought-iron & brass hearth fender rail
      this.mesh(new T.BoxGeometry(0.04, 0.04, 2.24), this.m.gold, 0.56, 0.38, 0),
      this.mesh(new T.CylinderGeometry(0.025, 0.035, 0.32, 8), this.m.gold, 0.56, 0.24, -1.06),
      this.mesh(new T.CylinderGeometry(0.025, 0.035, 0.32, 8), this.m.gold, 0.56, 0.24, 1.06),
      this.mesh(new T.SphereGeometry(0.048, 8, 6), this.m.gold, 0.56, 0.42, -1.06),
      this.mesh(new T.SphereGeometry(0.048, 8, 6), this.m.gold, 0.56, 0.42, 1.06)
    );
    fp.children[fp.children.length - 6].scale.set(0.85, 0.60, 1.65);
    // 3 Animated Layered Dancing 3D Hearth Flames!
    this.hearthFlames = [];
    for (const [fz, fh, fr, ph] of [[-0.42, 0.62, 0.17, 0.0], [0.0, 0.84, 0.22, 1.7], [0.40, 0.58, 0.16, 3.1]]) {
      const fl = new T.Group();
      fl.position.set(0.18, 0.42, fz);
      const outer = this.mesh(new T.ConeGeometry(fr, fh, 9), this.m.flameOuter, 0, fh * 0.45, 0);
      const inner = this.mesh(new T.ConeGeometry(fr * 0.56, fh * 0.68, 8), this.m.flameInner, 0.04, fh * 0.32, 0);
      outer.castShadow = inner.castShadow = false;
      fl.add(outer, inner);
      fp.add(fl);
      this.hearthFlames.push({ obj: fl, ph, baseH: 1 });
    }

    // Matte Gilded Framed Royal Winter Château Oil Painting (offset cleanly in front of walnut liner — zero z-fighting!)
    const paint = this.mesh(new T.PlaneGeometry(2.12, 1.52), this.m.painting, 0.465, 3.62, 0);
    paint.rotation.y = Math.PI / 2;
    fp.add(
      this.mesh(new T.BoxGeometry(0.09, 1.80, 2.40), this.m.gold, 0.38, 3.62, 0),
      this.mesh(new T.BoxGeometry(0.07, 1.64, 2.24), this.m.walnut, 0.405, 3.62, 0),
      paint
    );
    const crest = this.mkSunflower(0.82, false);
    crest.position.set(0.45, 5.18, 0);
    crest.rotation.y = Math.PI / 2;
    fp.add(crest);

    // Ornate Victorian Gilded Mantel Clock sitting proudly at center of mantelpiece!
    fp.add(
      this.mesh(new T.BoxGeometry(0.24, 0.10, 0.52), this.m.walnut, 0.44, 2.32, 0),
      this.mesh(new T.CylinderGeometry(0.20, 0.22, 0.20, 18).rotateZ(Math.PI / 2), this.m.gold, 0.44, 2.54, 0),
      this.mesh(new T.CylinderGeometry(0.15, 0.15, 0.02, 18).rotateZ(Math.PI / 2), this.m.silkCream, 0.55, 2.54, 0),
      this.mesh(new T.BoxGeometry(0.015, 0.09, 0.016), this.m.obsidian, 0.565, 2.57, 0.01),
      this.mesh(new T.BoxGeometry(0.015, 0.016, 0.08), this.m.obsidian, 0.565, 2.54, -0.03),
      this.mesh(new T.SphereGeometry(0.055, 8, 6), this.m.gold, 0.44, 2.78, 0)
    );

    // Festive Mantel Pine Garland, Colorful Fairy Bulbs, Candlesticks & 5 Cozy Stockings!
    fp.add(this.mesh(new T.BoxGeometry(0.18, 0.16, 3.65), this.m.pine, 0.68, 2.15, 0));
    const stockCols = [this.m.terracotta, this.m.pine, this.m.apricot, this.m.velvet, this.m.pine];
    for (let i = 0; i < 5; i++) {
      const sz = -1.24 + i * 0.62;
      fp.add(
        this.mesh(new T.BoxGeometry(0.08, 0.34, 0.17), stockCols[i], 0.74, 1.90, sz),
        this.mesh(new T.BoxGeometry(0.09, 0.08, 0.19), isnow, 0.74, 2.08, sz)
      );
    }
    for (const cz of [-1.52, -1.18, 1.18, 1.52]) {
      fp.add(
        this.mesh(new T.CylinderGeometry(0.04, 0.07, 0.24, 8), this.m.gold, 0.46, 2.38, cz),
        this.mesh(new T.CylinderGeometry(0.032, 0.032, 0.22, 8), this.m.silkCream, 0.46, 2.60, cz),
        this.mesh(new T.SphereGeometry(0.042, 8, 6), this.m.lantern, 0.46, 2.75, cz)
      );
    }
    if (bulbMats && bulbMats.length) {
      for (let i = 0; i < 11; i++) {
        const b = this.mesh(new T.SphereGeometry(0.042, 8, 6), bulbMats[i % bulbMats.length], 0.77, 2.16, -1.55 + i * 0.31);
        b.castShadow = false;
        fp.add(b);
      }
    }
    g.add(fp);

    // Sculpted Curved French Chesterfield Tufted Velvet Sofa (-3.35, -1.78) — clear 1.3m aisle from Grand Piano!
    const sofa = new T.Group();
    sofa.position.set(-3.35, 0, -1.78);
    sofa.rotation.y = -0.26;
    sofa.add(
      // Carved mahogany & gold apron + 4 turned golden cabriole legs
      this.mesh(new T.BoxGeometry(2.04, 0.16, 0.84), this.m.walnut, 0, 0.22, 0),
      this.mesh(new T.BoxGeometry(2.10, 0.04, 0.88), this.m.gold, 0, 0.30, 0),
      this.mesh(new T.CylinderGeometry(0.038, 0.024, 0.18, 8), this.m.gold, -0.94, 0.09, -0.34),
      this.mesh(new T.CylinderGeometry(0.038, 0.024, 0.18, 8), this.m.gold, 0.94, 0.09, -0.34),
      this.mesh(new T.CylinderGeometry(0.038, 0.024, 0.18, 8), this.m.gold, -0.94, 0.09, 0.34),
      this.mesh(new T.CylinderGeometry(0.038, 0.024, 0.18, 8), this.m.gold, 0.94, 0.09, 0.34),
      // Plump rounded twin seat cushions (soft oval bolster profile!)
      this.mesh(new T.CylinderGeometry(0.36, 0.36, 0.88, 12).rotateZ(Math.PI / 2), this.m.velvet, -0.46, 0.40, 0.04),
      this.mesh(new T.CylinderGeometry(0.36, 0.36, 0.88, 12).rotateZ(Math.PI / 2), this.m.velvet, 0.46, 0.40, 0.04),
      // Tufted rolled Chesterfield backrest + golden crest rail
      this.mesh(new T.BoxGeometry(1.94, 0.62, 0.18), this.m.velvet, 0, 0.72, -0.34),
      this.mesh(new T.CylinderGeometry(0.13, 0.13, 1.98, 12).rotateZ(Math.PI / 2), this.m.velvet, 0, 1.02, -0.34),
      this.mesh(new T.CylinderGeometry(0.032, 0.032, 2.04, 10).rotateZ(Math.PI / 2), this.m.gold, 0, 1.14, -0.34),
      // Signature rolled Chesterfield cylindrical armrests!
      this.mesh(new T.BoxGeometry(0.20, 0.42, 0.82), this.m.velvet, -0.98, 0.48, 0),
      this.mesh(new T.CylinderGeometry(0.14, 0.14, 0.86, 12).rotateX(Math.PI / 2), this.m.velvet, -1.00, 0.70, 0),
      this.mesh(new T.BoxGeometry(0.20, 0.42, 0.82), this.m.velvet, 0.98, 0.48, 0),
      this.mesh(new T.CylinderGeometry(0.14, 0.14, 0.86, 12).rotateX(Math.PI / 2), this.m.velvet, 1.00, 0.70, 0)
    );
    // Squishy curved silk & embroidered throw pillows resting casually in the corners
    const sp1 = this.mesh(new T.SphereGeometry(0.24, 12, 10), this.m.silkCream, -0.68, 0.68, -0.14);
    sp1.scale.set(1.0, 0.92, 0.45); sp1.rotation.set(-0.22, 0.35, 0.12);
    const sp2 = this.mesh(new T.SphereGeometry(0.24, 12, 10), this.m.apricot, 0.68, 0.68, -0.14);
    sp2.scale.set(1.0, 0.92, 0.45); sp2.rotation.set(-0.22, -0.35, -0.12);
    sofa.add(sp1, sp2);
    // Flatten twin seat cushions into plush oval pads
    sofa.children[6].scale.set(1, 0.48, 1);
    sofa.children[7].scale.set(1, 0.48, 1);
    g.add(sofa);

    // Two Sculpted Seamless Louis-XVI Medallion-Back Armchairs (flush gilded oval frame, zero floating hoops!)
    for (const [cx, cz, ry] of [[-3.55, 2.25, -Math.PI * 0.84], [-1.95, 1.35, -Math.PI * 0.66]]) {
      const ch = new T.Group();
      ch.position.set(cx, 0, cz);
      ch.rotation.y = ry;
      const seatPad = this.mesh(new T.SphereGeometry(0.42, 14, 10), this.m.velvet, 0, 0.44, 0.03);
      seatPad.scale.set(0.96, 0.38, 0.90);
      // Seamless plush oval medallion backrest flush inside its gilded medallion rim
      const backMedallion = this.mesh(new T.SphereGeometry(0.38, 14, 12), this.m.velvet, 0, 0.86, -0.28);
      backMedallion.scale.set(1.0, 1.18, 0.24);
      const backRim = this.mesh(new T.TorusGeometry(0.39, 0.028, 8, 26), this.m.gold, 0, 0.86, -0.28);
      backRim.scale.set(1.0, 1.18, 1.0);
      const pillow = this.mesh(new T.SphereGeometry(0.18, 10, 8), this.m.silkCream, 0, 0.64, -0.14);
      pillow.scale.set(1.0, 0.86, 0.42);
      ch.add(
        this.mesh(new T.CylinderGeometry(0.42, 0.40, 0.16, 16), this.m.walnut, 0, 0.24, 0),
        this.mesh(new T.TorusGeometry(0.42, 0.025, 8, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.32, 0),
        this.mesh(new T.CylinderGeometry(0.032, 0.022, 0.18, 8), this.m.gold, -0.30, 0.09, -0.26),
        this.mesh(new T.CylinderGeometry(0.032, 0.022, 0.18, 8), this.m.gold, 0.30, 0.09, -0.26),
        this.mesh(new T.CylinderGeometry(0.032, 0.022, 0.18, 8), this.m.gold, -0.30, 0.09, 0.26),
        this.mesh(new T.CylinderGeometry(0.032, 0.022, 0.18, 8), this.m.gold, 0.30, 0.09, 0.26),
        // Sturdy twin gilded backrest stiles joining seat frame to medallion back
        this.mesh(new T.CylinderGeometry(0.024, 0.026, 0.38, 8), this.m.gold, -0.22, 0.46, -0.28),
        this.mesh(new T.CylinderGeometry(0.024, 0.026, 0.38, 8), this.m.gold, 0.22, 0.46, -0.28),
        seatPad, backMedallion, backRim, pillow,
        // Rolled curved arms with brass support uprights
        this.mesh(new T.CylinderGeometry(0.082, 0.082, 0.64, 10).rotateX(Math.PI / 2), this.m.velvet, -0.39, 0.62, 0.02),
        this.mesh(new T.CylinderGeometry(0.082, 0.082, 0.64, 10).rotateX(Math.PI / 2), this.m.velvet, 0.39, 0.62, 0.02),
        this.mesh(new T.CylinderGeometry(0.024, 0.024, 0.28, 8), this.m.gold, -0.39, 0.46, 0.24),
        this.mesh(new T.CylinderGeometry(0.024, 0.024, 0.28, 8), this.m.gold, 0.39, 0.46, 0.24)
      );
      g.add(ch);
    }

    // Ornate Carved Marble & Gold Hot-Cocoa Tea Table (-3.45, 0) with Teapot, Mugs & Macaron Cake Stand!
    const cocoaT = new T.Group();
    cocoaT.position.set(-3.45, 0, 0);
    cocoaT.add(
      this.mesh(new T.CylinderGeometry(0.56, 0.56, 0.06, 28), this.m.marble, 0, 0.62, 0),
      this.mesh(new T.TorusGeometry(0.56, 0.026, 8, 30).rotateX(Math.PI / 2), this.m.gold, 0, 0.62, 0),
      this.mesh(new T.CylinderGeometry(0.08, 0.22, 0.58, 12), this.m.gold, 0, 0.30, 0),
      this.mesh(new T.CylinderGeometry(0.32, 0.36, 0.06, 16), im, 0, 0.03, 0),
      // Gilded Porcelain Cocoa Teapot + 3 Whipped-Cream Cocoa Mugs + 2-Tier Pastry Stand!
      this.mesh(new T.SphereGeometry(0.11, 12, 10), this.m.gold, -0.18, 0.74, -0.14),
      this.mesh(new T.CylinderGeometry(0.06, 0.052, 0.12, 10), this.m.terracotta, -0.14, 0.71, 0.16),
      this.mesh(new T.CylinderGeometry(0.054, 0.054, 0.024, 10), this.m.snow, -0.14, 0.77, 0.16),
      this.mesh(new T.CylinderGeometry(0.06, 0.052, 0.12, 10), this.m.marble, 0.12, 0.71, 0.20),
      this.mesh(new T.CylinderGeometry(0.054, 0.054, 0.024, 10), this.m.snow, 0.12, 0.77, 0.20),
      // 2-tier golden dessert stand
      this.mesh(new T.CylinderGeometry(0.015, 0.02, 0.24, 8), this.m.gold, 0.20, 0.77, -0.14),
      this.mesh(new T.CylinderGeometry(0.17, 0.15, 0.02, 16), this.m.marble, 0.20, 0.69, -0.14),
      this.mesh(new T.CylinderGeometry(0.11, 0.09, 0.02, 16), this.m.marble, 0.20, 0.84, -0.14),
      this.mesh(new T.SphereGeometry(0.04, 8, 6), this.m.apricot, 0.16, 0.72, -0.10),
      this.mesh(new T.SphereGeometry(0.04, 8, 6), this.m.hollyRed, 0.24, 0.72, -0.17),
      this.mesh(new T.SphereGeometry(0.036, 8, 6), this.m.apricot, 0.20, 0.87, -0.14)
    );
    g.add(cocoaT);

    // -------------------------------------------------------------------------
    // 7. NE ROYAL PRINCESS SUITE ALCOVE: RAISED DAIS + FOUR-POSTER CANOPY BED + 3RD-PERSON SLEEP!
    // -------------------------------------------------------------------------
    const daisH = 0.18;
    const bedX = 4.15, bedZ = -3.35;
    // Elevated carved marble & royal velvet sleeping dais (4.5m × 3.5m × 0.18m)
    g.add(
      this.mesh(new T.BoxGeometry(4.56, daisH, 3.56), im, bedX, daisH * 0.5, bedZ),
      this.mesh(new T.BoxGeometry(4.62, 0.04, 3.62), this.m.gold, bedX, daisH - 0.01, bedZ),
      this.mesh(new T.BoxGeometry(4.12, 0.02, 3.12), this.m.carpet, bedX, daisH + 0.01, bedZ)
    );

    const bed = new T.Group();
    bed.position.set(bedX, daisH, bedZ);
    bed.add(
      // Sculpted Ivory & Gold Royal Bedstead (2.60m × 1.82m) + Plush Cream Mattress (top = 0.56m above dais = 0.74m!)
      this.mesh(new T.BoxGeometry(2.60, 0.34, 1.82), this.m.marble, 0, 0.18, 0),
      this.mesh(new T.BoxGeometry(2.66, 0.05, 1.88), this.m.gold, 0, 0.35, 0),
      this.mesh(new T.BoxGeometry(2.48, 0.20, 1.70), this.m.silkCream, 0, 0.46, 0),
      // Cleanly layered velvet foot throw sitting ON TOP of mattress + side drapes (zero clipping into bedframe!)
      this.mesh(new T.BoxGeometry(0.68, 0.026, 1.74), this.m.velvet, -0.90, 0.573, 0),
      this.mesh(new T.BoxGeometry(0.68, 0.19, 0.024), this.m.velvet, -0.90, 0.47, 0.86),
      this.mesh(new T.BoxGeometry(0.68, 0.19, 0.024), this.m.velvet, -0.90, 0.47, -0.86),
      this.mesh(new T.BoxGeometry(0.05, 0.032, 1.75), this.m.gold, -0.55, 0.574, 0),
      // Wide continuous cloud-plush goose-down royal master pillow centered for sleeping + twin accent bolsters!
      (() => { const p = this.mesh(new T.SphereGeometry(0.40, 16, 10), this.m.snow, 0.84, 0.62, 0.0); p.scale.set(0.66, 0.32, 1.68); return p; })(),
      (() => { const p = this.mesh(new T.SphereGeometry(0.20, 10, 8), this.m.apricot, 1.00, 0.68, -0.62); p.scale.set(0.62, 0.78, 0.88); return p; })(),
      (() => { const p = this.mesh(new T.SphereGeometry(0.20, 10, 8), this.m.apricot, 1.00, 0.68, 0.62); p.scale.set(0.62, 0.78, 0.88); return p; })(),
      // Grand Carved & Tufted Velvet East Headboard (+X = +1.26)
      this.mesh(new T.BoxGeometry(0.16, 1.75, 1.88), this.m.marble, 1.26, 0.90, 0),
      this.mesh(new T.BoxGeometry(0.08, 1.25, 1.56), this.m.velvet, 1.18, 1.02, 0),
      this.mesh(new T.BoxGeometry(0.20, 0.10, 1.94), this.m.gold, 1.26, 1.78, 0),
      // Graceful Tufted Velvet Bed-Foot Bench spaced cleanly 20cm clear of footboard (-X = -1.78)
      this.mesh(new T.CylinderGeometry(0.20, 0.20, 1.26, 12).rotateX(Math.PI / 2), this.m.velvet, -1.78, 0.38, 0),
      this.mesh(new T.BoxGeometry(0.42, 0.05, 1.32), this.m.gold, -1.78, 0.28, 0),
      this.mesh(new T.CylinderGeometry(0.03, 0.02, 0.28, 8), this.m.gold, -1.78, 0.14, -0.56),
      this.mesh(new T.CylinderGeometry(0.03, 0.02, 0.28, 8), this.m.gold, -1.78, 0.14, 0.56)
    );
    bed.children[bed.children.length - 4].scale.set(1.08, 0.64, 1.0);
    const bedHeadSun = this.mkSunflower(0.46, false);
    bedHeadSun.position.set(1.16, 1.86, 0);
    bedHeadSun.rotation.y = -Math.PI / 2;
    bed.add(bedHeadSun);

    // Four Slender Turned Ivory & Gold Canopy Columns (h = 3.25m) + Separate Outer Hourglass Drapes (ZERO post/curtain clipping!)
    for (const [px, pz] of [[-1.26, -0.88], [1.26, -0.88], [-1.26, 0.88], [1.26, 0.88]]) {
      const sx = px > 0 ? 1 : -1, sz = pz > 0 ? 1 : -1;
      const ox = px + sx * 0.135, oz = pz + sz * 0.115;
      bed.add(
        this.mesh(new T.CylinderGeometry(0.042, 0.054, 3.25, 12), this.m.marble, px, 1.625, pz),
        this.mesh(new T.SphereGeometry(0.068, 10, 8), this.m.gold, px, 0.44, pz),
        this.mesh(new T.TorusGeometry(0.064, 0.018, 6, 16).rotateX(Math.PI / 2), this.m.gold, px, 1.85, pz),
        this.mesh(new T.TorusGeometry(0.064, 0.018, 6, 16).rotateX(Math.PI / 2), this.m.gold, px, 3.16, pz),
        this.mesh(new T.SphereGeometry(0.086, 10, 8), this.m.gold, px, 3.34, pz),
        // Delicate tapered hourglass silk-velvet corner drapes mounted cleanly outside the posts (zero z-overlap!)
        this.mesh(new T.CylinderGeometry(0.072, 0.036, 1.48, 10), this.m.velvet, ox, 2.38, oz),
        this.mesh(new T.CylinderGeometry(0.036, 0.080, 1.24, 10), this.m.velvet, ox, 1.02, oz),
        this.mesh(new T.TorusGeometry(0.052, 0.018, 6, 14).rotateX(Math.PI / 2), this.m.gold, ox, 1.64, oz)
      );
    }
    bed.add(
      // Ornate Golden Canopy Cornice Frame (extended slightly to overhang outer drapes cleanly!), Velvet Valance & Silk Canopy
      this.mesh(new T.BoxGeometry(2.86, 0.10, 2.10), this.m.gold, 0, 3.22, 0),
      this.mesh(new T.BoxGeometry(2.80, 0.16, 0.05), this.m.velvet, 0, 3.10, 1.02),
      this.mesh(new T.BoxGeometry(2.80, 0.16, 0.05), this.m.velvet, 0, 3.10, -1.02),
      this.mesh(new T.BoxGeometry(0.05, 0.16, 2.04), this.m.velvet, -1.40, 3.10, 0),
      this.mesh(new T.BoxGeometry(2.68, 0.06, 1.92), this.m.silkCream, 0, 3.27, 0)
    );

    // Animated 3D Sculpted Royal Quilted Sunflower Duvet (unfolds smoothly over sleeping character when tucked!)
    const sleepQuilt = this._buildCastleSleepQuilt();
    sleepQuilt.position.set(-0.34, 0.565, 0.04);
    sleepQuilt.visible = false;
    bed.add(sleepQuilt);
    this.castleBed.quilt = sleepQuilt;

    // Twin Carved Marble Nightstands with Glowing Crystal Bedside Lamps flanking the East headboard!
    for (const nz of [-1.34, 1.34]) {
      const ns = new T.Group();
      ns.position.set(1.02, 0, nz);
      ns.add(
        this.mesh(new T.BoxGeometry(0.56, 0.62, 0.56), im, 0, 0.31, 0),
        this.mesh(new T.BoxGeometry(0.60, 0.05, 0.60), this.m.gold, 0, 0.63, 0),
        this.mesh(new T.CylinderGeometry(0.06, 0.11, 0.24, 10), this.m.gold, 0, 0.77, 0),
        this.mesh(new T.CylinderGeometry(0.16, 0.20, 0.24, 14), this.m.lantern, 0, 0.98, 0),
        this.mesh(new T.TorusGeometry(0.16, 0.02, 6, 18).rotateX(Math.PI / 2), this.m.gold, 0, 1.10, 0)
      );
      bed.add(ns);
    }
    g.add(bed);

    // -------------------------------------------------------------------------
    // 8. NW GLOSSY EBONY CONCERT GRAND PIANO ALCOVE (-4.58, -4.38) — INTERACTIVE!
    // -------------------------------------------------------------------------
    const piano = new T.Group();
    piano.position.set(-4.58, 0, -4.38);
    piano.rotation.y = 0.56;
    // Sculpted Grand Piano Curved Ebony Soundboard Case (ExtrudeGeometry!)
    const gpShape = new T.Shape();
    gpShape.moveTo(-0.76, 0.52);
    gpShape.lineTo(0.76, 0.52);
    gpShape.lineTo(0.76, 0.05);
    gpShape.bezierCurveTo(0.76, -0.35, 0.42, -0.36, 0.34, -0.76);
    gpShape.bezierCurveTo(0.24, -1.24, -0.68, -1.22, -0.76, -0.68);
    gpShape.closePath();
    const gpCaseGeo = new T.ExtrudeGeometry(gpShape, { depth: 0.30, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 1 });
    gpCaseGeo.rotateX(Math.PI / 2);
    const gpLidGeo = new T.ExtrudeGeometry(gpShape, { depth: 0.04, bevelEnabled: false });
    gpLidGeo.rotateX(Math.PI / 2);
    // Hinged lid pivoting cleanly along the left straight spine (x = -0.76, y = 1.04)
    const gpLidPivot = new T.Group();
    gpLidPivot.position.set(-0.74, 1.04, 0);
    gpLidPivot.rotation.z = 0.44;
    const gpLid = this.mesh(gpLidGeo, this.m.obsidian, 0.74, 0.02, 0);
    gpLidPivot.add(gpLid);
    const gpSoundboard = this.mesh(gpLidGeo, this.m.gold, 0, 0.99, 0);
    gpSoundboard.scale.set(0.90, 1, 0.90);
    piano.add(
      this.mesh(gpCaseGeo, this.m.obsidian, 0, 1.02, 0),
      gpSoundboard,
      gpLidPivot,
      // Brass lid prop stick seated cleanly inside the soundboard rim & meeting underside of raised lid!
      this.mesh(new T.CylinderGeometry(0.014, 0.014, 0.56, 6).rotateZ(-0.14), this.m.gold, 0.34, 1.24, -0.14),
      // Keyboard bed, crimson felt strip, crisp ivory white keys & 15 ebony black keys
      this.mesh(new T.BoxGeometry(1.52, 0.14, 0.36), this.m.obsidian, 0, 0.76, 0.56),
      this.mesh(new T.BoxGeometry(1.42, 0.04, 0.24), this.m.snow, 0, 0.85, 0.60),
      this.mesh(new T.BoxGeometry(1.42, 0.025, 0.03), this.m.hollyRed, 0, 0.865, 0.48),
      // Music desk & open sheet music score
      this.mesh(new T.BoxGeometry(0.54, 0.34, 0.025).rotateX(-0.22), this.m.silkCream, 0, 1.14, 0.38),
      this.mesh(new T.BoxGeometry(0.62, 0.03, 0.08), this.m.gold, 0, 0.98, 0.42),
      // Three turned ebony & brass-caster grand piano legs + brass pedal lyre (3 pedals!)
      this.mesh(new T.CylinderGeometry(0.065, 0.038, 0.74, 10), this.m.obsidian, -0.60, 0.37, 0.36),
      this.mesh(new T.CylinderGeometry(0.065, 0.038, 0.74, 10), this.m.obsidian, 0.60, 0.37, 0.36),
      this.mesh(new T.CylinderGeometry(0.065, 0.038, 0.74, 10), this.m.obsidian, -0.22, 0.37, -0.82),
      this.mesh(new T.CylinderGeometry(0.048, 0.048, 0.06, 8), this.m.gold, -0.60, 0.04, 0.36),
      this.mesh(new T.CylinderGeometry(0.048, 0.048, 0.06, 8), this.m.gold, 0.60, 0.04, 0.36),
      this.mesh(new T.CylinderGeometry(0.048, 0.048, 0.06, 8), this.m.gold, -0.22, 0.04, -0.82),
      this.mesh(new T.BoxGeometry(0.04, 0.56, 0.04), this.m.obsidian, -0.10, 0.36, 0.14),
      this.mesh(new T.BoxGeometry(0.04, 0.56, 0.04), this.m.obsidian, 0.10, 0.36, 0.14),
      this.mesh(new T.BoxGeometry(0.28, 0.06, 0.12), this.m.gold, 0, 0.10, 0.16),
      // Tufted Velvet Concert Piano Bench neatly tucked in front of keyboard (z = 0.96, 1.3m clear of sofa!)
      this.mesh(new T.BoxGeometry(0.92, 0.10, 0.38), this.m.velvet, 0, 0.50, 0.96),
      this.mesh(new T.BoxGeometry(0.94, 0.04, 0.40), this.m.gold, 0, 0.44, 0.96),
      this.mesh(new T.CylinderGeometry(0.03, 0.022, 0.44, 8), this.m.obsidian, -0.40, 0.22, 0.82),
      this.mesh(new T.CylinderGeometry(0.03, 0.022, 0.44, 8), this.m.obsidian, 0.40, 0.22, 0.82),
      this.mesh(new T.CylinderGeometry(0.03, 0.022, 0.44, 8), this.m.obsidian, -0.40, 0.22, 1.10),
      this.mesh(new T.CylinderGeometry(0.03, 0.022, 0.44, 8), this.m.obsidian, 0.40, 0.22, 1.10)
    );
    for (let k = -6; k <= 6; k++) {
      if (k === -3 || k === 1 || k === 5) continue;
      piano.add(this.mesh(new T.BoxGeometry(0.038, 0.032, 0.15), this.m.obsidian, k * 0.10, 0.88, 0.55));
    }
    g.add(piano);

    // -------------------------------------------------------------------------
    // 9. SE GRAND PALACE LIBRARY (TWIN 4.1m BOOKCASES) & 3.8m GIANT CHRISTMAS TREE!
    // -------------------------------------------------------------------------
    const bkCols = [this.m.terracotta, this.m.pine, this.m.gold, this.m.obsidian, this.m.apricot, this.m.velvet];
    for (const bz of [0.35, 3.15]) {
      const shelf = new T.Group();
      shelf.position.set(HW - 0.34, 0, bz);
      shelf.add(
        this.mesh(new T.BoxGeometry(0.08, 4.05, 2.28), this.m.walnut, 0.20, 2.025, 0),
        this.mesh(new T.BoxGeometry(0.48, 4.05, 0.09), this.m.walnut, 0, 2.025, -1.10),
        this.mesh(new T.BoxGeometry(0.48, 4.05, 0.09), this.m.walnut, 0, 2.025, 1.10),
        this.mesh(new T.BoxGeometry(0.52, 0.22, 2.34), this.m.walnut, 0, 0.11, 0),
        this.mesh(new T.BoxGeometry(0.56, 0.12, 2.40), this.m.gold, 0, 4.08, 0)
      );
      for (let row = 0; row < 7; row++) {
        const sy = 0.48 + row * 0.50;
        shelf.add(this.mesh(new T.BoxGeometry(0.44, 0.045, 2.14), this.m.gold, -0.01, sy - 0.18, 0));
        for (let b = 0; b < 12; b++) {
          const bh = 0.26 + ((row * 7 + b * 11) % 5) * 0.028;
          shelf.add(this.mesh(new T.BoxGeometry(0.26, bh, 0.125), bkCols[(row * 3 + b) % bkCols.length], -0.03, sy - 0.15 + bh * 0.5, -0.88 + b * 0.16));
        }
      }
      g.add(shelf);
    }
    // Brass rolling library ladder resting cleanly against the East bookcases
    const lad = new T.Group();
    lad.position.set(HW - 0.72, 0, 1.75);
    lad.rotation.z = -0.14;
    lad.add(
      this.mesh(new T.CylinderGeometry(0.022, 0.022, 3.85, 8), this.m.gold, 0, 1.92, -0.24),
      this.mesh(new T.CylinderGeometry(0.022, 0.022, 3.85, 8), this.m.gold, 0, 1.92, 0.24)
    );
    for (let r = 0; r < 10; r++) {
      lad.add(this.mesh(new T.CylinderGeometry(0.014, 0.014, 0.48, 6).rotateX(Math.PI / 2), this.m.gold, 0, 0.36 + r * 0.34, 0));
    }
    g.add(lad);

    // 3.8m Giant Indoor Royal Palace Christmas Tree (+4.55, +3.35) with Golden Ribbon Garlands, Baubles & 7 Luxury Gifts!
    const tree = new T.Group();
    tree.position.set(4.55, 0, 3.35);
    tree.add(
      // Velvet & gold embroidered Christmas tree skirt rug
      this.mesh(new T.CylinderGeometry(1.58, 1.62, 0.024, 28), this.m.velvet, 0, 0.014, 0),
      this.mesh(new T.TorusGeometry(1.58, 0.03, 6, 30).rotateX(Math.PI / 2), this.m.gold, 0, 0.026, 0),
      this.mesh(new T.CylinderGeometry(0.46, 0.36, 0.52, 16), this.m.marble, 0, 0.26, 0),
      this.mesh(new T.TorusGeometry(0.48, 0.04, 8, 22).rotateX(Math.PI / 2), this.m.gold, 0, 0.50, 0),
      this.mesh(new T.ConeGeometry(1.28, 1.48, 16), this.m.pine, 0, 1.24, 0),
      this.mesh(new T.ConeGeometry(1.04, 1.28, 16), this.m.pine, 0, 1.98, 0),
      this.mesh(new T.ConeGeometry(0.78, 1.08, 16), this.m.pine, 0, 2.66, 0),
      this.mesh(new T.ConeGeometry(0.50, 0.84, 14), this.m.pine, 0, 3.24, 0)
    );
    // Spiraling Golden Garland Ribbon cascading around the Christmas tree!
    const garPts = [];
    for (let k = 0; k <= 44; k++) {
      const u = k / 44;
      const a = u * Math.PI * 6.5;
      const rr = 1.18 * (1 - u * 0.78);
      garPts.push(new T.Vector3(Math.cos(a) * rr, 0.70 + u * 2.75, Math.sin(a) * rr));
    }
    tree.add(this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(garPts), 48, 0.028, 6, false), this.m.gold));
    const treeTop = this.mkSunflower(0.44, true);
    treeTop.position.set(0, 3.84, 0);
    tree.add(treeTop);
    // 28 Shimmering Festive Ornaments + Glowing Fairy Bulbs
    const ornMats = [this.m.gold, this.m.hollyRed, this.m.lantern, this.m.terracotta, this.m.silkCream];
    for (let i = 0; i < 28; i++) {
      const u = i / 27;
      const a = i * 1.48, h = 0.74 + u * 2.64, rr = 1.14 * (1 - u * 0.74);
      const bm = (bulbMats && bulbMats.length && i % 2 === 0) ? bulbMats[i % bulbMats.length] : ornMats[i % ornMats.length];
      const b = this.mesh(new T.SphereGeometry(i % 2 === 0 ? 0.056 : 0.072, 8, 6), bm, Math.cos(a) * rr, h, Math.sin(a) * rr);
      b.castShadow = false;
      tree.add(b);
    }
    // 7 Luxury wrapped Christmas gifts with bows nestled neatly on the velvet tree skirt
    for (const [gx, gz, gw, gh, mat, ry] of [
      [-0.86, 0.56, 0.44, 0.36, this.m.terracotta, 0.3],
      [-0.38, 1.02, 0.36, 0.30, this.m.cofferBlue, -0.4],
      [0.64, 0.86, 0.42, 0.34, this.m.apricot, 0.5],
      [-0.96, -0.35, 0.38, 0.42, this.m.hollyRed, -0.2],
      [0.80, -0.56, 0.46, 0.32, this.m.velvet, 0.8],
      [0.14, 1.12, 0.30, 0.24, this.m.hollyRed, 0.15],
      [-0.54, -0.88, 0.34, 0.28, this.m.gold, -0.6]
    ]) {
      const box = new T.Group();
      box.position.set(gx, gh * 0.5 + 0.02, gz);
      box.rotation.y = ry;
      box.add(
        this.mesh(new T.BoxGeometry(gw, gh, gw), mat, 0, 0, 0),
        this.mesh(new T.BoxGeometry(gw + 0.02, gh + 0.015, 0.06), this.m.gold, 0, 0, 0),
        this.mesh(new T.BoxGeometry(0.06, gh + 0.015, gw + 0.02), this.m.gold, 0, 0, 0),
        this.mesh(new T.TorusGeometry(0.065, 0.018, 6, 12), this.m.gold, -0.04, gh * 0.5 + 0.04, 0),
        this.mesh(new T.TorusGeometry(0.065, 0.018, 6, 12), this.m.gold, 0.04, gh * 0.5 + 0.04, 0)
      );
      tree.add(box);
    }
    g.add(tree);

    // -------------------------------------------------------------------------
    // 10. SOUTH GRAND ENTRANCE PORTAL, ROSE WINDOW, GRAMOPHONE & GUESTBOOK!
    // -------------------------------------------------------------------------
    // Grand Double Carved Walnut & Gold Exit Doors (-1.0, +5.68) + Twin 2.1m Golden Floor Candelabras!
    const inDoor = new T.Group();
    inDoor.position.set(-1.0, 0, HD - 0.08);
    inDoor.add(
      this.mesh(new T.BoxGeometry(2.26, 3.05, 0.16), im, 0, 1.525, 0),
      this.mesh(new T.BoxGeometry(1.86, 2.78, 0.12), this.m.walnut, 0, 1.39, -0.04),
      this.mesh(new T.TorusGeometry(0.98, 0.10, 8, 28, Math.PI), this.m.gold, 0, 2.28, -0.06),
      this.mesh(new T.BoxGeometry(0.06, 2.74, 0.14), this.m.gold, 0, 1.37, -0.05),
      this.mesh(new T.TorusGeometry(0.32, 0.075, 8, 22), this.m.pine, 0, 1.92, -0.10),
      // Giant Glowing Stained-Glass Claude Sunflower Rose Window soaring above the grand portal!
      this.mesh(new T.CylinderGeometry(1.18, 1.18, 0.12, 32).rotateX(Math.PI / 2), this.m.rose, 0, 4.45, -0.02),
      this.mesh(new T.TorusGeometry(1.22, 0.09, 10, 36), this.m.gold, 0, 4.45, -0.08)
    );
    // Twin 2.1m Golden Floor Candelabras flanking the entrance portal
    for (const sx of [-1.52, 1.52]) {
      inDoor.add(
        this.mesh(new T.CylinderGeometry(0.18, 0.24, 0.14, 12), this.m.gold, sx, 0.07, -0.42),
        this.mesh(new T.CylinderGeometry(0.036, 0.055, 1.85, 10), this.m.gold, sx, 1.02, -0.42),
        this.mesh(new T.CylinderGeometry(0.022, 0.022, 0.42, 6).rotateZ(Math.PI / 2), this.m.gold, sx, 1.94, -0.42),
        this.mesh(new T.SphereGeometry(0.055, 8, 6), this.m.lantern, sx, 2.10, -0.42),
        this.mesh(new T.SphereGeometry(0.045, 8, 6), this.m.lantern, sx - 0.20, 2.04, -0.42),
        this.mesh(new T.SphereGeometry(0.045, 8, 6), this.m.lantern, sx + 0.20, 2.04, -0.42)
      );
    }
    g.add(inDoor);

    // Antique Golden-Horn Gramophone on Inlaid Walnut Sideboard (+1.85, +5.05)
    const gram = new T.Group();
    gram.position.set(1.85, 0, 5.05);
    gram.rotation.y = Math.PI;
    gram.add(
      this.mesh(new T.BoxGeometry(1.12, 0.88, 0.68), this.m.walnut, 0, 0.44, 0),
      this.mesh(new T.BoxGeometry(1.18, 0.06, 0.74), this.m.gold, 0, 0.90, 0),
      this.mesh(new T.BoxGeometry(0.40, 0.14, 0.40), this.m.walnut, 0, 1.00, 0)
    );
    const rec = this.mesh(new T.CylinderGeometry(0.16, 0.16, 0.018, 18), this.m.obsidian, 0, 1.08, 0);
    this.recordMesh = rec;
    const hornCurve = new T.CatmullRomCurve3([
      new T.Vector3(0.10, 1.08, -0.07),
      new T.Vector3(0.14, 1.28, -0.12),
      new T.Vector3(0.04, 1.48, 0.05)
    ]);
    gram.add(
      rec,
      this.mesh(new T.TubeGeometry(hornCurve, 12, 0.03, 8, false), this.m.gold),
      this.mesh(new T.ConeGeometry(0.24, 0.30, 16, 1, true).rotateX(-Math.PI * 0.42), this.m.gold, 0.02, 1.54, 0.18)
    );
    g.add(gram);

    // Royal Marble Guestbook Lectern (-4.25, +4.65)
    const pod = new T.Group();
    pod.position.set(-4.25, 0, 4.65);
    pod.rotation.y = Math.PI * 0.78;
    pod.add(
      this.mesh(new T.CylinderGeometry(0.12, 0.24, 0.94, 12), im, 0, 0.47, 0),
      this.mesh(new T.BoxGeometry(0.58, 0.06, 0.42), this.m.gold, 0, 0.96, 0),
      this.mesh(new T.BoxGeometry(0.46, 0.05, 0.30), this.m.silkCream, 0, 1.01, 0),
      this.mesh(new T.CylinderGeometry(0.014, 0.006, 0.26, 6).rotateZ(-0.35), this.m.gold, 0.20, 1.14, 0)
    );
    g.add(pod);

    // -------------------------------------------------------------------------
    // 11. REGISTER GRAND PALACE COLLIDERS, DAIS PLATFORM, SLEEP ANCHORS & SPOTS!
    // -------------------------------------------------------------------------
    const addBox = (x0, x1, z0, z1, h = 6.5) => {
      world && world.boxes && world.boxes.push({ x0: origin.x + x0, x1: origin.x + x1, z0: origin.z + z0, z1: origin.z + z1, h });
    };
    const addCirc = (x, z, r, top = 2.0) => {
      world && world.circles && world.circles.push({ x: origin.x + x, z: origin.z + z, r, top });
    };
    // Walkable 1-step elevated Princess Bed Dais platform
    if (world && world.platforms) {
      world.platforms.push({
        test: (px, pz) => Math.abs(px - (origin.x + bedX)) <= 2.30 && Math.abs(pz - (origin.z + bedZ)) <= 1.80,
        y: () => origin.y + daisH,
        wood: true
      });
    }
    // Furniture colliders (tightly matched to EVERY single piece — zero pass-through, zero ghost boxes!)
    addBox(-HW, -5.62, -2.15, 2.15, 6.2);           // Monumental West Fireplace
    // Chesterfield Velvet Sofa (-3.35, -1.78, rot -0.26) — 3 tight circles hugging rotated sofa body!
    addCirc(-4.02, -1.96, 0.52, 1.35);
    addCirc(-3.35, -1.78, 0.52, 1.35);
    addCirc(-2.68, -1.60, 0.52, 1.35);
    addCirc(-3.55, 2.25, 0.52, 1.35);               // South-West Louis-XVI Armchair
    addCirc(-1.95, 1.35, 0.52, 1.35);               // Inner Louis-XVI Armchair
    addCirc(-3.45, 0, 0.62, 1.0);                   // Marble Hot-Cocoa Tea Table
    // Princess Canopy Bed + Detached Bed-Foot Bench + Twin Nightstands (100% solid!)
    addBox(bedX - 1.38, bedX + 1.40, bedZ - 0.98, bedZ + 0.98, 3.5); // Princess Canopy Bed & Corner Drapes
    addBox(bedX - 2.02, bedX - 1.54, bedZ - 0.68, bedZ + 0.68, 1.1); // Tufted Bed-Foot Bench
    addCirc(bedX + 1.02, bedZ - 1.34, 0.36, 1.2);   // North Nightstand
    addCirc(bedX + 1.02, bedZ + 1.34, 0.36, 1.2);   // South Nightstand
    // NW Ebony Concert Grand Piano (-4.58, -4.38, rot 0.56) + Velvet Piano Bench — 3 tight colliders!
    addCirc(-4.58, -4.38, 0.82, 1.6);               // Grand Piano Main Body
    addCirc(-5.15, -4.92, 0.62, 1.6);               // Grand Piano Curved Tail
    addCirc(-4.07, -3.57, 0.44, 1.0);               // Concert Piano Bench
    addBox(HW - 0.85, HW, -0.85, 4.45, 4.2);        // East Twin Grand Bookcases & Ladder
    addCirc(4.55, 3.35, 1.36, 3.8);                 // 3.8m Giant Indoor Christmas Tree & 7 Gifts
    addBox(1.24, 2.48, 4.66, HD, 1.6);              // Gramophone Sideboard
    addCirc(-4.25, 4.65, 0.38, 1.2);                // Guestbook Lectern
    addCirc(-2.52, HD - 0.50, 0.26, 2.1);           // West Portal Candelabra
    addCirc(0.52, HD - 0.50, 0.26, 2.1);            // East Portal Candelabra
    addBox(-1.12, 1.12, -HD, -HD + 0.72, 0.85);     // Center-North Cushioned Window Seat

    // Configure 3rd-Person Visible Royal Princess Bed Sleep Anchors & Floating ZZZ Sprites!
    const cb = this.castleBed;
    cb.bedPos.set(origin.x + bedX - 0.46, origin.y + daisH + 0.745, origin.z + bedZ + 0.04);
    cb.focus.set(origin.x + bedX + 0.08, origin.y + daisH + 0.96, origin.z + bedZ + 0.04);
    cb.eye.copy(cb.focus);
    cb.zzzOrigin.set(origin.x + bedX + 0.56, origin.y + daisH + 1.24, origin.z + bedZ + 0.02);
    cb.exitPos.set(origin.x + bedX - 0.20, origin.y + daisH, origin.z + bedZ + 1.55);
    cb.bedYaw = Math.PI;
    cb.exitYaw = Math.PI;
    cb.spot = {
      id: "castle_bed_exit",
      label: "起身 · 离开太阳花公主床",
      can: () => true,
      act: () => this.leaveCastleBed()
    };

    const mkZzz = (glyph, colorHex, scale) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.font = "900 84px 'Segoe UI', 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 10;
      ctx.strokeStyle = "rgba(42, 18, 10, 0.78)";
      ctx.strokeText(glyph, 64, 66);
      ctx.fillStyle = colorHex;
      ctx.fillText(glyph, 64, 66);
      const tex = new T.CanvasTexture(cv);
      tex.colorSpace = T.SRGBColorSpace;
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      sp.scale.setScalar(scale);
      sp.visible = false;
      sp.renderOrder = 7;
      scene.add(sp);
      return sp;
    };
    cb.zzz = [
      { sp: mkZzz("Z", "#ffe28a", 0.34), ph: 0.0 },
      { sp: mkZzz("z", "#ffad80", 0.27), ph: 0.33 },
      { sp: mkZzz("✦", "#fff4c2", 0.23), ph: 0.66 }
    ];
    this._ensureCastleSleepUI();

    // Realign O.cabin's firePos, lights, spawn & interactive spots to match the grand new palace coordinates!
    const cab = this.game.cabin;
    if (cab) {
      cab.firePos.set(origin.x - 6.18, origin.y + 0.42, origin.z);
      if (cab.spawn) cab.spawn.set(origin.x - 1.0, origin.y, origin.z + HD - 0.55);
      if (cab.fireLight) {
        cab.fireLight.distance = 22;
        cab.fireLight.position.set(origin.x - 5.2, origin.y + 1.35, origin.z);
      }
      if (cab.lamp) {
        cab.lamp.distance = 26;
        cab.lamp.position.set(origin.x, origin.y + 4.05, origin.z - 0.25);
      }
    }
    if (world && world.spots) {
      const moveSpot = (id, lx, ly, lz, r, label) => {
        const sp = world.spots.find((s) => s.id === id);
        if (!sp) return;
        sp.pos.set(origin.x + lx, origin.y + ly, origin.z + lz);
        if (r !== undefined) sp.r = r;
        if (label !== undefined) sp.label = label;
      };
      moveSpot("in_fire", -4.85, 1.0, 0, 2.6, "在皇室雕花大壁炉前烤火");
      moveSpot("in_cocoa", -3.45, 0.85, 0, 2.2, "品尝城堡热可可与冬日马卡龙");
      moveSpot("in_bed", bedX - 0.15, daisH + 0.85, bedZ + 1.25, 2.6, "躺上太阳花公主幔帐床小憩（盖被子·听摇篮曲·切换昼夜）");
      moveSpot("in_music", 1.85, 1.05, 4.70, 2.2, "摇响古董金号角留声机");
      moveSpot("in_book", -4.25, 1.05, 4.35, 2.0, "翻阅城堡宾客留言簿");
      moveSpot("in_door", -1.0, 1.2, HD - 0.35, 2.2, "推开城堡大门回到雪境");

      // Bonus interactive Grand Concert Piano!
      world.spots.push({
        id: "in_piano",
        pos: new T.Vector3(origin.x - 4.05, origin.y + 1.05, origin.z - 3.50),
        r: 2.3,
        label: "弹奏一段城堡冬夜钢琴曲",
        can: () => !!(this.game.cabin && this.game.cabin.inside && !this.game.player.seat),
        act: () => this.playCastlePiano()
      });
    }

    g.updateMatrixWorld(true);
    this.interior = g;
    return g;
  }

  _playCastleTone(freqs, gap = 0.09, vol = 0.085) {
    const audio = this.game && this.game.audio;
    const ctx = audio && audio.ctx;
    if (!ctx || audio.muted) return;
    const now = ctx.currentTime;
    freqs.forEach((f, idx) => {
      const t = now + idx * gap;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(1e-4, t);
      gn.gain.linearRampToValueAtTime(vol, t + 0.02);
      gn.gain.exponentialRampToValueAtTime(1e-4, t + 0.65);
      osc.connect(gn).connect(audio.master || ctx.destination);
      if (audio.rev) {
        const rg = ctx.createGain();
        rg.gain.value = 0.35;
        gn.connect(rg).connect(audio.rev);
      }
      osc.start(t);
      osc.stop(t + 0.70);
    });
  }

  playCastlePiano() {
    const g = this.game;
    if (g.time < this.pianoCooldown) return;
    this.pianoCooldown = g.time + 2.2;
    this._playCastleTone([392.0, 493.88, 587.33, 783.99, 659.25, 587.33, 783.99, 987.77], 0.14, 0.08);
    g.character && g.character.play && g.character.play("happy");
    g.friends && g.friends.cheer && g.friends.cheer("happy");
    g.ui && g.ui.toast("🎹 叮咚——温暖清亮的钢琴琶音在太阳花大殿穹顶间回荡起来啦喵～", 4.2);
  }

  _ensureCastleSleepUI() {
    if (this.castleBed.hudEl) return;
    if (!document.getElementById("castleSleepCss")) {
      const st = document.createElement("style");
      st.id = "castleSleepCss";
      st.textContent = `
        #castleSleepHud{position:fixed;top:66px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:26;pointer-events:none;opacity:0;transition:opacity .35s,transform .35s;display:flex;flex-direction:column;align-items:center;gap:4px;max-width:min(90vw,490px);padding:11px 20px;border-radius:20px;background:rgba(44,22,16,.84);border:1.5px solid rgba(246,204,116,.62);box-shadow:0 10px 30px rgba(24,10,6,.48);color:#fff6e8;text-align:center}
        #castleSleepHud.show{opacity:1;transform:translateX(-50%) translateY(0)}
        #castleSleepHud .cs-tag{font-size:12px;letter-spacing:.08em;color:#ffd885;font-weight:700}
        #castleSleepHud .cs-line{font-size:14px;line-height:1.45;color:#fff6ea}
        #castleSleepBar{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(16px);z-index:27;opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:9px 12px;border-radius:18px;background:rgba(40,20,14,.86);border:1.5px solid rgba(246,204,116,.52);box-shadow:0 10px 28px rgba(18,8,4,.5)}
        #castleSleepBar.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
        #castleSleepBar button{border:1px solid rgba(255,224,160,.36);background:rgba(255,232,190,.12);color:#fff6e8;font:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:12px;cursor:pointer;transition:transform .12s,background .2s,border-color .2s;display:flex;align-items:center;gap:6px;white-space:nowrap}
        #castleSleepBar button:hover{background:rgba(246,184,96,.28);border-color:#ffd982;transform:translateY(-1px)}
        #castleSleepBar button.on{background:linear-gradient(135deg,rgba(232,126,58,.46),rgba(246,204,116,.38));border-color:#ffe092;color:#fff}
        #castleSleepBar button.wake{background:rgba(236,112,82,.26);border-color:rgba(255,172,148,.6)}
        #castleSleepBar kbd{font:700 11px/1 ui-monospace,monospace;padding:2px 5px;border-radius:5px;background:rgba(255,255,255,.16);color:#ffe4a6}
      `;
      document.head.appendChild(st);
    }
    const hud = document.createElement("div");
    hud.id = "castleSleepHud";
    hud.innerHTML = `<div class="cs-tag">✦ 太阳花公主幔帐床 · 温暖小憩 ✦</div><div class="cs-line">壁炉火光暖融融地照着帷幔，拖鼠标可 360° 欣赏熟睡模样～</div>`;
    const bar = document.createElement("div");
    bar.id = "castleSleepBar";
    bar.innerHTML = `
      <button data-cs="quilt"><kbd>1</kbd><span>盖上绒被</span></button>
      <button data-cs="pet"><kbd>2</kbd><span>轻拍哄睡</span></button>
      <button data-cs="time"><kbd>3</kbd><span>睡到天黑</span></button>
      <button data-cs="lullaby"><kbd>4</kbd><span>摇篮曲</span></button>
      <button data-cs="wake" class="wake"><kbd>E</kbd><span>起身</span></button>
    `;
    bar.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-cs]");
      if (!btn) return;
      btn.blur();
      const act = btn.dataset.cs;
      if (act === "quilt") this.toggleCastleQuilt();
      else if (act === "pet") this.petCastleSleeper();
      else if (act === "time") this.skipTimeFromBed();
      else if (act === "lullaby") this.toggleCastleLullaby();
      else if (act === "wake") this.leaveCastleBed();
    });
    document.body.appendChild(hud);
    document.body.appendChild(bar);
    this.castleBed.hudEl = hud;
    this.castleBed.barEl = bar;
  }

  _updateCastleSleepUI(customTag, customLine) {
    const cb = this.castleBed;
    if (!cb.hudEl || !cb.barEl) return;
    const isNight = this.game.env && this.game.env.night > 0.5;
    cb.hudEl.querySelector(".cs-tag").textContent = customTag || "✦ 太阳花公主幔帐床 · 城堡晚安时光 ✦";
    if (customLine) cb.hudEl.querySelector(".cs-line").textContent = customLine;
    const bQ = cb.barEl.querySelector('[data-cs="quilt"]');
    if (bQ) {
      bQ.classList.toggle("on", cb.tucked);
      bQ.querySelector("span").textContent = cb.tucked ? "掀开绒被" : "盖上绒被";
    }
    const bT = cb.barEl.querySelector('[data-cs="time"]');
    if (bT) bT.querySelector("span").textContent = isNight ? "一觉到清晨" : "一觉到天黑";
    const bL = cb.barEl.querySelector('[data-cs="lullaby"]');
    if (bL) {
      bL.classList.toggle("on", cb.lullabyOn);
      bL.querySelector("span").textContent = cb.lullabyOn ? "暂停摇篮曲" : "摇篮曲";
    }
  }

  toggleCastleQuilt() {
    const cb = this.castleBed;
    if (!cb.riding) return;
    cb.tucked = !cb.tucked;
    cb.petPulse = Math.max(cb.petPulse, 0.8);
    if (cb.tucked) {
      this._playCastleTone([523.25, 659.25, 783.99], 0.08, 0.08);
      this.game.cold && this.game.cold.warm(100);
      this._updateCastleSleepUI("✦ 盖好太阳花丝绒厚被 · 暖呼呼", "软绵绵的丝绒刺绣绒被裹得严严实实，壁炉噼啪作响，一秒进入甜梦～");
    } else {
      this._playCastleTone([783.99, 659.25], 0.07, 0.06);
      this._updateCastleSleepUI("✦ 掀开丝绒被透气", "壁炉烧得好暖和呀，探出脑袋伸个懒腰再眯一会儿～");
    }
    if (this.game.player && this.game.player.seat) {
      this.game.player.seat.tucked = cb.tucked;
      this.game.player.seat.petPulse = cb.petPulse;
    }
  }

  petCastleSleeper() {
    const cb = this.castleBed;
    if (!cb.riding) return;
    cb.petPulse = 1.0;
    this._playCastleTone([659.25, 880, 1046.5], 0.07, 0.07);
    const lines = [
      "轻轻拍了拍被角，睡梦里嘴角翘起甜甜的小弧度～",
      "摸摸柔软的发顶，发出满足的小声嘀咕：再睡五分钟嘛～",
      "伴着水晶吊灯温柔的微光，整个人蜷得更安心了呢～"
    ];
    this._updateCastleSleepUI("✦ 轻拍哄睡 · 安心入梦", lines[cb.murmurIdx++ % lines.length]);
    for (let k = 0; k < 10; k++) {
      this.game.sparks && this.game.sparks.spawn(
        cb.zzzOrigin.x + (Math.random() - 0.5) * 0.6,
        cb.zzzOrigin.y + Math.random() * 0.25,
        cb.zzzOrigin.z + (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.4, 0.45 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4,
        0.06, 0.9, 0.7, 1.8, 1.35, 0.65, -0.1, 0.6
      );
    }
    if (this.game.player && this.game.player.seat) this.game.player.seat.petPulse = 1.0;
  }

  skipTimeFromBed() {
    const g = this.game, cb = this.castleBed;
    if (!cb.riding) return;
    const isNight = g.env && g.env.night > 0.5;
    g.ui && g.ui.fade(() => {
      g.env && g.env.goTo(isNight ? 3.12 : 2.3, 0.3);
      g.cold && g.cold.warm(100);
      this._updateCastleSleepUI(
        isNight ? "✦ 一觉睡到雪境清晨" : "✦ 一觉睡到极光夜晚",
        isNight ? "晨光穿过拱形彩窗洒在丝绒被面上，出门迎接崭新雪景吧！" : "夜幕降临啦！窗外极光正在起舞，随时可以起身去赏雪～"
      );
    }, () => {
      this._playCastleTone([523.25, 659.25, 783.99, 1046.5], 0.08, 0.08);
    });
  }

  toggleCastleLullaby() {
    const cb = this.castleBed;
    if (!cb.riding) return;
    cb.lullabyOn = !cb.lullabyOn;
    cb.lullabyT = 0.05;
    cb.lullabyStep = 0;
    this._updateCastleSleepUI();
  }

  enterCastleBed() {
    const g = this.game, p = g.player, cb = this.castleBed;
    if (cb.riding) return;
    cb.riding = true;
    cb.tucked = true; // Auto-tuck the cozy royal sunflower quilt right away for instant storybook charm!
    cb.quiltK = 0;
    cb.petPulse = 0.6;
    cb.sparkT = 0;
    this._playCastleTone([523.25, 659.25, 783.99, 987.77], 0.10, 0.085);
    g.cold && g.cold.warm(100);

    p.seat = {
      pos: cb.eye,
      tp: true,
      sleep: true,
      tucked: true,
      petPulse: 0.6,
      focus: cb.focus,
      dist: 2.75,
      bedPos: cb.bedPos,
      bedYaw: cb.bedYaw,
      spot: cb.spot,
      onKey: (code) => {
        if (code === "Digit1" || code === "Numpad1") this.toggleCastleQuilt();
        else if (code === "Digit2" || code === "Numpad2") this.petCastleSleeper();
        else if (code === "Digit3" || code === "Numpad3") this.skipTimeFromBed();
        else if (code === "Digit4" || code === "Numpad4") this.toggleCastleLullaby();
      },
      exit: () => this.leaveCastleBed()
    };

    // Frame the sleeping character warmly from the South-West open salon (zero wall/post obstruction!)
    p.yaw = -0.34;
    p.pitch = -0.22;
    g.character && g.character.stop && g.character.stop(0.1);
    document.body.classList.add("sleeping");
    this._updateCastleSleepUI(
      "✦ 太阳花公主幔帐床 · 温暖入梦 ✦",
      "已钻进柔软的公主大床并盖好太阳花丝绒被～拖鼠标可 360° 观赏，按 3 可一键睡到天黑/天亮！"
    );
    cb.hudEl && cb.hudEl.classList.add("show");
    cb.barEl && cb.barEl.classList.add("show");
  }

  leaveCastleBed(silent = false) {
    const cb = this.castleBed;
    if (!cb.riding) return;
    const g = this.game, p = g.player;
    cb.riding = false;
    cb.tucked = false;
    cb.lullabyOn = false;
    cb.petPulse = 0;
    if (cb.quilt) cb.quilt.visible = false;
    for (const z of cb.zzz) {
      z.sp.visible = false;
      z.sp.material.opacity = 0;
    }
    document.body.classList.remove("sleeping");
    cb.hudEl && cb.hudEl.classList.remove("show");
    cb.barEl && cb.barEl.classList.remove("show");
    p.seat = null;
    if (!silent) {
      p.pos.set(cb.exitPos.x, 0, cb.exitPos.z);
      p.vel.set(0, 0);
      p.yaw = cb.exitYaw;
      p.pitch = -0.06;
      g.audio && g.audio.pick && g.audio.pick();
      g.character && g.character.play && g.character.play("happy");
    }
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
      this.roseMat.emissiveIntensity = (this.game.cabin && this.game.cabin.inside) ? 1.15 : (0.55 + 1.55 * night);
    }
    for (const l of this.lanternGlows) {
      l.emissiveIntensity = (this.game.cabin && this.game.cabin.inside)
        ? 1.45 * (0.96 + 0.04 * Math.sin(time * 6.0))
        : (0.95 + 1.45 * lamps) * (0.95 + 0.05 * Math.sin(time * 6.5));
    }
    // Inside fireplace embers, dancing 3D hearth flames & spinning gramophone vinyl
    if (this.hearthEmbers) {
      this.hearthEmbers.emissiveIntensity = 1.30 + 0.38 * Math.sin(time * 8.4);
    }
    if (this.hearthFlames && this.hearthFlames.length && this.game.cabin && this.game.cabin.inside) {
      for (const f of this.hearthFlames) {
        const s = 0.84 + 0.22 * Math.sin(time * 11.5 + f.ph) + 0.10 * Math.sin(time * 21.3 + f.ph * 2.1);
        f.obj.scale.set(0.92 + 0.10 * Math.cos(time * 9.0 + f.ph), s, 0.92 + 0.10 * Math.sin(time * 8.2 + f.ph));
        f.obj.rotation.z = Math.sin(time * 7.4 + f.ph) * 0.08;
      }
    }
    if (this.recordMesh && this.game.cabin && this.game.cabin.inside) {
      this.recordMesh.rotation.y = time * 2.8;
    }

    // 3rd-Person Royal Princess Bed Sleep Animations (3D quilted duvet, floating ZZZ & celesta lullaby!)
    const cb = this.castleBed;
    if (cb.riding) {
      cb.quiltK += ((cb.tucked ? 1 : 0) - cb.quiltK) * (1 - Math.exp(-7 * dt));
      if (cb.quilt) {
        const qk = cb.quiltK;
        cb.quilt.visible = qk > 0.02;
        if (cb.quilt.visible) {
          const breathe = 1 + 0.024 * Math.sin(time * 2.3);
          const claudeBoost = this.game.avatar === "claude" ? 1.16 : 1.0;
          cb.quilt.scale.set(0.24 + 0.76 * qk, (0.28 + 0.72 * qk) * breathe * claudeBoost, (0.84 + 0.16 * qk) * (claudeBoost > 1 ? 1.08 : 1.0));
          cb.quilt.position.x = -0.68 + 0.34 * qk;
        }
      }
      if (cb.petPulse > 0) {
        cb.petPulse = Math.max(0, cb.petPulse - dt * 0.45);
        if (this.game.player && this.game.player.seat) this.game.player.seat.petPulse = cb.petPulse;
      }
      if (cb.lullabyOn) {
        const NOTES = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 0, 440, 523.25, 659.25, 523.25, 587.33, 493.88, 392, 0];
        cb.lullabyT -= dt;
        if (cb.lullabyT <= 0) {
          cb.lullabyT = 0.64;
          const note = NOTES[cb.lullabyStep++ % NOTES.length];
          if (note > 0) this._playCastleTone([note], 0, 0.055);
        }
      }
      const o = cb.zzzOrigin;
      for (const item of cb.zzz) {
        const u = (time * 0.36 + item.ph) % 1;
        item.sp.visible = true;
        item.sp.position.set(
          o.x + Math.sin(u * Math.PI * 2 + item.ph * 6) * 0.16,
          o.y + u * 0.72,
          o.z + Math.cos(u * Math.PI * 2 + item.ph * 6) * 0.10
        );
        item.sp.material.opacity = Math.sin(u * Math.PI) * 0.92;
      }
      if ((cb.sparkT -= dt) <= 0) {
        cb.sparkT = 0.62;
        this.game.sparks && this.game.sparks.spawn(
          cb.focus.x + (Math.random() - 0.5) * 1.4,
          cb.focus.y + 0.2,
          cb.focus.z + (Math.random() - 0.5) * 1.1,
          0, 0.35, 0, 0.045, 0.85, 0.8, 1.8, 1.35, 0.7, -0.05, 0.6
        );
      }
    } else {
      if (cb.quilt && cb.quilt.visible) cb.quilt.visible = false;
      if (cb.zzz.length && cb.zzz[0].sp.visible) {
        for (const item of cb.zzz) {
          item.sp.visible = false;
          item.sp.material.opacity = 0;
        }
      }
    }
  }
}
