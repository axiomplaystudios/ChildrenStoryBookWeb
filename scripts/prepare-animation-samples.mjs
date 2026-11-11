// Rebuild the three review scenes from the untouched original illustrations.
// SVG masks isolate original ink; white masks remove parts only on plain white sky.
import { readFile, writeFile } from 'node:fs/promises';
const root = 'public/books/';
const ns = 'http://www.w3.org/2000/svg';
const base64 = async path => `data:image/${path.endsWith('.webp') ? 'webp' : 'png'};base64,${(await readFile(path)).toString('base64')}`;
const writeSVG = async (dir, name, width, height, body) => writeFile(`${root}${dir}/${name}`, `<svg xmlns="${ns}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>\n`);
const dir = 'pip-finds-a-friend';
let pip = await readFile(`${root}${dir}/page-03.svg`, 'utf8');
const fixed = '<path d="M-28 -2q-10 15 0 15t0-15" fill="#9ed4d8"/>';
if (!pip.includes(fixed)) throw Error('Tear path changed');
await writeFile(`${root}${dir}/page-03-background.svg`, pip.replace(fixed, ''));
await writeSVG(dir, 'page-03-tear.svg', 14, 22, '<path d="M7 0C5 5 0 10 0 15a7 7 0 0 0 14 0C14 10 9 5 7 0Z" fill="#9ed4d8"/><path d="M4 12Q2 16 5 18" fill="none" stroke="#d6f0ee" stroke-width="1.6" stroke-linecap="round"/>');
const pipStory = JSON.parse(await readFile(`${root}${dir}/story.json`));
pipStory.pages[2].scene = {width:720,height:540,background:'page-03-background.svg',layers:[
 {id:'rabbit-tear',image:'page-03-tear.svg',x:488,y:368,width:14,height:22,pivot:[495,368]},
 {id:'rabbit-tear-second',image:'page-03-tear.svg',x:489,y:368,width:12,height:19,pivot:[495,368]},
],tracks:[
 {layer:'rabbit-tear',preset:'tear-fall',playback:'repeat',durationMs:1800,restMs:1700,delayMs:450,parameters:{distanceY:105}},
 {layer:'rabbit-tear-second',preset:'tear-fall',playback:'repeat',durationMs:1800,restMs:1700,delayMs:1250,parameters:{distanceY:105}},
]};
await writeFile(`${root}${dir}/story.json`, JSON.stringify(pipStory,null,2)+'\n');
const sloth = 'sleepy-mr-sloth';
const source6=await base64(`${root}${sloth}/page-06.webp`);
// Erase just the four original insects. Retain the original drawn flight trails.
const repairs6 = '<rect x="368" y="129" width="34" height="33"/><rect x="584" y="180" width="37" height="43"/><rect x="456" y="654" width="28" height="34"/><rect x="747" y="620" width="34" height="39"/>';
await writeSVG(sloth,'page-06-background.svg',1024,976,`<defs><clipPath id="repair">${repairs6}</clipPath></defs><image href="${source6}" width="1024" height="976"/><rect width="1024" height="976" fill="white" clip-path="url(#repair)"/>`);
const bees = [[370,130,30,30],[585,181,34,41],[457,655,25,31],[748,621,31,36]];
for(let i=0;i<bees.length;i++){
 const [x,y,w,h]=bees[i];
 await writeSVG(sloth,`page-06-bee-${i+1}.svg`,w,h,`<defs><filter id="ink"><feColorMatrix type="luminanceToAlpha"/><feComponentTransfer><feFuncA type="table" tableValues="1 1 1 1 1 1 1 1 0"/></feComponentTransfer></filter><mask id="cutout" mask-type="alpha"><image href="${source6}" x="${-x}" y="${-y}" width="1024" height="976" filter="url(#ink)"/></mask></defs><image href="${source6}" x="${-x}" y="${-y}" width="1024" height="976" mask="url(#cutout)"/>`);
}
const slothStory=JSON.parse(await readFile(`${root}${sloth}/story.json`));
slothStory.pages[5].scene={width:1024,height:976,background:'page-06-background.svg',layers:bees.map(([x,y,w,h],i)=>({id:`bee-${i+1}`,image:`page-06-bee-${i+1}.svg`,x,y,width:w,height:h,pivot:[x+w/2,y+h/2]})),tracks:bees.map(([x,y,w,h],i)=>({layer:`bee-${i+1}`,preset:'bee-emerge',playback:'repeat',durationMs:4600+i*420,restMs:700,delayMs:350+i*380,parameters:{radiusX:[54,75,48,37][i],radiusY:[28,25,17,20][i],phase:[0,160,30,220][i],fromX:140-x-w/2,fromY:577-y-h/2}}))};
const source10=await base64(`${root}${sloth}/page-10.webp`);
// The head, neck and torso stay in the original background. Only the lower beak moves.
const jaw='M469 202L487 171L646 124L652 194L495 216Z';
await writeSVG(sloth,'page-10-background.svg',1024,1021,`<defs><clipPath id="repair"><path d="${jaw}"/></clipPath></defs><image href="${source10}" width="1024" height="1021"/><rect width="1024" height="1021" fill="white" clip-path="url(#repair)"/>`);
// Extract the original lower-beak ink; its hinge is authored in scene coordinates.
await writeSVG(sloth,'page-10-beak.svg',1024,1021,`<defs><clipPath id="jaw"><path d="${jaw}"/></clipPath></defs><image href="${source10}" width="1024" height="1021" clip-path="url(#jaw)"/>`);
slothStory.pages[9].scene={width:1024,height:1021,background:'page-10-background.svg',layers:[
 {id:'bird-beak',image:'page-10-beak.svg',x:0,y:0,width:1024,height:1021,pivot:[470,202]},
],tracks:[{layer:'bird-beak',preset:'squawk',playback:'repeat',durationMs:1800,restMs:1800,delayMs:500,parameters:{angle:-14}}]};
slothStory.credit=slothStory.credit.replace('illustrations were converted to WebP and displayed with gentle pan and zoom','illustrations were converted to WebP, selected parts of pages 6 and 10 were separated and animated with repaired backgrounds');
await writeFile(`${root}${sloth}/story.json`,JSON.stringify(slothStory,null,2)+'\n');
