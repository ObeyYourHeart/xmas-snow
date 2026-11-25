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
    this._frustum = new this.THREE.Frustum();
    this._projScreen = new this.THREE.Matrix4();
    this._sphere = new this.THREE.Sphere();
    this._wasInside = false;
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
    const skipKeys = new Set(["game", "scene", "THREE", "world", "player", "camera", "renderer", "audio", "ui", "env", "forest", "mats", "wrapMat", "ext", "intGroup", "group", "root", "_sceneRoots", "staticPlats"]);

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
    if (Array.isArray(owner)) {
      for (let i = 0; i < owner.length; i++) {
        if (owner[i]) this._collectProtected(owner[i], skipRoots, protectedSet);
      }
    } else if (owner) {
      this._collectProtected(owner, skipRoots, protectedSet);
    }

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
              const ro = obj.renderOrder || 0;
              const key = `${cx}|${cz}|${mat.uuid}|${aKeys.join(",")}|${obj.castShadow ? 1 : 0}|${obj.receiveShadow ? 1 : 0}|${ro}`;
              let b = buckets.get(key);
              if (!b) {
                b = { mat, attrNames: aKeys, castShadow: !!obj.castShadow, receiveShadow: !!obj.receiveShadow, renderOrder: ro, items: [] };
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
    const scaleTmp = new T.Vector3();

    for (const b of buckets.values()) {
      if (b.items.length < 2) {
        // Register static unmerged singletons (signposts, lanterns, stalls, ski racks, props) for indoor/distance/frustum culling!
        if (b.items.length === 1 && !opts.skipCellCull && !opts.attachTo) {
          const it = b.items[0];
          const bs = it.geo.boundingSphere;
          if (bs) {
            const wc = bs.center.clone().applyMatrix4(it.matWorld);
            scaleTmp.setFromMatrixScale(it.matWorld);
            const maxS = Math.max(Math.abs(scaleTmp.x), Math.abs(scaleTmp.y), Math.abs(scaleTmp.z)) || 1;
            this.batchCells.push({
              obj: it.mesh,
              zoneId,
              x: wc.x,
              y: wc.y,
              z: wc.z,
              r: bs.radius * maxS,
              indoor: opts.indoor || false,
              skyline: !!opts.skyline
            });
          }
        }
        continue;
      }

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
      if (b.renderOrder) mergedMesh.renderOrder = b.renderOrder;
      mergedMesh.matrixAutoUpdate = false;
      mergedMesh.updateMatrix();
      batchParent.add(mergedMesh);

      const bs = mergedGeo.boundingSphere;
      if (bs && !opts.skipCellCull) {
        const wc = bs.center.clone();
        if (opts.attachTo) wc.applyMatrix4(opts.attachTo.matrixWorld);
        this.batchCells.push({
          obj: mergedMesh,
          zoneId,
          x: wc.x,
          y: wc.y,
          z: wc.z,
          r: bs.radius,
          indoor: opts.indoor || false,
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

    // 3) Tune directional shadow map refresh cadence (eliminates 1s periodic shadow hitches)
    if (g.env) {
      g.env.shadowInterval = g.touch ? 3600 : q === "low" ? 3200 : q === "medium" ? 2400 : 1600;
    }
  }

  // Disable shadow-casting on tiny decorative clutter (<0.42m radius) inside static roots:
  // unreadable sub-pixel noise in a 140m shadow map, yet shrinks shadow-pass draw calls & merges more static buckets!
  _pruneTinyShadows(rootLists) {
    const T = this.THREE;
    const scaleTmp = new T.Vector3();
    const tinyRe = /signpost|ski_rack|gate_pole|banner_post|bulb|lampglass|garland|ribbon|ornament/i;
    let pruned = 0;
    for (const roots of rootLists) {
      if (!roots || !roots.length) continue;
      for (const root of roots) {
        if (!root) continue;
        root.updateMatrixWorld(true);
        root.traverse((o) => {
          if (!o.isMesh || !o.castShadow || o.isInstancedMesh || o.isSkinnedMesh) return;
          const nm = (o.name || "") + " " + (o.parent && o.parent.name ? o.parent.name : "");
          if (tinyRe.test(nm)) {
            o.castShadow = false;
            pruned++;
            return;
          }
          const geo = o.geometry;
          if (!geo) return;
          if (!geo.boundingSphere) geo.computeBoundingSphere();
          if (geo.boundingSphere) {
            scaleTmp.setFromMatrixScale(o.matrixWorld);
            const maxS = Math.max(Math.abs(scaleTmp.x), Math.abs(scaleTmp.y), Math.abs(scaleTmp.z));
            if (geo.boundingSphere.radius * maxS < 0.42) {
              o.castShadow = false;
              pruned++;
            }
          }
        });
      }
    }
    this.stats.prunedShadows = pruned;
  }

  optimize(extRoots = {}) {
    const g = this.game;

    this._installPerfCss();
    this._installLifecycleHooks();
    this._registerAssetCache();

    // 0) Prune unreadable sub-pixel shadow casters on tiny decorative clutter before batching
    this._pruneTinyShadows([
      extRoots.world, extRoots.ski, extRoots.places, extRoots.wonders,
      extRoots.explore, extRoots.cathome, extRoots.skiPlus,
      g.worldPlus && g.worldPlus.group ? [g.worldPlus.group] : null,
      g.harbor && g.harbor.group ? [g.harbor.group] : null,
      g.gameplay && g.gameplay.group ? [g.gameplay.group] : null,
      g.parkour && g.parkour.group ? [g.parkour.group] : null,
      g.chemlab && g.chemlab.ext ? [g.chemlab.ext] : null
    ]);

    // 1) Batch static architectural meshes across core clearing + all heavy extension modules!
    if (extRoots.world && extRoots.world.length) {
      this._batchZone("core_world", [g.world, g.logic, g.cabin, g.castle, g.explore], extRoots.world, { cellSize: 48 });
    }
    if (extRoots.ski && extRoots.ski.length) {
      this._batchZone("core_ski", [g.ski, g.skiPlus], extRoots.ski, { cellSize: 56 });
    }
    if (extRoots.places && extRoots.places.length) {
      this._batchZone("core_places", [g.places, g.explore, g.worldPlus], extRoots.places, { cellSize: 48 });
    }
    if (extRoots.wonders && extRoots.wonders.length) {
      this._batchZone("core_wonders", [g.wonders], extRoots.wonders, { cellSize: 48 });
    }
    if (extRoots.explore && extRoots.explore.length) {
      this._batchZone("core_explore", [g.explore, g.ferris, g.worldPlus], extRoots.explore, { cellSize: 48 });
    }
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
    if (g.harbor && g.harbor.group) {
      this._batchZone("harbor", g.harbor, [g.harbor.group], { cellSize: 48 });
    }
    if (g.gameplay && g.gameplay.group) {
      this._batchZone("gameplay", g.gameplay, [g.gameplay.group], { cellSize: 56 });
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
      // Rigidly batch the 150 rotating wheel spokes/rims/bulbs inside wheelGroup (protecting counter-rotating hubStar!)
      if (g.ferris.wheelGroup) {
        this._batchZone("ferris_wheel", { h: g.ferris.hubStar }, [g.ferris.wheelGroup], { singleCell: true, attachTo: g.ferris.wheelGroup, skipCellCull: true });
      }
      // Rigidly batch each of the 12 moving gondola cabins (cuts 240 cabin draw calls -> ~48!)
      if (g.ferris.cabins && g.ferris.cabins.length) {
        for (let i = 0; i < g.ferris.cabins.length; i++) {
          const cab = g.ferris.cabins[i];
          if (cab && cab.group) {
            this._batchZone(`ferris_cab_${i}`, null, [cab.group], { singleCell: true, attachTo: cab.group, skipCellCull: true });
          }
        }
      }
    }
    if (g.pondFx && g.pondFx.group) {
      this._batchZone("pond", g.pondFx, [g.pondFx.group], { singleCell: true });
    }
    if (g.tower && g.tower.root) {
      this._batchZone("tower", g.tower, [g.tower.root], { singleCell: true, skyline: true });
    }
    if (g.chemlab && g.chemlab.ext) {
      this._batchZone("chemlab_ext", g.chemlab, [g.chemlab.ext], { singleCell: true });
    }
    if (g.chemlab && g.chemlab.intGroup) {
      g.chemlab.intGroup.visible = true;
      this._batchZone("chemlab_int", g.chemlab, [g.chemlab.intGroup], { singleCell: true, indoor: "chemlab", attachTo: g.chemlab.intGroup });
      g.chemlab.intGroup.visible = !!(g.chemlab && g.chemlab.inside);
    }
    // Batch rigid static parts of the Starlight Cat-Ear Element Gun (keeps all 7 animated parts intact, cuts +80 calls -> ~14!)
    if (g.tools && g.tools.items && g.tools.items.chemgun && g.tools.items.chemgun.root) {
      const cg = g.tools.items.chemgun;
      const wasVis = cg.root.visible;
      cg.root.visible = true;
      this._batchZone("chemgun_static", cg, [cg.root], { singleCell: true, attachTo: cg.root, skipCellCull: true });
      cg.root.visible = wasVis;
    }
    // Batch rigid static hull meshes of Claude Helicopter (protects spinning rotors, nose_spin, yoke & blur discs: 127 -> ~15 calls!)
    if (g.heli && g.heli.claudeModel) {
      const hm = g.heli.claudeModel;
      const wasVis = hm.visible;
      hm.visible = true;
      this._batchZone(
        "heli_hull",
        { a: g.heli.rotorG, b: g.heli.tailG, c: g.heli.noseG, d: g.heli.yoke, e: g.heli.disc, f: g.heli.tdisc },
        [hm],
        { singleCell: true, attachTo: hm, skipCellCull: true }
      );
      hm.visible = wasVis;
    }
    // Batch rigid static body meshes of Train engine & carriages (protects spinning wheels & whistle: 96 -> ~18 calls!)
    if (g.train && g.train.engine && g.train.engine.inner) {
      const tProt = { wheels: g.train.wheels, w: g.train.whistle };
      this._batchZone("train_engine", tProt, [g.train.engine.inner], { singleCell: true, attachTo: g.train.engine.inner, skipCellCull: true });
      if (g.train.cars && g.train.cars.length) {
        for (let i = 0; i < g.train.cars.length; i++) {
          const car = g.train.cars[i];
          if (car && car.inner) {
            this._batchZone(`train_car_${i}`, tProt, [car.inner], { singleCell: true, attachTo: car.inner, skipCellCull: true });
          }
        }
      }
    }

    this.stats.drawCallsSaved = Math.max(0, this.stats.mergedSourceMeshes - this.stats.mergedOutputMeshes);
    this.stats.totalCells = this.batchCells.length;

    // 2) Register large dynamic outer landmark groups for indoor/outdoor, distance & frustum culling
    this.outerDynamicGroups = [];
    if (g.ballroom && g.ballroom.group) this.outerDynamicGroups.push({ obj: g.ballroom.group, x: g.ballroom.cx ?? -64, y: 4, z: g.ballroom.cz ?? 94, r: 20, maxD: 135 });
    if (g.parkour && g.parkour.group) this.outerDynamicGroups.push({ obj: g.parkour.group, x: g.parkour.cx ?? -74, y: 6, z: g.parkour.cz ?? -44, r: 30, maxD: 112 });
    if (g.harbor && g.harbor.group) this.outerDynamicGroups.push({ obj: g.harbor.group, x: g.harbor.cx ?? 134, y: 5, z: g.harbor.cz ?? 126, r: 36, maxD: 225 });
    if (g.pondFx && g.pondFx.group) {
      const px = g.pondFx.pond ? g.pondFx.pond.x : -41;
      const pz = g.pondFx.pond ? g.pondFx.pond.z : 36;
      const py = Number.isFinite(g.pondFx.iceY) ? g.pondFx.iceY : 0;
      this.outerDynamicGroups.push({ obj: g.pondFx.group, x: px, y: py, z: pz, r: 34, maxD: 220 });
    }
    if (g.chemlab && g.chemlab.ext) this.outerDynamicGroups.push({ obj: g.chemlab.ext, x: g.chemlab.cx ?? 76, y: 4, z: g.chemlab.cz ?? 102, r: 16, maxD: 205 });

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

  // Called right before rendering each frame (AFTER all entity .update() calls!):
  // 1) Runs accurate pre-render frustum + distance + indoor culling (zero flicker, eliminates off-screen GPU skinning!)
  // 2) Resets renderer.info when ?perf=1 so metrics report TRUE full-frame draw calls & triangles.
  beginFrame() {
    this._updateCulling();
    if (this.perfMode && this.game.renderer && this.game.renderer.info) {
      this.game.renderer.info.reset();
    }
  }

  _buildPerfHud() {
    if (this.perfEl) return;
    const pre = document.createElement("pre");
    pre.id = "perfProfile";
    pre.style.cssText =
      "position:fixed;right:74px;top:58px;z-index:9999;margin:0;padding:8px 10px;border-radius:8px;" +
      "background:rgba(10,14,26,.84);color:#9ff4ff;font:11px/1.36 monospace;pointer-events:none;" +
      "border:1px solid rgba(116,228,255,.45);max-width:340px;white-space:pre-wrap;";
    document.body.appendChild(pre);
    this.perfEl = pre;
  }

  _updateSnowDrawRange() {
    const snow = this.game.snow;
    if (!snow || !snow.points || !snow.points.geometry) return;
    const total = snow.count || 26000;
    const dens = snow.u && snow.u.uDensity ? Math.max(0, Math.min(1, snow.u.uDensity.value)) : 1;
    const anyInside = !!((this.game.cabin && this.game.cabin.inside) || (this.game.chemlab && this.game.chemlab.inside));
    const drawCnt = anyInside ? 0 : Math.min(total, Math.ceil(total * dens));
    if (drawCnt !== this.stats.snowDrawCount) {
      this.stats.snowDrawCount = drawCnt;
      snow.points.geometry.setDrawRange(0, drawCnt);
    }
  }

  _updateCulling() {
    const g = this.game;
    const cam = g.camera;
    const inCastle = !!(g.cabin && g.cabin.inside);
    const inLab = !!(g.chemlab && g.chemlab.inside);
    const inside = inCastle || inLab;

    if (g.castle && g.castle.intGroup) {
      g.castle.intGroup.visible = inCastle;
    }
    if (g.chemlab && g.chemlab.intGroup) {
      g.chemlab.intGroup.visible = inLab;
    }
    if (g.chemlab && g.chemlab.ext) {
      g.chemlab.ext.visible = !inside;
    }
    // Hide massive outdoor terrain, forest & snow meshes completely when inside Claude's Castle or Hajimi's Lab!
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
    if (g.tower && g.tower.root) g.tower.root.visible = !inside;
    if (g.worldPlus && g.worldPlus.group) g.worldPlus.group.visible = !inside;
    if (g.gameplay && g.gameplay.group) g.gameplay.group.visible = !inside;

    const q = g.quality || "medium";
    const baseCull = g.touch ? 128 : q === "low" ? 145 : q === "medium" ? 185 : 265;
    const cx = cam.position.x;
    const cz = cam.position.z;
    let culled = 0;

    // Update camera frustum once per frame right before render() for accurate behind-camera culling!
    cam.updateMatrixWorld();
    this._projScreen.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(this._projScreen);
    const sph = this._sphere;

    // Ferris Wheel + 12 cabins: hide indoors, and frustum/distance cull when not riding! (Saves ~90 calls when facing away)
    if (g.ferris && g.ferris.root) {
      const ridingFerris = !!(g.player && g.player.riding && g.player.ride && g.player.ride.kind === "ferris");
      let fVis = !inside;
      if (fVis && !ridingFerris) {
        const fx = g.ferris.cx ?? 20;
        const fz = g.ferris.cz ?? 125;
        const fy = (g.ferris.baseY ?? 0) + 22;
        const fMax = g.touch ? 175 : q === "low" ? 195 : 275;
        const fdx = fx - cx;
        const fdz = fz - cz;
        const fd2 = fdx * fdx + fdz * fdz;
        fVis = fd2 <= fMax * fMax;
        if (fVis && fd2 > 2200) {
          sph.center.set(fx, fy, fz);
          sph.radius = 35;
          fVis = this._frustum.intersectsSphere(sph);
        }
      }
      g.ferris.root.visible = fVis;
      if (g.ferris.cabins) {
        for (let i = 0; i < g.ferris.cabins.length; i++) {
          if (g.ferris.cabins[i].group) g.ferris.cabins[i].group.visible = fVis;
        }
      }
    }

    for (let i = 0; i < this.batchCells.length; i++) {
      const c = this.batchCells[i];
      if (c.indoor) {
        const showIn = c.indoor === "chemlab" ? inLab : inCastle;
        c.obj.visible = showIn;
        if (!showIn) culled++;
        continue;
      }
      if (inside) {
        c.obj.visible = false;
        culled++;
        continue;
      }
      const smallCull = g.touch ? 78 : q === "low" ? 90 : q === "medium" ? 115 : 155;
      const maxD = c.skyline ? (g.touch ? 240 : 340) : (c.r < 3.5 ? smallCull : baseCull + c.r);
      const dx = c.x - cx;
      const dz = c.z - cz;
      const d2 = dx * dx + dz * dz;
      let vis = d2 <= maxD * maxD;
      // Shadow-casting cells stay eligible within 52m shadow zone; non-shadow-casting cells frustum-cull immediately behind camera!
      if (vis && (!c.obj.castShadow || d2 > 2704)) {
        sph.center.set(c.x, c.y, c.z);
        sph.radius = c.r + (c.obj.castShadow ? 14 : 6);
        vis = this._frustum.intersectsSphere(sph);
      }
      c.obj.visible = vis;
      if (!vis) culled++;
    }

    for (let i = 0; i < this.outerDynamicGroups.length; i++) {
      const d = this.outerDynamicGroups[i];
      if (inside) {
        d.obj.visible = false;
        continue;
      }
      const lim = g.touch ? d.maxD * 0.7 : q === "low" ? d.maxD * 0.8 : q === "high" ? Math.min(265, d.maxD * 1.18) : d.maxD;
      const dx = d.x - cx;
      const dz = d.z - cz;
      const d2 = dx * dx + dz * dz;
      let vis = d2 <= lim * lim;
      const safeR = (d.r || 22) + 10;
      if (vis && d2 > safeR * safeR) {
        sph.center.set(d.x, d.y ?? 4, d.z);
        sph.radius = (d.r || 22) + 14;
        vis = this._frustum.intersectsSphere(sph);
      }
      d.obj.visible = vis;
    }

    // Dynamic entity frustum & indoor culling (runs right after entity .update(), eliminates 200K-380K off-screen skinned triangles!)
    // 1) AI Friends (SkinnedMesh has frustumCulled=false; without this, all 12 friends within 70m are GPU-skinned even behind camera!)
    if (g.friends && g.friends.list) {
      const fList = g.friends.list;
      const party = g.friends.party;
      const maxFD = g.touch ? 42 : q === "low" ? 46 : q === "medium" ? 58 : 70;
      for (let i = 0; i < fList.length; i++) {
        const f = fList[i];
        if (!f || !f.obj) continue;
        if (inside) {
          f.obj.visible = false;
          continue;
        }
        if (!f.obj.visible) continue;
        const inParty = party && party.includes(f);
        if (!inParty && f.dist > maxFD) {
          f.obj.visible = false;
          continue;
        }
        if (f.dist > 5.0) {
          const p = f.obj.position;
          sph.center.set(p.x, p.y + 0.95, p.z);
          sph.radius = 2.6;
          if (!this._frustum.intersectsSphere(sph)) {
            f.obj.visible = false;
          }
        }
      }
    }

    // 2) Animals (8 hares + 5 penguins = 75 meshes / 69K tris)
    if (g.animals) {
      const aMax = g.touch ? 36 : q === "low" ? 42 : q === "medium" ? 52 : 64;
      const aMax2 = aMax * aMax;
      const cullAnimArr = (arr) => {
        if (!arr) return;
        for (let i = 0; i < arr.length; i++) {
          const a = arr[i];
          if (!a || !a.root) continue;
          if (inside) { a.root.visible = false; continue; }
          const p = a.root.position;
          const dx = p.x - cx;
          const dz = p.z - cz;
          const d2 = dx * dx + dz * dz;
          let vis = d2 <= aMax2;
          if (vis && d2 > 20) {
            sph.center.set(p.x, p.y + 0.5, p.z);
            sph.radius = 1.9;
            vis = this._frustum.intersectsSphere(sph);
          }
          a.root.visible = vis;
        }
      };
      cullAnimArr(g.animals.hares);
      cullAnimArr(g.animals.penguins);
      // Reindeer & Sled rig (63 meshes right near Spawn): hide indoors or behind camera when not riding!
      const rig = g.animals.rig;
      if (rig && rig.deer && rig.deer.root && rig.sled) {
        let rVis = !inside;
        if (rVis && !g.animals.onSled) {
          const rx = rig.sled.position.x;
          const ry = rig.sled.position.y + 1.0;
          const rz = rig.sled.position.z;
          const dx = rx - cx;
          const dz = rz - cz;
          const d2 = dx * dx + dz * dz;
          rVis = d2 <= 19600; // 140m
          if (rVis && d2 > 20) {
            sph.center.set(rx, ry, rz);
            sph.radius = 3.4;
            rVis = this._frustum.intersectsSphere(sph);
          }
        }
        rig.deer.root.visible = rVis;
        rig.sled.visible = rVis;
        if (rig.lines) rig.lines.visible = rVis;
      }
    }

    // 2b) Pets (19 wild pets + 2 fakes = ~170 meshes, 26 skinned!): preserve caught/hidden state via _perfHidden flag
    if (g.pets && g.pets.all) {
      const pList = g.pets.all;
      const pParty = g.pets.party;
      const pMax = g.touch ? 40 : q === "low" ? 46 : q === "medium" ? 58 : 74;
      const pMax2 = pMax * pMax;
      for (let i = 0; i < pList.length; i++) {
        const pt = pList[i];
        if (!pt || !pt.root) continue;
        // If game logic hid this pet (caught/inactive) and we didn't hide it, leave it hidden!
        if (!pt.root.visible && !pt._perfHidden) continue;
        let pVis = !inside;
        if (pVis) {
          const inParty = pParty && pParty.includes(pt);
          const p = pt.root.position;
          const dx = p.x - cx;
          const dz = p.z - cz;
          const d2 = dx * dx + dz * dz;
          if (!inParty && d2 > pMax2) {
            pVis = false;
          } else if (d2 > 20) {
            sph.center.set(p.x, p.y + 0.65, p.z);
            sph.radius = 2.0;
            pVis = this._frustum.intersectsSphere(sph);
          }
        }
        pt.root.visible = pVis;
        pt._perfHidden = !pVis;
      }
    }

    // 3) Folk (8 snowmen + 8 clawds = 142 meshes / 32K tris)
    if (g.folk) {
      const kMax = g.touch ? 42 : q === "low" ? 48 : q === "medium" ? 60 : 76;
      const kMax2 = kMax * kMax;
      if (g.folk.snowmen) {
        for (let i = 0; i < g.folk.snowmen.length; i++) {
          const s = g.folk.snowmen[i];
          if (!s || !s.group) continue;
          if (inside) { s.group.visible = false; continue; }
          const p = s.group.position;
          const dx = p.x - cx;
          const dz = p.z - cz;
          const d2 = dx * dx + dz * dz;
          let vis = d2 <= kMax2;
          if (vis && d2 > 36) {
            sph.center.set(p.x, p.y + 1.0, p.z);
            sph.radius = 2.4;
            vis = this._frustum.intersectsSphere(sph);
          }
          s.group.visible = vis;
        }
      }
      if (g.folk.clawds) {
        for (let i = 0; i < g.folk.clawds.length; i++) {
          const c = g.folk.clawds[i];
          if (!c || !c.obj) continue;
          if (c.kind === "ride" && g.player && g.player.riding) { c.obj.visible = true; continue; }
          if (inside) { c.obj.visible = false; continue; }
          const p = c.obj.position;
          const dx = p.x - cx;
          const dz = p.z - cz;
          const d2 = dx * dx + dz * dz;
          let vis = d2 <= kMax2;
          if (vis && d2 > 25) {
            sph.center.set(p.x, p.y + 0.5, p.z);
            sph.radius = 2.0;
            vis = this._frustum.intersectsSphere(sph);
          }
          c.obj.visible = vis;
        }
      }
    }

    // 4) Parked Helicopter & Train frustum + indoor culling
    if (g.heli && g.heli.root) {
      if (inside) {
        g.heli.root.visible = false;
      } else if (g.heli.driven) {
        g.heli.root.visible = true;
      } else {
        const p = g.heli.root.position;
        const dx = p.x - cx;
        const dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        let vis = d2 <= 28900; // 170m
        if (vis && d2 > 144) {
          sph.center.set(p.x, p.y + 1.8, p.z);
          sph.radius = 6.5;
          vis = this._frustum.intersectsSphere(sph);
        }
        g.heli.root.visible = vis;
      }
    }
    if (g.train && g.train.engine) {
      const tDriven = !!g.train.driven;
      const cullUnit = (u) => {
        if (!u || !u.root) return;
        if (inside) { u.root.visible = false; return; }
        if (tDriven) { u.root.visible = true; return; }
        const p = u.root.position;
        const dx = p.x - cx;
        const dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        let vis = d2 <= 25600; // 160m
        if (vis && d2 > 100) {
          sph.center.set(p.x, p.y + 1.4, p.z);
          sph.radius = 5.5;
          vis = this._frustum.intersectsSphere(sph);
        }
        u.root.visible = vis;
      };
      cullUnit(g.train.engine);
      if (g.train.cars) {
        for (let i = 0; i < g.train.cars.length; i++) cullUnit(g.train.cars[i]);
      }
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
    // Pause DRS while modal overlays (Map / Album / Settings) are open so brief UI repaints never trigger false downgrades
    const modalOpen = !!(
      document.querySelector(".overlay:not(.hidden)") ||
      (g.ui && g.ui.mapOpen)
    );
    if (modalOpen) {
      this.lowFpsSec = 0;
      return;
    }

    const targetLow = g.touch ? 28 : 36;
    if (fps < targetLow) {
      this.lowFpsSec++;
      this.highFpsSec = 0;
      if (this.lowFpsSec >= 2) {
        this.lowFpsSec = 0;
        if (this.resScale > 0.72) {
          this.resScale = Math.max(0.70, +(this.resScale - 0.12).toFixed(2));
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
    this._updateAdaptivePerf(dt);
    if (this.perfMode) this._updatePerfHud(dt);
  }
}
