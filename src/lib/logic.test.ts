import { describe, expect, it, vi } from 'vitest'
import { COLLECTIONS } from '../data/catalog'
import { PROPERTIES, PROPERTY_BY_SLUG } from '../data/properties'
import { REGION_BY_ID } from '../data/regions'
import { compareHighlights, priceRanges, similarTo } from './catalog'
import { applyFilters, countActive, DEFAULT_FILTERS, filtersFromParams, filtersToParams, withPurpose, type Filters } from './filters'
import { formatCompactPrice, formatPrice } from './format'
import { slotsFor, upcomingDays } from './schedule'
import { isStringArray, readJSON, writeJSON } from './storage'
import { formatPhone, validateContact, validateEmail, validatePhone } from './validation'

const f = (patch: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...patch })

describe('catálogo demonstrativo', () => {
  it('tem pelo menos 12 imóveis com dados completos e coerentes', () => {
    expect(PROPERTIES.length).toBeGreaterThanOrEqual(12)
    const ids = new Set(PROPERTIES.map((p) => p.id))
    const slugs = new Set(PROPERTIES.map((p) => p.slug))
    expect(ids.size).toBe(PROPERTIES.length)
    expect(slugs.size).toBe(PROPERTIES.length)
    for (const p of PROPERTIES) {
      expect(REGION_BY_ID[p.regionId], p.slug).toBeDefined()
      expect(p.photos.length, p.slug).toBeGreaterThan(1)
      expect(p.photos[0].scope, `${p.slug}: a capa precisa ser foto do imóvel`).toBe('imovel')
      expect(p.suites).toBeLessThanOrEqual(p.bedrooms)
      expect(p.price).toBeGreaterThan(0)
      expect(p.area).toBeGreaterThan(0)
      expect(p.description.length).toBeGreaterThan(0)
      for (const ph of p.photos) expect(ph.alt.length, `${p.slug} alt`).toBeGreaterThan(10)
      for (const c of p.collections) expect(COLLECTIONS.some((col) => col.id === c)).toBe(true)
    }
  })

  it('cada coleção abre pelo menos um imóvel', () => {
    for (const c of COLLECTIONS) expect(PROPERTIES.some((p) => p.collections.includes(c.id))).toBe(true)
  })
})

describe('filtros', () => {
  it('combina finalidade, tipo, quartos e características', () => {
    const r = applyFilters(PROPERTIES, f({ purpose: 'venda', types: ['casa'], bedrooms: 4, features: ['piscina'] }))
    expect(r.length).toBeGreaterThan(0)
    for (const p of r) {
      expect(p.purpose).toBe('venda')
      expect(p.type).toBe('casa')
      expect(p.bedrooms).toBeGreaterThanOrEqual(4)
      expect(p.features).toContain('piscina')
    }
  })

  it('aplica faixa de preço apenas quando a finalidade está definida', () => {
    const venda = applyFilters(PROPERTIES, f({ purpose: 'venda', priceMax: 5_000_000 }))
    expect(venda.every((p) => p.price <= 5_000_000 && p.purpose === 'venda')).toBe(true)
    const todos = applyFilters(PROPERTIES, f({ purpose: 'todos', priceMax: 5_000 }))
    expect(todos.length).toBe(PROPERTIES.length)
  })

  it('busca textual ignora acentos e combina termos', () => {
    expect(applyFilters(PROPERTIES, f({ q: 'falesia' })).map((p) => p.slug)).toEqual(['casa-falesia'])
    expect(applyFilters(PROPERTIES, f({ q: 'campos jordao' })).map((p) => p.slug)).toEqual(['refugio-mantiqueira'])
    expect(applyFilters(PROPERTIES, f({ q: 'inexistente xyz' }))).toHaveLength(0)
  })

  it('ordena por preço e por área', () => {
    const asc = applyFilters(PROPERTIES, f({ purpose: 'venda', sort: 'preco-asc' })).map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const area = applyFilters(PROPERTIES, f({ sort: 'area-desc' })).map((p) => p.area)
    expect(area).toEqual([...area].sort((a, b) => b - a))
  })

  it('sincroniza com a URL em ida e volta', () => {
    const original = f({ q: 'casa', purpose: 'aluguel', regions: ['itaim-bibi', 'vila-madalena'], types: ['loft'], priceMax: 15_000, bedrooms: 1, areaMin: 80, features: ['mobiliado'], sort: 'preco-desc' })
    const parsed = filtersFromParams(new URLSearchParams(filtersToParams(original).toString()))
    expect(parsed).toEqual(original)
  })

  it('descarta parâmetros inválidos da URL', () => {
    const parsed = filtersFromParams(new URLSearchParams('finalidade=xyz&regiao=marte,itaim-bibi&tipo=castelo&quartos=-2&ordem=hack&precoMin=abc'))
    expect(parsed.purpose).toBe('todos')
    expect(parsed.regions).toEqual(['itaim-bibi'])
    expect(parsed.types).toEqual([])
    expect(parsed.bedrooms).toBe(0)
    expect(parsed.sort).toBe('relevancia')
    expect(parsed.priceMin).toBeNull()
  })

  it('troca de finalidade limpa a faixa de preço e conta filtros ativos', () => {
    const next = withPurpose(f({ purpose: 'venda', priceMin: 2_000_000 }), 'aluguel')
    expect(next.priceMin).toBeNull()
    expect(countActive(f({ purpose: 'venda', regions: ['ilhabela'], features: ['piscina', 'jardim'] }))).toBe(4)
  })
})

describe('comparação', () => {
  it('destaca apenas extremos factuais e não destaca preço com finalidades misturadas', () => {
    const a = PROPERTY_BY_SLUG['casa-brise']
    const b = PROPERTY_BY_SLUG['loft-aurora']
    const h = compareHighlights([a, b])
    expect(h.area).toEqual([a.id])
    expect(h.price).toBeUndefined()
    expect(h.ppsm).toBeUndefined()
  })

  it('destaca menor preço quando a finalidade é a mesma', () => {
    const a = PROPERTY_BY_SLUG['casa-jacaranda']
    const b = PROPERTY_BY_SLUG['refugio-mantiqueira']
    expect(compareHighlights([a, b]).price).toEqual([b.id])
  })

  it('imóveis semelhantes nunca incluem o próprio imóvel', () => {
    for (const p of PROPERTIES) {
      const s = similarTo(p)
      expect(s).toHaveLength(3)
      expect(s.some((x) => x.id === p.id)).toBe(false)
    }
  })

  it('faixas de preço por região são calculadas separadamente para venda e aluguel', () => {
    const ranges = priceRanges(PROPERTIES.filter((p) => p.regionId === 'alto-de-pinheiros'))
    expect(ranges.map((r) => r.purpose).sort()).toEqual(['aluguel', 'venda'])
  })
})

describe('formatação e validação', () => {
  it('formata preços em reais', () => {
    expect(formatPrice(14_500, 'aluguel')).toBe('R$ 14.500/mês')
    expect(formatCompactPrice(8_900_000)).toBe('R$ 8,9 mi')
  })

  it('valida e-mail, telefone e consentimento', () => {
    expect(validateEmail('nome@dominio.com.br')).toBeUndefined()
    expect(validateEmail('nome@')).toBeDefined()
    expect(validatePhone('(11) 91234-5678')).toBeUndefined()
    expect(validatePhone('1234')).toBeDefined()
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678')
    const errors = validateContact({ name: 'Al', email: 'x', phone: '', consent: false })
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'name', 'phone'])
  })
})

describe('agenda demonstrativa', () => {
  it('fecha aos domingos e gera horários estáveis', () => {
    const days = upcomingDays(new Date(2026, 10, 19), 14)
    expect(days[0].iso).toBe('2026-11-20')
    expect(days.filter((d) => d.date.getDay() === 0).every((d) => d.closed)).toBe(true)
    expect(slotsFor('AT-101', '2026-11-20')).toEqual(slotsFor('AT-101', '2026-11-20'))
    expect(slotsFor('AT-101', '2026-11-21')).toHaveLength(3) // sábado: só manhã
  })
})

describe('armazenamento local', () => {
  it('ignora JSON inválido e falhas do navegador', () => {
    localStorage.setItem('k', '{quebrado')
    expect(readJSON('k', ['x'], isStringArray)).toEqual(['x'])
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(writeJSON('k', ['a'])).toBe(false)
    spy.mockRestore()
    expect(writeJSON('k', ['a'])).toBe(true)
    expect(readJSON('k', [], isStringArray)).toEqual(['a'])
  })
})
