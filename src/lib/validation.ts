export interface ContactFields {
  name: string
  email: string
  phone: string
  consent: boolean
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function sanitizeText(value: string, max = 600): string {
  // Remove caracteres de controle; o React já escapa o conteúdo na renderização.
  // eslint-disable-next-line no-control-regex -- remover caracteres de controle é o objetivo
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max)
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function validateName(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Informe seu nome.'
  if (v.length < 3) return 'O nome precisa ter pelo menos 3 letras.'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Informe seu e-mail.'
  if (!EMAIL_RE.test(v)) return 'Confira o e-mail. Exemplo: nome@dominio.com.br'
  return undefined
}

export function validatePhone(value: string, required = true): string | undefined {
  const d = digitsOnly(value)
  if (!d) return required ? 'Informe um telefone com DDD.' : undefined
  if (d.length < 10 || d.length > 11) return 'O telefone precisa ter DDD e 8 ou 9 dígitos.'
  return undefined
}

export function validateContact(fields: ContactFields, phoneRequired = true): FieldErrors<ContactFields> {
  const errors: FieldErrors<ContactFields> = {}
  const name = validateName(fields.name)
  const email = validateEmail(fields.email)
  const phone = validatePhone(fields.phone, phoneRequired)
  if (name) errors.name = name
  if (email) errors.email = email
  if (phone) errors.phone = phone
  if (!fields.consent) errors.consent = 'Para continuar, confirme que leu o aviso de privacidade.'
  return errors
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean)
}
