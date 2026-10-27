# Neon · site V.1

Site estático da Neon, softwarehouse para pequenos negócios de São Paulo.

- `index.html`: página única (hero com o letreiro + serviços, projetos, como funciona, quem somos e contato), com CSS e JS embutidos, sem build.
- `assets/hero-banca.jpg`: foto do hero (banca de rua na chuva).

Para ver localmente, abra `index.html` no navegador.

## Pendências antes de divulgar
- Confirmar a licença da foto do hero ou trocar por uma foto própria.

## Movimento
Easing único `cubic-bezier(.22,1,.36,1)`, controles em 180ms, entrada em 720ms com stagger de 70ms, letreiro "liga" uma vez. Tudo respeita `prefers-reduced-motion`.

## Google (SEO)
- `<head>` do `index.html`: título, descrição, endereço oficial (canonical), prévia de link (Open Graph) e a ficha da empresa em dados estruturados (`ProfessionalService` em São Paulo).
- `robots.txt` libera o site todo e aponta o `sitemap.xml`. Ao criar uma página nova, acrescente o endereço dela no `sitemap.xml`.
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` e `site.webmanifest`: ícone da aba e do resultado de busca.
- `assets/og-neon-scripts.jpg` (1200×630): imagem que aparece quando o link é compartilhado.
- `mobile/`: rascunhos com `noindex`, para não competirem com a página principal.
