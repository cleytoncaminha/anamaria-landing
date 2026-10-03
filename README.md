# Site de Ana Maria — planos de saúde em Fortaleza

Site estático, responsivo e sem backend. O HTML de cada página é gerado no build, de modo que títulos, textos e links estejam disponíveis para mecanismos de busca sem depender de JavaScript.

## Prévia local

```bash
npm ci
npm run build
npm run dev
```

Abra `http://localhost:4173`.

## Dados antes da publicação

Edite `site.config.json`:

- `name`: nome profissional que aparecerá no site.
- `whatsapp`: número completo com código do país e DDD, apenas dígitos. Exemplo de formato: `5585999999999` (substitua pelo número real).
- `siteUrl`: domínio final com `https://`, por exemplo `https://seudominio.com.br`.

Execute `npm run build` novamente. O build ativa os links de WhatsApp e gera `sitemap.xml`, links canônicos e metadados de compartilhamento com o domínio final. Também é possível fornecer `WHATSAPP` como variável de ambiente; `SITE_URL` é usada quando `siteUrl` não estiver definido em `site.config.json`.

**Sem número, os botões de cotação apontam para a seção de contato e exibem que o canal ainda está em configuração.** Sem domínio, o build omite URLs canônicas e sitemap para não publicar endereços incorretos.

Publique o conteúdo de `dist/` na raiz do domínio. As rotas são:

- `/`
- `/plano-de-saude-familiar-fortaleza/`
- `/plano-de-saude-empresarial-fortaleza/`
- `/plano-de-saude-mei-fortaleza/`

## SEO após publicar

1. Verifique o domínio no [Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start), envie `https://seu-dominio/sitemap.xml` e acompanhe indexação, consultas, impressões e cliques.
2. Crie ou atualize o [Perfil da Empresa no Google](https://support.google.com/business/answer/7091) com informações reais e consistentes, caso o negócio seja elegível.
3. Confirme os dados comerciais, número de contato, operadoras efetivamente disponíveis e informações de cada produto. Atualize as páginas quando as condições mudarem.
4. Acrescente nome profissional completo, dados verificáveis de atuação, foto real autorizada e depoimentos autênticos, se disponíveis. Não publique alegações ou avaliações inventadas.

O site inclui conteúdo por intenção de busca, títulos e descrições únicos, navegação interna, HTML semântico, imagem otimizada, `robots.txt` e sitemap quando há domínio. Posição ou apresentação nos resultados do Google não é garantida por nenhuma implementação técnica.

## Imagem

O balão de fala é gerado como SVG no build com SVG.js e svgdom. A mensagem permanece como texto HTML e essas bibliotecas não são carregadas no navegador.

`src/assets/ana-maria-hero.webp` é o recorte transparente usado no banner principal. Foi preparado com o modo embutido de ImageGen a partir da nova foto da personagem enviada para o projeto. Prompt final: “Cut out the woman from the first attached image (gray background), retaining her exact appearance and pose, including pointing hand and open hand. Produce a full-height transparent PNG with clean edges. The second attached banner is a composition reference only. No text, scenery, or extra objects.” O PNG gerado foi convertido para WebP preservando a transparência.

`src/assets/familia-fortaleza.webp` e a versão mobile foram geradas com o modo embutido de ImageGen para este projeto. A imagem é ilustrativa e não retrata a profissional.

Prompt usado:

> Use case: photorealistic-natural. Asset type: high-end responsive website hero photograph for a Brazilian health insurance consultant in Fortaleza, Ceará. Primary request: a natural candid portrait of a multigenerational Brazilian family together at home, conveying care, peace of mind and wellbeing. A smiling woman in her early 40s in the foreground with her teenage daughter and older mother nearby, authentic diverse Brazilian appearance. Scene/backdrop: bright contemporary apartment in Fortaleza with subtle tropical plants and warm afternoon daylight, no identifiable landmarks. Style/medium: premium editorial lifestyle photography, believable human anatomy and facial expressions, sophisticated but unposed. Composition/framing: wide landscape 3:2 composition, subjects grouped on the RIGHT half of frame with clear soft negative space on LEFT for page headline, mid shot, natural eye level. Lighting/mood: warm natural light, calm, inviting, confident. Color palette: soft cream, deep navy accents, muted teal, warm sunlit skin tones. Constraints: no text, no logos, no brand marks, no medical uniforms or hospital equipment, no watermarks, no fake documents.
