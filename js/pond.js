// 冰湖彻底视觉重构模块 (Crystal Parallax Glacial Ice + Translucent Rippling Caustic Water + Underwater World)
// Preserves 100% of existing gameplay (skating, wading/cold hazard, thin-ice plunge, ice-fishing dock)
// while replacing the flat matte ice plane and dark opaque water sticker with rich multi-layered ice & water!

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
    this.waterUniforms = null;
    this.iceUniforms = null;
    this.bedUniforms = null;
    this.fish = [];
    this.floes = [];
    this.mistAcc = 0;
    this.rippleT = 9;
    this.ripplePos = new this.THREE.Vector2(0, 0);
  }

  build() {
    const T = this.THREE;
    const { scene, cold, terrain } = this.game;
    const p = this.pond;
    const w = cold.water; // { x, z, r }
    const y0 = this.iceY;

    // 1) Cleanly retire the old flat matte ice quad & opaque dark-navy pondwater / snow-cube rim
    if (terrain && terrain.ice) {
      terrain.ice.visible = false;
    }
    if (cold) {
      // Hide old white snow-cylinder floes cleanly
      for (const fl of cold.floes || []) {
        if (fl.m) fl.m.visible = false;
      }
      // Hide old dark pondwater shape & M_snow rim boxes near the water pool
      for (const ch of scene.children) {
        if (!ch.isMesh) continue;
        if (ch.material && ch.material.customProgramCacheKey && ch.material.customProgramCacheKey().startsWith("pondwater")) {
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

    // Common shader uniforms shared with live environment (night, aurora, sun, interactive wading ripple!)
    const uNight = { value: 0 };
    const uAurora = { value: 0 };
    const uPool = { value: new T.Vector4(w.x, w.z, w.r, 0) };
    const uPond = { value: new T.Vector4(p.x, p.z, p.a, p.b) };
    const uPondRot = { value: p.rot };
    const uRipple = { value: new T.Vector4(w.x, w.z, 9.0, 0.0) }; // xy=pos, z=age, w=strength
    this.waterUniforms = { uNight, uAurora, uPool, uRipple };
    this.iceUniforms = { uNight, uAurora, uPool, uPond, uPondRot };
    this.bedUniforms = { uNight, uPool };

    // Shared GLSL organic open-water edge function matching JS Ad(theta) EXACTLY!
    const glslPoolEdge = `
      float pondAd_(float a) {
        return 1.0 + 0.2 * sin(3.0 * a + 0.7) + 0.1 * sin(5.0 * a + 2.1) + 0.06 * sin(9.0 * a);
      }
      float pondPoolSigned_(vec2 xz, vec4 pool) {
        vec2 d = xz - pool.xy;
        float r = length(d);
        float a = atan(d.y, d.x);
        return r - pool.z * pondAd_(a);
      }
      float pondHash_(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      // Crisp 2D Voronoi edge distance for real glacial ice cracks & water caustics!
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
        return vec2(sqrt(md), sqrt(md2) - sqrt(md)); // x=cell dist, y=edge dist
      }
    `;

    // =========================================================================
    // LAYER 1: SUBMERGED LAKEBED + LIVE UNDERWATER CAUSTICS + STONES + SWIMMING FISH!
    // =========================================================================
    {
      const bedShape = new T.Shape();
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        let lo = 2, hi = 30;
        for (let k = 0; k < 10; k++) {
          const mid = (lo + hi) * 0.5;
          if (this.ni(p.x + Math.cos(a) * mid, p.z + Math.sin(a) * mid) < 1.04) lo = mid;
          else hi = mid;
        }
        const lx = Math.cos(a) * lo, lz = Math.sin(a) * lo;
        i === 0 ? bedShape.moveTo(lx, -lz) : bedShape.lineTo(lx, -lz);
      }
      const bedGeo = new T.ShapeGeometry(bedShape, 24);
      bedGeo.rotateX(-Math.PI / 2);

      const bedMat = this.wrapMat(new T.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.92,
        metalness: 0.0
      }), {
        key: "crystal_pond_bed",
        uniforms: { uNight, uPool },
        fragPars: `uniform float uNight; uniform vec4 uPool;\n${glslPoolEdge}`,
        fragColor: `#include <color_fragment>
        {
          vec2 bp = vWPos.xz;
          float n1 = texture2D(uNoise, bp * 0.08).r;
          float n2 = texture2D(uNoise, bp * 0.34).g;
          float pebbles = smoothstep(0.32, 0.78, texture2D(uNoise, bp * 0.95).r);
          vec3 deepCol = vec3(0.015, 0.095, 0.165);
          vec3 shallowCol = vec3(0.06, 0.24, 0.34);
          vec3 stoneCol = vec3(0.14, 0.24, 0.30);
          float poolD = pondPoolSigned_(bp, uPool);
          float inOpen = 1.0 - smoothstep(-0.8, 1.4, poolD);
          vec3 col = mix(deepCol, shallowCol, n1 * 0.55 + inOpen * 0.45);
          col = mix(col, stoneCol, pebbles * 0.42);

          // Vivid animated underwater sunlight & moonlight caustics web!
          vec2 c1 = pondVoronoi_(bp * 0.68 + vec2(uTime * 0.28, -uTime * 0.20));
          vec2 c2 = pondVoronoi_(bp * 1.12 - vec2(uTime * 0.22, uTime * 0.26));
          float caust = pow(1.0 - smoothstep(0.0, 0.20, c1.y), 2.2) * 0.85
                      + pow(1.0 - smoothstep(0.0, 0.22, c2.y), 2.2) * 0.72;
          vec3 caustCol = mix(vec3(0.38, 0.96, 1.0), vec3(0.24, 0.92, 0.82), uNight);
          col += caustCol * caust * (0.45 + 0.68 * inOpen) * (1.0 - 0.35 * uNight) * (0.75 + 0.25 * n2);
          diffuseColor.rgb = col;
        }`
      });
      const bedMesh = new T.Mesh(bedGeo, bedMat);
      bedMesh.position.set(p.x, y0 - 0.50, p.z);
      bedMesh.receiveShadow = true;
      root.add(bedMesh);

      // Smooth submerged river stones & glowing underwater frost-crystals!
      const rockGeo = new T.DodecahedronGeometry(0.42, 1);
      const rockMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.20, 0.30, 0.36),
        roughness: 0.75,
        metalness: 0.05
      }), { key: "plain" });
      const crysGeo = new T.OctahedronGeometry(0.20, 0);
      const crysMat = this.wrapMat(new T.MeshStandardMaterial({
        color: new T.Color(0.48, 0.94, 1.0),
        emissive: new T.Color(0.18, 0.78, 0.96),
        emissiveIntensity: 0.75,
        roughness: 0.15,
        transparent: true,
        opacity: 0.85
      }), { key: "plain" });

      // Deterministic pseudo-random stones inside both open water and shallow clear ice!
      for (let i = 0; i < 42; i++) {
        const ang = i * 2.39996;
        const rad = i < 18 ? (0.18 + ((i * 0.37) % 0.72)) * w.r : (2.2 + ((i * 0.61) % 1.0) * 11.5);
        const rx = (i < 18 ? w.x : p.x) + Math.cos(ang) * rad;
        const rz = (i < 18 ? w.z : p.z) + Math.sin(ang) * rad * (i < 18 ? 1.0 : 0.72);
        if (this.ni(rx, rz) > 0.95) continue;
        const rm = new T.Mesh(rockGeo, rockMat);
        const sc = 0.55 + ((i * 0.29) % 0.95);
        rm.scale.set(sc * 1.25, sc * 0.45, sc * 0.95);
        rm.position.set(rx, y0 - 0.56, rz);
        rm.rotation.set(i * 0.4, i * 1.1, i * 0.2);
        root.add(rm);
      }

      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.3;
        const rad = (0.35 + (i % 3) * 0.25) * w.r;
        const cx = w.x + Math.cos(ang) * rad;
        const cz = w.z + Math.sin(ang) * rad;
        const cm = new T.Mesh(crysGeo, crysMat);
        cm.scale.set(0.7, 1.65, 0.7);
        cm.position.set(cx, y0 - 0.48, cz);
        cm.rotation.set(0.2 * Math.sin(i), i * 0.9, 0.2 * Math.cos(i));
        root.add(cm);
      }

      // 10 Animated Swimming Underwater Winter Koi & Frost-Fish!
      const fishBodyGeo = new T.SphereGeometry(0.11, 10, 8);
      const fishTailGeo = new T.ConeGeometry(0.08, 0.18, 4).rotateX(Math.PI / 2);
      const koiColors = [0xff7a3c, 0xffd058, 0x62eeff, 0xff9ae4, 0xffffff];
      for (let i = 0; i < 10; i++) {
        const inPool = i < 6;
        const fg = new T.Group();
        const col = koiColors[i % koiColors.length];
        const fMat = this.wrapMat(new T.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.28,
          roughness: 0.25
        }), { key: "plain" });
        const body = new T.Mesh(fishBodyGeo, fMat);
        body.scale.set(0.55, 0.65, 1.85);
        const tail = new T.Mesh(fishTailGeo, fMat);
        tail.position.z = -0.22;
        fg.add(body, tail);
        root.add(fg);
        this.fish.push({
          g: fg,
          tail,
          cx: inPool ? w.x : p.x + 3.0,
          cz: inPool ? w.z : p.z - 1.5,
          rx: inPool ? w.r * (0.28 + (i % 3) * 0.16) : 3.4 + (i % 3) * 1.6,
          rz: inPool ? w.r * (0.24 + ((i + 1) % 3) * 0.15) : 2.2 + ((i + 1) % 3) * 1.2,
          y: y0 - (inPool ? 0.24 + (i % 3) * 0.08 : 0.30 + (i % 2) * 0.08),
          spd: (0.26 + (i % 4) * 0.09) * (i % 2 ? 1 : -1),
          ph: i * 1.37
        });
      }
    }

    // =========================================================================
    // LAYER 2: MULTI-LAYER PARALLAX GLACIAL CRYSTAL ICE SURFACE (Replaces flat quad!)
    // =========================================================================
    {
      const iceGeo = new T.PlaneGeometry(p.a * 2.85, p.a * 2.85, 64, 64);
      iceGeo.rotateX(-Math.PI / 2);

      const iceMat = this.wrapMat(new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.10,
        metalness: 0.02,
        clearcoat: 0.72,
        clearcoatRoughness: 0.04,
        envMapIntensity: 0.85,
        transparent: true,
        opacity: 0.84,
        depthWrite: false
      }), {
        key: "crystal_glacial_ice_v2",
        uniforms: { uNight, uAurora, uPool, uPond, uPondRot },
        fragPars: `
          uniform float uNight, uAurora, uPondRot;
          uniform vec4 uPool, uPond;
          ${glslPoolEdge}
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
          // Carve open-water hole cleanly out of the ice sheet so water shows TRUE underwater depth!
          if (poolSigned < -0.05) discard;

          vec3 V = normalize(cameraPosition - vWPos);
          // True 3D Parallax refraction offsets inside thick crystal glacial ice!
          vec2 para1 = -V.xz / max(V.y + 0.32, 0.40) * 0.28;
          vec2 para2 = -V.xz / max(V.y + 0.32, 0.40) * 0.56;

          // Layer A: Sharp high-contrast glacial surface fracture veins!
          vec2 vSurf = pondVoronoi_(wp * 0.36 + texture2D(uNoise, wp * 0.12).rg * 0.36);
          float crackSurf = 1.0 - smoothstep(0.0, 0.042, vSurf.y);

          // Layer B: Deep parallax internal icy fractures (visible 3D ice thickness!)
          vec2 vDeep = pondVoronoi_((wp + para1) * 0.28 + vec2(4.2, 1.9));
          float crackDeep = 1.0 - smoothstep(0.0, 0.068, vDeep.y);

          // Layer C: Trapped frozen white air-bubble pockets suspended inside the ice!
          vec2 vBub1 = pondVoronoi_((wp + para1 * 0.75) * 1.95);
          vec2 vBub2 = pondVoronoi_((wp + para2) * 1.35 + vec2(9.1, 3.7));
          float bub1 = (1.0 - smoothstep(0.04, 0.17, vBub1.x)) * smoothstep(0.42, 0.76, texture2D(uNoise, wp * 0.22).r);
          float bub2 = (1.0 - smoothstep(0.05, 0.19, vBub2.x)) * smoothstep(0.40, 0.74, texture2D(uNoise, (wp + para2) * 0.20).g);

          // Restrained shore frost so the whole lake gleams vivid crystal glacial blue against white snow!
          float frostNoise = texture2D(uNoise, wp * 0.085).r * 0.65 + texture2D(uNoise, wp * 0.26).g * 0.35;
          float niEst = pondNi_(wp);
          float shoreFrost = smoothstep(0.84, 1.03, niEst);
          float holeEdge = 1.0 - smoothstep(0.0, 0.55, poolSigned);
          float snowDrift = smoothstep(0.76, 0.96, frostNoise * 0.75 + shoreFrost * 0.55);

          // Rich translucent glacial blue-turquoise ice (unmistakable crystal ice vs snow!)
          vec3 deepIce = mix(vec3(0.05, 0.24, 0.44), vec3(0.025, 0.12, 0.26), uNight);
          vec3 midIce  = mix(vec3(0.14, 0.48, 0.72), vec3(0.07, 0.26, 0.46), uNight);
          vec3 frostCol = mix(vec3(0.76, 0.91, 0.98), vec3(0.38, 0.58, 0.80), uNight);

          vec3 col = mix(deepIce, midIce, clamp(frostNoise * 0.78 + 0.12, 0.0, 1.0));
          // Deep parallax cracks glow icy aquamarine; surface stress fractures shine crisp crystalline white!
          col = mix(col, vec3(0.42, 0.86, 1.0), crackDeep * 0.68);
          col = mix(col, vec3(0.94, 0.99, 1.0), crackSurf * 0.85);
          col += vec3(0.76, 0.94, 1.0) * (bub1 * 0.48 + bub2 * 0.34);
          col = mix(col, frostCol, clamp(snowDrift * 0.58 + holeEdge * 0.52, 0.0, 0.78));

          // Grazing Fresnel sheen without washing out the vivid blue ice!
          float fres = pow(1.0 - max(dot(V, vec3(0.0, 1.0, 0.0)), 0.0), 3.2);
          diffuseColor.rgb = col;
          diffuseColor.a = clamp(0.68 + 0.22 * fres + crackSurf * 0.20 + snowDrift * 0.16 + holeEdge * 0.20, 0.66, 0.96);
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
          float fres_ = pow(1.0 - max(V_.y, 0.0), 4.2);
          // Crisp sky tint, vivid night aurora mirror reflection, and diamond ice glints!
          vec3 skyRef = mix(vec3(0.16, 0.46, 0.76), uAmbSky, 0.35);
          float aurWave = 0.5 + 0.5 * sin(vWPos.x * 0.16 + vWPos.z * 0.11 + uTime * 0.55);
          vec3 aurRef = mix(vec3(0.12, 0.96, 0.72), vec3(0.74, 0.32, 0.98), aurWave) * uAurora * 0.95;
          vec3 H_ = normalize(V_ + normalize(uSunDir));
          float spec_ = pow(max(H_.y, 0.0), 110.0) * (1.0 - uNight * 0.7);
          float microGlint = pow(texture2D(uNoise, vWPos.xz * 2.8 + V_.xz * 0.4).r, 11.0) * 1.6;
          outgoingLight += skyRef * fres_ * 0.22 + aurRef * (0.18 + 0.65 * fres_) + uFogSun * (spec_ * 0.95 + microGlint * 0.28 * (1.0 - uNight * 0.5));
        }`
      });

      const iceMesh = new T.Mesh(iceGeo, iceMat);
      iceMesh.position.set(p.x, y0 + 0.002, p.z);
      iceMesh.receiveShadow = true;
      iceMesh.renderOrder = 2;
      root.add(iceMesh);
    }

    // =========================================================================
    // LAYER 3: CRYSTAL-CLEAR RIPPLING ANIMATED OPEN WATER (Replaces dark navy sticker!)
    // =========================================================================
    const waterMat = this.wrapMat(new T.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.06,
      metalness: 0.04,
      clearcoat: 0.65,
      clearcoatRoughness: 0.03,
      envMapIntensity: 0.75,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    }), {
      key: "crystal_pond_water_v2",
      uniforms: { uNight, uAurora, uPool, uRipple },
      vertPars: `uniform vec4 uPool, uRipple;`,
      vertBegin: `{
        vec3 wp_ = (modelMatrix * vec4(transformed, 1.0)).xyz;
        float w1_ = sin(wp_.x * 1.85 + uTime * 2.4) * cos(wp_.z * 1.65 - uTime * 1.9) * 0.024;
        float w2_ = sin((wp_.x - wp_.z) * 3.1 - uTime * 3.4) * 0.012;
        transformed.y += w1_ + w2_;
      }`,
      fragPars: `
        uniform float uNight, uAurora;
        uniform vec4 uPool, uRipple;
        ${glslPoolEdge}
      `,
      fragColor: `#include <color_fragment>
      {
        vec2 wp = vWPos.xz;
        float edgeD = -pondPoolSigned_(wp, uPool); // >0 inside water, 0 at ice edge
        float shallow = 1.0 - smoothstep(0.0, 1.65, edgeD);

        // Vivid animated scrolling water ripples & underwater caustic glints!
        vec2 c1 = pondVoronoi_(wp * 0.90 + vec2(uTime * 0.34, -uTime * 0.24));
        vec2 c2 = pondVoronoi_(wp * 1.40 - vec2(uTime * 0.26, uTime * 0.30));
        float caust = pow(1.0 - smoothstep(0.0, 0.22, c1.y), 2.2) * 0.75
                    + pow(1.0 - smoothstep(0.0, 0.24, c2.y), 2.2) * 0.55;

        // Visible concentric water wave crests rippling softly toward the ice rim!
        float waveCrest = pow(0.5 + 0.5 * sin(edgeD * 5.8 - uTime * 2.6 + texture2D(uNoise, wp * 0.45).r * 4.5), 4.0);

        // Interactive circular wading ripple expanding from player's feet!
        float ripD = length(wp - uRipple.xy);
        float ripRing = exp(-abs(ripD - uRipple.z * 2.8) * 3.6) * exp(-uRipple.z * 1.2) * uRipple.w;

        // Deep rich emerald-sapphire glacial liquid water (unmistakable liquid depth vs blue ice & white snow!)
        vec3 deepWater = mix(vec3(0.010, 0.135, 0.255), vec3(0.006, 0.055, 0.135), uNight);
        vec3 shalWater = mix(vec3(0.045, 0.38, 0.56), vec3(0.025, 0.18, 0.32), uNight);
        vec3 col = mix(deepWater, shalWater, shallow * 0.78 + 0.10);
        col += mix(vec3(0.28, 0.88, 1.0), vec3(0.18, 0.85, 0.78), uNight) * (caust * (0.34 + 0.28 * shallow) + waveCrest * 0.16);

        // Crisp white shoreline slush-foam & ripple rings!
        float foamNoise = texture2D(uNoise, wp * 1.5 + uTime * vec2(0.05, -0.04)).r;
        float foam = smoothstep(0.26, 0.0, edgeD + (foamNoise - 0.5) * 0.20);
        col = mix(col, vec3(0.92, 0.98, 1.0), clamp(foam * 0.78 + ripRing * 0.75, 0.0, 0.92));

        vec3 V_ = normalize(cameraPosition - vWPos);
        float fres_ = pow(1.0 - max(V_.y, 0.0), 3.4);
        diffuseColor.rgb = col;
        // Clear turquoise transparency looking down -> glossy liquid depth looking across!
        diffuseColor.a = clamp(0.56 + 0.34 * fres_ + foam * 0.32 + ripRing * 0.25, 0.54, 0.94);
      }`,
      fragNormal: `{
        vec2 p_ = vWPos.xz;
        float a_ = texture2D(uNoise, p_ * 0.38 + uTime * vec2(0.065, 0.036)).r
                 + texture2D(uNoise, p_ * 0.92 - uTime * vec2(0.044, 0.072)).g * 0.72;
        float b_ = texture2D(uNoise, p_ * 0.38 + vec2(0.37, 0.11) - uTime * vec2(0.048, 0.060)).g
                 + texture2D(uNoise, p_ * 0.92 + vec2(0.5, 0.2) + uTime * vec2(0.068, 0.032)).r * 0.72;
        // Interactive expanding wave normal around player wading!
        vec2 rd = p_ - uRipple.xy;
        float rlen = length(rd) + 0.001;
        float rWave = sin((rlen - uRipple.z * 2.8) * 14.0) * exp(-abs(rlen - uRipple.z * 2.8) * 2.4) * exp(-uRipple.z * 1.2) * uRipple.w;
        vec2 rN = (rd / rlen) * rWave * 0.55;
        vec3 wn_ = normalize(vec3((a_ - 0.85) * 0.52 + rN.x, 1.0, (b_ - 0.85) * 0.52 + rN.y));
        normal = normalize((viewMatrix * vec4(wn_, 0.0)).xyz);
      }`,
      fragEnd: `{
        vec3 V_ = normalize(cameraPosition - vWPos);
        vec3 Nw_ = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
        float fres_ = pow(1.0 - max(dot(V_, Nw_), 0.0), 3.8);
        // Sparkling sunlight ripples + vivid emerald/violet aurora water reflection!
        vec3 skyRef = mix(vec3(0.08, 0.42, 0.68), uAmbSky, 0.35);
        float aurW = 0.5 + 0.5 * sin(vWPos.x * 0.24 + vWPos.z * 0.20 + uTime * 0.95 + Nw_.x * 3.5);
        vec3 aurRef = mix(vec3(0.14, 0.98, 0.72), vec3(0.76, 0.34, 0.98), aurW) * uAurora * 1.15;
        vec3 H_ = normalize(V_ + normalize(uSunDir));
        float glitter = pow(max(dot(Nw_, H_), 0.0), 130.0) * (1.0 - uNight * 0.45);
        float glint2 = pow(max(dot(Nw_, normalize(V_ + vec3(-0.35, 0.72, 0.45))), 0.0), 75.0) * 0.48;
        outgoingLight += skyRef * fres_ * 0.32 + aurRef * (0.22 + 0.68 * fres_) + uFogSun * (glitter * 2.6 + glint2 * 0.72);
      }`
    });

    // Subdivided radial organic water disc matching Ad(theta) so vertex waves ripple smoothly!
    {
      const rings = 14, segs = 72;
      const pos = [], uvs = [], idx = [];
      pos.push(0, 0, 0);
      uvs.push(0.5, 0.5);
      for (let r = 1; r <= rings; r++) {
        const frac = r / rings;
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const rad = (w.r * this.Ad(a) + 0.08) * frac;
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

      const waterMesh = new T.Mesh(wGeo, waterMat);
      waterMesh.position.set(w.x, y0 - 0.025, w.z);
      waterMesh.receiveShadow = true;
      waterMesh.renderOrder = 3;
      root.add(waterMesh);
    }

    // =========================================================================
    // LAYER 4: TRANSLUCENT CRYSTAL ICE SHELF RIM, FLOATING ICE FLOES & SHORE DETAILS!
    // =========================================================================
    const crystalIceMat = this.wrapMat(new T.MeshPhysicalMaterial({
      color: new T.Color(0.38, 0.80, 0.98),
      emissive: new T.Color(0.06, 0.26, 0.42),
      emissiveIntensity: 0.34,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 0.90,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.82
    }), { key: "plain" });

    const frostCapMat = this.wrapMat(new T.MeshStandardMaterial({
      color: new T.Color(0.92, 0.97, 1.0),
      roughness: 0.45,
      metalness: 0.02
    }), { key: "plain" });

    // 36 Sculpted translucent crystal ice shelf ledges lining the irregular open-water rim!
    const slabGeo = new T.CylinderGeometry(0.46, 0.56, 0.14, 6);
    const capGeo = new T.CylinderGeometry(0.40, 0.46, 0.045, 6);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + Math.sin(i * 5.3) * 0.04;
      const rad = w.r * this.Ad(a) + 0.14 + 0.08 * Math.sin(i * 3.1);
      const grp = new T.Group();
      const sx = 0.72 + 0.45 * Math.abs(Math.sin(i * 2.7));
      const sz = 0.55 + 0.32 * Math.abs(Math.cos(i * 1.9));
      const base = new T.Mesh(slabGeo, crystalIceMat);
      const top = new T.Mesh(capGeo, frostCapMat);
      top.position.y = 0.075;
      grp.add(base, top);
      grp.scale.set(sx, 0.75 + 0.4 * Math.abs(Math.sin(i * 4.1)), sz);
      grp.position.set(w.x + Math.cos(a) * rad, y0 + 0.01, w.z + Math.sin(a) * rad);
      grp.rotation.set(Math.sin(i * 4.3) * 0.08, -a + Math.sin(i * 7.1) * 0.5, Math.cos(i * 6.1) * 0.08);
      root.add(grp);
    }

    // 7 Sculpted Translucent Crystal Ice Floes bobbing & tilting naturally on the water!
    const floeBaseGeo = new T.CylinderGeometry(0.92, 1.04, 0.16, 7);
    const floeCapGeo = new T.CylinderGeometry(0.76, 0.90, 0.055, 7);
    for (let i = 0; i < 7; i++) {
      const ang = i * 2.4 + 0.5;
      const rad = w.r * (0.20 + 0.48 * ((i * 0.37) % 1));
      const sc = 0.42 + 0.42 * ((i * 0.61) % 1);
      const fg = new T.Group();
      const base = new T.Mesh(floeBaseGeo, crystalIceMat);
      const top = new T.Mesh(floeCapGeo, frostCapMat);
      top.position.y = 0.095;
      fg.add(base, top);
      fg.scale.set(sc, 1.0, sc * (0.72 + 0.28 * ((i * 0.43) % 1)));
      fg.position.set(w.x + Math.cos(ang) * rad, y0 - 0.01, w.z + Math.sin(ang) * rad);
      root.add(fg);
      this.floes.push({ m: fg, ph: i * 1.9, x: fg.position.x, z: fg.position.z });
    }

    // Upgrade O.cold.hole (thin-ice plunge hole) with crystal water + crystal ice shards!
    if (cold && cold.hole && cold.hole.g) {
      for (const ch of cold.hole.g.children) {
        if (ch.geometry && ch.geometry.type === "CircleGeometry") {
          ch.material = waterMat;
        } else if (ch.material === this.game.mats.M_snow) {
          ch.material = crystalIceMat;
        }
      }
    }

    // Lakeside Scenic Touches: Sculpted Glacial Ice-Crystal Clusters & Frosted Winter Reeds!
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
      // Keep clear of the wooden fishing dock!
      const dock = this.game.world && this.game.world.dock;
      if (dock && Math.hypot(sx - dock.x, sz - dock.z) < 4.2) continue;

      if (i % 3 === 0) {
        // Shimmering crystal ice-ridge cluster on the bank!
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
        // Frosted lakeside cattail reed tuft!
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

    if (this.waterUniforms) {
      this.waterUniforms.uNight.value = night;
      this.waterUniforms.uAurora.value = aurora;
    }

    // Trigger interactive expanding circular water ripples when player wades in the pond!
    const pl = g.player;
    const inWater = pl && g.cold && g.cold.inWater(pl.pos.x, pl.pos.z);
    if (inWater && (pl.moved > 0.02 || this.rippleT > 0.75)) {
      this.ripplePos.set(pl.pos.x, pl.pos.z);
      this.rippleT = 0;
    } else {
      this.rippleT = Math.min(9.0, this.rippleT + dt);
    }
    if (this.waterUniforms) {
      this.waterUniforms.uRipple.value.set(
        this.ripplePos.x,
        this.ripplePos.y,
        this.rippleT,
        this.rippleT < 3.5 ? 1.0 : 0.0
      );
    }

    // Gently bob & tilt crystal ice floes on the animated water waves!
    for (const f of this.floes) {
      f.m.position.y = this.iceY - 0.015 + 0.018 * Math.sin(time * 1.65 + f.ph);
      f.m.rotation.set(
        0.04 * Math.sin(time * 1.2 + f.ph),
        0.24 * Math.sin(time * 0.22 + f.ph),
        0.04 * Math.cos(time * 1.35 + f.ph)
      );
    }

    // Animate swimming underwater Winter Koi & Frost-Fish!
    for (const f of this.fish) {
      const a = time * f.spd + f.ph;
      const nx = f.cx + Math.cos(a) * f.rx;
      const nz = f.cz + Math.sin(a * 1.0) * f.rz;
      const vx = -Math.sin(a) * f.rx * f.spd;
      const vz = Math.cos(a * 1.0) * f.rz * f.spd;
      f.g.position.set(nx, f.y + Math.sin(time * 2.2 + f.ph) * 0.03, nz);
      f.g.rotation.y = Math.atan2(vx, vz);
      f.tail.rotation.y = Math.sin(time * 11.5 + f.ph) * 0.42;
    }

    // Subtle icy winter mist wisps drifting gently above the open glacial water!
    if (dt > 0 && g.puffs && pl && Math.hypot(pl.pos.x - this.pond.x, pl.pos.z - this.pond.z) < 42) {
      this.mistAcc += dt * 2.6;
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
          0.18 + Math.random() * 0.24,
          (Math.random() - 0.5) * 0.35,
          0.32 + Math.random() * 0.28,
          0.20,
          1.4 + Math.random() * 0.9,
          0.78, 0.92, 1.0, -0.05, 0.9
        );
      }
    }
  }
}
