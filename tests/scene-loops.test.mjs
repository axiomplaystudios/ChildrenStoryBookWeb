import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sampleTrack} from '../src/scene-motion.js';
const catalog=JSON.parse(await readFile('public/books/catalog.json','utf8'));
for(const {id} of catalog)test(`${id}: every moving part loops through later cycles without visible reset`,async()=>{
 const book=JSON.parse(await readFile(`public/books/${id}/story.json`));
 for(const [i,page]of book.pages.entries())for(const t of page.scene.tracks){
  const label=`${id} page ${i+1} ${t.layer}`;
  assert.equal(t.playback,'repeat',label);assert.ok(t.restMs<=1800,`${label}: long rest`);
  const origin=t.delayMs+(t.preset==='bee-emerge'?1600:0),cycle=t.durationMs+t.restMs;
  const pose=p=>sampleTrack(t,origin+cycle*10+t.durationMs*p);
  assert.notDeepEqual(pose(.1),pose(.45),`${label}: stopped after ten cycles`);
  for(const p of [.1,.45,.8]){
   const a=sampleTrack(t,origin+cycle+t.durationMs*p),b=pose(p);
   for(const key of Object.keys(a))assert.ok(Math.abs(a[key]-b[key])<1e-7,`${label}: cycle differs`);
  }
  const a=sampleTrack(t,origin+cycle*10-.01),b=sampleTrack(t,origin+cycle*10+.01);
  if(a.opacity>.01||b.opacity>.01)for(const key of Object.keys(a))assert.ok(Math.abs(a[key]-b[key])<.1,`${label}: visible jump in ${key}`);
 }
});
test('repeating settle, arrive and eyelid fades return smoothly; once semantics remain available',()=>{
 const base={playback:'repeat',durationMs:2000,restMs:1000,delayMs:0,parameters:{x:30,y:10,angle:5}};
 for(const preset of ['settle','arrive']){
  const t={...base,preset};assert.deepEqual(sampleTrack(t,0),sampleTrack(t,2000));
  assert.notDeepEqual(sampleTrack(t,0),sampleTrack(t,1000));
 }
 const t={...base,preset:'fade-in',parameters:{}};
 assert.equal(sampleTrack(t,0).opacity,0);assert.equal(sampleTrack(t,1000).opacity,1);assert.equal(sampleTrack(t,2000).opacity,0);
 assert.equal(sampleTrack({...t,playback:'once'},5000).opacity,1);
});
