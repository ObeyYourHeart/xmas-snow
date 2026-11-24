// 雪境玩法全面升级模块 (js/gameplay.js)
// 1. M 地图一键「✦ 星光传送」（单击追踪、双击或点传送按钮立刻星光瞬移至任意地标，安全避障带伙伴同行！）
// 2. 踏雪星尘冲刺 / 冰面优雅滑步（双击 W / 按 U / Alt / 点击底部冲刺按钮，冰面更有花样滑冰加速！）
// 3. 12 枚「极光星愿碎片」全图收集挑战（覆盖原地图与扩图新秘境，集齐召唤全天极光烟花庆典！）
// 4. 6 座「云端极光飞行星环」（骑飞猫或开直升机穿环触发高速星尘涡轮加速与连环音阶！）

export class GameplayPlus {
  constructor(game, helpers) {
    this.game = game;
    this.qt = helpers.qt;
    this.wrapMat = helpers.mat;
    this.re = helpers.re;
    this.j = helpers.j;
    this.THREE = game.THREE;

    this.group = null;
    this.shards = [];
    this.skyRings = [];
    this.collected = 0;
    this.ringCombo = 0;
    this.ringComboT = 0;

    // Snow-Glide Dash state
    this.dashT = 0;
    this.dashCd = 0;
    this.dashDirX = 0;
    this.dashDirZ = 0;
    this.lastWT = 0;
    this.dashSparkAcc = 0;

    // Fast-travel selected site reference
    this.selectedSite = null;
    this.tpBtn = null;
    this.shardBadge = null;
  }

  build() {
    const T = this.THREE;
    const { scene } = this.game;
    this.group = new T.Group();
    this.group.name = "gameplay_plus";
    scene.add(this.group);

    this.buildStarShards();
    this.buildSkyRings();
    this.setupDashControls();
    this.setupMapFastTravel();
    return this;
  }

  // =========================================================================
  // 1. 12 COLLECTIBLE AURORA STAR-SHARDS ACROSS THE EXPANDED WORLD!
  // =========================================================================
  buildStarShards() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const gemMat = plain(new T.MeshStandardMaterial({
      color: 0x7ef6ff,
      emissive: new T.Color(0.24, 0.88, 1.0),
      emissiveIntensity: 1.55,
      roughness: 0.12,
      metalness: 0.25
    }));
    const ringMat = plain(new T.MeshStandardMaterial({
      color: 0xffe066,
      emissive: new T.Color(0.95, 0.72, 0.18),
      emissiveIntensity: 1.35,
      roughness: 0.18,
      metalness: 0.8
    }));
    const coreGeo = new T.OctahedronGeometry(0.42, 0);
    const ringGeo = new T.TorusGeometry(0.68, 0.045, 6, 24);

    // 12 scenic placements spanning both core landmarks & newly expanded outer wonders!
    const spots = [
      { id: "s_castle", name: "Claude 城堡广场", x: this.j.cabin.x + 1.5, z: this.j.cabin.z + 10.5, dy: 1.3 },
      { id: "s_cathome", name: "哈基米星猫小窝", x: this.re.cathome.x, z: this.re.cathome.z + 8.5, dy: 1.4 },
      { id: "s_pond", name: "冰晶冰湖中心", x: this.j.pond.x + 5.5, z: this.j.pond.z + 1.5, dy: 1.3 },
      { id: "s_spring", name: "林间温泉雪汤", x: this.re.spring.x, z: this.re.spring.z - 5.2, dy: 1.4 },
      { id: "s_market", name: "圣诞集市拱门", x: this.re.market.x, z: this.re.market.z - 9.5, dy: 1.4 },
      { id: "s_crystals", name: "冰晶琴音坛", x: this.re.crystals.x, z: this.re.crystals.z + 3.2, dy: 1.4 },
      { id: "s_tower", name: "森林瞭望塔下", x: this.re.tower.x + 3.8, z: this.re.tower.z + 2.5, dy: 1.4 },
      { id: "s_lookout", name: "山顶观景台", x: this.re.lookout.x, z: this.re.lookout.z, dy: 1.9 },
      { id: "s_ski", name: "雪道起点拱门", x: 34, z: 22, dy: 1.4 },
      { id: "s_obs", name: "极光观星坛", x: this.re.observatory.x, z: this.re.observatory.z + 6.2, dy: 1.6 },
      { id: "s_clock", name: "姜饼钟楼广场", x: this.re.clocktower.x, z: this.re.clocktower.z + 6.5, dy: 1.4 },
      { id: "s_icefall", name: "幽蓝冰瀑秘境", x: this.re.icefall.x, z: this.re.icefall.z + 3.8, dy: 1.5 }
    ];

    let saved = new Set();
    try {
      const raw = JSON.parse(localStorage.getItem("xmasSnow.shards") || "[]");
      if (Array.isArray(raw)) saved = new Set(raw);
    } catch {}

    for (let i = 0; i < spots.length; i++) {
      const s = spots[i];
      const y = this.qt(s.x, s.z) + s.dy;
      const g = new T.Group();
      g.position.set(s.x, y, s.z);
      const gem = new T.Mesh(coreGeo, gemMat);
      gem.scale.set(0.85, 1.38, 0.85);
      const r1 = new T.Mesh(ringGeo, ringMat);
      r1.rotation.x = Math.PI / 3;
      const r2 = new T.Mesh(ringGeo, gemMat);
      r2.rotation.y = Math.PI / 3;
      r2.scale.setScalar(0.82);
      g.add(gem, r1, r2);
      const got = saved.has(s.id);
      g.visible = !got;
      if (got) this.collected++;
      this.group.add(g);
      this.shards.push({ ...s, y, g, gem, r1, r2, got, ph: i * 0.85 });
    }

    // Subtle HUD badge inside #tasks footer showing star-shard collection count!
    const ft = document.querySelector("#tasks .ft");
    if (ft) {
      const badge = document.createElement("span");
      badge.id = "shardBadge";
      badge.title = "探索雪境收集 12 枚极光星愿碎片";
      badge.textContent = `✦ 星愿 ${this.collected}/${this.shards.length}`;
      ft.appendChild(badge);
      this.shardBadge = badge;
    }
  }

  // =========================================================================
  // 2. 6 AERIAL SKY FLIGHT RINGS (Turbo Boost Parkour for Sky-Cat & Helicopter!)
  // =========================================================================
  buildSkyRings() {
    const T = this.THREE;
    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const ringGeo = new T.TorusGeometry(3.2, 0.16, 10, 36);
    const innerGeo = new T.TorusGeometry(2.85, 0.08, 8, 32);

    const coords = [
      { x: -24, z: 14, h: 16, yaw: 0.7 },
      { x: -85, z: -48, h: 20, yaw: 0.6 },
      { x: -128, z: 22, h: 22, yaw: 0.1 },
      { x: -52, z: 126, h: 20, yaw: 1.4 },
      { x: 46, z: 10, h: 18, yaw: 0.25 },
      { x: 64, z: -76, h: 22, yaw: -0.75 }
    ];

    for (let i = 0; i < coords.length; i++) {
      const c = coords[i];
      const y = this.qt(c.x, c.z) + c.h;
      const matOuter = plain(new T.MeshStandardMaterial({
        color: 0xffdc64,
        emissive: new T.Color(0.96, 0.72, 0.16),
        emissiveIntensity: 1.25,
        roughness: 0.2,
        metalness: 0.85
      }));
      const matInner = plain(new T.MeshStandardMaterial({
        color: i % 2 ? 0xff7ce2 : 0x52f2ff,
        emissive: i % 2 ? new T.Color(0.95, 0.36, 0.84) : new T.Color(0.20, 0.88, 1.0),
        emissiveIntensity: 1.5,
        roughness: 0.15
      }));
      const g = new T.Group();
      g.position.set(c.x, y, c.z);
      g.rotation.y = c.yaw;
      const outer = new T.Mesh(ringGeo, matOuter);
      const inner = new T.Mesh(innerGeo, matInner);
      g.add(outer, inner);
      this.group.add(g);
      this.skyRings.push({ x: c.x, y, z: c.z, g, inner, matOuter, matInner, cd: 0, flash: 0, ph: i * 1.1 });
    }
  }

  // =========================================================================
  // 3. SNOW-GLIDE DASH / FIGURE-SKATING BOOST (Double-tap W / KeyU / Button!)
  // =========================================================================
  setupDashControls() {
    const g = this.game;
    // Add crisp clickable Dash button right into #actbar!
    const actbar = document.getElementById("actbar");
    if (actbar) {
      const btn = document.createElement("button");
      btn.dataset.act = "dash";
      btn.className = "ft";
      btn.title = "踏雪星尘冲刺 / 冰面优雅滑步（双击 W 或按 U）";
      btn.innerHTML = "<kbd>U</kbd>冲刺";
      btn.onclick = () => { btn.blur(); this.triggerDash(); };
      const kickBtn = actbar.querySelector('[data-act="kick"]');
      if (kickBtn && kickBtn.parentNode) kickBtn.insertAdjacentElement("afterend", btn);
      else actbar.appendChild(btn);
    }

    addEventListener("keydown", (ev) => {
      if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
      // Clear held keys on Alt so Windows/browser Alt-menu or Alt+Tab never leaves movement keys stuck!
      if (ev.code === "AltLeft" || ev.code === "AltRight") {
        if (g.player && g.player.keys) g.player.keys.clear();
        return;
      }
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (!g.started || !g.player || !g.player.enabled) return;
      if (!ev.repeat && ev.code === "KeyU") {
        this.triggerDash();
      } else if (!ev.repeat && ev.code === "KeyW") {
        const now = performance.now();
        if (now - this.lastWT < 280) {
          this.triggerDash();
          this.lastWT = 0;
        } else {
          this.lastWT = now;
        }
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && g.player && g.player.keys) g.player.keys.clear();
    });
  }

  triggerDash() {
    const g = this.game, pl = g.player;
    if (!g.started || !pl || !pl.enabled || pl.riding || pl.seat || pl.skiing || pl.scope) return false;
    if (this.dashCd > 0) return false;
    if ((g.cabin && g.cabin.inside) || (g.chemlab && g.chemlab.inside)) return false;

    const yaw = pl.view === "tp" && g.character ? g.character.yaw : pl.yaw;
    this.dashDirX = -Math.sin(yaw);
    this.dashDirZ = -Math.cos(yaw);
    const onIce = g.world && g.world.surfaceAt(pl.pos.x, pl.pos.z) === "ice";
    this.dashT = onIce ? 0.56 : 0.40;
    this.dashCd = 1.65;

    const isGem = g.avatar === "gemini";
    if (g.audio.dashWhoosh) g.audio.dashWhoosh(isGem);
    // Immediate radial snow/starlight launch puff!
    const py = pl.y - pl.eye + 0.35;
    for (let k = 0; k < 12; k++) {
      const a = Math.random() * Math.PI * 2;
      const pk = isGem && k % 2 === 1;
      g.puffs.spawn(
        pl.pos.x, py, pl.pos.z,
        Math.cos(a) * 1.8 - this.dashDirX * 2.2, 0.5 + Math.random() * 1.2, Math.sin(a) * 1.8 - this.dashDirZ * 2.2,
        0.09 + Math.random() * 0.06, 0.82, 0.42,
        isGem ? (pk ? 1 : 0.25) : 1, isGem ? (pk ? 0.48 : 0.92) : 0.78, isGem ? (pk ? 0.92 : 1) : 0.25, 1.5, 1.4
      );
    }
    return true;
  }

  // =========================================================================
  // 4. M-MAP ONE-CLICK STARLIGHT FAST-TRAVEL TELEPORT!
  // =========================================================================
  setupMapFastTravel() {
    const g = this.game;
    const mapEl = document.getElementById("map");
    if (!mapEl) return;
    const card = mapEl.querySelector(".card");
    const cv = mapEl.querySelector("canvas");
    const note = mapEl.querySelector(".note");
    if (!card || !cv) return;

    // Upgrade map footer hint + add sleek Fast-Travel action bar!
    if (note) {
      note.innerHTML = '棕色虚线是林间小路，点地点可追踪方向，<strong>双击地点</strong>或点击右侧按钮可<strong>星光瞬移传送</strong>；按 <kbd>M</kbd> 或 Esc 关闭。';
    }
    const bar = document.createElement("div");
    bar.id = "mapTpBar";
    bar.innerHTML = `<span id="mapSelName">点击地图上的任意地标可追踪或瞬移</span><button id="btnMapTp" disabled>✦ 星光传送</button>`;
    card.appendChild(bar);
    const selLabel = bar.querySelector("#mapSelName");
    const tpBtn = bar.querySelector("#btnMapTp");
    this.tpBtn = tpBtn;

    const findSiteAt = (ev) => {
      const bounds = g._mapBounds || { xMin: -224, xMax: 232, zMin: -212 };
      const p = cv.width / (bounds.xMax - bounds.xMin);
      const rect = cv.getBoundingClientRect();
      const cx = ((ev.clientX - rect.left) * cv.width) / rect.width;
      const cz = ((ev.clientY - rect.top) * cv.height) / rect.height;
      let best = null, bestD = 38;
      for (const s of (g.explore && g.explore.sites) || []) {
        const sx = (s.x - bounds.xMin) * p;
        const sz = (s.z - bounds.zMin) * p;
        const d = Math.hypot(sx - cx, sz - cz);
        if (d < bestD) { bestD = d; best = s; }
      }
      return best;
    };

    cv.addEventListener("click", (ev) => {
      const s = findSiteAt(ev);
      this.selectedSite = s;
      if (s) {
        selLabel.textContent = `已选地标：${s.name}${s.found ? "" : "（未探索）"}`;
        tpBtn.disabled = false;
        tpBtn.textContent = `✦ 传送至 ${s.name}`;
      } else {
        selLabel.textContent = "点击地图上的任意地标可追踪或瞬移";
        tpBtn.disabled = true;
        tpBtn.textContent = "✦ 星光传送";
      }
    });

    cv.addEventListener("dblclick", (ev) => {
      const s = findSiteAt(ev);
      if (s) this.fastTravelTo(s);
    });

    tpBtn.addEventListener("click", () => {
      if (this.selectedSite) this.fastTravelTo(this.selectedSite);
    });
  }

  fastTravelTo(site) {
    const g = this.game, pl = g.player;
    if (!site || !pl || !g.started) return false;
    if (pl.riding || pl.seat || pl.skiing) {
      g.ui.toast("请先下坐骑/起身或脱下滑雪板再使用星光传送喵～", 3.5);
      return false;
    }
    // Exit Claude Castle or Hajimi ChemLab interior cleanly if currently indoors
    if (g.cabin && g.cabin.inside && g.cabin.leave) {
      g.cabin.leave();
    }
    if (g.chemlab && g.chemlab.inside) {
      g.chemlab.inside = false;
      if (g.chemlab.intGroup) g.chemlab.intGroup.visible = false;
      g.snowAmount = g.chemlab.snowWas ?? 1.2;
      g.perf && g.perf._updateCulling();
    }

    // Choose a guaranteed safe, clear offset beside the landmark (avoid buildings/water/ponds!)
    const offsets = {
      cabin: [0, 8.8],
      pond: [16.5, 4.5],
      spring: [0, -5.4],
      xmas: [-4.5, 5.5],
      fire: [4.2, 3.2],
      market: [0, -10.5],
      wheel: [-8.5, -4.5],
      tower: [5.6, 5.4],
      cathome: [-6.5, 8.5],
      chemlab: [0, 8.2],
      observatory: [0, 6.8],
      clocktower: [0, 7.2],
      icefall: [0, 5.4],
      ballroom: [0, 9.6],
      maze: [0, 15.2],
      lookout: [0, 0]
    };
    const [ox, oz] = offsets[site.id] || [0, 5.2];
    let tx = site.x + ox, tz = site.z + oz;
    if (pl.resolve) {
      [tx, tz] = pl.resolve(tx, tz);
    }

    const yawToSite = Math.atan2(-(site.x - tx), -(site.z - tz));
    pl.teleport(tx, tz, isFinite(yawToSite) ? yawToSite : 0, -0.10);

    // Bring following party friends smoothly nearby too!
    if (g.friends && g.friends.party) {
      g.friends.party.forEach((fr, idx) => {
        const a = idx * 1.4 + 0.8;
        fr.x = tx + Math.cos(a) * 2.1;
        fr.z = tz + Math.sin(a) * 2.1;
      });
    }

    // Close map popup cleanly
    if (g.ui && g.ui.toggleMap) g.ui.toggleMap(false);

    // Starlight arrival swirl & chime!
    if (g.audio.fastTravel) g.audio.fastTravel();
    const ty = g.world.groundAt(tx, tz);
    const isGem = g.avatar === "gemini";
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      const pk = isGem && k % 2 === 1;
      g.sparks.spawn(
        tx + Math.cos(a) * 0.9, ty + 0.3 + (k % 5) * 0.35, tz + Math.sin(a) * 0.9,
        Math.cos(a) * 2.2, 1.4 + Math.random() * 1.8, Math.sin(a) * 2.2,
        0.16, 0.92, 0.72,
        isGem ? (pk ? 3.2 : 0.8) : 3.2, isGem ? (pk ? 1.2 : 2.8) : 2.2, isGem ? (pk ? 2.8 : 3.6) : 0.6, 1.2, 1.2
      );
    }
    g.character && g.character.play("happy");
    g.ui.toast(`✦ 星光瞬移到达：${site.name}！`, 3.5);
    return true;
  }

  // =========================================================================
  // 5. PER-FRAME UPDATE (Dash, Star-Shards, Sky Rings!)
  // =========================================================================
  update(dt, time) {
    const g = this.game, pl = g.player;
    if (!g.ready || !pl) return;

    // 1) Active Snow-Glide / Ice-Skating Dash step
    if (this.dashCd > 0) this.dashCd = Math.max(0, this.dashCd - dt);
    if (this.dashT > 0) {
      this.dashT = Math.max(0, this.dashT - dt);
      if (!pl.riding && !pl.seat && !pl.skiing && !(g.cabin && g.cabin.inside) && !(g.chemlab && g.chemlab.inside)) {
        const onIce = g.world && g.world.surfaceAt(pl.pos.x, pl.pos.z) === "ice";
        const spd = (onIce ? 12.8 : 9.2) * (0.35 + 0.65 * (this.dashT / 0.45));
        const nx = pl.pos.x + this.dashDirX * spd * dt;
        const nz = pl.pos.z + this.dashDirZ * spd * dt;
        const [rx, rz] = pl.resolve ? pl.resolve(nx, nz) : [nx, nz];
        if (pl.allowed(rx, rz)) {
          pl.pos.x = rx;
          pl.pos.z = rz;
        }
        const isGem = g.avatar === "gemini";
        this.dashSparkAcc += dt * 36;
        while (this.dashSparkAcc >= 1) {
          this.dashSparkAcc -= 1;
          const pk = isGem && Math.random() > 0.5;
          g.puffs.spawn(
            pl.pos.x + (Math.random() - 0.5) * 0.4,
            pl.y - pl.eye + 0.25 + Math.random() * 0.4,
            pl.pos.z + (Math.random() - 0.5) * 0.4,
            -this.dashDirX * 1.4, 0.4 + Math.random() * 0.8, -this.dashDirZ * 1.4,
            0.09, 0.85, 0.38,
            isGem ? (pk ? 1 : 0.24) : 1, isGem ? (pk ? 0.48 : 0.92) : 0.78, isGem ? (pk ? 0.92 : 1) : 0.25, 1.2, 1.4
          );
        }
      } else {
        this.dashT = 0;
      }
    }

    // 2) Animate & collect 12 Aurora Star-Shards!
    const px = pl.riding && g.heli && g.heli.driven ? g.heli.x : pl.pos.x;
    const py = pl.riding && g.heli && g.heli.driven ? g.heli.y + 1.0 : (pl.y - pl.eye + 0.9);
    const pz = pl.riding && g.heli && g.heli.driven ? g.heli.z : pl.pos.z;
    const inside = !!((g.cabin && g.cabin.inside) || (g.chemlab && g.chemlab.inside));

    for (const s of this.shards) {
      if (s.got) continue;
      s.g.position.y = s.y + Math.sin(time * 2.4 + s.ph) * 0.22;
      s.gem.rotation.y = time * 1.9 + s.ph;
      s.r1.rotation.z = time * 1.4;
      s.r2.rotation.x = -time * 1.6;
      if (!inside && Math.hypot(px - s.x, pz - s.z) < 2.2 && Math.abs(py - s.y) < 2.8) {
        s.got = true;
        s.g.visible = false;
        this.collected++;
        try {
          const ids = this.shards.filter((x) => x.got).map((x) => x.id);
          localStorage.setItem("xmasSnow.shards", JSON.stringify(ids));
        } catch {}
        if (this.shardBadge) this.shardBadge.textContent = `✦ 星愿 ${this.collected}/${this.shards.length}`;
        if (g.audio.pickupStar) g.audio.pickupStar(this.collected);
        for (let k = 0; k < 26; k++) {
          const a = (k / 26) * Math.PI * 2;
          const sp = 2.0 + Math.random() * 3.4;
          g.sparks.spawn(
            s.x, s.y, s.z,
            Math.cos(a) * sp, 1.2 + Math.random() * 2.6, Math.sin(a) * sp,
            0.16, 0.95, 0.85, k % 2 ? 3.4 : 0.8, k % 2 ? 2.6 : 2.9, k % 2 ? 0.6 : 3.6, 2.0, 1.3
          );
        }
        if (this.collected >= this.shards.length) {
          g.audio.done && g.audio.done();
          g.places && g.places.launchFireworks && g.places.launchFireworks();
          g.ui.toast(`✦ 集齐全部 ${this.shards.length} 枚极光星愿碎片！漫天极光烟花为你盛放喵！！`, 7);
        } else {
          g.ui.toast(`✦ 收集到极光星愿碎片「${s.name}」（${this.collected} / ${this.shards.length}）`, 4.2);
        }
      }
    }

    // 3) Animate & detect flying through the 6 Aerial Sky Flight Rings!
    if (this.ringComboT > 0 && (this.ringComboT -= dt) <= 0) this.ringCombo = 0;
    const flying = !!(g.heli && g.heli.driven && !g.heli.landed);
    for (const r of this.skyRings) {
      r.cd = Math.max(0, r.cd - dt);
      r.g.position.y = r.y + Math.sin(time * 1.4 + r.ph) * 0.45;
      r.inner.rotation.z = time * 1.5;
      if (r.flash > 0) {
        r.flash = Math.max(0, r.flash - dt * 2.2);
        r.matOuter.emissiveIntensity = 1.25 + r.flash * 2.8;
        r.g.scale.setScalar(1 + r.flash * 0.25);
      } else {
        r.matOuter.emissiveIntensity = 1.25;
        r.g.scale.setScalar(1);
      }
      if (flying && r.cd <= 0) {
        const d = Math.hypot(g.heli.x - r.x, (g.heli.y + 1.0) - r.g.position.y, g.heli.z - r.z);
        if (d < 3.6) {
          r.cd = 4.0;
          r.flash = 1.0;
          this.ringCombo++;
          this.ringComboT = 16.0;
          // Turbo forward boost surge!
          g.heli.v = Math.max(g.heli.v + 6.5, 19.5);
          if (g.audio.skyRing) g.audio.skyRing(this.ringCombo);
          for (let k = 0; k < 32; k++) {
            const a = (k / 32) * Math.PI * 2;
            g.sparks.spawn(
              r.x + Math.cos(a) * 2.6, r.g.position.y + Math.sin(a) * 2.6, r.z,
              Math.cos(a) * 3.5, Math.sin(a) * 3.5, (Math.random() - 0.5) * 3,
              0.22, 0.95, 0.75, k % 2 ? 3.5 : 0.8, k % 2 ? 2.8 : 2.9, k % 2 ? 0.6 : 3.6, 1.0, 1.3
            );
          }
          g.ui.toast(`✦ 穿过云端极光星环！高速星尘涡轮加速（连环 ×${this.ringCombo}）`, 3.6);
        }
      }
    }
  }
}
