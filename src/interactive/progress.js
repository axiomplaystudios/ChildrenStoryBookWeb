import {createRun,validateRun} from './state.js';

export const progressKey=(pairId,edition)=>`interactive-run:${pairId}:${edition}`;
const MAX_SAVE_BYTES=600000;
export function loadRun(storage,pair,edition){
 const fresh=createRun(pair,edition);let text;
 try{text=storage.getItem(progressKey(pair.id,edition));}catch{return {run:fresh,status:'memory',reason:'storage-unavailable'};}
 if(text===null)return {run:fresh,status:'new'};
 try{
  if(typeof text!=='string'||text.length>MAX_SAVE_BYTES)throw Error('Save bounds');
  const value=JSON.parse(text);if(value.edition!==edition)throw Error('Edition mismatch');
  return {run:validateRun(pair,value),status:'loaded'};
 }catch{return {run:fresh,status:'restart',reason:'invalid-or-obsolete-save'};}
}
export function saveRun(storage,run){
 try{const text=JSON.stringify(run);if(text.length>MAX_SAVE_BYTES)throw Error('Save bounds');storage.setItem(progressKey(run.pairId,run.edition),text);return {run,status:'saved'};}
 catch{return {run,status:'memory',reason:'storage-unavailable'};}
}
