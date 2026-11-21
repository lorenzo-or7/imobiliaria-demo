# Atelier Imóveis — protótipo comercial

Website demonstrativo de uma imobiliária de curadoria, desenvolvido pela Or7.dev.
Todos os imóveis, preços, contatos e a própria marca são fictícios.

## Executar localmente

Requer Node 20 ou superior.

```bash
npm install
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm test           # testes automatizados (Vitest + Testing Library)
npm run build      # checagem de tipos + build de produção em dist/
npm run preview    # serve o build de produção
```

Como é uma SPA com rotas no navegador, o servidor de produção precisa redirecionar
qualquer rota desconhecida para `index.html` (fallback de SPA).

## Stack

React 19, TypeScript, Vite, React Router 7 (data router, rotas com carregamento sob demanda),
Motion (animações), Lucide (ícones), CSS Modules com tokens globais. Testes com Vitest,
Testing Library e jsdom.

## Estrutura

```
src/
  data/          dados centralizados: imóveis, regiões, coleções, fotos, configuração do site
  lib/           lógica pura: filtros e URL, formatação, validação, agenda, comparação, storage
  state/         contextos: tema, favoritos e comparação (localStorage), avisos (toasts)
  components/    componentes reutilizáveis (cards, filtros, galeria, diálogo, formulários, motion)
  sections/      seções da home
  pages/         páginas por rota
  styles/        tokens de cor, tipografia e componentes globais
  test/          configuração e testes de fluxo
```

## Adaptar para um cliente real

- `src/data/site.ts`: nome, contatos, horário e número de WhatsApp. Com `whatsappNumber: null`,
  o botão de WhatsApp só mostra e copia a mensagem; com um número autorizado, abre o `wa.me`.
- `src/data/properties.ts`, `regions.ts`, `catalog.ts`: catálogo, regiões e coleções.
- `src/data/photos.ts`: identificadores das fotografias.
- Formulários (`ContactForm`, agendamento) não enviam dados: basta ligar o `onSubmit` a um backend.

## Conteúdo e honestidade

- Fotografias da Unsplash (Licença Unsplash). Cada imóvel tem fotos de uma única construção;
  quando há mais de uma, foram conferidas visualmente como o mesmo imóvel. As demais imagens
  da galeria são marcadas como "Referência de ambientação" na interface.
- Plantas são ilustrativas e sem escala. Mapas da página do imóvel mostram apenas a área do bairro
  (OpenStreetMap) e só carregam depois de um clique.
- Faixas de preço e contagens por região são calculadas sobre o próprio catálogo, sem dados de mercado.
- Agendamento e contato exibem confirmação local e deixam claro que nada foi enviado.

## Publicação no GitHub Pages

Repositório: `imobiliaria-demo`. Selecione **Settings > Pages > GitHub Actions**. O workflow publica o branch `main` e inclui `404.html` para rotas internas.

URL: https://lorenzo-or7.github.io/imobiliaria-demo/
