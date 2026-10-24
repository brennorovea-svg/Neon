# Neon · site V.1

Site estático da Neon, softwarehouse para pequenos negócios de São Paulo.

- `index.html`: página única (hero "entrada do metrô" + seção de serviços "Plataforma 1"), com CSS e JS embutidos, sem build.
- `assets/hero-metro.jpg`: foto do hero, foto original de 1950px.

Para ver localmente, abra `index.html` no navegador.

## Pendências antes de divulgar
- Trocar a foto do hero por uma foto própria em alta resolução (a atual é de referência e mostra a placa da estação Trianon-Masp do Metrô).
- Criar as seções que os links já apontam: Projetos, Como funciona e Contato.

## Movimento
Easing único `cubic-bezier(.22,1,.36,1)`, controles em 180ms, entrada em 720ms com stagger de 70ms, letreiro "liga" uma vez. Tudo respeita `prefers-reduced-motion`.
