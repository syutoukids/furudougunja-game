import * as THREE from './vendor/three.module.js';

const $ = s => document.querySelector(s);
const clamp = THREE.MathUtils.clamp;
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const rand = (a,b) => a + Math.random()*(b-a);
const CARD_KEY = 'furudou-hunt-collection-v1';
const cards = [
  {id:'chair',name:'受け継がれた椅子',rarity:'MEMORY / 守る',skill:'椅子の守り',desc:'6秒間、受けるダメージを65%軽減。踏ん張って反撃しよう。',memory:'何度も直され、誰かを支えてきた。',color:0x9ee0ba,cooldown:18},
  {id:'record',name:'夕暮れのレコード',rarity:'MEMORY / 響く',skill:'レコードウェーブ',desc:'周囲に音の波を放ち、怪人をひるませる。囲まれた時に。',memory:'針を落とすまでの時間も、音楽の一部。',color:0xecc25d,cooldown:14},
  {id:'clock',name:'三時の置き時計',rarity:'RARE MEMORY / 刻む',skill:'時計のひと休み',desc:'5秒間、近くの怪人の動きがゆっくりになる。反撃の好機。',memory:'毎日三時。暮らしの小さな約束を刻んだ。',color:0x91c9f2,cooldown:22}
];
let save = {counts:{},equipped:null};
try {const raw=JSON.parse(localStorage.getItem(CARD_KEY));if(raw&&typeof raw.counts==='object'){for(const c of cards)save.counts[c.id]=clamp(Number(raw.counts[c.id])||0,0,999);if(cards.some(c=>c.id===raw.equipped)&&save.counts[raw.equipped])save.equipped=raw.equipped;}} catch {}
function persist(){try{localStorage.setItem(CARD_KEY,JSON.stringify(save));}catch{toast('この環境では記録できないため、コレクションは今回限りです。');}}

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('#world'),antialias:true,powerPreference:'high-performance'});}catch(e){$('#error').hidden=false;$('#error').textContent='3D表示を開始できませんでした。WebGL対応のEdgeまたはChromeで開いてください。';$('#loading').hidden=true;throw e;}
const touchDevice=matchMedia('(pointer:coarse)').matches;
const touchLayout=()=>touchDevice||innerWidth<760;
renderer.setPixelRatio(Math.min(devicePixelRatio,touchDevice?1.2:1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9baeb0);scene.fog=new THREE.FogExp2(0xb9b7a0,.021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,110);
scene.add(new THREE.HemisphereLight(0xd8edff,0x544633,2));
const sun=new THREE.DirectionalLight(0xffd496,3.8);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(touchDevice?1024:2048,touchDevice?1024:2048);sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
const fill=new THREE.DirectionalLight(0xa0cce9,1.2);fill.position.set(14,8,-12);scene.add(fill);
const materials=new Map();
function mat(color,metal=0,rough=.8){const key=[color,metal,rough].join();if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(key);}
function mesh(geo,material,parent=scene,x=0,y=0,z=0){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,color,parent=scene,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),typeof color==='number'?mat(color):color,parent,x,y,z);}
function sphere(w,h,d,color,parent,x,y,z){const o=mesh(new THREE.SphereGeometry(1,20,14),typeof color==='number'?mat(color):color,parent,x,y,z);o.scale.set(w,h,d);return o;}
function cylinder(r1,r2,h,color,parent,x,y,z,n=16){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),typeof color==='number'?mat(color):color,parent,x,y,z);}
function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function textTexture(text,bg='#294039',fg='#ecd9a3'){return texture((g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(13,13,w-26,h-26);g.font='bold 52px "Yu Gothic",sans-serif';g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2,w-50);},512,128);}
function board(text,w,h,parent,x,y,z,bg){return mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:textTexture(text,bg),roughness:.85}),parent,x,y,z);}

// Geometry is deliberately stylized. Clothing follows the visible reference;
// this is a provisional likeness, not a scanned or finished character model.
function createRed(){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);scene.add(root);
 const red=mat(0xc8302c,0,.62),white=mat(0xe9e6cf,0,.75),skin=mat(0xc79672,0,.8),hair=mat(0x14171a,0,.96);
 sphere(.33,.4,.21,red,body,0,1.2,0);sphere(.28,.19,.19,red,body,0,.91,0);
 cylinder(.113,.135,.2,skin,body,0,1.65,0);
 const chestTex=texture((g,w,h)=>{g.fillStyle='#c8302c';g.fillRect(0,0,w,h);g.fillStyle='#eee9d7';g.beginPath();g.moveTo(0,0);g.lineTo(w*.5,h*.65);g.lineTo(w,0);g.lineTo(w,h*.31);g.lineTo(w*.5,h*.93);g.lineTo(0,h*.31);g.fill();g.fillStyle='#191e21';g.beginPath();g.moveTo(w*.3,h*.3);g.lineTo(w*.39,h*.08);g.lineTo(w*.46,h*.28);g.lineTo(w*.53,h*.07);g.lineTo(w*.67,h*.4);g.lineTo(w*.55,h*.29);g.lineTo(w*.5,h*.42);g.lineTo(w*.43,h*.31);g.lineTo(w*.35,h*.42);g.closePath();g.fill();});
 mesh(new THREE.PlaneGeometry(.58,.61),new THREE.MeshStandardMaterial({map:chestTex,side:THREE.DoubleSide}),body,0,1.29,.204);
 const back=box(.56,.12,.04,white,body,0,1.42,-.185);back.rotation.z=.03;
 cylinder(.287,.287,.105,white,body,0,.91,0);
 box(.16,.125,.06,mat(0xc4a055,.65,.3),body,0,.92,.28);board('F',.085,.08,body,0,.922,.314,'#806239');
 const head=new THREE.Group();head.position.set(0,1.92,0);body.add(head);
 sphere(.24,.29,.224,skin,head,0,0,0);sphere(.202,.17,.187,skin,head,0,-.13,.026);
 for(const s of [-1,1]){sphere(.047,.082,.036,skin,head,s*.235,-.01,0);sphere(.065,.022,.016,0xe8ded0,head,s*.089,.012,.212);sphere(.020,.022,.012,0x302c27,head,s*.087,.013,.23);sphere(.009,.01,.008,0x131516,head,s*.087,.013,.24);const brow=box(.116,.023,.015,hair,head,s*.091,.069,.211);brow.rotation.z=s*-.055;}
 sphere(.031,.07,.038,skin,head,0,-.04,.23);sphere(.052,.023,.037,skin,head,0,-.085,.237);
 const mouth=box(.099,.009,.014,0x7d5144,head,0,-.147,.19);mouth.rotation.z=-.02;
 sphere(.253,.18,.233,hair,head,0,.19,-.025);
 for(let i=0;i<13;i++){const angle=i*2.399;const o=sphere(.087,.10,.07,hair,head,Math.cos(angle)*.205,.17+Math.sin(i*1.3)*.045,Math.sin(angle)*.18);o.rotation.z=Math.sin(i)*.35;}
 for(let i=0;i<7;i++){const o=sphere(.047,.09,.034,hair,head,-.185+i*.058,.115+Math.sin(i)*.019,.177+Math.sin(i*.6)*.026);o.rotation.z=-.24+i*.09;}
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const arm=new THREE.Group();arm.position.set(s*.37,1.48,0);body.add(arm);sphere(.142,.15,.145,red,arm,0,-.05,0);cylinder(.107,.09,.34,red,arm,0,-.22,0);sphere(.094,.09,.09,red,arm,0,-.4,0);cylinder(.1,.093,.24,white,arm,0,-.5,.01);sphere(.107,.12,.095,white,arm,0,-.665,.015);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(s*.151,.86,0);body.add(leg);cylinder(.13,.105,.39,red,leg,0,-.19,0);sphere(.115,.1,.11,red,leg,0,-.41,.005);cylinder(.12,.108,.35,white,leg,0,-.57,0);sphere(.125,.09,.192,white,leg,0,-.785,.066);legs.push(leg);
 }
 const shield=mesh(new THREE.SphereGeometry(1.1,24,16),new THREE.MeshBasicMaterial({color:0x91d4c1,transparent:true,opacity:.14,wireframe:true}),root,0,1.05,0);shield.visible=false;
 return {root,body,head,arms,legs,shield};
}
const red=createRed();red.root.position.set(0,0,7);red.root.rotation.y=Math.PI;

const colliders=[];
function obstacle(x,z,w,d){colliders.push({x,z,w,d});}
const groundTex=texture((g,w,h)=>{g.fillStyle='#9b9784';g.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const v=140+((x*17+y*11)%24);g.fillStyle=`rgb(${v+12},${v+8},${v})`;g.fillRect(x*64+2+(y%2)*32,y*64+2,61,61);}for(let i=0;i<1700;i++){g.fillStyle=i%2?'#ffffff0c':'#00000009';g.fillRect((i*73)%w,(i*113)%h,2,2);}});groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(12,12);groundTex.anisotropy=8;
const ground=mesh(new THREE.PlaneGeometry(95,95),new THREE.MeshStandardMaterial({map:groundTex,roughness:1}),scene);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
// A walkable courtyard bordered by antique shops, shutters, awnings and lamps.
function shop(x,z,w,h,color,label,rotation=0){
 const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;scene.add(group);
 box(w,h,3.8,color,group,0,h/2,0);box(w+.3,.22,4.1,0x444b44,group,0,h,0);box(w+.2,.22,1.7,0x6b614b,group,0,3.05,2.32);
 const awning=box(w+.3,.08,2,0x80684c,group,0,3.35,2.5);awning.rotation.x=.18;
 for(let i=0;i<Math.floor(w/.65);i++){const strip=box(.32,.085,2,0xb9af88,group,-w/2+.32+i*.65,3.36,2.5);strip.rotation.x=.18;}
 box(w-.6,2.55,.09,0x39453d,group,0,1.4,1.96);
 for(let i=0;i<4;i++)box(.045,2.35,.13,0xb5a77d,group,-w/2+.6+i*(w-1.2)/3,1.45,2.03);
 for(let i=0;i<3;i++){box((w-1)/3,.06,.15,0x8b876a,group,-w/3+i*w/3,.65,2.06);box(.3,.6,.14,0x6b8069,group,-w/3+i*w/3,1.02,2.1);}
 board(label,w-.8,.64,group,0,3.98,1.96);
 for(let i=-1;i<=1;i+=2){box(.9,1.16,.07,0x536c6a,group,i*w*.26,h-1.25,1.96);box(.07,1.2,.12,0xbcaa82,group,i*w*.26,h-1.25,2.01);}
 obstacle(x,z,w,3.9);
}
shop(-6,-18,8,7,0x8d7964,'古道具　ふるどう');shop(3,-18,9,6.3,0x73837a,'時計と灯り');shop(11.5,-18,7,7.7,0xa69b7e,'レコード');
shop(-19,-7,8,6.9,0x93826c,'記憶の道具店',Math.PI/2);shop(-19,3,10,7.3,0x7b897c,'修理・お手入れ',Math.PI/2);shop(19,-5,10,7.2,0x938d7d,'ANTIQUES',-Math.PI/2);shop(19,6,9,6.7,0xb0a084,'古いもの、新しい毎日',-Math.PI/2);
for(const x of [-15,15])for(const z of [-13,0,12]){
 cylinder(.12,.16,4.2,0x3d4944,scene,x,2.1,z);const lamp=box(.48,.65,.48,mat(0xffd996,.1,.45),scene,x,4.3,z);lamp.material=new THREE.MeshStandardMaterial({color:0xe6bd75,emissive:0xf5a63d,emissiveIntensity:.7});box(.65,.12,.65,0x39433d,scene,x,4.7,z);cylinder(.28,.42,.17,0x333e37,scene,x,.085,z);obstacle(x,z,.6,.6);
}
for(let i=0;i<12;i++){const x=(i%2?1:-1)*rand(13.2,15),z=-12+Math.floor(i/2)*4.3;box(.85,.85,.85,0x846e49,scene,x,.43,z);for(let j=0;j<3;j++)box(.9,.06,.92,0x514a35,scene,x,.12+j*.3,z);obstacle(x,z,1,1);}
for(const x of [-12.4,12.4]){box(1.8,.46,1.8,0x686b50,scene,x,.23,12.6);cylinder(.17,.23,3.2,0x695d43,scene,x,1.9,12.6);for(let i=0;i<5;i++)sphere(1.2,1.2,1.2,0x778866,scene,x+Math.sin(i*2)*.6,3.1+i*.25,12.6+Math.cos(i*2)*.6);obstacle(x,12.6,1.8,1.8);}
box(34,.18,1,0x6c7261,scene,0,.08,16.5);box(34,.2,1,0x6c7261,scene,0,.08,-15.4);
const gate=new THREE.Group();scene.add(gate);for(const x of [-3,3])box(.28,3.8,.28,0x665746,gate,x,1.9,16);box(6.5,.3,.4,0x665746,gate,0,3.85,16);const gateSign=board('古道具通り',4,.65,gate,0,3.85,15.77);gateSign.rotation.y=Math.PI;
for(let i=0;i<4;i++){const z=-13+i*8;const cable=mesh(new THREE.CylinderGeometry(.015,.015,34,8),mat(0x414944),scene,0,6,z);cable.rotation.z=Math.PI/2;for(let j=0;j<7;j++)sphere(.06,.1,.06,mat(0xffdea0,.1,.4),scene,-12+j*4,5.85,z);}
// Distant roof silhouettes keep the horizon from feeling empty.
for(let i=0;i<16;i++){box(6,rand(8,15),7,0x929c95,scene,-48+i*6,4,-30);}

const geoRing=new THREE.RingGeometry(.89,1,64);
function ring(color,radius=1,parent=scene){const m=mesh(geoRing,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),parent,0,.045,0);m.rotation.x=-Math.PI/2;m.scale.setScalar(radius);m.castShadow=m.receiveShadow=false;return m;}
const lockRing=ring(0xf5d377,1.25);lockRing.visible=false;
const playerRing=ring(0xedc785,.48);playerRing.material.opacity=.3;
const cardImages={};
function cardArt(id){const t=texture((g,w,h)=>{
 g.clearRect(0,0,w,h);g.translate(w/2,h/2);g.strokeStyle='#544735';g.fillStyle='#ac7e43';g.lineWidth=13;g.lineCap='round';
 if(id==='chair'){g.fillRect(-90,-125,20,285);g.fillRect(70,-125,20,285);g.fillRect(-90,-130,180,24);g.fillRect(-108,18,215,25);g.fillRect(-45,-107,14,111);g.fillRect(27,-107,14,111);g.fillStyle='#d6b478';g.fillRect(-109,10,218,15);g.strokeStyle='#d7ba88';g.lineWidth=3;g.strokeRect(-85,-119,170,131);}
 if(id==='record'){g.fillStyle='#242d2c';g.beginPath();g.arc(0,0,148,0,7);g.fill();g.strokeStyle='#5a6356';g.lineWidth=2;for(let r=58;r<145;r+=9){g.beginPath();g.arc(0,0,r,0,7);g.stroke();}g.fillStyle='#b9503f';g.beginPath();g.arc(0,0,46,0,7);g.fill();g.fillStyle='#edd7a3';g.beginPath();g.arc(0,0,7,0,7);g.fill();}
 if(id==='clock'){g.fillStyle='#866039';g.beginPath();g.roundRect(-112,-125,224,264,[100,100,12,12]);g.fill();g.fillStyle='#e8d7a6';g.beginPath();g.arc(0,-22,85,0,7);g.fill();g.strokeStyle='#584d35';g.lineWidth=6;g.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(Math.sin(a)*65,-22-Math.cos(a)*65);g.lineTo(Math.sin(a)*74,-22-Math.cos(a)*74);g.stroke();}g.beginPath();g.moveTo(0,-83);g.lineTo(0,-22);g.lineTo(45,-22);g.stroke();g.fillStyle='#c8a052';g.fillRect(-13,74,26,32);}
 },384,384);cardImages[id]=t.image.toDataURL();return t;}
const cardTextures=Object.fromEntries(cards.map(c=>[c.id,cardArt(c.id)]));

let mode='title',resumeMode='playing',wave=0,kills=0,missionTime=0,totalDamage=0;
let toastTime=0,toastText='',hitStop=0,shake=0,cameraYaw=0,cameraPitch=.33,zoom=7.2,lock=null;
const player={pos:red.root.position,hp:100,stamina:100,attack:null,combo:0,lastAttack:-9,dodge:0,dodgeDir:V(),invulnerable:0,skillCd:0,shield:0,slow:0,heals:2,hurt:0};
let elapsed=0,walkPhase=0,nextWaveTimer=-1;
const enemies=[],drops=[],effects=[],numbers=[];
const keys=new Set(),stick={x:0,y:0},drag={active:false,x:0,y:0};
let soundEnabled=true,audio;
function sfx(type){if(!soundEnabled)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);const now=audio.currentTime;const p={hit:[180,50,.13,'triangle'],dodge:[360,120,.12,'sine'],hurt:[95,40,.23,'sawtooth'],loot:[520,1040,.3,'sine'],skill:[260,700,.35,'triangle'],attack:[240,60,.11,'triangle']}[type]||[600,900,.12,'sine'];o.type=p[3];o.frequency.setValueAtTime(p[0],now);o.frequency.exponentialRampToValueAtTime(p[1],now+p[2]);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+p[2]);o.start(now);o.stop(now+p[2]);}catch{}}
function toast(s){toastText=s;toastTime=3;$('#toast').textContent=s;$('#toast').style.opacity=1;}
function modal(label,title,text,content,actions,onClose){
 clearInput();resumeMode=mode;mode='modal';$('#modal').hidden=false;$('#modal-label').textContent=label;$('#modal-title').textContent=title;$('#modal-text').textContent=text;$('#modal-content').replaceChildren();if(content)$('#modal-content').append(content);$('#modal-actions').replaceChildren();
 for(const a of actions){const b=document.createElement('button');b.className=a.secondary?'sub-button':'gold-button';b.textContent=a.label;b.onclick=a.run;$('#modal-actions').append(b);}
 $('#modal-close').onclick=onClose||closeModal;$('#modal-close').hidden=!onClose&&actions.some(a=>a.required);$('#modal-actions button')?.focus();
}
function closeModal(){mode=resumeMode;$('#modal').hidden=true;clearInput();if(mode==='playing')$('#stick').hidden=!touchLayout();}
function clearInput(){keys.clear();stick.x=stick.y=0;drag.active=false;$('#stick-knob').style.transform='';}
function cardElement(card,owned=true,reward=false){const el=document.createElement('article');el.className='collect-card'+(owned?'':' locked');const rarity=document.createElement('span');rarity.className='rarity';rarity.textContent=card.rarity;const img=new Image();img.src=cardImages[card.id];img.alt=card.name;const title=document.createElement('h3');title.textContent=owned?card.name:'未発見の古道具';const desc=document.createElement('p');desc.textContent=owned?card.desc:'怪人を倒して、眠っていた古道具を見つけよう。';el.append(rarity,img,title,desc);if(owned){const memory=document.createElement('small');memory.textContent=card.memory;el.append(memory);if(!reward){const b=document.createElement('button');b.textContent=save.equipped===card.id?'装備中':`装備する（所持 ${save.counts[card.id]}）`;b.disabled=save.equipped===card.id;b.onclick=()=>{save.equipped=card.id;persist();updateHUD();showCollection(true);};el.append(b);}}return el;}
function showCollection(refresh=false){const prev=refresh?resumeMode:mode;const grid=document.createElement('div');grid.className='card-grid';for(const c of cards)grid.append(cardElement(c,save.counts[c.id]>0));modal('MEMORY COLLECTION','古道具コレクション','装備した古道具の力を、能力ボタン（キーボードはE）で使える。カードの記録はこのブラウザーに保存される。',grid,[{label:'戻る',run:closeModal}],closeModal);resumeMode=prev;}
function reward(card){save.counts[card.id]=(save.counts[card.id]||0)+1;if(!save.equipped)save.equipped=card.id;persist();sfx('loot');const wrap=document.createElement('div');wrap.className='reward-grid';wrap.append(cardElement(card,true,true));modal('AN OLD THING, A NEW STORY','古道具を取り戻した！',card.name+'がコレクションに加わった。',wrap,[{label:'装備して続ける',run:()=>{save.equipped=card.id;persist();updateHUD();closeModal();}},{label:'いまの装備で続ける',secondary:true,run:closeModal}],closeModal);updateHUD();}

function enemyModel(type){
 const group=new THREE.Group();scene.add(group);const body=new THREE.Group();group.add(body);const armor=mat(type===2?0x667583:type===1?0x648678:0x8a7460,.45,.55),dark=mat(0x29353b,.4,.65),gold=mat(0xb89b5d,.55,.35);
 const size=type===2?1.45:1;body.scale.setScalar(size);
 box(.7,.7,.45,armor,body,0,1.2,0);box(.42,.3,.38,dark,body,0,.79,0);
 const head=box(.5,.44,.45,armor,body,0,1.8,0);head.rotation.z=type===1?.1:0;
 const glow=new THREE.MeshStandardMaterial({color:0xffd494,emissive:0xff661a,emissiveIntensity:1.7});box(.32,.055,.04,glow,body,0,1.84,.24);
 cylinder(.065,.065,.7,gold,body,0,1.22,.27).rotation.z=Math.PI/2;
 const arms=[],legs=[];
 for(const s of [-1,1]){const arm=new THREE.Group();arm.position.set(s*.52,1.42,0);body.add(arm);box(.27,.56,.29,armor,arm,0,-.22,0);sphere(.19,.19,.2,dark,arm,0,-.53,0);arms.push(arm);const leg=new THREE.Group();leg.position.set(s*.22,.73,0);body.add(leg);box(.23,.62,.24,dark,leg,0,-.3,0);box(.33,.18,.47,armor,leg,0,-.66,.1);legs.push(leg);}
 if(type===0){box(.12,.72,.16,gold,arms[1],0,-.93,0);box(.65,.24,.31,armor,arms[1],0,-1.1,0);}
 if(type===1){const disc=cylinder(.26,.26,.16,dark,body,0,1.22,.37);disc.rotation.x=Math.PI/2;cylinder(.08,.08,.18,gold,body,0,1.22,.47).rotation.x=Math.PI/2;}
 if(type===2){for(const s of [-1,1]){const shoulder=box(.5,.37,.57,armor,body,s*.56,1.6,0);shoulder.rotation.z=s*.3;}box(.3,1.1,.3,gold,arms[1],0,-1,0);box(.94,.42,.5,armor,arms[1],0,-1.5,0);}
 const telegraph=ring(0xff593d,1);telegraph.visible=false;
 return {group,body,arms,legs,telegraph};
}
const enemyTypes=[{name:'ガラクタ兵',hp:92,speed:2.1,range:2.15,damage:16,windup:.9,recover:1.25},{name:'音波怪人',hp:105,speed:1.5,range:7,damage:13,windup:1.25,recover:1.9},{name:'廃材の巨兵',hp:320,speed:1.35,range:3.35,damage:27,windup:1.2,recover:1.75}];
function spawn(type,x,z){const d=enemyTypes[type],model=enemyModel(type);model.group.position.set(x,0,z);const e={...d,...model,type,pos:model.group.position,maxHp:d.hp,phase:'approach',timer:rand(.3,.8),cooldown:1.2,flash:0,stagger:0,dir:V(),attackCount:0,dead:false};enemies.push(e);return e;}
function beginWave(){wave++;nextWaveTimer=-1;player.hp=Math.min(100,player.hp+20);player.stamina=100;if(wave===1){spawn(0,-3,-4);spawn(0,4,-6);}if(wave===2){spawn(1,-5,-7);spawn(0,5,-5);}if(wave===3)spawn(2,0,-8);toast(['','第一戦：ガラクタ兵','第二戦：音波をかわそう','最終戦：廃材の巨兵'][wave]);updateHUD();}
function disposeModel(o){o.traverse(n=>{if(n.isMesh){n.geometry?.dispose();}});scene.remove(o);}
function startGame(){
 for(const e of enemies){scene.remove(e.group);scene.remove(e.telegraph);}enemies.length=0;for(const d of drops)scene.remove(d.group);drops.length=0;for(const fx of effects)scene.remove(fx.mesh);effects.length=0;for(const n of numbers)n.el.remove();numbers.length=0;
 player.pos.set(0,0,9);red.root.rotation.y=Math.PI;Object.assign(player,{hp:100,stamina:100,attack:null,combo:0,lastAttack:-9,dodge:0,invulnerable:1.5,skillCd:0,shield:0,slow:0,heals:2,hurt:0});wave=0;kills=0;missionTime=0;totalDamage=0;lock=null;cameraYaw=0;cameraPitch=.34;hitStop=0;mode='playing';nextWaveTimer=-1;clearInput();$('#title').hidden=true;$('#modal').hidden=true;$('#credit').hidden=true;$('#hud').hidden=false;$('#bottom-hud').hidden=false;$('#combat-hint').hidden=false;$('#stick').hidden=!touchLayout();beginWave();camera.position.copy(player.pos).add(V(0,4,7));
}
function finishGame(won){const stats=document.createElement('div');stats.className='result-stats';for(const [v,t]of[[kills,'撃破'],[Math.floor(missionTime/60)+':'+String(Math.floor(missionTime%60)).padStart(2,'0'),'出動時間'],[cards.filter(c=>save.counts[c.id]).length+'/3','コレクション']]){const item=document.createElement('div');const b=document.createElement('b');b.textContent=v;const s=document.createElement('span');s.textContent=t;item.append(b,s);stats.append(item);}mode='result';modal(won?'MISSION COMPLETE':'RETRY / もう一度',won?'古道具街に、また日常が。':'いったん、立て直そう。',won?'取り戻した道具を、次の暮らしへ。装備を変えると、次の戦い方も変わる。':'攻撃を連打するとスタミナが減る。赤い予兆で回避して、敵が止まったら反撃しよう。「手当て」で体力を回復できる。',stats,[{label:'もう一度出動',run:startGame,required:true},{label:'タイトルへ',secondary:true,run:toTitle,required:true}]);}
function toTitle(){mode='title';$('#modal').hidden=true;$('#title').hidden=false;$('#credit').hidden=false;$('#hud').hidden=true;$('#bottom-hud').hidden=true;$('#enemy-hud').hidden=true;$('#combat-hint').hidden=true;$('#stick').hidden=true;for(const e of enemies){e.group.visible=false;e.telegraph.visible=false;}for(const d of drops)d.group.visible=false;red.root.position.set(0,0,7);red.root.rotation.y=0;player.attack=null;player.dodge=0;player.shield=0;lockRing.visible=false;clearInput();}
function pauseGame(){if(mode!=='playing')return;const help=document.createElement('div');help.className='controls-list';for(const s of (touchLayout()?['左スティック：移動','連撃：3段コンボ（1打ずつタップ）','強攻撃：ひるませる','回避：攻撃の予兆に合わせる','古道具の力：装備カードの能力','手当て：体力を回復（2回まで）','画面をドラッグ：視点回転','カード欄：装備を変更']:['WASD / 矢印：移動','J：3段コンボ（1打ずつ押す）','K：強攻撃・ひるませる','Space：回避（スタミナ消費）','E：装備カードの特殊能力','R：体力を回復（2回まで）','Tab：近くの怪人をロックオン','Q・F / 右ドラッグ：視点回転'])){const line=document.createElement('div');line.textContent=s;help.append(line);}modal('PAUSE','ひと休み','怪人の赤い予兆は攻撃の合図。回避した直後の隙を狙おう。',help,[{label:'ゲームに戻る',run:closeModal},{label:soundEnabled?'音をオフにする':'音をオンにする',secondary:true,run:()=>{soundEnabled=!soundEnabled;closeModal();}}],closeModal);}

function updateHUD(){
 $('#hp').style.width=player.hp+'%';$('#stamina').style.width=player.stamina+'%';$('#hp-text').textContent=Math.ceil(player.hp)+' / 100';$('#heal-count').textContent='手当て × '+player.heals;$('#phase').textContent=`古道具街 / 第${wave}戦`;
 const alive=enemies.filter(e=>!e.dead).length;$('#objective').textContent=wave===3?'廃材の巨兵を倒そう':wave===2?'音波をかわして反撃':'怪人の隙を狙おう';$('#remaining').textContent=drops.length?'光る古道具に近づいて回収':`残り ${alive} 体`;
 const card=cards.find(c=>c.id===save.equipped);$('#equipped-name').textContent=card?.name||'装備なし';$('#collection-count').textContent=cards.filter(c=>save.counts[c.id]).length+' / 3';$('#skill-label').textContent=card?.skill||'古道具の力';$('#cooldown').textContent=player.skillCd>0?Math.ceil(player.skillCd)+'秒':'';$('#skill').disabled=!card||player.skillCd>0;$('#heal').disabled=player.heals===0;
}

function directionInput(){const x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x;const y=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-stick.y;const dir=V(x*Math.cos(cameraYaw)-y*Math.sin(cameraYaw),0,-x*Math.sin(cameraYaw)-y*Math.cos(cameraYaw));if(dir.lengthSq()>1)dir.normalize();return dir;}
function movePosition(pos,delta,radius=.45){pos.add(delta);pos.x=clamp(pos.x,-14.5,14.5);pos.z=clamp(pos.z,-14,14.8);for(const c of colliders){const nx=clamp(pos.x,c.x-c.w/2,c.x+c.w/2),nz=clamp(pos.z,c.z-c.d/2,c.z+c.d/2),dx=pos.x-nx,dz=pos.z-nz,d=Math.hypot(dx,dz);if(d<radius&&d>.001){pos.x+=dx/d*(radius-d);pos.z+=dz/d*(radius-d);}}}
function nearest(range=Infinity){let best=null,d=range;for(const e of enemies){if(e.dead)continue;const n=e.pos.distanceTo(player.pos);if(n<d){d=n;best=e;}}return best;}
function faceTarget(e){if(e){red.root.rotation.y=Math.atan2(e.pos.x-player.pos.x,e.pos.z-player.pos.z);}}
function attack(heavy=false){if(mode!=='playing'||player.attack||player.dodge>0||player.hurt>.12)return;const cost=heavy?24:12;if(player.stamina<cost){toast('スタミナが足りない。少し間をあけよう。');return;}player.stamina-=cost;const target=lock&&!lock.dead?lock:nearest(3.4);faceTarget(target);player.combo=elapsed-player.lastAttack<1.3?(player.combo+1)%3:0;player.lastAttack=elapsed;player.attack={time:0,duration:heavy?.86:.46,hitAt:heavy?.4:.17,heavy,hit:false,combo:player.combo};sfx('attack');}
function dodge(){if(mode!=='playing'||player.dodge>0||player.stamina<26||player.hurt>.15)return;player.stamina-=26;player.attack=null;player.dodge=.47;player.invulnerable=.42;const dir=directionInput();if(dir.lengthSq()<.05)dir.set(Math.sin(red.root.rotation.y),0,Math.cos(red.root.rotation.y));player.dodgeDir.copy(dir.normalize());sfx('dodge');}
function heal(){if(mode!=='playing'||player.heals===0||player.hp>=100)return;player.heals--;player.hp=Math.min(100,player.hp+50);player.invulnerable=.75;burst(player.pos.clone().add(V(0,1,0)),0x9de3a1,16);sfx('loot');toast('手当て：体力を回復');updateHUD();}
function useSkill(){if(mode!=='playing')return;const card=cards.find(c=>c.id===save.equipped);if(!card){toast('怪人を倒して古道具カードを手に入れよう。');return;}if(player.skillCd>0)return;player.skillCd=card.cooldown;sfx('skill');toast(card.skill);if(card.id==='chair'){player.shield=6;}if(card.id==='record'){shock(player.pos,0xecc25d,7,.65);for(const e of enemies)if(!e.dead&&e.pos.distanceTo(player.pos)<7)hitEnemy(e,43,true);}if(card.id==='clock'){player.slow=5;shock(player.pos,0x91c9f2,11,.8);}updateHUD();}
function hitEnemy(e,damage,strong=false){if(e.dead)return;e.hp=Math.max(0,e.hp-damage);e.flash=.16;e.stagger=strong?.8:.16;totalDamage+=damage;hitStop=.045;shake=strong?.18:.08;burst(e.pos.clone().add(V(0,1.3,0)),0xffce74,strong?18:10);number(e.pos.clone().add(V(0,2,0)),damage);sfx('hit');if(strong){e.phase='recover';e.timer=.9;e.telegraph.visible=false;}if(e.hp===0){e.dead=true;e.deathTime=.65;e.telegraph.visible=false;kills++;if(lock===e)lock=null;burst(e.pos.clone().add(V(0,1.4,0)),0xf2dc9a,30);const alive=enemies.some(x=>!x.dead);if(!alive)dropCard(cards[wave-1],e.pos);updateHUD();}}
function damagePlayer(amount){if(player.invulnerable>0||mode!=='playing')return;const actual=Math.round(amount*(player.shield>0?.35:1));player.hp=Math.max(0,player.hp-actual);player.invulnerable=.8;player.hurt=.35;player.attack=null;shake=.25;sfx('hurt');number(player.pos.clone().add(V(0,2.2,0)),'−'+actual,true);updateHUD();if(player.hp===0)finishGame(false);}
function resolveAttack(a){const forward=V(Math.sin(red.root.rotation.y),0,Math.cos(red.root.rotation.y));const range=a.heavy?3:2.65;const damage=a.heavy?42:a.combo===2?30:22;let hit=false;for(const e of enemies){if(e.dead)continue;const v=e.pos.clone().sub(player.pos),d=v.length();if(d<range&&(d<1||v.normalize().dot(forward)>-.03)){hitEnemy(e,damage,a.heavy||a.combo===2);hit=true;}}
 const arc=mesh(new THREE.TorusGeometry(a.heavy?1.45:1.12,.045,5,28,Math.PI*1.3),new THREE.MeshBasicMaterial({color:hit?0xffd891:0xfff2cb,transparent:true,opacity:.8}),scene,player.pos.x,1.2,player.pos.z);arc.rotation.set(Math.PI/2,0,-red.root.rotation.y-.45);effects.push({mesh:arc,life:.2,max:.2,type:'arc'});if(!hit)player.stamina=Math.min(100,player.stamina+2);
}
function burst(pos,color,count=10){for(let i=0;i<count;i++){const o=mesh(new THREE.BoxGeometry(.055,.055,.13),new THREE.MeshBasicMaterial({color}),scene,...pos.toArray());effects.push({mesh:o,vel:V(rand(-3,3),rand(.8,4),rand(-3,3)),life:rand(.25,.65),max:.65,type:'particle'});}}
function shock(pos,color,radius,duration){const o=ring(color,.1);o.position.set(pos.x,.08,pos.z);effects.push({mesh:o,life:duration,max:duration,radius,type:'shock'});}
function number(pos,value,red=false){const el=document.createElement('span');el.className='damage-number';el.textContent=value;if(red)el.style.color='#ff9989';$('#damage-layer').append(el);numbers.push({el,pos,life:.8});}
function dropCard(card,pos){const group=new THREE.Group();group.position.copy(pos);scene.add(group);const cardMesh=box(.68,.95,.045,mat(0xe1bc68,.5,.4),group,0,1.15,0);mesh(new THREE.PlaneGeometry(.57,.78),new THREE.MeshBasicMaterial({map:cardTextures[card.id],transparent:true,side:THREE.DoubleSide}),group,0,1.15,.03);const halo=ring(0xffd784,.85,group);const light=new THREE.PointLight(0xffc05e,3,4);group.add(light);light.position.y=1;drops.push({group,card,base:pos.clone(),time:0});toast('古道具が現れた！ 光に近づいて回収しよう。');}

function updatePlayer(dt){
 player.invulnerable=Math.max(0,player.invulnerable-dt);player.hurt=Math.max(0,player.hurt-dt);player.skillCd=Math.max(0,player.skillCd-dt);player.shield=Math.max(0,player.shield-dt);player.slow=Math.max(0,player.slow-dt);red.shield.visible=player.shield>0;
 const dir=directionInput();let speed=keys.has('ShiftLeft')&&player.stamina>1?5.8:3.8;if(player.attack)speed*=.32;if(player.hurt>0)speed*=.35;
 if(player.dodge>0){player.dodge-=dt;movePosition(player.pos,player.dodgeDir.clone().multiplyScalar(dt*9));red.body.rotation.x=-Math.sin((.47-player.dodge)/.47*Math.PI)*.75;red.body.position.y=-Math.sin((.47-player.dodge)/.47*Math.PI)*.3;}
 else{red.body.rotation.x=THREE.MathUtils.damp(red.body.rotation.x,0,15,dt);red.body.position.y=0;movePosition(player.pos,dir.clone().multiplyScalar(speed*dt));if(dir.lengthSq()>.01&&!player.attack){const angle=Math.atan2(dir.x,dir.z);red.root.rotation.y+=Math.atan2(Math.sin(angle-red.root.rotation.y),Math.cos(angle-red.root.rotation.y))*Math.min(1,dt*14);}if(keys.has('ShiftLeft')&&dir.lengthSq()>.1)player.stamina=Math.max(0,player.stamina-dt*10);else if(!player.attack&&elapsed-player.lastAttack>.4)player.stamina=Math.min(100,player.stamina+dt*23);}
 if(player.attack){const a=player.attack;a.time+=dt;if(!a.hit&&a.time>=a.hitAt){a.hit=true;resolveAttack(a);}if(a.time>=a.duration)player.attack=null;}
 const moving=dir.lengthSq()>.02&&player.dodge<=0;walkPhase+=dt*(moving?speed*3:1);const stride=moving?Math.sin(walkPhase)*.65:0;
 red.legs[0].rotation.x=stride;red.legs[1].rotation.x=-stride;red.arms[0].rotation.x=-stride*.8;red.arms[1].rotation.x=stride*.8;red.arms[0].rotation.z=.09;red.arms[1].rotation.z=-.09;red.body.rotation.z=0;
 if(player.attack){const a=player.attack,p=a.time/a.duration,swing=Math.sin(p*Math.PI);red.arms[a.combo%2].rotation.x=-swing*(a.heavy?2.4:1.85);red.arms[1-a.combo%2].rotation.x=-.65;red.body.rotation.y=Math.sin(p*Math.PI*2)*.22;red.body.rotation.z=(a.combo%2?1:-1)*swing*.12;}else red.body.rotation.y*=.82;
 if(moving&&player.dodge<=0)red.body.position.y=Math.abs(Math.sin(walkPhase))*.035;
 if(player.invulnerable>0)red.body.visible=Math.floor(elapsed*22)%3!==0;else red.body.visible=true;
 playerRing.position.set(player.pos.x,.035,player.pos.z);$('#hurt').style.opacity=String(player.hurt*.85);
}
function updateEnemies(dt){for(const e of enemies){
 if(e.dead){if(e.deathTime>0){e.deathTime-=dt;e.group.scale.setScalar(Math.max(.01,e.deathTime/.65));if(e.deathTime<=0)e.group.visible=false;}continue;}
 const slow=player.slow>0&&e.pos.distanceTo(player.pos)<11?.32:1,d=dt*slow;const delta=player.pos.clone().sub(e.pos),distance=delta.length();e.group.rotation.y=Math.atan2(delta.x,delta.z);e.flash=Math.max(0,e.flash-dt);e.stagger=Math.max(0,e.stagger-d);e.cooldown=Math.max(0,e.cooldown-d);
 e.body.position.y=e.flash>0?Math.sin(elapsed*70)*.04:0;e.group.scale.setScalar(e.flash>0?1.05:1);
 if(e.stagger>0)continue;
 if(e.phase==='approach'){
  e.telegraph.visible=false;
  if(distance>e.range-.3){const movement=delta.normalize().multiplyScalar(e.speed*d);movePosition(e.pos,movement,e.type===2?.85:.5);const s=Math.sin(elapsed*e.speed*4)*.45;e.legs[0].rotation.x=s;e.legs[1].rotation.x=-s;e.arms[0].rotation.x=-s*.5;e.arms[1].rotation.x=s*.5;}
  else{e.legs.forEach(l=>l.rotation.x=0);if(e.cooldown===0){e.phase='windup';e.timer=e.windup;e.attackCount++;e.dir.copy(delta.normalize());}}
 }else if(e.phase==='windup'){
  e.timer-=d;e.arms[1].rotation.x=-1.5*(1-e.timer/e.windup);e.telegraph.visible=true;e.telegraph.position.set(e.pos.x,.05,e.pos.z);const rad=e.type===1?e.range:e.range+.15;e.telegraph.scale.setScalar(rad);e.telegraph.material.opacity=.2+.45*(1-e.timer/e.windup);e.telegraph.material.color.set(e.type===2?0xff4030:0xff7450);
  if(e.timer<=0){e.phase='recover';e.timer=e.recover;e.telegraph.visible=false;
   if(e.type===1){const orb=mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:0xf5bc66}),scene,e.pos.x,1,e.pos.z);effects.push({mesh:orb,vel:e.dir.clone().multiplyScalar(6),life:2.5,max:2.5,type:'projectile',damage:e.damage});shock(e.pos,0xf0b95f,1,.3);}
   else{shock(e.pos,0xffa55a,e.range,.3);const toward=player.pos.clone().sub(e.pos);if(toward.length()<e.range+.35)damagePlayer(e.damage);e.arms[1].rotation.x=-.9;}
  }
 }else if(e.phase==='recover'){e.timer-=d;e.arms[1].rotation.x=THREE.MathUtils.damp(e.arms[1].rotation.x,0,5,d);if(e.timer<=0){e.phase='approach';e.cooldown=.3;}}
 for(const other of enemies){if(other===e||other.dead)continue;const v=e.pos.clone().sub(other.pos),dist=v.length();const min=e.type===2?1.7:1.1;if(dist<min&&dist>.01)movePosition(e.pos,v.normalize().multiplyScalar((min-dist)*d*2),.5);}
}}
function updateEffects(dt){for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.life-=dt;const ratio=Math.max(0,f.life/f.max);
 if(f.type==='particle'){f.vel.y-=dt*8;f.mesh.position.addScaledVector(f.vel,dt);f.mesh.rotation.x+=dt*7;f.mesh.scale.setScalar(ratio);}
 if(f.type==='arc'){f.mesh.material.opacity=ratio;f.mesh.scale.setScalar(1+(1-ratio)*.35);}
 if(f.type==='shock'){f.mesh.scale.setScalar(.1+(1-ratio)*f.radius);f.mesh.material.opacity=ratio*.65;}
 if(f.type==='projectile'){f.mesh.position.addScaledVector(f.vel,dt*(player.slow>0?.45:1));if(f.mesh.position.distanceTo(player.pos.clone().add(V(0,1,0)))<.65){damagePlayer(f.damage);f.life=0;}}
 if(f.life<=0){scene.remove(f.mesh);if(f.mesh.geometry!==geoRing)f.mesh.geometry.dispose();f.mesh.material.dispose();effects.splice(i,1);}}
 for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.pos.y+=dt*.9;const point=n.pos.clone().project(camera);n.el.style.left=(point.x*.5+.5)*innerWidth+'px';n.el.style.top=(-point.y*.5+.5)*innerHeight+'px';n.el.style.opacity=n.life/.8;if(n.life<=0){n.el.remove();numbers.splice(i,1);}}
}
function updateDrops(dt){for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.time+=dt;d.group.position.y=Math.sin(d.time*2.5)*.12;d.group.rotation.y+=dt*.6;if(d.base.distanceTo(player.pos)<1.45){scene.remove(d.group);drops.splice(i,1);reward(d.card);nextWaveTimer=2;break;}}if(mode==='playing'&&nextWaveTimer>=0){nextWaveTimer-=dt;if(nextWaveTimer<0){if(wave===3)finishGame(true);else beginWave();}}}
function updateCamera(dt){
 if(mode==='title'){const angle=Math.sin(elapsed*.16)*.25;camera.position.set(3.2+angle,2.15,11.6);camera.lookAt(-.7,1.25,7);red.root.rotation.y=-.12+Math.sin(elapsed*.2)*.08;red.arms[0].rotation.x=.05;red.arms[1].rotation.x=-.05;red.arms[0].rotation.z=.12;red.arms[1].rotation.z=-.12;red.legs.forEach(l=>l.rotation.x=0);red.body.position.y=Math.sin(elapsed*2)*.008;red.body.rotation.set(0,0,0);red.body.visible=true;red.shield.visible=false;return;}
 if(mode==='playing'){if(keys.has('KeyQ'))cameraYaw+=dt*1.8;if(keys.has('KeyF'))cameraYaw-=dt*1.8;if(lock&&!lock.dead&&!drag.active){const desired=Math.atan2(player.pos.x-lock.pos.x,player.pos.z-lock.pos.z);cameraYaw+=Math.atan2(Math.sin(desired-cameraYaw),Math.cos(desired-cameraYaw))*Math.min(1,dt*3);}}
 const target=player.pos.clone().add(V(0,1.25,0));const desired=target.clone().add(V(Math.sin(cameraYaw)*zoom,zoom*Math.sin(cameraPitch)+.6,Math.cos(cameraYaw)*zoom));desired.x=clamp(desired.x,-17,17);desired.z=clamp(desired.z,-16,18);camera.position.lerp(desired,1-Math.exp(-dt*7));if(shake>0){camera.position.x+=rand(-shake,shake);camera.position.y+=rand(-shake,shake);shake=Math.max(0,shake-dt*.8);}camera.lookAt(target);
}
function updateTargetHUD(){const target=lock&&!lock.dead?lock:nearest(6);$('#enemy-hud').hidden=!target||mode==='title';if(target){$('#enemy-name').textContent=target.name;$('#enemy-hp').style.width=target.hp/target.maxHp*100+'%';$('#enemy-state').textContent=target.phase==='windup'?'攻撃が来る！':target.phase==='recover'?'反撃のチャンス':lock===target?'LOCK ON':'';}lockRing.visible=!!lock&&!lock.dead&&mode!=='title';if(lockRing.visible)lockRing.position.set(lock.pos.x,.05,lock.pos.z);}
$('#start').onclick=()=>{startGame();pauseGame();$('#modal-label').textContent='出動前に';$('#modal-title').textContent='攻撃・回避・反撃。';};$('#title-cards').onclick=()=>showCollection();$('#open-cards').onclick=()=>showCollection();$('#pause').onclick=pauseGame;$('#attack').onclick=()=>attack();$('#heavy').onclick=()=>attack(true);$('#dodge').onclick=dodge;$('#skill').onclick=useSkill;$('#heal').onclick=heal;
window.addEventListener('keydown',e=>{
 if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&mode==='playing')e.preventDefault();
 if(mode==='modal'){if(e.code==='Escape'&&!$('#modal-close').hidden)$('#modal-close').click();if(e.code==='Tab'){const buttons=[...$('#modal').querySelectorAll('button:not(:disabled):not([hidden])')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}return;}
 if(mode!=='playing')return;keys.add(e.code);if(e.repeat)return;switch(e.code){case'KeyJ':attack();break;case'KeyK':attack(true);break;case'Space':dodge();break;case'KeyE':useSkill();break;case'KeyR':heal();break;case'KeyC':showCollection();break;case'Escape':pauseGame();break;case'Tab':lock=lock?null:nearest(25);toast(lock?'ロックオン：'+lock.name:'ロックオン解除');break;}
});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pauseGame();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pauseGame();});
const canvas=$('#world');canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;if(e.button===2||e.pointerType==='touch'){drag.active=true;drag.x=e.clientX;drag.y=e.clientY;canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(!drag.active)return;cameraYaw-=(e.clientX-drag.x)*.006;cameraPitch=clamp(cameraPitch+(e.clientY-drag.y)*.004,.12,.8);drag.x=e.clientX;drag.y=e.clientY;});canvas.addEventListener('pointerup',()=>drag.active=false);canvas.addEventListener('pointercancel',()=>drag.active=false);canvas.addEventListener('wheel',e=>{if(mode==='playing'){e.preventDefault();zoom=clamp(zoom+e.deltaY*.008,4.7,10);}}, {passive:false});
const stickEl=$('#stick');function moveStick(e){const r=stickEl.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/40,y=(e.clientY-r.top-r.height/2)/40;const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}stick.x=x;stick.y=y;$('#stick-knob').style.transform=`translate(${x*30}px,${y*30}px)`;}
stickEl.addEventListener('pointerdown',e=>{stickEl.setPointerCapture(e.pointerId);moveStick(e);});stickEl.addEventListener('pointermove',e=>{if(stickEl.hasPointerCapture(e.pointerId))moveStick(e);});for(const event of ['pointerup','pointercancel'])stickEl.addEventListener(event,()=>{stick.x=stick.y=0;$('#stick-knob').style.transform='';});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(mode==='playing')document.querySelector('#stick').hidden=!touchLayout();});
let last=performance.now(),uiTimer=0;
function tick(now){requestAnimationFrame(tick);let dt=Math.min((now-last)/1000,.04);last=now;elapsed+=dt;if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('#toast').style.opacity=0;}if(mode==='playing'){if(hitStop>0){hitStop-=dt;dt*=.12;}missionTime+=dt;updatePlayer(dt);if(mode==='playing')updateEnemies(dt);if(mode==='playing')updateDrops(dt);if(mode==='playing')updateEffects(dt);uiTimer+=dt;if(uiTimer>.08){uiTimer=0;updateHUD();}}updateCamera(Math.max(dt,.001));updateTargetHUD();renderer.render(scene,camera);}
updateHUD();$('#loading').hidden=true;requestAnimationFrame(tick);
