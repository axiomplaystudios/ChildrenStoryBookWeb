// Original raster pixels are retained in SVG cutouts. Repairs are hand-authored
// matching white/ink shapes, never a translated rectangle over the original part.
import {readFile,writeFile} from 'node:fs/promises';
const root='public/books/sleepy-mr-sloth/';
const book=JSON.parse(await readFile(root+'story.json','utf8'));
const heights=[1021,1023,1021,1021,1023,976,1023,1024,1023,1021,1023,1023];
const ink='#3b2100';
const wrap=(h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="${h}" viewBox="0 0 1024 ${h}">${body}</svg>\n`;
const path=(d,fill='white')=>`<path d="${d}" fill="${fill}"/>`;
const track=(layer,preset,parameters,{durationMs=2200,restMs=3600,delayMs=450,playback='repeat'}={})=>({layer,preset,parameters,durationMs,restMs,delayMs,playback});
async function scene(n,definitions,tracks){
 const prefix=`page-${String(n).padStart(2,'0')}`,h=heights[n-1];
 const src=`data:image/webp;base64,${(await readFile(root+prefix+'.webp')).toString('base64')}`;
 const image=`<image href="${src}" width="1024" height="${h}"/>`;
 const layers=[];let repairs='';
 for(const part of definitions){
  const filename=`${prefix}-${part.id}.svg`;
  const body=part.art ?? `<defs><clipPath id="part">${path(part.shape)}</clipPath></defs><g clip-path="url(#part)">${image}</g>`;
  await writeFile(root+filename,wrap(h,body));
  if(Object.hasOwn(part,'repair'))repairs+=part.repair;
  else if(part.shape)repairs+=path(part.shape,part.fill||'white');
  layers.push({id:part.id,image:filename,x:0,y:0,width:1024,height:h,pivot:part.pivot||[0,0],...(part.parent?{parent:part.parent}:{})});
 }
 const background=prefix+'-background.svg';await writeFile(root+background,wrap(h,image+repairs));
 book.pages[n-1].scene={width:1024,height:h,background,layers,tracks};
}
// The yawn is articulated below the nose, with the hand remaining in front.
await scene(1,[
 {id:'sloth-jaw',shape:'M675 388Q716 378 745 400L748 425L730 437L714 420L701 415L687 439L672 430Z',pivot:[706,395]},
 {id:'sloth-hand',shape:'M671 427L684 412L696 413L705 447L714 456L709 429L711 411L724 416L740 455L757 475L737 488L702 476L673 457Z',repair:'',pivot:[706,450]},
], [track('sloth-jaw','gesture',{x:0,y:6,angle:5},{durationMs:3200,restMs:6000,playback:'once'})]);
// Articulate the broad hanging torso around its upper attachment. The original
// feet, hands and trunk remain foreground, keeping grips fixed.
const torso2='M536 572Q560 586 580 584L600 625L633 661L657 690L650 714L605 697L572 668L548 628Z';
await scene(2,[
 {id:'sloth-torso',shape:torso2,fill:ink,pivot:[477,467]},
], [track('sloth-torso','gesture',{x:0,y:-6,angle:2.5},{durationMs:3300,playback:'once'})]);
await scene(3,[
 {id:'giraffe-ear',shape:'M92 328L101 297L119 271L142 256L163 265L159 285L132 308Z',pivot:[153,272]},
], [track('giraffe-ear','gesture',{x:0,y:0,angle:-10},{durationMs:1000,restMs:4300})]);
const jaw4='M316 552Q367 538 414 502Q448 501 474 490L500 515Q419 559 319 572Z';
await scene(4,[
 {id:'giraffe-jaw',shape:jaw4,pivot:[320,559],repair:path(jaw4,ink)+path('M315 546L374 529L375 570L315 577Z','white')},
 {id:'giraffe-neck-foreground',shape:'M290 515H377L372 554L369 590H290Z',repair:''},
], [track('giraffe-jaw','squawk',{angle:-4},{durationMs:2200,playback:'once'})]);
await scene(5,[
 {id:'bee-1',shape:'M322 577H354V624H322Z',pivot:[338,602]},
 {id:'bee-2',shape:'M166 718H202V769H166Z',pivot:[184,744]},
], [track('bee-1','bee-flight',{radiusX:43,radiusY:24,phase:0},{durationMs:4500,restMs:700}),track('bee-2','bee-flight',{radiusX:31,radiusY:18,phase:120},{durationMs:5100,restMs:850,delayMs:700})]);
// Tail is below the branch; anchor its top and let the tip flex gently.
await scene(7,[
 {id:'snake-tail',shape:'M911 425L945 421L958 447L963 478L959 503L945 528L929 544L914 544L913 532L926 512L934 487L926 462Z',pivot:[928,426]},
], [track('snake-tail','gesture',{x:0,y:0,angle:11},{durationMs:2500,restMs:4500})]);
const snake8='M545 430Q528 382 515 331Q504 286 516 255Q528 243 541 258L551 320L553 339Q554 286 590 251Q615 229 623 236L628 260Q607 296 607 328L608 356L589 385L568 430Z';
await scene(8,[
 {id:'snake-head',shape:snake8,pivot:[554,424]},
 {id:'snake-tongue',art:`<path d="M619 254l12-12m-2 2 7 1m-7-1 1-7" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,parent:'snake-head',pivot:[620,253]},
], [track('snake-head','gesture',{x:0,y:0,angle:5},{durationMs:1500,playback:'once'}),track('snake-tongue','blink',{}, {durationMs:500,restMs:2700,delayMs:900})]);
const toes9='M411 113L437 114L451 138L456 154L446 160L434 145L436 159L426 168L421 145L408 152L390 168L378 171L388 155L403 143Z';
await scene(9,[
 {id:'bird-toes',shape:toes9,pivot:[428,121]},
], [track('bird-toes','gesture',{x:0,y:-2,angle:-9},{durationMs:1800,playback:'once'})]);
// Closed lids cover only the original eyes, not the entire face.
await scene(11,[
 {id:'sloth-eyelids',art:`<path d="M510 401Q522 394 539 400L541 412L508 415Z" fill="white"/><path d="M575 404Q593 399 609 416L614 443L573 430Z" fill="white"/><path d="M512 406q12 6 25-1M578 413q14 10 26 8" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`},
 {id:'sloth-chest',shape:'M474 545Q540 565 599 530L595 641L563 678L518 691L474 668Z',fill:ink,pivot:[533,679]},
], [track('sloth-eyelids','fade-in',{}, {durationMs:1500,playback:'once'}),track('sloth-chest','breathe',{amount:.018},{durationMs:5200,restMs:1200,delayMs:1500})]);
await scene(12,[
 {id:'sleep-mark-1',shape:'M500 268H521V290H500Z',pivot:[510,280]},
 {id:'sleep-mark-2',shape:'M516 235H551V267H516Z',pivot:[533,252]},
 {id:'sleep-mark-3',shape:'M550 198H592V243H550Z',pivot:[570,222]},
 {id:'sleeping-sloth',shape:'M461 312L488 300L502 310L500 330L487 344L462 349L452 336Z',fill:ink,pivot:[477,345]},
], [track('sleep-mark-1','sleep-rise',{distanceY:20},{durationMs:3900,restMs:900}),track('sleep-mark-2','sleep-rise',{distanceY:25},{durationMs:3900,restMs:900,delayMs:1000}),track('sleep-mark-3','sleep-rise',{distanceY:30},{durationMs:3900,restMs:900,delayMs:1700}),track('sleeping-sloth','breathe',{amount:.025},{durationMs:5400,restMs:1000})]);
book.credit=book.credit.replace('selected parts of pages 6 and 10 were separated and animated with repaired backgrounds','selected parts of each illustration were separated and animated with repaired backgrounds');
await writeFile(root+'story.json',JSON.stringify(book,null,2)+'\n');
