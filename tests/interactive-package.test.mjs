import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,readdir,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import * as importer from '../scripts/interactive/prepare-pair.mjs';
import * as packaging from '../scripts/interactive/package.mjs';
import * as catalog from '../scripts/interactive/catalog.mjs';
import {drawing,pairFixture,writeFixture,sourceFixture,reviewFixture} from './fixtures/interactive/pair.mjs';
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'pair-package-'));t.after(()=>rm(root,{recursive:true,force:true}));const input=join(root,'input'),output=join(root,'interactive');return {root,input,output,...await writeFixture(input)};}
test('checks without output, installs immutable versions and emits a complete hashed manifest',async t=>{
 const f=await fixture(t);assert.equal(typeof importer.checkPair,'function');const checked=await importer.checkPair(f.input);assert.equal(checked.pair.id,'fixture-pair');
 const dest=await importer.installPair(f.input,f.output);assert.equal(dest,join(f.output,'fixture-pair','v1'));
 const manifest=JSON.parse(await readFile(join(dest,'bundle.json'),'utf8'));assert.equal(manifest.files.length,4);
 for(const entry of manifest.files){const bytes=await readFile(join(dest,entry.file));assert.equal(entry.bytes,bytes.length);assert.equal(entry.sha256,createHash('sha256').update(bytes).digest('hex'));}
 await assert.rejects(importer.installPair(f.input,f.output),/exists|immutable/i);assert.deepEqual((await readdir(f.output)).filter(n=>n.startsWith('.')),[]);
 f.pair.version='v2';await f.write('pair.json',f.pair);await importer.installPair(f.input,f.output);assert.deepEqual(await readdir(join(f.output,'fixture-pair')),['v1','v2']);
});
test('missing/unreviewed provenance and visual states prevent any publication',async t=>{
 const f=await fixture(t);const source=sourceFixture(f.pair);source.reviewed=false;await f.write('source.json',source);await assert.rejects(importer.installPair(f.input,f.output),/review/i);
 await f.write('source.json',sourceFixture(f.pair));const review=reviewFixture(f.pair);review.scenes[0].outcomes=false;await f.write('visual-review.json',review);await assert.rejects(importer.installPair(f.input,f.output),/review|outcome/i);
 await f.write('visual-review.json',reviewFixture(f.pair));source.kind='adaptation';source.reviewed=true;await f.write('source.json',source);await assert.rejects(importer.checkPair(f.input),/source|license|provenance/i);
 await assert.rejects(readdir(f.output),{code:'ENOENT'});
});
test('verifies hashes/bytes, SVG safety, regular files and actual image decoding',async t=>{
 const f=await fixture(t);await f.write('drawing.svg',drawing+' ');await assert.rejects(importer.checkPair(f.input),/hash|bytes/i);
 for(const text of ['<svg onload="alert(1)"/>','<svg><script>alert(1)</script></svg>','<svg><use href="https://bad.test/a"/></svg>','<svg><g></svg>']){await f.write('drawing.svg',text);f.pair.assets[0].sha256=createHash('sha256').update(text).digest('hex');f.pair.assets[0].bytes=Buffer.byteLength(text);await f.write('pair.json',f.pair);await assert.rejects(importer.checkPair(f.input),/SVG/i);}
 await rm(join(f.input,'drawing.svg'));await symlink(join(f.input,'source.json'),join(f.input,'drawing.svg'));await assert.rejects(importer.checkPair(f.input),/symlink|regular file/i);
 await rm(join(f.input,'drawing.svg'));const bytes=Buffer.from([137,80,78,71,13,10,26,10]);f.pair=pairFixture();const replace=value=>typeof value==='string'?value.replaceAll('drawing.svg','drawing.png'):Array.isArray(value)?value.map(replace):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replace(v)])):value;f.pair=replace(f.pair);Object.assign(f.pair.assets[0],{sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,mediaType:'image/png'});await f.write('pair.json',f.pair);await writeFile(join(f.input,'drawing.png'),bytes);await assert.rejects(importer.installPair(f.input,f.output),/decode|image/i);
});
test('package authoring computes real metadata and defaults every review flag to false',async t=>{
 const f=await fixture(t);await rm(join(f.input,'source.json'));await rm(join(f.input,'visual-review.json'));const p=pairFixture();p.assets[0].sha256='0'.repeat(64);await packaging.writePairPackage(f.input,p,{source:{license:'Original fixture',creators:['Author'],changes:'New art'}});
 const source=JSON.parse(await readFile(join(f.input,'source.json'),'utf8')),review=JSON.parse(await readFile(join(f.input,'visual-review.json'),'utf8'));assert.equal(source.reviewed,false);assert.equal(review.reviewed,false);assert.ok(review.scenes.every(s=>!s.rest&&!s.motion&&!s.outcomes&&!s.guidance));assert.equal(JSON.parse(await readFile(join(f.input,'pair.json'),'utf8')).assets[0].sha256,createHash('sha256').update(drawing).digest('hex'));await assert.rejects(importer.checkPair(f.input),/review/i);
});
test('catalog is empty before content, exposes lightweight covers and measured bundle summaries only',async t=>{
 const f=await fixture(t);assert.deepEqual(await catalog.buildInteractiveCatalog(f.output),[]);const dest=await importer.installPair(f.input,f.output);const summaries=await catalog.buildInteractiveCatalog(f.output);assert.equal(summaries.length,1);const summary=summaries[0];assert.equal(summary.id,'fixture-pair');assert.equal(summary.manifestUrl,'./fixture-pair/v1/bundle.json');assert.equal(summary.cover,'./covers/fixture-pair--v1.svg');assert.equal(summary.scenes,undefined);assert.equal(summary.assets,undefined);
 const manifestBytes=await readFile(join(dest,'bundle.json')),manifest=JSON.parse(manifestBytes);assert.equal(summary.totalBytes,manifestBytes.length+manifest.files.reduce((n,a)=>n+a.bytes,0));assert.equal(summary.manifestSha256,createHash('sha256').update(manifestBytes).digest('hex'));assert.equal(await readFile(join(f.output,'covers','fixture-pair--v1.svg'),'utf8'),drawing);
});
test('catalog cover names cannot collide across pair IDs and versions',async t=>{
 const f=await fixture(t);await importer.installPair(f.input,f.output);f.pair.id='fixture';f.pair.version='pair-v1';await f.write('pair.json',f.pair);await importer.installPair(f.input,f.output);const summaries=await catalog.buildInteractiveCatalog(f.output);assert.equal(new Set(summaries.map(s=>s.cover)).size,2);
});
