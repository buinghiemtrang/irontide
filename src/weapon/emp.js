// EMP grenade: thrown with G (gamepad LB), bounces off the world, and after a
// short fuse releases a pulse that damages and stuns every machine in range.
//
// Stun works from the outside: each enemy's _update is wrapped so a stunned
// machine skips its AI (no moving, no firing) and just twitches and sparks.
import {
  AddEquation,
  Color,
  CustomBlending,
  OneFactor,
  ZeroFactor,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
} from 'three';

export const EMP = {
  perMission: 2,
  speed: 15,
  upKick: 3.2,
  gravity: 9.81,
  fuse: 1.6,
  radius: 9,
  damage: 30,
  stun: 4.2,
  bounce: 0.42,
  friction: 0.72,
  cooldown: 0.7,
};

const UP = new Vector3(0, 1, 0);
const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpDir = new Vector3();

const pulseVert = `
varying vec3 vN, vV;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const pulseFrag = `
uniform float uLife, uTime;
varying vec3 vN, vV;
void main(){
  float rim = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  rim = pow(rim, 2.2);
  float arcs = 0.65 + 0.35 * sin(uTime * 60.0 + vN.y * 30.0 + vN.x * 21.0);
  float a = (1.0 - uLife) * (1.0 - uLife);
  vec3 c = vec3(0.35, 0.75, 1.0) * (0.25 + rim * 2.0) * arcs * a * 2.2 + vec3(0.6, 0.9, 1.0) * a * 0.1;
  if (!(c.r >= 0.0 && c.g >= 0.0 && c.b >= 0.0)) c = vec3(0.0);
  gl_FragColor = vec4(min(c, vec3(6.0)), 0.0);
}`;

export function createEmp(G) {
  const root = new Group();
  root.name = 'emp';
  G.scene.add(root);

  // ---- grenade model ----
  const bodyGeo = new CylinderGeometry(0.045, 0.045, 0.12, 12);
  const bandGeo = new TorusGeometry(0.047, 0.008, 6, 16).rotateX(Math.PI / 2);
  let bodyMat;
  try {
    bodyMat = G.mats.get('gunmetal');
  } catch {}
  bodyMat = bodyMat || new MeshBasicMaterial({ color: 0x23282c });
  const bandMat = new MeshBasicMaterial({ color: new Color(0.3, 0.8, 1.6), toneMapped: false });

  function makeGrenade() {
    const g = new Group();
    const body = new Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    g.add(body);
    for (const y of [-0.035, 0.035]) {
      const band = new Mesh(bandGeo, bandMat.clone());
      band.position.y = y;
      g.add(band);
    }
    return g;
  }

  // ---- pulse visual ----
  const pulseGeo = new IcosahedronGeometry(1, 3);
  const pulses = [];
  const rings = [];
  const ringGeo = new RingGeometry(0.86, 1, 48).rotateX(-Math.PI / 2);
  const ringMat = new MeshBasicMaterial({
    color: new Color(0.5, 1.1, 2.2),
    transparent: true,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: ZeroFactor,
    blendDstAlpha: OneFactor,
    toneMapped: false,
    side: 2,
  });
  function spawnPulse(pos) {
    const mat = new ShaderMaterial({
      name: 'irontide-emp-pulse',
      uniforms: { uLife: { value: 0 }, uTime: { value: 0 } },
      vertexShader: pulseVert,
      fragmentShader: pulseFrag,
      transparent: true,
      depthWrite: false,
      // add colour only; the post chain reads the HDR alpha channel
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneFactor,
      blendSrcAlpha: ZeroFactor,
      blendDstAlpha: OneFactor,
      toneMapped: false,
      side: 2, // visible from inside the sphere too
    });
    const m = new Mesh(pulseGeo, mat);
    m.position.copy(pos);
    m.scale.setScalar(0.2);
    m.renderOrder = 6;
    root.add(m);
    pulses.push({ mesh: m, t: 0, dur: 0.55 });
    // a flat shock ring racing across the ground
    const ring = new Mesh(ringGeo, ringMat.clone());
    ring.position.set(pos.x, Math.max(0.04, pos.y - 0.04), pos.z);
    ring.renderOrder = 6;
    root.add(ring);
    rings.push({ mesh: ring, t: 0, dur: 0.7 });
  }

  // ---- HUD: grenade count above the ammo counter ----
  const hudEl = document.createElement('div');
  hudEl.className = 'h-emp';
  hudEl.innerHTML = '<span>EMP</span><b>2</b><kbd>G</kbd>';
  const ammo = document.querySelector('.h-ammo');
  if (ammo) ammo.insertBefore(hudEl, ammo.firstChild);
  let shown = -1;
  function drawHud() {
    if (shown === state.count) return;
    shown = state.count;
    hudEl.querySelector('b').textContent = String(state.count);
    hudEl.classList.toggle('empty', state.count <= 0);
  }

  // ---- state ----
  const live = [];
  const state = { count: EMP.perMission, cool: 0 };
  G.events.on('mission:start', () => {
    state.count = EMP.perMission;
    for (const n of live) root.remove(n.obj);
    live.length = 0;
    for (const e of G.enemies.list || []) e.stunT = 0;
  });

  // ---- stun: wrap each enemy's update (enemies are created on first spawn) ----
  const sparkT = new WeakMap();
  const wrapped = new WeakSet();
  function wrapEnemies() {
    for (const e of G.enemies.list || []) {
      if (wrapped.has(e)) continue;
      wrapped.add(e);
      const orig = e._update;
      e.stunT = 0;
      e._update = function (dt) {
        if (e.alive && e.stunT > 0) {
          e.stunT -= dt;
          stunned(e, dt);
          return;
        }
        orig.call(e, dt);
      };
    }
  }
  function stunned(e, dt) {
    const t = (sparkT.get(e) || 0) - dt;
    // gulls lose lift and sink, hounds lock up; both twitch
    if (e.type === 'gull') {
      const floor = 1.4;
      if (e.pos.y > floor) e.pos.y = Math.max(floor, e.pos.y - dt * 1.6);
      if (e.vel) e.vel.multiplyScalar(Math.max(0, 1 - dt * 4));
    }
    const rig = e.rig && e.rig.group;
    if (rig) rig.rotation.z = Math.sin(G.time.t * 47 + e.id) * 0.05 * Math.min(1, e.stunT);
    if (t <= 0) {
      sparkT.set(e, 0.18 + Math.random() * 0.3);
      tmpA.copy(e.pos);
      tmpA.y += e.type === 'gull' ? 0.1 : 0.9;
      try {
        G.fx.sparks(tmpA, UP, 5);
      } catch {}
    } else sparkT.set(e, t);
    if (e.stunT <= 0 && rig) rig.rotation.z = 0;
  }

  function throwOne() {
    const cam = G.camera;
    cam.getWorldDirection(tmpDir);
    const obj = makeGrenade();
    const pos = cam.position.clone().addScaledVector(tmpDir, 0.45);
    pos.y -= 0.18;
    const vel = tmpDir.clone().multiplyScalar(EMP.speed);
    vel.y += EMP.upKick;
    if (G.player && G.player.vel) vel.addScaledVector(G.player.vel, 0.6);
    obj.position.copy(pos);
    root.add(obj);
    live.push({
      obj,
      pos,
      vel,
      t: 0,
      spin: new Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9),
      rest: false,
    });
    state.count--;
    state.cool = EMP.cooldown;
    G.events.emit('emp:throw', { pos, fuse: EMP.fuse });
  }

  function detonate(n) {
    root.remove(n.obj);
    const pos = n.pos;
    spawnPulse(pos);
    try {
      G.render.lightPool.flash(pos, 0x66ccff, 160, EMP.radius * 2.2, 0.35);
    } catch {}
    try {
      G.fx.sparks(pos, UP, 40);
      G.fx.smoke(pos, { size: 0.6, life: 1.2 });
    } catch {}
    try {
      G.audio.play('explosion', { pos, gain: 0.3, pitch: 1.8 });
    } catch {}
    // shake the camera if the player is close
    const d = G.camera.position.distanceTo(pos);
    if (G.player && G.player.addShake) G.player.addShake(Math.max(0, 0.5 - d / 30));
    let hit = 0;
    for (const e of G.enemies.list || []) {
      if (!e.alive) continue;
      const dist = e.pos.distanceTo(pos);
      if (dist > EMP.radius) continue;
      // line of sight from the pulse to the machine (cover blocks it)
      tmpA.copy(pos).addScaledVector(UP, 0.3);
      tmpB.copy(e.pos).sub(tmpA);
      const len = tmpB.length();
      let blocked = false;
      try {
        const r = G.physics.raycast(tmpA, tmpB.normalize(), Math.max(0, len - 0.6));
        blocked = !!r;
      } catch {}
      if (blocked && dist > 2.5) continue;
      const falloff = 1 - 0.5 * (dist / EMP.radius);
      e.stunT = Math.max(e.stunT || 0, EMP.stun * falloff);
      hit++;
      try {
        e.damage(EMP.damage * falloff, e.pos.clone(), tmpB.clone(), 'body');
      } catch {}
    }
    G.events.emit('emp:detonate', { pos, hit });
  }

  function step(n, dt) {
    if (n.rest) return;
    n.vel.y -= EMP.gravity * dt;
    const move = n.vel.length() * dt;
    if (move > 1e-5) {
      tmpDir.copy(n.vel).normalize();
      let r = null;
      try {
        r = G.physics.raycast(n.pos, tmpDir, move + 0.05);
      } catch {}
      if (r && r.normal) {
        n.pos.copy(r.point).addScaledVector(r.normal, 0.06);
        const vn = n.vel.dot(r.normal);
        n.vel.addScaledVector(r.normal, -2 * vn).multiplyScalar(EMP.bounce);
        // friction along the surface
        tmpA.copy(r.normal).multiplyScalar(n.vel.dot(r.normal));
        n.vel.sub(tmpA).multiplyScalar(EMP.friction).add(tmpA);
        n.spin.multiplyScalar(0.6);
        if (Math.abs(vn) > 1.2)
          try {
            G.audio.play('impact_metal', { pos: n.pos, gain: Math.min(0.6, Math.abs(vn) / 12), pitch: 1.6 });
          } catch {}
        if (r.normal.y > 0.6 && n.vel.length() < 0.6) n.rest = true;
      } else n.pos.addScaledVector(n.vel, dt);
    }
    // never fall through the world
    if (n.pos.y < 0.05) {
      n.pos.y = 0.05;
      if (n.vel.y < 0) n.vel.y *= -EMP.bounce;
      n.vel.x *= EMP.friction;
      n.vel.z *= EMP.friction;
      if (n.vel.length() < 0.6) n.rest = true;
    }
  }

  function update(dt) {
    wrapEnemies();
    state.cool = Math.max(0, state.cool - dt);
    const playing = G.game && G.game.state === 'playing' && G.player && G.player.alive !== false;
    if (playing && G.input && G.input.pressed && G.input.pressed('grenade') && state.count > 0 && state.cool <= 0)
      throwOne();

    for (let k = live.length - 1; k >= 0; k--) {
      const n = live[k];
      n.t += dt;
      step(n, dt);
      n.obj.position.copy(n.pos);
      n.obj.rotation.x += n.spin.x * dt;
      n.obj.rotation.y += n.spin.y * dt;
      n.obj.rotation.z += n.spin.z * dt;
      // the band blinks faster as the fuse runs out
      const f = n.t / EMP.fuse;
      const blink = Math.sin(n.t * (10 + 40 * f * f)) > 0 ? 1 : 0.15;
      for (const c of n.obj.children)
        if (c.material && c.material.color && c.material !== bodyMat)
          c.material.color.setRGB(0.3 * blink, 0.8 * blink, 1.6 * blink);
      if (n.t >= EMP.fuse) {
        live.splice(k, 1);
        detonate(n);
      }
    }
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += dt;
      const life = Math.min(1, p.t / p.dur);
      p.mesh.scale.setScalar(0.2 + EMP.radius * (1 - Math.pow(1 - life, 3)));
      p.mesh.material.uniforms.uLife.value = life;
      p.mesh.material.uniforms.uTime.value = p.t;
      if (life >= 1) {
        root.remove(p.mesh);
        p.mesh.material.dispose();
        pulses.splice(k, 1);
      }
    }
    for (let k = rings.length - 1; k >= 0; k--) {
      const r = rings[k];
      r.t += dt;
      const life = Math.min(1, r.t / r.dur);
      r.mesh.scale.setScalar(0.3 + EMP.radius * 1.15 * (1 - Math.pow(1 - life, 2)));
      const fade = (1 - life) * (1 - life);
      r.mesh.material.color.setRGB(0.5 * fade, 1.1 * fade, 2.2 * fade);
      if (life >= 1) {
        root.remove(r.mesh);
        r.mesh.material.dispose();
        rings.splice(k, 1);
      }
    }
    drawHud();
  }

  return { update, state, throw: throwOne, live };
}
