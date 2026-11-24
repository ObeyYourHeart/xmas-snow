// 滑雪场山顶/山脚设施全面升级 & 彩虹水晶冰滑梯 (js/skiplus.js)
// 1. 山顶滑雪木屋 & 山顶雪具领取架（飞上山顶或传送到山顶瞭望台后无需下山，直接按 E 领取并穿戴滑雪板！）
//    + 山顶暖炉热姜茶屋、飘动风向标、高山速降发光出发拱门
// 2. 山脚滑雪大本营全面升级：北欧积雪滑雪服务木屋、篝火暖炉休息长椅、高山速降最佳纪录计分牌、沿雪道发光荧光标旗
// 3. 额外加赠猫猫惊喜玩法：「彩虹水晶冰滑梯」—— 18 米优雅 S 弯水晶发光冰道，按 E 坐上滑梯高速冲刺滑降！

import {
  makeTimberWallTex,
  makeShingleRoofTex,
  makeStoneMasonryTex,
  makeCrispWindowTex,
  buildCrispWindow,
  buildCrispDoor
} from "./archcraft.js?v=11242125";

export class AlpineSkiUpgrade {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.Ci = helpers.Ci;
    this.Wt = helpers.Wt;
    this.THREE = game.THREE;

    this.yawLift = Math.atan2(-this.Wt.dx, -this.Wt.dz);
    this.lights = [];
    this.windSock = null;
    this.beaconMats = [];
    this.warmZones = [];

    // Rainbow Crystal Ice-Slide live ride state
    this.slideCurve = null;
    this.sliding = false;
    this.slideT = 0;
    this.slideSparkAcc = 0;
    this.slideStartPos = new this.THREE.Vector3();
    this.slideEndPos = new this.THREE.Vector3();
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  makeSignTex(title, sub, bg1 = "#1b3352", bg2 = "#294f75") {
    const T = this.THREE;
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 144;
    const c = cv.getContext("2d");
    const gr = c.createLinearGradient(0, 0, 512, 0);
    gr.addColorStop(0, bg1); gr.addColorStop(0.5, bg2); gr.addColorStop(1, bg1);
    c.fillStyle = gr;
    c.fillRect(0, 0, 512, 144);
    c.strokeStyle = "#ffd966";
    c.lineWidth = 8;
    c.strokeRect(8, 8, 496, 128);
    c.fillStyle = "#fff9e2";
    c.font = "900 44px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(title, 256, 54);
    c.fillStyle = "#9ef5ff";
    c.font = "700 24px system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    c.fillText(sub, 256, 106);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  build() {
    const T = this.THREE;
    const rend = this.game.renderer;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.48, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const cedarTex = makeTimberWallTex(T, rend, 3, 2);
    const stoneTex = makeStoneMasonryTex(T, rend, 3, 1);
    const shingleRedTex = makeShingleRoofTex(T, rend, "red", 3, 2);
    const winCozyTex = makeCrispWindowTex(T, rend, "cozy");

    this.m = {
      cedar: std(0x7c4a2b, 0.72),
      cedarWall: plain(new T.MeshStandardMaterial({ map: cedarTex, roughness: 0.72, metalness: 0.04 })),
      darkWood: std(0x4b2a18, 0.78),
      stone: std(0x5a647a, 0.68),
      stoneWall: plain(new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.78, metalness: 0.04 })),
      snow: std(0xf4f8ff, 0.76),
      gold: std(0xffd252, 0.20, { metalness: 0.86 }),
      roofRed: plain(new T.MeshStandardMaterial({ map: shingleRedTex, roughness: 0.52, metalness: 0.08, side: T.DoubleSide })),
      shutter: std(0x1f563a, 0.56),
      pine: std(0x1f663c, 0.72),
      winCozy: plain(new T.MeshStandardMaterial({
        map: winCozyTex,
        emissiveMap: winCozyTex,
        emissive: new T.Color(1.0, 0.88, 0.66),
        emissiveIntensity: 0.82,
        roughness: 0.16,
        metalness: 0.08
      })),
      warmGlow: plain(new T.MeshStandardMaterial({
        color: 0xffe49c, emissive: new T.Color(1.0, 0.72, 0.22), emissiveIntensity: 1.5, roughness: 0.2
      })),
      cyanGlow: plain(new T.MeshStandardMaterial({
        color: 0x7ef6ff, emissive: new T.Color(0.24, 0.88, 1.0), emissiveIntensity: 1.4, roughness: 0.16
      })),
      pinkGlow: plain(new T.MeshStandardMaterial({
        color: 0xff82dc, emissive: new T.Color(0.95, 0.30, 0.82), emissiveIntensity: 1.4, roughness: 0.16
      })),
      ember: plain(new T.MeshStandardMaterial({
        color: 0xff6e28, emissive: new T.Color(1.0, 0.32, 0.06), emissiveIntensity: 1.7, roughness: 0.35
      })),
      iceChute: plain(new T.MeshStandardMaterial({
        color: 0xaef2ff, emissive: new T.Color(0.18, 0.62, 0.90), emissiveIntensity: 0.45,
        roughness: 0.10, metalness: 0.18
      })),
      skiRed: std(0xd8323e, 0.32),
      skiBlue: std(0x2884d8, 0.32),
      skiPink: std(0xe86ac4, 0.32)
    };
    this.beaconMats.push(this.m.cyanGlow, this.m.pinkGlow);

    this.buildSummitChaletAndRack();
    this.buildSummitStartGateAndSlopeBeacons();
    this.buildBaseSkiLodge();
    this.buildRainbowIceSlide();

    return this;
  }

  // =========================================================================
  // 1. SUMMIT SKI CHALET, WARM BRAZIER & SUMMIT SKI EQUIPMENT RACK!
  // =========================================================================
  buildSummitChaletAndRack() {
    const T = this.THREE;
    const { scene, world } = this.game;

    // Place Summit Ski Rack right beside the summit arrival clearing Ci(1.015, 6.2, false)
    const [rx, rz] = this.Ci(1.015, 6.2, false);
    const ry = this.qt(rx, rz);
    const rackG = new T.Group();
    rackG.position.set(rx, ry, rz);
    rackG.rotation.y = this.yawLift + Math.PI * 0.5;

    // Carved wooden double-bay ski equipment stand with colorful skis & poles!
    rackG.add(
      this.mesh(new T.BoxGeometry(2.1, 0.14, 0.65), this.m.stone, 0, 0.07, 0),
      this.mesh(new T.BoxGeometry(0.12, 1.55, 0.12), this.m.cedar, -0.95, 0.85, 0),
      this.mesh(new T.BoxGeometry(0.12, 1.55, 0.12), this.m.cedar, 0.95, 0.85, 0),
      this.mesh(new T.BoxGeometry(2.15, 0.10, 0.14), this.m.cedar, 0, 1.15, 0),
      this.mesh(new T.BoxGeometry(2.25, 0.12, 0.42), this.m.roofRed, 0, 1.66, 0),
      this.mesh(new T.BoxGeometry(2.30, 0.08, 0.46), this.m.snow, 0, 1.75, 0),
      // Tiny glowing lantern hanging on side of ski rack
      this.mesh(new T.SphereGeometry(0.11, 10, 8), this.m.warmGlow, 1.05, 1.48, 0)
    );
    // 3 pairs of festive alpine skis + poles leaning neatly in the summit rack!
    const skiMats = [this.m.skiRed, this.m.skiBlue, this.m.skiPink];
    for (let i = 0; i < 3; i++) {
      const sx = -0.62 + i * 0.46;
      const s1 = this.mesh(new T.BoxGeometry(0.09, 1.48, 0.03), skiMats[i], sx, 0.82, 0.09);
      const s2 = this.mesh(new T.BoxGeometry(0.09, 1.48, 0.03), skiMats[i], sx + 0.11, 0.82, 0.09);
      s1.rotation.x = -0.10; s2.rotation.x = -0.10;
      rackG.add(s1, s2);
    }
    // Summit Ski Poles
    for (let p = 0; p < 2; p++) {
      const pole = this.mesh(new T.CylinderGeometry(0.014, 0.014, 1.28, 6), this.m.gold, 0.62 + p * 0.14, 0.72, 0.08);
      pole.rotation.x = -0.08;
      rackG.add(pole);
    }
    scene.add(rackG);
    world.circles.push({ x: rx, z: rz, r: 0.95, top: 1.55 });

    // Interactive Summit Ski Equipment Spot: Take & Equip right on the mountain top!
    world.spots.push({
      id: "summit_skis",
      pos: new T.Vector3(rx, ry + 1.1, rz),
      r: 3.1,
      label: () => {
        const sk = this.game.ski;
        if (!sk || !sk.owned) return "山顶雪具架 · 领取并穿上滑雪板！";
        return sk.on ? "山顶雪具架 · 脱下滑雪板（或按 Q）" : "山顶雪具架 · 穿上滑雪板出发（或按 Q）";
      },
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const g = this.game, sk = g.ski;
        if (!sk) return;
        if (!sk.owned) {
          sk.take();
          // Also equip right away if standing on snow!
          if (!sk.on && g.world.surfaceAt(g.player.pos.x, g.player.pos.z) !== "wood") {
            sk.toggle();
          }
          g.ui.toast("已在山顶雪具架领取并穿好滑雪板！穿过前方「高山速降出发门」就能一路疾驰冲下雪山啦喵～", 6.5);
        } else {
          sk.toggle();
        }
      }
    });

    // Cozy Summit Warming Chalet & Hot Ginger-Tea Counter right beside Ci(1.03, 1.5, false)
    const [cx, cz] = this.Ci(1.03, -6.5, false);
    const cy = this.qt(cx, cz);
    const chG = new T.Group();
    chG.position.set(cx, cy, cz);
    chG.rotation.y = this.yawLift + Math.PI;

    const chaletWinMats = { frame: this.m.darkWood, brass: this.m.gold, snow: this.m.snow, pane: this.m.winCozy, shutter: this.m.shutter };
    chG.add(
      // Carved ashlar stone plinth & textured cedar open-front alpine shelter
      this.mesh(new T.BoxGeometry(4.4, 0.30, 3.4), this.m.stoneWall, 0, 0.15, 0),
      this.mesh(new T.BoxGeometry(4.0, 2.45, 0.24), this.m.cedarWall, 0, 1.50, -1.45),
      this.mesh(new T.BoxGeometry(0.24, 2.45, 3.0), this.m.cedarWall, -1.9, 1.50, 0),
      this.mesh(new T.BoxGeometry(0.24, 2.45, 3.0), this.m.cedarWall, 1.9, 1.50, 0),
      // Heavy alpine timber corner posts & front lintel beam
      this.mesh(new T.BoxGeometry(0.22, 2.52, 0.22), this.m.darkWood, -1.96, 1.54, 1.44),
      this.mesh(new T.BoxGeometry(0.22, 2.52, 0.22), this.m.darkWood, 1.96, 1.54, 1.44),
      this.mesh(new T.BoxGeometry(0.22, 2.52, 0.22), this.m.darkWood, -1.96, 1.54, -1.48),
      this.mesh(new T.BoxGeometry(0.22, 2.52, 0.22), this.m.darkWood, 1.96, 1.54, -1.48),
      this.mesh(new T.BoxGeometry(4.24, 0.18, 0.24), this.m.darkWood, 0, 2.72, 1.44),
      // Stone alpine fireplace chimney stack on the East side
      this.mesh(new T.BoxGeometry(0.68, 3.9, 0.68), this.m.stoneWall, 2.15, 2.25, -0.75),
      this.mesh(new T.BoxGeometry(0.84, 0.18, 0.84), this.m.stone, 2.15, 4.24, -0.75),
      this.mesh(new T.BoxGeometry(0.76, 0.08, 0.76), this.m.snow, 2.15, 4.35, -0.75),
      // Hot Ginger-Tea Thermos Counter inside
      this.mesh(new T.BoxGeometry(2.6, 0.92, 0.72), this.m.darkWood, 0, 0.76, -0.75),
      this.mesh(new T.BoxGeometry(2.74, 0.08, 0.84), this.m.cedar, 0, 1.24, -0.72),
      this.mesh(new T.CylinderGeometry(0.16, 0.18, 0.42, 12), this.m.gold, -0.55, 1.48, -0.75),
      this.mesh(new T.CylinderGeometry(0.11, 0.10, 0.20, 10), this.m.skiRed, 0.15, 1.38, -0.70),
      this.mesh(new T.CylinderGeometry(0.11, 0.10, 0.20, 10), this.m.skiBlue, 0.50, 1.38, -0.70),
      // Crackling Outdoor Warming Brazier beside the chalet!
      this.mesh(new T.CylinderGeometry(0.42, 0.30, 0.55, 10), this.m.stone, 2.65, 0.28, 0.6),
      this.mesh(new T.SphereGeometry(0.28, 10, 8), this.m.ember, 2.65, 0.62, 0.6),
      // Hanging brass & glowing warm ceiling lamp
      this.mesh(new T.CylinderGeometry(0.02, 0.02, 0.34, 6), this.m.gold, 0, 2.68, 0.2),
      this.mesh(new T.SphereGeometry(0.16, 10, 8), this.m.warmGlow, 0, 2.46, 0.2)
    );
    // Real pitched scalloped red-shingle chalet gable roof + thick snow eaves + gable triangles!
    const chPitch = 0.54, chSlope = 2.65, chLen = 4.05, chRidgeY = 3.92;
    const chDrop = Math.sin(chPitch) * (chSlope * 0.5);
    const chOffX = Math.cos(chPitch) * (chSlope * 0.5);
    for (const side of [-1, 1]) {
      const rp = this.mesh(new T.BoxGeometry(chSlope, 0.12, chLen), this.m.roofRed, side * chOffX, chRidgeY - chDrop, 0);
      rp.rotation.z = -side * chPitch;
      const sn = this.mesh(new T.BoxGeometry(chSlope + 0.08, 0.09, chLen + 0.06), this.m.snow, side * chOffX, chRidgeY - chDrop + 0.085, 0);
      sn.rotation.z = -side * chPitch;
      chG.add(rp, sn);
    }
    const chGable = new T.Shape();
    chGable.moveTo(-2.05, 0); chGable.lineTo(2.05, 0); chGable.lineTo(0, 1.18); chGable.closePath();
    const chGGeo = new T.ExtrudeGeometry(chGable, { depth: 0.16, bevelEnabled: false });
    chGGeo.translate(0, 0, -0.08);
    chG.add(
      this.mesh(chGGeo, this.m.cedarWall, 0, 2.74, -1.45),
      this.mesh(chGGeo, this.m.cedarWall, 0, 2.74, 1.44),
      this.mesh(new T.CylinderGeometry(0.07, 0.07, chLen + 0.2, 8).rotateX(Math.PI / 2), this.m.gold, 0, chRidgeY + 0.06, 0)
    );
    // Crisp 3D Recessed Shuttered Alpine Windows on left, right, and rear chalet walls!
    const cwL = buildCrispWindow(T, chaletWinMats, { w: 1.05, h: 1.12, shutters: true, flowerBox: true, boxFillMats: [this.m.pine, this.m.skiRed, this.m.pine] });
    cwL.position.set(-2.03, 1.62, 0.05); cwL.rotation.y = -Math.PI / 2;
    const cwR = buildCrispWindow(T, chaletWinMats, { w: 1.05, h: 1.12, shutters: true, flowerBox: true, boxFillMats: [this.m.pine, this.m.skiRed, this.m.pine] });
    cwR.position.set(2.03, 1.62, 0.45); cwR.rotation.y = Math.PI / 2;
    const cwB = buildCrispWindow(T, chaletWinMats, { w: 1.24, h: 1.16, arch: true, shutters: true });
    cwB.position.set(0, 1.66, -1.58); cwB.rotation.y = Math.PI;
    chG.add(cwL, cwR, cwB);
    // Fluttering Alpine Summit Wind-Sock Pole!
    const poleX = -2.6, poleZ = 1.0;
    chG.add(this.mesh(new T.CylinderGeometry(0.045, 0.06, 3.6, 8), this.m.gold, poleX, 1.8, poleZ));
    const sock = new T.Group();
    sock.position.set(poleX, 3.45, poleZ);
    for (let s = 0; s < 4; s++) {
      sock.add(this.mesh(
        new T.CylinderGeometry(0.16 - s * 0.025, 0.18 - s * 0.025, 0.28, 10).rotateZ(Math.PI / 2),
        s % 2 === 0 ? this.m.skiRed : this.m.snow,
        0.18 + s * 0.28, 0, 0
      ));
    }
    chG.add(sock);
    this.windSock = sock;

    scene.add(chG);
    world.circles.push({ x: cx, z: cz, r: 2.1 });
    this.warmZones.push({ x: cx, z: cz, r: 6.0, w: 20 });
    this.addLight(cx, cy + 2.4, cz, 0xffcc7a, 13, 18);

    world.spots.push({
      id: "summit_tea",
      pos: new T.Vector3(cx, cy + 1.2, cz),
      r: 3.4,
      label: "喝一杯山顶热姜茶 · 瞬间暖遍全身！",
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const g = this.game;
        g.cold && (g.cold.w = 100, g.cold.wet = 0);
        g.audio.pick && g.audio.pick();
        g.character && g.character.play && g.character.play("happy");
        g.ui.toast("热乎乎的山顶蜂蜜姜茶下肚！体温全满，可以元气满满冲下雪道啦喵～", 4.5);
      }
    });
  }

  // =========================================================================
  // 2. GRAND ALPINE START-GATE ARCHWAY & GLOWING SLOPE GUIDE BEACONS!
  // =========================================================================
  buildSummitStartGateAndSlopeBeacons() {
    const T = this.THREE;
    const { scene, world } = this.game;

    // Grand Alpine Start Gate spanning the top of the ski slope at t = 0.96!
    const [gx, gz] = this.Ci(0.96, 0, true);
    const gy = this.qt(gx, gz);
    const gateG = new T.Group();
    gateG.position.set(gx, gy, gz);
    gateG.rotation.y = this.yawLift + Math.PI;

    for (const side of [-1, 1]) {
      const px = side * 3.6;
      gateG.add(
        this.mesh(new T.BoxGeometry(0.45, 0.45, 0.45), this.m.stone, px, 0.22, 0),
        this.mesh(new T.CylinderGeometry(0.16, 0.20, 3.9, 10), this.m.cedar, px, 2.0, 0),
        this.mesh(new T.SphereGeometry(0.22, 10, 8), side < 0 ? this.m.cyanGlow : this.m.pinkGlow, px, 4.1, 0)
      );
      // Offset collider in world space
      const wx = gx + px * Math.cos(this.yawLift + Math.PI);
      const wz = gz - px * Math.sin(this.yawLift + Math.PI);
      world.circles.push({ x: wx, z: wz, r: 0.36 });
    }
    const gTex = this.makeSignTex("✦ 高山速降出发门 ✦", "按 Q 穿雪板 · 冲过旗门刷新纪录！");
    const gSign = this.mesh(new T.BoxGeometry(7.2, 1.05, 0.16), [
      this.m.gold, this.m.gold, this.m.snow, this.m.gold,
      this.wrapMat(new T.MeshStandardMaterial({ map: gTex, roughness: 0.28 }), { key: "plain" }),
      this.wrapMat(new T.MeshStandardMaterial({ map: gTex, roughness: 0.28 }), { key: "plain" })
    ], 0, 3.65, 0);
    gateG.add(gSign);
    scene.add(gateG);

    // Glowing Alpine Slalom / Descent Guide Beacons lining both edges of the 185m ski run!
    for (let i = 1; i <= 7; i++) {
      const t = i * 0.12;
      for (const side of [-1, 1]) {
        const [bx, bz] = this.Ci(t, side * 9.5, true);
        const by = this.qt(bx, bz);
        const bg = new T.Group();
        bg.position.set(bx, by, bz);
        bg.add(
          this.mesh(new T.CylinderGeometry(0.045, 0.055, 2.2, 8), this.m.cedar, 0, 1.1, 0),
          this.mesh(new T.SphereGeometry(0.14, 8, 6), (i + (side > 0 ? 1 : 0)) % 2 === 0 ? this.m.cyanGlow : this.m.pinkGlow, 0, 2.28, 0),
          this.mesh(new T.BoxGeometry(0.55, 0.34, 0.04), side > 0 ? this.m.skiRed : this.m.skiBlue, side * -0.28, 1.92, 0)
        );
        bg.rotation.y = this.yawLift;
        scene.add(bg);
      }
    }
  }

  // =========================================================================
  // 3. SKI BASE RESORT LODGE PAVILION & LIVE BEST-TIME SCOREBOARD!
  // =========================================================================
  buildBaseSkiLodge() {
    const T = this.THREE;
    const { scene, world } = this.game;

    const [lx, lz] = this.Ci(-0.045, 13.5, false);
    const ly = this.qt(lx, lz);
    const lg = new T.Group();
    lg.position.set(lx, ly, lz);
    lg.rotation.y = this.yawLift - Math.PI * 0.5;

    const lodgeWinMats = {
      frame: this.m.darkWood,
      door: this.m.cedar,
      brass: this.m.gold,
      snow: this.m.snow,
      pane: this.m.winCozy,
      shutter: this.m.shutter
    };
    lg.add(
      // Carved Ashlar Stone Plinth + Textured Beveled Cedar Alpine Ski Lodge!
      this.mesh(new T.BoxGeometry(5.3, 0.34, 4.0), this.m.stoneWall, 0, 0.17, 0),
      this.mesh(new T.BoxGeometry(4.9, 2.72, 3.55), this.m.cedarWall, 0, 1.70, 0),
      // Heavy corner timber posts & belt molding
      this.mesh(new T.BoxGeometry(0.24, 2.78, 0.24), this.m.darkWood, -2.44, 1.72, 1.76),
      this.mesh(new T.BoxGeometry(0.24, 2.78, 0.24), this.m.darkWood, 2.44, 1.72, 1.76),
      this.mesh(new T.BoxGeometry(0.24, 2.78, 0.24), this.m.darkWood, -2.44, 1.72, -1.76),
      this.mesh(new T.BoxGeometry(0.24, 2.78, 0.24), this.m.darkWood, 2.44, 1.72, -1.76),
      this.mesh(new T.BoxGeometry(5.12, 0.16, 3.80), this.m.darkWood, 0, 3.06, 0),
      // Stone Hearth Chimney Stack rising through the alpine roof!
      this.mesh(new T.BoxGeometry(0.76, 4.65, 0.76), this.m.stoneWall, 1.85, 2.60, -1.55),
      this.mesh(new T.BoxGeometry(0.92, 0.18, 0.92), this.m.stone, 1.85, 4.98, -1.55),
      this.mesh(new T.BoxGeometry(0.84, 0.08, 0.84), this.m.snow, 1.85, 5.10, -1.55),
      // Outdoor Warming Brazier & Sturdy Grounded Cedar Benches (with real support legs!)
      this.mesh(new T.CylinderGeometry(0.45, 0.34, 0.52, 10), this.m.stone, 0, 0.26, 3.15),
      this.mesh(new T.SphereGeometry(0.30, 10, 8), this.m.ember, 0, 0.60, 3.15),
      this.mesh(new T.BoxGeometry(1.75, 0.12, 0.46), this.m.darkWood, -2.1, 0.46, 3.05),
      this.mesh(new T.BoxGeometry(0.14, 0.44, 0.38), this.m.cedar, -2.75, 0.22, 3.05),
      this.mesh(new T.BoxGeometry(0.14, 0.44, 0.38), this.m.cedar, -1.45, 0.22, 3.05),
      this.mesh(new T.BoxGeometry(1.75, 0.12, 0.46), this.m.darkWood, 2.1, 0.46, 3.05),
      this.mesh(new T.BoxGeometry(0.14, 0.44, 0.38), this.m.cedar, 1.45, 0.22, 3.05),
      this.mesh(new T.BoxGeometry(0.14, 0.44, 0.38), this.m.cedar, 2.75, 0.22, 3.05)
    );
    // Pitched Scalloped Red-Shingle Alpine Chalet Roof + Heavy Snow Eaves + Gable End Walls!
    const lgPitch = 0.54, lgSlope = 3.15, lgLen = 5.95, lgRidgeY = 4.65;
    const lgDrop = Math.sin(lgPitch) * (lgSlope * 0.5);
    const lgOffZ = Math.cos(lgPitch) * (lgSlope * 0.5);
    for (const side of [-1, 1]) {
      const rp = this.mesh(new T.BoxGeometry(lgLen, 0.13, lgSlope), this.m.roofRed, 0, lgRidgeY - lgDrop, side * lgOffZ);
      rp.rotation.x = side * lgPitch;
      const sn = this.mesh(new T.BoxGeometry(lgLen + 0.08, 0.095, lgSlope + 0.08), this.m.snow, 0, lgRidgeY - lgDrop + 0.09, side * lgOffZ);
      sn.rotation.x = side * lgPitch;
      lg.add(rp, sn);
    }
    const lgGable = new T.Shape();
    lgGable.moveTo(-1.82, 0); lgGable.lineTo(1.82, 0); lgGable.lineTo(0, 1.54); lgGable.closePath();
    const lgGGeo = new T.ExtrudeGeometry(lgGable, { depth: 0.18, bevelEnabled: false });
    lgGGeo.translate(0, 0, -0.09);
    for (const sx of [-2.42, 2.42]) {
      const gw = this.mesh(lgGGeo, this.m.cedarWall, sx, 3.08, 0);
      gw.rotation.y = Math.PI / 2;
      lg.add(gw);
    }
    lg.add(
      this.mesh(new T.CylinderGeometry(0.08, 0.08, lgLen + 0.24, 10).rotateZ(Math.PI / 2), this.m.gold, 0, lgRidgeY + 0.07, 0)
    );

    // Sculpted Recessed Chalet Front Door + Twin Porch Brass Sconces!
    const frontDoor = buildCrispDoor(T, lodgeWinMats, { w: 1.18, h: 2.08, double: false, arch: true });
    frontDoor.position.set(0, 0.34, 1.78);
    lg.add(frontDoor);
    for (const sx of [-0.82, 0.82]) {
      lg.add(
        this.mesh(new T.BoxGeometry(0.08, 0.18, 0.16), this.m.darkWood, sx, 2.15, 1.84),
        this.mesh(new T.SphereGeometry(0.10, 10, 8), this.m.warmGlow, sx, 2.02, 1.90)
      );
    }

    // 6 ULTRA-CRISP 3D RECESSED SHUTTERED ALPINE WINDOWS (Front, Sides & Rear — ZERO flat yellow blobs!)
    for (const wx of [-1.58, 1.58]) {
      const fw = buildCrispWindow(T, lodgeWinMats, {
        w: 0.96, h: 1.18, arch: true, shutters: true, flowerBox: true,
        boxFillMats: [this.m.pine, this.m.skiRed, this.m.pine]
      });
      fw.position.set(wx, 1.74, 1.78);
      lg.add(fw);
    }
    for (const side of [-1, 1]) {
      const sw = buildCrispWindow(T, lodgeWinMats, {
        w: 1.15, h: 1.24, arch: true, shutters: true, flowerBox: true,
        boxFillMats: [this.m.pine, this.m.skiRed, this.m.pine]
      });
      sw.position.set(side * 2.46, 1.76, 0);
      sw.rotation.y = side * (Math.PI / 2);
      lg.add(sw);
    }
    for (const wx of [-1.15, 1.15]) {
      const bw = buildCrispWindow(T, lodgeWinMats, { w: 1.05, h: 1.18, arch: true, shutters: true });
      bw.position.set(wx, 1.74, -1.78);
      bw.rotation.y = Math.PI;
      lg.add(bw);
    }

    const sTex = this.makeSignTex("⛷ 雪境滑雪俱乐部", "山脚与山顶均可领雪板 · 按 Q 穿脱");
    lg.add(this.mesh(new T.BoxGeometry(3.2, 0.82, 0.12), [
      this.m.gold, this.m.gold, this.m.snow, this.m.gold,
      this.wrapMat(new T.MeshStandardMaterial({ map: sTex, roughness: 0.3 }), { key: "plain" }),
      this.wrapMat(new T.MeshStandardMaterial({ map: sTex, roughness: 0.3 }), { key: "plain" })
    ], 0, 3.12, 1.98));

    scene.add(lg);
    world.circles.push({ x: lx, z: lz, r: 2.6 });
    this.warmZones.push({ x: lx, z: lz, r: 6.5, w: 18 });
    this.addLight(lx, ly + 2.4, lz, 0xffca7a, 14, 18);

    world.spots.push({
      id: "ski_lodge_board",
      pos: new T.Vector3(lx, ly + 1.2, lz),
      r: 4.2,
      label: () => {
        const b = this.game.ski && this.game.ski.best;
        return b > 0
          ? `滑雪俱乐部 · 查看速降纪录（最快 ${b.toFixed(1)} 秒）`
          : "滑雪俱乐部 · 暖炉回温 & 领取滑雪指南";
      },
      can: () => !this.game.player.riding && !this.game.player.seat,
      act: () => {
        const g = this.game, b = g.ski && g.ski.best;
        g.cold && g.cold.warm(40);
        g.audio.pick && g.audio.pick();
        if (g.ski && !g.ski.owned) g.ski.take();
        g.ui.toast(
          b > 0
            ? `⛷ 当前高山速降最佳纪录：${b.toFixed(1)} 秒！坐缆车或飞猫上山顶，在山顶雪具架也能直接换雪板哦喵～`
            : "⛷ 欢迎来到雪境滑雪俱乐部！山脚和山顶都配有雪具领取架，坐缆车或飞上去都能畅滑全山喵～",
          5.5
        );
      }
    });
  }

  // =========================================================================
  // 4. BONUS CAT-CRAFTED DELIGHT: 18M CURVED RAINBOW CRYSTAL ICE-SLIDE!
  //    Placed cleanly at open snow meadow beside Ski Base: Ci(0.06, 17.5, false)
  // =========================================================================
  buildRainbowIceSlide() {
    const T = this.THREE;
    const { scene, world } = this.game;

    const [sx, sz] = this.Ci(0.06, 18.0, false);
    const sy = this.qt(sx, sz);

    // Graceful S-curved descending chute from +4.2m launch deck down to snow ground!
    const pts = [
      new T.Vector3(0, 4.25, 0),
      new T.Vector3(3.2, 3.45, 2.2),
      new T.Vector3(6.8, 2.20, 1.4),
      new T.Vector3(10.5, 1.15, 3.8),
      new T.Vector3(14.2, 0.35, 5.2),
      new T.Vector3(16.8, 0.16, 4.6)
    ].map((p) => {
      const wx = sx + p.x, wz = sz + p.z;
      return new T.Vector3(wx, Math.max(this.qt(wx, wz) + 0.18, sy + p.y), wz);
    });

    this.slideCurve = new T.CatmullRomCurve3(pts);
    this.slideStartPos.copy(pts[0]);
    this.slideEndPos.copy(pts[pts.length - 1]);

    const slideG = new T.Group();
    // Wooden Snowy Launch Tower at pts[0]!
    const p0 = pts[0];
    const base0 = this.qt(p0.x, p0.z);
    const h0 = p0.y - base0;
    const towerG = new T.Group();
    towerG.position.set(p0.x, base0, p0.z);
    towerG.add(
      this.mesh(new T.BoxGeometry(2.4, 0.22, 2.4), this.m.cedar, 0, h0 - 0.11, 0),
      this.mesh(new T.BoxGeometry(2.5, 0.08, 2.5), this.m.gold, 0, h0, 0),
      this.mesh(new T.CylinderGeometry(0.12, 0.16, h0, 8), this.m.cedar, -1.0, h0 / 2, -1.0),
      this.mesh(new T.CylinderGeometry(0.12, 0.16, h0, 8), this.m.cedar, 1.0, h0 / 2, -1.0),
      this.mesh(new T.CylinderGeometry(0.12, 0.16, h0, 8), this.m.cedar, -1.0, h0 / 2, 1.0),
      this.mesh(new T.CylinderGeometry(0.12, 0.16, h0, 8), this.m.cedar, 1.0, h0 / 2, 1.0),
      this.mesh(new T.OctahedronGeometry(0.32, 0), this.m.pinkGlow, 0, h0 + 1.45, 0)
    );
    slideG.add(towerG);
    world.circles.push({ x: p0.x, z: p0.z, r: 1.35 });

    // Sculpted Crystalline Sliding Chute Ribbon + Twin Glowing Rainbow Side Rails!
    const segs = 32;
    const samplePts = this.slideCurve.getPoints(segs);
    const railL = [], railR = [];
    for (let i = 0; i < segs; i++) {
      const a = samplePts[i], b = samplePts[i + 1];
      const mid = new T.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const dir = new T.Vector3().subVectors(b, a);
      const len = dir.length();
      const side = new T.Vector3(-dir.z, 0, dir.x).normalize();
      railL.push(a.clone().addScaledVector(side, 0.68).add(new T.Vector3(0, 0.22, 0)));
      railR.push(a.clone().addScaledVector(side, -0.68).add(new T.Vector3(0, 0.22, 0)));

      // Smooth ice plank segment cleanly staggered by ±0.005m in Y (zero seam Z-fighting!)
      const segM = new T.Mesh(new T.BoxGeometry(1.32, 0.14, len + 0.05), this.m.iceChute);
      segM.position.copy(mid);
      segM.position.y += (i % 2 ? 0.005 : -0.005);
      segM.lookAt(b);
      slideG.add(segM);

      // Support timber stilts every 6 segments
      if (i > 2 && i % 6 === 0) {
        const gy = this.qt(mid.x, mid.z);
        const sh = Math.max(0.2, mid.y - gy);
        slideG.add(this.mesh(new T.CylinderGeometry(0.10, 0.14, sh, 8), this.m.cedar, mid.x, gy + sh / 2, mid.z));
      }
    }
    railL.push(samplePts[segs].clone().add(new T.Vector3(0, 0.22, 0.68)));
    railR.push(samplePts[segs].clone().add(new T.Vector3(0, 0.22, -0.68)));

    slideG.add(
      new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(railL), 40, 0.065, 8, false), this.m.cyanGlow),
      new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(railR), 40, 0.065, 8, false), this.m.pinkGlow)
    );

    scene.add(slideG);
    this.addLight(p0.x, p0.y + 1.5, p0.z, 0x8ef5ff, 12, 16);

    // Interactive Launch Spot right at the base/side of the slide tower (no tedious climbing needed!)
    world.spots.push({
      id: "rainbow_ice_slide",
      pos: new T.Vector3(p0.x, base0 + 1.15, p0.z),
      r: 3.2,
      label: "坐上「彩虹水晶冰滑梯」· 一路飞滑下去喵！",
      can: () => !this.sliding && !this.game.player.riding && !this.game.player.seat && !this.game.player.skiing,
      act: () => this.startIceSlide()
    });
  }

  startIceSlide() {
    const g = this.game, pl = g.player;
    if (this.sliding || !this.slideCurve) return;
    this.sliding = true;
    this.slideT = 0;
    this.slideSparkAcc = 0;
    pl.enabled = false;
    pl.vel.set(0, 0);
    g.character && g.character.play && g.character.play("cheer");
    // Play joyful sliding chime glissando!
    if (g.audio && g.audio.ctx && !g.audio.muted) {
      const ctx = g.audio.ctx, t0 = ctx.currentTime;
      [1046.5, 987.77, 880, 783.99, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const o = ctx.createOscillator(), gn = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(f, t0 + idx * 0.14);
        gn.gain.setValueAtTime(1e-4, t0 + idx * 0.14);
        gn.gain.linearRampToValueAtTime(0.06, t0 + idx * 0.14 + 0.015);
        gn.gain.exponentialRampToValueAtTime(1e-4, t0 + idx * 0.14 + 0.35);
        o.connect(gn).connect(g.audio.master);
        o.start(t0 + idx * 0.14); o.stop(t0 + idx * 0.14 + 0.4);
      });
    }
    g.ui.toast("咻——坐上彩虹水晶冰滑梯冲下去啦！", 3.6);
  }

  addLight(x, y, z, col, pwr, dist = 16) {
    const l = new this.THREE.PointLight(col, 0, dist, 1.4);
    l.position.set(x, y, z);
    this.game.scene.add(l);
    this.lights.push({ l, pwr });
  }

  warmthAt(x, z) {
    for (const wz of this.warmZones) {
      if ((x - wz.x) ** 2 + (z - wz.z) ** 2 < wz.r * wz.r) return wz.w;
    }
    return 0;
  }

  update(dt, time) {
    const g = this.game, pl = g.player;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;

    if (this.windSock) {
      this.windSock.rotation.y = Math.sin(time * 2.4) * 0.25;
      this.windSock.rotation.z = -0.15 + Math.sin(time * 5.2) * 0.08;
    }
    for (let i = 0; i < this.beaconMats.length; i++) {
      this.beaconMats[i].emissiveIntensity = (0.7 + 1.5 * lamps) * (0.85 + 0.2 * Math.sin(time * 3.2 + i * 1.5));
    }
    for (const lt of this.lights) {
      lt.l.intensity = lt.pwr * (0.45 + 0.55 * lamps);
    }

    // Active Rainbow Crystal Ice-Slide 3D Spline Ride!
    if (this.sliding && this.slideCurve && pl) {
      // Smoothly accelerate down the icy chute!
      const speed = 0.24 + 0.26 * Math.sin(this.slideT * Math.PI * 0.85);
      this.slideT = Math.min(1, this.slideT + dt * speed);
      const pos = this.slideCurve.getPoint(this.slideT);
      const tan = this.slideCurve.getTangent(this.slideT);
      pl.pos.x = pos.x;
      pl.pos.z = pos.z;
      pl.y = pos.y + pl.eye;
      pl.air = 0;
      pl.vy = 0;
      pl.yaw = Math.atan2(-tan.x, -tan.z);
      if (g.character) g.character.yaw = pl.yaw;

      // Sparkling rainbow frost trail behind the sliding character!
      this.slideSparkAcc += dt * 26;
      while (this.slideSparkAcc >= 1) {
        this.slideSparkAcc -= 1;
        const pk = Math.random() > 0.5;
        g.sparks.spawn(
          pos.x + (Math.random() - 0.5) * 0.5, pos.y + 0.25, pos.z + (Math.random() - 0.5) * 0.5,
          -tan.x * 1.6 + (Math.random() - 0.5), 0.8 + Math.random() * 1.0, -tan.z * 1.6 + (Math.random() - 0.5),
          0.11, 0.95, 0.55,
          pk ? 3.4 : 0.5, pk ? 1.1 : 2.9, pk ? 2.8 : 3.6, 1.0, 1.1
        );
      }

      if (this.slideT >= 1) {
        this.sliding = false;
        pl.enabled = true;
        // Celebratory little exit hop onto the soft snow cushion!
        pl.air = 0.12;
        pl.vy = 4.2;
        pl.vel.set(tan.x * 3.8, tan.z * 3.8);
        g.audio.hop && g.audio.hop(1.2);
        g.character && g.character.play && g.character.play("happy");
      }
    }
  }
}
