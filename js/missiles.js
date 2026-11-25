// 战斗机双翼挂架追踪导弹系统 (Claude 橙花直升机「穿云礼花飞弹」 & Gemini 幻翼星云飞猫「双子星陨飞弹」)
// 飞行状态彻底取代丢雪球：自动雷达目标锁定 HUD + 单发交替追踪飞弹 (左键 / J / 右键) + 四连弧线齐射 (F) + 3D 星辉烟花空爆！

export class SkyMissileSystem {
  constructor(game, helpers) {
    this.game = game;
    this.THREE = game.THREE;
    this.wrapMat = helpers && helpers.mat ? helpers.mat : (m) => m;

    this.root = null;
    this.claudePods = null;
    this.geminiPods = null;
    this.podSlots = { claude: [], gemini: [] };
    this.podRecoil = [0, 0, 0, 0];

    this.missiles = [];
    this.blasts = [];
    this.pendingSalvo = [];

    this.nextSide = -1;
    this.singleCd = 0;
    this.salvoCd = 0;
    this.salvoCooldownMax = 1.65;
    this.firedCount = 0;
    this.hitsCount = 0;

    this.locked = null;
    this.multiLocked = [];
    this.lastLockKey = "";
    this.wasDriven = false;
    this.scanTimer = 0;

    // HUD DOM elements
    this.hudEl = null;
    this.lockEl = null;
    this.lockLabelEl = null;
    this.lockDistEl = null;
    this.subLocks = [];
    this.barNameEl = null;
    this.barCells = [];
    this.barStatusEl = null;

    // Reusable scratch vectors/quaternions (zero per-frame GC churn!)
    const T = this.THREE;
    this._v1 = new T.Vector3();
    this._v2 = new T.Vector3();
    this._v3 = new T.Vector3();
    this._v4 = new T.Vector3();
    this._fwd = new T.Vector3(0, 0, -1);
    this._up = new T.Vector3(0, 1, 0);
    this._q = new T.Quaternion();
  }

  _m(mat) {
    return this.wrapMat(mat, { key: "plain" });
  }

  _makeMissileVisual(isGem) {
    const T = this.THREE;
    const g = new T.Group();

    const bodyMat = this._m(new T.MeshStandardMaterial({
      color: isGem ? 0xf6f9ff : 0xe84836,
      roughness: 0.28,
      metalness: isGem ? 0.25 : 0.45
    }));
    const noseMat = this._m(new T.MeshStandardMaterial({
      color: isGem ? 0xff70c8 : 0xffd058,
      emissive: isGem ? 0xff46b5 : 0xff9a2e,
      emissiveIntensity: 0.72,
      roughness: 0.22,
      metalness: 0.4
    }));
    const stripeMat = this._m(new T.MeshStandardMaterial({
      color: isGem ? 0x58ddff : 0xfff3d4,
      emissive: isGem ? 0x26b8ff : 0xffc864,
      emissiveIntensity: 0.85,
      roughness: 0.25
    }));
    const finMat = this._m(new T.MeshStandardMaterial({
      color: isGem ? 0x72c8ff : 0x2a3140,
      emissive: isGem ? 0x2d86e8 : 0x000000,
      emissiveIntensity: isGem ? 0.35 : 0,
      roughness: 0.36,
      metalness: 0.48
    }));
    const nozzleMat = this._m(new T.MeshStandardMaterial({
      color: 0x383d4a,
      roughness: 0.4,
      metalness: 0.7
    }));

    // Missile points along -Z (standard forward axis matching heli.root)
    const body = new T.Mesh(new T.CylinderGeometry(0.068, 0.074, 0.78, 12), bodyMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);

    // Aerodynamic warhead nose cone pointing toward -Z
    const nose = new T.Mesh(new T.ConeGeometry(0.068, 0.28, 12), noseMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -0.53;
    g.add(nose);

    // Glowing collar band
    const band = new T.Mesh(new T.CylinderGeometry(0.074, 0.074, 0.08, 12), stripeMat);
    band.rotation.x = Math.PI / 2;
    band.position.z = -0.22;
    g.add(band);

    // 4 swept cruciform tail fins
    const finGeo = new T.BoxGeometry(0.24, 0.014, 0.16);
    for (let i = 0; i < 4; i++) {
      const fin = new T.Mesh(finGeo, finMat);
      fin.position.z = 0.28;
      fin.rotation.z = (i * Math.PI) / 2 + Math.PI / 4;
      g.add(fin);
    }

    if (isGem) {
      // Adorable tiny glowing pink cat-ear forward canards + star halo on Gemini's missiles!
      const earGeo = new T.ConeGeometry(0.036, 0.095, 4);
      const earL = new T.Mesh(earGeo, noseMat);
      earL.position.set(-0.055, 0.072, -0.24);
      earL.rotation.set(0.18, 0, 0.35);
      const earR = new T.Mesh(earGeo, noseMat);
      earR.position.set(0.055, 0.072, -0.24);
      earR.rotation.set(0.18, 0, -0.35);
      const halo = new T.Mesh(new T.TorusGeometry(0.115, 0.012, 6, 16), stripeMat);
      halo.position.z = 0.05;
      g.add(earL, earR, halo);
    }

    // Rear rocket thruster nozzle
    const nozzle = new T.Mesh(new T.CylinderGeometry(0.055, 0.072, 0.11, 10), nozzleMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.z = 0.43;
    g.add(nozzle);

    // Bright flickering rocket afterburner exhaust flame cone
    const flameOuter = new T.Mesh(
      new T.ConeGeometry(0.088, 0.56, 10),
      new T.MeshBasicMaterial({
        color: isGem ? 0x62e5ff : 0xff9a38,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
      })
    );
    flameOuter.rotation.x = Math.PI / 2;
    flameOuter.position.z = 0.74;

    const flameCore = new T.Mesh(
      new T.ConeGeometry(0.046, 0.38, 8),
      new T.MeshBasicMaterial({
        color: isGem ? 0xffe0ff : 0xfff8c8,
        transparent: true,
        opacity: 0.98,
        depthWrite: false
      })
    );
    flameCore.rotation.x = Math.PI / 2;
    flameCore.position.z = 0.65;

    const flameGrp = new T.Group();
    flameGrp.add(flameOuter, flameCore);
    g.add(flameGrp);
    g.userData.flame = flameGrp;
    return g;
  }

  _buildMountPods() {
    const T = this.THREE;
    const heli = this.game.heli;
    if (!heli || !heli.root) return;

    // 1) Claude Helicopter Twin Wing-Stub Rocket Pylons (crimson-gold & gunmetal tactical winter rails)
    const cPods = new T.Group();
    const strutMat = this._m(new T.MeshStandardMaterial({ color: 0x363d4c, roughness: 0.42, metalness: 0.62 }));
    const trimMat = this._m(new T.MeshStandardMaterial({ color: 0xe64b35, roughness: 0.32, metalness: 0.35 }));
    const goldMat = this._m(new T.MeshStandardMaterial({
      color: 0xffd262, emissive: 0xff9c24, emissiveIntensity: 0.45, roughness: 0.28, metalness: 0.55
    }));

    // 4 pod launch offsets (left-outer, right-outer, left-inner, right-inner)
    const claudeCoords = [
      [-1.16, 0.54, -0.26],
      [1.16, 0.54, -0.26],
      [-0.92, 0.50, -0.18],
      [0.92, 0.50, -0.18]
    ];

    for (const side of [-1, 1]) {
      const wingStub = new T.Mesh(new T.BoxGeometry(0.68, 0.085, 0.34), strutMat);
      wingStub.position.set(side * 0.92, 0.64, -0.22);
      wingStub.rotation.z = side * -0.09;
      cPods.add(wingStub);

      const podHousing = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.62, 12), trimMat);
      podHousing.rotation.x = Math.PI / 2;
      podHousing.position.set(side * 1.04, 0.54, -0.22);
      cPods.add(podHousing);

      const podRing = new T.Mesh(new T.TorusGeometry(0.162, 0.018, 6, 16), goldMat);
      podRing.position.set(side * 1.04, 0.54, -0.50);
      cPods.add(podRing);
    }

    claudeCoords.forEach(([x, y, z], idx) => {
      const dummy = this._makeMissileVisual(false);
      dummy.scale.setScalar(0.66);
      dummy.position.set(x, y, z - 0.12);
      dummy.userData.flame.visible = false;
      dummy.userData.baseZ = z - 0.12;
      cPods.add(dummy);
      this.podSlots.claude.push({ mesh: dummy, local: new T.Vector3(x, y, z - 0.35), side: idx % 2 === 0 ? -1 : 1 });
    });

    // 2) Gemini Sky-Cat Floating Aurora Starlight Missile Halos (elegant floating wing-side star-pods!)
    const gPods = new T.Group();
    const ringCyan = this._m(new T.MeshStandardMaterial({
      color: 0x74e4ff, emissive: 0x30bfff, emissiveIntensity: 0.95, roughness: 0.2
    }));
    const ringPink = this._m(new T.MeshStandardMaterial({
      color: 0xff8ad8, emissive: 0xff4cb8, emissiveIntensity: 0.9, roughness: 0.2
    }));

    const gemCoords = [
      [-1.34, 0.78, -0.24],
      [1.34, 0.78, -0.24],
      [-1.08, 0.62, -0.14],
      [1.08, 0.62, -0.14]
    ];

    for (const side of [-1, 1]) {
      const outerHalo = new T.Mesh(new T.TorusGeometry(0.24, 0.018, 8, 22), ringCyan);
      outerHalo.position.set(side * 1.22, 0.72, -0.20);
      const innerHalo = new T.Mesh(new T.TorusGeometry(0.16, 0.013, 6, 18), ringPink);
      innerHalo.position.set(side * 1.22, 0.72, -0.28);
      gPods.add(outerHalo, innerHalo);
    }

    gemCoords.forEach(([x, y, z], idx) => {
      const dummy = this._makeMissileVisual(true);
      dummy.scale.setScalar(0.64);
      dummy.position.set(x, y, z - 0.08);
      dummy.userData.flame.visible = false;
      dummy.userData.baseZ = z - 0.08;
      gPods.add(dummy);
      this.podSlots.gemini.push({ mesh: dummy, local: new T.Vector3(x, y, z - 0.32), side: idx % 2 === 0 ? -1 : 1 });
    });

    heli.root.add(cPods);
    heli.root.add(gPods);
    this.claudePods = cPods;
    this.geminiPods = gPods;
  }

  _buildPools() {
    const T = this.THREE;
    const scene = this.game.scene;

    // Pool of 16 live homing missiles (dual visual children swapped cleanly per avatar!)
    for (let i = 0; i < 16; i++) {
      const grp = new T.Group();
      grp.visible = false;
      const mClaude = this._makeMissileVisual(false);
      const mGem = this._makeMissileVisual(true);
      mGem.visible = false;
      grp.add(mClaude, mGem);
      scene.add(grp);
      this.missiles.push({
        active: false,
        grp,
        mClaude,
        mGem,
        isGem: false,
        pos: new T.Vector3(),
        vel: new T.Vector3(),
        target: null,
        aimPoint: new T.Vector3(),
        age: 0,
        maxAge: 4.8,
        trailAcc: 0,
        turnRate: 4.8,
        speedMax: 52,
        side: 1,
        salvoKick: new T.Vector3()
      });
    }

    // Pool of 10 3D expanding star-firework shockwave detonations!
    for (let i = 0; i < 10; i++) {
      const grp = new T.Group();
      grp.visible = false;
      const coreMat = new T.MeshBasicMaterial({
        color: 0xfff2c2, transparent: true, opacity: 0.95, depthWrite: false
      });
      const core = new T.Mesh(new T.SphereGeometry(0.55, 14, 12), coreMat);
      const ringMat = new T.MeshBasicMaterial({
        color: 0xff70d2, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false
      });
      const ring = new T.Mesh(new T.RingGeometry(0.45, 0.72, 24), ringMat);
      const ring2Mat = new T.MeshBasicMaterial({
        color: 0x58e2ff, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false
      });
      const ring2 = new T.Mesh(new T.RingGeometry(0.35, 0.56, 20), ring2Mat);
      ring2.rotation.x = Math.PI / 2;
      grp.add(core, ring, ring2);
      scene.add(grp);
      this.blasts.push({
        active: false,
        grp,
        core,
        coreMat,
        ring,
        ringMat,
        ring2,
        ring2Mat,
        age: 0,
        dur: 0.58,
        maxScale: 5.5
      });
    }
  }

  _buildHud() {
    if (document.getElementById("missileHud")) return;

    const style = document.createElement("style");
    style.id = "missileHudStyle";
    style.textContent = `
      #missileHud{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0;transition:opacity .22s ease;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      #missileHud.on{opacity:1}
      #missileHud .jet-reticle{position:fixed;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%)}
      #missileHud .jet-reticle::before,#missileHud .jet-reticle::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(118,236,255,.72);box-shadow:0 0 12px rgba(72,216,255,.35)}
      #missileHud .jet-reticle::after{inset:16px;border-style:dashed;border-color:rgba(255,214,126,.85);animation:jetSpin 8s linear infinite}
      #missileHud.claude .jet-reticle::before{border-color:rgba(255,198,92,.78);box-shadow:0 0 12px rgba(255,156,56,.35)}
      #missileHud .jet-dot{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#fff;box-shadow:0 0 8px #7ef2ff}
      #missileHud .jet-wings{position:absolute;left:50%;top:50%;width:128px;height:2px;margin:-1px 0 0 -64px;display:flex;justify-content:space-between}
      #missileHud .jet-wings i{display:block;width:24px;height:2px;background:linear-gradient(90deg,transparent,rgba(126,242,255,.8));border-radius:2px}
      #missileHud .jet-wings i:last-child{background:linear-gradient(270deg,transparent,rgba(126,242,255,.8))}
      #missileHud.claude .jet-wings i{background:linear-gradient(90deg,transparent,rgba(255,204,102,.85))}
      #missileHud.claude .jet-wings i:last-child{background:linear-gradient(270deg,transparent,rgba(255,204,102,.85))}
      #missileLockBox{position:fixed;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;display:none;will-change:transform}
      #missileLockBox .dia{position:absolute;inset:6px;border:2px solid #ff6bd0;border-radius:8px;transform:rotate(45deg);box-shadow:0 0 14px rgba(255,107,208,.75),inset 0 0 8px rgba(102,232,255,.45);animation:jetPulse .65s ease-in-out infinite alternate}
      #missileHud.claude #missileLockBox .dia{border-color:#ffb647;box-shadow:0 0 14px rgba(255,148,54,.8),inset 0 0 8px rgba(255,232,148,.4)}
      #missileLockBox .tag{position:absolute;left:50%;top:-26px;transform:translateX(-50%);white-space:nowrap;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.4px;color:#fff;background:rgba(20,24,42,.74);border:1px solid rgba(255,134,218,.7);text-shadow:0 1px 4px rgba(0,0,0,.6)}
      #missileHud.claude #missileLockBox .tag{border-color:rgba(255,192,92,.8)}
      #missileLockBox .dist{position:absolute;left:50%;bottom:-21px;transform:translateX(-50%);font-size:10px;font-weight:700;color:#9cf4ff;text-shadow:0 1px 5px rgba(0,0,0,.85)}
      #missileHud.claude #missileLockBox .dist{color:#ffe094}
      .missile-sub-lock{position:fixed;left:0;top:0;width:30px;height:30px;margin:-15px 0 0 -15px;display:none;border:1.5px solid rgba(114,234,255,.88);border-radius:5px;transform:rotate(45deg);box-shadow:0 0 10px rgba(96,220,255,.55)}
      #missileHud.claude .missile-sub-lock{border-color:rgba(255,198,92,.9);box-shadow:0 0 10px rgba(255,168,64,.55)}
      #missileBar{position:fixed;left:50%;bottom:calc(13% + 56px);transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 11px;max-width:calc(100vw - 24px);padding:7px 14px;border-radius:18px;background:rgba(15,21,38,.72);backdrop-filter:blur(8px);border:1px solid rgba(132,228,255,.42);color:#eef8ff;box-shadow:0 8px 24px rgba(0,0,0,.32);font-size:12px}
      #missileHud.claude #missileBar{border-color:rgba(255,198,98,.48)}
      #missileBar .m-name{font-weight:700;color:#8ef0ff;letter-spacing:.4px}
      #missileHud.claude #missileBar .m-name{color:#ffd278}
      #missileBar .m-cells{display:flex;gap:4px;align-items:center}
      #missileBar .m-cell{width:10px;height:14px;border-radius:3px;background:linear-gradient(180deg,#8ef5ff,#ff7ad6);box-shadow:0 0 8px rgba(126,232,255,.65);transition:opacity .15s,transform .15s}
      #missileHud.claude #missileBar .m-cell{background:linear-gradient(180deg,#ffe48a,#ff5f42);box-shadow:0 0 8px rgba(255,142,64,.65)}
      #missileBar .m-cell.cd{opacity:.24;transform:scaleY(.62);box-shadow:none}
      #missileBar .m-keys{opacity:.9;font-size:11.5px;color:#dceeff}
      #missileBar .m-keys b{display:inline-block;padding:1px 5px;border-radius:4px;background:rgba(255,255,255,.14);color:#fff;font-weight:700;margin:0 2px}
      @keyframes jetSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      @keyframes jetPulse{from{transform:rotate(45deg) scale(.94)}to{transform:rotate(45deg) scale(1.06)}}
    `;
    document.head.appendChild(style);

    const hud = document.createElement("div");
    hud.id = "missileHud";
    hud.innerHTML = `
      <div class="jet-reticle">
        <div class="jet-dot"></div>
        <div class="jet-wings"><i></i><i></i></div>
      </div>
      <div id="missileLockBox">
        <div class="dia"></div>
        <div class="tag">✦ LOCK</div>
        <div class="dist">0m</div>
      </div>
      <div class="missile-sub-lock" data-sub="0"></div>
      <div class="missile-sub-lock" data-sub="1"></div>
      <div class="missile-sub-lock" data-sub="2"></div>
      <div id="missileBar">
        <span class="m-name">✦ 追踪飞弹</span>
        <span class="m-cells"><i class="m-cell"></i><i class="m-cell"></i><i class="m-cell"></i><i class="m-cell"></i></span>
        <span class="m-keys"><b>左键/J</b> 单发追踪 · <b>F</b> 四连齐射 · <b>空格/Shift</b> 升降</span>
      </div>
    `;
    const hudRoot = document.getElementById("hud");
    if (hudRoot && hudRoot.parentNode) hudRoot.parentNode.insertBefore(hud, hudRoot);
    else document.body.appendChild(hud);

    this.hudEl = hud;
    this.lockEl = hud.querySelector("#missileLockBox");
    this.lockLabelEl = hud.querySelector("#missileLockBox .tag");
    this.lockDistEl = hud.querySelector("#missileLockBox .dist");
    this.subLocks = Array.from(hud.querySelectorAll(".missile-sub-lock"));
    this.barNameEl = hud.querySelector("#missileBar .m-name");
    this.barCells = Array.from(hud.querySelectorAll("#missileBar .m-cell"));
  }

  _hookInputs() {
    const player = this.game.player;
    const heli = this.game.heli;
    if (!player || !heli || player._missilesHooked) return;
    player._missilesHooked = true;

    const isFlying = () => !!(player.enabled && heli.driven && !player.seat && !player.scope);

    // 1) Wrap primary() (Left click in pointer-lock / normal click): fire single homing missile when flying!
    const origPrimary = player.primary.bind(player);
    player.primary = () => {
      if (isFlying()) {
        this.fireSingle();
        return;
      }
      return origPrimary();
    };

    // 2) Wrap attack() (J key & right-click): fire single homing missile when flying!
    const origAttack = player.attack.bind(player);
    player.attack = () => {
      if (isFlying()) {
        this.fireSingle();
        return;
      }
      return origAttack();
    };

    // 3) Wrap throwBall() (F key release / touch button): NEVER throw snowballs while flying!
    const origThrowBall = player.throwBall.bind(player);
    player.throwBall = () => {
      if (isFlying()) {
        this.fireSalvo();
        return;
      }
      return origThrowBall();
    };

    // 4) Intercept KeyF keydown in capture phase while flying so snowball aiming arc NEVER activates
    //    and pressing F launches the dramatic 4-missile curved salvo immediately!
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyF" && isFlying()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        player.aiming = false;
        if (!e.repeat) this.fireSalvo();
      }
    }, true);

    window.addEventListener("keyup", (e) => {
      if (e.code === "KeyF" && isFlying()) {
        e.stopImmediatePropagation();
        player.aiming = false;
      }
    }, true);
  }

  build() {
    this._buildMountPods();
    this._buildPools();
    this._buildHud();
    this._hookInputs();
    return this;
  }

  _petLabel(p) {
    if (!p) return "Clawd";
    if (p.name) return p.name;
    if (p.sp && p.sp.name) return `${p.sp.name} Clawd`;
    return "Clawd";
  }

  // Gather live world target position for any locked target descriptor
  _getTargetPos(t, out) {
    if (!t || !t.ref) return false;
    if (t.kind === "balloon") {
      if (t.ref.got) return false;
      const by = t.ref.grp ? t.ref.grp.position.y : t.ref.y;
      out.set(t.ref.x, by, t.ref.z);
      return true;
    }
    if (t.kind === "pet") {
      const r = t.ref;
      if (!r.root || !r.root.visible || r.tame || r.mode === "gone" || r.mode === "caught" || r.mode === "air") return false;
      const by = r.root.position.y + (r.balloon && !r.popped ? 1.55 : 0.42);
      out.set(r.x, by, r.z);
      return true;
    }
    if (t.kind === "target") {
      const r = t.ref;
      if (r.down >= 0.3) return false;
      out.set(r.x, r.y, r.z);
      return true;
    }
    if (t.kind === "crystal") {
      const r = t.ref;
      out.set(r.x, r.y + (r.h || 1.2) * 0.5, r.z);
      return true;
    }
    if (t.kind === "snowman") {
      const r = t.ref;
      if (r.g && !r.g.visible) return false;
      out.set(r.x, r.y + 1.0 * (r.s || 1), r.z);
      return true;
    }
    if (t.kind === "clawd") {
      const r = t.ref;
      if (!r.root || !r.root.visible) return false;
      out.set(r.x, r.y + (r.air || 0) + 0.45, r.z);
      return true;
    }
    if (t.kind === "friend") {
      const r = t.ref;
      if (!r.obj || !r.obj.visible || r.mode === "castleIndoor") return false;
      out.set(r.x + (r.kx || 0), r.y + (r.h || 1.4) * 0.55, r.z + (r.kz || 0));
      return true;
    }
    return false;
  }

  _scanTargets() {
    const game = this.game;
    const cam = game.player.cam;
    const camPos = cam.position;
    const camDir = cam.getWorldDirection(this._v1);
    const cand = [];
    const tp = this._v2;

    const consider = (kind, ref, label, key, priorityBoost = 0) => {
      const item = { kind, ref, label, key };
      if (!this._getTargetPos(item, tp)) return;
      const dx = tp.x - camPos.x;
      const dy = tp.y - camPos.y;
      const dz = tp.z - camPos.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < 4 || dist > 145) return;
      const dot = (dx * camDir.x + dy * camDir.y + dz * camDir.z) / dist;
      // Forward ~50° cone (cos 50° ≈ 0.64)
      if (dot < 0.64) return;
      // Lower score is better: prioritize targets near center crosshair & closer distance
      const angleErr = 1 - dot;
      const score = angleErr * 145 + dist * 0.16 - priorityBoost;
      item.dist = dist;
      item.score = score;
      cand.push(item);
    };

    if (game.heli && game.heli.balloons) {
      game.heli.balloons.forEach((b, i) => {
        if (!b.got) consider("balloon", b, "礼物气球", "b" + i, 6.5);
      });
    }
    if (game.pets && game.pets.all) {
      game.pets.all.forEach((p, i) => {
        if (p.tame) return;
        const boost = (p.mode === "float" || p.mode === "perch") ? 6.5 : 5.0;
        consider("pet", p, this._petLabel(p), "p" + i, boost);
      });
    }
    if (game.explore && game.explore.targets) {
      game.explore.targets.forEach((tg, i) => {
        consider("target", tg, "靶牌", "t" + i, 4.0);
      });
    }
    if (game.folk && game.folk.snowmen) {
      game.folk.snowmen.forEach((sm, i) => {
        consider("snowman", sm, "雪人", "s" + i, 1.5);
      });
    }
    if (game.folk && game.folk.clawds) {
      game.folk.clawds.forEach((cl, i) => {
        if (cl.kind !== "ride" && cl.root && cl.root.visible) consider("clawd", cl, "雪境 Clawd", "c" + i, 1.5);
      });
    }
    if (game.friends && game.friends.list) {
      game.friends.list.forEach((fr, i) => {
        consider("friend", fr, fr.name || "伙伴", "f" + i, 0);
      });
    }

    cand.sort((a, b) => a.score - b.score);
    this.locked = cand[0] || null;
    this.multiLocked = cand.slice(0, 4);

    const newKey = this.locked ? this.locked.key : "";
    if (newKey && newKey !== this.lastLockKey) {
      if (game.audio && game.audio.missileLock) game.audio.missileLock(true);
    }
    this.lastLockKey = newKey;
  }

  _computeFallbackAim(out) {
    const cam = this.game.player.cam;
    const dir = cam.getWorldDirection(this._v1);
    const origin = cam.position;
    const gun = this.game.tools && this.game.tools.gun;
    if (gun && gun.probe) {
      const p = this._v2;
      for (let d = 8; d <= 96; d += 2.2) {
        p.copy(origin).addScaledVector(dir, d);
        if (gun.probe(p)) {
          out.copy(p);
          return;
        }
      }
    }
    out.copy(origin).addScaledVector(dir, 88);
  }

  _spawnMissile(slotIdx, target, isSalvo = false, spreadOrder = 0) {
    const m = this.missiles.find((item) => !item.active);
    if (!m) return false;

    const game = this.game;
    const heli = game.heli;
    const isGem = !!heli.isGemini;
    const slots = isGem ? this.podSlots.gemini : this.podSlots.claude;
    const slot = slots[slotIdx % slots.length];

    heli.root.updateMatrixWorld(true);
    const launchPos = this._v3.copy(slot ? slot.local : this._fwd);
    if (slot) heli.root.localToWorld(launchPos);
    else launchPos.set(heli.x, heli.y + 0.6, heli.z);

    // Mount forward & right vectors in world space
    const camDir = game.player.cam.getWorldDirection(this._v1).normalize();
    const right = this._v2.crossVectors(camDir, this._up).normalize();
    const side = slot ? slot.side : this.nextSide;

    // Initial launch velocity: forward boost + dramatic fighter-jet pylon kick!
    m.active = true;
    m.isGem = isGem;
    m.mClaude.visible = !isGem;
    m.mGem.visible = isGem;
    m.grp.visible = true;
    m.age = 0;
    m.maxAge = 4.6;
    m.trailAcc = 0;
    m.side = side;
    m.target = target || null;
    m.turnRate = isSalvo ? 8.2 : 8.8;
    m.speedMax = isSalvo ? 54 : 50;
    m.pos.copy(launchPos);

    this._computeFallbackAim(m.aimPoint);
    if (m.target) this._getTargetPos(m.target, m.aimPoint);

    // Base forward velocity + slight drop/outward kick (wide dramatic fan for 4-missile curved salvo!)
    const initSpeed = isSalvo ? 22 : 25;
    m.vel.copy(camDir).multiplyScalar(initSpeed);
    if (isSalvo) {
      const fanX = (spreadOrder % 2 === 0 ? -1 : 1) * (5.5 + Math.floor(spreadOrder / 2) * 3.8);
      const fanY = spreadOrder < 2 ? 3.2 : -1.0;
      m.vel.addScaledVector(right, fanX);
      m.vel.y += fanY;
    } else {
      m.vel.addScaledVector(right, side * 1.5);
      m.vel.y += m.target ? 0.6 : -0.6;
    }

    m.grp.position.copy(m.pos);
    const dirN = this._v4.copy(m.vel).normalize();
    m.grp.quaternion.setFromUnitVectors(this._fwd, dirN);

    // Recoil pod slot dummy rocket so it visibly reloads!
    this.podRecoil[slotIdx % 4] = 1.0;

    // Bright ignition muzzle flash & rocket smoke puff right at wing pod!
    for (let k = 0; k < 8; k++) {
      game.puffs.spawn(
        launchPos.x + (Math.random() - 0.5) * 0.25,
        launchPos.y + (Math.random() - 0.5) * 0.25,
        launchPos.z + (Math.random() - 0.5) * 0.25,
        -camDir.x * (2.5 + Math.random() * 3.5) + (Math.random() - 0.5) * 1.8,
        -camDir.y * 2.5 + (Math.random() - 0.5) * 1.6,
        -camDir.z * (2.5 + Math.random() * 3.5) + (Math.random() - 0.5) * 1.8,
        0.18 + Math.random() * 0.14, 0.85, 0.36 + Math.random() * 0.22,
        isGem ? 0.65 : 1.0, isGem ? 0.90 : 0.78, isGem ? 1.0 : 0.48, 0.2, 2.2
      );
    }
    game.sparks.spawn(
      launchPos.x, launchPos.y, launchPos.z, 0, 0, 0,
      0.72, 1, 0.14,
      isGem ? 1.4 : 3.4, isGem ? 2.8 : 2.1, isGem ? 3.8 : 0.8, 0, 0
    );

    if (game.audio && game.audio.missileLaunch) {
      game.audio.missileLaunch(side, isSalvo);
    }
    this.firedCount++;
    return true;
  }

  fireSingle() {
    if (!this.game.heli || !this.game.heli.driven) return false;
    if (this.singleCd > 0) return false;
    this._scanTargets();
    this.singleCd = 0.24;
    const slotIdx = this.nextSide < 0 ? 0 : 1;
    this.nextSide = -this.nextSide;
    return this._spawnMissile(slotIdx, this.locked, false, 0);
  }

  fireSalvo() {
    if (!this.game.heli || !this.game.heli.driven) return false;
    if (this.salvoCd > 0) return false;
    this._scanTargets();
    this.salvoCd = this.salvoCooldownMax;
    this.singleCd = 0.35;

    // Assign up to 4 distinct locked targets across the 4 salvo missiles (multi-target Macross split!)
    const targets = this.multiLocked.length ? this.multiLocked : [this.locked];
    for (let i = 0; i < 4; i++) {
      const tgt = targets[i % targets.length] || null;
      this.pendingSalvo.push({
        delay: i * 0.085,
        slotIdx: i,
        target: tgt,
        order: i
      });
    }
    return true;
  }

  _spawnBlast(pos, isGem, isBalloon = false) {
    const b = this.blasts.find((item) => !item.active);
    if (!b) return;
    b.active = true;
    b.age = 0;
    b.dur = isBalloon ? 0.68 : 0.54;
    b.maxScale = isBalloon ? 7.2 : 5.4;
    b.grp.visible = true;
    b.grp.position.copy(pos);
    b.grp.scale.setScalar(0.2);
    b.coreMat.color.setHex(isGem ? 0xfff0ff : 0xfff6d2);
    b.ringMat.color.setHex(isGem ? 0xff62cb : 0xff9a38);
    b.ring2Mat.color.setHex(isGem ? 0x52e5ff : 0xffe46b);
    b.ring.lookAt(this.game.player.cam.position);
  }

  _detonate(m, hitKind, hitRef) {
    const game = this.game;
    const pos = m.pos;
    const dir = this._v4.copy(m.vel).normalize();
    const isGem = m.isGem;
    let isBalloon = false;

    // 1) Direct hit handling
    if (hitKind === "balloon" && hitRef && !hitRef.got) {
      this._popBalloon(hitRef);
      isBalloon = true;
    } else if (hitKind === "friend" && hitRef && game.friends) {
      game.friends.hit(hitRef, "ball", dir.x, dir.z);
    } else if (hitKind === "folk" && hitRef && game.folk) {
      game.folk.hit(hitRef, "kick", dir.x, dir.z);
    } else if (hitKind === "pet" && game.pets) {
      const pt = hitRef;
      const snapPos = pt && pt.root
        ? this._v3.set(pt.x, pt.root.position.y + (pt.balloon && !pt.popped ? 1.62 : 0.30), pt.z)
        : pos;
      const wasAerial = pt && (pt.mode === "perch" || pt.mode === "float");
      const wasHide = pt && pt.mode === "hide";
      const ok = game.pets.ballHit(snapPos, this._v2.copy(dir).multiplyScalar(32));
      if (ok && pt && !pt.tame && game.ui && game.ui.toast) {
        const nm = this._petLabel(pt);
        if (wasHide) game.ui.toast(`✦ 追踪飞弹炸出了藏在雪里的 ${nm}！`, 3.6);
        else if (!wasAerial) game.ui.toast(`✦ 追踪飞弹精准击晕了 ${nm}！`, 3.0);
      }
    } else if (hitKind === "thing" && game.explore) {
      game.explore.ballHit(pos);
    } else if ((hitKind === "tree" || hitKind === "trunk") && hitRef && game.player) {
      game.player.dumpSnow(hitRef, pos.x, pos.y, pos.z, 90);
    }

    // 2) Generous Splash Airburst AoE (radius 4.0m) — pops adjacent sky balloons, aerial Clawds, snowmen!
    if (game.heli && game.heli.balloons) {
      for (const bl of game.heli.balloons) {
        if (bl.got) continue;
        const by = bl.grp ? bl.grp.position.y : bl.y;
        if (Math.hypot(pos.x - bl.x, pos.y - by, pos.z - bl.z) < 4.0) {
          this._popBalloon(bl);
          isBalloon = true;
        }
      }
    }
    if (game.pets && game.pets.all) {
      for (const pt of game.pets.all) {
        if (!pt || pt.tame || !pt.root || !pt.root.visible) continue;
        if (pt.mode !== "perch" && pt.mode !== "float") continue;
        const py = pt.root.position.y + (pt.balloon && !pt.popped ? 1.55 : 0.35);
        if (Math.hypot(pos.x - pt.x, pos.y - py, pos.z - pt.z) < 5.6) {
          const snapPos = this._v3.set(pt.x, pt.root.position.y + (pt.balloon && !pt.popped ? 1.62 : 0.30), pt.z);
          game.pets.ballHit(snapPos, this._v2.copy(dir).multiplyScalar(32));
        }
      }
    }
    if (game.folk && game.folk.around) {
      for (const f of game.folk.around(pos.x, pos.z, 3.6)) {
        const d = f.clawd || f.snowman;
        if (d) game.folk.hit(f, "kick", d.x - pos.x, d.z - pos.z);
      }
    }
    if (game.pets && game.pets.shock) game.pets.shock(pos.x, pos.z, 3.4);
    if (game.animals && game.animals.startle) game.animals.startle(pos.x, pos.z, 5.5, 0.7);
    if (hitKind === "ground" && game.tools && game.tools.gun && game.tools.gun.dent) {
      const surf = game.world.surfaceAt(pos.x, pos.z);
      if (surf !== "water") game.tools.gun.dent(pos, surf === "snow");
    }

    // 3) 3D Shockwave Ring + Festive Winter Star-Firework Burst Particles!
    this._spawnBlast(pos, isGem, isBalloon);

    const sparkCnt = isBalloon ? 42 : 28;
    const palette = isGem
      ? [[0.35, 0.90, 1.0], [1.0, 0.45, 0.88], [1.0, 0.96, 0.72]]
      : [[1.0, 0.42, 0.24], [1.0, 0.82, 0.30], [1.0, 0.96, 0.86]];
    for (let k = 0; k < sparkCnt; k++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const sp = (isBalloon ? 4.5 : 3.2) + Math.random() * (isBalloon ? 7.5 : 5.2);
      const col = palette[k % palette.length];
      game.sparks.spawn(
        pos.x, pos.y, pos.z,
        Math.sin(ph) * Math.cos(th) * sp,
        Math.cos(ph) * sp + 1.4,
        Math.sin(ph) * Math.sin(th) * sp,
        0.16 + Math.random() * 0.16, 1.0, 0.42 + Math.random() * 0.42,
        col[0] * 3.0, col[1] * 3.0, col[2] * 3.0, 2.8, 1.6
      );
    }
    for (let k = 0; k < 14; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.4 + Math.random() * 3.6;
      game.puffs.spawn(
        pos.x, pos.y, pos.z,
        Math.cos(a) * sp, 0.6 + Math.random() * 2.8, Math.sin(a) * sp,
        0.34 + Math.random() * 0.32, 0.82, 0.55 + Math.random() * 0.35,
        isGem ? 0.88 : 1.0, isGem ? 0.94 : 0.92, isGem ? 1.0 : 0.86, 0.35, 1.4
      );
    }

    const camDist = pos.distanceTo(game.player.cam.position);
    const distScale = Math.max(0.32, Math.min(1.0, 34 / (10 + camDist)));
    if (game.audio && game.audio.missileBoom) {
      game.audio.missileBoom(isBalloon, distScale);
    }

    m.active = false;
    m.grp.visible = false;
    this.hitsCount++;
  }

  _popBalloon(ref) {
    const game = this.game;
    if (!ref || ref.got) return;
    ref.got = true;
    ref.pop = 0;
    game.heli.popped++;
    const l = game.heli.popped;
    const c = game.heli.balloons.length;
    game.logic.count("balloons", l, c);
    if (l >= c) {
      game.logic.complete("balloons");
      game.ui.toast("八个礼物气球全被导弹击落收齐啦！王牌飞行员！", 6);
    } else {
      game.ui.toast(`追踪飞弹精准击落礼物气球！（${l} / ${c}）`, 3.5);
    }
  }

  _updateHud(dt) {
    const game = this.game;
    const heli = game.heli;
    const driven = !!(heli && heli.driven && game.player && game.player.enabled && !game.player.seat);
    const isGem = !!(heli && heli.isGemini);

    if (driven !== this.wasDriven) {
      this.wasDriven = driven;
      if (this.hudEl) this.hudEl.classList.toggle("on", driven);
      const tBall = document.getElementById("tBall");
      if (tBall) tBall.innerHTML = driven ? "<kbd>F</kbd>齐射" : "<kbd>F</kbd>雪球";
      const tPunch = document.getElementById("tPunch");
      if (tPunch) tPunch.innerHTML = driven ? "<kbd>J</kbd>导弹" : "<kbd>J</kbd>出拳";
      const actBall = document.querySelector('#actbar [data-act="ball"]');
      if (actBall) actBall.textContent = driven ? "四连导弹" : "雪球";
      if (driven) {
        game.player.aiming = false;
        this._scanTargets();
      } else {
        this.locked = null;
        this.multiLocked = [];
        this.lastLockKey = "";
        if (this.lockEl) this.lockEl.style.display = "none";
        for (const el of this.subLocks) el.style.display = "none";
      }
    }

    if (!driven || !this.hudEl) return;

    this.hudEl.classList.toggle("claude", !isGem);
    if (this.barNameEl) {
      this.barNameEl.textContent = isGem ? "✦ 双子星陨飞弹" : "✦ 穿云礼花飞弹";
    }

    // Update 4-cell Salvo Readiness Gauge
    const readyRatio = this.salvoCd <= 0 ? 1 : 1 - this.salvoCd / this.salvoCooldownMax;
    const lit = Math.floor(readyRatio * 4 + 1e-4);
    for (let i = 0; i < this.barCells.length; i++) {
      this.barCells[i].classList.toggle("cd", i >= lit);
    }

    // Project Primary & Multi-Target Lock-On Diamonds onto 2D screen coordinates
    const cam = game.player.cam;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const p = this._v1;

    if (this.locked && this._getTargetPos(this.locked, p)) {
      const dist = Math.round(p.distanceTo(cam.position));
      p.project(cam);
      if (p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05) {
        const sx = (p.x * 0.5 + 0.5) * w;
        const sy = (-p.y * 0.5 + 0.5) * h;
        this.lockEl.style.display = "block";
        this.lockEl.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
        this.lockLabelEl.textContent = `✦ LOCK · ${this.locked.label}`;
        this.lockDistEl.textContent = `${dist}m`;
      } else {
        this.lockEl.style.display = "none";
      }
    } else if (this.lockEl) {
      this.lockEl.style.display = "none";
    }

    // Up to 3 secondary multi-salvo targets
    for (let i = 0; i < this.subLocks.length; i++) {
      const el = this.subLocks[i];
      const sub = this.multiLocked[i + 1];
      if (sub && this._getTargetPos(sub, p)) {
        p.project(cam);
        if (p.z < 1 && Math.abs(p.x) < 1.02 && Math.abs(p.y) < 1.02) {
          const sx = (p.x * 0.5 + 0.5) * w;
          const sy = (-p.y * 0.5 + 0.5) * h;
          el.style.display = "block";
          el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) rotate(45deg)`;
          continue;
        }
      }
      el.style.display = "none";
    }
  }

  update(dt, time) {
    const game = this.game;
    const heli = game.heli;
    if (!heli) return;

    const isGem = !!heli.isGemini;
    if (this.claudePods) this.claudePods.visible = !isGem;
    if (this.geminiPods) {
      this.geminiPods.visible = isGem;
      if (isGem) {
        // Gentle celestial float on Gemini's starlight missile pods
        this.geminiPods.position.y = Math.sin(time * 2.8) * 0.045;
      }
    }

    // Animate pod dummy missile slide-in reload after launch
    const activeSlots = isGem ? this.podSlots.gemini : this.podSlots.claude;
    for (let i = 0; i < 4; i++) {
      if (this.podRecoil[i] > 0) {
        this.podRecoil[i] = Math.max(0, this.podRecoil[i] - dt * 1.8);
      }
      const sl = activeSlots[i];
      if (sl && sl.mesh) {
        const k = this.podRecoil[i];
        sl.mesh.visible = k < 0.72;
        sl.mesh.position.z = sl.mesh.userData.baseZ + k * 0.42;
      }
    }

    if (this.singleCd > 0) this.singleCd = Math.max(0, this.singleCd - dt);
    if (this.salvoCd > 0) this.salvoCd = Math.max(0, this.salvoCd - dt);

    // Drain staggered 4-missile curved salvo queue
    for (let i = this.pendingSalvo.length - 1; i >= 0; i--) {
      const q = this.pendingSalvo[i];
      q.delay -= dt;
      if (q.delay <= 0) {
        this.pendingSalvo.splice(i, 1);
        if (heli.driven) this._spawnMissile(q.slotIdx, q.target, true, q.order);
      }
    }

    // Periodically scan forward radar while flying
    if (heli.driven) {
      this.scanTimer -= dt;
      if (this.scanTimer <= 0) {
        this.scanTimer = 0.08;
        this._scanTargets();
      }
    }

    this._updateHud(dt);

    // Update all active homing missiles
    const gun = game.tools && game.tools.gun;
    for (const m of this.missiles) {
      if (!m.active) continue;
      m.age += dt;
      if (m.age >= m.maxAge) {
        this._detonate(m, "air", null);
        continue;
      }

      // Update homing aim point if target is still live
      if (m.target) {
        if (!this._getTargetPos(m.target, m.aimPoint)) {
          m.target = null;
        }
      }

      // Smooth fighter-jet acceleration & proportional-navigation homing after 0.09s separation kick!
      const speed = m.vel.length();
      const targetSpeed = m.age < 0.09 ? 22 : m.speedMax;
      const newSpeed = speed + (targetSpeed - speed) * Math.min(1, dt * 6.5);

      if (m.age >= 0.09) {
        const desired = this._v1.subVectors(m.aimPoint, m.pos);
        const distToAim = desired.length();
        if (distToAim > 0.25) {
          desired.divideScalar(distToAim);
          const curDir = this._v2.copy(m.vel).normalize();
          const turnStep = Math.min(1, dt * (m.target ? m.turnRate : 2.2));
          curDir.lerp(desired, turnStep).normalize();
          m.vel.copy(curDir).multiplyScalar(newSpeed);
        } else {
          m.vel.normalize().multiplyScalar(newSpeed);
        }
      } else {
        m.vel.normalize().multiplyScalar(newSpeed);
      }

      // Sub-step travel for rock-solid aerial balloon & world hit detection
      const stepDist = m.vel.length() * dt;
      const dirN = this._v3.copy(m.vel).normalize();
      let rem = stepDist;
      let hitKind = null;
      let hitRef = null;

      while (rem > 1e-4 && !hitKind) {
        const seg = Math.min(0.65, rem);
        m.pos.addScaledVector(dirN, seg);
        rem -= seg;

        // 1) Aerial gift balloon proximity fuse (generous 3.0m hit sphere!)
        if (heli.balloons) {
          for (const bl of heli.balloons) {
            if (bl.got) continue;
            const by = bl.grp ? bl.grp.position.y : bl.y;
            if (Math.hypot(m.pos.x - bl.x, m.pos.y - by, m.pos.z - bl.z) < 3.0) {
              hitKind = "balloon";
              hitRef = bl;
              break;
            }
          }
        }
        // 2) Direct proximity fuse on locked non-balloon target (generous 2.4m fuse!)
        if (!hitKind && m.target && m.target.kind !== "balloon" && this._getTargetPos(m.target, this._v2)) {
          if (m.pos.distanceTo(this._v2) < 2.45) {
            hitKind = m.target.kind === "snowman" || m.target.kind === "clawd" ? "folk"
              : m.target.kind === "target" || m.target.kind === "crystal" ? "thing"
              : m.target.kind;
            hitRef = m.target.kind === "snowman" ? { snowman: m.target.ref }
              : m.target.kind === "clawd" ? { clawd: m.target.ref }
              : m.target.ref;
          }
        }
        // 2b) Wild aerial / rooftop Clawd proximity fuse (even on unlocked free-fire!)
        if (!hitKind && game.pets && game.pets.all) {
          for (const pt of game.pets.all) {
            if (!pt || pt.tame || !pt.root || !pt.root.visible) continue;
            if (pt.mode !== "perch" && pt.mode !== "float") continue;
            const py = pt.root.position.y + (pt.balloon && !pt.popped ? 1.55 : 0.35);
            if (Math.hypot(m.pos.x - pt.x, m.pos.y - py, m.pos.z - pt.z) < 2.35) {
              hitKind = "pet";
              hitRef = pt;
              break;
            }
          }
        }
        // 3) Terrain / trees / walls / snowmen / friends probe
        if (!hitKind && gun && gun.probe && m.age > 0.08) {
          const hit = gun.probe(m.pos);
          if (hit) {
            hitKind = hit.kind;
            hitRef = hit.ref;
          }
        }
      }

      if (hitKind) {
        this._detonate(m, hitKind, hitRef);
        continue;
      }

      // Orient missile along velocity vector & flicker rocket flame cone
      m.grp.position.copy(m.pos);
      m.grp.quaternion.setFromUnitVectors(this._fwd, dirN);
      const vis = m.isGem ? m.mGem : m.mClaude;
      if (vis.userData.flame) {
        const fl = 0.82 + Math.sin(time * 75 + m.age * 40) * 0.28;
        vis.userData.flame.scale.set(1, 1, fl);
      }

      // Dense fighter-jet contrail smoke & glowing rocket sparks!
      m.trailAcc += dt;
      if (m.trailAcc >= 0.015) {
        m.trailAcc = 0;
        const tail = this._v2.copy(m.pos).addScaledVector(dirN, -0.58);
        game.puffs.spawn(
          tail.x, tail.y, tail.z,
          (Math.random() - 0.5) * 0.45, 0.15 + Math.random() * 0.3, (Math.random() - 0.5) * 0.45,
          0.20 + Math.random() * 0.12, 0.78, 0.65 + Math.random() * 0.25,
          m.isGem ? 0.80 : 0.96, m.isGem ? 0.92 : 0.94, 1.0, 0.12, 0.8
        );
        const pk = m.isGem && Math.random() > 0.45;
        game.sparks.spawn(
          tail.x, tail.y, tail.z,
          -dirN.x * 2.2 + (Math.random() - 0.5) * 0.9,
          -dirN.y * 2.2 + (Math.random() - 0.5) * 0.9,
          -dirN.z * 2.2 + (Math.random() - 0.5) * 0.9,
          0.11, 0.95, 0.22,
          m.isGem ? (pk ? 3.2 : 1.0) : 3.4,
          m.isGem ? (pk ? 1.4 : 2.8) : 2.2,
          m.isGem ? (pk ? 2.8 : 3.6) : 0.8,
          0, 0
        );
      }
    }

    // Animate expanding 3D shockwave detonation rings
    for (const b of this.blasts) {
      if (!b.active) continue;
      b.age += dt;
      const u = b.age / b.dur;
      if (u >= 1) {
        b.active = false;
        b.grp.visible = false;
        continue;
      }
      const ease = 1 - Math.pow(1 - u, 3);
      const sc = 0.35 + ease * b.maxScale;
      b.grp.scale.setScalar(sc);
      b.core.scale.setScalar(Math.max(0.01, 1 - u * 1.45));
      b.coreMat.opacity = Math.max(0, 1 - u * 1.6);
      b.ringMat.opacity = Math.max(0, (1 - u) * 0.88);
      b.ring2Mat.opacity = Math.max(0, (1 - u) * 0.78);
      b.ring.lookAt(game.player.cam.position);
      b.ring2.rotation.z += dt * 4.5;
    }
  }
}
