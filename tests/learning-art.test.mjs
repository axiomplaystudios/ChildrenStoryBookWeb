import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {storyAssets} from '../src/scene-schema.js';
import {posesSeenByBrowserSampling} from './helpers/loop-sampling.mjs';

const ids = ['pips-alphabet-adventure', 'mouses-counting-picnic', 'rabbits-rainbow-garden', 'little-shape-builders', 'pips-planet-journey',
  'big-bear-little-mouse', 'where-is-teddy', 'weather-window', 'pattern-parade', 'day-of-feelings'];
const get = async id => JSON.parse(await readFile(`public/books/${id}/story.json`, 'utf8'));
const art = (id, file) => readFile(`public/books/${id}/${file}`, 'utf8');

for (const id of ids) {
  test(`${id}: the cover is its own picture, not a copy of page one`, async () => {
    const book = await get(id);
    assert.notEqual(await art(id, book.cover), await art(id, book.pages[0].image));
  });

  test(`${id}: lettering is drawn as outlines, so it looks the same on every device`, async () => {
    const book = await get(id);
    for (const file of storyAssets(book)) assert.ok(!/<text\b/.test(await art(id, file)), `${file} relies on a device font`);
  });

  test(`${id}: every page has at least two moving parts`, async () => {
    const book = await get(id);
    for (const [i, page] of book.pages.entries()) assert.ok(page.scene.tracks.length >= 2, `page ${i + 1} has ${page.scene.tracks.length}`);
  });

  test(`${id}: every moving part shows movement at each moment the browser loop test looks`, async () => {
    const book = await get(id);
    for (const [i, page] of book.pages.entries()) for (const track of page.scene.tracks) for (const offset of [0, 137, 290, 451]) {
      assert.ok(posesSeenByBrowserSampling(track, offset) > 1, `page ${i + 1} ${track.layer} would look stopped`);
    }
  });

  test(`${id}: pictures stay light enough to save for offline reading`, async () => {
    const book = await get(id);
    let total = 0;
    for (const file of storyAssets(book)) {
      const bytes = (await readFile(`public/books/${id}/${file}`)).length;
      assert.ok(bytes <= 120 * 1024, `${file} is ${bytes} bytes`);
      total += bytes;
    }
    for (const [i, page] of book.pages.entries()) assert.ok(page.scene.layers.length <= 7, `page ${i + 1} needs ${page.scene.layers.length + 2} files`);
    assert.ok(total / book.pages.length <= 110 * 1024, `${Math.round(total / book.pages.length / 1024)} KiB per page`);
  });
}

test('the sampling check notices a blink that falls between the browser samples', () => {
  const hidden = {layer: 'lids', preset: 'blink', parameters: {}, durationMs: 200, restMs: 1651, delayMs: 300, playback: 'repeat'};
  assert.equal(posesSeenByBrowserSampling(hidden), 1);
});
