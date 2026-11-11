import {validatePair,pairSlug,PAIR_BUDGET} from './schema.js';

const active=new Map(),failures=new Map(),fallbackLocks=new Map();
const hashPattern=/^[a-f0-9]{64}$/;
const filePattern=/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(json|svg|png|webp|jpg|jpeg)$/;
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const failure=(code,message)=>Object.assign(new Error(message),{code});
const clone=value=>JSON.parse(JSON.stringify(value));
const sameSummary=(a,b)=>['id','version','title','category','credit','manifestSha256','manifestBytes','totalBytes'].every(key=>a[key]===b[key]);
const abort=signal=>{if(signal?.aborted)throw signal.reason??new DOMException('Download cancelled','AbortError');};
const errorInfo=error=>({name:error.name??'Error',message:error.message??String(error),code:error.code??'download-failed'});

// A shared reader lock lasts until dispose; the exclusive deletion lock also
// coordinates different store instances and tabs. Fallback coordinates realms
// without Web Locks locally, while unique staging caches still prevent writers
// from deleting one another's data.
function lock(name,mode='exclusive'){
 if(globalThis.navigator?.locks)return new Promise((resolve,reject)=>{
  navigator.locks.request(name,{mode},()=>new Promise(release=>resolve(release))).catch(reject);
 });
 return new Promise(resolve=>{
  let state=fallbackLocks.get(name);if(!state){state={readers:0,writer:false,queue:[]};fallbackLocks.set(name,state);}
  const drain=()=>{
   if(state.writer)return;
   while(state.queue.length){
    const next=state.queue[0];if(next.mode==='exclusive'&&state.readers)return;
    state.queue.shift();if(next.mode==='shared')state.readers++;else state.writer=true;
    let released=false;next.resolve(()=>{if(released)return;released=true;if(next.mode==='shared')state.readers--;else state.writer=false;drain();});
    if(state.writer)return;
   }
  };
  state.queue.push({mode,resolve});drain();
 });
}
async function locked(name,work){const release=await lock(name);try{return await work();}finally{release();}}
function database(name){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(name,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('records');
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
 });
}
function transaction(db,mode,work,signal){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('records',mode),records=tx.objectStore('records');let result;
  const cancel=()=>{try{tx.abort();}catch{/* A completed transaction cannot be aborted. */}};
  const finish=()=>signal?.removeEventListener('abort',cancel);
  tx.oncomplete=()=>{finish();resolve(result);};tx.onabort=()=>{finish();reject(signal?.aborted?(signal.reason??new DOMException('Download cancelled','AbortError')):tx.error??new Error('Bundle metadata transaction aborted'));};tx.onerror=()=>{};
  signal?.addEventListener('abort',cancel,{once:true});
  try{abort(signal);result=work(records);}catch(error){cancel();finish();reject(error);}
 });
}
async function read(db,key){let value;await transaction(db,'readonly',records=>{const request=records.get(key);request.onsuccess=()=>{value=request.result;};});return value;}
async function verify(bytes,record){
 assert(bytes.byteLength===record.bytes,`Bundle bytes mismatch: ${record.file??'bundle.json'}`);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
 assert(hash===record.sha256,`Bundle hash mismatch: ${record.file??'bundle.json'}`);
}
function parse(bytes){return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
function manifestData(bytes,summary){
 const manifest=parse(bytes);
 assert(manifest&&Object.keys(manifest).sort().join()===['schemaVersion','id','version','pairFile','files'].sort().join(),'Invalid bundle manifest fields');
 assert(manifest.schemaVersion===1&&manifest.id===summary.id&&manifest.version===summary.version&&manifest.pairFile==='pair.json','Bundle identity mismatch');
 assert(Array.isArray(manifest.files)&&manifest.files.length>=4&&manifest.files.length<=243,'Invalid bundle files');
 const names=new Set();let total=bytes.byteLength;
 for(const file of manifest.files){
  assert(file&&Object.keys(file).sort().join()===['file','sha256','bytes','mediaType'].sort().join(),'Invalid bundle file fields');
  assert(typeof file.file==='string'&&filePattern.test(file.file)&&!names.has(file.file)&&file.file!=='bundle.json','Unsafe or duplicate bundle filename');names.add(file.file);
  assert(hashPattern.test(file.sha256)&&Number.isSafeInteger(file.bytes)&&file.bytes>0&&file.bytes<=PAIR_BUDGET,'Invalid bundle file integrity');
  const ext=file.file.split('.').at(-1),mime={json:'application/json',svg:'image/svg+xml',png:'image/png',webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg'}[ext];
  assert(file.mediaType===mime,'Invalid bundle media type');total+=file.bytes;
 }
 assert(['pair.json','source.json','visual-review.json'].every(file=>names.has(file)),'Missing bundle metadata');
 assert(total===summary.totalBytes&&total<=PAIR_BUDGET,'Invalid bundle total bytes');
 return manifest;
}
function pairData(bytes,manifest,summary){
 const pair=validatePair(parse(bytes));
 assert(pair.id===summary.id&&pair.version===summary.version&&pair.title===summary.title&&pair.category===summary.category&&pair.credit===summary.credit,'Pair summary mismatch');
 assert(manifest.files.length===pair.assets.length+3,'Unexpected bundle files');
 for(const asset of pair.assets){const file=manifest.files.find(f=>f.file===asset.file);assert(file&&['sha256','bytes','mediaType'].every(k=>file[k]===asset[k]),'Pair asset manifest mismatch');}
 return pair;
}

export function createBundleStore({baseUrl}={}){
 const base=new URL(baseUrl??import.meta.env?.BASE_URL??'./',document.baseURI);
 if(!base.pathname.endsWith('/'))base.pathname+='/';base.search='';base.hash='';
 const scope=base.href,catalogUrl=new URL('interactive/catalog.json',base),prefix=`interactive-bundles:${scope}:`;
 let dbPromise;const db=()=>dbPromise??=database(`interactive-bundles:${scope}`);
 const idKey=id=>`${scope}:${id}`,versionKey=(id,version)=>`version:${id}:${version}`;
 const mutation=id=>`${prefix}mutation:${id}`,reader=(id,version)=>`${prefix}reader:${id}:${version}`;
 const identity=(id,version)=>assert(pairSlug.test(id)&&id!=='covers'&&pairSlug.test(version),'Invalid pair identity');
 function summaryData(value){
  const summary=clone(value);identity(summary.id,summary.version);
  assert(hashPattern.test(summary.manifestSha256)&&Number.isSafeInteger(summary.manifestBytes)&&summary.manifestBytes>0&&Number.isSafeInteger(summary.totalBytes)&&summary.totalBytes>summary.manifestBytes&&summary.totalBytes<=PAIR_BUDGET,'Invalid bundle summary integrity');
  const url=new URL(summary.manifestUrl,catalogUrl),expected=new URL(`./${summary.id}/${summary.version}/bundle.json`,catalogUrl);
  assert(url.href===expected.href,'Invalid bundle manifest URL');
  return {summary,manifestUrl:url.href};
 }
 async function rememberError(id,version,error){
  const info={version,error:errorInfo(error)};
  try{await transaction(await db(),'readwrite',r=>r.put(info,`error:${id}`));failures.delete(idKey(id));}catch{failures.set(idKey(id),info);/* Retain retry state if the error itself cannot be persisted. */}
 }
 async function cached(record){
  assert(await caches.has(record.cacheName),'Bundle cache evicted');const cache=await caches.open(record.cacheName);
  const load=async(url,meta)=>{const response=await cache.match(url);assert(response,'Bundle file evicted');const bytes=await response.arrayBuffer();await verify(bytes,meta);return bytes;};
  const manifestBytes=await load(record.manifestUrl,{bytes:record.summary.manifestBytes,sha256:record.summary.manifestSha256});
  const manifest=manifestData(manifestBytes,record.summary),files=new Map();
  for(const file of manifest.files)files.set(file.file,await load(new URL(file.file,record.manifestUrl).href,file));
  return {pair:pairData(files.get('pair.json'),manifest,record.summary),manifest,files};
 }
 async function invalidate(id,version,error){
  await transaction(await db(),'readwrite',r=>{r.delete(versionKey(id,version));const request=r.get(`current:${id}`);request.onsuccess=()=>{if(request.result===version)r.delete(`current:${id}`);};});
  await rememberError(id,version,failure('evicted',error.message));
 }
 function deleteWhenUnused(id,version,cacheName){
  // Never hold the mutation lock while waiting for a reader to leave.
  void locked(reader(id,version),()=>caches.delete(cacheName)).catch(()=>{});
 }
 async function status(value){
  const {summary}=summaryData(value),pending=active.get(idKey(summary.id));
  if(pending)return {...pending};
  return locked(mutation(summary.id),async()=>{
   const storage=await db(),installedVersion=await read(storage,`current:${summary.id}`);
   let record=installedVersion&&await read(storage,versionKey(summary.id,installedVersion));
   if(record)try{await cached(record);}catch(error){await invalidate(summary.id,installedVersion,error);deleteWhenUnused(summary.id,installedVersion,record.cacheName);record=null;}
   const problem=failures.get(idKey(summary.id))??await read(storage,`error:${summary.id}`);
   const result={status:record?(installedVersion===summary.version?'ready':'update-available'):'not-downloaded',installedVersion:record?installedVersion:null,usable:!!record,verifiedBytes:record?record.summary.totalBytes:0,totalBytes:summary.totalBytes};
   if(record&&installedVersion===summary.version&&!sameSummary(record.summary,summary))return {...result,status:'error',error:{name:'Error',code:'summary-mismatch',message:'Catalog metadata disagrees with the installed immutable version'}};
   if(problem?.version===summary.version)return {...result,status:'error',error:problem.error};
   return result;
  });
 }
 async function install(value,{onProgress,signal}={}){
  const {summary,manifestUrl}=summaryData(value);
  return locked(mutation(summary.id),async()=>{
   const storage=await db();let staging,published=false;
   const progress={status:'downloading',installedVersion:null,usable:false,verifiedBytes:0,totalBytes:summary.totalBytes};
   const notify=()=>{active.set(idKey(summary.id),{...progress});onProgress?.({...progress});abort(signal);};
   try{
    abort(signal);
    const existing=await read(storage,versionKey(summary.id,summary.version));
    assert(!existing||sameSummary(existing.summary,summary),'Installed bundle version is immutable; publish a new version');
    if(existing&&existing.summary.manifestSha256===summary.manifestSha256){
     try{await cached(existing);abort(signal);await transaction(storage,'readwrite',r=>{r.put(summary.version,`current:${summary.id}`);r.delete(`error:${summary.id}`);},signal);failures.delete(idKey(summary.id));return {status:'ready',installedVersion:summary.version,usable:true,verifiedBytes:summary.totalBytes,totalBytes:summary.totalBytes};}catch(error){if(signal?.aborted||error.name==='AbortError')throw error;/* Re-download an evicted/corrupt version. */}
    }
    const currentVersion=await read(storage,`current:${summary.id}`);
    progress.installedVersion=currentVersion??null;progress.usable=!!currentVersion;
    notify();staging=`${prefix}${summary.id}:${summary.version}:${crypto.randomUUID()}`;
    const cache=await caches.open(staging);
    const download=async(url,meta)=>{
     abort(signal);const response=await fetch(url,{signal,cache:'no-store',redirect:'error'});assert(response.ok,`Bundle request failed (${response.status})`);
     const bytes=await response.arrayBuffer();abort(signal);await verify(bytes,meta);abort(signal);
     await cache.put(url,new Response(bytes,{headers:{'Content-Type':meta.mediaType??'application/json'}}));progress.verifiedBytes+=bytes.byteLength;notify();return bytes;
    };
    const manifestBytes=await download(manifestUrl,{bytes:summary.manifestBytes,sha256:summary.manifestSha256}),manifest=manifestData(manifestBytes,summary);let pairBytes;
    for(const file of manifest.files){const bytes=await download(new URL(file.file,manifestUrl).href,file);if(file.file==='pair.json')pairBytes=bytes;}
    pairData(pairBytes,manifest,summary);abort(signal);
    const record={summary,manifestUrl,cacheName:staging};
    // This is the only publication point. Failed cache writes or validation have
    // never touched the previous usable pointer or its cache.
    await transaction(storage,'readwrite',r=>{r.put(record,versionKey(summary.id,summary.version));r.put(summary.version,`current:${summary.id}`);r.delete(`error:${summary.id}`);},signal);published=true;
    if(existing&&existing.cacheName!==staging)deleteWhenUnused(summary.id,summary.version,existing.cacheName);
    failures.delete(idKey(summary.id));return {status:'ready',installedVersion:summary.version,usable:true,verifiedBytes:summary.totalBytes,totalBytes:summary.totalBytes};
   }catch(error){await rememberError(summary.id,summary.version,error);throw error;}
   finally{active.delete(idKey(summary.id));if(staging&&!published)await caches.delete(staging);}
  });
 }
 async function open(id,version){
  if(version===undefined)version=await read(await db(),`current:${id}`);
  if(!version)throw failure('not-downloaded','Download this story before opening it');identity(id,version);
  const release=await lock(reader(id,version),'shared');let urls;
  try{
   const data=await locked(mutation(id),async()=>{
    const record=await read(await db(),versionKey(id,version));if(!record)throw failure('not-downloaded','Download this story before opening it');
    try{return await cached(record);}catch(error){await invalidate(id,version,error);deleteWhenUnused(id,version,record.cacheName);throw failure('evicted','Story storage was cleared or changed. Download it again.');}
   });
   urls=new Map(data.pair.assets.map(asset=>[asset.file,URL.createObjectURL(new Blob([data.files.get(asset.file)],{type:asset.mediaType}))]));let disposed=false;
   return {pair:data.pair,resolveAsset(file){if(disposed)throw new Error('Story bundle disposed');assert(urls.has(file),'Unknown story asset');return urls.get(file);},dispose(){if(disposed)return;disposed=true;for(const url of urls.values())URL.revokeObjectURL(url);release();}};
  }catch(error){if(urls)for(const url of urls.values())URL.revokeObjectURL(url);release();throw error;}
 }
 async function remove(id,version){
  identity(id,version);
  await locked(mutation(id),async()=>{
   const storage=await db(),record=await read(storage,versionKey(id,version));
   await transaction(storage,'readwrite',r=>{r.delete(versionKey(id,version));r.delete(`error:${id}`);const request=r.get(`current:${id}`);request.onsuccess=()=>{if(request.result===version)r.delete(`current:${id}`);};});
   failures.delete(idKey(id));if(record)deleteWhenUnused(id,version,record.cacheName);
  });
 }
 return {status,install,open,remove};
}
