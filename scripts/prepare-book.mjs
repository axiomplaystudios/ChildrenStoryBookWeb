// Local, assisted authoring packages. This validates finished artwork; it does
// not fetch URLs, execute generators or pretend to infer animation from a PDF.
import {lstat,readFile,mkdir,mkdtemp,writeFile,rename,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateStory} from '../src/story.js';
import {storyAssets} from '../src/scene-schema.js';
import {checkSvg,localFile,decodeImages} from './package-safety.mjs';
const requireValue=(ok,message)=>{if(!ok)throw new Error(message);};
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export async function checkPackage(folder){
 const root=resolve(folder),files=new Map();
 for(const file of ['story.json','source.json','animation-plan.json'])files.set(file,await localFile(root,file));
 const parse=file=>{try{return JSON.parse(files.get(file).toString('utf8'));}catch{throw new Error(`Invalid JSON: ${file}`);}};
 const story=validateStory(parse('story.json')),source=parse('source.json'),plan=parse('animation-plan.json');
 requireValue(typeof story.id==='string'&&slug.test(story.id),'Invalid book ID');
 requireValue(source&&nonempty(source.title)&&nonempty(source.license)&&Array.isArray(source.creators)&&source.creators.length>0&&source.creators.every(nonempty)&&nonempty(source.changes),'Missing source provenance: title, license, creators or changes');
 requireValue(source.reviewed===true,'Source license and extraction must be reviewed');
 requireValue(source.title===story.title,'Source title must match story title');
 if(story.origin==='original'){
  requireValue(source.kind==='original','Original story needs explicit original provenance');
  requireValue(!source.url&&!story.sourceUrl||source.url===story.sourceUrl,'Original source URL must match when supplied');
 }else{
  requireValue(source.kind!=='original','Original provenance requires story origin original');
  requireValue(nonempty(story.sourceUrl)&&source.url===story.sourceUrl&&new URL(source.url).protocol==='https:','Source URL must match story sourceUrl');
  requireValue(nonempty(story.licenseUrl),'Missing source licenseUrl');
 }
 requireValue(Array.isArray(plan?.pages)&&plan.pages.length===story.pages.length,'Animation plan must cover every page');
 for(const [i,page]of story.pages.entries()){
  requireValue(page.scene,`Page ${i+1} needs an animation scene`);
  for(const track of page.scene.tracks){
   requireValue(track.playback==='repeat',`Page ${i+1} ${track.layer} must repeat: every authored motion must loop`);
   requireValue(track.restMs<=1800,`Page ${i+1} ${track.layer} rest must be at most 1800 ms`);
  }
  const item=plan.pages[i];requireValue(item?.page===i+1&&nonempty(item.action),`Animation plan page ${i+1} needs an action in page order`);
  requireValue(item.reviewed===true,`Animation plan page ${i+1} must be visually reviewed`);
 }
 for(const file of storyAssets(story)){
  const buffer=await localFile(root,file);if(file.toLowerCase().endsWith('.svg'))checkSvg(buffer,file);
  else{
   const lower=file.toLowerCase();const ok=lower.endsWith('.png')?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):lower.endsWith('.webp')?buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP':buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
   requireValue(ok,`Invalid raster asset: ${file}`);
  }
  files.set(file,buffer);
 }
 requireValue([...files.values()].reduce((total,b)=>total+b.length,0)<=32*1024*1024,'Book package exceeds 32 MiB');
 await decodeImages(files,storyAssets(story));
 return {story,source,plan,files};
}
export async function installBook(folder,booksRoot='public/books'){
 // Keep the validated bytes: files changing during an import cannot bypass checks.
 const checked=await checkPackage(folder),root=resolve(booksRoot),destination=join(root,checked.story.id);
 await mkdir(root,{recursive:true});
 const lock=join(root,`.${checked.story.id}.import-lock`);let staging;
 await mkdir(lock).catch(error=>{if(error.code==='EEXIST')throw new Error('Another import for this book is in progress');throw error;});
 try{
  try{await lstat(destination);throw new Error(`Book already exists: ${checked.story.id}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  staging=await mkdtemp(join(root,'.book-import-'));
  for(const [file,buffer]of checked.files)await writeFile(join(staging,file),buffer,{flag:'wx'});
  await rename(staging,destination);staging=undefined;return destination;
 }finally{if(staging)await rm(staging,{recursive:true,force:true});await rm(lock,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [command,folder]=process.argv.slice(2);
 try{
  requireValue(['check','install'].includes(command)&&folder&&process.argv.length===4,'Usage: node scripts/prepare-book.mjs <check|install> <authoring-folder>');
  if(command==='check'){const {story,files}=await checkPackage(folder);console.log(`Validated ${story.title}: ${story.pages.length} animated pages, ${files.size} local files.`);}
  else console.log(`Installed ${await installBook(folder)}. Run npm run build (or restart npm run dev) to refresh the bookshelf.`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
