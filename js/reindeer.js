// 驯鹿与雪橇全面升级模块 (js/reindeer.js)
// - 视觉精修：发光红宝石鲁道夫鼻光环与暖红微光、鹿角流光彩灯与金色角冠星、绒红金铃项圈与飘动圣诞围巾、
//             雪橇鎏金冰橇轨灯带、雪橇前饰冬青蝴蝶结与星光灯笼礼袋！
// - 操控与玩法升级：更快更顺滑的雪橇巡航/疾驰手感、驾驶时按空格或 U 触发「铃铛星光涡轮冲刺」、
//                   摸摸驯鹿升级为互动「喂金胡萝卜 + 摸摸撒娇」带心形星光与持续发光增益！

export class ReindeerUpgrade {
  constructor(game, helpers) {
    this.game = game;
    this.wrapMat = helpers.mat;
    this.THREE = game.THREE;

    this.boostT = 0;
    this.boostCd = 0;
    this.happyT = 0;
    this.sparkAcc = 0;
    this.interactIdx = 0;
    this.antlerBulbs = [];
    this.crownStar = null;
    this.noseHalo = null;
    this.noseLight = null;
    this.scarfTail = null;
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
    const { animals, world } = this.game;
    if (!animals || !animals.rig) return this;

    const rig = animals.rig;
    const deer = rig.deer;
    const head = deer.part("deer_head");
    const body = deer.part("deer_body") || deer.inner;
    const sledIn = rig.sledIn;

    const plain = (m) => this.wrapMat(m, { key: "plain" });
    const std = (hex, rough = 0.4, extra = {}) =>
      plain(new T.MeshStandardMaterial({ color: hex, roughness: rough, ...extra }));

    const gold = std(0xffd25a, 0.18, { metalness: 0.90 });
    const velvetRed = std(0xc21e28, 0.58);
    const pine = std(0x1f6b3e, 0.65);
    const rubyGlow = plain(new T.MeshStandardMaterial({
      color: 0xff3b3b,
      emissive: new T.Color(1.0, 0.16, 0.12),
      emissiveIntensity: 1.6,
      roughness: 0.12,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    }));
    const warmGlow = plain(new T.MeshStandardMaterial({
      color: 0xffe48c, emissive: new T.Color(1.0, 0.76, 0.24), emissiveIntensity: 1.6, roughness: 0.15
    }));
    const cyanGlow = plain(new T.MeshStandardMaterial({
      color: 0x62f2ff, emissive: new T.Color(0.22, 0.88, 1.0), emissiveIntensity: 1.6, roughness: 0.15
    }));
    const pinkGlow = plain(new T.MeshStandardMaterial({
      color: 0xff80e0, emissive: new T.Color(0.95, 0.34, 0.82), emissiveIntensity: 1.6, roughness: 0.15
    }));

    // =========================================================================
    // 1. REINDEER HEAD UPGRADES: Rudolph Nose Halo, Antler Fairy-Lights & Crown Star!
    // =========================================================================
    if (head) {
      // Soft glowing ruby aura around Rudolph's iconic red nose (exact muzzle tip z = 0.45)
      const noseHalo = this.mesh(new T.SphereGeometry(0.068, 12, 10), rubyGlow, 0, 0.04, 0.45);
      head.add(noseHalo);
      this.noseHalo = noseHalo;

      const noseLight = new T.PointLight(0xff4c3b, 0, 5.5, 1.8);
      noseLight.position.set(0, 0.05, 0.50);
      head.add(noseLight);
      this.noseLight = noseLight;

      // Dainty golden floating star nestled between the reindeer's antlers (antlers span y = 0.30..0.85)!
      const crown = this.mesh(new T.OctahedronGeometry(0.065, 0), gold, 0, 0.68, 0.02);
      head.add(crown);
      this.crownStar = crown;

      // 8 Festive Glowing Fairy Bulbs twinkling gracefully along both antler branches!
      const bulbGeo = new T.SphereGeometry(0.028, 8, 6);
      const bMats = [warmGlow, cyanGlow, pinkGlow, warmGlow];
      const antlerPts = [
        [-0.14, 0.44, 0.04], [-0.24, 0.60, 0.03], [-0.33, 0.74, 0.06], [-0.20, 0.76, -0.04],
        [0.14, 0.44, 0.04], [0.24, 0.60, 0.03], [0.33, 0.74, 0.06], [0.20, 0.76, -0.04]
      ];
      antlerPts.forEach(([bx, by, bz], idx) => {
        const bm = this.mesh(bulbGeo, bMats[idx % bMats.length], bx, by, bz);
        head.add(bm);
        this.antlerBulbs.push({ m: bm, ph: idx * 0.9 });
      });
    }

    // =========================================================================
    // 2. REINDEER NECK UPGRADES: Velvet Collar, 5 Golden Jingle Bells & Winter Scarf!
    // =========================================================================
    if (body) {
      const collarG = new T.Group();
      collarG.position.set(0, 1.00, 0.48);
      collarG.rotation.x = 0.52;
      collarG.add(
        this.mesh(new T.TorusGeometry(0.175, 0.034, 8, 22), velvetRed),
        this.mesh(new T.TorusGeometry(0.185, 0.012, 6, 22), gold)
      );
      const bellGeo = new T.SphereGeometry(0.032, 10, 8);
      for (let i = -2; i <= 2; i++) {
        const a = Math.PI / 2 + i * 0.42;
        collarG.add(this.mesh(bellGeo, gold, Math.cos(a) * 0.205, -Math.sin(a) * 0.205, 0.025));
      }
      // Cozy fluttering red-gold scarf tail draped on the reindeer's side!
      const scarfTail = new T.Group();
      scarfTail.position.set(0.16, -0.05, -0.04);
      scarfTail.add(
        this.mesh(new T.BoxGeometry(0.072, 0.30, 0.022), velvetRed, 0, -0.14, 0),
        this.mesh(new T.BoxGeometry(0.078, 0.045, 0.026), gold, 0, -0.26, 0)
      );
      collarG.add(scarfTail);
      this.scarfTail = scarfTail;
      body.add(collarG);
    }

    // =========================================================================
    // 3. SLEIGH UPGRADES: Glowing Golden Runners, Holly Prow Bow & Gift Bag!
    // =========================================================================
    if (sledIn) {
      for (const side of [-1, 1]) {
        sledIn.add(
          this.mesh(new T.BoxGeometry(0.024, 0.024, 1.85), warmGlow, side * 0.27, 0.048, 0.12),
          this.mesh(new T.SphereGeometry(0.040, 8, 6), gold, side * 0.27, 0.38, 1.25)
        );
      }
      // Festive holly & crimson ribbon bow mounted flush on the front dashboard of the sleigh!
      const bowG = new T.Group();
      bowG.position.set(0, 0.56, 0.86);
      const bL = this.mesh(new T.SphereGeometry(0.085, 10, 8), velvetRed, -0.09, 0, 0);
      const bR = this.mesh(new T.SphereGeometry(0.085, 10, 8), velvetRed, 0.09, 0, 0);
      bL.scale.set(1.25, 0.65, 0.45); bL.rotation.z = 0.25;
      bR.scale.set(1.25, 0.65, 0.45); bR.rotation.z = -0.25;
      bowG.add(
        bL, bR,
        this.mesh(new T.SphereGeometry(0.045, 8, 6), gold, 0, 0, 0.03),
        this.mesh(new T.SphereGeometry(0.055, 8, 6), pine, -0.14, 0.05, -0.02),
        this.mesh(new T.SphereGeometry(0.055, 8, 6), pine, 0.14, 0.05, -0.02)
      );
      sledIn.add(bowG);
    }

    // =========================================================================
    // 4. INTERACTION & SLEIGH TURBO BOOST UPGRADES!
    // =========================================================================
    // Upgrade "摸摸驯鹿" spot to alternate petting & feeding golden winter carrots!
    const petSpotObj = world && world.spots && world.spots.find((s) => s.id === "pet");
    if (petSpotObj) {
      petSpotObj.label = () => (this.interactIdx % 2 === 0 ? "喂驯鹿吃脆甜金胡萝卜" : "摸摸驯鹿 · 摇响铃铛");
      petSpotObj.act = () => this.petOrFeed();
    }

    // Upgrade mount toast to hint the new Sleigh Starlight Boost!
    const origMount = animals.mount.bind(animals);
    animals.mount = () => {
      origMount();
      if (this.game.animals.onSled) {
        this.game.ui.toast("驾驭驯鹿雪橇出发！W 加速、Shift 疾驰，按空格或 U 触发「铃铛星光加速冲刺」喵～", 6);
      }
    };

    // Listen for Space / U while driving the sleigh to trigger Jingle-Bell Turbo Boost!
    addEventListener("keydown", (ev) => {
      if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
      if (!ev.repeat && (ev.code === "Space" || ev.code === "KeyU") && animals.onSled) {
        this.triggerSleighBoost();
      }
    });

    // Upgrade recall (`R 唤鹿`) to work smoothly even across our expanded 216m map!
    const origCall = animals.call.bind(animals);
    animals.call = () => {
      origCall();
      if (rig.auto && this.game.audio.pickupStar) {
        this.game.audio.jingle(0.75);
      }
    };

    return this;
  }

  petOrFeed() {
    const g = this.game;
    const rig = g.animals.rig;
    const isCarrot = this.interactIdx++ % 2 === 0;
    rig.hopV = isCarrot ? 2.4 : 1.75;
    rig.look = 3.2;
    this.happyT = 10.0;
    g.audio.jingle(0.85);
    if (isCarrot && g.audio.pickupStar) g.audio.pickupStar(3);
    g.character && g.character.play(isCarrot ? "cheer" : "happy");

    const head = rig.deer.part("deer_head");
    const hp = head ? head.getWorldPosition(new this.THREE.Vector3()) : rig.deer.root.position;
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      g.sparks.spawn(
        hp.x + Math.cos(a) * 0.25, hp.y + 0.28, hp.z + Math.sin(a) * 0.25,
        Math.cos(a) * 1.4, 0.9 + Math.random() * 1.2, Math.sin(a) * 1.4,
        0.08 + Math.random() * 0.05, 1.0, 0.9 + Math.random() * 0.5,
        isCarrot ? 3.5 : 3.2, isCarrot ? 1.8 : 1.1, isCarrot ? 0.4 : 2.2, -0.2, 0.9
      );
    }
    g.ui.toast(
      isCarrot
        ? "咔嚓咔嚓～驯鹿开心地吃掉了金胡萝卜，红鼻子亮晶晶的，接下来拉雪橇更有劲啦！"
        : ["驯鹿亲昵地蹭了蹭你的掌心，鹿角彩灯一闪一闪的～", "它欢快地晃响了一脖子金铃铛！", "驯鹿开心地原地小跳了一下，想带你去雪原兜风喵～"][Math.floor(Math.random() * 3)],
      4.5
    );
  }

  triggerSleighBoost() {
    const g = this.game, pl = g.player;
    if (!g.animals || !g.animals.onSled || !pl || !pl.ride) return;
    if (this.boostCd > 0) return;
    this.boostT = 1.15;
    this.boostCd = 2.6;
    pl.ride.v = Math.max(pl.ride.v + 5.5, 15.2);
    g.animals.rig.hopV = 1.3;
    g.audio.jingle(1.1);
    if (g.audio.dashWhoosh) g.audio.dashWhoosh(g.avatar === "gemini");
    // Festive snow-gold burst at the reindeer's hooves!
    const rig = g.animals.rig;
    const gy = g.world.groundAt(rig.dx || rig.x, rig.dz || rig.z);
    for (let k = 0; k < 20; k++) {
      const a = Math.random() * Math.PI * 2;
      g.sparks.spawn(
        (rig.dx || rig.x) + Math.cos(a) * 0.6, gy + 0.35, (rig.dz || rig.z) + Math.sin(a) * 0.6,
        Math.cos(a) * 2.4, 1.2 + Math.random() * 1.6, Math.sin(a) * 2.4,
        0.13, 0.95, 0.72, 3.4, 2.5, 0.7, 1.4, 1.2
      );
    }
  }

  update(dt, time) {
    const g = this.game;
    if (!g.animals || !g.animals.ready || !g.animals.rig) return;
    const rig = g.animals.rig;
    const lamps = g.env && g.env.state ? g.env.state.lamps : 0;

    if (this.boostCd > 0) this.boostCd = Math.max(0, this.boostCd - dt);
    if (this.happyT > 0) this.happyT = Math.max(0, this.happyT - dt);

    // Maintain exhilarating sleigh boost velocity & starlight runner trails!
    if (this.boostT > 0) {
      this.boostT = Math.max(0, this.boostT - dt);
      if (g.animals.onSled && g.player.ride) {
        g.player.ride.v = Math.max(g.player.ride.v, 14.5 + 2.0 * (this.boostT / 1.15));
      } else {
        this.boostT = 0;
      }
    } else if (g.animals.onSled && g.player.ride && g.player.ride.v > 4.0) {
      // Gentle overall sleigh cruise enhancement (+18% zippier snow glide, extra boost when carrot-fed!)
      const bonus = this.happyT > 0 ? 1.18 : 1.08;
      const cap = (g.player.keys.has("ShiftLeft") || g.player.keys.has("ShiftRight") ? 11.4 : 7.4) * bonus;
      if (g.player.keys.has("KeyW") || g.player.keys.has("ArrowUp")) {
        g.player.ride.v = Math.min(cap, g.player.ride.v + 2.2 * dt);
      }
    }

    // Animate antler crown star, twinkling fairy bulbs, scarf flutter & Rudolph nose glow!
    if (this.crownStar) {
      this.crownStar.rotation.y = time * 2.0;
      this.crownStar.position.y = 0.68 + Math.sin(time * 3.0) * 0.015;
    }
    for (const b of this.antlerBulbs) {
      const s = 0.85 + 0.25 * Math.sin(time * 4.2 + b.ph);
      b.m.scale.setScalar(s);
    }
    if (this.scarfTail) {
      const spd = Math.abs(rig.v || 0);
      this.scarfTail.rotation.x = 0.15 + Math.min(0.85, spd * 0.08) + Math.sin(time * (4 + spd)) * 0.14;
    }
    const noseBoost = this.boostT > 0 ? 1.0 : this.happyT > 0 ? 0.65 : 0;
    if (this.noseHalo) {
      const sc = 0.92 + 0.18 * Math.sin(time * 5.0) + noseBoost * 0.35;
      this.noseHalo.scale.setScalar(sc);
    }
    if (this.noseLight) {
      this.noseLight.intensity = (0.4 + 2.6 * lamps + noseBoost * 3.5);
    }

    // Starlight snow sparkle trail behind sleigh runners when galloping or boosting!
    const spd = Math.abs(rig.v || 0);
    if (g.animals.onSled && (spd > 7.5 || this.boostT > 0 || this.happyT > 0)) {
      const rate = this.boostT > 0 ? 34 : 12;
      this.sparkAcc += dt * rate;
      while (this.sparkAcc >= 1) {
        this.sparkAcc -= 1;
        const yaw = rig.yaw;
        const rightX = Math.cos(yaw), rightZ = -Math.sin(yaw);
        const side = Math.random() > 0.5 ? 0.42 : -0.42;
        const px = rig.x + rightX * side + Math.sin(yaw) * 0.6;
        const pz = rig.z + rightZ * side + Math.cos(yaw) * 0.6;
        const py = g.world.groundAt(px, pz) + 0.12;
        const isGem = g.avatar === "gemini";
        const pk = isGem && Math.random() > 0.5;
        g.puffs.spawn(
          px, py, pz,
          (Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.7, (Math.random() - 0.5) * 0.6,
          0.085, 0.85, 0.42,
          isGem ? (pk ? 1 : 0.26) : 1.0, isGem ? (pk ? 0.48 : 0.92) : 0.82, isGem ? (pk ? 0.92 : 1.0) : 0.28, 1.2, 1.4
        );
      }
    }
  }
}
