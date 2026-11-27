import { Color, Vector3 } from 'three';

var WORLD_BOUNDS = { min: new Vector3(-40, 0, -30), max: new Vector3(40, 30, 30), groundY: 0, seaY: -1.6, quayX: 30 };
var SUN = { dir: new Vector3(0.916, 0.225, 0.331).normalize(), color: new Color(1, 0.72, 0.42), intensity: 9 };
var SKY_COLORS = {
  zenith: new Color(0.055, 0.085, 0.13),
  horizon: new Color(0.95, 0.55, 0.28),
  horizonAway: new Color(0.16, 0.22, 0.3),
  fog: new Color(0.42, 0.47, 0.52),
};
// extra sky controls set by the mission condition (see core/conditions.js)
var SKY_STYLE = { gain: 1, cover: 0, night: 0 };
var PLAYER_BODY = { eye: 1.68, crouchEye: 1.05, radius: 0.32, height: 1.8, fov: 74, viewFov: 54 };
var vf = 0;
var zc = 1;
var QUALITY_PRESETS = {
  test: {
    name: 'test',
    scale: 1,
    msaa: 0,
    shadow: 1024,
    tex: 256,
    volSteps: 10,
    ao: !0,
    planar: 0.5,
    bloom: !0,
    motionBlur: !1,
    rain: 0.4,
  },
  low: {
    name: 'low',
    scale: 0.7,
    msaa: 0,
    shadow: 2048,
    tex: 512,
    volSteps: 12,
    ao: !1,
    planar: 0,
    bloom: !0,
    motionBlur: !1,
    rain: 0.5,
  },
  medium: {
    name: 'medium',
    scale: 0.85,
    msaa: 2,
    shadow: 2048,
    tex: 1024,
    volSteps: 16,
    ao: !0,
    planar: 0.5,
    bloom: !0,
    motionBlur: !1,
    rain: 0.8,
  },
  high: {
    name: 'high',
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 1024,
    volSteps: 24,
    ao: !0,
    planar: 0.5,
    bloom: !0,
    motionBlur: !0,
    rain: 1,
  },
  ultra: {
    name: 'ultra',
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 2048,
    volSteps: 40,
    ao: !0,
    planar: 1,
    bloom: !0,
    motionBlur: !0,
    rain: 1,
  },
};
function pickQuality(i) {
  if (i && QUALITY_PRESETS[i]) return { ...QUALITY_PRESETS[i] };
  if (
    /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900)
  )
    return { ...QUALITY_PRESETS.low };
  let t = '';
  try {
    let s = document.createElement('canvas'),
      o = s.getContext('webgl2') || s.getContext('webgl');
    if (o) {
      let r = o.getExtension('WEBGL_debug_renderer_info');
      t = String(r ? o.getParameter(r.UNMASKED_RENDERER_WEBGL) : o.getParameter(o.RENDERER));
      let a = o.getExtension('WEBGL_lose_context');
      a && a.loseContext();
    }
  } catch {}
  return {
    ...(/SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(t) || (/Intel/i.test(t) && !/Arc/i.test(t))
      ? QUALITY_PRESETS.medium
      : QUALITY_PRESETS.high),
  };
}

export { SKY_STYLE, PLAYER_BODY, QUALITY_PRESETS, SKY_COLORS, SUN, WORLD_BOUNDS, pickQuality, vf, zc };
