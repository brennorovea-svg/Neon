import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

/* Neon, a personagem do site (2026-11-12): o olho da logo em tubo de neon 3D, com sobrancelha de mola.
   Fica no canto de baixo à direita. Reage (olha o mouse, pisca, muda de cara por seção, leva susto, fica com sono)
   e, no clique, abre o chat guiado dela (assets/neon-chat.js, carregado só no primeiro clique).
   Regras: só desenha quando algo mexe, para com a aba oculta, com movimento reduzido fica parada,
   na home espera a entrada acender (evento ns:acesa). */

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOV = !RM;
const CEL = matchMedia('(max-width: 820px)').matches;
const V3 = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const ROSA = 0xFF5FB4, AZUL = 0x6FB8FF;

/* sobrancelha: altura dos 5 pontos; olho: abertura da pálpebra */
const XS = [-.66, -.34, 0, .34, .66];
const EXP = {
  neutro:   {y: [1.20, 1.33, 1.38, 1.33, 1.20], olho: 1},
  oi:       {y: [1.20, 1.33, 1.38, 1.33, 1.20], olho: 1, danca: true},
  susto:    {y: [1.42, 1.62, 1.70, 1.62, 1.42], olho: 1.14},
  curioso:  {y: [1.12, 1.22, 1.30, 1.46, 1.52], olho: 1, inclina: -.12},
  pensando: {y: [1.40, 1.42, 1.34, 1.24, 1.16], olho: .82, inclina: .1},
  carinho:  {y: [1.06, 1.26, 1.38, 1.26, 1.06], olho: .78},
  orgulho:  {y: [1.24, 1.46, 1.56, 1.46, 1.24], olho: .9},
  animado:  {y: [1.30, 1.50, 1.58, 1.50, 1.30], olho: 1.08},
  sono:     {y: [1.10, 1.14, 1.16, 1.14, 1.10], olho: .42}
};
/* cara por seção (a que estiver no meio da tela) */
const SECOES = {hero: 'oi', servicos: 'curioso', projetos: 'orgulho', clientes: 'orgulho', como: 'pensando', quem: 'carinho', contato: 'animado'};


/* estilo da caixa (fica aqui para valer em todas as páginas, inclusive a loja) */
const CSS = `.neonp{position:fixed;z-index:8;right:max(8px,env(safe-area-inset-right));bottom:calc(8px + env(safe-area-inset-bottom));width:100px;height:100px;opacity:0;transform:translateY(16px);transition:opacity 720ms cubic-bezier(.22,1,.36,1),transform 720ms cubic-bezier(.22,1,.36,1);pointer-events:none}
.neonp.on{opacity:1;transform:none}
.neonp{appearance:none;border:0;padding:0;margin:0;background:none;color:inherit;border-radius:50%}
.neonp:focus-visible{outline:2px solid #fff;outline-offset:2px}
.neonp canvas{display:block;width:100%;height:100%;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 0 6px rgba(255,46,154,.5)) drop-shadow(0 0 16px rgba(162,75,255,.35))}
@media (max-width:820px){.neonp{z-index:10;width:64px;height:64px;bottom:calc(9px + env(safe-area-inset-bottom));right:26px}}
@media (prefers-reduced-motion:reduce){.neonp{transition:none}}
html.pre .neonp,html.pre .neonp-oi{display:none}
.neonp-oi{position:fixed;z-index:8;right:calc(max(8px,env(safe-area-inset-right)) + 104px);bottom:52px;margin:0;background:#120a2e;color:#F4EFFF;border:1px solid rgba(46,140,255,.5);border-radius:16px 16px 4px 16px;padding:9px 14px;font:600 14px/1.4 'Sora',system-ui,sans-serif;cursor:pointer;
transform-origin:100% 100%;transition:opacity 220ms cubic-bezier(.22,1,.36,1),transform 220ms cubic-bezier(.22,1,.36,1)}
.neonp-oi.some{opacity:0;transform:translateY(6px) scale(.96);pointer-events:none}
@media (max-width:820px){.neonp-oi{display:none}}
@media (prefers-reduced-motion:reduce){.neonp-oi{transition:opacity 120ms linear;transform:none}}`;

function inicia() {
  if (document.querySelector('.neonp')) return;
  if (CEL && !document.querySelector('a.wa')) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const caixa = document.createElement('button');
  caixa.type = 'button';
  caixa.className = 'neonp';
  caixa.setAttribute('aria-label', 'Conversar com o Neon');
  caixa.setAttribute('aria-expanded', 'false');
  caixa.setAttribute('aria-controls', 'neon-chat');
  const canvas = document.createElement('canvas');
  caixa.appendChild(canvas);
  document.body.appendChild(caixa);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true}); }
  catch (e) { caixa.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 50);
  cam.position.set(0, .15, 6.4);
  scene.add(new THREE.AmbientLight(0x8a6cff, .9));
  const l1 = new THREE.PointLight(0xff2e9a, 7, 8); l1.position.set(-1.6, 1, 1.4); scene.add(l1);
  const l2 = new THREE.PointLight(0x2e8cff, 7, 8); l2.position.set(1.6, -.6, 1.6); scene.add(l2);
  const l3 = new THREE.DirectionalLight(0xffffff, .8); l3.position.set(0, 2, 3); scene.add(l3);

  /* peças */
  const matTubo = c => new THREE.MeshStandardMaterial({color: 0x111111, emissive: c, emissiveIntensity: 1.7, roughness: .35});
  const matVidro = c => new THREE.MeshStandardMaterial({color: c, transparent: true, opacity: .14, roughness: .1, emissive: c, emissiveIntensity: .25, depthWrite: false});
  const matChapa = new THREE.MeshStandardMaterial({color: 0x1a1040, roughness: .45, metalness: .5});
  const matMetal = new THREE.MeshStandardMaterial({color: 0xb9b4c9, roughness: .3, metalness: .8});
  const tubo = (curva, r, cor, fechado) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 120, r, 12, fechado), matTubo(cor)),
          new THREE.Mesh(new THREE.TubeGeometry(curva, 120, r * 1.75, 12, fechado), matVidro(cor)));
    return g;
  };
  const amendoa = new THREE.CurvePath();
  amendoa.add(new THREE.QuadraticBezierCurve3(V3(-1, 0), V3(0, 1.13), V3(1, 0)));
  amendoa.add(new THREE.QuadraticBezierCurve3(V3(1, 0), V3(0, -1.13), V3(-1, 0)));
  const forma = new THREE.Shape(); const e = 1.22;
  forma.moveTo(-e, 0); forma.quadraticCurveTo(0, 1.13 * e, e, 0); forma.quadraticCurveTo(0, -1.13 * e, -e, 0);

  const raiz = new THREE.Group(), palpebra = new THREE.Group(), olhar = new THREE.Group();
  palpebra.add(tubo(amendoa, .085, ROSA, true));
  olhar.add(new THREE.Mesh(new THREE.TorusGeometry(.33, .055, 14, 56), matTubo(AZUL)),
            new THREE.Mesh(new THREE.TorusGeometry(.33, .1, 14, 56), matVidro(AZUL)));
  const pup = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 14), matTubo(AZUL)); pup.scale.z = .5;
  olhar.add(pup); olhar.position.z = .04; palpebra.add(olhar); raiz.add(palpebra);
  const chapa = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, {depth: .06, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2, curveSegments: 36}), matChapa);
  chapa.position.z = -.26; raiz.add(chapa);
  [-.62, .62].forEach(x => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .22, 10), matMetal); s.rotation.x = Math.PI / 2; s.position.set(x, 0, -.13); raiz.add(s); });
  const sobC = new THREE.Mesh(new THREE.BufferGeometry(), matTubo(AZUL)), sobV = new THREE.Mesh(new THREE.BufferGeometry(), matVidro(AZUL));
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .3, 8), matMetal); haste.rotation.x = Math.PI / 2; haste.position.z = -.14;
  raiz.add(sobC, sobV, haste);
  raiz.rotation.y = -.3;
  scene.add(raiz);

  const ys = EXP.neutro.y.slice(), vs = [0, 0, 0, 0, 0];
  let abre = 1, abreV = 0, pulo = 0, puloV = 0, incl = 0, ultimaSob = '';
  function refazSob() {
    const chave = ys.map(y => y.toFixed(3)).join() + pulo.toFixed(3);
    if (chave === ultimaSob) return; ultimaSob = chave;
    const c = new THREE.CatmullRomCurve3(XS.map((x, i) => V3(x, ys[i] + pulo * .6, 0)));
    sobC.geometry.dispose(); sobV.geometry.dispose();
    sobC.geometry = new THREE.TubeGeometry(c, 40, .062, 10, false);
    sobV.geometry = new THREE.TubeGeometry(c, 40, .11, 10, false);
    haste.position.y = ys[2] + pulo * .6 - .02;
  }

  function tamanho() {
    const w = canvas.clientWidth || 120, h = canvas.clientHeight || 120;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); pede();
  }
  new ResizeObserver(tamanho).observe(canvas);

  /* humor */
  let base = 'neutro', temp = null, tempAte = 0, ultMexe = performance.now(), dormindo = false;
  const sente = (h, ms) => { temp = h; tempAte = performance.now() + ms; pede(); };
  const humor = now => (temp && now < tempAte) ? temp : (dormindo ? 'sono' : base);

  if ('IntersectionObserver' in window) {
    const visiveis = new Map();
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => visiveis.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
      let melhor = null, r = 0; visiveis.forEach((v, k) => { if (v > r) { r = v; melhor = k; } });
      const novo = SECOES[melhor] || 'neutro';
      if (novo !== base) { base = novo; if (novo === 'animado') puloV += .05; pede(); }
    }, {threshold: [0, .25, .5, .75]});
    Object.keys(SECOES).forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ponteiro */
  let px = -1, py = -1, ult = {x: 0, y: 0, t: 0};
  addEventListener('pointermove', ev => {
    const now = performance.now(), dt = Math.max(16, now - ult.t), vel = Math.hypot(ev.clientX - ult.x, ev.clientY - ult.y) / dt;
    ult = {x: ev.clientX, y: ev.clientY, t: now}; px = ev.clientX; py = ev.clientY; ultMexe = now;
    if (dormindo) { dormindo = false; sente('susto', 700); }
    else if (vel > 3.2 && now > tempAte) {
      const b = canvas.getBoundingClientRect();
      if (Math.hypot(ev.clientX - (b.left + b.width / 2), ev.clientY - (b.top + b.height / 2)) < 220) sente('susto', 800);
    }
    pede();
  }, {passive: true});
  addEventListener('scroll', () => { ultMexe = performance.now(); if (dormindo) { dormindo = false; pede(); } }, {passive: true});
  /* clique: susto, depois abre ou fecha o chat */
  const oi = document.createElement('p');
  oi.className = 'neonp-oi some'; oi.textContent = 'Oi, posso te ajudar?';
  document.body.appendChild(oi);
  let chat = null, conversou = false;
  const escondeOi = () => oi.classList.add('some');
  const clica = () => {
    conversou = true; escondeOi();
    sente('susto', 600); setTimeout(() => sente('animado', 1800), 600); puloV += .06;
    (chat || (chat = import(new URL('neon-chat.js?v=20261112b', import.meta.url).href)))
      .then(m => m.alterna({sente, botao: caixa}))
      .catch(() => { chat = null; location.href = 'https://wa.me/5511999392800'; });
  };
  caixa.addEventListener('click', clica);
  oi.addEventListener('click', clica);
  /* o balão "Oi, posso te ajudar?" aparece uma vez por visita, 1,8s depois dela, e some em 8s */
  let viuOi = false;
  try { viuOi = sessionStorage.getItem('neon-oi') === '1'; } catch (e) {}
  if (!CEL && !viuOi) {
    setTimeout(() => { if (conversou) return; oi.classList.remove('some'); sente('oi', 2400); try { sessionStorage.setItem('neon-oi', '1'); } catch (e) {} }, 1800);
    setTimeout(escondeOi, 9800);
  }

  /* laço: só desenha enquanto algo mexe */
  let raf = 0, ativoAte = 0, proxPisca = performance.now() + 2400, piscaAte = 0, proxTique = performance.now() + 7000, tiqueAte = 0;
  function pede() { ativoAte = performance.now() + 1500; if (!raf && !document.hidden) raf = requestAnimationFrame(quadro); }
  function quadro(now) {
    raf = 0;
    if (MOV) {
      if (now > proxPisca) { piscaAte = now + 150; proxPisca = now + 2600 + Math.random() * 3400; pede(); }
      if (now > proxTique) { tiqueAte = now + 700; proxTique = now + 7000 + Math.random() * 5000; pede(); }
      if (!dormindo && now - ultMexe > 8000) { dormindo = true; pede(); }
    }
    const h = humor(now), E = EXP[h];
    let alvo = E.y.slice();
    if (MOV && E.danca) { const f = Math.sin(now / 111); alvo = alvo.map((y, i) => y + (i < 2 ? f * .12 : i > 2 ? -f * .12 : 0)); }
    if (MOV && h === 'neutro' && now < tiqueAte) alvo = alvo.map((y, i) => y + (i > 2 ? .14 : 0));
    let mexendo = false;
    for (let i = 0; i < 5; i++) {
      if (MOV) { vs[i] += (alvo[i] - ys[i]) * .16; vs[i] *= .72; ys[i] += vs[i]; } else ys[i] = alvo[i];
      if (Math.abs(vs[i]) > 1e-4 || Math.abs(alvo[i] - ys[i]) > 1e-3) mexendo = true;
    }
    const aAlvo = now < piscaAte ? .06 : E.olho;
    if (MOV) { abreV += (aAlvo - abre) * .3; abreV *= .6; abre += abreV; } else abre = aAlvo;
    palpebra.scale.y = Math.max(.04, abre);
    const pAlvo = h === 'susto' ? .7 : h === 'carinho' ? 1.25 : 1;
    pup.scale.x += (pAlvo - pup.scale.x) * (MOV ? .2 : 1); pup.scale.y = pup.scale.x;
    if (MOV) { puloV += -pulo * .18; puloV *= .7; pulo += puloV; } else pulo = 0;
    incl += ((E.inclina || 0) - incl) * (MOV ? .1 : 1);
    raiz.rotation.z = incl; raiz.position.y = -.2 + pulo;
    if (MOV && px >= 0) {
      const b = canvas.getBoundingClientRect(), dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height * .48), d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 400);
      const s = h === 'sono' ? 0 : 1;
      olhar.position.x += (dx / d * m * .36 * s - olhar.position.x) * .15;
      olhar.position.y += (-dy / d * m * .24 * s - (h === 'sono' ? .1 : 0) - olhar.position.y) * .15;
    }
    refazSob();
    renderer.render(scene, cam);
    if (Math.abs(abreV) > 1e-3 || Math.abs(puloV) > 1e-4) mexendo = true;
    if (MOV && (mexendo || now < ativoAte || now < piscaAte || now < tiqueAte || (temp && now < tempAte))) raf = requestAnimationFrame(quadro);
    else if (MOV) setTimeout(() => { if (!raf && !document.hidden) raf = requestAnimationFrame(quadro); }, 400);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { ultMexe = performance.now(); pede(); } });
  if (base === 'neutro' && document.getElementById('hero')) base = 'oi';
  tamanho();
  /* no celular ela senta na ponta do botão verde de WhatsApp e só aparece junto com ele */
  const wa = document.querySelector('a.wa');
  if (CEL && wa) {
    const sync = () => caixa.classList.toggle('on', wa.classList.contains('show'));
    new MutationObserver(sync).observe(wa, {attributes: true, attributeFilter: ['class']}); sync();
  } else requestAnimationFrame(() => caixa.classList.add('on'));
  pede();
}

/* na home, a entrada com tecla vem antes */
if (document.documentElement.classList.contains('pre')) document.addEventListener('ns:acesa', () => setTimeout(inicia, 900), {once: true});
else inicia();
