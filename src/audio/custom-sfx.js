// Synthesised sounds for features added after the original game:
// EMP charge whine + blast, and the flashlight switch. Built straight on the
// game's AudioContext and routed into its master gain (so volume settings apply).
const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function createCustomSfx(G) {
  const A = G.audio;
  if (!A || !A.ctx || !A.master) return null;
  const ctx = A.ctx;
  const out = A.master;

  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  // simple distance + pan for world sounds
  function spatial(pos, maxDist = 45) {
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    let vol = 1;
    if (pos && G.camera) {
      const cam = G.camera.position;
      const dx = pos.x - cam.x,
        dz = pos.z - cam.z;
      const dist = Math.hypot(dx, pos.y - cam.y, dz);
      vol = clamp01(1 - dist / maxDist) ** 1.6 + 0.04;
      if (p) {
        const yaw = (G.player && G.player.yaw) || 0;
        // right vector of the view is (cos yaw, 0, -sin yaw)
        const right = (dx * Math.cos(yaw) - dz * Math.sin(yaw)) / Math.max(1, dist);
        p.pan.value = Math.max(-0.85, Math.min(0.85, right));
      }
    }
    g.gain.value = vol;
    if (p) (g.connect(p), p.connect(out));
    else g.connect(out);
    return g;
  }

  // rising electric whine while the fuse burns
  function empCharge(pos, fuse) {
    const t = ctx.currentTime;
    const dst = spatial(pos, 30);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(380, t);
    o.frequency.exponentialRampToValueAtTime(2600, t + fuse);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + fuse);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.3, t + fuse);
    g.gain.exponentialRampToValueAtTime(0.0001, t + fuse + 0.05);
    o.connect(f).connect(g).connect(dst);
    o.start(t);
    o.stop(t + fuse + 0.1);
  }

  // thump + crackling discharge
  function empBlast(pos) {
    const t = ctx.currentTime;
    const dst = spatial(pos, 60);
    // low thump
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.5);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.9, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(og).connect(dst);
    o.start(t);
    o.stop(t + 0.65);
    // electric crackle: noise gated by a fast random square
    const n = ctx.createBufferSource();
    n.buffer = noise();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, t);
    let k = t;
    while (k < t + 0.9) {
      const on = Math.random() < 0.55 ? 0.55 * (1 - (k - t) / 0.9) : 0;
      ng.gain.setValueAtTime(on, k);
      k += 0.008 + Math.random() * 0.03;
    }
    ng.gain.setValueAtTime(0, k);
    n.connect(hp).connect(ng).connect(dst);
    n.start(t);
    n.stop(t + 1);
    // descending zap
    const z = ctx.createOscillator();
    z.type = 'square';
    z.frequency.setValueAtTime(2400, t);
    z.frequency.exponentialRampToValueAtTime(90, t + 0.35);
    const zg = ctx.createGain();
    zg.gain.setValueAtTime(0.12, t);
    zg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    z.connect(zg).connect(dst);
    z.start(t);
    z.stop(t + 0.42);
  }

  // short mechanical switch click
  function click(on) {
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = noise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = on ? 3200 : 2400;
    bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    n.connect(bp).connect(g).connect(out);
    n.start(t, Math.random());
    n.stop(t + 0.04);
  }

  G.events.on('emp:throw', (e) => e && empCharge(e.pos, e.fuse || 1.6));
  G.events.on('emp:detonate', (e) => e && empBlast(e.pos));
  G.events.on('flashlight', (e) => click(e && e.on));
  return { empCharge, empBlast, click };
}
