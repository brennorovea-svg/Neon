# Site da Neon Scripts

Site institucional da Neon Scripts (marca, site, inteligência e sistemas para pequenos negócios). Publicado em https://neonscripts.com.br pelo GitHub Pages, a partir da raiz do `main`. Sem build: tudo está em `index.html`, com CSS e JS embutidos. Identidade visual em `DESIGN.md`.

## Como trabalhar aqui
- Toda mudança vai por PR. O Brenno avalia antes de publicar, nunca fazer push direto no `main`.
- Sites, landing pages e peças de design sempre seguem a skill `emil-kowalski-motion` (valores em `DESIGN.md` › Movimento).
- Textos para cliente seguem a skill `voz-do-brenno`: caloroso, "a gente" em vez de "nós", quase sem emoji, sem jargão técnico. O jeito seco do Brenno com o Claude não é o jeito dele com cliente.
- Antes de abrir o PR, tirar print com o Playwright (já instalado) em 1280x720, 1366x768, 1440x900, 1920x1080 e 390x844. Prints ficam fora do repo.

## Regras do layout
- Computador (>= 1024px de largura e >= 600px de altura): a primeira tela (hero + serviços) ocupa exatamente 100vh, sem cortar nada. As seções seguintes vêm na rolagem.
- Texto mais longo nos cards de serviço aperta o hero e a placa encosta no sobretítulo. Em telas baixas (<= 740px) o sobretítulo some de propósito.
- Celular (<= 820px): versão C, com letreiro na largura toda, serviços em linha do tempo e botão verde fixo de WhatsApp depois do hero. Rascunhos A/B/C em `mobile/` (com `noindex`).
- Ordem das seções: Hero › Serviços (`#servicos`) › Projetos (`#projetos`) › Como funciona (`#como`) › Quem somos (`#quem`) › Contato (`#contato`). Todo link do menu precisa apontar para uma âncora que existe.
- Clientes: a fileira mostra 4; a partir do quinto rola para o lado com setas.

## Marca
- Nome: **Neon Scripts** (com espaço). Instagram @neon.scripts. Nunca só "Neon": conflita com o banco Neon e com o Neon Postgres.
- Não repetir "Neon Scripts" em texto no menu: o letreiro já é a marca.
- Letreiro: NEON em cima e SCRIPTS embaixo dentro da mesma placa, sempre em cores opostas (rosa/azul) que invertem juntas, com piscadas de vez em quando.
- **Sem metrô.** Nada de estação, linha, plataforma, baldeação, embarque, piso tátil. O Brenno vetou em 2026-10-27. Exceção: a foto do hero continua a da entrada do metrô (`assets/hero-metro.jpg`), por escolha do Brenno em 2026-10-27. Não trocar sem ele pedir. A faixa sob o hero é um tubo de neon (`.tubo`) e os números dos cards são "01-04" acesos.
- Serviços sempre nesta lista: Marca, Site, Inteligência, Sistemas.

## Dados fixos
- WhatsApp dos botões: `wa.me/5511999392800` (número pessoal do Brenno, provisório). Se mudar, trocar em todas as ocorrências do `index.html`.
- Domínio: `CNAME` = neonscripts.com.br, DNS no Registro.br. Não apagar o `CNAME`.
- SEO: ao criar página nova, incluir no `sitemap.xml`. Detalhes no `README.md`.

## Limitações da sessão na nuvem
- Não dá para enviar tags nem criar releases (o proxy bloqueia). A release v1.0 o Brenno cria pelo GitHub.
- Não dá para mexer em Settings › Pages pela API. Mudanças de Pages são com o Brenno.
