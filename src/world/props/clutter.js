import * as THREE from 'three';
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Euler,
  Group,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  ShapeUtils,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { $e, Dc, Fn, mergeGeometries, ot } from '../../core/geometry.js';
import { createRng } from '../../core/util.js';
import { PROP_SIZES, registerProp } from './index.js';

var At = Math.PI;
var tt = Math.PI / 2;
var zi = (i, e, t) => Math.min(t, Math.max(e, i));
function Za(i, e, t) {
  let n = Math.imul(i, 374761393) ^ Math.imul(e, 668265263) ^ Math.imul(t, 2147483647);
  return ((n = Math.imul(n ^ (n >>> 13), 1274126177)), ((n ^ (n >>> 16)) >>> 0) / 4294967296);
}
function gn(i, e = 0, t = 0) {
  let n = Math.floor(i),
    s = Math.floor(e),
    o = Math.floor(t),
    r = i - n,
    a = e - s,
    l = t - o;
  ((r = r * r * (3 - 2 * r)), (a = a * a * (3 - 2 * a)), (l = l * l * (3 - 2 * l)));
  let c = (u, h, f) => u + (h - u) * f;
  return c(
    c(c(Za(n, s, o), Za(n + 1, s, o), r), c(Za(n, s + 1, o), Za(n + 1, s + 1, o), r), a),
    c(c(Za(n, s, o + 1), Za(n + 1, s, o + 1), r), c(Za(n, s + 1, o + 1), Za(n + 1, s + 1, o + 1), r), a),
    l,
  );
}
function Mf(i, e, t, n) {
  let s = new BufferGeometry();
  return (
    s.setAttribute('position', new BufferAttribute(new Float32Array(i), 3)),
    e && s.setAttribute('normal', new BufferAttribute(new Float32Array(e), 3)),
    s.setAttribute('uv', new BufferAttribute(new Float32Array(t), 2)),
    n && s.setIndex(n),
    e || s.computeVertexNormals(),
    s
  );
}
function us(i, e = 16) {
  let t = i.length,
    n = [],
    s = [],
    o = [],
    r = [],
    a = [],
    l = [],
    c = [],
    u = 0,
    h = 0;
  for (let f = 0; f < t; f++) {
    let p = 0,
      d = 0;
    if (f > 0) {
      let g = i[f][0] - i[f - 1][0],
        x = i[f][1] - i[f - 1][1],
        y = Math.hypot(g, x);
      y > 1e-6 && ((p += g / y), (d += x / y), (h += y));
    }
    if (f < t - 1) {
      let g = i[f + 1][0] - i[f][0],
        x = i[f + 1][1] - i[f][1],
        y = Math.hypot(g, x);
      y > 1e-6 && ((p += g / y), (d += x / y));
    }
    let v = Math.hypot(p, d) || 1;
    (a.push(d / v), l.push(-p / v), c.push(h), (u = Math.max(u, i[f][0])));
  }
  for (let f = 0; f < t; f++)
    for (let p = 0; p <= e; p++) {
      let d = (p / e) * At * 2,
        v = Math.cos(d),
        g = Math.sin(d);
      (n.push(i[f][0] * v, i[f][1], i[f][0] * g), s.push(a[f] * v, l[f], a[f] * g), o.push((p / e) * At * 2 * u, c[f]));
    }
  for (let f = 0; f < t - 1; f++)
    if (!(Math.hypot(i[f + 1][0] - i[f][0], i[f + 1][1] - i[f][1]) < 1e-6))
      for (let p = 0; p < e; p++) {
        let d = f * (e + 1) + p,
          v = d + e + 1,
          g = v + 1,
          x = d + 1;
        (i[f][0] > 1e-6 && r.push(d, v, x), i[f + 1][0] > 1e-6 && r.push(v, g, x));
      }
  return Mf(n, s, o, r);
}
function Ge(i, e, t, n = 0.008, s = 'center') {
  let o = [i / 2, e / 2, t / 2];
  n = Math.min(n, o[0] * 0.9, o[1] * 0.9, o[2] * 0.9);
  let r = [],
    a = [],
    l = [],
    c = [];
  for (let p = 0; p < 8; p++)
    for (let d = 0; d < 3; d++) {
      let v = [p & 1 ? 1 : -1, p & 2 ? 1 : -1, p & 4 ? 1 : -1],
        g = [0, 1, 2].map((x) => v[x] * (o[x] - (x !== d ? n : 0)));
      (r.push(g[0], g[1], g[2]),
        a.push(d === 0 ? v[0] : 0, d === 1 ? v[1] : 0, d === 2 ? v[2] : 0),
        d === 0 ? l.push(g[2], g[1]) : d === 1 ? l.push(g[0], g[2]) : l.push(g[0], g[1]));
    }
  let u = (p, d) => p * 3 + d,
    h = (p, d, v, g, x, y) => {
      let b = r[d * 3] - r[p * 3],
        m = r[d * 3 + 1] - r[p * 3 + 1],
        A = r[d * 3 + 2] - r[p * 3 + 2],
        _ = r[v * 3] - r[p * 3],
        M = r[v * 3 + 1] - r[p * 3 + 1],
        E = r[v * 3 + 2] - r[p * 3 + 2];
      (m * E - A * M) * g + (A * _ - b * E) * x + (b * M - m * _) * y >= 0 ? c.push(p, d, v) : c.push(p, v, d);
    };
  for (let p = 0; p < 3; p++) {
    let d = (p + 1) % 3,
      v = (p + 2) % 3;
    for (let g of [0, 1]) {
      let x = [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ].map(([b, m]) => (g << p) | (b << d) | (m << v)),
        y = [0, 0, 0];
      ((y[p] = g ? 1 : -1), h(u(x[0], p), u(x[1], p), u(x[2], p), ...y), h(u(x[0], p), u(x[2], p), u(x[3], p), ...y));
    }
    for (let g of [0, 1])
      for (let x of [0, 1]) {
        let y = (g << d) | (x << v),
          b = y | (1 << p),
          m = [0, 0, 0];
        ((m[d] = g ? 1 : -1),
          (m[v] = x ? 1 : -1),
          h(u(y, d), u(b, d), u(b, v), ...m),
          h(u(y, d), u(b, v), u(y, v), ...m));
      }
  }
  for (let p = 0; p < 8; p++) h(u(p, 0), u(p, 1), u(p, 2), p & 1 ? 1 : -1, p & 2 ? 1 : -1, p & 4 ? 1 : -1);
  let f = Mf(r, a, l, c);
  return (s === 'bottom' && f.translate(0, e / 2, 0), f);
}
function eo(i, e, t, n = 0.03, s = 3, o = 3, r = 3, a = 'center') {
  let l = new BoxGeometry(i, e, t, s, o, r),
    c = l.attributes.position,
    u = l.attributes.normal,
    h = l.attributes.uv,
    f = i / 2,
    p = e / 2,
    d = t / 2;
  n = Math.min(n, f * 0.95, p * 0.95, d * 0.95);
  let v = (x, y, b) => {
      if (Math.abs(x) > y - 1e-6 || b < 3) return x;
      let m = (2 * y) / b;
      return (x * (y - n)) / (y - m);
    },
    g = new Vector3();
  for (let x = 0; x < c.count; x++) {
    let y = v(c.getX(x), f, s),
      b = v(c.getY(x), p, o),
      m = v(c.getZ(x), d, r),
      A = zi(y, -(f - n), f - n),
      _ = zi(b, -(p - n), p - n),
      M = zi(m, -(d - n), d - n);
    (g.set(y - A, b - _, m - M),
      (Math.abs(y) > f - 1e-5 ? 1 : 0) + (Math.abs(b) > p - 1e-5 ? 1 : 0) + (Math.abs(m) > d - 1e-5 ? 1 : 0) >= 2 &&
        g.lengthSq() > 1e-12 &&
        (g.normalize(), (y = A + g.x * n), (b = _ + g.y * n), (m = M + g.z * n), u.setXYZ(x, g.x, g.y, g.z)),
      c.setXYZ(x, y, b, m));
    let w = Math.abs(u.getX(x)),
      S = Math.abs(u.getY(x)),
      z = Math.abs(u.getZ(x));
    w >= S && w >= z ? h.setXY(x, m, b) : S >= w && S >= z ? h.setXY(x, y, m) : h.setXY(x, y, b);
  }
  return (a === 'bottom' && l.translate(0, e / 2, 0), l);
}
function to(i, e) {
  let t = i.attributes.position,
    n = new Vector3();
  for (let s = 0; s < t.count; s++) (n.fromBufferAttribute(t, s), e(n, s), t.setXYZ(s, n.x, n.y, n.z));
  return i;
}
function gr(i) {
  let e = i.attributes.position,
    t = i.index,
    n = e.count,
    s = new Map(),
    o = (f) => Math.round(e.getX(f) * 2e3) + ',' + Math.round(e.getY(f) * 2e3) + ',' + Math.round(e.getZ(f) * 2e3),
    r = new Array(n);
  for (let f = 0; f < n; f++) r[f] = o(f);
  let a = new Vector3(),
    l = new Vector3(),
    c = new Vector3(),
    u = t ? t.count : n;
  for (let f = 0; f < u; f += 3) {
    let p = t ? t.getX(f) : f,
      d = t ? t.getX(f + 1) : f + 1,
      v = t ? t.getX(f + 2) : f + 2;
    (a.fromBufferAttribute(e, p),
      l.fromBufferAttribute(e, d),
      c.fromBufferAttribute(e, v),
      l.sub(a),
      c.sub(a),
      l.cross(c));
    for (let g of [p, d, v]) {
      let x = s.get(r[g]);
      (x || ((x = [0, 0, 0]), s.set(r[g], x)), (x[0] += l.x), (x[1] += l.y), (x[2] += l.z));
    }
  }
  let h = new Float32Array(n * 3);
  for (let f = 0; f < n; f++) {
    let p = s.get(r[f]) || [0, 1, 0],
      d = Math.hypot(p[0], p[1], p[2]) || 1;
    ((h[f * 3] = p[0] / d), (h[f * 3 + 1] = p[1] / d), (h[f * 3 + 2] = p[2] / d));
  }
  return (i.setAttribute('normal', new BufferAttribute(h, 3)), i);
}
function M1(i) {
  if (i.index) {
    let t = i.index.array;
    for (let n = 0; n < t.length; n += 3) {
      let s = t[n + 1];
      ((t[n + 1] = t[n + 2]), (t[n + 2] = s));
    }
  } else
    for (let t of Object.keys(i.attributes)) {
      let n = i.attributes[t],
        s = n.itemSize,
        o = n.array;
      for (let r = 0; r < n.count; r += 3)
        for (let a = 0; a < s; a++) {
          let l = o[(r + 1) * s + a];
          ((o[(r + 1) * s + a] = o[(r + 2) * s + a]), (o[(r + 2) * s + a] = l));
        }
    }
  let e = i.attributes.normal.array;
  for (let t = 0; t < e.length; t++) e[t] = -e[t];
  return i;
}
function ev(i, e) {
  let t = i.groups[e];
  if (!t) return i;
  let n = Array.from(i.index.array);
  (n.splice(t.start, t.count), i.setIndex(n));
  for (let s of i.groups) s.start > t.start && (s.start -= t.count);
  return ((t.count = 0), i);
}
var O3 = new Quaternion();
var FA = new Vector3(0, 1, 0);
var _1 = new Vector3();
var H3 = new Matrix4();
function vn(i, e, t = 0.02, n = 6, s = !1, o = t) {
  _1.set(e[0] - i[0], e[1] - i[1], e[2] - i[2]);
  let r = _1.length();
  _1.normalize();
  let a = ot(o, t, r, n, !s);
  return (
    O3.setFromUnitVectors(FA, _1),
    H3.compose(new Vector3((i[0] + e[0]) / 2, (i[1] + e[1]) / 2, (i[2] + e[2]) / 2), O3, new Vector3(1, 1, 1)),
    a.applyMatrix4(H3),
    a
  );
}
function Mo(i, e, { soft: t = 0.6, caps: n = !0 } = {}) {
  let s = i.length,
    o = [],
    r = [],
    a = [],
    l = [],
    c = e / 2,
    u = [],
    h = 0,
    f = [0];
  for (let d = 0; d < s; d++) {
    let v = i[d],
      g = i[(d + 1) % s],
      x = g[0] - v[0],
      y = g[1] - v[1],
      b = Math.hypot(x, y) || 1;
    (u.push([y / b, -x / b]), (h += b), f.push(h));
  }
  let p = (d, v) => {
    let g = u[d],
      x = u[(v + s) % s];
    if (g[0] * x[0] + g[1] * x[1] > Math.cos(t)) {
      let y = g[0] + x[0],
        b = g[1] + x[1],
        m = Math.hypot(y, b) || 1;
      return [y / m, b / m];
    }
    return g;
  };
  for (let d = 0; d < s; d++) {
    let v = i[d],
      g = i[(d + 1) % s],
      x = p(d, d - 1),
      y = p(d, d + 1),
      b = o.length / 3;
    (o.push(v[0], v[1], c, v[0], v[1], -c, g[0], g[1], -c, g[0], g[1], c),
      r.push(x[0], x[1], 0, x[0], x[1], 0, y[0], y[1], 0, y[0], y[1], 0),
      a.push(f[d], c, f[d], -c, f[d + 1], -c, f[d + 1], c),
      l.push(b, b + 1, b + 2, b, b + 2, b + 3));
  }
  if (n) {
    let d = ShapeUtils.triangulateShape(
      i.map((v) => new Vector2(v[0], v[1])),
      [],
    );
    for (let v of [1, -1]) {
      let g = o.length / 3;
      for (let x of i) (o.push(x[0], x[1], v * c), r.push(0, 0, v), a.push(x[0], x[1]));
      for (let x of d) v > 0 ? l.push(g + x[0], g + x[1], g + x[2]) : l.push(g + x[0], g + x[2], g + x[1]);
    }
  }
  return Mf(o, r, a, l);
}
function vr(i, e, t = !0) {
  let n = i.length,
    s = [],
    o = [],
    r = [],
    a = 0,
    l = Math.hypot(e[0], e[1], e[2]) * 2;
  for (let p = 0; p < n; p++)
    (p && (a += Math.hypot(i[p][0] - i[p - 1][0], i[p][1] - i[p - 1][1], i[p][2] - i[p - 1][2])),
      s.push(i[p][0] - e[0], i[p][1] - e[1], i[p][2] - e[2], i[p][0] + e[0], i[p][1] + e[1], i[p][2] + e[2]),
      o.push(a, 0, a, l));
  for (let p = 0; p < n - 1; p++) {
    let d = p * 2;
    r.push(d, d + 1, d + 3, d, d + 3, d + 2);
  }
  let c = Mf(s, null, o, r);
  if (!t) return c;
  let u = c.clone(),
    h = u.index.array;
  for (let p = 0; p < h.length; p += 3) {
    let d = h[p + 1];
    ((h[p + 1] = h[p + 2]), (h[p + 2] = d));
  }
  let f = u.attributes.normal.array;
  for (let p = 0; p < f.length; p++) f[p] = -f[p];
  return mergeGeometries([c, u]);
}
function _f(i, e) {
  return new PlaneGeometry(i, e);
}
function UA(i, e, t, n = 4) {
  let s = [],
    o = [],
    r = [],
    a = [];
  for (let l = 0; l <= n; l++) {
    let c = ((l / n - 0.5) * e) / i,
      u = Math.sin(c),
      h = Math.cos(c);
    (s.push(i * u, -t / 2, i * h, i * u, t / 2, i * h), o.push(u, 0, h, u, 0, h), r.push(l / n, 0, l / n, 1));
  }
  for (let l = 0; l < n; l++) {
    let c = l * 2;
    a.push(c, c + 2, c + 3, c, c + 3, c + 1);
  }
  return Mf(s, o, r, a);
}
function ja(i, e, t = 6, n = 12, s = At * 2) {
  let o = new TorusGeometry(i, e, t, n, s),
    r = o.attributes.uv;
  for (let a = 0; a < r.count; a++) r.setXY(a, r.getX(a) * s * i, r.getY(a) * 2 * At * e);
  return o;
}
function Y3(i, e = 8, t = 6) {
  let n = new SphereGeometry(i, e, t),
    s = n.attributes.uv;
  for (let o = 0; o < s.count; o++) s.setXY(o, s.getX(o) * 2 * At * i, s.getY(o) * At * i);
  return n;
}
function NA(i, e) {
  let t = i.attributes.position.count,
    n = i.attributes.color;
  if (
    (n || ((n = new BufferAttribute(new Float32Array(t * 3).fill(1), 3)), i.setAttribute('color', n)),
    e === 1 || e == null)
  )
    return i;
  let s = n.array;
  if (typeof e == 'function') {
    let l = i.attributes.position;
    for (let c = 0; c < t; c++) {
      let u = e(l.getX(c), l.getY(c), l.getZ(c));
      typeof u == 'number'
        ? ((s[c * 3] *= u), (s[c * 3 + 1] *= u), (s[c * 3 + 2] *= u))
        : ((s[c * 3] *= u[0]), (s[c * 3 + 1] *= u[1]), (s[c * 3 + 2] *= u[2]));
    }
    return i;
  }
  let o = typeof e == 'number' ? e : e[0],
    r = typeof e == 'number' ? e : e[1],
    a = typeof e == 'number' ? e : e[2];
  for (let l = 0; l < t; l++) ((s[l * 3] *= o), (s[l * 3 + 1] *= r), (s[l * 3 + 2] *= a));
  return i;
}
var V3 = {
  red: ['paint_red', 1],
  blue: ['paint_blue', 1],
  green: ['paint_green', 1],
  yellow: ['paint_yellow', 1],
  orange: ['paint_orange', 1],
  white: ['paint_white', 1],
  grey: ['paint_grey', 1],
  teal: ['paint_teal', 1],
  rust: ['steel_rust', 1],
  black: ['paint_grey', [0.2, 0.2, 0.22]],
  olive: ['paint_green', [0.75, 0.8, 0.45]],
};
function Ja(i, e = 'blue') {
  return V3[i] || V3[e];
}
var pI = new Matrix4();
var W3 = new Quaternion();
var G3 = new Euler();
var q3 = new Vector3();
var Qg = new Vector3();
function BA({ p: i = [0, 0, 0], r: e = [0, 0, 0], s: t = 1 } = {}) {
  return (
    G3.set(e[0], e[1], e[2]),
    W3.setFromEuler(G3),
    q3.set(i[0], i[1], i[2]),
    typeof t == 'number' ? Qg.set(t, t, t) : Qg.set(t[0], t[1], t[2]),
    new Matrix4().compose(q3, W3, Qg)
  );
}
var ClutterBuilder = class {
  constructor(e, t, n = 1) {
    ((this.G = e),
      (this.name = t),
      (this.seed = Math.abs(n | 0)),
      (this.rng = createRng((this.seed + 1) * 7919 + t.length * 131)),
      (this.b = new Map()),
      (this.stack = [new Matrix4()]));
  }
  push(e) {
    return (this.stack.push(this.stack[this.stack.length - 1].clone().multiply(BA(e))), this);
  }
  pop() {
    return (this.stack.pop(), this);
  }
  mat(e, t) {
    return this.G.mats.get(e, { vertexColors: !0, ...(t || {}) });
  }
  add(e, t, n, s = 1, { raw: o = !1, cast: r = !0 } = {}) {
    let a = typeof e == 'string' ? this.mat(e) : e;
    (n && Dc(t, n), t.applyMatrix4(this.stack[this.stack.length - 1]), o || NA(t, s));
    let l = a.uuid + (r ? 'c' : 'n'),
      c = this.b.get(l);
    return (c || ((c = { mat: a, geos: [], raw: o, cast: r }), this.b.set(l, c)), c.geos.push(t), this);
  }
  decal(e, t, n, s) {
    return this.add(e.material, _f(t, s || t / (e.aspect || 1)), n, 1, { raw: !0, cast: !1 });
  }
  label(e, t, n, s, o) {
    let r = this.G.mats.label(e, t),
      a = Math.min(n, s * (r.aspect || 1));
    return this.add(r.material, _f(a, a / (r.aspect || 1)), o, 1, { raw: !0, cast: !1 });
  }
  cdecal(e, t, n, s, o) {
    return this.add(e.material, UA(t, n, o || n / (e.aspect || 1)), s, 1, { raw: !0, cast: !1 });
  }
  finish({ size: e, colliders: t, grime: n = 1, surface: s } = {}) {
    let o = new Group(),
      r = this.seed * 3.71;
    for (let c of this.b.values()) {
      let u = mergeGeometries(c.geos);
      if (!c.raw && n > 0 && u.attributes.color) {
        let f = u.attributes.position,
          p = u.attributes.normal,
          d = u.attributes.color.array;
        for (let v = 0; v < f.count; v++) {
          let g = f.getX(v),
            x = f.getY(v),
            y = f.getZ(v),
            b = p.getY(v),
            m = gn(g * 1.9 + r, x * 1.9, y * 1.9 + 5.3),
            A = gn(g * 9 + 2.1, x * 9 + r, y * 9),
            _ = (0.82 + 0.18 * m) * (0.92 + 0.08 * A) * (0.76 + 0.24 * zi(b * 0.6 + 0.62, 0, 1)),
            M = zi(1 - x / 0.2, 0, 1);
          ((_ *= 1 - 0.42 * M * M * (0.55 + 0.45 * A)),
            (_ = 1 + (_ - 1) * n),
            (d[v * 3] *= _),
            (d[v * 3 + 1] *= _ * (1 - 0.05 * M * n)),
            (d[v * 3 + 2] *= _ * (1 - 0.12 * M * n)));
        }
      }
      let h = new Mesh(u, c.mat);
      ((h.castShadow = c.cast), (h.receiveShadow = !0), o.add(h));
    }
    let a = PROP_SIZES[this.name] || [1, 1, 1, '', 'metal'],
      l = e || [a[0], a[1], a[2]];
    return (
      (o.userData.size = l),
      (o.userData.colliders = t || [
        { min: [-l[0] / 2, 0, -l[2] / 2], max: [l[0] / 2, l[1], l[2] / 2], surface: s || a[4] },
      ]),
      o
    );
  }
};
var X3 = new Map();
function wf(i, e) {
  let t = X3.get(i);
  return (t || ((t = e()), X3.set(i, t)), t.clone(!0));
}
var j3 = (i, e, t) => {
  let n = zi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};
function $3(i, e, t = 0, n = 0) {
  let s = new THREE.PlaneGeometry(i, e),
    o = s.attributes.uv,
    r = s.attributes.position;
  for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + n);
  return s;
}
var w1 = { pz: [0, 0, 0], nz: [0, At, 0], px: [0, tt, 0], nx: [0, -tt, 0] };
function OA(i) {
  let t = [
    [0, 0.016],
    [0.262, 0.016],
    [0.262, 0.016],
    [0.268, 0.002],
    [0.288, 0],
    [0.295, 0.008],
    [0.295, 0.022],
    [0.284, 0.034],
  ];
  for (let n of [0.305, 0.595])
    t.push([0.283, n - 0.03], [0.291, n - 0.018], [0.297, n], [0.291, n + 0.018], [0.283, n + 0.03]);
  return (
    t.push([0.284, 0.866], [0.295, 0.878], [0.295, 0.892], [0.288, 0.9], [0.268, 0.898]),
    i
      ? t.push([0.268, 0.898], [0.272, 0.888], [0.272, 0.03], [0.272, 0.03], [0, 0.03])
      : t.push([0.262, 0.884], [0.262, 0.884], [0, 0.884]),
    t
  );
}
function HA(i, e, t) {
  let n = new ClutterBuilder(i, 'barrel', t),
    s = n.rng,
    o = 22,
    [r, a] = Ja(e.color, 'blue');
  e.lying && n.push({ p: [-0.45, 0.297, 0], r: [0, 0, -tt] });
  let l = us(OA(!!e.open), o),
    c = [];
  for (let d = 0; d < 2 + (t % 2); d++)
    c.push([s() * At * 2, s.range(0.12, 0.78), s.range(0.07, 0.13), s.range(0.006, 0.014)]);
  (to(l, (d) => {
    let v = Math.hypot(d.x, d.z);
    if (v < 0.27) return;
    let g = Math.atan2(d.z, d.x);
    for (let x of c) {
      let y = Math.abs(g - x[0]) % (At * 2);
      y > At && (y = At * 2 - y);
      let b = Math.hypot(y * 0.285, d.y - x[1]);
      if (b < x[2]) {
        let m = 1 - (x[3] * (0.5 + 0.5 * Math.cos((At * b) / x[2]))) / v;
        ((d.x *= m), (d.z *= m));
      }
    }
  }),
    l.computeVertexNormals());
  let u = l.attributes.normal,
    h = l.attributes.position.count / (o + 1);
  for (let d = 0; d < h; d++) {
    let v = d * (o + 1),
      g = v + o,
      x = u.getX(v) + u.getX(g),
      y = u.getY(v) + u.getY(g),
      b = u.getZ(v) + u.getZ(g),
      m = Math.hypot(x, y, b) || 1;
    (u.setXYZ(v, x / m, y / m, b / m), u.setXYZ(g, x / m, y / m, b / m));
  }
  let f = t * 2.37,
    p = e.color === 'rust';
  return (
    n.add(r, l, null, (d, v, g) => {
      let x = Math.hypot(d, g),
        y = Math.atan2(g, d);
      if (x < 0.27) {
        let w = v > 0.5 ? 0.62 + 0.3 * gn(d * 9 + f, g * 9) : 0.6;
        return [w, w, w];
      }
      let b = Math.pow(gn(y * 2.6 + f, 3.1), 2.2),
        m = v > 0.6 ? (0.88 - v) / 0.28 : v > 0.31 ? (0.6 - v) / 0.29 : (0.31 - v) / 0.31,
        A = 1 - 0.55 * b * (1 - 0.6 * zi(m, 0, 1)),
        M = (x > 0.289 ? 1 : 0) * (0.35 + 0.65 * gn(y * 7 + f, v * 20)),
        E = [A * (1 - 0.25 * M), A * (1 - 0.42 * M), A * (1 - 0.55 * M)];
      return (typeof a != 'number' && ((E[0] *= a[0]), (E[1] *= a[1]), (E[2] *= a[2])), E);
    }),
    e.open ||
      (n.add('steel_galv', ot(0.036, 0.038, 0.016, 8), { p: [0.17, 0.891, 0.02] }, 0.8),
      n.add('steel_galv', ot(0.017, 0.018, 0.014, 8), { p: [-0.16, 0.89, -0.08] }, 0.8)),
    !p &&
      t % 3 !== 2 &&
      n.cdecal(i.mats.decal('hazard_flammable'), 0.2855, 0.15, { p: [0, 0.455, 0], r: [0, 0.9 + t, 0] }),
    t % 2 === 0 &&
      n.cdecal(
        i.mats.label('UN 1202', {
          color: p || e.color === 'white' || e.color === 'yellow' ? 'black' : 'white',
          font: 'stencil',
          distress: 0.5,
        }),
        0.2855,
        0.2,
        { p: [0, 0.74, 0], r: [0, 2.6 + t, 0] },
      ),
    n.finish(e.lying ? { size: [0.9, 0.6, 0.6] } : {})
  );
}
function S1(i, e, { broken: t = !1, stamp: n = !0, bevel: s = !1 } = {}) {
  let o = s ? (u, h, f) => Ge(u, h, f, 0.004) : (u, h, f) => $e(u, h, f),
    r = () => {
      let u = e.range(0.62, 1),
        h = e.range(0.9, 1);
      return [u, u * (0.93 + 0.07 * h), u * (0.82 + 0.18 * h)];
    },
    a = (u = 0.003) => e.range(-u, u);
  for (let [u, h] of [
    [-0.45, 0.1],
    [0, 0.145],
    [0.45, 0.1],
  ])
    i.add('wood_pallet', o(1.2, 0.022, h), { p: [a(), 0.011, u + a()], r: [0, a(0.006), 0] }, r());
  let l = (u, h, f = 0.012) => [
    [-u / 2 + f, -h / 2],
    [u / 2 - f, -h / 2],
    [u / 2, -h / 2 + f],
    [u / 2, h / 2 - f],
    [u / 2 - f, h / 2],
    [-u / 2 + f, h / 2],
    [-u / 2, h / 2 - f],
    [-u / 2, -h / 2 + f],
  ];
  for (let u of [-0.5275, 0, 0.5275])
    for (let h of [-0.45, 0, 0.45])
      i.add(
        'wood_pallet',
        Mo(l(0.145, h === 0 ? 0.145 : 0.1), 0.078, { caps: !1, soft: 0 }),
        { p: [u + a(), 0.061, h + a()], r: [-tt, a(0.03), 0] },
        r().map((f) => f * 0.8),
      );
  for (let u of [-0.5275, 0, 0.5275])
    i.add('wood_pallet', o(0.145, 0.022, 1), { p: [u + a(), 0.111, a()], r: [0, a(0.006), 0] }, r());
  if (
    ([
      [-0.4275, 0.145],
      [-0.215, 0.1],
      [0, 0.145],
      [0.215, 0.1],
      [0.4275, 0.145],
    ].forEach(([u, h], f) => {
      (t && f === 3) ||
        i.add('wood_pallet', o(1.2, 0.022, h), { p: [a(), 0.133, u + a(0.006)], r: [a(0.004), a(0.008), 0] }, r());
    }),
    n)
  ) {
    let u = i.G.mats.label('EUR', { color: 'black', font: 'sans', distress: 0.6 });
    (i.decal(u, 0.085, { p: [-0.5275, 0.062, 0.5015] }),
      i.decal(u, 0.085, { p: [0.5275, 0.062, -0.5015], r: [0, At, 0] }));
  }
}
function VA(i, e, t) {
  let n = new ClutterBuilder(i, 'pallet', t);
  return (S1(n, n.rng, { broken: !!e.broken, bevel: !0 }), n.finish());
}
function WA(i, e) {
  let t = new ClutterBuilder(i, 'pallet_stack', e.seed || 0),
    n = t.rng,
    s = zi(e.count | 0 || 8, 1, 12);
  for (let o = 0; o < s; o++) {
    let r = o === s - 1;
    (t.push({
      p: [o ? n.range(-0.028, 0.028) : 0, o * 0.144, o ? n.range(-0.022, 0.022) : 0],
      r: [0, n.range(-0.035, 0.035) + (n() < 0.3 ? At : 0) + (r ? n.range(-0.06, 0.06) : 0), 0],
    }),
      S1(t, n, { broken: !r && n() < 0.2, stamp: o % 3 === 0, bevel: r }),
      t.pop());
  }
  return t.finish({ size: [1.2, s * 0.144, 1] });
}
function E1(i, e, t, n, { detail: s = !0, label: o = 'FRAGILE', code: r = 'B4-117', skids: a = !0 } = {}) {
  let l = i.rng,
    c = i.G,
    u = 0.022,
    h = 0.07,
    f = a ? 0.07 : 0,
    p = t - f,
    d = f + p / 2,
    v = (z = 1) => {
      let H = l.range(0.7, 1) * z;
      return [H, H * l.range(0.92, 1), H * l.range(0.82, 0.95)];
    },
    g = s ? (z, H, O) => Ge(z, H, O, 0.004) : (z, H, O) => $e(z, H, O);
  if (a)
    for (let z of [-(e / 2 - 0.13), 0, e / 2 - 0.13])
      i.add('wood_pallet', Ge(0.09, f, n - 0.02, 0.006), { p: [z, f / 2, 0] }, v(0.6));
  i.add(
    'wood_dark',
    $e(e - 2 * u - 0.012, p - u - 0.012, n - 2 * u - 0.012),
    { p: [0, f + (p - u - 0.012) / 2 + 0.002, 0] },
    0.25,
  );
  let x = Math.max(3, Math.round(p / 0.125)),
    y = p / x;
  for (let z = 0; z < x; z++) {
    let H = f + y * (z + 0.5);
    for (let [O, q, U] of [
      ['pz', e, n / 2 - u],
      ['nz', e, n / 2 - u],
      ['px', n, e / 2 - u],
      ['nx', n, e / 2 - u],
    ]) {
      let T = U - l.range(0, 0.004),
        D = O === 'pz' ? [0, H, T] : O === 'nz' ? [0, H, -T] : O === 'px' ? [T, H, 0] : [-T, H, 0];
      i.add('wood_pallet', $3(q - 0.03, y - 0.005, l() * 3, l() * 3), { p: D, r: w1[O] }, v());
    }
  }
  let b = Math.max(3, Math.round(n / 0.13)),
    m = (n - 0.02) / b;
  for (let z = 0; z < b; z++)
    i.add(
      'wood_pallet',
      $3(e - 0.03, m - 0.005, l() * 3, l() * 3),
      { p: [0, t - u - l.range(0, 0.003), -n / 2 + 0.01 + m * (z + 0.5)], r: [-tt, 0, 0] },
      v(),
    );
  let A = Math.atan2(p - 2 * h, e - 2 * h),
    _ = Math.hypot(e - 2 * h, p - 2 * h);
  for (let z of [1, -1]) {
    let H = z * (n / 2 - u / 2);
    (i.add('wood_pallet', g(e, h, u), { p: [0, f + h / 2, H] }, v(0.85)),
      i.add('wood_pallet', g(e, h, u), { p: [0, t - h / 2, H] }, v(0.85)));
    for (let U of [1, -1]) i.add('wood_pallet', g(h, p - 2 * h, u), { p: [U * (e / 2 - h / 2), d, H] }, v(0.85));
    s &&
      i.add(
        'wood_pallet',
        Ge(_, h * 0.85, u * 0.8, 0.004),
        { p: [0, d, z * (n / 2 - u * 0.6)], r: [0, 0, z * A] },
        v(0.8),
      );
    let O = z * (e / 2 - u / 2),
      q = n - 2 * u;
    for (let U of [1, -1]) i.add('wood_pallet', g(u, p, h), { p: [O, d, U * (q / 2 - h / 2)] }, v(0.85));
    (i.add('wood_pallet', g(u, h, q - 2 * h), { p: [O, f + h / 2, 0] }, v(0.85)),
      i.add('wood_pallet', g(u, h, q - 2 * h), { p: [O, t - h / 2, 0] }, v(0.85)),
      i.add('wood_pallet', g(e, u, h), { p: [0, t - u / 2, z * (n / 2 - h / 2)] }, v(0.85)),
      i.add('wood_pallet', g(h, u, n - 2 * h), { p: [z * (e / 2 - h / 2), t - u / 2, 0] }, v(0.85)));
  }
  s && i.add('wood_pallet', Ge(h, u, n - 2 * h, 0.004), { p: [0, t - u / 2, 0] }, v(0.85));
  let M = 0.085,
    E = () => {
      let z = l.range(0.55, 0.9);
      return [z, z * 0.9, z * 0.8];
    };
  for (let z of [1, -1])
    for (let H of [1, -1])
      for (let O of s ? [1, 0] : [1]) {
        let q = O ? t - M / 2 : f + M / 2,
          U = E();
        (i.add('steel_galv', $e(M, M, 0.003), { p: [z * (e / 2 - M / 2), q, H * (n / 2 + 0.0015)] }, U),
          i.add('steel_galv', $e(0.003, M, M), { p: [z * (e / 2 + 0.0015), q, H * (n / 2 - M / 2)] }, U),
          O && i.add('steel_galv', $e(M, 0.003, M), { p: [z * (e / 2 - M / 2), t + 0.0015, H * (n / 2 - M / 2)] }, U));
      }
  let w = n / 2 - u + 0.003,
    S = Math.min(0.11, p * 0.15);
  (o &&
    (i.label(o, { color: 'black', font: 'stencil', distress: 0.25 }, e * 0.4, S, {
      p: [-e * 0.2, t - h - S * 0.95, w],
    }),
    i.label(o, { color: 'black', font: 'stencil', distress: 0.25 }, e * 0.4, S, {
      p: [e * 0.2, t - h - S * 0.95, -w],
      r: [0, At, 0],
    }),
    i.decal(c.mats.decal('arrow'), Math.min(0.14, p * 0.2), { p: [e * 0.27, f + h + p * 0.16, w], r: [0, 0, tt] })),
    r &&
      i.label(r, { color: 'black', font: 'stencil', distress: 0.3 }, n * 0.5, S * 0.9, {
        p: [e / 2 - u + 0.003, d + p * 0.12, 0],
        r: w1.px,
      }),
    s &&
      i.decal(c.mats.decal('logo_b'), Math.min(0.2, p * 0.25), {
        p: [-(e / 2 - u + 0.003), d - p * 0.05, 0],
        r: w1.nx,
      }));
}
function GA(i, e) {
  let t = new ClutterBuilder(i, 'crate_wood', e.seed || 0);
  return (
    E1(t, 1.1, 1, 0.9, {
      label: e.label === void 0 ? ['FRAGILE', 'THIS SIDE UP', 'KEEP DRY', 'MACHINE PARTS'][t.seed % 4] : e.label,
      code: e.code || 'B4-' + [117, 204, 318][t.seed % 3],
    }),
    t.finish()
  );
}
function qA(i, e) {
  let t = new ClutterBuilder(i, 'crate_stack', e.seed || 0),
    n = t.rng;
  E1(t, 1.2, 0.95, 1, { label: 'HEAVY', code: 'SLT 04' + (t.seed % 2) });
  let s = {
    x: n.range(-0.1, 0.02),
    z: n.range(-0.05, 0.05),
    th: (n() < 0.5 ? -1 : 1) * n.range(0.1, 0.16),
    L: 0.86,
    W: 0.72,
  };
  (t.push({ p: [s.x, 0.95, s.z], r: [0, s.th, 0] }),
    E1(t, s.L, 0.6, s.W, { detail: !1, skids: !1, label: 'FRAGILE', code: 'B4-204' }),
    t.pop());
  let o = { x: s.x + n.range(-0.05, 0.05), z: s.z + n.range(-0.04, 0.04), th: n.range(-0.12, 0.12) };
  (t.push({ p: [o.x, 1.55, o.z], r: [0, o.th, 0] }),
    E1(t, 0.55, 0.35, 0.45, { detail: !1, skids: !1, label: '', code: '' }),
    t.pop());
  let r = (a, l, c, u, h) => {
    let f = (a - l.x - h * u * Math.sin(c)) / Math.cos(c);
    return l.z - f * Math.sin(c) + h * u * Math.cos(c);
  };
  for (let a of [-0.2, 0.17]) {
    let c = [],
      u = (h) => [
        [a, 0.09, h * 0.506],
        [a, 0.956, h * 0.506],
        [a, 1.556, r(a, s, s.th, s.W / 2, h) + h * 0.006],
        [a, 1.906, r(a, o, o.th, 0.225, h) + h * 0.006],
      ];
    (c.push(...u(1), ...u(-1).reverse()),
      t.add('paint_orange', vr(c, [0.02, 0, 0]), null, [1, 0.8, 0.5]),
      t.add('steel_worn', Ge(0.06, 0.09, 0.025, 0.006), { p: [a, 0.62, 0.5 + 0.016] }, 0.8),
      t.add('steel_dark', vn([a - 0.035, 0.66, 0.53], [a + 0.035, 0.66, 0.53], 0.008, 6, !0), null, 0.8));
  }
  return t.finish();
}
function XA(i, e) {
  let t = new ClutterBuilder(i, 'ibc_tote', e.seed || 0),
    n = t.rng,
    s = () => n.range(0.75, 1);
  for (let y of [-0.44, 0, 0.44]) t.add('steel_galv', $e(1.2, 0.028, 0.1), { p: [0, 0.014, y] }, s());
  for (let y of [-0.54, 0, 0.54])
    for (let b of [-0.44, 0, 0.44]) t.add('steel_galv', Ge(0.12, 0.074, 0.1, 0.008), { p: [y, 0.065, b] }, s() * 0.85);
  for (let y of [-0.48, 0.48]) t.add('steel_galv', Ge(1.2, 0.03, 0.04, 0.006), { p: [0, 0.115, y] }, s());
  for (let y of [-0.58, 0.58]) t.add('steel_galv', Ge(0.04, 0.03, 0.92, 0.006), { p: [y, 0.115, 0] }, s());
  t.add('steel_galv', $e(1.12, 0.012, 0.92), { p: [0, 0.124, 0] }, 0.6);
  let o = 1.1,
    r = 0.95,
    a = 0.9,
    l = 0.13 + r / 2,
    c = eo(o, r, a, 0.07, 8, 6, 8);
  (to(c, (y) => {
    let b = y.x / (o / 2),
      m = y.y / (r / 2),
      A = y.z / (a / 2),
      _ = Math.cos(tt * m) * Math.cos(tt * A),
      M = Math.cos(tt * b) * Math.cos(tt * A),
      E = Math.cos(tt * b) * Math.cos(tt * m);
    (Math.abs(b) > 0.9 && (y.x += Math.sign(b) * (0.016 * _ + 0.004 * Math.abs(Math.sin((y.y * At) / 0.22)) * _)),
      Math.abs(A) > 0.9 && (y.z += Math.sign(A) * (0.016 * E + 0.004 * Math.abs(Math.sin((y.y * At) / 0.22)) * E)),
      m > 0.9 && (y.y += 0.012 * M - 0.01 * Math.max(0, 1 - Math.hypot(y.x, y.z) / 0.3)));
  }),
    gr(c));
  let u = 0.13 + r * n.range(0.45, 0.8),
    h = t.seed * 1.3,
    f = t.mat('plastic_grey', { color: 14278096 });
  (t.add(f, c, { p: [0, l, 0] }, (y, b, m) => {
    let A = j3(u - 0.03, u + 0.03, b + 0.02 * gn(y * 3 + h, m * 3)),
      _ = 0.9 + 0.1 * gn(y * 6, b * 6 + h, m * 6);
    return [_ * (0.52 + 0.48 * A), _ * (0.6 + 0.4 * A), _ * (0.66 + 0.34 * A)];
  }),
    t.add(f, ot(0.12, 0.125, 0.03, 14), { p: [0, 0.13 + r + 0.005, 0] }, 0.9),
    t.add(
      'plastic_red',
      us(
        [
          [0.105, 0],
          [0.105, 0.042],
          [0.105, 0.042],
          [0.09, 0.05],
          [0, 0.05],
        ],
        14,
      ),
      { p: [0, 0.13 + r + 0.015, 0] },
      0.9,
    ));
  for (let y = 0; y < 8; y++) {
    let b = (y * At) / 4;
    t.add(
      'plastic_red',
      $e(0.012, 0.04, 0.02),
      { p: [Math.cos(b) * 0.108, 0.13 + r + 0.036, Math.sin(b) * 0.108], r: [0, -b, 0] },
      0.8,
    );
  }
  let p = 0.575,
    d = 0.475,
    v = 0.13,
    g = 1.1,
    x = 0.011;
  for (let y of [0.2, 0.42, 0.64, 0.86, g]) {
    let b = y === g ? 0.014 : x;
    for (let m of [1, -1])
      (t.add('steel_galv', vn([-p, y, m * d], [p, y, m * d], b, 5), null, s()),
        t.add('steel_galv', vn([m * p, y, -d], [m * p, y, d], b, 5), null, s()));
  }
  for (let y of [1, -1]) {
    for (let b = -0.46; b <= 0.461; b += 0.184)
      t.add('steel_galv', vn([b, v, y * (d - 0.012)], [b, g, y * (d - 0.012)], x, 5), null, s());
    for (let b = -0.36; b <= 0.361; b += 0.18)
      t.add('steel_galv', vn([y * (p - 0.012), v, b], [y * (p - 0.012), g, b], x, 5), null, s());
    t.add('steel_galv', vn([y * 0.28, g + 0.01, -d], [y * 0.28, g + 0.01, d], 0.013, 5), null, s());
  }
  return (
    t.add('aluminium', Ge(0.42, 0.3, 0.004, 0.0015), { p: [-0.1, 0.72, d + 0.014] }, 0.85),
    t.label('IBC 1000 L', { color: 'black', font: 'sans', distress: 0.2 }, 0.36, 0.06, { p: [-0.1, 0.8, d + 0.0175] }),
    t.decal(i.mats.decal(['hazard_flammable', 'hazard_general'][t.seed % 2]), 0.15, { p: [-0.19, 0.67, d + 0.0175] }),
    t.decal(i.mats.decal('numbers_0_9'), 0.2, { p: [0, 0.66, d + 0.0175] }),
    t.decal(i.mats.decal('leak_stain'), 0.3, { p: [p + 0.004, 0.3, 0.02], r: w1.px }),
    t.add('polymer_black', vn([0.52, 0.2, 0], [0.575, 0.2, 0], 0.05, 10, !0), null, 1),
    t.add('plastic_red', vn([0.575, 0.2, 0], [0.598, 0.2, 0], 0.045, 10, !0), null, 0.9),
    t.add('plastic_red', Ge(0.02, 0.022, 0.13, 0.005), { p: [0.55, 0.262, 0.02], r: [0, 0.4, 0] }, 0.9),
    t.add('polymer_black', ot(0.012, 0.012, 0.03, 6), { p: [0.55, 0.245, 0] }),
    t.finish()
  );
}
function Z3(i, e, t, n = 0) {
  let s = [],
    o = (2 * i) / e;
  for (let r = 0; r < e; r++) {
    let a = -i + r * o + 0.003,
      l = -i + (r + 1) * o - 0.003,
      c = [a, (a + l) / 2, l],
      u = [],
      h = [],
      f = [],
      p = [],
      d = (y) => Math.sqrt(Math.max(0, i * i - y * y)),
      v = t() * 2,
      g = t() * 2;
    for (let y of c)
      (u.push(y, -d(y), 0, y, d(y), 0), h.push(0, 0, 1, 0, 0, 1), f.push(-d(y) + v, y + g, d(y) + v, y + g));
    p.push(0, 2, 3, 0, 3, 1, 2, 4, 5, 2, 5, 3);
    let x = new THREE.BufferGeometry();
    (x.setAttribute('position', new THREE.BufferAttribute(new Float32Array(u), 3)),
      x.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(h), 3)),
      x.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(f), 2)),
      x.setIndex(p),
      s.push(x));
  }
  return s;
}
function YA(i, e) {
  let t = new ClutterBuilder(i, 'cable_reel', e.seed || 0),
    n = t.rng,
    s = 0.65,
    o = s,
    r = 0.4,
    a = 0.045,
    l = (y = 1) => {
      let b = n.range(0.7, 1) * y;
      return [b, b * n.range(0.93, 1), b * n.range(0.85, 0.97)];
    },
    c = n.range(-0.5, 0.5);
  t.push({ p: [0, o, 0], r: [0, 0, c] });
  for (let y of [1, -1]) {
    for (let b of Z3(s - 0.004, 9, n))
      t.add('wood_dark', b, { p: [0, 0, y * (r + n.range(0, 0.003))], r: [0, y > 0 ? 0 : At, 0] }, l());
    for (let b of Z3(s - 0.004, 9, n))
      t.add('wood_dark', b, { p: [0, 0, y * (r - a)], r: [0, y > 0 ? At : 0, tt] }, l(0.8));
    (t.add('wood_dark', ot(s, s, a, 24, !0), { p: [0, 0, y * (r - a / 2)], r: [tt, 0, 0] }, l(0.75)),
      t.add('steel_dark', ot(0.105, 0.105, 0.008, 12), { p: [0, 0, y * (r + 0.006)], r: [tt, 0, 0] }, 0.9),
      t.add('polymer_black', ot(0.04, 0.04, 0.004, 10), { p: [0, 0, y * (r + 0.0105)], r: [tt, 0, 0] }, 0.3));
    for (let b = 0; b < 6; b++) {
      let m = (b * At) / 3 + 0.3;
      t.add(
        'steel_galv',
        ot(0.017, 0.017, 0.014, 6),
        { p: [Math.cos(m) * 0.3, Math.sin(m) * 0.3, y * (r + 0.006)], r: [tt, 0, 0] },
        n.range(0.5, 0.9),
      );
    }
    (t.label(
      y > 0 ? 'NYY-J 4x95 mm2  500 m' : 'IRONTIDE TERMINAL',
      { color: 'white', font: 'stencil', distress: 0.45 },
      0.7,
      0.085,
      { p: [0, 0.4, y * (r + 0.006)], r: [0, y > 0 ? 0 : At, 0] },
    ),
      y > 0 && t.decal(i.mats.decal('arrow'), 0.2, { p: [0.36, -0.2, r + 0.006], r: [0, 0, -1.2] }));
  }
  let u = 16,
    h = r - a,
    f = (2 * h) / u,
    p = 0.47,
    d = [];
  for (let y = 0; y <= u; y++) (d.push([p - 0.017, -h + y * f]), y < u && d.push([p, -h + (y + 0.5) * f]));
  let v = t.seed * 0.7;
  (t.add('rubber', us(d, 20), { r: [tt, 0, 0] }, (y, b, m) => 0.7 + 0.5 * gn(Math.atan2(b, y) * 2 + v, m * 30)),
    t.pop());
  let g = 0.2,
    x = [];
  for (let y = 1.9; y >= -0.25; y -= 0.36)
    x.push([Math.cos(y) * (p + 0.012), o + Math.sin(y) * (p + 0.012), g + (1.9 - y) * 0.02]);
  (x.push(
    [0.53, 0.3, g + 0.05],
    [0.56, 0.08, g + 0.06],
    [0.5, 0.024, g + 0.02],
    [0.3, 0.022, g - 0.1],
    [0.05, 0.022, g - 0.02],
    [-0.2, 0.022, g + 0.06],
    [-0.38, 0.022, g - 0.05],
  ),
    t.add('rubber', Fn(x, 0.02, 6, !1, 0.5), null, 0.9),
    t.add('brass', vn([-0.38, 0.022, g - 0.05], [-0.41, 0.022, g - 0.07], 0.014, 6, !0), null, 0.9));
  for (let y of [r - a / 2, -(r - a / 2)])
    (t.add(
      'wood_pallet',
      Mo(
        [
          [0.14, 0],
          [0.37, 0],
          [0.37, 0.1],
        ],
        0.1,
        { soft: 0 },
      ),
      { p: [0, 0, y] },
      l(0.8),
    ),
      t.add(
        'wood_pallet',
        Mo(
          [
            [-0.37, 0],
            [-0.14, 0],
            [-0.37, 0.1],
          ],
          0.1,
          { soft: 0 },
        ),
        { p: [0, 0, y] },
        l(0.8),
      ));
  return t.finish();
}
function tv(i, e, t, n = 20) {
  let s = i - t,
    o = Math.min(0.011, s * 0.08),
    r = [
      [t, e * 0.18],
      [t + s * 0.45, e * 0.035],
      [i - s * 0.2, e * 0.02],
      [i - s * 0.06, e * 0.07],
      [i, e * 0.17],
      [i, e * 0.17],
      [i, e * 0.355],
      [i - o, e * 0.385],
      [i, e * 0.415],
      [i, e * 0.585],
      [i - o, e * 0.615],
      [i, e * 0.645],
      [i, e * 0.83],
      [i, e * 0.83],
      [i - s * 0.06, e * 0.93],
      [i - s * 0.2, e * 0.98],
      [t + s * 0.45, e * 0.965],
      [t, e * 0.82],
      [t, e * 0.82],
      [t, e * 0.18],
    ],
    a = us(r, n),
    l = a.attributes.uv,
    c = r.length,
    u = [0];
  for (let v = 1; v < c; v++) u.push(u[v - 1] + Math.hypot(r[v][0] - r[v - 1][0], r[v][1] - r[v - 1][1]));
  let h = (u[8] + u[9]) / 2,
    f = h - u[4],
    p = u[4] - u[0],
    d = Math.max(1, Math.round((2 * At * i) / 0.5)) * 0.5;
  for (let v = 0; v < c; v++) {
    let g = v >= c - 2 ? -(f + p) : u[v] - h,
      x = Math.abs(g),
      y = Math.sign(g) * (x <= f + 1e-6 ? (x / f) * 0.126 : 0.126 + Math.min(1, (x - f) / p) * 0.022);
    for (let b = 0; b <= n; b++) l.setXY(v * (n + 1) + b, (b / n) * d, y);
  }
  return a;
}
function $A(i, e) {
  let t = new ClutterBuilder(i, 'tire_stack', e.seed || 0),
    n = t.rng,
    s = zi(e.count | 0 || 4, 1, 5);
  for (let o = 0; o < s; o++) {
    let r = tv(0.39, 0.25, 0.215, s > 4 ? 16 : 20),
      a = {
        p: [o ? n.range(-0.022, 0.022) : 0, o * 0.25 - (o ? 0.004 : 0), o ? n.range(-0.022, 0.022) : 0],
        r: [0, n() * 6, 0],
      },
      l = n.range(0.75, 1),
      c = o * 3.1;
    t.add('tire', r, a, (u, h, f) => {
      let p = Math.hypot(u - a.p[0], f - a.p[2]);
      return l * (p < 0.23 ? 0.5 : 0.8 + 0.2 * gn(Math.atan2(f, u) * 3 + c, p * 30));
    });
  }
  return t.finish({ size: [0.8, s * 0.25, 0.8] });
}
function ZA(i, e, t) {
  let n = new ClutterBuilder(i, 'jerry_can', t),
    [s, o] = Ja(e.color, 'olive'),
    r = eo(0.336, 0.36, 0.156, 0.022, 3, 3, 3, 'bottom'),
    a = (x, y) => (y > 0.3 && x > 0.04 ? y - (x - 0.04) * 0.5 : y);
  (to(r, (x) => {
    ((x.y = a(x.x, x.y)), Math.abs(x.z) > 0.07 && Math.abs(x.x) < 0.14 && x.y > 0.04 && x.y < 0.3 && (x.z *= 1.02));
  }),
    r.computeVertexNormals(),
    n.add(s, r, null, o),
    n.add(
      s,
      Mo(
        [
          [-0.172, 0],
          [0.172, 0],
          [0.172, 0.297],
          [0.045, 0.364],
          [-0.172, 0.364],
        ],
        0.007,
        { soft: 0 },
      ),
      null,
      typeof o == 'number' ? 0.8 : o.map((x) => x * 0.8),
    ));
  let l = 0.24,
    c = 0.2,
    u = -0.025,
    h = 0.165,
    f = Math.hypot(l, c) - 0.02,
    p = Math.atan2(c, l);
  for (let x of [1, -1]) {
    let y = x * 0.079;
    for (let b of [1, -1]) n.add(s, Ge(l, 0.016, 0.007, 0.003), { p: [u, h + (b * c) / 2, y] }, o);
    for (let b of [1, -1]) n.add(s, Ge(0.016, c, 0.007, 0.003), { p: [u + (b * l) / 2, h, y] }, o);
    for (let b of [1, -1]) n.add(s, Ge(f, 0.018, 0.008, 0.003), { p: [u, h, y], r: [0, 0, b * p] }, o);
  }
  for (let x of [-0.042, 0, 0.042])
    n.add(
      s,
      Fn(
        [
          [-0.135, 0.35, x],
          [-0.125, 0.42, x],
          [-0.09, 0.44, x],
          [-0.02, 0.44, x],
          [0.01, 0.42, x],
          [0.02, 0.35, x],
        ],
        0.0105,
        5,
        !1,
        0.5,
      ),
      null,
      o,
    );
  let d = [0.1, 0.33, 0],
    v = [0.42, 0.9, 0],
    g = (x) => [d[0] + v[0] * x, d[1] + v[1] * x, 0];
  return (
    n.add(s, vn(g(-0.02), g(0.07), 0.03, 8, !0), null, o),
    n.add('steel_dark', vn(g(0.07), g(0.1), 0.036, 8, !0), null, 0.9),
    n.add('steel_galv', Ge(0.07, 0.008, 0.02, 0.002), { p: g(0.108), r: [0, 0, -0.44] }, 0.8),
    n.decal(i.mats.decal('hazard_flammable'), 0.055, { p: [0.125, 0.25, 0.0795] }),
    n.decal(i.mats.decal('hazard_flammable'), 0.055, { p: [-0.125, 0.25, -0.0795], r: [0, At, 0] }),
    n.finish()
  );
}
function jA(i, e, t) {
  let n = new ClutterBuilder(i, 'traffic_cone', t),
    s = n.rng,
    o = t * 4.1;
  e.lying && (n.push({ p: [-0.34, 0.18, 0], r: [0, s() * 6, 0] }), n.push({ r: [0, 0, -tt + 0.16] }));
  let r = (h) => 0.128 + ((0.031 - 0.128) * (h - 0.05)) / (0.685 - 0.05);
  n.add('rubber', Ge(0.36, 0.03, 0.36, 0.008, 'bottom'), null, 0.9);
  let a = (h, f, p) => {
      let d = gn(Math.atan2(p, h) * 3 + o, f * 14);
      return d > 0.68 ? 0.45 : 0.85 + 0.15 * d;
    },
    l = (h, f, p = [], d = []) => us([...p, [r(h), h], [r(f), f], ...d], 16),
    c = n.mat('plastic_red', { color: 12734234 }),
    u = n.mat('plastic_grey', { color: 13224386 });
  return (
    n.add(
      c,
      l(0.05, 0.36, [
        [0.165, 0.03],
        [0.15, 0.04],
        [0.136, 0.05],
      ]),
      null,
      a,
    ),
    n.add(u, l(0.36, 0.5), null, (h, f, p) => 0.85 * a(h, f, p)),
    n.add(c, l(0.5, 0.56), null, a),
    n.add(u, l(0.56, 0.61), null, (h, f, p) => 0.85 * a(h, f, p)),
    n.add(
      c,
      l(
        0.61,
        0.685,
        [],
        [
          [0.028, 0.696],
          [0.018, 0.7],
          [0.018, 0.7],
          [0, 0.7],
        ],
      ),
      null,
      a,
    ),
    e.lying && (n.pop(), n.pop()),
    n.finish(e.lying ? { size: [0.72, 0.36, 0.36] } : {})
  );
}
function JA(i, e) {
  let t = new ClutterBuilder(i, 'gas_cylinders', e.seed || 0),
    n = t.rng,
    s = 12,
    o = () => n.range(0.6, 0.9);
  t.add('diamond_plate', Ge(0.9, 0.016, 0.5, 0.004, 'bottom'), null, 0.8);
  for (let u of [-0.43, 0.43])
    (t.add('steel_dark', Ge(0.04, 1.14, 0.04, 0.005), { p: [u, 0.585, -0.225] }, o()),
      t.add('steel_dark', Ge(0.036, 0.036, 0.43, 0.005), { p: [u, 1.06, -0.01] }, o()),
      t.add('steel_dark', Ge(0.036, 0.036, 0.43, 0.005), { p: [u, 0.3, -0.01] }, o()),
      t.add('steel_dark', Ge(0.036, 0.32, 0.036, 0.005), { p: [u, 0.16, 0.19] }, o()),
      t.add('steel_galv', ja(0.016, 0.004, 4, 8), { p: [u - Math.sign(u) * 0, 1.06, 0.215], r: [0, tt, 0] }, 0.8));
  for (let u of [0.45, 1.06]) t.add('steel_dark', Ge(0.9, 0.04, 0.036, 0.005), { p: [0, u, -0.225] }, o());
  (t.add('paint_yellow', Ge(0.3, 0.2, 0.004, 0.001), { p: [0, 0.76, -0.245] }, 0.9),
    t.decal(i.mats.decal('hazard_flammable'), 0.15, { p: [0, 0.76, -0.2475], r: [0, At, 0] }));
  let r = [
      ['paint_red', 1],
      ['paint_white', 1],
      ['paint_blue', 1],
      ['paint_yellow', 1],
      ['paint_grey', 0.5],
    ],
    a = [
      ['paint_grey', 0.75],
      ['paint_grey', 0.55],
      ['paint_red', [0.55, 0.4, 0.4]],
      ['paint_blue', 0.8],
    ];
  for (let u = 0; u < 3; u++) {
    let h = (u - 1) * 0.272,
      f = 1 - n.range(0, 0.05),
      p = 0.115,
      d = r[(t.seed + u * 2) % r.length],
      v = a[(t.seed + u) % a.length],
      g = u * 5.3 + t.seed,
      x = n() * 6;
    (t.push({ p: [h, 0.016, 0.015 + n.range(-0.01, 0.01)], r: [0, x, 0], s: [1, f, 1] }),
      t.add(
        v[0],
        us(
          [
            [0, 0.012],
            [0.095, 0.012],
            [0.095, 0.012],
            [0.1, 0],
            [0.111, 0],
            [p, 0.008],
            [p, 0.4],
            [p, 0.8],
            [p, 1.22],
          ],
          s,
        ),
        null,
        (y, b, m) => {
          let A = gn(Math.atan2(m, y) * 3 + g, b * 5),
            _ = A > 0.7 ? 0.55 : 1,
            M = typeof v[1] == 'number' ? [v[1], v[1], v[1]] : v[1];
          return [M[0] * _, M[1] * _ * (A > 0.7 ? 0.85 : 1), M[2] * _ * (A > 0.7 ? 0.7 : 1)];
        },
      ),
      t.add(
        d[0],
        us(
          [
            [p, 1.22],
            [0.111, 1.285],
            [0.098, 1.34],
            [0.075, 1.385],
            [0.052, 1.41],
            [0.04, 1.42],
          ],
          s,
        ),
        null,
        d[1],
      ),
      t.add(
        'steel_dark',
        us(
          [
            [0.04, 1.42],
            [0.057, 1.42],
            [0.057, 1.42],
            [0.057, 1.448],
            [0.057, 1.448],
            [0.05, 1.452],
            [0.053, 1.53],
            [0.046, 1.565],
            [0.026, 1.585],
            [0, 1.588],
          ],
          s,
        ),
        null,
        0.8,
      ));
    for (let y of [0, At])
      t.add(
        'polymer_black',
        ot(0.016, 0.016, 0.004, 6),
        { p: [Math.cos(y) * 0.052, 1.5, Math.sin(y) * 0.052], r: [0, -y, tt] },
        0.2,
      );
    (u !== 1 &&
      t.cdecal(i.mats.decal(u ? 'hazard_general' : 'hazard_flammable'), p + 0.0015, 0.1, {
        p: [0, 1.08, 0],
        r: [0, n.range(-0.5, 0.5) - x, 0],
      }),
      t.cdecal(
        i.mats.label(['ACETYLENE', 'OXYGEN', 'ARGON', 'PROPANE'][(t.seed + u) % 4], {
          color: 'white',
          font: 'stencil',
          distress: 0.4,
        }),
        p + 0.0015,
        0.2,
        { p: [0, 0.86, 0], r: [0, n.range(-0.4, 0.4) - x, 0] },
      ),
      t.pop());
  }
  let l = 19,
    c = (u) => {
      let h = 0.215;
      for (let f = -1; f <= 1; f++) {
        let p = u - f * 0.272;
        Math.abs(p) < 0.115 && (h = Math.max(h, 0.015 + Math.sqrt(0.123 * 0.123 - p * p) + 0));
      }
      return Math.max(h, 0.1);
    };
  for (let u = 0; u < l; u++) {
    let h = u / (l - 1),
      f = -0.425 + 0.85 * h,
      p = Math.max(c(f), c(f - 0.03), c(f + 0.03)) + 0.004,
      d = 1.05 - 0.035 * Math.sin(At * ((h * 3) % 1)) - 0.01;
    t.add(
      'steel_galv',
      ja(0.017, 0.0045, 3, 6),
      { p: [f, d, p], r: [u % 2 ? tt : 0.15, 0, 0], s: [1.35, 1, 1] },
      n.range(0.6, 0.95),
    );
  }
  return t.finish();
}
function KA(i, e) {
  let t = new ClutterBuilder(i, 'pipe_stack', e.seed || 0),
    n = t.rng,
    s = 0.1365,
    o = 0.012,
    r = 0.08,
    a = 14,
    l = (h = 1) => {
      let f = n.range(0.6, 0.95) * h;
      return [f, f * 0.95, f * 0.86];
    };
  for (let h of [-2.2, 0, 2.2]) {
    t.add(
      'wood_dark',
      Ge(0.11, r, 1.2, 0.008),
      { p: [h + n.range(-0.1, 0.1), r / 2, 0], r: [0, n.range(-0.03, 0.03), 0] },
      l(),
    );
    for (let f of [1, -1])
      t.add(
        'wood_pallet',
        Mo(
          f > 0
            ? [
                [0, 0],
                [0.158, 0],
                [0.158, 0.1],
              ]
            : [
                [-0.158, 0],
                [0, 0],
                [-0.158, 0.1],
              ],
          0.1,
          { soft: 0 },
        ),
        { p: [h, r, f * 0.44], r: [0, -tt, 0] },
        l(0.9),
      );
  }
  let c = [4, 3, 2],
    u = 2 * s * Math.sin(At / 3);
  c.forEach((h, f) => {
    for (let p = 0; p < h; p++) {
      let d = (p - (h - 1) / 2) * 2 * s,
        v = r + s + f * u,
        g = n.range(5.78, 5.92),
        x = n.range(-3, 3 - g) * 0.999 + 0,
        y = Math.max(-3, Math.min(3 - g, x)) + g / 2,
        b = n() < 0.7 ? 'steel_rust' : 'steel_dark',
        m = n() * 50,
        A = n.range(0.75, 1),
        _ = new THREE.CylinderGeometry(s, s, g, a, 4, !0);
      {
        let w = _.attributes.uv,
          S = _.attributes.position;
        for (let z = 0; z < w.count; z++) w.setXY(z, w.getX(z) * 2 * At * s, S.getY(z));
      }
      let M = { p: [y, v, d], r: [n() * 6, 0, tt] };
      t.add(b, _, M, (w, S, z) => A * (0.75 + 0.35 * gn(w * 1.3 + m, z * 9, S * 9)));
      let E = M1(ot(s - o, s - o, g - 0.002, a, !0));
      t.add(
        'steel_rust',
        E,
        M,
        (w) => 0.16 + 0.5 * j3(g / 2 + Math.abs(y) - 0.9, g / 2 + Math.abs(y) + 0.2, Math.abs(w - y) + Math.abs(y)),
      );
      for (let w of [1, -1])
        t.add(
          b,
          us(
            w > 0
              ? [
                  [s, 0],
                  [s - o, 0],
                ]
              : [
                  [s - o, 0],
                  [s, 0],
                ],
            a,
          ),
          { p: [y + (w * g) / 2, v, d], r: [0, 0, -tt] },
          A * 1.1,
        );
    }
  });
  for (let h of [-1.35, 1.5]) {
    let p = 2 * s,
      d = r + s + 2 * u + s + 0.004,
      v = [],
      g = [
        [-(1.5 * p + s + 0.004), r + s],
        [-(0.5 * p + s * 0.5 + 0.004), r + s + 2 * u + s * 0.87],
        [-0.5 * p, d],
        [0.5 * p, d],
        [0.5 * p + s * 0.5 + 0.004, r + s + 2 * u + s * 0.87],
        [1.5 * p + s + 0.004, r + s],
        [1.5 * p, r - 0.004],
        [-1.5 * p, r - 0.004],
        [-(1.5 * p + s + 0.004), r + s],
      ];
    for (let x of g) v.push([h, x[1], x[0]]);
    (t.add('steel_dark', vr(v, [0.016, 0, 0]), null, 0.7),
      t.add('steel_galv', Ge(0.04, 0.012, 0.05, 0.003), { p: [h, d + 0.005, 0.03] }, 0.8));
  }
  return (
    t.cdecal(
      i.mats.label('API 5L X52  273.1 x 12.5  HEAT 40719', { color: 'white', font: 'stencil', distress: 0.5 }),
      s + 0.002,
      0.2,
      { p: [0.9, r + s + 2 * u, s], r: [-tt + 0.9, 0, tt] },
      1.6,
    ),
    t.finish()
  );
}
function J3(i) {
  (i('barrel', (e, t = {}) => {
    let n = Math.abs(t.seed | 0) % 4;
    return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`, () => HA(e, t, n));
  }),
    i('pallet', (e, t = {}) => {
      let n = Math.abs(t.seed | 0) % 4;
      return wf(`pallet|${!!t.broken}|${n}`, () => VA(e, t, n));
    }),
    i('pallet_stack', (e, t = {}) => WA(e, t)),
    i('crate_wood', (e, t = {}) => GA(e, t)),
    i('crate_stack', (e, t = {}) => qA(e, t)),
    i('ibc_tote', (e, t = {}) => XA(e, t)),
    i('cable_reel', (e, t = {}) => YA(e, t)),
    i('tire_stack', (e, t = {}) => $A(e, t)),
    i('jerry_can', (e, t = {}) => {
      let n = Math.abs(t.seed | 0) % 2;
      return wf(`jerry|${t.color}|${n}`, () => ZA(e, t, n));
    }),
    i('traffic_cone', (e, t = {}) => {
      let n = Math.abs(t.seed | 0) % 3;
      return wf(`cone|${!!t.lying}|${n}`, () => jA(e, t, n));
    }),
    i('gas_cylinders', (e, t = {}) => JA(e, t)),
    i('pipe_stack', (e, t = {}) => KA(e, t)));
}
var Q3 = (i, e, t) => {
  let n = zi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};
function nv(i, e, t = 0, n = 0) {
  let s = new THREE.PlaneGeometry(i, e),
    o = s.attributes.uv,
    r = s.attributes.position;
  for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + n);
  return s;
}
function QA(i, e) {
  let t = new ClutterBuilder(i, 'tarp_cargo', e.seed || 0),
    n = t.rng,
    s = t.seed * 1.7,
    o = 0.144,
    r = [
      [-1.06, -0.12, -0.58, 0.58, n.range(0.98, 1.12)],
      [-0.06, 1.06, -0.58, 0.12, n.range(1.32, 1.42)],
      [0.02, 0.62, 0.16, 0.58, n.range(0.72, 0.86)],
      [0.66, 1.06, 0.18, 0.56, n.range(0.5, 0.62)],
    ];
  for (let N of [-0.6, 0.6]) (t.push({ p: [N, 0, 0], r: [0, 0, 0] }), S1(t, n, { stamp: !1 }), t.pop());
  for (let N of r) {
    let Q = N[1] - N[0],
      K = N[3] - N[2],
      ie = N[4] - o,
      F = (N[0] + N[1]) / 2,
      X = (N[2] + N[3]) / 2,
      ne = n.range(0.7, 0.95);
    (t.add('wood_pallet', Ge(Q, ie, K, 0.006), { p: [F, o + ie / 2, X] }, [ne, ne * 0.95, ne * 0.88]),
      t.add('wood_pallet', $e(Q + 0.012, 0.07, K + 0.012), { p: [F, o + 0.04, X] }, ne * 0.75));
  }
  let a = 1.9,
    l = 22,
    c = 14,
    u = -1.125,
    h = 1.125,
    f = -0.645,
    p = 0.645,
    d = 5,
    v = (N, Q) => {
      let K = 0.3;
      for (let ie of r) {
        let F = Math.max(ie[0] - N, 0, N - ie[1]),
          X = Math.max(ie[2] - Q, 0, Q - ie[3]),
          ne = Math.hypot(F, X);
        K = Math.max(K, ie[4] - 0.95 * ne - 0.9 * ne * ne);
      }
      return (
        K +
        0.016 +
        0.022 * gn(N * 5 + s, Q * 5) +
        0.008 * Math.sin(N * 23 + Q * 7 + s) +
        0.006 * Math.sin(Q * 31 - N * 5)
      );
    },
    g = [],
    x = [],
    y = [],
    b = (N, Q) => Q * (l + 1) + N;
  for (let N = 0; N <= c; N++)
    for (let Q = 0; Q <= l; Q++) {
      let K = u + ((h - u) * Q) / l,
        ie = f + ((p - f) * N) / c;
      (g.push(K, v(K, ie), ie), x.push(K * a, ie * a));
    }
  for (let N = 0; N < c; N++)
    for (let Q = 0; Q < l; Q++) {
      let K = b(Q, N),
        ie = b(Q + 1, N),
        F = b(Q + 1, N + 1),
        X = b(Q, N + 1);
      y.push(K, X, ie, ie, X, F);
    }
  let m = [];
  for (let N = 0; N < l; N++) m.push([N, 0, 0, -1]);
  for (let N = 0; N < c; N++) m.push([l, N, 1, 0]);
  for (let N = l; N > 0; N--) m.push([N, c, 0, 1]);
  for (let N = c; N > 0; N--) m.push([0, N, -1, 0]);
  let A = m.length,
    _ = (l + 1) * (c + 1),
    M = new Map(),
    E = n() * A;
  m.forEach((N, Q) => {
    M.set(N[0] + ',' + N[1], Q);
    let K = (N[0] === 0 || N[0] === l) && (N[1] === 0 || N[1] === c),
      ie = N[2],
      F = N[3];
    K && ((ie = N[0] === 0 ? -0.707 : 0.707), (F = N[1] === 0 ? -0.707 : 0.707));
    let X = b(N[0], N[1]),
      ne = g[X * 3],
      re = g[X * 3 + 1],
      $ = g[X * 3 + 2],
      ue = Math.abs(Q - E);
    ue = Math.min(ue, A - ue);
    let me = 0.17 + 0.07 * Math.sin(Q * 0.55 + s) + 0.07 * gn(Q * 0.31 + s, 2.2) + 0.3 * Math.exp((-ue * ue) / 14),
      ee = n() * 6;
    for (let B = 1; B <= d; B++) {
      let P = B / d,
        V = re + (me - re) * (0.25 * P + 0.75 * P * P) - (B === 1 ? 0.02 : 0),
        Y = (N[0] === 5 || N[0] === 16) && N[2] === 0 ? 0.035 * Math.sin(Math.PI * P) : 0,
        L =
          P * (0.04 * Math.sin(Q * 1.7 + ee * 0.2) + 0.028 * Math.sin(Q * 0.83 + 1.3 + s)) +
          0.02 * P * gn(Q * 0.8, B * 0.9 + s) -
          Y,
        Z = (B === 1 ? 0.028 : 0.04 + 0.03 * P) + L + (K ? 0.012 * P : 0),
        J = zi(ne + ie * Z, -1.2, 1.2),
        oe = zi($ + F * Z, -0.7, 0.7),
        fe = re - V;
      (g.push(J, V, oe), x.push((ne + ie * (Z + fe)) * a, ($ + F * (Z + fe)) * a));
    }
  });
  let w = (N, Q) => (Q === 0 ? b(m[N][0], m[N][1]) : _ + N * d + (Q - 1));
  for (let N = 0; N < A; N++)
    for (let Q = 0; Q < d; Q++) {
      let K = (N + 1) % A,
        ie = w(N, Q),
        F = w(K, Q),
        X = w(K, Q + 1),
        ne = w(N, Q + 1);
      y.push(ie, F, ne, F, X, ne);
    }
  let S = new THREE.BufferGeometry();
  (S.setAttribute('position', new THREE.BufferAttribute(new Float32Array(g), 3)),
    S.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(x), 2)),
    S.setIndex(y),
    S.computeVertexNormals());
  let z = S.attributes.normal,
    H = S.attributes.position,
    O = (N, Q) => [H.getX(N) + z.getX(N) * Q, H.getY(N) + z.getY(N) * Q, H.getZ(N) + z.getZ(N) * Q],
    q = [];
  for (let N of [5, 16]) {
    let Q = [],
      K = M.get(N + ',0'),
      ie = M.get(N + ',' + c);
    Q.push([H.getX(w(K, d)), 0.11, -0.52]);
    for (let F = d; F >= 1; F--) Q.push(O(w(K, F), 0.007));
    for (let F = 0; F <= c; F++) Q.push(O(b(N, F), 0.007));
    for (let F = 1; F <= d; F++) Q.push(O(w(ie, F), 0.007));
    (Q.push([H.getX(w(ie, d)), 0.11, 0.52]), q.push(Q));
  }
  let U = 6,
    T = [],
    D = M.get('0,' + U),
    C = M.get(l + ',' + U);
  T.push([-1.1, 0.1, H.getZ(w(D, d))]);
  for (let N = d; N >= 1; N -= 2) T.push(O(w(D, N), 0.012));
  for (let N = 0; N <= l; N += 2) T.push(O(b(N, U), 0.012));
  for (let N = 1; N <= d; N += 2) T.push(O(w(C, N), 0.012));
  (T.push([1.1, 0.1, H.getZ(w(C, d))]),
    t.add(t.mat('tarp', { doubleSide: !0 }), S, null, (N, Q, K) => {
      let ie = gn(N * 2.3 + s, Q * 2.3, K * 2.3),
        F = gn(N * 11, Q * 11, K * 11 + s);
      return (0.72 + 0.28 * ie) * (0.9 + 0.1 * F) * (0.8 + 0.2 * Q3(0.15, 0.6, Q));
    }));
  for (let N of q) {
    t.add('paint_orange', vr(N, [0.024, 0, 0]), null, [1, 0.82, 0.5]);
    let Q = N[N.length - 4];
    (t.add('steel_worn', Ge(0.065, 0.1, 0.03, 0.006), { p: [Q[0], Q[1], Q[2] + 0.014], r: [0.25, 0, 0] }, 0.8),
      t.add(
        'steel_dark',
        Ge(0.02, 0.09, 0.012, 0.003),
        { p: [Q[0] + 0.03, Q[1] + 0.06, Q[2] + 0.04], r: [0.9, 0, 0] },
        0.8,
      ));
  }
  t.add('rope', Fn(T, 0.009, 4, !1, 0.5), null, 0.85);
  let G = [2.4, 1.5, 1.4],
    j = Math.max(...r.map((N) => N[4])) + 0.04;
  return t.finish({ size: G, colliders: [{ min: [-1.2, 0, -0.7], max: [1.2, j, 0.7], surface: 'dirt' }] });
}
function eR(i, e, t, n) {
  let s = ev(eo(i, e, t, Math.min(e * 0.46, 0.075), 3, 3, 3), 3),
    o = n() * 9,
    r = n.range(-0.05, 0.05),
    a = n.range(0.4, 1);
  return (
    to(s, (l) => {
      let c = l.x / (i / 2),
        u = l.z / (t / 2),
        h = l.y / (e / 2),
        f = 1 - 0.22 * Math.pow(Math.abs(c), 2.5);
      ((l.z *= f * (h < 0 ? 1.05 : 1)),
        (l.y = (l.y + e / 2) * (1 - 0.3 * Math.pow(Math.abs(c), 3)) - e / 2),
        h > 0 && (l.y += 0.016 * Math.cos(tt * c) * Math.cos(tt * u)),
        (l.y -= a * 0.018 * Math.abs(c) * Math.abs(c) * (h > -0.9 ? 1 : 0) + r * l.x * 0.3));
      let p = gn(l.x * 9 + o, l.y * 9, l.z * 9 + o) - 0.5;
      ((l.x += p * 0.014), (l.z += p * 0.016), h > -0.9 && (l.y += p * 0.014));
    }),
    gr(s)
  );
}
function tR(i, e) {
  let t = new ClutterBuilder(i, 'sandbags', e.seed || 0),
    n = t.rng,
    s = 0.18,
    o = zi(e.courses | 0 || 5, 1, 7),
    r = t.mat(K3[0], K3[1]),
    a = (l, c, u, h) => {
      let f = s * n.range(1.02, 1.12),
        p = n() < 0.3 ? n.range(0.55, 0.75) : n.range(0.82, 1),
        d = n() * 30,
        v = {
          p: [u[0] + n.range(-0.012, 0.012), u[1] + f / 2 - 0.004, u[2] + n.range(-0.012, 0.012)],
          r: [n.range(-0.03, 0.03), h + n.range(-0.06, 0.06), 0],
        };
      t.add(r, eR(l, f, c, n), v, (g, x, y) => {
        let b = gn(g * 7 + d, x * 7, y * 7);
        return [p * (0.85 + 0.15 * b), p * (0.84 + 0.15 * b), p * (0.8 + 0.16 * b)];
      });
      for (let g of [1, -1])
        t.add(
          r,
          vr(
            [
              [g * (l / 2 - 0.004), n.range(-0.008, 0.008), -c * 0.27],
              [g * (l / 2 - 0.002), n.range(-0.008, 0.008), c * 0.27],
            ],
            [g * 0.009, 0.001, 0],
          ),
          v,
          p * 0.9,
        );
    };
  for (let l = 0; l < o; l++) {
    let c = l * s,
      u = l === o - 1;
    if (l % 2 === 0)
      for (let h = 0; h < 3; h++)
        for (let f of [1, -1]) (u && h === 2 && f === 1 && o > 2) || a(0.655, 0.3, [(h - 1) * 0.655, c, f * 0.148], 0);
    else for (let h = 0; h < 5; h++) (u && h === 0 && o > 2) || a(0.585, 0.385, [(h - 2) * 0.392, c, 0], tt);
  }
  return t.finish({ size: [2, o * s, 0.6], surface: 'dirt' });
}
var K3 = ['glove_fabric', { color: 9207134 }];
function Oc(
  i,
  e,
  t,
  n,
  s,
  { crush: o = 0, damp: r = 0.3, open: a = !1, tape: l = !0, label: c = '', arrow: u = !1, tint: h = 1 } = {},
) {
  let f = i.rng,
    p = i.G,
    d = f() * 40;
  i.push(s);
  let v = (_) => {
      if (!o) return;
      let M = zi(_.y / t, 0, 1),
        E = M * M;
      ((_.y -=
        o *
        t *
        0.32 *
        E *
        (0.55 + 0.45 * Math.cos(((At * _.x) / e) * 0.9 + 0.5)) *
        (0.8 + 0.2 * Math.cos((At * _.z) / n))),
        (_.z *= 1 + 0.1 * o * Math.sin(At * M)),
        (_.x += 0.12 * o * t * M + 0.02 * o * Math.sin(At * M) * Math.sign(_.x)));
    },
    g = eo(e, t, n, 0.007, 4, 5, 4, 'bottom');
  (a && ev(g, 2), o && (to(g, v), gr(g)));
  let x = r * t,
    y = (_, M, E) => {
      let w = gn(_ * 6 + d, M * 3, E * 6 + d),
        S = Q3(x - 0.03, x + 0.04, M + 0.08 * (w - 0.5)),
        z = (0.86 + 0.14 * gn(_ * 13, M * 13 + d, E * 13)) * h;
      return [z * (0.5 + 0.5 * S), z * (0.47 + 0.53 * S), z * (0.42 + 0.58 * S)];
    };
  {
    let _ = g.attributes.position,
      M = new Float32Array(_.count * 3);
    for (let E = 0; E < _.count; E++) {
      let w = y(_.getX(E), _.getY(E), _.getZ(E));
      ((M[E * 3] = w[0]), (M[E * 3 + 1] = w[1]), (M[E * 3 + 2] = w[2]));
    }
    g.setAttribute('color', new THREE.BufferAttribute(M, 3));
  }
  i.add('cardboard', g);
  let b = 0.0025;
  if (a) {
    let _ = Math.min(0.16, t * 0.6);
    i.add('cardboard', nv(e - 0.012, n - 0.012), { p: [0, t - _, 0], r: [-tt, 0, 0] }, 0.45 * h);
    for (let [E, w, S] of [
      [0, e, n / 2],
      [At, e, n / 2],
      [tt, n, e / 2],
      [-tt, n, e / 2],
    ])
      i.add(
        'cardboard',
        M1(nv(w - 0.012, _)),
        { p: [Math.sin(E) * (S - 0.006), t - _ / 2, Math.cos(E) * (S - 0.006)], r: [0, E, 0] },
        0.55 * h,
      );
    let M = (E, w, S) => {
      let z = Math.sin(S),
        H = Math.cos(S);
      return [E, w, z, H];
    };
    for (let E of [1, -1]) {
      let w = f.range(0.3, 1.9),
        S = n / 2 - 0.01;
      i.add(
        'cardboard',
        vr(
          [
            [0, t, (E * n) / 2],
            [0, t + Math.sin(w) * S * 0.5, E * (n / 2 + Math.cos(w) * S * 0.5)],
            [0, t + Math.sin(w) * S, E * (n / 2 + Math.cos(w) * S + 0.01)],
          ],
          [e / 2 - 0.004, 0, 0],
        ),
        null,
        0.9 * h,
      );
    }
    for (let E of [1, -1]) {
      let w = f.range(0.9, 2.3),
        S = n / 2 - 0.02;
      i.add(
        'cardboard',
        vr(
          [
            [(E * e) / 2, t, 0],
            [E * (e / 2 + Math.cos(w) * S), t + Math.sin(w) * S, 0],
          ],
          [0, 0, n / 2 - 0.004],
        ),
        null,
        0.82 * h,
      );
    }
  } else if (l) {
    let M = [];
    M.push([-e / 2 - b, t - 0.075, 0]);
    for (let w = 0; w <= 8; w++) M.push([(-0.5 + w / 8) * (e + 2 * b), t + b, 0]);
    M.push([e / 2 + b, t - 0.075, 0]);
    let E = new THREE.Vector3();
    for (let w of M) (E.set(w[0], w[1], w[2]), v(E), (w[0] = E.x), (w[1] = E.y + (o ? 0.004 : 0)), (w[2] = E.z));
    i.add('polymer_tan', vr(M, [0, 0, 0.025], !1), null, 0.9);
  }
  let m = n / 2 + b,
    A = Math.min(0.055, t * 0.2);
  if (
    (c &&
      !o &&
      (i.label(c, { color: 'black', font: 'sans', distress: 0.3 }, e * 0.6, A, { p: [-e * 0.1, t * 0.62, m] }),
      i.add('paint_white', nv(0.11, 0.075), { p: [e * 0.26, t * 0.3, m - 0.001] }, 0.9, { cast: !1 }),
      i.decal(p.mats.decal('numbers_0_9'), 0.095, { p: [e * 0.26, t * 0.3, m + 6e-4] })),
    u && !o)
  )
    for (let _ of [1, -1])
      i.decal(p.mats.decal('arrow'), Math.min(0.09, t * 0.3), {
        p: [_ * (e / 2 + b), t * 0.55, _ * n * 0.2],
        r: [0, _ * tt, tt],
      });
  i.pop();
}
function nR(i, e) {
  let t = new ClutterBuilder(i, 'cardboard_boxes', e.seed || 0),
    n = t.rng,
    s = () => n.range(-0.015, 0.015),
    o = () => n.range(0.82, 1);
  return (
    Oc(
      t,
      0.5,
      0.38,
      0.44,
      { p: [-0.23 + s(), 0, -0.16 + s()], r: [0, n.range(-0.05, 0.05), 0] },
      { damp: 0.45, label: 'FRAGILE', arrow: !0, tint: o() },
    ),
    Oc(
      t,
      0.42,
      0.33,
      0.4,
      { p: [0.26 + s(), 0, -0.17 + s()], r: [0, n.range(-0.08, 0.08), 0] },
      { damp: 0.5, label: 'KEEP DRY', tint: o() },
    ),
    Oc(
      t,
      0.46,
      0.28,
      0.4,
      { p: [-0.24 + s(), 0.38, -0.15 + s()], r: [0, n.range(-0.2, 0.2), 0] },
      { crush: 1, damp: 0.75, tint: o() * 0.92 },
    ),
    Oc(
      t,
      0.33,
      0.26,
      0.32,
      { p: [0.27 + s(), 0.33, -0.18 + s()], r: [0, n.range(-0.3, 0.3), 0] },
      { open: !0, damp: 0.1, label: '', arrow: !0, tint: o() },
    ),
    Oc(
      t,
      0.3,
      0.16,
      0.24,
      { p: [-0.26 + s(), 0.565, -0.16 + s()], r: [0.03, n.range(-0.5, 0.5), -0.09] },
      { damp: 0.2, label: 'HX-2291', tint: o() },
    ),
    Oc(
      t,
      0.36,
      0.26,
      0.3,
      { p: [0.06 + s(), 0.105, 0.2], r: [0.62, n.range(-0.25, 0.25), 0] },
      { damp: 0.9, crush: 0.25, tint: o() * 0.85 },
    ),
    t.finish()
  );
}
function eb(i) {
  (i('tarp_cargo', (e, t = {}) => QA(e, t)),
    i('sandbags', (e, t = {}) => tR(e, t)),
    i('cardboard_boxes', (e, t = {}) => nR(e, t)));
}
var tb = new THREE.Quaternion();
var iR = new THREE.Vector3(0, 1, 0);
var T1 = new THREE.Vector3();
var nb = new THREE.Matrix4();
function zr(i, e, t, n, s = 0.006, o = !1) {
  T1.set(e[0] - i[0], e[1] - i[1], e[2] - i[2]);
  let r = T1.length();
  T1.normalize();
  let a = o ? $e(t, r, n) : Ge(t, r, n, s);
  return (
    tb.setFromUnitVectors(iR, T1),
    nb.compose(
      new THREE.Vector3((i[0] + e[0]) / 2, (i[1] + e[1]) / 2, (i[2] + e[2]) / 2),
      tb,
      new THREE.Vector3(1, 1, 1),
    ),
    a.applyMatrix4(nb),
    a
  );
}
var sR = (i) => {
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    let n = i[t],
      s = i[(t + 1) % i.length];
    e += n[0] * s[1] - s[0] * n[1];
  }
  return e < 0 ? i.slice().reverse() : i;
};
function ib(i, e, t, n, s, o, r, a, l, c) {
  let u = tv(t, n, r, a);
  (i.push({ p: [e, t, o > 0 ? s - n / 2 : -(s - n / 2)], r: [o > 0 ? tt : -tt, 0, 0] }),
    i.push({ r: [0, c() * 6, 0] }));
  let h = c() * 20;
  i.add('tire', u, null, (p, d, v) => {
    let g = Math.hypot(p, v);
    return g < r + 0.01 ? 0.45 : 0.78 + 0.22 * gn(Math.atan2(v, p) * 3 + h, g * 30);
  });
  let f = n * 0.8;
  (i.add(
    'paint_yellow',
    us(
      [
        [r + 0.006, f + 0.012],
        [r - 0.012, f + 0.016],
        [r - 0.03, f - 0.02],
        [r * 0.62, f - 0.05],
        [r * 0.5, f - 0.02],
        [r * 0.42, f - 0.012],
        [0, f - 0.012],
      ],
      14,
    ),
    null,
    (p, d, v) => (Math.hypot(p, v) > r * 0.7 ? [0.55, 0.5, 0.42] : [0.8, 0.78, 0.7]),
  ),
    i.add(
      'steel_dark',
      us(
        [
          [0, n * 0.2],
          [r + 0.004, n * 0.2],
        ],
        10,
      ),
      null,
      0.4,
    ),
    i.add('steel_dark', ot(r * 0.2, r * 0.24, 0.035, 8), { p: [0, f, 0] }, 0.7));
  for (let p = 0; p < 6; p++) {
    let d = (p * At) / 3;
    i.add(
      'steel_galv',
      ot(0.011, 0.012, 0.016, 6),
      { p: [Math.cos(d) * r * 0.33, f - 0.006, Math.sin(d) * r * 0.33] },
      c.range(0.5, 0.8),
    );
  }
  (i.pop(), i.pop());
}
function oR(i, e) {
  let t = new ClutterBuilder(i, 'forklift', e.seed || 0),
    n = t.rng,
    s = zi(+e.forksUp || 0, 0, 1),
    o = s * 1.5,
    r = o / 2,
    [a, l] = Ja(e.color, 'yellow'),
    c = (K = 1) => (typeof l == 'number' ? l * K : l.map((ie) => ie * K)),
    u = 'steel_dark',
    h = () => n.range(0.68, 0.95),
    f = e.number || ['04', '07', '12', '22'][t.seed % 4],
    p = 0.33,
    d = 0.23,
    v = 0.22,
    g = 0.47,
    x = 0.27,
    y = 0.18,
    b = -1.1,
    m = 0.46;
  for (let K of [1, -1]) (ib(t, v, p, d, g, K, 0.195, 24, 0, n), ib(t, b, x, y, m, K, 0.155, 20, 0, n));
  (t.add(u, vn([v, p, -0.4], [v, p, 0.4], 0.07, 8), null, 0.5),
    t.add(u, Ge(0.12, 0.1, 0.78, 0.01), { p: [b, x, 0] }, 0.5),
    t.add(u, Ge(1.95, 0.34, 0.68, 0.02), { p: [-0.425, 0.37, 0] }, 0.55));
  for (let K of [1, -1]) {
    (t.add(a, Ge(0.6, 0.3, 0.17, 0.02), { p: [-0.47, 0.4, K * 0.42] }, c(0.92)),
      t.add('diamond_plate', Ge(0.3, 0.012, 0.16, 0.003), { p: [-0.32, 0.556, K * 0.42] }, 0.7),
      t.add(u, ot(0.03, 0.03, 0.02, 8), { p: [-0.62, 0.56, K * 0.42] }, 0.6));
    let ie = [],
      F = p + 0.035,
      X = p + 0.06;
    for (let ne = 0; ne <= 7; ne++) {
      let re = 0.12 + ((At - 0.5) * ne) / 7;
      ie.push([v + Math.cos(re) * X, p + Math.sin(re) * X]);
    }
    for (let ne = 7; ne >= 0; ne--) {
      let re = 0.12 + ((At - 0.5) * ne) / 7;
      ie.push([v + Math.cos(re) * F, p + Math.sin(re) * F]);
    }
    t.add(a, Mo(ie, 0.27, { soft: 0.7 }), { p: [0, 0, K * 0.475] }, c(0.95));
  }
  t.add('diamond_plate', $e(0.66, 0.016, 0.68), { p: [0.2, 0.548, 0] }, 0.6);
  for (let K of [-0.12, 0.1]) t.add('rubber', Ge(0.1, 0.02, 0.07, 0.006), { p: [0.33, 0.6, K], r: [0, 0, 0.5] }, 0.8);
  let A = eo(0.62, 0.63, 1.12, 0.12, 3, 3, 3);
  (to(A, (K) => {
    if (K.y > 0.1) {
      let ie = (K.y - 0.1) / 0.215;
      K.x += 0.03 * ie * (K.x < 0 ? 1 : 0);
    }
  }),
    t.add(a, gr(A), { p: [-1.39, 0.915, 0] }, c(0.97)),
    t.add(a, Ge(0.56, 0.37, 0.64, 0.05), { p: [-1.4, 0.43, 0] }, c(0.85)),
    t.add('hazard_stripes', Ge(0.014, 0.085, 0.84, 0.004), { p: [-1.702, 0.77, 0] }, 0.95),
    t.label(f, { color: 'black', font: 'stencil', distress: 0.35 }, 0.4, 0.2, {
      p: [-1.703, 0.96, 0],
      r: [0, -tt, 0],
    }));
  for (let K of [1, -1])
    (t.add(i.mats.emissive(16722450, 0.16), Ge(0.012, 0.05, 0.11, 0.004), { p: [-1.69, 1.1, K * 0.37] }, 1, {
      raw: !0,
    }),
      t.add(u, Ge(0.016, 0.066, 0.126, 0.004), { p: [-1.684, 1.1, K * 0.37] }, 0.4),
      t.label('IRONTIDE', { color: 'black', font: 'sans', distress: 0.3 }, 0.42, 0.085, {
        p: [-1.39, 0.99, K * 0.5625],
        r: [0, K > 0 ? 0 : At, 0],
      }),
      t.add(u, Ge(0.06, 0.05, 0.02, 0.004), { p: [-1.67, 0.44, K * 0.05] }, 0.5));
  (t.add('steel_worn', ot(0.02, 0.02, 0.13, 8), { p: [-1.68, 0.44, 0] }, 0.7),
    t.add(a, Ge(0.98, 0.46, 0.94, 0.04), { p: [-0.59, 0.79, 0] }, c()));
  for (let K of [1, -1]) {
    (t.label(f, { color: 'black', font: 'stencil', distress: 0.35 }, 0.3, 0.19, {
      p: [-0.84, 0.8, K * 0.4715],
      r: [0, K > 0 ? 0 : At, 0],
    }),
      t.add(u, $e(0.34, 0.2, 0.004), { p: [-0.36, 0.8, K * 0.47] }, 0.2));
    for (let ie = 0; ie < 5; ie++)
      t.add(a, $e(0.34, 0.03, 0.006), { p: [-0.36, 0.72 + ie * 0.04, K * 0.474], r: [K * 0.5, 0, 0] }, c(0.85));
  }
  t.add(u, Ge(0.4, 0.05, 0.4, 0.01), { p: [-0.54, 1.045, 0] }, 0.5);
  let _ = eo(0.46, 0.1, 0.46, 0.04, 3, 3, 3);
  (to(_, (K) => {
    K.y > 0 && (K.y -= 0.018 * Math.cos(K.x * 5) * Math.cos(K.z * 5));
  }),
    t.add('rubber', gr(_), { p: [-0.53, 1.115, 0] }, 1));
  let M = eo(0.1, 0.5, 0.44, 0.04, 3, 4, 3);
  (to(M, (K) => {
    K.x > 0 && (K.x -= 0.02 * Math.cos(K.z * 5.5));
  }),
    t.add('rubber', gr(M), { p: [-0.8, 1.39, 0], r: [0, 0, 0.16] }, 1));
  for (let K of [1, -1]) t.add(u, zr([-0.78, 1.08, K * 0.24], [-0.82, 1.3, K * 0.24], 0.03, 0.012, 0.004), null, 0.5);
  t.add(
    a,
    Mo(
      [
        [0.2, 0.55],
        [0.54, 0.55],
        [0.54, 1],
        [0.46, 1.12],
        [0.3, 1.14],
        [0.21, 1.02],
      ],
      0.7,
      { soft: 0.5 },
    ),
    null,
    c(),
  );
  let E = Math.atan2(0.12, 0.09);
  (t.push({ p: [0.253, 1.082, 0], r: [0, 0, E] }),
    t.add(u, Ge(0.012, 0.13, 0.44, 0.004), { p: [-0.006, 0, 0] }, 0.45),
    t.add(i.mats.emissive(9429168, 0.3), _f(0.09, 0.05), { p: [-0.0135, 0.01, 0.1], r: [0, -tt, 0] }, 1, {
      raw: !0,
      cast: !1,
    }),
    t.decal(i.mats.decal('csc_plate'), 0.09, { p: [-0.0135, 0, -0.12], r: [0, -tt, 0] }),
    t.add('plastic_red', ot(0.016, 0.016, 0.02, 8), { p: [-0.02, 0, 0.19], r: [0, 0, tt] }, 0.9),
    t.add('steel_bare', ot(0.009, 0.009, 0.02, 6), { p: [-0.018, -0.03, -0.01], r: [0, 0, tt] }, 0.9),
    t.pop());
  let w = [0.3, 1.1, 0.04],
    S = [0.1, 1.31, 0.04];
  (t.add(u, vn(w, S, 0.024, 8), null, 0.5),
    t.push({ p: S, r: [0, 0, Math.atan2(S[1] - w[1], S[0] - w[0])] }),
    t.add('rubber', ja(0.165, 0.014, 6, 18), { r: [0, tt, 0] }, 1));
  for (let K = 0; K < 3; K++) {
    let ie = (K * At * 2) / 3 + 0.5;
    t.add(u, vn([-0.01, 0, 0], [0, Math.cos(ie) * 0.16, Math.sin(ie) * 0.16], 0.009, 5), null, 0.5);
  }
  (t.add(u, ot(0.035, 0.04, 0.03, 10), { p: [-0.005, 0, 0], r: [0, 0, tt] }, 0.5),
    t.add('rubber', ot(0.016, 0.014, 0.045, 8), { p: [0.03, 0.16, 0.02], r: [0, 0, tt] }, 1),
    t.pop());
  for (let K = 0; K < 3; K++) {
    let ie = -0.2 - K * 0.055,
      F = [0.33, 1.12, ie],
      X = [0.25 - K * 0.012, 1.3 - K * 0.01, ie - 0.01];
    (t.add('steel_bare', vn(F, X, 0.007, 5), null, 0.8), t.add('rubber', Y3(0.02, 7, 5), { p: X }, 1));
  }
  {
    let K = [0.3, 1.1, 0.27],
      ie = [0.2, 1.24, 0.29];
    (t.add('steel_bare', vn(K, ie, 0.008, 5), null, 0.8),
      t.add('plastic_red', ot(0.016, 0.016, 0.07, 7), { p: ie, r: [0, 0, 0.6] }, 0.9));
  }
  let z = 2.045,
    H = [];
  for (let K of [1, -1]) {
    let ie = [0.47, 1.08, K * 0.4],
      F = [0.27, z, K * 0.46],
      X = [-1, 1, K * 0.44],
      ne = [-0.95, z, K * 0.46];
    (t.add(u, zr(ie, F, 0.06, 0.05, 0.01), null, h()),
      t.add(u, zr(X, ne, 0.06, 0.05, 0.01), null, h()),
      t.add(u, zr([0.3, z, K * 0.46], [-0.98, z, K * 0.46], 0.05, 0.06, 0.01), null, h()),
      t.add(u, Ge(0.09, 0.012, 0.08, 0.003), { p: [0.47, 1.085, K * 0.4] }, 0.5),
      t.add(u, Ge(0.09, 0.012, 0.08, 0.003), { p: [-1, 1.024, K * 0.44] }, 0.5));
    let re = 0.36,
      $ = 1.66;
    (t.add(u, eo(0.085, 0.1, 0.13, 0.02, 3, 3, 3), { p: [re + 0.045, $, K * 0.47] }, 0.45),
      t.add(i.mats.emissive(16773330, 0.7), Ge(0.006, 0.075, 0.105, 0.002), { p: [re + 0.089, $, K * 0.47] }, 1, {
        raw: !0,
      }),
      t.add(u, vn([0.385, 1.5, K * 0.42], [0.42, 1.52, K * 0.57], 0.008, 5), null, 0.5),
      t.add(u, Ge(0.022, 0.17, 0.1, 0.006), { p: [0.42, 1.52, K * 0.573], r: [0, K * 0.25, 0] }, 0.5),
      t.add('steel_bare', $e(0.002, 0.15, 0.084), { p: [0.408, 1.52, K * 0.57], r: [0, K * 0.25, 0] }, 1),
      H.push(
        { min: [-1.03, 1, K > 0 ? 0.41 : -0.5], max: [-0.92, z, K > 0 ? 0.5 : -0.41], surface: 'metal' },
        { min: [0.24, 1.08, K > 0 ? 0.37 : -0.5], max: [0.5, z, K > 0 ? 0.5 : -0.37], surface: 'metal' },
      ));
  }
  for (let K of [0.28, -0.96]) t.add(u, Ge(0.05, 0.06, 0.92, 0.01), { p: [K, z, 0] }, h());
  for (let K = 0; K < 8; K++) t.add(u, Ge(0.03, 0.028, 0.9, 0.006), { p: [-0.83 + K * 0.139, z + 0.012, 0] }, h());
  (t.add(
    u,
    Fn(
      [
        [0.44, 1.2, 0.44],
        [0.47, 1.25, 0.49],
        [0.41, 1.55, 0.5],
        [0.36, 1.6, 0.455],
      ],
      0.011,
      5,
      !1,
      0.5,
    ),
    null,
    0.5,
  ),
    t.add(u, ot(0.045, 0.05, 0.03, 10), { p: [-0.86, z + 0.045, 0.3] }, 0.5),
    t.add(
      i.mats.emissive(16747026, 0.9),
      us(
        [
          [0.04, 0],
          [0.04, 0.06],
          [0.03, 0.082],
          [0, 0.09],
        ],
        10,
      ),
      { p: [-0.86, z + 0.06, 0.3] },
      1,
      { raw: !0 },
    ));
  let O = -1.4,
    q = 1.23 + 0.05 + 0.155;
  for (let K of [-0.2, 0.2])
    (t.add(u, Ge(0.3, 0.07, 0.04, 0.008), { p: [O, 1.262, K] }, 0.5),
      t.add(u, ot(0.159, 0.159, 0.035, 16, !0), { p: [O, q, K], r: [tt, 0, 0] }, 0.35));
  (t.add(
    'steel_galv',
    us(
      [
        [0, -0.37],
        [0.08, -0.36],
        [0.132, -0.33],
        [0.155, -0.27],
        [0.155, 0.27],
        [0.132, 0.33],
        [0.08, 0.36],
        [0, 0.37],
      ],
      16,
    ),
    { p: [O, q, 0], r: [tt, 0, 0] },
    (K, ie, F) => 0.8 + 0.2 * gn(K * 8, ie * 8, F * 8),
  ),
    t.add('steel_galv', ot(0.09, 0.09, 0.07, 12, !0), { p: [O, q, 0.39], r: [tt, 0, 0] }, 0.7),
    t.add('steel_galv', ot(0.02, 0.02, 0.05, 8), { p: [O, q, 0.39], r: [tt, 0, 0] }, 0.9),
    t.add(
      'rubber',
      Fn(
        [
          [O, q, 0.41],
          [O + 0.05, q - 0.02, 0.46],
          [O + 0.2, q - 0.15, 0.44],
          [-1.07, 1.1, 0.38],
          [-1, 0.98, 0.36],
        ],
        0.012,
        5,
        !1,
        0.5,
      ),
      null,
      1,
    ),
    t.push({ p: [O, q, 0], r: [0, 0, 0.7] }),
    t.cdecal(i.mats.decal('hazard_flammable'), 0.157, 0.12, { p: [0, 0, -0.05], r: [-tt, 0, 0] }),
    t.cdecal(i.mats.label('LPG', { color: 'red', font: 'stencil', distress: 0.3 }), 0.157, 0.16, {
      p: [0, 0, 0.14],
      r: [-tt, 0, 0],
    }),
    t.pop());
  let U = 0.6,
    T = 0.73,
    D = 0.375,
    C = 0.08,
    G = 2.02;
  for (let K of [1, -1]) {
    let ie = K * D,
      F = [
        [U, ie],
        [T, ie],
        [T, ie - K * 0.065],
        [T - 0.014, ie - K * 0.065],
        [T - 0.014, ie - K * 0.014],
        [U + 0.014, ie - K * 0.014],
        [U + 0.014, ie - K * 0.065],
        [U, ie - K * 0.065],
      ];
    (t.add(u, Mo(sR(F.map((P) => [P[0], -P[1]])), G - C, { soft: 0 }), { p: [0, (C + G) / 2, 0], r: [-tt, 0, 0] }, h()),
      t.add(u, Ge(0.085, 1.86, 0.036, 0.006), { p: [0.665, 0.13 + r + 0.93, K * 0.335] }, h() * 1.25),
      t.decal(i.mats.decal('hazard_general'), 0.1, { p: [0.665, 1.3, K * (D + 0.002)], r: [0, K > 0 ? 0 : At, 0] }));
    let X = [0.36, 0.66, K * 0.3],
      ne = [0.6, 0.86, K * 0.33],
      re = [0.5, 0.777, K * 0.317];
    (t.add(u, vn(X, re, 0.034, 8, !0), null, 0.55), t.add('steel_bare', vn(re, ne, 0.018, 6), null, 1));
    let $ = K * 0.13,
      ue = 1.9 + r,
      me = 0.055,
      ee = [
        [0.725, 0.5 + o, $],
        [0.725, ue, $],
      ];
    for (let P = 0.5; P < At; P += 0.55) ee.push([0.67 + Math.cos(P) * me, ue + Math.sin(P) * me, $]);
    ee.push([0.615, ue, $], [0.615, 1, $]);
    let B = 0;
    for (let P = 0; P < ee.length - 1; P++) {
      let V = ee[P],
        Y = ee[P + 1],
        L = Math.hypot(Y[0] - V[0], Y[1] - V[1]),
        Z = Math.max(1, Math.round(L / 0.058));
      for (let J = 0; J < Z; J++, B++) {
        let oe = J / Z,
          fe = (J + 0.86) / Z,
          le = (R) => [V[0] + (Y[0] - V[0]) * R, V[1] + (Y[1] - V[1]) * R, $];
        t.add('steel_worn', zr(le(oe), le(fe), 0.011, B % 2 ? 0.034 : 0.022, 0, !0), null, B % 2 ? 0.55 : 0.75);
      }
    }
    t.add(u, ot(me - 0.006, me - 0.006, 0.04, 12), { p: [0.67, ue, $], r: [tt, 0, 0] }, 0.7);
  }
  (t.add(u, Ge(0.04, 0.09, 0.78, 0.008), { p: [U - 0.012, 1.96, 0] }, h()),
    t.add(u, Ge(0.04, 0.12, 0.78, 0.008), { p: [U - 0.012, 0.42, 0] }, h()),
    t.add(u, Ge(0.07, 0.09, 0.66, 0.008), { p: [0.665, 1.99 + r, 0] }, h()),
    t.add(u, ot(0.048, 0.048, 1.15, 10), { p: [0.645, 0.72, 0] }, 0.6),
    t.add(u, ot(0.055, 0.055, 0.05, 10), { p: [0.645, 1.3, 0] }, 0.5),
    t.add('steel_bare', ot(0.027, 0.027, 0.64 + r, 8, !0), { p: [0.645, 1.31 + (0.64 + r) / 2, 0] }, 1),
    t.label('MAX 2500 kg', { color: 'yellow', font: 'stencil', distress: 0.3 }, 0.5, 0.05, {
      p: [U - 0.033, 0.42, 0],
      r: [0, -tt, 0],
    }));
  for (let K of [0.21, 0.245])
    t.add(
      'rubber',
      Fn(
        [
          [0.6, 1.25, K],
          [0.59, 1.65 + r * 0.6, K],
          [0.655, 1.86 + r, K + 0.005],
          [0.735, 1.6 + r * 1.2, K],
          [0.74, 0.56 + o, K],
        ],
        0.011,
        5,
        !1,
        0.5,
      ),
      null,
      1,
    );
  t.push({ p: [0, o, 0] });
  let j = 0.06;
  for (let K of [j + 0.12, j + 0.5]) t.add(u, Ge(0.04, 0.1, 1.02, 0.008), { p: [0.755, K, 0] }, h());
  t.add('hazard_stripes', $e(0.003, 0.06, 0.4), { p: [0.7765, j + 0.5, 0] }, 0.9);
  for (let K of [1, -1])
    (t.add(u, Ge(0.03, 0.5, 0.06, 0.006), { p: [0.745, j + 0.31, K * 0.3] }, h()),
      t.add(u, Ge(0.11, 0.36, 0.022, 0.005), { p: [0.685, j + 0.31, K * 0.305] }, h()),
      t.add(u, Ge(0.03, 0.78, 0.04, 0.006), { p: [0.755, j + 0.94, K * 0.5] }, h()),
      t.add('steel_worn', ot(0.04, 0.04, 0.03, 10), { p: [0.67, j + 0.2, K * 0.325], r: [tt, 0, 0] }, 0.7));
  (t.add(u, Ge(0.03, 0.04, 1.04, 0.006), { p: [0.755, j + 1.33, 0] }, h()),
    t.add(u, Ge(0.02, 0.03, 1, 0.004), { p: [0.755, j + 0.94, 0] }, h()));
  for (let K = -2; K <= 2; K++) t.add(u, Ge(0.02, 0.76, 0.02, 0.004), { p: [0.755, j + 0.94, K * 0.165] }, h());
  let N = 0.035;
  for (let K of [1, -1]) {
    let ie = Mo(
      [
        [0.777, N],
        [1.45, N],
        [1.7, N + 0.006],
        [1.7, N + 0.016],
        [0.87, N + 0.046],
        [0.826, N + 0.075],
        [0.822, N + 0.62],
        [0.777, N + 0.62],
      ],
      0.1,
      { soft: 0.45 },
    );
    (t.add('steel_worn', ie, { p: [0, 0, K * 0.26] }, (F, X, ne) => {
      let re = zi((F - 0.8) / 0.9, 0, 1),
        $ = gn(F * 14, ne * 30 + K);
      return (0.5 + 0.5 * re) * (0.8 + 0.2 * $);
    }),
      t.add(u, Ge(0.075, 0.05, 0.112, 0.006), { p: [0.772, j + 0.575, K * 0.26] }, 0.55),
      t.add(u, Ge(0.03, 0.04, 0.112, 0.006), { p: [0.79, j + 0.07, K * 0.26] }, 0.55));
  }
  t.pop();
  let Q = Math.max(2.2, 0.06 + o + 1.36, 2.04 + r);
  return t.finish({
    size: [3.4, Q, 1.25],
    colliders: [
      { min: [-1.7, 0, -0.6], max: [0.58, 1.24, 0.6], surface: 'metal' },
      { min: [-1.56, 1.24, -0.4], max: [-1.22, 1.6, 0.4], surface: 'metal' },
      { min: [-0.88, 1.24, -0.24], max: [-0.7, 1.66, 0.24], surface: 'rubber' },
      { min: [0.56, 0, -0.42], max: [0.78, 2.04 + r, 0.42], surface: 'metal' },
      { min: [0.72, o, -0.53], max: [0.8, o + 1.42, 0.53], surface: 'metal' },
      { min: [0.8, o, -0.33], max: [1.7, o + 0.1, 0.33], surface: 'metal' },
      { min: [-1.02, 2, -0.5], max: [0.32, 2.1, 0.5], surface: 'metal' },
      ...H,
    ],
  });
}
function rR(i, e) {
  let t = new ClutterBuilder(i, 'generator', e.seed || 0),
    n = t.rng,
    [s, o] = Ja(e.color, 'yellow'),
    r = (m = 1) => (typeof o == 'number' ? o * m : o.map((A) => A * m)),
    a = 'steel_dark',
    l = 0.46,
    c = 1.03,
    u = 0.3,
    h = 1.16,
    f = (u + h) / 2;
  for (let m of [1, -1]) {
    t.add(a, Ge(2.2, 0.14, 0.1, 0.012), { p: [0, 0.07, m * 0.4] }, 0.6);
    for (let A of [-0.45, 0.45]) t.add(a, $e(0.22, 0.075, 0.004), { p: [A, 0.075, m * 0.451] }, 0.12);
  }
  for (let m of [-0.85, 0, 0.85]) t.add(a, $e(0.1, 0.1, 0.72), { p: [m, 0.07, 0] }, 0.55);
  (t.add(a, Ge(2.1, 0.17, 0.94, 0.012), { p: [0, 0.215, 0] }, 0.8),
    t.add(s, Ge(2.06, h - u, l * 2, 0.025), { p: [0, f, 0] }, r()),
    t.add(s, Ge(2.13, 0.045, 0.99, 0.014), { p: [0, h + 0.02, 0] }, r(0.9)));
  for (let m of [-0.52, 0.52]) t.add(s, $e(0.04, 0.012, 0.95), { p: [m, h + 0.046, 0] }, r(0.85));
  for (let m of [1, -1]) {
    let A = m > 0 ? 0 : At;
    ([-0.66, 0, 0.66].forEach((_, M) => {
      (t.add(s, Ge(0.62, 0.72, 0.012, 0.006), { p: [_, f + 0.01, m * (l + 0.004)] }, r(n.range(0.9, 1))),
        t.add(a, $e(0.03, 0.11, 0.016), { p: [_ + 0.27, f, m * (l + 0.012)] }, 0.6),
        t.add('steel_galv', $e(0.012, 0.03, 0.006), { p: [_ + 0.27, f + 0.03, m * (l + 0.022)] }, 0.8));
      for (let E of [-0.25, 0.25])
        t.add('steel_galv', ot(0.009, 0.009, 0.06, 5, !0), { p: [_ - 0.305, f + E, m * (l + 0.012)] }, 0.7);
      if (M > 0) {
        let E = M === 2 ? 8 : 5,
          w = 0.42,
          S = M === 2 ? f + 0.14 : f - 0.16;
        t.add(a, $e(w, E * 0.05, 0.004), { p: [_ - 0.03, S, m * (l + 0.0105)] }, 0.12);
        for (let z = 0; z < E; z++)
          t.add(
            s,
            $e(w, 0.04, 0.005),
            { p: [_ - 0.03, S + (z - (E - 1) / 2) * 0.05, m * (l + 0.018)], r: [m * 0.6, 0, 0] },
            r(0.82),
          );
        M === 2 && t.decal(i.mats.decal('rust_run'), 0.3, { p: [_ - 0.03, S - 0.36, m * (l + 0.011)], r: [0, A, 0] });
      }
    }),
      t.label(e.label || 'GEN-0' + (1 + (t.seed % 2)), { color: 'black', font: 'stencil', distress: 0.35 }, 0.5, 0.13, {
        p: [-0.66 * m, f + 0.17, m * (l + 0.0108)],
        r: [0, A, 0],
      }),
      t.decal(i.mats.decal('hazard_voltage'), 0.15, {
        p: [-0.66 * m - m * 0.18, f - 0.17, m * (l + 0.0108)],
        r: [0, A, 0],
      }));
  }
  t.add(a, $e(0.004, 0.66, 0.74), { p: [c + 0.001, f, 0] }, 0.1);
  for (let m = 0; m < 11; m++)
    t.add(s, $e(0.006, 0.046, 0.74), { p: [c + 0.012, f - 0.3 + m * 0.06, 0], r: [0, 0, -0.6] }, r(0.8));
  for (let m of [1, -1])
    (t.add(s, $e(0.03, 0.72, 0.03), { p: [c + 0.012, f, m * 0.385] }, r(0.9)),
      t.add(s, $e(0.03, 0.03, 0.8), { p: [c + 0.012, f + m * 0.345, 0] }, r(0.9)));
  let p = -c - 0.004,
    d = 0.14;
  (t.add(a, Ge(0.01, 0.44, 0.52, 0.004), { p: [p, 0.87, d] }, 0.45),
    t.add(s, Ge(0.075, 0.014, 0.56, 0.004), { p: [p - 0.03, 1.1, d], r: [0, 0, 0.12] }, r(0.9)));
  for (let m of [1, -1]) t.add(s, $e(0.06, 0.44, 0.012), { p: [p - 0.025, 0.87, d + m * 0.268] }, r(0.9));
  let v = p - 0.0055,
    g = [0, -tt, 0];
  (t.add(i.mats.emissive(8840104, 0.32), _f(0.13, 0.07), { p: [v - 0.001, 0.99, d - 0.12], r: g }, 1, {
    raw: !0,
    cast: !1,
  }),
    t.add(a, Ge(0.008, 0.09, 0.15, 0.003), { p: [v + 0.003, 0.99, d - 0.12] }, 0.3),
    t.add('steel_galv', ot(0.02, 0.02, 0.012, 10), { p: [v - 0.004, 1, d + 0.19], r: [0, 0, tt] }, 0.7),
    t.add(
      i.mats.emissive(4063082, 3.2),
      ot(0.013, 0.013, 0.014, 10),
      { p: [v - 0.009, 1, d + 0.19], r: [0, 0, tt] },
      1,
      { raw: !0 },
    ),
    t.add(s, ot(0.042, 0.042, 0.006, 12), { p: [v - 0.003, 0.8, d + 0.17], r: [0, 0, tt] }, 1),
    t.add(
      'plastic_red',
      us(
        [
          [0, 0],
          [0.018, 0],
          [0.018, 0.018],
          [0.03, 0.02],
          [0.03, 0.034],
          [0.02, 0.042],
          [0, 0.044],
        ],
        10,
      ),
      { p: [v - 0.004, 0.8, d + 0.17], r: [0, 0, tt] },
      0.95,
    ));
  for (let m = 0; m < 3; m++) {
    let A = d - 0.2 + m * 0.105;
    (t.add('aluminium', ot(0.04, 0.042, 0.012, 10), { p: [v - 0.004, 0.86, A], r: [0, 0, tt] }, 0.8),
      t.add('aluminium', ot(0.034, 0.034, 0.002, 10), { p: [v - 0.0105, 0.86, A], r: [0, 0, tt] }, 1),
      t.add(a, $e(0.002, 0.028, 0.004), { p: [v - 0.0125, 0.868, A + 0.005], r: [n.range(-1, 1), 0, 0] }, 0.3));
  }
  for (let m = 0; m < 5; m++)
    t.add(
      m === 0 ? 'plastic_red' : a,
      $e(0.014, 0.04, 0.022),
      { p: [v - 0.006, 0.74, d - 0.2 + m * 0.03], r: [0, 0, n() < 0.5 ? 0.25 : -0.25] },
      0.8,
    );
  (t.decal(i.mats.decal('hazard_voltage'), 0.13, { p: [-c - 0.002, 0.95, -0.28], r: g }),
    t.label('DANGER', { color: 'red', font: 'stencil', distress: 0.3 }, 0.22, 0.05, {
      p: [-c - 0.002, 0.82, -0.28],
      r: g,
    }));
  let x = [
    ['plastic_red', 0.02],
    ['plastic_blue', 0.2],
    ['plastic_blue', -0.25],
  ];
  for (let [m, A] of x)
    (t.add(a, Ge(0.02, 0.12, 0.1, 0.006), { p: [-c - 0.008, 0.5, A] }, 0.4),
      t.add(m, vn([-c - 0.01, 0.5, A], [-c - 0.06, 0.47, A], 0.036, 10, !0), null, 0.9));
  (t.add('plastic_blue', vn([-c - 0.06, 0.47, 0.2], [-c - 0.068, 0.39, 0.2], 0.03, 8, !0, 0.02), null, 0.85),
    t.add(
      'rubber',
      Fn(
        [
          [-c - 0.066, 0.4, 0.2],
          [-c - 0.064, 0.25, 0.21],
          [-c - 0.05, 0.06, 0.26],
          [-c + 0.05, 0.016, 0.4],
          [-c + 0.3, 0.016, 0.478],
          [-0.35, 0.016, 0.486],
        ],
        0.014,
        5,
        !1,
        0.5,
      ),
      null,
      1,
    ));
  let y = h + 0.0425;
  (t.add(a, Ge(0.2, 0.012, 0.14, 0.004), { p: [0, y + 0.004, 0] }, 0.6),
    t.add('steel_galv', ja(0.045, 0.014, 5, 10), { p: [0, y + 0.058, 0] }, 0.7));
  let b = [0.72, y, 0.24];
  return (
    t.add('steel_rust', ot(0.062, 0.066, 0.025, 12), { p: [b[0], y + 0.012, b[2]] }, 0.6),
    t.add(
      'steel_rust',
      ot(0.04, 0.04, 0.17, 12, !0),
      { p: [b[0], y + 0.085, b[2]] },
      (m, A) => 0.45 + 0.55 * zi((y + 0.17 - A) / 0.17, 0, 1),
    ),
    t.add('steel_rust', ot(0.034, 0.034, 0.002, 10), { p: [b[0], y + 0.15, b[2]] }, 0.08),
    t.add('steel_rust', ot(0.046, 0.046, 0.005, 12), { p: [b[0] - 0.012, y + 0.186, b[2]], r: [0, 0, 0.5] }, 0.6),
    t.decal(i.mats.decal('scorch'), 0.3, { p: [b[0], y + 0.001, b[2]], r: [-tt, 0, 0] }),
    t.add(a, vn([-0.72, 0.25, 0.46], [-0.72, 0.32, 0.5], 0.03, 8, !0), null, 0.6),
    t.add('plastic_red', vn([-0.72, 0.32, 0.5], [-0.72, 0.338, 0.51], 0.037, 10, !0), null, 0.9),
    t.decal(i.mats.decal('hazard_flammable'), 0.11, { p: [-0.52, 0.215, 0.4712] }),
    t.label('DIESEL', { color: 'white', font: 'stencil', distress: 0.4 }, 0.2, 0.05, { p: [-0.34, 0.215, 0.4712] }),
    t.finish({ colliders: [{ min: [-1.1, 0, -0.5], max: [1.1, 1.21, 0.5], surface: 'metal' }] })
  );
}
function aR(i, e) {
  let t = new ClutterBuilder(i, 'dumpster', e.seed || 0),
    n = t.rng,
    [s, o] = Ja(e.color, 'green'),
    r = (M = 1) => (typeof o == 'number' ? o * M : o.map((E) => E * M)),
    a = 0.89,
    l = 0.2,
    c = 1.12,
    u = 0.3,
    h = 0.5,
    f = -0.44,
    p = -0.5,
    d = 0.022,
    v = [
      [-h, c],
      [-u, l],
      [-f, l],
      [-p, c],
      [-p - d, c],
      [-f - d * 0.8, l + d],
      [-u + d * 0.8, l + d],
      [-h + d, c],
    ],
    g = t.seed * 2.3;
  t.add(s, Mo(v, a * 2, { soft: 0 }), { r: [0, tt, 0] }, (M, E, w) => {
    let S = Math.abs(w) < 0.4 && E > l + 0.01 && E < c - 0.01 && Math.abs(M) < a - 0.01;
    return r(0.9 + 0.1 * gn(M * 3 + g, E * 3));
  });
  for (let M of [1, -1]) {
    (t.add(
      s,
      Mo(
        [
          [-h, c],
          [-u, l],
          [-f, l],
          [-p, c],
        ],
        d,
        { soft: 0 },
      ),
      { p: [M * (a - d / 2), 0, 0], r: [0, tt, 0] },
      r(0.95),
    ),
      t.add(s, Ge(0.05, 0.045, h - p + 0.04, 0.008), { p: [M * a, c, 0] }, r(0.9)));
    for (let E of [-0.22, 0.14]) t.add(s, Ge(0.03, 0.84, 0.05, 0.006), { p: [M * (a + 0.012), 0.66, E] }, r(0.9));
    (t.add(s, Ge(0.035, 0.1, 0.84, 0.008), { p: [M * (a + 0.014), 0.93, 0] }, r(0.85)),
      t.add('steel_worn', vn([M * (a + 0.01), 0.93, 0.3], [M * (a + 0.065), 0.93, 0.3], 0.03, 10, !0), null, 0.7),
      t.add('steel_worn', ot(0.042, 0.042, 0.008, 10), { p: [M * (a + 0.064), 0.93, 0.3], r: [0, 0, tt] }, 0.6));
  }
  (t.add(s, Ge(a * 2 + 0.04, 0.045, 0.05, 0.008), { p: [0, c, h] }, r(0.9)),
    t.add(s, Ge(a * 2 + 0.04, 0.045, 0.05, 0.008), { p: [0, c, p] }, r(0.9)));
  let x = Math.atan2(h - u, c - l),
    y = Math.atan2(p - f, c - l);
  for (let M of [-0.6, -0.2, 0.2, 0.6])
    (t.add(s, zr([M, l + 0.03, u + 0.022], [M, c - 0.04, h + 0.012], 0.055, 0.03, 0.006), null, r(0.9)),
      t.add(s, zr([M, l + 0.03, f - 0.016], [M, c - 0.04, p - 0.012], 0.055, 0.03, 0.006), null, r(0.9)));
  t.add(
    s,
    zr(
      [-a, l + 0.5, u + 0.022 + (0.5 * (h - u)) / (c - l)],
      [a, l + 0.5, u + 0.022 + (0.5 * (h - u)) / (c - l)],
      0.03,
      0.06,
      0.006,
    ),
    { r: [0, 0, 0] },
    r(0.88),
  );
  let b = (M) => u + ((M - l) * (h - u)) / (c - l) + 0.003;
  (t.label(
    e.label || 'B4 WASTE ' + (11 + (t.seed % 2)),
    { color: 'white', font: 'stencil', distress: 0.5 },
    0.36,
    0.09,
    { p: [-0.4, 0.93, b(0.93)], r: [-x, 0, 0] },
  ),
    t.decal(i.mats.decal('grime_streak'), 0.36, { p: [0.4, 0.82, b(0.82)], r: [-x, 0, 0] }),
    t.decal(i.mats.decal('rust_run'), 0.3, { p: [0, 0.5, b(0.5)], r: [-x, 0, 0] }),
    t.decal(i.mats.decal('logo_c'), 0.26, { p: [0.4, 0.42, b(0.42)], r: [-x, 0, 0] }),
    t.decal(i.mats.decal('leak_stain'), 0.34, { p: [-0.4, 0.45, b(0.45)], r: [-x, 0, 0] }));
  let m = c + 0.045,
    A = p - 0.02;
  t.add('steel_galv', vn([-a - 0.02, m, A], [a + 0.02, m, A], 0.013, 6, !0), null, 0.7);
  let _ = (M, E) => {
    t.push({ p: [M, m, A], r: [E, 0, 0] });
    let w = 1.07,
      S = eo(0.885, 0.04, w, 0.016, 3, 3, 4);
    (to(S, (H) => {
      H.y > 0 && (H.y += 0.018 * Math.cos((H.z / w) * At) * Math.cos((H.x / 0.885) * At));
    }),
      S.computeVertexNormals());
    let z = n.range(0.75, 0.95);
    t.add('plastic_grey', S, { p: [0, 0.005, w / 2] }, z);
    for (let H of [-0.26, 0.26])
      t.add('plastic_grey', Ge(0.07, 0.016, w - 0.16, 0.006), { p: [H, 0.036, w / 2] }, z * 0.9);
    t.add('plastic_grey', Ge(0.3, 0.035, 0.05, 0.01), { p: [0, 0.02, w + 0.01] }, z * 0.8);
    for (let H of [-0.3, 0.3]) t.add('plastic_grey', Ge(0.08, 0.03, 0.09, 0.008), { p: [H, 0.005, 0.03] }, z * 0.8);
    t.pop();
  };
  (_(-0.45, 0), _(0.45, tt + 0.07 + n.range(0, 0.05)));
  for (let [M, E, w, S] of [
    [0.45, 0.93, 0.05, 1],
    [0.66, 0.9, -0.24, 0.8],
    [0.22, 0.86, -0.2, 0.85],
  ]) {
    let z = eo(0.46 * S, 0.4 * S, 0.42 * S, 0.17 * S, 3, 3, 3),
      H = n() * 20;
    (to(z, (O) => {
      let q = gn(O.x * 9 + H, O.y * 9, O.z * 9) - 0.5;
      ((O.x += q * 0.06), (O.z += q * 0.06), (O.y += q * 0.04));
    }),
      t.add('polymer_black', gr(z), { p: [M, E, w], r: [n() * 0.5, n() * 6, 0] }, 0.8));
  }
  t.add(
    'cardboard',
    vr(
      [
        [0.2, 0.9, 0.2],
        [0.24, 1.14, 0.26],
        [0.3, 1.2, 0.33],
      ],
      [0.16, 0, -0.05],
    ),
    null,
    0.7,
  );
  for (let M of [-0.7, 0.7])
    for (let E of [-0.3, 0.17]) {
      (t.push({ p: [M, 0, E], r: [0, n() * 6, 0] }),
        t.add('steel_galv', Ge(0.13, 0.012, 0.11, 0.003), { p: [0, 0.194, 0] }, 0.7));
      for (let w of [1, -1])
        t.add('steel_galv', zr([0, 0.19, w * 0.034], [0.035, 0.08, w * 0.034], 0.05, 0.006, 0, !0), null, 0.65);
      (t.add('rubber', ot(0.08, 0.08, 0.045, 14), { p: [0.035, 0.08, 0], r: [tt, 0, 0] }, 0.9),
        t.add('steel_galv', ot(0.035, 0.035, 0.05, 8), { p: [0.035, 0.08, 0], r: [tt, 0, 0] }, 0.6),
        t.pop());
    }
  return t.finish({ colliders: [{ min: [-0.95, 0.05, -0.56], max: [0.95, 1.2, 0.55], surface: 'metal' }] });
}
function lR(i, e) {
  let t = new ClutterBuilder(i, 'toolbox_cart', e.seed || 0),
    n = t.rng,
    [s, o] = Ja(e.color, 'red'),
    r = (y = 1) => (typeof o == 'number' ? o * y : o.map((b) => b * y)),
    a = 0.04,
    l = 0.74,
    c = 0.125,
    u = 0.785,
    h = 0.23;
  (t.add(s, Ge(l, u - c, h * 2, 0.012), { p: [a, (c + u) / 2, 0] }, r()),
    t.add('steel_dark', Ge(l + 0.01, 0.02, h * 2 + 0.01, 0.006), { p: [a, c + 0.004, 0] }, 0.5));
  let f = [0.075, 0.075, 0.1, 0.13, 0.19],
    p = 1 + (t.seed % 3),
    d = u - 0.03;
  (f.forEach((y, b) => {
    let m = b === p ? 0.05 : n() < 0.3 ? 0.004 : 0,
      A = d - y / 2;
    if (
      (t.add(s, Ge(l - 0.05, y - 0.01, 0.014, 0.004), { p: [a, A, h + 0.005 + m] }, r(n.range(0.9, 1))),
      t.add('aluminium', Ge(l - 0.09, 0.016, 0.016, 0.004), { p: [a, A + y / 2 - 0.02, h + 0.019 + m] }, 0.85),
      m > 0.01)
    ) {
      (t.add('steel_dark', $e(l - 0.07, y - 0.02, m), { p: [a, A, h + m / 2] }, 0.4),
        t.add('polymer_black', $e(l - 0.08, 0.004, m), { p: [a, A + y / 2 - 0.012, h + m / 2] }, 0.3));
      for (let _ = 0; _ < 4; _++)
        t.add(
          'steel_bare',
          vn(
            [a - 0.25 + _ * 0.15, A + y / 2 - 0.016, h + 0.008],
            [a - 0.23 + _ * 0.15, A + y / 2 - 0.014, h + m - 0.012],
            0.007,
            5,
            !0,
          ),
          null,
          0.8,
        );
    }
    d -= y;
  }),
    t.add(
      'steel_bare',
      ot(0.011, 0.011, 0.008, 8),
      { p: [a + l / 2 - 0.06, u - 0.016, h + 0.004], r: [tt, 0, 0] },
      0.8,
    ),
    t.add('rubber', $e(l - 0.04, 0.006, h * 2 - 0.04), { p: [a, u + 0.003, 0] }, 0.9),
    t.add(s, Ge(l, 0.03, 0.014, 0.004), { p: [a, u + 0.013, -h + 0.007] }, r(0.95)));
  for (let y of [1, -1])
    t.add(s, Ge(0.014, 0.03, h * 2, 0.004), { p: [a + y * (l / 2 - 0.007), u + 0.013, 0] }, r(0.95));
  t.add(
    'aluminium',
    Fn(
      [
        [a - l / 2, 0.56, -0.17],
        [-0.41, 0.6, -0.17],
        [-0.435, 0.73, -0.17],
        [-0.435, 0.73, 0.17],
        [-0.41, 0.6, 0.17],
        [a - l / 2, 0.56, 0.17],
      ],
      0.012,
      6,
      !1,
      0.2,
    ),
    null,
    0.85,
  );
  for (let y of [1, -1])
    for (let b of [1, -1]) {
      (t.push({ p: [a + y * (l / 2 - 0.07), 0, b * (h - 0.06)], r: [0, y > 0 ? n() * 6 : 0, 0] }),
        t.add('steel_galv', Ge(0.08, 0.008, 0.07, 0.002), { p: [0, 0.119, 0] }, 0.7));
      for (let m of [1, -1])
        t.add('steel_galv', zr([0, 0.117, m * 0.022], [0.02, 0.05, m * 0.022], 0.035, 0.004, 0, !0), null, 0.65);
      (t.add('rubber', ot(0.05, 0.05, 0.03, 12), { p: [0.02, 0.05, 0], r: [tt, 0, 0] }, 0.9),
        t.add('steel_galv', ot(0.02, 0.02, 0.034, 6), { p: [0.02, 0.05, 0], r: [tt, 0, 0] }, 0.6),
        t.pop());
    }
  (t.label(e.label || 'MAINT ' + (1 + (t.seed % 2)), { color: 'white', font: 'stencil', distress: 0.4 }, 0.3, 0.07, {
    p: [a + l / 2 + 0.002, 0.6, 0],
    r: [0, tt, 0],
  }),
    t.decal(i.mats.decal('logo_d'), 0.2, { p: [a + l / 2 + 0.002, 0.42, 0], r: [0, tt, 0] }),
    t.decal(i.mats.decal('grime_streak'), 0.3, { p: [a, 0.45, -h - 0.002], r: [0, At, 0] }));
  let v = u + 0.006;
  (t.push({ p: [a - 0.18, v, 0.08], r: [0, 0.5, 0] }),
    t.add('steel_bare', Ge(0.2, 0.006, 0.02, 0.002), { p: [0, 0.004, 0] }, 0.9),
    t.add('steel_bare', ja(0.016, 0.006, 4, 10), { p: [0.11, 0.005, 0], r: [tt, 0, 0] }, 0.9),
    t.add('steel_bare', ja(0.017, 0.006, 4, 7, At * 1.4), { p: [-0.112, 0.005, 0], r: [tt, 0, 2.2] }, 0.9),
    t.pop(),
    t.push({ p: [a + 0.02, v, -0.1], r: [0, -0.3, 0] }),
    t.add('wood_pallet', vn([-0.14, 0.014, 0], [0.12, 0.016, 0], 0.012, 6, !0, 0.01), null, 0.9),
    t.add('steel_dark', Ge(0.032, 0.03, 0.1, 0.006), { p: [0.125, 0.017, 0.005] }, 0.8),
    t.pop(),
    t.push({ p: [a + 0.2, v, 0.1], r: [0, 0.12, 0] }),
    t.add('polymer_black', Ge(0.22, 0.014, 0.05, 0.004), { p: [0, 0.007, 0] }, 0.6));
  for (let y = 0; y < 6; y++)
    t.add(
      'steel_bare',
      ot(0.008 + y * 0.0014, 0.008 + y * 0.0014, 0.03, 8),
      { p: [-0.085 + y * 0.034, 0.029, 0] },
      0.9,
    );
  (t.pop(),
    t.add('plastic_blue', ot(0.032, 0.032, 0.13, 12), { p: [a + 0.28, v + 0.065, -0.12] }, 0.9),
    t.add(
      'steel_bare',
      us(
        [
          [0.032, 0],
          [0.028, 0.012],
          [0.014, 0.018],
          [0.014, 0.018],
          [0.014, 0.03],
          [0, 0.03],
        ],
        10,
      ),
      { p: [a + 0.28, v + 0.13, -0.12] },
      0.9,
    ),
    t.add('plastic_red', ot(0.012, 0.012, 0.014, 8), { p: [a + 0.28, v + 0.165, -0.12] }, 0.95),
    t.add('paint_yellow', vn([a - 0.3, v + 0.012, -0.13], [a - 0.2, v + 0.012, -0.16], 0.014, 7, !0), null, 0.9),
    t.add('steel_bare', vn([a - 0.2, v + 0.012, -0.16], [a - 0.08, v + 0.01, -0.196], 0.004, 5, !0), null, 0.9));
  let g = eo(0.2, 0.02, 0.15, 0.009, 4, 3, 4),
    x = n() * 9;
  return (
    to(g, (y) => {
      ((y.y += 0.012 * gn(y.x * 30 + x, y.z * 30) * (y.y > 0 ? 1 : 0)), (y.x += 0.012 * (gn(y.z * 20, x) - 0.5)));
    }),
    t.add(t.mat('glove_fabric', { color: 8203044 }), gr(g), { p: [a - 0.26, v + 0.01, 0.12], r: [0, 0.8, 0] }, 0.9),
    t.finish()
  );
}
function sb(i) {
  (i('forklift', (e, t = {}) => oR(e, t)),
    i('generator', (e, t = {}) => rR(e, t)),
    i('dumpster', (e, t = {}) => aR(e, t)),
    i('toolbox_cart', (e, t = {}) => lR(e, t)));
}
J3(registerProp);
eb(registerProp);
sb(registerProp);
