// Shared restrictive local-image checks for legacy books and interactive pairs.
import {lstat,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {existsSync} from 'node:fs';
import {chromium} from '@playwright/test';
const requireValue=(ok,message)=>{if(!ok)throw new Error(message);};
const tags=new Set('svg g path rect circle ellipse line polygon polyline text tspan defs clipPath mask linearGradient radialGradient stop use pattern title desc'.split(' '));
const attributes=new Set('xmlns xmlns:xlink version viewBox width height x y x1 x2 y1 y2 cx cy r rx ry d points fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset stroke-miterlimit opacity transform id clip-path clip-rule mask maskUnits maskContentUnits clipPathUnits preserveAspectRatio gradientUnits gradientTransform spreadMethod offset stop-color stop-opacity fx fy fr href xlink:href font-family font-size font-weight font-style text-anchor dominant-baseline letter-spacing dx dy patternUnits patternContentUnits patternTransform role aria-label'.split(' '));
// Deliberately small SVG authoring dialect. Disallow active/foreign content and
// external references rather than attempting to sanitize arbitrary SVG files.
export function checkSvg(buffer,file){
 const bad=()=>{throw new Error(`Unsafe or unsupported SVG: ${file}`);};
 let text=buffer.toString('utf8').replace(/^\uFEFF/,'').replace(/^\s*<\?xml\s[^?]*\?>/,'').replace(/<!--[\s\S]*?-->/g,'');
 if(/<!|<\?|&#/.test(text))bad();
 const stack=[];let cursor=0,roots=0;
 const token=/<([^<>]*)>/g;let match;
 while((match=token.exec(text))){
  const between=text.slice(cursor,match.index);if(/[<>]/.test(between)||(!stack.length&&between.trim()))bad();cursor=token.lastIndex;
  const tag=match[1];const closing=tag.startsWith('/');const selfClosing=tag.endsWith('/');
  const name=/^\/?([A-Za-z][\w:-]*)/.exec(tag)?.[1];if(!tags.has(name))bad();
  if(closing){if(tag!==`/${name}`||stack.pop()!==name)bad();continue;}
  if(!stack.length){if(name!=='svg'||++roots!==1)bad();}
  const rest=tag.slice(name.length,selfClosing?-1:undefined);let at=0;const seen=new Set();
  const attr=/\s+([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/gy;let a;
  while((a=attr.exec(rest))){
   at=attr.lastIndex;const key=a[1],value=a[2]??a[3];
   if(!attributes.has(key)||seen.has(key)||/[<>\\]/.test(value))bad();seen.add(key);
   if(key==='xmlns'){if(value!=='http://www.w3.org/2000/svg')bad();}
   else if(key==='xmlns:xlink'){if(value!=='http://www.w3.org/1999/xlink')bad();}
   else if(key==='href'||key==='xlink:href'){if(!/^#[a-zA-Z][\w.-]*$/.test(value))bad();}
   else if(/url\s*\(/i.test(value)){if(!/^url\(#[a-zA-Z][\w.-]*\)$/.test(value))bad();}
   else if(/(?:https?:|data:|javascript:|file:|&[^;]+;)/i.test(value)&&!['aria-label','font-family'].includes(key))bad();
  }
  if(rest.slice(at).trim())bad();if(!selfClosing)stack.push(name);
 }
 if(stack.length||roots!==1||text.slice(cursor).trim())bad();
}
export async function localFile(root,file){
 const path=join(root,file);let stat;
 try{stat=await lstat(path);}catch{throw new Error(`Missing package file: ${file}`);}
 requireValue(stat.isFile()&&!stat.isSymbolicLink(),`Package asset must be a regular file, not a symlink: ${file}`);
 requireValue(stat.size<=5*1024*1024,`Package file exceeds 5 MiB: ${file}`);
 return readFile(path);
}
export async function decodeImages(files, assets) {
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined);
 const browser=await chromium.launch({executablePath,args:['--no-sandbox']}).catch(error=>{throw new Error(`Image validation needs Chrome or Playwright Chromium (npx playwright install chromium): ${error.message}`);});
 try {
  const page=await browser.newPage();
  await page.route('http**/*',route=>route.abort());
  for(const file of assets){
   const extension=file.split('.').pop().toLowerCase();
   const mime=extension==='svg'?'image/svg+xml':extension==='jpg'||extension==='jpeg'?'image/jpeg':`image/${extension}`;
   const result=await page.evaluate(async src=>{
    const image=new Image();image.src=src;
    try{await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),5000))]);return image.naturalWidth>0&&image.naturalHeight>0&&image.naturalWidth<=8192&&image.naturalHeight<=8192;}catch{return false;}
   },`data:${mime};base64,${files.get(file).toString('base64')}`);
   requireValue(result,`Cannot decode image or dimensions exceed 8192: ${file}`);
  }
 } finally {await browser.close();}
}
