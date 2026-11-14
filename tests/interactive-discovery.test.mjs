import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePair} from '../src/interactive/schema.js';
import {createRun,dispatch,deriveScene,deriveEnding} from '../src/interactive/state.js';

// Editorial recipes are independent of the generators. A changed clue, matching
// answer or visual rhythm must be intentionally reviewed against this recipe.
export const discoveryRecipes={
 'imani-and-the-lost-shape-map':[['round-lagoon','match',['circle']],['triangle-pass','match',['triangle']],['square-gate','match',['square']],['arch-cove','match',['arch']],['stepping-shapes','sequence',['circle','triangle','square']],['homeward-trail','sequence',['square','circle','square','circle']]],
 'the-penguin-sound-post':[['pebble-message','sequence',['dot','dot']],['long-ice-bridge','sequence',['dash','dot']],['lantern-bay','sequence',['dot','dash','dot']],['quiet-inlet','sequence',['dot','pause','dot']],['twin-towers','sequence',['dash','dash','dot']],['welcome-harbour','sequence',['dot','dash','dot','dash']]],
};
async function load(id){let p;try{p=JSON.parse(await readFile(`authoring/interactive/${id}/pair.json`,'utf8'));}catch{}assert.ok(p,`${id}: authored discovery package is required`);return p;}
for(const[id,recipe]of Object.entries(discoveryRecipes)){
 test(`${id}: eight connected scenes with six accessible screen discoveries`,async()=>{const p=await load(id);validatePair(p);assert.equal(p.category,'discovery');assert.equal(p.scenes.length,8);assert.deepEqual(p.scenes.slice(1,7).map(s=>s.id),recipe.map(r=>r[0]));assert.equal(p.scenes[0].activity,undefined);assert.equal(p.scenes[7].activity,undefined);
 for(let i=0;i<6;i++){const s=p.scenes[i+1],a=s.activity;assert.equal(a.kind,'discover');assert.equal(a.screen.mode,recipe[i][1]);assert.deepEqual(a.screen.answer,recipe[i][2]);assert.match(a.physicalPrompt,/optional/i);assert.match(a.adultHelp,/adult/i);assert.match(a.adultHelp,/skip|screen/i);assert.match(a.adultHelp,/seated|stay|remain/i);assert.doesNotMatch(a.physicalPrompt,/must|find a|fetch|upload|record|microphone|permission|timer/i);assert.ok(s.narrative.length>100);assert.ok(s.scene.layers.length>=4);assert.deepEqual(s.hiddenLayers,['completed']);assert.ok(a.effects.some(e=>e.type==='show'&&e.layerId==='completed'));assert.ok(s.scene.tracks.every(t=>t.layer!=='completed'&&t.restMs<=1800));
 const picture=await readFile(`authoring/interactive/${id}/${a.screen.image}`,'utf8');assert.deepEqual([...picture.matchAll(/id="symbol-(circle|triangle|square|arch|dot|dash|pause)-/g)].map(m=>m[1]),recipe[i][2],`${s.id}: reference pictures show the exact editorial order`);
 }
 for(const s of p.scenes){const t=p.editions.together.scenes[s.id],n=p.editions.independent.scenes[s.id];assert.notEqual(t.instruction,n.instruction);assert.ok(t.demonstration.length>=2);assert.ok(n.demonstration.length>=2);assert.ok(s.alt.length>60);}
 assert.deepEqual(p.editions.together.prompts.map(p=>p.type).sort(),['feeling','literal','literal','personal']);assert.doesNotMatch(JSON.stringify(p),/\b(Amara|Grandpa|Pip|mouse|rabbit)\b/i);
 });
 for(const edition of ['together','independent'])for(const completion of ['ANSWER','PHYSICAL','SKIP'])test(`${id}: ${edition} ${completion} path reaches same ending without proof`,async()=>{const p=await load(id);let run=createRun(p,edition);for(const s of p.scenes){if(run.sceneId!==s.id){const moved=dispatch(run,p,{type:'NAVIGATE',sceneId:s.id});assert.equal(moved.accepted,true);run=moved.run;}if(!s.activity)continue;const a=s.activity;assert.equal(deriveScene(p,run).visibility.completed,false);
 if(completion==='ANSWER'){const wrong=a.screen.options.find(o=>o.id!==a.screen.answer[0]).id;const r=dispatch(run,p,{type:'ANSWER',activityId:a.id,optionIds:[wrong]});assert.equal(r.accepted,true);assert.equal(deriveScene(p,r.run).activity.complete,false);run=r.run;}
 const result=dispatch(run,p,{type:completion,activityId:a.id,...(completion==='ANSWER'?{optionIds:a.screen.answer}:{})});assert.equal(result.accepted,true);run=result.run;assert.equal(deriveScene(p,run).activity.path,completion.toLowerCase()==='answer'?'answer':completion.toLowerCase());assert.equal(deriveScene(p,run).visibility.completed,true);
 }assert.equal(deriveEnding(p,run).complete,true);assert.equal(deriveEnding(p,run).text,p.endings.text);});
}
test('Penguin visual pattern work never requires hearing or making a sound',async()=>{const p=await load('the-penguin-sound-post');assert.match(p.scenes[0].narrative,/pictures|visual/i);for(const s of p.scenes.filter(s=>s.activity)){assert.match(s.activity.adultHelp,/sound|silent/i);assert.match(s.activity.screen.label,/left to right/i);assert.doesNotMatch(s.activity.screen.label,/listen|hear/i);}});

test('Discovery decorative loops remain continuous at late cycles and preserve completion layers',async()=>{const{sampleTrack}=await import('../src/scene-motion.js');for(const id of Object.keys(discoveryRecipes)){const p=await load(id);for(const s of p.scenes)for(const track of s.scene.tracks){assert.equal(track.layer,'wind');for(const cycle of [1,19,101]){const time=cycle*(track.durationMs+track.restMs);const a=sampleTrack(track,time-.001),b=sampleTrack(track,time+.001);for(const k of ['x','y','angle','opacity'])assert.ok(Math.abs(a[k]-b[k])<.001,`${id} ${s.id} ${k} loop continuity`);}assert.ok(Math.abs(sampleTrack(track,track.durationMs/12).angle)>1,'decorative motion has a visible pose');}}});


test('Imani offers optional adult-assisted familiar-object arranging beside a complete screen sequence', async () => {
 const pair = await load('imani-and-the-lost-shape-map');
 const scene = pair.scenes.find(s => s.id === 'stepping-shapes');
 assert.match(scene.activity.physicalPrompt, /arrange/i);
 assert.match(scene.activity.physicalPrompt, /adult/i);
 assert.match(scene.activity.physicalPrompt, /familiar objects/i);
 assert.match(scene.activity.physicalPrompt, /already.*(nearby|reach)|within reach/i);
 assert.match(scene.activity.adultHelp, /no materials.*(needed|required)/i);
 assert.match(scene.activity.adultHelp, /skip/i);
 assert.deepEqual(scene.activity.screen.answer, ['circle', 'triangle', 'square']);
 for (const edition of ['together', 'independent']) {
  assert.match(pair.editions[edition].scenes[scene.id].instruction, /row|circle.*triangle.*square/i);
 }
});
