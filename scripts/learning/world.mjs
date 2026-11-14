import {books} from './book-data.mjs';
import {writeBook,scene} from './package.mjs';
import {P,E,R,G,label,ink,layer,track,gradient} from './art.mjs';
import {pip,mouse,rabbit,actor} from './cast.mjs';
import {outdoor,indoor,plaque,tree,gardenBed,cloud,drift,flutter,fall,sway,twinkle,starfield,moon,sun,table,rug} from './scenery.mjs';
import {prop,place} from './props.mjs';
const find=id=>books.find(b=>b.id===id);
const flower=(x,y,c,s=1,stem=75)=>G(P(`M0 0V${stem}`,'none','#8a9d7f',7)+P('M0 48Q-38 18-33 7Q0 13 0 48','#a5b28b','none')+Array.from({length:6},(_,i)=>G(E(0,-22,13,22,c),{rot:i*60})).join('')+E(0,0,12,12,'#e3bf71'),{x,y,s});
const pot=(x,y,c,s=1)=>G(P('M-38 0H38L29 63H-29Z',c)+R(-43,-10,86,21,c,5,ink)+P('M-22 15L-17 46','none','#f1d8ad',5),{x,y,s});
const colours={red:'#cd5d57',orange:'#dc9551',yellow:'#e7bd53',green:'#77975f',blue:'#6d9fbb',purple:'#987399',pink:'#da9fae'};
const garden=find('rabbits-rainbow-garden');
const gardenPages=garden.pages.map((p,i)=>{const colour=p.learning?.colour,c=colours[colour];let art='',back=outdoor({seed:i+30,plain:true,time:i===9?'golden':'morning',fence:i<3,trees:i===6?[[650,530,1,'plum',5]]:[]}),cast=[],front=[],movers=[];
 if(colour){art+=gardenBed(570,580,1.5)+plaque(colour,450,135,65,{fill:colour==='yellow'?'#946f24':c});
 if(colour==='orange')art+=[420,540,660].map(x=>place('carrot',x,580,1.2)).join('')+G(prop('jug').art,{x:315,y:450,s:.8,rot:25});
 else if(colour==='green')art+=[430,570,705].map((x,j)=>G(prop('leaf').art,{x,y:440+j%2*55,s:1.5})).join('');
 else if(colour!=='purple')art+=[430,565,700].map((x,j)=>flower(x,colour==='yellow'?300+j%2*35:445-j%2*50,c,colour==='yellow'?1.4:1.1,colour==='yellow'?(580-(300+j%2*35))/1.4:(580-(445-j%2*50))/1.1)).join('');
 if(colour==='blue')cast.push(actor('mouse',mouse({x:775,y:650,s:.8,armL:60}),{idle:null}));
 movers.push(flutter('butterfly',760,230,c));if(colour==='orange')movers=[fall('water',G(P('M0 0l-3 17M18 8l-3 17M36 16l-3 17','none','#92b8c5',4),{x:350,y:453}),{distance:25,ms:7000})];
 }else if(i===8){art+=plaque('Match the colours',450,125,48);Object.entries(colours).forEach(([word,c],j)=>{const x=120+j%4*215,y=j<4?250:470;art+=flower(x,y,c,.5)+pot(x,y+50,c,.55)+plaque(word,x,y+140,40,{fill:word==='yellow'?'#946f24':c});});}
 else{art+=plaque(i?'Our colour garden':'A garden of colours',450,130,48);Object.values(colours).forEach((c,j)=>{art+=gardenBed(365+j%4*145,410+Math.floor(j/4)*160,.5);if(i)art+=flower(365+j%4*145,330+Math.floor(j/4)*160,c,.65);});if(i)art+=mouse({x:730,y:660,s:.9,sit:true}).art;}
 const pose={x:i===8?450:180,y:i===8?715:660,s:i===8?.5:1.05,armR:colour==='yellow'?150:colour==='orange'?80:65,armL:colour==='green'?100:0,sit:i===9};
 cast.unshift(actor('rabbit',rabbit(pose),{idle:null,wave:'R',ears:true}));
 return scene({...p,alt:colour?`Rabbit explores ${colour} ${colour==='orange'?'carrots':colour==='green'?'leaves':colour==='purple'?'plums on the tree':'flowers'} in a softly coloured garden. The word ${colour} is on a cream plaque.`:p.alt,action:'Rabbit gently moves an ear and paw and blinks; the named colour examples remain still.',back:[back,art],cast,movers,front});});
await writeBook({...garden,scenes:gardenPages,cover:outdoor({time:'morning',plain:true})+plaque('Rabbit’s Rainbow',450,110,55)+plaque('Garden',450,220,65)+Object.values(colours).map((c,i)=>flower(100+i*115,400+i%2*40,c,.8)).join('')+rabbit({x:440,y:685,s:1.3,armR:80}).art+G(prop('jug').art,{x:600,y:580,s:1})});

const planetNames=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const planetColours=['#b1aaa2','#dfc596','#82b8c4','#cc8869','#d2b28e','#dfc899','#a7cacc','#5988b5'];
function planet(n,x=570,y=390,r=170){let body=E(0,0,r,r,planetColours[n],ink,3);
 if(n===0)body+=[[-60,-55,27],[45,-88,18],[75,50,35],[-65,70,17]].map(([x,y,r])=>E(x,y,r,r,'#96928c')+E(x+5,y+5,r*.7,r*.7,'#c4bdb2')).join('');
 if([1,4,7].includes(n))body+=P(`M${-r*.8} ${-r*.5}Q0 ${-r*.15} ${r*.8} ${-r*.5}M${-r*.97} ${-r*.1}Q0 ${r*.2} ${r*.97} ${-r*.1}M${-r*.85} ${r*.42}Q0 ${r*.7} ${r*.85} ${r*.42}`,'none',n===7?'#91b7ce':n===4?'#a98064':'#f1dfb8',n===4?22:12);
 if(n===2)body+=P('M-105-105L-45-137-17-100-44-63-14-24-54 15-102-7-125-55Z M30-20L89-66 137-35 113 25 61 43 25 97-14 66Z','#7f9e70','none');
 if(n===3)body+=P('M-68-153Q0-186 68-153L31-128-24-133Z','#ecd8bd','none')+E(-60,50,30,22,'#b47158')+E(72,-20,38,17,'#dc9b78');
 if(n===4)body+=E(65,45,37,19,'#bb7861');
 body+=P(`M0 ${-r}A${r} ${r} 0 0 1 0 ${r}Q${r*.95} 0 0 ${-r}Z`,'#574e55','none',0,{opacity:.17});
 if(n===5||n===6)body+=G(E(0,0,r*(n===6?1.12:1.45),r*.32,'none','#d9bd8a',n===5?23:5)+E(0,0,r*(n===6?1.18:1.56),r*.36,'none','#f0dfb8',n===5?7:2),{rot:n===6?75:-20});
 return G(body,{x,y});}
const rocket=(x,y,s=1,occupied=true)=>G(P('M-50 70L-80 125-31 110M50 70L80 125 31 110','#b97462')+P('M-48 90V-52Q-35-112 0-143Q35-112 48-52V90Z','#dccba6')+P('M-48-52Q0-87 48-52Q35-112 0-143Q-35-112-48-52','#b76e5d')+E(0,-15,40,43,'#7896a3',ink)+(occupied?G(pip({x:0,y:35,s:.32}).art,{y:0}):'')+R(-48,72,96,22,'#ba8b69',5),{x,y,s});
const planets=find('pips-planet-journey');const spacePages=planets.pages.map((p,i)=>{const n=i-1;let back,art='',movers=[];
 if(p.learning?.planet){back=R(0,0,900,720,gradient(`space-${n}`,'linear',[[0,'#26354d'],[1,['#4d5969','#5e5365','#416477','#64475c','#625367','#595777','#3b6473','#314d75'][n]]],{x2:0,y2:1}))+starfield(90+i,30);art+=plaque(p.learning.planet,570,105,61)+label(`${i} from the Sun`,570,160,32,{fill:'#fff0cc'})+planet(n)+label('NOT TO SCALE',450,585,21,{fill:'#fff0cc'});
 art+=sun(130,655,.3)+planetNames.map((_,j)=>E(240+j*76,655,j===n?14:7,j===n?14:7,j===n?'#f6d99e':'#9ca6ac')).join('');
 movers=[drift('rocket',rocket(170,385,1),{dx:0,ms:8000}),fall('flame',G(P('M-24 0Q-30 55 0 90Q30 55 24 0Z','#e9ba70','none')+P('M-12 0Q-15 38 0 57Q15 38 12 0Z','#f6dc99','none'),{x:170,y:479}),{distance:12,ms:6000}),twinkle('stars-one',starfield(17,12)),twinkle('stars-two',starfield(22,10),{ms:9000,delay:900})];movers[0].tracks[0].parameters.y=-15;movers[1].layers[0].parent='rocket';movers[1].layers[0].pivot=[170,479];movers[1].tracks[0]={...movers[1].tracks[0],preset:'breathe',parameters:{amount:.04}};
 }else{back=indoor({window:false})+rug()+R(640,80,200,260,'#a18367',90)+R(655,95,170,230,'#334c63',80)+moon(740,170,.55);art+=rocket(660,485,1.1,false)+pip({x:300,y:650,s:1.3,armR:55}).art;
 if(i===0)art+=cloud(350,190,2)+sun(265,165,.5)+label('star',265,245,40)+moon(440,170,.55)+label('not a planet',475,300,40);else art+=plaque('Hello, Earth',335,175,48);
 art+=label('NOT TO SCALE',450,700,21);
 movers=[sway('mobile',P('M520 20v90M430 110H610M450 110v70M590 110v100','none','#9c805e',3)+E(450,190,15,15,'#e6c47d')+E(590,225,12,12,'#e6c47d'),[520,20]),twinkle('window-stars',G(starfield(3,10),{x:655,y:95,s:.18}))];}
 return scene({...p,alt:p.learning?.planet?`Pip in a cardboard rocket beside ${p.learning.planet}, ${i} from the Sun. Its features are shown with a shaded side; a fixed strip marks its order. Not to scale.`:i===0?'Pip imagines a space journey beside an empty cardboard rocket. A thought cloud names the Sun as a star and the Moon as not a planet.':'Pip stands at home on a soft rug beside an empty cardboard rocket and a moonlit window.',action:'The rocket floats gently, its flame moves softly, and star groups brighten and fade. The planet and labels stay fixed.',back:[back,art],movers});});
await writeBook({...planets,scenes:spacePages,cover:R(0,0,900,720,'#2d405b')+starfield(60,50)+plaque('Pip’s Planet',450,110,62)+plaque('Journey',450,220,65)+planet(5,600,470,145)+rocket(260,475,1.25)+label('NOT TO SCALE',450,695,22,{fill:'#fff0cc'})});

const weather=find('weather-window');const frame=R(0,0,900,65,'#f3e3c6')+R(0,65,135,500,'#f3e3c6')+R(765,65,135,500,'#f3e3c6')+R(0,565,900,155,'#f3e3c6')+R(135,65,630,500,'none',90,'#b48b55',24)+R(150,80,600,470,'none',78,'#edcd8e',10);
const clothes=()=>G(prop('hat').art,{x:290,y:290,s:.8})+G(P('M-40-65H-5V25L28 43V65H-50Z M25-65H60V25L93 43V65H15Z','#bc9372'),{x:450,y:300})+G(P('M-35-70L-80-35-59 12-32-8V80H40V-8L65 12 86-35 43-70 7-50Z','#839a9c')+P('M7-50V80','none',ink,3),{x:635,y:300})+plaque('sun hat',250,460,40)+plaque('rain boots',465,530,40)+plaque('warm coat',690,460,40);
const weatherPages=weather.pages.map((p,i)=>{let back=outdoor({seed:70+i,plain:true,pond:i===2,trees:i===5?[[300,470,.7,'pine',1],[650,510,.6,'pine',2]]:[]}),front=[frame],movers=[];const w=p.learning?.weather;
 back=back.replace(sun(),'');if(i===1)back+=sun(610,230,.65);
 if(i===1)movers=[sway('sun-rays',G(Array.from({length:12},(_,j)=>G(P('M0-80v-25','none','#edc984',8),{rot:j*30})).join(''),{x:610,y:230}),[610,230],{angle:12})];
 else if(i===2)movers=[fall('rain',Array.from({length:24},(_,j)=>P(`M${170+j%8*77} ${120+Math.floor(j/8)*95}l-8 28`,'none','#759ea9',5)).join(''),{distance:80,ms:6500})];
 else if(i===3)movers=[sway('kite',G(prop('kite').art,{x:470,y:260,s:1.25}),[470,350],{angle:7})];
 else if(i===4)movers=[drift('clouds',cloud(300,200,1.5)+cloud(600,260,1.3),{dx:35,ms:9000})];
 else if(i===5){back+=R(135,440,630,125,'#f2f0df');movers=[fall('snow',Array.from({length:32},(_,j)=>E(170+j%8*76,110+Math.floor(j/8)*85,5,5,'#fff9e9')).join(''),{distance:70,ms:9000})];}
 else if(i===6){back=indoor({window:false})+R(205,170,530,20,'#b99572',5)+[290,465,635].map(x=>P(`M${x} 190v32q15 15 25 0`,'none',ink,5)).join('')+clothes();front=[];}
 else if(i===7){back=indoor({window:true})+clothes();front=[];}
 else back+=cloud(450,230,1.5);
 if(front.length){movers=movers.map(m=>({...m,behind:true}));movers.push({behind:true,layers:[layer('frame',frame,[450,360])],tracks:[]});front=[];}
 const caption=plaque(w??(i===6?'Ready for the weather':i===7?'What weather is here?':'The weather window'),450,i<6?625:120,w?48:37);if(i<6)movers.at(-1).layers[0].art+=caption;else back+=caption;
 return scene({...p,action:'The weather moves gently inside the fixed frame. Pip lifts a wing and both friends blink.',back:[back],cast:[actor('mouse',mouse({x:90,y:700,s:.8}),{idle:null}),actor('pip',pip({x:810,y:700,s:.8,armL:65}),{idle:null,wave:'L',blink:false})],movers,front});});
await writeBook({...weather,scenes:weatherPages,cover:outdoor({plain:true}).replace(sun(),'')+frame+P('M450 80V550M150 315H750','none','#d3b378',14)+sun(290,210,.65)+cloud(600,220,.75)+G(prop('kite').art,{x:300,y:420,s:.65})+Array.from({length:8},(_,j)=>E(540+j%4*40,380+Math.floor(j/4)*60,8,8,'#fff')).join('')+plaque('The Weather Window',450,640,48)+mouse({x:80,y:710,s:.8}).art+pip({x:820,y:710,s:.8}).art});
