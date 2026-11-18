/* TESTE (2026-11-18): fundo do hero com persianas de luz, inspirado no "Chroma Blinds" do React Bits Pro.
   Código original da Neon Scripts (o fonte do componente é pago e não foi usado).
   Listras diagonais em roxo, rosa e azul que se inclinam na direção do mouse; o clique dá um estouro de contraste.
   Só no computador; com reduzir movimento fica parado; para quando o hero sai da tela. */
const palco=document.querySelector('[data-palco]');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,STILL=new URLSearchParams(location.search).has('still');
const P=Object.assign({lines:10,thick:.24,sharp:.55,speed:.6,angle:45,zoom:.75,pulse:.5,pulseSpeed:.2,contrast:1.2,
  a:'#3A0A78',b:'#FF2E9A',c:'#2E8CFF',bg:'#05030F',opacity:.6,bend:6,lerp:.05,burst:1.6,decay:2.5},window.PERSIANAS_CFG||{});
const cv=document.createElement('canvas');cv.id='blinds';cv.setAttribute('aria-hidden','true');
cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
const gl0=document.getElementById('gl');if(gl0)gl0.hidden=true;const gr=document.getElementById('grade');if(gr)gr.hidden=true;
palco.insertBefore(cv,palco.querySelector('.shade'));
const gl=cv.getContext('webgl',{premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:STILL});
if(gl){
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fs=`precision highp float;uniform vec2 R;uniform float T,ANG,BURST;uniform vec2 M;
uniform vec3 A,B,C,BG;uniform float N,TH,SH,Z,PS,PSP,CT,OP;
vec3 pal(float t){t=fract(t)*3.;vec3 c=mix(A,B,smoothstep(0.,1.,t));c=mix(c,C,smoothstep(1.,2.,t));return mix(c,A,smoothstep(2.,3.,t));}
void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
  float a=radians(ANG);vec2 d=vec2(cos(a),sin(a));
  float u=dot(uv,d)/Z*N*.5+T;                  /* posição ao longo das listras */
  float k=floor(u),f=fract(u);
  float w=TH*.5,edge=.5*(1.-clamp(SH,.2,1.5)/1.5)+.02;
  float band=smoothstep(.5-w-edge,.5-w,f)*(1.-smoothstep(.5+w,.5+w+edge,f));
  float glow=exp(-pow((f-.5)/(w+.18),2.)*2.)*.45;
  float r=length(uv-(M-.5)*vec2(R.x/R.y,1.));
  float ph=k/3.+PS*.35*sin(r*3.-T*PSP*6.2831);  /* deriva radial de cor */
  vec3 col=pal(ph);
  float v=clamp(band+glow,0.,1.);
  v=pow(v,1./(CT*BURST));
  float side=smoothstep(.22,.62,gl_FragCoord.x/R.x); /* o lado do texto fica calmo */
  vec3 o=mix(BG,col*(1.+.6*(BURST-1.)),v*OP*(.18+.82*side));
  gl_FragColor=vec4(o,1.);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(o));return o;}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
const U={};['R','T','ANG','BURST','M','A','B','C','BG','N','TH','SH','Z','PS','PSP','CT','OP'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
gl.uniform3fv(U.A,hex(P.a));gl.uniform3fv(U.B,hex(P.b));gl.uniform3fv(U.C,hex(P.c));gl.uniform3fv(U.BG,hex(P.bg));
gl.uniform1f(U.N,P.lines);gl.uniform1f(U.TH,P.thick);gl.uniform1f(U.SH,P.sharp);gl.uniform1f(U.Z,P.zoom);gl.uniform1f(U.PS,P.pulse);gl.uniform1f(U.PSP,P.pulseSpeed);gl.uniform1f(U.CT,P.contrast);gl.uniform1f(U.OP,P.opacity);
const DPR=Math.min(1.5,devicePixelRatio||1);
function fit(){const r=palco.getBoundingClientRect();cv.width=Math.round(r.width*DPR);cv.height=Math.round(r.height*DPR);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(U.R,cv.width,cv.height);}
new ResizeObserver(fit).observe(palco);fit();
let m=[.7,.5],mt=[.7,.5],ang=P.angle,burst=1,t=0,lt=performance.now();
addEventListener('pointermove',e=>{const r=palco.getBoundingClientRect();mt=[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height];},{passive:true});
palco.addEventListener('pointerdown',e=>{if(!e.target.closest('a,button'))burst=P.burst;});
let run=true,parado=false;
function frame(now){const dt=Math.min(.05,(now-lt)/1000);lt=now;
  if(!RM&&!STILL)t+=dt*P.speed*.25;
  m[0]+=(mt[0]-m[0])*P.lerp;m[1]+=(mt[1]-m[1])*P.lerp;
  const tgt=P.angle+(m[0]-.5)*2*P.bend;ang+=(tgt-ang)*P.lerp;         /* listras viram até 6° na direção do mouse */
  burst=1+(burst-1)*Math.exp(-dt*P.decay);
  gl.uniform1f(U.T,t);gl.uniform1f(U.ANG,ang);gl.uniform1f(U.BURST,burst);gl.uniform2f(U.M,m[0],m[1]);
  gl.drawArrays(gl.TRIANGLES,0,3);
  if(run&&!RM)requestAnimationFrame(frame);else parado=true;}
function liga(){if(parado&&!RM){parado=false;lt=performance.now();requestAnimationFrame(frame);}}
new IntersectionObserver(([en])=>{run=en.isIntersecting&&!document.hidden;if(run)liga();}).observe(palco);
document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)liga();});
requestAnimationFrame(frame);
if(RM)addEventListener('pointermove',()=>requestAnimationFrame(frame),{passive:true});
}
window.__ready=true;
