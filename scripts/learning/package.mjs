import {mkdir,writeFile} from 'node:fs/promises';
import {svg} from './art.mjs';
import {validateStory} from '../../src/story.js';
import {sampleTrack} from '../../src/scene-motion.js';
import {join} from 'node:path';
export function scene({text,alt,action,learning,back=[],cast=[],movers=[],front=[]}){
 const ordered=[...movers.filter(m=>m.behind),...cast,...movers.filter(m=>!m.behind)];
 return {text,alt,action,...(learning?{learning}:{}),bg:back.join('')+cast.map(c=>c.shadow??'').join(''),layers:[...ordered.flatMap(c=>c.layers),...(front.length?[{id:'front',art:front.join(''),pivot:[450,360]}]:[])],tracks:ordered.flatMap(c=>c.tracks)};
}
const staticArt=s=>s.bg+s.layers.filter(l=>!l.restHidden).map(l=>l.art).join('');
function guard(book){
 if([book.cover,...book.scenes.flatMap(s=>[s.bg,...s.layers.map(l=>l.art)])].some(a=>typeof a==='string'&&a.includes('[object Object]')))throw Error('Invalid artwork: stringified object');
 if(!book.cover||book.cover===staticArt(book.scenes[0]))throw Error('Book cover must be a separate picture');
 for(const [i,s] of book.scenes.entries()){
  const fail=message=>{throw Error(`Page ${i+1}: ${message}`);};
  if(s.tracks.length<2)fail('needs at least two tracks');
  if(s.layers.length>7)fail('more than seven layers');
  for(const t of s.tracks){
   if(!s.layers.some(l=>l.id===t.layer))fail('unknown track layer');
   if(t.playback!=='repeat'||t.restMs>1800)fail('motion must repeat with a short rest');
   for(const offset of [0,137,290,451]){const poses=new Set(Array.from({length:15},(_,n)=>JSON.stringify(Object.values(sampleTrack(t,60050+offset+(n+1)*617)).map(v=>v.toFixed(3)))));if(poses.size<2)fail('track shows only one pose');}
  }
  for(const content of [s.bg,staticArt(s),...s.layers.map(l=>l.art)]){const data=svg(content);if(/<text\b/i.test(data))fail('text must be outlined');if(Buffer.byteLength(data)>120*1024)fail('SVG exceeds 120 KiB');}
 }
 if(/<text\b/i.test(book.cover)||Buffer.byteLength(svg(book.cover))>120*1024)throw Error('Invalid cover: text or size');
}

export async function writeBook(book,{root:base='authoring'}={}){
 guard(book);
 const root=join(base,book.id);await mkdir(root,{recursive:true});
 const pages=[];
 for(const [i,s]of book.scenes.entries()){
  const prefix=`page-${String(i+1).padStart(2,'0')}`;
  await writeFile(`${root}/${prefix}-background.svg`,svg(s.bg));
  for(const l of s.layers)await writeFile(`${root}/${prefix}-${l.id}.svg`,svg(l.art));
  await writeFile(`${root}/${prefix}.svg`,svg(staticArt(s)));
  pages.push({text:s.text,alt:s.alt,image:`${prefix}.svg`,...(s.learning?{learning:s.learning}:{}),scene:{width:900,height:720,background:`${prefix}-background.svg`,layers:s.layers.map(l=>({id:l.id,image:`${prefix}-${l.id}.svg`,x:0,y:0,width:900,height:720,pivot:l.pivot,...(l.parent?{parent:l.parent}:{})})),tracks:s.tracks}});
 }
 await writeFile(`${root}/cover.svg`,svg(book.cover));
 const story={id:book.id,title:book.title,subtitle:book.subtitle,origin:'original',category:'LEARN TOGETHER',learningTopic:book.learningTopic,cover:'cover.svg',credit:'Original story and vector illustrations created for Bedtime Bookshelf with AI assistance. For playful shared reading; not an assessment or certified curriculum.',pages,questions:book.questions};
 validateStory(story);
 await writeFile(`${root}/story.json`,JSON.stringify(story,null,2)+'\n');
 await writeFile(`${root}/source.json`,JSON.stringify({kind:'original',title:book.title,creators:['Created for Bedtime Bookshelf with AI assistance'],license:'Original project content; no additional licence granted',changes:'New original story, layered vector illustrations, repeating animations and discussion questions.',reviewed:false},null,2)+'\n');
 await writeFile(`${root}/animation-plan.json`,JSON.stringify({pages:book.scenes.map((s,i)=>({page:i+1,action:s.action,reviewed:false}))},null,2)+'\n');
 await writeFile(`${root}/editorial-notes.md`,`# ${book.title}\n\nOriginal AI-assisted story. Topic: ${book.learningTopic}.\n\n${book.notes??''}\n\nReferences consulted:\n${(book.references??[]).map(r=>`- ${r}`).join('\n')}\n\nReview flags reset by regeneration. Inspect every static image and animated scene before approval.\n`);
 console.log(`Prepared ${book.id}: ${pages.length} pages (review pending).`);
 return story;
}
