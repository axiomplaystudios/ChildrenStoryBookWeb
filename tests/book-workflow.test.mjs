import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkPackage,installBook} from '../scripts/prepare-book.mjs';
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'book-workflow-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const input=join(root,'input'),output=join(root,'books');await mkdir(input);await mkdir(output);
 const story={id:'quiet-mouse',title:'Quiet Mouse',cover:'cover.svg',credit:'Original author; newly illustrated adaptation.',sourceUrl:'https://example.org/book',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',pages:[{text:'Mouse slept.',alt:'A sleeping mouse.',image:'page.svg',scene:{width:720,height:540,background:'background.svg',layers:[{id:'mouse',image:'mouse.svg',x:0,y:0,width:720,height:540,pivot:[360,300]}],tracks:[{layer:'mouse',preset:'breathe',parameters:{amount:.02},durationMs:4000,restMs:500,delayMs:0,playback:'repeat'}]}}],questions:['literal','literal','feeling','personal'].map(type=>({type,q:'Who?',a:'Mouse.',hintPage:1}))};
 const source={title:story.title,url:story.sourceUrl,license:'CC BY 4.0',creators:['An Author'],changes:'New artwork.',reviewed:true};
 const plan={pages:[{page:1,action:'Mouse breathes gently.',reviewed:true}]};
 const write=async(name,data)=>writeFile(join(input,name),typeof data==='string'?data:JSON.stringify(data));
 for(const [name,value]of Object.entries({'story.json':story,'source.json':source,'animation-plan.json':plan,'cover.svg':'<svg xmlns="http://www.w3.org/2000/svg"/>','page.svg':'<svg xmlns="http://www.w3.org/2000/svg"/>','background.svg':'<svg xmlns="http://www.w3.org/2000/svg"/>','mouse.svg':'<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L2 2" fill="#fff"/></svg>'}))await write(name,value);
 return {root,input,output,story,source,plan,write};
}
test('check is read-only and install outputs a complete catalog-ready book',async t=>{
 const f=await fixture(t);const result=await checkPackage(f.input);assert.equal(result.story.id,'quiet-mouse');assert.deepEqual(await readdir(f.output),[]);
 const destination=await installBook(f.input,f.output);assert.equal(destination,join(f.output,'quiet-mouse'));
 assert.deepEqual(JSON.parse(await readFile(join(destination,'story.json'),'utf8')),f.story);
 for(const file of ['mouse.svg','source.json','animation-plan.json'])assert.ok((await readFile(join(destination,file))).length);
});
test('missing layers/scenes and unreviewed plans never create a partial book',async t=>{
 const f=await fixture(t);await rm(join(f.input,'mouse.svg'));await assert.rejects(installBook(f.input,f.output),/mouse.svg/);assert.deepEqual(await readdir(f.output),[]);
 await f.write('mouse.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');delete f.story.pages[0].scene;await f.write('story.json',f.story);await assert.rejects(checkPackage(f.input),/scene/i);
});
test('provenance, matching source and per-page review are mandatory',async t=>{
 const f=await fixture(t);f.source.reviewed=false;await f.write('source.json',f.source);await assert.rejects(checkPackage(f.input),/review/i);
 f.source.reviewed=true;f.source.url='https://elsewhere.org/book';await f.write('source.json',f.source);await assert.rejects(checkPackage(f.input),/source/i);
 f.source.url=f.story.sourceUrl;await f.write('source.json',f.source);f.plan.pages[0].reviewed=false;await f.write('animation-plan.json',f.plan);await assert.rejects(checkPackage(f.input),/review/i);
});
test('existing destinations are never overwritten',async t=>{const f=await fixture(t);const dest=await installBook(f.input,f.output);await writeFile(join(dest,'sentinel'),'keep');await assert.rejects(installBook(f.input,f.output),/already exists/i);assert.equal(await readFile(join(dest,'sentinel'),'utf8'),'keep');});
test('rejects slug traversal and symlink assets',async t=>{
 const f=await fixture(t);f.story.id='../escape';await f.write('story.json',f.story);await assert.rejects(checkPackage(f.input),/ID/i);
 f.story.id='quiet-mouse';await f.write('story.json',f.story);await rm(join(f.input,'mouse.svg'));await symlink(join(f.input,'cover.svg'),join(f.input,'mouse.svg'));await assert.rejects(checkPackage(f.input),/symlink|regular file/i);
});
test('SVG scripting, remote references, encoded URLs and malformed markup are rejected',async t=>{
 const f=await fixture(t);
 for(const svg of ['<svg onload="alert(1)"/>','<svg><script>alert(1)</script></svg>','<svg><image href="https://evil.test/a"/></svg>','<svg><use href="&#104;ttps://evil.test/a"/></svg>','<!DOCTYPE svg [<!ENTITY x "bad">]><svg/>','<svg><foreignObject/></svg>','<svg><path style="fill:url(https://evil.test/a)"/></svg>','<svg><g></svg>','<svg><path fill="url(https://evil.test/a)"/></svg>']){await f.write('mouse.svg',svg);await assert.rejects(checkPackage(f.input),/SVG/i,svg);}
 await f.write('mouse.svg','<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky"><stop offset="0" stop-color="#fff"/></linearGradient></defs><path d="M0 0L5 5" fill="url(#sky)"/></svg>');await checkPackage(f.input);
});

test('undecodable images are rejected before installation',async t=>{
 const f=await fixture(t);
 f.story.pages[0].image='broken.png';await f.write('story.json',f.story);
 await writeFile(join(f.input,'broken.png'),Buffer.from([137,80,78,71,13,10,26,10]));
 await assert.rejects(installBook(f.input,f.output),/decode|image/i);
 assert.deepEqual(await readdir(f.output),[]);
});
test('assisted packages reject one-shot motion and long idle gaps',async t=>{
 const f=await fixture(t);f.story.pages[0].scene.tracks[0].playback='once';await f.write('story.json',f.story);
 await assert.rejects(checkPackage(f.input),/repeat|loop/i);
 f.story.pages[0].scene.tracks[0].playback='repeat';f.story.pages[0].scene.tracks[0].restMs=6000;await f.write('story.json',f.story);
 await assert.rejects(checkPackage(f.input),/rest|1800/i);
});
test('original packages need honest provenance but no invented external source',async t=>{
 const f=await fixture(t);delete f.story.sourceUrl;delete f.story.licenseUrl;f.story.origin='original';f.story.category='LEARN TOGETHER';f.story.learningTopic='Counting';
 f.source.kind='original';delete f.source.url;f.source.license='Original project content; no additional licence granted';
 await f.write('story.json',f.story);await f.write('source.json',f.source);
 assert.equal((await checkPackage(f.input)).story.origin,'original');
 delete f.source.kind;await f.write('source.json',f.source);await assert.rejects(checkPackage(f.input),/original|provenance/i);
 f.source.kind='original';f.source.creators=[];await f.write('source.json',f.source);await assert.rejects(checkPackage(f.input),/provenance/i);
});
test('adaptations cannot bypass source verification by claiming original provenance only',async t=>{
 const f=await fixture(t);f.source.kind='original';await f.write('source.json',f.source);await assert.rejects(checkPackage(f.input),/original|provenance/i);
});
