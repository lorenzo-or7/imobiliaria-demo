import { PROPERTIES } from '../data/properties'
import type { CollectionId, Property, Purpose } from '../data/types'
import { pricePerSquareMeter } from './format'

export function similarTo(p: Property, limit = 3, list: Property[] = PROPERTIES): Property[] {
  return list
    .filter((o) => o.id !== p.id)
    .map((o) => {
      let score = 0
      if (o.purpose === p.purpose) score += 3
      if (o.type === p.type) score += 2
      if (o.regionId === p.regionId) score += 2
      score += o.collections.filter((c) => p.collections.includes(c)).length
      const ratio = Math.min(o.price, p.price) / Math.max(o.price, p.price)
      score += ratio * 2
      return { o, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.o)
}

export function byCollection(id: CollectionId, list: Property[] = PROPERTIES): Property[] {
  return list.filter((p) => p.collections.includes(id))
}

export function byRegion(regionId: string, list: Property[] = PROPERTIES): Property[] {
  return list.filter((p) => p.regionId === regionId)
}

export interface PriceRange {
  purpose: Purpose
  min: number
  max: number
  count: number
}

/** Faixas calculadas apenas sobre o catálogo demonstrativo. */
export function priceRanges(list: Property[]): PriceRange[] {
  const out: PriceRange[] = []
  for (const purpose of ['venda', 'aluguel'] as Purpose[]) {
    const items = list.filter((p) => p.purpose === purpose)
    if (!items.length) continue
    const prices = items.map((p) => p.price)
    out.push({ purpose, min: Math.min(...prices), max: Math.max(...prices), count: items.length })
  }
  return out
}

export type CompareMetric = 'price' | 'area' | 'ppsm' | 'bedrooms' | 'suites' | 'bathrooms' | 'parking'

/**
 * Destaques factuais da comparação (ex.: maior área). Não há nota ou ranking.
 * Preço e preço por m² só são destacados quando todos têm a mesma finalidade.
 */
export function compareHighlights(list: Property[]): Partial<Record<CompareMetric, string[]>> {
  if (list.length < 2) return {}
  const samePurpose = list.every((p) => p.purpose === list[0].purpose)
  const pick = (values: number[], mode: 'min' | 'max') => {
    const target = mode === 'min' ? Math.min(...values) : Math.max(...values)
    const winners = list.filter((_, i) => values[i] === target).map((p) => p.id)
    return winners.length === list.length ? [] : winners
  }
  const out: Partial<Record<CompareMetric, string[]>> = {
    area: pick(list.map((p) => p.area), 'max'),
    bedrooms: pick(list.map((p) => p.bedrooms), 'max'),
    suites: pick(list.map((p) => p.suites), 'max'),
    bathrooms: pick(list.map((p) => p.bathrooms), 'max'),
    parking: pick(list.map((p) => p.parking), 'max'),
  }
  if (samePurpose) {
    out.price = pick(list.map((p) => p.price), 'min')
    out.ppsm = pick(list.map((p) => Math.round(pricePerSquareMeter(p))), 'min')
  }
  return out
}
