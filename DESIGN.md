# Neon Scripts · design

Fonte de verdade é o `:root` do `index.html`. Se mudar lá, mudar aqui.

## Clima
Tecnologia de rua à noite: letreiro neon, synthwave, street art, cyberpunk. Fotografia real (nada de ilustração em CSS, que o Brenno achou "pouco real"), profundidade em camadas, nada "2D". Sempre fundo escuro. Sem metrô (ver `CLAUDE.md`).

## Cores
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#07041A` | fundo da página |
| `--night` | `#05030F` | fundo do hero, sombras |
| `--ink` | `#F4EFFF` | texto principal |
| `--soft` | `#E2DAF5` | texto de apoio (lead) |
| `--muted` | `#B2A7D4` | texto secundário, legendas |
| `--pink` | `#FF2E9A` | cor principal: botão, sublinhado, borda de card |
| `--purple` | `#A24BFF` | brilho secundário, bordas suaves |
| `--blue` | `#2E8CFF` | par do rosa no letreiro |
| `--cyan` | `#40E6DC` | brilho do letreiro azul, detalhes de terminal |
| `--yellow` | `#F2D75A` | destaque pontual |

Texto sobre botão rosa: `#0B0420`. Cards: fundo `rgba(14,10,34,.72)` com `backdrop-filter: blur(8px)`, borda `rgba(162,75,255,.35)` e topo de 3px rosa.

## Tipografia (Google Fonts)
- **Bungee Inline**: só o letreiro (só tem maiúsculas).
- **Sora** 400/600/800: todo o resto. Título `h1` 800, `clamp(38px,5.2vw,70px)`, entrelinha 1.02, `letter-spacing -.02em`. `h2` 800, `clamp(30px,3.6vw,46px)`. Corpo 16-19px, entrelinha 1.5.
- **Space Mono** 400/700: sobretítulos em caixa alta com `letter-spacing .2em`, marca no menu, toques de terminal (`$ ./orcamento`).

## Letreiro
Logo v3 (2026-10-28): **E ao contrário** e o **O vira um olho amendoado** (tubo na cor de NEON, íris e pupila na cor de SCRIPTS). Histórico em `marca/VERSOES.md`.

Placa parafusada (sem cabo): 4 parafusos de metal nos cantos (`.parafusos`), sombra embaixo e luz da cor do tubo na parede atrás. Borda de 4px na cor do tubo, raio 14px, fundo `rgba(7,3,26,.55)`. NEON em Bungee Inline; SCRIPTS embaixo em `.355em`, `letter-spacing .06em`, sempre na cor oposta.
- Rosa: brilho `#FF2E9A`, brilho 2 `#A24BFF`, tubo `#FFB8DC`.
- Azul: brilho `#2E8CFF`, brilho 2 `#40E6DC`, tubo `#B0DCFF`.
- Brilho com `text-shadow` em 3 camadas (10/30/80px) e `box-shadow` externo + interno.
- Segunda placa (`.placa`) no Contato, sobre a foto do hero escurecida: acende uma vez quando aparece, sem piscar depois.

## Formas
- Botão: pílula (`border-radius 999px`), `16px 26px`, peso 800. Principal rosa com brilho `0 0 26px rgba(255,46,154,.6)`; secundário com borda de 2px `--ink`.
- Card: raio 16px, `26px` de respiro.
- Margem lateral: `clamp(20px,5vw,72px)`. Largura máxima do conteúdo: 1180px.
- Foco: `outline 2px #fff`, `offset 3px`.
- Títulos `h2`: só o de Serviços encolhe (até 30px) para a primeira tela caber em 100vh; os outros seguem o tamanho padrão. O do Contato é maior (`clamp(34px,4.6vw,62px)`), é o fechamento da página.
- Etapas de Como funciona usam o mesmo card dos serviços no computador; no celular viram linha do tempo.
- Rodapé (`.rodape`): sobre, links do site e contato, em 3 colunas (2 no celular).

## Movimento
Regras da skill `emil-kowalski-motion`: poucos momentos de movimento, só `transform` e `opacity`, uma linguagem só, sempre respeitar `prefers-reduced-motion`.
- Easing único: `--ease: cubic-bezier(.22,1,.36,1)`.
- Controles: 180ms. Hover sobe 2px, clique `scale(.97)` em 100ms.
- Entrada: 720ms, stagger de 70ms, só em grupos pequenos. Revelar ao rolar: 600ms.
- Letreiro: liga uma vez na entrada (1.1s). Depois, a cada 2.6 a 6s, pisca uma letra, o olho pisca (pálpebra fecha em ~110ms e abre em 140ms), ou a placa toda pisca e rosa/azul trocam (transição de 700ms). Pausa com a aba oculta, desligado em reduced-motion. É a única exceção à regra de "sem loop decorativo".
- Momentos da skill `neon-motion` aprovados em 2026-10-30: sobretítulo do hero decodifica uma vez (letras travam a cada 28ms); números 01-04 dos Serviços ligam com `turnOn` quando o card aparece; hover dos cards na cor do serviço (`--c`) com sublinhado no nome; em Como funciona a linha de cada etapa se desenha (420ms, 300ms entre etapas) e o número liga ao fim; legenda da foto de Quem somos é digitada uma vez; "placa acesa" (hero) e "a gente se ajuda." (Quem somos) acendem em rosa com a piscada do letreiro, uma vez; nos botões de WhatsApp o clique afunda (.97) e o brilho estoura e volta em 260ms.
- Aurora do Contato: três manchas (rosa, roxo, azul) derivam atrás da placa, 30 a 44s por volta, só enquanto a seção está na tela e parada com movimento reduzido. É a segunda exceção ao "sem loop decorativo", aprovada pelo Brenno.
- Proibido: cursor customizado, partículas, loops infinitos fora do letreiro e da aurora do Contato. Limpar observers e timers.

## Formatos de redes
Post 1080x1350, story 1080x1920, perfil 1080x1080. Peças de story precisam de gancho de dor do cliente e chamada ("Chama no direct"), não só frase de marca.
