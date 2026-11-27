function createEventBus() {
  let i = new Map();
  return {
    on(e, t) {
      return (i.has(e) || i.set(e, []), i.get(e).push(t), () => this.off(e, t));
    },
    off(e, t) {
      let n = i.get(e);
      if (n) {
        let s = n.indexOf(t);
        s >= 0 && n.splice(s, 1);
      }
    },
    emit(e, t) {
      let n = i.get(e);
      if (n)
        for (let s = 0; s < n.length; s++)
          try {
            n[s](t);
          } catch (o) {
            console.error(`[events] handler for "${e}" threw`, o);
          }
    },
  };
}
function createRng(i = 1337) {
  let e = i >>> 0,
    t = () => {
      ((e |= 0), (e = (e + 1831565813) | 0));
      let n = Math.imul(e ^ (e >>> 15), 1 | e);
      return ((n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n), ((n ^ (n >>> 14)) >>> 0) / 4294967296);
    };
  return (
    (t.range = (n, s) => n + (s - n) * t()),
    (t.int = (n, s) => Math.floor(n + (s - n + 1) * t())),
    (t.pick = (n) => n[Math.floor(t() * n.length)]),
    (t.sign = () => (t() < 0.5 ? -1 : 1)),
    (t.fork = () => createRng(Math.floor(t() * 4294967296))),
    t
  );
}
var clamp = (i, e, t) => Math.min(t, Math.max(e, i));
var lerp = (i, e, t) => i + (e - i) * t;
var saturate = (i) => Math.min(1, Math.max(0, i));
var smoothstep = (i, e, t) => {
  let n = saturate((t - i) / (e - i));
  return n * n * (3 - 2 * n);
};
var damp = (i, e, t, n) => e + (i - e) * Math.exp(-t * n);
var noop = () => {};

export { clamp, createEventBus, createRng, damp, lerp, noop, saturate, smoothstep };
