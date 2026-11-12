import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/* Olho mecânico: cápsula de câmera com frente amendoada (a logo), lente, diafragma, sensor e motor.
   Uma entrada move tudo: S.exp (0 montado, 1 aberto), abertura do diafragma, olhar. */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const palco=document.querySelector('[data-palco]');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
let W=0,H=0,mouse=null,lastMove=-1e9;const t0=performance.now();
const Q=new URLSearchParams(location.search);

/* =================== grade da motion 23 =================== */
const gc=document.getElementById('grade'),g=gc.getContext('2d');let SP=22,dots=[];
const WP=4200;
function buildGrid(){const DPR=Math.min(2,devicePixelRatio||1);gc.width=W*DPR;gc.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);
  SP=W<700?18:22;dots=[];const cols=Math.ceil(W/SP)+1,rows=Math.ceil(H/SP)+1,ox=(W-(cols-1)*SP)/2,oy=(H-(rows-1)*SP)/2;
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)dots.push({x:ox+i*SP,y:oy+j*SP,dx:0,dy:0,vx:0,vy:0});}
const fadeLeft=x=>clamp(1-(x/W-.26)/(.62-.26),0,1)*.75;
const waveBase=now=>((now-t0)%WP)/WP*(W*.8+260)-130;
function waveAt(p,now){if(RM)return 0;const wp=waveBase(now)+Math.sin(p.y/H*Math.PI*2+now/900)*46,off=p.x-wp;return Math.exp(-off*off/4608);}
function grid(now,dt){const cur=(mouse&&now-lastMove<2500)?mouse:null;g.clearRect(0,0,W,H);
  for(const p of dots){const m=fadeLeft(p.x);let tx=0,ty=0;const wv=waveAt(p,now);tx+=wv*22;ty+=wv*16*Math.sin(p.y/34+now/260);
    if(cur){const ddx=p.x-cur.x,ddy=p.y-cur.y,d=Math.hypot(ddx,ddy);if(d<130&&d>.1){const f=(130-d)*.42;tx+=ddx/d*f;ty+=ddy/d*f;}}
    if(RM){p.dx=tx;p.dy=ty;}else{p.vx+=(70*(tx-p.dx)-6*p.vx)*dt;p.vy+=(70*(ty-p.dy)-6*p.vy)*dt;p.dx+=p.vx*dt;p.dy+=p.vy*dt;}
    if(m<.02)continue;const sp=Math.min(1,Math.hypot(p.vx,p.vy)/90),gl=Math.max(wv,sp*.7),x=p.x+p.dx,y=p.y+p.dy;
    g.globalAlpha=m;g.fillStyle='rgba(162,75,255,'+(.5+.3*sp)+')';g.beginPath();g.arc(x,y,2+sp*.8,0,6.283);g.fill();
    if(gl>.06){g.fillStyle='rgba(64,230,220,'+gl.toFixed(2)+')';g.beginPath();g.arc(x,y,2+gl*1.8,0,6.283);g.fill();}}
  g.globalAlpha=1;}

/* =================== cena =================== */
const cv=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
renderer.setClearColor(0x000000,1);
const scene=new THREE.Scene();
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.55;
const camera=new THREE.PerspectiveCamera(30,1,.1,100);camera.position.set(0,0,8);
scene.add(new THREE.AmbientLight('#3a2a66',.5));
const kL=new THREE.PointLight('#FF2E9A',14,30,1.6);kL.position.set(-3.4,1.8,3);scene.add(kL);
const kR=new THREE.PointLight('#2E8CFF',13,30,1.6);kR.position.set(3.4,-1.4,2.6);scene.add(kR);
const kF=new THREE.DirectionalLight('#F4EFFF',1.1);kF.position.set(1.5,2.5,4);scene.add(kF);

/* materiais: casca de cerâmica clara, mecânica em grafite, filetes acesos */
const M={
  shell:new THREE.MeshPhysicalMaterial({color:'#a89dc4',roughness:.42,metalness:.15,clearcoat:.8,clearcoatRoughness:.2}),
  shell2:new THREE.MeshPhysicalMaterial({color:'#857aa3',roughness:.45,metalness:.1,clearcoat:.5}),
  dark:new THREE.MeshStandardMaterial({color:'#17131f',roughness:.42,metalness:.85}),
  dark2:new THREE.MeshStandardMaterial({color:'#3a3150',roughness:.3,metalness:.9}),
  bolt:new THREE.MeshStandardMaterial({color:'#8d86a0',roughness:.25,metalness:1}),
  A:new THREE.MeshBasicMaterial({color:'#FF2E9A'}),
  At:new THREE.MeshBasicMaterial({color:'#FFB8DC'}),
  B:new THREE.MeshBasicMaterial({color:'#2E8CFF'}),
  Bt:new THREE.MeshBasicMaterial({color:'#B0DCFF'}),
  glass:new THREE.MeshPhysicalMaterial({color:'#9fc4ff',transparent:true,opacity:.12,roughness:.02,clearcoat:1,envMapIntensity:2,depthWrite:false}),
};
const SIGN=document.querySelector('.hero .sign');let scheme=SIGN&&SIGN.classList.contains('azul')?'azul':'rosa';
function applyScheme(){const az=scheme==='azul',a='#FF2E9A',at='#FFB8DC',b='#2E8CFF',bt='#B0DCFF';
  M.A.color.set(az?b:a).multiplyScalar(1.2);M.At.color.set(az?bt:at).multiplyScalar(1.5);M.B.color.set(az?a:b).multiplyScalar(1.2);M.Bt.color.set(az?at:bt).multiplyScalar(1.4);
  kL.color.set(az?b:a);kR.color.set(az?a:b);}

const root=new THREE.Group();scene.add(root);
const pod=new THREE.Group();root.add(pod); /* segue o olhar */
const parts={};
function part(k){const gp=new THREE.Group();pod.add(gp);parts[k]=gp;return gp;}
const cyl=(r,h,mat,seg=64)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.rotation.x=Math.PI/2;return m;};
const torus=(R,r,mat)=>new THREE.Mesh(new THREE.TorusGeometry(R,r,12,96),mat);

/* ---- 01 frente amendoada (Marca): o contorno da logo como peça de armadura ---- */
const AK=3.0/92,P2=(x,y)=>new THREE.Vector2((x-50)*AK,-(y-50)*AK);
function almondShape(scale=1){const s=new THREE.Shape();const p=(x,y)=>P2(50+(x-50)*scale,50+(y-50)*scale);
  const a=p(4,50),c1=p(50,-2),b=p(96,50),c2=p(50,102);s.moveTo(a.x,a.y);s.quadraticCurveTo(c1.x,c1.y,b.x,b.y);s.quadraticCurveTo(c2.x,c2.y,a.x,a.y);return s;}
const face=part('face');
{const outer=almondShape(1),hole=new THREE.Path();hole.absarc(0,0,.66,0,Math.PI*2,true);outer.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(outer,{depth:.16,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:4,curveSegments:96});
 const m=new THREE.Mesh(geo,M.shell);m.position.z=-.08;face.add(m);
 /* moldura interna escura e friso aceso no contorno */
 const inner=almondShape(.86),ih=new THREE.Path();ih.absarc(0,0,.66,0,Math.PI*2,true);inner.holes.push(ih);
 const ig=new THREE.ExtrudeGeometry(inner,{depth:.05,bevelEnabled:false,curveSegments:96});const im=new THREE.Mesh(ig,M.dark2);im.position.z=.12;face.add(im);
 const curve=new THREE.CurvePath();const v3=v=>new THREE.Vector3(v.x,v.y,.2);const q=(x,y)=>P2(50+(x-50)*.93,50+(y-50)*.93);
 curve.add(new THREE.QuadraticBezierCurve3(v3(q(4,50)),v3(q(50,-2)),v3(q(96,50))));curve.add(new THREE.QuadraticBezierCurve3(v3(q(96,50)),v3(q(50,102)),v3(q(4,50))));
 face.add(new THREE.Mesh(new THREE.TubeGeometry(curve,240,.026,10,true),M.At));
 face.add(new THREE.Mesh(new THREE.TubeGeometry(curve,240,.06,10,true),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:0})));
 /* anel do furo e parafusos */
 const ring=torus(.68,.04,M.dark2);ring.position.z=.13;face.add(ring);
 const glowR=torus(.7,.012,M.A);glowR.position.z=.17;face.add(glowR);
 for(const [x,y] of [[-1.05,.16],[-1.05,-.16],[1.05,.16],[1.05,-.16],[0,.62],[0,-.62]]){const b=cyl(.04,.05,M.bolt,6);b.position.set(x*(Math.abs(x)>0?1:1),y+(x===0?Math.sign(y)*.1:0),.16);if(x===0)b.position.y=Math.sign(y)*.74;face.add(b);}
 /* faixa de marcação lateral, como peça numerada */
 for(let i=0;i<5;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.012,.07,.01),M.dark);t.position.set(.9+i*.05,-.3+i*.02,.12);face.add(t);}
}

/* ---- 02 lente e diafragma (Site): o olhar ---- */
const lensG=part('lens');
{const r=[.62,.6,.56,.54];const zs=[0,-.14,-.28,-.42];
 r.forEach((rr,i)=>{const c=cyl(rr,.13,i%2?M.dark:M.dark2);c.position.z=zs[i];lensG.add(c);});
 /* anel de foco serrilhado */
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=new THREE.Mesh(new THREE.BoxGeometry(.03,.025,.12),M.dark2);b.position.set(Math.cos(a)*.615,Math.sin(a)*.615,-.14);b.rotation.z=a;lensG.add(b);}
 /* escala do foco */
 for(let i=0;i<24;i++){const a=Math.PI*.15+i/24*Math.PI*.7,t=new THREE.Mesh(new THREE.BoxGeometry(.008,i%4?.03:.06,.005),M.Bt);t.position.set(Math.cos(a)*.6,Math.sin(a)*.6,.072);t.rotation.z=a-Math.PI/2;lensG.add(t);}
 const front=torus(.56,.025,M.B);front.position.z=.07;lensG.add(front);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.7,64,24,0,Math.PI*2,0,.9),M.glass);cap.rotation.x=Math.PI/2;cap.position.z=.07-.7*Math.cos(.9);lensG.add(cap);
 /* elemento interno de vidro azulado */
 const el=new THREE.Mesh(new THREE.SphereGeometry(.42,48,24),new THREE.MeshPhysicalMaterial({color:'#2E8CFF',transparent:true,opacity:.28,roughness:.05,clearcoat:1,depthWrite:false}));el.scale.z=.3;el.position.z=-.08;lensG.add(el);
}
const irisG=part('iris');
const blades=[];
{const N=9;
 for(let i=0;i<N;i++){const sh=new THREE.Shape();sh.moveTo(0,0);sh.absarc(0,0,.5,0,1.15,false);sh.quadraticCurveTo(.18,.26,0,0);
   const geo=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false,curveSegments:24});
   const piv=new THREE.Group();const a=i/N*Math.PI*2;piv.position.set(Math.cos(a)*.5,Math.sin(a)*.5,i*.0015);piv.rotation.z=a+Math.PI*.62;
   const m=new THREE.Mesh(geo,i%2?M.dark:M.dark2);piv.add(m);irisG.add(piv);blades.push({piv,base:a+Math.PI*.62});}
 const housing=torus(.53,.035,M.dark2);irisG.add(housing);
}

/* ---- 03 sensor (Inteligência): a placa que entende o que o olho vê ---- */
const sens=part('sensor');
function pcbTex(){const s=512,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
  x.fillStyle='#120b22';x.fillRect(0,0,s,s);x.strokeStyle='#40E6DC';x.lineCap='round';
  let sd=11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<70;i++){x.globalAlpha=.35+r()*.6;x.lineWidth=1.5+r()*2.5;let px=r()*s,py=r()*s;x.beginPath();x.moveTo(px,py);
    for(let k=0;k<4;k++){if(r()<.5)px+=(r()-.5)*220;else py+=(r()-.5)*220;x.lineTo(px,py);}x.stroke();x.beginPath();x.arc(px,py,4,0,6.283);x.fillStyle='#40E6DC';x.fill();}
  x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
{const plate=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.15,.05),new THREE.MeshStandardMaterial({color:'#ffffff',map:pcbTex(),roughness:.6,metalness:.2}));sens.add(plate);
 const glowPcb=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.15),new THREE.MeshBasicMaterial({map:plate.material.map,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));glowPcb.position.z=.027;sens.add(glowPcb);sens.userData.glow=glowPcb;
 const chip=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.06),M.dark);chip.position.z=.05;sens.add(chip);
 const core=new THREE.Mesh(new THREE.PlaneGeometry(.22,.22),M.Bt);core.position.z=.082;sens.add(core);sens.userData.core=core;
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,b=cyl(.03,.08,M.bolt,6);b.position.set(Math.cos(a)*.72,Math.sin(a)*.72,.02);sens.add(b);}
}

/* ---- 04 motor, engrenagens e cabos (Sistemas) ---- */
const back=part('motor');
function gearGeo(R,teeth,depth){const s=new THREE.Shape();const n=teeth*4;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,k=i%4,r=(k===1||k===2)?R:R*.86;const p=[Math.cos(a)*r,Math.sin(a)*r];i?s.lineTo(...p):s.moveTo(...p);}
  const h=new THREE.Path();h.absarc(0,0,R*.28,0,Math.PI*2,true);s.holes.push(h);return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:8});}
const gears=[];
{const can=cyl(.7,.8,M.shell);can.position.z=-.4;back.add(can);
 for(const z of [-.08,-.72]){const t=torus(.705,.012,M.dark);t.position.z=z;back.add(t);}
 const stripe=torus(.712,.018,M.A);stripe.position.z=-.22;back.add(stripe);
 const capB=new THREE.Mesh(new THREE.CircleGeometry(.7,64),M.shell2);capB.position.z=-.8;capB.rotation.y=Math.PI;back.add(capB);
 /* janela lateral aberta mostrando as engrenagens */
 const g1=new THREE.Mesh(gearGeo(.3,16,.06),M.dark2);g1.position.set(.35,.42,-.3);g1.rotation.y=Math.PI/2;back.add(g1);gears.push([g1,1]);
 const g2=new THREE.Mesh(gearGeo(.18,10,.06),M.bolt);g2.position.set(.35,.42-.46,-.3);g2.rotation.y=Math.PI/2;back.add(g2);gears.push([g2,-1.6]);
 /* pistões dos lados */
 for(const s of [-1,1]){const body=cyl(.07,.5,M.shell2,24);body.position.set(s*.86,0,-.35);back.add(body);const rod=cyl(.035,.4,M.bolt,16);rod.position.set(s*.86,0,.05);back.add(rod);rod.userData.s=s;back.userData['rod'+s]=rod;
   const ring=torus(.075,.012,M.B);ring.position.set(s*.86,0,-.12);back.add(ring);}
 /* cabos saindo por trás */
 const cmats=[M.Bt,M.At,M.Bt,new THREE.MeshBasicMaterial({color:new THREE.Color('#40E6DC').multiplyScalar(1.3)})];
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,o=new THREE.Vector3(Math.cos(a)*.25,Math.sin(a)*.25,-.8);
   const cur=new THREE.CatmullRomCurve3([o,o.clone().add(new THREE.Vector3(0,0,-.4)),new THREE.Vector3(.5+i*.06,-.3-i*.05,-1.7),new THREE.Vector3(1.4+i*.05,-.7-i*.06,-2.3)]);
   back.add(new THREE.Mesh(new THREE.TubeGeometry(cur,60,.035,10,false),M.dark2));back.add(new THREE.Mesh(new THREE.TubeGeometry(cur,60,.012,6,false),cmats[i]));}
 const plug=cyl(.3,.12,M.dark2);plug.position.z=-.86;back.add(plug);
}
applyScheme();
if(SIGN)new MutationObserver(()=>{const n=SIGN.classList.contains('azul')?'azul':'rosa';if(n!==scheme){scheme=n;applyScheme();}}).observe(SIGN,{attributes:true,attributeFilter:['class']});

/* ---- pós: bloom só no que acende ---- */
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(256,256),.5,.35,.9));composer.addPass(new OutputPass());

/* =================== etiquetas =================== */
const PARTS=[
  {k:'face',href:'/servicos/marca-e-identidade-visual/',n:'01',t:'Marca',c:'#B0DCFF',dx:-150,dy:-90},
  {k:'iris',href:'/servicos/site-para-pequeno-negocio/',n:'02',t:'Site',c:'#FF8CC6',dx:20,dy:-160},
  {k:'sensor',href:'/servicos/relatorio-de-vendas/',n:'03',t:'Inteligência',c:'#40E6DC',dx:-70,dy:150},
  {k:'motor',href:'/servicos/sistema-de-comandas/',n:'04',t:'Sistemas',c:'#A24BFF',dx:20,dy:120},
];
const etqs=document.getElementById('etqs'),fios=document.getElementById('fios');let hov=null;
PARTS.forEach(p=>{p.el=document.createElement('a');p.el.href=p.href;p.el.className='etq';p.el.style.setProperty('--c',p.c);p.el.innerHTML=`<span>${p.n}</span><b>${p.t}</b>`;etqs.appendChild(p.el);
  p.el.onpointerenter=p.el.onfocus=()=>hov=p.k;p.el.onpointerleave=p.el.onblur=()=>{if(hov===p.k)hov=null;};
  p.ln=document.createElementNS('http://www.w3.org/2000/svg','line');p.ln.setAttribute('stroke',p.c);p.dot=document.createElementNS('http://www.w3.org/2000/svg','circle');p.dot.setAttribute('r','3');p.dot.setAttribute('fill',p.c);fios.append(p.ln,p.dot);});
const tmp=new THREE.Vector3();
const AN={face:[0,.78,.1],iris:[.3,.3,0],sensor:[-.4,-.4,.03],motor:[0,.7,-.4]};
function anchor(k){return tmp.set(...AN[k]).applyMatrix4(parts[k].matrixWorld);}
function toScreen(v){const p=v.clone().project(camera);return [(p.x*.5+.5)*W,(-p.y*.5+.5)*H];}

/* =================== estado =================== */
/* começa aberto; depois alterna sozinho: aberto 7s, fecha em sequência, fechado 4s, abre de novo.
   Para enquanto a pessoa passa o mouse numa etiqueta ou gira o olho. Com "reduzir movimento" fica aberto. */
const S={exp:1,side:1,lab:1};let mode=2,modeT=performance.now(),hold=0;
const PE={face:1,lens:1,iris:1,sens:1,back:1};
const ORD=['face','lens','iris','sens','back'];
const HOLD={2:7000,0:4000};

let drag=null;const spin={y:0,x:0};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sy:spin.y,sx:spin.x};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',()=>drag=null);cv.addEventListener('pointercancel',()=>drag=null);
addEventListener('pointermove',e=>{const r=palco.getBoundingClientRect();mouse={x:e.clientX-r.left,y:e.clientY-r.top};lastMove=performance.now();
  if(drag){spin.y=drag.sy+(e.clientX-drag.x)/220;spin.x=clamp(drag.sx+(e.clientY-drag.y)/260,-.8,.8);}});

const look={x:0,y:0,vx:0,vy:0};let EX=0,EY=0;
const CFG=window.MECHA_CFG||{};
function fit(){const r=palco.getBoundingClientRect();W=r.width;H=r.height;
  renderer.setSize(W,H,false);composer.setSize(W,H);camera.aspect=W/H;
  const mob=W<820;EX=mob?W*.55:W*(CFG.ex||.72);EY=mob?H*.34:H*(CFG.ey||.5);
  const want=mob?.6:(CFG.want||.3),vis=2*Math.tan(THREE.MathUtils.degToRad(15));
  let d=3.2/(want*vis*camera.aspect);d=Math.max(d,1.9/(vis*(CFG.hfrac||.5)));
  camera.position.z=d;camera.setViewOffset(W,H,-(EX-W/2),-(EY-H/2),W,H);camera.updateProjectionMatrix();buildGrid();}
new ResizeObserver(fit).observe(palco);fit();

let lt=performance.now(),flash=0,lastWave=-1;const par0=[0,0];const HL={face:0,iris:0,sensor:0,motor:0};
const hud=document.getElementById('hud');
function frame(now){
  const dt=Math.min(.05,(now-lt)/1000);lt=now;grid(now,dt);
  if(!RM){if(hov||drag)modeT+=dt*1000;if(now-modeT>HOLD[mode]){mode=mode===2?0:2;modeT=now;}}
  const since=(now-modeT)/1000,ease=RM?1:1-Math.exp(-dt*2.6);
  /* cada peça sai com um atraso: abre da frente para trás, fecha de trás para frente */
  ORD.forEach((k,i)=>{const d=(mode===2?i:ORD.length-1-i)*.14;const t=since>=d?(mode===2?1:0):PE[k];PE[k]=lerp(PE[k],t,ease);});
  const tgt={exp:mode===2?1:0,side:mode===2?1:0,lab:mode===2&&since>.9?1:0};
  for(const k in tgt)S[k]=lerp(S[k],tgt[k],k==='side'?1-Math.exp(-dt*1.8):ease);
  const cyc=Math.floor((now-t0)/WP);if(!RM&&waveBase(now)>W*.5&&lastWave!==cyc){lastWave=cyc;flash=1;}
  flash=Math.max(0,flash-dt*1.2);
  /* olhar */
  let tx=0,ty=0;const cur=(mouse&&now-lastMove<2500&&!drag)?mouse:null;
  if(cur){tx=clamp((cur.x-EX)/(W*.45),-1,1)*.38;ty=clamp((cur.y-EY)/(H*.5),-1,1)*.26;}else if(!RM){const a=(now-t0)/1000;tx=Math.sin(a*.5)*.22;ty=Math.sin(a*.8)*.08;}
  const lf=1-S.side;tx*=lf;ty*=lf;
  if(RM){look.x=tx;look.y=ty;}else{look.vx+=(60*(tx-look.x)-11*look.vx)*dt;look.vy+=(60*(ty-look.y)-11*look.vy)*dt;look.x+=look.vx*dt;look.y+=look.vy*dt;}
  pod.rotation.set(look.y,look.x,0);
  if(!drag&&!RM){spin.y*=Math.exp(-dt*1.6);spin.x*=Math.exp(-dt*1.6);}
  const par=(cur&&!RM)?[(cur.x-EX)/W,(cur.y-EY)/H]:[0,0];par0[0]=lerp(par0[0],par[0],1-Math.exp(-dt*2.5));par0[1]=lerp(par0[1],par[1],1-Math.exp(-dt*2.5));
  root.rotation.set(spin.x+S.side*.34+par0[1]*.18,spin.y-S.side*.62+par0[0]*.3,0);
  /* explosão ao longo do eixo, com leve respiro */
  const e=S.exp,tt=(now-t0)/1000,fl=RM?0:Math.sin(tt/1.6)*.03*e;
  const bob=(ph,a)=>RM?0:Math.sin(tt*1.15+ph)*a; /* cada peça flutua no seu tempo */
  for(const k in HL)HL[k]=lerp(HL[k],hov===k?1:0,1-Math.exp(-dt*8));
  face.position.z=.55+PE.face*1.7+bob(0,.06)*PE.face+HL.face*.15;face.position.y=bob(1.2,.035)*PE.face;face.rotation.y=bob(.4,.06)*PE.face;
  lensG.position.z=.38+PE.lens*1.05+bob(.9,.05)*PE.lens;lensG.rotation.z=RM?0:Math.sin(tt*.7)*.5; /* anel de foco indo e voltando */
  irisG.position.z=.12+PE.iris*.62+bob(1.8,.04)*PE.iris+HL.iris*.12;
  sens.position.z=-.02+PE.sens*.18+bob(2.6,.04)*PE.sens+HL.sensor*.12;sens.position.y=bob(3.1,.03)*PE.sens;sens.rotation.z=bob(2,.05)*PE.sens;
  back.position.z=-PE.back*.7+bob(3.6,.05)*PE.back-HL.motor*.15;
  /* diafragma: abre e fecha com a onda */
  const ap=RM?.5:clamp(.5+.32*Math.sin(tt*1.3)-.4*flash,0,1);
  blades.forEach(b=>b.piv.rotation.z=b.base+lerp(.55,-.25,ap));
  gears.forEach(([gm,k])=>{if(!RM)gm.rotation.z+=dt*k*(.7+flash*3);});
  for(const s of [-1,1]){const r=back.userData['rod'+s];r.position.z=.05+(RM?0:.06+.06*Math.sin(tt*2.2+(s>0?0:Math.PI)))+.08*flash;}
  const pulse=RM?0:.5+.5*Math.sin(tt*2);
  sens.userData.glow.material.opacity=.3+.25*pulse+.45*flash+HL.sensor*.4;sens.userData.core.scale.setScalar(1+.12*pulse+.25*flash);
  if(hud)hud.textContent=`abertura f/${(1.4+ (1-ap)*6.6).toFixed(1)} · foco ${(0.8+look.x*.6+1).toFixed(2)} m · ${mode===2?'aberto':'fechado'}`;
  root.updateMatrixWorld(true);composer.render();
  const show=S.lab>.5;
  PARTS.forEach(p=>{const [ax,ay]=toScreen(anchor(p.k));if(!isFinite(ax)||!isFinite(ay))return;let lx=ax+p.dx,ly=ay+p.dy;
    const w=p.el.offsetWidth||120,h=p.el.offsetHeight||44;lx=clamp(lx,12,W-w-12);ly=clamp(ly,90,H-h-24);
    p.el.classList.toggle('on',show);p.el.classList.toggle('apaga',!!hov&&hov!==p.k);p.el.style.transform=`translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
    const ex=lx+(lx>ax?0:w),ey=ly+(ly>ay?0:h);
    p.ln.setAttribute('x1',ax);p.ln.setAttribute('y1',ay);p.ln.setAttribute('x2',ex);p.ln.setAttribute('y2',ey);
    p.dot.setAttribute('cx',ax);p.dot.setAttribute('cy',ay);p.ln.style.opacity=p.dot.style.opacity=clamp((S.lab-.4)*2,0,1);});
  if(vis_)requestAnimationFrame(frame);else parado=true;}
let vis_=true,parado=false;new IntersectionObserver(([en])=>{vis_=en.isIntersecting;if(vis_&&parado){parado=false;lt=performance.now();requestAnimationFrame(frame);}}).observe(palco);
requestAnimationFrame(frame);
