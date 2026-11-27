import { Group } from 'three';
import { defineExports } from '../../core/esm.js';
import { $e, makeMesh } from '../../core/geometry.js';

var propsModule = {};
defineExports(propsModule, {
  PROP_SIZES: () => PROP_SIZES,
  create: () => createProps,
  register: () => registerProp,
  showcase: () => propsShowcase,
});
var PROP_SIZES = {
  container20: [6.06, 2.59, 2.44, 'paint_red', 'metal'],
  container40: [12.19, 2.59, 2.44, 'paint_blue', 'metal'],
  container40hc: [12.19, 2.9, 2.44, 'paint_green', 'metal'],
  jersey_barrier: [3, 0.81, 0.6, 'concrete', 'concrete'],
  light_mast: [0.5, 14, 0.5, 'steel_galv', 'metal'],
  fence_panel: [3, 2.4, 0.08, 'chainlink', 'metal'],
  guard_booth: [2.6, 2.7, 2.2, 'paint_white', 'metal'],
  gate_arm: [5, 1.1, 0.3, 'hazard_stripes', 'metal'],
  bollard_mooring: [0.7, 0.6, 0.7, 'steel_dark', 'metal'],
  bollard_post: [0.17, 1, 0.17, 'paint_yellow', 'metal'],
  relay_node: [1.2, 2.4, 0.8, 'paint_grey', 'metal'],
  shelf_rack: [2.7, 4.2, 1.1, 'paint_orange', 'metal'],
  stairs_metal: [3, 2.6, 1, 'diamond_plate', 'metal'],
  catwalk: [3, 1.1, 1.2, 'diamond_plate', 'metal'],
  reefer_unit: [0.5, 2.3, 2.3, 'paint_white', 'metal'],
  barrel: [0.6, 0.9, 0.6, 'paint_blue', 'metal'],
  pallet: [1.2, 0.144, 1, 'wood_pallet', 'wood'],
  pallet_stack: [1.2, 1.15, 1, 'wood_pallet', 'wood'],
  crate_wood: [1.1, 1, 0.9, 'wood_pallet', 'wood'],
  crate_stack: [1.2, 1.9, 1, 'wood_pallet', 'wood'],
  ibc_tote: [1.2, 1.16, 1, 'plastic_grey', 'metal'],
  forklift: [3.4, 2.2, 1.25, 'paint_yellow', 'metal'],
  cable_reel: [1.3, 1.3, 0.8, 'wood_dark', 'wood'],
  tire_stack: [0.8, 1, 0.8, 'tire', 'rubber'],
  dumpster: [1.9, 1.35, 1.1, 'paint_green', 'metal'],
  generator: [2.2, 1.4, 1, 'paint_yellow', 'metal'],
  jerry_can: [0.35, 0.47, 0.17, 'paint_green', 'metal'],
  traffic_cone: [0.36, 0.7, 0.36, 'plastic_red', 'rubber'],
  gas_cylinders: [0.9, 1.6, 0.5, 'steel_dark', 'metal'],
  tarp_cargo: [2.4, 1.5, 1.4, 'tarp', 'dirt'],
  sandbags: [2, 0.9, 0.6, 'tarp', 'dirt'],
  toolbox_cart: [0.9, 0.95, 0.5, 'plastic_red', 'metal'],
  floodlight_stand: [1, 2.2, 1, 'paint_yellow', 'metal'],
  cardboard_boxes: [1, 0.8, 0.8, 'cardboard', 'wood'],
  pipe_stack: [6, 0.9, 1.2, 'steel_rust', 'metal'],
  sign_post: [0.6, 2.4, 0.08, 'paint_white', 'metal'],
};
var Xg = {};
function registerProp(i, e) {
  Xg[i] = e;
}
function createProps(i) {
  return {
    names: () => Object.keys(PROP_SIZES),
    has: (e) => !!PROP_SIZES[e],
    build(e, t = {}) {
      if (Xg[e])
        try {
          let o = Xg[e](i, t);
          if (o) return ((o.userData.prop = e), o);
        } catch (o) {
          console.error(`[props] builder "${e}" threw`, o);
        }
      let n = PROP_SIZES[e] || [1, 1, 1, 'concrete', 'concrete'];
      PROP_SIZES[e] || console.warn(`[props] unknown prop "${e}"`);
      let s = new Group();
      return (
        s.add(makeMesh($e(n[0], n[1], n[2], 'bottom'), i.mats.get(n[3]))),
        (s.userData.colliders = [{ min: [-n[0] / 2, 0, -n[2] / 2], max: [n[0] / 2, n[1], n[2] / 2], surface: n[4] }]),
        (s.userData.size = [n[0], n[1], n[2]]),
        (s.userData.prop = e),
        s
      );
    },
  };
}
function propsShowcase(i) {
  let e = i.params.names ? i.params.names.split(',') : Object.keys(PROP_SIZES),
    t = 0,
    n = 0,
    s = 0,
    o = 0;
  for (let a of e) {
    let l = i.props.build(a, { seed: 7, doors: a.startsWith('container') ? 0.6 : 0 }),
      c = l.userData.size || PROP_SIZES[a] || [1, 1, 1];
    (t + c[0] > 26 && ((t = 0), (n += s + 1.5), (s = 0)),
      l.position.set(t + c[0] / 2, 0, n),
      i.scene.add(l),
      (t += c[0] + 1),
      (s = Math.max(s, c[2])),
      (o = Math.max(o, t)));
  }
  let r = Math.min(o, 26) / 2;
  return { cam: [r - 4, 2.2, n + s + 6], target: [r, 1, n / 2] };
}

export { PROP_SIZES, createProps, propsModule, registerProp };
