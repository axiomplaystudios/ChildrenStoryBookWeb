import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, advance, back, revealAnswer, setPage } from '../src/session.js';
import { loadPreferences, savePreferences } from '../src/storage.js';
const story = { id: 'test', pages: Array(5).fill({}), questions: Array(4).fill({}) };
test('spread navigation includes the odd final page before questions', () => {
  let s = createSession(story);
  s = advance(s, 2); assert.equal(s.page, 2);
  s = advance(s, 2); assert.equal(s.page, 4); assert.equal(s.view, 'reader');
  s = advance(s, 2); assert.equal(s.view, 'questions'); assert.equal(s.completed, false);
});
test('back navigation clamps and rotation preserves the current page', () => {
  let s = back(createSession(story), 2); assert.equal(s.page, 0);
  s = setPage(s, 3); assert.equal(s.page, 3);
  s = advance(s, 1); assert.equal(s.page, 4);
  assert.equal(setPage(s, 99).page, 4);
});
test('answer hides when changing question; star is only earned after all four prompts', () => {
  let s = advance(setPage(createSession(story), 4));
  s = revealAnswer(s); assert.equal(s.answerVisible, true);
  s = advance(s); assert.equal(s.question, 1); assert.equal(s.answerVisible, false);
  s = back(s); assert.equal(s.question, 0); assert.equal(s.answerVisible, false);
  for (let i = 0; i < 3; i++) s = advance(s);
  assert.equal(s.view, 'questions'); assert.equal(s.completed, false);
  s = advance(s); assert.equal(s.view, 'goodnight'); assert.equal(s.completed, true);
  assert.equal(advance(s).view, 'goodnight');
});
test('preferences survive reload and tolerate corrupt or blocked storage', () => {
  let data; const storage = { getItem: () => data, setItem: (_, value) => { data = value; } };
  const prefs = { warm: true, sound: false, completed: ['test'] };
  savePreferences(storage, prefs); assert.deepEqual(loadPreferences(storage), prefs);
  data = '{'; assert.deepEqual(loadPreferences(storage).completed, []);
  data = '{"warm":"bad","sound":true,"completed":[1,"test"]}';
  assert.deepEqual(loadPreferences(storage), { warm: false, sound: true, completed: ['test'] });
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); } };
  assert.doesNotThrow(() => savePreferences(blocked, prefs));
  assert.equal(loadPreferences(blocked).sound, false);
});
