import { createRun, validateRun } from './state.js';

// Use the same absolute application-root convention as bundle storage. Relative
// paths resolve against the host document; query/fragment never split saves.
export function progressBase(baseUrl = import.meta.env?.BASE_URL ?? './') {
  const base = new URL(baseUrl, globalThis.document?.baseURI ?? 'http://localhost/');
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  base.search = '';
  base.hash = '';
  return base.href;
}
export const progressKey = (pairId, edition, baseUrl) =>
  `interactive-run:${progressBase(baseUrl)}:${pairId}:${edition}`;
const MAX_SAVE_BYTES = 600000;

export function loadRun(storage, pair, edition, baseUrl) {
  const fresh = createRun(pair, edition);
  let text;
  try {
    // Old unscoped records have no trustworthy owner. Do not read, migrate,
    // overwrite or delete them: another same-origin app may still use them.
    text = storage.getItem(progressKey(pair.id, edition, baseUrl));
  } catch {
    return { run: fresh, status: 'memory', reason: 'storage-unavailable' };
  }
  if (text === null) return { run: fresh, status: 'new' };
  try {
    if (typeof text !== 'string' || text.length > MAX_SAVE_BYTES) throw Error('Save bounds');
    const value = JSON.parse(text);
    if (value.edition !== edition) throw Error('Edition mismatch');
    return { run: validateRun(pair, value), status: 'loaded' };
  } catch {
    return { run: fresh, status: 'restart', reason: 'invalid-or-obsolete-save' };
  }
}
export function saveRun(storage, run, baseUrl) {
  try {
    const text = JSON.stringify(run);
    if (text.length > MAX_SAVE_BYTES) throw Error('Save bounds');
    storage.setItem(progressKey(run.pairId, run.edition, baseUrl), text);
    return { run, status: 'saved' };
  } catch {
    return { run, status: 'memory', reason: 'storage-unavailable' };
  }
}
