import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAnimationSettings, saveAnimationSettings, resolveSpeed, setSpeed } from '../src/animation-settings.js';

test('page overrides book overrides global, and inheritance restores defaults', () => {
  const settings = loadAnimationSettings();
  assert.equal(resolveSpeed(settings, 'moon', 0), 1);
  setSpeed(settings, 'global', 0.5);
  setSpeed(settings, 'book', 1.5, 'moon');
  setSpeed(settings, 'page', 2, 'moon', 1);
  assert.equal(resolveSpeed(settings, 'moon', 0), 1.5);
  assert.equal(resolveSpeed(settings, 'moon', 1), 2);
  assert.equal(resolveSpeed(settings, 'other', 1), 0.5);
  setSpeed(settings, 'page', null, 'moon', 1);
  assert.equal(resolveSpeed(settings, 'moon', 1), 1.5);
  setSpeed(settings, 'book', null, 'moon');
  assert.equal(resolveSpeed(settings, 'moon', 1), 0.5);
});
test('storage round trips separately and corrupt or blocked storage is safe', () => {
  const values = new Map(); const storage = { getItem: k => values.get(k), setItem: (k,v) => values.set(k,v) };
  const settings = loadAnimationSettings(storage);
  setSpeed(settings, 'page', 0.75, 'moon', 3);
  saveAnimationSettings(storage, settings);
  assert.equal(resolveSpeed(loadAnimationSettings(storage), 'moon', 3), 0.75);
  assert.equal(values.size, 1);
  const key = [...values.keys()][0];
  values.set(key, '{bad'); assert.equal(loadAnimationSettings(storage).global, 1);
  values.set(key, JSON.stringify({global: 500, books: {moon: -2}, pages: {moon: {'3': 2, '4': '2'}}}));
  const clean = loadAnimationSettings(storage);
  assert.equal(resolveSpeed(clean, 'moon', 3), 2);
  assert.equal(resolveSpeed(clean, 'moon', 4), 1);
  const blocked = {getItem(){throw Error();}, setItem(){throw Error();}};
  assert.equal(loadAnimationSettings(blocked).global, 1);
  assert.doesNotThrow(() => saveAnimationSettings(blocked, settings));
});
test('valid book IDs that match object properties retain speed inheritance and persistence', () => {
  const settings = loadAnimationSettings();
  setSpeed(settings, 'global', 0.5);
  assert.equal(resolveSpeed(settings, 'constructor', 0), 0.5);
  setSpeed(settings, 'book', 1.5, 'constructor');
  setSpeed(settings, 'page', 2, 'constructor', 1);
  assert.equal(resolveSpeed(settings, 'constructor', 0), 1.5);
  assert.equal(resolveSpeed(settings, 'constructor', 1), 2);
  const loaded=loadAnimationSettings({getItem:()=>JSON.stringify(settings)});
  assert.equal(resolveSpeed(loaded, 'constructor', 1), 2);
  setSpeed(loaded, 'page', null, 'constructor', 1);
  assert.equal(resolveSpeed(loaded, 'constructor', 1), 1.5);
});
