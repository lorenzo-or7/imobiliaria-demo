export type Purpose = 'venda' | 'aluguel'

export type PropertyType = 'casa' | 'apartamento' | 'cobertura' | 'loft' | 'casa-de-campo'

export type FeatureKey =
  | 'piscina'
  | 'jardim'
  | 'varanda'
  | 'vista-mar'
  | 'vista-panoramica'
  | 'home-office'
  | 'aceita-pet'
  | 'mobiliado'
  | 'academia'
  | 'lareira'
  | 'energia-solar'
  | 'portaria-24h'

export type CollectionId = 'arquitetura-contemporanea' | 'refugios-naturais' | 'vida-urbana' | 'casas-extraordinarias'

/**
 * scope "imovel": fotografia usada como imagem do imóvel fictício.
 * scope "referencia": imagem de ambientação de outro local, sempre rotulada na interface.
 */
export interface Photo {
  id: string
  alt: string
  scope: 'imovel' | 'referencia'
  caption: string
}

export interface FloorPlanRoom {
  name: string
  x: number
  y: number
  w: number
  h: number
  kind?: 'social' | 'intimo' | 'servico' | 'externo'
}

export interface FloorPlan {
  label: string
  width: number
  height: number
  rooms: FloorPlanRoom[]
}

export interface Property {
  id: string
  slug: string
  title: string
  tagline: string
  description: string[]
  architecture: string
  type: PropertyType
  purpose: Purpose
  regionId: string
  price: number
  condo: number | null
  iptu: number | null
  area: number
  landArea: number | null
  bedrooms: number
  suites: number
  bathrooms: number
  parking: number
  yearBuilt: number | null
  features: FeatureKey[]
  collections: CollectionId[]
  photos: Photo[]
  featured: boolean
  floorPlans: FloorPlan[]
}

export interface Region {
  id: string
  name: string
  city: string
  state: string
  profile: string
  traits: string[]
  /** coordenadas aproximadas do centro do bairro, usadas apenas para o mapa da região */
  lat: number
  lng: number
  /** posição no mapa esquemático (viewBox 600 x 420) */
  mapX: number
  mapY: number
  cover: string
}

export interface Collection {
  id: CollectionId
  title: string
  summary: string
  description: string
  cover: string
  coverAlt: string
}
