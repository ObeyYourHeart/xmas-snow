// 真实 3D 物理冰湖水体与冰川晶体冰层系统 v3 (Real 3D Gerstner-Wave Glacial Lake + 2.35m Concave Basin + True Fresnel Refraction/Reflection)
// 彻底告别“平面蓝色膜”：2.35m 真实凹陷湖床 + 24cm 立体透光冰崖断面 + 4 向 Gerstner 立体水波 + Schlick 菲涅尔实景天空/极光倒影 + Beer-Lambert 深度透光 + 水草/气泡/14尾锦鲤/随波摇曳浮冰/3环涉水尾波！

export class CrystalPond {
  constructor(game, helpers) {
    this.game = game;
    this.wrapMat = helpers.mat;
    this.pond = helpers.pond;      // j.pond = { x, z, a, b, rot }
    this.iceY = helpers.iceY;      // ii (exact lake elevation)
    this.ni = helpers.ni;          // lake distance field ni(x, z)
    this.Ad = helpers.Ad;          // organic open-water rim radius multiplier Ad(theta)
    this.THREE = game.THREE;

    this.group = null;
    this.waterMesh = null;
    this.bedMesh = null;
    this.iceMesh = null;
    this.iceWall = null;
    this.waterUniforms = null;
    this.iceUniforms = null;
    this.bedUniforms = null;
    this.fish = [];
    this.floes = [];
    this.kelp = [];
    this.bubbles = [];
    this.mistAcc = 0;

    // 3-ring persistent trailing wake buffer behind wading player!
    this.wakes = [
      { x: 0, z: 0, age: 9, str: 0 },
      { x: 0, z: 0, age: 9, str: 0 },
      { x: 0, z: 0, age: 9, str: 0 }
    ];
    this.wakeIdx = 0;
    this.wakeCd = 0;
  }

  // Exact analytical 4-train Gerstner water height matching the vertex shader so floes & wading bob on REAL waves!
  sampleWave(x, z, t) {
    const w = this.game.cold && this.game.cold.water;
    let damp = 1.0;
    if (w) {
      const dx = x - w.x, dz = z - w.z;
      const r = Math.hypot(dx, dz);
      const edge = w.r * this.Ad(Math.atan2(dz, dx)) - r;
      damp = Math.max(0.18, Math.min(1.0, edge / 1.35));
    }
    const h =
      Math.sin(x * 1.15 + z * 0.65 + t * 2.15) * 0.040 +
      Math.sin(x * -0.88 + z * 1.42 - t * 2.55) * 0.028 +
      Math.sin(x * 2.25 - z * 1.85 + t * 3.25) * 0.017 +
      Math.cos(x * 3.10 + z * 2.75 - t * 3.90) * 0.010;
    return h * damp;
  }

  // Exact sculpted 3D concave lakebed depth (0.14m at shallow edge -> 2.35m deep in the center!)
  basinDepth(x, z) {
    const w = this.game.cold && this.game.cold.water;
    if (w) {
      const dx = x - w.x, dz = z - w.z;
      const edgeD = w.r * this.Ad(Math.atan2(dz, dx)) - Math.hypot(dx, dz);
      if (edgeD > -0.6) {
        const u = Math.max(0, Math.min(1, (edgeD + 0.15) / 4.2));
        const smooth = u * u * (3 - 2 * u);
        const undul = 0.12 * Math.sin(x * 0.65) * Math.cos(z * 0.58);
        return Math.max(0.14, 0.16 + 2.18 * smooth + undul * smooth);
      }
    }
    // Under frozen crystal-ice region: clean 0.35m -> 1.25m glacial basin
    const n = this.ni(x, z);
    const uIce = Math.max(0, Math.min(1, (1.03 - n) / 0.35));
    return 0.20 + 1.05 * (uIce * uIce * (3 - 2 * uIce));
  }

  build() {
    const T = this.THREE;
    const { scene, cold, terrain } = this.game;
    const p = this.pond;
    const w = cold.water; // { x, z, r }
    const y0 = this.iceY;

    // 1) Cleanly retire old flat matte ice quad, old dark pondwater sticker & snow-cube rim
    if (terrain && terrain.ice) {
      terrain.ice.visible = false;
    }
    if (cold) {
      for (const fl of cold.floes || []) {
        if (fl.m) fl.m.visible = false;
      }
      for (const ch of scene.children) {
        if (!ch.isMesh) continue;
        const cpk = ch.material && ch.material.customProgramCacheKey ? String(ch.material.customProgramCacheKey()) : "";
        const isOldWater =
          cpk.includes("pondwater") ||
          (ch.geometry && ch.geometry.type === "ShapeGeometry" &&
            Math.hypot(ch.position.x - w.x, ch.position.z - w.z) < 0.8 &&
            Math.abs(ch.position.y - y0) < 0.25);
        if (isOldWater) {
          ch.visible = false;
        } else if (
          ch.geometry && ch.geometry.type === "BoxGeometry" &&
          ch.material === this.game.mats.M_snow &&
          Math.hypot(ch.position.x - w.x, ch.position.z - w.z) < w.r * 1.65 &&
          Math.abs(ch.position.y - y0) < 0.35
        ) {
          ch.visible = false;
        }
      }
    }

    const root = this.group = new T.Group();
    root.name = "crystal_pond";
    scene.add(root);

    // Shared real-time shader uniforms synced with live sky dome & wading wake rings
    const uNight = { value: 0 };
    const uAurora = { value: 0 };
    const uZenith = { value: new T.Color(0.14, 0.32, 0.66) };
    const uHorizon = { value: new T.Color(0.62, 0.76, 0.92) };
    const uPool = { value: new T.Vector4(w.x, w.z, w.r, y0) };
    const uPond = { value: new T.Vector4(p.x, p.z, p.a, p.b) };
    const uPondRot = { value: p.rot };
    const uWake0 = { value: new T.Vector4(w.x, w.z, 9.0, 0.0) };
    const uWake1 = { value: new T.Vector4(w.x, w.z, 9.0, 0.0) };
    const uWake2 = { value: new T.Vector4(w.x, w.z, 9.0, 0.0) };
    this.waterUniforms = { uNight, uAurora, uZenith, uHorizon, uPool, uWake0, uWake1, uWake2 };
    this.iceUniforms = { uNight, uAurora, uZenith, uHorizon, uPool, uPond, uPondRot };
    this.bedUniforms = { uNight, uPool };

    // Shared GLSL helpers (exact JS Ad(theta) match + Voronoi caustics + 4-train Gerstner wave + basin depth!)
    const glslCommon = `
      float pondAd_(float a) {
        return 1.0 + 0.2 * sin(3.0 * a + 0.7) + 0.1 * sin(5.0 * a + 2.1) + 0.06 * sin(9.0 * a);
      }
      float pondPoolSigned_(vec2 xz, vec4 pool) {
        vec2 d = xz - pool.xy;
        float r = length(d);
        float a = atan(d.y, d.x);
        return r - pool.z * pondAd_(a);
      }
      float pondWaterDepth_(vec2 xz, vec4 pool) {
        float edgeD = -pondPoolSigned_(xz, pool);
        float u = clamp((edgeD + 0.15) / 4.2, 0.0, 1.0);
        float s = u * u * (3.0 - 2.0 * u);
        float und = 0.12 * sin(xz.x * 0.65) * cos(xz.y * 0.58);
        return max(0.14, 0.16 + 2.18 * s + und * s);
      }
      float pondHash_(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      vec2 pondVoronoi_(vec2 x) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float md = 8.0, md2 = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = vec2(pondHash_(n + g), pondHash_(n + g + vec2(37.2, 17.9)));
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < md) { md2 = md; md = d; }
            else if (d < md2) { md2 = d; }
          }
        }
        return vec2(sqrt(md), sqrt(md2) - sqrt(md));
      }
    `;

    // =========================================================================
    // LAYER 1: TRUE 3D CONCAVE SCULPTED LAKEBED (0.14m rim -> 2.35m deep center!)
    //          + Wet Pebbles, Sloped Boulders, Swaying Kelp, Bubbles & 14 Swimming Fish
    // =========================================================================
    {
      const rings = 20, segs = 72;
      const bPos = [], bUvs = [], bIdx = [];
      const rimRadii = [];
      for (let s = 0; s < segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        let lo = 2, hi = 30;
        for (let k = 0; k < 10; k++) {
          const mid = (lo + hi) * 0.5;
          if (this.ni(p.x + Math.cos(a) * mid, p.z + Math.sin(a) * mid) < 1.05) lo = mid;
          else hi = mid;
        }
        rimRadii.push(lo);
      }

      // Center vertex of basin
      const cDepth = this.basinDepth(p.x, p.z);
      bPos.push(0, -cDepth, 0);
      bUvs.push(0.5, 0.5);

      for (let r = 1; r <= rings; r++) {
        const frac = r / rings;
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const rad = rimRadii[s] * frac;
          const lx = Math.cos(a) * rad;
          const lz = Math.sin(a) * rad;
          const wx = p.x + lx;
          const wz = p.z + lz;
          const dep = this.basinDepth(wx, wz);
          bPos.push(lx, -dep, lz);
          bUvs.push(0.5 + Math.cos(a) * 0.5 * frac, 0.5 + Math.sin(a) * 0.5 * frac);
        }
      }
      for (let s = 0; s < segs; s++) {
        bIdx.push(0, 1 + ((s + 1) % segs), 1 + s);
      }
      for (let r = 1; r < rings; r++) {
        const row0 = 1 + (r - 1) * segs;
        const row1 = 1 + r * segs;
        for (let s = 0; s < segs; s++) {
          const sn = (s + 1) % segs;
          bIdx.push(row0 + s, row0 + sn, row1 + sn, row0 + s, row1 + sn, row1 + s);
        }
      }
      const bedGeo = new T.BufferGeometry();
      bedGeo.setAttribute("position", new T.Float32BufferAttribute(bPos, 3));
      bedGeo.setAttribute("uv", new T.Float32BufferAttribute(bUvs, 2));
      bedGeo.setIndex(bIdx);
      bedGeo.computeVertexNormals();

      const bedMat = this.wrapMat(new T.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.90,
        metalness: 0.0
      }), {
        key: "crystal_pond_bed_v3",
        uniforms: { uNight, uPool },
        fragPars: `uniform float uNight; uniform vec4 uPool;\n${glslCommon}`,
        fragColor: `#include <color_fragment>
        {
          vec2 bp = vWPos.xz;
          float depth = max(0.05, uPool.w - vWPos.y);
          float n1 = texture2D(uNoise, bp * 0.09).r;
          float n2 = texture2D(uNoise, bp * 0.36).g;
          float peb = smoothstep(0.30, 0.78, texture2D(uNoise, bp * 1.15).r);
          float grit = texture2D(uNoise, bp * 2.8).b;

          // Natural sunlit sandy-pebble glacial riverbed at shallow bank -> luminous turquoise-teal deep center
          vec3 sandCol = vec3(0.56, 0.60, 0.58);
          vec3 wetPebCol = vec3(0.32, 0.42, 0.45);
          vec3 deepSiltCol = vec3(0.06, 0.22, 0.30);
          float shallowK = exp(-depth * 0.72);
          vec3 col = mix(deepSiltCol, sandCol, shallowK * 0.88 + n1 * 0.18);
          col = mix(col, wetPebCol, peb * 0.45 + grit * 0.12);

          // Real Beer-Lambert underwater light tint (bright alpine glacier clarity, never muddy black!)
          vec3 waterTint = exp(-depth * vec3(0.55, 0.17, 0.10));
          col *= mix(vec3(0.68, 0.92, 0.98), waterTint, 0.78);

          // Soft organic dancing sunlit caustic light-pools (NO sharp spiderweb wireframe lines!)
          float poolD = pondPoolSigned_(bp, uPool);
          float inOpen = 1.0 - smoothstep(-0.4, 1.8, poolD);
          float cw1 = sin(bp.x * 1.9 + sin(bp.y * 1.45 + uTime * 1.55) * 1.2 + uTime * 1.15);
          float cw2 = sin(bp.y * 2.15 - cos(bp.x * 1.65 - uTime * 1.35) * 1.15 - uTime * 0.95);
          float cw3 = sin((bp.x + bp.y) * 2.4 + uTime * 1.8) * cos((bp.x - bp.y) * 1.85 - uTime * 1.45);
          float caust = pow(clamp(0.5 + 0.5 * cw1 * cw2, 0.0, 1.0), 3.2) * 0.85
                      + pow(clamp(0.5 + 0.5 * cw3, 0.0, 1.0), 4.0) * 0.55;
          float caustDepthFade = exp(-depth * 0.35);
          vec3 caustCol = mix(vec3(0.58, 0.95, 1.0), vec3(0.20, 0.88, 0.82), uNight);
          col += caustCol * caust * caustDepthFade * (0.28 + 0.72 * inOpen) * (1.0 - 0.45 * uNight) * (0.75 + 0.25 * n2);
          diffuseColor.rgb = col;
        }`
      });

      this.bedMesh = new T.Mesh(bedGeo, bedMat);
      this.bedMesh.position.set(p.x, y0, p.z);
      this.bedMesh.receiveShadow = true;
      this.bedMesh.matrixAutoUpdate = false;
      this.bedMesh.updateMatrix();
      root.add(this.bedMesh);

      // 52 Sculpted Wet River Boulders & Stones resting accurately on the 3D sloped basin floor!
      const rockGeo = new T.DodecahedronGeometry(0.42, 1);
      const rockMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.28, 0.36, 0.40),
        roughness: 0.62,
        metalness: 0.04
      }), { key: "plain" });
      const mossRockMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.20, 0.34, 0.32),
        roughness: 0.72,
        metalness: 0.02
      }), { key: "plain" });

      for (let i = 0; i < 52; i++) {
        const ang = i * 2.39996;
        const inPool = i < 30;
        const rad = inPool ? (0.12 + ((i * 0.31) % 0.84)) * w.r : (2.2 + ((i * 0.61) % 1.0) * 11.2);
        const rx = (inPool ? w.x : p.x) + Math.cos(ang) * rad;
        const rz = (inPool ? w.z : p.z) + Math.sin(ang) * rad * (inPool ? 1.0 : 0.72);
        if (this.ni(rx, rz) > 0.96) continue;
        const dep = this.basinDepth(rx, rz);
        const rm = new T.Mesh(rockGeo, i % 3 === 0 ? mossRockMat : rockMat);
        const sc = 0.42 + ((i * 0.29) % 0.95);
        rm.scale.set(sc * 1.25, sc * 0.52, sc * 0.95);
        rm.position.set(rx, y0 - dep + sc * 0.10, rz);
        rm.rotation.set(i * 0.4, i * 1.1, i * 0.2);
        root.add(rm);
      }

      // Luminous Underwater Frost-Quartz Crystals resting on the basin floor
      const crysGeo = new T.OctahedronGeometry(0.20, 0);
      const crysMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.48, 0.95, 1.0),
        emissive: new T.Color(0.14, 0.72, 0.92),
        emissiveIntensity: 0.68,
        roughness: 0.16,
        transparent: true,
        opacity: 0.82
      }), { key: "plain" });
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.3;
        const rad = (0.30 + (i % 3) * 0.24) * w.r;
        const cx = w.x + Math.cos(ang) * rad;
        const cz = w.z + Math.sin(ang) * rad;
        const dep = this.basinDepth(cx, cz);
        const cm = new T.Mesh(crysGeo, crysMat);
        cm.scale.set(0.65, 1.55, 0.65);
        cm.position.set(cx, y0 - dep + 0.14, cz);
        cm.rotation.set(0.2 * Math.sin(i), i * 0.9, 0.2 * Math.cos(i));
        root.add(cm);
      }

      // 24 Swaying Translucent Underwater Aquatic Kelp Blades waving gently in the current!
      const kelpGeo = new T.PlaneGeometry(0.14, 0.85, 1, 3);
      kelpGeo.translate(0, 0.425, 0);
      const kelpMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.12, 0.48, 0.42),
        roughness: 0.65,
        side: T.DoubleSide
      }), { key: "plain" });
      for (let i = 0; i < 24; i++) {
        const ang = i * 2.1 + 0.4;
        const rad = (0.22 + ((i * 0.37) % 0.66)) * w.r;
        const kx = w.x + Math.cos(ang) * rad;
        const kz = w.z + Math.sin(ang) * rad;
        const dep = this.basinDepth(kx, kz);
        if (dep < 0.45) continue;
        const hScale = Math.min(1.25, (dep - 0.22) * 0.68);
        const km = new T.Mesh(kelpGeo, kelpMat);
        km.position.set(kx, y0 - dep + 0.02, kz);
        km.scale.set(0.85 + (i % 3) * 0.22, hScale, 1);
        km.rotation.y = i * 1.3;
        root.add(km);
        this.kelp.push({ m: km, baseRy: i * 1.3, ph: i * 1.17 });
      }

      // 18 Rising Underwater Air Bubbles floating slowly from the basin floor to the waves!
      const bubGeo = new T.SphereGeometry(0.036, 7, 6);
      const bubMat = new T.MeshBasicMaterial({
        color: 0xe6fbff,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      });
      for (let i = 0; i < 18; i++) {
        const ang = i * 1.93;
        const rad = (0.14 + ((i * 0.41) % 0.70)) * w.r;
        const bx = w.x + Math.cos(ang) * rad;
        const bz = w.z + Math.sin(ang) * rad;
        const dep = this.basinDepth(bx, bz);
        const bm = new T.Mesh(bubGeo, bubMat);
        bm.scale.setScalar(0.6 + (i % 4) * 0.28);
        root.add(bm);
        this.bubbles.push({
          m: bm, bx, bz, dep,
          prog: (i * 0.17) % 1.0,
          spd: 0.18 + (i % 4) * 0.055,
          ph: i * 2.1
        });
      }

      // 14 Animated Swimming Winter Koi & Silver Glacier Trout at real multi-tier 3D depths!
      const fishBodyGeo = new T.SphereGeometry(0.115, 10, 8);
      const fishTailGeo = new T.ConeGeometry(0.085, 0.20, 4).rotateX(Math.PI / 2);
      const koiColors = [0xff6d36, 0xffd252, 0x70f0ff, 0xff92de, 0xf6fbff, 0xff9c5a, 0x9be4ff];
      for (let i = 0; i < 14; i++) {
        const inPool = i < 10;
        const fg = new T.Group();
        const col = koiColors[i % koiColors.length];
        const fMat = this.wrapMat(new T.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.24,
          roughness: 0.22
        }), { key: "plain" });
        const body = new T.Mesh(fishBodyGeo, fMat);
        body.scale.set(0.52, 0.62, 1.92);
        const tail = new T.Mesh(fishTailGeo, fMat);
        tail.position.z = -0.23;
        fg.add(body, tail);
        fg.scale.setScalar(0.85 + (i % 3) * 0.22);
        root.add(fg);
        this.fish.push({
          g: fg,
          tail,
          cx: inPool ? w.x : p.x + 3.0,
          cz: inPool ? w.z : p.z - 1.5,
          rx: inPool ? w.r * (0.20 + (i % 4) * 0.14) : 3.4 + (i % 3) * 1.6,
          rz: inPool ? w.r * (0.18 + ((i + 1) % 4) * 0.13) : 2.2 + ((i + 1) % 3) * 1.2,
          // Multi-tier real underwater depths (-0.36m shallow -> -1.38m deep!)
          y: y0 - (inPool ? 0.36 + (i % 5) * 0.24 : 0.42 + (i % 2) * 0.16),
          spd: (0.24 + (i % 5) * 0.075) * (i % 2 ? 1 : -1),
          ph: i * 1.37
        });
      }
    }

    // =========================================================================
    // LAYER 2: 3D VERTICAL TRANSLUCENT GLACIAL ICE-SHELF CLIFF WALL (24cm THICK!)
    //          Gives unmistakable 3D physical ice thickness floating over deep liquid water!
    // =========================================================================
    {
      const segs = 80;
      const wPos = [], wUvs = [], wIdx = [];
      const topY = y0 + 0.032;
      const botY = y0 - 0.22;
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        const rad = w.r * this.Ad(a) + 0.02;
        const x = w.x + Math.cos(a) * rad;
        const z = w.z + Math.sin(a) * rad;
        const u = (s / segs) * 12;
        wPos.push(x, topY, z, x, botY, z);
        wUvs.push(u, 1, u, 0);
      }
      for (let s = 0; s < segs; s++) {
        const i0 = s * 2;
        // Faces inward toward open water so player sees the glowing translucent vertical ice wall!
        wIdx.push(i0, i0 + 2, i0 + 1, i0 + 1, i0 + 2, i0 + 3);
      }
      const wallGeo = new T.BufferGeometry();
      wallGeo.setAttribute("position", new T.Float32BufferAttribute(wPos, 3));
      wallGeo.setAttribute("uv", new T.Float32BufferAttribute(wUvs, 2));
      wallGeo.setIndex(wIdx);
      wallGeo.computeVertexNormals();

      const wallMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.46, 0.86, 0.98),
        emissive: new T.Color(0.08, 0.34, 0.48),
        emissiveIntensity: 0.36,
        roughness: 0.16,
        metalness: 0.04,
        transparent: true,
        opacity: 0.82,
        side: T.DoubleSide
      }), { key: "plain" });

      this.iceWall = new T.Mesh(wallGeo, wallMat);
      this.iceWall.renderOrder = 2;
      this.iceWall.matrixAutoUpdate = false;
      this.iceWall.updateMatrix();
      root.add(this.iceWall);
    }

    // =========================================================================
    // LAYER 3: MULTI-LAYER PARALLAX GLACIAL CRYSTAL ICE SURFACE (Frozen Half of Lake)
    // =========================================================================
    {
      const iceGeo = new T.PlaneGeometry(p.a * 2.85, p.a * 2.85, 56, 56);
      iceGeo.rotateX(-Math.PI / 2);

      const iceMat = this.wrapMat(new T.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.11,
        metalness: 0.02,
        envMapIntensity: 0.9,
        transparent: true,
        opacity: 0.84,
        depthWrite: false
      }), {
        key: "crystal_glacial_ice_v3",
        uniforms: { uNight, uAurora, uZenith, uHorizon, uPool, uPond, uPondRot },
        fragPars: `
          uniform float uNight, uAurora, uPondRot;
          uniform vec3 uZenith, uHorizon;
          uniform vec4 uPool, uPond;
          ${glslCommon}
          float pondNi_(vec2 xz) {
            vec2 d = xz - uPond.xy;
            float c = cos(uPondRot), s = sin(uPondRot);
            vec2 e = vec2((d.x * c + d.y * s) / uPond.z, (-d.x * s + d.y * c) / uPond.w);
            float n = 1.0 + 0.3 * (texture2D(uNoise, xz * 0.015 + vec2(0.21, 0.43)).r - 0.5);
            return length(e) / max(0.75, n);
          }
        `,
        fragColor: `#include <color_fragment>
        {
          vec2 wp = vWPos.xz;
          float poolSigned = pondPoolSigned_(wp, uPool);
          if (poolSigned < -0.02) discard;

          vec3 V = normalize(cameraPosition - vWPos);
          vec2 para1 = -V.xz / max(V.y + 0.32, 0.40) * 0.28;
          vec2 para2 = -V.xz / max(V.y + 0.32, 0.40) * 0.56;

          vec2 vSurf = pondVoronoi_(wp * 0.36 + texture2D(uNoise, wp * 0.12).rg * 0.36);
          float crackSurf = 1.0 - smoothstep(0.0, 0.042, vSurf.y);

          vec2 vDeep = pondVoronoi_((wp + para1) * 0.28 + vec2(4.2, 1.9));
          float crackDeep = 1.0 - smoothstep(0.0, 0.068, vDeep.y);

          vec2 vBub1 = pondVoronoi_((wp + para1 * 0.75) * 1.95);
          vec2 vBub2 = pondVoronoi_((wp + para2) * 1.35 + vec2(9.1, 3.7));
          float bub1 = (1.0 - smoothstep(0.04, 0.17, vBub1.x)) * smoothstep(0.42, 0.76, texture2D(uNoise, wp * 0.22).r);
          float bub2 = (1.0 - smoothstep(0.05, 0.19, vBub2.x)) * smoothstep(0.40, 0.74, texture2D(uNoise, (wp + para2) * 0.20).g);

          float frostNoise = texture2D(uNoise, wp * 0.085).r * 0.65 + texture2D(uNoise, wp * 0.26).g * 0.35;
          float niEst = pondNi_(wp);
          float shoreFrost = smoothstep(0.84, 1.03, niEst);
          float holeEdge = 1.0 - smoothstep(0.0, 0.50, poolSigned);
          float snowDrift = smoothstep(0.76, 0.96, frostNoise * 0.75 + shoreFrost * 0.55);

          vec3 deepIce = mix(vec3(0.05, 0.24, 0.44), vec3(0.025, 0.12, 0.26), uNight);
          vec3 midIce  = mix(vec3(0.14, 0.48, 0.72), vec3(0.07, 0.26, 0.46), uNight);
          vec3 frostCol = mix(vec3(0.78, 0.92, 0.99), vec3(0.38, 0.58, 0.80), uNight);

          vec3 col = mix(deepIce, midIce, clamp(frostNoise * 0.78 + 0.12, 0.0, 1.0));
          col = mix(col, vec3(0.42, 0.86, 1.0), crackDeep * 0.68);
          col = mix(col, vec3(0.94, 0.99, 1.0), crackSurf * 0.85);
          col += vec3(0.76, 0.94, 1.0) * (bub1 * 0.48 + bub2 * 0.34);
          col = mix(col, frostCol, clamp(snowDrift * 0.58 + holeEdge * 0.48, 0.0, 0.78));

          float fres = pow(1.0 - max(dot(V, vec3(0.0, 1.0, 0.0)), 0.0), 3.4);
          diffuseColor.rgb = col;
          diffuseColor.a = clamp(0.64 + 0.26 * fres + crackSurf * 0.20 + snowDrift * 0.16 + holeEdge * 0.18, 0.62, 0.95);
        }`,
        fragNormal: `{
          vec2 wp = vWPos.xz;
          float nA = texture2D(uNoise, wp * 0.45).r;
          float nB = texture2D(uNoise, wp * 1.15 + vec2(0.3, 0.7)).g;
          float skate = sin(wp.x * 2.6 + wp.y * 1.9 + nA * 6.0) * 0.025;
          vec3 wn = normalize(vec3((nA - 0.5) * 0.11 + skate, 1.0, (nB - 0.5) * 0.11 - skate));
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`,
        fragEnd: `{
          vec3 V_ = normalize(cameraPosition - vWPos);
          float fres_ = pow(1.0 - max(V_.y, 0.0), 4.0);
          vec3 skyRef = mix(uHorizon, uZenith, 0.35);
          float aurWave = 0.5 + 0.5 * sin(vWPos.x * 0.16 + vWPos.z * 0.11 + uTime * 0.55);
          vec3 aurRef = mix(vec3(0.12, 0.96, 0.72), vec3(0.74, 0.32, 0.98), aurWave) * uAurora * 0.95;
          vec3 H_ = normalize(V_ + normalize(uSunDir));
          float spec_ = pow(max(H_.y, 0.0), 110.0) * (1.0 - uNight * 0.7);
          float microGlint = pow(texture2D(uNoise, vWPos.xz * 2.8 + V_.xz * 0.4).r, 11.0) * 1.6;
          outgoingLight += skyRef * fres_ * 0.28 + aurRef * (0.16 + 0.65 * fres_) + uFogSun * (spec_ * 0.95 + microGlint * 0.28 * (1.0 - uNight * 0.5));
        }`
      });

      this.iceMesh = new T.Mesh(iceGeo, iceMat);
      this.iceMesh.position.set(p.x, y0 + 0.008, p.z);
      this.iceMesh.receiveShadow = true;
      this.iceMesh.renderOrder = 2;
      this.iceMesh.matrixAutoUpdate = false;
      this.iceMesh.updateMatrix();
      root.add(this.iceMesh);
    }

    // =========================================================================
    // LAYER 4: REALISTIC 3D GERSTNER-WAVE LIQUID WATER SURFACE (ZERO "BLUE FILM"!)
    //          True Beer-Lambert optical clarity + Schlick Fresnel sky/pine/aurora mirror + GGX sun glitter!
    // =========================================================================
    const waterMat = this.wrapMat(new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.02,
      envMapIntensity: 0.65,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    }), {
      key: "crystal_pond_water_v3",
      uniforms: { uNight, uAurora, uZenith, uHorizon, uPool, uWake0, uWake1, uWake2 },
      vertPars: `
        uniform vec4 uPool, uWake0, uWake1, uWake2;
        varying float vWaveH;
        float vPondAd_(float a) {
          return 1.0 + 0.2 * sin(3.0 * a + 0.7) + 0.1 * sin(5.0 * a + 2.1) + 0.06 * sin(9.0 * a);
        }
        float vWakeH_(vec2 wp, vec4 wk) {
          if (wk.w <= 0.01) return 0.0;
          float d = length(wp - wk.xy);
          float r = wk.z * 2.65;
          return sin((d - r) * 10.5) * exp(-abs(d - r) * 2.2) * exp(-wk.z * 0.95) * wk.w * 0.036;
        }
      `,
      vertBegin: `{
        vec3 wp_ = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vec2 dp_ = wp_.xz - uPool.xy;
        float ed_ = uPool.z * vPondAd_(atan(dp_.y, dp_.x)) - length(dp_);
        float damp_ = clamp(ed_ / 1.35, 0.18, 1.0);

        // 4 crossing Gerstner-like 3D rolling swells + horizontal crest sharpening!
        float p1_ = wp_.x * 1.15 + wp_.z * 0.65 + uTime * 2.15;
        float p2_ = wp_.x * -0.88 + wp_.z * 1.42 - uTime * 2.55;
        float p3_ = wp_.x * 2.25 - wp_.z * 1.85 + uTime * 3.25;
        float p4_ = wp_.x * 3.10 + wp_.z * 2.75 - uTime * 3.90;

        float h_ = (sin(p1_) * 0.040 + sin(p2_) * 0.028 + sin(p3_) * 0.017 + cos(p4_) * 0.010) * damp_;
        h_ += vWakeH_(wp_.xz, uWake0) + vWakeH_(wp_.xz, uWake1) + vWakeH_(wp_.xz, uWake2);

        // Subtle Gerstner horizontal orbital pinch at wave crests
        transformed.x += (cos(p1_) * 0.022 - cos(p2_) * 0.014) * damp_;
        transformed.z += (cos(p1_) * 0.012 + cos(p2_) * 0.020) * damp_;
        transformed.y += h_;
        vWaveH = h_;
      }`,
      fragPars: `
        uniform float uNight, uAurora;
        uniform vec3 uZenith, uHorizon;
        uniform vec4 uPool, uWake0, uWake1, uWake2;
        varying float vWaveH;
        ${glslCommon}
        vec2 wakeGrad_(vec2 wp, vec4 wk, out float ringOut) {
          ringOut = 0.0;
          if (wk.w <= 0.01) return vec2(0.0);
          vec2 d = wp - wk.xy;
          float l = length(d) + 0.001;
          float r = wk.z * 2.65;
          float env = exp(-abs(l - r) * 2.3) * exp(-wk.z * 0.92) * wk.w;
          ringOut = env * (0.5 + 0.5 * cos((l - r) * 11.0));
          float sl = cos((l - r) * 11.0) * env * 0.58;
          return (d / l) * sl;
        }
      `,
      fragColor: `#include <color_fragment>
      {
        vec2 wp = vWPos.xz;
        float edgeD = -pondPoolSigned_(wp, uPool); // >0 inside open water
        float depth = pondWaterDepth_(wp, uPool);  // 0.14m edge -> 2.35m deep center

        // Real Beer-Lambert volume color (glass-clear sunlit alpine emerald -> vivid glacier sapphire!)
        vec3 deepCol = mix(vec3(0.024, 0.195, 0.315), vec3(0.010, 0.068, 0.145), uNight);
        vec3 midCol  = mix(vec3(0.068, 0.42, 0.54),   vec3(0.024, 0.18, 0.28),  uNight);
        float deepK = 1.0 - exp(-depth * 0.78);
        vec3 volCol = mix(midCol, deepCol, deepK);

        // Subsurface sunlit emerald-turquoise scattering through curling 3D wave crests!
        float sss = clamp(vWaveH * 16.0, 0.0, 1.0) * (1.0 - uNight * 0.62);
        volCol += vec3(0.10, 0.52, 0.58) * sss * 0.65;

        // Delicate airy shoreline foam lapping organically right along the broken ice shelf!
        float fN1 = texture2D(uNoise, wp * 1.65 + vec2(uTime * 0.09, -uTime * 0.07)).r;
        float fN2 = texture2D(uNoise, wp * 3.40 - vec2(uTime * 0.12, uTime * 0.10)).g;
        float foamEdge = edgeD - vWaveH * 2.6 + (fN1 - 0.5) * 0.18;
        float shoreFoam = smoothstep(0.24, 0.01, foamEdge) * smoothstep(0.32, 0.76, fN1 * 0.52 + fN2 * 0.55);

        // Soft trailing white foam arcs from wading wakes
        float r0, r1, r2;
        wakeGrad_(wp, uWake0, r0);
        wakeGrad_(wp, uWake1, r1);
        wakeGrad_(wp, uWake2, r2);
        float wakeFoam = clamp((r0 + r1 + r2) * 0.72, 0.0, 0.80);

        vec3 foamCol = mix(vec3(0.95, 0.99, 1.0), vec3(0.56, 0.74, 0.88), uNight);
        vec3 col = mix(volCol, foamCol, clamp(shoreFoam * 0.82 + wakeFoam * 0.62, 0.0, 0.90));

        // CRYSTAL-CLEAR LIQUID WATER TRANSPARENCY:
        // Looking straight down -> ultra-clear glass water (0.16 edge -> 0.50 center) showing sandy pebbles, kelp & koi!
        // Looking across at grazing angle -> luminous sky & sunset mirror reflection!
        vec3 V_ = normalize(cameraPosition - vWPos);
        float ndv = clamp(V_.y, 0.0, 1.0);
        float fres = 0.02 + 0.98 * pow(1.0 - ndv, 4.4);
        float beerAlpha = 1.0 - exp(-depth * 0.36);
        float alpha = clamp(mix(beerAlpha * 0.72, 0.94, fres) + shoreFoam * 0.48 + wakeFoam * 0.32, 0.16, 0.94);

        diffuseColor.rgb = col;
        diffuseColor.a = alpha;
      }`,
      fragNormal: `{
        vec2 wp = vWPos.xz;
        float edgeD = -pondPoolSigned_(wp, uPool);
        float damp = clamp(edgeD / 1.35, 0.18, 1.0);

        // Analytical partial derivatives of the exact 4 Gerstner swells!
        float p1 = wp.x * 1.15 + wp.y * 0.65 + uTime * 2.15;
        float p2 = wp.x * -0.88 + wp.y * 1.42 - uTime * 2.55;
        float p3 = wp.x * 2.25 - wp.y * 1.85 + uTime * 3.25;
        float p4 = wp.x * 3.10 + wp.y * 2.75 - uTime * 3.90;

        float gx = (cos(p1)*1.15*0.040 + cos(p2)*(-0.88)*0.028 + cos(p3)*2.25*0.017 - sin(p4)*3.10*0.010) * damp * 2.4;
        float gz = (cos(p1)*0.65*0.040 + cos(p2)*1.42*0.028 + cos(p3)*(-1.85)*0.017 - sin(p4)*2.75*0.010) * damp * 2.4;

        // 3 scrolling high-frequency capillary liquid ripple octaves (crisp shimmering water micro-surface!)
        vec2 n1 = texture2D(uNoise, wp * 0.42 + uTime * vec2(0.068, 0.041)).rg - 0.5;
        vec2 n2 = texture2D(uNoise, wp * 1.12 - uTime * vec2(0.052, 0.078)).gb - 0.5;
        vec2 n3 = texture2D(uNoise, wp * 2.65 + uTime * vec2(0.095, -0.064)).rb - 0.5;
        gx += n1.x * 0.28 + n2.x * 0.20 + n3.x * 0.11;
        gz += n1.y * 0.28 + n2.y * 0.20 + n3.y * 0.11;

        // Add interactive 3-ring wading wake wave normals!
        float t0, t1, t2;
        vec2 wg = wakeGrad_(wp, uWake0, t0) + wakeGrad_(wp, uWake1, t1) + wakeGrad_(wp, uWake2, t2);
        gx += wg.x;
        gz += wg.y;

        vec3 wn_ = normalize(vec3(-gx, 1.0, -gz));
        normal = normalize((viewMatrix * vec4(wn_, 0.0)).xyz);
      }`,
      fragEnd: `{
        vec3 V_ = normalize(cameraPosition - vWPos);
        vec3 Nw_ = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
        float ndv_ = clamp(dot(V_, Nw_), 0.0, 1.0);
        // True physical water Schlick Fresnel (F0 = 0.02)!
        float fres_ = 0.02 + 0.98 * pow(1.0 - ndv_, 5.0);

        // True reflected sky, distant snowy mountains & pine treeline silhouette!
        vec3 R_ = reflect(-V_, Nw_);
        float ry_ = clamp(R_.y, 0.0, 1.0);
        vec3 skyRef = mix(uHorizon, uZenith, pow(ry_, 0.55));
        // Subtle reflected dark-spruce winter shoreline band near grazing horizon (makes water look 100% real!)
        float treeNoise = texture2D(uNoise, vec2(atan(R_.z, R_.x) * 2.2, 0.3)).r;
        float treeBand = smoothstep(0.24, 0.04, ry_ + (treeNoise - 0.5) * 0.09);
        vec3 treeCol = mix(vec3(0.11, 0.19, 0.24), vec3(0.04, 0.08, 0.14), uNight);
        skyRef = mix(skyRef, treeCol, treeBand * 0.45);

        // Vivid dancing aurora ribbon mirror reflection across the 3D water swells at night!
        float aurW = 0.5 + 0.5 * sin(vWPos.x * 0.22 + vWPos.z * 0.18 + uTime * 0.85 + Nw_.x * 5.2);
        vec3 aurRef = mix(vec3(0.12, 0.98, 0.72), vec3(0.76, 0.34, 0.98), aurW) * uAurora * 1.25;

        // Crisp dual-lobe GGX-like sunlight & moonlight glitter sparkling on wave facets!
        vec3 L_ = normalize(uSunDir);
        vec3 H_ = normalize(V_ + L_);
        float ndh_ = max(dot(Nw_, H_), 0.0);
        float specSharp = pow(ndh_, 240.0) * (1.0 - uNight * 0.42);
        float specBroad = pow(ndh_, 36.0) * 0.24 * (1.0 - uNight * 0.55);
        float moonGlint = pow(max(dot(Nw_, normalize(V_ + vec3(-0.32, 0.68, 0.44))), 0.0), 140.0) * (0.35 + 0.75 * uNight);

        // Blend true mirror reflection via Schlick Fresnel (crystal clear straight down -> luminous mirror across!)
        outgoingLight = mix(outgoingLight, skyRef, clamp(fres_ * 0.86, 0.02, 0.88));
        outgoingLight += aurRef * (0.14 + 0.72 * fres_) + uFogSun * (specSharp * 3.4 + specBroad) + vec3(0.75, 0.90, 1.0) * moonGlint * 0.85;
      }`
    });

    // High-resolution organic water disc (22 rings x 84 segs) so 3D Gerstner waves & wakes roll smoothly!
    {
      const rings = 22, segs = 84;
      const pos = [], uvs = [], idx = [];
      pos.push(0, 0, 0);
      uvs.push(0.5, 0.5);
      for (let r = 1; r <= rings; r++) {
        const frac = r / rings;
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const rad = (w.r * this.Ad(a) + 0.06) * frac;
          pos.push(Math.cos(a) * rad, 0, Math.sin(a) * rad);
          uvs.push(0.5 + Math.cos(a) * 0.5 * frac, 0.5 + Math.sin(a) * 0.5 * frac);
        }
      }
      for (let s = 0; s < segs; s++) {
        idx.push(0, 1 + ((s + 1) % segs), 1 + s);
      }
      for (let r = 1; r < rings; r++) {
        const row0 = 1 + (r - 1) * segs;
        const row1 = 1 + r * segs;
        for (let s = 0; s < segs; s++) {
          const sn = (s + 1) % segs;
          idx.push(row0 + s, row0 + sn, row1 + sn, row0 + s, row1 + sn, row1 + s);
        }
      }
      const wGeo = new T.BufferGeometry();
      wGeo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      wGeo.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
      wGeo.setIndex(idx);
      wGeo.computeVertexNormals();

      this.waterMesh = new T.Mesh(wGeo, waterMat);
      this.waterMesh.position.set(w.x, y0 - 0.035, w.z);
      this.waterMesh.receiveShadow = true;
      this.waterMesh.renderOrder = 3;
      this.waterMesh.matrixAutoUpdate = false;
      this.waterMesh.updateMatrix();
      root.add(this.waterMesh);
    }

    // =========================================================================
    // LAYER 5: SCULPTED CRYSTAL ICE SHELF RIM, WAVE-RIDING FLOES & SHORE DETAILS
    // =========================================================================
    const crystalIceMat = this.wrapMat(new T.MeshStandardMaterial({
      color: new T.Color(0.42, 0.84, 0.99),
      emissive: new T.Color(0.06, 0.28, 0.44),
      emissiveIntensity: 0.30,
      roughness: 0.14,
      metalness: 0.04,
      transparent: true,
      opacity: 0.84
    }), { key: "plain" });

    const frostCapMat = this.wrapMat(new T.MeshStandardMaterial({
      color: new T.Color(0.93, 0.98, 1.0),
      roughness: 0.44,
      metalness: 0.02
    }), { key: "plain" });

    // Continuous Natural Sculpted Frosted Ice-Shelf Rim Lip (replaces artificial hexagonal blocks!)
    {
      const segs = 96;
      const rPos = [], rUvs = [], rIdx = [];
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        const innerR = w.r * this.Ad(a) - 0.02;
        const lipW = 0.34 + 0.16 * Math.sin(a * 7.0 + 1.1) + 0.10 * Math.cos(a * 13.0);
        const outerR = innerR + lipW;
        const lipH = 0.052 + 0.022 * Math.sin(a * 9.0 + 0.4);
        const ca = Math.cos(a), sa = Math.sin(a);
        // 3 vertices per cross-section: inner lip edge -> crest -> outer feather into flat ice sheet
        rPos.push(
          w.x + ca * innerR, y0 + 0.028, w.z + sa * innerR,
          w.x + ca * (innerR + lipW * 0.38), y0 + lipH, w.z + sa * (innerR + lipW * 0.38),
          w.x + ca * outerR, y0 + 0.008, w.z + sa * outerR
        );
        const u = (s / segs) * 16;
        rUvs.push(u, 0, u, 0.5, u, 1);
      }
      for (let s = 0; s < segs; s++) {
        const b0 = s * 3, b1 = (s + 1) * 3;
        rIdx.push(b0, b1, b0 + 1, b0 + 1, b1, b1 + 1);
        rIdx.push(b0 + 1, b1 + 1, b0 + 2, b0 + 2, b1 + 1, b1 + 2);
      }
      const rimGeo = new T.BufferGeometry();
      rimGeo.setAttribute("position", new T.Float32BufferAttribute(rPos, 3));
      rimGeo.setAttribute("uv", new T.Float32BufferAttribute(rUvs, 2));
      rimGeo.setIndex(rIdx);
      rimGeo.computeVertexNormals();
      const rimMesh = new T.Mesh(rimGeo, frostCapMat);
      rimMesh.receiveShadow = true;
      rimMesh.renderOrder = 2;
      rimMesh.matrixAutoUpdate = false;
      rimMesh.updateMatrix();
      root.add(rimMesh);
    }

    // 5 Natural Fractured-Polygon Translucent Crystal Ice Floes physically riding the 3D Gerstner waves!
    const mkNaturalFloe = (seed, radBase) => {
      const sh = new T.Shape();
      const pts = 9;
      for (let k = 0; k < pts; k++) {
        const a = (k / pts) * Math.PI * 2;
        const r = radBase * (0.72 + 0.34 * Math.abs(Math.sin(k * 2.3 + seed)) + 0.14 * Math.cos(k * 4.1 + seed * 1.7));
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        k === 0 ? sh.moveTo(px, py) : sh.lineTo(px, py);
      }
      sh.closePath();
      const gBase = new T.ExtrudeGeometry(sh, { depth: 0.085, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.025, bevelSegments: 1 });
      gBase.rotateX(-Math.PI / 2);
      gBase.translate(0, -0.045, 0);
      const gSnow = new T.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.015, bevelSegments: 1 });
      gSnow.rotateX(-Math.PI / 2);
      gSnow.scale(0.84, 1, 0.84);
      gSnow.translate(0, 0.045, 0);
      const grp = new T.Group();
      grp.add(new T.Mesh(gBase, crystalIceMat), new T.Mesh(gSnow, frostCapMat));
      return grp;
    };
    const floeSpecs = [
      [0.45, 0.34, 0.62],
      [2.10, 0.56, 0.78],
      [3.65, 0.44, 0.52],
      [4.95, 0.62, 0.70],
      [5.85, 0.30, 0.46]
    ];
    floeSpecs.forEach(([ang, radFrac, sz], i) => {
      const fg = mkNaturalFloe(i * 3.1 + 0.7, sz);
      const rad = w.r * radFrac;
      fg.position.set(w.x + Math.cos(ang) * rad, y0 - 0.025, w.z + Math.sin(ang) * rad);
      root.add(fg);
      this.floes.push({ m: fg, ph: i * 1.9, x: fg.position.x, z: fg.position.z, baseRy: i * 1.15 });
    });

    // Upgrade O.cold.hole (thin-ice plunge hole) with real liquid water + crystal ice shards
    if (cold && cold.hole && cold.hole.g) {
      for (const ch of cold.hole.g.children) {
        if (ch.geometry && ch.geometry.type === "CircleGeometry") {
          ch.material = waterMat;
        } else if (ch.material === this.game.mats.M_snow) {
          ch.material = crystalIceMat;
        }
      }
    }

    // Lakeside Scenic Touches: Sculpted Glacial Ice-Crystal Clusters & Frosted Winter Reeds
    const shardGeo = new T.ConeGeometry(0.16, 0.68, 5);
    const reedStemGeo = new T.CylinderGeometry(0.012, 0.018, 0.95, 5);
    const reedHeadGeo = new T.CapsuleGeometry(0.028, 0.14, 4, 6);
    const reedMat = this.wrapMat(new T.MeshStandardMaterial({ color: 0x6f5842, roughness: 0.85 }), { key: "plain" });
    const reedHeadMat = this.wrapMat(new T.MeshStandardMaterial({ color: 0x4d3424, roughness: 0.9 }), { key: "plain" });

    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.15;
      let lo = 2, hi = 28;
      for (let k = 0; k < 10; k++) {
        const mid = (lo + hi) * 0.5;
        if (this.ni(p.x + Math.cos(a) * mid, p.z + Math.sin(a) * mid) < 1.02) lo = mid;
        else hi = mid;
      }
      const sx = p.x + Math.cos(a) * (lo + 0.25);
      const sz = p.z + Math.sin(a) * (lo + 0.25);
      const dock = this.game.world && this.game.world.dock;
      if (dock && Math.hypot(sx - dock.x, sz - dock.z) < 4.2) continue;

      if (i % 3 === 0) {
        const cg = new T.Group();
        cg.position.set(sx, y0 + 0.04, sz);
        for (let k = 0; k < 3; k++) {
          const sh = new T.Mesh(shardGeo, crystalIceMat);
          sh.scale.set(0.65 + k * 0.22, 0.65 + (k === 1 ? 0.55 : 0.15), 0.65 + k * 0.2);
          sh.position.set((k - 1) * 0.18, 0.18 + k * 0.05, (k % 2 ? 0.12 : -0.10));
          sh.rotation.set((k - 1) * 0.28, k * 1.1, (k - 1) * 0.22);
          cg.add(sh);
        }
        root.add(cg);
      } else {
        const rg = new T.Group();
        rg.position.set(sx, y0 + 0.02, sz);
        for (let k = 0; k < 4; k++) {
          const ang = k * 1.6 + i;
          const st = new T.Mesh(reedStemGeo, reedMat);
          st.position.set(Math.cos(ang) * 0.14, 0.42, Math.sin(ang) * 0.14);
          st.rotation.set(Math.sin(ang) * 0.18, 0, Math.cos(ang) * 0.18);
          rg.add(st);
          if (k < 2) {
            const hd = new T.Mesh(reedHeadGeo, reedHeadMat);
            hd.position.set(Math.cos(ang) * 0.20, 0.78, Math.sin(ang) * 0.20);
            const snowCap = new T.Mesh(new T.SphereGeometry(0.032, 6, 6), frostCapMat);
            snowCap.position.set(Math.cos(ang) * 0.20, 0.87, Math.sin(ang) * 0.20);
            rg.add(hd, snowCap);
          }
        }
        root.add(rg);
      }
    }

    return this;
  }

  update(dt, time) {
    if (!this.group) return;
    const g = this.game;
    const env = g.env;
    const night = env ? env.night || 0 : 0;
    const aurora = env && env.state ? env.state.aurora || 0 : 0;

    // Sync real-time sky dome zenith/horizon colors into the water mirror reflection!
    if (this.waterUniforms) {
      this.waterUniforms.uNight.value = night;
      this.waterUniforms.uAurora.value = aurora;
      if (env && env.u) {
        if (env.u.uZenith) this.waterUniforms.uZenith.value.copy(env.u.uZenith.value);
        if (env.u.uHorizon) this.waterUniforms.uHorizon.value.copy(env.u.uHorizon.value);
      }
    }

    // Interactive 3-ring trailing water wake & real basin depth-accurate wading buoyancy!
    const pl = g.player;
    const inWater = !!(pl && !pl.riding && !pl.seat && g.cold && g.cold.inWater(pl.pos.x, pl.pos.z));
    this.wakeCd = Math.max(0, this.wakeCd - dt);

    if (inWater) {
      // Depth-accurate wading: ankle-deep at shallow rim -> waist-deep + gentle wave bobbing in deep center!
      const dep = this.basinDepth(pl.pos.x, pl.pos.z);
      const waveBob = this.sampleWave(pl.pos.x, pl.pos.z, time) * 0.85;
      const targetWade = pl.air > 0.06 ? 0 : Math.min(0.74, Math.max(0.24, dep * 0.34)) - waveBob;
      pl.wade += (targetWade - pl.wade) * (1 - Math.exp(-8 * dt));

      // Spawn expanding trailing concentric wake rings as player wades!
      if ((pl.moved > 0.03 && this.wakeCd <= 0) || this.wakeCd <= -0.95) {
        const wk = this.wakes[this.wakeIdx];
        wk.x = pl.pos.x;
        wk.z = pl.pos.z;
        wk.age = 0;
        wk.str = pl.moved > 0.03 ? 1.0 : 0.55;
        this.wakeIdx = (this.wakeIdx + 1) % 3;
        this.wakeCd = pl.moved > 0.03 ? 0.32 : 0.85;
      }
    }

    // Advance all 3 wake rings cleanly
    for (let i = 0; i < 3; i++) {
      const wk = this.wakes[i];
      wk.age = Math.min(9.0, wk.age + dt);
      if (wk.age > 3.6) wk.str = 0;
    }
    if (this.waterUniforms) {
      this.waterUniforms.uWake0.value.set(this.wakes[0].x, this.wakes[0].z, this.wakes[0].age, this.wakes[0].str);
      this.waterUniforms.uWake1.value.set(this.wakes[1].x, this.wakes[1].z, this.wakes[1].age, this.wakes[1].str);
      this.waterUniforms.uWake2.value.set(this.wakes[2].x, this.wakes[2].z, this.wakes[2].age, this.wakes[2].str);
    }

    // Skip far decorative animations cleanly when > 75m away from the lake
    const camDist = pl ? Math.hypot(pl.pos.x - this.pond.x, pl.pos.z - this.pond.z) : 0;
    if (camDist > 78) return;

    // 1) Crystal ice floes physically ride the EXACT 3D Gerstner wave height & slope!
    const eps = 0.45;
    for (let i = 0; i < this.floes.length; i++) {
      const f = this.floes[i];
      const hc = this.sampleWave(f.x, f.z, time);
      const hx = this.sampleWave(f.x + eps, f.z, time);
      const hz = this.sampleWave(f.x, f.z + eps, time);
      const pitch = Math.atan2(hz - hc, eps) * 1.15;
      const roll = -Math.atan2(hx - hc, eps) * 1.15;
      f.m.position.y = this.iceY - 0.032 + hc;
      f.m.rotation.set(pitch, f.baseRy + 0.16 * Math.sin(time * 0.22 + f.ph), roll);
    }

    // 2) Sway underwater kelp blades gently in the glacial current
    for (let i = 0; i < this.kelp.length; i++) {
      const k = this.kelp[i];
      k.m.rotation.z = Math.sin(time * 1.45 + k.ph) * 0.24;
      k.m.rotation.x = Math.cos(time * 1.15 + k.ph * 1.3) * 0.16;
    }

    // 3) Animate rising underwater air bubbles from stones to surface
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.prog = (b.prog + dt * b.spd) % 1.0;
      const by = this.iceY - b.dep + 0.08 + b.prog * (b.dep - 0.12);
      const wob = Math.sin(time * 3.4 + b.ph) * 0.06;
      b.m.position.set(b.bx + wob, by, b.bz + Math.cos(time * 2.8 + b.ph) * 0.06);
    }

    // 4) Animate 14 swimming winter koi & silver glacier trout at multi-tier depths
    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i];
      const a = time * f.spd + f.ph;
      const nx = f.cx + Math.cos(a) * f.rx;
      const nz = f.cz + Math.sin(a) * f.rz;
      const vx = -Math.sin(a) * f.rx * f.spd;
      const vz = Math.cos(a) * f.rz * f.spd;
      f.g.position.set(nx, f.y + Math.sin(time * 2.0 + f.ph) * 0.05, nz);
      f.g.rotation.y = Math.atan2(vx, vz);
      f.tail.rotation.y = Math.sin(time * 12.0 + f.ph) * 0.45;
    }

    // 5) Subtle icy winter mist wisps drifting above the open glacial water
    if (dt > 0 && g.puffs && camDist < 42) {
      this.mistAcc += dt * 2.2;
      while (this.mistAcc >= 1) {
        this.mistAcc -= 1;
        const w = g.cold.water;
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * w.r * 0.85;
        g.puffs.spawn(
          w.x + Math.cos(a) * r,
          this.iceY + 0.06,
          w.z + Math.sin(a) * r,
          (Math.random() - 0.5) * 0.35,
          0.16 + Math.random() * 0.22,
          (Math.random() - 0.5) * 0.35,
          0.32 + Math.random() * 0.26,
          0.18,
          1.4 + Math.random() * 0.9,
          0.80, 0.93, 1.0, -0.05, 0.9
        );
      }
    }
  }
}
