// Mission conditions (time of day + weather).
// The renderer, ground, fx and weapon read SUN / SKY_COLORS when they are created,
// so a condition is applied once at boot, before any system is built.
import { SKY_COLORS, SKY_STYLE, SUN } from './config.js';

const v3 = (x, y, z) => ({ x, y, z });
const rgb = (r, g, b) => ({ r, g, b });

export const CONDITIONS = {
  dawn: {
    id: 'dawn',
    label: 'Dawn',
    clock: '05:42',
    sun: { dir: v3(0.916, 0.225, 0.331), color: rgb(1, 0.72, 0.42), intensity: 9 },
    sky: {
      zenith: rgb(0.055, 0.085, 0.13),
      horizon: rgb(0.95, 0.55, 0.28),
      horizonAway: rgb(0.16, 0.22, 0.3),
      fog: rgb(0.42, 0.47, 0.52),
    },
    sky_style: { gain: 1, cover: 0, night: 0 },
    post: {},
    rain: 1,
    thunder: [30, 60],
    night: false,
  },
  storm: {
    id: 'storm',
    label: 'Storm',
    clock: '07:15',
    sun: { dir: v3(0.62, 0.62, 0.48), color: rgb(0.62, 0.66, 0.72), intensity: 2.6 },
    sky: {
      zenith: rgb(0.07, 0.08, 0.095),
      horizon: rgb(0.3, 0.31, 0.32),
      horizonAway: rgb(0.13, 0.145, 0.16),
      fog: rgb(0.24, 0.26, 0.28),
    },
    sky_style: { gain: 0.62, cover: 1, night: 0 },
    post: { key: 0.1, maxExposure: 1.8, flare: 0.04, lookSat: 1.02 },
    rain: 2.2,
    thunder: [6, 16],
    night: false,
  },
  night: {
    id: 'night',
    label: 'Night',
    clock: '02:10',
    // moonlight
    sun: { dir: v3(-0.42, 0.6, 0.55), color: rgb(0.52, 0.62, 0.9), intensity: 0.55 },
    sky: {
      zenith: rgb(0.004, 0.007, 0.016),
      horizon: rgb(0.045, 0.05, 0.07),
      horizonAway: rgb(0.012, 0.018, 0.03),
      fog: rgb(0.03, 0.036, 0.05),
    },
    sky_style: { gain: 0.07, cover: 0.35, night: 1 },
    post: { key: 0.05, minExposure: 0.6, maxExposure: 1.4, flare: 0.05, bloom: 0.09, lookSat: 1.05 },
    rain: 0.6,
    thunder: [45, 90],
    night: true,
  },
};

export const CONDITION_IDS = Object.keys(CONDITIONS);

export function pickCondition(params, settings) {
  const want = (params && params.cond) || (settings && settings.cond) || 'dawn';
  return CONDITIONS[want] ? want : 'dawn';
}

export function applyCondition(G, id) {
  const c = CONDITIONS[id] || CONDITIONS.dawn;
  SUN.dir.set(c.sun.dir.x, c.sun.dir.y, c.sun.dir.z).normalize();
  SUN.color.setRGB(c.sun.color.r, c.sun.color.g, c.sun.color.b);
  SUN.intensity = c.sun.intensity;
  for (const k of Object.keys(c.sky)) SKY_COLORS[k].setRGB(c.sky[k].r, c.sky[k].g, c.sky[k].b);
  Object.assign(SKY_STYLE, c.sky_style);
  G.condition = c;
  if (G.quality) G.quality.rain = (G.quality.rain || 0.5) * c.rain;
  return c;
}
