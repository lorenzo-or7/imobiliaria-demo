import { PHOTO } from './photos'
import type { Collection, CollectionId, FeatureKey, PropertyType, Purpose } from './types'

export const PURPOSE_LABEL: Record<Purpose, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
}

export const PURPOSE_ACTION: Record<Purpose, string> = {
  venda: 'Comprar',
  aluguel: 'Alugar',
}

export const TYPE_LABEL: Record<PropertyType, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  loft: 'Loft',
  'casa-de-campo': 'Casa de campo',
}

export const TYPE_ORDER: PropertyType[] = ['casa', 'apartamento', 'cobertura', 'loft', 'casa-de-campo']

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  piscina: 'Piscina',
  jardim: 'Jardim',
  varanda: 'Varanda',
  'vista-mar': 'Vista para o mar',
  'vista-panoramica': 'Vista panorâmica',
  'home-office': 'Espaço de trabalho',
  'aceita-pet': 'Aceita pets',
  mobiliado: 'Mobiliado',
  academia: 'Academia',
  lareira: 'Lareira',
  'energia-solar': 'Energia solar',
  'portaria-24h': 'Portaria 24 h',
}

export const FEATURE_ORDER: FeatureKey[] = [
  'piscina',
  'jardim',
  'varanda',
  'vista-mar',
  'vista-panoramica',
  'home-office',
  'aceita-pet',
  'mobiliado',
  'academia',
  'lareira',
  'energia-solar',
  'portaria-24h',
]

export const COLLECTIONS: Collection[] = [
  {
    id: 'arquitetura-contemporanea',
    title: 'Arquitetura contemporânea',
    summary: 'Projetos recentes, materiais honestos e plantas abertas.',
    description:
      'Casas e apartamentos em que o projeto é o protagonista: estrutura aparente, madeira, concreto e vidro usados com intenção, e plantas que priorizam luz e ventilação.',
    cover: PHOTO.cobogo,
    coverAlt: 'Fachada com painéis brancos perfurados e base de madeira',
  },
  {
    id: 'refugios-naturais',
    title: 'Refúgios naturais',
    summary: 'Mar, serra e mata a poucas horas da cidade.',
    description:
      'Endereços para desacelerar: casas de praia, casas de serra e propriedades com muito espaço externo, pensadas para fins de semana longos ou para morar fora da capital.',
    cover: PHOTO.falesia,
    coverAlt: 'Casa branca sobre as pedras, de frente para o mar',
  },
  {
    id: 'vida-urbana',
    title: 'Vida urbana',
    summary: 'Para resolver o dia a pé, com tudo perto.',
    description:
      'Apartamentos, lofts e casas em bairros com comércio, cultura e serviços por perto. Menos tempo no trânsito, mais tempo na cidade.',
    cover: PHOTO.vertice,
    coverAlt: 'Edifício residencial de fachada escura visto de baixo',
  },
  {
    id: 'casas-extraordinarias',
    title: 'Casas extraordinárias',
    summary: 'Imóveis raros, de projeto autoral e implantação única.',
    description:
      'Uma seleção curta de imóveis difíceis de repetir: terrenos singulares, arquitetura assinada e soluções construtivas que fazem diferença no dia a dia.',
    cover: PHOTO.brise,
    coverAlt: 'Casa branca com marquise de madeira e piscina escura',
  },
]

export const COLLECTION_BY_ID: Record<CollectionId, Collection> = Object.fromEntries(
  COLLECTIONS.map((c) => [c.id, c]),
) as Record<CollectionId, Collection>
