// Lives & Daily Reset Manager for Dancing Bricks
// Daily Reset at 22:00 Georgia Time (UTC+4)

const LIVES_STORAGE_KEY = 'dancing_bricks_lives_v1';

export function getGeorgiaResetTime() {
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const georgiaNow = new Date(utcMs + (4 * 3600000));

  const target = new Date(georgiaNow);
  target.setHours(22, 0, 0, 0);

  if (georgiaNow.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const targetUtcMs = target.getTime() - (4 * 3600000);
  const localTargetMs = targetUtcMs - (new Date().getTimezoneOffset() * 60000);

  return {
    nextResetTimeMs: localTargetMs,
    targetDate: target
  };
}

export function getStorageKey(userId = '') {
  if (userId) return `dancing_bricks_lives_v2_${userId}`;
  return 'dancing_bricks_lives_v2_guest';
}

export function loadLivesData(userId = '') {
  const key = getStorageKey(userId);
  const saved = localStorage.getItem(key);
  const { nextResetTimeMs } = getGeorgiaResetTime();
  const now = Date.now();

  const defaultData = {
    baseLives: 3,
    usedLives: 0,
    hasQuizLife: false,
    hasShareLife: false,
    nextResetMs: nextResetTimeMs,
    highScore: 0,
    totalGamesPlayed: 0
  };

  if (!saved) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!parsed.nextResetMs || now >= parsed.nextResetMs) {
      parsed.baseLives = 3;
      parsed.usedLives = 0;
      parsed.hasQuizLife = false;
      parsed.hasShareLife = false;
      parsed.nextResetMs = nextResetTimeMs;
      localStorage.setItem(key, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveLivesData(data, userId = '') {
  const key = getStorageKey(userId);
  const { nextResetTimeMs } = getGeorgiaResetTime();
  const updated = { ...data, nextResetMs: data.nextResetMs || nextResetTimeMs };
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function calculateAvailableLives(data) {
  let totalAvailable = Math.max(0, data.baseLives - data.usedLives);
  if (data.hasQuizLife) totalAvailable += 1;
  if (data.hasShareLife) totalAvailable += 1;
  return Math.min(5, totalAvailable);
}

export function formatTimeUntilReset(nextResetMs) {
  const diff = Math.max(0, nextResetMs - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
