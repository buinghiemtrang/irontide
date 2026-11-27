import { PLAYER_BODY, QUALITY_PRESETS } from '../core/config.js';
import { CONDITIONS, CONDITION_IDS } from '../core/conditions.js';
import { badgeProgress } from '../game/records.js';

var SETTINGS_KEY = 'irontide.settings.v1';
var DEFAULT_SETTINGS = {
  quality: 'auto',
  sens: 1,
  invertY: !1,
  volume: 0.8,
  fov: PLAYER_BODY.fov,
  cond: 'dawn',
  diff: 'normal',
};
var QUALITY_LEVELS = ['low', 'medium', 'high', 'ultra'];
function loadSettings() {
  let i = { ...DEFAULT_SETTINGS };
  try {
    let e = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    e &&
      typeof e == 'object' &&
      ((e.quality === 'auto' || QUALITY_LEVELS.includes(e.quality)) && (i.quality = e.quality),
      Number.isFinite(e.sens) && (i.sens = Math.min(3, Math.max(0.2, e.sens))),
      (i.invertY = !!e.invertY),
      Number.isFinite(e.volume) && (i.volume = Math.min(1, Math.max(0, e.volume))),
      Number.isFinite(e.fov) && (i.fov = Math.min(95, Math.max(60, e.fov))),
      CONDITION_IDS.includes(e.cond) && (i.cond = e.cond),
      ['easy', 'normal', 'hard'].includes(e.diff) && (i.diff = e.diff),
      ['mission', 'holdout'].includes(e.mode) && (i.mode = e.mode));
  } catch {}
  return i;
}
function saveSettings(i) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(i));
  } catch {}
}
var $C = `
  <dl class="keys">
    <div><dt>Move</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
    <div><dt>Look</dt><dd>Mouse</dd></div>
    <div><dt>Fire</dt><dd>Left button</dd></div>
    <div><dt>Aim</dt><dd>Right button</dd></div>
    <div><dt>Reload</dt><dd><kbd>R</kbd></dd></div>
    <div><dt>Cut relay</dt><dd>Hold <kbd>E</kbd></dd></div>
    <div><dt>Jump</dt><dd><kbd>Space</kbd></dd></div>
    <div><dt>Sprint</dt><dd><kbd>Shift</kbd></dd></div>
    <div><dt>Crouch</dt><dd><kbd>C</kbd> or <kbd>Ctrl</kbd></dd></div>
    <div><dt>Melee</dt><dd><kbd>V</kbd></dd></div>
    <div><dt>Flashlight</dt><dd><kbd>F</kbd></dd></div>
    <div><dt>EMP grenade</dt><dd><kbd>G</kbd></dd></div>
    <div><dt>Rifle / Shotgun</dt><dd><kbd>1</kbd> <kbd>2</kbd> or wheel</dd></div>
    <div><dt>Pause</dt><dd><kbd>Esc</kbd> or <kbd>P</kbd></dd></div>
  </dl>`;
var ZC = `
  <dl class="keys">
    <div><dt>Move</dt><dd>Left thumb, anywhere</dd></div>
    <div><dt>Look</dt><dd>Drag the right side</dd></div>
    <div><dt>Fire</dt><dd>Hold FIRE, drag to track</dd></div>
    <div><dt>Aim</dt><dd>AIM toggles</dd></div>
    <div><dt>Reload</dt><dd>RLD</dd></div>
    <div><dt>Jump</dt><dd>JUMP</dd></div>
    <div><dt>Cut relay</dt><dd>Hold USE at a relay</dd></div>
    <div><dt>Sprint</dt><dd>Push the stick fully forward</dd></div>
  </dl>`;
function createMenu(i, e) {
  let t = document.getElementById('ui'),
    n = loadSettings(),
    s = document.createElement('div');
  ((s.className = 'menu'),
    (s.dataset.screen = 'none'),
    (s.innerHTML = `
    <div class="m-veil"></div>
    <div class="m-bars"><i></i><i></i></div>

    <section class="m-screen m-title lobby" data-s="title" aria-label="Irontide">
      <div class="lb-pattern" aria-hidden="true"></div>
      <header class="lb-top">
        <div class="lb-brand">${ICON.logo}<span>Irontide</span></div>
        <div class="lb-center">
          <span class="lb-clock">${clockOf(i)}</span>${ICON.diamondX}<span class="lb-loc">Berth 4</span>
        </div>
        <div class="lb-right">
          <span class="lb-badges" data-f="badge-count">${badgeText()}</span>
          <button class="lb-gear" data-act="settings" aria-label="Settings">${ICON.gear}</button>
        </div>
      </header>
      <nav class="lb-tabs" role="group" aria-label="Mode">${[
        ['mission', 'Mission'],
        ['holdout', 'Holdout'],
      ]
        .map(
          ([m, label]) =>
            `<button class="lb-tab" data-mode="${m}" aria-pressed="${m === (i.mode || 'mission')}">${label}</button>`,
        )
        .join('')}</nav>
      <div class="lb-toggle" role="group" aria-label="Difficulty">
        <span class="lb-toggle-k">Difficulty</span>
        <div class="cond-seg">${Object.values(i.difficulties || {})
          .map((d) => `<button data-diff="${d.id}" aria-pressed="${d.id === diffOf(i)}">${d.label}</button>`)
          .join('')}</div>
      </div>
      <div class="lb-cards" role="group" aria-label="Conditions">${CONDITION_IDS.map(
        (c) => `<button class="lb-card c-${c}" data-cond="${c}" aria-pressed="${c === condOf(i)}">
          <span class="lb-art" aria-hidden="true">${CONDITIONS[c].label}</span>
          <span class="lb-ic">${ICON[c]}</span>
          <span class="lb-state">${c === condOf(i) ? 'Selected' : 'Select'}</span>
          <span class="lb-name">${ICON.chev}${CONDITIONS[c].label}</span>
          <span class="lb-meta">${CONDITIONS[c].clock} \xB7 ${COND_NOTE[c]}</span>
        </button>`,
      ).join('')}</div>
      <p class="lb-desc">${ICON.info}<span data-f="mode-desc">${modeDesc(i.mode)}</span></p>
      <div class="lb-actions">
        <button class="btn ghost" data-act="controls">Controls ${ICON.keys}</button>
        <i class="lb-wire"></i>
        <button class="btn primary" data-act="deploy">Deploy ${ICON.diamondX}</button>
        <i class="lb-wire"></i>
        <button class="btn ghost" data-act="settings">Settings ${ICON.gear}</button>
      </div>
      <p class="m-note">Every surface, machine and sound is generated in your browser. Nothing is downloaded.</p>
    </section>

    <section class="m-screen m-card" data-s="paused" aria-label="Paused">
      <div class="m-k">Operation on hold</div>
      <h2 class="m-h">Paused</h2>
      <p class="m-line" data-f="lookmode"></p>
      <div class="m-actions col">
        <button class="btn primary" data-act="resume">Resume</button>
        <button class="btn" data-act="settings">Settings</button>
        <button class="btn" data-act="controls">Controls</button>
        <button class="btn" data-act="restart">Restart mission</button>
      </div>
    </section>

    <section class="m-screen m-card m-dead" data-s="dead" aria-label="Signal lost">
      <div class="m-k">Breacher down</div>
      <h2 class="m-h">Signal lost</h2>
      <dl class="m-stats"><div><dt>Time survived</dt><dd data-f="dead-time">00:00</dd></div><div><dt>Relays cut</dt><dd data-f="dead-relays">0/3</dd></div></dl>
      <div class="m-actions col"><button class="btn primary" data-act="retry">Retry</button></div>
    </section>

    <section class="m-screen m-card m-debrief" data-s="complete" aria-label="Debrief">
      <div class="m-k">Berth 4 \xB7 Debrief</div>
      <h2 class="m-h">Irontide is dark</h2>
      <div class="m-rating"><span>Rating</span><b data-f="rating">Clean</b></div>
      <dl class="m-stats">
        <div><dt>Time</dt><dd data-f="time">00:00</dd></div>
        <div><dt>Accuracy</dt><dd data-f="acc">0%</dd></div>
        <div><dt>Machines destroyed</dt><dd data-f="kills">0</dd></div>
        <div><dt>Retries</dt><dd data-f="retries">0</dd></div>
      </dl>
      <div class="m-best" data-f="best"></div>
      <ul class="m-badges" data-f="badges"></ul>
      <div class="m-actions col"><button class="btn primary" data-act="redeploy">Redeploy</button></div>
    </section>

    <div class="panel" role="dialog" aria-modal="true" aria-label="Settings and controls" tabindex="-1" hidden>
      <header class="panel-h">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-tab="settings" aria-selected="true">Settings</button>
          <button class="tab" role="tab" data-tab="controls" aria-selected="false">Controls</button>
        </div>
        <button class="btn small" data-act="close-panel">Close</button>
      </header>
      <div class="panel-b" data-pane="settings">
        <div class="row"><label id="l-q">Graphics quality</label>
          <div class="seg" role="group" aria-labelledby="l-q">${QUALITY_LEVELS.map((U) => `<button data-q="${U}" aria-pressed="false">${U}</button>`).join('')}</div></div>
        <div class="row"><label for="s-sens">Mouse sensitivity</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
        <div class="row"><label id="l-inv">Invert Y</label><button class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>Off</span></button></div>
        <div class="row"><label for="s-vol">Master volume</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
        <div class="row"><label for="s-fov">Field of view</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
        <div class="row" data-row="fs"><label id="l-fs">Display</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">Enter fullscreen</span></button></div>
        <p class="panel-note" data-f="qnote"></p>
      </div>
      <div class="panel-b" data-pane="controls" hidden>
        <h3>Keyboard \xB7 Mouse</h3>${$C}
        <p class="panel-note">If the browser will not capture the mouse, hold a mouse button and drag to look (left also fires, right also aims). Arrow keys or <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> turn, <kbd>Enter</kbd> fires.</p>
        <h3>Touch</h3>${ZC}
        <h3>Gamepad</h3>
        <p class="panel-note">Sticks move and look \xB7 RT fire \xB7 LT aim \xB7 A jump \xB7 B crouch \xB7 X reload \xB7 Y cut relay \xB7 D-pad up flashlight \xB7 LB EMP grenade \xB7 D-pad left/right switch weapon \xB7 L3 sprint \xB7 Start pause.</p>
      </div>
    </div>

    <div class="loc-card" aria-hidden="true"><i></i><b>Irontide Terminal \xB7 Berth 4 \xB7 ${clockOf(i)}</b><span>Port Authority Breach Unit \u2014 one breacher, no backup</span></div>
  `),
    t.appendChild(s));
  let o = (U) => s.querySelector(U),
    r = (U) => [...s.querySelectorAll(U)],
    a = o('.panel'),
    l = o('.loc-card'),
    c = (U) => s.querySelector(`[data-f="${U}"]`),
    u = o('#s-sens'),
    h = o('#s-vol'),
    f = o('#s-fov'),
    p = 'none',
    d = null;
  function v(U) {
    if (
      ((!U || U === 'sens') && (i.input.sensitivity = n.sens),
      (!U || U === 'invertY') && (i.input.invertY = n.invertY),
      !U || U === 'volume')
    )
      try {
        i.audio && i.audio.setVolume && i.audio.setVolume(n.volume);
      } catch (T) {
        console.error(T);
      }
    if (
      ((!U || U === 'fov') && i.player && i.player.setFov && i.player.setFov(n.fov),
      U === 'quality' ||
        (!U && n.quality !== 'auto' && !i.params.shot && !i.params.q && n.quality !== (i.quality && i.quality.name)))
    ) {
      let T = QUALITY_PRESETS[n.quality];
      if (T)
        try {
          i.render && i.render.setQuality ? i.render.setQuality({ ...T }) : (i.quality = { ...T });
        } catch (D) {
          console.error('[game] setQuality failed', D);
        }
    }
  }
  function g() {
    let U = n.quality === 'auto' ? i.quality && i.quality.name : n.quality;
    for (let D of r('.seg button')) D.setAttribute('aria-pressed', String(D.dataset.q === U));
    ((u.value = n.sens),
      (h.value = Math.round(n.volume * 100)),
      (f.value = n.fov),
      (o('[data-o="sens"]').textContent = n.sens.toFixed(2) + '\xD7'),
      (o('[data-o="vol"]').textContent = Math.round(n.volume * 100) + '%'),
      (o('[data-o="fov"]').textContent = Math.round(n.fov) + '\xB0'));
    let T = o('[data-act="invert"]');
    (T.setAttribute('aria-pressed', String(n.invertY)),
      (T.querySelector('span').textContent = n.invertY ? 'On' : 'Off'),
      (c('qnote').textContent =
        n.quality === 'auto'
          ? `Quality was picked for this device (${U || 'default'}). Lower it if the frame rate struggles.`
          : 'Quality changes apply at once; shadows and reflections may take a moment to rebuild.'));
  }
  (u.addEventListener('input', () => {
    ((n.sens = +u.value), v('sens'), g(), saveSettings(n));
  }),
    h.addEventListener('input', () => {
      ((n.volume = +h.value / 100), v('volume'), g(), saveSettings(n));
    }),
    f.addEventListener('input', () => {
      ((n.fov = +f.value), v('fov'), g(), saveSettings(n));
    }));
  let x = o('[data-row="fs"]'),
    y = o('#fs-t'),
    b = () => document.fullscreenElement || document.webkitFullscreenElement || null,
    m = document.getElementById('app') || document.documentElement;
  (m &&
    (m.requestFullscreen || m.webkitRequestFullscreen) &&
    document.fullscreenEnabled !== !1 &&
    document.webkitFullscreenEnabled !== !1) ||
    (x.hidden = !0);
  function _() {
    y.textContent = 'Fullscreen is not available here';
  }
  function M() {
    try {
      if (b()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      let U = (m.requestFullscreen || m.webkitRequestFullscreen).call(m);
      U && U.catch && U.catch(_);
    } catch {
      _();
    }
  }
  let E = () => {
    y.textContent = b() ? 'Exit fullscreen' : 'Enter fullscreen';
  };
  (document.addEventListener('fullscreenchange', E), document.addEventListener('webkitfullscreenchange', E));
  function w(U) {
    ((d = document.activeElement), (a.hidden = !1), s.classList.add('panel-open'), z(U || 'settings'));
    try {
      a.focus({ preventScroll: !0 });
    } catch {}
  }
  function S() {
    return a.hidden
      ? !1
      : ((a.hidden = !0), s.classList.remove('panel-open'), d && d.focus && s.contains(d) ? d.focus() : H(), !0);
  }
  function z(U) {
    for (let T of r('.tab')) T.setAttribute('aria-selected', String(T.dataset.tab === U));
    for (let T of r('.panel-b')) T.hidden = T.dataset.pane !== U;
  }
  function H() {
    let U = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    if (U)
      try {
        U.focus({ preventScroll: !0 });
      } catch {}
  }
  // mode: mission (relays + boat) or holdout (survive waves); applies on the next deploy
  s.addEventListener('click', (U) => {
    let b = U.target.closest('[data-mode]');
    if (!b) return;
    ((n.mode = b.dataset.mode), saveSettings(n), (i.mode = n.mode));
    let md = s.querySelector('[data-f="mode-desc"]');
    md && (md.textContent = modeDesc(n.mode));
    for (let x of s.querySelectorAll('[data-mode]')) x.setAttribute('aria-pressed', String(x === b));
  });
  // difficulty only rescales tuning tables: apply immediately, used on the next deploy
  s.addEventListener('click', (U) => {
    let b = U.target.closest('[data-diff]');
    if (!b) return;
    ((n.diff = b.dataset.diff), saveSettings(n), i.setDifficulty && i.setDifficulty(n.diff));
    for (let x of s.querySelectorAll('[data-diff]')) x.setAttribute('aria-pressed', String(x === b));
  });
  // conditions change the whole scene's lighting, which is built at boot: save and reload
  s.addEventListener('click', (U) => {
    let b = U.target.closest('[data-cond]');
    if (!b || b.dataset.cond === condOf(i)) return;
    ((n.cond = b.dataset.cond), saveSettings(n));
    for (let x of s.querySelectorAll('[data-cond]')) {
      x.setAttribute('aria-pressed', String(x === b));
      let st = x.querySelector('.lb-state');
      st && (st.textContent = x === b ? 'Selected' : 'Select');
    }
    let boot = document.getElementById('boot'),
      msg = document.getElementById('boot-msg');
    (boot && ((boot.hidden = !1), boot.classList.remove('done')),
      msg && (msg.textContent = 'Changing conditions'),
      setTimeout(() => {
        let url = new URL(location.href);
        (url.searchParams.delete('cond'), location.replace(url.toString()));
      }, 120));
  });
  (s.addEventListener('click', (U) => {
    let T = U.target.closest('button');
    if (!T || !s.contains(T)) return;
    if ((i.events.emit('ui:click', {}), T.dataset.q)) {
      ((n.quality = T.dataset.q), v('quality'), g(), saveSettings(n));
      return;
    }
    if (T.dataset.tab) {
      z(T.dataset.tab);
      return;
    }
    let D = T.dataset.act;
    D === 'settings'
      ? w('settings')
      : D === 'controls'
        ? w('controls')
        : D === 'close-panel'
          ? S()
          : D === 'invert'
            ? ((n.invertY = !n.invertY), v('invertY'), g(), saveSettings(n))
            : D === 'fullscreen'
              ? M()
              : D && e[D] && e[D](U);
  }),
    s.addEventListener('mouseover', (U) => {
      let T = U.target.closest('button');
      T && U.relatedTarget && !T.contains(U.relatedTarget) && i.events.emit('ui:hover', {});
    }),
    s.addEventListener('keydown', (U) => {
      if (
        (U.code === 'Escape' && !a.hidden && (S(), U.stopPropagation(), U.preventDefault()),
        U.code === 'Tab' && !a.hidden)
      ) {
        let T = [...a.querySelectorAll('button, input')].filter((G) => G.offsetParent !== null);
        if (!T.length) return;
        let D = T[0],
          C = T[T.length - 1];
        U.shiftKey && document.activeElement === D
          ? (C.focus(), U.preventDefault())
          : !U.shiftKey && document.activeElement === C && (D.focus(), U.preventDefault());
      }
    }));
  let O = (U) => (
      (U = Math.max(0, Math.floor(U))),
      String(Math.floor(U / 60)).padStart(2, '0') + ':' + String(U % 60).padStart(2, '0')
    ),
    q = {
      root: s,
      settings: n,
      fmtTime: O,
      get screen() {
        return p;
      },
      get panelOpen() {
        return !a.hidden;
      },
      closePanel: S,
      show(U) {
        U !== p &&
          ((p = U),
          (s.dataset.screen = U),
          S(),
          s.classList.toggle('open', U !== 'none'),
          U !== 'none'
            ? (g(), setTimeout(H, 30))
            : document.activeElement && s.contains(document.activeElement) && document.activeElement.blur());
      },
      locationCard(U) {
        l.classList.toggle('on', !!U);
      },
      setLookMode(U) {
        c('lookmode').textContent = U || '';
      },
      setDead({ time: U, relays: T, total: D }) {
        ((c('dead-time').textContent = O(U)), (c('dead-relays').textContent = `${T}/${D}`));
      },
      setDebrief({ time: U, accuracy: T, kills: D, retries: C, rating: G, rec: R }) {
        ((c('time').textContent = O(U)),
          (c('acc').textContent = T == null ? '\u2014' : Math.round(T * 100) + '%'),
          (c('kills').textContent = String(D)),
          (c('retries').textContent = String(C)),
          (c('rating').textContent = G),
          fillRecords(c, R, O),
          (c('badge-count').textContent = badgeText()));
      },
      applySettings: v,
    };
  return (g(), q);
}

export { createMenu, loadSettings, saveSettings };

function condOf(G) {
  return (G.condition && G.condition.id) || 'dawn';
}
function clockOf(G) {
  return (G.condition && G.condition.clock) || '05:42';
}
function diffOf(G) {
  return (G.difficulty && G.difficulty.id) || 'normal';
}
function badgeText() {
  let p = badgeProgress();
  return `Badges ${p.have}/${p.total}`;
}
// personal bests + badges on the debrief card
function fillRecords(field, rec, fmtTime) {
  let best = field('best'),
    list = field('badges');
  if (!best || !list) return;
  if (!rec) {
    ((best.innerHTML = ''), (list.innerHTML = ''));
    return;
  }
  let tag = (on) => (on ? ' <em class="m-new">New</em>' : ''),
    acc = rec.best.accuracy >= 0 ? Math.round(rec.best.accuracy * 100) + '%' : '\u2014',
    cond = rec.key.condition[0].toUpperCase() + rec.key.condition.slice(1),
    diff = rec.key.difficulty[0].toUpperCase() + rec.key.difficulty.slice(1);
  best.innerHTML =
    `<div class="m-k">Personal best \xB7 ${cond} \xB7 ${diff}</div>` +
    `<dl class="m-stats small"><div><dt>Time</dt><dd>${fmtTime(rec.best.time)}${tag(rec.isNew.time && !rec.first)}</dd></div>` +
    `<div><dt>Accuracy</dt><dd>${acc}${tag(rec.isNew.accuracy && !rec.first)}</dd></div>` +
    `<div><dt>Rating</dt><dd>${rec.best.rating}${tag(rec.isNew.rating && !rec.first)}</dd></div>` +
    `<div><dt>Clears</dt><dd>${rec.best.clears}</dd></div></dl>`;
  let fresh = new Set(rec.unlocked.map((b) => b.id));
  list.innerHTML = rec.badges
    .map((b) => `<li class="${b.have ? 'on' : ''}${fresh.has(b.id) ? ' fresh' : ''}" title="${b.hint}">${b.label}</li>`)
    .join('');
}

function modeDesc(mode) {
  return mode === 'holdout'
    ? 'Holdout: no relays, no boat. Survive escalating waves on the quay \u2014 resupply between waves, a Warden every fifth.'
    : 'Mission: the port\u2019s security net has gone feral. Cut its three uplink relays, then reach the boat.';
}
const COND_NOTE = { dawn: 'Light rain', storm: 'Heavy rain, lightning', night: 'Floodlights, flashlight' };
// line icons, drawn with currentColor
const svg = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
const ICON = {
  logo: svg(
    '0 0 24 24',
    '<defs><clipPath id="lgd"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/></clipPath></defs><g clip-path="url(#lgd)"><path d="M0 13.5c2.3 0 2.6-2.3 4.9-2.3s2.6 2.3 4.9 2.3 2.6-2.3 4.9-2.3 2.6 2.3 4.9 2.3 2.6-2.3 4.4-2.3V24H0z" fill="#eaeeb2"/></g><path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="none" stroke="currentColor" stroke-width="2"/>',
  ),
  diamondX: svg(
    '0 0 24 24',
    '<path d="M12 1.5 22.5 12 12 22.5 1.5 12z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m8.5 8.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.8"/>',
  ),
  gear: svg(
    '0 0 24 24',
    '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 2.1-1.9-.4a6.6 6.6 0 0 0-.7-1.7l1.1-1.6-1.8-1.8-1.6 1.1c-.5-.3-1.1-.6-1.7-.7L13.4 3.6h-2.8l-.4 1.9c-.6.1-1.2.4-1.7.7L6.9 5.1 5.1 6.9l1.1 1.6c-.3.5-.6 1.1-.7 1.7l-1.9.4v2.8l1.9.4c.1.6.4 1.2.7 1.7l-1.1 1.6 1.8 1.8 1.6-1.1c.5.3 1.1.6 1.7.7l.4 1.9h2.8l.4-1.9c.6-.1 1.2-.4 1.7-.7l1.6 1.1 1.8-1.8-1.1-1.6c.3-.5.6-1.1.7-1.7l1.9-.4z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  ),
  keys: svg(
    '0 0 24 24',
    '<rect x="2.5" y="6.5" width="19" height="11" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 10h1.5M10 10h1.5M14 10h1.5M7.5 14h9" stroke="currentColor" stroke-width="1.5"/>',
  ),
  info: svg(
    '0 0 24 24',
    '<path d="M12 2 22 12 12 22 2 12z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 10.5v6M12 7.5v1.2" stroke="currentColor" stroke-width="1.8"/>',
  ),
  chev: svg('0 0 24 24', '<path d="M6 8l6 8 6-8" fill="none" stroke="currentColor" stroke-width="2.2"/>'),
  dawn: svg(
    '0 0 48 48',
    '<path d="M6 34h36M12 40h24" stroke="currentColor" stroke-width="2.4"/><path d="M14 34a10 10 0 0 1 20 0" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 12v6M10.5 19.5l4 4M37.5 19.5l-4 4M5 28h5M38 28h5" stroke="currentColor" stroke-width="2.4"/>',
  ),
  storm: svg(
    '0 0 48 48',
    '<path d="M13 30a8 8 0 0 1 1-15.9A11 11 0 0 1 35 16a7 7 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m25 24-5 9h7l-4 9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M14 36l-2 5M36 34l-2 5" stroke="currentColor" stroke-width="2.4"/>',
  ),
  night: svg(
    '0 0 48 48',
    '<path d="M30 8a15 15 0 1 0 10 25A13 13 0 0 1 30 8z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M38 9v5M35.5 11.5h5M41 20v3M39.5 21.5h3" stroke="currentColor" stroke-width="2"/>',
  ),
};
