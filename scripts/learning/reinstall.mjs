import {mkdir,mkdtemp,writeFile,rename,rm,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkPackage} from '../prepare-book.mjs';
export async function reinstall(id,{sourceRoot='authoring',booksRoot='public/books'}={}){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw Error('Invalid book ID');
 const checked=await checkPackage(join(sourceRoot,id));if(checked.story.id!==id)throw Error('Book ID mismatch');
 const root=resolve(booksRoot);await mkdir(root,{recursive:true});const lock=join(root,`.${id}.import-lock`);await mkdir(lock);
 let staging,backup,moved=false;
 try{const destination=join(root,id);const stat=await lstat(destination);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Destination must be a regular book directory');
 staging=await mkdtemp(join(root,'.book-replace-'));for(const [file,buffer]of checked.files)await writeFile(join(staging,file),buffer,{flag:'wx'});
 backup=join(lock,'previous');await rename(destination,backup);moved=true;
 try{await rename(staging,destination);staging=undefined;}catch(error){await rename(backup,destination);moved=false;throw error;}
 await rm(backup,{recursive:true});moved=false;console.log(`Reinstalled ${id}`);
 }finally{if(staging)await rm(staging,{recursive:true,force:true});if(!moved)await rm(lock,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){if(process.argv.length<3)throw Error('Usage: node scripts/learning/reinstall.mjs <book-id>...');for(const id of process.argv.slice(2))await reinstall(id);}
