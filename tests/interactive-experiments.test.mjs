import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePair} from '../src/interactive/schema.js';
import {createRun,dispatch,deriveScene,deriveEnding} from '../src/interactive/state.js';
const recipes=[{id:'tavis-dinosaur-ramp-rally',controls:['low','high'],outcomes:['near','far'],variable:/tilt/i,fixed:/cart.*ramp.*surface/i},{id:'mina-and-the-shadow-stage',controls:['near-light','near-screen'],outcomes:['large','small'],variable:/puppet.*position/i,fixed:/light.*screen.*puppet/i}];
async function load(id){let p;try{p=JSON.parse(await readFile(`authoring/interactive/${id}/pair.json`,'utf8'));}catch{}assert.ok(p,`authored ${id} package exists`);return p;}
for(const recipe of recipes){
 test(`${recipe.id}: eight connected scenes and distinct read-aloud editions`,async()=>{const p=await load(recipe.id);validatePair(p);assert.equal(p.category,'experiments');assert.equal(p.scenes.length,8);assert.equal(p.scenes.filter(s=>s.activity).length,6);for(const s of p.scenes){assert.ok(s.narrative.length>80);for(const edition of ['together','independent']){const g=p.editions[edition].scenes[s.id];assert.ok(g.demonstration.length>=2);assert.doesNotMatch(JSON.stringify(g),/correct|wrong|score|well done/i);}assert.notEqual(p.editions.together.scenes[s.id].instruction,p.editions.independent.scenes[s.id].instruction);}assert.equal(p.editions.together.prompts.length,4);assert.match(JSON.stringify(p),/illustrative/);assert.doesNotMatch(JSON.stringify(p),/Amara|Grandpa|\bPip\b|\bOwl\b|\bRabbit\b|\bBear\b/);});
 test(`${recipe.id}: predictions gate all trials; retries compare stable distinct outcomes without scoring`,async()=>{const p=await load(recipe.id);for(const edition of ['together','independent']){let run=createRun(p,edition);for(const s of p.scenes){if(run.sceneId!==s.id){const nav=dispatch(run,p,{type:'NAVIGATE',sceneId:s.id});assert.equal(nav.accepted,true);run=nav.run;}if(!s.activity)continue;const a=s.activity;assert.equal(a.kind,'experiment');assert.match(a.variable,recipe.variable);assert.match(a.fixed.join(' '),recipe.fixed);assert.deepEqual(a.controls.map(c=>c.id),recipe.controls);assert.equal(new Set(a.outcomes.map(o=>o.image)).size,2);assert.ok(a.comparison.length>50);
 let r=dispatch(run,p,{type:'SELECT',activityId:a.id,controlId:recipe.controls[0],trialIndex:0});assert.equal(r.accepted,true);run=r.run;assert.equal(dispatch(run,p,{type:'TEST',activityId:a.id,trialIndex:0}).accepted,false);
 for(let i=0;i<3;i++){if(i){r=dispatch(run,p,{type:'RETRY',activityId:a.id,trialIndex:i-1});assert.equal(r.accepted,true);run=r.run;assert.equal(deriveScene(p,run).activity.predictionId,null);}r=dispatch(run,p,{type:'SELECT',activityId:a.id,controlId:recipe.controls[i%2],trialIndex:i});run=r.run;r=dispatch(run,p,{type:'PREDICT',activityId:a.id,predictionId:a.predictions[(i+1)%2].id,trialIndex:i});assert.equal(r.accepted,true);run=r.run;r=dispatch(run,p,{type:'TEST',activityId:a.id,trialIndex:i});assert.equal(r.accepted,true);run=r.run;const view=deriveScene(p,run);assert.equal(view.activity.trials.length,i+1);assert.equal(view.visibility[recipe.outcomes[i%2]],true);assert.equal(view.visibility[recipe.outcomes[(i+1)%2]],false);assert.equal(view.activity.trials[i].observation,a.outcomes[i%2].observation);assert.equal(Object.hasOwn(view.activity,'score'),false);assert.equal(dispatch(run,p,{type:'TEST',activityId:a.id,trialIndex:i}).accepted,false);}
 const trials=deriveScene(p,run).activity.trials;assert.equal(trials[0].observation,trials[2].observation);assert.notEqual(trials[0].observation,trials[1].observation);
 }assert.equal(deriveEnding(p,run).complete,true);}});
 test(`${recipe.id}: outcome art and guidance use real model diagrams; late motion leaves outcome layers still`,async()=>{const p=await load(recipe.id),{sampleTrack}=await import('../src/scene-motion.js');for(const s of p.scenes){for(const t of s.scene.tracks){assert.ok(!recipe.outcomes.includes(t.layer));for(const speed of [.5,1,2])for(const cycle of [17,101]){const before=sampleTrack(t,(t.durationMs+t.restMs)*cycle-.001*speed),after=sampleTrack(t,(t.durationMs+t.restMs)*cycle+.001*speed);assert.ok(Math.abs(before.angle-after.angle)<.001);}}if(s.activity){for(const o of s.activity.outcomes){const art=await readFile(`authoring/interactive/${p.id}/${o.image}`,'utf8');assert.match(art,/id="model-/);if(p.id.startsWith('mina'))assert.match(art,/id="ray-/);}}}});
}
test('ramp tilt raises the same length hinged ramp; shadow boundaries obey fixed point-light geometry',async()=>{
 const ramp=await load('tavis-dinosaur-ramp-rally');for(const s of ramp.scenes.filter(s=>s.activity)){const lengths=[];for(const [index,o]of s.activity.outcomes.entries()){const art=await readFile(`authoring/interactive/${ramp.id}/${o.image}`,'utf8'),m=art.match(/d="M([\d.]+) ([\d.]+) 420 460 875 460"/);assert.ok(m,'same fixed hinge and rollout endpoint');const sx=Number(m[1]),sy=Number(m[2]);lengths.push(Math.hypot(420-sx,460-sy));assert.equal(sy,index===0?320:220);assert.match(art,/SAME RAMP LENGTH/);}assert.ok(Math.abs(lengths[0]-lengths[1])<.00001);}
 const shadow=await load('mina-and-the-shadow-stage');for(const s of shadow.scenes.filter(s=>s.activity))for(const[index,o]of s.activity.outcomes.entries()){const art=await readFile(`authoring/interactive/${shadow.id}/${o.image}`,'utf8'),m=art.match(/d="M120 340 800 ([\d.]+) M120 340 800 ([\d.]+)"/);assert.ok(m);const d=index===0?250:480;assert.ok(Math.abs(Number(m[1])-(340-40*680/d))<.00001);assert.ok(Math.abs(Number(m[2])-(340+40*680/d))<.00001);}
});
test('prediction pictures describe only an expected result, without implying another setup selection', async () => {
 for (const id of ['tavis-dinosaur-ramp-rally', 'mina-and-the-shadow-stage']) {
  const pair = await load(id);
  for (const scene of pair.scenes.filter(scene => scene.activity)) {
   for (const prediction of scene.activity.predictions) {
    const image = await readFile(`authoring/interactive/${id}/${prediction.image}`, 'utf8');
    assert.doesNotMatch(image,
     /model-ramp-|model-puppet-|ray-top-bottom|FIXED LIGHT|FIXED HINGE|Same ramp (raised|lowered)|Near the (light|screen)/,
     'a prediction must not depict or name a selected apparatus configuration');
    assert.match(image, /id="prediction-result-/, 'prediction has an independent result illustration');
   }
   for (const edition of ['together', 'independent']) {
    const steps = pair.editions[edition].scenes[scene.id].demonstration;
    assert.equal(steps[0].controlId, scene.activity.controls[0].id);
    assert.equal(steps[1].predictionId, scene.activity.predictions[1].id);
    assert.equal(steps[1].controlId, undefined);
    assert.equal(steps[1].image, scene.activity.predictions[1].image);
   }
  }
 }
});


for (const id of ['tavis-dinosaur-ramp-rally', 'mina-and-the-shadow-stage']) {
 test(`${id}: one setup reaches an ending without claiming unobserved trials`, async () => {
  const pair = await load(id);
  for (const edition of ['together', 'independent']) for (const controlIndex of [0, 1]) {
   let run = createRun(pair, edition);
   const observations = new Set();
   for (const scene of pair.scenes) {
    if (run.sceneId !== scene.id) run = dispatch(run, pair, {type:'NAVIGATE',sceneId:scene.id}).run;
    if (!scene.activity) continue;
    const a = scene.activity;
    for (const action of [
     {type:'SELECT',activityId:a.id,controlId:a.controls[controlIndex].id,trialIndex:0},
     {type:'PREDICT',activityId:a.id,predictionId:a.predictions[controlIndex].id,trialIndex:0},
     {type:'TEST',activityId:a.id,trialIndex:0},
    ]) { const result = dispatch(run, pair, action); assert.equal(result.accepted, true); run = result.run; }
    observations.add(deriveScene(pair, run).activity.trials[0].observation);
   }
   assert.equal(observations.size, 1);
   const ending = deriveEnding(pair, run);
   assert.equal(ending.complete, true);
   assert.doesNotMatch(ending.text, /has watched.*farther|remembers.*(repeated trials|two observations)/i);
   assert.match(ending.text, /can|could/i);
   assert.doesNotMatch(pair.editions[edition].scenes.ending.instruction + (pair.editions[edition].reflection ?? ''), /noticed in the two puppet positions|compare the near and far deliveries|look back at the two cart stops/i);
  }
 });
}
