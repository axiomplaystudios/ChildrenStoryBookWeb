import test from 'node:test';
import assert from 'node:assert/strict';
import { createIllustration } from '../src/illustration.js';

test('real controller scales elapsed time, changes speed continuously, pauses and replays once tracks', async () => {
  const elements = [];
  const element = () => { const attrs = {}; const el = { dataset: {}, classList: {add(){}}, append(){}, setAttribute(k,v){attrs[k]=v;}, toggleAttribute(){}, getAttribute(k){return attrs[k];} }; elements.push(el); return el; };
  const originals = Object.fromEntries(['document','Image','requestAnimationFrame','cancelAnimationFrame'].map(k => [k, globalThis[k]]));
  let scheduled;
  globalThis.document = {createElement: element, createElementNS: element};
  globalThis.Image = class { set src(v){ queueMicrotask(() => this.onload()); } decode(){return Promise.resolve();} };
  globalThis.requestAnimationFrame = fn => { scheduled = fn; return 1; };
  globalThis.cancelAnimationFrame = () => { scheduled = null; };
  const step = t => { const fn = scheduled; scheduled = null; fn?.(t); };
  try {
    const controller = createIllustration({bookId:'book', page:{image:'still.svg', alt:'Scene', scene:{width:100,height:100,background:'bg.svg',layers:[{id:'moving',image:'part.svg',x:0,y:0,width:10,height:10,pivot:[0,0]}],tracks:[{layer:'moving',preset:'sleep-rise',playback:'once',durationMs:1000,delayMs:100,restMs:0,parameters:{distanceY:100}}]}}});
    await controller.ready;
    assert.equal(typeof controller.setSpeed, 'function');
    const part = elements.find(el => el.getAttribute('data-layer') === 'moving');
    const y = () => Number(part.getAttribute('transform').match(/^translate\(0\.000 ([^)]+)\)/)[1]);
    controller.setSpeed(0.5); controller.activate(); step(0); step(400);
    assert.equal(y(), -10); // 200 scene milliseconds, including the delay.
    const before = part.getAttribute('transform'); controller.setSpeed(2);
    assert.equal(part.getAttribute('transform'), before);
    step(500); assert.equal(y(), -30); // 100 wall milliseconds advanced 200 scene milliseconds.
    controller.pause(); step(900); assert.equal(y(), -30);
    controller.resume(); step(2000); step(2100); assert.equal(y(), -50);
    step(3000); assert.equal(controller.element.dataset.playing, 'false');
    controller.reset(); controller.resume(); step(3100); step(3200); assert.equal(y(), -10);
    controller.setReducedMotion(true); assert.equal(controller.element.dataset.playing, 'false');
    controller.reset(); controller.resume(); assert.equal(controller.element.dataset.playing, 'false');
    controller.destroy();
  } finally { for (const [key,value] of Object.entries(originals)) value === undefined ? delete globalThis[key] : globalThis[key] = value; }
});
