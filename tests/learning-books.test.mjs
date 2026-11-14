import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateStory} from '../src/story.js';
import {storyAssets} from '../src/scene-schema.js';
const expected={
 'pips-alphabet-adventure':28,'mouses-counting-picnic':12,'rabbits-rainbow-garden':10,'little-shape-builders':8,'pips-planet-journey':10,'big-bear-little-mouse':8,'where-is-teddy':8,'weather-window':8,'pattern-parade':8,'day-of-feelings':8,
};
const get=async id=>JSON.parse(await readFile(`public/books/${id}/story.json`,'utf8'));
for(const [id,count]of Object.entries(expected))test(`${id}: reviewed original package, full scenes and installed assets match authoring`,async()=>{
 const book=await get(id);validateStory(book);assert.equal(book.pages.length,count);assert.equal(book.origin,'original');assert.equal(book.category,'LEARN TOGETHER');assert.ok(book.learningTopic);assert.match(book.credit,/AI assistance/);assert.ok(!book.logo);assert.ok(!book.sourceUrl);assert.ok(!book.licenseUrl);
 assert.deepEqual(book,JSON.parse(await readFile(`authoring/${id}/story.json`,'utf8')));
 const source=JSON.parse(await readFile(`authoring/${id}/source.json`));assert.equal(source.kind,'original');assert.equal(source.reviewed,true);
 const plan=JSON.parse(await readFile(`authoring/${id}/animation-plan.json`));assert.equal(plan.pages.length,count);assert.ok(plan.pages.every((p,i)=>p.page===i+1&&p.reviewed&&p.action.length>15));
 for(const p of book.pages){assert.ok(p.scene);assert.ok(p.scene.tracks.every(t=>t.playback==='repeat'&&t.restMs<=1800));assert.ok(p.text.length<=260,`${id}: overly long page`);assert.ok(p.alt.length>15);}
 for(const asset of storyAssets(book))assert.deepEqual(await readFile(`public/books/${id}/${asset}`),await readFile(`authoring/${id}/${asset}`));
});
test('alphabet contains A-Z once in order, uppercase/lowercase and pictured words',async()=>{
 const b=await get('pips-alphabet-adventure');const letters=b.pages.filter(p=>p.learning?.letter);
 assert.deepEqual(letters.map(p=>p.learning.letter),Array.from({length:26},(_,i)=>String.fromCharCode(65+i)));
 const words='apple ball cup drum egg fish gift hat insect jug kite leaf moon nest orange paintbrush quilt rabbit sock teddy umbrella vase wagon x-ray yarn zip'.split(' ');
 assert.deepEqual(letters.map(p=>p.learning.word),words);
 for(const p of letters){const {letter,word}=p.learning;assert.ok(word);assert.match(p.text,new RegExp(`\\b${letter}\\b`));const art=await readFile(`public/books/${b.id}/${p.image}`,'utf8');const labels=[...art.matchAll(/<title>([^<]*)<\/title>/g)].map(m=>m[1]);assert.ok(!/<text\b/.test(art));assert.ok(labels.includes(`${letter} ${letter.toLowerCase()}`));assert.ok(labels.includes(word));assert.ok(p.text.toLowerCase().includes(word.toLowerCase()));}
 assert.equal(letters[23].learning.word.toLowerCase(),'x-ray');
});
test('counting scenes have exactly one through ten distinct visible targets',async()=>{
 const b=await get('mouses-counting-picnic');const pages=b.pages.filter(p=>p.learning?.number!==undefined);
 assert.deepEqual(pages.map(p=>p.learning.number),[1,2,3,4,5,6,7,8,9,10]);
 for(const p of pages){const art=await readFile(`public/books/${b.id}/${p.image}`,'utf8');const ids=[...art.matchAll(/id="count-target-(\d+)"/g)].map(m=>m[1]);assert.equal(ids.length,p.learning.number);assert.equal(new Set(ids).size,ids.length);assert.ok(!p.scene.tracks.some(t=>t.layer.startsWith('count-target')));}
});
test('eight planets follow independent astronomical order and illustrations state scale caveat',async()=>{
 const b=await get('pips-planet-journey');const pages=b.pages.filter(p=>p.learning?.planet);
 assert.deepEqual(pages.map(p=>p.learning.planet),['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune']);
 assert.deepEqual(pages.map(p=>p.learning.order),[1,2,3,4,5,6,7,8]);
 for(const p of pages){assert.ok(p.text.includes(p.learning.planet));assert.match(await readFile(`public/books/${b.id}/${p.image}`,'utf8'),/not to scale/i);}
 assert.match(b.pages.map(p=>p.text).join(' '),/star/i);
});
test('learning concepts cover the planned colours, shapes, positions and feelings',async()=>{
 for(const [id,key,wanted]of [
  ['rabbits-rainbow-garden','colour',['red','orange','yellow','green','blue','purple','pink']],
  ['little-shape-builders','shape',['circle','square','triangle','rectangle']],
  ['where-is-teddy','position',['in','on','under','behind','beside']],
  ['weather-window','weather',['sunny','rainy','windy','cloudy','snowy']],
  ['day-of-feelings','feeling',['happy','sad','angry','worried','excited','calm']],
 ]){const book=await get(id);const values=book.pages.map(p=>p.learning?.[key]).filter(Boolean);assert.deepEqual([...new Set(values)].sort(),wanted.sort(),id);}
});
test('pattern pages demonstrate at least two full units and marked stable items',async()=>{
 const b=await get('pattern-parade');const pages=b.pages.filter(p=>p.learning?.pattern);
 assert.ok(pages.length>=5);
 for(const p of pages){const {pattern,unit}=p.learning;assert.ok(unit.length>=2&&unit.length<=3);assert.ok(pattern.length>=unit.length*2);for(const [i,item]of pattern.entries())assert.equal(item,unit[i%unit.length]);const art=await readFile(`public/books/${b.id}/${p.image}`,'utf8');assert.equal([...art.matchAll(/id="pattern-item-\d+"/g)].length,pattern.length);}
});

// Independent expectations protect against a generator changing both its metadata and art.
test('pattern pictures preserve the planned AB and AAB sequences',async()=>{
 const b=await get('pattern-parade');
 const expected=[
  ['red circle','blue circle','red circle','blue circle'],
  ['yellow square','green square','yellow square','green square'],
  ['blue circle','blue triangle','blue circle','blue triangle'],
  ['red circle','red circle','blue circle','red circle','red circle','blue circle'],
  ['yellow triangle','yellow triangle','green triangle','yellow triangle','yellow triangle','green triangle'],
  ['red circle','blue circle','red circle','blue circle','red circle'],
  ['red circle','blue circle','red circle','blue circle','red circle','blue circle'],
 ];
 const fills={red:'#cf564d',blue:'#508cb5',yellow:'#e9bc50',green:'#749763'};
 for(const [i,wanted] of expected.entries()){
  const art=await readFile(`public/books/${b.id}/${b.pages[i+1].image}`,'utf8');
  const items=[...art.matchAll(/<g id="pattern-item-\d+"><title>([^<]+)<\/title>(.*?)<\/g>/g)];
  assert.deepEqual(items.map(m=>m[1]),wanted);
  for(const [k,item] of items.entries()){
   const [colour,shape]=wanted[k].split(' ');assert.ok(item[2].includes(`fill="${fills[colour]}"`));
   assert.match(item[2],new RegExp('<'+({circle:'ellipse',square:'rect',triangle:'path'}[shape])+'\\b'));
  }
 }
});
test('counting backgrounds contain no incidental flowers, sprigs or fruit',async()=>{
 const b=await get('mouses-counting-picnic');
 for(const p of b.pages.filter(p=>p.learning?.number))assert.doesNotMatch(await readFile(`public/books/${b.id}/${p.image}`,'utf8'),/href="#(?:flower|sprig|fruit)"/);
});
test('planet rocket flames stay attached while the rocket floats',async()=>{
 const b=await get('pips-planet-journey');
 for(const p of b.pages.filter(p=>p.learning?.planet))assert.equal(p.scene.layers.find(l=>l.id==='flame')?.parent,'rocket');
});
