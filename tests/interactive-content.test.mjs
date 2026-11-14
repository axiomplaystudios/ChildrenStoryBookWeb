import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePair} from '../src/interactive/schema.js';
import {createRun,dispatch,deriveScene,deriveEnding} from '../src/interactive/state.js';

// Independent recipe: changing a quantity/type/order must update the actual
// pictures and this editorial recipe deliberately, rather than passing a schema.
export const bakeryRecipe=[
 ['welcome',null,0,null],['first-plate','bun',1,'plate'],
 ['two-for-the-door','bun',2,'basket'],['star-place','star',1,'star-plate'],
 ['three-for-the-bench','bun',3,'box'],['four-for-friends','star',4,'tray'],
 ['five-for-the-table','bun',5,'table'],['breakfast',null,0,null],
];
async function bakery(){let value;try{value=JSON.parse(await readFile('authoring/interactive/amaras-busy-bakery/pair.json','utf8'));}catch{}assert.ok(value,'the authored Bakery package must exist');return value;}
test('Bakery has an opening, six purposeful jobs, ending and two distinct read-aloud scaffolds',async()=>{
 const p=await bakery();validatePair(p);assert.equal(p.category,'small-jobs');assert.deepEqual(p.scenes.map(s=>s.id),bakeryRecipe.map(r=>r[0]));
 assert.deepEqual(Object.keys(p.editions).sort(),['independent','together']);assert.equal(p.scenes.filter(s=>s.activity).length,6);
 for(const s of p.scenes){assert.ok(s.narrative.length>75);const a=p.editions.together.scenes[s.id],b=p.editions.independent.scenes[s.id];assert.notEqual(a.instruction,b.instruction);for(const g of [a,b]){assert.ok(g.feedback.complete.length>10);assert.ok(g.feedback.retry.length>10);assert.ok(g.demonstration.length>=2);}}
 assert.equal(p.editions.together.prompts.length,4);assert.match(p.credit,/original/i);assert.match(p.scenes[0].narrative,/Amara/);assert.match(p.scenes[0].narrative,/Grandpa/);assert.match(p.endings.text,/welcome|neighbou?r/i);
 assert.doesNotMatch(JSON.stringify(p),/\b(mouse|rabbit|bear|Pip|owl)\b/i);
});
test('Bakery pictured order totals agree with independent recipe and runtime completed layers',async()=>{
 const p=await bakery();for(const edition of ['together','independent']){let run=createRun(p,edition);
 for(const [sceneId,type,total,targetId]of bakeryRecipe){let result;if(run.sceneId!==sceneId){result=dispatch(run,p,{type:'NAVIGATE',sceneId});assert.equal(result.accepted,true);run=result.run;}if(!type)continue;
 const s=p.scenes.find(s=>s.id===sceneId),a=s.activity;assert.equal(a.kind,'place');const target=a.targets.find(t=>t.id===targetId);assert.equal(target.required,total);assert.deepEqual(target.accepts,[type]);assert.equal(a.items.find(i=>i.id===type).quantity,total);
 const order=await readFile(`authoring/interactive/${p.id}/${target.image}`,'utf8');assert.equal((order.match(/id="counted-/g)||[]).length,total,`${sceneId} order illustration quantity`);
 const foreground=s.scene.layers.find(l=>l.id==='foreground');const picturedOrder=await readFile(`authoring/interactive/${p.id}/${foreground.image}`,'utf8');assert.equal((picturedOrder.match(/id="order-food-/g)||[]).length,total,`${sceneId} main scene picture order quantity`);
 const completedLayer=s.scene.layers.find(l=>l.id==='completed');assert.ok(completedLayer);const finished=await readFile(`authoring/interactive/${p.id}/${completedLayer.image}`,'utf8');assert.equal((finished.match(/id="counted-/g)||[]).length,total,`${sceneId} completed illustration quantity`);
 assert.equal(deriveScene(p,run).visibility.completed,false);for(let copyIndex=0;copyIndex<total;copyIndex++){result=dispatch(run,p,{type:'PLACE',activityId:a.id,itemId:type,copyIndex,targetId});assert.equal(result.accepted,true);run=result.run;assert.equal(deriveScene(p,run).visibility.completed,copyIndex===total-1);}
 assert.equal(deriveScene(p,run).activity.complete,true);
 }
 assert.equal(deriveEnding(p,run).complete,true);
 }
});

test('Bakery ribbon loops continuously at late cycles and completed food has no decorative track',async()=>{
 const {sampleTrack}=await import('../src/scene-motion.js');const p=await bakery();
 for(const s of p.scenes){assert.ok(s.scene.tracks.every(t=>t.layer==='ribbon'));for(const speed of [.5,1,2])for(const t of s.scene.tracks){const cycle=t.durationMs+t.restMs;for(const boundary of [cycle,cycle*17,cycle*101]){const before=sampleTrack(t,boundary-.001*speed),after=sampleTrack(t,boundary+.001*speed);for(const k of ['x','y','angle','opacity'])assert.ok(Math.abs(before[k]-after[k])<.001,`${s.id} ${speed} ${k} loop continuity`);}assert.ok(Math.abs(sampleTrack(t,t.durationMs/12).angle)>1,'ribbon has meaningful part rotation');}}
});
