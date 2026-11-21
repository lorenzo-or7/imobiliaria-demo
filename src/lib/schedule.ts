/**
 * Horários DEMONSTRATIVOS gerados localmente. Não refletem agenda real.
 * A geração é determinística por imóvel e data para que a interface
 * se comporte de forma estável entre recarregamentos.
 */
export const BASE_SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

export interface DayOption {
  iso: string
  date: Date
  closed: boolean
}

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Próximos `count` dias a partir de amanhã. Domingos ficam fechados. */
export function upcomingDays(from: Date, count = 21): DayOption[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1)
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toISODate(date), date, closed: date.getDay() === 0 }
  })
}

export function slotsFor(propertyId: string, iso: string): { time: string; available: boolean }[] {
  const date = parseISODate(iso)
  const saturday = date.getDay() === 6
  const base = saturday ? BASE_SLOTS.slice(0, 3) : BASE_SLOTS
  return base.map((time) => ({ time, available: hash(`${propertyId}|${iso}|${time}`) % 3 !== 0 }))
}

const longDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const weekdayShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

export function formatLongDate(iso: string): string {
  return longDate.format(parseISODate(iso))
}

export function formatWeekday(date: Date): string {
  return weekdayShort.format(date).replace('.', '')
}

export function formatMonth(date: Date): string {
  return monthShort.format(date).replace('.', '')
}
