import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRun,dispatch,deriveScene,deriveEnding} from '../src/interactive/state.js';
// Independent route oracle: these tables precede authored data and describe what
// a reader should see. Each original choice must also appear in its recap.
export const EXPECTED={
 'noris-seaside-picnic':[
  ['packing',['wide','small'],['wide-mat','small-mat'],['wide mat','small mat']],
  ['place',['dune','cove'],['dune-shelter','cove-view'],['behind the dune','open cove']],
  ['sharing',['tray','bowls'],['fruit-tray','fruit-bowls'],['one tray','separate bowls']],
  ['shade',['sail','sky'],['shade-sail','open-sky'],['put up the sail','kept the sky open']],
  ['cleanup',['sort','pouch'],['sorted-boxes','carry-pouch'],['sorted the boxes','packed the carry pouch']],
  ['homeward',['cart','hands'],['loaded-cart','carried-basket'],['pulled the cart','carried the basket']]],
 'zuris-rooftop-garden':[
  ['layout',['beds','pots'],['raised-beds','clustered-pots'],['long beds','round pots']],
  ['visitors',['bench','table'],['reading-bench','family-table'],['reading bench','family table']],
  ['plants',['flowers','herbs'],['bright-flowers','herb-leaves'],['flowers opened','herbs grew']],
  ['shelter',['cloth','sun'],['shade-cloth','sunny-corner'],['hung the shade cloth','left the corner sunny']],
  ['path',['loop','direct'],['loop-path','direct-path'],['looping path','straight path']],
  ['watering',['drip','can'],['drip-water','watering-can'],['set a slow drip','watered in the morning']]]};
const load=id=>readFile(new URL(`../authoring/interactive/${id}/pair.json`,import.meta.url),'utf8').then(JSON.parse);
export function route(pair,bits,edition='independent') {let run=createRun(pair,edition);for(let i=0;i<6;i++){const scene=pair.scenes[i],option=EXPECTED[pair.id][i][1][bits[i]];if(i)run=dispatch(run,pair,{type:'NAVIGATE',sceneId:scene.id}).run;const result=dispatch(run,pair,{type:'CHOOSE',activityId:scene.activity.id,optionId:option});assert.equal(result.accepted,true);run=result.run;}return dispatch(run,pair,{type:'NAVIGATE',sceneId:pair.scenes[6].id}).run;}
for(const id of Object.keys(EXPECTED))test(`${id}: independent truth table covers all 64 meaningful routes and repairs`,async()=>{const pair=await load(id);assert.equal(pair.scenes.length,7);assert.equal(pair.endings.recap.length,3);assert.equal(pair.editions.together.prompts.length,4);const endings=new Set();for(let mask=0;mask<64;mask++){const bits=Array.from({length:6},(_,i)=>(mask>>i)&1),run=route(pair,bits),view=deriveScene(pair,run),ending=deriveEnding(pair,run);assert.equal(ending.complete,true);const text=ending.recap.map(r=>r.text).join(' ');for(let i=0;i<6;i++){const [activity,options,layers,clauses]=EXPECTED[id][i];assert.equal(view.state[`choice.${activity}`],options[bits[i]]);assert.ok(text.includes(clauses[bits[i]]),`${mask}: missing ${clauses[bits[i]]}`);let expected=layers[bits[i]];if(id==='zuris-rooftop-garden'&&i===3&&bits[3]===1&&bits[5]===0)expected='repair-parasol';assert.equal(view.visibility[expected],true,`${mask}: ${expected}`);for(const other of layers.filter(l=>l!==expected)){assert.equal(view.visibility[other],false,`${mask}: stale ${other}`);}}
 if(id==='noris-seaside-picnic')assert.equal(view.state.air,bits[3]===0?'sheltered':bits[1]===0?'still':'breezy');if(id==='zuris-rooftop-garden')assert.equal(view.state.shelter,bits[3]===1&&bits[5]===0?'parasol':bits[3]===0?'cloth':'sun');
 if(id==='noris-seaside-picnic'&&bits[1]===1&&bits[3]===0)assert.match(text,/open cove.*later.*sail/);if(id==='zuris-rooftop-garden'&&bits[3]===1&&bits[5]===0){assert.match(text,/sunny.*later.*parasol/);assert.equal(view.visibility['repair-parasol'],true);}else if(id==='zuris-rooftop-garden')assert.equal(view.visibility['repair-parasol'],false);
 endings.add(text);for(let i=0;i<6;i++){const scene=pair.scenes[i];let partial=createRun(pair,'together');for(let j=0;j<=i;j++){if(j)partial=dispatch(partial,pair,{type:'NAVIGATE',sceneId:pair.scenes[j].id}).run;partial=dispatch(partial,pair,{type:'CHOOSE',activityId:pair.scenes[j].activity.id,optionId:EXPECTED[id][j][1][bits[j]]}).run;}const immediate=deriveScene(pair,partial);assert.equal(immediate.visibility[`effect-${bits[i]}`],true);assert.equal(immediate.visibility[`effect-${1-bits[i]}`],false);assert.ok(scene.activity.options[bits[i]].feedback.length>30);}}
 assert.equal(endings.size,64,'all choices survive in complete recap passages');});
for(const id of Object.keys(EXPECTED))test(`${id}: earlier edit clears future choices and recomputes repair`,async()=>{const pair=await load(id);let run=route(pair,[1,1,1,1,1,0]);run=dispatch(run,pair,{type:'NAVIGATE',sceneId:pair.scenes[0].id}).run;const ask=dispatch(run,pair,{type:'CHOOSE',activityId:pair.scenes[0].activity.id,optionId:EXPECTED[id][0][1][0]});assert.equal(ask.reason,'confirmation-required');const changed=dispatch(run,pair,{type:'CONFIRM_CHANGE',...ask.effects[0],type:'CONFIRM_CHANGE'});assert.equal(changed.accepted,true);assert.equal(changed.run.actions.length,1);assert.equal(deriveEnding(pair,changed.run).complete,false);assert.equal(deriveScene(pair,changed.run).state[`choice.${EXPECTED[id][5][0]}`],undefined);});

test('garden: insect visitors are explicit in planting explanation and both persistent plant outcomes',async()=>{const pair=await load('zuris-rooftop-garden');const planting=pair.scenes[2];assert.match(planting.narrative,/butterflies/);assert.match(planting.narrative,/bees/);for(const[option,visitor]of [['flowers','butterfly'],['herbs','bee']]){const o=planting.activity.options.find(o=>o.id===option);assert.ok(o.feedback.includes(visitor));const ending=deriveEnding(pair,route(pair,[0,0,option==='flowers'?0:1,0,0,0]));assert.ok(ending.recap[0].text.includes(visitor));}});
