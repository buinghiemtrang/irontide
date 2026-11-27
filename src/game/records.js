// Personal bests per condition + difficulty, and challenge badges.
// Everything lives in localStorage; failures (private mode, quota) are ignored.
const KEY = 'irontide.records.v1';
export const RATINGS = ['Messy', 'Loud', 'Steady', 'Clean', 'Sharp', 'Surgical'];

export const BADGES = [
  { id: 'clear', label: 'Breacher', hint: 'Complete the mission', test: () => true },
  { id: 'fast', label: 'Rapid Response', hint: 'Finish in under 5 minutes', test: (r) => r.time < 300 },
  { id: 'untouched', label: 'Untouched', hint: 'Finish without taking a hit', test: (r) => r.hitsTaken === 0 },
  {
    id: 'marksman',
    label: 'Marksman',
    hint: 'Finish with 60% accuracy or better',
    test: (r) => r.accuracy != null && r.accuracy >= 0.6,
  },
  { id: 'storm', label: 'Storm Chaser', hint: 'Finish in the storm', test: (r) => r.condition === 'storm' },
  { id: 'night', label: 'Night Owl', hint: 'Finish at night', test: (r) => r.condition === 'night' },
  { id: 'hard', label: 'Hardened', hint: 'Finish on Hard', test: (r) => r.difficulty === 'hard' },
  { id: 'surgical', label: 'Surgical', hint: 'Earn the top rating', test: (r) => r.ratingIndex === RATINGS.length - 1 },
];

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && typeof v === 'object') return { bests: v.bests || {}, badges: v.badges || {} };
  } catch {}
  return { bests: {}, badges: {} };
}
function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function badgeProgress() {
  const { badges } = load();
  return { have: BADGES.filter((b) => badges[b.id]).length, total: BADGES.length };
}

// counts hits taken during a run (a death + retry still counts as taking hits)
export function trackRun(G) {
  const run = { hitsTaken: 0 };
  G.events.on('mission:start', (e) => {
    if (e && e.fresh) run.hitsTaken = 0;
  });
  G.events.on('player:hit', () => {
    run.hitsTaken++;
  });
  G.run = run;
  return run;
}

// store a finished run; returns what the debrief needs to show
export function recordRun(G, stats) {
  const data = load();
  const condition = (G.condition && G.condition.id) || 'dawn';
  const difficulty = (G.difficulty && G.difficulty.id) || 'normal';
  const key = condition + ':' + difficulty;
  const run = { ...stats, condition, difficulty, hitsTaken: (G.run && G.run.hitsTaken) || 0 };
  const prev = data.bests[key] || null;
  const best = prev ? { ...prev } : { time: Infinity, accuracy: -1, ratingIndex: -1, clears: 0 };
  const isNew = {
    time: run.time < best.time,
    accuracy: run.accuracy != null && run.accuracy > best.accuracy,
    rating: run.ratingIndex > best.ratingIndex,
  };
  if (isNew.time) best.time = run.time;
  if (isNew.accuracy) best.accuracy = run.accuracy;
  if (isNew.rating) best.ratingIndex = run.ratingIndex;
  best.clears = (best.clears || 0) + 1;
  data.bests[key] = best;

  const unlocked = [];
  for (const b of BADGES) {
    if (!data.badges[b.id] && b.test(run)) {
      data.badges[b.id] = Date.now();
      unlocked.push(b);
    }
  }
  save(data);
  return {
    best: { ...best, rating: RATINGS[best.ratingIndex] || '—' },
    first: !prev,
    isNew,
    unlocked,
    badges: BADGES.map((b) => ({ id: b.id, label: b.label, hint: b.hint, have: !!data.badges[b.id] })),
    key: { condition, difficulty },
  };
}
