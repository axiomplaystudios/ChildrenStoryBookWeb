const key = 'bedtime-bookshelf:v1';
export function loadPreferences(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(key) || '{}') || {};
    return { warm: saved.warm === true, sound: saved.sound === true, completed: Array.isArray(saved.completed) ? saved.completed.filter(id => typeof id === 'string') : [] };
  } catch { return { warm: false, sound: false, completed: [] }; }
}
export function savePreferences(storage, preferences) {
  try { storage?.setItem(key, JSON.stringify(preferences)); return true; } catch { return false; }
}
