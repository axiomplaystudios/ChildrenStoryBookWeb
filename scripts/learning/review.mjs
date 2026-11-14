import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {sampleTrack} from '../../src/scene-motion.js';
const data=async path=>'data:image/svg+xml;base64,'+(await readFile(path)).toString('base64');
export async function review(out,ids,{root='authoring'}={}){
 await mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined,args:['--no-sandbox']});
 try{const page=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1});
 for(const id of ids){const folder=join(root,id),book=JSON.parse(await readFile(join(folder,'story.json'),'utf8'));
 const cards=[{image:book.cover,text:'Cover'},...book.pages.map((p,i)=>({image:p.image,text:`${i+1}. ${p.text}`}))];
 const styles='<style>*{box-sizing:border-box}body{margin:0;background:#f4eee1;font:14px sans-serif}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px}.card{background:white;padding:8px}img,svg{width:100%;display:block}p{min-height:55px;line-height:1.4}</style>';
 await page.setContent(styles+'<div class="grid">'+(await Promise.all(cards.map(async c=>`<div class="card"><img src="${await data(join(folder,c.image))}"><p>${c.text.replaceAll('&','&amp;').replaceAll('<','&lt;')}</p></div>`))).join('')+'</div>');await page.screenshot({path:join(out,`${id}-pages.png`),fullPage:true});
 let motion='';for(const [i,p]of book.pages.entries())for(const time of [0,1150,2600]){let content=`<image href="${await data(join(folder,p.scene.background))}" width="900" height="720"/>`;const nodes=new Map();for(const l of p.scene.layers){const t=p.scene.tracks.find(t=>t.layer===l.id),pose=t?sampleTrack(t,time):{x:0,y:0,angle:0,opacity:1},[px,py]=l.pivot;nodes.set(l.id,{l,body:`<image href="${await data(join(folder,l.image))}" width="900" height="720"/>`,transform:`translate(${pose.x} ${pose.y}) translate(${px} ${py}) rotate(${pose.angle}) scale(1 ${pose.scaleY??1}) translate(${-px} ${-py})`,opacity:pose.opacity});}
 const draw=n=>`<g transform="${n.transform}" opacity="${n.opacity}">${n.body}${[...nodes.values()].filter(c=>c.l.parent===n.l.id).map(draw).join('')}</g>`;
 content+=[...nodes.values()].filter(n=>!n.l.parent).map(draw).join('');motion+=`<div class="card"><svg viewBox="0 0 900 720">${content}</svg><p>Page ${i+1} · ${time} ms</p></div>`;}
 await page.setContent(styles+'<div class="grid">'+motion+'</div>');await page.screenshot({path:join(out,`${id}-motion.png`),fullPage:true});console.log(`Reviewed sheets: ${id}`);
 }}finally{await browser.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const [out,...ids]=process.argv.slice(2);if(!out||!ids.length)throw Error('Usage: node scripts/learning/review.mjs <out-dir> <book-id>...');await review(out,ids);}
