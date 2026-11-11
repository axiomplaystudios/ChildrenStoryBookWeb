import {mkdir,writeFile} from 'node:fs/promises';
import {svg} from './art.mjs';
import {validateStory} from '../../src/story.js';
export async function writeBook(book){
 const root=`authoring/${book.id}`;await mkdir(root,{recursive:true});
 const pages=[];
 for(const [i,s]of book.scenes.entries()){
  const prefix=`page-${String(i+1).padStart(2,'0')}`;
  await writeFile(`${root}/${prefix}-background.svg`,svg(s.bg));
  for(const l of s.layers)await writeFile(`${root}/${prefix}-${l.id}.svg`,svg(l.art));
  await writeFile(`${root}/${prefix}.svg`,svg(s.bg+s.layers.map(l=>l.art).join('')));
  pages.push({text:s.text,alt:s.alt,image:`${prefix}.svg`,...(s.learning?{learning:s.learning}:{}),scene:{width:900,height:720,background:`${prefix}-background.svg`,layers:s.layers.map(l=>({id:l.id,image:`${prefix}-${l.id}.svg`,x:0,y:0,width:900,height:720,pivot:l.pivot,...(l.parent?{parent:l.parent}:{})})),tracks:s.tracks}});
 }
 await writeFile(`${root}/cover.svg`,svg(book.cover??book.scenes[0].bg+book.scenes[0].layers.map(l=>l.art).join('')));
 const story={id:book.id,title:book.title,subtitle:book.subtitle,origin:'original',category:'LEARN TOGETHER',learningTopic:book.learningTopic,cover:'cover.svg',credit:'Original story and vector illustrations created for Bedtime Bookshelf with AI assistance. For playful shared reading; not an assessment or certified curriculum.',pages,questions:book.questions};
 validateStory(story);
 await writeFile(`${root}/story.json`,JSON.stringify(story,null,2)+'\n');
 await writeFile(`${root}/source.json`,JSON.stringify({kind:'original',title:book.title,creators:['Created for Bedtime Bookshelf with AI assistance'],license:'Original project content; no additional licence granted',changes:'New original story, layered vector illustrations, repeating animations and discussion questions.',reviewed:false},null,2)+'\n');
 await writeFile(`${root}/animation-plan.json`,JSON.stringify({pages:book.scenes.map((s,i)=>({page:i+1,action:s.action,reviewed:false}))},null,2)+'\n');
 await writeFile(`${root}/editorial-notes.md`,`# ${book.title}\n\nOriginal AI-assisted story. Topic: ${book.learningTopic}.\n\n${book.notes??''}\n\nReferences consulted:\n${(book.references??[]).map(r=>`- ${r}`).join('\n')}\n\nReview flags reset by regeneration. Inspect every static image and animated scene before approval.\n`);
 console.log(`Prepared ${book.id}: ${pages.length} pages (review pending).`);
 return story;
}
