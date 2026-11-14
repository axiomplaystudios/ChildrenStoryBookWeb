import {books} from './book-data.mjs';
import {writeBook,scene} from './package.mjs';
import {P,E,R,G,label,ink} from './art.mjs';
import {pip,mouse,rabbit,bear,actor} from './cast.mjs';
import {outdoor,tree,plaque,letterCard,easel,stump,table,blanket,basket,bunting,cloud,drift,flutter} from './scenery.mjs';
import {prop,place} from './props.mjs';
const action='The friends breathe, blink and gesture gently while the letters, words and learning objects stay still.';
function alphabetPage(p,i){
 const last=i===27,zone=Math.min(5,Math.floor(Math.max(0,i-1)/5));
 const time=last?'golden':zone===0?'morning':zone>=4?'golden':'day';
 let back=outdoor({time,seed:i+1,trees:zone===0?[[845,480,.8,'apple',3]]:zone===3?[[830,530,1.2,'round',4]]:[],pond:zone===1,path:zone===2});
 const guests=[],word=p.learning?.word,letter=p.learning?.letter;
 let art='',px=180,py=640;
 if(letter){
  art+=letterCard(letter,letter.toLowerCase(),175,180)+plaque(word,570,650,46);
  if(['egg','fish','moon','nest'].includes(word))art+=easel(570,420,1.1,G(prop(word).art,{s:.9}));
  else if(word==='rabbit')art+=rabbit({x:560,y:578,s:1.25,armL:65,armR:30}).art;
  else if(word==='kite')art+=G(prop(word).art,{x:580,y:340,s:1.3});
  else {art+=zone===0?stump(570,570,1.2):zone===3?table(570,548,1):blanket(565,525,.72);art+=place(word,570,zone===0?475:zone===3?525:560,['quilt','wagon','x-ray','zip'].includes(word)?1.25:1.65);}
  if(word==='nest')back+=tree(820,490,.7,'round',6)+G(prop('nest').art,{x:820,y:285,s:.4});
  if(['B','G','Q','T','X'].includes(letter))guests.push(actor('mouse',mouse({x:790,y:640,s:.7,armL:65}),{idle:null,blink:true}));
 }else{
  art+=bunting(last?'A to Z — together!':'An alphabet party')+blanket(545,560,1)+basket(705,450,.8);
  art+=last?place('apple',430,550,.6)+place('cup',550,550,.6)+place('gift',650,550,.65):R(380,270,330,150,'#fff2d7',18,ink)+label('A B C',545,370,75);
  guests.push(actor('mouse',mouse({x:730,y:630,s:.9,armL:75}),{idle:null,blink:true}));
  if(last)art+=rabbit({x:520,y:470,s:.85,armR:80}).art;
 }
 return scene({...p,alt:letter?`${letter} ${letter.toLowerCase()} and ${word} on a large card and plaque. Pip ${['egg','fish','moon','nest'].includes(word)?'shows a drawn picture':'stands beside the learning object'}${guests.length?', with Mouse nearby':''}.`:p.alt,action,back:[back,art],cast:[actor('pip',pip({x:px,y:py,s:1.25,armR:65,look:[2,0]}),{wave:'R'}),...guests],movers:[zone%2?flutter('butterfly',825,210,'#d7b574'):drift('cloud',cloud(420,80,.4),{dx:25,ms:9000})]});
}
const a=books.find(b=>b.id==='pips-alphabet-adventure');
await writeBook({...a,scenes:a.pages.map(alphabetPage),cover:outdoor({time:'golden',trees:[[850,540,1,'apple',1]]})+bunting()+plaque('Pip’s Alphabet',450,110,58)+plaque('Adventure',450,230,62)+pip({x:400,y:665,s:1.65,armR:90}).art+mouse({x:680,y:650,s:1.15,armL:100}).art+G(letterCard('A','a',0,0),{x:190,y:405,s:.65})});

function picnicPage(p,i){const n=p.learning?.number;let back=outdoor({seed:i+20,plain:!!n,time:i===11?'golden':'morning',trees:n?[]:[[830,480,1,'round',1]]}),art='';
 if(n){art+=R(35,55,210,205,'#fff4d9',20,ink)+label(n,140,220,170)+plaque(`${n} ${n===1?'apple':p.learning.item}`,565,130,45)+R(285,235,545,375,'#f2dac3',20)+Array.from({length:7},(_,j)=>P(`M${310+j*80} 245V600`,'none','#dab7a8',9)).join('')+P('M295 305H820M295 390H820M295 475H820M295 560H820','none','#dab7a8',9);
 const kinds=['apple','cup','sandwich','carrot','napkin','spoon','orange','strawberry','leaf','flower'],cols=n===1?1:n===3?3:n===4?2:n===5?5:n===6?3:n===7||n===8?4:n===9?3:n===10?5:2,rows=Math.ceil(n/cols),scale=n<=4?1:n===5?.55:n<=8?.65:n===9?.65:.58;
 for(let j=0;j<n;j++){const row=Math.floor(j/cols),count=Math.min(cols,n-row*cols),x=555+(j%cols-(count-1)/2)*(cols===5?99:cols===4?120:150),ground=rows===1?470:rows===3?320+row*135:365+row*180;art+=`<g id="count-target-${j+1}">${place(kinds[n-1],x,ground,scale)}</g>`;}
 }else{art+=bunting(i?'Come and share':'A picnic to share')+blanket(530,535,1.05)+basket(390,470,.85);if(i){art+=pip({x:745,y:495,s:.9}).art+rabbit({x:500,y:465,s:.7}).art+bear({x:645,y:420,s:.65}).art+place('sandwich',520,580,.65)+place('cup',675,580,.55);}}
 return scene({...p,action:'Mouse points, blinks and swishes a tail. The counted set stays fixed; a small cloud drifts overhead.',back:[back,art],cast:[actor('mouse',mouse({x:145,y:650,s:1.25,armR:85}),{idle:null,wave:'R',tail:true})],movers:[drift('cloud',cloud(420,55,.45),{dx:25,ms:9000})]});}
const b=books.find(b=>b.id==='mouses-counting-picnic');await writeBook({...b,scenes:b.pages.map(picnicPage),cover:outdoor({time:'morning',trees:[[830,525,1,'round',2]]})+plaque('Mouse’s Counting',450,110,55)+plaque('Picnic',450,220,65)+blanket(550,565,1)+mouse({x:330,y:660,s:1.65,armR:90}).art+basket(650,585,1.2)+plaque('1 2 3',635,350,88)});
