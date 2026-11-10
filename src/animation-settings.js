export const animationSpeeds = [0.5, 0.75, 1, 1.5, 2];
const key = 'bedtime-illustration-settings-v1';
const valid = value => animationSpeeds.includes(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const safeId = id => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);

export function loadAnimationSettings(storage) {
  const result = { global: 1, books: Object.create(null), pages: Object.create(null) };
  try {
    const data = JSON.parse(storage?.getItem(key) || 'null');
    if (!record(data)) return result;
    if (valid(data.global)) result.global = data.global;
    if (record(data.books)) for (const [id, speed] of Object.entries(data.books)) {
      if (safeId(id) && valid(speed)) result.books[id] = speed;
    }
    if (record(data.pages)) for (const [id, pages] of Object.entries(data.pages)) {
      if (!safeId(id) || !record(pages)) continue;
      for (const [page, speed] of Object.entries(pages)) if (/^(0|[1-9]\d*)$/.test(page) && valid(speed)) {
        (result.pages[id] ||= Object.create(null))[page] = speed;
      }
    }
  } catch {}
  return result;
}
export function saveAnimationSettings(storage, settings) {
  try { storage?.setItem(key, JSON.stringify(settings)); } catch {}
}
export function resolveSpeed(settings, bookId, page) {
  const pages = Object.hasOwn(settings.pages, bookId) ? settings.pages[bookId] : undefined;
  return (pages && Object.hasOwn(pages, page) ? pages[page] : undefined) ?? (Object.hasOwn(settings.books, bookId) ? settings.books[bookId] : undefined) ?? settings.global;
}
export function setSpeed(settings, scope, value, bookId, page) {
  if (value !== null && !valid(value)) return;
  if (scope === 'global') { settings.global = value ?? 1; return; }
  if (!safeId(bookId)) return;
  const target = scope === 'book' ? settings.books : (settings.pages[bookId] ||= Object.create(null));
  const id = scope === 'book' ? bookId : page;
  if (value === null) delete target[id]; else target[id] = value;
}
