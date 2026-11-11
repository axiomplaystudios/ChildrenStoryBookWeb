// Authoring-time checks only. A successful decode cannot review spoken quality
// or establish redistribution rights; those are explicit author attestations.
import {readFile, lstat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const requireValue=(ok,message)=>{if(!ok)throw new Error(message);};
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const localAudioPath=file=>typeof file==='string'&&file.split('/').every(segment=>/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment))&&/\.(?:wav|mp3|ogg|m4a|webm)$/i.test(file);

async function readAudio(root,file){
 let path=root;const segments=file.split('/');
 for(const [index,segment]of segments.entries()){
  path=join(path,segment);
  const stat=await lstat(path).catch(error=>{
   if(error.code==='ENOENT')throw new Error(`Missing audio file: ${file}`);
   throw error;
  });
  requireValue(!stat.isSymbolicLink(),`Audio path must not contain a symlink: ${file}`);
  requireValue(index===segments.length-1?stat.isFile():stat.isDirectory(),`Audio path must lead to a regular file: ${file}`);
 }
 return readFile(path);
}

async function decodeAudio(clips){
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined);
 const browser=await chromium.launch({executablePath,args:['--no-sandbox']}).catch(error=>{
  throw new Error(`Audio validation needs Chrome or Playwright Chromium (npx playwright install chromium): ${error.message}`);
 });
 try{
  const page=await browser.newPage();
  await page.route('**/*',route=>route.abort());
  for(const clip of clips){
   const duration=await page.evaluate(async base64=>{
    const context=new AudioContext();
    try{
     const bytes=Uint8Array.from(atob(base64),character=>character.charCodeAt(0));
     const decoded=await Promise.race([
      context.decodeAudioData(bytes.buffer),
      new Promise((_,reject)=>setTimeout(()=>reject(Error('Audio decode timeout')),5000)),
     ]);
     return decoded.numberOfChannels>0&&decoded.length>0?decoded.duration:0;
    }catch{return 0;}finally{await context.close();}
   },clip.buffer.toString('base64'));
   requireValue(Number.isFinite(duration)&&duration>0,`Cannot decode audio or invalid duration: ${clip.file}`);
   clip.duration=duration;
  }
 }finally{await browser.close();}
}

export async function validateManifest(manifestPath){
 const path=resolve(manifestPath),root=dirname(path);
 const json=await readFile(path,'utf8');let entries;
 try{entries=JSON.parse(json);}catch{throw new Error(`Invalid manifest JSON: ${manifestPath}`);}
 requireValue(Array.isArray(entries)&&entries.length>0,'Audio manifest must be a non-empty array');
 const ids=new Set();
 // Check every attestation before launching the browser or reading any assets.
 for(const [index,entry]of entries.entries()){
  for(const field of ['id','text','file','voice','provider','license'])requireValue(nonempty(entry?.[field]),`Clip ${index+1}: missing or blank ${field}`);
  requireValue(entry.reviewed===true,`Clip ${entry.id}: reviewed must be true after listening to this exact clip`);
  requireValue(!ids.has(entry.id),`Duplicate audio clip id: ${entry.id}`);ids.add(entry.id);
  requireValue(localAudioPath(entry.file),`Invalid local audio path: ${entry.file}`);
 }
 const clips=[];
 for(const entry of entries){const buffer=await readAudio(root,entry.file);clips.push({...entry,buffer,bytes:buffer.length});}
 await decodeAudio(clips);
 return {
  clips:clips.map(({buffer,...clip})=>clip),
  totalBytes:clips.reduce((total,clip)=>total+clip.bytes,0),
  totalDuration:clips.reduce((total,clip)=>total+clip.duration,0),
 };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [command,manifest]=process.argv.slice(2);
 try{
  requireValue(command==='validate'&&manifest&&process.argv.length===4,'Usage: node scripts/interactive/audio.mjs validate <manifest>');
  const result=await validateManifest(manifest);
  console.log(`Validated ${result.clips.length} clip(s): ${result.totalBytes} bytes, ${result.totalDuration.toFixed(3)} s browser-decoded audio.`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
