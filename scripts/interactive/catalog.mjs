import {readdir,mkdir,writeFile,rename,lstat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {pairSlug} from '../../src/interactive/schema.js';
import {checkPair,digest} from './prepare-pair.mjs';
import {localFile} from '../package-safety.mjs';

async function lightweightCover(pair,files){
 const asset=pair.assets.find(a=>a.file===pair.cover),bytes=files.get(pair.cover);
 if(bytes.length<=64*1024)return {bytes,extension:pair.cover.split('.').pop().toLowerCase()};
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined);
 const browser=await chromium.launch({executablePath,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.route('http**/*',route=>route.abort());
  const data=await page.evaluate(async src=>{
   const image=new Image();image.src=src;await image.decode();const scale=Math.min(1,320/image.naturalWidth,320/image.naturalHeight);
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.8).split(',')[1];
  },`data:${asset.mediaType};base64,${bytes.toString('base64')}`);
  const result=Buffer.from(data,'base64');if(result.length>64*1024)throw new Error('Catalog cover exceeds 64 KiB');return {bytes:result,extension:'webp'};
 }finally{await browser.close();}
}
export async function buildInteractiveCatalog(interactiveRoot='public/interactive'){
 const root=resolve(interactiveRoot);let entries;
 try{entries=await readdir(root,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return [];throw error;}
 const summaries=[];
 for(const dir of entries.sort((a,b)=>a.name.localeCompare(b.name))){
  if(dir.name.startsWith('.')||dir.name==='covers'||dir.name==='catalog.json')continue;
  if(!dir.isDirectory()||dir.isSymbolicLink()||!pairSlug.test(dir.name))throw new Error(`Invalid interactive pair folder: ${dir.name}`);
  const pairRoot=join(root,dir.name),versions=(await readdir(pairRoot,{withFileTypes:true})).filter(v=>!v.name.startsWith('.'));
  for(const version of versions)if(!version.isDirectory()||version.isSymbolicLink()||!pairSlug.test(version.name))throw new Error(`Invalid pair version folder: ${version.name}`);
  versions.sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));const latest=versions.at(-1);if(!latest)continue;
  const folder=join(pairRoot,latest.name),checked=await checkPair(folder),{pair,files}=checked;
  if(pair.id!==dir.name||pair.version!==latest.name)throw new Error('Pair ID/version must match installed folder');
  const manifestBytes=await localFile(folder,'bundle.json');
  if(!manifestBytes.equals(checked.manifestBytes))throw new Error(`Bundle manifest mismatch: ${pair.id}/${pair.version}`);
  const cover=await lightweightCover(pair,files),covers=join(root,'covers');await mkdir(covers,{recursive:true});
  const coverStat=await lstat(covers);if(!coverStat.isDirectory()||coverStat.isSymbolicLink())throw new Error('Catalog covers must be a regular directory');
  const coverName=`${pair.id}--${pair.version}.${cover.extension}`,temp=join(covers,`.${coverName}.${process.pid}.tmp`);
  await writeFile(temp,cover.bytes);await rename(temp,join(covers,coverName));
  summaries.push({id:pair.id,version:pair.version,title:pair.title,category:pair.category,credit:pair.credit,cover:`./covers/${coverName}`,manifestUrl:`./${pair.id}/${pair.version}/bundle.json`,manifestSha256:digest(manifestBytes),manifestBytes:manifestBytes.length,totalBytes:manifestBytes.length+[...files.values()].reduce((n,b)=>n+b.length,0)});
 }
 return summaries;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const root=resolve('public/interactive'),summaries=await buildInteractiveCatalog(root);await mkdir(root,{recursive:true});await writeFile(join(root,'catalog.json'),JSON.stringify(summaries,null,2)+'\n');console.log(`Validated ${summaries.length} interactive pairs; wrote public/interactive/catalog.json`);
}
