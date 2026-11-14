import {P,E,R,G,ink,palette,gradient,define,use,random,shadow,label,labelWidth,layer,track} from './art.mjs';
const colours={morning:['#dce9df','#fff1cf','#e7b76b'],day:['#cce5e6','#f8edd5','#f2d18b'],golden:['#f6dab2','#fae9c6','#edb264'],dusk:['#c6b8d0','#edcdbd','#f4d9a3'],night:['#243b58','#607e91','#f3e4bd']};
export const sun=(x=755,y=130,s=1)=>G(E(0,0,64,64,'#f3d28a')+E(-13,-13,38,38,'#f7dca1'),{x,y,s});
export const moon=(x=755,y=130,s=1)=>G(P('M28-62A66 66 0 1 0 32 60A57 57 0 0 1 28-62','#f3e4bd','none'),{x,y,s});
export const cloud=(x=0,y=0,s=1)=>G(E(-45,0,53,24,'#fff5df')+E(0,-17,53,40,'#fff5df')+E(48,1,49,24,'#fff5df'),{x,y,s});
export function starfield(seed=1,count=25){const rand=random(seed);return Array.from({length:count},()=>{const x=30+rand()*840,y=25+rand()*625;return P(`M${x-3} ${y}h6M${x} ${y-3}v6`,'none','#f8e7bd',2);}).join('');}
define('flower',Array.from({length:5},(_,i)=>G(E(0,-9,5,9,'#d8b29c'),{rot:i*72})).join('')+E(0,0,4,4,'#e8c98b'));
define('sprig',P('M0 24Q6 0 0-16','none','#84936c',3)+E(-7,0,8,4,'#9dac7e')+E(8,11,8,4,'#9dac7e'));
define('fruit',E(0,0,12,13,'#bf7762')+P('M0-12l4-7','none','#785b47',2));
export function tree(x,y,s=1,kind='round',seed=1){const rand=random(seed);let canopy=kind==='pine'?P('M0-330L-115-100H-72L-130-30H130L72-100H115Z','#6e8b75','none'):E(0,-210,124,115,'#a0af80')+E(-75,-167,80,80,'#8ea476')+E(77,-173,78,83,'#b1bb88');if(['apple','plum'].includes(kind))canopy+=Array.from({length:5},()=>kind==='apple'?use('fruit',-75+rand()*150,-140-rand()*120):E(-75+rand()*150,-140-rand()*120,11,14,'#92748f')).join('');return G(P('M-23 0L-14-240H18L29 0Z','#aa8564','none')+canopy+P('M0-12L-3-147M-3-115L-38-153','none','#d4b58b',5),{x,y,s});}
export const bush=(x,y,s=1)=>G(E(-40,0,62,40,'#9dab7d')+E(25,-15,70,55,'#a8b687'),{x,y,s});
export const fence=(y=465)=>Array.from({length:12},(_,i)=>R(i*80,y-120,22,140,'#d3bc91',8)).join('')+R(0,y-88,900,17,'#ddc9a4')+R(0,y-35,900,17,'#ddc9a4');
export const pond=(x=610,y=510,s=1)=>G(E(0,0,228,76,'#b0cbb7')+E(0,-5,203,62,'#9fc5c7')+P('M-130-8Q-30-30 90-7M-80 22Q10 3 140 23','none','#dce8d8',5),{x,y,s});
export function outdoor({time='day',seed=1,plain=false,trees=[],pond:water=false,path:walk=false,fence:rail=false,far=true}={}){
 const c=colours[time],rand=random(seed),sky=gradient(`sky-${time}`,'linear',[[0,c[0]],[1,c[1]]],{x2:0,y2:1});
 let art=R(0,0,900,720,sky)+(time==='night'?moon():sun())+cloud(180+rand()*100,120,.8)+cloud(570,190,.5);
 art+=(far?P('M0 408Q150 300 350 400T900 358V720H0Z','#c5ceb0','none'):'')+P('M0 470Q220 370 450 455T900 420V720H0Z','#acbc91','none')+P('M0 565Q220 500 510 560T900 520V720H0Z','#97ad7f','none');
 if(walk)art+=P('M530 430Q360 530 590 720H900Q480 530 570 430Z','#d9c39b','none');if(rail)art+=fence();
 for(const t of trees)art+=tree(...t);if(water)art+=pond();
 if(!plain)art+=Array.from({length:12},(_,i)=>use(i%3?'sprig':'flower',20+rand()*860,550+rand()*145,.6+rand()*.4)).join('');
 return art;
}
export const plaque=(text,x,y,size=40,{fill=ink}={})=>{const w=labelWidth(text,size)+44;return R(x-w/2,y-size-17,w,size+35,'#dfc79e',13)+R(x-w/2,y-size-22,w,size+35,'#fff0d2',13)+label(text,x,y,size,{fill});};
export const letterCard=(upper,lower,x,y)=>R(x-135,y-125,270,165,'#fff6df',18,ink)+label(`${upper} ${lower}`,x,y,110);
export const easel=(x,y,s,picture)=>G(P('M-120 160L-65-160M120 160L65-160M-95 80H95','none','#a78159',12)+R(-125,-145,250,240,'#fff4dc',8,ink)+picture,{x,y,s});
export const stump=(x,y,s=1)=>G(R(-95,-90,190,100,'#b48b62',12)+E(0,-87,96,25,'#e3c396')+E(0,-87,65,16,'none','#b48b62',3)+P('M-65-60v55M-25-60v60M45-60v55','none','#8d6d51',4),{x,y,s});
export const table=(x,y,s=1)=>G(R(-170,-20,340,30,'#bc9269',8)+P('M-135 5L-145 145M135 5L145 145','none','#ae805c',18),{x,y,s});
export const blanket=(x=540,y=520,s=1)=>G(P('M-245-110H235L290 110H-285Z','#f2dac3','none')+Array.from({length:7},(_,i)=>P(`M${-210+i*70}-100v200`,'none','#dab7a8',12)).join('')+P('M-250-45H245M-270 30H268M-280 95H280','none','#dab7a8',12),{x,y,s});
export const basket=(x,y,s=1)=>G(P('M-70-65Q-70-170 0-170Q70-170 70-65','none','#98724f',12)+P('M-85-70H85L65 25H-65Z','#bd9665')+P('M-74-45H74M-70-20H70M-45-65v80M0-65v85M45-65v80','none','#dfba83',6)+E(0,-70,85,17,'#785f48'),{x,y,s});
export const rug=(x=450,y=600)=>E(x,y,330,83,'#c68e77')+E(x,y,302,66,'none','#f2d1a1',6);
export const shelf=(x,y,s=1)=>G(R(-120,-180,240,190,'#bf996f',8)+R(-105,-162,210,66,'#927358')+R(-105,-80,210,69,'#927358')+[-75,-40,2,43,77].map((v,i)=>R(v,-148,25,50,['#b86d5c','#9cad86','#d9b269'][i%3],3)).join(''),{x,y,s});
export const lamp=(x,y,s=1)=>G(P('M0-100V10','none','#9e7a54',8)+E(0,10,43,12,'#b99467')+P('M-34-180H34L65-95H-65Z','#e9c88a','none'),{x,y,s});
export const toyBox=(x,y,s=1)=>G(R(-110,-95,220,110,'#b5c0a0',9,ink)+R(-117,-110,234,22,'#d1d8bb',6,ink)+R(-24,-53,48,12,'#7a8d78',5),{x,y,s});
export const openBox=toyBox;
export const stool=(x,y,s=1)=>G(P('M-50-10L-62 110M50-10L62 110','none','#a5805e',16)+E(0,-15,76,22,'#d6b68a',ink),{x,y,s});
export const bunting=(text='')=>P('M30 50Q450 170 870 50','none','#b19672',3)+[100,230,360,490,620,750].map((x,i)=>P(`M${x} ${75+Math.sin(i/5*Math.PI)*35}l46 5-22 46Z`,['#c18c78','#a9b88d','#dfc07f'][i%3],'none')).join('')+(text?plaque(text,450,205,36):'');
export const gardenBed=(x,y,s=1)=>G(E(0,0,160,35,'#b89c77')+P('M-150 10Q0 60 150 10','none','#d7bf94',12),{x,y,s});
export function indoor({seed=1,wall='#f3e3c6',window=true,items=[]}={}){let art=R(0,0,900,720,wall)+Array.from({length:16},(_,i)=>P(`M${i*60} 0V500`,'none','#e6d4b4',2)).join('')+R(0,500,900,220,'#d3b089')+R(0,477,900,25,'#fcf0da')+P('M0 560H900M0 635H900M190 500V560M620 560V635M340 635V720','none','#bb956f',3);if(window)art+=R(55+seed%3*12,65,205,280,'#c09a6a',94)+R(68+seed%3*12,78,179,252,'#b7cfd1',82)+P('M158 80V330M70 204H247','none','#fff0cf',8);return art+items.join('');}
const moving=(id,art,pivot,preset,params,ms=8000,delay=0)=>({layers:[layer(id,art,pivot)],tracks:[track(id,preset,params,ms,500,delay)]});
export const drift=(id,art,{dx=30,ms=9000}={})=>moving(id,art,[450,360],'gesture',{x:dx,y:0,angle:0},ms);
export const flutter=(id,x,y,colour,{rx=15,ry=9,ms=7000}={})=>moving(id,G(E(-8,0,9,14,colour)+E(8,0,9,14,colour)+P('M0-10v20','none',ink,3),{x,y}),[x,y],'bee-flight',{radiusX:rx,radiusY:ry,phase:0},ms);
export const twinkle=(id,art,{ms=8000,delay=0}={})=>moving(id,art,[450,360],'fade-in',{},ms,delay);
export const sway=(id,art,pivot,{angle=5,ms=8000}={})=>moving(id,art,pivot,'gesture',{x:0,y:0,angle},ms);
export const fall=(id,art,{distance=30,ms=8000}={})=>moving(id,art,[450,360],'tear-fall',{distanceY:distance},ms);
