import {teddy as toy} from './cast.mjs';
import {P,E,R,G,ink,gradient,shadow,fish,rabbit,bear,flower} from './art.mjs';
const group=(x,y,s,c)=>G(c,{x,y,s});
function object(kind){
 switch(kind){
 case 'apple':return P('M0 -35C-70 -70-72 28-35 53Q-13 69 0 55Q21 70 42 47C75 -2 47 -64 0 -35','#ce6e55')+P('M0 -36Q-8 -60 6 -73','none')+P('M3 -52Q18 -79 43 -59Q26 -42 3 -52','#7d9b66');
 case 'ball':return E(0,0,61,61,'#dfb65e','#624b43')+P('M-48 -38Q0 -20 48 -38M-48 38Q0 20 48 38M0 -61Q-35 0 0 61M0 -61Q35 0 0 61','none');
 case 'cup':return P('M38 -30Q93 -44 79 7Q70 27 40 20','none')+P('M-45 -43H45L36 48Q0 65-36 48Z','#78a9a2')+E(0,-43,45,12,'#cbe3d9','#624b43');
 case 'drum':return R(-60,-36,120,83,'#c4785c',8,'#624b43')+P('M-52 -24L-24 37 4 -24 31 37 54 -24','none')+E(0,42,60,14,'#d0a66f','#624b43')+E(0,-36,60,17,'#f5dfb5','#624b43')+P('M-47 -57L34 -86M15 -56L69 -88','none')+E(36,-87,9,9,'#e1ba7b')+E(70,-89,9,9,'#e1ba7b');
 case 'egg':return P('M0 -70C-26 -70-58 -13-53 22C-46 77 47 77 53 22C59 -13 26 -70 0 -70','#f9efd4');
 case 'fish':return fish(0,0,1);
 case 'gift':return R(-57,-35,114,97,'#cd8b77',5,'#624b43')+R(-65,-46,130,26,'#e4b562',5,'#624b43')+R(-10,-45,20,107,'#f2d991')+P('M0 -46Q-63 -114-51 -55Q-32 -37 0 -46Q63 -114 51 -55Q32 -37 0 -46','none');
 case 'hat':return E(0,39,86,22,'#dcb26e','#624b43')+P('M-52 35L-36 -56Q0 -78 36 -56L52 35Z','#e6c184')+P('M-48 10Q0 24 48 10','none');
 case 'insect':return P('M-6 -36L-32 -66M6 -36L32 -66M-22 -16L-54 -33M-25 5L-59 5M-21 24L-51 43M22 -16L54 -33M25 5L59 5M21 24L51 43','none')+E(0,-39,21,22,'#5f6660','#624b43')+E(0,10,36,48,'#cc7157','#624b43')+P('M0 -35V58','none')+E(-15,-5,8,8,'#5b5148')+E(16,15,8,8,'#5b5148')+E(-14,34,8,8,'#5b5148');
 case 'jug':return P('M34 -34Q92 -42 77 21Q64 45 36 28','none')+P('M-42 -61H38L27 -30Q63 41 29 62H-28Q-63 43-31 -26L-58 -45Z','#b0bd85')+P('M-32 13Q0 27 36 11','none');
 case 'kite':return P('M0 -84L58 -6 0 67-58 -6Z','#e4ad61')+P('M0 -84V67M-58 -6H58','none')+P('M0 67Q41 95 10 123Q-14 147 24 167','none')+P('M15 98L-6 87-5 112Z','#cb7865')+P('M18 137L41 124 44 146Z','#7c9c99');
 case 'leaf':return P('M-54 52Q-91 -35 53 -76Q81 53-54 52Z','#8da571')+P('M-67 70L44 -60M-38 35L-49 -12M-15 9L-19 -36M6 -15L40 -14','none');
 case 'moon':return P('M34 -72A77 77 0 1 0 42 68A66 66 0 0 1 34 -72','#efd697');
 case 'nest':return P('M-80 0Q0 -41 80 0L61 43Q0 77-61 43Z','#b18b61')+E(0,0,79,22,'#876e52','#624b43')+group(-20,-15,.35,object('egg'))+group(20,-15,.35,object('egg'))+P('M-69 10L53 38M-51 42L74 7M-61 28L57 53M-56 49L64 26','none');
 case 'orange':return E(0,7,61,61,'#e7a253','#624b43')+P('M-3 -53L3 -68','none')+P('M0 -57Q23 -89 48 -65Q27 -44 0 -57','#86a06d')+E(-25,-11,9,15,'#f4bf70');
 case 'paintbrush':return P('M-10 71L-6 -18H12L18 71Q4 91-10 71','#ca825b')+R(-13,-42,29,29,'#aec5bf',3,'#624b43')+P('M-13 -42Q-32 -77 6 -97Q0 -73 17 -66L16 -42Z','#826a53');
 case 'quilt':return R(-91,-70,182,145,'#eed9af',5,'#624b43')+Array.from({length:12},(_,i)=>R(-84+(i%4)*43,-63+Math.floor(i/4)*44,39,40,['#be7867','#8fa5a0','#dbb66f'][i%3],2)).join('');
 case 'rabbit':return rabbit(0,30,.68);
 case 'sock':return P('M-27 -77H25V12L63 27Q85 48 57 65Q41 75 21 61L-27 31Z','#cf9283')+P('M-27 -55H25M-27 -39H25M26 17L7 47','none');
 case 'teddy':return toy({x:0,y:80,s:.85}).art;
 case 'umbrella':return P('M-86 0Q0 -135 86 0Q61 -21 43 0Q21 -21 0 0Q-22 -21-43 0Q-65 -21-86 0Z','#87aaa6')+P('M0 -71V68Q-1 99-26 79M-43 0Q-44 -49 0 -71Q43 -48 43 0','none');
 case 'vase':return P('M-29 -68H29L20 -27Q74 58 34 72H-34Q-74 58-20 -27Z','#b991b1')+P('M-40 22Q0 40 40 22M-38 43Q0 57 38 43','none');
 case 'wagon':return R(-80,-30,160,65,'#bf7961',8,'#624b43')+P('M76 -9L127 -73H153','none')+E(-48,47,23,23,'#66736d','#624b43')+E(48,47,23,23,'#66736d','#624b43')+E(-48,47,8,8,'#dabf86')+E(48,47,8,8,'#dabf86');
 case 'x-ray':return R(-74,-90,148,178,'#435e69',9,'#624b43')+P('M-12 66L-12 21M12 66L12 21M-18 8L-31 -10-43 -29M-10 2L-24 -27-28 -57M0 0L-5 -37-5 -73M12 0L16 -33 19 -65M23 6L35 -20 41 -46','none','#bed8d2',8)+E(4,12,20,9,'none','#bed8d2',6)+E(-24,-27,5,5,'#435e69')+E(-5,-37,5,5,'#435e69')+E(16,-33,5,5,'#435e69')+E(35,-20,5,5,'#435e69');
 case 'yarn':return E(0,0,60,55,'#be879e','#624b43')+P('M-41 -35Q-11 -4 41 35M-52 -18Q-14 22 24 48M-25 -50Q15 -7 53 17M-49 27Q-6 5 13 -52M-29 46Q17 20 35 -40M55 17Q98 23 73 62Q50 91 103 93','none');
 case 'zip':return R(-57,-87,114,174,'#b4c3a0',10,'#624b43')+R(-10,-81,20,160,'#e8d19f')+Array.from({length:12},(_,i)=>R(i%2?-10:-2,-72+i*12,12,6,'#806e55')).join('')+R(-16,-33,32,46,'#d4b16a',8,'#624b43')+R(-6,-24,12,21,'#8c856d',4);
 case 'sandwich':return P('M-60 40L0 -55 63 40Z','#e2b87b')+P('M-54 28H56V40H-60Z','#85a067')+P('M-51 15L0 -64 57 15Z','#f4dba5');
 case 'carrot':return P('M-31 -42Q0 -65 31 -42L0 69Z','#df9a56')+P('M0 -48L-21 -81M0 -48L4 -89M0 -48L28 -78','none','#789562',8)+P('M-17 -12H5M-7 19H11','none');
 case 'napkin':return P('M-56 -47H56V47H-56Z','#d6a1a1')+P('M-45 -36H45V36H-45Z','none')+P('M-56 -47L56 47','none');
 case 'spoon':return E(0,-37,25,36,'#a6b9b5','#624b43')+R(-7,-6,14,83,'#bac9bf',7,'#624b43');
 case 'strawberry':return P('M-43 -29Q0 -61 43 -29Q50 3 0 58Q-50 3-43 -29','#c96c64')+P('M-36 -30L-12 -40 0 -66 14 -40 38 -30 12 -23 0 -36-14 -23Z','#7d9864')+[-20,0,20].map((x,i)=>E(x,-7+i*7,3,5,'#f6da9a')).join('')+E(-9,21,3,5,'#f6da9a')+E(10,29,3,5,'#f6da9a');
 case 'flower':return P('M0 0V64','none','#789562',5)+group(0,-12,3,flower(0,0,1));
 default: throw Error(kind);
 }
}

export function prop(kind){
 const bases={apple:65,ball:61,cup:55,drum:56,egg:63,fish:34,gift:62,hat:61,insect:58,jug:62,kite:167,leaf:70,moon:77,nest:61,orange:68,paintbrush:81,quilt:75,rabbit:87,sock:70,teddy:80,umbrella:90,vase:72,wagon:70,'x-ray':90,yarn:93,zip:87,sandwich:40,carrot:69,napkin:47,spoon:77,strawberry:58,flower:64};
 let art=object(kind);art=art.replace(/fill="(#[0-9a-f]{6})"/g,(all,c)=>{if(['#624b43','#5d473f','#393e3d','#372f30'].includes(c))return all;const shade='#'+[1,3,5].map(i=>Math.round(parseInt(c.slice(i,i+2),16)*.83).toString(16).padStart(2,'0')).join('');return `fill="${gradient('prop-'+c.slice(1),'linear',[[0,c],[.6,c],[1,shade]],{x2:1,y2:1})}"`;});
 return {art,base:bases[kind]};
}
export function place(kind,x,groundY,s=1){const p=prop(kind);return shadow(x,groundY,65*s)+G(p.art,{x,y:groundY-p.base*s,s});}
export const block=(x=0,y=0,size=60,colour='#508cb5')=>R(x,y,size,size,colour,4,ink)+P(`M${x} ${y}l10-10h${size}l-10 10 M${x+size} ${y}l10-10v${size}l-10 10`,'#b0cbd4')+P(`M${x+10} ${y+12}h${size-20}`,'none','#dce7db',3);
export const bucket=(full=false)=>P('M-60 -45L-45 65Q0 85 45 65L60 -45Z','#e4ba6e')+E(0,-45,60,17,full?'#d7bb87':'#735d4b',ink)+(full?P('M-55 -48Q-30 -105 5-75Q37-102 56-48Z','#e6cf9c'):'')+P('M-58 -33Q0 68 58-33','none',ink,5)+P('M-36 -15L-29 46','none','#f5d79c',9);
export const cart=()=>R(-85,-65,170,85,'#bc765d',9,ink)+P('M-70-45H70M-70-20H70','none','#e0a07b',4)+E(-52,38,27,27,'#617b80',ink)+E(52,38,27,27,'#617b80',ink)+E(-52,38,9,9,'#e6bd78')+E(52,38,9,9,'#e6bd78')+P('M85-40L135-90','none',ink,7);
export function woodShape(kind,x,y,size,colour='#dfbc7e'){
 const shapes={circle:()=>`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${colour}" stroke="${ink}" stroke-width="4"/>`,square:()=>R(x-size/2,y-size/2,size,size,colour,0,ink),rectangle:()=>R(x-size*.7,y-size*.4,size*1.4,size*.8,colour,0,ink),triangle:()=>P(`M${x} ${y-size/2}L${x+size/2} ${y+size/2}H${x-size/2}Z`,colour)};
 if(!shapes[kind])throw Error(kind);return shapes[kind]();
}
