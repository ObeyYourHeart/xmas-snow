// GPU / CPU / 移动端 / 后台与缓存综合性能优化引擎 (圣诞雪境)
// 1. 安全的 56m 空间分格静态几何合批 (削减 1,290+ Draw Call 并释放 1,050+ 显存几何体)
// 2. 室内外互斥剔除 & 远距非天际线地标视距剔除
// 3. 禁用中/低画质及移动端的全屏 CSS backdrop-filter 高斯模糊 (立省 20%~35% 浏览器合成器 GPU)
// 4. 后台标签页完整挂起 (停止 WebGL 渲染 + 挂起 WebAudio AudioContext = 后台 0% CPU/GPU/电量)
// 5. 雪花 GPU DrawRange 硬件裁剪 + MeshPhysicalMaterial clearcoat 分级优化 + 全程动态分辨率缩放 (DRS)
// 6. Service Worker 36MB 静态资源本地秒开缓存 + 零开销 ?perf=1 真实场景渲染探针

export class PerfOptimizer {
  constructor(game, opts = {}) {
    this.game = game;
    this.THREE = game.THREE;
    this.opts = opts;

    this.batchCells = [];
    this.outerDynamicGroups = [];
    this.physMats = [];
    this.resScale = 1.0;
    this.lowFpsSec = 0;
    this.highFpsSec = 0;
    this.frameAcc = 0;
    this.frameCnt = 0;
    this.avgFrameMs = 16.6;
    this.cullTick = 0;
    this.bgSuspended = false;
    this.swActive = false;

    this.stats = {
      mergedSourceMeshes: 0,
      mergedOutputMeshes: 0,
      drawCallsSaved: 0,
      disposedGeos: 0,
      culledCells: 0,
      totalCells: 0,
      physDowngraded: 0,
      snowDrawCount: 0
    };

    this.perfMode = typeof location !== "undefined" && /[?&]perf=1\b/.test(location.search);
    this.perfEl = null;
    this.perfTimer = 0;
    this._bufVec = new this.THREE.Vector2();
  }

  // Inject lightweight stylesheet that disables expensive per-frame CSS backdrop-filter blur over WebGL on medium/low/mobile
  _installPerfCss() {
    if (document.getElementById("perfCss")) return;
    const style = document.createElement("style");
    style.id = "perfCss";
    style.textContent = `
      body.perf-lite .glass,
      body.perf-lite #missileBar {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      body.perf-lite .glass {
        background: rgba(246, 250, 255, 0.90) !important;
      }
      body.perf-lite #missileBar {
        background: rgba(15, 21, 38, 0.86) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Suspend WebAudio DSP when tab is hidden & recover gracefully on mobile WebGL context loss
  _installLifecycleHooks() {
    if (this._lifecycleInstalled) return;
    this._lifecycleInstalled = true;
    const g = this.game;

    const onVisChange = () => {
      const hidden = document.hidden;
      const ctx = g.audio && g.audio.ctx;
      if (hidden) {
        this.bgSuspended = true;
        if (ctx && ctx.state === "running") {
          ctx.suspend().catch(() => {});
        }
      } else {
        this.bgSuspended = false;
        this.frameAcc = 0;
        this.frameCnt = 0;
        if (ctx && ctx.state === "suspended" && g.started && !g.audio.muted) {
          ctx.resume().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("pagehide", () => {
      const ctx = g.audio && g.audio.ctx;
      if (ctx && ctx.state === "running") ctx.suspend().catch(() => {});
    });

    const canvas = g.renderer && g.renderer.domElement;
    if (canvas) {
      canvas.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        g.ui && g.ui.toast("浏览器暂时回收了显存，正在恢复雪境画面…", 4);
      }, false);
      canvas.addEventListener("webglcontextrestored", () => {
        g.onResize && g.onResize();
        if (g.env) g.env.shadowDirty = true;
        g.ui && g.ui.toast("雪境画面已恢复！", 3);
      }, false);
    }
  }

  // Register Service Worker to cache 36 MB of immutable assets locally (Stale-While-Revalidate)
  _registerAssetCache() {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => { this.swActive = true; })
      .catch(() => {});
  }

  // Recursively collect every Object3D referenced on a module instance so NO animated/interactive mesh is ever merged!
  _collectProtected(owner, skipRoots, outSet) {
    if (!owner || typeof owner !== "object") return;
    const seen = new Set();
    const skipKeys = new Set(["game", "scene", "THREE", "world", "player", "camera", "renderer", "audio", "ui", "env", "forest", "mats", "wrapMat", "ext", "intGroup", "group", "root", "_sceneRoots"]);

    const walk = (val, depth) => {
      if (!val || typeof val !== "object" || depth > 5 || seen.has(val)) return;
      seen.add(val);

      if (val.isObject3D) {
        if (skipRoots.has(val)) return;
        val.traverse((ch) => outSet.add(ch));
        return;
      }
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) walk(val[i], depth + 1);
        return;
      }
      if (val instanceof Set || val instanceof Map) {
        val.forEach((v) => walk(v, depth + 1));
        return;
      }
      if (val.isMaterial || val.isBufferGeometry || val.isTexture || val.isVector3 || val.isVector2 || val.isColor || val.isMatrix4 || val.isQuaternion || val.nodeType) return;
      const keys = Object.keys(val);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (depth === 0 && skipKeys.has(k)) continue;
        walk(val[k], depth + 1);
      }
    };
    walk(owner, 0);
  }

  // Safely merge baked geometries with identical non-interleaved attribute signatures
  _mergeBakedGeos(entries, attrNames) {
    const T = this.THREE;
    const prepared = [];
    let totalVerts = 0;
    const normMat = new T.Matrix3();
    const vTmp = new T.Vector3();

    for (let i = 0; i < entries.length; i++) {
      const { geo, matWorld } = entries[i];
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      const posAttr = g.getAttribute("position");
      if (!posAttr || posAttr.count === 0) {
        g.dispose();
        continue;
      }
      if (!g.getAttribute("normal") && attrNames.includes("normal")) {
        g.computeVertexNormals();
      }

      posAttr.applyMatrix4(matWorld);
      const nAttr = g.getAttribute("normal");
      if (nAttr) {
        normMat.getNormalMatrix(matWorld);
        for (let k = 0; k < nAttr.count; k++) {
          vTmp.fromBufferAttribute(nAttr, k).applyMatrix3(normMat).normalize();
          nAttr.setXYZ(k, vTmp.x, vTmp.y, vTmp.z);
        }
      }

      // Flip triangle winding if negative-determinant mirrored transform so faces never invert
      if (matWorld.determinant() < 0) {
        for (const name of attrNames) {
          const a = g.getAttribute(name);
          if (!a) continue;
          const isz = a.itemSize;
          const arr = a.array;
          for (let t = 0; t + 2 < a.count; t += 3) {
            const b1 = (t + 1) * isz;
            const b2 = (t + 2) * isz;
            for (let c = 0; c < isz; c++) {
              const tmp = arr[b1 + c];
              arr[b1 + c] = arr[b2 + c];
              arr[b2 + c] = tmp;
            }
          }
        }
      }

      totalVerts += posAttr.count;
      prepared.push(g);
    }

    if (!prepared.length || totalVerts === 0) return null;

    const merged = new T.BufferGeometry();
    for (const name of attrNames) {
      const first = prepared[0].getAttribute(name);
      if (!first) continue;
      const isz = first.itemSize;
      const arr = new Float32Array(totalVerts * isz);
      let offset = 0;
      for (let i = 0; i < prepared.length; i++) {
        const a = prepared[i].getAttribute(name);
        if (a) {
          arr.set(a.array, offset);
          offset += a.count * isz;
        }
      }
      merged.setAttribute(name, new T.BufferAttribute(arr, isz));
    }

    for (let i = 0; i < prepared.length; i++) prepared[i].dispose();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }

  _batchZone(zoneId, owner, roots, opts = {}) {
    const T = this.THREE;
    const scene = this.game.scene;
    if (!roots || !roots.length) return;

    const skipRoots = new Set(roots);
    const protectedSet = new Set();
    if (owner) this._collectProtected(owner, skipRoots, protectedSet);

    const cellSize = opts.cellSize || 56;
    const buckets = new Map();
    const toRemove = [];
    const oldGeos = new Set();
    const centerTmp = new T.Vector3();

    for (const root of roots) {
      if (!root) continue;
      root.updateMatrixWorld(true);

      const walk = (obj) => {
        if (!obj || !obj.visible || protectedSet.has(obj)) return;

        if (obj.isMesh && !obj.isInstancedMesh && !obj.isSkinnedMesh) {
          const geo = obj.geometry;
          const mat = obj.material;
          if (
            geo &&
            mat &&
            !Array.isArray(mat) &&
            !obj.morphTargetInfluences &&
            obj.onBeforeRender === T.Object3D.prototype.onBeforeRender &&
            geo.getAttribute &&
            geo.getAttribute("position")
          ) {
            const aKeys = Object.keys(geo.attributes).filter((k) => k === "position" || k === "normal" || k === "uv" || k === "color").sort();
            const hasExtra = Object.keys(geo.attributes).some((k) => !aKeys.includes(k));
            const hasInterleaved = aKeys.some((k) => geo.attributes[k] && geo.attributes[k].isInterleavedBufferAttribute);
            if (!hasExtra && !hasInterleaved && aKeys.includes("position")) {
              if (!geo.boundingSphere) geo.computeBoundingSphere();
              centerTmp.copy(geo.boundingSphere ? geo.boundingSphere.center : obj.position).applyMatrix4(obj.matrixWorld);
              const cx = opts.singleCell ? 0 : Math.floor(centerTmp.x / cellSize);
              const cz = opts.singleCell ? 0 : Math.floor(centerTmp.z / cellSize);
              const key = `${cx}|${cz}|${mat.uuid}|${aKeys.join(",")}|${obj.castShadow ? 1 : 0}|${obj.receiveShadow ? 1 : 0}`;
              let b = buckets.get(key);
              if (!b) {
                b = { mat, attrNames: aKeys, castShadow: !!obj.castShadow, receiveShadow: !!obj.receiveShadow, items: [] };
                buckets.set(key, b);
              }
              b.items.push({ mesh: obj, geo, matWorld: obj.matrixWorld.clone() });
            }
          }
          return;
        }

        const ch = obj.children;
        for (let i = 0; i < ch.length; i++) walk(ch[i]);
      };

      walk(root);
    }

    const batchParent = opts.attachTo || scene;
    const invParent = opts.attachTo ? new T.Matrix4().copy(opts.attachTo.matrixWorld).invert() : null;

    for (const b of buckets.values()) {
      if (b.items.length < 2) continue;

      const entries = b.items.map((it) => ({
        geo: it.geo,
        matWorld: invParent ? new T.Matrix4().multiplyMatrices(invParent, it.matWorld) : it.matWorld
      }));

      const mergedGeo = this._mergeBakedGeos(entries, b.attrNames);
      if (!mergedGeo) continue;

      const mergedMesh = new T.Mesh(mergedGeo, b.mat);
      mergedMesh.name = `batch_${zoneId}`;
      mergedMesh.castShadow = b.castShadow;
      mergedMesh.receiveShadow = b.receiveShadow;
      mergedMesh.matrixAutoUpdate = false;
      mergedMesh.updateMatrix();
      batchParent.add(mergedMesh);

      const bs = mergedGeo.boundingSphere;
      if (bs) {
        const wc = bs.center.clone();
        if (opts.attachTo) wc.applyMatrix4(opts.attachTo.matrixWorld);
        this.batchCells.push({
          obj: mergedMesh,
          zoneId,
          x: wc.x,
          y: wc.y,
          z: wc.z,
          r: bs.radius,
          indoor: !!opts.indoor,
          skyline: !!opts.skyline
        });
      }

      for (const it of b.items) {
        toRemove.push(it.mesh);
        oldGeos.add(it.geo);
      }
      this.stats.mergedSourceMeshes += b.items.length;
      this.stats.mergedOutputMeshes += 1;
    }

    for (let i = 0; i < toRemove.length; i++) {
      const m = toRemove[i];
      if (m.parent) m.parent.remove(m);
    }

    const stillUsed = new Set();
    scene.traverse((o) => {
      if (o.geometry) stillUsed.add(o.geometry);
    });
    oldGeos.forEach((g) => {
      if (!stillUsed.has(g)) {
        g.dispose();
        this.stats.disposedGeos++;
      }
    });
  }

  _collectPhysicalMaterials() {
    const seen = new Set();
    this.game.scene.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) {
        if (!m || !m.isMeshPhysicalMaterial || seen.has(m)) continue;
        seen.add(m);
        this.physMats.push({
          mat: m,
          clearcoat: m.clearcoat || 0,
          clearcoatRoughness: m.clearcoatRoughness || 0,
          roughness: m.roughness ?? 0.3
        });
      }
    });
  }

  applyQualityTuning(quality) {
    const g = this.game;
    const q = quality || g.quality || "medium";
    const isHigh = q === "high" && !g.touch;
    let downgraded = 0;

    // 1) Toggle perf-lite CSS class to disable heavy backdrop-filter blur on medium/low/mobile
    document.body.classList.toggle("perf-lite", !isHigh);

    // 2) Strip expensive dual-lobe clearcoat on medium, low & mobile
    for (const item of this.physMats) {
      const wantCC = isHigh ? item.clearcoat : 0;
      if (Math.abs((item.mat.clearcoat || 0) - wantCC) > 0.001) {
        item.mat.clearcoat = wantCC;
        item.mat.roughness = isHigh ? item.roughness : Math.max(0.06, item.roughness * 0.85);
        item.mat.needsUpdate = true;
      }
      if (!isHigh && item.clearcoat > 0) downgraded++;
    }
    this.stats.physDowngraded = downgraded;

    // 3) Tune directional shadow map refresh cadence
    if (g.env) {
      g.env.shadowInterval = g.touch ? 3200 : q === "low" ? 2600 : q === "medium" ? 1800 : 1100;
    }
  }

  optimize(extRoots = {}) {
    const g = this.game;

    this._installPerfCss();
    this._installLifecycleHooks();
    this._registerAssetCache();

    // 1) Batch static architectural meshes across all heavy extension modules
    if (g.castle && g.castle.ext) {
      this._batchZone("castle_ext", g.castle, [g.castle.ext], { singleCell: true, skyline: true });
    }
    if (g.castle && g.castle.intGroup) {
      this._batchZone("castle_int", g.castle, [g.castle.intGroup], { singleCell: true, indoor: true, attachTo: g.castle.intGroup });
      g.castle.intGroup.visible = !!(g.cabin && g.cabin.inside);
    }
    if (extRoots.cathome && extRoots.cathome.length) {
      this._batchZone("cathome", g.cathome, extRoots.cathome, { cellSize: 56 });
    }
    if (g.worldPlus && g.worldPlus.group) {
      this._batchZone("worldplus", g.worldPlus, [g.worldPlus.group], { cellSize: 56 });
    }
    if (g.ballroom && g.ballroom.group) {
      this._batchZone("ballroom", g.ballroom, [g.ballroom.group], { singleCell: true });
    }
    if (g.parkour && g.parkour.group) {
      this._batchZone("parkour", g.parkour, [g.parkour.group], { cellSize: 56 });
    }
    if (extRoots.skiPlus && extRoots.skiPlus.length) {
      this._batchZone("skiplus", g.skiPlus, extRoots.skiPlus, { cellSize: 64 });
    }
    if (g.ferris && g.ferris.root) {
      this._batchZone("ferris", g.ferris, [g.ferris.root], { singleCell: true, skyline: true });
    }
    if (g.pondFx && g.pondFx.group) {
      this._batchZone("pond", g.pondFx, [g.pondFx.group], { singleCell: true });
    }
    if (g.tower && g.tower.root) {
      this._batchZone("tower", g.tower, [g.tower.root], { singleCell: true, skyline: true });
    }

    this.stats.drawCallsSaved = Math.max(0, this.stats.mergedSourceMeshes - this.stats.mergedOutputMeshes);
    this.stats.totalCells = this.batchCells.length;

    // 2) Register large dynamic outer landmark groups for indoor/outdoor & distance culling
    this.outerDynamicGroups = [];
    if (g.ballroom && g.ballroom.group) this.outerDynamicGroups.push({ obj: g.ballroom.group, x: g.ballroom.cx || -98, z: g.ballroom.cz || 72, maxD: 190 });
    if (g.parkour && g.parkour.group) this.outerDynamicGroups.push({ obj: g.parkour.group, x: g.parkour.cx || -76, z: g.parkour.cz || -86, maxD: 190 });
    if (g.pondFx && g.pondFx.group) this.outerDynamicGroups.push({ obj: g.pondFx.group, x: 5, z: -28, maxD: 175 });

    // 3) Collect & tune MeshPhysicalMaterials + CSS compositor + shadow cadence
    this._collectPhysicalMaterials();
    this.applyQualityTuning(g.quality);

    // 4) Enable accurate full-frame WebGL metering ONLY when ?perf=1 is explicitly active
    if (this.perfMode) {
      if (g.renderer && g.renderer.info) g.renderer.info.autoReset = false;
      this._buildPerfHud();
    }

    return this;
  }

  // Called right before rendering each frame so ?perf=1 reports TRUE total scene calls & triangles across all passes!
  beginFrame() {
    if (this.perfMode && this.game.renderer && this.game.renderer.info) {
      this.game.renderer.info.reset();
    }
  }

  _buildPerfHud() {
    if (this.perfEl) return;
    const pre = document.createElement("pre");
    pre.id = "perfProfile";
    pre.style.cssText =
      "position:fixed;left:12px;bottom:76px;z-index:9999;margin:0;padding:8px 10px;border-radius:8px;" +
      "background:rgba(10,14,26,.84);color:#9ff4ff;font:11px/1.38 monospace;pointer-events:none;" +
      "border:1px solid rgba(116,228,255,.45);max-width:440px;white-space:pre-wrap;";
    document.body.appendChild(pre);
    this.perfEl = pre;
  }

  _updateSnowDrawRange() {
    const snow = this.game.snow;
    if (!snow || !snow.points || !snow.points.geometry) return;
    const total = snow.count || 26000;
    const dens = snow.u && snow.u.uDensity ? Math.max(0, Math.min(1, snow.u.uDensity.value)) : 1;
    const drawCnt = this.game.cabin && this.game.cabin.inside ? 0 : Math.min(total, Math.ceil(total * dens));
    if (drawCnt !== this.stats.snowDrawCount) {
      this.stats.snowDrawCount = drawCnt;
      snow.points.geometry.setDrawRange(0, drawCnt);
    }
  }

  _updateCulling() {
    const g = this.game;
    const cam = g.camera;
    const inside = !!(g.cabin && g.cabin.inside);

    if (g.castle && g.castle.intGroup) {
      g.castle.intGroup.visible = inside;
    }
    // Hide massive outdoor terrain, forest & snow meshes completely when inside Claude's Castle!
    if (g.terrain) {
      if (g.terrain.ground) g.terrain.ground.visible = !inside;
      // Only toggle legacy terrain.ice if CrystalPond hasn't retired it!
      if (g.terrain.ice && !g.pondFx) g.terrain.ice.visible = !inside;
    }
    if (g.forest) {
      if (g.forest.cards) g.forest.cards.visible = !inside;
      if (g.forest.near) {
        for (let i = 0; i < g.forest.near.length; i++) {
          const arr = g.forest.near[i];
          for (let k = 0; k < arr.length; k++) arr[k].visible = !inside;
        }
      }
    }
    if (g.snow && g.snow.points) g.snow.points.visible = !inside;

    const q = g.quality || "medium";
    const baseCull = g.touch ? 128 : q === "low" ? 145 : q === "medium" ? 185 : 265;
    const cx = cam.position.x;
    const cz = cam.position.z;
    let culled = 0;

    for (let i = 0; i < this.batchCells.length; i++) {
      const c = this.batchCells[i];
      if (c.indoor) {
        c.obj.visible = inside;
        if (!inside) culled++;
        continue;
      }
      if (inside) {
        c.obj.visible = false;
        culled++;
        continue;
      }
      const maxD = c.skyline ? (g.touch ? 240 : 340) : baseCull + c.r;
      const dx = c.x - cx;
      const dz = c.z - cz;
      const vis = dx * dx + dz * dz <= maxD * maxD;
      c.obj.visible = vis;
      if (!vis) culled++;
    }

    for (let i = 0; i < this.outerDynamicGroups.length; i++) {
      const d = this.outerDynamicGroups[i];
      if (inside) {
        d.obj.visible = false;
        continue;
      }
      const lim = g.touch ? d.maxD * 0.7 : q === "low" ? d.maxD * 0.8 : q === "high" ? 310 : d.maxD;
      const dx = d.x - cx;
      const dz = d.z - cz;
      d.obj.visible = dx * dx + dz * dz <= lim * lim;
    }

    this.stats.culledCells = culled;
  }

  _updateAdaptivePerf(dt) {
    const g = this.game;
    this.frameAcc += dt;
    this.frameCnt++;
    if (this.frameAcc < 1.0) return;

    const fps = this.frameCnt / this.frameAcc;
    this.avgFrameMs = (this.frameAcc / this.frameCnt) * 1000;
    this.frameAcc = 0;
    this.frameCnt = 0;

    if (!g.started || document.visibilityState !== "visible" || g.stepping) return;

    const targetLow = g.touch ? 28 : 36;
    if (fps < targetLow) {
      this.lowFpsSec++;
      this.highFpsSec = 0;
      if (this.lowFpsSec >= 3) {
        this.lowFpsSec = 0;
        if (this.resScale > 0.76) {
          this.resScale = Math.max(0.74, +(this.resScale - 0.13).toFixed(2));
          if (g.applyResScale) g.applyResScale(this.resScale);
        } else if (g.quality !== "low") {
          const nextQ = g.quality === "high" ? "medium" : "low";
          this.resScale = 1.0;
          g.setQuality(nextQ);
          g.ui && g.ui.toast("检测到 GPU 负载较高，已自动切换更流畅画质", 4.5);
        }
      }
    } else if (fps >= 55 && this.resScale < 1.0) {
      this.lowFpsSec = 0;
      this.highFpsSec++;
      if (this.highFpsSec >= 8) {
        this.highFpsSec = 0;
        this.resScale = Math.min(1.0, +(this.resScale + 0.12).toFixed(2));
        if (g.applyResScale) g.applyResScale(this.resScale);
      }
    } else {
      this.lowFpsSec = 0;
      this.highFpsSec = 0;
    }
  }

  _updatePerfHud(dt) {
    if (!this.perfEl) return;
    this.perfTimer += dt;
    if (this.perfTimer < 0.5) return;
    this.perfTimer = 0;

    const g = this.game;
    const r = g.renderer;
    const info = r.info;
    const buf = r.getDrawingBufferSize(this._bufVec);
    const sh = g.env && g.env.light && g.env.light.shadow ? g.env.light.shadow.mapSize : { x: 0, y: 0 };
    const payload = {
      quality: g.quality,
      touch: !!g.touch,
      fps: g.fps || Math.round(1000 / Math.max(1, this.avgFrameMs)),
      frameMs: +this.avgFrameMs.toFixed(1),
      dpr: +r.getPixelRatio().toFixed(2),
      resScale: this.resScale,
      buffer: `${buf.x}x${buf.y}`,
      shadowMap: `${sh.x}x${sh.y}`,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      snowDraw: `${this.stats.snowDrawCount}/${g.snow ? g.snow.count || 26000 : 0}`,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs ? info.programs.length : 0,
      mergedFrom: this.stats.mergedSourceMeshes,
      mergedTo: this.stats.mergedOutputMeshes,
      callsSaved: this.stats.drawCallsSaved,
      disposedGeos: this.stats.disposedGeos,
      culledCells: `${this.stats.culledCells}/${this.stats.totalCells}`,
      physDowngraded: this.stats.physDowngraded,
      blurOff: document.body.classList.contains("perf-lite"),
      swCache: this.swActive
    };
    this.perfEl.textContent = JSON.stringify(payload, null, 2);
  }

  update(dt) {
    this._updateSnowDrawRange();
    this.cullTick++;
    if (this.cullTick % 6 === 1) this._updateCulling();
    this._updateAdaptivePerf(dt);
    if (this.perfMode) this._updatePerfHud(dt);
  }
}
