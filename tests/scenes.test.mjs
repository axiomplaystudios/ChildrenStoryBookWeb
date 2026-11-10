import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateStory } from '../src/story.js';
import { buildCatalog } from '../scripts/catalog.mjs';

const scene = () => ({ width: 720, height: 540, background: 'background.svg', layers: [
  { id: 'tear', image: 'tear.svg', x: 0, y: 0, width: 720, height: 540, pivot: [0, 0] },
], tracks: [{ layer: 'tear', preset: 'tear-fall', playback: 'repeat', durationMs: 1600, restMs: 2000, delayMs: 400, parameters: { distanceY: 40 } }] });
const story = () => ({ title: 'Scene', cover: 'cover.svg', credit: 'Test', pages: [{ image: 'page.svg', text: 'Rabbit cries.', alt: 'Rabbit', scene: scene() }], questions: ['literal', 'literal', 'feeling', 'personal'].map(type => ({ type, q: 'Who?', a: 'Rabbit', hintPage: 1 })) });

test('valid scenes and original static stories remain readable', () => {
  assert.equal(validateStory(story()).pages[0].scene.layers[0].id, 'tear');
  const staticBook = story(); delete staticBook.pages[0].scene;
  assert.doesNotThrow(() => validateStory(staticBook));
});

for (const [name, corrupt] of [
  ['zero width', s => s.width = 0],
  ['infinite dimensions', s => s.height = Infinity],
  ['duplicate layer IDs', s => s.layers.push({ ...s.layers[0] })],
  ['unknown target', s => s.tracks[0].layer = 'missing'],
  ['unknown preset', s => s.tracks[0].preset = 'execute-script'],
  ['unsafe layer asset', s => s.layers[0].image = '../tear.svg'],
  ['remote background', s => s.background = 'https://example.com/a.png'],
  ['invalid pivot', s => s.layers[0].pivot = [0, NaN]],
  ['negative duration', s => s.tracks[0].durationMs = -1],
  ['infinite delay', s => s.tracks[0].delayMs = Infinity],
  ['unknown playback', s => s.tracks[0].playback = 'forever'],
  ['missing parameters', s => delete s.tracks[0].parameters.distanceY],
  ['arbitrary parameters', s => s.tracks[0].parameters.html = '<script>'],
  ['two tracks on same layer', s => s.tracks.push({ ...s.tracks[0] })],
]) test(`rejects scene with ${name}`, () => {
  const value = story(); corrupt(value.pages[0].scene);
  assert.throws(() => validateStory(value), /scene|asset/i);
});

test('catalog checks nested scene assets, not just the original picture', async () => {
  const root = await mkdtemp(join(tmpdir(), 'scene-catalog-'));
  try {
    await mkdir(join(root, 'test-book'));
    await writeFile(join(root, 'test-book/story.json'), JSON.stringify(story()));
    for (const file of ['cover.svg', 'page.svg']) await writeFile(join(root, 'test-book', file), '<svg/>');
    await assert.rejects(buildCatalog(root), /background.svg/);
    await writeFile(join(root, 'test-book/background.svg'), '<svg/>');
    await assert.rejects(buildCatalog(root), /tear.svg/);
    await writeFile(join(root, 'test-book/tear.svg'), '<svg/>');
    const books = await buildCatalog(root);
    assert.equal(books[0].pages[0].scene.width, 720);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('motion tracks fall, fly in closed paths and articulate a beak with quiet holds', async () => {
  const { sampleTrack } = await import('../src/scene-motion.js');
  const tear = scene().tracks[0];
  assert.equal(sampleTrack(tear, 0).opacity, 0);
  assert.equal(sampleTrack(tear, 1200).y, 10);
  assert.equal(sampleTrack(tear, 2000).opacity, 0);
  assert.equal(sampleTrack({ ...tear, playback: 'once' }, 10000).opacity, 0);
  const bee = { ...tear, preset: 'bee-flight', parameters: { radiusX: 50, radiusY: 20, phase: 0 } };
  assert.equal(sampleTrack(bee, 800).x, 50);
  assert.ok(Math.abs(sampleTrack(bee, 2000).x) < 0.001);
  assert.ok(Math.abs(sampleTrack(bee, 2000).y) < 0.001);
  const beak = { ...tear, preset: 'squawk', parameters: { angle: -14 } };
  assert.equal(sampleTrack(beak, 800).angle, -14);
  assert.ok(Math.abs(sampleTrack(beak, 2000).angle) < 0.001);
});

test('bees emerge from the hive once before continuing their local flight', async () => {
  const { sampleTrack } = await import('../src/scene-motion.js');
  const track = { layer: 'bee', preset: 'bee-emerge', playback: 'repeat', durationMs: 4000, restMs: 500, delayMs: 400,
    parameters: { radiusX: 50, radiusY: 20, phase: 0, fromX: -200, fromY: 300 } };
  assert.equal(sampleTrack(track, 0).opacity, 0);
  assert.equal(sampleTrack(track, 400).x, -200);
  assert.equal(sampleTrack(track, 400).y, 300);
  assert.equal(sampleTrack(track, 2000).x, 0);
  assert.equal(sampleTrack(track, 3000).x, 50);
  assert.ok(Math.abs(sampleTrack(track, 6500).x) < 0.001);
});

test('story gestures settle, arrive, breathe and blink without moving a whole scene', async () => {
 const { sampleTrack } = await import('../src/scene-motion.js');
 const t = { playback:'once',durationMs:1000,restMs:0,delayMs:0,parameters:{x:20,y:-10,angle:8} };
 assert.equal(sampleTrack({...t,preset:'settle'},500).x,10);
 assert.equal(sampleTrack({...t,preset:'settle'},2000).y,-10);
 assert.equal(sampleTrack({...t,preset:'arrive'},0).x,20);
 assert.equal(sampleTrack({...t,preset:'arrive'},1000).x,0);
 assert.ok(Math.abs(sampleTrack({...t,preset:'gesture'},1000).x)<.001);
 assert.equal(sampleTrack({...t,preset:'gesture'},500).angle,8);
 assert.equal(sampleTrack({...t,preset:'breathe',parameters:{amount:.03}},500).scaleY,1.03);
 assert.equal(sampleTrack({...t,preset:'blink',parameters:{}},500).opacity,1);
 assert.equal(sampleTrack({...t,preset:'blink',parameters:{}},0).opacity,0);
 assert.ok(Math.abs(sampleTrack({...t,preset:'flap',parameters:{angle:20}},250).angle)>19);
});
test('layer parents must exist and cannot form cycles', () => {
 const value=story(); value.pages[0].scene.layers[0].parent='missing';
 assert.throws(()=>validateStory(value),/scene/i);
 value.pages[0].scene.layers[0].parent='tear';
 assert.throws(()=>validateStory(value),/scene/i);
});
