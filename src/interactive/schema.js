import {validateAsset, validateScene} from '../scene-schema.js';

export const PAIR_BUDGET = 15 * 1024 * 1024;
export const pairSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = label => { throw new Error(`Invalid interactive ${label}`); };
const ok = (value, label) => { if (!value) fail(label); };
const text = (value, label) => ok(typeof value === 'string' && value.trim().length > 0 && value.length <= 8000, label);
const list = (value, min, max, label) => ok(Array.isArray(value) && value.length >= min && value.length <= max, label);
const object = (value, keys, label) => {
  ok(value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype, label);
  for (const key of Object.keys(value)) ok(keys.split(' ').includes(key), `${label}: unknown field ${key}`);
};
const reserved = key => ['constructor','prototype','__proto__'].includes(key);
const id = (value, label) => ok(typeof value === 'string' && value.length <= 80 && pairSlug.test(value) && !reserved(value), label);
const scalar = value => typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10000) || (typeof value === 'string' && value.length <= 200);
function unique(items, key, label) {
  const ids = new Set();
  for (const item of items) { id(item[key], label); ok(!ids.has(item[key]), `duplicate ${label}`); ids.add(item[key]); }
  return ids;
}

// Browser-safe validation. Packages contain data only; every nested record has
// an explicit field whitelist, and predicates have bounded depth/branch count.
function jsonData(value, depth = 0, budget = {left:50000}) {
  ok(depth <= 32 && --budget.left >= 0, 'JSON data bounds');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') { ok(Number.isFinite(value), 'JSON number'); return; }
  ok(value && typeof value === 'object' && (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype), 'JSON data');
  ok(Object.getOwnPropertySymbols(value).length === 0, 'JSON symbol keys');
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === 'length') continue;
    ok(!reserved(key) && !descriptor.get && !descriptor.set && descriptor.enumerable, 'JSON data key');
    if (Array.isArray(value)) ok(/^(0|[1-9][0-9]*)$/.test(key), 'JSON array key');
    jsonData(descriptor.value, depth + 1, budget);
  }
}
export function validatePair(pair) {
  jsonData(pair);
  object(pair, 'schemaVersion id version title category credit cover initialState scenes editions endings assets', 'pair');
  ok(pair.schemaVersion === 1, 'schema version'); id(pair.id, 'ID'); ok(pair.id !== 'covers', 'reserved pair ID'); id(pair.version, 'version');
  for (const key of ['title', 'credit']) text(pair[key], key);
  ok(['small-jobs', 'experiments', 'consequences', 'discovery'].includes(pair.category), 'category');
  list(pair.assets, 1, 240, 'assets'); unique(pair.assets, 'id', 'asset ID');
  const assets = new Set(); let total = 0;
  for (const asset of pair.assets) {
    object(asset, 'id file sha256 bytes mediaType', 'asset'); validateAsset(asset.file);
    ok(!assets.has(asset.file), 'duplicate asset file'); assets.add(asset.file);
    ok(typeof asset.sha256 === 'string' && /^[a-f0-9]{64}$/.test(asset.sha256), 'asset SHA256');
    ok(Number.isInteger(asset.bytes) && asset.bytes > 0 && asset.bytes <= 5 * 1024 * 1024, 'asset bytes'); total += asset.bytes;
    const ext = asset.file.split('.').pop().toLowerCase();
    ok(asset.mediaType === ({svg:'image/svg+xml',png:'image/png',webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg'})[ext], 'asset media type');
  }
  ok(total <= PAIR_BUDGET, 'asset budget (15 MiB)');
  const image = file => { validateAsset(file); ok(assets.has(file), `missing declared asset ${file}`); };
  image(pair.cover);
  object(pair.initialState, Object.keys(pair.initialState ?? {}).join(' '), 'initial state');
  ok(Object.keys(pair.initialState).length <= 32, 'state size');
  for (const [key, value] of Object.entries(pair.initialState)) { id(key, 'state key'); ok(!['constructor','prototype','__proto__'].includes(key) && scalar(value), 'state value'); }
  list(pair.scenes, 1, 12, 'scenes'); const sceneIds = unique(pair.scenes, 'id', 'scene ID');
  const activities = pair.scenes.filter(s => s.activity).map(s => s.activity);
  const activityIds = unique(activities, 'id', 'activity ID');
  const choices = new Map(activities.filter(a => a.kind === 'choice').map(a => [a.id, a.options]));
  const layerIds = new Map(pair.scenes.map(s => [s.id, new Set(s.scene?.layers?.map(l => l.id))]));
  const layerRef = (sceneId, layerId) => ok(sceneIds.has(sceneId) && layerIds.get(sceneId).has(layerId), 'scene/layer reference');
  const predicate = (rule, depth = 0) => {
    ok(depth <= 4, 'predicate depth');
    object(rule, rule?.op === 'equals' ? 'op key value' : 'op conditions', 'predicate');
    if (rule.op === 'equals') {
      text(rule.key, 'predicate key'); ok(scalar(rule.value), 'predicate value');
      if (rule.key.startsWith('choice.')) {
        const options = choices.get(rule.key.slice(7)); ok(Array.isArray(options) && options.some(o => o.id === rule.value), 'predicate choice reference');
      } else ok(Object.hasOwn(pair.initialState, rule.key) && typeof pair.initialState[rule.key] === typeof rule.value, 'predicate state reference/type');
    } else {
      ok(['all','any'].includes(rule.op), 'predicate operator'); list(rule.conditions, 1, 8, 'predicate conditions'); rule.conditions.forEach(r => predicate(r, depth + 1));
    }
  };
  const effects = value => {
    list(value, 0, 24, 'effects');
    for (const effect of value) {
      object(effect, effect?.type === 'set' ? 'type key value when' : 'type sceneId layerId when', 'effect');
      if (effect.when !== undefined) predicate(effect.when);
      if (effect.type === 'set') ok(Object.hasOwn(pair.initialState, effect.key) && scalar(effect.value) && typeof pair.initialState[effect.key] === typeof effect.value, 'effect state reference/type');
      else { ok(['show','hide'].includes(effect.type), 'effect type'); layerRef(effect.sceneId, effect.layerId); }
    }
  };
  const picture = (value, keys = 'id label image') => { object(value, keys, 'picture control'); id(value.id, 'control ID'); text(value.label, 'control label'); image(value.image); };
  for (const item of pair.scenes) {
    object(item, 'id narrative alt image scene activity hiddenLayers', 'scene');
    text(item.narrative, 'scene narrative'); text(item.alt, 'scene alt'); image(item.image);
    object(item.scene, 'width height background layers tracks', 'illustration scene');
    validateScene(item.scene); image(item.scene.background);
    for (const layer of item.scene.layers) { object(layer, 'id image x y width height pivot parent', 'illustration layer'); image(layer.image); }
    for (const track of item.scene.tracks) { object(track, 'layer preset playback durationMs restMs delayMs parameters', 'illustration track'); ok(track.playback === 'repeat' && track.restMs <= 1800, 'decorative loop'); }
    if (item.hiddenLayers !== undefined) { list(item.hiddenLayers, 0, 40, 'hidden layers'); item.hiddenLayers.forEach(layer => layerRef(item.id, layer)); }
    const a = item.activity; if (!a) continue;
    if (a.kind === 'place') {
      object(a, 'kind id items targets', 'place activity'); list(a.items, 1, 12, 'place items'); list(a.targets, 1, 8, 'place targets');
      const ids = unique(a.items, 'id', 'place item ID'); unique(a.targets, 'id', 'place target ID');
      for (const v of a.items) { picture(v, 'id label image quantity'); if (v.quantity !== undefined) ok(Number.isInteger(v.quantity) && v.quantity >= 1 && v.quantity <= 5, 'item quantity'); }
      for (const v of a.targets) {
        picture(v, 'id label image accepts required effects'); list(v.accepts, 1, 12, 'accepted items'); v.accepts.forEach(key => ok(ids.has(key), 'accepted item reference'));
        ok(Number.isInteger(v.required) && v.required >= 1 && v.required <= 5, 'target required quantity');
        ok(a.items.filter(i => v.accepts.includes(i.id)).reduce((sum,i) => sum + (i.quantity ?? 1),0) >= v.required, 'target available quantity'); effects(v.effects);
      }
    } else if (a.kind === 'experiment') {
      object(a, 'kind id variable fixed controls predictions outcomes comparison', 'experiment activity');
      text(a.variable, 'experiment variable'); list(a.fixed, 1, 8, 'fixed conditions'); a.fixed.forEach(v => text(v, 'fixed condition'));
      list(a.controls, 2, 6, 'experiment controls'); list(a.predictions, 2, 6, 'experiment predictions'); list(a.outcomes, 2, 6, 'experiment outcomes');
      const controlIds = unique(a.controls, 'id', 'experiment control ID'); unique(a.predictions, 'id', 'prediction ID'); a.controls.forEach(v => picture(v)); a.predictions.forEach(v => picture(v));
      ok(a.outcomes.length === controlIds.size && new Set(a.outcomes.map(v => v.controlId)).size === controlIds.size, 'one outcome per control');
      for (const v of a.outcomes) { object(v, 'controlId observation image effects', 'experiment outcome'); ok(controlIds.has(v.controlId), 'outcome control reference'); text(v.observation, 'outcome observation'); image(v.image); effects(v.effects); }
      text(a.comparison, 'experiment comparison');
    } else if (a.kind === 'choice') {
      object(a, 'kind id options', 'choice activity'); list(a.options, 2, 2, 'binary choice options'); unique(a.options, 'id', 'choice option ID');
      for (const v of a.options) { picture(v, 'id label image feedback effects'); text(v.feedback, 'choice feedback'); effects(v.effects); ok(v.effects.length > 0, 'meaningful choice effects'); }
      ok(JSON.stringify(a.options[0].effects) !== JSON.stringify(a.options[1].effects), 'meaningful different choice effects');
    } else if (a.kind === 'discover') {
      object(a, 'kind id physicalPrompt adultHelp screen effects', 'discover activity'); text(a.physicalPrompt, 'optional physical prompt'); text(a.adultHelp, 'adult guidance');
      object(a.screen, 'label image mode options answer', 'discovery screen alternative'); text(a.screen.label, 'screen alternative label'); image(a.screen.image);
      ok(['match','sequence'].includes(a.screen.mode), 'discovery screen mode'); list(a.screen.options,2,8,'discovery options');
      const options = unique(a.screen.options,'id','discovery option ID'); a.screen.options.forEach(v => picture(v));
      list(a.screen.answer,1,a.screen.mode === 'match' ? 1 : 12,'discovery answer'); a.screen.answer.forEach(v => ok(options.has(v),'discovery answer reference')); effects(a.effects);
    } else fail('activity kind');
  }
  object(pair.editions, 'together independent', 'editions');
  for (const editionName of ['together', 'independent']) {
    const edition = pair.editions[editionName]; object(edition, editionName === 'together' ? 'scenes prompts' : 'scenes reflection', `${editionName} edition`);
    object(edition.scenes, [...sceneIds].join(' '), 'edition guidance');
    for (const item of pair.scenes) {
      const g = edition.scenes[item.id]; object(g, 'instruction feedback demonstration', 'scene guidance'); text(g.instruction, 'guidance instruction');
      object(g.feedback, 'complete retry', 'guidance feedback'); text(g.feedback.complete, 'complete feedback'); text(g.feedback.retry, 'retry feedback');
      list(g.demonstration, 1, 12, 'visual demonstration');
      for (const step of g.demonstration) {
        object(step, 'action image label itemId targetId controlId predictionId layerId', 'demonstration step');
        ok(['point','select','place','predict','test','reveal'].includes(step.action), 'demonstration action'); image(step.image); text(step.label, 'demonstration label');
        for (const [key, candidates] of [['itemId',item.activity?.items],['targetId',item.activity?.targets],['controlId',item.activity?.controls],['predictionId',item.activity?.predictions]]) if (step[key] !== undefined) ok(candidates?.some(v => v.id === step[key]), 'demonstration control reference');
        if (step.layerId !== undefined) layerRef(item.id, step.layerId);
      }
    }
    if (editionName === 'together') {
      list(edition.prompts, 4, 4, 'Together prompts'); const types = edition.prompts.map(q => q.type).sort(); ok(types.join() === 'feeling,literal,literal,personal', 'Together prompt types');
      for (const q of edition.prompts) { object(q, 'type question answer sceneId', 'discussion prompt'); text(q.question, 'prompt question'); text(q.answer, 'prompt answer'); ok(sceneIds.has(q.sceneId), 'prompt scene reference'); }
    } else text(edition.reflection, 'independent reflection');
  }
  const ending = pair.endings; object(ending, 'sceneId text variants recap', 'endings');
  ok(ending.sceneId === pair.scenes.at(-1).id && !pair.scenes.at(-1).activity, 'ending scene reference'); text(ending.text, 'ending text');
  const variants = (items, sceneId) => {
    list(items, 0, 64, 'conditional variants');
    for (const v of items) { object(v, 'when text showLayers hideLayers', 'conditional variant'); predicate(v.when); text(v.text, 'variant text');
      for (const key of ['showLayers','hideLayers']) if (v[key] !== undefined) { list(v[key],0,40,'variant layers'); v[key].forEach(layer => layerRef(sceneId, layer)); }
    }
  };
  variants(ending.variants, ending.sceneId); list(ending.recap, 0, 3, 'recap');
  const covered = [];
  for (const beat of ending.recap) { object(beat, 'decisions text variants', 'recap beat'); list(beat.decisions,1,6,'recap decisions'); beat.decisions.forEach(v => ok(choices.has(v), 'recap decision reference')); covered.push(...beat.decisions); text(beat.text,'recap text'); variants(beat.variants,ending.sceneId); }
  if (pair.category === 'consequences') {
    ok(pair.scenes.length === 7 && choices.size === 6 && activities.length === 6 && activityIds.size === 6, 'six consequence decisions');
    ok(ending.recap.length === 3 && covered.length === 6 && new Set(covered).size === 6 && [...choices.keys()].every(v => covered.includes(v)), 'recap coverage of six decisions');
  }
  return pair;
}

// Validate first: all referenced images must occur in the manifest. No unused
// asset needs to be discovered by recursively interpreting arbitrary values.
export function pairAssets(pair) { validatePair(pair); return pair.assets.map(asset => asset.file); }
