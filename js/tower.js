// 林间实景木质瞭望塔 · Walkable In-World Nordic Timber Lookout Tower
// Replaces the legacy black-screen fade teleport ("towerUp"/"towerDown") with a 100% real,
// continuously walkable wrap-around timber staircase, open ground rest gazebo, spacious
// 5.44m × 5.44m panoramic summit deck (supporting both walking up & Helicopter/Sky-Cat landing),
// mounted brass panoramic telescope, alpine shelter bench, corner lanterns & fluttering pennant.

export class WalkableLookoutTower {
  constructor(game, helpers) {
    this.game = game;
    this.THREE = game.THREE;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;

    this.cx = this.re.tower.x; // -106
    this.cz = this.re.tower.z; // 48
    this.baseY = this.qt(this.cx, this.cz);
    this.deckH = 9.6;
    this.deckY = this.baseY + this.deckH;

    this.root = null;
    this.lanternGlows = [];
    this.pennant = null;
    this.scopeHead = null;
    this.towerReached = false;
    this._benchSpot = null;
  }

  mesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new this.THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }

  build() {
    const T = this.THREE;
    const { scene, world } = this.game;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.65, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const m = {
      pine: std(0x6e4427, 0.78),
      pineDark: std(0x462a17, 0.84),
      plank: std(0x9a653c, 0.72),
      plankWarm: std(0xb47b4b, 0.68),
      stone: std(0x707b8f, 0.84),
      snow: std(0xf4f8ff, 0.76),
      roofRed: std(0x8e242c, 0.54),
      iron: std(0x2d3442, 0.38, { metalness: 0.75 }),
      brass: std(0xe6b85c, 0.22, { metalness: 0.86 }),
      lens: std(0x7eeeff, 0.08, {
        metalness: 0.15,
        emissive: new T.Color(0.24, 0.72, 0.92),
        emissiveIntensity: 0.55
      }),
      cloth: std(0xd6343e, 0.55, { side: T.DoubleSide }),
      trimGold: std(0xf2c662, 0.30, { metalness: 0.65 }),
      lanternGlass: plain(new T.MeshStandardMaterial({
        color: 0xfff0be,
        emissive: new T.Color(1.0, 0.76, 0.28),
        emissiveIntensity: 1.5,
        roughness: 0.18
      }))
    };
    this.m = m;

    const root = new T.Group();
    root.position.set(this.cx, this.baseY, this.cz);
    this.root = root;

    // =========================================================================
    // 1. STONE FOOTING PLINTH & FOUR MASSIVE TIMBER CORNER PILLARS (Zero floating!)
    // =========================================================================
    // Recessed stone base flush into snow + walkable ground gazebo wooden deck!
    root.add(
      this.mesh(new T.BoxGeometry(5.9, 0.80, 5.9), m.stone, 0, -0.32, 0),
      this.mesh(new T.BoxGeometry(5.55, 0.14, 5.55), m.plank, 0, 0.09, 0)
    );
    const gx0 = this.cx - 2.75, gx1 = this.cx + 2.75;
    const gz0 = this.cz - 2.75, gz1 = this.cz + 2.75;
    const gy = this.baseY + 0.16;
    world.platforms.push({
      test: (px, pz) => px >= gx0 && px <= gx1 && pz >= gz0 && pz <= gz1,
      y: () => gy,
      wood: true
    });

    const pillarCoords = [
      [-2.48, -2.48],
      [2.48, -2.48],
      [-2.48, 2.48],
      [2.48, 2.48]
    ];
    for (const [px, pz] of pillarCoords) {
      // Heavy timber pillar rising from foundation (-0.6) cleanly up to deck + railing (+10.75)
      root.add(
        this.mesh(new T.BoxGeometry(0.42, 0.90, 0.42), m.stone, px, 0.10, pz),
        this.mesh(new T.BoxGeometry(0.32, this.deckH + 1.15, 0.32), m.pineDark, px, (this.deckH + 0.55) / 2, pz),
        this.mesh(new T.SphereGeometry(0.18, 10, 8), m.trimGold, px, this.deckH + 1.15, pz)
      );
      // Solid pillar collider (never blocks stairways or gazebo!)
      world.circles.push({ x: this.cx + px, z: this.cz + pz, r: 0.24 });
    }

    // Horizontal structural cross-girders & diagonal X-bracing at 3 levels (y = 3.4, 6.75, 9.40)
    const addBrace = (x1, y1, z1, x2, y2, z2, mat = m.pine, thick = 0.14) => {
      const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      const len = Math.hypot(dx, dy, dz);
      const b = this.mesh(new T.BoxGeometry(thick, len, thick), mat, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
      const dir = new T.Vector3(dx, dy, dz).normalize();
      b.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
      root.add(b);
    };

    const levels = [0.22, 3.40, 6.75, 9.42];
    for (let li = 1; li < levels.length; li++) {
      const y = levels[li];
      const yPrev = levels[li - 1];
      // Perimeter tie beams
      root.add(
        this.mesh(new T.BoxGeometry(5.15, 0.24, 0.24), m.pine, 0, y, -2.48),
        this.mesh(new T.BoxGeometry(5.15, 0.24, 0.24), m.pine, 0, y, 2.48),
        this.mesh(new T.BoxGeometry(0.24, 0.24, 5.15), m.pine, -2.48, y, 0),
        this.mesh(new T.BoxGeometry(0.24, 0.24, 5.15), m.pine, 2.48, y, 0)
      );
      // Open-air X-braces on upper tiers (keep ground tier open as a cozy walk-in gazebo!)
      if (li >= 2) {
        addBrace(-2.42, yPrev, -2.48, 2.42, y, -2.48, m.pine, 0.12);
        addBrace(2.42, yPrev, -2.48, -2.42, y, -2.48, m.pine, 0.12);
        addBrace(-2.42, yPrev, 2.48, 2.42, y, 2.48, m.pine, 0.12);
        addBrace(2.42, yPrev, 2.48, -2.42, y, 2.48, m.pine, 0.12);
        addBrace(-2.48, yPrev, -2.42, -2.48, y, 2.42, m.pine, 0.12);
        addBrace(-2.48, yPrev, 2.42, -2.48, y, -2.42, m.pine, 0.12);
        addBrace(2.48, yPrev, -2.42, 2.48, y, 2.42, m.pine, 0.12);
        addBrace(2.48, yPrev, 2.42, 2.48, y, -2.42, m.pine, 0.12);
      }
    }

    // Cozy Ground-Level Rest Bench & Warm Lantern inside the open timber gazebo
    root.add(
      this.mesh(new T.BoxGeometry(2.1, 0.10, 0.56), m.plankWarm, 0, 0.56, -1.2),
      this.mesh(new T.BoxGeometry(2.1, 0.44, 0.08), m.pine, 0, 0.88, -1.46),
      this.mesh(new T.BoxGeometry(0.14, 0.46, 0.46), m.pineDark, -0.85, 0.31, -1.2),
      this.mesh(new T.BoxGeometry(0.14, 0.46, 0.46), m.pineDark, 0.85, 0.31, -1.2)
    );
    this._addLantern(root, 0, 3.02, 0, true);

    // =========================================================================
    // 2. CONTINUOUS WRAP-AROUND WALKABLE TIMBER STAIRCASE (ZERO XZ OVERLAP!)
    // =========================================================================
    const addSupportPost = (lx, lz, topY, collider = false) => {
      const h = topY + 0.75;
      root.add(this.mesh(new T.BoxGeometry(0.20, h, 0.20), m.pineDark, lx, topY - h / 2, lz));
      if (collider) {
        world.circles.push({ x: this.cx + lx, z: this.cz + lz, r: 0.16, top: topY + 0.1 });
      }
    };

    const addFlatLanding = (x0, x1, z0, z1, yTop, railSides = []) => {
      const w = x1 - x0;
      const d = z1 - z0;
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      root.add(
        this.mesh(new T.BoxGeometry(w, 0.20, d), m.plankWarm, mx, yTop - 0.10, mz),
        this.mesh(new T.BoxGeometry(w + 0.08, 0.16, d + 0.08), m.pine, mx, yTop - 0.24, mz)
      );
      // Outer safety railings on specified sides ("N","S","E","W")
      const railH = 0.96;
      for (const side of railSides) {
        if (side === "N" || side === "S") {
          const rz = side === "N" ? z0 + 0.07 : z1 - 0.07;
          root.add(
            this.mesh(new T.BoxGeometry(w, 0.08, 0.09), m.pineDark, mx, yTop + railH, rz),
            this.mesh(new T.BoxGeometry(w, 0.06, 0.06), m.pine, mx, yTop + railH * 0.52, rz)
          );
          for (let i = 0; i <= 3; i++) {
            const bx = x0 + 0.12 + (w - 0.24) * (i / 3);
            root.add(this.mesh(new T.BoxGeometry(0.07, railH, 0.07), m.pine, bx, yTop + railH / 2, rz));
          }
        } else {
          const rx = side === "W" ? x0 + 0.07 : x1 - 0.07;
          root.add(
            this.mesh(new T.BoxGeometry(0.09, 0.08, d), m.pineDark, rx, yTop + railH, mz),
            this.mesh(new T.BoxGeometry(0.06, 0.06, d), m.pine, rx, yTop + railH * 0.52, mz)
          );
          for (let i = 0; i <= 3; i++) {
            const bz = z0 + 0.12 + (d - 0.24) * (i / 3);
            root.add(this.mesh(new T.BoxGeometry(0.07, railH, 0.07), m.pine, rx, yTop + railH / 2, bz));
          }
        }
      }

      // Register crisp walkable wooden platform (tiny 0.04m seam pad prevents any floating-point gap at transitions)
      const wx0 = this.cx + x0 - 0.04, wx1 = this.cx + x1 + 0.04;
      const wz0 = this.cz + z0 - 0.04, wz1 = this.cz + z1 + 0.04;
      const wy = this.baseY + yTop;
      world.platforms.push({
        test: (px, pz) => px >= wx0 && px <= wx1 && pz >= wz0 && pz <= wz1,
        y: () => wy,
        wood: true
      });
    };

    const addStairFlight = (cfg) => {
      // cfg: { x0, x1, z0, z1, y0, y1, axis: 'z-'|'x-'|'z+', outerRail: 'E'|'N'|'W', steps }
      const { x0, x1, z0, z1, y0, y1, axis, outerRail, steps } = cfg;
      const w = x1 - x0;
      const d = z1 - z0;
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;

      // Individual sturdy wooden stair treads with slight snow-dust trim on outer edge
      for (let i = 0; i < steps; i++) {
        const t = (i + 0.5) / steps;
        const sy = y0 + (y1 - y0) * t;
        if (axis === "z-") {
          const sz = z1 - d * t;
          const treadD = d / steps + 0.06;
          root.add(this.mesh(new T.BoxGeometry(w - 0.04, 0.12, treadD), i % 2 ? m.plank : m.plankWarm, mx, sy - 0.06, sz));
        } else if (axis === "x-") {
          const sx = x1 - w * t;
          const treadW = w / steps + 0.06;
          root.add(this.mesh(new T.BoxGeometry(treadW, 0.12, d - 0.04), i % 2 ? m.plank : m.plankWarm, sx, sy - 0.06, mz));
        } else {
          // axis === "z+"
          const sz = z0 + d * t;
          const treadD = d / steps + 0.06;
          root.add(this.mesh(new T.BoxGeometry(w - 0.04, 0.12, treadD), i % 2 ? m.plank : m.plankWarm, mx, sy - 0.06, sz));
        }
      }

      // Twin solid diagonal timber stringers + sloped outer safety handrail & balusters!
      const railH = 0.96;
      if (axis === "z-" || axis === "z+") {
        const za = axis === "z-" ? z1 : z0;
        const zb = axis === "z-" ? z0 : z1;
        addBrace(x0 + 0.10, y0 - 0.16, za, x0 + 0.10, y1 - 0.16, zb, m.pineDark, 0.15);
        addBrace(x1 - 0.10, y0 - 0.16, za, x1 - 0.10, y1 - 0.16, zb, m.pineDark, 0.15);
        const rx = outerRail === "E" ? x1 - 0.07 : x0 + 0.07;
        addBrace(rx, y0 + railH, za, rx, y1 + railH, zb, m.pineDark, 0.085);
        addBrace(rx, y0 + railH * 0.52, za, rx, y1 + railH * 0.52, zb, m.pine, 0.06);
        for (let k = 0; k <= 5; k++) {
          const u = k / 5;
          const bz = za + (zb - za) * u;
          const by = y0 + (y1 - y0) * u;
          root.add(this.mesh(new T.BoxGeometry(0.07, railH, 0.07), m.pine, rx, by + railH / 2, bz));
        }
      } else {
        // axis === "x-"
        addBrace(x1, y0 - 0.16, z0 + 0.10, x0, y1 - 0.16, z0 + 0.10, m.pineDark, 0.15);
        addBrace(x1, y0 - 0.16, z1 - 0.10, x0, y1 - 0.16, z1 - 0.10, m.pineDark, 0.15);
        const rz = z0 + 0.07;
        addBrace(x1, y0 + railH, rz, x0, y1 + railH, rz, m.pineDark, 0.085);
        addBrace(x1, y0 + railH * 0.52, rz, x0, y1 + railH * 0.52, rz, m.pine, 0.06);
        for (let k = 0; k <= 5; k++) {
          const u = k / 5;
          const bx = x1 + (x0 - x1) * u;
          const by = y0 + (y1 - y0) * u;
          root.add(this.mesh(new T.BoxGeometry(0.07, railH, 0.07), m.pine, bx, by + railH / 2, rz));
        }
      }

      // Register silky smooth sloped ramp platform (0.00m vertical discontinuity!)
      const wx0 = this.cx + x0, wx1 = this.cx + x1;
      const wz0 = this.cz + z0, wz1 = this.cz + z1;
      const wy0 = this.baseY + y0, wy1 = this.baseY + y1;
      world.platforms.push({
        test: (px, pz) => px >= wx0 && px <= wx1 && pz >= wz0 && pz <= wz1,
        y: (px, pz) => {
          let t = 0;
          if (axis === "z-") t = (wz1 - pz) / (wz1 - wz0);
          else if (axis === "x-") t = (wx1 - px) / (wx1 - wx0);
          else t = (pz - wz0) / (wz1 - wz0);
          t = Math.max(0, Math.min(1, t));
          return wy0 + (wy1 - wy0) * t;
        },
        wood: true
      });
    };

    // --- Ground Welcome Porch (SE corner: lx ∈ [2.72, 4.42], lz ∈ [2.72, 4.42], y = 0.14) ---
    addFlatLanding(2.72, 4.42, 2.72, 4.42, 0.14, []);
    // Welcoming timber entry arch posts + glowing lantern greeting players at bottom of stairs!
    root.add(
      this.mesh(new T.BoxGeometry(0.20, 2.55, 0.20), m.pineDark, 2.84, 1.35, 4.30),
      this.mesh(new T.BoxGeometry(0.20, 2.55, 0.20), m.pineDark, 4.30, 1.35, 4.30),
      this.mesh(new T.BoxGeometry(1.82, 0.20, 0.28), m.pine, 3.57, 2.66, 4.30),
      this.mesh(new T.BoxGeometry(1.90, 0.08, 0.34), m.snow, 3.57, 2.80, 4.30)
    );
    this._addLantern(root, 4.30, 2.38, 4.55, false);

    // --- Flight 1 (East Side, walking North -Z: 0.14m -> 3.40m) ---
    addStairFlight({
      x0: 2.72, x1: 4.42, z0: -2.72, z1: 2.72,
      y0: 0.14, y1: 3.40, axis: "z-", outerRail: "E", steps: 14
    });

    // --- Landing 1 (NE Corner: lx ∈ [2.72, 4.42], lz ∈ [-4.42, -2.72], y = 3.40m) ---
    addFlatLanding(2.72, 4.42, -4.42, -2.72, 3.40, ["N", "E"]);
    addSupportPost(4.32, -4.32, 3.40, true);
    addSupportPost(4.32, -2.78, 3.40, false);
    addSupportPost(2.82, -4.32, 3.40, false);
    addSupportPost(4.32, 0.0, 1.77, false);
    this._addLantern(root, 4.32, 4.55, -4.32, false);

    // --- Flight 2 (North Side, walking West -X: 3.40m -> 6.75m) ---
    addStairFlight({
      x0: -2.72, x1: 2.72, z0: -4.42, z1: -2.72,
      y0: 3.40, y1: 6.75, axis: "x-", outerRail: "N", steps: 14
    });
    addSupportPost(0.0, -4.32, 5.05, false);

    // --- Landing 2 (NW Corner: lx ∈ [-4.42, -2.72], lz ∈ [-4.42, -2.72], y = 6.75m) ---
    addFlatLanding(-4.42, -2.72, -4.42, -2.72, 6.75, ["N", "W"]);
    addSupportPost(-4.32, -4.32, 6.75, true);
    addSupportPost(-4.32, -2.78, 6.75, false);
    addSupportPost(-2.82, -4.32, 6.75, false);
    this._addLantern(root, -4.32, 7.90, -4.32, false);

    // --- Flight 3 (West Side, walking South +Z: 6.75m -> 9.60m, ending at lz = +1.28) ---
    addStairFlight({
      x0: -4.42, x1: -2.72, z0: -2.72, z1: 1.28,
      y0: 6.75, y1: 9.60, axis: "z+", outerRail: "W", steps: 12
    });
    addSupportPost(-4.32, -0.72, 8.15, false);

    // --- Upper Summit Entry Balcony (SW-West: lx ∈ [-4.42, -2.72], lz ∈ [1.28, 2.72], y = 9.60m) ---
    addFlatLanding(-4.42, -2.72, 1.28, 2.72, this.deckH, ["W", "S"]);
    addSupportPost(-4.32, 2.62, this.deckH, true);
    addSupportPost(-4.32, 1.32, this.deckH, false);
    this._addLantern(root, -4.32, this.deckH + 1.15, 2.62, false);

    // =========================================================================
    // 3. SPACIOUS 5.44m × 5.44m PANORAMIC SUMMIT DECK (Walkable + Fly-Mount Landing!)
    // =========================================================================
    // Note: Keep South/East/Center open to the sky so Helicopter / Sky-Cat can land smoothly on top!
    root.add(
      this.mesh(new T.BoxGeometry(5.44, 0.24, 5.44), m.plankWarm, 0, this.deckH - 0.12, 0),
      this.mesh(new T.BoxGeometry(5.68, 0.22, 5.68), m.pine, 0, this.deckH - 0.34, 0)
    );
    // Decorative compass star inlay flush on summit floor (offset +0.015 with polygonOffset to prevent Z-fighting!)
    const compassMat = plain(new T.MeshStandardMaterial({
      color: 0xe8c474,
      roughness: 0.45,
      metalness: 0.45,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }));
    const compassDisc = this.mesh(new T.CylinderGeometry(0.95, 0.95, 0.02, 24), compassMat, 0, this.deckH + 0.008, 0.45);
    root.add(compassDisc);

    // Register height-aware Summit Deck platform (`[-2.76, +2.76] × [-2.76, +2.76]`):
    // Active whenever the player climbs near/onto the deck OR flies a mount overhead,
    // while keeping the Ground Gazebo underneath 100% freely walkable!
    const dwx0 = this.cx - 2.76, dwx1 = this.cx + 2.76;
    const dwz0 = this.cz - 2.76, dwz1 = this.cz + 2.76;
    world.platforms.push({
      test: (px, pz) => {
        if (px < dwx0 || px > dwx1 || pz < dwz0 || pz > dwz1) return false;
        const p = this.game.player;
        const h = this.game.heli;
        if (h && (h.driven || !h.landed || h.y >= this.deckY - 1.2) && h.y >= this.deckY - 2.4) return true;
        if (!p) return true;
        const footY = p.y - p.eye + p.air + (p.fly || 0);
        return footY >= this.deckY - 2.2;
      },
      y: () => this.deckY,
      wood: true
    });

    // Summit Deck Safety Railings (North, East, South full; West open cleanly from lz = +1.28 to +2.65 for stair entry!)
    const addDeckRail = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const rg = new T.Group();
      rg.position.set((x0 + x1) / 2, this.deckH, (z0 + z1) / 2);
      rg.rotation.y = ang;
      rg.add(
        this.mesh(new T.BoxGeometry(0.10, 0.09, len), m.pineDark, 0, 1.02, 0),
        this.mesh(new T.BoxGeometry(0.07, 0.06, len), m.pine, 0, 0.54, 0),
        this.mesh(new T.BoxGeometry(0.11, 0.04, len), m.snow, 0, 1.08, 0)
      );
      const cnt = Math.max(2, Math.round(len / 0.65));
      for (let i = 0; i <= cnt; i++) {
        const bz = -len / 2 + len * (i / cnt);
        rg.add(this.mesh(new T.BoxGeometry(0.07, 1.02, 0.07), m.pine, 0, 0.51, bz));
      }
      root.add(rg);
    };
    addDeckRail(-2.62, -2.62, 2.62, -2.62); // North
    addDeckRail(2.62, -2.62, 2.62, 2.62);   // East
    addDeckRail(-2.62, 2.62, 2.62, 2.62);   // South
    addDeckRail(-2.62, -2.62, -2.62, 1.24); // West (leaves 1.38m wide open stair entrance at lz ∈ [1.24, 2.62]!)

    // Four warm summit corner lanterns
    this._addLantern(root, -2.48, this.deckH + 1.48, -2.48, false);
    this._addLantern(root, 2.48, this.deckH + 1.48, -2.48, false);
    this._addLantern(root, 2.48, this.deckH + 1.48, 2.48, false);
    this._addLantern(root, -2.48, this.deckH + 1.48, 2.48, false);

    // =========================================================================
    // 4. ALPINE NORTH SHELTER CANOPY, FLUTTERING PENNANT & COZY VIEWING BENCH
    // =========================================================================
    // Elegant half-pavilion alpine shelter along the North edge (lz ∈ [-2.72, -1.05])
    // keeping the South-Center sky completely open for scenic panoramas & air landings!
    const roofY = this.deckH + 2.95;
    for (const px of [-2.48, 2.48]) {
      root.add(
        this.mesh(new T.BoxGeometry(0.24, 2.95, 0.24), m.pineDark, px, this.deckH + 1.47, -2.48),
        this.mesh(new T.BoxGeometry(0.20, 2.75, 0.20), m.pineDark, px, this.deckH + 1.37, -1.15)
      );
    }
    // Sloped Nordic timber roof with warm crimson shingles & fresh snow cap
    const canopyG = new T.Group();
    canopyG.position.set(0, roofY, -1.82);
    canopyG.rotation.x = 0.22;
    canopyG.add(
      this.mesh(new T.BoxGeometry(5.65, 0.14, 2.15), m.pineDark, 0, 0, 0),
      this.mesh(new T.BoxGeometry(5.78, 0.12, 2.28), m.roofRed, 0, 0.12, 0),
      this.mesh(new T.BoxGeometry(5.82, 0.11, 2.30), m.snow, 0, 0.22, 0)
    );
    root.add(canopyG);

    // Tall finial mast & fluttering crimson-gold lookout pennant on the NE roof corner!
    root.add(
      this.mesh(new T.CylinderGeometry(0.04, 0.055, 2.65, 8), m.iron, 2.48, roofY + 1.45, -2.48),
      this.mesh(new T.SphereGeometry(0.11, 10, 8), m.trimGold, 2.48, roofY + 2.80, -2.48)
    );
    const flagShape = new T.Shape();
    flagShape.moveTo(0, 0.34);
    flagShape.lineTo(1.55, 0.12);
    flagShape.lineTo(1.30, 0);
    flagShape.lineTo(1.55, -0.12);
    flagShape.lineTo(0, -0.34);
    flagShape.closePath();
    const flagGeo = new T.ShapeGeometry(flagShape);
    this.pennant = this.mesh(flagGeo, m.cloth, 2.50, roofY + 2.38, -2.48);
    root.add(this.pennant);

    // Cozy Alpine Summit Viewing Bench tucked neatly under the North shelter
    root.add(
      this.mesh(new T.BoxGeometry(2.35, 0.10, 0.56), m.plankWarm, 0, this.deckH + 0.52, -1.96),
      this.mesh(new T.BoxGeometry(2.35, 0.44, 0.08), m.pine, 0, this.deckH + 0.84, -2.22),
      this.mesh(new T.BoxGeometry(0.14, 0.48, 0.48), m.pineDark, -0.96, this.deckH + 0.24, -1.96),
      this.mesh(new T.BoxGeometry(0.14, 0.48, 0.48), m.pineDark, 0.96, this.deckH + 0.24, -1.96)
    );

    // =========================================================================
    // 5. MOUNTED BRASS PANORAMIC TELESCOPE ON EAST RAIL (Real In-World Scope!)
    // =========================================================================
    const scopeX = 2.24, scopeZ = 0.45;
    const scopeStand = new T.Group();
    scopeStand.position.set(scopeX, this.deckH, scopeZ);
    scopeStand.add(
      this.mesh(new T.CylinderGeometry(0.18, 0.24, 0.14, 12), m.iron, 0, 0.07, 0),
      this.mesh(new T.CylinderGeometry(0.055, 0.07, 1.18, 10), m.iron, 0, 0.68, 0),
      this.mesh(new T.SphereGeometry(0.09, 10, 8), m.brass, 0, 1.28, 0)
    );
    const scopeHead = new T.Group();
    scopeHead.position.set(0, 1.32, 0);
    scopeHead.rotation.y = -Math.PI * 0.44; // Aiming East-South-East across Village, Ski Mountain & Ferris Wheel!
    scopeHead.rotation.x = -0.10;
    scopeHead.add(
      this.mesh(new T.CylinderGeometry(0.075, 0.052, 0.78, 14).rotateX(Math.PI / 2), m.brass, 0, 0, -0.08),
      this.mesh(new T.CylinderGeometry(0.088, 0.082, 0.14, 14).rotateX(Math.PI / 2), m.iron, 0, 0, -0.45),
      this.mesh(new T.CylinderGeometry(0.068, 0.068, 0.03, 14).rotateX(Math.PI / 2), m.lens, 0, 0, -0.52),
      this.mesh(new T.CylinderGeometry(0.042, 0.048, 0.12, 12).rotateX(Math.PI / 2), m.iron, 0, 0, 0.34)
    );
    this.scopeHead = scopeHead;
    scopeStand.add(scopeHead);
    root.add(scopeStand);

    const scopeWorldPos = new T.Vector3(this.cx + scopeX + 0.35, this.deckY + 1.38, this.cz + scopeZ);
    world.spots.push({
      id: "towerScope",
      pos: new T.Vector3(this.cx + scopeX - 0.35, this.deckY + 1.0, this.cz + scopeZ),
      r: 2.0,
      label: "用瞭望塔望远镜远眺",
      can: () => {
        const p = this.game.player;
        return !p.riding && !p.skiing && !p.seat && !p.scope && (p.y - p.eye) >= this.deckY - 0.8;
      },
      act: () => {
        this.game.audio && this.game.audio.pick && this.game.audio.pick();
        this.game.player.enterScope(scopeWorldPos, -1.32, -0.11);
        this.game.ui.toast("瞭望塔全景望远镜：拖动鼠标四处眺望，按 E 或移动退出", 5);
      }
    });

    // Interactive Bench Seat on the Summit Deck
    const benchSeatSpot = {
      id: "towerBench",
      pos: new T.Vector3(this.cx, this.deckY + 0.85, this.cz - 1.72),
      r: 2.0,
      label: () => (this.game.player.seat ? "起身继续逛" : "坐在塔顶木椅上歇会儿"),
      can: () => {
        const p = this.game.player;
        if (p.seat && p.seat.spot === benchSeatSpot) return true;
        return !p.riding && !p.skiing && !p.seat && !p.scope && (p.y - p.eye) >= this.deckY - 0.8;
      },
      act: () => {
        const p = this.game.player;
        if (p.seat) {
          p.seat.exit();
          return;
        }
        const prev = { x: p.pos.x, z: p.pos.z };
        p.vel.set(0, 0);
        p.yaw = Math.PI; // Facing South out across the snow valley & Ferris wheel
        p.pitch = -0.10;
        p.seat = {
          pos: new T.Vector3(this.cx, this.deckY + 1.48, this.cz - 1.88),
          spot: benchSeatSpot,
          exit: () => {
            p.seat = null;
            p.pos.set(prev.x, 0, prev.z);
          }
        };
        this.game.audio && this.game.audio.pick && this.game.audio.pick();
      }
    };
    this._benchSpot = benchSeatSpot;
    world.spots.push(benchSeatSpot);

    scene.add(root);

    // Sync explore.towerDeck & reposition the tower Golden Bell cleanly onto the walkable summit deck!
    if (this.game.explore) {
      this.game.explore.towerDeck = this.deckY;
      this._relocateTowerBell();
    }

    return this;
  }

  _addLantern(parent, x, y, z, hanging = false) {
    const T = this.THREE;
    const g = new T.Group();
    g.position.set(x, y, z);
    if (hanging) {
      g.add(this.mesh(new T.CylinderGeometry(0.015, 0.015, 0.34, 6), this.m.iron, 0, 0.26, 0));
    } else {
      g.add(this.mesh(new T.CylinderGeometry(0.03, 0.04, 0.24, 6), this.m.iron, 0, -0.22, 0));
    }
    const glass = this.mesh(new T.OctahedronGeometry(0.15, 1), this.m.lanternGlass, 0, 0, 0);
    g.add(
      this.mesh(new T.ConeGeometry(0.20, 0.14, 6), this.m.iron, 0, 0.17, 0),
      this.mesh(new T.CylinderGeometry(0.13, 0.15, 0.06, 6), this.m.iron, 0, -0.14, 0),
      glass
    );
    this.lanternGlows.push(glass);
    parent.add(g);
  }

  _relocateTowerBell() {
    const bells = this.game.explore && this.game.explore.bells;
    if (!bells || !bells.length) return;
    // Find the bell placed near re.tower (-106, 48) and lift it onto our real summit deck!
    for (const b of bells) {
      if (Math.hypot(b.x - this.cx, b.z - this.cz) < 3.5) {
        b.x = this.cx + 0.95;
        b.z = this.cz - 0.55;
        b.y = this.deckY + 0.88;
        if (b.m) b.m.position.set(b.x, b.y, b.z);
        break;
      }
    }
  }

  update(dt, time) {
    if (!this.root) return;
    const g = this.game;

    // Gentle breeze flutter on summit pennant
    if (this.pennant) {
      this.pennant.rotation.y = Math.sin(time * 2.4) * 0.22 + Math.sin(time * 5.1) * 0.06;
    }

    // Warm lantern glow intensity following day/night lamps
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0.4;
    if (this.m && this.m.lanternGlass) {
      this.m.lanternGlass.emissiveIntensity = (0.55 + 1.85 * lamps) * (0.95 + 0.05 * Math.sin(time * 4.2));
    }

    // Auto-complete the "登上瞭望塔" task the moment the player walks up OR lands on the real summit deck!
    if (!this.towerReached && g.player) {
      const p = g.player;
      const footY = p.riding && p.ride && p.ride.kind === "heli" && g.heli
        ? g.heli.y
        : (p.y - p.eye + p.air);
      const dx = Math.abs(p.pos.x - this.cx);
      const dz = Math.abs(p.pos.z - this.cz);
      if (dx < 3.1 && dz < 3.1 && footY >= this.deckY - 0.55) {
        this.towerReached = true;
        if (g.logic && g.logic.task && !g.logic.task("tower").done) {
          g.logic.complete("tower");
        }
        g.ui && g.ui.toast("登上了实景瞭望塔顶！往东是圣诞村与滑雪山，往南可望见摩天轮，东侧还有全景望远镜可眺望", 7);
      }
    }
  }
}
