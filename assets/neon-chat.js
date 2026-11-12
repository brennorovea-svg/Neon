/* Chat da Neon (2026-11-12): conversa guiada, sem IA e sem servidor (Brenno escolheu "guiado, custo zero").
   Abre quando a pessoa clica na Neon. Botões levam por 4 perguntas curtas e no fim montam a mensagem
   pronta para o WhatsApp. Texto digitado procura por palavra-chave nas respostas prontas; se não achar,
   oferece mandar a pergunta para o Brenno. Voz da marca: "a gente", calorosa, curta, sem emoji. */

const WA = '5511999392800';
/* Preços dos pacotes no chat: desligado até o Brenno decidir. Ligar = trocar para true. */
const MOSTRA_PRECO = false;

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const linkWa = txt => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
const INICIO_MSG = 'Oi, Brenno! Vim pelo site e falei com o Neon.';

const SERVICOS = {
  site: {rot: 'Um site', oQue: 'um site', fala: 'Boa! Site é a vitrine que trabalha de madrugada. A gente faz site rápido, bonito no celular e com o WhatsApp a um toque.',
    q2: ['E hoje, o que você já tem?', ['Só Instagram', 'Um site antigo', 'Nada ainda']]},
  sistema: {rot: 'Um sistema', oQue: 'um sistema', fala: 'Sistema é pra tirar o caderno e a dor de cabeça da rotina: comanda, pedido, estoque, relatório de vendas.',
    q2: ['Hoje você controla tudo como?', ['No caderno ou papel', 'Numa planilha', 'Em outro sistema']]},
  marca: {rot: 'Marca', oQue: 'uma marca', fala: 'Marca é o jeito que o bairro te reconhece de longe. Logo, cores e um manual simples pra usar em tudo.',
    q2: ['Você já tem logo?', ['Tenho, mas quero refazer', 'Ainda não tenho']]},
  consultoria: {rot: 'Consultoria', oQue: 'uma consultoria', fala: 'Consultoria é a gente sentar do seu lado, entender a rotina e mostrar onde a tecnologia ajuda de verdade.',
    q2: ['Onde o calo aperta mais?', ['Vender mais', 'Organizar a rotina', 'Atender melhor']]}
};
const PRAZOS = ['Este mês', 'Nos próximos meses', 'Só pesquisando por enquanto'];

const DUVIDAS = {
  preco: {rot: 'Quanto custa?', chaves: ['preco', 'custa', 'valor', 'quanto', 'orcamento', 'caro', 'barato', 'pacote'],
    r: () => MOSTRA_PRECO
      ? 'A gente tem 3 pacotes. Básico, R$ 1.000: logo, manual e site de uma página. Intermediário, R$ 1.700: site animado, SEO e 6 meses de manutenção. Avançado, a partir de R$ 2.700: visita, diagnóstico e sistema sob medida. O primeiro ano de hospedagem é por nossa conta.'
      : 'Depende do que o seu negócio precisa. Tem desde um site simples até sistema sob medida. O Brenno te passa o valor certinho no WhatsApp, sem compromisso.'},
  prazo: {rot: 'Quanto tempo leva?', chaves: ['prazo', 'tempo', 'demora', 'quando', 'rapido', 'semana', 'dias'],
    r: () => 'Um site pode ficar pronto na mesma semana. Sistema sob medida leva mais, porque a gente precisa entender a sua rotina antes. E o primeiro retorno do Brenno sai em até 24h.'},
  como: {rot: 'Como funciona?', chaves: ['funciona', 'processo', 'etapa', 'comeca', 'passo'],
    r: () => 'Primeiro a gente conversa e entende o seu negócio. Depois manda uma proposta clara. Aí faz, te mostra, ajusta e coloca no ar. Você acompanha tudo.'},
  depois: {rot: 'Dá pra mexer depois?', chaves: ['mexer', 'alterar', 'mudar', 'editar', 'manutencao', 'atualiz', 'depois'],
    r: () => 'Dá sim. O projeto é seu, com a documentação toda. E se precisar de ajuste, é só chamar a gente.'},
  onde: {rot: 'Onde vocês atendem?', chaves: ['onde', 'cidade', 'atende', 'presencial', 'visita', 'sao paulo', ' sp ', 'online'],
    r: () => 'A gente é de São Paulo. Dá pra fazer quase tudo online, e quando o projeto pede, a gente vai até você.'},
  clientes: {rot: 'Quem já é cliente?', chaves: ['cliente', 'portfolio', 'exemplo', 'trabalho', 'projeto', 'narua', 'granola', 'makiolki', 'contorno'],
    r: () => 'Naruá, Makiolki, Granola Pura e Contorno. Na página de Projetos dá pra ver o site de cada um.', link: ['Ver os projetos', '/projetos/']},
  cardapio: {chaves: ['cardapio', 'menu', 'delivery', 'pedido', 'ifood'],
    r: () => 'Faz! Cardápio digital com pedido direto no WhatsApp: o cliente escolhe e você recebe tudo organizado.'},
  insta: {chaves: ['instagram', 'post', 'redes', 'social', 'stories', 'reels'],
    r: () => 'O foco da gente é marca, site e sistema. Mas a marca já sai pronta pra usar no Instagram também. Se quiser, o Brenno te explica melhor.'}
};

const CSS = `.neonc{position:fixed;z-index:65;right:max(16px,env(safe-area-inset-right));bottom:118px;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 150px));display:flex;flex-direction:column;background:#0d0826;color:#F4EFFF;border:1px solid rgba(162,75,255,.35);border-radius:20px;overflow:hidden;font-family:'Sora',system-ui,sans-serif;font-size:16px;line-height:1.5;text-align:left;
box-shadow:0 0 0 1px rgba(255,46,154,.12),0 20px 60px rgba(0,0,0,.55),0 0 40px rgba(162,75,255,.18);transform-origin:calc(100% - 50px) 100%;transition:opacity 220ms cubic-bezier(.22,1,.36,1),transform 220ms cubic-bezier(.22,1,.36,1)}
.neonc.fechado{opacity:0;transform:translateY(10px) scale(.96);pointer-events:none;visibility:hidden;transition:opacity 160ms cubic-bezier(.22,1,.36,1),transform 160ms cubic-bezier(.22,1,.36,1),visibility 0s 160ms}
.neonc *{box-sizing:border-box}
.neonc-cab{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 16px;border-bottom:1px solid rgba(162,75,255,.35);background:linear-gradient(90deg,rgba(255,46,154,.1),rgba(46,140,255,.08))}
.neonc-cab b{display:block;font-family:'Bungee Inline',Impact,sans-serif;font-weight:400;font-size:22px;line-height:1;color:#FFB8DC;text-shadow:0 0 6px #FF2E9A}
.neonc-cab span{display:block;font:400 11px 'Space Mono',ui-monospace,monospace;letter-spacing:.1em;color:#B2A7D4;margin-top:3px}
.neonc-x{margin-left:auto;appearance:none;border:0;background:transparent;color:#E2DAF5;width:40px;height:40px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;transition:transform 140ms cubic-bezier(.22,1,.36,1),background 140ms cubic-bezier(.22,1,.36,1)}
.neonc-x:hover{background:rgba(255,255,255,.06)}
.neonc-x:active{transform:scale(.92)}
.neonc :focus-visible{outline:2px solid #fff;outline-offset:2px}
.neonc-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.neonc-m{max-width:86%;padding:10px 13px;border-radius:16px;font-size:14.5px;line-height:1.45;margin:0;animation:neonc-entra 200ms cubic-bezier(.22,1,.36,1) both}
.neonc-m.ela{align-self:flex-start;background:#120a2e;border:1px solid rgba(46,140,255,.35);border-bottom-left-radius:4px}
.neonc-m.voce{align-self:flex-end;background:rgba(255,46,154,.16);border:1px solid rgba(255,46,154,.4);border-bottom-right-radius:4px}
.neonc-m.pronta{align-self:stretch;max-width:none;background:rgba(37,211,102,.08);border:1px dashed rgba(37,211,102,.5);font-size:14px;color:#E2DAF5}
.neonc-m.pronta i{display:block;font:normal 700 10px 'Space Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#25D366;margin-bottom:4px}
.neonc-dig{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:#120a2e;border:1px solid rgba(46,140,255,.35);border-radius:16px;border-bottom-left-radius:4px}
.neonc-dig i{width:6px;height:6px;border-radius:50%;background:#B0DCFF;animation:neonc-ponto 900ms cubic-bezier(.22,1,.36,1) infinite}
.neonc-dig i:nth-child(2){animation-delay:150ms}.neonc-dig i:nth-child(3){animation-delay:300ms}
@keyframes neonc-ponto{0%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@keyframes neonc-entra{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.neonc-ops{display:flex;flex-wrap:wrap;gap:8px;padding:2px 0 4px}
.neonc-op{appearance:none;font:inherit;border:1px solid rgba(64,230,220,.45);background:rgba(64,230,220,.06);color:#F4EFFF;font-weight:600;font-size:13.5px;line-height:1.3;padding:9px 13px;border-radius:999px;cursor:pointer;text-decoration:none;display:inline-block;
animation:neonc-entra 200ms cubic-bezier(.22,1,.36,1) both;transition:transform 160ms cubic-bezier(.22,1,.36,1),background 160ms cubic-bezier(.22,1,.36,1),border-color 160ms cubic-bezier(.22,1,.36,1)}
.neonc-op:hover{background:rgba(64,230,220,.14);border-color:#40E6DC;transform:translateY(-1px)}
.neonc-op:active{transform:scale(.97);transition-duration:100ms}
.neonc-op.neonc-wa{background:#25D366;border-color:#25D366;color:#04210F;font-weight:800}
.neonc-op.neonc-wa:hover{background:#3be37a}
.neonc-ops .neonc-op:nth-child(2){animation-delay:30ms}.neonc-ops .neonc-op:nth-child(3){animation-delay:60ms}.neonc-ops .neonc-op:nth-child(4){animation-delay:90ms}.neonc-ops .neonc-op:nth-child(n+5){animation-delay:120ms}
.neonc-campo{display:flex;gap:8px;margin:0;padding:10px 12px 12px;border-top:1px solid rgba(162,75,255,.35)}
.neonc-campo input{flex:1;min-width:0;background:#05030F;border:1px solid rgba(162,75,255,.35);border-radius:999px;color:#F4EFFF;font:inherit;font-size:16px;padding:10px 14px}
.neonc-campo input::placeholder{color:#B2A7D4}
.neonc-campo button{appearance:none;font:inherit;border:0;background:#FF2E9A;color:#0B0420;font-weight:800;font-size:14px;border-radius:999px;padding:0 16px;cursor:pointer;transition:transform 140ms cubic-bezier(.22,1,.36,1)}
.neonc-campo button:active{transform:scale(.96)}
@media (max-width:820px){
  .neonc{left:0;right:0;bottom:0;width:100%;height:min(80vh,640px);border-radius:20px 20px 0 0;border-bottom:0;transform-origin:50% 100%;padding-bottom:env(safe-area-inset-bottom)}
  .neonc.fechado{transform:translateY(24px)}
}
@media (prefers-reduced-motion:reduce){
  .neonc-m,.neonc-op{animation:none}
  .neonc-dig i{animation:none;opacity:.7}
  .neonc,.neonc.fechado{transition:opacity 120ms linear;transform:none}
  .neonc-log{scroll-behavior:auto}
}`;

let painel, log, inp, sente = () => {}, botao = null, ocupado = false, iniciou = false;
const pedido = {};

function monta() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  painel = document.createElement('section');
  painel.className = 'neonc fechado';
  painel.id = 'neon-chat';
  painel.setAttribute('role', 'dialog');
  painel.setAttribute('aria-label', 'Conversa com o Neon');
  painel.innerHTML = '<div class="neonc-cab"><div><b>Neon</b><span>da Neon Scripts · responde na hora</span></div>'
    + '<button class="neonc-x" type="button" aria-label="Fechar conversa">×</button></div>'
    + '<div class="neonc-log" aria-live="polite"></div>'
    + '<form class="neonc-campo" autocomplete="off"><input type="text" maxlength="300" placeholder="Ou escreva sua pergunta" aria-label="Escreva sua pergunta"><button type="submit">Enviar</button></form>';
  document.body.appendChild(painel);
  log = painel.querySelector('.neonc-log');
  inp = painel.querySelector('input');
  painel.querySelector('.neonc-x').addEventListener('click', () => fecha(true));
  painel.querySelector('form').addEventListener('submit', escreveu);
  addEventListener('keydown', e => { if (e.key === 'Escape' && aberto()) fecha(true); });
}

const aberto = () => painel && !painel.classList.contains('fechado');
function abre() {
  painel.classList.remove('fechado');
  if (botao) botao.setAttribute('aria-expanded', 'true');
  if (!iniciou) { iniciou = true; inicio(); }
  if (!matchMedia('(max-width: 820px)').matches) setTimeout(() => inp.focus({preventScroll: true}), 230);
}
function fecha(volta) {
  painel.classList.add('fechado');
  if (botao) { botao.setAttribute('aria-expanded', 'false'); if (volta) botao.focus({preventScroll: true}); }
}

/* ---------- conversa ---------- */
const rola = () => { log.scrollTop = log.scrollHeight; };
const limpaOps = () => log.querySelectorAll('.neonc-ops').forEach(o => o.remove());
function eu(txt) { limpaOps(); const d = document.createElement('p'); d.className = 'neonc-m voce'; d.textContent = txt; log.appendChild(d); rola(); }
function ela(txts, humor) {
  if (humor) sente(humor, 3000);
  return txts.reduce((p, txt) => p.then(() => new Promise(ok => {
    const dig = document.createElement('div'); dig.className = 'neonc-dig'; dig.innerHTML = '<i></i><i></i><i></i>';
    dig.setAttribute('aria-hidden', 'true'); log.appendChild(dig); rola();
    setTimeout(() => { dig.remove(); const d = document.createElement('p'); d.className = 'neonc-m ela'; d.textContent = txt; log.appendChild(d); rola(); ok(); },
      RM ? 120 : Math.min(1100, 380 + txt.length * 9));
  })), Promise.resolve());
}
function opcoes(lista) {
  const box = document.createElement('div'); box.className = 'neonc-ops';
  lista.forEach(o => {
    if (o.href) {
      const a = document.createElement('a'); a.className = 'neonc-op' + (o.wa ? ' neonc-wa' : ''); a.href = o.href; a.textContent = o.rot;
      if (o.wa) { a.target = '_blank'; a.rel = 'noopener'; }
      box.appendChild(a); return;
    }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'neonc-op'; b.textContent = o.rot;
    b.addEventListener('click', () => { if (ocupado) return; eu(o.rot); o.ir(); });
    box.appendChild(b);
  });
  log.appendChild(box); rola();
}
const passo = fn => async (...a) => { ocupado = true; try { await fn(...a); } finally { ocupado = false; } };
const recomeca = () => { log.innerHTML = ''; inp.placeholder = 'Ou escreva sua pergunta'; inicio(); };
const wa = (rot, txt) => ({rot, href: linkWa(txt), wa: true});

const inicio = passo(async () => {
  for (const k in pedido) delete pedido[k];
  await ela(['Oi, eu sou o Neon! O que vamos desenvolver hoje?'], 'oi');
  opcoes([...Object.entries(SERVICOS).map(([k, s]) => ({rot: s.rot, ir: () => servico(k)})), {rot: 'Só tirar uma dúvida', ir: () => duvidas(true)}]);
});
const servico = passo(async k => {
  pedido.servico = k;
  /* o @ ou o nome da marca vai na mensagem, para o Brenno já chegar olhando o negócio (Brenno, 2026-11-12) */
  pedido.esperaMarca = true;
  await ela([SERVICOS[k].fala, 'Me passa o @ do Instagram do seu negócio ou o nome da marca. Assim o Brenno já dá uma olhada antes de te responder.'], 'curioso');
  opcoes([{rot: 'Ainda não tenho marca', ir: () => marca(null)}]);
  inp.placeholder = 'Ex.: @seunegocio ou Nome da marca';
  inp.focus({preventScroll: true});
});
const marca = passo(async m => {
  pedido.esperaMarca = false; pedido.marca = m;
  inp.placeholder = 'Ou escreva sua pergunta';
  if (m) await ela(['Anotado!'], 'carinho');
  await pergunta2();
});
async function pergunta2() {
  const [q, ops] = SERVICOS[pedido.servico].q2;
  await ela([q], 'pensando');
  opcoes(ops.map(o => ({rot: o, ir: () => situacao(o)})));
}
const situacao = passo(async o => {
  pedido.hoje = o;
  await ela(['Anotado. E pra quando você precisa?'], 'pensando');
  opcoes(PRAZOS.map(p => ({rot: p, ir: () => prazo(p)})));
});
const prazo = passo(async p => {
  const neg = pedido.marca ? ' Meu negócio: ' + pedido.marca + '.' : ' Ainda não tenho marca.';
  const msg = INICIO_MSG + ' Quero ' + SERVICOS[pedido.servico].oQue + '.' + neg + ' Hoje: ' + pedido.hoje.toLowerCase() + '. Prazo: ' + p.toLowerCase() + '.';
  await ela(['Fechou! Montei a mensagem pro Brenno. É só tocar no botão verde que ela já vai pronta no WhatsApp.'], 'animado');
  const d = document.createElement('p'); d.className = 'neonc-m pronta'; d.innerHTML = '<i>Mensagem pronta</i>'; d.append(msg); log.appendChild(d);
  opcoes([wa('Mandar pro Brenno no WhatsApp', msg), {rot: 'Tenho uma dúvida', ir: () => duvidas(false)}, {rot: 'Começar de novo', ir: recomeca}]);
  await ela(['Ele responde em horário comercial.']);
});
const duvidas = passo(async primeira => {
  await ela([primeira ? 'Pode perguntar! Escolhe uma ou escreve aqui embaixo.' : 'Claro. Qual é a dúvida?'], 'pensando');
  opcoes([...Object.values(DUVIDAS).filter(d => d.rot).map(d => ({rot: d.rot, ir: () => responde(d)})), wa('Falar com o Brenno', INICIO_MSG + ' Queria tirar uma dúvida.')]);
});
const responde = passo(async d => {
  await ela([d.r()], 'carinho');
  await ela(['Mais alguma coisa?']);
  const ops = [{rot: 'Outra dúvida', ir: () => duvidas(false)}, {rot: 'Quero um orçamento', ir: recomeca}, wa('Falar com o Brenno', INICIO_MSG + ' Queria conversar.')];
  if (d.link) ops.unshift({rot: d.link[0], href: d.link[1]});
  opcoes(ops);
});

/* texto livre: procura por palavra-chave nas respostas prontas */
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function acha(txt) {
  const t = ' ' + norm(txt) + ' ';
  if (/quero|preciso|fazer|faz|criar|montar/.test(t)) for (const k of Object.keys(SERVICOS)) if (t.includes(' ' + k)) return {servico: k};
  let melhor = null, pontos = 0;
  for (const d of Object.values(DUVIDAS)) { const n = d.chaves.filter(c => t.includes(c)).length; if (n > pontos) { pontos = n; melhor = d; } }
  return melhor ? {duvida: melhor} : null;
}
async function escreveu(e) {
  e.preventDefault();
  const txt = inp.value.trim(); if (!txt || ocupado) return;
  inp.value = ''; eu(txt);
  if (pedido.esperaMarca) return marca(txt);
  const r = acha(txt);
  if (r && r.servico) return servico(r.servico);
  if (r && r.duvida) return responde(r.duvida);
  ocupado = true;
  try {
    await ela(['Essa eu ainda não sei responder. Mas o Brenno sabe!', 'Quer mandar a sua pergunta pra ele? Ela já vai escrita.'], 'carinho');
    opcoes([wa('Mandar pro Brenno no WhatsApp', INICIO_MSG + ' Minha dúvida: ' + txt), {rot: 'Ver as dúvidas comuns', ir: () => duvidas(false)}]);
  } finally { ocupado = false; }
}

/* chamado pela personagem a cada clique nela */
export function alterna(opts = {}) {
  if (opts.sente) sente = opts.sente;
  if (opts.botao) botao = opts.botao;
  if (!painel) monta();
  aberto() ? fecha(false) : abre();
}
