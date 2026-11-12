/* Scripts compartilhados da home e das páginas de seção. Cada bloco confere se o elemento existe na página. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax leve no hero: só a foto se move. A placa fica parada, quem anda é o olho
  var hero = document.getElementById('hero'); if (!hero) return;
  var layers = hero.querySelectorAll('.par[data-depth]');
  function onMove(e) {
    var r = hero.getBoundingClientRect();
    var mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    var my = ((e.clientY - r.top) / r.height) * 2 - 1;
    layers.forEach(function (el) {
      var d = Number(el.dataset.depth);
      var base = el.classList.contains('sign') && window.innerWidth <= 820 ? ' translateX(50%)' : '';
      el.style.transform = 'translate(' + Math.round(mx * -d) + 'px,' + Math.round(my * -d * 0.4) + 'px)' + base;
    });
  }
  if (!reduce && window.matchMedia('(pointer: fine)').matches) hero.addEventListener('mousemove', onMove);

  // Revela a plataforma quando entra na tela
  var items = document.querySelectorAll('.reveal');
  var timers = [];
  window.addEventListener('pagehide', function () { timers.forEach(clearTimeout); io && io.disconnect(); });
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { var t = en.target; io.unobserve(t); timers.push(setTimeout(function () { t.classList.add('in'); }, 380)); }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
})();

// Letreiro: a cada poucos segundos uma letra falha, o olho pisca, o letreiro todo pisca ou NEON e SCRIPTS trocam de cor entre si
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sign = document.querySelector('.sign'); if (!sign) return;
  var words = sign.querySelectorAll('.word');
  var letters = sign.querySelectorAll('.word > span');
  var olho = sign.querySelector('.o-olho');
  var timer;
  function blink(el) {
    el.classList.remove('pisca'); void el.offsetWidth; el.classList.add('pisca');
  }
  function tick() {
    if (!document.hidden) {
      var r = Math.random();
      if (r < 0.3) blink(letters[Math.floor(Math.random() * letters.length)]);
      else if (r < 0.5) { olho.classList.add('fecha'); setTimeout(function () { olho.classList.remove('fecha'); }, 150); }
      else if (r < 0.7) words.forEach(blink);
      else { words.forEach(blink); sign.classList.toggle('azul'); }
    }
    timer = setTimeout(tick, 2600 + Math.random() * 3400);
  }
  timer = setTimeout(tick, 2400);
  window.addEventListener('pagehide', function () { clearTimeout(timer); });
})();

// Olho segue o mouse: só a íris anda, até 11 unidades do centro, com suavização. Só em mouse e sem reduced-motion.
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var olhos = [].slice.call(document.querySelectorAll('.o-olho')).map(function (el) {
    return { el: el, g: el.querySelector('.olhar'), x: 0, y: 0, tx: 0, ty: 0 };
  });
  var mx = null, my = null, raf = 0;
  function frame() {
    raf = 0;
    var parado = true;
    olhos.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (mx !== null) {
        var dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 240);
        o.tx = dx / d * 11 * k; o.ty = dy / d * 6 * k;
      }
      o.x += (o.tx - o.x) * 0.18; o.y += (o.ty - o.y) * 0.18;
      if (Math.abs(o.tx - o.x) > 0.05 || Math.abs(o.ty - o.y) > 0.05) parado = false;
      o.g.setAttribute('transform', 'translate(' + o.x.toFixed(2) + ' ' + o.y.toFixed(2) + ')');
    });
    if (!parado) raf = requestAnimationFrame(frame);
  }
  function pede() { if (!raf) raf = requestAnimationFrame(frame); }
  function move(e) { mx = e.clientX; my = e.clientY; pede(); }
  function sai() { mx = null; olhos.forEach(function (o) { o.tx = 0; o.ty = 0; }); pede(); }
  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('mouseleave', sai);
  window.addEventListener('pagehide', function () {
    window.removeEventListener('pointermove', move);
    if (raf) cancelAnimationFrame(raf);
  });
})();

// Botão verde fixo: aparece depois do hero e sai de cena no Contato, onde já tem o botão de WhatsApp grande
(function(){var wa=document.querySelector('.wa'),hero=document.getElementById('hero'),ct=document.getElementById('contato');
if(!wa||!hero||!ct||!('IntersectionObserver' in window))return;
var noHero=true,noContato=false;
function upd(){wa.classList.toggle('show',!noHero&&!noContato)}
var io=new IntersectionObserver(function(e){noHero=e[0].isIntersecting;upd()},{threshold:0.05});
var io2=new IntersectionObserver(function(e){noContato=e[0].isIntersecting;upd()},{rootMargin:'0px 0px -25% 0px'});
io.observe(hero);io2.observe(ct);window.addEventListener('pagehide',function(){io.disconnect();io2.disconnect()});})();

// Projetos: um negócio por vez no palco (janelas empilhadas). Embaixo, um carrossel com nome e ramo de cada cliente; a cor do cliente pinta a seção.
(function () {
  var sec = document.getElementById('projetos'); if (!sec) return;
  var its = [].slice.call(sec.querySelectorAll('.cr-it')), jans = [].slice.call(sec.querySelectorAll('.cr-jan')), fs = [].slice.call(sec.querySelectorAll('.cr-f')),
      amb = [].slice.call(sec.querySelectorAll('.cr-amb i')), giga = sec.querySelector('.cr-giga span'), tri = sec.querySelector('.cr-trilho'),
      palco = sec.querySelector('.cr-palco'), car = sec.querySelector('.cr-car'), N = its.length, cur = -1, tm = 0, visto = false, pausa = false, hold = false, timers = [];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, ESPERA = 5600;
  function mede() { jans.forEach(function (j) { var sc = j.querySelector('.cr-scr'), img = j.querySelector('img'); j.style.setProperty('--shift', Math.min(0, sc.clientHeight - img.offsetHeight) + 'px'); }); }
  function centra(n, suave) { var it = its[n]; tri.scrollTo({ left: it.offsetLeft - (tri.clientWidth - it.offsetWidth) / 2, behavior: suave && !reduce ? 'smooth' : 'auto' }); }
  function agenda() { clearTimeout(tm); var roda = visto && !pausa && !hold && !reduce;
    its.forEach(function (it, i) { it.classList.toggle('roda', roda && i === cur); });
    if (roda) tm = setTimeout(function () { if (document.hidden) { agenda(); return; } vai(cur + 1); }, ESPERA); }
  function vai(n, foco) { n = (n + N) % N; if (n === cur) return; var prev = cur; cur = n; var it = its[n];
    jans.forEach(function (j, i) { var o = (i - n + N) % N; j.classList.toggle('on', o === 0); j.tabIndex = o === 0 ? 0 : -1; j.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
      if (i === prev && !reduce) { j.classList.add('sai'); timers.push(setTimeout(function () { j.style.setProperty('--o', o); j.classList.remove('sai'); }, 430)); } else j.style.setProperty('--o', o); });
    its.forEach(function (x, i) { x.setAttribute('aria-selected', i === n ? 'true' : 'false'); x.tabIndex = i === n ? 0 : -1; x.classList.remove('roda'); });
    fs.forEach(function (f, i) { f.classList.toggle('on', i === n); });
    amb.forEach(function (a, i) { a.classList.toggle('on', i === n); });
    sec.style.setProperty('--c', it.style.getPropertyValue('--c')); sec.style.setProperty('--c2', it.style.getPropertyValue('--c2'));
    if (giga) { giga.classList.add('o'); timers.push(setTimeout(function () { giga.textContent = it.dataset.g; giga.classList.remove('o'); }, reduce ? 0 : 220)); }
    if (prev >= 0) centra(n, true);
    if (foco) it.focus({ preventScroll: true });
    void sec.offsetWidth; agenda(); }
  its.forEach(function (it, i) {
    it.addEventListener('click', function () { hold = true; vai(i); agenda(); });
    it.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); hold = true; vai(cur + d, true); agenda(); });
  });
  [].slice.call(sec.querySelectorAll('.cr-seta')).forEach(function (b) { b.addEventListener('click', function () { hold = true; vai(cur + (+b.dataset.d)); agenda(); }); });
  [palco, car].forEach(function (el) {
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { pausa = true; agenda(); } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { pausa = false; agenda(); } });
    el.addEventListener('focusin', function () { pausa = true; agenda(); });
    el.addEventListener('focusout', function () { pausa = false; agenda(); });
  });
  // celular: arrastar o palco pro lado troca o cliente
  var x0 = null, y0 = 0, arrastou = 0;
  palco.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  palco.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) { arrastou = Date.now(); hold = true; vai(cur + (dx < 0 ? 1 : -1)); agenda(); } }, { passive: true });
  palco.addEventListener('click', function (e) { if (Date.now() - arrastou < 400) e.preventDefault(); }, true);
  jans.forEach(function (j) { var img = j.querySelector('img'); if (!img.complete) img.addEventListener('load', mede); });
  window.addEventListener('resize', function () { mede(); centra(cur, false); });
  vai(0); mede(); centra(0, false);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { visto = en[0].isIntersecting; if (visto) { mede(); centra(cur, false); } agenda(); }, { threshold: 0.35 });
    io.observe(sec);
    window.addEventListener('pagehide', function () { io.disconnect(); clearTimeout(tm); timers.forEach(clearTimeout); });
  }
})();

// Movimento (neon-motion): sobretítulo decodifica, legenda digitada e aurora do Contato
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var timers = [], ios = [];
  window.addEventListener('pagehide', function () { timers.forEach(clearTimeout); ios.forEach(function (o) { o.disconnect(); }); });

  // Hero: as letras do sobretítulo embaralham e travam da esquerda para a direita, uma vez
  var eb = document.querySelector('.hero .eyebrow');
  if (eb) {
    var T = eb.textContent, CH = '!<>-_/[]{}=+*^?#', t0 = performance.now();
    eb.innerHTML = '<span class="sr-only"></span><span aria-hidden="true"></span>';
    eb.firstChild.textContent = T;
    var vis = eb.lastChild;
    (function step() {
      var e = performance.now() - t0, out = '', done = true;
      for (var i = 0; i < T.length; i++) {
        if (T[i] === ' ' || e >= 450 + i * 28) out += T[i];
        else { done = false; out += CH[Math.floor(Math.random() * CH.length)]; }
      }
      vis.textContent = out;
      if (!done) timers.push(setTimeout(step, 40));
    })();
  }

  // Botões de WhatsApp: no clique, além de afundar, o brilho estoura e volta (260ms)
  document.querySelectorAll('a.btn[href*="wa.me"], a.wa').forEach(function (b) {
    b.addEventListener('pointerdown', function () {
      var cor = b.classList.contains('wa') ? '37,211,102' : '255,46,154';
      var base = getComputedStyle(b).boxShadow;
      b.animate([{ boxShadow: base }, { boxShadow: '0 0 46px 10px rgba(' + cor + ',.95)', offset: .35 }, { boxShadow: base }], { duration: 260, easing: 'ease-out' });
    });
  });

  if (!('IntersectionObserver' in window)) return;

  // Quem somos: a legenda da foto é digitada quando a foto aparece
  var fig = document.querySelector('.quem-foto');
  var cap = fig && fig.querySelector('figcaption');
  if (cap) {
    var txt = cap.textContent.replace(/^\s*\$\s*/, '');
    cap.innerHTML = '<b>$</b> <span class="sr-only"></span><span aria-hidden="true"></span><span class="cur" aria-hidden="true"></span>';
    cap.children[1].textContent = txt;
    var out = cap.children[2], cur = cap.children[3];
    var io1 = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io1.disconnect();
      var i = 0;
      // espera a foto terminar de revelar (380ms + 600ms) antes de digitar
      timers.push(setTimeout(function type() {
        if (i < txt.length) { out.textContent += txt[i++]; timers.push(setTimeout(type, 30 + Math.random() * 40)); }
        else timers.push(setTimeout(function () { cur.style.animation = 'none'; cur.style.opacity = 0; }, 1400));
      }, 1000));
    }, { threshold: 0.4 });
    io1.observe(fig); ios.push(io1);
  }

  // Contato: a aurora só se move enquanto a seção está na tela
  var ct = document.getElementById('contato');
  if (ct) {
    var io2 = new IntersectionObserver(function (en) { ct.classList.toggle('viva', en[0].isIntersecting); });
    io2.observe(ct); ios.push(io2);
  }
})();

// Menu no celular: a tela escurece e as seções descem em cascata; fecha na ordem inversa
(function () {
  var menu = document.getElementById('menu-cel');
  var abre = document.querySelector('nav .mbtn');
  if (!menu) return;
  var fecha = menu.querySelector('[data-fecha]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer;
  function abrir() {
    clearTimeout(timer);
    menu.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    abre.setAttribute('aria-expanded', 'true');
    void menu.offsetWidth;
    menu.classList.add('open');
    fecha.focus();
  }
  function fechar(volta) {
    if (menu.hidden) return;
    menu.classList.remove('open');
    abre.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    timer = setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 420);
    if (volta) abre.focus();
  }
  abre.addEventListener('click', abrir);
  fecha.addEventListener('click', function () { fechar(true); });
  menu.querySelectorAll('.mlist a, .mtop a').forEach(function (a) { a.addEventListener('click', function () { fechar(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(true); });
  window.addEventListener('pagehide', function () { clearTimeout(timer); });
})();

// Movimento no celular (sem mouse): olho segue o toque e a rolagem, serviço do meio acende, clientes espiam e o print rola sozinho
(function () {
  var mq = window.matchMedia;
  if (!mq || mq('(prefers-reduced-motion: reduce)').matches || !mq('(hover: none)').matches) return;
  var timers = [], ios = [];
  window.addEventListener('pagehide', function () { timers.forEach(clearTimeout); ios.forEach(function (o) { o.disconnect(); }); });

  // Olho: ao tocar, a íris olha para o ponto do toque e volta ao centro; ao rolar, olha para baixo
  var olhos = [].slice.call(document.querySelectorAll('.o-olho')).map(function (el) {
    return { el: el, g: el.querySelector('.olhar'), x: 0, y: 0, tx: 0, ty: 0 };
  });
  var raf = 0, volta = 0;
  function frame() {
    raf = 0;
    var parado = true;
    olhos.forEach(function (o) {
      o.x += (o.tx - o.x) * 0.18; o.y += (o.ty - o.y) * 0.18;
      if (Math.abs(o.tx - o.x) > 0.05 || Math.abs(o.ty - o.y) > 0.05) parado = false;
      o.g.setAttribute('transform', 'translate(' + o.x.toFixed(2) + ' ' + o.y.toFixed(2) + ')');
    });
    if (!parado) raf = requestAnimationFrame(frame);
  }
  function pede(ms) {
    if (!raf) raf = requestAnimationFrame(frame);
    clearTimeout(volta);
    volta = setTimeout(function () { olhos.forEach(function (o) { o.tx = 0; o.ty = 0; }); if (!raf) raf = requestAnimationFrame(frame); }, ms);
  }
  function visivel(o) { var r = o.el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }
  window.addEventListener('pointerdown', function (e) {
    olhos.forEach(function (o) {
      if (!visivel(o)) return;
      var r = o.el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 160);
      o.tx = dx / d * 11 * k; o.ty = dy / d * 6 * k;
    });
    pede(1100);
  }, { passive: true });
  var ultimoY = scrollY;
  window.addEventListener('scroll', function () {
    var desce = scrollY > ultimoY; ultimoY = scrollY;
    olhos.forEach(function (o) { if (visivel(o)) { o.tx = 0; o.ty = desce ? 6 : -6; } });
    pede(600);
  }, { passive: true });

  if (!('IntersectionObserver' in window) || !mq('(max-width: 820px)').matches) return;

  // Serviços: o card que passa pela faixa do meio da tela ganha o sublinhado e a borda acesa
  var cards = document.querySelectorAll('.grid .card');
  var naFaixa = [];
  var io1 = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      var i = naFaixa.indexOf(e.target);
      if (e.isIntersecting && i < 0) naFaixa.push(e.target);
      if (!e.isIntersecting && i >= 0) naFaixa.splice(i, 1);
    });
    // só um aceso por vez: o mais perto do meio da tela
    var meio = innerHeight / 2, melhor = null, dist = 1e9;
    naFaixa.forEach(function (c) { var r = c.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - meio); if (d < dist) { dist = d; melhor = c; } });
    cards.forEach(function (c) { c.classList.toggle('foco', c === melhor); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  cards.forEach(function (c) { io1.observe(c); }); ios.push(io1);

})();

/* Filme do hero (rua do bairro acendendo): só no computador e sem "reduzir movimento". No celular nem baixa. */
(function(){
  var v = document.querySelector('.ph-video');
  if (!v || !window.matchMedia) return;
  if (!window.matchMedia('(min-width: 821px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
  var q = 'anime';
  [['webm','video/webm'],['mp4','video/mp4']].forEach(function(f){
    var s = document.createElement('source'); s.src = 'assets/hero/' + q + '.' + f[0]; s.type = f[1]; v.appendChild(s);
  });
  /* Se o filme não tocar (erro ou demora), a foto volta */
  var root = document.documentElement;
  var fallback;
  v.addEventListener('error', function(){ clearTimeout(fallback); root.classList.remove('hero-film'); }, true);
  v.addEventListener('playing', function(){ clearTimeout(fallback); root.classList.add('hero-film'); v.classList.add('on'); }, {once:true});
  function toca(){ fallback = setTimeout(function(){ root.classList.remove('hero-film'); }, 3000); v.load(); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
  /* Com a entrada da tecla, o filme só começa quando a placa acende */
  if (root.classList.contains('pre')) document.addEventListener('ns:acesa', toca, {once:true}); else toca();
  document.addEventListener('visibilitychange', function(){ if (document.hidden) v.pause(); else if (!v.ended) v.play().catch(function(){}); });
})();

(function(){
  var mn=document.getElementById('pmenu'),nav=document.querySelector('nav'),links=nav&&nav.querySelector('.links');
  if(!mn||!links)return;
  var E='cubic-bezier(.22,1,.36,1)',calmo=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sl=function(ms){return new Promise(function(r){setTimeout(r,calmo?0:ms)})};
  var bt=document.createElement('button');
  bt.type='button';bt.className='sand';bt.setAttribute('aria-expanded','false');bt.setAttribute('aria-controls','pmenu');
  bt.innerHTML='<i aria-hidden="true"><b></b><b></b><b></b></i><span>Menu</span>';
  links.appendChild(bt);
  var f=mn.querySelector('.fundo'),pn=mn.querySelector('.pn'),dc=mn.querySelector('.dec'),pe=mn.querySelector('.pe'),as=[].slice.call(mn.querySelectorAll('li a'));
  var aberto=false,ocupado=false;
  function A(el,kf,o){return el.animate(kf,Object.assign({easing:E,fill:'forwards',duration:1},o,calmo?{duration:1,delay:0}:{}))}
  function limpa(){[f,pn,dc,pe].concat(as).forEach(function(el){el.getAnimations().forEach(function(x){x.cancel()})});as.forEach(function(x){x.querySelector('.nm').getAnimations().forEach(function(y){y.cancel()})})}
  function decod(el,txt){var CH='!<>-_/[]{}=+*^?#',t0=performance.now();(function g(){var e=performance.now()-t0,s='',ok=true;for(var i=0;i<txt.length;i++){if(e>=200+i*40)s+=txt[i];else{ok=false;s+=CH[Math.random()*CH.length|0]}}el.textContent=s;if(!ok&&!calmo&&aberto)setTimeout(g,40);else el.textContent=txt})()}
  function rumo(){var a=bt.getBoundingClientRect(),b=pn.getBoundingClientRect();return 'translate('+(a.right-b.right)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')'}
  function estado(on){
    aberto=on;bt.classList.toggle('x',on);bt.querySelector('span').textContent=on?'Fechar':'Menu';
    bt.setAttribute('aria-expanded',on?'true':'false');mn.setAttribute('aria-hidden',on?'false':'true');
  }
  async function abre(){
    estado(true);nav.classList.add('sobre');mn.classList.add('on');
    pn.style.top=(bt.getBoundingClientRect().bottom+14)+'px';pn.style.visibility='visible';
    A(f,[{opacity:0},{opacity:1}],{duration:250});
    A(pn,[{transform:rumo(),backgroundColor:'#FF2E9A',borderRadius:'999px'},{transform:'none',backgroundColor:'#120B30',borderRadius:'22px'}],{duration:420});
    await sl(300);dc.style.opacity=1;decod(dc,'MENU');
    as.forEach(function(x,i){
      A(x,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:600,delay:i*70});
      if(!calmo)x.querySelector('.nm').animate([{opacity:.1,offset:0},{opacity:1,offset:.1},{opacity:.2,offset:.16},{opacity:1,offset:.26},{opacity:.4,offset:.32},{opacity:1,offset:.42},{opacity:1}],{duration:900,delay:200+i*70});
    });
    A(pe,[{opacity:0},{opacity:1}],{duration:600,delay:500});
    as[0].focus({preventScroll:true});
  }
  async function fecha(){
    estado(false);
    as.concat([pe,dc]).forEach(function(x){A(x,[{opacity:1},{opacity:0}],{duration:120})});
    await A(pn,[{transform:'none',backgroundColor:'#120B30',borderRadius:'22px'},{transform:rumo(),backgroundColor:'#FF2E9A',borderRadius:'999px'}],{duration:340,easing:'cubic-bezier(.65,0,.35,1)'}).finished;
    pn.style.visibility='hidden';await A(f,[{opacity:1},{opacity:0}],{duration:200}).finished;
    fim();bt.focus({preventScroll:true});
  }
  function fim(){limpa();pn.style.visibility='hidden';dc.style.opacity=0;mn.classList.remove('on');nav.classList.remove('sobre')}
  bt.addEventListener('click',function(){if(ocupado)return;ocupado=true;(aberto?fecha():abre()).then(function(){ocupado=false})});
  f.addEventListener('click',function(){if(aberto&&!ocupado)bt.click()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&aberto&&!ocupado)bt.click()});
  /* Clique num item: fecha na hora e deixa o link seguir */
  as.forEach(function(a){a.addEventListener('click',function(){estado(false);fim();ocupado=false})});
  /* Se a tela encolher para o celular com o painel aberto */
  matchMedia('(max-width:820px)').addEventListener('change',function(e){if(e.matches&&aberto){estado(false);fim()}});
})();

/* Rodapé: o tubo de neon se desenha e os títulos acendem quando o rodapé aparece */
(function(){
  var r=document.querySelector('.rodape');
  if(!r||!r.querySelector('.tubo-r')||!('IntersectionObserver' in window))return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  r.classList.add('tubo-pronto');
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){r.classList.add('on');io.disconnect();}},{threshold:.25});
  io.observe(r);
})();
