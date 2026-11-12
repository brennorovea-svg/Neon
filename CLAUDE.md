# Site da Neon Scripts

Site institucional da Neon Scripts (marca, site, inteligência e sistemas para pequenos negócios). Publicado em https://neonscripts.com.br pelo GitHub Pages, a partir da raiz do `main`. Sem build. A home (`index.html`) e as páginas de seção (`/projetos/`, `/como-funciona/`, `/quem-somos/`) usam o mesmo CSS e JS, em `assets/site.css` e `assets/site.js` (desde 2026-11-11). Só a entrada com tecla e os scripts do `<head>` ficam embutidos na home. Identidade visual em `DESIGN.md`. Ao mudar CSS ou JS compartilhado, trocar o `?v=` nos links de todas as páginas, senão o navegador junta HTML novo com CSS velho (aconteceu em 2026-11-12 com o rodapé).

## Como trabalhar aqui
- Toda mudança vai por PR. O Brenno avalia antes de publicar, nunca fazer push direto no `main`.
- Sites, landing pages e peças de design sempre seguem a skill `emil-kowalski-motion` (valores em `DESIGN.md` › Movimento).
- Textos para cliente seguem a skill `voz-do-brenno`: caloroso, "a gente" em vez de "nós", quase sem emoji, sem jargão técnico. O jeito seco do Brenno com o Claude não é o jeito dele com cliente.
- Antes de abrir o PR, tirar print com o Playwright (já instalado) em 1280x720, 1366x768, 1440x900, 1920x1080 e 390x844. Prints ficam fora do repo.

## Regras do layout
- Computador (>= 1024px de largura e >= 600px de altura): hero + serviços na primeira tela. Desde 2026-11-12 (olho mecânico) o hero tem a altura do conteúdo: o texto fica logo abaixo do letreiro e Serviços sobe (Brenno pediu para tirar o vazio). As seções seguintes vêm na rolagem.
- Texto mais longo nos cards de serviço aperta o hero e a placa encosta no sobretítulo. Em telas baixas (<= 740px) o sobretítulo some de propósito.
- Celular (<= 820px): versão C, com letreiro na largura toda, serviços em linha do tempo e botão verde fixo de WhatsApp depois do hero. Rascunhos A/B/C em `mobile/` (com `noindex`).
- Menu no computador (>= 821px, desde 2026-11-11, opção 3 escolhida pelo Brenno): botão sanduíche "Menu" no canto direito, ao lado do "Fale com a gente". Abre um painel que nasce do botão, com 5 cards numerados 01-05 (Serviços, Projetos, Como funciona, Quem somos, Loja) e o botão verde de WhatsApp. Fecha com Esc, clique fora ou num item. No celular continua o `.menu-cel`. Os itens levam às páginas próprias (Serviços › `/servicos/`).
- Home em uma tela só (Brenno, 2026-11-12): Hero › Serviços (`#servicos`), sem rodapé. No computador as duas enchem exatamente a tela (o hero cresce para ocupar o que sobra) e não tem rolagem. No celular a página rola até o fim de Serviços. O rodapé fica só nas outras páginas. Projetos, Como funciona e Quem somos têm página própria (`/projetos/`, `/como-funciona/`, `/quem-somos/`), com topo curto (letreiro pequeno + menu) e o rodapé (`#contato`) no fim. Sem página de Contato (Brenno, 2026-11-11): o contato vai ficar com o personagem da Neon, ainda em criação. Desde 2026-11-12 o bloco grande de Contato (placa, "Bora acender a sua placa?" e botões) saiu de todas as páginas a pedido do Brenno; `#contato` agora é só o rodapé, que tem WhatsApp, e-mail e Instagram. Todo link do menu precisa apontar para uma página ou âncora que existe. Mudança de estilo vale para a home e para essas páginas, já que o CSS é o mesmo.
- Entrada com tecla (`#pre`, Brenno aprovou em 2026-11-11): tela escura por cima do site com a tecla de luz; o clique acende e mostra o site. Só no computador (>= 821px): no celular o site abre direto, para o Google não contar como tela intrusiva (Brenno, 2026-11-11). Só aparece com `html.pre` (posto por script no `<head>`), então sem JS o site abre direto. Link com âncora pula a entrada. Enquanto ela está na tela, as animações do site ficam pausadas e o filme do hero espera o evento `ns:acesa`. Detalhes em `DESIGN.md` › Movimento.
- Clientes (`#projetos`, na página `/projetos/`, desde 2026-11-11, base no modelo 09): o site de um cliente por vez em janelas de navegador empilhadas, ficha do cliente por cima, nome gigante em contorno no fundo e, no topo da seção, uma faixa na largura toda e centralizada com nome e ramo de cada cliente (setas, teclado, arrastar no celular). Troca sozinha a cada 5,6s quando visível, pausa com mouse ou foco e para depois de um clique. A cor do cliente pinta a seção. Cores: Naruá laranja `#FF8A1F`, Makiolki rosa `#FF4F8B`, Granola Pura azul `#4DA3FF`, Contorno verde `#3FBF9A` (sem duas parecidas). Cliente novo = um item a mais no carrossel.

## Páginas de serviço e de cliente (`/servicos/`, `/clientes/`)
- Uma página por serviço (`/servicos/<slug>/`) e uma por cliente (`/clientes/<slug>/`), mais as listas `/servicos/` e `/clientes/`. Servem para o site aparecer em buscas genéricas e em buscas com IA.
- HTML estático, sem build. CSS e JS compartilhados em `assets/paginas.css` e `assets/paginas.js` (mesmos tokens do `index.html`).
- Cada página tem canonical, Open Graph e dados estruturados (`Service` + `FAQPage` nos serviços, `Article` nos clientes, `BreadcrumbList` em todas). Página nova entra no `sitemap.xml` e no `llms.txt`. Cliente novo entra também no rodapé. Desde 2026-11-12 as páginas de serviço e de cliente também não têm o bloco "Bora acender a sua placa?": o contato fica no rodapé.
- Rodapé (Brenno, 2026-11-12, "tubo que acende"): 4 tópicos fixos em todas as páginas, exceto a home e a loja: Neon Scripts (texto curto), Serviços (Sites, Sistemas, Consultorias só em texto por enquanto, Marca), Clientes e Fale conosco (WhatsApp, e-mail, Instagram). A linha de cima é um tubo de neon que se desenha quando o rodapé aparece, e os títulos acendem um por um em rosa, roxo, azul e ciano. Mesmo bloco em `assets/site.css` e `assets/paginas.css`, e o script no fim de `site.js` e `paginas.js`.
- Cliente novo = um item a mais no carrossel da home e uma página em `/clientes/`. Nada de número ou depoimento inventado.

## Loja de skills (`/loja/`)
- Página única em `loja/index.html`, com CSS e JS embutidos. As 7 skills ficam na lista `SKILLS` e cada uma abre a sua página por âncora (`/loja/#neon-cores`).
- Preço único: R$ 20 por skill, sem combos (Brenno, 2026-11-10). Sem promessa de "12 meses de atualização" nem de "uso em clientes".
- Links de pagamento no objeto `PAGAMENTO`, no começo do script. Link vazio = o botão abre o WhatsApp com o pedido pronto.
- Cores extras só da loja: laranja `#FF7A3D` e verde `#6BFF9E`. Cada skill tem uma cor, sem repetir.
- Os pacotes `.zip` das skills não ficam no repo: a entrega é pela plataforma de venda.

## Marca
- Nome: **Neon Scripts** (com espaço). Instagram @neon.scripts. Nunca só "Neon": conflita com o banco Neon e com o Neon Postgres.
- Não repetir "Neon Scripts" em texto no menu: o letreiro já é a marca.
- Letreiro: NEON em cima e SCRIPTS embaixo dentro da mesma placa, sempre em cores opostas (rosa/azul) que invertem juntas, com piscadas de vez em quando.
- Logo v3 (2026-10-28): em NEON o E é espelhado e o O é um olho amendoado. Nunca usar o NEON antigo em peça nova. Histórico e regra de versão em `marca/VERSOES.md`.
- **Sem metrô.** Nada de estação, linha, plataforma, baldeação, embarque, piso tátil. O Brenno vetou em 2026-10-27. Exceção: a foto do hero continua a da entrada do metrô (`assets/hero-metro.jpg`), por escolha do Brenno em 2026-10-27. Desde 2026-11-12 o computador mostra o olho mecânico 3D no hero (`assets/olho-mecanico.js`, three.js 0.169.0 pelo jsdelivr, aprovado pelo Brenno) no lugar do filme `assets/hero/anime`, que fica guardado. A foto segue no celular e como reserva sem JS. Não trocar sem ele pedir. A faixa sob o hero é um tubo de neon (`.tubo`) e os números dos cards são "01-04" acesos.
- Serviços sempre nesta lista: Marca, Site, Inteligência, Sistemas.

## Dados fixos
- WhatsApp dos botões: `wa.me/5511999392800` (número pessoal do Brenno, provisório). Se mudar, trocar em todas as ocorrências do `index.html`.
- Domínio: `CNAME` = neonscripts.com.br, DNS no Registro.br. Não apagar o `CNAME`.
- SEO: ao criar página nova, incluir no `sitemap.xml`. Detalhes no `README.md`.

## Limitações da sessão na nuvem
- Não dá para enviar tags nem criar releases (o proxy bloqueia). A release v1.0 o Brenno cria pelo GitHub.
- Não dá para mexer em Settings › Pages pela API. Mudanças de Pages são com o Brenno.
