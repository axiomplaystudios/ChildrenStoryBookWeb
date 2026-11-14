import {validatePair} from './schema.js';

export const MAX_ACTIONS = 2000;
const editions = ['together', 'independent'];
const own = (value, key) => Object.hasOwn(value, key);
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const clone = value => structuredClone(value);
const payloads = {
  NAVIGATE:'type sceneId', RESTART:'type', PLACE:'type activityId itemId copyIndex targetId',
  SELECT:'type activityId controlId trialIndex', PREDICT:'type activityId predictionId trialIndex',
  TEST:'type activityId trialIndex', RETRY:'type activityId trialIndex', CHOOSE:'type activityId optionId',
  CONFIRM_CHANGE:'type activityId optionId token', ANSWER:'type activityId optionIds',
  PHYSICAL:'type activityId', SKIP:'type activityId',
};
function validAction(action) {
  if (!plain(action)) return false;
  const descriptors = Object.getOwnPropertyDescriptors(action);
  const type=descriptors.type;
  if (!type || type.get || type.set || !own(payloads,type.value)) return false;
  const keys = payloads[type.value].split(' ');
  if (Object.getOwnPropertySymbols(action).length || Object.keys(descriptors).length !== keys.length) return false;
  return keys.every(key => {
    const d = descriptors[key]; if (!d || d.get || d.set || !d.enumerable) return false;
    if (key === 'copyIndex' || key === 'trialIndex') return Number.isInteger(d.value) && d.value >= 0 && d.value < MAX_ACTIONS;
    if (key === 'optionIds') {
      const ids=d.value;
      if (!Array.isArray(ids) || Object.getPrototypeOf(ids)!==Array.prototype || ids.length<1 || ids.length>12 || Object.getOwnPropertySymbols(ids).length || Object.keys(ids).length!==ids.length) return false;
      return Array.from({length:ids.length},(_,index)=>Object.getOwnPropertyDescriptor(ids,String(index)))
        .every(entry=>entry && !entry.get && !entry.set && entry.enumerable && typeof entry.value==='string' && entry.value.length>0 && entry.value.length<=80);
    }
    return typeof d.value === 'string' && d.value.length > 0 && d.value.length <= 200;
  });
}
function blankRun(pair, edition) {
  return {schemaVersion:1, pairId:pair.id, pairVersion:pair.version, edition, sceneId:pair.scenes[0].id, actions:[]};
}
export function createRun(pair, edition) {
  validatePair(pair);
  if (!editions.includes(edition)) throw new Error('Invalid interactive edition');
  return blankRun(pair, edition);
}
function initialActivity(a) {
  if (!a) return null;
  if (a.kind === 'place') return {kind:a.kind, complete:false, placements:[]};
  if (a.kind === 'experiment') return {kind:a.kind, complete:false, controlId:null, predictionId:null, trialIndex:0, phase:'configure', trials:[]};
  if (a.kind === 'choice') return {kind:a.kind, complete:false, optionId:null};
  return {kind:a.kind, complete:false, path:null, attempts:[], lastAnswer:null};
}
function matches(rule, state) {
  if (rule.op === 'equals') return own(state,rule.key) && state[rule.key] === rule.value;
  return rule.op === 'all' ? rule.conditions.every(r=>matches(r,state)) : rule.conditions.some(r=>matches(r,state));
}
function derive(pair, run) {
  const state={...pair.initialState};
  const visibility=Object.fromEntries(pair.scenes.map(s=>[s.id,Object.fromEntries(s.scene.layers.map(l=>[l.id,!s.hiddenLayers?.includes(l.id)]))]));
  const activities=Object.fromEntries(pair.scenes.filter(s=>s.activity).map(s=>[s.activity.id,initialActivity(s.activity)]));
  const authored=Object.fromEntries(pair.scenes.filter(s=>s.activity).map(s=>[s.activity.id,s.activity]));
  const apply=effects=>{for(const e of effects){if(e.when && !matches(e.when,state))continue;if(e.type==='set')state[e.key]=e.value;else visibility[e.sceneId][e.layerId]=e.type==='show';}};
  for(const action of run.actions){
    const a=authored[action.activityId],current=activities[action.activityId];
    if(action.type==='PLACE'){
      current.placements.push({itemId:action.itemId,copyIndex:action.copyIndex,targetId:action.targetId});
      const target=a.targets.find(t=>t.id===action.targetId);
      if(current.placements.filter(p=>p.targetId===target.id).length===target.required)apply(target.effects);
      current.complete=a.targets.every(t=>current.placements.filter(p=>p.targetId===t.id).length===t.required);
    }else if(action.type==='SELECT')current.controlId=action.controlId;
    else if(action.type==='PREDICT')current.predictionId=action.predictionId;
    else if(action.type==='TEST'){
      const outcome=a.outcomes.find(o=>o.controlId===current.controlId);
      current.trials.push({trialIndex:action.trialIndex,controlId:current.controlId,predictionId:current.predictionId,observation:outcome.observation,image:outcome.image});current.phase='tested';current.complete=true;apply(outcome.effects);
    }else if(action.type==='RETRY'){current.trialIndex++;current.phase='configure';current.predictionId=null;current.complete=false;}
    else if(action.type==='CHOOSE'){current.optionId=action.optionId;current.complete=true;state[`choice.${a.id}`]=action.optionId;apply(a.options.find(o=>o.id===action.optionId).effects);}
    else if(['ANSWER','PHYSICAL','SKIP'].includes(action.type)){
      const correct=action.type!=='ANSWER'||JSON.stringify(action.optionIds)===JSON.stringify(a.screen.answer);
      if(action.type==='ANSWER'){current.lastAnswer=action.optionIds;current.attempts.push(action.optionIds);}
      if(correct){current.complete=true;current.path=action.type.toLowerCase();apply(a.effects);}
    }
  }
  return {state,visibility,activities};
}
// The package validator checks the initial supply. This bounded matching
// check protects the remaining supply after each child-selected placement.
function canFinishPlacement(activity, placements) {
  const copies=activity.items.flatMap(item=>Array.from({length:item.quantity??1},(_,copyIndex)=>({itemId:item.id,copyIndex})))
    .filter(copy=>!placements.some(p=>p.itemId===copy.itemId&&p.copyIndex===copy.copyIndex));
  const slots=activity.targets.flatMap(target=>Array.from({length:target.required-placements.filter(p=>p.targetId===target.id).length},()=>target.accepts));
  const assigned=Array(copies.length).fill(-1);
  const allocate=(slot,seen)=>{
    for(let copy=0;copy<copies.length;copy++){
      if(seen.has(copy)||!slots[slot].includes(copies[copy].itemId))continue;
      seen.add(copy);
      if(assigned[copy]===-1||allocate(assigned[copy],seen)){assigned[copy]=slot;return true;}
    }
    return false;
  };
  return slots.every((_,slot)=>allocate(slot,new Set()));
}
function fingerprint(run, action) {
  const value=JSON.stringify([run,action.activityId,action.optionId]);let hash=2166136261;
  for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),16777619);
  return `${run.actions.length}-${(hash>>>0).toString(16)}`;
}
function step(run,pair,action) {
  const reject=reason=>({run,accepted:false,effects:[],reason});
  if(!validAction(action))return reject('invalid-action');
  if(action.type==='RESTART')return {run:blankRun(pair,run.edition),accepted:true,effects:[{type:'restarted'}]};
  if(run.actions.length>=MAX_ACTIONS)return reject('action-limit');
  const model=derive(pair,run);
  const append=(event,effects=[])=>({run:{...run,actions:[...run.actions,clone(event)]},accepted:true,effects});
  if(action.type==='NAVIGATE'){
    const destination=pair.scenes.findIndex(s=>s.id===action.sceneId);
    if(destination<0||action.sceneId===run.sceneId)return reject('invalid-navigation');
    if(pair.scenes.slice(0,destination).some(s=>s.activity&&!model.activities[s.activity.id].complete))return reject('unresolved-activity');
    const result=append(action);result.run.sceneId=action.sceneId;return result;
  }
  const scene=pair.scenes.find(s=>s.id===run.sceneId),a=scene.activity;
  if(!a||a.id!==action.activityId)return reject('wrong-activity');
  const current=model.activities[a.id];
  if(action.type==='CHOOSE'||action.type==='CONFIRM_CHANGE'){
    if(a.kind!=='choice'||!a.options.some(o=>o.id===action.optionId))return reject('unknown-option');
    if(current.optionId===action.optionId)return reject('duplicate-choice');
    if(current.complete){
      const token=fingerprint(run,action);
      if(action.type==='CHOOSE')return {...reject('confirmation-required'),effects:[{type:'confirm-choice-edit',activityId:a.id,optionId:action.optionId,token}]};
      if(action.token!==token)return reject('stale-confirmation');
      const index=run.actions.findIndex(e=>e.type==='CHOOSE'&&e.activityId===a.id);
      const earlier={...run,actions:run.actions.slice(0,index),sceneId:scene.id};
      // Store only the new canonical choice; the removed suffix contains all
      // dependent decisions, trials, placements, and later navigation.
      return {run:{...earlier,actions:[...earlier.actions,{type:'CHOOSE',activityId:a.id,optionId:action.optionId}]},accepted:true,effects:[{type:'rewound',sceneId:scene.id}]};
    }
    if(action.type!=='CHOOSE')return reject('no-choice-to-change');
    return append(action);
  }
  if(a.kind==='experiment'){
    if(!['SELECT','PREDICT','TEST','RETRY'].includes(action.type)||action.trialIndex!==current.trialIndex)return reject('invalid-trial');
    if(action.type==='RETRY')return current.phase==='tested'?append(action):reject('test-before-retry');
    if(current.phase==='tested')return reject('retry-required');
    if(action.type==='SELECT')return a.controls.some(v=>v.id===action.controlId)&&action.controlId!==current.controlId?append(action):reject('invalid-control');
    if(action.type==='PREDICT')return a.predictions.some(v=>v.id===action.predictionId)&&action.predictionId!==current.predictionId?append(action):reject('invalid-prediction');
    return current.controlId&&current.predictionId?append(action):reject('configuration-and-prediction-required');
  }
  if(current.complete)return reject('already-complete');
  if(a.kind==='place'&&action.type==='PLACE'){
    const item=a.items.find(i=>i.id===action.itemId),target=a.targets.find(t=>t.id===action.targetId);
    if(!item||action.copyIndex>=(item.quantity??1)||!target||!target.accepts.includes(item.id))return reject('invalid-placement');
    if(current.placements.some(p=>p.itemId===item.id&&p.copyIndex===action.copyIndex)||current.placements.filter(p=>p.targetId===target.id).length>=target.required)return reject('copy-or-target-used');
    if(!canFinishPlacement(a,[...current.placements,action]))return reject('save-that-piece');
    return append(action);
  }
  if(a.kind==='discover'&&['ANSWER','PHYSICAL','SKIP'].includes(action.type)){
    if(action.type==='ANSWER'){
      if((a.screen.mode==='match'&&action.optionIds.length!==1)||action.optionIds.some(id=>!a.screen.options.some(o=>o.id===id)))return reject('invalid-answer');
      if(JSON.stringify(current.lastAnswer)===JSON.stringify(action.optionIds))return reject('duplicate-answer');
    }
    return append(action);
  }
  return reject('wrong-action-kind');
}

// Replaying through step rejects forged navigation, duplicates, unknown IDs,
// impossible quantities and out-of-order tests. Derived counters are never saved.
export function validateRun(pair, value) {
  if(!plain(value)||Object.keys(value).sort().join()!==['schemaVersion','pairId','pairVersion','edition','sceneId','actions'].sort().join()||value.schemaVersion!==1||value.pairId!==pair.id||value.pairVersion!==pair.version||!editions.includes(value.edition)||!Array.isArray(value.actions)||value.actions.length>MAX_ACTIONS)throw new Error('Invalid interactive run');
  let replay=blankRun(pair,value.edition);
  for(const action of value.actions){
    // Rewrites and restart actions are intentionally absent from canonical logs.
    if(!validAction(action)||['CONFIRM_CHANGE','RESTART'].includes(action.type))throw new Error('Invalid saved action');
    const result=step(replay,pair,action);
    if(!result.accepted)throw new Error('Invalid saved action order');
    replay=result.run;
  }
  if(replay.sceneId!==value.sceneId||JSON.stringify(replay.actions)!==JSON.stringify(value.actions))throw new Error('Invalid saved cursor');
  return replay;
}
export function dispatch(run, pair, action) {
  try {validateRun(pair,run);return step(run,pair,action);} catch {return {run,accepted:false,effects:[],reason:'invalid-run'};}
}
function endingFrom(pair,model){
  const complete=pair.scenes.every(s=>!s.activity||model.activities[s.activity.id].complete);
  if(!complete)return {complete:false,text:null,recap:[],variant:null};
  const choose=entry=>{const variant=entry.variants.find(v=>matches(v.when,model.state));return {text:variant?.text??entry.text,variant:variant??null};};
  const selected=choose(pair.endings);
  return {complete:true,...selected,recap:pair.endings.recap.map(beat=>({...choose(beat),decisions:[...beat.decisions]}))};
}
export function deriveEnding(pair, run) {
  validateRun(pair,run);return clone(endingFrom(pair,derive(pair,run)));
}
export function deriveScene(pair, run, sceneId=run.sceneId) {
  validateRun(pair,run);const scene=pair.scenes.find(s=>s.id===sceneId);if(!scene)throw new Error('Unknown interactive scene');
  const model=derive(pair,run),activity=scene.activity?model.activities[scene.activity.id]:null;
  if(activity?.kind==='place'){
    activity.remainingCopies=scene.activity.items.flatMap(item=>Array.from({length:item.quantity??1},(_,copyIndex)=>({itemId:item.id,copyIndex}))).filter(copy=>!activity.placements.some(p=>p.itemId===copy.itemId&&p.copyIndex===copy.copyIndex));
    activity.targets=scene.activity.targets.map(t=>({targetId:t.id,placed:activity.placements.filter(p=>p.targetId===t.id).length,required:t.required,complete:activity.placements.filter(p=>p.targetId===t.id).length===t.required}));
  }
  const ending=endingFrom(pair,model);
  if(sceneId===pair.endings.sceneId&&ending.complete){
    for(const selection of [ending,...ending.recap]){for(const id of selection.variant?.showLayers??[])model.visibility[sceneId][id]=true;for(const id of selection.variant?.hideLayers??[])model.visibility[sceneId][id]=false;}
  }
  return clone({sceneId,scene,activity,state:model.state,visibility:model.visibility[sceneId],guidance:pair.editions[run.edition].scenes[sceneId],ending:sceneId===pair.endings.sceneId?ending:null});
}
