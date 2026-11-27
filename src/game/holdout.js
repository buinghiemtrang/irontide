// Holdout mode: no relays, no boat. Survive escalating waves on the quay.
// Waves are queued through the mission's own spawner, so spawn points,
// stagger and the alive cap behave exactly like the story mission.
import { awardBadge } from './records.js';

export const HOLDOUT = {
  firstBreak: 6,
  breakTime: 10,
  wardenEvery: 5,
  stagger: 1.1,
  refill: { rifle: 60, shells: 12, emp: 1, empMax: 3, heal: 40 },
};
const KEY = 'irontide.holdout.v1';

function composition(wave) {
  return {
    gull: 2 + Math.floor(wave * 0.8),
    hound: Math.max(0, Math.floor((wave - 1) * 0.7)) + (wave >= 2 ? 1 : 0),
  };
}

function loadBests() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}
function saveBests(b) {
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {}
}

export function createHoldout(G) {
  const S = { wave: 0, phase: 'idle', timer: 0, total: 0, killed: 0, score: 0, kills: 0 };
  const diffMul = () => ({ easy: 0.7, normal: 1, hard: 1.4 })[(G.difficulty && G.difficulty.id) || 'normal'];
  const active = () => G.mode === 'holdout';
  const fmt = (t) => {
    t = Math.max(0, Math.round(t));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  };

  function objective() {
    if (S.phase === 'break')
      return S.wave === 0
        ? `Hold the quay — first wave in ${Math.ceil(S.timer)}`
        : `Wave ${S.wave} cleared — next in ${Math.ceil(S.timer)}`;
    if (S.phase === 'fight') return `Hold the quay — wave ${S.wave} · ${Math.max(0, S.total - S.killed)} left`;
    return 'Hold the quay';
  }

  function startWave() {
    S.wave++;
    S.phase = 'fight';
    S.killed = 0;
    const c = composition(S.wave);
    const list = [];
    for (let k = 0; k < c.gull; k++) list.push('gull');
    for (let k = 0; k < c.hound; k++) list.splice(Math.min(list.length, 1 + k * 2), 0, 'hound');
    list.forEach((type, n) => G.game.queueSpawn(type, 1 + n * HOLDOUT.stagger));
    S.total = list.length;
    if (G.elites && G.elites.setWave) G.elites.setWave(Math.min(2, Math.floor(S.wave / 2)));
    if (S.wave % HOLDOUT.wardenEvery === 0 && G.elites && G.elites.spawnWarden) {
      S.total++;
      setTimeout(() => active() && S.phase === 'fight' && G.elites.spawnWarden(), 3500);
    }
    G.events.emit('holdout:wave', { wave: S.wave });
    G.hud && G.hud.warn && G.hud.warn(`Wave ${S.wave}`, 3);
    if (S.wave >= 10) awardBadge('seawall');
  }

  function clearWave() {
    S.phase = 'break';
    S.timer = HOLDOUT.breakTime;
    S.score += Math.round(250 * S.wave * diffMul());
    // resupply between waves
    const R = HOLDOUT.refill;
    try {
      if (G.loadout) {
        G.loadout.state.reserve += R.shells;
        G.loadout.addRifleAmmo(R.rifle);
      } else if (G.weapon && G.weapon.addAmmo) G.weapon.addAmmo(R.rifle);
    } catch {}
    if (G.emp && G.emp.state) G.emp.state.count = Math.min(R.empMax, G.emp.state.count + R.emp);
    if (G.player && G.player.alive)
      G.player.health = Math.min(G.player.maxHealth || 100, (G.player.health || 0) + R.heal);
    G.hud && G.hud.message && G.hud.message(`Wave ${S.wave} cleared — resupplied`, 3);
    G.events.emit('holdout:clear', { wave: S.wave });
  }

  G.events.on('mission:start', () => {
    S.wave = 0;
    S.total = S.killed = S.kills = S.score = 0;
    S.phase = active() ? 'break' : 'idle';
    S.timer = HOLDOUT.firstBreak;
    restoreDebrief();
  });
  G.events.on('enemy:killed', () => {
    if (!active() || S.phase !== 'fight') return;
    S.killed++;
    S.kills++;
    S.score += Math.round(100 * (1 + S.wave * 0.1) * diffMul());
  });

  let objT = 0;
  function update(dt) {
    if (!active() || !G.game || G.game.state !== 'playing') return;
    if (S.phase === 'break') {
      S.timer -= dt;
      if (S.timer <= 0) startWave();
    } else if (S.phase === 'fight') {
      if (S.killed >= S.total) clearWave();
    }
    objT -= dt;
    if (objT <= 0) {
      objT = 0.25;
      G.game.refreshObjective && G.game.refreshObjective();
    }
  }

  // ---------- end of run: reuse the debrief card ----------
  let saved = null;
  function restoreDebrief() {
    if (!saved) return;
    for (const [el, html] of saved) el.innerHTML = html;
    saved = null;
  }
  function finish(time) {
    S.phase = 'idle';
    const stats = (G.combat && G.combat.stats) || { shots: 0, hits: 0 };
    const acc = stats.shots > 0 ? Math.min(1, stats.hits / stats.shots) : null;
    const waveReached = Math.max(0, S.wave - (S.killed >= S.total ? 0 : 1));
    const key = ((G.condition && G.condition.id) || 'dawn') + ':' + ((G.difficulty && G.difficulty.id) || 'normal');
    const bests = loadBests();
    const prev = bests[key] || { wave: 0, score: 0, runs: 0 };
    const isNew = { wave: waveReached > prev.wave, score: S.score > prev.score };
    bests[key] = {
      wave: Math.max(prev.wave, waveReached),
      score: Math.max(prev.score, S.score),
      runs: (prev.runs || 0) + 1,
    };
    saveBests(bests);

    const menu = G.game.menus;
    if (menu && menu.setDebrief)
      menu.setDebrief({ time, accuracy: acc, kills: S.kills, retries: 0, rating: '', rec: null });
    // re-label the card for holdout (restored on the next deploy)
    const root = document.querySelector('[data-f="best"]')
      ? document.querySelector('[data-f="best"]').parentElement
      : null;
    if (!root) return;
    saved = [];
    // only text is swapped (elements stay, the menu keeps references to them)
    const keepText = (el, text) => {
      if (!el) return;
      saved.push([el, el.innerHTML]);
      el.textContent = text;
    };
    keepText(root.querySelector('.m-h'), 'Quay overrun');
    keepText(root.querySelector('.m-k'), 'Berth 4 \u00B7 Holdout');
    const rows = root.querySelectorAll('.m-stats:not(.small) > div');
    const set = (n, k, v) => {
      const r = rows[n];
      if (!r) return;
      keepText(r.querySelector('dt'), k);
      r.querySelector('dd').textContent = v;
    };
    set(0, 'Time', fmt(time));
    set(1, 'Waves held', String(waveReached));
    set(2, 'Machines destroyed', String(S.kills));
    set(3, 'Accuracy', acc == null ? '\u2014' : Math.round(acc * 100) + '%');
    keepText(root.querySelector('.m-rating span'), 'Score');
    const rb = root.querySelector('.m-rating b');
    if (rb) rb.textContent = S.score.toLocaleString('en-US');
    const tag = (on) => (on ? ' <em class="m-new">New</em>' : '');
    const best = root.querySelector('[data-f="best"]');
    const b = bests[key];
    const [cond, diff] = key.split(':').map((x) => x[0].toUpperCase() + x.slice(1));
    best.innerHTML =
      `<div class="m-k">Holdout best · ${cond} · ${diff}</div>` +
      `<dl class="m-stats small"><div><dt>Waves</dt><dd>${b.wave}${tag(isNew.wave && prev.runs > 0)}</dd></div>` +
      `<div><dt>Score</dt><dd>${b.score.toLocaleString('en-US')}${tag(isNew.score && prev.runs > 0)}</dd></div>` +
      `<div><dt>Runs</dt><dd>${b.runs}</dd></div><div><dt>Mode</dt><dd>Holdout</dd></div></dl>`;
    const badges = root.querySelector('[data-f="badges"]');
    if (badges) badges.innerHTML = '';
    G.events.emit('holdout:end', { wave: waveReached, score: S.score });
  }

  return { update, objective, finish, state: S };
}
