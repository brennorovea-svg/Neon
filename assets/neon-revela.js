/* TESTE (2026-11-18): tubo de neon que acende e revela o conteúdo, inspirado no "Neon Reveal" do React Bits Pro.
   Código original da Neon Scripts (o fonte do componente é pago e não foi usado).
   Tudo com transform e opacity: o tubo acende (pisca e firma), cresce a partir de um ponto, e uma cortina
   escura com borda macia corre na direção da luz. Reduzir movimento = já aparece revelado.
   Uso: NeonRevela(elemento, {dir, from, colors, dur, delay, flicker, feather, inset, length, reach, mirrored, ease, trigger}) */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE={out:'cubic-bezier(.22,1,.36,1)',smooth:'cubic-bezier(.65,0,.35,1)',gentle:'cubic-bezier(.33,.0,.2,1)',linear:'linear'};
const OPP={down:'up',up:'down',left:'right',right:'left'};
const st=document.createElement('style');
st.textContent=`.nr-clip{position:absolute;overflow:hidden;pointer-events:none;z-index:60}
.nr-cover{position:absolute;will-change:transform}
.nr-tube{position:absolute;border-radius:99px;opacity:0;will-change:transform,opacity;z-index:2}
.nr-spill{position:absolute;opacity:0;pointer-events:none;z-index:1;will-change:opacity}
.nr-dica{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:61;font:600 13px 'Space Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:#B9A6FF;opacity:.8;pointer-events:none;transition:opacity 300ms cubic-bezier(.22,1,.36,1)}`;
document.head.appendChild(st);
const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`;};

window.NeonRevela=function(el,o){
  o=Object.assign({dir:'down',from:'center',colors:['#FF2E9A','#A24BFF'],dur:2500,delay:300,flicker:1,feather:.15,inset:14,
    length:.9,reach:1,thick:3,mirrored:false,ease:'out',trigger:'mount',night:'#05030F',interactive:false,dica:''},o||{});
  if(!el)return;
  const cs=getComputedStyle(el);if(cs.position==='static')el.style.position='relative';if(cs.display==='inline')el.style.display='inline-block';
  const [tc,lc]=o.colors;const sides=o.mirrored?[o.dir,OPP[o.dir]]:[o.dir];const parts=[];
  sides.forEach((d,i)=>{
    const clip=document.createElement('div');clip.className='nr-clip';
    const half=o.mirrored?'50%':'100%';
    /* região de cada lado: inteira, ou metade quando espelhado */
    if(d==='down')Object.assign(clip.style,{left:0,right:0,top:0,height:half});
    if(d==='up')Object.assign(clip.style,{left:0,right:0,bottom:0,height:half});
    if(d==='right')Object.assign(clip.style,{top:0,bottom:0,left:0,width:half});
    if(d==='left')Object.assign(clip.style,{top:0,bottom:0,right:0,width:half});
    const cover=document.createElement('div');cover.className='nr-cover';
    const tube=document.createElement('div');tube.className='nr-tube';
    const spill=document.createElement('div');spill.className='nr-spill';
    const horiz=d==='down'||d==='up';
    tube.style.background=`linear-gradient(${horiz?90:0}deg,${tc},#FFF2FA 50%,${tc})`;
    tube.style.boxShadow=`0 0 3px ${tc},0 0 10px ${tc},0 0 26px ${lc},0 0 60px ${rgba(lc,.6)}`;
    const L=o.length*100,ofs=(100-L)/2;
    if(horiz){Object.assign(tube.style,{left:ofs+'%',width:L+'%',height:o.thick+'px',[d==='down'?'top':'bottom']:o.inset+'px'});
      tube.style.transformOrigin=o.from==='left'?'left center':o.from==='right'?'right center':'center';}
    else{Object.assign(tube.style,{top:ofs+'%',height:L+'%',width:o.thick+'px',[d==='right'?'left':'right']:o.inset+'px'});
      tube.style.transformOrigin=o.from==='left'?'center bottom':o.from==='right'?'center top':'center';}
    const side={down:'top',up:'bottom',right:'left',left:'right'}[d];
    Object.assign(spill.style,horiz?{left:ofs+'%',width:L+'%',[side]:o.inset+'px',height:(o.reach*55)+'%'}:{top:ofs+'%',height:L+'%',[side]:o.inset+'px',width:(o.reach*45)+'%'});
    spill.style.background=`radial-gradient(ellipse 60% 100% at ${horiz?'50% '+(d==='down'?'0%':'100%'):(d==='right'?'0%':'100%')+' 50%'},${rgba(lc,.34)},${rgba(lc,.1)} 45%,transparent 75%)`;
    clip.append(cover,spill,tube);el.appendChild(clip);
    parts.push({d,clip,cover,tube,spill,horiz});});
  let dica=null;if(o.dica){dica=document.createElement('span');dica.className='nr-dica';dica.textContent=o.dica;el.appendChild(dica);}
  function layout(){parts.forEach(p=>{const r=p.clip.getBoundingClientRect(),S=p.horiz?r.height:r.width,F=Math.max(24,o.feather*S);p.S=S;p.F=F;
    const gdir={down:'to bottom',up:'to top',right:'to right',left:'to left'}[p.d];
    p.cover.style.background=`linear-gradient(${gdir},transparent 0,${o.night} ${F}px,${o.night})`;
    const k={down:'top',up:'bottom',right:'left',left:'right'}[p.d];
    Object.assign(p.cover.style,p.horiz?{left:0,right:0,top:'',bottom:'',height:(S+F)+'px'}:{top:0,bottom:0,left:'',right:'',width:(S+F)+'px'});
    p.cover.style[k]=(-F)+'px';});}
  layout();addEventListener('resize',layout);
  const away=p=>{const v=p.S+p.F;return p.d==='down'?`translateY(${v}px)`:p.d==='up'?`translateY(${-v}px)`:p.d==='right'?`translateX(${v}px)`:`translateX(${-v}px)`;};
  const sc=p=>p.horiz?'scaleX':'scaleY';
  function revealed(){parts.forEach(p=>{p.cover.style.transform=away(p);p.tube.style.opacity=1;p.tube.style.transform='none';p.spill.style.opacity=.6;});}
  function apaga(){parts.forEach(p=>{p.cover.getAnimations().forEach(a=>a.cancel());p.tube.getAnimations().forEach(a=>a.cancel());p.spill.getAnimations().forEach(a=>a.cancel());
    p.cover.style.transform='none';p.tube.style.opacity=0;p.spill.style.opacity=0;p.tube.style.transform=`${sc(p)}(0)`;});}
  let rodando=false;
  function play(delay){if(RM){revealed();return;}rodando=true;layout();apaga();if(dica)dica.style.opacity=0;
    const D=o.dur,ez=EASE[o.ease]||EASE.out,fl=o.flicker;
    parts.forEach(p=>{
      /* tubo: pisca (mais forte com flicker alto) e firma */
      const kf=fl>0?[{opacity:0},{opacity:.85,offset:.12},{opacity:.1,offset:.2},{opacity:.95*Math.min(1,fl),offset:.32},{opacity:.25,offset:.4},{opacity:1,offset:.55},{opacity:.7,offset:.7},{opacity:1}]:[{opacity:0},{opacity:1}];
      p.tube.animate(kf,{duration:fl>0?380+260*fl:300,delay,fill:'forwards',easing:'linear'});
      p.tube.animate([{transform:`${sc(p)}(.04)`},{transform:`${sc(p)}(1)`}],{duration:D*.42,delay,fill:'forwards',easing:ez});
      p.spill.animate([{opacity:0},{opacity:1,offset:.3},{opacity:.6}],{duration:D*1.2,delay:delay+120,fill:'forwards',easing:ez});
      p.cover.animate([{transform:'none'},{transform:away(p)}],{duration:D,delay:delay+140,fill:'forwards',easing:ez}).onfinish=()=>{rodando=false;};});}
  el.__nr={play,apaga,revealed};
  if(o.interactive)el.addEventListener('click',e=>{if(e.target.closest('a,button,select,input,label'))return;
    if(rodando){parts.forEach(p=>p.tube.animate([{opacity:1},{opacity:.2},{opacity:1}],{duration:160}));return;}play(120);});
  const start=()=>play(o.delay);
  if(RM){revealed();return el.__nr;}
  apaga();
  if(o.trigger==='manual'){if(dica)dica.style.opacity=.8;parts.forEach(p=>{p.tube.style.opacity=.18;p.tube.style.transform='none';});}
  else if(o.trigger==='inView'){const io=new IntersectionObserver(([en])=>{if(en.intersectionRatio>=.3){io.disconnect();start();}},{threshold:[0,.3,.6]});io.observe(el);}
  else if(document.documentElement.classList.contains('pre'))document.addEventListener('ns:acesa',start,{once:true});
  else start();
  return el.__nr;};
})();
