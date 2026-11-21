import type { Property, Purpose } from '../data/types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export function formatCurrency(value: number): string {
  return currency.format(value).replace(/ /g, ' ')
}

export function formatPrice(price: number, purpose: Purpose): string {
  return purpose === 'aluguel' ? `${formatCurrency(price)}/mês` : formatCurrency(price)
}

export function formatCompactPrice(value: number): string {
  if (value >= 1_000_000) return `R$ ${decimal.format(value / 1_000_000)} mi`
  if (value >= 1_000) return `R$ ${decimal.format(value / 1_000)} mil`
  return formatCurrency(value)
}

export function formatArea(area: number): string {
  return `${integer.format(area)} m²`
}

export function pricePerSquareMeter(p: Property): number {
  return p.area > 0 ? p.price / p.area : 0
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${integer.format(count)} ${count === 1 ? singular : pluralForm}`
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
