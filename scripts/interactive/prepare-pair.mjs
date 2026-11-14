import {lstat,mkdir,mkdtemp,writeFile,rename,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {validatePair,pairAssets,PAIR_BUDGET} from '../../src/interactive/schema.js';
import {localFile,checkSvg,decodeImages} from '../package-safety.mjs';
const requireValue=(ok,message)=>{if(!ok)throw new Error(message);};
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
export const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export function bundleManifest(pair,files){
 return {schemaVersion:1,id:pair.id,version:pair.version,pairFile:'pair.json',files:[...files].map(([file,buffer])=>({file,sha256:digest(buffer),bytes:buffer.length,mediaType:pair.assets.find(a=>a.file===file)?.mediaType??'application/json'}))};
}
export async function checkPair(folder){
 const root=resolve(folder),rootStat=await lstat(root);requireValue(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'Package folder must be a directory, not a symlink');
 const files=new Map();
 for(const file of ['pair.json','source.json','visual-review.json'])files.set(file,await localFile(root,file));
 const parse=file=>{try{return JSON.parse(files.get(file).toString('utf8'));}catch{throw new Error(`Invalid JSON: ${file}`);}};
 const pair=validatePair(parse('pair.json')),source=parse('source.json'),review=parse('visual-review.json');
 requireValue(source&&source.title===pair.title&&nonempty(source.license)&&Array.isArray(source.creators)&&source.creators.length>0&&source.creators.every(nonempty)&&nonempty(source.changes),'Missing or mismatched source provenance');
 requireValue(source.reviewed===true,'Source provenance and license must be reviewed');
 requireValue(['original','adaptation'].includes(source.kind),'Invalid source provenance kind');
 if(source.kind==='adaptation')requireValue(https(source.url)&&https(source.licenseUrl),'Adaptation source URL and license URL must be HTTPS');
 else if(source.url!==undefined)requireValue(https(source.url),'Invalid original source URL');
 requireValue(review?.reviewed===true,'Artwork and guidance must be visually reviewed');
 requireValue(Array.isArray(review.assets)&&review.assets.length===pair.assets.length&&new Set(review.assets.map(a=>a.assetId)).size===pair.assets.length,'Visual review must cover every asset');
 for(const asset of pair.assets)requireValue(review.assets.some(a=>a.assetId===asset.id&&a.reviewed===true),`Asset must be visually reviewed: ${asset.id}`);
 requireValue(Array.isArray(review.scenes)&&review.scenes.length===pair.scenes.length&&new Set(review.scenes.map(s=>s.sceneId)).size===pair.scenes.length,'Visual review must cover every scene');
 for(const scene of pair.scenes)requireValue(review.scenes.some(s=>s.sceneId===scene.id&&['rest','motion','outcomes','guidance'].every(key=>s[key]===true)),`Scene rest, motion, outcomes and guidance must be reviewed: ${scene.id}`);
 for(const asset of pair.assets){
  const buffer=await localFile(root,asset.file);
  requireValue(buffer.length===asset.bytes,`Asset bytes mismatch: ${asset.file}`);requireValue(digest(buffer)===asset.sha256,`Asset hash mismatch: ${asset.file}`);
  if(asset.mediaType==='image/svg+xml')checkSvg(buffer,asset.file);
  else {
   const mime=asset.mediaType;const valid=mime==='image/png'?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/webp'?buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP':buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
   requireValue(valid,`Invalid raster image: ${asset.file}`);
  }
  files.set(asset.file,buffer);
 }
 const manifest=bundleManifest(pair,files),manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 requireValue([...files.values()].reduce((n,b)=>n+b.length,manifestBytes.length)<=PAIR_BUDGET,'Pair package exceeds 15 MiB');
 await decodeImages(files,pairAssets(pair));
 return {pair,source,review,files,manifest,manifestBytes};
}
export async function installPair(folder,interactiveRoot='public/interactive'){
 // Install precisely the validated bytes, never re-read mutable authoring files.
 const checked=await checkPair(folder),root=resolve(interactiveRoot);await mkdir(root,{recursive:true});
 const rootStat=await lstat(root);requireValue(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'Interactive root must be a directory, not a symlink');
 const pairRoot=join(root,checked.pair.id);await mkdir(pairRoot,{recursive:true});
 const stat=await lstat(pairRoot);requireValue(stat.isDirectory()&&!stat.isSymbolicLink(),'Pair destination must be a directory, not a symlink');
 const destination=join(pairRoot,checked.pair.version),lock=join(pairRoot,`.${checked.pair.version}.import-lock`);let staging;
 await mkdir(lock).catch(error=>{if(error.code==='EEXIST')throw new Error('Another import for this version is in progress');throw error;});
 try{
  try{await lstat(destination);throw new Error(`Immutable pair version already exists: ${checked.pair.id}/${checked.pair.version}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  staging=await mkdtemp(join(pairRoot,'.pair-import-'));
  for(const [file,buffer]of [...checked.files,['bundle.json',checked.manifestBytes]])await writeFile(join(staging,file),buffer,{flag:'wx'});
  await rename(staging,destination);staging=undefined;return destination;
 }finally{if(staging)await rm(staging,{recursive:true,force:true});await rm(lock,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [command,folder]=process.argv.slice(2);
 try{
  requireValue(['check','install'].includes(command)&&folder&&process.argv.length===4,'Usage: node scripts/interactive/prepare-pair.mjs <check|install> <authoring-folder>');
  if(command==='check'){const {pair,files}=await checkPair(folder);console.log(`Validated ${pair.title}: ${pair.scenes.length} scenes, ${files.size} local files.`);}
  else console.log(`Installed ${await installPair(folder)}.`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
