import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {validateStory} from '../src/story.js';
import {sampleTrack} from '../src/scene-motion.js';
const root='public/books/sleepy-mr-sloth/';
const targets=['sloth-jaw','sloth-torso','giraffe-ear','giraffe-jaw','bee-1','bee-1','snake-tail','snake-head','bird-toes','bird-beak','sloth-eyelids','sleep-mark-1'];
for(const [i,id] of targets.entries()) test(`Sloth ${i+1} has its named story action with local assets`,async()=>{
 const story=JSON.parse(await readFile(root+'story.json','utf8'));validateStory(story);
 const scene=story.pages[i].scene;
 assert.ok(scene,`missing scene ${i+1}`);
 assert.ok(scene.tracks.some(t=>t.layer===id),`missing ${id}`);
 for(const file of [scene.background,...scene.layers.map(l=>l.image)])await access(root+file);
 const track=scene.tracks.find(t=>t.layer===id);
 assert.notDeepEqual(sampleTrack(track,track.delayMs),sampleTrack(track,track.delayMs+track.durationMs*.4));
});
test('sleep marks rise and fade; eyelids close once and stay closed',()=>{
 const t={preset:'sleep-rise',playback:'repeat',durationMs:2000,restMs:1000,delayMs:0,parameters:{distanceY:32}};
 assert.equal(sampleTrack(t,1000).y,-16);
 assert.ok(sampleTrack(t,2000).opacity < 0.001);
 const eye={...t,preset:'fade-in',playback:'once',parameters:{}};
 assert.equal(sampleTrack(eye,0).opacity,0);
 assert.equal(sampleTrack(eye,4000).opacity,1);
});
