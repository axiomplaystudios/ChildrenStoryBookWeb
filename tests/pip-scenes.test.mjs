import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root='public/books/pip-finds-a-friend/';
const story=JSON.parse(await readFile(root+'story.json'));
const expected={1:['pip-head','pip-eyelids'],2:['rabbit-tear','rabbit-nose'],4:['pip-gaze','rabbit-head'],5:['pip-head','pip-gaze'],6:['pip-body','pip-wing-left','pip-wing-right'],7:['red-ball','rabbit-ear-left','rabbit-ear-right'],8:['rabbit-chest','pip-head']};
for(const [number,ids] of Object.entries(expected)) test(`Pip ${number} has authored moving story parts and loadable assets`,async()=>{
 const scene=story.pages[number-1].scene; assert.ok(scene,`Missing scene ${number}`);
 for(const id of ids) assert.ok(scene.tracks.some(t=>t.layer===id),`Missing motion ${id}`);
 for(const asset of [scene.background,...scene.layers.map(l=>l.image)]) assert.match(await readFile(root+asset,'utf8'),/<svg/);
});
test('bush masks Pip, flight wings inherit body, handover has one ball and loops',async()=>{
 const bush=story.pages[4].scene; assert.ok(bush); assert.equal(bush.layers.at(-1).id,'bush-foreground'); assert.ok(!bush.tracks.some(t=>t.layer==='bush-foreground'));
 const flight=story.pages[5].scene; assert.equal(flight.layers.find(l=>l.id==='pip-wing-left').parent,'pip-body'); assert.equal(flight.tracks.find(t=>t.layer==='pip-body').playback,'repeat');
 const handover=story.pages[6].scene; assert.equal(handover.tracks.find(t=>t.layer==='red-ball').playback,'repeat');
 assert.ok(!(await readFile(root+handover.background,'utf8')).includes('fill="#d96c63"'));
 assert.equal(handover.layers.filter(l=>l.id==='red-ball').length,1);
});

test('flight and handover travel out and back on each cycle',async()=>{
 const {sampleTrack}=await import('../src/scene-motion.js');
 const flight=story.pages[5].scene.tracks.find(t=>t.layer==='pip-body');
 const ball=story.pages[6].scene.tracks.find(t=>t.layer==='red-ball');
 assert.equal(sampleTrack(flight,0).y,56);
 assert.equal(sampleTrack(flight,flight.delayMs+flight.durationMs/2).y,0);
 assert.equal(sampleTrack(ball,0).x,0);
 assert.equal(sampleTrack(ball,ball.delayMs+ball.durationMs/2).x,31);
 for(const track of [flight,ball])assert.deepEqual(sampleTrack(track,track.delayMs),sampleTrack(track,track.delayMs+track.durationMs+track.restMs));
});
test('extracted parts leave no stationary copies and retain original source coordinates',async()=>{
 const background2=await readFile(root+story.pages[1].scene.background,'utf8');
 assert.ok(!background2.includes('#9ed4d8'));assert.ok(!background2.includes('#bb8f98'));
 const flight=story.pages[5].scene;
 assert.ok(!(await readFile(root+flight.background,'utf8')).includes('#8c6c64'));
 const wing=await readFile(root+flight.layers.find(l=>l.id==='pip-wing-left').image,'utf8');
 assert.match(wing,/translate\(430 210\) scale\(0.85\)/);assert.match(wing,/fill="#8c6c64"/);
 assert.ok(!wing.includes('width="720" height="540" fill='));
 assert.equal(story.pages[6].scene.layers.at(-1).id,'red-ball');
});
