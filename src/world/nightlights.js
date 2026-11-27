// Night lighting: real spot lights for the port's light masts and floodlights,
// visible light cones in the rain, and the player's weapon flashlight.
//
// Props are merged into static batches by the level, so lamp positions are
// recorded when the props are built (trackLampProps) and turned into light
// sources once the level is ready (createNightLights).
import {
  Color,
  CustomBlending,
  OneFactor,
  ZeroFactor,
  AddEquation,
  ConeGeometry,
  PointLight,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  ShaderMaterial,
  SpotLight,
  Vector3,
} from 'three';
import { zc as VIEW_LAYER } from '../core/config.js';

// lamp heads in prop-local space: position + aim direction
const LAMPS = {
  light_mast: [
    { p: [0.3, 13.2, 0.55], d: [0.81, -0.58, 0] },
    { p: [0.3, 13.2, -0.55], d: [0.81, -0.58, 0] },
    { p: [-0.3, 13.2, 0.55], d: [-0.81, -0.58, 0] },
    { p: [-0.3, 13.2, -0.55], d: [-0.81, -0.58, 0] },
  ],
  floodlight_stand: [
    { p: [0.12, 2.0, 0.2], d: [0.97, -0.24, 0] },
    { p: [0.12, 2.0, -0.2], d: [0.97, -0.24, 0] },
  ],
};
// how each kind of lamp looks once grouped into one light source
const KIND = {
  light_mast: { color: new Color(1.0, 0.74, 0.46), intensity: 2600, distance: 46, angle: 0.62, length: 9, beam: 0.16 },
  floodlight_stand: {
    color: new Color(0.92, 0.95, 1.0),
    intensity: 260,
    distance: 22,
    angle: 0.5,
    length: 4.5,
    beam: 0.12,
  },
};

export function trackLampProps(G) {
  const built = [];
  const build = G.props.build.bind(G.props);
  G.props.build = (name, opts) => {
    const obj = build(name, opts);
    if (obj && LAMPS[name]) built.push({ name, obj });
    return obj;
  };
  G.lampProps = built;
}

// one source per prop: the lamps of a prop are averaged into a single spot light
// (keeps the light count low), the individual lamps still get a visible beam each
function collectSources(G) {
  const out = [];
  const m = new Matrix4();
  const q = new Quaternion();
  for (const { name, obj } of G.lampProps || []) {
    obj.updateWorldMatrix(true, false);
    m.copy(obj.matrixWorld);
    q.setFromRotationMatrix(m);
    const lamps = LAMPS[name].map((l) => ({
      pos: new Vector3(...l.p).applyMatrix4(m),
      dir: new Vector3(...l.d).normalize().applyQuaternion(q),
    }));
    // group lamps that aim the same way (a mast lights both of its sides)
    const groups = [];
    for (const l of lamps) {
      const g = groups.find((x) => x.dir.dot(l.dir) > 0.9);
      if (g) g.items.push(l);
      else groups.push({ dir: l.dir.clone(), items: [l] });
    }
    for (const g of groups) {
      const pos = new Vector3();
      g.items.forEach((l) => pos.add(l.pos));
      pos.multiplyScalar(1 / g.items.length);
      out.push({ kind: name, pos, dir: g.dir, lamps: g.items });
    }
  }
  return out;
}

const beamVert = `
varying float vAlong;
varying vec3 vN, vV;
void main(){
  vAlong = clamp(-position.y / uLen, 0.0, 1.0);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const beamFrag = `
uniform vec3 uColor;
uniform float uStrength, uTime;
varying float vAlong;
varying vec3 vN, vV;
void main(){
  vec3 n = vN; float nl = length(n); n = nl > 1e-5 ? n / nl : vec3(0.0, 1.0, 0.0);
  float edge = pow(clamp(abs(dot(n, normalize(vV))), 0.0, 1.0), 2.4);
  float fall = pow(1.0 - vAlong, 2.2) * smoothstep(0.0, 0.06, vAlong);
  float shimmer = 0.85 + 0.15 * sin(uTime * 7.0 + vAlong * 40.0);
  vec3 c = uColor * edge * fall * shimmer * uStrength;
  // guard against NaN/negative values: the post chain turns them into black specks
  if (!(c.r >= 0.0 && c.g >= 0.0 && c.b >= 0.0) || any(isinf(c))) c = vec3(0.0);
  gl_FragColor = vec4(min(c, vec3(4.0)), 0.0);
}`;

function makeBeam(kind, lamp, strength, uniformsShared) {
  const k = KIND[kind];
  const radius = Math.tan(k.angle * 0.5) * k.length;
  const geo = new ConeGeometry(radius, k.length, 20, 1, true);
  geo.translate(0, -k.length / 2, 0); // apex (+Y end) moves to the origin, cone opens toward -Y
  const mat = new ShaderMaterial({
    name: 'irontide-lightbeam',
    uniforms: {
      uColor: { value: k.color },
      uStrength: { value: k.beam * strength },
      uLen: { value: k.length },
      uTime: uniformsShared.uTime,
    },
    vertexShader: 'uniform float uLen;\n' + beamVert,
    fragmentShader: beamFrag,
    transparent: true,
    depthWrite: false,
    // add colour only: the post chain reads the HDR alpha channel, leave it untouched
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: ZeroFactor,
    blendDstAlpha: OneFactor,
    side: 2,
    fog: false,
    toneMapped: false,
  });
  const mesh = new Mesh(geo, mat);
  mesh.position.copy(lamp.pos);
  // cone axis is -Y after the flip; aim it along the lamp direction
  mesh.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), lamp.dir);
  mesh.frustumCulled = true;
  mesh.renderOrder = 5;
  mesh.castShadow = mesh.receiveShadow = false;
  return mesh;
}

export function createNightLights(G) {
  const cond = G.condition || {};
  const sources = collectSources(G);
  const shared = { uTime: { value: 0 } };
  const root = new Object3D();
  root.name = 'night-lights';
  G.scene.add(root);

  const q = (G.quality && G.quality.name) || 'medium';
  const poolSize = cond.night ? { low: 3, test: 4, medium: 5, high: 6, ultra: 8 }[q] || 5 : 0;
  const beamStrength = cond.night ? 1 : 0;

  // visible beams for every lamp (cheap: one additive cone each)
  if (beamStrength > 0)
    for (const s of sources)
      for (const l of s.lamps) root.add(makeBeam(s.kind, l, beamStrength * (1 + (cond.rain || 1) * 0.25), shared));

  // a fixed pool of real spot lights handed to the sources nearest the camera
  // (constant light count = no shader recompiles while moving)
  const pool = [];
  for (let n = 0; n < poolSize; n++) {
    const L = new SpotLight(0xffffff, 0, 30, 0.6, 0.65, 2);
    L.castShadow = false;
    root.add(L, L.target);
    pool.push(L);
  }
  let reassign = 0;
  const tmp = new Vector3();
  function assign() {
    const cam = G.camera.position;
    const ranked = sources
      .map((s) => ({ s, d: s.pos.distanceToSquared(cam) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, pool.length);
    pool.forEach((L, n) => {
      const r = ranked[n];
      if (!r) return void (L.intensity = 0);
      const k = KIND[r.s.kind];
      L.position.copy(r.s.pos);
      L.target.position.copy(tmp.copy(r.s.pos).addScaledVector(r.s.dir, 10));
      L.target.updateMatrixWorld();
      L.color.copy(k.color);
      L.distance = k.distance;
      L.angle = k.angle;
      L.userData.want = k.intensity * (r.s.lamps.length / 2);
    });
  }

  // ---- flashlight (weapon light) ----
  const torch = new SpotLight(new Color(0.95, 0.97, 1.0), 0, 38, 0.38, 0.55, 2);
  torch.castShadow = false;
  torch.position.set(0.18, -0.12, 0);
  torch.target.position.set(0.05, -0.05, -10);
  G.camera.add(torch, torch.target);
  const flashlight = { on: !!cond.night, level: cond.night ? 1 : 0 };
  // the first-person weapon renders on its own layer: give it a little spill from the torch
  const spill = new PointLight(new Color(0.9, 0.94, 1.0), 0, 2.2, 2);
  spill.layers.set(VIEW_LAYER);
  spill.position.set(0.05, 0.1, -0.35);
  G.camera.add(spill);
  // at night the sky barely lights the weapon; lift its environment fill a bit
  if (cond.night && G.render) G.render.viewFill = 3.2;

  function update(dt) {
    shared.uTime.value += dt;
    reassign -= dt;
    if (pool.length && reassign <= 0) {
      reassign = 0.3;
      assign();
    }
    // fade lights in after reassignment to hide the swap
    for (const L of pool) L.intensity += ((L.userData.want || 0) - L.intensity) * Math.min(1, dt * 6);

    const input = G.input;
    if (input && input.pressed && input.pressed('flashlight')) {
      flashlight.on = !flashlight.on;
      G.events.emit('flashlight', { on: flashlight.on });
    }
    flashlight.level += ((flashlight.on ? 1 : 0) - flashlight.level) * Math.min(1, dt * 18);
    // tiny flicker + the light sways a touch behind the view
    const flicker = 0.97 + 0.03 * Math.sin(shared.uTime.value * 31.0);
    torch.intensity = flashlight.level * (cond.night ? 95 : 60) * flicker;
    spill.intensity = flashlight.level * 0.9 * flicker;
  }

  return { update, flashlight, sources, root, torch, spill };
}
