import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
export const drawing='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="12" fill="#fc0"/></svg>';
const effects=[{type:'set',key:'packed',value:true},{type:'show',sceneId:'finish',layerId:'result'}];
export function pairFixture(){
 const scene={width:32,height:32,background:'drawing.svg',layers:[{id:'result',image:'drawing.svg',x:0,y:0,width:32,height:32,pivot:[16,16]}],tracks:[{layer:'result',preset:'breathe',parameters:{amount:.02},durationMs:4000,restMs:500,delayMs:0,playback:'repeat'}]};
 const activities=[
  {kind:'place',id:'pack',items:[{id:'bun',label:'One bun',image:'drawing.svg'}],targets:[{id:'box',label:'Box for one bun',image:'drawing.svg',accepts:['bun'],required:1,effects:structuredClone(effects)}]},
  {kind:'experiment',id:'roll',variable:'Ramp height',fixed:['Same cart and surface'],controls:[{id:'low',label:'Gentle ramp',image:'drawing.svg'},{id:'high',label:'Steeper ramp',image:'drawing.svg'}],predictions:[{id:'near',label:'Near line',image:'drawing.svg'},{id:'far',label:'Far line',image:'drawing.svg'}],outcomes:[{controlId:'low',observation:'The cart stops near the line.',image:'drawing.svg',effects:[]},{controlId:'high',observation:'The cart rolls farther.',image:'drawing.svg',effects:[]}],comparison:'Compare where the same cart stopped.'},
  {kind:'choice',id:'shade',options:[{id:'open',label:'Open sky',image:'drawing.svg',feedback:'We can see the sky.',effects:[{type:'set',key:'shelter',value:'open'}]},{id:'covered',label:'Canopy',image:'drawing.svg',feedback:'The cloth makes shade.',effects:[{type:'set',key:'shelter',value:'covered'}]}]},
  {kind:'discover',id:'notice',physicalPrompt:'Find a round object nearby if you want.',adultHelp:'Ask your adult to help.',screen:{label:'Point to the round shape',image:'drawing.svg',mode:'match',options:[{id:'round',label:'Round shape',image:'drawing.svg'},{id:'square',label:'Square shape',image:'drawing.svg'}],answer:['round']},effects:[]},
 ];
 const scenes=[...activities.map((activity,i)=>({id:`scene-${i+1}`,narrative:'We prepare a welcome.',alt:'A bright round bun.',image:'drawing.svg',scene:structuredClone(scene),activity})),{id:'finish',narrative:'Our welcome is ready.',alt:'The packed box.',image:'drawing.svg',scene:structuredClone(scene),hiddenLayers:['result']}];
 const guidance=()=>Object.fromEntries(scenes.map(s=>[s.id,{instruction:'Try the pictured action.',feedback:{complete:'See what changed.',retry:'Try another way.'},demonstration:[{action:'point',image:'drawing.svg',label:'Look at the round bun.'}]}]));
 return {schemaVersion:1,id:'fixture-pair',version:'v1',title:'A Welcome',category:'small-jobs',credit:'Original test fixture.',cover:'drawing.svg',initialState:{packed:false,shelter:'open'},scenes,editions:{together:{scenes:guidance(),prompts:['literal','literal','feeling','personal'].map(type=>({type,question:'What changed?',answer:'We packed a bun.',sceneId:'scene-1'}))},independent:{scenes:guidance(),reflection:'We made a welcome together.'}},endings:{sceneId:'finish',text:'The welcome is ready.',variants:[{when:{op:'equals',key:'shelter',value:'covered'},text:'The canopy keeps our box shaded.',showLayers:['result'],hideLayers:[]}],recap:[]},assets:[{id:'drawing',file:'drawing.svg',sha256:createHash('sha256').update(drawing).digest('hex'),bytes:Buffer.byteLength(drawing),mediaType:'image/svg+xml'}]};
}
export function sourceFixture(pair){return {kind:'original',title:pair.title,license:'Original test fixture',creators:['Test author'],changes:'Original text and drawing.',reviewed:true};}
export function reviewFixture(pair){return {reviewed:true,assets:pair.assets.map(a=>({assetId:a.id,reviewed:true})),scenes:pair.scenes.map(s=>({sceneId:s.id,rest:true,motion:true,outcomes:true,guidance:true}))};}
export async function writeFixture(folder,pair=pairFixture()){
 await mkdir(folder,{recursive:true});const write=(file,data)=>writeFile(join(folder,file),typeof data==='string'?data:JSON.stringify(data,null,2)+'\n');
 await write('pair.json',pair);await write('source.json',sourceFixture(pair));await write('visual-review.json',reviewFixture(pair));await write('drawing.svg',drawing);
 return {pair,write};
}
