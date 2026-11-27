// Second weapon: the M-12 Breakwater pump shotgun, plus the loadout that swaps
// between it and the PAC-9 rifle.
//
// The rifle system keeps running underneath: it owns the arms, sway, aim-down-
// sights and the view camera. When the shotgun is out, the rifle's own meshes
// are hidden and its firing / reloading are disabled; the shotgun model is
// parented to the same gun group so it inherits all of that motion, and this
// module adds its own kick, pump and shell-loading animation on top.
//
// G.weapon is wrapped in a Proxy so the HUD (and anything else reading
// ammo / magSize / reserve / name / spread) sees the weapon in hand.
import {
  AddEquation,
  BoxGeometry,
  Color,
  ConeGeometry,
  CustomBlending,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OneFactor,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  ZeroFactor,
} from 'three';

export const SHOTGUN = {
  name: 'M-12 Breakwater',
  tube: 6,
  reserve: 36,
  pellets: 8,
  pelletDamage: 14,
  range: 40,
  spreadHip: 0.07,
  spreadAds: 0.05,
  pump: 0.78, // seconds between shots (pump cycle)
  reloadStart: 0.32,
  reloadShell: 0.5,
  swapTime: 0.42,
};

const SIGHT_Y = 0.069; // the rifle's sight line in gun space (ADS aligns this with the view)

export function createLoadout(G) {
  const rifle = G.weapon;
  if (!rifle || !rifle.root) return null;

  // ---------- find the rifle parts ----------
  let gun = null;
  rifle.root.traverse((o) => {
    if (o.name === 'viewmodel-pac9') gun = o;
  });
  if (!gun) return null;
  const rifleMeshes = [];
  let leftArm = null;
  const mats = {};
  rifle.root.traverse((o) => {
    if (!o.isMesh) return;
    const mn = (o.material && o.material.name) || '';
    if (mn && !mats[mn]) mats[mn] = o.material;
    if (mn === 'glove_fabric') {
      // the left arm is the glove mesh reaching furthest forward and left
      o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      if (bb.min.x < -0.15 && o.parent) leftArm = o.parent;
      return;
    }
    rifleMeshes.push(o);
  });

  // ---------- shotgun model (gun space: barrel along -Z, sight line at y = SIGHT_Y) ----------
  const metal = mats.pac9_phosphate || new MeshStandardMaterial({ color: 0x24282b, metalness: 0.8, roughness: 0.45 });
  const blued = mats.pac9_anodised || metal;
  const poly = mats.pac9_polymer || new MeshStandardMaterial({ color: 0x1a1c1e, roughness: 0.8 });
  const furniture = mats.pac9_polymer_tan || new MeshStandardMaterial({ color: 0x6b5a43, roughness: 0.75 });
  const brass = mats.brass || new MeshStandardMaterial({ color: 0xb08a45, metalness: 1, roughness: 0.35 });
  const hullMat = new MeshStandardMaterial({ name: 'shell_hull', color: 0x8a1d18, roughness: 0.55 });

  const sg = new Group();
  sg.name = 'viewmodel-m12';
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = false;
    m.receiveShadow = false;
    m.frustumCulled = false;
    sg.add(m);
    return m;
  };
  const cyl = (r, len, seg = 14) => new CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
  const by = SIGHT_Y - 0.034; // barrel axis

  // receiver + trigger group
  add(new BoxGeometry(0.044, 0.07, 0.21), blued, 0, by - 0.012, -0.02);
  add(new BoxGeometry(0.046, 0.012, 0.16), metal, 0, by + 0.026, -0.03); // top rail
  add(new BoxGeometry(0.03, 0.03, 0.07), metal, 0, by - 0.058, 0.03); // trigger housing
  add(new TorusGeometry(0.018, 0.004, 6, 14, Math.PI), metal, 0, by - 0.074, 0.035, 0, Math.PI / 2, Math.PI);
  add(new BoxGeometry(0.006, 0.022, 0.008), metal, 0, by - 0.07, 0.03, 0.3); // trigger
  // barrel, muzzle, magazine tube, cap
  add(cyl(0.0115, 0.52), metal, 0, by + 0.004, -0.38);
  add(cyl(0.0135, 0.025), blued, 0, by + 0.004, -0.63);
  add(cyl(0.012, 0.42), blued, 0, by - 0.026, -0.33);
  add(cyl(0.014, 0.03), metal, 0, by - 0.026, -0.555);
  add(new BoxGeometry(0.012, 0.03, 0.02), metal, 0, by - 0.012, -0.53); // barrel clamp
  // sights: ghost ring at the back, bead at the front, both on the sight line
  add(new TorusGeometry(0.007, 0.0022, 6, 16), metal, 0, SIGHT_Y, 0.06);
  add(new BoxGeometry(0.03, 0.02, 0.012), metal, 0, SIGHT_Y - 0.016, 0.06);
  add(new SphereGeometry(0.0035, 8, 6), new MeshBasicMaterial({ color: new Color(1.4, 0.95, 0.4) }), 0, SIGHT_Y, -0.62);
  add(new BoxGeometry(0.004, 0.016, 0.01), metal, 0, SIGHT_Y - 0.012, -0.62);
  // pistol grip + stock
  add(new BoxGeometry(0.03, 0.1, 0.042), poly, 0, by - 0.09, 0.1, 0.32);
  add(new BoxGeometry(0.036, 0.06, 0.2), furniture, 0, by - 0.018, 0.2, -0.08);
  add(new BoxGeometry(0.036, 0.1, 0.03), furniture, 0, by - 0.04, 0.3, -0.08);
  add(new BoxGeometry(0.04, 0.11, 0.012), poly, 0, by - 0.04, 0.318, -0.08); // butt pad
  // shell saddle on the left side with 4 spare shells
  add(new BoxGeometry(0.006, 0.035, 0.07), poly, -0.025, by - 0.006, -0.03);
  for (let n = 0; n < 4; n++) {
    const z = -0.055 + n * 0.017;
    add(cyl(0.0085, 0.04, 10).rotateX(Math.PI / 2), hullMat, -0.034, by - 0.006, z);
    add(cyl(0.0088, 0.012, 10).rotateX(Math.PI / 2), brass, -0.034, by - 0.028, z);
  }
  // pump (moves)
  const pump = new Group();
  sg.add(pump);
  const pumpMesh = new Mesh(new CylinderGeometry(0.021, 0.021, 0.16, 16).rotateX(Math.PI / 2), furniture);
  pumpMesh.position.set(0, by - 0.022, -0.29);
  pumpMesh.frustumCulled = false;
  pump.add(pumpMesh);
  for (let n = 0; n < 5; n++) {
    const r = new Mesh(new TorusGeometry(0.0212, 0.0024, 4, 16), poly);
    r.position.set(0, by - 0.022, -0.235 - n * 0.025);
    r.frustumCulled = false;
    pump.add(r);
  }
  // muzzle flash (colour-only additive, leaves the HDR alpha alone)
  const flashMat = new MeshBasicMaterial({
    color: new Color(5, 3.2, 1.4),
    transparent: true,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: ZeroFactor,
    blendDstAlpha: OneFactor,
    toneMapped: false,
  });
  const flash = new Mesh(new ConeGeometry(0.05, 0.2, 10, 1, true).rotateX(-Math.PI / 2), flashMat);
  flash.position.set(0, by + 0.004, -0.74);
  flash.visible = false;
  flash.frustumCulled = false;
  sg.add(flash);
  const flashCore = new Mesh(new SphereGeometry(0.035, 10, 8), flashMat);
  flashCore.position.set(0, by + 0.004, -0.655);
  flashCore.visible = false;
  flashCore.frustumCulled = false;
  sg.add(flashCore);

  sg.visible = false;
  gun.add(sg);
  const MUZZLE = new Vector3(0, by + 0.004, -0.66);
  const EJECT = new Vector3(0.025, by + 0.01, -0.02);

  // ---------- state ----------
  const S = {
    active: 'rifle',
    swapT: 0, // 0..1 lowered amount
    swapTo: null,
    ammo: SHOTGUN.tube,
    reserve: SHOTGUN.reserve,
    cool: 0,
    pumpT: 1, // 0..1 progress of the pump animation (1 = idle)
    reload: null, // { t, next, loaded }
    kick: 0,
    kickV: 0,
    flashT: 0,
    prevFire: false,
    shotsFired: 0,
  };
  const view = {
    name: SHOTGUN.name,
    get ammo() {
      return S.ammo;
    },
    get magSize() {
      return SHOTGUN.tube;
    },
    get reserve() {
      return S.reserve;
    },
    get spread() {
      return lerp(SHOTGUN.spreadHip, SHOTGUN.spreadAds, rifle.ads || 0) * 0.6;
    },
    get damage() {
      return SHOTGUN.pelletDamage * SHOTGUN.pellets;
    },
    rpm: 60 / SHOTGUN.pump,
    get state() {
      return S.reload ? 'reload' : S.swapT > 0 ? 'swap' : 'idle';
    },
  };
  const rifleStash = { reserve: null };

  // proxy: the weapon in hand answers the HUD's questions
  const proxy = new Proxy(rifle, {
    get(t, p) {
      if (S.active === 'shotgun' && p in view) return view[p];
      if (p === 'loadout') return api;
      if (p === 'reserve' && rifleStash.reserve != null) return rifleStash.reserve;
      return t[p];
    },
    set(t, p, v) {
      if (p === 'reserve' && rifleStash.reserve != null) {
        rifleStash.reserve = v;
        return true;
      }
      t[p] = v;
      return true;
    },
  });
  G.weapon = proxy;

  function setShotgunVisible(on) {
    for (const m of rifleMeshes) m.visible = !on;
    sg.visible = on;
    // stop the rifle firing / reloading while the shotgun is out
    rifle.debug.noFire = on;
    if (on) {
      if (rifleStash.reserve == null) {
        rifleStash.reserve = rifle.reserve;
        rifle.reserve = 0; // the rifle can't start a reload with no reserve
      }
    } else if (rifleStash.reserve != null) {
      rifle.reserve = rifleStash.reserve;
      rifleStash.reserve = null;
    }
  }

  function requestSwap(to) {
    if (!to || to === S.active || S.swapTo) return;
    if (rifle.state === 'reload' && S.active === 'rifle') return; // let the mag change finish
    S.swapTo = to;
    S.reload = null;
    G.events.emit('weapon:swap', { to });
  }

  // ---------- firing ----------
  const tmpDir = new Vector3();
  const origin = new Vector3();
  const muzzleW = new Vector3();
  const endP = new Vector3();
  const shellPos = new Vector3();
  const shellVel = new Vector3();
  function fire() {
    const P = G.player;
    const cam = G.camera;
    S.ammo--;
    S.cool = SHOTGUN.pump;
    S.pumpT = 0;
    S.reload = null;
    S.shotsFired++;
    origin.copy(P.eye || cam.position);
    gun.updateWorldMatrix(true, false);
    muzzleW.copy(MUZZLE).applyMatrix4(gun.matrixWorld);
    const spread = lerp(SHOTGUN.spreadHip, SHOTGUN.spreadAds, rifle.ads || 0);
    let hits = 0;
    for (let n = 0; n < SHOTGUN.pellets; n++) {
      // even-ish disc pattern with jitter
      const a = (n / SHOTGUN.pellets) * Math.PI * 2 + Math.random() * 0.8;
      const r = Math.tan(spread) * (n === 0 ? 0.15 : Math.sqrt(0.25 + Math.random() * 0.75));
      tmpDir
        .set(Math.cos(a) * r, Math.sin(a) * r, -1)
        .normalize()
        .applyQuaternion(cam.quaternion);
      let res = null;
      try {
        res = G.combat.playerShot(origin, tmpDir, { damage: SHOTGUN.pelletDamage, range: SHOTGUN.range });
      } catch {}
      if (res && res.enemy) hits++;
      if (n % 3 === 0 && G.fx && G.fx.tracer) {
        if (res && res.point) endP.copy(res.point);
        else endP.copy(origin).addScaledVector(tmpDir, SHOTGUN.range);
        G.fx.tracer(muzzleW, endP);
      }
    }
    tmpDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
    try {
      G.render.lightPool.flash(muzzleW, 0xffb060, 90, 12, 0.07);
    } catch {}
    try {
      G.fx.smoke && G.fx.smoke(muzzleW, { size: 0.25, life: 0.7 });
    } catch {}
    G.events.emit('weapon:fire', { origin, dir: tmpDir, muzzle: muzzleW, ads: rifle.ads || 0, shotgun: true, hits });
    const ads = rifle.ads || 0;
    if (P.addRecoil) P.addRecoil(0.032 * lerp(1, 0.75, ads), (Math.random() - 0.5) * 0.012);
    if (P.addShake) P.addShake(0.4 * lerp(1, 0.7, ads));
    S.kickV += 9;
    S.flashT = 0.05;
    flash.rotation.z = Math.random() * Math.PI;
    const s = 0.85 + Math.random() * 0.4;
    flash.scale.set(s, s, 0.8 + Math.random() * 0.5);
  }

  function ejectShell() {
    if (!G.fx || !G.fx.shell) return;
    gun.updateWorldMatrix(true, false);
    shellPos.copy(EJECT).applyMatrix4(gun.matrixWorld);
    shellVel.set(2.2 + Math.random(), 1.4 + Math.random() * 0.6, 0.4).applyQuaternion(G.camera.quaternion);
    if (G.player && G.player.vel) shellVel.add(G.player.vel);
    G.fx.shell(shellPos, shellVel);
  }

  function startReload() {
    if (S.reload || S.ammo >= SHOTGUN.tube || S.reserve <= 0 || S.swapTo) return;
    S.reload = { t: 0, next: SHOTGUN.reloadStart, loaded: 0 };
    G.events.emit('weapon:reload', { phase: 'start', empty: S.ammo <= 0, shotgun: true });
  }

  // ---------- input ----------
  let wheelSwap = null;
  window.addEventListener(
    'wheel',
    (e) => {
      if (!G.game || G.game.state !== 'playing') return;
      if (Math.abs(e.deltaY) < 4) return;
      wheelSwap = S.active === 'rifle' ? 'shotgun' : 'rifle';
    },
    { passive: true },
  );

  G.events.on('mission:start', () => {
    S.active = 'rifle';
    S.swapTo = null;
    S.swapT = 0;
    S.ammo = SHOTGUN.tube;
    S.reserve = SHOTGUN.reserve;
    S.reload = null;
    S.cool = 0;
    S.pumpT = 1;
    rifleStash.reserve = null;
    setShotgunVisible(false);
  });

  // ---------- per-frame ----------
  const armOff = new Vector3();
  function update(dt) {
    const I = G.input;
    const playing = G.game && G.game.state === 'playing' && G.player && G.player.alive !== false;

    // swap requests
    if (playing && I && I.pressed) {
      if (I.pressed('slot1')) requestSwap('rifle');
      if (I.pressed('slot2')) requestSwap('shotgun');
      if (I.pressed('swap')) requestSwap(S.active === 'rifle' ? 'shotgun' : 'rifle');
    }
    if (wheelSwap) {
      if (playing) requestSwap(wheelSwap);
      wheelSwap = null;
    }

    // lower -> switch -> raise
    if (S.swapTo) {
      S.swapT = Math.min(1, S.swapT + dt / (SHOTGUN.swapTime / 2));
      if (S.swapT >= 1) {
        S.active = S.swapTo;
        S.swapTo = null;
        setShotgunVisible(S.active === 'shotgun');
        G.events.emit('weapon:swapped', { to: S.active });
      }
    } else S.swapT = Math.max(0, S.swapT - dt / (SHOTGUN.swapTime / 2));

    const holding = S.active === 'shotgun';
    S.cool = Math.max(0, S.cool - dt);

    if (holding && playing && I) {
      const firing = !!I.fire;
      const edge = firing && !S.prevFire;
      S.prevFire = firing;
      if (I.pressed && I.pressed('reload')) startReload();
      if (edge && S.swapT <= 0) {
        if (S.ammo > 0 && S.cool <= 0) fire();
        else if (S.ammo <= 0 && S.cool <= 0) {
          G.events.emit('weapon:dry', {});
          startReload();
        }
      }
      // auto reload when the tube runs dry
      if (S.ammo <= 0 && S.cool <= 0 && !S.reload && S.reserve > 0) startReload();
      // shell-by-shell reload; firing interrupts it (handled in fire())
      if (S.reload) {
        const R = S.reload;
        R.t += dt;
        if (R.t >= R.next) {
          if (S.ammo < SHOTGUN.tube && S.reserve > 0) {
            S.ammo++;
            S.reserve--;
            R.loaded++;
            R.next += SHOTGUN.reloadShell;
            G.events.emit('weapon:shell', {});
          }
          if (S.ammo >= SHOTGUN.tube || S.reserve <= 0) {
            S.reload = null;
            G.events.emit('weapon:reload', { phase: 'done', shotgun: true });
          }
        }
      }
    } else S.prevFire = false;

    // pump animation: back then forward, shell out at the back stroke
    if (S.pumpT < 1) {
      const before = S.pumpT;
      S.pumpT = Math.min(1, S.pumpT + dt / (SHOTGUN.pump * 0.75));
      if (before < 0.35 && S.pumpT >= 0.35) {
        G.events.emit('weapon:pump', { phase: 'back' });
        ejectShell();
      }
      if (before < 0.62 && S.pumpT >= 0.62) G.events.emit('weapon:pump', { phase: 'fwd' });
    }
    // 0..1..0 stroke, delayed so the shot reads first
    const p = S.pumpT;
    const stroke = p < 0.2 ? 0 : p < 0.45 ? smooth((p - 0.2) / 0.25) : p < 0.62 ? 1 : 1 - smooth((p - 0.62) / 0.3);
    pump.position.z = stroke * 0.075;

    // kick spring
    S.kickV += (-S.kick * 260 - S.kickV * 20) * dt;
    S.kick += S.kickV * dt;
    sg.position.z = Math.max(0, S.kick) * 0.012;
    sg.rotation.x = S.kick * 0.022;

    // muzzle flash
    S.flashT = Math.max(0, S.flashT - dt);
    flash.visible = flashCore.visible = holding && S.flashT > 0;

    // reload pose: roll the gun, left hand dips to the loading port per shell
    let roll = 0;
    let hand = 0;
    if (holding && S.reload) {
      roll = Math.min(1, S.reload.t / 0.25);
      const ph = ((S.reload.t - S.reload.next + SHOTGUN.reloadShell) / SHOTGUN.reloadShell) % 1;
      hand = S.reload.t > SHOTGUN.reloadStart ? Math.sin(Math.max(0, Math.min(1, ph)) * Math.PI) : 0;
    }
    gunPose(roll, stroke, hand, dt);
  }

  // additive offsets applied after the rifle system has posed the gun this frame
  let rollS = 0;
  function gunPose(roll, stroke, hand, dt) {
    rollS += (roll - rollS) * Math.min(1, dt * 12);
    const low = smooth(S.swapT);
    gun.position.y -= low * 0.22;
    gun.position.z += low * 0.05;
    gun.rotation.x -= low * 0.75;
    gun.rotation.z += rollS * 0.38;
    gun.rotation.x += rollS * 0.08;
    if (leftArm) {
      // the rifle only re-poses this arm during its own reload, so apply our offset as a delta
      leftArm.position.sub(armOff);
      if (S.active === 'shotgun') armOff.set(hand * 0.02, -hand * 0.035, stroke * 0.075 + hand * 0.2);
      else armOff.set(0, 0, 0);
      leftArm.position.add(armOff);
    }
  }

  // rifle ammo pickups/resupply land in the stash while the shotgun is out
  function addRifleAmmo(n) {
    if (rifleStash.reserve != null) rifleStash.reserve += n;
    else rifle.addAmmo(n);
  }
  const api = { update, state: S, swap: requestSwap, addRifleAmmo, model: sg, SHOTGUN };
  return api;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smooth(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
