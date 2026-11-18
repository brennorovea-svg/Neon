/* TESTE (2026-11-18): título do hero que dá glitch perto do mouse, inspirado no "Glitch Text" do React Bits Pro.
   Código original da Neon Scripts (o fonte do componente é pago e não foi usado).
   Cada letra ganha duas cópias coloridas (rosa e azul, com roxo no meio) que se separam quanto mais perto
   o mouse está. Só transform e opacity. Desligado em reduzir movimento e no celular (sem mouse). */
(function(){
  const h=document.querySelector('.hero h1');if(!h)return;
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,TOUCH=matchMedia('(hover:none)').matches;
  if(RM||TOUCH)return;
  const RAD=220;
  const st=document.createElement('style');
  st.textContent=`.gl-c{position:relative;display:inline-block;white-space:pre}
.gl-c i{position:absolute;inset:0;font-style:normal;pointer-events:none;opacity:0;mix-blend-mode:screen;will-change:transform,opacity}
.gl-c i:nth-child(1){color:#FF2E9A}.gl-c i:nth-child(2){color:#2E8CFF}.gl-c i:nth-child(3){color:#A24BFF}
.gl-c b{font-weight:inherit;position:relative;display:inline-block;will-change:transform}
.gl-w{display:inline-block;white-space:nowrap}`;
  document.head.appendChild(st);
  /* troca o texto por letras, mantendo o span .acende e as quebras entre palavras */
  const chars=[];
  function wrap(node){[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part)return;if(/^\s+$/.test(part)){f.appendChild(document.createTextNode(part));return;}
        const w=document.createElement('span');w.className='gl-w';
        [...part].forEach(ch=>{const s=document.createElement('span');s.className='gl-c';s.setAttribute('aria-hidden','true');
          s.innerHTML='<i></i><i></i><i></i><b></b>';s.querySelectorAll('i,b').forEach(e=>e.textContent=ch);w.appendChild(s);chars.push({s,l:s.querySelectorAll('i'),b:s.querySelector('b'),x:0,y:0,e:0});});
        f.appendChild(w);});n.replaceWith(f);}
    else if(n.nodeType===1)wrap(n);});}
  h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
  wrap(h);
  function measure(){chars.forEach(c=>{const r=c.s.getBoundingClientRect();c.x=r.left+r.width/2+scrollX;c.y=r.top+r.height/2+scrollY;});}
  measure();addEventListener('resize',measure);if(document.fonts)document.fonts.ready.then(measure);addEventListener('load',measure);
  let mx=-1e4,my=-1e4,last=0,raf=0,tick=0;
  addEventListener('pointermove',e=>{mx=e.pageX;my=e.pageY;last=performance.now();if(!raf)raf=requestAnimationFrame(loop);},{passive:true});
  const R=()=>Math.random()*2-1;
  function loop(now){raf=0;let ativo=false;
    const novo=now-tick>55;if(novo)tick=now;/* sorteia o tremor ~18 vezes por segundo, como sinal ruim */
    const idle=now-last>1200;
    for(const c of chars){const d=Math.hypot(c.x-mx,c.y-my);let t=idle?0:Math.max(0,1-d/RAD);t=t*t;
      c.e+=(t-c.e)*(t>c.e?.35:.12);if(c.e<.01){if(c.on){c.l.forEach(l=>{l.style.opacity=0;l.style.transform='';});c.b.style.transform='';c.on=false;}continue;}
      ativo=true;c.on=true;
      if(novo){const e=c.e,a=e*9;
        c.l[0].style.transform=`translate(${(-a+R()*a*.5).toFixed(1)}px,${(R()*e*3).toFixed(1)}px)`;
        c.l[1].style.transform=`translate(${(a+R()*a*.5).toFixed(1)}px,${(R()*e*3).toFixed(1)}px)`;
        c.l[2].style.transform=`translate(${(R()*a*.6).toFixed(1)}px,${(R()*e*5).toFixed(1)}px) skewX(${(R()*e*14).toFixed(1)}deg)`;
        c.l[0].style.opacity=c.l[1].style.opacity=(.55+.45*e).toFixed(2);c.l[2].style.opacity=(Math.random()<e*.5?.8*e:0).toFixed(2);
        c.b.style.transform=Math.random()<e*.25?`translate(${(R()*e*4).toFixed(1)}px,0)`:'';}}
    if(ativo||!idle)raf=requestAnimationFrame(loop);}
  window.__glitchDemo=(x,y)=>{mx=x;my=y;last=performance.now();loop(performance.now()+1000);};
})();
