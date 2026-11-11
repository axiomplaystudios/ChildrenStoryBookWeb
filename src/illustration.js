import { sampleTrack } from './scene-motion.js';

const svgNS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
};

export function createIllustration({ bookId, page, resolveAsset }) {
  const url = resolveAsset ?? (file => `./books/${bookId}/${file}`);
  const element = document.createElement('div'); element.className = 'illustration';
  const original = document.createElement('img'); original.src = url(page.image); original.alt = page.alt; original.draggable = false;
  element.append(original); element.dataset.playing = 'false';
  const scene = page.scene;
  let stage, loaded = false, disposed = false, reduced = false, wanted = false;
  let speed = 1, layeredStill = false;
  let elapsed = 0, lastTime = null, request = null;
  const parts = new Map();
  if (scene) {
    element.dataset.sceneState = 'loading';
    stage = svg('svg', { viewBox: `0 0 ${scene.width} ${scene.height}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': page.alt });
    stage.classList.add('scene-stage'); stage.setAttribute('hidden', '');
    stage.append(svg('image', { href: url(scene.background), width: scene.width, height: scene.height, 'data-background': '' }));
    for (const layer of scene.layers) {
      const part = svg('g', { 'data-layer': layer.id });
      part.append(svg('image', { href: url(layer.image), x: layer.x, y: layer.y, width: layer.width, height: layer.height }));
      parts.set(layer.id, { part, pivot: layer.pivot });
    }
    for (const layer of scene.layers) (layer.parent ? parts.get(layer.parent).part : stage).append(parts.get(layer.id).part);
    element.append(stage);
    render();
  }
  function render() {
    for (const track of scene?.tracks || []) {
      const { part, pivot } = parts.get(track.layer);
      const pose = sampleTrack(track, elapsed);
      part.setAttribute('transform', `translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)}) rotate(${pose.angle.toFixed(3)} ${pivot[0]} ${pivot[1]}) translate(${pivot[0]} ${pivot[1]}) scale(1 ${(pose.scaleY ?? 1).toFixed(4)}) translate(${-pivot[0]} ${-pivot[1]})`);
      part.setAttribute('opacity', pose.opacity.toFixed(3));
    }
  }
  function stop() {
    if (request !== null) cancelAnimationFrame(request);
    request = null; lastTime = null; element.dataset.playing = 'false';
  }
  function tick(now) {
    request = null;
    if (!wanted || !loaded || reduced || disposed) return;
    if (lastTime !== null) elapsed += (now - lastTime) * speed;
    lastTime = now; render();
    const complete = scene.tracks.every(t => t.playback === 'once' && elapsed >= t.delayMs + t.durationMs);
    if (complete) { stop(); return; }
    request = requestAnimationFrame(tick);
  }
  function resume() {
    wanted = true;
    if (loaded && !reduced && !disposed && request === null) {
      element.dataset.playing = 'true'; request = requestAnimationFrame(tick);
    }
  }
  function presentation() {
    if (!stage) return;
    const show = loaded && (!reduced || layeredStill) && !disposed;
    original.hidden = show; stage.toggleAttribute('hidden', !show);
  }
  const ready = scene ? Promise.all([...new Set([scene.background, ...scene.layers.map(l => l.image)])].map(file => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(resolve, reject);
    img.onerror = () => reject(new Error(`Could not load scene asset ${file}`));
    img.src = url(file);
  }))).then(() => {
    if (disposed) return;
    loaded = true; element.dataset.sceneState = 'ready'; presentation(); if (wanted) resume();
  }).catch(() => {
    if (!disposed) { element.dataset.sceneState = 'fallback'; stop(); presentation(); }
  }) : Promise.resolve();

  return {
    element, ready,
    // Explicit layer selection opts into the composed still under reduced motion.
    // Legacy books retain their existing static fallback image.
    setLayerVisibility(ids) {
      layeredStill = true;
      const visible = new Set(ids);
      for (const [id, { part }] of parts) part.style.display = visible.has(id) ? '' : 'none';
      presentation();
    },
    setSpeed(value) { if ([0.5, 0.75, 1, 1.5, 2].includes(value)) { speed = value; element.dataset.speed = String(speed); } },
    activate: resume, resume,
    pause() { wanted = false; stop(); },
    freezeForTurn() { wanted = false; stop(); },
    reset() { elapsed = 0; lastTime = null; render(); },
    setReducedMotion(value) { reduced = value; if (reduced) { stop(); if (layeredStill) { elapsed = 0; render(); } } presentation(); if (!reduced && wanted) resume(); },
    destroy() { disposed = true; wanted = false; stop(); },
  };
}
