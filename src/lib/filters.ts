import { FEATURE_LABEL, FEATURE_ORDER, TYPE_LABEL, TYPE_ORDER } from '../data/catalog'
import { REGION_BY_ID, REGIONS } from '../data/regions'
import type { FeatureKey, Property, PropertyType, Purpose } from '../data/types'
import { normalizeText } from './format'

export type PurposeFilter = Purpose | 'todos'
export type SortKey = 'relevancia' | 'preco-asc' | 'preco-desc' | 'area-desc' | 'area-asc'

export interface Filters {
  q: string
  purpose: PurposeFilter
  regions: string[]
  types: PropertyType[]
  priceMin: number | null
  priceMax: number | null
  bedrooms: number
  areaMin: number | null
  features: FeatureKey[]
  sort: SortKey
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  purpose: 'todos',
  regions: [],
  types: [],
  priceMin: null,
  priceMax: null,
  bedrooms: 0,
  areaMin: null,
  features: [],
  sort: 'relevancia',
}

export const SORT_LABEL: Record<SortKey, string> = {
  relevancia: 'Curadoria',
  'preco-asc': 'Menor preço',
  'preco-desc': 'Maior preço',
  'area-desc': 'Maior área',
  'area-asc': 'Menor área',
}

export const PRICE_STEPS: Record<Purpose, number[]> = {
  venda: [2_000_000, 3_000_000, 5_000_000, 8_000_000, 12_000_000],
  aluguel: [8_000, 15_000, 25_000, 35_000, 50_000],
}

export const AREA_STEPS = [80, 150, 250, 350, 500]
export const BEDROOM_STEPS = [1, 2, 3, 4]

export function hasPriceFilter(f: Filters): boolean {
  return f.purpose !== 'todos' && (f.priceMin !== null || f.priceMax !== null)
}

function searchable(p: Property): string {
  const region = REGION_BY_ID[p.regionId]
  return normalizeText(
    [p.title, p.tagline, p.id, region?.name ?? '', region?.city ?? '', TYPE_LABEL[p.type], ...p.features.map((f) => FEATURE_LABEL[f])].join(' '),
  )
}

export function matches(p: Property, f: Filters): boolean {
  if (f.purpose !== 'todos' && p.purpose !== f.purpose) return false
  if (f.regions.length > 0 && !f.regions.includes(p.regionId)) return false
  if (f.types.length > 0 && !f.types.includes(p.type)) return false
  if (f.purpose !== 'todos') {
    if (f.priceMin !== null && p.price < f.priceMin) return false
    if (f.priceMax !== null && p.price > f.priceMax) return false
  }
  if (f.bedrooms > 0 && p.bedrooms < f.bedrooms) return false
  if (f.areaMin !== null && p.area < f.areaMin) return false
  if (f.features.length > 0 && !f.features.every((feat) => p.features.includes(feat))) return false
  const q = normalizeText(f.q)
  if (q) {
    const haystack = searchable(p)
    if (!q.split(/\s+/).every((term) => haystack.includes(term))) return false
  }
  return true
}

export function applyFilters(list: Property[], f: Filters): Property[] {
  const result = list.filter((p) => matches(p, f))
  const indexOf = new Map(list.map((p, i) => [p.id, i]))
  const byCuration = (a: Property, b: Property) =>
    Number(b.featured) - Number(a.featured) || (indexOf.get(a.id) ?? 0) - (indexOf.get(b.id) ?? 0)
  switch (f.sort) {
    case 'preco-asc':
      return result.sort((a, b) => a.price - b.price)
    case 'preco-desc':
      return result.sort((a, b) => b.price - a.price)
    case 'area-desc':
      return result.sort((a, b) => b.area - a.area)
    case 'area-asc':
      return result.sort((a, b) => a.area - b.area)
    default:
      return result.sort(byCuration)
  }
}

/** Quantidade de filtros ativos (busca e ordenação não contam). */
export function countActive(f: Filters): number {
  return (
    (f.purpose !== 'todos' ? 1 : 0) +
    f.regions.length +
    f.types.length +
    (hasPriceFilter(f) ? 1 : 0) +
    (f.bedrooms > 0 ? 1 : 0) +
    (f.areaMin !== null ? 1 : 0) +
    f.features.length
  )
}

const SORT_KEYS = Object.keys(SORT_LABEL) as SortKey[]
const REGION_IDS = new Set(REGIONS.map((r) => r.id))

function parseList<T extends string>(value: string | null, allowed: (v: string) => v is T): T[] {
  if (!value) return []
  return Array.from(new Set(value.split(',').map((v) => v.trim()).filter(allowed)))
}

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

const isType = (v: string): v is PropertyType => (TYPE_ORDER as string[]).includes(v)
const isFeature = (v: string): v is FeatureKey => (FEATURE_ORDER as string[]).includes(v)
const isRegion = (v: string): v is string => REGION_IDS.has(v)

export function filtersFromParams(params: URLSearchParams): Filters {
  const purposeRaw = params.get('finalidade')
  const purpose: PurposeFilter = purposeRaw === 'venda' || purposeRaw === 'aluguel' ? purposeRaw : 'todos'
  const sortRaw = params.get('ordem')
  const bedrooms = parseNumber(params.get('quartos'))
  let priceMin = purpose === 'todos' ? null : parseNumber(params.get('precoMin'))
  let priceMax = purpose === 'todos' ? null : parseNumber(params.get('precoMax'))
  if (priceMin !== null && priceMax !== null && priceMin > priceMax) [priceMin, priceMax] = [priceMax, priceMin]
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    purpose,
    regions: parseList(params.get('regiao'), isRegion),
    types: parseList(params.get('tipo'), isType),
    priceMin,
    priceMax,
    bedrooms: bedrooms !== null && bedrooms <= 10 ? bedrooms : 0,
    areaMin: parseNumber(params.get('areaMin')),
    features: parseList(params.get('caracteristicas'), isFeature),
    sort: SORT_KEYS.includes(sortRaw as SortKey) ? (sortRaw as SortKey) : 'relevancia',
  }
}

export function filtersToParams(f: Filters): URLSearchParams {
  const params = new URLSearchParams()
  if (f.q.trim()) params.set('q', f.q.trim())
  if (f.purpose !== 'todos') params.set('finalidade', f.purpose)
  if (f.regions.length) params.set('regiao', f.regions.join(','))
  if (f.types.length) params.set('tipo', f.types.join(','))
  if (f.purpose !== 'todos' && f.priceMin !== null) params.set('precoMin', String(f.priceMin))
  if (f.purpose !== 'todos' && f.priceMax !== null) params.set('precoMax', String(f.priceMax))
  if (f.bedrooms > 0) params.set('quartos', String(f.bedrooms))
  if (f.areaMin !== null) params.set('areaMin', String(f.areaMin))
  if (f.features.length) params.set('caracteristicas', f.features.join(','))
  if (f.sort !== 'relevancia') params.set('ordem', f.sort)
  return params
}

export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

/** Ao trocar a finalidade, faixas de preço deixam de fazer sentido e são limpas. */
export function withPurpose(f: Filters, purpose: PurposeFilter): Filters {
  if (f.purpose === purpose) return f
  return { ...f, purpose, priceMin: null, priceMax: null }
}

export const LAST_SEARCH_KEY = 'atelier:last-search'
