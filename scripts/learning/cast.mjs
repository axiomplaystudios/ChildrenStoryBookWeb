import {P,E,G,ink,palette,gradient,shadow,layer,track} from './art.mjs';

function character(kind,o={}){
 const {x=450,y=600,s=1,armL=0,armR=0,look=[0,0],eyes='open',mouth='smile',brows,tail='R',holdL='',holdR='',lean=0,sit=false,tear=false}=o;
 const owl=kind==='pip',rabbit=kind==='rabbit',mouse=kind==='mouse',toy=kind==='teddy';
 const k=(kind==='bear'?1.4:toy?.8:1)*s;
 const base=palette[kind]??'#cba25d';const fur=gradient(`fur-${kind}`,'linear',[[0,base],[.55,base],[1,kind==='rabbit'?'#d0bea4':kind==='mouse'?'#95857d':kind==='pip'?'#94663f':'#926341']],{x1:0,y1:0,x2:1,y2:1}),light=mouse?'#ded0c6':owl?'#f5dfac':rabbit?'#fff6e0':'#e3bf87';
 const wrap=art=>G(art,{x,y,s:k,rot:lean});
 const point=([px,py])=>{const r=lean*Math.PI/180;return [x+k*(px*Math.cos(r)-py*Math.sin(r)),y+k*(px*Math.sin(r)+py*Math.cos(r))];};
 const headY=sit?-133:-158,bodyY=sit?-48:-66;
 const ears=rabbit?E(-31,headY-66,19,62,fur,ink)+E(31,headY-66,19,62,fur,ink)+E(-31,headY-69,9,44,palette.rose)+E(31,headY-69,9,44,palette.rose):owl?P(`M-54 ${headY-13}L-64 ${headY-65} -19 ${headY-39}M54 ${headY-13}L64 ${headY-65} 19 ${headY-39}`,fur):E(-48,headY-40,29,29,fur,ink)+E(48,headY-40,29,29,fur,ink)+E(-48,headY-40,18,18,palette.rose)+E(48,headY-40,18,18,palette.rose);
 const eye=(ex)=>eyes==='closed'||eyes==='happy'?P(`M${ex-10} ${headY-2}q10 ${eyes==='happy'?-13:10} 20 0`,'none',ink,4):E(ex,headY-5,eyes==='wide'?12:9,eyes==='wide'?17:13,ink)+E(ex-3+look[0],headY-10+look[1],3.7,4.5,'#fff')+E(ex+3,headY,1.8,2,'#fff');
 const brow=(ex,side)=>{const heights={sad:[-28,-35],worried:[-28,-39],angry:[-39,-27],up:[-40,-40]};const h=heights[brows];return h?P(`M${ex-12} ${headY+h[side?1:0]}Q${ex} ${headY-40} ${ex+12} ${headY+h[side?0:1]}`,'none',ink,4):'';};
 const mouths={smile:'M-13 0Q0 16 13 0',grin:'M-18 0Q0 9 18 0Q13 29 0 25Q-13 29-18 0Z',o:'M-9 8a9 13 0 1 0 18 0a9 13 0 1 0-18 0',sad:'M-13 10Q0 -4 13 10',flat:'M-12 7H12',wavy:'M-16 6Q-8 -1 0 6T16 6'};
 const face=E(0,headY,65,57,fur,ink)+E(-34,headY+19,13,8,palette.rose)+E(34,headY+19,13,8,palette.rose)+(owl?E(-28,headY-6,29,34,light)+E(28,headY-6,29,34,light):E(0,headY+24,29,21,light))+eye(-25)+eye(25)+brow(-25,0)+brow(25,1)+(owl?P(`M-10 ${headY+10}L0 ${headY+25} 10 ${headY+10}Z`,'#dfa451'):E(0,headY+14,8,6,ink))+G(P(mouths[mouth]??mouths.smile,['grin','o'].includes(mouth)?'#81514c':'none',ink,3),{y:headY+24})+(tear?P(`M-40 ${headY+23}q-14 20 0 23q14-3 0-23`,'#8dc6d1','none'):'');
 const feet=E(-32,-10,26,13,fur,ink)+E(32,-10,26,13,fur,ink);
 const body=E(0,bodyY,49,sit?45:65,fur,ink)+E(0,bodyY+8,32,sit?29:45,light)+feet+face+(mouse?P(`M-47 ${headY+43}Q0 ${headY+72} 46 ${headY+42}L43 ${headY+57}Q0 ${headY+82}-46 ${headY+58}Z`,'#bd4d45')+P(`M10 ${headY+66}l5 42 20-13-14-32`,'#d66251'):toy?P(`M0 ${headY+60}l-24-11v23Z M0 ${headY+60}l24-11v23Z`,'#c3544b')+P(`M0 ${bodyY-8}v35m-6-25h12m-12 10h12m-12 10h12`,'none',ink,2):'');
 function arm(side,angle,held){const sign=side==='L'?-1:1,px=sign*43,py=bodyY-30;const a=-sign*angle;return G(P(owl?'M0 -5Q35 10 15 65Q-9 62-12 23Z':'M0 -9Q22-7 20 14L15 48Q2 65-11 48L-14 14Q-15-4 0-9Z',fur)+E(1,42,10,13,light,'none'),{x:px,y:py,rot:a})+G(held,{x:px+sign*48*Math.sin(angle*Math.PI/180),y:py+48*Math.cos(angle*Math.PI/180)});}
 const tailArt=mouse?P(`M${tail==='L'?-40:40} -24C${tail==='L'?-130:130} 5 ${tail==='L'?-128:128} -70 ${tail==='L'?-93:93} -49`,'none',palette.rose,9):rabbit?E(49,-35,21,21,'#fff9e9',ink):'';
 const lids=[-25,25].map(ex=>E(ex,headY-5,14,20,owl?light:fur)+P(`M${ex-10} ${headY}q10 8 20 0`,'none',ink,3)).join('');
 const parts={tail:wrap(tailArt),ears:wrap(ears),body:wrap(body),armL:wrap(arm('L',armL,holdL)),armR:wrap(arm('R',armR,holdR)),lids:wrap(lids)};
 return {art:parts.tail+parts.ears+parts.body+parts.armL+parts.armR,shadow:shadow(x,y+3,61*k),parts,pivots:{tail:point([tail==='L'?-40:40,-24]),earL:point([-31,headY-25]),earR:point([31,headY-25]),armL:point([-43,bodyY-30]),armR:point([43,bodyY-30]),feet:point([0,0])},hand(side){const sign=side==='L'?-1:1,a=(side==='L'?armL:armR)*Math.PI/180;return point([sign*(43+48*Math.sin(a)),bodyY-30+48*Math.cos(a)]);},top:y+k*(headY-(rabbit?128:69))};
}
export const mouse=o=>character('mouse',o),pip=o=>character('pip',o),rabbit=o=>character('rabbit',o),bear=o=>character('bear',o),teddy=o=>character('teddy',o);
export function actor(id,c,{idle='breathe',wave,tail=false,ears=false,blink=true,delay=0}={}){
 const layers=[],tracks=[],p=c.parts;
 const add=(suffix,art,pivot,preset,params,ms,rest=400,parent,hidden=false)=>{const name=id+suffix;layers.push({...layer(name,art,pivot,parent),...(hidden?{restHidden:true}:{})});if(preset)tracks.push(track(name,preset,params,ms,rest,delay));};
 if(tail)add('-tail',p.tail,c.pivots.tail,'gesture',{x:0,y:0,angle:8},2800);
 if(ears)add('-ears',p.ears,c.pivots.earL,'gesture',{x:0,y:0,angle:3},2800);
 const body=(!tail?p.tail:'')+(!ears?p.ears:'')+p.body+(wave!=='L'?p.armL:'')+(wave!=='R'?p.armR:'');
 add('',body,c.pivots.feet,idle==='breathe'?'breathe':idle==='bob'?'gesture':null,idle==='breathe'?{amount:.025}:{x:0,y:-7,angle:0},3000);
 if(wave)add('-arm',p['arm'+wave],c.pivots['arm'+wave],'gesture',{x:0,y:0,angle:wave==='L'?12:-12},2400,400,id);
 if(blink)add('-lids',p.lids,c.pivots.feet,'blink',{},700,1600,id,true);
 return {shadow:c.shadow,layers,tracks};
}
