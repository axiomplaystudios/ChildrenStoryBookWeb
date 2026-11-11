import test from 'node:test';
import assert from 'node:assert/strict';
import {pairFixture} from './fixtures/interactive/pair.mjs';
import {validatePair} from '../src/interactive/schema.js';
const api = await import('../src/interactive/state.js').catch(() => ({}));
const {createRun, dispatch, deriveScene, deriveEnding} = api;
const act = (pair, run, action) => { const result=dispatch(run,pair,action); assert.equal(result.accepted,true,JSON.stringify(result)); return result.run; };
const move=(pair,run,sceneId)=>act(pair,run,{type:'NAVIGATE',sceneId});
const place=(pair,run,copyIndex=0)=>act(pair,run,{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex,targetId:'box'});

test('runtime exports the deterministic run contract',()=>assert.equal(typeof createRun,'function'));
test('placements consume identified copies once and cannot skip unresolved work',()=>{
 const pair=pairFixture(); pair.scenes[0].activity.items[0].quantity=2;pair.scenes[0].activity.targets[0].required=2;
 let run=createRun(pair,'together'); const before=structuredClone(run);
 assert.equal(dispatch(run,pair,{type:'NAVIGATE',sceneId:'scene-2'}).accepted,false);
 const action={type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'};
 assert.deepEqual(dispatch(run,pair,action),dispatch(run,pair,action)); assert.deepEqual(run,before);
 run=place(pair,run); assert.equal(deriveScene(pair,run).activity.complete,false);
 assert.equal(dispatch(run,pair,action).accepted,false); assert.equal(deriveScene(pair,run).activity.remainingCopies.length,1);
 run=place(pair,run,1);assert.equal(deriveScene(pair,run).activity.complete,true);
 assert.equal(deriveScene(pair,run).state.packed,true);
 run=move(pair,run,'scene-2');run=move(pair,run,'scene-1');assert.equal(deriveScene(pair,run).activity.placements.length,2);
});
test('experiments separate configuration and prediction; TEST is once per trial and retry retains history',()=>{
 const pair=pairFixture();let run=move(pair,place(pair,createRun(pair,'independent')),'scene-2');
 const send=action=>{run=act(pair,run,{activityId:'roll',trialIndex:0,...action});};
 send({type:'PREDICT',predictionId:'far'});assert.equal(deriveScene(pair,run).activity.controlId,null);
 assert.equal(dispatch(run,pair,{type:'TEST',activityId:'roll',trialIndex:0}).accepted,false);
 send({type:'SELECT',controlId:'low'});send({type:'TEST'});
 assert.equal(dispatch(run,pair,{type:'TEST',activityId:'roll',trialIndex:0}).accepted,false);
 assert.equal(deriveScene(pair,run).activity.trials[0].observation,'The cart stops near the line.');
 send({type:'RETRY'});assert.equal(deriveScene(pair,run).activity.trials.length,1);
 assert.equal(dispatch(run,pair,{type:'TEST',activityId:'roll',trialIndex:1}).accepted,false);
 assert.equal(dispatch(run,pair,{type:'PREDICT',activityId:'roll',trialIndex:0,predictionId:'near'}).accepted,false);
 run=act(pair,run,{type:'PREDICT',activityId:'roll',trialIndex:1,predictionId:'near'});
 run=act(pair,run,{type:'TEST',activityId:'roll',trialIndex:1});assert.equal(deriveScene(pair,run).activity.trials.length,2);
});
function reachChoice(pair){let run=move(pair,place(pair,createRun(pair,'together')),'scene-2');for(const a of [{type:'SELECT',controlId:'high'},{type:'PREDICT',predictionId:'near'},{type:'TEST'}])run=act(pair,run,{activityId:'roll',trialIndex:0,...a});return move(pair,run,'scene-3');}
test('choice edits request confirmation and clear later results only when confirmed',()=>{
 const pair=pairFixture();let run=act(pair,reachChoice(pair),{type:'CHOOSE',activityId:'shade',optionId:'covered'});
 run=move(pair,run,'scene-4');run=act(pair,run,{type:'SKIP',activityId:'notice'});run=move(pair,run,'finish');
 assert.equal(deriveEnding(pair,run).complete,true);run=move(pair,run,'scene-3');
 const before=structuredClone(run);const change={type:'CHOOSE',activityId:'shade',optionId:'open'};const pending=dispatch(run,pair,change);
 assert.equal(pending.accepted,false);assert.equal(pending.effects[0].type,'confirm-choice-edit');assert.deepEqual(pending.run,before);
 run=act(pair,run,{type:'CONFIRM_CHANGE',activityId:'shade',optionId:'open',token:pending.effects[0].token});assert.equal(run.sceneId,'scene-3');assert.equal(deriveEnding(pair,run).complete,false);
 run=move(pair,run,'scene-4');assert.equal(deriveScene(pair,run).activity.complete,false);assert.equal(deriveScene(pair,run).state.shelter,'open');
});
test('discovery alternatives keep physical, skip, match and ordered sequence distinct',()=>{
 for(const type of ['PHYSICAL','SKIP','ANSWER']){const pair=pairFixture();let run=move(pair,act(pair,reachChoice(pair),{type:'CHOOSE',activityId:'shade',optionId:'open'}),'scene-4');
 assert.equal(deriveEnding(pair,run).complete,false);
 run=act(pair,run,{type,activityId:'notice',...(type==='ANSWER'?{optionIds:['round']}:{})});assert.equal(deriveScene(pair,run).activity.path,type.toLowerCase());assert.equal(deriveScene(pair,run).activity.complete,true);}
 const pair=pairFixture();pair.scenes[3].activity.screen.mode='sequence';pair.scenes[3].activity.screen.answer=['round','square','round'];let run=move(pair,act(pair,reachChoice(pair),{type:'CHOOSE',activityId:'shade',optionId:'open'}),'scene-4');
 run=act(pair,run,{type:'ANSWER',activityId:'notice',optionIds:['round','round','square']});assert.equal(deriveScene(pair,run).activity.complete,false);
 run=act(pair,run,{type:'ANSWER',activityId:'notice',optionIds:['round','square','round']});assert.equal(deriveScene(pair,run).activity.complete,true);
});
function sixChoices(){const pair=pairFixture();pair.id='six-choices';pair.category='consequences';pair.initialState={shade:false,...Object.fromEntries(Array.from({length:6},(_,i)=>[`flag-${i}`,false]))};
 const proto=pair.scenes[0];pair.scenes=Array.from({length:6},(_,i)=>({...structuredClone(proto),id:`decision-${i}`,activity:{kind:'choice',id:`choice-${i}`,options:[false,true].map(value=>({id:value?'yes':'no',label:value?'Yes':'No',image:'drawing.svg',feedback:`Decision ${i}: ${value}`,effects:[{type:'set',key:`flag-${i}`,value},...(i===0||i===5?[{type:'set',key:'shade',value},{type:value?'show':'hide',sceneId:'finish',layerId:'result'}]:[])]}))}}));
 pair.scenes.push({...structuredClone(proto),id:'finish',activity:undefined,hiddenLayers:['result']});delete pair.scenes[6].activity;
 for(const edition of Object.values(pair.editions))edition.scenes=Object.fromEntries(pair.scenes.map(s=>[s.id,structuredClone(pairFixture().editions.together.scenes['scene-1'])]));pair.editions.together.prompts.forEach(p=>p.sceneId='decision-0');
 pair.endings={sceneId:'finish',text:'Ready',variants:[{when:{op:'all',conditions:[{op:'equals',key:'choice.choice-0',value:'no'},{op:'equals',key:'shade',value:true}]},text:'The first open place was repaired with shade.'}],recap:Array.from({length:3},(_,beat)=>({decisions:[`choice-${beat*2}`,`choice-${beat*2+1}`],text:'Unused fallback',variants:Array.from({length:4},(_,bits)=>({when:{op:'all',conditions:[0,1].map(j=>({op:'equals',key:`choice.choice-${beat*2+j}`,value:(bits>>j)&1?'yes':'no'}))},text:`Decisions ${beat*2} and ${beat*2+1}: ${(bits&1)?'yes':'no'}, ${(bits&2)?'yes':'no'}.`}))}))};return validatePair(pair);}
test('all 64 six-decision routes preserve identities, repair state, layers, and three explanatory recap beats',()=>{
 const pair=sixChoices(), original=structuredClone(pair);
 for(let bits=0;bits<64;bits++){let run=createRun(pair,'independent');for(let i=0;i<6;i++){if(i)run=move(pair,run,`decision-${i}`);const before=structuredClone(run),action={type:'CHOOSE',activityId:`choice-${i}`,optionId:(bits>>i)&1?'yes':'no'};assert.deepEqual(dispatch(run,pair,action),dispatch(run,pair,action));assert.deepEqual(run,before);run=act(pair,run,action);}
 run=move(pair,run,'finish');const ending=deriveEnding(pair,run),scene=deriveScene(pair,run);assert.equal(ending.complete,true);assert.equal(ending.recap.length,3);
 for(let i=0;i<6;i++){assert.equal(scene.state[`choice.choice-${i}`],(bits>>i)&1?'yes':'no');assert.equal(scene.state[`flag-${i}`],Boolean((bits>>i)&1));}
 assert.equal(scene.state.shade,Boolean(bits&32));assert.equal(scene.visibility.result,Boolean(bits&32));
 for(let b=0;b<3;b++)assert.equal(ending.recap[b].text,`Decisions ${b*2} and ${b*2+1}: ${(bits>>(b*2))&1?'yes':'no'}, ${(bits>>(b*2+1))&1?'yes':'no'}.`);
 if(!(bits&1)&&(bits&32))assert.match(ending.text,/repaired/);
 }assert.deepEqual(pair,original);
});
test('malformed, oversized, unknown and out-of-order actions are rejected without mutation',()=>{const pair=pairFixture(),run=createRun(pair,'together');for(const action of [null,{},[],{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:-1,targetId:'box'},{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box',extra:true},{type:'SKIP',activityId:'notice'},{type:'NAVIGATE',sceneId:'x'.repeat(9000)},{type:'UNKNOWN'}]){const result=dispatch(run,pair,action);assert.equal(result.accepted,false);assert.deepEqual(result.run,run);}assert.equal(deriveScene(pair,run).guidance.instruction,pair.editions.together.scenes['scene-1'].instruction);});

test('placement preserves a path for scarce pieces and explains when to save one',()=>{
 const pair=pairFixture(),activity=pair.scenes[0].activity;
 activity.items=[{id:'bun',label:'Bun',image:'drawing.svg'},{id:'cake',label:'Cake',image:'drawing.svg'}];
 activity.targets=[{id:'box',label:'Either treat',image:'drawing.svg',accepts:['bun','cake'],required:1,effects:[]},{id:'basket',label:'Bun basket',image:'drawing.svg',accepts:['bun'],required:1,effects:[]}];
 let run=createRun(pair,'together');const rejected=dispatch(run,pair,{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'});
 assert.equal(rejected.accepted,false);assert.equal(rejected.reason,'save-that-piece');
 run=act(pair,run,{type:'PLACE',activityId:'pack',itemId:'cake',copyIndex:0,targetId:'box'});
 run=act(pair,run,{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'basket'});assert.equal(deriveScene(pair,run).activity.complete,true);
});
test('confirmation tokens expire after a run changes; confirmed logs remain replayable',()=>{
 const pair=pairFixture();let run=act(pair,reachChoice(pair),{type:'CHOOSE',activityId:'shade',optionId:'covered'});
 const pending=dispatch(run,pair,{type:'CHOOSE',activityId:'shade',optionId:'open'});
 const confirmation={type:'CONFIRM_CHANGE',activityId:'shade',optionId:'open',token:pending.effects[0].token};
 const moved=move(pair,run,'scene-4');assert.equal(dispatch(moved,pair,confirmation).accepted,false);
 run=move(pair,moved,'scene-3');assert.equal(dispatch(run,pair,confirmation).reason,'stale-confirmation');
 const next=dispatch(run,pair,{type:'CHOOSE',activityId:'shade',optionId:'open'});run=act(pair,run,{...confirmation,token:next.effects[0].token});
 assert.deepEqual(api.validateRun(pair,run),run);assert.equal(deriveEnding(pair,run).text,null);
});

test('action records and answer arrays reject getters, holes and extra properties',()=>{
 const pair=pairFixture();let run=move(pair,act(pair,reachChoice(pair),{type:'CHOOSE',activityId:'shade',optionId:'open'}),'scene-4');
 const sparse=Array(1),extended=['round'];extended.extra=true;let accessed=false;
 const getter={activityId:'notice'};Object.defineProperty(getter,'type',{enumerable:true,get(){accessed=true;return 'SKIP';}});
 for(const action of [getter,{type:'ANSWER',activityId:'notice',optionIds:sparse},{type:'ANSWER',activityId:'notice',optionIds:extended}])assert.equal(dispatch(run,pair,action).accepted,false);
 assert.equal(accessed,false);
});
