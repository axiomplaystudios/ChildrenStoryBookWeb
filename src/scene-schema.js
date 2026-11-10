import { presetParameters } from './scene-motion.js';

export const assetPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(webp|png|jpe?g|svg)$/i;
export function validateAsset(value) {
  if (typeof value !== 'string' || !assetPattern.test(value) || value.includes('..')) throw new Error(`Invalid local asset: ${value}`);
}
const valid = (condition, label) => { if (!condition) throw new Error(`Invalid scene ${label}`); };
const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

export function validateScene(scene) {
  valid(scene && typeof scene === 'object', 'data');
  valid(number(scene.width, 1, 8192) && number(scene.height, 1, 8192), 'dimensions');
  validateAsset(scene.background);
  valid(Array.isArray(scene.layers) && scene.layers.length > 0 && scene.layers.length <= 40, 'layers');
  const ids = new Set();
  for (const layer of scene.layers) {
    valid(layer && typeof layer === 'object', 'layer');
    valid(typeof layer.id === 'string' && /^[a-z][a-z0-9-]*$/.test(layer.id) && !ids.has(layer.id), 'layer ID');
    ids.add(layer.id); validateAsset(layer.image);
    valid(number(layer.x, -8192, 8192) && number(layer.y, -8192, 8192) && number(layer.width, 1, 8192) && number(layer.height, 1, 8192), 'layer dimensions');
    valid(Array.isArray(layer.pivot) && layer.pivot.length === 2 && layer.pivot.every(n => number(n, -8192, 8192)), 'pivot');
  }
  for (const layer of scene.layers) {
    const ancestors = new Set([layer.id]);
    let parent = layer.parent;
    while (parent !== undefined) {
      valid(ids.has(parent) && !ancestors.has(parent), 'layer parent');
      ancestors.add(parent); parent = scene.layers.find(l => l.id === parent).parent;
    }
  }
  valid(Array.isArray(scene.tracks) && scene.tracks.length > 0 && scene.tracks.length <= 40, 'tracks');
  const targeted = new Set();
  for (const track of scene.tracks) {
    valid(track && typeof track === 'object', 'track');
    valid(ids.has(track.layer) && !targeted.has(track.layer), 'track target'); targeted.add(track.layer);
    valid(Object.hasOwn(presetParameters, track.preset), 'preset');
    valid(['once', 'repeat'].includes(track.playback), 'playback');
    valid(number(track.durationMs, 200, 60000) && number(track.restMs, 0, 60000) && number(track.delayMs, 0, 60000), 'timing');
    const rules = presetParameters[track.preset];
    valid(track.parameters && typeof track.parameters === 'object' && Object.keys(track.parameters).length === Object.keys(rules).length, 'parameters');
    for (const [key, [min, max]] of Object.entries(rules)) valid(number(track.parameters[key], min, max), `parameter ${key}`);
  }
  return scene;
}

export function storyAssets(story) {
  return [...new Set([story.cover, ...(story.logo ? [story.logo] : []), ...story.pages.flatMap(page =>
    [page.image, ...(page.scene ? [page.scene.background, ...page.scene.layers.map(layer => layer.image)] : [])])])];
}
