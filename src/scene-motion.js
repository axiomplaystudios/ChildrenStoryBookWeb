// Scene poses are written to SVG attributes, so StPageFlip's DOM clones inherit
// a frozen visual pose. No animation/timer is attached to a temporary page copy.
export const presetParameters = {
  'gesture': { x: [-400, 400], y: [-400, 400], angle: [-90, 90] },
  'settle': { x: [-400, 400], y: [-400, 400], angle: [-180, 180] },
  'arrive': { x: [-400, 400], y: [-400, 400], angle: [-180, 180] },
  'breathe': { amount: [0.001, 0.08] },
  'blink': {},
  'fade-in': {},
  'sleep-rise': { distanceY: [1, 200] },
  'flap': { angle: [-90, 90] },
  'tear-fall': { distanceY: [1, 300] },
  'bee-flight': { radiusX: [1, 400], radiusY: [1, 300], phase: [-360, 360] },
  'bee-emerge': { radiusX: [1, 400], radiusY: [1, 300], phase: [-360, 360], fromX: [-1024, 1024], fromY: [-1024, 1024] },
  'squawk': { angle: [-45, 45] },
};

export function sampleTrack(track, elapsed) {
  if (track.preset === 'bee-emerge') {
    const local = Math.max(0, elapsed - track.delayMs);
    if (local < 1600) {
      const t = local / 1600;
      const remaining = 1 - t * t * (3 - 2 * t);
      return { x: track.parameters.fromX * remaining, y: track.parameters.fromY * remaining,
        angle: 0, opacity: elapsed < track.delayMs ? 0 : Math.min(1, t * 5) };
    }
    return sampleTrack({ ...track, preset: 'bee-flight', delayMs: 0 }, local - 1600);
  }
  const local = Math.max(0, elapsed - track.delayMs);
  const cycle = track.durationMs + track.restMs;
  const time = track.playback === 'repeat' ? local % cycle : local;
  const progress = Math.min(1, time / track.durationMs);
  const p = track.parameters;
  const smooth = progress * progress * (3 - 2 * progress);
  // Repeated transitions travel out and back within one duration, then rest.
  // Their endpoints match, avoiding a visible teleport at the cycle boundary.
  const triangle = progress <= .5 ? progress * 2 : (1 - progress) * 2;
  const roundTrip = triangle * triangle * (3 - 2 * triangle);
  const transition = track.playback === 'repeat' ? roundTrip : smooth;
  if (track.preset === 'fade-in') return { x: 0, y: 0, angle: 0, opacity: transition };
  if (track.preset === 'sleep-rise') return { x: 0, y: -p.distanceY * progress, angle: 0, opacity: elapsed < track.delayMs ? 0 : Math.sin(Math.PI * progress) };
  if (['gesture', 'settle', 'arrive'].includes(track.preset)) {
    const amount = track.preset === 'gesture' ? Math.sin(Math.PI * progress) : track.preset === 'arrive' ? 1 - transition : transition;
    return { x: p.x * amount, y: p.y * amount, angle: p.angle * amount, opacity: 1 };
  }
  if (track.preset === 'breathe') return { x: 0, y: 0, angle: 0, opacity: 1, scaleY: 1 + p.amount * Math.sin(Math.PI * progress) ** 2 };
  if (track.preset === 'blink') return { x: 0, y: 0, angle: 0, opacity: Math.sin(Math.PI * progress) ** 8 };
  if (track.preset === 'flap') return { x: 0, y: 0, angle: p.angle * Math.sin(progress * 6 * Math.PI), opacity: 1 };
  if (track.preset === 'tear-fall') {
    return { x: 0, y: p.distanceY * progress * progress, angle: 0,
      opacity: elapsed < track.delayMs ? 0 : Math.min(1, progress * 8) * Math.max(0, Math.min(1, (1 - progress) * 5)) };
  }
  if (track.preset === 'bee-flight') {
    const phase = p.phase * Math.PI / 180;
    const theta = progress * Math.PI * 2;
    return { x: p.radiusX * (Math.sin(theta + phase) - Math.sin(phase)),
      y: p.radiusY * (Math.sin(theta * 2 + phase) - Math.sin(phase)),
      angle: Math.sin(theta) * 8, opacity: 1 };
  }
  // Two calls, then a quiet rest. At the endpoint the beak returns to its
  // illustrated pose, so repeating the sequence never snaps it across the face.
  return { x: 0, y: 0, angle: p.angle * Math.sin(progress * Math.PI * 2) ** 2, opacity: 1 };
}
