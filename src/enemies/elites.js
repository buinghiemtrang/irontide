// New threats built on top of the existing Hound:
//  - Shield Hound: carries a riot plate that soaks shots from the front.
//    Flank it, break the plate, or EMP it (a stunned hound drops its guard).
//  - The Warden: an oversized armoured Hound the Harbormaster sends after the
//    last relay is cut. Optional to kill, but it hunts you to the boat.
//
// Everything is added from the outside: spawned enemies are decorated
// (extra meshes, scale) and their damage() is wrapped.
import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';

export const ELITES = {
  shieldChance: [0, 0.25, 0.4], // by wave index (0 = patrol)
  shieldHp: 170,
  shieldBlock: 0.9, // fraction of damage stopped by the plate
  shieldArc: 0.45, // cos of the half-angle the plate covers (~63 deg)
  warden: { scale: 1.75, hp: 1100, armour: 0.45, delay: 6 },
};

const tmp = new Vector3();
const fwd = new Vector3();

export function createElites(G) {
  const diff = () => (G.difficulty && G.difficulty.id) || 'normal';
  const diffHp = () => ({ easy: 0.7, normal: 1, hard: 1.35 })[diff()];
  let wave = 0;
  const decorated = new WeakSet();

  // ---------- meshes ----------
  const plateMat = new MeshStandardMaterial({ name: 'riot_plate', color: 0x3a3f43, metalness: 0.75, roughness: 0.42 });
  const stripeMat = new MeshStandardMaterial({
    name: 'riot_stripe',
    color: 0xd7a21a,
    roughness: 0.6,
    emissive: new Color(0.15, 0.1, 0),
  });
  const lampMat = new MeshStandardMaterial({
    color: 0x220000,
    emissive: new Color(3.2, 0.25, 0.1),
    emissiveIntensity: 1,
  });
  function makeShield() {
    const g = new Group();
    g.name = 'riot-shield';
    const plate = new Mesh(new BoxGeometry(0.62, 0.52, 0.035), plateMat);
    plate.castShadow = true;
    g.add(plate);
    for (const x of [-0.2, 0, 0.2]) {
      const s = new Mesh(new BoxGeometry(0.06, 0.5, 0.04), stripeMat);
      s.position.set(x, 0, 0.004);
      s.rotation.z = 0.5;
      g.add(s);
    }
    const slit = new Mesh(
      new BoxGeometry(0.3, 0.035, 0.045),
      new MeshStandardMaterial({ color: 0x0b0c0d, roughness: 0.3 }),
    );
    slit.position.set(0, 0.16, 0.002);
    g.add(slit);
    // hound faces +Z in its own space: plate sits in front of the chest
    g.position.set(0, 0.62, 0.55);
    g.rotation.x = -0.12;
    return g;
  }
  function makeWardenKit() {
    const g = new Group();
    g.name = 'warden-kit';
    const back = new Mesh(new BoxGeometry(0.5, 0.18, 0.7), plateMat);
    back.position.set(0, 0.95, -0.05);
    g.add(back);
    for (const x of [-0.18, 0.18]) {
      const l = new Mesh(new BoxGeometry(0.06, 0.06, 0.06), lampMat);
      l.position.set(x, 1.06, 0.28);
      g.add(l);
    }
    const plate = makeShield();
    plate.scale.set(1.1, 1.15, 1.6);
    g.add(plate);
    return g;
  }

  function facing(e) {
    // hound rig yaw: model forward is +Z
    const yaw = e.yaw ?? (e.rig && e.rig.group ? e.rig.group.rotation.y : 0);
    return fwd.set(Math.sin(yaw), 0, Math.cos(yaw));
  }

  // ---------- decorate ----------
  function wrapDamage(e) {
    const orig = e.damage;
    e.damage = function (amount, point, dir, part) {
      let amt = amount;
      const stunned = (e.stunT || 0) > 0;
      // riot plate: blocks shots whose travel direction points against the hound's facing
      if (e.shield && e.shield.hp > 0 && dir && !stunned) {
        const f = facing(e);
        tmp.copy(dir).setY(0).normalize();
        if (tmp.dot(f) < -ELITES.shieldArc) {
          const soaked = amt * ELITES.shieldBlock;
          amt -= soaked;
          e.shield.hp -= soaked;
          try {
            G.fx.sparks(point || e.pos, tmp.clone().negate(), 6);
          } catch {}
          try {
            G.audio.play('impact_metal', { pos: point || e.pos, gain: 0.6, pitch: 0.85 + Math.random() * 0.2 });
          } catch {}
          G.events.emit('elite:block', { enemy: e });
          if (e.shield.hp <= 0) breakShield(e);
        }
      }
      if (e.warden) amt *= 1 - ELITES.warden.armour * (stunned ? 0.4 : 1);
      return orig.call(this, amt, point, dir, part);
    };
  }

  function breakShield(e) {
    const m = e.shield && e.shield.mesh;
    if (!m) return;
    m.parent && m.parent.remove(m);
    e.shield.mesh = null;
    try {
      tmp.copy(e.pos);
      tmp.y += 0.7;
      G.fx.sparks(tmp, new Vector3(0, 1, 0), 30);
      G.fx.smoke(tmp, { size: 0.4, life: 1 });
      G.audio.play('container_bang', { pos: tmp, gain: 0.8, pitch: 1.3 });
    } catch {}
    G.events.emit('elite:shieldBroken', { enemy: e });
  }

  function giveShield(e) {
    const group = e.rig && e.rig.group;
    if (!group) return;
    const mesh = makeShield();
    group.add(mesh);
    e.shield = { hp: ELITES.shieldHp * diffHp(), mesh };
  }

  function clearDecor(e) {
    const group = e.rig && e.rig.group;
    if (group) {
      for (const c of [...group.children]) if (c.name === 'riot-shield' || c.name === 'warden-kit') group.remove(c);
      group.scale.setScalar(1);
    }
    e.shield = null;
    e.warden = false;
  }

  G.events.on('enemy:spawn', ({ enemy: e }) => {
    if (!e || e.type !== 'hound') return;
    if (!decorated.has(e)) {
      decorated.add(e);
      wrapDamage(e);
    }
    clearDecor(e); // pooled enemies are reused
    if (pendingWarden) {
      pendingWarden = false;
      makeWarden(e);
      return;
    }
    const chance =
      ELITES.shieldChance[Math.min(wave, ELITES.shieldChance.length - 1)] *
      (diff() === 'hard' ? 1.4 : diff() === 'easy' ? 0.5 : 1);
    if (Math.random() < chance) giveShield(e);
  });

  // ---------- the Warden ----------
  let pendingWarden = false;
  let warden = null;
  let wardenTimer = -1;
  const bar = document.createElement('div');
  bar.className = 'boss-bar';
  bar.innerHTML = '<div class="boss-name">Harbormaster’s Warden</div><div class="boss-track"><i></i></div>';
  bar.hidden = true;
  (document.getElementById('ui') || document.body).appendChild(bar);
  const barFill = bar.querySelector('i');

  function makeWarden(e) {
    const group = e.rig.group;
    group.scale.setScalar(ELITES.warden.scale);
    group.add(makeWardenKit());
    e.warden = true;
    e.hp = e.maxHp = Math.round(ELITES.warden.hp * diffHp());
    if ('hpMax' in e) e.hpMax = e.hp;
    e.shield = { hp: ELITES.shieldHp * 2.2 * diffHp(), mesh: group.getObjectByName('riot-shield') };
    warden = e;
    bar.hidden = false;
    G.events.emit('warden:spawn', { enemy: e });
    try {
      G.audio.play('foghorn', { gain: 0.9, pitch: 0.7 });
      G.hud && G.hud.message && G.hud.message('The Harbormaster has sent its Warden', 3.5);
    } catch {}
  }

  function spawnWarden() {
    const lv = G.level || {};
    const spawns = (lv.enemySpawns || []).filter((s) => s.type === 'ground');
    const me = G.player.pos;
    let best = null;
    let bestScore = -1e9;
    for (const s of spawns) {
      const d = Math.hypot(s.pos.x - me.x, s.pos.z - me.z);
      const score = d > 18 && d < 45 ? 60 - Math.abs(d - 28) : -d;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    const pos = best ? best.pos.clone() : me.clone().add(new Vector3(20, 0, 0));
    pendingWarden = true;
    let e = null;
    try {
      e = G.enemies.spawn('hound', pos, { state: 'alert', target: G.player.pos.clone() });
    } catch {}
    if (!e) pendingWarden = false;
  }

  G.events.on('objective:done', (e) => {
    wave = Math.min(2, (e && e.index) || 0);
  });
  G.events.on('objective:all', () => {
    wardenTimer = ELITES.warden.delay;
  });
  G.events.on('mission:start', () => {
    wave = 0;
    wardenTimer = -1;
    pendingWarden = false;
    if (warden) clearDecor(warden);
    warden = null;
    bar.hidden = true;
  });
  G.events.on('enemy:killed', (ev) => {
    if (ev && ev.enemy === warden) {
      G.events.emit('warden:down', {});
      G.run && (G.run.wardenDown = true);
      bar.hidden = true;
      try {
        G.hud && G.hud.message && G.hud.message('Warden down', 3);
      } catch {}
      warden = null;
    }
  });

  function update(dt) {
    if (wardenTimer > 0 && G.game && G.game.state === 'playing') {
      wardenTimer -= dt;
      if (wardenTimer <= 0) spawnWarden();
    }
    if (warden) {
      if (!warden.alive) {
        bar.hidden = true;
        if (!warden.active) warden = null;
      } else {
        const max = warden.maxHp || 1;
        barFill.style.transform = `scaleX(${Math.max(0, warden.hp / max)})`;
        bar.hidden = !(G.game && G.game.state === 'playing');
      }
    }
  }

  return {
    update,
    spawnWarden,
    giveShield,
    get warden() {
      return warden;
    },
  };
}
