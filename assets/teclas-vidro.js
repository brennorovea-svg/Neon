import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/* TESTE (2026-11-18): teclas de vidro no hero, inspiradas no "Glass Keys" do React Bits Pro.
   Código original da Neon Scripts: o fonte do componente é pago e não foi usado.
   Grade de teclas de vidro com NEON e SCRIPTS escritos nelas; o mouse aperta as teclas,
   o clique manda uma onda, e parado o teclado "digita" NEON SCRIPTS sozinho.
   NEON e SCRIPTS acendem em cores opostas (rosa/azul) e trocam juntas, como o letreiro. */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=new URLSearchParams(location.search),STILL=Q.has('still');
const palco=document.querySelector('[data-palco]');
const cv=document.getElementById('gl');
const gr=document.getElementById('grade');if(gr)gr.hidden=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const C={pink:new THREE.Color('#FF2E9A'),blue:new THREE.Color('#2E8CFF'),lil:new THREE.Color('#B9A6FF'),pad:new THREE.Color('#1a0f33')};

/* ---------- teclado ---------- */
const ROWS=['QWERTYUIOP','AS NEON JK','Z SCRIPTS ','XCVBM,.;/?'];
const COLS=10,KS=1,GAP=.2,PITCH=KS+GAP,KH=.5,TAPER=.74,DISH=.05,TRAVEL=.3;
const GW=COLS*PITCH,GD=ROWS.length*PITCH;
function keyGeo(){const g=new RoundedBoxGeometry(KS,KS*KH,KS,4,.1);const p=g.attributes.position,h=KS*KH/2;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=(y+h)/(2*h),s=lerp(1,TAPER,t);x*=s;z*=s;
    if(t>.92){const r2=(x*x+z*z)/((KS*TAPER/2)**2);y-=DISH*Math.max(0,1-r2)*((t-.92)/.08);}p.setXYZ(i,x,y,z);}
  g.computeVertexNormals();return g;}
function eyePath(c,s){c.beginPath();c.moveTo(-s,0);c.quadraticCurveTo(0,-s*1.05,s,0);c.quadraticCurveTo(0,s*1.05,-s,0);c.closePath();}
function legendTex(ch,word){const cn=document.createElement('canvas');cn.width=cn.height=128;const c=cn.getContext('2d');
  c.translate(64,64);c.fillStyle=c.strokeStyle='#fff';c.lineWidth=7;c.lineJoin='round';
  if(word==='neon'&&ch==='O'){eyePath(c,40);c.stroke();c.beginPath();c.arc(0,0,13,0,7);c.fill();} /* O da logo v3 = olho */
  else{if(word==='neon'&&ch==='E')c.scale(-1,1); /* E espelhado da logo v3 */
    c.font=(word?'700 74px':'700 54px')+" 'Space Mono',ui-monospace,monospace";c.textAlign='center';c.textBaseline='middle';c.fillText(ch,0,4);}
  const t=new THREE.CanvasTexture(cn);t.anisotropy=4;return t;}

/* ---------- cena ---------- */
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:STILL});
renderer.setPixelRatio(Math.min(1.75,devicePixelRatio||1));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.setClearColor(0x000000,1);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x05030F,14,26); /* o fundo some como foco curto, sem custo de desfoque */
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.6;
const camera=new THREE.PerspectiveCamera(28,1,.1,80);
scene.add(new THREE.AmbientLight('#2a1f55',.6));
const LP=new THREE.PointLight('#FF2E9A',30,22,1.4),LB=new THREE.PointLight('#2E8CFF',30,22,1.4);scene.add(LP,LB);
const top=new THREE.DirectionalLight('#EDE6FF',.9);top.position.set(-2,6,3);scene.add(top);

/* base escura onde as teclas assentam; as teclas nascem de baixo dela */
const base=new THREE.Mesh(new THREE.PlaneGeometry(GW+30,GD+30),new THREE.MeshStandardMaterial({color:'#07041a',roughness:.55,metalness:.6}));
base.rotation.x=-Math.PI/2;scene.add(base);
const glass=new THREE.MeshPhysicalMaterial({color:'#ffffff',transmission:1,thickness:.7,ior:1.5,dispersion:1.6,roughness:.08,
  attenuationColor:new THREE.Color('#A24BFF'),attenuationDistance:3.2,clearcoat:1,clearcoatRoughness:.05,specularIntensity:1,envMapIntensity:1.3});
const KG=keyGeo(),PG=new THREE.PlaneGeometry(KS*.86,KS*.86),LG=new THREE.PlaneGeometry(KS*.66,KS*.66);
const keys=[];
ROWS.forEach((row,r)=>{const word=r===1?'neon':r===2?'scripts':null;
  [...row].forEach((ch,c)=>{const x=(c-(COLS-1)/2)*PITCH,z=(r-(ROWS.length-1)/2)*PITCH;
    const w=ch===' '?null:(word&&((r===1&&c>=3&&c<=6)||(r===2&&c>=2&&c<=8))?word:null);
    const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
    const cap=new THREE.Mesh(KG,glass);cap.position.y=KS*KH/2+.02;g.add(cap);
    /* letra impressa em cima do vidro (opaca com alphaTest, entra no bloom) */
    let lm=null;if(ch!==' '){lm=new THREE.MeshBasicMaterial({map:legendTex(ch,w),alphaTest:.35,toneMapped:false,color:C.lil.clone().multiplyScalar(.5)});
      const lg=new THREE.Mesh(LG,lm);lg.rotation.x=-Math.PI/2;lg.position.y=KS*KH+.03;g.add(lg);}
    /* luz de baixo da tecla */
    const pm=new THREE.MeshBasicMaterial({color:C.pad.clone(),toneMapped:false});const pad=new THREE.Mesh(PG,pm);pad.rotation.x=-Math.PI/2;pad.position.y=.012;g.add(pad);
    keys.push({g,cap,lm,pm,ch,w,x,z,p:0,v:0,lit:0,type:0,rise:0,d:0});});});
const ORD='NEONSCRIPTS'.split('').map((ch,i)=>keys.find(k=>k.w===(i<4?'neon':'scripts')&&k.ch===ch&&!(i<4?keys.slice(0,0):0)&&(i<4?true:true)));
/* NEON tem dois N: pega na ordem da esquerda para a direita */
(function(){const n=keys.filter(k=>k.w==='neon'),s=keys.filter(k=>k.w==='scripts');ORD.length=0;ORD.push(...n,...s);})();

const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.55,.5,.82);composer.addPass(bloom);composer.addPass(new OutputPass());

/* ---------- tamanho e câmera ---------- */
const CFG=window.TECLAS_CFG||{ex:.73,ey:.5,frac:.5};
let W=0,H=0,EX=0,EY=0,DIST=20;const TILT=THREE.MathUtils.degToRad(56),YAW=THREE.MathUtils.degToRad(-8);
function fit(){const r=palco.getBoundingClientRect();W=r.width;H=r.height;renderer.setSize(W,H,false);composer.setSize(W,H);bloom.setSize(W,H);
  camera.aspect=W/H;EX=W*CFG.ex;EY=H*CFG.ey;const vis=2*Math.tan(THREE.MathUtils.degToRad(14));
  DIST=Math.max(GW*.92/(vis*camera.aspect*CFG.frac),GD*1.5/(vis*.8));
  camera.setViewOffset(W,H,-(EX-W/2),-(EY-H/2),W,H);camera.far=DIST*3;camera.updateProjectionMatrix();scene.fog.near=DIST-3;scene.fog.far=DIST+GD*2.2;}
new ResizeObserver(fit).observe(palco);fit();
const par={x:0,y:0};
function placeCam(){const yaw=YAW+par.x*.1,tilt=TILT-par.y*.06;
  camera.position.set(Math.sin(yaw)*Math.cos(tilt)*DIST,Math.sin(tilt)*DIST,Math.cos(yaw)*Math.cos(tilt)*DIST);camera.lookAt(0,0,0);}

/* ---------- entrada ---------- */
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-KS*KH),hit=new THREE.Vector3();
let mouse=null,lastMove=-1e9,ndc=new THREE.Vector2();const ripples=[];
function toWorld(cx,cy){const r=cv.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);
  ray.setFromCamera(ndc,camera);return ray.ray.intersectPlane(plane,hit)?hit.clone():null;}
addEventListener('pointermove',e=>{const r=palco.getBoundingClientRect();if(e.clientY>r.bottom||e.clientY<r.top){mouse=null;return;}
  mouse={cx:e.clientX,cy:e.clientY,w:toWorld(e.clientX,e.clientY)};lastMove=performance.now();},{passive:true});
palco.addEventListener('pointerleave',()=>mouse=null);
cv.addEventListener('pointerdown',e=>{const w=toWorld(e.clientX,e.clientY);if(w&&Math.abs(w.x)<GW/2+1&&Math.abs(w.z)<GD/2+1)ripples.push({x:w.x,z:w.z,t:performance.now(),a:1});});

/* ---------- ritmo sozinho ---------- */
let swap=0,swapT=0,nextSwap=performance.now()+5200;   /* NEON/SCRIPTS trocam de cor juntas (700ms) */
let typeQ=[],nextType=performance.now()+1600,nextRip=performance.now()+7000;
function idle(now){if(RM||STILL)return;const quiet=now-lastMove>2500;
  if(now>nextType){if(quiet){ORD.forEach((k,i)=>typeQ.push({k,t:now+i*115+(i>=4?220:0)}));}nextType=now+(quiet?9000:4000);}
  if(now>nextRip){if(quiet){const k=keys[(Math.random()*keys.length)|0];ripples.push({x:k.x,z:k.z,t:now,a:.6});}nextRip=now+7000;}
  if(now>nextSwap){swapT=now;swap=1-swap;nextSwap=now+2600+Math.random()*3400;}}

/* ---------- quadro ---------- */
let started=!document.documentElement.classList.contains('pre'),t0=performance.now(),lt=t0;
const ease=t=>1-Math.pow(1-clamp(t,0,1),4); /* perto do cubic-bezier(.22,1,.36,1) */
const tmp=new THREE.Color();
function frame(now){const dt=Math.min(.05,(now-lt)/1000);lt=now;idle(now);
  const cur=mouse&&now-lastMove<2500?mouse:null;
  const px=cur?clamp((cur.cx-EX)/(W*.5),-1,1):0,py=cur?clamp((cur.cy-EY)/(H*.5),-1,1):0;
  const k2=RM?1:1-Math.exp(-dt*3);par.x=lerp(par.x,px,k2);par.y=lerp(par.y,py,k2);placeCam();
  /* luzes passeiam devagar em volta do teclado */
  const a=RM||STILL?.6:(now/1000)*THREE.MathUtils.degToRad(8);
  LP.position.set(Math.cos(a)*7,3.2,Math.sin(a)*4.5);LB.position.set(-Math.cos(a)*7,3.2,-Math.sin(a)*4.5);
  for(let i=ripples.length-1;i>=0;i--)if(now-ripples[i].t>2400)ripples.splice(i,1);
  for(let i=typeQ.length-1;i>=0;i--){const q=typeQ[i];if(now>=q.t){q.k.type=1;q.k.typeT=now;typeQ.splice(i,1);}}
  const sw=RM?swap:ease((now-swapT)/700),mixN=swap?sw:1-sw; /* 0 = NEON rosa, 1 = NEON azul */
  const since=(now-t0)/1000;
  for(const k of keys){
    /* sobe no lugar uma vez, do centro para fora */
    const rise=STILL||RM?1:ease((since-k.d)/.72);k.rise=rise;
    let tp=0;
    if(cur&&cur.w){const d2=(k.x-cur.w.x)**2+(k.z-cur.w.z)**2;tp=Math.max(tp,Math.exp(-d2/.5));}
    for(const r of ripples){const age=(now-r.t)/1000,d=Math.hypot(k.x-r.x,k.z-r.z),f=d-age*5.5;tp=Math.max(tp,r.a*Math.exp(-f*f/.6)*Math.exp(-age*1.1));}
    if(k.type&&now-k.typeT>170)k.type=0;if(k.type)tp=1;
    if(RM){k.p=tp;k.v=0;}else{k.v+=(320*(tp-k.p)-26*k.v)*dt;k.p+=k.v*dt;} /* mola curta, pouco rebote */
    const pr=clamp(k.p,-.15,1.05);
    k.g.position.y=-KS*KH*1.3*(1-rise)-pr*TRAVEL*KS*KH;
    k.lit=lerp(k.lit,clamp(tp,0,1),RM?1:1-Math.exp(-dt*(tp>k.lit?18:3.5)));
    /* cor: NEON e SCRIPTS opostas; resto lilás fraco */
    let base;if(k.w==='neon')base=tmp.copy(C.pink).lerp(C.blue,mixN);else if(k.w==='scripts')base=tmp.copy(C.blue).lerp(C.pink,mixN);else base=tmp.copy(C.lil);
    const on=k.w?1.9:.45;
    if(k.lm)k.lm.color.copy(base).multiplyScalar((on+k.lit*2.6)*rise);
    k.pm.color.copy(C.pad).lerp(base,k.w?.18+k.lit*.8:k.lit*.55).multiplyScalar(1+k.lit*1.8);}
  composer.render();
  if(run)requestAnimationFrame(frame);else parado=true;}
keys.forEach(k=>k.d=Math.hypot(k.x/PITCH,k.z/PITCH)*.07);
let run=true,parado=false;
function liga(){if(parado){parado=false;lt=performance.now();requestAnimationFrame(frame);}}
new IntersectionObserver(([en])=>{run=en.isIntersecting&&!document.hidden;if(run)liga();}).observe(palco);
document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)liga();});
function start(){t0=performance.now();nextType=t0+2400;requestAnimationFrame(frame);}
if(STILL){/* print: mostra uma tecla apertada e a onda do clique */
  keys.forEach(k=>k.rise=1);const fake=keys.find(k=>k.ch==='O');ripples.push({x:fake.x,z:fake.z,t:performance.now()-450,a:1});
  start();setTimeout(()=>window.__ready=true,1500);}
else if(started)start();else document.addEventListener('ns:acesa',start,{once:true});
