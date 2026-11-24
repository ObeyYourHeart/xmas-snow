// 工作室级物理建模 DSP 武器、战斗机导弹与世界音效模块 (Claude & Gemini 双主角独立精调)
// 100% 预渲染 44.1 kHz 物理建模 AudioBuffer (Karplus-Strong 弓弦波导 / 10模态钢刃共鸣 / 非对称风切共振峰 / 火箭点火空爆)
// 零电子蜂鸣、暖棚模拟软饱和 (tanh) 与 4.6 kHz 温柔高频滚降，融合实录 .mp3 铜铃采样。

export function buildPhysicalBankPCM(sr = 44100) {
  let seed = 0x5f3759df;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  };

  // Voss-McCartney 7-stage warm pink noise generator (rich & silky, never brittle white hiss)
  function makePink() {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    return () => {
      const w = rand();
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      const out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
      return out;
    };
  }

  // Stable Chamberlin 2-pole State-Variable Filter (safe up to ~0.28 * sr)
  function makeSVF() {
    let low = 0, band = 0;
    return (x, freq, q) => {
      const f = Math.min(0.68, 2 * Math.sin(Math.PI * Math.max(25, Math.min(freq, sr * 0.24)) / sr));
      const damp = Math.max(0.14, 1 / Math.max(0.5, q));
      low += f * band;
      const high = x - low - damp * band;
      band += f * high;
      return { low, band, high };
    };
  }

  // Studio mastering pass: DC blocker -> velvety warm lowpass -> gentle saturation -> fade & peak normalize
  function masterBuffer(buf, lpHz = 3400, drive = 1.08, targetPeak = 0.78) {
    const n = buf.length;
    const rc = 1 / (2 * Math.PI * lpHz);
    const dt = 1 / sr;
    const alpha = dt / (rc + dt);
    let prevIn = 0, dc = 0, lp1 = 0, lp2 = 0;
    let peak = 1e-6;
    for (let i = 0; i < n; i++) {
      const x = buf[i];
      dc = x - prevIn + 0.996 * dc;
      prevIn = x;
      // 2-stage warm lowpass removes all harsh ear-fatiguing upper fizz
      lp1 += alpha * (dc - lp1);
      lp2 += alpha * (lp1 - lp2);
      const sat = Math.tanh(lp2 * drive);
      buf[i] = sat;
      const a = Math.abs(sat);
      if (a > peak) peak = a;
    }
    const scale = targetPeak / peak;
    const fadeIn = Math.min(n, Math.floor(sr * 0.004));
    const fadeOut = Math.min(n, Math.floor(sr * 0.028));
    for (let i = 0; i < n; i++) {
      let env = 1;
      if (i < fadeIn) env = i / fadeIn;
      else if (i > n - fadeOut) env = (n - i) / fadeOut;
      buf[i] *= scale * env;
    }
    return buf;
  }

  // 1) Physical Sword Air-Shear Slash (asymmetric blade velocity curve + 3 sweeping SVF formants + subtle 0.4ms waveguide sheen)
  function synthSwordSlash(dur, pitch = 1.0, heavy = 0) {
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fBody = makeSVF();
    const fFlat = makeSVF();
    const fEdge = makeSVF();
    const combLen = Math.max(8, Math.floor(sr * (0.00042 / pitch)));
    const comb = new Float32Array(combLen);
    let combIdx = 0;
    let brown = 0;
    let subPh = 0;

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const u = i / n;
      // Asymmetric blade velocity curve: explosive wrist snap peak at u=0.22, trailing vortex decay
      const vel = Math.pow(Math.min(1, u / 0.22), 1.35) * Math.exp(-Math.max(0, u - 0.22) * (heavy ? 3.8 : 5.2));
      const p = pink();
      brown = brown * 0.96 + rand() * 0.04;

      const body = fBody(brown * 2.6 + p * 0.6, (130 + 360 * vel) * pitch, 0.95).band;
      const flat = fFlat(p, (420 + 1680 * vel) * pitch, 1.85).band;
      const edgeRaw = fEdge(p * 0.7 + rand() * 0.22, (1150 + 2350 * vel) * pitch, 2.2).band;

      // Subtle damped metallic waveguide comb (creates silky blade-edge air sheen, ZERO tonal beep!)
      const delayed = comb[combIdx];
      const edge = edgeRaw + delayed * 0.28;
      comb[combIdx] = edgeRaw * 0.55 + delayed * 0.24;
      combIdx = (combIdx + 1) % combLen;

      // Optional heavy cleave chest air-punch
      let sub = 0;
      if (heavy > 0) {
        const sf = 128 * Math.exp(-t * 14) + 38;
        subPh += (2 * Math.PI * sf) / sr;
        sub = Math.sin(subPh) * Math.exp(-t * 9.5) * 0.52 * heavy;
      }

      out[i] = (body * (1.25 + heavy * 0.55) + flat * 1.15 + edge * 0.42) * (0.2 + vel * 1.25) + sub;
    }
    return masterBuffer(out, heavy ? 3100 : 3500, 1.08, 0.78);
  }

  // 2) Physical Forged-Steel 10-Mode Resonator Bar (for Unsheathe & Steel Impact / Clash)
  // Mode ratios follow real tempered steel blade harmonics with natural micro-beating pairs.
  function synthSteelRing(dur, baseHz, modeType = "hit") {
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fRub = makeSVF();
    const fBody = makeSVF();

    // 10 realistic micro-detuned steel modal frequencies
    const specs = [
      [1.000, 1.00, 1.00],
      [1.006, 0.72, 0.94],
      [1.925, 0.56, 0.82],
      [2.756, 0.54, 0.78],
      [2.770, 0.38, 0.72],
      [3.840, 0.28, 0.62],
      [5.404, 0.24, 0.50],
      [5.422, 0.16, 0.46],
      [6.910, 0.10, 0.34],
      [8.180, 0.06, 0.26]
    ];

    // Precompute damped 2-pole resonator coefficients
    const modes = [];
    for (const [ratio, gain, decayScale] of specs) {
      const freq = baseHz * ratio;
      if (freq > 5800) continue;
      const tau = (modeType === "unsheathe" ? 0.32 : modeType === "heavy" ? 0.36 : 0.22) * decayScale;
      const r = Math.exp(-1 / (tau * sr));
      const w = (2 * Math.PI * freq) / sr;
      modes.push({ a1: -2 * r * Math.cos(w), a2: r * r, b0: (1 - r) * gain, y1: 0, y2: 0 });
    }

    let subPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      let exc = 0;
      let direct = 0;

      if (modeType === "unsheathe") {
        // Scabbard leather/metal friction sweep exciting the steel modes organically!
        const rubEnv = Math.pow(Math.min(1, t / 0.045), 1.1) * Math.exp(-Math.max(0, t - 0.06) * 9.5);
        const rubF = 880 + Math.min(1, t / 0.20) * 2800;
        const rub = fRub(p * 0.85 + rand() * 0.25, rubF, 2.2).band * rubEnv;
        exc = rub * 0.95;
        direct = rub * 0.62 + fBody(p, 480 + t * 1400, 1.0).band * rubEnv * 0.25;
      } else {
        // Crisp 3.5ms strike impulse + visceral chest impact thump!
        const heavy = modeType === "heavy" ? 1 : 0;
        const impEnv = Math.exp(-t * 420);
        const crunchEnv = Math.exp(-t * (heavy ? 24 : 38));
        exc = (rand() * 0.9 + p * 0.6) * impEnv * 1.45;
        const sf = (heavy ? 124 : 158) * Math.exp(-t * 22) + (heavy ? 34 : 44);
        subPh += (2 * Math.PI * sf) / sr;
        const thump = Math.sin(subPh) * Math.exp(-t * (heavy ? 9.5 : 16)) * (heavy ? 0.85 : 0.62);
        const meat = fBody(p, heavy ? 520 : 780, 0.9).band * crunchEnv * (heavy ? 0.82 : 0.58);
        const crisp = fRub(rand(), 2600, 1.3).band * Math.exp(-t * 75) * 0.36;
        direct = thump + meat + crisp;
      }

      let ring = 0;
      for (let m = 0; m < modes.length; m++) {
        const md = modes[m];
        const y = md.b0 * exc - md.a1 * md.y1 - md.a2 * md.y2;
        md.y2 = md.y1;
        md.y1 = y;
        ring += y;
      }

      out[i] = direct + ring * (modeType === "unsheathe" ? 1.45 : 0.78);
    }
    return masterBuffer(out, modeType === "unsheathe" ? 3800 : 3500, 1.10, 0.78);
  }

  // 3) Physical Recurve Bow Draw (wood-limb micro-creaks + taut bowstring fiber tension rub)
  function synthBowDraw(dur = 0.48) {
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fWood = makeSVF();
    const fStr = makeSVF();
    const creakTimes = [0.03, 0.09, 0.16, 0.24, 0.31, 0.39];

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const u = i / n;
      const p = pink();
      // Rising fiber tension rub
      const rubEnv = Math.sin(Math.PI * Math.min(1, u)) * (0.55 + 0.45 * u);
      const strRub = fStr(p, 780 + u * 1350, 2.4).band * rubEnv * 0.48;

      // Intermittent subtle wooden bow-limb creak pulses
      let creakImp = 0;
      for (let c = 0; c < creakTimes.length; c++) {
        const dt = t - creakTimes[c];
        if (dt >= 0 && dt < 0.028) {
          creakImp += Math.sin(dt * 2 * Math.PI * (220 + c * 32)) * Math.exp(-dt * 120) * (0.45 + 0.1 * c);
        }
      }
      const wood = fWood(creakImp + p * 0.15 * rubEnv, 290 + u * 260, 2.8).band * 0.85;
      out[i] = strRub + wood;
    }
    return masterBuffer(out, 3600, 1.15, 0.72);
  }

  // 4) Karplus-Strong Physical Plucked Bowstring + Riser Handle Thud + Feathered Arrow "FWWIP!"
  function synthBowRelease(isFull = false) {
    const dur = isFull ? 0.44 : 0.34;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fFletch = makeSVF();
    const fAir = makeSVF();

    // Fractional-delay Karplus-Strong waveguide with realistic bowstring tension pitch-drop!
    const fStart = isFull ? 194 : 156;
    const fEnd = isFull ? 134 : 110;
    const maxDelay = Math.ceil(sr / 85) + 4;
    const ring = new Float32Array(maxDelay);
    // Warm finger-roll plucked excitation (smoothed pink burst, no digital click)
    const initLen = Math.floor(sr / fStart);
    let lpInit = 0;
    for (let k = 0; k < initLen; k++) {
      lpInit = lpInit * 0.62 + pink() * 0.38;
      ring[k] = lpInit * Math.sin((Math.PI * k) / initLen) * 1.4;
    }

    let writeIdx = initLen % maxDelay;
    let ksPrev = 0;
    let thudPh = 0;
    const damping = isFull ? 0.9915 : 0.986;

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      // Realistic recurve tension relaxation curve
      const curF = fEnd + (fStart - fEnd) * Math.exp(-t * 16);
      const delaySamp = sr / curF;
      let readPos = writeIdx - delaySamp;
      while (readPos < 0) readPos += maxDelay;
      const idx0 = Math.floor(readPos) % maxDelay;
      const idx1 = (idx0 + 1) % maxDelay;
      const frac = readPos - Math.floor(readPos);
      const samp = ring[idx0] * (1 - frac) + ring[idx1] * frac;
      // 1-pole string loss lowpass filter inside waveguide loop
      const filt = (samp * 0.56 + ksPrev * 0.44) * damping;
      ksPrev = samp;
      ring[writeIdx] = filt;
      writeIdx = (writeIdx + 1) % maxDelay;

      // Wooden bow riser handle thump
      const tf = (isFull ? 148 : 132) * Math.exp(-t * 28) + 48;
      thudPh += (2 * Math.PI * tf) / sr;
      const thud = Math.sin(thudPh) * Math.exp(-t * 24) * (isFull ? 0.62 : 0.48);

      // Feathered arrow aerodynamic FWWIP!
      const p = pink();
      const fwEnv = Math.pow(Math.min(1, t / 0.012), 1.2) * Math.exp(-Math.max(0, t - 0.014) * (isFull ? 16 : 22));
      const fletch = fFletch(p, (isFull ? 2100 : 1650) * Math.exp(-t * 5) + 460, 1.9).band * fwEnv * (isFull ? 1.05 : 0.82);
      const airTail = fAir(p, 620, 1.0).band * fwEnv * 0.45;

      out[i] = samp * (isFull ? 1.15 : 0.95) + thud + fletch * 0.78 + airTail * 0.75;
    }
    return masterBuffer(out, isFull ? 3600 : 3200, 1.08, 0.78);
  }

  // 5) Arrow Stick in Wood/Snow ("THWACK!" + damped 36 Hz arrow shaft wobble)
  function synthArrowStick() {
    const dur = 0.26;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fCrack = makeSVF();
    let thudPh = 0;

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const tf = 185 * Math.exp(-t * 42) + 46;
      thudPh += (2 * Math.PI * tf) / sr;
      const thwack = Math.sin(thudPh) * Math.exp(-t * 32) * 0.85;
      const crack = fCrack(pink(), 1250 * Math.exp(-t * 18) + 340, 1.6).band * Math.exp(-t * 45) * 0.95;
      // Authentic vibrating pine arrow shaft wobble (36 Hz AM modulated 165 Hz wood resonance)
      const wobble = Math.sin(2 * Math.PI * 168 * t) * (0.55 + 0.45 * Math.sin(2 * Math.PI * 36 * t)) * Math.exp(-t * 15) * 0.34;
      out[i] = thwack + crack + wobble;
    }
    return masterBuffer(out, 3100, 1.06, 0.76);
  }

  // 6) Heavy Warhammer Air-Whoosh & Ground-Shaking Drum-Slam
  function synthHammerSwing() {
    const dur = 0.30;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fLow = makeSVF();
    const fMid = makeSVF();
    let brown = 0;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const vel = Math.pow(Math.min(1, u / 0.32), 1.4) * Math.exp(-Math.max(0, u - 0.32) * 4.6);
      const p = pink();
      brown = brown * 0.97 + rand() * 0.03;
      const lo = fLow(brown * 3.0, 90 + 210 * vel, 0.85).band;
      const md = fMid(p, 240 + 720 * vel, 1.3).band;
      out[i] = (lo * 1.3 + md * 0.78) * vel;
    }
    return masterBuffer(out, 2700, 1.06, 0.76);
  }

  function synthHammerSlam() {
    const dur = 0.38;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fSnow = makeSVF();
    let subPh = 0, bodyPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const sf = 122 * Math.exp(-t * 17) + 34;
      const bf = 225 * Math.exp(-t * 28) + 64;
      subPh += (2 * Math.PI * sf) / sr;
      bodyPh += (2 * Math.PI * bf) / sr;
      const sub = Math.sin(subPh) * Math.exp(-t * 8.5) * 0.88;
      const body = Math.sin(bodyPh) * Math.exp(-t * 22) * 0.44;
      const crunch = fSnow(pink(), 820 * Math.exp(-t * 7) + 210, 0.95).band * Math.exp(-t * 12) * 0.82;
      out[i] = sub + body + crunch;
    }
    return masterBuffer(out, 2800, 1.08, 0.76);
  }

  // 7) Pneumatic Snow-Cannon "PTHOOM!" (tighter bolt snap + deeper chest thump!) & Hardwood Candy-Cane Bonk
  function synthSnowCannon() {
    const dur = 0.25;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fAir = makeSVF();
    const fValve = makeSVF();
    let ph = 0, bodyPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const f = 215 * Math.exp(-t * 30) + 42;
      ph += (2 * Math.PI * f) / sr;
      const bf = 420 * Math.exp(-t * 48) + 110;
      bodyPh += (2 * Math.PI * bf) / sr;
      const punch = Math.sin(ph) * Math.exp(-t * 17) * 0.96;
      const crack = Math.sin(bodyPh) * Math.exp(-t * 62) * 0.42;
      const puff = fAir(pink(), 2100 * Math.exp(-t * 15) + 360, 1.05).band * Math.exp(-t * 15) * 0.92;
      const valve = fValve(rand(), 2700, 2.6).band * Math.exp(-t * 280) * 0.68;
      out[i] = punch + crack + puff + valve;
    }
    return masterBuffer(out, 3400, 1.12, 0.80);
  }

  // 10) Studio Physical-Modeling 118 Og Element Cannon & Tactile Hitmarker / Props Bank!
  function synthChemH() {
    // 1 H Hydrogen Rapid Micro-Pulse: pressurized pneumatic pop + brisk bubbly air-burst!
    const dur = 0.22;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fPop = makeSVF();
    const fFizz = makeSVF();
    let ph1 = 0, ph2 = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const f1 = 280 * Math.exp(-t * 36) + 68;
      const f2 = 640 * Math.exp(-t * 22) + 980 * (1 - Math.exp(-t * 26));
      ph1 += (2 * Math.PI * f1) / sr;
      ph2 += (2 * Math.PI * f2) / sr;
      const thump = Math.sin(ph1) * Math.exp(-t * 28) * 0.85;
      const bubble = Math.sin(ph2) * Math.exp(-t * 22) * 0.34;
      const air = fPop(pink(), 2200 * Math.exp(-t * 18) + 460, 1.4).band * Math.exp(-t * 20) * 0.82;
      const snap = fFizz(rand(), 3100, 2.2).band * Math.exp(-t * 240) * 0.55;
      out[i] = thump + bubble + air + snap;
    }
    return masterBuffer(out, 3600, 1.12, 0.80);
  }

  function synthChemC() {
    // 6 C Diamond Rail-Slug: heavy sub-bass coil-gun kick + tempered crystal ping + supersonic air crack!
    const dur = 0.34;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fAir = makeSVF();
    const fCrack = makeSVF();
    let subPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const sf = 178 * Math.exp(-t * 22) + 38;
      subPh += (2 * Math.PI * sf) / sr;
      const sub = Math.sin(subPh) * Math.exp(-t * 11.5) * 1.05;
      const crack = fCrack(rand() * 0.9 + pink() * 0.4, 2400 * Math.exp(-t * 16) + 520, 1.6).band * Math.exp(-t * 28) * 0.92;
      const air = fAir(pink(), 920 * Math.exp(-t * 10) + 260, 1.0).band * Math.exp(-t * 13) * 0.72;
      // Crisp crystalline diamond harmonic cluster (1174 / 1760 / 2637 Hz, fast decay, silky)
      const cEnv = Math.exp(-t * 14);
      const crys = (Math.sin(2 * Math.PI * 1174.66 * t) * 0.24 + Math.sin(2 * Math.PI * 1760 * t) * 0.16 + Math.sin(2 * Math.PI * 2637 * t) * 0.08) * cEnv;
      out[i] = sub + crack + air + crys;
    }
    return masterBuffer(out, 3700, 1.14, 0.82);
  }

  function synthChemNe() {
    // 10 Ne Neon Thermal Plasma Ring: deep pressurized valve-whoosh + warm harmonic combustion bloom!
    const dur = 0.36;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fFlame = makeSVF();
    const fCore = makeSVF();
    let brown = 0, subPh = 0, hPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      brown = brown * 0.955 + rand() * 0.045;
      const sf = 148 * Math.exp(-t * 16) + 46;
      subPh += (2 * Math.PI * sf) / sr;
      const punch = Math.sin(subPh) * Math.exp(-t * 12) * 0.92;
      const hf = 290 + 240 * Math.exp(-t * 8.5);
      hPh += (2 * Math.PI * hf) / sr;
      const warmRing = Math.sin(hPh) * Math.exp(-t * 11) * 0.32;
      const env = Math.pow(Math.min(1, t / 0.018), 0.9) * Math.exp(-t * 7.8);
      const flame = fFlame(p, 580 + 1750 * Math.exp(-t * 9.0), 1.35).band * env * 1.05;
      const core = fCore(brown * 2.5 + p * 0.3, 190 + 340 * Math.exp(-t * 8), 0.95).band * env * 0.90;
      out[i] = punch + warmRing + flame + core;
    }
    return masterBuffer(out, 3200, 1.12, 0.80);
  }

  function synthChemAr() {
    // 18 Ar Argon Electromagnetic Arc Bolt: tight capacitor discharge snap + crisp Tesla crackle + sub kick!
    const dur = 0.32;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fZap = makeSVF();
    const fTail = makeSVF();
    let subPh = 0, modPh = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      const sf = 210 * Math.exp(-t * 30) + 52;
      subPh += (2 * Math.PI * sf) / sr;
      const kick = Math.sin(subPh) * Math.exp(-t * 18) * 0.90;
      // Granular Tesla arc micro-pulses (modulated bandpassed spark, warm lowpassed -> zero shrill hiss!)
      modPh += (2 * Math.PI * (62 + 95 * Math.exp(-t * 14))) / sr;
      const arcGate = 0.5 + 0.5 * Math.sin(modPh);
      const zapEnv = Math.exp(-t * 16);
      const zap = fZap((rand() * 0.85 + p * 0.45) * arcGate, 1450 + 1900 * Math.exp(-t * 18), 2.1).band * zapEnv * 1.15;
      const tail = fTail(p, 640 * Math.exp(-t * 7) + 280, 1.3).band * Math.exp(-t * 10) * 0.55;
      out[i] = kick + zap + tail;
    }
    return masterBuffer(out, 3600, 1.15, 0.80);
  }

  function synthChemOg() {
    // 118 Og Supernova Heavy Collider Launch: monumental chest-thumping charge-fire roar!
    const dur = 0.52;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fRoar = makeSVF();
    const fAir = makeSVF();
    let brown = 0, subPh = 0, chordPh1 = 0, chordPh2 = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      brown = brown * 0.96 + rand() * 0.04;
      const sf = 152 * Math.exp(-t * 14) + 34;
      subPh += (2 * Math.PI * sf) / sr;
      const sub = Math.sin(subPh) * Math.exp(-t * 6.8) * 1.15;
      const c1 = 261.63 * (1 + 0.5 * Math.exp(-t * 16));
      const c2 = 392.00 * (1 + 0.5 * Math.exp(-t * 14));
      chordPh1 += (2 * Math.PI * c1) / sr;
      chordPh2 += (2 * Math.PI * c2) / sr;
      const harm = (Math.sin(chordPh1) * 0.28 + Math.sin(chordPh2) * 0.22) * Math.exp(-t * 7.2);
      const env = Math.pow(Math.min(1, t / 0.015), 0.85) * Math.exp(-t * 5.8);
      const roar = fRoar(brown * 2.8 + p * 0.6, 160 + 620 * Math.exp(-t * 6.5), 1.0).band * env * 1.10;
      const air = fAir(p, 1950 * Math.exp(-t * 9) + 420, 1.5).band * env * 0.82;
      out[i] = sub + harm + roar + air;
    }
    return masterBuffer(out, 3400, 1.14, 0.82);
  }

  function synthHitMarker() {
    // Ultra-crisp AAA FPS/TPS tactile wooden-click + crisp transient tick ("TKK!")
    const dur = 0.075;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const fClick = makeSVF();
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const body = Math.sin(2 * Math.PI * 1480 * t) * Math.exp(-t * 115) * 0.72
                 + Math.sin(2 * Math.PI * 2420 * t) * Math.exp(-t * 145) * 0.48;
      const tick = fClick(rand(), 2950, 2.0).band * Math.exp(-t * 240) * 0.95;
      out[i] = body + tick;
    }
    return masterBuffer(out, 4200, 1.05, 0.78);
  }

  function synthGlassBreak() {
    // Sparkling glass alchemy-bottle shatter (multi-grain modal glass clinks + crisp burst!)
    const dur = 0.36;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fBurst = makeSVF();
    const freqs = [1680, 2140, 2590, 3120, 3580, 1920, 2840];
    const delays = [0, 0.012, 0.025, 0.044, 0.068, 0.095, 0.135];
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const snap = fBurst(rand() * 0.8 + pink() * 0.4, 2800, 1.6).band * Math.exp(-t * 85) * 0.88;
      let shards = 0;
      for (let k = 0; k < freqs.length; k++) {
        const dt = t - delays[k];
        if (dt > 0) {
          shards += Math.sin(2 * Math.PI * freqs[k] * dt) * Math.exp(-dt * (26 + k * 4)) * (0.28 - k * 0.02);
        }
      }
      out[i] = snap + shards;
    }
    return masterBuffer(out, 4200, 1.04, 0.76);
  }

  function synthBrassGong() {
    // Warm resonant golden bullseye / lighthouse gong (6-mode metallic shimmer + deep chest resonance)
    const dur = 0.95;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fHit = makeSVF();
    const ratios = [[1.0, 0.95, 2.2], [1.48, 0.58, 3.1], [2.04, 0.44, 3.8], [2.76, 0.30, 5.2], [3.52, 0.18, 6.8]];
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const mallet = fHit(pink(), 680 * Math.exp(-t * 16) + 180, 1.2).band * Math.exp(-t * 36) * 0.85;
      let bell = 0;
      for (const [r, g, dec] of ratios) {
        bell += Math.sin(2 * Math.PI * (246.94 * r) * t) * Math.exp(-t * dec) * g;
      }
      out[i] = mallet + bell * 0.55;
    }
    return masterBuffer(out, 3200, 1.08, 0.80);
  }

  function synthFogHorn() {
    // Warm cozy Starlight Lighthouse maritime brass horn (harmonious fifth C3 + G3 swell!)
    const dur = 1.45;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fAir = makeSVF();
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const env = Math.pow(Math.min(1, t / 0.18), 1.2) * Math.exp(-Math.max(0, t - 0.58) * 3.1);
      const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 4.5 * t);
      const f0 = 130.81 * vib;
      const f5 = 196.00 * vib;
      const brass = (
        Math.sin(2 * Math.PI * f0 * t) * 0.65 +
        Math.sin(2 * Math.PI * f0 * 2 * t) * 0.34 +
        Math.sin(2 * Math.PI * f0 * 3 * t) * 0.16 +
        Math.sin(2 * Math.PI * f5 * t) * 0.42 +
        Math.sin(2 * Math.PI * f5 * 2 * t) * 0.18
      ) * env;
      const breath = fAir(pink(), 420, 1.3).band * env * 0.25;
      out[i] = brass + breath;
    }
    return masterBuffer(out, 2200, 1.12, 0.78);
  }

  function synthWoodBonk() {
    const dur = 0.20;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fTap = makeSVF();
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      // Hollow resonant glazed candy-wood modal cluster
      const m1 = Math.sin(2 * Math.PI * 295 * t) * Math.exp(-t * 26) * 0.62;
      const m2 = Math.sin(2 * Math.PI * 760 * t) * Math.exp(-t * 38) * 0.42;
      const m3 = Math.sin(2 * Math.PI * 1420 * t) * Math.exp(-t * 56) * 0.20;
      const tap = fTap(pink(), 1250, 1.5).band * Math.exp(-t * 72) * 0.62;
      out[i] = m1 + m2 + m3 + tap;
    }
    return masterBuffer(out, 3200, 1.06, 0.76);
  }

  // 8) Sleek, Airy Fighter-Jet Pylon Release & Rocket Ignition (compact 0.38s, warm & non-fatiguing!)
  function synthMissileLaunch() {
    const dur = 0.38;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fJet = makeSVF();
    const fCore = makeSVF();
    const fLatch = makeSVF();
    let brown = 0;
    let ignPh = 0;

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      brown = brown * 0.95 + rand() * 0.05;

      // 0..20ms: Soft tactile pylon latch release ("tchk!")
      const latchEnv = Math.exp(-t * 190);
      const latch = (fLatch(p, 1400, 2.2).band * 0.55 + Math.sin(2 * Math.PI * 310 * t) * 0.35) * latchEnv;

      // 14ms+: Crisp, airy solid-rocket ignition whoosh (warm lowpassed, zero harsh buzz)
      let rocket = 0;
      if (t >= 0.014) {
        const rt = t - 0.014;
        const igF = 148 * Math.exp(-rt * 22) + 46;
        ignPh += (2 * Math.PI * igF) / sr;
        const ignThump = Math.sin(ignPh) * Math.exp(-rt * 18) * 0.68;

        const plumeEnv = Math.pow(Math.min(1, rt / 0.028), 0.9) * Math.exp(-Math.max(0, rt - 0.04) * 7.2);
        const jetFreq = 420 + 1450 * Math.exp(-rt * 7.0);
        const jetPlume = fJet(p, jetFreq, 1.15).band * plumeEnv * 0.92;
        const jetCore = fCore(brown * 2.4 + p * 0.35, 220 + 280 * Math.exp(-rt * 7.5), 0.9).band * plumeEnv * 0.95;

        rocket = ignThump + jetPlume + jetCore;
      }

      out[i] = latch * 0.65 + rocket;
    }
    return masterBuffer(out, 2900, 1.06, 0.76);
  }

  // 9) Cozy Festive Missile Airburst & Winter Firework Detonation (warm 0.48s pop-boom, zero harsh blast!)
  function synthMissileBoom() {
    const dur = 0.48;
    const n = Math.floor(sr * dur);
    const out = new Float32Array(n);
    const pink = makePink();
    const fRumble = makeSVF();
    const fCrack = makeSVF();
    let brown = 0;
    let subPh = 0;

    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = pink();
      brown = brown * 0.968 + rand() * 0.032;

      // Soft airy burst transient
      const snap = fCrack(p, 1350, 1.0).band * Math.exp(-t * 90) * 0.72;

      // Warm sub-bass firework thump (105 -> 34 Hz)
      const sf = 104 * Math.exp(-t * 14) + 34;
      subPh += (2 * Math.PI * sf) / sr;
      const sub = Math.sin(subPh) * Math.exp(-t * 8.2) * 0.95;

      // Gentle fading alpine snow-boom tail
      const rEnv = Math.pow(Math.min(1, t / 0.016), 0.85) * Math.exp(-t * 6.2);
      const rumble = fRumble(brown * 3.0 + p * 0.55, 110 + 380 * Math.exp(-t * 7.0), 0.85).band * rEnv * 1.05;

      out[i] = snap + sub + rumble;
    }
    return masterBuffer(out, 2700, 1.08, 0.78);
  }

  return {
    swordSlash1: synthSwordSlash(0.26, 1.02, 0),
    swordSlash2: synthSwordSlash(0.22, 1.18, 0),
    swordSlash3: synthSwordSlash(0.38, 0.84, 1.0),
    swordUnsheathe: synthSteelRing(0.54, 720, "unsheathe"),
    swordHit: synthSteelRing(0.34, 790, "hit"),
    swordHitHeavy: synthSteelRing(0.50, 680, "heavy"),
    swordWave: synthSwordSlash(0.48, 0.92, 0.85),
    swordPlunge: synthSwordSlash(0.36, 0.76, 0.90),
    bowDraw: synthBowDraw(0.48),
    bowQuick: synthBowRelease(false),
    bowFull: synthBowRelease(true),
    arrowStick: synthArrowStick(),
    hammerSwing: synthHammerSwing(),
    hammerSlam: synthHammerSlam(),
    snowCannon: synthSnowCannon(),
    woodBonk: synthWoodBonk(),
    missileLaunch: synthMissileLaunch(),
    missileBoom: synthMissileBoom(),
    chemH: synthChemH(),
    chemC: synthChemC(),
    chemNe: synthChemNe(),
    chemAr: synthChemAr(),
    chemOg: synthChemOg(),
    hitMarker: synthHitMarker(),
    glassBreak: synthGlassBreak(),
    brassGong: synthBrassGong(),
    fogHorn: synthFogHorn()
  };
}

export function enhanceAudio(audio, game) {
  if (!audio || audio._sfxEnhanced) return audio;
  audio._sfxEnhanced = true;

  const isGem = () => !!(game && game.avatar === "gemini");

  // Lazily build and cache studio-grade 44.1 kHz physical-modeling AudioBuffers once AudioContext exists
  let dspBank = null;
  function ensureBank() {
    const ctx = audio.ctx;
    if (!ctx) return null;
    if (dspBank) return dspBank;
    const pcm = buildPhysicalBankPCM(ctx.sampleRate || 44100);
    dspBank = {};
    for (const [key, data] of Object.entries(pcm)) {
      const buf = ctx.createBuffer(1, data.length, ctx.sampleRate || 44100);
      buf.copyToChannel(data, 0);
      dspBank[key] = buf;
    }
    return dspBank;
  }

  // Cozy-world calibrated playback with automatic polyphony ducking so rapid slashes / 4-missile salvos NEVER stack loudly!
  const COZY_GAIN = 0.21;
  const recentStarts = [];
  function playBuf(key, opts = {}) {
    const ctx = audio.ctx;
    if (!ctx) return;
    const bank = ensureBank();
    if (!bank || !bank[key]) return;
    const t0 = ctx.currentTime + (opts.delay || 0);

    // Track recent voices within 0.24s and smoothly duck overlapping triggers
    while (recentStarts.length && t0 - recentStarts[0] > 0.24) recentStarts.shift();
    const overlap = recentStarts.length;
    recentStarts.push(t0);
    const duck = 1 / (1 + overlap * 0.52);

    const src = ctx.createBufferSource();
    src.buffer = bank[key];
    src.playbackRate.value = Math.max(0.5, Math.min(2.2, opts.rate ?? 1.0));

    let node = src;
    if (opts.lp) {
      const flt = ctx.createBiquadFilter();
      flt.type = "lowpass";
      flt.frequency.setValueAtTime(opts.lp, t0);
      node.connect(flt);
      node = flt;
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime((opts.gain ?? 0.35) * COZY_GAIN * duck, t0);
    node.connect(g);
    let out = g;

    if (opts.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-0.9, Math.min(0.9, opts.pan));
      out.connect(p);
      out = p;
    }

    out.connect(audio.master);
    if (opts.rev && audio.rev) {
      const rg = ctx.createGain();
      rg.gain.value = opts.rev * 0.75;
      out.connect(rg).connect(audio.rev);
    }
    src.start(t0);
  }

  // Play real studio-recorded .mp3 bell sample gently calibrated to cozy winter levels
  const BELL_NAMES = ["bell_w1", "bell_w2", "bell_w3", "bell_w4", "bell_w5", "bell_w6"];
  function realBell(idx = 2, gain = 0.14, rate = 1.0, delay = 0, pan = 0) {
    const name = BELL_NAMES[((idx % BELL_NAMES.length) + BELL_NAMES.length) % BELL_NAMES.length];
    if (audio.smp && audio.smp[name] && audio.play) {
      audio.play(name, gain * 0.45, rate, 0.22, delay, pan);
      return true;
    }
    return false;
  }

  // Helper: frequency-swept warm oscillator (used for musical chimes & lower-half ambient helpers)
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

  // Helper: real recorded brass bell (with soft warm fallback if samples haven't finished loading)
  function catBell(delay = 0, vol = 1, pitch = 1) {
    if (realBell(3, 0.22 * vol, 1.05 * pitch, delay)) return;
    const base = 1568 * pitch * (0.98 + Math.random() * 0.04);
    toneSweep({ delay, f0: base, dur: 0.24, gain: 0.028 * vol, lp: 3800, rev: 0.34 });
    toneSweep({ delay: delay + 0.004, f0: base * 2.0, dur: 0.14, gain: 0.012 * vol, lp: 4200, rev: 0.28 });
  }

  // Helper: warm adorable kitty chirp (gentle lowpassed triangle, zero piercing)
  function kittyChirp(delay = 0, vol = 1, up = true) {
    const fStart = up ? 620 : 880;
    const fMid = up ? 960 : 690;
    const fEnd = up ? 820 : 590;
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
    lp.frequency.value = 1850;

    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.linearRampToValueAtTime(0.032 * vol, t0 + 0.018);
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

  // Helper: warm studio celesta / glass-harp sparkle (strictly lowpassed so never shrill)
  function starArp(freqs, step = 0.035, vol = 1, dur = 0.26) {
    freqs.forEach((f, idx) => {
      const pan = freqs.length > 1 ? -0.26 + (idx / (freqs.length - 1)) * 0.52 : 0;
      toneSweep({ delay: idx * step, f0: Math.min(2200, f), dur, gain: 0.018 * vol, lp: 3400, rev: 0.36, pan });
    });
  }

  // =========================================================================
  // 1. WEAPON EQUIP SFX (Natural Physical Material Signatures)
  // =========================================================================
  audio.toolEquip = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    const p = 0.96 + Math.random() * 0.08;
    if (!toolId) {
      noiseSweep({ f0: 980, f1: 360, dur: 0.10, gain: 0.045, q: 0.85 });
      return;
    }
    if (toolId === "sword") {
      // Authentic forged-steel scabbard draw (Claude heavier broadsword, Gemini sleek crystal blade)
      playBuf("swordUnsheathe", { gain: 0.56, rate: (gem ? 1.12 : 0.94) * p, rev: 0.30 });
      if (gem) realBell(4, 0.12, 1.25, 0.06);
      return;
    }
    if (toolId === "blaster") {
      if (gem) {
        // Real wooden recurve bow draw check + gentle bowstring settle
        playBuf("bowDraw", { gain: 0.42, rate: 1.18 * p, rev: 0.18 });
        realBell(2, 0.10, 1.15, 0.05);
      } else {
        // Crisp pneumatic snow-cannon bolt chambering
        playBuf("snowCannon", { gain: 0.24, rate: 1.45 * p, lp: 2800 });
      }
      return;
    }
    if (toolId === "hammer") {
      playBuf("hammerSwing", { gain: 0.38, rate: 1.18 * p, rev: 0.14 });
      if (gem) catBell(0.03, 0.72, 1.0);
      else playBuf("woodBonk", { delay: 0.04, gain: 0.26, rate: 0.82 * p });
      return;
    }
    if (toolId === "cane") {
      playBuf("woodBonk", { gain: 0.38, rate: (gem ? 1.12 : 0.96) * p, rev: 0.16 });
      if (gem) starArp([784, 1046, 1318], 0.028, 0.75, 0.20);
      return;
    }
    if (toolId === "chemgun") {
      playBuf("chemH", { gain: 0.34, rate: 1.38 * p, lp: 2800, rev: 0.20 });
      realBell(5, 0.14, 1.25 * p, 0.04);
      return;
    }
    if (toolId === "net") {
      playBuf("swordSlash2", { gain: 0.28, rate: 1.28 * p, lp: 2600 });
      if (gem) {
        if (this.jingle) this.jingle(0.55);
        else catBell(0.02, 0.65, 1.18);
      }
    }
  };

  // =========================================================================
  // 2. MELEE TOOL SWING & HIT SFX (100% Physical Material Acoustics)
  // =========================================================================
  audio.toolSwing = function (toolId, gem = isGem()) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    if (toolId === "hammer") {
      playBuf("hammerSwing", { gain: 0.54, rate: (gem ? 1.04 : 0.96) * p, rev: 0.18 });
      if (gem) catBell(0.05, 0.58, 0.96 * p);
    } else if (toolId === "cane") {
      playBuf("swordSlash2", { gain: 0.42, rate: (gem ? 1.12 : 1.04) * p, lp: 3000, rev: 0.15 });
      if (gem) starArp([880 * p, 1175 * p], 0.024, 0.65, 0.16);
    } else if (toolId === "net") {
      playBuf("swordSlash1", { gain: 0.40, rate: (gem ? 1.24 : 0.96) * p, lp: 2400, rev: 0.14 });
      if (gem) {
        if (this.jingle) this.jingle(0.58);
        else catBell(0.02, 0.65, 1.15 * p);
      }
    }
  };

  audio.toolImpact = function (toolId, gem = isGem(), heavy = false) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    if (toolId === "hammer") {
      playBuf("hammerSlam", { gain: heavy ? 0.68 : 0.56, rate: (gem ? 1.02 : 0.96) * p, rev: 0.24 });
      if (gem) {
        kittyChirp(0.03, 0.85, true);
        if (this.jingle) this.jingle(0.75);
        else catBell(0.02, 0.85, 1.0 * p);
      } else {
        // Gentle classic soft-rubber toy mallet double squeaker (warm lowpassed)
        toneSweep({ delay: 0.012, type: "triangle", f0: 660 * p, f1: 1120 * p, dur: 0.09, gain: 0.085, lp: 2100, rev: 0.16 });
        toneSweep({ delay: 0.105, type: "triangle", f0: 1060 * p, f1: 640 * p, dur: 0.10, gain: 0.072, lp: 1950, rev: 0.16 });
      }
    } else if (toolId === "cane") {
      playBuf("woodBonk", { gain: heavy ? 0.60 : 0.50, rate: (gem ? 1.08 : 0.98) * p, rev: 0.20 });
      if (gem) {
        toneSweep({ type: "triangle", f0: 260 * p, f1: 640 * p, dur: 0.10, gain: 0.075, lp: 1800, rev: 0.18 });
        starArp([1046 * p, 1318 * p, 1568 * p], 0.024, 0.72, 0.20);
      }
    } else if (toolId === "net") {
      playBuf("arrowStick", { gain: 0.42, rate: 0.92 * p, lp: 2600 });
      if (gem) realBell(4, 0.22, 1.15 * p, 0.01);
    }
  };

  audio.squeak = function () {
    this.toolImpact("hammer", isGem(), true);
  };

  // =========================================================================
  // 3. RANGED WEAPON SFX (Pneumatic Snow Cannon & Karplus-Strong Recurve Bow)
  // =========================================================================
  audio.gunShot = function () {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    if (isGem()) {
      this.bowRelease(0.5);
    } else {
      playBuf("snowCannon", { gain: 0.62, rate: p, rev: 0.16 });
    }
  };

  audio.gunSplat = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.93 + Math.random() * 0.14;
    if (isGem()) {
      this.bowArrowStick(vol, hard);
    } else {
      playBuf("arrowStick", { gain: (hard ? 0.48 : 0.36) * vol, rate: (hard ? 1.08 : 0.84) * p, lp: hard ? 3200 : 1950, rev: 0.12 });
    }
  };

  audio.gunHit = function (big = false, combo = 1) {
    if (!this.ctx) return;
    const climb = Math.min(1.42, 0.96 + Math.min(8, Math.max(0, combo - 1)) * 0.055);
    // Tactile crisp FPS hitmarker click layered beneath ascending musical chime!
    playBuf("hitMarker", { gain: big ? 0.64 : 0.48, rate: (big ? 1.12 : 1.0) * climb, rev: 0.10 });
    if (realBell(big ? 5 : 3, big ? 0.28 : 0.18, (big ? 1.12 : 0.98) * climb, 0.015)) {
      if (big) realBell(5, 0.20, 1.45 * climb, 0.075);
      return;
    }
    starArp(big ? [1046 * climb, 1318 * climb, 1568 * climb] : [1046 * climb, 1318 * climb], 0.028, big ? 0.95 : 0.72, 0.20);
  };

  // =========================================================================
  // 3A. STUDIO PHYSICAL-MODELING 118 Og ELEMENT CANNON & HARBOR PROP SFX!
  // =========================================================================
  audio.chemShot = function (kind, overclock = false) {
    if (!this.ctx) return;
    const p = 0.96 + Math.random() * 0.08;
    const boost = overclock ? 1.14 : 1.0;
    if (kind === "h_triple") {
      playBuf("chemH", { gain: 0.56 * boost, rate: 1.00 * p, pan: -0.14, rev: 0.20 });
      playBuf("chemH", { delay: 0.042, gain: 0.44 * boost, rate: 1.14 * p, pan: 0.14, rev: 0.22 });
      realBell(3, 0.11, 1.24 * p, 0.03);
    } else if (kind === "c_diamond") {
      playBuf("chemC", { gain: 0.72 * boost, rate: 0.98 * p, rev: 0.28 });
      realBell(5, 0.16, 1.38 * p, 0.02);
    } else if (kind === "ne_ring") {
      playBuf("chemNe", { gain: 0.68 * boost, rate: 1.00 * p, rev: 0.26 });
      if (overclock) starArp([587.33, 880, 1174.66], 0.024, 0.52, 0.22);
    } else if (kind === "ar_bolt") {
      playBuf("chemAr", { gain: 0.68 * boost, rate: 1.02 * p, rev: 0.24 });
      playBuf("hitMarker", { delay: 0.012, gain: 0.30, rate: 1.48 * p });
    } else if (kind === "og_nova") {
      playBuf("chemOg", { gain: 0.80, rate: 0.98 * p, rev: 0.36 });
      realBell(4, 0.20, 1.15 * p, 0.03);
      realBell(5, 0.22, 1.45 * p, 0.09);
      starArp([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.032, 0.72, 0.32);
    } else {
      playBuf("chemH", { gain: 0.54, rate: p, rev: 0.20 });
    }
  };

  audio.chemImpact = function (kind, distScale = 1.0) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    const v = Math.max(0.25, Math.min(1.0, distScale));
    if (kind === "og_nova" || kind === "og_boom") {
      playBuf("missileBoom", { gain: 0.72 * v, rate: 0.95 * p, rev: 0.36 });
      playBuf("brassGong", { delay: 0.015, gain: 0.38 * v, rate: 1.35 * p, lp: 3200, rev: 0.42 });
      realBell(3, 0.24 * v, 1.0, 0.03);
      realBell(5, 0.24 * v, 1.35, 0.09);
      starArp([783.99, 1046.5, 1318.5, 1567.98], 0.030, 0.78 * v, 0.34);
    } else if (kind === "c_diamond") {
      playBuf("glassBreak", { gain: 0.56 * v, rate: 0.96 * p, rev: 0.26 });
      playBuf("hammerSlam", { gain: 0.32 * v, rate: 1.35 * p, lp: 2600 });
    } else if (kind === "ar_bolt") {
      playBuf("chemAr", { gain: 0.46 * v, rate: 1.24 * p, rev: 0.24 });
    } else if (kind === "ne_ring") {
      playBuf("missileBoom", { gain: 0.42 * v, rate: 1.26 * p, lp: 2400, rev: 0.24 });
    } else {
      playBuf("arrowStick", { gain: 0.40 * v, rate: 1.18 * p, rev: 0.18 });
      realBell(2, 0.12 * v, 1.28 * p, 0.01);
    }
  };

  audio.chemSwitch = function (idx = 0) {
    if (!this.ctx) return;
    const rate = 0.92 + (idx % 6) * 0.08;
    playBuf("hitMarker", { gain: 0.46, rate: rate * 1.15, rev: 0.12 });
    realBell(idx % 6, 0.14, rate, 0.015);
  };

  audio.glassBreak = function (distScale = 1.0) {
    if (!this.ctx) return;
    const v = Math.max(0.25, Math.min(1.0, distScale));
    playBuf("glassBreak", { gain: 0.66 * v, rate: 0.94 + Math.random() * 0.16, rev: 0.28 });
  };

  audio.brassGong = function (distScale = 1.0) {
    if (!this.ctx) return;
    const v = Math.max(0.28, Math.min(1.0, distScale));
    playBuf("brassGong", { gain: 0.74 * v, rate: 0.97 + Math.random() * 0.06, rev: 0.44 });
    realBell(4, 0.22 * v, 1.0, 0.04);
  };

  audio.fogHorn = function () {
    if (!this.ctx) return;
    playBuf("fogHorn", { gain: 0.68, rate: 1.0, rev: 0.52 });
  };

  audio.chimeChord = function (seed = 0) {
    if (!this.ctx) return;
    const scales = [
      [523.25, 659.25, 783.99, 1046.5],
      [587.33, 739.99, 880.0, 1174.66],
      [659.25, 783.99, 987.77, 1318.51]
    ];
    const notes = scales[Math.abs(seed) % scales.length];
    starArp(notes, 0.045, 0.85, 0.36);
    realBell(seed % 6, 0.18, 1.1, 0.02);
  };

  audio.gunPack = function () {
    if (!this.ctx) return;
    if (isGem()) {
      starArp([587, 784, 988, 1318], 0.075, 0.70, 0.24);
    } else {
      playBuf("snowCannon", { delay: 0.08, gain: 0.22, rate: 0.78, lp: 1800 });
      playBuf("snowCannon", { delay: 0.42, gain: 0.24, rate: 0.88, lp: 2000 });
    }
  };

  audio.gunReady = function () {
    if (!this.ctx) return;
    if (isGem()) catBell(0, 0.78, 1.15);
    else playBuf("woodBonk", { gain: 0.28, rate: 1.38, lp: 2600 });
  };

  audio.gunDry = function () {
    if (!this.ctx) return;
    playBuf("woodBonk", { gain: 0.22, rate: 1.55, lp: 2200 });
  };

  // =========================================================================
  // 3B. KARPLUS-STRONG PHYSICAL BOWSTRING, BANANA MAGIC & CAT-LURE SFX
  // =========================================================================
  audio.bowDrawStart = function () {
    if (!this.ctx) return;
    playBuf("bowDraw", { gain: 0.56, rate: 0.96 + Math.random() * 0.08, rev: 0.16 });
  };

  audio.bowFull = function () {
    if (!this.ctx) return;
    // Crisp subtle full-draw ready cue (real recorded studio bell, never harsh synth!)
    if (!realBell(4, 0.22, 1.18, 0)) catBell(0, 0.75, 1.18);
    starArp([1046.5, 1318.5, 1568], 0.026, 0.72, 0.24);
  };

  audio.bowRelease = function (charge = 0.5) {
    if (!this.ctx) return;
    const p = 0.96 + Math.random() * 0.08;
    const isFull = charge >= 0.85;
    // Pure Karplus-Strong physical plucked bowstring + feathered arrow aerodynamic FWWIP!
    playBuf(isFull ? "bowFull" : "bowQuick", {
      gain: isFull ? 0.68 : 0.48 + charge * 0.18,
      rate: (0.94 + charge * 0.12) * p,
      rev: 0.22
    });
    if (isFull) {
      // Faint celestial bell accent trailing behind the real bow twang
      realBell(5, 0.14, 1.32 * p, 0.025);
    }
  };

  audio.bowArrowStick = function (vol = 1, hard = false) {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    playBuf("arrowStick", { gain: (hard ? 0.58 : 0.44) * vol, rate: (hard ? 1.10 : 0.92) * p, rev: 0.14 });
  };

  audio.bowArrowBurst = function (vol = 1) {
    if (!this.ctx) return;
    playBuf("hammerSlam", { gain: 0.46 * vol, rate: 1.28, lp: 3800, rev: 0.28 });
    realBell(5, 0.24 * vol, 1.25, 0.02);
    starArp([1046.5, 1318.5, 1568, 2093], 0.026, 0.82 * vol, 0.28);
  };

  audio.bananaCast = function () {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    playBuf("swordSlash2", { gain: 0.44, rate: 1.08 * p, lp: 3100, rev: 0.20 });
    starArp([784 * p, 988 * p, 1318 * p], 0.026, 0.78, 0.22);
  };

  audio.bananaHit = function () {
    if (!this.ctx) return;
    const p = 0.94 + Math.random() * 0.12;
    playBuf("woodBonk", { gain: 0.54, rate: 1.05 * p, rev: 0.18 });
    toneSweep({ type: "triangle", f0: 250 * p, f1: 720 * p, dur: 0.11, gain: 0.085, lp: 1900, rev: 0.20 });
    starArp([1175 * p, 1568 * p], 0.026, 0.75, 0.22);
  };

  audio.lureChime = function () {
    if (!this.ctx) return;
    if (this.jingle) this.jingle(0.75);
    else catBell(0, 0.85, 1.18);
  };

  // =========================================================================
  // 4. CINEMATIC PHYSICAL-MODELING SWORD COMBO SFX (Zero Electronic Beeps!)
  // =========================================================================
  audio.swordSwish = function (power = 1.1, moveId = "") {
    if (!this.ctx) return;
    const p = 0.96 + Math.random() * 0.08;
    const isSpin = moveId === "spin" || power >= 1.8;
    const isCut3 = moveId === "cut3" || (power >= 1.4 && power < 1.8);
    const isCut2 = moveId === "cut2";
    const gem = isGem();
    const charPitch = gem ? 1.08 : 0.94;

    if (isSpin) {
      // 360° Whirlwind Greatsword Cyclone: 3 wide stereo-panned sweeping air-cuts!
      [-0.62, 0.0, 0.62].forEach((pan, idx) => {
        playBuf(idx === 2 ? "swordSlash3" : "swordSlash1", {
          delay: idx * 0.13,
          gain: idx === 2 ? 0.66 : 0.54,
          rate: charPitch * (0.94 + idx * 0.10) * p,
          pan,
          rev: 0.26
        });
      });
      // Subtle tempered steel wind resonance trail
      playBuf("swordUnsheathe", { delay: 0.04, gain: 0.24, rate: charPitch * 1.06, lp: 3800, rev: 0.30 });
      return;
    }

    if (isCut3) {
      // Heavy 3rd-combo air-cleaving greatsword finisher
      playBuf("swordSlash3", { gain: 0.72, rate: charPitch * p, rev: 0.24 });
      playBuf("swordUnsheathe", { delay: 0.02, gain: 0.22, rate: charPitch * 0.92 * p, lp: 3600, rev: 0.24 });
    } else if (isCut2) {
      // Brisk reverse slash
      playBuf("swordSlash2", { gain: 0.60, rate: charPitch * p, pan: 0.22, rev: 0.20 });
    } else {
      // Crisp opening diagonal cut
      playBuf("swordSlash1", { gain: 0.58, rate: charPitch * p, pan: -0.22, rev: 0.20 });
    }
  };

  audio.swordHit = function (heavy = false) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const gem = isGem();
    playBuf(heavy ? "swordHitHeavy" : "swordHit", {
      gain: heavy ? 0.72 : 0.58,
      rate: (gem ? 1.08 : 0.95) * p,
      rev: heavy ? 0.28 : 0.20
    });
    if (heavy && gem) realBell(4, 0.16, 1.3 * p, 0.03);
  };

  audio.swordFull = function () {
    if (!this.ctx) return;
    const gem = isGem();
    playBuf("swordUnsheathe", { gain: 0.52, rate: gem ? 1.24 : 1.06, rev: 0.32 });
    if (gem) realBell(5, 0.18, 1.25, 0.04);
  };

  audio.swordWave = function () {
    if (!this.ctx) return;
    const gem = isGem();
    playBuf("swordWave", { gain: 0.68, rate: gem ? 1.08 : 0.94, rev: 0.32 });
    playBuf("swordUnsheathe", { delay: 0.02, gain: 0.28, rate: gem ? 1.15 : 0.96, lp: 3900, rev: 0.34 });
  };

  audio.swordPlunge = function () {
    if (!this.ctx) return;
    const gem = isGem();
    playBuf("swordPlunge", { gain: 0.66, rate: gem ? 1.06 : 0.94, rev: 0.26 });
  };

  // =========================================================================
  // 4B. FIGHTER-JET HOMING MISSILE LOCK, LAUNCH & AIRBURST DETONATION SFX!
  // =========================================================================
  let lastLockSfx = 0;
  let lastBoomSfx = 0;
  audio.missileLock = function (fresh = true) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Gentle 0.95s cooldown so scanning targets while flying NEVER spams beeps!
    if (now - lastLockSfx < 0.95) return;
    lastLockSfx = now;
    toneSweep({ type: "sine", f0: 1046.5, f1: 1046.5, atk: 0.005, dur: 0.042, gain: 0.015, lp: 2200, rev: 0.12 });
    if (fresh) {
      toneSweep({ delay: 0.052, type: "sine", f0: 1318.5, f1: 1318.5, atk: 0.005, dur: 0.055, gain: 0.018, lp: 2400, rev: 0.15 });
    }
  };

  audio.missileLaunch = function (side = 0, isSalvo = false) {
    if (!this.ctx) return;
    const p = 0.95 + Math.random() * 0.10;
    const gem = isGem();
    // Sleek, light rocket release (salvos duck naturally via playBuf polyphony ducking!)
    playBuf("missileLaunch", {
      gain: isSalvo ? 0.36 : 0.48,
      rate: (gem ? 1.06 : 0.98) * p,
      pan: side * 0.34,
      rev: 0.20
    });
    if (gem && !isSalvo) {
      realBell(5, 0.10, 1.32 * p, 0.02, side * 0.28);
    }
  };

  audio.missileBoom = function (isBalloon = false, distScale = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Deduplicate simultaneous salvo explosions so 4 hits NEVER blast the speakers at once!
    const tooClose = now - lastBoomSfx < 0.16;
    if (tooClose && !isBalloon) return;
    lastBoomSfx = now;
    const p = 0.94 + Math.random() * 0.12;
    const vol = Math.max(0.24, Math.min(0.85, distScale)) * (tooClose ? 0.45 : 1.0);
    playBuf("missileBoom", {
      gain: (isBalloon ? 0.56 : 0.46) * vol,
      rate: (isBalloon ? 1.04 : 0.96) * p,
      rev: 0.26
    });
    if (isBalloon) {
      realBell(3, 0.22 * vol, 1.0, 0.04);
      realBell(5, 0.20 * vol, 1.25, 0.11);
      starArp([1046.5, 1318.5, 1568], 0.036, 0.55 * vol, 0.28);
    }
  };

  // =========================================================================
  // 5. MAGICAL SKY-CAT MOUNT AUDIO (Soothing Alpine Glide Breeze + Soft Wingbeats)
  // =========================================================================
  const origRotor = audio.rotor.bind(audio);
  let chimeCd = 0;
  let wingPuffCd = 0;

  audio.mountStart = function (gem = isGem()) {
    if (!this.ctx) return;
    if (gem) {
      // Soft airy lift swell + warm acoustic sleigh-bell greeting + gentle kitty chirp (zero harsh synths!)
      noiseSweep({ brown: true, f0: 210, f1: 580, dur: 0.34, atk: 0.06, gain: 0.032, q: 0.55, rev: 0.28 });
      if (!realBell(3, 0.14, 1.0, 0.03)) {
        toneSweep({ delay: 0.03, f0: 784, dur: 0.26, gain: 0.016, lp: 2600, rev: 0.32 });
      }
      realBell(5, 0.11, 1.12, 0.12);
      kittyChirp(0.05, 0.42, true);
    } else {
      audio.pick();
    }
  };

  audio.rotor = function (vol, load = 0, gem = isGem()) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (!gem) {
      if (this._catFly) {
        this._catFly.out.gain.setTargetAtTime(0, now, 0.14);
      }
      return origRotor(vol, load);
    }

    // Silence Claude's helicopter rotor cleanly if it was active
    if (this.rot) {
      this.rot.out.gain.setTargetAtTime(0, now, 0.14);
    }

    if (!this._catFly) {
      if (vol < 0.01) return;
      // 1) Silky alpine winter glide breeze (dual-stage warm lowpassed brown noise, ZERO oscillators/buzz!)
      const glideSrc = ctx.createBufferSource();
      glideSrc.buffer = this.brown;
      glideSrc.loop = true;

      const glideLp1 = ctx.createBiquadFilter();
      glideLp1.type = "lowpass";
      glideLp1.frequency.value = 300;
      glideLp1.Q.value = 0.5;

      const glideLp2 = ctx.createBiquadFilter();
      glideLp2.type = "lowpass";
      glideLp2.frequency.value = 540;
      glideLp2.Q.value = 0.5;

      const glideAmp = ctx.createGain();
      glideAmp.gain.value = 0.52;

      // 2) Soft feathered wingbeat air-swells (deep velvety 170-260 Hz air cushion gently breathing!)
      const wingSrc = ctx.createBufferSource();
      wingSrc.buffer = this.brown;
      wingSrc.loop = true;

      const wingBp = ctx.createBiquadFilter();
      wingBp.type = "bandpass";
      wingBp.frequency.value = 185;
      wingBp.Q.value = 0.55;

      const wingLp = ctx.createBiquadFilter();
      wingLp.type = "lowpass";
      wingLp.frequency.value = 420;

      const wingAmp = ctx.createGain();
      wingAmp.gain.value = 0.28;

      const wingLfo = ctx.createOscillator();
      wingLfo.type = "sine";
      wingLfo.frequency.value = 1.25;
      const wingMod = ctx.createGain();
      wingMod.gain.value = 0.19;
      wingLfo.connect(wingMod).connect(wingAmp.gain);

      const out = ctx.createGain();
      out.gain.value = 0;

      glideSrc.connect(glideLp1).connect(glideLp2).connect(glideAmp).connect(out);
      wingSrc.connect(wingBp).connect(wingLp).connect(wingAmp).connect(out);

      out.connect(this.master);
      if (this.rev) {
        const revSend = ctx.createGain();
        revSend.gain.value = 0.24;
        out.connect(revSend).connect(this.rev);
      }

      glideSrc.start(0, 0.13);
      wingSrc.start(0, 0.77);
      wingLfo.start();

      this._catFly = { glideLp1, glideAmp, wingBp, wingAmp, wingLfo, wingMod, out };
    }

    const cf = this._catFly;
    const smoothV = Math.max(0, Math.min(1, vol));
    const activeLoad = Math.max(0, Math.min(1, load));

    // Gentle, ultra-soothing master envelope (quiet velvet glide at hover, breezy sweep when soaring!)
    const targetOut = smoothV < 0.02 ? 0 : (0.042 + 0.048 * activeLoad) * smoothV * smoothV;
    cf.out.gain.setTargetAtTime(targetOut, now, 0.22);

    // Alpine air opens gently as speed / climb builds (never harsh or hissy)
    cf.glideLp1.frequency.setTargetAtTime(210 + 170 * smoothV + 190 * activeLoad, now, 0.28);
    cf.wingBp.frequency.setTargetAtTime(145 + 65 * smoothV + 70 * activeLoad, now, 0.28);
    cf.wingLfo.frequency.setTargetAtTime(1.12 + 0.68 * activeLoad, now, 0.35);
    cf.wingAmp.gain.setTargetAtTime(0.18 + 0.24 * activeLoad, now, 0.30);
    cf.wingMod.gain.setTargetAtTime(0.11 + 0.16 * activeLoad, now, 0.30);

    // Subtle acoustic feathered downstroke air-brush when actively climbing hard
    if (smoothV > 0.55 && activeLoad > 0.55 && now > wingPuffCd) {
      wingPuffCd = now + 0.62 + Math.random() * 0.22;
      noiseSweep({
        brown: true,
        f0: 260,
        f1: 120,
        dur: 0.26,
        atk: 0.05,
        gain: 0.014 * smoothV * activeLoad,
        q: 0.5,
        rev: 0.22
      });
    }

    // Rare, whisper-soft real acoustic bell sparkle while gliding swiftly across the winter sky
    if (smoothV > 0.45 && activeLoad > 0.14 && now > chimeCd) {
      chimeCd = now + 2.8 + Math.random() * 2.1;
      const bellIdx = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      if (!realBell(bellIdx, 0.046 * smoothV, 0.96 + Math.random() * 0.12)) {
        toneSweep({
          f0: [1046.5, 1174.66, 1318.51, 1567.98][bellIdx - 2],
          dur: 0.38,
          gain: 0.0055 * smoothV,
          lp: 2600,
          rev: 0.42,
          pan: (Math.random() - 0.5) * 0.6
        });
      }
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
      toneSweep({ type: "triangle", f0: 112 * p, f1: 64 * p, dur: 0.085, gain: 0.072 * vol });
      noiseSweep({ f0: 760 * p, f1: 420 * p, dur: 0.045, gain: 0.016 * vol, q: 1.1 });
    } else if (surface === "water") {
      noiseSweep({ f0: 1850 * p, f1: 620 * p, dur: 0.17, gain: 0.032 * vol, q: 0.75, rev: 0.22 });
      toneSweep({ delay: 0.018, f0: 360 * p, f1: 720 * p, dur: 0.07, gain: 0.018 * vol, rev: 0.26 });
      if (Math.random() < 0.6) {
        toneSweep({ delay: 0.055, f0: 980 * p, f1: 1420 * p, dur: 0.055, gain: 0.010 * vol, rev: 0.28 });
      }
    } else if (surface === "ice") {
      noiseSweep({ f0: 2700 * p, f1: 1450 * p, dur: 0.048, gain: 0.022 * vol, q: 1.4, rev: 0.20 });
      toneSweep({ f0: 165 * p, f1: 118 * p, dur: 0.085, gain: 0.022 * vol, rev: 0.26 });
      toneSweep({ delay: 0.008, f0: 2450 * p, dur: 0.045, gain: 0.007 * vol, rev: 0.22 });
    } else {
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

  // Gameplay SFX: Snow-Glide Dash, Starlight Fast-Travel, Star Shard Pickup, Sky Ring Boost, Wish Bell & Clocktower!
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
    [[1, 0.068, 3.4], [2.0, 0.034, 2.5], [3.01, 0.020, 1.8], [4.18, 0.012, 1.1]].forEach(([m, g, d]) => {
      toneSweep({ f0: 523.25 * m, dur: d, gain: g, rev: 0.65 });
    });
    starArp([1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093, 2349.32, 2637.02], 0.075, 0.78, 0.55);
  };

  audio.clocktowerChime = function () {
    if (!this.ctx) return;
    const notes = [[0, 659.25], [0.34, 587.33], [0.68, 523.25], [1.02, 392.0], [1.52, 523.25]];
    for (const [d, f] of notes) {
      toneSweep({ delay: d, f0: f, dur: 1.4, gain: 0.055, rev: 0.58 });
      toneSweep({ delay: d + 0.006, f0: f * 2.0, dur: 0.95, gain: 0.026, rev: 0.52 });
      toneSweep({ delay: d + 0.012, f0: f * 2.76, dur: 0.55, gain: 0.014, rev: 0.46 });
    }
  };

  // Studio Master Warmth Bus + Transparent Brickwall Limiter (velvety winter tone, 0% digital clipping!)
  const origStart = audio.start.bind(audio);
  audio.start = function () {
    const first = !this.ctx;
    origStart();
    if (first && this.ctx && this.master && !this._studioMastered) {
      this._studioMastered = true;
      const ctx = this.ctx;
      try {
        this.master.disconnect();
        const warmLow = ctx.createBiquadFilter();
        warmLow.type = "lowshelf";
        warmLow.frequency.value = 140;
        warmLow.gain.value = 1.6;

        const silkHigh = ctx.createBiquadFilter();
        silkHigh.type = "highshelf";
        silkHigh.frequency.value = 5200;
        silkHigh.gain.value = -2.2;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -12;
        comp.knee.value = 12;
        comp.ratio.value = 8;
        comp.attack.value = 0.003;
        comp.release.value = 0.16;

        this.master.connect(warmLow).connect(silkHigh).connect(comp).connect(ctx.destination);
      } catch {}
    }
  };

  // Spatial Ambient Soundscape hooked cleanly onto audio.update()
  const origUpdate = audio.update.bind(audio);
  let ambBubbleCd = 0;
  let labBubbleCd = 0;

  audio.update = function (dt, fireDist, fireK, time, speed = 0, slip = 0) {
    origUpdate(dt, fireDist, fireK, time, speed, slip);
    if (!this.ctx || !game || !game.player) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const px = game.player.pos.x;
    const pz = game.player.pos.z;
    const inCastle = !!(game.cabin && game.cabin.inside);
    const inLab = !!(game.chemlab && game.chemlab.inside);
    const inside = inCastle || inLab;

    // Smoothly muffle howling outdoor winter wind when stepping inside Claude's Castle or Hajimi's Lab!
    if (this.windGain && this.windBP) {
      if (inside) {
        this.windGain.gain.setTargetAtTime(0.022, now, 0.35);
        this.windBP.frequency.setTargetAtTime(210, now, 0.40);
      }
    }

    if (!this._worldAmb) {
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

      // Aurora ethereal night harmonic pad
      const a1 = ctx.createOscillator(); a1.type = "sine"; a1.frequency.value = 329.63;
      const a2 = ctx.createOscillator(); a2.type = "sine"; a2.frequency.value = 493.88;
      const a3 = ctx.createOscillator(); a3.type = "sine"; a3.frequency.value = 659.25;
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

      // Dreamy Indoor Chemistry Lab Alchemical Resonance (whisper-soft warm D4 + A4 crystal glass air!)
      const l1 = ctx.createOscillator(); l1.type = "sine"; l1.frequency.value = 293.66;
      const l2 = ctx.createOscillator(); l2.type = "sine"; l2.frequency.value = 440.0;
      const lLp = ctx.createBiquadFilter();
      lLp.type = "lowpass";
      lLp.frequency.value = 920;
      const lGain = ctx.createGain();
      lGain.gain.value = 0;
      l1.connect(lLp); l2.connect(lLp);
      lLp.connect(lGain).connect(this.master);
      if (this.rev) {
        const lRev = ctx.createGain();
        lRev.gain.value = 0.72;
        lGain.connect(lRev).connect(this.rev);
      }
      l1.start(); l2.start();

      this._worldAmb = { wBp, wGain, a1, a2, a3, aGain, lGain, l2 };
    }

    const amb = this._worldAmb;
    let waterProx = 0;
    if (!inside) {
      const dSpring = Math.hypot(px - (-34), pz - 0);
      const dCatPool = Math.hypot(px - 44.2, pz - 57.2); // Exact CatHome milk hot-spring coordinates!
      const dIcefall = Math.hypot(px - 118, pz - (-124));
      let dLake = 999;
      if (game.cold && game.cold.water) {
        dLake = Math.hypot(px - game.cold.water.x, pz - game.cold.water.z);
      }
      const nearHot = Math.max(0, 1 - Math.min(dSpring, dCatPool) / 14);
      const nearLake = Math.max(0, 1 - Math.min(dLake, dIcefall) / 18);
      waterProx = Math.max(nearHot * nearHot, nearLake * nearLake * 0.72);

      if (nearHot > 0.35 && now > ambBubbleCd) {
        ambBubbleCd = now + 0.45 + Math.random() * 0.9;
        const f = 420 + Math.random() * 380;
        toneSweep({ f0: f, f1: f * 1.45, dur: 0.065, gain: 0.008 * nearHot, rev: 0.35, pan: (Math.random() - 0.5) * 0.8 });
      }
    }
    amb.wGain.gain.setTargetAtTime(0.055 * waterProx, now, 0.35);
    amb.wBp.frequency.setTargetAtTime(520 + 180 * Math.sin(time * 0.7), now, 0.4);

    // Indoor Chemistry Lab gentle glass resonance & distant Erlenmeyer flask bubbling!
    const labBreath = 0.72 + 0.28 * Math.sin(time * 0.42);
    amb.lGain.gain.setTargetAtTime(inLab ? 0.0068 * labBreath : 0, now, 0.55);
    amb.l2.frequency.setTargetAtTime(440 + Math.sin(time * 0.31) * 2.2, now, 0.5);
    if (inLab && now > labBubbleCd) {
      labBubbleCd = now + 1.3 + Math.random() * 2.1;
      const bf = 520 + Math.random() * 440;
      toneSweep({ f0: bf, f1: bf * 1.52, dur: 0.072, gain: 0.0075, lp: 2200, rev: 0.48, pan: (Math.random() - 0.5) * 1.1 });
    }

    const aurora = !inside && game.env && game.env.state ? (game.env.state.aurora || 0) : 0;
    const aurBreath = 0.7 + 0.3 * Math.sin(time * 0.27);
    amb.aGain.gain.setTargetAtTime(0.0085 * aurora * aurBreath, now, 0.8);
    amb.a2.frequency.setTargetAtTime(493.88 + Math.sin(time * 0.19) * 3.5, now, 0.6);
  };

  return audio;
}
