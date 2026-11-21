/**
 * Configuração comercial centralizada. Para adaptar a um cliente real,
 * substitua os valores abaixo. Enquanto `whatsappNumber` for null, o fluxo
 * de WhatsApp permanece demonstrativo e nenhum contato externo é aberto.
 */
export const SITE = {
  name: 'Atelier Imóveis',
  wordmark: 'ATELIER',
  tagline: 'Espaços que transformam perspectivas.',
  email: 'contato@atelier-imoveis.example',
  phoneDisplay: '(00) 0000-0000',
  whatsappNumber: null as string | null,
  addressLine: 'Endereço demonstrativo, São Paulo, SP',
  hours: 'Segunda a sexta, das 9h às 19h. Sábados, das 10h às 14h.',
  socials: ['Instagram', 'LinkedIn', 'Pinterest'],
  credit: 'Or7.dev',
  photoCredit: 'Fotografias: Unsplash, sob a Licença Unsplash.',
} as const
