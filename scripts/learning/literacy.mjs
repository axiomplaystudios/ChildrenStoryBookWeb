import {writeBook} from './package.mjs';
import {path,ellipse,rect,group,label,owl,owlWing,m,mouseTail,mouseBody,mouseHead,mousePaw,rabbit,bear,meadow,flower,twig,fish,layer,track} from './art.mjs';

// All learning objects remain in the static artwork; only the friends move.
const P=(...args)=>path(...args), E=ellipse, R=rect;
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
 case 'teddy':return bear(0,-5,.65);
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
 default: throw Error(kind);
 }
}
const garden=(variant=0)=>meadow(['#dcebe1','#e8e6d1','#dce8ea'][variant%3])+P('M0 672Q230 541 430 651T900 636V720H0Z','#d6bc8c')+twig(40,525,1.1)+twig(837,564,1.2)+flower(802,610,1.5);
const banner=(text)=>P('M55 83Q450 136 845 83','none')+[90,210,330,450,570,690,810].map((x,i)=>P(`M${x} 91l35 5-19 40Z`,['#ce9278','#a3b08a','#e0bc71'][i%3])).join('')+label(text,450,65,35);
const pipScene=(text,alt,bg,x=180,y=533,learning)=>({text,alt,bg:bg+owl(x,y,.86),layers:[layer('pip-wing',owlWing(x,y,.86),[x-46,y-22])],tracks:[track('pip-wing','flap',{angle:12},2400,500)],action:'Pip gently lifts and lowers a wing beside the stationary learning picture.',...(learning?{learning}:{})});
const letterWords=['apple','ball','cup','drum','egg','fish','gift','hat','insect','jug','kite','leaf','moon','nest','orange','paintbrush','quilt','rabbit','sock','teddy','umbrella','vase','wagon','x-ray','yarn','zip'];
const phrases=[
 'Pip found an apple for the feast.', 'Mouse rolled a ball for their games.', 'Pip chose a cup for a thirsty friend.', 'A drum would call everyone together.', 'Pip drew an egg on a little card.', 'By the pond, Pip drew a fish.', 'Mouse wrapped a gift for the guests.', 'Pip borrowed a sunny yellow hat.', 'An insect landed nearby. Pip drew its six legs.', 'A jug would hold cool water.', 'Pip chose a kite for the breezy field.', 'A leaf made a lovely table decoration.', 'Pip made a moon picture for the evening.', 'Pip drew a nest and left the real one safe.', 'An orange joined the picnic food.', 'A paintbrush helped Pip finish the pictures.', 'Mouse brought a quilt for everyone to sit on.', 'Rabbit came along to help.', 'A clean sock became a silly puppet.', 'Mouse brought a teddy to join the fun.', 'An umbrella would give a patch of shade.', 'Pip found a vase for the table.', 'A wagon carried the party things.', 'Mouse brought an x-ray picture showing bones.', 'Yarn tied the picture cards together.', 'Pip closed the bag with its zip.'
];
const alphabet=[pipScene('Pip wanted an alphabet party. “Let’s find a thing or a picture for every letter!”','Pip the owl and Mouse prepare an empty display board for their alphabet party.',garden()+banner('Pip’s alphabet party')+R(340,205,410,268,'#f4e5c5',18,'#9c8464')+label('A B C ...',545,353,47)+m(695,586,.8))];
for(let i=0;i<26;i++){
 const l=String.fromCharCode(65+i),word=letterWords[i],side=i%3;
 let bg=garden(i)+label(`${l} ${l.toLowerCase()}`,155,175,88)+label(word,555,620,41);
 if(side===0)bg+=R(340,245,430,290,'#f2dec0',18,'#ad9473')+group(550,397,1.6,object(word));
 if(side===1)bg+=P('M327 539L354 330 750 330 784 539Z','#efdcb7')+P('M360 540V608M744 540V608','none')+group(554,word==='kite'?370:413,word==='kite'?1.1:1.5,object(word));
 if(side===2)bg+=E(555,505,230,54,'#b5c49b')+group(555,389,1.65,object(word));
 alphabet.push(pipScene(`${l} ${l.toLowerCase()} — ${word}. ${phrases[i]}`,`Uppercase ${l}, lowercase ${l.toLowerCase()}, and a clearly pictured ${word}. Pip collects things and picture cards for the alphabet party.`,bg,155,538,{letter:l,word}));
}
alphabet.push(pipScene('The alphabet party was ready, from A to Z. “We can visit our favourite letters again,” said Pip.','Pip, Mouse and Rabbit celebrate under alphabet bunting, with a quilt, food and the picture cards.',garden()+banner('A to Z — together!')+group(470,515,1.8,object('quilt'))+m(713,511,.8)+rabbit(597,428,.65)+group(420,463,.55,object('apple'))+group(498,471,.55,object('cup'))+R(320,207,380,100,'#f5e8cc',10)+label('A a     M m     Z z',510,273,38),175,497));
await writeBook({id:'pips-alphabet-adventure',title:'Pip’s Alphabet Adventure',subtitle:'An A-to-Z party of things and pictures',learningTopic:'Alphabet recognition',scenes:alphabet,questions:[{type:'literal',q:'What was Pip getting ready for?',a:'An alphabet party.',hintPage:1},{type:'literal',q:'What carried the party things?',a:'A wagon carried the party things.',hintPage:24},{type:'feeling',q:'How might Pip feel when the party is ready?',a:'Pip might feel happy, proud or excited. Other ideas are welcome.',hintPage:28},{type:'personal',q:'Which thing or picture would you bring to an alphabet party?',a:'Any idea is welcome. You can name its first letter together if you like.',hintPage:28}],references:['https://www.cdc.gov/act-early/milestones/4-years.html'],notes:'CDC shared-reading and familiar-object counting guidance informed playful adult conversation; this is not a milestone checklist. Letters are named and recognised, not presented as a phonics sequence. X uses x-ray without an initial /ks/ claim. Some finds are explicitly pictures; wildlife stays in place. Split this longer book across sittings if desired. Each letter scene has one large upper/lower pair and one corresponding picture. No assessment or mastery expectation. All learning artwork is static during the wing animation.'});

const mouseScene=(text,alt,bg,learning)=>({text,alt,bg:bg+group(139,580,.8,mouseBody()+mouseHead()+mousePaw()),layers:[layer('mouse-tail',group(139,580,.8,mouseTail()),[100,614])],tracks:[track('mouse-tail','flap',{angle:11},2900,600)],action:'Mouse swishes a tail while all counted objects stay fixed, separated and visible.',...(learning?{learning}:{})});
const picnic=[mouseScene('Mouse invited the friends to a picnic. “I’ll count as I pack, so there is plenty to share.”','Mouse stands beside a picnic basket and an empty quilt, ready to pack for friends.',garden()+banner('A picnic to share')+group(548,480,2,object('quilt'))+P('M302 406Q312 312 362 312Q412 312 424 406','none')+P('M293 401H435L417 497H310Z','#b69266')+P('M301 424H431M306 446H425M310 469H422','none'))];
const items=[['apple','apple','apples'],['cup','cups','cups'],['sandwich','sandwiches','sandwiches'],['carrot','carrots','carrots'],['napkin','napkins','napkins'],['spoon','spoons','spoons'],['orange','oranges','oranges'],['strawberry','strawberries','strawberries'],['leaf','leaves','leaves'],['flower','flowers','flowers']];
const countTexts=['One apple to slice and share. Mouse began with 1.','2 cups for pouring water. Mouse touched each cup once.','3 sandwiches for the plate. Mouse counted, “One, two, three.”','4 carrots for a crunchy snack. Rabbit would be pleased.','5 napkins to wipe sticky paws. Mouse laid them in a row.','6 spoons for the picnic basket. Mouse counted them one by one.','7 oranges for the friends to share. The picnic was growing!','8 strawberries, bright and red. Mouse checked the count again.','9 leaves to decorate the quilt. Mouse left space between them.','10 flowers for the picnic table. “Everything is ready!” said Mouse.'];
for(let n=1;n<=10;n++){
 const [kind,shown,plural]=items[n-1];let bg=meadow()+P('M0 672Q230 541 430 651T900 636V720H0Z','#d6bc8c')+label(`${n}`,145,190,106)+label(`${n} ${shown}`,552,126,42);
 bg+=R(279,192,548,420,n%2?'#f3e3c5':'#e9d2bb',25,'#bd9a78');
 const cols=n<=4?2:n===5?5:n<=6?3:n<=8?4:5,rows=Math.ceil(n/cols),scale=n<=4?.88:n===5?.52:n<=8?.65:.58;
 for(let j=0;j<n;j++){const row=Math.floor(j/cols),rowCount=Math.min(cols,n-row*cols),x=553+(j%cols-(rowCount-1)/2)*(n===5?99:n<=4?225:n<=6?160:102),y=rows===1?400:310+row*183;
 const art=kind==='flower'?P('M0 0V64','none','#789562',5)+group(0,-12,3,flower(0,0,1))+P('M0 39Q-39 17-27 4Q0 10 0 39','#90a875'):object(kind);
 bg+=`<g id="count-target-${j+1}">${group(x,y,scale,art)}</g>`;
 }
 picnic.push(mouseScene(countTexts[n-1],`Numeral ${n} and exactly ${n} separate ${plural} on the packing mat. Mouse counts beside them.`,bg,{number:n,item:plural}));
}
picnic.push(mouseScene('The friends gathered on the quilt. “Counting helped me get ready,” said Mouse. “Now we can share!”','Mouse, Pip, Rabbit and Bear gather around the picnic quilt with packed food to share.',garden()+banner('Come and share')+group(498,522,2.3,object('quilt'))+owl(726,483,.68)+rabbit(350,390,.65)+bear(579,372,.65)+group(446,527,.7,object('sandwich'))+group(570,525,.65,object('apple'))+group(653,557,.5,object('cup'))));
await writeBook({id:'mouses-counting-picnic',title:'Mouse’s Counting Picnic',subtitle:'One, two, three — enough to share',learningTopic:'Counting 1–10',scenes:picnic,questions:[{type:'literal',q:'How many apples did Mouse pack?',a:'Mouse packed one apple to slice and share.',hintPage:2},{type:'literal',q:'What did Mouse count ten of?',a:'Mouse counted ten flowers.',hintPage:11},{type:'feeling',q:'How might Mouse feel when the friends arrive?',a:'Mouse might feel happy or excited to share. Other ideas are welcome.',hintPage:12},{type:'personal',q:'What would you like to bring to a picnic?',a:'Any picnic idea is welcome. You could count a few real objects together.',hintPage:12}],references:['https://www.cdc.gov/act-early/milestones/4-years.html'],notes:'CDC guidance supports counting familiar objects with an adult. Quantities 1–10 are invitations to explore, not required mastery. Count scenes show quantities 1–10 independently, with no pictured surplus of the target item. Each visible target is wrapped in a unique count-target-N group. Sets stay still during animation. Encourage touching each object once and saying the total; do not require answers. The final shared picnic is a story scene, not a counted set.'});
