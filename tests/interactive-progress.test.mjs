import test from 'node:test';import assert from 'node:assert/strict';import {pairFixture} from './fixtures/interactive/pair.mjs';
const state=await import('../src/interactive/state.js').catch(()=>({}));const progress=await import('../src/interactive/progress.js').catch(()=>({}));
const {createRun,dispatch}=state;const {saveRun,loadRun,progressKey}=progress;
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};};
test('storage exports safe persistence contract',()=>assert.equal(typeof loadRun,'function'));
test('edition and pair saves are isolated; replay restores actions and navigation',()=>{const pair=pairFixture(),store=storage();let run=createRun(pair,'together');run=dispatch(run,pair,{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'}).run;run=dispatch(run,pair,{type:'NAVIGATE',sceneId:'scene-2'}).run;assert.equal(saveRun(store,run).status,'saved');assert.deepEqual(loadRun(store,pair,'together').run,run);assert.equal(loadRun(store,pair,'independent').status,'new');assert.notEqual(progressKey(pair.id,'together'),progressKey(pair.id,'independent'));const other=structuredClone(pair);other.id='other-pair';assert.equal(loadRun(store,other,'together').status,'new');const restarted=dispatch(run,pair,{type:'RESTART'}).run;saveRun(store,restarted);assert.equal(loadRun(store,pair,'together').run.actions.length,0);});
test('corrupt and obsolete saves restart safely; reducer replays and rejects forged histories',()=>{const pair=pairFixture(),store=storage(),key=progressKey(pair.id,'together');for(const text of ['{broken',JSON.stringify({...createRun(pair,'together'),pairVersion:'v0'}),JSON.stringify({...createRun(pair,'together'),sceneId:'finish'}),JSON.stringify({...createRun(pair,'together'),actions:[{type:'NAVIGATE',sceneId:'finish'}]}),JSON.stringify({...createRun(pair,'together'),actions:[{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'},{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'}]})]){store.setItem(key,text);const result=loadRun(store,pair,'together');assert.equal(result.status,'restart');assert.deepEqual(result.run,createRun(pair,'together'));}});
test('denied storage returns live memory session and allows continued play',()=>{const pair=pairFixture(),denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};let run=loadRun(denied,pair,'independent').run;run=dispatch(run,pair,{type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'}).run;const result=saveRun(denied,run);assert.equal(result.status,'memory');assert.equal(result.run,run);assert.equal(result.run.actions.length,1);});


test('same-origin app bases isolate resume, restart, edition and version replacement', () => {
 const pair = pairFixture(), store = storage();
 const first = 'https://books.example/first/', second = 'https://books.example/second/';
 let run = dispatch(createRun(pair, 'together'), pair, {type:'PLACE',activityId:'pack',itemId:'bun',copyIndex:0,targetId:'box'}).run;
 saveRun(store, run, first);
 assert.equal(loadRun(store, pair, 'together', second).status, 'new');
 saveRun(store, run, second);
 saveRun(store, createRun(pair, 'independent'), second);
 saveRun(store, createRun(pair, 'together'), second);
 assert.deepEqual(loadRun(store, pair, 'together', first).run, run);
 assert.equal(loadRun(store, pair, 'together', second).run.actions.length, 0);
 assert.equal(loadRun(store, pair, 'independent', first).status, 'new');
 const updated = structuredClone(pair); updated.version = 'v2';
 assert.equal(loadRun(store, updated, 'together', second).status, 'restart');
 saveRun(store, createRun(updated, 'together'), second);
 assert.deepEqual(loadRun(store, pair, 'together', first).run, run);
 assert.equal(loadRun(store, pair, 'independent', second).run.pairVersion, 'v1');
 assert.equal(loadRun(store, updated, 'together', second).status, 'loaded');
});
test('progress bases normalize absolute URL paths and leave ambiguous unscoped saves untouched', () => {
 const pair = pairFixture(), store = storage(), run = createRun(pair, 'together');
 const legacyKey = 'interactive-run:fixture-pair:together', legacy = JSON.stringify(run);
 store.setItem(legacyKey, legacy);
 const base = 'https://books.example/nested/app/';
 assert.equal(loadRun(store, pair, 'together', base).status, 'new');
 saveRun(store, run, base);
 assert.equal(store.getItem(legacyKey), legacy);
 assert.equal(progressKey(pair.id, 'together', 'https://books.example/nested/./app?draft=1#story'), progressKey(pair.id, 'together', base));
 assert.notEqual(progressKey(pair.id, 'together', base), legacyKey);
 assert.deepEqual(loadRun(store, pair, 'together', 'https://books.example/nested/app').run, run);
});
