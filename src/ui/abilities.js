// Bottom-centre ability strip (weapon swap, flashlight, EMP) and the weapon
// silhouette next to the ammo counter. Icons are inline SVG in currentColor.
const svg = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;

export const WEAPON_ICON = {
  rifle: svg(
    '0 0 120 32',
    '<path fill="currentColor" d="M2 12h20l2-3h34l3-3h10l2 3h24v4H86l-2 3H72l-3 2v3l3 9h-7l-4-8h-6l-3 5h-6l2-6H40l-6 9h-9l4-9H24l-3 3H2z"/>',
  ),
  shotgun: svg(
    '0 0 120 32',
    '<path fill="currentColor" d="M2 13h34l4-3h24v2h54v3H64v3h-6l-2-1H48v2h18v3H48l-2 2H34l-9 9h-9l6-9H2z"/>',
  ),
};

const ICON = {
  swap: svg(
    '0 0 48 48',
    '<path d="M8 17h28l-7-7M40 31H12l7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>',
  ),
  light: svg(
    '0 0 48 48',
    '<path d="M6 19h12l4-4h6v18h-6l-4-4H6z" fill="currentColor"/><path d="M33 16l9-6M34 24h10M33 32l9 6" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>',
  ),
  emp: svg(
    '0 0 48 48',
    '<path d="M24 4 41 14v20L24 44 7 34V14z" fill="none" stroke="currentColor" stroke-width="3"/><path d="m26 12-8 14h7l-3 10 9-15h-7z" fill="currentColor"/>',
  ),
};

export function createAbilities(G) {
  const hud = document.querySelector('.hud');
  if (!hud) return null;
  const el = document.createElement('div');
  el.className = 'h-abil';
  const slot = (k, key, bars) =>
    `<div class="ab" data-k="${k}"><i class="ab-ic">${ICON[k]}</i><div class="ab-bars">${'<b></b>'.repeat(bars)}</div><span class="ab-dot"></span><em>${key}</em></div>`;
  el.innerHTML = slot('swap', '1/2', 1) + slot('light', 'F', 1) + slot('emp', 'G', 3);
  hud.appendChild(el);
  const [swapEl, lightEl, empEl] = el.querySelectorAll('.ab');
  const empBars = empEl.querySelectorAll('b');

  // weapon silhouette beside the ammo counter
  const ammo = hud.querySelector('.h-ammo');
  const wicon = document.createElement('div');
  wicon.className = 'h-wicon';
  if (ammo) ammo.appendChild(wicon);

  let last = '';
  function update() {
    const weapon = (G.loadout && G.loadout.state.active) || 'rifle';
    const light = !!(G.nightLights && G.nightLights.flashlight.on);
    const emp = (G.emp && G.emp.state.count) || 0;
    const key = weapon + light + emp;
    if (key === last) return;
    last = key;
    wicon.innerHTML = WEAPON_ICON[weapon] || '';
    swapEl.querySelector('b').classList.add('on');
    lightEl.classList.toggle('active', light);
    lightEl.querySelector('b').classList.toggle('on', light);
    empBars.forEach((b, n) => b.classList.toggle('on', n < emp));
    empEl.classList.toggle('empty', emp <= 0);
  }
  return { update };
}
