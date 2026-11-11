import {test,expect} from '@playwright/test';
import {readFile,readdir} from 'node:fs/promises';
import {prepareBundleFixtures,mountBundleFixture,restoreBundleBuild} from './helpers/interactive-bundles.mjs';

let v1,v2;
test.beforeAll(async()=>{[v1,v2]=await prepareBundleFixtures();});
test.afterAll(restoreBundleBuild);
test.beforeEach(async({page})=>{await mountBundleFixture(page);});
const status=(page,summary=v1)=>page.evaluate(s=>window.store.status(s),summary);
const install=(page,summary=v1)=>page.evaluate(s=>window.store.install(s),summary);

test('undownloaded artwork stays unavailable offline',async({page,context})=>{
 expect((await status(page)).status).toBe('not-downloaded');
 await context.setOffline(true);
 expect(await page.evaluate(async()=>{try{await window.store.open('fixture-pair','v1');return 'opened';}catch(e){return e.code;}})).toBe('not-downloaded');
 await expect(install(page)).rejects.toThrow();expect((await status(page)).status).toBe('error');
});

test('every verified byte is required before ready and complete opening works offline',async({page,context})=>{
 await page.route('**/v1/drawing.svg',async route=>{await new Promise(r=>setTimeout(r,150));await route.continue();});
 await page.evaluate(s=>{window.progress=[];window.installing=window.store.install(s,{onProgress:p=>window.progress.push(p)});},v1);
 await expect.poll(()=>page.evaluate(()=>window.progress.length)).toBeGreaterThan(1);
 expect((await status(page)).status).toBe('downloading');
 await page.evaluate(()=>window.installing);
 expect(await status(page)).toMatchObject({status:'ready',verifiedBytes:v1.totalBytes,totalBytes:v1.totalBytes,installedVersion:'v1'});
 await context.setOffline(true);
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');window.reader=b;const image=new Image();image.src=b.resolveAsset('drawing.svg');await image.decode();return {title:b.pair.title,width:image.naturalWidth,version:b.pair.version};})).toEqual({title:'A Welcome',width:32,version:'v1'});
});

test('abort halfway leaves no published or staged bundle',async({page})=>{
 const result=await page.evaluate(async s=>{const controller=new AbortController();try{await window.store.install(s,{signal:controller.signal,onProgress:p=>{if(p.verifiedBytes>s.manifestBytes)controller.abort();}});}catch(e){return {name:e.name,status:await window.store.status(s),caches:await caches.keys()};}},v1);
 expect(result.name).toBe('AbortError');expect(result.status.status).toBe('error');expect(result.caches.filter(n=>n.startsWith('interactive-bundles:'))).toEqual([]);
});

test('hash mismatch and quota failure never claim readiness',async({page})=>{
 const drawing=await readFile('dist/interactive/fixture-pair/v1/drawing.svg','utf8');
 await page.route('**/v1/drawing.svg',route=>route.fulfill({body:drawing.replace('#fc0','#0cf'),contentType:'image/svg+xml'}));
 await expect(install(page)).rejects.toThrow(/bytes|hash/i);expect((await status(page)).status).toBe('error');
 await page.unroute('**/v1/drawing.svg');
 await install(page);
 await page.evaluate(()=>{window.originalPut=Cache.prototype.put;Cache.prototype.put=function(){throw new DOMException('Storage full','QuotaExceededError');};});
 await expect(install(page,v2)).rejects.toThrow(/full/i);
 await page.evaluate(()=>{Cache.prototype.put=window.originalPut;});expect(await status(page,v2)).toMatchObject({status:'error',installedVersion:'v1',usable:true});
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');b.dispose();return b.pair.version;})).toBe('v1');
});

test('failed update retains v1 and open pins exact version through successful update/removal',async({page})=>{
 await install(page);expect((await status(page,v2)).status).toBe('update-available');
 await page.evaluate(async()=>{window.reader=await window.store.open('fixture-pair','v1');window.oldUrl=window.reader.resolveAsset('drawing.svg');});
 await page.route('**/v2/drawing.svg',route=>route.abort());await expect(install(page,v2)).rejects.toThrow();
 expect(await status(page,v2)).toMatchObject({status:'error',installedVersion:'v1',usable:true});
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');b.dispose();return b.pair.version;})).toBe('v1');
 await page.unroute('**/v2/drawing.svg');await install(page,v2);
 await page.evaluate(()=>window.store.remove('fixture-pair','v1'));
 expect(await page.evaluate(async()=>{const image=new Image();image.src=window.oldUrl;await image.decode();return image.naturalWidth;})).toBe(32);
 expect(await page.evaluate(()=>window.reader.pair.version)).toBe('v1');
 await page.evaluate(()=>window.reader.dispose());
 expect(await page.evaluate(async()=>{try{await fetch(window.oldUrl);return true;}catch{return false;}})).toBe(false);
 expect((await status(page,v2)).status).toBe('ready');
});

test('concurrent installs across stores and tabs do not delete the published cache',async({page,context})=>{
 const other=await context.newPage();await mountBundleFixture(other);
 await Promise.all([install(page),install(other)]);
 expect((await status(page)).status).toBe('ready');
 expect(await other.evaluate(async()=>{const a=await window.store.open('fixture-pair','v1');const response=await fetch(a.resolveAsset('drawing.svg'));a.dispose();return response.ok;})).toBe(true);
 await page.evaluate(async s=>{const other=window.createBundleStore({baseUrl:location.origin+'/'});await Promise.all([window.store.install(s),other.install(s)]);},v1);
 expect((await status(page)).status).toBe('ready');
});

test('removal waits for another tab reader and disposes object URLs',async({page,context})=>{
 await install(page);const other=await context.newPage();await mountBundleFixture(other);
 await other.evaluate(async()=>{window.reader=await window.store.open('fixture-pair','v1');});
 await page.evaluate(()=>window.store.remove('fixture-pair','v1'));
 expect((await status(page)).status).toBe('not-downloaded');
 expect(await page.evaluate(async()=>{const names=await caches.keys();return names.filter(n=>n.startsWith('interactive-bundles:')).length;})).toBe(1);
 await other.evaluate(()=>window.reader.dispose());
 await expect.poll(()=>page.evaluate(async()=>{const names=await caches.keys();return names.filter(n=>n.startsWith('interactive-bundles:')).length;})).toBe(0);
});

test('another tab successful retry clears the earlier download error',async({page,context})=>{
 await page.route('**/v1/drawing.svg',route=>route.abort());await expect(install(page)).rejects.toThrow();
 await page.unroute('**/v1/drawing.svg');const other=await context.newPage();await mountBundleFixture(other);await install(other);
 expect((await status(page)).status).toBe('ready');
});

test('an installed immutable version cannot be replaced with different manifest bytes',async({page})=>{
 await install(page);
 const bytes=Buffer.from((await readFile('dist/interactive/fixture-pair/v1/bundle.json','utf8')).trim());const {createHash}=await import('node:crypto');
 const changed={...v1,manifestSha256:createHash('sha256').update(bytes).digest('hex'),manifestBytes:bytes.length,totalBytes:v1.totalBytes-1};
 await page.route('**/v1/bundle.json',route=>route.fulfill({body:bytes,contentType:'application/json'}));
 await expect(install(page,changed)).rejects.toThrow(/immutable/i);
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');b.dispose();return b.pair.version;})).toBe('v1');
});

test('cached reuse still validates catalog integrity lengths and summary metadata',async({page})=>{
 await install(page);
 for(const changed of [{...v1,totalBytes:v1.totalBytes+1},{...v1,manifestBytes:v1.manifestBytes+1},{...v1,title:'Changed title'}])await expect(install(page,changed)).rejects.toThrow(/immutable|summary|bytes/i);
});

test('removing a bundle preserves unrelated application caches',async({page})=>{
 await page.evaluate(async()=>{const cache=await caches.open('another-application');await cache.put('/unrelated',new Response('keep me'));});
 await install(page);await page.evaluate(()=>window.store.remove('fixture-pair','v1'));
 await expect.poll(()=>page.evaluate(async()=>(await caches.keys()).filter(n=>n.startsWith('interactive-bundles:')).length)).toBe(0);
 expect(await page.evaluate(async()=>(await (await caches.open('another-application')).match('/unrelated')).text())).toBe('keep me');
});

test('cancellation during pointer publication aborts the metadata transaction',async({page})=>{
 const outcome=await page.evaluate(async s=>{
  const controller=new AbortController(),original=IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction=function(...args){const tx=original.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>controller.abort());return tx;};
  try{await window.store.install(s,{signal:controller.signal});return 'published';}catch(e){return e.name;}finally{IDBDatabase.prototype.transaction=original;}
 },v1);
 expect(outcome).toBe('AbortError');expect((await status(page)).status).toBe('error');
});

test('eviction or cached corruption invalidates readiness without networking',async({page})=>{
 await install(page);
 await page.evaluate(async()=>{for(const n of await caches.keys())if(n.startsWith('interactive-bundles:')){const c=await caches.open(n);for(const r of await c.keys())if(r.url.endsWith('/drawing.svg'))await c.delete(r);}});
 expect(await page.evaluate(async()=>{try{await window.store.open('fixture-pair','v1');return 'opened';}catch(e){return e.code;}})).toBe('evicted');
 expect((await status(page)).status).toBe('error');
 await install(page);
 await page.evaluate(async()=>{for(const n of await caches.keys())if(n.startsWith('interactive-bundles:')){const c=await caches.open(n);for(const r of await c.keys())if(r.url.endsWith('/drawing.svg'))await c.put(r,new Response('tampered'));}});
 expect(await page.evaluate(async()=>{try{await window.store.open('fixture-pair','v1');return 'opened';}catch(e){return e.code;}})).toBe('evicted');
});

test('rejects authenticated but unsafe manifest filenames and inconsistent pair assets',async({page})=>{
 for(const mutation of ['path','asset','schema']){
  const manifest=JSON.parse(await readFile('dist/interactive/fixture-pair/v1/bundle.json','utf8'));
  let pairBytes;
  if(mutation==='path')manifest.files[0].file='../pair.json';
  else{
   const pair=JSON.parse(await readFile('dist/interactive/fixture-pair/v1/pair.json','utf8'));
   if(mutation==='asset')pair.assets[0].sha256='0'.repeat(64);else pair.scenes[0].activity.kind='execute';
   pairBytes=Buffer.from(JSON.stringify(pair));const {createHash}=await import('node:crypto');Object.assign(manifest.files[0],{bytes:pairBytes.length,sha256:createHash('sha256').update(pairBytes).digest('hex')});
   await page.route('**/v1/pair.json',route=>route.fulfill({body:pairBytes,contentType:'application/json'}));
  }
  const bytes=Buffer.from(JSON.stringify(manifest));const {createHash}=await import('node:crypto');const bad={...v1,manifestBytes:bytes.length,manifestSha256:createHash('sha256').update(bytes).digest('hex'),totalBytes:bytes.length+manifest.files.reduce((n,f)=>n+f.bytes,0)};
  await page.route('**/v1/bundle.json',route=>route.fulfill({body:bytes,contentType:'application/json'}));
  await expect(install(page,bad)).rejects.toThrow();expect((await status(page,bad)).status).toBe('error');
  await page.unroute('**/v1/bundle.json');await page.unroute('**/v1/pair.json');
 }
});

test('application base scopes storage and resolves summary URLs relative to catalog',async({page})=>{
 await page.route('**/nested/app/interactive/**',async route=>{const path=new URL(route.request().url()).pathname.replace('/nested/app/','');await route.fulfill({body:await readFile(`dist/${path}`),contentType:path.endsWith('.svg')?'image/svg+xml':'application/json'});});
 await page.evaluate(()=>{window.rootStore=window.store;window.store=window.createBundleStore({baseUrl:location.origin+'/nested/app/'});});
 await install(page);expect((await status(page)).status).toBe('ready');
 expect(await page.evaluate(s=>window.rootStore.status(s),v1)).toMatchObject({status:'not-downloaded'});
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');b.dispose();return b.pair.version;})).toBe('v1');
});

test('production precache retains every legacy book and excludes versioned interactive assets',async()=>{
 const sw=await readFile('dist/sw.js','utf8');
 const books=await readdir('public/books',{withFileTypes:true});const dirs=books.filter(d=>d.isDirectory());expect(dirs).toHaveLength(13);
 for(const dir of dirs)for(const file of await readdir(`public/books/${dir.name}`))expect(sw).toContain(`books/${dir.name}/${file}`);
 expect(sw).toContain('interactive/catalog.json');
 expect(sw).toContain('interactive/covers/fixture-pair--v1.svg');
 expect(sw).not.toMatch(/interactive\/fixture-pair\/v[12]\//);
});

test('production service worker caches all legacy assets while pair art installs on demand',async({page,context})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});await page.reload();
 await page.waitForFunction(()=>navigator.serviceWorker.controller);
 const legacy=[];for(const dir of await readdir('public/books',{withFileTypes:true}))if(dir.isDirectory())for(const file of await readdir(`public/books/${dir.name}`))legacy.push(`/books/${dir.name}/${file}`);
 expect(await page.evaluate(async files=>{const missing=[];for(const file of files)if(!await caches.match(new URL(file,location.origin),{ignoreSearch:true}))missing.push(file);return missing;},legacy)).toEqual([]);
 expect(await page.evaluate(()=>caches.match(new URL('/interactive/fixture-pair/v1/drawing.svg',location.origin)).then(Boolean))).toBe(false);
 await page.evaluate(async()=>{const {createBundleStore}=await import('/__bundle-tests.js');window.store=createBundleStore();});
 await install(page);await context.setOffline(true);
 expect(await page.evaluate(async()=>{const b=await window.store.open('fixture-pair','v1');const image=new Image();image.src=b.resolveAsset('drawing.svg');await image.decode();b.dispose();return image.naturalWidth;})).toBe(32);
 expect(await page.evaluate(async()=>{const r=await fetch('/books/catalog.json');return (await r.json()).length;})).toBe(13);
});
