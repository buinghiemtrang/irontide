// Difficulty: scales the enemy and mission tuning tables in place.
// Tables are read when enemies spawn and fire, so a change applies on the next deploy.
import { ENEMY_TUNE } from '../enemies/enemies.js';
import { MISSION } from './mission.js';

export const DIFFICULTIES = {
  easy: { id: 'easy', label: 'Easy', hp: 0.75, damage: 0.55, cooldown: 1.35, tokens: -1, wave: -1, maxAlive: -3 },
  normal: { id: 'normal', label: 'Normal', hp: 1, damage: 1, cooldown: 1, tokens: 0, wave: 0, maxAlive: 0 },
  hard: { id: 'hard', label: 'Hard', hp: 1.3, damage: 1.5, cooldown: 0.78, tokens: 1, wave: 1, maxAlive: 3 },
};
export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES);

// snapshot of the shipped tuning, so switching back and forth never compounds
const BASE = {
  gull: { ...ENEMY_TUNE.gull, cooldown: [...ENEMY_TUNE.gull.cooldown] },
  hound: { ...ENEMY_TUNE.hound, cooldown: [...ENEMY_TUNE.hound.cooldown] },
  maxTokens: ENEMY_TUNE.maxTokens,
  maxTokensCrowd: ENEMY_TUNE.maxTokensCrowd,
  waves: MISSION.waves.map((w) => ({ ...w })),
  maxAlive: MISSION.maxAlive,
};

export function applyDifficulty(G, id) {
  const d = DIFFICULTIES[id] || DIFFICULTIES.normal;
  for (const kind of ['gull', 'hound']) {
    const t = ENEMY_TUNE[kind];
    const b = BASE[kind];
    t.hp = Math.round(b.hp * d.hp);
    if (b.boltDamage !== undefined) t.boltDamage = b.boltDamage * d.damage;
    if (b.shotDamage !== undefined) t.shotDamage = b.shotDamage * d.damage;
    t.cooldown = [b.cooldown[0] * d.cooldown, b.cooldown[1] * d.cooldown];
  }
  ENEMY_TUNE.maxTokens = Math.max(1, BASE.maxTokens + d.tokens);
  ENEMY_TUNE.maxTokensCrowd = Math.max(1, BASE.maxTokensCrowd + d.tokens);
  MISSION.waves = BASE.waves.map((w, n) => ({
    gull: Math.max(1, w.gull + (n > 0 ? d.wave : 0)),
    hound: Math.max(n === 0 ? 0 : 1, w.hound + d.wave),
  }));
  MISSION.maxAlive = Math.max(4, BASE.maxAlive + d.maxAlive);
  G.difficulty = d;
  return d;
}
