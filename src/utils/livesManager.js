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

export function loadLivesData() {
  const saved = localStorage.getItem(LIVES_STORAGE_KEY);
  const { nextResetTimeMs } = getGeorgiaResetTime();
  const now = Date.now();

  const defaultData = {
    baseLives: 3,
    usedLives: 0,
    hasQuizLife: false,
    hasShareLife: false,
    lastResetMs: now,
    highScore: 0,
    totalGamesPlayed: 0
  };

  if (!saved) {
    localStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    const parsed = JSON.parse(saved);
    if (now >= parsed.nextResetMs || (parsed.lastResetMs && (now - parsed.lastResetMs > 86400000))) {
      parsed.usedLives = 0;
      parsed.hasQuizLife = false;
      parsed.hasShareLife = false;
      parsed.lastResetMs = now;
      parsed.nextResetMs = nextResetTimeMs;
      localStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveLivesData(data) {
  const { nextResetTimeMs } = getGeorgiaResetTime();
  const updated = { ...data, nextResetMs: nextResetTimeMs };
  localStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(updated));
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
