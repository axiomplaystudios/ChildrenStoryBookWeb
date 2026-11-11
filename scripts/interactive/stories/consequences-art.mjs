// Original local SVG vocabulary for two deliberately different worlds.
export const svg=(body,w=1000,h=680)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const g=(body,x=0,y=0,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
const p=(d,f='none',s='#35515a',w=4)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const r=(x,y,w,h,f,rad=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${f}"/>`;
const e=(x,y,rx,ry,f)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
const c=(x,y,rad,f)=>e(x,y,rad,rad,f);
const line=(d,col='#35515a',w=4)=>p(d,'none',col,w);
const leaf=(x,y,s=1)=>g(p('M0 0 Q-35-42-4-62 Q25-44 0 0','#4f8c65','#35664d',2)+line('M0 0-4-50','#d6dda1',2),x,y,s);
const fruit=(x,y)=>g(c(0,0,16,'#ed9878')+c(27,3,14,'#eabd5e')+c(50,-4,16,'#8ea775')+leaf(42,-17,.32),x,y);
function elephant(x,y,s=1,adult=false){return g(e(0,128,77,14,'#c2a47b')+r(-45,51,29,77,'#829fa8',15)+r(18,51,29,77,'#829fa8',15)+e(0,32,64,70,adult?'#8ca8b1':'#a5bec3')+e(-35,-32,48,53,'#91aeb7')+e(-35,-32,29,35,'#d5b7b4')+e(17,-32,49,48,adult?'#8ca8b1':'#a5bec3')+p('M41-22 Q92-18 82 49 Q78 67 65 53 L65 13 Q53 11 40 7',adult?'#8ca8b1':'#a5bec3','#547783',3)+c(29,-42,5,'#284956')+c(31,-44,1.5,'#fff')+line('M28-13 Q37-8 44-14','#547783',3)+(adult?r(-46,23,97,25,'#dc9c68',9):r(-44,21,91,35,'#689e96',10)+r(-31,29,18,12,'#f7d989',4))+p('M-50 51 Q-86 60-82 29','none','#547783',6)+(adult?'':p('M-20-76 45-76 57-64-39-64Z','#edc36e','#9c814c',2)+r(-14,-100,48,27,'#edc36e',9)),x,y,s);}
function person(x,y,s=1,grand=false){return g(e(0,155,49,10,'#b8af9b')+line('M-17 96-20 148 M18 96 25 148','#3b5364',18)+p('M-35 21 31 21 44 103-43 103Z',grand?'#b27482':'#e3ae58','#76595c',3)+line('M-35 34-61 74 M30 34 62 55','#a5664a',15)+e(0,-12,36,43,grand?'#b87f60':'#9d6146')+(grand?p('M-37-9 Q-49-69 2-65 Q53-64 37-10 L25-41 3-36-21-43Z','#d5d6cd','#627578',2)+c(-34,-43,20,'#d5d6cd'):p('M-36-12 Q-49-72 4-61 Q56-60 34-8 L20-37-7-33-25-17Z','#34363b','#34363b',2))+c(-12,-9,3,'#28363b')+c(13,-9,3,'#28363b')+p('M-8 12 Q1 20 12 10','none','#523d3e',3)+(grand?e(-14,-8,11,9,'none')+line('M-25-8-3-8 M3-8 24-8 M-2-8 3-8','#f0d6ae',3):r(-13,-66,29,9,'#6a9a8d',4)),x,y,s);}
export function background(kind,i=6){if(kind==='picnic')return r(0,0,1000,680,i===0?'#e7e9de':'#cee6e8')+c(860,93,42,'#f4dba0')+p('M0 254 Q200 232 398 258 T1000 248 L1000 450 0 450Z','#75b9c6','none',0)+[288,327,366].map(y=>line(`M0 ${y} Q140 ${y-17} 280 ${y} T560 ${y} T1000 ${y}`,'#c7e6df',5)).join('')+p('M0 413 Q180 362 394 426 Q650 457 1000 391 L1000 680 0 680Z','#ecd6ae','none',0)+p('M0 498 Q180 423 378 510 Q704 461 1000 536 L1000 680 0 680Z','#e6c99b','none',0)+[64,114,940].map((x,j)=>g(line('M0 0-11-57 M0 0 7-77 M0 0 22-48','#8e9b69',4),x,457+j*7)).join('')+(i===0?r(0,0,119,540,'#ae917a')+r(22,71,70,172,'#d6e1d6',12)+r(0,540,1000,140,'#cbaa85')+line('M0 580 1000 580 M0 630 1000 630','#af8d6c',3):'')+(i===1?p('M0 650 Q156 502 352 438','none','#c4ac87',44):'');
 return r(0,0,1000,680,'#dbe5eb')+[0,1,2,3,4,5].map((_,j)=>r(j*184-26,110+(j%3)*37,143,250,'#aabac5',5)+[0,1,2].map(k=>r(j*184+3+k*35,146+(j%3)*37,15,20,'#d8e0df')).join('')).join('')+r(0,305,1000,375,'#b9bdad')+p('M0 286 1000 286 1000 354 0 354Z','#cfb7a2','#967f6f',3)+r(0,285,1000,14,'#eed8bd')+line('M0 452 1000 452 M0 564 1000 564 M210 354 135 680 M510 354 520 680 M800 354 884 680','#9b9f94',3)+r(913,233,87,144,'#8b9693',4)+r(935,247,48,70,'#d8d9ca',5)+(i===0?r(15,373,290,210,'#d9c9ad',12)+line('M26 420 287 420 M26 485 287 485','#baa98d',3):'');}
export const figures=(kind,i=6)=>kind==='picnic'?(i>=2?elephant(i===6?490:680,i===6?340:388,.56):'')+elephant(i===0?220:i===6?278:140, i===6?348:385,i===6?.88:.9)+elephant(i===0?798:824,i===6?320:335,1.05,true):person(i===0?222:i===6?375:155,i===6?398:420,i===6?.8:.82)+person(i===6?770:854,i===6?389:397,.9,true);
const butterfly=(x,y)=>g(e(-12,-5,13,18,'#d7a46f')+e(12,-5,13,18,'#cf8b87')+e(-10,13,10,11,'#e8bf81')+e(10,13,10,11,'#dfb09c')+line('M0-17 0 24','#5e6557',4)+line('M0-14-8-25 M0-14 8-25','#5e6557',2),x,y,.85);
const bee=(x,y)=>g(e(-5,-11,12,15,'#e7ece1')+e(11,-11,12,15,'#e7ece1')+e(0,5,22,13,'#d9b45e')+line('M-7-7-7 16 M6-7 6 16','#655f4e',5)+c(23,5,10,'#655f4e')+line('M26 0 32-9','#655f4e',2),x,y,.75);
const symbols={
 'wide-mat':r(-165,-46,330,105,'#79aaa5',12)+line('M-154-19 154-19 M-154 12 154 12','#dce8ce',8)+line('M-100-44-100 57 M0-44 0 57 M100-44 100 57','#dce8ce',6),
 'small-mat':r(-98,-40,196,92,'#bf7c7d',10)+line('M-85-12 85-12 M-85 22 85 22','#f6d2a9',7),
 'dune-shelter':p('M-150 35 Q-108-108 14-35 Q74-135 150 35Z','#c8bd8b','#9d9b6c',3)+[[-70,-20],[-40,0],[65,-10]].map(([x,y])=>leaf(x,y,.65)).join(''),
 'cove-view':p('M-150-10 Q0-53 150-10 L150 41-150 41Z','#71b3c4','none',0)+line('M-130 5 Q-80-9-30 5 T70 5 T140 5','#e1ede1',6)+p('M-135 44 Q-65 16-3 42 Q65 21 140 43','#f1dcad','#d0b98c',3),
 'fruit-tray':e(0,24,95,26,'#b98258')+e(0,15,87,23,'#e5d1aa')+fruit(-31,-2),
 'fruit-bowls':[-63,0,63].map(x=>g(p('M-27 0 27 0 Q23 49 0 48 Q-22 48-27 0Z','#eee4c7','#af8e69',3)+c(0,0,18,x===0?'#df927b':'#9cac6b'),x,0)).join(''),
 'shade-sail':line('M-168 154-139-102 M169 154 138-102','#9e7b55',7)+p('M-139-102 Q0-56 138-102 L88 7 Q0 37-100 8Z','#e6a26e','#b87955',4),
 'open-sky':p('M-106 20 Q-125-17-85-24 Q-72-74-23-54 Q13-82 44-42 Q108-49 108-2 Q136 29 94 33 L-86 33Z','#f2f2df','#c1d9d8',3),
 'sorted-boxes':r(-90,-35,83,76,'#7c9e8e',11)+r(8,-19,83,60,'#d39d71',10)+r(-94,-47,91,16,'#c6d9b6',5)+r(4,-31,91,16,'#efd4a1',5),
 'carry-pouch':p('M-70-31 Q0-60 70-31 L83 55-83 55Z','#ccaa76','#9b7856',4)+line('M-39-30 Q0-96 39-30','#8d765b',8)+r(-36,-6,72,30,'#ebd8ab',7),
 'loaded-cart':c(-58,50,20,'#577984')+c(64,50,20,'#577984')+r(-100,-45,202,79,'#cf8b68',12)+line('M101-14 143-65 169-65','#7a6d59',7)+r(-73,-74,82,31,'#c6d9b6',7)+r(15,-63,60,20,'#e6be83',5),
 'carried-basket':p('M-88-19 88-19 66 61-66 61Z','#caa16b','#967651',4)+line('M-70-20 Q0-130 70-20','#967651',8)+line('M-72 6 74 6 M-67 31 67 31','#e9c78e',6),
 'raised-beds':p('M-162-38 127-38 166-4 166 75-133 75-162 45Z','#ad795d','#795d50',4)+p('M-162-38 127-38 166-4-133-4Z','#5e6655','#795d50',3)+line('M-132 22 164 22 M-132 47 164 47','#d0a47c',4),
 'clustered-pots':[-95,0,95].map((x,i)=>g(p('M-40-36 40-36 30 53-30 53Z',i===1?'#c49776':'#b57962','#855e51',3)+e(0,-36,43,13,'#565e50')+r(-43,-36,86,12,'#d6aa83',4),x,i===1?22:0)).join(''),
 'reading-bench':r(-122,-52,244,67,'#d3ad72',6)+r(-130,19,260,22,'#a77e58',5)+line('M-108 40-115 91 M105 40 115 91','#6b6b61',9)+r(-65,-29,61,35,'#6f969d',3)+p('M-65-29-34-20-4-29 M-34-20-34 6','none','#e8dfb7',3),
 'family-table':e(0,-15,111,47,'#d8ab75')+line('M-65 7-76 103 M65 7 76 103','#94785b',10)+c(-38,-23,21,'#e3debf')+c(35,-4,21,'#d8dfce')+r(-4,-54,20,39,'#819d91',5),
 'bright-flowers':butterfly(75,-109)+[-112,-38,38,112].map((x,i)=>g(line('M0 58 0-34','#477957',7)+leaf(-2,20,.5)+[[-19,-37],[19,-37],[0,-57],[0,-18]].map(([a,b])=>c(a,b,17,i%2?'#e5b45c':'#cd8092')).join('')+c(0,-37,12,'#75664d'),x,(i%2)*9)).join(''),
 'herb-leaves':bee(70,-89)+[-112,-38,38,112].map((x,i)=>g(line('M0 53 0-47','#477957',6)+leaf(0,-7,.7)+g(leaf(0,0,.7),0,14,-1)+leaf(0,38,.7)+(i===2?c(-7,-56,7,'#d4b2ce')+c(7,-56,7,'#d4b2ce')+c(0,-67,7,'#d4b2ce'):''),x,(i%2)*12)).join(''),
 'shade-cloth':line('M-145 163-145-90 M145 163 145-90','#7e7665',7)+p('M-145-90 145-90 112 5-112 5Z','#849e98','#627a79',3)+line('M-110-63 111-63 M-117-35 119-35','#c5d1b6',3),
 'sunny-corner':c(0,0,44,'#efcb75')+line('M0-77 0-58 M0 58 0 77 M-77 0-58 0 M58 0 77 0 M-55-55-41-41 M55 55 41 41','#ddb06c',5),
 'loop-path':p('M-169 31 Q-149-41-22-36 Q133-36 165 34','none','#ded0ae',31)+[-133,-65,10,84,146].map((x,i)=>e(x, i===0||i===4?25:-10,27,12,'#8d9a92')).join(''),
 'direct-path':p('M-178 0 178 0','none','#ddd1b2',48)+[-140,-70,0,70,140].map(x=>r(x-24,-15,48,30,'#8d9a92',6)).join(''),
 'drip-water':r(-56,-68,112,128,'#779ca0',16)+r(-62,-77,124,18,'#56777f',5)+line('M50 38 Q126 37 104 79 Q37 105-79 89','#426d71',10)+c(-27,-13,6,'#cadfdc')+c(12,9,6,'#cadfdc')+c(33,-21,6,'#cadfdc'),
 'watering-can':r(-52,-38,95,90,'#799d88',15)+p('M-50-23 Q-116-72-112 14 Q-99 44-52 31','none','#527461',11)+p('M40-15 114-60 126-42 43 23Z','#8cae96','#527461',3)+p('M115-65 137-47 145-57 124-76Z','#b0c7ac','#527461',3),
 'repair-parasol':line('M0 168 0-73','#9b7c5d',9)+p('M-135-3 Q0-158 135-3 Q68 18 0-3 Q-69 18-135-3Z','#d5a46e','#a67f5d',4)+line('M0-79 0-8 M0-79-76 0 M0-79 76 0','#edcc94',4)
};
export const icon=(id,x,y,s=1)=>g(symbols[id]||'',x,y,s);
export const control=(id)=>svg(r(0,0,280,190,'#f8f1df',18)+icon(id,140,100,['shade-sail','shade-cloth'].includes(id)?.48:.6),280,190);
export const sceneBase=(kind,i)=>background(kind,i)+figures(kind,i)+(i<6?e(500,520,205,49,kind==='picnic'?'#d1b78e':'#a5aa9d'):'');
export const moving=(kind)=>kind==='picnic'?p('M0 0 Q27-24 54-2 Q27-12 0 0Z','#f5f0d9','#b6a88a',2):leaf(0,0,1);
export const slot=(kind,index)=>kind==='picnic'?[[510,501,1.13],[100,343,.55],[513,481,.77],[530,217,1.15],[856,586,.63],[124,592,.7]][index]:[[545,462,1.1],[168,481,.69],[551,385,.78],[210,204,1.03],[503,590,1.05],[886,499,.69]][index];
export {r,p,c,line,g};

import {mkdir,writeFile} from 'node:fs/promises';
import {writePairPackage} from '../package.mjs';
const eq=(key,value)=>({op:'equals',key,value});
export async function generateConsequence(folder,story){
 const assets=new Map(),add=(file,body)=>{assets.set(file,body);return file;};
 const final='remember',finalLayers=[],scenes=[];
 const layer=(id,file,pivot=[500,340])=>({id,image:file,x:0,y:0,width:1000,height:680,pivot});
 for(let i=0;i<6;i++){
  const d=story.decisions[i],ids=d.options.map(o=>o.layer),activity={kind:'choice',id:d.id,options:[]};
  for(let n=0;n<2;n++){
   const o=d.options[n];add(`${o.layer}-picture.svg`,control(o.layer));
   const current=`${d.id}-${n}.svg`;const youngPlants=story.kind==='garden'&&i===2?[-108,-36,36,108].map((x,j)=>g(line('M0 28 0-5','#477957',5)+leaf(0,13,.36)+(n===0?c(0,-8,7,j%2?'#e5b45c':'#cd8092'):leaf(0,-4,.36)),500+x,480)).join(''):null;add(current,svg(youngPlants||icon(o.layer,500,i===3?(o.layer==='sunny-corner'?170:360):462,i===3?1.38:1.2)));
   const out=`result-${o.layer}.svg`;add(out,svg(icon(o.layer,...slot(story.kind,i))));finalLayers.push(layer(o.layer,out));
   const effects=[{type:'set',key:d.id,value:o.id},{type:'show',sceneId:d.id,layerId:`effect-${n}`},{type:'hide',sceneId:d.id,layerId:`effect-${1-n}`},{type:'show',sceneId:final,layerId:o.layer},{type:'hide',sceneId:final,layerId:ids[1-n]}];
   if(story.kind==='picnic'&&i===1)effects.push({type:'set',key:'air',value:n===0?'still':'breezy'});
   if(story.kind==='picnic'&&i===3&&n===0)effects.push({type:'set',key:'air',value:'sheltered'});
   if(story.kind==='garden'&&i===5&&n===0)effects.push({type:'set',key:'shelter',value:'parasol',when:eq('choice.shelter','sun')},{type:'show',sceneId:d.id,layerId:'repair-parasol-now',when:eq('choice.shelter','sun')},{type:'show',sceneId:final,layerId:'repair-parasol',when:eq('choice.shelter','sun')},{type:'hide',sceneId:final,layerId:'sunny-corner',when:eq('choice.shelter','sun')});
   activity.options.push({id:o.id,label:o.label,image:`${o.layer}-picture.svg`,feedback:o.feedback,effects});
  }
  const back=add(`${d.id}-background.svg`,svg(sceneBase(story.kind,i)));
  const flutter=add(`${d.id}-moving.svg`,svg(g(moving(story.kind),story.kind==='picnic'?683:69,story.kind==='picnic'?150:354,story.kind==='picnic'?1.2:1)));
  const layers=[layer('breeze',flutter,story.kind==='picnic'?[683,150]:[69,354]),...d.options.map((o,n)=>layer(`effect-${n}`,`${d.id}-${n}.svg`))];
  if(story.kind==='garden'&&i===5)layers.push(layer('repair-parasol-now',add('watering-repair.svg',svg(icon('repair-parasol',288,270,.72)))));
  const illustration={width:1000,height:680,background:back,layers,tracks:[{layer:'breeze',preset:'flap',parameters:{angle:6},durationMs:4300,restMs:650,delayMs:0,playback:'repeat'}]};
  scenes.push({id:d.id,narrative:d.narrative,alt:d.alt,image:add(`${d.id}.svg`,svg(sceneBase(story.kind,i))),scene:illustration,hiddenLayers:['effect-0','effect-1',...(story.kind==='garden'&&i===5?['repair-parasol-now']:[])],activity});
 }
 if(story.kind==='garden')finalLayers.push(layer('repair-parasol',add('result-repair-parasol.svg',svg(icon('repair-parasol',...slot(story.kind,3))))));
 const back=add('remember-background.svg',svg(sceneBase(story.kind,6))),flutter=add('remember-moving.svg',svg(g(moving(story.kind),story.kind==='picnic'?736:944,story.kind==='picnic'?135:232)));
 finalLayers.push(layer('breeze',flutter,story.kind==='picnic'?[736,135]:[944,232]));
 const finalScene={width:1000,height:680,background:back,layers:finalLayers,tracks:[{layer:'breeze',preset:'flap',parameters:{angle:5},durationMs:4700,restMs:650,delayMs:0,playback:'repeat'}]};
 scenes.push({id:final,narrative:story.finish,alt:story.finalAlt,image:add('remember.svg',svg(sceneBase(story.kind,6)+story.decisions.map((d,i)=>icon(d.options[0].layer,...slot(story.kind,i))).join(''))),scene:finalScene,hiddenLayers:finalLayers.filter(l=>l.id!=='breeze').map(l=>l.id)});
 add('cover.svg',svg(sceneBase(story.kind,6)+story.decisions.map((d,i)=>icon(d.options[0].layer,...slot(story.kind,i))).join('')));
 const guidance=together=>Object.fromEntries(scenes.map((s,i)=>{
  if(i===6)return [s.id,{instruction:together?story.finishTogether:story.finishIndependent,feedback:{complete:'Every earlier choice has a place in this picture and in the three memories below.',retry:'Look at one part of your finished picture at a time.'},demonstration:[{action:'point',image:'cover.svg',label:together?'This is an example ending. Compare it with the ending you made.':'Look at this example ending.'},{action:'point',image:`${story.decisions[5].options[0].layer}-picture.svg`,label:together?'Talk about the final choice and how the story changed.':'Remember the last choice.'}]}];
  const d=story.decisions[i];return [s.id,{instruction:together?d.together:d.independent,feedback:{complete:d.complete,retry:'Either picture is a possible plan. Choose the one you want to try.'},demonstration:[{action:'point',image:`${d.options[0].layer}-picture.svg`,label:together?`Talk about this plan: ${d.options[0].label.toLowerCase()}.`:`One plan: ${d.options[0].label.toLowerCase()}.`},{action:'point',image:`${d.options[1].layer}-picture.svg`,label:together?`Compare it with ${d.options[1].label.toLowerCase()}. What changes?`:`Another plan: ${d.options[1].label.toLowerCase()}.`},...(together?[{action:'select',image:`${d.options[0].layer}-picture.svg`,label:'Invite your child to choose. This example does not make the choice for you.'}]:[])]}];
 }));
 const recap=story.groups.map(([a,b])=>{const first=story.decisions[a],second=story.decisions[b];return {decisions:[first.id,second.id],text:`${first.options[0].recap} ${second.options[0].recap}`,variants:first.options.flatMap(o=>second.options.map(v=>({when:{op:'all',conditions:[eq(`choice.${first.id}`,o.id),eq(`choice.${second.id}`,v.id)]},text:story.repairText?.(first.id,o.id,second.id,v.id)||`${o.recap} ${v.recap}`})))};});
 const pair={schemaVersion:1,id:story.id,version:'v1',title:story.title,category:'consequences',credit:'Original story and SVG illustrations created for Axiom Play Studios with OpenAI Codex.',cover:'cover.svg',initialState:{...Object.fromEntries(story.decisions.map(d=>[d.id,'waiting'])),...(story.kind==='picnic'?{air:'waiting'}:{})},scenes,editions:{together:{scenes:guidance(true),prompts:story.prompts},independent:{scenes:guidance(false),reflection:story.reflection}},endings:{sceneId:final,text:story.finish,variants:[],recap},assets:[...assets.keys()].map(file=>({id:file.replace('.svg',''),file,mediaType:'image/svg+xml'}))};
 await mkdir(folder,{recursive:true});for(const[file,body]of assets)await writeFile(`${folder}/${file}`,body);
 return writePairPackage(folder,pair,{source:{kind:'original',license:'All rights reserved. Original work for Axiom Play Studios.',creators:['Axiom Play Studios','OpenAI Codex'],changes:`Original read-aloud narrative, six authored decisions and cumulative recap passages. Original ${story.kind==='picnic'?'elephant family, coastal landscape, picnic objects':'human child and grandmother, enclosed urban rooftop, garden objects'} drawn as local layered SVG; no external story, image or audio sources.`}});
}
