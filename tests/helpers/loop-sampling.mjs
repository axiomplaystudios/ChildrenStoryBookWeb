import {sampleTrack} from '../../src/scene-motion.js';

// The browser loop test samples every 617 scene-milliseconds. A part whose
// visible movement always falls between those samples would be reported as stopped.
export function posesSeenByBrowserSampling(track, offset = 0) {
  const seen = new Set();
  for (let n = 1; n <= 15; n++) {
    const pose = sampleTrack(track, 60050 + offset + n * 617);
    seen.add(Object.values(pose).map(value => value.toFixed(3)).join('|'));
  }
  return seen.size;
}
