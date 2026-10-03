import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createSVGWindow } from 'svgdom';
import { SVG, registerWindow } from '@svgdotjs/svg.js';

const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const businessName = String(config.name || 'Ana Maria').trim();
const phone = String(process.env.WHATSAPP || config.whatsapp || '').replace(/\D/g, '');
const siteUrl = String(config.siteUrl || process.env.SITE_URL || '').trim().replace(/\/+$/, '');
if (phone && !/^55\d{10,11}$/.test(phone)) throw new Error('WhatsApp deve incluir 55 + DDD + número, só dígitos.');
if (siteUrl) {
  const url = new URL(siteUrl);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) throw new Error('siteUrl deve conter apenas a origem HTTPS do domínio.');
}

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const home = '/';
const family = '/plano-de-saude-familiar-fortaleza/';
const company = '/plano-de-saude-empresarial-fortaleza/';
const mei = '/plano-de-saude-mei-fortaleza/';
const breadcrumbNames = { [family]: 'Plano de saúde familiar', [company]: 'Plano de saúde empresarial', [mei]: 'Plano de saúde para MEI' };
const quoteMessage = 'Olá, Ana Maria! Gostaria de uma cotação de plano de saúde em Fortaleza.';
const contactHref = (message = quoteMessage) => phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '/#contato';
const target = phone ? ' target="_blank" rel="noopener noreferrer"' : '';
const button = (label, message, className = 'button button-primary') => `<a class="${className}" href="${contactHref(message)}"${target}>${label}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
const faq = (items) => `<div class="faq-list">${items.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div>`;
const check = (items) => `<ul class="check-list">${items.map((item) => `<li><span aria-hidden="true">✓</span>${item}</li>`).join('')}</ul>`;

function speechBubbleSvg() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  const draw = SVG(window.document.documentElement).size(370, 320).viewbox(0, 0, 370, 320);
  draw.path('M 94 7 C 40 11 14 42 8 93 C 2 144 8 199 25 237 C 18 257 11 273 5 285 C 28 286 46 282 64 270 C 98 298 151 310 223 309 C 311 308 353 275 361 212 C 369 158 363 85 340 48 C 318 12 273 5 197 5 C 156 5 121 5 94 7 Z')
    .fill('#fff8ec')
    .stroke({ color: '#ffc45f', width: 4, linejoin: 'round' });
  return draw.svg();
}

function shell({ path, title, description, body, image = false }) {
  const canonical = siteUrl ? `<link rel="canonical" href="${esc(siteUrl + path)}">` : '';
  const ogUrl = siteUrl ? `<meta property="og:url" content="${esc(siteUrl + path)}">` : '';
  const ogImage = siteUrl && image ? `<meta property="og:image" content="${esc(siteUrl)}/assets/familia-fortaleza.webp">` : '';
  const schemaData = !siteUrl ? null : path === '/' ? { '@context': 'https://schema.org', '@type': 'WebSite', name: businessName + ' | Planos de saúde em Fortaleza', url: siteUrl + '/' } : { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl + '/' }, { '@type': 'ListItem', position: 2, name: breadcrumbNames[path] }] };
  const schema = schemaData ? `<script type="application/ld+json">${JSON.stringify(schemaData).replace(/</g, '\\u003c')}</script>` : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#073e49">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${canonical}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  ${ogUrl}${ogImage}
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  ${image ? '<link rel="preload" as="image" href="/assets/familia-fortaleza-mobile.webp" media="(max-width: 699px)"><link rel="preload" as="image" href="/assets/familia-fortaleza.webp" media="(min-width: 700px)">' : ''}
  <link rel="stylesheet" href="/assets/site.css">
  ${schema}
</head>
<body${image ? ' class="home-page"' : ''}>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 32 9 21C3 14 13 6 20 14c7-8 17 0 11 7L20 32Z" fill="currentColor"/></svg></span><span><strong>${esc(businessName)}</strong><small>PLANOS DE SAÚDE</small></span></a>
      <button class="menu-button" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-principal" data-menu-button><span></span><span></span><span></span></button>
      <nav id="menu-principal" class="main-nav" aria-label="Navegação principal" data-menu>
        <a href="/#opcoes">Tipos de plano</a><a href="/#como-funciona">Como funciona</a><a href="/#duvidas">Dúvidas</a><a href="/#contato">Contato</a>
        ${button('Pedir cotação', quoteMessage, 'button button-small button-primary nav-cta')}
      </nav>
    </div>
  </header>
  <main id="conteudo">${body}</main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div><a class="brand brand-light" href="/"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 32 9 21C3 14 13 6 20 14c7-8 17 0 11 7L20 32Z" fill="currentColor"/></svg></span><span><strong>${esc(businessName)}</strong><small>PLANOS DE SAÚDE</small></span></a><p>Orientação para encontrar um plano de saúde que faça sentido para você, sua família ou seu negócio em Fortaleza, Ceará.</p></div>
      <div><h2>Navegue</h2><a href="/#opcoes">Tipos de plano</a><a href="/#como-funciona">Como funciona</a><a href="/#duvidas">Perguntas frequentes</a><a href="/#contato">Contato</a></div>
      <div><h2>Planos</h2><a href="${family}">Plano familiar</a><a href="${company}">Plano empresarial</a><a href="${mei}">Plano para MEI</a></div>
      <div><h2>Atendimento</h2><p>Fortaleza, Ceará<br>Atendimento e cotação online</p>${phone ? `<a class="footer-contact" href="${contactHref()}"${target}>Conversar pelo WhatsApp ↗</a>` : '<p class="setup-note">Canal de WhatsApp em configuração.</p>'}<a href="https://www.gov.br/ans/pt-br/acesso-a-informacao/guia-de-planos/guia-de-planos" target="_blank" rel="noopener noreferrer">Guia de Planos da ANS ↗</a></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(businessName)}.</span><span>Informações sobre planos dependem das condições de cada operadora.</span></div>
  </footer>
  ${phone ? `<a class="whatsapp-float" href="${contactHref()}" target="_blank" rel="noopener noreferrer" aria-label="Conversar com Ana Maria pelo WhatsApp" title="Conversar pelo WhatsApp"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3.5a12.5 12.5 0 0 0-10.8 18.8L3.5 28.5l6.4-1.7A12.5 12.5 0 1 0 16 3.5Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11.1 10.1c.5-.4 1-.3 1.3.2l1.5 2.3c.3.5.2.9-.2 1.3l-.7.7a11 11 0 0 0 4.4 4.4l.7-.7c.4-.4.8-.5 1.3-.2l2.3 1.5c.5.3.6.8.2 1.3-.8 1.2-2.3 1.7-3.8 1.2-3.6-1.2-7.6-5.2-8.8-8.8-.5-1.5 0-3 1.2-3.8Z" fill="currentColor"/></svg></a>` : `<div class="mobile-action">${button('Solicitar cotação', quoteMessage, 'button button-primary')}</div>`}
  <script src="/assets/site.js" defer></script>
</body>
</html>`;
}

const options = [
  { num: '01', icon: '♡', title: 'Para você e sua família', text: 'Entenda as opções para acompanhar cada fase da vida de quem você ama.', href: family, link: 'Ver plano familiar' },
  { num: '02', icon: '▦', title: 'Para sua empresa', text: 'Compare alternativas para oferecer assistência à saúde à sua equipe.', href: company, link: 'Ver plano empresarial' },
  { num: '03', icon: '✳', title: 'Para quem é MEI', text: 'Saiba o que avaliar ao buscar um plano vinculado ao seu CNPJ.', href: mei, link: 'Ver plano para MEI' },
];

const homeBody = `
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero-grid">
      <div class="hero-copy"><p class="eyebrow eyebrow-light"><svg class="hero-pin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 22s7-7.1 7-13a7 7 0 1 0-14 0c0 5.9 7 13 7 13Z" fill="currentColor"/><circle cx="12" cy="9" r="2.5" fill="#07525b"/></svg>ORIENTAÇÃO EM FORTALEZA, CE</p><h1 id="hero-title">Seu plano de saúde em Fortaleza, com <em>mais clareza.</em></h1><p class="hero-lead">Compare opções para sua família, empresa ou MEI com orientação clara e atendimento próximo em Fortaleza.</p><div class="hero-actions">${button('Solicitar cotação', quoteMessage)}<a class="text-link text-link-light" href="#opcoes">Conhecer as opções <span aria-hidden="true">↗</span></a></div><div class="hero-foot"><span><span class="hero-foot-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M6 7h20v14H14l-7 5v-5H6V7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="11" cy="14" r="1.2" fill="currentColor"/><circle cx="16" cy="14" r="1.2" fill="currentColor"/><circle cx="21" cy="14" r="1.2" fill="currentColor"/></svg></span>Atendimento<br>personalizado</span><span><span class="hero-foot-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="11" cy="11" r="4" fill="currentColor"/><circle cx="22" cy="12" r="3" fill="currentColor"/><path d="M3.5 26v-3a7.5 7.5 0 0 1 15 0v3H3.5Zm16 0v-2.5c0-2.1-.7-3.8-1.7-5.1A6.5 6.5 0 0 1 28.5 23v3h-9Z" fill="currentColor"/></svg></span>Diferentes<br>tipos de plano</span><span><span class="hero-foot-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m16 3 10 4v7c0 7.4-3.7 11.9-10 15-6.3-3.1-10-7.6-10-15V7l10-4Z" fill="currentColor"/><path d="m11 16 3.3 3.3L21.5 12" stroke="#07525b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Cotação sem<br>compromisso</span></div></div>
      <div class="hero-visual"><span class="hero-swoosh" aria-hidden="true"></span><span class="hero-sparks" aria-hidden="true"></span><picture class="hero-family"><source media="(max-width: 699px)" srcset="/assets/familia-fortaleza-mobile.webp"><img src="/assets/familia-fortaleza.webp" alt="Três gerações de uma família reunidas em casa" width="1536" height="1024" fetchpriority="high"></picture><span class="hero-heart" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 32 9 21C3 14 13 6 20 14c7-8 17 0 11 7L20 32Z" fill="currentColor"/></svg></span><img class="hero-character" src="/assets/ana-maria-hero.webp" alt="" width="1055" height="1490" decoding="sync" fetchpriority="high"><div class="visual-badge"><span class="badge-icon" aria-hidden="true">✳</span><span>Mais segurança e bem-estar<br><strong>para quem você ama.</strong></span></div></div>
      <div class="hero-speech"><p class="hero-speech-intro">Oi!<br><strong>Conte comigo</strong> <span aria-hidden="true">♥</span></p><p>Vou te ajudar a encontrar<br>o plano de saúde ideal<br>para você e sua família,<br>com mais clareza<br>e sem complicação.</p></div>
    </div>
  </section>
  <section class="quick-links" aria-label="Escolha por perfil"><div class="container quick-links-inner"><p>Qual plano combina com você?</p><a href="${family}">Pessoa e família <span aria-hidden="true">↗</span></a><a href="${company}">Empresa <span aria-hidden="true">↗</span></a><a href="${mei}">MEI <span aria-hidden="true">↗</span></a></div></section>
  <section class="section options-section" id="opcoes"><div class="container"><div class="section-heading"><div><p class="eyebrow">ESCOLHA COM TRANQUILIDADE</p><h2>Um plano para cada momento da vida.</h2></div><p>As necessidades mudam de pessoa para pessoa. O primeiro passo é entender seu perfil e comparar o que realmente importa.</p></div><div class="option-grid">${options.map((o) => `<article class="option-card"><span class="card-num">${o.num}</span><span class="option-icon" aria-hidden="true">${o.icon}</span><h3>${o.title}</h3><p>${o.text}</p><a href="${o.href}" class="card-link">${o.link} <span aria-hidden="true">↗</span></a></article>`).join('')}</div><p class="section-note">A disponibilidade e as condições variam conforme a operadora, o tipo de contratação e o perfil do beneficiário.</p></div></section>
  <section class="section process-section" id="como-funciona"><div class="container process-grid"><div class="process-intro"><p class="eyebrow">DO PRIMEIRO CONTATO À ESCOLHA</p><h2>Simples de entender. Melhor de decidir.</h2><p>Você conta o que precisa. Ana Maria ajuda a comparar as alternativas disponíveis e esclarece os pontos essenciais antes da contratação.</p>${button('Conversar sobre meu plano', 'Olá, Ana Maria! Quero entender as opções de plano de saúde em Fortaleza.', 'button button-outline')}</div><div class="step-list"><article><span>01</span><div><h3>Conte sua necessidade</h3><p>Informe quem precisa do plano, a faixa etária e se a contratação é pessoal, familiar ou empresarial.</p></div></article><article><span>02</span><div><h3>Compare com clareza</h3><p>Veja cobertura, rede, acomodação, carências e possibilidade de coparticipação nas opções disponíveis.</p></div></article><article><span>03</span><div><h3>Escolha com segurança</h3><p>Tire suas dúvidas sobre as condições apresentadas antes de seguir com a proposta.</p></div></article></div></div></section>
  <section class="section guide-section" id="o-que-avaliar"><div class="container guide-grid"><div class="guide-art"><span class="art-sun" aria-hidden="true"></span><img class="guide-character" src="/assets/ana-maria-personagem.webp" alt="" width="800" height="1200" loading="lazy" decoding="async"><div class="guide-art-card"><span>O que observar</span><strong>O melhor plano é aquele que atende às suas necessidades.</strong></div><span class="art-circle art-circle-one" aria-hidden="true"></span><span class="art-circle art-circle-two" aria-hidden="true"></span></div><div class="guide-copy"><p class="eyebrow">ANTES DE CONTRATAR</p><h2>Olhe além do preço.</h2><p>Uma mensalidade só faz sentido quando você entende o que está incluído. Estes são alguns pontos para conferir em cada proposta:</p>${check(['<strong>Rede de atendimento:</strong> hospitais, clínicas e laboratórios disponíveis para o produto.', '<strong>Cobertura e abrangência:</strong> serviços contratados e locais onde o plano pode ser usado.', '<strong>Carência:</strong> prazos aplicáveis antes de utilizar determinados serviços.', '<strong>Coparticipação:</strong> se existe cobrança adicional por utilização.'])}<a class="text-link" href="#duvidas">Veja as dúvidas frequentes <span aria-hidden="true">↗</span></a><p class="source-note">Para comparar opções por conta própria, consulte também o <a href="https://www.gov.br/ans/pt-br/acesso-a-informacao/guia-de-planos/guia-de-planos" target="_blank" rel="noopener noreferrer">Guia de Planos da ANS</a>.</p></div></div></section>
  <section class="section local-section"><div class="container local-card"><div class="local-copy"><p class="eyebrow eyebrow-light">ATENDIMENTO EM FORTALEZA</p><h2>Orientação próxima, do seu jeito.</h2><p>Para quem busca plano de saúde em Fortaleza, ter alguém para explicar as opções ajuda a transformar uma decisão complexa em uma escolha mais clara.</p>${button('Pedir uma cotação', quoteMessage, 'button button-cream')}</div><div class="local-illustration" aria-hidden="true"><span class="local-sun"></span><img class="local-character" src="/assets/ana-maria-personagem.webp" alt="" width="800" height="1200" loading="lazy" decoding="async"></div></div></section>
  <section class="section faq-section" id="duvidas"><div class="container faq-grid"><div><p class="eyebrow">PERGUNTAS FREQUENTES</p><h2>Dúvidas de quem está escolhendo um plano.</h2><p>Condições específicas precisam ser confirmadas na proposta e no contrato de cada operadora.</p></div>${faq([
    ['Como escolher um plano de saúde em Fortaleza?', 'Comece pelo seu perfil: número de pessoas, faixa etária, locais de atendimento importantes e orçamento. Depois, compare rede, cobertura, carências, acomodação e coparticipação nas propostas disponíveis.'],
    ['Existe plano de saúde para família e para MEI?', 'Sim, há modalidades de contratação diferentes. A elegibilidade, o número mínimo de beneficiários e as condições variam conforme a operadora e o produto.'],
    ['Posso comparar planos de diferentes operadoras?', 'Ana Maria pode apresentar alternativas disponíveis para o seu perfil. A oferta exata depende das regras comerciais de cada operadora no momento da cotação.'],
    ['O que é carência em plano de saúde?', 'É o prazo previsto em contrato que pode ser necessário cumprir antes de utilizar determinados serviços. Verifique os prazos de cada proposta antes de contratar.'],
    ['A cotação tem compromisso?', 'Você pode pedir informações e analisar as propostas antes de decidir. A contratação só ocorre após a sua escolha e a confirmação das condições.']
  ])}</div></section>
  <section class="section contact-section" id="contato"><div class="container contact-card"><div><p class="eyebrow eyebrow-light">VAMOS CONVERSAR?</p><h2>Seu próximo passo pode ser mais simples.</h2><p>Fale sobre o que você procura e receba orientação para comparar planos de saúde em Fortaleza.</p></div><div class="contact-action">${phone ? button('Falar com Ana Maria', quoteMessage, 'button button-cream') : '<p class="contact-pending">O WhatsApp será ativado assim que o número de atendimento for informado.</p>'}<small>Atendimento personalizado • Fortaleza, CE</small></div></div></section>`;

function detailPage({ path, eyebrow, title, description, intro, profile, bullets, compare, questions, related }) {
  const body = `
    <section class="inner-hero"><div class="container"><nav class="breadcrumbs" aria-label="Você está aqui"><a href="/">Início</a><span aria-hidden="true">/</span><span>${eyebrow}</span></nav><div class="inner-hero-grid"><div><p class="eyebrow eyebrow-light">${eyebrow.toUpperCase()} EM FORTALEZA</p><h1>${title}</h1><p>${intro}</p>${button('Solicitar cotação', `Olá, Ana Maria! Gostaria de cotar ${eyebrow.toLowerCase()} em Fortaleza.`)}</div><div class="inner-hero-aside"><span class="aside-icon" aria-hidden="true">♡</span><strong>Escolha com informação.</strong><p>Compare as condições disponíveis para seu perfil com orientação personalizada.</p></div></div></div></section>
    <section class="section detail-intro"><div class="container detail-grid"><div><p class="eyebrow">ENTENDA A MODALIDADE</p><h2>${profile.heading}</h2></div><div><p>${profile.text}</p>${check(bullets)}</div></div></section>
    <section class="section compare-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">COMPARE COM ATENÇÃO</p><h2>O que observar na proposta?</h2></div><p>Valores e regras podem mudar entre operadoras e produtos. Confirme sempre os detalhes da oferta antes da contratação.</p></div><div class="compare-grid">${compare.map((item, index) => `<article><span>0${index + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}</div></div></section>
    <section class="section faq-section"><div class="container faq-grid"><div><p class="eyebrow">DÚVIDAS FREQUENTES</p><h2>Perguntas sobre ${eyebrow.toLowerCase()}.</h2><p>Use essas respostas como ponto de partida e confira as condições específicas da proposta.</p></div>${faq(questions)}</div></section>
    <section class="section detail-related"><div class="container"><p class="eyebrow">OUTRAS POSSIBILIDADES</p><h2>Explore outras formas de contratação.</h2><div class="related-grid">${related.map((item) => `<a href="${item.href}"><span>${item.label}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>
    <section class="section contact-section" id="contato"><div class="container contact-card"><div><p class="eyebrow eyebrow-light">FALE COM ANA MARIA</p><h2>Encontre opções para o seu perfil.</h2><p>Conte o que você procura e compare planos de saúde disponíveis em Fortaleza.</p></div><div class="contact-action">${phone ? button('Pedir cotação', `Olá, Ana Maria! Gostaria de cotar ${eyebrow.toLowerCase()} em Fortaleza.`, 'button button-cream') : '<p class="contact-pending">O WhatsApp será ativado assim que o número de atendimento for informado.</p>'}<small>Atendimento personalizado • Fortaleza, CE</small></div></div></section>`;
  return shell({ path, title: description.title, description: description.meta, body });
}

const pages = [
  { path: home, html: shell({ path: home, title: 'Plano de Saúde em Fortaleza, CE | Cotação com Ana Maria', description: 'Compare opções de plano de saúde em Fortaleza para família, empresa ou MEI. Orientação personalizada para avaliar cobertura, rede, carência e valores.', body: homeBody, image: true }) },
  { path: family, html: detailPage({ path: family, eyebrow: 'Plano de saúde familiar', title: 'Plano de saúde familiar em Fortaleza: escolha com mais clareza.', description: { title: 'Plano de Saúde Familiar em Fortaleza, CE | Ana Maria', meta: 'Buscando plano de saúde familiar em Fortaleza? Entenda rede, cobertura, carência e coparticipação. Peça uma cotação personalizada com Ana Maria.' }, intro: 'Compare alternativas para cuidar de você e de sua família, considerando rotina, necessidades de atendimento e orçamento.', profile: { heading: 'Cuidado para as pessoas que fazem parte da sua vida.', text: 'Um plano familiar pode reunir beneficiários conforme as regras de contratação do produto. Antes de escolher, vale listar quem utilizará o plano e quais serviços e locais de atendimento são importantes para cada pessoa.' }, bullets: ['Informe a quantidade de pessoas e as faixas etárias.', 'Considere hospitais, clínicas e laboratórios relevantes para sua família.', 'Confira as regras de inclusão de dependentes no produto escolhido.'], compare: [['Rede credenciada', 'Verifique a rede correspondente ao produto específico e se atende às suas preferências em Fortaleza.'], ['Cobertura e acomodação', 'Analise os serviços contratados e a opção de acomodação hospitalar quando aplicável.'], ['Carências e custos', 'Confira mensalidade, reajustes previstos, carências e eventual coparticipação.']], questions: [['Quem pode entrar em um plano familiar?', 'As regras de inclusão de dependentes variam conforme a operadora e o produto. Informe a composição da família para avaliar as alternativas disponíveis.'], ['O valor muda conforme a idade?', 'A faixa etária pode influenciar o valor da mensalidade. Confira a tabela e as regras de reajuste da proposta antes de contratar.'], ['É possível escolher hospitais específicos?', 'Você pode informar quais hospitais são importantes para sua família. A presença deles deve ser confirmada na rede do produto contratado, pois redes podem variar.']], related: [{ href: company, label: 'Plano empresarial' }, { href: mei, label: 'Plano para MEI' }] }) },
  { path: company, html: detailPage({ path: company, eyebrow: 'Plano de saúde empresarial', title: 'Plano de saúde empresarial em Fortaleza para sua equipe.', description: { title: 'Plano de Saúde Empresarial em Fortaleza, CE | Ana Maria', meta: 'Compare planos de saúde empresariais em Fortaleza. Veja pontos como elegibilidade, rede, cobertura e coparticipação antes de solicitar uma proposta.' }, intro: 'Avalie opções de assistência à saúde para sua empresa com atenção ao perfil da equipe e às condições de cada operadora.', profile: { heading: 'Uma decisão que envolve pessoas e planejamento.', text: 'A contratação empresarial pode atender empresas de diferentes portes, conforme os critérios de cada produto. Informações sobre CNPJ, quantidade de vidas e perfil dos beneficiários ajudam a encontrar propostas pertinentes.' }, bullets: ['Defina quantas pessoas poderão participar e seus perfis.', 'Avalie a abrangência necessária para a rotina da equipe.', 'Compare regras de inclusão, permanência e custos do contrato.'], compare: [['Elegibilidade', 'Confira tempo de CNPJ, número mínimo de vidas e documentos exigidos na modalidade ofertada.'], ['Rede e abrangência', 'Considere onde a equipe trabalha e quais locais de atendimento fazem sentido.'], ['Modelo de custos', 'Analise mensalidade, coparticipação, reajustes e condições contratuais.']], questions: [['Toda empresa pode contratar um plano empresarial?', 'A elegibilidade depende das regras da operadora e do produto, incluindo documentos e número de beneficiários.'], ['É possível incluir dependentes dos colaboradores?', 'Alguns produtos permitem a inclusão conforme regras próprias. Confira parentesco aceito, prazos e condições de adesão na proposta.'], ['Como pedir uma cotação empresarial?', 'Tenha em mãos o CNPJ, a quantidade de pessoas, as faixas etárias e a cidade de atendimento desejada. Esses dados ajudam a identificar propostas disponíveis.']], related: [{ href: family, label: 'Plano familiar' }, { href: mei, label: 'Plano para MEI' }] }) },
  { path: mei, html: detailPage({ path: mei, eyebrow: 'Plano de saúde para MEI', title: 'Plano de saúde para MEI em Fortaleza: entenda suas opções.', description: { title: 'Plano de Saúde para MEI em Fortaleza, CE | Ana Maria', meta: 'Quer cotar plano de saúde para MEI em Fortaleza? Entenda critérios de elegibilidade, número de vidas, rede e custos antes de comparar propostas.' }, intro: 'Se você é microempreendedor individual, compare propostas com atenção às regras de contratação ligadas ao seu CNPJ.', profile: { heading: 'Seu negócio também precisa de escolhas bem pensadas.', text: 'Algumas operadoras oferecem modalidades empresariais acessíveis a MEI. A disponibilidade depende de critérios como tempo de CNPJ, número de beneficiários e documentação exigida por cada produto.' }, bullets: ['Confira os critérios de elegibilidade para seu CNPJ.', 'Verifique se há número mínimo de beneficiários.', 'Compare a rede e o custo total para as pessoas incluídas.'], compare: [['Regras para MEI', 'Confirme tempo mínimo de CNPJ, documentação e composição do grupo exigidos pela proposta.'], ['Cobertura e rede', 'Veja se os serviços e prestadores disponíveis atendem à sua rotina em Fortaleza.'], ['Custos e prazos', 'Analise mensalidade, coparticipação, carências e regras de reajuste.']], questions: [['MEI pode contratar plano de saúde?', 'Pode haver opções empresariais para MEI, desde que os critérios de elegibilidade da operadora e do produto sejam cumpridos.'], ['Preciso incluir outra pessoa?', 'O número mínimo de beneficiários varia. Confira as condições de cada oferta antes de decidir.'], ['O plano para MEI tem carência?', 'As regras de carência dependem da proposta e das condições aplicáveis. Solicite essa informação por escrito ao comparar alternativas.']], related: [{ href: family, label: 'Plano familiar' }, { href: company, label: 'Plano empresarial' }] }) }
];

await mkdir('dist/assets', { recursive: true });
await cp('src/assets', 'dist/assets', { recursive: true });
await writeFile('dist/assets/hero-speech.svg', speechBubbleSvg(), 'utf8');
await cp('src/site.css', 'dist/assets/site.css');
await cp('src/site.js', 'dist/assets/site.js');
await cp('google61c658cc4a703905.html', 'dist/google61c658cc4a703905.html');
for (const page of pages) {
  const dir = join('dist', page.path === '/' ? '' : page.path.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), page.html, 'utf8');
}
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`, 'utf8');
if (siteUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${esc(siteUrl + page.path)}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile('dist/sitemap.xml', sitemap, 'utf8');
} else await rm('dist/sitemap.xml', { force: true });
console.log(`Geradas ${pages.length} páginas em dist/.${siteUrl ? ' Sitemap e canonicals incluídos.' : ' Configure siteUrl para gerar sitemap e canonicals.'}${phone ? '' : ' Configure whatsapp para ativar as cotações.'}`);
