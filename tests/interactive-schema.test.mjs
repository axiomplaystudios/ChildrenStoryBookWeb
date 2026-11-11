import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as schema from '../src/interactive/schema.js';
import {pairFixture} from './fixtures/interactive/pair.mjs';
test('validates content-ready declarative activities and collects unique local images',()=>{
 const pair=pairFixture();assert.equal(typeof schema.validatePair,'function');assert.equal(schema.validatePair(pair),pair);assert.deepEqual(schema.pairAssets(pair),['drawing.svg']);
});
test('rejects unknown activities, missing effects, guidance, bad references and duplicate assets',()=>{
 for(const mutate of [p=>p.scenes[0].activity.kind='javascript',p=>delete p.scenes[2].activity.options[0].effects,p=>delete p.editions.independent.scenes['scene-1'],p=>p.editions.together.prompts[0].sceneId='missing',p=>p.assets.push({...p.assets[0]}),p=>p.scenes[0].activity.targets[0].effects[1].layerId='missing',p=>p.scenes[0].activity.targets[0].accepts=['missing']]){
  const pair=pairFixture();mutate(pair);assert.throws(()=>schema.validatePair(pair),/Invalid|Missing|Unknown|Duplicate/i);
 }
});
test('predicates and effects reject executable, malformed and unbounded rules',()=>{
 const bad=[{op:'eval',code:'return true'},{op:'equals',key:'unknown',value:1},{op:'equals',key:'packed',value:'wrong type'},{op:'all',conditions:[]},{op:'any',conditions:[{op:'equals',key:'packed',value:true}],callback:'x' }];
 let nested={op:'equals',key:'packed',value:true};for(let i=0;i<6;i++)nested={op:'all',conditions:[nested]};bad.push(nested);
 for(const when of bad){const pair=pairFixture();pair.endings.variants[0].when=when;assert.throws(()=>schema.validatePair(pair),/Invalid|Unknown/i);}
 for(const effect of [{type:'run',script:'alert(1)'},{type:'set',key:'missing',value:true},{type:'set',key:'packed',value:()=>true}]){const p=pairFixture();p.scenes[2].activity.options[0].effects=[effect];assert.throws(()=>schema.validatePair(p),/Invalid|Unknown/i);}
});
test('rejects remote/traversal paths, undeclared images, extra code and audio fields',()=>{
 for(const mutate of [p=>p.id='covers',p=>p.cover='../cover.svg',p=>p.scenes[0].activity.items[0].image='https://x.test/x.png',p=>p.cover='absent.png',p=>p.scenes[0].scene.script='run()',p=>p.audio=[],p=>p.initialState.packed=Infinity]){const p=pairFixture();mutate(p);assert.throws(()=>schema.validatePair(p),/Invalid|Unknown|Missing/i);}
});
test('choice predicates retain decision identity alongside repairable state',()=>{
 const p=pairFixture();p.endings.variants[0].when={op:'all',conditions:[{op:'equals',key:'choice.shade',value:'open'},{op:'equals',key:'shelter',value:'covered'}]};assert.equal(schema.validatePair(p),p);
 p.endings.variants[0].when.conditions[0].value='missing';assert.throws(()=>schema.validatePair(p),/Invalid|Unknown/i);
});
test('consequence packages require six meaningful binary choices and three recap beats covering them',()=>{
 const p=pairFixture();p.category='consequences';const base=p.scenes[2];p.scenes=Array.from({length:6},(_,i)=>({...structuredClone(base),id:`decision-${i}`,activity:{...structuredClone(base.activity),id:`choice-${i}`}})).concat(p.scenes.at(-1));
 for(const edition of Object.values(p.editions))edition.scenes=Object.fromEntries(p.scenes.map(s=>[s.id,structuredClone(p.editions.independent.scenes['scene-1'])]));
 p.editions.together.prompts.forEach(q=>q.sceneId='decision-0');
 p.endings.recap=Array.from({length:3},(_,i)=>({decisions:[`choice-${2*i}`,`choice-${2*i+1}`],text:'We remember our preparations.',variants:[{when:{op:'equals',key:`choice.choice-${2*i}`,value:'open'},text:'We chose a view of the sky.'}]}));
 assert.equal(schema.validatePair(p),p);
 const missing=structuredClone(p);missing.endings.recap[2].decisions.pop();assert.throws(()=>schema.validatePair(missing),/recap/i);
 const meaningless=structuredClone(p);meaningless.scenes[0].activity.options[1].effects=structuredClone(meaningless.scenes[0].activity.options[0].effects);assert.throws(()=>schema.validatePair(meaningless),/meaningful|effect/i);
});
test('discovery screen alternatives support bounded picture matching and visual sequences',()=>{
 const p=pairFixture(),a=p.scenes[3].activity;a.screen={label:'Copy the round-square-round pattern',image:'drawing.svg',mode:'sequence',options:[{id:'round',label:'Round shape',image:'drawing.svg'},{id:'square',label:'Square shape',image:'drawing.svg'}],answer:['round','square','round']};assert.equal(schema.validatePair(p),p);
 a.screen.answer=['absent'];assert.throws(()=>schema.validatePair(p),/Invalid/i);
 a.screen.answer=Array(13).fill('round');assert.throws(()=>schema.validatePair(p),/Invalid/i);
});
test('rejects non-JSON nested values and prototype keys before packages reach reducers',()=>{
 for(const mutate of [p=>{const params=new Date();params.amount=.02;p.scenes[0].scene.tracks[0].parameters=params;},p=>p.scenes[0].scene.layers[0].pivot.callback=()=>{},p=>p.scenes[0].id='constructor']){const p=pairFixture();mutate(p);assert.throws(()=>schema.validatePair(p),/Invalid/i);}
});
