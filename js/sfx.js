// 升级版全武器与坐骑程序化音效模块 (Claude & Gemini 双主角独立精调)
// Attaches cleanly onto O.audio (nd instance) without altering ambient/world sounds.

export function enhanceAudio(audio, game) {
  if (!audio || audio._sfxEnhanced) return audio;
  audio._sfxEnhanced = true;

  const isGem = () => !!(game && game.avatar === "gemini");

  // Helper: frequency-swept oscillator with clean ADSR-like envelope + optional reverb send & pan
  function toneSweep(opts) {
    const ctx = audio.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const atk = opts.atk ?? 0.005;
    const dur = opts.dur ?? 0.16;
    const peak = opts.gain ?? 0.06;
    const osc = ctx.createOscillator();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(Math.max(20, opts.f0 || 440), t0);
    if (opts.f1 && opts.f1 !== opts.f0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.f1), t0 + (opts.glide ?? dur));
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + atk);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + atk + dur);

    let out = g;
    if (opts.lp) {
      const flt = ctx.createBiquadFilter();
      flt.type = "lowpass";
      flt.frequency.setValueAtTime(opts.lp, t0);
      osc.connect(flt).connect(g);
    } else {
      osc.connect(g);
    }

    if (opts.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-0.9, Math.min(0.9, opts.pan));
      g.connect(p);
      out = p;
    }

    out.connect(audio.master);
    if (opts.rev && audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = opts.rev;
      out.connect(rg).connect(audio.rev);
    }
    osc.start(t0);
    osc.stop(t0 + atk + dur + 0.08);
  }

  // Helper: filtered noise burst with frequency sweep & optional reverb send
  function noiseSweep(opts) {
    const ctx = audio.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const atk = opts.atk ?? 0.006;
    const dur = opts.dur ?? 0.14;
    const src = ctx.createBufferSource();
    src.buffer = opts.brown ? audio.brown : audio.white;
    src.loop = true;

    const flt = ctx.createBiquadFilter();
    flt.type = opts.filter || "bandpass";
    flt.Q.value = opts.q ?? 1.0;
    flt.frequency.setValueAtTime(Math.max(40, opts.f0 || 900), t0);
    if (opts.f1 && opts.f1 !== opts.f0) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.f1), t0 + (opts.glide ?? dur));
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.linearRampToValueAtTime(opts.gain ?? 0.035, t0 + atk);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + atk + dur);

    src.connect(flt).connect(g);
    g.connect(audio.master);
    if (opts.rev && audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = opts.rev;
      g.connect(rg).connect(audio.rev);
    }
    src.start(t0, Math.random() * 1.4);
    src.stop(t0 + atk + dur + 0.08);
  }

  // Helper: genuine FM-synthesized inharmonic steel blade ring (Euler-Bernoulli bar ratios 1 : 2.756 : 5.404)
  function steelBlade(opts = {}) {
    const ctx = audio.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const base = opts.freq || 780;
    const dur = opts.dur || 0.34;
    const vol = opts.gain || 0.12;
    const bright = opts.bright ?? 1.0;

    // Sharp metallic scrape transient (sawtooth through resonant bandpass)
    const scrape = ctx.createOscillator();
    scrape.type = "sawtooth";
    scrape.frequency.setValueAtTime(base * 1.18, t0);
    scrape.frequency.exponentialRampToValueAtTime(base * (opts.slide ?? 1.48), t0 + Math.min(0.12, dur * 0.45));
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(base * 2.4 * bright, t0);
    bp.frequency.exponentialRampToValueAtTime(base * 4.2 * bright, t0 + Math.min(0.14, dur * 0.5));
    bp.Q.value = 3.6;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(1e-4, t0);
    sg.gain.linearRampToValueAtTime(vol * 0.95, t0 + 0.0025);
    sg.gain.exponentialRampToValueAtTime(1e-4, t0 + Math.min(0.18, dur * 0.65));
    scrape.connect(bp).connect(sg).connect(audio.master);
    if (audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = 0.28;
      sg.connect(rg).connect(audio.rev);
    }
    scrape.start(t0);
    scrape.stop(t0 + Math.min(0.24, dur * 0.75) + 0.04);

    // True inharmonic tempered-steel modal partials (metallic ring, NOT a musical flute!)
    const ratios = [
      [1.0, 0.55, dur],
      [2.756, 0.42 * bright, dur * 0.82],
      [5.404, 0.24 * bright, dur * 0.56],
      [8.93, 0.11 * bright, dur * 0.36]
    ];
    for (const [ratio, amp, d] of ratios) {
      const f = base * ratio;
      if (f > 11500) continue;
      toneSweep({
        delay: (opts.delay || 0) + 0.001,
        type: ratio < 2 ? "triangle" : "sine",
        f0: f * (opts.slide ? 0.96 : 1.0),
        f1: f,
        atk: 0.002,
        dur: d,
        gain: vol * amp,
        rev: 0.34,
        pan: opts.pan || 0
      });
    }
  }

  // Helper: crisp bright metallic brass cat-bell partial cluster (with real sample boost if loaded)
  function catBell(delay = 0, vol = 1, pitch = 1) {
    const base = 1760 * pitch * (0.98 + Math.random() * 0.04);
    toneSweep({ delay, f0: base, dur: 0.24, gain: 0.045 * vol, rev: 0.36 });
    toneSweep({ delay: delay + 0.004, f0: base * 2.32, dur: 0.16, gain: 0.022 * vol, rev: 0.32 });
    toneSweep({ delay: delay + 0.008, f0: base * 3.85, dur: 0.10, gain: 0.012 * vol, rev: 0.28 });
  }

  // Helper: cute subtle harmonic kitty chirp / purr-trill (non-piercing, warm & adorable)
  function kittyChirp(delay = 0, vol = 1, up = true) {
    const fStart = up ? 660 : 940;
    const fMid = up ? 1040 : 720;
    const fEnd = up ? 880 : 620;
    const ctx = audio.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(fStart, t0);
    osc.frequency.exponentialRampToValueAtTime(fMid, t0 + 0.055);
    osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + 0.13);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2100;

    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.linearRampToValueAtTime(0.036 * vol, t0 + 0.018);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.15);

    osc.connect(lp).connect(g).connect(audio.master);
    if (audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = 0.22;
      g.connect(rg).connect(audio.rev);
    }
    osc.start(t0);
    osc.stop(t0 + 0.2);
  }

  // Helper: crystalline celesta / star-harp chord shimmer
  function starArp(freqs, step = 0.035, vol = 1, dur = 0.26) {
    freqs.forEach((f, idx) => {
      const pan = freqs.length > 1 ? -0.28 + (idx / (freqs.length - 1)) * 0.56 : 0;
      toneSweep({ delay: idx * step, f0: f, dur, gain: 0.024 * vol, rev: 0.42, pan });
      toneSweep({ delay: idx * step + 0.004, f0: f * 2, dur: dur * 0.6, gain: 0.008 * vol, rev: 0.3, pan });
    });
  }

  // =========================================================================
  // 1. WEAPON EQUIP SFX (Distinct tactile physical sound for every weapon)
  // =========================================================================
  audio.toolEquip = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    if (!toolId) {
      // Holster / empty hands cloth tuck
      noiseSweep({ f0: 1200, f1: 380, dur: 0.11, gain: 0.065, q: 0.9 });
      toneSweep({ f0: gem ? 540 : 420, f1: gem ? 320 : 260, dur: 0.10, gain: 0.055, rev: 0.15 });
      return;
    }
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒: flexible rod flick + feathery rustle + real brass cat-bell jingle!
        noiseSweep({ f0: 950, f1: 3200, dur: 0.14, gain: 0.095, q: 1.0 });
        this.jingle ? this.jingle(0.75) : catBell(0.01, 1.0, 1.15);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖: crystal staff chime + whimsical arcane wand swirl
        noiseSweep({ f0: 850, f1: 2800, dur: 0.16, gain: 0.085, q: 1.1, rev: 0.24 });
        starArp([784, 1046, 1318, 1760], 0.026, 1.45, 0.22);
        toneSweep({ delay: 0.03, type: "triangle", f0: 360, f1: 680, dur: 0.12, gain: 0.085, rev: 0.2 });
      } else if (toolId === "blaster") {
        // 星弦猫耳光弓: taut bowstring pluck check + limb creak!
        toneSweep({ type: "triangle", f0: 175, f1: 240, dur: 0.16, gain: 0.095, lp: 1200, rev: 0.20 });
        toneSweep({ delay: 0.06, type: "sawtooth", f0: 260, f1: 145, dur: 0.16, gain: 0.085, lp: 1800, rev: 0.26 });
        starArp([988, 1318, 1568], 0.03, 1.1, 0.20);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: weighty mallet heft thump + plush bounce + brass bell
        toneSweep({ type: "sine", f0: 155, f1: 64, dur: 0.13, gain: 0.16 });
        noiseSweep({ brown: true, f0: 460, f1: 180, dur: 0.14, gain: 0.11, q: 0.65 });
        catBell(0.02, 1.1, 0.96);
      } else if (toolId === "sword") {
        // 双子星芒刃: SHARP METALLIC CRYSTAL-STEEL UNSHEATHE "SHIIIIING!"
        noiseSweep({ filter: "highpass", f0: 1800, f1: 6800, dur: 0.20, gain: 0.15, q: 1.8, rev: 0.28 });
        noiseSweep({ f0: 950, f1: 3800, dur: 0.18, gain: 0.12, q: 1.4, rev: 0.24 });
        steelBlade({ delay: 0.015, freq: 920, dur: 0.44, gain: 0.15, bright: 1.25, slide: 1.38 });
        starArp([1568, 2093, 2637], 0.022, 0.95, 0.24);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: crisp wooden handle grab + taut mesh cloth snap
        noiseSweep({ f0: 650, f1: 2100, dur: 0.15, gain: 0.11, q: 0.85 });
        toneSweep({ type: "triangle", f0: 240, f1: 380, dur: 0.09, gain: 0.095 });
      } else if (toolId === "cane") {
        // 糖果手杖: hard glossy candy-wood clack
        toneSweep({ type: "triangle", f0: 320, f1: 180, dur: 0.09, gain: 0.12 });
        toneSweep({ f0: 1480, dur: 0.14, gain: 0.065, rev: 0.22 });
        toneSweep({ delay: 0.035, f0: 2120, dur: 0.12, gain: 0.052, rev: 0.24 });
      } else if (toolId === "blaster") {
        // 雪枪: crisp pneumatic snow-cannon chamber cock + air hiss
        noiseSweep({ f0: 2800, f1: 900, dur: 0.08, gain: 0.12, q: 1.3 });
        toneSweep({ type: "triangle", f0: 360, f1: 720, dur: 0.09, gain: 0.12 });
        toneSweep({ delay: 0.06, type: "square", f0: 980, f1: 620, dur: 0.04, gain: 0.065, lp: 2400 });
      } else if (toolId === "hammer") {
        // 玩具锤: hollow rubber mallet tap + playful squeak
        toneSweep({ type: "sine", f0: 195, f1: 88, dur: 0.11, gain: 0.15 });
        toneSweep({ delay: 0.025, type: "triangle", f0: 760, f1: 1180, dur: 0.08, gain: 0.075 });
      } else if (toolId === "sword") {
        // Claude 之剑: FORGED SOLAR-STEEL GREATSWORD UNSHEATHE "SHIIIIING!"
        noiseSweep({ filter: "highpass", f0: 1600, f1: 6200, dur: 0.22, gain: 0.16, q: 1.7, rev: 0.28 });
        noiseSweep({ f0: 820, f1: 3200, dur: 0.20, gain: 0.13, q: 1.2, rev: 0.24 });
        steelBlade({ delay: 0.015, freq: 760, dur: 0.48, gain: 0.16, bright: 1.15, slide: 1.32 });
      }
    }
  };

  // =========================================================================
  // 2. MELEE TOOL SWING & HIT SFX (Authentic Weight, Air-Cut & Material Impact!)
  // =========================================================================
  audio.toolSwing = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒: elastic rod whip + feather flutter + brass jingle!
        noiseSweep({ f0: 820 * p, f1: 3400 * p, dur: 0.18, gain: 0.13, q: 1.0, rev: 0.20 });
        toneSweep({ type: "triangle", f0: 340 * p, f1: 920 * p, dur: 0.12, gain: 0.065 });
        this.jingle ? this.jingle(0.78) : catBell(0.02, 1.2, 1.15 * p);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖: brisk staff-cast swirl + sparkling banana magic burst
        noiseSweep({ f0: 760 * p, f1: 2800 * p, dur: 0.17, gain: 0.12, q: 1.1, rev: 0.22 });
        toneSweep({ type: "triangle", f0: 360 * p, f1: 780 * p, dur: 0.13, gain: 0.09, lp: 2400, rev: 0.22 });
        starArp([988 * p, 1318 * p, 1760 * p], 0.022, 1.25, 0.18);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: heavy air-cleaving warhammer wind-roar + bell!
        noiseSweep({ brown: true, f0: 360 * p, f1: 120, dur: 0.28, gain: 0.18, q: 0.55, rev: 0.20 });
        noiseSweep({ f0: 280 * p, f1: 1350 * p, dur: 0.25, gain: 0.15, q: 0.72, rev: 0.18 });
        toneSweep({ type: "sine", f0: 220 * p, f1: 95, dur: 0.22, gain: 0.11 });
        catBell(0.04, 1.1, 0.95 * p);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: wide taut mesh-cloth air-scoop "FWOOOP-SNAP!"
        noiseSweep({ f0: 420 * p, f1: 1750 * p, dur: 0.21, gain: 0.14, q: 0.75, rev: 0.16 });
        noiseSweep({ delay: 0.04, f0: 1850 * p, f1: 750 * p, dur: 0.14, gain: 0.095, q: 1.1 });
        toneSweep({ type: "triangle", f0: 240 * p, f1: 480 * p, dur: 0.11, gain: 0.065 });
      } else if (toolId === "cane") {
        // 糖果手杖: brisk solid wooden-candy stick crack-whoosh
        noiseSweep({ f0: 540 * p, f1: 2300 * p, dur: 0.15, gain: 0.14, q: 0.95, rev: 0.14 });
        toneSweep({ type: "triangle", f0: 320 * p, f1: 740 * p, dur: 0.11, gain: 0.085 });
      } else if (toolId === "hammer") {
        // 玩具锤: chunky weighty comic mallet swing whistle
        noiseSweep({ brown: true, f0: 380 * p, f1: 130, dur: 0.27, gain: 0.17, q: 0.58 });
        noiseSweep({ f0: 290 * p, f1: 1280 * p, dur: 0.25, gain: 0.15, q: 0.72, rev: 0.14 });
        toneSweep({ type: "sine", f0: 280 * p, f1: 140 * p, dur: 0.20, gain: 0.11 });
      }
    }
  };

  audio.toolImpact = function (toolId, gem = isGem(), heavy = false) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒: snappy starlight lure-ring capture pop + bell chime
        noiseSweep({ f0: 1800, f1: 680, dur: 0.12, gain: 0.095, q: 0.9 });
        toneSweep({ type: "triangle", f0: 280, f1: 520, dur: 0.09, gain: 0.095 });
        starArp([1318 * p, 1568 * p, 2093 * p], 0.025, 1.3, 0.22);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖: comedic bouncy magic banana BONK + golden sparkle!
        toneSweep({ type: "sine", f0: 190 * p, f1: 68, dur: 0.14, gain: 0.18 });
        toneSweep({ type: "triangle", f0: 280 * p, f1: 760 * p, dur: 0.12, gain: 0.15, rev: 0.20 });
        toneSweep({ delay: 0.06, type: "sine", f0: 740 * p, f1: 360 * p, dur: 0.12, gain: 0.11, rev: 0.20 });
        starArp([1318 * p, 1760 * p, 2093 * p], 0.022, heavy ? 1.45 : 1.15, 0.22);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: HUGE ground-shaking sub-bass slam + plush paw bounce + brass bells!
        toneSweep({ type: "sine", f0: 152 * p, f1: 34, dur: 0.34, gain: 0.30, rev: 0.28 });
        toneSweep({ type: "triangle", f0: 280 * p, f1: 64, dur: 0.18, gain: 0.18 });
        noiseSweep({ brown: true, f0: 680, f1: 140, dur: 0.28, gain: 0.20, q: 0.55, rev: 0.26 });
        noiseSweep({ delay: 0.01, f0: 2200, f1: 640, dur: 0.16, gain: 0.11, q: 0.85 });
        kittyChirp(0.025, 1.2, true);
        this.jingle ? this.jingle(0.95) : catBell(0.02, 1.3, 1.0 * p);
        starArp([1046, 1318, 1568, 2093], 0.028, 1.25, 0.28);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: solid snow-thump + mesh slap
        toneSweep({ type: "sine", f0: 145 * p, f1: 58, dur: 0.12, gain: 0.15 });
        noiseSweep({ f0: 1100, f1: 380, dur: 0.11, gain: 0.11, q: 0.7 });
      } else if (toolId === "cane") {
        // 糖果手杖: crisp hard-glazed wood-candy BONK + brittle sugar clack!
        toneSweep({ type: "triangle", f0: 240 * p, f1: 68, dur: 0.14, gain: 0.22 });
        toneSweep({ f0: 1180 * p, f1: 1060 * p, dur: 0.13, gain: 0.095, rev: 0.24 });
        toneSweep({ delay: 0.01, f0: 2240 * p, dur: 0.09, gain: 0.055, rev: 0.22 });
        noiseSweep({ f0: 2100 * p, f1: 620, dur: 0.08, gain: 0.13, q: 1.0 });
      } else if (toolId === "hammer") {
        // 玩具锤: booming hollow rubber mallet SLAM + loud expressive double squeaker!
        toneSweep({ type: "sine", f0: 158 * p, f1: 42, dur: 0.28, gain: 0.28, rev: 0.22 });
        noiseSweep({ brown: true, f0: 720, f1: 180, dur: 0.24, gain: 0.18, q: 0.6, rev: 0.20 });
        toneSweep({ delay: 0.006, type: "triangle", f0: 680 * p, f1: 1360 * p, dur: 0.10, gain: 0.15, lp: 2800, rev: 0.2 });
        toneSweep({ delay: 0.11, type: "triangle", f0: 1240 * p, f1: 700 * p, dur: 0.11, gain: 0.13, lp: 2500, rev: 0.2 });
      }
    }
  };

  // Keep legacy squeak() delegating to the upgraded hammer impact for full backward compatibility
  audio.squeak = function () {
    this.toolImpact("hammer", isGem(), true);
  };

  // =========================================================================
  // 3. RANGED WEAPON SFX (Claude 雪枪 vs Gemini 星弦猫耳光弓)
  // =========================================================================
  let bowStep = 0;
  const bowScale = [880, 988, 1175, 1318, 1568, 1318, 1175, 988];

  audio.gunShot = function () {
    if (!this.ctx) return;
    const p = 0.93 + Math.random() * 0.14;
    if (isGem()) {
      this.bowRelease(0.5);
    } else {
      // Claude 雪枪: punchy pneumatic snow-cannon POP-THOOM + compressed-air blast!
      toneSweep({ type: "sine", f0: 240 * p, f1: 54, dur: 0.13, gain: 0.25 });
      toneSweep({ type: "triangle", f0: 460 * p, f1: 105, dur: 0.09, gain: 0.14 });
      noiseSweep({ f0: 2800 * p, f1: 420 * p, dur: 0.13, gain: 0.18, q: 0.68, rev: 0.16 });
      noiseSweep({ delay: 0.008, filter: "highpass", f0: 3800, f1: 1600, dur: 0.07, gain: 0.09, q: 1.1 });
    }
  };

  audio.gunSplat = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.92 + Math.random() * 0.16;
    if (isGem()) {
      this.bowArrowStick(vol, hard);
    } else {
      // Crisp packed-snowball wet SPLAT-CRUNCH + impact thud
      noiseSweep({ f0: 1850 * p, f1: 380, dur: 0.14, gain: 0.14 * vol, q: 0.52 });
      noiseSweep({ delay: 0.012, f0: 860 * p, f1: 280, dur: 0.10, gain: 0.09 * vol, q: 0.85 });
      toneSweep({ type: "sine", f0: (hard ? 180 : 125) * p, f1: 42, dur: 0.11, gain: (hard ? 0.20 : 0.12) * vol });
    }
  };

  audio.gunHit = function (big = false) {
    if (!this.ctx) return;
    if (isGem()) {
      starArp(big ? [1318, 1760, 2093, 2637] : [1318, 1975], 0.030, big ? 1.4 : 1.15, big ? 0.26 : 0.18);
      if (big) catBell(0.06, 1.15, 1.35);
    } else {
      toneSweep({ f0: 1397, dur: 0.08, gain: 0.095, rev: 0.16 });
      toneSweep({ delay: 0.04, f0: 1760, dur: 0.12, gain: 0.085, rev: 0.22 });
      if (big) {
        toneSweep({ delay: 0.08, f0: 2349, dur: 0.22, gain: 0.075, rev: 0.35 });
      }
    }
  };

  audio.gunPack = function () {
    if (!this.ctx) return;
    if (isGem()) {
      starArp([587, 784, 988, 1175, 1568, 1975], 0.095, 1.0, 0.28);
    } else {
      for (const d of [0.10, 0.48]) {
        noiseSweep({ delay: d, f0: 1350, f1: 380, dur: 0.20, gain: 0.12, q: 0.72 });
        toneSweep({ delay: d + 0.02, type: "sine", f0: 145, f1: 75, dur: 0.12, gain: 0.10 });
      }
    }
  };

  audio.gunReady = function () {
    if (!this.ctx) return;
    if (isGem()) {
      catBell(0, 1.1, 1.2);
      starArp([1568, 2093], 0.04, 1.1, 0.20);
    } else {
      noiseSweep({ f0: 2800, f1: 1400, dur: 0.04, gain: 0.10, q: 1.5 });
      toneSweep({ f0: 880, dur: 0.07, gain: 0.085 });
      toneSweep({ delay: 0.045, f0: 1318, dur: 0.10, gain: 0.075, rev: 0.18 });
    }
  };

  audio.gunDry = function () {
    if (!this.ctx) return;
    if (isGem()) {
      toneSweep({ type: "triangle", f0: 520, f1: 420, dur: 0.06, gain: 0.06 });
    } else {
      noiseSweep({ f0: 3200, f1: 1800, dur: 0.03, gain: 0.085, q: 1.8 });
    }
  };

  // =========================================================================
  // 3B. REAL PHYSICAL BOWSTRING DRAW/TWANG, BANANA MAGIC & CAT-LURE SFX!
  // =========================================================================
  audio.bowDrawStart = function () {
    if (!this.ctx) return;
    // Authentic bow limb tension creak + taut bowstring pull stretch!
    toneSweep({ type: "sawtooth", f0: 115, f1: 275, dur: 0.52, gain: 0.062, lp: 920, rev: 0.18 });
    toneSweep({ delay: 0.08, type: "triangle", f0: 240, f1: 520, dur: 0.45, gain: 0.055, lp: 1600, rev: 0.22 });
    noiseSweep({ f0: 950, f1: 2800, dur: 0.42, gain: 0.058, q: 1.9, rev: 0.16 });
  };

  audio.bowFull = function () {
    if (!this.ctx) return;
    // Crisp taut-string lock PING + celestial full-draw chime!
    steelBlade({ freq: 1180, dur: 0.28, gain: 0.095, bright: 1.25 });
    starArp([1046.5, 1318.5, 1568, 2093], 0.024, 1.4, 0.30);
  };

  audio.bowRelease = function (charge = 0.5) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const isFull = charge >= 0.85;
    const note = bowScale[bowStep++ % bowScale.length] * (isFull ? 1.12 : 0.94 + charge * 0.18);
    // 1) REAL TAUT BOWSTRING SNAP "TWAAAANG-THWUP!" (plucked saw/triangle drop + string body)
    toneSweep({ type: "sawtooth", f0: (195 + charge * 135) * p, f1: 72 * p, dur: 0.18, gain: 0.14 + charge * 0.11, lp: 1650, rev: 0.22 });
    toneSweep({ type: "triangle", f0: (145 + charge * 90) * p, f1: 58 * p, dur: 0.14, gain: 0.15 + charge * 0.10, rev: 0.16 });
    // 2) RAZOR-SHARP FEATHERED ARROW SLICING WINTER AIR "FWWWWIP!"
    noiseSweep({ filter: "highpass", f0: (1800 + charge * 2600) * p, f1: 700 * p, dur: 0.12 + charge * 0.09, gain: 0.12 + charge * 0.11, q: 1.5, rev: 0.22 });
    noiseSweep({ f0: (1100 + charge * 1800) * p, f1: 420 * p, dur: 0.14 + charge * 0.08, gain: 0.11 + charge * 0.09, q: 1.1, rev: 0.18 });
    // 3) Subtle starlight harmonic tail (enhances without replacing real bow twang!)
    toneSweep({ type: "sine", f0: note, f1: note * 0.985, dur: 0.20 + charge * 0.12, gain: 0.055 + charge * 0.035, rev: 0.36 });
    if (isFull) {
      steelBlade({ delay: 0.01, freq: 1320, dur: 0.26, gain: 0.085, bright: 1.3 });
      starArp([1568, 2093, 2637], 0.020, 1.2, 0.24);
    }
  };

  audio.bowArrowStick = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.93 + Math.random() * 0.14;
    // Authentic solid wooden arrow embed "THWACK-TWANG!" + vibrating shaft!
    toneSweep({ type: "sine", f0: (hard ? 260 : 185) * p, f1: 54, dur: 0.10, gain: (hard ? 0.22 : 0.16) * vol });
    toneSweep({ delay: 0.012, type: "triangle", f0: (hard ? 190 : 145) * p, f1: 120 * p, dur: 0.16, gain: 0.11 * vol, lp: 900 });
    noiseSweep({ f0: hard ? 2800 : 1650, f1: 420, dur: 0.08, gain: 0.12 * vol, q: 0.9 });
  };

  audio.bowArrowBurst = function (vol = 1) {
    if (!this.ctx) return;
    // Full-draw piercing arrow star-shatter boom!
    toneSweep({ type: "sine", f0: 185, f1: 42, dur: 0.26, gain: 0.26 * vol, rev: 0.28 });
    noiseSweep({ f0: 3600, f1: 680, dur: 0.18, gain: 0.15 * vol, q: 0.85, rev: 0.30 });
    steelBlade({ freq: 1120, dur: 0.34, gain: 0.11 * vol, bright: 1.35 });
    starArp([1046.5, 1318.5, 1760, 2093, 2637], 0.024, 1.4 * vol, 0.34);
  };

  audio.bananaCast = function () {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    // Whimsical magic wand burst + spinning boomerang whir-whir-whoosh!
    starArp([784 * p, 988 * p, 1318 * p, 1760 * p], 0.024, 1.35, 0.24);
    toneSweep({ delay: 0.02, type: "triangle", f0: 340 * p, f1: 780 * p, dur: 0.16, gain: 0.13, lp: 2400, rev: 0.22 });
    noiseSweep({ f0: 620 * p, f1: 2200 * p, dur: 0.20, gain: 0.12, q: 1.0, rev: 0.20 });
    noiseSweep({ delay: 0.11, f0: 1400 * p, f1: 620 * p, dur: 0.16, gain: 0.085, q: 1.2, rev: 0.18 });
  };

  audio.bananaHit = function () {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    // Juicy comedic magic banana-splat BOING-POP + golden burst!
    toneSweep({ type: "sine", f0: 180 * p, f1: 62, dur: 0.14, gain: 0.20 });
    toneSweep({ type: "triangle", f0: 250 * p, f1: 820 * p, dur: 0.12, gain: 0.18, rev: 0.22 });
    toneSweep({ delay: 0.08, type: "sine", f0: 780 * p, f1: 290 * p, dur: 0.15, gain: 0.15, rev: 0.22 });
    starArp([1175 * p, 1568 * p, 2093 * p], 0.024, 1.35, 0.26);
  };

  audio.lureChime = function () {
    if (!this.ctx) return;
    this.jingle ? this.jingle(0.95) : catBell(0.0, 1.3, 1.2);
    starArp([1318, 1568, 2093], 0.030, 1.2, 0.24);
  };

  // =========================================================================
  // 4. VISCERAL SWORD COMBO & BLADE SFX (Claude 之剑 & Gemini 双子星芒刃!)
  //    Genuine dual-band razor air-shear + inharmonic FM forged steel resonance + heavy impact punch!
  // =========================================================================
  audio.swordSwish = function (power = 1.1, moveId = "") {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const isSpin = moveId === "spin" || power >= 1.8;
    const isCut3 = moveId === "cut3" || (power >= 1.4 && power < 1.8);
    const isCut2 = moveId === "cut2";
    const gem = isGem();

    if (isSpin) {
      // 360° WHIRLWIND GREATSWORD CYCLONE: 3 stereo-sweeping razor blade slashes + roaring steel ring!
      const pans = [-0.65, 0.0, 0.65];
      pans.forEach((pan, idx) => {
        const d = idx * 0.135;
        const sc = 0.94 + idx * 0.12;
        noiseSweep({ delay: d, brown: true, f0: 420 * sc, f1: 140, dur: 0.22, gain: 0.20, q: 0.6, rev: 0.24 });
        noiseSweep({ delay: d, filter: "highpass", f0: 1500 * sc, f1: 5800 * sc, dur: 0.18, gain: 0.18, q: 1.5, rev: 0.26 });
        steelBlade({ delay: d + 0.01, freq: (gem ? 860 : 720) * sc, dur: 0.34, gain: 0.13, bright: gem ? 1.28 : 1.12, slide: 1.35, pan });
      });
      toneSweep({ type: "sine", f0: 150, f1: 56, dur: 0.38, gain: 0.22, rev: 0.26 });
      if (gem) starArp([1318, 1760, 2093, 2637], 0.075, 1.0, 0.28);
      return;
    }

    // Standard 3-hit Escalating Blade Combo: cut1 (snappy diagonal) -> cut2 (sharp reverse) -> cut3 (heavy cleave!)
    const pitch = isCut3 ? 0.84 : isCut2 ? 1.14 : 1.0;
    const dur = isCut3 ? 0.28 : isCut2 ? 0.17 : 0.19;
    const heavyGain = isCut3 ? 1.35 : 1.0;

    // Layer 1: Weighty low-mid air-pressure WHOOSH ("SHWOO!")
    noiseSweep({ brown: true, f0: 520 * pitch * p, f1: 140 * pitch, dur: dur * 1.1, gain: 0.17 * heavyGain, q: 0.62, rev: 0.20 });
    // Layer 2: Razor-sharp high-velocity blade edge slice ("SHK-KSHHH!")
    noiseSweep({ filter: "bandpass", f0: 950 * pitch * p, f1: 4800 * pitch * p, dur: dur * 0.92, gain: 0.18 * heavyGain, q: 1.4, rev: 0.24 });
    noiseSweep({ delay: 0.012, filter: "highpass", f0: 2600 * pitch * p, f1: 6400 * pitch * p, dur: dur * 0.65, gain: 0.11 * heavyGain, q: 1.8, rev: 0.22 });
    // Layer 3: Genuine Inharmonic Steel Blade Ring ("SHING!")
    steelBlade({
      delay: 0.008,
      freq: (gem ? 900 : 740) * pitch * p,
      dur: isCut3 ? 0.44 : 0.26,
      gain: (isCut3 ? 0.16 : 0.11) * (gem ? 1.05 : 1.0),
      bright: gem ? 1.30 : 1.10,
      slide: isCut2 ? 1.42 : isCut3 ? 1.22 : 1.30
    });

    if (isCut3) {
      // Heavy 3rd-combo finisher sub-bass air-cleave punch!
      toneSweep({ type: "sine", f0: 175 * p, f1: 44, dur: 0.24, gain: 0.24, rev: 0.24 });
      toneSweep({ type: "triangle", f0: 320 * p, f1: 92, dur: 0.18, gain: 0.14, rev: 0.20 });
      if (gem) starArp([1568, 2093, 2637], 0.025, 1.05, 0.26);
    }
  };

  audio.swordHit = function (heavy = false) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    const gem = isGem();
    // 1) Instant visceral 1.5ms metallic clash & flesh/snow-impact CRACK-PUNCH!
    toneSweep({ type: "sine", f0: (heavy ? 148 : 190) * p, f1: 36, dur: heavy ? 0.28 : 0.15, gain: heavy ? 0.30 : 0.20, rev: 0.24 });
    toneSweep({ type: "sawtooth", f0: (heavy ? 310 : 420) * p, f1: 78, dur: heavy ? 0.14 : 0.08, gain: heavy ? 0.16 : 0.11, lp: 1800 });
    noiseSweep({ filter: "highpass", f0: 2400 * p, f1: 6800 * p, dur: 0.065, gain: heavy ? 0.20 : 0.15, q: 1.2, rev: 0.22 });
    // 2) Authentic ringing forged steel CLANG!
    steelBlade({
      freq: (gem ? 980 : 810) * p,
      dur: heavy ? 0.52 : 0.32,
      gain: heavy ? 0.18 : 0.13,
      bright: gem ? 1.32 : 1.15
    });
    if (heavy) {
      noiseSweep({ brown: true, f0: 760, f1: 140, dur: 0.30, gain: 0.22, q: 0.55, rev: 0.28 });
      if (gem) starArp([1318, 1760, 2093, 2637], 0.022, 1.15, 0.32);
    }
  };

  audio.swordFull = function () {
    if (!this.ctx) return;
    const gem = isGem();
    // Energized sword full-charge lock "SHING-CHIME!"
    noiseSweep({ filter: "highpass", f0: 2200, f1: 6800, dur: 0.16, gain: 0.12, q: 1.8, rev: 0.28 });
    steelBlade({ freq: gem ? 1080 : 880, dur: 0.42, gain: 0.15, bright: 1.30, slide: 1.28 });
    starArp(gem ? [1175, 1568, 2093, 2637] : [784, 1046, 1318, 1760], 0.032, 1.15, 0.32);
  };

  audio.swordWave = function () {
    if (!this.ctx) return;
    const gem = isGem();
    // Soaring blade-energy shockwave cutting across the snowfield!
    toneSweep({ type: "sine", f0: 185, f1: 52, dur: 0.34, gain: 0.24, rev: 0.30 });
    noiseSweep({ brown: true, f0: 540, f1: 160, dur: 0.45, gain: 0.18, q: 0.65, rev: 0.32 });
    noiseSweep({ f0: 750, f1: 4200, dur: 0.40, gain: 0.17, q: 1.1, rev: 0.34 });
    steelBlade({ delay: 0.015, freq: gem ? 940 : 760, dur: 0.48, gain: 0.15, bright: gem ? 1.32 : 1.15, slide: 1.45 });
    if (gem) starArp([1046, 1568, 2093], 0.04, 1.15, 0.34);
  };

  audio.swordPlunge = function () {
    if (!this.ctx) return;
    const gem = isGem();
    // Screaming high-speed downward plunge-attack blade dive!
    noiseSweep({ f0: 3600, f1: 420, dur: 0.32, gain: 0.18, q: 1.1, rev: 0.24 });
    noiseSweep({ brown: true, f0: 680, f1: 180, dur: 0.30, gain: 0.16, q: 0.65 });
    steelBlade({ freq: gem ? 1140 : 920, dur: 0.30, gain: 0.13, bright: 1.25, slide: 0.65 });
    toneSweep({ type: "triangle", f0: gem ? 1280 : 880, f1: 220, dur: 0.28, gain: 0.11, rev: 0.25 });
  };

  // =========================================================================
  // 5. MAGICAL SKY-CAT MOUNT AUDIO (Replaces Helicopter Rotor for Gemini!)
  // =========================================================================
  const origRotor = audio.rotor.bind(audio);
  let chimeCd = 0;
  const skyNotes = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];

  audio.mountStart = function (gem = isGem()) {
    if (!this.ctx) return;
    if (gem) {
      kittyChirp(0.02, 0.85, true);
      starArp([784, 988, 1318, 1568, 2093], 0.042, 0.78, 0.35);
      catBell(0.14, 0.75, 1.15);
    } else {
      audio.pick();
    }
  };

  audio.rotor = function (vol, load = 0, gem = isGem()) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (!gem) {
      // Silence sky-cat synth cleanly if it was active
      if (this._catFly) {
        this._catFly.out.gain.setTargetAtTime(0, now, 0.12);
      }
      return origRotor(vol, load);
    }

    // Silence Claude's helicopter rotor cleanly if it was active
    if (this.rot) {
      this.rot.out.gain.setTargetAtTime(0, now, 0.12);
    }

    if (!this._catFly) {
      if (vol < 0.01) return;
      // 1) Airy feathered wingbeat breeze (bandpass brown noise gently pulsed by wingbeat LFO)
      const breeze = ctx.createBufferSource();
      breeze.buffer = this.brown;
      breeze.loop = true;
      const wingFlt = ctx.createBiquadFilter();
      wingFlt.type = "bandpass";
      wingFlt.frequency.value = 520;
      wingFlt.Q.value = 0.65;
      const wingAmp = ctx.createGain();
      wingAmp.gain.value = 0.48;
      const wingLfo = ctx.createOscillator();
      wingLfo.type = "sine";
      wingLfo.frequency.value = 2.2;
      const wingMod = ctx.createGain();
      wingMod.gain.value = 0.34;
      wingLfo.connect(wingMod).connect(wingAmp.gain);

      // 2) Warm cozy celestial cat-purr pad (gentle 96 Hz triangle + 26 Hz soft purr flutter)
      const purrOsc = ctx.createOscillator();
      purrOsc.type = "triangle";
      purrOsc.frequency.value = 92;
      const purrLp = ctx.createBiquadFilter();
      purrLp.type = "lowpass";
      purrLp.frequency.value = 260;
      const purrAmp = ctx.createGain();
      purrAmp.gain.value = 0.09;
      const purrLfo = ctx.createOscillator();
      purrLfo.type = "sine";
      purrLfo.frequency.value = 26;
      const purrMod = ctx.createGain();
      purrMod.gain.value = 0.045;
      purrLfo.connect(purrMod).connect(purrAmp.gain);

      // 3) Dreamy aurora shimmer harmonic (soft high fifth)
      const padOsc = ctx.createOscillator();
      padOsc.type = "sine";
      padOsc.frequency.value = 392;
      const padAmp = ctx.createGain();
      padAmp.gain.value = 0.022;

      const out = ctx.createGain();
      out.gain.value = 0;

      breeze.connect(wingFlt).connect(wingAmp).connect(out);
      purrOsc.connect(purrLp).connect(purrAmp).connect(out);
      padOsc.connect(padAmp).connect(out);

      out.connect(this.master);
      if (this.rev) {
        const revSend = ctx.createGain();
        revSend.gain.value = 0.34;
        out.connect(revSend).connect(this.rev);
      }

      breeze.start();
      wingLfo.start();
      purrOsc.start();
      purrLfo.start();
      padOsc.start();

      this._catFly = { wingFlt, wingLfo, purrOsc, padOsc, out };
    }

    const cf = this._catFly;
    const k = Math.min(1, vol * 3.2);
    cf.out.gain.setTargetAtTime(0.24 * vol * vol, now, 0.14);
    cf.wingLfo.frequency.setTargetAtTime(1.5 + 1.9 * load, now, 0.25);
    cf.wingFlt.frequency.setTargetAtTime(420 + 420 * k + 340 * load, now, 0.25);
    cf.purrOsc.frequency.setTargetAtTime(84 + 28 * k + 14 * load, now, 0.25);
    cf.padOsc.frequency.setTargetAtTime(392 + 131 * load, now, 0.35);

    // Occasional twinkling celestial wind-chime sparkle while soaring!
    if (vol > 0.38 && now > chimeCd) {
      chimeCd = now + (load > 0.35 ? 0.42 : 0.95) + Math.random() * 0.55;
      const note = skyNotes[Math.floor(Math.random() * skyNotes.length)];
      toneSweep({
        f0: note,
        dur: 0.42,
        gain: 0.011 * vol * (0.6 + 0.5 * load),
        rev: 0.52,
        pan: (Math.random() - 0.5) * 0.7
      });
    }
  };

  // =========================================================================
  // 6. WORLD, MOVEMENT, INTERACTION & SPATIAL AMBIENT AUDIO OVERHAUL
  // =========================================================================

  // Tactile layered footsteps across Snow, Crystal Ice, Glacial Water, and Timber Wood!
  audio.step = function (surface, vol = 1) {
    if (!this.ctx) return;
    const p = 0.88 + Math.random() * 0.24;
    if (surface === "wood") {
      // Warm resonant hollow timber plank footstep
      toneSweep({ type: "triangle", f0: 112 * p, f1: 64 * p, dur: 0.085, gain: 0.072 * vol });
      noiseSweep({ f0: 760 * p, f1: 420 * p, dur: 0.045, gain: 0.016 * vol, q: 1.1 });
    } else if (surface === "water") {
      // Bubbling glacial splash + sparkling droplet plink!
      noiseSweep({ f0: 1850 * p, f1: 620 * p, dur: 0.17, gain: 0.032 * vol, q: 0.75, rev: 0.22 });
      toneSweep({ delay: 0.018, f0: 360 * p, f1: 720 * p, dur: 0.07, gain: 0.018 * vol, rev: 0.26 });
      if (Math.random() < 0.6) {
        toneSweep({ delay: 0.055, f0: 980 * p, f1: 1420 * p, dur: 0.055, gain: 0.010 * vol, rev: 0.28 });
      }
    } else if (surface === "ice") {
      // Crisp skate-edge crystal scrape + faint hollow glacial lake-ice resonance!
      noiseSweep({ f0: 2700 * p, f1: 1450 * p, dur: 0.048, gain: 0.022 * vol, q: 1.4, rev: 0.20 });
      toneSweep({ f0: 165 * p, f1: 118 * p, dur: 0.085, gain: 0.022 * vol, rev: 0.26 });
      toneSweep({ delay: 0.008, f0: 2450 * p, dur: 0.045, gain: 0.007 * vol, rev: 0.22 });
    } else {
      // Crisp packed-snow dual-layer crunch (ice-grain high crackle + warm snow compression!)
      noiseSweep({ f0: 1350 * p, f1: 720 * p, dur: 0.095, gain: 0.034 * vol, q: 0.85 });
      noiseSweep({ delay: 0.022, f0: 2800 * p, f1: 1200 * p, dur: 0.065, gain: 0.016 * vol, q: 1.1 });
      noiseSweep({ delay: 0.03, brown: true, f0: 520 * p, f1: 240 * p, dur: 0.13, gain: 0.028 * vol, q: 0.7 });
    }
  };

  // Nimble coat-flutter jump + crisp surface-aware landing
  audio.hop = function (pitch = 1) {
    if (!this.ctx) return;
    noiseSweep({ f0: 620 * pitch, f1: 1680 * pitch, dur: 0.10, gain: 0.024, q: 0.85 });
    toneSweep({ type: "sine", f0: 240 * pitch, f1: 420 * pitch, dur: 0.09, gain: 0.022, rev: 0.16 });
    if (pitch > 1.05) {
      starArp([1046.5 * Math.min(1.4, pitch * 0.75), 1318.5 * Math.min(1.4, pitch * 0.75)], 0.028, 0.55, 0.20);
    }
  };

  audio.land = function (surface, vol = 1) {
    if (!this.ctx) return;
    const p = 0.92 + Math.random() * 0.16;
    if (surface === "wood") {
      toneSweep({ type: "triangle", f0: 95 * p, f1: 48, dur: 0.14, gain: 0.11 * vol });
      noiseSweep({ f0: 680, f1: 320, dur: 0.06, gain: 0.022 * vol, q: 1.0 });
    } else if (surface === "ice") {
      toneSweep({ f0: 130 * p, f1: 74, dur: 0.13, gain: 0.062 * vol, rev: 0.30 });
      noiseSweep({ f0: 2400 * p, f1: 1100, dur: 0.06, gain: 0.028 * vol, q: 1.3, rev: 0.24 });
      toneSweep({ delay: 0.01, f0: 2150 * p, dur: 0.08, gain: 0.012 * vol, rev: 0.32 });
    } else if (surface === "water") {
      noiseSweep({ f0: 1600, f1: 450, dur: 0.22, gain: 0.052 * vol, q: 0.7, rev: 0.25 });
      toneSweep({ f0: 210, f1: 80, dur: 0.14, gain: 0.065 * vol });
    } else {
      noiseSweep({ f0: 980 * p, f1: 420, dur: 0.14, gain: 0.050 * vol, q: 0.7 });
      noiseSweep({ delay: 0.02, brown: true, f0: 460, f1: 190, dur: 0.20, gain: 0.045 * vol, q: 0.6 });
      toneSweep({ type: "sine", f0: 82 * p, f1: 42, dur: 0.12, gain: 0.062 * vol });
    }
  };

  // Lush festive Fireworks launch & stereo sparkling explosion!
  audio.rocket = function () {
    if (!this.ctx) return;
    noiseSweep({ f0: 780, f1: 3900, dur: 0.88, gain: 0.026, q: 2.2, rev: 0.30 });
    toneSweep({ type: "sine", f0: 620, f1: 1980, dur: 0.76, gain: 0.014, rev: 0.32 });
  };

  audio.boom = function (vol = 1, big = false) {
    if (!this.ctx) return;
    toneSweep({ type: "sine", f0: big ? 105 : 132, f1: 32, dur: big ? 0.58 : 0.42, gain: 0.19 * vol, rev: 0.45 });
    noiseSweep({ brown: true, f0: 820, f1: 140, dur: big ? 0.45 : 0.32, gain: 0.085 * vol, q: 0.55, rev: 0.40 });
    // Cascading stereo firework crackle sparkles!
    const cnt = big ? 18 : 10;
    for (let i = 0; i < cnt; i++) {
      const d = 0.16 + Math.random() * (big ? 1.05 : 0.75);
      noiseSweep({ delay: d, f0: 3600 + Math.random() * 3400, dur: 0.032, gain: 0.015 * vol, q: 1.0, rev: 0.25 });
      if (i % 3 === 0) {
        toneSweep({
          delay: d,
          f0: 2100 + Math.random() * 1900,
          dur: 0.08,
          gain: 0.008 * vol,
          rev: 0.38,
          pan: (Math.random() - 0.5) * 1.4
        });
      }
    }
  };

  // Authentic SLR mechanical camera shutter + magical photo glint!
  audio.shutter = function () {
    if (!this.ctx) return;
    noiseSweep({ f0: 2800, f1: 1400, dur: 0.020, gain: 0.060, q: 1.4 });
    toneSweep({ type: "triangle", f0: 210, f1: 95, dur: 0.032, gain: 0.042 });
    noiseSweep({ delay: 0.068, f0: 1900, f1: 900, dur: 0.028, gain: 0.048, q: 1.2 });
    starArp([1568, 2093], 0.035, 0.42, 0.22);
  };

  // Rich bronze-gold Castle Doorbell cathedral harmonic decay!
  audio.bell = function () {
    if (!this.ctx) return;
    for (const [delay, base] of [[0, 784], [0.40, 622.25]]) {
      [[1, 0.058, 2.6], [2.0, 0.030, 1.8], [2.76, 0.022, 1.3], [4.07, 0.012, 0.8], [5.43, 0.008, 0.5]].forEach(([m, g, d]) => {
        toneSweep({ delay, f0: base * m, dur: d, gain: g, rev: 0.55 });
      });
    }
  };

  // Joyful festive Task-Complete / Pet-Caught celesta fanfare!
  audio.done = function () {
    if (!this.ctx) return;
    starArp([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.085, 0.92, 0.45);
    catBell(0.32, 0.65, 1.15);
  };

  // Spine-tingling deep glacial ice fracture crack + echoing ice shards!
  audio.iceCrack = function (vol = 1) {
    if (!this.ctx) return;
    toneSweep({ type: "sine", f0: 155, f1: 36, dur: 0.36, gain: 0.23 * vol, rev: 0.46 });
    noiseSweep({ f0: 3200, f1: 950, dur: 0.08, gain: 0.095 * vol, q: 0.8, rev: 0.35 });
    noiseSweep({ delay: 0.03, f0: 1500, f1: 520, dur: 0.24, gain: 0.055 * vol, q: 1.0, rev: 0.35 });
    for (let i = 0; i < 9; i++) {
      const d = 0.09 + Math.random() * 0.95;
      toneSweep({
        delay: d,
        type: "triangle",
        f0: 1900 + Math.random() * 2900,
        f1: 1100 + Math.random() * 1400,
        dur: 0.09,
        gain: 0.016 * vol,
        rev: 0.42,
        pan: (Math.random() - 0.5) * 1.4
      });
    }
  };

  // New Gameplay SFX: Snow-Glide Dash, Starlight Fast-Travel, Star Shard Pickup, Sky Ring Boost, Wish Bell & Clocktower!
  audio.dashWhoosh = function (gem = isGem()) {
    if (!this.ctx) return;
    noiseSweep({ f0: 520, f1: 2600, dur: 0.24, gain: 0.042, q: 0.9, rev: 0.24 });
    toneSweep({ type: "triangle", f0: 260, f1: 580, dur: 0.18, gain: 0.032, rev: 0.22 });
    if (gem) {
      starArp([1175, 1568, 2093], 0.025, 0.58, 0.22);
      catBell(0.03, 0.55, 1.32);
    } else {
      starArp([880, 1175, 1568], 0.03, 0.52, 0.20);
    }
  };

  audio.fastTravel = function () {
    if (!this.ctx) return;
    noiseSweep({ f0: 480, f1: 3400, dur: 0.52, gain: 0.034, q: 1.3, rev: 0.45 });
    starArp([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093], 0.045, 0.85, 0.42);
    catBell(0.28, 0.72, 1.25);
  };

  audio.pickupStar = function (count = 1) {
    if (!this.ctx) return;
    const shift = Math.pow(2, ((count - 1) % 7) / 12);
    starArp([784 * shift, 988 * shift, 1175 * shift, 1568 * shift], 0.042, 0.92, 0.36);
    catBell(0.12, 0.8, 1.15 * shift);
  };

  audio.skyRing = function (combo = 1) {
    if (!this.ctx) return;
    const s = Math.pow(2, Math.min(8, combo - 1) / 12);
    noiseSweep({ f0: 620, f1: 3200, dur: 0.32, gain: 0.046, q: 1.0, rev: 0.34 });
    starArp([659.25 * s, 987.77 * s, 1318.51 * s, 1975.53 * s], 0.032, 0.95, 0.42);
  };

  audio.wishBell = function () {
    if (!this.ctx) return;
    // Deep celestial aurora observatory bell + cascading glass-harp meteor shower!
    [[1, 0.068, 3.4], [2.0, 0.034, 2.5], [3.01, 0.020, 1.8], [4.18, 0.012, 1.1]].forEach(([m, g, d]) => {
      toneSweep({ f0: 523.25 * m, dur: d, gain: g, rev: 0.65 });
    });
    starArp([1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093, 2349.32, 2637.02], 0.075, 0.78, 0.55);
  };

  audio.clocktowerChime = function () {
    if (!this.ctx) return;
    // Warm Westminster-inspired festive winter clocktower carillon!
    const notes = [[0, 659.25], [0.34, 587.33], [0.68, 523.25], [1.02, 392.0], [1.52, 523.25]];
    for (const [d, f] of notes) {
      toneSweep({ delay: d, f0: f, dur: 1.4, gain: 0.055, rev: 0.58 });
      toneSweep({ delay: d + 0.006, f0: f * 2.0, dur: 0.95, gain: 0.026, rev: 0.52 });
      toneSweep({ delay: d + 0.012, f0: f * 2.76, dur: 0.55, gain: 0.014, rev: 0.46 });
    }
  };

  // Spatial Ambient Soundscape hooked cleanly onto audio.update():
  // - Soft bubbling mineral spring near 林间温泉 / 星猫牛奶泉
  // - Gentle icy shoreline wavelets near 冰湖 open water
  // - Ethereal distant Aurora northern-lights harmonic shimmer on clear aurora nights!
  const origUpdate = audio.update.bind(audio);
  let ambBubbleCd = 0;

  audio.update = function (dt, fireDist, fireK, time, speed = 0, slip = 0) {
    origUpdate(dt, fireDist, fireK, time, speed, slip);
    if (!this.ctx || !game || !game.player) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const px = game.player.pos.x;
    const pz = game.player.pos.z;
    const inside = !!(game.cabin && game.cabin.inside);

    // Lazily create continuous gentle spatial ambient nodes once AudioContext starts
    if (!this._worldAmb) {
      // 1) Water / Hot-Spring murmur (bandpass white/brown mix)
      const wSrc = ctx.createBufferSource();
      wSrc.buffer = this.brown;
      wSrc.loop = true;
      const wBp = ctx.createBiquadFilter();
      wBp.type = "bandpass";
      wBp.frequency.value = 620;
      wBp.Q.value = 1.1;
      const wGain = ctx.createGain();
      wGain.gain.value = 0;
      wSrc.connect(wBp).connect(wGain).connect(this.master);
      wSrc.start();

      // 2) Ethereal Aurora Night Shimmer Pad (two ultra-soft detuned sine harmonics)
      const a1 = ctx.createOscillator(); a1.type = "sine"; a1.frequency.value = 329.63; // E4
      const a2 = ctx.createOscillator(); a2.type = "sine"; a2.frequency.value = 493.88; // B4
      const a3 = ctx.createOscillator(); a3.type = "sine"; a3.frequency.value = 659.25; // E5
      const aGain = ctx.createGain();
      aGain.gain.value = 0;
      a1.connect(aGain); a2.connect(aGain); a3.connect(aGain);
      aGain.connect(this.master);
      if (this.rev) {
        const aRev = ctx.createGain();
        aRev.gain.value = 0.65;
        aGain.connect(aRev).connect(this.rev);
      }
      a1.start(); a2.start(); a3.start();

      this._worldAmb = { wBp, wGain, a1, a2, a3, aGain };
    }

    const amb = this._worldAmb;
    // Proximity to Hot Spring (-34, 0), Ice Lake open water, Kitty Milk Pool (62, 70), Icefall (118, -124)
    let waterProx = 0;
    if (!inside) {
      const dSpring = Math.hypot(px - (-34), pz - 0);
      const dCatPool = Math.hypot(px - 62, pz - 70);
      const dIcefall = Math.hypot(px - 118, pz - (-124));
      let dLake = 999;
      if (game.cold && game.cold.water) {
        dLake = Math.hypot(px - game.cold.water.x, pz - game.cold.water.z);
      }
      const nearHot = Math.max(0, 1 - Math.min(dSpring, dCatPool) / 14);
      const nearLake = Math.max(0, 1 - Math.min(dLake, dIcefall) / 18);
      waterProx = Math.max(nearHot * nearHot, nearLake * nearLake * 0.72);

      // Gentle occasional bubbling droplet near hot springs!
      if (nearHot > 0.35 && now > ambBubbleCd) {
        ambBubbleCd = now + 0.45 + Math.random() * 0.9;
        const f = 420 + Math.random() * 380;
        toneSweep({ f0: f, f1: f * 1.45, dur: 0.065, gain: 0.008 * nearHot, rev: 0.35, pan: (Math.random() - 0.5) * 0.8 });
      }
    }
    amb.wGain.gain.setTargetAtTime(0.055 * waterProx, now, 0.35);
    amb.wBp.frequency.setTargetAtTime(520 + 180 * Math.sin(time * 0.7), now, 0.4);

    // Ethereal Northern-Lights Aurora shimmer pad outdoors at night!
    const aurora = !inside && game.env && game.env.state ? (game.env.state.aurora || 0) : 0;
    const aurBreath = 0.7 + 0.3 * Math.sin(time * 0.27);
    amb.aGain.gain.setTargetAtTime(0.0085 * aurora * aurBreath, now, 0.8);
    amb.a2.frequency.setTargetAtTime(493.88 + Math.sin(time * 0.19) * 3.5, now, 0.6);
  };

  return audio;
}
