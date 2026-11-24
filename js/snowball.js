// 高精度雪球抛物线瞄准与弹道系统 · Snowball Ballistic Arc & Comet Trail System
// Replaces the legacy 20 static yellow dots & unoccluded straight-line aimPoint with:
// 1) True ballistic physics (g = 15.2 m/s²) + smooth hold-to-charge throw power (F / aim),
// 2) Smart target-assist ballistic solver (locks crisply onto snowmen, range targets, friends, pets & snowy trees),
// 3) Real parabolic obstacle collision raymarcher (never clips through hills, trees, walls, or buildings!),
// 4) Tapered translucent glowing parabolic ribbon + animated flowing ice-crystal beads + surface-aligned reticle,
// 5) Crisp powder-snow comet trail behind thrown snowballs + punchy snow splat impact.

const GRAV = 15.2;
const MAX_STEPS = 44;
const STEP_DT = 0.044;
const BEAD_COUNT = 14;

export class SnowballArcSystem {
  constructor(game, helpers = {}) {
    this.game = game;
    this.THREE = game.THREE;
    this.Hs = helpers.Hs || [7.5, 6.8, 8.2, 7.2, 6.4];
    this.rs = helpers.rs || [1.6, 1.4, 1.8, 1.5, 1.4];
    this.dr = helpers.dr || [2.8, 2.5, 3.0, 2.6, 2.4];

    this.charge = 0;
    this.wasAiming = false;
    this.lockedTarget = false;
    this.lastHitKind = null;
    this.lastOrigin = new this.THREE.Vector3();
    this.lastVel = new this.THREE.Vector3();
    this.lastHitPos = new this.THREE.Vector3();
    this.lastHitNormal = new this.THREE.Vector3(0, 1, 0);
    this.arcPoints = [];
    this.arcLen = 0;

    // Reusable scratch vectors & matrices (zero per-frame heap churn!)
    this._p = new this.THREE.Vector3();
    this._pPrev = new this.THREE.Vector3();
    this._v = new this.THREE.Vector3();
    this._dir = new this.THREE.Vector3();
    this._right = new this.THREE.Vector3();
    this._toCam = new this.THREE.Vector3();
    this._tan = new this.THREE.Vector3();
    this._up = new this.THREE.Vector3(0, 1, 0);
    this._q = new this.THREE.Quaternion();
    this._m = new this.THREE.Matrix4();
    this._s = new this.THREE.Vector3();
    this._c0 = new this.THREE.Color();
    this._c1 = new this.THREE.Color();

    this.ribbonMesh = null;
    this.ribbonPos = null;
    this.ribbonCol = null;
    this.beads = null;
    this.reticleG = null;
    this.retOuter = null;
    this.retInner = null;
    this.retFill = null;
    this.retDiamond = null;
  }

  install() {
    const T = this.THREE;
    const g = this.game;
    const player = g.player;
    if (!player) return this;

    // Hide legacy aimDots / aimRing if already constructed
    if (player.aimDots) player.aimDots.visible = false;
    if (player.aimRing) player.aimRing.visible = false;

    this._buildVisuals();

    // Hook cleanly onto player methods while preserving full compatibility with
    // KeyF, Right-Click aimLock, Left-Click primary(), touch UI, and friend snowballs!
    const self = this;

    player.updateAim = function (dt) {
      self.updateAim(this, dt);
    };

    player.throwBall = function () {
      self.throwBall(this);
    };

    player.updateBalls = function (dt) {
      self.updateBalls(this, dt);
    };

    return this;
  }

  _buildVisuals() {
    const T = this.THREE;
    const scene = this.game.scene;

    // 1) Smooth tapered translucent parabolic ribbon (camera-aligned triangle strip!)
    const segs = MAX_STEPS;
    const vertCount = (segs + 1) * 2;
    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);
    const indices = [];
    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
    const rGeo = new T.BufferGeometry();
    this.ribbonPos = new T.BufferAttribute(positions, 3);
    this.ribbonCol = new T.BufferAttribute(colors, 3);
    this.ribbonPos.setUsage(T.DynamicDrawUsage);
    this.ribbonCol.setUsage(T.DynamicDrawUsage);
    rGeo.setAttribute("position", this.ribbonPos);
    rGeo.setAttribute("color", this.ribbonCol);
    rGeo.setIndex(indices);

    const rMat = new T.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });
    this.ribbonMesh = new T.Mesh(rGeo, rMat);
    this.ribbonMesh.frustumCulled = false;
    this.ribbonMesh.renderOrder = 5;
    this.ribbonMesh.visible = false;

    // 2) 14 Flowing animated ice-crystal beads gliding along the parabola!
    const beadGeo = new T.OctahedronGeometry(0.068, 0);
    const beadMat = new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      fog: false
    });
    this.beads = new T.InstancedMesh(beadGeo, beadMat, BEAD_COUNT);
    this.beads.frustumCulled = false;
    this.beads.renderOrder = 6;
    this.beads.visible = false;

    // 3) Surface-aligned Impact Reticle with crisp dark-indigo snow-contrast rim!
    const retG = new T.Group();
    retG.visible = false;

    const rimMat = new T.MeshBasicMaterial({
      color: 0x101830,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });
    const outerMat = new T.MeshBasicMaterial({
      color: 0x16b8ff,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });
    const innerMat = new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.90,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });
    const fillMat = new T.MeshBasicMaterial({
      color: 0x16b8ff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });
    const diamondMat = new T.MeshBasicMaterial({
      color: 0xff7a1a,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false
    });

    // RingGeometry sits in XY plane (+Z normal); we orient retG +Z -> hitNormal!
    this.retRim = new T.Mesh(new T.RingGeometry(0.35, 0.42, 32), rimMat);
    this.retOuter = new T.Mesh(new T.RingGeometry(0.26, 0.36, 32), outerMat);
    this.retInner = new T.Mesh(new T.RingGeometry(0.10, 0.155, 24), innerMat);
    this.retFill = new T.Mesh(new T.CircleGeometry(0.26, 28), fillMat);
    this.retDiamond = new T.Mesh(new T.RingGeometry(0.04, 0.13, 4), diamondMat);
    this.retDiamond.position.z = 0.01;
    this.retDiamond.visible = false;

    for (const m of [this.retRim, this.retOuter, this.retInner, this.retFill, this.retDiamond]) {
      m.renderOrder = 6;
    }
    retG.add(this.retFill, this.retRim, this.retOuter, this.retInner, this.retDiamond);
    this.reticleG = retG;

    scene.add(this.ribbonMesh, this.beads, this.reticleG);
  }

  _probeAimTarget(player, outTarget) {
    const g = this.game;
    const cam = player.cam;
    const orig = cam.position;
    cam.getWorldDirection(this._dir);

    const startS = Math.max(1.2, (player.camDist || 0) + 0.8);
    const maxS = 40;
    for (let s = startS; s <= maxS; s += 0.35) {
      outTarget.copy(orig).addScaledVector(this._dir, s);
      if (outTarget.y < g.world.groundAt(outTarget.x, outTarget.z) + 0.04) {
        return "ground";
      }
      if (g.friends) {
        const f = g.friends.near(outTarget.x, outTarget.z, 0.32);
        if (f && outTarget.y > f.y && outTarget.y < f.y + f.h + 0.15) {
          outTarget.set(f.x, f.y + f.h * 0.58, f.z);
          return "target";
        }
      }
      if (g.folk && g.folk.target(outTarget.x, outTarget.z, 0.24, outTarget.y)) {
        return "target";
      }
      if (g.pets && g.pets.hitTest(outTarget)) {
        return "target";
      }
      if (g.explore && g.explore.hitTest(outTarget)) {
        return "target";
      }
    }
    return null;
  }

  _computeLaunchVelocity(player, origin, charge, outVel) {
    const cam = player.cam;
    const speed = 16.5 + 11.0 * charge; // 16.5 m/s quick lob -> 27.5 m/s charged fastball!

    // Check if player crosshair is pointed directly at an interactive snowball target
    const aimTarget = this._p;
    const kind = this._probeAimTarget(player, aimTarget);

    if (kind === "target") {
      const dx = aimTarget.x - origin.x;
      const dy = aimTarget.y - origin.y;
      const dz = aimTarget.z - origin.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist > 0.8 && dist <= 42) {
        // Exact physical ballistic solve so the snowball curves cleanly onto the target!
        const tFlight = Math.max(0.20, Math.min(1.48, dist / speed));
        outVel.set(
          dx / tFlight,
          dy / tFlight + 0.5 * GRAV * tFlight,
          dz / tFlight
        );
        return true;
      }
    }

    // Natural ballistic throw along camera direction + gentle ergonomic upward loft!
    cam.getWorldDirection(this._dir);
    // Keep camera horizontal azimuth & elevate slightly so horizon aiming gives a pleasing medium arc
    const horiz = Math.hypot(this._dir.x, this._dir.z) || 1e-4;
    const pitch = Math.atan2(this._dir.y, horiz);
    const loftPitch = Math.max(-0.85, Math.min(1.08, pitch + 0.135 - 0.04 * charge));
    const cosP = Math.cos(loftPitch);
    const sinP = Math.sin(loftPitch);

    outVel.set(
      (this._dir.x / horiz) * cosP * speed,
      sinP * speed,
      (this._dir.z / horiz) * cosP * speed
    );
    return false;
  }

  _groundNormal(x, z, out) {
    const w = this.game.world;
    const e = 0.35;
    const hL = w.groundAt(x - e, z);
    const hR = w.groundAt(x + e, z);
    const hD = w.groundAt(x, z - e);
    const hU = w.groundAt(x, z + e);
    out.set(hL - hR, 2 * e, hD - hU).normalize();
    return out;
  }

  _checkPointHit(pt, prevPt, outNormal) {
    const g = this.game;
    const w = g.world;

    // 1) Interactive targets first (friends, snowmen/folk, pets, range targets/crystals)
    if (g.friends) {
      const f = g.friends.near(pt.x, pt.z, 0.36);
      if (f && pt.y >= f.y && pt.y <= f.y + f.h + 0.12) {
        outNormal.subVectors(prevPt, pt).normalize();
        return "target";
      }
    }
    if (g.folk && g.folk.target(pt.x, pt.z, 0.18, pt.y)) {
      outNormal.subVectors(prevPt, pt).normalize();
      return "target";
    }
    if (g.pets && g.pets.hitTest(pt)) {
      outNormal.subVectors(prevPt, pt).normalize();
      return "target";
    }
    if (g.explore && g.explore.hitTest(pt)) {
      outNormal.subVectors(prevPt, pt).normalize();
      return "target";
    }

    // 2) Terrain & walkable platforms
    const gy = w.groundAt(pt.x, pt.z);
    if (pt.y <= gy + 0.05) {
      this._groundNormal(pt.x, pt.z, outNormal);
      return "ground";
    }

    // 3) Solid walls / boxes
    for (let i = 0; i < w.boxes.length; i++) {
      const b = w.boxes[i];
      if (pt.x > b.x0 && pt.x < b.x1 && pt.z > b.z0 && pt.z < b.z1) {
        const top = w.groundAt(pt.x, pt.z) + (b.h ?? 4.2);
        if (pt.y < top) {
          // Nearest face normal for crisp wall reticle alignment
          const dX0 = Math.abs(pt.x - b.x0);
          const dX1 = Math.abs(b.x1 - pt.x);
          const dZ0 = Math.abs(pt.z - b.z0);
          const dZ1 = Math.abs(b.z1 - pt.z);
          const m = Math.min(dX0, dX1, dZ0, dZ1);
          if (m === dX0) outNormal.set(-1, 0, 0);
          else if (m === dX1) outNormal.set(1, 0, 0);
          else if (m === dZ0) outNormal.set(0, 0, -1);
          else outNormal.set(0, 0, 1);
          return "wall";
        }
      }
    }

    // 4) Pine trees (trunk + snowy canopy!)
    if (g.forest && g.forest.trees) {
      const trees = g.forest.trees;
      for (let i = 0; i < trees.length; i++) {
        const u = trees[i];
        if (!u.near) continue;
        const dx = pt.x - u.x;
        const dz = pt.z - u.z;
        if (Math.abs(dx) > 4 || Math.abs(dz) > 4) continue;
        const hy = (pt.y - u.y) / u.s;
        if (hy < 0 || hy > this.Hs[u.v]) continue;
        const dist = Math.hypot(dx, dz);
        const canopyR = hy > this.rs[u.v]
          ? 0.72 * this.dr[u.v] * u.s * Math.pow(1 - (hy - this.rs[u.v]) / (this.Hs[u.v] - this.rs[u.v]), 0.85)
          : 0;
        if (dist < Math.max(canopyR, u.r + 0.1)) {
          outNormal.set(dx, 0.25, dz).normalize();
          return "tree";
        }
      }
    }

    return null;
  }

  _simulateArc(origin, vel) {
    if (this.arcPoints.length < MAX_STEPS + 1) {
      for (let i = this.arcPoints.length; i <= MAX_STEPS; i++) {
        this.arcPoints.push(new this.THREE.Vector3());
      }
    }

    this.arcPoints[0].copy(origin);
    this._pPrev.copy(origin);
    let count = 1;
    let hitKind = null;
    this.lastHitNormal.set(0, 1, 0);

    for (let i = 1; i <= MAX_STEPS; i++) {
      const t = i * STEP_DT;
      const pt = this.arcPoints[i];
      pt.set(
        origin.x + vel.x * t,
        origin.y + vel.y * t - 0.5 * GRAV * t * t,
        origin.z + vel.z * t
      );

      const hk = this._checkPointHit(pt, this._pPrev, this.lastHitNormal);
      if (hk) {
        // Binary-search 4 iterations along segment [prev -> pt] for pinpoint surface landing!
        if (hk === "ground") {
          let lo = (i - 1) * STEP_DT;
          let hi = t;
          for (let k = 0; k < 4; k++) {
            const mid = (lo + hi) * 0.5;
            const mx = origin.x + vel.x * mid;
            const my = origin.y + vel.y * mid - 0.5 * GRAV * mid * mid;
            const mz = origin.z + vel.z * mid;
            if (my <= this.game.world.groundAt(mx, mz) + 0.04) hi = mid;
            else lo = mid;
          }
          pt.set(
            origin.x + vel.x * hi,
            this.game.world.groundAt(origin.x + vel.x * hi, origin.z + vel.z * hi) + 0.04,
            origin.z + vel.z * hi
          );
          this._groundNormal(pt.x, pt.z, this.lastHitNormal);
        }
        hitKind = hk;
        count = i + 1;
        break;
      }

      this._pPrev.copy(pt);
      count = i + 1;
    }

    this.arcLen = count;
    this.lastHitKind = hitKind;
    this.lastHitPos.copy(this.arcPoints[count - 1]);
  }

  updateAim(player, dt) {
    const active = (player.aiming || player.aimLock)
      && player.enabled
      && !player.seat
      && !player.scope
      && !player.rolling
      && !player.gunOut
      && !(player.riding && player.ride && player.ride.kind === "heli");

    player.aimK += ((active ? 1 : 0) - player.aimK) * (1 - Math.exp(-12 * dt));
    if (active !== player.aimShown) {
      player.aimShown = active;
      document.body.classList.toggle("aiming", active);
    }

    // Smooth hold-to-charge power while holding KeyF!
    if (active && player.aiming) {
      this.charge = Math.min(1, this.charge + dt / 0.85);
      this.wasAiming = true;
    } else if (active && player.aimLock) {
      // Comfortable medium-high default power in right-click aim-lock mode
      this.charge += (0.45 - this.charge) * (1 - Math.exp(-8 * dt));
      this.wasAiming = true;
    } else {
      this.charge = Math.max(0, this.charge - dt * 4.5);
      this.wasAiming = false;
    }

    const show = active && player.aimK > 0.25;
    this.ribbonMesh.visible = show;
    this.beads.visible = show;
    this.reticleG.visible = show;
    if (!show) return;

    // 1) Compute real launch origin, target-assisted / charged velocity, and obstacle-accurate parabola!
    player.throwFrom(this.lastOrigin);
    const assisted = this._computeLaunchVelocity(player, this.lastOrigin, this.charge, this.lastVel);
    this._simulateArc(this.lastOrigin, this.lastVel);
    player.aimAt.copy(this.lastHitPos);

    const isLock = assisted || this.lastHitKind === "target";
    const isTree = this.lastHitKind === "tree";
    const isGem = this.game.avatar === "gemini";

    // High-contrast winter palette (vivid & crisp even against bright sunlit afternoon snow!)
    if (isLock) {
      this._c0.setHex(0xffe066);
      this._c1.setHex(0xff5e1a);
    } else if (isTree) {
      this._c0.setHex(0x98ffe0);
      this._c1.setHex(0x00c888);
    } else if (isGem) {
      this._c0.setHex(0x8ae8ff);
      this._c1.setHex(0xff3eb5);
    } else {
      this._c0.setHex(0xa6f4ff);
      this._c1.setHex(0x0099ff);
    }

    // 2) Update smooth camera-aligned parabolic ribbon geometry!
    const camPos = player.cam.position;
    const posArr = this.ribbonPos.array;
    const colArr = this.ribbonCol.array;
    const nPts = this.arcLen;
    const baseHalfW = 0.056 + this.charge * 0.025;

    for (let i = 0; i <= MAX_STEPS; i++) {
      const idx = Math.min(i, nPts - 1);
      const pt = this.arcPoints[idx];
      const u = nPts > 1 ? idx / (nPts - 1) : 1;

      if (idx < nPts - 1) {
        this._tan.subVectors(this.arcPoints[idx + 1], pt).normalize();
      } else if (idx > 0) {
        this._tan.subVectors(pt, this.arcPoints[idx - 1]).normalize();
      } else {
        this._tan.set(0, 0, -1);
      }

      this._toCam.subVectors(camPos, pt).normalize();
      this._right.crossVectors(this._tan, this._toCam);
      if (this._right.lengthSq() < 1e-5) this._right.set(1, 0, 0);
      else this._right.normalize();

      // Elegant tapered ribbon (slim near hand -> full mid-arc -> crisp point at landing)
      const taper = i >= nPts ? 0 : Math.sin(u * Math.PI * 0.92 + 0.08) * (1 - 0.35 * u);
      const hw = baseHalfW * taper;

      const v0 = i * 6;
      posArr[v0] = pt.x - this._right.x * hw;
      posArr[v0 + 1] = pt.y - this._right.y * hw;
      posArr[v0 + 2] = pt.z - this._right.z * hw;
      posArr[v0 + 3] = pt.x + this._right.x * hw;
      posArr[v0 + 4] = pt.y + this._right.y * hw;
      posArr[v0 + 5] = pt.z + this._right.z * hw;

      const cr = this._c0.r + (this._c1.r - this._c0.r) * u;
      const cg = this._c0.g + (this._c1.g - this._c0.g) * u;
      const cb = this._c0.b + (this._c1.b - this._c0.b) * u;
      colArr[v0] = cr; colArr[v0 + 1] = cg; colArr[v0 + 2] = cb;
      colArr[v0 + 3] = cr; colArr[v0 + 4] = cg; colArr[v0 + 5] = cb;
    }
    this.ribbonPos.needsUpdate = true;
    this.ribbonCol.needsUpdate = true;
    this.ribbonMesh.geometry.setDrawRange(0, Math.max(0, (nPts - 1) * 6));

    // 3) Animate 14 flowing crystal beads pulsing smoothly along the exact parabola!
    const time = this.game.time || 0;
    const flowPhase = (time * (1.35 + this.charge * 0.95)) % 1;
    this.beads.material.color.copy(this._c1).lerp(this._c0, 0.38);

    for (let k = 0; k < BEAD_COUNT; k++) {
      const f = (k / BEAD_COUNT + flowPhase) % 1;
      const fIdx = f * (nPts - 1);
      const i0 = Math.min(nPts - 1, Math.floor(fIdx));
      const i1 = Math.min(nPts - 1, i0 + 1);
      const frac = fIdx - i0;
      this._p.lerpVectors(this.arcPoints[i0], this.arcPoints[i1], frac);

      const fade = Math.sin(f * Math.PI);
      const sc = (0.55 + 0.65 * fade) * (1 + this.charge * 0.25);
      this._s.set(sc, sc, sc * 1.45);
      this._q.setFromAxisAngle(this._up, time * 3.5 + k);
      this._m.compose(this._p, this._q, this._s);
      this.beads.setMatrixAt(k, this._m);
    }
    this.beads.instanceMatrix.needsUpdate = true;

    // 4) Position & align the surface-hugging Impact Reticle!
    const nrm = this.lastHitNormal;
    this.reticleG.position.copy(this.lastHitPos).addScaledVector(nrm, 0.038);
    this._q.setFromUnitVectors(new this.THREE.Vector3(0, 0, 1), nrm);
    this.reticleG.quaternion.copy(this._q);

    const camDist = camPos.distanceTo(this.lastHitPos);
    const pulse = 1 + 0.07 * Math.sin(time * (isLock ? 9.5 : 4.2));
    const retScale = Math.max(0.75, Math.min(2.3, camDist / 11)) * pulse * (1 + this.charge * 0.14);
    this.reticleG.scale.setScalar(retScale);

    this.retOuter.material.color.copy(this._c1);
    this.retFill.material.color.copy(this._c1);
    this.retFill.material.opacity = isLock ? 0.32 : 0.18 + this.charge * 0.12;
    this.retInner.rotation.z = time * (isLock ? -2.8 : 1.1);
    this.retDiamond.visible = isLock;
    if (isLock) {
      this.retDiamond.rotation.z = -time * 3.2;
    }
  }

  throwBall(player) {
    if (!player.enabled || player.rolling || player.seat || player.balls.length > 7) return;
    if (player.riding && player.ride && player.ride.kind === "heli") return;

    const T = this.THREE;
    const ballMesh = new T.Mesh(player.ballGeo, player.ballMat);
    const ch = this.game.character;
    const vel = new T.Vector3();
    const useView = player.throwFrom(ballMesh.position);

    const power = this.wasAiming ? this.charge : 0.32;
    if (useView) {
      this._computeLaunchVelocity(player, ballMesh.position, power, vel);
    } else {
      const yaw = ch ? ch.yaw : player.yaw;
      const spd = 17.5 + power * 7.5;
      vel.set(-Math.sin(yaw) * spd, 4.4 + power * 1.4, -Math.cos(yaw) * spd);
    }

    if (player.view === "tp" && ch) {
      ch.aimView = useView;
      ch.play("throw");
    }

    ballMesh.castShadow = false;
    this.game.scene.add(ballMesh);
    player.balls.push({
      m: ballMesh,
      v: vel,
      life: 4.5,
      g: GRAV,
      power,
      trailAcc: 0
    });

    this.charge = 0;
    this.game.audio && this.game.audio.whoosh && this.game.audio.whoosh();
    this.game.logic && this.game.logic.note && this.game.logic.note("throw");
  }

  updateBalls(player, dt) {
    const { world, forest, puffs, audio, friends, folk, pets, explore, character } = this.game;
    const isGem = this.game.avatar === "gemini";

    for (let r = player.balls.length - 1; r >= 0; r--) {
      const b = player.balls[r];
      const grav = b.g || 13; // Preserve g=13 for friend-thrown snowballs!
      b.v.y -= grav * dt;
      b.life -= dt;
      const c = b.m.position;
      c.addScaledVector(b.v, dt);

      // Soft frosty comet powder trail behind player snowballs in flight!
      if (!b.foe && puffs && dt > 0) {
        b.trailAcc = (b.trailAcc || 0) + dt * (28 + (b.power || 0) * 18);
        while (b.trailAcc >= 1) {
          b.trailAcc -= 1;
          puffs.spawn(
            c.x + (Math.random() - 0.5) * 0.05,
            c.y + (Math.random() - 0.5) * 0.05,
            c.z + (Math.random() - 0.5) * 0.05,
            -b.v.x * 0.04, 0.15, -b.v.z * 0.04,
            0.055 + (b.power || 0) * 0.03,
            0.72,
            0.24,
            isGem ? 0.98 : 0.90,
            isGem ? 0.88 : 0.97,
            1.0,
            0.2,
            0.8
          );
        }
      }

      let hit = null;
      if (c.y < world.groundAt(c.x, c.z) + 0.05) hit = "ground";

      if (!hit && friends && !b.foe) {
        const u = friends.near(c.x, c.z, 0.38);
        if (u && c.y < u.y + u.h + 0.12) {
          hit = "friend";
          friends.hit(u, "ball", b.v.x, b.v.z);
        }
      }

      if (!hit && !b.foe && folk) {
        const u = folk.target(c.x, c.z, 0.16, c.y);
        if (u) {
          hit = "folk";
          folk.hit(u, "ball", b.v.x, b.v.z);
        }
      }

      if (!hit && !b.foe && pets && pets.ballHit(c, b.v)) {
        hit = "pet";
      }

      if (!hit && b.foe) {
        const footY = player.y - player.eye + player.air;
        if (Math.hypot(c.x - player.pos.x, c.z - player.pos.z) < 0.42 && c.y > footY && c.y < footY + 1.45) {
          hit = "me";
          if (character) character.landK = 0.9;
          friends.say(b.foe, b.foe.id === "clawd" ? "（得意地挥钳子）" : "打中啦！", 2.2);
        }
      }

      if (!hit && !b.foe && explore && explore.ballHit(c)) {
        hit = "thing";
      }

      if (!hit) {
        for (let i = 0; i < world.boxes.length; i++) {
          const u = world.boxes[i];
          if (c.x > u.x0 && c.x < u.x1 && c.z > u.z0 && c.z < u.z1 && c.y < world.groundAt(c.x, c.z) + (u.h ?? 4.2)) {
            hit = "wall";
            break;
          }
        }
      }

      if (!hit && forest && forest.trees) {
        for (let i = 0; i < forest.trees.length; i++) {
          const u = forest.trees[i];
          if (!u.near) continue;
          const dx = c.x - u.x, dz = c.z - u.z;
          if (Math.abs(dx) > 4 || Math.abs(dz) > 4) continue;
          const dist = Math.hypot(dx, dz);
          const hy = (c.y - u.y) / u.s;
          if (hy < 0 || hy > this.Hs[u.v]) continue;
          const canopyR = hy > this.rs[u.v]
            ? 0.72 * this.dr[u.v] * u.s * Math.pow(1 - (hy - this.rs[u.v]) / (this.Hs[u.v] - this.rs[u.v]), 0.85)
            : 0;
          if (dist < Math.max(canopyR, u.r + 0.1)) {
            hit = dist < u.r + 0.15 ? "trunk" : "tree";
            b.tree = u;
            break;
          }
        }
      }

      if (hit || b.life < 0) {
        const pow = b.power || 0;
        puffs && puffs.burst(c, Math.round(24 + pow * 14), 2.2 + pow * 0.9, 0.2, 1.4, 0.9);
        if (hit === "tree" && b.tree) {
          player.dumpSnow(b.tree, c.x, c.y, c.z);
        }
        if (hit && audio && audio.thud) {
          const distVol = Math.min(1, 14 / (4 + c.distanceTo(player.cam.position)));
          audio.thud(distVol * (0.85 + pow * 0.25));
        }
        this.game.scene.remove(b.m);
        player.balls.splice(r, 1);
      }
    }
  }
}
