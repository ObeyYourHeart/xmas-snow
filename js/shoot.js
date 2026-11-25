// 重构版双架构射击系统：
// - Claude 模式 (mode = "cannon"): 升级版气动压雪炮（16 发连发直线雪弹 + 压雪装填）
// - Gemini 模式 (mode = "bow"): 真正的拉弓蓄力 · 抛物线实体星矢弓箭系统（星弦猫耳光弓）
//   支持：按住 J / 鼠标左键拉弓蓄力（实体箭矢随弓弦后拉、准星收紧、满弦星鸣）、松手放箭、轻点速射、
//        真实重力抛物线飞行、箭身随速度切线俯仰、命中雪地/树干/墙壁实体插箭颤动、满弦贯星爆裂！

export function installShootingSystem(gun, tools, game, helpers) {
  if (!gun || gun._refactored) return gun;
  gun._refactored = true;

  const T = game.THREE;
  const wrap = (m) => helpers.mat(m, { key: "plain" });
  const UP = new T.Vector3(0, 1, 0);
  const FWD = new T.Vector3(0, 0, 1);

  // Global Shootable Target Registry (shared across SnowGun, Starlight Bow & 118 Og ChemGun!)
  if (!game.shootTargets) game.shootTargets = [];

  // Smooth spring-damped Camera Recoil + Dynamic Colored Muzzle Flash Light + Floating Hit-Combo Badge!
  const recoil = { p: 0, vp: 0, y: 0, vy: 0, fov: 0 };
  const muzzleLight = new T.PointLight(0x88f4ff, 0, 8.5, 1.8);
  muzzleLight.visible = false;
  game.scene.add(muzzleLight);
  let muzzleLightT = 0;

  // Floating Hit-Combo HUD Pill right above crosshair
  let comboEl = document.getElementById("shootCombo");
  if (!comboEl) {
    comboEl = document.createElement("div");
    comboEl.id = "shootCombo";
    (document.getElementById("hud") || document.body).appendChild(comboEl);
  }
  gun.combo = 0;
  gun.comboT = 0;
  gun.comboShowT = 0;
  gun.overdriveT = 0; // Bonus rapid-fire starlight overdrive buff from Harbor Workshop!

  gun.kickCamera = function (pitchKick = 0.018, yawKick = 0.008, fovKick = 0.025, flashHex = null, flashPos = null) {
    recoil.vp += pitchKick * 18;
    recoil.vy += (Math.random() - 0.5) * 2 * yawKick * 16;
    recoil.fov = Math.min(0.08, recoil.fov + fovKick);
    if (flashHex !== null && flashPos) {
      muzzleLight.color.setHex(flashHex);
      muzzleLight.position.copy(flashPos);
      muzzleLight.intensity = 6.5;
      muzzleLight.visible = true;
      muzzleLightT = 0.075;
    }
  };

  // 3D Holographic Laser Sight + Glowing Targeting Dot + Floating 3D World-Space Hit Popups!
  const laserMat = new T.MeshBasicMaterial({ color: 0x52f4ff, transparent: true, opacity: 0.42, depthWrite: false, fog: false });
  const laserBeam = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 1, 6), laserMat);
  laserBeam.visible = false; laserBeam.frustumCulled = false; laserBeam.renderOrder = 6;
  const laserDotMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, depthWrite: false, fog: false });
  const laserDot = new T.Mesh(new T.SphereGeometry(0.068, 10, 8), laserDotMat);
  laserDot.visible = false; laserDot.frustumCulled = false; laserDot.renderOrder = 7;
  game.scene.add(laserBeam, laserDot);
  const _lzStart = new T.Vector3();
  const _lzMid = new T.Vector3();
  const _lzDir = new T.Vector3();

  // Floating 3D World-Space Damage/Score Popup Pool (leaps upward right from exact hit point!)
  const popups = [];
  for (let i = 0; i < 10; i++) {
    const cv = document.createElement("canvas");
    cv.width = 256; cv.height = 96;
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    const mat = new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false });
    const sp = new T.Sprite(mat);
    sp.visible = false;
    sp.renderOrder = 9;
    game.scene.add(sp);
    popups.push({ on: false, sp, cv, tex, mat, t: 0, dur: 0.92, vy: 1.8 });
  }

  gun.spawnPopup = function (worldPos, text, crit = false) {
    if (!worldPos || !text) return;
    const p = popups.find((x) => !x.on) || popups[0];
    p.on = true; p.t = 0; p.dur = crit ? 1.05 : 0.85; p.vy = crit ? 2.1 : 1.65;
    const c = p.cv.getContext("2d");
    c.clearRect(0, 0, 256, 96);
    c.font = `900 ${crit ? 38 : 32}px "Microsoft YaHei", "PingFang SC", system-ui, sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 8;
    c.strokeStyle = "rgba(14, 18, 42, 0.88)";
    c.strokeText(text, 128, 48, 240);
    c.fillStyle = crit ? "#ffe66b" : "#7cf6ff";
    c.fillText(text, 128, 48, 240);
    p.tex.needsUpdate = true;
    p.sp.position.set(worldPos.x + (Math.random() - 0.5) * 0.25, worldPos.y + 0.35, worldPos.z + (Math.random() - 0.5) * 0.25);
    const dist = game.camera ? game.camera.position.distanceTo(worldPos) : 12;
    const sc = Math.max(0.75, Math.min(2.2, dist * 0.085)) * (crit ? 1.18 : 0.95);
    p.sp.scale.set(sc * 2.2, sc * 0.82, 1);
    p.mat.opacity = 1;
    p.sp.visible = true;
  };

  gun.registerHit = function (crit = false, label = "", worldPos = null) {
    gun.combo = gun.comboT > 0 ? Math.min(99, gun.combo + 1) : 1;
    gun.comboT = 3.6;
    gun.comboShowT = 1.45;
    gun.hitT = crit ? 0.34 : 0.26;
    gun.hitBig = !!crit;
    if (gun.ui && gun.ui.el) {
      gun.ui.el.classList.toggle("hit-crit", !!crit);
    }
    if (game.audio && game.audio.gunHit) {
      game.audio.gunHit(crit, gun.combo);
    }
    if (worldPos) {
      gun.spawnPopup(worldPos, label || (crit ? "暴击!" : "命中!"), crit);
    }
    if (comboEl) {
      const txt = label
        ? (gun.combo > 1 ? `${label} · 连击 ×${gun.combo}` : label)
        : (crit ? `✦ 精准暴击 ×${gun.combo}` : `✦ 命中 ×${gun.combo}`);
      comboEl.textContent = txt;
      comboEl.classList.toggle("crit", !!crit || gun.combo >= 4);
      comboEl.classList.remove("show");
      void comboEl.offsetWidth;
      comboEl.classList.add("show");
    }
  };

  // Expose unified `chemActive` state for player.gunOut & ADS!
  Object.defineProperty(gun, "chemActive", {
    configurable: true,
    get() {
      const ch = game.character;
      return tools.held === "chemgun" && tools.usable && game.player.enabled && !!ch && ch.ready && !ch.rooted;
    }
  });

  // Wrap player.apply() to layer silky spring-damped recoil pitch/yaw & subtle FOV punch (zero drift!)
  if (game.player && !game.player._recoilWrapped) {
    game.player._recoilWrapped = true;
    const origApply = game.player.apply.bind(game.player);
    game.player.apply = function () {
      origApply();
      if (Math.abs(recoil.p) > 1e-4 || Math.abs(recoil.y) > 1e-4) {
        this.cam.rotation.x += recoil.p;
        this.cam.rotation.y += recoil.y;
      }
      if (recoil.fov > 1e-4 && !this.scope) {
        this.cam.zoom = Math.max(0.85, this.cam.zoom - recoil.fov);
        this.cam.updateProjectionMatrix();
      }
    };
  }

  // Upgrade gun.probe() so SnowGun, Starlight Bow & ChemGun ALL detect airborne balloons & game.shootTargets!
  const origProbe = gun.probe.bind(gun);
  gun.probe = function (pos) {
    // 1. Check airborne Gift Balloons first (snipeable by ALL 3 ranged weapons!)
    if (game.heli && game.heli.balloons) {
      for (const b of game.heli.balloons) {
        if (b.got) continue;
        const by = b.grp ? b.grp.position.y : b.y;
        if (Math.hypot(pos.x - b.x, pos.y - by, pos.z - b.z) < 1.38) {
          this._hit.kind = "balloon";
          this._hit.ref = b;
          return this._hit;
        }
      }
    }
    // 2. Check global interactive shootable props & Harbor Shooting Gallery targets!
    if (game.shootTargets && game.shootTargets.length) {
      for (const tg of game.shootTargets) {
        if (tg.alive && !tg.alive()) continue;
        const tp = tg.pos;
        const dx = pos.x - tp.x, dy = pos.y - tp.y, dz = pos.z - tp.z;
        const rr = tg.r || 0.72;
        if (dx * dx + dy * dy + dz * dz < rr * rr) {
          this._hit.kind = "shootTarget";
          this._hit.ref = tg;
          return this._hit;
        }
      }
    }
    return origProbe(pos);
  };

  // Smart Magnetic Aim-Assist inside gun.sightLine() so moving targets, bottles & balloons snap crisply within a 3.6° cone!
  const origSightLine = gun.sightLine.bind(gun);
  const _magDir = new T.Vector3();
  const _magTo = new T.Vector3();
  gun.sightLine = function () {
    origSightLine();
    const pl = game.player;
    if (!pl || !pl.cam || pl.frontLock) return;
    if (this.aimOn === "shootTarget" || this.aimOn === "balloon" || this.aimOn === "thing") return;

    const camP = pl.cam.position;
    pl.cam.getWorldDirection(_magDir);
    const minCos = 0.9978; // ~3.8° forgiving smart magnetism cone
    let bestCos = minCos;
    let bestPos = null;
    let bestKind = null;

    if (game.shootTargets) {
      for (const tg of game.shootTargets) {
        if (tg.alive && !tg.alive()) continue;
        _magTo.subVectors(tg.pos, camP);
        const d = _magTo.length();
        if (d < 1.8 || d > 72) continue;
        const c = _magTo.dot(_magDir) / d;
        if (c > bestCos) { bestCos = c; bestPos = tg.pos; bestKind = "shootTarget"; }
      }
    }
    if (game.heli && game.heli.balloons) {
      for (const b of game.heli.balloons) {
        if (b.got) continue;
        const by = b.grp ? b.grp.position.y : b.y;
        _magTo.set(b.x - camP.x, by - camP.y, b.z - camP.z);
        const d = _magTo.length();
        if (d < 2.5 || d > 85) continue;
        const c = _magTo.dot(_magDir) / d;
        if (c > bestCos) { bestCos = c; bestPos = _lzMid.set(b.x, by, b.z); bestKind = "balloon"; }
      }
    }
    if (bestPos) {
      this.aim.copy(bestPos);
      this.aimOn = bestKind;
    }
  };

  // Upgrade Claude's SnowGun land() so snowballs also pop balloons & trigger shootTargets + hitmarker + 3D popups!
  const origLand = gun.land.bind(gun);
  gun.land = function (shot, hit) {
    if (hit && hit.kind === "balloon" && hit.ref && !hit.ref.got) {
      const b = hit.ref;
      b.got = true;
      b.pop = 0;
      game.heli.popped++;
      const l = game.heli.popped, c = game.heli.balloons.length;
      game.logic.count("balloons", l, c);
      if (l >= c) { game.logic.complete("balloons"); game.ui.toast("八个礼物气球全被击落啦！雪境神枪手！", 6); }
      else game.ui.toast(`击落礼物气球！（${l} / ${c}）`, 3.2);
      gun.registerHit(true, "🎈 击落礼物气球", shot.p);
      game.puffs.burst(shot.p, 16, 2.2, 0.14, 0.5, 0.8);
      game.sparks && game.sparks.spawn(shot.p.x, shot.p.y, shot.p.z, 0, 0, 0, 0.7, 0.95, 0.16, 3.6, 2.6, 1.4, 0, 0);
      gun.landed++;
      return;
    }
    if (hit && hit.kind === "shootTarget" && hit.ref) {
      const res = hit.ref.onHit({ pos: shot.p.clone(), dir: shot.d.clone(), weapon: "snow", element: null, heavy: false });
      gun.registerHit(!!(res && res.crit), (res && res.label) || "✦ 命中目标", shot.p);
      game.puffs.burst(shot.p, 10, 1.5, 0.10, 0.35, 0.6);
      gun.landed++;
      return;
    }
    const prevHitT = this.hitT;
    origLand(shot, hit);
    if (hit && (hit.kind === "friend" || hit.kind === "folk" || hit.kind === "pet" || hit.kind === "thing")) {
      const isCrit = hit.kind === "thing" && hit.ref && hit.ref.target;
      if (this.hitT >= prevHitT) {
        gun.registerHit(isCrit, isCrit ? "🎯 靶心命中" : "", shot.p);
      }
    }
  };

  const DRAW_TIME = 0.68;      // Seconds to reach 100% draw
  const FULL_THRESHOLD = 0.85; // Full-draw piercing threshold
  const ARROW_POOL = 18;
  const BOW_COOL = 0.24;

  // Bow state cleanly isolated from Claude's snow-cannon ammo/pack state
  const bow = gun.bow = {
    drawing: false,
    drawT: 0,      // 0..1 normalized draw tension
    full: false,
    cool: 0,
    justLoosed: 0, // Prevents duplicate click fire right after mouseup release
    shotIdx: 0,
    arrows: []
  };

  // Build reusable 3D sculpted Starlight Arrow geometry & materials!
  const matShaft = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.96, 0.92, 1.0),
    emissive: new T.Color(0.45, 0.72, 1.0),
    emissiveIntensity: 0.75,
    roughness: 0.16,
    metalness: 0.35
  }));
  const matCyan = wrap(new T.MeshStandardMaterial({
    color: new T.Color(0.45, 0.96, 1.0),
    emissive: new T.Color(0.24, 0.90, 1.0),
    emissiveIntensity: 1.9,
    roughness: 0.08
  }));
  const matPink = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.56, 0.90),
    emissive: new T.Color(0.96, 0.36, 0.86),
    emissiveIntensity: 1.9,
    roughness: 0.08
  }));
  const matGold = wrap(new T.MeshStandardMaterial({
    color: new T.Color(1.0, 0.86, 0.44),
    emissive: new T.Color(0.95, 0.65, 0.16),
    emissiveIntensity: 1.35,
    roughness: 0.14,
    metalness: 0.85
  }));

  const shaftGeo = new T.CylinderGeometry(0.011, 0.011, 0.72, 8).rotateX(Math.PI / 2);
  const headGeo = new T.ConeGeometry(0.042, 0.16, 4).rotateX(Math.PI / 2);
  const fletchGeo = new T.PlaneGeometry(0.068, 0.17);
  const flareGeo = new T.TorusGeometry(0.052, 0.008, 6, 16);

  function createArrowMesh(isPink) {
    const g = new T.Group();
    const tipMat = isPink ? matPink : matCyan;
    const subMat = isPink ? matCyan : matPink;
    const shaft = new T.Mesh(shaftGeo, matShaft);
    const head = new T.Mesh(headGeo, tipMat);
    head.position.z = 0.40;
    const collar = new T.Mesh(flareGeo, matGold);
    collar.position.z = 0.30;

    // 3 feathered aurora fletchings at the arrow tail (-Z)
    for (let i = 0; i < 3; i++) {
      const f = new T.Mesh(fletchGeo, i === 0 ? subMat : tipMat);
      f.material = f.material.clone();
      f.material.side = T.DoubleSide;
      const a = (i / 3) * Math.PI * 2;
      f.position.set(Math.cos(a) * 0.024, Math.sin(a) * 0.024, -0.27);
      f.rotation.set(Math.PI / 2, a, 0);
      g.add(f);
    }

    // Glowing star-orb beacon on the arrowhead (scales up on full draw!)
    const glow = new T.Mesh(new T.OctahedronGeometry(0.055, 0), matGold);
    glow.position.z = 0.42;
    glow.visible = false;

    for (const m of [shaft, head, collar, glow]) {
      m.castShadow = false;
      m.frustumCulled = false;
      g.add(m);
    }
    g.visible = false;
    game.scene.add(g);
    return { g, glow, head, tipMat };
  }

  for (let i = 0; i < ARROW_POOL; i++) {
    const built = createArrowMesh(!!(i & 1));
    bow.arrows.push({
      g: built.g,
      glow: built.glow,
      pink: !!(i & 1),
      state: "idle", // "idle" | "fly" | "stuck"
      pos: new T.Vector3(),
      vel: new T.Vector3(),
      grav: 9.8,
      charge: 0,
      full: false,
      gone: 0,
      life: 0,
      free: 0,
      trail: 0,
      tremble: 0,
      baseQuat: new T.Quaternion()
    });
  }

  // Reusable scratch vectors
  const _dir = new T.Vector3();
  const _p = new T.Vector3();
  const _m = new T.Vector3();
  const _u = new T.Vector3();
  const _w = new T.Vector3();
  const _stepV = new T.Vector3();
  const _q = new T.Quaternion();
  const _e = new T.Euler();

  // Hold-to-draw on canvas mousedown (works both pointer-locked and unlocked!)
  const dom = game.renderer.domElement;
  dom.addEventListener("mousedown", (ev) => {
    if (ev.button === 0 && gun.isGemini && gun.active && bow.cool <= 0 && !bow.drawing) {
      beginDraw();
    }
  });

  function beginDraw() {
    if (!gun.isGemini || !gun.active || bow.cool > 0 || bow.drawing) return false;
    bow.drawing = true;
    bow.drawT = 0;
    bow.full = false;
    tools.aimT = 0.85;
    if (game.character && game.character.emote) game.character.stop(0.08);
    if (game.audio.bowDrawStart) game.audio.bowDrawStart();
    return true;
  }

  function releaseArrow(forcedCharge = null) {
    const charge = forcedCharge !== null ? forcedCharge : Math.max(0.24, Math.min(1, bow.drawT));
    const isFull = charge >= FULL_THRESHOLD;
    bow.drawing = false;
    bow.drawT = 0;
    bow.full = false;
    bow.cool = BOW_COOL;
    bow.justLoosed = 0.16;

    const player = game.player;
    tools.aimT = 0.9;
    tools.kick = 0.65 + 0.55 * charge;
    tools.aimView = true;
    if (game.character && game.character.emote) game.character.stop(0.08);

    gun.sightLine();
    const muzzle = gun.muzzle(_m);
    const camDir = player.cam.getWorldDirection(_dir);
    const toAim = _p.copy(gun.aim).sub(muzzle);
    let dist = toAim.length();
    // In Front Showcase Mode (KeyC), fire cleanly along Gemini's facing direction instead of back at the camera!
    if (player.frontLock && game.character) {
      const cy = game.character.yaw;
      toAim.set(-Math.sin(cy), 0.05, -Math.cos(cy)).normalize();
      dist = 24;
    } else if (dist < 1.6 || toAim.dot(camDir) < dist * 0.25) {
      toAim.copy(camDir);
    } else {
      toAim.multiplyScalar(1 / dist);
    }

    // Slight upward ballistic lob compensation so aimed shots feel super intuitive at mid-range!
    const speed = 28 + charge * 40; // 28 m/s quick -> 68 m/s full draw!
    const grav = 13.8 - charge * 10.6; // 13.8 arched -> 3.2 blazing laser-flat!
    const compDist = Math.min(dist, isFull ? 45 : 22);
    const lob = (0.5 * grav * compDist) / (speed * speed);
    toAim.y += Math.min(0.22, lob);
    toAim.normalize();

    // Very tiny scatter on quick shots, pinpoint laser accuracy on full draw!
    const scatter = isFull ? 0.001 : 0.008 * (1 - charge * 0.75);
    if (scatter > 0.001) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.tan(scatter) * Math.sqrt(Math.random());
      _u.crossVectors(toAim, UP);
      if (_u.lengthSq() < 1e-4) _u.set(1, 0, 0);
      _u.normalize();
      _w.crossVectors(_u, toAim);
      toAim.addScaledVector(_u, Math.cos(a) * r).addScaledVector(_w, Math.sin(a) * r).normalize();
    }

    // Allocate an arrow from pool (prefer idle, else oldest stuck, else oldest flying)
    let ar = bow.arrows.find((x) => x.state === "idle")
      || bow.arrows.find((x) => x.state === "stuck")
      || bow.arrows[0];

    ar.state = "fly";
    ar.pink = !!(bow.shotIdx++ & 1);
    ar.pos.copy(muzzle);
    ar.vel.copy(toAim).multiplyScalar(speed);
    ar.grav = grav;
    ar.charge = charge;
    ar.full = isFull;
    ar.gone = 0;
    ar.life = 4.5;
    ar.trail = 0;
    ar.free = 0;

    // Avoid clipping thin player-adjacent walls right in front of muzzle
    for (let m = 0.2; m < 2.2; m += 0.2) {
      const hit = gun.probe(_stepV.copy(muzzle).addScaledVector(toAim, m));
      if (hit) {
        if (hit.kind === "wall" && m < dist - 0.6) ar.free = 2.4;
        break;
      }
    }

    ar.g.visible = true;
    ar.g.position.copy(muzzle);
    ar.g.quaternion.setFromUnitVectors(FWD, _stepV.copy(ar.vel).normalize());
    ar.g.scale.setScalar(isFull ? 1.24 : 0.94 + charge * 0.18);
    ar.glow.visible = isFull;
    gun.fired++;

    // Bowstring release starlight sparkle burst at muzzle!
    const burstN = isFull ? 12 : 6;
    for (let k = 0; k < burstN; k++) {
      const pk = isFull ? (k % 2 === 1) : ar.pink;
      const sp = (isFull ? 3.5 : 1.8) + Math.random() * 4.5;
      game.puffs.spawn(
        muzzle.x, muzzle.y, muzzle.z,
        toAim.x * sp + (Math.random() - 0.5) * 1.6,
        toAim.y * sp + (Math.random() - 0.5) * 1.4,
        toAim.z * sp + (Math.random() - 0.5) * 1.6,
        0.05 + Math.random() * 0.05, 0.78, 0.22 + Math.random() * 0.16,
        pk ? 1 : 0.24, pk ? 0.44 : 0.90, pk ? 0.90 : 1, 0.5, 4
      );
    }
    game.sparks.spawn(
      muzzle.x, muzzle.y, muzzle.z, 0, 0, 0,
      isFull ? 0.52 : 0.30, 1, 0.10,
      isFull ? 3.2 : (ar.pink ? 3.0 : 0.9),
      isFull ? 2.4 : (ar.pink ? 1.2 : 2.6),
      isFull ? 3.6 : (ar.pink ? 2.8 : 3.5), 0, 0
    );

    if (game.audio.bowRelease) game.audio.bowRelease(charge);
    else if (game.audio.gunShot) game.audio.gunShot();
    gun.kickCamera(0.010 + charge * 0.016, 0.004, 0.012 + charge * 0.018, isFull ? 0xffe46b : (ar.pink ? 0xff7ae0 : 0x52f2ff), muzzle);
    return true;
  }

  function onArrowHit(ar, hit) {
    const pos = ar.pos;
    const dir = _dir.copy(ar.vel).normalize();
    const kind = hit.kind;
    const ref = hit.ref;
    const player = game.player;
    let confirm = 0;

    if (kind === "ground") {
      pos.y = game.world.groundAt(pos.x, pos.z) + 0.03;
      const surf = game.world.surfaceAt(pos.x, pos.z);
      if (surf !== "water") gun.dent(pos, surf === "snow");
      if (game.animals) game.animals.startle(pos.x, pos.z, ar.full ? 2.6 : 1.5, 0.45);
    } else if (kind === "friend") {
      game.friends.hit(ref, "ball", dir.x, dir.z);
      confirm = 1;
    } else if (kind === "folk") {
      game.folk.hit(ref, ar.full ? "kick" : "ball", dir.x, dir.z);
      confirm = 1;
    } else if (kind === "pet") {
      game.pets.ballHit(pos, _stepV.copy(dir).multiplyScalar(ar.full ? 34 : 26));
      confirm = 1;
    } else if (kind === "balloon" && ref && !ref.got) {
      ref.got = true;
      ref.pop = 0;
      game.heli.popped++;
      const l = game.heli.popped, c = game.heli.balloons.length;
      game.logic.count("balloons", l, c);
      if (l >= c) { game.logic.complete("balloons"); game.ui.toast("八个礼物气球都射收齐啦！神箭猫猫！", 6); }
      else game.ui.toast(`一箭射落礼物气球！（${l} / ${c}）`, 3.5);
      confirm = 2;
    } else if (kind === "shootTarget" && ref) {
      const res = ref.onHit({ pos: pos.clone(), dir: dir.clone(), weapon: "bow", element: null, heavy: ar.full });
      confirm = (res && res.crit) || ar.full ? 2 : 1;
      ar._hitLabel = (res && res.label) || "🏹 箭矢命中";
    } else if (kind === "thing") {
      confirm = ref && ref.target ? 2 : 1;
      game.explore.ballHit(pos);
    } else if (kind === "tree") {
      if (game.time - (ref.shotT || 0) > 0.6) {
        ref.shotT = game.time;
        player.dumpSnow(ref, pos.x, pos.y, pos.z, ar.full ? 70 : 40);
      }
    }

    // Full-Draw Starlight Arrow Constellation Burst AoE! (Unique to fully-drawn arrows!)
    if (ar.full) {
      if (tools.sword && tools.sword.bloom) {
        tools.sword.bloom(pos.x, pos.y + 0.08, pos.z, 0.25, 1.85, 0.42, kind === "ground");
      }
      if (game.folk) {
        for (const f of game.folk.around(pos.x, pos.z, 2.1)) {
          const d = f.clawd || f.snowman;
          if (d) game.folk.hit(f, "ball", d.x - pos.x, d.z - pos.z);
        }
      }
      if (game.pets) game.pets.shock(pos.x, pos.z, 2.0);
    }

    // Impact starlight confetti particles + expanding ring
    const pCount = ar.full ? 22 : 12;
    for (let k = 0; k < pCount; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (ar.full ? 1.8 : 0.9) + Math.random() * (ar.full ? 3.4 : 2.0);
      const pk = k % 2 === 1;
      game.puffs.spawn(
        pos.x, pos.y, pos.z,
        Math.cos(a) * sp - dir.x * 0.7,
        0.7 + Math.random() * (ar.full ? 2.8 : 1.7),
        Math.sin(a) * sp - dir.z * 0.7,
        0.07 + Math.random() * 0.10, 0.85, 0.35 + Math.random() * 0.35,
        pk ? 1 : 0.22, pk ? 0.44 : 0.90, pk ? 0.90 : 1, 3.8, 1.5
      );
    }
    const ring = gun.rings[gun.ringNext];
    gun.ringNext = (gun.ringNext + 1) % gun.rings.length;
    ring.m.position.copy(pos).addScaledVector(dir, -0.10);
    if (kind === "ground") ring.m.position.y += 0.14;
    ring.m.material.color.setRGB(
      ar.full ? 1.25 : (ar.pink ? 1.15 : 0.22),
      ar.full ? 0.95 : (ar.pink ? 0.38 : 0.92),
      ar.full ? 1.35 : (ar.pink ? 0.94 : 1.20)
    );
    ring.m.visible = true;
    ring.t = 0;

    game.sparks.spawn(
      pos.x, pos.y, pos.z, 0, 0, 0,
      ar.full ? 0.72 : 0.44, 0.95, 0.14,
      ar.full ? 3.4 : (ar.pink ? 3.1 : 0.9),
      ar.full ? 2.5 : (ar.pink ? 1.2 : 2.6),
      ar.full ? 3.8 : (ar.pink ? 2.8 : 3.5), 0, 0
    );

    const distGain = Math.min(1, 16 / (4 + pos.distanceTo(player.cam.position)));
    if (ar.full && game.audio.bowArrowBurst) game.audio.bowArrowBurst(distGain);
    else if (game.audio.bowArrowStick) game.audio.bowArrowStick(distGain, kind === "wall" || kind === "trunk");
    else if (game.audio.gunSplat) game.audio.gunSplat(distGain, kind === "wall" || kind === "trunk");

    if (confirm) {
      const lbl = kind === "balloon" ? "🎈 一箭穿云" : (ar._hitLabel || (confirm > 1 ? "✦ 满弦贯穿" : ""));
      ar._hitLabel = "";
      gun.registerHit(confirm > 1 || ar.full, lbl, pos);
    }

    // Stick the glowing 3D arrow upright into solid surfaces (snow, ground, walls, tree trunks)!
    const canStick = kind === "ground" || kind === "wall" || kind === "trunk";
    if (canStick && game.world.surfaceAt(pos.x, pos.z) !== "water") {
      ar.state = "stuck";
      ar.life = 5.5;
      ar.tremble = 1.0;
      ar.g.position.copy(pos).addScaledVector(dir, -0.14);
      ar.baseQuat.setFromUnitVectors(FWD, dir);
      ar.g.quaternion.copy(ar.baseQuat);
      ar.glow.visible = ar.full;
    } else {
      ar.state = "idle";
      ar.g.visible = false;
    }

    gun.landed++;
    gun.lastHit = kind;
  }

  function updateArrows(dt) {
    for (const ar of bow.arrows) {
      if (ar.state === "idle") continue;

      if (ar.state === "stuck") {
        ar.life -= dt;
        if (ar.tremble > 0.005) {
          ar.tremble *= Math.exp(-9 * dt);
          const wob = Math.sin(game.time * 58) * 0.14 * ar.tremble;
          ar.g.quaternion.copy(ar.baseQuat).multiply(_q.setFromEuler(_e.set(wob, wob * 0.6, 0)));
        }
        if (ar.life < 0.7) {
          ar.g.scale.setScalar(Math.max(0.01, ar.life / 0.7));
        }
        if (ar.life <= 0) {
          // Dissolve stuck arrow gracefully into starlight motes!
          game.puffs.spawn(
            ar.g.position.x, ar.g.position.y, ar.g.position.z,
            0, 0.5, 0, 0.08, 0.85, 0.45,
            ar.pink ? 1 : 0.25, ar.pink ? 0.5 : 0.92, ar.pink ? 0.92 : 1, -0.1, 0.8
          );
          ar.state = "idle";
          ar.g.visible = false;
        }
        continue;
      }

      // Flying ballistic arrow! Integrate gravity & step small sub-segments for accurate hits
      ar.life -= dt;
      ar.vel.y -= ar.grav * dt;
      const stepDist = ar.vel.length() * dt;
      const dir = _dir.copy(ar.vel).normalize();
      let left = stepDist;
      let hit = null;

      while (left > 1e-4 && !hit) {
        const seg = Math.min(0.28, left);
        ar.pos.addScaledVector(dir, seg);
        left -= seg;
        ar.gone += seg;
        ar.trail += seg;

        // Luminous starlight comet ribbon particles along the curving arc!
        if (ar.trail > (ar.full ? 0.42 : 0.75)) {
          ar.trail = 0;
          const pk = ar.full ? (Math.random() > 0.5) : ar.pink;
          game.puffs.spawn(
            ar.pos.x, ar.pos.y, ar.pos.z,
            (Math.random() - 0.5) * 0.25, 0.05 + Math.random() * 0.22, (Math.random() - 0.5) * 0.25,
            ar.full ? 0.095 : 0.068, 0.82, ar.full ? 0.48 : 0.34,
            pk ? 1 : 0.24, pk ? 0.44 : 0.90, pk ? 0.90 : 1, 0.2, 1.8
          );
        }

        // Also check airborne gift balloons along arrow flight so bow archers can snipe balloons!
        if (game.heli && game.heli.balloons) {
          for (const b of game.heli.balloons) {
            if (b.got) continue;
            const by = b.grp ? b.grp.position.y : b.y;
            if (Math.hypot(ar.pos.x - b.x, ar.pos.y - by, ar.pos.z - b.z) < 1.55) {
              hit = { kind: "balloon", ref: b };
              break;
            }
          }
        }

        if (!hit) {
          hit = gun.probe(ar.pos);
          if (hit && hit.kind === "wall" && ar.gone < ar.free) hit = null;
        }
      }

      if (hit) {
        onArrowHit(ar, hit);
      } else if (ar.life <= 0 || ar.gone > 95) {
        ar.state = "idle";
        ar.g.visible = false;
      } else {
        ar.g.position.copy(ar.pos);
        ar.g.quaternion.setFromUnitVectors(FWD, dir);
      }
    }
  }

  // Wrap gun.fire, gun.update, gun.updateSight, gun.setStyle so Claude stays pure Snow Cannon
  // and Gemini uses 100% pure Draw-and-Release Ballistic Bow!
  const origFire = gun.fire.bind(gun);
  const origUpdate = gun.update.bind(gun);
  const origSetStyle = gun.setStyle.bind(gun);

  gun.setStyle = function (avatar) {
    origSetStyle(avatar);
    bow.drawing = false;
    bow.drawT = 0;
    bow.full = false;
    if (this.ui && this.ui.el) {
      this.ui.el.classList.toggle("bow", this.isGemini);
      this.ui.el.classList.remove("full");
      this.ui.text = "";
      this.ui.frac = -1;
      this.ui.gap = -1;
    }
  };

  gun.fire = function () {
    if (!this.isGemini) {
      const fired = origFire();
      if (fired && this.cool > 0.05) {
        const mz = this.muzzle(_m);
        gun.kickCamera(0.015, 0.006, 0.016, 0x8ad8ff, mz);
        if (gun.overdriveT > 0) this.cool *= 0.62;
      }
      return fired;
    }
    if (!this.active) return false;
    if (bow.cool > 0 || bow.justLoosed > 0) return true;
    if (bow.drawing) return true;
    const holding = game.player.keys.has("KeyJ") || this.btnL;
    if (holding) return beginDraw();
    // Unlocked single click -> snappy nimble quick-draw arrow!
    return releaseArrow(0.32);
  };

  gun.update = function (dt) {
    // 1. Update silky spring-damped camera recoil, muzzle flash light & combo HUD!
    const kSpring = 135, damp = 17;
    recoil.vp += (-kSpring * recoil.p - damp * recoil.vp) * dt;
    recoil.p += recoil.vp * dt;
    recoil.vy += (-kSpring * recoil.y - damp * recoil.vy) * dt;
    recoil.y += recoil.vy * dt;
    if (Math.abs(recoil.p) < 1e-4 && Math.abs(recoil.vp) < 1e-4) { recoil.p = 0; recoil.vp = 0; }
    if (Math.abs(recoil.y) < 1e-4 && Math.abs(recoil.vy) < 1e-4) { recoil.y = 0; recoil.vy = 0; }
    if (recoil.fov > 0) recoil.fov = Math.max(0, recoil.fov - dt * 0.24);
    if (muzzleLightT > 0) {
      muzzleLightT -= dt;
      muzzleLight.intensity = Math.max(0, 6.5 * (muzzleLightT / 0.075));
      if (muzzleLightT <= 0) muzzleLight.visible = false;
    }
    if (gun.overdriveT > 0) gun.overdriveT = Math.max(0, gun.overdriveT - dt);
    if (gun.comboT > 0) {
      gun.comboT -= dt;
      if (gun.comboT <= 0) gun.combo = 0;
    }
    if (gun.comboShowT > 0) {
      gun.comboShowT -= dt;
      if (gun.comboShowT <= 0 && comboEl) comboEl.classList.remove("show");
    }

    // Update Floating 3D World-Space Hit/Score Popups
    for (const p of popups) {
      if (!p.on) continue;
      p.t += dt;
      const u = p.t / p.dur;
      if (u >= 1) { p.on = false; p.sp.visible = false; continue; }
      p.sp.position.y += p.vy * (1 - u * 0.65) * dt;
      p.mat.opacity = u < 0.2 ? u / 0.2 : Math.max(0, 1 - (u - 0.35) / 0.65);
    }

    // Update 3D Holographic Laser Sight & Aim Dot (visible ONLY when gun is raised to aim / ADS!)
    const isGunLive = this.chemActive || (this.active && !this.isGemini);
    const isHot = !!({ friend: 1, folk: 1, pet: 1, thing: 1, balloon: 1, shootTarget: 1 }[this.aimOn]);
    const gunRaised = (tools.level || 0) > 0.48;
    const showLaser = isGunLive && !game.player.frontLock && gunRaised && (this.ads > 0.14 || isHot);
    if (showLaser) {
      if (this.chemActive && tools.items.chemgun && tools.items.chemgun.muzzleSpin && tools.items.chemgun.root.visible) {
        tools.items.chemgun.muzzleSpin.getWorldPosition(_lzStart);
      } else {
        this.muzzle(_lzStart);
      }
      _lzDir.subVectors(this.aim, _lzStart);
      const len = _lzDir.length();
      if (len > 0.6 && len < 82) {
        _lzMid.addVectors(_lzStart, this.aim).multiplyScalar(0.5);
        _lzDir.multiplyScalar(1 / len);
        laserBeam.position.copy(_lzMid);
        laserBeam.scale.set(1, len, 1);
        laserBeam.quaternion.setFromUnitVectors(UP, _lzDir);
        laserDot.position.copy(this.aim);
        const colHex = this.chemActive && tools._getChemSightState
          ? new T.Color(tools._getChemSightState().css).getHex()
          : (isHot ? 0xff9a3c : 0x62e8ff);
        laserMat.color.setHex(colHex);
        laserMat.opacity = (isHot ? 0.50 : 0.28) * Math.max(0.45, this.ads);
        laserDotMat.color.setHex(isHot ? 0xffe66b : colHex);
        laserDot.scale.setScalar(isHot ? 1.35 : 0.85);
        laserBeam.visible = true;
        laserDot.visible = true;
      } else {
        laserBeam.visible = false;
        laserDot.visible = false;
      }
    } else if (laserBeam.visible) {
      laserBeam.visible = false;
      laserDot.visible = false;
    }

    bow.cool = Math.max(0, bow.cool - dt);
    bow.justLoosed = Math.max(0, bow.justLoosed - dt);
    updateArrows(dt);

    // 2. UNIFIED 118 Og CHEMGUN SHOOTING & CROSSHAIR LOOP!
    if (this.chemActive) {
      const player = game.player;
      this.hitT -= dt;
      this.tick++;
      const wantAds = !player.frontLock && !!(player.aiming || player.aimLock || this.btnR);
      this.ads += ((wantAds ? 1 : 0) - this.ads) * (1 - Math.exp(-14 * dt));
      this.out += (1 - this.out) * (1 - Math.exp(-10 * dt));
      if (this.ads < 0.002) this.ads = 0;
      player.ads = this.ads;
      player.gunK = this.out;

      const moving = Math.min(1, player.speed / 3.9);
      const baseSpread = 0.010 + 0.006 * moving + (tools.kick || 0) * 0.012;
      this.spread = baseSpread * (1 - this.ads * 0.72);

      if ((this.treeT -= dt) < 0) {
        this.treeT = 0.5;
        const px = player.pos.x, pz = player.pos.z, rad = 82;
        this.trees = game.forest.trees.filter((m) => m.near && Math.abs(m.x - px) < rad && Math.abs(m.z - pz) < rad);
      }
      if (this.tick & 1) this.sightLine();

      // Continuous hold-to-fire support (J, ADS+LMB, or Pointer-Lock LMB — never misfires on unlocked camera drag!)
      const holdingFire = player.keys.has("KeyJ") || (this.btnL && (this.btnR || document.pointerLockElement === dom));
      if (holdingFire && tools._useChemGun) {
        tools._useChemGun();
      }

      this.updateShots(dt);
      this.updateDents(dt);
      updateChemSight();
      return;
    } else if (this.ui && this.ui.el && this.ui.el.classList.contains("chemgun")) {
      this.ui.el.classList.remove("chemgun", "og-ready");
      this.ui.text = "";
      this.ui.frac = -1;
      this.ui.gap = -1;
    }

    if (!this.isGemini) {
      if (bow.drawing) { bow.drawing = false; bow.drawT = 0; bow.full = false; }
      if (tools.bowPose) { tools.bowPose.on = false; tools.bowPose.aim = 0; tools.bowPose.draw = 0; tools.bowPose.loose = 0; }
      return origUpdate(dt);
    }

    // === GEMINI TRUE BOW LOOP (NO snow-gun rapid fire, NO magazine reload!) ===
    const player = game.player;
    const active = this.active;
    this.cool = Math.max(0, this.cool - dt);
    this.rest += dt;
    this.hitT -= dt;
    this.dry -= dt;
    this.tick++;
    this.pack = 0; // Bows never reload snow tanks!

    const holding = active && (player.keys.has("KeyJ") || this.btnL);
    if (active && holding && !bow.drawing && bow.cool <= 0) {
      beginDraw();
    }

    if (bow.drawing) {
      if (!active) {
        bow.drawing = false;
        bow.drawT = 0;
        bow.full = false;
      } else if (holding) {
        bow.drawT = Math.min(1, bow.drawT + dt / DRAW_TIME);
        tools.aimT = 0.85;
        if (!bow.full && bow.drawT >= FULL_THRESHOLD) {
          bow.full = true;
          if (game.audio.bowFull) game.audio.bowFull();
          // Golden-cyan full-draw flash right on the bow!
          const mz = this.muzzle(_m);
          game.sparks.spawn(mz.x, mz.y, mz.z, 0, 0, 0, 0.36, 1, 0.12, 3.2, 2.5, 3.6, 0, 0);
        }
      } else {
        // Released! Loose the charged arrow!
        releaseArrow();
      }
    }

    // Smooth ADS zoom (skip tight zoom when in C-key Front Showcase Mode so you get a steady full-body front view!)
    const manualAds = !!(player.aiming || player.aimLock || this.btnR);
    const wantAds = active && !player.frontLock && (manualAds || (bow.drawing && bow.drawT > 0.18));
    const adsTarget = manualAds ? 1 : (bow.drawing ? Math.min(0.45, bow.drawT * 0.50) : 0);
    this.ads += ((wantAds ? adsTarget : 0) - this.ads) * (1 - Math.exp(-12 * dt));
    this.out += ((active ? 1 : 0) - this.out) * (1 - Math.exp(-9 * dt));
    if (this.ads < 0.002) this.ads = 0;
    if (this.out < 0.002) this.out = 0;
    player.ads = this.ads;
    player.gunK = this.out;

    // Expose live two-handed archery pose state for Zu.update() & Ed.place()!
    const bowAim = active ? Math.max(this.ads, bow.drawing ? 1 : (tools.aimT > 0.05 ? Math.min(1, tools.aimT / 0.25) : 0)) : 0;
    if (!tools.bowPose) tools.bowPose = { on: false, aim: 0, draw: 0, loose: 0 };
    tools.bowPose.on = active;
    tools.bowPose.aim += (bowAim - tools.bowPose.aim) * (1 - Math.exp(-16 * dt));
    const drawTarget = bow.drawing ? bow.drawT : 0;
    tools.bowPose.draw += (drawTarget - tools.bowPose.draw) * (1 - Math.exp(-(bow.drawing ? 18 : 26) * dt));
    tools.bowPose.loose = Math.max(0, Math.min(1, bow.justLoosed / 0.16));

    // Crosshair tightens dynamically as bowstring draws taut!
    this.spread = Math.max(0.0015, 0.024 * (1 - bow.drawT * 0.88) * (1 - this.ads * 0.35));

    if ((this.treeT -= dt) < 0 && (active || bow.arrows.some((a) => a.state === "fly"))) {
      this.treeT = 0.5;
      const px = player.pos.x, pz = player.pos.z, rad = 82;
      this.trees = game.forest.trees.filter((m) => m.near && Math.abs(m.x - px) < rad && Math.abs(m.z - pz) < rad);
    }

    if (active && (this.tick & 1)) this.sightLine();
    this.updateShots(dt);
    this.updateDents(dt);
    updateBowSight(active);
  };

  function updateBowSight(active) {
    const ui = gun.ui;
    if (!ui || !ui.el) return;
    if (active !== ui.on) {
      ui.on = active;
      ui.el.classList.toggle("on", active);
      document.body.classList.toggle("gunning", active);
    }
    ui.el.classList.add("bow");
    if (!active) return;

    const hot = !!({ friend: 1, folk: 1, pet: 1, thing: 1, balloon: 1, shootTarget: 1 }[gun.aimOn]);
    if (hot !== ui.hot) {
      ui.hot = hot;
      ui.el.classList.toggle("hot", hot);
    }

    // Crosshair arms smoothly contract inward as you draw the bowstring!
    const gap = Math.round(Math.max(4, 24 - bow.drawT * 19 + tools.kick * 6));
    if (gap !== ui.gap) {
      ui.gap = gap;
      const [a0, a1, a2, a3] = ui.arms;
      a0.style.top = -gap - 11 + "px";
      a1.style.top = gap + "px";
      a2.style.left = -gap - 11 + "px";
      a3.style.left = gap + "px";
    }

    const hitOn = gun.hitT > 0;
    if (hitOn || ui.hitOn) {
      ui.hitOn = hitOn;
      const k = Math.max(0, Math.min(1, gun.hitT / 0.28));
      ui.hit.style.opacity = hitOn ? Math.min(1, k * 2.2).toFixed(2) : "0";
      ui.hit.style.transform = `scale(${(gun.hitBig ? 1.3 : 1) * (1 + 0.45 * k)})`;
    }

    // Tension arc fills 0 -> 100% as you draw, pulses gold-pink when full!
    const frac = Math.round((bow.drawing ? Math.max(0.08, bow.drawT) : 0.0) * 48) / 48;
    ui.el.classList.toggle("full", bow.full);
    ui.el.classList.toggle("packing", bow.drawing && !bow.full);
    if (frac !== ui.frac) {
      ui.frac = frac;
      ui.fg.setAttribute("stroke-dasharray", `${(frac * 59.7).toFixed(1)} 400`);
    }

    const txt = bow.full ? "满弦✦" : bow.drawing ? `${Math.round(bow.drawT * 100)}%` : "拉弓";
    if (txt !== ui.text) {
      ui.text = txt;
      ui.label.textContent = txt;
    }
  }

  function updateChemSight() {
    const ui = gun.ui;
    if (!ui || !ui.el) return;
    if (!ui.on) {
      ui.on = true;
      ui.el.classList.add("on");
      document.body.classList.add("gunning");
    }
    ui.el.classList.remove("bow", "full", "packing");
    ui.el.classList.add("chemgun");

    const info = tools._getChemSightState ? tools._getChemSightState() : { css: "#4cf4ff", label: "1 H", chargeFrac: 0.2, ogReady: false };
    ui.el.style.setProperty("--chem-col", info.css);
    ui.el.classList.toggle("og-ready", !!info.ogReady);

    const hot = !!({ friend: 1, folk: 1, pet: 1, thing: 1, balloon: 1, shootTarget: 1 }[gun.aimOn]);
    if (hot !== ui.hot) {
      ui.hot = hot;
      ui.el.classList.toggle("hot", hot);
    }

    const gap = Math.round(Math.max(4, Math.min(34, 15 - gun.ads * 9 + (tools.kick || 0) * 10)));
    if (gap !== ui.gap) {
      ui.gap = gap;
      const [a0, a1, a2, a3] = ui.arms;
      a0.style.top = -gap - 11 + "px";
      a1.style.top = gap + "px";
      a2.style.left = -gap - 11 + "px";
      a3.style.left = gap + "px";
    }

    const hitOn = gun.hitT > 0;
    if (hitOn || ui.hitOn) {
      ui.hitOn = hitOn;
      const k = Math.max(0, Math.min(1, gun.hitT / 0.30));
      ui.hit.style.opacity = hitOn ? Math.min(1, k * 2.4).toFixed(2) : "0";
      ui.hit.style.transform = `scale(${(gun.hitBig ? 1.34 : 1.04) * (1 + 0.45 * k)})`;
    }

    const frac = Math.round(Math.max(0.08, Math.min(1, info.chargeFrac)) * 48) / 48;
    if (frac !== ui.frac) {
      ui.frac = frac;
      ui.fg.setAttribute("stroke-dasharray", `${(frac * 59.7).toFixed(1)} 400`);
    }
    if (info.label !== ui.text) {
      ui.text = info.label;
      ui.label.textContent = info.label;
    }
  }

  return gun;
}
