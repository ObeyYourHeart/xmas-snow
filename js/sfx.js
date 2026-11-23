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

  // Helper: crisp bright metallic / crystal bell partial cluster
  function catBell(delay = 0, vol = 1, pitch = 1) {
    const base = 1760 * pitch * (0.98 + Math.random() * 0.04);
    toneSweep({ delay, f0: base, dur: 0.24, gain: 0.024 * vol, rev: 0.36 });
    toneSweep({ delay: delay + 0.004, f0: base * 2.02, dur: 0.16, gain: 0.011 * vol, rev: 0.32 });
    toneSweep({ delay: delay + 0.008, f0: base * 2.98, dur: 0.10, gain: 0.006 * vol, rev: 0.28 });
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
  // 1. WEAPON EQUIP SFX (Distinct tactile sound for every weapon & character)
  // =========================================================================
  audio.toolEquip = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    if (!toolId) {
      // Holster / empty hands
      noiseSweep({ f0: 1100, f1: 420, dur: 0.09, gain: 0.016, q: 1.0 });
      toneSweep({ f0: gem ? 660 : 520, f1: gem ? 440 : 350, dur: 0.09, gain: 0.022, rev: 0.15 });
      return;
    }
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒: feathery whip + double cat-bell jingle
        noiseSweep({ f0: 900, f1: 2600, dur: 0.12, gain: 0.018, q: 1.1 });
        catBell(0.01, 0.85, 1.05);
        catBell(0.085, 0.65, 1.24);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖: sparkly magic wand swirl + playful banana chime
        starArp([784, 1046, 1318, 1568], 0.028, 0.72, 0.20);
        catBell(0.06, 0.65, 1.18);
      } else if (toolId === "blaster") {
        // 星弦猫耳光弓: harp bowstring wake-up arpeggio
        starArp([784, 988, 1175, 1568], 0.032, 0.72, 0.22);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: plush cat-paw starlight hammer hum + bell + mini chirp
        toneSweep({ type: "triangle", f0: 260, f1: 165, dur: 0.09, gain: 0.044 });
        catBell(0.02, 0.80, 0.96);
        kittyChirp(0.045, 0.50, true);
      } else if (toolId === "sword") {
        // 双子星芒刃: radiant twin-star crystal sword unsheathe ring!
        noiseSweep({ f0: 1400, f1: 4200, dur: 0.16, gain: 0.024, q: 1.5, rev: 0.28 });
        starArp([1046, 1568, 2093, 2637], 0.025, 0.82, 0.32);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: crisp wooden shaft + mesh rustle
        noiseSweep({ f0: 700, f1: 1800, dur: 0.12, gain: 0.022, q: 0.9 });
        toneSweep({ type: "triangle", f0: 290, f1: 420, dur: 0.08, gain: 0.035 });
      } else if (toolId === "cane") {
        // 糖果手杖: glossy hard-candy clink
        toneSweep({ f0: 1480, dur: 0.12, gain: 0.026, rev: 0.22 });
        toneSweep({ delay: 0.04, f0: 1975, dur: 0.14, gain: 0.022, rev: 0.25 });
      } else if (toolId === "blaster") {
        // 雪枪: pneumatic canister lock + brass click
        noiseSweep({ f0: 2400, f1: 900, dur: 0.06, gain: 0.032, q: 1.4 });
        toneSweep({ type: "triangle", f0: 420, f1: 760, dur: 0.08, gain: 0.038 });
      } else if (toolId === "hammer") {
        // 玩具锤: soft hollow rubber tap + squeak hint
        toneSweep({ type: "triangle", f0: 240, f1: 140, dur: 0.08, gain: 0.048 });
        toneSweep({ delay: 0.03, type: "triangle", f0: 740, f1: 1020, dur: 0.06, gain: 0.022 });
      } else if (toolId === "sword") {
        // Claude 之剑: gleaming solar steel unsheathe ring
        noiseSweep({ f0: 1600, f1: 4200, dur: 0.18, gain: 0.025, q: 1.6, rev: 0.28 });
        toneSweep({ f0: 1175, dur: 0.34, gain: 0.026, rev: 0.38 });
        toneSweep({ delay: 0.02, f0: 1760, dur: 0.28, gain: 0.016, rev: 0.36 });
        toneSweep({ delay: 0.04, f0: 2349, dur: 0.22, gain: 0.011, rev: 0.34 });
      }
    }
  };

  // =========================================================================
  // 2. MELEE TOOL SWING & HIT SFX (Slot 1 Net/Wand, Slot 2 Cane/Fish, Slot 4 Hammer/Paw)
  // =========================================================================
  audio.toolSwing = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒: nimble silk whip + sparkling bell flutter
        noiseSweep({ f0: 720 * p, f1: 2800 * p, dur: 0.18, gain: 0.026, q: 1.1, rev: 0.2 });
        catBell(0.03, 0.9, 1.08 * p);
        catBell(0.11, 0.72, 1.32 * p);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖: whimsical wand flourish swirl
        noiseSweep({ f0: 820 * p, f1: 2600 * p, dur: 0.16, gain: 0.024, q: 1.2, rev: 0.22 });
        starArp([880 * p, 1175 * p, 1568 * p], 0.024, 0.68, 0.18);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: weighty starlight mallet wind-whistle + cat bell
        noiseSweep({ f0: 260 * p, f1: 1180 * p, dur: 0.24, gain: 0.044, q: 0.78, rev: 0.18 });
        noiseSweep({ brown: true, f0: 420, f1: 180, dur: 0.22, gain: 0.04, q: 0.6 });
        catBell(0.05, 0.85, 0.98 * p);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: wide airy butterfly-net cloth swoosh
        noiseSweep({ f0: 460 * p, f1: 1550 * p, dur: 0.19, gain: 0.030, q: 0.8, rev: 0.14 });
        noiseSweep({ delay: 0.03, f0: 1400 * p, f1: 720 * p, dur: 0.13, gain: 0.018, q: 1.2 });
      } else if (toolId === "cane") {
        // 糖果手杖: brisk stick-crack whoosh
        noiseSweep({ f0: 520 * p, f1: 1950 * p, dur: 0.14, gain: 0.032, q: 1.0, rev: 0.12 });
        toneSweep({ type: "triangle", f0: 340 * p, f1: 680 * p, dur: 0.10, gain: 0.022 });
      } else if (toolId === "hammer") {
        // 玩具锤: weighty comic swing whistle
        noiseSweep({ f0: 300 * p, f1: 1200 * p, dur: 0.24, gain: 0.042, q: 0.75, rev: 0.14 });
        toneSweep({ type: "sine", f0: 310 * p, f1: 190 * p, dur: 0.19, gain: 0.032 });
      }
    }
  };

  audio.toolImpact = function (toolId, gem = isGem(), heavy = false) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (gem) {
      if (toolId === "net") {
        // 星月逗猫棒 capture sweep: twinkling star-lasso shimmer
        noiseSweep({ f0: 1600, f1: 680, dur: 0.12, gain: 0.020, q: 0.9 });
        starArp([1318 * p, 1568 * p, 2093 * p], 0.028, 0.75, 0.22);
      } else if (toolId === "cane") {
        // 星喵香蕉魔法杖 melee/magic bonk: playful magical boing + golden chime!
        toneSweep({ type: "triangle", f0: 320 * p, f1: 680 * p, dur: 0.11, gain: 0.068, rev: 0.20 });
        toneSweep({ delay: 0.05, type: "sine", f0: 660 * p, f1: 420 * p, dur: 0.10, gain: 0.046, rev: 0.20 });
        starArp([1318 * p, 1760 * p, 2093 * p], 0.022, heavy ? 0.85 : 0.65, 0.22);
      } else if (toolId === "hammer") {
        // 猫爪星光锤: double star-ring shockwave boom + cute meow-chirp + twin crystal bells!
        toneSweep({ type: "sine", f0: 162 * p, f1: 42, dur: 0.28, gain: 0.148, rev: 0.28 });
        toneSweep({ type: "triangle", f0: 290 * p, f1: 82, dur: 0.16, gain: 0.075 });
        noiseSweep({ brown: true, f0: 680, f1: 180, dur: 0.24, gain: 0.072, q: 0.6, rev: 0.24 });
        noiseSweep({ delay: 0.02, f0: 1900, f1: 720, dur: 0.18, gain: 0.032, q: 0.9 });
        kittyChirp(0.025, 0.88, true);
        catBell(0.02, 0.95, 1.0 * p);
        catBell(0.11, 0.72, 1.28 * p);
        starArp([1046, 1318, 1568, 2093], 0.028, 0.78, 0.30);
      }
    } else {
      if (toolId === "net") {
        // 捕捉网: soft muffled snow-pat thump
        toneSweep({ type: "sine", f0: 140 * p, f1: 68, dur: 0.10, gain: 0.055 });
        noiseSweep({ f0: 920, f1: 420, dur: 0.10, gain: 0.026, q: 0.7 });
      } else if (toolId === "cane") {
        // 糖果手杖: crisp peppermint-wood BONK + bright festive candy ring!
        toneSweep({ type: "triangle", f0: 220 * p, f1: 72, dur: 0.13, gain: 0.095 });
        toneSweep({ f0: 1180 * p, f1: 1080 * p, dur: 0.12, gain: 0.038, rev: 0.24 });
        toneSweep({ delay: 0.01, f0: 2150 * p, dur: 0.09, gain: 0.020, rev: 0.22 });
        noiseSweep({ f0: 1800 * p, f1: 650, dur: 0.07, gain: 0.042, q: 1.0 });
      } else if (toolId === "hammer") {
        // 玩具锤: upgraded rich rubber-mallet BOING + double squeaker + snow shockwave!
        toneSweep({ type: "sine", f0: 165 * p, f1: 48, dur: 0.22, gain: 0.13, rev: 0.2 });
        noiseSweep({ brown: true, f0: 760, f1: 220, dur: 0.20, gain: 0.062, q: 0.65, rev: 0.18 });
        // Expressive twin rubber-toy squeaks
        toneSweep({ delay: 0.005, type: "triangle", f0: 680 * p, f1: 1280 * p, dur: 0.095, gain: 0.058, lp: 2600, rev: 0.2 });
        toneSweep({ delay: 0.105, type: "triangle", f0: 1180 * p, f1: 720 * p, dur: 0.105, gain: 0.048, lp: 2400, rev: 0.2 });
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
      // 星弦猫耳光弓: plucked celestial harp string + sparkling star-bolt zip!
      const note = bowScale[bowStep++ % bowScale.length] * (0.985 + Math.random() * 0.03);
      // Resonant plucked bowstring body (fundamental + octave + crystalline fifth)
      toneSweep({ type: "triangle", f0: note * 0.5, f1: note * 0.495, dur: 0.20, gain: 0.058, lp: 2400, rev: 0.32 });
      toneSweep({ type: "sine", f0: note, f1: note * 1.01, dur: 0.24, gain: 0.046, rev: 0.40 });
      toneSweep({ delay: 0.006, type: "sine", f0: note * 1.5, dur: 0.16, gain: 0.020, rev: 0.36 });
      // Laser-starlight arrow zip
      toneSweep({ f0: 2200 * p, f1: 780 * p, dur: 0.085, gain: 0.026, rev: 0.22 });
      noiseSweep({ f0: 3600 * p, f1: 1200 * p, dur: 0.075, gain: 0.024, q: 1.5, rev: 0.2 });
    } else {
      // Claude 雪枪: punchy pneumatic snow-cannon POP + icy compressed-air burst!
      toneSweep({ type: "sine", f0: 255 * p, f1: 64, dur: 0.10, gain: 0.105 });
      toneSweep({ type: "triangle", f0: 440 * p, f1: 115, dur: 0.08, gain: 0.055 });
      noiseSweep({ f0: 2600 * p, f1: 480 * p, dur: 0.105, gain: 0.064, q: 0.72, rev: 0.14 });
      noiseSweep({ delay: 0.01, f0: 4600, f1: 1800, dur: 0.06, gain: 0.024, q: 1.2 });
    }
  };

  audio.gunSplat = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.92 + Math.random() * 0.16;
    if (isGem()) {
      // Starlight crystal prism shatter + soft snow sparkle
      noiseSweep({ f0: hard ? 3400 : 2200, f1: 650, dur: 0.10, gain: 0.032 * vol, q: 0.9, rev: 0.22 });
      toneSweep({ f0: (hard ? 2200 : 1650) * p, f1: 980 * p, dur: 0.09, gain: 0.026 * vol, rev: 0.3 });
      if (hard) toneSweep({ delay: 0.015, f0: 2950 * p, dur: 0.08, gain: 0.016 * vol, rev: 0.26 });
    } else {
      // Crisp packed-snowburst crunch + solid impact thump
      noiseSweep({ f0: 1750 * p, f1: 420, dur: 0.12, gain: 0.044 * vol, q: 0.55 });
      noiseSweep({ delay: 0.012, f0: 820 * p, f1: 310, dur: 0.09, gain: 0.026 * vol, q: 0.9 });
      toneSweep({ type: "sine", f0: (hard ? 185 : 120) * p, f1: 48, dur: 0.09, gain: (hard ? 0.08 : 0.042) * vol });
    }
  };

  audio.gunHit = function (big = false) {
    if (!this.ctx) return;
    if (isGem()) {
      // Twinkling twin-star celesta hit confirmation
      starArp(big ? [1318, 1760, 2093, 2637] : [1318, 1975], 0.032, big ? 0.95 : 0.78, big ? 0.26 : 0.16);
      if (big) catBell(0.07, 0.8, 1.35);
    } else {
      // Crisp festive arcade bell-tick confirmation
      toneSweep({ f0: 1397, dur: 0.07, gain: 0.044, rev: 0.15 });
      toneSweep({ delay: 0.04, f0: 1760, dur: 0.11, gain: 0.040, rev: 0.22 });
      if (big) {
        toneSweep({ delay: 0.08, f0: 2349, dur: 0.22, gain: 0.036, rev: 0.35 });
        toneSweep({ delay: 0.085, f0: 2794, dur: 0.18, gain: 0.020, rev: 0.32 });
      }
    }
  };

  audio.gunPack = function () {
    if (!this.ctx) return;
    if (isGem()) {
      // Flowing starlight harp recharge shimmer
      starArp([587, 784, 988, 1175, 1568, 1975], 0.095, 0.65, 0.28);
      noiseSweep({ delay: 0.05, f0: 1100, f1: 3200, dur: 0.45, gain: 0.016, q: 1.4, rev: 0.3 });
    } else {
      // Realistic two-scoop snow packing + chamber seal
      for (const d of [0.10, 0.48]) {
        noiseSweep({ delay: d, f0: 1250, f1: 420, dur: 0.18, gain: 0.040, q: 0.75 });
        toneSweep({ delay: d + 0.02, type: "sine", f0: 140, f1: 85, dur: 0.10, gain: 0.035 });
      }
    }
  };

  audio.gunReady = function () {
    if (!this.ctx) return;
    if (isGem()) {
      catBell(0, 0.85, 1.2);
      starArp([1568, 2093], 0.04, 0.72, 0.20);
    } else {
      noiseSweep({ f0: 2800, f1: 1400, dur: 0.03, gain: 0.036, q: 1.5 });
      toneSweep({ f0: 880, dur: 0.06, gain: 0.034 });
      toneSweep({ delay: 0.045, f0: 1318, dur: 0.09, gain: 0.030, rev: 0.18 });
    }
  };

  audio.gunDry = function () {
    if (!this.ctx) return;
    if (isGem()) {
      toneSweep({ type: "triangle", f0: 520, f1: 440, dur: 0.05, gain: 0.022 });
    } else {
      noiseSweep({ f0: 3000, f1: 1800, dur: 0.022, gain: 0.026, q: 1.8 });
    }
  };

  // =========================================================================
  // 3B. TRUE BOW DRAW/RELEASE, BANANA MAGIC & CAT-LURE SFX!
  // =========================================================================
  audio.bowDrawStart = function () {
    if (!this.ctx) return;
    // Silky rising bowstring tension stretch + faint harmonic glow
    toneSweep({ type: "triangle", f0: 220, f1: 460, dur: 0.45, gain: 0.024, lp: 1500, rev: 0.20 });
    noiseSweep({ f0: 900, f1: 2200, dur: 0.36, gain: 0.014, q: 1.8, rev: 0.16 });
  };

  audio.bowFull = function () {
    if (!this.ctx) return;
    // Radiant golden-cyan full-draw lock chime!
    starArp([1046.5, 1318.5, 1568, 2093], 0.026, 0.88, 0.32);
    catBell(0.05, 0.78, 1.38);
  };

  audio.bowRelease = function (charge = 0.5) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const isFull = charge >= 0.85;
    const note = bowScale[bowStep++ % bowScale.length] * (isFull ? 1.12 : 0.94 + charge * 0.18);
    // Elastic taut bowstring twang (low-mid fundamental snap + resonant fifth)
    toneSweep({ type: "triangle", f0: (190 + charge * 110) * p, f1: 92 * p, dur: 0.16, gain: 0.068 + charge * 0.045, lp: 2200, rev: 0.24 });
    toneSweep({ type: "sine", f0: note, f1: note * 0.985, dur: 0.22 + charge * 0.12, gain: 0.038 + charge * 0.022, rev: 0.38 });
    // Feathered arrow cutting sharply through winter air!
    noiseSweep({ f0: (1400 + charge * 2200) * p, f1: 520 * p, dur: 0.12 + charge * 0.08, gain: 0.032 + charge * 0.026, q: 1.3, rev: 0.22 });
    if (isFull) {
      // Blazing twin-star piercing arrow overtone ring!
      starArp([1568, 2093, 2637], 0.022, 0.82, 0.26);
    }
  };

  audio.bowArrowStick = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.93 + Math.random() * 0.14;
    // Tactile arrow thwack + subtle shaft vibration + snow sparkle
    toneSweep({ type: "triangle", f0: (hard ? 260 : 175) * p, f1: 68, dur: 0.085, gain: (hard ? 0.085 : 0.055) * vol });
    noiseSweep({ f0: hard ? 2400 : 1400, f1: 420, dur: 0.07, gain: 0.036 * vol, q: 0.9 });
    toneSweep({ delay: 0.015, f0: (hard ? 1980 : 1480) * p, dur: 0.10, gain: 0.022 * vol, rev: 0.26 });
  };

  audio.bowArrowBurst = function (vol = 1) {
    if (!this.ctx) return;
    // Full-draw constellation star-burst impact!
    toneSweep({ type: "sine", f0: 190, f1: 48, dur: 0.22, gain: 0.115 * vol, rev: 0.26 });
    noiseSweep({ f0: 3200, f1: 700, dur: 0.16, gain: 0.048 * vol, q: 0.85, rev: 0.30 });
    starArp([1046.5, 1318.5, 1760, 2093, 2637], 0.024, 0.92 * vol, 0.34);
    catBell(0.03, 0.85 * vol, 1.25);
  };

  audio.bananaCast = function () {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    // Whimsical sparkling banana-magic wand swirl + boomerang whoosh!
    starArp([784 * p, 988 * p, 1318 * p, 1760 * p], 0.026, 0.78, 0.24);
    toneSweep({ delay: 0.03, type: "triangle", f0: 380 * p, f1: 720 * p, dur: 0.14, gain: 0.044, lp: 2200, rev: 0.22 });
    noiseSweep({ f0: 680 * p, f1: 1950 * p, dur: 0.18, gain: 0.024, q: 1.1, rev: 0.20 });
  };

  audio.bananaHit = function () {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    // Hilarious magical banana-slip boing + golden star burst!
    toneSweep({ type: "triangle", f0: 260 * p, f1: 780 * p, dur: 0.11, gain: 0.075, rev: 0.22 });
    toneSweep({ delay: 0.08, type: "sine", f0: 760 * p, f1: 310 * p, dur: 0.13, gain: 0.062, rev: 0.22 });
    starArp([1175 * p, 1568 * p, 2093 * p], 0.024, 0.82, 0.26);
    catBell(0.04, 0.72, 1.2);
  };

  audio.lureChime = function () {
    if (!this.ctx) return;
    catBell(0.0, 0.88, 1.18);
    catBell(0.07, 0.78, 1.42);
    starArp([1318, 1568, 2093], 0.032, 0.70, 0.24);
  };

  // =========================================================================
  // 4. MELEE COMBO WEAPON SFX (Claude 之剑 vs Gemini 双子星月猫镰)
  // =========================================================================
  audio.swordSwish = function (power = 1.1, moveId = "") {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const isSpin = moveId === "spin" || power >= 1.8;
    const isCut3 = moveId === "cut3" || (power >= 1.4 && power < 1.8);
    const isCut2 = moveId === "cut2";

    if (isGem()) {
      // 双子星月猫镰: shimmering crescent moon-scythe slice + crystal-harp overtone + cat bell!
      const baseNote = isSpin ? 1318 : isCut3 ? 1175 : isCut2 ? 1046 : 880;
      const dur = isSpin ? 0.44 : isCut3 ? 0.24 : 0.17;
      noiseSweep({ f0: 540 * p, f1: (isSpin ? 3400 : 2500) * p, dur, gain: 0.032 * Math.min(1.5, power), q: 1.1, rev: 0.28 });
      toneSweep({ f0: baseNote * p, f1: baseNote * (isCut3 ? 1.45 : 1.22) * p, dur: dur * 1.15, gain: 0.026 * Math.min(1.4, power), rev: 0.42 });
      toneSweep({ delay: 0.018, f0: baseNote * 2 * p, dur: dur * 0.9, gain: 0.014 * Math.min(1.4, power), rev: 0.38 });
      if (isSpin) {
        starArp([1046, 1318, 1568, 2093, 2637], 0.065, 0.85, 0.30);
        catBell(0.04, 0.85, 1.15);
        catBell(0.24, 0.85, 1.38);
      } else if (isCut3) {
        catBell(0.02, 0.9, 1.25);
        toneSweep({ type: "triangle", f0: 290, f1: 120, dur: 0.20, gain: 0.055, rev: 0.2 });
      } else {
        catBell(0.015, 0.55, isCut2 ? 1.18 : 1.0);
      }
    } else {
      // Claude 之剑: crisp solar-gold steel blade cutting air with harmonic ring!
      const pitchShift = isSpin ? 1.18 : isCut3 ? 0.92 : isCut2 ? 1.08 : 1.0;
      const dur = isSpin ? 0.42 : isCut3 ? 0.22 : 0.15;
      noiseSweep({ f0: 480 * pitchShift * p, f1: 2400 * pitchShift * p, dur, gain: 0.034 * Math.min(1.5, power), q: 0.95, rev: 0.22 });
      noiseSweep({ delay: 0.02, f0: 2600 * pitchShift, f1: 1100 * pitchShift, dur: dur * 0.75, gain: 0.018 * Math.min(1.4, power), q: 1.5, rev: 0.24 });
      // Singing metallic blade shimmer
      toneSweep({ delay: 0.012, f0: 1980 * pitchShift * p, f1: 2360 * pitchShift * p, dur: 0.18, gain: 0.014 * Math.min(1.4, power), rev: 0.34 });
      toneSweep({ delay: 0.018, f0: 3120 * pitchShift * p, dur: 0.14, gain: 0.008 * Math.min(1.4, power), rev: 0.30 });
      if (isSpin) {
        noiseSweep({ delay: 0.16, f0: 620, f1: 2900, dur: 0.26, gain: 0.034, q: 0.9, rev: 0.26 });
        toneSweep({ delay: 0.08, type: "triangle", f0: 392, f1: 784, dur: 0.30, gain: 0.035, rev: 0.32 });
      } else if (isCut3) {
        toneSweep({ type: "triangle", f0: 240, f1: 110, dur: 0.18, gain: 0.055, rev: 0.2 });
      }
    }
  };

  audio.swordHit = function (heavy = false) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (isGem()) {
      // Crystalline moon-blade impact + twilight sparkle
      toneSweep({ type: "sine", f0: (heavy ? 165 : 210) * p, f1: 54, dur: heavy ? 0.22 : 0.12, gain: heavy ? 0.13 : 0.075, rev: 0.2 });
      noiseSweep({ f0: 3600 * p, f1: 1200, dur: 0.065, gain: 0.034, q: 1.2, rev: 0.24 });
      starArp(heavy ? [1046, 1568, 2093, 2637] : [1568 * p, 2349 * p], 0.022, heavy ? 0.95 : 0.75, heavy ? 0.34 : 0.22);
      if (heavy) {
        catBell(0.02, 0.95, 1.15);
        noiseSweep({ brown: true, f0: 640, f1: 160, dur: 0.24, gain: 0.075, q: 0.6, rev: 0.25 });
      }
    } else {
      // Solar-gold blade strike: crisp steel impact + warm golden ring
      toneSweep({ type: "sine", f0: (heavy ? 150 : 195) * p, f1: 48, dur: heavy ? 0.22 : 0.12, gain: heavy ? 0.135 : 0.08, rev: 0.22 });
      noiseSweep({ f0: 3200 * p, f1: 950, dur: 0.06, gain: 0.038, q: 1.1, rev: 0.22 });
      toneSweep({ f0: 1568 * p, dur: 0.24, gain: 0.036, rev: 0.34 });
      toneSweep({ delay: 0.008, f0: 2349 * p, dur: 0.20, gain: 0.020, rev: 0.32 });
      toneSweep({ delay: 0.016, f0: 3136 * p, dur: 0.16, gain: 0.012, rev: 0.30 });
      if (heavy) {
        noiseSweep({ brown: true, f0: 700, f1: 170, dur: 0.26, gain: 0.082, q: 0.6, rev: 0.25 });
        toneSweep({ delay: 0.02, f0: 784, dur: 0.32, gain: 0.042, rev: 0.4 });
      }
    }
  };

  audio.swordFull = function () {
    if (!this.ctx) return;
    if (isGem()) {
      starArp([1175, 1480, 1760, 2349], 0.042, 0.95, 0.36);
      catBell(0.11, 0.8, 1.4);
    } else {
      [523.25, 659.25, 783.99, 1046.5, 1568].forEach((f, idx) => {
        toneSweep({ delay: idx * 0.04, f0: f, dur: 0.32, gain: 0.028, rev: 0.42 });
      });
    }
  };

  audio.swordWave = function () {
    if (!this.ctx) return;
    if (isGem()) {
      // Singing twin-star crescent wave
      noiseSweep({ f0: 420, f1: 2400, dur: 0.48, gain: 0.036, q: 0.85, rev: 0.35 });
      toneSweep({ type: "triangle", f0: 392, f1: 784, dur: 0.42, gain: 0.044, lp: 2400, rev: 0.42 });
      starArp([1046, 1318, 1760, 2093], 0.048, 0.82, 0.38);
    } else {
      // Soaring solar-sunflower cyclone wave
      noiseSweep({ f0: 280, f1: 1850, dur: 0.48, gain: 0.042, q: 0.72, rev: 0.32 });
      toneSweep({ type: "triangle", f0: 220, f1: 440, dur: 0.44, gain: 0.052, lp: 1800, rev: 0.36 });
      toneSweep({ delay: 0.03, f0: 587, f1: 880, dur: 0.38, gain: 0.028, rev: 0.40 });
      toneSweep({ delay: 0.07, f0: 1175, dur: 0.32, gain: 0.018, rev: 0.42 });
    }
  };

  audio.swordPlunge = function () {
    if (!this.ctx) return;
    if (isGem()) {
      // Falling shooting-star whistle dive
      noiseSweep({ f0: 2800, f1: 520, dur: 0.32, gain: 0.034, q: 1.2, rev: 0.25 });
      toneSweep({ f0: 2093, f1: 660, dur: 0.28, gain: 0.028, rev: 0.35 });
    } else {
      // Diving wind-rush cleave
      noiseSweep({ f0: 1900, f1: 380, dur: 0.30, gain: 0.038, q: 0.9, rev: 0.22 });
      toneSweep({ type: "triangle", f0: 780, f1: 220, dur: 0.26, gain: 0.034, rev: 0.25 });
    }
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

  return audio;
}
