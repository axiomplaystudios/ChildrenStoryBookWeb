import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../scripts/learning/art.mjs';
test('labels use portable outlines with accessible titles',()=>{
 assert.match(art.label('A a',450,200,100),/^<g><title>A a<\/title><path d="M[^"]+" fill="#5d473f"\/><\/g>$/);
 assert.match(art.label('Pip’s <party>',450,80,40),/<title>Pip’s &lt;party&gt;<\/title>/);
 assert.ok(art.labelWidth('apple',40)>80 && art.labelWidth('apple',40)<140);
 const outlined=art.label('red',450,200,54,{fill:'#db4541',outline:'#fff6e0'});
 assert.ok(outlined.indexOf('stroke="#fff6e0"')<outlined.indexOf('fill="#db4541"'));
 assert.throws(()=>art.label('tiny',0,0,12),/at least 18/);
});
test('SVG definitions include only referenced resources, including dependencies',()=>{
 art.gradient('kit-a','linear',[[0,'#fff'],[1,'#000']]);
 art.gradient('kit-b','linear',[[0,'#fff'],[1,'#000']]);
 art.define('kit-symbol',art.R(0,0,20,20,'url(#kit-a)'));
 const out=art.svg(art.use('kit-symbol',10,20));
 assert.match(out,/id="kit-a"/); assert.match(out,/id="kit-symbol"/); assert.doesNotMatch(out,/id="kit-b"/);
 assert.match(out,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="900" height="720" viewBox="0 0 900 720">/);
});
test('random seeds reproduce a scene and distinguish scenes',()=>{
 const a=art.random(7),b=art.random(7),c=art.random(8);
 assert.deepEqual([a(),a(),a()],[b(),b(),b()]); assert.notEqual(art.random(7)(),c());
});

test('characters keep feet grounded and hands follow raised arms',async()=>{
 const cast=await import('../scripts/learning/cast.mjs');
 for(const name of ['mouse','pip','rabbit','bear','teddy']){
  const c=cast[name]({x:450,y:600});assert.ok(c.art.length>500);assert.match(c.shadow,/<ellipse/);assert.ok(c.top<450);
  assert.ok(c.hand('L')[0]<450 && c.hand('R')[0]>450);
 }
 const down=cast.mouse({x:450,y:600}).hand('L'),up=cast.mouse({x:450,y:600,armL:120}).hand('L');assert.ok(up[1]<down[1]&&up[0]<down[0]);
 const faces=['happy','sad','angry','worried'].map(brows=>cast.bear({x:450,y:600,brows:brows==='happy'?undefined:brows,mouth:brows==='happy'?'grin':'sad'}).art);assert.equal(new Set(faces).size,4);
});
test('actors separate moving parts and hide eyelids from the resting picture',async()=>{
 const {actor,mouse}=await import('../scripts/learning/cast.mjs');
 const {posesSeenByBrowserSampling}=await import('./helpers/loop-sampling.mjs');
 const a=actor('mouse',mouse({x:450,y:600}),{wave:'L',tail:true});
 assert.deepEqual(a.layers.map(l=>l.id),['mouse-tail','mouse','mouse-arm','mouse-lids']);
 assert.equal(a.layers.at(-1).restHidden,true);assert.equal(a.layers.at(-1).parent,'mouse');
 for(const t of a.tracks)for(const offset of [0,173,541,997])assert.ok(posesSeenByBrowserSampling(t,offset)>1);
});
test('scenery and props are deterministic and learning-safe',async()=>{
 const {outdoor}=await import('../scripts/learning/scenery.mjs');const {prop}=await import('../scripts/learning/props.mjs');
 for(const kind of 'apple ball cup drum egg fish gift hat insect jug kite leaf moon nest orange paintbrush quilt rabbit sock teddy umbrella vase wagon x-ray yarn zip sandwich carrot napkin spoon strawberry flower'.split(' ')){const p=prop(kind);assert.ok(p.art.length>100&&Number.isFinite(p.base),kind);}
 assert.throws(()=>prop('unicorn'));assert.equal(outdoor({seed:3}),outdoor({seed:3}));assert.notEqual(outdoor({seed:3}),outdoor({seed:4}));assert.notEqual(outdoor({time:'day'}),outdoor({time:'dusk'}));
 assert.doesNotMatch(art.svg(outdoor({plain:true})),/href="#(flower|sprig|fruit)"/);assert.match(art.svg(outdoor()),/href="#flower"/);
});
test('surroundings move throughout browser loop samples',async()=>{
 const {drift,flutter,twinkle,sway,fall}=await import('../scripts/learning/scenery.mjs');const {posesSeenByBrowserSampling}=await import('./helpers/loop-sampling.mjs');
 for(const m of [drift('cloud','<g/>',{dx:40,ms:9000}),flutter('fly',300,200,'#eaa85c'),twinkle('stars','<g/>'),sway('kite','<g/>',[500,300]),fall('leaf','<g/>')])for(const t of m.tracks)assert.ok(t.playback==='repeat'&&t.restMs<=1800&&posesSeenByBrowserSampling(t)>1);
});
test('scene packaging writes static fallbacks without eyelids and resets review flags',async()=>{
 const {scene,writeBook}=await import('../scripts/learning/package.mjs');const {mouse,actor}=await import('../scripts/learning/cast.mjs');const {mkdtemp,readFile,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const root=await mkdtemp(join(tmpdir(),'learning-kit-'));
 try{const c=actor('mouse',mouse({x:450,y:600}));const page=scene({text:'Hello, Mouse.',alt:'Mouse smiles.',action:'Mouse breathes and blinks.',back:[art.R(0,0,900,720,'#eee')],cast:[c]});
 const book={id:'kit-test',title:'Kit test',subtitle:'Shared reading',learningTopic:'Test',cover:art.R(0,0,900,720,'#ddd'),scenes:[page,page],questions:[{type:'literal',q:'Where?',a:'Here.',hintPage:1},{type:'literal',q:'Who?',a:'Mouse.',hintPage:1},{type:'feeling',q:'How?',a:'Happy.',hintPage:1},{type:'personal',q:'You?',a:'Any.',hintPage:1}]};
 await writeBook(book,{root});const read=f=>readFile(join(root,'kit-test',f),'utf8');
 assert.equal(JSON.parse(await read('source.json')).reviewed,false);assert.ok(JSON.parse(await read('animation-plan.json')).pages.every(p=>!p.reviewed));
 assert.ok(!(await read('page-01.svg')).includes(c.layers.at(-1).art));assert.ok((await read('page-01-mouse-lids.svg')).includes(c.layers.at(-1).art));
 for(const [change,pattern] of [[{cover:undefined},/cover/],[{cover:page.bg+page.layers.filter(l=>!l.restHidden).map(l=>l.art).join('')},/cover/],[{scenes:[{...page,bg:'<text>Oops</text>'}]},/page 1.*text/i],[{scenes:[{...page,tracks:page.tracks.slice(0,1)}]},/page 1.*two/i],[{scenes:[{...page,tracks:page.tracks.map(t=>({...t,layer:'missing'}))}]},/page 1.*layer/i],[{scenes:[{...page,bg:art.R(0,0,900,720,'#eee')+' '.repeat(123000)}]},/page 1.*120/i],[{scenes:[{...page,tracks:page.tracks.map(t=>({...t,preset:'gesture',parameters:{x:0,y:0,angle:0}}))}]},/page 1.*pose/i]])await assert.rejects(()=>writeBook({...book,...change},{root}),pattern);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('packaging rejects accidentally stringified objects in artwork',async()=>{
 const {writeBook}=await import('../scripts/learning/package.mjs');
 await assert.rejects(()=>writeBook({cover:'[object Object]',scenes:[]}),/artwork/);
});
