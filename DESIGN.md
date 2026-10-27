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
Placa com borda de 4px na cor do tubo, raio 14px, fundo `rgba(7,3,26,.55)`. NEON em Bungee Inline; SCRIPTS embaixo em `.355em`, `letter-spacing .06em`, sempre na cor oposta.
- Rosa: brilho `#FF2E9A`, brilho 2 `#A24BFF`, tubo `#FFB8DC`.
- Azul: brilho `#2E8CFF`, brilho 2 `#40E6DC`, tubo `#B0DCFF`.
- Brilho com `text-shadow` em 3 camadas (10/30/80px) e `box-shadow` externo + interno.

## Formas
- Botão: pílula (`border-radius 999px`), `16px 26px`, peso 800. Principal rosa com brilho `0 0 26px rgba(255,46,154,.6)`; secundário com borda de 2px `--ink`.
- Card: raio 16px, `26px` de respiro.
- Margem lateral: `clamp(20px,5vw,72px)`. Largura máxima do conteúdo: 1180px.
- Foco: `outline 2px #fff`, `offset 3px`.

## Movimento
Regras da skill `emil-kowalski-motion`: poucos momentos de movimento, só `transform` e `opacity`, uma linguagem só, sempre respeitar `prefers-reduced-motion`.
- Easing único: `--ease: cubic-bezier(.22,1,.36,1)`.
- Controles: 180ms. Hover sobe 2px, clique `scale(.97)` em 100ms.
- Entrada: 720ms, stagger de 70ms, só em grupos pequenos. Revelar ao rolar: 600ms.
- Letreiro: liga uma vez na entrada (1.1s). Depois, a cada 2.6 a 6s, pisca uma letra ou a placa toda e rosa/azul trocam (transição de 700ms). Pausa com a aba oculta, desligado em reduced-motion. É a única exceção à regra de "sem loop decorativo".
- Proibido: cursor customizado, partículas, loops infinitos fora do letreiro. Limpar observers e timers.

## Formatos de redes
Post 1080x1350, story 1080x1920, perfil 1080x1080. Peças de story precisam de gancho de dor do cliente e chamada ("Chama no direct"), não só frase de marca.
