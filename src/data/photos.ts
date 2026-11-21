/**
 * Fotografias licenciadas pela Licença Unsplash (https://unsplash.com/license).
 * Os identificadores apontam para images.unsplash.com e são servidos com
 * redimensionamento e formato automático (AVIF/WebP) pela CDN.
 *
 * Pares marcados como "mesmo imóvel" foram conferidos visualmente: mostram a
 * mesma construção em ângulos ou horários diferentes.
 */
export const PHOTO = {
  // Mesmo imóvel: fachada com eucalipto, ao entardecer e de dia
  jacarandaDusk: '1600585154340-be6161a56a0c',
  jacarandaDay: '1600607688969-a5bfcd646154',
  // Mesmo imóvel: volume revestido em madeira, dois ângulos
  laminaFront: '1600047509807-ba8f99d2cdde',
  laminaStreet: '1600047509358-9dc75507daeb',
  // Mesmo imóvel: ripado de madeira, de dia e à noite
  ripadoDay: '1600566753190-17f0baa2a6c3',
  ripadoNight: '1600566753376-12c8ab7fb75b',

  albedo: '1600596542815-ffad4c1539a9',
  brise: '1613490493576-7fde63acd811',
  patio: '1580587771525-78b9dba3b914',
  cobogo: '1600573472592-401b489a3cdc',
  horizonte: '1494526585095-c41746248156',
  falesia: '1615571022219-eb45cf7faa9d',
  mantiqueira: '1568605114967-8130f3a36994',
  vertice: '1545324418-cc1a3fa10c00',
  aurora: '1600585154526-990dced4db0d',
  mirante: '1600573472550-8090b5e0745e',
  monolito: '1523217582562-09d0def993a6',
  espelho: '1602343168117-bb8ffe3e2e9f',

  // Referências de ambientação (interiores de outros locais)
  livingGrey: '1600607687939-ce8a6c25118c',
  diningStairs: '1600607687920-4e2a09cf159d',
  kitchenWood: '1600585152220-90363fe7e115',
  bedroomDark: '1617104678098-de229db51175',
  livingOpen: '1600566753086-00f18fb6b3ea',
  kitchenWhite: '1484154218962-a197022b5858',
  bedroomWhite: '1600607687644-c7171b42498f',
  bathStone: '1600566752355-35792bedcfea',
  bedroomVelvet: '1616594039964-ae9021a400a0',
  livingSoft: '1633505899118-4ca6bd143043',
  livingArches: '1600210491892-03d54c0aaf87',
  kitchenIsland: '1507089947368-19c1da9775ae',
  livingBright: '1560448204-e02f11c3d0e2',
  bedroomHotel: '1631049307264-da0ec9d70304',
  diningGreen: '1617806118233-18e1de247200',
  livingCharcoal: '1600121848594-d8644e57abab',
  livingWarm: '1618221195710-dd6b41faaea6',
  kitchenGrey: '1600489000022-c2086d79f9d4',
  bedroomLight: '1595526114035-0d45ed16cfbf',
  livingRattan: '1615529182904-14819c35db37',
  livingPlants: '1600210492486-724fe5c67fb0',
  bedroomBoho: '1615874959474-d609969a20ed',
  livingGallery: '1600210491369-e753d80a41f3',
  readingCorner: '1586023492125-27b2c045efd7',
  bedroomCalm: '1505691938895-1758d7feb511',
  livingTeal: '1554995207-c18c203602cb',
} as const

const WIDTHS = [480, 768, 1080, 1440, 1920, 2400] as const

export function photoUrl(id: string, width = 1440, quality = 72): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`
}

export function photoSrcSet(id: string, maxWidth = 2400): string {
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${photoUrl(id, w)} ${w}w`)
    .join(', ')
}
