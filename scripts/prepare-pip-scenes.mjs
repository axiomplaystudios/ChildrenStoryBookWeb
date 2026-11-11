// Deterministic extraction of original Pip ink. Originals and approved page 3 stay untouched.
import {readFile,writeFile} from 'node:fs/promises';
const root='public/books/pip-finds-a-friend/';
const story=JSON.parse(await readFile(root+'story.json'));
const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 540">${body}</svg>\n`;
const eye=/<circle[^>]+(?:fill="#403e4e"|fill="white")[^>]*\/>/g;
const owlHead=part=>part.includes('M-54 -30')||part.includes('cy="-21"')||part.includes('#403e4e')||part.includes('fill="white"')||part.includes('M-10 -9');
const rabbitHead=part=>part.includes('cy="-72"')||part.includes('cy="-78"')||part.includes('cy="-12"')||part.includes('#555167')||part.includes('#bb8f98')||part.includes('#847781')||part.includes('#b5a5a2');
for(const number of [1,2,4,5,6,7,8]){
 const prefix=`page-${String(number).padStart(2,'0')}`;
 let background=await readFile(root+prefix+'.svg','utf8');
 const scene={width:720,height:540,background:prefix+'-background.svg',layers:[],tracks:[]};
 const assets=[];
 function add(id,body,pivot,parent){
  const image=`${prefix}-${id}.svg`;assets.push([image,wrap(body)]);
  scene.layers.push({id,image,x:0,y:0,width:720,height:540,pivot,...(parent?{parent}:{})});return id;
 }
 function track(layer,preset,parameters,{durationMs=1800,delayMs=450,restMs=4000,playback='repeat'}={}){
  scene.tracks.push({layer,preset,playback,durationMs,restMs:Math.min(restMs,1800),delayMs,parameters});
 }
 function group(marker){
  const found=[...background.matchAll(/<g transform="translate\([^>]+>[\s\S]*?<\/g>/g)].find(m=>m[0].includes(marker));
  if(!found)throw Error(`Missing ${marker} on ${number}`);
  const full=found[0], opening=full.slice(0,full.indexOf('>')+1),body=full.slice(opening.length,-4);
  const [x,y,s]=opening.match(/translate\(([-.\d]+) ([-.\d]+)\) scale\(([-.\d]+)\)/).slice(1).map(Number);
  return {full,opening,body,parts:body.match(/<[^>]+\/>/g),at:(a,b)=>[x+a*s,y+b*s],wrap:b=>opening+b+'</g>'};
 }
 // Exact string removal deliberately fails if the source changes.
 function extract(g,parts){let body=g.body;for(const part of parts){if(!body.includes(part))throw Error('Source ink changed');body=body.replace(part,'');}background=background.replace(g.full,g.wrap(body));return g.wrap(parts.join(''));}
 if(number===1||number===5||number===8){
  const g=group('M-54 -30');const parts=g.parts.filter(owlHead);
  const extractedHead=extract(g,parts);
  // The original body oval covers the inner ear polygon. Preserve that occlusion
  // in the extracted head, instead of painting a new dark patch over the forehead.
  const ear=parts.find(p=>p.includes('M-54 -30'));
  const head=extractedHead.replace(ear,`<defs><mask id="ear-silhouette" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200"><rect x="-100" y="-100" width="200" height="200" fill="white"/><ellipse cy="6" rx="66" ry="80" fill="black"/></mask></defs><g mask="url(#ear-silhouette)">${ear}</g>`);
  add('pip-head',head,g.at(0,5));
  track('pip-head',number===1?'gesture':'settle',{x:0,y:number===5?-9:number===8?2:0,angle:number===5?-7:number===8?2:4},{playback:'repeat',durationMs:2200});
  if(number===1){
   const lids='<circle cx="-25" cy="-21" r="29" fill="#fff2cf"/><circle cx="25" cy="-21" r="29" fill="#fff2cf"/><path d="M-38 -20q13 13 26 0M12 -20q13 13 26 0" fill="none" stroke="#403e4e" stroke-width="4" stroke-linecap="round"/>';
   add('pip-eyelids',g.wrap(lids),g.at(0,5),'pip-head');track('pip-eyelids','blink',{}, {durationMs:260,delayMs:1100,restMs:5200});
  }
  if(number===5){
   // Gaze is removed from the extracted head too, avoiding a second static pair.
   const head=assets.find(a=>a[0].endsWith('-pip-head.svg'));const pupils=head[1].match(eye);head[1]=head[1].replace(eye,'');
   add('pip-gaze',g.wrap(pupils.join('')),g.at(0,-18),'pip-head');track('pip-gaze','settle',{x:0,y:-5,angle:0},{playback:'repeat',delayMs:950,durationMs:1300});
   const bush=group('fill="#739080"');background=background.replace(bush.full,'');add('bush-foreground',bush.full,[390,427]);
  }
 }
 if(number===2){
  const g=group('#bb8f98');const tear=g.parts.find(p=>p.includes('#9ed4d8')),nose=g.parts.find(p=>p.includes('#bb8f98'));
  extract(g,[tear,nose]);add('rabbit-nose',g.wrap(nose),g.at(0,0));track('rabbit-nose','gesture',{x:0,y:-2.6,angle:0},{durationMs:650,restMs:2200});
  // Origin is just beneath the left eye; the approved drop shape is reused.
  for(const [id,delayMs] of [['rabbit-tear',450],['rabbit-tear-second',1250]]){
   scene.layers.push({id,image:'page-03-tear.svg',x:498,y:387,width:11,height:18,pivot:[503,387]});
   track(id,'tear-fall',{distanceY:89},{durationMs:1800,restMs:1700,delayMs});
  }
 }
 if(number===4){
  const owl=group('M-54 -30'),pupils=owl.body.match(eye);add('pip-gaze',extract(owl,pupils),owl.at(0,-18));track('pip-gaze','gesture',{x:6,y:3,angle:0},{durationMs:2800});
  const rabbit=group('#bb8f98');add('rabbit-head',extract(rabbit,rabbit.parts.filter(rabbitHead)),rabbit.at(0,18));track('rabbit-head','gesture',{x:2,y:1,angle:7},{durationMs:2800,delayMs:700});
 }
 if(number===6){
  const g=group('M-54 -30'),wings=g.parts.filter(p=>p.includes('#8c6c64'));background=background.replace(g.full,'');
  let body=g.body;for(const wing of wings)body=body.replace(wing,'');
  add('pip-body',g.wrap(body),g.at(0,0));track('pip-body','arrive',{x:24,y:56,angle:0},{playback:'repeat',durationMs:2600});
  wings.forEach((wing,i)=>{const id=`pip-wing-${i?'right':'left'}`;add(id,g.wrap(wing),g.at(i?57:-57,-14),'pip-body');track(id,'flap',{angle:i?-38:38},{playback:'repeat',durationMs:2600});});
 }
 if(number===7){
  const ball=background.match(/<g><circle cx="449"[\s\S]*?<\/g>/)[0];background=background.replace(ball,'');add('red-ball',ball,[449,447]);track('red-ball','settle',{x:31,y:3,angle:70},{playback:'repeat',durationMs:2100});
  const g=group('#bb8f98');background=background.replace(g.full,'');
  const ears=g.parts.filter(p=>p.includes('cy="-72"')||p.includes('cy="-78"'));
  for(const [side,indices] of [['left',[0,2]],['right',[1,3]]]){
   const id=`rabbit-ear-${side}`;add(id,g.wrap(indices.map(i=>ears[i]).join('')),g.at(side==='left'?-25:24,-25));track(id,'arrive',{x:0,y:0,angle:side==='left'?-13:13},{playback:'repeat',durationMs:1200,delayMs:1400});
  }
  let face=g.body;for(const ear of ears)face=face.replace(ear,'');add('rabbit-foreground',g.wrap(face),g.at(0,0));
  // The original ball is painted in front of Rabbit's paws. Retain that overlap.
  scene.layers.push(scene.layers.splice(scene.layers.findIndex(l=>l.id==='red-ball'),1)[0]);
 }
 if(number===8){
  const g=group('#bb8f98'),chest=g.parts.find(p=>p.includes('cy="43"'));background=background.replace(g.full,'');
  const behind=g.parts.filter(p=>p.includes('cy="-72"')||p.includes('cy="-78"')||p.includes('cx="48"'));
  add('rabbit-back',g.wrap(behind.join('')),g.at(0,0));
  add('rabbit-chest',g.wrap(chest),g.at(0,91));track('rabbit-chest','breathe',{amount:0.035},{durationMs:4000,restMs:1800});
  let front=g.body.replace(chest,'');for(const part of behind)front=front.replace(part,'');
  add('rabbit-foreground',g.wrap(front),g.at(0,0));
 }
 await writeFile(root+scene.background,background);
 for(const [name,content] of assets)await writeFile(root+name,content);
 story.pages[number-1].scene=scene;
}
await writeFile(root+'story.json',JSON.stringify(story,null,2)+'\n');
