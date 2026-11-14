import {books} from './book-data.mjs';
import {writeBook,scene} from './package.mjs';
import {P,E,R,G,label,ink,palette,layer,track} from './art.mjs';
import {mouse,rabbit,bear,teddy,actor} from './cast.mjs';
import {outdoor,indoor,plaque,table,stool,toyBox,rug,shelf,cloud,drift,flutter,fall,sway} from './scenery.mjs';
import {place,prop,woodShape,block,bucket,cart} from './props.mjs';
const find=id=>books.find(b=>b.id===id);
const action='The friends breathe and blink gently. The teaching examples and their words remain still.';
const ambient=i=>drift('cloud',cloud(700,70,.5),{dx:25,ms:9000});
const shapeBook=find('little-shape-builders');
function house(stage){let art=R(390,290,370,290,'#dec294',9,ink)+P('M410 330H740M410 390H740M410 450H740M410 510H740','none','#c5a477',3);
 if(stage>=1)art+=woodShape('circle',470,370,95,'#a5c1c4');if(stage>=2)art+=woodShape('square',670,370,90,'#a5c1c4');if(stage>=3)art+=P('M575 175L360 300H790Z','#c78669');if(stage>=4)art+=R(535,430,80,150,stage===7?'#6c6154':'#b58b65',0,ink);if(stage===7)art+=G(prop('quilt').art,{x:580,y:540,s:.4});return art;}
await writeBook({...shapeBook,scenes:shapeBook.pages.map((p,i)=>{let art=i?house(i):woodShape('circle',420,430,145)+woodShape('square',650,450,145)+woodShape('triangle',520,570,145);
 if(p.learning?.shape)art+=plaque(p.learning.shape,450,110,60);else art+=plaque(i===7?'Room for a story':'A house of shapes',450,105,43);
 if(i===5)art+=E(470,370,40,40,'none','#fff4da',5,{'stroke-dasharray':'8 7'})+R(630,330,80,80,'none',0,'#fff4da',5,{'stroke-dasharray':'8 7'});
 if(i===7)art+=G(prop('quilt').art,{x:760,y:515,s:.35});
 return scene({...p,action,back:[outdoor({seed:i+10,plain:true,fence:true,trees:[[50,480,.6,'round',2]]}),art],cast:[actor('mouse',mouse({x:155,y:660,s:1.05,armR:80}),{wave:'R'}),actor('rabbit',rabbit({x:815,y:660,s:.8,armL:i===7?80:30,holdL:i===7?R(-24,-35,48,65,'#b86c60',3,ink):''}),{idle:null})],movers:[ambient(i)]});}),cover:outdoor({plain:true,fence:true})+plaque('The Little',450,105,57)+plaque('Shape Builders',450,220,60)+mouse({x:245,y:675,s:1.35,armR:130}).art+rabbit({x:665,y:675,s:.9,armL:130}).art+woodShape('triangle',455,430,300,'#c78669')});

const opposites=find('big-bear-little-mouse');
await writeBook({...opposites,scenes:opposites.pages.map((p,i)=>{let back=outdoor({seed:40+i,plain:true,fence:true,path:i===3,trees:[[830,480,.7,'round',2]]}),art='',movers=[],cast=[];const words=p.learning?.opposites;
 if(words)art+=plaque(words[0],390,130,50)+plaque(words[1],700,130,50);
 if(i===1)art+=G(prop('ball').art.replaceAll('url(#prop-dfb65e)','#cf564d'),{x:460,y:485,s:1.75})+G(prop('ball').art.replaceAll('url(#prop-dfb65e)','#cf564d'),{x:710,y:550,s:.7});
 else if(i===2){for(let j=0;j<6;j++)art+=block(380,555-j*57,55,'#508cb5');for(let j=0;j<2;j++)art+=block(650,555-j*57,55,'#508cb5');}
 else if(i===3)art+=G(P('M-65-60H65L45 40H-45Z','#bc8266'),{x:400,y:590})+G(P('M-65-60H65L45 40H-45Z','#bc8266'),{x:640,y:500,s:.45});
 else if(i===4)art+=G(bucket(true),{x:420,y:500,s:1.3})+G(bucket(false),{x:690,y:500,s:1.3});
 else if(i===5){art+=P('M290 390H830M290 580H830','none','#d9c29a',7);movers.push({layers:[layer('fast-cart',G(cart(),{x:370,y:330,s:.7}),[370,330]),layer('slow-cart',G(cart(),{x:370,y:520,s:.7}),[370,520])],tracks:[track('fast-cart','gesture',{x:310,y:0,angle:0},1400,500,0),track('slow-cart','gesture',{x:310,y:0,angle:0},4400,500,0)]});}
 else if(i===6)art+=G(cart(),{x:450,y:580,s:.55})+G(cart(),{x:700,y:580,s:.55})+Array.from({length:6},(_,j)=>block(420,470-j*40,38)).join('')+block(650,470,38)+block(650,430,38)+G(prop('ball').art,{x:550,y:540,s:.7})+G(prop('ball').art,{x:780,y:560,s:.35});
 else art+=R(280,590,520,60,'#ddc699',25)+G(prop('ball').art,{x:500,y:565,s:1.1});
 // Bear remains twice Mouse's authored height; perspective changes position, not the size relationship.
 cast=[actor('mouse',mouse({x:90,y:675,s:.7,sit:i===7,armR:70}),{idle:null}),actor('bear',bear({x:i===3?760:250,y:i===3?500:620,s:1,sit:i===7}),{idle:i===5?null:'breathe'})];
 return scene({...p,action:i===5?'Two identical carts travel the same distance in 1400 and 4400 milliseconds. Bear and Mouse blink as they watch.':action,back:[back,art],cast,movers});}),cover:outdoor({plain:true,time:'golden'})+plaque('Big Bear,',450,110,65)+plaque('Little Mouse',450,220,62)+bear({x:400,y:675,s:1.3,armL:30}).art+mouse({x:665,y:675,s:.9,armR:60}).art});

const teddyBook=find('where-is-teddy');
await writeBook({...teddyBook,scenes:teddyBook.pages.map((p,i)=>{let art=rug(),pos=p.learning?.position;
 if(pos)art+=plaque(pos,450,115,65);else art+=plaque(i===0?'Where is Teddy?':i===6?'One more clue':'Found you!',450,115,46);
 if(pos==='in'){art+=R(450,390,260,190,'#8f785e',8,ink)+teddy({x:580,y:565,s:1.2}).art+toyBox(580,600,1.2);}
 else if(pos==='on')art+=stool(580,500,1.25)+teddy({x:580,y:480,s:1}).art;
 else if(pos==='under'||i===6)art+=teddy({x:580,y:635,s:.9}).art+table(580,430,1.2);
 else if(pos==='behind')art+=teddy({x:580,y:620,s:1}).art+toyBox(580,620,1.3);
 else if(pos==='beside')art+=toyBox(495,600,1)+teddy({x:750,y:620,s:1}).art;
 else if(i===7)art+=table(650,460,1)+teddy({x:320,y:600,s:.75}).art;
 else art+=toyBox(580,590,1.2)+teddy({x:720,y:570,s:.65}).art;
 const m=mouse({x:190,y:660,s:1.2,eyes:i===0?'closed':'open',armR:i===2?150:i===7?90:65,lean:i===3?12:0,sit:i===7});
 const cast=[actor('mouse',m,{idle:null,wave:'R',tail:true,blink:i!==0})];if([0,6,7].includes(i))cast.push(actor('rabbit',rabbit({x:790,y:640,s:.8,armL:65}),{idle:null,blink:true}));
 return scene({...p,action:'Mouse moves a searching paw and tail and blinks. Teddy and the furniture stay still in the named position.',back:[indoor({seed:i,items:[shelf(760,330,.6)]}),art],cast,movers:[sway('pendulum',P('M365 180v75','none','#ad8c62',5)+E(365,260,16,20,'#d8b06b'),[365,180],{angle:5,ms:7000})]});}),cover:indoor({window:false})+plaque('Where Is Teddy?',450,145,61)+teddy({x:600,y:620,s:1.5}).art+toyBox(600,630,1.7)+mouse({x:230,y:670,s:1.4,look:[-3,0],armL:70}).art});

const patterns=find('pattern-parade');
const rows=[[],['red circle','blue circle','red circle','blue circle'],['yellow square','green square','yellow square','green square'],['blue circle','blue triangle','blue circle','blue triangle'],['red circle','red circle','blue circle','red circle','red circle','blue circle'],['yellow triangle','yellow triangle','green triangle','yellow triangle','yellow triangle','green triangle'],['red circle','blue circle','red circle','blue circle','red circle'],['red circle','blue circle','red circle','blue circle','red circle','blue circle']];
function badges(row,missing=false){let art=P('M65 200V500M835 200V500M65 225H835','none','#a58560',9);row.forEach((item,j)=>{const [colour,shape]=item.split(' '),x=140+j*124;const shapeArt=shape==='circle'?E(x,290,42,42,palette[colour],ink):shape==='square'?R(x-42,248,84,84,palette[colour],0,ink):P(`M${x} 245L${x+44} 332H${x-44}Z`,palette[colour]);art+=P(`M${x} 225v24`,'none','#ad926c',3)+`<g id="pattern-item-${j+1}"><title>${item}</title>${shapeArt}</g>`;});if(missing)art+=E(760,290,43,43,'none','#ad9a7d',3,{'stroke-dasharray':'7 7'})+label('?',760,310,50);return art;}
await writeBook({...patterns,scenes:patterns.pages.map((p,i)=>scene({...p,action:'Friends bob and blink in turn below the still pattern ribbon. A single flag sways at the side.',back:[outdoor({plain:true,seed:100+i}),i?badges(rows[i],i===6):plaque('A pattern parade',450,190,54)],cast:[actor('mouse',mouse({x:205,y:665,s:1,armR:60}),{idle:'bob'}),actor('rabbit',rabbit({x:470,y:665,s:.85,armL:60}),{idle:'bob',delay:500}),actor('bear',bear({x:710,y:665,s:.8,armR:40}),{idle:'bob',blink:false,delay:1000})],movers:[sway('flag',P('M60 460V600','none','#ac8967',6)+P('M60 460Q120 440 145 475L65 500Z','#c9b48d','none'),[60,500])]})),cover:outdoor({plain:true})+plaque('The Pattern Parade',450,135,53)+badges(rows[1])+mouse({x:300,y:680,s:1.25,armR:105}).art+rabbit({x:580,y:680,s:1,armL:80}).art});

const feelings=find('day-of-feelings');const expressions={happy:{armL:90,armR:90,mouth:'grin',eyes:'happy'},sad:{mouth:'sad',brows:'sad',lean:4},angry:{mouth:'flat',brows:'angry',armL:30,armR:30},worried:{mouth:'wavy',brows:'worried',armL:145,armR:145},excited:{mouth:'o',eyes:'wide',armL:160,armR:160},calm:{eyes:'closed',mouth:'smile',sit:true}};
await writeBook({...feelings,scenes:feelings.pages.map((p,i)=>{const f=p.learning?.feeling,pose=expressions[f]??{},movers=[];let art=rug()+plaque(f??(i?'Feelings come and go':'A day together'),450,115,f?60:45);
 if(['sad','angry'].includes(f))art+=block(370,580,55)+G(block(0,0,55),{x:450,y:590,rot:15});else art+=block(400,600,55)+block(460,600,55)+(i>=5?block(430,545,55):'');
 if(f==='sad')movers.push(fall('tear',P('M590 320q-12 18 0 20q12-2 0-20','#8fc5d1','none'),{distance:25,ms:6500}));
 if(f==='angry')movers.push({layers:[layer('breath',cloud(715,390,.25),[715,390])],tracks:[track('breath','sleep-rise',{distanceY:20},7000,500,0)]});
 return scene({...p,action:'Bear and Mouse breathe slowly. Mouse swishes a tail; a small tear or breath illustrates Bear’s own named feeling.',back:[indoor({seed:i,items:[shelf(150,350,.7)]}),art],cast:[actor('bear',bear({x:620,y:680,s:1.4,...pose}),{blink:!['calm','happy'].includes(f)}),actor('mouse',mouse({x:240,y:670,s:1.1,armR:f==='sad'?90:65,sit:f==='calm'}),{idle:null,tail:true})],movers});}),cover:indoor({window:false})+plaque('A Day of Feelings',450,130,58)+bear({x:550,y:695,s:1.2,mouth:'grin',armL:60}).art+mouse({x:245,y:680,s:1.2,armR:90}).art+Object.values(expressions).map((o,i)=>G(bear({x:0,y:0,s:.3,...o}).art,{x:120+i*132,y:295})).join('')});
