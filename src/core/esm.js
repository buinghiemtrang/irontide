// Defines lazy getters on a namespace object (keeps the module registry used by showcases).
export function defineExports(target, getters) {
  for (const key in getters) Object.defineProperty(target, key, { get: getters[key], enumerable: true });
}
